/* =====================================================================
   U11 — PRISM II · icon extension (U11-only asset)
   Extends the shared PMIcons set without touching icons.js /
   usage-icons.js. Same idiom: stroke-based, viewBox 0 0 24 24,
   currentColor, no emoji (F3-417). Loaded AFTER icons.js.
   ===================================================================== */
(function () {
  'use strict';
  function s(body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }
  var U = window.PMIcons;
  if (!U) return;
  U.compress = s('<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>');
  U.route = s('<circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H12"/>');
  U.undo = s('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>');
  U.lock = s('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>');
  U.alert = s('<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>');
})();
