// The created-node decision (helpers/onb-rest-created.mjs) on a recorded mutation list.
// node tools/onb-rest-created.selftest.mjs [onb-rest-created.mjs]
// PM7PERF-ONBREST-NIER-LABEL-NODES-FLAP: the list below was recorded on Alexis (main.html df303e4707, NieR Dark
// Where, run-probe-b): two label-word changes and one lose/re-acquire of the single target. Each word change makes
// one childList record under b.pst-target and one under the bracket label (text, gHud.__b[8]), removing the old
// words and adding the new text node in the same record; the re-acquire re-inserts the nine kept bracket parts
// (seen: they were attached when the window began). The old rule counted every unseen added node: one target
// change read "2 nodes created" and failed the row on a correct page.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const m = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../helpers/onb-rest-created.mjs');

const text = (desc) => ({ text: true, seen: false, desc });
const part = (desc) => ({ text: false, seen: true, desc });
// one target change, as recorded: the HUD target word and the bracket label each re-set their words
const oneChange = [
	{ g: 'hudhtml', wordReset: true, added: [text('b.pst-target #text')] },
	{ g: 'hud', wordReset: true, added: [text('text #text')] }
];
// the whole recorded window: two word changes, the lose (STANDBY word), the nine kept parts back, the words again
const recorded = [
	...oneChange,
	{ g: 'hudhtml', wordReset: true, added: [text('b.pst-target #text')] },
	{ g: 'hud', wordReset: true, added: [text('text #text')] },
	{ g: 'hudhtml', wordReset: true, added: [text('b.pst-target #text')] },
	{ g: 'hud', wordReset: false, added: [part('path')] },
	{ g: 'hud', wordReset: false, added: [part('path')] },
	{ g: 'hud', wordReset: false, added: [part('path')] },
	{ g: 'hud', wordReset: false, added: [part('path')] },
	{ g: 'hud', wordReset: false, added: [part('path')] },
	{ g: 'hud', wordReset: false, added: [part('rect')] },
	{ g: 'hud', wordReset: false, added: [part('path')] },
	{ g: 'hud', wordReset: false, added: [part('rect')] },
	{ g: 'hud', wordReset: false, added: [part('text')] },
	{ g: 'hud', wordReset: true, added: [text('text #text')] }
];
const count = (records) => records.reduce((a, r) => a + m.createdAdded(r).length, 0);

// the false FAIL: the old rule counted the two word-reset text nodes of one target change
assert.equal(count(oneChange), 0, `PM7PERF-ONBREST-NIER-LABEL-NODES-FLAP: a target change re-sets the words under b.pst-target and the bracket label in the same records that remove the old words; those text nodes are not a rebuild and must not count (the old rule read 2 nodes created): ${JSON.stringify(oneChange.map((r) => m.createdAdded(r)))}`);
assert.equal(count(recorded), 0, 'the whole recorded window (two word changes, a lose and re-acquire, the kept parts back) creates no node');

// a genuine rebuild still counts: new elements anywhere, and text added without the words changing in the record
const rebuild = [
	{ g: 'props', wordReset: false, added: [{ text: false, seen: false, desc: 'div.pst-prop' }, { text: true, seen: false, desc: 'div.pst-prop #text' }] },
	{ g: 'hud', wordReset: false, added: [text('text #text')] }
];
assert.equal(count(rebuild), 3, 'new elements and their text, and label text added without a word change in the same record, still count');
// a word-reset record that also adds an element: the element counts, the re-set words do not
const mixed = [{ g: 'hud', wordReset: true, added: [text('text #text'), { text: false, seen: false, desc: 'path' }] }];
assert.equal(count(mixed), 1, 'a word reset excuses only the text nodes of its own record, never an added element');
// nodes already in the stage when the window began never count, word reset or not
assert.equal(count([{ g: 'hud', wordReset: false, added: [part('path'), { text: true, seen: true, desc: 'text #text' }] }]), 0);

console.log('PASS a target change\'s word-reset text nodes (b.pst-target and the bracket label) do not count as created; genuine new nodes still do (the old rule failed the row on the recorded window)');
