import {
  parsePostgresDateRange,
  parsePostgresNumRange,
  serializePostgresDateRange,
  serializePostgresNumRange,
} from "../postgres-utils";

describe("PostgreSQL utilities", () => {
  describe("parsePostgresDateRange", () => {
    it("should parse PostgreSQL date range with quotes", () => {
      const input = '["2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")';
      const range = parsePostgresDateRange(input);

      expect(range.lowerBound).toEqual(new Date("2025-07-13T18:26:00.000Z"));
      expect(range.upperBound).toEqual(new Date("2025-07-13T20:26:00.000Z"));
      expect(range.isLowerBoundInclusive()).toBe(true);
      expect(range.isUpperBoundInclusive()).toBe(false);
    });

    it("should parse PostgreSQL date range without quotes", () => {
      const input = "[2025-07-13T18:26:00.000Z,2025-07-13T20:26:00.000Z)";
      const range = parsePostgresDateRange(input);

      expect(range.lowerBound).toEqual(new Date("2025-07-13T18:26:00.000Z"));
      expect(range.upperBound).toEqual(new Date("2025-07-13T20:26:00.000Z"));
      expect(range.isLowerBoundInclusive()).toBe(true);
      expect(range.isUpperBoundInclusive()).toBe(false);
    });

    it("should parse different date formats", () => {
      const input = '["2025-07-13 18:26:00+00","2025-07-13 20:26:00+00")';
      const range = parsePostgresDateRange(input);

      expect(range.lowerBound).toBeInstanceOf(Date);
      expect(range.upperBound).toBeInstanceOf(Date);
      expect(range.lowerBound!.getTime()).toBe(
        new Date("2025-07-13T18:26:00.000Z").getTime()
      );
    });

    it("should handle exclusive ranges", () => {
      const input = '("2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")';
      const range = parsePostgresDateRange(input);

      expect(range.isLowerBoundInclusive()).toBe(false);
      expect(range.isUpperBoundInclusive()).toBe(false);
    });

    it("should throw error for invalid date format", () => {
      const input = '["invalid-date","2025-07-13T20:26:00.000Z")';

      expect(() => parsePostgresDateRange(input)).toThrow(
        "Failed to parse PostgreSQL date range"
      );
    });

    it("should throw error for invalid range format", () => {
      const input = "invalid-range";

      expect(() => parsePostgresDateRange(input)).toThrow(
        "Failed to parse PostgreSQL date range"
      );
    });
  });

  describe("serializePostgresDateRange", () => {
    it("should serialize date range with inclusive bounds", () => {
      const startDate = new Date("2025-07-13T18:26:00.000Z");
      const endDate = new Date("2025-07-13T20:26:00.000Z");
      const range = parsePostgresDateRange(
        `[${startDate.toISOString()},${endDate.toISOString()}]`
      );

      const serialized = serializePostgresDateRange(range);

      expect(serialized).toBe(
        '["2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z"]'
      );
    });

    it("should serialize date range with exclusive bounds", () => {
      const startDate = new Date("2025-07-13T18:26:00.000Z");
      const endDate = new Date("2025-07-13T20:26:00.000Z");
      const range = parsePostgresDateRange(
        `(${startDate.toISOString()},${endDate.toISOString()})`
      );

      const serialized = serializePostgresDateRange(range);

      expect(serialized).toBe(
        '("2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")'
      );
    });

    it("should serialize date range with mixed bounds", () => {
      const startDate = new Date("2025-07-13T18:26:00.000Z");
      const endDate = new Date("2025-07-13T20:26:00.000Z");
      const range = parsePostgresDateRange(
        `[${startDate.toISOString()},${endDate.toISOString()})`
      );

      const serialized = serializePostgresDateRange(range);

      expect(serialized).toBe(
        '["2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")'
      );
    });

    it("should throw error for range without bounds", () => {
      const range = parsePostgresDateRange("empty");

      expect(() => serializePostgresDateRange(range)).toThrow(
        "Both lower and upper bounds must be defined"
      );
    });
  });

  describe("parsePostgresNumRange", () => {
    it("should parse PostgreSQL number range", () => {
      const input = "[1,10)";
      const range = parsePostgresNumRange(input);

      expect(range.lowerBound).toBe(1);
      expect(range.upperBound).toBe(10);
      expect(range.isLowerBoundInclusive()).toBe(true);
      expect(range.isUpperBoundInclusive()).toBe(false);
    });

    it("should parse decimal numbers", () => {
      const input = "(0.5,99.9]";
      const range = parsePostgresNumRange(input);

      expect(range.lowerBound).toBe(0.5);
      expect(range.upperBound).toBe(99.9);
      expect(range.isLowerBoundInclusive()).toBe(false);
      expect(range.isUpperBoundInclusive()).toBe(true);
    });

    it("should throw error for invalid number format", () => {
      const input = "[abc,10)";

      expect(() => parsePostgresNumRange(input)).toThrow(
        "Failed to parse PostgreSQL number range"
      );
    });
  });

  describe("serializePostgresNumRange", () => {
    it("should serialize number range", () => {
      const range = parsePostgresNumRange("[1,10)");
      const serialized = serializePostgresNumRange(range);

      expect(serialized).toBe("[1,10)");
    });

    it("should serialize decimal number range", () => {
      const range = parsePostgresNumRange("(0.5,99.9]");
      const serialized = serializePostgresNumRange(range);

      expect(serialized).toBe("(0.5,99.9]");
    });

    it("should throw error for range without bounds", () => {
      const range = parsePostgresNumRange("empty");

      expect(() => serializePostgresNumRange(range)).toThrow(
        "Both lower and upper bounds must be defined"
      );
    });
  });

  describe("integration tests", () => {
    it("should round-trip date ranges", () => {
      const original =
        '["2025-07-13T18:26:00.000Z","2025-07-13T20:26:00.000Z")';
      const range = parsePostgresDateRange(original);
      const serialized = serializePostgresDateRange(range);
      const reparsed = parsePostgresDateRange(serialized);

      expect(reparsed.lowerBound).toEqual(range.lowerBound);
      expect(reparsed.upperBound).toEqual(range.upperBound);
      expect(reparsed.isLowerBoundInclusive()).toBe(
        range.isLowerBoundInclusive()
      );
      expect(reparsed.isUpperBoundInclusive()).toBe(
        range.isUpperBoundInclusive()
      );
    });

    it("should round-trip number ranges", () => {
      const original = "[1.5,10.7)";
      const range = parsePostgresNumRange(original);
      const serialized = serializePostgresNumRange(range);
      const reparsed = parsePostgresNumRange(serialized);

      expect(reparsed.lowerBound).toBe(range.lowerBound);
      expect(reparsed.upperBound).toBe(range.upperBound);
      expect(reparsed.isLowerBoundInclusive()).toBe(
        range.isLowerBoundInclusive()
      );
      expect(reparsed.isUpperBoundInclusive()).toBe(
        range.isUpperBoundInclusive()
      );
    });
  });
});
