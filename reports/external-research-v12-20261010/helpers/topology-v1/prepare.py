#!/usr/bin/env python3
"""ER12 topology-v1: small hook overlay on the pinned ER11 stage preparer.

No dispatch, queue allocation, native Goal creation, or simulated native receipts.
"""
from __future__ import annotations
import argparse, ctypes, datetime as dt, importlib.util, json, os, select, sys, time
sys.dont_write_bytecode = True
from pathlib import Path

HERE = Path(__file__).resolve().parent
PINNED = HERE.parent / "er11"
PINS = {
    "prepare.py": "ae736bfb6748175284d2abbcc7f851f031593612b0de160d72df91dd11ae70a7",
    "reveal.py": "ec9579204af96aa6a45caba1eef94c6ca1a799c296a2363b179af359bd908abe",
    "bootstrap.js": "f8b21ce31ca521880adc9a362dda04bdaa5f5a4285d3a9d0b019f855e2623595",
}
spec = importlib.util.spec_from_file_location("er11_pinned", PINNED / "prepare.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
for name, expected in PINS.items():
    if b.digest(PINNED / name) != expected:
        b.fail(f"pinned ER11 helper changed: {name}; stop without substitution")
# Keep the original one-shot reveal implementation and its configuration gates.
b.REPO = PINNED
BASE = {name: getattr(b, name) for name in (
    "make_prompt", "get_deps", "verify_terminal_status", "verify_predecessors",
    "prepare", "verify_saved_request", "init_run")}


def raw_object(raw):
    if isinstance(raw, dict) and raw.get("structuredContent"):
        return raw["structuredContent"]
    if isinstance(raw, dict) and "content" in raw:
        for item in raw["content"]:
            if item.get("type") == "text":
                return json.loads(item["text"])
    return raw


def immutable_json(path, obj):
    if path.exists():
        if b.read_json(path) != obj:
            b.fail(f"immutable record already exists with different bytes: {path}")
        return obj
    with path.open("x") as stream:
        stream.write(json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
        stream.flush()
        os.fsync(stream.fileno())
    path.chmod(0o444)
    return obj


def load_config(path):
    raw = b.read_json(Path(path).expanduser().resolve())
    if raw.get("topology") not in {"A2", "A7"} or raw.get("dispatch_owner") != "root":
        b.fail("topology must be A2/A7; root is the sole dispatch owner")
    topology = raw["topology"]
    budgets = {"investigator": 1800, "critic": 720, "retained-final": 1080} if topology == "A2" else {"investigator": 1800, "critic-finalizer": 1800}
    if raw.get("stage_budgets_s") != budgets or raw.get("phase_budgets_s") != [1800, 1800]:
        b.fail(f"require 30/30 envelope with exact stage_budgets_s={budgets}")
    b.STAGE_SECONDS = budgets
    c = b.load_config(path)
    if c["_whole_deadline"] > b.now() + dt.timedelta(seconds=3600):
        b.fail("whole deadline cannot grant more than 60 minutes from first preparation")
    return c


def init_run(c):
    # A phase cap never changes the arm's immutable original deadline.
    brief = BASE["init_run"](dict(c, _whole_deadline=b.parse_time(c["whole_deadline_utc"])))
    path = c["_root"] / "control" / "topology.json"
    obj = {"version": "topology-v1", "topology": c["topology"], "dispatch_owner": "root",
           "stage_budgets_s": b.STAGE_SECONDS, "phase_budgets_s": [1800, 1800], "pins": PINS}
    immutable_json(path, obj)
    return brief


def goal(raw):
    obj = raw_object(raw)
    g = obj.get("goal") if isinstance(obj, dict) else None
    if not isinstance(g, dict) or g.get("status") != "active":
        b.fail("direct native get_goal observation must contain active goal; no fresh Goal substitute")
    for key in ("threadId", "createdAt", "objective"):
        if g.get(key) is None:
            b.fail(f"native identity field unavailable: {key}; retained route unsupported")
    return g


def identity(g):
    # This native schema exposes no separate goalId. Do not invent one.
    return {k: g[k] for k in ("threadId", "createdAt", "objective")}


def observe_goal(c, stage, raw):
    g = goal(raw)
    path = c["_root"] / "stages" / stage / "freeze.json"
    expected = b.read_json(path)["native_goal_objective"]
    if g["objective"] != expected:
        b.fail("native Goal objective differs from the immutable assignment")
    target = path.parent / "goal-active.json"
    if target.exists() and identity(goal(b.read_json(target)["raw_native_response"])) != identity(g):
        b.fail("native Goal identity changed")
    if not target.exists():
        immutable_json(target, {"captured_at_utc": b.iso(b.now()), "raw_native_response": raw,
                                "origin_requirement": "exact direct native tool response; not a hand-authored receipt"})
    return g


def source_files(directory):
    if not directory.is_dir() or directory.is_symlink():
        b.fail(f"missing regular source directory: {directory}")
    out = []
    for path in sorted(directory.rglob("*")):
        if path.is_symlink():
            b.fail(f"source handoff cannot contain symlinks: {path}")
        if path.is_file():
            out.append(path)
        elif not path.is_dir():
            b.fail(f"non-regular source handoff entry: {path}")
    if not out:
        b.fail("source handoff is empty; save a navigable source index/evidence")
    return out


def investigator_files(c):
    root = c["_root"]
    inv = root / "stages" / "investigator"
    paths = BASE["verify_predecessors"](root, "critic")
    for p in paths:
        if p.is_symlink() or not p.is_file() or not p.stat().st_size:
            b.fail(f"missing/non-regular/empty complete investigator input: {p}")
    source_map = b.read_json(inv / "source-map.json")
    if not source_map:
        b.fail("source-map.json must be nonempty JSON")
    return [root / "inputs" / "brief.md"] + paths + source_files(inv / "sources")


def snapshot(destination, files, relative_root, metadata):
    if destination.exists() or destination.with_name(destination.name + ".tmp").exists():
        b.fail(f"snapshot already exists or partial; do not rebind: {destination}")
    temp = destination.with_name(destination.name + ".tmp")
    temp.mkdir(parents=True)
    records = []
    for src in files:
        if src.is_symlink() or not src.is_file():
            b.fail(f"snapshot requires regular file: {src}")
        data = src.read_bytes()
        rel = src.relative_to(relative_root)
        dst = temp / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(data)
        if src.read_bytes() != data:
            b.fail(f"input changed during full handoff freeze: {src}")
        records.append({"path": str(destination / rel), "origin_path": str(src),
                        "sha256": b.digest_bytes(data), "bytes": len(data)})
    # A second complete pass catches changes to an earlier source while copying later ones.
    for record in records:
        if b.digest(Path(record["origin_path"])) != record["sha256"]:
            b.fail("source changed during handoff freeze; preserve partial snapshot")
    manifest = {**metadata, "frozen_at_utc": b.iso(b.now()), "files": records,
                "identity_only": True, "source_truth_proven": False, "native_provenance_attested_by_helper": False}
    b.put_json(temp / "manifest.json", manifest)
    for p in temp.rglob("*"):
        if p.is_file():
            p.chmod(0o444)
    temp.rename(destination)
    return manifest


def verify_snapshot(path):
    manifest = b.read_json(path / "manifest.json")
    expected = {str(path / "manifest.json")}
    for record in manifest["files"]:
        p = Path(record["path"])
        if not p.is_relative_to(path) or p.is_symlink() or not p.is_file() or b.digest(p) != record["sha256"] or p.stat().st_size != record["bytes"]:
            b.fail(f"immutable handoff input changed: {p}")
        expected.add(str(p))
    actual = {str(p) for p in path.rglob("*") if p.is_file()}
    if any(p.is_symlink() for p in path.rglob("*")) or actual != expected:
        b.fail("immutable package member set changed")
    return manifest


def freeze_investigator(c, raw):
    root = c["_root"]
    inv = root / "stages" / "investigator"
    g = observe_goal(c, "investigator", raw)
    freeze = b.read_json(inv / "freeze.json")
    if b.now() >= b.parse_time(freeze["stage_deadline_utc"]):
        b.fail("investigation work/freeze deadline expired; no reset")
    dispatch = b.read_json(inv / "dispatch.json")["returned"]
    for key in ("taskId", "childThreadId", "childRunId"):
        if not dispatch.get(key):
            b.fail(f"exact investigator dispatch lacks {key}; unsupported route")
    files = investigator_files(c)
    t = b.now()
    manifest = snapshot(root / "handoff", files, root, {
        "topology": c["topology"], "native_goal_identity": identity(g), "raw_native_response": raw,
        "investigator_dispatch": {k: dispatch[k] for k in ("taskId", "childThreadId", "childRunId")},
        "review_finalization_deadline_utc": b.iso(min(c["_whole_deadline"], t + dt.timedelta(seconds=1800))),
    })
    if investigator_files(c) != files:
        b.fail("source handoff member set changed during freeze")
    # Freeze request/manifest hashes, not a fabricated host/native lifecycle receipt.
    immutable_json(root / "control" / "handoff-binding.json", {
        "manifest_sha256": b.digest(root / "handoff" / "manifest.json"), "topology": c["topology"]})
    return manifest


def handoff(c):
    root = c["_root"]
    m = verify_snapshot(root / "handoff")
    if b.digest(root / "handoff" / "manifest.json") != b.read_json(root / "control" / "handoff-binding.json")["manifest_sha256"]:
        b.fail("handoff manifest changed after binding")
    return m


def deps(c, stage):
    if stage == "investigator":
        return []
    d = BASE["get_deps"](c, "critic")[0]
    d["required_state"] = "original-active" if c["topology"] == "A2" else "terminal"
    return [d]


def confirm_frozen_active(c, raw):
    m = handoff(c)
    if identity(goal(raw)) != m["native_goal_identity"]:
        b.fail("frozen handoff must remain in the original active native Goal")
    return immutable_json(c["_root"] / "control" / "investigator-frozen-active.json", {
        "captured_at_utc": b.iso(b.now()), "raw_native_response": raw,
        "manifest_sha256": b.digest(c["_root"] / "handoff" / "manifest.json")})


def verify_status(root, dependencies):
    for dep in dependencies:
        s = b.read_json(Path(dep["statusPath"]))
        d = b.read_json(root / "stages" / "investigator" / "dispatch.json")["returned"]
        if s.get("taskId") != dep["taskId"]:
            b.fail("predecessor status taskId differs")
        if dep["required_state"] == "terminal":
            if s.get("status") != "completed" or s.get("hasPendingChildRuns") is True:
                b.fail("A7 investigator must be terminal and quiet")
        elif s.get("status") not in {"running", "waiting"} or s.get("childRunId") != d["childRunId"] or s.get("childThreadId") != d["childThreadId"] or s.get("hasPendingChildRuns") is True:
            b.fail("A2 original investigator must remain active in exact original run with no extra queued turns")
        else:
            observed = b.read_json(root / "control" / "investigator-frozen-active.json")
            if identity(goal(observed["raw_native_response"])) != handoff(CURRENT)["native_goal_identity"] or observed["manifest_sha256"] != b.digest(root / "handoff" / "manifest.json"):
                b.fail("A2 post-freeze native active observation does not bind this full handoff")


def predecessors(root, stage):
    c = CURRENT
    m = handoff(c)
    files = [Path(x["path"]) for x in m["files"]]
    return files + [root / "handoff" / "manifest.json", root / "control" / "handoff-binding.json"]


def prompt(c, stage, im, deadline, whole):
    mapped_stage = "critic" if stage == "critic-finalizer" else stage
    text = BASE["make_prompt"](c, mapped_stage, im, deadline, whole)
    topology_sentence = "Root alone dispatches. This is the ER12 " + c["topology"] + " topology; no nested agents. " + ("The retained final stays in the original investigator Goal." if c["topology"] == "A2" else "Each fresh dispatched context has exactly its one actual Goal.")
    text = text.replace("ER11 reusable three-context full-discovery reference", f"ER12 {c['topology']} full-discovery topology-v1")
    text = text.replace("This T3 child is one fresh context in investigator → independent critic → fresh complete reviser.", topology_sentence)
    if stage != "investigator":
        text = text.replace("navigate the carried source index", "navigate the complete immutable carried source index")
    if stage == "investigator":
        text += f"""\nTOPOLOGY HANDOFF\nAfter the complete discovery/draft/source map/revealed plan and full sources tree are saved, call actual native get_goal and pass its EXACT response to:\npython3 {HERE / 'prepare.py'} freeze-investigator --config {c['_config_path']} --json '<exact native response>'\nThis mechanically copies the entire handoff and binds its manifest. Then immediately call actual native get_goal again and confirm-frozen-active --config ... --json '<exact fresh response>' so the freeze is bracketed by active observations. Never author receipts. Do not read or change critic files.\n"""
        if c["topology"] == "A2":
            text = text.replace("Save all three required files before Goal completion.", "Save all three required files before the retained-author handoff; keep this actual Goal active.")
            text += f"""A2: investigation work stops at the original investigator deadline; do no hidden research while waiting. The root dispatches an independent fresh critic. Keep this same actual Goal and original T3 run active. Use a native Goal wait ONLY if actually exposed. Otherwise use the bounded kernel wait below (<=60 seconds each, no busy polling); preserve open residency separately from measured provider usage. Never end this Goal and replace it, and never return a terminal answer before the final. Root's precise notification names the immutable critic bind and its SHA-256; it is an in-flight steering message, not a new review round.\npython3 {HERE / 'prepare.py'} wait --config {c['_config_path']} --timeout-s 60\nOn notification, actual get_goal again, then author-intake --config ... --notification-sha256 '<exact hash from root message>' --json '<exact response>'. This rejects a different/inactive Goal or unbound critique. Read the complete original frozen inputs and bound critic bytes before retained finalization. Write final outputs under stages/investigator/final only. The second 30-minute envelope permits critic <=12 minutes then author <=18 minutes, including waits/handoff/writing. Keep full original scope and evidence-based disposition of each criticism; use the complete reviser requirements below. Save complete final.md, source-map.json, sources, critique-dispositions.json before completing the SAME Goal. Call seal-final --stage investigator --json '<fresh exact active get_goal response>' first. If root steering, native identity, or bounded wait is unsupported, save route-unsupported.json with the exact error and partial artifacts; no synthetic success.\n"""
            rev = BASE["make_prompt"](c, "reviser", im, deadline, whole).split("STAGE REQUIREMENTS\n", 1)[1].replace("from `input-map.json`", "from the complete frozen path lists returned by author-intake")
            text += rev
        else:
            text += "A7: call freeze-investigator while active, then complete this investigator Goal and deliver normally; root requires terminal/quiet state before critic-finalizer dispatch.\n"
    else:
        text += f"""\nINPUT INTAKE GATE\nRun check-input --config {c['_config_path']} --stage {stage} with this overlay before checks/final writing. It verifies every complete frozen member and source handoff byte; read discovery.md, draft.md, source-map.json and exact revealed-plan.md completely from handoff/stages/investigator, and brief from handoff/inputs. Read the full assignment/input map, navigating source evidence. Bytes verified do not prove comprehension or source truth. Do not read live predecessor files. All source_roots/revealed_plan/brief locations in input-map.json MUST refer to immutable handoff copies.\n"""
        if stage == "critic-finalizer":
            text = text.replace("and do not write or repair a final.", "first save your independent critique before authoring the final.")
            text += BASE["make_prompt"](c, "reviser", im, deadline, whole).split("STAGE REQUIREMENTS\n", 1)[1].replace("complete independent critique/source map from `input-map.json`", "your complete independent critique/source map saved in this critic-finalizer stage")
            text += "A7 independent-check gate: save checks.json with a nonempty operations array (source_id, locator, observed_operation, accessed_at_utc, result), critique-index.json as an array of unique criticism IDs ({id:...}), and complete critique.md before finalization. Run freeze-review --stage critic-finalizer before final.md exists; this binds independent checks/critique bytes and IDs. Save critique-dispositions.json as an array with one row per indexed criticism (id, classification, draft_locator, evidence, disposition=accept|amend|reject|retain_uncertainty, rationale, final_locator). For an empty critique, save [] and explicitly state no criticisms in critique.md. Preserve checks.json/critique.md after the bind. Save a full self-contained final.md, source-map.json and sources under this stage. Then seal-final --stage critic-finalizer with an exact fresh active get_goal response BEFORE completing its one native Goal. Proposed checks cannot be recorded as executed operations.\n"
        else:
            text += "Save critique-dispositions.json as an array indexing every criticism with unique id; the retained author will add disposition, rationale and final_locator. It can be [] for explicitly stated no criticisms. Complete critic science and save outputs before native Goal completion. Root binds the full critique/source bytes ONLY after this critic is terminal and quiet.\n"
    return text


def prepare(c, stage):
    if stage == "retained-final":
        b.fail("A2 retained final is same-Goal continuation, never a new dispatched stage")
    root = c["_root"]
    p = root / "stages" / stage
    if stage != "investigator" and not (p / "request.json").exists():
        m = handoff(c)
        end = b.parse_time(m["review_finalization_deadline_utc"])
        c = dict(c, _whole_deadline=min(c["_whole_deadline"], end))
    result = BASE["prepare"](c, stage)
    # Rewrite the initial ER11 map/request only once before dispatch; hashes bind the result.
    if not result.get("retry") and not result.get("alreadyDispatched"):
        im = b.read_json(p / "input-map.json")
        if stage != "investigator":
            im.update(brief=str(root / "handoff" / "inputs" / "brief.md"),
                      revealed_plan=str(root / "handoff" / "stages" / "investigator" / "revealed-plan.md"),
                      source_roots=[str(root / "handoff" / "stages" / "investigator" / "sources")])
            b.put_json(p / "input-map.json", im)
            freeze = b.read_json(p / "freeze.json")
            for item in freeze["frozen_inputs"]:
                if item["path"] == str(p / "input-map.json"):
                    item.update(sha256=b.digest(p / "input-map.json"), bytes=(p / "input-map.json").stat().st_size)
            b.put_json(p / "freeze.json", freeze)
        req = b.read_json(p / "request.json")
        request_id = f"er12-{c['topology']}-{c['run_id']}-{stage}-topology-v1"
        req["clientRequestId"] = req["args"]["clientRequestId"] = request_id
        req["args"]["title"] = f"ER12 {c['topology']} {c['run_id']} {stage}"
        b.put_json(p / "request.json", req)
        result["args"] = req["args"]
    return result


def check_input(c, stage):
    p = c["_root"] / "stages" / stage
    b.verify_saved_request(p, b.read_json(p / "request.json"))
    if (p / "final.md").exists() and not (p / "intake.json").exists():
        b.fail("complete-input check must precede final writing")
    m = handoff(c)
    out = {"checked_at_utc": b.iso(b.now()), "complete_member_count": len(m["files"]),
           "manifest_sha256": b.digest(c["_root"] / "handoff" / "manifest.json"),
           "complete_bytes_verified": True, "comprehension_proven": False, "source_truth_proven": False}
    if not (p / "intake.json").exists():
        immutable_json(p / "intake.json", out)
    return b.read_json(p / "intake.json")


def freeze_review(c, stage):
    if (c["topology"], stage) != ("A7", "critic-finalizer"):
        b.fail("freeze-review is A7 critic-finalizer only")
    p = c["_root"] / "stages" / stage
    if (p / "final.md").exists():
        b.fail("independent checks must be frozen before full final writing")
    check_input(c, stage)
    operations = b.read_json(p / "checks.json").get("operations")
    if not isinstance(operations, list) or not operations:
        b.fail("A7 substantive independent check operations must be saved before final")
    for op in operations:
        if any(not op.get(k) for k in ("source_id", "locator", "observed_operation", "accessed_at_utc", "result")):
            b.fail("A7 check operation lacks exact source/locator/operation/access/result")
    ids = [row["id"] for row in b.read_json(p / "critique-index.json")]
    if len(ids) != len(set(ids)) or not (p / "critique.md").stat().st_size:
        b.fail("critique needs complete text and unique criticism IDs")
    return immutable_json(p / "review-binding.json", {"bound_at_utc": b.iso(b.now()), "criticism_ids": ids,
        "input_manifest_sha256": b.digest(c["_root"] / "handoff" / "manifest.json"),
        "files": [{"path": str(p / n), "sha256": b.digest(p / n)} for n in ("checks.json", "critique.md", "critique-index.json")]})


def bind_critic(c):
    if c["topology"] != "A2":
        b.fail("only A2 binds critic notification")
    root = c["_root"]
    m = handoff(c)
    verify_status(root, deps(c, "critic"))
    p = root / "stages" / "critic"
    d = b.read_json(p / "dispatch.json")["returned"]
    s = b.read_json(p / "status.json")
    if s.get("taskId") != d.get("taskId") or s.get("status") != "completed" or s.get("hasPendingChildRuns") is True:
        b.fail("critic must be terminal and quiet before immutable bind")
    if (root / "control" / "critic-notification.json").exists():
        n = b.read_json(root / "control" / "critic-notification.json")
        if b.digest(root / "critic-package" / "manifest.json") != n["critic_manifest_sha256"]:
            b.fail("previous critic notification binding changed")
        verify_snapshot(root / "critic-package")
        return b.read_json(root / "control" / "notification-message.json")
    for name in ("critique.md", "source-map.json", "critique-dispositions.json"):
        if not (p / name).is_file() or not (p / name).stat().st_size:
            b.fail(f"missing complete critic artifact {name}")
    if not isinstance(b.read_json(p / "critique-dispositions.json"), list):
        b.fail("critic criticism index must be an array")
    files = [p / n for n in ("critique.md", "source-map.json", "critique-dispositions.json")] + source_files(p / "sources")
    end = min(c["_whole_deadline"], b.parse_time(m["review_finalization_deadline_utc"]), b.now() + dt.timedelta(seconds=1080))
    if end <= b.now():
        b.fail("retained final allowance expired; no reset")
    package = snapshot(root / "critic-package", files, p, {"critic_taskId": d["taskId"], "retained_final_deadline_utc": b.iso(end)})
    manifest_sha = b.digest(root / "critic-package" / "manifest.json")
    notification = {"version": "topology-v1", "run_id": c["run_id"], "original_investigator_dispatch": m["investigator_dispatch"],
                    "investigator_manifest_sha256": b.digest(root / "handoff" / "manifest.json"),
                    "native_goal_identity": m["native_goal_identity"], "critic_manifest": str(root / "critic-package" / "manifest.json"),
                    "critic_manifest_sha256": manifest_sha, "retained_final_deadline_utc": b.iso(end)}
    # Publish by atomic rename: the blocked kernel wait wakes only after full immutable bind.
    control = root / "control"
    target = control / "critic-notification.json"
    temp = control / "critic-notification.tmp"
    if target.exists() or temp.exists():
        b.fail("notification already bound or partial; do not replace")
    immutable_json(temp, notification)
    exact = f"ER12 A2 FROZEN CRITIC READY run={c['run_id']}; notification={target}; notification_sha256={b.digest(temp)}; critic_manifest_sha256={manifest_sha}. Keep the ORIGINAL investigator Goal/run. Run author-intake with a fresh exact native get_goal response before reading bound bytes. Final deadline={b.iso(end)}. No fresh Goal or follow-up review round."
    immutable_json(control / "notification-message.json", {"message": exact, "clientRequestId": f"er12-A2-{c['run_id']}-frozen-critic-notify-v1"})
    temp.rename(target)  # root's full precise message is now present before kernel wake
    return {"notification": notification, "message": exact, "clientRequestId": f"er12-A2-{c['run_id']}-frozen-critic-notify-v1"}


def author_intake(c, raw, notification_sha256):
    root = c["_root"]
    m = handoff(c)
    g = goal(raw)
    if c["topology"] != "A2" or identity(g) != m["native_goal_identity"]:
        b.fail("retained intake requires the original active Goal identity")
    if not notification_sha256 or b.digest(root / "control" / "critic-notification.json") != notification_sha256:
        b.fail("intake requires exact notification SHA-256 delivered by root")
    n = b.read_json(root / "control" / "critic-notification.json")
    if b.digest(root / "handoff" / "manifest.json") != n["investigator_manifest_sha256"]:
        b.fail("complete investigator handoff changed after root notification")
    if n["native_goal_identity"] != identity(g) or n["original_investigator_dispatch"] != m["investigator_dispatch"]:
        b.fail("notification targets a different original investigator")
    if b.digest(root / "critic-package" / "manifest.json") != n["critic_manifest_sha256"]:
        b.fail("critic manifest changed after immutable notification")
    verify_delivery(c, n)
    verify_snapshot(root / "critic-package")
    if b.now() >= b.parse_time(n["retained_final_deadline_utc"]):
        b.fail("retained final deadline expired")
    final_dir = root / "stages" / "investigator" / "final"
    final_dir.mkdir(exist_ok=True)
    (final_dir / "sources").mkdir(exist_ok=True)
    immutable_json(final_dir / "intake.json", {"captured_at_utc": b.iso(b.now()), "raw_native_response": raw,
                   "notification_sha256": b.digest(root / "control" / "critic-notification.json"),
                   "complete_bytes_verified": True, "comprehension_proven": False,
                   "native_goal_identity": identity(g), "retained_final_deadline_utc": n["retained_final_deadline_utc"]})
    return {"allowed_write_root": str(final_dir), "complete_inputs": [x["path"] for x in m["files"]],
            "complete_critic_inputs": [x["path"] for x in verify_snapshot(root / "critic-package")["files"]]}


def verify_delivery(c, notification):
    p = c["_root"] / "control" / "notification-delivery.json"
    if not p.exists():
        b.fail("precise root steer delivery is not saved yet; bounded wait, no critic read")
    sent = raw_object(b.read_json(p)["raw_response"])
    original = notification["original_investigator_dispatch"]
    if sent.get("delivery") != "steered" or sent.get("runId") != original["childRunId"] or sent.get("threadId") != original["childThreadId"]:
        b.fail("root notification did not steer original active run; A2 route unsupported")


def wait_once(c, seconds):
    if c["topology"] != "A2" or not 1 <= seconds <= 60:
        b.fail("A2 wait is bounded to 1..60 seconds; no busy-poll loop")
    m = handoff(c)
    root = c["_root"]
    control = root / "control"
    notification = control / "critic-notification.json"
    delivery = control / "notification-delivery.json"
    def ready(): return notification.exists() and delivery.exists()
    end = min(c["_whole_deadline"], b.parse_time(m["review_finalization_deadline_utc"]))
    if b.now() >= end:
        b.fail("A2 residency deadline expired; preserve partial work, no substitute Goal")
    started = b.now()
    if not ready():
        # Linux kernel blocking event wait. No directory/stat polling or model research.
        libc = ctypes.CDLL(None, use_errno=True)
        fd = libc.inotify_init1(os.O_CLOEXEC | os.O_NONBLOCK)
        if fd < 0:
            b.fail(f"inotify_init1 unsupported: errno={ctypes.get_errno()}; route unsupported")
        try:
            wd = libc.inotify_add_watch(fd, os.fsencode(control), 0x00000080 | 0x00000100)  # MOVED_TO | CREATE
            if wd < 0:
                b.fail(f"inotify_add_watch failed: errno={ctypes.get_errno()}; route unsupported")
            # Check after watch registration to close notification-publication race.
            wait_end = time.monotonic() + min(seconds, max(0, (end - b.now()).total_seconds()))
            while not ready():
                remaining = wait_end - time.monotonic()
                if remaining <= 0 or not select.select([fd], [], [], remaining)[0]:
                    break
                os.read(fd, 65536)  # drain unrelated file events; block again, never busy-poll
        finally:
            os.close(fd)
    ended = b.now()
    is_ready = ready()
    # One finite event result is open residency/tool wait only; inference/billing unknown.
    event = {"start_observed_utc": b.iso(started), "end_observed_utc": b.iso(ended),
             "blocking_wait_s": (ended - started).total_seconds(), "notification_ready": is_ready,
             "provider_usage": None, "billing": None, "metric_scope": "open residency / blocking tool wait; not inference"}
    if is_ready:
        n = b.read_json(notification)
        verify_delivery(c, n)
        if b.digest(root / "critic-package" / "manifest.json") != n["critic_manifest_sha256"] or b.digest(root / "handoff" / "manifest.json") != n["investigator_manifest_sha256"]:
            b.fail("root notification refers to altered package")
        verify_snapshot(root / "critic-package")
        event["root_precise_notification"] = b.read_json(control / "notification-message.json")
        event["notification_sha256"] = b.digest(notification)
    with (control / "residency.jsonl").open("a") as stream:
        stream.write(json.dumps(event) + "\n")
    return event


def seal_final(c, stage, raw):
    root = c["_root"]
    if (c["topology"], stage) not in {("A2", "investigator"), ("A7", "critic-finalizer")}:
        b.fail("wrong topology final stage")
    g = observe_goal(c, stage, raw)
    p = root / "stages" / stage
    if c["topology"] == "A2":
        author_intake_existing = b.read_json(p / "final" / "intake.json")
        if identity(g) != handoff(c)["native_goal_identity"] or identity(g) != author_intake_existing["native_goal_identity"]:
            b.fail("A2 final must stay in original active native Goal")
        n = b.read_json(root / "control" / "critic-notification.json")
        verify_delivery(c, n)
        if b.digest(root / "control" / "critic-notification.json") != author_intake_existing["notification_sha256"]:
            b.fail("notification changed after author intake")
        if b.digest(root / "critic-package" / "manifest.json") != n["critic_manifest_sha256"]:
            b.fail("critic manifest mutated after author intake")
        verify_snapshot(root / "critic-package")
        deadline = b.parse_time(author_intake_existing["retained_final_deadline_utc"])
        p = p / "final"
        criticism_ids = [x["id"] for x in b.read_json(root / "critic-package" / "critique-dispositions.json")]
    else:
        if b.read_json(p / "intake.json")["manifest_sha256"] != b.digest(root / "handoff" / "manifest.json"):
            b.fail("complete input intake differs")
        handoff(c)
        deadline = b.parse_time(b.read_json(p / "freeze.json")["stage_deadline_utc"])
        review = b.read_json(p / "review-binding.json")
        if review["input_manifest_sha256"] != b.digest(root / "handoff" / "manifest.json"):
            b.fail("independent review checked a different complete input")
        for record in review["files"]:
            if b.digest(Path(record["path"])) != record["sha256"]:
                b.fail("independent checks/critique changed after review binding")
        criticism_ids = review["criticism_ids"]
    if b.now() >= deadline:
        b.fail("final deadline expired; preserve actual partial/full artifact without timely claim")
    for name in ("final.md", "source-map.json", "critique-dispositions.json"):
        if not (p / name).is_file() or not (p / name).stat().st_size:
            b.fail(f"missing full final artifact: {name}")
    dispositions = b.read_json(p / "critique-dispositions.json")
    if not isinstance(dispositions, list):
        b.fail("critique-dispositions.json must be an array")
    ids = []
    for row in dispositions:
        if any(not row.get(k) for k in ("id", "classification", "draft_locator", "evidence", "disposition", "rationale", "final_locator")) or row["disposition"] not in {"accept", "amend", "reject", "retain_uncertainty"}:
            b.fail("criticism disposition missing explicit evidence/rationale/locator")
        ids.append(row["id"])
    if len(ids) != len(set(ids)) or (criticism_ids is not None and set(ids) != set(criticism_ids)):
        b.fail("every criticism requires exactly one explicit disposition")
    files = [p / n for n in ("final.md", "source-map.json", "critique-dispositions.json")]
    if c["topology"] == "A7":
        files += [p / "critique.md", p / "checks.json", p / "critique-index.json", p / "review-binding.json"]
    files += source_files(p / "sources")
    return snapshot(root / "final-package", files, p, {"topology": c["topology"], "raw_active_native_response": raw,
                    "native_goal_identity": identity(g), "saved_before_native_completion": "active observation supplied; terminal evidence separate",
                    "scope_fidelity_proven": False, "explicit_disposition_count": len(ids)})


def main():
    global CURRENT
    ap = argparse.ArgumentParser()
    ap.add_argument("action", choices=["deps", "prepare", "record", "record-status", "record-capabilities", "freeze-investigator", "confirm-frozen-active", "bind-critic", "author-intake", "check-input", "freeze-review", "seal-final", "wait"])
    ap.add_argument("--config", required=True)
    ap.add_argument("--stage", default="investigator")
    ap.add_argument("--json", help="EXACT actual tool response; never fabricate native evidence")
    ap.add_argument("--timeout-s", type=int, default=60)
    ap.add_argument("--notification-sha256", help="exact SHA-256 from root's frozen-critic notification")
    a = ap.parse_args()
    c = CURRENT = load_config(a.config)
    b.init_run, b.get_deps, b.verify_terminal_status, b.verify_predecessors, b.make_prompt = init_run, deps, verify_status, predecessors, prompt
    if a.stage not in b.STAGE_SECONDS or a.stage == "retained-final":
        b.fail("invalid stage for this topology")
    raw = json.loads(a.json) if a.json else None
    if a.action == "prepare": out = prepare(c, a.stage)
    elif a.action == "deps":
        init_run(c)
        out = {"stage": a.stage, "predecessors": deps(c, a.stage)}
    elif a.action == "record": out = b.record_response(c, a.stage, raw)
    elif a.action == "record-status": out = b.record_status(c, a.stage, raw_object(raw))
    elif a.action == "record-capabilities": out = b.record_capabilities(c, raw)
    elif a.action == "freeze-investigator": out = freeze_investigator(c, raw)
    elif a.action == "confirm-frozen-active": out = confirm_frozen_active(c, raw)
    elif a.action == "bind-critic": out = bind_critic(c)
    elif a.action == "author-intake": out = author_intake(c, raw, a.notification_sha256)
    elif a.action == "check-input": out = check_input(c, a.stage)
    elif a.action == "freeze-review": out = freeze_review(c, a.stage)
    elif a.action == "seal-final": out = seal_final(c, a.stage, raw)
    else: out = wait_once(c, a.timeout_s)
    print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()
