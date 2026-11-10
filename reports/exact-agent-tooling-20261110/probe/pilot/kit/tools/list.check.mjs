// Prints nothing large: writes the listing to listing.txt beside the config. Run:
//   browser-check run tools/list.check.mjs [--set scope=".activity-bar"] [--set open=files]
import fs from 'node:fs';
import path from 'node:path';
export const tests = {
	async list(t) {
		await t.app.open();
		if (t.args.open) { const item = await t.app.byId('activity.' + t.args.open); if ((await item.getAttribute('aria-expanded')) !== 'true') await item.click(); await t.settle(); }
		const text = await t.app.list(t.args.scope || null);
		const out = path.resolve(t.args.out || 'listing.txt');
		fs.writeFileSync(out, text + '\n');
		await t.check(`listing written to ${out}`, true);
	}
};
