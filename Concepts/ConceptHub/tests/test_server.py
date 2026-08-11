import json
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest import mock


HUB_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HUB_DIR))

import server as hub_server


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = hub_server.ConceptHubServer(("127.0.0.1", 0), hub_server.ConceptHubHandler)
        cls.port = cls.server.server_address[1]
        cls.thread = threading.Thread(target=cls.server.serve_forever, kwargs={"poll_interval": 0.05}, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def get(self, path):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}{path}", timeout=2) as response:
            return response.status, response.headers, response.read()

    def test_health_catalog_and_hub(self):
        status, _, body = self.get("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["service"], hub_server.SERVICE_NAME)
        status, _, body = self.get("/api/catalog")
        payload = json.loads(body)
        self.assertEqual(status, 200)
        self.assertTrue(payload["canEdit"])
        self.assertTrue(payload["writeToken"])
        status, headers, body = self.get("/")
        self.assertEqual(status, 200)
        self.assertIn(b"Puppet Master", body)
        self.assertIn("no-store", headers["Cache-Control"])
        self.assertIn("no-cache", headers["Cache-Control"])
        self.assertEqual(headers["Pragma"], "no-cache")
        self.assertEqual(headers["Expires"], "0")

    def test_server_is_sized_for_nested_live_workspaces(self):
        self.assertGreaterEqual(hub_server.ConceptHubServer.request_queue_size, 128)
        self.assertEqual(hub_server.ConceptHubHandler.protocol_version, "HTTP/1.1")
        self.assertTrue(hub_server.port_accepts_connections(self.port))
        self.assertFalse(hub_server.port_accepts_connections(0))
        self.assertTrue(hub_server.is_current_hub({
            "service": hub_server.SERVICE_NAME,
            "version": hub_server.SERVICE_VERSION,
        }))
        self.assertFalse(hub_server.is_current_hub({
            "service": hub_server.SERVICE_NAME,
            "version": hub_server.SERVICE_VERSION - 1,
        }))

    def test_concept_file_and_directory_listing_boundary(self):
        status, _, body = self.get("/concepts/rail-concepts/side-panel-cursor/shells/01-stacked-rail.html")
        self.assertEqual(status, 200)
        self.assertIn(b"Stacked Rail", body)
        for path in ("/concepts/rail-concepts/", "/concepts/%2e%2e/AGENTS.md", "/missing"):
            with self.assertRaises(urllib.error.HTTPError) as caught:
                self.get(path)
            self.assertEqual(caught.exception.code, 404)

    def test_label_write_requires_loopback_token_and_is_atomic(self):
        original = hub_server.OVERRIDES_FILE
        try:
            with tempfile.TemporaryDirectory() as temporary:
                hub_server.OVERRIDES_FILE = Path(temporary) / "catalog-overrides.json"
                hub_server.OVERRIDES_FILE.write_text('{"schemaVersion":1,"labels":{}}\n', encoding="utf-8")
                request = urllib.request.Request(
                    f"http://127.0.0.1:{self.port}/api/labels",
                    data=json.dumps({"modelId": "rail:unknown-panel-protos", "label": "Confirmed Model"}).encode("utf-8"),
                    headers={"Content-Type": "application/json", "X-Concept-Hub-Token": self.server.write_token},
                    method="POST",
                )
                with urllib.request.urlopen(request, timeout=2) as response:
                    self.assertEqual(response.status, 200)
                    payload = json.loads(response.read())
                self.assertFalse(payload["unknownModel"])
                saved = json.loads(hub_server.OVERRIDES_FILE.read_text(encoding="utf-8"))
                self.assertEqual(saved["labels"]["rail:unknown-panel-protos"], "Confirmed Model")
                self.assertFalse(hub_server.OVERRIDES_FILE.with_suffix(".json.tmp").exists())
        finally:
            hub_server.OVERRIDES_FILE = original

    def test_rejects_bad_token_and_non_loopback_addresses(self):
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/api/labels",
            data=b'{"modelId":"rail:qwen","label":"Qwen"}',
            headers={"Content-Type": "application/json", "X-Concept-Hub-Token": "wrong"},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request, timeout=2)
        self.assertEqual(caught.exception.code, 403)
        self.assertTrue(hub_server.is_loopback_address("127.0.0.1"))
        self.assertTrue(hub_server.is_loopback_address("::1"))
        self.assertFalse(hub_server.is_loopback_address("192.168.50.20"))

    def test_explicit_port_zero_never_reuses_shared_runtime(self):
        original = hub_server.RUNTIME_FILE
        try:
            with tempfile.TemporaryDirectory() as temporary:
                hub_server.RUNTIME_FILE = Path(temporary) / "runtime.json"
                hub_server.RUNTIME_FILE.write_text(json.dumps({"pid": 1, "port": self.port}), encoding="utf-8")
                self.assertIsNone(hub_server.existing_port(0))
        finally:
            hub_server.RUNTIME_FILE = original

    def test_stale_hub_version_is_not_reused(self):
        stale = {"service": hub_server.SERVICE_NAME, "version": hub_server.SERVICE_VERSION - 1}
        with mock.patch.object(hub_server, "health_at", return_value=stale):
            self.assertIsNone(hub_server.existing_port(4177))


if __name__ == "__main__":
    unittest.main()
