// SW-43: exercise the legacy verifier's real lint body without starting its CLI browser.
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../../../chat-assistant-concepts/5.6 Pro/tests/pmx-verify.mjs', import.meta.url), 'utf8');
const start = source.indexOf('export function inPageLint(');
const end = source.indexOf('\n}', start) + 2;
if (start < 0 || end < start) throw Error('Cannot extract pmx lint function');
const lint = Function('return ' + source.slice(start, end).replace('export ', ''))();
export default async function (t) {
  const f = await t.app.open();
  await t.check('integrated page supplies Pip', await f.evaluate(() => !!window.PMLogo), '', {hard: true});
  const options = {kind: 'view', checks: ['loop-census']};
  const present = await f.evaluate(lint, options);
  await t.check('loop census executes with Pip present', typeof present.results['loop-census']?.pass === 'boolean', JSON.stringify(present));
  await f.evaluate(() => { window.__censusLogo = window.PMLogo; window.PMLogo = undefined; });
  try {
    const absent = await f.evaluate(lint, options);
    await t.check('missing Pip cannot pass census with zero animation buckets', absent.results['loop-census']?.pass === false, JSON.stringify(absent));
  } finally { await f.evaluate(() => { window.PMLogo = window.__censusLogo; delete window.__censusLogo; }); }
}
