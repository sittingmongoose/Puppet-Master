#!/usr/bin/env python3
"""Drive one native Muse Code Goal through its bundled MSP host."""

import argparse
import hashlib
import json
import queue
import secrets
import subprocess
import sys
import threading
import time
import uuid
from pathlib import Path


MUSE = Path("/home/sittingmongoose/.local/bin/muse-bin-1.4.0-R4161.1")
MODEL = "muse-spark-1.3-contributor"
EFFORT = "max"


def uuid7():
    millis = int(time.time() * 1000) & ((1 << 48) - 1)
    value = (millis << 80) | (7 << 76) | (secrets.randbits(12) << 64)
    value |= (2 << 62) | secrets.randbits(62)
    return str(uuid.UUID(int=value))


class Host:
    def __init__(self, output_dir=None, trust_workspace=False, durable=False):
        command = [str(MUSE), "serve"]
        if output_dir is None and not durable:
            command.append("--no-session-log")
        if trust_workspace:
            command.append("--trust-workspace")
        self.proc = subprocess.Popen(
            command, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
            stderr=subprocess.PIPE, text=True, bufsize=1,
        )
        self.frames = queue.Queue()
        self.events = queue.Queue()
        self.event_backlog = []
        self.pending = {}
        self.next_id = 1
        self.output = None
        self.errors = None
        if output_dir is not None:
            self.output = (output_dir / "muse-msp.jsonl").open("a", encoding="utf-8")
            self.errors = (output_dir / "muse-stderr.log").open("a", encoding="utf-8")
        threading.Thread(target=self._read_stdout, daemon=True).start()
        threading.Thread(target=self._read_stderr, daemon=True).start()

    def _read_stdout(self):
        for line in self.proc.stdout:
            if self.output:
                self.output.write(line)
                self.output.flush()
            try:
                frame = json.loads(line)
            except json.JSONDecodeError:
                continue
            if "id" in frame and "method" not in frame:
                self.frames.put(frame)
            else:
                self.events.put(frame)
        self.frames.put(None)

    def _read_stderr(self):
        for line in self.proc.stderr:
            if self.errors:
                self.errors.write(line)
                self.errors.flush()

    def call(self, method, params, timeout=45):
        request_id = self.next_id
        self.next_id += 1
        frame = {"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}
        self.proc.stdin.write(json.dumps(frame) + "\n")
        self.proc.stdin.flush()
        end = time.monotonic() + timeout
        while True:
            if request_id in self.pending:
                response = self.pending.pop(request_id)
            else:
                remaining = end - time.monotonic()
                if remaining <= 0:
                    raise TimeoutError(f"{method} response timed out")
                response = self.frames.get(timeout=remaining)
                if response is None:
                    raise RuntimeError(f"Muse host exited during {method}")
                if response.get("id") != request_id:
                    self.pending[response.get("id")] = response
                    continue
            if "error" in response:
                raise RuntimeError(f"{method} rejected: {response['error']}")
            return response["result"]

    def notify(self, method, params=None):
        frame = {"jsonrpc": "2.0", "method": method, "params": params or {}}
        self.proc.stdin.write(json.dumps(frame) + "\n")
        self.proc.stdin.flush()

    def event(self, method, session_id=None, timeout=30):
        end = time.monotonic() + timeout
        for index, frame in enumerate(self.event_backlog):
            params = frame.get("params", {})
            if frame.get("method") == method and (session_id is None or params.get("sessionId") == session_id):
                self.event_backlog.pop(index)
                return params
        while True:
            remaining = end - time.monotonic()
            if remaining <= 0:
                raise TimeoutError(f"{method} event timed out")
            try:
                frame = self.events.get(timeout=remaining)
            except queue.Empty as exc:
                raise TimeoutError(f"{method} event timed out") from exc
            params = frame.get("params", {})
            if frame.get("method") == method and (session_id is None or params.get("sessionId") == session_id):
                return params
            self.event_backlog.append(frame)

    def close(self):
        if self.proc.poll() is None:
            self.proc.stdin.close()
            try:
                self.proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.proc.terminate()
                self.proc.wait(timeout=3)
        if self.output:
            self.output.close()
        if self.errors:
            self.errors.close()


def require_model(host):
    catalog = host.call("model/list", {})
    rows = [item for item in catalog.get("models", []) if item.get("modelId") == MODEL]
    if len(rows) != 1:
        raise RuntimeError(f"model/list does not expose exactly one {MODEL} row")
    row = rows[0]
    variants = row.get("variants")
    if isinstance(variants, list) and EFFORT not in variants:
        raise RuntimeError(f"model/list does not offer {EFFORT} for {MODEL}: {variants}")
    return {"modelId": MODEL, "variants": variants, "source": catalog.get("source"),
            "providerId": row.get("providerId")}


def view_state(result):
    history = result.get("history", {})
    snapshot = history.get("snapshot") or {}
    return snapshot.get("state") or {}


def retained_goal(session_path):
    latest = None
    with Path(session_path).open(encoding="utf-8") as log:
        for line in log:
            frame = json.loads(line)
            payload = frame.get("payload", {})
            if payload.get("kind") == "goal_control_applied":
                latest = payload.get("record")
    if latest is None:
        raise RuntimeError("durable session contains no native Goal record")
    return latest


def retained_run_terminal(session_path, run_id):
    terminal = None
    with Path(session_path).open(encoding="utf-8") as log:
        for line in log:
            frame = json.loads(line)
            payload = frame.get("payload", {})
            if (payload.get("kind") == "run" and payload.get("run_id") == run_id
                    and payload.get("event", {}).get("kind") == "terminal"):
                terminal = payload["event"].get("terminal")
    return terminal


def wait_goal_durable(host, session_path, session_id, goal_id, turn_id, timeout_seconds, followup_text):
    end = time.monotonic() + timeout_seconds
    followup_sent = False
    last_report = None
    while time.monotonic() < end:
        goal_record = retained_goal(session_path)
        if goal_record.get("goal_id") != goal_id:
            raise RuntimeError("native Goal identity changed during continuation")
        goal_status = goal_record.get("goal", {}).get("status")
        terminal = retained_run_terminal(session_path, turn_id)
        report = (goal_status, terminal, turn_id)
        if report != last_report:
            print(json.dumps({"sessionId": session_id, "goalId": goal_id,
                              "goalStatus": goal_status, "turnId": turn_id,
                              "turnTerminal": terminal}), flush=True)
            last_report = report
        if goal_status == "complete" and terminal == "completed":
            return 0
        if goal_status in {"blocked", "paused", "budget_limited", "usage_limited"}:
            return 2
        if terminal in {"failed", "cancelled"}:
            return 2
        if terminal == "completed" and goal_status == "active":
            if followup_sent:
                raise RuntimeError("native turn completed again without Goal completion")
            time.sleep(3)
            if retained_goal(session_path).get("goal", {}).get("status") == "complete":
                continue
            followup = host.call("turn/start", {"commandId": uuid7(),
                                "sessionId": session_id, "reasoningEffort": EFFORT,
                                "input": [{"type": "text", "text": followup_text}]}, timeout=60)
            if followup.get("status") != "accepted":
                raise RuntimeError(f"same-Goal follow-up was not accepted: {followup}")
            turn_id = followup["turnId"]
            followup_sent = True
            continue
        time.sleep(5)
    raise TimeoutError("native Goal did not reach complete with a settled turn")


def wait_task_turn_durable(host, session_path, session_id, goal_id, turn_id, timeout_seconds):
    """Wait for the productive turn; keep Goal status a separate observed fact."""
    end = time.monotonic() + timeout_seconds
    last_report = None
    while time.monotonic() < end:
        record = retained_goal(session_path)
        if record.get("goal_id") != goal_id:
            raise RuntimeError("native Goal identity changed during productive turn")
        goal_status = record.get("goal", {}).get("status")
        terminal = retained_run_terminal(session_path, turn_id)
        report = (goal_status, terminal)
        if report != last_report:
            print(json.dumps({"sessionId": session_id, "goalId": goal_id,
                              "goalStatus": goal_status, "turnId": turn_id,
                              "turnTerminal": terminal}), flush=True)
            last_report = report
        if terminal == "completed":
            return 0
        if terminal in {"failed", "cancelled"}:
            return 2
        if host.proc.poll() is not None:
            raise RuntimeError("Muse host exited before productive turn terminal")
        time.sleep(5)
    raise TimeoutError("productive turn did not settle before driver timeout")


def wait_goal(host, session_id, turn_id, timeout_seconds):
    end = time.monotonic() + timeout_seconds
    while time.monotonic() < end:
        try:
            event = host.event("session/goalChanged", session_id,
                               timeout=min(30, max(1, end - time.monotonic())))
        except TimeoutError:
            if host.proc.poll() is not None:
                raise RuntimeError("Muse host exited while the Goal was active")
            continue
        goal = event.get("goal") or {}
        status = goal.get("status")
        print(json.dumps({"sessionId": session_id, "goalStatus": status}), flush=True)
        if status == "complete":
            try:
                terminal = host.event("turn/completed", session_id, timeout=60)
            except TimeoutError as exc:
                raise RuntimeError("Goal completed but turn terminal was not observed") from exc
            if terminal.get("turnId") != turn_id or terminal.get("terminal") != "completed":
                raise RuntimeError(f"Goal completed with unexpected turn terminal: {terminal.get('terminal')}")
            return 0
        if status in {"blocked", "paused", "budget_limited", "usage_limited"}:
            return 2
    raise TimeoutError("Goal did not reach a terminal state before driver timeout")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--probe", action="store_true", help="Read only: initialize and model/list")
    parser.add_argument("--inspect-session", help="Read a durable session without loading it")
    parser.add_argument("--resume-session", help="Attach to an existing durable native Goal session")
    parser.add_argument("--continue-existing-goal", action="store_true",
                        help="Wake the existing Goal after verifying its retained identity")
    parser.add_argument("--steer-file", type=Path,
                        help="Steer the resumed Goal turn with a bounded review or completion instruction")
    parser.add_argument("--workspace", type=Path)
    parser.add_argument("--prompt-file", type=Path)
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--approval-mode", choices=["allowAll", "onRequest", "promptUnmatched", "denyUnmatched"], default="onRequest")
    parser.add_argument("--timeout-seconds", type=int, default=3600)
    args = parser.parse_args()
    if not (args.probe or args.inspect_session or args.resume_session) and not (args.workspace and args.prompt_file and args.output_dir):
        parser.error("productive mode requires --workspace, --prompt-file, and --output-dir")
    if not MUSE.is_file():
        parser.error(f"Muse binary missing: {MUSE}")
    if args.probe:
        host = Host()
    elif args.inspect_session:
        host = Host(durable=True)
    elif args.resume_session:
        if not args.output_dir:
            parser.error("--resume-session requires --output-dir")
        args.output_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
        host = Host(args.output_dir, trust_workspace=True)
    else:
        workspace = args.workspace.resolve(strict=True)
        objective = args.prompt_file.read_text(encoding="utf-8").strip()
        if not objective:
            parser.error("prompt file is empty")
        args.output_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
        args.output_dir.chmod(0o700)
        host = Host(args.output_dir, trust_workspace=True)
    try:
        host.call("initialize", {"clientInfo": {"name": "packet_campaign", "version": "1.0"},
                                 "capabilities": {"userInputDialogs": False}})
        host.notify("initialized")
        if args.inspect_session:
            stored = host.call("session/read", {"sessionId": args.inspect_session,
                                                "excludeItems": False})
            state = view_state(stored)
            session = stored["session"]
            print(json.dumps({"sessionId": session.get("sessionId"),
                              "status": session.get("status"),
                              "modelId": session.get("modelId"),
                              "workspaceRoot": session.get("workspaceRoot"),
                              "activeTurnId": session.get("activeTurnId"),
                              "historyMode": stored.get("history", {}).get("mode"),
                              "goal": state.get("goal"),
                              "reasoningEffort": state.get("reasoningEffort")}), flush=True)
            return 0
        if args.resume_session:
            resumed = host.call("session/resume", {"commandId": uuid7(),
                                "sessionId": args.resume_session, "history": "anchored",
                                "excludeItems": False}, timeout=60)
            session = resumed["session"]
            state = view_state(resumed)
            if not args.continue_existing_goal:
                print(json.dumps({"status": "attached_existing_session",
                                  "sessionId": session.get("sessionId"),
                                  "modelId": session.get("modelId"),
                                  "workspaceRoot": session.get("workspaceRoot"),
                                  "activeTurnId": session.get("activeTurnId"),
                                  "historyMode": resumed.get("history", {}).get("mode"),
                                  "goal": state.get("goal"),
                                  "reasoningEffort": state.get("reasoningEffort")}), flush=True)
                return 0
            if not args.workspace or not args.prompt_file:
                raise RuntimeError("continuation requires --workspace and --prompt-file")
            workspace = args.workspace.resolve(strict=True)
            objective = args.prompt_file.read_text(encoding="utf-8").strip()
            old_receipt = json.loads((args.output_dir / "muse-goal-receipt.json").read_text(encoding="utf-8"))
            if session.get("modelId") != MODEL or session.get("workspaceRoot") != str(workspace):
                raise RuntimeError("resumed session model or workspace differs from original")
            if old_receipt.get("sessionId") != args.resume_session or old_receipt.get("reasoningEffort") != EFFORT:
                raise RuntimeError("original model/effort receipt mismatch")
            if old_receipt.get("promptSha256") != hashlib.sha256(objective.encode()).hexdigest():
                raise RuntimeError("original prompt hash differs from current prompt")
            retained = retained_goal(session["path"])
            if retained.get("goal", {}).get("objective") != objective:
                raise RuntimeError("retained native Goal objective differs from prompt")
            goal_id = retained.get("goal_id")
            if not goal_id:
                raise RuntimeError("retained native Goal has no identity")
            if retained.get("goal", {}).get("status") == "complete":
                print(json.dumps({"status": "already_complete", "sessionId": args.resume_session,
                                  "goalId": goal_id}), flush=True)
                return 0
            if session.get("activeTurnId"):
                print(json.dumps({"status": "already_running", "sessionId": args.resume_session,
                                  "turnId": session["activeTurnId"]}), flush=True)
                return wait_goal(host, args.resume_session, session["activeTurnId"], args.timeout_seconds)
            effort = host.call("session/setReasoningEffort", {"commandId": uuid7(),
                               "sessionId": args.resume_session, "reasoningEffort": EFFORT})
            if effort.get("status") != "accepted":
                raise RuntimeError("max reasoning effort was not accepted on resumed session")
            steer_text = None
            if args.steer_file:
                steer_text = args.steer_file.read_text(encoding="utf-8").strip()
                if not steer_text:
                    raise RuntimeError("steer file is empty")
            if retained.get("goal", {}).get("status") == "active":
                if not steer_text:
                    raise RuntimeError("active retained Goal needs --steer-file for a same-session turn")
                goal_ack = host.call("turn/start", {"commandId": uuid7(),
                                     "sessionId": args.resume_session,
                                     "reasoningEffort": EFFORT,
                                     "input": [{"type": "text", "text": steer_text}]}, timeout=60)
                if goal_ack.get("status") != "accepted" or not goal_ack.get("turnId"):
                    raise RuntimeError(f"same-Goal continuation was not accepted: {goal_ack}")
            else:
                goal_ack = host.call("goal/resume", {"commandId": uuid7(),
                                                     "sessionId": args.resume_session})
                if goal_ack.get("status") != "accepted" or not goal_ack.get("turnId"):
                    raise RuntimeError(f"existing Goal was not resumed: {goal_ack}")
            resumed_goal = retained_goal(session["path"])
            if (resumed_goal.get("goal_id") != goal_id or
                    resumed_goal.get("goal", {}).get("status") != "active"):
                raise RuntimeError("Goal identity changed during resume")
            if retained.get("goal", {}).get("status") != "active" and steer_text:
                steer = host.call("turn/steer", {"commandId": uuid7(),
                                  "sessionId": args.resume_session,
                                  "expectedTurnId": goal_ack["turnId"],
                                  "reasoningEffort": EFFORT,
                                  "input": [{"type": "text", "text": steer_text}]}, timeout=30)
                if steer.get("status") != "accepted" or steer.get("turnId") != goal_ack["turnId"]:
                    raise RuntimeError("completion/correction steer was not accepted")
            print(json.dumps({"status": "resumed_existing_goal", "sessionId": args.resume_session,
                              "goalId": goal_id, "turnId": goal_ack["turnId"],
                              "modelId": MODEL, "reasoningEffort": EFFORT}), flush=True)
            if steer_text:
                return wait_task_turn_durable(host, session["path"], args.resume_session,
                                              goal_id, goal_ack["turnId"], args.timeout_seconds)
            return wait_goal(host, args.resume_session, goal_ack["turnId"], args.timeout_seconds)
        model = require_model(host)
        if args.probe:
            print(json.dumps({"status": "catalog_verified", **model}), flush=True)
            return 0

        started = host.call("session/start", {"commandId": uuid7(), "modelId": MODEL,
                                              "providerId": model["providerId"],
                                              "workspaceRoot": str(workspace),
                                              "approvalMode": args.approval_mode}, timeout=60)
        session = started["session"]
        session_id = session["sessionId"]
        if session.get("modelId") != MODEL or session.get("workspaceRoot") != str(workspace):
            raise RuntimeError("session/start model or workspace receipt mismatch")

        effort = host.call("session/setReasoningEffort", {"commandId": uuid7(),
                           "sessionId": session_id, "reasoningEffort": EFFORT})
        if effort.get("status") != "accepted":
            raise RuntimeError(f"reasoning effort was not accepted: {effort}")
        changed = host.event("session/reasoningEffortChanged", session_id)
        if changed.get("reasoningEffort") != EFFORT:
            raise RuntimeError("reasoning effort event mismatch")

        goal_ack = host.call("goal/set", {"commandId": uuid7(), "sessionId": session_id,
                                          "objective": objective}, timeout=60)
        if goal_ack.get("status") != "accepted" or not goal_ack.get("turnId"):
            raise RuntimeError(f"native Goal did not start a turn: {goal_ack}")
        goal_event = host.event("session/goalChanged", session_id)
        goal = goal_event.get("goal") or {}
        if goal.get("objective") != objective or goal.get("status") != "active":
            raise RuntimeError(f"native Goal activation mismatch: {goal}")
        receipt = {"sessionId": session_id, "modelId": MODEL, "reasoningEffort": EFFORT,
                   "providerId": model["providerId"], "workspaceRoot": str(workspace),
                   "goalStatus": goal["status"], "turnId": goal_ack["turnId"],
                   "promptSha256": hashlib.sha256(objective.encode()).hexdigest()}
        receipt_path = args.output_dir / "muse-goal-receipt.json"
        receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
        receipt_path.chmod(0o600)
        print(json.dumps({"status": "active", **receipt}), flush=True)

        return wait_task_turn_durable(host, session["path"], session_id,
                                      retained_goal(session["path"])["goal_id"],
                                      goal_ack["turnId"], args.timeout_seconds)
    except Exception as exc:
        print(json.dumps({"status": "driver_error", "error": str(exc)}), file=sys.stderr)
        return 1
    finally:
        host.close()


if __name__ == "__main__":
    sys.exit(main())
