// debugTest2.ts
import { sizeFloorJoist } from './sizeFloorJoist';

console.log('Testing sizeFloorJoist function with detailed output...');

const result = sizeFloorJoist(60, 16, 'Southern Pine', '#2', 30);
console.log('Result:', JSON.stringify(result, null, 2));
console.log('\nResult.ok:', result.ok);
console.log('Result.value:', result.value);
if (!result.ok) {
  console.log('Error reason:', result.reason);
  console.log('Error detail:', result.detail);
}