// Reduced Motion survives navigation (the plan: re-apply and check after each navigation) and the page still boots.
// Motion itself is judged per surface: see the kit README (t.moving / t.still on a selector, or --record + t.mark).
export default async function (t) {
	await t.emulate({ reducedMotion: 'reduce' });
	await t.app.open();
	await t.check('prefers-reduced-motion after load', () => t.root.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
	await t.app.open();
	await t.check('prefers-reduced-motion after reload', () => t.root.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
	await t.visible('main.primary-content', 'main content visible');
	await t.emulate({ reducedMotion: 'no-preference' });
}
