#!/usr/bin/env python3
"""Build dashboard.html — a self-contained preview + download page for the
Kimiicon logo suite.

Inputs (all under Concepts/Kimiicon/):
  manifest.json                 theme/style metadata
  static/icon-{theme}.svg       8 static icons
  animated/{style}-{theme}.svg  48 animated loading logos (SMIL)
  png/{theme}/icon-*.png        9 raster sizes per theme
  ico/icon-{theme}.ico          Windows app/tray icons
  icns/icon-{theme}.icns        macOS app icons

Output:
  dashboard.html   one file, no CDN, no fetches. SVGs embedded as JS strings
                   (previews via Blob URLs in <img> so SMIL animates), binaries
                   embedded as base64. All downloads go through Blob +
                   a.download, so the page works over http:// AND file://.
"""
from pathlib import Path
import base64
import json

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dashboard.html"

PNG_SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024]

# Per-style Slint/static-renderer fallback notes (presentation metadata).
STYLE_NOTES = {
    "puppet-sway":  "Static fallback: renders as the plain icon (frame 0).",
    "breathe":      "Static fallback: renders as the plain icon (frame 0).",
    "string-pluck": "Static fallback: renders as the plain icon (frame 0).",
    "draw-on":      "Static fallback: BLANK first frame — loading/web only, never an app icon.",
    "mobile-spin":  "Static fallback: renders as the plain icon (frame 0). Easiest to re-create in Slint (one rotation).",
    "sheen":        "Static fallback: renders as the plain icon (frame 0).",
}

PLATFORM_MAP = [
    ("Windows", "ico/icon-{theme}.ico", "App icon (7 sizes embedded) + system tray."),
    ("macOS", "icns/icon-{theme}.icns", "App-bundle icon. Menu-bar tray: png/icon-32.png."),
    ("Linux", "png/{theme}/ 16–1024", "hicolor / .desktop icons; static SVG for scalable."),
    ("Web + Slint GUI", "static/icon-{theme}.svg", "Header logo + favicon. animated/*.svg = web loading spinners. Slint: render static, animate in Slint code."),
]

MIME = {
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/vnd.microsoft.icon",
    ".icns": "image/icns",
}


def collect():
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    themes = list(manifest["themes"].keys())
    styles = list(manifest["styles"].keys())

    svg_text = {}
    for rel in manifest["static"] + manifest["animated"]:
        p = ROOT / rel
        if not p.exists():
            raise SystemExit(f"missing SVG listed in manifest: {rel}")
        svg_text[rel] = p.read_text(encoding="utf-8")

    bin_b64 = {}
    for theme in themes:
        for size in PNG_SIZES:
            rel = f"png/{theme}/icon-{size}.png"
            p = ROOT / rel
            if not p.exists():
                raise SystemExit(f"missing PNG: {rel}")
            bin_b64[rel] = base64.b64encode(p.read_bytes()).decode("ascii")
        for kind in ("ico", "icns"):
            rel = f"{kind}/icon-{theme}.{kind}"
            p = ROOT / rel
            if not p.exists():
                raise SystemExit(f"missing {kind.upper()}: {rel}")
            bin_b64[rel] = base64.b64encode(p.read_bytes()).decode("ascii")

    payload = {
        "themes": manifest["themes"],
        "styles": manifest["styles"],
        "styleNotes": STYLE_NOTES,
        "platformMap": PLATFORM_MAP,
        "pngSizes": PNG_SIZES,
        "themeOrder": themes,
        "styleOrder": styles,
        "svg": svg_text,
        "bin": bin_b64,
    }
    expected = (len(manifest["static"]), len(manifest["animated"]), len(bin_b64))
    assert expected == (8, 48, 8 * (len(PNG_SIZES) + 2)), expected
    return payload


TEMPLATE = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Puppet Master — Icon &amp; Loading Logo Suite</title>
<style>
  :root {
    --chrome: #14151a; --chrome2: #1c1e24; --line: #2a2d36;
    --txt: #e8e9ee; --dim: #9aa0ad; --accent: #b79cff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--chrome); color: var(--txt);
    font: 14px/1.45 -apple-system, "SF Pro Text", "Segoe UI", Roboto, Inter, sans-serif;
  }
  header {
    position: sticky; top: 0; z-index: 10;
    background: color-mix(in srgb, var(--chrome) 88%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line); padding: 10px 20px 12px;
  }
  .hrow { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .hrow img { width: 42px; height: 42px; border-radius: 9px; }
  h1 { font-size: 17px; margin: 0; letter-spacing: .2px; }
  .kimi-badge {
    font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
    color: #1a1426; background: var(--accent); border-radius: 999px; padding: 3px 9px;
    vertical-align: 3px; margin-left: 9px;
  }
  .sub { color: var(--dim); font-size: 12.5px; margin-top: 2px; }
  .filters { margin-top: 10px; display: flex; flex-direction: column; gap: 7px; }
  .frow { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .flabel { color: var(--dim); font-size: 11px; text-transform: uppercase; letter-spacing: .8px; width: 52px; }
  .chip {
    border: 1px solid var(--line); background: var(--chrome2); color: var(--txt);
    border-radius: 999px; padding: 4px 11px; font-size: 12.5px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 7px;
  }
  .chip:hover { border-color: var(--accent); }
  .chip.on { background: var(--accent); border-color: var(--accent); color: #1a1426; font-weight: 600; }
  .sw { width: 12px; height: 12px; border-radius: 3px; border: 1px solid rgba(255,255,255,.35); display: inline-block; }
  main { padding: 20px; max-width: 1280px; margin: 0 auto; }
  h2 { font-size: 15px; margin: 26px 0 4px; }
  .hsub { color: var(--dim); font-size: 12.5px; margin: 0 0 14px; }
  .platforms { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 10px; margin-top: 14px; }
  .pcard { background: var(--chrome2); border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; }
  .pcard b { font-size: 13px; } .pcard code { color: var(--accent); font-size: 11.5px; display: block; margin: 4px 0; word-break: break-all; }
  .pcard span { color: var(--dim); font-size: 12px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); gap: 12px; }
  .card { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
  .card .stage { padding: 16px 14px 12px; display: flex; align-items: flex-end; justify-content: center; gap: 18px; }
  .card .stage figure { margin: 0; text-align: center; }
  .card .stage figcaption { font-size: 10.5px; opacity: .75; margin-top: 6px; }
  .card .meta { background: var(--chrome2); padding: 10px 12px 12px; border-top: 1px solid var(--line); }
  .tname { font-weight: 650; font-size: 13px; display: flex; align-items: center; gap: 8px; }
  .hexes { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0 10px; }
  .hex { font-size: 10.5px; font-family: ui-monospace, "SF Mono", Menlo, monospace; color: var(--dim);
         border: 1px solid var(--line); border-radius: 6px; padding: 2px 6px; display: inline-flex; gap: 5px; align-items: center; }
  .dl { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  button.dlb, .dlb {
    border: 1px solid var(--line); background: #252832; color: var(--txt);
    border-radius: 8px; padding: 5px 10px; font-size: 12px; cursor: pointer;
  }
  button.dlb:hover { border-color: var(--accent); color: var(--accent); }
  select {
    background: #252832; color: var(--txt); border: 1px solid var(--line);
    border-radius: 8px; padding: 4px 6px; font-size: 12px;
  }
  .anim-block { margin-bottom: 22px; }
  .anim-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
  .anim-head h3 { margin: 0; font-size: 14px; }
  .anim-head .desc { color: var(--dim); font-size: 12.5px; }
  .anim-head .note { color: #d8b45c; font-size: 11.5px; }
  .agrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); gap: 10px; }
  .acell { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  .acell .stage { padding: 14px; display: flex; justify-content: center; }
  .acell img { width: 64px; height: 64px; }
  .acell .meta { background: var(--chrome2); border-top: 1px solid var(--line); padding: 7px 9px;
                 display: flex; justify-content: space-between; align-items: center; gap: 6px; }
  .acell .meta span { font-size: 11px; color: var(--dim); }
  footer { border-top: 1px solid var(--line); margin-top: 30px; padding: 18px 20px 30px; color: var(--dim); font-size: 12.5px; }
  footer code { color: var(--accent); }
  footer p { max-width: 900px; }
  .hidden { display: none !important; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
</style>
</head>
<body>
<header>
  <div class="hrow">
    <img id="hdrLogo" alt="Puppet Master loading logo (animated)">
    <div>
      <h1>Puppet Master — Icon &amp; Loading Logo Suite<span class="kimi-badge">Kimi</span></h1>
      <div class="sub">8 themes × 6 loading animations · SVG + PNG (16–1024) + ICO + ICNS · app, tray &amp; loading, cross-platform</div>
    </div>
  </div>
  <div class="filters">
    <div class="frow" id="themeTabs"><span class="flabel">Theme</span></div>
    <div class="frow" id="styleChips"><span class="flabel">Motion</span></div>
  </div>
</header>
<main>
  <h2>Where each format goes</h2>
  <p class="hsub">Same mark, four packaging targets. Pick a theme below and download per-platform.</p>
  <div class="platforms" id="platformMap"></div>

  <h2>Static icons — app &amp; tray</h2>
  <p class="hsub">Previews at 64 / 32 / 16 px on each theme's surface color — the 16 px column is the tray-legibility check.</p>
  <div class="grid" id="staticGrid"></div>

  <h2>Animated loading logos</h2>
  <p class="hsub">SMIL animation, runs inside <code>&lt;img&gt;</code> and standalone files — no JS/CSS needed. Live below.</p>
  <div id="animRoot"></div>
</main>
<footer>
  <p><b>Rendering &amp; Slint note.</b> SMIL animates in browsers and <code>&lt;img&gt;</code> tags.
  Slint's renderer (resvg) draws SVGs <b>statically</b> — first frame only, presentation attributes only.
  Every <code>static/*.svg</code> here is Slint-ready (no <code>&lt;style&gt;</code>, no classes).
  For the in-app loading indicator, re-implement motion in Slint itself
  (e.g. a rotation timer on the image — <i>mobile-spin</i> maps 1:1) or swap frames.</p>
  <p><b>Path fidelity.</b> All variants carry the original <code>Pm placeholder 3.svg</code> geometry
  byte-for-byte (source kept in <code>source/pm-logo-original.svg</code>); only the two fills and the badge corner radius change per theme.</p>
  <p><b>Regenerate.</b> <code>python3 tools/build_svgs.py</code> → <code>python3 tools/export_raster.py</code> → <code>python3 tools/build_dashboard.py</code></p>
</footer>
<script>
const DATA = __DATA__;

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const state = { theme: "all", style: "all" };
const urlCache = new Map();

function svgUrl(path) {
  if (!urlCache.has(path)) {
    urlCache.set(path, URL.createObjectURL(new Blob([DATA.svg[path]], { type: "image/svg+xml" })));
  }
  return urlCache.get(path);
}
function b64Bytes(b64) {
  const s = atob(b64), n = s.length, u = new Uint8Array(n);
  for (let i = 0; i < n; i++) u[i] = s.charCodeAt(i);
  return u;
}
function saveBlob(name, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function dlSvg(path, name) {
  saveBlob(name, new Blob([DATA.svg[path]], { type: "image/svg+xml" }));
}
function dlBin(path, name, mime) {
  saveBlob(name, new Blob([b64Bytes(DATA.bin[path])], { type: mime }));
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-dl]");
  if (!b) return;
  const theme = b.dataset.theme;
  if (b.dataset.dl === "svg")  dlSvg(b.dataset.path, b.dataset.path.split("/").pop());
  if (b.dataset.dl === "ico")  dlBin(b.dataset.path, b.dataset.path.split("/").pop(), "image/vnd.microsoft.icon");
  if (b.dataset.dl === "icns") dlBin(b.dataset.path, b.dataset.path.split("/").pop(), "image/icns");
  if (b.dataset.dl === "png") {
    const size = $('.png-size[data-theme="' + theme + '"]', b.closest(".meta")).value;
    dlBin("png/" + theme + "/icon-" + size + ".png", "pm-" + theme + "-icon-" + size + ".png", "image/png");
  }
});

function hexChip(label, color) {
  return '<span class="hex"><span class="sw" style="background:' + color + '"></span>' + label + " " + color + "</span>";
}

function buildFilters() {
  const tt = $("#themeTabs");
  const mkTheme = (id, label, color) => {
    const b = document.createElement("button");
    b.className = "chip" + (id === "all" ? " on" : "");
    b.innerHTML = (color ? '<span class="sw" style="background:' + color + '"></span>' : "") + label;
    b.setAttribute("aria-pressed", id === "all");
    b.onclick = () => { state.theme = id; $$(".chip", tt).forEach(c => { c.classList.remove("on"); c.setAttribute("aria-pressed", "false"); }); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); applyFilter(); };
    tt.appendChild(b);
  };
  mkTheme("all", "All themes");
  DATA.themeOrder.forEach(t => mkTheme(t, t, DATA.themes[t].badge));

  const sc = $("#styleChips");
  const mkStyle = (id, label) => {
    const b = document.createElement("button");
    b.className = "chip" + (id === "all" ? " on" : "");
    b.textContent = label;
    b.setAttribute("aria-pressed", id === "all");
    b.onclick = () => { state.style = id; $$(".chip", sc).forEach(c => { c.classList.remove("on"); c.setAttribute("aria-pressed", "false"); }); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); applyFilter(); };
    sc.appendChild(b);
  };
  mkStyle("all", "All motions");
  DATA.styleOrder.forEach(s => mkStyle(s, DATA.styles[s].label));
}

function buildPlatformMap() {
  $("#platformMap").innerHTML = DATA.platformMap.map(p =>
    '<div class="pcard"><b>' + p[0] + "</b><code>" + p[1] + "</code><span>" + p[2] + "</span></div>"
  ).join("");
}

function buildStatic() {
  const g = $("#staticGrid");
  DATA.themeOrder.forEach(t => {
    const th = DATA.themes[t], rel = "static/icon-" + t + ".svg";
    const card = document.createElement("div");
    card.className = "card"; card.dataset.theme = t;
    const sizes = DATA.pngSizes.map(s => '<option value="' + s + '"' + (s === 256 ? " selected" : "") + ">" + s + "px</option>").join("");
    card.innerHTML =
      '<div class="stage" style="background:' + th.page + ';color:' + th.ink + '">' +
        [64, 32, 16].map(px =>
          "<figure><img data-src=\"" + rel + '" width="' + px + '" height="' + px + '" alt="' + t + " icon at " + px + 'px">' +
          "<figcaption>" + px + (px === 16 ? " tray" : "") + "</figcaption></figure>"
        ).join("") +
      "</div>" +
      '<div class="meta">' +
        '<div class="tname"><span class="sw" style="background:' + th.badge + '"></span>' + t + "</div>" +
        '<div class="hexes">' + hexChip("badge", th.badge) + hexChip("glyph", th.glyph) +
          '<span class="hex">radius ' + th.r + "</span></div>" +
        '<div class="dl">' +
          '<button class="dlb" data-dl="svg" data-path="' + rel + '">SVG</button>' +
          '<select class="png-size" data-theme="' + t + '" title="PNG size">' + sizes + "</select>" +
          '<button class="dlb" data-dl="png" data-theme="' + t + '">PNG</button>' +
          '<button class="dlb" data-dl="ico" data-path="ico/icon-' + t + '.ico" title="Windows app + tray">ICO</button>' +
          '<button class="dlb" data-dl="icns" data-path="icns/icon-' + t + '.icns" title="macOS app icon">ICNS</button>' +
        "</div>" +
      "</div>";
    g.appendChild(card);
  });
}

function buildAnimated() {
  const root = $("#animRoot");
  DATA.styleOrder.forEach(s => {
    const st = DATA.styles[s];
    const block = document.createElement("section");
    block.className = "anim-block"; block.dataset.style = s;
    let cells = "";
    DATA.themeOrder.forEach(t => {
      const th = DATA.themes[t], rel = "animated/" + s + "-" + t + ".svg";
      cells +=
        '<div class="acell" data-theme="' + t + '">' +
          '<div class="stage" style="background:' + th.page + '"><img data-src="' + rel + '" alt="' + st.label + " — " + t + '"></div>' +
          '<div class="meta"><span>' + t + '</span><button class="dlb" data-dl="svg" data-path="' + rel + '">SVG</button></div>' +
        "</div>";
    });
    block.innerHTML =
      '<div class="anim-head"><h3>' + st.label + '</h3><span class="desc">' + st.desc + "</span>" +
      '<span class="note">' + (DATA.styleNotes[s] || "") + "</span></div>" +
      '<div class="agrid">' + cells + "</div>";
    root.appendChild(block);
  });
}

function applyFilter() {
  $$("#staticGrid [data-theme]").forEach(el => el.classList.toggle("hidden", state.theme !== "all" && el.dataset.theme !== state.theme));
  $$(".anim-block").forEach(block => {
    block.classList.toggle("hidden", state.style !== "all" && block.dataset.style !== state.style);
    $$("[data-theme]", block).forEach(cell => cell.classList.toggle("hidden", state.theme !== "all" && cell.dataset.theme !== state.theme));
  });
}

// Assign Blob URLs after DOM build so SMIL starts once, in <img> contexts.
function hydratePreviews() {
  $("#hdrLogo").src = svgUrl("animated/puppet-sway-glass-dark.svg");
  $$("img[data-src]").forEach(img => { img.src = svgUrl(img.dataset.src); });
}

buildFilters();
buildPlatformMap();
buildStatic();
buildAnimated();
applyFilter();
hydratePreviews();
</script>
</body>
</html>
"""


def main():
    payload = collect()
    data_json = json.dumps(payload, separators=(",", ":")).replace("</", "<\\/")
    html = TEMPLATE.replace("__DATA__", data_json, 1)
    assert "__DATA__" not in html
    OUT.write_text(html, encoding="utf-8")
    kb = OUT.stat().st_size / 1024
    print(f"OK: wrote {OUT.name} ({kb:.0f} KiB, {len(payload['svg'])} SVGs + {len(payload['bin'])} binaries embedded)")


if __name__ == "__main__":
    main()
