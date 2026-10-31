// All ten looks apply and paint without overflow or console errors. Frames are saved for `browser-check diff`
// against a base run (open only the CHANGED diffs); --set lookShots=1 also lists each look for viewing.
import { LOOKS } from '../browser-check.config.mjs';

export default async function (t) {
	await t.app.open();
	for (const look of LOOKS) {
		await t.step(look, async () => {
			await t.app.look(look);
			await t.visible('main.primary-content', 'main content visible');
			await t.painted('.app-shell', 'app shell painted');
			await t.noOverflow('no overflow');
			if (t.args.lookShots) await t.shot(`look-${look}`, `${look}: colours, contrast, borders`);
			else await t.snap(`look-${look}`);
		});
	}
}
