/* questions.js — feature module.  OWNER: Wave 4 — Decisions agent (item 15a: structurally distinct question/decision options)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * Register through the extension registry rather than editing app.js:
 *
 *   window.PM56_EXT.slot('activityPanelBody', ctx => `<div data-k="mything">...</div>`);
 *   window.PM56_EXT.action('my-thing', (ctx, btn, e) => { ctx.toast('hi'); return true; });
 *
 * See the registry header comment in app.js for the full slot list, the context
 * object, and the data-k rule (anything emitted inside a node that survives the
 * 2s work tick MUST carry a stable data-k or pmPatch will remount it every tick
 * and replay its entrance animation).
 *
 * Wave 1A left this file empty on purpose.  It is registered in build.py already,
 * so simply filling it in is enough — build.py needs no further edit.
 */
