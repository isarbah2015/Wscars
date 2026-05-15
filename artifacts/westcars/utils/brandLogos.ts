export const BRAND_LOGOS: Record<string, string> = {};

export function getBrandLogo(brand: string): string | null {
  return null;
}

export function getBrandInitials(brand: string): string {
  return brand
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
