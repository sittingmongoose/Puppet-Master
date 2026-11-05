// FO-33: Home's Budget projection chart, at the kit's default 1920 x 1080, in all ten looks (or --set looks=a,b). Its
// axis labels are reached by scrolling the board: Home's board scroller (div.pmu-scroll, overflow auto) is wheeled with
// the real mouse until the whole chart is in its window, and then every label ($0 to the top of the scale, and the
// dates) lies wholly inside the scroller's window and the window of every box that holds it, with nothing laid over it.
// The audit's overflow rule, scoped to the chart's card, passes there too. Wheeled back to the top, the label the scroll
// fold cuts (Friendly's "$150", 8 px out) is reported as a NOTE: content under an ordinary scroll fold, not a fault.
// browser-check 2.0.9 still counts it against the tab body that holds the scroller, whose edge is the scroller's own
// (gap bc4548), so the kit's looks check can fail on it until the tool is fixed. Both surfaces with --set sandbox=0/1.
// About 1 minute.
import { LOOKS } from '../browser-check.config.mjs';

const PLOT = '.pmu-budgetplot';

/* the chart's labels and the boxes that show them: the board scroller's window and every clipping box up to the page */
const GEO = (sel) => {
	const plot = document.querySelector(sel);
	if (!plot) return null;
	const R = (b) => ({ l: +b.left.toFixed(1), t: +b.top.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1) });
	let sc = null;
	const clips = [];
	for (let e = plot.parentElement; e && e !== document.body; e = e.parentElement) {
		const cs = getComputedStyle(e);
		if (cs.overflowY === 'visible' && cs.overflowX === 'visible') continue;
		const b = e.getBoundingClientRect(), win = R({ left: b.left + e.clientLeft, top: b.top + e.clientTop, right: b.left + e.clientLeft + e.clientWidth, bottom: b.top + e.clientTop + e.clientHeight });
		if (!sc && /^(auto|scroll)$/.test(cs.overflowY) && e.scrollHeight > e.clientHeight) sc = { win, st: e.scrollTop, max: e.scrollHeight - e.clientHeight, name: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ').join('.') };
		clips.push({ name: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0], win });
	}
	const labels = [...plot.querySelectorAll('svg text')].filter((x) => x.textContent.trim()).map((x) => {
		const b = x.getBoundingClientRect(), cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
		const hit = document.elementFromPoint(cx, cy);
		/* nothing laid over it: the point hits the label, its svg, or a layer of the chart drawn with no pointer events */
		const top = !!hit && (hit === x || plot.contains(hit) || hit.contains(plot));
		return { text: x.textContent.trim(), box: R(b), top };
	});
	return { scroller: sc, clips, plot: R(plot.getBoundingClientRect()), labels };
};
const inside = (b, w) => b.l >= w.l - 0.5 && b.r <= w.r + 0.5 && b.t >= w.t - 0.5 && b.b <= w.b + 0.5;
/* the chart has stopped moving (its draw-in and a look's re-render): the labels' boxes are the same twice running */
async function steady(t, f) {
	let last = '';
	for (let i = 0; i < 40; i++) {
		const g = await f.evaluate(GEO, PLOT), sig = g ? JSON.stringify(g.labels.map((x) => x.box)) + JSON.stringify(g.plot) : '';
		if (g && g.labels.length && sig === last) return g;
		last = sig; await t.page.waitForTimeout(250);
	}
	return f.evaluate(GEO, PLOT);
}
/* the real wheel over the scroller's window, until its scroll position is `to` (a number, or 'chart': the whole chart in
   its window) */
async function wheelTo(t, f, to) {
	for (let i = 0; i < 40; i++) {
		const g = await f.evaluate(GEO, PLOT), w = g.scroller.win;
		const dy = to === 'top' ? -g.scroller.st : Math.min(g.scroller.max - g.scroller.st, Math.max(0, g.plot.b + 6 - w.b));
		if (Math.abs(dy) < 1) return g;
		const off = t.root === t.page ? { x: 0, y: 0 } : await t.page.evaluate(() => { const fr = document.querySelector('iframe'); const b = fr.getBoundingClientRect(); return { x: b.left + fr.clientLeft, y: b.top + fr.clientTop }; });
		await t.page.mouse.move(off.x + (w.l + w.r) / 2, off.y + (w.t + w.b) / 2);
		await t.page.mouse.wheel(0, Math.sign(dy) * Math.min(120, Math.abs(dy)));
		await t.page.waitForTimeout(160);
	}
	return f.evaluate(GEO, PLOT);
}

export default async function (t) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const f = await t.app.open();
	await t.app.resetLayout();
	for (const look of looks) {
		await t.step(look, async () => {
			await t.app.look(look);
			let g = await steady(t, f);
			if (!(await t.check(`${look}: Home shows the Budget projection chart in a board scroller`, !!(g && g.scroller && g.labels.length), g ? `scroller ${g.scroller ? g.scroller.name : 'none'}, ${g.labels.length} labels` : 'no chart'))) return;
			g = await wheelTo(t, f, 'top');
			/* at the top: a label the fold cuts is ordinary scrolled content; say which, for the tool gap */
			const w0 = g.scroller.win, cut = g.labels.filter((x) => x.box.t < w0.b && x.box.b > w0.b);
			if (cut.length) t.log(`NOTE ${look}: at the top, the scroll fold (${w0.b}) crosses ${cut.map((x) => `"${x.text}" ${x.box.t}-${x.box.b}`).join(', ')}`);
			g = await wheelTo(t, f, 'chart');
			g = await steady(t, f);
			const w = g.scroller.win;
			await t.check(`${look}: the scroller is wheeled until the whole chart is in its window`, inside(g.plot, w), `plot ${JSON.stringify(g.plot)}, window ${JSON.stringify(w)}, scrollTop ${g.scroller.st}/${g.scroller.max}`);
			const out = g.labels.filter((x) => !inside(x.box, w) || g.clips.some((c) => !inside(x.box, c.win)));
			await t.check(`${look}: every axis label is wholly inside the scroller's window and every box that holds it`, !out.length, out.length ? out.map((x) => `"${x.text}" ${JSON.stringify(x.box)}`).join('; ') + ` window ${JSON.stringify(w)}` : `${g.labels.length} labels: ${g.labels.map((x) => x.text).join(', ')}`);
			const covered = g.labels.filter((x) => !x.top);
			await t.check(`${look}: nothing is laid over the labels`, !covered.length, covered.map((x) => x.text).join(', ') || 'all on top');
			await f.evaluate((sel) => { document.querySelectorAll('[data-fo33-card]').forEach((e) => e.removeAttribute('data-fo33-card')); const c = document.querySelector(sel).closest('.pmu-cardbody'); if (c) c.setAttribute('data-fo33-card', ''); }, PLOT);
			await t.noOverflow(`${look}: no overflow in the chart's card, scrolled into view`, { scope: '[data-fo33-card]' });
			await wheelTo(t, f, 'top');
		});
	}
}
