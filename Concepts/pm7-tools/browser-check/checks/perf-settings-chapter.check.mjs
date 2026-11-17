// A Settings chapter switch builds and shows the new chapter without work that can wait (FO-196, the cost part; lane U,
// 2026-11-14). On main 9bfa159274 the old chapter stayed on screen 90-830 ms after the release (median 143 ms on an
// RTX 3080) while one task built the new chapter and the next frame styled and laid it out. Three parts of that are
// work the first frame does not need, and each is judged here by what runs when, not by a time (times differ by host):
//   unlock   a chapter is drawn new on every visit, so content-visibility's remembered sizes never helped: every far
//            section was a 460 px placeholder, Code & Tools' Terminal look (49 rows, 3,494 px) landed inside Chrome's
//            margin of the screen and was styled and laid out in the first frame, then skipped again in the next. Judged:
//            no section of an arrival turns relevant and is skipped again within a second ("one-frame unlocks").
//   save     navigation's saveState (two deep copies, the tome's write and its applyPaint) ran in the build task.
//            Judged: the tome's save does not run between the release and the new chapter's first painted frame, and
//            does run, with the new chapter as the place, by collection after the row-completion wait (10 s cap).
//   release  the hover tags of the removed chapter (about 2,000 nodes) were walked in the build task's microtasks.
//            Judged: the controller's cleanupRemoved does not run before that frame, and the old chapter's tagged nodes
//            have let go of their tags by that collection (after the initial 2.5 s settle and capped completion wait).
// "First painted frame": a message posted from the first animation frame that has the new chapter arrives once that
// frame's style, layout, paint and commit are over on the main thread. Each switch is a real held press on the chapter
// list (down, 90 ms, up); Settings acts on the click. Logged per switch, not judged: release -> painted, the build task
// ("finish" in the long animation frames), elements built.
//
// Looks: Basic Dark, Friendly Light, Retro Dark, Glass Dark, NieR Light by default (`--set looks=`, `all` for ten), each
// set through Settings' Theme rows and guarded as painted (helpers/settings-look.mjs). Switches: General, AI & Providers
// and Code & Tools, both ways (`--set seq=a:b,...`). Both surfaces (`--set sandbox=0` and `1`). `--set motion=reduce`
// runs under Reduced Motion. `--set settle=<ms>` waits after each look change (default 4000).
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';

const ALL = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];
const LOOKS = ['basic-dark', 'friendly-light', 'retro-dark', 'glass-dark', 'nier-light'];
const SEQ = 'general:code,code:ai,ai:general,general:ai,ai:code,code:general';

/* the page-side probe, installed once per page */
const PROBE = () => {
	if (window.__psc) return true;
	const root = document.getElementById('pm-settings-root');
	const sig = () => { const b = root.querySelector('#workspace-stage [data-workspace-block]'); return b ? b.getAttribute('data-workspace-block') : ''; };
	const P = window.__psc = { on: false, sig, cv: [], saves: [], cleanups: [], loaf: [] };
	const tick = () => {
		if (P.on && !P.first && sig() !== P.old) {
			P.first = performance.now();
			P.rows1 = root.querySelectorAll('#workspace-stage .setting-row').length;
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
		   be walked in idle time during the hold) */
		hover.cleanupRemoved = function (r) { if (P.on && r && (P.tagged || []).some((n) => n === r || (r.contains && r.contains(n)))) P.cleanups.push(performance.now()); return cleanup.apply(this, arguments); };
	}
	try { new PerformanceObserver((l) => { if (P.on) for (const e of l.getEntries()) for (const s of e.scripts || []) if (s.sourceFunctionName === 'finish') P.loaf.push(s.duration); }).observe({ type: 'long-animation-frame' }); } catch (e) { /* none */ }
	return true;
};
/* before a press: forget the last switch, remember a few tagged nodes of the chapter that is about to leave */
const ARM = () => {
	const P = window.__psc;
	Object.assign(P, { on: true, cv: [], saves: [], cleanups: [], loaf: [], click: 0, commit: 0, first: 0, painted: 0, old: P.sig() });
	P.tagged = [...document.querySelectorAll('#workspace-stage [data-pm-hover-bound="true"]')].slice(0, 6);
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
		cleanupsBeforePaint: P.cleanups.filter((c) => P.painted && c < P.painted).length,
		rowsFirst: P.rows1 || 0, rowsEnd: stage ? stage.querySelectorAll('.setting-row').length : 0,
		pendingLeft: document.querySelectorAll('#workspace-stage [data-o55-fill="pending"]').length,
		/* every row placement puts on the drawn plain page is drawn (a fill that cleared its marker but dropped rows) */
		missing: (() => {
			const body = document.querySelector('#workspace-stage [data-continuous-workspace-body][data-workspace-mounted="true"]');
			const ws = body && body.dataset.continuousWorkspaceBody, byId = (window.PM51 && PM51.placement && PM51.placement.byId) || {};
			const want = Object.values(byId).filter((e) => e && e.page && !e.hand && e.workspace === ws).map((e) => e.id);
			return { ws, want: want.length, gone: want.filter((id) => !body.querySelector(`[id="setting-${CSS.escape(id)}"]`)).slice(0, 6) };
		})(),
		dupIds: (() => { const ids = [...document.querySelectorAll('#workspace-stage [id^="setting-"]')].map((n) => n.id); return ids.length - new Set(ids).size; })(),
		taggedStill: (P.tagged || []).filter((n) => !n.isConnected && n.getAttribute('data-pm-hover-bound') === 'true').length,
		tagged: (P.tagged || []).length
	};
};
const ACTIVE = () => (document.querySelector('#pm-settings-root .domain-link.active') || {}).dataset?.domain || '';

async function press(t, f, domain) {
	const box = await f.locator(`#pm-settings-root .domain-link[data-domain="${domain}"]`).first().boundingBox();
	if (!box) throw new Error(`no chapter link for ${domain}`);
	await t.page.mouse.move(Math.round(box.x + Math.min(box.width / 2, 60)), Math.round(box.y + box.height / 2));
	await t.page.waitForTimeout(300);
	const armed = await f.evaluate(ARM);
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

/* R90 P1: the restore transaction replaces storage. A waiting place save must run BEFORE it, or it puts the old
   settings/history back afterwards. Accept the existing Reset all to defaults confirmation at chapter commit,
   before a frame/idle callback can run (the same fast-action boundary as R89 P1). Observe scheduling/cancellation;
   never hold, replace or invoke a scheduled callback. Main saves eagerly, so its control must have saved Code already. */
const ARM_RESTORE = (id) => {
	const tome = window.PM7_SETTINGS_TOME, root = document.getElementById('pm-settings-root');
	const R = window.__pscRestore = { scheduled: 0, pendingAtAccept: 0, pendingAtRestore: 0, accepted: false, result: null, saves: [] };
	const pending = new Set(), raf = window.requestAnimationFrame, caf = window.cancelAnimationFrame;
	const idle = window.requestIdleCallback, cancelIdle = window.cancelIdleCallback, save = tome.save, restore = tome.restoreProjectDefaults;
	const watch = (fn) => typeof fn === 'function' && (fn.name === 'saveNavigationNow' || /\bnavigationSaveJob\b/.test(Function.prototype.toString.call(fn)));
	window.requestAnimationFrame = function (fn) {
		if (!watch(fn)) return raf.apply(this, arguments);
		let ticket = raf.call(this, (stamp) => { pending.delete('frame:' + ticket); fn(stamp); });
		pending.add('frame:' + ticket); R.scheduled++; return ticket;
	};
	window.cancelAnimationFrame = function (ticket) { pending.delete('frame:' + ticket); return caf.apply(this, arguments); };
	if (idle) window.requestIdleCallback = function (fn, opts) {
		if (!watch(fn)) return idle.apply(this, arguments);
		let ticket = idle.call(this, (deadline) => { pending.delete('idle:' + ticket); fn(deadline); }, opts);
		pending.add('idle:' + ticket); R.scheduled++; return ticket;
	};
	if (cancelIdle) window.cancelIdleCallback = function (ticket) { pending.delete('idle:' + ticket); return cancelIdle.apply(this, arguments); };
	tome.save = function (snap) { R.saves.push(snap && snap.domain); return save.apply(this, arguments); };
	tome.restoreProjectDefaults = function () {
		R.pendingAtRestore = pending.size;
		R.before = tome.projectSnapshot(tome.project().id);
		R.result = restore.apply(this, arguments);
		R.restored = tome.projectSnapshot(tome.project().id);
		return R.result;
	};
	const mo = new MutationObserver(() => {
		if (root.querySelector('.domain-link.active')?.dataset.domain !== 'code') return;
		mo.disconnect();
		/* This is the product's existing action/confirmation, not a call to the restore implementation. */
		window.PM12_KIMI.dispatchAction('pm51-all-reset');
		const button = document.querySelector('.overlay [role="dialog"][aria-label="Reset every setting to its default?"] button[type="submit"]');
		R.pendingAtAccept = pending.size;
		R.eagerAtAccept = R.saves.includes('code');
		const s = window.PM12_KIMI.getState();
		R.place = { domain: s.domain, workspace: s.workspace, activeSection: s.activeSection };
		R.changedAtAccept = !!s.changed[id] && s.settings[id] === 20;
		if (button) { R.accepted = true; button.click(); }
	});
	mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
	R.stop = () => {
		mo.disconnect(); window.requestAnimationFrame = raf; window.cancelAnimationFrame = caf;
		if (idle) window.requestIdleCallback = idle;
		if (cancelIdle) window.cancelIdleCallback = cancelIdle;
		tome.save = save; tome.restoreProjectDefaults = restore;
	};
};
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
		t.log(`${surface} R90 P1: ${r.scheduled} navigation callbacks scheduled, ${r.pendingAtAccept} pending at acceptance, ${r.pendingAtRestore} at transaction; main's eager-save control ${!!r.eagerAtAccept}; place ${JSON.stringify(r.place)}`);
		await t.check(`${surface}: could judge restore-all: changed Text Size and accepted the existing confirmation`, r.accepted && r.changedAtAccept, JSON.stringify(r));
		await t.check(`${surface}: could judge restore-all: navigation save is still pending at acceptance (main control: already saved eagerly)`, r.scheduled > 0 ? r.pendingAtAccept > 0 : r.eagerAtAccept === true, JSON.stringify(r));
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
		/* Native Reduced Motion has no animation; toggle is delivered after its default action/fill. */
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) d.addEventListener('toggle', () => queueMicrotask(() => collect(d.querySelector(':scope > .pm51-advanced-body'))), { once: true });
	};
	window.addEventListener('click', click, true);
	Element.prototype.animate = function () {
		const a = animate.apply(this, arguments);
		if (R.clicked && this.matches('.pm51-advanced-body')) {
			R.animations++; R.endpoint = parseFloat(a.effect.getKeyframes().at(-1).height);
			a.finished.then(() => queueMicrotask(() => collect(this)), () => { R.cancelled = true; R.done = true; });
		}
		return a;
	};
	R.stop = () => { window.removeEventListener('click', click, true); Element.prototype.animate = animate; };
};
async function moreOptionsRow(t, f, label, reduced) {
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
		await t.check(`${label}: the opening finished with all rows filled`, r.done && !r.cancelled && r.pendingEnd === 0 && r.rows > 0, JSON.stringify(r));
		await t.check(`${label}: ${reduced ? 'Reduced Motion uses native opening' : 'the animation ends at the filled body\'s natural height'}`, reduced ? r.animations === 0 : r.animations === 1 && Math.abs(r.endpoint - r.natural) <= 1, `endpoint ${r.endpoint}; natural ${r.natural}; animations ${r.animations}`);
		await t.check(`${label}: no row is clipped by the opening's final height`, r.done && r.rows > 0 && r.clipped?.length === 0, JSON.stringify(r.clipped || []) + (r.done ? '' : '; opening did not finish'));
	} finally { await f.evaluate(() => window.__pscMore.stop()); }
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`R92 P1 More options measures filled sections before its opening animation (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080);
		await muteSound(t.page);
		const reduced = t.args.motion === 'reduce';
		await t.emulate({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout().catch(() => {});
		await f.locator('#tab-settings').click();
		await t.settle();
		for (const look of String(t.args.moreLooks || 'basic-dark,nier-light').split(',')) {
			await setLookBySetting(t, f, look);
			if (!(await guardPaintedLook(t, f, look, `${look} ${surface}`))) return;
			await moreOptionsRow(t, f, `${look} ${surface}`, reduced);
		}
	};
}
for (const surface of ['normal', 'sandbox']) {
	tests[`R90 P1 Restore all defaults wins over a pending chapter save (${surface})`] = async (t) => {
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
					await press(t, f, b);
					await t.page.waitForTimeout(2500);
					/* the rest of the page is filled in idle slices: wait for that, with a generous cap */
					await f.waitForFunction(() => !document.querySelector('#workspace-stage [data-o55-fill="pending"]'), null, { timeout: 10000 }).catch(() => {});
					const r = await f.evaluate(COLLECT);
					r.pair = `${a}->${b}`;
					rows.push(r);
					t.log(`${look} ${surface} ${r.pair}: release -> painted ${r.clickToPainted} ms (commit ${r.commit}, build task ${r.build ?? '-'} ms, ${r.elements} elements; rows ${r.rowsFirst} in the first frame of ${r.rowsEnd}); one-frame unlocks ${r.unlocks.length ? r.unlocks.join(',') : 'none'}; saves before paint ${r.savesBeforePaint}, place saved ${r.savedPlace}; tag walks before paint ${r.cleanupsBeforePaint}, old tagged nodes still tagged ${r.taggedStill}/${r.tagged}`);
					await t.page.waitForTimeout(500);
				}
				const shown = rows.filter((r) => r.clickToPainted !== null && r.to === r.pair.split('->')[1]);
				await t.check(`${look} ${surface}: every switch showed its chapter (${shown.length}/${rows.length})`, shown.length === rows.length, 'a switch did not reach its chapter: nothing else can be judged for it');
				const unlocked = rows.filter((r) => r.unlocks.length);
				await t.check(`${look} ${surface}: no section of an arrival is laid out for one frame and skipped again`, !unlocked.length,
					unlocked.map((r) => `${r.pair}: ${r.unlocks.join(', ')}`).join('; '));
				const saved = rows.filter((r) => r.savesBeforePaint > 0);
				await t.check(`${look} ${surface}: the place is not saved before the new chapter's first frame`, !saved.length, saved.map((r) => `${r.pair}: ${r.savesBeforePaint} save(s) before the frame`).join('; '));
				const code = rows.filter((r) => r.to === 'code');
				const whole = code.filter((r) => r.rowsEnd > 0 && r.rowsFirst >= r.rowsEnd);
				await t.check(`${look} ${surface}: an arrival at Code & Tools shows its first screen before the rest of its rows`, code.length > 0 && !whole.length,
					whole.map((r) => `${r.pair}: all ${r.rowsEnd} rows were built for the first frame`).join('; ') || 'no arrival at Code & Tools');
				const left = rows.filter((r) => r.pendingLeft > 0 || r.dupIds > 0 || (r.missing && r.missing.gone.length) || (r.to === 'code' && !(r.missing && r.missing.want)));
				await t.check(`${look} ${surface}: after each arrival every row placement puts on the page is drawn, once`, !left.length,
					left.map((r) => `${r.pair}: ${r.pendingLeft} row lists still pending, ${r.dupIds} duplicate row ids, missing ${r.missing ? r.missing.gone.join(', ') || 'none' : '?'} of ${r.missing ? r.missing.want : '?'} placed on ${r.missing ? r.missing.ws : '?'}`).join('; '));
				const unsaved = rows.filter((r) => r.savedPlace < 1);
				await t.check(`${look} ${surface}: the new place is saved by collection after the capped row-completion wait`, !unsaved.length, unsaved.map((r) => r.pair).join(', '));
				const walked = rows.filter((r) => r.cleanupsBeforePaint > 0);
				await t.check(`${look} ${surface}: the old chapter's hover tags are not walked before the new chapter's first frame`, !walked.length, walked.map((r) => `${r.pair}: ${r.cleanupsBeforePaint} walk(s)`).join('; '));
				const kept = rows.filter((r) => r.taggedStill > 0);
				await t.check(`${look} ${surface}: the old chapter's tagged nodes let go of their tags by collection after the capped row-completion wait`, !kept.length, kept.map((r) => `${r.pair}: ${r.taggedStill} of ${r.tagged}`).join('; '));
			});
		}
	};
}
