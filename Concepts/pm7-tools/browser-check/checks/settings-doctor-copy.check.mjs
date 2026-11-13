// FO-172 (sol-max-l2a SOL-L2A-4): Settings › System › Readiness & Doctor's two Copy buttons said "copied" whatever the
// clipboard did. In T3's sandboxed preview the page has no clipboard-write permission, writeText rejects, and the old
// code caught that and toasted "Support details copied" / "Checkup summary copied" anyway. Now Copy says copied only
// once the clipboard took the text; where it is blocked, the text opens selected in a box of its own to copy by hand.
//
// Each button is pressed with a real click: Deep checks › Collect support details › Copy support details, and Cached
// summary › Copy checkup summary. Before each press the run's own window puts a marker on the clipboard (its context
// may read and write it); after the press the window reads the clipboard back. Then, on either surface:
// - a "… copied" toast is shown only if the clipboard now holds the copied text (the marker is gone);
// - if the clipboard did not take it, the person gets the honest fallback: a panel says nothing was copied and shows
//   the whole text, in a box that is painted on top, has the key focus and is selected end to end, and no toast says
//   copied;
// - one of the two happens (never neither).
// On the normal page the clipboard must take it and the toast say so (copy still works). The surface the switch picks:
// `--set sandbox=1` (fails on main: toast without the text), `--set sandbox=0` (passes on main and on the fix).
const sleep = (f, ms) => f.waitForTimeout(ms);
const WS = 'doctor';
const body = `[data-continuous-workspace-body="${WS}"]`;

async function openDoctor(t) {
	await t.viewport(1440, 900);
	const sandbox = t.app.sandboxed(false);
	await t.context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
	const f = await t.app.open({ settleMs: 1500, sandbox });
	await f.locator('#tab-settings').click();
	await f.waitForSelector('#pm-settings-root .domain-link[data-domain="system"]', { timeout: 15000 });
	await f.evaluate(() => {
		window.__fo172 = { toasts: [] };
		const N = window.PM_TITLEBAR_NOTIFY;
		if (N && typeof N.push === 'function') {
			const push = N.push.bind(N);
			N.push = (p, ...rest) => { try { __fo172.toasts.push(typeof p === 'string' ? p : [p.title, p.body].filter(Boolean).join(' — ')); } catch (_e) { /* keep the toast */ } return push(p, ...rest); };
		}
	});
	await f.evaluate((ws) => PM51.go('system', ws), WS);
	await f.waitForSelector(`${body}[data-workspace-mounted="true"]`, { timeout: 15000 });
	await sleep(f, 700);
	return { f, sandbox };
}
/* the run's own window (never the app's frame): its clipboard is the browser's */
const clipWrite = (t, v) => (t.window || t.page).evaluate((v) => navigator.clipboard.writeText(v).then(() => true, (e) => String(e && e.message || e)), v);
const clipRead = (t) => (t.window || t.page).evaluate(() => navigator.clipboard.readText().then((v) => ({ ok: true, v }), (e) => ({ ok: false, v: String(e && e.message || e) })));
/* a real click on the first visible match, opening a closed fold around it first */
async function press(t, f, sel) {
	const loc = f.locator(sel).filter({ visible: true }).first();
	if (!(await loc.count())) {
		const any = f.locator(sel).first();
		if (!(await any.count())) return false;
		await any.evaluate((el) => { const d = el.closest('details:not([open])'); if (d) d.querySelector(':scope > summary').click(); });
		await sleep(f, 250);
	}
	const l = f.locator(sel).filter({ visible: true }).first();
	await l.scrollIntoViewIfNeeded();
	await l.click();
	return true;
}
const toasts = (f) => f.evaluate(() => (window.__fo172 ? __fo172.toasts.slice() : []));
/* the copy-by-hand box, if one is open: its text, whether it is painted on top at its centre, focused and selected */
const handBox = (f) => f.evaluate(() => {
	const box = [...document.querySelectorAll('.drawer-wrap:not([data-closing]) textarea[readonly]')].filter((e) => e.getClientRects().length).pop();
	if (!box) return null;
	const r = box.getBoundingClientRect(), top = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 30));
	const panel = box.closest('aside.drawer');
	return { value: box.value, onTop: top === box || box.contains(top), focused: document.activeElement === box, selStart: box.selectionStart, selEnd: box.selectionEnd,
		w: Math.round(r.width), h: Math.round(r.height), title: panel ? (panel.querySelector('.pm51-panel-title') || {}).textContent || '' : '', panelText: panel ? panel.innerText.replace(/\s+/g, ' ') : '' };
});
/* where the app's title bar and Settings' rail sit, and every scrolled box that is not a list: a copy must not move them */
const shellAt = (f) => f.evaluate(() => {
	const y = (sel) => { const e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().top) : null; };
	const scrolled = [document.scrollingElement, ...document.querySelectorAll('body *')].filter((e) => e && e.scrollTop > 0 && getComputedStyle(e).overflowY === 'hidden').map((e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className).split(' ')[0]}=${e.scrollTop}`);
	return { tab: y('#tab-settings'), rail: y('#pm-settings-root .domain-link[data-domain="system"]'), scrolled };
});
async function closeAll(t, f) {
	for (let i = 0; i < 3; i++) {
		if (!(await f.locator('.drawer-wrap:not([data-closing]), .overlay').count())) return;
		await t.page.keyboard.press('Escape'); await sleep(f, 350);
	}
}

/* one Copy: mark the clipboard, press, then judge what the person was told against what the clipboard holds */
async function judge(t, f, sandbox, what, doPress, isText) {
	const marker = `fo172-marker-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const w = await clipWrite(t, marker);
	await t.check(`${what}: the run's window can use the clipboard (marker written)`, w === true, String(w));
	const before = (await toasts(f)).length;
	await doPress();
	const shellBefore = await shellAt(f);
	await sleep(f, 1200);
	const shellAfter = await shellAt(f);
	t.log(JSON.stringify({ shellBefore, shellAfter }));
	const got = (await toasts(f)).slice(before), said = got.filter((x) => new RegExp(`^${what} copied`, 'i').test(x));
	const clip = await clipRead(t), box = await handBox(f);
	const delivered = clip.ok && clip.v !== marker && isText(clip.v);
	t.log(JSON.stringify({ what, surface: sandbox ? 'sandbox' : 'normal', toasts: got, clipboard: clip.ok ? (clip.v === marker ? 'marker (unchanged)' : clip.v.slice(0, 120)) : clip.v, box: box && { ...box, value: box.value.slice(0, 80), panelText: box.panelText.slice(0, 200) } }));
	await t.check(`${what}: the clipboard could be read back`, clip.ok, clip.v);
	await t.check(`${what}: "copied" is said only when the clipboard holds the text`, !said.length || delivered, JSON.stringify({ said, clipboard: clip.v === marker ? 'unchanged' : clip.v.slice(0, 200) }));
	await t.check(`${what}: the person is told one way or the other (copied, or copy by hand)`, said.length > 0 || !!box, JSON.stringify({ toasts: got, box: !!box }));
	if (!delivered) {
		await t.check(`${what}: not copied, so a box offers the text to copy by hand`, !!box, JSON.stringify(got));
		if (box) {
			await t.check(`${what}: the box holds the whole text`, isText(box.value), box.value.slice(0, 300));
			await t.check(`${what}: its panel says nothing was copied and how to copy it`, /Nothing was copied/i.test(box.panelText) && /Ctrl\+C/.test(box.panelText), box.panelText.slice(0, 300));
			await t.check(`${what}: the box is painted on top, has the key focus and is selected end to end`, box.onTop && box.focused && box.selStart === 0 && box.selEnd === box.value.length && box.w > 200 && box.h > 60, JSON.stringify({ onTop: box.onTop, focused: box.focused, sel: [box.selStart, box.selEnd, box.value.length], w: box.w, h: box.h }));
			await t.shot(`fo172-${what.toLowerCase().replace(/\s+/g, '-')}-${sandbox ? 'sandbox' : 'normal'}`, `${what}: blocked clipboard, the text to copy by hand`);
		}
	} else {
		await t.check(`${what}: copied, and the toast says so`, said.length === 1, JSON.stringify(got));
		await t.check(`${what}: no copy-by-hand box when the clipboard took it`, !box, JSON.stringify(box && box.title));
	}
	if (!sandbox) await t.check(`${what}: on the normal page the clipboard takes it (copy still works)`, delivered && said.length === 1, JSON.stringify({ said, clipboard: clip.v === marker ? 'unchanged' : clip.v.slice(0, 80) }));
	await closeAll(t, f);
}

/* the copied text, recognised by its shape: Support details is its six "Label: value" lines, secrets left out; the
   checkup summary is each group's title followed by its findings, "  - title: state (checked when)" */
const SUPPORT = (v) => { const l = String(v || '').split('\n'); return l.length === 6 && /^Computer: ./.test(l[0]) && /^Browser engine: ./.test(l[1]) && /^Screen: \d+ × \d+$/.test(l[2]) && /^Puppet Master: ./.test(l[3]) && /^Server: ./.test(l[4]) && l[5] === 'Left out: Passwords, keys, tokens and file contents'; };
const SUMMARY = (v) => { const l = String(v || '').split('\n'), groups = l.filter((x) => /^\S/.test(x)), items = l.filter((x) => /^  - .+: .+ \(checked .+\)$/.test(x)); return groups.length >= 3 && items.length >= groups.length && groups.length + items.length === l.length; };

export const tests = {
	async 'FO-172: Support details › Copy says copied only when the clipboard took it, else offers the text to copy by hand'(t) {
		const { f, sandbox } = await openDoctor(t);
		await judge(t, f, sandbox, 'Support details', async () => {
			await t.check('Deep checks › Collect support details is on the page', await press(t, f, `${body} button:has-text("Collect support details")`), '');
			const panel = f.locator('.drawer-wrap:not([data-closing]) aside.drawer[aria-label="Support details"]').last();
			await panel.waitFor({ state: 'visible', timeout: 6000 });
			await sleep(f, 600);
			await panel.locator('.pm51-panel-foot .btn.primary', { hasText: 'Copy support details' }).click();
		}, SUPPORT);
	},
	async 'FO-172: Checkup summary › Copy says copied only when the clipboard took it, else offers the text to copy by hand'(t) {
		const { f, sandbox } = await openDoctor(t);
		await judge(t, f, sandbox, 'Checkup summary', async () => {
			await t.check('Cached summary › Copy checkup summary is on the page', await press(t, f, `${body} [data-action="pm51-doctor-copy"]`), '');
		}, SUMMARY);
	}
};
