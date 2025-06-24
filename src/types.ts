/**
 * Represents a cell reference in spreadsheet notation (e.g., A1, B2, CZ10)
 */
export type CellReference = string;

/**
 * Represents the data structure for storing cell values
 * Key is the cell reference, value is the cell content
 */
export type CellData = Record<CellReference, unknown>;

/**
 * Configuration options for A1JS initialization
 */
export interface A1Options {
  /** Initial cell data */
  data?: CellData;
}

/**
 * Represents a coordinate position (row, column) in the spreadsheet
 */
export interface CellPosition {
  row: number;
  column: number;
}

/**
 * CSV export options
 */
export interface CSVOptions {
  /** Separator character for CSV (default: ',') */
  separator?: string;
  /** Include headers in CSV export */
  includeHeaders?: boolean;
  /** Custom line ending (default: '\n') */
  lineEnding?: string;
  /** Start from column A instead of first used column (default: true) */
  startFromColumnA?: boolean;
}

/**
 * CSV import options
 */
export interface CSVImportOptions {
  /** Separator character for CSV (default: ',') */
  separator?: string;
  /** First row contains headers (default: false) */
  hasHeaders?: boolean;
  /** Starting row number for data (default: 1) */
  startRow?: number;
  /** Starting column letter for data (default: 'A') */
  startColumn?: string;
}
