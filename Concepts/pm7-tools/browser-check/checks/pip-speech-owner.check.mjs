// FO-41 redesign: every line Pip says for a NAS step's check (its opening line, checking, done, a refusal, the cheer
// for a fault put right) belongs to that check and to the inputs it ran for, and gives way at once when either moves
// on. Pip's other words (a hover's line, a field's typing line) are not checked here.
//
// A sampler in the page reads, at every animation frame, the step as painted (no check yet, checking, refused, passed:
// its phase list and its own button) and only the part of Pip's bubble already typed (.pst-bt-on, not the whole line).
// A frame fails when the typed words can only be the start of a check line that does not belong to what the step
// shows; a check fails when such words stay up for more than one frame. By real clicks and typing from Demo Studio ›
// Onboarding › Open at one screen (Fresh computer, no twists), in all ten looks (or --set looks=a,b) and both wordings:
//   smb      quick Check access (typed and pressed at once), then the account edited after the pass; Check access, then
//            the account edited while it runs (the old check ends unseen); Check access, the password retyped and
//            Check access again at once; a refused password, the right one, and, as Pip's cheer for it begins, the
//            account edited (in every look and wording), then the password or the domain (alternating); a refused
//            password, the right one, and the account edited while that check runs (its success is not cheered).
//   drive    Begin › Existing › Home NAS › already connected › its drive › Continue: checking, then the done line.
//   nfs      Choose another drive › NFS › its share › Continue: checking, then the done line.
//   install  Adding the key (SSH install) from its row: the install line, then the done line.
// Motion is on (Pip types) unless --set motion=reduced, which emulates Reduce Motion before the page loads; either way
// each route first asserts the page's media preference and the rig's own state (O55.motion.reduced() and the stage's
// data-reduced) match the motion asked for. Both surfaces with --set sandbox=0/1. --set only=smb,drive narrows the
// routes. About 10 minutes a surface.
import { LOOKS } from '../browser-check.config.mjs';

const ROOT = '#pm-o55-onboarding';
const LAYER = `${ROOT} .o55-pane > .o55-layer:not(.o55-out)`;

/* The sampler (one per page). Per frame: the step's state as painted, Pip's typed words, and whether those words can
   only be a check line that the painted state has left (then they are stale). take() returns and resets. */
const SAMPLER = ([root, L]) => {
	if (window.__own) cancelAnimationFrame(window.__own.raf);
	const O = window.O55, t = (k) => O.t(k), say = (s) => O.tx('pip.say.' + s) || {};
	const SETS = {
		'nas-smb': () => ({ lines: say('nas-smb'), op: { enter: say('nas-smb').enter, checking: say('nas-smb').checking, done: say('nas-smb').done, oops: t('pip.oops.nas.smb.wrong'), cheer: t('pip.cheer.nas.smb.wrong') },
			valid: { unchecked: ['enter'], running: ['checking'], failed: ['oops'], done: ['done', 'cheer'] } }),
		'nas-mounted': () => ({ lines: say('nas-mounted'), op: { enter: say('nas-mounted').enter, checking: say('nas-mounted').checking, done: say('nas-mounted').done },
			valid: { running: ['checking'], done: ['done'], failed: [] } }),
		'nas-nfs': () => ({ lines: say('nas-nfs'), op: { enter: say('nas-nfs').enter, done: say('nas-nfs').done }, valid: { running: ['enter'], done: ['done'], failed: [] } }),
		'nas-install': () => ({ lines: say('nas-install'), op: { enter: say('nas-install').enter, done: say('nas-install').done }, valid: { running: ['enter'], done: ['done'], failed: [] } })
	};
	const domState = (scr, layer) => {
		const p = layer.querySelector('.o55-primary'), act = p && p.getAttribute('data-o55-do'), off = !p || p.disabled || p.getAttribute('aria-disabled') === 'true';
		const phases = layer.querySelector('.o55-phases'), failed = !!layer.querySelector('.o55-ph-failed');
		if (scr === 'nas-smb') return !phases ? 'unchecked' : failed ? 'failed' : act === 'use' && !off ? 'done' : 'running';
		if (scr === 'nas-install') return failed || act === 'retry' ? 'failed' : act === 'next' && !off ? 'done' : 'running';
		return failed ? 'failed' : act === 'use' && !off ? 'done' : 'running';
	};
	const W = window.__own = { raf: 0, frame: 0, run: 0, maxRun: 0, frames: 0, bad: [], rows: [], last: '', seen: {} };
	const tick = (at) => {
		W.frame++;
		const layer = document.querySelector(L), scr = layer && layer.getAttribute('data-screen');
		const b = document.querySelector(root + ' .pst-bubble'), on = b && b.querySelector('.pst-bt-on'), cs = b && getComputedStyle(b);
		const text = b && on && b.classList.contains('on') && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.1 ? on.textContent.trim() : '';
		let st = null, stale = null;
		/* (judged while the step comes in too: the bubble on the stage shows its line from the screen's first render) */
		if (layer && SETS[scr] && window.O55.S.open) {
			const set = SETS[scr](), valid = set.valid[(st = domState(scr, layer))] || [];
			const invalid = Object.keys(set.op).filter((n) => !valid.includes(n)).map((n) => set.op[n]).filter((x) => typeof x === 'string' && x);
			const allowed = Object.values(set.lines).concat(valid.map((n) => set.op[n])).filter((x) => typeof x === 'string' && x && !invalid.includes(x));
			if (text.length >= 4) { const hit = invalid.find((l) => l.startsWith(text)); if (hit && !allowed.some((l) => l.startsWith(text))) stale = hit; }
			W.frames++;
			W.seen[scr + ':' + st] = true;
		}
		if (stale) { W.run++; if (W.run >= 2 && W.bad.length < 12) W.bad.push({ frame: W.frame, at: Math.round(at), screen: scr, state: st, typed: text, line: stale, run: W.run }); } else W.run = 0;
		W.maxRun = Math.max(W.maxRun, W.run);
		const row = scr + '|' + st + '|' + text;
		if (row !== W.last) { W.last = row; W.rows.push({ frame: W.frame, at: Math.round(at), screen: scr, state: st, typed: text, stale: !!stale }); if (W.rows.length > 3000) W.rows.shift(); }
		W.raf = requestAnimationFrame(tick);
	};
	W.take = () => { const out = { frames: W.frames, maxRun: W.maxRun, bad: W.bad.slice(), seen: Object.keys(W.seen), rows: W.rows.slice(-40) }; W.frames = 0; W.maxRun = W.run; W.bad = []; W.seen = {}; return out; };
	W.raf = requestAnimationFrame(tick);
};
const arm = (f) => f.evaluate(SAMPLER, [ROOT, LAYER]);
const take = (f) => f.evaluate(() => window.__own.take());
/* the sub-step's verdict: the sampler ran over the step, saw the states it should, and no check line outlived its state
   by more than one frame */
async function verdict(t, f, name, needStates) {
	const r = await take(f);
	const missing = (needStates || []).filter((s) => !r.seen.includes(s));
	await t.check(`${name}: no check line stays typed past its check by more than one frame`, r.frames > 20 && r.maxRun < 2 && !missing.length,
		JSON.stringify({ maxRun: r.maxRun, first: r.bad[0] ? [r.bad[0].frame, r.bad[0].state, r.bad[0].typed] : null, missing, frames: r.frames, bad: r.bad.slice(0, 2), tail: r.rows.slice(-6) }));
	return r;
}

async function openAt(t, f, screen) {
	await f.evaluate(() => window.O55.studio.open('onboarding'));
	await f.waitForSelector('#pmds-sheet [data-pmds-do="open-screen"]', { timeout: 15000 });
	await f.click('#pmds-sheet [data-pmds-do="pick-base"][data-arg="fresh"]');
	for (let i = 0; i < 12; i++) {
		const on = f.locator('#pmds-sheet [data-pmds-do="pick-twist"][aria-checked="true"]');
		if (!(await on.count())) break;
		await on.first().click(); await t.page.waitForTimeout(150);
	}
	const row = f.locator(`#pmds-sheet [data-pmds-do="open-screen"][data-arg="${screen}"]`);
	await row.scrollIntoViewIfNeeded(); await row.click();
	return f.waitForFunction((s) => window.O55.S.open && window.O55.S.sess && window.O55.S.sess.screen === s, screen, { timeout: 15000 }).then(() => true, () => false);
}
const settled = (f, screen) => f.waitForFunction(([L, s]) => { const l = document.querySelector(L); return !!l && l.getAttribute('data-screen') === s && window.O55.S.sess.screen === s && !document.documentElement.hasAttribute('data-o55-vt') && !l.matches('.o55-hold, .o55-entering'); }, [LAYER, screen], { timeout: 15000 }).then(() => true, () => false);
/* the step's own check (70-screens-nas.js checkKey) is in this state */
const checkIs = (f, screen, state, timeout = 15000) => f.waitForFunction(([s, want]) => {
	/* (a build from before checkKey knew the SSH install reads the install's own key) */
	const S = window.O55.S, k = window.O55.nas.checkKey(S, s) || (s === 'nas-install' ? (S.sess.nas || {}).opKey : null), st = k ? (S.sess.ops || {})[k] : null;
	return want === 'none' ? !st : !!st && st.state === want;
}, [screen, state], { timeout, polling: 'raf' }).then(() => true, () => false);
/* Pip has begun typing this line: at least `n` of its letters are on show (all of it under Reduced Motion) */
const typing = (f, text, n, timeout = 6000) => f.waitForFunction(([root, text, n]) => {
	const b = document.querySelector(root + ' .pst-bubble'), on = b && b.querySelector('.pst-bt-on'), v = on && b.classList.contains('on') ? on.textContent.trim() : '';
	return v.length >= Math.min(n, text.length) && text.startsWith(v) ? v : false;
}, [ROOT, text, n], { timeout, polling: 'raf' }).then((h) => h.jsonValue(), () => null);
const tx = (f, k) => f.evaluate((k) => window.O55.t(k), k);
async function clickIn(f, sel) { const el = f.locator(`${LAYER} ${sel}`).first(); await el.scrollIntoViewIfNeeded(); await el.click(); }
/* typed at the end of the field; a password is typed afresh (what is in it is selected first) */
async function typeIn(t, f, bind, text) {
	await clickIn(f, `[data-o55-bind="${bind}"]`);
	await t.page.keyboard.press(bind === 'pw' ? 'ControlOrMeta+A' : 'End');
	await t.page.keyboard.type(text, { delay: 20 });
}
const primaryDo = (f) => f.evaluate((L) => { const p = document.querySelector(L + ' .o55-primary'); return p ? p.getAttribute('data-o55-do') + (p.disabled || p.getAttribute('aria-disabled') === 'true' ? ':off' : ':on') : null; }, LAYER);
/* the motion asked for: Reduce Motion with --set motion=reduced, else none (Pip types). Set before the first load (the
   preference holds on the page across loads, and t.goto re-applies it) and again on each route. */
const REDUCED = (t) => t.args.motion === 'reduced';
const setMotion = (t) => t.emulate({ reducedMotion: REDUCED(t) ? 'reduce' : 'no-preference' });
/* the route really runs in that motion: the app frame's media preference, the onboarding's motion clock and Pip's stage
   (58-rig.js setReduced, from 60-ui-core.js stageOf) all say so once the stage is up; a miss stops the route */
async function motionHolds(t, f, tag) {
	const want = REDUCED(t);
	await f.waitForFunction((r) => !!document.querySelector(r + ' .o55-stage.pst'), ROOT, { timeout: 15000 }).catch(() => {});
	const got = await f.evaluate((r) => ({
		media: matchMedia('(prefers-reduced-motion: reduce)').matches,
		clock: !!(window.O55.motion && window.O55.motion.reduced()),
		stages: [...document.querySelectorAll(r + ' .o55-stage.pst')].map((s) => s.dataset.reduced)
	}), ROOT);
	const ok = got.media === want && got.clock === want && got.stages.length > 0 && got.stages.every((d) => d === (want ? '1' : '0'));
	return t.check(`${tag}: ${want ? 'Reduce Motion is on' : 'motion is on'} (media preference, motion clock, Pip's stage)`, ok, JSON.stringify(got), { hard: true });
}
async function begin(t, f, look, mode, screen, tag) {
	await t.app.look(look);
	await setMotion(t);
	await arm(f);
	if (!(await openAt(t, f, screen))) return false;
	await settled(f, screen);
	await motionHolds(t, f, tag);
	if (mode) await f.locator('#pm-o55-onboarding button.o55-talk').first().click();
	await t.page.waitForTimeout(300);
	await take(f);
	return true;
}

export default async function (t) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const only = t.args.only ? String(t.args.only).split(',') : ['smb', 'drive', 'nfs', 'install'];
	const combos = looks.flatMap((look) => [[look, 0], [look, 1]]);
	await setMotion(t);
	for (const [i, [look, mode]] of combos.entries()) {
		const tag = `${look} w${mode}`;
		if (only.includes('smb')) await t.step(`${tag} · smb`, async () => {
			const f = await t.app.open();
			if (!(await begin(t, f, look, mode, 'nas-smb', `${tag} smb`))) return t.check(`${tag}: Sign in to the shared folder opens`, false, 'not opened from its row', { hard: true });
			const wrong = await f.evaluate(() => (window.O55.fixtures.DEMO || {}).wrongPassword || 'not-the-password');
			const cheer = await tx(f, 'pip.cheer.nas.smb.wrong');
			/* 1. quick Check access (typed and pressed at once), then the account edited after the pass */
			await typeIn(t, f, 'user', 'jared'); await typeIn(t, f, 'pw', 'correct horse');
			await clickIn(f, '.o55-primary');
			await t.check(`${tag} smb 1: the check passes`, await checkIs(f, 'nas-smb', 'done'), await primaryDo(f));
			await typing(f, await tx(f, 'pip.say.nas-smb.done'), 6);
			await typeIn(t, f, 'user', '2');
			await t.page.waitForTimeout(500);
			await verdict(t, f, `${tag} smb 1 quick check, account edited after the pass`, ['nas-smb:running', 'nas-smb:done', 'nas-smb:unchecked']);
			/* 2. the account edited while the check runs; the old check ends unseen */
			await typeIn(t, f, 'pw', 'correct horse');
			await clickIn(f, '.o55-primary');
			const ran = await checkIs(f, 'nas-smb', 'running', 4000);
			await typeIn(t, f, 'user', '3');
			await t.page.waitForTimeout(1800);
			await t.check(`${tag} smb 2: the edit while checking leaves the step unchecked`, ran && /^check:/.test(await primaryDo(f)), await primaryDo(f));
			await verdict(t, f, `${tag} smb 2 account edited while the check runs`, ['nas-smb:running', 'nas-smb:unchecked']);
			/* 3. quick successive presses: Check access, the password retyped and Check access again at once */
			await typeIn(t, f, 'pw', 'correct horse');
			await clickIn(f, '.o55-primary');
			await typeIn(t, f, 'pw', 'x');
			await clickIn(f, '.o55-primary');
			await t.check(`${tag} smb 3: the second check passes`, await checkIs(f, 'nas-smb', 'done'), await primaryDo(f));
			await t.page.waitForTimeout(900);
			await verdict(t, f, `${tag} smb 3 password retyped and checked again at once`, ['nas-smb:running', 'nas-smb:done']);
			/* 4. a refused password, the right one, and an input edited as Pip's cheer for it begins (the account in every
			   look and wording; then the password or the domain, alternating) */
			for (const input of ['user', i % 2 ? 'domain' : 'pw']) {
				if (input === 'domain' && !(await f.locator(`${LAYER} [data-o55-bind="domain"]`).count())) await clickIn(f, '[data-o55-do="details"][data-arg="smbdomain"]');
				await typeIn(t, f, 'pw', wrong);
				await clickIn(f, '.o55-primary');
				const refused = await checkIs(f, 'nas-smb', 'failed');
				await typing(f, await tx(f, 'pip.oops.nas.smb.wrong'), 6);
				await typeIn(t, f, 'pw', 'correct horse');
				await clickIn(f, '.o55-primary');
				/* the field to edit is in hand while the check runs, so the edit lands as the cheer's first letters type */
				await checkIs(f, 'nas-smb', 'running', 4000);
				await clickIn(f, `[data-o55-bind="${input}"]`); await t.page.keyboard.press(input === 'pw' ? 'ControlOrMeta+A' : 'End');
				const passed = await checkIs(f, 'nas-smb', 'done');
				const at = await typing(f, cheer, 3);
				await t.page.keyboard.type(input === 'domain' ? 'W' : '4');
				await t.mark(`${tag} cheer begins, ${input} edited`);
				await t.page.waitForTimeout(1500);
				await t.check(`${tag} smb 4 (${input}): refused, then right, and the cheer had begun when ${input} was edited`, refused && passed && !!at && /^check:/.test(await primaryDo(f)), JSON.stringify({ refused, passed, typedAtEdit: at, primary: await primaryDo(f) }));
				await verdict(t, f, `${tag} smb 4 retry cheer, then ${input} edited as it begins`, ['nas-smb:failed', 'nas-smb:done', 'nas-smb:unchecked']);
			}
			/* 5. a refused password, the right one, and the account edited while that check runs: its success is not cheered */
			await typeIn(t, f, 'pw', wrong);
			await clickIn(f, '.o55-primary');
			await checkIs(f, 'nas-smb', 'failed');
			await typeIn(t, f, 'pw', 'correct horse');
			await clickIn(f, '.o55-primary');
			await checkIs(f, 'nas-smb', 'running', 4000);
			await typeIn(t, f, 'user', '5');
			await t.page.waitForTimeout(1800);
			await verdict(t, f, `${tag} smb 5 retry, account edited while it runs`, ['nas-smb:failed', 'nas-smb:running', 'nas-smb:unchecked']);
		});
		if (only.includes('drive') || only.includes('nfs')) await t.step(`${tag} · drive, nfs`, async () => {
			const f = await t.app.open();
			if (!(await begin(t, f, look, mode, 'begin', `${tag} drive`))) return t.check(`${tag}: Begin opens`, false, 'not opened from its row', { hard: true });
			await clickIn(f, '[data-o55-do="pick"][data-arg="existing"]');
			await clickIn(f, '[data-o55-do="sub"][data-arg="device"]');
			await clickIn(f, '.o55-primary'); await settled(f, 'nas-find');
			await clickIn(f, '[data-o55-do="method"][data-arg="mounted"]');
			await clickIn(f, '[data-o55-do="volume"]');
			await take(f);
			await t.mark(`${tag} drive continue`);
			await clickIn(f, '.o55-primary');
			await t.check(`${tag} drive: the check passes`, await checkIs(f, 'nas-mounted', 'done'), await primaryDo(f));
			await t.page.waitForTimeout(900);
			await verdict(t, f, `${tag} drive checking, then done`, ['nas-mounted:running', 'nas-mounted:done']);
			if (!only.includes('nfs')) return;
			await clickIn(f, '[data-o55-do="other"]');
			await settled(f, 'nas-find');
			await clickIn(f, '[data-o55-do="method"][data-arg="nfs"]');
			await t.page.waitForTimeout(500);
			if (!(await f.evaluate((L) => !!document.querySelector(L + ' [data-o55-do="share"][aria-checked="true"]'), LAYER))) await clickIn(f, '[data-o55-do="share"]');
			await t.page.waitForTimeout(400);
			await take(f);
			await t.mark(`${tag} nfs continue`);
			await clickIn(f, '.o55-primary');
			await settled(f, 'nas-nfs');
			await t.check(`${tag} nfs: the check passes`, await checkIs(f, 'nas-nfs', 'done'), await primaryDo(f));
			await t.page.waitForTimeout(900);
			await verdict(t, f, `${tag} nfs checking, then done`, ['nas-nfs:running', 'nas-nfs:done']);
		});
		if (only.includes('install')) await t.step(`${tag} · install`, async () => {
			const f = await t.app.open();
			await t.app.look(look);
			await setMotion(t);
			await arm(f);
			if (!(await openAt(t, f, 'nas-install'))) return t.check(`${tag}: Adding the key opens`, false, 'not opened from its row', { hard: true });
			await motionHolds(t, f, `${tag} install`);
			if (mode) await f.locator('#pm-o55-onboarding button.o55-talk').first().click();
			await t.check(`${tag} install: the install passes`, await checkIs(f, 'nas-install', 'done'), await primaryDo(f));
			await t.page.waitForTimeout(900);
			await verdict(t, f, `${tag} install running, then done`, ['nas-install:done']);
		});
	}
}
