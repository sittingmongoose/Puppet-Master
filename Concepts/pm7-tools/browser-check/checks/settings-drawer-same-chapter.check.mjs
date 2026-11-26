// FO-241 (batch 20 lane L8; pre-existing on main 1e11fe17a7): at narrow Settings widths the chapter rail folds
// behind the top bar's menu button (.mobile-menu, container settings-host <= 720px). Pressing the chapter that is
// already active takes navigate()'s no-remount early return: it cleared state.railOpen but left the .rail-open
// class on .pm-shell, so the drawer (z-index 80) and its scrim (.pm-shell.rail-open::after, z-index 70) stayed over
// Settings until Escape or another chapter. The fix removes the class on that early return the way Escape does.
// Rows, both surfaces (--set sandbox=0/1):
//   same chapter  — at 740x900, a real press on the menu button opens the drawer; a real press on the active
//                   chapter must close it. FO-196 stages every chapter navigation (29-navigation-motion.js), so the
//                   close is judged against a page-side mark at navigate()'s commit, not the raw press: (1) within
//                   one frame of the commit, .pm-shell has no rail-open and paints no scrim; (2) the commit lands
//                   inside FO-196's own staging bound from the press (120 ms cap + 2 frames), and the drawer must be
//                   closed by press + 1 s (a navigate that never runs, or a close that never happens, fails). The
//                   press->commit delay is logged as a number. Then the panel centre hit-tests to Settings content
//                   and a real click on an index chip under the old scrim scrolls its section.
//   other chapter — from the open drawer, a real press on a different chapter still closes the drawer and
//                   navigates (regression).
//   wide guard    — at 1440x900 the rail is inline (no menu button); pressing the active chapter moves no box.
// Bite: the same-chapter rows fail main 1e11fe17a7 and a reversal of the fix; a build that also drops the drawer
// close from the different-chapter path fails the other-chapter row.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-drawer-same-chapter.check.mjs --set page=<build> --set sandbox=0

const MENU = '#panel-settings .mobile-menu[data-action="toggle-rail"]';

/* what the drawer, its scrim and the panel centre are doing right now */
const DRAWER = () => {
	const shell = document.querySelector('#panel-settings .pm-shell');
	const rail = document.querySelector('#panel-settings .domain-rail');
	if (!shell || !rail) return null;
	const rb = rail.getBoundingClientRect();
	const ws = document.querySelector('#panel-settings .workspace-shell');
	const wb = ws ? ws.getBoundingClientRect() : null;
	const cx = wb ? wb.left + wb.width * 0.6 : innerWidth * 0.6;
	const cy = wb ? wb.top + wb.height * 0.5 : innerHeight * 0.5;
	const top = document.elementFromPoint(cx, cy);
	const owner = !top ? 'nothing'
		: top.closest('#panel-settings .workspace-shell') ? 'workspace'
		: top.closest('#panel-settings .domain-rail') ? 'drawer'
		: top.closest('#panel-settings .pm-shell') ? 'shell (scrim)'
		: `${top.tagName.toLowerCase()}.${String(top.className).split(' ')[0]}`;
	const sb = shell.getBoundingClientRect();
	return {
		open: shell.classList.contains('rail-open'),
		scrim: getComputedStyle(shell, '::after').content,
		shellLeft: Math.round(sb.left),
		railLeft: Math.round(rb.left), railRight: Math.round(rb.right),
		railAway: rb.right <= sb.left + 1, railIn: rb.left >= sb.left - 1,
		centre: [Math.round(cx), Math.round(cy)], topAtCentre: owner,
	};
};

/* the rail folds to the left of the shell's own edge (the shell sits right of the Activity bar) */
const drawerOpen = () => {
	const shell = document.querySelector('#panel-settings .pm-shell');
	const rail = document.querySelector('#panel-settings .domain-rail');
	if (!shell || !rail) return false;
	return shell.classList.contains('rail-open')
		&& rail.getBoundingClientRect().left >= shell.getBoundingClientRect().left - 1
		&& getComputedStyle(shell, '::after').content !== 'none';
};
const drawerShut = () => {
	const shell = document.querySelector('#panel-settings .pm-shell');
	const rail = document.querySelector('#panel-settings .domain-rail');
	if (!shell || !rail) return false;
	return !shell.classList.contains('rail-open')
		&& rail.getBoundingClientRect().right <= shell.getBoundingClientRect().left + 1
		&& getComputedStyle(shell, '::after').content === 'none';
};

/* Frame probe (lead ruling): mark the trusted press, the navigate() commit, and the close; sample the shell class
   and scrim every frame until just past press + 1 s.
   press  = the capture-phase click on the active chapter (before the app's bubble handler).
   commit = FO-196's staging finishes navigate(): o55NavAck(null) clears the data-o55-nav-pending acknowledgement on
            the active chapter link. Fires on any build where navigate runs, whether or not it closes the drawer, so
            the press->commit delay is measurable on main too.
   close  = classList.remove('rail-open'), the fix's synchronous close inside the early return. */
const ARM_PROBE = () => {
	const P = window.__fo241 = { press: null, pressTime: null, commit: null, commitTime: null, close: null, closeTime: null, samples: [], done: false };
	let n = 0;
	const tick = () => {
		n += 1;
		const shell = document.querySelector('#panel-settings .pm-shell');
		const t = performance.now();
		P.samples.push({ n, t, open: shell ? shell.classList.contains('rail-open') : null, scrim: shell ? getComputedStyle(shell, '::after').content : null });
		if ((P.pressTime !== null && t >= P.pressTime + 1150) || n > 900) { P.done = true; return; }
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
	document.addEventListener('click', (e) => {
		if (P.press === null && e.target.closest && e.target.closest('#panel-settings .domain-link.active')) { P.press = n; P.pressTime = performance.now(); }
	}, true);
	const link = document.querySelector('#panel-settings .domain-link.active');
	if (link) {
		new MutationObserver((muts) => {
			for (const m of muts) {
				if (P.pressTime !== null && P.commit === null && m.oldValue !== null && !link.hasAttribute('data-o55-nav-pending')) { P.commit = n; P.commitTime = performance.now(); }
			}
		}).observe(link, { attributes: true, attributeFilter: ['data-o55-nav-pending'], attributeOldValue: true });
	}
	const origRemove = DOMTokenList.prototype.remove;
	window.__fo241origRemove = origRemove;
	DOMTokenList.prototype.remove = function (...tokens) {
		if (tokens.includes('rail-open') && P.pressTime !== null && P.close === null) { P.close = n; P.closeTime = performance.now(); }
		return origRemove.apply(this, tokens);
	};
};

async function openDrawer(t, f, cell) {
	/* a drawer left open by the bug already covers the menu button with its scrim: take it as open, do not press */
	const already = await f.evaluate(drawerOpen);
	if (already) {
		t.log(`${cell}: the drawer is already open`);
	} else {
		const pressed = await f.locator(MENU).click({ timeout: 4000 }).then(() => true).catch((e) => {
			t.log(`${cell}: the menu press was refused: ${String(e.message).split('\n')[0].slice(0, 160)}`);
			return false;
		});
		if (!pressed) return t.check(`${cell}: the chapter drawer is open with its scrim`, false, 'the menu button could not be pressed');
	}
	const open = await f.waitForFunction(drawerOpen, null, { timeout: 4000, polling: 50 }).then(() => true).catch(() => false);
	return t.check(`${cell}: the chapter drawer is open with its scrim`, open, 'no rail-open drawer with its scrim');
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-241 the Settings drawer closes on the active chapter (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }

		/* Settings opens wide (at 740 the Settings page tab itself is in the overflow menu), then the window folds */
		await t.viewport(1390, 900);
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout();
		await f.locator('#tab-settings').click();
		await t.settle();

		const cell = '740x900';
		await t.step(cell, async () => {
			await t.viewport(740, 900);
			await t.page.waitForTimeout(400);
			const narrow = await f.evaluate(() => {
				const menu = document.querySelector('#panel-settings .mobile-menu[data-action="toggle-rail"]');
				const rail = document.querySelector('#panel-settings .domain-rail');
				const shell = document.querySelector('#panel-settings .pm-shell');
				const mb = menu ? menu.getBoundingClientRect() : null;
				const rb = rail ? rail.getBoundingClientRect() : null;
				const sb = shell ? shell.getBoundingClientRect() : null;
				return {
					menu: !!menu && !!mb && mb.width > 0 && getComputedStyle(menu).display !== 'none',
					railRight: rb ? Math.round(rb.right) : null, shellLeft: sb ? Math.round(sb.left) : null,
					away: !!rb && !!sb && rb.right <= sb.left + 1,
				};
			});
			if (!(await t.check(`${cell}: the chapter rail is folded behind the menu button`, narrow.menu && narrow.away,
				`menu visible: ${narrow.menu}, rail right edge: ${narrow.railRight}, shell left edge: ${narrow.shellLeft}`))) return;

			/* reach a chapter page: from Settings Home, press General in the open drawer */
			if (!(await openDrawer(t, f, `${cell} to General`))) return;
			await f.locator('#panel-settings .domain-link[data-domain="general"]').click({ timeout: 4000 });
			const landed = await f.waitForFunction(() => {
				const shell = document.querySelector('#panel-settings .pm-shell');
				return !!document.querySelector('#panel-settings .domain-link.active[data-domain="general"]')
					&& !!document.querySelector('#panel-settings [data-workspace-block="app-input"]')
					&& !!shell && !shell.classList.contains('rail-open');
			}, null, { timeout: 8000 }).then(() => true).catch(() => false);
			if (!(await t.check(`${cell}: General opens from the drawer and the drawer closes`, landed, 'General did not mount with the drawer shut'))) return;
			await f.waitForFunction(drawerShut, null, { timeout: 4000, polling: 50 }).catch(() => {});
			await t.settle();

			/* same chapter: open the drawer, press the active chapter, judge the close against the navigate commit */
			const before = await f.evaluate(DRAWER);
			if (!(await openDrawer(t, f, `${cell} same chapter`))) return;
			const armed = await f.evaluate(() => {
				const d = document.querySelector('#panel-settings .domain-link.active');
				return d ? d.getAttribute('data-domain') : null;
			});
			await t.check(`${cell} same chapter: the active chapter is General`, armed === 'general', `active chapter: ${armed}`);
			await f.evaluate(ARM_PROBE);
			await f.locator('#panel-settings .domain-link.active').click({ timeout: 4000 });
			const probed = await f.waitForFunction(() => window.__fo241 && window.__fo241.done, null, { timeout: 6000 }).then(() => true).catch(() => false);
			const probe = await f.evaluate(() => window.__fo241);
			if (!(await t.check(`${cell} same chapter: the press was sampled`, probed && probe && probe.pressTime !== null, 'the frame probe never saw the press'))) return;
			/* the commit mark is FO-196 clearing the acknowledgement; if navigate ran synchronously (no staging), the
			   close is the commit. On main the commit fires but no close does. */
			const commitN = probe.commit !== null ? probe.commit : probe.close;
			const commitT = probe.commitTime !== null ? probe.commitTime : probe.closeTime;
			const delay = commitT !== null ? Math.round(commitT - probe.pressTime) : null;
			t.log(`${cell} same chapter: press->commit ${delay === null ? 'no commit observed' : delay + ' ms'}; close ${probe.closeTime !== null ? Math.round(probe.closeTime - probe.pressTime) + ' ms after press' : 'never'} (FO-196 staging bound 120 ms + 2 frames)`);
			const afterCommit = probe.samples.filter((s) => commitN !== null && s.n > commitN && s.n <= commitN + 1);
			await t.check(`${cell} same chapter: within one frame of navigate committing, the shell carries no rail-open and paints no scrim`,
				commitN !== null && afterCommit.length > 0 && afterCommit.every((s) => s.open === false && s.scrim === 'none'),
				commitN === null ? 'no navigate commit observed' : `frames after commit: ${JSON.stringify(afterCommit)}`);
			const bound = 120 + 2 * (1000 / 60);
			await t.check(`${cell} same chapter: the navigate commit lands inside the FO-196 staging bound of the press`,
				commitT !== null && (commitT - probe.pressTime) <= bound,
				commitT === null ? 'no commit observed' : `${Math.round(commitT - probe.pressTime)} ms against a ${Math.round(bound)} ms bound`);
			const within1s = probe.samples.filter((s) => s.t <= probe.pressTime + 1000);
			const last1s = within1s[within1s.length - 1];
			await t.check(`${cell} same chapter: the drawer is closed within 1 s of the press`,
				!!last1s && last1s.open === false && last1s.scrim === 'none',
				!last1s ? 'no sample within 1 s' : `at ${Math.round(last1s.t - probe.pressTime)} ms: rail-open=${last1s.open} scrim=${last1s.scrim}`);
			await f.evaluate(() => { if (window.__fo241origRemove) { DOMTokenList.prototype.remove = window.__fo241origRemove; delete window.__fo241origRemove; } });
			const after = await f.evaluate(DRAWER);
			t.log(`${cell} same chapter: after the press ${JSON.stringify(after)} (before the press ${JSON.stringify(before)})`);
			await t.check(`${cell} same chapter: the panel centre hit-tests to Settings content, not the scrim`,
				after.topAtCentre === 'workspace', `top at ${after.centre.join(',')}: ${after.topAtCentre}`);
			await f.waitForFunction(drawerShut, null, { timeout: 4000, polling: 50 }).catch(() => {});
			if (surface === 'normal') await t.shot(`fo241-${surface}-same-chapter`, 'Settings at 740x900 after pressing the active chapter: drawer and scrim gone');

			/* a Settings control under the old scrim takes a real click: the rightmost visible index chip, found by
			   its box (a cover does not hide the box); the click itself proves whether the control is reachable */
			const chip = await f.evaluate(() => {
				const links = [...document.querySelectorAll('#panel-settings .index-link')].filter((e) => e.getClientRects().length);
				let best = null;
				for (const e of links) {
					const b = e.getBoundingClientRect();
					const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
					if (b.right > innerWidth || b.left < 0 || cx <= 300) continue;
					const top = document.elementFromPoint(cx, cy);
					const covered = !top || !e.contains(top);
					if (!best || cx > best.cx) best = { cx, cy, covered, section: e.getAttribute('data-section'), label: e.textContent.trim() };
				}
				return best;
			});
			if (!(await t.check(`${cell} same chapter: an index chip lies under the old scrim, right of the drawer`, !!chip, 'no visible index chip right of x=300'))) return;
			t.log(`${cell} same chapter: chip "${chip.label}" at ${Math.round(chip.cx)},${Math.round(chip.cy)}; covered before the click: ${chip.covered}`);
			const scrollBefore = await f.evaluate(() => { const s = document.querySelector('#settings-document'); return s ? s.scrollTop : null; });
			const clicked = await f.locator(`#panel-settings .index-link[data-section="${chip.section}"]`).first().click({ timeout: 3000 }).then(() => true).catch((e) => {
				t.log(`${cell} same chapter: the chip click was refused: ${String(e.message).split('\n')[0].slice(0, 160)}`);
				return false;
			});
			const moved = clicked && await f.waitForFunction((before) => {
				const s = document.querySelector('#settings-document');
				return !!s && Math.abs(s.scrollTop - before) > 4;
			}, scrollBefore, { timeout: 3000 }).then(() => true).catch(() => false);
			const scrollAfter = await f.evaluate(() => { const s = document.querySelector('#settings-document'); return s ? s.scrollTop : null; });
			await t.check(`${cell} same chapter: a real click on the "${chip.label}" chip under the old scrim scrolls its section`,
				clicked && moved, !clicked ? 'the click never reached the chip (covered)' : `scrollTop ${scrollBefore} -> ${scrollAfter}`);

			/* regression: a different chapter pressed from the open drawer still closes it and navigates */
			const cell2 = `${cell} other chapter`;
			if (!(await openDrawer(t, f, cell2))) return;
			await f.locator('#panel-settings .domain-link[data-domain="ai"]').click({ timeout: 4000 });
			const nav = await f.waitForFunction(() => {
				const shell = document.querySelector('#panel-settings .pm-shell');
				return !!document.querySelector('#panel-settings .domain-link.active[data-domain="ai"]')
					&& !!document.querySelector('#panel-settings [data-workspace-block="providers"]')
					&& !!shell && !shell.classList.contains('rail-open');
			}, null, { timeout: 8000 }).then(() => true).catch(() => false);
			await t.check(`${cell2}: AI & Providers opens and the drawer closes`, nav, 'the other chapter did not mount with the drawer shut');
			const shut = await f.waitForFunction(drawerShut, null, { timeout: 4000, polling: 50 }).then(() => true).catch(() => false);
			const d2 = await f.evaluate(DRAWER);
			await t.check(`${cell2}: the drawer is fully away and no scrim is painted`, shut && d2.topAtCentre === 'workspace', JSON.stringify(d2));
		});

		/* wide guard: at full width the rail is inline and the active-chapter press moves no box */
		await t.step('1440x900', async () => {
			await t.viewport(1440, 900);
			await t.page.waitForTimeout(400);
			/* let the resized layout settle: the rail and tabs boxes must read the same twice running */
			await f.waitForFunction(() => {
				const rail = document.querySelector('#panel-settings .domain-rail');
				const tabs = document.querySelector('#panel-settings .workspace-tabs');
				const rb = rail ? rail.getBoundingClientRect() : null;
				const tb = tabs ? tabs.getBoundingClientRect() : null;
				const sig = [rb && rb.left, rb && rb.top, rb && rb.width, tb && tb.left, tb && tb.width].map((v) => v == null ? 'x' : v.toFixed(1)).join(',');
				const prev = window.__fo241wide; window.__fo241wide = sig;
				return prev === sig;
			}, null, { timeout: 5000, polling: 250 }).catch(() => {});
			/* the wide guard stands alone: reach a chapter page if the narrow rows left Settings Home */
			const hasChapter = await f.evaluate(() => !!document.querySelector('#panel-settings .domain-link.active'));
			if (!hasChapter) {
				await f.locator('#panel-settings .domain-link[data-domain="general"]').click({ timeout: 4000 });
				await f.waitForFunction(() => !!document.querySelector('#panel-settings .domain-link.active[data-domain="general"]')
					&& !!document.querySelector('#panel-settings [data-workspace-block="app-input"]'), null, { timeout: 8000 }).catch(() => {});
				await t.page.waitForTimeout(300);
			}
			const wide = await f.evaluate(() => {
				const menu = document.querySelector('#panel-settings .mobile-menu[data-action="toggle-rail"]');
				const rail = document.querySelector('#panel-settings .domain-rail');
				const shell = document.querySelector('#panel-settings .pm-shell');
				const rb = rail ? rail.getBoundingClientRect() : null;
				const tabs = document.querySelector('#panel-settings .workspace-tabs');
				const tb = tabs ? tabs.getBoundingClientRect() : null;
				return {
					menuHidden: !menu || getComputedStyle(menu).display === 'none' || !menu.getClientRects().length,
					position: rail ? getComputedStyle(rail).position : null,
					transform: rail ? getComputedStyle(rail).transform : null,
					rail: rb ? [rb.left, rb.top, rb.width, rb.height].map((v) => Math.round(v * 10) / 10) : null,
					tabs: tb ? [tb.left, tb.top, tb.width, tb.height].map((v) => Math.round(v * 10) / 10) : null,
					scrim: shell ? getComputedStyle(shell, '::after').content : null,
					open: shell ? shell.classList.contains('rail-open') : null,
				};
			});
			/* the rail-open class itself is narrow-only CSS; at full width judge the layout, log the class */
			if (!(await t.check('1440x900: the rail is inline, no menu button, no scrim',
				wide.menuHidden && wide.position !== 'absolute' && wide.scrim === 'none' && wide.rail && wide.rail[2] > 100 && wide.tabs,
				JSON.stringify(wide)))) return;
			await f.locator('#panel-settings .domain-link.active').click({ timeout: 4000 });
			await t.page.waitForTimeout(400);
			const after = await f.evaluate(() => {
				const rail = document.querySelector('#panel-settings .domain-rail');
				const shell = document.querySelector('#panel-settings .pm-shell');
				const tabs = document.querySelector('#panel-settings .workspace-tabs');
				const rb = rail ? rail.getBoundingClientRect() : null;
				const tb = tabs ? tabs.getBoundingClientRect() : null;
				return {
					rail: rb ? [rb.left, rb.top, rb.width, rb.height].map((v) => Math.round(v * 10) / 10) : null,
					tabs: tb ? [tb.left, tb.top, tb.width, tb.height].map((v) => Math.round(v * 10) / 10) : null,
					open: shell ? shell.classList.contains('rail-open') : null,
					scrim: shell ? getComputedStyle(shell, '::after').content : null,
					mounted: !!document.querySelector('#panel-settings [data-workspace-block]'),
				};
			});
			const sameBox = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 1);
			t.log(`1440x900: rail ${JSON.stringify(wide.rail)} -> ${JSON.stringify(after.rail)}; tabs ${JSON.stringify(wide.tabs)} -> ${JSON.stringify(after.tabs)}; rail-open class ${wide.open} -> ${after.open}`);
			await t.check('1440x900: pressing the active chapter moves no rail or tabs box and paints no scrim',
				sameBox(wide.rail, after.rail) && sameBox(wide.tabs, after.tabs) && after.scrim === 'none' && after.mounted,
				JSON.stringify(after));
			if (surface === 'normal') await t.shot(`fo241-${surface}-wide`, 'Settings at 1440x900 after pressing the active chapter: the inline rail unchanged');
		});
	};
}
