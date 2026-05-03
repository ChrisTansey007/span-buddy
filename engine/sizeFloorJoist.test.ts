// engine/sizeFloorJoist.test.ts
// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { sizeFloorJoist, JoistSpec, EngineResult } from './sizeFloorJoist';

describe('sizeFloorJoist', () => {
  // Helper to check if result is ok and has value
  const expectOk = (result: EngineResult<JoistSpec>) => {
    expect(result.ok).toBe(true);
    expect(result.value).toBeDefined();
  };

  const expectFail = (result: EngineResult<JoistSpec>, expectedReason?: string) => {
    expect(result.ok).toBe(false);
    if (expectedReason) {
      expect(result.reason).toBe(expectedReason);
    }
  };

  test('returns 2x6 for 60 inch span, Southern Pine #2, 16\" oc, 30 psf', () => {
    console.log('Current working directory:', process.cwd());
    const result = sizeFloorJoist(60, 16, 'Southern Pine', '#2', 30);
    console.log('Result:', JSON.stringify(result, null, 2));
    expectOk(result);
    expect(result.value).toMatchObject({
      size: '2x6',
      spacing: 16,
      span: 60,
      species: 'Southern Pine',
      grade: '#2',
      allowableSpan: 69, // From placeholder data
      utilization: 60 / 69
    });
    // Assumptions and citations should be present
    expect(result.assumptions).toBeDefined();
    expect(result.citations).toBeDefined();
  });

  test('returns 2x8 for 90 inch span, Southern Pine #2, 16\" oc, 30 psf', () => {
    const result = sizeFloorJoist(90, 16, 'Southern Pine', '#2', 30);
    expectOk(result);
    expect(result.value).toMatchObject({
      size: '2x8',
      spacing: 16,
      span: 90,
      species: 'Southern Pine',
      grade: '#2',
      allowableSpan: 91, // From placeholder data
      utilization: 90 / 91
    });
    expect(result.assumptions).toBeDefined();
    expect(result.citations).toBeDefined();
  });

  test('returns 2x10 for 110 inch span, Southern Pine #2, 16\" oc, 30 psf', () => {
    const result = sizeFloorJoist(110, 16, 'Southern Pine', '#2', 30);
    expectOk(result);
    expect(result.value).toMatchObject({
      size: '2x10',
      spacing: 16,
      span: 110,
      species: 'Southern Pine',
      grade: '#2',
      allowableSpan: 117, // From placeholder data
      utilization: 110 / 117
    });
    expect(result.assumptions).toBeDefined();
    expect(result.citations).toBeDefined();
  });

  test('returns 2x12 for 130 inch span, Southern Pine #2, 16\" oc, 30 psf', () => {
    const result = sizeFloorJoist(130, 16, 'Southern Pine', '#2', 30);
    expectOk(result);
    expect(result.value).toMatchObject({
      size: '2x12',
      spacing: 16,
      span: 130,
      species: 'Southern Pine',
      grade: '#2',
      allowableSpan: 138, // From placeholder data
      utilization: 130 / 138
    });
    expect(result.assumptions).toBeDefined();
    expect(result.citations).toBeDefined();
  });

  test('returns error for invalid spacing', () => {
    const result = sizeFloorJoist(90, 10, 'Southern Pine', '#2', 30);
    expectFail(result, 'Invalid spacing');
  });

  test('returns error for invalid live load', () => {
    const result = sizeFloorJoist(90, 16, 'Southern Pine', '#2', 50);
    expectFail(result, 'Live load must be 30 or 40 psf');
  });

  test('returns error for negative span', () => {
    const result = sizeFloorJoist(-10, 16, 'Southern Pine', '#2', 30);
    expectFail(result, 'Span must be positive');
  });

  test('returns error for unknown species', () => {
    const result = sizeFloorJoist(90, 16, 'Unknown Species', '#2', 30);
    expectFail(result, 'Species not found in table');
  });

  test('returns error for unknown grade', () => {
    const result = sizeFloorJoist(90, 16, 'Southern Pine', 'Unknown', 30);
    expectFail(result, 'Grade not found for species Southern Pine');
  });

  test('includes assumptions and citations in result', () => {
    const result = sizeFloorJoist(60, 16, 'Southern Pine', '#2', 30);
    expectOk(result);
    expect(result.assumptions).toBeDefined();
    expect(result.citations).toBeDefined();
    expect(Array.isArray(result.assumptions)).toBe(true);
    expect(Array.isArray(result.citations)).toBe(true);
    // Only check length if they exist
    if (result.assumptions) {
      expect(result.assumptions.length).toBeGreaterThan(0);
    }
    if (result.citations) {
      expect(result.citations.length).toBeGreaterThan(0);
    }
  });

  test('includes warnings when utilization high', () => {
    // Using a span that gives high utilization (close to allowable)
    // For 2x6 at 16\" oc, allowable is 69\". Let's use 65\" -> utilization ~0.94
    const result = sizeFloorJoist(65, 16, 'Southern Pine', '#2', 30);
    expectOk(result);
    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
    // With our placeholder data, 65/69 ≈ 0.942, which should trigger the >0.9 warning
    if (result.warnings) {
      expect(result.warnings).toContain('High utilization (>0.9) - consider verification');
    }
  });

  test('returns error when span exceeds maximum allowable', () => {
    // For Southern Pine #2, 2x12 at 16\" oc, max is 138\"
    const result = sizeFloorJoist(140, 16, 'Southern Pine', '#2', 30);
    expectFail(result, 'No suitable joist size found');
    expect(result.detail?.[0]).toContain('Maximum allowable span');
  });
});