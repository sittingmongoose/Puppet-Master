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

// The chat's Plan export, as a person reaches it: the Plan card's title opens its details, More, Export, PDF. The thread
// that holds the Plan ("query", Query performance) is opened through the chat's own switch, as its thread list does.
async function exportPdf(t, f, tag, sandboxed) {
	const ctx = t.page.context(), pagesBefore = ctx.pages().length;
	if (!sandboxed) {
		// a real print dialog would hold the test: the window's print() is replaced by a marker on a normal page
		await f.evaluate(() => {
			window.__fx1Printed = 0;
			const real = window.open;
			window.open = function () { const w = real.apply(this, arguments); if (w) w.print = () => { window.__fx1Printed++; }; return w; };
		});
	}
	await f.evaluate(() => window.PM56_EXT.ctx().switchThread('query'));
	await f.locator('[data-action="pd-info"][data-id="ap-index"]').first().click();
	await f.locator('[data-action="pd-more-actions"]').first().click();
	await f.locator('[data-action="pd-export"][data-id="ap-index"]').first().click();
	await f.locator('[data-action="pd-export-do"][data-format="pdf"]').first().click();
	await f.waitForTimeout(1500);
	const receipt = await f.evaluate(() => { const r = window.PM56_PLANS.get('ap-index'); const e = r && r.exports && r.exports[r.exports.length - 1]; return e ? e.result : ''; });
	const note = await f.evaluate(() => [...document.querySelectorAll('.toast, [class*="toast"]')].map((e) => e.textContent.trim()).join(' | '));
	const pagesAfter = ctx.pages().length;
	if (sandboxed) {
		await t.check(`${tag}: the PDF export says the preview blocks printing`, /blocks the print dialog/.test(receipt) && /no PDF was produced/.test(receipt), `receipt: ${receipt}`);
		await t.check(`${tag}: and a note says so`, /Print unavailable here/.test(note), `notes: ${note.slice(0, 200)}`);
		await t.check(`${tag}: no empty print window is left open`, pagesAfter === pagesBefore, `${pagesBefore} -> ${pagesAfter} pages`);
	} else {
		const printed = await f.evaluate(() => window.__fx1Printed);
		await t.check(`${tag}: the PDF export opens the print window and prints`, printed === 1 && /opened the browser print pipeline/.test(receipt), `printed ${printed}, receipt: ${receipt}`);
		for (const p of ctx.pages()) if (p !== t.page) await p.close().catch(() => {});
	}
}

export default async function (t) {
	for (const where of ['normal page', 'sandboxed preview']) {
		let f;
		if (where === 'normal page') { await t.app.open(); f = t.page.mainFrame(); }
		else f = await t.openInSandbox(t.cfg.pageUrl + (t.cfg.pageUrl.includes('?') ? '&' : '?') + 'o55=off&cb=' + Date.now(), { ready: '.app-shell' });
		await f.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1', null, { timeout: 60000 });
		await watchNative(f);
		await oldTerminalOutOfReach(t, f, where);
		await exportPdf(t, f, where, where === 'sandboxed preview');
		const calls = await nativeCalls(f);
		await t.check(`${where}: no native dialog was called`, calls.length === 0, `called: ${calls.join(', ')}`);
	}
}
