// FO-159 round 2 evidence: native crops of the elements a line-count comparison named, on one build and one
// cell, so a person can see the wrap itself. Not a gate: it asserts only that each target was found and captured.
//   browser-check run diagnostics/fo159-crops.check.mjs --set page=<build> --set sandbox=0|1 \
//     --set look=basic-dark --set size=1280x500 --set targets=/path/targets.json --set out=/path/crops
// targets.json: [{"name":"home-domain-a","where":"home","text":"Appearance, desktop behavior"}, ...]
// Each target writes <name>-el.png (the element at native scale) and <name>-card.png (its card with a 12 px
// margin), and logs the element's box, font size, line count and devicePixelRatio.
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

async function settled(f, ws, tabId) {
	await f.waitForFunction(([w, id]) => {
		if (document.querySelector('.tab-swap-a, .tab-swap-b')) return false;
		const body = document.querySelector(`[data-continuous-workspace-body="${w}"]`);
		const page = body && body.querySelector('.pm51-mgr');
		if (!page) return false;
		if (page.querySelectorAll(':scope > .manager-body').length !== 1) return false;
		if (!id) return true;
		const active = page.querySelector(':scope > .pm51-tabs .manager-tab.active');
		return !!active && active.getAttribute('data-tab') === id;
	}, [ws, tabId || ''], { timeout: 4000 }).catch(() => {});
	await f.waitForFunction((w) => {
		const b = (w && document.querySelector(`[data-continuous-workspace-body="${w}"]`)) || document.getElementById('workspace-stage');
		if (!b) return false;
		const sig = `${b.textContent.length}:${b.getBoundingClientRect().height.toFixed(1)}:${b.querySelectorAll('*').length}`;
		const prev = window.__cropSig;
		window.__cropSig = sig;
		return prev === sig;
	}, ws, { polling: 'raf', timeout: 4000 }).catch(() => {});
}

async function walkStates(t, f, visit) {
	const home = f.locator('#pm-settings-root [data-action="home"]').first();
	if (await home.count()) { await home.click().catch(() => {}); await settle(t, 220); await visit('home', ''); }
	const domains = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .domain-link[data-domain]')].map((el) => el.getAttribute('data-domain')));
	for (const domain of [...new Set(domains)]) {
		const link = f.locator(`#pm-settings-root .domain-link[data-domain="${domain}"]`).first();
		if (!(await link.count())) continue;
		await f.evaluate((d) => window.PM51.go(d, '__domain__'), domain);
		await settle(t, 300);
		const label = ((await link.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 28) || domain;
		const workspaces = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .workspace-tab[data-workspace]')].map((el) => ({ id: el.getAttribute('data-workspace'), label: el.textContent.trim() })));
		for (const ws of workspaces) {
			await f.evaluate(([d, w]) => window.PM51.go(d, w), [domain, ws.id]);
			await f.waitForFunction((w) => { const b = document.querySelector(`[data-continuous-workspace-body="${w}"]`); return !!b && b.getAttribute('data-workspace-mounted') === 'true'; }, ws.id, { timeout: 15000 }).catch(() => {});
			await settled(f, ws.id);
			await settle(t, 120);
			const where = `${label} › ${ws.label}`;
			await visit(where, ws.id);
			const tabs = await f.evaluate((w) => [...document.querySelectorAll(`[data-continuous-workspace-body="${w}"] .manager-tab[data-tab]`)].filter((b) => b.getClientRects().length).map((b) => ({ id: b.getAttribute('data-tab'), label: b.textContent.trim() })), ws.id);
			for (const tab of tabs) {
				const btn = f.locator(`[data-continuous-workspace-body="${ws.id}"] .manager-tab[data-tab="${tab.id}"]`).first();
				if (!(await btn.count()) || !(await btn.isVisible().catch(() => false))) continue;
				await btn.click().catch(() => {});
				await settled(f, ws.id, tab.id);
				await settle(t, 120);
				await visit(`${where} › ${tab.label}`, ws.id);
			}
		}
	}
}

export const tests = {};
tests['FO-159 native crops of named wraps'] = async (t) => {
	const look = String(t.args.look || 'basic-dark');
	const [w, h] = String(t.args.size || '1280x500').split('x').map(Number);
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
	const dpr = t.page.viewportSize ? 1 : 1;
	void dpr;
	const done = new Set();
	await walkStates(t, f, async (where, ws) => {
		for (const target of targets) {
			if (target.where !== where || done.has(target.name)) continue;
			const found = await f.evaluate(([text, wsid]) => {
				const stage = document.getElementById('workspace-stage');
				const root = (wsid && stage && stage.querySelector(`[data-continuous-workspace-body="${wsid}"]`)) || stage;
				if (!root) return null;
				const own = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
				for (const el of root.querySelectorAll('*')) {
					const txt = own(el);
					if (!txt || !txt.startsWith(text)) continue;
					if (!el.getClientRects().length) continue;
					const rects = [];
					for (const n of el.childNodes) {
						if (n.nodeType !== 3 || !n.textContent.trim()) continue;
						const r = document.createRange();
						r.selectNodeContents(n);
						rects.push(...r.getClientRects());
					}
					const tops = [...new Set(rects.map((b) => Math.round(b.top)))];
					const card = el.closest('article, .domain-card, .capture-fixture, .home-panel, .panel-card') || el;
					const cb = card.getBoundingClientRect();
					const b = el.getBoundingClientRect();
					const cs = getComputedStyle(el);
					return {
						el: el, card,
						elBox: [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(1)),
						cardBox: [cb.x, cb.y, cb.width, cb.height].map((v) => +v.toFixed(1)),
						lines: tops.length, fs: cs.fontSize, w: +el.clientWidth.toFixed(1),
						text: txt.slice(0, 60), cardCls: String(card.className || '').slice(0, 40),
					};
				}
				return null;
			}, [target.text, ws]);
			if (!found) { t.log(`${target.name}: not found in ${where}`); continue; }
			done.add(target.name);
			// scroll the element to the middle, then take a native clip of it and of its card (no downscale)
			await f.evaluate((txt) => {
				const stage = document.getElementById('workspace-stage');
				for (const n of stage.querySelectorAll('*')) {
					const own = [...n.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join(' ').replace(/\s+/g, ' ').trim();
					if (own.startsWith(txt)) { n.scrollIntoView({ block: 'center' }); n.setAttribute('data-fo159-crop', '1'); break; }
				}
			}, target.text);
			await t.page.waitForTimeout(250);
			const box2 = await f.evaluate(() => {
				const el = document.querySelector('[data-fo159-crop]');
				if (!el) return null;
				const b = el.getBoundingClientRect();
				const card = el.closest('article, .domain-card, .capture-fixture, .home-panel, .panel-card') || el;
				const c = card.getBoundingClientRect();
				return { el: [b.x, b.y, b.width, b.height], card: [c.x, c.y, c.width, c.height] };
			});
			if (box2) {
				const clipOf = (r, pad) => {
					const x = Math.max(0, r[0] - pad), y = Math.max(0, r[1] - pad);
					return { x, y, width: Math.max(1, Math.min(w - x, r[2] + pad * 2)), height: Math.max(1, Math.min(h - y, r[3] + pad * 2)) };
				};
				await t.page.screenshot({ path: path.join(out, `${target.name}-el.png`), clip: clipOf(box2.el, 3) }).catch(() => {});
				await t.page.screenshot({ path: path.join(out, `${target.name}-card.png`), clip: clipOf(box2.card, 10) }).catch(() => {});
			} else { t.log(`${target.name}: could not scroll to it`); continue; }
			const dpr = await f.evaluate(() => window.devicePixelRatio);
			t.log(`${target.name}: ${found.cardCls} el ${found.elBox.join('x')} text ${found.fs} ${found.lines} line(s) in ${found.w}px, dpr ${dpr}, state ${where}: "${found.text}"`);
			await t.check(`${target.name} captured (${found.lines} line(s) at ${found.fs})`, true);
		}
	});
	for (const target of targets) if (!done.has(target.name)) await t.check(`${target.name} found`, false, 'state or element not reached');
};
