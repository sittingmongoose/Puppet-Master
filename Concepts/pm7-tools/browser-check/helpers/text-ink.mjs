import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
/* The ink a piece of text paints: its element photographed as it is and with its text made transparent; a pixel that
   changes is ink, and its contrast is read against the same pixel without the text. (painted-text.mjs counts only
   fully covered stems through black and white masks, and found none on Away From Home's demo-answer chips in Retro and
   NieR although they paint plainly: batch 11 lane A, run lane-final-normal, fail-01.) */
const lum = (c) => c.map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
export async function ink(el) {
	const saved = await el.evaluate((e) => e.getAttribute('style'));
	const a = decodePng(await el.screenshot());
	await el.evaluate((e) => { for (const n of [e, ...e.querySelectorAll('*')]) { n.style.setProperty('color', 'transparent', 'important'); n.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); n.style.setProperty('text-shadow', 'none', 'important'); } });
	let b; try { b = decodePng(await el.screenshot()); } finally { await el.evaluate((e, st) => { for (const n of e.querySelectorAll('*')) { n.style.removeProperty('color'); n.style.removeProperty('-webkit-text-fill-color'); n.style.removeProperty('text-shadow'); } if (st === null) e.removeAttribute('style'); else e.setAttribute('style', st); }, saved); }
	if (a.width !== b.width || a.height !== b.height) return { n: 0, contrast: 0 };
	const cs = [];
	let peak = { contrast: 0, ink: null, ground: null };
	for (let i = 0; i < a.data.length; i += 4) {
		const p = [a.data[i], a.data[i + 1], a.data[i + 2]], q = [b.data[i], b.data[i + 1], b.data[i + 2]];
		if (Math.max(...p.map((v, k) => Math.abs(v - q[k]))) < 48) continue;
		const x = lum(p), y = lum(q), c = (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); cs.push(c);
		if (c > peak.contrast) peak = { contrast: c, ink: p, ground: q };
	}
	cs.sort((x, y) => y - x);
	/* peak: the strongest ink pixel against the same pixel without the text (FO-169 r2). Grey antialiasing only blends
	   ink toward its ground, so it never exceeds the ink colour's own contrast: a lower bound on it, and the closest
	   reading to painted-text.mjs's fully covered stems for small text that has none. */
	return { n: cs.length, contrast: cs.length ? Number(cs[Math.floor(cs.length * 0.1)].toFixed(2)) : 0, peak: { ...peak, contrast: Number(peak.contrast.toFixed(2)) } };
}
