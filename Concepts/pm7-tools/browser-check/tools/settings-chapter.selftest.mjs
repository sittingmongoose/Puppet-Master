// checks/perf-settings-chapter's verdicts on constructed rows: no browser (TIB-P7, 2026-11-20).
// node tools/settings-chapter.selftest.mjs
// The page probe itself is tested in a browser on a constructed page: diagnostics/settings-chapter-probe.check.mjs.
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { runInNewContext } from 'node:vm';
import { readdirSync, readFileSync } from 'node:fs';
import { firstScreenVerdict, restoreJudgeable, flingVerdict, hoverVerdict, arrivalVerdict, FILL_WAIT, press, selectAllModifier, flingScrollGate, filmFling, flingFilm, FLING_FILM, FLING_RETRY, flingAttempt, retryFling, flingRetryVerdict, captureCpuDetail, FLING_ROUTES, FLING_LOOKS, flingLooks, flingRoute, runFlingLook, filmBands, tabEndVerdict, tabEndRoute, TAB_END_TRAVEL, rosterEndVerdict, rosterEndRoute, wpkHomeVerdict, wpkHomeRoute, GUARD_TRAVEL, ROSTER_MIN_ROOM, WPK_MIN_TOP, endLandVerdict, endLandRoute, endLandKey, END_GAP, END_REPS, END_MIN_TRAVEL, END_SETTLE, END_CAP, PGDN, pgdnFilm, pgdnAttempt, pgdnVerdict, pgdnRoute, armFling, filteredRosterVerdict, filteredRosterRoute, focusedEndVerdict, focusedEndRoute, A152_FOCUSED, reverseVerdict, reverseAfterEndRoute, A152_REVERSE, lifetimeVerdict, chapterLifetimeRoute, A152_LIFETIME, tests } from '../checks/perf-settings-chapter.check.mjs';
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
	// FO-248P: Home from the end of a page. The source is the end view (rows in its top half, its foot empty) and the page
	// holds it for a few frames after the key while it works; held frames are not blanks, a blank after them still is
	const ENDV = frame(0, { holes: [2, 3] }), MORE = frame(0, { holes: [1, 2, 3] });
	const homeHeld = [...at(-83.5, 5, ENDV), ...at(16.7, 3, ENDV), ...at(66.8, 20, DST)];
	assert.equal(FLING_FILM.held, 0.002, 'a frame with under 0.2 % of its pixels changed from the source is the held source view');
	assert.equal(v(homeHeld).ok, true, `Home: the end view held for three frames, then the top view, passes: ${v(homeHeld).detail}`);
	assert.equal(run(homeHeld).dest.dt, 66.8, 'Home: the first destination frame is the first frame that left the source view');
	assert.equal(v([...at(-83.5, 5, ENDV), ...at(16.7, 2, ENDV), ...at(50.1, 2, BLANK), ...at(83.5, 20, DST)]).ok, false, 'Home: a blank after the held end view fails');
	assert.equal(v([...at(-83.5, 5, ENDV), ...at(16.7, 2, MORE), ...at(50.1, 20, DST)]).ok, false, 'Home: a frame that lost rows the source had is not the held source and fails');
	assert.equal(v([...at(-83.5, 5, SRC), ...at(16.7, 2, SRC), ...at(50.1, 20, DST)]).ok, true, 'a source with rows in every band held after the input passes as before');
	// FO-248P: the held PageDown film. Mid-scroll frames show other rows each time, so a frame is a placeholder frame when
	// half its bands are empty, not when it differs from the settled frame
	{
		const pg = (seq) => pgdnFilm(film(seq), { box, view, key: wheel });
		const PH = frame(3, { holes: [2, 3] }), ONE = frame(3, { holes: [3] });
		const rows = [...at(-50, 3, SRC), ...Array.from({ length: 70 }, (_, k) => [k * 16.7, k % 2 ? SRC : DST])];
		assert.deepEqual([pg(rows).bad.length, pg(rows).resolved], [0, true], 'a hold that always shows rows: no placeholder frame, resolved');
		const edge = rows.map(([dt, png], k) => [dt, k === 12 || k === 13 ? PH : png]);
		assert.equal(pg(edge).bad.length, 2, 'two frames with the lower half empty (a page placeholder at the edge) are placeholder frames');
		assert.equal(pg(rows.map(([dt, png], k) => [dt, k === 12 ? BLANK : png])).bad.length, 1, 'a fully blank frame is one');
		assert.equal(pg(rows.map(([dt, png], k) => [dt, k === 12 ? ONE : png])).bad.length, 0, 'one empty band (a gap between sections) is not');
		const gappy = pg(rows.filter((_, k) => k < 10 || k > 16));
		assert.deepEqual([gappy.resolved, gappy.maxGap > 3 * gappy.median], [true, true], 'a capture gap during the hold (a mount frame) is logged, not judged: the hold is judged on its captured frames');
		assert.equal(PGDN.minFrames, 60, 'a hold needs 60 frames after its first key');
		assert.equal(pg(rows.slice(0, 3 + PGDN.minFrames - 1)).resolved, false, 'under PGDN.minFrames frames after the first key is not judged');
		assert.equal(pg([...at(-50, 3, SRC)]).after, 0, 'no frame after the first key');
		assert.equal(PGDN.empty, 2, 'half the bands');
		// INTEG4: the hold is read in four quarters whatever FLING_FILM.bands is (FO-248K made that 16)
		assert.equal(PGDN.quarters, 4, 'a hold is read in four bands');
		assert.equal(pg(edge).bad[0].bands.length, 4, 'each placeholder frame reports four bands');
		const R = { keys: PGDN.keys, focus: 'body', coldAtKey: 7, mounted: 5, views: 12.8, settled: true, coldFrames: 0, coldAt: [] };
		const hold = (seqs, r = R) => ({ n: 'x', r, attempts: seqs.map((seq) => ({ px: pg(seq), r, ...pgdnAttempt(r, pg(seq)) })) });
		assert.deepEqual(pgdnVerdict([hold([rows]), hold([rows])]).map((x) => x.ok), [true, true, true], 'two clean holds with no unmounted page drawn pass');
		assert.deepEqual(pgdnVerdict([hold([rows]), hold([edge])]).map((x) => x.ok), [true, true, false], 'a placeholder frame on screen in any hold fails the pixel row');
		const drawn = { ...R, coldFrames: 2, coldAt: [[812, 40], [829, 22]] };
		assert.deepEqual(pgdnVerdict([hold([rows]), hold([rows], drawn)]).map((x) => x.ok), [true, false, true], 'an unmounted page in view at an animation frame fails the DOM row');
		assert.match(pgdnVerdict([hold([rows], drawn)])[1].detail, /2 animation frame\(s\) with an unmounted page in view \[812 ms 40 %; 829 ms 22 %\]/);
		const lost = rows.slice(0, 3 + 20);
		assert.equal(pgdnAttempt(R, pg(lost)).retry, true, 'a clean hold with too few frames is driven again');
		assert.equal(pgdnAttempt(drawn, pg(lost)).retry, false, 'a hold that drew an unmounted page decides at once');
		assert.equal(pgdnAttempt(R, pg(edge)).retry, false, 'a hold with a placeholder frame decides at once');
		assert.deepEqual(pgdnVerdict([hold([lost, rows])]).map((x) => x.ok), [true, true, true], 'a too-short attempt followed by a judged clean one passes');
		assert.deepEqual(pgdnVerdict([hold([lost, lost, lost, lost, lost])]).map((x) => x.ok), [true, true, false], 'five attempts with too few frames are not a pass');
		assert.deepEqual(pgdnVerdict([hold([lost, edge])]).map((x) => x.ok), [true, true, false], 'a placeholder frame in a later attempt fails');
		for (const [o, why] of [[{ keys: 3 }, 'too few trusted PageDowns'], [{ focus: 'button' }, 'focus not on the body'], [{ coldAtKey: 2 }, 'too few unmounted pages ahead'], [{ mounted: 0 }, 'no page mounted during the hold'], [{ views: 2 }, 'too little travel'], [{ settled: false }, 'never settled'], [{ coldFrames: undefined }, 'no DOM reading']])
			assert.deepEqual(pgdnVerdict([hold([rows], { ...R, ...o })]).map((x) => x.ok), [false, false, false], `not judgeable: ${why}`);
		assert.deepEqual(pgdnVerdict([hold([edge])], { pixels: false }).map((x) => x.ok), [true, true], 'the sandbox surface: the judgeability and DOM rows only (its screencast bands are logged)');
		assert.deepEqual(pgdnVerdict([hold([rows], drawn)], { pixels: false }).map((x) => x.ok), [true, false], 'the sandbox surface still fails an unmounted page in view');
		assert.deepEqual(pgdnVerdict([]).map((x) => x.ok), [false, false, false], 'no hold fails');
		assert.deepEqual(pgdnVerdict(null).map((x) => x.ok), [false, false, false], 'no reading fails');
		// live: both surfaces run pgdnRoute; it holds trusted PageDowns after a text click, films with the marker and sinks every row
		for (const surface of ['normal', 'sandbox']) {
			const name = `R93 #4 a held PageDown down a fresh Code & Tools never shows a page placeholder (${surface})`;
			assert.equal(typeof tests[name], 'function', `the held PageDown route is a live test on the ${surface} surface`);
			assert.ok(live(String(tests[name]), /pgdnRoute\(t, surface\)/), 'it runs pgdnRoute');
		}
		const psrc = String(pgdnRoute);
		for (const [re, msg] of [[/for \(const look of flingLooks\(t\.args\.flingLooks\)\) \{/, 'every fling look'], [/\.domain-link\[data-domain="general"\]'\)\.first\(\)\.click\(\);[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*psc-vsync-marker[^\n]*\n\t*await f\.locator\('#pm-settings-root \.domain-link\[data-domain="code"\]'\)\.first\(\)\.click\(\);/, 'each attempt enters Code & Tools fresh from General with the marker running'],
			[/if\(at\)\{await t\.page\.mouse\.click\(\(off\?off\.x:0\)\+at\.x,\(off\?off\.y:0\)\+at\.y\);/, 'a trusted click on plain text'], [/R\.key=e=>\{if\(e\.key!=='PageDown'\|\|!e\.isTrusted\)return;/, 'only trusted PageDowns are counted'],
			[/film = await filmFling\(client\);/, 'the screencast'], [/const p=Math\.round\(100\*c\/v\.height\);if\(p>=10\)R\.cold\.push\(/, 'the DOM reading of unmounted pages in view at each animation frame'], [/for \(let q = 0; q < PGDN\.keys; q\+\+\) \{ await t\.page\.keyboard\.press\('PageDown'\); await t\.page\.waitForTimeout\(PGDN\.gap\); \}/, 'the hold'],
			[/const px = pgdnFilm\(frames, \{ box, view: t\.page\.viewportSize\(\), key: r && r\.at \}\);/, 'the frames read on the key\'s clock'], [/if \(!a\.retry\) break;/, 'the retry'],
			[/const pixels = surface === 'normal';/, 'the pixel row on the normal surface'], [/for \(const row of pgdnVerdict\(holds, \{ pixels \}\)\) await t\.check\(`\$\{surface\}: \$\{row\.name\}`,row\.ok,row\.detail\);/, 'the live sink records each row']])
			assert.ok(live(psrc, re), `the held PageDown route: ${msg}`);
		assert.ok(PGDN.keys >= 10 && PGDN.gap <= 80 && PGDN.holds >= 2 && PGDN.minCold >= 3, 'a held key (10+ presses at most 80 ms apart), 2+ holds per look, 3+ unmounted pages ahead');
	}
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
		assert.match(d.rows[3].name, /^capture gaps \(host load or renderer stall\):/);
		assert.match(d.rows[3].detail, /^capture gaps \(host load or renderer stall\): 5 attempts unresolved, 0 bad frames, gaps /);
	}
	{
		const machine = { name: 'gtx1070ti', fleet: 'gpu-lane' };
		const read = async (host) => {
			assert.equal(host, 'gpu-lane', 'the sample is requested for the browser host');
			return { rows: [
				{ machine: { name: 'vm' }, state: { cpu: { busy_pct: 99, sample_s: 3 } } },
				{ machine, state: { fleet_queue: { cpu: { busy_pct: 23.9, covered_s: 61.3 } }, cpu: { busy_pct: 35.5, sample_s: 3.1 } } }
			] };
		};
		assert.equal(await captureCpuDetail('gpu-lane', read), 'browser host gpu-lane CPU 23.9% busy over 61.3 s (sampled after retries)');
		assert.equal(await captureCpuDetail('gtx1070ti', async () => ({ rows: [{ machine, state: { cpu: { busy_pct: 0, sample_s: 3 } } }] })),
			'browser host gtx1070ti CPU 0% busy over 3 s (sampled after retries)');
		assert.equal(await captureCpuDetail('vm', async () => ({ rows: [{ machine, state: { cpu: { busy_pct: 99 } } }] })), '', 'another host cannot supply a sample');
		assert.equal(await captureCpuDetail('gtx1070ti', async () => ({ rows: [{ machine, state: { snapshot: true, cpu: { busy_pct: 98 } } }] })),
			'', 'a cached slot snapshot cannot supply a new measurement');
		assert.equal(await captureCpuDetail('mac', async () => { throw new Error('slots unavailable'); }), '', 'a missing sample leaves the gap verdict intact');
	}
	for (const [seqs, driven, why] of [[[blank, good, good], [1], 'a resolved bad first attempt'], [[lost, blank, good], [1, 2], 'a resolved bad second attempt'], [[lostBlank, good, good], [1], 'an unresolved attempt with bad frames'], [[lost, lostBlank, good], [1, 2], 'a later unresolved attempt with bad frames'], [[late, good, good], [1], 'a later blank after a good first destination']]) {
		const d = await drive(seqs);
		assert.deepEqual(d.driven, driven, `${why} decides at once, no retry`);
		assert.equal(d.rows[3].ok, false, `${why} fails`);
		assert.doesNotMatch(d.rows[3].name, /capture gaps/);
	}
	const idleFill = { wheelPending: 0, wheelTargetPending: false };
	{
		const d = await drive([good, good], (k) => fling(k === 1 ? idleFill : {}));
		assert.deepEqual(d.driven, [1, 2]);
		assert.deepEqual(d.rows.map((r) => r.ok), [true, true, true, true], 'an idle-fill miss followed by a qualified attempt passes');
		assert.match(d.rows[3].detail, /Terminal look filled before the wheel/);
		const exhausted = await drive(Array(5).fill(good), () => fling(idleFill));
		assert.equal(exhausted.rows[0].ok, false, 'idle fills alone never witness the precondition');
		assert.doesNotMatch(exhausted.rows[3].name, /capture gaps/);
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
		// FO-248P: the document's own End scroll is completed in one step, so the two End fling routes deferred by FO-245 r5
		// are live again on both surfaces, each through the shared runner with its route
		for (const [name, route] of [[`R93 #4 End from a fresh Code & Tools paints its last page (${surface})`, 'end'], [`R93 #4 End after a text click from a fresh Code & Tools paints its last page (${surface})`, 'end-text'], [`R93 #4 Home after End from a fresh Code & Tools paints its first page (${surface})`, 'home']]) {
			assert.equal(typeof tests[name], 'function', `FO-248P: the ${route} route is a live test on the ${surface} surface`);
			assert.ok(live(String(tests[name]), new RegExp(`flingRoute\\(t, surface, '${route}'\\)`)), `the ${route} test runs the shared runner with its route`);
		}
		// INTEG4: FO-250's rows are live on both surfaces too: the two wheel routes with the document forced to composite,
		// and the long wheel over a contained roster at its end
		for (const [name, route] of [[`R93 #4 a fast wheel into lower Code fills visible lists before the frame, composited scrolling (${surface})`, 'terminal'],
			[`R93 #4 a single long wheel to the bottom of a fresh Code & Tools paints its last page, composited scrolling (${surface})`, 'wheel-bottom']]) {
			assert.equal(typeof tests[name], 'function', `FO-250: the composited ${route} route is a live test on the ${surface} surface`);
			assert.ok(live(String(tests[name]), new RegExp(`flingRoute\\(t, surface, '${route}', \\{composite:true\\}\\)`)), `the composited ${route} test runs the shared runner with the composite option`);
		}
		// FO-251: End, End after a text click and Home with the document forced to composite (the compositor's keyboard
		// animation that an instant scrollTo cannot cancel), so a host that scrolls by repainting judges that path too
		for (const [name, route] of [[`R93 #4 End from a fresh Code & Tools paints its last page, composited scrolling (${surface})`, 'end'],
			[`R93 #4 End after a text click from a fresh Code & Tools paints its last page, composited scrolling (${surface})`, 'end-text'],
			[`R93 #4 Home after End from a fresh Code & Tools paints its first page, composited scrolling (${surface})`, 'home']]) {
			assert.equal(typeof tests[name], 'function', `FO-251: the composited ${route} route is a live test on the ${surface} surface`);
			assert.ok(live(String(tests[name]), new RegExp(`flingRoute\\(t, surface, '${route}', \\{composite:true\\}\\)`)), `the composited ${route} test runs the shared runner with the composite option`);
		}
		const roster = tests[`R93 #4 a long wheel over a roster at its end leaves the document still (${surface})`];
		assert.equal(typeof roster, 'function', `FO-250 round 2: the roster row is a live test on the ${surface} surface`);
		assert.ok(live(String(roster), /rosterWheelRoute\(t, surface\)/), 'the roster row runs rosterWheelRoute');
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
	// FO-248P's route pins. INTEG4: FO-248K moved flingRoute's inline attempt into armFling (the page recorder) and
	// runFlingLook (the driver), so the pins read those two; the keydown gate keeps FO-248K's isTrusted-first form, and
	// Home's comparison window opens once End has settled (FO-248K's commit epoch)
	{
		const src = String(armFling) + '\n' + String(runFlingLook);
		const pin = (re, msg) => assert.ok(live(src, re), msg);
		pin(/const target=\(\)=>home\?firstBody\(\)\?\.closest\('\[data-workspace-block\]'\):deep\?lastBody\(\)\?\.closest\('\[data-workspace-block\]'\):root\.querySelector\('#section-editor-terminal-look'\);/, 'the deep routes aim at the chapter\'s last page, Home at its first');
		pin(/const targetPendingNow=\(\)=>home\?pendingNow\(\)>0:deep\?lastBody\(\)\?\.dataset\.workspaceMounted==='false':/, 'the deep routes need the last page unmounted at the input, Home unmounted pages between');
		// FO-248P: the Home route: a trusted End, the document still, a trusted click on plain text of that view, a trusted Home;
		// the input is the Home key, and its travel is measured from where End left the page
		pin(/const first=await text\(\);\n\t*if\(first\)\{await t\.page\.mouse\.click\(\(off\?off\.x:0\)\+first\.x,\(off\?off\.y:0\)\+first\.y\);await t\.page\.waitForTimeout\(200\);\}\n\t*await t\.page\.keyboard\.press\('End'\);/, 'Home: a trusted click on plain text of the first view, then a trusted End');
		assert.ok(src.indexOf("}else if(route==='home'){") < src.indexOf('const first=await text();') && src.indexOf('const first=await text();') < src.indexOf("await t.page.keyboard.press('Home');"), 'Home: the text click and End come before Home, in its branch');
		pin(/if\(at\)\{await t\.page\.mouse\.click\(\(off\?off\.x:0\)\+at\.x,\(off\?off\.y:0\)\+at\.y\);/, 'Home: a trusted click on plain text of the end view');
		pin(/await t\.page\.keyboard\.press\('Home'\);/, 'Home: a trusted Home');
		pin(/if\(!e\.isTrusted\|\|\(e\.type==='keydown'&&e\.key!==\(home\?'Home':'End'\)\)\)return;/, 'Home: the input is the trusted Home, not the End before it');
		pin(/if\(home\)R\.start=root\.querySelector\('#settings-document'\)\?\.scrollTop\?\?R\.start;/, 'Home: the travel is measured from the key\'s position');
		pin(/const kind=route==='end'\|\|route==='end-text'\|\|route==='home'\?'keydown':'wheel';/, 'Home records the key, not a wheel');
		pin(/R\.wheelTargetPending=targetPendingNow\(\);/, 'the target is judged pending at the input');
		pin(/if\(r\.height>0&&r\.bottom>v\.top&&r\.top<v\.bottom\)R\.empty\.push\('page:'\+p\.dataset\.continuousWorkspaceBody\);/, 'an unmounted page in the sampled view is empty');
		// FO-248P: the End branches of flingRoute run again: a visible button of the first view focused without scrolling, or
		// a trusted click on plain text; then a trusted End, recorded as the input on the frames' clock
		pin(/if\(route==='end'\)\{/, 'the End route branch');
		pin(/b\?\.focus\(\{preventScroll:true\}\);return !!b&&document\.activeElement===b;/, 'End from a visible button focused without scrolling');
		pin(/if\(at\)\{await f\.locator\('\[data-psc-text-click\]'\)\.click\(\{position:at\}\);/, 'End after a trusted click on plain text');
		assert.equal((src.match(/await t\.page\.keyboard\.press\('End'\);/g) || []).length, 3, 'both End branches press a trusted End, and the Home branch one before its Home');
		pin(/await f\.evaluate\(\(\)=>\{window\.__pscFling\.commitEpoch=performance\.timeOrigin\+performance\.now\(\);\}\);\n\t*await t\.page\.keyboard\.press\('Home'\);/, 'Home: the comparison window opens after End settled and the text click, right before the Home key');
		assert.ok(src.indexOf("}else if(route==='home'){") < src.indexOf('window.__pscFling.commitEpoch=performance.timeOrigin') , 'Home: the window opens in its own branch');
	}
	// FO-245 r3: the looks. Glass Dark and Glass Light are fling looks (their wallpaper passed the round 1 reading)
	for (const look of ['basic-dark', 'nier-light', 'glass-dark', 'glass-light']) assert.ok(FLING_LOOKS.includes(look), `${look} is a fling look`);
	assert.deepEqual(flingLooks(undefined), FLING_LOOKS, 'the default fling looks');
	assert.equal(flingLooks('all').length, 10, '--set flingLooks=all runs all ten');
	assert.deepEqual(flingLooks('glass-light,nope'), ['glass-light'], 'a named list keeps only real looks');
	assert.ok(live(String(flingRoute), /await runFlingLook\(t, f, look, surface, route, hooks\)/), 'the live runner judges each look with the exercised function');
	// INTEG4 (FO-248K + FO-250): FO-250's composite-style check runs from the exercised attempt, right after its General click
	assert.ok(live(String(runFlingLook), /waitForTimeout\(700\);\n\t\tif \(hooks\.afterGeneral\) await hooks\.afterGeneral\(\);\n\t\tconst box = /), 'the attempt runs the route hook after General');
	assert.ok(live(String(flingRoute), /const hooks = \{afterGeneral: async \(\) => \{\n\t\tif \(composited\) return;[^]*?composited = true;\n\t\tawait t\.check\([^\n]*will-change[^\n]*\/scroll-position\/\.test\(wc\)/), 'the composited routes check the style once, on the first attempt');
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
		assert.deepEqual(Object.keys(FLING_ROUTES), ['terminal', 'wheel-bottom', 'end', 'end-text', 'home']);
		// FO-248P: Home goes up, needs body focus and unmounted pages between at the key
		const up = (o) => deep({ wheelFocus: 'body', top: 0, moved: -19000, ...o });
		assert.deepEqual(flingVerdict(up({}), null, 'home').slice(0, 3).map((x) => x.ok), [true, true, true], 'home: body focus, pages between unmounted, crossed up into the first page, nothing empty');
		assert.equal(flingVerdict(up({ moved: 19000 }), null, 'home')[1].ok, false, 'home: a move down is not Home\'s travel');
		assert.equal(flingVerdict(up({ moved: -100 }), null, 'home')[1].ok, false, 'home: under one viewport up fails');
		assert.equal(flingVerdict(up({ wheelTargetPending: false }), null, 'home')[0].ok, false, 'home: no unmounted page between did not test a cold crossing');
		assert.equal(flingVerdict(up({ wheelFocus: 'button#x' }), null, 'home')[0].ok, false, 'home: the route needs body focus');
		assert.equal(flingVerdict(deep({ moved: -19000 }), null, 'end')[1].ok, false, 'end: a move up is not End\'s travel');
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
	console.log('PASS fling frames: blank, unfilled and wallpaper-only frames on screen fail through the live recorder and judge (edge detail, FO-245 r3), a lost arrival frame is not judged, and the five live routes (Terminal look, a long wheel to the bottom, End from a focused button, End after a text click and Home after End; FO-248P) in the Glass looks too use both and the shared retry');
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
		'30-inspector.js': 5, '32-model-nicknames.js': 1, '46-first-screen.js': 5, '60-wizard.js': 1
	};
	/* INTEG4: 46-first-screen.js has four keyboard registrations since FO-248P (main's three plus its passive bubble-phase
	   note on window, whose no-interception contract the FO-248P block below pins); FO-251 adds a fifth, the
	   End / Home take-over (pinned and run on stand-ins in its own block below) */
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
/* FO-245 r5 (option C) removed rounds 3-4's End/Home key listener: it overrode the tab list, the roster and the wallpaper
   picker (R143, R144). FO-248P (2026-11-28) lands End / Home in one step without intercepting a key: a passive,
   bubble-phase note on window of an End / Home no handler took, and the document's OWN scroll toward that edge (its scroll
   event, or the next rAF after the frame's scroll animations) completed at once. These pins hold that contract. */
{
	const fs = await import('node:fs');
	const prod = fs.readFileSync(new URL('../../../onboarding/opus-5.5/src/settings/kit.d/46-first-screen.js', import.meta.url), 'utf8');
	const code = prod.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
	const block = (at) => { let i = code.indexOf('{', at), depth = 0, j = i; for (; j < code.length; j++) { if (code[j] === '{') depth++; else if (code[j] === '}' && --depth === 0) break; } return code.slice(at, j + 1); };
	const fn = (name) => { const at = code.indexOf(`function ${name}(`); assert.ok(at >= 0, `${name} is defined`); return block(at); };
	// End and Home are named in two places only: main's fill set and the FO-248P note
	// INTEG4 fix 1 (A152 M2) + FO-251: End once more in the note's owner test, and End / Home in FO-251's take-over
	assert.equal((code.match(/['"`]End['"`]/g) || []).length, 5, 'End is named in main\'s fill set, three times in the note (the key test, the owner test and the edge) and in FO-251\'s take-over');
	assert.equal((code.match(/['"`]Home['"`]/g) || []).length, 3, 'Home is named in main\'s fill set, in the note and in FO-251\'s take-over');
	// main's capture listener only fills, unchanged (FO-248P: skipping it while pages were unmounted left General's Home 104 px short)
	assert.match(code, /const O55FS_KEYS = new Set\(\['End', 'Home'\]\);\nroot\.addEventListener\('keydown', e => \{\n  if \(!o55fs\.pending\.size\) return;\n  const sc = root\.querySelector\('#settings-document'\);\n  if \(O55FS_KEYS\.has\(e\.key\) && sc && \(e\.target === sc \|\| sc\.contains\(e\.target\)\) && !\(e\.target\.matches && e\.target\.matches\('input, textarea, select, \[contenteditable=""\], \[contenteditable="true"\]'\)\)\) o55fsFillAll\(\);\n\}, true\);/, 'main\'s End/Home listener only fills the pending rows, unchanged');
	assert.equal((code.match(/O55FS_KEYS/g) || []).length, 2, 'the fill set is used by that listener only');
	for (const gone of ['o55fsMountEnd', 'o55fsEdgeKeyOwner', 'O55FS_OWN_KEYS', 'o55fsDownInDoc'])
		assert.equal(code.includes(gone), false, `${gone} (rounds 3-4's End/Home jump) is gone`);
	// no keydown listener scrolls, mounts or prevents a key's default
	const keys = [...code.matchAll(/addEventListener\('keydown',/g)].map((m) => block(m.index)).filter((body) => !body.includes('O55FS_EDGE_OWN'));
	assert.equal(keys.length, 4, 'FO-251\'s take-over (pinned below) is the only keydown listener left out of this contract');
	for (const body of keys) assert.equal(/preventDefault|scrollTo\(|scrollBy\(|scrollTop\s*=(?!=)|scrollIntoView|mountContinuousWorkspace|o55fsMount|o55fsEdgeLand/.test(body), false, `a keydown listener neither scrolls, mounts nor takes a key's default: ${body.split('\n')[0]}`);
	assert.equal(/document\.addEventListener\('pointerdown'/.test(code), false, 'no pointer-down memory on document (round 4\'s text-click route)');
	// the note: one listener on window, passive (it cannot cancel), bubble phase (after every widget's own handler)
	const notes = [...code.matchAll(/\nwindow\.addEventListener\('keydown', e => \{\n  o55fsEdge = null;/g)];
	assert.equal(notes.length, 1, 'one FO-248P key note, on window');
	const note = block(notes[0].index + 1), tailOf = code.slice(notes[0].index + 1 + note.length, notes[0].index + 1 + note.length + 24);
	assert.match(tailOf, /^, \{ passive: true \}\);/, 'the note is passive and in the bubble phase (no capture)');
	assert.match(note, /const edge = \(e\.key === 'End' \|\| e\.key === 'Home'\) && !e\.shiftKey;\n  if \(\(!step && !edge\) \|\| e\.defaultPrevented \|\| e\.altKey \|\| e\.metaKey\) return;/, 'End / Home (Ctrl too, never Shift: a selection) or a step key, and never a key a widget took (defaultPrevented); any other key returns first');
	assert.match(note, /if \(t && t\.nodeType === 1 && \(t\.isContentEditable \|\| t\.closest\(O55FS_EDGE_TEXT\)\)\) return;/, 'never from a text field');
	// INTEG4 fix 1 (A152 M2): a key whose focus is in a scroller of the document that takes it (a focused provider row of
	// the roster) gets no note, so a pending wheel's move of the document is never landed as that key's
	assert.match(note, /O55FS_STEP_KEYS\[e\.key\]; return; \}\n\s*if \(t instanceof Element && sc\.contains\(t\) && o55fsInnerTakes\(t, sc, e\.key === 'End' \? 1 : -1\)\) return;\n\s*const k = o55fsEdge = /, 'the focused inner scroller owns End / Home: tested after the step keys, before the note is made');
	// INTEG4 fix 1 (A152 M4): every render lets go of disconnected sections in the never-laid-out set, as in the skipped set
	assert.match(code, /for \(const s of o55fsSkipped\) if \(!s\.isConnected\) o55fsSkipped\.delete\(s\);\s*for \(const s of o55fsUnseen\) if \(!s\.isConnected\) o55fsUnseen\.delete\(s\);\n  return r;\n\};/, 'renderApp prunes o55fsUnseen of a replaced chapter\'s sections (A152 M4: 47 retired chapter roots held)');
	assert.equal((code.match(/new (?:Set|Map)\(/g) || []).length, 5, 'five strong collections: main\'s End/Home key set, and four that can hold sections (pending, skipped, unseen, fresh), each pruned or reset; a new one is reviewed here');
	assert.match(note, /const cold = o55fsCold\(sc\);\n  if \(!sc \|\| \(step \? !cold : !\(cold \|\| o55fsUnlaid\(sc\)\)\) \|\| !o55fsInteractive\(\)\) return;/, 'End / Home only while the chapter has unmounted pages or sections never laid out, a step key only while pages are unmounted, and only while Settings takes input');
	assert.ok(note.indexOf('if ((!step && !edge)') < note.indexOf('O55FS_EDGE_TEXT') && note.indexOf('O55FS_EDGE_TEXT') < note.indexOf('o55fsInteractive()'), 'the key test, then the text field, then the style read');
	// never laid out: a section content-visibility skipped since it was drawn and has not laid out once (nor shown, FO-245)
	assert.match(code, /if \(e\.skipped\) \{ o55fsSkipped\.add\(s\); if \(!o55fsLaid\.has\(s\)\) o55fsUnseen\.add\(s\); \}\n  else \{ o55fsSkipped\.delete\(s\); o55fsLaid\.add\(s\); o55fsUnseen\.delete\(s\); \}/, 'a section joins the never-laid-out set when skipped before any layout, and leaves it at its first layout');
	assert.match(code, /s\.style\.contentVisibility = 'visible'; o55fsSkipped\.delete\(s\); o55fsLaid\.add\(s\); o55fsUnseen\.delete\(s\); shown\.push\(s\);/, 'a skipped section shown before its frame (FO-245) is laid out');
	assert.match(code, /const o55fsUnlaid = sc => \{\n  for \(const s of o55fsUnseen\) \{\n    if \(!s\.isConnected\) \{ o55fsUnseen\.delete\(s\); continue; \}\n    if \(sc\.contains\(s\) && !s\.closest\('details:not\(\[open\]\)'\)\) return true;/, 'only a connected section of the document outside a closed disclosure counts');
	assert.match(note, /const k = o55fsEdge = \{ at: performance\.now\(\), end: e\.key === 'End', top: sc\.scrollTop \};/, 'the note keeps the time, the edge and the position at the key');
	assert.match(note, /const watch = \(\) => \{ if \(o55fsEdge !== k\) return; const s = root\.querySelector\('#settings-document'\); if \(s\) o55fsEdgeScroll\(s\); if \(o55fsEdge === k\) requestAnimationFrame\(watch\); \};\n  requestAnimationFrame\(watch\);\n\}$/, 'the note is read in each frame\'s rAF while it lives, from the key\'s next frame');
	for (const tx of ['input:not([type="checkbox"])', 'textarea', 'select', '[contenteditable]:not([contenteditable="false"])', '[role="textbox"]', '[role="searchbox"]'])
		assert.ok(code.includes(`const O55FS_EDGE_TEXT = '`) && code.slice(code.indexOf('const O55FS_EDGE_TEXT')).split('\n')[0].includes(tx), `a text field is not the document's: ${tx}`);
	// the take-over: only the document's own move toward the noted edge, within O55FS_EDGE_MS
	const take = fn('o55fsEdgeScroll');
	assert.match(take, /if \(performance\.now\(\) - k\.at > O55FS_EDGE_MS\) \{ o55fsEdge = null; return false; \}/, 'the note expires');
	assert.match(take, /const moved = sc\.scrollTop - k\.top;\n  if \(k\.end \? moved <= 0 : moved >= 0\) return false;/, 'only a move of the document toward the noted edge is taken');
	assert.match(take, /o55fsEdge = null;\s*o55fsEdgeLand\(sc, k\.end\);/, 'it is taken once');
	const edgeMs = Number((code.match(/\nconst O55FS_EDGE_MS = (\d+);\n/) || [])[1]);
	assert.ok(edgeMs >= 200 && edgeMs <= 1000, `O55FS_EDGE_MS covers a slow first frame and no more than a second (${edgeMs})`);
	// INTEG4 fix 1 (A152 M3): the landing's last pixel is a programmatic smooth scroll, which replaces Chrome's own keyboard
	// End/Home animation (that animation dragged a wheel up made as the bottom appeared back to the bottom); newer input
	// ends it where the page is, and four frames without input put the page exactly at the edge
	const land = fn('o55fsEdgeLand');
	assert.match(land, /o55fsMountEdge\(sc, end\);\s*const edge = end \? sc\.scrollHeight - sc\.clientHeight : 0;\n  sc\.scrollTo\(\{ top: end \? edge - 1 : 1, behavior: 'instant' \}\);\n  sc\.scrollTo\(\{ top: edge, behavior: 'smooth' \}\);\n/, 'the landing mounts the edge pages, lands one pixel short at once, and takes the last pixel as the page\'s own smooth scroll');
	assert.match(land, /const step = o55fsLandStep = \{ sc, end, n: 0 \};\n  const settle = \(\) => \{\n    if \(o55fsLandStep !== step\) return;\n    if \(\+\+step\.n < 4\) \{ requestAnimationFrame\(settle\); return; \}\n    o55fsLandStep = null;\n    sc\.scrollTo\(\{ top: end \? sc\.scrollHeight - sc\.clientHeight : 0, behavior: 'instant' \}\);\n  \};\n  requestAnimationFrame\(settle\);\s*o55fsFillNear\(sc\); o55fsShowNear\(sc\);/, 'four frames later, with no newer input, the page is exactly at the edge; the rows are shown before the frame');
	const landInput = code.slice(code.indexOf('const o55fsLandInput = e => {'), code.indexOf('\n};\n', code.indexOf('const o55fsLandInput = e => {')) + 3);
	assert.match(landInput, /if \(!e\.isTrusted \|\| \(!st && !held\)\) return;\n  o55fsLandStep = null;/, 'only trusted input, and only while a landing settles or is held');
	assert.match(landInput, /const edge = \(held \? held\.end : st\.end\) \? sc\.scrollHeight - sc\.clientHeight : 0;\n  sc\.scrollTo\(\{ top: held && Math\.abs\(sc\.scrollTop - edge\) > 2 \? edge : sc\.scrollTop, behavior: 'instant' \}\);/, 'the input ends the smooth pixel where the page is, and during the hold starts from the landed edge (the arrival restore had moved it)');
	assert.equal(/preventDefault/.test(landInput), false, 'it never cancels the input');
	for (const ev of ['wheel', 'pointerdown', 'touchstart'])
		assert.ok(code.includes(`window.addEventListener('${ev}', o55fsLandInput, { capture: true, passive: true });`), `newer input wins: ${ev} (capture, passive: it never cancels)`);
	assert.match(note, /^window\.addEventListener\('keydown', e => \{\n  o55fsEdge = null; o55fsEdgeHeld = null; o55fsStepAt = -Infinity; o55fsLandStep = null;/, 'any key drops a landing\'s settle to the edge (it never scrolls from the key)');
	assert.match(take, /const held = o55fsEdgeHeld = \{ end: k\.end, n: 3 \};/, 'the landing is kept for three frames (the arrival\'s own restore)');
	assert.match(take, /if \(--held\.n > 0\) requestAnimationFrame\(keep\); else o55fsEdgeHeld = null;\n  \};\n  requestAnimationFrame\(keep\);\n  return true;\n\}$/, 'the hold starts in the landing\'s next frame and runs its three frames');
	assert.match(take, /if \(s && Math\.abs\(s\.scrollTop - \(held\.end \? s\.scrollHeight - s\.clientHeight : 0\)\) > 2\) o55fsEdgeLand\(s, held\.end\);/, 'a write that moves the landed page off its edge is undone');
	assert.equal((code.match(/o55fsEdgeLand\(/g) || []).length, 3, 'o55fsEdgeLand: defined, the take-over and the hold');
	assert.equal((code.match(/o55fsEdgeScroll\(/g) || []).length, 4, 'o55fsEdgeScroll: defined, the scroll handler, the rAF read and FO-251\'s take-over');
	// anything else ends the note and the hold: another key, a wheel, a pointer press, another scroller's scroll
	assert.match(note, /^window\.addEventListener\('keydown', e => \{\n  o55fsEdge = null; o55fsEdgeHeld = null; o55fsStepAt = -Infinity;/, 'every key ends the note, the hold and the step window first');
	assert.match(code, /\nroot\.addEventListener\('wheel', \(\) => \{ o55fsEdge = null; o55fsEdgeHeld = null; o55fsStepAt = -Infinity; \}, \{ capture: true, passive: true \}\);\n/, 'a wheel ends them');
	assert.match(code, /\nroot\.addEventListener\('pointerdown', \(\) => \{ o55fsEdge = null; o55fsEdgeHeld = null; o55fsStepAt = -Infinity; \}, \{ capture: true, passive: true \}\);\n/, 'a pointer press ends them');
	// the scroll handler: the take-over first, then r6's wheel mount or the step keys' look-ahead, then the fills and shows
	assert.match(code, /root\.addEventListener\('scroll', e => \{\n  if \(e\.target\.id !== 'settings-document'\) \{ o55fsEdge = null; return; \}\n  o55fsEdgeScroll\(e\.target\);\n  if \(o55fsWheeling\(\)\) o55fsMountNear\(e\.target\);\n  else if \(o55fsStepping\(\)\) o55fsMountNear\(e\.target, o55fsStepDir\);\n  o55fsFillNear\(e\.target\); o55fsShowNear\(e\.target\);\n\}, true\);/, 'the scroll handler: another scroller ends the note; the take-over, the wheel or step mount, the fills and shows, before the frame');
	for (const kept of ['function o55fsMountNear(sc, ahead = 0)', 'function o55fsShowNear(sc)', 'function o55fsShowFor(shown)', 'const o55fsFresh = new Set();', 'mountContinuousWorkspace = function (id)', "root.addEventListener('contentvisibilityautostatechange'"])
		assert.ok(code.includes(kept), `kept: ${kept}`);
	console.log(`PASS End/Home: no key intercepted; a passive bubble note of an untaken End/Home, and only the document's own scroll toward that edge within ${edgeMs} ms is completed in one step (FO-248P)`);
}

/* FO-251 (pm7-build: on every platform): where the document is a composited scroller (macOS always; Windows and Linux
   where Chrome gives up LCD text) Chrome's keyboard End / Home is a compositor animation an instant scrollTo cannot
   cancel, so FO-248P's take-over lands and the compositor drags the view back across empty pages. On every platform an
   End / Home (Ctrl too off macOS; Cmd+Down / Cmd+Up on macOS only) that reaches window unhandled and whose scroller is the
   document is cancelled and landed by the note's take-over. Pinned: no platform gate on the registration, the modifier
   rule per platform, the bubble-phase window listener, every guard before the cancel, and the listener run as written on
   stand-ins. */
{
	const fs = await import('node:fs');
	const prod = fs.readFileSync(new URL('../../../onboarding/opus-5.5/src/settings/kit.d/46-first-screen.js', import.meta.url), 'utf8');
	const code = prod.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
	const cut = (from, to) => { const a = code.indexOf(from); assert.ok(a >= 0, `found: ${from}`); const b = code.indexOf(to, a); assert.ok(b > a, `found the end of: ${from}`); return code.slice(a, b + to.length); };
	assert.match(code, /\nconst O55FS_MAC = \/\^Mac\/\.test\(navigator\.platform \|\| ''\);\n/, 'macOS is told by the browser (its navigator.platform)');
	const mac = cut("root.addEventListener('pointerdown', e => { o55fsPressed = e.target; }", '\n});\n');
	assert.equal((code.match(/O55FS_MAC/g) || []).length, 2, 'O55FS_MAC: declared and read once, by the modifier rule (no gate on the registration)');
	assert.equal(code.includes('if (O55FS_MAC)'), false, 'the take-over is registered on every platform (pm7-build, 2026-11-28)');
	assert.match(mac, /^root\.addEventListener\('pointerdown', e => \{ o55fsPressed = e\.target; \}, \{ capture: true, passive: true \}\);\nwindow\.addEventListener\('keydown', e => \{\n/, 'the pressed-node memory (passive) and the key listener on window, at the top level');
	assert.match(mac, /\n\}\);\n$/, 'the key listener is bubble phase (no options): it runs after every widget\'s own handler and after the note');
	assert.ok(code.indexOf("root.addEventListener('pointerdown', e => { o55fsPressed") > code.indexOf("window.addEventListener('keydown', e => {\n  o55fsEdge = null;"), 'registered after FO-248P\'s note');
	const order = ['!e.isTrusted || e.isComposing || e.defaultPrevented || e.shiftKey || e.altKey || (O55FS_MAC ? e.ctrlKey : e.metaKey)', "e.metaKey ? e.key === 'ArrowDown' : e.key === 'End'", "e.metaKey ? e.key === 'ArrowUp' : e.key === 'Home'", 't.closest(O55FS_EDGE_TEXT)', '!(o55fsCold(sc) || o55fsUnlaid(sc)) || !o55fsInteractive()', 'o55fsPressed : t', '!sc.contains(from)', 'el.closest(O55FS_EDGE_OWN)', 'o55fsInnerTakes(from, sc, end ? 1 : -1)', 'sc.scrollTop >= sc.scrollHeight - sc.clientHeight - 1 : sc.scrollTop <= 0', 'e.preventDefault()'];
	let last = -1;
	for (const g of order) { const i = mac.indexOf(g); assert.ok(i > last, `in order, before the cancel: ${g}`); last = i; }
	assert.match(mac, /e\.preventDefault\(\);\s*o55fsEdge = \{ at: performance\.now\(\), end, top: sc\.scrollTop \+ \(end \? -1 : 1\) \};\s*o55fsEdgeScroll\(sc\);\n\}\);/, 'then the note\'s own take-over, landing and three-frame hold (no second landing path)');
	for (const own of ['[role="tablist"]', '[role="tab"]', '[role="listbox"]', '[role="option"]', '[role="menu"]', '[role="slider"]', '[role="spinbutton"]', '[role="grid"]', '[role="tree"]', '[aria-expanded="true"]', '.wpk-row'])
		assert.ok(code.slice(code.indexOf('const O55FS_EDGE_OWN')).split('\n')[0].includes(own), `a widget that owns End / Home keeps it: ${own}`);
	/* run as written on stand-ins */
	const src = ['let o55fsEdge = null;', cut('const O55FS_EDGE_TEXT', ';\n'), cut('const O55FS_MAC', ';\n'), cut('const O55FS_EDGE_OWN', ';\n'), cut('let o55fsPressed', ';'), mac, cut('function o55fsInnerTakes(', '\n}\n'),
		'return { TEXT: O55FS_EDGE_TEXT, OWN: O55FS_EDGE_OWN, edge: () => o55fsEdge };'].join('\n');
	let S = null;
	class Node { constructor(o) { Object.assign(this, { parentElement: null, scrollTop: 0, scrollHeight: 50, clientHeight: 50, style: {}, isConnected: true, kinds: [] }, o); } }
	class Element extends Node {
		constructor(o) { super({ nodeType: 1, ...o }); }
		matches(sel) { return (sel === S.TEXT && this.kinds.includes('text')) || (sel === S.OWN && this.kinds.includes('own')); }
		closest(sel) { for (let n = this; n; n = n.parentElement) if (n.matches && n.matches(sel)) return n; return null; }
	}
	const make = ({ platform = 'MacIntel', cold = true, unlaid = false, interactive = true } = {}) => {
		const sc = new Element({ id: 'settings-document', scrollHeight: 20000, clientHeight: 900, scrollTop: 0 });
		sc.contains = (n) => { for (let x = n; x; x = x.parentElement) if (x === sc) return true; return false; };
		const body = new Element({}), documentElement = new Element({}), takes = [];
		const L = { keydown: null, pointerdown: null };
		const root = { querySelector: (sel) => sel === '#settings-document' ? sc : null, addEventListener: (type, fn) => { L[type] = fn; } };
		const win = { addEventListener: (type, fn) => { L[type] = fn; } };
		S = new Function('root', 'window', 'document', 'navigator', 'getComputedStyle', 'Node', 'Element', 'o55fsCold', 'o55fsUnlaid', 'o55fsInteractive', 'o55fsEdgeScroll', src)(
			root, win, { body, documentElement }, { platform }, (n) => n.style, Node, Element, () => cold, () => unlaid, () => interactive, (s) => takes.push({ s, edge: S.edge() }));
		const key = (key, target, o = {}) => { const e = { key, target, isTrusted: true, isComposing: false, defaultPrevented: false, shiftKey: false, altKey: false, ctrlKey: false, metaKey: false, ...o, preventDefault() { e.defaultPrevented = true; } }; if (L.keydown) L.keydown(e); return e; };
		const press = (target) => L.pointerdown && L.pointerdown({ target });
		return { sc, body, L, key, press, takes };
	};
	for (const platform of ['Win32', 'Linux x86_64']) {
		const { sc, body, L, key, press, takes } = make({ platform });
		assert.equal(typeof L.keydown, 'function', `${platform}: the take-over is registered (every platform)`); assert.equal(typeof L.pointerdown, 'function', `${platform}: so is the pressed-node memory`);
		press(new Element({ parentElement: sc }));
		assert.equal(key('End', body).defaultPrevented, true, `${platform}: End after a text click is taken`);
		assert.equal(key('End', body, { ctrlKey: true }).defaultPrevented, true, `${platform}: Ctrl+End is taken (it scrolls the document off macOS)`);
		sc.scrollTop = 5000; assert.equal(key('Home', body, { ctrlKey: true }).defaultPrevented, true, `${platform}: Ctrl+Home too`); assert.equal(takes.at(-1).edge.end, false);
		sc.scrollTop = 0; const n = takes.length;
		for (const [k, o, why] of [['ArrowDown', { metaKey: true }, 'Meta+Down (the Windows key; Cmd+Down is macOS only)'], ['End', { metaKey: true }, 'Meta+End'], ['End', { shiftKey: true }, 'Shift+End'], ['End', { altKey: true }, 'Alt+End']])
			assert.equal(key(k, body, o).defaultPrevented, false, `${platform}: left alone: ${why}`);
		assert.equal(takes.length, n, `${platform}: none of those reached the landing`);
	}
	{ const { sc, body, key, press, takes } = make(); const text = new Element({ parentElement: sc });
		press(text);
		const e = key('End', body); assert.equal(e.defaultPrevented, true, 'End after a text click (focus on the body) is taken');
		assert.equal(takes.length, 1); assert.equal(takes[0].s, sc, 'landed through the note\'s take-over on the document');
		assert.deepEqual({ end: takes[0].edge.end, top: takes[0].edge.top }, { end: true, top: -1 }, 'as a move toward the end');
		sc.scrollTop = 19000;
		const h = key('Home', body); assert.equal(h.defaultPrevented, true, 'Home is taken'); assert.deepEqual({ end: takes[1].edge.end, top: takes[1].edge.top }, { end: false, top: 19001 }, 'as a move toward the top');
		sc.scrollTop = 0;
		assert.equal(key('ArrowDown', body, { metaKey: true }).defaultPrevented, true, 'Cmd+Down is End on macOS');
		assert.equal(takes.at(-1).edge.end, true);
		sc.scrollTop = 500; assert.equal(key('ArrowUp', body, { metaKey: true }).defaultPrevented, true, 'Cmd+Up is Home'); assert.equal(takes.at(-1).edge.end, false);
		const n = takes.length;
		for (const [k, o, why] of [['ArrowDown', {}, 'a plain arrow'], ['End', { ctrlKey: true }, 'Ctrl+End (it does not scroll on macOS)'], ['End', { shiftKey: true }, 'Shift+End (a selection)'], ['End', { altKey: true }, 'Alt+End'], ['End', { metaKey: true }, 'Cmd+End'], ['PageDown', {}, 'PageDown'], ['End', { isTrusted: false }, 'a script\'s synthetic End (no default action on main)'], ['End', { isComposing: true }, 'End during an IME composition'], ['End', { defaultPrevented: true }, 'a key a widget took']])
			assert.equal(key(k, body, o).defaultPrevented, !!o.defaultPrevented, `left alone: ${why}`);
		assert.equal(takes.length, n, 'none of those reached the landing'); }
	{ const { sc, key } = make(); const btn = new Element({ parentElement: sc });
		assert.equal(key('End', btn).defaultPrevented, true, 'End on a focused button in the document is taken (main: the browser scrolls the document)'); }
	{ const { sc, key } = make(); const field = new Element({ parentElement: sc, kinds: ['text'] }); assert.equal(key('End', field).defaultPrevented, false, 'a text field keeps End'); }
	{ const { sc, key } = make(); const ce = new Element({ parentElement: sc, isContentEditable: true }); assert.equal(key('End', ce).defaultPrevented, false, 'so does an editable'); }
	{ const { sc, key } = make(); const list = new Element({ parentElement: sc, kinds: ['own'] }), tab = new Element({ parentElement: list }); assert.equal(key('End', tab).defaultPrevented, false, 'a widget that owns End / Home (a tab list, the wallpaper picker) keeps it, even when it did not cancel it'); }
	{ const { sc, body, key, press } = make(); const row = new Element({ parentElement: sc, kinds: ['own'] }), tile = new Element({ parentElement: row }); press(tile); assert.equal(key('Home', body).defaultPrevented, false, 'also after a press on it with focus on the body'); }
	for (const [o, why] of [[{ cold: false }, 'a chapter with every page mounted and laid out (Chrome\'s smooth End, decision A)'], [{ interactive: false }, 'Settings not taking input']]) {
		const { sc, key } = make(o); assert.equal(key('End', new Element({ parentElement: sc })).defaultPrevented, false, `left alone: ${why}`); }
	{ const { sc, key } = make({ cold: false, unlaid: true }); assert.equal(key('End', new Element({ parentElement: sc })).defaultPrevented, true, 'sections never laid out count as cold'); }
	{ const { body, key, press } = make(); const rail = new Element({}); press(rail); assert.equal(key('End', body).defaultPrevented, false, 'a press outside the document leaves the key to the browser'); }
	{ const { sc, body, key, press } = make(); const gone = new Element({ parentElement: sc, isConnected: false }); press(gone); assert.equal(key('End', body).defaultPrevented, false, 'so does a pressed node that is gone'); }
	{ const { body, key } = make(); assert.equal(key('End', body).defaultPrevented, false, 'and no press at all'); }
	const inner = (style, top, k = 'End') => { const { sc, body, key, press } = make(); if (k === 'Home') sc.scrollTop = 5000; const box = new Element({ parentElement: sc, scrollHeight: 1200, clientHeight: 700, scrollTop: top, style: { overflowY: 'auto', ...style } }); const item = new Element({ parentElement: box }); press(item); return key(k, body); };
	assert.equal(inner({ overscrollBehaviorY: 'contain' }, 0).defaultPrevented, false, 'the roster (contained overscroll) keeps End: it scrolls itself (R144)');
	assert.equal(inner({ overscrollBehaviorY: 'contain' }, 500).defaultPrevented, false, 'at its end too');
	assert.equal(inner({ overscrollBehaviorY: 'auto' }, 0).defaultPrevented, false, 'an inner scroller that can still move down keeps End');
	assert.equal(inner({ overscrollBehaviorY: 'auto' }, 500).defaultPrevented, true, 'an uncontained one at its end hands End on to the document');
	assert.equal(inner({ overscrollBehaviorY: 'auto' }, 0, 'Home').defaultPrevented, true, 'and one at its top hands Home on');
	{ const { sc, key } = make(); sc.scrollTop = 19100; assert.equal(key('End', new Element({ parentElement: sc })).defaultPrevented, false, 'a document already at its end is left alone'); sc.scrollTop = 0; assert.equal(key('Home', new Element({ parentElement: sc })).defaultPrevented, false, 'and at its top'); }
	console.log('PASS FO-251 End / Home take-over: every platform (Cmd+arrows on macOS, Ctrl off it), bubble on window after the note, every guard before the cancel, run on stand-ins (widgets, text fields, the roster, presses outside, Ctrl/Shift/Alt kept)');
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
	assert.equal(wheels.length, 4, 'four wheel listeners in the product file: the gate, FO-248P\'s note reset (both passive, capturing on root), FO-250\'s long-wheel jump (window, not passive) and A152 M3\'s newer-input listener');
	assert.equal((code.match(/addEventListener\(\s*['"`]wheel['"`], o55fsLandInput, \{ capture: true, passive: true \}\)/g) || []).length, 1, 'and A152 M3\'s passive newer-input listener, which never cancels');
	assert.equal(wheels.filter((m) => code.slice(m.index - 5, m.index) === 'root.').length, 2, 'two of them are on root (the gate and the note reset)');
	assert.match(code, /\nroot\.addEventListener\('wheel', \(\) => \{ o55fsWheelAt = performance\.now\(\); \}, \{ capture: true, passive: true \}\);\n/, 'the wheel listener is passive, captures on root and only notes the time');
	// FO-250: the one cancelling listener is the long-wheel jump (below); nothing else in the file cancels a default
	assert.equal((code.match(/preventDefault/g) || []).length, 2, 'only FO-250\'s long-wheel jump and FO-251\'s End / Home take-over cancel an event\'s default');
	assert.ok(code.lastIndexOf('preventDefault') > code.indexOf("window.addEventListener('wheel', e => {"), 'one cancel is inside the FO-250 wheel listener');
	assert.ok(code.indexOf('preventDefault') > code.indexOf("root.addEventListener('pointerdown', e => { o55fsPressed") && code.indexOf('preventDefault') < code.indexOf("window.addEventListener('wheel', e => {"), 'the other is inside FO-251\'s take-over');
	assert.equal((code.match(/o55fsWheelAt\s*=(?!=)/g) || []).length, 2, 'o55fsWheelAt is set only where it is declared and in the wheel listener');
	assert.match(code, /\nconst o55fsWheeling = \(\) => performance\.now\(\) - o55fsWheelAt <= O55FS_WHEEL_MS;\n/, 'the gate compares the time since the last wheel with O55FS_WHEEL_MS');
	const ms = Number((code.match(/\nconst O55FS_WHEEL_MS = (\d+);\n/) || [])[1]);
	assert.ok(ms >= 100 && ms <= 1000, `O55FS_WHEEL_MS covers a wheel's smooth scroll and no more than a second (${ms})`);
	assert.equal((code.match(/let o55fsWheelAt = -Infinity;/g) || []).length, 1, 'no wheel before the first one');
	const calls = [...code.matchAll(/o55fsMountNear\(/g)].map((m) => code.slice(code.lastIndexOf('\n', m.index) + 1, code.indexOf('\n', m.index)));
	assert.deepEqual(calls.map((l) => l.trim().startsWith('function') ? 'def' : /if \(o55fsWheeling\(\)\) o55fsMountNear\(e\.target\);/.test(l) ? 'gated' : /^\s*else if \(o55fsStepping\(\)\) o55fsMountNear\(e\.target, o55fsStepDir\);$/.test(l) ? 'step' : 'other'), ['def', 'gated', 'step'], 'o55fsMountNear is defined once and called only behind the wheel gate or, otherwise, the step keys\' window (FO-248P)');
	// FO-248P: the step keys' window. PageDown, PageUp, Space and the arrows (not with Ctrl) open it from the passive note;
	// End / Home, every other key, a wheel and a pointer press close it; it lasts the wheel gate's window; the mount it
	// gates looks one view ahead in the key's direction
	assert.match(code, /\nconst O55FS_STEP_KEYS = \{ PageDown: 1, PageUp: -1, ' ': 1, Spacebar: 1, ArrowDown: 1, ArrowUp: -1 \};\n/, 'the step keys and their directions');
	assert.match(code, /\nconst o55fsStepping = \(\) => performance\.now\(\) - o55fsStepAt <= O55FS_WHEEL_MS;\n/, 'the step window is the wheel gate\'s');
	assert.match(code, /const step = Object\.prototype\.hasOwnProperty\.call\(O55FS_STEP_KEYS, e\.key\) && !e\.ctrlKey;/, 'the step keys, never with Ctrl');
	assert.match(code, /if \(step\) \{ o55fsStepAt = performance\.now\(\); o55fsStepDir = e\.key === ' ' && e\.shiftKey \? -1 : O55FS_STEP_KEYS\[e\.key\]; return; \}/, 'a step key opens the window from the note, after the same untaken / text-field / cold-page tests');
	assert.equal((code.match(/o55fsStepAt = performance\.now\(\)/g) || []).length, 1, 'only the note opens the step window');
	assert.equal((code.match(/o55fsStepAt = -Infinity/g) || []).length, 4, 'closed at the start, by every key, a wheel and a pointer press');
	assert.match(code, /const r = sc\.getBoundingClientRect\(\), h = ahead \? sc\.clientHeight : 0;\n  const view = \{ top: r\.top - \(ahead < 0 \? h : 0\), bottom: r\.bottom \+ \(ahead > 0 \? h : 0\) \};/, 'the look-ahead is one view in the key\'s direction, none for the wheel');
	assert.equal((code.match(/o55fsWheeling\(\)/g) || []).length, 1, 'the gate is read only by the scroll handler');
	// the keydown listeners are main's three (End/Home fill, Find/F3/Select All, Tab) and FO-248P's passive note; no keyup/keypress
	assert.equal([...code.matchAll(/addEventListener\(\s*['"`]key(down|up|press)['"`]/g)].length, 5, 'five key listeners: main\'s three, FO-248P\'s passive note and FO-251\'s take-over');
	assert.equal([...code.matchAll(/addEventListener\(\s*['"`](keyup|keypress|beforeinput)['"`]/g)].length, 0, 'no keyup or keypress listener');
	for (const m of code.matchAll(/addEventListener\('keydown',/g)) {
		let i = code.indexOf('{', m.index), depth = 0, j = i;
		for (; j < code.length; j++) { if (code[j] === '{') depth++; else if (code[j] === '}' && --depth === 0) break; }
		assert.equal(/o55fsWheel|o55fsMountNear|mountContinuousWorkspace/.test(code.slice(m.index, j + 1)), false, 'no key listener touches the gate or mounts a page');
	}
	console.log(`PASS wheel gate: one passive wheel listener notes the time, o55fsMountNear runs only behind it (${ms} ms) or the step keys' window (FO-248P), and no key listener mounts or scrolls`);
}
/* FO-250: on a composited scroller (macOS) the compositor drew a long wheel's destination from the last committed paint
   before the frame that shows and paints it. A wheel of half a view or more on the settings document is scrolled by the
   main thread in one step. Pinned: its guards (only a cancelable vertical pixel wheel that no earlier listener took, no
   zoom or Shift, a document that can move and no scroller inside it that can still take the wheel), the threshold, the
   instant jump, a window listener that bubbles after the horizontal-strip wheel, and no part in the r6 gate. */
{
	const fs = await import('node:fs');
	const prod = fs.readFileSync(new URL('../../../onboarding/opus-5.5/src/settings/kit.d/46-first-screen.js', import.meta.url), 'utf8');
	const code = prod.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
	const at = code.indexOf("window.addEventListener('wheel', e => {");
	assert.ok(at > 0, 'the FO-250 wheel listener is on window');
	let depth = 0, j = code.indexOf('{', at);
	for (; j < code.length; j++) { if (code[j] === '{') depth++; else if (code[j] === '}' && --depth === 0) break; }
	const body = code.slice(at, code.indexOf('\n', j) + 1);
	assert.match(body, /\}, \{ passive: false \}\);\n$/, 'not passive and not capturing: it runs after the document\'s horizontal-strip wheel');
	for (const g of ['!e.cancelable', 'e.defaultPrevented', 'e.ctrlKey', 'e.shiftKey', 'e.deltaMode !== 0', 'Math.abs(e.deltaX) > Math.abs(e.deltaY)', '!sc.contains(e.target)', 'Math.abs(e.deltaY) < sc.clientHeight * O55FS_JUMP', 'Math.abs(to - top) < 1', 'o55fsInnerTakes(e.target, sc, e.deltaY)'])
		assert.ok(body.includes(g), `the jump's guard: ${g}`);
	assert.ok(body.indexOf('o55fsInnerTakes(') < body.indexOf('e.preventDefault()'), 'every guard runs before the cancel');
	assert.match(body, /e\.preventDefault\(\);\n  sc\.scrollTo\(\{ top: to, behavior: 'instant' \}\);/, 'cancel, then one instant main-thread scroll (the document\'s smooth scroll-behavior would hand it back to the compositor)');
	assert.equal(/o55fsWheel|o55fsMountNear|mountContinuousWorkspace|o55fsShowNear|o55fsFill/.test(body), false, 'the jump leaves the gate, the mount, the fill and the show to the scroll event');
	const jump = Number((code.match(/\nconst O55FS_JUMP = ([\d.]+);/) || [])[1]);
	assert.ok(jump >= 0.4 && jump <= 0.5, `O55FS_JUMP is between 0.4 and half a view: a 456 px wheel blanked a quarter on the Mac, and a 100 px notch must never jump (R149 L1; ${jump})`);
	const inner = code.slice(code.indexOf('function o55fsInnerTakes('), code.indexOf("window.addEventListener('wheel', e => {"));
	assert.match(inner, /overflowY/, 'an inner scroller is recognised by its overflow');
	assert.match(inner, /n !== sc/, 'the walk stops at the document');
	console.log(`PASS FO-250 long-wheel jump: one non-passive window listener, every guard before the cancel, an instant main-thread scroll at ${jump} of the view, outside the r6 gate`);
}
/* R149 M1 and L1: the long-wheel jump and its inner-scroller walk run here as written, against stand-in elements. A notch
   never jumps, a long wheel over rows jumps once and instantly, a scroller inside the document that can still move or
   that contains its overscroll (the rosters, at their end too) keeps the wheel, an uncancelable wheel is left alone. */
{
	const fs = await import('node:fs');
	const prod = fs.readFileSync(new URL('../../../onboarding/opus-5.5/src/settings/kit.d/46-first-screen.js', import.meta.url), 'utf8');
	const code = prod.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
	const cut = (from, to) => { const a = code.indexOf(from); assert.ok(a >= 0, `found: ${from}`); const b = code.indexOf(to, a); assert.ok(b > a, `found the end of: ${from}`); return code.slice(a, b + to.length); };
	const src = [cut('const O55FS_JUMP', ';'), cut('function o55fsInnerTakes(', '\n}\n'), cut("window.addEventListener('wheel', e => {", '}, { passive: false });')].join('\n');
	class Node { constructor(o) { Object.assign(this, { parentElement: null, scrollTop: 0, scrollHeight: 50, clientHeight: 50, style: {} }, o); } }
	class Element extends Node {}
	const make = () => {
		const sc = new Element({ id: 'settings-document', scrollHeight: 20000, clientHeight: 900, scrollTop: 1000, jumps: [] });
		sc.contains = (n) => { for (let x = n; x; x = x.parentElement) if (x === sc) return true; return false; };
		sc.scrollTo = (o) => { sc.jumps.push(o); sc.scrollTop = o.top; };
		const root = { querySelector: (sel) => sel === '#settings-document' ? sc : null };
		let listener = null;
		const win = { addEventListener: (type, fn) => { if (type === 'wheel') listener = fn; } };
		new Function('root', 'window', 'getComputedStyle', 'Node', 'Element', src)(root, win, (n) => n.style, Node, Element);
		assert.equal(typeof listener, 'function', 'the listener was registered');
		const wheel = (target, deltaY, o = {}) => { const e = { target, deltaY, deltaX: 0, deltaMode: 0, cancelable: true, defaultPrevented: false, ctrlKey: false, shiftKey: false, ...o, preventDefault() { e.defaultPrevented = true; } }; listener(e); return e; };
		return { sc, wheel };
	};
	{ const { sc, wheel } = make(); const row = new Element({ parentElement: sc });
		const e = wheel(row, 100); assert.equal(e.defaultPrevented, false, 'a 100 px notch is left to the browser'); assert.equal(sc.jumps.length, 0);
		const big = wheel(row, 600); assert.equal(big.defaultPrevented, true, 'a 600 px wheel over rows (2/3 of the view) is taken');
		assert.deepEqual(sc.jumps, [{ top: 1600, behavior: 'instant' }], 'one instant main-thread jump by the delta');
		assert.equal(wheel(row, -5000).defaultPrevented, true, 'a long wheel up is taken too'); assert.equal(sc.scrollTop, 0, 'clamped at the top');
		assert.equal(wheel(row, -900).defaultPrevented, false, 'at the top a wheel up is left to the page');
		assert.equal(wheel(row, 900, { cancelable: false }).defaultPrevented, false, 'an uncancelable wheel is left alone'); }
	const inner = (style, top) => { const { sc, wheel } = make(); const box = new Element({ parentElement: sc, scrollHeight: 1200, clientHeight: 700, scrollTop: top, style: { overflowY: 'auto', ...style } }); const item = new Element({ parentElement: box }); return { sc, e: wheel(item, 900) }; };
	{ const r = inner({ overscrollBehaviorY: 'contain' }, 500); assert.equal(r.e.defaultPrevented, false, 'a roster at its end with overscroll containment keeps the wheel (R149 M1)'); assert.equal(r.sc.jumps.length, 0, 'the document stays still'); }
	{ const r = inner({ overscrollBehaviorY: 'none' }, 500); assert.equal(r.e.defaultPrevented, false, 'overscroll-behavior none keeps it too'); }
	{ const r = inner({ overscrollBehaviorY: 'auto' }, 0); assert.equal(r.e.defaultPrevented, false, 'an inner scroller that can still move takes the wheel'); }
	{ const r = inner({ overscrollBehaviorY: 'auto' }, 500); assert.equal(r.e.defaultPrevented, true, 'an uncontained inner scroller at its end hands the wheel on: the document jumps'); }
	{ const r = inner({ overflowY: 'visible', overscrollBehaviorY: 'contain' }, 0); assert.equal(r.e.defaultPrevented, true, 'a box that does not scroll is not a scroller'); }
	// INTEG4 fix 1 (A152 M1): containment before range. A roster filtered to one row or none has no range left; main keeps
	// the document still over it, so the contained box keeps the wheel; an uncontained box with no range is not a scroller
	{ const flat = (style) => { const { sc, wheel } = make(); const box = new Element({ parentElement: sc, scrollHeight: 92, clientHeight: 92, scrollTop: 0, style: { overflowY: 'auto', ...style } }); return { sc, e: wheel(new Element({ parentElement: box }), 900) }; };
		const kept = flat({ overscrollBehaviorY: 'contain' }); assert.equal(kept.e.defaultPrevented, false, 'a contained roster with no range (filtered to one row) keeps the wheel (A152 M1)'); assert.equal(kept.sc.jumps.length, 0, 'the document stays still');
		const empty = flat({ overscrollBehaviorY: 'contain' }); assert.equal(empty.e.defaultPrevented, false, 'and filtered to none');
		const open = flat({ overscrollBehaviorY: 'auto' }); assert.equal(open.e.defaultPrevented, true, 'an uncontained box with no range hands the wheel on: the document jumps'); }
	console.log('PASS FO-250 long-wheel jump run on stand-ins: notches left alone, one instant jump over rows, contained or movable inner scrollers keep the wheel');
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
	const keysFor = (platform) => Array.from({ length: 2 * END_REPS }, (_, i) => endLandKey(platform, i));
	assert.deepEqual(keysFor('MacIntel'), Array(16).fill('End'), 'a Mac browser receives only plain End, even from a Linux driver');
	for (const platform of ['Linux x86_64', 'Win32'])
		assert.deepEqual(keysFor(platform), Array.from({ length: 4 }, () => ['End', 'End', 'Control+End', 'Control+End']).flat(),
			`${platform} keeps the old key and focus alternation`);
	const src = String(endLandRoute);
	for (const [re, msg] of [[/guardPage\(t, surface, 'general', 'code'\)/, 'a fresh Code & Tools'],
		[/\.domain-link\[data-domain="general"\]'\)\.first\(\)\.click\(\);[^\n]*\n\t*await f\.locator\('#pm-settings-root \.domain-link\[data-domain="code"\]'\)\.first\(\)\.click\(\);/, 'each press enters Code & Tools fresh from General'],
		[/const from = i % 2 \? 'text' : 'button', keyName = endLandKey\(platform, i\);/, 'both starts and browser-platform key selection'],
		[/const platform = await f\.evaluate\(\(\) => navigator\.platform\);/, 'the platform comes from browser JavaScript'],
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

/* INTEG4 fix 1 (A152 M1-M4): the four rows from A152's real input sequences, red on 90286cf58f (page a61bcce0). Their
   verdicts are judged on readings shaped as the live routes record them; the routes are live tests on both surfaces. */
{
	// M1: filtered roster
	const fr = (o) => ({ filter: 'Claude', wantRows: 1, before: 400, after: 400, view: 912, room: 9000, range: 0, css: 'contain', rows: 1, wheel: { trusted: true, inside: true, cancelable: true, dy: 912 }, ...o });
	assert.deepEqual(filteredRosterVerdict(fr({})).map((x) => x.ok), [true, true], 'a still document under a one-row contained roster passes');
	assert.deepEqual(filteredRosterVerdict(fr({ after: 1312 })).map((x) => x.ok), [true, false], 'A152 M1: the document moved 912 px under the filtered roster fails');
	assert.equal(filteredRosterVerdict(fr({ wantRows: 0, rows: 0 }))[0].ok, true, 'the empty filter is judged the same way');
	for (const [o, why] of [[{ range: 200 }, 'a roster with range left is not this case'], [{ css: 'auto' }, 'an uncontained list is not this case'], [{ rows: 2 }, 'the filter must leave the wanted rows'], [{ room: 100 }, 'the document needs a view of room'], [{ wheel: { trusted: true, inside: false, dy: 912 } }, 'the wheel must go over the roster'], [{ wheel: null }, 'no wheel seen']])
		assert.equal(filteredRosterVerdict(fr(o))[1].ok, false, `not judgeable: ${why}`);
	// M2: focused roster, pending wheel, End
	const fe = (o) => ({ delay: 0, parent: 0, room: 9000, child: 0, range: 487, cold: 7, wheel: { at: 100, inDoc: true, inList: false }, key: { at: 120, focusInList: true }, docEnd: 120, listEnd: 487, ...o });
	assert.deepEqual(focusedEndVerdict(A152_FOCUSED.delays.map((delay) => fe({ delay }))).map((x) => x.ok), [true, true], 'the document moves the notch and the roster takes End: pass');
	assert.equal(focusedEndVerdict([fe({}), fe({ docEnd: 5235, listEnd: 487 })])[1].ok, false, 'A152 M2: the document landed 5,235 px down fails');
	assert.equal(focusedEndVerdict([fe({ listEnd: 0 })])[1].ok, false, 'End that never reached the roster fails');
	assert.equal(focusedEndVerdict([fe({ key: { at: 120, focusInList: false } })])[0].ok, false, 'focus must be in the roster at the key');
	assert.equal(focusedEndVerdict([fe({ wheel: { at: 100, inDoc: true, inList: true } })])[0].ok, false, 'the wheel must be over the document outside the roster');
	assert.equal(focusedEndVerdict([fe({ cold: 0 })])[0].ok, false, 'unmounted pages are needed at the key');
	assert.deepEqual(focusedEndVerdict([]).map((x) => x.ok), [false, false], 'no trial cannot pass');
	assert.ok(A152_FOCUSED.delays.length >= 6 && A152_FOCUSED.delays.filter((d) => d === 0).length >= 3, 'six trials, the immediate ones repeated (A152: End 15-29 ms after the wheel event)');
	// M3: wheel up as End reaches the bottom
	const rv = (o) => ({ kind: 'large', delay: 0, dist: 730, arrived: true, view: 912, key: { focus: 'BODY', cold: 7, top: 0 }, wheel: { top: 19178, room: 1, dy: -730, doc: true, focus: 'BODY' }, finalTop: 18448, finalRoom: 731, ...o });
	assert.deepEqual(reverseVerdict([rv({}), rv({ kind: 'notch', dist: 120, wheel: { top: 19178, room: 1, dy: -120, doc: true }, finalTop: 19058, finalRoom: 121 })]).map((x) => x.ok), [true, true], 'a large wheel and a notch that hold pass');
	assert.equal(reverseVerdict([rv({ finalTop: 19179, finalRoom: 0 })])[1].ok, false, 'A152 M3: snapped back to the bottom fails');
	assert.equal(reverseVerdict([rv({ kind: 'notch', dist: 120, wheel: { top: 19178, room: 1, dy: -120, doc: true }, finalTop: 19179, finalRoom: 0 })])[1].ok, false, 'a notch that snapped back fails');
	assert.equal(reverseVerdict([rv({ arrived: false })])[0].ok, false, 'End must have reached the bottom before the wheel');
	assert.equal(reverseVerdict([rv({ wheel: { top: 2000, room: 17000, dy: -730, doc: true } })])[0].ok, false, 'the wheel must come at the bottom');
	assert.equal(reverseVerdict([rv({ key: { focus: 'BUTTON', cold: 7 } })])[0].ok, false, 'End from body focus (the text click)');
	assert.equal(reverseVerdict([rv({ key: { focus: 'BODY', cold: 0 } })])[0].ok, false, 'over unmounted pages');
	assert.ok(A152_REVERSE.trials.some(([k]) => k === 'notch') && A152_REVERSE.trials.some(([k]) => k === 'large') && A152_REVERSE.notch === 120, 'both a 120 px notch and a view-scale wheel');
	// M4: chapter lifetime
	const lt = (o) => ({ gc: true, visits: A152_LIFETIME.visits, current: 1, detached: 0, oldRoots: 0, oldElements: 0, ...o });
	assert.deepEqual(lifetimeVerdict(lt({})).map((x) => x.ok), [true, true], 'no retained old chapter roots passes');
	assert.equal(lifetimeVerdict(lt({ oldRoots: 23, detached: 23, oldElements: 46000 }))[1].ok, false, 'A152 M4: 23 retained roots in 24 visits fails');
	assert.equal(lifetimeVerdict(lt({ oldRoots: A152_LIFETIME.maxRoots + 1 }))[1].ok, false, 'one over the bound fails');
	assert.equal(lifetimeVerdict(lt({ gc: false }))[0].ok, false, 'no forced collection is not judgeable');
	assert.equal(lifetimeVerdict(lt({ visits: 3 }))[0].ok, false, 'every visit is needed');
	assert.ok(A152_LIFETIME.maxRoots <= 2 && A152_LIFETIME.visits >= 24, 'a small bound over at least 24 visits');
	// live on both surfaces, each through its route
	for (const surface of ['normal', 'sandbox'])
		for (const [name, route] of [[`R93 #4 a long wheel over a roster filtered to one row or none leaves the document still (${surface})`, 'filteredRosterRoute'], [`R93 #4 End on a focused roster row during a document wheel scrolls the roster, not the document (${surface})`, 'focusedEndRoute'], [`R93 #4 a wheel up as End reaches the bottom holds (${surface})`, 'reverseAfterEndRoute'], [`R93 #4 chapter switches release the replaced chapter documents (${surface})`, 'chapterLifetimeRoute']]) {
			assert.equal(typeof tests[name], 'function', `A152: ${route} is a live test on the ${surface} surface`);
			assert.ok(live(String(tests[name]), new RegExp(`${route}\\(t, surface\\)`)), `the ${surface} test runs ${route}`);
		}
	// the routes record what their verdicts read
	assert.ok(live(String(filteredRosterRoute), /for \(const row of filteredRosterVerdict\(r\)\) await t\.check\(/), 'the filtered roster route judges with its verdict');
	assert.ok(live(String(filteredRosterRoute), /for \(const want of \[1, 0\]\)/), 'one row, then none');
	assert.ok(live(String(focusedEndRoute), /await t\.page\.mouse\.wheel\(0, A152_FOCUSED\.notch\);\n\t*if \(delay\) await t\.page\.waitForTimeout\(delay\);\n\t*await t\.page\.keyboard\.press\('End'\);/), 'the focused route: a trusted wheel, then End after its delay');
	assert.ok(live(String(focusedEndRoute), /for \(const row of focusedEndVerdict\(runs\)\) await t\.check\(/), 'the focused route judges with its verdict');
	assert.ok(live(String(reverseAfterEndRoute), /await t\.page\.keyboard\.press\('End'\);\n\t*const arrived = await f\.waitForFunction\(/), 'the reverse route waits for the bottom after End');
	assert.ok(live(String(reverseAfterEndRoute), /await t\.page\.mouse\.wheel\(0, -dist\);/), 'then a trusted wheel up');
	assert.ok(live(String(reverseAfterEndRoute), /for \(const row of reverseVerdict\(runs\)\) await t\.check\(/), 'the reverse route judges with its verdict');
	assert.ok(live(String(chapterLifetimeRoute), /HeapProfiler\.collectGarbage/) && live(String(chapterLifetimeRoute), /new WeakRef\(b\)/), 'the lifetime route holds each body weakly and collects before counting');
	assert.ok(live(String(chapterLifetimeRoute), /for \(const row of lifetimeVerdict\(r\)\) await t\.check\(/), 'the lifetime route judges with its verdict');
	console.log('PASS A152 rows: a filtered roster keeps the wheel, a focused roster keeps End during a document wheel, a wheel up as End lands holds, replaced chapters are released; live on both surfaces');
}
