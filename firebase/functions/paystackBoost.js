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
 * Create a pending payment record before opening Paystack checkout.
 */
async function createPendingBoostPayment({ userId, planId, carId, email }) {
  const plan = getBoostPlan(planId);
  if (!plan) {
    throw new Error("Invalid boost plan");
  }

  if (carId) {
    const carSnap = await db().doc(`cars/${carId}`).get();
    if (!carSnap.exists) throw new Error("Listing not found");
    if (carSnap.data().sellerId !== userId) throw new Error("You can only boost your own listing");
  }

  const reference = `westcars_${Date.now()}_${userId.slice(0, 8)}`;
  await db().doc(`boostPayments/${reference}`).set({
    reference,
    userId,
    carId: carId || null,
    planId: plan.id,
    planName: plan.name,
    amount: plan.amount,
    days: plan.days,
    email: email || null,
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    reference,
    amountPesewas: plan.amount,
    amountGHS: plan.amount / 100,
    planName: plan.name,
    days: plan.days,
  };
}

module.exports = {
  verifyWebhookSignature,
  verifyTransactionWithPaystack,
  fulfillBoostPayment,
  createPendingBoostPayment,
};
