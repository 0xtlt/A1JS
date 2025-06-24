import { CellPosition, CellReference } from "./types.js";

/**
 * Converts a column letter(s) to a column number (A=1, B=2, ..., Z=26, AA=27, etc.)
 */
export function columnLetterToNumber(letter: string): number {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - "A".charCodeAt(0) + 1);
  }
  return result;
}

/**
 * Converts a column number to column letter(s) (1=A, 2=B, ..., 26=Z, 27=AA, etc.)
 */
export function columnNumberToLetter(num: number): string {
  let result = "";
  while (num > 0) {
    num--;
    result = String.fromCharCode("A".charCodeAt(0) + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

/**
 * Parses a cell reference (e.g., "A1", "CZ10") into row and column coordinates
 */
export function parseCellReference(cellRef: CellReference): CellPosition {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell reference: ${cellRef}`);
  }

  const [, columnStr, rowStr] = match;
  const column = columnLetterToNumber(columnStr);
  const row = parseInt(rowStr, 10);

  if (row < 1) {
    throw new Error(`Invalid row number: ${row}. Row numbers must be >= 1`);
  }

  return { row, column };
}

/**
 * Converts row and column coordinates to a cell reference
 */
export function positionToCellReference(position: CellPosition): CellReference {
  if (position.row < 1 || position.column < 1) {
    throw new Error("Row and column numbers must be >= 1");
  }

  const columnLetter = columnNumberToLetter(position.column);
  return `${columnLetter}${position.row}`;
}

/**
 * Validates if a string is a valid cell reference
 */
export function isValidCellReference(cellRef: string): boolean {
  try {
    parseCellReference(cellRef);
    return true;
  } catch {
    return false;
  }
}

/**
 * Escapes a value for CSV format
 */
export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Parses a CSV string into a 2D array of values
 * @param csvString - The CSV string to parse
 * @param separator - The separator character (default: ',')
 * @returns 2D array of parsed values
 */
export function parseCsvString(
  csvString: string,
  separator: string = ","
): string[][] {
  if (!csvString.trim()) {
    return [];
  }

  const result: string[][] = [];
  const lines = csvString.split(/\r?\n/);

  for (const line of lines) {
    if (line.trim() === "") {
      continue; // Skip empty lines
    }

    const row = parseCsvLine(line, separator);
    result.push(row);
  }

  return result;
}

/**
 * Parses a single CSV line into an array of values
 * @param line - The CSV line to parse
 * @param separator - The separator character
 * @returns Array of parsed values
 */
function parseCsvLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote inside quoted value
        current += '"';
        i += 2;
      } else {
        // Start or end of quoted value
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === separator && !inQuotes) {
      // Field separator outside quotes
      result.push(current);
      current = "";
      i++;
    } else {
      // Regular character
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

/**
 * Converts a parsed value to appropriate type (string, number, boolean, null)
 * @param value - The string value to convert
 * @returns Converted value
 */
export function parseValue(value: string): unknown {
  // Empty string becomes null
  if (value === "") {
    return null;
  }

  // Try to parse as number
  if (/^-?\d+\.?\d*$/.test(value)) {
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }
  }

  // Try to parse as boolean
  const lower = value.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;

  // Return as string
  return value;
}
