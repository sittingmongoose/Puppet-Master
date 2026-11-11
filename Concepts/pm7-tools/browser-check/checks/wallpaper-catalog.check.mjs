// The wallpaper catalog on the page (Concepts/wallpapers/opus-5.5; Jared, 2026-11-11: 18 supplied wallpapers added
// to the 29 drawn in code). For every catalog wallpaper, in both prints:
//   - the page carries its image (--lg-wall-<id>-<dark|light>) and it decodes at 2560 x 1440;
//   - the Settings gallery (General > App & Input, row setting-general.visual.wallpaper) has its tile, and the tile's
//     thumbnail decodes at 320 x 180 in the look's mode;
// and choosing one from the gallery puts it on show (<html data-lg-wall>), then Look's own takes it back.
// One Basic look per mode by default; the gallery is listed under LOOK once per mode.
//   --set ids=atrium,fair   only these wallpapers   --set pick=atrium   the one chosen (default: the catalog's last)
const ROW = 'setting-general.visual.wallpaper';
const decode = (urls) => Promise.all(urls.map((u) => new Promise((done) => {
	if (!u) return done(null);
	const im = new Image(); im.onload = () => done([im.naturalWidth, im.naturalHeight]); im.onerror = () => done(null); im.src = u;
})));

export const tests = {
	async 'every wallpaper: both prints, a gallery tile and its thumbnail; a choice shows'(t) {
		await t.viewport(1920, 1080);
		const f = await t.app.open(t);
		const cat = await f.evaluate(() => window.PM_WALLPAPERS_CATALOG.families.flatMap((fam) => fam.wallpapers.map((w) => ({ id: w.id, family: fam.family }))));
		const only = t.args.ids ? String(t.args.ids).split(',') : null, walls = cat.filter((w) => !only || only.includes(w.id));
		await t.check(`the catalog lists wallpapers (${cat.length}; checking ${walls.length})`, walls.length > 0);

		const prints = await f.evaluate(async ([ids, src]) => {
			const decode = new Function('return ' + src)(), cs = getComputedStyle(document.documentElement), keys = ids.flatMap((id) => [id + '-dark', id + '-light']);
			const sizes = await decode(keys.map((k) => { const m = cs.getPropertyValue('--lg-wall-' + k).match(/url\(["']?(.*?)["']?\)\s*$/); return m ? m[1] : ''; }));
			return keys.map((k, i) => ({ k, size: sizes[i] }));
		}, [walls.map((w) => w.id), decode.toString()]);
		const badPrints = prints.filter((p) => !p.size || p.size[0] !== 2560 || p.size[1] !== 1440);
		await t.check(`every print decodes at 2560x1440 (${prints.length})`, badPrints.length === 0, badPrints.map((p) => `${p.k}: ${p.size ? p.size.join('x') : 'no image'}`).join(', '));

		await t.page.locator('#tab-settings').click({ force: true });
		await t.page.waitForTimeout(100);
		await f.evaluate(() => window.PM12_KIMI.navigate('general', 'app-input'));
		await f.waitForFunction((id) => !!document.getElementById(id)?.querySelector('.wpk-gallery'), ROW, { timeout: 20000 });
		for (const mode of ['dark', 'light']) {
			await t.app.look(t, 'basic-' + mode);
			const tiles = await f.evaluate(async ([ids, src, id]) => {
				const decode = new Function('return ' + src)(), row = document.getElementById(id);
				const got = ids.map((w) => { const th = row.querySelector('.wpk-thumb[data-wpk-id="' + w + '"]:not([data-wpk-own])'); const m = th && getComputedStyle(th).backgroundImage.match(/url\(["']?(.*?)["']?\)/); return { w, tile: !!th, url: m ? m[1] : '' }; });
				const sizes = await decode(got.map((g) => g.url));
				return got.map((g, i) => ({ w: g.w, tile: g.tile, size: sizes[i] }));
			}, [walls.map((w) => w.id), decode.toString(), ROW]);
			const bad = tiles.filter((x) => !x.tile || !x.size || x.size[0] !== 320 || x.size[1] !== 180);
			await t.check(`every tile shows a 320x180 thumbnail, ${mode} (${tiles.length})`, bad.length === 0, bad.map((x) => `${x.w}: ${!x.tile ? 'no tile' : x.size ? x.size.join('x') : 'no image'}`).join(', '));
			/* scroll only the row's own scroller: scrollIntoView would also move the app's clipped ancestors */
			await f.evaluate((id) => { const row = document.getElementById(id); let sc = row.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement; if (sc) sc.scrollTop += row.getBoundingClientRect().top - sc.getBoundingClientRect().top - 8; }, ROW);
			await t.page.waitForTimeout(400);
			await t.shot(`wallpaper-gallery-${mode}`, `the Settings wallpaper gallery in Basic ${mode}: every tile has its picture and name, none blank or stretched`);
		}

		const pick = t.args.pick || walls[walls.length - 1].id;
		await f.evaluate(([id, p]) => document.getElementById(id).querySelector('.wpk-tile[data-wpk-pick="' + p + '"]').click(), [ROW, pick]);
		await t.until(`choosing ${pick} puts it on show`, (p) => document.documentElement.getAttribute('data-lg-wall') === p && window.PM_WALLPAPERS.choice() === p
			&& document.getElementById('setting-general.visual.wallpaper').querySelector('.wpk-tile[data-wpk-pick="' + p + '"]').getAttribute('aria-checked') === 'true', pick, { timeout: 10000 });
		const painted = await f.evaluate(() => /url\(/.test(getComputedStyle(document.body).backgroundImage));
		await t.check(`the body paints ${pick} in Basic`, painted);
		await f.evaluate((id) => document.getElementById(id).querySelector('.wpk-tile[data-wpk-pick="look"]').click(), ROW);
		await t.until("Look's own takes it back", () => window.PM_WALLPAPERS.choice() === 'look' && !document.documentElement.hasAttribute('data-lg-wall-any'), null, { timeout: 10000 });
	}
};
