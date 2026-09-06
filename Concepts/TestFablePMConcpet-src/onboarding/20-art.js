/* PMF Product Onboarding — stage art (v2).
   One continuous scene per theme family (friendly / glass / retro / basic), each
   drawn in its own style but sharing object names, so poses and strings are the
   same data everywhere. A marionette control bar hangs at the top; strings lower
   whatever the user has chosen onto a small stage. Poses are plain data; a tween
   loop moves objects, tilts the bar toward the weight, draws strings on, and casts
   shadows — with easing and duration picked per family. Reduced motion jumps. */
(function () {
  'use strict';
  var PMF = window.PMF_ONBOARDING, U = PMF.util;
  var VW = 480, VH = 640;
  var BAR = { x: 240, y: 112 };
  var STAGE_Y = 556; // platform top
  var OBJECTS = ['mark', 'device', 'server', 'nas', 'folder', 'folder2', 'cloud', 'layers', 'shield', 'spark', 'spark2', 'spark3'];

  // ---- drawings ------------------------------------------------------------------
  var D = {};
  // Friendly: paper-cut layers, warm rounded shapes, two-tone shading
  D.friendly = {
    bg: '<defs><radialGradient id="pmfF-sun" cx=".5" cy=".5"><stop offset="0" stop-color="var(--pmf-glow)"/><stop offset="1" stop-color="var(--pmf-glow)" stop-opacity="0"/></radialGradient><radialGradient id="pmfF-shade" cx=".5" cy=".5"><stop offset="0" stop-color="var(--pmf-shadow)" stop-opacity=".55"/><stop offset="1" stop-color="var(--pmf-shadow)" stop-opacity="0"/></radialGradient>' +
        '<filter id="pmfF-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".55" intercept="-.1"/></feComponentTransfer></filter>' +
        '<filter id="pmfF-drop" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="var(--pmf-shadow)" flood-opacity=".28"/></filter>' +
        '<filter id="pmfF-lift" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="var(--pmf-shadow)" flood-opacity=".22"/></filter></defs>' +
        '<circle class="pmf-amb pmf-amb-sun" cx="380" cy="110" r="170" fill="url(#pmfF-sun)"/>' +
        '<g class="pmf-amb pmf-amb-motes">' + (function () { var m = ''; [[60, 420], [150, 250], [330, 180], [420, 360], [90, 120], [400, 500]].forEach(function (pt, i) { m += '<circle class="pmf-mote" style="--i:' + i + '" cx="' + pt[0] + '" cy="' + pt[1] + '" r="' + (2 + (i % 3)) + '" fill="var(--pmf-obj1)" opacity=".5"/>'; }); return m; })() + '</g>' +
        '<g class="pmf-amb pmf-amb-drift-a" opacity=".55"><ellipse cx="70" cy="190" rx="52" ry="17" fill="var(--pmf-obj1)" opacity=".55"/><ellipse cx="96" cy="184" rx="26" ry="12" fill="var(--pmf-obj1)" opacity=".55"/></g>' +
        '<g class="pmf-amb pmf-amb-drift-b" opacity=".45"><ellipse cx="410" cy="280" rx="44" ry="14" fill="var(--pmf-obj1)" opacity=".5"/></g>' +
        '<g class="pmf-bg-hills"><path filter="url(#pmfF-drop)" d="M-40 585 C 80 520 170 545 260 590 S 430 625 540 585 V 700 H -40Z" fill="var(--pmf-obj2)" opacity=".42"/><path filter="url(#pmfF-drop)" d="M-40 615 C 110 575 230 605 340 620 S 480 655 540 630 V 700 H -40Z" fill="var(--pmf-obj4)" opacity=".34"/></g>' +
        '<rect class="pmf-grain" x="0" y="0" width="480" height="640" filter="url(#pmfF-grain)" opacity=".16" style="mix-blend-mode:multiply"/>',
    platform: '<g><ellipse cx="0" cy="4" rx="156" ry="24" fill="var(--pmf-shadow)" opacity=".28"/><ellipse filter="url(#pmfF-lift)" cx="0" cy="-6" rx="150" ry="22" fill="var(--pmf-obj1)" opacity=".95"/><ellipse cx="0" cy="-9" rx="122" ry="14" fill="var(--pmf-obj2)" opacity=".3"/><ellipse class="pmf-plat-glow" cx="0" cy="-8" rx="110" ry="11" fill="var(--pmf-glow)" opacity="0"/></g>',
    shadow: '<ellipse cx="0" cy="0" rx="60" ry="10" fill="url(#pmfF-shade)"/>',
    bar: '<g><rect x="-86" y="-9" width="172" height="18" rx="9" fill="var(--pmf-shadow)" opacity=".28" transform="translate(0 5)"/><rect x="-86" y="-9" width="172" height="18" rx="9" fill="var(--pmf-obj2)"/><rect x="-9" y="-62" width="18" height="124" rx="9" fill="var(--pmf-obj2)"/><rect x="-86" y="-9" width="172" height="7" rx="3.5" fill="#fff" opacity=".28"/><circle cx="0" cy="0" r="11" fill="var(--pmf-obj1)"/><circle cx="0" cy="0" r="5" fill="var(--pmf-obj4)"/></g>',
    mark: '<g><rect x="-58" y="-52" width="116" height="116" rx="32" fill="var(--pmf-shadow)" opacity=".28"/><rect x="-58" y="-58" width="116" height="116" rx="32" fill="var(--pmf-obj1)"/><rect x="-58" y="-58" width="116" height="58" rx="32" fill="#fff" opacity=".35"/><path d="M-30 30 V-26 h18 a14 14 0 0 1 0 28 h-18" fill="none" stroke="var(--pmf-obj3)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 30 V-26 l14 24 14-24 V30" fill="none" stroke="var(--pmf-obj4)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g>',
    device: '<g><rect x="-76" y="-46" width="152" height="94" rx="14" fill="var(--pmf-shadow)" opacity=".25" transform="translate(0 6)"/><rect x="-76" y="-46" width="152" height="94" rx="14" fill="var(--pmf-obj1)"/><rect x="-66" y="-36" width="132" height="74" rx="9" fill="var(--pmf-obj3)"/><rect x="-66" y="-36" width="132" height="37" rx="9" fill="#fff" opacity=".12"/><rect x="-52" y="-24" width="104" height="52" rx="8" fill="var(--pmf-obj1)" opacity=".92"/><rect x="-42" y="-14" width="56" height="7" rx="3.5" fill="var(--pmf-obj3)" opacity=".7"/><rect x="-42" y="0" width="76" height="7" rx="3.5" fill="var(--pmf-obj3)" opacity=".45"/><rect x="-42" y="14" width="40" height="7" rx="3.5" fill="var(--pmf-obj3)" opacity=".3"/><circle cx="34" cy="-10" r="6" fill="var(--pmf-obj4)"/><path d="M31 -10 l2 2 4 -4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><rect x="-96" y="48" width="192" height="14" rx="7" fill="var(--pmf-obj1)"/><rect x="-96" y="48" width="192" height="6" rx="3" fill="#fff" opacity=".35"/><rect x="-22" y="52" width="44" height="6" rx="3" fill="var(--pmf-obj2)" opacity=".5"/></g>',
    server: '<g><rect x="-52" y="-72" width="104" height="146" rx="16" fill="var(--pmf-shadow)" opacity=".25" transform="translate(0 6)"/><rect x="-52" y="-72" width="104" height="146" rx="16" fill="var(--pmf-obj1)"/><rect x="-52" y="-72" width="52" height="146" rx="16" fill="#fff" opacity=".28"/><rect x="-36" y="-54" width="72" height="18" rx="9" fill="var(--pmf-obj3)" opacity=".85"/><rect x="-36" y="-28" width="72" height="18" rx="9" fill="var(--pmf-obj3)" opacity=".6"/><rect x="-36" y="-2" width="72" height="18" rx="9" fill="var(--pmf-obj3)" opacity=".4"/><circle class="pmf-led" style="--i:0" cx="-22" cy="44" r="7" fill="var(--pmf-obj4)"/><circle class="pmf-led" style="--i:1" cx="0" cy="44" r="7" fill="var(--pmf-obj2)"/><circle class="pmf-led" style="--i:2" cx="22" cy="44" r="7" fill="var(--pmf-obj4)" opacity=".45"/></g>',
    nas: '<g><rect x="-62" y="-46" width="124" height="94" rx="16" fill="var(--pmf-shadow)" opacity=".25" transform="translate(0 6)"/><rect x="-62" y="-46" width="124" height="94" rx="16" fill="var(--pmf-obj1)"/><rect x="-46" y="-30" width="92" height="14" rx="7" fill="var(--pmf-obj3)" opacity=".75"/><rect x="-46" y="-8" width="92" height="14" rx="7" fill="var(--pmf-obj3)" opacity=".55"/><rect x="-46" y="14" width="92" height="14" rx="7" fill="var(--pmf-obj3)" opacity=".35"/><circle cx="44" cy="-36" r="5" fill="var(--pmf-obj4)"/></g>',
    folder: '<g><path d="M-70 -34 h46 l14 14 h72 a12 12 0 0 1 12 12 v54 a12 12 0 0 1 -12 12 h-132 a12 12 0 0 1 -12 -12 v-68 a12 12 0 0 1 12 -12z" fill="var(--pmf-shadow)" opacity=".25" transform="translate(0 6)"/><path d="M-70 -34 h46 l14 14 h72 a12 12 0 0 1 12 12 v54 a12 12 0 0 1 -12 12 h-132 a12 12 0 0 1 -12 -12 v-68 a12 12 0 0 1 12 -12z" fill="var(--pmf-obj2)"/><rect x="-60" y="-18" width="118" height="62" rx="8" fill="#fff" opacity=".9"/><rect x="-46" y="-6" width="60" height="7" rx="3.5" fill="var(--pmf-obj3)" opacity=".55"/><rect x="-46" y="8" width="84" height="7" rx="3.5" fill="var(--pmf-obj3)" opacity=".35"/><path d="M-82 -8 h164 a12 12 0 0 1 12 12 v42 a12 12 0 0 1 -12 12 h-164 a12 12 0 0 1 -12 -12 v-42 a12 12 0 0 1 12 -12z" fill="var(--pmf-obj1)"/><path d="M-82 -8 h164 a12 12 0 0 1 12 12 v6 h-188 v-6 a12 12 0 0 1 12 -12z" fill="#fff" opacity=".4"/><rect x="-54" y="18" width="70" height="7" rx="3.5" fill="var(--pmf-obj4)" opacity=".5"/><rect x="-54" y="32" width="44" height="7" rx="3.5" fill="var(--pmf-obj4)" opacity=".3"/></g>',
    folder2: '<g opacity=".92"><path d="M-54 -28 h36 l12 12 h58 a10 10 0 0 1 10 10 v44 a10 10 0 0 1 -10 10 h-106 a10 10 0 0 1 -10 -10 v-56 a10 10 0 0 1 10 -10z" fill="var(--pmf-obj4)"/><path d="M-66 -6 h132 a10 10 0 0 1 10 10 v34 a10 10 0 0 1 -10 10 h-132 a10 10 0 0 1 -10 -10 v-34 a10 10 0 0 1 10 -10z" fill="var(--pmf-obj1)"/><rect x="-44" y="14" width="56" height="6" rx="3" fill="var(--pmf-obj4)" opacity=".45"/></g>',
    cloud: '<g><path d="M-54 34 h108 a28 28 0 0 0 5 -55.5 A42 42 0 0 0 -46 -26 a30 30 0 0 0 -8 60z" fill="var(--pmf-shadow)" opacity=".22" transform="translate(0 6)"/><path d="M-54 34 h108 a28 28 0 0 0 5 -55.5 A42 42 0 0 0 -46 -26 a30 30 0 0 0 -8 60z" fill="var(--pmf-obj1)"/><path d="M-54 34 h108 a28 28 0 0 0 5 -55.5 A42 42 0 0 0 -46 -26 a30 30 0 0 0 -8 60z" fill="#fff" opacity=".35"/><path d="M-16 12 a16 16 0 0 1 28 -8" fill="none" stroke="var(--pmf-obj3)" stroke-width="4" stroke-linecap="round"/><path d="M16 14 a16 16 0 0 1 -28 8" fill="none" stroke="var(--pmf-obj3)" stroke-width="4" stroke-linecap="round"/><path d="M12 -2 l3 8 -8 -1" fill="none" stroke="var(--pmf-obj3)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M-12 28 l-3 -8 8 1" fill="none" stroke="var(--pmf-obj3)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>',
    layers: '<g><rect x="-48" y="12" width="96" height="22" rx="11" fill="var(--pmf-obj1)" opacity=".55"/><rect x="-48" y="-8" width="96" height="22" rx="11" fill="var(--pmf-obj1)" opacity=".8"/><rect x="-48" y="-28" width="96" height="22" rx="11" fill="var(--pmf-obj1)"/><circle cx="30" cy="-17" r="6" fill="var(--pmf-obj3)"/><path d="M30 -21 v4 l3 2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><rect x="-36" y="-20" width="44" height="6" rx="3" fill="var(--pmf-obj3)" opacity=".5"/></g>',
    shield: '<g><path d="M0 -56 L50 -36 V8 c0 30 -20 50 -50 62 C-30 58 -50 38 -50 8 V-36z" fill="var(--pmf-shadow)" opacity=".22" transform="translate(0 6)"/><path d="M0 -56 L50 -36 V8 c0 30 -20 50 -50 62 C-30 58 -50 38 -50 8 V-36z" fill="var(--pmf-obj1)"/><path d="M0 -56 L50 -36 V8 C50 20 46 32 40 40 L0 -56z" fill="#fff" opacity=".3"/><path d="M-20 6 l14 14 28 -30" fill="none" stroke="var(--pmf-obj4)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>',
    spark: '<g><circle cx="0" cy="0" r="46" fill="var(--pmf-glow)" opacity=".7"/><path d="M0 -46 C5 -16 16 -5 46 0 C16 5 5 16 0 46 C-5 16 -16 5 -46 0 C-16 -5 -5 -16 0 -46z" fill="var(--pmf-obj2)"/><path d="M0 -46 C5 -16 16 -5 46 0 L0 0z" fill="#fff" opacity=".3"/><circle cx="0" cy="0" r="8" fill="var(--pmf-obj1)"/></g>',
    spark2: '<g><path d="M0 -22 C2.5 -7 7 -2.5 22 0 C7 2.5 2.5 7 0 22 C-2.5 7 -7 2.5 -22 0 C-7 -2.5 -2.5 -7 0 -22z" fill="var(--pmf-obj4)"/></g>',
    spark3: '<g><path d="M0 -16 C2 -5 5 -2 16 0 C5 2 2 5 0 16 C-2 5 -5 2 -16 0 C-5 -2 -2 -5 0 -16z" fill="var(--pmf-obj3)"/></g>'
  };
  // Glass: translucent bodies, luminous edges, specular highlights
  var GB = 'fill="var(--pmf-obj1)" fill-opacity=".14" stroke="var(--pmf-obj1)" stroke-opacity=".85" stroke-width="1.4"';
  D.glass = {
    bg: '<defs><filter id="pmfG-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="24"/></filter><filter id="pmfG-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter><radialGradient id="pmfG-orb" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="var(--pmf-obj2)" stop-opacity=".55"/><stop offset="1" stop-color="var(--pmf-obj3)" stop-opacity=".12"/></radialGradient><radialGradient id="pmfG-glow" cx=".5" cy=".5"><stop offset="0" stop-color="var(--pmf-glow)" stop-opacity=".9"/><stop offset="1" stop-color="var(--pmf-glow)" stop-opacity="0"/></radialGradient></defs>' +
        '<linearGradient id="pmfG-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><radialGradient id="pmfG-halo" cx=".5" cy=".5"><stop offset="0" stop-color="var(--pmf-glow)" stop-opacity=".85"/><stop offset="1" stop-color="var(--pmf-glow)" stop-opacity="0"/></radialGradient>' +
        '<g class="pmf-amb pmf-amb-sheen"><path d="M-120 0 L 140 0 L -40 640 L -300 640z" fill="url(#pmfG-sheen)"/></g>' +
        '<radialGradient id="pmfG-rib1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="var(--pmf-obj2)" stop-opacity=".55"/><stop offset=".6" stop-color="var(--pmf-obj2)" stop-opacity=".18"/><stop offset="1" stop-color="var(--pmf-obj2)" stop-opacity="0"/></radialGradient><radialGradient id="pmfG-rib2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="var(--pmf-obj4)" stop-opacity=".45"/><stop offset=".6" stop-color="var(--pmf-obj4)" stop-opacity=".14"/><stop offset="1" stop-color="var(--pmf-obj4)" stop-opacity="0"/></radialGradient>' +
        '<g class="pmf-amb pmf-amb-aurora"><ellipse cx="250" cy="230" rx="330" ry="90" fill="url(#pmfG-rib1)" transform="rotate(-14 250 230)"/><ellipse cx="230" cy="460" rx="300" ry="80" fill="url(#pmfG-rib2)" transform="rotate(10 230 460)"/></g>' +
        '<g class="pmf-amb pmf-amb-orbs"><circle class="pmf-orb pmf-orb-a" cx="64" cy="470" r="48" fill="url(#pmfG-orb)" opacity=".6"/><circle class="pmf-orb pmf-orb-b" cx="432" cy="118" r="30" fill="url(#pmfG-orb)" opacity=".55"/><circle class="pmf-orb pmf-orb-c" cx="404" cy="574" r="18" fill="url(#pmfG-orb)" opacity=".6"/><circle class="pmf-orb pmf-orb-d" cx="110" cy="80" r="9" fill="url(#pmfG-orb)" opacity=".5"/></g>',
    platform: '<g><ellipse cx="0" cy="0" rx="160" ry="26" fill="url(#pmfG-glow)" opacity=".8"/><ellipse cx="0" cy="-4" rx="140" ry="18" fill="none" stroke="var(--pmf-obj1)" stroke-opacity=".5" stroke-width="1.2"/><ellipse cx="0" cy="-4" rx="140" ry="18" fill="var(--pmf-obj1)" fill-opacity=".08"/><g class="pmf-amb pmf-amb-caustic"><ellipse cx="-40" cy="-6" rx="34" ry="6" fill="url(#pmfG-orb)" opacity=".35"/><ellipse cx="48" cy="-2" rx="26" ry="5" fill="url(#pmfG-orb)" opacity=".28"/></g><ellipse class="pmf-plat-glow" cx="0" cy="-4" rx="140" ry="18" fill="var(--pmf-glow)" opacity="0"/></g>',
    shadow: '<ellipse cx="0" cy="0" rx="60" ry="10" fill="url(#pmfG-halo)" opacity=".8"/>',
    bar: '<g><rect x="-88" y="-8" width="176" height="16" rx="8" ' + GB + '/><rect x="-8" y="-62" width="16" height="124" rx="8" ' + GB + '/><rect x="-80" y="-5" width="60" height="3" rx="1.5" fill="#fff" opacity=".7"/><circle cx="0" cy="0" r="11" fill="var(--pmf-obj2)" opacity=".9"/><circle cx="-4" cy="-4" r="3.5" fill="#fff" opacity=".9"/></g>',
    mark: '<g><ellipse cx="0" cy="0" rx="82" ry="65" fill="url(#pmfG-halo)" opacity=".45"/><rect x="-58" y="-58" width="116" height="116" rx="30" ' + GB + '/><path d="M-46 -46 h44" stroke="#fff" stroke-width="2.4" opacity=".7" stroke-linecap="round"/><path d="M-30 30 V-26 h18 a14 14 0 0 1 0 28 h-18" fill="none" stroke="var(--pmf-obj2)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 30 V-26 l14 24 14-24 V30" fill="none" stroke="var(--pmf-obj4)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>',
    device: '<g><ellipse cx="0" cy="0" rx="104" ry="83" fill="url(#pmfG-halo)" opacity=".45"/><rect x="-76" y="-46" width="152" height="94" rx="12" ' + GB + '/><rect x="-66" y="-36" width="132" height="74" rx="7" fill="var(--pmf-obj3)" fill-opacity=".38"/><path d="M-66 -36 L 20 38" stroke="#fff" stroke-width="26" opacity=".08"/><rect x="-46" y="-20" width="60" height="6" rx="3" fill="#fff" opacity=".8"/><rect x="-46" y="-6" width="84" height="6" rx="3" fill="#fff" opacity=".5"/><rect x="-46" y="8" width="44" height="6" rx="3" fill="#fff" opacity=".35"/><circle cx="40" cy="-14" r="6" fill="var(--pmf-obj2)"/><path d="M37 -14 l2 2 4 -4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><rect x="-96" y="48" width="192" height="12" rx="6" ' + GB + '/></g>',
    server: '<g><ellipse cx="0" cy="0" rx="82" ry="65" fill="url(#pmfG-halo)" opacity=".45"/><rect x="-52" y="-72" width="104" height="146" rx="14" ' + GB + '/><path d="M-40 -60 h30" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/><rect x="-36" y="-52" width="72" height="14" rx="7" fill="var(--pmf-obj3)" fill-opacity=".6"/><rect x="-36" y="-28" width="72" height="14" rx="7" fill="var(--pmf-obj3)" fill-opacity=".4"/><rect x="-36" y="-4" width="72" height="14" rx="7" fill="var(--pmf-obj3)" fill-opacity=".25"/><circle class="pmf-led" style="--i:0" cx="-20" cy="42" r="6" fill="var(--pmf-obj2)"/><circle class="pmf-led" style="--i:1" cx="0" cy="42" r="6" fill="var(--pmf-obj4)"/><circle class="pmf-led" style="--i:2" cx="20" cy="42" r="6" fill="#fff" opacity=".5"/></g>',
    nas: '<g><ellipse cx="0" cy="0" rx="86" ry="68" fill="url(#pmfG-halo)" opacity=".45"/><rect x="-62" y="-46" width="124" height="94" rx="14" ' + GB + '/><rect x="-46" y="-30" width="92" height="12" rx="6" fill="var(--pmf-obj3)" fill-opacity=".6"/><rect x="-46" y="-8" width="92" height="12" rx="6" fill="var(--pmf-obj3)" fill-opacity=".4"/><rect x="-46" y="14" width="92" height="12" rx="6" fill="var(--pmf-obj3)" fill-opacity=".25"/><circle cx="44" cy="-36" r="4" fill="var(--pmf-obj2)"/></g>',
    folder: '<g><ellipse cx="0" cy="0" rx="100" ry="80" fill="url(#pmfG-halo)" opacity=".45"/><path d="M-70 -34 h46 l14 14 h72 a12 12 0 0 1 12 12 v54 a12 12 0 0 1 -12 12 h-132 a12 12 0 0 1 -12 -12 v-68 a12 12 0 0 1 12 -12z" fill="var(--pmf-obj2)" fill-opacity=".45" stroke="var(--pmf-obj1)" stroke-opacity=".6" stroke-width="1.2"/><path d="M-82 -8 h164 a12 12 0 0 1 12 12 v42 a12 12 0 0 1 -12 12 h-164 a12 12 0 0 1 -12 -12 v-42 a12 12 0 0 1 12 -12z" ' + GB + '/><path d="M-70 -2 h60" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/><rect x="-54" y="16" width="70" height="6" rx="3" fill="#fff" opacity=".7"/><rect x="-54" y="30" width="44" height="6" rx="3" fill="#fff" opacity=".4"/></g>',
    folder2: '<g opacity=".85"><path d="M-54 -28 h36 l12 12 h58 a10 10 0 0 1 10 10 v44 a10 10 0 0 1 -10 10 h-106 a10 10 0 0 1 -10 -10 v-56 a10 10 0 0 1 10 -10z" fill="var(--pmf-obj4)" fill-opacity=".45"/><path d="M-66 -6 h132 a10 10 0 0 1 10 10 v34 a10 10 0 0 1 -10 10 h-132 a10 10 0 0 1 -10 -10 v-34 a10 10 0 0 1 10 -10z" ' + GB + '/></g>',
    cloud: '<g><ellipse cx="0" cy="0" rx="78" ry="62" fill="url(#pmfG-halo)" opacity=".45"/><path d="M-54 34 h108 a28 28 0 0 0 5 -55.5 A42 42 0 0 0 -46 -26 a30 30 0 0 0 -8 60z" ' + GB + '/><path d="M-30 -16 h34" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/><path d="M-16 12 a16 16 0 0 1 28 -8" fill="none" stroke="var(--pmf-obj2)" stroke-width="3.5" stroke-linecap="round"/><path d="M16 14 a16 16 0 0 1 -28 8" fill="none" stroke="var(--pmf-obj4)" stroke-width="3.5" stroke-linecap="round"/></g>',
    layers: '<g><ellipse cx="0" cy="0" rx="66" ry="52" fill="url(#pmfG-halo)" opacity=".45"/><rect x="-48" y="12" width="96" height="20" rx="10" fill="var(--pmf-obj1)" fill-opacity=".12" stroke="var(--pmf-obj1)" stroke-opacity=".45" stroke-width="1.2"/><rect x="-48" y="-8" width="96" height="20" rx="10" fill="var(--pmf-obj1)" fill-opacity=".16" stroke="var(--pmf-obj1)" stroke-opacity=".65" stroke-width="1.2"/><rect x="-48" y="-28" width="96" height="20" rx="10" ' + GB + '/><circle cx="30" cy="-18" r="5" fill="var(--pmf-obj2)"/></g>',
    shield: '<g><ellipse cx="0" cy="0" rx="72" ry="57" fill="url(#pmfG-halo)" opacity=".45"/><path d="M0 -56 L50 -36 V8 c0 30 -20 50 -50 62 C-30 58 -50 38 -50 8 V-36z" ' + GB + '/><path d="M-20 6 l14 14 28 -30" fill="none" stroke="var(--pmf-obj4)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>',
    spark: '<g><circle cx="0" cy="0" r="52" fill="url(#pmfG-glow)"/><path d="M0 -46 C5 -16 16 -5 46 0 C16 5 5 16 0 46 C-5 16 -16 5 -46 0 C-16 -5 -5 -16 0 -46z" fill="var(--pmf-obj1)" opacity=".95"/><circle cx="-9" cy="-9" r="4" fill="#fff"/></g>',
    spark2: '<g><path d="M0 -22 C2.5 -7 7 -2.5 22 0 C7 2.5 2.5 7 0 22 C-2.5 7 -7 2.5 -22 0 C-7 -2.5 -2.5 -7 0 -22z" fill="var(--pmf-obj4)" opacity=".9"/></g>',
    spark3: '<g><path d="M0 -16 C2 -5 5 -2 16 0 C5 2 2 5 0 16 C-2 5 -5 2 -16 0 C-5 -2 -2 -5 0 -16z" fill="var(--pmf-obj3)" opacity=".9"/></g>'
  };
  // Retro: 8px grid, hard edges, dithered shadows
  var R = 'shape-rendering="crispEdges"';
  D.retro = {
    bg: '<defs><pattern id="pmfR-dither" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="var(--pmf-shadow)"/><rect x="2" y="2" width="2" height="2" fill="var(--pmf-shadow)"/></pattern>' +
        '<filter id="pmfR-bloom" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b"/><feComponentTransfer in="b" result="b2"><feFuncA type="linear" slope=".55"/></feComponentTransfer><feMerge><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '<radialGradient id="pmfR-vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>' +
        '<g class="pmf-bg-grid" opacity=".35">' + (function () { var s = ''; for (var i = 0; i < 12; i++) { var x = 240 + (i - 5.5) * 44; s += '<line x1="240" y1="400" x2="' + (240 + (x - 240) * 4) + '" y2="720" stroke="var(--pmf-string)" stroke-width="1"/>'; } for (var j = 0; j < 8; j++) { var y = 400 + j * j * 6 + j * 8; s += '<line x1="-40" y1="' + y + '" x2="520" y2="' + y + '" stroke="var(--pmf-string)" stroke-width="1"/>'; } return s; })() + '</g>' +
        '<g class="pmf-bg-stars">' + (function () { var s = '', pts = [[40, 60], [120, 140], [400, 70], [440, 210], [70, 260], [360, 300], [200, 40], [300, 220], [160, 330], [420, 380]]; pts.forEach(function (p, i) { s += '<rect class="pmf-star" style="--i:' + i + '" x="' + p[0] + '" y="' + p[1] + '" width="4" height="4" fill="var(--pmf-ink)" opacity=".7" ' + R + '/>'; }); return s; })() + '</g>' +
        '<rect class="pmf-amb pmf-amb-scan" x="-40" y="0" width="560" height="2" fill="var(--pmf-ink)" opacity=".08"/>' +
        '<rect x="-40" y="400" width="560" height="2" fill="var(--pmf-string)" opacity=".7" ' + R + '/>' +
        '<rect x="0" y="0" width="480" height="640" fill="url(#pmfR-vig)"/>',
    platform: '<g ' + R + '><rect x="-152" y="-4" width="304" height="20" fill="url(#pmfR-dither)"/><rect x="-144" y="-16" width="288" height="12" fill="var(--pmf-obj1)"/><rect x="-136" y="-12" width="272" height="4" fill="var(--pmf-obj2)"/><rect class="pmf-plat-glow" x="-144" y="-16" width="288" height="12" fill="var(--pmf-obj2)" opacity="0"/></g>',
    shadow: '<rect x="-56" y="-4" width="112" height="8" fill="url(#pmfR-dither)"/>',
    bar: '<g ' + R + '><rect x="-88" y="-8" width="176" height="16" fill="var(--pmf-obj2)"/><rect x="-8" y="-64" width="16" height="128" fill="var(--pmf-obj2)"/><rect x="-88" y="-8" width="176" height="4" fill="var(--pmf-obj1)" opacity=".6"/><rect x="-8" y="-8" width="16" height="16" fill="var(--pmf-obj1)"/><rect x="-4" y="-4" width="8" height="8" fill="var(--pmf-obj4)"/></g>',
    mark: '<g ' + R + '><rect x="-52" y="-52" width="112" height="112" fill="url(#pmfR-dither)"/><rect x="-58" y="-58" width="116" height="116" fill="var(--pmf-obj1)"/><rect x="-50" y="-50" width="100" height="100" fill="none" stroke="var(--pmf-obj3)" stroke-width="4"/><path d="M-34 32 V-30 h24 v8 h4 v16 h-4 v8 h-16 v30z M-26 -22 v16 h12 v-16z" fill="var(--pmf-obj3)" fill-rule="evenodd"/><path d="M4 32 V-30 h8 l8 16 8-16 h8 V32 h-8 V-10 l-8 16 -8-16 V32z" fill="var(--pmf-obj4)"/></g>',
    device: '<g ' + R + '><rect x="-70" y="-40" width="152" height="94" fill="url(#pmfR-dither)"/><rect x="-76" y="-46" width="152" height="94" fill="var(--pmf-obj1)"/><rect x="-68" y="-38" width="136" height="78" fill="var(--pmf-obj3)"/><rect x="-56" y="-26" width="64" height="8" fill="var(--pmf-obj1)"/><rect x="-56" y="-10" width="88" height="8" fill="var(--pmf-obj1)" opacity=".7"/><rect x="-56" y="6" width="48" height="8" fill="var(--pmf-obj1)" opacity=".5"/><rect x="36" y="-26" width="16" height="8" fill="var(--pmf-obj2)"/><rect x="36" y="-10" width="16" height="8" fill="var(--pmf-obj2)"/><rect x="-96" y="48" width="192" height="14" fill="var(--pmf-obj1)"/><rect x="-24" y="52" width="48" height="6" fill="var(--pmf-obj2)"/></g>',
    server: '<g ' + R + '><rect x="-46" y="-66" width="104" height="146" fill="url(#pmfR-dither)"/><rect x="-52" y="-72" width="104" height="146" fill="var(--pmf-obj1)"/><rect x="-40" y="-56" width="80" height="16" fill="var(--pmf-obj3)"/><rect x="-40" y="-32" width="80" height="16" fill="var(--pmf-obj3)" opacity=".7"/><rect x="-40" y="-8" width="80" height="16" fill="var(--pmf-obj3)" opacity=".45"/><rect x="-28" y="36" width="8" height="8" fill="var(--pmf-obj4)"/><rect x="-8" y="36" width="8" height="8" fill="var(--pmf-obj2)"/><rect x="12" y="36" width="8" height="8" fill="var(--pmf-obj4)" opacity=".5"/></g>',
    nas: '<g ' + R + '><rect x="-56" y="-40" width="124" height="94" fill="url(#pmfR-dither)"/><rect x="-62" y="-46" width="124" height="94" fill="var(--pmf-obj1)"/><rect x="-48" y="-30" width="96" height="12" fill="var(--pmf-obj3)"/><rect x="-48" y="-8" width="96" height="12" fill="var(--pmf-obj3)" opacity=".7"/><rect x="-48" y="14" width="96" height="12" fill="var(--pmf-obj3)" opacity=".4"/><rect x="40" y="-38" width="8" height="4" fill="var(--pmf-obj4)"/></g>',
    folder: '<g ' + R + '><rect x="-76" y="4" width="188" height="66" fill="url(#pmfR-dither)"/><path d="M-72 -32 h48 v8 h8 v8 h84 v64 h-152z" fill="var(--pmf-obj2)"/><rect x="-60" y="-16" width="120" height="56" fill="var(--pmf-obj1)"/><rect x="-48" y="-4" width="64" height="8" fill="var(--pmf-obj3)"/><rect x="-48" y="12" width="88" height="8" fill="var(--pmf-obj3)" opacity=".6"/><rect x="-84" y="-8" width="176" height="64" fill="var(--pmf-obj1)"/><rect x="-84" y="-8" width="176" height="8" fill="var(--pmf-obj2)" opacity=".5"/><rect x="-56" y="16" width="72" height="8" fill="var(--pmf-obj4)"/><rect x="-56" y="32" width="48" height="8" fill="var(--pmf-obj4)" opacity=".6"/></g>',
    folder2: '<g ' + R + ' opacity=".92"><path d="M-56 -24 h40 v8 h8 v8 h64 v52 h-112z" fill="var(--pmf-obj4)"/><rect x="-64" y="-4" width="128" height="52" fill="var(--pmf-obj1)"/><rect x="-44" y="12" width="56" height="8" fill="var(--pmf-obj4)" opacity=".6"/></g>',
    cloud: '<g ' + R + '><path d="M-56 36 h112 v-16 h8 v-16 h-8 v-8 h-16 v-8 h-16 v-8 h-40 v8 h-16 v8 h-8 v8 h-8 v8 h-8 v16 h8z" fill="var(--pmf-obj1)"/><path d="M-16 4 h24 v8 h-8 v8 h-8 v-8 h-8z" fill="var(--pmf-obj3)"/><path d="M-8 20 h-8 v-8 h8z" fill="var(--pmf-obj3)" opacity=".6"/></g>',
    layers: '<g ' + R + '><rect x="-48" y="-32" width="96" height="16" fill="var(--pmf-obj1)"/><rect x="-48" y="-8" width="96" height="16" fill="var(--pmf-obj1)" opacity=".75"/><rect x="-48" y="16" width="96" height="16" fill="var(--pmf-obj1)" opacity=".5"/><rect x="24" y="-28" width="8" height="8" fill="var(--pmf-obj3)"/></g>',
    shield: '<g ' + R + '><path d="M-48 -48 h96 v56 h-8 v16 h-8 v8 h-8 v8 h-8 v8 h-8 v8 h-16 v-8 h-8 v-8 h-8 v-8 h-8 v-8 h-8 v-16 h-8z" fill="var(--pmf-obj1)"/><path d="M-24 0 h8 v8 h8 v8 h8 v-8 h8 v-8 h8 v-8 h8 v-8 h-8 v8 h-8 v8 h-8 v8 h-8 v-8 h-8 v-8 h-8z" fill="var(--pmf-obj4)"/></g>',
    spark: '<g ' + R + '><path d="M-4 -48 h8 v28 h8 v8 h28 v8 h-28 v8 h-8 v28 h-8 v-28 h-8 v-8 h-28 v-8 h28 v-8 h8z" fill="var(--pmf-obj2)"/><rect x="-4" y="-4" width="8" height="8" fill="var(--pmf-obj1)"/><rect x="-24" y="-24" width="4" height="4" fill="var(--pmf-obj2)"/><rect x="20" y="20" width="4" height="4" fill="var(--pmf-obj2)"/></g>',
    spark2: '<g ' + R + '><path d="M-4 -24 h8 v16 h16 v8 h-16 v16 h-8 v-16 h-16 v-8 h16z" fill="var(--pmf-obj4)"/></g>',
    spark3: '<g ' + R + '><path d="M-4 -16 h8 v12 h12 v8 h-12 v12 h-8 v-12 h-12 v-8 h12z" fill="var(--pmf-obj3)"/></g>'
  };
  // Basic: thin line art on grid paper, one accent, filled bodies for legibility
  var L = 'fill="var(--pmf-obj1)" stroke="var(--pmf-ink)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
  var LN = 'fill="none" stroke="var(--pmf-ink)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
  var LA = 'fill="none" stroke="var(--pmf-obj2)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
  D.basic = {
    bg: '<defs><pattern id="pmfB-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="var(--pmf-string)" stroke-width=".6" opacity=".28"/></pattern><pattern id="pmfB-grid2" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="var(--pmf-string)" stroke-width=".9" opacity=".35"/></pattern><pattern id="pmfB-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--pmf-string)" stroke-width="1" opacity=".6"/></pattern><radialGradient id="pmfB-vig" cx=".5" cy=".45"><stop offset=".5" stop-color="var(--pmf-sky1)" stop-opacity="0"/><stop offset="1" stop-color="var(--pmf-ground)" stop-opacity=".9"/></radialGradient></defs><rect x="0" y="0" width="480" height="640" fill="url(#pmfB-grid)"/><rect x="0" y="0" width="480" height="640" fill="url(#pmfB-grid2)"/><rect x="0" y="0" width="480" height="640" fill="url(#pmfB-vig)"/>' +
        '<g class="pmf-bg-dims" opacity=".6" stroke="var(--pmf-string)" stroke-width="1" fill="none"><line x1="48" y1="606" x2="432" y2="606"/><line x1="48" y1="600" x2="48" y2="612"/><line x1="432" y1="600" x2="432" y2="612"/><line x1="240" y1="600" x2="240" y2="612"/><line x1="40" y1="112" x2="40" y2="556"/><line x1="34" y1="112" x2="46" y2="112"/><line x1="34" y1="556" x2="46" y2="556"/><line x1="34" y1="330" x2="46" y2="330"/><line x1="200" y1="112" x2="280" y2="112" stroke-dasharray="2 4"/><line x1="240" y1="70" x2="240" y2="150" stroke-dasharray="2 4"/></g>' +
        '<g class="pmf-bg-titleblock" opacity=".7" stroke="var(--pmf-string)" stroke-width="1" fill="var(--pmf-obj1)"><rect x="344" y="546" width="104" height="40" rx="2"/><line x1="344" y1="560" x2="448" y2="560"/><line x1="344" y1="573" x2="448" y2="573"/><line x1="384" y1="560" x2="384" y2="586"/><rect x="350" y="550" width="18" height="6" fill="var(--pmf-obj2)" stroke="none"/></g>',
    platform: '<g><ellipse cx="0" cy="2" rx="152" ry="21" fill="url(#pmfB-hatch)"/><ellipse cx="0" cy="-4" rx="150" ry="20" ' + L + '/><ellipse cx="0" cy="-4" rx="118" ry="12" ' + LA + ' stroke-dasharray="4 6"/><ellipse class="pmf-plat-glow" cx="0" cy="-4" rx="118" ry="12" fill="var(--pmf-obj2)" opacity="0"/></g>',
    shadow: '<ellipse cx="0" cy="0" rx="56" ry="8" fill="url(#pmfB-hatch)" opacity=".7"/>',
    bar: '<g><rect x="-86" y="-8" width="172" height="16" rx="4" ' + L + '/><rect x="-8" y="-62" width="16" height="124" rx="4" ' + L + '/><circle cx="0" cy="0" r="7" fill="var(--pmf-obj2)"/></g>',
    mark: '<g><rect x="-58" y="-58" width="116" height="116" rx="16" fill="var(--pmf-ground)" stroke="var(--pmf-ink)" stroke-width="1.5"/><path d="M-30 30 V-26 h18 a14 14 0 0 1 0 28 h-18" ' + LA + ' stroke-width="6"/><path d="M6 30 V-26 l14 24 14-24 V30" ' + LN + ' stroke-width="6"/></g>',
    device: '<g><rect x="-76" y="-46" width="152" height="94" rx="7" ' + L + '/><rect x="-66" y="-36" width="132" height="74" rx="3" ' + LN + '/><path d="M-48 -18 h60 M-48 -4 h84 M-48 10 h44" ' + LA + '/><circle cx="42" cy="-18" r="5" ' + LA + '/><path d="M39.5 -18 l2 2 3.5 -3.5" ' + LA + '/><rect x="-96" y="48" width="192" height="12" rx="3" ' + L + '/><path d="M-20 54 h40" ' + LN + '/></g>',
    server: '<g><rect x="-52" y="-72" width="104" height="146" rx="7" ' + L + '/><path d="M-36 -50 h72 M-36 -26 h72 M-36 -2 h72" ' + LN + '/><path d="M-36 -40 h72 M-36 -16 h72" ' + LN + ' opacity=".4"/><circle cx="-20" cy="42" r="5" fill="var(--pmf-obj2)"/><circle cx="0" cy="42" r="5" ' + LN + '/><circle cx="20" cy="42" r="5" ' + LN + '/></g>',
    nas: '<g><rect x="-62" y="-46" width="124" height="94" rx="7" ' + L + '/><path d="M-46 -24 h92 M-46 0 h92 M-46 24 h92" ' + LN + '/><circle cx="44" cy="-36" r="3" fill="var(--pmf-obj2)"/></g>',
    folder: '<g><path d="M-70 -34 h46 l14 14 h72 a8 8 0 0 1 8 8 v58 a8 8 0 0 1 -8 8 h-132 a8 8 0 0 1 -8 -8 v-72 a8 8 0 0 1 8 -8z" ' + L + '/><path d="M-82 -8 h164 a8 8 0 0 1 8 8 v46 a8 8 0 0 1 -8 8 h-164 a8 8 0 0 1 -8 -8 v-46 a8 8 0 0 1 8 -8z" ' + L + '/><path d="M-54 18 h70 M-54 32 h44" ' + LA + '/></g>',
    folder2: '<g><path d="M-54 -28 h36 l12 12 h58 a6 6 0 0 1 6 6 v48 a6 6 0 0 1 -6 6 h-106 a6 6 0 0 1 -6 -6 v-60 a6 6 0 0 1 6 -6z" ' + LN + ' stroke-dasharray="5 5"/><path d="M-66 -6 h132 a6 6 0 0 1 6 6 v38 a6 6 0 0 1 -6 6 h-132 a6 6 0 0 1 -6 -6 v-38 a6 6 0 0 1 6 -6z" ' + LN + ' stroke-dasharray="5 5"/></g>',
    cloud: '<g><path d="M-54 34 h108 a28 28 0 0 0 5 -55.5 A42 42 0 0 0 -46 -26 a30 30 0 0 0 -8 60z" ' + L + '/><path d="M-16 12 a16 16 0 0 1 28 -8 M16 14 a16 16 0 0 1 -28 8" ' + LA + '/><path d="M12 -2 l3 8 -8 -1 M-12 28 l-3 -8 8 1" ' + LA + '/></g>',
    layers: '<g><rect x="-48" y="12" width="96" height="20" rx="4" ' + LN + ' opacity=".5"/><rect x="-48" y="-8" width="96" height="20" rx="4" ' + L + '/><rect x="-48" y="-28" width="96" height="20" rx="4" ' + L + '/><circle cx="30" cy="-18" r="5" ' + LA + '/><path d="M30 -21 v3 l2 2" ' + LA + '/></g>',
    shield: '<g><path d="M0 -56 L50 -36 V8 c0 30 -20 50 -50 62 C-30 58 -50 38 -50 8 V-36z" ' + L + '/><path d="M-20 6 l14 14 28 -30" ' + LA + ' stroke-width="4"/></g>',
    spark: '<g><circle cx="0" cy="0" r="50" ' + LA + ' stroke-dasharray="3 7" opacity=".6"/><path d="M0 -46 C5 -16 16 -5 46 0 C16 5 5 16 0 46 C-5 16 -16 5 -46 0 C-16 -5 -5 -16 0 -46z" ' + L + ' stroke="var(--pmf-obj2)"/><circle cx="0" cy="0" r="5" fill="var(--pmf-obj2)"/></g>',
    spark2: '<g><path d="M0 -22 C2.5 -7 7 -2.5 22 0 C7 2.5 2.5 7 0 22 C-2.5 7 -7 2.5 -22 0 C-7 -2.5 -2.5 -7 0 -22z" ' + LA + '/></g>',
    spark3: '<g><path d="M0 -16 C2 -5 5 -2 16 0 C5 2 2 5 0 16 C-2 5 -5 2 -16 0 C-5 -2 -2 -5 0 -16z" ' + LN + '/></g>'
  };

  // string attachment (top) and shadow (bottom) offsets per object, at scale 1
  var TOP = { mark: -58, device: -46, server: -72, nas: -46, folder: -34, folder2: -28, cloud: -54, layers: -28, shield: -56, spark: -46, spark2: -22, spark3: -16 };
  var BOT = { mark: 58, device: 62, server: 74, nas: 48, folder: 58, folder2: 44, cloud: 34, layers: 32, shield: 70, spark: 46, spark2: 22, spark3: 16 };

  function buildSvg(family) {
    var d = D[family];
    var s = '<svg class="pmf-art" data-family="' + family + '" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">';
    s += '<g class="pmf-art-bg">' + d.bg + '</g>';
    s += '<g data-el="platform" transform="translate(' + (VW / 2) + ' ' + STAGE_Y + ')">' + d.platform + '</g>';
    s += '<g class="pmf-art-shadows" data-layer="shadows">' + OBJECTS.map(function (o) { return '<g data-shadow="' + o + '" style="opacity:0">' + d.shadow + '</g>'; }).join('') + '</g>';
    s += '<g class="pmf-art-links" data-layer="links"></g>';
    s += '<g class="pmf-art-strings" data-layer="strings"></g>';
    s += '<g class="pmf-art-objects"' + (family === 'retro' ? ' filter="url(#pmfR-bloom)"' : '') + '>';
    OBJECTS.forEach(function (o) { s += '<g data-el="' + o + '" style="opacity:0">' + d[o] + '</g>'; });
    s += '<g data-el="bar">' + d.bar + '</g></g>';
    s += '<g data-layer="fx"><rect class="pmf-fx-dim" x="0" y="0" width="480" height="640" fill="var(--pmf-shadow)" style="opacity:0"/><circle class="pmf-fx-flash" cx="0" cy="0" r="0" fill="var(--pmf-glow)" style="opacity:0"/><circle class="pmf-fx-ring" cx="0" cy="0" r="0" fill="none" stroke="var(--pmf-obj2)" stroke-width="2" style="opacity:0"/></g>';
    s += '</svg>';
    return s;
  }

  // ---- poses -----------------------------------------------------------------------
  // pose: { objects: {name:{x,y,s,o}}, hang:[names], links:[[a,b]] }
  function P(x, y, s, o) { return { x: x, y: y, s: s == null ? 1 : s, o: o == null ? 1 : o }; }
  var POSES = {};
  POSES.welcome = function () { return { objects: { mark: P(240, 330, 1.2) }, hang: ['mark'], links: [] }; };
  POSES.where = function (o) {
    if (o.where === 'remote') return { objects: { server: P(250, 322, 1.05), device: P(118, 470, .62) }, hang: ['server'], links: [['device', 'server']] };
    if (o.where === 'server') return { objects: { server: P(250, 322, 1.05, .5), device: P(118, 470, .62) }, hang: ['server'], links: [['device', 'server']] };
    return { objects: { device: P(240, 350, 1.15) }, hang: ['device'], links: [] };
  };
  POSES.connect = function () { return { objects: { server: P(300, 320, 1), device: P(124, 456, .7) }, hang: ['server'], links: [['device', 'server']] }; };
  POSES.ready = function () { return { objects: { server: P(240, 292, .95), folder: P(240, 456, .78), device: P(104, 490, .5) }, hang: ['server'], links: [['server', 'folder'], ['device', 'server']] }; };
  POSES.begin = function (o) { return baseHost(o, { folder: P(240, 318, 1.05) }, ['folder']); };
  POSES.name = POSES.begin;
  POSES.like = function (o) { return baseHost(o, { folder: P(196, 322, .95), folder2: P(336, 290, .72, .95) }, ['folder', 'folder2']); };
  POSES.history = function (o) { var objs = { folder: P(240, 322, .95) }; var links = []; if (o.history) { objs.layers = P(104, 296, .75); links.push(['folder', 'layers']); } if (o.online) { objs.cloud = P(378, 262, .85); links.push(['folder', 'cloud']); } return baseHost(o, objs, ['folder'], links); };
  POSES.existing = function (o) {
    if (o.source === 'online') return baseHost(o, { cloud: P(240, 282, 1), folder: P(240, 430, .72) }, ['cloud'], [['cloud', 'folder']]);
    if (o.source === 'nas') return { objects: { nas: P(240, 296, 1.05), folder: P(240, 440, .72), device: P(104, 490, .5) }, hang: ['nas'], links: [['nas', 'folder'], ['device', 'nas']] };
    return baseHost(o, { folder: P(240, 322, 1.05) }, ['folder']);
  };
  POSES.restore = function (o) { return baseHost(o, { shield: P(240, 292, 1), folder: P(240, 440, .72) }, ['shield'], [['shield', 'folder']]); };
  POSES.review = function (o) { return composition(o, false); };
  POSES.commit = POSES.review;
  POSES.power = function (o) { var c = composition(o, false); c.objects.spark = P(240, 236, 1); c.hang = ['spark']; c.links.push(['spark', 'folder']); c.objects.folder = P(240, 392, .78); if (c.objects.cloud) c.objects.cloud = P(384, 300, .62); if (c.objects.layers) c.objects.layers = P(96, 320, .6); return c; };
  POSES.free = function (o) { var c = POSES.power(o); c.objects.spark2 = P(146, 262, 1); c.objects.spark3 = P(340, 246, 1); c.links.push(['spark2', 'spark'], ['spark3', 'spark']); return c; };
  POSES.done = function (o) { return composition(o, true); };

  function hostObj(o) { return o.where === 'remote' || o.where === 'server' ? 'server' : 'device'; }
  function baseHost(o, objs, hang, links) {
    var h = hostObj(o); var out = { objects: {}, hang: hang || [], links: links || [] };
    Object.keys(objs).forEach(function (k) { out.objects[k] = objs[k]; });
    out.objects[h] = h === 'server' ? P(240, 478, .68) : P(240, 492, .8);
    out.links.push([Object.keys(objs)[0], h]);
    return out;
  }
  function composition(o, withSpark) {
    var objs = {}, links = [], hang = [];
    var h = hostObj(o);
    objs.folder = P(240, 326, .95); hang.push('folder');
    objs[h] = h === 'server' ? P(240, 478, .68) : P(240, 492, .8); links.push(['folder', h]);
    if (o.source === 'nas') { objs.nas = P(104, 470, .58); links.push(['nas', 'folder']); }
    if (o.history || o.has_history) { objs.layers = P(104, 300, .7); links.push(['folder', 'layers']); }
    if (o.online || o.source === 'online') { objs.cloud = P(378, 262, .78); links.push(['folder', 'cloud']); }
    if (o.mode === 'restore') { objs.shield = P(376, 420, .58); links.push(['shield', 'folder']); }
    if (o.inherit) { objs.folder2 = P(372, 376, .55, .9); links.push(['folder2', 'folder']); }
    if (withSpark || o.power_ready) { objs.spark = P(240, 214, .7); links.push(['spark', 'folder']); }
    return { objects: objs, hang: hang, links: links };
  }

  // ---- engine -----------------------------------------------------------------------
  var ART = PMF.art = { host: null, svgs: {}, family: 'friendly', cur: {}, attach: {}, tween: null, idleT0: 0, scene: 'welcome', opts: {}, tilt: 0, tiltV: 0, nudgeAmp: 0 };
  ART.mount = function (host) {
    ART.host = host; host.innerHTML = '';
    ['friendly', 'glass', 'retro', 'basic'].forEach(function (f) { var w = document.createElement('div'); w.innerHTML = buildSvg(f); ART.svgs[f] = w.firstChild; host.appendChild(ART.svgs[f]); });
    OBJECTS.forEach(function (o) { ART.cur[o] = { x: 240, y: BAR.y + 20, s: .6, o: 0 }; ART.attach[o] = 0; });
    ART.family = U.family();
    ART.idleT0 = performance.now();
    ART.hang = []; ART.links = [];
    if (!ART.raf) loop();
  };
  ART.setFamily = function (f) { ART.family = f; };
  ART.nudge = function (amp) { ART.nudgeAmp = Math.max(ART.nudgeAmp, amp || 1); };
  ART.setDim = function (level) { ART.dimTarget = level || 0; };
  // The commit moment: the spark descends from the bar onto the Project, the stage
  // lights up once, and a ring travels outward. Objects settle with a small bounce.
  ART.celebrate = function () {
    var f = ART.cur.folder && ART.cur.folder.o > .05 ? ART.cur.folder : (ART.cur.shield && ART.cur.shield.o > .05 ? ART.cur.shield : null);
    var tx = f ? f.x : 240, ty = f ? f.y : 330, ts = f ? f.s : 1;
    ART.cur.spark = { x: BAR.x, y: BAR.y + 12, s: .35, o: 0 };
    var target = U.clone(ART.cur); target.spark = { x: tx, y: ty + (TOP.folder || -34) * ts - 44, s: .72, o: 1 };
    var fam = ART.family;
    ART.tween = { from: U.clone(ART.cur), to: target, t0: performance.now(), dur: U.durFor(fam, 'move'), ease: U.easeFor(fam, 'move'), easeO: U.easeFor(fam, 'in') };
    if (ART.hang.indexOf('spark') < 0) ART.hang = ART.hang.concat(['spark']);
    ART.attachTarget = ART.attachTarget || {}; ART.attachTarget.spark = 1;
    ART.fx = { t0: performance.now() + (U.reduced() ? 0 : 520 * U.timeScale()), dur: U.reduced() ? 1 : 1500 * U.timeScale(), x: tx, y: target.spark.y };
    ART.dimTarget = 0; ART.nudge(1.2);
    if (U.reduced()) { ART.cur = target; ART.tween = null; }
  };
  // Window entrance: the control bar drops in from above and settles; the scene
  // objects are lowered right after (setScene is called by the shell ~260ms later).
  ART.entrance = function () { ART.barDrop = { t0: performance.now(), dur: U.reduced() ? 1 : 760 * U.timeScale() }; OBJECTS.forEach(function (o) { ART.cur[o] = { x: 240, y: BAR.y + 20, s: .6, o: 0 }; ART.attach[o] = 0; }); ART.hang = []; ART.links = []; ART.attachTarget = {}; ART.tween = null; ART.tilt = 0; ART.tiltV = 0; };
  ART.setScene = function (name, opts) {
    ART.scene = name; ART.opts = opts || {};
    var fn = POSES[name] || POSES.welcome;
    var pose = fn(ART.opts);
    var target = {}, from = U.clone(ART.cur);
    var linkSource = {}; pose.links.forEach(function (pr) { if (!linkSource[pr[0]]) linkSource[pr[0]] = pr[1]; });
    OBJECTS.forEach(function (o) {
      var p = pose.objects[o];
      if (p) {
        target[o] = { x: p.x, y: p.y, s: p.s, o: p.o };
        if (ART.cur[o].o < .05) {
          // entering: hung objects are lowered from the bar; linked objects emerge from what they link to
          var src = pose.hang.indexOf(o) >= 0 ? null : linkSource[o];
          var sp = src && pose.objects[src] ? pose.objects[src] : null;
          from[o] = sp ? { x: sp.x, y: sp.y, s: p.s * .5, o: 0 } : { x: p.x, y: BAR.y + 30, s: p.s * .7, o: 0 };
        }
      } else {
        // leaving: retract toward the bar and fade
        var c = ART.cur[o];
        target[o] = { x: U.lerp(c.x, BAR.x, .35), y: U.lerp(c.y, BAR.y + 40, .5), s: Math.max(.3, c.s * .7), o: 0 };
      }
    });
    ART.hang = pose.hang; ART.links = pose.links;
    ART.attachTarget = {}; pose.hang.forEach(function (o) { ART.attachTarget[o] = 1; });
    var fam = ART.family, dur = U.durFor(fam, 'move');
    ART.tween = { from: from, to: target, t0: performance.now(), dur: dur, ease: U.easeFor(fam, 'move'), easeO: U.easeFor(fam, 'in') };
    ART.nudge(.6);
    if (U.reduced()) { ART.cur = U.clone(target); ART.tween = null; OBJECTS.forEach(function (o) { ART.attach[o] = ART.attachTarget[o] ? 1 : 0; }); }
  };
  function stringPath(fam, ax, ay, bx, by, sway) {
    if (fam === 'retro' || fam === 'basic') return 'M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' L' + bx.toFixed(1) + ' ' + by.toFixed(1);
    var mx = (ax + bx) / 2 + sway, my = (ay + by) / 2;
    return 'M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1);
  }
  function draw(now, dt) {
    var fam = ART.family, svg = ART.svgs[fam]; if (!svg) return;
    var reduced = U.reduced();
    var t = (now - ART.idleT0) / 1000 / U.timeScale();
    // bar tilt: weighted toward hanging mass, spring-damped; sway adds an idle breath
    var hang = ART.hang || [], links = ART.links || [];
    var mass = 0, mx = 0; hang.forEach(function (o) { var c = ART.cur[o]; if (!c) return; var w = c.o * c.s; mass += w; mx += (c.x - BAR.x) * w; });
    var targetTilt = mass > 0 ? U.clamp((mx / mass) / 40, -4, 4) : 0;
    if (fam === 'retro') targetTilt = Math.round(targetTilt);
    var k = 40, damp = 7; var acc = (targetTilt - ART.tilt) * k - ART.tiltV * damp; ART.tiltV += acc * dt; ART.tilt += ART.tiltV * dt;
    ART.nudgeAmp *= Math.pow(.25, dt);
    var swayBar = reduced ? 0 : ART.tilt + Math.sin(t * .9) * (fam === 'retro' ? 0 : .9) + Math.sin(t * 5.2) * ART.nudgeAmp * (fam === 'retro' ? 0 : 1.4);
    var bob = function (i) { return reduced ? 0 : Math.sin(t * 1.1 + i * 1.7) * (fam === 'basic' ? 1.2 : fam === 'retro' ? 0 : 3); };
    var els = svg.__els || (svg.__els = (function () { var m = {}; U.$$('[data-el]', svg).forEach(function (e) { m[e.getAttribute('data-el')] = e; }); U.$$('[data-shadow]', svg).forEach(function (e) { m['shadow:' + e.getAttribute('data-shadow')] = e; }); return m; })());
    var barDy = 0, barO = 1;
    if (ART.barDrop) { var bk = U.clamp((now - ART.barDrop.t0) / ART.barDrop.dur, 0, 1); var be = fam === 'retro' ? U.ease.steps(6)(bk) : U.ease.spring(bk); barDy = -110 * (1 - be); barO = Math.min(1, bk * 2.5); if (bk >= 1) ART.barDrop = null; }
    var bar = els.bar; if (bar) { bar.setAttribute('transform', 'translate(' + BAR.x + ' ' + (BAR.y + barDy).toFixed(1) + ') rotate(' + swayBar.toFixed(2) + ')'); bar.style.opacity = barO.toFixed(3); }
    var barAnchorY = BAR.y + barDy;
    var rad = swayBar * Math.PI / 180;
    var pos = {};
    OBJECTS.forEach(function (o, i) {
      var c = ART.cur[o], e = els[o]; if (!e) return;
      var y = c.y + bob(i) * c.o;
      var x = c.x;
      if (fam === 'retro') { x = Math.round(x / 4) * 4; y = Math.round(y / 4) * 4; }
      pos[o] = { x: x, y: y, top: y + (TOP[o] || -30) * c.s, bot: y + (BOT[o] || 30) * c.s, s: c.s, o: c.o };
      e.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + c.s.toFixed(3) + ')');
      e.style.opacity = c.o.toFixed(3);
      var sh = els['shadow:' + o];
      if (sh) {
        // shadow sits on the stage; it shrinks and fades as the object rises
        var lift = U.clamp((STAGE_Y - 8 - pos[o].bot) / 260, 0, 1);
        var so = c.o * (1 - lift * .75) * (fam === 'glass' ? .9 : .7);
        sh.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + (STAGE_Y - 10) + ') scale(' + (c.s * (1.1 - lift * .55)).toFixed(3) + ' ' + (1 - lift * .4).toFixed(3) + ')');
        sh.style.opacity = so.toFixed(3);
      }
    });
    // strings from bar anchors, drawn on as they attach
    OBJECTS.forEach(function (o) { var tgt = ART.attachTarget && ART.attachTarget[o] ? 1 : 0; var a = ART.attach[o] || 0; var speed = reduced ? 1 : (tgt ? 2.2 : 3.5); ART.attach[o] = tgt ? Math.min(1, a + dt * speed) : Math.max(0, a - dt * speed); });
    var sl = U.$('[data-layer="strings"]', svg), ll = U.$('[data-layer="links"]', svg);
    var anchors = hang.length === 1 ? [0] : hang.length === 2 ? [-58, 58] : [-66, 0, 66];
    var sp = '';
    hang.forEach(function (o, i) {
      var p = pos[o]; if (!p) return; var a = ART.attach[o]; if (a <= 0) return;
      var off = anchors[i] || 0, ax = BAR.x + off * Math.cos(rad), ay = barAnchorY + 9 + off * Math.sin(rad);
      var d = stringPath(fam, ax, ay, p.x, p.top, Math.sin(t * .8 + i) * 4);
      var len = Math.hypot(p.x - ax, p.top - ay) * 1.03 + 2;
      var ease = fam === 'retro' ? Math.floor(a * 8) / 8 : (1 - Math.pow(1 - a, 3));
      sp += '<path class="pmf-string" style="opacity:' + Math.max(p.o, .15 * a).toFixed(2) + '" stroke-dasharray="' + len.toFixed(1) + '" stroke-dashoffset="' + (len * (1 - ease)).toFixed(1) + '" d="' + d + '"/>';
    });
    sl.innerHTML = sp;
    var lp = '';
    links.forEach(function (pair) { var a = pos[pair[0]], b = pos[pair[1]]; if (!a || !b) return; var o = Math.min(a.o, b.o); if (o < .02) return; lp += '<path class="pmf-link" style="opacity:' + (o * .85).toFixed(2) + '" d="' + stringPath(fam, a.x, a.y, b.x, b.y, 0) + '"/>'; });
    ll.innerHTML = lp;
    // fx: dim, flash, ring, platform glow
    var fxl = svg.__fx || (svg.__fx = { dim: U.$('.pmf-fx-dim', svg), flash: U.$('.pmf-fx-flash', svg), ring: U.$('.pmf-fx-ring', svg), plat: U.$('.pmf-plat-glow', svg) });
    ART.dim = ART.dim == null ? 0 : ART.dim + ((ART.dimTarget || 0) - ART.dim) * (1 - Math.exp(-dt * 6));
    if (fxl.dim) fxl.dim.style.opacity = (ART.dim * .5).toFixed(3);
    if (ART.fx) {
      var fk = U.clamp((now - ART.fx.t0) / ART.fx.dur, 0, 1);
      if (fk > 0) {
        var eo = 1 - Math.pow(1 - fk, 3);
        if (fxl.flash) { fxl.flash.setAttribute('cx', ART.fx.x); fxl.flash.setAttribute('cy', ART.fx.y); fxl.flash.setAttribute('r', (30 + 150 * eo).toFixed(1)); fxl.flash.style.opacity = (.5 * (1 - fk) * (fam === 'basic' ? .45 : fam === 'retro' ? .28 : 1)).toFixed(3); }
        if (fxl.ring) { fxl.ring.setAttribute('cx', ART.fx.x); fxl.ring.setAttribute('cy', ART.fx.y); fxl.ring.setAttribute('r', (fam === 'retro' ? Math.round((10 + 150 * eo) / 8) * 8 : (10 + 150 * eo)).toFixed(1)); fxl.ring.style.opacity = (.9 * (1 - fk)).toFixed(3); }
        if (fxl.plat) fxl.plat.style.opacity = (Math.sin(fk * Math.PI) * .9).toFixed(3);
        if (fk >= 1) { ART.fx = null; if (fxl.flash) fxl.flash.style.opacity = '0'; if (fxl.ring) fxl.ring.style.opacity = '0'; if (fxl.plat) fxl.plat.style.opacity = '0'; }
      }
    }
  }
  var last = 0;
  function loop() {
    ART.raf = requestAnimationFrame(loop);
    var now = performance.now(); var dt = (last ? Math.min(.05, (now - last) / 1000) : .016) / U.timeScale(); last = now;
    if (!ART.host || !ART.host.isConnected || ART.host.closest('.pmf[hidden]')) return;
    var tw = ART.tween;
    if (tw) {
      var k = U.clamp((now - tw.t0) / tw.dur, 0, 1), e = tw.ease(k), eo = tw.easeO(k);
      OBJECTS.forEach(function (o) { var a = tw.from[o], b = tw.to[o]; ART.cur[o] = { x: U.lerp(a.x, b.x, e), y: U.lerp(a.y, b.y, e), s: U.lerp(a.s, b.s, e), o: U.lerp(a.o, b.o, b.o > a.o ? Math.min(1, k * 1.8) : Math.min(1, k * 2.2)) }; });
      if (k >= 1) { ART.cur = U.clone(tw.to); ART.tween = null; }
    }
    draw(now, dt);
  }
})();
