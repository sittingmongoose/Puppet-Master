// A browser self-test of checks/perf-settings-chapter's page probe (PROBE, ARM, COLLECT) on a constructed page, not on the
// app (TIB-P7, 2026-11-20). The probe's functions are read from the check's source, so the same run judges an older copy:
//   browser-check run diagnostics/settings-chapter-probe.check.mjs --set page=<any built page> [--set check=<a copy of
//   checks/perf-settings-chapter.check.mjs>]
// (--set page only satisfies the kit config; this page is written with setContent.)
// The constructed page has the selectors the probe reads: a chapter list, #workspace-stage with one
// [data-workspace-block], .setting-row rows. A real click on "code" commits the new chapter with 5 rows in the click task.
//   rows   SETCHAPTER-ROWCOUNT-FIRST-RAF: the commit asks a frame for a callback that adds 20 rows. It runs after the
//          probe's own tick in the same frame, so the first painted frame has 25 rows; 30 more arrive 600 ms later. The
//          probe's first-frame count must be 25, not the tick's 5, and not more than 25.
//   walk   R97 #4: General's first section holds 8 tagged rows (so all six sampled nodes are there), its second 4. In the
//          commit task's microtasks, before the first frame, the page walks the old chapter's SECOND section; the whole
//          old block is walked 800 ms later. The early walk is a walk of the leaving chapter before its first frame and must
//          be counted (the old probe counted only roots holding a sampled node, so it saw none before paint).
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
/* one top-level `const NAME = () => {` ... `};` block of the check's source, as an expression */
function pick(src, name) {
	const m = src.match(new RegExp(`^const ${name} = (\\(\\) => \\{[\\s\\S]*?^\\});`, 'm'));
	if (!m) throw new Error(`no ${name} in the check's source`);
	return m[1];
}

const PAGE = `<!doctype html><html><head><style>body{margin:0;font:14px sans-serif}.setting-row{height:24px}</style></head><body>
<div id="pm-settings-root">
<nav><a href="#" class="domain-link active" data-domain="general">General</a> <a href="#" id="to-code" class="domain-link" data-domain="code" style="display:inline-block;padding:8px">Code</a></nav>
<div id="workspace-stage"></div>
</div>
<script>
const rowsHtml = (n, tag) => Array.from({ length: n }, (_, i) => '<div class="setting-row"><button' + (tag ? ' data-pm-hover-bound="true"' : '') + '>row ' + i + '</button></div>').join('');
const stage = document.getElementById('workspace-stage');
stage.innerHTML = '<div data-workspace-block="general"><section data-section-id="g1">' + rowsHtml(8, true) + '</section><section data-section-id="g2">' + rowsHtml(4, true) + '</section></div>';
window.PM_HOVER_TAG_CONTROLLER = { walked: [], cleanupRemoved(r) { this.walked.push(r.getAttribute('data-section-id') || r.getAttribute('data-workspace-block') || r.tagName); for (const n of r.querySelectorAll('[data-pm-hover-bound="true"]')) n.removeAttribute('data-pm-hover-bound'); } };
document.getElementById('to-code').addEventListener('click', (e) => {
	e.preventDefault();
	const old = stage.firstElementChild;
	const blk = document.createElement('div'); blk.setAttribute('data-workspace-block', 'code');
	blk.innerHTML = rowsHtml(5);
	stage.replaceChildren(blk);
	for (const a of document.querySelectorAll('.domain-link')) a.classList.toggle('active', a.dataset.domain === 'code');
	window.__fx = { committed: performance.now() };
	requestAnimationFrame(() => { blk.insertAdjacentHTML('beforeend', rowsHtml(20)); window.__fx.inFrame = performance.now(); });
	setTimeout(() => { blk.insertAdjacentHTML('beforeend', rowsHtml(30)); window.__fx.late = performance.now(); }, 600);
	queueMicrotask(() => { PM_HOVER_TAG_CONTROLLER.cleanupRemoved(old.children[1]); window.__fx.early = performance.now(); });
	setTimeout(() => PM_HOVER_TAG_CONTROLLER.cleanupRemoved(old), 800);
	window.__fx.old = old;
});
</script></body></html>`;

export const tests = {
	'perf-settings-chapter probe on a constructed chapter switch': async (t) => {
		const file = resolve(String(t.args.check || resolve(here, '../checks/perf-settings-chapter.check.mjs')));
		const src = readFileSync(file, 'utf8');
		t.log(`probe from ${file}`);
		await t.viewport(1280, 800);
		await t.page.setContent(PAGE);
		await t.page.evaluate(`(${pick(src, 'PROBE')})()`);
		await t.page.waitForTimeout(300);
		await t.page.evaluate(`(${pick(src, 'ARM')})()`);
		await t.page.click('#to-code');
		await t.page.waitForTimeout(1500);
		const r = await t.page.evaluate(`(${pick(src, 'COLLECT')})()`);
		const fx = await t.page.evaluate(() => ({ inFrame: !!window.__fx.inFrame, late: !!window.__fx.late, early: !!window.__fx.early, walked: PM_HOVER_TAG_CONTROLLER.walked }));
		t.log(`rows: first frame ${r.rowsFirst} (tick ${r.rowsRaf ?? '-'}), end ${r.rowsEnd}; painted ${r.clickToPainted} ms after the click`);
		await t.check('could judge: the constructed switch ran (in-frame rows and late rows both added, 55 at the end)', fx.inFrame && fx.late && r.rowsEnd === 55, JSON.stringify({ fx, rowsEnd: r.rowsEnd }));
		await t.check('rows: the first frame\'s count includes the rows a later callback of that frame added (25, not 5)', r.rowsFirst === 25, `first-frame count ${r.rowsFirst}`);
		t.log(`walk: page walked ${fx.walked.join(', ')}; probe saw ${r.walks ?? '-'} walk(s) of the old chapter, ${r.cleanupsBeforePaint} before paint; sampled ${r.tagged}, still tagged ${r.taggedStill}`);
		await t.check('could judge walk: the page walked g2 before the frame and the old block later, and six tagged nodes were sampled', fx.early && fx.walked.join(',') === 'g2,general' && r.tagged === 6, JSON.stringify({ fx, tagged: r.tagged }));
		await t.check('walk: the early walk of the old chapter\'s second section counts as a walk before the first frame', r.cleanupsBeforePaint === 1, `${r.cleanupsBeforePaint} walk(s) before paint`);
		await t.check('walk: both walks of the old chapter are seen by collection', r.walks === 2, `${r.walks} walk(s) seen`);
	}
};
