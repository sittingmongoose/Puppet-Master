// Phase-1b behavior check: recentModels shape, attachSetRoute shape,
// serialize/restore round-trip incl. extraThreads/connection/notifications.
import { startServer, openHost, settle, results } from "./pw.mjs";

const R = results("probe-phase1b-contracts");
const server = await startServer();
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t17&theme=friendly-dark&width=975");
  await settle(page, 500);
  const info = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const out = {};
    // applyModelChange with accountId → object entries
    s.applyModelChange("thread-17", { provider: "Anthropic", model: "Opus 5", accountId: "ant-pro" });
    out.recents = JSON.parse(JSON.stringify(s.state.session.recentModels));
    // same model, different account = distinct route entry
    s.applyModelChange("thread-17", { provider: "Anthropic", model: "Opus 5", accountId: "ant-cli" });
    out.recents2 = JSON.parse(JSON.stringify(s.state.session.recentModels));
    // restore thread route
    s.applyModelChange("thread-17", { provider: "Alibaba", model: "Qwen 3.8", accountId: null });
    // attachSetRoute shape
    s.attachSetRoute("thread-17", "att-x", "pm-transformed", false);
    out.attach = JSON.parse(JSON.stringify(s.state.threads["thread-17"].attachRoutes["att-x"]));
    // serialize round-trip
    s.connSetStatus("offline");
    s.connQueue({ threadKey: "thread-17", text: "queued msg A", attachments: [] });
    s.notifyPush({ title: "T", body: "B", kind: "approval", threadKey: "thread-17" });
    const branchId = s.branchFrom("thread-17", null, { title: "round-trip branch" });
    out.branchId = branchId;
    const snap = s.serializeState();
    const parsed = JSON.parse(snap);
    out.serializedKeys = ["extraThreads", "connection", "notifications"].map(k => k in parsed);
    out.serializedOutbox = parsed.connection.outbox.length;
    out.serializedExtra = (parsed.extraThreads || []).map(t => t.id);
    // restoreState ordering: extra thread state must survive
    const fresh = window.__pmChatRestart();
    out.restoredBranch = !!(fresh.state.threads[branchId] && fresh.state.extraThreads.some(t => t.id === branchId));
    out.restoredOutbox = fresh.state.connection.outbox.length;
    out.restoredInbox = fresh.state.notifications.inbox.length;
    out.restoredStatus = fresh.state.connection.status;
    // cleanup: drop branch + offline state from the live store
    s.state.extraThreads = s.state.extraThreads.filter(t => t.id !== branchId);
    delete s.state.threads[branchId];
    s.connSetStatus("live");
    s.state.connection.outbox = [];
    s.state.notifications.inbox = [];
    s.state.notifications.unread = 0;
    s.persist();
    return out;
  });
  R.check("zero page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  R.check("recentModels object entries", info.recents.length && typeof info.recents[0] === "object" && info.recents[0].model === "Opus 5" && info.recents[0].accountId === "ant-pro", JSON.stringify(info.recents));
  R.check("two accounts = two routes", info.recents2.length === 2 && info.recents2[0].accountId === "ant-cli" && info.recents2[1].accountId === "ant-pro", JSON.stringify(info.recents2));
  R.check("attachSetRoute lineage+job", info.attach && info.attach.route === "pm-transformed" && info.attach.lineage === "att-x" && info.attach.job === null, JSON.stringify(info.attach));
  R.check("serialize includes new globals", info.serializedKeys.every(Boolean), JSON.stringify(info.serializedKeys));
  R.check("serialize outbox+extraThreads", info.serializedOutbox === 1 && info.serializedExtra.includes(info.branchId), info.serializedExtra.join(","));
  R.check("restore keeps extra thread state", info.restoredBranch === true);
  R.check("restore keeps outbox/inbox/status", info.restoredOutbox === 1 && info.restoredInbox === 1 && info.restoredStatus === "offline", info.restoredOutbox + "/" + info.restoredInbox + "/" + info.restoredStatus);
  await browser.close();
} finally {
  server.proc.kill();
}
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
