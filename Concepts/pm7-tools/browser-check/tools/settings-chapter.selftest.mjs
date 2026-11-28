// checks/perf-settings-chapter's verdicts on constructed rows: no browser (TIB-P7, 2026-11-20).
// node tools/settings-chapter.selftest.mjs
// The page probe itself is tested in a browser on a constructed page: diagnostics/settings-chapter-probe.check.mjs.
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { runInNewContext } from 'node:vm';
import { readdirSync, readFileSync } from 'node:fs';
import { firstScreenVerdict, restoreJudgeable, flingVerdict, hoverVerdict, arrivalVerdict, FILL_WAIT, press, selectAllModifier, flingScrollGate, filmFling, flingFilm, FLING_FILM, FLING_RETRY, flingAttempt, retryFling, flingRetryVerdict, FLING_ROUTES, FLING_LOOKS, flingLooks, flingRoute, runFlingLook, filmBands, tabEndVerdict, tabEndRoute, TAB_END_TRAVEL, rosterEndVerdict, rosterEndRoute, wpkHomeVerdict, wpkHomeRoute, GUARD_TRAVEL, ROSTER_MIN_ROOM, WPK_MIN_TOP, endLandVerdict, endLandRoute, END_GAP, END_REPS, END_MIN_TRAVEL, END_SETTLE, END_CAP, tests } from '../checks/perf-settings-chapter.check.mjs';
import { encodePng, decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
const uncomment = (src) => src.replace(/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,
	(token) => token.startsWith('/') ? token.replace(/[^\n]/g, ' ') : token);
const live = (src, re) => re.test(uncomment(src));
const invoke = (fn, globals, arg) => runInNewContext(`(${fn})(arg)`, { ...globals, arg });
const decodeOnce = (png) => decodePng(png);
/* the round 1 reading, kept here only to show what it counted: the share of a rect's pixels ten or more grey levels from
   its commonest level */
const modeSpread = (img, rect) => {
	const hist = new Uint32Array(256); let n = 0;
	for (let y = rect.y0; y < rect.y1; y++) for (let x = rect.x0; x < rect.x1; x++) { const i = (y * img.width + x) * 4; hist[Math.round(0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2])]++; n++; }
	let mode = 0; for (let g = 0; g < 256; g++) if (hist[g] > hist[mode]) mode = g;
	let far = 0; for (let g = 0; g < 256; g++) if (Math.abs(g - mode) >= 10) far += hist[g];
	return far / n;
};

/* SETCHAPTER-ROWCOUNT-FIRST-RAF: the first-screen row over the Code & Tools arrivals */
{
	const arrival = (pair, rowsFirst, rowsEnd, rowsRaf = rowsFirst) => ({ pair, to: 'code', rowsFirst, rowsEnd, rowsRaf });
	// a first screen: fewer rows at the first frame's end than at collection
	assert.equal(firstScreenVerdict([arrival('general->code', 41, 133), arrival('ai->code', 38, 133)]).ok, true, 'a first screen passes');
	// the defect the old read could not see: the tick read 41 but a later callback of that frame built all 133
	const late = firstScreenVerdict([arrival('general->code', 133, 133, 41)]);
	assert.equal(late.ok, false, 'all rows at the first frame\'s end fail, whatever the tick read');
	assert.match(late.detail, /all 133 rows were built for the first frame/);
	// no end read: not judged as a first screen (the old check took the tick's count, or 0)
	const unread = firstScreenVerdict([arrival('general->code', null, 133, 41)]);
	assert.equal(unread.ok, false, 'a frame without its end read is not a first screen');
	assert.match(unread.detail, /not read at that frame's end \(41 at its first animation-frame callback\)/);
	// no arrival at Code & Tools at all
	assert.equal(firstScreenVerdict([]).ok, false, 'no arrival at Code & Tools cannot pass');
	console.log('PASS first screen: judged on the count read at the first frame\'s end, never on the tick\'s count');
}

/* SETCHAPTER-RESTORE-PENDING-AT-TRANSACTION: the restore-all row's precondition, at the transaction's start */
{
	const at = (domain, pending, saved) => ({ eagerAtAccept: true, accepted: true, changedAtAccept: true, atTransaction: { domain, pending, saved } });
	assert.equal(restoreJudgeable(at('code', 31, true)).ok, true, 'Code pending and saved at the transaction: judged');
	// the hypothetical of R91, with eager saves: acceptance was fine, but the transaction ran after the fill finished
	const late = restoreJudgeable(at('code', 0, true));
	assert.equal(late.ok, false, 'no pending list at the transaction: the row did not cross the chapter change');
	assert.match(late.detail, /switch had finished before the transaction/);
	assert.equal(restoreJudgeable(at('general', 12, true)).ok, false, 'another chapter at the transaction');
	assert.equal(restoreJudgeable(at('code', 12, false)).ok, false, 'Code not saved by the transaction');
	assert.equal(restoreJudgeable({ eagerAtAccept: true }).ok, false, 'no transaction at all');
	console.log('PASS restore-all: judged at the transaction\'s start (Code, pending row lists, saved), not only at acceptance');
}

/* R97 #3: the fling's precondition at wheel delivery, and the target in the sampled view */
{
	const fling = (o) => ({ committed: true, pending: 33, targetPending: true, wheel: 1200, wheelPending: 30, wheelTargetPending: true, sampled: true, start: 0, top: 2900, moved: 2900, height: 880, targetInView: true, empty: [], ...o });
	const ok = (r) => flingVerdict(r).slice(0, 3).map((x) => x.ok);
	assert.deepEqual(ok(fling({})), [true, true, true], 'pending at the wheel, a viewport crossed onto Terminal look, nothing empty: passes');
	assert.equal(flingVerdict(fling({}))[3].ok, false, 'FO-245: without screencast frames the displayed frames are not judged, so the fling cannot pass');
	// R97 #3's case: pending at the commit, but the idle fill finished before the wheel; the old row passed on the commit's sample
	const filled = flingVerdict(fling({ wheelPending: 0, wheelTargetPending: false }));
	assert.equal(filled[0].ok, false, 'Terminal look already filled at the wheel: the fling did not test a pending target');
	assert.match(filled[0].detail, /at wheel delivery 0 lists pending, Terminal look pending false \(at commit 33, true\)/);
	assert.equal(flingVerdict(fling({ wheel: 0 }))[0].ok, false, 'no wheel seen');
	// a viewport crossed, but the sample frame has Terminal look out of view
	assert.equal(flingVerdict(fling({ targetInView: false }))[1].ok, false, 'the target not in the sampled view');
	assert.equal(flingVerdict(fling({ empty: ['editor-terminal-look'] }))[2].ok, false, 'an empty visible list fails');
	console.log('PASS fling: pending judged at wheel delivery, and Terminal look in the sampled view');
}

/* R97 #4: the release rows need a sampled leaving chapter and a seen walk of it */
{
	const sw = (pair, o) => ({ pair, tagged: 6, taggedAll: 1900, walks: 2, cleanupsBeforePaint: 0, taggedStill: 0, ...o });
	const ok = (rows) => hoverVerdict(rows).map((x) => x.ok);
	assert.deepEqual(ok([sw('general->code'), sw('code->ai')]), [true, true, true], 'sampled, walked after the frame, released: passes');
	// R97 #4's case: nothing sampled; the old two rows (walks before paint, still tagged) both passed on it
	const none = hoverVerdict([sw('ai->general', { tagged: 0, taggedAll: 0, walks: 0 })]);
	assert.deepEqual(none.map((x) => x.ok), [false, true, true], 'no sampled tag: could not judge');
	assert.match(none[0].detail, /ai->general: no tagged node of the leaving chapter was sampled/);
	// sampled but no walk of the leaving chapter seen (an instrumentation that misses the walk passed the frame row)
	const unseen = hoverVerdict([sw('general->code', { walks: 0 })]);
	assert.equal(unseen[0].ok, false, 'no walk seen: could not judge');
	assert.match(unseen[0].detail, /no walk of the leaving chapter was seen/);
	assert.equal(hoverVerdict([sw('general->code', { cleanupsBeforePaint: 1 })])[1].ok, false, 'a walk before the first frame fails');
	assert.equal(hoverVerdict([sw('general->code', { taggedStill: 2 })])[2].ok, false, 'tags kept fail');
	assert.equal(hoverVerdict([])[0].ok, false, 'no switch');
	console.log('PASS hover release: judged only with sampled leaving-chapter tags and a seen walk of that chapter');
}

/* R97 #4 + PM7PERF-SETCHAPTER-HOVER-SAMPLE-UNQUALIFIED: the matrix qualifies the outgoing tagged-control input with
 * a real hover of the leaving chapter's control BEFORE the bounded tag wait (the stock walk reached the AI chapter
 * with zero bound tags; astra-max-15: an ordinary mouse hover opened a real outgoing control tip and both pages
 * passed 17/17). The bounded wait and the explicit missing-witness result stay. */
{
	const CONTROL = '#workspace-stage .setting-row :is(button, input, select, textarea, [role="switch"], [role="slider"], [role="checkbox"])';
	const run = async (waitForHoverTags, censusFinishesOn, controlExists = true) => {
		const events = [];
		let tagged = 0, waits = 0;
		const f = {
			locator: (selector) => ({
				first: () => ({
					count: async () => { assert.equal(selector, CONTROL, 'the hover qualifies a real control of the leaving chapter'); return controlExists ? 1 : 0; },
					boundingBox: async () => selector === CONTROL ? { x: 100, y: 200, width: 80, height: 20 } : { x: 0, y: 0, width: 60, height: 20 },
					waitFor: async ({ state, timeout }) => {
						assert.equal(selector, '#workspace-stage [data-pm-hover-bound="true"]');
						assert.equal(state, 'attached');
						assert.ok(timeout > 0, 'the wait is bounded');
						events.push('wait for tags');
						await Promise.resolve();
						if (++waits < censusFinishesOn) throw Object.assign(new Error('no tag appeared'), { name: 'TimeoutError' });
						tagged = 1;
					}
				})
			}),
			evaluate: async () => { events.push('sample'); return { tagged }; }
		};
		const mouse = { move: async (x, y) => { if (x === 140 && y === 210) events.push('hover control'); }, down: async () => { events.push('press'); }, up: async () => {} };
		const t = { page: { mouse, waitForTimeout: async () => {} } };
		const sample = await press(t, f, 'ai', { waitForHoverTags });
		return { events, tagged: sample.tagged };
	};
	assert.deepEqual(await run(true, 1), { events: ['hover control', 'wait for tags', 'sample', 'press'], tagged: 1 },
		'a real hover of the leaving chapter\'s control precedes the bounded tag wait, the sample and the press');
	assert.deepEqual(await run(true, 2), { events: ['hover control', 'wait for tags', 'sample', 'hover control', 'wait for tags', 'sample', 'press'], tagged: 1 },
		'a second qualification samples the late tag before the first and only switch');
	assert.deepEqual(await run(true, Infinity), { events: ['hover control', 'wait for tags', 'sample', 'hover control', 'wait for tags', 'sample', 'press'], tagged: 0 },
		'two timed-out censuses retain the missing-witness verdict');
	assert.deepEqual(await run(true, Infinity, false), { events: ['wait for tags', 'sample', 'wait for tags', 'sample', 'press'], tagged: 0 },
		'no hoverable control: the bounded wait and the missing-witness result stay');
	assert.deepEqual(await run(false, 1), { events: ['sample', 'press'], tagged: 0 },
		'presses outside the hover matrix keep their original schedule');
	console.log('PASS hover setup: a real control hover qualifies the outgoing tagged input before the bounded wait; a missing control or tag keeps the explicit missing-witness result');
}

/* R132-FOLLOWUPS 3: a programmatic scroll before the wheel must not be credited as the wheel's travel. The commit
 * records R.start; a scroll listener that arms without the delivered wheel and measures moved from R.start credits
 * any pre-wheel programmatic scroll (the page's own focus/restore scroll) as the fling. */
{
	assert.equal(typeof flingScrollGate, 'function', 'the fling scroll gate needs the delivered wheel; the base credited pre-wheel programmatic travel');
	const R = { committed: true, wheel: null, wheelTop: null, start: 0, height: 800, sampled: false, armed: false };
	// a programmatic scroll crosses the viewport before any wheel: it must not arm, and credits no travel
	assert.equal(flingScrollGate(R, 900).arms, false, 'no delivered wheel: a programmatic scroll cannot arm the sample');
	assert.equal(flingScrollGate(R, 900).moved, null, 'no wheel delivery position: no travel is credited');
	// the wheel is delivered at scrollTop 900 (after the programmatic scroll); a further 50 px is the wheel's own
	const delivered = { ...R, wheel: 1234, wheelTop: 900 };
	const g = flingScrollGate(delivered, 950);
	assert.equal(g.arms, true, 'a scroll after the delivered wheel arms');
	assert.equal(g.moved, 50, 'the travel is measured from the wheel delivery position, not the commit');
	// and the verdict fails the viewport crossing on that 50 px: the programmatic 900 px is not the wheel's
	const rows = flingVerdict({ wheel: 1234, wheelPending: 5, wheelTargetPending: true, pending: 5, targetPending: true, sampled: true, moved: g.moved, height: 800, targetInView: true, empty: [] });
	assert.equal(rows[1].ok, false, 'the wheel itself crossed no viewport: the row fails');
	// a real fling from the delivery position keeps its pass
	const real = flingScrollGate({ ...delivered, wheelTop: 0 }, 900);
	assert.equal(real.arms, true);
	assert.equal(real.moved, 900);
	assert.equal(flingVerdict({ wheel: 1234, wheelPending: 5, wheelTargetPending: true, pending: 5, targetPending: true, sampled: true, moved: real.moved, height: 800, targetInView: true, empty: [] })[1].ok, true);
	// an already-sampled or armed record does not arm again
	assert.equal(flingScrollGate({ ...delivered, sampled: true }, 1800).arms, false);
	assert.equal(flingScrollGate({ ...delivered, armed: true }, 1800).arms, false);
	console.log('PASS fling travel: a pre-wheel programmatic scroll neither arms nor credits travel; the wheel travel is measured from its delivery position, and a real fling keeps its pass');
}

/* FO-245: the fling is judged on the compositor's frames. Astra's batch-21 films showed one to seven blank frames while
 * the DOM rows passed; on the published page the list was filled before the scroll frame and content-visibility had
 * skipped the destination sections in that frame. Constructed screencast frames (PNG, the half-size the check asks for)
 * go through the live recorder (filmFling, fed by a stand-in CDP session) and the live judge (flingFilm, flingVerdict). */
{
	// a match in live code: not on a line holding a line comment before it, and not inside a block comment
	const fling = (o) => ({ committed: true, pending: 33, targetPending: true, wheel: 1200, wheelPending: 30, wheelTargetPending: true, sampled: true, start: 0, top: 2900, moved: 2900, height: 880, targetInView: true, empty: [], ...o });
	const view = { width: 1920, height: 1080 }, box = { x: 627, y: 143, width: 685, height: 912 }, W = FLING_FILM.width, H = FLING_FILM.height;
	// a frame: the list's ground with text-like rules every 12 px from `phase`, leaving `holes` bands (0-3) empty
	const frame = (phase, { holes = [], blank = false, faint = [], wipe } = {}) => {
		const data = Buffer.alloc(W * H * 4);
		for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
			const i = (y * W + x) * 4, inDoc = x >= 313 && x < 656 && y >= 71 && y < 527;
			const band = Math.floor((y - 83) / Math.floor((515 - 83) / 4));
			const erased = wipe && y >= wipe[0] && y < wipe[1];
			const ink = inDoc && !blank && !erased && !holes.includes(band) && (y + phase) % 12 < 2 && (x + phase) % 9 < 6 && (!faint.includes(band) || (x + phase) % 180 < 6);
			const g = ink ? 200 : inDoc ? 45 : 20;
			data[i] = data[i + 1] = data[i + 2] = g; data[i + 3] = 255;
		}
		return encodePng({ width: W, height: H, data });
	};
	const SRC = frame(0), DST = frame(5), BLANK = frame(0, { blank: true }), HOLE = frame(5, { holes: [2] });
	const wheel = 1_000_000;
	// frames every 16.7 ms: [ms from the wheel, png]
	const film = (seq) => seq.map(([dt, png]) => ({ wall: wheel + dt, png }));
	const run = (seq, times) => flingFilm(film(seq), { box, view, wheel, ...times });
	const v = (seq, r = fling({})) => flingVerdict(r, run(seq))[3];
	const at = (from, n, png) => Array.from({ length: n }, (_, k) => [from + k * 16.7, png]);
	const good = [...at(-83.5, 5, SRC), ...at(16.7, 20, DST)];
	assert.equal(v(good).ok, true, `the destination on its first displayed frame passes: ${v(good).detail}`);
	assert.equal(run(good).dest.dt, 16.7, 'the first destination frame is the first frame after the wheel that shows the new view');
	const blank = [...at(-83.5, 5, SRC), ...at(16.7, 3, BLANK), ...at(66.8, 20, DST)];
	const b = v(blank);
	assert.equal(b.ok, false, 'Astra\'s case: blank frames between the source and the destination rows fail');
	assert.match(b.detail, /first destination frame 5 at 16\.7 ms \[(?:0, )+0\] BLANK; 3 blank or unfilled frame\(s\)/);
	const hole = [...at(-83.5, 5, SRC), ...at(16.7, 2, HOLE), ...at(50.1, 20, DST)];
	assert.equal(v(hole).ok, false, 'a frame whose rows are missing in one band of the view (an unfilled list) fails');
	// a blank frame after a good first destination frame (a hand-back that let content-visibility skip the rows again)
	const late = [...at(-83.5, 5, SRC), ...at(16.7, 3, DST), ...at(66.8, 2, BLANK), ...at(100.2, 20, DST)];
	assert.equal(run(late).dest.bad, false, 'the first destination frame itself shows the rows');
	assert.equal(v(late).ok, false, 'a later blank frame after the wheel still fails');
	// a lost frame next to the arrival: the gap could have held a blank frame, so the fling is not judged
	const lost = [...at(-83.5, 5, SRC), ...at(100.2, 20, DST)];
	assert.equal(v(lost).ok, false, 'a gap of six frames from the last source frame to the destination is not judged');
	assert.match(v(lost).detail, /over three medians or unmeasured/);
	assert.equal(v(at(-83.5, 25, SRC)).ok, false, 'a view that never moved has no destination frame');
	assert.equal(v([...at(-83.5, 5, SRC)]).ok, false, 'no frame after the wheel');
	// FO-245 r2 (R141 finding 2): a blank frame just after the recorded wheel time is judged, not taken for the source
	const justAfter = [...at(-83.5, 5, SRC), [1, BLANK], ...at(16.7, 20, DST)];
	assert.equal(run(justAfter).dest.dt, 1, 'the blank frame 1 ms after the wheel is the first destination frame');
	assert.equal(v(justAfter).ok, false, 'a blank frame just after the recorded wheel time fails');
	// A245 frame 892: replay the one-frame shape, a shifted dispatch epoch, and the same timeline with the frame lost.
	const single = [...at(-83.5, 5, SRC), [0, BLANK], ...at(16.7, 20, DST)];
	assert.equal(run(single).bad.length, 1, 'one witnessed blank is enough');
	const shifted = run(single, { commit: wheel - 50, wheel: wheel + 8 });
	assert.equal(shifted.bad.length, 1, 'a blank after commit and before the recorded wheel still fails');
	const dropped = run(single.filter(([dt]) => dt !== 0));
	assert.equal(dropped.resolved, true, 'the three-median policy still accepts this gap');
	assert.equal(dropped.bad.length, 0, 'no pixel verdict for an absent frame');
	assert.equal(dropped.unwitnessed, 1, 'the accepted gap reports an unwitnessed interval');
	assert.match(v(good).detail, /accepted gap can hide a blank shorter than about two capture intervals/);
	const edge = (delta) => run([...at(-83.5, 5, SRC), ...at(delta, 20, DST)]);
	assert.equal(edge(33.4).resolved, true, 'three capture medians are allowed');
	assert.equal(edge(41.8).resolved, false, '3.5 capture medians fail closed');
	const local = frame(5, { wipe: [111, 136] });
	const localFilm = [...at(-83.5, 5, SRC), [16.7, local], ...at(33.4, 20, DST)];
	const coarse = (png) => filmBands(decodeOnce(png), run(good).rect, 4);
	assert.ok(coarse(local).every((v, k) => v >= coarse(DST)[k] * FLING_FILM.keep), 'the old quarter bands miss this 50 px blank');
	assert.equal(run(localFilm).bad.length, 1, 'a single blank smaller than a quarter band fails');
	const sparse = frame(5, { holes: [1, 2, 3] });
	const sparseReading = run([...at(-83.5, 5, SRC), ...at(16.7, 20, sparse)]);
	assert.ok(sparseReading.judged >= 2 && sparseReading.judgedQuarters === 1, 'narrow bands cannot replace two occupied quarters');
	assert.equal(flingVerdict(fling({}), sparseReading)[3].ok, false, 'the sparse settled reference still fails closed');
	// a film that stopped before the fling settled: its last frame is the source, so nothing is judged as settled
	const unsettled = [...at(-83.5, 5, SRC), ...at(16.7, 2, SRC)];
	assert.equal(run(unsettled).moved, 0, 'the settled frame is the source view');
	assert.equal(v(unsettled).ok, false, 'a film stopped before settle cannot pass');
	// a band at a twentieth of its settled ink is unfilled (the keep share is a tenth, not a hundredth)
	const FAINT = frame(5, { faint: [1] }), faint = [...at(-83.5, 5, SRC), ...at(16.7, 2, FAINT), ...at(50.1, 20, DST)];
	assert.ok(run(faint).bad.length === 2 && run(faint).bad[0].bands[1] > 0, `a faint band is read as faint, not empty: ${JSON.stringify(run(faint).bad[0])}`);
	assert.equal(v(faint).ok, false, 'a band far under a tenth of its settled ink fails');
	// FO-245 r3 (A245 high finding 2): Glass wallpaper is not rows. A smooth multi-wave gradient over the whole document,
	// with no row on it, must read blank in every band; the same gradient with rows on it is the destination. The round 1
	// reading (pixels ten grey levels from the band's commonest level) took the gradient for ink, and this case proves it.
	const glass = (phase, rows) => {
		const data = Buffer.alloc(W * H * 4);
		for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
			const i = (y * W + x) * 4, inDoc = x >= 313 && x < 656 && y >= 71 && y < 527;
			const wave = 100 + 45 * Math.sin(x / 37 + y / 53) + 30 * Math.sin(y / 91 - x / 140) + 20 * Math.sin((x + y) / 23);
			const ink = rows && inDoc && (y + phase) % 12 < 2 && (x + phase) % 9 < 6;
			const r = ink ? 235 : wave * 0.7, g = ink ? 235 : wave * 0.8, b = ink ? 240 : Math.min(255, wave * 1.6 + 30);
			data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
		}
		return encodePng({ width: W, height: H, data });
	};
	const WALL = glass(0, false), GSRC = glass(0, true), GDST = glass(5, true);
	{
		const r = run([...at(-83.5, 5, GSRC), ...at(16.7, 4, WALL), ...at(83.5, 20, GDST)]);
		assert.ok(r.settled.every((x) => x >= FLING_FILM.floor), `rows over the gradient read as detail: ${r.settled}`);
		assert.ok(r.bad.length === 4 && r.bad.every((x) => x.bands.every((b) => b < 0.005)), `a wallpaper-only frame reads blank in every band: ${JSON.stringify(r.bad[0])}`);
		assert.equal(r.dest.bad, true, 'the wallpaper-only first destination frame is BLANK');
		assert.equal(v([...at(-83.5, 5, GSRC), ...at(16.7, 4, WALL), ...at(83.5, 20, GDST)]).ok, false, 'a Glass fling that shows only wallpaper fails');
		assert.equal(v([...at(-83.5, 5, GSRC), ...at(16.7, 20, GDST)]).ok, true, 'rows over the Glass wallpaper on the first destination frame pass');
		// the measure itself: the gradient has grey spread (the round 1 reading counted it), and no edge detail
		const rect = r.rect, wall = filmBands(decodeOnce(WALL), rect), rows = filmBands(decodeOnce(GDST), rect);
		assert.ok(wall.every((x) => x === 0), `the gradient alone has no edge detail: ${wall}`);
		assert.ok(rows.every((x) => x > 0.02), `rows over it do: ${rows}`);
		assert.ok(modeSpread(decodeOnce(WALL), rect) > 0.2, 'the gradient is spread out in grey levels (what the round 1 reading counted as ink)');
		assert.equal(FLING_FILM.keep, 0.3, 'a band under three tenths of its settled detail is unfilled');
		assert.equal(FLING_FILM.edge, 24, 'a detail pixel steps 24 grey levels to its neighbour');
	}
	// FO-245 r2 (R141 finding 1): the bounded retry. Each attempt is a reading of a constructed film through the live judge;
	// retryFling drives them in order and flingRetryVerdict judges the list.
	assert.equal(FLING_RETRY.attempts, 5, 'at most five attempts per look and surface');
	const lostBlank = [...at(-83.5, 5, SRC), ...at(100.2, 2, BLANK), ...at(133.6, 20, DST)];
	assert.equal(run(lostBlank).resolved, false, 'a lost arrival that also shows blank frames is unresolved');
	const drive = async (seqs, r = () => fling({})) => {
		const driven = [];
		const list = await retryFling(async (k) => { driven.push(k); return { r: r(k), px: run(seqs[k - 1]) }; });
		return { driven, list, rows: flingRetryVerdict(list) };
	};
	{
		const d = await drive([lost, good, good]);
		assert.deepEqual(d.driven, [1, 2], 'an unresolved clean attempt is retried; a resolved one decides');
		assert.deepEqual(d.rows.map((x) => x.ok), [true, true, true, true], `unresolved, then resolved and clean, passes: ${d.rows[3].detail}`);
		assert.match(d.rows[3].detail, /attempt 1: not resolved, span gap 116\.9 ms \/ median 16\.7 ms \(\d+ frames\), 0 bad frame\(s\) -> retry; attempt 2: resolved, span gap 33\.4 ms \/ median 16\.7 ms/, 'every attempt\'s gap and median is logged');
	}
	{
		const d = await drive([lost, lost, good]);
		assert.deepEqual(d.driven, [1, 2, 3]); assert.equal(d.rows[3].ok, true, 'a third attempt that resolves clean passes');
	}
	{
		const d = await drive([lost, lost, lost, lost, good]);
		assert.deepEqual(d.driven, [1, 2, 3, 4, 5]); assert.equal(d.rows[3].ok, true, 'a fifth attempt that resolves clean passes');
	}
	{
		const d = await drive([lost, lost, lost, lost, lost, good]);
		assert.deepEqual(d.driven, [1, 2, 3, 4, 5], 'five attempts at most');
		assert.equal(d.rows[3].ok, false, 'five unresolved attempts fail: not judged never passes');
		assert.match(d.rows[3].name, /^not judged \(host load\):/);
		assert.match(d.rows[3].detail, /^not judged \(host load\): 5 attempts unresolved, 0 bad frames, gaps /);
	}
	for (const [seqs, driven, why] of [[[blank, good, good], [1], 'a resolved bad first attempt'], [[lost, blank, good], [1, 2], 'a resolved bad second attempt'], [[lostBlank, good, good], [1], 'an unresolved attempt with bad frames'], [[lost, lostBlank, good], [1, 2], 'a later unresolved attempt with bad frames'], [[late, good, good], [1], 'a later blank after a good first destination']]) {
		const d = await drive(seqs);
		assert.deepEqual(d.driven, driven, `${why} decides at once, no retry`);
		assert.equal(d.rows[3].ok, false, `${why} fails`);
		assert.doesNotMatch(d.rows[3].name, /host load/);
	}
	const idleFill = { wheelPending: 0, wheelTargetPending: false };
	{
		const d = await drive([good, good], (k) => fling(k === 1 ? idleFill : {}));
		assert.deepEqual(d.driven, [1, 2]);
		assert.deepEqual(d.rows.map((r) => r.ok), [true, true, true, true], 'an idle-fill miss followed by a qualified attempt passes');
		assert.match(d.rows[3].detail, /Terminal look filled before the wheel/);
		const exhausted = await drive(Array(5).fill(good), () => fling(idleFill));
		assert.equal(exhausted.rows[0].ok, false, 'idle fills alone never witness the precondition');
		assert.doesNotMatch(exhausted.rows[3].name, /host load/);
		const badIdle = await drive([blank, good], () => fling(idleFill));
		assert.deepEqual(badIdle.driven, [1], 'idle fill never hides a witnessed bad frame');
		assert.equal(badIdle.rows[3].ok, false);
	}
	// the route rows cannot be shopped for: an attempt failing one stops the retry and fails, and every attempt is held to them
	{
		const d = await drive([lost, good, good], (k) => fling(k === 1 ? { targetInView: false } : {}));
		assert.deepEqual(d.driven, [1], 'an attempt that fails a route row is not retried');
		assert.equal(d.rows[1].ok, false, 'the travel and target row fails');
		const shop = flingRetryVerdict([{ k: 1, ...flingAttempt(fling({ targetPending: false, wheelTargetPending: false }), run(lost)) }, { k: 2, ...flingAttempt(fling({}), run(good)) }]);
		assert.equal(shop[0].ok, false, 'a route row failed on any attempt fails, even when the deciding attempt passes it');
		assert.equal(flingAttempt(fling({ moved: 100 }), run(lost)).retry, false, 'too little wheel travel is not a capture gap');
		assert.equal(flingAttempt(fling({ wheel: 0 }), run(lost)).retry, false, 'no trusted wheel is not a capture gap');
	}
	assert.deepEqual(flingRetryVerdict([]).map((x) => x.ok), [false, false, false, false], 'no attempt cannot pass');
	assert.equal(flingRetryVerdict([{ k: 1, ...flingAttempt(fling({}), run(lostBlank)) }, { k: 2, ...flingAttempt(fling({}), run(good)) }])[3].ok, false, 'a list holding a bad frame in any attempt fails, even when the last attempt is clean');
	console.log('PASS fling retry: an unresolved clean capture is driven again, five attempts at most; a resolved clean attempt passes, any bad frame or route failure fails at once, five unresolved fail');
	// the live recorder: a stand-in CDP session that films the constructed sequence once screencasting starts
	const recorded = await (async () => {
		const client = new EventEmitter(), acks = [], calls = [];
		client.send = async (method, params) => {
			calls.push([method, params]);
			if (method === 'Page.screencastFrameAck') acks.push(params.sessionId);
			if (method === 'Page.startScreencast') setTimeout(() => blank.slice().reverse().forEach(([dt, png], k) => client.emit('Page.screencastFrame', { sessionId: k, data: png.toString('base64'), metadata: { timestamp: (wheel + dt) / 1000 } })), 0);
			return {};
		};
		const rec = await filmFling(client);
		await new Promise((r) => setTimeout(r, 20));
		const frames = await rec.stop();
		return { frames, acks, calls };
	})();
	assert.deepEqual(recorded.calls[0], ['Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: W, maxHeight: H }], 'every frame, half size, PNG');
	assert.equal(recorded.acks.length, blank.length, 'each frame is acknowledged at once, so Chrome keeps sending');
	assert.equal(recorded.calls.at(-1)[0], 'Page.stopScreencast');
	assert.deepEqual(recorded.frames.map((f) => Math.round(f.wall - wheel)), blank.map(([dt]) => Math.round(dt)), 'frames come back in display order with their swap times');
	assert.equal(flingVerdict(fling({}), flingFilm(recorded.frames, { box, view, wheel }))[3].ok, false, 'the recorded blank sequence fails through the live path');
	// the live test calls the recorder and the judge (a revert to the DOM-only verdict, or a recorder or judge of its own,
	// fails here), keeps the capture-fidelity marker running by Web Animations, and keeps its wheel gate (ASTRA21-SETTINGS-LIVE-ARM)
	// FO-245 r2 (R141 finding 2): a pin holds only on live code, never on a commented-out copy of it
	assert.equal(live('const url = "https://example.test"; call(); // hidden();', /call\(\);/), true, 'a URL before a live statement is not a comment');
	assert.equal(live('const text = "/*"; call();', /call\(\);/), true, 'quoted block delimiters are not comments');
	assert.equal(live('a();\n//b();\n/* c();\n*/ d();', /b\(\);/), false, 'live(): a line comment is not live code');
	assert.equal(live('a();\n/* c();\n*/ d();', /c\(\);/), false, 'live(): a block comment is not live code');
	assert.equal(live('a();\n/* c();\n*/ d();', /d\(\);/), true, 'live(): code after a block comment is live');
	// FO-245 r3: the fling routes share one live runner, flingRoute; each surface's test runs it with its route
	for (const surface of ['normal', 'sandbox']) {
		for (const [name, route] of [[`R93 #4 a fast wheel into lower Code fills visible lists before the frame (${surface})`, 'terminal'],
			[`R93 #4 a single long wheel to the bottom of a fresh Code & Tools paints its last page (${surface})`, 'wheel-bottom']]) {
			assert.equal(typeof tests[name], 'function', `FO-245 r3: the ${route} route is a live test on the ${surface} surface`);
			assert.ok(live(String(tests[name]), new RegExp(`flingRoute\\(t, surface, '${route}'\\)`)), `the ${route} test runs the shared runner with its route`);
		}
		// FO-245 r5 (option C): the End/Home listener is reverted, so the End fling routes are deferred to FO-248. Registered
		// now they would be red, as on main; registering one again is FO-248's change and must update this pin.
		for (const name of [`R93 #4 End from a fresh Code & Tools paints its last page (${surface})`, `R93 #4 End after a text click from a fresh Code & Tools paints its last page (${surface})`])
			assert.equal(tests[name], undefined, `FO-245 r5: "${name}" is not registered until FO-248`);
		assert.equal(Object.keys(tests).some((k) => k.includes(`(${surface})`) && /flingRoute\(t, surface, 'end(-text)?'\)/.test(String(tests[k]))), false, `FO-245 r5: no ${surface} test runs an End fling route`);
	}
	// Execute the same attempt and check sink as the browser runner. CDP and the DOM are deterministic stand-ins.
	const exercise = async (route, seqs) => {
		const names = [], wheelDeltas = [], receipts = [], rows = [];
		let attempt = -1, now = 0, observer, marker, settling = false;
		const handlers = new Map(), window = {
			addEventListener: (event, fn) => handlers.set(event, fn),
			removeEventListener: (event) => handlers.delete(event)
		};
		const performance = { timeOrigin: wheel - 500, now: () => now };
		const rect = { top: 0, bottom: 912, height: 912 };
		const sc = { id: 'settings-document', scrollTop: 0, scrollHeight: 2800, clientHeight: 912,
			getBoundingClientRect: () => rect, querySelectorAll: () => [] };
		const terminal = { getBoundingClientRect: () => ({ top: 500, bottom: 600, height: 100 }), querySelector: () => ({}) };
		const last = { closest: () => ({ getBoundingClientRect: () => rect }), dataset: { workspaceMounted: 'false' } };
		const root = {
			querySelector: (sel) => ({
				'.domain-link.active': { dataset: { domain: 'code' } },
				'#settings-document': sc, '#section-editor-terminal-look': terminal
			})[sel],
			querySelectorAll: (sel) => sel.includes('workspace-body') ? [last] : [{}, {}, {}]
		};
		const document = { getElementById: () => root, querySelector: () => sc, body: {} };
		const MutationObserver = class {
			constructor(fn) { observer = fn; }
			observe() {}
			disconnect() {}
		};
		const globals = { window, document, performance, MutationObserver, requestAnimationFrame: (fn) => fn() };
		const f = {
			locator: (sel) => ({
				first: () => ({
					click: async () => {
						const start = sel.includes('"general"');
						names.push(start ? 'general' : 'code');
						if (start) { attempt++; sc.scrollTop = 0; }
						else { now = 450; observer(); }
					}
				}),
				boundingBox: async () => box
			}),
			evaluate: async (fn, arg) => invoke(fn, globals, arg),
			waitForFunction: async (fn, arg, options) => {
				if (options.timeout !== 15000) return assert.equal(invoke(fn, globals, arg), true);
				const start = now;
				await invoke(fn, { ...globals, requestAnimationFrame: (fn) => setImmediate(() => {
					now += 250;
					if (now - start === 500) sc.scrollTop++;
					fn();
				}) });
				settling = now - start >= 1500;
			}
		};
		const cdps = [];
		const page = {
			waitForTimeout: async () => {},
			waitForFunction: async (fn) => invoke(fn, globals),
			viewportSize: () => view,
			evaluate: async (fn) => invoke(fn, { document: {
				createElement: () => ({ style: {}, setAttribute() {}, animate() { marker = true; } }),
				documentElement: { appendChild() {} },
				getElementById: () => ({ remove() { marker = false; } })
			} }),
			mouse: {
				move: async () => {},
				wheel: async (_, delta) => {
					wheelDeltas.push(delta);
					now = 525;
					handlers.get('wheel')({ type: 'wheel', isTrusted: false, timeStamp: 450 });
					assert.equal(window.__pscFling.wheel, undefined, 'synthetic input cannot arm');
					handlers.get('wheel')({ type: 'wheel', isTrusted: true, timeStamp: 500 });
					sc.scrollTop = 1500;
					handlers.get('scroll')({ target: sc });
					receipts.push({ ...window.__pscFling });
				}
			},
			context: () => ({ newCDPSession: async () => {
				const c = new EventEmitter();
				settling = false;
				c.send = async (name) => {
					if (name === 'Page.startScreencast') {
						assert.equal(marker, true, 'vsync marker is animating when capture starts');
						for (const [k, frame] of film(seqs[attempt]).entries()) {
							c.emit('Page.screencastFrame', { sessionId: k, metadata: { timestamp: frame.wall / 1000 }, data: frame.png.toString('base64') });
						}
					}
					if (name === 'Page.stopScreencast') {
						// filmFling catches stop errors, so record the state for assertion outside CDP.
						cdps.push({ marker, settling });
					}
				};
				c.detach = async () => {};
				return c;
			} })
		};
		await runFlingLook({ page, log() {}, check: async (name, ok, detail) => rows.push({ name, ok, detail }) }, f, 'basic-dark', 'normal', route);
		assert.equal(cdps.length, seqs.length, 'each fling stops its capture');
		assert.equal(cdps.every((capture) => capture.marker), true, 'the capture marker runs until the capture stops');
		assert.equal(cdps.every((capture) => capture.settling), true, 'capture stops only after the awaited one-second still window');
		return { names, wheelDeltas, receipts, rows };
	};
	const driven = await exercise('terminal', [lost, single]);
	assert.deepEqual(driven.names, ['general', 'code', 'general', 'code'], 'a retry drives both clicks again');
	assert.deepEqual(driven.wheelDeltas, [555, 555], 'a retry also delivers the real Terminal look wheel again');
	assert.equal(driven.receipts[0].wheel, 525, 'the listener records delivery time without an offset');
	assert.equal(driven.receipts[0].wheelEpoch, wheel, 'the event epoch precedes delayed listener dispatch');
	assert.equal(driven.receipts[0].commitEpoch, wheel - 50, 'the chapter commit is on the same clock');
	assert.deepEqual(driven.rows.map((row) => row.ok), [true, true, true, false], 'the live sink receives the real failing pixel verdict');
	const deepDrive = await exercise('wheel-bottom', [good]);
	assert.deepEqual(deepDrive.wheelDeltas, [3712], 'the deep wheel goes past the bottom');
	assert.equal(deepDrive.receipts[0].wheelPending, 1, 'the deep route counts unmounted pages instead of list rows');
	assert.equal(deepDrive.receipts[0].wheelTargetPending, true);
	assert.deepEqual(deepDrive.rows.map((row) => row.ok), [true, true, true, true], 'the real deep runner exercises the cold last page');
	// FO-245 r3: the looks. Glass Dark and Glass Light are fling looks (their wallpaper passed the round 1 reading)
	for (const look of ['basic-dark', 'nier-light', 'glass-dark', 'glass-light']) assert.ok(FLING_LOOKS.includes(look), `${look} is a fling look`);
	assert.deepEqual(flingLooks(undefined), FLING_LOOKS, 'the default fling looks');
	assert.equal(flingLooks('all').length, 10, '--set flingLooks=all runs all ten');
	assert.deepEqual(flingLooks('glass-light,nope'), ['glass-light'], 'a named list keeps only real looks');
	assert.ok(live(String(flingRoute), /await runFlingLook\(t, f, look, surface, route\)/), 'the live runner judges each look with the exercised function');
	// the route rows: each deep route names its own target, and an unmounted page in view fails the empty row
	{
		const deep = (o) => ({ committed: true, pending: 9, targetPending: true, wheel: 1200, wheelPending: 9, wheelTargetPending: true, sampled: true, start: 0, top: 19000, moved: 19000, height: 880, targetInView: true, empty: [], ...o });
		for (const route of ['wheel-bottom', 'end']) {
			assert.deepEqual(flingVerdict(deep({}), null, route).slice(0, 3).map((x) => x.ok), [true, true, true], `${route}: the last page unmounted at the input, crossed into view, nothing empty`);
			assert.equal(flingVerdict(deep({ wheelTargetPending: false }), null, route)[0].ok, false, `${route}: a last page already mounted at the input did not test a cold page`);
			assert.equal(flingVerdict(deep({ empty: ['page:code-reference'] }), null, route)[2].ok, false, `${route}: an unmounted page in the sampled view fails`);
			assert.match(flingVerdict(deep({}), null, route)[0].name, route === 'end' ? /^End was delivered/ : /single long wheel/);
			assert.equal(flingVerdict(deep({}), run(good), route)[3].ok, true, `${route}: a clean film passes`);
			assert.equal(flingVerdict(deep({}), run([...at(-83.5, 5, GSRC), ...at(16.7, 4, WALL), ...at(83.5, 20, GDST)]), route)[3].ok, false, `${route}: a wallpaper-only film fails`);
		}
		assert.deepEqual(Object.keys(FLING_ROUTES), ['terminal', 'wheel-bottom', 'end', 'end-text']);
		// FO-245 r4: the text-click route judges like End, and needs focus on the page body at the key
		const tx = (o) => deep({ wheelFocus: 'body', ...o });
		assert.deepEqual(flingVerdict(tx({}), null, 'end-text').slice(0, 3).map((x) => x.ok), [true, true, true], 'end-text: body focus, last page unmounted, crossed, nothing empty');
		assert.equal(flingVerdict(tx({ wheelFocus: 'button#x' }), null, 'end-text')[0].ok, false, 'end-text: End from a focused control is not the text-click route');
		assert.equal(flingVerdict(tx({ wheelFocus: undefined }), null, 'end-text')[0].ok, false, 'end-text: an unknown focus is not judged');
		assert.equal(flingVerdict(tx({ wheelTargetPending: false }), null, 'end-text')[0].ok, false, 'end-text: a mounted last page did not test a cold page');
		assert.match(flingVerdict(tx({}), null, 'end-text')[0].detail, /focus on body/);
		assert.equal(flingVerdict(tx({}), run(good), 'end-text')[3].ok, true, 'end-text: a clean film passes');
		assert.equal(flingVerdict(tx({}), run([...at(-83.5, 5, GSRC), ...at(16.7, 4, WALL), ...at(83.5, 20, GDST)]), 'end-text')[3].ok, false, 'end-text: a wallpaper-only film fails');
		assert.equal(flingVerdict(deep({}), null, 'end')[0].ok, true, 'end: the focused-control route does not need body focus');
	}
	console.log('PASS fling frames: blank, unfilled and wallpaper-only frames on screen fail through the live recorder and judge (edge detail, FO-245 r3), a lost arrival frame is not judged, and the two live routes (Terminal look, a long wheel to the bottom; the End routes wait for FO-248) in the Glass looks too use both and the shared retry');
}

/* FO-245 r4 (R143 medium 2): End on a focused tab belongs to the tab list (main's behaviour) */
{
	// the fling block's live(): a match in live code only (not commented out)
	const main = { key: true, focusTab: true, coldAtKey: 3, tabs: 4, startIndex: 0, maxTravel: 0, scrolls: 0, travel: 0, lastSelected: true, lastFocused: true, lastInView: true, focusAfter: 'button#pm51-tab-last' };
	assert.deepEqual(tabEndVerdict(main).map((x) => x.ok), [true, true, true], 'main: the last tab selected and focused, the document still');
	const r3 = { ...main, maxTravel: 2023, scrolls: 43, travel: 2023, lastInView: false };
	assert.deepEqual(tabEndVerdict(r3).map((x) => x.ok), [true, false, false], 'r3: the document jumped 2,023 px and the tab went out of view');
	assert.equal(tabEndVerdict({ ...main, maxTravel: TAB_END_TRAVEL + 1 })[2].ok, false, 'a move past the tolerance fails, even one undone by the end');
	assert.equal(tabEndVerdict({ ...main, maxTravel: null })[2].ok, false, 'no travel reading cannot pass');
	assert.equal(tabEndVerdict({ ...main, lastSelected: false })[1].ok, false, 'the last tab not selected fails');
	assert.equal(tabEndVerdict({ ...main, lastFocused: false })[1].ok, false, 'the last tab not focused fails');
	for (const [o, why] of [[{ coldAtKey: 0 }, 'no unmounted page at the key'], [{ focusTab: false }, 'focus not on the tab'], [{ key: false }, 'no trusted End'], [{ startIndex: 3 }, 'already on the last tab'], [{ tabs: 1 }, 'a one-tab list']]) {
		const v = tabEndVerdict({ ...main, ...o });
		assert.deepEqual(v.map((x) => x.ok), [false, false, false], `not judgeable: ${why}`);
	}
	assert.equal(tabEndVerdict(null).every((x) => !x.ok), true, 'no reading fails');
	for (const surface of ['normal', 'sandbox']) {
		const name = `R93 #4 End on a focused tab keeps the tab's behaviour (${surface})`;
		assert.equal(typeof tests[name], 'function', `the tab route is a live test on the ${surface} surface`);
		assert.ok(live(String(tests[name]), /tabEndRoute\(t, surface\)/), 'the tab test runs tabEndRoute');
	}
	const tsrc = String(tabEndRoute);
	for (const [re, msg] of [[/\.domain-link\[data-domain="ai"\]'\)\.first\(\)\.click\(\)/, 'a fresh AI & Providers'], [/tab\.focus\(\{preventScroll:true\}\);/, 'the tab focused without scrolling'],
		[/if\(e\.key!=='End'\|\|!e\.isTrusted\|\|R\.key\)return;R\.key=true;R\.focusTab=document\.activeElement===tab;R\.coldAtKey=/, 'the trusted End and its precondition'],
		[/R\.maxTravel=Math\.max\(R\.maxTravel,Math\.round\(Math\.abs\(e\.target\.scrollTop-R\.start\)\)\);/, 'every scroll of the document is measured'],
		[/await t\.page\.keyboard\.press\('End'\);/, 'a trusted End'], [/for \(const row of tabEndVerdict\(r\)\) await t\.check\(`\$\{surface\}: \$\{row\.name\}`,row\.ok,row\.detail\);/, 'the live sink records each row']])
		assert.ok(live(tsrc, re), `the tab route: ${msg}`);
	console.log('PASS End on a focused tab: the tab list keeps End (last tab selected, focused, in view; the document still), judged only with unmounted pages at the key');
}

/* FO-245 r5 (R144): two more widgets keep their own End/Home (main's behaviour): the AI & Providers roster scrolls
   itself on End, and the General wallpaper picker takes Home without moving the document */
{
	// the roster: main scrolls the roster 487 px to its end and leaves the document; r4 jumped the document to the chapter end
	const main = { key: true, focusRoster: true, focusAtKey: 'button.resource-row', coldAtKey: 3, rosterStart: 0, rosterRoom: 487, maxTravel: 0, scrolls: 0, travel: 0, rosterEnd: 487, rosterMax: 487 };
	assert.deepEqual(rosterEndVerdict(main).map((x) => x.ok), [true, true, true], 'main: the roster scrolls to its end, the document stays');
	const r4 = { ...main, maxTravel: 5231, scrolls: 2, travel: 5231, rosterEnd: 0 };
	assert.deepEqual(rosterEndVerdict(r4).map((x) => x.ok), [true, false, false], 'r4: the document jumped 5,231 px and the roster stayed');
	assert.equal(rosterEndVerdict({ ...main, maxTravel: GUARD_TRAVEL + 1 })[2].ok, false, 'a document move past the tolerance fails, even one undone by the end');
	assert.equal(rosterEndVerdict({ ...main, maxTravel: null })[2].ok, false, 'no travel reading cannot pass');
	assert.equal(rosterEndVerdict({ ...main, rosterEnd: 200 })[1].ok, false, 'a roster that stops short of its end fails');
	assert.equal(rosterEndVerdict({ ...main, rosterEnd: null })[1].ok, false, 'no roster reading cannot pass');
	for (const [o, why] of [[{ coldAtKey: 0 }, 'no unmounted page at the key'], [{ focusRoster: false }, 'focus not in the roster'], [{ key: false }, 'no trusted End'], [{ rosterRoom: ROSTER_MIN_ROOM }, 'a roster with no room to scroll']])
		assert.deepEqual(rosterEndVerdict({ ...main, ...o }).map((x) => x.ok), [false, false, false], `roster not judgeable: ${why}`);
	assert.equal(rosterEndVerdict(null).every((x) => !x.ok), true, 'no roster reading fails');
	// the wallpaper picker: main keeps the document at its place (about 480 px); r4 jumped it to 0
	const wm = { key: true, wheels: 4, focusFirst: true, coldAtKey: 1, start: 480, startTop: 480, maxTravel: 0, scrolls: 0, travel: 0, firstFocused: true, firstChecked: true, focusAfter: 'button.wpk-tile' };
	assert.deepEqual(wpkHomeVerdict(wm).map((x) => x.ok), [true, true, true], 'main: the first tile keeps focus, the document stays');
	assert.deepEqual(wpkHomeVerdict({ ...wm, maxTravel: 480, scrolls: 1, travel: -480 }).map((x) => x.ok), [true, true, false], 'r4: the document jumped to the chapter top');
	assert.equal(wpkHomeVerdict({ ...wm, maxTravel: GUARD_TRAVEL + 1 })[2].ok, false, 'a document move past the tolerance fails');
	assert.equal(wpkHomeVerdict({ ...wm, maxTravel: null })[2].ok, false, 'no travel reading cannot pass');
	assert.equal(wpkHomeVerdict({ ...wm, firstFocused: false })[1].ok, false, 'focus off the first tile fails');
	assert.equal(wpkHomeVerdict({ ...wm, firstChecked: false })[1].ok, false, 'the first tile not chosen fails');
	for (const [o, why] of [[{ coldAtKey: 0 }, 'no unmounted page at the key'], [{ focusFirst: false }, 'focus not on the first tile'], [{ key: false }, 'no trusted Home'], [{ startTop: WPK_MIN_TOP - 1 }, 'a document near its top (Home would not move it)'], [{ wheels: 0 }, 'no real wheel']])
		assert.deepEqual(wpkHomeVerdict({ ...wm, ...o }).map((x) => x.ok), [false, false, false], `picker not judgeable: ${why}`);
	assert.equal(wpkHomeVerdict(null).every((x) => !x.ok), true, 'no picker reading fails');
	// both guards are live tests on both surfaces, through their routes
	for (const surface of ['normal', 'sandbox']) {
		const rn = `R93 #4 End on the AI & Providers roster scrolls the roster (${surface})`, wn = `R93 #4 Home on the General wallpaper picker keeps the document still (${surface})`;
		assert.equal(typeof tests[rn], 'function', `the roster guard is a live test on the ${surface} surface`);
		assert.ok(live(String(tests[rn]), /rosterEndRoute\(t, surface\)/), 'the roster test runs rosterEndRoute');
		assert.equal(typeof tests[wn], 'function', `the wallpaper picker guard is a live test on the ${surface} surface`);
		assert.ok(live(String(tests[wn]), /wpkHomeRoute\(t, surface\)/), 'the wallpaper picker test runs wpkHomeRoute');
	}
	const rsrc = String(rosterEndRoute), wsrc = String(wpkHomeRoute);
	for (const [re, msg] of [[/guardPage\(t, surface, 'general', 'ai'\)/, 'a fresh AI & Providers'], [/rl\.querySelectorAll\('\.resource-row'\)/, 'a provider row of the roster'],
		[/await f\.locator\('\[data-psc-guard\]'\)\.click\(/, 'a trusted click on the row'],
		[/if\(e\.key!=='End'\|\|!e\.isTrusted\|\|R\.key\)return;R\.key=true;const a=document\.activeElement;R\.focusRoster=!!a&&rl\.contains\(a\);/, 'the trusted End and the focus in the roster at the key'],
		[/R\.coldAtKey=sc\.querySelectorAll\('\[data-continuous-workspace-body\]\[data-workspace-mounted="false"\]'\)\.length;R\.rosterStart=/, 'the cold pages and the roster at the key'],
		[/R\.maxTravel=Math\.max\(R\.maxTravel,Math\.round\(Math\.abs\(e\.target\.scrollTop-R\.start\)\)\);/, 'every scroll of the document is measured'],
		[/await t\.page\.keyboard\.press\('End'\);/, 'a trusted End'], [/rosterEnd:rl\?Math\.round\(rl\.scrollTop\):null/, 'the roster read after the key'],
		[/for \(const row of rosterEndVerdict\(r\)\) await t\.check\(`\$\{surface\}: \$\{row\.name\}`,row\.ok,row\.detail\);/, 'the live sink records each row']])
		assert.ok(live(rsrc, re), `the roster route: ${msg}`);
	for (const [re, msg] of [[/guardPage\(t, surface, 'code', 'general'\)/, 'a fresh General'], [/await t\.page\.mouse\.wheel\(0,120\);/, 'a real wheel'],
		[/await f\.locator\('#pm-settings-root #settings-document \.wpk-row \.wpk-tile'\)\.first\(\)\.click\(/, 'a trusted click on the first tile'],
		[/if\(e\.key!=='Home'\|\|!e\.isTrusted\|\|R\.key\)return;R\.key=true;R\.focusFirst=document\.activeElement===first;R\.coldAtKey=/, 'the trusted Home and the focus on the first tile at the key'],
		[/R\.start=sc\.scrollTop;R\.startTop=Math\.round\(sc\.scrollTop\);/, 'the document position at the key'],
		[/R\.maxTravel=Math\.max\(R\.maxTravel,Math\.round\(Math\.abs\(e\.target\.scrollTop-R\.start\)\)\);/, 'every scroll of the document is measured'],
		[/await t\.page\.keyboard\.press\('Home'\);/, 'a trusted Home'],
		[/for \(const row of wpkHomeVerdict\(r\)\) await t\.check\(`\$\{surface\}: \$\{row\.name\}`,row\.ok,row\.detail\);/, 'the live sink records each row']])
		assert.ok(live(wsrc, re), `the wallpaper picker route: ${msg}`);
	assert.ok(wsrc.indexOf('mouse.wheel(0,120)') < wsrc.indexOf('.wpk-tile\').first().click(') && wsrc.indexOf('.wpk-tile\').first().click(') < wsrc.indexOf("keyboard.press('Home')"), 'the wheel, then the click, then Home');
	console.log('PASS widget guards: End on the roster scrolls the roster and Home on the wallpaper picker keeps the document still (main\'s behaviour), judged only with unmounted pages at the key');
}

/* Existing widget keyboard bindings (tabs, menus and dialogs) own their own keys. Scan every Settings
   script for added registrations, including a keyCode-based listener with no "End"/"Home" string. The
   live End/Home guards pin what the existing widgets actually do with the keys. */
{
	const established = {
		'10-values.js': 1, '19-nier-parts.js': 3, '20-motion.js': 1, '20-nier-world.js': 1, '22-nier-chips.js': 1,
		'23-nier-theme-menu.js': 2, '27-place.js': 1, '28-in-place.js': 2, '29-pip-editor.js': 1,
		'30-inspector.js': 5, '32-model-nicknames.js': 1, '46-first-screen.js': 3, '60-wizard.js': 1
	};
	const directory = new URL('../../../onboarding/opus-5.5/src/settings/kit.d/', import.meta.url);
	const listeners = (source) => [...uncomment(source).matchAll(
		/\baddEventListener\s*\(\s*(['"`])(?:keydown|keyup|keypress|beforeinput)\1|\bon(?:keydown|keyup|keypress|beforeinput)\b\s*(?:=\s*(?!=)|:)/g
	)].length;
	const read = (name) => readFileSync(new URL(name, directory), 'utf8');
	const files = readdirSync(directory).filter((name) => name.endsWith('.js'));
	const added = (sources) => files.filter((name) => listeners(sources(name)) > (established[name] ?? 0));
	assert.deepEqual(added(read), [], 'no additional Settings keyboard registrations (FO-248 will adjudicate any new End/Home owner)');
	for (const [name, mutation] of [
		['46-first-screen.js', 'root.addEventListener("keydown", e => { if ([35, 36].includes(e.keyCode)) root.scrollTop = 100; });'],
		['47-status-words.js', "document.addEventListener('keydown', e => { if (e.key === 'End') root.scrollTop = 100; });"],
		['47-status-words.js', 'window.onkeydown = e => { if (e.which === 35) root.scrollTop = 100; };']
	]) {
		assert.ok(files.includes(name), `${name} is included in the Settings scan`);
		assert.deepEqual(added((file) => file === name ? `${read(file)}\n${mutation}` : read(file)), [name], 'an additional Settings registration is detected');
	}
	assert.equal(listeners('// window.onkeydown = f\n/* root.addEventListener("keyup", f) */'), 0);
}
/* FO-245 r5 (option C): the product has no End/Home key listener of its own (rounds 3 and 4 had one; it overrode the
   tab list, the roster and the wallpaper picker, R143 and R144). End/Home blanks are FO-248's; a listener that comes
   back fails here until FO-248 changes this pin. The cold-page mount and the content-visibility show stay. */
{
	const fs = await import('node:fs');
	const prod = fs.readFileSync(new URL('../../../onboarding/opus-5.5/src/settings/kit.d/46-first-screen.js', import.meta.url), 'utf8');
	const code = prod.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
	// End and Home are named once, in main's fill-before-the-key set; that listener only fills, as on main
	assert.equal((code.match(/['"`]End['"`]/g) || []).length, 1, 'End is named once in the product code (main\'s fill set)');
	assert.equal((code.match(/['"`]Home['"`]/g) || []).length, 1, 'Home is named once in the product code (main\'s fill set)');
	assert.match(code, /const O55FS_KEYS = new Set\(\['End', 'Home'\]\);\nroot\.addEventListener\('keydown', e => \{\n  if \(!o55fs\.pending\.size\) return;\n  const sc = root\.querySelector\('#settings-document'\);\n  if \(O55FS_KEYS\.has\(e\.key\) && sc && \(e\.target === sc \|\| sc\.contains\(e\.target\)\) && !\(e\.target\.matches && e\.target\.matches\('input, textarea, select, \[contenteditable=""\], \[contenteditable="true"\]'\)\)\) o55fsFillAll\(\);\n\}, true\);/, 'main\'s End/Home listener only fills the pending rows, unchanged');
	assert.equal((code.match(/O55FS_KEYS/g) || []).length, 2, 'the fill set is used by that listener only');
	for (const gone of ['o55fsMountEnd', 'o55fsEdgeKeyOwner', 'O55FS_OWN_KEYS', 'o55fsDownInDoc'])
		assert.equal(code.includes(gone), false, `${gone} (rounds 3-4's End/Home jump) is gone`);
	// no keydown listener scrolls or prevents a key's default, except main's own Tab, Find, F3 and Select All fills
	for (const m of code.matchAll(/addEventListener\('keydown',/g)) {
		let i = code.indexOf('{', m.index), depth = 0, j = i;
		for (; j < code.length; j++) { if (code[j] === '{') depth++; else if (code[j] === '}' && --depth === 0) break; }
		const body = code.slice(m.index, j + 1);
		assert.equal(/preventDefault|scrollTo|scrollBy|scrollTop\s*=|scrollIntoView/.test(body), false, `a keydown listener neither scrolls nor takes a key's default: ${body.split('\n')[0]}`);
	}
	assert.equal(/document\.addEventListener\('pointerdown'/.test(code), false, 'no pointer-down memory on document (round 4\'s text-click route)');
	// kept: the scroll handler mounts a cold page (behind r6's wheel gate, pinned below), fills and shows skipped sections before the frame
	assert.match(code, /root\.addEventListener\('scroll', e => \{ if \(e\.target\.id === 'settings-document'\) \{ if \(o55fsWheeling\(\)\) o55fsMountNear\(e\.target\); o55fsFillNear\(e\.target\); o55fsShowNear\(e\.target\); \} \}, true\);/, 'the scroll handler mounts the cold page while a wheel scrolls, fills and shows before the frame (FO-245 r1/r3 kept, r6 gate)');
	for (const kept of ['function o55fsMountNear(sc)', 'function o55fsShowNear(sc)', 'function o55fsShowFor(shown)', 'const o55fsFresh = new Set();', 'mountContinuousWorkspace = function (id)', "root.addEventListener('contentvisibilityautostatechange'"])
		assert.ok(code.includes(kept), `kept: ${kept}`);
	console.log('PASS End/Home: the product has no End/Home key listener of its own (FO-248); the cold-page mount and the content-visibility show are kept');
}

/* FO-245 r6 (option E, R145 medium): round 3's cold-page mount runs in the scroll event only while a wheel scroll is under
   way. A passive wheel listener notes the time; no key listener of any kind is added; every other scroll mounts through
   main's observer, so End lands at the end. The guard "End from a fresh Code & Tools lands at the end" is live on both
   surfaces and judged. */
{
	const fs = await import('node:fs');
	const prod = fs.readFileSync(new URL('../../../onboarding/opus-5.5/src/settings/kit.d/46-first-screen.js', import.meta.url), 'utf8');
	const code = prod.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
	// the gate: one passive wheel listener writes the time, the scroll handler is the only caller of the mount
	const wheels = [...code.matchAll(/addEventListener\(\s*['"`]wheel['"`]/g)];
	assert.equal(wheels.length, 1, 'one wheel listener in the product file (the gate)');
	assert.match(code, /\nroot\.addEventListener\('wheel', \(\) => \{ o55fsWheelAt = performance\.now\(\); \}, \{ capture: true, passive: true \}\);\n/, 'the wheel listener is passive, captures on root and only notes the time');
	assert.equal(/preventDefault/.test(code), false, 'nothing in the product file cancels an event\'s default');
	assert.equal((code.match(/o55fsWheelAt\s*=(?!=)/g) || []).length, 2, 'o55fsWheelAt is set only where it is declared and in the wheel listener');
	assert.match(code, /\nconst o55fsWheeling = \(\) => performance\.now\(\) - o55fsWheelAt <= O55FS_WHEEL_MS;\n/, 'the gate compares the time since the last wheel with O55FS_WHEEL_MS');
	const ms = Number((code.match(/\nconst O55FS_WHEEL_MS = (\d+);\n/) || [])[1]);
	assert.ok(ms >= 100 && ms <= 1000, `O55FS_WHEEL_MS covers a wheel's smooth scroll and no more than a second (${ms})`);
	assert.equal((code.match(/let o55fsWheelAt = -Infinity;/g) || []).length, 1, 'no wheel before the first one');
	const calls = [...code.matchAll(/o55fsMountNear\(/g)].map((m) => code.slice(code.lastIndexOf('\n', m.index) + 1, code.indexOf('\n', m.index)));
	assert.deepEqual(calls.map((l) => l.trim().startsWith('function') ? 'def' : /if \(o55fsWheeling\(\)\) o55fsMountNear\(e\.target\);/.test(l) ? 'gated' : 'other'), ['def', 'gated'], 'o55fsMountNear is defined once and called only behind the wheel gate');
	assert.equal((code.match(/o55fsWheeling\(\)/g) || []).length, 1, 'the gate is read only by the scroll handler');
	// no key listener of any kind: the three keydown listeners are main's (End/Home fill, Find/F3/Select All, Tab), no keyup/keypress
	assert.equal([...code.matchAll(/addEventListener\(\s*['"`]key(down|up|press)['"`]/g)].length, 3, 'three key listeners, all main\'s');
	assert.equal([...code.matchAll(/addEventListener\(\s*['"`](keyup|keypress|beforeinput)['"`]/g)].length, 0, 'no keyup or keypress listener');
	for (const m of code.matchAll(/addEventListener\('keydown',/g)) {
		let i = code.indexOf('{', m.index), depth = 0, j = i;
		for (; j < code.length; j++) { if (code[j] === '{') depth++; else if (code[j] === '}' && --depth === 0) break; }
		assert.equal(/o55fsWheel|o55fsMountNear|mountContinuousWorkspace/.test(code.slice(m.index, j + 1)), false, 'no key listener touches the gate or mounts a page');
	}
	console.log(`PASS wheel gate: one passive wheel listener notes the time, o55fsMountNear runs only behind it (${ms} ms), no key listener is added`);
}
{
	// main lands 45-46 px from the end every press (R145); the revert stopped 634-1,268 px short in about one press in four
	const press = (o) => ({ key: true, keyName: 'End', from: 'button', focusOk: true, focusAtKey: 'button in the document', coldAtKey: 6, travelWant: 19100, settled: true, gap: 45, top: 20155, ...o });
	const mainRun = Array.from({ length: 2 * END_REPS }, (_, i) => press({ from: i % 2 ? 'text' : 'button', gap: 45 + (i % 2) }));
	assert.deepEqual(endLandVerdict(mainRun).map((x) => x.ok), [true, true], 'main: every press within the bound');
	const rev = mainRun.map((p, i) => i === 5 ? { ...p, gap: 1268 } : p);
	assert.deepEqual(endLandVerdict(rev).map((x) => x.ok), [true, false], 'the revert: one press 1,268 px short fails');
	assert.match(endLandVerdict(rev)[1].detail, /1 of 16 short: .*gap 1268 px/);
	assert.equal(endLandVerdict(mainRun.map((p, i) => i ? p : { ...p, gap: 634 }))[1].ok, false, 'R145\'s shortest short landing (634 px) fails');
	assert.equal(endLandVerdict(mainRun.map((p, i) => i ? p : { ...p, gap: END_GAP + 1 }))[1].ok, false, 'one px past the bound fails');
	assert.equal(endLandVerdict(mainRun.map((p, i) => i ? p : { ...p, gap: END_GAP }))[1].ok, true, 'the bound itself passes');
	assert.ok(END_GAP >= 3 * 46 && END_GAP < 634, `END_GAP (${END_GAP}) clears main's 46 px with room and stays under R145's shortest short landing`);
	for (const [o, why] of [[{ coldAtKey: 0 }, 'no unmounted page at the key'], [{ key: false }, 'no trusted End'], [{ focusOk: false }, 'focus not where the route put it'], [{ travelWant: END_MIN_TRAVEL }, 'too little left to scroll'], [{ settled: false }, 'still scrolling at the cap'], [{ gap: null }, 'no gap read']]) {
		const v = endLandVerdict(mainRun.map((p, i) => i === 3 ? { ...p, ...o } : p));
		assert.deepEqual(v.map((x) => x.ok), [false, false], `not judgeable: ${why}`);
	}
	assert.deepEqual(endLandVerdict(mainRun.slice(0, -1)).map((x) => x.ok), [false, false], 'fewer presses than asked fails');
	assert.deepEqual(endLandVerdict([]).map((x) => x.ok), [false, false], 'no press fails');
	assert.deepEqual(endLandVerdict(null).map((x) => x.ok), [false, false], 'no reading fails');
	assert.equal(endLandVerdict(mainRun.map((p) => ({ ...p, gap: -1 })))[1].ok, true, 'a rounding px past the end passes');
	// registered on both surfaces, through its route, with its input, precondition, settle and live sink
	for (const surface of ['normal', 'sandbox']) {
		const name = `R93 #4 End from a fresh Code & Tools lands at the end (${surface})`;
		assert.equal(typeof tests[name], 'function', `the End landing guard is a live test on the ${surface} surface`);
		assert.ok(live(String(tests[name]), /endLandRoute\(t, surface\)/), 'the End landing test runs endLandRoute');
	}
	const src = String(endLandRoute);
	for (const [re, msg] of [[/guardPage\(t, surface, 'general', 'code'\)/, 'a fresh Code & Tools'],
		[/\.domain-link\[data-domain="general"\]'\)\.first\(\)\.click\(\);[^\n]*\n\t*await f\.locator\('#pm-settings-root \.domain-link\[data-domain="code"\]'\)\.first\(\)\.click\(\);/, 'each press enters Code & Tools fresh from General'],
		[/const from = i % 2 \? 'text' : 'button', keyName = i % 4 < 2 \? 'End' : 'Control\+End';/, 'both starts and both keys'],
		[/b\?\.focus\(\{preventScroll:true\}\);/, 'the button focused without scrolling'], [/await f\.locator\('\[data-psc-end-text\]'\)\.click\(\{position:at\}\);/, 'a trusted click on plain text'],
		[/if\(e\.key!=='End'\|\|!e\.isTrusted\|\|R\.key\)return;R\.key=true;/, 'the trusted End'],
		[/R\.focusOk=from==='button'\?!!a&&a\.tagName==='BUTTON'&&sc\.contains\(a\):a===document\.body;/, 'the focus each start must give'],
		[/R\.coldAtKey=sc\.querySelectorAll\('\[data-continuous-workspace-body\]\[data-workspace-mounted="false"\]'\)\.length;R\.travelWant=Math\.round\(sc\.scrollHeight-sc\.clientHeight-sc\.scrollTop\);/, 'the cold pages and the distance at the key'],
		[/await t\.page\.keyboard\.press\(keyName\);/, 'a trusted key press'], [/\[END_SETTLE,END_CAP\]/, 'the settle and its cap'],
		[/gap:Math\.round\(sc\.scrollHeight-sc\.clientHeight-sc\.scrollTop\)/, 'the gap read after the settle'],
		[/for \(const row of endLandVerdict\(presses, 2 \* reps\)\) await t\.check\(`\$\{surface\}: \$\{row\.name\}`,row\.ok,row\.detail\);/, 'the live sink records each row']])
		assert.ok(live(src, re), `the End landing route: ${msg}`);
	assert.ok(END_SETTLE >= 1500 && END_CAP >= 6000 && END_REPS >= 8, 'settle 1.5 s, cap 6 s, at least 8 presses of each start');
	console.log('PASS End landing guard: every End from a fresh Code & Tools must land within ' + END_GAP + ' px of the end (main 45-46), judged only with unmounted pages at the key; live on both surfaces');
}

/* R97 #6: the wait ends on the fill's own completion, and an unfinished fill is told apart from a missing row */
{
	// FILL_WAIT is a page function; here the page is a stub whose pending count follows a script over real time
	const run = async (script, limits, dragAt = null) => {
		const t0 = performance.now();
		const classes = { contains: (c) => c === 'pm-resizing' && dragAt !== null && performance.now() - t0 >= dragAt[0] && performance.now() - t0 < dragAt[1] };
		globalThis.document = { body: { classList: classes }, querySelectorAll: () => ({ length: script(performance.now() - t0) }) };
		try { return await FILL_WAIT(limits); } finally { delete globalThis.document; }
	};
	const L = { quiet: 600, cap: 3000 };
	// a fill that ends at 400 ms
	const quick = await run((ms) => (ms < 400 ? 12 - Math.floor(ms / 40) : 0), L);
	assert.equal(quick.state, 'done', JSON.stringify(quick));
	// R97 #6's case: a stall (a held drag parks the fill) of 500 ms, shorter than `quiet`, then the fill finishes at 1.6 s.
	// A cap on the whole sequence shorter than that (here 1.2 s, as 2.5 s + 10 s was on the page) failed this correct fill.
	const parked = (ms) => (ms < 300 ? 10 : ms < 800 ? 9 : ms < 1600 ? 9 - Math.floor((ms - 800) / 100) : 0);
	const stall = await run(parked, L, [300, 800]);
	assert.equal(stall.state, 'done', `a correct fill behind a short stall finishes: ${JSON.stringify(stall)}`);
	assert.equal(stall.dragged, true, 'the held drag is noted');
	assert.ok(stall.waited >= 1500, `it waited for the fill, not a cap: ${stall.waited} ms`);
	// a fill that stops for good
	const stopped = await run((ms) => (ms < 200 ? 10 - Math.floor(ms / 50) : 6), L);
	assert.equal(stopped.state, 'stalled', JSON.stringify(stopped));
	assert.equal(stopped.pending, 6);
	// a fill still falling at the cap
	const slow = await run((ms) => Math.max(1, 1000 - Math.floor(ms / 250)), { quiet: 600, cap: 1500 });
	assert.equal(slow.state, 'deadline', JSON.stringify(slow));

	const arr = (pair, o) => ({ pair, to: 'code', pendingLeft: 0, dupIds: 0, missing: { ws: 'editor-terminal', want: 133, gone: [] }, fill: { state: 'done', pending: 0, waited: 300, lastProgress: 300, dragged: false }, ...o });
	assert.deepEqual(arrivalVerdict([arr('general->code'), arr('ai->code')]).map((x) => x.ok), [true, true], 'finished and complete: passes');
	const unfinished = arrivalVerdict([arr('general->code', { pendingLeft: 4, missing: { ws: 'editor-terminal', want: 133, gone: ['code.a'] }, fill: { state: 'deadline', pending: 4, waited: 90000, lastProgress: 89900, dragged: false } })]);
	assert.equal(unfinished[0].ok, false, 'an unfinished fill fails its own row');
	assert.match(unfinished[0].detail, /still filling at the 90 s cap with 4 lists pending \(a deadline, not a missing row\)/);
	assert.equal(unfinished[1].ok, true, 'and is not reported as a missing row');
	assert.match(unfinished[1].detail, /not judged for missing rows: general->code/);
	const stoppedRow = arrivalVerdict([arr('general->code', { pendingLeft: 2, fill: { state: 'stalled', pending: 2, waited: 16000, lastProgress: 1000, dragged: true } })]);
	assert.match(stoppedRow[0].detail, /the fill stopped: no list filled for 15 s with 2 still pending \(a drag was held\)/);
	const missing = arrivalVerdict([arr('general->code', { missing: { ws: 'app-input', want: 74, gone: ['general.interaction.spellcheck-words'] } })]);
	assert.deepEqual(missing.map((x) => x.ok), [true, false], 'a finished fill that left a row out fails completeness');
	assert.equal(arrivalVerdict([arr('general->code', { dupIds: 1, fill: { state: 'stalled', pending: 1, waited: 16000, lastProgress: 900, dragged: false } })])[1].ok, false, 'a doubled row id fails even on an unfinished fill');
	assert.equal(arrivalVerdict([arr('ai->code', { missing: { ws: 'x', want: 0, gone: [] } })])[1].ok, false, 'Code with no modeled rows fails');
	console.log('PASS fill completion: waited on the fill itself (done, stalled, deadline), and an unfinished fill is not a missing row');
}

/* PM7PERF-SETCHAPTER-SELECTALL-MAC-KEY-REMOTE: Playwright resolves ControlOrMeta on the DRIVER's platform, so a
 * Linux driver sent Control+A to Mac Chrome and the five native selection rows failed (astra-max-15,
 * opaque-settings-selectall-mac.json: six trusted Control+A and six Command+A seen; Command+A selected Terminal
 * colors and the editing words in all four native editor controls on both pages). The modifier must come from the
 * BROWSER's platform (navigator.platform), not the driver's. */
{
	assert.equal(typeof selectAllModifier, 'function', 'Select All needs the browser-platform modifier; the base sent ControlOrMeta (Control from a Linux driver) to Mac Chrome');
	assert.equal(selectAllModifier('MacIntel'), 'Meta', 'Mac Chrome driven from Linux selects with Command');
	assert.equal(selectAllModifier('iPhone'), 'Meta');
	assert.equal(selectAllModifier('Linux x86_64'), 'Control');
	assert.equal(selectAllModifier('Win32'), 'Control');
	assert.equal(selectAllModifier(''), 'Control', 'an unread platform keeps the Control default');
	assert.equal(selectAllModifier(undefined), 'Control');
	console.log('PASS Select All modifier: Mac browser platform takes Meta even from a Linux driver, Linux/Windows take Control, an unread platform keeps Control');
}
