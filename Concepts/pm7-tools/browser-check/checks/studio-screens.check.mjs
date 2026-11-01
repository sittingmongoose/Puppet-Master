// FO-17 kind (final-onb): Demo Studio › Onboarding › Open at one screen. A screen opened straight skips its enter(), so a
// screen whose finish needs what enter() sets could never finish (c-route: the pairing finished and Continue stayed dim,
// the run adopted under the main context). Every screen in the Studio's list is opened from its row, in a fresh page,
// and walked by real clicks through its next screens (three by default, --set depth=), or to the window closing on a
// finish screen: the primary when it is on, else a demo hint that works, a first choice, a sample in an empty field,
// then the screen's own buttons. A walk fails where a screen reaches no other screen: nothing changed for 30 s, or 90 s
// on one screen. The walk goes past the first next screen because the context enter() sets is read later: FO-17's
// c-route reached its review, and the pairing two screens on could not finish. The new situations are walked on the
// screens they change: oldKey, oldKeyWorks and oldKeyLocked on the NAS key screens, guestLater on the Server pairing
// screens. A few cases press a choice first, for the paths that go back (a straight open has no history, and back()
// went nowhere): c-route by Tailscale (FO-17's own route), ai-none's sign-up choice, nas-install's Try again after a
// refused password, c-pair after a pairing request expired (Use a code instead shows only after a denial, which no
// situation makes, so its way back is covered by the seeded history, not walked). --set only=c-route,nas-key walks some screens; --set extras=0 leaves
// the situations and these cases out. About 45 minutes.

const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
/* valid samples for the fields the flow asks for (tools/onboarding_explorer.mjs, the acceptance scenarios' values) */
const SAMPLES = {
	name: 'Book club website', user: 'jared', pw: 'correct horse', phrase: 'river candle orbit maple quiet lantern', repo: 'book-club-site',
	proxy: 'https://pm.example.net', code: '482 913', addr: '192.168.1.20', address: '192.168.1.20', port: '22', headscale: 'https://headscale.example.com',
	link: 'pm-remote-link:home-nas/7Q2K', custom: '~/Documents/Clubs', newName: 'book-club-site-2', pass: 'passphrase for the test',
	simEmail: 'jared@example.com', simUser: 'jared-p', token: 'not-a-real-token', word: 'river'
};
/* never pressed by the walk: they leave, undo, explain or restyle rather than move the screen on */
const DENY = /^(tip|details|back|skip|later|close|quit|exit|cancel|sheet-close|copyText|look|sound|voice|lang|mode|expert|plain|startOver|restart|forget|remove|delete|demoHint|manualOn|manualOff)$/i;
const DENY_LABEL = /skip|later|cancel|not now|start over|remove|forget|delete|close|quit/i;
const EXTRAS = [['oldKey', ['nas-find', 'nas-identity', 'nas-key']], ['oldKeyWorks', ['nas-find', 'nas-identity', 'nas-key']],
	['oldKeyLocked', ['nas-find', 'nas-identity', 'nas-key']], ['guestLater', ['s-kind', 's-wait', 's-confirm']]];
/* cases that press a choice first: [screen, situation twist or null, [[action, arg], ...]] */
const PATHS = [['c-route', null, [['more', null], ['route', 'tailscale']]], ['ai-none', null, [['pick', 'sub']]],
	['nas-install', 'wrongPassword', []], ['c-pair', 'pairExpires', []]];

/* in-page: what the walk can see and press on the current screen */
const LOOK_NOW = (L) => {
	const S = window.O55 && window.O55.S;
	if (!S || !S.open) return { closed: true };
	const l = document.querySelector(L);
	const shown = (e) => e.getClientRects().length && e.getBoundingClientRect().width > 0 && !e.closest('[inert]');
	const at = (e) => { e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y); return { x, y, hit: !!top && (top === e || e.contains(top)) }; };
	const off = (e) => e.disabled || e.getAttribute('aria-disabled') === 'true';
	const p = l && l.querySelector('.o55-primary');
	const works = window.O55.t('demoHint.outcome.works');
	const pick = (list) => list.filter(shown).filter((e) => !off(e)).map((e) => ({ key: (e.getAttribute('data-o55-do') || '') + '|' + (e.getAttribute('data-arg') || '') + '|' + (e.textContent || '').trim().slice(0, 30), ...at(e) })).filter((c) => c.hit);
	const hints = l ? pick([...l.querySelectorAll('[data-o55-do="demoHint"]')].filter((e) => (e.querySelector('.o55-demohint-o') || {}).textContent === works)) : [];
	const groups = l ? [...l.querySelectorAll('[role="radiogroup"]')].filter((g) => shown(g) && !g.querySelector('[role="radio"][aria-checked="true"]')) : [];
	const radios = groups.length ? pick([...groups[0].querySelectorAll('[role="radio"]')]) : [];
	const fields = l ? [...l.querySelectorAll('input[data-o55-bind], textarea[data-o55-bind]')].filter(shown).filter((e) => !e.value && e.type !== 'checkbox' && e.type !== 'radio').map((e) => ({ bind: e.getAttribute('data-o55-bind'), ...at(e) })).filter((c) => c.hit) : [];
	const buttons = l ? pick([...l.querySelectorAll('button[data-o55-do]')].filter((e) => !e.classList.contains('o55-primary') && !e.classList.contains('o55-back') && !e.closest('.o55-demohint'))) : [];
	let h = 0; const html = l ? l.innerHTML : ''; for (let i = 0; i < html.length; i++) h = (h * 31 + html.charCodeAt(i)) | 0;
	const running = Object.values(S.sess.ops || {}).some((o) => o && o.state === 'running') || !!(l && l.querySelector('[aria-busy="true"]'));
	return {
		screen: S.sess.screen, active: S.sess.active, sig: h, running, hints, radios, fields, buttons,
		primary: p && shown(p) ? { label: p.textContent.trim().replace(/\s+/g, ' '), off: off(p), reason: p.getAttribute('data-disabled-reason') || '', ...at(p) } : null,
		settled: !!l && l.getAttribute('data-screen') === S.sess.screen && !document.documentElement.hasAttribute('data-o55-vt') && !l.matches('.o55-hold, .o55-entering')
	};
};

export default async function (t) {
	const only = t.args.only ? String(t.args.only).split(',') : null, depth = Number(t.args.depth || 3);
	let f = await t.app.open();   // the page, or T3's sandbox (--set sandbox=1)
	const chapters = await f.evaluate(() => window.O55.studio.SCREEN_CHAPTERS.map(([, ids]) => ids).flat());
	const cases = chapters.filter((id) => !only || only.includes(id)).map((id) => ({ screen: id, twist: null }));
	if (String(t.args.extras) !== '0') {
		for (const [tw, ids] of EXTRAS) for (const id of ids) if (!only || only.includes(id)) cases.push({ screen: id, twist: tw });
		for (const [id, tw, pre] of PATHS) if (!only || only.includes(id)) cases.push({ screen: id, twist: tw, pre });
	}
	const stuck = [];
	for (const c of cases) {
		const name = c.screen + (c.twist ? ' (' + c.twist + ')' : '') + (c.pre && c.pre.length ? ' [' + c.pre.map((x) => x.filter(Boolean).join(' ')).join(', ') + ']' : '');
		/* each case from a clean record: a walk that left a Project being created would otherwise send the next open to
		   Creating (by design: a Project being made is never abandoned half-made) */
		await f.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
		f = await t.app.open();
		await f.evaluate(() => window.O55.studio.open('onboarding'));
		await f.waitForSelector('#pmds-sheet [data-pmds-do="open-screen"]', { timeout: 15000 });
		/* the situation, by its chips: Fresh computer, every twist off, then this case's twist */
		await f.click('#pmds-sheet [data-pmds-do="pick-base"][data-arg="fresh"]');
		for (let i = 0; i < 12; i++) {
			const on = f.locator('#pmds-sheet [data-pmds-do="pick-twist"][aria-checked="true"]');
			if (!(await on.count())) break;
			await on.first().click(); await t.page.waitForTimeout(150);
		}
		if (c.twist) { const chip = f.locator(`#pmds-sheet [data-pmds-do="pick-twist"][data-arg="${c.twist}"]`); if (!(await chip.count())) { t.check(`${name}: the situation is listed`, false, 'no chip'); continue; } await chip.click(); }
		const sit = await f.evaluate(() => window.O55.studio.currentSituation());
		const row = f.locator(`#pmds-sheet [data-pmds-do="open-screen"][data-arg="${c.screen}"]`);
		if ((await row.getAttribute('aria-disabled')) === 'true') { t.check(`${name}: on this page`, false, 'its row is off'); continue; }
		await row.scrollIntoViewIfNeeded(); await row.click();
		const opened = await f.waitForFunction((s) => window.O55.S.open && window.O55.S.sess && window.O55.S.sess.screen === s, c.screen, { timeout: 15000 }).then(() => true, () => false);
		if (!opened) { t.check(`${name}: opens from its row`, false, 'screen ' + (await f.evaluate(() => window.O55.S.sess && window.O55.S.sess.screen))); continue; }
		for (const [act, arg] of c.pre || []) {
			const sel = `${LAYER} [data-o55-do="${act}"]` + (arg != null ? `[data-arg="${arg}"]` : '');
			/* (a control that shows once the screen is waiting, such as c-pair's Use a code instead, is waited for) */
			const shown = await f.waitForSelector(sel, { state: 'visible', timeout: 10000 }).then(() => true, () => false);
			const el = f.locator(sel);
			if (!shown) { t.check(`${name}: ${act} ${arg || ''} is on the screen`, false, 'absent after 10 s'); break; }
			await el.first().scrollIntoViewIfNeeded(); await el.first().click();
		}
		const path = [c.screen];
		let t0 = Date.now(), pressed = new Map(), trail = [];
		let last = null, changedAt = Date.now(), end = null, now = null;
		while (Date.now() - t0 < 90000) {
			now = await f.evaluate(LOOK_NOW, LAYER);
			if (now.closed) { end = path.join(' > ') + ' > finished (the window closed)'; break; }
			if (now.screen !== path[path.length - 1]) {
				path.push(now.screen);
				if (path.length > depth) { end = path.join(' > '); break; }
				t0 = Date.now(); pressed = new Map(); last = null; changedAt = Date.now();
				continue;
			}
			const sig = now.sig + '|' + now.running + '|' + (now.primary && now.primary.off);
			if (sig !== last) { last = sig; changedAt = Date.now(); }
			if (Date.now() - changedAt > 30000) break;
			if (!now.settled || now.running) { await t.page.waitForTimeout(400); continue; }
			const press = async (target, what) => { pressed.set(target.key || what, (pressed.get(target.key || what) || 0) + 1); trail.push(what); await t.page.mouse.click(target.x, target.y); await t.page.waitForTimeout(700); };
			const fresh = (x) => (pressed.get(x.key) || 0) < 2;
			if (now.primary && !now.primary.off && now.primary.hit && (pressed.get('primary:' + now.sig) || 0) < 2) { pressed.set('primary:' + now.sig, (pressed.get('primary:' + now.sig) || 0) + 1); trail.push(now.primary.label); await t.page.mouse.click(now.primary.x, now.primary.y); await t.page.waitForTimeout(900); continue; }
			const hint = now.hints.find(fresh);
			if (hint) { await press(hint, 'hint ' + hint.key.split('|')[2]); continue; }
			if (now.radios.length && fresh(now.radios[0])) { await press(now.radios[0], 'choose ' + now.radios[0].key.split('|')[2]); continue; }
			const field = now.fields.find((x) => (pressed.get('field:' + x.bind) || 0) < 1);
			if (field) {
				pressed.set('field:' + field.bind, 1); trail.push('type ' + field.bind);
				await t.page.mouse.click(field.x, field.y); await t.page.keyboard.type(SAMPLES[field.bind] || 'test value'); await t.page.waitForTimeout(500); continue;
			}
			const btn = now.buttons.find((x) => fresh(x) && !DENY.test(x.key.split('|')[0]) && !DENY_LABEL.test(x.key.split('|')[2]));
			if (btn) { await press(btn, btn.key.split('|')[2] || btn.key.split('|')[0]); continue; }
			await t.page.waitForTimeout(700);
		}
		const detail = end || `${path.join(' > ')}: stuck on ${path[path.length - 1]} for ${Math.round((Date.now() - changedAt) / 1000)} s: primary ${now && now.primary ? `"${now.primary.label}" ${now.primary.off ? 'off: ' + (now.primary.reason || 'no reason') : 'on'}` : 'none'}, context ${now && now.active}, situation ${sit}; pressed ${trail.slice(-8).join(' > ')}`;
		if (!end) stuck.push(name);
		t.check(`${name}: walks by clicks from its row through its next screens`, !!end, detail);
		if (t.log) t.log(`${name}: ${detail}`);
	}
	t.check('every screen in Open at one screen walks on by clicks', !stuck.length, stuck.join(', ') || `${cases.length} cases`);
}
