#!/usr/bin/env python3
"""Qwenicon build script (round 2).

Generates the Puppet Master logo kit from the placeholder logo
("Pm placeholder 3.svg"):

  static/pm-icon-<theme>.svg    -- 8 theme-matched static icons.
                                   Presentation-attribute fills only
                                   (NO <style>/CSS) so they render in
                                   Slint 1.17's resvg-based SVG backend
                                   and in any browser.
  static/pm-icon-original.svg   -- untouched original for reference.
  loading/pm-loader-<theme>.svg -- that theme's default animation.
                                   CSS-animated, for web use (resvg is a
                                   static renderer; in Slint the motion
                                   is driven natively, see slint/).
  slint/pm-loading-icon.slint   -- Slint-native loading component.
  index.html                    -- dashboard: any of 8 animations x any
                                   of 8 themes (64 combos) downloadable,
                                   plus tray/app-icon exports.

Re-run any time: python3 build.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# --------------------------------------------------------------------
# Glyph geometry (verified byte-identical to "Pm placeholder 3.svg")
# --------------------------------------------------------------------
MARK_L = ("M9.34,28.55c0,.19-.03.34-.1.43-.07.09-.17.16-.31.21.14.05.24.13.31.26"
          ".07.12.1.25.1.38v1.73c0,.13,0,.23.03.31.02.08.04.14.08.19.03.05.08.08"
          ".13.1.05.02.12.03.19.04.13.02.23.08.3.16s.11.2.11.34c0,.15-.05.27-.14"
          ".36s-.21.14-.37.14c-.25,0-.47-.02-.65-.06-.19-.04-.34-.12-.47-.22-.12"
          "-.1-.22-.25-.28-.43-.06-.18-.1-.42-.1-.7v-1.62c0-.15-.02-.25-.07-.32"
          "-.05-.07-.13-.11-.24-.13-.14-.02-.25-.08-.32-.17s-.11-.21-.11-.37c0"
          "-.13.04-.25.11-.34.07-.09.18-.15.31-.17.12-.02.2-.06.25-.14.05-.07.08"
          "-.18.08-.33v-1.62c0-.3.03-.54.1-.72s.17-.33.29-.43.28-.17.47-.21c.19"
          "-.04.39-.05.62-.05.16,0,.29.04.38.13.09.09.14.21.14.37,0,.14-.04.25"
          "-.11.34-.08.09-.18.14-.31.16-.07,0-.13.02-.19.04-.05.02-.09.06-.13.1"
          "-.03.05-.06.11-.08.19-.02.08-.03.18-.03.31v1.73Z")

LETTER_M = ("M26.38,32.54l3.13-6.67c.16-.34.35-.59.59-.74.23-.15.5-.22.79-.22"
            ".48,0,.84.14,1.1.42s.38.65.38,1.1v10.3c0,.38-.11.68-.34.89-.23.21"
            "-.53.32-.91.32s-.66-.11-.88-.32-.33-.51-.33-.89v-7l-2.34,4.92c-.15"
            ".32-.32.54-.52.65s-.42.17-.68.17-.49-.06-.69-.17-.38-.34-.52-.65"
            "l-2.3-4.86v6.94c0,.38-.11.68-.33.89s-.52.32-.9.32-.66-.11-.88-.32"
            "-.33-.51-.33-.89v-10.3c0-.45.12-.82.37-1.1.24-.28.61-.42,1.09-.42"
            ".3,0,.56.07.79.22s.44.39.61.74l3.13,6.67Z")

P_OUTER = ("M12.93,36.25c-.55,0-1-.16-1.32-.48-.33-.33-.5-.75-.5-1.27v-10.37c0"
           "-.52.16-.94.49-1.27.32-.32.75-.49,1.26-.49h3.3c.78,0,1.49.09,2.12"
           ".28.65.19,1.21.48,1.67.86.47.38.84.87,1.09,1.45.25.56.38,1.23.38,"
           "1.99,0,1.5-.49,2.67-1.45,3.48-.94.79-2.21,1.19-3.8,1.19h-1.47v2.89"
           "c0,.52-.16.94-.49,1.27-.32.32-.75.49-1.26.49ZM15.79,28.44c.76,0,1.33"
           "-.13,1.63-.37.28-.22.41-.59.41-1.12,0-.46-.13-.79-.41-1.01-.3-.24"
           "-.87-.37-1.63-.37h-1.1v2.87h1.1Z")

# Knockout detail inside the "P" -- must match the tile color on tiled
# icons; on glyph-only/tray silhouettes it merges into the glyph color.
P_KNOCK = ("M16.15,22.88c.74,0,1.4.09,1.98.26.58.17,1.08.43,1.49.76.41.34.73.76"
           ".95,1.26.22.5.33,1.1.33,1.79,0,1.35-.42,2.38-1.27,3.09-.85.71-2.01,"
           "1.07-3.48,1.07h-1.97v3.39c0,.38-.11.68-.34.91-.23.23-.53.34-.91.34"
           "-.42,0-.74-.11-.98-.34-.23-.23-.35-.53-.35-.91v-10.37c0-.38.11-.68"
           ".34-.91.23-.23.53-.34.91-.34h3.3M14.18,28.94h1.6c.9,0,1.54-.16,1.94"
           "-.48.4-.32.6-.82.6-1.51,0-.61-.2-1.08-.6-1.4-.4-.32-1.05-.48-1.94"
           "-.48h-1.6v3.87M16.15,21.88h-3.3c-.65,0-1.21.22-1.62.64-.29.28-.63.8"
           "-.63,1.62v10.37c0,.65.23,1.21.65,1.63.29.29.82.63,1.68.63.64,0,1.2"
           "-.22,1.62-.63.29-.29.63-.81.63-1.62v-2.39h.97c1.71,0,3.09-.44,4.12"
           "-1.3,1.08-.91,1.63-2.21,1.63-3.86,0-.82-.14-1.56-.42-2.19-.28-.65"
           "-.7-1.2-1.23-1.63-.51-.42-1.13-.74-1.84-.95-.67-.2-1.43-.3-2.26-.3"
           "h0ZM15.18,26.07h.6c.9,0,1.22.18,1.32.26.07.05.22.18.22.62,0,.36-.08"
           ".61-.22.73-.1.08-.42.26-1.32.26h-.6v-1.87h0Z")

HANDLE_L = ("M16.87,14.44l3.89,1.72-12.34,5.47c-.4.18-.87.18-1.27,0-.63-.28-.94"
            "-.86-.94-1.44s.31-1.16.94-1.44l9.72-4.31Z")

HANDLE_R = ("M37.76,7.6c0,.58-.31,1.16-.93,1.44l-9.73,4.31-3.88-1.72,12.33-5.47"
            "c.41-.18.87-.18,1.28,0,.62.27.93.85.93,1.44Z")

BAR = ("M36.83,21.63c-.21.09-.43.13-.64.13s-.44-.04-.64-.13l-13.56-6.01-3.89"
       "-1.72-10.95-4.86c-1.25-.56-1.25-2.33,0-2.88.2-.09.42-.13.64-.13s.43.04"
       ".63.13l13.57,6.01,3.88,1.73,10.96,4.85c1.24.55,1.24,2.32,0,2.88Z")

MARK_R = ("M34.64,29.01c0-.13,0-.23-.03-.31-.02-.08-.04-.14-.08-.19-.03-.05-.08"
          "-.08-.13-.1-.05-.02-.11-.04-.19-.04-.13-.02-.23-.08-.31-.16-.08-.08"
          "-.11-.2-.11-.34,0-.16.05-.29.14-.37.09-.08.22-.13.38-.13.22,0,.43.02"
          ".62.05.19.04.34.11.47.21s.22.25.29.43.1.42.1.72v1.62c0,.15.03.26.08"
          ".33.05.07.14.12.25.14.13.02.24.08.31.17.07.09.11.2.11.34s-.04.27-.11"
          ".37-.18.15-.32.17c-.11.02-.19.06-.24.13-.05.07-.07.18-.07.32v1.62c0,"
          ".29-.03.52-.1.7-.06.18-.16.33-.28.43-.13.1-.28.18-.47.22-.19.04-.4"
          ".06-.65.06-.15,0-.27-.05-.37-.14s-.14-.21-.14-.36.04-.25.11-.34.17"
          "-.14.3-.16c.07,0,.14-.02.19-.04.05-.02.1-.06.13-.1.03-.05.06-.11.08"
          "-.19.02-.08.03-.18.03-.31v-1.73c0-.13.03-.26.1-.38.07-.12.17-.21.31"
          "-.26-.14-.05-.24-.12-.31-.21-.07-.09-.1-.23-.1-.43v-1.73Z")

STRING_R = dict(x="28.85", y="16.28", h="12.18")
STRING_L = dict(x="14.42", y="15.6", h="8.59")

PARTS = dict(mark_l=MARK_L, letter_m=LETTER_M, p_outer=P_OUTER, p_knock=P_KNOCK,
             handle_l=HANDLE_L, handle_r=HANDLE_R, bar=BAR, mark_r=MARK_R,
             string_r=STRING_R, string_l=STRING_L)


def glyph_body(g, tile, ids=False):
    """Glyph markup with presentation-attribute fills (resvg-safe)."""
    i = (lambda n: f' id="{n}"') if ids else (lambda n: "")
    return (
        f'<path{i("mark-l")} fill="{g}" d="{MARK_L}"/>'
        f'<path{i("letter-m")} fill="{g}" d="{LETTER_M}"/>'
        f'<g{i("letter-p")}>'
        f'<path fill="{g}" d="{P_OUTER}"/>'
        f'<path fill="{tile}" d="{P_KNOCK}"/>'
        f"</g>"
        f'<path{i("handle-l")} fill="{g}" d="{HANDLE_L}"/>'
        f'<path{i("handle-r")} fill="{g}" d="{HANDLE_R}"/>'
        f'<path{i("bar")} fill="{g}" d="{BAR}"/>'
        f'<g{i("strings")}>'
        f'<rect{i("string-r")} fill="{g}" x="{STRING_R["x"]}" y="{STRING_R["y"]}" width=".97" height="{STRING_R["h"]}" rx=".48" ry=".48"/>'
        f'<rect{i("string-l")} fill="{g}" x="{STRING_L["x"]}" y="{STRING_L["y"]}" width=".97" height="{STRING_L["h"]}" rx=".48" ry=".48"/>'
        f"</g>"
        f'<path{i("mark-r")} fill="{g}" d="{MARK_R}"/>'
    )


def tile_rect(t, ids=False):
    i = ' id="tile"' if ids else ""
    if t.get("hairline"):
        # Inset so the 1u stroke sits fully inside the viewBox (crisp edge).
        return (f'<rect{i} x=".5" y=".5" width="42.2" height="42.2" fill="{t["tile"]}" '
                f'stroke="{t["hairline"]}" stroke-width="1"/>')
    return (f'<rect{i} width="43.2" height="43.2" rx="{t["rx"]}" ry="{t["rx"]}" '
            f'fill="{t["tile"]}"/>')


# --------------------------------------------------------------------
# Themes (colors/radii/motion from Concepts/PMConcept7.html).
# sheen = sweep color used when the "Sheen sweep" animation runs on
#         this theme (light on dark tiles, ink on light tiles).
# anim  = default animation paired with this theme on disk.
# --------------------------------------------------------------------
THEMES = [
    dict(id="retro-dark", name="Retro Dark", tile="#1A1A1A", glyph="#00FF41",
         rx="0", chip="#1A1A1A", hairline=None, sheen="#E0E0E0", anim="blink"),
    dict(id="retro-light", name="Retro Light", tile="#F5F0E8", glyph="#0047AB",
         rx="0", chip="#F5F0E8", hairline="#4A463F", sheen="#0047AB", anim="march"),
    dict(id="basic-light", name="Basic Light", tile="#FFFFFF", glyph="#0056B3",
         rx="1.7", chip="#EAECEF", hairline=None, sheen="#0056B3", anim="breathe"),
    dict(id="basic-dark", name="Basic Dark", tile="#1E1E1E", glyph="#64B5F6",
         rx="1.7", chip="#121212", hairline=None, sheen="#64B5F6", anim="draw"),
    dict(id="glass-dark", name="Glass Dark", tile="#2E2248", glyph="#B79CFF",
         rx="6.29", chip="#241B36", hairline=None, sheen="#EDE7F8", anim="sheen"),
    dict(id="glass-light", name="Glass Light", tile="#F6F0FF", glyph="#8B6ED9",
         rx="6.29", chip="#E4CDE4", hairline=None, sheen="#8B6ED9", anim="float"),
    dict(id="friendly-dark", name="Friendly Dark", tile="#2A2731", glyph="#6FC6E8",
         rx="6.29", chip="#211E26", hairline=None, sheen="#F0EDF4", anim="sway"),
    dict(id="friendly-light", name="Friendly Light", tile="#FFFFFF", glyph="#3F9CC7",
         rx="6.29", chip="#FBF7F3", hairline=None, sheen="#3F9CC7", anim="hop"),
]

ORIGINAL = dict(id="original", name="Original", tile="#465ba9", glyph="#b6c0dc",
                rx="6.29", chip="#211E26", hairline=None, sheen="#FFFFFF", anim="breathe")


def static_svg(t):
    """Static icon. Attribute fills only -- no CSS, so it renders in
    Slint's resvg backend, in browsers, and in any SVG tool."""
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.2 43.2">\n'
        f"  {tile_rect(t)}\n"
        f"  {glyph_body(t['glyph'], t['tile'])}\n"
        "</svg>\n"
    )


# --------------------------------------------------------------------
# Animations (theme-agnostic; colors come from the theme at build time)
# --------------------------------------------------------------------
ANIMS = [
    dict(id="blink", name="Terminal blink",
         desc="Control bar and strings hard-blink in stepped frames — snap motion, no easing.",
         css="""
#bar,#handle-l,#handle-r,#string-l,#string-r{animation:qw-blink 1.2s steps(1,end) infinite}
#string-l{animation-delay:.2s}
#string-r{animation-delay:.4s}
@keyframes qw-blink{0%{opacity:1}45%{opacity:0}85%{opacity:1}}
"""),
    dict(id="march", name="Signal march",
         desc="A stepped pulse marches left to right across the marks and strings, hard offsets.",
         css="""
#mark-l,#string-l,#string-r,#mark-r{animation:qw-march 1.6s steps(1,end) infinite}
#string-l{animation-delay:.4s}
#string-r{animation-delay:.8s}
#mark-r{animation-delay:1.2s}
@keyframes qw-march{0%{opacity:1}25%{opacity:.25}}
"""),
    dict(id="breathe", name="Breathing",
         desc="Calm whole-glyph opacity and scale pulse, smooth ease-in-out.",
         css="""
#glyph{transform-box:view-box;transform-origin:21.6px 21.6px;animation:qw-breathe 2.4s ease-in-out infinite}
@keyframes qw-breathe{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.96)}}
"""),
    dict(id="draw", name="Draw-on",
         desc="Bar, handles and strings trace on left to right, hold, then fade and redraw.",
         css="""
#bar,#handle-l,#handle-r,#string-l,#string-r{animation:qw-draw 2.6s cubic-bezier(.4,0,.2,1) infinite}
#string-l{animation-delay:.2s}
#string-r{animation-delay:.3s}
@keyframes qw-draw{
  0%{clip-path:inset(-3px 100% -3px -3px);opacity:1}
  45%{clip-path:inset(-3px -3px -3px -3px);opacity:1}
  80%{clip-path:inset(-3px -3px -3px -3px);opacity:1}
  92%,100%{clip-path:inset(-3px -3px -3px -3px);opacity:0}
}
"""),
    dict(id="sheen", name="Sheen sweep",
         desc="A diagonal light sheen sweeps across the tile — the glass theme's signature move.",
         css="""
#sheen-band{animation:qw-sheen 2.8s cubic-bezier(.45,.05,.35,1) infinite}
@keyframes qw-sheen{0%{transform:translateX(-22px)}38%,100%{transform:translateX(58px)}}
"""),
    dict(id="float", name="Float",
         desc="The glyph bobs gently while a soft blurred glow breathes underneath.",
         css="""
#glyph{animation:qw-float 3s ease-in-out infinite}
@keyframes qw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.2px)}}
#glow{animation:qw-glow 3s ease-in-out infinite}
@keyframes qw-glow{0%,100%{opacity:.18}50%{opacity:.6}}
"""),
    dict(id="sway", name="Puppet sway",
         desc="The control bar rocks like a pendulum with springy overshoot; the strings follow.",
         css="""
#bar,#handle-l,#handle-r{transform-box:view-box;transform-origin:22.3px 15.3px;animation:qw-sway 1.8s cubic-bezier(.45,.05,.55,.95) infinite}
@keyframes qw-sway{0%,100%{transform:rotate(0deg)}25%{transform:rotate(5.5deg)}52%{transform:rotate(-4deg)}76%{transform:rotate(2deg)}}
#string-l,#string-r{transform-box:fill-box;transform-origin:50% 0%;animation:qw-string 1.8s cubic-bezier(.45,.05,.55,.95) .08s infinite}
@keyframes qw-string{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-4deg)}52%{transform:rotate(3deg)}76%{transform:rotate(-1.5deg)}}
"""),
    dict(id="hop", name="Letter hop",
         desc="P and M take turns bouncing with a spring overshoot; the side marks dip along.",
         css="""
#letter-p,#letter-m{animation:qw-hop 1.5s cubic-bezier(.36,.07,.19,.97) infinite}
#letter-m{animation-delay:.75s}
@keyframes qw-hop{0%,55%,100%{transform:translateY(0)}22%{transform:translateY(-2.3px)}38%{transform:translateY(.5px)}}
#mark-l,#mark-r{animation:qw-dip 1.5s ease-in-out infinite}
@keyframes qw-dip{0%,55%,100%{transform:translateY(0)}25%{transform:translateY(.6px)}}
"""),
]


def extra_defs(t, anim_id):
    if anim_id == "sheen":
        return (
            '<clipPath id="tile-clip">'
            f'<rect width="43.2" height="43.2" rx="{t["rx"]}" ry="{t["rx"]}"/>'
            "</clipPath>"
            '<linearGradient id="qw-sheen-grad" x1="0" y1="0" x2="1" y2="0">'
            '<stop offset="0" stop-color="#fff" stop-opacity="0"/>'
            f'<stop offset=".5" stop-color="{t["sheen"]}" stop-opacity=".34"/>'
            '<stop offset="1" stop-color="#fff" stop-opacity="0"/>'
            "</linearGradient>"
        )
    if anim_id == "float":
        return ('<filter id="qw-soft" x="-40%" y="-40%" width="180%" height="180%">'
                '<feGaussianBlur stdDeviation="1.3"/></filter>')
    return ""


def pre_glyph(t, anim_id):
    if anim_id == "float":
        return (f'<g id="glow" filter="url(#qw-soft)" opacity=".18">'
                f'<path fill="{t["glyph"]}" d="{BAR}"/>'
                f'<rect fill="{t["glyph"]}" x="{STRING_R["x"]}" y="{STRING_R["y"]}" width=".97" height="{STRING_R["h"]}" rx=".48" ry=".48"/>'
                f'<rect fill="{t["glyph"]}" x="{STRING_L["x"]}" y="{STRING_L["y"]}" width=".97" height="{STRING_L["h"]}" rx=".48" ry=".48"/>'
                f"</g>")
    return ""


def post_glyph(t, anim_id):
    if anim_id == "sheen":
        return ('<g clip-path="url(#tile-clip)">'
                '<path id="sheen-band" d="M8,-4 L18,-4 L10,48 L0,48 Z" '
                'fill="url(#qw-sheen-grad)" transform="translate(-22,0)"/>'
                "</g>")
    return ""


def loader_svg(t, a):
    """Animated loader (web). CSS animation embedded; colors from theme."""
    defs = extra_defs(t, a["id"])
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.2 43.2">\n'
        f"  <defs><style>{a['css'].strip()}</style>{defs}</defs>\n"
        f"  {tile_rect(t, ids=True)}\n"
        f"  {pre_glyph(t, a['id'])}\n"
        f'  <g id="glyph">{glyph_body(t["glyph"], t["tile"], ids=True)}</g>\n'
        f"  {post_glyph(t, a['id'])}\n"
        "</svg>\n"
    )


def write(path, content):
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(content)
    print(f"  wrote {os.path.relpath(path, HERE)}")


def main():
    static_dir = os.path.join(HERE, "static")
    loading_dir = os.path.join(HERE, "loading")
    os.makedirs(static_dir, exist_ok=True)
    os.makedirs(loading_dir, exist_ok=True)

    anims_by_id = {a["id"]: a for a in ANIMS}

    for t in THEMES:
        write(os.path.join(static_dir, f'pm-icon-{t["id"]}.svg'), static_svg(t))
        write(os.path.join(loading_dir, f'pm-loader-{t["id"]}.svg'),
              loader_svg(t, anims_by_id[t["anim"]]))
    write(os.path.join(static_dir, "pm-icon-original.svg"), static_svg(ORIGINAL))

    # Dashboard data: parts + themes + anims, assembled client-side so any
    # animation x theme combination (and tray/glyph/template variants) can
    # be previewed and downloaded.
    data = json.dumps(dict(parts=PARTS, themes=THEMES, anims=ANIMS,
                           original=dict(tile=ORIGINAL["tile"], glyph=ORIGINAL["glyph"])),
                      ensure_ascii=False)
    data = data.replace("</", "<\\/")
    with open(os.path.join(HERE, "index_template.html"), encoding="utf-8") as fh:
        tpl = fh.read()
    if "__KIT_DATA__" not in tpl:
        raise SystemExit("index_template.html is missing the __KIT_DATA__ marker")
    write(os.path.join(HERE, "index.html"), tpl.replace("__KIT_DATA__", data))
    print("Done. Open Concepts/Qwenicon/index.html to preview.")


if __name__ == "__main__":
    main()
