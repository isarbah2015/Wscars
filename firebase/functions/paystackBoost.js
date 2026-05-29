const crypto = require("crypto");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions/v2");
const { getBoostPlan } = require("./boostPlans");

const FIRESTORE_DATABASE_ID = "westcar-5c1e6";
const db = () => getFirestore(FIRESTORE_DATABASE_ID);

/**
 * Verify Paystack webhook HMAC (SHA-512) against raw request body.
 */
function verifyWebhookSignature(secret, rawBody, signatureHeader) {
  if (!secret || !signatureHeader || !rawBody) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signatureHeader;
}

const PAYSTACK_MERCHANT_NAME = "Westcars";
const DEFAULT_CALLBACK_URL = "westcars://paystack/callback";

/**
 * Initialize hosted checkout — secret stays on server only.
 * https://paystack.com/docs/api/transaction/#initialize
 */
async function initializePaystackTransaction(
  secret,
  { email, amount, reference, callbackUrl, metadata },
) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      currency: "GHS",
      reference,
      callback_url: callbackUrl || DEFAULT_CALLBACK_URL,
      metadata,
      channels: ["card", "mobile_money", "bank"],
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack initialize failed");
  }
  return json.data;
}

/**
 * Verify transaction with Paystack REST API (server-side).
 */
async function verifyTransactionWithPaystack(secret, reference) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack verify failed");
  }
  return json.data;
}

/**
 * Activate boost after verified payment (idempotent).
 */
async function fulfillBoostPayment(reference, paystackData = {}) {
  const paymentRef = db().doc(`boostPayments/${reference}`);
  const paymentSnap = await paymentRef.get();
  if (!paymentSnap.exists) {
    logger.warn("fulfillBoostPayment: unknown reference", reference);
    return { ok: false, reason: "unknown_reference" };
  }

  const payment = paymentSnap.data();
  if (payment.status === "completed") {
    return { ok: true, reason: "already_completed" };
  }

  const plan = getBoostPlan(payment.planId);
  if (!plan) {
    await paymentRef.set(
      { status: "failed", failureReason: "invalid_plan", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true },
    );
    return { ok: false, reason: "invalid_plan" };
  }

  const expectedAmount = plan.amount;
  const paidAmount = paystackData.amount ?? payment.amount;
  if (typeof paidAmount === "number" && paidAmount < expectedAmount) {
    await paymentRef.set(
      {
        status: "failed",
        failureReason: "amount_mismatch",
        paidAmount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { ok: false, reason: "amount_mismatch" };
  }

  if (paystackData.currency && paystackData.currency !== "GHS") {
    await paymentRef.set(
      { status: "failed", failureReason: "invalid_currency", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true },
    );
    return { ok: false, reason: "invalid_currency" };
  }

  const expiresAt = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString();
  const batch = db().batch();

  batch.set(
    paymentRef,
    {
      status: "completed",
      paystackReference: paystackData.reference || reference,
      paystackTransactionId: paystackData.id || null,
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  if (payment.carId) {
    const carRef = db().doc(`cars/${payment.carId}`);
    const carSnap = await carRef.get();
    if (carSnap.exists && carSnap.data().sellerId === payment.userId) {
      batch.set(
        carRef,
        {
          isSponsored: true,
          sponsoredUntil: expiresAt,
          boostPlan: plan.id,
          boostedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    } else {
      logger.warn("fulfillBoostPayment: car missing or not owned", payment.carId);
    }
  }

  const userRef = db().doc(`users/${payment.userId}`);
  batch.set(
    userRef,
    {
      sponsorship: {
        tier: plan.isSubscription ? "Premium Seller" : "Boosted Seller",
        adCredits: plan.days,
        activePlan: plan.id,
        expiresAt,
      },
    },
    { merge: true },
  );

  await batch.commit();
  logger.info("fulfillBoostPayment: completed", reference, payment.userId);
  return { ok: true, reason: "completed", expiresAt };
}

/**
 * Create pending payment + Paystack hosted checkout URL (authorization_url).
 */
async function createPendingBoostPayment({
  userId,
  planId,
  carId,
  email,
  callbackUrl,
  paystackSecret,
}) {
  const plan = getBoostPlan(planId);
  if (!plan) {
    throw new Error("Invalid boost plan");
  }

  if (!paystackSecret) {
    throw new Error("Paystack is not configured on the server");
  }

  if (carId) {
    const carSnap = await db().doc(`cars/${carId}`).get();
    if (!carSnap.exists) throw new Error("Listing not found");
    if (carSnap.data().sellerId !== userId) throw new Error("You can only boost your own listing");
  }

  const customerEmail = (email || "").trim() || `buyer_${userId.slice(0, 8)}@westcars.app`;
  const reference = `westcars_${userId.slice(0, 8)}_${Date.now()}`;

  const metadata = {
    userId,
    planId: plan.id,
    carId: carId || null,
    custom_fields: [
      { display_name: "Merchant", variable_name: "merchant", value: PAYSTACK_MERCHANT_NAME },
      { display_name: "Plan", variable_name: "plan", value: plan.name },
      ...(carId ? [{ display_name: "Listing", variable_name: "car_id", value: carId }] : []),
    ],
  };

  const paystack = await initializePaystackTransaction(paystackSecret, {
    email: customerEmail,
    amount: plan.amount,
    reference,
    callbackUrl: callbackUrl || DEFAULT_CALLBACK_URL,
    metadata,
  });

  await db().doc(`boostPayments/${reference}`).set({
    reference,
    userId,
    carId: carId || null,
    planId: plan.id,
    planName: plan.name,
    amount: plan.amount,
    days: plan.days,
    email: customerEmail,
    status: "pending",
    authorizationUrl: paystack.authorization_url,
    accessCode: paystack.access_code || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    reference,
    authorizationUrl: paystack.authorization_url,
    accessCode: paystack.access_code || null,
    amountPesewas: plan.amount,
    amountGHS: plan.amount / 100,
    planName: plan.name,
    days: plan.days,
  };
}

module.exports = {
  verifyWebhookSignature,
  initializePaystackTransaction,
  verifyTransactionWithPaystack,
  fulfillBoostPayment,
  createPendingBoostPayment,
};
