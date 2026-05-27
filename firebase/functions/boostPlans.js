/** Boost plan catalog — keep in sync with artifacts/westcars/lib/paystack.ts */
const BOOST_PLANS = {
  basic_boost: {
    id: "basic_boost",
    name: "Basic Boost",
    amount: 5000,
    days: 7,
    isSubscription: false,
  },
  premium_boost: {
    id: "premium_boost",
    name: "Premium Boost",
    amount: 10000,
    days: 14,
    isSubscription: false,
  },
  dealer_monthly: {
    id: "dealer_monthly",
    name: "Dealer Monthly",
    amount: 25000,
    days: 30,
    isSubscription: true,
  },
};

function getBoostPlan(planId) {
  return BOOST_PLANS[planId] || null;
}

module.exports = { BOOST_PLANS, getBoostPlan };
