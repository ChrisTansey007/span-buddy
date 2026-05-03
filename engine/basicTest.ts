// basicTest.ts
import { sizeFloorJoist } from './sizeFloorJoist';

console.log('Import successful');

// Test the function
const result = sizeFloorJoist(60, 16, 'Southern Pine', '#2', 30);
console.log('Result:', JSON.stringify(result, null, 2));