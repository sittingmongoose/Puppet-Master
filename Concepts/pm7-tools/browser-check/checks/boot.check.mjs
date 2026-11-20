// The published page boots: ready, no console errors, app shell on top, no overflow at 1920.
export default async function (t) {
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
