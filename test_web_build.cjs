// Check the files actually published, including data reassembly and UTF-8 byte limits.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const site = path.join(__dirname, 'site');
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
assert(scripts.length > 4, 'Catalog must be split into bounded scripts');
assert.equal(new Set(scripts).size, scripts.length, 'No duplicate script loads');
assert.match(scripts[0], /\/grunnlag-/);
assert.match(scripts.at(-1), /\/app-/);
const context = vm.createContext({});
for (const [i, file] of scripts.entries()) {
  const buffer = fs.readFileSync(path.join(site, file));
  assert(buffer.length <= 1_500_000, `${file} exceeds the uncompressed byte limit`);
  // Parse every script. Execute the catalog scripts in exactly the order used by the browser.
  const script = new vm.Script(buffer.toString('utf8'), {filename: file});
  if (i < scripts.length - 1) script.runInContext(context, {timeout: 10000});
}
const actual = JSON.parse(vm.runInContext('JSON.stringify(DATA.catalog)', context));
const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'work/catalog/catalog.json'), 'utf8'));
assert.deepEqual(actual, expected, 'Published catalog must match source, including every record, field and order');
const guard = fs.readFileSync(path.join(site, scripts.at(-1)), 'utf8').split('/* IMM_CATALOG_READY */')[0];
vm.runInContext(guard, context); // Complete data allows startup without needing the DOM.
for (const key of ['meds', 'diagnoses', 'interactions']) {
  const panel = {innerHTML: ''};
  const incomplete = {...expected, [key]: expected[key].slice(1)};
  const blocked = vm.createContext({DATA: {catalog: incomplete}, document: {getElementById: () => panel}});
  assert.throws(() => vm.runInContext(guard, blocked), /IMM catalog incomplete/);
  assert.match(panel.innerHTML, /Last siden på nytt/, `Missing ${key} must show a retry action`);
}
const panel = {innerHTML: ''};
assert.throws(() => vm.runInNewContext(guard, {document: {getElementById: () => panel}}), /IMM catalog incomplete/);
console.log(`Published catalog verified: ${actual.meds.length} medicines, ${actual.diagnoses.length} diagnoses, ${actual.interactions.length} interactions; ${scripts.length} scripts under 1.5 MB.`);
