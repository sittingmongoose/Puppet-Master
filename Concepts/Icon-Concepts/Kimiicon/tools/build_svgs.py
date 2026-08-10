#!/usr/bin/env python3
"""Generate themed + animated Puppet Master logo SVGs.

Source geometry: Concepts/Kimiicon/source/pm-logo-original.svg (user-supplied).
The original two fills are parametrized:
  cls-2 (badge)  -> per-theme badge color
  cls-1 (glyphs) -> per-theme glyph color

Outputs:
  static/icon-{theme}.svg        (8)
  animated/{style}-{theme}.svg   (6 styles x 8 themes = 48)
  manifest.json                  (theme/style metadata for the dashboard builder)

Animations are SMIL (animateTransform / animate) so they run inside <img> tags
and standalone files without JS or CSS.
"""
from pathlib import Path
import json
import xml.dom.minidom

ROOT = Path(__file__).resolve().parent.parent
STATIC_DIR = ROOT / "static"
ANIM_DIR = ROOT / "animated"

# ---------------------------------------------------------------------------
# Theme palette (colors pulled from PMConcept7.html data-theme token blocks)
# badge/glyph = logo fills, r = badge corner radius, page/ink = dashboard card bg
# ---------------------------------------------------------------------------
THEMES = {
    "basic-light":    dict(badge="#0056B3", glyph="#FFFFFF", r=4, page="#EAECEF", ink="#1A1A1A"),
    "basic-dark":     dict(badge="#64B5F6", glyph="#121212", r=4, page="#121212", ink="#E8E8E8"),
    "retro-light":    dict(badge="#0047AB", glyph="#F5F0E8", r=0, page="#F5F0E8", ink="#1A1A1A"),
    "retro-dark":     dict(badge="#00FF41", glyph="#1A1A1A", r=0, page="#1A1A1A", ink="#E0E0E0"),
    "glass-light":    dict(badge="#8B6ED9", glyph="#FFFFFF", r=9, page="#E4CDE4", ink="#453A5C"),
    "glass-dark":     dict(badge="#B79CFF", glyph="#241B36", r=9, page="#241B36", ink="#EDE7F8"),
    "friendly-light": dict(badge="#3F9CC7", glyph="#FFFFFF", r=9, page="#FBF7F3", ink="#4A4550"),
    "friendly-dark":  dict(badge="#6FC6E8", glyph="#211E26", r=9, page="#211E26", ink="#F0EDF4"),
}

# ---------------------------------------------------------------------------
# Original path data (verbatim from pm-logo-original.svg), grouped semantically
# ---------------------------------------------------------------------------
BRACE_L = ("M9.34,28.55c0,.19-.03.34-.1.43-.07.09-.17.16-.31.21.14.05.24.13.31.26.07.12.1.25.1.38v1.73c0,.13,0,.23.03.31"
           ".02.08.04.14.08.19.03.05.08.08.13.1.05.02.12.03.19.04.13.02.23.08.3.16s.11.2.11.34c0,.15-.05.27-.14.36s-.21.14-.37.14"
           "c-.25,0-.47-.02-.65-.06-.19-.04-.34-.12-.47-.22-.12-.1-.22-.25-.28-.43-.06-.18-.1-.42-.1-.7v-1.62c0-.15-.02-.25-.07-.32"
           "-.05-.07-.13-.11-.24-.13-.14-.02-.25-.08-.32-.17s-.11-.21-.11-.37c0-.13.04-.25.11-.34.07-.09.18-.15.31-.17.12-.02.2-.06"
           ".25-.14.05-.07.08-.18.08-.33v-1.62c0-.3.03-.54.1-.72s.17-.33.29-.43.28-.17.47-.21c.19-.04.39-.05.62-.05.16,0,.29.04.38.13"
           ".09.09.14.21.14.37,0,.14-.04.25-.11.34-.08.09-.18.14-.31.16-.07,0-.13.02-.19.04-.05.02-.09.06-.13.1-.03.05-.06.11-.08.19"
           "-.02.08-.03.18-.03.31v1.73Z")

M_LETTER = ("M26.38,32.54l3.13-6.67c.16-.34.35-.59.59-.74.23-.15.5-.22.79-.22.48,0,.84.14,1.1.42s.38.65.38,1.1v10.3c0,.38-.11.68-.34.89"
            "-.23.21-.53.32-.91.32s-.66-.11-.88-.32-.33-.51-.33-.89v-7l-2.34,4.92c-.15.32-.32.54-.52.65s-.42.17-.68.17-.49-.06-.69-.17"
            "-.38-.34-.52-.65l-2.3-4.86v6.94c0,.38-.11.68-.33.89s-.52.32-.9.32-.66-.11-.88-.32-.33-.51-.33-.89v-10.3c0-.45.12-.82.37-1.1"
            ".24-.28.61-.42,1.09-.42.3,0,.56.07.79.22s.44.39.61.74l3.13,6.67Z")

P_FILL = ("M12.93,36.25c-.55,0-1-.16-1.32-.48-.33-.33-.5-.75-.5-1.27v-10.37c0-.52.16-.94.49-1.27.32-.32.75-.49,1.26-.49h3.3c.78,0,1.49.09"
          ",2.12.28.65.19,1.21.48,1.67.86.47.38.84.87,1.09,1.45.25.56.38,1.23.38,1.99,0,1.5-.49,2.67-1.45,3.48-.94.79-2.21,1.19-3.8,1.19"
          "h-1.47v2.89c0,.52-.16.94-.49,1.27-.32.32-.75.49-1.26.49ZM15.79,28.44c.76,0,1.33-.13,1.63-.37.28-.22.41-.59.41-1.12,0-.46-.13-.79"
          "-.41-1.01-.3-.24-.87-.37-1.63-.37h-1.1v2.87h1.1Z")

# This path used cls-2 (badge color) in the original - an overprinted P detail.
P_BADGE = ("M16.15,22.88c.74,0,1.4.09,1.98.26.58.17,1.08.43,1.49.76.41.34.73.76.95,1.26.22.5.33,1.1.33,1.79,0,1.35-.42,2.38-1.27,3.09"
           "-.85.71-2.01,1.07-3.48,1.07h-1.97v3.39c0,.38-.11.68-.34.91-.23.23-.53.34-.91.34-.42,0-.74-.11-.98-.34-.23-.23-.35-.53-.35-.91"
           "v-10.37c0-.38.11-.68.34-.91.23-.23.53-.34.91-.34h3.3M14.18,28.94h1.6c.9,0,1.54-.16,1.94-.48.4-.32.6-.82.6-1.51,0-.61-.2-1.08"
           "-.6-1.4-.4-.32-1.05-.48-1.94-.48h-1.6v3.87M16.15,21.88h-3.3c-.65,0-1.21.22-1.62.64-.29.28-.63.8-.63,1.62v10.37c0,.65.23,1.21"
           ".65,1.63.29.29.82.63,1.68.63.64,0,1.2-.22,1.62-.63.29-.29.63-.81.63-1.62v-2.39h.97c1.71,0,3.09-.44,4.12-1.3,1.08-.91,1.63-2.21"
           ",1.63-3.86,0-.82-.14-1.56-.42-2.19-.28-.65-.7-1.2-1.23-1.63-.51-.42-1.13-.74-1.84-.95-.67-.2-1.43-.3-2.26-.3h0ZM15.18,26.07h.6"
           "c.9,0,1.22.18,1.32.26.07.05.22.18.22.62,0,.36-.08.61-.22.73-.1.08-.42.26-1.32.26h-.6v-1.87h0Z")

BAR_A = ("M16.87,14.44l3.89,1.72-12.34,5.47c-.4.18-.87.18-1.27,0-.63-.28-.94-.86-.94-1.44s.31-1.16.94-1.44l9.72-4.31Z")
BAR_B = ("M37.76,7.6c0,.58-.31,1.16-.93,1.44l-9.73,4.31-3.88-1.72,12.33-5.47c.41-.18.87-.18,1.28,0,.62.27.93.85.93,1.44Z")
BAR_MAIN = ("M36.83,21.63c-.21.09-.43.13-.64.13s-.44-.04-.64-.13l-13.56-6.01-3.89-1.72-10.95-4.86c-1.25-.56-1.25-2.33,0-2.88.2-.09.42-.13"
            ".64-.13s.43.04.63.13l13.57,6.01,3.88,1.73,10.96,4.85c1.24.55,1.24,2.32,0,2.88Z")

STRING_L = '<rect x="14.42" y="15.6" width=".97" height="8.59" rx=".48" ry=".48"/>'
STRING_R = '<rect x="28.85" y="16.28" width=".97" height="12.18" rx=".48" ry=".48"/>'

BRACE_R = ("M34.64,29.01c0-.13,0-.23-.03-.31-.02-.08-.04-.14-.08-.19-.03-.05-.08-.08-.13-.1-.05-.02-.11-.04-.19-.04-.13-.02-.23-.08-.31-.16"
           "-.08-.08-.11-.2-.11-.34,0-.16.05-.29.14-.37.09-.08.22-.13.38-.13.22,0,.43.02.62.05.19.04.34.11.47.21s.22.25.29.43.1.42.1.72v1.62"
           "c0,.15.03.26.08.33.05.07.14.12.25.14.13.02.24.08.31.17.07.09.11.2.11.34s-.04.27-.11.37-.18.15-.32.17c-.11.02-.19.06-.24.13"
           "-.05.07-.07.18-.07.32v1.62c0,.29-.03.52-.1.7-.06.18-.16.33-.28.43-.13.1-.28.18-.47.22-.19.04-.4.06-.65.06-.15,0-.27-.05-.37-.14"
           "s-.14-.21-.14-.36.04-.25.11-.34.17-.14.3-.16c.07,0,.14-.02.19-.04.05-.02.1-.06.13-.1.03-.05.06-.11.08-.19.02-.08.03-.18.03-.31"
           "v-1.73c0-.13.03-.26.1-.38.07-.12.17-.21.31-.26-.14-.05-.24-.12-.31-.21-.07-.09-.1-.23-.1-.43v-1.73Z")

# Geometry anchors (estimated centers / pivot points in the 43.2 viewBox)
C_BAR = (22.0, 14.0)       # control-bar center
C_PM = (22.0, 29.4)        # PM letters center
C_BL = (9.4, 29.2)         # left brace center
C_BR = (34.9, 29.2)        # right brace center
TOP_SL = (14.9, 15.6)      # left string top attach
TOP_SR = (29.3, 16.3)      # right string top attach
C_ASSEMBLY = (22.0, 19.0)  # hanging-assembly spin center

IN_OUT = "0.45 0 0.55 1"


def svg_wrap(title, body, defs=""):
    defs_block = f"<defs>{defs}</defs>" if defs else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="43.2" height="43.2" viewBox="0 0 43.2 43.2">'
            f'<title>{title}</title>{defs_block}{body}</svg>')


def badge_rect(t, extra=""):
    r = t["r"]
    return (f'<rect fill="{t["badge"]}" width="43.2" height="43.2" rx="{r}" ry="{r}"{extra}/>')


def bar_paths():
    return f'<path d="{BAR_A}"/><path d="{BAR_B}"/><path d="{BAR_MAIN}"/>'


def pm_paths(t):
    return (f'<path d="{M_LETTER}"/><path d="{P_FILL}"/>'
            f'<path fill="{t["badge"]}" d="{P_BADGE}"/>')


def marionette_paths(t):
    return f'<path d="{BRACE_L}"/>{pm_paths(t)}<path d="{BRACE_R}"/>'


# ---------------------------------------------------------------------------
# Static icon
# ---------------------------------------------------------------------------
def static_svg(t):
    body = (
        badge_rect(t)
        + f'<g fill="{t["glyph"]}">'
        + bar_paths()
        + f'<g>{STRING_R}{STRING_L}</g>'
        + marionette_paths(t)
        + '</g>'
    )
    return svg_wrap("Puppet Master icon", body)


# ---------------------------------------------------------------------------
# Animated styles
# ---------------------------------------------------------------------------
def anim_puppet_sway(t):
    """Control bar rocks; strings pendulum out of phase; marionette bobs."""
    dur = "2.4s"
    spl = f'calcMode="spline" keySplines="{IN_OUT};{IN_OUT}"'
    bar = (f'<g fill="{t["glyph"]}">'
           f'<animateTransform attributeName="transform" type="rotate" values="-4 {C_BAR[0]} {C_BAR[1]};'
           f'4 {C_BAR[0]} {C_BAR[1]};-4 {C_BAR[0]} {C_BAR[1]}" keyTimes="0;0.5;1" {spl} dur="{dur}" repeatCount="indefinite"/>'
           f'{bar_paths()}</g>')

    def string(rect, top, vals, begin):
        return (f'<g fill="{t["glyph"]}">'
                f'<animateTransform attributeName="transform" type="rotate" values="{vals}" keyTimes="0;0.5;1" {spl} '
                f'dur="{dur}" begin="{begin}" repeatCount="indefinite"/>{rect}</g>')

    sl = string(STRING_L, TOP_SL, f'7 {TOP_SL[0]} {TOP_SL[1]};-7 {TOP_SL[0]} {TOP_SL[1]};7 {TOP_SL[0]} {TOP_SL[1]}', "-0.35s")
    sr = string(STRING_R, TOP_SR, f'-6 {TOP_SR[0]} {TOP_SR[1]};6 {TOP_SR[0]} {TOP_SR[1]};-6 {TOP_SR[0]} {TOP_SR[1]}', "-0.6s")

    mari = (f'<g fill="{t["glyph"]}">'
            f'<animateTransform attributeName="transform" type="rotate" values="2.2 {C_PM[0]} {C_PM[1]};'
            f'-2.2 {C_PM[0]} {C_PM[1]};2.2 {C_PM[0]} {C_PM[1]}" keyTimes="0;0.5;1" {spl} dur="{dur}" begin="-0.5s" repeatCount="indefinite"/>'
            f'<animateTransform attributeName="transform" additive="sum" type="translate" values="0 0;0 0.9;0 0" '
            f'keyTimes="0;0.5;1" {spl} dur="{dur}" begin="-0.5s" repeatCount="indefinite"/>'
            f'{marionette_paths(t)}</g>')
    return svg_wrap("Loading - puppet sway", badge_rect(t) + bar + sr + sl + mari)


def _scale_wrap(inner, cx, cy, values, dur, begin="0s", extra_anim=""):
    """Scale `inner` around point (cx, cy) via nested translate groups."""
    return (f'<g transform="translate({cx} {cy})"><g>'
            f'<animateTransform attributeName="transform" type="scale" values="{values}" keyTimes="0;0.5;1" '
            f'calcMode="spline" keySplines="{IN_OUT};{IN_OUT}" dur="{dur}" begin="{begin}" repeatCount="indefinite"/>{extra_anim}'
            f'<g transform="translate({-cx} {-cy})">{inner}</g></g></g>')


def anim_breathe(t):
    """Braces grow/shrink (breathing), PM counter-pulses, strings stretch, soft glow."""
    dur = "2.8s"
    spl = f'calcMode="spline" keySplines="{IN_OUT};{IN_OUT}"'
    glow = (f'<rect width="43.2" height="43.2" rx="{t["r"]}" ry="{t["r"]}" fill="{t["glyph"]}" opacity="0">'
            f'<animate attributeName="opacity" values="0;0.12;0" keyTimes="0;0.5;1" {spl} dur="{dur}" repeatCount="indefinite"/></rect>')
    bar = (f'<g fill="{t["glyph"]}">'
           f'<animateTransform attributeName="transform" type="rotate" values="-1.2 {C_BAR[0]} {C_BAR[1]};'
           f'1.2 {C_BAR[0]} {C_BAR[1]};-1.2 {C_BAR[0]} {C_BAR[1]}" keyTimes="0;0.5;1" {spl} dur="{dur}" repeatCount="indefinite"/>'
           f'{bar_paths()}</g>')
    sl = _scale_wrap(f'<g fill="{t["glyph"]}">{STRING_L}</g>', TOP_SL[0], TOP_SL[1], "1 1;1 1.07;1 1", dur)
    sr = _scale_wrap(f'<g fill="{t["glyph"]}">{STRING_R}</g>', TOP_SR[0], TOP_SR[1], "1 1;1 1.07;1 1", dur)
    bl = _scale_wrap(f'<path fill="{t["glyph"]}" d="{BRACE_L}"/>', C_BL[0], C_BL[1], "1;1.16;1", dur)
    br = _scale_wrap(f'<path fill="{t["glyph"]}" d="{BRACE_R}"/>', C_BR[0], C_BR[1], "1;1.16;1", dur)
    pm = _scale_wrap(f'<g fill="{t["glyph"]}">{pm_paths(t)}</g>', C_PM[0], C_PM[1], "1.05;0.93;1.05", dur)
    return svg_wrap("Loading - breathe", badge_rect(t) + glow + bar + sr + sl + bl + pm + br)


def anim_string_pluck(t):
    """Strings ripple with damped skew oscillation; bar and marionette sympathize."""
    dur = "1.8s"
    spl6 = 'calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1"'
    kt6 = 'keyTimes="0;0.15;0.35;0.55;0.75;1"'
    spl5 = 'calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1"'
    kt5 = 'keyTimes="0;0.2;0.45;0.7;1"'

    def string(rect, top_y, values, begin):
        return (f'<g transform="translate(0 {top_y})"><g fill="{t["glyph"]}">'
                f'<animateTransform attributeName="transform" type="skewX" values="{values}" {kt6} {spl6} '
                f'dur="{dur}" begin="{begin}" repeatCount="indefinite"/>'
                f'<g transform="translate(0 {-top_y})">{rect}</g></g></g>')

    sl = string(STRING_L, TOP_SL[1], "0;7;-5;3;-1.5;0", "0s")
    sr = string(STRING_R, TOP_SR[1], "0;-7;5;-3;1.5;0", "-0.9s")
    bar = (f'<g fill="{t["glyph"]}">'
           f'<animateTransform attributeName="transform" type="rotate" values="0 {C_BAR[0]} {C_BAR[1]};'
           f'1.6 {C_BAR[0]} {C_BAR[1]};-1.2 {C_BAR[0]} {C_BAR[1]};0.7 {C_BAR[0]} {C_BAR[1]};0 {C_BAR[0]} {C_BAR[1]}" '
           f'{kt5} {spl5} dur="0.9s" repeatCount="indefinite"/>{bar_paths()}</g>')
    mari = (f'<g fill="{t["glyph"]}">'
            f'<animateTransform attributeName="transform" type="translate" values="0 0;0.5 0;-0.4 0;0 0" '
            f'keyTimes="0;0.25;0.6;1" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1" '
            f'dur="0.9s" repeatCount="indefinite"/>{marionette_paths(t)}</g>')
    return svg_wrap("Loading - string pluck", badge_rect(t) + bar + sr + sl + mari)


def anim_draw_on(t):
    """Glyphs stroke-trace themselves, fill fades in, hold, loop."""
    dur = "3.2s"
    dash_anim = (f'<animate attributeName="stroke-dashoffset" values="250;0;0" keyTimes="0;0.45;1" dur="{dur}" repeatCount="indefinite"/>')
    fill_anim = (f'<animate attributeName="fill-opacity" values="0;0;1;1;0;0" keyTimes="0;0.42;0.55;0.85;0.95;1" '
                 f'dur="{dur}" repeatCount="indefinite"/>')
    stroke_anim = (f'<animate attributeName="stroke-opacity" values="1;1;0;0;1" keyTimes="0;0.55;0.7;0.95;1" '
                   f'dur="{dur}" repeatCount="indefinite"/>')

    def traced(path_d, fill):
        return (f'<path d="{path_d}" fill="{fill}" fill-opacity="0" stroke="{t["glyph"]}" stroke-width="0.5" '
                f'stroke-dasharray="250" stroke-dashoffset="250">{dash_anim}{fill_anim}{stroke_anim}</path>')

    g = t["glyph"]
    bar = traced(BAR_A, g) + traced(BAR_B, g) + traced(BAR_MAIN, g)
    strings = (f'<g fill="{g}" fill-opacity="0" stroke="{g}" stroke-width="0.5" stroke-dasharray="250" stroke-dashoffset="250">'
               f'{dash_anim}{fill_anim}{stroke_anim}{STRING_L}{STRING_R}</g>')
    mari = traced(BRACE_L, g) + traced(M_LETTER, g) + traced(P_FILL, g)
    p_badge = (f'<path fill="{t["badge"]}" fill-opacity="0" d="{P_BADGE}">{fill_anim}</path>')
    br = traced(BRACE_R, g)
    return svg_wrap("Loading - draw on", badge_rect(t) + bar + strings + mari + p_badge + br)


def anim_mobile_spin(t):
    """Whole hanging assembly rotates slowly like a mobile."""
    assembly = (f'<g fill="{t["glyph"]}">'
                f'<animateTransform attributeName="transform" type="rotate" from="0 {C_ASSEMBLY[0]} {C_ASSEMBLY[1]}" '
                f'to="360 {C_ASSEMBLY[0]} {C_ASSEMBLY[1]}" dur="5s" repeatCount="indefinite"/>'
                f'{bar_paths()}<g>{STRING_R}{STRING_L}</g>{marionette_paths(t)}</g>')
    return svg_wrap("Loading - mobile spin", badge_rect(t) + assembly)


def anim_sheen(t):
    """Diagonal light sweep across the badge."""
    r = t["r"]
    defs = (
        f'<clipPath id="badgeClip"><rect width="43.2" height="43.2" rx="{r}" ry="{r}"/></clipPath>'
        f'<linearGradient id="sheenGrad" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>'
        f'<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.55"/>'
        f'<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>'
        f'</linearGradient>')
    sheen = (f'<g clip-path="url(#badgeClip)"><g>'
             f'<animateTransform attributeName="transform" type="translate" values="-35 0;60 0;60 0" keyTimes="0;0.45;1" '
             f'calcMode="spline" keySplines="0.4 0 0.6 1;0 0 1 1" dur="2.6s" repeatCount="indefinite"/>'
             f'<rect x="-15" y="-25" width="16" height="95" fill="url(#sheenGrad)" transform="skewX(-18)"/>'
             f'</g></g>')
    glyphs = f'<g fill="{t["glyph"]}">{bar_paths()}<g>{STRING_R}{STRING_L}</g>{marionette_paths(t)}</g>'
    return svg_wrap("Loading - sheen", badge_rect(t) + glyphs + sheen, defs=defs)


STYLES = {
    "puppet-sway":  dict(fn=anim_puppet_sway,  label="Puppet Sway",
                         desc="Control bar rocks while the strings swing the {PM} marionette. The signature."),
    "breathe":      dict(fn=anim_breathe,      label="Breathe",
                         desc="Braces grow and shrink on the inhale; PM counter-pulses; soft glow."),
    "string-pluck": dict(fn=anim_string_pluck, label="String Pluck",
                         desc="Strings ripple with a damped pluck; the bar wobbles in sympathy."),
    "draw-on":      dict(fn=anim_draw_on,      label="Draw On",
                         desc="The mark traces itself in strokes, fills, holds, and loops."),
    "mobile-spin":  dict(fn=anim_mobile_spin,  label="Mobile Spin",
                         desc="The whole hanging assembly rotates slowly, like a crib mobile."),
    "sheen":        dict(fn=anim_sheen,        label="Sheen",
                         desc="A diagonal light sweep crosses the badge. The classic 'working' cue."),
}


def main():
    STATIC_DIR.mkdir(exist_ok=True)
    ANIM_DIR.mkdir(exist_ok=True)
    written = []
    for name, t in THEMES.items():
        p = STATIC_DIR / f"icon-{name}.svg"
        p.write_text(static_svg(t), encoding="utf-8")
        written.append(p)
        for style, meta in STYLES.items():
            p = ANIM_DIR / f"{style}-{name}.svg"
            p.write_text(meta["fn"](t), encoding="utf-8")
            written.append(p)

    # Validate well-formedness of every file written
    for p in written:
        xml.dom.minidom.parseString(p.read_text(encoding="utf-8"))

    manifest = {
        "themes": {k: {kk: vv for kk, vv in v.items()} for k, v in THEMES.items()},
        "styles": {k: {"label": v["label"], "desc": v["desc"]} for k, v in STYLES.items()},
        "static": [f"static/icon-{n}.svg" for n in THEMES],
        "animated": [f"animated/{s}-{n}.svg" for s in STYLES for n in THEMES],
    }
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"OK: wrote {len(written)} SVGs ({len(THEMES)} static, {len(written)-len(THEMES)} animated), all valid XML")


if __name__ == "__main__":
    main()
