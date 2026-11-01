// p32 and p70 (Opus footage review, pass 2, P2-2), in all ten looks on "Which device has the files?" (nas-find):
// - p70: an empty radio ring on a choice card (.o55-check) must stand 3:1 against the card behind it (WCAG 1.4.11). The
//   ring's colour is laid over the card as painted (a pixel read inside the ring, Glass's frost included), so the ratio
//   is what a person sees, with no anti-aliasing in it.
// - p32: a refused field keeps the refused edge (orange; NieR Mode's own error ink): the port field after 99999 is typed,
//   and a field with a prefix (the online copy's name after its owner), drawn by the wizard's own field component.
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((fam) => [`${fam}-light`, `${fam}-dark`]);
const L = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
// a computed colour: rgb()/rgba(), or color(srgb r g b / a) with 0-1 channels (what color-mix() computes to)
const rgba = (s) => {
	let m = /color\(srgb ([^)]+)\)/.exec(s);
	if (m) { const p = m[1].split(/[ /]+/).filter(Boolean).map(Number); return [p[0] * 255, p[1] * 255, p[2] * 255, p.length > 3 ? p[3] : 1]; }
	m = /rgba?\(([^)]+)\)/.exec(s); if (!m) throw new Error('unread colour ' + s);
	const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
};
const over = (c, bg) => [0, 1, 2].map((i) => c[i] * c[3] + bg[i] * (1 - c[3]));
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

async function pixel(t, x, y) {
	const png = decodePng(await t.page.screenshot({ clip: { x: Math.round(x), y: Math.round(y), width: 1, height: 1 } }));
	return [png.data[0], png.data[1], png.data[2]];
}

async function applyLook(t, f, look, bad) {
	const [fam, mode] = look.split('-');
	await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
	const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || ''; const nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
	if (!ok) bad.push(`${look}: the look did not apply`);
	await f.waitForTimeout(2000);
	await t.page.mouse.move(2, 2);
	return ok;
}

export default async function (t) {
	await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	const f = t.page;
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 60000 });
	const screen = await f.evaluate(() => { try { window.O55.ui.go('nas-find', { noHistory: true }); } catch (e) { /* reported below */ } return window.O55.S.sess.screen; });
	await t.check('the screen opens (nas-find)', screen === 'nas-find', `screen ${screen}`, { hard: true });
	await f.waitForFunction((l) => document.querySelectorAll(l + ' .o55-card[data-o55-do="device"]').length >= 2, L, { timeout: 15000 });
	// one card chosen, so the other's ring is empty
	await f.evaluate((l) => { const c = [...document.querySelectorAll(l + ' .o55-card[data-o55-do="device"]')].find((x) => (x.querySelector('.o55-cardtitle') || x).textContent.trim() === 'Home NAS'); if (c && !c.classList.contains('o55-on')) c.click(); }, L);
	await f.waitForTimeout(1200);

	// p70: the empty ring, in every look
	const ringBad = [], ringRows = [];
	for (const look of LOOKS) {
		if (!(await applyLook(t, f, look, ringBad))) continue;
		const r = await f.evaluate((l) => {
			const chk = [...document.querySelectorAll(l + ' .o55-card:not(.o55-on) > .o55-check')].find((e) => e.getBoundingClientRect().width > 0);
			if (!chk) return null;
			chk.scrollIntoView({ block: 'center' });
			const b = chk.getBoundingClientRect(), cs = getComputedStyle(chk);
			return { x: b.left, y: b.top, w: b.width, h: b.height, ring: cs.borderTopColor, width: cs.borderTopWidth };
		}, L);
		if (!r) { ringBad.push(`${look}: no empty ring on screen`); continue; }
		await f.waitForTimeout(300);
		const card = await pixel(t, r.x + r.w / 2, r.y + r.h / 2);
		const ring = over(rgba(r.ring), card), cr = ratio(ring, card);
		ringRows.push(`${look}: ring ${r.ring} ${r.width} on card rgb(${card.join(', ')}): ${cr.toFixed(2)}:1`);
		if (cr < 3) ringBad.push(`${look} ${cr.toFixed(2)}:1`);
	}
	ringRows.forEach((x) => t.log('p70 ' + x));
	await t.check('p70: an empty radio ring stands 3:1 against its card in every look', ringBad.length === 0, ringBad.join('; '));

	// p32: a refused field, in every look
	await f.evaluate((l) => document.querySelector(l + ' [data-o55-do="manualOn"]').click(), L);
	await f.waitForSelector(L + ' .o55-field-port input', { timeout: 10000 });
	await f.fill(L + ' .o55-field-port input', '99999');
	await f.waitForSelector(L + ' .o55-field-port.o55-invalid input', { timeout: 10000 });
	await f.evaluate(() => document.activeElement && document.activeElement.blur());
	const fieldBad = [], fieldRows = [];
	for (const look of LOOKS) {
		if (!(await applyLook(t, f, look, fieldBad))) continue;
		const r = await f.evaluate((l) => {
			const port = document.querySelector(l + ' .o55-field-port.o55-invalid input');
			const main = document.querySelector(l + ' .o55-main') || document.querySelector(l + ' .o55-content');
			const box = document.createElement('div');
			box.innerHTML = window.O55.c.field({ bind: 'fx-p32', label: 'Name', prefix: 'owner/', value: 'taken-name', invalid: true, error: 'taken' });
			main.appendChild(box);
			const wrap = box.querySelector('.o55-inputwrap');
			const nier = document.documentElement.getAttribute('data-o55-nier') === 'on';
			const probe = (c) => { const e = document.createElement('i'); e.style.color = c; port.parentElement.appendChild(e); const v = getComputedStyle(e).color; e.remove(); return v; };
			// the edge: a border in the refused colour, or (the Liquid Glass layer, NieR Mode's underline) an inset shadow in it
			const want = probe(nier ? 'var(--o55-nier-error)' : 'var(--accent-orange)');
			const edge = (e) => { if (!e) return { ok: false, how: 'missing' }; const c = getComputedStyle(e); const w = parseFloat(c.borderTopWidth) || 0;
				if (w > 0 && c.borderTopColor === want) return { ok: true, how: `border ${c.borderTopWidth}` };
				if (c.boxShadow.includes(want) && /inset/.test(c.boxShadow)) return { ok: true, how: 'inset shadow' };
				return { ok: false, how: `border ${c.borderTopColor} ${c.borderTopWidth}, shadow ${c.boxShadow.slice(0, 80)}` }; };
			const out = { want, port: edge(port), wrap: edge(wrap) };
			box.remove();
			return out;
		}, L);
		fieldRows.push(`${look}: refused ${r.want}; port field ${r.port.ok ? 'ok' : 'NO'} (${r.port.how}); prefixed field ${r.wrap.ok ? 'ok' : 'NO'} (${r.wrap.how})`);
		if (!r.port.ok) fieldBad.push(`${look} port field: ${r.port.how}`);
		if (!r.wrap.ok) fieldBad.push(`${look} prefixed field: ${r.wrap.how}`);
	}
	fieldRows.forEach((x) => t.log('p32 ' + x));
	await t.check('p32: a refused field keeps the refused edge in every look (the port field, a prefixed field)', fieldBad.length === 0, fieldBad.join('; '));
}
