export const PAYSTACK_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

/** True when the bundled key is Paystack live mode (charges real GHS). */
export function isPaystackLiveMode(): boolean {
  return PAYSTACK_PUBLIC_KEY.startsWith("pk_live_");
}

export interface BoostPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  days: number;
  badge: string;
  isSubscription: boolean;
}

export const BOOST_PLANS: BoostPlan[] = [
  {
    id: "basic_boost",
    name: "Basic Boost",
    description: "Featured for 7 days",
    amount: 5000,
    days: 7,
    badge: "Boosted",
    isSubscription: false,
  },
  {
    id: "premium_boost",
    name: "Premium Boost",
    description: "Top placement for 14 days",
    amount: 10000,
    days: 14,
    badge: "Premium",
    isSubscription: false,
  },
  {
    id: "dealer_monthly",
    name: "Dealer Monthly",
    description: "Unlimited boosts for 30 days",
    amount: 25000,
    days: 30,
    badge: "Dealer Pro",
    isSubscription: true,
  },
];

export function formatGHS(pesewas: number) {
  return `GHS ${(pesewas / 100).toFixed(2)}`;
}

/** Paystack checkout expects amount in major currency units (cedis), not pesewas. */
export function pesewasToGHS(pesewas: number) {
  return pesewas / 100;
}
