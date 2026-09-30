#!/usr/bin/env python3
"""Run one isolated ZCode app-server session with an exact model and native Goal."""

import argparse
import hashlib
import json
import os
import queue
import subprocess
import sys
import threading
import time
from pathlib import Path


CLI = Path("/home/sittingmongoose/.local/opt/zcode/app.backup-3.11.2.6792/resources/glm/zcode.cjs")
BUILTIN = Path("/home/sittingmongoose/.local/opt/zcode/app/resources/config/provider/zcode-builtin.json")
MODEL = {"providerId": "builtin:zai-coding-plan", "modelId": "GLM-5.3-Flash", "options": {"reasoningLevel": "max"}}
TERMINAL = {"complete", "budget_limited"}
ADAPTERS = Path(__file__).resolve().parent
sys.path.insert(0, str(ADAPTERS))
from zcode_native import desktop_registry  # Existing official desktop provider projection.


class Protocol:
    def __init__(self, out_dir: Path):
        self.responses = queue.Queue()
        self.write_lock = threading.Lock()
        self.attention = None
        self.out_file = (out_dir / "zcode-stdout.jsonl").open("a", encoding="utf-8")
        self.err_file = (out_dir / "zcode-stderr.log").open("a", encoding="utf-8")
        personal = out_dir / "personal-provider.json"
        personal.write_text('{"providerRules":[]}\n', encoding="utf-8")
        personal.chmod(0o600)
        env = os.environ.copy()
        env["ZCODE_BUILTIN_PROVIDER_CONFIG_FILE"] = str(BUILTIN)
        env["ZCODE_PERSONAL_PROVIDER_CONFIG_FILE"] = str(personal)
        self.proc = subprocess.Popen(
            ["node", str(CLI), "app-server", "--no-color"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            env=env, start_new_session=True,
        )
        threading.Thread(target=self._stdout, daemon=True).start()
        threading.Thread(target=self._stderr, daemon=True).start()
        self.next_id = 1
        self.pending = {}

    def _stdout(self):
        for line in self.proc.stdout:
            self.out_file.write(line)
            self.out_file.flush()
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if "id" in obj:
                if "method" in obj:
                    self._server_request(obj)
                else:
                    self.responses.put(obj)
        self.responses.put(None)

    def _server_request(self, request):
        method = request["method"]
        if method == "session/requestRuntimePreferences":
            reply = {"id": request["id"], "result": {
                "nativeSearchEnhancementsEnabled": False,
                "memoryEnabled": False,
                "askUserQuestionAutoResolutionEnabled": False,
                "modelContextBudgetStrategy": "preflight-v1",
            }}
        else:
            self.attention = {"method": method, "params": request.get("params", {})}
            reply = {"id": request["id"], "error": {
                "code": -32000, "message": "Driver requires explicit attention for this request",
            }}
            self.responses.put({"id": "__attention__"})
        with self.write_lock:
            self.proc.stdin.write(json.dumps(reply) + "\n")
            self.proc.stdin.flush()

    def _stderr(self):
        for line in self.proc.stderr:
            self.err_file.write(line)
            self.err_file.flush()

    def call(self, method, params, timeout=45):
        request_id = f"driver-{self.next_id}"
        self.next_id += 1
        with self.write_lock:
            self.proc.stdin.write(json.dumps({"id": request_id, "method": method, "params": params}) + "\n")
            self.proc.stdin.flush()
        deadline = time.monotonic() + timeout
        while True:
            if request_id in self.pending:
                response = self.pending.pop(request_id)
            else:
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise TimeoutError(f"{method} timed out")
                response = self.responses.get(timeout=remaining)
                if response is None:
                    raise RuntimeError(f"app-server exited during {method}: {self.proc.poll()}")
                if response.get("id") == "__attention__":
                    raise RuntimeError(f"needs_attention: {self.attention}")
                if response.get("id") != request_id:
                    self.pending[response.get("id")] = response
                    continue
            if "error" in response:
                raise RuntimeError(f"{method}: {response['error']}")
            return response.get("result")

    def close(self):
        if self.proc.poll() is None:
            self.proc.stdin.close()
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.proc.terminate()
                self.proc.wait(timeout=5)
        self.out_file.close()
        self.err_file.close()


def emit(session, model, target, status):
    print(json.dumps({"session": session, "model": model, "goal": target, "status": status}), flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--workspace", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--prompt-file", type=Path)
    parser.add_argument("--provider-id", default=MODEL["providerId"])
    parser.add_argument("--base-commit")
    parser.add_argument("--probe", action="store_true", help="Verify the protocol and model without setting a Goal")
    parser.add_argument("--poll-seconds", type=float, default=5)
    parser.add_argument("--timeout-seconds", type=float, default=3600)
    args = parser.parse_args()
    if not args.probe and not args.prompt_file:
        parser.error("--prompt-file is required unless --probe is used")
    if not args.probe and not args.base_commit:
        parser.error("--base-commit is required for productive Goal receipts")
    workspace = args.workspace.resolve(strict=True)
    if not workspace.is_dir():
        parser.error("--workspace must be a directory")
    args.output_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    args.output_dir.chmod(0o700)
    objective = None if args.probe else args.prompt_file.read_text(encoding="utf-8").strip()
    if objective is not None and not objective:
        parser.error("prompt file is empty")
    model = {**MODEL, "providerId": args.provider_id}

    session = None
    target = None
    status = "starting"
    protocol = Protocol(args.output_dir)
    try:
        registry = desktop_registry(Path("/home/sittingmongoose/.zcode/v2/config.json"), f"{model['providerId']}/{model['modelId']}")
        admitted = protocol.call("workspace/updateProviderRegistry", {
            "workspace": {"workspacePath": str(workspace), "workspaceKey": str(workspace)},
            "registry": registry, "includeWorkspaceState": False,
        }, timeout=45)
        if admitted.get("status") not in {"applied", "unchanged"}:
            raise RuntimeError(f"model registry admission failed: {admitted.get('status')!r}")
        created = protocol.call("session/create", {
            "workspace": {"workspacePath": str(workspace), "workspaceKey": str(workspace)},
            "mode": "build",
            "model": {"providerId": model["providerId"], "modelId": model["modelId"]},
            "thoughtLevel": "max",
            "titleGenerationEnabled": False,
            "toolAllowlist": ["Read", "Bash", "Write", "Grep", "Glob"],
            "mcpServers": [],
        }, timeout=60)
        snapshot = created.get("snapshot", created)
        state = snapshot.get("session", {})
        session = state.get("sessionId") or created.get("sessionId")
        if not session:
            raise RuntimeError("session/create returned no sessionId")
        read = protocol.call("session/read", {"sessionId": session}, timeout=30)
        current_snapshot = read.get("snapshot", read)
        current = current_snapshot.get("settings", {}).get("model", {}).get("current", {})
        effort = current_snapshot.get("settings", {}).get("thoughtLevel", {}).get("current")
        if (current.get("providerId"), current.get("modelId"), effort) != (model["providerId"], model["modelId"], "max"):
            raise RuntimeError(f"model/effort receipt mismatch: {current.get('providerId')}/{current.get('modelId')} effort={effort}")
        emit(session, model, None, "model_verified")
        if args.probe:
            status = "probe_verified"
            emit(session, model, None, status)
            return 0

        activated = protocol.call("session/goal", {"sessionId": session, "action": "set", "objective": objective}, timeout=60)
        goal_snapshot = activated.get("snapshot", {})
        target = goal_snapshot.get("session", {}).get("target")
        if not target or target.get("objective") != objective or target.get("status") != "active":
            raise RuntimeError("native Goal activation receipt missing or mismatched")
        if activated.get("startedTurn") is not True:
            raise RuntimeError("native Goal is active but no turn was started")
        (args.output_dir / "goal-receipt.json").write_text(json.dumps({
            "sessionId": session, "model": model, "targetId": target.get("targetId"),
            "status": target.get("status"), "startedTurn": True,
            "promptSha256": hashlib.sha256(objective.encode("utf-8")).hexdigest(),
            "baseCommit": args.base_commit,
            "workspace": str(workspace),
        }, indent=2) + "\n", encoding="utf-8")
        status = "active"
        emit(session, model, target.get("targetId"), status)

        deadline = time.monotonic() + args.timeout_seconds
        while time.monotonic() < deadline:
            time.sleep(args.poll_seconds)
            shown = protocol.call("session/goal", {"sessionId": session, "action": "show"}, timeout=45)
            goal = shown.get("snapshot", {}).get("session", {}).get("target")
            if not goal or goal.get("targetId") != target.get("targetId"):
                raise RuntimeError("Goal identity changed or disappeared")
            next_status = goal.get("status")
            if next_status != status:
                status = next_status
                emit(session, model, target.get("targetId"), status)
            if status in TERMINAL:
                return 0 if status == "complete" else 2
            if status == "paused":
                emit(session, model, target.get("targetId"), "needs_attention")
                return 4
        status = "driver_timeout"
        emit(session, model, target.get("targetId"), status)
        return 3
    except Exception as exc:
        status = "needs_attention" if "needs_attention" in str(exc) else "driver_error"
        (args.output_dir / "driver-error.txt").write_text(f"{type(exc).__name__}: {exc}\n", encoding="utf-8")
        emit(session, model, target.get("targetId") if target else None, status)
        return 1
    finally:
        if session and status not in {"probe_verified", "complete", "budget_limited"}:
            try:
                protocol.call("session/stop", {"sessionId": session}, timeout=10)
            except Exception:
                pass
        if session:
            try:
                protocol.call("session/close", {"sessionId": session}, timeout=10)
            except Exception:
                pass
        protocol.close()


if __name__ == "__main__":
    sys.exit(main())
