#!/usr/bin/env python3
"""Run ONE fresh native Goal assignment in Muse Code or zcode with live caps.

Reuses the existing drivers' transports (copied verbatim, sha pinned in dev/adapter-pins.sha256):
- Muse Code 1.4.0 MSP host (`muse serve`): session/start -> setReasoningEffort(max) -> goal/set.
- zcode app-server (official CLI 0.16.5): updateProviderRegistry -> session/create(max) -> session/goal set.
goal/set and session/goal set are each app's native /goal entry; the objective is the text after /goal.

The host counts native model responses from the app's own events, enforces the time and response
caps (stopping the session, never retrying) and writes receipt.json. It never sends follow-up
content to the candidate. Candidate semantics stay in the candidate session.
"""
import argparse
import hashlib
import json
import os
import queue
import signal
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS))


def utc(t=None):
    return datetime.fromtimestamp(t if t is not None else time.time(), timezone.utc).isoformat()


def log(out, obj):
    obj = {"t": utc(), **obj}
    print(json.dumps(obj), flush=True)
    with (out / "progress.jsonl").open("a") as f:
        f.write(json.dumps(obj) + "\n")


class AssignmentCap(TimeoutError):
    pass


def cap_alarm(signum, frame):
    raise AssignmentCap('whole assignment setup/execution cutoff; cleanup reserve starts')


def group_members(pgid):
    members=[]
    for path in Path('/proc').glob('[0-9]*/stat'):
        try:
            raw=path.read_text()
            fields=raw[raw.rfind(')')+2:].split()
            if int(fields[2])==pgid:
                members.append({'pid':int(path.parent.name),'state':fields[0]})
        except (OSError,ValueError,IndexError):
            continue
    return members


def bound_rpc(host, args):
    original=host.call
    host._uncapped_call=original
    def call(method, params, timeout=30, **kw):
        remaining=args.start_monotonic+args.max_seconds-30-time.monotonic()
        if remaining<=0:
            raise AssignmentCap('RPC deadline reached')
        return original(method,params,timeout=min(timeout,remaining),**kw)
    host.call=call


def cleanup_native(host, receipt, calls):
    # Only this fresh host's dedicated PGID is touched. No sibling/native desktop process.
    signal.setitimer(signal.ITIMER_REAL,0)
    if hasattr(host,'_uncapped_call'):
        host.call=host._uncapped_call
    cleanup_deadline=time.monotonic()+25
    receipt['native_process_pid']=host.proc.pid
    receipt['native_process_group']=host.proc.pid
    receipt['cleanup_actions']=[]
    for method, params in calls:
        remaining=cleanup_deadline-time.monotonic()
        if remaining<=3 or host.proc.poll() is not None:
            break
        try:
            result=host.call(method,params,timeout=min(3,remaining-2))
            receipt['cleanup_actions'].append({'method':method,'result':result})
        except Exception as exc:
            receipt['cleanup_actions'].append({'method':method,'error':str(exc)})
    try:
        host.close()
    except Exception as exc:
        receipt['cleanup_close_error']=str(exc)
    if group_members(host.proc.pid):
        try:
            os.killpg(host.proc.pid,signal.SIGTERM)
        except ProcessLookupError:
            pass
        time.sleep(.2)
    if group_members(host.proc.pid):
        try:
            os.killpg(host.proc.pid,signal.SIGKILL)
        except ProcessLookupError:
            pass
    try:
        host.proc.wait(timeout=3)
    except subprocess.TimeoutExpired:
        receipt['cleanup_wait_timeout']=True
    remaining=group_members(host.proc.pid)
    receipt['native_process_returncode']=host.proc.poll()
    receipt['native_process_group_remaining']=remaining
    receipt['own_process_group_absent']=not remaining
    receipt['native_quiescent']=host.proc.poll() is not None and not remaining
    receipt['native_quiescence_basis']='fresh host reaped plus dedicated process group absent; server teardown bounds active native work'


# ---------------------------------------------------------------- Muse Code
def run_muse(args, objective, out, receipt):
    import muse_goal_driver as mg
    host = mg.Host(out, trust_workspace=True)
    bound_rpc(host,args)
    sid = None
    counters = {"token_usage_events": 0, "prompt_tokens": 0,
                "last_cumulative": None, "turns_started": 0, "turns_completed": []}
    goal_status = None
    active_turn = None
    try:
        host.call("initialize", {"clientInfo": {"name": "er6_lab", "version": "1.0"},
                                 "capabilities": {"userInputDialogs": False}})
        host.notify("initialized")
        try:
            receipt["usage_read_before"] = host.call("usage/read", {})
        except Exception as exc:  # unexposed is recorded, not invented
            receipt["usage_read_before"] = {"error": str(exc)}
        model = mg.require_model(host)
        started = host.call("session/start", {"commandId": mg.uuid7(), "modelId": mg.MODEL,
                                              "providerId": model["providerId"],
                                              "workspaceRoot": str(args.workspace),
                                              "approvalMode": "allowAll"}, timeout=60)
        session = started["session"]
        sid = session["sessionId"]
        receipt.update({"session_id": sid, "session_log": session.get("path"),
                        "model_id": session.get("modelId"), "provider_id": model["providerId"],
                        "catalog_variants": model.get("variants")})
        eff = host.call("session/setReasoningEffort", {"commandId": mg.uuid7(), "sessionId": sid,
                                                       "reasoningEffort": mg.EFFORT})
        changed = host.event("session/reasoningEffortChanged", sid)
        receipt["effort_ack"] = eff.get("status")
        receipt["effort_effective"] = changed.get("reasoningEffort")
        if changed.get("reasoningEffort") != "max" or session.get("modelId") != mg.MODEL:
            raise RuntimeError("model/effort receipt mismatch")
        t0 = args.start_epoch
        receipt["goal_submitted_utc"] = utc()
        ack = host.call("goal/set", {"commandId": mg.uuid7(), "sessionId": sid, "objective": objective}, timeout=60)
        if ack.get("status") != "accepted":
            raise RuntimeError(f"goal/set not accepted: {ack}")
        active_turn = ack.get("turnId")
        receipt["goal_ack"] = ack
        idle_since = None
        stop_reason = None
        while True:
            # drain every host event (backlog first)
            frames = list(host.event_backlog)
            host.event_backlog.clear()
            try:
                while True:
                    frames.append(host.events.get_nowait())
            except queue.Empty:
                pass
            for fr in frames:
                p = fr.get("params", {}) or {}
                if p.get("sessionId") not in (None, sid):
                    continue
                m = fr.get("method")
                if m == "session/tokenUsage":
                    counters["token_usage_events"] += 1
                    counters["prompt_tokens"] += int(p.get("promptTokens") or 0)
                    u = p.get("usage") or {}
                    for k in ("inputTokens", "outputTokens", "reasoningTokens", "cacheReadTokens", "cacheWriteTokens", "cachedTokens"):
                        counters[k] = counters.get(k, 0) + int(u.get(k) or 0)
                    counters["last_cumulative"] = p.get("cumulative")
                    with (out / "usage-events.jsonl").open("a") as f:
                        f.write(json.dumps(p) + "\n")
                elif m == "session/goalChanged":
                    g = p.get("goal") or {}
                    if g.get("status") != goal_status:
                        goal_status = g.get("status")
                        log(out, {"goal_status": goal_status, "responses": counters["token_usage_events"]})
                elif m == "turn/started":
                    counters["turns_started"] += 1
                    active_turn = p.get("turnId")
                    idle_since = None
                elif m == "turn/completed":
                    counters["turns_completed"].append({"turnId": p.get("turnId"), "terminal": p.get("terminal"),
                                                        "reason": p.get("reason"), "durationMs": p.get("durationMs"),
                                                        "usage": p.get("usage")})
                    log(out, {"turn_completed": p.get("terminal"), "reason": p.get("reason"),
                              "responses": counters["token_usage_events"]})
                    if p.get("turnId") == active_turn:
                        active_turn = None
                        idle_since = time.time()
            elapsed = time.time() - t0
            if host.proc.poll() is not None:
                stop_reason = "host_exited"
                break
            if goal_status in {"complete", "blocked", "paused", "budget_limited", "usage_limited"} and active_turn is None:
                stop_reason = f"goal_{goal_status}"
                break
            if active_turn is None and idle_since and time.time() - idle_since > 90:
                stop_reason = "turn_completed_goal_not_complete_idle90s"
                break
            if elapsed >= args.max_seconds-30 or counters["token_usage_events"] >= args.max_responses:
                stop_reason = "cap_seconds" if elapsed >= args.max_seconds-30 else "cap_responses"
                log(out, {"cap": stop_reason, "elapsed": round(elapsed, 1), "responses": counters["token_usage_events"]})
                for method, params in (("goal/pause", {"commandId": mg.uuid7(), "sessionId": sid}),
                                       ("turn/interrupt", {"commandId": mg.uuid7(), "sessionId": sid})):
                    try:
                        receipt.setdefault("cap_actions", []).append({method: host.call(method, params, timeout=20)})
                    except Exception as exc:
                        receipt.setdefault("cap_actions", []).append({method: f"error: {exc}"})
                time.sleep(15)
                break
            time.sleep(2)
        receipt["stop_reason"] = stop_reason
        receipt["goal_status_final"] = goal_status
        receipt["end_utc"] = utc()
        receipt["elapsed_seconds"] = round(time.time() - t0, 1)
        try:
            receipt["usage_read_after"] = host.call("usage/read", {})
        except Exception as exc:
            receipt["usage_read_after"] = {"error": str(exc)}
    finally:
        receipt["native_responses"] = counters["token_usage_events"]
        receipt["counters"] = counters
        cleanup_native(host, receipt, [("goal/pause", {"commandId":mg.uuid7(),"sessionId":sid}),
                                         ("turn/interrupt", {"commandId":mg.uuid7(),"sessionId":sid})] if sid else [])


# ---------------------------------------------------------------- zcode
def run_zcode(args, objective, out, receipt):
    import zcode_goal_driver as zg

    class Proto(zg.Protocol):
        def __init__(self, out_dir):
            self.req = {}
            self.usage = {}
            self.turns = []
            self.tools = []
            super().__init__(out_dir)

        def _stdout(self):
            for line in self.proc.stdout:
                self.out_file.write(line)
                self.out_file.flush()
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if obj.get("method") == "v4/telemetry/event":
                    p = obj.get("params") or {}
                    k = p.get("kind")
                    if k == "model.request.status":
                        self.req[p.get("requestId")] = p.get("status")
                    elif k == "usage.delta":
                        self.usage[p.get("requestId")] = p
                    elif k == "turn.terminal":
                        self.turns.append(p)
                    elif k == "tool.lifecycle" and p.get("phase", p.get("status")) == "started":
                        self.tools.append(p.get("toolName"))
                    continue
                if "id" in obj:
                    if "method" in obj:
                        self._server_request(obj)
                    else:
                        self.responses.put(obj)
            self.responses.put(None)

    proto = Proto(out)
    bound_rpc(proto,args)
    session = None
    status = None
    try:
        model = dict(zg.MODEL)
        registry = zg.desktop_registry(Path("/home/sittingmongoose/.zcode/v2/config.json"),
                                       f"{model['providerId']}/{model['modelId']}")
        ws = {"workspacePath": str(args.workspace), "workspaceKey": str(args.workspace)}
        admitted = proto.call("workspace/updateProviderRegistry", {"workspace": ws, "registry": registry,
                                                                   "includeWorkspaceState": False}, timeout=45)
        if admitted.get("status") not in {"applied", "unchanged"}:
            raise RuntimeError(f"registry admission {admitted.get('status')}")
        created = proto.call("session/create", {"workspace": ws, "mode": "build",
                                                "model": {"providerId": model["providerId"], "modelId": model["modelId"]},
                                                "thoughtLevel": "max", "titleGenerationEnabled": False,
                                                "toolAllowlist": args.zcode_tools, "mcpServers": []}, timeout=60)
        snap = created.get("snapshot", created)
        session = snap.get("session", {}).get("sessionId") or created.get("sessionId")
        read = proto.call("session/read", {"sessionId": session}, timeout=30)
        rs = read.get("snapshot", read).get("settings", {})
        cur = rs.get("model", {}).get("current", {})
        receipt.update({"session_id": session, "provider_id": cur.get("providerId"), "model_id": cur.get("modelId"),
                        "effort_effective": rs.get("thoughtLevel", {}).get("current"),
                        "tool_allowlist": args.zcode_tools})
        if (cur.get("providerId"), cur.get("modelId"), receipt["effort_effective"]) != (model["providerId"], model["modelId"], "max"):
            raise RuntimeError("model/effort receipt mismatch")
        t0 = args.start_epoch
        receipt["goal_submitted_utc"] = utc()
        act = proto.call("session/goal", {"sessionId": session, "action": "set", "objective": objective}, timeout=60)
        target = act.get("snapshot", {}).get("session", {}).get("target") or {}
        receipt["goal_target_id"] = target.get("targetId")
        receipt["goal_started_turn"] = act.get("startedTurn")
        if target.get("status") != "active" or act.get("startedTurn") is not True:
            raise RuntimeError("native Goal activation mismatch")
        status = "active"
        log(out, {"goal_status": status})
        stop_reason = None
        idle_since = None
        run_state = None
        while True:
            time.sleep(5)
            done = sum(1 for s in proto.req.values() if s in ("model_request_completed", "model_request_failed"))
            elapsed = time.time() - t0
            # CLI 0.16.5 refuses session/goal show while a prompt runs (-32010); session/read is unguarded.
            snap = proto.call("session/read", {"sessionId": session}, timeout=45)
            proj = snap.get("projection") or snap.get("snapshot", {}).get("projection") or {}
            g = proj.get("target") or snap.get("snapshot", {}).get("session", {}).get("target") or {}
            if g.get("status") != status or proj.get("status") != run_state:
                status = g.get("status")
                run_state = proj.get("status")
                log(out, {"goal_status": status, "run_state": run_state, "responses": done})
            idle = run_state == "idle"
            idle_since = (idle_since or time.time()) if idle else None
            if status in {"complete", "budget_limited", "paused"} and idle:
                stop_reason = f"goal_{status}"
                break
            if status is None and idle:
                stop_reason = "goal_target_absent_idle"
                break
            if status == "active" and idle_since and time.time() - idle_since > 90:
                stop_reason = "goal_active_idle90s"
                break
            if elapsed >= args.max_seconds-30 or done >= args.max_responses:
                stop_reason = "cap_seconds" if elapsed >= args.max_seconds-30 else "cap_responses"
                log(out, {"cap": stop_reason, "elapsed": round(elapsed, 1), "responses": done})
                receipt["cap_actions"] = []
                for method, params in (("session/goal", {"sessionId": session, "action": "pause"}),
                                       ("session/stop", {"sessionId": session})):
                    try:
                        receipt["cap_actions"].append({method: proto.call(method, params, timeout=20)})
                    except Exception as exc:
                        receipt["cap_actions"].append({method: f"error: {exc}"})
                time.sleep(10)
                break
        receipt["stop_reason"] = stop_reason
        receipt["goal_status_final"] = status
        receipt["end_utc"] = utc()
        receipt["elapsed_seconds"] = round(time.time() - t0, 1)
    finally:
        receipt["native_responses"] = sum(1 for s in proto.req.values() if s in ("model_request_completed", "model_request_failed"))
        receipt["request_status_counts"] = {s: list(proto.req.values()).count(s) for s in set(proto.req.values())}
        u = list(proto.usage.values())
        receipt["usage_totals"] = {k: sum(int(x.get(k) or 0) for x in u) for k in
                                   ("inputTokens", "outputTokens", "reasoningTokens", "cacheReadTokens", "cacheWriteTokens", "totalTokens")}
        receipt["usage_requests_with_delta"] = len(u)
        receipt["turn_terminals"] = proto.turns
        receipt["tool_starts"] = {t: proto.tools.count(t) for t in set(proto.tools)}
        with (out / "usage-events.jsonl").open("w") as f:
            for x in u:
                f.write(json.dumps(x) + "\n")
        cleanup_native(proto, receipt, [("session/goal", {"sessionId":session,"action":"pause"}),
                                          ("session/stop", {"sessionId":session}),
                                          ("session/close", {"sessionId":session})] if session else [])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--app", choices=["muse", "zcode"], required=True)
    ap.add_argument("--workspace", type=Path, required=True)
    ap.add_argument("--prompt-file", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--label", required=True)
    ap.add_argument("--max-seconds", type=float, required=True)
    ap.add_argument("--max-responses", type=int, required=True)
    ap.add_argument("--zcode-tools", nargs="*", default=["Read", "Write", "Edit", "Grep", "Glob"])
    args = ap.parse_args()
    args.start_epoch = time.time()
    args.start_monotonic = time.monotonic()
    args.workspace = args.workspace.resolve(strict=True)
    args.out.mkdir(parents=True, exist_ok=False, mode=0o700)
    raw = args.prompt_file.read_text(encoding="utf-8")
    objective = raw.split("\n", 1)[1].strip() if raw.startswith("/goal") else raw.strip()
    receipt = {"schema": "er6.goal_receipt.v1", "label": args.label, "app": args.app,
               "native_goal_entry": "/goal via MSP goal/set" if args.app == "muse" else "/goal via app-server session/goal set",
               "workspace": str(args.workspace), "prompt_file": str(args.prompt_file),
               "prompt_bytes": len(raw.encode()), "prompt_sha256": hashlib.sha256(raw.encode()).hexdigest(),
               "objective_sha256": hashlib.sha256(objective.encode()).hexdigest(),
               "caps": {"seconds": args.max_seconds, "responses": args.max_responses},
               "start_utc": utc(), "fresh_session": True}
    rc = 0
    signal.signal(signal.SIGALRM,cap_alarm)
    signal.setitimer(signal.ITIMER_REAL,max(.1,args.max_seconds-30))
    try:
        (run_muse if args.app == "muse" else run_zcode)(args, objective, args.out, receipt)
    except Exception as exc:
        if isinstance(exc,AssignmentCap):
            receipt["stop_reason"]="cap_seconds_whole_assignment"
        receipt["driver_error"] = f"{type(exc).__name__}: {exc}"
        rc = 1
    finally:
        signal.setitimer(signal.ITIMER_REAL,0)
        receipt["startup_cleanup_elapsed_seconds"]=round(time.monotonic()-args.start_monotonic,3)
        receipt["caps_include_setup_and_cleanup"]=True
        receipt["receipt_written_utc"] = utc()
        (args.out / "receipt.json").write_text(json.dumps(receipt, indent=1, default=str) + "\n")
        log(args.out, {"done": receipt.get("stop_reason"), "error": receipt.get("driver_error"),
                       "responses": receipt.get("native_responses"), "elapsed": receipt.get("elapsed_seconds")})
    return rc


if __name__ == "__main__":
    sys.exit(main())
