// FO-201 (Jared's QA of 2026-11-13, streams/F/jared-qa-20261113/JARED-QA.md, chat-core-label-subagents.png): the chat
// Working card's orbit centre disc (.orbit-core in chat-assistant-concepts/5.6 Pro/orbit.js) wrote its live label
// ("Subagents", "Preparing") across the disc's ring on both sides. The label was capped at the disc's square content box,
// and the circle's chord at the label's row, under Pip, is narrower than that box.
// On Home's chat column, in every look (--set looks=), at every dial width the orbit's container queries reach (the
// stage's --orbit-dial-w set from 126 to 248 px, which crosses the 150, 168 and 190 px steps; --set widths=), for every
// core label (the manifest's workingStates, the runs' own subjects and "Waiting for you", longest first), every line:
//   inside  its ink box (the glyphs' own bounds: the line's text measured in the label's font, placed on the line's
//           baseline) sits inside the circle's inner edge at its row with 2 px or more to spare; the row is the ink
//           box's edge furthest from the disc's centre, where the chord is narrowest
//   whole   the label shows its words in full: no ellipsis, nothing clipped by its box, no word broken inside
// The dial as the page lays it out is judged too. Crops: per look the smallest and largest dial, with the label that
// has the least room. Fails main 69a5f383b7: 997 of 2,880 cases on the normal page, in every look at the page's own
// 82 px disc (Friendly's "App control" 3.8 px past the ring's inner edge) and up to 13.6 px past it on smaller dials.
//   --set looks=glass-dark,...   --set widths=126,160,...   --set labels=Subagents,...   --set sandbox=0|1 (run both)
//   --set css=<file> adds a stylesheet to the page (to try a change before a build)   --set dump=<out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { LOOKS } from '../browser-check.config.mjs';

const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const WIDTHS = [126, 140, 150, 151, 160, 168, 169, 180, 190, 191, 206, 220, 232, 240, 248];
const SPARE = 2;

// In the app's frame: the live core, its label lines' ink boxes and the room each has.
function install() {
	const stage = () => [...document.querySelectorAll('.working-card .orbit-stage')].find((s) => { const c = s.querySelector('.orbit-core'); return c && c.getClientRects().length; }) || null;
	const ctx = document.createElement('canvas').getContext('2d');
	const caseOf = (s, tt) => (tt === 'uppercase' ? s.toUpperCase() : tt === 'lowercase' ? s.toLowerCase() : tt === 'capitalize' ? s.replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase()) : s);
	const measure = () => {
		const st = stage(); if (!st) return null;
		const dial = st.querySelector('.orbit-dial'), core = st.querySelector('.orbit-core'), lab = core.querySelector('strong');
		const cr = core.getBoundingClientRect(), cs = getComputedStyle(core), k = cr.width / core.offsetWidth;
		const R = cr.width / 2 - parseFloat(cs.borderTopWidth) * k, cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
		const ls = getComputedStyle(lab);
		// measured at 100 px and scaled: at the label's own size the canvas rounds the glyph bounds to whole pixels
		const fsz = parseFloat(ls.fontSize), u = fsz / 100 * k;
		ctx.font = `${ls.fontStyle} ${ls.fontWeight} 100px ${ls.fontFamily}`;
		try { ctx.letterSpacing = ls.letterSpacing === 'normal' ? '0px' : (parseFloat(ls.letterSpacing) * 100 / fsz) + 'px'; } catch (e) { /* older canvas */ }
		ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
		// the label's characters, grouped into lines by their boxes
		const rows = [];
		for (const n of lab.childNodes) {
			if (n.nodeType !== 3) continue;
			for (let i = 0; i < n.data.length; i++) {
				const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
				const b = [...r.getClientRects()].find((x) => x.width > 0 || x.height > 0); if (!b) continue;
				let row = rows.find((x) => Math.abs(x.top - b.top) < 2);
				if (!row) { row = { top: b.top, chars: [] }; rows.push(row); }
				row.chars.push({ c: n.data[i], l: b.left, r: b.right, t: b.top, b: b.bottom });
			}
		}
		rows.sort((a, b) => a.top - b.top);
		const lr = lab.getBoundingClientRect();
		const lines = rows.map((row) => {
			const ink = row.chars.filter((c) => c.c.trim()); if (!ink.length) return null;
			const text = ink.map((c) => c.c).join(''), shown = row.chars.map((c) => c.c).join('').trim();
			const box = { l: Math.min(...ink.map((c) => c.l)), r: Math.max(...ink.map((c) => c.r)), t: Math.min(...ink.map((c) => c.t)), b: Math.max(...ink.map((c) => c.b)) };
			const m = ctx.measureText(caseOf(shown, ls.textTransform));
			// the line's box is the font's ascent and descent, each rounded to a whole pixel as the layout does
			const asc = Math.round(m.fontBoundingBoxAscent * fsz / 100) * k, fh = asc + Math.round(m.fontBoundingBoxDescent * fsz / 100) * k;
			// the glyphs' bounds on the line's baseline (the box's top plus the font's ascent); where the box is not the
			// font's own (a fallback face drew it), the box itself, which holds the glyphs
			const fromFont = Math.abs(box.b - box.t - fh) <= 1.5;
			const base = box.t + asc;
			const inkBox = fromFont
				? { l: box.l - m.actualBoundingBoxLeft * u, r: box.l + m.actualBoundingBoxRight * u, t: base - m.actualBoundingBoxAscent * u, b: base + m.actualBoundingBoxDescent * u }
				: box;
			const room = (b) => {
				const far = Math.max(Math.abs(b.t - cy), Math.abs(b.b - cy));
				const half = far < R ? Math.sqrt(R * R - far * far) : -Infinity;
				return { far: +far.toFixed(2), spare: +(half - Math.max(cx - b.l, b.r - cx)).toFixed(2) };
			};
			const rI = room(inkBox), rB = room(box);
			return { text: shown, ink: fromFont ? 'font' : 'box', spare: rI.spare, row: rI.far, boxSpare: rB.spare,
				// glyphs outside the label's own box, where a clipping overflow cuts them (main's overflow: hidden cut the foot
				// of a g in Friendly's and NieR's faces, whose descender passes the 1.15 line)
				w: +(inkBox.r - inkBox.l).toFixed(2), clipped: ls.overflow !== 'visible' && (inkBox.l < lr.left - 0.5 || inkBox.r > lr.right + 0.5 || inkBox.t < lr.top - 0.5 || inkBox.b > lr.bottom + 0.5) };
		}).filter(Boolean);
		const words = (lab.textContent || '').trim().split(/\s+/);
		const broken = lines.some((ln) => ln.text.split(/\s+/).some((p) => !words.includes(p)));
		return {
			text: (lab.textContent || '').trim(), dialW: +dial.getBoundingClientRect().width.toFixed(1), coreD: +cr.width.toFixed(2), R: +R.toFixed(2),
			font: `${ls.fontWeight} ${ls.fontSize} ${ls.fontFamily.split(',')[0]}`, transform: cs.transform, lines,
			ellipsis: ls.textOverflow === 'ellipsis' && (lab.scrollWidth > lab.clientWidth + 0.5),
			overflow: { w: lab.scrollWidth - lab.clientWidth, h: lab.scrollHeight - lab.clientHeight, clip: ls.overflow }, broken,
			min: lines.length ? Math.min(...lines.map((l) => l.spare)) : null,
		};
	};
	// a dial width, or the page's own with null; wait for the transitions to end and the core to rest
	const dialTo = async (w) => {
		// a rule, not the stage's style attribute, which the chat's next patch would take away
		let rule = document.getElementById('fo201-dial');
		if (!rule) { rule = document.createElement('style'); rule.id = 'fo201-dial'; document.head.appendChild(rule); }
		rule.textContent = w == null ? '' : `.working-card .orbit-stage { --orbit-dial-w: ${w}px !important; }`;
		const t0 = performance.now(); let last = '', same = 0;
		while (performance.now() - t0 < 4000) {
			await new Promise((r) => requestAnimationFrame(r));
			const s = stage(), core = s && s.querySelector('.orbit-core'), dial = s && s.querySelector('.orbit-dial'); if (!core) continue;
			const busy = [core, dial, s.querySelector('.orbit-layout')].some((e) => e && e.getAnimations().some((a) => a.playState === 'running'));
			const key = core.getBoundingClientRect().width.toFixed(2) + '|' + dial.getBoundingClientRect().width.toFixed(2);
			if (!busy && key === last) { if (++same >= 3) return true; } else same = 0;
			last = key;
		}
		return false;
	};
	const frame = () => new Promise((r) => requestAnimationFrame(r));
	const label = () => { const s = stage(), e = s && s.querySelector('.orbit-core strong'); return e; };
	// the run's own path where a step carries the label (paused there), else the label written into the core's node
	const show = async (l, i) => {
		if (i >= 0) {
			window.PM56_DEMO.setWorkStep(i);
			for (let n = 0; n < 30; n++) { await frame(); const e = label(); if (e && e.textContent.trim() === l) { await frame(); return 'run'; } }
		}
		window.PM56_DEMO.pauseWorking(); await frame();
		// the chat may patch the core again (a paused card still renders); write until a frame keeps it. The measure runs
		// in the same task as the last look at the text, so nothing patches it in between
		for (let n = 0; n < 8; n++) { const e = label(); if (e) e.textContent = l; await frame(); const e2 = label(); if (e2 && e2.textContent.trim() === l) return 'written'; }
		return 'written';
	};
	// one dial width (null: the page's own), every label at it
	const sweep = async (w, labels, steps) => {
		const settled = await dialTo(w), out = [];
		for (const l of labels) { const how = await show(l, steps.indexOf(l)); out.push({ label: l, how, settled, m: measure() }); }
		return out;
	};
	window.__fo201 = { stage, measure, dialTo, show, sweep };
}

const showLabel = (f, l, steps) => f.evaluate(([l, i]) => window.__fo201.show(l, i), [l, steps.indexOf(l)]);

async function run(t, surface) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	const looks = list(t.args.looks, LOOKS), widths = list(t.args.widths, WIDTHS).map(Number);
	await t.viewport(1920, 1080);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_APP && window.PM56_FEATURE_MANIFEST && document.querySelector('.working-card .orbit-stage .orbit-core')), null, { timeout: 40000 });
	if (t.args.css) await f.evaluate((css) => { const s = document.createElement('style'); s.id = 'fo201-try'; s.textContent = css; document.head.appendChild(s); }, readFileSync(String(t.args.css), 'utf8'));
	await f.evaluate(install);
	const steps = await f.evaluate(() => window.PM56_FEATURE_MANIFEST.workingStates.slice());
	// and the runs' own subjects (an MCP or skill step names itself), and what the core says while it waits for the reader
	const runs = await f.evaluate(() => { const D = window.PM56_DATA || {}, base = {}; (D.workSteps || []).forEach((s) => { base[s.id] = s.label; });
		return Object.values(D.workRuns || {}).flatMap((r) => (r.steps || []).map((s) => s.label || base[s.ref])).filter(Boolean); });
	let labels = list(t.args.labels, [...new Set([...steps, ...runs, 'Waiting for you'])]);
	await t.page.mouse.move(2, 2);
	const all = [], worst = [], bad = [], how = {};
	for (const look of looks) {
		await t.app.look(look);
		await f.evaluate(() => { const s = window.__fo201.stage(); if (s) s.scrollIntoView({ block: 'center' }); });
		const at = {};
		for (const w of [null, ...widths]) {
			const rows = await f.evaluate(([w, l, s]) => window.__fo201.sweep(w, l, s), [w, labels, steps]);
			// longest first: by the ink width each label takes in this look, at the page's own dial
			if (w == null) { const width = {}; for (const r of rows) width[r.label] = r.m ? Math.max(0, ...r.m.lines.map((x) => x.w)) : 0; labels = [...labels].sort((a, b) => width[b] - width[a]); }
			for (const { label: l, how: hw, settled, m } of rows) {
				how[l] = hw;
				if (!m) { bad.push(`${look} ${w ?? 'page'} ${l}: no core`); continue; }
				const row = { look, surface, dial: w ?? 'page', label: l, how: hw, settled, ...m };
				all.push(row);
				const why = [];
				if (!settled) why.push('the dial did not come to rest');
				if (m.text !== l) why.push(`shows "${m.text}"`);
				for (const ln of m.lines) if (!(ln.spare >= SPARE)) why.push(`"${ln.text}" ${ln.spare} px (row ${ln.row} of ${m.R})`);
				if (m.ellipsis) why.push('ellipsis');
				if (m.lines.some((ln) => ln.clipped)) why.push(`glyphs clipped: ${m.lines.filter((ln) => ln.clipped).map((ln) => ln.text).join(', ')} (overflow ${m.overflow.clip})`);
				if (m.broken) why.push(`a word broken: ${m.lines.map((x) => x.text).join(' / ')}`);
				if (why.length) bad.push(`${look} dial ${m.dialW} (core ${m.coreD}) ${l}: ${why.join('; ')}`);
				const key = w ?? 'page';
				if (!at[key] || m.min < at[key].min) at[key] = { label: l, min: m.min };
			}
		}
		worst.push(`${look}: ${Object.entries(at).map(([k, v]) => `${k} ${v.label} ${v.min}`).join(', ')}`);
		// crops: the smallest and largest dial, each with its label of least room
		for (const w of [Math.min(...widths), Math.max(...widths)]) {
			const l = at[w] ? at[w].label : labels[0];
			await showLabel(f, l, steps); await f.evaluate((x) => window.__fo201.dialTo(x), w); await f.waitForTimeout(150);
			await t.crop(`${surface}-${look}-dial${w}-${l.replace(/\W+/g, '_')}`, f.locator('.working-card .orbit-stage .orbit-dial').filter({ has: f.locator('.orbit-core') }).first(),
				`${look}, ${w} px dial: "${l}" (least room at this dial) inside the centre disc's ring, ${SPARE} px or more clear on both sides`);
		}
		await f.evaluate(() => window.__fo201.dialTo(null));
	}
	t.log(`least room per look (dial, label, px): ${worst.join(' | ')}`);
	t.log(`labels shown by the run's own steps: ${Object.entries(how).filter(([, v]) => v === 'run').map(([k]) => k).join(', ')}; written: ${Object.entries(how).filter(([, v]) => v !== 'run').map(([k]) => k).join(', ') || 'none'}`);
	if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(all));
	await t.check(`${surface}: every core label line sits ${SPARE} px or more inside the disc's inner edge at its row, whole and unbroken (${looks.length} looks, ${widths.length + 1} dials, ${labels.length} labels)`,
		bad.length === 0 && all.length > 0, bad.length ? `${bad.length} fail: ${bad.slice(0, 14).join(' | ')}` : `${all.length} cases`);
}

export const tests = {
	async 'core label inside the disc, normal page'(t) { await run(t, 'normal'); },
	async 'core label inside the disc, sandbox'(t) { await run(t, 'sandbox'); },
};
