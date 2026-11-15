// FO-216 (stream F, found by lane Q's NieR probe, share reviews/q-nier-probe E4-E7): the look chosen last wins when setup
// is resumed. A run started in one look and closed unfinished; the look then changed in Settings; the run resumed: the
// window showed the run's own starting look again (60-ui-core.js reapplyLook, NieR's reapply in 64-nier-look.js), and once
// closed the page stayed in it (an unsaved preview lingers until Settings next writes).
// Everything here goes by the app's own controls, never the kit's look() helper: the window's Start, its look tiles and
// Light / Dark, Next and Back, its close button; Settings' tab and its Theme and "Light or dark" rows (setLookBySetting,
// helpers/settings-look.mjs); the Resume chip, or the bell's "Finish setting up" once the chip has tucked into it.
// For Basic, Glass, Retro and NieR, each in Light and in Dark, on both surfaces: a fresh run picks Friendly (the other
// mode) in the window and goes on to "Where should Puppet Master do the work?", closes unfinished; Settings sets the look;
// the Resume brings the run back. Rows: (1) the window shows the look Settings set (NieR on for NieR); (2) Back to Pick a
// look: the chosen tile and Light / Dark are that look; (3) closed unfinished again, the page is in that look (NieR flag
// as set). Once, Glass Light: the resumed run is finished (Create, every step after it, Ready's Enter) and the page and
// Settings' saved Theme and "Light or dark" are that look. Once, Retro Dark, under Reduced Motion: rows (1) to (3). Once,
// on the normal surface (the sandbox keeps nothing over a reload): no look chosen since, the page loaded again (which
// drops the window's unsaved preview, and is no choice), the resumed run shows its own pick again, Friendly Dark.
// pm-fo-lead's full rule (11:19Z): the look chosen last wins WHEREVER it was chosen. So also: (4) a look picked on the
// resumed run's Look step is a choice: closed unfinished, the page keeps it (neither the Settings look nor the run's start
// comes back); (5) a reload after any of these shows the look chosen last (normal surface: the sandbox keeps nothing over a
// reload); (6) NieR both ways: NieR Light set in Settings, Basic Dark picked in the resumed window (no NieR preview left
// on), and Glass Dark set in Settings, NieR Dark picked in the window.
// No timing rows. --set looks=basic-light,nier-dark runs those cases alone; --set extra=0 leaves out the finish, Reduced
// Motion, reload and pick cases.
import { setLookBySetting, lookHeld } from '../helpers/settings-look.mjs';

const ALL = ['basic-light', 'basic-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function app(t, f) {
	const settled = async () => { await f.locator(LAYER + ':not(.o55-hold)').first().waitFor({ timeout: 20000 }); await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !document.querySelector('#pm-o55-onboarding .o55-layer.o55-out'), null, { timeout: 20000 }).catch(() => {}); };
	const screen = async (id) => { await f.waitForFunction((x) => !!(window.O55 && O55.S && O55.S.sess && O55.S.open && O55.S.sess.screen === x), id, { timeout: 25000 }); await settled(); await sleep(400); };
	const click = async (action, arg, expected) => {
		await settled();
		let sel = action === 'back' ? '#pm-o55-onboarding [data-o55-do="back"]' : `${LAYER} [data-o55-do="${action}"]`;
		if (arg != null) sel += `[data-arg=${JSON.stringify(String(arg))}]`;
		await f.locator(sel).filter({ visible: true }).first().click({ timeout: 15000 });
		if (expected) await screen(expected); else await sleep(500);
	};
	const open = () => f.evaluate(() => document.documentElement.hasAttribute('data-o55-open'));
	const close = async () => {
		await settled();
		await f.locator('#pm-o55-onboarding .o55-close').first().click({ timeout: 10000 });
		await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 });
		await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: 15000 }).catch(() => {});
		await sleep(1200);
	};
	/* back in the way a person gets back in: the Resume chip while it shows, the bell's entry once it has tucked (a press
	   elsewhere tucks it, and Settings took several) */
	const resume = async () => {
		await f.waitForFunction(() => !!document.querySelector('#o55-resume [data-o55-chip="resume"]') || !!(window.O55 && O55.notify && O55.notify.list && O55.notify.list().some((x) => x.id === 'pin-o55-resume')), null, { timeout: 15000 });
		const tucked = () => f.evaluate(() => { const c = document.getElementById('o55-resume'); return !c || c.classList.contains('pmn-pin-tucked') || !c.getClientRects().length; });
		let way = null;
		if (!(await tucked())) way = await f.locator('#o55-resume [data-o55-chip="resume"]').click({ timeout: 3000 }).then(() => 'chip', () => null);
		if (!way) {
			await f.waitForFunction(() => { const s = document.getElementById('pmnStack'); return !!s && s.getClientRects().length > 0; }, null, { timeout: 15000 });
			const row = f.locator('#pmnPanel .pmn-item[data-id="pin-o55-resume"]');
			if (!(await f.evaluate(() => { const p = document.getElementById('pmnPanel'); return !!p && !p.hidden; }))) await f.locator('#pmnStack').click({ timeout: 10000 });
			await row.first().waitFor({ state: 'visible', timeout: 10000 });
			if (await row.first().getAttribute('data-under') !== null) { await row.first().click(); await sleep(400); }
			await row.first().locator('[data-aid="resume_pin"]').click({ timeout: 10000 });
			way = 'bell';
		}
		await f.waitForFunction(() => !!(window.O55 && O55.S && O55.S.open && document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer[data-screen]')), null, { timeout: 15000 });
		await settled(); await sleep(1500);
		return way;
	};
	/* the look as the page paints it, and as the window and the Look step show it */
	const page = () => f.evaluate(() => { const theme = document.documentElement.getAttribute('data-theme') || '', pv = window.PM_NIER && PM_NIER.previewing ? PM_NIER.previewing() : null; return { theme, nier: !!(window.PM_NIER && PM_NIER.on()) || document.documentElement.getAttribute('data-o55-nier') === 'on', preview: pv ? (pv.on === true ? 'on' : pv.on === false ? 'off' : 'parts') : null }; });
	const windowLook = () => f.evaluate(() => { const th = O55.theme(), d = O55.S.sess.drafts.main; return { chosen: th.chosen, mode: th.mode, selectedMode: th.selectedMode, nier: th.nier, slug: th.slug, draft: [d.theme_family, d.theme_mode].join('-'), screen: O55.S.sess.screen }; });
	const lookStep = () => f.evaluate((L) => {
		const tile = document.querySelector(L + ' .o55-tile[aria-checked="true"]'), mode = document.querySelector(L + ' [data-o55-do="pickMode"][aria-checked="true"], ' + L + ' [data-o55-do="pickMode"][aria-pressed="true"], ' + L + ' [data-o55-do="pickMode"].o55-on');
		return { tile: tile ? tile.getAttribute('data-arg') : null, mode: mode ? mode.getAttribute('data-arg') : null, tiles: document.querySelectorAll(L + ' .o55-tile[aria-checked="true"]').length };
	}, LAYER);
	const stored = () => f.evaluate(() => { try { return { theme: PM51.value('general.visual.theme'), mode: PM51.value('general.visual.theme-mode') }; } catch (e) { return { error: String(e) }; } });
	const toSettings = async () => {
		await f.locator('#tab-settings').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-settings').click()));
		await f.locator('#pm-settings-root').first().waitFor({ timeout: 15000 });
		await sleep(800);
	};
	return { settled, screen, click, open, close, resume, page, windowLook, lookStep, stored, toSettings };
}

/* the look held, and for a look without NieR no NieR preview left on */
const held = (look, p) => lookHeld(look, p) && (look.startsWith('nier') || p.preview !== 'on');
/* the page loaded again as a person reloads it (no fresh start): what it paints once settled */
async function reloaded(t) {
	const f = await t.app.open({ onboarding: true, query: 'o55scenario=fresh', sandbox: false, settleMs: 1500 });
	await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !!(window.PM_NIER && (!PM_NIER.ready || PM_NIER.ready())), null, { timeout: 20000 }).catch(() => {});
	await sleep(2000);
	return { f, A: app(t, f) };
}
const startOf = (target) => (target.endsWith('-light') ? 'friendly-dark' : 'friendly-light');
const want = (look) => { const [family, mode] = look.split('-'); return { family, mode }; };

async function run(t, sandbox, target, { reduced = false, finish = false } = {}) {
	const tag = `${sandbox ? 'sandbox' : 'normal'}: ${target}${reduced ? ' (Reduced Motion)' : ''}${finish ? ' (finished)' : ''}`;
	await t.emulate({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox, settleMs: 1500 });
	const A = app(t, f), start = startOf(target), S0 = want(start), W = want(target);
	/* pictures of the main case only (--set shotcase=<look>, NieR Light by default, the probe's own), on the normal surface */
	const shot = (name, why) => (!sandbox && !reduced && !finish && target === String(t.args.shotcase || 'nier-light') ? t.shot(name, why) : null);
	await A.screen('welcome');
	// a run in its own look, picked in the window, closed unfinished one step on
	await A.click('start', null, 'look');
	await A.click('pickFamily', S0.family); await A.click('pickMode', S0.mode);
	const w0 = await A.windowLook();
	await t.check(`${tag}: the run picks ${start} in the window`, w0.chosen === S0.family && w0.mode === S0.mode, JSON.stringify(w0));
	await A.click('next', null, 'where');
	await shot(`resume-look-${target}-0-run`, `${tag}: the run in ${start}, one step on, before it closes`);
	await A.close();
	// the look changed in Settings while the run waits
	await A.toSettings();
	await setLookBySetting(t, f, target);
	const p1 = await A.page();
	await shot(`resume-look-${target}-0b-settings`, `${tag}: Settings set ${target}, the run closed`);
	await t.check(`${tag}: Settings painted ${target}`, held(target, p1), JSON.stringify(p1));
	// back in
	const way = await A.resume();
	const w1 = await A.windowLook();
	await shot(`resume-look-${target}-1-resumed`, `${tag}: resumed (${way}): the window shows ${w1.slug}${w1.nier ? ' NieR' : ''}`);
	await t.check(`${tag}: resumed (by ${way}), the window shows the look Settings set`, w1.chosen === W.family && w1.mode === W.mode && w1.nier === (W.family === 'nier'), JSON.stringify(w1));
	if (finish) {
		// on to the end: a new local Project, every step after it, Ready's Enter
		await A.click('pick', 'this'); await A.click('next', null, 'begin'); await A.click('pick', 'new'); await A.click('next', null, 'name');
		await f.locator('#o55f-name').fill('Look kept'); await sleep(200); await A.click('next');
		for (let i = 0; i < 30; i++) {
			const s = await f.evaluate(() => O55.S.sess.screen);
			if (s === 'ready') break;
			if (s === 'ai' && (await f.locator(`${LAYER} [data-o55-do="skip"]`).filter({ visible: true }).count())) { await A.click('skip'); continue; }
			if (s === 'review') { await A.click('commit', null, 'creating'); continue; }
			if (s === 'protect' && (await f.locator(`${LAYER} [data-o55-do="later"]`).filter({ visible: true }).count())) { await A.click('later'); continue; }
			await A.settled();
			const next = f.locator('#pm-o55-onboarding .o55-foot .o55-primary').filter({ visible: true }).last();
			await f.waitForFunction(() => { const b = [...document.querySelectorAll('#pm-o55-onboarding .o55-foot .o55-primary')].pop(); return !!b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'; }, null, { timeout: 30000 }).catch(() => {});
			await next.click({ timeout: 15000 }); await sleep(1500);
		}
		await A.screen('ready');
		await A.click('enter');
		await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 30000 }).catch(() => {});
		await sleep(3000);
		const p3 = await A.page(), st = await A.stored();
		await t.shot(`resume-look-${target}-${sandbox ? 'sandbox' : 'normal'}-finished`, `${tag}: finished: the page shows ${p3.theme}${p3.nier ? ' NieR' : ''}`);
		/* (Settings saves the Theme as its label, the family and its mode: 'Glass Light'; the family is its first word) */
		const stOk = String(st.theme || '').trim().split(/[\s-]+/)[0].toLowerCase() === W.family && String(st.mode || '').toLowerCase() === W.mode;
		await t.check(`${tag}: setup finished, the page and Settings' saved look are ${target}`, held(target, p3) && stOk, JSON.stringify({ page: p3, saved: st }));
		if (!sandbox) { const r = await reloaded(t), p4 = await r.A.page(); await t.check(`${tag}: reloaded, the page shows ${target}`, held(target, p4), JSON.stringify(p4)); }
		return;
	}
	// its Look step starts on it
	await A.click('back', null, 'look');
	const s2 = await A.lookStep();
	await shot(`resume-look-${target}-2-look-step`, `${tag}: Pick a look: tile ${s2.tile}, ${s2.mode}`);
	await t.check(`${tag}: its Look step starts on it (the chosen tile and Light / Dark)`, s2.tile === W.family && s2.mode === W.mode && s2.tiles === 1, JSON.stringify(s2));
	// closed unfinished, the page is left in it
	await A.close();
	const p2 = await A.page();
	await shot(`resume-look-${target}-3-closed`, `${tag}: closed unfinished: the page shows ${p2.theme}${p2.nier ? ' NieR' : ''}`);
	await t.check(`${tag}: closed unfinished, the page is left in ${target} (NieR ${W.family === 'nier' ? 'on' : 'off'})`, held(target, p2), JSON.stringify(p2));
	if (!sandbox) { const r = await reloaded(t), p4 = await r.A.page(); await t.check(`${tag}: reloaded, the page shows ${target}`, held(target, p4), JSON.stringify(p4)); }
}

/* (4)-(6): Settings sets one look, the resumed run's Look step picks another, closed unfinished: the pick stays, and over a
   reload too (normal surface), and the run resumed again shows it */
async function picked(t, sandbox, set, pick) {
	const tag = `${sandbox ? 'sandbox' : 'normal'}: Settings ${set}, then ${pick} picked in the resumed window`;
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox, settleMs: 1500 });
	const A = app(t, f), start = startOf(set), S0 = want(start), P = want(pick);
	await A.screen('welcome');
	await A.click('start', null, 'look'); await A.click('pickFamily', S0.family); await A.click('pickMode', S0.mode);
	await A.click('next', null, 'where');
	await A.close();
	await A.toSettings();
	await setLookBySetting(t, f, set);
	await A.resume();
	await A.click('back', null, 'look');
	await A.click('pickFamily', P.family);
	await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !document.documentElement.hasAttribute('data-o55-vt'), null, { timeout: 20000 }).catch(() => {});
	await A.click('pickMode', P.mode);
	await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !document.documentElement.hasAttribute('data-o55-vt'), null, { timeout: 20000 }).catch(() => {});
	await sleep(1200);
	const w = await A.windowLook(), s1 = await A.lookStep();
	await t.check(`${tag}: the window and its Look step show ${pick}`, w.chosen === P.family && w.mode === P.mode && w.nier === (P.family === 'nier') && s1.tile === P.family && s1.mode === P.mode, JSON.stringify({ window: w, step: s1 }));
	await A.close();
	const p2 = await A.page();
	await t.check(`${tag}: closed unfinished, the page keeps ${pick}${P.family === 'nier' ? '' : ' (no NieR preview left on)'}`, held(pick, p2), JSON.stringify(p2));
	if (sandbox) return;
	await sleep(800);   /* (the pick is saved once the close has played: flushLook, 400 ms) */
	const r = await reloaded(t), p3 = await r.A.page();
	await t.check(`${tag}: reloaded, the page shows ${pick}`, held(pick, p3), JSON.stringify(p3));
	const way = await r.A.resume(), w2 = await r.A.windowLook();
	await t.check(`${tag}: reloaded and resumed (by ${way}), the window shows ${pick}`, w2.chosen === P.family && w2.mode === P.mode && w2.nier === (P.family === 'nier'), JSON.stringify(w2));
	await r.A.close();
	const p4 = await r.A.page();
	await t.check(`${tag}: closed again, the page keeps ${pick}`, held(pick, p4), JSON.stringify(p4));
}

/* a reload is no choice: the run's own pick (unsaved, so the reload painted the saved look) comes back when it resumes */
async function reload(t) {
	const tag = 'normal: reloaded, no look chosen since';
	await t.emulate({ reducedMotion: 'no-preference' });
	let f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox: false, settleMs: 1500 });
	let A = app(t, f);
	await A.screen('welcome');
	await A.click('start', null, 'look'); await A.click('pickFamily', 'friendly'); await A.click('pickMode', 'dark');
	await A.click('next', null, 'where');
	await A.close();
	f = await t.app.open({ onboarding: true, query: 'o55scenario=fresh', sandbox: false, settleMs: 1500 });
	A = app(t, f); await sleep(800);
	const p0 = await A.page();
	t.log(`${tag}: the page loaded again shows ${p0.theme}${p0.nier ? ' NieR' : ''}`);
	const way = await A.resume();
	const w = await A.windowLook();
	await t.check(`${tag}: resumed (by ${way}), the window shows the run's own pick, friendly-dark`, w.chosen === 'friendly' && w.mode === 'dark' && !w.nier, JSON.stringify(w));
	await A.close();
}

export default async function (t) {
	await t.viewport(1440, 960);
	const looks = t.args.looks ? String(t.args.looks).split(',') : ALL;
	for (const s of t.app.surfaces()) {
		const sandbox = s === 'sandbox';
		for (const target of looks) await run(t, sandbox, target);
		if (String(t.args.extra) !== '0') {
			await run(t, sandbox, 'glass-light', { finish: true });
			await run(t, sandbox, 'retro-dark', { reduced: true });
			if (!sandbox) await reload(t);
			await picked(t, sandbox, 'nier-light', 'basic-dark');
			await picked(t, sandbox, 'glass-dark', 'nier-dark');
		}
	}
	await t.emulate({ reducedMotion: 'no-preference' });
}
