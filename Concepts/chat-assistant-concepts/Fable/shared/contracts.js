// Fable — mount contracts. A Window concept owns workspace geometry (history slot,
// left artifact slot, chat column, dock/pop-out chrome, yield physics). A Thread
// concept owns the transcript surface (messages, metadata, questionnaires, activity,
// motion). Any thread mounts inside any window: 64 pairings, one semantic store.

export const WINDOW_CONCEPTS = [
  { id: "window-01", title: "Proscenium" },
  { id: "window-02", title: "Bindery" },
  { id: "window-03", title: "Instrument Deck" },
  { id: "window-04", title: "Depth Field" },
  { id: "window-05", title: "Workbench" },
  { id: "window-06", title: "Reading Room" },
  { id: "window-07", title: "Mosaic" },
  { id: "window-08", title: "Periscope" },
];

export const THREAD_CONCEPTS = [
  { id: "thread-c01", title: "Screenplay" },
  { id: "thread-c02", title: "Courier" },
  { id: "thread-c03", title: "Ledgerline" },
  { id: "thread-c04", title: "Dossier" },
  { id: "thread-c05", title: "Longhand" },
  { id: "thread-c06", title: "Counterweight" },
  { id: "thread-c07", title: "Teletype" },
  { id: "thread-c08", title: "Choreograph" },
];

const windowModules = {
  "window-01": () => import("../windows/window-01.js"),
  "window-02": () => import("../windows/window-02.js"),
  "window-03": () => import("../windows/window-03.js"),
  "window-04": () => import("../windows/window-04.js"),
  "window-05": () => import("../windows/window-05.js"),
  "window-06": () => import("../windows/window-06.js"),
  "window-07": () => import("../windows/window-07.js"),
  "window-08": () => import("../windows/window-08.js"),
};

const threadModules = {
  "thread-c01": () => import("../threads/thread-01.js"),
  "thread-c02": () => import("../threads/thread-02.js"),
  "thread-c03": () => import("../threads/thread-03.js"),
  "thread-c04": () => import("../threads/thread-04.js"),
  "thread-c05": () => import("../threads/thread-05.js"),
  "thread-c06": () => import("../threads/thread-06.js"),
  "thread-c07": () => import("../threads/thread-07.js"),
  "thread-c08": () => import("../threads/thread-08.js"),
};

// Window module exports: createWindow(ctx) -> { el, destroy(), chatSlot }
//   ctx = { store, threadFactory, mount ("docked"|"popout"), popIn(), popOut() }
//   The window builds its geometry, then calls ctx.threadFactory(chatSlotEl)
//   to let the selected thread concept own the transcript + composer column.
// Thread module exports: createThread(ctx) -> { el, destroy() }
//   ctx = { store }
// Both register their own CSS (link tag added once per module).

const loadedCss = new Set();
// href is resolved against the Fable folder root (this module's parent directory),
// so concept pages in subfolders resolve shared assets correctly.
export function ensureCss(href) {
  const url = new URL("../" + href, import.meta.url).href;
  if (loadedCss.has(url)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
  loadedCss.add(url);
}

export async function mountPairing(hostEl, windowId, threadId, { store, mount = "docked", onMountChange = null } = {}) {
  hostEl.replaceChildren();
  const [winMod, thrMod] = await Promise.all([
    windowModules[windowId](),
    threadModules[threadId](),
  ]);

  let threadHandle = null;
  const ctx = {
    store,
    mount,
    windowId,
    threadId,
    selectorSlot: null,   // a window may host the selector row; set before threadFactory
    threadFactory(slotEl) {
      threadHandle = thrMod.createThread({ store, el: slotEl, selectorSlot: ctx.selectorSlot });
      return threadHandle;
    },
    requestMountChange(next) {
      if (onMountChange) onMountChange(next);
    },
  };

  const windowHandle = winMod.createWindow(ctx);
  hostEl.appendChild(windowHandle.el);

  return {
    destroy() {
      try { if (threadHandle && threadHandle.destroy) threadHandle.destroy(); } catch (e) { /* teardown */ }
      try { if (windowHandle.destroy) windowHandle.destroy(); } catch (e) { /* teardown */ }
      hostEl.replaceChildren();
    },
    windowHandle,
    threadHandle: () => threadHandle,
  };
}
