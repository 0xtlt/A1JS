import {
  columnLetterToNumber,
  columnNumberToLetter,
  escapeCsvValue,
  isValidCellReference,
  parseCellReference,
  parseCsvString,
  parseValue,
  positionToCellReference,
} from "../utils.js";

describe("Utils", () => {
  describe("columnLetterToNumber", () => {
    it("should convert single letters correctly", () => {
      expect(columnLetterToNumber("A")).toBe(1);
      expect(columnLetterToNumber("B")).toBe(2);
      expect(columnLetterToNumber("Z")).toBe(26);
    });

    it("should convert multiple letters correctly", () => {
      expect(columnLetterToNumber("AA")).toBe(27);
      expect(columnLetterToNumber("AB")).toBe(28);
      expect(columnLetterToNumber("CZ")).toBe(104);
    });
  });

  describe("columnNumberToLetter", () => {
    it("should convert single digits correctly", () => {
      expect(columnNumberToLetter(1)).toBe("A");
      expect(columnNumberToLetter(2)).toBe("B");
      expect(columnNumberToLetter(26)).toBe("Z");
    });

    it("should convert multiple digits correctly", () => {
      expect(columnNumberToLetter(27)).toBe("AA");
      expect(columnNumberToLetter(28)).toBe("AB");
      expect(columnNumberToLetter(104)).toBe("CZ");
    });
  });

  describe("parseCellReference", () => {
    it("should parse valid cell references", () => {
      expect(parseCellReference("A1")).toEqual({ row: 1, column: 1 });
      expect(parseCellReference("B2")).toEqual({ row: 2, column: 2 });
      expect(parseCellReference("Z26")).toEqual({ row: 26, column: 26 });
      expect(parseCellReference("AA27")).toEqual({ row: 27, column: 27 });
      expect(parseCellReference("CZ104")).toEqual({ row: 104, column: 104 });
    });

    it("should throw error for invalid cell references", () => {
      expect(() => parseCellReference("invalid")).toThrow(
        "Invalid cell reference"
      );
      expect(() => parseCellReference("A")).toThrow("Invalid cell reference");
      expect(() => parseCellReference("1")).toThrow("Invalid cell reference");
      expect(() => parseCellReference("A0")).toThrow("Invalid row number");
    });
  });

  describe("positionToCellReference", () => {
    it("should convert positions to cell references", () => {
      expect(positionToCellReference({ row: 1, column: 1 })).toBe("A1");
      expect(positionToCellReference({ row: 2, column: 2 })).toBe("B2");
      expect(positionToCellReference({ row: 26, column: 26 })).toBe("Z26");
      expect(positionToCellReference({ row: 27, column: 27 })).toBe("AA27");
    });

    it("should throw error for invalid positions", () => {
      expect(() => positionToCellReference({ row: 0, column: 1 })).toThrow(
        "Row and column numbers must be >= 1"
      );
      expect(() => positionToCellReference({ row: 1, column: 0 })).toThrow(
        "Row and column numbers must be >= 1"
      );
    });
  });

  describe("isValidCellReference", () => {
    it("should validate correct cell references", () => {
      expect(isValidCellReference("A1")).toBe(true);
      expect(isValidCellReference("B2")).toBe(true);
      expect(isValidCellReference("Z26")).toBe(true);
      expect(isValidCellReference("AA27")).toBe(true);
      expect(isValidCellReference("CZ104")).toBe(true);
    });

    it("should reject invalid cell references", () => {
      expect(isValidCellReference("invalid")).toBe(false);
      expect(isValidCellReference("A")).toBe(false);
      expect(isValidCellReference("1")).toBe(false);
      expect(isValidCellReference("A0")).toBe(false);
      expect(isValidCellReference("")).toBe(false);
    });
  });

  describe("escapeCsvValue", () => {
    it("should return empty string for null/undefined", () => {
      expect(escapeCsvValue(null)).toBe("");
      expect(escapeCsvValue(undefined)).toBe("");
    });

    it("should return string as-is for simple values", () => {
      expect(escapeCsvValue("hello")).toBe("hello");
      expect(escapeCsvValue("123")).toBe("123");
      expect(escapeCsvValue(42)).toBe("42");
    });

    it("should escape values with commas", () => {
      expect(escapeCsvValue("hello, world")).toBe('"hello, world"');
    });

    it("should escape values with quotes", () => {
      expect(escapeCsvValue('say "hello"')).toBe('"say ""hello"""');
    });

    it("should escape values with newlines", () => {
      expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
      expect(escapeCsvValue("line1\r\nline2")).toBe('"line1\r\nline2"');
    });
  });

  describe("parseCsvString", () => {
    it("should parse simple CSV", () => {
      const csv = "A,B,C\n1,2,3";
      const result = parseCsvString(csv);

      expect(result).toEqual([
        ["A", "B", "C"],
        ["1", "2", "3"],
      ]);
    });

    it("should handle quoted values with commas", () => {
      const csv = 'Name,Description\n"John Doe","Age: 25, City: Paris"';
      const result = parseCsvString(csv);

      expect(result).toEqual([
        ["Name", "Description"],
        ["John Doe", "Age: 25, City: Paris"],
      ]);
    });

    it("should handle escaped quotes", () => {
      const csv = 'Name,Quote\n"John","He said ""Hello"" to me"';
      const result = parseCsvString(csv);

      expect(result).toEqual([
        ["Name", "Quote"],
        ["John", 'He said "Hello" to me'],
      ]);
    });

    it("should handle custom separator", () => {
      const csv = "A;B;C\n1;2;3";
      const result = parseCsvString(csv, ";");

      expect(result).toEqual([
        ["A", "B", "C"],
        ["1", "2", "3"],
      ]);
    });

    it("should handle empty lines", () => {
      const csv = "A,B\n\n1,2\n\n3,4";
      const result = parseCsvString(csv);

      expect(result).toEqual([
        ["A", "B"],
        ["1", "2"],
        ["3", "4"],
      ]);
    });

    it("should handle empty CSV string", () => {
      const result = parseCsvString("");
      expect(result).toEqual([]);
    });

    it("should handle whitespace-only CSV", () => {
      const result = parseCsvString("   \n  \n  ");
      expect(result).toEqual([]);
    });
  });

  describe("parseValue", () => {
    it("should parse numbers", () => {
      expect(parseValue("42")).toBe(42);
      expect(parseValue("3.14")).toBe(3.14);
      expect(parseValue("-10")).toBe(-10);
      expect(parseValue("0")).toBe(0);
    });

    it("should parse booleans", () => {
      expect(parseValue("true")).toBe(true);
      expect(parseValue("false")).toBe(false);
      expect(parseValue("TRUE")).toBe(true);
      expect(parseValue("FALSE")).toBe(false);
      expect(parseValue("True")).toBe(true);
      expect(parseValue("False")).toBe(false);
    });

    it("should parse empty string as null", () => {
      expect(parseValue("")).toBe(null);
    });

    it("should keep strings as strings", () => {
      expect(parseValue("hello")).toBe("hello");
      expect(parseValue("hello world")).toBe("hello world");
      expect(parseValue("42abc")).toBe("42abc");
      expect(parseValue("not_a_number")).toBe("not_a_number");
    });

    it("should handle edge cases", () => {
      expect(parseValue("NaN")).toBe("NaN");
      expect(parseValue("Infinity")).toBe("Infinity");
      expect(parseValue("null")).toBe("null");
      expect(parseValue("undefined")).toBe("undefined");
    });
  });
});
