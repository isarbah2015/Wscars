/**
 * Car brand logo URLs.
 * Source: filippofilip95/car-logos-dataset on GitHub — stable raw PNG files,
 * no auth, no CORS restrictions, works on both React Native native and web.
 */
const BASE = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";

export const BRAND_LOGOS: Record<string, string> = {
  // Japanese
  "Toyota":        `${BASE}/toyota.png`,
  "Honda":         `${BASE}/honda.png`,
  "Nissan":        `${BASE}/nissan.png`,
  "Mitsubishi":    `${BASE}/mitsubishi.png`,
  "Suzuki":        `${BASE}/suzuki.png`,
  "Mazda":         `${BASE}/mazda.png`,
  "Subaru":        `${BASE}/subaru.png`,
  "Isuzu":         `${BASE}/isuzu.png`,
  "Lexus":         `${BASE}/lexus.png`,
  // Korean
  "Hyundai":       `${BASE}/hyundai.png`,
  "Kia":           `${BASE}/kia.png`,
  // German
  "Mercedes-Benz": `${BASE}/mercedes-benz.png`,
  "BMW":           `${BASE}/bmw.png`,
  "Volkswagen":    `${BASE}/volkswagen.png`,
  "Audi":          `${BASE}/audi.png`,
  "Opel":          `${BASE}/opel.png`,
  "Porsche":       `${BASE}/porsche.png`,
  "Volvo":         `${BASE}/volvo.png`,
  // American
  "Ford":          `${BASE}/ford.png`,
  "Chevrolet":     `${BASE}/chevrolet.png`,
  "Jeep":          `${BASE}/jeep.png`,
  // British / European
  "Land Rover":    `${BASE}/land-rover.png`,
  "Peugeot":       `${BASE}/peugeot.png`,
  "Renault":       `${BASE}/renault.png`,
  // Chinese
  "BYD":           `${BASE}/byd.png`,
  "Chery":         `${BASE}/chery.png`,
  "Haval":         `${BASE}/haval.png`,
  "GAC":           "https://www.carlogos.org/car-logos/gac-logo.png",
  "JAC":           `${BASE}/jac.png`,
  "Changan":       `${BASE}/changan.png`,
  "Geely":         `${BASE}/geely.png`,
  "MG":            `${BASE}/mg.png`,
  "Foton":         `${BASE}/foton.png`,
  "BAIC":          "https://www.carlogos.org/car-logos/baic-logo.png",
  "Dongfeng":      `${BASE}/dongfeng.png`,
  // Other
  "Tata":          `${BASE}/tata.png`,
  "Great Wall":    `${BASE}/great-wall.png`,
  "Lifan":         `${BASE}/lifan.png`,
  "Brilliance":    `${BASE}/brilliance.png`,
};

export function getBrandLogo(brand: string): string | null {
  return BRAND_LOGOS[brand] ?? null;
}
