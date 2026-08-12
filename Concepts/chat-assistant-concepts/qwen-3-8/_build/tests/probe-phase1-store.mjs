// Phase-1 check: new store domains present and defaulted correctly.
import { startServer, openHost, settle, results } from "./pw.mjs";

const R = results("probe-phase1-store");
const server = await startServer();
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t17&theme=friendly-dark&width=975");
  await settle(page, 500);
  const info = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    return {
      connStatus: s.state.connection.status,
      bsdMode: s.bsdEffective().mode,
      bsdScope: s.bsdEffective().scope,
      account: s.effectiveAccount(),
      outbox: s.state.connection.outbox.length,
      inbox: s.state.notifications.inbox.length,
      admission: !!s.admissionOf("thread-17").included,
      ops: !!s.operationalOf("thread-17"),
      persist: typeof s.persist === "function",
      methods: ["bsdSet", "bsdEvalStart", "bsdResolve", "setAccount", "connQueue", "connReconnect",
        "connServerWork", "connSnapshot", "notifyPush", "notifyRead", "notifyReadAll",
        "admissionRemove", "opsAddPort", "portResolve", "worktreeSetState", "attachResolve",
        "attachStartJob"].every(m => typeof s[m] === "function")
    };
  });
  R.check("zero page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  R.check("connection.status live", info.connStatus === "live", info.connStatus);
  R.check("bsdEffective auto/thread", info.bsdMode === "auto" && info.bsdScope === "thread", info.bsdMode + "/" + info.bsdScope);
  R.check("effectiveAccount default", info.account.accountLabel === "Provider default", JSON.stringify(info.account));
  R.check("connection/notifications state", info.outbox === 0 && info.inbox === 0);
  R.check("admission + operational accessors", info.admission && info.ops);
  R.check("all new methods exported", info.methods);
  await browser.close();
} finally {
  server.proc.kill();
}
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
