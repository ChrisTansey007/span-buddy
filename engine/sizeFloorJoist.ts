// Span Buddy - Joist Span Calculator
// Implements IRC 2021 Table R502.3.1(1) for #2 Spruce-Pine-Fir and other lumber types

export function calculateJoistSpan(lumberSize: string, lumberSpecies: string, liveLoad: number = 40): number {
    // This is a placeholder implementation.
    // In a real implementation, we would look up values from span tables.
    
    // For now, return a dummy value based on lumber size.
    const sizeMap: Record<string, number> = {
        '2x6': 9.0,
        '2x8': 12.0,
        '2x10': 15.0,
        '2x12': 18.0
    };
    
    return sizeMap[lumberSize] || 8.0;
}

// Export for use in other modules
export { calculateJoistSpan };
