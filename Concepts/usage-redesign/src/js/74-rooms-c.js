/* Widget definitions for Attention, Prompt cache, Tools, Signals and Source authority (owner: content;
   DESIGN-SPEC section 15). Skeleton: room membership only. */
(function () {
  ['attention', 'cache', 'tools', 'signals', 'authority'].forEach(function (room) {
    PMU_BOARDS.rooms[room].M.forEach(function (e) { PMU.widgets.define(e[0], { room: room }); });
  });
})();
