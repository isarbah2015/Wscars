const admin = require("firebase-admin");
const { logger } = require("firebase-functions/v2");
const {
  verifyTransactionWithPaystack,
  fulfillBoostPayment,
  createPendingBoostPayment,
} = require("./paystackBoost");
const { getFirestore } = require("firebase-admin/firestore");

const westcarDb = () => getFirestore("westcar-5c1e6");

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function parseBearer(req) {
  const header = req.get("Authorization") || req.get("authorization") || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

async function verifyBearerUser(req) {
  const token = parseBearer(req);
  if (!token) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || null };
  } catch (err) {
    logger.warn("boostPaymentHttp: invalid bearer token", err?.message || err);
    return null;
  }
}

function sendCallableStyleError(res, status, message, code = "UNAUTHENTICATED") {
  res.status(status).json({
    error: { message, status: code },
  });
}

/**
 * HTTP boost initialize — React Native sends Authorization: Bearer <Firebase ID token>.
 */
function createBoostInitializeHandler(paystackSecret) {
  return async (req, res) => {
    setCors(res);
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const caller = await verifyBearerUser(req);
    if (!caller) {
      sendCallableStyleError(res, 401, "Sign in to purchase a boost.");
      return;
    }

    const body = req.body?.data ?? req.body ?? {};
    const { planId, carId, email, callbackUrl } = body;
    if (!planId) {
      sendCallableStyleError(res, 400, "planId is required.", "INVALID_ARGUMENT");
      return;
    }

    try {
      const result = await createPendingBoostPayment({
        userId: caller.uid,
        planId,
        carId: carId || null,
        email: email || caller.email || null,
        callbackUrl: callbackUrl || null,
        paystackSecret: paystackSecret.value(),
      });
      res.status(200).json(result);
    } catch (err) {
      logger.warn("boostPaymentInitialize:", err);
      sendCallableStyleError(
        res,
        400,
        err.message || "Could not start payment.",
        "FAILED_PRECONDITION",
      );
    }
  };
}

/**
 * HTTP boost verify — uses payment verificationSecret (no Firebase auth after Paystack).
 */
function createBoostVerifyHandler(paystackSecret) {
  return async (req, res) => {
    setCors(res);
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const body = req.body?.data ?? req.body ?? {};
    const { reference, verificationSecret } = body;
    if (!reference) {
      sendCallableStyleError(res, 400, "reference is required.", "INVALID_ARGUMENT");
      return;
    }

    const paymentSnap = await westcarDb().doc(`boostPayments/${reference}`).get();
    if (!paymentSnap.exists) {
      sendCallableStyleError(res, 404, "Payment not found.", "NOT_FOUND");
      return;
    }
    const payment = paymentSnap.data();

    if (!verificationSecret || payment.verificationSecret !== verificationSecret) {
      sendCallableStyleError(res, 403, "Invalid payment verification.", "PERMISSION_DENIED");
      return;
    }

    if (payment.status === "completed") {
      res.status(200).json({ ok: true, status: "completed", expiresAt: payment.expiresAt });
      return;
    }

    let paystackData;
    try {
      paystackData = await verifyTransactionWithPaystack(paystackSecret.value(), reference);
    } catch (err) {
      logger.warn("boostPaymentVerify:", err);
      sendCallableStyleError(
        res,
        409,
        "Payment not verified yet. If you were charged, wait a moment and try again.",
        "ABORTED",
      );
      return;
    }

    if (paystackData.status !== "success") {
      sendCallableStyleError(res, 400, "Payment was not successful.", "FAILED_PRECONDITION");
      return;
    }

    const result = await fulfillBoostPayment(reference, paystackData);
    if (!result.ok) {
      sendCallableStyleError(
        res,
        400,
        result.reason || "Could not activate boost.",
        "FAILED_PRECONDITION",
      );
      return;
    }

    res.status(200).json({ ok: true, status: "completed", expiresAt: result.expiresAt });
  };
}

module.exports = {
  createBoostInitializeHandler,
  createBoostVerifyHandler,
};
