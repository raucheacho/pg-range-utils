# Range Utils

Une bibliothèque TypeScript pour gérer les intervalles/ranges avec support des types PostgreSQL.

## Installation

```bash
npm install range-utils
```

## Utilisation

### Classe Range de base

```typescript
import {
  Range,
  LOWER_BOUND_INCLUSIVE,
  UPPER_BOUND_INCLUSIVE,
} from "range-utils";

// Créer un range [1,5] (bornes inclusives)
const range = new Range(1, 5, LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE);

// Parser un range depuis une chaîne
const parsed = Range.parse("[1,5]", (v) => parseInt(v));

// Vérifier si une valeur est dans le range
console.log(range.contains(3)); // true
console.log(range.contains(6)); // false

// Sérialiser un range
console.log(Range.serialize(range)); // "[1,5]"
```

### Utilitaires PostgreSQL

```typescript
import {
  parsePostgresDateRange,
  serializePostgresDateRange,
  parsePostgresNumRange,
  serializePostgresNumRange,
} from "range-utils";

// Parser un range de dates PostgreSQL
const dateRange = parsePostgresDateRange(
  '["2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")'
);

// Sérialiser un range de dates pour PostgreSQL
const serialized = serializePostgresDateRange(dateRange);
console.log(serialized); // ["2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")

// Parser un range numérique PostgreSQL
const numRange = parsePostgresNumRange("[1,10)");
console.log(numRange.contains(5)); // true
console.log(numRange.contains(10)); // false (borne supérieure exclusive)
```

## API

### Range<T>

#### Constructeur

- `new Range<T>(lowerBound: T | null, upperBound: T | null, boundaryFlags?: number)`

#### Méthodes statiques

- `Range.parse<T>(input: string, parser?: (value: string) => T): Range<T>`
- `Range.serialize<T>(range: Range<T>): string`

#### Méthodes d'instance

- `isEmpty(): boolean` - Vérifie si le range est vide
- `isBounded(): boolean` - Vérifie si le range a les deux bornes
- `hasLowerBound(): boolean` - Vérifie si le range a une borne inférieure
- `hasUpperBound(): boolean` - Vérifie si le range a une borne supérieure
- `isLowerBoundInclusive(): boolean` - Vérifie si la borne inférieure est inclusive
- `isUpperBoundInclusive(): boolean` - Vérifie si la borne supérieure est inclusive
- `contains(value: T): boolean` - Vérifie si une valeur est dans le range
- `containsRange(other: Range<T>): boolean` - Vérifie si ce range contient un autre range
- `toString(): string` - Retourne une représentation string du range

### Utilitaires PostgreSQL

#### Fonctions pour les dates

- `parsePostgresDateRange(input: string): Range<Date>`
- `serializePostgresDateRange(range: Range<Date>): string`

#### Fonctions pour les nombres

- `parsePostgresNumRange(input: string): Range<number>`
- `serializePostgresNumRange(range: Range<number>): string`

## Formats supportés

### Notation des ranges

- `[1,5]` - Bornes inclusives
- `(1,5)` - Bornes exclusives
- `[1,5)` - Borne inférieure inclusive, supérieure exclusive
- `(1,5]` - Borne inférieure exclusive, supérieure inclusive
- `empty` - Range vide

### Formats PostgreSQL

- Dates : `["2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")`
- Nombres : `[1,10)`, `(0.5,99.9]`

## Développement

```bash
# Installer les dépendances
npm install

# Compiler le TypeScript
npm run build

# Exécuter les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Générer la couverture de code
npm run test:coverage

# Linter le code
npm run lint
```

## Tests

Le projet inclut une suite de tests complète avec :

- Tests unitaires pour la classe Range
- Tests d'intégration pour les utilitaires PostgreSQL
- Tests de round-trip pour vérifier la sérialisation/désérialisation
- Couverture de code > 80%

## Licence

MIT
