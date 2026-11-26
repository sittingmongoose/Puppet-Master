// The published page boots: ready, no console errors, app shell on top, no overflow at 1920.
export default async function (t) {
	// The default-look assertion below is about a fresh install's boot, not the look a previous check in this browser
	// saved. Reset that saved state on the outgoing page (and block its pagehide write) before this page boots, so a
	// multi-file run measures the factory default (FO178-R2-BOOT-CARRYOVER). A page that really boots in the wrong look
	// still fails: clearing storage does not change what the page itself paints by default.
	await t.app.resetLayout();
	await t.app.open();
	// The run's viewport is shared state: a check that ran earlier may have left another size, while the audit and
	// the shot caption below claim 1920 (F134-BOOT-VIEWPORT, SOL-L1C-T3). Ask for the size this check is documented at.
	await t.viewport(1920, 1080);
	await t.equal('default look', () => t.root.evaluate(() => document.documentElement.getAttribute('data-theme')), 'basic-dark');
	await t.visible('main.primary-content', 'main content visible');
	await t.painted('.app-shell', 'app shell painted');
	await t.audit('page at 1920', { requests: false });
	await t.shot('boot-basic-dark', 'published page after boot, Basic Dark, 1920x1080');
}
