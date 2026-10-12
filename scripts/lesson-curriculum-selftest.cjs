const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Compile project TypeScript for this Node-only data validation; no browser required.
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename,
  });
  module._compile(outputText, filename);
};
const { allLessons, getLessonsForLayout } = require('../src/data/lessons/index.ts');
const { getKeyboardLayout } = require('../src/keyboards/index.ts');
const { untypableChars } = require('../src/converter/krutiDevCore.ts');
assert.equal(new Set(allLessons.map(l => l.id)).size, allLessons.length, 'unique lesson IDs');
const added = allLessons.filter(l => l.id.startsWith('en-extra-') || l.id.startsWith('kd-speed-'));
assert.equal(added.length, 10);
for (const lesson of added) {
  const layout = getKeyboardLayout(lesson.layout);
  const outputs = new Set(layout.keys.flatMap(k => [k.output, k.shiftOutput]).filter(Boolean).join(''));
  for (const ex of lesson.exercises) {
    assert.ok(ex.text.length >= 2400, `${lesson.id}: sufficient practice text`);
    const bad = [...new Set([...ex.text].filter(c => !outputs.has(c)))];
    assert.deepEqual(bad, [], `${lesson.id}: all characters reachable on keyboard`);
    if (lesson.language === 'hi') assert.deepEqual(untypableChars(ex.text), [], `${lesson.id}: Hindi has no Alt-code characters`);
  }
}
const en = getLessonsForLayout('en-qwerty');
assert.equal(en[0].id, 'en-b-01');
assert.equal(en[11].id, 'en-b-12');
assert.equal(en[12].id, 'en-extra-1');
console.log('PASS existing lesson progress retained and 10 new lessons are fully typable.');
