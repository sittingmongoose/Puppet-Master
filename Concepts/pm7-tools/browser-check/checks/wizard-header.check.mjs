// FO-52: the onboarding window's header keeps its controls reachable. The step rail sits centred in what the brand and
// the header's controls leave it; at 860 wide in NieR its chapters were wider than that and spilt onto both, its Ready
// item covering the look (palette) button (Retro 4 px and Friendly 1 px onto the controls too). The header now folds the
// talk name and Close's word to their marks where it is narrow for its look's words (10-window.css, 11-window-nier.css).
// In all ten looks, at 740 (the narrow layout), 860, 900, 960 and 1024 wide, on one screen of each chapter: every header
// control (look, Plain English / Expert, sound, Close) is on top at its centre (t.visible, a hit test), and the rail
// overlaps neither the brand nor the controls. `--set looks=a,b`, `--set widths=860,1024`; T3's sandbox with
// `--set sandbox=1`. Headless (the window's size changes). About 4 minutes.
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const SCREENS = ['welcome', 'where', 'name', 'ai', 'ready'];   // one per chapter: Welcome, Computer, Project, AI, Ready

export default async function (t) {
	const widths = (t.args.widths ? String(t.args.widths).split(',') : ['740', '860', '900', '960', '1024']).map(Number);
	await t.viewport(1920, 1080);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
	await t.emulate({ reducedMotion: 'reduce' });
	const bad = [], rows = [];
	let cells = 0;
	for (const look of (t.args.looks ? String(t.args.looks).split(',') : LOOKS)) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		await f.waitForFunction(() => !window.O55.S.vt && !(window.O55.nierLook && window.O55.nierLook.busy && window.O55.nierLook.busy()), null, { timeout: 30000 }).catch(() => {});
		await f.waitForTimeout(800);
		for (const id of SCREENS) {
			const at = await f.evaluate((sid) => { try { window.O55.ui.go(sid, { noHistory: true }); } catch (e) { return null; } return window.O55.S.sess.screen; }, id);
			if (at !== id) { rows.push(`${look} ${id}: not opened (${at})`); continue; }
			await f.waitForTimeout(500);
			for (const w of widths) {
				await t.viewport(w, 900);
				await f.waitForTimeout(350);
				cells++;
				const r = await f.evaluate(() => {
					const head = document.querySelector('#pm-o55-onboarding .o55-win .o55-head');
					const B = (e) => e.getBoundingClientRect(), brand = B(head.querySelector('.o55-brand')), rail = B(head.querySelector('.o55-rail')), ctl = B(head.querySelector('.o55-headctl'));
					const ctrls = [...head.querySelectorAll('.o55-headctl button')].filter((b) => b.getClientRects().length).map((b) => {
						const bb = B(b), e = document.elementFromPoint(bb.left + bb.width / 2, bb.top + bb.height / 2);
						return { name: (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 24), top: !!e && (e === b || b.contains(e)), by: e && !(e === b || b.contains(e)) ? (e.closest('[data-key]') ? e.closest('[data-key]').getAttribute('data-key') : String(e.className).slice(0, 30)) : null };
					});
					return { layout: document.querySelector('#pm-o55-onboarding').getAttribute('data-o55-layout'), overBrand: Math.round(Math.max(0, brand.right - rail.left)), overCtl: Math.round(Math.max(0, rail.right - ctl.left)), ctrls };
				});
				const under = r.ctrls.filter((c) => !c.top);
				if (r.ctrls.length < 4) bad.push(`${look} ${id} ${w}: ${r.ctrls.length} header controls`);
				if (under.length) bad.push(`${look} ${id} ${w}: ${under.map((c) => `"${c.name}" under ${c.by}`).join(', ')}`);
				if (r.overBrand > 0 || r.overCtl > 0) bad.push(`${look} ${id} ${w}: rail over the brand ${r.overBrand} px, over the controls ${r.overCtl} px`);
				// the kit's own hit test on the look button, as a person's pointer would reach it
				if (w === 860) await t.visible('#pm-o55-onboarding .o55-lookslot .o55-lookbtn', `${look} ${id} 860: the look button is on top`);
			}
			await t.viewport(1920, 1080);
		}
	}
	rows.forEach((r) => t.log(r));
	t.log(`${cells} look x screen x width cells measured`);
	await t.check(`FO-52: every header control is on top and the rail overlaps neither the brand nor the controls (${cells} cells)`, cells > 0 && bad.length === 0, bad.slice(0, 8).join('; ') + (bad.length > 8 ? ` (+${bad.length - 8} more)` : ''));
	await t.viewport(1920, 1080);
}
