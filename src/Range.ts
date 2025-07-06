// Flags pour les bornes inclusives/exclusives
export const LOWER_BOUND_INCLUSIVE = 1 << 0; // 1
export const UPPER_BOUND_INCLUSIVE = 1 << 1; // 2

/**
 * Représente un intervalle/range avec des bornes optionnelles
 * @template T Le type des valeurs dans l'intervalle
 */
export class Range<T = number> {
  /**
   * @param lowerBound La borne inférieure (null = pas de borne)
   * @param upperBound La borne supérieure (null = pas de borne)
   * @param boundaryFlags Flags pour déterminer si les bornes sont inclusives
   */
  constructor(
    public readonly lowerBound: T | null,
    public readonly upperBound: T | null,
    public readonly boundaryFlags: number = 0
  ) {}

  /**
   * Parse une chaîne de caractères au format range
   * Formats supportés: "[1,5]", "(1,5)", "[1,5)", "(1,5]", "empty"
   */
  static parse<T = string>(
    input: string,
    valueParser: (value: string) => T = (v) => v as unknown as T
  ): Range<T> {
    if (input === "empty") {
      return new Range(null, null, 0) as Range<T>;
    }

    const rangePattern = /^([\[(])\s*(.+?)\s*,\s*(.+?)\s*([\])])$/;
    const match = input.match(rangePattern);

    if (!match) {
      throw new Error(`Invalid range format: ${input}`);
    }

    const [, leftBracket, rawLowerBound, rawUpperBound, rightBracket] = match;

    const flags =
      (leftBracket === "[" ? LOWER_BOUND_INCLUSIVE : 0) |
      (rightBracket === "]" ? UPPER_BOUND_INCLUSIVE : 0);

    const lowerBound = valueParser(rawLowerBound);
    const upperBound = valueParser(rawUpperBound);

    return new Range(lowerBound, upperBound, flags);
  }

  /**
   * Sérialise un range en chaîne de caractères
   */
  static serialize<T>(range: Range<T>): string {
    if (range.isEmpty()) {
      return "empty";
    }

    const leftBracket = range.isLowerBoundInclusive() ? "[" : "(";
    const rightBracket = range.isUpperBoundInclusive() ? "]" : ")";

    return `${leftBracket}${range.lowerBound},${range.upperBound}${rightBracket}`;
  }

  /**
   * Vérifie si le range est vide (pas de bornes)
   */
  isEmpty(): boolean {
    return this.lowerBound === null && this.upperBound === null;
  }

  /**
   * Vérifie si le range a les deux bornes définies
   */
  isBounded(): boolean {
    return this.lowerBound !== null && this.upperBound !== null;
  }

  /**
   * Vérifie si le range a une borne inférieure
   */
  hasLowerBound(): boolean {
    return this.lowerBound !== null;
  }

  /**
   * Vérifie si le range a une borne supérieure
   */
  hasUpperBound(): boolean {
    return this.upperBound !== null;
  }

  /**
   * Vérifie si la borne inférieure est inclusive
   */
  isLowerBoundInclusive(): boolean {
    return (this.boundaryFlags & LOWER_BOUND_INCLUSIVE) !== 0;
  }

  /**
   * Vérifie si la borne supérieure est inclusive
   */
  isUpperBoundInclusive(): boolean {
    return (this.boundaryFlags & UPPER_BOUND_INCLUSIVE) !== 0;
  }

  /**
   * Vérifie si une valeur est contenue dans le range
   */
  contains(value: T): boolean {
    if (!this.isBounded()) {
      return false;
    }

    const satisfiesLowerBound = this.isLowerBoundInclusive()
      ? value >= this.lowerBound!
      : value > this.lowerBound!;

    const satisfiesUpperBound = this.isUpperBoundInclusive()
      ? value <= this.upperBound!
      : value < this.upperBound!;

    return satisfiesLowerBound && satisfiesUpperBound;
  }

  /**
   * Vérifie si ce range contient entièrement un autre range
   */
  containsRange(other: Range<T>): boolean {
    if (!this.isBounded() || !other.isBounded()) {
      return false;
    }

    const lowerBoundSatisfied = this.isLowerBoundInclusive()
      ? other.lowerBound! >= this.lowerBound!
      : other.lowerBound! > this.lowerBound!;

    const upperBoundSatisfied = this.isUpperBoundInclusive()
      ? other.upperBound! <= this.upperBound!
      : other.upperBound! < this.upperBound!;

    return lowerBoundSatisfied && upperBoundSatisfied;
  }

  /**
   * Retourne une représentation string du range
   */
  toString(): string {
    return Range.serialize(this);
  }
}
