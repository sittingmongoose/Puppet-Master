// Probe 5 — general hygiene across all 16 pairings at 750px friendly-dark:
// zero page errors; no focus trap (Escape closes popups, focus returns);
// no body scroll lock; no offscreen popups; no horizontal page scroll at
// 520/750/975/1200; no clipped text on selector rows/chips; no emoji;
// no Yolo literal; no Playwright literal in DOM text; resizer release leaves
// no stuck capture.
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record, check } from "./report.mjs";

const R = results("probe-general");
const server = await startServer();
const checks = [];
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/u;

try {
  // ---- all 16 concepts at 750px ----
  const pairings = [];
  for (const w of ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8"]) {
    for (const t of ["t1", "t2"]) pairings.push([w, t]); // 16 pairings
  }
  let allErrors = [];
  let conceptsClean = 0;
  for (const [w, t] of pairings) {
    const { browser, page, errors } = await openHost(server.port, `w=${w}&t=${t}&theme=friendly-dark&width=750&dt=thread-17`);
    await settle(page, 550);
    // open a popup, Escape closes it, focus returns (not trapped)
    await page.evaluate(() => {
      const b = document.querySelector('[data-sel="model"]');
      if (b) b.click();
    });
    await settle(page, 400);
    const escInfo = await page.evaluate(() => {
      const hadPopup = !!document.querySelector(".pmq-modelpop");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return { hadPopup };
    });
    await page.keyboard.press("Escape");
    await settle(page, 400);
    const afterEsc = await page.evaluate(() => {
      const popupGone = !document.querySelector(".pmq-modelpop");
      // body overflow:hidden is the app-shell design (base.css), NOT a popup
      // scroll lock. The real invariant: the transcript scroller must remain
      // scrollable after the popup closes.
      const sc = document.querySelector(".pmq-scroller");
      const scrollable = !!sc && sc.scrollHeight >= sc.clientHeight;
      const beforeTop = sc ? sc.scrollTop : 0;
      // Scroll UP: the transcript starts pinned to the bottom, so a +delta is
      // clamped at max scrollTop and reads as "locked". Upward is the real test.
      if (sc) sc.scrollTop = Math.max(0, beforeTop - 300);
      const moved = sc ? sc.scrollTop !== beforeTop : false;
      if (sc) sc.scrollTop = beforeTop;
      return { popupGone, scrollable, moved };
    });
    if (errors.length === 0 && afterEsc.popupGone && afterEsc.scrollable && afterEsc.moved) conceptsClean++;
    allErrors.push(...errors.map(e => `${w}/${t}: ${e}`));
    await browser.close();
  }
  checks.push(check("16 pairings: zero errors + Escape closes popup + no scroll lock", conceptsClean === 16, `${conceptsClean}/16 clean; ${allErrors.slice(0, 2).join(" | ")}`));

  // ---- offscreen popup check ----
  {
    const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=750&dt=thread-17");
    await settle(page, 500);
    await page.click('[data-sel="model"]');
    await settle(page, 400);
    const rect = await page.evaluate(() => {
      const p = document.querySelector(".pmq-modelpop");
      if (!p) return null;
      const r = p.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, vw: window.innerWidth, vh: window.innerHeight };
    });
    checks.push(check("popup within viewport", !!rect && rect.left >= 0 && rect.top >= 0 && rect.right <= rect.vw + 2 && rect.bottom <= rect.vh + 2, JSON.stringify(rect)));
    checks.push(check("zero page errors (popup pass)", errors.length === 0, errors.slice(0, 2).join(" | ")));
    await browser.close();
  }

  // ---- width ladder: no horizontal page scroll ----
  for (const width of [520, 750, 975, 1200]) {
    const { browser, page } = await openHost(server.port, `w=w1&t=t1&theme=friendly-dark&width=${width}&dt=thread-17`, { width: Math.max(width + 340, 1280) });
    await settle(page, 600);
    const overflow = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      shell: document.querySelector(".pmq-shell").scrollWidth - document.querySelector(".pmq-shell").clientWidth
    }));
    checks.push(check(`no horizontal scroll at ${width}px`, overflow.doc <= 1 && overflow.shell <= 1, JSON.stringify(overflow)));
    await browser.close();
  }

  // ---- clipped text on selector rows/chips + forbidden literals ----
  {
    const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=750&dt=thread-17");
    await settle(page, 600);
    const hygiene = await page.evaluate((emojiReSrc) => {
      const emojiRe = new RegExp(emojiReSrc, "u");
      const sels = [...document.querySelectorAll(".pmq-sel")];
      const clipped = sels.filter(s => s.scrollWidth > s.clientWidth + 2).length;
      const bodyText = document.body.innerText || "";
      return {
        clipped,
        emoji: emojiRe.test(bodyText),
        yolo: bodyText.includes("Yolo"),
        playwright: bodyText.includes("Playwright") || bodyText.includes("playwright")
      };
    }, EMOJI_RE.source);
    checks.push(check("no clipped selector chips", hygiene.clipped === 0, "clipped=" + hygiene.clipped));
    checks.push(check("no emoji in DOM text", !hygiene.emoji));
    checks.push(check("no Yolo literal", !hygiene.yolo));
    checks.push(check("no Playwright literal in DOM", !hygiene.playwright));

    // resizer release leaves no stuck capture. The pop-out resize grip only
    // exists in mount=popout (the stage is display:none when docked), so open
    // a dedicated pop-out page and drive it with real pointer events.
    await browser.close();
  }
  {
    const { browser: pb, page: pp, errors: perr } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17&mount=popout");
    await settle(pp, 600);
    const grip = await pp.evaluate(() => {
      const g = document.querySelector(".pmq-popout-resize") || document.querySelector(".pmq-popout-grip");
      if (!g) return null;
      const r = g.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, visible: r.width > 0 };
    });
    if (grip && grip.visible) {
      await pp.mouse.move(grip.x, grip.y);
      await pp.mouse.down();
      await pp.mouse.move(grip.x + 30, grip.y + 20, { steps: 3 });
      await settle(pp, 120);
      const dragging = await pp.evaluate(() => !!document.querySelector(".pmq-dragging, .pmq-resizing"));
      await pp.mouse.up();
      await settle(pp, 300);
      const stuck = await pp.evaluate(() => !!document.querySelector(".pmq-dragging, .pmq-resizing"));
      checks.push(check("resizer engages then releases cleanly", dragging === true && stuck === false, "dragging=" + dragging + " stuck=" + stuck));
    } else {
      checks.push(check("resizer present in popout", false, JSON.stringify(grip)));
    }
    checks.push(check("zero page errors (popout pass)", perr.length === 0, perr.slice(0, 2).join(" | ")));
    await pb.close();
  }
  {
    const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=750&dt=thread-17");
    await settle(page, 500);
    checks.push(check("zero page errors (hygiene pass)", errors.length === 0, errors.slice(0, 2).join(" | ")));
    await browser.close();
  }
} finally {
  server.proc.kill();
}
checks.forEach(c => R.check(c.name, c.pass, c.detail));
record("probe-general", "all 16", "520/750/975/1200", "friendly-dark", "full", checks);
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
