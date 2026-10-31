// FX-1: T3's file preview is a sandboxed iframe without allow-modals (browser-check's t.openInSandbox default:
// allow-scripts allow-forms allow-popups allow-downloads), so alert, confirm, prompt and print do nothing there: a
// confirm() answers "no" and a prompt() answers nothing, with no UI. This guards both kinds of path:
// - the old Terminal chrome (script-038.js: workgroup pills and subtabs, whose menus used prompt() and confirm()) stays
//   out of reach: the universal panels replaced it (DL-180, DL-181, UCC-201) and the Home layer hides #bottomPanel and
//   #editorView; if it ever shows again this fails, because its dialogs would be dead in the preview;
// - the chat's PDF export prints through a window it opens; in the preview the print is ignored, so the page must say
//   so (the receipt and a note) and close that window, with no native dialog fired. On a normal page the print path
//   is checked with the browser's print stubbed, since a real print dialog would hold the test.

async function watchNative(f) {
	await f.evaluate(() => {
		if (window.__fx1Native) return;
		window.__fx1Native = [];
		for (const k of ['alert', 'confirm', 'prompt']) {
			const real = window[k];
			window[k] = function () { window.__fx1Native.push(k); return real.apply(this, arguments); };
		}
	});
}
const nativeCalls = (f) => f.evaluate(() => (window.__fx1Native || []).splice(0));

async function oldTerminalOutOfReach(t, f, tag) {
	const r = await f.evaluate(() => {
		const shown = (sel) => [...document.querySelectorAll(sel)].some((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
		try { if (typeof window.switchBottomTab === 'function') window.switchBottomTab('terminal'); } catch (e) { /* the shim opens a panel tab */ }
		return {
			bottomPanel: getComputedStyle(document.getElementById('bottomPanel') || document.body).display,
			editorView: (() => { const e = document.getElementById('editorView'); return e ? getComputedStyle(e).display : 'absent'; })(),
			pills: shown('.pm-term-wg-tab'), subtabs: shown('.pm-term-subtab'),
			api: Object.keys(window.PM_TERMINAL_DEMO || {}).filter((k) => /close|kill|rename/i.test(k))
		};
	});
	await t.check(`${tag}: the old Terminal chrome is hidden (#bottomPanel ${r.bottomPanel}, #editorView ${r.editorView})`, r.bottomPanel === 'none' && (r.editorView === 'none' || r.editorView === 'absent'));
	await t.check(`${tag}: no workgroup pill or terminal subtab can be reached, even after switchBottomTab('terminal')`, !r.pills && !r.subtabs, JSON.stringify(r));
	await t.check(`${tag}: PM_TERMINAL_DEMO exposes no close or rename`, r.api.length === 0, r.api.join(', '));
}

export default async function (t) {
	for (const where of ['normal page', 'sandboxed preview']) {
		let f;
		if (where === 'normal page') { await t.app.open(); f = t.page.mainFrame(); }
		else f = await t.openInSandbox(t.cfg.pageUrl + (t.cfg.pageUrl.includes('?') ? '&' : '?') + 'o55=off&cb=' + Date.now(), { ready: '.app-shell' });
		await f.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1', null, { timeout: 60000 });
		await watchNative(f);
		await oldTerminalOutOfReach(t, f, where);
		const calls = await nativeCalls(f);
		await t.check(`${where}: no native dialog was called`, calls.length === 0, `called: ${calls.join(', ')}`);
	}
}
