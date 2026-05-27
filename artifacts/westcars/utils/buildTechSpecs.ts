import { Car, TechSpecs } from "@/types";

type CarSpecInput = Pick<
  Car,
  "brand" | "model" | "year" | "fuelType" | "transmission" | "condition" | "category" | "mileage" | "location" | "color"
>;

/** Build displayable tech specs from listing fields when VIN/dealer data isn't available. */
export function buildTechSpecs(car: CarSpecInput): TechSpecs {
  const fuel = (car.fuelType || "Petrol").toLowerCase();
  const isDiesel = fuel.includes("diesel");
  const isElectric = fuel.includes("electric") || fuel.includes("ev");
  const isHybrid = fuel.includes("hybrid");
  const isAuto = (car.transmission || "Automatic").toLowerCase().includes("auto");
  const cat = (car.category || "sedan").toLowerCase();

  const bodyMap: Record<string, string> = {
    sedan: "Sedan 4-door",
    suv: "SUV 5-door",
    hatchback: "Hatchback 5-door",
    pickup: "Pickup 4-door",
    coupe: "Coupe 2-door",
    van: "Van / MPV",
    truck: "Truck",
    convertible: "Convertible",
  };

  const seats = cat === "suv" || cat === "van" ? 7 : cat === "pickup" || cat === "truck" ? 5 : 5;
  const hp = isElectric ? 204 : isDiesel ? 190 : isHybrid ? 170 : 150;
  const torque = isDiesel ? "400 Nm" : isElectric ? "310 Nm" : "240 Nm";
  const tank = isElectric ? 0 : cat === "suv" || cat === "pickup" ? 80 : 55;
  const weight = cat === "suv" ? 2100 : cat === "pickup" ? 2300 : 1450;

  return {
    bodyType: bodyMap[cat] ?? "Passenger car",
    owners: car.condition === "New" ? 0 : 1,
    color: car.color?.trim() || "As listed",
    trim: `${car.brand} ${car.model}`,
    country: car.condition === "Foreign Used" ? "Import" : "Ghana",
    carClass: cat === "suv" ? "J (SUV)" : cat === "pickup" ? "N (Pickup)" : "D (Mid-size)",
    doors: cat === "coupe" ? 2 : 4,
    seats,
    steering: "Left",
    length: cat === "suv" ? 4800 : cat === "pickup" ? 5300 : 4600,
    width: cat === "suv" ? 1920 : 1800,
    height: cat === "suv" ? 1750 : 1480,
    wheelbase: cat === "suv" ? 2750 : 2650,
    clearance: cat === "suv" || cat === "pickup" ? 200 : 150,
    frontTrack: 1580,
    rearTrack: 1580,
    wheelSize: cat === "suv" || cat === "pickup" ? "265/65 R17" : "205/55 R16",
    engineType: isElectric ? "Electric motor" : isDiesel ? "Diesel, inline-4" : isHybrid ? "Petrol + electric hybrid" : "Petrol, inline-4",
    engineLayout: isElectric ? "Front" : "Front, transverse",
    engineDisplacement: isElectric ? "N/A (electric)" : isDiesel ? "2.2L (2198 cc)" : "2.0L (1998 cc)",
    engineCode: "N/A",
    horsepower: hp,
    horsepowerRpm: isElectric ? "N/A" : "5,500 rpm",
    torque,
    torqueRpm: isElectric ? "N/A" : "1,800–3,500 rpm",
    cylinderConfig: isElectric ? "N/A" : "Inline-4, 16 valves",
    fuelGrade: isElectric ? "Electric" : isDiesel ? "Diesel" : "Petrol (RON 95)",
    gearbox: isAuto ? "Automatic" : "Manual",
    gears: isAuto ? 6 : 5,
    drive: cat === "suv" || cat === "pickup" ? "4WD / AWD" : "Front-wheel drive",
    curbWeight: weight,
    maxWeight: weight + 450,
    tankVolume: tank,
    frontSuspension: "Independent, MacPherson strut",
    rearSuspension: cat === "pickup" ? "Rigid axle, leaf spring" : "Independent, multi-link",
    frontBrakes: "Ventilated disc",
    rearBrakes: "Solid disc",
    maxSpeed: isElectric ? 180 : isDiesel ? 190 : 200,
    acceleration: isElectric ? "8.5 s" : isDiesel ? "9.8 s" : "10.2 s",
    fuelCity: isElectric ? "N/A" : isDiesel ? "11.5 L/100km" : "10.0 L/100km",
    fuelHighway: isElectric ? "N/A" : isDiesel ? "7.5 L/100km" : "6.5 L/100km",
    fuelMixed: isElectric ? "N/A" : isDiesel ? "9.0 L/100km" : "8.0 L/100km",
    co2: isElectric ? "0 g/km" : isDiesel ? "210 g/km" : "185 g/km",
    euroStandard: "Euro 5 / equivalent",
    annualTax: Math.round(car.year >= 2020 ? 650 : 480),
  };
}

export function getCarTechSpecs(car: Car): TechSpecs {
  return car.techSpecs ?? buildTechSpecs(car);
}
