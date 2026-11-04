// FO-41: Pip's line on the shared-folder and drive steps follows their check. On main before the fix Pip stayed on the
// step's opening line after the check passed (NFS "Opening the share…", SMB "Sign in to the shared folder", a connected
// drive "Which drive is it on?"). In all ten looks (or --set looks=a,b), by real clicks and typing from Demo Studio ›
// Onboarding › Open at one screen:
//   smb      Sign in to the shared folder: the opening line; account and password typed, Check access pressed: the
//            stage on the checking line while it runs and the bubble saying it, then the done line once it passes; the
//            account changed: the opening line again, with Check access back in place of Continue. In the first look
//            only: a refused password shows Pip's oops line, and the right one then the done line, or the cheer for the
//            fault put right in its place.
//   drive    Checking the drive: the done line once its check passes; Choose another drive, NFS on Where are the files,
//            a share, Continue: the NFS step's done line once its own check passes.
// Each line is read from Pip's bubble as painted (shown, typed out, not empty), against the copy the page holds
// (pip.say.<screen>.<line>), and from the stage's spec (its lineId). Motion as the kit sets it; --set motion=on for
// motion. Both surfaces with --set sandbox=0/1. About 4 minutes a surface.
import { LOOKS } from '../browser-check.config.mjs';

const ROOT = '#pm-o55-onboarding';
const LAYER = `${ROOT} .o55-pane > .o55-layer:not(.o55-out)`;

/* what Pip says now: the stage's spec and the bubble as painted (on, typed out, its text) */
const PIP = (root) => {
	const host = document.querySelector(root + ' .o55-stage'), st = host && window.O55.pipStage.of ? window.O55.pipStage.of(host) : null;
	const b = document.querySelector(root + ' .pst-bubble'), on = b && b.querySelector('.pst-bt-on');
	const cs = b && getComputedStyle(b), r = b && b.getBoundingClientRect();
	return {
		screen: window.O55.S.sess && window.O55.S.sess.screen,
		lineId: st && st.spec ? st.spec.lineId : null,
		saying: st ? st.saying || '' : '',
		painted: !!(b && b.classList.contains('on') && !b.classList.contains('typing') && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5 && r.width > 8 && r.height > 8),
		text: on ? on.textContent.trim() : ''
	};
};
const line = (f, scr, id) => f.evaluate(([s, i]) => window.O55.t('pip.say.' + s + '.' + i), [scr, id]);

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
/* the screen is in and still (its layer settled, no view transition) */
const settled = (f, screen) => f.waitForFunction(([L, s]) => { const l = document.querySelector(L); return !!l && l.getAttribute('data-screen') === s && window.O55.S.sess.screen === s && !document.documentElement.hasAttribute('data-o55-vt') && !l.matches('.o55-hold, .o55-entering'); }, [LAYER, screen], { timeout: 15000 }).then(() => true, () => false);
/* the step's own check (the key the step reads, 70-screens-nas.js checkKey) has this state; on a page from before
   checkKey (the control build), the step's latest check of its kind */
const checkIs = (f, screen, state, timeout = 15000) => f.waitForFunction(([s, want]) => {
	const S = window.O55.S, ops = S.sess.ops || {};
	const k = window.O55.nas.checkKey ? window.O55.nas.checkKey(S, s) : Object.keys(ops).filter((x) => x.startsWith({ 'nas-smb': 'smb:', 'nas-nfs': 'nfs:', 'nas-mounted': 'mounted:' }[s])).pop();
	const st = k ? ops[k] : null;
	return want === 'none' ? !st : !!st && st.state === want;
}, [screen, state], { timeout }).then(() => true, () => false);
/* Pip says one of these lines, painted and typed out, for 300 ms running (a line on its way out is not it) */
async function says(t, f, want, ms = 9000) {
	const t0 = Date.now(); let p = null, since = 0;
	while (Date.now() - t0 < ms) {
		p = await f.evaluate(PIP, ROOT);
		if (p.painted && want.includes(p.text)) { if (!since) since = Date.now(); else if (Date.now() - since >= 300) return { ok: true, p }; }
		else since = 0;
		await t.page.waitForTimeout(100);
	}
	return { ok: false, p };
}
/* every line the bubble starts, in order (its whole text, typed or not), from now until played() */
const record = (f) => f.evaluate((root) => { clearInterval(window.__fo41T); window.__fo41 = []; let last = ''; window.__fo41T = setInterval(() => { const b = document.querySelector(root + ' .pst-bubble'), t = b && b.classList.contains('on') ? ((b.querySelector('.pst-bt') || {}).textContent || '').trim() : ''; if (t && t !== last) { last = t; window.__fo41.push(t); } }, 40); }, ROOT);
const played = (f) => f.evaluate(() => { clearInterval(window.__fo41T); return window.__fo41 || []; });
const show = (p) => p ? `bubble ${p.painted ? '' : '(not painted) '}"${p.text}", lineId ${p.lineId}, screen ${p.screen}` : 'no stage';
async function clickIn(f, sel) { const el = f.locator(`${LAYER} ${sel}`).first(); await el.scrollIntoViewIfNeeded(); await el.click(); }
async function typeIn(t, f, bind, text) { await clickIn(f, `[data-o55-bind="${bind}"]`); await t.page.keyboard.type(text, { delay: 30 }); }
/* away from the fields, so Pip's typing line lets go (60-ui-core.js holds it 1.25 s after the last key) */
async function leaveFields(t, f) { await clickIn(f, '.o55-title'); await t.page.waitForTimeout(1400); }
const primary = (f) => f.evaluate((L) => { const p = document.querySelector(L + ' .o55-primary'); return p ? { label: p.textContent.trim().replace(/\s+/g, ' '), off: p.getAttribute('aria-disabled') === 'true' || p.disabled } : null; }, LAYER);

export default async function (t) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	if (t.args.motion === 'on') await t.emulate({ reducedMotion: 'no-preference' });
    await t.step('drive checking · both wordings', async () => {
        for (let mode = 0; mode < 2; mode++) {
            const f = await t.app.open();
            await t.app.look('friendly-light');
            if (t.args.motion === 'on') await t.emulate({ reducedMotion: 'no-preference' });
            await openAt(t, f, 'begin'); await settled(f, 'begin');
            if (mode) await f.locator('#pm-o55-onboarding button.o55-talk').first().click();
            await clickIn(f, '[data-o55-do="pick"][data-arg="existing"]');
            await clickIn(f, '[data-o55-do="sub"][data-arg="device"]');
            await clickIn(f, '.o55-primary'); await settled(f, 'nas-find');
            await clickIn(f, '[data-o55-do="method"][data-arg="mounted"]');
            await clickIn(f, '[data-o55-do="volume"]');
            await record(f); await t.mark('drive selected ' + mode);
            await clickIn(f, '.o55-primary');
            const ran = await checkIs(f, 'nas-mounted', 'running', 4000);
            const p = await f.evaluate(PIP, ROOT);
            await t.check(`drive checking wording ${mode}: stage follows running check`, ran && p.lineId === 'checking', show(p));
            await t.check('drive check completes', await checkIs(f, 'nas-mounted', 'done'), '');
            const done = await line(f, 'nas-mounted', 'done'), checking = await line(f, 'nas-mounted', 'checking');
            await says(t, f, [done]);
            const seq = await played(f);
            await t.check(`drive checking wording ${mode}: bubble starts checking then done, no drive question`, seq.includes(checking) && seq.indexOf(done) > seq.indexOf(checking) && !seq.includes(await line(f, 'nas-mounted', 'enter')), seq.join(' > '));
            await t.mark('drive complete ' + mode);
        }
    });
    if (t.args.driveOnly) return;

	for (const [i, look] of looks.entries()) {
		await t.step(`${look} · smb`, async () => {
			const f = await t.app.open();
			await t.app.look(look);
			if (t.args.motion === 'on') await t.emulate({ reducedMotion: 'no-preference' });
			if (!(await openAt(t, f, 'nas-smb'))) return t.check(`${look}: Sign in to the shared folder opens`, false, 'not opened from its row', { hard: true });
			await settled(f, 'nas-smb');
			const enter = await line(f, 'nas-smb', 'enter'), done = await line(f, 'nas-smb', 'done'), checking = await line(f, 'nas-smb', 'checking');
			await t.check(`${look} smb: the done line is in the copy`, !!done && !/^pip\./.test(done), done);
			let r = await says(t, f, [enter]);
			await t.check(`${look} smb: the opening line before the check`, r.ok, show(r.p));
			await typeIn(t, f, 'user', 'jared');
			await typeIn(t, f, 'pw', 'correct horse');
			await leaveFields(t, f);
			await record(f);
			await clickIn(f, '.o55-primary');
			const ran = await checkIs(f, 'nas-smb', 'running', 4000);
			const during = await f.evaluate(PIP, ROOT);
			await t.check(`${look} smb: the stage is on the checking line while the check runs`, ran && during.lineId === 'checking', show(during));
			await t.check(`${look} smb: the check passes`, await checkIs(f, 'nas-smb', 'done'), 'check state');
			r = await says(t, f, [done]);
			await t.check(`${look} smb: the done line once the check passes`, r.ok && r.p.lineId === 'done', show(r.p));
			/* the bubble's lines from the press: the checking line, then the done line (the bubble queues a line until the one
			   before has shown its moment, 58-rig.js say) */
			const seq = await played(f), at = seq.indexOf(checking);
			await t.check(`${look} smb: the bubble said the checking line, then the done line`, at >= 0 && seq.indexOf(done, at) > at, seq.join(' > '));
			if (i === 0) await t.mark('smb done line');
			/* the account changed: the pass is the old account's, so the step and Pip start over */
			await typeIn(t, f, 'user', '2');
			await leaveFields(t, f);
			const pr = await primary(f);
			r = await says(t, f, [enter]);
			await t.check(`${look} smb: the account changed: the opening line again`, r.ok && r.p.lineId === 'enter' && !!pr && pr.label === (await f.evaluate(() => window.O55.t('nas.smb.check'))), `${show(r.p)}; primary ${JSON.stringify(pr)}`);
			if (i === 0) {
				/* a refused password: Pip's oops line; then the right one: the done line (its cheer may be said first) */
				const wrong = await f.evaluate(() => (window.O55.fixtures.DEMO || {}).wrongPassword || 'not-the-password');
				await typeIn(t, f, 'pw', wrong);
				await leaveFields(t, f);
				await clickIn(f, '.o55-primary');
				await t.check(`${look} smb: the wrong password is refused`, await checkIs(f, 'nas-smb', 'failed'), 'check state');
				const oops = await f.evaluate(() => window.O55.t('pip.oops.nas.smb.wrong'));
				r = await says(t, f, [oops]);
				await t.check(`${look} smb: refused: Pip's oops line, not the done line`, r.ok, show(r.p));
				await typeIn(t, f, 'pw', 'correct horse');
				await leaveFields(t, f);
				await clickIn(f, '.o55-primary');
				await t.check(`${look} smb: the right password passes`, await checkIs(f, 'nas-smb', 'done'), 'check state');
				const cheer = await f.evaluate(() => window.O55.t('pip.cheer.nas.smb.wrong'));
				/* (after a fault, the cheer for it is said in the done line's place: 60-ui-core.js renderScene, RV-11) */
				r = await says(t, f, [done, cheer]);
				await t.check(`${look} smb: put right: the done line or its cheer`, r.ok && r.p.lineId === 'done', show(r.p));
			}
		});
		await t.step(`${look} · drive, then nfs`, async () => {
			const f = await t.app.open();
			await t.app.look(look);
			if (t.args.motion === 'on') await t.emulate({ reducedMotion: 'no-preference' });
			if (!(await openAt(t, f, 'nas-mounted'))) return t.check(`${look}: Checking the drive opens`, false, 'not opened from its row', { hard: true });
			await settled(f, 'nas-mounted');
			await t.check(`${look} drive: the check passes`, await checkIs(f, 'nas-mounted', 'done'), 'check state');
			const dDone = await line(f, 'nas-mounted', 'done');
			await t.check(`${look} drive: the done line is in the copy`, !!dDone && !/^pip\./.test(dDone), dDone);
			let r = await says(t, f, [dDone]);
			await t.check(`${look} drive: the done line once the check passes`, r.ok && r.p.lineId === 'done', show(r.p));
			if (i === 0) await t.mark('drive done line');
			/* another way in: NFS on Where are the files, a share, Continue */
			await clickIn(f, '[data-o55-do="other"]');
			await settled(f, 'nas-find');
			await clickIn(f, '[data-o55-do="method"][data-arg="nfs"]');
			await t.page.waitForTimeout(500);
			const picked = await f.evaluate((L) => !!document.querySelector(L + ' [data-o55-do="share"][aria-checked="true"]'), LAYER);
			if (!picked) await clickIn(f, '[data-o55-do="share"]');
			await t.page.waitForTimeout(400);
			await clickIn(f, '.o55-primary');
			await settled(f, 'nas-nfs');
			await t.check(`${look} nfs: the check passes`, await checkIs(f, 'nas-nfs', 'done'), 'check state');
			const nDone = await line(f, 'nas-nfs', 'done');
			r = await says(t, f, [nDone]);
			await t.check(`${look} nfs: the done line once the check passes`, r.ok && r.p.lineId === 'done', show(r.p));
			if (i === 0) await t.mark('nfs done line');
		});
	}
}
