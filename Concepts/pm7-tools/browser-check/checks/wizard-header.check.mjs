// FO-52: the onboarding window's header keeps its controls reachable. The step rail sits centred in what the brand and
// the header's controls leave it; at 860 wide in NieR its chapters were wider than that and spilt onto both, its Ready
// item covering the look (palette) button (Retro 4 px and Friendly 1 px onto the controls too). The header now folds the
// talk name and Close's word to their marks where it is narrow for its look's words (10-window.css, 11-window-nier.css).
// In all ten looks, at 740 (the narrow layout), 860, 900, 960 and 1024 wide, on one screen of each chapter: every header
// control (look, Plain English / Expert, sound, Close) is on top at its centre (t.visible, a hit test), and the rail
// overlaps neither the brand nor the controls. `--set looks=a,b`, `--set widths=860,1024`; T3's sandbox with
// `--set sandbox=1`. Headless (the window's size changes). About 5 minutes.
// FO-53: walked with history, so the chapters behind carry their jump buttons; no rail label (the narrow layout's
// finished-chapter name included) may cut its words without an ellipsis, in any cell or under forced colours at 740.
// Each look is measured in a window of its own, opened fresh with Reduced Motion already set and the page's storage
// cleared (Sol's welcome review N1: run after other checks, the page came up in the look they left, NieR, its window
// opening cold, and the motion change and look switch in the middle of that opening left NieR's header controls at
// opacity 0 for every NieR cell; a fresh NieR run passed). The look must settle and the header be ready (no cold opening
// under way, no header animation still running) before anything is measured; a look or header that does not settle is
// a failure, not a wait that is let go.
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const SCREENS = ['welcome', 'where', 'name', 'ai', 'ready'];   // one per chapter: Welcome, Computer, Project, AI, Ready

// the look applied and every change it started over: its theme, NieR on or off, no view transition, no skin or theme
// transition still playing
function lookSettled([fam, mode]) {
	const html = document.documentElement, theme = html.getAttribute('data-theme') || '', O = window.O55;
	const nier = !!(window.PM_NIER && window.PM_NIER.on()) || theme.startsWith('nier');
	return nier === (fam === 'nier') && theme.endsWith('-' + mode) && (fam === 'nier' || theme.startsWith(fam)) && !O.S.vt
		&& !(O.nierLook && O.nierLook.busy && O.nierLook.busy()) && !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy());
}
// the window's header as it stands for good: no cold NieR opening under way (66-nier-window.js), its four controls laid
// out, no screen change in the pane, and no header animation with an end still running (its opacity is not read here:
// t.visible below judges what shows)
function headerReady() {
	const r = document.querySelector('#pm-o55-onboarding'), head = r && r.querySelector('.o55-win .o55-head');
	if (!head || r.hasAttribute('data-o55nw-cold') || r.hasAttribute('data-o55nw-go') || r.classList.contains('o55-opening') || window.O55.S.vt) return false;
	if ([...head.querySelectorAll('.o55-headctl button')].filter((b) => b.getClientRects().length).length < 4) return false;
	if (r.querySelector('.o55-pane > .o55-layer.o55-out, .o55-pane > .o55-layer.o55-entering')) return false;
	return !head.getAnimations({ subtree: true }).some((a) => (a.playState === 'running' || a.pending) && a.effect && a.effect.getComputedTiming().endTime !== Infinity);
}
const headerState = () => {
	const r = document.querySelector('#pm-o55-onboarding'), head = r && r.querySelector('.o55-win .o55-head');
	if (!head) return 'no header';
	const an = head.getAnimations({ subtree: true }).filter((a) => a.playState === 'running' || a.pending).map((a) => a.animationName || a.id || 'animation');
	return `cold ${r.getAttribute('data-o55nw-cold')}, go ${r.getAttribute('data-o55nw-go')}, opening ${r.classList.contains('o55-opening')}, vt ${!!window.O55.S.vt}, running [${an.join(', ')}]`;
};
// two frames: what was laid out has been painted
const painted = (f) => f.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => res()))));

export default async function (t) {
	const widths = (t.args.widths ? String(t.args.widths).split(',') : ['740', '860', '900', '960', '1024']).map(Number);
	// Reduced Motion before any page loads: no window opens cold and no motion change comes in the middle of one
	await t.emulate({ reducedMotion: 'reduce' });
	const bad = [], rows = [], clipBad = [], unsettled = [];
	let cells = 0, jumpCells = 0, f = null;
	const settle = async (what, fn, arg) => {
		const ok = await f.waitForFunction(fn, arg, { timeout: 30000 }).then(() => true, () => false);
		if (!ok) unsettled.push(`${what}: ${await f.evaluate(headerState)}`);
		await painted(f);
		return ok;
	};
	for (const look of (t.args.looks ? String(t.args.looks).split(',') : LOOKS)) {
		const [fam, mode] = look.split('-');
		// a window of its own: the last page's storage cleared (it keeps no look or layout for this one), opened fresh
		if (f) await t.app.resetLayout();
		await t.viewport(1920, 1080);
		f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
		await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
		if (!cells) await t.app.resetLayout();
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		await settle(`${look}: the look`, lookSettled, [fam, mode]);
		await settle(`${look}: the header`, headerReady);
		for (const id of SCREENS) {
			// walked with history, so the chapters behind carry their jump buttons (a finished chapter's name, FO-53)
			const at = await f.evaluate((sid) => { try { window.O55.ui.go(sid, sid === 'welcome' ? { noHistory: true } : {}); } catch (e) { return null; } return window.O55.S.sess.screen; }, id);
			if (at !== id) { rows.push(`${look} ${id}: not opened (${at})`); continue; }
			await settle(`${look} ${id}: the header`, headerReady);
			for (const w of widths) {
				await t.viewport(w, 900);
				await settle(`${look} ${id} ${w}: the window's width`, (ww) => document.documentElement.clientWidth <= ww && document.documentElement.clientWidth > ww - 40, w);
				await settle(`${look} ${id} ${w}: the header`, headerReady);
				cells++;
				const r = await f.evaluate(() => {
					const head = document.querySelector('#pm-o55-onboarding .o55-win .o55-head');
					const B = (e) => e.getBoundingClientRect(), brand = B(head.querySelector('.o55-brand')), rail = B(head.querySelector('.o55-rail')), ctl = B(head.querySelector('.o55-headctl'));
					const ctrls = [...head.querySelectorAll('.o55-headctl button')].filter((b) => b.getClientRects().length).map((b) => {
						const bb = B(b), e = document.elementFromPoint(bb.left + bb.width / 2, bb.top + bb.height / 2);
						return { name: (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 24), top: !!e && (e === b || b.contains(e)), by: e && !(e === b || b.contains(e)) ? (e.closest('[data-key]') ? e.closest('[data-key]').getAttribute('data-key') : String(e.className).slice(0, 30)) : null };
					});
					// FO-53: a rail label laid out at a size, clipping its own words, with no ellipsis
					const clipped = [...head.querySelectorAll('.o55-raillabel')].filter((l) => l.getClientRects().length).map((l) => {
						const cs = getComputedStyle(l);
						if (parseFloat(cs.fontSize) === 0 || !/hidden|clip/.test(cs.overflowX)) return null;
						return l.scrollWidth > l.clientWidth + 1 && cs.textOverflow !== 'ellipsis' ? `"${l.textContent.trim()}" ${l.scrollWidth - l.clientWidth} px` : null;
					}).filter(Boolean);
					const jumps = head.querySelectorAll('.o55-railjump').length;
					return { layout: document.querySelector('#pm-o55-onboarding').getAttribute('data-o55-layout'), overBrand: Math.round(Math.max(0, brand.right - rail.left)), overCtl: Math.round(Math.max(0, rail.right - ctl.left)), ctrls, clipped, jumps };
				});
				const under = r.ctrls.filter((c) => !c.top);
				if (r.ctrls.length < 4) bad.push(`${look} ${id} ${w}: ${r.ctrls.length} header controls`);
				if (under.length) bad.push(`${look} ${id} ${w}: ${under.map((c) => `"${c.name}" under ${c.by}`).join(', ')}`);
				if (r.overBrand > 0 || r.overCtl > 0) bad.push(`${look} ${id} ${w}: rail over the brand ${r.overBrand} px, over the controls ${r.overCtl} px`);
				if (r.clipped.length) clipBad.push(`${look} ${id} ${w}: ${r.clipped.join(', ')}`);
				jumpCells += r.jumps ? 1 : 0;
				// the kit's own hit test on the look button, as a person's pointer would reach it
				if (w === 860) await t.visible('#pm-o55-onboarding .o55-lookslot .o55-lookbtn', `${look} ${id} 860: the look button is on top`);
			}
			await t.viewport(1920, 1080);
		}
	}
	unsettled.forEach((u) => t.log(`not settled: ${u}`));
	// forced colours repaint transparent text: the narrow rail's finished-chapter names must still not show cut words
	if (!t.args.looks || String(t.args.looks).includes('basic-dark')) {
		await f.evaluate(() => window.O55.ui.applyLook('basic', 'dark'));
		await settle('basic-dark (forced colours): the look', lookSettled, ['basic', 'dark']);
		await t.emulate({ reducedMotion: 'reduce', forcedColors: 'active' });
		await t.viewport(740, 900);
		await settle('basic-dark 740 (forced colours): the header', headerReady);
		const fc = await f.evaluate(() => [...document.querySelectorAll('#pm-o55-onboarding .o55-head .o55-raillabel')].filter((l) => l.getClientRects().length && parseFloat(getComputedStyle(l).fontSize) > 0 && /hidden|clip/.test(getComputedStyle(l).overflowX) && l.scrollWidth > l.clientWidth + 1).map((l) => l.textContent.trim()));
		if (fc.length) clipBad.push(`forced colours, basic-dark 740: ${fc.join(', ')}`);
		await t.emulate({ reducedMotion: 'reduce', forcedColors: 'none' });
		await t.viewport(1920, 1080);
	}
	rows.forEach((r) => t.log(r));
	t.log(`cells with a finished chapter's jump button: ${jumpCells}`);
	t.log(`${cells} look x screen x width cells measured`);
	await t.check(`FO-52: every header control is on top and the rail overlaps neither the brand nor the controls (${cells} cells)`, cells > 0 && bad.length === 0, bad.slice(0, 8).join('; ') + (bad.length > 8 ? ` (+${bad.length - 8} more)` : ''));
	await t.check(`every look settled and every header was ready before it was measured (${cells} cells)`, unsettled.length === 0, unsettled.slice(0, 6).join('; ') + (unsettled.length > 6 ? ` (+${unsettled.length - 6} more)` : ''));
	await t.check(`FO-53: no rail label is cut without an ellipsis (${cells} cells, ${jumpCells} with a finished chapter's name; and under forced colours at 740)`, jumpCells > 0 && clipBad.length === 0, clipBad.slice(0, 8).join('; ') + (clipBad.length > 8 ? ` (+${clipBad.length - 8} more)` : ''));
	await t.viewport(1920, 1080);
	await t.app.resetLayout();
}
