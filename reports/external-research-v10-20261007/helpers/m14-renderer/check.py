#!/usr/bin/env python3
"""Placeholder-only retention, rejection, CLI, and frozen-input checks."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("renderer", HERE / "render.py")
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
CASE = HERE.parent.parent / "cases/D-M14-A"
FROZEN = {
    "case-card.json": "67bc9697bc4abc6bc6b0169e5fee607444d326646eaccf308b7c9ce2587084e3",
    "INPUT_MAP.json": "d4d2d080347e39a13a63ea50aed387fae0cb2aeb74f2ec295155c6062292cfd9",
}


def placeholder():
    record = {key: [f"<{key} placeholder>"] for key, _ in renderer.VIEWS}
    record.update(id="PLACEHOLDER:1", summary="<summary placeholder>",
                  disposition="<disposition placeholder>",
                  sourcebinding={"id": "<source placeholder>", "hash": "<hash placeholder>",
                                 "locator": "<locator placeholder>"},
                  unknown={"nested": [None, False, 17, "<unicode λ and ``` placeholder>"]})
    return {"findings": [record], "unknown_document": "<document placeholder>"}


class Check(unittest.TestCase):
    def test_complete_retention_and_links(self):
        doc = placeholder()
        second = copy.deepcopy(doc["findings"][0])
        second.update(id="PLACEHOLDER.1", disposition="<other disposition placeholder>")
        doc["findings"].append(second)
        raw = json.dumps(doc, ensure_ascii=False, indent=1) + "\r\n"
        before = copy.deepcopy(doc)
        output = renderer.render(raw)
        self.assertEqual(doc, before)
        self.assertIn(renderer.fenced(raw, "json"), output)
        decision = output.split("## Decision view\n", 1)[1].split("## Evidence view", 1)[0]
        for record in doc["findings"]:
            identity = record["id"]
            a = renderer.anchor(identity)
            self.assertEqual(output.count(f'<a id="{a}"></a>'), 1)
            self.assertEqual(output.count(f"[Complete record](#{a})"), 8)
            self.assertIn(f"### {identity}", decision)
            self.assertIn(renderer.value_view(record["conditions"]), decision)
            # The full detail record round-trips every known and unknown value.
            detail = renderer.value_view(record)
            self.assertIn(detail, output)
            payload = detail.split("\n", 1)[1].rsplit("\n", 2)[0]
            self.assertEqual(json.loads(payload), record)
            for key, title in renderer.VIEWS:
                view = output.split(f"## {title} view\n", 1)[1].split("\n## ", 1)[0]
                self.assertIn(renderer.value_view(record[key]), view)
        self.assertNotEqual(renderer.anchor("PLACEHOLDER:1"), renderer.anchor("PLACEHOLDER.1"))

    def test_missing_required_material_and_collision(self):
        for key in renderer.REQUIRED:
            doc = placeholder()
            del doc["findings"][0][key]
            with self.assertRaisesRegex(ValueError, "missing"):
                renderer.render(json.dumps(doc))
        doc = placeholder()
        doc["findings"].append(copy.deepcopy(doc["findings"][0]))
        with self.assertRaisesRegex(ValueError, "identity collision"):
            renderer.render(json.dumps(doc))
        for bad in ('{"findings":[],"findings":[]}', '{"findings":[]}',
                    '{"findings":null}', '{"findings":[NaN]}'):
            with self.assertRaises(ValueError):
                renderer.render(bad)
        doc = placeholder()
        doc["findings"][0]["summary"] = " "
        with self.assertRaises(ValueError):
            renderer.render(json.dumps(doc))

    def test_cli_and_no_write_on_rejection(self):
        command = [sys.executable, str(HERE / "render.py")]
        raw = json.dumps(placeholder()).encode()
        result = subprocess.run(command, input=raw, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.decode(), renderer.render(raw.decode()))
        with tempfile.TemporaryDirectory(dir=HERE) as scratch:
            target = Path(scratch) / "placeholder.md"
            result = subprocess.run(command + ["-o", str(target)], input=b'{"findings":[]}',
                                    capture_output=True)
            self.assertEqual(result.returncode, 2)
            self.assertFalse(target.exists())
            target.write_bytes(b"<existing placeholder>")
            result = subprocess.run(command + ["-o", str(target)], input=raw, capture_output=True)
            self.assertEqual(result.returncode, 2)
            self.assertEqual(target.read_bytes(), b"<existing placeholder>")

    def test_frozen_case_inputs(self):
        for name, expected in FROZEN.items():
            self.assertEqual(hashlib.sha256((CASE / name).read_bytes()).hexdigest(), expected)


if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Check))
    if result.wasSuccessful():
        print(json.dumps({"renderer_version": renderer.VERSION,
                          "checks": result.testsRun, "status": "PASS",
                          "files_sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                                           for p in sorted(HERE.iterdir()) if p.is_file()},
                          "frozen_case_inputs_sha256": FROZEN}, indent=2))
    sys.exit(0 if result.wasSuccessful() else 1)
