import { A1 } from "../A1.js";

describe("A1", () => {
  describe("Constructor", () => {
    it("should create an empty A1 instance", () => {
      const table = new A1();
      expect(table.isEmpty()).toBe(true);
      expect(table.size()).toBe(0);
    });

    it("should create A1 instance with initial data", () => {
      const table = new A1({ A1: 10, B2: "hello", CZ10: "world" });
      expect(table.size()).toBe(3);
      expect(table.getItem("A1")).toBe(10);
      expect(table.getItem("B2")).toBe("hello");
      expect(table.getItem("CZ10")).toBe("world");
    });

    it("should create A1 instance with options format", () => {
      const table = new A1({ data: { A1: "test", B1: 42 } });
      expect(table.size()).toBe(2);
      expect(table.getItem("A1")).toBe("test");
      expect(table.getItem("B1")).toBe(42);
    });

    it("should throw error for invalid cell references", () => {
      expect(() => new A1({ invalid: "value" })).toThrow(
        "Invalid cell reference"
      );
      expect(() => new A1({ A0: "value" })).toThrow("Invalid cell reference");
    });
  });

  describe("setItem", () => {
    it("should set a single cell value", () => {
      const table = new A1();
      table.setItem("A1", 42);
      expect(table.getItem("A1")).toBe(42);
    });

    it("should throw error for invalid cell reference", () => {
      const table = new A1();
      expect(() => table.setItem("invalid", 42)).toThrow(
        "Invalid cell reference"
      );
    });
  });

  describe("getItem", () => {
    it("should get a single cell value", () => {
      const table = new A1({ A1: "test" });
      expect(table.getItem("A1")).toBe("test");
    });

    it("should return undefined for non-existent cell", () => {
      const table = new A1();
      expect(table.getItem("A1")).toBeUndefined();
    });

    it("should throw error for invalid cell reference", () => {
      const table = new A1();
      expect(() => table.getItem("invalid")).toThrow("Invalid cell reference");
    });
  });

  describe("set", () => {
    it("should set multiple cell values", () => {
      const table = new A1();
      table.set({ A1: 10, B2: "hello", CZ10: "world" });

      expect(table.getItem("A1")).toBe(10);
      expect(table.getItem("B2")).toBe("hello");
      expect(table.getItem("CZ10")).toBe("world");
    });

    it("should throw error for invalid cell references", () => {
      const table = new A1();
      expect(() => table.set({ invalid: "value" })).toThrow(
        "Invalid cell reference"
      );
    });
  });

  describe("getItems", () => {
    it("should get multiple cell values", () => {
      const table = new A1({ A1: 10, B2: "hello", C3: "world" });
      const result = table.getItems("A1", "B2");

      expect(result).toEqual({ A1: 10, B2: "hello" });
    });

    it("should return undefined for non-existent cells", () => {
      const table = new A1({ A1: 10 });
      const result = table.getItems("A1", "B2");

      expect(result).toEqual({ A1: 10, B2: undefined });
    });

    it("should throw error for invalid cell references", () => {
      const table = new A1();
      expect(() => table.getItems("A1", "invalid")).toThrow(
        "Invalid cell reference"
      );
    });
  });

  describe("removeItem", () => {
    it("should remove a cell value", () => {
      const table = new A1({ A1: "test", B1: "keep" });
      table.removeItem("A1");

      expect(table.getItem("A1")).toBeUndefined();
      expect(table.getItem("B1")).toBe("keep");
      expect(table.size()).toBe(1);
    });

    it("should throw error for invalid cell reference", () => {
      const table = new A1();
      expect(() => table.removeItem("invalid")).toThrow(
        "Invalid cell reference"
      );
    });
  });

  describe("clear", () => {
    it("should clear all data", () => {
      const table = new A1({ A1: "test", B1: "test2" });
      table.clear();

      expect(table.isEmpty()).toBe(true);
      expect(table.size()).toBe(0);
    });
  });

  describe("getAllData", () => {
    it("should return copy of all data", () => {
      const table = new A1({ A1: "test", B1: "test2" });
      const data = table.getAllData();

      expect(data).toEqual({ A1: "test", B1: "test2" });

      // Verify it's a copy
      data.A1 = "modified";
      expect(table.getItem("A1")).toBe("test");
    });
  });

  describe("getRawData", () => {
    it("should return direct reference to internal data", () => {
      const table = new A1({ A1: "test", B1: "test2" });
      const rawData = table.getRawData();

      expect(rawData).toEqual({ A1: "test", B1: "test2" });

      // Verify it's a direct reference (not a copy)
      rawData.A1 = "modified";
      expect(table.getItem("A1")).toBe("modified");
    });
  });

  describe("toCompactArray", () => {
    it("should return array of [cellRef, value] pairs", () => {
      const table = new A1({ A1: "test", B2: 42, C3: "hello" });
      const compact = table.toCompactArray();

      expect(compact).toEqual([
        ["A1", "test"],
        ["B2", 42],
        ["C3", "hello"],
      ]);
    });

    it("should return empty array for empty table", () => {
      const table = new A1();
      const compact = table.toCompactArray();

      expect(compact).toEqual([]);
    });
  });

  describe("toRowBasedArray", () => {
    it("should group cells by rows", () => {
      const table = new A1({
        A1: "Name",
        B1: "Age",
        A2: "John",
        B2: 25,
        C2: "Developer",
      });
      const rowBased = table.toRowBasedArray();

      expect(rowBased).toEqual([
        {
          row: 1,
          cells: [
            { column: "A", value: "Name" },
            { column: "B", value: "Age" },
          ],
        },
        {
          row: 2,
          cells: [
            { column: "A", value: "John" },
            { column: "B", value: 25 },
            { column: "C", value: "Developer" },
          ],
        },
      ]);
    });

    it("should sort cells by column within each row", () => {
      const table = new A1({
        C1: "third",
        A1: "first",
        B1: "second",
      });
      const rowBased = table.toRowBasedArray();

      expect(rowBased[0].cells).toEqual([
        { column: "A", value: "first" },
        { column: "B", value: "second" },
        { column: "C", value: "third" },
      ]);
    });

    it("should return empty array for empty table", () => {
      const table = new A1();
      const rowBased = table.toRowBasedArray();

      expect(rowBased).toEqual([]);
    });
  });

  describe("getCellReferences", () => {
    it("should return all cell references", () => {
      const table = new A1({ A1: "test", B1: "test2", Z26: "test3" });
      const refs = table.getCellReferences();

      expect(refs).toEqual(["A1", "B1", "Z26"]);
    });
  });

  describe("toArray", () => {
    it("should convert to 2D array", () => {
      const table = new A1({ A1: "a", B1: "b", A2: "c", B2: "d" });
      const array = table.toArray();

      expect(array).toEqual([
        ["a", "b"],
        ["c", "d"],
      ]);
    });

    it("should handle sparse data", () => {
      const table = new A1({ A1: "a", C2: "c" });
      const array = table.toArray();

      expect(array).toEqual([
        ["a", null, null],
        [null, null, "c"],
      ]);
    });

    it("should return empty array for empty table", () => {
      const table = new A1();
      const array = table.toArray();

      expect(array).toEqual([]);
    });

    it("should start from column A by default", () => {
      const table = new A1({ C1: "c", E1: "e" });
      const array = table.toArray();

      expect(array).toEqual([[null, null, "c", null, "e"]]);
    });

    it("should start from first used column when parameter is false", () => {
      const table = new A1({ C1: "c", E1: "e" });
      const array = table.toArray(false);

      expect(array).toEqual([["c", null, "e"]]);
    });
  });

  describe("toCSVString", () => {
    it("should convert to CSV string", () => {
      const table = new A1({ A1: "a", B1: "b", A2: "c", B2: "d" });
      const csv = table.toCSVString();

      expect(csv).toBe("a,b\nc,d");
    });

    it("should handle custom separator", () => {
      const table = new A1({ A1: "a", B1: "b" });
      const csv = table.toCSVString({ separator: ";" });

      expect(csv).toBe("a;b");
    });

    it("should handle values with commas", () => {
      const table = new A1({ A1: "hello, world", B1: "test" });
      const csv = table.toCSVString();

      expect(csv).toBe('"hello, world",test');
    });

    it("should handle values with quotes", () => {
      const table = new A1({ A1: 'say "hello"', B1: "test" });
      const csv = table.toCSVString();

      expect(csv).toBe('"say ""hello""",test');
    });

    it("should handle null and undefined values", () => {
      const table = new A1({ A1: null, B1: undefined, C1: "test" });
      const csv = table.toCSVString();

      expect(csv).toBe(",,test");
    });

    it("should return empty string for empty table", () => {
      const table = new A1();
      const csv = table.toCSVString();

      expect(csv).toBe("");
    });

    it("should include headers when requested", () => {
      const table = new A1({ A1: "a", B1: "b" });
      const csv = table.toCSVString({ includeHeaders: true });

      expect(csv).toBe("A,B\na,b");
    });

    it("should start from column A by default", () => {
      const table = new A1({ C1: "c", E1: "e" });
      const csv = table.toCSVString();

      expect(csv).toBe(",,c,,e");
    });

    it("should start from first used column when startFromColumnA is false", () => {
      const table = new A1({ C1: "c", E1: "e" });
      const csv = table.toCSVString({ startFromColumnA: false });

      expect(csv).toBe("c,,e");
    });

    it("should handle large column references correctly", () => {
      const table = new A1({ AA1: "aa", AB1: "ab" });
      const csv = table.toCSVString();

      // Should have 26 empty columns (A-Z) + 1 separator between AA and AB = 27 commas
      const expectedCommas = 27;
      const actualCommas = (csv.match(/,/g) || []).length;
      expect(actualCommas).toBe(expectedCommas);
      expect(csv).toBe(",,,,,,,,,,,,,,,,,,,,,,,,,,aa,ab");
    });
  });

  describe("size and isEmpty", () => {
    it("should return correct size", () => {
      const table = new A1();
      expect(table.size()).toBe(0);

      table.setItem("A1", "test");
      expect(table.size()).toBe(1);

      table.setItem("B1", "test2");
      expect(table.size()).toBe(2);
    });

    it("should return correct isEmpty status", () => {
      const table = new A1();
      expect(table.isEmpty()).toBe(true);

      table.setItem("A1", "test");
      expect(table.isEmpty()).toBe(false);

      table.clear();
      expect(table.isEmpty()).toBe(true);
    });
  });

  describe("fromCSVString", () => {
    it("should create table from basic CSV string", () => {
      const csv = "Name,Age,City\nJohn,25,Paris\nAlice,30,London";
      const table = A1.fromCSVString(csv);

      expect(table.getItem("A1")).toBe("Name");
      expect(table.getItem("B1")).toBe("Age");
      expect(table.getItem("C1")).toBe("City");
      expect(table.getItem("A2")).toBe("John");
      expect(table.getItem("B2")).toBe(25);
      expect(table.getItem("C2")).toBe("Paris");
      expect(table.size()).toBe(9);
    });

    it("should handle CSV with headers option", () => {
      const csv = "Name,Age,City\nJohn,25,Paris\nAlice,30,London";
      const table = A1.fromCSVString(csv, { hasHeaders: true });

      expect(table.getItem("A1")).toBe("John");
      expect(table.getItem("B1")).toBe(25);
      expect(table.getItem("C1")).toBe("Paris");
      expect(table.getItem("A2")).toBe("Alice");
      expect(table.size()).toBe(6);
    });

    it("should handle CSV with custom separator", () => {
      const csv = "Name;Age;City\nJohn;25;Paris";
      const table = A1.fromCSVString(csv, { separator: ";" });

      expect(table.getItem("A1")).toBe("Name");
      expect(table.getItem("B1")).toBe("Age");
      expect(table.getItem("C1")).toBe("City");
      expect(table.getItem("A2")).toBe("John");
    });

    it("should handle CSV with quoted values containing commas", () => {
      const csv = 'Name,Description\n"John Doe","Age: 25, City: Paris"';
      const table = A1.fromCSVString(csv, { hasHeaders: true });

      expect(table.getItem("A1")).toBe("John Doe");
      expect(table.getItem("B1")).toBe("Age: 25, City: Paris");
    });

    it("should handle CSV with quoted values containing quotes", () => {
      const csv = 'Name,Quote\n"John","He said ""Hello"" to me"';
      const table = A1.fromCSVString(csv, { hasHeaders: true });

      expect(table.getItem("A1")).toBe("John");
      expect(table.getItem("B1")).toBe('He said "Hello" to me');
    });

    it("should handle empty CSV string", () => {
      const table = A1.fromCSVString("");
      expect(table.isEmpty()).toBe(true);
    });

    it("should handle CSV with custom start position", () => {
      const csv = "Value1,Value2\nValue3,Value4";
      const table = A1.fromCSVString(csv, {
        startRow: 5,
        startColumn: "C",
      });

      expect(table.getItem("C5")).toBe("Value1");
      expect(table.getItem("D5")).toBe("Value2");
      expect(table.getItem("C6")).toBe("Value3");
      expect(table.getItem("D6")).toBe("Value4");
    });

    it("should parse numbers and booleans correctly", () => {
      const csv = "Number,Boolean,String\n42,true,hello\n3.14,false,world";
      const table = A1.fromCSVString(csv, { hasHeaders: true });

      expect(table.getItem("A1")).toBe(42);
      expect(table.getItem("B1")).toBe(true);
      expect(table.getItem("C1")).toBe("hello");
      expect(table.getItem("A2")).toBe(3.14);
      expect(table.getItem("B2")).toBe(false);
      expect(table.getItem("C2")).toBe("world");
    });

    it("should be bidirectional with toCSVString", () => {
      const original = new A1({
        A1: "Name",
        B1: "Age",
        A2: "John",
        B2: 25,
      });

      const csv = original.toCSVString();
      const restored = A1.fromCSVString(csv);

      expect(restored.getAllData()).toEqual(original.getAllData());
    });
  });

  describe("loadFromCSVString", () => {
    it("should load data into existing table", () => {
      const table = new A1({ Z1: "existing" });
      const csv = "A,B\nC,D";

      table.loadFromCSVString(csv);

      expect(table.getItem("A1")).toBe("A");
      expect(table.getItem("B1")).toBe("B");
      expect(table.getItem("A2")).toBe("C");
      expect(table.getItem("B2")).toBe("D");
      expect(table.getItem("Z1")).toBeUndefined(); // Should be cleared
    });

    it("should handle empty values as null", () => {
      const csv = "A,,C\n,B,";
      const table = new A1();
      table.loadFromCSVString(csv);

      expect(table.getItem("A1")).toBe("A");
      expect(table.getItem("B1")).toBeUndefined(); // Empty string becomes null, not stored
      expect(table.getItem("C1")).toBe("C");
      expect(table.getItem("A2")).toBeUndefined();
      expect(table.getItem("B2")).toBe("B");
      expect(table.getItem("C2")).toBeUndefined();
    });
  });
});
