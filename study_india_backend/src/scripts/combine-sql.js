const fs = require('fs');
const path = require('path');

// Combine all SQL files into one
const sqlDir = path.join(__dirname, '..', 'sql');
const outputFile = path.join(__dirname, '..', 'combined-migration.sql');

// Get all SQL files
const files = fs.readdirSync(sqlDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

console.log('Combining SQL files:');
let combinedSQL = '-- Combined Migration Script\n-- Generated: ' + new Date().toISOString() + '\n\n';

files.forEach(file => {
    console.log(`  - ${file}`);
    const content = fs.readFileSync(path.join(sqlDir, file), 'utf8');
    combinedSQL += `-- ====================================\n`;
    combinedSQL += `-- File: ${file}\n`;
    combinedSQL += `-- ====================================\n\n`;
    combinedSQL += content + '\n\n';
});

// Write combined file
fs.writeFileSync(outputFile, combinedSQL);
console.log(`\n✅ Combined SQL written to: ${outputFile}`);
console.log('\n📋 Copy this file content and paste into Supabase SQL Editor');