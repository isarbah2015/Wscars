/**
 * Westcars Cloud Functions
 * ─────────────────────────────────────────────────────────────────
 *  1. sendMessageNotification — push FCM on new chat messages
 *  2. processCarImages        — sanitise newly-uploaded car photos
 *  3. calculateCarRating      — recompute aggregate rating on review create
 *  4. sendVerificationEmail   — fire welcome email when a user doc is created
 *  5. reportContent           — auto-hide listings @ 3 reports
 *  6. expireListings          — daily sweep that hides expired listings
 *  7. initializeBoostPayment  — create pending Paystack boost payment (callable)
 *  8. verifyBoostPayment      — verify Paystack txn + activate boost (callable)
 *  9. paystackWebhook         — Paystack charge.success webhook (HTTP)
 * 10. savedSearchAlerts       — notify users when a new listing matches a saved search
 * 11. notifyListingExpiry     — daily seller reminders before listings expire
 *
 * Deploy:
 *   cd firebase
 *   firebase login
 *   firebase use --add               # pick your project
 *   firebase deploy --only functions
 */

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { onDocumentCreated, onDocumentWritten } =
  require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { logger } = require("firebase-functions/v2");
const {
  verifyWebhookSignature,
  verifyTransactionWithPaystack,
  fulfillBoostPayment,
  createPendingBoostPayment,
} = require("./paystackBoost");
const { carMatchesSavedSearch } = require("./savedSearchMatch");
const { notifyListingExpiryReminders } = require("./listingExpiry");
const {
  createBoostInitializeHandler,
  createBoostVerifyHandler,
} = require("./boostPaymentHttp");

const paystackSecret = defineSecret("PAYSTACK_SECRET_KEY");

admin.initializeApp();
/** Default Firestore (legacy triggers). Boost payments use named DB below. */
const db = admin.firestore();
const WESTCAR_DB_ID = "westcar-5c1e6";
const westcarDb = () => getFirestore(WESTCAR_DB_ID);

/* ═════════════════════════════════════════════════════════════════
 * 1. sendMessageNotification
 *    Trigger: a new message lands in any conversation.
 *    Effect:  bumps conversation.unreadCount + sends FCM to recipient(s).
 * ═══════════════════════════════════════════════════════════════ */
exports.sendMessageNotification = onDocumentCreated(
  "conversations/{convId}/messages/{msgId}",
  async (event) => {
    const msg = event.data?.data();
    if (!msg) return;

    const { convId } = event.params;
    const convRef = db.doc(`conversations/${convId}`);
    const convSnap = await convRef.get();
    if (!convSnap.exists) return;
    const conv = convSnap.data();

    const recipientIds = (conv.participantIds || []).filter((id) => id !== msg.senderId);

    // Bump unread count atomically.
    await convRef.update({
      unreadCount: admin.firestore.FieldValue.increment(recipientIds.length),
      lastMessage: msg.text || "📷 Photo",
      lastMessageTime: msg.timestamp || admin.firestore.FieldValue.serverTimestamp(),
    });

    // Look up recipient FCM tokens.
    const tokens = [];
    for (const uid of recipientIds) {
      const userSnap = await db.doc(`users/${uid}`).get();
      const data = userSnap.data();
      if (data?.fcmTokens) tokens.push(...data.fcmTokens);
    }
    if (!tokens.length) return;

    try {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: msg.senderName || "New message",
          body:  (msg.text || "📷 Photo").slice(0, 120),
        },
        data: { conversationId: convId },
      });
    } catch (err) {
      logger.warn("FCM send failed:", err);
    }
  },
);

/* ═════════════════════════════════════════════════════════════════
 * 2. processCarImages
 *    Trigger: car doc is created or updated.
 *    Effect:  validates image URLs (drops anything that isn't HTTPS).
 *
 *    For full image-resize pipelines (sharp, etc.) hook into a Storage
 *    onObjectFinalized trigger — kept minimal here to avoid heavy deps.
 * ═══════════════════════════════════════════════════════════════ */
exports.processCarImages = onDocumentWritten("cars/{carId}", async (event) => {
  const after = event.data?.after?.data();
  if (!after) return;
  const before = event.data?.before?.data();

  const beforeImgs = JSON.stringify(before?.images || []);
  const afterImgs  = JSON.stringify(after?.images || []);
  if (beforeImgs === afterImgs) return; // nothing to do

  const safe = (after.images || []).filter(
    (u) => typeof u === "string" && /^https?:\/\//i.test(u),
  );
  if (safe.length !== (after.images || []).length) {
    await event.data.after.ref.update({ images: safe });
    logger.info(`processCarImages: dropped ${(after.images||[]).length - safe.length} bad URLs on car ${event.params.carId}`);
  }
});

/* ═════════════════════════════════════════════════════════════════
 * 3. calculateCarRating
 *    Trigger: a review is created.
 *    Effect:  recomputes the aggregate rating on the related car (and the
 *             total reviews / avg rating on the recipient user).
 * ═══════════════════════════════════════════════════════════════ */
exports.calculateCarRating = onDocumentCreated("reviews/{reviewId}", async (event) => {
  const review = event.data?.data();
  if (!review) return;
  const { carId, toUserId } = review;

  // Refresh user-level aggregate.
  if (toUserId) {
    const userReviews = await db.collection("reviews").where("toUserId", "==", toUserId).get();
    const total = userReviews.size;
    const avg   = total
      ? userReviews.docs.reduce((acc, d) => acc + (d.data().rating || 0), 0) / total
      : 0;
    await db.doc(`users/${toUserId}`).set(
      { totalReviews: total, rating: Math.round(avg * 10) / 10 },
      { merge: true },
    );
  }

  // Refresh car-level overall rating.
  if (carId) {
    const carReviews = await db.collection("reviews").where("carId", "==", carId).get();
    const total = carReviews.size;
    const avg   = total
      ? carReviews.docs.reduce((acc, d) => acc + (d.data().rating || 0), 0) / total
      : 0;
    await db.doc(`cars/${carId}`).set(
      { rating: { overall: Math.round(avg * 10) / 10, totalRatings: total } },
      { merge: true },
    );
  }
});

/* ═════════════════════════════════════════════════════════════════
 * 4. sendVerificationEmail
 *    Trigger: a new user doc is created.
 *    Effect:  generates the email-verification link and stamps a flag.
 *
 *    Full-blown SMTP delivery: pipe `link` to SendGrid / Mailgun /
 *    Brevo from here, or hand off to the Trigger Email extension.
 * ═══════════════════════════════════════════════════════════════ */
exports.sendVerificationEmail = onDocumentCreated("users/{uid}", async (event) => {
  const user = event.data?.data();
  if (!user?.email) return;

  try {
    const link = await admin.auth().generateEmailVerificationLink(user.email);
    logger.info(`Verification link for ${user.email}: ${link}`);
    await event.data.ref.set({ verificationEmailSent: true }, { merge: true });
    // TODO: email `link` via your SMTP / SendGrid / Brevo provider.
  } catch (err) {
    logger.warn("sendVerificationEmail failed:", err);
  }
});

/* ═════════════════════════════════════════════════════════════════
 * 5. reportContent
 *    Trigger: a new report is filed.
 *    Effect:  bumps reportCount on the target listing; auto-hides @ 3.
 * ═══════════════════════════════════════════════════════════════ */
exports.reportContent = onDocumentCreated("reports/{reportId}", async (event) => {
  const r = event.data?.data();
  if (!r || r.targetType !== "listing" || !r.targetId) return;

  const carRef = db.doc(`cars/${r.targetId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(carRef);
    if (!snap.exists) return;
    const next = (snap.data().reportCount || 0) + 1;
    tx.update(carRef, { reportCount: next, isHidden: next >= 3 });
  });
  logger.info(`reportContent: report applied to car ${r.targetId}`);
});

/* ═════════════════════════════════════════════════════════════════
 * 6. expireListings
 *    Schedule: every day at 03:00 UTC.
 *    Effect:   marks listings where expiresAt < today as hidden.
 * ═══════════════════════════════════════════════════════════════ */
exports.expireListings = onSchedule(
  { schedule: "0 3 * * *", timeZone: "Etc/UTC" },
  async () => {
    const today = new Date().toISOString().split("T")[0];
    const expired = await db.collection("cars")
      .where("expiresAt", "<", today)
      .where("isHidden", "==", false)
      .get();

    if (expired.empty) {
      logger.info("expireListings: nothing to expire today.");
      return;
    }

    const batch = db.batch();
    for (const d of expired.docs) {
      batch.update(d.ref, { isHidden: true, isExpired: true });
      const car = d.data();
      if (car.sellerId && !car.isSold) {
        const ref = db.collection("notifications").doc();
        batch.set(ref, {
          userId: car.sellerId,
          type: "listing_expiry",
          expiryKind: "expired_auto",
          title: "Listing expired",
          body: `Your ${car.year} ${car.brand} ${car.model} is now hidden. Renew in Profile → Listings.`,
          carId: d.id,
          carName: `${car.brand} ${car.model}`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
    await batch.commit();
    logger.info(`expireListings: hid ${expired.size} expired listings.`);
  },
);

/* ═════════════════════════════════════════════════════════════════
 * 10. savedSearchAlerts
 *    Trigger: new car listing created.
 * ═══════════════════════════════════════════════════════════════ */
exports.savedSearchAlerts = onDocumentCreated("cars/{carId}", async (event) => {
  const car = event.data?.data();
  if (!car || car.isHidden) return;

  const carId = event.params.carId;
  const searchesSnap = await db.collection("savedSearches").where("enabled", "==", true).get();
  if (searchesSnap.empty) return;

  let sent = 0;
  for (const searchDoc of searchesSnap.docs) {
    const search = { id: searchDoc.id, ...searchDoc.data() };
    if (!carMatchesSavedSearch(car, search)) continue;

    const carName = `${car.year} ${car.brand} ${car.model}`;
    await db.collection("notifications").add({
      userId: search.userId,
      type: "saved_search_match",
      title: "New listing matches your search",
      body: `${carName} — ${car.condition} · GHS ${(car.price || 0).toLocaleString()}`,
      carId,
      carName,
      savedSearchId: search.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
    await searchDoc.ref.set({ lastNotifiedAt: new Date().toISOString() }, { merge: true });
    sent += 1;
  }
  if (sent) logger.info(`savedSearchAlerts: ${sent} alerts for car ${carId}`);
});

/* ═════════════════════════════════════════════════════════════════
 * 11. notifyListingExpiry — 09:00 Ghana time daily
 * ═══════════════════════════════════════════════════════════════ */
exports.notifyListingExpiry = onSchedule(
  { schedule: "0 9 * * *", timeZone: "Africa/Accra" },
  async () => {
    await notifyListingExpiryReminders(db, logger);
  },
);

/* ═════════════════════════════════════════════════════════════════
 * 7–9. Paystack boost payments (server-verified)
 *    Set secret: firebase functions:secrets:set PAYSTACK_SECRET_KEY
 *    Webhook URL (after deploy):
 *      https://<region>-westcar-5c1e6.cloudfunctions.net/paystackWebhook
 *    Register in Paystack Dashboard → Settings → API Keys & Webhooks
 * ═══════════════════════════════════════════════════════════════ */

/** Gen 2 callables: invoker public + Bearer header / authToken in body (RN SDK may omit request.auth). */
async function resolveCallableUser(request) {
  if (request.auth?.uid) {
    return { uid: request.auth.uid, email: request.auth.token?.email || null };
  }
  const rawAuth =
    request.rawRequest?.get?.("authorization") ||
    request.rawRequest?.headers?.authorization ||
    "";
  let token = null;
  if (typeof rawAuth === "string" && rawAuth.startsWith("Bearer ")) {
    token = rawAuth.slice(7).trim();
  }
  if (!token) {
    token = request.data?.authToken || request.data?.idToken || null;
  }
  if (!token || typeof token !== "string") return null;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || null };
  } catch (err) {
    logger.warn("resolveCallableUser: invalid token", err?.message || err);
    return null;
  }
}

exports.initializeBoostPayment = onCall(
  { secrets: [paystackSecret], invoker: "public" },
  async (request) => {
    const caller = await resolveCallableUser(request);
    if (!caller) {
      throw new HttpsError("unauthenticated", "Sign in to purchase a boost.");
    }
    const { planId, carId, email, callbackUrl } = request.data || {};
    if (!planId) {
      throw new HttpsError("invalid-argument", "planId is required.");
    }
    try {
      return await createPendingBoostPayment({
        userId: caller.uid,
        planId,
        carId: carId || null,
        email: email || caller.email || null,
        callbackUrl: callbackUrl || null,
        paystackSecret: paystackSecret.value(),
      });
    } catch (err) {
      logger.warn("initializeBoostPayment:", err);
      throw new HttpsError("failed-precondition", err.message || "Could not start payment.");
    }
  },
);

exports.verifyBoostPayment = onCall(
  { secrets: [paystackSecret], invoker: "public" },
  async (request) => {
    const { reference, verificationSecret } = request.data || {};
    if (!reference) {
      throw new HttpsError("invalid-argument", "reference is required.");
    }

    const paymentSnap = await westcarDb().doc(`boostPayments/${reference}`).get();
    if (!paymentSnap.exists) {
      throw new HttpsError("not-found", "Payment not found.");
    }
    const payment = paymentSnap.data();

    let ownerId = request.auth?.uid || null;
    if (!ownerId && verificationSecret) {
      if (payment.verificationSecret && payment.verificationSecret === verificationSecret) {
        ownerId = payment.userId;
      } else {
        throw new HttpsError("permission-denied", "Invalid payment verification.");
      }
    }
    if (!ownerId) {
      throw new HttpsError("unauthenticated", "Could not verify this payment.");
    }
    if (payment.userId !== ownerId) {
      throw new HttpsError("permission-denied", "Not your payment.");
    }
    if (payment.status === "completed") {
      return { ok: true, status: "completed", expiresAt: payment.expiresAt };
    }

    let paystackData;
    try {
      paystackData = await verifyTransactionWithPaystack(paystackSecret.value(), reference);
    } catch (err) {
      logger.warn("verifyBoostPayment:", err);
      throw new HttpsError(
        "aborted",
        "Payment not verified yet. If you were charged, wait a moment and tap Verify again.",
      );
    }

    if (paystackData.status !== "success") {
      throw new HttpsError("failed-precondition", "Payment was not successful.");
    }

    const result = await fulfillBoostPayment(reference, paystackData);
    if (!result.ok) {
      throw new HttpsError("failed-precondition", result.reason || "Could not activate boost.");
    }
    return { ok: true, status: "completed", expiresAt: result.expiresAt };
  },
);

/** HTTP boost APIs — reliable auth via Authorization Bearer on React Native. */
exports.boostPaymentInitialize = onRequest(
  { secrets: [paystackSecret], cors: false, invoker: "public" },
  createBoostInitializeHandler(paystackSecret),
);

exports.boostPaymentVerify = onRequest(
  { secrets: [paystackSecret], cors: false, invoker: "public" },
  createBoostVerifyHandler(paystackSecret),
);

exports.paystackWebhook = onRequest(
  { secrets: [paystackSecret], cors: false },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const signature = req.get("x-paystack-signature");
    const rawBody = req.rawBody;
    if (!verifyWebhookSignature(paystackSecret.value(), rawBody, signature)) {
      logger.warn("paystackWebhook: invalid signature");
      res.status(401).send("Invalid signature");
      return;
    }

    const event = req.body;
    try {
      if (event?.event === "charge.success" && event.data?.reference) {
        await fulfillBoostPayment(event.data.reference, event.data);
      }
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error("paystackWebhook:", err);
      res.status(500).json({ received: false });
    }
  },
);
