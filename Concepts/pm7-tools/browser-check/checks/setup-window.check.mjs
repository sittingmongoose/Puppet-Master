// FO-20's token fix: Settings' setup window (kit.d/60-wizard.js, 45-setup.css) draws with each look's own tokens. They
// never rendered from 2026-09-27 until 2026-11-02 (a selector outranked them), so this reads them in all ten looks: Settings
// › Source Control › Add another account or instance › GitLab, always in T3's sandbox (t.openInSandbox's default flags,
// whatever --set sandbox says). Per look: a native crop of the window; the audit's overflow and clipped text on the window
// (t.noOverflow); and text contrast from the window's computed colours laid over its opaque ground, 4.5:1 at any size
// (F3-654), the same for text on the accent (the primary button), and 3:1 for the chosen card's accent edge.
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);

async function openSetup(t, f, look) {
	await f.evaluate(() => document.getElementById('tab-settings').click());
	await f.waitForTimeout(2200);
	await f.evaluate(() => document.querySelector('#pm-settings-root .domain-link[data-domain="source"]').click());
	await f.waitForTimeout(1800);
	const at = async (sel) => { const p = await f.evaluate((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0); if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel); if (!p) return false; await t.page.mouse.click(p.x, p.y); await f.waitForTimeout(700); return true; };
	if (!(await at('[data-action="pm51-source-add-service"]'))) return 'no Add another account or instance';
	// the dialog's Service: a native select or the kit's dropdown, set to GitLab
	const picked = await f.evaluate(() => {
		const dlg = [...document.querySelectorAll('.dialog')].find((d) => d.getBoundingClientRect().width > 0); if (!dlg) return 'no dialog';
		const sel = dlg.querySelector('select');
		if (sel) { const o = [...sel.options].find((x) => /gitlab/i.test(x.textContent) || /gitlab/i.test(x.value)); if (!o) return 'no GitLab'; sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); return 'native'; }
		return 'dropdown';
	});
	if (picked === 'dropdown') {
		await at('.dialog .pm51-dd-trigger');
		if (!(await at('.pm51-dd-menu [role="option"], .pm51-dd-option, [data-action="pm51-dd-pick"]'))) return 'no dropdown options';
		const ok = await f.evaluate(() => { const o = [...document.querySelectorAll('.pm51-dd-menu [role="option"], .pm51-dd-option, [data-action="pm51-dd-pick"]')].find((x) => /gitlab/i.test(x.textContent)); if (!o) return false; o.click(); return true; });
		if (!ok) return 'no GitLab option';
		await f.waitForTimeout(400);
	} else if (picked !== 'native') return picked;
	if (!(await at('.dialog [data-action="dialog-save"], .dialog .btn-primary, .dialog button[type="submit"]'))) return 'no Continue';
	await f.waitForTimeout(1200);
	// a connect panel first, for some services: its Connect opens the window
	if (!(await f.evaluate(() => !!document.querySelector('.o55g-win')))) await at('.drawer [data-action*="connect"], .drawer .btn-primary');
	const ok = await f.waitForFunction(() => { const w = document.querySelector('.o55g-win'); return !!w && w.getBoundingClientRect().width > 300; }, null, { timeout: 8000 }).then(() => true, () => false);
	if (!ok) return 'no setup window';
	// the look last, with the window open: Settings puts back its saved look as it opens things, and the kit's look is not
	// saved; the window's tokens follow the look live
	await f.waitForTimeout(800);
	await t.app.look(look);
	await f.waitForTimeout(1600);
	await t.page.mouse.move(2, 2);
	return null;
}

export default async function (t) {
	const rows = [], bad = [];
	for (const look of LOOKS) {
		const f = await t.app.open({ sandbox: true });
		const why = await openSetup(t, f, look);
		if (why) { bad.push(`${look}: ${why}`); continue; }
		const info = await f.evaluate(() => {
			const w = document.querySelector('.o55g-win'), cs = getComputedStyle(w), b = w.getBoundingClientRect();
			const rgba = (s) => { let m = /color\(srgb ([^)]+)\)/.exec(s); if (m) { const p = m[1].split(/[ /]+/).filter(Boolean).map(Number); return [p[0] * 255, p[1] * 255, p[2] * 255, p.length > 3 ? p[3] : 1]; } m = /rgba?\(([^)]+)\)/.exec(s); if (!m) return [0, 0, 0, 0]; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
			const over = (c, g) => [0, 1, 2].map((i) => c[i] * c[3] + g[i] * (1 - c[3]));
			const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
			const ratio = (a, g) => { const x = lum(a), y = lum(g); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
			// the window's ground: its fill colour over the look's background where it isn't opaque, then a gradient's first stop
			// over that (Glass draws the window as a gradient over the background)
			const gradStop = (img) => { const m = /(rgba?\([^)]+\)|color\(srgb [^)]+\))/.exec(img); return m ? rgba(m[1]) : null; };
			const lookBg = (() => { const e = document.createElement('i'); e.style.color = 'var(--background)'; w.appendChild(e); const v = rgba(getComputedStyle(e).color); e.remove(); return v; })();
			let base = rgba(cs.backgroundColor); base = base[3] < 1 ? over(base, lookBg) : base.slice(0, 3);
			const stop = gradStop(cs.backgroundImage), ground = stop ? over(stop, base) : base;
			// what paints behind an element: its own and its ancestors' fills down to the window, laid over the ground
			const bgOf = (e) => { const stack = []; for (let n = e; n && n !== w.parentElement; n = n.parentElement) { const c = getComputedStyle(n); const fill = gradStop(c.backgroundImage) || rgba(c.backgroundColor); if (fill[3] > 0) stack.push(fill); if (n === w) break; } let g = ground.slice(0, 3); for (let i = stack.length - 1; i >= 0; i--) g = over(stack[i], g); return g; };
			const texts = [], fails = [];
			for (const e of w.querySelectorAll('*')) {
				if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
				const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
				const c = getComputedStyle(e); if (c.visibility === 'hidden' || +c.opacity === 0) continue;
				if (e.closest('[aria-disabled="true"], :disabled, [aria-hidden="true"]')) continue;
				const fg = rgba(c.color), bgc = bgOf(e), cr = ratio(over(fg, bgc), bgc);
				// 4.5:1 at any size: interface text in Puppet Master's canon (F3-654) has no large-text allowance
				const need = 4.5, txt = e.textContent.trim().slice(0, 28);
				texts.push({ txt, cr: +cr.toFixed(2), need });
				if (cr < need) fails.push(`"${txt}" ${cr.toFixed(2)}:1 (needs ${need}; ${e.tagName.toLowerCase()}.${String(e.className).split(' ').filter(Boolean).slice(0, 2).join('.')} ${c.color} opacity ${c.opacity} on rgb(${bgc.map(Math.round).join(',')}))`);
			}
			// the chosen card's accent edge against the card's ground
			const on = w.querySelector('.o55g-card.is-on, .o55g-card[aria-checked="true"]');
			let edge = null;
			if (on) { const c = getComputedStyle(on); const e = over(rgba(c.borderTopColor), bgOf(on.parentElement)); edge = +ratio(e, bgOf(on.parentElement)).toFixed(2); if (edge < 3) fails.push(`chosen card edge ${edge}:1 (needs 3)`); }
			// the primary action: its words on its fill, whether or not the step lets it be pressed yet
			const probe = (v) => { const e = document.createElement('i'); e.style.color = v; w.appendChild(e); const c = rgba(getComputedStyle(e).color); e.remove(); return c; };
			const act = over(probe('var(--g-action)'), ground), onAct = probe('var(--g-on-accent)'), actCr = +ratio(over(onAct, act), act).toFixed(2);
			if (actCr < 4.5) fails.push(`the main action's words ${actCr}:1 (needs 4.5)`);
			const tok = (k) => cs.getPropertyValue(k).trim();
			const theme = document.documentElement.getAttribute('data-theme') + (document.documentElement.getAttribute('data-o55-nier') === 'on' || window.PM_NIER && PM_NIER.on() ? ' (NieR)' : '');
			const canvases = w.querySelectorAll('canvas').length;
			return { actCr, theme, canvases, rect: { x: Math.max(0, b.left), y: Math.max(0, b.top), width: Math.min(b.width, innerWidth), height: Math.min(b.height, innerHeight) }, fails, n: texts.length, min: Math.min(...texts.map((x) => x.cr)), edge,
				tokens: { inkAccent: tok('--g-ink-accent').slice(0, 50), action: tok('--g-action').slice(0, 50), accent: tok('--g-accent'), onAccent: tok('--g-on-accent'), r: tok('--g-r'), cardR: tok('--g-card-r'), btnR: tok('--g-btn-r'), line: tok('--g-line'), win: tok('--g-win-bg').slice(0, 70), ease: tok('--g-ease') }, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, img: cs.backgroundImage.slice(0, 60) };
		});
		await t.crop(`setup-${look}`, info.rect, `${look}: Settings' setup window, Connect GitLab`);
		// the audit's overflow and clipped text, on the window (the page under its backdrop is not what is read here)
		await t.noOverflow(`setup window ${look}: no overflow or clipped text`, { scope: '.o55g-win' });
		rows.push(`${look} (data-theme ${info.theme}; ${info.canvases} canvas in the window): ${info.n} text runs, lowest ${info.min.toFixed(2)}:1; main action ${info.actCr}:1; chosen edge ${info.edge}:1; corner ${info.radius}; tokens ${JSON.stringify(info.tokens)}`);
		info.fails.forEach((x) => { bad.push(`${look}: ${x.replace(/ \(needs.*$/, '')}`); t.log(`${look} FAILS ${x}`); });
	}
	rows.forEach((r) => t.log(r));
	await t.check('the setup window reads in all ten looks (text 4.5:1 at any size, the chosen edge 3:1)', bad.length === 0, bad.slice(0, 12).join('; ') + (bad.length > 12 ? ` (+${bad.length - 12} more)` : ''));
}
