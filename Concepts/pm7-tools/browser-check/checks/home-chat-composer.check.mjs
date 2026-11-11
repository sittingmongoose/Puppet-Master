// Stream F batch 10 (handed over by stream P's Projects concept report, "Base page").
// FO-143: the hosted chat's compact composer state (is-compact, and is-measuring while it measures) belongs to its own
//   composer in #pmRoot. The base JS took the document's first .composer-box (and observed every one), so another
//   surface's composer on the same page got the chat's classes. A narrow foreign .composer-box is put first in the
//   document; window resizes that make the chat re-measure must leave it without those classes, while the chat's own
//   composer still follows its width (compact in a narrow column, not in a wide one).
// FO-142 (the contract, not a change): at 860 px Home folds the chat to its edge strip (the narrow ladder, D4: the centre
//   keeps its 480 px floor), and PMW.chatCol.show() opens it over the centre at its full 400 px, on top and clickable;
//   it does not widen the docked column. A regression guard.

// FO-156 (review, 2026-11-11): the composer's compact decision is cached on the tools' intrinsic labeled width
//   (app.js syncComposerCompact: composerMeasureCache / labeledToolsMin, keyed on the text, the theme and the fonts'
//   status). Changing the look while the chat column is already narrow must decide again: this case resizes nothing.
//   The review's route: fresh 1920 x 1080, Basic Light with Reduced Motion, PMW.chatCol.setWidth(400); then motion
//   back to normal and the look to Friendly Dark. On the unfixed page the labeled tools stayed on screen, centred in
//   their box and cut at both ends (-9.6 / 388.6 in 379), until a width change re-ran the decision. The fix keys the
//   cache on the painted face too and re-runs the decision on html[data-theme]/[data-motion] and when a font finishes
//   loading. --set probe=1 logs the decision over 1.5 s after the change.
//   --set column=W is the reviewer's own route, needed where the labels' face is still on its way when the column is
//   set (pages over http: a Windows --host run): the width is set at once and the look switched by the page's theme
//   call (t.app.look), as their probe does, and the case fails main on the decision and on the overhanging labels.
//   Without it the column is calibrated after everything settled, which is the deterministic guard for file:// runs.

const READ = () => {
	const box = document.querySelector('#pmRoot .composer-box[data-k="composer-box"]');
	const tools = box && box.querySelector('.composer-tools');
	if (!box || !tools) return null;
	const b = box.getBoundingClientRect();
	const kids = [...tools.children].filter((k) => k.getClientRects().length);
	if (!kids.length) return null;
	// layout coordinates: a focused/clipped tools row may have been scrolled, which moves its children's client rects
	// but not where they sit in its content box
	const sl = tools.scrollLeft;
	const rects = kids.map((k) => k.getBoundingClientRect());
	const left = Math.min(...rects.map((r) => r.left)) - b.left + sl;
	const right = Math.max(...rects.map((r) => r.right)) - b.left + sl;
	const sel = tools.querySelector('.selector-button');
	const label = tools.querySelector('.selector-button .sel-label');
	/* What the labels weigh in the look painted right now: the product's own measurement (app.js
	   measureLabeledTools) run read-only — is-measuring shows the labels for the read and is taken off again. The
	   decision it implies is the product's rule: compact when the room is under the labels plus its 8 px slack. */
	const labeled = (() => {
		const had = box.classList.contains('is-measuring');
		if (!had) box.classList.add('is-measuring');
		const gap = parseFloat(getComputedStyle(tools).gap) || 0;
		const w = [...tools.children].reduce((n, el) => n + el.getBoundingClientRect().width, 0) + gap * Math.max(0, tools.children.length - 1);
		if (!had) box.classList.remove('is-measuring');
		return Math.round(w * 10) / 10;
	})();
	return {
		compact: box.classList.contains('is-compact'),
		boxW: Math.round(b.width * 10) / 10,
		labeled,
		expected: tools.clientWidth < labeled + 8,
		overL: Math.round(left * 10) / 10,
		overR: Math.round((right - tools.clientWidth) * 10) / 10,
		content: tools.scrollWidth,
		room: tools.clientWidth,
		scrollLeft: Math.round(sl * 10) / 10,
		font: sel ? getComputedStyle(sel).font : null,
		label: label ? label.textContent : null,
		labelsShown: !!label && label.getClientRects().length > 0,
		theme: document.documentElement.getAttribute('data-theme') || '',
		motion: document.documentElement.getAttribute('data-motion') || '',
		fonts: document.fonts ? document.fonts.status : 'n/a',
		chatOpen: !!(window.PMW && PMW.chatCol && PMW.chatCol.isOpen && PMW.chatCol.isOpen()),
		colW: window.PMW && PMW.chatCol && PMW.chatCol.widthPx ? PMW.chatCol.widthPx() : null,
		kids: kids.map((k, i) => `${k.tagName.toLowerCase()}${typeof k.className === 'string' && k.className.trim() ? '.' + k.className.trim().split(/\s+/)[0] : ''} ${Math.round(rects[i].width)}w "${(k.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 18)}"`),
	};
};
const fits = (r) => !!r && r.compact === r.expected;

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-156 a look change re-measures the narrow composer (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		await t.viewport(1920, 1080);
		await t.emulate({ reducedMotion: 'reduce' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.look('basic-light');
		await f.waitForFunction(() => !!document.querySelector('#pmRoot .composer-box[data-k="composer-box"]'), null, { timeout: 30000 });
		// the review's window, and a narrow chat column by the page's own command; no viewport change anywhere here
		const read = () => f.evaluate(READ);
		const narrow = (w) => f.evaluate((x) => window.PMW.chatCol.setWidth(x), w);
		/* --set column=W takes the reviewer's own width (400, the page's floor) and their order: the column is set at
		   once, while the labels' face is still on its way (their pages are http, so the web fonts land late), which
		   is the state their run caught. Otherwise the column is measured and set after everything has settled. */
		const fixed = t.args.column ? Number(t.args.column) : null;
		let at400 = null, col = fixed, set = null, before = null;
		if (fixed) {
			set = await narrow(col);
			await f.waitForFunction((w) => { const c = document.querySelector('#chatPanel'); return !!c && Math.round(c.getBoundingClientRect().width) === w; }, col, { timeout: 15000 }).catch(() => {});
			before = await read();
		} else {
			await narrow(400);
			await t.page.waitForTimeout(900);
			at400 = await read();
		}
		if (t.args.labels && at400) {
			// diagnostic: what each look's labels weigh in this 400 px column, and what the rule makes of it
			for (const look of ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'retro-light', 'retro-dark', 'glass-light', 'glass-dark', 'nier-light', 'nier-dark']) {
				await t.app.look(look);
				await t.page.waitForTimeout(500);
				const r = await f.evaluate(READ);
				t.log(`labels ${look}: ${JSON.stringify({ compact: r.compact, expected: r.expected, labeled: r.labeled, room: r.room, font: r.font })}`);
			}
			await t.check('labels: the table was read in every look', true);
			return;
		}
		/* The review's relation — the first look's labels still shown in a narrow column, the second look's too wide
		   for it — is calibrated from what each look's labels weigh here: Basic Light is 383.7 px and Friendly Dark
		   398.1 px, and the column's own chrome takes 23 px, so a 423 px column (400 px of room) holds the first and
		   not the second. The column is set once, before the look changes; the look change itself resizes nothing. */
		if (!fixed) {
			const offset = Math.round(at400.colW - at400.room);
			await t.app.look('friendly-dark');
			const other = await read();
			await t.app.look('basic-light');
			await t.page.waitForTimeout(400);
			col = Math.max(400, Math.round((Math.ceil(at400.labeled + 8) + Math.ceil(other.labeled + 8)) / 2) + offset);
			set = await narrow(col);
			await t.page.waitForTimeout(900);
			before = await read();
		}
		if (t.args.probe) t.log('before: ' + JSON.stringify(before));
		await t.check(`the route starts on Basic Light in a ${col} px column${fixed ? ' (the reviewer\'s width)' : ', its labels shown'}`, !!before && set.ok === true && before.theme === 'basic-light' && before.boxW >= 340 && before.boxW <= 470 && (fixed ? true : before.compact === false && before.labelsShown === true && fits(before)), JSON.stringify({ set, at400: at400 && { labeled: at400.labeled, room: at400.room }, before }));
		// the review's change, in its order: motion back to normal, then Friendly Dark. With --set column= (the
		// reviewer's own route) the look is switched by the page's own theme call, as their probe does; otherwise
		// through the title bar's look menu, as a person changes it. No viewport or column change either way.
		await t.emulate({ reducedMotion: 'no-preference' });
		if (fixed) {
			await t.app.look('friendly-dark');
		} else {
			await f.locator('#themeSelect').click();
			await f.locator('#themeMenu .pm6-tt-mode[data-mode-value="dark"]').click({ timeout: 8000 }).catch(() => {});
			if (!(await f.locator('#themeMenu').isVisible().catch(() => false))) await f.locator('#themeSelect').click();
			await f.locator('#themeMenu .pm6-tt-family[data-family="friendly"]').click();
		}
		await f.waitForFunction(() => (document.documentElement.getAttribute('data-theme') || '') === 'friendly-dark', null, { timeout: 20000 }).catch(() => {});
		const timeline = [];
		for (const ms of (t.args.probe ? [0, 60, 200, 500, 1000, 1500] : [1200])) {
			await t.page.waitForTimeout(ms);
			timeline.push({ ms, ...(await read()) });
		}
		if (t.args.probe) timeline.forEach((r) => t.log(`probe ${r.ms}ms: ${JSON.stringify(r)}`));
		const after = timeline[timeline.length - 1];
		await t.check('the look changed and the column did not', !!after && after.theme === 'friendly-dark' && Math.abs(after.boxW - before.boxW) < 1, JSON.stringify({ before: before && before.boxW, after }));
		await t.check('the decision is made again for the look now painted', fits(after), JSON.stringify({ compact: after && after.compact, expected: after && after.expected, labeled: after && after.labeled, room: after && after.room, stale: before && before.labeled }));
		await t.check('the narrow composer holds its labels', !!after && after.compact === true && after.labelsShown === false, JSON.stringify(after));
	};

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
