/**
 * Saved-search matching — keep in sync with artifacts/westcars/utils/listingSearchFilters.ts
 */

function matchesQuickFilter(car, key) {
  const cat = (car.category || "").toLowerCase();
  if (key === "All") return true;
  if (key === "SUV") return cat.includes("suv") || cat.includes("4x4");
  if (key === "Sedan") return cat.includes("sedan");
  if (key === "Tokunbo") return car.condition === "Foreign Used";
  if (key === "China") {
    const loc = car.location || "";
    return (
      loc.startsWith("China —") ||
      loc === "Chinese Seller — Vehicle in China" ||
      loc === "Foreign — China"
    );
  }
  if (key === "Budget") return (car.price || 0) < 100000;
  if (key === "Luxury") return (car.price || 0) > 300000;
  if (key === "Pickup") return cat.includes("pickup");
  if (key === "Truck") {
    return (
      cat.includes("cargo") ||
      cat.includes("tipper") ||
      cat.includes("tanker") ||
      cat.includes("flatbed")
    );
  }
  if (key === "Bus") return cat.includes("bus") || cat.includes("minibus");
  if (key === "Moto") return cat.includes("motorcycle") || cat.includes("scooter");
  if (key === "New") return car.condition === "New";
  return true;
}

function carMatchesFilters(car, filters) {
  if (!filters) return true;
  const bodyTypes = filters.bodyTypes || [];
  const matchesBody =
    bodyTypes.length === 0 ||
    bodyTypes.some((t) => matchesQuickFilter(car, t));

  return (
    matchesBody &&
    (!(filters.brands || []).length || filters.brands.includes(car.brand)) &&
    (!(filters.models || []).length || filters.models.includes(car.model)) &&
    (!(filters.transmissions || []).length || filters.transmissions.includes(car.transmission || "")) &&
    (!(filters.conditions || []).length || filters.conditions.includes(car.condition)) &&
    (!(filters.cities || []).length || filters.cities.includes(car.location)) &&
    (car.price || 0) >= (filters.priceMin ?? 0) &&
    (car.price || 0) <= (filters.priceMax ?? 999999999) &&
    (car.year || 0) >= (filters.yearMin ?? 0) &&
    (car.year || 0) <= (filters.yearMax ?? 9999)
  );
}

function carMatchesSavedSearch(car, search) {
  if (car.isHidden || car.isSold) return false;
  if (car.sellerId === search.userId) return false;

  const q = (search.query || "").trim().toLowerCase();
  if (q) {
    const hay = `${car.brand} ${car.model} ${car.location} ${car.condition} ${car.category || ""}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }

  const qf = search.quickFilter || "All";
  if (qf !== "All" && !matchesQuickFilter(car, qf)) return false;

  return carMatchesFilters(car, search.filters);
}

module.exports = { carMatchesSavedSearch };
