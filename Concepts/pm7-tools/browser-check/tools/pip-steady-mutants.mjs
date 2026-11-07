// FO-30 negative fixtures: one page per look in which Pip loses its paint for exactly one rendered frame, each by a
// different means, so the guard is shown to reject each look's loss on that look's own appearance.
//   node pip-steady-mutants.mjs --page <build.html> --out <dir>      writes <dir>/mutant-<look>.html and mutants.json
//   --looks friendly-dark:hostscale,...  a look with another kind of loss (EXTRA below), written as mutant-<look>-<kind>.html
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
	'glass-light': ['cover', 'an opaque box in the stage ground colour over the head, in the stage overlay (no change to Pip: only the film can see it)'],
	'glass-dark': ['scale', 'head transform scale(0)'],
	'nier-light': ['ancestor', 'opacity 0 on the puppet group'],
	'nier-dark': ['leaves', 'every painted leaf of the head hidden, the head group untouched']
};

/* Losses beyond each look's own, named look:kind. The stage boundary (T38, astra-review-flash-3 F1): the stage host
   itself collapsed (scale(0), as the review filmed in Friendly Dark) or taken out of the open window, for one frame. The
   witness once read a collapsed or missing host as "no stage on screen" or "window closed" and skipped the frame. */
export const EXTRA = {
	hostscale: 'the stage host transform scale(0) !important (its exact style attribute put back after one frame)',
	hostgone: 'the stage host taken out of the window for one frame, then put back where it was',
	/* T52 (TOOLBATCH2 pre-check finding 7): the stage host turned to its back face for one frame */
	hostflip: 'the stage host transform rotateY(180deg) with backface-visibility hidden, both !important (its exact style attribute put back after one frame)',
	/* T67 (TOOLBATCH4, REVIEW-kit-tb3-opus finding 8): the review's flips. hostflipx, gpflip and gprot hide Pip (losses);
	   hostmirror, gpflat and headkids leave it painted (PAINTED: the structural half must not flag them, the film sees
	   no loss and the gate passes) */
	hostflipx: 'the stage host rotateX(180deg) with backface-visibility hidden',
	hostmirror: 'the stage host scale(-1, 1) with backface-visibility hidden (a 2D mirror: still painted)',
	gpflip: 'the stage host grandparent rotateY(180deg) with backface-visibility hidden on the grandparent',
	gpflat: 'the stage host grandparent rotateY(180deg), no hidden back face anywhere (painted mirrored)',
	gprot: 'the stage host grandparent flipped by the individual rotate property (rotate: y 180deg), backface-visibility hidden on it',
	/* T97 (TOOLBATCH4 recheck b, finding 6, the reviewer's kinds): a y-z shear, m33 +1, that Chrome still turns to its back face (inverse m33 -1/3) */
	hostshear: 'the stage host transform matrix3d(1,0,0,0, 0,1,2,0, 0,2,1,0, 0,0,0,1) with backface-visibility hidden (m33 +1; Chrome hides it)',
	hostshearvis: 'the same shear with the back face visible (paints the same pixels: still painted)',
	headkids: 'every child of the head group turned rotateY(180deg) about its own box with backface-visibility hidden (Chrome does not hide SVG children by back face: painted)'
};
/* the extra kinds that leave Pip painted: a negative of one of them passes only when nothing flags it */
export const PAINTED = new Set(['hostmirror', 'gpflat', 'headkids', 'hostshearvis']);
export const kindsOf = (spec) => { const [look, kind] = String(spec).split(':'); if (!MUTATIONS[look]) throw new Error(`unknown look ${look}`); if (kind && !EXTRA[kind]) throw new Error(`unknown loss ${kind}`); return { look, kind: kind || MUTATIONS[look][0], what: kind ? EXTRA[kind] : MUTATIONS[look][1], name: kind ? `${look}-${kind}` : look }; };

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
    var h = st.gHead, p = st.gPip, s, win = document.getElementById('pm-o55-onboarding'), host = win && win.querySelector('.o55-stage');
    switch (KIND) {
      case 'hostscale': s = host.getAttribute('style'); host.style.setProperty('transform', 'scale(0)', 'important'); return function () { if (s === null) host.removeAttribute('style'); else host.setAttribute('style', s); };
      case 'hostgone': { var par = host.parentNode, nxt = host.nextSibling; host.remove(); return function () { par.insertBefore(host, nxt); }; }
      case 'hostflip': s = host.getAttribute('style'); host.style.setProperty('transform', 'rotateY(180deg)', 'important'); host.style.setProperty('backface-visibility', 'hidden', 'important'); return function () { if (s === null) host.removeAttribute('style'); else host.setAttribute('style', s); };
      case 'hostflipx': s = host.getAttribute('style'); host.style.setProperty('transform', 'rotateX(180deg)', 'important'); host.style.setProperty('backface-visibility', 'hidden', 'important'); return function () { if (s === null) host.removeAttribute('style'); else host.setAttribute('style', s); };
      case 'hostshear': case 'hostshearvis': s = host.getAttribute('style'); host.style.setProperty('transform', 'matrix3d(1,0,0,0, 0,1,2,0, 0,2,1,0, 0,0,0,1)', 'important'); if (KIND === 'hostshear') host.style.setProperty('backface-visibility', 'hidden', 'important'); return function () { if (s === null) host.removeAttribute('style'); else host.setAttribute('style', s); };
      case 'hostmirror': s = host.getAttribute('style'); host.style.setProperty('transform', 'scale(-1, 1)', 'important'); host.style.setProperty('backface-visibility', 'hidden', 'important'); return function () { if (s === null) host.removeAttribute('style'); else host.setAttribute('style', s); };
      case 'gpflip': case 'gpflat': case 'gprot': { var gp = host.parentElement.parentElement; s = gp.getAttribute('style');
        if (KIND === 'gprot') gp.style.setProperty('rotate', 'y 180deg', 'important'); else gp.style.setProperty('transform', 'rotateY(180deg)', 'important');
        if (KIND !== 'gpflat') gp.style.setProperty('backface-visibility', 'hidden', 'important');
        return function () { if (s === null) gp.removeAttribute('style'); else gp.setAttribute('style', s); }; }
      case 'headkids': { var ks = [].slice.call(h.children), old = ks.map(function (e) { return e.getAttribute('style'); });
        ks.forEach(function (e) { e.style.setProperty('transform-box', 'fill-box', 'important'); e.style.setProperty('transform-origin', 'center', 'important'); e.style.setProperty('transform', 'rotateY(180deg)', 'important'); e.style.setProperty('backface-visibility', 'hidden', 'important'); });
        return function () { ks.forEach(function (e, i) { if (old[i] === null) e.removeAttribute('style'); else e.setAttribute('style', old[i]); }); }; }
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
        /* a plain box in the stage's own ground colour, inside the stage's overlay layer (above Pip, where the bubble
           is: the onboarding window is in the top layer, so a box on the page itself would stay under it) */
        /* opaque: Glass's ground is translucent, and a veil Pip shows through is not a lost Pip */
        var b = h.getBoundingClientRect(), o = st.overlay.getBoundingClientRect(), c = document.createElement('div'), bg = getComputedStyle(st.root).backgroundColor || '', m = bg.indexOf('(') > 0 ? bg.slice(bg.indexOf('(') + 1, bg.indexOf(')')).split(',').slice(0, 3) : null;
        c.style.cssText = 'position:absolute;left:' + (b.left - o.left - 2) + 'px;top:' + (b.top - o.top - 2) + 'px;width:' + (b.width + 4) + 'px;height:' + (b.height + 4) + 'px;z-index:50;pointer-events:none;margin:0;opacity:1;background:' + (m && m.length === 3 ? 'rgb(' + m.join(',') + ')' : '#808080');
        st.overlay.appendChild(c); return function () { c.remove(); };
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

export function mutate(html, spec) {
	const { look, kind } = kindsOf(spec), add = mutantScript(look, kind), at = html.lastIndexOf('</body>');
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
	for (const spec of (opt('looks') ? opt('looks').split(',') : Object.keys(MUTATIONS))) {
		const { look, what, name } = kindsOf(spec), { out: m, kind } = mutate(html, spec), file = path.join(out, `mutant-${name}.html`);
		fs.writeFileSync(file, m);
		list.push({ look, kind, what, file: path.basename(file), sha256: sha(m) });
	}
	fs.writeFileSync(path.join(out, 'mutants.json'), JSON.stringify({ build: path.resolve(page), buildSha256: sha(html), mutants: list }, null, 2) + '\n');
	console.log(JSON.stringify(list.map((m) => `${m.look}: ${m.kind}`)));
}
