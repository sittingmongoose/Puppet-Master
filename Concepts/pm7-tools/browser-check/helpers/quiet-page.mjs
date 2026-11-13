// A measuring browser makes no sound (the fleet's Windows host is the owner's own PC): every AudioContext the page makes
// stays suspended and media elements do not play. Call before the page loads.
export async function muteSound(page) {
	await page.addInitScript(() => {
		for (const name of ['AudioContext', 'webkitAudioContext']) {
			const Real = window[name]; if (!Real) continue;
			const Muted = function (...a) { const c = new Real(...a); try { c.suspend(); } catch (e) { /* none */ } c.resume = () => Promise.resolve(); return c; };
			Muted.prototype = Real.prototype; window[name] = Muted;
		}
		try { HTMLMediaElement.prototype.play = function () { return Promise.resolve(); }; } catch (e) { /* none */ }
	});
}

// The display's refresh rate as the page sees it: the median gap of 40 animation frames. It asks for frames while it
// runs, so wait for the page to settle again (a second) before measuring anything at rest.
export async function refreshRate(frame) {
	const gaps = await frame.evaluate(() => new Promise((resolve) => {
		const ts = []; const step = (t) => { ts.push(t); if (ts.length < 41) requestAnimationFrame(step); else resolve(ts.slice(1).map((v, i) => v - ts[i])); };
		requestAnimationFrame(step);
	}));
	gaps.sort((a, b) => a - b);
	return 1000 / gaps[gaps.length >> 1];
}

// Parks the pointer where it hovers nothing: the window's right edge, mid height.
export async function parkPointer(page, W, H) { await page.mouse.move(W - 6, Math.round(H / 2)); }
