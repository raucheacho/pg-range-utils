import { LOWER_BOUND_INCLUSIVE, Range, UPPER_BOUND_INCLUSIVE } from "../Range";

describe("Range", () => {
  describe("constructor", () => {
    it("should create a range with bounds and flags", () => {
      const range = new Range(
        1,
        10,
        LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
      );

      expect(range.lowerBound).toBe(1);
      expect(range.upperBound).toBe(10);
      expect(range.boundaryFlags).toBe(3);
    });

    it("should create an empty range", () => {
      const range = new Range(null, null);

      expect(range.lowerBound).toBeNull();
      expect(range.upperBound).toBeNull();
      expect(range.boundaryFlags).toBe(0);
    });
  });

  describe("parse", () => {
    it("should parse inclusive range [1,5]", () => {
      const range = Range.parse("[1,5]", (v) => parseInt(v));

      expect(range.lowerBound).toBe(1);
      expect(range.upperBound).toBe(5);
      expect(range.isLowerBoundInclusive()).toBe(true);
      expect(range.isUpperBoundInclusive()).toBe(true);
    });

    it("should parse exclusive range (1,5)", () => {
      const range = Range.parse("(1,5)", (v) => parseInt(v));

      expect(range.lowerBound).toBe(1);
      expect(range.upperBound).toBe(5);
      expect(range.isLowerBoundInclusive()).toBe(false);
      expect(range.isUpperBoundInclusive()).toBe(false);
    });

    it("should parse mixed range [1,5)", () => {
      const range = Range.parse("[1,5)", (v) => parseInt(v));

      expect(range.lowerBound).toBe(1);
      expect(range.upperBound).toBe(5);
      expect(range.isLowerBoundInclusive()).toBe(true);
      expect(range.isUpperBoundInclusive()).toBe(false);
    });

    it("should parse empty range", () => {
      const range = Range.parse("empty");

      expect(range.isEmpty()).toBe(true);
      expect(range.lowerBound).toBeNull();
      expect(range.upperBound).toBeNull();
    });

    it("should handle whitespace in range", () => {
      const range = Range.parse("[ 1 , 5 ]", (v) => parseInt(v.trim()));

      expect(range.lowerBound).toBe(1);
      expect(range.upperBound).toBe(5);
    });

    it("should throw error for invalid format", () => {
      expect(() => Range.parse("invalid")).toThrow("Invalid range format");
    });
  });

  describe("serialize", () => {
    it("should serialize inclusive range", () => {
      const range = new Range(
        1,
        5,
        LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
      );

      expect(Range.serialize(range)).toBe("[1,5]");
    });

    it("should serialize exclusive range", () => {
      const range = new Range(1, 5, 0);

      expect(Range.serialize(range)).toBe("(1,5)");
    });

    it("should serialize mixed range", () => {
      const range = new Range(1, 5, LOWER_BOUND_INCLUSIVE);

      expect(Range.serialize(range)).toBe("[1,5)");
    });

    it("should serialize empty range", () => {
      const range = new Range(null, null);

      expect(Range.serialize(range)).toBe("empty");
    });
  });

  describe("boundary checks", () => {
    it("should correctly identify empty range", () => {
      const range = new Range(null, null);

      expect(range.isEmpty()).toBe(true);
      expect(range.isBounded()).toBe(false);
    });

    it("should correctly identify bounded range", () => {
      const range = new Range(1, 5);

      expect(range.isEmpty()).toBe(false);
      expect(range.isBounded()).toBe(true);
    });

    it("should correctly identify partial bounds", () => {
      const lowerOnly = new Range(1, null);
      const upperOnly = new Range(null, 5);

      expect(lowerOnly.hasLowerBound()).toBe(true);
      expect(lowerOnly.hasUpperBound()).toBe(false);
      expect(upperOnly.hasLowerBound()).toBe(false);
      expect(upperOnly.hasUpperBound()).toBe(true);
    });
  });

  describe("contains", () => {
    it("should check if value is contained in inclusive range", () => {
      const range = new Range(
        1,
        5,
        LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
      );

      expect(range.contains(1)).toBe(true);
      expect(range.contains(3)).toBe(true);
      expect(range.contains(5)).toBe(true);
      expect(range.contains(0)).toBe(false);
      expect(range.contains(6)).toBe(false);
    });

    it("should check if value is contained in exclusive range", () => {
      const range = new Range(1, 5, 0);

      expect(range.contains(1)).toBe(false);
      expect(range.contains(3)).toBe(true);
      expect(range.contains(5)).toBe(false);
      expect(range.contains(0)).toBe(false);
      expect(range.contains(6)).toBe(false);
    });

    it("should return false for unbounded range", () => {
      const range = new Range<number>(null, null);
      expect(range.contains(1)).toBe(false);
    });
  });

  describe("containsRange", () => {
    it("should check if range contains another range", () => {
      const outer = new Range(
        1,
        10,
        LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
      );
      const inner = new Range(
        2,
        8,
        LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
      );

      expect(outer.containsRange(inner)).toBe(true);
      expect(inner.containsRange(outer)).toBe(false);
    });

    it("should handle boundary conditions", () => {
      const outer = new Range(
        1,
        10,
        LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
      );
      const exact = new Range(
        1,
        10,
        LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
      );

      expect(outer.containsRange(exact)).toBe(true);
    });

    it("should return false for unbounded ranges", () => {
      const bounded = new Range(
        1,
        10,
        LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
      );
      const unbounded = new Range<number>(null, null);

      expect(bounded.containsRange(unbounded)).toBe(false);
      expect(unbounded.containsRange(bounded)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return string representation", () => {
      const range = new Range(
        1,
        5,
        LOWER_BOUND_INCLUSIVE | UPPER_BOUND_INCLUSIVE
      );

      expect(range.toString()).toBe("[1,5]");
    });
  });
});
