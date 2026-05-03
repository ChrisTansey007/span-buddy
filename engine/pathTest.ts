// engine/pathTest.ts
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

const filePath = join(process.cwd(), 'data', 'irc-2021', 'R502.3.1(1).json');
console.log('Constructed filePath:', filePath);

try {
  const data = readFileSync(filePath, 'utf-8');
  console.log('File read successfully, length:', data.length);
  const json = JSON.parse(data);
  console.log('Parsed JSON table:', json.table);
} catch (error) {
  console.log('Error reading file:', error);
}