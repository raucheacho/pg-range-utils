import {
  LOWER_BOUND_INCLUSIVE,
  Range,
  UPPER_BOUND_INCLUSIVE,
  parsePostgresDateRange,
  parsePostgresNumRange,
  serializePostgresDateRange,
  serializePostgresNumRange,
} from "../src/index";

// Exemples d'utilisation de la classe Range

console.log("=== Exemples Range de base ===");

// Créer un range [1,10] (bornes inclusives)
const numericRange = new Range(
  1,
  10,
  LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
);
console.log("Range numérique:", numericRange.toString()); // [1,10]

// Parser un range depuis une string
const parsedRange = Range.parse("[0,100)", (v) => parseInt(v));
console.log("Range parsé:", parsedRange.toString()); // [0,100)

// Vérifier si une valeur est contenue
console.log("5 est dans [1,10]:", numericRange.contains(5)); // true
console.log("10 est dans [0,100):", parsedRange.contains(10)); // false (borne exclusive)

// Vérifier si un range contient un autre
const smallRange = new Range(
  2,
  8,
  LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
);
console.log("[1,10] contient [2,8]:", numericRange.containsRange(smallRange)); // true

console.log("\n=== Exemples PostgreSQL ===");

// Parser un range de dates PostgreSQL
const pgDateRange = parsePostgresDateRange(
  '["2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")'
);
console.log("Range de dates:", pgDateRange.toString());
console.log("Borne inférieure:", pgDateRange.lowerBound);
console.log("Borne supérieure:", pgDateRange.upperBound);

// Sérialiser pour PostgreSQL
const serializedDate = serializePostgresDateRange(pgDateRange);
console.log("Sérialisé pour PostgreSQL:", serializedDate);

// Parser un range numérique PostgreSQL
const pgNumRange = parsePostgresNumRange("[1.5,99.9)");
console.log("Range numérique PostgreSQL:", pgNumRange.toString());
console.log("50.0 est dans le range:", pgNumRange.contains(50.0)); // true
console.log("99.8 est dans le range:", pgNumRange.contains(99.8)); // true
console.log("99.9 est dans le range:", pgNumRange.contains(99.9)); // false (borne exclusive)

// Sérialiser pour PostgreSQL
const serializedNum = serializePostgresNumRange(pgNumRange);
console.log("Sérialisé pour PostgreSQL:", serializedNum);

console.log("\n=== Exemples avec des types personnalisés ===");

// Range avec des strings
const stringRange = Range.parse("[a,z]", (v) => v);
console.log("Range de strings:", stringRange.toString());

// Range avec des dates
const dateRange = Range.parse("[2025-01-01,2025-12-31]", (v) => new Date(v));
console.log("Range de dates:", dateRange.toString());

// Vérifier si une date est dans le range
const testDate = new Date("2025-06-15");
console.log("2025-06-15 est dans le range:", dateRange.contains(testDate)); // true

console.log("\n=== Gestion des cas spéciaux ===");

// Range vide
const emptyRange = Range.parse("empty");
console.log("Range vide:", emptyRange.toString());
console.log("Est vide:", emptyRange.isEmpty()); // true

// Range avec une seule borne
const unboundedRange = new Range(10, null, LOWER_BOUND_INCLUSIVE);
console.log(
  "Range non borné:",
  unboundedRange.hasLowerBound(),
  unboundedRange.hasUpperBound()
); // true, false
