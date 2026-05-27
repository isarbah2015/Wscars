/**
 * Listing expiry notifications for sellers (7 / 3 / 1 days before + on expiry day).
 */

function isoDatePlusDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

async function notificationAlreadySent(db, userId, carId, kind) {
  const snap = await db
    .collection("notifications")
    .where("userId", "==", userId)
    .where("carId", "==", carId)
    .where("type", "==", "listing_expiry")
    .limit(20)
    .get();

  return snap.docs.some((d) => d.data().expiryKind === kind);
}

async function createExpiryNotification(db, { userId, carId, car, daysLeft }) {
  const kind = daysLeft === 0 ? "expired" : `d${daysLeft}`;
  const exists = await notificationAlreadySent(db, userId, carId, kind);
  if (exists) return false;

  const title =
    daysLeft === 0
      ? "Listing expired"
      : daysLeft === 1
        ? "Listing expires tomorrow"
        : `Listing expires in ${daysLeft} days`;

  const body =
    daysLeft === 0
      ? `Your ${car.year} ${car.brand} ${car.model} was hidden. Renew for 30 more days in Profile → Listings.`
      : `Renew your ${car.year} ${car.brand} ${car.model} before it is hidden from buyers.`;

  await db.collection("notifications").add({
    userId,
    type: "listing_expiry",
    expiryKind: kind,
    title,
    body,
    carId,
    carName: `${car.brand} ${car.model}`,
    read: false,
    createdAt: new Date().toISOString(),
  });
  return true;
}

async function notifyListingExpiryReminders(db, logger) {
  const today = new Date();
  let sent = 0;

  for (const daysLeft of [7, 3, 1, 0]) {
    const target = isoDatePlusDays(today, daysLeft);
    const snap = await db
      .collection("cars")
      .where("expiresAt", "==", target)
      .where("isHidden", "==", false)
      .get();

    for (const docSnap of snap.docs) {
      const car = docSnap.data();
      if (car.isSold) continue;
      const sellerId = car.sellerId;
      if (!sellerId) continue;
      const ok = await createExpiryNotification(db, {
        userId: sellerId,
        carId: docSnap.id,
        car,
        daysLeft,
      });
      if (ok) sent += 1;
    }
  }

  logger.info(`notifyListingExpiryReminders: sent ${sent} notifications.`);
}

module.exports = { notifyListingExpiryReminders };
