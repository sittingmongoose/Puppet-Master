// FO-166: a CSS comment in `base/style/pm6-css-dashboard.css` ended at its own glob — `(width/height/min-*/ overflow)`
// — so the browser read the rest of its words as a selector prelude and dropped the whole `.pm-home-surface` rule after
// them (360 px flex basis, border, radius, surface background, isolation). No console error, no invalid rule in the
// CSSOM, nothing in the page to see. The build lint (`tools/css_comment_lint.py`) guards the source; this check reads
// what the browser actually kept, which is the thing that was lost.
// A CSS comment ends at its FIRST `*/`, so every `*/` the tokenizer meets outside a comment is a comment that ended
// early: here the sheet must keep the bare `.pm-home-surface` rule with its declarations. On main's page it keeps none.
// The rule is inert today: the legacy Home model that owns `.pm-home-surface` is hidden
// (`html[data-pmw-home="on"] #pm-home-workspace { display:none }`, 20-shell.css: "the old Home model no longer runs: its
// nodes are hidden, never removed"), and no script puts the class on an element. So the DOM count is reported and
// expected to be 0, and `--set shots=1` writes Home in Basic Dark and Glass Light at 1390x900 for a byte comparison
// between two builds: identical pixels are the proof that restoring the rule changes nothing on screen.
// About 20 seconds without shots, 40 with them.
const COUNT_LOOKS = ['basic-dark', 'glass-light', 'nier-dark'];
const SHOT_LOOKS = ['basic-dark', 'glass-light'];
const SIZE = [1390, 900];

/* every rule whose selector names .pm-home-surface, from the dashboard sheet and the viewport-split copies of it */
const RULES = () => {
	const out = [];
	/* Chrome gives every CSSStyleRule a (usually empty) cssRules of its own since CSS nesting, so read the selector
	   first and recurse into a rule's own rules only when it has any: testing cssRules first skips every style rule. */
	const walk = (rules) => {
		for (const rule of rules) {
			if (rule.selectorText && rule.selectorText.includes('.pm-home-surface')) out.push(rule.selectorText.trim());
			if (rule.cssRules && rule.cssRules.length) walk(rule.cssRules);
		}
	};
	for (const sheet of document.styleSheets) {
		const node = sheet.ownerNode;
		if (!node || !(node.id === 'pm6-css-dashboard' || (node.getAttribute && node.getAttribute('data-pm-split-of') === 'pm6-css-dashboard'))) continue;
		try { walk(sheet.cssRules); } catch (e) { /* a sheet that cannot be read is not this sheet */ }
	}
	return { bare: out.find((sel) => sel === '.pm-home-surface') || null, count: out.length, selectors: out.slice(0, 12) };
};

export const tests = {
	async 'FO-166 the browser keeps the .pm-home-surface rule and it matches nothing'(t) {
		await t.viewport(SIZE[0], SIZE[1]);
		let f = await t.app.open();
		await t.app.resetLayout();
		await t.page.waitForTimeout(800);
		const got = await f.evaluate(RULES);
		await t.check('.pm-home-surface rule is in the page\'s dashboard sheet', !!got.bare, JSON.stringify(got));
		const decl = await f.evaluate(() => {
			const find = (rules) => {
				for (const rule of rules) {
					if (rule.selectorText && rule.selectorText.trim() === '.pm-home-surface') return rule;
					if (rule.cssRules && rule.cssRules.length) { const hit = find(rule.cssRules); if (hit) return hit; }
				}
				return null;
			};
			for (const sheet of document.styleSheets) {
				const node = sheet.ownerNode;
				if (!node || !(node.id === 'pm6-css-dashboard' || (node.getAttribute && node.getAttribute('data-pm-split-of') === 'pm6-css-dashboard'))) continue;
				try { const rule = find(sheet.cssRules); if (rule) { const s = rule.style; return { basis: s.getPropertyValue('--pm-home-basis').trim(), flex: s.getPropertyValue('flex').trim(), border: s.getPropertyValue('border-top-width').trim(), radius: s.getPropertyValue('border-top-left-radius').trim(), background: s.getPropertyValue('background-color').trim(), isolation: s.getPropertyValue('isolation').trim() }; } } catch (e) { /* see RULES */ }
			}
			return null;
		});
		await t.check('the rule still carries its placement-level declarations', !!decl && decl.basis === '360px' && /^1 1 /.test(decl.flex) && decl.border === '1px' && decl.isolation === 'isolate', JSON.stringify(decl));

		for (const look of COUNT_LOOKS) {
			await t.app.look(look);
			await t.page.waitForTimeout(500);
			const n = await f.evaluate(() => {
				const ws = document.getElementById('pm-home-workspace');
				return { elements: document.querySelectorAll('.pm-home-surface').length, workspace: ws ? getComputedStyle(ws).display : 'missing' };
			});
			await t.check(`${look}: no element carries .pm-home-surface (the rule is inert)`, n.elements === 0, `${n.elements} element(s); #pm-home-workspace is ${n.workspace}`);
			console.log(`FO-166 NOTE ${look}: ${n.elements} element(s) carry .pm-home-surface; #pm-home-workspace is ${n.workspace}`);
		}

		if (t.args.shots) {
			for (const look of SHOT_LOOKS) {
				await t.viewport(SIZE[0], SIZE[1]);
				f = await t.app.open();
				await t.app.resetLayout();
				await t.app.look(look);
				await t.page.waitForTimeout(900);
				await t.shot(`home-${look}-${SIZE[0]}x${SIZE[1]}`, `Home, ${look}, ${SIZE[0]}x${SIZE[1]}`);
			}
		}
	}
};
