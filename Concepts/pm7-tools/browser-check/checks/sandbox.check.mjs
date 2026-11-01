// Share builds must work in T3's file preview: a sandboxed iframe at t.openInSandbox's default flags (allow-scripts
// allow-forms allow-popups allow-downloads; an opaque origin, no storage, no modals). The app boots inside it (ready marker
// and PM_THEME), its shell paints, and nothing errors. It runs in the sandbox whatever --set sandbox says.
export default async function (t) {
	const frame = await t.app.open({ sandbox: true, settleMs: 500 });
	const shell = await frame.evaluate(() => { const r = document.querySelector('.app-shell')?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null; });
	await t.check('app shell laid out in the sandbox', !!shell && shell.width > 100 && shell.height > 100, `shell rect ${JSON.stringify(shell)}`);
	// The sandbox fills the page, so its coordinates are the page's
	if (shell) await t.painted(shell, 'app shell paints inside the sandbox');
	await t.noConsoleErrors('no errors in the sandbox');
}
