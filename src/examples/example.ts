import { A1 } from "../A1";

/**
 * Basic usage example for A1JS library
 */
function basicExample() {
  console.log("=== Basic A1JS Example ===");

  // Create a new table with initial data
  const table = new A1({
    A1: "Name",
    B1: "Age",
    C1: "City",
    A2: "John",
    B2: 25,
    C2: "Paris",
    A3: "Alice",
    B3: 30,
    C3: "London",
  });

  console.log("Table size:", table.size());
  console.log("Is empty:", table.isEmpty());

  // Get specific items
  console.log("A1 value:", table.getItem("A1"));
  console.log("Multiple items:", table.getItems("A1", "B1", "C1"));

  // Add new data
  table.setItem("A4", "Bob");
  table.setItem("B4", 35);
  table.setItem("C4", "Berlin");

  // Set multiple values at once
  table.set({
    A5: "Charlie",
    B5: 28,
    C5: "Madrid",
  });

  // Convert to CSV
  console.log("\nCSV Output:");
  console.log(table.toCSVString());

  console.log("\nCSV with headers:");
  console.log(table.toCSVString({ includeHeaders: true }));

  console.log("\nCSV with semicolon separator:");
  console.log(table.toCSVString({ separator: ";" }));

  // Convert to array
  console.log("\nArray representation:");
  console.log(table.toArray());

  // Get all cell references
  console.log("\nAll cell references:", table.getCellReferences());
}

/**
 * Advanced usage example
 */
function advancedExample() {
  console.log("\n=== Advanced A1JS Example ===");

  // Create empty table and populate it
  const table = new A1();

  // Create a multiplication table
  for (let row = 1; row <= 5; row++) {
    for (let col = 1; col <= 5; col++) {
      const cellRef = String.fromCharCode(64 + col) + row; // A1, B1, C1, etc.
      table.setItem(cellRef, row * col);
    }
  }

  console.log("Multiplication table (5x5):");
  console.log(table.toCSVString());

  // Work with specific ranges
  console.log("\nFirst row:", table.getItems("A1", "B1", "C1", "D1", "E1"));
  console.log("First column:", table.getItems("A1", "A2", "A3", "A4", "A5"));

  // Handle large column references
  const largeTable = new A1({
    AA1: "Column AA",
    AB1: "Column AB",
    CZ1: "Column CZ",
    AA2: "Data 1",
    AB2: "Data 2",
    CZ2: "Data 3",
  });

  console.log("\nLarge table with extended columns:");
  console.log(largeTable.toCSVString());
}

/**
 * CSV handling example
 */
function csvExample() {
  console.log("\n=== CSV Handling Example ===");

  const table = new A1({
    A1: "Product",
    B1: "Price",
    C1: "Description",
    A2: "Apple",
    B2: 1.5,
    C2: "Fresh, red apple",
    A3: "Banana",
    B3: 0.75,
    C3: "Ripe, yellow banana",
    A4: 'Orange, "Premium"',
    B4: 2.0,
    C4: "Sweet orange, contains vitamin C",
  });

  console.log("Products table:");
  console.log(table.toCSVString({ includeHeaders: true }));

  // Show how special characters are handled
  const specialTable = new A1({
    A1: "Text with, comma",
    B1: 'Text with "quotes"',
    C1: "Text with\nnewline",
    A2: null,
    B2: undefined,
    C2: "",
  });

  console.log("\nSpecial characters handling:");
  console.log(specialTable.toCSVString());
}

// Run examples
if (require.main === module) {
  basicExample();
  advancedExample();
  csvExample();
}
