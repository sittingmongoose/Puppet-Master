window.PMChatCommands = (() => {
  const CATALOGED = new Set([
    "cmd.chat.open",
    "cmd.chat.open_thread",
    "cmd.chat.create_restore_point",
    "cmd.chat.thread.commit_first_message",
    "cmd.chat.thread.discard_empty_draft",
    "cmd.chat.thread.suspend",
    "cmd.chat.thread.restore",
    "cmd.chat.thread.archive",
    "cmd.chat.thread.unarchive",
    "cmd.chat.thread.delete"
  ]);
  const log = [];

  function dispatch(id, payload, opts) {
    opts = opts || {};
    const cataloged = opts.cataloged !== false && CATALOGED.has(id);
    const entry = { id: id, payload: payload || {}, cataloged: cataloged, t: Date.now() };
    log.push(entry);
    if (log.length > 60) log.shift();
    try { window.dispatchEvent(new CustomEvent("pmq-uicommand", { detail: entry })); } catch (e) {}
    return entry;
  }

  function recent(n) { return log.slice(-(n || 10)); }

  return { dispatch: dispatch, recent: recent, CATALOGED: CATALOGED };
})();
