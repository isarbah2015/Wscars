/**
 * Car brand logo URLs.
 * Source: filippofilip95/car-logos-dataset on GitHub — stable raw PNG files,
 * no auth, no CORS restrictions, works on both React Native native and web.
 */
const BASE = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";

export const BRAND_LOGOS: Record<string, string> = {
  "Toyota":        `${BASE}/toyota.png`,
  "Honda":         `${BASE}/honda.png`,
  "Mercedes-Benz": `${BASE}/mercedes-benz.png`,
  "BMW":           `${BASE}/bmw.png`,
  "Hyundai":       `${BASE}/hyundai.png`,
  "Kia":           `${BASE}/kia.png`,
  "Nissan":        `${BASE}/nissan.png`,
  "Ford":          `${BASE}/ford.png`,
  "Volkswagen":    `${BASE}/volkswagen.png`,
  "Lexus":         `${BASE}/lexus.png`,
  "Land Rover":    `${BASE}/land-rover.png`,
  "Peugeot":       `${BASE}/peugeot.png`,
  "Renault":       `${BASE}/renault.png`,
  "Mitsubishi":    `${BASE}/mitsubishi.png`,
  "Suzuki":        `${BASE}/suzuki.png`,
  "Mazda":         `${BASE}/mazda.png`,
  "Subaru":        `${BASE}/subaru.png`,
  "Chevrolet":     `${BASE}/chevrolet.png`,
  "Opel":          `${BASE}/opel.png`,
  "Volvo":         `${BASE}/volvo.png`,
  "Audi":          `${BASE}/audi.png`,
  "Porsche":       `${BASE}/porsche.png`,
  "Jeep":          `${BASE}/jeep.png`,
  "Isuzu":         `${BASE}/isuzu.png`,
  "Tata":          `${BASE}/tata.png`,
  "Great Wall":    `${BASE}/great-wall.png`,
  "Lifan":         `${BASE}/lifan.png`,
  "Brilliance":    `${BASE}/brilliance.png`,
};

export function getBrandLogo(brand: string): string | null {
  return BRAND_LOGOS[brand] ?? null;
}
