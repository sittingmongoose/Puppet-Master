// Required behaviour: a real click on a shown file row's "Copy relative path" button shows a notification whose text
// contains `cmd.file.copy_path -> <that row's path> (relative)`, and names no other row. Checked for every file row that
// is shown when the page opens and has the button. The expected path is derived from the tree's visible structure
// (each row's shown name joined with its ancestor folders' shown names, by aria-level), not from the row's own data.
const BTN = 'button[aria-label="Copy relative path"], button[title="Copy relative path"]';
const MARK = 'cmd.file.copy_path';

export const tests = {
	async 'every shown file row: Copy relative path notifies with that row\'s own path'(t) {
		await t.app.open();
		await t.settle();
		const tree = t.page.getByRole('tree', { name: 'Project files' });
		await t.visible(tree, 'Files panel tree is shown on open');

		// Rows shown on open, with the path the tree's structure gives them.
		const rows = await tree.evaluate((root, BTN) => {
			const items = [...root.querySelectorAll('[role="treeitem"]')];
			const name = (el) => ((el.querySelector('.fm-name') || el).textContent || '').trim();
			const stack = [];
			const out = [];
			items.forEach((el, i) => {
				const lvl = Number(el.getAttribute('aria-level')) || 1;
				stack.length = lvl - 1;
				const path = [...stack.filter(Boolean), name(el)].join('/');
				stack[lvl - 1] = name(el);
				const r = el.getBoundingClientRect();
				const shown = el.checkVisibility({ visibilityProperty: true, opacityProperty: true }) && r.width > 0 && r.height > 0;
				const isFolder = el.hasAttribute('aria-expanded');
				out.push({ i, path, name: name(el), shown, isFolder, hasBtn: !!el.querySelector(BTN), dataPath: el.getAttribute('data-path') });
			});
			return out;
		}, BTN);
		const targets = rows.filter((r) => r.shown && !r.isFolder && r.hasBtn);
		await t.check('at least one shown file row has a Copy relative path button', targets.length > 0,
			`shown file rows: ${rows.filter((r) => r.shown && !r.isFolder).map((r) => r.path).join(', ')}`);

		// Record every element added or changed after this point that carries the command text.
		await t.page.evaluate((MARK) => {
			window.__cpSeq = 0; window.__cpNodes = [];
			const add = (el) => { if (el && el.nodeType === 1 && (el.textContent || '').includes(MARK)) window.__cpNodes.push({ seq: ++window.__cpSeq, el }); };
			new MutationObserver((ms) => {
				for (const m of ms) {
					if (m.type === 'childList') for (const n of m.addedNodes) add(n.nodeType === 1 ? n : n.parentElement);
					else add(m.target.nodeType === 1 ? m.target : m.target.parentElement);
				}
			}).observe(document.body, { childList: true, subtree: true, characterData: true });
		}, MARK);

		const items = tree.locator('[role="treeitem"]');
		for (const r of targets) {
			const row = items.nth(r.i);
			const label = `${r.path}`;
			const before = await t.page.evaluate(() => window.__cpSeq);
			let clickErr = null;
			try {
				await row.hover({ timeout: 5000 });
				await row.locator(BTN).first().click({ timeout: 5000 });
			} catch (e) { clickErr = String(e.message || e).split('\n')[0]; }
			if (clickErr) { await t.check(`${label}: Copy relative path button takes a real click`, false, clickErr); continue; }

			let texts = [];
			try {
				await t.page.waitForFunction(({ before, MARK }) => window.__cpNodes.some((n) => n.seq > before && n.el.isConnected &&
					n.el.checkVisibility({ visibilityProperty: true }) && n.el.getBoundingClientRect().height > 0 && n.el.textContent.includes(MARK)),
					{ before, MARK }, { timeout: 5000 });
			} catch { /* reported below */ }
			texts = await t.page.evaluate(({ before, MARK }) => window.__cpNodes
				.filter((n) => n.seq > before && n.el.isConnected && n.el.checkVisibility({ visibilityProperty: true }) && n.el.getBoundingClientRect().height > 0)
				.map((n) => n.el.textContent.replace(/\s+/g, ' ').trim()).filter((s) => s.includes(MARK)), { before, MARK });

			const want = `${MARK} -> ${r.path} (relative)`;
			const named = [...new Set(texts.flatMap((s) => [...s.matchAll(/cmd\.file\.copy_path\s*->\s*(\S+)\s*\(relative\)/g)].map((m) => m[1])))];
			await t.check(`${label}: a notification shows "${want}"`, texts.some((s) => s.includes(want)),
				texts.length ? `notification text: ${texts.slice(0, 3).join(' || ').slice(0, 400)}` : 'no visible notification with the command text appeared within 5 s');
			await t.check(`${label}: the notification names no other row`, named.every((p) => p === r.path),
				`paths named: ${named.join(', ') || '(none)'}`);
			await t.page.mouse.move(5, 1075);
		}
	}
};
