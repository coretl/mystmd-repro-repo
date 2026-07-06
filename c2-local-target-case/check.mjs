// Check the built page AST for the case-sensitive local target bug.
// Usage: node check.mjs <path-to-index.json> <bug|fixed>
import fs from 'node:fs';

const [astFile, expect] = process.argv.slice(2);
if (!astFile || !['bug', 'fixed'].includes(expect)) {
  console.error('Usage: node check.mjs <path-to-index.json> <bug|fixed>');
  process.exit(2);
}
const ast = JSON.parse(fs.readFileSync(astFile, 'utf8'));

const refs = [];
(function walk(node) {
  if (Array.isArray(node)) return node.forEach(walk);
  if (node && typeof node === 'object') {
    if (node.type === 'crossReference') refs.push(node.identifier);
    Object.values(node).forEach(walk);
  }
})(ast);

console.log(`crossReference identifiers (document order): ${JSON.stringify(refs)}`);
// index.md contains [](#sample.Match) then [](#sample.match)
const expected = expect === 'fixed' ? ['sample.Match', 'sample.match'] : ['sample.match', 'sample.match'];
if (JSON.stringify(refs) === JSON.stringify(expected)) {
  console.log(
    expect === 'fixed'
      ? 'PASS: both references kept their exact-case targets'
      : 'PASS: bug reproduced — [](#sample.Match) collapsed onto the lowercase target sample.match',
  );
} else {
  console.error(`FAIL: expected ${JSON.stringify(expected)} for "${expect}"`);
  process.exit(1);
}
