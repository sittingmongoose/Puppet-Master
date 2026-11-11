// Stream F batch 10 (handed over by stream P's Projects concept report, "Base page").
// FO-143: the hosted chat's compact composer state (is-compact, and is-measuring while it measures) belongs to its own
//   composer in #pmRoot. The base JS took the document's first .composer-box (and observed every one), so another
//   surface's composer on the same page got the chat's classes. A narrow foreign .composer-box is put first in the
//   document; window resizes that make the chat re-measure must leave it without those classes, while the chat's own
//   composer still follows its width (compact in a narrow column, not in a wide one).
// FO-142 (the contract, not a change): at 860 px Home folds the chat to its edge strip (the narrow ladder, D4: the centre
//   keeps its 480 px floor), and PMW.chatCol.show() opens it over the centre at its full 400 px, on top and clickable;
//   it does not widen the docked column. A regression guard.

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-143 the chat's composer state stays in its own composer (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080);
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout();
		await f.waitForFunction(() => !!document.querySelector('#pmRoot .composer-box[data-k="composer-box"]'), null, { timeout: 30000 });
		await f.evaluate(() => {
			const box = document.createElement('div');
			box.className = 'composer-box'; box.id = 'fo143-foreign';
			box.style.cssText = 'position:fixed;left:0;top:0;width:200px;height:40px;opacity:0;pointer-events:none';
			box.innerHTML = '<div class="composer-tools"><button type="button">One</button><button type="button">Two</button></div>';
			document.body.prepend(box);
			window.__fo143 = [];
			new MutationObserver(() => { const c = box.className; if (/is-compact|is-measuring/.test(c)) window.__fo143.push(c); }).observe(box, { attributes: true, attributeFilter: ['class'] });
		});
		const own = () => f.evaluate(() => { const b = document.querySelector('#pmRoot .composer-box[data-k="composer-box"]'); return b ? { compact: b.classList.contains('is-compact'), w: Math.round(b.clientWidth) } : null; });
		const seen = [];
		for (const [w, h] of [[1280, 900], [1024, 768], [1920, 1080], [1390, 900]]) {
			await t.viewport(w, h);
			await t.page.waitForTimeout(700);
			seen.push({ size: `${w}x${h}`, ...(await own()) });
		}
		const foreign = await f.evaluate(() => ({ marks: window.__fo143.slice(), now: document.getElementById('fo143-foreign').className }));
		await t.check('a foreign .composer-box never gets the chat\'s compact or measuring class', foreign.marks.length === 0 && foreign.now === 'composer-box', `${foreign.marks.length} marks, now "${foreign.now}"`);
		await t.check('the chat\'s own composer was measured at every size', seen.every((x) => x && x.w > 0), JSON.stringify(seen));
	};

	tests[`FO-142 contract: the folded chat opens over the centre (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		for (const [w, h] of [[860, 900], [860, 1080]]) {
			await t.viewport(w, h);
			const f = await t.app.open({ sandbox: surface === 'sandbox' });
			await t.app.resetLayout();
			await t.page.waitForTimeout(1200);
			const read = () => f.evaluate(() => {
				const c = document.querySelector('#chatPanel'), r = c.getBoundingClientRect();
				const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
				return { w: Math.round(r.width), strip: !!PMW.narrow.state.chatStrip, open: PMW.chatCol.isOpen(), onTop: !!(at && at.closest && at.closest('#chatPanel')) };
			});
			const before = await read();
			await t.check(`${w}x${h}: the chat is folded to its strip`, before.strip && before.w <= 40 && !before.open, JSON.stringify(before));
			const shown = await f.evaluate(() => PMW.chatCol.show());
			await t.page.waitForTimeout(700);
			const after = await read();
			await t.check(`${w}x${h}: show() opens it over the centre, 400 px, on top`, shown === true && after.open && after.w >= 400 && after.onTop, JSON.stringify(after));
		}
	};
}
