#!/usr/bin/env python3
"""Additive, source-only paired setup versions. Never admits or launches jobs."""
import copy
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LAB = ROOT.parents[2]
PAIRS = ("D-V02-A", "D-V07-A")
ARMS = ("control", "treatment")
VERSION = "neutral-r1"
DECISION = LAB / "supervision/DECISIONS-009-NEUTRAL-TARGETED-SETUP.json"
ZERO = LAB / "ops/dispatcher/NEUTRAL_PAIR_REPAIR_ZERO_START_CONFIRMATION.json"
READY = LAB / "ops/dispatcher/LUNA_V1_3_READY.json"
EXPECTED = {
    DECISION: "ff6873db3e8cbac67199ff39ae7a3e63a69741ce3ceddc1fe7f0a27e7dcc7e70",
    ZERO: "d2f4ef00fefb595b33f231b68ce79decc379f6bfd785cf9362927f11bc2f294b",
    READY: "534e9ae13e2439c6d8d5298cda6617e19a9c3ef052513cecd888274c4527106e",
    LAB / "cases/diagnostics/D-V02-A.json": "d03b907ec90e9e048aaf354b7a3677a4495a2c0bf6bfc50bdaae51d416c29a1f",
    LAB / "cases/diagnostics/D-V07-A.json": "742276f24037929d3e0d2239a7b9475abd771438e24d79034c9f5faac182ec20",
    LAB / "cases/diagnostics/D-V02-A-TASK.md": "cff40503b62af6bfc73923de88c145bfc9a83fdd788bb0094eaba840c4607295",
    LAB / "cases/diagnostics/D-V07-A-TASK.md": "d4967ac0731328203417a45be62cc326a7654706366c669fcf05189e25040c7d",
    LAB / "cases/common_criteria.json": "344135779883060be49d7e389f9dd160e30267247d90269710cb283877602f44",
    LAB / "cases/source_access.json": "eedc2d9cd33d51b75bdea060cadca98460a854401069455f8de43e3cbb6ad592",
    LAB / "cases/prompts/output_contract.md": "233c7ea2b016982c4de336ea691992161b2b0ee4a185222da9028eefcbcaff22",
}
REPLACEMENTS = {
    "D-V02-A": (b" Candidate binds source/type/unit/domain before choosing examples.", b""),
    "D-V07-A": (b"Candidate identifies consequence order; no evaluator risk ranking is supplied.",
                  b"No evaluator risk ranking is supplied."),
}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def ref(path):
    return {"path": str(path), "sha256": sha(path)}


def read(path):
    return json.loads(Path(path).read_text())


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation prevents a late preparer invocation changing sealed bytes.
    with path.open("x") as stream:
        json.dump(value, stream, indent=2)
        stream.write("\n")


def repair(pair, body):
    old, new = REPLACEMENTS[pair]
    if body.count(old) != 1:
        raise ValueError(f"{pair}: expected one exact shared procedural clause")
    return body.replace(old, new)


def old_job(pair, arm):
    return f"{pair}-{arm}-diagnostic-a001-resource-v13-a002"


def new_job(pair, arm):
    return f"{pair}-{arm}-diagnostic-a001-resource-v13-neutral-r1-a003"


def build():
    if (ROOT / "SOURCE_PINS.json").exists():
        raise ValueError("Already frozen; preserve existing version")
    for path, digest in EXPECTED.items():
        if sha(path) != digest:
            raise ValueError(f"Frozen authority/source drift: {path}")
    jobs = {r["job_id"]: r for r in read(LAB / "state/jobs.json")["jobs"]}
    for pair in PAIRS:
        for arm in ARMS:
            row = jobs[old_job(pair, arm)]
            if row.get("native_goal_starts") != 0 or row["status"] != "HELD_PROSPECTIVE_NEUTRAL_PAIR_REPAIR":
                raise ValueError("Both-arm zero-Goal held condition is required")
            if row.get("unit") or row.get("native_unit") or row.get("start_intent") or row.get("activation_positive"):
                raise ValueError("Predecessor entered activation")
    now = datetime.now(timezone.utc).isoformat()
    sources = set(EXPECTED)
    # Preserve the original 16-method, A/B packet design inventory without editing it.
    for method in range(1, 17):
        for domain in ("A", "B"):
            prefix = LAB / f"cases/diagnostics/D-V{method:02}-{domain}"
            for suffix in (".json", "-TASK.md", "-CONTROL.md", "-TREATMENT.md", "-coverage.json"):
                sources.add(Path(str(prefix) + suffix))
    sources.update(LAB / p for p in (
        "cases/diagnostics/TOPOLOGY.json", "cases/QUEUE_DESIGN_MANIFEST.json",
        "cases/briefs/development-A-biomedical.md", "cases/coverage/development-A.json",
        "cases/coverage/important-checks-A.json",
        "dev/diagnostic-runner/seed-recovery/bases/I-01-control-research-a001/BASE_MANIFEST.json",
    ))
    runtimes = []
    for pair in PAIRS:
        base = LAB / "dev/diagnostic-runner/seed-recovery/prepared" / pair
        pair_root = ROOT / "versions" / VERSION / pair
        pair_root.mkdir(parents=True)
        original_card = LAB / f"cases/diagnostics/{pair}.json"
        original_neutral = LAB / f"cases/diagnostics/{pair}-TASK.md"
        card_path = pair_root / "card.json"
        neutral_path = pair_root / "NEUTRAL_TASK.md"
        neutral_path.write_bytes(repair(pair, original_neutral.read_bytes()))
        original_freeze = base / "PAIR_SOURCE_FREEZE.json"
        sources.add(original_freeze)
        sources.add(base / "SOURCE_INDEX.json")
        dag = LAB / f"dev/diagnostic-runner/seed-recovery/corrected-dags/{pair}.json"
        sources.add(dag)
        lineage = {
            "schema": "er9.prospective-neutral-lineage.v1", "setup_version": VERSION,
            "authority": ref(DECISION), "zero_start_confirmation": ref(ZERO),
            "predecessor_card": ref(original_card), "predecessor_neutral": ref(original_neutral),
            "predecessor_pair_freeze": ref(original_freeze), "role_contract": ref(dag),
            "predecessor_job_ids": [old_job(pair, arm) for arm in ARMS],
            "procedural_delta_only": True, "source_or_quality_selection": False,
            "actual_method_uptake": "UNKNOWN", "outcome_assessment": "NOT_RUN",
            "reason": ("Shared neutral task contained the treatment binding procedure; isolate the declared arm modifier."
                       if pair == "D-V02-A" else
                       "Neutrality precaution: shared ranking instruction narrows control; first-verification contrast is not proven erased."),
            "created_utc": now,
        }
        card = read(original_card)
        card.update(card_version="v2-neutral-r1", case_id=f"{pair}-v2-neutral-r1",
                    task=repair(pair, card["task"].encode()).decode(),
                    neutral_task_prompt_path=str(neutral_path), setup_version=VERSION,
                    prospective_setup_lineage=lineage)
        write(card_path, card)
        write(pair_root / "LINEAGE.json", lineage)
        freeze = read(original_freeze)
        freeze.update(card_ref=ref(card_path), setup_version=VERSION,
                      neutral_task_ref=ref(neutral_path), prospective_setup_lineage=lineage,
                      created_utc=now)
        pair_freeze = pair_root / "PAIR_SOURCE_FREEZE.json"
        write(pair_freeze, freeze)
        requests = []
        for arm in ARMS:
            old_id = f"{pair}-{arm}-diagnostic-a001"
            original = base / old_id
            prepared = original / "prepared-stage.json"
            predecessor = LAB / "ops/dispatcher/runs" / old_job(pair, arm)
            current_stage = read(predecessor / "stage.json")
            sources.update((prepared, original / "packet.json", original / "EXPOSURE_PREPARATION.json",
                            predecessor / "stage.json", predecessor / "LAUNCH_SEAL.json"))
            sources.update(p for p in (original / "workspace").rglob("*") if p.is_file())
            sources.update(p for p in (predecessor / "workspace/inputs").rglob("*") if p.is_file())
            sources.add(predecessor / "workspace/TASK.md")
            request_path = LAB / f"dev/diagnostic-runner/seed-recovery/prepared/registration/{pair}-diagnostic-preparation-{arm}-diagnostic-dec006-r002.json"
            sources.add(request_path)
            stage_root = pair_root / new_job(pair, arm)
            stage_root.mkdir()
            ws = stage_root / "workspace"
            shutil.copytree(original / "workspace", ws)
            # Inputs are opaque bytes. No source/candidate body is interpreted or authored.
            for name in ("TASK.md", "inputs/diagnostic_task.md"):
                (ws / name).write_bytes(repair(pair, (ws / name).read_bytes()))
            stage = read(prepared)
            stage.update(job_id=new_job(pair, arm), workspace=str(ws), prompt_file=str(ws / "TASK.md"),
                         prompt_sha256=sha(ws / "TASK.md"), out=str(stage_root / "native"),
                         input_pins={str(p): sha(p) for p in sorted((ws / "inputs").rglob("*")) if p.is_file()},
                         pair_freeze=ref(pair_freeze), freeze_out=str(stage_root / "OUTPUT_FREEZE.json"))
            stage_path = stage_root / "prepared-stage.json"
            write(stage_path, stage)
            packet = read(original / "packet.json")
            packet.update(job_id=new_job(pair, arm), card_path=str(card_path), card_sha256=sha(card_path),
                          stage_spec_template=str(stage_path), stage_spec_sha256=sha(stage_path), setup_version=VERSION,
                          prospective_setup_lineage=lineage)
            write(stage_root / "packet.json", packet)
            req = read(request_path)
            req.update(request_id=f"{pair}-{arm}-neutral-r1-dec009-r001", card_path=str(card_path),
                       card_sha256=sha(card_path), setup_version=VERSION, created_utc=now,
                       prospective_setup_lineage=lineage, runtime_binding_ready=ref(READY))
            job = req["stage_jobs"][0]
            job.update(job_id=new_job(pair, arm), stage_json=str(stage_path), stage_sha256=sha(stage_path),
                       expected_freeze=str(stage_root / "OUTPUT_FREEZE.json"), setup_version=VERSION,
                       predecessor_job_id=old_job(pair, arm), runtime_binding_ready=ref(READY),
                       additional_prelaunch_pins={str(DECISION): sha(DECISION), str(ZERO): sha(ZERO),
                                                 str(pair_root / "LINEAGE.json"): sha(pair_root / "LINEAGE.json")})
            out_request = pair_root / "registration" / (req["request_id"] + ".json")
            write(out_request, req)
            requests.append({"request_id": req["request_id"], **ref(out_request), "status": "PREPARED_NOT_ADMITTED"})
            runtimes.append({"pair_id": pair, "arm": arm, "predecessor_job_id": old_job(pair, arm),
                             "new_job_id": new_job(pair, arm), "runtime_binding_ready": ref(READY),
                             "predecessor_stage": ref(predecessor / "stage.json"),
                             "luna_runtime": current_stage["luna_runtime"],
                             "execution_enabled": current_stage["execution_enabled"],
                             "public_get": current_stage["public_get"],
                             "max_seconds": current_stage["max_seconds"],
                             "max_responses": current_stage["max_responses"],
                             "tools_config": current_stage["tools_config"],
                             "tools_config_sha256": current_stage["tools_config_sha256"]})
        write(pair_root / "REGISTRATION_OUTBOX.json", {
            "schema": "er9.diagnostic-registration-outbox.v2", "pair_id": pair, "setup_version": VERSION,
            "requests": requests, "prepared_pairs": 1, "prepared_native_stage_packets": 2,
            "status": "PREPARED_NOT_ADMITTED", "new_native_starts": 0,
            "integration_owner": "codex-er9-ops", "fresh_runtime_seal_required": True,
            "scientific_credit": "Prospective setup repair only; method uptake and quality remain unassessed.",
        })
    write(ROOT / "RUNTIME_EXPECTATIONS.json", {"schema": "er9.paired-runtime-preservation.v1",
                                               "runtime_binding_ready": ref(READY), "arms": runtimes,
                                               "binding_owner": "codex-er9-ops", "native_Goals": 0})
    write(ROOT / "SOURCE_PINS.json", {"schema": "er9.contrast-repair-source-pins.v1",
                                      "created_utc": now, "files": [ref(p) for p in sorted(sources)],
                                      "original_design_methods": 16, "original_design_domains": 2,
                                      "body_policy": "Opaque byte preservation; no answers or findings interpreted."})


if __name__ == "__main__":
    build()
