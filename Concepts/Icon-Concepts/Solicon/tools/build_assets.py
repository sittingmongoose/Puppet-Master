#!/usr/bin/env python3
"""Build the isolated Puppet Master Solicon asset library.

The generator is intentionally standard-library-only. It reads two protected inputs,
creates all generated content below Concepts/Icon-Concepts/Solicon, and records
enough provenance to prove that neither input changed.
"""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import struct
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, Sequence, Tuple


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
SOURCE_SVG = ROOT / "source" / "Pm-placeholder-3-original.svg"
PMCONCEPT7 = REPO / "Concepts" / "PMConcept7.html"
EXPECTED_SOURCE_SHA256 = "c73265aa00eb4481f6afadb5c815a1c2a2141a127fb44d52cd2871511e8c4211"
FIXED_ZIP_TIME = (1980, 1, 1, 0, 0, 0)

THEME_IDS = (
    "friendly-dark",
    "friendly-light",
    "glass-dark",
    "glass-light",
    "retro-dark",
    "retro-light",
    "basic-dark",
    "basic-light",
)
TREATMENTS = ("flat", "character")
FORMS = ("full", "micro")
PRESENTATIONS = ("tiled", "transparent")
APP_SIZES = (16, 32, 64, 128, 256, 512, 1024)
TRAY_SIZES = (16, 20, 24, 32, 48)

MOTIONS = (
    {
        "id": "soft-breath",
        "label": "Soft Breath",
        "tone": "friendly-technical",
        "duration_ms": 2400,
        "description": "A gentle scale and accent-opacity cycle.",
    },
    {
        "id": "puppet-lift",
        "label": "Puppet Lift",
        "tone": "friendly-technical",
        "duration_ms": 1800,
        "description": "Strings lift the monogram while the controls counter-tilt.",
    },
    {
        "id": "guiding-wave",
        "label": "Guiding Wave",
        "tone": "friendly-technical",
        "duration_ms": 2000,
        "description": "A calm top-to-bottom cascade through the logo layers.",
    },
    {
        "id": "crossbar-cycle",
        "label": "Crossbar Cycle",
        "tone": "precision-industrial",
        "duration_ms": 1400,
        "description": "Crisp opposing pivots create a measured mechanical cycle.",
    },
    {
        "id": "modular-assembly",
        "label": "Modular Assembly",
        "tone": "precision-industrial",
        "duration_ms": 2200,
        "description": "Components slide inward, lock briefly, and reset.",
    },
    {
        "id": "signal-relay",
        "label": "Signal Relay",
        "tone": "precision-industrial",
        "duration_ms": 1600,
        "description": "An accent pulse travels through controls, strings, and type.",
    },
    {
        "id": "brace-orbit",
        "label": "Brace Orbit",
        "tone": "expressive-futuristic",
        "duration_ms": 2000,
        "description": "The braces trace shallow arcs around the monogram.",
    },
    {
        "id": "phase-weave",
        "label": "Phase Weave",
        "tone": "expressive-futuristic",
        "duration_ms": 1800,
        "description": "The crossed controls exchange depth around a counter-pulse.",
    },
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)


def write_json(path: Path, payload: object) -> None:
    write_text(path, json.dumps(payload, indent=2, sort_keys=True) + "\n")


def kebab_label(value: str) -> str:
    return " ".join(word.capitalize() for word in value.split("-"))


def parse_custom_properties(css_body: str) -> Dict[str, str]:
    return {
        match.group(1): re.sub(r"\s+", " ", match.group(2).strip())
        for match in re.finditer(r"--([\w-]+)\s*:\s*([^;{}]+);", css_body)
    }


def first_css_block(source: str, selector_pattern: str) -> str:
    match = re.search(selector_pattern + r"\s*\{(.*?)\}", source, flags=re.S)
    if not match:
        raise RuntimeError(f"CSS selector not found: {selector_pattern}")
    return match.group(1)


def resolve_var(name: str, props: Mapping[str, str], trail: Tuple[str, ...] = ()) -> str:
    if name in trail:
        raise RuntimeError(f"CSS variable cycle: {' -> '.join(trail + (name,))}")
    raw = props.get(name)
    if raw is None:
        raise RuntimeError(f"Missing CSS variable --{name}")
    pattern = re.compile(r"var\(--([\w-]+)(?:,\s*([^\)]+))?\)")
    while True:
        match = pattern.search(raw)
        if not match:
            return raw.strip()
        target = match.group(1)
        fallback = match.group(2)
        replacement = resolve_var(target, props, trail + (name,)) if target in props else fallback
        if replacement is None:
            raise RuntimeError(f"Unresolved CSS variable --{target} while resolving --{name}")
        raw = raw[: match.start()] + replacement.strip() + raw[match.end() :]


def normalize_css_value(value: str) -> str:
    """Resolve the simple arithmetic PMConcept7 uses inside alpha channels."""
    pattern = re.compile(r"calc\(\s*([0-9]*\.?[0-9]+)\s*([+-])\s*([0-9]*\.?[0-9]+)\s*\)")
    while True:
        match = pattern.search(value)
        if not match:
            return value
        left, operator, right = float(match.group(1)), match.group(2), float(match.group(3))
        result = left + right if operator == "+" else left - right
        value = value[: match.start()] + f"{result:.4f}".rstrip("0").rstrip(".") + value[match.end() :]


def extract_themes(pmconcept: str, pm_hash: str) -> List[dict]:
    root_props = parse_custom_properties(first_css_block(pmconcept, r":root"))
    themes: List[dict] = []
    roles = (
        "background",
        "surface",
        "surface-elevated",
        "text-primary",
        "text-secondary",
        "text-muted",
        "border",
        "border-light",
        "accent-primary",
        "accent-blue",
        "accent-magenta",
        "accent-lime",
        "accent-orange",
    )
    for theme_id in THEME_IDS:
        body = first_css_block(pmconcept, rf'\[data-theme="{re.escape(theme_id)}"\]')
        raw_theme = parse_custom_properties(body)
        merged = dict(root_props)
        merged.update(raw_theme)
        resolved = {role.replace("-", "_"): normalize_css_value(resolve_var(role, merged)) for role in roles}
        family, scheme = theme_id.split("-", 1)
        if family in ("friendly", "glass"):
            secondary = resolved["accent_magenta"]
        elif family == "retro":
            secondary = resolved["accent_magenta"] if scheme == "dark" else resolved["accent_blue"]
        else:
            secondary = resolved["text_secondary"]
        resolved["secondary_accent"] = secondary
        themes.append(
            {
                "id": theme_id,
                "label": kebab_label(theme_id),
                "family": family,
                "scheme": scheme,
                "source": {
                    "path": "../../PMConcept7.html",
                    "sha256": pm_hash,
                    "selector": f'[data-theme="{theme_id}"]',
                },
                "tokens": resolved,
                "raw_overrides": {key: raw_theme[key] for key in sorted(raw_theme)},
            }
        )
    return themes


def source_geometry() -> dict:
    tree = ET.parse(SOURCE_SVG)
    root = tree.getroot()
    paths = [element.attrib["d"] for element in root.iter() if element.tag.endswith("path")]
    rects = [element.attrib for element in root.iter() if element.tag.endswith("rect")]
    if len(paths) != 8 or len(rects) != 3:
        raise RuntimeError(f"Unexpected source geometry: {len(paths)} paths, {len(rects)} rects")
    return {
        "viewBox": root.attrib.get("viewBox", "0 0 43.2 43.2"),
        "tile": dict(rects[0]),
        "brace_left": paths[0],
        "letter_m": paths[1],
        "letter_p_outer": paths[2],
        "letter_p_cutout": paths[3],
        "stick_back_left": paths[4],
        "stick_back_right": paths[5],
        "stick_front": paths[6],
        "string_right": dict(rects[1]),
        "string_left": dict(rects[2]),
        "brace_right": paths[7],
    }


def esc(value: str) -> str:
    return value.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


def theme_colors(theme: Mapping[str, object], treatment: str, presentation: str, tray_state: str | None = None) -> dict:
    tokens = theme["tokens"]
    assert isinstance(tokens, Mapping)
    if tray_state:
        if tray_state == "template":
            ink = "#000000"
        elif tray_state == "idle":
            ink = str(tokens["text_secondary"])
        else:
            ink = str(tokens["accent_primary"])
        return {
            "tile0": "transparent",
            "tile1": "transparent",
            "mark": ink,
            "accent": ink,
            "secondary": ink,
            "edge": "transparent",
            "cutout": "transparent",
        }
    if treatment == "flat":
        if presentation == "tiled":
            tile = str(tokens["accent_primary"])
            mark = str(tokens["background"])
        else:
            tile = "transparent"
            mark = str(tokens["accent_primary"])
        return {
            "tile0": tile,
            "tile1": tile,
            "mark": mark,
            "accent": mark,
            "secondary": mark,
            "edge": "transparent",
            "cutout": "transparent",
        }
    return {
        "tile0": str(tokens["background"]) if presentation == "tiled" else "transparent",
        "tile1": str(tokens["surface_elevated"]) if presentation == "tiled" else "transparent",
        "mark": str(tokens["text_primary"]),
        "accent": str(tokens["accent_primary"]),
        "secondary": str(tokens["secondary_accent"]),
        "edge": str(tokens["border"]),
        "cutout": "transparent",
    }


def family_radius(theme: Mapping[str, object], treatment: str) -> float:
    if treatment == "flat":
        return 6.29
    return {"friendly": 8.4, "glass": 9.2, "retro": 0.8, "basic": 4.0}[str(theme["family"])]


def tile_defs(theme: Mapping[str, object], colors: Mapping[str, str], treatment: str) -> str:
    family = str(theme["family"])
    if treatment == "flat":
        return f"""
    <linearGradient id="pm-tile-paint" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{esc(colors['tile0'])}"/>
      <stop offset="1" stop-color="{esc(colors['tile0'])}"/>
    </linearGradient>"""
    if family == "glass":
        return f"""
    <linearGradient id="pm-tile-paint" x1="0.08" y1="0" x2="0.92" y2="1">
      <stop offset="0" stop-color="{esc(colors['tile1'])}"/>
      <stop offset="0.52" stop-color="{esc(colors['tile0'])}"/>
      <stop offset="1" stop-color="{esc(colors['secondary'])}" stop-opacity="0.34"/>
    </linearGradient>
    <linearGradient id="pm-sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.36"/>
      <stop offset="0.38" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>"""
    if family == "friendly":
        return f"""
    <linearGradient id="pm-tile-paint" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{esc(colors['tile1'])}"/>
      <stop offset="1" stop-color="{esc(colors['tile0'])}"/>
    </linearGradient>
    <pattern id="pm-dot-field" width="4.5" height="4.5" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="0.32" fill="{esc(colors['accent'])}" opacity="0.18"/>
    </pattern>"""
    return f"""
    <linearGradient id="pm-tile-paint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{esc(colors['tile1'])}"/>
      <stop offset="1" stop-color="{esc(colors['tile0'])}"/>
    </linearGradient>"""


def tile_markup(theme: Mapping[str, object], colors: Mapping[str, str], treatment: str, presentation: str) -> str:
    if presentation != "tiled":
        return ""
    radius = family_radius(theme, treatment)
    family = str(theme["family"])
    overlays = ""
    if treatment == "character" and family == "friendly":
        overlays = f'<rect id="pm-tile-texture" width="43.2" height="43.2" rx="{radius}" fill="url(#pm-dot-field)"/>'
    elif treatment == "character" and family == "glass":
        overlays = f'<path id="pm-tile-sheen" d="M3 3h28c-7 3-13 8-18 15-4 6-7 11-10 16z" fill="url(#pm-sheen)" opacity=".65"/>'
    elif treatment == "character" and family == "retro":
        overlays = f'<path id="pm-tile-grid" d="M2 9.6h39.2M2 21.6h39.2M2 33.6h39.2M9.6 2v39.2M21.6 2v39.2M33.6 2v39.2" fill="none" stroke="{esc(colors["edge"])}" stroke-width=".3" opacity=".34"/>'
    return f"""
  <g id="pm-tile-layer">
    <rect id="pm-tile" width="43.2" height="43.2" rx="{radius}" fill="url(#pm-tile-paint)"/>
    {overlays}
    <rect id="pm-tile-edge" x="0.6" y="0.6" width="42" height="42" rx="{max(radius - 0.6, 0)}" fill="none" stroke="{esc(colors['edge'])}" stroke-width="1.2" opacity="{'.8' if treatment == 'character' else '0'}"/>
  </g>"""


def rect_attrs(rect: Mapping[str, str], *, width_scale: float = 1.0) -> str:
    attrs = dict(rect)
    if width_scale != 1.0:
        attrs["width"] = f"{float(attrs['width']) * width_scale:.3f}"
        attrs["rx"] = f"{float(attrs.get('rx', '0')) * width_scale:.3f}"
        attrs["ry"] = f"{float(attrs.get('ry', '0')) * width_scale:.3f}"
    return " ".join(f'{key}="{esc(value)}"' for key, value in attrs.items() if key not in {"class"})


def motion_css(motion: Mapping[str, object]) -> str:
    motion_id = str(motion["id"])
    duration = int(motion["duration_ms"])
    def delay(fraction: float) -> int:
        return round(duration * fraction)

    base = f"""
    :root {{ --pm-duration:{duration}ms; --pm-ease:cubic-bezier(.25,1,.5,1); }}
    #pm-mark, #pm-stick-back, #pm-stick-front, #pm-strings, #pm-string-left,
    #pm-string-right, #pm-monogram, #pm-braces, #pm-brace-left, #pm-brace-right {{
      transform-box:fill-box; transform-origin:center; will-change:transform,opacity;
    }}
    @keyframes pm-rm-pulse {{ 0%,100%{{opacity:.72}} 50%{{opacity:1}} }}
"""
    if motion_id == "soft-breath":
        rules = """
    @keyframes pm-soft-breath { 0%,100%{transform:scale(.975);opacity:.82} 50%{transform:scale(1.025);opacity:1} }
    #pm-mark { animation:pm-soft-breath var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
"""
    elif motion_id == "puppet-lift":
        rules = """
    @keyframes pm-lift-body { 0%,100%{transform:translateY(1.2px)} 48%,58%{transform:translateY(-1.5px)} }
    @keyframes pm-lift-left { 0%,100%{transform:rotate(-1.5deg)} 50%{transform:rotate(2deg)} }
    @keyframes pm-lift-right { 0%,100%{transform:rotate(1.5deg)} 50%{transform:rotate(-2deg)} }
    @keyframes pm-lift-string { 0%,100%{transform:scaleY(.92)} 50%{transform:scaleY(1.05)} }
    #pm-monogram,#pm-braces { animation:pm-lift-body var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
    #pm-stick-back { animation:pm-lift-left var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
    #pm-stick-front { animation:pm-lift-right var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
    #pm-strings { transform-origin:center top; animation:pm-lift-string var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
"""
    elif motion_id == "guiding-wave":
        rules = f"""
    @keyframes pm-guide-wave {{ 0%,100%{{transform:translateY(1.5px);opacity:.48}} 34%,66%{{transform:translateY(0);opacity:1}} }}
    #pm-stick-back,#pm-stick-front {{ animation:pm-guide-wave var(--pm-duration) var(--pm-ease) infinite; animation-delay:{delay(-0.75)}ms; }}
    #pm-strings {{ animation:pm-guide-wave var(--pm-duration) var(--pm-ease) infinite; animation-delay:{delay(-0.5)}ms; }}
    #pm-monogram {{ animation:pm-guide-wave var(--pm-duration) var(--pm-ease) infinite; animation-delay:{delay(-0.25)}ms; }}
    #pm-braces {{ animation:pm-guide-wave var(--pm-duration) var(--pm-ease) infinite; }}
"""
    elif motion_id == "crossbar-cycle":
        rules = """
    @keyframes pm-cycle-left { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
    @keyframes pm-cycle-right { 0%,100%{transform:rotate(3deg)} 50%{transform:rotate(-3deg)} }
    @keyframes pm-cycle-strings { 0%,100%{transform:scaleY(.9);opacity:.7} 50%{transform:scaleY(1.08);opacity:1} }
    #pm-stick-back { animation:pm-cycle-left var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
    #pm-stick-front { animation:pm-cycle-right var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
    #pm-strings { transform-origin:center top; animation:pm-cycle-strings var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
"""
    elif motion_id == "modular-assembly":
        rules = """
    @keyframes pm-assemble-left { 0%,100%{transform:translate(-3px,-2px);opacity:.42} 35%,70%{transform:none;opacity:1} }
    @keyframes pm-assemble-right { 0%,100%{transform:translate(3px,-2px);opacity:.42} 35%,70%{transform:none;opacity:1} }
    @keyframes pm-assemble-down { 0%,100%{transform:translateY(3px);opacity:.42} 35%,70%{transform:none;opacity:1} }
    @keyframes pm-assemble-side { 0%,100%{transform:scaleX(.82);opacity:.42} 35%,70%{transform:none;opacity:1} }
    #pm-stick-back { animation:pm-assemble-left var(--pm-duration) var(--pm-ease) infinite; }
    #pm-stick-front { animation:pm-assemble-right var(--pm-duration) var(--pm-ease) infinite; }
    #pm-strings,#pm-monogram { animation:pm-assemble-down var(--pm-duration) var(--pm-ease) infinite; }
    #pm-braces { animation:pm-assemble-side var(--pm-duration) var(--pm-ease) infinite; }
"""
    elif motion_id == "signal-relay":
        rules = f"""
    @keyframes pm-relay {{ 0%,100%{{opacity:.38;transform:scale(.985)}} 18%,36%{{opacity:1;transform:scale(1.025)}} 52%{{opacity:.5;transform:scale(1)}} }}
    #pm-stick-back {{ animation:pm-relay var(--pm-duration) linear infinite; }}
    #pm-stick-front {{ animation:pm-relay var(--pm-duration) linear infinite; animation-delay:{delay(-0.2)}ms; }}
    #pm-strings {{ animation:pm-relay var(--pm-duration) linear infinite; animation-delay:{delay(-0.4)}ms; }}
    #pm-monogram {{ animation:pm-relay var(--pm-duration) linear infinite; animation-delay:{delay(-0.6)}ms; }}
    #pm-braces {{ animation:pm-relay var(--pm-duration) linear infinite; animation-delay:{delay(-0.8)}ms; }}
"""
    elif motion_id == "brace-orbit":
        rules = """
    @keyframes pm-orbit-left { 0%,100%{transform:translate(0,0) rotate(0)} 25%{transform:translate(1px,-1.3px) rotate(5deg)} 50%{transform:translate(2px,0) rotate(0)} 75%{transform:translate(1px,1.3px) rotate(-5deg)} }
    @keyframes pm-orbit-right { 0%,100%{transform:translate(0,0) rotate(0)} 25%{transform:translate(-1px,1.3px) rotate(5deg)} 50%{transform:translate(-2px,0) rotate(0)} 75%{transform:translate(-1px,-1.3px) rotate(-5deg)} }
    @keyframes pm-orbit-core { 0%,100%{transform:scale(.98);opacity:.78} 50%{transform:scale(1.025);opacity:1} }
    #pm-brace-left { animation:pm-orbit-left var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
    #pm-brace-right { animation:pm-orbit-right var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
    #pm-monogram,#pm-strings { animation:pm-orbit-core var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
"""
    elif motion_id == "phase-weave":
        rules = """
    @keyframes pm-phase-a { 0%,100%{transform:rotate(-2deg) scale(.985);opacity:.55} 50%{transform:rotate(2deg) scale(1.025);opacity:1} }
    @keyframes pm-phase-b { 0%,100%{transform:rotate(2deg) scale(1.025);opacity:1} 50%{transform:rotate(-2deg) scale(.985);opacity:.55} }
    @keyframes pm-phase-core { 0%,100%{transform:scale(1.02);opacity:1} 50%{transform:scale(.97);opacity:.72} }
    #pm-stick-back { animation:pm-phase-a var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
    #pm-stick-front { animation:pm-phase-b var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
    #pm-monogram,#pm-braces { animation:pm-phase-core var(--pm-duration) cubic-bezier(.65,0,.35,1) infinite; }
"""
    else:
        raise RuntimeError(f"Unknown motion: {motion_id}")
    reduced = """
    @media (prefers-reduced-motion: reduce) {
      #pm-stick-back,#pm-stick-front,#pm-strings,#pm-string-left,#pm-string-right,
      #pm-monogram,#pm-braces,#pm-brace-left,#pm-brace-right { animation:none !important; transform:none !important; opacity:1 !important; }
      #pm-mark { animation:pm-rm-pulse calc(var(--pm-duration) * 1.5) linear infinite !important; transform:none !important; }
    }
"""
    return base + rules + reduced


def svg_markup(
    geometry: Mapping[str, object],
    theme: Mapping[str, object],
    treatment: str,
    form: str,
    presentation: str = "tiled",
    motion: Mapping[str, object] | None = None,
    tray_state: str | None = None,
) -> str:
    colors = theme_colors(theme, treatment, presentation, tray_state)
    title_bits = [str(theme["label"]), treatment, form]
    if motion:
        title_bits.insert(0, str(motion["label"]))
        title_bits.append(presentation)
    title = "Puppet Master " + " ".join(title_bits)
    css = motion_css(motion) if motion else ""
    defs = tile_defs(theme, colors, treatment)
    micro = form == "micro"
    monogram_transform = ' transform="translate(21.6 30.4) scale(1.12) translate(-21.6 -30.4)"' if micro else ""
    string_scale = 1.35 if micro else 1.0
    braces = "" if micro else f"""
      <g id="pm-braces" fill="{esc(colors['secondary'])}">
        <path id="pm-brace-left" d="{esc(str(geometry['brace_left']))}"/>
        <path id="pm-brace-right" d="{esc(str(geometry['brace_right']))}"/>
      </g>"""
    tile = tile_markup(theme, colors, treatment, presentation)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="pm-logo" viewBox="{esc(str(geometry['viewBox']))}" role="img" aria-labelledby="pm-title pm-desc">
  <title id="pm-title">{esc(title)}</title>
  <desc id="pm-desc">Puppet Master crossed control bars, strings, braces, and PM monogram.</desc>
  <defs>{defs}
    <mask id="pm-p-mask" maskUnits="userSpaceOnUse" x="9" y="20" width="14" height="20">
      <rect x="9" y="20" width="14" height="20" fill="#000"/>
      <path d="{esc(str(geometry['letter_p_outer']))}" fill="#fff"/>
      <path id="pm-cutout-p" d="{esc(str(geometry['letter_p_cutout']))}" fill="#000"/>
    </mask>
    <style>{css}</style>
  </defs>
  {tile}
  <g id="pm-mark">
    <g id="pm-stick-back" fill="{esc(colors['secondary'])}">
      <path d="{esc(str(geometry['stick_back_left']))}"/>
      <path d="{esc(str(geometry['stick_back_right']))}"/>
    </g>
    <path id="pm-stick-front" d="{esc(str(geometry['stick_front']))}" fill="{esc(colors['accent'])}"/>
    <g id="pm-strings" fill="{esc(colors['secondary'])}">
      <rect id="pm-string-left" {rect_attrs(geometry['string_left'], width_scale=string_scale)}/>
      <rect id="pm-string-right" {rect_attrs(geometry['string_right'], width_scale=string_scale)}/>
    </g>
    <g id="pm-monogram"{monogram_transform} fill="{esc(colors['mark'])}">
      <rect id="pm-letter-p" x="9" y="20" width="14" height="20" mask="url(#pm-p-mask)"/>
      <path id="pm-letter-m" d="{esc(str(geometry['letter_m']))}"/>
    </g>
    {braces}
  </g>
</svg>
"""


def clean_generated() -> None:
    for name in ("assets", "exports", "bundles", "manifest", "data.js", "asset-checksums.sha256", "checksums.sha256"):
        target = ROOT / name
        if target.is_dir():
            shutil.rmtree(target)
        elif target.exists():
            target.unlink()
    for cache in ROOT.rglob("__pycache__"):
        if cache.is_dir():
            shutil.rmtree(cache)


def render_svg_batch(svg_paths: Sequence[Path], size: int, outputs: Mapping[Path, Path]) -> None:
    if not svg_paths:
        return
    with tempfile.TemporaryDirectory(prefix="solicon-raster-") as temp_name:
        temp = Path(temp_name)
        staged: Dict[Path, Path] = {}
        for index, svg_path in enumerate(svg_paths):
            staged_path = temp / f"source-{index:04d}.svg"
            shutil.copyfile(svg_path, staged_path)
            staged[svg_path] = staged_path
        command = ["qlmanage", "-t", "-s", str(size), "-o", str(temp), *map(str, staged.values())]
        subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for svg_path in svg_paths:
            candidate = temp / f"{staged[svg_path].name}.png"
            if not candidate.exists():
                raise RuntimeError(f"Quick Look did not render {svg_path.name} at {size}px")
            destination = outputs[svg_path]
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(candidate, destination)


def build_ico(png_paths: Sequence[Path], destination: Path) -> None:
    payloads = [(path, path.read_bytes()) for path in png_paths]
    offset = 6 + 16 * len(payloads)
    directory = [struct.pack("<HHH", 0, 1, len(payloads))]
    data_parts: List[bytes] = []
    for path, data in payloads:
        size = int(path.stem.split("-")[-1])
        size_byte = 0 if size >= 256 else size
        directory.append(struct.pack("<BBBBHHII", size_byte, size_byte, 0, 0, 1, 32, len(data), offset))
        data_parts.append(data)
        offset += len(data)
    destination.write_bytes(b"".join(directory + data_parts))


def build_icns(app_dir: Path) -> Path:
    with tempfile.TemporaryDirectory(prefix="solicon-iconset-") as temp_name:
        iconset = Path(temp_name) / "PuppetMaster.iconset"
        iconset.mkdir()
        mapping = {
            "icon_16x16.png": 16,
            "icon_16x16@2x.png": 32,
            "icon_32x32.png": 32,
            "icon_32x32@2x.png": 64,
            "icon_128x128.png": 128,
            "icon_128x128@2x.png": 256,
            "icon_256x256.png": 256,
            "icon_256x256@2x.png": 512,
            "icon_512x512.png": 512,
            "icon_512x512@2x.png": 1024,
        }
        for name, size in mapping.items():
            shutil.copyfile(app_dir / f"icon-{size}.png", iconset / name)
        destination = app_dir / "PuppetMaster.icns"
        subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(destination)], check=True)
        return destination


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def file_record(path: Path) -> dict:
    return {"path": relative(path), "sha256": sha256(path), "bytes": path.stat().st_size}


def distributable_file(path: Path) -> bool:
    return path.is_file() and "__pycache__" not in path.parts and path.suffix != ".pyc"


def deterministic_zip(destination: Path, paths: Iterable[Path], base: Path = ROOT) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    unique = sorted({path.resolve() for path in paths if path.is_file()}, key=lambda p: p.as_posix())
    with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in unique:
            arcname = path.relative_to(base.resolve()).as_posix()
            info = zipfile.ZipInfo(arcname, FIXED_ZIP_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)


def write_checksum_file(destination: Path, paths: Iterable[Path]) -> None:
    lines = [f"{sha256(path)}  {relative(path)}" for path in sorted(paths, key=lambda p: relative(p)) if path.is_file() and path != destination]
    write_text(destination, "\n".join(lines) + "\n")


def manifest_schema() -> dict:
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "pm.solicon.manifest.v1",
        "title": "Puppet Master Solicon asset manifest",
        "type": "object",
        "required": ["schema_id", "schema_version", "source", "counts", "themes", "motions", "static_assets", "loader_assets"],
        "properties": {
            "schema_id": {"const": "pm.solicon.manifest.v1"},
            "schema_version": {"const": "1.0.0"},
            "source": {"type": "object"},
            "counts": {"type": "object"},
            "themes": {"type": "array", "minItems": 8, "maxItems": 8},
            "motions": {"type": "array", "minItems": 8, "maxItems": 8},
            "static_assets": {"type": "array", "minItems": 32, "maxItems": 32},
            "loader_assets": {"type": "array", "minItems": 256, "maxItems": 256},
            "platform_packs": {"type": "array"},
            "bundles": {"type": "array"},
        },
        "additionalProperties": True,
    }


def motion_spec() -> dict:
    layer_maps = {
        "soft-breath": {
            "pm-mark": ["scale", "opacity"],
        },
        "puppet-lift": {
            "pm-stick-back": ["rotation_degrees"],
            "pm-stick-front": ["rotation_degrees"],
            "pm-strings": ["scale_y"],
            "pm-monogram": ["translate_y"],
            "pm-braces": ["translate_y"],
        },
        "guiding-wave": {
            "pm-stick-back": ["translate_y", "opacity", "phase_offset"],
            "pm-stick-front": ["translate_y", "opacity", "phase_offset"],
            "pm-strings": ["translate_y", "opacity", "phase_offset"],
            "pm-monogram": ["translate_y", "opacity", "phase_offset"],
            "pm-braces": ["translate_y", "opacity", "phase_offset"],
        },
        "crossbar-cycle": {
            "pm-stick-back": ["rotation_degrees"],
            "pm-stick-front": ["rotation_degrees"],
            "pm-strings": ["scale_y", "opacity"],
        },
        "modular-assembly": {
            "pm-stick-back": ["translate_x", "translate_y", "opacity"],
            "pm-stick-front": ["translate_x", "translate_y", "opacity"],
            "pm-strings": ["translate_y", "opacity"],
            "pm-monogram": ["translate_y", "opacity"],
            "pm-braces": ["scale_x", "opacity"],
        },
        "signal-relay": {
            "pm-stick-back": ["scale", "opacity", "phase_offset"],
            "pm-stick-front": ["scale", "opacity", "phase_offset"],
            "pm-strings": ["scale", "opacity", "phase_offset"],
            "pm-monogram": ["scale", "opacity", "phase_offset"],
            "pm-braces": ["scale", "opacity", "phase_offset"],
        },
        "brace-orbit": {
            "pm-brace-left": ["translate_x", "translate_y", "rotation_degrees"],
            "pm-brace-right": ["translate_x", "translate_y", "rotation_degrees"],
            "pm-strings": ["scale", "opacity"],
            "pm-monogram": ["scale", "opacity"],
        },
        "phase-weave": {
            "pm-stick-back": ["rotation_degrees", "scale", "opacity"],
            "pm-stick-front": ["rotation_degrees", "scale", "opacity"],
            "pm-monogram": ["scale", "opacity"],
            "pm-braces": ["scale", "opacity"],
        },
    }
    specs = []
    for motion in MOTIONS:
        motion_id = str(motion["id"])
        specs.append(
            {
                **motion,
                "loop": "infinite-seamless",
                "browser_properties": ["transform", "opacity"],
                "layer_property_map": layer_maps[motion_id],
                "slint_mapping": {
                    "progress_property": {"name": "loader-progress", "type": "float", "range": [0.0, 1.0], "wrap": "1.0 to 0.0"},
                    "portable_layer_properties": {
                        "translate_x": "length",
                        "translate_y": "length",
                        "rotation_degrees": "angle",
                        "scale": "float",
                        "scale_x": "float",
                        "scale_y": "float",
                        "opacity": "float",
                        "phase_offset": "duration",
                    },
                    "preferred": "Recompose each listed stable SVG layer as a Slint item, derive its listed properties from loader-progress, and advance the loop with property animations or animation-tick().",
                    "renderer_note": "Transforms are an enhancement for renderers that support the recomposed layer operation; do not depend on an embedded SVG animation timeline.",
                    "software_renderer_fallback": {
                        "stationary_layers": True,
                        "mark_opacity_range": [0.72, 1.0],
                        "duration_multiplier": 1.5,
                        "easing": "linear",
                    },
                    "embedded_svg_animation_assumed": False,
                },
                "reduced_motion": "No translation, rotation, or scaling; opacity-only loading signal.",
            }
        )
    return {"schema_id": "pm.solicon.motion_spec.v1", "schema_version": "1.0.0", "motions": specs}


def main() -> None:
    if not SOURCE_SVG.is_file() or not PMCONCEPT7.is_file():
        raise SystemExit("Protected source inputs are missing")
    source_hash_before = sha256(SOURCE_SVG)
    pm_hash_before = sha256(PMCONCEPT7)
    if source_hash_before != EXPECTED_SOURCE_SHA256:
        raise SystemExit(f"Source SVG hash changed: {source_hash_before}")

    pm_text = PMCONCEPT7.read_text(encoding="utf-8")
    themes = extract_themes(pm_text, pm_hash_before)
    geometry = source_geometry()
    theme_by_id = {theme["id"]: theme for theme in themes}

    clean_generated()
    for directory in ("assets/static", "assets/loaders", "exports/app", "exports/tray", "bundles", "manifest", "source"):
        (ROOT / directory).mkdir(parents=True, exist_ok=True)
    master_theme = theme_by_id["friendly-dark"]
    write_text(
        ROOT / "source" / "pm-logo-layered-master.svg",
        svg_markup(geometry, master_theme, "character", "full"),
    )

    static_entries: List[dict] = []
    static_paths: Dict[Tuple[str, str, str], Path] = {}
    for theme in themes:
        for treatment in TREATMENTS:
            for form in FORMS:
                name = f"pm-{theme['id']}-{treatment}-{form}.svg"
                path = ROOT / "assets" / "static" / name
                write_text(path, svg_markup(geometry, theme, treatment, form))
                static_paths[(str(theme["id"]), treatment, form)] = path
                static_entries.append(
                    {
                        "id": f"static.{theme['id']}.{treatment}.{form}",
                        "theme_id": theme["id"],
                        "treatment": treatment,
                        "form": form,
                        "presentation": "tiled",
                        "contexts": ["app-icon", "loading"] if form == "full" else ["title-bar", "tray", "small-ui"],
                        "accessibility_label": "Puppet Master logo",
                        **file_record(path),
                    }
                )

    loader_entries: List[dict] = []
    for theme in themes:
        for motion in MOTIONS:
            for treatment in TREATMENTS:
                for presentation in PRESENTATIONS:
                    name = f"pm-loader-{motion['id']}-{theme['id']}-{treatment}-{presentation}.svg"
                    path = ROOT / "assets" / "loaders" / name
                    write_text(path, svg_markup(geometry, theme, treatment, "full", presentation, motion))
                    loader_entries.append(
                        {
                            "id": f"loader.{motion['id']}.{theme['id']}.{treatment}.{presentation}",
                            "motion_id": motion["id"],
                            "theme_id": theme["id"],
                            "treatment": treatment,
                            "form": "full",
                            "presentation": presentation,
                            "duration_ms": motion["duration_ms"],
                            "tone": motion["tone"],
                            "contexts": ["loading", "splash", "long-running-operation"],
                            "accessibility_label": "Puppet Master is loading",
                            **file_record(path),
                        }
                    )

    app_render_jobs: Dict[int, Dict[Path, Path]] = {size: {} for size in APP_SIZES}
    tray_svg_paths: List[Path] = []
    tray_render_jobs: Dict[int, Dict[Path, Path]] = {size: {} for size in TRAY_SIZES}
    platform_entries: List[dict] = []

    for theme in themes:
        for treatment in TREATMENTS:
            app_dir = ROOT / "exports" / "app" / str(theme["id"]) / treatment
            app_dir.mkdir(parents=True, exist_ok=True)
            app_svg = app_dir / "PuppetMaster.svg"
            shutil.copyfile(static_paths[(str(theme["id"]), treatment, "full")], app_svg)
            for size in APP_SIZES:
                app_render_jobs[size][app_svg] = app_dir / f"icon-{size}.png"

            tray_dir = ROOT / "exports" / "tray" / str(theme["id"]) / treatment
            tray_files = []
            for state in ("idle", "running", "template"):
                state_dir = tray_dir / state
                state_dir.mkdir(parents=True, exist_ok=True)
                tray_svg = state_dir / ("PuppetMasterTemplate.svg" if state == "template" else f"PuppetMaster-{state}.svg")
                write_text(tray_svg, svg_markup(geometry, theme, treatment, "micro", "transparent", tray_state=state))
                tray_svg_paths.append(tray_svg)
                tray_files.append(tray_svg)
                for size in TRAY_SIZES:
                    tray_render_jobs[size][tray_svg] = state_dir / f"tray-{size}.png"

            platform_entries.append(
                {
                    "id": f"platform.{theme['id']}.{treatment}",
                    "theme_id": theme["id"],
                    "treatment": treatment,
                    "app_directory": relative(app_dir),
                    "tray_directory": relative(tray_dir),
                    "app_png_sizes": list(APP_SIZES),
                    "tray_png_sizes": list(TRAY_SIZES),
                    "tray_states": ["idle", "running", "template"],
                }
            )

    for size, mapping in app_render_jobs.items():
        render_svg_batch(list(mapping), size, mapping)
    for size, mapping in tray_render_jobs.items():
        render_svg_batch(list(mapping), size, mapping)

    for entry in platform_entries:
        app_dir = ROOT / str(entry["app_directory"])
        build_ico([app_dir / f"icon-{size}.png" for size in (16, 32, 64, 128, 256)], app_dir / "PuppetMaster.ico")
        build_icns(app_dir)
        entry["app_files"] = [file_record(path) for path in sorted(app_dir.iterdir()) if path.is_file()]
        tray_dir = ROOT / str(entry["tray_directory"])
        entry["tray_files"] = [file_record(path) for path in sorted(tray_dir.rglob("*")) if path.is_file()]

    provenance = {
        "schema_id": "pm.solicon.provenance.v1",
        "source_svg": {
            "original_path": "source/Pm-placeholder-3-original.svg",
            "copied_path": "source/Pm-placeholder-3-original.svg",
            "sha256": source_hash_before,
            "bytes": SOURCE_SVG.stat().st_size,
            "copy_byte_identical": sha256(ROOT / "source" / "Pm-placeholder-3-original.svg") == source_hash_before,
        },
        "pmconcept7": {
            "path": "../../PMConcept7.html",
            "sha256": pm_hash_before,
            "bytes": PMCONCEPT7.stat().st_size,
            "theme_ids": list(THEME_IDS),
        },
        "generated_scope": "Concepts/Icon-Concepts/Solicon/** only",
    }
    write_json(ROOT / "manifest" / "provenance.json", provenance)
    write_json(
        ROOT / "manifest" / "palette-snapshot.json",
        {"schema_id": "pm.solicon.palette_snapshot.v1", "schema_version": "1.0.0", "themes": themes},
    )
    write_json(ROOT / "manifest" / "motion-spec.json", motion_spec())
    write_json(ROOT / "manifest" / "manifest.schema.json", manifest_schema())

    bundle_defs = []
    for theme_id in THEME_IDS:
        bundle_defs.append({"id": f"theme.{theme_id}", "label": f"{kebab_label(theme_id)} pack", "path": f"bundles/themes/{theme_id}.zip", "kind": "theme"})
    for motion in MOTIONS:
        bundle_defs.append({"id": f"motion.{motion['id']}", "label": f"{motion['label']} pack", "path": f"bundles/motions/{motion['id']}.zip", "kind": "motion"})
    for treatment in TREATMENTS:
        bundle_defs.append({"id": f"treatment.{treatment}", "label": f"{kebab_label(treatment)} treatment", "path": f"bundles/treatments/{treatment}.zip", "kind": "treatment"})
    bundle_defs.append({"id": "library.complete", "label": "Complete Solicon library", "path": "bundles/solicon-complete.zip", "kind": "complete"})

    manifest = {
        "schema_id": "pm.solicon.manifest.v1",
        "schema_version": "1.0.0",
        "generated_at": "deterministic-build",
        "source": provenance,
        "counts": {"themes": 8, "motions": 8, "static_svg": len(static_entries), "animated_svg": len(loader_entries)},
        "themes": themes,
        "motions": list(MOTIONS),
        "stable_layer_ids": [
            "pm-logo",
            "pm-tile",
            "pm-stick-back",
            "pm-stick-front",
            "pm-strings",
            "pm-string-left",
            "pm-string-right",
            "pm-monogram",
            "pm-letter-p",
            "pm-letter-m",
            "pm-cutout-p",
            "pm-braces",
            "pm-brace-left",
            "pm-brace-right",
        ],
        "static_assets": static_entries,
        "loader_assets": loader_entries,
        "platform_packs": platform_entries,
        "bundles": bundle_defs,
    }
    write_json(ROOT / "manifest" / "manifest.json", manifest)

    preview_data = {
        "schema_id": "pm.solicon.dashboard_data.v1",
        "themes": themes,
        "motions": list(MOTIONS),
        "treatments": list(TREATMENTS),
        "presentations": list(PRESENTATIONS),
        "geometry": geometry,
        "static_assets": static_entries,
        "loader_assets": loader_entries,
        "bundles": bundle_defs,
        "app_sizes": list(APP_SIZES),
        "tray_sizes": list(TRAY_SIZES),
    }
    write_text(ROOT / "data.js", "window.SOLICON_DATA = " + json.dumps(preview_data, separators=(",", ":")) + ";\n")

    prebundle_files = [path for path in ROOT.rglob("*") if distributable_file(path) and "bundles" not in path.parts and "verification" not in path.parts]
    write_checksum_file(ROOT / "asset-checksums.sha256", prebundle_files)

    common_manifest = [path for path in (ROOT / "manifest").rglob("*") if path.is_file()] + [ROOT / "README.md", ROOT / "asset-checksums.sha256"]
    for theme_id in THEME_IDS:
        paths = [path for path in (ROOT / "assets").rglob("*") if path.is_file() and theme_id in path.name]
        paths += [path for path in (ROOT / "exports").rglob("*") if path.is_file() and theme_id in path.parts]
        deterministic_zip(ROOT / "bundles" / "themes" / f"{theme_id}.zip", paths + common_manifest)
    for motion in MOTIONS:
        paths = [path for path in (ROOT / "assets" / "loaders").glob(f"pm-loader-{motion['id']}-*.svg")]
        deterministic_zip(ROOT / "bundles" / "motions" / f"{motion['id']}.zip", paths + common_manifest)
    for treatment in TREATMENTS:
        paths = [path for path in (ROOT / "assets").rglob("*") if path.is_file() and f"-{treatment}-" in path.name]
        paths += [path for path in (ROOT / "exports").rglob("*") if path.is_file() and treatment in path.parts]
        deterministic_zip(ROOT / "bundles" / "treatments" / f"{treatment}.zip", paths + common_manifest)
    for entry in platform_entries:
        theme_id = str(entry["theme_id"])
        treatment = str(entry["treatment"])
        paths = [path for path in (ROOT / "exports" / "app" / theme_id / treatment).rglob("*") if path.is_file()]
        paths += [path for path in (ROOT / "exports" / "tray" / theme_id / treatment).rglob("*") if path.is_file()]
        deterministic_zip(ROOT / "bundles" / "platform" / f"{theme_id}-{treatment}.zip", paths + common_manifest)

    complete_paths = [
        path
        for path in ROOT.rglob("*")
        if distributable_file(path)
        and "bundles" not in path.parts
        and "verification" not in path.parts
        and path.name != "checksums.sha256"
    ]
    deterministic_zip(ROOT / "bundles" / "solicon-complete.zip", complete_paths)
    final_files = [
        path for path in ROOT.rglob("*")
        if distributable_file(path)
        and "verification" not in path.parts
        and path.name != "checksums.sha256"
    ]
    write_checksum_file(ROOT / "checksums.sha256", final_files)

    if sha256(SOURCE_SVG) != source_hash_before or sha256(PMCONCEPT7) != pm_hash_before:
        raise RuntimeError("A protected input changed during generation")
    print(json.dumps({"static_svg": len(static_entries), "animated_svg": len(loader_entries), "platform_packs": len(platform_entries)}, sort_keys=True))


if __name__ == "__main__":
    main()
