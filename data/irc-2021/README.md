# IRC 2021 Prescriptive Span Tables

This directory contains JSON ports of the International Residential Code (IRC) 2021 prescriptive span tables used for structural sizing.

## Tables Included

- `R502.3.1(1).json` - Floor joist spans — 30 psf live load
- `R502.3.1(2).json` - Floor joist spans — 40 psf live load  
- `R502.5(1).json` - Girders & headers — exterior bearing walls
- `R507.json` - Deck joist spans
- `R602.7(1).json` - Headers & girders — interior bearing walls (single story)
- `R602.7(2).json` - Headers & girders — interior bearing walls (two story)
- `R802.5.1.json` - Ceiling joists / rafters

Each table includes:
- The tabular span data
- Full citation to the IRC 2021 source
- Notes on assumptions and limitations
- Metadata for traceability

## Data Format

Each JSON file follows this structure:
```json
{
  "table": "R502.3.1(1)",
  "description": "Floor joist spans — 30 psf live load",
  "source": "International Residential Code (IRC) 2021, Table R502.3.1(1)",
  "assumptions": [
    "Live load: 30 psf",
    "Dead load: 10 psf", 
    "Deflection limit: L/360",
    "Species: Visually graded lumber",
    "Grade: #2",
    "Repetitive member factor: Applied where applicable"
  ],
  "species": [
    "Southern Pine",
    "Douglas Fir-Larch", 
    "Hem-Fir",
    "Spruce-Pine-Fir"
  ],
  "grades": ["#1", "#2", "#3"],
  "data": {
    // Span data organized by species, grade, spacing, and size
  }
}
```

## Usage

The engine reads from these JSON files to determine allowable spans based on:
- Species of lumber
- Grade of lumber  
- Member size (depth)
- Spacing (for joists) or tributary width (for beams/headers)
- Load conditions

All span values are in inches and represent the maximum allowable clear span.