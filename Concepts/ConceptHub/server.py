#!/usr/bin/env python3
"""Dependency-free local and LAN server for the Puppet Master Concept Hub."""

from __future__ import annotations

import argparse
import ipaddress
import json
import mimetypes
import os
import secrets
import socket
import sys
import tempfile
import threading
import urllib.error
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from urllib.parse import unquote, urlsplit

from catalog import CONCEPTS_DIR, HUB_DIR, OVERRIDES_FILE, build_catalog, read_json, safe_child


SERVICE_NAME = "puppetmaster-concept-hub"
SERVICE_VERSION = 2
PREFERRED_PORT = 4177
RUNTIME_FILE = Path(tempfile.gettempdir()) / f"puppetmaster-concept-hub-{os.getuid()}.json"


def is_loopback_address(address: str) -> bool:
    try:
        return ipaddress.ip_address(address).is_loopback
    except ValueError:
        return False


class ConceptHubServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    request_queue_size = 128

    def __init__(self, address: Tuple[str, int], handler: type[BaseHTTPRequestHandler]):
        super().__init__(address, handler)
        self.write_token = secrets.token_urlsafe(24)


class ConceptHubHandler(BaseHTTPRequestHandler):
    server_version = "ConceptHub/2"
    protocol_version = "HTTP/1.1"

    def log_message(self, message: str, *args: Any) -> None:
        try:
            sys.stdout.write(f"[{self.log_date_time_string()}] {self.client_address[0]} {message % args}\n")
            sys.stdout.flush()
        except OSError:
            # A browser request must not fail just because its launcher window
            # was closed or its output stream is no longer available.
            pass

    def _is_loopback(self) -> bool:
        return is_loopback_address(self.client_address[0])

    def _send_headers(self, status: int, content_type: str, length: int = 0) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(length))
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.end_headers()

    def _write_body(self, body: bytes) -> None:
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            # Tabs can close while a large concept is being transferred. That
            # is a normal client disconnect and should not affect other cards.
            pass

    def _json(self, status: int, payload: Dict[str, Any], head_only: bool = False) -> None:
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self._send_headers(status, "application/json; charset=utf-8", len(body))
        if not head_only:
            self._write_body(body)

    def _serve_file(self, path: Path, head_only: bool = False) -> None:
        try:
            resolved = path.resolve(strict=True)
            resolved.relative_to(CONCEPTS_DIR)
            if not resolved.is_file():
                raise FileNotFoundError
            body = resolved.read_bytes()
        except (OSError, ValueError, FileNotFoundError):
            self._json(404, {"error": "File not found"}, head_only)
            return
        content_type = mimetypes.guess_type(resolved.name)[0] or "application/octet-stream"
        if content_type.startswith("text/") or content_type in {"application/javascript", "application/json", "image/svg+xml"}:
            content_type += "; charset=utf-8"
        self._send_headers(200, content_type, len(body))
        if not head_only:
            self._write_body(body)

    def _route_file(self, request_path: str) -> Optional[Path]:
        if request_path in {"/", "/index.html", "/hub", "/hub/"}:
            return HUB_DIR / "index.html"
        if request_path.startswith("/assets/"):
            try:
                return safe_child(HUB_DIR / "assets", unquote(request_path[len("/assets/"):]))
            except ValueError:
                return None
        if request_path.startswith("/concepts/"):
            try:
                return safe_child(CONCEPTS_DIR, unquote(request_path[len("/concepts/"):]))
            except ValueError:
                return None
        return None

    def _handle_get(self, head_only: bool = False) -> None:
        request_path = urlsplit(self.path).path
        if request_path == "/api/health":
            self._json(200, {
                "service": SERVICE_NAME,
                "version": SERVICE_VERSION,
                "port": self.server.server_address[1],
            }, head_only)
            return
        if request_path == "/api/catalog":
            self._json(200, build_catalog(self._is_loopback(), self.server.write_token), head_only)
            return
        if request_path == "/favicon.ico":
            self._send_headers(204, "image/x-icon", 0)
            return
        target = self._route_file(request_path)
        if target is None:
            self._json(404, {"error": "Route not found"}, head_only)
            return
        self._serve_file(target, head_only)

    def do_GET(self) -> None:
        self._handle_get(False)

    def do_HEAD(self) -> None:
        self._handle_get(True)

    def do_OPTIONS(self) -> None:
        self._json(405, {"error": "Cross-origin writes are not allowed"})

    def do_POST(self) -> None:
        request_path = urlsplit(self.path).path
        if request_path != "/api/labels":
            self._json(404, {"error": "Route not found"})
            return
        if not self._is_loopback():
            self._json(403, {"error": "Labels can only be edited from this Mac using localhost"})
            return
        if self.headers.get("X-Concept-Hub-Token") != self.server.write_token:
            self._json(403, {"error": "The label-edit session expired. Reload the Hub and try again."})
            return
        fetch_site = self.headers.get("Sec-Fetch-Site")
        if fetch_site not in {None, "none", "same-origin"}:
            self._json(403, {"error": "Cross-origin writes are not allowed"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > 4096:
            self._json(400, {"error": "Label request is empty or too large"})
            return
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            model_id = str(payload.get("modelId", "")).strip()
            label = str(payload.get("label", "")).strip()
        except (UnicodeDecodeError, json.JSONDecodeError, AttributeError):
            self._json(400, {"error": "Label request must be a JSON object"})
            return
        catalog = build_catalog()
        valid_ids = {item.get("id") for item in catalog.get("models", [])}
        if model_id not in valid_ids:
            self._json(404, {"error": "Unknown model entry"})
            return
        if not label or len(label) > 80 or any(ord(char) < 32 for char in label):
            self._json(400, {"error": "Label must be 1–80 visible characters"})
            return
        try:
            overrides = read_json(OVERRIDES_FILE)
        except (OSError, ValueError, json.JSONDecodeError):
            overrides = {"schemaVersion": 1, "labels": {}}
        labels = overrides.setdefault("labels", {})
        if not isinstance(labels, dict):
            labels = {}
            overrides["labels"] = labels
        labels[model_id] = label
        temporary = OVERRIDES_FILE.with_suffix(".json.tmp")
        try:
            with temporary.open("w", encoding="utf-8") as handle:
                json.dump(overrides, handle, ensure_ascii=False, indent=2)
                handle.write("\n")
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary, OVERRIDES_FILE)
        except OSError as exc:
            try:
                temporary.unlink(missing_ok=True)
            except OSError:
                pass
            self._json(500, {"error": f"Could not save label: {exc}"})
            return
        self._json(200, {"ok": True, "modelId": model_id, "label": label, "unknownModel": False})


def health_at(port: int) -> Optional[Dict[str, Any]]:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/health", timeout=0.35) as response:
            data = json.load(response)
        if data.get("service") == SERVICE_NAME:
            return data
    except (OSError, urllib.error.URLError, ValueError, json.JSONDecodeError):
        return None
    return None


def is_current_hub(health: Optional[Dict[str, Any]]) -> bool:
    if not health or health.get("service") != SERVICE_NAME:
        return False
    try:
        return int(health.get("version", -1)) == SERVICE_VERSION
    except (TypeError, ValueError):
        return False


def port_accepts_connections(port: int) -> bool:
    if port <= 0:
        return False
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.25):
            return True
    except OSError:
        return False


def existing_port(preferred: int) -> Optional[int]:
    if preferred <= 0:
        return None
    if is_current_hub(health_at(preferred)):
        return preferred
    try:
        state = read_json(RUNTIME_FILE)
        port = int(state.get("port", 0))
        if port and is_current_hub(health_at(port)):
            return port
    except (OSError, ValueError, TypeError, json.JSONDecodeError):
        pass
    return None


def lan_address() -> Optional[str]:
    probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        probe.connect(("8.8.8.8", 80))
        address = probe.getsockname()[0]
        return address if not ipaddress.ip_address(address).is_loopback else None
    except OSError:
        return None
    finally:
        probe.close()


def display_urls(port: int) -> None:
    hostname = socket.gethostname().split(".")[0]
    local_url = f"http://127.0.0.1:{port}/"
    print("\nPuppet Master Concept Hub")
    print(f"  This Mac:     {local_url}")
    address = lan_address()
    if address:
        print(f"  Local network: http://{address}:{port}/")
    if hostname:
        print(f"  Local name:    http://{hostname}.local:{port}/")
    print("\nKeep this window open. Press Control-C to stop the Hub.\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve the Puppet Master Concept Hub")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=PREFERRED_PORT)
    parser.add_argument("--no-browser", action="store_true")
    parser.add_argument("--no-runtime-state", action="store_true")
    args = parser.parse_args()

    running = existing_port(args.port)
    if running:
        display_urls(running)
        if not args.no_browser:
            webbrowser.open(f"http://127.0.0.1:{running}/")
        print("An existing Concept Hub is already running; this launcher can close.")
        return 0

    used_fallback_port = args.port > 0 and port_accepts_connections(args.port)
    if used_fallback_port:
        server = ConceptHubServer((args.host, 0), ConceptHubHandler)
    else:
        try:
            server = ConceptHubServer((args.host, args.port), ConceptHubHandler)
        except OSError:
            used_fallback_port = True
            server = ConceptHubServer((args.host, 0), ConceptHubHandler)
    port = int(server.server_address[1])
    if not args.no_runtime_state:
        RUNTIME_FILE.write_text(json.dumps({"pid": os.getpid(), "port": port}) + "\n", encoding="utf-8")
    if used_fallback_port:
        print(f"Port {args.port} is occupied by another service or an older Concept Hub; using a free port instead.")
    display_urls(port)
    if not args.no_browser:
        threading.Timer(0.2, lambda: webbrowser.open(f"http://127.0.0.1:{port}/")).start()
    try:
        server.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        print("\nStopping Concept Hub…")
    finally:
        server.server_close()
        if not args.no_runtime_state:
            try:
                state = read_json(RUNTIME_FILE)
                if int(state.get("pid", -1)) == os.getpid():
                    RUNTIME_FILE.unlink(missing_ok=True)
            except (OSError, ValueError, TypeError, json.JSONDecodeError):
                pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
