/* Widget definitions for Free models, Context, Analytics and Ledger (owner: content; DESIGN-SPEC section 15).
   Skeleton: room membership only; the content builder adds model / inspect / config per widget. */
(function () {
  ['free', 'context', 'analytics', 'ledger'].forEach(function (room) {
    PMU_BOARDS.rooms[room].M.forEach(function (e) { PMU.widgets.define(e[0], { room: room }); });
  });
})();
