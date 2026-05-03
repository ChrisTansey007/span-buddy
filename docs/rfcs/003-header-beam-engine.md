# RFC 003: Header/Beam Sizing Engine for Girders and Headers

## Purpose
Provide a pure TypeScript function that sizes girders and headers based on IRC 2021 prescriptive span tables (Table R502.5(1) for girders and headers exterior bearing walls), returning a structured result with assumptions, citations, and warnings. This RFC also covers the extension of the floor joist engine to explicitly support 40 psf live load (Table R502.3.1(2)) for clarity and completeness, though the existing engine already supports it.

## Interface

### Shared Types
```typescript
export interface BeamSpec {
  size: string; // e.g., "2x8", "2x10", "3-2x8", "4x10"
  span: number; // inches (actual span used, not maximum allowable)
  species: string;
  grade: string;
  allowableSpan: number; // maximum allowable span from tables
  utilization: number; // span / allowableSpan (should be <= 1.0)
  // Note: spacing is not applicable for beams/girders in the same way as joists.
  // Instead, we may have tributary width or number of floors supported.
  // For headers, we also need to know the opening width and the load condition.
  // These will be specific to the function.
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
```

### Header/Beam Sizing Function
```typescript
/**
 * Sizes a header or girder for exterior bearing walls per IRC 2021 Table R502.5(1).
 * 
 * @param openingWidthInches - The width of the opening (for headers) or the clear span (for girders) in inches.
 * @param tributaryWidthInches - The width of the floor/roof that the beam supports (in inches). 
 *        For headers, this is typically the width of the floor/roof load that bears on the header.
 *        For girders, this is the width of the floor that the girder supports (half the span to adjacent supports on each side?).
 *        Actually, per Table R502.5(1), the spans are given for different building widths and load conditions.
 *        We will interpret the input as follows:
 *        - buildingWidth: the width of the building (perpendicular to the ridge) in feet? 
 *        But the table uses building width in feet and gives spans in feet and inches.
 *        We need to clarify the input parameters.
 * 
 *        Looking at Table R502.5(1) in the IRC 2021, it has:
 *        - Header/Girder Size
 *        - Span (feet and inches) for different building widths (20 ft, 28 ft, 36 ft) and for different loads:
 *          Supporting roof only, roof and ceiling, roof and ceiling and one center bearing floor, etc.
 *        So the function needs to know:
 *          1. The load condition (e.g., roof only, roof and ceiling, etc.)
 *          2. The building width (which determines which column of the table to use)
 *          3. The header/girder size we are checking (or we iterate to find the smallest that works)
 * 
 *        However, the traditional use is: we have an opening width (or clear span) and we want to know what size header is needed.
 *        So we will invert the table: for a given load condition and building width, we look up the maximum allowable span for each size.
 * 
 *        Therefore, we will design the function to take:
 *          - openingWidthInches: the clear span that the header must cover (in inches)
 *          - buildingWidthFeet: the width of the building (20, 28, or 36 feet) - note: the table only has these three.
 *          - loadCondition: an enum representing the load condition (from the table)
 *          - species: string
 *          - grade: string (assuming #1 or better for southern pine, but table notes say No. 1 or better grade for southern pine)
 * 
 *        We will return the smallest standard header/girder size that has an allowableSpan >= openingWidthInches.
 * 
 *        Alternatively, we can follow the pattern of the joist engine and have the function return the spec for a given size?
 *        But the joist engine takes a species, grade, spacing, span, and live load and returns whether that size works (and utilization).
 *        Actually, the joist engine does: given a span, spacing, species, grade, live load, it finds the smallest joist size that works.
 *        So we will do the same for beams: given an opening span, building width, load condition, species, grade, find the smallest beam size that works.
 * 
 *        However, note that beam sizes are often built-up (e.g., 3-2x8, 4-2x10) or solid sawn (4x8, 6x8). The table includes built-up sizes.
 * 
 *        We will define the beam sizes array as per the table: 
 *          ['2x4', '2x6', '2x8', '2x10', '2x12', '3-2x8', '3-2x10', '3-2x12', '4-2x8', '4-2x10', '4-2x12']
 *        but note the table in the snippet we saw includes sizes like 1-2x8, 1-2x10, etc. which is just a single 2x? but that doesn't make sense for a header? 
 *        Actually, the table shows "SIZE" as: 1-2x8, 1-2x10, 1-2x12, then 2-2x8, etc. meaning the number of 2x members nailed together.
 * 
 *        We will adjust based on the actual table we load.
 * 
 * @returns EngineResult<BeamSpec>
 */
export function sizeHeaderOrBeam(
  openingWidthInches: number,
  buildingWidthFeet: number,
  loadCondition: LoadCondition,
  species: string,
  grade: string
): EngineResult<BeamSpec>;
```

### Load Condition Enum
```typescript
export type LoadCondition =
  | 'Roof and ceiling'
  | 'Roof and ceiling and one center-bearing floor'
  | 'Roof, ceiling and one clear span floor'
  | 'Roof and ceiling and two center-bearing floors'
  | 'Roof, ceiling and two clear span floors'
  | 'Roof only'
  | // ... we need to extract all from the table
  ;
```

### Floor Joist Function (40 psf explicit)
The existing `sizeFloorJoist` function already accepts liveLoadPsf of 30 or 40. We will update its documentation to explicitly note that 40 psf uses Table R502.3.1(2). No changes to the function signature are needed.

## Data Flow
1. Input: opening width (inches), building width (feet), load condition, species, grade.
2. Load the appropriate JSON table from `data/irc-2021/`:
   - For headers/girders: `R502.5(1).json`
   - For floor joists (if we want to explicitly call out 40 psf): `R502.3.1(2).json` (already used by `sizeFloorJoist` when liveLoadPsf=40)
3. The JSON table should contain:
   - metadata: table name, description, source, assumptions
   - data structure: indexed by load condition, then building width, then species, then grade, then beam size -> allowable span in inches.
   Example structure:
   ```json
   {
     "table": "R502.5(1)",
     "description": "Header and girder spans — Exterior bearing walls",
     "source": "International Residential Code (IRC) 2021, Table R502.5(1)",
     "assumptions": [ ... ],
     "data": {
       "Roof and ceiling": {
         "20": { // building width in feet
           "Southern Pine": {
             "#1": {
               "2x8": 96,   // allowable span in inches (8 feet)
               "2x10": 120,
               "3-2x8": 108,
               ... 
             },
             "#2": { ... }
           },
           "Douglas Fir-Larch": { ... }
         },
         "28": { ... },
         "36": { ... }
       },
       "Roof and ceiling and one center-bearing floor": { ... },
       ... other load conditions ...
     }
   }
   ```
4. Look up the allowable span for the given load condition, building width, species, grade, and iterate through beam sizes (from smallest to largest) to find the first size where allowableSpan >= openingWidthInches.
5. If no size works, return an error with suggested alternatives (increase building width? not possible, change load condition? not really, increase number of plies, change species/grade, or reduce opening width).
6. Calculate utilization = openingWidthInches / allowableSpan.
7. Return BeamSpec with all relevant data.

## Assumptions (to be included in result)
- Dead load: 10 psf (unless otherwise noted in the table notes)
- Deflection limit: L/360 for live load, L/240 for total load (per table notes)
- Repetitive member factor: Not applicable for headers/girders (they are single members)
- Wet service conditions: No
- Incising: No
- Uniformly distributed load
- Load duration factor: 1.0 (unless otherwise noted)
- For southern pine, No. 1 or better grade is required (per table note)

## Citations
- International Residential Code (IRC) 2021
- Specific table: R502.5(1) for girders and headers exterior bearing walls
- Section: R502.5 Girder and header spans

## Error Handling
- Return EngineResult with ok=false if:
  - Invalid species/grade combination
  - Building width not one of: 20, 28, 36 feet (as per table)
  - Load condition not recognized
  - Opening width exceeds maximum allowable for largest available beam size
  - Table data missing for given parameters
  - Species or grade not found in table

## Warnings (to be included in result when applicable)
- Utilization > 0.9: "High utilization - consider verification"
- Utilization > 0.95: "Very high utilization - recommend oversizing"
- Span approaching table limits: "Span near maximum for selected size"
- Deflection warning: If live load deflection may exceed L/360 (handled implicitly by table limits)
- Note: For built-up beams, ensure proper nailing pattern as per IRC R602.3(2)

## Integration with Existing sizeFloorJoist Function
- The `sizeFloorJoist` function remains unchanged but will now be explicitly documented to support 40 psf live load via Table R502.3.1(2).
- Both functions will share:
  - The same `EngineResult` interface
  - The same table loading and caching mechanism (see `loadTable` function in sizeFloorJoist.ts, which we can refactor into a shared utility)
  - Similar validation logic for inputs (positive numbers, valid enumerations, etc.)
- We may refactor the table loading code into a separate utility module (e.g., `loadSpanTable`) to avoid duplication.

## Shared Utilities or Constants
- Valid building widths: [20, 28, 36] (feet)
- Valid load conditions: as per Table R502.5(1) (to be enumerated)
- Valid beam sizes: to be derived from the table, but we can start with a comprehensive list and filter by what's in the table.
- Table caching mechanism: already present in sizeFloorJoist.ts, we can extract to a shared file.

## Open Questions
1. Should we support interpolating for building widths between 20, 28, and 36 feet? The table only provides these three. We could either use the next lower width (conservative) or return an error if not exact. We'll use exact match for now.
2. How to handle lumber sizes beyond those in the table (e.g., 2x14)? The table may not have them; we would need to return an error or suggest using engineered lumber.
3. Should we include separate functions for headers and girders, or keep one generic function? The table is the same for both, so one function is sufficient.
4. How to handle the condition where the header is supporting a roof with different slope? The table assumes standard conditions; we note that in assumptions.

## References
- IRC 2021 Table R502.3.1(2): Floor joist spans — 40 psf live load
- IRC 2021 Table R502.5(1): Header and girder spans — Exterior bearing walls

FINAL: