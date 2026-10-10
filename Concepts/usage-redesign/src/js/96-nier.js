/* NieR Mode's words at a room change (owner: lane f-nier, 2026-10-09, Jared's item 6a; lanes/f-nier/NIER-ADOPT.md).
   PMConcept7's NieR decodes a page's title when the page changes (kit.d/19-nier-parts.js decodePage, which reaches
   #pmuRoomTitle through usage_layer NIER_NAMES 'titles'), but a room change inside Usage is not a page change: the new
   room's title was written as plain text. Here a room change speaks as the rest of the app does: the room title resolves
   from scrambled glyphs with the app's own decode (PM_NIER_PARTS.decode, the one the page entry uses), one of DL-152's
   page contract parts (headers, cursor, square, icons, ground) that Usage mirrors. Usage never calls O55.nierFx (it is
   the onboarding window's and the tour's) nor the reboot plate (PM_NIER.set already reboots every page, Usage included).
   It waits for the decode part, does nothing while NieR Mode is off, and under Reduce Motion the title is simply there
   (this file checks it, and the decode checks it again). Nothing here runs at idle: one listener on Usage's own
   view-action event, and the work runs once, in a microtask after the click's task has written the new room. */
(function () {
  var app = document.getElementById('pmuApp');
  if (!app) return;
  var queued = false;
  function speak() {
    queued = false;
    if (!PMU.theme || !PMU.theme.has('decode') || (PMU.motion && PMU.motion.reduced()) || document.hidden) return;
    if (!document.body.classList.contains('pmu-page-active')) return;
    var title = document.getElementById('pmuRoomTitle'), parts = window.PM_NIER_PARTS;
    try { if (title && parts && typeof parts.decode === 'function') parts.decode(title); } catch (error) { /* decoration only */ }
  }
  window.addEventListener('pm:usage-view-action', function (event) {
    var d = event && event.detail;
    if (!d || d.action_type !== 'view.usage.room_selected' || queued) return;
    if (!PMU.theme || !PMU.theme.look().nier) return;
    queued = true;
    queueMicrotask(speak);
  });
})();
