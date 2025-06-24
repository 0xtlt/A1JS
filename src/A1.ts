import {
  A1Options,
  CSVImportOptions,
  CSVOptions,
  CellData,
  CellReference,
} from "./types.js";
import {
  columnLetterToNumber,
  escapeCsvValue,
  isValidCellReference,
  parseCellReference,
  parseCsvString,
  parseValue,
  positionToCellReference,
} from "./utils.js";

/**
 * A1JS - A TypeScript library for manipulating JavaScript tables using spreadsheet-style cell references
 */
export class A1 {
  private data: CellData = {};

  /**
   * Creates a new A1 instance
   * @param initialData - Initial cell data or options
   */
  constructor(initialData?: CellData | A1Options) {
    if (initialData) {
      if ("data" in initialData) {
        this.data = initialData.data ? { ...initialData.data } : {};
      } else {
        this.data = { ...initialData };
      }
    }

    // Validate all cell references
    this.validateCellReferences();
  }

  /**
   * Validates that all keys in the data are valid cell references
   */
  private validateCellReferences(): void {
    for (const cellRef of Object.keys(this.data)) {
      if (!isValidCellReference(cellRef)) {
        throw new Error(`Invalid cell reference: ${cellRef}`);
      }
    }
  }

  /**
   * Sets multiple cell values at once
   * @param cellData - Object containing cell references and their values
   */
  set(cellData: CellData): void {
    // Validate all cell references first
    for (const cellRef of Object.keys(cellData)) {
      if (!isValidCellReference(cellRef)) {
        throw new Error(`Invalid cell reference: ${cellRef}`);
      }
    }

    // Update data
    Object.assign(this.data, cellData);
  }

  /**
   * Sets a single cell value
   * @param cellRef - Cell reference (e.g., "A1", "CZ10")
   * @param value - Value to set
   */
  setItem(cellRef: CellReference, value: unknown): void {
    if (!isValidCellReference(cellRef)) {
      throw new Error(`Invalid cell reference: ${cellRef}`);
    }

    this.data[cellRef] = value;
  }

  /**
   * Gets a single cell value
   * @param cellRef - Cell reference to retrieve
   * @returns The cell value or undefined if not set
   */
  getItem(cellRef: CellReference): unknown {
    if (!isValidCellReference(cellRef)) {
      throw new Error(`Invalid cell reference: ${cellRef}`);
    }

    return this.data[cellRef];
  }

  /**
   * Gets multiple cell values
   * @param cellRefs - Array of cell references to retrieve
   * @returns Object containing the requested cell values
   */
  getItems(...cellRefs: CellReference[]): CellData {
    const result: CellData = {};

    for (const cellRef of cellRefs) {
      if (!isValidCellReference(cellRef)) {
        throw new Error(`Invalid cell reference: ${cellRef}`);
      }
      result[cellRef] = this.data[cellRef];
    }

    return result;
  }

  /**
   * Gets all cell data
   * @returns Copy of all cell data
   */
  getAllData(): CellData {
    return { ...this.data };
  }

  /**
   * Gets raw cell data (direct reference, not a copy)
   * @returns Direct reference to internal data
   */
  getRawData(): CellData {
    return this.data;
  }

  /**
   * Removes a cell value
   * @param cellRef - Cell reference to remove
   */
  removeItem(cellRef: CellReference): void {
    if (!isValidCellReference(cellRef)) {
      throw new Error(`Invalid cell reference: ${cellRef}`);
    }

    delete this.data[cellRef];
  }

  /**
   * Clears all cell data
   */
  clear(): void {
    this.data = {};
  }

  /**
   * Gets the bounding box of all non-empty cells
   * @returns Object with min/max row and column positions
   */
  private getBoundingBox(): {
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
  } | null {
    const cellRefs = Object.keys(this.data);
    if (cellRefs.length === 0) {
      return null;
    }

    const positions = cellRefs.map((ref) => parseCellReference(ref));

    return {
      minRow: Math.min(...positions.map((p) => p.row)),
      maxRow: Math.max(...positions.map((p) => p.row)),
      minCol: Math.min(...positions.map((p) => p.column)),
      maxCol: Math.max(...positions.map((p) => p.column)),
    };
  }

  /**
   * Converts the data to a CSV string
   * @param options - CSV formatting options
   * @returns CSV string representation
   */
  toCSVString(options: CSVOptions = {}): string {
    const {
      separator = ",",
      includeHeaders = false,
      lineEnding = "\n",
      startFromColumnA = true,
    } = options;

    const bounds = this.getBoundingBox();
    if (!bounds) {
      return "";
    }

    const rows: string[] = [];
    const startCol = startFromColumnA ? 1 : bounds.minCol;

    // Add headers if requested
    if (includeHeaders) {
      const headers: string[] = [];
      for (let col = startCol; col <= bounds.maxCol; col++) {
        headers.push(
          positionToCellReference({ row: 1, column: col }).replace(/\d+$/, "")
        );
      }
      rows.push(headers.join(separator));
    }

    // Add data rows
    for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
      const rowData: string[] = [];
      for (let col = startCol; col <= bounds.maxCol; col++) {
        const cellRef = positionToCellReference({ row, column: col });
        const value = this.data[cellRef];
        rowData.push(escapeCsvValue(value));
      }
      rows.push(rowData.join(separator));
    }

    return rows.join(lineEnding);
  }

  /**
   * Creates a 2D array representation of the data
   * @param startFromColumnA - Start from column A instead of first used column (default: true)
   * @returns 2D array with the table data
   */
  toArray(startFromColumnA: boolean = true): unknown[][] {
    const bounds = this.getBoundingBox();
    if (!bounds) {
      return [];
    }

    const result: unknown[][] = [];
    const startCol = startFromColumnA ? 1 : bounds.minCol;

    for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
      const rowData: unknown[] = [];
      for (let col = startCol; col <= bounds.maxCol; col++) {
        const cellRef = positionToCellReference({ row, column: col });
        rowData.push(this.data[cellRef] ?? null);
      }
      result.push(rowData);
    }

    return result;
  }

  /**
   * Creates a compact 2D array with only the cells that have values
   * @returns Array of [cellRef, value] pairs
   */
  toCompactArray(): [CellReference, unknown][] {
    return Object.entries(this.data);
  }

  /**
   * Creates a 2D array representation grouped by rows, with only non-empty cells
   * @returns 2D array where each row contains only the cells with values in that row
   */
  toRowBasedArray(): {
    row: number;
    cells: { column: string; value: unknown }[];
  }[] {
    const bounds = this.getBoundingBox();
    if (!bounds) {
      return [];
    }

    const result: {
      row: number;
      cells: { column: string; value: unknown }[];
    }[] = [];

    for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
      const cells: { column: string; value: unknown }[] = [];

      for (const [cellRef, value] of Object.entries(this.data)) {
        const position = parseCellReference(cellRef);
        if (position.row === row) {
          const columnLetter = positionToCellReference({
            row: 1,
            column: position.column,
          }).replace(/\d+$/, "");
          cells.push({ column: columnLetter, value });
        }
      }

      if (cells.length > 0) {
        // Sort cells by column position
        cells.sort((a, b) => {
          const colA = columnLetterToNumber(a.column);
          const colB = columnLetterToNumber(b.column);
          return colA - colB;
        });
        result.push({ row, cells });
      }
    }

    return result;
  }

  /**
   * Gets the number of non-empty cells
   * @returns Number of cells with values
   */
  size(): number {
    return Object.keys(this.data).length;
  }

  /**
   * Checks if the table is empty
   * @returns True if no cells have values
   */
  isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * Gets all cell references that have values
   * @returns Array of cell references
   */
  getCellReferences(): CellReference[] {
    return Object.keys(this.data);
  }

  /**
   * Creates an A1 instance from a CSV string
   * @param csvString - The CSV string to parse
   * @param options - Import options
   * @returns New A1 instance with data from CSV
   */
  static fromCSVString(csvString: string, options: CSVImportOptions = {}): A1 {
    const instance = new A1();
    instance.loadFromCSVString(csvString, options);
    return instance;
  }

  /**
   * Loads data from a CSV string into the current instance
   * @param csvString - The CSV string to parse
   * @param options - Import options
   */
  loadFromCSVString(csvString: string, options: CSVImportOptions = {}): void {
    const {
      separator = ",",
      hasHeaders = false,
      startRow = 1,
      startColumn = "A",
    } = options;

    // Parse CSV to 2D array
    const rows = parseCsvString(csvString, separator);
    if (rows.length === 0) {
      return;
    }

    // Calculate starting position
    const startColNum = columnLetterToNumber(startColumn);

    // Clear existing data
    this.clear();

    // Skip headers row if present
    const dataRows = hasHeaders ? rows.slice(1) : rows;

    // Convert 2D array to cell data
    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];
      const actualRow = startRow + rowIndex;

      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const actualCol = startColNum + colIndex;
        const cellRef = positionToCellReference({
          row: actualRow,
          column: actualCol,
        });

        const rawValue = row[colIndex];
        const parsedValue = parseValue(rawValue);

        // Only set non-null values
        if (parsedValue !== null) {
          this.data[cellRef] = parsedValue;
        }
      }
    }
  }
}
