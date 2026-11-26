// FO-241 round 2. Replay the drawer focus and backdrop findings with trusted mouse and keyboard input.
const LOOKS = [
	'basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'retro-dark',
	'retro-light', 'glass-dark', 'glass-light', 'nier-dark', 'nier-light',
];
const SHELL = '#panel-settings .pm-shell';
const MENU = SHELL + ' .mobile-menu';
const GENERAL = SHELL + ' .domain-link[data-domain="general"]';
const ACTIVE = SHELL + ' .domain-link.active';

async function click(t, locator) {
	const box = await locator.boundingBox();
	if (!box) throw new Error('The mouse target has no visible box');
	await t.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

const drawerOpen = (selector) => {
	const shell = document.querySelector(selector);
	const rail = shell.querySelector('.domain-rail');
	return shell.classList.contains('rail-open')
		&& getComputedStyle(shell, '::after').content !== 'none'
		&& rail.getBoundingClientRect().left >= shell.getBoundingClientRect().left - 1;
};
const drawerClosed = (selector) => {
	const shell = document.querySelector(selector);
	return !shell.classList.contains('rail-open') && getComputedStyle(shell, '::after').content === 'none';
};

const readFocus = (shell) => {
	const active = document.activeElement;
	const menu = shell.querySelector('.mobile-menu');
	const rail = shell.querySelector('.domain-rail');
	const box = menu.getBoundingClientRect();
	const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
	return {
		menu: active === menu && menu.contains(hit),
		inRail: rail.contains(active),
		element: active.tagName,
		action: active.dataset.action,
		domain: active.dataset.domain,
		x: Math.round(active.getBoundingClientRect().left),
		chapter: shell.querySelector('.domain-link.active')?.dataset.domain,
		drawer: shell.classList.contains('rail-open'),
	};
};

async function exercise(t, surface, look) {
	await t.viewport(1390, 900);
	await t.emulate({ reducedMotion: look.endsWith('-light') ? 'reduce' : 'no-preference' });
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await t.app.look(t, look, { save: true });
	await click(t, f.locator('#tab-settings'));
	await t.settle();

	const shell = f.locator(SHELL);
	const menu = f.locator(MENU);
	const general = f.locator(GENERAL);
	const read = () => shell.evaluate(readFocus);
	const open = async (settled = true) => {
		await f.waitForFunction((selector) => {
			const trigger = document.querySelector(selector);
			const box = trigger.getBoundingClientRect();
			return trigger.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
		}, MENU, { timeout: 5000 });
		await click(t, menu);
		await f.waitForFunction(settled ? drawerOpen : (selector) => document.querySelector(selector).classList.contains('rail-open'),
			SHELL, { timeout: 5000 });
	};
	const closed = () => f.evaluate(drawerClosed, SHELL);
	const waitClosed = () => f.waitForFunction(drawerClosed, SHELL, { timeout: 5000 });

	await t.viewport(740, 900);
	await open();
	await click(t, general);
	await f.locator(GENERAL + '.active').waitFor();
	await open();
	await click(t, general);
	await waitClosed();
	await f.waitForFunction((selector) => {
		const shell = document.querySelector(selector);
		return shell.querySelector('.domain-rail').getBoundingClientRect().right <= shell.getBoundingClientRect().left + 1;
	}, SHELL, { timeout: 5000 });

	const theme = await f.evaluate(() => ({
		name: document.documentElement.dataset.theme,
		nier: document.documentElement.dataset.o55Nier,
		reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
	}));
	const matchesLook = theme.name === look || (look.startsWith('nier-') && theme.nier === 'on' && theme.name?.endsWith(look.slice(4)));
	await t.check('the requested look and motion preference survive chapter navigation',
		matchesLook && theme.reduced === look.endsWith('-light'), JSON.stringify(theme));
	const afterChapter = await read();
	await t.check('pressing General again closes the drawer and focuses the visible menu',
		await closed() && afterChapter.menu && afterChapter.chapter === 'general', JSON.stringify(afterChapter));

	const blocked = await shell.evaluate((el) => {
		const shellLeft = el.getBoundingClientRect().left;
		const buttons = [...el.querySelectorAll('.domain-rail button')];
		return { count: buttons.length, exposed: buttons.filter((button) => {
			const style = getComputedStyle(button);
			return button.getBoundingClientRect().right > shellLeft + 1
				&& !button.closest('[inert]') && style.interactivity !== 'inert' && style.visibility !== 'hidden';
		}).map((button) => button.textContent.trim()) };
	});
	await t.page.keyboard.press('Tab');
	const afterTab = await read();
	await t.check('Tab leaves the folded rail out of the focus order',
		!afterTab.inRail && blocked.count > 0 && blocked.exposed.length === 0,
		JSON.stringify({ afterTab, blocked }));
	await t.page.keyboard.press('Enter');
	await t.settle();
	const afterEnter = await read();
	await t.check('Enter after Tab keeps the current chapter and the drawer closed',
		afterEnter.chapter === 'general' && await closed(), JSON.stringify(afterEnter));

	await open(false);
	await t.page.keyboard.press('Escape');
	const earlyEscape = await read();
	await t.check('Escape right after opening closes the drawer and focuses the menu',
		await closed() && earlyEscape.menu, JSON.stringify(earlyEscape));

	if (earlyEscape.drawer) {
		await f.waitForFunction(drawerOpen, SHELL, { timeout: 5000 });
		await click(t, f.locator(ACTIVE));
		await waitClosed();
	} else {
		await t.page.keyboard.press('Shift+Tab');
		const reverse = await read();
		await t.check('Shift+Tab from the menu also skips the folded rail', earlyEscape.menu && !reverse.inRail, JSON.stringify(reverse));
	}
	await open();
	const scrim = await shell.evaluate((el) => {
		const box = el.getBoundingClientRect();
		const rail = el.querySelector('.domain-rail').getBoundingClientRect();
		const x = (rail.right + box.right) / 2;
		const y = box.top + box.height / 2;
		return { dx: x - box.left, dy: y - box.top, hit: document.elementFromPoint(x, y) === el };
	});
	if (!await t.check('the mouse point hits the visible backdrop beside the drawer', scrim.hit, JSON.stringify(scrim))) return;
	const box = await shell.boundingBox();
	const x = box.x + scrim.dx, y = box.y + scrim.dy;
	await t.page.mouse.click(x, y);
	const afterScrim = await read();
	await t.check('clicking the backdrop closes the drawer and focuses the menu',
		await closed() && afterScrim.menu, JSON.stringify(afterScrim));
	await t.page.keyboard.press('Escape');
	const afterEscape = await read();
	await t.check('Escape after a backdrop click leaves the drawer closed and focus on the menu',
		await closed() && afterEscape.menu, JSON.stringify(afterEscape));

	if (afterEscape.drawer) {
		await click(t, f.locator(ACTIVE));
		await waitClosed();
	}
	await open();
	await t.page.mouse.move(x, y);
	await t.page.mouse.down();
	const bodyFocused = await f.evaluate(() => document.activeElement === document.body);
	await t.page.keyboard.press('Escape');
	const heldEscape = await read();
	await t.page.mouse.up();
	await t.check('Escape dismisses an open drawer even while a real backdrop press has moved focus to the body',
		bodyFocused && await closed() && heldEscape.menu, JSON.stringify({ bodyFocused, heldEscape }));

	await t.viewport(1024, 900);
	await general.waitFor({ state: 'visible' });
	await click(t, general);
	const wideStart = await read();
	await t.page.keyboard.press('Tab');
	const wideFirst = await read();
	await t.page.keyboard.press('Tab');
	const wideSecond = await read();
	const inline = await shell.evaluate((el) => el.querySelector('.mobile-menu').getClientRects().length === 0
		&& getComputedStyle(el, '::after').content === 'none');
	await t.check('at 1024px real Tab walks from General through the inline chapter rail',
		inline && wideStart.inRail && wideStart.domain === 'general'
			&& wideFirst.inRail && wideFirst.domain === 'ai'
			&& wideSecond.inRail && wideSecond.domain !== wideFirst.domain,
		JSON.stringify({ inline, wideStart, wideFirst, wideSecond }));
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests['FO-241 drawer returns focus and dismisses (' + surface + ')'] = async (t) => {
		if (!t.app.surfaces().includes(surface)) return;
		const looks = t.args.looks ? String(t.args.looks).split(',').map((look) => look.trim()) : LOOKS;
		for (const look of looks) {
			if (!LOOKS.includes(look)) throw new Error('Unknown look: ' + look);
			await t.step(look, () => exercise(t, surface, look));
		}
	};
}
