# RFC 003: Header/Girder Sizing Engine

## Purpose
Extend the structural sizing engine to handle:
1. Floor joists with 40 psf live load (IRC 2021 Table R502.3.1(2))
2. Girders and headers for exterior bearing walls (IRC 2021 Table R502.5(1))

This builds upon RFC 002 which implemented floor joist sizing for 30 psf live load (Table R502.3.1(1)).

## Interface

### Function Signatures

```typescript
// Floor joist sizing for 40 psf live load
export function sizeFloorJoist40psf(
  span: number,           // Clear span in feet (e.g., 8, 10, 12)
  spacing: number,        // Joist spacing in inches (12, 16, 19.2, 24)
  species: string,        // Wood species identifier (SPF, DF, SYP, etc.)
  grade: string,          // Lumber grade (#1, #2, #3, Stud, etc.)
): JoistSpec

// Girder/Header sizing for exterior bearing walls
export function sizeGirderHeader(
  span: number,           // Clear span in feet
  tributaryWidth: number, // Width of floor/roof that bears on the girder (feet)
  storiesSupported: number, // Number of stories the girder supports (1, 2, 3)
  species: string,        // Wood species identifier
  grade: string,          // Lumber grade
): GirderHeaderSpec
```

### Data Structures

#### JoistSpec (extends from RFC 002)
```typescript
interface JoistSpec {
  result: string;         // e.g., "2x8", "2x10", etc.
  utilization: number;    // Percentage of capacity used (0-100)
  assumptions: string[];  // e.g., ["Deflection limit: L/360"]
  citations: string[];    // e.g., ["IRC 2021 R502.3.1(2)"]
  warnings: string[];     // e.g., ["Span exceeds table limits - consult engineer"]
}
```

#### GirderHeaderSpec
```typescript
interface GirderHeaderSpec {
  result: string;         // e.g., "(2) 2x8", "3x10", "4x12", etc.
  utilization: number;    // Percentage of capacity used
  assumptions: string[];  // e.g., ["Exterior bearing wall", "No concentrated loads"]
  citations: string[];    // e.g., ["IRC 2021 R502.5(1)"]
  warnings: string[];     // e.g., ["Tributary width exceeds table limits"]
}
```

### JSON Table Structure

All IRC tables will be stored in `data/irc-2021/` with the following format:

```json
{
  "table": "R502.3.1(2)",
  "description": "Floor joist spans for common lumber species (40 psf live load)",
  "edition": "IRC 2021",
  "columns": [
    {"name": "Joist Size", "unit": "nominal"},
    {"name": "12\" spacing", "unit": "feet"},
    {"name": "16\" spacing", "unit": "feet"},
    {"name": "19.2\" spacing", "unit": "feet"},
    {"name": "24\" spacing", "unit": "feet"}
  ],
  "data": [
    {
      "species": "SPF",
      "grade": "#2",
      "rows": [
        {"size": "2x6", "12\": 7.7, "16\": 7.0, "19.2\": 6.6, "24\": 6.2},
        {"size": "2x8", "12\": 10.1, "16\": 9.2, "19.2\": 8.7, "24\": 8.0},
        {"size": "2x10", "12\": 12.9, "16\": 11.8, "19.2\": 11.1, "24\": 10.2},
        {"size": "2x12", "12\": 15.0, "16\": 13.8, "19.2\": 13.0, "24\": 11.9}
      ]
    }
    // ... more species/grade combinations
  ]
}
```

For girder/header tables (R502.5(1)), the structure will be similar but with different columns representing tributary width values.

## Data Flow

1. User provides inputs through UI or API
2. Engine validates inputs (span > 0, valid spacing values, recognized species/grade)
3. Engine loads appropriate JSON table from `data/irc-2021/`
4. Engine performs lookup:
   - For joists: match species/grade, then find first size where span ≤ table value for given spacing
   - For girders/headers: match species/grade, then find first size where span ≤ table value for given tributary width and stories
5. Engine calculates utilization: (actual span / maximum allowed span) × 100
6. Engine returns structured result with assumptions, citations, and warnings

## Error Handling & Validation

### Input Validation
- Span must be positive number
- Spacing must be one of: 12, 16, 19.2, 24 inches
- Stories supported must be 1, 2, or 3
- Species and grade must exist in the loaded table data
- Tributary width must be positive number

### Error Responses
If validation fails, throw descriptive error:
- `Invalid span: must be positive number`
- `Invalid spacing: must be 12, 16, 19.2, or 24 inches`
- `Species/grade combination not found in table`
- `No joist size found for given parameters - span exceeds table limits`

## Assumptions (to be included in return value)
- Standard load duration factor (C_D = 1.0 for normal loading)
- No wet service conditions (C_M = 1.0)
- No incised members (C_i = 1.0)
- Size factor applies where applicable
- Simple span analysis
- Uniformly distributed load
- No concentrated loads unless otherwise noted
- Deflection limits: L/360 for live load, L/240 for total load (per IRC)

## Citations
Each function will include the specific IRC table citation used:
- `"IRC 2021 R502.3.1(2)"` for 40 psf floor joists
- `"IRC 2021 R502.5(1)"` for exterior bearing wall girders/headers

## Warnings Conditions
Warnings should be generated when:
- Utilization > 90% (approaching capacity limits)
- Span is within 5% of maximum table value
- Input values are at extremes of table range
- Extrapolation would be required (handled as error instead)
- Multiple members suggested (e.g., "(2) 2x8" indicates built-up member)

## Integration with Existing Code

### New Files
- `engine/sizeFloorJoist40psf.ts` - implements 40 psf live load table
- `engine/sizeGirderHeader.ts` - implements girder/header sizing
- `data/irc-2021/R502.3.1(2).json` - 40 psf floor joist spans
- `data/irc-2021/R502.5(1).json` - girder & header spans for exterior walls
- `data/irc-2021/species-grades.json` - reference data for valid combinations

### Updates to Existing
- `engine/sizeFloorJoist.ts` remains unchanged (30 psf only)
- Consider creating a common utility for table lookup if code duplication becomes significant

## Open Questions
1. Should we create a unified sizing interface that automatically selects the correct table based on live load?
2. How should we handle built-up members (e.g., "(2) 2x8") in the result format?
3. Should girder/header functions differentiate between headers and girders, or use same logic?
4. What about interior bearing walls (R602.7) - include in this phase or later?

## Related Work
- Depends on RFC 002 (floor joist 30 psf)
- Will inform Phase 2 deliverables: header/beam sizing engine
- Prerequisite for Phase 3: PE Review Package (need all sizing functions)

---
*Status: Proposed for Phase 2 implementation*
*Author: Architect Agent*
*Date: $(date)*