// Send a real pointer press to a control that may keep moving. Use a fresh center hit-test
// for the press point so there is no Playwright stability wait or separate target box read.
// The caller checks the resulting action. A covered or disabled target receives no press.
export async function press(frame, target) {
	let point = await target.evaluate((el) => {
		if (el.matches(':disabled') || el.closest('[aria-disabled="true"]')) {
			return { ok: false, reason: 'target is disabled' };
		}
		if (!el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) {
			return { ok: false, reason: 'target is hidden' };
		}
		el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
		const box = el.getBoundingClientRect();
		const x = box.left + box.width / 2, y = box.top + box.height / 2;
		const hit = document.elementFromPoint(x, y);
		return {
			ok: box.width > 0 && box.height > 0 && el.contains(hit),
			x, y,
			hit: hit ? { tag: hit.localName, id: hit.id } : null,
		};
	});
	// Carry the same point through the frame chain and refuse a cover in the host page too.
	for (let child = frame; point.ok && child.parentFrame(); child = child.parentFrame()) {
		const iframe = await child.frameElement();
		try {
			point = await iframe.evaluate((el, { x, y }) => {
				const box = el.getBoundingClientRect(), style = getComputedStyle(el);
				const sx = box.width / el.offsetWidth, sy = box.height / el.offsetHeight;
				x = box.left + (el.clientLeft + parseFloat(style.paddingLeft) + x) * sx;
				y = box.top + (el.clientTop + parseFloat(style.paddingTop) + y) * sy;
				const hit = document.elementFromPoint(x, y);
				return { ok: hit === el, x, y, hit: hit ? { tag: hit.localName, id: hit.id } : null };
			}, point);
		} finally {
			await iframe.dispose();
		}
	}
	if (point.ok) await frame.page().mouse.click(point.x, point.y);
	return point;
}
