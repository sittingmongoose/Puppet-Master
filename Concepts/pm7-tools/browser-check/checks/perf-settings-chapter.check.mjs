// A Settings chapter switch builds and shows the new chapter without work that can wait (FO-196, the cost part; lane U,
// 2026-11-14). On main 9bfa159274 the old chapter stayed on screen 90-830 ms after the release (median 143 ms on an
// RTX 3080) while one task built the new chapter and the next frame styled and laid it out. Two parts of that are
// work the first frame does not need, and each is judged here by what runs when, not by a time (times differ by host):
//   unlock   a chapter is drawn new on every visit, so content-visibility's remembered sizes never helped: every far
//            section was a 460 px placeholder, Code & Tools' Terminal look (49 rows, 3,494 px) landed inside Chrome's
//            margin of the screen and was styled and laid out in the first frame, then skipped again in the next. Judged:
//            no section of an arrival turns relevant and is skipped again within a second ("one-frame unlocks").
//   release  the hover tags of the removed chapter (about 2,000 nodes) were walked in the build task's microtasks.
//            Judged: the controller's cleanupRemoved does not run before that frame, and the old chapter's tagged nodes
//            have let go of their tags by that collection (after the initial 2.5 s settle and the wait for the fill's own
//            completion, R97 #6).
// "First painted frame": a message posted from the first animation frame that has the new chapter arrives once that
// frame's style, layout, paint and commit are over on the main thread. Each switch is a real held press on the chapter
// list (down, 90 ms, up); Settings acts on the click. Logged per switch, not judged: release -> painted, the build task
// ("finish" in the long animation frames), elements built.
//
// Navigation saves immediately, as on main (C3 retired by the owner, 2026-11-18). Save counts are logged, and the
// Project-switch/restore-all guards retain the correctness checks.
// Looks: Basic Dark, Friendly Light, Retro Dark, Glass Dark, NieR Light by default (`--set looks=`, `all` for ten), each
// set through Settings' Theme rows and guarded as painted (helpers/settings-look.mjs). Switches: General, AI & Providers
// and Code & Tools, both ways (`--set seq=a:b,...`). Both surfaces (`--set sandbox=0` and `1`). `--set motion=reduce`
// runs under Reduced Motion. `--set appReduce=1` exercises the app preference; combine with `motion=reduce` to cover both sources in More options.
// `--set settle=<ms>` waits after each look change (default 4000).
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const ALL = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];
const LOOKS = ['basic-dark', 'friendly-light', 'retro-dark', 'glass-dark', 'nier-light'];
const SEQ = 'general:code,code:ai,ai:general,general:ai,ai:code,code:general';

/* the page-side probe, installed once per page */
const PROBE = () => {
	if (window.__psc) return true;
	const root = document.getElementById('pm-settings-root');
	const sig = () => { const b = root.querySelector('#workspace-stage [data-workspace-block]'); return b ? b.getAttribute('data-workspace-block') : ''; };
	const rows = () => root.querySelectorAll('#workspace-stage .setting-row').length;
	const P = window.__psc = { on: false, sig, cv: [], saves: [], cleanups: [], loaf: [], frame: 0 };
	/* SETCHAPTER-ROWCOUNT-FIRST-RAF: the first frame's row count is read after every callback that can still change that
	   frame, not in this probe's own animation-frame callback, where a page callback queued after it in the same frame
	   (the chapter is committed in the click task, so anything it asks a frame for runs after this tick) would add rows
	   that are painted but not counted. A ResizeObserver callback runs after every animation-frame callback of the frame
	   and after its layout, just before paint, and observers report in the order they were made: so the probe makes a
	   fresh observer in the first frame's tick (later than any the page made in the commit) on a 1 px mark of its own,
	   whose first observation reports in that same frame, reads the count there and again in a microtask after it. The
	   tick's own read is logged only; a frame whose end read is missing is not judged as a first screen. */
	const mark = document.createElement('div');
	mark.setAttribute('aria-hidden', 'true');
	mark.style.cssText = 'position:fixed;left:-4px;top:0;width:1px;height:1px;visibility:hidden;pointer-events:none;contain:strict';
	document.documentElement.appendChild(mark);
	const tick = () => {
		P.frame++;
		if (P.on && !P.first && sig() !== P.old) {
			P.first = performance.now();
			P.rowsRaf = rows();
			const frame = P.frame, ro = new ResizeObserver(() => {
				ro.disconnect();
				if (!P.on || P.frame !== frame) return;
				P.rows1 = rows(); P.rows1At = 'frame end';
				queueMicrotask(() => { if (P.frame === frame) P.rows1 = rows(); });
			});
			ro.observe(mark);
			const mc = new MessageChannel(); mc.port1.onmessage = () => { P.painted = performance.now(); }; mc.port2.postMessage(0);
		}
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
	window.addEventListener('click', (e) => { if (P.on && !P.click) P.click = e.timeStamp; }, true);
	new MutationObserver(() => { if (P.on && !P.commit && sig() !== P.old) P.commit = performance.now(); }).observe(root, { childList: true, subtree: true });
	document.addEventListener('contentvisibilityautostatechange', (e) => {
		if (!P.on) return;
		const s = e.target; P.cv.push({ t: performance.now(), id: s.getAttribute('data-section-id') || String(s.className).split(' ')[0], skipped: e.skipped });
	}, true);
	const tome = window.PM7_SETTINGS_TOME;
	if (tome && typeof tome.save === 'function') {
		const save = tome.save;
		tome.save = function (snap) { if (P.on) P.saves.push({ t: performance.now(), domain: snap && snap.domain }); return save.apply(this, arguments); };
	}
	const hover = window.PM_HOVER_TAG_CONTROLLER;
	if (hover && typeof hover.cleanupRemoved === 'function') {
		const cleanup = hover.cleanupRemoved;
		/* only a walk of the leaving chapter counts (a part removed at the press, a popout or a tag of the pressed link, may
		   be walked in idle time during the hold). R97 #4: a walk is the leaving chapter's when the chapter has changed and
		   its root was a node of the old stage (ARM keeps them all) or holds the old block, not only when it holds one of
		   the six sampled tagged nodes: a walk of another part of the old chapter counts too. */
		hover.cleanupRemoved = function (r) {
			if (P.on && r && r.nodeType === 1 && P.leaving && sig() !== P.old
				&& (P.leaving.has(r) || (P.oldBlock && r.contains(P.oldBlock)) || (P.tagged || []).some((n) => r.contains(n)))) P.cleanups.push(performance.now());
			return cleanup.apply(this, arguments);
		};
	}
	try { new PerformanceObserver((l) => { if (P.on) for (const e of l.getEntries()) for (const s of e.scripts || []) if (s.sourceFunctionName === 'finish') P.loaf.push(s.duration); }).observe({ type: 'long-animation-frame' }); } catch (e) { /* none */ }
	return true;
};
/* before a press: forget the last switch, remember a few tagged nodes of the chapter that is about to leave */
const ARM = () => {
	const P = window.__psc;
	Object.assign(P, { on: true, cv: [], saves: [], cleanups: [], loaf: [], click: 0, commit: 0, first: 0, painted: 0, rows1: 0, rowsRaf: 0, rows1At: '', old: P.sig() });
	const stage = document.querySelector('#workspace-stage');
	P.leaving = new WeakSet(stage ? [...stage.querySelectorAll('*')] : []);
	P.oldBlock = stage ? stage.querySelector('[data-workspace-block]') : null;
	const bound = stage ? [...stage.querySelectorAll('[data-pm-hover-bound="true"]')] : [];
	P.tagged = bound.slice(0, 6); P.taggedAll = bound.length;
	return { old: P.old, tagged: P.tagged.length };
};
const COLLECT = () => {
	const P = window.__psc; P.on = false;
	const rel = (x) => (x && P.click ? Math.round(x - P.click) : null);
	/* a section that turned relevant and was skipped again within a second */
	const unlocks = [];
	for (const a of P.cv) {
		if (a.skipped) continue;
		const back = P.cv.find((b) => b.id === a.id && b.skipped && b.t > a.t && b.t - a.t < 1000);
		if (back && !unlocks.includes(a.id)) unlocks.push(a.id);
	}
	const stage = document.querySelector('#workspace-stage');
	const domain = (document.querySelector('#pm-settings-root .domain-link.active') || {}).dataset?.domain || '';
	return {
		to: domain, clickToPainted: rel(P.painted), commit: rel(P.commit), build: P.loaf.length ? Math.round(P.loaf[0]) : null,
		elements: stage ? stage.getElementsByTagName('*').length : 0, unlocks,
		savesBeforePaint: P.saves.filter((s) => P.painted && s.t < P.painted).length,
		savedPlace: P.saves.filter((s) => s.domain === domain).length,
		cleanupsBeforePaint: P.cleanups.filter((c) => P.painted && c < P.painted).length, walks: P.cleanups.length,
		/* null when the first frame's end read did not happen (SETCHAPTER-ROWCOUNT-FIRST-RAF): not judged as a first screen */
		rowsFirst: P.rows1At === 'frame end' ? P.rows1 : null, rowsRaf: P.rowsRaf || 0, rowsEnd: stage ? stage.querySelectorAll('.setting-row').length : 0,
		pendingLeft: document.querySelectorAll('#workspace-stage [data-o55-fill="pending"]').length,
		/* The rendered workspace model includes both placement and hand-authored rows (R97 check 2). */
		missing: (() => {
			const body = document.querySelector('#workspace-stage [data-continuous-workspace-body][data-workspace-mounted="true"]');
			const ws = body && body.dataset.continuousWorkspaceBody;
			const model = (window.PM12_DATA?.domains || []).flatMap(d => d.workspaces || []).find(w => w.id === ws);
			/* Managers compose their own bound controls; only plain workspaces render these setting-row IDs. */
			const sections = model?.type === 'settings' && !model.virtualAllSettings ? model.sections || [] : [];
			const want = [...new Set(sections.flatMap(s => Array.isArray(s.settings) ? s.settings.map(st => st.id) : []))];
			return { ws, want: want.length, gone: want.filter((id) => !body.querySelector(`[id="setting-${CSS.escape(id)}"]`)).slice(0, 6) };
		})(),
		dupIds: (() => { const ids = [...document.querySelectorAll('#workspace-stage [id^="setting-"]')].map((n) => n.id); return ids.length - new Set(ids).size; })(),
		taggedStill: (P.tagged || []).filter((n) => !n.isConnected && n.getAttribute('data-pm-hover-bound') === 'true').length,
		tagged: (P.tagged || []).length, taggedAll: P.taggedAll || 0
	};
};
/* C1's first-screen row over the Code & Tools arrivals (exported for tools/settings-chapter.selftest.mjs). A row whose
   first-frame count was not read at that frame's end cannot show a first screen (SETCHAPTER-ROWCOUNT-FIRST-RAF). */
export function firstScreenVerdict(code) {
	const unread = code.filter((r) => typeof r.rowsFirst !== 'number');
	const whole = code.filter((r) => typeof r.rowsFirst === 'number' && r.rowsEnd > 0 && r.rowsFirst >= r.rowsEnd);
	const detail = [
		...unread.map((r) => `${r.pair}: the first frame's row count was not read at that frame's end (${r.rowsRaf ?? '?'} at its first animation-frame callback)`),
		...whole.map((r) => `${r.pair}: all ${r.rowsEnd} rows were built for the first frame`)
	].join('; ');
	return { ok: code.length > 0 && !unread.length && !whole.length, detail: detail || (code.length ? '' : 'no arrival at Code & Tools'), unread: unread.length, whole: whole.length };
}
const ACTIVE = () => (document.querySelector('#pm-settings-root .domain-link.active') || {}).dataset?.domain || '';

export async function press(t, f, domain, { waitForHoverTags = false } = {}) {
	const qualify = async () => {
		// PM7PERF-SETCHAPTER-HOVER-SAMPLE-UNQUALIFIED: tags bind on real hover intent. The stock walk never hovered
		// the leaving chapter's controls, so the AI chapter reached the press with zero bound tags and the sample
		// abstained (astra-max-15: an ordinary mouse hover opened a real outgoing control tip before the same chapter
		// presses and both pages passed 17/17). Hover a real control of the current chapter first; the bounded wait
		// and the explicit missing-witness row stay.
		const control = f.locator('#workspace-stage .setting-row :is(button, input, select, textarea, [role="switch"], [role="slider"], [role="checkbox"])').first();
		if (await control.count()) {
			const cb = await control.boundingBox();
			if (cb) {
				await t.page.mouse.move(Math.round(cb.x + cb.width / 2), Math.round(cb.y + cb.height / 2), { steps: 4 });
				await t.page.waitForTimeout(350);
			}
		}
		// The page binds tags in idle batches. Give the chapter a chance to bind a real tag before sampling it.
		try {
			await f.locator('#workspace-stage [data-pm-hover-bound="true"]').first().waitFor({ state: 'attached', timeout: 10000 });
		} catch (error) {
			if (error.name !== 'TimeoutError') throw error;
			// ARM may still find tags that appear as the pointer moves to the chapter link.
		}
	};
	const aim = async () => {
		const box = await f.locator(`#pm-settings-root .domain-link[data-domain="${domain}"]`).first().boundingBox();
		if (!box) throw new Error(`no chapter link for ${domain}`);
		await t.page.mouse.move(Math.round(box.x + Math.min(box.width / 2, 60)), Math.round(box.y + box.height / 2));
		await t.page.waitForTimeout(300);
		return f.evaluate(ARM);
	};
	if (waitForHoverTags) await qualify();
	let armed = await aim();
	if (waitForHoverTags && !armed.tagged) {
		// The first tag can arrive late or disappear as the pointer leaves the control. Qualify and sample once more
		// before pressing. A second miss remains an explicit missing witness.
		await qualify();
		armed = await aim();
	}
	await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
	return armed;
}

/* R89 P1: a chapter chosen right before a Project change is kept by the Project it was chosen in. The other Project is
   picked from the title bar's own menu row in the moment the new chapter is committed, before any frame or idle time,
   while the place's save (deferred to after the first frame) still waits. */
const PROJECT_NOW = () => window.PM_ACTIVE_PROJECT_ID || (document.querySelector('#projectMenu .pm6-tb-menu-item.is-selected[data-project]') || {}).dataset?.project || '';
const ARM_SWITCH = (to) => {
	const root = document.getElementById('pm-settings-root');
	const mo = new MutationObserver(() => {
		const link = root.querySelector('.domain-link.active');
		if (!link || link.dataset.domain !== 'code') return;
		mo.disconnect();
		const row = document.querySelector(`#projectMenu .pm6-tb-menu-item[data-project="${to}"]`);
		window.__pscSwitched = row ? (row.click(), performance.now()) : -1;
	});
	mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
	window.__pscSwitched = 0;
};
const STORED = (project) => { try { const v = localStorage.getItem('pm7:settings:tome-tabs:v1:' + encodeURIComponent(project)); return v ? (JSON.parse(v).domain || '') : null; } catch (e) { return undefined; } };
async function projectRow(t, f, surface) {
	const a = await f.evaluate(PROJECT_NOW);
	const b = await f.evaluate((a0) => { const rows = [...document.querySelectorAll('#projectMenu .pm6-tb-menu-item[data-project]')].map((r) => r.dataset.project).filter((p) => p && p !== a0); return rows.includes('harbor') ? 'harbor' : rows[0] || ''; }, a);
	if (!a || !b) { await t.check(`${surface}: could judge: two Projects in the title bar (${a || '-'}, ${b || '-'})`, false, 'no second Project'); return; }
	await f.evaluate(PROBE);
	await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(2500);
	await f.evaluate(ARM_SWITCH, b);
	await press(t, f, 'code');
	await f.waitForFunction(() => window.__pscSwitched !== 0, null, { timeout: 5000 }).catch(() => {});
	await t.page.waitForTimeout(300);
	const now = await f.evaluate(PROJECT_NOW), stored = await f.evaluate(STORED, a);
	t.log(`${surface}: chose Code & Tools in ${a}, then ${b} in the same moment: now in ${now}; ${a}'s stored chapter: ${stored}`);
	await t.check(`${surface}: the Project changed to ${b} right after the chapter was chosen`, now === b, `still in ${now}`);
	if (stored !== undefined) await t.check(`${surface}: ${a}'s stored record names Code & Tools at once after the switch away`, stored === 'code', `${a} stores ${stored}`);
	await t.page.waitForTimeout(1500);
	await f.evaluate((p) => { const r = document.querySelector(`#projectMenu .pm6-tb-menu-item[data-project="${p}"]`); if (r) r.click(); }, a);
	await t.page.waitForTimeout(2500);
	/* a Project reload opens Settings on its Home (the saved record keeps no "home"); the chapter it keeps is its place */
	const back = await f.evaluate(() => (window.PM12_KIMI && PM12_KIMI.getState ? PM12_KIMI.getState().domain : '') || '');
	await t.check(`${surface}: back in ${a}, Settings' place is Code & Tools`, back === 'code', `its place is ${back || 'none'}`);
}

/* R90 P1: accept the existing Reset all confirmation at chapter commit, then verify the accepted values,
   history/rollback maps and reading place survive reload. Navigation must already be saved eagerly, as on main
   (owner decision: C3 retired). The old deferred-save pages remain useful negative fixtures for this guard. */
const ARM_RESTORE = (id) => {
	const tome = window.PM7_SETTINGS_TOME, root = document.getElementById('pm-settings-root');
	const R = window.__pscRestore = { accepted: false, result: null, saves: [] };
	const save = tome.save, restore = tome.restoreProjectDefaults;
	tome.save = function (snap) { R.saves.push(snap && snap.domain); return save.apply(this, arguments); };
	tome.restoreProjectDefaults = function () {
		/* SETCHAPTER-RESTORE-PENDING-AT-TRANSACTION: acceptance reaches the transaction through o55AfterPaint (a frame,
		   then a timer), so what the row needs is judged here, at the transaction's start, not only at acceptance: Code
		   is still the chapter, its rows are still pending (the switch has not finished), and its place is saved. */
		R.atTransaction = {
			domain: root.querySelector('.domain-link.active')?.dataset.domain || '',
			pending: root.querySelectorAll('#workspace-stage [data-o55-fill="pending"]').length,
			saved: R.saves.includes('code')
		};
		R.before = tome.projectSnapshot(tome.project().id);
		R.result = restore.apply(this, arguments);
		R.restored = tome.projectSnapshot(tome.project().id);
		return R.result;
	};
	const mo = new MutationObserver(() => {
		if (root.querySelector('.domain-link.active')?.dataset.domain !== 'code') return;
		mo.disconnect();
		window.PM12_KIMI.dispatchAction('pm51-all-reset');
		const button = document.querySelector('.overlay [role="dialog"][aria-label="Reset every setting to its default?"] button[type="submit"]');
		R.eagerAtAccept = R.saves.includes('code');
		const s = window.PM12_KIMI.getState();
		R.place = { domain: s.domain, workspace: s.workspace, activeSection: s.activeSection };
		R.changedAtAccept = !!s.changed[id] && s.settings[id] === 20;
		if (button) { R.accepted = true; button.click(); }
	});
	mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
	R.stop = () => { mo.disconnect(); tome.save = save; tome.restoreProjectDefaults = restore; };
};
/* R97 #6: after the switch's settle, wait for the fill's own completion, not a fixed cap on the whole sequence. The
   product starts its idle fill 450 ms after the commit, gives each section its own 1 s timeout and parks the job while a
   drag is held, so a correct fill on a busy host or behind a long stall can still be pending at any fixed deadline. The
   wait ends when no row list is pending ('done'); when the pending count has not fallen for `quiet` ms ('stalled': the fill
   stopped, with `dragged` when a drag class was on the body at any step); or at `cap` ms while still falling ('deadline':
   the host was too slow to finish, which says nothing about a missing row). Polled on a 100 ms timer, not every frame. */
const FILL_LIMITS = { quiet: 15000, cap: 90000 };
const FILL_WAIT = ({ quiet, cap }) => new Promise((done) => {
	const pending = () => document.querySelectorAll('#workspace-stage [data-o55-fill="pending"]').length;
	const drag = () => ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'].some((c) => document.body && document.body.classList.contains(c));
	const t0 = performance.now();
	let n = pending(), last = t0, dragged = drag();
	const end = (state, now, m) => done({ state, pending: m, waited: Math.round(now - t0), lastProgress: Math.round(last - t0), dragged });
	const step = () => {
		const now = performance.now(), m = pending();
		if (drag()) dragged = true;
		if (m !== n) { n = m; last = now; }
		if (m === 0) return end('done', now, m);
		if (now - last >= quiet) return end('stalled', now, m);
		if (now - t0 >= cap) return end('deadline', now, m);
		setTimeout(step, 100);
	};
	step();
});
/* The completeness rows (exported for tools/settings-chapter.selftest.mjs). R97 #6: an arrival whose fill did not finish
   is reported as such (stopped, or still filling at the cap), apart from the rows a finished fill left out; row ids drawn
   twice are wrong either way. */
export function arrivalVerdict(rows) {
	const unfinished = rows.filter((r) => r.fill && r.fill.state !== 'done');
	const finished = rows.filter((r) => !r.fill || r.fill.state === 'done');
	const left = finished.filter((r) => r.pendingLeft > 0 || (r.missing && r.missing.gone.length) || (r.to === 'code' && !(r.missing && r.missing.want)));
	const doubled = rows.filter((r) => r.dupIds > 0);
	const why = (f) => f.state === 'stalled'
		? `the fill stopped: no list filled for ${Math.round((f.waited - f.lastProgress) / 1000)} s with ${f.pending} still pending${f.dragged ? ' (a drag was held)' : ''}`
		: `still filling at the ${Math.round(f.waited / 1000)} s cap with ${f.pending} lists pending (a deadline, not a missing row)`;
	return [
		{ name: 'each arrival\'s fill finished (no row list left pending)', ok: !unfinished.length, detail: unfinished.map((r) => `${r.pair}: ${why(r.fill)}`).join('; ') },
		{ name: 'after each arrival every row in the rendered workspace model is drawn, once', ok: !left.length && !doubled.length,
			detail: [...left.map((r) => `${r.pair}: ${r.pendingLeft} row lists still pending, missing ${r.missing ? r.missing.gone.join(', ') || 'none' : '?'} of ${r.missing ? r.missing.want : '?'} modeled on ${r.missing ? r.missing.ws : '?'}`),
				...doubled.map((r) => `${r.pair}: ${r.dupIds} duplicate row ids`)].join('; ') + (unfinished.length ? ` (not judged for missing rows: ${unfinished.map((r) => r.pair).join(', ')}, whose fill did not finish)` : '') }
	];
}
/* The release rows (exported for tools/settings-chapter.selftest.mjs). R97 #4: both rows pass vacuously when nothing of
   the leaving chapter was sampled or no walk of it was seen, so each switch must have sampled tagged nodes of the leaving
   chapter and seen at least one walk of that chapter by collection; then no such walk may come before the new chapter's
   first frame, and the sampled nodes must have let go of their tags. */
export function hoverVerdict(rows) {
	const unsampled = rows.filter((r) => !(r.tagged > 0));
	const unwalked = rows.filter((r) => r.tagged > 0 && !(r.walks > 0));
	const walked = rows.filter((r) => r.cleanupsBeforePaint > 0);
	const kept = rows.filter((r) => r.taggedStill > 0);
	return [
		{ name: 'could judge the old chapter\'s hover tags: every switch sampled tagged nodes of the leaving chapter and saw a walk of it by collection', ok: rows.length > 0 && !unsampled.length && !unwalked.length,
			detail: [...unsampled.map((r) => `${r.pair}: no tagged node of the leaving chapter was sampled`), ...unwalked.map((r) => `${r.pair}: no walk of the leaving chapter was seen`)].join('; ') || (rows.length ? '' : 'no switch') },
		{ name: 'the old chapter\'s hover tags are not walked before the new chapter\'s first frame', ok: !walked.length, detail: walked.map((r) => `${r.pair}: ${r.cleanupsBeforePaint} walk(s)`).join('; ') },
		{ name: 'the old chapter\'s tagged nodes let go of their tags by collection after the fill\'s completion wait', ok: !kept.length, detail: kept.map((r) => `${r.pair}: ${r.taggedStill} of ${r.tagged}`).join('; ') }
	];
}
/* FO-245: judge the compositor's CDP screencast. The DOM can be filled while the compositor still shows only the
   background. Read edge detail (text, rules, controls) so that even a bright Glass gradient cannot stand in for rows.
   The settled view identifies the occupied destination bands. Each quarter must retain 30% of its reference detail.
   Sixteen narrower bands catch local blanks with a background-level cutoff that tolerates ordinary shifts in detail.
   Compare the chapter's pre-input frames with the source view, then compare against the destination from input time.
   FO-248P: a frame after the input still identical to the source view (under FLING_FILM.held of its pixels changed) is
   the view held while the page works, not a blank (flingFilm). */
export const FLING_FILM = { bands: 16, inset: 24, edge: 24, floor: 0.01, blank: 0.008, keep: 0.3, held: 0.002, width: 960, height: 540 };
export async function filmFling(client) {
	const frames = [];
	const on = (ev) => {
		client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }).catch(() => {});
		frames.push({ wall: ev.metadata.timestamp * 1000, png: Buffer.from(ev.data, 'base64') });
	};
	client.on('Page.screencastFrame', on);
	await client.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: FLING_FILM.width, maxHeight: FLING_FILM.height });
	return { frames, async stop() { await client.send('Page.stopScreencast').catch(() => {}); client.off('Page.screencastFrame', on); return frames.slice().sort((a, b) => a.wall - b.wall); } };
}
/* each band's detail: the share of its pixels with a luminance step of FLING_FILM.edge or more to the right or below */
export function filmBands(img, rect, bands = FLING_FILM.bands) {
	const h = (rect.y1 - rect.y0) / bands, out = [], w = img.width, d = img.data, T = FLING_FILM.edge;
	const lum = (x, y) => { const i = (y * w + x) * 4; return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; };
	for (let k = 0; k < bands; k++) {
		const y0 = rect.y0 + Math.round(k * h), y1 = rect.y0 + Math.round((k + 1) * h);
		let n = 0, edges = 0;
		for (let y = y0; y < y1 - 1; y++) for (let x = rect.x0; x < rect.x1 - 1; x++) {
			const l = lum(x, y);
			n++; if (Math.abs(l - lum(x + 1, y)) >= T || Math.abs(l - lum(x, y + 1)) >= T) edges++;
		}
		out.push(n ? +(edges / n).toFixed(4) : 0);
	}
	return out;
}
/* Frames are sorted {wall, png} pairs. The box and viewport are in top-page CSS pixels. Wheel and commit
   are the input and Code chapter commit times on the capture clock (epoch ms). */
export function flingFilm(frames, { box, view, wheel, commit = wheel }) {
	if (!frames || !frames.length || !box || !view || !(wheel > 0)) return { frames: frames ? frames.length : 0 };
	const imgs = frames.map((f) => decodePng(f.png)), sx = imgs[0].width / view.width, sy = imgs[0].height / view.height, i = FLING_FILM.inset;
	const rect = { x0: Math.max(0, Math.round((box.x + i) * sx)), y0: Math.max(0, Math.round((box.y + i) * sy)), x1: Math.min(imgs[0].width, Math.round((box.x + box.width - i) * sx)), y1: Math.min(imgs[0].height, Math.round((box.y + box.height - i) * sy)) };
	const rows = frames.map((f, k) => ({ i: k, dt: +(f.wall - wheel).toFixed(1), bands: filmBands(imgs[k], rect), quarters: filmBands(imgs[k], rect, 4) }));
	const lastRow = rows.at(-1), settled = lastRow.bands, judged = settled.filter((v) => v >= FLING_FILM.floor).length;
	const judgedQuarters = lastRow.quarters.filter((v) => v >= FLING_FILM.floor).length;
	const before = rows.findLast((r) => frames[r.i].wall < wheel && r.bands.some((v) => v >= FLING_FILM.floor));
	const after = rows.filter((r) => frames[r.i].wall >= wheel);
	const watched = rows.filter((r) => frames[r.i].wall >= Math.min(commit, wheel));
	/* moved: the frame differs from the last frame before the wheel in at least half as many pixels as the settled frame
	   does (a hover or a caret changes a few rows, the scroll changes the view) */
	const src = before ? imgs[before.i] : null, last = imgs.at(-1);
	const diff = (img) => { let n = 0, d = 0; for (let y = rect.y0; y < rect.y1; y += 2) for (let x = rect.x0; x < rect.x1; x += 2) { const p = (y * img.width + x) * 4; n++; if (Math.max(Math.abs(img.data[p] - src.data[p]), Math.abs(img.data[p + 1] - src.data[p + 1]), Math.abs(img.data[p + 2] - src.data[p + 2])) > 24) d++; } return n ? d / n : 0; };
	/* FO-248P: a frame after the input that is still the source view (under FLING_FILM.held of its pixels changed) is the
	   view held while the page works, not a blank: Home from the end of a page holds the end view, whose foot is empty,
	   and that view reads as unfilled against the settled top view. A blank never matches a source view with rows. */
	for (const r of watched) {
		const reference = frames[r.i].wall < wheel ? before || lastRow : lastRow;
		r.bad = (r.quarters.some((v, k) => reference.quarters[k] >= FLING_FILM.floor && v < reference.quarters[k] * FLING_FILM.keep)
			|| r.bands.some((v, k) => reference.bands[k] >= FLING_FILM.floor && v < Math.min(FLING_FILM.blank, reference.bands[k] * FLING_FILM.keep)))
			&& !(src && frames[r.i].wall >= wheel && diff(imgs[r.i]) < FLING_FILM.held);
	}
	const moved = src ? diff(last) : 0;
	const dest = src && moved > 0 ? after.find((r) => r.bad || diff(imgs[r.i]) >= moved / 2) || null : null;
	/* The marker prompts frames at vsync, but CDP can omit display frames. Keep the three-capture-median
	   gate around arrival. Even in an accepted gap, a blank shorter than about two capture intervals can
	   go unwitnessed. The shortest real blank was one display frame (batch-21 RTX, frame 892). */
	const gaps = after.slice(1).map((r, k) => +(r.dt - after[k].dt).toFixed(1));
	const sortedGaps = gaps.slice().sort((x, y) => x - y), median = sortedGaps.length ? sortedGaps[sortedGaps.length >> 1] : null;
	const span = dest && before ? rows.slice(before.i, Math.min(rows.length, dest.i + 2)) : [];
	const spanGaps = span.slice(1).map((r, k) => r.dt - span[k].dt);
	const spanGap = spanGaps.length ? Math.max(...spanGaps) : null;
	const resolved = median > 0 && spanGap != null && spanGap <= 3 * median;
	const estimate = (gap) => Math.max(0, Math.round(gap / median) - 1);
	const unwitnessed = median > 0 ? watched.reduce((n, r) => n + (r.i ? estimate(r.dt - rows[r.i - 1].dt) : 0), 0) : null;
	return { frames: frames.length, scale: +sx.toFixed(3), rect, settled, moved: +moved.toFixed(4), judged, judgedQuarters, source: before ? before.bands : null,
		after: after.length, dest, median, spanGap: spanGap == null ? null : +spanGap.toFixed(1), resolved, unwitnessed,
		timeline: rows.filter((r) => r.dt > -250 && r.dt < 500).map((r) => `${r.dt}:${r.bands.map((v) => Math.round(v * 1000)).join('/')}${r.bad ? '!' : ''}`).join(' '),
		bad: watched.filter((r) => r.bad).map(({ i, dt, bands }) => ({ i, dt, bands })), maxGap: gaps.length ? Math.max(...gaps) : null };
}
/* R93 #4's fling rows (exported for tools/settings-chapter.selftest.mjs). R97 #3: Terminal look must still be pending
   when the wheel is delivered (the commit's sample is logged only), and the scroll frame's sample must have Terminal look
   in view, so the empty-list row has the pending target in front of it. FO-245: the frames on screen are judged by
   flingFilm; a missing film, a settled view without two banded rows or no destination frame cannot pass.
   FO-245 round 3 (A245 high finding 1): two more routes land on the chapter's last page, Containers (code-reference),
   while it is still an unmounted placeholder: a single long wheel to the bottom of a fresh Code & Tools, and End from
   it. Their target is that page: unmounted when the input is delivered (r.wheelTargetPending; r.wheelPending counts the
   chapter's unmounted pages), in view in the sampled scroll frame, and no visible list or unmounted page in that frame.
   The input's delivery time and position keep the names wheel, wheelEpoch and wheelTop for the End key too. */
export const FLING_ROUTES = {
	terminal: { input: 'wheel', target: 'Terminal look', pending: 'the wheel was delivered with Terminal look pending',
		travel: 'a real wheel crossed at least one viewport and brought Terminal look into view', empty: 'no visible list is empty at the scroll frame' },
	'wheel-bottom': { input: 'wheel', target: 'the last page (Containers)', pending: 'a single long wheel to the bottom was delivered with the last page (Containers) unmounted',
		travel: 'the long wheel crossed at least one viewport and brought the last page into view', empty: 'no visible list or unmounted page is empty at the scroll frame' },
	end: { input: 'End', target: 'the last page (Containers)', pending: 'End was delivered with the last page (Containers) unmounted',
		travel: 'End crossed at least one viewport and brought the last page into view', empty: 'no visible list or unmounted page is empty at the scroll frame' },
	/* FO-245 round 4 (R143 high): End after a click on the document's plain text. Focus is then on the page's body, so
	   only Chrome's last-clicked scroller ties the key to the document; the route needs that focus at the key.
	   FO-245 round 5: 'end' and 'end-text' were kept for FO-248 but not registered as tests; FO-248P registers both again
	   (see the test list). */
	'end-text': { input: 'End', focus: 'body', target: 'the last page (Containers)', pending: 'End after a click on the document\'s plain text was delivered with focus on the page body and the last page (Containers) unmounted',
		travel: 'End crossed at least one viewport and brought the last page into view', empty: 'no visible list or unmounted page is empty at the scroll frame' },
	/* FO-248P: Home back up a fresh Code & Tools. A trusted End first (it leaves the pages between unmounted: the fix mounts
	   only the end pages, main's smooth End only those its observer reached), then, once the document has held still, a
	   trusted click on plain text of that view (focus on the body) and a trusted Home. The target is the chapter's first
	   page; the precondition is unmounted pages between the view and it when Home is delivered. Upward: the travel is
	   measured up from the key's position. */
	home: { input: 'Home', up: true, focus: 'body', target: 'the first page', pending: 'Home after End and a text click was delivered with focus on the page body and unmounted pages between the view and the first page',
		travel: 'Home crossed at least one viewport and brought the first page into view', empty: 'no visible list or unmounted page is empty at the scroll frame' }
};
export function flingVerdict(r, film, route = 'terminal') {
	const R = FLING_ROUTES[route] || FLING_ROUTES.terminal, input = R.input === 'wheel' ? 'wheel' : `${R.input} key`;
	const f = film && film.settled ? film : { frames: film ? film.frames : 0, bad: [], unread: true };
	const shown = (x) => x ? `frame ${x.i} at ${x.dt} ms [${x.bands.join(', ')}]` : 'none';
	return [
		{ name: R.pending, ok: !!r.wheel && r.wheelPending > 0 && r.wheelTargetPending === true && (!R.focus || r.wheelFocus === R.focus),
			detail: r.wheel ? `at ${input} delivery ${r.wheelPending} ${route === 'terminal' ? 'lists' : 'pages'} pending, ${R.target} pending ${r.wheelTargetPending}${R.focus ? `, focus on ${r.wheelFocus || 'unknown'}` : ''} (at commit ${r.pending}, ${r.targetPending})` : `no ${input} event was seen after the commit` },
		{ name: R.travel, ok: !!r.sampled && (R.up ? -r.moved : r.moved) >= r.height && r.targetInView === true,
			detail: r.sampled ? `moved ${r.moved} px of a ${r.height} px view; ${R.target} in view ${!!r.targetInView}` : `no scroll-frame sample with ${R.target} in view (${r.framesBefore || 0} scroll frames past one viewport without it)` },
		{ name: R.empty, ok: !!r.sampled && Array.isArray(r.empty) && r.empty.length === 0, detail: (r.empty || []).join(',') || 'no scroll-frame sample' },
		{ name: `no blank or unfilled frames from the Code chapter commit through the ${input} and settle (screencast pixels)`,
			ok: f.frames > 0 && f.judgedQuarters >= 2 && f.moved > 0 && !!f.dest && f.resolved === true && !f.dest.bad && f.bad.length === 0,
			detail: !f.frames ? 'no screencast frames' : f.unread ? `${f.frames} screencast frames, not read (no ${input} time, view or document box)` : `${f.frames} frames (${f.after} after the ${input}, largest gap ${f.maxGap} ms, median ${f.median} ms; largest gap from the last source frame to the frame after the first destination frame ${f.spanGap} ms${f.resolved ? '' : ', over three medians or unmeasured: a blank frame could be missing, not judged'}); settled view differs from the source in ${f.moved} of its pixels; settled detail [${(f.settled || []).join(', ')}], ${f.judged} bands in ${f.judgedQuarters} occupied quarters; first destination ${shown(f.dest)}${f.dest && f.dest.bad ? ' BLANK' : ''}; ${f.bad.length} blank or unfilled frame(s) from commit${f.bad.length ? ': ' + f.bad.slice(0, 8).map(shown).join('; ') : ''}; estimated unwitnessed capture intervals ${f.unwitnessed ?? 'unknown'}. An accepted gap can hide a blank shorter than about two capture intervals. The shortest observed real blank was one display frame.` }
	];
}
/* A blank in any attempt fails. Retry a clean unresolved capture or a Terminal look fill that finished
   between the commit and a real wheel, within the same five-attempt budget. All attempts must witness travel
   and filled rows. At least one must actually exercise the pending target. */
export const FLING_RETRY = { attempts: 5 };
const CAPTURE_GAPS = 'capture gaps (host load or renderer stall)';
const execFileAsync = promisify(execFile);

async function readBrowserSlots(host) {
	const { stdout } = await execFileAsync('browser-check', ['slots', '--host', host, '--json'], { timeout: 8000, maxBuffer: 256 * 1024 });
	return JSON.parse(stdout);
}

export async function captureCpuDetail(host, readSlots = readBrowserSlots) {
	if (!host) return '';
	try {
		const { rows } = await readSlots(host);
		const state = rows?.find(({ machine }) => machine.name === host || machine.fleet === host)?.state;
		if (!state || state.snapshot) return '';
		const sample = [state.fleet_queue?.cpu, state.cpu].find((cpu) => Number.isFinite(cpu?.busy_pct));
		if (!sample) return '';
		const sampledFor = sample.covered_s ?? sample.sample_s;
		return `browser host ${host} CPU ${sample.busy_pct}% busy${Number.isFinite(sampledFor) ? ` over ${sampledFor} s` : ''} (sampled after retries)`;
	} catch {
		return '';
	}
}
export function flingAttempt(r, px, kind = 'terminal') {
	const rows = flingVerdict(r, px, kind), bad = px && Array.isArray(px.bad) ? px.bad.length : 0;
	const resolved = !!px && px.resolved === true, route = rows.slice(0, 3).every((x) => x.ok);
	const idleFilled = kind === 'terminal' && r.committed && r.targetPending === true && r.wheel > 0 &&
		r.wheelTargetPending === false && rows[1].ok && rows[2].ok;
	return { rows, bad, resolved, route, idleFilled, retry: bad === 0 && (idleFilled || (route && !resolved)),
		gap: px && px.spanGap != null ? px.spanGap : null, median: px && px.median != null ? px.median : null, frames: px ? px.frames || 0 : 0 };
}
export function flingAttemptLine(a) {
	return `${a.resolved ? 'resolved' : 'not resolved'}, span gap ${a.gap} ms / median ${a.median} ms (${a.frames} frames), ${a.bad} bad frame(s)${a.idleFilled ? ', Terminal look filled before the wheel' : a.route ? '' : ', a wheel, travel or target row failed'}${a.retry ? ' -> retry' : ' -> decides'}`;
}
/* attempt(k) drives the route once and returns { r, px } (the page recorder's state and flingFilm's reading) */
export async function retryFling(attempt, max = FLING_RETRY.attempts, route = 'terminal') {
	const out = [];
	for (let k = 1; k <= max; k++) {
		const { r, px } = await attempt(k);
		const a = { k, r, px, ...flingAttempt(r, px, route) };
		out.push(a);
		if (!a.retry) break;
	}
	return out;
}
export function flingRetryVerdict(list, route = 'terminal') {
	if (!list || !list.length) return flingVerdict({}, null, route).map((row) => ({ ...row, ok: false, detail: 'no fling attempt ran' }));
	const used = list.at(-1), log = list.map((a) => `attempt ${a.k}: ${flingAttemptLine(a)}`).join('; ');
	const anyBad = list.some((a) => a.bad > 0);
	const captureGaps = list.length === FLING_RETRY.attempts && list.every((a) => a.route && !a.resolved && a.bad === 0);
	return used.rows.map((row, i) => {
		if (i < 3) {
			const ok = row.ok && list.every((a) => a.rows[i].ok || (i === 0 && a.idleFilled));
			return { ...row, ok, detail: `${row.detail} (attempt ${used.k} of ${list.length})` };
		}
		const detail = `${row.detail}; ${list.length} attempt(s), at most ${FLING_RETRY.attempts}: ${log}`;
		if (captureGaps) {
			const kind = CAPTURE_GAPS;
			const gaps = list.map((a) => `${a.gap ?? 'unmeasured'} / ${a.median ?? 'unmeasured'}`).join(', ');
			return { kind, name: `${kind}: ${row.name}`, ok: false, detail: `${kind}: ${list.length} attempts unresolved, 0 bad frames, gaps ${gaps} ms (span / median); ${detail}` };
		}
		return { ...row, ok: row.ok && used.route && used.resolved && !anyBad, detail };
	});
}
/* R132-FOLLOWUPS 3 (exported for tools/settings-chapter.selftest.mjs): the fling scroll gate. Only a scroll after the
   delivered wheel arms the sample, and the travel credited to the wheel is measured from its delivery position
   (wheelTop), not from the commit's start: a programmatic pre-wheel scroll is not the wheel's travel. The R93 #4
   page recorder mirrors this gate inline (it is serialized into the page). */
export function flingScrollGate(R, top) {
	return { arms: !!R.committed && !!R.wheel && !R.sampled && !R.armed && Math.abs(top - R.start) >= R.height,
		moved: R.wheelTop == null ? null : top - R.wheelTop };
}
/* SETCHAPTER-RESTORE-PENDING-AT-TRANSACTION (exported for tools/settings-chapter.selftest.mjs): the restore-all row
   judges a transaction across a chapter change only if, when the transaction starts, Code & Tools is the chapter, still
   has pending row lists (its switch is in flight) and has its place saved. A transaction that runs after the fill has
   finished would pass the row without crossing the change. */
export function restoreJudgeable(r) {
	const a = r && r.atTransaction;
	if (!a) return { ok: false, detail: 'the restore transaction never started', log: 'no transaction' };
	const ok = a.domain === 'code' && a.pending > 0 && a.saved === true;
	const log = `chapter ${a.domain || 'none'}, ${a.pending} row lists pending, Code saved ${a.saved}`;
	return { ok, log, detail: ok ? log : [a.domain !== 'code' && `the chapter was ${a.domain || 'none'}, not Code & Tools`, !(a.pending > 0) && 'no row list was pending: the switch had finished before the transaction', a.saved !== true && 'Code was not saved yet'].filter(Boolean).join('; ') };
}
const RESTORE_RECORD = () => {
	const tome = window.PM7_SETTINGS_TOME;
	try { return { source: 'stored', record: JSON.parse(localStorage.getItem('pm7:settings:tome-tabs:v1:' + encodeURIComponent(tome.project().id)) || 'null') }; }
	catch (_) { return { source: 'in-memory (opaque sandbox)', record: window.PM12_KIMI.getState() }; }
};
async function restoreAllRow(t, f, surface) {
	const id = 'general.visual.font-size';
	await f.evaluate((key) => window.PM12_KIMI.setSettingFromHost(key, 20), id);
	await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click();
	await t.page.waitForTimeout(2500);
	await f.evaluate(PROBE);
	await f.evaluate(ARM_RESTORE, id);
	try {
		await press(t, f, 'code');
		await f.waitForFunction(() => window.__pscRestore.result !== null, null, { timeout: 5000 }).catch(() => {});
		const r = await f.evaluate(() => { const { stop, ...r0 } = window.__pscRestore; return r0; });
		t.log(`${surface} R90 P1: Code already saved eagerly at acceptance ${!!r.eagerAtAccept}; place ${JSON.stringify(r.place)}`);
		await t.check(`${surface}: could judge restore-all: changed Text Size and accepted the existing confirmation`, r.accepted && r.changedAtAccept, JSON.stringify(r));
		await t.check(`${surface}: could judge restore-all: Code was already saved eagerly at acceptance, as on main`, r.eagerAtAccept === true, JSON.stringify(r));
		const judge = restoreJudgeable(r);
		t.log(`${surface} R90 P1 at the transaction's start: ${judge.log}`);
		await t.check(`${surface}: could judge restore-all: the transaction started while Code & Tools was still arriving (row lists pending) and saved`, judge.ok, judge.detail);
		await t.check(`${surface}: restore-all returned an accepted rollback receipt`, r.result?.ok === true && !!r.result.rollback_ref, JSON.stringify(r.result));
		await t.page.waitForTimeout(2500);
		const { source, record: s } = await f.evaluate(RESTORE_RECORD);
		const def = await f.evaluate((key) => Object.values(window.PM12_REFERENCE.byCat).flatMap((c) => c.settings).find((x) => x.id === key).default, id);
		const h = s?.settingsTransferHistory?.find((x) => x.receipt_id === r.result?.receipt_id), rollback = s?.settingsTransferRollbacks?.[r.result?.rollback_ref];
		t.log(`${surface} R90 P1 ${source}: Text Size ${s?.settings?.[id] ?? '(default)'}, changed ${!!s?.changed?.[id]}, history ${!!h}, rollback ${!!rollback}; place ${s?.domain}/${s?.workspace}`);
		await t.check(`${surface}: restore-all keeps Text Size at its default and removes its changed mark (${source})`, !!s && (s.settings?.[id] === undefined || s.settings[id] === def) && !s.changed?.[id], JSON.stringify({ value: s?.settings?.[id], changed: s?.changed?.[id], def }));
		await t.check(`${surface}: restore-all retains its history and exact prior settings/changed rollback (${source})`, !!h && h.action === 'Restored project defaults' && h.rollback_available === true && h.rollback_ref === r.result?.rollback_ref && !!rollback && JSON.stringify(rollback.settings) === JSON.stringify(r.before?.settings || {}) && JSON.stringify(rollback.changed) === JSON.stringify(r.before?.changed || {}), JSON.stringify({ history: h, rollback, before: r.before }));
		await t.check(`${surface}: restore-all keeps the transaction's complete history and rollback maps (${source})`, !!s && !!r.restored && JSON.stringify(s.settingsTransferHistory) === JSON.stringify(r.restored.settingsTransferHistory) && JSON.stringify(s.settingsTransferRollbacks) === JSON.stringify(r.restored.settingsTransferRollbacks), 'the final history or rollback map differs from the accepted restore transaction');
		if (source === 'stored') await t.check(`${surface}: restore-all stored settings and changed maps are empty, as on main`, Object.keys(s?.settings || {}).length === 0 && Object.keys(s?.changed || {}).length === 0, JSON.stringify({ settings: s?.settings, changed: s?.changed }));
		await f.evaluate(() => window.__pscRestore.stop());
		/* A full reload on normal; the adapter's memory store survives only reloadProject in the opaque sandbox. */
		if (surface === 'normal') {
			await t.reloadApp();
			f = t.root === t.page ? t.page.mainFrame() : t.root;
			await f.waitForFunction(() => !!window.PM12_KIMI, null, { timeout: 60000 });
		} else await f.evaluate(() => window.PM12_KIMI.reloadProject());
		const back = await f.evaluate(() => { const s0 = window.PM12_KIMI.getState(); return { domain: s0.domain, workspace: s0.workspace, activeSection: s0.activeSection }; });
		await t.check(`${surface}: reloaded Settings retains main's chosen Code & Tools reading place`, r.place?.domain === 'code' && JSON.stringify(back) === JSON.stringify(r.place), `${JSON.stringify(back)}; expected ${JSON.stringify(r.place)}`);
	} finally { await f.evaluate(() => window.__pscRestore?.stop()); }
}

/* F's L1 (sol-review-fo196u): native Tab order is resolved against the controls that exist, so focus put back without
   scrolling next to a section the first screen left unfilled must not pass over that section. In the moment Code & Tools
   is committed, before any frame or idle time, focus goes to the last control of the section before BOUNDARY (then Tab)
   or the first control of the section after it (then Shift+Tab); either key must land in BOUNDARY, as on main. Logged,
   not judged: key -> focus moved (on a page that fills on the key, that is the fill). */
const BOUNDARY = 'editor-terminal';
const ARM_FOCUS = ([dir, boundary]) => {
	const root = document.getElementById('pm-settings-root');
	const F = window.__pscFocus = { dir, boundary, set: false, at: 0, key: 0, moved: 0, filled: 0, boundaryPending: false, pendingAtFocus: 0, fromSection: '', fromLabel: '' };
	if (!window.__pscKeyOn) {
		window.__pscKeyOn = true;
		window.addEventListener('keydown', (e) => { const G = window.__pscFocus; if (G && e.key === 'Tab' && !G.key) G.key = e.timeStamp; }, true);
		window.addEventListener('focusin', () => { const G = window.__pscFocus; if (G && G.key && !G.moved) G.moved = performance.now(); }, true);
	}
	const tabbable = (s) => (s ? [...s.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter((x) => x.tabIndex >= 0 && !x.disabled && !x.closest('[inert]') && x.getClientRects().length) : []);
	const listOf = (s) => s && s.querySelector(':scope > .setting-list');
	const mo = new MutationObserver(() => {
		const link = root.querySelector('.domain-link.active');
		if (!link || link.dataset.domain !== 'code') return;
		const secs = [...root.querySelectorAll('#settings-document [data-section-id]')];
		const i = secs.findIndex((s) => s.dataset.sectionId === boundary);
		if (i < 1 || i + 1 >= secs.length) return;
		mo.disconnect();
		const from = dir === 'forward' ? tabbable(secs[i - 1]).at(-1) : tabbable(secs[i + 1])[0];
		const list = listOf(secs[i]);
		F.pendingAtFocus = root.querySelectorAll('#settings-document [data-o55-fill="pending"]').length;
		F.boundaryPending = !!(list && list.getAttribute('data-o55-fill') === 'pending');
		F.fromSection = from ? from.closest('[data-section-id]').dataset.sectionId : '';
		F.fromLabel = from ? (from.getAttribute('aria-label') || from.textContent || '').trim().slice(0, 50) : '';
		if (from) from.focus({ preventScroll: true });
		F.set = !!from && document.activeElement === from;
		F.at = performance.now();
		if (F.boundaryPending) {
			const m2 = new MutationObserver(() => { if (list.getAttribute('data-o55-fill') !== 'pending') { F.filled = performance.now(); m2.disconnect(); } });
			m2.observe(list, { attributes: true, attributeFilter: ['data-o55-fill'] });
		}
	});
	mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
};
const COLLECT_FOCUS = () => {
	const F = window.__pscFocus || {}, a = document.activeElement, sec = a && a.closest ? a.closest('[data-section-id]') : null;
	return { ...F, toSection: sec ? sec.dataset.sectionId : '', toLabel: a ? (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 50) : '' };
};
async function restoredFocusRow(t, f, surface, dir) {
	const key = dir === 'forward' ? 'Tab' : 'Shift+Tab';
	await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click();
	await t.page.waitForTimeout(2500);
	await f.waitForFunction(() => !document.querySelector('#workspace-stage [data-o55-fill="pending"]'), null, { timeout: 10000 }).catch(() => {});
	await f.evaluate(ARM_FOCUS, [dir, BOUNDARY]);
	await press(t, f, 'code');
	/* the chapter is committed a few tens of ms after the release: the key comes once focus is back (checked each frame) */
	await f.waitForFunction(() => (window.__pscFocus || {}).at > 0, null, { timeout: 5000 }).catch(() => {});
	await t.page.keyboard.press(key);
	await t.page.waitForTimeout(150);
	const r = await f.evaluate(COLLECT_FOCUS);
	const ms = (x) => (x && r.key ? Math.round(x - r.key) : null);
	t.log(`${surface} ${key}: focus put back on "${r.fromLabel}" (${r.fromSection || '-'}) at the commit, ${r.pendingAtFocus} row lists pending, ${BOUNDARY} ${r.boundaryPending ? 'pending' : 'drawn'}; the key landed on "${r.toLabel}" (${r.toSection || '-'}); key -> focus moved ${ms(r.moved) ?? '-'} ms; ${BOUNDARY} filled ${r.filled ? `${ms(r.filled)} ms after the key` : r.boundaryPending ? 'not yet' : '(drawn at once)'}`);
	await t.check(`${surface} ${key}: could judge: focus was put back next to ${BOUNDARY} at the commit, before the key`, r.set && r.at > 0 && r.key > r.at,
		r.set ? `the key came ${Math.round(r.at - r.key)} ms before the focus` : `no control next to ${BOUNDARY} (from "${r.fromSection || 'none'}")`);
	if (r.boundaryPending) await t.check(`${surface} ${key}: could judge: ${BOUNDARY} was still unfilled when the key came`, !(r.filled && r.filled < r.key), `filled ${Math.round(r.key - r.filled)} ms before the key`);
	await t.check(`${surface} ${key} from restored focus lands in ${BOUNDARY}, the section next to it`, r.toSection === BOUNDARY, `landed on "${r.toLabel}" in ${r.toSection || 'no section'}`);
}

/* R92 P1: search lands at Spelling with the later More options groups still pending. Observe the real opening
   animation without delaying any callback: its last height must match the filled body's natural scrollHeight.
   Main is the eager control; a page with the first-screen wrapper must prove pending groups at the click. */
const ARM_MORE = () => {
	const root = document.getElementById('pm-settings-root'), animate = Element.prototype.animate;
	const R = window.__pscMore = { deferred: /o55fs\.pending/.test(String(window.PM51.revealSetting)), clicked: false, done: false, animations: 0 };
	const collect = (body) => {
		R.natural = body.scrollHeight;
		R.pendingEnd = body.querySelectorAll('[data-o55-fill="pending"]').length;
		const b = body.getBoundingClientRect(), end = R.endpoint ?? R.natural;
		R.bodyHeight = b.height;
		const rows = [...body.querySelectorAll('.setting-row')].filter(n => n.getBoundingClientRect().height > 0);
		R.rows = rows.length;
		/* The endpoint is the opening's final clip box; checking only the post-animation box hides a snap. */
		R.clipped = rows.filter(n => { const r = n.getBoundingClientRect(); return r.top < b.top - 1 || r.bottom > b.top + end + 1; }).map(n => ({id:n.id, top:n.getBoundingClientRect().top-b.top, bottom:n.getBoundingClientRect().bottom-b.top}));
		R.done = true;
	};
	const click = e => {
		const sum = e.target.closest && e.target.closest('details.pm51-advanced > summary');
		if (!sum || !root.contains(sum) || sum.parentElement.open) return;
		const d = sum.parentElement;
		R.clicked = true; R.pendingClick = d.querySelectorAll('[data-o55-fill="pending"]').length;
		R.closedClick = !d.open;
		R.reduced = document.documentElement.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;
		/* Native Reduced Motion has no animation; toggle is delivered after its default action/fill. */
		if (R.reduced) d.addEventListener('toggle', () => queueMicrotask(() => collect(d.querySelector(':scope > .pm51-advanced-body'))), { once: true });
	};
	window.addEventListener('click', click, true);
	const beforeDefault = e => {
		const sum = e.target.closest && e.target.closest('details.pm51-advanced > summary');
		if (R.clicked && sum && root.contains(sum)) R.pendingBeforeDefault = sum.parentElement.querySelectorAll('[data-o55-fill="pending"]').length;
	};
	document.addEventListener('click', beforeDefault);
	Element.prototype.animate = function () {
		const a = animate.apply(this, arguments);
		if (R.clicked && this.matches('.pm51-advanced-body')) {
			R.animations++; R.endpoint = parseFloat(a.effect.getKeyframes().at(-1).height);
			a.finished.then(() => queueMicrotask(() => collect(this)), () => { R.cancelled = true; R.done = true; });
		}
		return a;
	};
	R.stop = () => { window.removeEventListener('click', click, true); document.removeEventListener('click', beforeDefault); Element.prototype.animate = animate; };
};
async function moreOptionsRow(t, f, label, expectedReduced) {
	await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
	await t.page.waitForTimeout(700);
	await f.locator('#pm-settings-root [data-global-search]').fill('general.interaction.spellcheck-words');
	const result = f.locator('[data-search-result="setting"][data-search-payload*="general.interaction.spellcheck-words"]').first();
	await result.waitFor({ state: 'visible', timeout: 5000 });
	await f.evaluate(ARM_MORE);
	try {
		await result.click();
		/* Deliver the summary's native click promptly, without a mouse focus scroll changing which sections reveal.
		   This invokes the existing disclosure/default action; it does not call a fill or animation implementation. */
		await f.locator('#workspace-stage details.pm51-advanced > summary').first().evaluate(n => n.click());
		await f.waitForFunction(() => window.__pscMore.done, null, { timeout: 5000 }).catch(() => {});
		const r = await f.evaluate(() => { const { stop, ...r } = window.__pscMore; return r; });
		t.log(`${label}: deferred ${r.deferred}, pending at click ${r.pendingClick}, animations ${r.animations}, endpoint ${r.endpoint ?? 'native'}, natural ${r.natural}, body height ${r.bodyHeight}, rows ${r.rows}, pending end ${r.pendingEnd}, clipped ${JSON.stringify(r.clipped)}`);
		await t.check(`${label}: More options was closed and ${r.deferred ? 'held pending sections' : 'was fully drawn on eager main'} at the click`, r.clicked && r.closedClick && (r.deferred ? r.pendingClick > 0 : r.pendingClick === 0), JSON.stringify(r));
		await t.check(`${label}: all rows are filled before the summary's native default`, r.pendingBeforeDefault === 0, JSON.stringify(r));
		await t.check(`${label}: the opening finished with all rows filled`, r.done && !r.cancelled && r.pendingEnd === 0 && r.rows > 0, JSON.stringify(r));
		await t.check(`${label}: disclosure uses the requested motion state`, r.reduced === expectedReduced, `requested ${expectedReduced}, observed ${r.reduced}`);
		await t.check(`${label}: ${r.reduced ? 'Reduced Motion uses native opening' : 'the animation ends at the filled body\'s natural height'}`, r.reduced ? r.animations === 0 : r.animations === 1 && Math.abs(r.endpoint - r.natural) <= 1, `endpoint ${r.endpoint}; natural ${r.natural}; animations ${r.animations}`);
		await t.check(`${label}: no row is clipped by the opening's final height`, r.done && r.rows > 0 && r.clipped?.length === 0, JSON.stringify(r.clipped || []) + (r.done ? '' : '; opening did not finish'));
	} finally { await f.evaluate(() => window.__pscMore.stop()); }
}

// PM7PERF-SETCHAPTER-SELECTALL-MAC-KEY-REMOTE: Playwright resolves ControlOrMeta on the DRIVER's platform, so a
// Linux driver sent Control+A to Mac Chrome and the five native selection rows failed (astra-max-15: Command+A
// selected Terminal colors and the editing words in all four native editor controls on both pages). Choose the
// modifier from the BROWSER's platform (navigator.platform), not the driver's. Exported for
// tools/settings-chapter.selftest.mjs.
export const selectAllModifier = (platform) => /Mac|iPhone|iPad|iPod/.test(platform || '') ? 'Meta' : 'Control';

export const tests = {};
export { FILL_WAIT };

/* R97 check 2: the collector must notice a missing hand-authored Spelling row on the real rendered model. */
for (const surface of ['normal', 'sandbox']) {
	tests[`R97 completeness includes hand-authored Settings rows (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080); await muteSound(t.page);
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
		await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click();
		await f.waitForFunction(() => {
			const body = document.querySelector('#workspace-stage [data-continuous-workspace-body="app-input"][data-workspace-mounted="true"]');
			return body && body.querySelector('[id="setting-general.interaction.spellcheck-words"]') && !body.querySelector('[data-o55-fill="pending"]');
		}, null, { timeout: 15000 });
		await f.evaluate(PROBE); await f.evaluate(ARM);
		const id = 'general.interaction.spellcheck-words';
		const removed = await f.evaluate(id => { const n = document.getElementById('setting-' + id); if (!n) return false; n.remove(); return true; }, id);
		const r = await f.evaluate(COLLECT);
		t.log(`${surface} missing hand row: expected ${r.missing.want}, absent ${r.missing.gone.join(',') || 'none'}`);
		await t.check(`${surface}: omission control removed the real hand-authored Spelling row`, removed);
		await t.check(`${surface}: collector rejects the missing hand-authored row`, r.missing.gone.includes(id), JSON.stringify(r.missing));
	};
}

/* R97 product 1: capture counts on the key's own dispatch, around the product listeners. Resume uses the existing
   public action at Code commit, so the real onboarding window holds the still-pending Settings chapter inert. */
for (const surface of ['normal', 'sandbox']) {
	tests[`R97 keys under Resume setup and in Usage build no hidden Settings (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080); await muteSound(t.page);
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		await t.page.addInitScript(() => {
			window.addEventListener('keydown', e => {
				const R = window.__pscCovered;
				if (!R || !['Tab', 'F3', 'f', 'F', 'a', 'A'].includes(e.key)) return;
				R.seen = true; R.before = document.querySelectorAll('#pm-settings-root [data-o55-fill="pending"]').length;
				const panel = document.getElementById('panel-settings');
				R.active = panel.classList.contains('active'); R.inert = !!panel.closest('[inert]');
				R.modal = document.documentElement.hasAttribute('data-o55-open');
			}, true);
		});
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
		/* Warm Usage before the pending-page setup; its normal first entry may otherwise consume the idle interval. */
		await f.locator('#tab-usage').click(); await t.settle(); await f.locator('#tab-settings').click(); await t.settle();
		for (const [cover, key] of [['resume', 'Tab'], ['resume', 'Shift+Tab'], ['usage', 'F3'], ['usage', 'Shift+F3'], ['usage', 'Control+f'], ['usage', 'Meta+f'], ['resume', 'Control+a'], ['resume', 'Meta+a'], ['usage', 'Control+a'], ['usage', 'Meta+a']]) {
			await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(700);
			await f.evaluate(cover => {
				const root = document.getElementById('pm-settings-root');
				const R = window.__pscCovered = { ready: false, seen: false };
				const mo = new MutationObserver(() => {
					if (root.querySelector('.domain-link.active')?.dataset.domain !== 'code') return;
					mo.disconnect();
					if (cover === 'resume') window.PM7_ONBOARDING_CINEMATIC.resume();
					else document.getElementById('tab-usage').click();
					R.ready = true;
				});
				const after = e => {
					if (!R.seen || !['Tab', 'F3', 'f', 'F', 'a', 'A'].includes(e.key)) return;
					R.after = root.querySelectorAll('[data-o55-fill="pending"]').length; R.done = true;
				};
				mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
				document.addEventListener('keydown', after, true);
				R.stop = () => { mo.disconnect(); document.removeEventListener('keydown', after, true); };
			}, cover);
			try {
				await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
				await f.waitForFunction(() => window.__pscCovered.ready, null, { timeout: 5000 });
				if (cover === 'resume') await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open') && !!document.getElementById('panel-settings').closest('[inert]'), null, { timeout: 5000 });
				await t.page.keyboard.press(key);
				const r = await f.evaluate(() => { const { stop, ...r } = window.__pscCovered; return r; });
				t.log(`${surface} ${cover} ${key}: active ${r.active}, inert ${r.inert}, modal ${r.modal}; pending ${r.before} -> ${r.after}`);
				await t.check(`${surface} ${cover} ${key}: key reached pending Settings behind the other view`, r.seen && r.before > 0 && (cover === 'resume' ? r.active && r.inert && r.modal : !r.active), JSON.stringify(r));
				await t.check(`${surface} ${cover} ${key}: key constructs no hidden Settings list`, r.done && r.after === r.before, JSON.stringify(r));
			} finally {
				await f.evaluate(() => window.__pscCovered.stop());
				if (cover === 'resume') {
					await f.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.close());
					await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 5000 });
				} else { await f.locator('#tab-settings').click(); await t.settle(); }
			}
		}
	};
}
for(const surface of ['normal','sandbox']){
	tests[`R93 #8 Tab in Usage does not fill hidden Settings (${surface})`]=async(t)=>{
		if(!t.app.surfaces().includes(surface)){await t.check(`${surface} surface not asked for`,true);return;}
		await t.viewport(1920,1080);await muteSound(t.page);if(t.args.motion==='reduce')await t.emulate({reducedMotion:'reduce'});
		await t.page.addInitScript(()=>{
			const early=e=>{const R=window.__pscHidden;if(!R||e.key!=='Tab')return;R.seen=true;R.hidden=!document.getElementById('panel-settings').classList.contains('active');R.before=document.querySelectorAll('#pm-settings-root [data-o55-fill="pending"]').length;};
			window.__pscHiddenEarly=early;window.addEventListener('keydown',early,true);
		});
		const f=await t.app.open({sandbox:surface==='sandbox'});await t.app.resetLayout().catch(()=>{});await f.locator('#tab-settings').click();await t.settle();
		await f.locator('#tab-usage').click();await t.settle();await f.locator('#tab-settings').click();await t.settle();
		await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click();await t.page.waitForTimeout(700);
		await f.evaluate(()=>{
			const root=document.getElementById('pm-settings-root'),pending=()=>root.querySelectorAll('[data-o55-fill="pending"]').length;
			const R=window.__pscHidden={ready:false,seen:false};
			const mo=new MutationObserver(()=>{
				if(root.querySelector('.domain-link.active')?.dataset.domain!=='code')return;mo.disconnect();R.atCommit=pending();
				document.getElementById('tab-usage').click();R.ready=true;
			});
			const key=e=>{if(e.key==='Tab'){R.after=pending();R.done=true;}};
			mo.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});window.addEventListener('keydown',key,true);
			R.stop=()=>{mo.disconnect();window.removeEventListener('keydown',key,true);window.removeEventListener('keydown',window.__pscHiddenEarly,true);};
		});
		try{
			await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();await f.waitForFunction(()=>window.__pscHidden.ready,null,{timeout:5000});
			await t.page.keyboard.press('Tab');await f.waitForFunction(()=>window.__pscHidden.done,null,{timeout:3000}).catch(()=>{});
			const r=await f.evaluate(()=>{const{stop,...r}=window.__pscHidden;return r;});t.log(`${surface} Usage Tab: hidden ${r.hidden}; pending ${r.before} -> ${r.after}`);
			await t.check(`${surface}: Tab reached Usage while hidden Settings had pending lists`,r.seen&&r.hidden&&r.before>0,JSON.stringify(r));
			await t.check(`${surface}: Tab constructs no hidden Settings list`,r.done&&r.after===r.before,JSON.stringify(r));
		}finally{await f.evaluate(()=>window.__pscHidden.stop());}
	};
}
for (const surface of ['normal', 'sandbox']) {
	tests[`R106 P1 Select All includes pending chapter rows (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080); await muteSound(t.page);
		await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		const platform = await f.evaluate(() => navigator.platform);
		const selectAllKey = selectAllModifier(platform) + '+A';
		t.log(`${surface} Select All key: ${selectAllKey} (browser platform ${platform})`);
		await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
		await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(700);
		await f.evaluate(() => {
			const root = document.getElementById('pm-settings-root'), pending = () => root.querySelectorAll('[data-o55-fill="pending"]').length;
			const R = window.__pscSelectAll = { ready: false, seen: false };
			const mo = new MutationObserver(() => { if (root.querySelector('.domain-link.active')?.dataset.domain === 'code') { mo.disconnect(); R.ready = true; } });
			const selectAll = e => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a';
			const before = e => {
				if (!selectAll(e)) return;
				R.seen = true; R.before = pending();
				R.targetPending = !!root.querySelector('#section-editor-terminal-look [data-o55-fill="pending"]');
				R.chapterFocus = e.target.matches('.domain-link[data-domain="code"]') && document.activeElement === e.target;
			};
			const after = e => { if (selectAll(e)) { R.after = pending(); R.done = true; } };
			mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
			window.addEventListener('keydown', before, true); document.addEventListener('keydown', after, true);
			R.stop = () => { mo.disconnect(); window.removeEventListener('keydown', before, true); document.removeEventListener('keydown', after, true); getSelection().removeAllRanges(); };
		});
		try {
			await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
			await f.waitForFunction(() => window.__pscSelectAll.ready, null, { timeout: 5000 });
			await t.page.keyboard.press(selectAllKey);
			const r = await f.evaluate(() => { const { stop, ...r } = window.__pscSelectAll; return { ...r, selectedTerminal: getSelection().toString().includes('Terminal colors') }; });
			t.log(`${surface} Select All: pending ${r.before} -> ${r.after}, Terminal look pending ${r.targetPending}, chapter focus ${r.chapterFocus}, selected Terminal colors ${r.selectedTerminal}`);
			await t.check(`${surface}: Select All reached the chapter button while Terminal look was pending`, r.seen && r.chapterFocus && r.before > 0 && r.targetPending, JSON.stringify(r));
			await t.check(`${surface}: Select All filled every pending list during key dispatch`, r.done && r.after === 0, JSON.stringify(r));
			await t.check(`${surface}: native selection includes Terminal colors before Copy`, r.selectedTerminal, JSON.stringify(r));
		} finally { await f.evaluate(() => window.__pscSelectAll.stop()); }
	};
}
for (const surface of ['normal', 'sandbox']) {
	tests[`R106 P1 Select All inside editing controls leaves pending Settings alone (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080); await muteSound(t.page);
		await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		const platform = await f.evaluate(() => navigator.platform);
		const selectAllKey = selectAllModifier(platform) + '+A';
		t.log(`${surface} Select All key: ${selectAllKey} (browser platform ${platform})`);
		await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
		for (const kind of ['input', 'textarea', 'contenteditable', 'plaintext-only', 'code-editor']) {
			await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(700);
			await f.evaluate(kind => {
				const root = document.getElementById('pm-settings-root'), pending = () => root.querySelectorAll('[data-o55-fill="pending"]').length;
				const R = window.__pscEditing = { ready: false, seen: false };
				let fixture, control;
				const mo = new MutationObserver(() => {
					if (root.querySelector('.domain-link.active')?.dataset.domain !== 'code') return;
					mo.disconnect();
					fixture = document.createElement('div'); fixture.style.cssText = 'position:fixed;left:400px;top:30px;z-index:99999';
					control = document.createElement(kind === 'input' || kind === 'textarea' ? kind : 'span');
					if (kind === 'input' || kind === 'textarea') control.value = 'editing words';
					else { control.textContent = 'editing words'; control.tabIndex = 0; }
					if (kind === 'contenteditable') fixture.contentEditable = 'true';
					if (kind === 'plaintext-only') control.contentEditable = 'plaintext-only';
					if (kind === 'code-editor') fixture.className = 'cm-editor';
					fixture.append(control); root.append(fixture); control.focus({ preventScroll: true });
					if (kind === 'contenteditable' || kind === 'plaintext-only') {
						const caret = document.createRange(); caret.selectNodeContents(control); caret.collapse(false);
						getSelection().removeAllRanges(); getSelection().addRange(caret);
					}
					R.ready = true;
				});
				const key = e => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a';
				const before = e => { if (key(e)) { R.seen = true; R.before = pending(); R.focused = fixture.contains(e.target) && fixture.contains(document.activeElement); } };
				const after = e => { if (key(e)) { R.after = pending(); R.prevented = e.defaultPrevented; R.done = true; } };
				mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
				window.addEventListener('keydown', before, true); document.addEventListener('keydown', after, true);
				R.selection = () => kind === 'input' || kind === 'textarea' ? control.value.slice(control.selectionStart, control.selectionEnd) : getSelection().toString();
				R.stop = () => { mo.disconnect(); window.removeEventListener('keydown', before, true); document.removeEventListener('keydown', after, true); fixture?.remove(); getSelection().removeAllRanges(); };
			}, kind);
			try {
				await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
				await f.waitForFunction(() => window.__pscEditing.ready, null, { timeout: 5000 });
				await t.page.keyboard.press(selectAllKey);
				const r = await f.evaluate(() => { const { stop, selection, ...r } = window.__pscEditing; return { ...r, selected: selection() }; });
				t.log(`${surface} ${kind} Select All: pending ${r.before} -> ${r.after}, focused ${r.focused}, default prevented ${r.prevented}`);
				await t.check(`${surface} ${kind}: Select All reached the editor with pending lists`, r.seen && r.focused && r.before > 0, JSON.stringify(r));
				await t.check(`${surface} ${kind}: Select All fills no Settings list and keeps its native default`, r.done && r.after === r.before && !r.prevented, JSON.stringify(r));
				if (kind !== 'code-editor') await t.check(`${surface} ${kind}: native Select All selects only its editing text`, r.selected === 'editing words', JSON.stringify(r));
			} finally { await f.evaluate(() => window.__pscEditing.stop()); }
		}
	};
}
for (const surface of ['normal','sandbox']) {
	tests[`R93 #5 F3 and Shift+F3 fill pending text synchronously (${surface})`] = async(t)=>{
		if(!t.app.surfaces().includes(surface)){await t.check(`${surface} surface not asked for`,true);return;}
		await t.viewport(1920,1080);await muteSound(t.page);
		if(t.args.motion==='reduce')await t.emulate({reducedMotion:'reduce'});
		const f=await t.app.open({sandbox:surface==='sandbox'});await t.app.resetLayout().catch(()=>{});await f.locator('#tab-settings').click();await t.settle();
		for(const key of ['F3','Shift+F3']){
			await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click();await t.page.waitForTimeout(700);
			await f.evaluate(()=>{
				const root=document.getElementById('pm-settings-root'),pending=()=>root.querySelectorAll('[data-o55-fill="pending"]').length;
				const R=window.__pscFind={ready:false,seen:false};
				const mo=new MutationObserver(()=>{if(root.querySelector('.domain-link.active')?.dataset.domain==='code'){mo.disconnect();R.ready=true;}});
				const key=e=>{if(e.key==='F3'){R.seen=true;R.before=pending();}};
				const after=e=>{if(e.key!=='F3')return;R.after=pending();R.text=!!root.querySelector('#section-editor-terminal-look')?.textContent.includes('Terminal colors');R.done=true;};
				mo.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});window.addEventListener('keydown',key,true);document.addEventListener('keydown',after,true);
				R.stop=()=>{mo.disconnect();window.removeEventListener('keydown',key,true);document.removeEventListener('keydown',after,true);};
			});
			try{
				await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();await f.waitForFunction(()=>window.__pscFind.ready,null,{timeout:5000});
				await t.page.keyboard.press(key);await f.waitForFunction(()=>window.__pscFind.done,null,{timeout:3000}).catch(()=>{});
				const r=await f.evaluate(()=>{const{stop,...r}=window.__pscFind;return r;});t.log(`${surface} ${key}: pending ${r.before} -> ${r.after}, Terminal colors present ${r.text}`);
				await t.check(`${surface} ${key}: the key reached pending Code content`,r.seen&&r.before>0,JSON.stringify(r));
				await t.check(`${surface} ${key}: pending text is filled within the key dispatch`,r.done&&r.after===0&&r.text,JSON.stringify(r));
			}finally{await f.evaluate(()=>window.__pscFind.stop());}
		}
	};
}
/* FO-245 round 3: the looks every fling route runs in. Glass Dark and Glass Light are in by default (A245 high finding 2:
   their wallpaper passed the round 1 reading with no row on screen); `--set flingLooks=all` runs all ten looks,
   `--set flingLooks=a,b` any of them. */
export const FLING_LOOKS = ['basic-dark', 'nier-light', 'glass-dark', 'glass-light'];
export const flingLooks = (arg) => !arg ? FLING_LOOKS.slice() : String(arg) === 'all' ? ALL.slice() : String(arg).split(',').map((s) => s.trim()).filter((l) => ALL.includes(l));
/* FO-245 round 4 (R143 medium 2, exported for tools/settings-chapter.selftest.mjs): End on a focused tab of a fresh
   AI & Providers belongs to the tab list, as on main: the last tab is selected and focused, still in view, and the
   document does not move. Round 3's End/Home listener ran in the capture phase before the tab list and jumped the
   document 2,023 px to the chapter's end. The precondition is the chapter still having unmounted pages at the key, which
   is when that listener acts. */
export const TAB_END_TRAVEL = 2;
export function tabEndVerdict(r) {
	const ok0 = !!r && !!r.key && r.focusTab === true && r.coldAtKey > 0 && r.tabs > 1 && r.startIndex >= 0 && r.startIndex < r.tabs - 1;
	return [
		{ name: 'End reached a focused tab, not the last, while the chapter still had unmounted pages', ok: ok0,
			detail: !r || !r.key ? 'no trusted End was seen on the tab' : `focus on a tab ${r.focusTab}, tab ${r.startIndex + 1} of ${r.tabs}, ${r.coldAtKey} unmounted page(s) at the key` },
		{ name: 'End on a focused tab selects and focuses the last tab, which stays in view', ok: ok0 && r.lastSelected === true && r.lastFocused === true && r.lastInView === true,
			detail: r ? `last tab selected ${r.lastSelected}, focused ${r.lastFocused}, in view ${r.lastInView}; focus after on ${r.focusAfter}` : 'no reading' },
		{ name: `End on a focused tab leaves the document where it was (within ${TAB_END_TRAVEL} px)`, ok: ok0 && r.maxTravel != null && r.maxTravel <= TAB_END_TRAVEL,
			detail: r ? `the document moved at most ${r.maxTravel} px (${r.scrolls} scroll events), ended ${r.travel} px from where it was` : 'no reading' }
	];
}
export async function tabEndRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	await t.viewport(1920, 1080); await muteSound(t.page);
	await t.emulate({reducedMotion:t.args.motion === 'reduce' ? 'reduce' : 'no-preference'});
	const f = await t.app.open({sandbox:surface === 'sandbox'});
	await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
	await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(700);
	await f.locator('#pm-settings-root .domain-link[data-domain="ai"]').first().click();
	await f.waitForFunction(()=>document.querySelector('#pm-settings-root .domain-link.active')?.dataset.domain==='ai',null,{timeout:5000}).catch(()=>{});
	await t.page.waitForTimeout(700);
	const pre = await f.evaluate(() => {
		const sc=document.querySelector('#pm-settings-root #settings-document'),v=sc.getBoundingClientRect();
		const tab=[...sc.querySelectorAll('[role="tablist"] [role="tab"]')].find(x=>{const r=x.getBoundingClientRect(),l=[...x.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];return r.height>0&&r.top>=v.top&&r.bottom<=v.bottom&&l.indexOf(x)<l.length-1&&getComputedStyle(x).visibility==='visible';});
		if(!tab)return {tab:null};
		tab.focus({preventScroll:true});
		const list=[...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
		const R=window.__pscTab={key:false,start:sc.scrollTop,maxTravel:0,scrolls:0,tabs:list.length,startIndex:list.indexOf(tab),manager:tab.dataset.manager||null};
		const key=e=>{if(e.key!=='End'||!e.isTrusted||R.key)return;R.key=true;R.focusTab=document.activeElement===tab;R.coldAtKey=sc.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="false"]').length;};
		const scroll=e=>{if(e.target.id!=='settings-document')return;R.scrolls++;R.maxTravel=Math.max(R.maxTravel,Math.round(Math.abs(e.target.scrollTop-R.start)));};
		window.addEventListener('keydown',key,{capture:true,passive:true});window.addEventListener('scroll',scroll,true);
		R.stop=()=>{window.removeEventListener('keydown',key,{capture:true,passive:true});window.removeEventListener('scroll',scroll,true);};
		return {tab:tab.id||tab.textContent.trim(),focused:document.activeElement===tab};
	});
	if (!pre.tab) { await t.check(`${surface}: AI & Providers shows a tab list in its first view`, false, 'no tab, other than a last one, in the first view'); return; }
	await t.page.keyboard.press('End');
	await f.waitForFunction(()=>new Promise(res=>{const sc=document.querySelector('#pm-settings-root #settings-document');let top=sc&&sc.scrollTop,t0=performance.now();const step=()=>{if(!sc)return res(true);if(sc.scrollTop!==top){top=sc.scrollTop;t0=performance.now();}if(performance.now()-t0>=1000)return res(true);requestAnimationFrame(step);};requestAnimationFrame(step);}),null,{timeout:15000}).catch(()=>{});
	const r = await f.evaluate(() => {
		const sc=document.querySelector('#pm-settings-root #settings-document'),R=window.__pscTab;R.stop();
		const a=document.activeElement,list=a&&a.closest?a.closest('[role="tablist"]'):null,tabs=list?[...list.querySelectorAll('[role="tab"]')]:[];
		const mgr=R.manager?sc.querySelector(`[data-pm51-manager="${CSS.escape(R.manager)}"]`):null;
		const all=mgr?[...mgr.querySelectorAll('[role="tablist"] [role="tab"]')]:tabs,last=all[all.length-1];
		const v=sc.getBoundingClientRect(),b=last?last.getBoundingClientRect():null;
		const {stop,...out}=R;
		return {...out,travel:Math.round(sc.scrollTop-R.start),lastSelected:!!last&&last.getAttribute('aria-selected')==='true',lastFocused:!!last&&a===last,
			lastInView:!!b&&b.height>0&&b.top>=v.top&&b.bottom<=v.bottom,focusAfter:a?a.tagName.toLowerCase()+(a.id?'#'+a.id:''):'none'};
	});
	t.log(`${surface} End on a focused tab (${pre.tab}): ${JSON.stringify(r)}`);
	for (const row of tabEndVerdict(r)) await t.check(`${surface}: ${row.name}`,row.ok,row.detail);
}
/* FO-245 round 5 (R144, exported for tools/settings-chapter.selftest.mjs): two more widgets whose own End/Home round
   4's listener overrode. Main is the reference for both; the precondition is the chapter still having unmounted pages at
   the key, which is when that listener acted.
   - The AI & Providers roster (.roster-list) is its own scroller. End after a click on a provider row scrolls the roster
     to its end (main: 487 px) and leaves the document where it was; r4 jumped the document 5,169-5,235 px to the
     chapter's end and left the roster where it was.
   - The General wallpaper picker's tiles (.wpk-row .wpk-tile, radios) take Home in a delegated keydown listener on
     document, which ran after r4's. After a real wheel down to the picker and a click on its first tile, Home keeps the
     focus on that tile and the document where it was (main: still at about 480 px); r4 jumped it to the chapter's top. */
export const GUARD_TRAVEL = 2;
export const ROSTER_MIN_ROOM = 40;
export const WPK_MIN_TOP = 100;
export function rosterEndVerdict(r) {
	const ok0 = !!r && !!r.key && r.focusRoster === true && r.coldAtKey > 0 && r.rosterRoom > ROSTER_MIN_ROOM;
	return [
		{ name: 'End reached a focused provider row of the roster, with room to scroll the roster and unmounted pages in the chapter', ok: ok0,
			detail: !r || !r.key ? 'no trusted End was seen on the roster' : `focus in the roster ${r.focusRoster} (${r.focusAtKey}), the roster could scroll ${r.rosterRoom} px more, ${r.coldAtKey} unmounted page(s) at the key` },
		{ name: `End on a provider row scrolls the roster to its end (within ${GUARD_TRAVEL} px)`, ok: ok0 && r.rosterEnd != null && r.rosterMax != null && r.rosterEnd > r.rosterStart && r.rosterMax - r.rosterEnd <= GUARD_TRAVEL,
			detail: r ? `the roster went from ${r.rosterStart} to ${r.rosterEnd} px of ${r.rosterMax}` : 'no reading' },
		{ name: `End on a provider row leaves the document where it was (within ${GUARD_TRAVEL} px)`, ok: ok0 && r.maxTravel != null && r.maxTravel <= GUARD_TRAVEL,
			detail: r ? `the document moved at most ${r.maxTravel} px (${r.scrolls} scroll events), ended ${r.travel} px from where it was` : 'no reading' }
	];
}
export function wpkHomeVerdict(r) {
	const ok0 = !!r && !!r.key && r.focusFirst === true && r.coldAtKey > 0 && r.startTop >= WPK_MIN_TOP && r.wheels > 0;
	return [
		{ name: 'Home reached the wallpaper picker\'s focused first tile after a real wheel, with the document scrolled and unmounted pages in the chapter', ok: ok0,
			detail: !r || !r.key ? 'no trusted Home was seen on the picker' : `focus on the first tile ${r.focusFirst}, the document at ${r.startTop} px after ${r.wheels} wheel step(s), ${r.coldAtKey} unmounted page(s) at the key` },
		{ name: 'Home on the first tile keeps the focus on it, chosen', ok: ok0 && r.firstFocused === true && r.firstChecked === true,
			detail: r ? `the first tile focused ${r.firstFocused}, checked ${r.firstChecked}; focus after on ${r.focusAfter}` : 'no reading' },
		{ name: `Home on the wallpaper picker leaves the document where it was (within ${GUARD_TRAVEL} px)`, ok: ok0 && r.maxTravel != null && r.maxTravel <= GUARD_TRAVEL,
			detail: r ? `the document moved at most ${r.maxTravel} px (${r.scrolls} scroll events), ended ${r.travel} px from where it was` : 'no reading' }
	];
}
/* one guard's page: the chapter fresh (entered from another one), at 1920x1080, with the run's motion */
async function guardPage(t, surface, from, to) {
	await t.viewport(1920, 1080); await muteSound(t.page);
	await t.emulate({reducedMotion:t.args.motion === 'reduce' ? 'reduce' : 'no-preference'});
	const f = await t.app.open({sandbox:surface === 'sandbox'});
	await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
	await f.locator(`#pm-settings-root .domain-link[data-domain="${from}"]`).first().click(); await t.page.waitForTimeout(700);
	await f.locator(`#pm-settings-root .domain-link[data-domain="${to}"]`).first().click();
	await f.waitForFunction((to)=>document.querySelector('#pm-settings-root .domain-link.active')?.dataset.domain===to,to,{timeout:5000}).catch(()=>{});
	await t.page.waitForTimeout(700);
	return f;
}
/* the document and the roster have both held still for a second of animation frames (a smooth End animates either) */
const guardSettle = (f) => f.waitForFunction(()=>new Promise(res=>{const sc=document.querySelector('#pm-settings-root #settings-document'),rl=sc&&sc.querySelector('.roster-list');const at=()=>`${sc&&sc.scrollTop}/${rl&&rl.scrollTop}`;let top=at(),t0=performance.now();const step=()=>{if(!sc)return res(true);if(at()!==top){top=at();t0=performance.now();}if(performance.now()-t0>=1000)return res(true);requestAnimationFrame(step);};requestAnimationFrame(step);}),null,{timeout:15000}).catch(()=>{});
export async function rosterEndRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	const f = await guardPage(t, surface, 'general', 'ai');
	/* a provider row of the roster in view (in the roster's and the document's view), but not its last */
	const found = await f.evaluate(() => {
		const sc=document.querySelector('#pm-settings-root #settings-document'),rl=sc&&sc.querySelector('.roster-list');
		if(!rl)return null;
		const v=sc.getBoundingClientRect(),w=rl.getBoundingClientRect(),rows=[...rl.querySelectorAll('.resource-row')];
		const row=rows.slice(0,-1).find(x=>{const r=x.getBoundingClientRect();return r.height>8&&r.top>=Math.max(v.top,w.top)&&r.bottom<=Math.min(v.bottom,w.bottom)&&getComputedStyle(x).visibility==='visible';});
		if(!row)return {rows:rows.length};
		row.setAttribute('data-psc-guard','');return {rows:rows.length};
	});
	if (!found || !(await f.locator('[data-psc-guard]').count())) { await t.check(`${surface}: AI & Providers shows a roster with a provider row in view`, false, found ? `${found.rows} provider rows, none but the last wholly in view` : 'no roster'); return; }
	await f.locator('[data-psc-guard]').click({position:{x:12,y:8}});
	await f.evaluate(()=>document.querySelector('[data-psc-guard]')?.removeAttribute('data-psc-guard'));
	await t.page.waitForTimeout(500);
	await f.evaluate(() => {
		const sc=document.querySelector('#pm-settings-root #settings-document'),rl=sc.querySelector('.roster-list');
		const R=window.__pscGuard={key:false,start:sc.scrollTop,maxTravel:0,scrolls:0};
		const key=e=>{if(e.key!=='End'||!e.isTrusted||R.key)return;R.key=true;const a=document.activeElement;R.focusRoster=!!a&&rl.contains(a);R.focusAtKey=a?a.tagName.toLowerCase()+'.'+String(a.className).split(' ')[0]:'none';R.coldAtKey=sc.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="false"]').length;R.rosterStart=Math.round(rl.scrollTop);R.rosterRoom=Math.round(rl.scrollHeight-rl.clientHeight-rl.scrollTop);R.start=sc.scrollTop;};
		const scroll=e=>{if(e.target.id!=='settings-document')return;R.scrolls++;R.maxTravel=Math.max(R.maxTravel,Math.round(Math.abs(e.target.scrollTop-R.start)));};
		window.addEventListener('keydown',key,{capture:true,passive:true});window.addEventListener('scroll',scroll,true);
		R.stop=()=>{window.removeEventListener('keydown',key,{capture:true,passive:true});window.removeEventListener('scroll',scroll,true);};
	});
	await t.page.keyboard.press('End');
	await guardSettle(f);
	const r = await f.evaluate(() => {
		const sc=document.querySelector('#pm-settings-root #settings-document'),rl=sc.querySelector('.roster-list'),R=window.__pscGuard;R.stop();
		const {stop,...out}=R;
		return {...out,travel:Math.round(sc.scrollTop-R.start),rosterEnd:rl?Math.round(rl.scrollTop):null,rosterMax:rl?Math.round(rl.scrollHeight-rl.clientHeight):null};
	});
	t.log(`${surface} End on the roster: ${JSON.stringify(r)}`);
	for (const row of rosterEndVerdict(r)) await t.check(`${surface}: ${row.name}`,row.ok,row.detail);
}
export async function wpkHomeRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	const f = await guardPage(t, surface, 'code', 'general');
	if (!(await f.locator('#pm-settings-root #settings-document .wpk-row .wpk-tile').count())) { await t.check(`${surface}: General shows the wallpaper picker`, false, 'no .wpk-row .wpk-tile in the document'); return; }
	/* a real wheel over the document, a notch at a time, until the picker's first tile is in view away from the edges */
	const box = await f.locator('#settings-document').boundingBox();
	await t.page.mouse.move(box.x+box.width*.6,box.y+box.height*.5);
	const inView = () => f.evaluate(() => {const d=document.querySelector('#pm-settings-root #settings-document'),v=d.getBoundingClientRect(),e=d.querySelector('.wpk-row .wpk-tile'),r=e&&e.getBoundingClientRect();return !!r&&r.height>4&&r.top>=v.top+80&&r.bottom<=v.bottom-80;});
	let wheels = 0;
	for (; wheels < 40 && !(await inView()); wheels++) { await t.page.mouse.wheel(0,120); await guardSettle(f); }
	if (!(await inView())) { await t.check(`${surface}: a real wheel brought the wallpaper picker's first tile into view`, false, `${wheels} wheel steps`); return; }
	await f.locator('#pm-settings-root #settings-document .wpk-row .wpk-tile').first().click({position:{x:12,y:12}});
	await t.page.waitForTimeout(500);
	await f.evaluate((wheels) => {
		const sc=document.querySelector('#pm-settings-root #settings-document'),first=sc.querySelector('.wpk-row .wpk-tile');
		const R=window.__pscGuard={key:false,wheels,start:sc.scrollTop,maxTravel:0,scrolls:0};
		const key=e=>{if(e.key!=='Home'||!e.isTrusted||R.key)return;R.key=true;R.focusFirst=document.activeElement===first;R.coldAtKey=sc.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="false"]').length;R.start=sc.scrollTop;R.startTop=Math.round(sc.scrollTop);};
		const scroll=e=>{if(e.target.id!=='settings-document')return;R.scrolls++;R.maxTravel=Math.max(R.maxTravel,Math.round(Math.abs(e.target.scrollTop-R.start)));};
		window.addEventListener('keydown',key,{capture:true,passive:true});window.addEventListener('scroll',scroll,true);
		R.stop=()=>{window.removeEventListener('keydown',key,{capture:true,passive:true});window.removeEventListener('scroll',scroll,true);};
	}, wheels);
	await t.page.keyboard.press('Home');
	await guardSettle(f);
	const r = await f.evaluate(() => {
		const sc=document.querySelector('#pm-settings-root #settings-document'),first=sc.querySelector('.wpk-row .wpk-tile'),R=window.__pscGuard;R.stop();
		const a=document.activeElement,{stop,...out}=R;
		return {...out,travel:Math.round(sc.scrollTop-R.start),firstFocused:!!first&&a===first,firstChecked:!!first&&first.getAttribute('aria-checked')==='true',focusAfter:a?a.tagName.toLowerCase()+'.'+String(a.className).split(' ')[0]:'none'};
	});
	t.log(`${surface} Home on the wallpaper picker: ${JSON.stringify(r)}`);
	for (const row of wpkHomeVerdict(r)) await t.check(`${surface}: ${row.name}`,row.ok,row.detail);
}
/* FO-245 round 6 (R145 medium, exported for tools/settings-chapter.selftest.mjs): End from a fresh Code & Tools lands at
   the end, as on main. Chrome animates a keyboard End (5-17 scroll events, even with scroll-behavior auto under Reduced
   Motion) toward the end it measured at the key. Round 3's cold-page mount ran in every scroll event, so on the round 5
   revert it mounted 2-5 pages during that animation; the document grew 1,100-1,700 px and the animation still stopped at
   the old end, 630-1,270 px short, in 26 of 112 presses. Main mounts only through its IntersectionObserver and always
   lands 45-46 px from the end (0 of 107 short). Round 6 mounts in the scroll event only while a wheel scroll is under way.
   Each press: Code & Tools entered fresh from General, then a trusted End (and Ctrl+End off Mac), alternately from a visible
   button of the first view (focused without scrolling) and after a trusted click on plain text (focus on the body). The press is
   judged once the document has held still for END_SETTLE ms (capped at END_CAP ms), and only when the chapter still had
   unmounted pages at the key and the key had more than END_MIN_TRAVEL px to go. END_GAP: main lands 45-46 px from the end in
   every press (R145, 107 presses, three hosts) and R145's shortest short landing was 634 px; 150 px is three times main's
   landing and under a quarter of the shortest short one. The revert is short in about one press in four, so END_REPS
   presses of each start (2 x END_REPS per surface) leave it green by chance about once in a hundred runs (0.77^16). */
export const END_GAP = 150;
export const END_REPS = 8;
export const END_MIN_TRAVEL = 5000;
export const END_SETTLE = 1500;
export const END_CAP = 6000;
export function endLandKey(platform, index) {
	return /^Mac/.test(platform) || index % 4 < 2 ? 'End' : 'Control+End';
}

export function endLandVerdict(list, want = 2 * END_REPS) {
	const presses = Array.isArray(list) ? list : [];
	const judgeable = (p) => !!p && p.key === true && p.coldAtKey > 0 && p.focusOk === true && p.travelWant > END_MIN_TRAVEL && p.settled === true && p.gap != null;
	const bad = presses.filter((p) => !judgeable(p));
	const ok0 = presses.length >= want && !bad.length;
	const short = presses.filter((p) => judgeable(p) && !(p.gap >= -2 && p.gap <= END_GAP));
	const line = (p) => p ? `${p.key === true ? p.keyName : 'no key'} from ${p.from}: gap ${p.gap} px${p.settled === true ? '' : ' (still scrolling at the cap)'}, ${p.coldAtKey} cold, ${p.travelWant} px to go, focus ${p.focusAtKey}` : 'no reading';
	return [
		{ name: `every End reached a fresh Code & Tools (unmounted pages at the key, more than ${END_MIN_TRAVEL} px to go, focus where the route put it) and its scroll settled`, ok: ok0,
			detail: presses.length < want ? `${presses.length} of ${want} presses read` : bad.length ? `not judgeable: ${bad.slice(0, 4).map(line).join('; ')}` : `${presses.length} presses, each with ${Math.min(...presses.map((p) => p.coldAtKey))}+ unmounted pages at the key` },
		{ name: `End from a fresh Code & Tools lands at the end: every press within ${END_GAP} px of it (main: 45-46 px)`, ok: ok0 && !short.length,
			detail: short.length ? `${short.length} of ${presses.length} short: ${short.slice(0, 6).map(line).join('; ')}` : `gaps ${presses.map((p) => p.gap).join(', ')} px` }
	];
}
export async function endLandRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	const f = await guardPage(t, surface, 'general', 'code');
	const platform = await f.evaluate(() => navigator.platform);
	t.log(`${surface} End landing browser platform: ${platform}`);
	const reps = Number(t.args.endReps || END_REPS), presses = [];
	for (let i = 0; i < 2 * reps; i++) {
		const from = i % 2 ? 'text' : 'button', keyName = endLandKey(platform, i);
		if (i) {
			await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(700);
			await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
			await f.waitForFunction(()=>document.querySelector('#pm-settings-root .domain-link.active')?.dataset.domain==='code',null,{timeout:5000}).catch(()=>{});
			await t.page.waitForTimeout(700);
		}
		if (from === 'button') {
			await f.evaluate(()=>{const d=document.querySelector('#pm-settings-root #settings-document'),v=d.getBoundingClientRect();const b=[...d.querySelectorAll('button')].find(x=>{const r=x.getBoundingClientRect();return r.height&&r.top>=v.top&&r.bottom<v.bottom&&getComputedStyle(x).visibility==='visible';});b?.focus({preventScroll:true});});
		} else {
			/* a trusted click on a plain paragraph of the first view (inside no control), which leaves focus on the body */
			const at=await f.evaluate(()=>{const d=document.querySelector('#pm-settings-root #settings-document'),v=d.getBoundingClientRect();const own='button, a, input, select, textarea, label, summary, [tabindex], [contenteditable], [data-action], .is-clickable, [role="button"], [role="link"], [role="tab"], [role="option"], [role="menuitem"], [role="switch"], [role="checkbox"]';const p=[...d.querySelectorAll('p')].find(x=>{const r=x.getBoundingClientRect(),o=x.closest(own);return r.height>8&&r.width>40&&r.top>=v.top+40&&r.bottom<v.bottom-40&&!(o&&d.contains(o))&&x.textContent.trim().length>8&&getComputedStyle(x).visibility==='visible';});if(!p)return null;p.setAttribute('data-psc-end-text','');const r=p.getBoundingClientRect();return {x:Math.min(20,r.width/3),y:r.height/2};});
			if (at) { await f.locator('[data-psc-end-text]').click({position:at}); await f.evaluate(()=>document.querySelector('[data-psc-end-text]')?.removeAttribute('data-psc-end-text')); await t.page.waitForTimeout(300); }
		}
		await f.evaluate((from) => {
			const sc=document.querySelector('#pm-settings-root #settings-document');
			const R=window.__pscEnd={key:false,from};
			const key=e=>{if(e.key!=='End'||!e.isTrusted||R.key)return;R.key=true;R.keyName=e.ctrlKey?'Control+End':'End';const a=document.activeElement;
				R.focusAtKey=a===document.body?'body':a?a.tagName.toLowerCase()+(sc.contains(a)?' in the document':' outside the document'):'none';
				R.focusOk=from==='button'?!!a&&a.tagName==='BUTTON'&&sc.contains(a):a===document.body;
				R.coldAtKey=sc.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="false"]').length;R.travelWant=Math.round(sc.scrollHeight-sc.clientHeight-sc.scrollTop);};
			window.addEventListener('keydown',key,{capture:true,passive:true});
			R.stop=()=>window.removeEventListener('keydown',key,{capture:true,passive:true});
		}, from);
		await t.page.keyboard.press(keyName);
		/* settled: the document has held still for END_SETTLE ms of animation frames, or END_CAP ms have passed */
		const settled = await f.evaluate(([quiet,cap])=>new Promise(res=>{const sc=document.querySelector('#pm-settings-root #settings-document'),t00=performance.now();let top=sc.scrollTop,h=sc.scrollHeight,t0=t00;const step=()=>{if(sc.scrollTop!==top||sc.scrollHeight!==h){top=sc.scrollTop;h=sc.scrollHeight;t0=performance.now();}if(performance.now()-t0>=quiet)return res(true);if(performance.now()-t00>=cap)return res(false);requestAnimationFrame(step);};requestAnimationFrame(step);}),[END_SETTLE,END_CAP]).catch(()=>false);
		const r = await f.evaluate((settled) => {
			const sc=document.querySelector('#pm-settings-root #settings-document'),R=window.__pscEnd;R.stop();
			const {stop,...out}=R;
			return {...out,settled,gap:Math.round(sc.scrollHeight-sc.clientHeight-sc.scrollTop),top:Math.round(sc.scrollTop)};
		}, settled);
		t.log(`${surface} End landing ${i + 1}/${2 * reps}: ${JSON.stringify(r)}`);
		presses.push(r);
	}
	for (const row of endLandVerdict(presses, 2 * reps)) await t.check(`${surface}: ${row.name}`,row.ok,row.detail);
}
/* the fling recorder, run in the page (exported for the selftest's route pins) */
export function armFling(route) {
	const root=document.getElementById('pm-settings-root'),deep=route!=='terminal',home=route==='home';
	const R=window.__pscFling={route,committed:false,sampled:false,pending:0,empty:[]};
	/* the route's target: Terminal look, or the chapter's last page (Containers) for the deep routes */
	const lastBody=()=>{const b=root.querySelectorAll('#settings-document [data-continuous-workspace-body]');return b[b.length-1]||null;};
	const firstBody=()=>root.querySelector('#settings-document [data-continuous-workspace-body]');
	const target=()=>home?firstBody()?.closest('[data-workspace-block]'):deep?lastBody()?.closest('[data-workspace-block]'):root.querySelector('#section-editor-terminal-look');
	const pendingNow=()=>deep?root.querySelectorAll('#settings-document [data-continuous-workspace-body][data-workspace-mounted="false"]').length:root.querySelectorAll('[data-o55-fill="pending"]').length;
	/* Home: its target, the first page, is mounted; what it must cross is the pages between, still unmounted */
	const targetPendingNow=()=>home?pendingNow()>0:deep?lastBody()?.dataset.workspaceMounted==='false':!!root.querySelector('#section-editor-terminal-look')?.querySelector('[data-o55-fill="pending"]');
	const mo=new MutationObserver(() => {
		if(root.querySelector('.domain-link.active')?.dataset.domain!=='code')return;
		mo.disconnect(); R.commitEpoch=performance.timeOrigin+performance.now(); const sc=root.querySelector('#settings-document'),sec=target();
		R.pending=pendingNow();
		R.targetPending=targetPendingNow();
		if(!sc||!sec){R.committed=true;return;}
		const b=sec.getBoundingClientRect(),v=sc.getBoundingClientRect();
		/* a deep wheel overshoots the bottom by a view, so it lands on the page's end whatever its estimate */
		R.start=sc.scrollTop;R.delta=deep?sc.scrollHeight-sc.scrollTop+sc.clientHeight:b.top-v.top+b.height*.55;R.height=sc.clientHeight;R.committed=true;
	});
	const scroll=e=>{
		const sc=e.target;
		/* R132-FOLLOWUPS 3: only a scroll after the delivered wheel arms (flingScrollGate mirrors this in node) */
		if(sc.id!=='settings-document'||!R.committed||!R.wheel||R.sampled||R.armed||Math.abs(sc.scrollTop-R.start)<R.height)return;
		R.armed=true;
		requestAnimationFrame(()=>{
			const v=sc.getBoundingClientRect();
			/* R97 #3: the sample is the first scroll frame, past one viewport, with the target in view (an
			   animated wheel scroll may cross the first viewport before it gets there) */
			const tb=target()?.getBoundingClientRect();
			R.targetInView=!!tb&&tb.height>0&&tb.bottom>v.top&&tb.top<v.bottom;
			if(!R.targetInView){R.armed=false;R.framesBefore=(R.framesBefore||0)+1;return;}
			R.top=sc.scrollTop;R.moved=R.wheelTop==null?null:R.top-R.wheelTop;
			R.empty=[...sc.querySelectorAll('[data-o55-fill="pending"]')].filter(l=>{
				if(l.closest('details:not([open])'))return false;
				const b=l.closest('[data-section-id]').getBoundingClientRect();
				if(!b.height||b.bottom<=v.top||b.top>=v.bottom)return false;
				const r=l.getBoundingClientRect();return r.height>0&&r.bottom>v.top&&r.top<v.bottom;
			}).map(l=>l.closest('[data-section-id]').dataset.sectionId);
			/* FO-245 r3: a page still unmounted in the view is empty too */
			for(const p of sc.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="false"]')){const r=p.getBoundingClientRect();if(r.height>0&&r.bottom>v.top&&r.top<v.bottom)R.empty.push('page:'+p.dataset.continuousWorkspaceBody);}
			R.sampled=true;
		});
	};
	/* R97 #3: the precondition is judged when the input is delivered, not at the commit: three driver steps lie
	   between them, and an idle fill that finishes in that gap leaves nothing for the input to test. Passive, so
	   the scroll keeps its own path. The End route's key is its input (trusted, End only). */
	const wheel=e=>{
		if(!e.isTrusted||(e.type==='keydown'&&e.key!==(home?'Home':'End')))return;
		if(!R.committed||R.wheel)return;
		/* Home starts where End left the page: the travel is measured from there */
		if(home)R.start=root.querySelector('#settings-document')?.scrollTop??R.start;
		// The event clock can lead the listener when the renderer is busy. Keep delivery time for the DOM probe.
		R.wheel=performance.now();R.wheelEpoch=performance.timeOrigin+e.timeStamp;R.wheelPending=pendingNow();
		R.wheelTargetPending=targetPendingNow();
		R.wheelTop=root.querySelector('#settings-document')?.scrollTop??null;
		const ae=document.activeElement;R.wheelFocus=ae===document.body?'body':ae?ae.tagName.toLowerCase()+(ae.id?'#'+ae.id:''):'none';
	};
	const kind=route==='end'||route==='end-text'||route==='home'?'keydown':'wheel';
	mo.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
	window.addEventListener('scroll',scroll,true);
	window.addEventListener(kind,wheel,{capture:true,passive:true});
	R.stop=()=>{mo.disconnect();window.removeEventListener('scroll',scroll,true);window.removeEventListener(kind,wheel,{capture:true,passive:true});};
}

export async function runFlingLook(t, f, look, surface, route, hooks = {}) {
	/* FO-245 round 2: one attempt drives the whole route (General, then Code, then the wheel or End) with a fresh page
	   recorder and film; retryFling can repeat a clean attempt within the same budget */
	const attempt=async(k)=>{
		await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(700);
		if (hooks.afterGeneral) await hooks.afterGeneral();
		const box = await f.locator('#settings-document').boundingBox();
		await f.evaluate(armFling, route);
		/* FO-245: the compositor's frames from before the press to after the fling settles (flingFilm) */
		const client=await t.page.context().newCDPSession(t.page);let film,frames=[];
		try {
			/* the capture-fidelity marker (flingFilm): top right of the top page, outside the settings document. A Web
			   Animations opacity animation, which the page's reduced-motion rules (animation: none) cannot stop. */
			await t.page.evaluate(()=>{const d=document.createElement('div');d.id='psc-vsync-marker';d.setAttribute('aria-hidden','true');Object.assign(d.style,{position:'fixed',right:'0',top:'0',width:'2px',height:'2px',background:'currentColor',willChange:'opacity',pointerEvents:'none',zIndex:'2147483647'});document.documentElement.appendChild(d);d.animate([{opacity:.5},{opacity:1}],{duration:1000,iterations:Infinity,direction:'alternate'});});
			film=await filmFling(client);
			await t.page.waitForFunction(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true)))));
			await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
			await f.waitForFunction(()=>window.__pscFling.committed,null,{timeout:5000});
			if(route==='end'){
				/* End scrolls the document from a control inside it: a visible button of the first view, focused without
				   scrolling (A245's route); the key is a trusted press */
				const focused=await f.evaluate(()=>{const d=document.querySelector('#pm-settings-root #settings-document'),v=d.getBoundingClientRect();const b=[...d.querySelectorAll('button')].find(x=>{const r=x.getBoundingClientRect();return r.height&&r.top>=v.top&&r.bottom<v.bottom&&getComputedStyle(x).visibility==='visible';});b?.focus({preventScroll:true});return !!b&&document.activeElement===b;});
				if(!focused)t.log(`${look} ${surface} end attempt ${k}: no visible button in the document to focus`);
				await t.page.keyboard.press('End');
			}else if(route==='end-text'){
				/* FO-245 r4 (R143 high): a trusted click on plain text of the first view (a paragraph inside no control),
				   which leaves focus on the page's body, then a trusted End */
				const at=await f.evaluate(()=>{const d=document.querySelector('#pm-settings-root #settings-document'),v=d.getBoundingClientRect();const own='button, a, input, select, textarea, label, summary, [tabindex], [contenteditable], [data-action], .is-clickable, [role="button"], [role="link"], [role="tab"], [role="option"], [role="menuitem"], [role="switch"], [role="checkbox"]';const p=[...d.querySelectorAll('p')].find(x=>{const r=x.getBoundingClientRect(),o=x.closest(own);return r.height>8&&r.width>40&&r.top>=v.top+40&&r.bottom<v.bottom-40&&!(o&&d.contains(o))&&x.textContent.trim().length>8&&getComputedStyle(x).visibility==='visible';});if(!p)return null;p.setAttribute('data-psc-text-click','');const r=p.getBoundingClientRect();return {x:Math.min(20,r.width/3),y:r.height/2};});
				if(at){await f.locator('[data-psc-text-click]').click({position:at});await f.evaluate(()=>document.querySelector('[data-psc-text-click]')?.removeAttribute('data-psc-text-click'));}
				else t.log(`${look} ${surface} end-text attempt ${k}: no plain text in the document's first view to click`);
				await t.page.keyboard.press('End');
			}else if(route==='home'){
				/* FO-248P: a trusted click on plain text of the first view (focus on the body: the chapter's own link, which
				   has the focus after its click, would keep End away from the document) and a trusted End; then, once the
				   document has held still for a second, a trusted click on plain text of that view at its position on the
				   screen (a locator click there can wait on actionability for good), then a trusted Home */
				const off=surface==='sandbox'?await f.frameElement().then((h)=>h.boundingBox()).catch(()=>null):null;
				const text=()=>f.evaluate(()=>{const d=document.querySelector('#pm-settings-root #settings-document'),v=d.getBoundingClientRect();const own='button, a, input, select, textarea, label, summary, [tabindex], [contenteditable], [data-action], .is-clickable, [role="button"], [role="link"], [role="tab"], [role="option"], [role="menuitem"], [role="switch"], [role="checkbox"]';const p=[...d.querySelectorAll('p')].find(x=>{const r=x.getBoundingClientRect(),o=x.closest(own);return r.height>8&&r.width>40&&r.top>=v.top+40&&r.bottom<v.bottom-40&&!(o&&d.contains(o))&&x.textContent.trim().length>8&&getComputedStyle(x).visibility==='visible';});if(!p)return null;const r=p.getBoundingClientRect();return {x:r.left+Math.min(20,r.width/3),y:r.top+r.height/2};});
				const first=await text();
				if(first){await t.page.mouse.click((off?off.x:0)+first.x,(off?off.y:0)+first.y);await t.page.waitForTimeout(200);}
				await t.page.keyboard.press('End');
				await f.waitForFunction(()=>new Promise(res=>{const sc=document.querySelector('#pm-settings-root #settings-document');let top=sc.scrollTop,t0=performance.now();const step=()=>{if(sc.scrollTop!==top){top=sc.scrollTop;t0=performance.now();}if(performance.now()-t0>=1000)return res(true);requestAnimationFrame(step);};requestAnimationFrame(step);}),null,{timeout:15000}).catch(()=>{});
				const at=await f.evaluate(()=>{const d=document.querySelector('#pm-settings-root #settings-document'),v=d.getBoundingClientRect();const own='button, a, input, select, textarea, label, summary, [tabindex], [contenteditable], [data-action], .is-clickable, [role="button"], [role="link"], [role="tab"], [role="option"], [role="menuitem"], [role="switch"], [role="checkbox"]';const p=[...d.querySelectorAll('p')].find(x=>{const r=x.getBoundingClientRect(),o=x.closest(own);return r.height>8&&r.width>40&&r.top>=v.top+40&&r.bottom<v.bottom-40&&!(o&&d.contains(o))&&x.textContent.trim().length>8&&getComputedStyle(x).visibility==='visible';});if(!p)return null;const r=p.getBoundingClientRect();return {x:r.left+Math.min(20,r.width/3),y:r.top+r.height/2};});
				if(at){await t.page.mouse.click((off?off.x:0)+at.x,(off?off.y:0)+at.y);await t.page.waitForTimeout(300);}
				else t.log(`${look} ${surface} home attempt ${k}: no plain text in the end view to click`);
				/* INTEG4 (FO-248K + FO-248P): FO-248K compares the frames from the chapter commit to the input with the source view.
				   For Home the source view is the end view End left, so its window opens here, once End has settled and the
				   text is clicked: the End before it is judged by the End routes. */
				await f.evaluate(()=>{window.__pscFling.commitEpoch=performance.timeOrigin+performance.now();});
				await t.page.keyboard.press('Home');
			}else{
				const [delta] = await Promise.all([
					f.evaluate(()=>window.__pscFling.delta),
					t.page.mouse.move(box.x+box.width*.65,box.y+box.height*.55)
				]);
				await t.page.mouse.wheel(0,Math.ceil(delta));
			}
			await f.waitForFunction(()=>window.__pscFling.sampled,null,{timeout:5000}).catch(()=>{});
			/* the fling has settled when the scroller has held still for a second of animation frames */
			await f.waitForFunction(()=>new Promise(res=>{const sc=document.querySelector('#pm-settings-root #settings-document');let top=sc&&sc.scrollTop,t0=performance.now();const step=()=>{if(!sc)return res(true);if(sc.scrollTop!==top){top=sc.scrollTop;t0=performance.now();}if(performance.now()-t0>=1000)return res(true);requestAnimationFrame(step);};requestAnimationFrame(step);}),null,{timeout:15000}).catch(()=>{});
			frames=await film.stop();
			const r=await f.evaluate(()=>{const {stop,...r}=window.__pscFling;return r;});
			const view=t.page.viewportSize()||await t.page.evaluate(()=>({width:innerWidth,height:innerHeight}));
			const px=flingFilm(frames,{box,view,wheel:r.wheelEpoch,commit:r.commitEpoch});
			t.log(`${look} ${surface} ${route} fling attempt ${k}: ${r.pending} pending at commit, target pending ${r.targetPending}; at input delivery ${r.wheel?`${r.wheelPending} pending, target pending ${r.wheelTargetPending}`:'no input seen'}; moved ${r.moved} px (${r.height} px view), target in view ${!!r.targetInView}; empty at scroll-frame rAF: ${r.empty.join(',')||'none'}; screencast: ${px.frames} frames, first destination ${px.dest?`frame ${px.dest.i} at ${px.dest.dt} ms${px.dest.bad?' BLANK':''}`:'none'}, ${px.bad?px.bad.length:'?'} blank or unfilled from the commit`);
			t.log(`${look} ${surface} ${route} attempt ${k} screencast timeline (document box ${[box.x,box.y,box.width,box.height].map(Math.round).join(',')}; ms from the input: band detail per mille, ! blank or unfilled): ${px.timeline||'none'}`);
			return {r,px};
		} finally {await t.page.evaluate(()=>document.getElementById('psc-vsync-marker')?.remove()).catch(()=>{});if(film&&!frames.length)await film.stop().catch(()=>{});await client.detach().catch(()=>{});await f.evaluate(()=>window.__pscFling.stop());}
	};
	const attempts=await retryFling(attempt,FLING_RETRY.attempts,route);
	for (const a of attempts) t.log(`${look} ${surface} ${route} fling attempt ${a.k}/${FLING_RETRY.attempts}: ${flingAttemptLine(a)}`);
	for (const row of flingRetryVerdict(attempts,route)) {
		const cpu = row.kind === CAPTURE_GAPS ? await captureCpuDetail(t.run?.chromeHost) : '';
		await t.check(`${look} ${surface}: ${row.name}`, row.ok, [row.detail, cpu].filter(Boolean).join('; '));
	}
}

/* FO-248P (R143 medium, exported for tools/settings-chapter.selftest.mjs): a held PageDown down a fresh Code & Tools. Each
   page edge the hold crosses showed its unmounted placeholder for a frame or more before main's observer mounted it (GTX
   1070 Ti films, 4 holds each: main 10, 7, 0 and 0 placeholder frames, FO-245 r6 35, 7, 6 and 0). PGDN: a hold is PGDN.keys
   trusted PageDowns PGDN.gap ms apart after a trusted click on plain text of the first view (focus on the body), filmed
   with the fling recorder's screencast and marker from before the first key until the document has held still for a
   second. Mid-scroll frames all show different rows, so a frame is not compared with the settled one: a placeholder
   frame is one where at least PGDN.empty of the four bands read under FLING_FILM.floor of edge detail (an unmounted page
   or an unfilled list covering half the view; rows, headings and section cards read 40-180 per mille, an empty band 0-9).
   Capture gaps are logged, not judged (unlike the fling routes): every page the hold reaches costs a mount frame of
   100-330 ms on the GTX 1070 Ti, on main as on the fix, and the screencast delivers nothing across it (21 of 26 fix
   attempts had a gap over three medians, with 0 placeholder frames in all 26), so a resolved capture would almost never
   come. A hold is judged on every frame captured from its first key on, and needs PGDN.minFrames of them; main shows
   11-72 placeholder frames in every hold (16 of 16), so the bound costs no power there. The gap stays on the tool-issues
   list (FO248P-PGDN-GAP). */
export const PGDN = { keys: 15, gap: 50, quarters: 4, empty: 2, holds: 2, minCold: 3, minViews: 5, minFrames: 60 };
export function pgdnFilm(frames, { box, view, key }) {
	if (!frames || !frames.length || !box || !view || !(key > 0)) return { frames: frames ? frames.length : 0 };
	const imgs = frames.map((f) => decodePng(f.png)), sx = imgs[0].width / view.width, sy = imgs[0].height / view.height, i = FLING_FILM.inset;
	const rect = { x0: Math.max(0, Math.round((box.x + i) * sx)), y0: Math.max(0, Math.round((box.y + i) * sy)), x1: Math.min(imgs[0].width, Math.round((box.x + box.width - i) * sx)), y1: Math.min(imgs[0].height, Math.round((box.y + box.height - i) * sy)) };
	const after = frames.map((f, k) => ({ i: k, dt: +(f.wall - key).toFixed(1) })).filter((r) => r.dt >= 0);
	/* INTEG4: the four quarters FO-248P measured (FO-248K's FLING_FILM.bands is 16, for the fling judge's narrow bands) */
	for (const r of after) { r.bands = filmBands(imgs[r.i], rect, PGDN.quarters); r.bad = r.bands.filter((v) => v < FLING_FILM.floor).length >= PGDN.empty; }
	const gaps = after.slice(1).map((r, k) => +(r.dt - after[k].dt).toFixed(1)), sorted = gaps.slice().sort((x, y) => x - y);
	const median = sorted.length ? sorted[sorted.length >> 1] : null, maxGap = gaps.length ? Math.max(...gaps) : null;
	return { frames: frames.length, after: after.length, median, maxGap, resolved: after.length >= PGDN.minFrames, bad: after.filter((r) => r.bad).map(({ i, dt, bands }) => ({ i, dt, bands })) };
}
export function pgdnAttempt(r, px) {
	const route = !!r && r.keys >= PGDN.keys && r.focus === 'body' && r.coldAtKey >= PGDN.minCold && r.mounted >= 1 && r.views >= PGDN.minViews && r.settled === true && Number.isInteger(r.coldFrames);
	const bad = px && Array.isArray(px.bad) ? px.bad.length : 0, resolved = !!px && px.resolved === true;
	return { route, bad, resolved, dom: route ? r.coldFrames : null, retry: route && bad === 0 && r.coldFrames === 0 && !resolved };
}
/* The pixel row is judged on the normal surface only. In T3's sandboxed preview (an opaque, out-of-process frame) the fix
   still shows short blank bands during a hold (0-17 frames per hold, 14 of 16 holds on the GTX 1070 Ti and Alexis) at
   frames where no unmounted page is in the view (the DOM row: 0 in 32 of 32 fix holds, main 2-15 in 30 of 32): the
   frame's compositor scrolls ahead of what its page has painted, which page code does not reach. Main shows the same
   bands there (0-60 per hold). They are logged in the detail and listed on the tool-issues list (FO248P-SANDBOX-PGDN). */
export function pgdnVerdict(list, { pixels = true } = {}) {
	const holds = Array.isArray(list) ? list : [];
	const line = (h) => `hold ${h.n}: ${h.r ? `${h.r.keys} PageDown, focus ${h.r.focus}, ${h.r.coldAtKey} cold at the first key, ${h.r.mounted} mounted, ${h.r.views} views, settled ${h.r.settled}` : 'no reading'}; ${h.attempts.map((a, k) => `attempt ${k + 1}: ${a.dom == null ? '' : `${a.dom} animation frame(s) with an unmounted page in view${a.dom ? ' [' + (a.r && a.r.coldAt || []).map(([t, p]) => `${t} ms ${p} %`).join('; ') + ']' : ''}, `}${a.px ? `${a.px.frames} frames, largest gap ${a.px.maxGap} ms / median ${a.px.median} ms, ${a.bad} placeholder frame(s)${a.bad ? ' [' + a.px.bad.slice(0, 4).map((b) => `${b.dt} ms ${b.bands.join('/')}`).join('; ') + ']' : ''}` : 'no film'}${a.resolved ? '' : `, under ${PGDN.minFrames} frames after the first key: not judged`}`).join('; ')}`;
	const judge = holds.length > 0 && holds.every((h) => h.attempts.length && h.attempts.every((a) => a.route));
	const clean = judge && holds.every((h) => h.attempts.every((a) => a.bad === 0) && h.attempts.at(-1).resolved);
	const dom = judge && holds.every((h) => h.attempts.every((a) => a.dom === 0));
	return [
		{ name: `every hold was ${PGDN.keys} trusted PageDowns from body focus over a fresh Code & Tools with ${PGDN.minCold}+ unmounted pages ahead, mounted a page and settled`, ok: judge, detail: holds.length ? holds.filter((h) => !h.attempts.every((a) => a.route)).slice(0, 3).map(line).join(' | ') || `${holds.length} holds` : 'no hold ran' },
		{ name: 'a held PageDown never draws an unmounted page: at no animation frame of the hold does one cover a tenth of the view (DOM, after the frame\'s scroll events)', ok: dom, detail: holds.map(line).join(' | ') || 'no hold ran' },
		...(pixels ? [{ name: 'a held PageDown never shows a page placeholder: no frame from the first key to the settled view has half its bands empty (screencast pixels)', ok: clean, detail: holds.map(line).join(' | ') || 'no hold ran' }] : [])
	];
}
export async function pgdnRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	await t.viewport(1920, 1080); await muteSound(t.page);
	await t.emulate({reducedMotion:t.args.motion === 'reduce' ? 'reduce' : 'no-preference'});
	const f = await t.app.open({sandbox:surface === 'sandbox'});
	await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
	const holds = [], per = Number(t.args.pgdnHolds || PGDN.holds);
	for (const look of flingLooks(t.args.flingLooks)) {
		await setLookBySetting(t,f,look);
		if (!(await guardPaintedLook(t,f,look,`${look} ${surface}`))) return;
		for (let n = 1; n <= per; n++) {
			const hold = { n: `${look} ${n}`, attempts: [], r: null };
			for (let k = 1; k <= FLING_RETRY.attempts; k++) {
				await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(700);
				const box = await f.locator('#settings-document').boundingBox();
				const client = await t.page.context().newCDPSession(t.page); let film, frames = [], r = null;
				try {
					await t.page.evaluate(()=>{const d=document.createElement('div');d.id='psc-vsync-marker';d.setAttribute('aria-hidden','true');Object.assign(d.style,{position:'fixed',right:'0',top:'0',width:'2px',height:'2px',background:'currentColor',willChange:'opacity',pointerEvents:'none',zIndex:'2147483647'});document.documentElement.appendChild(d);d.animate([{opacity:.5},{opacity:1}],{duration:1000,iterations:Infinity,direction:'alternate'});});
					await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
					await f.waitForFunction(()=>document.querySelector('#pm-settings-root .domain-link.active')?.dataset.domain==='code',null,{timeout:5000}).catch(()=>{});
					const off=surface==='sandbox'?await f.frameElement().then((h)=>h.boundingBox()).catch(()=>null):null;
					const at=await f.evaluate(()=>{const d=document.querySelector('#pm-settings-root #settings-document'),v=d.getBoundingClientRect();const own='button, a, input, select, textarea, label, summary, [tabindex], [contenteditable], [data-action], .is-clickable, [role="button"], [role="link"], [role="tab"], [role="option"], [role="menuitem"], [role="switch"], [role="checkbox"]';const p=[...d.querySelectorAll('p')].find(x=>{const r=x.getBoundingClientRect(),o=x.closest(own);return r.height>8&&r.width>40&&r.top>=v.top+40&&r.bottom<v.bottom-40&&!(o&&d.contains(o))&&x.textContent.trim().length>8&&getComputedStyle(x).visibility==='visible';});if(!p)return null;const r=p.getBoundingClientRect();return {x:r.left+Math.min(20,r.width/3),y:r.top+r.height/2};});
					if(at){await t.page.mouse.click((off?off.x:0)+at.x,(off?off.y:0)+at.y);await t.page.waitForTimeout(200);}
					await f.evaluate(()=>{const sc=document.querySelector('#pm-settings-root #settings-document');const R=window.__pscPgdn={keys:0,top0:sc.scrollTop};
						R.key=e=>{if(e.key!=='PageDown'||!e.isTrusted)return;if(!R.keys){R.at=performance.timeOrigin+performance.now();R.focus=document.activeElement===document.body?'body':(document.activeElement?.tagName||'none').toLowerCase();R.coldAtKey=sc.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="false"]').length;}R.keys++;};
						window.addEventListener('keydown',R.key,{capture:true,passive:true});
						/* DOM: at each animation frame of the hold (after its scroll events), an unmounted page covering a tenth of the view or more */
						R.cold=[];const tick=()=>{if(R.done)return;if(R.keys){const v=sc.getBoundingClientRect();let c=0;for(const b of sc.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="false"]')){const r=b.getBoundingClientRect();c+=Math.max(0,Math.min(r.bottom,v.bottom)-Math.max(r.top,v.top));}const p=Math.round(100*c/v.height);if(p>=10)R.cold.push([Math.round(performance.timeOrigin+performance.now()-R.at),p]);}requestAnimationFrame(tick);};requestAnimationFrame(tick);});
					film = await filmFling(client);
					await t.page.waitForFunction(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true)))));
					for (let q = 0; q < PGDN.keys; q++) { await t.page.keyboard.press('PageDown'); await t.page.waitForTimeout(PGDN.gap); }
					const settled = await f.waitForFunction(()=>new Promise(res=>{const sc=document.querySelector('#pm-settings-root #settings-document');let top=sc.scrollTop,t0=performance.now();const step=()=>{if(sc.scrollTop!==top){top=sc.scrollTop;t0=performance.now();}if(performance.now()-t0>=1000)return res(true);requestAnimationFrame(step);};requestAnimationFrame(step);}),null,{timeout:15000}).then(()=>true).catch(()=>false);
					frames = await film.stop();
					r = await f.evaluate((settled)=>{const sc=document.querySelector('#pm-settings-root #settings-document'),R=window.__pscPgdn;R.done=true;window.removeEventListener('keydown',R.key,{capture:true,passive:true});
						return {keys:R.keys,at:R.at,focus:R.focus,coldAtKey:R.coldAtKey,mounted:R.coldAtKey-sc.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="false"]').length,views:+((sc.scrollTop-R.top0)/sc.clientHeight).toFixed(1),top:Math.round(sc.scrollTop),settled,coldFrames:R.cold.length,coldAt:R.cold.slice(0,6)};},settled);
				} finally { await t.page.evaluate(()=>document.getElementById('psc-vsync-marker')?.remove()).catch(()=>{}); if (film && !frames.length) await film.stop().catch(()=>{}); await client.detach().catch(()=>{}); }
				const px = pgdnFilm(frames, { box, view: t.page.viewportSize(), key: r && r.at });
				const a = { px, r, ...pgdnAttempt(r, px) };
				hold.attempts.push(a); hold.r = r;
				t.log(`${look} ${surface} PageDown hold ${n} attempt ${k}: ${JSON.stringify(r)}; ${a.dom} animation frame(s) with an unmounted page in view; ${px.frames} frames, largest gap ${px.maxGap} ms / median ${px.median} ms, ${a.bad} placeholder frame(s)${a.bad ? ': ' + px.bad.slice(0, 6).map((b) => `${b.dt} ms ${b.bands.join('/')}`).join('; ') : ''}${a.retry ? ' -> retry' : ''}`);
				if (!a.retry) break;
			}
			holds.push(hold);
		}
	}
	const pixels = surface === 'normal';
	if (!pixels) t.log(`${surface} PageDown screencast, logged and not judged on this surface (pgdnVerdict): ${holds.map((h) => `${h.n} ${h.attempts.map((a) => a.bad).join('/')}`).join(', ')} placeholder frame(s) per attempt`);
	for (const row of pgdnVerdict(holds, { pixels })) await t.check(`${surface}: ${row.name}`,row.ok,row.detail);
}
/* One fling route (FLING_ROUTES) on one surface, in every fling look (exported for the selftest's live pins). */
/* FO-250: on macOS the settings document is a composited scroller, so the compositor draws a long wheel's destination
   from the last committed paint before the main thread's frame reaches it; on Windows and Linux at device scale 1 it
   scrolls by repainting, and the compositor shows nothing new until that frame. FLING_COMPOSITE forces the Mac's mode
   on any host (will-change: scroll-position on the document, nothing else), so the fling routes judge that path on the
   GTX 1070 Ti and the VM too: the FO-245 page blanks 9 to 16 frames there; on the Mac the style changes nothing. */
export const FLING_COMPOSITE = '#pm-settings-root #settings-document { will-change: scroll-position; }';
export async function flingRoute(t, surface, route, opts = {}) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	await t.viewport(1920, 1080); await muteSound(t.page);
	await t.emulate({reducedMotion:t.args.motion === 'reduce' ? 'reduce' : 'no-preference'});
	const f = await t.app.open({sandbox:surface === 'sandbox'});
	await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
	if (opts.composite) await f.addStyleTag({content:FLING_COMPOSITE});
	let composited = !opts.composite;
	/* FO-250: the first attempt checks, once the document exists, that the composite style took (INTEG4: the check runs
	   from runFlingLook's attempt, which FO-248K split out of this loop, right after its General click) */
	const hooks = {afterGeneral: async () => {
		if (composited) return;
		const wc = await f.evaluate(() => { const d = document.querySelector('#pm-settings-root #settings-document'); return d ? getComputedStyle(d).willChange : 'no document'; });
		composited = true;
		await t.check(`${surface}: the settings document is asked to scroll on the compositor (will-change ${wc})`, /scroll-position/.test(wc), wc);
	}};
	for (const look of flingLooks(t.args.flingLooks)) {
		await setLookBySetting(t,f,look);
		if (!(await guardPaintedLook(t,f,look,`${look} ${surface}`))) return;
		await runFlingLook(t, f, look, surface, route, hooks);
	}
}
/* FO-250 round 2 (R149 M1): the long-wheel jump must leave a wheel over a scroller inside the document that contains its
   overscroll to the browser, at that scroller's end too. Main: the AI & Providers and Memory rosters
   (overscroll-behavior: contain) keep a wheel at their end and the document stays still; 07f3a9ef1e jumped the document
   by the whole wheel. Per chapter: the first roster that scrolls and contains its overscroll is brought into view and
   scrolled to its end, then one trusted wheel of the document's view height goes over it. */
export async function rosterWheelRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	await t.viewport(1920, 1080); await muteSound(t.page);
	const f = await t.app.open({sandbox:surface === 'sandbox'});
	await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
	for (const chapter of ['ai', 'memory']) {
		const link = chapter === 'ai' ? f.locator('#pm-settings-root .domain-link[data-domain="ai"]').first()
			: f.locator('#pm-settings-root .domain-link').filter({hasText:/^\s*Memory/}).first();
		await link.click(); await t.page.waitForTimeout(900);
		/* Memory's roster (Personas) is on a page still unmounted at the arrival: bring each such page into view so the
		   page's own observer mounts it */
		for (let k = 0; k < 4; k++) {
			const cold = await f.evaluate(() => {
				const d = document.querySelector('#pm-settings-root #settings-document');
				if (!d || [...d.querySelectorAll('.roster-list')].some((x) => x.scrollHeight > x.clientHeight + 4)) return false;
				const b = d.querySelector('[data-continuous-workspace-body][data-workspace-mounted="false"]');
				if (!b) return false; b.scrollIntoView({block:'start', behavior:'instant'}); return true;
			});
			if (!cold) break;
			await t.page.waitForTimeout(700);
		}
		const set = await f.evaluate(() => {
			const d = document.querySelector('#pm-settings-root #settings-document');
			const l = d && [...d.querySelectorAll('.roster-list')].find((x) => { const cs = getComputedStyle(x); return x.scrollHeight > x.clientHeight + 4 && x.getBoundingClientRect().height > 80 && /^(auto|scroll|overlay)$/.test(cs.overflowY) && cs.overscrollBehaviorY !== 'auto'; });
			if (!l) return null;
			l.scrollIntoView({block:'center', behavior:'instant'}); l.scrollTop = l.scrollHeight;
			l.setAttribute('data-psc-roster-wheel', '');
			const R = window.__pscRosterWheel = {seen:false};
			window.addEventListener('wheel', (e) => { if (!R.seen && e.isTrusted) { R.seen = true; R.cancelable = e.cancelable; R.inRoster = l.contains(e.target); } }, {capture:true, passive:true, once:true});
			return {view:d.clientHeight, room:d.scrollHeight - d.clientHeight - d.scrollTop, overscroll:getComputedStyle(l).overscrollBehaviorY};
		});
		if (!set) { await t.check(`${surface} ${chapter}: a roster that scrolls and contains its overscroll is on the page`, false, 'none found'); continue; }
		await t.page.waitForTimeout(500);
		const before = await f.evaluate(() => { const l = document.querySelector('[data-psc-roster-wheel]'), d = document.querySelector('#pm-settings-root #settings-document'); return {doc:d.scrollTop, roster:l.scrollTop, end:l.scrollHeight - l.clientHeight}; });
		const b = await f.locator('[data-psc-roster-wheel]').boundingBox();
		await t.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
		await t.page.mouse.wheel(0, set.view);
		await t.page.waitForTimeout(900);
		const after = await f.evaluate(() => { const l = document.querySelector('[data-psc-roster-wheel]'), d = document.querySelector('#pm-settings-root #settings-document'); const r = {doc:d.scrollTop, roster:l.scrollTop, ...window.__pscRosterWheel}; l.removeAttribute('data-psc-roster-wheel'); return r; });
		const detail = `overscroll ${set.overscroll}; document view ${set.view} px, ${Math.round(set.room)} px of room below; roster ${Math.round(before.roster)}/${Math.round(before.end)} before; wheel ${set.view} px seen ${after.seen}, over the roster ${after.inRoster}, cancelable ${after.cancelable}; document ${Math.round(before.doc)} -> ${Math.round(after.doc)}`;
		t.log(`${surface} ${chapter} roster wheel: ${detail}`);
		await t.check(`${surface} ${chapter}: the roster was at its end with room in the document below, and the wheel went over it`, before.roster >= before.end - 1 && set.room >= set.view && after.seen && after.inRoster, detail);
		await t.check(`${surface} ${chapter}: a view-long wheel over a roster at its end leaves the document still (main's behaviour)`, Math.abs(after.doc - before.doc) < 1, detail);
	}
}
/* INTEG4 fix 1 (A152, exported for tools/settings-chapter.selftest.mjs): four rows from A152's real input sequences. */
async function a152Settings(t, surface) {
	await t.viewport(1920, 1080); await muteSound(t.page);
	const f = await t.app.open({sandbox:surface === 'sandbox'});
	await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
	return f;
}
async function a152Chapter(t, f, name, wait = 850) {
	await f.locator(`#pm-settings-root .domain-link[data-domain="${name}"]`).first().click();
	await f.waitForFunction((n) => document.querySelector('#pm-settings-root .domain-link.active')?.dataset.domain === n, name);
	await t.page.waitForTimeout(wait);
}
/* A152 M1: AI & Providers' roster filtered to one provider, and to none. The list contains its overscroll and has no
   range left; main keeps the document still under a view-long wheel over it (A152: integration moved it 912 px). */
export function filteredRosterVerdict(r) {
	const ran = !!r && r.css !== 'auto' && r.room >= r.view && r.range <= 1 && r.rows === r.wantRows && !!r.wheel && r.wheel.trusted && r.wheel.inside && r.wheel.dy >= r.view;
	return [
		{ name: `a view-long trusted wheel went over the roster filtered to ${r && r.wantRows} row(s) (contained, no range, a view of room in the document)`, ok: ran, detail: JSON.stringify(r) },
		{ name: `the document stays still under it (main's behaviour; A152 M1)`, ok: ran && Math.abs(r.after - r.before) < 1, detail: r ? `document ${r.before} -> ${r.after} px` : 'no reading' }
	];
}
export async function filteredRosterRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	const f = await a152Settings(t, surface);
	for (const want of [1, 0]) {
		await a152Chapter(t, f, 'general'); await a152Chapter(t, f, 'ai');
		const field = f.getByPlaceholder('Filter services').first();
		const list = field.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " resource-roster ")][1]').locator('.roster-list').first();
		await field.click();
		const text = want ? await list.evaluate((el) => {
			const rows = [...el.querySelectorAll('.resource-row')];
			return rows.map((r) => r.querySelector('.resource-row-name')?.textContent.trim()).filter(Boolean)
				.find((n) => rows.filter((r) => (r.textContent + ' ' + (r.dataset.filterText || '')).toLowerCase().includes(n.toLowerCase())).length === 1) || null;
		}) : 'zzqx no such provider';
		if (!text) { await t.check(`${surface}: a provider name that filters the roster to one row`, false, 'none'); continue; }
		await t.page.keyboard.type(text); await t.page.waitForTimeout(600);
		await list.evaluate((el) => el.scrollIntoView({block:'center', behavior:'instant'})); await t.page.waitForTimeout(500);
		const box = want ? await list.locator('.resource-row:visible').first().boundingBox() : await list.boundingBox();
		if (!box || box.height < 4) { await t.check(`${surface}: the roster filtered to ${want} row(s) has a hit area`, false, JSON.stringify(box)); continue; }
		await t.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		const before = await list.evaluate((el) => {
			const sc = document.querySelector('#pm-settings-root #settings-document');
			window.__pscRosterHit = null;
			window.addEventListener('wheel', (e) => { const r = window.__pscRosterHit = { trusted: e.isTrusted, inside: el.contains(e.target), cancelable: e.cancelable, dy: e.deltaY }; }, { capture:true, passive:true, once:true });
			return { before: sc.scrollTop, view: sc.clientHeight, room: sc.scrollHeight - sc.clientHeight - sc.scrollTop, range: el.scrollHeight - el.clientHeight, css: getComputedStyle(el).overscrollBehaviorY, rows: [...el.querySelectorAll('.resource-row')].filter((x) => x.offsetHeight > 0).length };
		});
		await t.page.mouse.wheel(0, before.view); await t.page.waitForTimeout(950);
		const after = await f.evaluate(() => ({ after: document.querySelector('#pm-settings-root #settings-document').scrollTop, wheel: window.__pscRosterHit }));
		const r = { filter: text, wantRows: want, ...before, ...after };
		t.log(`${surface} filtered roster (${want}): ${JSON.stringify(r)}`);
		for (const row of filteredRosterVerdict(r)) await t.check(`${surface}: ${row.name}`, row.ok, row.detail);
		await field.fill('');
	}
}
/* A152 M2: a provider row of AI & Providers keeps focus, the pointer is over the document outside the roster, a 120 px
   wheel, then End within 0-32 ms. Main: the document moves the wheel's 120 px and End scrolls the roster (A152:
   integration landed the document 5,235 px down). */
export const A152_FOCUSED = { delays: [0, 0, 0, 4, 12, 32], notch: 120 };
export function focusedEndVerdict(list) {
	const runs = Array.isArray(list) ? list : [];
	const ran = (r) => !!r && r.wheel && r.wheel.inDoc && !r.wheel.inList && r.key && r.key.focusInList && r.key.at >= r.wheel.at && r.key.at - r.wheel.at < 1000 && r.cold > 0 && r.range - r.child > 50 && r.room > 600;
	const kept = (r) => ran(r) && r.docEnd - r.parent >= -2 && r.docEnd - r.parent <= A152_FOCUSED.notch + 5 && r.range - r.listEnd <= 16;
	const line = (r) => r ? `${r.delay} ms: document ${r.parent} -> ${r.docEnd} px, roster ${r.child} -> ${r.listEnd} of ${r.range}` : 'no reading';
	return [
		{ name: `every trial was a trusted wheel over the document outside the roster, then End on a focused roster row with unmounted pages and room in both`, ok: runs.length > 0 && runs.every(ran), detail: runs.filter((r) => !ran(r)).map(line).join('; ') || `${runs.length} trials` },
		{ name: `the document moved only the wheel's distance and End scrolled the roster to its end (main's behaviour; A152 M2)`, ok: runs.length > 0 && runs.every(kept), detail: runs.map(line).join('; ') || 'no trial' }
	];
}
export async function focusedEndRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	const f = await a152Settings(t, surface), runs = [];
	for (const delay of A152_FOCUSED.delays) {
		await a152Chapter(t, f, 'general', 700); await a152Chapter(t, f, 'ai', 700);
		const row = f.locator('#settings-document .roster-list button.resource-row:visible').first();
		await row.click({position:{x:12, y:8}}); await t.page.waitForTimeout(450);
		const rb = await f.locator('#settings-document .roster-list').first().boundingBox(), db = await f.locator('#settings-document').boundingBox();
		await t.page.mouse.move(Math.min(db.x + db.width - 25, rb.x + rb.width + 80), Math.min(db.y + db.height - 70, Math.max(db.y + 75, rb.y + 75)));
		await f.evaluate(() => {
			const d = document.querySelector('#pm-settings-root #settings-document'), l = d.querySelector('.roster-list');
			const R = window.__pscFocused = { parent: d.scrollTop, room: d.scrollHeight - d.clientHeight - d.scrollTop, child: l.scrollTop, range: l.scrollHeight - l.clientHeight, cold: d.querySelectorAll('[data-workspace-mounted="false"]').length, wheel: null, key: null };
			const watch = (e) => { if (!e.isTrusted || (e.type === 'keydown' && e.key !== 'End')) return; const x = { at: e.timeStamp, inDoc: d.contains(e.target), inList: l.contains(e.target), focusInList: l.contains(document.activeElement) }; if (e.type === 'wheel') R.wheel = R.wheel || x; else R.key = R.key || x; };
			const opt = { capture:true, passive:true };
			window.addEventListener('wheel', watch, opt); window.addEventListener('keydown', watch, opt);
			R.close = () => { window.removeEventListener('wheel', watch, opt); window.removeEventListener('keydown', watch, opt); const { close, ...o } = R; return { ...o, docEnd: d.scrollTop, listEnd: l.scrollTop }; };
		});
		await t.page.mouse.wheel(0, A152_FOCUSED.notch);
		if (delay) await t.page.waitForTimeout(delay);
		await t.page.keyboard.press('End');
		await t.page.waitForTimeout(1400);
		const r = { delay, ...(await f.evaluate(() => window.__pscFocused.close())) };
		t.log(`${surface} focused roster End: ${JSON.stringify(r)}`);
		runs.push(r);
	}
	for (const row of focusedEndVerdict(runs)) await t.check(`${surface}: ${row.name}`, row.ok, row.detail);
}
/* A152 M3: End from a fresh Code & Tools after a click on plain text, then a trusted wheel up as soon as the bottom
   first appears: a view-scale wheel (0.8 of the view) and one 120 px notch. Main keeps every reversal (the document
   ends that far above the bottom); A152: integration snapped back to the bottom in 7 of 10 trials. */
export const A152_REVERSE = { trials: [['large', 0], ['large', 0], ['large', 16], ['notch', 0], ['notch', 0], ['notch', 16]], notch: 120, large: 0.8 };
export function reverseVerdict(list) {
	const runs = Array.isArray(list) ? list : [];
	const ran = (r) => !!r && r.key && r.key.focus === 'BODY' && r.key.cold > 0 && r.arrived && r.wheel && r.wheel.doc && r.wheel.dy < 0 && r.wheel.top > 4 * r.view && r.wheel.room < 160;
	const kept = (r) => ran(r) && r.finalRoom > r.dist * 0.55 && r.wheel.top - r.finalTop > r.dist * 0.45;
	const line = (r) => r ? `${r.kind} ${r.delay} ms: wheel ${r.dist} px at ${r.wheel ? r.wheel.top : '?'} (room ${r.wheel ? r.wheel.room : '?'}), final ${r.finalTop} (room ${r.finalRoom})` : 'no reading';
	return [
		{ name: 'every trial was a trusted End from body focus over unmounted pages, then a trusted wheel up over the document as the bottom first appeared', ok: runs.length > 0 && runs.every(ran), detail: runs.filter((r) => !ran(r)).map(line).join('; ') || `${runs.length} trials` },
		{ name: 'the wheel up after End holds: the document ends its distance above the bottom, no snap back (main\'s behaviour; A152 M3)', ok: runs.length > 0 && runs.every(kept), detail: runs.map(line).join('; ') || 'no trial' }
	];
}
export async function reverseAfterEndRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	const f = await a152Settings(t, surface), runs = [];
	for (const [kind, delay] of A152_REVERSE.trials) {
		await a152Chapter(t, f, 'general', 700); await a152Chapter(t, f, 'code', 300);
		const at = await f.evaluate(() => {
			const d = document.querySelector('#pm-settings-root #settings-document'), v = d.getBoundingClientRect();
			for (const p of d.querySelectorAll('p')) {
				const r = p.getBoundingClientRect(), a = p.closest('button,a,input,[data-action],[tabindex]');
				if (r.width < 40 || r.height < 8 || r.top < v.top + 35 || r.bottom > v.bottom - 35 || (a && d.contains(a))) continue;
				const x = r.left + 15, y = r.top + r.height / 2; if (p.contains(document.elementFromPoint(x, y))) return { x, y };
			}
			return null;
		});
		const off = surface === 'sandbox' ? await f.frameElement().then((h) => h.boundingBox()).catch(() => null) : null;
		if (!at) { runs.push(null); continue; }
		await t.page.mouse.click((off ? off.x : 0) + at.x, (off ? off.y : 0) + at.y);
		const rect = await f.locator('#settings-document').boundingBox();
		await t.page.mouse.move(rect.x + rect.width * .65, rect.y + rect.height * .55);
		await f.evaluate(() => {
			const d = document.querySelector('#pm-settings-root #settings-document');
			const R = window.__pscReverse = { key: null, wheel: null }, opt = { passive:true, capture:true };
			const rec = (e) => { if (!e.isTrusted || (e.key && e.key !== 'End')) return; const x = { top: d.scrollTop, room: d.scrollHeight - d.clientHeight - d.scrollTop, cold: d.querySelectorAll('[data-workspace-mounted="false"]').length, dy: e.deltaY, doc: d.contains(e.target), focus: document.activeElement.tagName }; if (e.type === 'keydown') R.key = R.key || x; else R.wheel = R.wheel || x; };
			window.addEventListener('keydown', rec, opt); window.addEventListener('wheel', rec, opt);
			R.close = () => { window.removeEventListener('keydown', rec, opt); window.removeEventListener('wheel', rec, opt); const { close, ...o } = R; return { ...o, view: d.clientHeight, finalTop: d.scrollTop, finalRoom: d.scrollHeight - d.clientHeight - d.scrollTop }; };
		});
		await t.page.waitForTimeout(180);
		await t.page.keyboard.press('End');
		const arrived = await f.waitForFunction(() => { const sc = document.querySelector('#pm-settings-root #settings-document'); return sc.scrollTop > 4 * sc.clientHeight && sc.scrollHeight - sc.clientHeight - sc.scrollTop < 150; }, null, { timeout: 2200 }).then(() => true, () => false);
		if (delay) await t.page.waitForTimeout(delay);
		const dist = kind === 'notch' ? A152_REVERSE.notch : Math.round(rect.height * A152_REVERSE.large);
		await t.page.mouse.wheel(0, -dist);
		await t.page.waitForTimeout(1250);
		const r = { kind, delay, dist, arrived, ...(await f.evaluate(() => window.__pscReverse.close())) };
		t.log(`${surface} reverse after End: ${JSON.stringify(r)}`);
		runs.push(r);
	}
	for (const row of reverseVerdict(runs)) await t.check(`${surface}: ${row.name}`, row.ok, row.detail);
}
/* A152 M4: alternating General and Code & Tools from the rail must let each replaced chapter document go. Each visit's
   page body is held by a WeakRef; after two collections, a body still alive but disconnected is a retained old root.
   Main retains none; A152: integration kept 47 roots (95,058 elements, +86 MiB) after 48 visits. */
export const A152_LIFETIME = { visits: 24, maxRoots: 2 };
export function lifetimeVerdict(r) {
	const ran = !!r && r.visits === A152_LIFETIME.visits && r.current >= 1 && r.gc === true;
	return [
		{ name: `${A152_LIFETIME.visits} chapter visits from the rail, each body held weakly, two collections after`, ok: ran, detail: JSON.stringify(r) },
		{ name: `replaced chapter documents are released: at most ${A152_LIFETIME.maxRoots} disconnected old chapter roots survive collection (main 0; A152 M4)`, ok: ran && r.oldRoots <= A152_LIFETIME.maxRoots, detail: r ? `${r.oldRoots} old roots, ${r.oldElements} elements, ${r.detached} detached bodies alive` : 'no reading' }
	];
}
export async function chapterLifetimeRoute(t, surface) {
	if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
	const f = await a152Settings(t, surface);
	await a152Chapter(t, f, 'general');
	/* the frame's own session when it runs out of process (the sandbox), so the collection reaches its heap */
	const c = await t.page.context().newCDPSession(f === t.page.mainFrame() ? t.page : f).catch(() => t.page.context().newCDPSession(t.page));
	let r = null;
	try {
		await f.evaluate(() => { window.__pscVisited = []; });
		for (let i = 1; i <= A152_LIFETIME.visits; i++) {
			await a152Chapter(t, f, i % 2 ? 'code' : 'general');
			await f.evaluate(() => { const b = document.querySelector('#pm-settings-root #workspace-stage [data-continuous-workspace-body]'); if (b) window.__pscVisited.push(new WeakRef(b)); });
		}
		await t.page.waitForTimeout(1500);
		const gc = await c.send('HeapProfiler.collectGarbage').then(() => c.send('HeapProfiler.collectGarbage')).then(() => true, () => false);
		r = { gc, ...(await f.evaluate(() => {
			let current = 0, detached = 0; const roots = new Set();
			for (const w of window.__pscVisited) { const el = w.deref(); if (el && el.isConnected) current++; else if (el) { detached++; roots.add(el.getRootNode()); } }
			let elements = 0; for (const x of roots) elements += x.querySelectorAll ? x.querySelectorAll('*').length : 0;
			return { visits: window.__pscVisited.length, current, detached, oldRoots: roots.size, oldElements: elements };
		})) };
	} finally { await c.detach().catch(() => {}); }
	t.log(`${surface} chapter lifetime: ${JSON.stringify(r)}`);
	for (const row of lifetimeVerdict(r)) await t.check(`${surface}: ${row.name}`, row.ok, row.detail);
}
for (const surface of ['normal', 'sandbox']) {
	tests[`R93 #4 a fast wheel into lower Code fills visible lists before the frame (${surface})`] = (t) => flingRoute(t, surface, 'terminal');
	/* FO-245 round 3 (A245 high finding 1): the deep routes onto the chapter's unmounted last page */
	tests[`R93 #4 a single long wheel to the bottom of a fresh Code & Tools paints its last page (${surface})`] = (t) => flingRoute(t, surface, 'wheel-bottom');
	/* FO-250: the same two routes with the document scrolling on the compositor, as it always does on macOS (FLING_COMPOSITE) */
	tests[`R93 #4 a fast wheel into lower Code fills visible lists before the frame, composited scrolling (${surface})`] = (t) => flingRoute(t, surface, 'terminal', {composite:true});
	tests[`R93 #4 a single long wheel to the bottom of a fresh Code & Tools paints its last page, composited scrolling (${surface})`] = (t) => flingRoute(t, surface, 'wheel-bottom', {composite:true});
	/* FO-250 round 2 (R149 M1): the long-wheel jump leaves a contained roster's wheel to the browser */
	tests[`R93 #4 a long wheel over a roster at its end leaves the document still (${surface})`] = (t) => rosterWheelRoute(t, surface);
	/* INTEG4 fix 1 (A152 M1-M4): the four real input sequences A152 found; red on 90286cf58f (page a61bcce0) */
	tests[`R93 #4 a long wheel over a roster filtered to one row or none leaves the document still (${surface})`] = (t) => filteredRosterRoute(t, surface);
	tests[`R93 #4 End on a focused roster row during a document wheel scrolls the roster, not the document (${surface})`] = (t) => focusedEndRoute(t, surface);
	tests[`R93 #4 a wheel up as End reaches the bottom holds (${surface})`] = (t) => reverseAfterEndRoute(t, surface);
	tests[`R93 #4 chapter switches release the replaced chapter documents (${surface})`] = (t) => chapterLifetimeRoute(t, surface);
	/* FO-245 round 5 (option C) reverted the End/Home key listener, so End smooth-scrolled through unmounted pages again,
	   as on main, and the two End fling routes waited for FO-248. FO-248P (2026-11-28): the document's own End scroll is
	   completed in one step at its first tick (46-first-screen.js, no key intercepted), so both are registered again. Red on
	   main 131f9e02 and on FO-245 r6 a9d3fd43 (13-26 blank frames per cell), green on FO-248P. */
	tests[`R93 #4 End from a fresh Code & Tools paints its last page (${surface})`] = (t) => flingRoute(t, surface, 'end');
	tests[`R93 #4 End after a text click from a fresh Code & Tools paints its last page (${surface})`] = (t) => flingRoute(t, surface, 'end-text');
	/* FO-248P: Home back up across the pages End left unmounted (FLING_ROUTES.home) */
	tests[`R93 #4 Home after End from a fresh Code & Tools paints its first page (${surface})`] = (t) => flingRoute(t, surface, 'home');
	/* FO-248P (R143 medium): a held PageDown mounts the pages it reaches before their frame (pgdnRoute) */
	tests[`R93 #4 a held PageDown down a fresh Code & Tools never shows a page placeholder (${surface})`] = (t) => pgdnRoute(t, surface);
	/* FO-245 round 4 (R143 medium 2) and round 5 (R144): guards that main's widget End/Home behaviour is back. Main is
	   the reference; the roster and picker guards are red on r4 (0f771f44a3), the tab guard on r3 (2df46917b3), whose
	   listeners overrode the widget; all three are green on main. */
	tests[`R93 #4 End on a focused tab keeps the tab's behaviour (${surface})`] = (t) => tabEndRoute(t, surface);
	tests[`R93 #4 End on the AI & Providers roster scrolls the roster (${surface})`] = (t) => rosterEndRoute(t, surface);
	tests[`R93 #4 Home on the General wallpaper picker keeps the document still (${surface})`] = (t) => wpkHomeRoute(t, surface);
	/* FO-245 round 6 (R145 medium): the document's own End lands at the end, as on main; red on the round 5 revert
	   (010495410f), whose scroll-event mount grew the document under Chrome's End animation */
	tests[`R93 #4 End from a fresh Code & Tools lands at the end (${surface})`] = (t) => endLandRoute(t, surface);
}
for (const surface of ['normal', 'sandbox']) {
	tests[`R93 #3 cross-chapter search does not fill the chapter being discarded (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080); await muteSound(t.page);
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
		await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(700);
		await f.evaluate(() => {
			const root = document.getElementById('pm-settings-root'), replace = Element.prototype.replaceChildren;
			const R = window.__pscCross = { ready:false, on:false, pending:0, fills:[], selected:false };
			Element.prototype.replaceChildren = function () {
				if (R.on && R.lists.includes(this)) R.fills.push(this.closest('[data-section-id]').dataset.sectionId);
				return replace.apply(this, arguments);
			};
			const mo = new MutationObserver(() => {
				if (root.querySelector('.domain-link.active')?.dataset.domain !== 'code') return;
				mo.disconnect(); R.lists = [...root.querySelectorAll('[data-o55-fill="pending"]')]; R.pending = R.lists.length;
				const input = root.querySelector('[data-global-search]');
				input.value = 'general.interaction.spellcheck-words'; input.dispatchEvent(new Event('input', {bubbles:true}));
				const result = document.querySelector('[data-search-result="setting"][data-search-payload*="general.interaction.spellcheck-words"]');
				R.on = true;
				try { if (result) {R.selected = true; result.click();} } finally {R.on = false; R.ready = true;}
			});
			mo.observe(root, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
			R.stop = () => {mo.disconnect(); Element.prototype.replaceChildren = replace;};
		});
		try {
			await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
			await f.waitForFunction(() => window.__pscCross.ready, null, {timeout:5000});
			await f.waitForFunction(() => document.querySelector('#pm-settings-root .domain-link.active')?.dataset.domain === 'general', null, {timeout:5000});
			const r = await f.evaluate(() => {const {stop, lists, ...r} = window.__pscCross; return r;});
			t.log(`${surface} cross-chapter: pending ${r.pending}; real search result selected ${r.selected}; outgoing fills ${r.fills.join(',') || 'none'}`);
			await t.check(`${surface}: cross-chapter search was selected while Code held pending sections`, r.selected && r.pending > 0, JSON.stringify(r));
			await t.check(`${surface}: revealing General synchronously fills no outgoing Code list`, r.fills.length === 0, r.fills.join(', '));
		} finally {await f.evaluate(() => window.__pscCross.stop());}
	};
}
for (const surface of ['normal', 'sandbox']) {
	tests[`R103 P1 search with About open fills only its remounted destination (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080); await muteSound(t.page);
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
		await f.evaluate(() => {
			const root = document.getElementById('pm-settings-root'), replace = Element.prototype.replaceChildren;
			const R = window.__pscAbout = { ready: false, on: false, pending: 0, targetPending: false, about: false, selected: false, fills: [] };
			Element.prototype.replaceChildren = function () {
				if (R.on && R.lists.includes(this)) R.fills.push(this.closest('[data-section-id]').dataset.sectionId);
				return replace.apply(this, arguments);
			};
			const mo = new MutationObserver(() => {
				if (root.querySelector('.domain-link.active')?.dataset.domain !== 'code') return;
				mo.disconnect(); R.stage = root.querySelector('[data-workspace-block]');
				root.querySelector('#workspace-stage .details-btn')?.click();
				R.about = !!root.querySelector('.document-layout.inspector-open');
				R.lists = [...root.querySelectorAll('[data-o55-fill="pending"]')]; R.pending = R.lists.length;
				R.targetPending = !!root.querySelector('#section-editor-terminal-look [data-o55-fill="pending"]');
				const input = root.querySelector('[data-global-search]');
				input.value = 'code.terminal.background-image'; input.dispatchEvent(new Event('input', { bubbles: true }));
				const result = document.querySelector('[data-search-result="setting"][data-search-payload*="code.terminal.background-image"]');
				R.on = true;
				try { if (result) { R.selected = true; result.click(); } } finally { R.on = false; R.ready = true; }
				R.remounted = R.stage !== root.querySelector('[data-workspace-block]');
			});
			mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
			R.stop = () => { mo.disconnect(); Element.prototype.replaceChildren = replace; };
		});
		try {
			await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
			await f.waitForFunction(() => window.__pscAbout.ready, null, { timeout: 5000 });
			const target = f.locator('[id="setting-code.terminal.background-image"]');
			await target.waitFor({ state: 'visible', timeout: 5000 });
			const r = await f.evaluate(() => { const { stop, lists, stage, ...r } = window.__pscAbout; return r; });
			t.log(`${surface} About search: pending ${r.pending}, target pending ${r.targetPending}, About open ${r.about}, remounted ${r.remounted}, outgoing fills ${r.fills.join(',') || 'none'}`);
			await t.check(`${surface}: search selected Terminal background while About was open and Terminal look pending`, r.about && r.selected && r.pending > 0 && r.targetPending, JSON.stringify(r));
			await t.check(`${surface}: About navigation remounted without filling discarded lists`, r.remounted && r.fills.length === 0, JSON.stringify(r));
			await t.check(`${surface}: the destination closes About and draws the target once`, await f.evaluate(() => !document.querySelector('#pm-settings-root .document-layout.inspector-open') && document.querySelectorAll('[id="setting-code.terminal.background-image"]').length === 1));
		} finally { await f.evaluate(() => window.__pscAbout.stop()); }
	};
}
for (const surface of ['normal', 'sandbox']) {
	tests[`R92 P1 More options measures filled sections before its opening animation (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080);
		await muteSound(t.page);
		const systemReduced = t.args.motion === 'reduce', appReduced = t.args.appReduce === '1';
		/* App-only explicitly clears system emulation; combined keeps both sources enabled (R106 T1). */
		await t.emulate({ reducedMotion: systemReduced ? 'reduce' : 'no-preference' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {});
		await f.locator('#tab-settings').click();
		await t.settle();
		await f.evaluate(on => window.PM12_KIMI.setSettingFromHost('general.visual.reduce-animations', on), appReduced);
		const sources = await f.evaluate(() => ({
			app: window.PM12_KIMI.getState().settings['general.visual.reduce-animations'] === true,
			system: matchMedia('(prefers-reduced-motion: reduce)').matches,
			attribute: document.documentElement.dataset.motion === 'reduced'
		}));
		await t.check(`${surface}: motion sources match app=${appReduced}, system=${systemReduced}`,
			sources.app === appReduced && sources.system === systemReduced && (!appReduced || sources.attribute), JSON.stringify(sources));
		for (const look of String(t.args.moreLooks || 'basic-dark,nier-light').split(',')) {
			await setLookBySetting(t, f, look);
			if (!(await guardPaintedLook(t, f, look, `${look} ${surface}`))) return;
			await moreOptionsRow(t, f, `${look} ${surface}`, systemReduced || appReduced);
		}
	};
}
for (const surface of ['normal', 'sandbox']) {
	tests[`R90 P1 Restore all defaults keeps its accepted transaction across a chapter change (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080);
		await muteSound(t.page);
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {});
		await f.locator('#tab-settings').click();
		await t.settle();
		await restoreAllRow(t, f, surface);
	};
}
for (const surface of ['normal', 'sandbox']) {
	tests[`L1 Tab and Shift+Tab from restored focus enter the section the first screen left unfilled (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080);
		await muteSound(t.page);
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {});
		await f.locator('#tab-settings').click();
		await t.settle();
		await t.page.waitForTimeout(1500);
		await setLookBySetting(t, f, 'basic-dark');
		if (!(await guardPaintedLook(t, f, 'basic-dark', `basic-dark ${surface}`))) return;
		await f.evaluate(PROBE);
		for (const dir of ['forward', 'backward']) await restoredFocusRow(t, f, surface, dir);
	};
}
for (const surface of ['normal', 'sandbox']) {
	tests[`R89 P1 a chapter chosen just before a Project change stays with its Project (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080);
		await muteSound(t.page);
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {});
		await f.locator('#tab-settings').click();
		await t.settle();
		await t.page.waitForTimeout(1500);
		await projectRow(t, f, surface);
	};
}
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-196 a Settings chapter switch leaves what can wait until the new chapter is on screen (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const want = String(t.args.looks || LOOKS.join(','));
		const looks = want === 'all' ? ALL : want.split(',').map((s) => s.trim()).filter(Boolean);
		const seq = String(t.args.seq || SEQ).split(',').map((p) => p.split(':'));
		await t.viewport(1920, 1080);
		await muteSound(t.page);
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {});
		await f.locator('#tab-settings').click();
		await t.settle();
		await t.page.waitForTimeout(1500);
		for (const look of looks) {
			await t.step(`${look} (${surface})`, async () => {
				await setLookBySetting(t, f, look);
				if (!(await guardPaintedLook(t, f, look, `${look} ${surface}`))) return;
				await f.evaluate(PROBE);
				await t.page.waitForTimeout(Number(t.args.settle ?? 4000));
				const rows = [];
				for (const [a, b] of seq) {
					if ((await f.evaluate(ACTIVE)) !== a) { await f.locator(`#pm-settings-root .domain-link[data-domain="${a}"]`).first().click(); await t.page.waitForTimeout(2000); }
					await press(t, f, b, { waitForHoverTags: true });
					await t.page.waitForTimeout(2500);
					/* the rest of the page is filled in idle slices: wait for the fill's own completion (R97 #6) */
					const fill = await f.evaluate(FILL_WAIT, FILL_LIMITS);
					const r = await f.evaluate(COLLECT);
					r.fill = fill;
					r.pair = `${a}->${b}`;
					rows.push(r);
					t.log(`${look} ${surface} ${r.pair}: fill ${r.fill.state} ${r.fill.waited} ms after the settle (last progress at ${r.fill.lastProgress} ms, ${r.fill.pending} lists pending${r.fill.dragged ? ', a drag was held' : ''}); release -> painted ${r.clickToPainted} ms (commit ${r.commit}, build task ${r.build ?? '-'} ms, ${r.elements} elements; rows ${r.rowsFirst ?? '-'} in the first frame (${r.rowsRaf} at its first animation-frame callback) of ${r.rowsEnd}); one-frame unlocks ${r.unlocks.length ? r.unlocks.join(',') : 'none'}; saves before paint ${r.savesBeforePaint}, place saved ${r.savedPlace}; tag walks of the old chapter ${r.walks} (before paint ${r.cleanupsBeforePaint}), old tagged nodes ${r.taggedAll} (sampled ${r.tagged}, still tagged ${r.taggedStill})`);
					await t.page.waitForTimeout(500);
				}
				const shown = rows.filter((r) => r.clickToPainted !== null && r.to === r.pair.split('->')[1]);
				await t.check(`${look} ${surface}: every switch showed its chapter (${shown.length}/${rows.length})`, shown.length === rows.length, 'a switch did not reach its chapter: nothing else can be judged for it');
				const unlocked = rows.filter((r) => r.unlocks.length);
				await t.check(`${look} ${surface}: no section of an arrival is laid out for one frame and skipped again`, !unlocked.length,
					unlocked.map((r) => `${r.pair}: ${r.unlocks.join(', ')}`).join('; '));
				const first = firstScreenVerdict(rows.filter((r) => r.to === 'code'));
				if (seq.some(([, to]) => to === 'code')) await t.check(`${look} ${surface}: an arrival at Code & Tools shows its first screen before the rest of its rows`, first.ok, first.detail);
				for (const row of arrivalVerdict(rows)) await t.check(`${look} ${surface}: ${row.name}`, row.ok, row.detail);
				const unsaved = rows.filter((r) => r.savedPlace < 1);
				await t.check(`${look} ${surface}: the new place is saved by collection after the fill's completion wait`, !unsaved.length, unsaved.map((r) => r.pair).join(', '));
				for (const row of hoverVerdict(rows)) await t.check(`${look} ${surface}: ${row.name}`, row.ok, row.detail);
			});
		}
	};
}
