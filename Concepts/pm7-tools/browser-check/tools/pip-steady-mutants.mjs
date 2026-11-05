// FO-30 negative fixtures: one page per look in which Pip loses its paint for exactly one rendered frame, each by a
// different means, so the guard is shown to reject each look's loss on that look's own appearance.
//   node pip-steady-mutants.mjs --page <build.html> --out <dir>      writes <dir>/mutant-<look>.html and mutants.json
// Each page is the build with one script added before its last </body> (only the last: templates inside the page carry
// the same text). The script waits until Pip has been steady in its look for 600 ms (window open, no look cover,
// awake, the witness of pip-steady installed and not calibrating: the loss must land in a frame the guard judges, not
// in its own calibration hide), then in one requestAnimationFrame applies the mutation and in the next removes it, and
// logs `PIP_MUTANT {look, kind, at, restore, ...}` to the console (performance.now() of both). It fires once.
// Removing the script gives the build back byte for byte (checked).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const MUTATIONS = {
	'basic-light': ['opacity', 'head opacity 0'],
	'basic-dark': ['visibility', 'head visibility hidden'],
	'friendly-light': ['clip', 'head clip-path inset(50%)'],
	'friendly-dark': ['display', 'whole puppet display none'],
	'retro-light': ['filter', 'head filter opacity(0)'],
	'retro-dark': ['mask', 'head mask-image transparent'],
	'glass-light': ['cover', 'a plain box over the head (no change to Pip: only the film can see it)'],
	'glass-dark': ['scale', 'head transform scale(0)'],
	'nier-light': ['ancestor', 'opacity 0 on the puppet group'],
	'nier-dark': ['leaves', 'every painted leaf of the head hidden, the head group untouched']
};

export function mutantScript(look, kind) {
	return `<script data-pip-mutant="${look}">
(function () {
  var LOOK = ${JSON.stringify(look)}, KIND = ${JSON.stringify(kind)}, since = 0, fired = false;
  function stage() { var w = document.getElementById('pm-o55-onboarding'), h = w && w.querySelector('.o55-stage'); return h && window.O55 && O55.pipStage && O55.pipStage.of(h); }
  function steady(st) {
    var O = window.O55, W = window.__pipSteady;
    return !!(st && st.theme === LOOK && O.S && O.S.open && !O.S.vt && !st.sleepZ && W && W.on && !W.cal
      && !document.documentElement.hasAttribute('data-o55-vt') && !document.getElementById('o55np-reboot') && !document.getElementById('o55np-calm')
      && !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy())
      && !(O.nierLook && O.nierLook.busy && O.nierLook.busy()) && !(typeof window.PM_LOOK_COVERED === 'function' && PM_LOOK_COVERED()));
  }
  function apply(st) {
    var h = st.gHead, p = st.gPip, s;
    switch (KIND) {
      case 'opacity': s = h.style.opacity; h.style.opacity = '0'; return function () { h.style.opacity = s; };
      case 'visibility': s = h.style.visibility; h.style.visibility = 'hidden'; return function () { h.style.visibility = s; };
      case 'clip': s = h.style.clipPath; h.style.clipPath = 'inset(50%)'; return function () { h.style.clipPath = s; };
      case 'display': s = p.style.display; p.style.display = 'none'; return function () { p.style.display = s; };
      case 'filter': s = h.style.filter; h.style.filter = 'opacity(0)'; return function () { h.style.filter = s; };
      case 'mask': s = h.style.maskImage; h.style.maskImage = 'linear-gradient(transparent, transparent)'; return function () { h.style.maskImage = s; };
      case 'scale': s = h.style.transform; h.style.transform = 'scale(0)'; return function () { h.style.transform = s; };
      case 'ancestor': s = p.style.opacity; p.style.opacity = '0'; return function () { p.style.opacity = s; };
      case 'leaves': {
        var ls = [].slice.call(h.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,line,use,image,text')), old = ls.map(function (e) { return e.style.visibility; });
        ls.forEach(function (e) { e.style.visibility = 'hidden'; });
        return function () { ls.forEach(function (e, i) { e.style.visibility = old[i]; }); };
      }
      case 'cover': {
        var b = h.getBoundingClientRect(), c = document.createElement('div'), bg = getComputedStyle(st.root).backgroundColor;
        c.style.cssText = 'position:fixed;left:' + (b.left - 2) + 'px;top:' + (b.top - 2) + 'px;width:' + (b.width + 4) + 'px;height:' + (b.height + 4) + 'px;z-index:2147483646;pointer-events:none;background:' + (bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#808080');
        document.documentElement.appendChild(c); return function () { c.remove(); };
      }
    }
  }
  function poll() {
    if (fired) return;
    var st = stage();
    if (!steady(st)) { since = 0; return; }
    if (!since) { since = performance.now(); return; }
    if (performance.now() - since < 600) return;
    fired = true; clearInterval(timer);
    requestAnimationFrame(function () {
      var st2 = stage();
      if (!steady(st2)) { fired = false; since = 0; timer = setInterval(poll, 20); return; }
      var rec = { look: LOOK, kind: KIND, at: performance.now(), theme: st2.theme, screen: O55.S.sess && O55.S.sess.screen, seqBefore: window.__pipSteady.seq };
      var undo = apply(st2);
      requestAnimationFrame(function () { undo(); rec.restore = performance.now(); rec.seqAfter = window.__pipSteady.seq; console.info('PIP_MUTANT ' + JSON.stringify(rec)); });
    });
  }
  var timer = setInterval(poll, 20);
})();
</script>`;
}

export function mutate(html, look) {
	const [kind] = MUTATIONS[look], add = mutantScript(look, kind), at = html.lastIndexOf('</body>');
	if (at < 0) throw new Error('no </body> in the page');
	const out = html.slice(0, at) + add + '\n' + html.slice(at);
	if (out.slice(0, at) + out.slice(at + add.length + 1) !== html) throw new Error('the mutant does not reduce to the build');
	return { out, kind };
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf('--' + k); return i < 0 ? undefined : a[i + 1]; };
	const page = opt('page'), out = opt('out');
	if (!page || !out) { console.error('usage: pip-steady-mutants.mjs --page <build.html> --out <dir> [--looks a,b]'); process.exit(2); }
	const html = fs.readFileSync(page, 'utf8'), sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
	fs.mkdirSync(out, { recursive: true });
	const list = [];
	for (const look of (opt('looks') ? opt('looks').split(',') : Object.keys(MUTATIONS))) {
		const { out: m, kind } = mutate(html, look), file = path.join(out, `mutant-${look}.html`);
		fs.writeFileSync(file, m);
		list.push({ look, kind, what: MUTATIONS[look][1], file: path.basename(file), sha256: sha(m) });
	}
	fs.writeFileSync(path.join(out, 'mutants.json'), JSON.stringify({ build: path.resolve(page), buildSha256: sha(html), mutants: list }, null, 2) + '\n');
	console.log(JSON.stringify(list.map((m) => `${m.look}: ${m.kind}`)));
}
