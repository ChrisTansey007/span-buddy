// engine/sizeHeader.ts
import { readFileSync } from 'node:fs';
import { join } from 'path';

export interface HeaderSpec {
  size: string; // e.g., "2x8", "2x10", "2-2x8" (double 2x8), "3-2x8" (triple 2x8)
  span: number; // inches (actual span used)
  species: string;
  grade: string;
  allowableSpan: number; // maximum allowable span from tables
  utilization: number; // span / allowableSpan (should be <= 1.0)
  // For headers, we might also want to know the number of plies
  plies: number; // 1, 2, or 3
}

export interface EngineResult<T> {
  ok: boolean;
  value?: T;
  reason?: string;
  detail?: string[];
  assumptions?: string[];
  citations?: string[];
  warnings?: string[];
}

// Cache for loaded tables to avoid reading file on every call
const tableCache: Record<string, any> = {};

function loadTable(): any {
  // For headers, we use R502.5(1) - Girders & headers — exterior bearing walls
  const tableName = 'R502.5(1)';
  if (tableCache[tableName]) {
    return tableCache[tableName];
  }
  const filePath = join(process.cwd(), 'data', 'irc-2021', `${tableName}.json`);
  try {
    const tableData = JSON.parse(readFileSync(filePath, 'utf-8'));
    tableCache[tableName] = tableData;
    return tableData;
  } catch (error) {
    throw new Error(`Failed to load span table ${tableName}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function sizeHeader(
  spanInches: number,
  loadWidthInches: number, // tributary width for the header
  storiesSupported: number, // number of floors/roof the header is supporting (1, 2, or 3)
  species: string,
  grade: string
): EngineResult<HeaderSpec> {
  // Validate inputs
  if (spanInches <= 0) {
    return {
      ok: false,
      reason: 'Span must be positive',
      detail: [`Provided span: ${spanInches} inches`]
    };
  }
  if (loadWidthInches <= 0) {
    return {
      ok: false,
      reason: 'Load width must be positive',
      detail: [`Provided load width: ${loadWidthInches} inches`]
    };
  }
  if (![1, 2, 3].includes(storiesSupported)) {
    return {
      ok: false,
      reason: 'Stories supported must be 1, 2, or 3',
      detail: [`Provided stories supported: ${storiesSupported}`]
    };
  }

  try {
    const table = loadTable();

    // Find the species and grade in the table
    const speciesData = table.data[species];
    if (!speciesData) {
      return {
        ok: false,
        reason: `Species not found in table`,
        detail: [`Available species: ${Object.keys(table.data).join(', ')}`, `Provided: ${species}`]
      };
    }

    const gradeData = speciesData[grade];
    if (!gradeData) {
      return {
        ok: false,
        reason: `Grade not found for species ${species}`,
        detail: [`Available grades: ${Object.keys(speciesData).join(', ')}`, `Provided: ${grade}`]
      };
    }

    // The table data for headers is structured by load width
    // JSON keys are like "12.0" for 12" load width, etc.
    const loadWidthKey = `${loadWidthInches}.0`;
    const loadWidthData = gradeData[loadWidthKey];
    if (!loadWidthData) {
      return {
        ok: false,
        reason: `Load width ${loadWidthInches}\\" not found for ${species} #${grade}`,
        detail: [`Available load widths: ${Object.keys(gradeData).map(k => parseFloat(k)).join(', ')} inches`]
      };
    }

    // Define header sizes in order of increasing strength (we'll assume single, double, triple 2x6, 2x8, etc.)
    // The table data gives us span in feet for each header configuration at the given load width
    // We need to find the smallest header configuration that can support the given span
    const headerSizes = [
      // Single
      { size: '2x6', plies: 1 },
      { size: '2x8', plies: 1 },
      { size: '2x10', plies: 1 },
      { size: '2x12', plies: 1 },
      // Double
      { size: '2-2x6', plies: 2 },
      { size: '2-2x8', plies: 2 },
      { size: '2-2x10', plies: 2 },
      { size: '2-2x12', plies: 2 },
      // Triple
      { size: '3-2x6', plies: 3 },
      { size: '3-2x8', plies: 3 },
      { size: '3-2x10', plies: 3 },
      { size: '3-2x12', plies: 3 }
    ];

    let selectedSize: string | null = null;
    let selectedPlies: number | null = null;
    let allowableSpan: number = 0;

    // Convert span from inches to feet for comparison with table values
    const spanInFeet = spanInches / 12;

    // Iterate through header configurations to find the first one that works
    // We go from smallest to largest, so the first one that works is the most economical
    for (const { size, plies } of headerSizes) {
      const spanValueInFeet = loadWidthData[size];
      if (spanValueInFeet !== undefined && spanValueInFeet !== null && spanValueInFeet >= spanInFeet) {
        selectedSize = size;
        selectedPlies = plies;
        allowableSpan = spanValueInFeet * 12; // Convert back to inches
        break;
      }
    }

    if (!selectedSize) {
      // Find the maximum allowable span for this configuration to suggest alternatives
      const maxSpanInFeet = Math.max(...Object.values(loadWidthData).filter(v => typeof v === 'number'));
      const maxSpanInInches = maxSpanInFeet * 12;
      return {
        ok: false,
        reason: 'No suitable header size found',
        detail: [
          `Maximum allowable span for ${species} #${grade} at ${loadWidthInches}\\" load width: ${maxSpanInInches} inches`,
          `Requested span: ${spanInches} inches`,
          'Consider: reducing span, increasing header size, reducing load width, or changing species/grade'
        ],
        assumptions: table.assumptions,
        citations: [table.source]
      };
    }

    const utilization = spanInches / allowableSpan;
    const warnings: string[] = [];
    if (utilization > 0.9) {
      warnings.push('High utilization (>0.9) - consider verification');
    }
    if (utilization > 0.95) {
      warnings.push('Very high utilization (>0.95) - recommend oversizing');
    }

    // Note: In a real implementation, the storiesSupported parameter would be used to:
    // 1. Select different table data (different JSON files for different support conditions)
    // 2. Apply adjustment factors to the span values
    // 3. Validate that the header configuration is appropriate for the given support condition
    // For now, we're using placeholder data that represents one specific condition

    return {
      ok: true,
      value: {
        size: selectedSize,
        span: spanInches,
        species,
        grade,
        allowableSpan,
        utilization,
        plies: selectedPlies!
      },
      assumptions: table.assumptions,
      citations: [table.source],
      warnings
    };
  } catch (error) {
    // Only catch unexpected errors (like file not found, JSON parse error)
    return {
      ok: false,
      reason: 'Internal error accessing span table',
      detail: [error instanceof Error ? error.message : String(error)]
    };
  }
}