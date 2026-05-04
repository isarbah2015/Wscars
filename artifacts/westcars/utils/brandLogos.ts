/**
 * Car brand logo URLs — Wikipedia Commons PNGs (stable, no auth required).
 * Used in the home screen brand strip and search filter modal.
 */
export const BRAND_LOGOS: Record<string, string> = {
  "Toyota":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/240px-Toyota_carlogo.svg.png",
  "Honda":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/240px-Honda_Logo.svg.png",
  "Mercedes-Benz":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/240px-Mercedes-Logo.svg.png",
  "BMW":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/240px-BMW.svg.png",
  "Hyundai":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Hyundai_Motor_Company_logo.svg/240px-Hyundai_Motor_Company_logo.svg.png",
  "Kia":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.svg/240px-Kia-logo.svg.png",
  "Nissan":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Nissan_logo.svg/240px-Nissan_logo.svg.png",
  "Ford":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/240px-Ford_logo_flat.svg.png",
  "Volkswagen":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/240px-Volkswagen_logo_2019.svg.png",
  "Lexus":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Lexus_division_emblem.svg/240px-Lexus_division_emblem.svg.png",
  "Land Rover":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Land_Rover_logo.svg/240px-Land_Rover_logo.svg.png",
  "Peugeot":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Peugeot_Logo.svg/240px-Peugeot_Logo.svg.png",
  "Renault":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Renault_2021_Text.svg/240px-Renault_2021_Text.svg.png",
  "Mitsubishi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Mitsubishi_logo.svg/240px-Mitsubishi_logo.svg.png",
  "Suzuki":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/240px-Suzuki_logo_2.svg.png",
  "Mazda":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mazda_Logo.svg/240px-Mazda_Logo.svg.png",
  "Subaru":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Subaru_logo.svg/240px-Subaru_logo.svg.png",
  "Chevrolet":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Chevrolet_logo.svg/240px-Chevrolet_logo.svg.png",
  "Opel":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Opel_logo_2017.svg/240px-Opel_logo_2017.svg.png",
  "Volvo":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Volvo_logo.svg/240px-Volvo_logo.svg.png",
  "Audi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/240px-Audi-Logo_2016.svg.png",
  "Porsche":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Porsche_logo.svg/240px-Porsche_logo.svg.png",
  "Jeep":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Jeep_logo.svg/240px-Jeep_logo.svg.png",
  "Isuzu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Isuzu_logo.svg/240px-Isuzu_logo.svg.png",
  "Tata":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tata_logo.svg/240px-Tata_logo.svg.png",
  "Great Wall":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Great_Wall_Motors_logo.svg/240px-Great_Wall_Motors_logo.svg.png",
  "Lifan":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Lifan_logo.svg/240px-Lifan_logo.svg.png",
  "Brilliance":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Brilliance_Auto_logo.svg/240px-Brilliance_Auto_logo.svg.png",
};

/** Returns the logo URL for a brand, or null if not found. */
export function getBrandLogo(brand: string): string | null {
  return BRAND_LOGOS[brand] ?? null;
}
