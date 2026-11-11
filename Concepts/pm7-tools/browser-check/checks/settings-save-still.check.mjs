// FO-130 (Jared 2026-11-09, item 4: "When you toggle a setting, it shakes the whole page."). A switch on a manager page
// (an AI service's "Use this service", Web search, Memory, Project history, Backups) saves through the manager, which
// redraws its page (PM51.refresh). The page body used to be replaced: about 460 ms after the click every section on it
// played its entrance again (sectionReveal: a fade from .55 and a 10 px drop), the page index replayed its open
// (pm51IndexOpen), and the clicked switch was a new element (focus and hover lost, its own slide never ran).
// Each case clicks the switch off and back on, at 860x900 and 1920x1080, on each surface, and asserts for 1100 ms after
// each click: no entrance animation starts in Settings; the switch is still the same element, keeps the key focus and
// shows the new state; the switch's section and a row below it neither move (painted box, read in a task queued from
// requestAnimationFrame, so after the frame's paint) nor fade (computed opacity of the section and its ancestors); no
// layout shift inside Settings. A second test runs four cases in each of the ten looks at 1280x900.
// --set size=860x900 --set cases=providers,web --set looks=nier-dark (or none) limit the matrix; --set probe=1 logs reads.
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[860, 900], [1920, 1080]];
const ENTR = '^(pageIn|sectionReveal|pmSettingsTabSwap[AB]|pm51IndexOpen)$';
const CASES = {
	// Off swaps the service's "This service" card for "This service is off" with Turn on (designed): the page gets
	// shorter, so only the entrance, the fade and layout shifts are judged, and Turn on brings the switch back
	providers: { domain: 'ai', ws: 'providers', select: 'claude-code', sw: '.o55-scoped[data-setting-id="ai.models.provider-enabled"] .toggle[role="switch"]', reshapes: '[data-continuous-workspace-body="providers"] [data-action="pm51-providers-turn-on"]' },
	web: { domain: 'ai', ws: 'web', sw: '.toggle[role="switch"][data-setting="web.providers.web-search-enable"]' },
	memory: { domain: 'memory', ws: 'context-memory', sw: '.toggle[role="switch"][data-setting="memory.retention.enabled"]' },
	history: { domain: 'projects', ws: 'project-history', sw: '[data-setting-id="general.interaction.history-approved-only"] .toggle[role="switch"]' },
	backup: { domain: 'system', ws: 'backup', sw: '.toggle[role="switch"][data-action="pm51-backup-auto"]' },
};

// in the app frame: mark the case's switch, arm the recorders. Returns null when the switch is not drawn.
const ARM = ({ ws, sw, entr }) => {
	const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
	if (!body) return { err: `no ${ws} body` };
	const vis = (x) => x.getClientRects().length && x.getAttribute('aria-disabled') !== 'true';
	const list = [...body.querySelectorAll(sw)];
	const el = list.find(vis);
	if (!el) return { err: `no switch in ${ws} (${list.length} drawn)` };
	document.querySelectorAll('[data-fo130]').forEach((x) => x.removeAttribute('data-fo130'));
	el.setAttribute('data-fo130', 'switch');
	el.scrollIntoView({ block: 'center' });
	// the switch's section, and a row after the switch's row on the page, found again by id each frame (a replaced page
	// draws new elements with the same ids)
	const sec = el.closest('[id^="section-"]') || el.closest('.settings-section, .manager-section, .pm51-section, section') || body;
	// (a settings row, never an item of a list the switch filters, such as History's)
	const rows = [...body.querySelectorAll('.setting-row[data-setting-id], .setting-row[id]')].filter((r) => r.getClientRects().length);
	const own = el.closest('.setting-row, .pm51-row');
	const below = rows.slice(rows.indexOf(own) + 1)[0] || own || sec;
	const key = (n) => n.id ? `#${CSS.escape(n.id)}` : n.getAttribute('data-setting-id') ? `[data-continuous-workspace-body="${ws}"] [data-setting-id="${CSS.escape(n.getAttribute('data-setting-id'))}"]` : null;
	window.__fo130keys = { sec: key(sec), below: key(below) };
	sec.setAttribute('data-fo130-sec', ''); below.setAttribute('data-fo130-below', '');
	const re = new RegExp(entr);
	const S = window.__fo130 = { ent: [], shifts: 0, frames: [] };
	if (!window.__fo130armed) {
		window.__fo130armed = true;
		// a section's first reveal (one scrolled into view because the page got shorter) is not a replay: sectionReveal
		// counts only on a section that had already been revealed before the press (the same element, or one drawn again
		// with its id)
		document.addEventListener('animationstart', (e) => {
			const s = window.__fo130; if (!s || !s.on || !re.test(e.animationName) || !e.target.closest || !e.target.closest('#panel-settings')) return;
			if (e.animationName === 'sectionReveal' && !(s.revealed && s.revealed.has(e.target.id))) return;
			s.ent.push(`${e.animationName}@${(e.target.id || e.target.className || e.target.tagName).toString().slice(0, 60)}`);
		}, true);
		try {
			new PerformanceObserver((l) => { const s = window.__fo130; if (!s || !s.on) return; for (const en of l.getEntries()) if (!en.hadRecentInput && (en.sources || []).some((src) => src.node && src.node.closest && src.node.closest('#panel-settings'))) s.shifts += en.value; }).observe({ type: 'layout-shift', buffered: false });
		} catch (e) { /* no layout-shift entries in this browser */ }
	}
	return { ok: true, label: el.getAttribute('aria-label') || '', on: el.getAttribute('aria-checked') };
};
// start sampling: one read per frame, in a task queued from rAF (after that frame's paint)
const SAMPLE = (ms) => new Promise((resolve) => {
	const S = window.__fo130; S.on = true; S.ent = []; S.shifts = 0; S.frames = [];
	S.revealed = new Set([...document.querySelectorAll('#panel-settings .is-revealed[id]')].map((x) => x.id));
	const el = document.querySelector('[data-fo130="switch"]');
	S.node = el; S.was = el.getAttribute('aria-checked');
	const op = (n) => { let o = 1; for (let x = n; x && x.nodeType === 1; x = x.parentElement) o *= parseFloat(getComputedStyle(x).opacity) || 0; return o; };
	const read = () => {
		const k = window.__fo130keys || {}, q = (sel, mark) => (sel && document.querySelector(sel)) || document.querySelector(mark);
		const sec = q(k.sec, '[data-fo130-sec]'), below = q(k.below, '[data-fo130-below]');
		S.frames.push({ t: performance.now(), sec: sec ? sec.getBoundingClientRect().top : null, below: below ? below.getBoundingClientRect().top : null, op: sec ? op(sec) : null, secNode: sec, belowNode: below });
	};
	const ch = new MessageChannel();
	ch.port1.onmessage = read;
	read();
	const t0 = performance.now();
	const tick = () => { ch.port2.postMessage(0); if (performance.now() - t0 < ms) requestAnimationFrame(tick); else setTimeout(() => { S.on = false; resolve(); }, 30); };
	requestAnimationFrame(tick);
	window.__fo130done = new Promise((r) => { S.resolve = r; });
});
const RESULT = () => {
	const S = window.__fo130, el = document.querySelector('[data-fo130="switch"]');
	const f = S.frames, first = f[0] || {};
	const span = (k) => { const xs = f.map((x) => x[k]).filter((x) => x != null); return xs.length ? Math.round((Math.max(...xs) - Math.min(...xs)) * 10) / 10 : 0; };
	return {
		ent: S.ent, shifts: Math.round(S.shifts * 1000) / 1000, frames: f.length,
		same: !!el && el === S.node && el.isConnected,
		focus: !!S.node && document.activeElement === S.node,
		flipped: !!el && el.getAttribute('aria-checked') !== S.was,
		secMove: span('sec'), belowMove: span('below'),
		minOp: Math.round(Math.min(...f.map((x) => x.op == null ? 1 : x.op)) * 100) / 100,
		replacedSec: f.some((x) => x.secNode !== first.secNode && x.secNode !== null && first.secNode !== null) || !(first.secNode && first.secNode.isConnected),
	};
};

async function openCase(t, f, c) {
	await f.evaluate(([d, w]) => PM51.go(d, w), [c.domain, c.ws]);
	await f.waitForSelector(`[data-continuous-workspace-body="${c.ws}"][data-workspace-mounted="true"]`, { timeout: 15000 });
	if (c.select) {
		const row = f.locator(`#pm-settings-root .resource-row[data-provider="${c.select}"]`).first();
		await row.click();
		await f.waitForSelector('#pm-settings-root .pm51-providers-order', { timeout: 8000 });
	}
	await t.settle();
	await t.page.waitForTimeout(900);   // the arrival's own entrances finish first
}

async function runCase(t, f, w, h, name, tagPre) {
	const c = CASES[name];
	await openCase(t, f, c);
	const armed = await f.evaluate(ARM, { ws: c.ws, sw: c.sw, entr: ENTR });
	if (!(await t.check(`${tagPre} ${name}: the switch is drawn`, !!armed.ok, armed.err || ''))) return;
	for (const step of ['off', 'back on']) {
		const viaButton = !!c.reshapes && step === 'back on';
		if (viaButton) {
			const ok = await f.evaluate((sel) => { const b = document.querySelector(sel); if (!b) return false; document.querySelectorAll('[data-fo130="switch"]').forEach((x) => x.removeAttribute('data-fo130')); b.setAttribute('data-fo130', 'switch'); return true; }, c.reshapes);
			if (!(await t.check(`${tagPre} ${name}: off shows Turn on`, ok))) break;
		}
		// a replaced page (the unchanged build) drew a new switch: find it again, so every case still reports
		await f.evaluate((sel) => { let el = document.querySelector('[data-fo130="switch"]'); if (!el) { el = document.querySelector(sel); if (el) el.setAttribute('data-fo130', 'switch'); } if (el) el.scrollIntoView({ block: 'center' }); }, `[data-continuous-workspace-body="${c.ws}"] ${c.sw}`);
		await t.page.waitForTimeout(250);
		const sampling = f.evaluate(SAMPLE, 1100);
		await f.locator('[data-fo130="switch"]').click();
		await sampling;
		const r = await f.evaluate(RESULT);
		if (t.args.probe) t.log(`${tagPre} ${name} ${step} ${JSON.stringify(r)}`);
		const tag = `${tagPre} ${name} (${armed.label}) ${step}${viaButton ? ' with Turn on' : ''}`;
		await t.check(`${tag}: no entrance replays`, r.ent.length === 0, r.ent.join(', '));
		await t.check(`${tag}: nothing fades`, r.minOp >= 0.99, `lowest opacity ${r.minOp}`);
		await t.check(`${tag}: no layout shift in Settings`, r.shifts < 0.001, `layout shift ${r.shifts}`);
		if (c.reshapes) {
			if (viaButton) await t.check(`${tag}: the switch is back, on`, await f.evaluate((sel) => { const el = document.querySelector(sel); return !!el && el.getAttribute('aria-checked') === 'true'; }, `[data-continuous-workspace-body="${c.ws}"] ${c.sw}`));
			continue;
		}
		await t.check(`${tag}: the switch is the same element, with the key focus, and changed`, r.same && r.focus && r.flipped, `same ${r.same}, focus ${r.focus}, changed ${r.flipped}`);
		await t.check(`${tag}: its section and the rows below hold still`, r.secMove <= 0.5 && r.belowMove <= 0.5 && !r.replacedSec, `section moved ${r.secMove} px, row below ${r.belowMove} px, section replaced ${r.replacedSec}, ${r.frames} frames`);
	}
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-130 manager switches hold still (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const sizes = t.args.size ? SIZES.filter(([w, h]) => `${w}x${h}` === t.args.size) : SIZES;
		const names = t.args.cases ? String(t.args.cases).split(',') : Object.keys(CASES);
		for (const [w, h] of sizes) {
			await t.viewport(w, h);
			const f = await t.app.open({ sandbox: surface === 'sandbox' });
			await t.app.resetLayout();
			await f.locator('#tab-settings').click();
			await t.settle();
			for (const name of names) await runCase(t, f, w, h, name, `${w}x${h}`);
		}
	};
	// Settings is shared by every look (NieR, Retro and Glass draw their own entrances and switches): the Services, Web,
	// Memory and Backups cases once in each of the ten looks at 1280x900. --set looks=basic-dark,nier-light limits it;
	// --set looks=none skips it.
	tests[`FO-130 in every look (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		if (String(t.args.looks) === 'none') { await t.check('looks skipped (--set looks=none)', true); return; }
		const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
		const names = t.args.cases ? String(t.args.cases).split(',') : ['providers', 'web', 'memory', 'backup'];
		await t.viewport(1280, 900);
		for (const look of looks) {
			const f = await t.app.open({ sandbox: surface === 'sandbox' });
			await t.app.resetLayout();
			await t.app.look(look);
			await f.locator('#tab-settings').click();
			await t.settle();
			for (const name of names) await runCase(t, f, 1280, 900, name, `${look} 1280x900`);
		}
	};
}
