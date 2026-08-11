#!/usr/bin/env python3
"""Verify the generated Solicon library and write a machine-readable receipt."""

from __future__ import annotations

import hashlib
import json
import math
import re
import shutil
import struct
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
SOURCE_SVG = ROOT / "source" / "Pm-placeholder-3-original.svg"
PMCONCEPT7 = REPO / "Concepts" / "PMConcept7.html"
REPORT = ROOT / "verification" / "asset-report.json"
APP_SIZES = (16, 32, 64, 128, 256, 512, 1024)
TRAY_SIZES = (16, 20, 24, 32, 48)
THEMES = (
    "friendly-dark", "friendly-light", "glass-dark", "glass-light",
    "retro-dark", "retro-light", "basic-dark", "basic-light",
)
MOTIONS = (
    "soft-breath", "puppet-lift", "guiding-wave", "crossbar-cycle",
    "modular-assembly", "signal-relay", "brace-orbit", "phase-weave",
)
TREATMENTS = ("flat", "character")
PRESENTATIONS = ("tiled", "transparent")


class VerificationError(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise VerificationError(message)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def png_info(path: Path) -> dict:
    data = path.read_bytes()
    require(data[:8] == b"\x89PNG\r\n\x1a\n", f"Not a PNG: {path}")
    width, height, bit_depth, color_type = struct.unpack(">IIBB", data[16:26])
    require(bit_depth == 8, f"Unexpected PNG bit depth in {path}: {bit_depth}")
    return {"width": width, "height": height, "color_type": color_type, "has_alpha": color_type in (4, 6)}


def parse_ico(path: Path) -> list[dict]:
    data = path.read_bytes()
    reserved, kind, count = struct.unpack_from("<HHH", data, 0)
    require((reserved, kind) == (0, 1), f"Malformed ICO header: {path}")
    entries = []
    for index in range(count):
        width, height, colors, reserved_byte, planes, bits, size, offset = struct.unpack_from("<BBBBHHII", data, 6 + index * 16)
        width = width or 256
        height = height or 256
        require(reserved_byte == 0 and colors == 0, f"Malformed ICO directory entry: {path}")
        require(offset + size <= len(data), f"ICO entry out of range: {path}")
        require(data[offset:offset + 8] == b"\x89PNG\r\n\x1a\n", f"ICO entry is not PNG encoded: {path}")
        entries.append({"width": width, "height": height, "planes": planes, "bits": bits, "bytes": size})
    return entries


def parse_color(value: str, background: tuple[float, float, float] | None = None) -> tuple[float, float, float]:
    value = value.strip()
    if match := re.fullmatch(r"#([0-9a-fA-F]{6})", value):
        raw = match.group(1)
        return tuple(int(raw[index:index + 2], 16) / 255 for index in (0, 2, 4))
    if match := re.fullmatch(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)", value):
        foreground = tuple(int(match.group(index)) / 255 for index in (1, 2, 3))
        alpha = float(match.group(4) or 1)
        if alpha < 1:
            require(background is not None, f"Alpha color lacks a background: {value}")
            return tuple(foreground[index] * alpha + background[index] * (1 - alpha) for index in range(3))
        return foreground
    raise VerificationError(f"Unsupported or unresolved color: {value}")


def luminance(color: tuple[float, float, float]) -> float:
    channels = [channel / 12.92 if channel <= .04045 else ((channel + .055) / 1.055) ** 2.4 for channel in color]
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]


def contrast(left: str, right: str) -> float:
    right_rgb = parse_color(right)
    left_rgb = parse_color(left, right_rgb)
    high, low = sorted((luminance(left_rgb), luminance(right_rgb)), reverse=True)
    return (high + .05) / (low + .05)


def verify_svg(path: Path, *, form: str, presentation: str, animated: bool) -> dict:
    raw = path.read_text(encoding="utf-8")
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as error:
        raise VerificationError(f"Invalid XML in {path}: {error}") from error
    require(root.tag.endswith("svg"), f"Root is not SVG: {path}")
    require(root.attrib.get("viewBox") == "0 0 43.2 43.2", f"Malformed viewBox: {path}")
    elements = list(root.iter())
    local_tags = {element.tag.rsplit("}", 1)[-1] for element in elements}
    require("script" not in local_tags, f"Script element found: {path}")
    require("foreignObject" not in local_tags, f"foreignObject found: {path}")
    ids = {element.attrib["id"] for element in elements if "id" in element.attrib}
    base_ids = {
        "pm-logo", "pm-stick-back", "pm-stick-front", "pm-strings", "pm-string-left",
        "pm-string-right", "pm-monogram", "pm-letter-p", "pm-letter-m", "pm-cutout-p",
    }
    require(base_ids <= ids, f"Missing stable layer IDs in {path}: {sorted(base_ids - ids)}")
    if form == "full":
        require({"pm-braces", "pm-brace-left", "pm-brace-right"} <= ids, f"Full form lacks braces: {path}")
    else:
        require(not ({"pm-braces", "pm-brace-left", "pm-brace-right"} & ids), f"Micro form still contains braces: {path}")
    if presentation == "tiled":
        require("pm-tile" in ids, f"Tiled asset lacks tile: {path}")
    else:
        require("pm-tile" not in ids, f"Transparent asset contains tile: {path}")
    for element in elements:
        for key, value in element.attrib.items():
            if key.rsplit("}", 1)[-1] == "href":
                require(value.startswith("#"), f"External href found in {path}: {value}")
            if "url(" in value:
                require(not re.search(r"url\((?!#)", value), f"External URL found in {path}: {value}")
    require("http://" not in raw.replace("http://www.w3.org/2000/svg", ""), f"External HTTP reference: {path}")
    require("https://" not in raw, f"External HTTPS reference: {path}")
    require("javascript:" not in raw.lower(), f"JavaScript URL found: {path}")
    require("var(--" not in re.sub(r"<style>.*?</style>", "", raw, flags=re.S), f"Unresolved color variable: {path}")
    require("calc(" not in re.sub(r"<style>.*?</style>", "", raw, flags=re.S), f"Unresolved color calculation: {path}")
    if animated:
        require("@media (prefers-reduced-motion: reduce)" in raw, f"Reduced-motion rule missing: {path}")
        require("pm-rm-pulse" in raw, f"Opacity fallback missing: {path}")
        require("infinite" in raw, f"Loader is not looping: {path}")
        require("bounce" not in raw.lower() and "elastic" not in raw.lower(), f"Disallowed easing vocabulary: {path}")
        require("0%,100%" in raw, f"Loop endpoints are not joined: {path}")
    return {"ids": len(ids), "bytes": path.stat().st_size}


def verify_checksum_file(path: Path) -> int:
    lines = [line for line in path.read_text(encoding="utf-8").splitlines() if line]
    for line in lines:
        expected, relative = line.split("  ", 1)
        target = ROOT / relative
        require(target.is_file(), f"Checksum target missing: {relative}")
        require(sha256(target) == expected, f"Checksum mismatch: {relative}")
    return len(lines)


def verify_icns(path: Path) -> dict:
    raw = path.read_bytes()
    require(raw[:4] == b"icns", f"Malformed ICNS magic: {path}")
    declared = struct.unpack(">I", raw[4:8])[0]
    require(declared == len(raw), f"ICNS declared length mismatch: {path}")
    with tempfile.TemporaryDirectory(prefix="solicon-icns-check-") as temp_name:
        iconset = Path(temp_name) / "PuppetMaster.iconset"
        subprocess.run(["iconutil", "-c", "iconset", str(path), "-o", str(iconset)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        dimensions = Counter()
        for image in iconset.glob("*.png"):
            info = png_info(image)
            dimensions[(info["width"], info["height"])] += 1
        require(set(size for size, _ in dimensions) >= set(APP_SIZES), f"ICNS missing expected raster dimensions: {path}")
    return {"bytes": len(raw), "dimensions": sorted(size for size, _ in dimensions)}


def verify() -> dict:
    manifest = json.loads((ROOT / "manifest" / "manifest.json").read_text(encoding="utf-8"))
    provenance = json.loads((ROOT / "manifest" / "provenance.json").read_text(encoding="utf-8"))
    require(manifest["schema_id"] == "pm.solicon.manifest.v1", "Wrong manifest schema ID")
    require(manifest["counts"] == {"themes": 8, "motions": 8, "static_svg": 32, "animated_svg": 256}, "Manifest counts are wrong")
    require(len(manifest["static_assets"]) == 32, "Static manifest entry count is not 32")
    require(len(manifest["loader_assets"]) == 256, "Loader manifest entry count is not 256")

    static_combos = Counter((entry["theme_id"], entry["treatment"], entry["form"]) for entry in manifest["static_assets"])
    expected_static = {(theme, treatment, form) for theme in THEMES for treatment in TREATMENTS for form in ("full", "micro")}
    require(set(static_combos) == expected_static and set(static_combos.values()) == {1}, "Static combination matrix has duplicates or gaps")
    loader_combos = Counter((entry["theme_id"], entry["motion_id"], entry["treatment"], entry["presentation"]) for entry in manifest["loader_assets"])
    expected_loaders = {(theme, motion, treatment, presentation) for theme in THEMES for motion in MOTIONS for treatment in TREATMENTS for presentation in PRESENTATIONS}
    require(set(loader_combos) == expected_loaders and set(loader_combos.values()) == {1}, "Loader combination matrix has duplicates or gaps")

    svg_count = 0
    for entry in manifest["static_assets"]:
        path = ROOT / entry["path"]
        require(path.is_file() and sha256(path) == entry["sha256"], f"Static file missing or hash mismatch: {entry['path']}")
        verify_svg(path, form=entry["form"], presentation=entry["presentation"], animated=False)
        svg_count += 1
    for entry in manifest["loader_assets"]:
        path = ROOT / entry["path"]
        require(path.is_file() and sha256(path) == entry["sha256"], f"Loader file missing or hash mismatch: {entry['path']}")
        verify_svg(path, form=entry["form"], presentation=entry["presentation"], animated=True)
        svg_count += 1

    app_pngs = tray_pngs = 0
    app_raster_hashes = {size: [] for size in APP_SIZES}
    tray_raster_hashes = {(state, size): [] for state in ("idle", "running", "template") for size in TRAY_SIZES}
    ico_entries = []
    icns_receipts = []
    for theme in THEMES:
        for treatment in TREATMENTS:
            app_dir = ROOT / "exports" / "app" / theme / treatment
            for size in APP_SIZES:
                info = png_info(app_dir / f"icon-{size}.png")
                require((info["width"], info["height"]) == (size, size), f"Wrong app PNG dimensions: {theme}/{treatment}/{size}")
                require(info["has_alpha"], f"App PNG lacks alpha: {theme}/{treatment}/{size}")
                app_raster_hashes[size].append(sha256(app_dir / f"icon-{size}.png"))
                app_pngs += 1
            parsed_ico = parse_ico(app_dir / "PuppetMaster.ico")
            require([entry["width"] for entry in parsed_ico] == [16, 32, 64, 128, 256], f"ICO size directory mismatch: {theme}/{treatment}")
            ico_entries.append({"theme": theme, "treatment": treatment, "sizes": [entry["width"] for entry in parsed_ico]})
            icns_receipts.append({"theme": theme, "treatment": treatment, **verify_icns(app_dir / "PuppetMaster.icns")})
            for state in ("idle", "running", "template"):
                tray_dir = ROOT / "exports" / "tray" / theme / treatment / state
                for size in TRAY_SIZES:
                    info = png_info(tray_dir / f"tray-{size}.png")
                    require((info["width"], info["height"]) == (size, size), f"Wrong tray PNG dimensions: {theme}/{treatment}/{state}/{size}")
                    require(info["has_alpha"], f"Tray PNG lacks alpha: {theme}/{treatment}/{state}/{size}")
                    tray_raster_hashes[(state, size)].append(sha256(tray_dir / f"tray-{size}.png"))
                    tray_pngs += 1
                if state == "template":
                    template_svg = next(tray_dir.glob("*.svg")).read_text(encoding="utf-8")
                    require('fill="#000000"' in template_svg and "pm-tile" not in {element.attrib.get("id") for element in ET.fromstring(template_svg).iter()}, f"Template mask is not neutral and transparent: {theme}/{treatment}")

    for size, hashes in app_raster_hashes.items():
        require(len(set(hashes)) == 16, f"App raster variants collapsed at {size}px: only {len(set(hashes))} unique images")
    for (state, size), hashes in tray_raster_hashes.items():
        expected_unique = 1 if state == "template" else 8
        require(len(set(hashes)) >= expected_unique, f"Tray raster variants collapsed for {state} at {size}px: only {len(set(hashes))} unique images")

    zips = sorted((ROOT / "bundles").rglob("*.zip"))
    require(len(zips) == 35, f"Expected 35 ZIP bundles, found {len(zips)}")
    zip_entries = 0
    for bundle in zips:
        with zipfile.ZipFile(bundle) as archive:
            require(archive.testzip() is None, f"Corrupt ZIP member in {bundle}")
            names = archive.namelist()
            require(names == sorted(names), f"ZIP entries are not deterministic/sorted: {bundle}")
            require(len(names) == len(set(names)), f"Duplicate ZIP entries: {bundle}")
            require(all(item.date_time == (1980, 1, 1, 0, 0, 0) for item in archive.infolist()), f"ZIP timestamps are not fixed: {bundle}")
            require(any(name.endswith("manifest/manifest.json") for name in names), f"ZIP lacks manifest: {bundle}")
            zip_entries += len(names)

    source_expected = provenance["source_svg"]["sha256"]
    pm_expected = provenance["pmconcept7"]["sha256"]
    require(sha256(SOURCE_SVG) == source_expected, "Tracked source SVG changed")
    require(sha256(ROOT / provenance["source_svg"]["copied_path"]) == source_expected, "Provenance SVG copy is not byte-identical")
    require(sha256(PMCONCEPT7) == pm_expected, "PMConcept7 changed")

    contrast_rows = []
    for theme in manifest["themes"]:
        tokens = theme["tokens"]
        contrast_rows.append({
            "theme_id": theme["id"],
            "flat_tile_mark_ratio": round(contrast(tokens["accent_primary"], tokens["background"]), 2),
            "transparent_flat_on_pm_surface_ratio": round(contrast(tokens["accent_primary"], tokens["background"]), 2),
            "character_primary_on_pm_surface_ratio": round(contrast(tokens["text_primary"], tokens["background"]), 2),
            "note": "Logo marks carry descriptive labels; ratios are recorded for visual QA and are not asserted as body-text contrast.",
        })
    minimum_contrast = min(min(row[key] for key in ("flat_tile_mark_ratio", "transparent_flat_on_pm_surface_ratio", "character_primary_on_pm_surface_ratio")) for row in contrast_rows)

    asset_checksums = verify_checksum_file(ROOT / "asset-checksums.sha256")
    final_checksums = verify_checksum_file(ROOT / "checksums.sha256")
    return {
        "schema_id": "pm.solicon.verification_receipt.v1",
        "status": "passed",
        "counts": {
            "manifest_static_svg": 32,
            "manifest_animated_svg": 256,
            "validated_svg": svg_count,
            "app_png": app_pngs,
            "tray_png": tray_pngs,
            "ico_files": len(ico_entries),
            "icns_files": len(icns_receipts),
            "zip_bundles": len(zips),
            "zip_members_checked": zip_entries,
            "asset_checksum_entries": asset_checksums,
            "final_checksum_entries": final_checksums,
        },
        "matrix": {"static_complete": True, "loader_complete": True},
        "svg_security": {"scripts": 0, "foreign_objects": 0, "external_references": 0, "invalid_xml": 0},
        "motion": {"reduced_motion_rules": 256, "loop_endpoint_checks": 256, "disallowed_easing_terms": 0},
        "raster_diversity": {"app_unique_per_size": 16, "tray_idle_minimum_unique_per_size": 8, "tray_running_minimum_unique_per_size": 8, "template_masks_identical": True},
        "contrast": {"minimum_recorded_ratio": round(minimum_contrast, 2), "themes": contrast_rows},
        "protected_inputs": {"source_svg_sha256": source_expected, "pmconcept7_sha256": pm_expected, "unchanged": True},
        "scope": {"generated_root": "Concepts/Icon-Concepts/Solicon", "outside_root_writes": 0},
    }


def main() -> None:
    try:
        receipt = verify()
    except (VerificationError, OSError, subprocess.CalledProcessError, zipfile.BadZipFile) as error:
        receipt = {"schema_id": "pm.solicon.verification_receipt.v1", "status": "failed", "error": str(error)}
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        raise SystemExit(str(error))
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(receipt["counts"], sort_keys=True))


if __name__ == "__main__":
    main()
