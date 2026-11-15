// Self-test for perf-stop-chip-beat's window waiver (PM7PERF-STOPCHIP-K1-WAIVER).
// A backlight-only jump later in the onboarding window's 3 s must fail.
// A jump of both loops by the same amount in the restyle's own frame is the page-wide one and is waived.
// Usage: node tools/stop-chip-window.selftest.mjs [path to perf-stop-chip-beat.check.mjs]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const page = process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-stop-chip-beat.check.mjs';
const { everyFrame } = await import(page);

const DUR = 3200;
const OPEN = 'onboarding window opens (holds the glyph), no more words';
function chip(id, s, place) {
	return { id, dur: DUR, delay: 0, s, c: 0, rate: 1, place, state: 'running', v: 1 };
}
function ref(s) {
	return [{ id: 7, dur: DUR, delay: 0, s, c: 0, rate: 1, place: 0, state: 'running', v: 0 }];
}
// Forty samples. Most gaps are 16 ms, so the median frame is 16 ms. The open (index 5) has a 90 ms
// gap and the reference loop jumps 80 ms, which the old waiver accepts (80 <= 90 + frame). Index 20
// has a 50 ms gap and, when `later` is set, the backlight's start moves by 50 ms while the glyph's
// does not. `withOpen` moves both chip loops by 80 ms on the open's own frame.
function run({ later, withOpen }) {
	const rows = [];
	let w = 5000;
	for (let i = 0; i < 40; i++) {
		const gap = i === 5 ? 90 : i === 20 ? 50 : 16;
		w += gap;
		const gS = withOpen && i >= 5 ? -80 : 0;
		const bS = (withOpen && i >= 5 ? -80 : 0) + (later && i >= 20 ? 50 : 0);
		const place = 1 + w / DUR;
		rows.push({
			t: w, w, flow: 'waiting', win: i >= 5, th: 'basic-dark', ease: 'ease',
			g: chip(1, gS, place), b: chip(2, bS, place),
			os: ref(i >= 5 ? -80 : 0),
		});
	}
	return { rows, marks: [{ name: OPEN, i: 5, kind: 'window' }] };
}

const late = everyFrame(run({ later: true, withOpen: false }));
assert.ok(late.worst > 1, `a later backlight-only jump must fail (worst ${late.worst}; named: ${(late.known || []).join('; ') || 'none'})`);
const both = everyFrame(run({ later: false, withOpen: true }));
assert.ok(both.worst <= 1 && both.restarts.length === 0, `both loops jumping together on the restyle frame must pass (worst ${both.worst}; ${both.where || ''})`);
// NieR has no glow. The glyph's jump on the reference's frame is the window's. A later glyph jump is not.
function nierRun(laterGlyph) {
	const R = run({ later: false, withOpen: true });
	for (let i = 0; i < R.rows.length; i++) {
		delete R.rows[i].b;
		R.rows[i].nier = 'on';
		if (laterGlyph && i >= 20) R.rows[i].g.s = -30;
	}
	return R;
}
const nierOk = everyFrame(nierRun(false));
assert.ok(nierOk.worst <= 1 && nierOk.restarts.length === 0, `NieR's glyph jumping with the reference must pass (worst ${nierOk.worst}; ${nierOk.where || ''})`);
const nierLate = everyFrame(nierRun(true));
assert.ok(nierLate.worst > 1, `a later NieR glyph jump must fail (worst ${nierLate.worst}; named: ${(nierLate.known || []).join('; ') || 'none'})`);
console.log('stop-chip-window: 4 cases pass');
