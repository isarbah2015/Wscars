const clearbit = (domain: string) => `https://logo.clearbit.com/${domain}`;

export const BRAND_LOGOS: Record<string, string> = {
  Acura: clearbit("acura.com"),
  "Alfa Romeo": clearbit("alfaromeo.com"),
  Audi: clearbit("audi.com"),
  BAIC: clearbit("baicglobal.com"),
  BMW: clearbit("bmw.com"),
  BYD: clearbit("byd.com"),
  Cadillac: clearbit("cadillac.com"),
  Changan: clearbit("globalchangan.com"),
  Chery: clearbit("cheryinternational.com"),
  Chevrolet: clearbit("chevrolet.com"),
  Citroen: clearbit("citroen.com"),
  Dacia: clearbit("dacia.com"),
  Dodge: clearbit("dodge.com"),
  Dongfeng: clearbit("dfm-global.com"),
  FAW: clearbit("faw.com"),
  Fiat: clearbit("fiat.com"),
  Ford: clearbit("ford.com"),
  Foton: clearbit("foton-global.com"),
  GAC: clearbit("gac-motor.com"),
  GMC: clearbit("gmc.com"),
  Geely: clearbit("global.geely.com"),
  Genesis: clearbit("genesis.com"),
  "Great Wall": clearbit("gwm-global.com"),
  Haval: clearbit("haval-global.com"),
  Higer: clearbit("higer.com"),
  Honda: clearbit("honda.com"),
  Hummer: clearbit("gmc.com"),
  Hyundai: clearbit("hyundai.com"),
  Infiniti: clearbit("infiniti.com"),
  Isuzu: clearbit("isuzu.com"),
  JAC: clearbit("jacen.jac.com.cn"),
  Jeep: clearbit("jeep.com"),
  Kia: clearbit("kia.com"),
  "King Long": clearbit("king-long.com"),
  "Land Rover": clearbit("landrover.com"),
  Lexus: clearbit("lexus.com"),
  Lifan: clearbit("lifanmotors.net"),
  Lincoln: clearbit("lincoln.com"),
  MG: clearbit("mgmotor.eu"),
  Mazda: clearbit("mazda.com"),
  Mercedes: clearbit("mercedes-benz.com"),
  "Mercedes-Benz": clearbit("mercedes-benz.com"),
  Mitsubishi: clearbit("mitsubishi-motors.com"),
  Nissan: clearbit("nissan-global.com"),
  Opel: clearbit("opel.com"),
  Peugeot: clearbit("peugeot.com"),
  Polestar: clearbit("polestar.com"),
  Porsche: clearbit("porsche.com"),
  Ram: clearbit("ramtrucks.com"),
  Renault: clearbit("renault.com"),
  Rivian: clearbit("rivian.com"),
  SAIC: clearbit("saicmotor.com"),
  SEAT: clearbit("seat.com"),
  Shacman: clearbit("shacmantruck.com"),
  Sinotruck: clearbit("sinotrukinternational.com"),
  Skoda: clearbit("skoda-auto.com"),
  Subaru: clearbit("subaru.com"),
  Suzuki: clearbit("suzuki.com"),
  Tesla: clearbit("tesla.com"),
  Toyota: clearbit("toyota.com"),
  Volkswagen: clearbit("volkswagen.com"),
  Volvo: clearbit("volvocars.com"),
  Yutong: clearbit("yutong.com"),
  Zotye: clearbit("zotye.com"),
};

export function getBrandLogo(brand: string): string | null {
  return BRAND_LOGOS[brand] ?? BRAND_LOGOS[brand.replace("-Benz", "")] ?? null;
}

export function getBrandInitials(brand: string): string {
  return brand
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
