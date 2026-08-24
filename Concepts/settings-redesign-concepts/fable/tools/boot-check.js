#!/usr/bin/env node
/* Boot-check for the seven new fable Settings concepts.
 *
 * Usage (from the fable folder):
 *   node tools/boot-check.js concept-05-directory-take-1.html
 *       [--width=1280] [--height=900] [--theme=friendly-dark]
 *       [--routes=home,dest/general,...]  [--shots=/tmp/some-temp-dir]
 *       [--scenario=first-run] [--fixture=fx.import-conflict]
 *
 * Opens the page over file:// with the sandbox CDP driver, walks a route list,
 * and fails on any console error/warning, page exception, missed route stamp,
 * or true horizontal overflow. --shots writes one PNG per route for VISUAL
 * inspection — point it at a temp dir outside the repo and delete it after.
 */
"use strict";

const path = require("path");
const os = require("os");
const fs = require("fs");
const { Browser } = require(path.join(__dirname, "harness", "cdp.js"));

const DEFAULT_ROUTES = [
  "home",
  "dest/general",
  "dest/ai",
  "manager/m.providers",
  "manager/m.permissions",
  "manager/m.lifecycle",
  "all",
  "copy",
  "search/rate limit",
  "setting/system.health.platform-diagnostics",
  "setting/system.health.diagnostics-verbosity",
  "search/notifcations",
  "search/flux capacitor"
];

function parseArgs(argv) {
  const args = { width: 1280, height: 900, theme: null, routes: null, shots: null, scenario: null, fixture: null };
  const rest = [];
  for (const a of argv) {
    const m = /^--([a-z]+)=(.*)$/.exec(a);
    if (m) args[m[1]] = m[2];
    else rest.push(a);
  }
  if (!rest.length) { console.error("boot-check: missing page argument"); process.exit(2); }
  args.page = rest[0];
  args.width = Number(args.width) || 1280;
  args.height = Number(args.height) || 900;
  args.routes = args.routes ? args.routes.split(",").map((s) => s.trim()).filter(Boolean) : DEFAULT_ROUTES;
  return args;
}

function routeHash(route, args) {
  const params = ["instant=1"];
  if (args.scenario) params.push("scenario=" + args.scenario);
  if (args.fixture) params.push("fixture=" + args.fixture);
  if (args.theme) params.push("theme=" + args.theme);
  return "#/" + route.split("/").map(encodeURIComponent).join("/") + "?" + params.join("&");
}

async function settle(page) {
  await page.evaluate(function () {
    return new Promise(function (resolve) {
      requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(resolve, 220); }); });
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const fableDir = path.resolve(__dirname, "..");
  const pageFile = path.resolve(fableDir, args.page);
  if (!fs.existsSync(pageFile)) { console.error("boot-check: no such page " + pageFile); process.exit(2); }
  if (args.shots) fs.mkdirSync(args.shots, { recursive: true });

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "pm-bootcheck-"));
  const browser = await Browser.launch(profile);
  const failures = [];
  try {
    const page = await browser.newPage();
    await page.send("Network.setBlockedURLs", { urls: ["*fonts.googleapis.com*", "*fonts.gstatic.com*"] });
    await page.setViewport(args.width, args.height);

    /* Cold open first: no hash at all, the way the hub entries and a
       double-clicked file arrive. The route walk below always supplies a
       hash, so this step is the only thing standing between a hash-less
       boot and a blank stage. */
    await page.goto("file://" + pageFile);
    const coldReady = await page.evaluate(function () {
      return new Promise(function (resolve) {
        var t0 = Date.now();
        (function poll() {
          if (document.documentElement.getAttribute("data-pm-state") === "ready") return resolve(true);
          if (Date.now() - t0 > 15000) return resolve(false);
          setTimeout(poll, 100);
        })();
      });
    });
    await settle(page);
    const cold = await page.evaluate(function () {
      var stage = document.getElementById("pmStage");
      return {
        stageText: stage ? (stage.innerText || "").trim().length : -1,
        route: document.documentElement.getAttribute("data-pm2-route") || ""
      };
    });
    if (!coldReady) failures.push({ route: "(no hash)", kind: "boot", detail: "data-pm-state=ready never appeared" });
    if (cold.stageText < 40) {
      failures.push({ route: "(no hash)", kind: "blank", detail: "stage renders almost no text on a hash-less open" });
    }
    if (cold.route !== "home") {
      failures.push({ route: "(no hash)", kind: "route", detail: "data-pm2-route=" + JSON.stringify(cold.route) + ", expected home" });
    }
    for (const c of page.console) failures.push({ route: "(no hash)", kind: "console-" + c.type, detail: c.text.slice(0, 400) });
    for (const e of page.pageErrors) failures.push({ route: "(no hash)", kind: "exception", detail: String(e).slice(0, 400) });
    page.clearDiagnostics();

    await page.goto("file://" + pageFile + routeHash(args.routes[0], args));
    const ready = await page.evaluate(function () {
      return new Promise(function (resolve) {
        var t0 = Date.now();
        (function poll() {
          if (document.documentElement.getAttribute("data-pm-state") === "ready") return resolve(true);
          if (Date.now() - t0 > 15000) return resolve(false);
          setTimeout(poll, 100);
        })();
      });
    });
    if (!ready) failures.push({ route: args.routes[0], kind: "boot", detail: "data-pm-state=ready never appeared" });

    for (const route of args.routes) {
      page.clearDiagnostics();
      await page.evaluate(function (hash) { location.hash = hash; }, routeHash(route, args));
      await settle(page);

      const state = await page.evaluate(function (expected) {
        var html = document.documentElement;
        var attr = html.getAttribute("data-pm2-route") || "";
        var sw = html.scrollWidth, iw = window.innerWidth;
        var stage = document.getElementById("pmStage");
        var stageOverflow = false;
        if (stage) {
          var r = stage.getBoundingClientRect();
          stageOverflow = r.right > iw + 1 || stage.scrollWidth > stage.clientWidth + 1 &&
            !stage.hasAttribute("data-allow-hscroll");
        }
        return {
          attr: attr,
          routeOk: attr.indexOf(expected.split("?")[0].replace(/^#\//, "").split("/")[0]) !== -1,
          bodyOverflow: sw > iw + 1,
          stageOverflow: stageOverflow,
          visibleText: (document.body.innerText || "").length
        };
      }, routeHash(route, args));

      if (!state.routeOk) failures.push({ route, kind: "route", detail: "data-pm2-route=" + JSON.stringify(state.attr) });
      if (state.bodyOverflow) failures.push({ route, kind: "overflow", detail: "document scrollWidth exceeds viewport" });
      if (state.visibleText < 40) failures.push({ route, kind: "blank", detail: "page renders almost no text" });
      for (const c of page.console) failures.push({ route, kind: "console-" + c.type, detail: c.text.slice(0, 400) });
      for (const e of page.pageErrors) failures.push({ route, kind: "exception", detail: String(e).slice(0, 400) });

      if (args.shots) {
        const name = route.replace(/[^a-z0-9.-]+/gi, "_") + ".png";
        await page.screenshot(path.join(args.shots, name));
      }
    }
    await page.close();
  } finally {
    await browser.close();
    for (let i = 0; i < 5; i++) {
      try { fs.rmSync(profile, { recursive: true, force: true }); break; }
      catch (e) { await new Promise((r) => setTimeout(r, 300)); }
    }
  }

  if (failures.length) {
    console.log("FAIL " + args.page + " (" + args.width + "px" + (args.theme ? ", " + args.theme : "") + ")");
    for (const f of failures) console.log("  [" + f.kind + "] " + f.route + " — " + f.detail);
    process.exit(1);
  }
  console.log("PASS " + args.page + " (" + args.width + "px" + (args.theme ? ", " + args.theme : "") + ", " +
    args.routes.length + " routes" + (args.shots ? ", shots in " + args.shots : "") + ")");
}

main().catch((e) => { console.error("boot-check crashed: " + e.message); process.exit(2); });
