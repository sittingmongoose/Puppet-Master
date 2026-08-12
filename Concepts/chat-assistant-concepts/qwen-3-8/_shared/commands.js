window.PMChatCommands = (() => {
  const CATALOGED = new Set([
    // canonical (unchanged)
    "cmd.chat.open",
    "cmd.chat.open_thread",
    "cmd.chat.thread.commit_first_message",
    "cmd.chat.thread.discard_empty_draft",
    "cmd.chat.thread.suspend",
    "cmd.chat.thread.restore",
    "cmd.chat.thread.archive",
    "cmd.chat.thread.unarchive",
    "cmd.chat.thread.delete",
    // final cumulative packet cutover (cmd.chat.* vocabulary)
    "cmd.chat.question.answer",
    "cmd.chat.question.skip",
    "cmd.chat.question.submit",
    "cmd.chat.question.cancel",
    "cmd.chat.goal.start",
    "cmd.chat.goal.pause",
    "cmd.chat.goal.resume",
    "cmd.chat.goal.stop",
    "cmd.chat.goal.update",
    "cmd.chat.goal.replan",
    "cmd.chat.context.compact_now",
    "cmd.chat.context.lens_set_mode",
    "cmd.chat.context.lens_toggle",
    "cmd.chat.context.source.add",
    "cmd.chat.context.source.remove",
    "cmd.chat.route.select",
    "cmd.chat.access.set",
    "cmd.chat.bsd.set",
    "cmd.chat.redirect",
    "cmd.chat.thread.request",
    "cmd.chat.thread.await",
    "cmd.chat.thread.branch",
    "cmd.chat.thread.spawn",
    "cmd.chat.thread.rewind",
    "cmd.chat.restore_point.create",
    "cmd.chat.history.pin",
    "cmd.chat.history.unpin",
    "cmd.chat.artifact.open",
    "cmd.chat.artifact.close",
    "cmd.chat.artifact.switch",
    "cmd.chat.artifact.retry",
    "cmd.chat.approval.deny",
    "cmd.chat.approval.allow_once",
    "cmd.chat.approval.allow_session",
    "cmd.chat.approval.details",
    "cmd.chat.warning.resolve",
    "cmd.chat.attachment.resolve",
    "cmd.chat.attachment.route",
    "cmd.chat.crew.start",
    "cmd.chat.cross_project.request",
    "cmd.chat.outbox.queue",
    "cmd.chat.outbox.flush",
    "cmd.browser_program.open"
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
