// FO-159 round 2 evidence, precise: native crops of the elements a line-count comparison named, located by their
// own words AND the box width the baseline recorded for them (the same words also appear in other containers that
// were already two lines on main, so words alone pick the wrong one).
//   browser-check run diagnostics/fo159-crops2.check.mjs --set page=<build> --set sandbox=0|1 --set look=basic-dark \
//     --set size=1280x500 --set nav=home | --set nav=code:testing:history \
//     --set targets=<json> --set out=<dir>
// targets.json: [{"name":"...","text":"17 recorded · 15 finalized","width":276}, ...]
import fs from 'node:fs';
import path from 'node:path';

const settle = (t, ms = 350) => t.page.waitForTimeout(ms);

async function setLookBySetting(t, f, look) {
	const [family, mode] = look.split('-');
	await f.evaluate(() => window.PM51.go('general', 'app-input'));
	await f.waitForFunction(() => !!document.querySelector('select[data-setting="general.visual.theme"]'), null, { timeout: 15000 }).catch(() => {});
	await t.page.waitForTimeout(600);
	for (const [setting, value] of [
		['general.visual.theme', family === 'nier' ? 'NieR' : family[0].toUpperCase() + family.slice(1)],
		['general.visual.theme-mode', mode === 'light' ? 'Light' : 'Dark'],
	]) {
		const trigger = f.locator(`select[data-setting="${setting}"]`).locator('..').locator('.pm51-dd-trigger');
		if (!(await trigger.count())) return false;
		const labels = await f.locator(`select[data-setting="${setting}"] option`).allTextContents();
		const name = labels.includes(value) ? value : `${value} ${mode === 'light' ? 'Light' : 'Dark'}`;
		await trigger.first().scrollIntoViewIfNeeded();
		await trigger.first().click();
		await f.getByRole('option', { name, exact: true }).click({ timeout: 8000 });
		await f.locator('.pm51-dd-list').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
		await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy()), null, { timeout: 15000 }).catch(() => {});
		await t.page.waitForTimeout(400);
	}
	await f.waitForFunction(([fam, m]) => {
		const theme = document.documentElement.getAttribute('data-theme') || '';
		const nier = !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier');
		return fam === 'nier' ? nier && theme.endsWith('-' + m) : !nier && theme === fam + '-' + m;
	}, [family, mode], { timeout: 20000 }).catch(() => {});
	await t.page.waitForTimeout(500);
	return true;
}

export const tests = {};
tests['FO-159 native crops by text and recorded width'] = async (t) => {
	const look = String(t.args.look || 'basic-dark');
	const [w, h] = String(t.args.size || '1280x500').split('x').map(Number);
	const nav = String(t.args.nav || 'home');
	const targets = JSON.parse(fs.readFileSync(String(t.args.targets), 'utf8'));
	const out = String(t.args.out);
	fs.mkdirSync(out, { recursive: true });
	await t.viewport(w, h);
	const f = await t.app.open({});
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	await setLookBySetting(t, f, look);
	const theme = await f.evaluate(() => document.documentElement.getAttribute('data-theme'));
	await t.check(`measured under ${look}`, theme === look || (look.startsWith('nier') && (theme || '').startsWith('nier')), `painted ${theme}`);

	if (nav === 'home') {
		await f.locator('#pm-settings-root [data-action="home"]').first().click().catch(() => {});
	} else {
		const [domain, ws, tab] = nav.split(':');
		await f.evaluate(([d, x]) => window.PM51.go(d, x), [domain, ws]);
		await f.waitForFunction((x) => { const b = document.querySelector(`[data-continuous-workspace-body="${x}"]`); return !!b && b.getAttribute('data-workspace-mounted') === 'true'; }, ws, { timeout: 15000 }).catch(() => {});
		if (tab) {
			await f.evaluate(([x, id]) => { window.PM51.setTab(x, id); window.PM51.refresh(x, { swap: false }); }, [ws, tab]);
			await f.waitForFunction(([x, id]) => { const b = document.querySelector(`[data-continuous-workspace-body="${x}"]`); const a = b && b.querySelector('.pm51-tabs .manager-tab.active'); return !!a && a.getAttribute('data-tab') === id; }, [ws, tab], { timeout: 8000 }).catch(() => {});
		}
	}
	await settle(t, 600);

	for (const target of targets) {
		const found = await f.evaluate(([text, want]) => {
			const stage = document.getElementById('workspace-stage');
			const own = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
			const cands = [];
			for (const el of stage.querySelectorAll('*')) {
				const txt = own(el);
				if (!txt || !txt.startsWith(text)) continue;
				if (!el.getClientRects().length) continue;
				const cs = getComputedStyle(el);
				const cw = el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
				cands.push({ el, txt, width: +cw.toFixed(1) });
			}
			if (!cands.length) return { none: true };
			cands.sort((a, b) => Math.abs(a.width - want) - Math.abs(b.width - want));
			const best = cands[0];
			best.el.scrollIntoView({ block: 'center' });
			best.el.setAttribute('data-fo159-crop', '1');
			const rects = [];
			for (const n of best.el.childNodes) {
				if (n.nodeType !== 3 || !n.textContent.trim()) continue;
				const r = document.createRange();
				r.selectNodeContents(n);
				rects.push(...r.getClientRects());
			}
			const tops = [...new Set(rects.map((b) => Math.round(b.top)))];
			const card = best.el.closest('article, .domain-card, .capture-fixture, .home-panel, .attention-row, .setup-row, .panel-card, .info-row') || best.el;
			card.setAttribute('data-fo159-card', '1');
			const chain = [];
			let n = best.el;
			for (let i = 0; i < 6 && n && n !== document.body; i++, n = n.parentElement) chain.push(`${n.tagName.toLowerCase()}${typeof n.className === 'string' && n.className.trim() ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}[${n.clientWidth}x${n.clientHeight}]`);
			return { width: best.width, lines: tops.length, fs: getComputedStyle(best.el).fontSize, text: best.txt.slice(0, 70), all: cands.slice(0, 4).map((c) => c.width), chain: chain.join(' < '), inner: `${window.innerWidth}x${window.innerHeight}`, outer: `${window.outerWidth}x${window.outerHeight}`, frame: `${window.frameElement ? window.frameElement.clientWidth + 'x' + window.frameElement.clientHeight : 'top'}` };
		}, [target.text, target.width]);
		if (!found || found.none) { await t.check(`${target.name} found`, false, `no element starts "${target.text}"`); continue; }
		await t.page.waitForTimeout(250);
		const boxes = await f.evaluate(() => {
			const el = document.querySelector('[data-fo159-crop]');
			const card = document.querySelector('[data-fo159-card]');
			/* page.screenshot clips in document coordinates, so the viewport rect is shifted by the scroll */
			const r = (n) => { const b = n.getBoundingClientRect(); return [b.x + window.scrollX, b.y + window.scrollY, b.width, b.height].map((v) => +v.toFixed(1)); };
			return el && card ? { el: r(el), card: r(card) } : null;
		});
		const clip = (r, pad) => {
			const x = Math.max(0, r[0] - pad), y = Math.max(0, r[1] - pad);
			return { x, y, width: Math.max(1, Math.min(w - x, r[2] + pad * 2)), height: Math.max(1, Math.min(h - y, r[3] + pad * 2)) };
		};
		if (boxes) {
			// Element screenshots: Playwright finds the element, scrolls it into view and captures it at native scale,
			// whatever scroller owns it (the Settings document is its own scroller, so page coordinates cannot be used).
			await f.locator('[data-fo159-crop]').first().screenshot({ path: path.join(out, `${target.name}-el.png`) }).catch(() => {});
			await f.locator('[data-fo159-card]').first().screenshot({ path: path.join(out, `${target.name}-card.png`) }).catch(() => {});
		}
		const dpr = await f.evaluate(() => window.devicePixelRatio);
		t.log(`${target.name}: ${found.fs} ${found.lines} line(s) in ${found.width}px (wanted ${target.width}; candidates ${found.all.join(', ')}) dpr ${dpr} inner ${found.inner} outer ${found.outer} frame ${found.frame} | ${found.chain} | "${found.text}"`);
		await t.check(`${target.name} captured (${found.lines} line(s) at ${found.fs})`, !!boxes);
	}
};
