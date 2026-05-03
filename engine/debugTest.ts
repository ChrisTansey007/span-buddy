// debugTest.ts
import { sizeFloorJoist } from './sizeFloorJoist';

console.log('Testing sizeFloorJoist function...');

const result = sizeFloorJoist(60, 16, 'Southern Pine', '#2', 30);
console.log('Result:', JSON.stringify(result, null, 2));

console.log('\nTesting with unknown species...');
const result2 = sizeFloorJoist(60, 16, 'Unknown Species', '#2', 30);
console.log('Result2:', JSON.stringify(result2, null, 2));