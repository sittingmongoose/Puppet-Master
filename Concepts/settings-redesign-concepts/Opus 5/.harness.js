/* temporary headless harness — deleted after verification */
const fs = require("fs");
const vm = require("vm");
const files = [
  "shared/pm-icons.js", "shared/pm-store.js", "shared/pm-route.js",
  "shared/pm-data.js", "shared/pm-data-install.js", "shared/pm-data-taxonomy.js",
  "shared/pm-data-agents.js", "shared/pm-data-desktop.js", "shared/pm-data-dev.js",
  "shared/pm-data-system.js", "shared/pm-data-seal.js",
  "shared/pm-semantics.js", "shared/pm-search.js", "shared/pm-manager-kit.js"
];
const listeners = {};
const doc = {
  documentElement: { getAttribute: () => "0", setAttribute: () => {}, style: {} },
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, classList: { add() {}, remove() {} } }),
  addEventListener: () => {}, removeEventListener: () => {}
};
const win = {
  document: doc,
  location: { hash: "", href: "http://x/", replace() {} },
  addEventListener: (k, f) => { (listeners[k] = listeners[k] || []).push(f); },
  removeEventListener: () => {},
  setTimeout: setTimeout, clearTimeout: clearTimeout,
  console: console, localStorage: null, Promise: Promise
};
win.window = win;
const ctx = vm.createContext(win);
for (const f of files) {
  if (!fs.existsSync(f)) { console.log("(skipping absent " + f + ")"); continue; }
  vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
}
const K = win.PMManagerKit;
const ids = K.assignedTo("atlas");
const state = { managerEdits: {}, values: {}, demoState: "normal" };
let fail = 0;

function check(spec, id) {
  const okKinds = ["list", "table", "cards", "matrix", "rows", "prose"];
  const okEdit = ["toggle", "select", "text", "number", "path", "secret", "chips", "order"];
  const okSecret = ["pmSecret", "vaultReference", "cliOwned", "pmOAuth", "envBacked", "commandHelper", "nonSecret"];
  spec.sections.forEach(s => {
    if (!okKinds.includes(s.kind)) { console.log("BAD kind", id, s.id, s.kind); fail++; }
    if (s.kind === "rows") {
      s.settings.forEach(sid => {
        if (!win.PMSemantics.findSetting(win.PMData, sid)) { console.log("MISSING setting", id, sid); fail++; }
      });
    }
    if (s.kind === "table" || s.kind === "matrix") {
      if (!s.columns.length) { console.log("NO columns", id, s.id); fail++; }
      s.items.forEach(it => s.columns.forEach(c => {
        if (it.fields[c.key] === undefined) { console.log("MISSING cell", id, s.id, it.id, c.key); fail++; }
      }));
    }
    s.items.forEach(it => {
      it.editable.forEach(e => {
        if (!okEdit.includes(e.kind)) { console.log("BAD editable", id, it.id, e.kind); fail++; }
        if (e.secretKind && !okSecret.includes(e.secretKind)) { console.log("BAD secretKind", id, e.secretKind); fail++; }
      });
    });
  });
}

const kinds = new Set(), edits = new Set(), statuses = new Set();
let emptyReach = 0, loadingReach = 0;
for (const id of ids) {
  let spec;
  try { spec = K.spec(id, state); } catch (e) { console.log("THROW", id, e.message); fail++; continue; }
  check(spec, id);
  spec.sections.forEach(s => {
    kinds.add(s.kind);
    if (!s.items.length && s.empty) emptyReach++;
    if (s.loading) loadingReach++;
    s.items.forEach(i => { statuses.add(i.status); i.editable.forEach(e => edits.add(e.kind)); });
  });
  console.log(id.padEnd(22), spec.sections.length + " sections", spec.sections.reduce((a, s) => a + s.items.length, 0) + " items");
}
console.log("section kinds:", [...kinds].sort().join(","));
console.log("editable kinds:", [...edits].sort().join(","));
console.log("item statuses:", [...statuses].sort().join(","));
console.log("empty sections:", emptyReach, "loading sections:", loadingReach);

// loading demo state
const ls = { managerEdits: {}, values: {}, demoState: "loading" };
let loadingNow = 0;
for (const id of ids) K.spec(id, ls).sections.forEach(s => { if (s.loading) loadingNow++; });
console.log("loading sections under demo=loading:", loadingNow);

// FileSafe reorder actually changes the verdict
const fsBase = K.spec("manager-filesafe", state);
const testBase = fsBase.sections.find(s => s.id === "test").items[0];
const order = fsBase.sections.find(s => s.id === "order").items[0].editable[0].value.slice();
const i1 = order.indexOf("fr-schema"), i2 = order.indexOf("fr-project");
order.splice(i1, 1); order.splice(order.indexOf("fr-project"), 0, "fr-schema");
const moved = { managerEdits: { "edit-manager-filesafe-rules-order": order }, values: {}, demoState: "normal" };
const fsMoved = K.spec("manager-filesafe", moved);
const testMoved = fsMoved.sections.find(s => s.id === "test").items[0];
console.log("filesafe default verdict:", testBase.statusWord, "|", testBase.fields.Why);
console.log("filesafe reordered verdict:", testMoved.statusWord, "|", testMoved.fields.Why);
if (testBase.statusWord === testMoved.statusWord) { console.log("FAIL: reorder did not change the verdict"); fail++; }

// floor override path
const gitState = { managerEdits: { "edit-manager-filesafe-test-path": "~/code/orchard-api/.git/config" }, values: {}, demoState: "normal" };
const gitTest = K.spec("manager-filesafe", gitState).sections.find(s => s.id === "test").items[0];
console.log("filesafe .git verdict:", gitTest.statusWord, "|", gitTest.fields["Matching rule"]);
const tmpState = { managerEdits: { "edit-manager-filesafe-test-path": "~/code/orchard-api/tmp/scratch.txt" }, values: {}, demoState: "normal" };
const tmpTest = K.spec("manager-filesafe", tmpState).sections.find(s => s.id === "test").items[0];
console.log("filesafe tmp verdict:", tmpTest.statusWord, "|", tmpTest.fields["Matching rule"]);

// bsd mode round trip
["Off", "Auto — default", "On"].forEach(m => {
  const s = K.spec("manager-bsd", { managerEdits: { "edit-manager-bsd-mode-mode": m }, values: {}, demoState: "normal" });
  const live = s.sections.find(x => x.id === "triggers").items.filter(i => i.availability.available).length;
  console.log("bsd", JSON.stringify(m), "->", s.health.statusWord, "live triggers", live);
});

// persona diff
const pd = K.spec("manager-personas", state).sections.find(s => s.id === "import");
console.log("persona diff rows:", pd.items.length, "changing:", pd.items.filter(i => i.statusWord === "Will change").length);

// search index kinds
const idx = win.PMSearch.buildIndex(win.PMData);
const found = win.PMSearch.search(idx, "backup", { limit: 40 });
console.log("search 'backup' kinds:", [...new Set(found.map(r => r.kind))].join(","));

console.log(fail ? "SPEC FAILURES: " + fail : "ALL SPEC CHECKS PASSED");

const floorState = { managerEdits: { "edit-manager-filesafe-test-path": "~/code/orchard-api/tmp/.git/config" }, values: {}, demoState: "normal" };
const ft = K.spec("manager-filesafe", floorState).sections.find(s => s.id === "test").items[0];
console.log("floor-override verdict:", ft.statusWord, "| by order:", ft.requested, "| why:", ft.effectiveWhy);
