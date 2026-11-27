// checks/perf-settings-chapter's verdicts on constructed rows: no browser (TIB-P7, 2026-11-20).
// node tools/settings-chapter.selftest.mjs
// The page probe itself is tested in a browser on a constructed page: diagnostics/settings-chapter-probe.check.mjs.
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { firstScreenVerdict, restoreJudgeable, flingVerdict, hoverVerdict, arrivalVerdict, FILL_WAIT, press, selectAllModifier, flingScrollGate, filmFling, flingFilm, FLING_FILM, FLING_RETRY, flingAttempt, retryFling, flingRetryVerdict, tests } from '../checks/perf-settings-chapter.check.mjs';
import { encodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

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
	const run = async (waitForHoverTags, censusFinishes, controlExists = true) => {
		const events = [];
		let tagged = 0;
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
						if (!censusFinishes) throw Object.assign(new Error('no tag appeared'), { name: 'TimeoutError' });
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
	assert.deepEqual(await run(true, true), { events: ['hover control', 'wait for tags', 'sample', 'press'], tagged: 1 },
		'a real hover of the leaving chapter\'s control precedes the bounded tag wait, the sample and the press');
	assert.deepEqual(await run(true, false), { events: ['hover control', 'wait for tags', 'sample', 'press'], tagged: 0 },
		'a timed-out census still yields an unsampled switch for the existing missing-witness verdict');
	assert.deepEqual(await run(true, false, false), { events: ['wait for tags', 'sample', 'press'], tagged: 0 },
		'no hoverable control: the bounded wait and the missing-witness result stay');
	assert.deepEqual(await run(false, true), { events: ['sample', 'press'], tagged: 0 },
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
	const live = (src, re) => {
		for (const m of src.matchAll(new RegExp(re.source, re.flags.replace('g', '') + 'g'))) {
			const before = src.slice(0, m.index), line = before.slice(before.lastIndexOf('\n') + 1);
			if (before.lastIndexOf('/*') > before.lastIndexOf('*/') || line.includes('//')) continue;
			return true;
		}
		return false;
	};
	const fling = (o) => ({ committed: true, pending: 33, targetPending: true, wheel: 1200, wheelPending: 30, wheelTargetPending: true, sampled: true, start: 0, top: 2900, moved: 2900, height: 880, targetInView: true, empty: [], ...o });
	const view = { width: 1920, height: 1080 }, box = { x: 627, y: 143, width: 685, height: 912 }, W = FLING_FILM.width, H = FLING_FILM.height;
	// a frame: the list's ground with text-like rules every 12 px from `phase`, leaving `holes` bands (0-3) empty
	const frame = (phase, { holes = [], blank = false, faint = [] } = {}) => {
		const data = Buffer.alloc(W * H * 4);
		for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
			const i = (y * W + x) * 4, inDoc = x >= 313 && x < 656 && y >= 71 && y < 527;
			const band = Math.floor((y - 83) / Math.floor((515 - 83) / 4));
			const ink = inDoc && !blank && !holes.includes(band) && (y + phase) % 12 < 2 && (x + phase) % 9 < 6 && (!faint.includes(band) || (x + phase) % 180 < 6);
			const g = ink ? 200 : inDoc ? 45 : 20;
			data[i] = data[i + 1] = data[i + 2] = g; data[i + 3] = 255;
		}
		return encodePng({ width: W, height: H, data });
	};
	const SRC = frame(0), DST = frame(5), BLANK = frame(0, { blank: true }), HOLE = frame(5, { holes: [2] });
	const wheel = 1_000_000;
	// frames every 16.7 ms: [ms from the wheel, png]
	const film = (seq) => seq.map(([dt, png]) => ({ wall: wheel + dt, png }));
	const run = (seq) => flingFilm(film(seq), { box, view, wheel });
	const v = (seq, r = fling({})) => flingVerdict(r, run(seq))[3];
	const at = (from, n, png) => Array.from({ length: n }, (_, k) => [from + k * 16.7, png]);
	const good = [...at(-83.5, 5, SRC), ...at(16.7, 20, DST)];
	assert.equal(v(good).ok, true, `the destination on its first displayed frame passes: ${v(good).detail}`);
	assert.equal(run(good).dest.dt, 16.7, 'the first destination frame is the first frame after the wheel that shows the new view');
	const blank = [...at(-83.5, 5, SRC), ...at(16.7, 3, BLANK), ...at(66.8, 20, DST)];
	const b = v(blank);
	assert.equal(b.ok, false, 'Astra\'s case: blank frames between the source and the destination rows fail');
	assert.match(b.detail, /first destination frame 5 at 16\.7 ms \[0, 0, 0, 0\] BLANK; 3 blank or unfilled frame\(s\)/);
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
	// a film that stopped before the fling settled: its last frame is the source, so nothing is judged as settled
	const unsettled = [...at(-83.5, 5, SRC), ...at(16.7, 2, SRC)];
	assert.equal(run(unsettled).moved, 0, 'the settled frame is the source view');
	assert.equal(v(unsettled).ok, false, 'a film stopped before settle cannot pass');
	// a band at a twentieth of its settled ink is unfilled (the keep share is a tenth, not a hundredth)
	const FAINT = frame(5, { faint: [1] }), faint = [...at(-83.5, 5, SRC), ...at(16.7, 2, FAINT), ...at(50.1, 20, DST)];
	assert.ok(run(faint).bad.length === 2 && run(faint).bad[0].bands[1] > 0, `a faint band is read as faint, not empty: ${JSON.stringify(run(faint).bad[0])}`);
	assert.equal(v(faint).ok, false, 'a band far under a tenth of its settled ink fails');
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
		assert.match(d.rows[3].detail, /5 attempt\(s\), at most 5/);
	}
	for (const [seqs, driven, why] of [[[blank, good, good], [1], 'a resolved bad first attempt'], [[lost, blank, good], [1, 2], 'a resolved bad second attempt'], [[lostBlank, good, good], [1], 'an unresolved attempt with bad frames'], [[lost, lostBlank, good], [1, 2], 'a later unresolved attempt with bad frames'], [[late, good, good], [1], 'a later blank after a good first destination']]) {
		const d = await drive(seqs);
		assert.deepEqual(d.driven, driven, `${why} decides at once, no retry`);
		assert.equal(d.rows[3].ok, false, `${why} fails`);
	}
	// the route rows cannot be shopped for: an attempt failing one stops the retry and fails, and every attempt is held to them
	{
		const d = await drive([lost, good, good], (k) => fling(k === 1 ? { targetInView: false } : {}));
		assert.deepEqual(d.driven, [1], 'an attempt that fails a route row is not retried');
		assert.equal(d.rows[1].ok, false, 'the travel and target row fails');
		const shop = flingRetryVerdict([{ k: 1, ...flingAttempt(fling({ wheelTargetPending: false }), run(lost)) }, { k: 2, ...flingAttempt(fling({}), run(good)) }]);
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
	for (const surface of ['normal', 'sandbox']) {
		const src = String(tests[`R93 #4 a fast wheel into lower Code fills visible lists before the frame (${surface})`]);
		// FO-245 r2 (R141 finding 2): a pin holds only on live code, never on a commented-out copy of it
		assert.equal(live('a();\n//b();\n/* c();\n*/ d();', /b\(\);/), false, 'live(): a line comment is not live code');
		assert.equal(live('a();\n/* c();\n*/ d();', /c\(\);/), false, 'live(): a block comment is not live code');
		assert.equal(live('a();\n/* c();\n*/ d();', /d\(\);/), true, 'live(): code after a block comment is live');
		const pin = (re, msg) => assert.ok(live(src, re), msg);
		pin(/film=await filmFling\(client\)/, 'the live test films the fling');
		pin(/const px=flingFilm\(frames,\{box,view,wheel:r\.wheelEpoch\}\);/, 'the live test reads the frames with the shared judge');
		pin(/R\.wheelEpoch=performance\.timeOrigin\+R\.wheel;/, 'the wheel time is on the frames\' clock, unshifted');
		pin(/document\.documentElement\.appendChild\(d\);d\.animate\(\[\{opacity:\.5\},\{opacity:1\}\],\{duration:1000,iterations:Infinity,direction:'alternate'\}\);/, 'the capture-fidelity marker runs by Web Animations');
		pin(/if\(performance\.now\(\)-t0>=1000\)return res\(true\);requestAnimationFrame\(step\);\};requestAnimationFrame\(step\);\}\),null,\{timeout:15000\}\)/, 'the film runs until the scroller has held still for a second (settle wait, 15 s cap)');
		pin(/frames=await film\.stop\(\);/, 'the film is stopped after the settle wait');
		assert.ok(src.indexOf('if(performance.now()-t0>=1000)return res(true)') < src.indexOf('frames=await film.stop();'), 'the film stops after the settle wait, not before');
		// the bounded retry: the live test drives the whole route per attempt and judges through the shared retry and verdict
		pin(/const attempts=await retryFling\(attempt\);/, 'the live test retries through the shared retryFling');
		pin(/for \(const row of flingRetryVerdict\(attempts\)\) await t\.check\(/, 'the live verdict is the shared retry verdict');
		assert.equal(/function\s+(retryFling|flingRetryVerdict|flingAttempt|flingVerdict)\b|\b(retryFling|flingRetryVerdict|flingAttempt|flingVerdict)\s*=/.test(src), false, 'the live test has no retry or judge of its own');
		assert.equal(/flingVerdict\(/.test(src.replace(/flingRetryVerdict\(/g, '')), false, 'the live test does not judge one attempt by itself');
		const a0 = src.indexOf('const attempt=async(k)=>{'), a1 = src.indexOf('const attempts=await retryFling(attempt);');
		assert.ok(a0 >= 0 && a1 > a0, 'the attempt is defined before the retry');
		const body = src.slice(a0, a1);
		for (const [re, msg] of [[/\.domain-link\[data-domain="general"\]'\)\.first\(\)\.click\(\)/, 'General'], [/window\.__pscFling=\{committed:false/, 'a fresh page recorder'], [/film=await filmFling\(client\)/, 'a fresh film'], [/\.domain-link\[data-domain="code"\]'\)\.first\(\)\.click\(\)/, 'Code'], [/await t\.page\.mouse\.wheel\(0,Math\.ceil\(delta\)\);/, 'the wheel'], [/return \{r,px\};/, 'its reading']])
			assert.ok(live(body, re), `each attempt drives the whole route: ${msg}`);
		assert.match(src, /if\(sc\.id!=='settings-document'\|\|!R\.committed\|\|!R\.wheel\|\|R\.sampled\|\|R\.armed\|\|Math\.abs\(sc\.scrollTop-R\.start\)<R\.height\)return;/, 'the live scroll gate arms only after the delivered wheel (flingScrollGate)');
		assert.match(src, /R\.moved=R\.wheelTop==null\?null:R\.top-R\.wheelTop/, 'the live travel is measured from the wheel delivery position (flingScrollGate)');
	}
	console.log('PASS fling frames: blank and unfilled frames on screen fail through the live recorder and judge, a lost arrival frame is not judged, and the live test uses both and the shared retry');
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
