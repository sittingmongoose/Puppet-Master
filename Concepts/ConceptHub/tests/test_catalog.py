import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path


HUB_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HUB_DIR))

import catalog
import validate


class CatalogTests(unittest.TestCase):
    def test_live_catalog_inventory_and_authorship(self):
        data = catalog.build_catalog()
        self.assertEqual(data["counts"], {"topics": 6, "models": 25, "cards": 91})
        self.assertEqual(data["warnings"], [])
        by_id = {item["id"]: item for item in data["models"]}
        self.assertEqual(by_id["rail:cursor-side-panels"]["displayModel"], "Cursor")
        self.assertEqual(len(by_id["rail:cursor-side-panels"]["entries"]), 7)
        self.assertIsNotNone(by_id["rail:cursor-side-panels"]["workspace"])
        self.assertEqual(by_id["rail:cursor-side-panels"]["workspace"]["path"], "index.html")
        self.assertEqual(by_id["rail:qwen"]["workspace"]["path"], "index.html")
        self.assertEqual(by_id["usage:qwen-usage"]["workspace"]["path"], "index.html")
        self.assertEqual(len(by_id["usage:qwen-usage"]["entries"]), 10)
        self.assertEqual(by_id["usage:qwen-usage"]["entries"][-1]["path"], "u10-prism.html")
        self.assertEqual(by_id["rail:opus"]["workspace"]["path"], "index.html")
        self.assertEqual(by_id["rail:opus"]["entries"][0]["path"], "gallery.html")
        self.assertEqual(by_id["rail:unknown-panel-protos"]["displayModel"], "Unknown — panel-protos")
        self.assertTrue(by_id["rail:unknown-panel-protos"]["unknownModel"])
        self.assertEqual(by_id["notifications:notify-protos"]["displayModel"], "Unknown — notify-protos")
        self.assertEqual(len(by_id["notifications:notify-protos"]["entries"]), 6)
        self.assertIsNotNone(by_id["notifications:notify-protos"]["workspace"])
        self.assertEqual(by_id["notifications:notify-protos"]["workspace"]["controlMode"], "internal")
        self.assertIn("icons:cursor", by_id)
        self.assertEqual(by_id["icons:cursor"]["workspace"]["openActions"], "none")
        topics = {item["id"]: item for item in data["topics"]}
        self.assertNotIn("Assistant Chat", topics)
        self.assertNotIn("assistant-chat-concepts", topics)
        self.assertNotIn("settings-redesign-concepts", topics)
        self.assertEqual(topics["usage"]["widthControl"]["role"], "page")
        self.assertEqual(topics["rail"]["widthControl"]["role"], "panel")
        self.assertEqual(topics["chat-assistant"]["widthControl"]["role"], "chat")
        self.assertFalse(topics["icons"]["widthControl"]["enabled"])

    def test_frontend_has_visible_focus_exit_and_native_iframe_input(self):
        source = (HUB_DIR / "index.html").read_text(encoding="utf-8")
        script = (HUB_DIR / "assets" / "app.js").read_text(encoding="utf-8")
        self.assertIn('id="exitFocus"', source)
        self.assertNotIn('class="preview-input-proxy"', source)
        self.assertIn('button.querySelector("span").textContent = active ? "Exit Focus"', script)
        self.assertIn('profile.role === "panel"', script)
        self.assertIn('profile.role === "chat"', script)

    def test_preview_keeps_complete_shell_and_matches_visible_height(self):
        source = (HUB_DIR / "index.html").read_text(encoding="utf-8")
        script = (HUB_DIR / "assets" / "app.js").read_text(encoding="utf-8")
        self.assertIn('+ "hub=1"', script)
        self.assertNotIn('hub=1&embed=1', script)
        self.assertIn('Math.max(1, Math.ceil(stageHeight / scale))', script)
        self.assertNotIn('Math.max(720, Math.ceil(stageHeight / scale))', script)
        self.assertIn('/assets/styles.css?v=2', source)
        self.assertIn('/assets/app.js?v=2', source)
        self.assertIn('class="preview-retry"', source)
        self.assertIn('HUB_VERSION = 2', script)
        self.assertIn('/api/health?client=', script)
        self.assertIn('new IntersectionObserver', script)
        self.assertIn('MAX_PREVIEW_RETRIES = 2', script)

    def test_every_registered_target_exists(self):
        data = catalog.build_catalog()
        for model in data["models"]:
            self.assertFalse(model.get("broken"), model.get("problem"))
            for item in model.get("entries", []):
                self.assertFalse(item.get("broken"), f"{model['id']} {item.get('problem')}")
            if model.get("workspace"):
                self.assertFalse(model["workspace"].get("broken"), f"{model['id']} {model['workspace'].get('problem')}")

    def test_starter_becomes_valid_after_model_replacement(self):
        with tempfile.TemporaryDirectory() as temporary:
            target = Path(temporary) / "QwenRailConcepts"
            shutil.copytree(HUB_DIR / "starter" / "model-folder", target)
            manifest_path = target / "concept-hub.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["topic"] = "rail"
            manifest["model"] = "Qwen"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            page = target / "concept-01.html"
            page.write_text(page.read_text(encoding="utf-8").replace("YOUR MODEL", "Qwen"), encoding="utf-8")
            self.assertEqual(validate.validate(target), [])

    def test_validator_rejects_malformed_and_escaping_targets(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            malformed = root / "QwenBroken"
            malformed.mkdir()
            (malformed / "concept-hub.json").write_text("{not json", encoding="utf-8")
            self.assertIn("Cannot read", validate.validate(malformed)[0])

            escaping = root / "QwenRail"
            escaping.mkdir()
            (escaping / "concept-hub.json").write_text(json.dumps({
                "schemaVersion": 1,
                "topic": "rail",
                "model": "Qwen",
                "presentation": "entries",
                "entries": [
                    {"id": "unsafe", "title": "Unsafe", "path": "../outside.html"},
                    {"id": "unsafe", "title": "Missing", "path": "missing.html"},
                ],
            }), encoding="utf-8")
            errors = validate.validate(escaping)
            self.assertTrue(any("escapes its model folder" in error for error in errors))
            self.assertTrue(any("duplicate id" in error for error in errors))
            self.assertTrue(any("missing page" in error for error in errors))

    def test_validator_rejects_duplicate_model_folders(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name in ("QwenOne", "QwenTwo"):
                folder = root / name
                folder.mkdir()
                (folder / "concept.html").write_text(
                    '<div data-concept-model="Qwen">Qwen</div><script>/* pm-concept-ready pm-concept-state */</script>',
                    encoding="utf-8",
                )
                (folder / "concept-hub.json").write_text(json.dumps({
                    "schemaVersion": 1,
                    "topic": "rail",
                    "model": "Qwen",
                    "presentation": "entries",
                    "entries": [{"id": "one", "title": "One", "path": "concept.html"}],
                }), encoding="utf-8")
            errors = validate.validate(root / "QwenOne")
            self.assertTrue(any("duplicate model folder" in error for error in errors))

    def test_validator_rejects_temporary_test_artifacts(self):
        with tempfile.TemporaryDirectory() as temporary:
            target = Path(temporary) / "QwenRailConcepts"
            shutil.copytree(HUB_DIR / "starter" / "model-folder", target)
            manifest_path = target / "concept-hub.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["topic"] = "rail"
            manifest["model"] = "Qwen"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            page = target / "concept-01.html"
            page.write_text(page.read_text(encoding="utf-8").replace("YOUR MODEL", "Qwen"), encoding="utf-8")
            output = target / "test-results"
            output.mkdir()
            (output / "recording.webm").write_bytes(b"temporary")

            errors = validate.validate(target)

            self.assertTrue(any("temporary test/verification artifacts" in error for error in errors))
            self.assertTrue(any("test-results/" in error for error in errors))

    def test_future_manifest_is_discovered_without_catalog_edit(self):
        original_concepts = catalog.CONCEPTS_DIR
        original_legacy = catalog.LEGACY_CATALOG
        original_overrides = catalog.OVERRIDES_FILE
        try:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary).resolve()
                folder = root / "future-topic" / "SolConcepts"
                folder.mkdir(parents=True)
                (folder / "concept.html").write_text(
                    '<div data-concept-model="Sol">Sol</div><script>/* pm-concept-ready pm-concept-state */</script>',
                    encoding="utf-8",
                )
                (folder / "concept-hub.json").write_text(json.dumps({
                    "schemaVersion": 1,
                    "topic": "future-topic",
                    "model": "Sol",
                    "presentation": "entries",
                    "entries": [{"id": "future", "title": "Future", "path": "concept.html"}],
                }), encoding="utf-8")
                legacy = root / "catalog-legacy.json"
                legacy.write_text('{"schemaVersion":1,"topics":[],"models":[]}', encoding="utf-8")
                overrides = root / "catalog-overrides.json"
                overrides.write_text('{"schemaVersion":1,"labels":{}}', encoding="utf-8")
                catalog.CONCEPTS_DIR = root
                catalog.LEGACY_CATALOG = legacy
                catalog.OVERRIDES_FILE = overrides
                data = catalog.build_catalog()
                self.assertEqual(data["counts"], {"topics": 1, "models": 1, "cards": 1})
                self.assertEqual(data["models"][0]["source"], "manifest")
                self.assertEqual(data["models"][0]["displayModel"], "Sol")
        finally:
            catalog.CONCEPTS_DIR = original_concepts
            catalog.LEGACY_CATALOG = original_legacy
            catalog.OVERRIDES_FILE = original_overrides


if __name__ == "__main__":
    unittest.main()
