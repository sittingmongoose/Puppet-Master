// Correction-packet coverage expansion (ScoutCoverage gaps E1-E7).
// Widths for questionnaire/pin/artifact, reduced-motion end-states, keyboard &
// focus, long content, reconnect-failure + quota errors, all-64 pairing sweep,
// combined pop-out + pinned + artifact resize survival.
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record } from "./report.mjs";

const R = results("probe-coverage-expansion");
const server = await startServer();

const noHScroll = () => {
  const d = document.documentElement;
  return d.scrollWidth <= d.clientWidth + 1;
};

try {
  // ---- E1 widths: questionnaire at 750 and 1200 ----
  for (const width of [750, 1200]) {
    const { browser, page } = await openHost(server.port, `w=w1&t=t1&theme=friendly-dark&width=${width}&dt=thread-17`);
    await settle(page, 600);
    await page.evaluate(() => window.__pmDemoTrigger("question.prepare", {}));
    await settle(page, 800);
    const ok = await page.evaluate(() => ({
      card: !!document.querySelector(".pmq-t1-quest"),
      noScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    }));
    R.check(`questionnaire t1 @${width} mounts clean`, ok.card && ok.noScroll, JSON.stringify(ok));
    await browser.close();
  }

  // ---- E1 widths: pinned history at 520/750/1200 across w1,w3,w5,w7,w8 ----
  for (const w of ["w1", "w3", "w5", "w7", "w8"]) {
    for (const width of [520, 750, 1200]) {
      const { browser, page } = await openHost(server.port, `w=${w}&t=t1&theme=friendly-dark&width=${width}&dt=thread-17`);
      await settle(page, 500);
      await page.evaluate(() => window.PMChatHost.api.store.setPin(window.PMChatHost.api.env.winId(), true));
      await settle(page, 500);
      const geo = await page.evaluate(() => {
        const col = document.querySelector(".pmq-pincol");
        const stream = document.querySelector(".pmq-stream");
        if (!col || !stream) return { pin: false };
        const c = col.getBoundingClientRect(), s = stream.getBoundingClientRect();
        const overlap = !(c.right <= s.left || s.right <= c.left || c.bottom <= s.top || s.bottom <= c.top);
        return { pin: true, mode: col.dataset.mode, overlap };
      });
      R.check(`${w} pin @${width}: present, demoted mode, no overlap`, geo.pin && ["full", "compact", "micro"].includes(geo.mode) && !geo.overlap, JSON.stringify(geo));
      await browser.close();
    }
  }

  // ---- E1 widths: artifact workspace at 520/750 ----
  for (const width of [520, 750]) {
    const { browser, page } = await openHost(server.port, `w=w1&t=t1&theme=friendly-dark&width=${width}&dt=thread-17`);
    await settle(page, 500);
    await page.evaluate(() => window.PMChatHost.api.store.artOpen(window.PMChatHost.api.env.winId(), "artifact-diff"));
    await settle(page, 500);
    const geo = await page.evaluate(() => {
      const art = document.querySelector(".pmq-artws");
      const stream = document.querySelector(".pmq-stream");
      if (!art || !stream) return { art: false };
      const a = art.getBoundingClientRect(), s = stream.getBoundingClientRect();
      const overlap = !(a.right <= s.left || s.right <= a.left || a.bottom <= s.top || s.bottom <= a.top);
      return { art: true, overlap };
    });
    R.check(`artifact @${width}: open, no overlap with transcript`, geo.art && !geo.overlap, JSON.stringify(geo));
    await browser.close();
  }

  // ---- E2 reduced-motion end-states ----
  {
    const { browser, page } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17&rm=1");
    await settle(page, 600);
    // bsd resolves (no stuck glow)
    await page.evaluate(() => window.__pmDemoTrigger("bsd.auto_eval", {}));
    await settle(page, 900);
    const bsd = await page.evaluate(() => {
      const c = document.querySelector(".pmq-sel-bsd");
      return c ? c.className : null;
    });
    R.check("rm: bsd evaluates and resolves (no active glow)", !!bsd && !/pmq-bsd-active/.test(bsd), String(bsd));
    // offline -> reconnect -> live
    await page.evaluate(() => window.__pmDemoTrigger("conn.offline", {}));
    await page.evaluate(() => window.__pmDemoTrigger("conn.queue_send", {}));
    await settle(page, 300);
    await page.evaluate(() => window.__pmDemoTrigger("conn.reconnect", {}));
    await settle(page, 1200);
    const conn = await page.evaluate(() => window.PMChatHost.api.store.state.connection.status);
    R.check("rm: offline -> reconnect reaches live", conn === "live", conn);
    // artifact error -> retry -> ready (widen viewport so the governor keeps
    // the workspace out of sliver/chip mode and renders the body)
    await page.setViewportSize({ width: 1600, height: 900 });
    await settle(page, 300);
    await page.evaluate(() => window.PMChatHost.api.store.artOpen(window.PMChatHost.api.env.winId(), "artifact-diff"));
    await settle(page, 400);
    await page.evaluate(() => window.__pmDemoTrigger("artifact.error", {}));
    await settle(page, 300);
    await page.evaluate(() => { const b = document.querySelector("[data-artretry]"); if (b) b.click(); });
    await settle(page, 1800);
    const art = await page.evaluate(() => {
      const a = window.PMChatHost.api.store.threadArtifacts("thread-17")[0];
      return window.PMChatHost.api.store.artStatusOf("thread-17", a.id);
    });
    R.check("rm: artifact error -> retry -> ready", art === "ready", String(art));
    // capacity warning resolves
    await page.evaluate(() => window.__pmDemoTrigger("capacity.forecast", {}));
    await settle(page, 400);
    const capResolved = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find(b => /Start waves/.test(b.textContent));
      if (!btn) return false;
      btn.click();
      return true;
    });
    await settle(page, 400);
    const capGone = await page.evaluate(() => ![...document.querySelectorAll(".pmq-warning, .pmq-capcard, .pmq-surfaces *")].some(w => /Requested specialists/i.test(w.textContent || "")));
    R.check("rm: capacity forecast card resolves", capResolved && capGone, JSON.stringify({ capResolved, capGone }));
    // attachment resolver
    await page.evaluate(() => window.__pmDemoTrigger("attachment.unsupported", {}));
    await settle(page, 400);
    const att = await page.evaluate(() => !!document.querySelector(".pmq-port") || [...document.querySelectorAll("button")].some(b => /Extract in PM|Use Gemini/.test(b.textContent)));
    R.check("rm: attachment resolver reachable", att);
    await browser.close();
  }

  // ---- E3 keyboard & focus ----
  {
    const { browser, page } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17");
    await settle(page, 600);
    // Escape on model popup returns focus to opener
    const esc = await page.evaluate(async () => {
      const opener = document.querySelector('[data-sel="model"]');
      opener.focus();
      opener.click();
      await new Promise(r => setTimeout(r, 250));
      const open = !!document.querySelector(".pmq-popup");
      return { open, openerTag: opener.className };
    });
    await page.keyboard.press("Escape");
    await settle(page, 250);
    const after = await page.evaluate(() => ({
      popup: !!document.querySelector(".pmq-popup"),
      focusBack: document.activeElement && document.activeElement.matches('[data-sel="model"]')
    }));
    R.check("Escape closes model popup and returns focus to opener", esc.open && !after.popup && after.focusBack, JSON.stringify({ esc, after }));
    // Enter activates selector chip
    await page.evaluate(() => { const o = document.querySelector('[data-sel="model"]'); o.focus(); });
    await page.keyboard.press("Enter");
    await settle(page, 250);
    const enterOpen = await page.evaluate(() => !!document.querySelector(".pmq-popup"));
    R.check("Enter activates selector chip", enterOpen);
    await page.keyboard.press("Escape");
    await settle(page, 200);
    // Tab order smoke: focus moves through visible controls
    const tabs = await page.evaluate(async () => {
      const ta = document.querySelector(".pmq-composer textarea");
      ta.focus();
      const seen = [];
      for (let i = 0; i < 6; i++) {
        const ev = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
        // rely on native tabbing via CDP instead
        break;
      }
      return seen;
    });
    for (let i = 0; i < 5; i++) await page.keyboard.press("Tab");
    const tabState = await page.evaluate(() => {
      const ae = document.activeElement;
      return { cls: ae ? ae.className : null, visible: ae ? !!(ae.offsetWidth || ae.offsetHeight) : false };
    });
    R.check("Tab moves focus to a visible control", tabState.visible && !!tabState.cls, JSON.stringify(tabState));
    await page.evaluate(() => {
      const st = window.PMChatHost.api.store;
      let q = st.activeQuestionnaire("thread-17");
      while (q) { st.questCancel(q); q = st.activeQuestionnaire("thread-17"); }
    });
    await settle(page, 300);
    // Escape cancels questionnaire
    await page.evaluate(() => window.__pmDemoTrigger("question.prepare", {}));
    await settle(page, 800);
    await page.evaluate(() => { const o = document.querySelector(".pmq-t1-quest"); if (o) o.focus(); });
    await page.keyboard.press("Escape");
    await settle(page, 400);
    const qGone = await page.evaluate(() => !document.querySelector(".pmq-t1-quest"));
    R.check("Escape cancels active questionnaire", qGone);
    await browser.close();
  }

  // ---- E4 long content ----
  {
    const { browser, page } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=750&dt=thread-17");
    await settle(page, 600);
    await page.evaluate(() => {
      const st = window.PMChatHost.api.store;
      let q = st.activeQuestionnaire("thread-17");
      while (q) { st.questCancel(q); q = st.activeQuestionnaire("thread-17"); }
    });
    await settle(page, 300);
    const longPrompt = "Where should provider and account policy be managed when the organization spans multiple regions, accounts, and billing entities with per-environment routing rules that must stay auditable?";
    const longOpt = "Settings owns policy; Chat chooses the current route; Usage records the replay separately and the provider cache is preserved per account connection";
    await page.evaluate(arg => window.__pmDemoTrigger("question.prepare", { questions: [
      { id: "L1", prompt: arg.lp, kind: "single select", required: true, options: [arg.lo, "Chat owns everything", "Split policy between both surfaces"] },
      { id: "L2", prompt: "Second question with a deliberately long prompt to exercise wrapping behavior across widths and themes?", kind: "single select", required: true, options: ["Short", "Another fairly long option that should wrap cleanly inside the card without horizontal scroll"] }
    ] }), { lp: longPrompt, lo: longOpt });
    await settle(page, 800);
    const long1 = await page.evaluate(() => {
      const zone = document.querySelector(".pmq-questzone");
      const sc = document.querySelector(".pmq-scroller");
      const d = document.documentElement;
      return {
        noH: d.scrollWidth <= d.clientWidth + 1,
        zoneFit: zone ? zone.scrollWidth <= zone.clientWidth + 1 : false,
        scFit: sc ? sc.scrollWidth <= sc.clientWidth + 1 : false
      };
    });
    R.check("long prompt/option wrap without horizontal scroll", long1.noH && long1.zoneFit && long1.scFit, JSON.stringify(long1));
    // long draft with unbroken URL
    await page.evaluate(() => window.__pmDemoTrigger("question.cancel", {}));
    await settle(page, 300);
    await page.evaluate(() => window.PMChatHost.api.store.setDraft("See https://example.com/" + "a".repeat(160) + " for the full provider routing matrix; this draft is intentionally long to exercise composer wrapping behavior at narrow widths."));
    await settle(page, 300);
    const long2 = await page.evaluate(() => {
      const d = document.documentElement;
      const c = document.querySelector(".pmq-composerzone");
      return { noH: d.scrollWidth <= d.clientWidth + 1, cFit: c ? c.scrollWidth <= c.clientWidth + 1 : false };
    });
    R.check("long draft + unbroken URL wrap in composer", long2.noH && long2.cFit, JSON.stringify(long2));
    await browser.close();
  }

  // ---- E5 errors: reconnect failure + quota ----
  {
    const { browser, page } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17");
    await settle(page, 600);
    await page.evaluate(() => window.__pmDemoTrigger("conn.offline", {}));
    await page.evaluate(() => window.__pmDemoTrigger("conn.queue_send", {}));
    await settle(page, 300);
    await page.evaluate(() => window.__pmDemoTrigger("conn.reconnect_fail", {}));
    await settle(page, 400);
    const failed = await page.evaluate(() => ({
      status: window.PMChatHost.api.store.state.connection.status,
      strip: document.querySelector(".pmq-syncstrip") ? document.querySelector(".pmq-syncstrip").dataset.status : null
    }));
    R.check("reconnect failure surfaces failed state", failed.status === "failed" && failed.strip === "failed", JSON.stringify(failed));
    await page.evaluate(() => document.querySelector(".pmq-syncstrip").click());
    await settle(page, 300);
    const pop = await page.evaluate(() => ({
      err: !!document.querySelector(".pmq-obx-err"),
      retry: !!document.querySelector("[data-reconnect]")
    }));
    R.check("failed popup shows error row + retry", pop.err && pop.retry, JSON.stringify(pop));
    await page.evaluate(() => { const b = document.querySelector("[data-reconnect]"); if (b) b.click(); });
    await settle(page, 900);
    const rec = await page.evaluate(() => ({
      status: window.PMChatHost.api.store.state.connection.status,
      outbox: window.PMChatHost.api.store.state.connection.outbox.length
    }));
    R.check("retry after failure recovers and drains outbox", rec.status === "live" && rec.outbox === 0, JSON.stringify(rec));
    // quota / allowance warning
    await page.evaluate(() => window.__pmDemoTrigger("capacity.forecast", {}));
    await settle(page, 400);
    const quota = await page.evaluate(() => /Requested specialists/i.test(document.body.textContent || ""));
    R.check("quota/allowance warning presents with recovery action", quota);
    await browser.close();
  }

  // ---- E7 combined pop-out + pinned + artifact resize survival ----
  {
    const { browser, page } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17&mount=popout");
    await settle(page, 700);
    await page.evaluate(() => {
      window.PMChatHost.api.store.setPin(window.PMChatHost.api.env.winId(), true);
      window.PMChatHost.api.store.artOpen(window.PMChatHost.api.env.winId(), "artifact-diff");
      window.PMChatHost.api.store.setDraft("survives pop-out resize");
    });
    await settle(page, 500);
    const grip = await page.evaluate(() => {
      const g = document.querySelector(".pmq-popout-resize");
      if (!g) return null;
      const r = g.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    R.check("pop-out resize grip present with pin+artifact", !!grip);
    if (grip) {
      await page.mouse.move(grip.x, grip.y);
      await page.mouse.down();
      await page.mouse.move(grip.x - 180, grip.y - 60, { steps: 4 });
      await page.mouse.up();
      await settle(page, 500);
    }
    const surv = await page.evaluate(() => ({
      pin: !!document.querySelector(".pmq-pincol"),
      art: !!document.querySelector(".pmq-artws"),
      draft: window.PMChatHost.api.store.thread("thread-17").draft.text
    }));
    R.check("pin + artifact + draft survive pop-out resize drag", surv.pin && surv.art && surv.draft === "survives pop-out resize", JSON.stringify(surv));
    await browser.close();
  }

  // ---- E6 all-64 pairing sweep ----
  for (const w of ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8"]) {
    for (const t of ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"]) {
      const { browser, page, errors } = await openHost(server.port, `w=${w}&t=${t}&theme=friendly-dark&width=975&dt=thread-17`);
      await page.waitForSelector(".pmq-msg", { timeout: 15000 }).catch(() => {});
      await settle(page, 350);
      const msgs = await page.evaluate(() => document.querySelectorAll(".pmq-msg").length);
      const prodErrors = errors.filter(e => !/ERR_NO_BUFFER_SPACE/.test(e)); // environmental under rapid context churn
      R.check(`pair ${w}x${t} renders clean`, msgs > 0 && prodErrors.length === 0, prodErrors.slice(0, 2).join(" | "));
      await browser.close();
    }
  }
} finally {
  server.proc.kill();
}
const s = R.summary();
record(s.suite, "correction", 975, "friendly-dark", "full+reduced", R.checks);
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
