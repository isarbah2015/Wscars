const BASE = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";

export const BRAND_LOGOS: Record<string, string> = {
  // ── Japanese ────────────────────────────────────────────────────────────────
  "Toyota":          `${BASE}/toyota.png`,
  "Honda":           `${BASE}/honda.png`,
  "Nissan":          `${BASE}/nissan.png`,
  "Mitsubishi":      `${BASE}/mitsubishi.png`,
  "Suzuki":          `${BASE}/suzuki.png`,
  "Mazda":           `${BASE}/mazda.png`,
  "Subaru":          `${BASE}/subaru.png`,
  "Isuzu":           `${BASE}/isuzu.png`,
  "Lexus":           `${BASE}/lexus.png`,
  "Infiniti":        `${BASE}/infiniti.png`,
  "Acura":           `${BASE}/acura.png`,
  // ── Korean ──────────────────────────────────────────────────────────────────
  "Hyundai":         `${BASE}/hyundai.png`,
  "Kia":             `${BASE}/kia.png`,
  "Genesis":         `${BASE}/genesis.png`,
  // ── German ──────────────────────────────────────────────────────────────────
  "Mercedes":        `${BASE}/mercedes-benz.png`,
  "Mercedes-Benz":   `${BASE}/mercedes-benz.png`,
  "BMW":             `${BASE}/bmw.png`,
  "Volkswagen":      `${BASE}/volkswagen.png`,
  "Audi":            `${BASE}/audi.png`,
  "Opel":            `${BASE}/opel.png`,
  "Porsche":         `${BASE}/porsche.png`,
  // ── American ────────────────────────────────────────────────────────────────
  "Ford":            `${BASE}/ford.png`,
  "Chevrolet":       `${BASE}/chevrolet.png`,
  "Cadillac":        `${BASE}/cadillac.png`,
  "GMC":             `${BASE}/gmc.png`,
  "Dodge":           `${BASE}/dodge.png`,
  "Ram":             `${BASE}/ram.png`,
  "Jeep":            `${BASE}/jeep.png`,
  "Lincoln":         `${BASE}/lincoln.png`,
  "Hummer":          `${BASE}/hummer.png`,
  "Tesla":           `${BASE}/tesla.png`,
  "Rivian":          `${BASE}/rivian.png`,
  // ── British / European ──────────────────────────────────────────────────────
  "Land Rover":      `${BASE}/land-rover.png`,
  "Volvo":           `${BASE}/volvo.png`,
  // ── French ──────────────────────────────────────────────────────────────────
  "Peugeot":         `${BASE}/peugeot.png`,
  "Renault":         `${BASE}/renault.png`,
  "Citroen":         `${BASE}/citroen.png`,
  "Dacia":           `${BASE}/dacia.png`,
  // ── Italian ─────────────────────────────────────────────────────────────────
  "Fiat":            `${BASE}/fiat.png`,
  "Alfa Romeo":      `${BASE}/alfa-romeo.png`,
  // ── Swedish ─────────────────────────────────────────────────────────────────
  "Polestar":        `${BASE}/polestar.png`,
  // ── Czech / Spanish ─────────────────────────────────────────────────────────
  "Skoda":           `${BASE}/skoda.png`,
  "SEAT":            `${BASE}/seat.png`,
  // ── Chinese passenger cars ──────────────────────────────────────────────────
  "BYD":             `${BASE}/byd.png`,
  "Chery":           `${BASE}/chery.png`,
  "Haval":           `${BASE}/haval.png`,
  "JAC":             `${BASE}/jac.png`,
  "Changan":         `${BASE}/changan.png`,
  "Geely":           `${BASE}/geely.png`,
  "MG":              `${BASE}/mg.png`,
  "Foton":           `${BASE}/foton.png`,
  "Lifan":           `${BASE}/lifan.png`,
  "SAIC":            "https://www.carlogos.org/car-logos/saic-logo.png",
  "GAC":             "https://www.carlogos.org/car-logos/gac-logo.png",
  "Great Wall":      `${BASE}/great-wall.png`,
  "Dongfeng":        `${BASE}/dongfeng.png`,
  "FAW":             `${BASE}/faw.png`,
  "Zotye":           `${BASE}/zotye.png`,
  // ── Chinese buses & trucks ──────────────────────────────────────────────────
  "BAIC":            "https://www.carlogos.org/car-logos/baic-logo.png",
  "King Long":       `${BASE}/king-long.png`,
  "Yutong":          `${BASE}/yutong.png`,
  "Higer":           `${BASE}/higer.png`,
  "Sinotruk":        `${BASE}/sinotruk.png`,
  "Sinotruck":       `${BASE}/sinotruk.png`,
  "Shacman":         `${BASE}/shacman.png`,
  "Maxus":           `${BASE}/maxus.png`,
  "Hongqi":          `${BASE}/hongqi.png`,
  "Omoda":           `${BASE}/omoda.png`,
  "Jetour":          `${BASE}/jetour.png`,
};

export function getBrandLogo(brand: string): string | null {
  return BRAND_LOGOS[brand] ?? null;
}

export function getBrandInitials(brand: string): string {
  return brand
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
