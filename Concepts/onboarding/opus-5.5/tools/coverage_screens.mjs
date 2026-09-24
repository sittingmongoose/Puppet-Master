/* Writes the screens section of src/coverage.map.json from the live page: every registered screen with its chapter,
 * canonical stage and scene (id and beat as a fresh session would show it), plus the scenario list from
 * tools/scenarios.mjs titles. Then run: python3 tools/schema_check.py coverage */
import { open } from './drive.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const mapPath = resolve(here, '../src/coverage.map.json');
const d = await open({ scenario: 'returning' });
await d.openOnboarding();
const screens = await d.state(() => {
  const S = window.O55.S, out = {};
  for (const [id, def] of Object.entries(window.O55.screens.defs)) {
    let scene = null;
    try { const sc = def.scene ? def.scene(S) : { id: 'hero' }; scene = sc.id + (sc.beat ? ':' + sc.beat : ''); } catch (e) { scene = 'depends on state'; }
    out[id] = { chapter: def.chapterFor ? 'by path' : def.chapter, stage: def.stage || null, scene };
  }
  return out;
});
await d.close();
const src = readFileSync(resolve(here, 'scenarios.mjs'), 'utf8');
const scenarios = {};
for (const m of src.matchAll(/def\('([a-z0-9]+)', '([A-Za-z]+)', '([^']+)'/g)) scenarios[m[1]] = { fixture: m[2], title: m[3], driver: 'tools/scenarios.mjs --only ' + m[1] };
const map = JSON.parse(readFileSync(mapPath, 'utf8'));
map.screens = screens; map.scenarios = scenarios;
writeFileSync(mapPath, JSON.stringify(map, null, 1) + '\n');
console.log(JSON.stringify({ screens: Object.keys(screens).length, scenarios: Object.keys(scenarios).length }));
