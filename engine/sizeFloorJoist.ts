// Span Buddy - Joist Span Calculator
// Implements IRC 2021 Table R502.3.1(1) for #2 Spruce-Pine-Fir and other lumber types
import tableR502_3_1_1 from '@/data/irc-2021/R502.3.1(1).json';
import tableR502_3_1_2 from '@/data/irc-2021/R502.3.1(2).json';

export interface JoistSpec {
  size: string;
  spacing: number;
  span: number;
  species: string;
  grade: string;
  allowableSpan: number;
  utilization: number;
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

function loadTable(tableName: string): any {
  if (tableCache[tableName]) {
    return tableCache[tableName];
  }
  let tableData: any;
  switch (tableName) {
    case 'R502.3.1(1)':
      tableData = tableR502_3_1_1;
      break;
    case 'R502.3.1(2)':
      tableData = tableR502_3_1_2;
      break;
    default:
      throw new Error(`Unknown table: ${tableName}`);
  }
  tableCache[tableName] = tableData;
  return tableData;
}

export function sizeFloorJoist(
  spanInches: number,
  spacingInches: number,
  species: string,
  grade: string,
  liveLoad: number = 30
): EngineResult<JoistSpec> {
  // Validate inputs
  if (spanInches <= 0) {
    return {
      ok: false,
      reason: 'Span must be positive',
      detail: [`Provided span: ${spanInches} inches`]
    };
  }

  // Validate live load
  const validLiveLoads = [30, 40];
  if (!validLiveLoads.includes(liveLoad)) {
    return {
      ok: false,
      reason: 'Live load must be 30 or 40 psf',
      detail: [`Provided live load: ${liveLoad} psf`]
    };
  }

  const validSpacings = [12, 16, 19.2, 24];
  if (!validSpacings.includes(spacingInches)) {
    return {
      ok: false,
      reason: 'Invalid spacing',
      detail: [`Spacing must be one of: ${validSpacings.join(', ')} inches`, `Provided: ${spacingInches}`]
    };
  }

  try {
    // Select the right table based on liveLoad
    const tableName = liveLoad === 30 ? 'R502.3.1(1)' : 'R502.3.1(2)';
    const table = loadTable(tableName);

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

    const spacingKey = `${spacingInches}.0`; // JSON keys are strings with .0 for whole numbers
    const spacingData = gradeData[spacingKey];
    if (!spacingData) {
      return {
        ok: false,
        reason: `Spacing ${spacingInches}\" not found for ${species} #${grade}`,
        detail: [`Available spacings: ${Object.keys(gradeData).map(k => parseFloat(k)).join(', ')} inches`]
      };
    }

    // Define joist sizes in order of increasing depth (we'll assume 2x6, 2x8, 2x10, 2x12, 2x14, 2x16)
    const joistSizes = ['2x6', '2x8', '2x10', '2x12', '2x14', '2x16'];

    let selectedSize: string | null = null;
    let allowableSpan: number = 0;

    for (const size of joistSizes) {
      const spanValue = spacingData[size];
      if (spanValue && spanValue >= spanInches) {
        selectedSize = size;
        allowableSpan = spanValue;
        break;
      }
    }

    if (!selectedSize) {
      // Find the maximum allowable span for this configuration to suggest alternatives
      const maxSpan = Math.max(...Object.values(spacingData).filter(v => typeof v === 'number'));
      return {
        ok: false,
        reason: 'No suitable joist size found',
        detail: [
          `Maximum allowable span for ${species} #${grade} at ${spacingInches}\" oc: ${maxSpan} inches`,
          `Requested span: ${spanInches} inches`,
          'Consider: reducing span, increasing joist size, reducing spacing, or changing species/grade'
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

    return {
      ok: true,
      value: {
        size: selectedSize,
        spacing: spacingInches,
        span: spanInches,
        species,
        grade,
        allowableSpan,
        utilization
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