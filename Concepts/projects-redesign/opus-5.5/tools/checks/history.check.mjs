// Press a visible History row menu item with the Projects kit's normal click helper.
export const tests = {
	async 'History visible menu item stays in place through press'(t) {
		const f = await t.app.open(t);
		await t.app.page(t, f, 'dashboard');
		await t.app.click(t, f, '#pmw-chat56 .chat-header [data-action="toggle-history"]', { noScroll: true, wait: 700 });
		await t.app.click(t, f, '.history-flyout [data-c-key="npg:more:chat-printer"]', { wait: 300 });
		const menu = f.locator('.pjx-flymenu');
		const item = menu.locator('.pjx-flymenu-item', { hasText: 'Move this chat into a project' });

		// Put the real menu and its handlers in a scroller where the item is visible but can still be centered.
		await menu.evaluate((el) => {
			const scroller = document.createElement('div');
			scroller.style.cssText = 'position:fixed;left:100px;top:100px;width:450px;height:300px;overflow:auto;background:#222;z-index:999999';
			el.parentElement.append(scroller);
			el.style.cssText = 'position:relative;left:0;top:0;margin-top:40px';
			const tail = document.createElement('div');
			tail.style.height = '600px';
			scroller.append(el, tail);
		});
		await t.visible(item, 'History menu item starts wholly in view', { fully: true });

		const observe = await item.evaluateHandle((el) => {
			const position = () => {
				const { x, y } = el.getBoundingClientRect();
				return { x, y };
			};
			const start = position();
			const scrollPositions = [];
			let press;
			const onScroll = () => {
				if (!press && el.isConnected) scrollPositions.push(position());
			};
			const onPress = () => { press = position(); };
			document.addEventListener('scroll', onScroll, true);
			el.addEventListener('pointerdown', onPress, { capture: true, once: true });
			return () => {
				document.removeEventListener('scroll', onScroll, true);
				el.removeEventListener('pointerdown', onPress, true);
				return { start, scrollPositions, press, opened: !!document.querySelector('.pjxc-move') };
			};
		});
		let result;
		try {
			await t.app.click(t, f, item, { wait: 700 });
		} finally {
			result = await observe.evaluate((finish) => finish());
			await observe.dispose();
		}

		const { start, scrollPositions, press, opened } = result;
		const stayedInPlace = press && [...scrollPositions, press].every(({ x, y }) =>
			Math.abs(x - start.x) <= 1 && Math.abs(y - start.y) <= 1);
		await t.check('press opens Move this chat into a project', opened, JSON.stringify(result));
		await t.check('visible History menu item stays in place through the press', !!stayedInPlace, JSON.stringify(result));
	}
};
