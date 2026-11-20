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
//            have let go of their tags by that collection (after the initial 2.5 s settle and capped completion wait).
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

/* R90 P1: accept the existing Reset all confirmation at chapter commit, then verify the accepted values,
   history/rollback maps and reading place survive reload. Navigation must already be saved eagerly, as on main
   (owner decision: C3 retired). The old deferred-save pages remain useful negative fixtures for this guard. */
const ARM_RESTORE = (id) => {
	const tome = window.PM7_SETTINGS_TOME, root = document.getElementById('pm-settings-root');
	const R = window.__pscRestore = { accepted: false, result: null, saves: [] };
	const save = tome.save, restore = tome.restoreProjectDefaults;
	tome.save = function (snap) { R.saves.push(snap && snap.domain); return save.apply(this, arguments); };
	tome.restoreProjectDefaults = function () {
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

export const tests = {};

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
			await t.page.keyboard.press('ControlOrMeta+A');
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
				await t.page.keyboard.press('ControlOrMeta+A');
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
for (const surface of ['normal', 'sandbox']) {
	tests[`R93 #4 a fast wheel into lower Code fills visible lists before the frame (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080); await muteSound(t.page);
		await t.emulate({reducedMotion:t.args.motion === 'reduce' ? 'reduce' : 'no-preference'});
		const f = await t.app.open({sandbox:surface === 'sandbox'});
		await t.app.resetLayout().catch(() => {}); await f.locator('#tab-settings').click(); await t.settle();
		for (const look of ['basic-dark','nier-light']) {
			await setLookBySetting(t,f,look);
			if (!(await guardPaintedLook(t,f,look,`${look} ${surface}`))) return;
			await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click(); await t.page.waitForTimeout(700);
			const box = await f.locator('#settings-document').boundingBox();
			await f.evaluate(() => {
				const root=document.getElementById('pm-settings-root');
				const R=window.__pscFling={committed:false,sampled:false,pending:0,empty:[]};
				const mo=new MutationObserver(() => {
					if(root.querySelector('.domain-link.active')?.dataset.domain!=='code')return;
					mo.disconnect(); const sc=root.querySelector('#settings-document'),sec=root.querySelector('#section-editor-terminal-look');
					R.pending=root.querySelectorAll('[data-o55-fill="pending"]').length;
					R.targetPending=!!sec?.querySelector('[data-o55-fill="pending"]');
					if(!sc||!sec){R.committed=true;return;}
					const b=sec.getBoundingClientRect(),v=sc.getBoundingClientRect();
					R.start=sc.scrollTop;R.delta=b.top-v.top+b.height*.55;R.height=sc.clientHeight;R.committed=true;
				});
				const scroll=e=>{
					const sc=e.target;
					if(!R.committed||R.sampled||R.armed||sc.id!=='settings-document'||Math.abs(sc.scrollTop-R.start)<R.height)return;
					R.armed=true;
					requestAnimationFrame(()=>{
						const v=sc.getBoundingClientRect();R.top=sc.scrollTop;R.moved=R.top-R.start;
						R.empty=[...sc.querySelectorAll('[data-o55-fill="pending"]')].filter(l=>{
							if(l.closest('details:not([open])'))return false;
							const b=l.closest('[data-section-id]').getBoundingClientRect();
							if(!b.height||b.bottom<=v.top||b.top>=v.bottom)return false;
							const r=l.getBoundingClientRect();return r.height>0&&r.bottom>v.top&&r.top<v.bottom;
						}).map(l=>l.closest('[data-section-id]').dataset.sectionId);
						R.sampled=true;
					});
				};
				mo.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
				window.addEventListener('scroll',scroll,true);
				R.stop=()=>{mo.disconnect();window.removeEventListener('scroll',scroll,true);};
			});
			try {
				await f.locator('#pm-settings-root .domain-link[data-domain="code"]').first().click();
				await f.waitForFunction(()=>window.__pscFling.committed,null,{timeout:5000});
				const delta=await f.evaluate(()=>window.__pscFling.delta);
				await t.page.mouse.move(box.x+box.width*.65,box.y+box.height*.55);
				await t.page.mouse.wheel(0,Math.ceil(delta));
				await f.waitForFunction(()=>window.__pscFling.sampled,null,{timeout:5000}).catch(()=>{});
				const r=await f.evaluate(()=>{const {stop,...r}=window.__pscFling;return r;});
				t.log(`${look} ${surface} fling: ${r.pending} lists pending at commit, target pending ${r.targetPending}; moved ${r.moved} px (${r.height} px view); empty visible lists at scroll-frame rAF: ${r.empty.join(',')||'none'}`);
				await t.check(`${look} ${surface}: fling began with Terminal look pending`,r.pending>0&&r.targetPending,JSON.stringify(r));
				await t.check(`${look} ${surface}: a real wheel crossed at least one viewport`,r.sampled&&r.moved>=r.height,JSON.stringify(r));
				await t.check(`${look} ${surface}: no visible list is empty at the scroll frame`,r.sampled&&r.empty.length===0,r.empty.join(',')||'no scroll-frame sample');
			} finally {await f.evaluate(()=>window.__pscFling.stop());}
		}
	};
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
				const code = rows.filter((r) => r.to === 'code');
				const whole = code.filter((r) => r.rowsEnd > 0 && r.rowsFirst >= r.rowsEnd);
				if (seq.some(([, to]) => to === 'code')) await t.check(`${look} ${surface}: an arrival at Code & Tools shows its first screen before the rest of its rows`, code.length > 0 && !whole.length,
					whole.map((r) => `${r.pair}: all ${r.rowsEnd} rows were built for the first frame`).join('; ') || 'no arrival at Code & Tools');
				const left = rows.filter((r) => r.pendingLeft > 0 || r.dupIds > 0 || (r.missing && r.missing.gone.length) || (r.to === 'code' && !(r.missing && r.missing.want)));
				await t.check(`${look} ${surface}: after each arrival every row in the rendered workspace model is drawn, once`, !left.length,
					left.map((r) => `${r.pair}: ${r.pendingLeft} row lists still pending, ${r.dupIds} duplicate row ids, missing ${r.missing ? r.missing.gone.join(', ') || 'none' : '?'} of ${r.missing ? r.missing.want : '?'} modeled on ${r.missing ? r.missing.ws : '?'}`).join('; '));
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
