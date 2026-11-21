// checks/perf-settings-chapter's verdicts on constructed rows: no browser (TIB-P7, 2026-11-20).
// node tools/settings-chapter.selftest.mjs
// The page probe itself is tested in a browser on a constructed page: diagnostics/settings-chapter-probe.check.mjs.
import assert from 'node:assert/strict';
import { firstScreenVerdict, restoreJudgeable, flingVerdict } from '../checks/perf-settings-chapter.check.mjs';

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
