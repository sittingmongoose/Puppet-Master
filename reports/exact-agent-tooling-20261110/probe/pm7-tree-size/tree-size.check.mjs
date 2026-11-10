// Measurement probe (research only, not a kit check): how large is each way of telling an agent what is on screen?
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const compactListing = (scope) => {
	const sel = 'button,a[href],input,select,textarea,summary,[role=button],[role=tab],[role=menuitem],[role=menuitemradio],[role=menuitemcheckbox],[role=switch],[role=checkbox],[role=radio],[role=option],[role=link],[role=textbox],[role=combobox],[role=slider],[role=treeitem],[tabindex]:not([tabindex="-1"])';
	const root = scope ? document.querySelector(scope) : document;
	const vw = innerWidth, vh = innerHeight, lines = [];
	const stats = { total: 0, shown: 0, withId: 0, withCmd: 0, withAction: 0, noName: 0, dupNamesFull: 0, dupNamesCutAt48: 0 };
	const names = new Map(), namesCut = new Map();
	for (const el of root ? root.querySelectorAll(sel) : []) {
		stats.total++;
		const r = el.getBoundingClientRect();
		if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.right < 0 || r.top > vh || r.left > vw) continue;
		const cs = getComputedStyle(el);
		if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
		if (el.closest('[inert],[aria-hidden="true"]')) continue;
		const top = document.elementFromPoint(Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), Math.min(vh - 1, Math.max(0, r.top + r.height / 2)));
		if (!top || !(el === top || el.contains(top) || top.contains(el))) continue;
		stats.shown++;
		const role = el.getAttribute('role') || ({ A: 'link', BUTTON: 'button', INPUT: el.type === 'checkbox' ? 'checkbox' : el.type === 'radio' ? 'radio' : 'textbox', SELECT: 'combobox', TEXTAREA: 'textbox', SUMMARY: 'button' })[el.tagName] || el.tagName.toLowerCase();
		// A name taken from the DOM (aria-label, title, text, value, placeholder): not the browser's computed accessible name.
		const full = (el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.value || el.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim();
		const name = full.slice(0, 48); // the listing shows at most 48 characters of it
		const cmd = el.getAttribute('data-command-id') || el.getAttribute('data-command') || el.getAttribute('data-ui-action-id') || '';
		const act = el.getAttribute('data-action') || el.getAttribute('data-pm-home-action') || '';
		if (el.id) stats.withId++; if (cmd) stats.withCmd++; if (act) stats.withAction++; if (!name) stats.noName++;
		names.set(role + '|' + full, (names.get(role + '|' + full) || 0) + 1); namesCut.set(role + '|' + name, (namesCut.get(role + '|' + name) || 0) + 1);
		const flags = [el.disabled || el.getAttribute('aria-disabled') === 'true' ? 'disabled' : '', el.getAttribute('aria-checked') === 'true' || el.checked ? 'checked' : '', el.getAttribute('aria-selected') === 'true' ? 'selected' : '', el.getAttribute('aria-expanded') ? 'expanded=' + el.getAttribute('aria-expanded') : '', el.getAttribute('aria-pressed') === 'true' ? 'pressed' : '', document.activeElement === el ? 'focused' : ''].filter(Boolean).join(' ');
		lines.push(`${role}${el.id ? ' #' + el.id : ''}${cmd ? ' [' + cmd + ']' : act ? ' {' + act + '}' : ''}${name ? ' ' + JSON.stringify(name) : ''}${flags ? ' ' + flags : ''}`);
	}
	for (const n of names.values()) if (n > 1) stats.dupNamesFull += n;
	for (const n of namesCut.values()) if (n > 1) stats.dupNamesCutAt48 += n;
	const text = lines.join('\n');
	return { text, bytes: new TextEncoder().encode(text).length, chars: text.length, stats };
};

export const tests = {
	async 'what an agent would read'(t) {
		const page = t.args.page, out = t.args.out;
		await t.goto(`${pathToFileURL(page).href}?cb=${Date.now()}&o55=off`);
		await t.until('page ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
		await t.settle();
		const res = { page, pageBytes: fs.statSync(page).size, viewport: '1920x1080', surface: 'Home at rest, default look' };
		// 1. Chrome's full accessibility tree, as CDP returns it
		const cdp = await t.page.context().newCDPSession(t.page);
		await cdp.send('Accessibility.enable');
		const full = await cdp.send('Accessibility.getFullAXTree');
		await cdp.send('Accessibility.disable'); await cdp.detach();
		const fullJson = JSON.stringify(full);
		res.cdpFullAxTree = { nodes: full.nodes.length, bytesUtf8: Buffer.byteLength(fullJson, 'utf8'), chars: fullJson.length, ignored: full.nodes.filter((n) => n.ignored).length };
		// 2. Playwright's aria snapshot of the body (an existing compact text form)
		try { const y = await t.page.locator('body').ariaSnapshot(); res.playwrightAriaSnapshot = { bytesUtf8: Buffer.byteLength(y, 'utf8'), chars: y.length, lines: y.split('\n').length }; fs.writeFileSync(`${out}/aria-snapshot.yaml`, y); } catch (e) { res.playwrightAriaSnapshot = { error: String(e).slice(0, 200) }; }
		// 3. A compact listing of the interactive controls actually reachable in the viewport, by id and command id
		const whole = await t.page.evaluate(compactListing, null);
		res.compactControls = { bytesUtf8: whole.bytes, chars: whole.chars, lines: whole.text.split('\n').length, ...whole.stats };
		fs.writeFileSync(`${out}/compact-controls.txt`, whole.text);
		// 4. The same, scoped to one region (what a scoped `tree <target>` would return)
		for (const scope of ['.activity-bar', 'main.primary-content', '.chat-column, #chatColumn, [data-chat-column]']) {
			const part = await t.page.evaluate(compactListing, scope).catch(() => null);
			if (part) (res.scoped ??= {})[scope] = { bytesUtf8: part.bytes, chars: part.chars, lines: part.text ? part.text.split('\n').length : 0, shown: part.stats.shown };
		}
		// 5. A full frame, as the tool would list it under LOOK
		const png = await t.page.screenshot({ type: 'png' });
		res.screenshot = { pngBytes: png.length, tokensPerToolGuide: 2600 };
		// 6. DOM size for scale
		res.dom = await t.page.evaluate(() => ({ elements: document.querySelectorAll('*').length, outerHtmlChars: document.documentElement.outerHTML.length, ids: document.querySelectorAll('[id]').length, commandIdAttrs: document.querySelectorAll('[data-command-id],[data-command],[data-ui-action-id]').length }));
		fs.writeFileSync(`${out}/tree-size.json`, JSON.stringify(res, null, 1));
		await t.check('measured', res.cdpFullAxTree.nodes > 0 && res.compactControls.lines > 0, JSON.stringify(res.compactControls));
	}
};
