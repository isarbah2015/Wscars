const carlogos = (slug: string) => `https://www.carlogos.org/car-logos/${slug}-logo.png`;

export const brandLogos: Record<string, string> = {
  Acura: carlogos("acura"),
  "Alfa Romeo": carlogos("alfa-romeo"),
  Audi: carlogos("audi"),
  BAIC: carlogos("baic"),
  BMW: carlogos("bmw"),
  BYD: carlogos("byd"),
  Cadillac: carlogos("cadillac"),
  Changan: carlogos("changan"),
  Chery: carlogos("chery"),
  Chevrolet: carlogos("chevrolet"),
  Citroen: carlogos("citroen"),
  Dacia: carlogos("dacia"),
  Dodge: carlogos("dodge"),
  Dongfeng: carlogos("dongfeng"),
  FAW: carlogos("faw"),
  Fiat: carlogos("fiat"),
  Ford: carlogos("ford"),
  Foton: carlogos("foton"),
  GAC: carlogos("gac"),
  GMC: carlogos("gmc"),
  Geely: carlogos("geely"),
  Genesis: carlogos("genesis"),
  "Great Wall": carlogos("great-wall"),
  Haval: carlogos("haval"),
  Higer: carlogos("higer"),
  Honda: carlogos("honda"),
  Hummer: carlogos("hummer"),
  Hyundai: carlogos("hyundai"),
  Infiniti: carlogos("infiniti"),
  Isuzu: carlogos("isuzu"),
  JAC: carlogos("jac"),
  Jeep: carlogos("jeep"),
  Kia: carlogos("kia"),
  "King Long": carlogos("king-long"),
  "Land Rover": carlogos("land-rover"),
  Lexus: carlogos("lexus"),
  Lifan: carlogos("lifan"),
  Lincoln: carlogos("lincoln"),
  MG: carlogos("mg"),
  Mazda: carlogos("mazda"),
  Mercedes: carlogos("mercedes-benz"),
  "Mercedes-Benz": carlogos("mercedes-benz"),
  Mitsubishi: carlogos("mitsubishi"),
  Nissan: carlogos("nissan"),
  Opel: carlogos("opel"),
  Peugeot: carlogos("peugeot"),
  Polestar: carlogos("polestar"),
  Porsche: carlogos("porsche"),
  Ram: carlogos("ram"),
  Renault: carlogos("renault"),
  Rivian: carlogos("rivian"),
  SAIC: carlogos("saic"),
  SEAT: carlogos("seat"),
  Shacman: carlogos("shacman"),
  Sinotruck: carlogos("sinotruk"),
  Skoda: carlogos("skoda"),
  Subaru: carlogos("subaru"),
  Suzuki: carlogos("suzuki"),
  Tesla: carlogos("tesla"),
  Toyota: carlogos("toyota"),
  Volkswagen: carlogos("volkswagen"),
  Volvo: carlogos("volvo"),
  Yutong: carlogos("yutong"),
  Zotye: carlogos("zotye"),
};

export const BRAND_LOGOS = brandLogos;

const BRAND_LOGO_ALIASES: Record<string, string> = {
  Sinotruck: "sinotruk",
};

export function getBrandLogo(brand: string): string | null {
  const explicit = brandLogos[brand] ?? brandLogos[brand.replace("-Benz", "")];
  if (explicit) return explicit;

  const aliasSlug = BRAND_LOGO_ALIASES[brand];
  if (aliasSlug) return carlogos(aliasSlug);

  const slug = brand
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return slug ? carlogos(slug) : null;
}

export function getBrandInitials(brand: string): string {
  return brand
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
