/* Regenerate concept-hub.json and the folder index from what is actually on disk.
 *
 *   node tools/gen-hub.js
 *
 * Two rules the packet is strict about, and this script exists so neither can be
 * broken by hand:
 *
 *   1. Every existing entry is preserved. The four original concepts are historical
 *      evidence; they keep their ids, titles, paths, tags and order exactly.
 *   2. A concept is only listed once its page exists, because the Hub validator
 *      fails a manifest that names a missing page — and a half-written manifest is
 *      worse than a short one.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const NEW_CONCEPTS = [
  { stem: "concept-05-directory-take-1", title: "Directory", order: 50,
    thesis: "Settings is a directory you can hold in your head.",
    tags: ["settings", "directory", "cards", "rail"], theme: "friendly-dark" },
  { stem: "concept-06-directory-take-2", title: "Editorial", order: 60,
    thesis: "Settings reads like a well-set page.",
    tags: ["settings", "editorial", "list", "sheet"], theme: "friendly-light" },
  { stem: "concept-07-compendium-workspace", title: "Compendium", order: 70,
    thesis: "Settings is a reference work with a good index.",
    tags: ["settings", "compendium", "facets", "index"], theme: "glass-dark" },
  { stem: "concept-08-directory-take-3", title: "Broadside", order: 80,
    thesis: "Settings is broad and approachable.",
    tags: ["settings", "spacious", "cards", "managers"], theme: "basic-light" },
  { stem: "concept-09-tome-tabs", title: "Codex", order: 90,
    thesis: "Chapter tabs and layered pages, in Puppet Master's own materials.",
    tags: ["settings", "edge-tabs", "layers", "rethemed"], theme: "retro-dark" },
  { stem: "concept-10-command-suite", title: "Command", order: 100,
    thesis: "Keyboard first, panes left to right.",
    tags: ["settings", "panes", "keyboard", "rethemed"], theme: "basic-dark" },
  { stem: "concept-11-tabbed-organizer", title: "Folio", order: 110,
    thesis: "Tabs and sheets that never lose your place.",
    tags: ["settings", "tabs", "sheets", "rethemed"], theme: "glass-light" }
];

function present(c) { return fs.existsSync(path.join(ROOT, c.stem + ".html")); }

/* ------------------------------------------------------------ concept-hub.json */

function hub() {
  const file = path.join(ROOT, "concept-hub.json");
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  const existing = manifest.entries || [];
  const byId = {};
  existing.forEach((e) => { byId[e.id] = e; });

  NEW_CONCEPTS.filter(present).forEach((c) => {
    if (byId[c.stem]) return;
    existing.push({
      id: c.stem,
      title: "Opus 5 — " + c.title,
      path: c.stem + ".html",
      openPath: c.stem + ".html",
      openActions: "both",
      controlMode: "standard",
      tags: c.tags,
      order: c.order
    });
    byId[c.stem] = true;
  });

  existing.sort((a, b) => (a.order || 0) - (b.order || 0));
  manifest.entries = existing;
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
  return existing.length;
}

/* -------------------------------------------------------------------- index.html */

/* The index is a gallery, not a concept: it is the one page in this folder allowed to
 * preview others. It already carries the four originals; the new concepts are appended
 * to its own data array without touching anything else on the page. */
function index() {
  const file = path.join(ROOT, "index.html");
  let text = fs.readFileSync(file, "utf8");

  const wanted = NEW_CONCEPTS.filter(present);
  const missing = wanted.filter((c) => text.indexOf(c.stem + ".html") < 0);
  if (!missing.length) return 0;

  const anchor = 'file: "opus-5-ledger.html", theme: "retro-dark" }';
  if (text.indexOf(anchor) < 0) throw new Error("index.html: the concept list anchor moved; refusing to guess");

  const added = missing.map((c) =>
    ',\n    { id: "' + c.stem + '", name: "Opus 5 \u2014 ' + c.title + '", thesis: "' +
    c.thesis.replace(/^Settings is /, "").replace(/\.$/, "") + '",\n      sub: "' + c.thesis +
    '",\n      file: "' + c.stem + '.html", theme: "' + c.theme + '" }'
  ).join("");

  text = text.replace(anchor, anchor + added);
  text = text.replace(
    /Settings redesign — four concepts/,
    "Settings redesign — eleven concepts"
  );
  fs.writeFileSync(file, text);
  return missing.length;
}

const entries = hub();
const appended = index();
process.stdout.write("concept-hub.json entries: " + entries + "; index.html gained " + appended + " previews\n");
