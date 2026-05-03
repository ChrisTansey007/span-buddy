// engine/simpleImportTest.ts
import { sizeFloorJoist } from './sizeFloorJoist';

console.log('Attempting to call sizeFloorJoist...');
try {
  const result = sizeFloorJoist(60, 16, 'Southern Pine', '#2', 30);
  console.log('Call succeeded:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('Call threw error:', error);
}