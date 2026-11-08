// FO-83: a Glass lens never paints over a surface that covers its strip. On the Look screen the Light / Dark strip
// (.o55-seg) has its lens; Adjust NieR's editor then covers the screen, and the header's Look menu drops over it. While
// the scan runs, lenses (and only lenses) take the pointer, so native elementFromPoint names the topmost painted box: on
// every pixel where a lens of the window's interior meets the open editor or the open menu, the top box must be the
// editor's or the menu's own, never the lens (the header's own rail lens lies above both, as the header does). On main
// 0adb197992 the screen's lens is drawn over both, from the window's lens layer at z 30.
// Sampled each frame of the editor's rise as well (a probe: the film is the frame proof), and the lens must still sit on
// its strip once the editor closes (Glass keeps lenses of what a dialog leaves in view). Glass Light and Dark, widths
// 1920x1080, 1390, 1024, 860, 740x768 and 1280x500, both motion preferences, both surfaces.
//   --set size=1920x1080   --set look=glass-dark   --set motion=no-preference,reduce,attribute
const SIZES = [[1920, 1080], [1390, 900], [1024, 900], [860, 900], [740, 768], [1280, 500]];
const LOOKS = ['glass-light', 'glass-dark'];
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);

/* in the page: lenses take the pointer while fn runs (only for the scan; nothing else changes) */
const PROBE = () => {
	window.__fo83 = {
		on() { if (!document.getElementById('fo83-probe')) { const s = document.createElement('style'); s.id = 'fo83-probe'; s.textContent = '.lg-lens, .lg-lens * { pointer-events: auto !important; }'; document.head.appendChild(s); } },
		off() { document.getElementById('fo83-probe')?.remove(); },
		/* lenses drawn now (shown, not transparent along their ancestors) in the onboarding window */
		lenses() {
			const win = document.querySelector('#pm-o55-onboarding .o55-win'); if (!win) return [];
			return [...win.querySelectorAll('.lg-lens')].filter((l) => {
				for (let e = l; e && e !== win.parentElement; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; }
				const r = l.getBoundingClientRect(); return r.width > 1 && r.height > 1;
			});
		},
		/* every pixel where a lens of the interior meets the cover: the top box must be the cover's. The header's own lenses
		   (the step rail's, centred in the header) lie above every cover here, as the header does, and are left out */
		over(cover, step, keep) {
			const c = cover.getBoundingClientRect(), out = { lenses: 0, pixels: 0, lensTop: 0, examples: [] };
			const hd = document.querySelector('#pm-o55-onboarding .o55-head').getBoundingClientRect();
			if (!keep) this.on();
			try {
				for (const l of this.lenses()) {
					if (cover.contains(l)) continue;
					const r = l.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
					if (cx >= hd.left && cx <= hd.right && cy >= hd.top && cy <= hd.bottom) continue;
					const L = Math.max(r.left, c.left, 0), T = Math.max(r.top, c.top, 0), R = Math.min(r.right, c.right, innerWidth), B = Math.min(r.bottom, c.bottom, innerHeight);
					if (R - L < 1 || B - T < 1) continue;
					out.lenses++;
					for (let y = T + 0.5; y < B; y += step) for (let x = L + 0.5; x < R; x += step) {
						out.pixels++;
						const hit = document.elementFromPoint(x, y);
						if (hit && hit.closest('.lg-lens') === l) { out.lensTop++; if (out.examples.length < 4) out.examples.push({ x: Math.round(x), y: Math.round(y), lens: [r.left, r.top, r.width, r.height].map(Math.round), layer: l.parentElement && (l.parentElement.parentElement?.className || '').toString().split(' ')[0] }); }
					}
				}
			} finally { if (!keep) this.off(); }
			return out;
		},
		/* the lens of the Look screen's Light / Dark strip, over its chosen button (top box at its centre) */
		seg() {
			const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg button.o55-on'); if (!b) return { button: false };
			const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
			const lens = this.lenses().find((l) => { const q = l.getBoundingClientRect(); return q.left <= x && q.right >= x && q.top <= y && q.bottom >= y; });
			this.on(); let top = null; try { top = document.elementFromPoint(x, y); } finally { this.off(); }
			return { button: true, lens: !!lens, lensOnTop: !!(lens && top && top.closest('.lg-lens') === lens), at: [Math.round(x), Math.round(y)] };
		}
	};
};

async function cell(t, surface, w, h) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	await t.viewport(w, h);
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh', sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => window.O55?.S?.open && !!document.querySelector('#pm-o55-onboarding .o55-lookbtn'), null, { timeout: 30000 });
	await f.evaluate(PROBE);
	const size = await f.evaluate(() => ({ w: innerWidth, h: innerHeight }));
	await t.check(`FO-83 page has the asked size ${surface} ${w}x${h}`, size.w === w && size.h === h, JSON.stringify(size), { hard: true });
	for (const motion of list(t.args.motion, ['no-preference', 'reduce'])) {
		await t.emulate({ reducedMotion: motion === 'attribute' ? 'no-preference' : motion });
		for (const look of list(t.args.look, LOOKS)) {
			const tag = `${look} ${motion} ${surface} ${w}x${h}`;
			await t.page.mouse.move(2, 2);
			await f.evaluate(([fam, mode, m]) => {
				O55.nierLook.closePanel({ silent: true });
				if (O55.S.lookOpen) { O55.S.lookOpen = false; O55.ui.refresh(); }
				document.documentElement.setAttribute('data-motion', m === 'attribute' ? 'reduced' : 'full');
				O55.ui.applyLook(fam, mode);
			}, [...look.split('-'), motion]);
			await f.waitForTimeout(1600);
			await f.evaluate(() => O55.ui.go('look', { noHistory: true }));
			/* the fixture: the screen's Light / Dark strip has its lens on its chosen button */
			const seg0 = await f.waitForFunction(() => { const s = window.__fo83.seg(); return s.lensOnTop ? s : null; }, null, { timeout: 8000 }).then((x) => x.jsonValue(), async () => f.evaluate(() => window.__fo83.seg()));
			await t.check(`FO-83 fixture: the screen's strip has its lens ${tag}`, !!seg0.lensOnTop, JSON.stringify(seg0), { hard: false });
			/* the header menu over the screen (no editor) */
			await f.locator('#pm-o55-onboarding .o55-head .o55-lookbtn').click();
			await f.waitForFunction(() => O55.S.lookOpen && !!document.querySelector('#pm-o55-onboarding .o55-lookmenu'), null, { timeout: 5000 });
			await f.evaluate(async () => { const m = document.querySelector('#pm-o55-onboarding .o55-lookmenu'); await Promise.all(m.getAnimations({ subtree: true }).filter((a) => Number.isFinite(a.effect.getComputedTiming().endTime)).map((a) => a.finished.catch(() => {}))); });
			await f.waitForTimeout(300);
			const m0 = await f.evaluate(() => window.__fo83.over(document.querySelector('#pm-o55-onboarding .o55-lookmenu'), 1));
			await t.check(`FO-83 no lens paints over the open header menu (screen) ${tag}`, m0.lensTop === 0, JSON.stringify(m0));
			await t.page.keyboard.press('Escape'); await f.waitForTimeout(200);
			/* the editor's rise, each frame (a probe; the film proves the frames) */
			const rise = await f.evaluate(async () => {
				const frames = [];
				window.__fo83.on();
				try {
					O55.nierLook.adjust();
					const t0 = performance.now();
					while (performance.now() - t0 < 700) {
						await new Promise((r) => requestAnimationFrame(r));
						const p = document.querySelector('#pm-o55-onboarding .o55-nierpanel'); if (!p) continue;
						const o = window.__fo83.over(p, 8, true); frames.push({ t: Math.round(performance.now() - t0), op: getComputedStyle(p).opacity, ...o, examples: o.examples.slice(0, 1) });
					}
				} finally { window.__fo83.off(); }
				return { frames: frames.length, bad: frames.filter((x) => x.lensTop > 0), lensesMet: Math.max(0, ...frames.map((x) => x.lenses)) };
			});
			await t.check(`FO-83 no lens over the editor in any sampled frame of its rise ${tag}`, rise.frames >= 3 && rise.bad.length === 0, JSON.stringify({ frames: rise.frames, lensesMet: rise.lensesMet, bad: rise.bad.slice(0, 3) }));
			await f.evaluate(async () => { const p = document.querySelector('#pm-o55-onboarding .o55-nierpanel'); await Promise.all(p.getAnimations({ subtree: true }).filter((a) => Number.isFinite(a.effect.getComputedTiming().endTime)).map((a) => a.finished.catch(() => {}))); });
			await f.waitForTimeout(400);
			const e1 = await f.evaluate(() => window.__fo83.over(document.querySelector('#pm-o55-onboarding .o55-nierpanel'), 1));
			await t.check(`FO-83 no lens paints over the open editor ${tag}`, e1.lensTop === 0, JSON.stringify(e1));
			await t.check(`FO-83 the covered strip's lens lies where the editor is (not vacuous) ${tag}`, e1.lenses >= 1 || rise.lensesMet >= 1, JSON.stringify({ settled: e1.lenses, rise: rise.lensesMet }));
			/* the header menu over the editor */
			await f.locator('#pm-o55-onboarding .o55-head .o55-lookbtn').click();
			await f.waitForFunction(() => O55.S.lookOpen && !!document.querySelector('#pm-o55-onboarding .o55-lookmenu'), null, { timeout: 5000 });
			await f.evaluate(async () => { const m = document.querySelector('#pm-o55-onboarding .o55-lookmenu'); await Promise.all(m.getAnimations({ subtree: true }).filter((a) => Number.isFinite(a.effect.getComputedTiming().endTime)).map((a) => a.finished.catch(() => {}))); });
			await f.waitForTimeout(300);
			const m1 = await f.evaluate(() => ({ menu: window.__fo83.over(document.querySelector('#pm-o55-onboarding .o55-lookmenu'), 1), editor: window.__fo83.over(document.querySelector('#pm-o55-onboarding .o55-nierpanel'), 2) }));
			await t.check(`FO-83 no lens paints over the open header menu or the editor beneath it ${tag}`, m1.menu.lensTop === 0 && m1.editor.lensTop === 0, JSON.stringify(m1));
			/* close the menu, then the editor (Escape, Escape): the frame after the close and the settled screen */
			await t.page.keyboard.press('Escape'); await f.waitForTimeout(200);
			const close = await f.evaluate(() => ({ before: O55.nierLook.panelOpen(), menu: !!O55.S.lookOpen }));
			await t.page.keyboard.press('Escape');
			await f.waitForFunction(() => !O55.nierLook.panelOpen(), null, { timeout: 3000 }).catch(() => {});
			const seg1 = await f.waitForFunction(() => { const s = window.__fo83.seg(); return s.lensOnTop ? s : null; }, null, { timeout: 8000 }).then((x) => x.jsonValue(), async () => f.evaluate(() => window.__fo83.seg()));
			await t.check(`FO-83 after the editor closes the strip's lens is back on its strip ${tag}`, close.before && !close.menu && seg1.lensOnTop, JSON.stringify({ close, seg1 }));
			if (t.args.shots && list(t.args.shots, []).includes(look)) {
				await f.evaluate(() => O55.nierLook.adjust()); await f.waitForTimeout(900);
				await t.crop(`${look}-${motion}-${surface}-${w}x${h}-editor`, f.locator('#pm-o55-onboarding .o55-win'), 'FO-83: no Glass lens over the Adjust NieR editor (main: the Light / Dark lens of the screen beneath shows through).');
				await f.evaluate(() => O55.nierLook.closePanel({ silent: true }));
			}
		}
	}
	await f.evaluate(() => { window.__fo83?.off(); O55.nierLook.closePanel({ silent: true }); O55.S.lookOpen = false; document.documentElement.setAttribute('data-motion', 'full'); });
	await t.emulate({ reducedMotion: 'no-preference' });
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) for (const [w, h] of SIZES) {
	tests[`FO-83 lens under covers ${surface} ${w}x${h}`] = async (t) => {
		if (t.args.size && !list(t.args.size, []).includes(`${w}x${h}`)) { t.log(`skipped: --set size leaves out ${w}x${h}`); return; }
		return cell(t, surface, w, h);
	};
}
