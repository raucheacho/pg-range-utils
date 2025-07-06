import { Range } from "./Range";

/**
 * Parse une chaîne PostgreSQL de type range vers Range<Date>
 * Formats supportés:
 * - '["2025-07-13 18:26:00+00","2025-07-13 20:26:00+00")'
 * - '("2025-07-13 18:26:00+00","2025-07-13 20:26:00+00"]'
 * - etc.
 */
export function parsePostgresDateRange(input: string): Range<Date> {
  try {
    return Range.parse(input, (dateString) => {
      // Nettoie les guillemets doubles si présents
      const cleanedDateString = dateString.replace(/^"/, "").replace(/"$/, "");
      const parsedDate = new Date(cleanedDateString);

      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date format: ${cleanedDateString}`);
      }

      return parsedDate;
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse PostgreSQL date range: ${errorMessage}`);
  }
}

/**
 * Sérialise un Range<Date> vers une chaîne PostgreSQL
 * Format de sortie: '["2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")'
 */
export function serializePostgresDateRange(range: Range<Date>): string {
  if (!range.hasLowerBound() || !range.hasUpperBound()) {
    throw new Error(
      "Both lower and upper bounds must be defined to serialize PostgreSQL date range"
    );
  }

  const startIsoString = range.lowerBound!.toISOString();
  const endIsoString = range.upperBound!.toISOString();

  const leftBracket = range.isLowerBoundInclusive() ? "[" : "(";
  const rightBracket = range.isUpperBoundInclusive() ? "]" : ")";

  return `${leftBracket}"${startIsoString}","${endIsoString}"${rightBracket}`;
}

/**
 * Parse une chaîne PostgreSQL de type numrange vers Range<number>
 * Formats supportés: '[1,10)', '(0,100]', etc.
 */
export function parsePostgresNumRange(input: string): Range<number> {
  try {
    return Range.parse(input, (numString) => {
      const parsedNum = parseFloat(numString);
      if (isNaN(parsedNum)) {
        throw new Error(`Invalid number format: ${numString}`);
      }
      return parsedNum;
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse PostgreSQL number range: ${errorMessage}`);
  }
}

/**
 * Sérialise un Range<number> vers une chaîne PostgreSQL
 */
export function serializePostgresNumRange(range: Range<number>): string {
  if (!range.hasLowerBound() || !range.hasUpperBound()) {
    throw new Error(
      "Both lower and upper bounds must be defined to serialize PostgreSQL number range"
    );
  }

  const leftBracket = range.isLowerBoundInclusive() ? "[" : "(";
  const rightBracket = range.isUpperBoundInclusive() ? "]" : ")";

  return `${leftBracket}${range.lowerBound},${range.upperBound}${rightBracket}`;
}
