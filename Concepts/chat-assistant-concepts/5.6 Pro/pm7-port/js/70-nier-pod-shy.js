/* PMConcept7's Pod steps back from the hosted chat's controls (the chat's own podShy, nier-parts.js, hosted).
   The port drops the chat's NieR scripts (HOSTED_SKIP_JS) and PMConcept7's #o55np-pod sits on the seat the chat keeps
   clear for it (css/42-nier-parts.css, styles.d/14-nier-parts.css). At rest nothing interactive is under it, but
   transcript content scrolls past it, and with the transcript scrolled up a card's File change, Details, Resume or
   Review control lay under the Pod at full opacity (neon-verify 18, 1440/1512/1920 windows): the chat's podShy, which
   fades its Pod back while a control is under it, did not run, and its data-shy rule is scoped under .pm56-host, so it
   could not reach PMConcept7's Pod either. Here the same hook runs for PMConcept7's Pod and the same rule lives with
   the Pod's own (styles.d/14-nier-parts.css, #o55np-pod[data-shy]). It counts only the chat's controls (inside a
   .pm56-host), so wherever PMConcept7's Pod sits over PMConcept7's own UI it behaves as before.
   While a button, link, summary or field of the chat lies under the Pod's box (a 5 x 5 grid of probe points; the Pod
   is pointer-events none, so elementsFromPoint never returns it) it fades back at once, and comes forward again only
   after 350 ms with nothing under it, so it does not flicker while a column of buttons scrolls past. Checked on every
   scroll (capture: the transcript's own), resize, render, NieR switch, and when the seat moves (ResizeObserver). */
if (!window.PM56_HOST) return;
const html = document.documentElement;
const SHY_HOST = 'button, a[href], summary, [role="button"], input, select, textarea';
const SHY_AT = [0.06, 0.27, 0.5, 0.73, 0.94];
let timer = 0, clearAt = 0, seat = null;
const on = () => html.getAttribute('data-o55-nier') === 'on' && (' ' + (html.getAttribute('data-o55-nier-parts') || '') + ' ').includes(' pod ');
function shy() {
  timer = 0;
  const pod = document.getElementById('o55np-pod');
  if (!pod) return;
  if (!on()) { if (pod.hasAttribute('data-shy')) pod.removeAttribute('data-shy'); return; }
  const r = pod.getBoundingClientRect();
  let hit = false;
  if (r.width > 0 && r.height > 0) {
    for (let i = 0; i < 25 && !hit; i++) {
      const els = document.elementsFromPoint(r.left + r.width * SHY_AT[i % 5], r.top + r.height * SHY_AT[Math.floor(i / 5)]);
      for (let k = 0; k < els.length && !hit; k++) {
        const c = els[k].closest && els[k].closest(SHY_HOST);
        if (c && c.closest('.pm56-host')) hit = true;
      }
    }
  }
  const now = Date.now();
  if (hit) { clearAt = now + 350; if (!pod.hasAttribute('data-shy')) pod.setAttribute('data-shy', ''); return; }
  if (!pod.hasAttribute('data-shy')) return;
  if (now < clearAt) { timer = window.setTimeout(shy, clearAt - now + 10); return; }
  pod.removeAttribute('data-shy');
}
function soon() { if (!timer) timer = window.setTimeout(shy, 90); }
const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(soon) : null;
function watchSeat() {
  const f = document.querySelector('#pmRoot.pm56-host .chat-stage .chat-float');
  if (f === seat || !ro) return;
  if (seat) ro.unobserve(seat);
  seat = f;
  if (seat) ro.observe(seat);
}
window.addEventListener('scroll', soon, { capture: true, passive: true });
window.addEventListener('resize', soon, { passive: true });
new MutationObserver(soon).observe(html, { attributes: true, attributeFilter: ['data-o55-nier', 'data-o55-nier-parts'] });
const E = window.PM56_EXT;
if (E && typeof E.slot === 'function') E.slot('afterRender', function () { watchSeat(); soon(); });
watchSeat();
soon();
