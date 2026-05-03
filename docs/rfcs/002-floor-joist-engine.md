# RFC 002: Floor Joist Sizing Engine

## Purpose
Provide a pure TypeScript function that sizes floor joists based on IRC 2021 prescriptive span tables, returning a structured result with assumptions, citations, and warnings.

## Interface
```typescript
export interface JoistSpec {
  size: string; // e.g., "2x8", "2x10"
  spacing: number; // inches on center
  span: number; // inches (actual span used, not maximum allowable)
  species: string;
  grade: string;
  allowableSpan: number; // maximum allowable span from tables
  utilization: number; // span / allowableSpan (should be <= 1.0)
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

export function sizeFloorJoist(
  spanInches: number,
  spacingInches: number,
  species: string,
  grade: string,
  liveLoadPsf: 30 | 40
): EngineResult<JoistSpec>;
```

## Data Flow
1. Input: span (inches), spacing (inches), species, grade, live load (30 or 40 psf)
2. Load appropriate JSON table from `data/irc-2021/` based on live load:
   - 30 psf → `R502.3.1(1).json`
   - 40 psf → `R502.3.1(2).json`
3. Look up maximum allowable span for given species, grade, spacing, and iterate through joist sizes (2x6, 2x8, 2x10, 2x12, etc.) to find the smallest size where allowableSpan >= spanInches
4. If no size works, return error with suggested alternatives (increase size, reduce spacing, change species/grade)
5. Calculate utilization = spanInches / allowableSpan
6. Return JoistSpec with all relevant data

## Assumptions (to be included in result)
- Dead load: 10 psf (unless otherwise specified in future versions)
- Deflection limit: L/360 for live load, L/240 for total load
- Repetitive member factor applied (for joist spacing ≤ 24" oc)
- Wet service conditions: No
- Incising: No
- Uniformly distributed load

## Citations
- International Residential Code (IRC) 2021
- Specific table: R502.3.1(1) for 30 psf live load, R502.3.1(2) for 40 psf live load
- Section: R502.3.1 Floor joists

## Error Handling
- Return EngineResult with ok=false if:
  - Invalid species/grade combination
  - Live load not 30 or 40 psf
  - Span exceeds maximum allowable for largest available joist size
  - Spacing not one of: 12, 16, 19.2, 24 inches
  - Table data missing for given parameters

## Warnings (to be included in result when applicable)
- Utilization > 0.9: "High utilization - consider verification"
- Utilization > 0.95: "Very high utilization - recommend oversizing"
- Span approaching table limits: "Span near maximum for selected size"
- Deflection warning: If live load deflection may exceed L/360 (handled implicitly by table limits)

## Open Questions
1. Should we support custom dead loads beyond 10 psf?
2. How to handle lumber sizes beyond 2x12 (e.g., 2x14, 2x16) - may need engineering analysis
3. Should we include repetitive member factor explanation in assumptions?
4. How to handle regional variations (e.g., snow loads affecting floor systems)?

FINAL: