// engine/importTest.ts
import { readFileSync } from 'node:fs';
import { join } from 'path';

console.log('Testing imports...');
console.log('readFileSync:', typeof readFileSync);
console.log('join:', typeof join);

try {
  const filePath = join(process.cwd(), 'data', 'irc-2021', 'R502.3.1(1).json');
  console.log('filePath:', filePath);
  const data = readFileSync(filePath, 'utf-8');
  console.log('Data length:', data.length);
  const json = JSON.parse(data);
  console.log('JSON parsed:', json.table);
} catch (error) {
  console.log('Error:', error);
}