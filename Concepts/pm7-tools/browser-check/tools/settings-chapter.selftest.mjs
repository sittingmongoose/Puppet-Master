// checks/perf-settings-chapter's verdicts on constructed rows: no browser (TIB-P7, 2026-11-20).
// node tools/settings-chapter.selftest.mjs
// The page probe itself is tested in a browser on a constructed page: diagnostics/settings-chapter-probe.check.mjs.
import assert from 'node:assert/strict';
import { firstScreenVerdict, restoreJudgeable, flingVerdict, hoverVerdict, arrivalVerdict, FILL_WAIT, press, selectAllModifier } from '../checks/perf-settings-chapter.check.mjs';

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
	const ok = (r) => flingVerdict(r).map((x) => x.ok);
	assert.deepEqual(ok(fling({})), [true, true, true], 'pending at the wheel, a viewport crossed onto Terminal look, nothing empty: passes');
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
