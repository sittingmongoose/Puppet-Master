// Role-name hover markers must not opt a <b> into the timeline byline's layout.
// Run: node Concepts/onboarding/opus-5.5/tools/marker_classes.test.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(new URL('../../../home-redesign/src/panels/' + p, import.meta.url), 'utf8');
const js = read('kinds/46-run.js'), css = read('css/64-kind-artifact-run.css');
const roles = [...js.matchAll(/h\('b',\s*\{\s*class:\s*'([^']+)',\s*text:\s*p\.role/g)].map((m) => m[1]);
assert.equal(roles.length, 3, 'all seat, team and unfinished-report role builders are checked');
for (const role of roles) {
 assert.notEqual(role, 'pmw-run-who', 'role marker collides with the timeline byline (flex, line-height:17px)');
 assert.equal(role, 'pmw-run-role');
}
assert.match(js, /h\('p', \{ class: 'pmw-run-who' \}/, 'timeline bylines keep their layout');
assert.match(css, /\.pmw-run-who\s*\{[^}]*line-height:\s*17px[^}]*display:\s*flex/s);
assert.match(css, /\.pmw-run-trow[^\n]*\.pmw-run-role/);
assert.doesNotMatch(css, /\.pmw-run-(?:seat|trow)[^\n]*\.pmw-run-who/);
console.log('PASS all three role names use a fresh marker; byline layout remains scoped to bylines');
// The other generic name found by the historical sweep belongs to an unrelated Settings concept.
// Keep even that existing namespace out of the new chat marker.
const chat = (p) => readFileSync(new URL('../../../chat-assistant-concepts/5.6 Pro/' + p, import.meta.url), 'utf8');
for (const p of ['app.js', 'nier-parts.css', 'index.html', 'PM_Chat_Assistant_5.6_Pro_Standalone.html']) {
 assert.equal(/(?:class="|\.)model-name\b/.test(chat(p)), false, `${p}: model-name is already a styled class in Settings 5.6 Sol`);
 assert.match(chat(p), /pm56-model-name/);
}
console.log('PASS chat model-name marker also uses its own namespace');
