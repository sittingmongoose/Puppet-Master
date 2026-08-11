/* Window / Thread module registry + display labels. */
(function () {
  'use strict';

  window.PMChatWindows = window.PMChatWindows || {};
  window.PMChatThreads = window.PMChatThreads || {};

  var windowMeta = {
    w1: { id: 'w1', label: 'Ledger Spine' },
    w2: { id: 'w2', label: 'Overlay Capsule' },
    w3: { id: 'w3', label: 'Strip Console' },
    w4: { id: 'w4', label: 'Pocket Index' },
    w5: { id: 'w5', label: 'Dual Band' },
    w6: { id: 'w6', label: 'Focus Stage' },
    w7: { id: 'w7', label: 'Split Latch' },
    w8: { id: 'w8', label: 'Ribbon Dock' }
  };

  var threadMeta = {
    t1: { id: 't1', label: 'Prose Column' },
    t2: { id: 't2', label: 'Turn Beats' },
    t3: { id: 't3', label: 'Soft Shelves' },
    t4: { id: 't4', label: 'Yield Sheets' },
    t5: { id: 't5', label: 'Live Condenser' },
    t6: { id: 't6', label: 'Margin Index' },
    t7: { id: 't7', label: 'One-Turn Focus' },
    t8: { id: 't8', label: 'Paired Breath' }
  };

  function getWindow(id) {
    var mod = window.PMChatWindows[id];
    if (!mod) return null;
    var meta = windowMeta[id] || { id: id, label: id };
    return {
      id: mod.id || meta.id,
      label: mod.label || meta.label,
      mount: mod.mount,
      meta: meta,
      module: mod
    };
  }

  function getThread(id) {
    var mod = window.PMChatThreads[id];
    if (!mod) return null;
    var meta = threadMeta[id] || { id: id, label: id };
    return {
      id: mod.id || meta.id,
      label: mod.label || meta.label,
      mount: mod.mount,
      meta: meta,
      module: mod
    };
  }

  window.PMChatRegistry = {
    windowMeta: windowMeta,
    threadMeta: threadMeta,
    getWindow: getWindow,
    getThread: getThread
  };
})();
