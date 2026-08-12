// Phase-3 gate: 18-thread fixture, thread-17 showcase state, catalog setup
// states, replay-once idempotency via triggers, drawer registry parity.
import { startServer, openHost, settle, results } from "./pw.mjs";

const R = results("probe-phase3-fixture");
const server = await startServer();
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t17&theme=friendly-dark&width=975&harness=1");
  await settle(page, 600);
  const info = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    return {
      threadCount: s.allThreads().length,
      t18: !!s.demoThread("thread-18"),
      t18msgs: s.demoThread("thread-18") ? s.demoThread("thread-18").messages.length : 0,
      t18state: s.demoThread("thread-18") ? s.demoThread("thread-18").threadState : null,
      t17ops: s.operationalOf("thread-17"),
      t17admission: s.admissionOf("thread-17").included.length,
      t17bsdAdvice: !!s.thread("thread-17").bsdAdvice,
      t17subagents: s.subagentGroups("thread-17")[0].agents.map(a => a.route + ":" + a.status),
      t17warnings: s.thread("thread-17").warnings.map(w => w.kind),
      catalog: s.catalog().map(g => ({ provider: g.provider, setupState: g.setupState || null })),
      gptMini: (() => { const g = s.catalog().find(x => x.provider === "OpenAI"); const m = g.models.find(x => x.name === "GPT-5.6 Mini"); return { disabled: m.disabled, reason: m.disabledReason }; })(),
      triggerCount: window.__pmDemoTriggers().length,
      triggers: window.__pmDemoTriggers()
    };
  });
  R.check("zero page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  R.check("18 threads", info.threadCount === 18, "count=" + info.threadCount);
  R.check("thread-18 offline story", info.t18 && info.t18msgs >= 12 && info.t18state === "waiting for reconnect", info.t18msgs + " msgs, " + info.t18state);
  R.check("thread-17 port 3000 seeded", info.t17ops.ports.some(p => p.port === 3000 && p.suggestion === 3001 && p.state === "conflict"));
  R.check("thread-17 worktrees + sessions", info.t17ops.worktrees.length === 2 && info.t17ops.sessions.length === 4);
  R.check("thread-17 admission receipt", info.t17admission === 8);
  R.check("thread-17 BSD advice seeded", info.t17bsdAdvice);
  const routes = new Set(info.t17subagents.map(x => x.split(":")[0]));
  R.check("thread-17 >=3 routed subagents", info.t17subagents.length >= 3 && routes.size >= 3 && info.t17subagents.some(x => x.includes("queued")), info.t17subagents.join("|"));
  R.check("thread-17 all five warning kinds", ["collision", "route", "capacity", "cross-project", "attachment"].every(k => info.t17warnings.includes(k)), info.t17warnings.join(","));
  const setup = Object.fromEntries(info.catalog.map(g => [g.provider, g.setupState]));
  R.check("setup states seeded", setup.OpenAI === "update-available" && setup.Google === "install-required", JSON.stringify(setup));
  R.check("GPT-5.6 Mini disabled+reason", info.gptMini.disabled === true && !!info.gptMini.reason);
  const required = ["bsd.auto_eval", "bsd.advice", "bsd.timeout", "bsd.unavailable", "bsd.set_on", "bsd.set_off", "conn.offline", "conn.queue_send", "conn.reconnect", "conn.snapshot", "conn.server_work", "notify.push", "notify.open_inbox", "attachment.unsupported", "attachment.alternate_consent", "ops.port_conflict", "ops.worktree_waiting", "ops.session_list", "provider.setup_required", "provider.update_available", "capacity.forecast"];
  const missTrig = required.filter(t => !info.triggers.includes(t));
  R.check("all new triggers registered", missTrig.length === 0, "missing: " + missTrig.join(","));
  R.check("registry >= 84 triggers", info.triggerCount >= 84, "count=" + info.triggerCount);

  // Host harness drawer exposes the full registry
  const drawerCount = await page.locator(".pmq-harness button").count();
  R.check("host drawer lists full registry", drawerCount >= info.triggerCount, drawerCount + " buttons vs " + info.triggerCount + " triggers");

  // Replay-once idempotency via triggers on thread-18
  await page.evaluate(() => window.PMChatHost.api.store.switchThread("thread-18"));
  await settle(page, 400);
  // Packet §Phase-3 check: conn.offline → conn.reconnect leaves exactly ONE sent copy
  // of the queued message, identified by its stable client (idempotency) ID.
  const single = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    window.__pmDemoTrigger("conn.offline", {});
    window.__pmDemoTrigger("conn.queue_send", { text: "exactly-once probe" });
    const entryId = s.state.connection.outbox[0].id;
    window.__pmDemoTrigger("conn.reconnect", {});
    const countAfterFirst = s.messages("thread-18").filter(m => m.id.indexOf(entryId) === 0).length;
    window.__pmDemoTrigger("conn.reconnect", {});
    const countAfterSecond = s.messages("thread-18").filter(m => m.id.indexOf(entryId) === 0).length;
    return { entryId, countAfterFirst, countAfterSecond };
  });
  R.check("single queued msg sent exactly once (by entry id)", single.countAfterFirst === 1 && single.countAfterSecond === 1, JSON.stringify(single));
  const replay = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const before = s.messages("thread-18").filter(m => m.queuedReplay).length;
    window.__pmDemoTrigger("conn.offline", {});
    window.__pmDemoTrigger("conn.queue_send", { text: "first queued" });
    window.__pmDemoTrigger("conn.queue_send", { text: "second queued" });
    const queued = s.state.connection.outbox.length;
    window.__pmDemoTrigger("conn.reconnect", {});
    const after1 = s.messages("thread-18").filter(m => m.queuedReplay).length;
    // simulate a duplicate replay attempt: reconnect again with nothing queued
    window.__pmDemoTrigger("conn.reconnect", {});
    const after2 = s.messages("thread-18").filter(m => m.queuedReplay).length;
    const bodies = s.messages("thread-18").filter(m => m.queuedReplay).map(m => m.body);
    return { before, queued, after1, after2, bodies, status: s.state.connection.status, outbox: s.state.connection.outbox.length };
  });
  R.check("offline queue holds 2 entries", replay.queued === 2, "queued=" + replay.queued);
  R.check("reconnect replays exactly once", replay.after1 === replay.before + 2 && replay.after2 === replay.after1, JSON.stringify(replay));
  R.check("outbox drained, back to live", replay.outbox === 0 && replay.status === "live");
  R.check("no duplicate replayed messages", new Set(replay.bodies).size === replay.bodies.length, replay.bodies.join("|"));
  await browser.close();
} finally {
  server.proc.kill();
}
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
