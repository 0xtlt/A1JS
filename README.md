# A1JS

A TypeScript library for manipulating JavaScript tables using spreadsheet-style cell references (A1, B2, CZ10, etc.) with CSV export capabilities.

## Features

- 🔢 **Spreadsheet-style cell references**: Use familiar A1, B2, CZ10 notation
- 📊 **Easy data manipulation**: Get, set, and modify cell values intuitively
- 📄 **CSV export**: Convert your data to CSV format with customizable options
- 🚀 **TypeScript support**: Full type safety and IntelliSense support
- ✅ **Comprehensive validation**: Automatic validation of cell references
- 🧪 **Well tested**: Extensive test coverage

## Installation

```bash
npm install a1js
```

## Quick Start

```typescript
import { A1 } from "a1js";

// Create a new table with initial data
const table = new A1({
  A1: "Name",
  B1: "Age",
  C1: "City",
  A2: "John",
  B2: 25,
  C2: "Paris",
});

// Get values
console.log(table.getItem("A1")); // 'Name'
console.log(table.getItems("A1", "B1")); // { A1: 'Name', B1: 'Age' }

// Set values
table.setItem("A3", "Alice");
table.set({ B3: 30, C3: "London" });

// Export to CSV
console.log(table.toCSVString());
// Output: Name,Age,City
//         John,25,Paris
//         Alice,30,London
```

## API Reference

### Constructor

```typescript
// Empty table
const table = new A1();

// With initial data
const table = new A1({ A1: "value", B2: 42 });

// With options
const table = new A1({ data: { A1: "value", B2: 42 } });
```

### Setting Values

```typescript
// Set single value
table.setItem("A1", "Hello");
table.setItem("B2", 42);
table.setItem("CZ10", "Far column");

// Set multiple values
table.set({
  A1: "Name",
  B1: "Age",
  C1: "City",
});
```

### Creating from CSV

```typescript
// Create table from CSV string
const csvData = "Name,Age,City\nJohn,25,Paris\nAlice,30,London";
const table = A1.fromCSVString(csvData);

// Create with options
const tableWithHeaders = A1.fromCSVString(csvData, {
  hasHeaders: true, // Skip first row as headers
  separator: ",", // Default: ','
  startRow: 1, // Default: 1
  startColumn: "A", // Default: 'A'
});

// Load CSV into existing table
const existingTable = new A1();
existingTable.loadFromCSVString(csvData, { hasHeaders: true });
```

### Getting Values

```typescript
// Get single value
const value = table.getItem("A1");

// Get multiple values
const values = table.getItems("A1", "B1", "C1");
// Returns: { A1: '...', B1: '...', C1: '...' }

// Get all data (copy)
const allData = table.getAllData();

// Get raw data (direct reference)
const rawData = table.getRawData();
```

### Data Management

```typescript
// Remove a cell
table.removeItem("A1");

// Clear all data
table.clear();

// Check if empty
table.isEmpty(); // boolean

// Get size
table.size(); // number of non-empty cells

// Get all cell references
table.getCellReferences(); // ['A1', 'B2', ...]
```

### Data Access Methods

```typescript
// Get data as 2D array (starts from column A by default)
const array = table.toArray();
// Returns: [['value1', 'value2'], ['value3', 'value4']]

// Get data as 2D array starting from first used column
const compactArray = table.toArray(false);

// Get data as array of [cellRef, value] pairs
const pairs = table.toCompactArray();
// Returns: [['A1', 'value1'], ['B1', 'value2']]

// Get data grouped by rows with metadata
const rowBased = table.toRowBasedArray();
// Returns: [
//   {
//     row: 1,
//     cells: [
//       { column: "A", value: "value1" },
//       { column: "B", value: "value2" }
//     ]
//   }
// ]
```

### Export Options

```typescript
// Convert to CSV string
table.toCSVString();

// With options
table.toCSVString({
  separator: ";", // Default: ','
  includeHeaders: true, // Default: false
  lineEnding: "\r\n", // Default: '\n'
  startFromColumnA: true, // Default: true - start from column A
});

// CSV starting from first used column (more compact)
table.toCSVString({ startFromColumnA: false });
```

## Cell Reference Format

A1JS uses standard spreadsheet cell references:

- **Columns**: A, B, C, ..., Z, AA, AB, ..., AZ, BA, ..., ZZ, AAA, ...
- **Rows**: 1, 2, 3, ... (starting from 1)
- **Examples**: `A1`, `B2`, `Z26`, `AA27`, `CZ104`

### Valid Cell References

```typescript
"A1"; // ✅ Valid
"B2"; // ✅ Valid
"Z26"; // ✅ Valid
"AA27"; // ✅ Valid
"CZ104"; // ✅ Valid

"A0"; // ❌ Invalid (row must be >= 1)
"1A"; // ❌ Invalid (wrong format)
"A"; // ❌ Invalid (missing row)
"123"; // ❌ Invalid (missing column)
```

## CSV Export Features

### Basic Export

```typescript
const table = new A1({
  A1: "Name",
  B1: "Age",
  A2: "John",
  B2: 25,
});

console.log(table.toCSVString());
// Output: Name,Age
//         John,25
```

### Handling Special Characters

```typescript
const table = new A1({
  A1: "Text with, comma",
  B1: 'Text with "quotes"',
  C1: "Text with\nnewline",
});

console.log(table.toCSVString());
// Output: "Text with, comma","Text with ""quotes""","Text with
//         newline"
```

### Custom Options

```typescript
// Custom separator and headers
table.toCSVString({
  separator: ";",
  includeHeaders: true,
  lineEnding: "\r\n",
});
```

### Column Behavior with Large References

When using large column references (e.g., AA1, CZ10), A1JS handles them intelligently:

```typescript
const table = new A1({ AA1: "Column AA", AB1: "Column AB" });

// By default, CSV starts from column A (includes empty A-Z columns)
table.toCSVString();
// Output: ,,,,,,,,,,,,,,,,,,,,,,,,,,Column AA,Column AB

// Compact mode starts from first used column
table.toCSVString({ startFromColumnA: false });
// Output: Column AA,Column AB
```

### Bidirectional CSV Operations

A1JS provides seamless conversion between table data and CSV format:

```typescript
// Create table from data
const original = new A1({
  A1: "Product",
  B1: "Price",
  C1: "Description",
  A2: "Apple",
  B2: 1.5,
  C2: "Fresh, red apple",
});

// Export to CSV
const csvString = original.toCSVString({ includeHeaders: true });
console.log(csvString);
// Output: A,B,C
//         Product,Price,Description
//         Apple,1.5,Fresh, red apple

// Import back from CSV
const restored = A1.fromCSVString(csvString, { hasHeaders: true });
console.log(restored.getAllData());
// Same data as original!

// Handle complex values (commas, quotes, newlines)
const complex = new A1({
  A1: "Name with, comma",
  B1: 'Quote: "Hello World"',
  C1: "Multi\nline\ntext",
});

const complexCsv = complex.toCSVString();
console.log(complexCsv);
// Output: "Name with, comma","Quote: ""Hello World""","Multi
//         line
//         text"

// Perfect round-trip preservation
const complexRestored = A1.fromCSVString(complexCsv);
// All special characters preserved!
```

## Advanced Usage

### Working with Large Tables

```typescript
const table = new A1();

// Create a multiplication table
for (let row = 1; row <= 10; row++) {
  for (let col = 1; col <= 10; col++) {
    const cellRef = String.fromCharCode(64 + col) + row;
    table.setItem(cellRef, row * col);
  }
}

console.log(table.toCSVString());
```

### Data Validation

```typescript
try {
  table.setItem("invalid", "value"); // Throws error
} catch (error) {
  console.error("Invalid cell reference:", error.message);
}
```

### Sparse Data Handling

```typescript
const table = new A1({
  A1: "value1",
  C3: "value2", // Gaps are filled with null/empty values
  E1: "value3",
});

const array = table.toArray();
// Returns: [
//   ['value1', null, null, null, 'value3'],
//   [null, null, null, null, null],
//   [null, null, 'value2', null, null]
// ]
```

### Choosing the Right Data Access Method

A1JS provides multiple ways to access your data depending on your needs:

| Method                | Use Case                                  | Output Format                                          |
| --------------------- | ----------------------------------------- | ------------------------------------------------------ |
| `getAllData()`        | Safe access to all data (copy)            | `{ A1: 'value', B1: 'value' }`                         |
| `getRawData()`        | Direct access for performance (reference) | `{ A1: 'value', B1: 'value' }`                         |
| `toArray()`           | Standard 2D array with all columns        | `[['value', null, 'value']]`                           |
| `toArray(false)`      | Compact 2D array (no empty columns)       | `[['value', 'value']]`                                 |
| `toCompactArray()`    | List of non-empty cells                   | `[['A1', 'value'], ['C1', 'value']]`                   |
| `toRowBasedArray()`   | Structured data with metadata             | `[{ row: 1, cells: [{ column: 'A', value: 'val' }] }]` |
| `toCSVString()`       | Export to CSV format                      | `"value,,value"`                                       |
| `A1.fromCSVString()`  | Create table from CSV                     | New A1 instance                                        |
| `loadFromCSVString()` | Load CSV into existing table              | Updates current instance                               |

**Performance tip:** Use `getRawData()` for read-only operations when you need maximum performance, but be careful not to modify the returned object.

**CSV tip:** Use `fromCSVString()` to create new tables and `loadFromCSVString()` to replace data in existing tables.

## Types

```typescript
import {
  CellReference,
  CellData,
  CSVOptions,
  CSVImportOptions,
  A1Options,
} from "a1js";

type CellReference = string;
type CellData = Record<CellReference, unknown>;

interface CSVOptions {
  separator?: string;
  includeHeaders?: boolean;
  lineEnding?: string;
  startFromColumnA?: boolean;
}

interface CSVImportOptions {
  separator?: string;
  hasHeaders?: boolean;
  startRow?: number;
  startColumn?: string;
}

interface A1Options {
  data?: CellData;
}
```

## Error Handling

A1JS throws descriptive errors for invalid operations:

```typescript
// Invalid cell reference format
table.setItem("invalid", "value");
// Error: Invalid cell reference: invalid

// Invalid row number
table.setItem("A0", "value");
// Error: Invalid row number: 0. Row numbers must be >= 1
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## License

MIT © Thomas Tastet

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
