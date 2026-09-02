#!/usr/bin/env python3
"""Pure/adversarial tests for the provenance-v2 external launcher.

No Node, verifier, Playwright, browser, or network namespace is launched.
"""

from __future__ import annotations

import hashlib
import importlib.util
import io
import json
import os
import sys
import tempfile
from contextlib import redirect_stderr
from pathlib import Path

LAUNCHER_PATH = Path(__file__).with_name("browser_verifier_provenance_launcher.py")
SPEC = importlib.util.spec_from_file_location("browser_verifier_provenance_launcher", LAUNCHER_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("unable to load launcher under test")
launcher = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(launcher)


RESULTS: list[dict[str, object]] = []


def test(name: str, callback) -> None:
    try:
        callback()
        RESULTS.append({"name": name, "pass": True})
    except Exception as error:  # noqa: BLE001 - test receipt needs any failure
        RESULTS.append({"name": name, "pass": False, "error": repr(error)})


def rejects(callback, expected: type[BaseException] = launcher.LaunchError) -> None:
    try:
        callback()
    except expected:
        return
    raise AssertionError(f"expected {expected.__name__}")


def strict_option_attacks() -> None:
    rejects(lambda: launcher.reject_duplicate_or_equals_options(["--x", "1", "--x", "2"]))
    rejects(lambda: launcher.reject_duplicate_or_equals_options(["--x=1"]))
    assert launcher.verifier_extra_arguments('["--focused-smoke","on"]') == ["--focused-smoke", "on"]
    for attack in (
        '["--file","/replacement"]',
        '["--x","1","--x","2"]',
        '["--x=1","2"]',
        '["--x"]',
        '["x","1"]',
        '["--x","--value"]',
        '{}',
        'not-json',
    ):
        rejects(lambda attack=attack: launcher.verifier_extra_arguments(attack))


def tree_and_path_attacks() -> None:
    with tempfile.TemporaryDirectory(prefix="pm-prov-launcher-tree-") as temporary:
        root = Path(temporary)
        real = root / "real"
        real.mkdir()
        (real / "a.js").write_bytes(b"a")
        first, _ = launcher.tree_manifest(str(real))
        second, _ = launcher.tree_manifest(str(real))
        assert first["manifest_sha256"] == second["manifest_sha256"]
        assert first["rows"][0]["sha256"] == hashlib.sha256(b"a").hexdigest()
        alias = root / "alias"
        alias.symlink_to(real, target_is_directory=True)
        rejects(lambda: launcher.tree_manifest(str(alias)), OSError)
        leaf = real / "leaf"
        leaf.symlink_to(real / "a.js")
        rejects(lambda: launcher.tree_manifest(str(real)))
        leaf.unlink()
        rejects(lambda: launcher.binding_from_open_file("wrong", str(real / "a.js"), "9" * 64))
        rejects(lambda: launcher.binding_from_open_file("directory", str(real), first["manifest_sha256"]))


def private_staging_preserves_the_content_manifest() -> None:
    with tempfile.TemporaryDirectory(prefix="pm-prov-launcher-stage-") as temporary:
        root = Path(temporary)
        source = root / "source"
        source.mkdir()
        (source / "lib").mkdir()
        (source / "index.js").write_bytes(b"module.exports = 1;\n")
        (source / "lib" / "child.js").write_bytes(b"module.exports = 2;\n")
        source_manifest, contents = launcher.tree_manifest(str(source), retain_content=True)
        stage = root / "stage"
        stage.mkdir(mode=0o700)
        _, staged_package = launcher.stage_playwright(str(stage), contents, source_manifest["rows"])
        staged_manifest, _ = launcher.tree_manifest(staged_package)
        assert staged_manifest["manifest_sha256"] == source_manifest["manifest_sha256"]
        assert staged_manifest["file_count"] == source_manifest["file_count"]


def atomic_receipt_and_output_binding() -> None:
    with tempfile.TemporaryDirectory(prefix="pm-prov-launcher-output-") as temporary:
        directory, descriptor = launcher.ensure_output_directory(temporary)
        try:
            receipt = {"schema_id": "fixture", "status": "failed"}
            digest = launcher.atomic_write_json(descriptor, "receipt.json", receipt)
            content = (Path(directory) / "receipt.json").read_bytes()
            assert digest == hashlib.sha256(content).hexdigest()
            assert json.loads(content) == receipt
            rejects(lambda: launcher.atomic_write_json(descriptor, "../escape.json", receipt))
        finally:
            os.close(descriptor)


def parser_is_non_abbreviating_and_exact() -> None:
    parser = launcher.parser()
    for argv in (["manifest", "--dire", "/tmp"],):
        try:
            with redirect_stderr(io.StringIO()):
                parser.parse_args(argv)
        except SystemExit:
            pass
        else:
            raise AssertionError(f"parser accepted non-exact argv: {argv}")


def live_launcher_and_python_process_bind() -> None:
    class Arguments:
        expected_launcher_sha256 = hashlib.sha256(LAUNCHER_PATH.read_bytes()).hexdigest()
        expected_python_sha256 = hashlib.sha256(Path(sys.executable).read_bytes()).hexdigest()

    receipt = launcher.launcher_binding(Arguments())
    assert receipt["source"]["sha256"] == Arguments.expected_launcher_sha256
    assert receipt["python"]["sha256"] == Arguments.expected_python_sha256
    assert receipt["running_process"]["sha256"] == Arguments.expected_python_sha256


test("strict duplicate/equals/extra-argument attacks reject", strict_option_attacks)
test("tree/path ancestor and leaf symlink attacks reject", tree_and_path_attacks)
test("private read-only staging preserves exact content manifest", private_staging_preserves_the_content_manifest)
test("atomic durable output receipt is exact and contained", atomic_receipt_and_output_binding)
test("argparse abbreviations reject", parser_is_non_abbreviating_and_exact)
test("live direct Python and launcher source identities bind", live_launcher_and_python_process_bind)

failures = [row for row in RESULTS if not row["pass"]]
print(json.dumps({
    "schema_id": "pm.browser_verifier_provenance_launcher_selftest.v2",
    "browser_launched": False,
    "child_launched": False,
    "tests": len(RESULTS),
    "passed": len(RESULTS) - len(failures),
    "failed": len(failures),
    "failures": failures,
}, indent=2, sort_keys=True))
raise SystemExit(1 if failures else 0)
