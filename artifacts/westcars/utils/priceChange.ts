import { Car } from "@/types";

export type PriceChangeDirection = "down" | "up";

export interface PriceChangeInfo {
  direction: PriceChangeDirection;
  previousPrice: number;
  currentPrice: number;
  amount: number;
  percent: number;
}

export function getPriceChange(car: Car): PriceChangeInfo | null {
  const prev = car.previousPrice;
  if (prev == null || prev <= 0 || prev === car.price) return null;

  const amount = car.price - prev;
  const percent = Math.round((Math.abs(amount) / prev) * 100);

  return {
    direction: amount < 0 ? "down" : "up",
    previousPrice: prev,
    currentPrice: car.price,
    amount: Math.abs(amount),
    percent,
  };
}

export function formatPriceChangeLabel(info: PriceChangeInfo): string {
  const ghs = `GHS ${info.amount.toLocaleString()}`;
  if (info.direction === "down") {
    return `${ghs} price drop · ${info.percent}% less`;
  }
  return `${ghs} price increase · +${info.percent}%`;
}
