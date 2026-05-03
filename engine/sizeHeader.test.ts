// engine/sizeHeader.test.ts
// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { sizeHeader, HeaderSpec, EngineResult } from './sizeHeader';

describe('sizeHeader', () => {
  // Helper to check if result is ok and has value
  const expectOk = (result: EngineResult<HeaderSpec>) => {
    expect(result.ok).toBe(true);
    expect(result.value).toBeDefined();
  };

  const expectFail = (result: EngineResult<HeaderSpec>, expectedReason?: string) => {
    expect(result.ok).toBe(false);
    if (expectedReason) {
      expect(result.reason).toBe(expectedReason);
    }
  };

  // Note: These tests use the placeholder data which may not reflect actual IRC values
  // They test the logic and structure rather than specific code values

  test('returns 2-2x6 for 48 inch span, Southern Pine #2, 12" load width', () => {
    // 48 inches = 4 feet
    // From placeholder data: 2-2x6 at 12" load width = 4.7 ft
    // So 4 ft span should work with utilization 4/4.7
    const result = sizeHeader(48, 12, 1, 'Southern Pine', '#2');
    console.log('Result:', JSON.stringify(result, null, 2));
    expectOk(result);
    // Using toBeCloseTo for floating point comparisons
    const value = result.value as HeaderSpec; // Type assertion after expectOk
    expect(value).toMatchObject({
      size: '2-2x6',
      span: 48,
      species: 'Southern Pine',
      grade: '#2',
      allowableSpan: expect.any(Number),
      utilization: expect.any(Number),
      plies: 2
    });
    // Check specific values with tolerance
    expect(value.allowableSpan).toBeCloseTo(56.4);
    expect(value.utilization).toBeCloseTo(48 / 56.4);
    expect(result.assumptions).toBeDefined();
    expect(result.citations).toBeDefined();
  });

  test('returns 2-2x8 for 60 inch span, Southern Pine #2, 16" load width', () => {
    // 60 inches = 5 feet
    // From placeholder data: 2-2x8 at 16" load width = 5.1 ft
    // So 5 ft span should work with utilization 5/5.1
    const result = sizeHeader(60, 16, 1, 'Southern Pine', '#2');
    expectOk(result);
    const value = result.value as HeaderSpec; // Type assertion after expectOk
    expect(value).toMatchObject({
      size: '2-2x8',
      span: 60,
      species: 'Southern Pine',
      grade: '#2',
      allowableSpan: expect.any(Number),
      utilization: expect.any(Number),
      plies: 2
    });
    // Check specific values with tolerance
    expect(value.allowableSpan).toBeCloseTo(61.2); // 5.1 * 12
    expect(value.utilization).toBeCloseTo(60 / 61.2);
  });

  test('returns 2-2x10 for 72 inch span, Southern Pine #2, 16" load width', () => {
    // 72 inches = 6 feet
    // From placeholder data: 2-2x8 at 16" load width = 5.1 ft (not enough)
    // 2-2x10 at 16" load width = 6.1 ft = 73.2 inches (should work for 72 inches)
    const result = sizeHeader(72, 16, 1, 'Southern Pine', '#2');
    expectOk(result);
    const value = result.value as HeaderSpec; // Type assertion after expectOk
    expect(value).toMatchObject({
      size: '2-2x10',
      span: 72,
      species: 'Southern Pine',
      grade: '#2',
      allowableSpan: expect.any(Number),
      utilization: expect.any(Number),
      plies: 2
    });
    // Check specific values with tolerance
    expect(value.allowableSpan).toBeCloseTo(73.2); // 6.1 * 12
    expect(value.utilization).toBeCloseTo(72 / 73.2);
  });

  test('returns error for invalid span', () => {
    const result = sizeHeader(-10, 12, 1, 'Southern Pine', '#2');
    expectFail(result, 'Span must be positive');
  });

  test('returns error for invalid load width', () => {
    const result = sizeHeader(36, -12, 1, 'Southern Pine', '#2');
    expectFail(result, 'Load width must be positive');
  });

  test('returns error for unknown species', () => {
    const result = sizeHeader(36, 12, 1, 'Unknown Species', '#2');
    expectFail(result, 'Species not found in table');
  });

  test('returns error for unknown grade', () => {
    const result = sizeHeader(36, 12, 1, 'Southern Pine', 'Unknown');
    expectFail(result, 'Grade not found for species Southern Pine');
  });

  test('includes assumptions and citations in result', () => {
    const result = sizeHeader(36, 12, 1, 'Southern Pine', '#2');
    expectOk(result);
    // Check that assumptions and citations exist on the result object
    expect(result.assumptions).toBeDefined();
    expect(result.citations).toBeDefined();
    expect(Array.isArray(result.assumptions)).toBe(true);
    expect(Array.isArray(result.citations)).toBe(true);
    if (result.assumptions) {
      expect(result.assumptions.length).toBeGreaterThan(0);
    }
    if (result.citations) {
      expect(result.citations.length).toBeGreaterThan(0);
    }
  });

  test('includes warnings when utilization high', () => {
    // Using a span that gives high utilization
    // For 2-2x6 at 12" load width: 4.7 ft = 56.4 inches allowable
    // Use 52 inches -> utilization ~0.92
    const result = sizeHeader(52, 12, 1, 'Southern Pine', '#2');
    expectOk(result);
    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
    if (result.warnings) {
      expect(result.warnings).toContain('High utilization (>0.9) - consider verification');
    }
  });

  test('returns error when span exceeds maximum allowable', () => {
    // For Southern Pine #2, let's find the maximum value in the table
    // Looking at the data: 4-2x12 at 12" = 11.8 ft = 141.6 inches
    const result = sizeHeader(142, 12, 1, 'Southern Pine', '#2');
    expectFail(result, 'No suitable header size found');
    expect(result.detail?.[0]).toContain('Maximum allowable span');
  });
});