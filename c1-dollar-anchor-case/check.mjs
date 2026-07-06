// Check `intersphinx list` output for the `$` anchor expansion bug.
// Usage: node check.mjs <output-file> <bug|fixed>
import fs from 'node:fs';

const [outputFile, expect] = process.argv.slice(2);
if (!outputFile || !['bug', 'fixed'].includes(expect)) {
  console.error('Usage: node check.mjs <output-file> <bug|fixed>');
  process.exit(2);
}
const output = fs.readFileSync(outputFile, 'utf8');

// The line following `py:class  (re.Match)` is its resolved location.
const lines = output.split('\n').map((line) => line.trim());
const classIndex = lines.findIndex((line) => line.includes('py:class') && line.includes('re.Match'));
const location = classIndex >= 0 ? lines[classIndex + 1] : undefined;
if (!location) {
  console.error('FAIL: could not find the py:class re.Match entry in the output');
  process.exit(1);
}
console.log(`py:class re.Match resolved to: ${location}`);

const verbatim = location.endsWith('#re.Match');
const lowercased = location.endsWith('#re.match');
if (expect === 'fixed' && verbatim) {
  console.log('PASS: `$` expanded case-preserved (Sphinx semantics)');
} else if (expect === 'bug' && lowercased) {
  console.log('PASS: bug reproduced — `$` expansion lowercased re.Match to #re.match');
} else {
  console.error(`FAIL: expected "${expect}" behaviour but got location "${location}"`);
  process.exit(1);
}
