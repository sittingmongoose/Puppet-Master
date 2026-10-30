// The plan's widths (860, 1024, 1280, ~1390, 1920) plus narrow (<760) and short (<520): no overflow, main content visible.
// Headless only (viewport changes are refused while recording). Frames saved for diff.
import { WIDTHS } from '../browser-check.config.mjs';

export default async function (t) {
	await t.app.open();
	const sizes = [...WIDTHS.map((w) => [w, 1080]), [740, 1000], [1280, 500]];
	for (const [w, h] of sizes) {
		await t.step(`${w}x${h}`, async () => {
			await t.viewport(w, h);
			await t.page.waitForTimeout(500);
			await t.visible('main.primary-content', 'main content visible');
			await t.noOverflow('no overflow');
			await t.snap(`size-${w}x${h}`);
		});
	}
	await t.viewport(1920, 1080);
}
