// The published page boots: ready, no console errors, app shell on top, no overflow at 1920.
export default async function (t) {
	await t.app.open();
	await t.equal('default look', () => t.page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'basic-dark');
	await t.visible('main.primary-content', 'main content visible');
	await t.painted('.app-shell', 'app shell painted');
	await t.audit('page at 1920', { requests: false });
	await t.shot('boot-basic-dark', 'published page after boot, Basic Dark, 1920x1080');
}
