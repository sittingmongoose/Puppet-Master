// Phase-4 gate: model picker rail + accounts + setup states, BSD chip states,
// sync strip offline label, inbox boundary.
import { startServer, openHost, settle, shot, results } from "./pw.mjs";

const R = results("probe-phase4-chrome");
const server = await startServer();
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t17&theme=friendly-dark&width=975&dt=thread-17");
  await settle(page, 600);

  // --- Model picker: rail filter, account rows, footer, disabled reason, setup states ---
  await page.click('[data-sel="model"]');
  await settle(page, 500);
  const picker = await page.evaluate(() => {
    const pop = document.querySelector(".pmq-modelpop");
    if (!pop) return null;
    const railBtns = pop.querySelectorAll("[data-rail]");
    // click Alibaba rail
    pop.querySelector('[data-rail="alibaba"]').click();
    return null;
  });
  await settle(page, 400);
  const aliState = await page.evaluate(() => {
    const pop = document.querySelector(".pmq-modelpop");
    const rows = [...pop.querySelectorAll(".pmq-mp-row")].map(r => r.dataset.model);
    const provs = [...pop.querySelectorAll(".pmq-mp-prov, .pmq-mp-account .pmq-mp-acct-main span")].map(x => x.textContent);
    const acctRows = pop.querySelectorAll(".pmq-mp-account").length;
    const railOn = pop.querySelector('[data-rail].pmq-on') ? pop.querySelector('[data-rail].pmq-on').dataset.rail : null;
    return { rows, acctRows, railOn, nonAli: rows.filter(m => !m.startsWith("Qwen")) };
  });
  R.check("rail: Alibaba filter active", aliState.railOn === "alibaba");
  R.check("rail: only Alibaba models shown", aliState.rows.length === 3 && aliState.nonAli.length === 0, JSON.stringify(aliState.rows));
  R.check("rail: account rows rendered", aliState.acctRows === 2, "acctRows=" + aliState.acctRows);

  // reset filter, select ant-pro account
  await page.evaluate(() => {
    document.querySelector(".pmq-modelpop [data-rail='']").click();
  });
  await settle(page, 300);
  await page.evaluate(() => {
    const row = [...document.querySelectorAll(".pmq-mp-account")].find(r => r.textContent.includes("Pro plan"));
    if (row) row.click();
  });
  await settle(page, 300);
  const foot = await page.evaluate(() => {
    const line = document.querySelector(".pmq-mp-acctline");
    return line ? line.textContent : "";
  });
  R.check("account selectable + footer shows it", foot.includes("Pro plan") && foot.includes("Account"), foot);
  const acctEff = await page.evaluate(() => window.PMChatHost.api.store.effectiveAccount("thread-17"));
  R.check("effectiveAccount reflects ant-pro", acctEff.accountId === "ant-pro" && acctEff.connection === "Workspace", JSON.stringify(acctEff));

  // disabled row shows reason; setup state rows present
  const disabled = await page.evaluate(() => {
    const pop = document.querySelector(".pmq-modelpop");
    const row = [...pop.querySelectorAll(".pmq-mp-row")].find(r => r.dataset.model === "GPT-5.6 Mini");
    const setups = [...pop.querySelectorAll(".pmq-mp-setup")].map(s => s.dataset.setup);
    return {
      off: row ? row.classList.contains("pmq-off") : false,
      reason: row ? row.textContent : "",
      setups
    };
  });
  R.check("disabled GPT-5.6 Mini shows reason", disabled.off && disabled.reason.includes("Credential expired"), disabled.reason.slice(0, 80));
  R.check("setup state rows: install + update", disabled.setups.includes("update-available") && disabled.setups.includes("install-required"), JSON.stringify(disabled.setups));
  await page.keyboard.press("Escape");
  await settle(page, 300);
  // restore account to default for later phases
  await page.evaluate(() => window.PMChatHost.api.store.setAccount(null));

  // --- BSD chip: auto eval glow -> silent; manual On treatment ---
  await page.evaluate(() => window.__pmDemoTrigger("bsd.auto_eval", {}));
  await settle(page, 250);
  const glowClass = await page.evaluate(() => document.querySelector('[data-sel="bsd"]').className);
  R.check("BSD chip glows while evaluating", glowClass.includes("pmq-bsd-active"), glowClass);
  await shot(page, "bsd-glow-evaluating");
  await settle(page, 1200);
  const afterResolve = await page.evaluate(() => ({
    cls: document.querySelector('[data-sel="bsd"]').className,
    state: window.PMChatHost.api.store.bsdEffective("thread-17").state
  }));
  R.check("BSD glow terminates on resolve", !afterResolve.cls.includes("pmq-bsd-active") && afterResolve.state === "silent", afterResolve.cls + " " + afterResolve.state);

  await page.evaluate(() => window.__pmDemoTrigger("bsd.set_on", {}));
  await settle(page, 300);
  const onClass = await page.evaluate(() => document.querySelector('[data-sel="bsd"]').className);
  R.check("manual On has distinct treatment", onClass.includes("pmq-bsd-on") && !onClass.includes("pmq-bsd-active"), onClass);
  await page.evaluate(() => window.__pmDemoTrigger("bsd.set_off", {}));
  await settle(page, 200);
  const offClass = await page.evaluate(() => document.querySelector('[data-sel="bsd"]').className);
  R.check("Off state readable", offClass.includes("pmq-bsd-off"));
  await page.evaluate(() => window.__pmDemoTrigger("bsd.set_on", {}));
  await page.evaluate(() => window.__pmDemoTrigger("bsd.set_off", {}));
  await page.evaluate(() => { const s = window.PMChatHost.api.store; s.bsdSet("auto", "thread"); });

  // BSD popup opens with modes + scopes
  await page.click('[data-sel="bsd"]');
  await settle(page, 400);
  const bsdMenu = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".pmq-menu-item, .pmq-pop-item, [role=menuitem]")].map(x => x.textContent.trim());
    const open = !!document.querySelector('[role="dialog"], .pmq-popup');
    return { open, hasAuto: document.body.textContent.includes("Auto — system default"), hasTurn: document.body.textContent.includes("This turn") };
  });
  R.check("BSD popup offers modes + scopes", bsdMenu.hasAuto && bsdMenu.hasTurn, JSON.stringify(bsdMenu));
  await page.keyboard.press("Escape");
  await settle(page, 300);

  // --- Sync strip: offline label with queue count ---
  const stripBefore = await page.evaluate(() => document.querySelector(".pmq-syncstrip").textContent.trim());
  R.check("sync strip shows Live", stripBefore.includes("Live"), stripBefore);
  await page.evaluate(() => window.__pmDemoTrigger("conn.offline", {}));
  await settle(page, 400);
  const stripOff = await page.evaluate(() => {
    const el = document.querySelector(".pmq-syncstrip");
    return { text: el.textContent.trim(), status: el.dataset.status };
  });
  R.check("sync strip Offline · 0 queued", stripOff.text.includes("Offline · 0 queued") && stripOff.status === "offline", stripOff.text);
  await shot(page, "syncstrip-offline");
  await page.evaluate(() => window.__pmDemoTrigger("conn.reconnect", {}));
  await settle(page, 400);
  const stripBack = await page.evaluate(() => document.querySelector(".pmq-syncstrip").textContent.trim());
  R.check("sync strip returns to Live", stripBack.includes("Live"), stripBack);

  // --- Inbox boundary ---
  await page.evaluate(() => window.__pmDemoTrigger("notify.push", { title: "Approval needed", body: "Two commands wait.", kind: "approval" }));
  await settle(page, 400);
  const inboxBadge = await page.evaluate(() => {
    const c = document.querySelector(".pmq-inbox-count");
    return { visible: c && !c.hidden, text: c ? c.textContent : "" };
  });
  R.check("inbox badge shows unread", inboxBadge.visible && inboxBadge.text === "1", JSON.stringify(inboxBadge));
  await page.click(".pmq-inbox");
  await settle(page, 400);
  const inboxPop = await page.evaluate(() => ({
    hasRows: document.querySelectorAll(".pmq-inbox-row").length,
    hasTitle: document.body.textContent.includes("Approval needed"),
    hasOpenThread: !!document.querySelector("[data-ntfopen]")
  }));
  R.check("inbox popup lists notification", inboxPop.hasRows === 1 && inboxPop.hasTitle && inboxPop.hasOpenThread, JSON.stringify(inboxPop));
  await shot(page, "inbox-open");
  await page.evaluate(() => window.PMChatHost.api.store.notifyReadAll());
  await settle(page, 300);
  const badgeAfter = await page.evaluate(() => document.querySelector(".pmq-inbox-count").hidden);
  R.check("mark-all-read clears badge", badgeAfter === true);

  R.check("zero page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
} finally {
  server.proc.kill();
}
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
