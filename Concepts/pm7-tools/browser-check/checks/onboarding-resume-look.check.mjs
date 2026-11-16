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
// R55 (the lead's quick review of ec6a3c41e3): (7) a pick that returns to a look the window had saved before is saved
// again: Friendly Dark picked and closed (saved), Settings Glass Light, resumed, Friendly Dark picked again, closed:
// Settings holds Friendly Dark (both surfaces) and a reload shows it; (8) a newer NieR background chosen in Settings
// wins on resume: NieR Dark picked in the window and closed, Settings changes only NieR's background, resumed: the window
// shows the new background, and closing again (and a reload) keeps it.
// Stream F's blind review (sol-review-fo216 R1): (9) a reload with the resumed window still open keeps the look picked in
// it (normal surface): NieR Light set in Settings, Basic Dark picked in the resumed window, the page reloaded with the window
// open: the page shows Basic Dark and the run's saved drafts are Basic Dark; and the reverse, Glass Light set, NieR Dark
// picked, then Back to Welcome (a pick and no close); and with nothing picked (a new install's Basic Dark only shown), a
// reload writes nothing: Settings' look stays.
// FO-219 (stream F's batch 12; pre-existing): an unfinished setup stays resumable after a reload (normal surface): setup
// two steps in (Glass Light picked, on "Where should Puppet Master do the work?"), the page reloaded with the window open:
// the Resume chip or the bell's entry shows (the window does not open by itself); resumed, it is on the same step with its
// drafts and look; closed unfinished and reloaded, the chip is still there; finished (Ready's Enter) and reloaded, nothing
// shows. --set only=fo219.
// R57 (the lead's final review of fe92b0fa07), by the app's own controls, Adjust NieR's editor included: (F1, normal surface)
// Settings Basic Dark, Friendly Dark picked in setup and closed unfinished (saved), Settings Basic Dark again, the page
// reloaded, resumed: the window and its Look step show Basic Dark, and closing leaves it; (F2) NieR Dark picked, Adjust
// NieR: another background and one part switched, Done, closed unfinished: the page and Settings keep that background and
// those parts (and a reload, normal surface); (F3) NieR Dark set in Settings, resumed, Adjust NieR changing only the
// background, closed unfinished: Settings and the page keep it (and a reload). --set only=r57.
// FO-222 (stream F's opus-recheck-fo216-r3 P1, pre-existing): a setup finished into a new Project is still there after a
// reload (normal surface: nothing survives a reload in the sandbox): Settings puts tastebook (the page's Project) in Retro
// Light, setup picks Glass Dark and finishes into a new Project (Ready's Enter); reloaded: the title bar names that Project
// and the page is in Glass Dark; tastebook keeps its own Retro Light (saved, and painted when the title bar's menu switches
// to it); switching back to the new Project paints Glass Dark; and the first paint after the reload is already Glass Dark
// (the head's look, read as parsing ends: no tastebook look first); a title-bar switch to harbor (given Friendly Light in
// Settings), then a reload: still in harbor with its look (stream F's ruling B, 2026-11-16); back in the setup's Project,
// Run Onboarding Again (which replaces the record that listed it), closed, reloaded: tastebook in its look, as before;
// a stored id of a Project that no longer exists (written to storage: no ordinary control leaves one), reloaded: tastebook
// in its look, the id dropped, no error (stream F's OK, 2026-11-16).
// Because tastebook is in another look, a reload that falls
// back to it cannot pass as the new Project's look (the kit gap FO216-R3-KIT-FINISH-RELOAD-MASKED). --set only=fo222.
// No timing rows. --set looks=basic-light,nier-dark runs those cases alone; --set extra=0 leaves out the finish, Reduced
// Motion, reload, pick, R55 and open-reload cases; --set only=r55 runs the R55 cases alone, --set only=openreload the
// open-reload ones.
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

/* a Settings row's dropdown, picked as a person picks it (the same steps as setLookBySetting) */
async function pickSetting(t, f, setting, name) {
	const general = f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first();
	if (await general.count()) { await general.click(); await f.waitForTimeout(700); }
	const trigger = f.locator(`select[data-setting="${setting}"]`).locator('..').locator('.pm51-dd-trigger').first();
	await trigger.scrollIntoViewIfNeeded(); await trigger.click();
	await f.getByRole('option', { name, exact: true }).click({ timeout: 8000 });
	await f.locator('.pm51-dd-list').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
	await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: 20000 }).catch(() => {});
	await t.page.waitForTimeout(1200);
}
const savedLook = (f) => f.evaluate(() => { try { const th = String(PM51.value('general.visual.theme') || ''), m = String(PM51.value('general.visual.theme-mode') || ''); return { family: th.trim().split(/[\s-]+/)[0].toLowerCase(), mode: m.toLowerCase(), background: String(PM51.value('general.visual.nier-background') || '') }; } catch (e) { return { error: String(e) }; } });
const pickIn = async (f, A, family, mode) => {
	const calm = () => f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !document.documentElement.hasAttribute('data-o55-vt'), null, { timeout: 20000 }).catch(() => {});
	await A.click('pickFamily', family); await calm(); await A.click('pickMode', mode); await calm(); await sleep(1200);
};

/* R55 F1: back to a look the window had saved once, after Settings chose another: saved again */
async function again(t, sandbox) {
	const tag = `${sandbox ? 'sandbox' : 'normal'}: R55 F1, Friendly Dark saved, Settings Glass Light, Friendly Dark picked again`;
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox, settleMs: 1500 });
	const A = app(t, f);
	await A.screen('welcome'); await A.click('start', null, 'look');
	await pickIn(f, A, 'friendly', 'dark');
	await A.click('next', null, 'where'); await A.close(); await sleep(800);
	const s0 = await savedLook(f);
	await t.check(`${tag}: closed unfinished the first time, Settings holds Friendly Dark`, s0.family === 'friendly' && s0.mode === 'dark', JSON.stringify(s0));
	await A.toSettings(); await setLookBySetting(t, f, 'glass-light');
	await A.resume();
	const w = await A.windowLook();
	await t.check(`${tag}: resumed, the window shows Glass Light`, w.chosen === 'glass' && w.mode === 'light', JSON.stringify(w));
	await A.click('back', null, 'look');
	await pickIn(f, A, 'friendly', 'dark');
	await A.close(); await sleep(800);
	const s1 = await savedLook(f), p1 = await A.page();
	await t.check(`${tag}: closed unfinished again, the page and Settings' saved look are Friendly Dark`, held('friendly-dark', p1) && s1.family === 'friendly' && s1.mode === 'dark', JSON.stringify({ page: p1, saved: s1 }));
	if (sandbox) return;
	const r = await reloaded(t), p2 = await r.A.page();
	await t.check(`${tag}: reloaded, the page shows Friendly Dark`, held('friendly-dark', p2), JSON.stringify(p2));
}

/* R55 F2: a newer NieR background chosen in Settings wins on resume, and closing again keeps it */
async function nierBackground(t, sandbox) {
	const tag = `${sandbox ? 'sandbox' : 'normal'}: R55 F2, NieR Dark in the window, then only its background changed in Settings`;
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox, settleMs: 1500 });
	const A = app(t, f);
	const bg = () => f.evaluate(() => ({ page: window.PM_NIER ? PM_NIER.background() : null, session: (O55.S && O55.S.sess && O55.S.sess.look) ? O55.S.sess.look.background : null, nier: !!(window.PM_NIER && PM_NIER.on()) }));
	await A.screen('welcome'); await A.click('start', null, 'look');
	await pickIn(f, A, 'nier', 'dark');
	const b0 = (await bg()).page, b1 = b0 === 'Parchment' ? 'City Ruins' : 'Parchment';
	await A.click('next', null, 'where'); await A.close(); await sleep(800);
	await A.toSettings(); await pickSetting(t, f, 'general.visual.nier-background', b1);
	const g0 = await bg();
	await t.check(`${tag}: Settings set the background ${b1} (it was ${b0})`, g0.page === b1 && g0.nier, JSON.stringify(g0));
	await A.resume();
	const g1 = await bg();
	await t.check(`${tag}: resumed, the window shows NieR with the background ${b1}`, g1.page === b1 && g1.session === b1 && g1.nier, JSON.stringify(g1));
	await A.close(); await sleep(800);
	const g2 = await bg(), s2 = await savedLook(f);
	await t.check(`${tag}: closed unfinished again, the page and Settings keep ${b1}`, g2.page === b1 && g2.nier && s2.background === b1, JSON.stringify({ page: g2, saved: s2 }));
	if (sandbox) return;
	const r = await reloaded(t), g3 = await r.f.evaluate(() => ({ page: window.PM_NIER ? PM_NIER.background() : null, nier: !!(window.PM_NIER && PM_NIER.on()) }));
	await t.check(`${tag}: reloaded, NieR with the background ${b1}`, g3.page === b1 && g3.nier, JSON.stringify(g3));
}

/* sol-review-fo216 R1: the page reloaded while the resumed window is open still shows the look picked in it, and the run's
   saved drafts agree (normal surface: nothing survives a reload in the sandbox) */
async function openReload(t, set, pick, { back = false } = {}) {
	const tag = `normal: Settings ${set}, ${pick} picked in the resumed window${back ? ', then Back to Welcome' : ''}, reloaded with the window open`;
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox: false, settleMs: 1500 });
	let A = app(t, f);
	await A.screen('welcome'); await A.click('start', null, 'look'); await A.click('next', null, 'where'); await A.close();
	await A.toSettings(); await setLookBySetting(t, f, set);
	const r = await reloaded(t); A = r.A;
	await A.resume(); await A.click('back', null, 'look');
	const P = want(pick);
	await pickIn(r.f, A, P.family, P.mode);
	const p0 = await A.page();
	await t.check(`${tag}: picked, the page shows ${pick}`, held(pick, p0), JSON.stringify(p0));
	if (back) await A.click('back', null, 'welcome');
	await t.page.reload({ waitUntil: 'domcontentloaded' });
	const nf = t.page.mainFrame();
	await nf.waitForFunction(() => !!(window.O55 && O55.store) && !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !!(window.PM_NIER && (!PM_NIER.ready || PM_NIER.ready())), null, { timeout: 30000 }).catch(() => {});
	await sleep(2500);
	const p1 = await app(t, nf).page(), run = await nf.evaluate(() => { const s = O55.store.get('onboarding', null), d = s && s.drafts && s.drafts.main; return d ? { status: s.status, look: [d.theme_family, d.theme_mode].join('-'), nier: s.look ? s.look.nier : null } : null; });
	await t.check(`${tag}: reloaded, the page shows ${pick}${P.family === 'nier' ? '' : ' (no NieR preview left on)'}`, held(pick, p1), JSON.stringify(p1));
	await t.check(`${tag}: reloaded, the run's saved drafts are ${pick} too`, !!run && run.look === pick, JSON.stringify(run));
}
/* and with nothing picked (a new install shows Basic Dark only), a reload with the window open writes nothing */
async function openReloadNoPick(t) {
	const tag = 'normal: nothing picked, reloaded with the window open';
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox: false, settleMs: 1500 });
	const A = app(t, f);
	await A.screen('welcome');
	const s0 = await savedLook(f), shown = await A.windowLook();
	await t.page.reload({ waitUntil: 'domcontentloaded' });
	const nf = t.page.mainFrame();
	await nf.waitForFunction(() => !!(window.O55 && O55.store) && !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: 30000 }).catch(() => {});
	await sleep(2500);
	const s1 = await savedLook(nf);
	await t.check(`${tag}: Settings' saved look is unchanged (${s0.family} ${s0.mode}; the window showed ${shown.slug})`, s1.family === s0.family && s1.mode === s0.mode, JSON.stringify({ before: s0, after: s1, shown: shown.slug }));
}

/* FO-219: setup left open by a reload stays resumable, on its step, with its look; a finished one shows nothing */
const offer = (f) => f.evaluate(() => {
	const s = window.O55 && O55.store ? O55.store.get('onboarding', null) : null;
	return { open: document.documentElement.hasAttribute('data-o55-open'), chip: !!document.querySelector('#o55-resume [data-o55-chip="resume"]'),
		bell: !!(window.O55 && O55.notify && O55.notify.list && O55.notify.list().some((x) => x.id === 'pin-o55-resume')), status: s ? s.status : null, screen: s ? s.screen : null };
});
/* the page loaded again as a person reloads it: the app's own address, without the fresh-install switch the first load
   carried (a reload of that address would start a new install), which still ends the old page (pagehide) */
async function freshLoad(t) {
	const nf = await t.app.open({ onboarding: true, query: 'o55scenario=fresh', sandbox: false, settleMs: 1500 });
	await nf.waitForFunction(() => !!(window.O55 && O55.store && O55.ui) && !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: 30000 }).catch(() => {});
	await sleep(3000);
	return { f: nf, A: app(t, nf) };
}
async function finishFromWhere(f, A, name = 'Kept after a reload') {
	await A.click('pick', 'this'); await A.click('next', null, 'begin'); await A.click('pick', 'new'); await A.click('next', null, 'name');
	await f.locator('#o55f-name').fill(name); await sleep(200); await A.click('next');
	for (let i = 0; i < 30; i++) {
		const sc = await f.evaluate(() => O55.S.sess.screen);
		if (sc === 'ready') break;
		if (sc === 'ai' && (await f.locator(`${LAYER} [data-o55-do="skip"]`).filter({ visible: true }).count())) { await A.click('skip'); continue; }
		if (sc === 'review') { await A.click('commit', null, 'creating'); continue; }
		if (sc === 'protect' && (await f.locator(`${LAYER} [data-o55-do="later"]`).filter({ visible: true }).count())) { await A.click('later'); continue; }
		await A.settled();
		await f.waitForFunction(() => { const b = [...document.querySelectorAll('#pm-o55-onboarding .o55-foot .o55-primary')].pop(); return !!b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'; }, null, { timeout: 30000 }).catch(() => {});
		await f.locator('#pm-o55-onboarding .o55-foot .o55-primary').filter({ visible: true }).last().click({ timeout: 15000 }); await sleep(1500);
	}
	await A.screen('ready'); await A.click('enter');
	await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 30000 }).catch(() => {});
	await sleep(2500);
}
async function fo219(t) {
	const tag = 'normal: FO-219, setup two steps in, the page reloaded with the window open';
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox: false, settleMs: 1500 });
	const A = app(t, f);
	await A.screen('welcome'); await A.click('start', null, 'look');
	await pickIn(f, A, 'glass', 'light');
	await A.click('next', null, 'where');
	let r = await freshLoad(t);
	const o1 = await offer(r.f);
	await t.check(`${tag}: it is offered again (the Resume chip or the bell's entry), the window not opened by itself`, !o1.open && (o1.chip || o1.bell), JSON.stringify(o1));
	if (o1.open || !(o1.chip || o1.bell)) return;
	const way = await r.A.resume(), w = await r.A.windowLook(), p = await r.A.page();
	await t.check(`${tag}: resumed (by ${way}), it is on the same step with its drafts and look (Glass Light)`, w.screen === 'where' && w.draft === 'glass-light' && w.chosen === 'glass' && w.mode === 'light' && held('glass-light', p), JSON.stringify({ window: w, page: p }));
	await r.A.close();
	r = await freshLoad(t);
	const o2 = await offer(r.f);
	await t.check(`${tag}: closed unfinished and reloaded, the chip is still there`, !o2.open && (o2.chip || o2.bell) && o2.status === 'closed', JSON.stringify(o2));
	await r.A.resume();
	await finishFromWhere(r.f, r.A);
	r = await freshLoad(t);
	const o3 = await offer(r.f);
	await t.check(`${tag}: finished and reloaded, nothing shows (no window, chip or bell entry)`, !o3.open && !o3.chip && !o3.bell, JSON.stringify(o3));
}

/* R57: Adjust NieR in the window, by its own controls: the Look step's Adjust NieR, a scene tile, a part's switch, Done */
const nierState = (f) => f.evaluate(() => { let saved = {}; try { saved = { background: String(PM51.value('general.visual.nier-background') || ''), parts: (PM51.value('general.visual.nier-parts') || []).slice().sort() }; } catch (e) { saved = { error: String(e) }; } return { page: { on: !!(window.PM_NIER && PM_NIER.on()), background: PM_NIER.background(), parts: PM_NIER.parts().slice().sort() }, saved }; });
async function adjust(t, f, A, { background, part }) {
	await A.click('adjustNier');
	await f.locator('#pm-o55-onboarding .o55-nierpanel .o55nc').first().waitFor({ timeout: 15000 });
	await sleep(600);
	if (background) { await f.locator(`#pm-o55-onboarding .o55-nierpanel [data-o55nc-bg="${background}"]`).first().click({ timeout: 10000 }); await sleep(900); }
	if (part) { await f.locator(`#pm-o55-onboarding .o55-nierpanel .o55nc-chip[data-o55nc-key="${part}"]`).first().click({ timeout: 10000 }); await sleep(900); }
	await f.locator('#pm-o55-onboarding .o55-nierpanel [data-o55nc-done]').first().click({ timeout: 10000 });
	await f.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-nierpanel'), null, { timeout: 15000 }).catch(() => {});
	await sleep(800);
}
const otherBackground = (b) => (b === 'Desert' ? 'The Bunker' : 'Desert');

/* R57 F1: the saved look a closed run notes is the one after its own save: Settings set back after it counts, over a reload */
async function r57f1(t) {
	const tag = 'normal: R57 F1, Friendly Dark saved by the close, Settings Basic Dark after it, reloaded';
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox: false, settleMs: 1500 });
	let A = app(t, f);
	await A.screen('welcome'); await A.close();
	await A.toSettings(); await setLookBySetting(t, f, 'basic-dark');
	await A.resume(); await A.click('start', null, 'look');
	await pickIn(f, A, 'friendly', 'dark');
	await A.click('next', null, 'where'); await A.close(); await sleep(1200);
	const s0 = await savedLook(f);
	await t.check(`${tag}: the close saved Friendly Dark`, s0.family === 'friendly' && s0.mode === 'dark', JSON.stringify(s0));
	await A.toSettings(); await setLookBySetting(t, f, 'basic-dark');
	const r = await freshLoad(t); A = r.A;
	const way = await A.resume(), w = await A.windowLook();
	await t.check(`${tag}: resumed (by ${way}), the window shows Basic Dark`, w.chosen === 'basic' && w.mode === 'dark' && !w.nier, JSON.stringify(w));
	await A.click('back', null, 'look');
	const st = await A.lookStep();
	await t.check(`${tag}: its Look step starts on Basic Dark`, st.tile === 'basic' && st.mode === 'dark', JSON.stringify(st));
	await A.close();
	const p = await A.page();
	await t.check(`${tag}: closed unfinished, the page is left in Basic Dark`, held('basic-dark', p), JSON.stringify(p));
}
/* R57 F2: NieR's background and parts chosen in the window are saved whole by the unfinished close */
async function r57f2(t, sandbox) {
	const tag = `${sandbox ? 'sandbox' : 'normal'}: R57 F2, NieR Dark picked, Adjust NieR's background and a part changed, closed unfinished`;
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox, settleMs: 1500 });
	const A = app(t, f);
	await A.screen('welcome'); await A.click('start', null, 'look');
	await pickIn(f, A, 'nier', 'dark');
	const n0 = await nierState(f), bg = otherBackground(n0.page.background), part = 'reboot', want = n0.page.parts.includes(part) ? n0.page.parts.filter((k) => k !== part) : n0.page.parts.concat(part).sort();
	await adjust(t, f, A, { background: bg, part });
	const n1 = await nierState(f);
	await t.check(`${tag}: the window shows the background ${bg} and the part switched`, n1.page.on && n1.page.background === bg && n1.page.parts.join() === want.join(), JSON.stringify(n1.page));
	await A.click('next', null, 'where'); await A.close(); await sleep(1500);
	const n2 = await nierState(f), wantLabels = want.length;
	await t.check(`${tag}: the page and Settings keep the background ${bg} and the parts`, n2.page.on && n2.page.background === bg && n2.page.parts.join() === want.join() && n2.saved.background === bg && n2.saved.parts.length === wantLabels && !n2.saved.parts.includes('Reboot moment') === !want.includes(part), JSON.stringify(n2));
	if (sandbox) return;
	const r = await freshLoad(t), n3 = await nierState(r.f);
	await t.check(`${tag}: reloaded, NieR with the background ${bg} and the parts`, n3.page.on && n3.page.background === bg && n3.page.parts.join() === want.join(), JSON.stringify(n3.page));
}
/* R57 F3: a change made only in Adjust NieR is a choice: saved by the unfinished close */
async function r57f3(t, sandbox) {
	const tag = `${sandbox ? 'sandbox' : 'normal'}: R57 F3, NieR Dark set in Settings, resumed, only Adjust NieR's background changed, closed unfinished`;
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox, settleMs: 1500 });
	const A = app(t, f);
	await A.screen('welcome'); await A.close();
	await A.toSettings(); await setLookBySetting(t, f, 'nier-dark');
	await A.resume(); await A.click('start', null, 'look');
	const n0 = await nierState(f), bg = otherBackground(n0.page.background);
	await adjust(t, f, A, { background: bg });
	await A.close(); await sleep(1500);
	const n2 = await nierState(f);
	await t.check(`${tag}: the page and Settings keep the background ${bg}`, n2.page.on && n2.page.background === bg && n2.saved.background === bg, JSON.stringify(n2));
	if (sandbox) return;
	const r = await freshLoad(t), n3 = await nierState(r.f);
	await t.check(`${tag}: reloaded, NieR with the background ${bg}`, n3.page.on && n3.page.background === bg, JSON.stringify(n3.page));
}

/* FO-222: the Project setup finished into, and its look, after a reload; the page's own Project keeps its look */
const projectNow = (f) => f.evaluate(() => {
	const sel = document.querySelector('#projectMenu .pm6-tb-menu-item.is-selected[data-project]'), lab = document.getElementById('projectMenuLabel');
	let tb = null; try { const r = JSON.parse(localStorage.getItem('pm7:settings:tome-tabs:v1:tastebook') || 'null'); tb = r && r.settings ? [r.settings['general.visual.theme'] || null, r.settings['general.visual.theme-mode'] || null] : null; } catch (e) { tb = null; }
	const rec = window.O55 && O55.store ? O55.store.get('onboarding', null) : null;
	return { active: typeof window.PM_ACTIVE_PROJECT_ID === 'string' ? window.PM_ACTIVE_PROJECT_ID : null, selected: sel ? sel.getAttribute('data-project') : null, label: lab ? lab.textContent.trim() : '',
		finished: rec && rec.finished ? rec.finished.project : null, status: rec ? rec.status : null, tastebook: tb };
});
async function switchProject(t, f, id) {
	await f.locator('#projectMenuBtn').click({ timeout: 10000 });
	const row = f.locator(`#projectMenu .pm6-tb-menu-item[data-project="${id}"]`).first();
	if (!(await row.count())) { await t.page.keyboard.press('Escape'); return false; }
	await row.click({ timeout: 10000 });
	await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: 20000 }).catch(() => {});
	await sleep(2500);
	return true;
}
async function fo222(t) {
	const tag = 'normal: FO-222, setup finished into a new Project in Glass Dark, tastebook in Retro Light, reloaded';
	const NAME = 'Garden planner';
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox: false, settleMs: 1500 });
	let A = app(t, f);
	await A.screen('welcome'); await A.close();
	await A.toSettings(); await setLookBySetting(t, f, 'retro-light');
	await A.resume(); await A.click('start', null, 'look');
	await pickIn(f, A, 'glass', 'dark');
	await A.click('next', null, 'where');
	await finishFromWhere(f, A, NAME);
	const q0 = await projectNow(f), p0 = await A.page();
	await t.check(`${tag}: finished, the page is in ${NAME} and Glass Dark`, !!q0.finished && q0.selected === q0.finished && q0.label === NAME && held('glass-dark', p0), JSON.stringify({ project: q0, page: p0 }));
	/* (the look the head painted first: html[data-theme] as the document's parsing ends, before any script of the app's
	   runs at DOMContentLoaded; a fallback to tastebook's look would show there first, then switch) */
	await t.page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { window.__fo222First = document.documentElement.getAttribute('data-theme'); }, { once: true, capture: true }); });
	const r = await freshLoad(t);
	const q1 = await projectNow(r.f), p1 = await r.A.page(), first = await r.f.evaluate(() => window.__fo222First || null);
	await t.check(`${tag}: reloaded, the first paint is already Glass Dark (no tastebook look first)`, first === 'glass-dark', JSON.stringify({ first }));
	await t.check(`${tag}: reloaded, the title bar names ${NAME} and the page is in Glass Dark`, q1.selected === q0.finished && q1.label === NAME && held('glass-dark', p1), JSON.stringify({ project: q1, page: p1 }));
	await t.check(`${tag}: reloaded, tastebook keeps its own saved look, Retro Light`, !!q1.tastebook && String(q1.tastebook[0]).toLowerCase().startsWith('retro') && String(q1.tastebook[1]).toLowerCase() === 'light', JSON.stringify(q1.tastebook));
	await switchProject(t, r.f, 'tastebook');
	const p2 = await r.A.page();
	await t.check(`${tag}: the title bar's menu switched to tastebook: Retro Light`, held('retro-light', p2), JSON.stringify(p2));
	const back = await switchProject(t, r.f, q0.finished), p3 = await r.A.page(), q3 = await projectNow(r.f);
	await t.check(`${tag}: and back to ${NAME}: Glass Dark`, back && q3.selected === q0.finished && held('glass-dark', p3), JSON.stringify({ listed: back, project: q3, page: p3 }));
	/* F's second row: a title-bar switch to another Project, then a reload: still in it, with its look (harbor, a Project
	   the page lists itself, given its own look in Settings first) */
	const h = await switchProject(t, r.f, 'harbor');
	await r.A.toSettings(); await setLookBySetting(t, r.f, 'friendly-light');
	const r2 = await freshLoad(t), q4 = await projectNow(r2.f), p4 = await r2.A.page();
	await t.check(`${tag}: switched to harbor in the title bar (its look Friendly Light), reloaded: still in harbor with its look`, h && q4.selected === 'harbor' && held('friendly-light', p4), JSON.stringify({ project: q4, page: p4 }));
	/* a Project that no longer exists: back in the setup's Project, Run Onboarding Again (Settings' row) replaces the record
	   that listed it; closed and reloaded, the page is the default Project's, in its look, as before (no stale look first) */
	await switchProject(t, r2.f, q0.finished);
	await r2.A.toSettings();
	await r2.f.locator('#pm-settings-root [data-action="home"]').first().click({ timeout: 10000 }).catch(() => {}); await sleep(600);
	await r2.f.locator('[data-action="replay-onboarding"]').first().click({ timeout: 10000 });
	await r2.f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 });
	await sleep(1500); await r2.A.close();
	const r3 = await freshLoad(t), q5 = await projectNow(r3.f), p5 = await r3.A.page(), first5 = await r3.f.evaluate(() => window.__fo222First || null);
	await t.check(`${tag}: Run Onboarding Again after it, closed, reloaded: the page is tastebook in Retro Light, as before (first paint too)`, q5.selected === 'tastebook' && held('retro-light', p5) && first5 === 'retro-light', JSON.stringify({ project: q5, page: p5, first: first5 }));
	/* stream F's stale-id row: a stored id of a Project that no longer exists (no ordinary control leaves one: Start over
	   clears it, so the precondition is written to storage here), then a reload: the default Project in its look, the id
	   dropped, no error (the run's console row). One load may paint that Project's stored look first (F's OK) */
	await r3.f.evaluate(() => { try { localStorage.setItem('pm7:shell:active-project:v1', 'p-gone-project-0000'); } catch (_) { /* none */ } });
	const r4 = await freshLoad(t), q6 = await projectNow(r4.f), p6 = await r4.A.page(), kept = await r4.f.evaluate(() => { try { return localStorage.getItem('pm7:shell:active-project:v1'); } catch (_) { return 'no storage'; } });
	await t.check(`${tag}: a stored id of a Project that no longer exists, reloaded: tastebook in Retro Light, the id dropped`, q6.selected === 'tastebook' && q6.label === 'tastebook' && held('retro-light', p6) && kept !== 'p-gone-project-0000', JSON.stringify({ project: q6, page: p6, stored: kept }));
}

export default async function (t) {
	await t.viewport(1440, 960);
	const looks = t.args.looks ? String(t.args.looks).split(',') : ALL;
	if (t.args.only === 'fo222') { if (t.app.surfaces().includes('normal')) await fo222(t); return; }
	if (t.args.only === 'r57') { for (const sf of t.app.surfaces()) { const sb = sf === 'sandbox'; if (!sb) await r57f1(t); await r57f2(t, sb); await r57f3(t, sb); } await t.emulate({ reducedMotion: 'no-preference' }); return; }
	if (t.args.only === 'fo219') { if (t.app.surfaces().includes('normal')) await fo219(t); return; }
	if (t.args.only === 'openreload') { if (t.app.surfaces().includes('normal')) { await openReload(t, 'nier-light', 'basic-dark'); await openReload(t, 'glass-light', 'nier-dark', { back: true }); await openReloadNoPick(t); } return; }
	if (t.args.only === 'r55') { for (const s of t.app.surfaces()) { await again(t, s === 'sandbox'); await nierBackground(t, s === 'sandbox'); } await t.emulate({ reducedMotion: 'no-preference' }); return; }
	for (const s of t.app.surfaces()) {
		const sandbox = s === 'sandbox';
		for (const target of looks) await run(t, sandbox, target);
		if (String(t.args.extra) !== '0') {
			await run(t, sandbox, 'glass-light', { finish: true });
			await run(t, sandbox, 'retro-dark', { reduced: true });
			if (!sandbox) await reload(t);
			await picked(t, sandbox, 'nier-light', 'basic-dark');
			await picked(t, sandbox, 'glass-dark', 'nier-dark');
			await again(t, sandbox);
			await nierBackground(t, sandbox);
			if (!sandbox) await fo219(t);
			if (!sandbox) await r57f1(t);
			if (!sandbox) await fo222(t);
			await r57f2(t, sandbox); await r57f3(t, sandbox);
			if (!sandbox) { await openReload(t, 'nier-light', 'basic-dark'); await openReload(t, 'glass-light', 'nier-dark', { back: true }); await openReloadNoPick(t); }
		}
	}
	await t.emulate({ reducedMotion: 'no-preference' });
}
