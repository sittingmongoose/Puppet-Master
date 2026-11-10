// Arm B only: address controls by `data-ui-element-id`, and list what is on screen in a few hundred bytes.
const listFn = (scope) => {
	const root = scope ? document.querySelector(scope) : document;
	if (!root) return { text: '', shown: 0, hidden: 0, others: 0, error: `no element matches the scope ${scope}` };
	const vw = innerWidth, vh = innerHeight, lines = []; let hidden = 0;
	const onTop = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > vw || y > vh) return false; const top = document.elementFromPoint(x, y); return !!top && (el === top || el.contains(top)); };
	for (const el of root.querySelectorAll('[data-ui-element-id]')) {
		const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
		const shown = r.width >= 1 && r.height >= 1 && cs.visibility !== 'hidden' && cs.display !== 'none';
		if (!shown) { hidden++; continue; }
		const role = el.getAttribute('role') || ({ BUTTON: 'button', A: 'link', INPUT: 'textbox' })[el.tagName] || el.tagName.toLowerCase();
		const name = (el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || '').replace(/\s+/g, ' ').trim();
		const flags = [el.getAttribute('aria-expanded') != null ? 'expanded=' + el.getAttribute('aria-expanded') : '', el.getAttribute('aria-selected') === 'true' ? 'selected' : '', el.disabled || el.getAttribute('aria-disabled') === 'true' ? 'disabled' : '', document.activeElement === el ? 'focused' : '', Number(cs.opacity) === 0 ? 'transparent' : '', onTop(el) ? '' : 'covered-or-out-of-view'].filter(Boolean).join(' ');
		lines.push(`${role} [${el.dataset.uiElementId}] ${JSON.stringify(name)}${flags ? ' ' + flags : ''}`);
	}
	const others = [...root.querySelectorAll('button,a[href],input,select,textarea,[role=button],[role=tab],[role=menuitem],[role=treeitem]')].filter((e) => !e.dataset.uiElementId && e.getBoundingClientRect().width > 0).length;
	return { text: lines.join('\n'), shown: lines.length, hidden, others };
};
const CAP = 4000; // bytes of listing returned at once
export const idHelpers = {
	// One line per control that carries an id: role [id] "name" state. Scope it with a CSS selector to keep it small.
	async list(t, scope = null) {
		const r = await t.page.evaluate(listFn, scope);
		if (r.error) throw new Error(r.error);
		let text = r.text, cut = '';
		if (Buffer.byteLength(text, 'utf8') > CAP) { const kept = []; let n = 0; for (const l of text.split('\n')) { n += Buffer.byteLength(l, 'utf8') + 1; if (n > CAP) break; kept.push(l); } cut = `\n(${r.shown - kept.length} more lines left out at ${CAP} bytes: pass a narrower scope)`; text = kept.join('\n'); }
		return `${text}${cut}\n(${r.shown} shown with an id; ${r.hidden} with an id not shown; ${r.others} other controls without an id)`;
	},
	// Exactly one control, or an error that says how many matched. Returns a Playwright Locator.
	async byId(t, id) {
		const loc = t.page.locator(`[data-ui-element-id=${JSON.stringify(id)}]`);
		const n = await loc.count();
		if (n !== 1) throw new Error(n === 0 ? `no control has the id ${id}; t.app.list() shows the ids on screen` : `${n} controls share the id ${id}; refusing to pick one`);
		return loc;
	}
};
