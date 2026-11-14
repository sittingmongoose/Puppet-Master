#!/usr/bin/env python3
"""Generate or validate fail-closed Event Authority currentness evidence.

This tool inventories and rehashes the live corpus.  It deliberately cannot
adjudicate event semantics or mutate the event registry.  By default it writes
an UNKNOWN_OPEN edition.  `generate --close` writes a CLOSED edition only when
every closing condition recomputes from the live tree (PNC-019 step S7): the
frozen seal check passes in this tool's own run with every pin current, every
token of this edition's census has one sourced disposition, the denominator D
equals the live registry, every family has a 12/12 depth row, and the EA-27 and
EA-29 continuity receipt holds; runtime producer conformance stays a recorded
NOT_RUN boundary.  On any failure it refuses and writes nothing.
"""
from __future__ import annotations

import argparse
import contextlib
import hashlib
import importlib.util
import io
import json
import os
import re
import subprocess
import sys
import tempfile
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from pm_evidence_paths import EvidencePathError
from pm_event_evidence_adapter import configure as configure_evidence_paths
import pm_pnc019_currentness as ea_closure

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
AUDIT = PLANS / ".audits/event-authority-2026-08-13-currentness"
HISTORICAL_INVENTORY = PLANS / ".audits/event-authority-2026-08-12/closed-world-census/CURRENT_SOURCE_INVENTORY.FRESH_20260812T0900.json"
INVENTORY = AUDIT / "CURRENT_EVENT_SOURCE_INVENTORY.json"
OCCURRENCES = AUDIT / "EVENT_OCCURRENCES.jsonl"
STATUS = AUDIT / "EVENT_FAMILY_DENOMINATOR_STATUS.json"
RECEIPT = AUDIT / "VALIDATOR_RECEIPT.json"
README = AUDIT / "README.md"
ADJUDICATION = AUDIT / "adjudication"
EXPECTED_252 = ADJUDICATION / "EXPECTED_252_EVENT_TYPES.tsv"
QUARANTINED_252 = ADJUDICATION / "QUARANTINED_EVENT_DISPOSITIONS.jsonl"
GROUP_MANIFEST = ADJUDICATION / "GROUP_ARTIFACT_MANIFEST.json"
GROUP_SOURCE_DIR = ADJUDICATION / "source_groups"

# These pins are the custody boundary for the seven independently authored
# row-local groups. Generation must never restamp changed inputs as current.
EXPECTED_252_SHA256 = "d59142bc9ceef3f8c2d2257b7a6fbe9307ddae236720a0ac5a8c62afc7c5f541"
EXPECTED_GROUPS = {
    "a": (38, "d4305411923dee2edfc2c8b822a9fb42eda33b320c64c7f84aaf16ce4cd134a3"),
    "b": (50, "f1279ec339fc3b20676e19787ab423ffaeaba3b7a58181828af5e94242cf7160"),
    "c": (56, "9528f134447acb50c2c8053855db64bbcfeb9bdbbc56cb1d9e52ce11eb10cc79"),
    "d": (45, "5b3af4d546e0aecca799ac38e0ae65ed81e356db18531baa7e7027dfb9cd66b2"),
    "e": (34, "52ad46cafed54f333ab144b7297ca2e188353adf38a3ee4488099e76f8acba2a"),
    "f": (25, "24585545a7234db0972ca58da2b8557416bab7ef74b75afbf318f6bfdb1c93d1"),
    "g": (4, "5e1f709cbf5a4f1bd19cec24d12b033cac79d4e0ce0e194d8babb13bdc0499db"),
}

TOKEN_RE = re.compile(r"(?<![A-Za-z0-9_./-])([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)(?![A-Za-z0-9_./-])")
EVENT_CUE_RE = re.compile(
    r"\b(?:event[_ -]?type|event family|eventrecord|persist(?:ed|s|ing)? event|"
    r"seglog|canonical ledger|emit(?:s|ted|ting)?|append(?:s|ed|ing)?|"
    r"expected_event_types|domain event|event stream|event payload|event schema)\b",
    re.I,
)
NEGATIVE_RE = re.compile(
    r"\b(?:must not|does not|do not|never|no)\b.{0,100}\b(?:emit|eventrecord|event family|persisted event)\b|"
    r"\b(?:not an?|without an?)\s+(?:eventrecord|event family|persisted event)",
    re.I,
)
COMPAT_RE = re.compile(r"\b(?:compatibility|legacy|retired|stale|supersed(?:e|ed)|source[- ]lineage|alias)\b", re.I)
SCHEMA_RE = re.compile(r"\b(?:schema|fixture|example|sample|draft|candidate)\b", re.I)
EVENT_VERB_RE = re.compile(
    r"(?:^|_)(?:started|completed|failed|cancelled|canceled|stopped|blocked|created|deleted|"
    r"updated|changed|detected|applied|expired|replanned|scheduled|progressed|recorded|"
    r"evaluated|captured|invoked|denied|requested|required|restored|opened|closed|"
    r"disconnected|connected|renamed|moved|exported|appended|unavailable|degraded)$"
)
EXPLICIT_NEW_MACHINE_INPUTS = {
    "Plans/runtime_integration_disposition.json",
    "Plans/shared_runtime_contracts.schema.json",
}
DERIVED_VALIDATION_OUTPUTS = {
    # This report consumes Event Authority currentness. Including its raw bytes
    # in the Event Authority source manifest creates a self-invalidating cycle:
    # regenerating the report makes the audit stale, while regenerating the
    # audit changes the report's next validation result. It is derived evidence,
    # not an event-family semantic source.
    "Plans/.implementation_readiness/buildability_gate_report.json",
    # The node-readiness report also consumes the PNC/Event Authority result.
    # Hashing it into the audit makes `pm-plan-index generate` invalidate the
    # evidence used to compute the report that it just wrote.
    "Plans/.plan_index/node_readiness_report.json",
    # The PNC-019 certification receipt binds this audit's VALIDATOR_RECEIPT.json
    # (REQUIRED_PNC019_SOURCE_HASH_PATHS). Inventorying the receipt's bytes here
    # leaves no fixed point: each harness run drifts the edition, and each new
    # edition stales the receipt's binding (PNC-019 scope finding 3).
    "Plans/.implementation_readiness/pnc019_certification_receipt.json",
}
EXCLUSIONS = [
    {"pattern": "Plans/.audits/**", "reason": "audit evidence is validation-only and cannot originate product authority; this audit is also excluded from its own corpus"},
    {"pattern": "Plans/.evidence/**", "reason": "generated governance evidence"},
    {"pattern": "Plans/_shards/**", "reason": "generated mirrors of canonical Plans"},
    {"pattern": "Plans/.plan_index/**", "reason": "generated PlanUnit/index/readiness outputs; node readiness consumes this audit and is excluded to prevent a self-invalidating currentness cycle"},
    {"pattern": "Plans/.plan_migration/** except the two inherited registered hash/alias inputs", "reason": "migration evidence rather than live product authority; retained exceptions are drift-custody inputs and cannot originate event membership"},
    {"pattern": "Plans/ledgers/** except the historically registered ledger_registry.json and plan_unit.schema.json", "reason": "source-lineage memory, not canonical product prose"},
    {"pattern": "Plans/Spec_Lock.json, Plans/auto_decisions.jsonl", "reason": "governance artifacts, not event-family semantic owners"},
    {"pattern": "Plans/.implementation_readiness/buildability_gate_report.json", "reason": "derived validator output that consumes this audit; excluded to prevent a self-invalidating currentness cycle"},
    {"pattern": "Plans/.implementation_readiness/pnc019_certification_receipt.json", "reason": "derived PNC-019 certification receipt that binds this audit's VALIDATOR_RECEIPT.json; excluded to prevent a self-invalidating currentness cycle"},
    {"pattern": "other generated readiness outputs except machine inputs inherited from the registered August inventory or referenced by the live index", "reason": "included exceptions are validation/checkpoint custody only and cannot originate event-family membership"},
    {"pattern": "Concepts/**, reports/**, output/**", "reason": "prototype, report, or generated-output surfaces outside canonical Plans"},
    {"pattern": "src/**/*.rs", "reason": "no current Rust product implementation exists; runtime producer conformance is a later independent lane"},
]


def canonical_json(value: object) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def git_output(*args: str) -> str:
    cp = subprocess.run(["git", *args], cwd=ROOT, check=True, text=True, capture_output=True)
    return cp.stdout


def machine_path_candidates() -> set[str]:
    old = read_json(HISTORICAL_INVENTORY)
    paths = {row["path"] for row in old["sources"] if not row["path"].endswith(".md")}
    index_text = (PLANS / "00-plans-index.md").read_text(encoding="utf-8")
    for match in re.finditer(r"Plans/[A-Za-z0-9_./-]+\.(?:json|jsonl)", index_text):
        candidate = match.group(0).rstrip(".,;:)")
        if (ROOT / candidate).is_file() and not candidate.startswith("Plans/.audits/"):
            paths.add(candidate)
    registry = read_json(PLANS / "event_family_registry.json")
    for row in registry["families"]:
        ref = row.get("payload_schema_ref")
        if isinstance(ref, dict) and isinstance(ref.get("path"), str):
            candidate = ref["path"]
            if (ROOT / candidate).is_file():
                paths.add(candidate)
    paths |= {p for p in EXPLICIT_NEW_MACHINE_INPUTS if (ROOT / p).is_file()}
    return paths


def machine_paths() -> set[str]:
    return machine_path_candidates() - DERIVED_VALIDATION_OUTPUTS


def source_paths() -> list[Path]:
    direct_md = {rel(p) for p in PLANS.glob("*.md") if p.is_file()}
    selected = direct_md | machine_paths()
    missing = sorted(p for p in selected if not (ROOT / p).is_file())
    if missing:
        raise RuntimeError(f"registered source inputs missing: {missing}")
    return [ROOT / p for p in sorted(selected)]


def classify(token: str, window: str, registered: set[str], path: Path) -> tuple[str, list[str]]:
    if token.startswith("cmd."):
        return "non_event_command", ["cmd_namespace"]
    if token.startswith(("pm.", "https.", "www.")):
        return "schema_or_identifier_non_event", ["schema_or_identifier_namespace"]
    if token in registered:
        return "registered_event_family_declaration", ["registered_exact_type"]
    if NEGATIVE_RE.search(window):
        return "explicit_non_event_or_forbidden_family", ["explicit_negative_event_context"]
    if COMPAT_RE.search(window):
        return "compatibility_or_source_lineage", ["compatibility_or_source_lineage_context"]
    if (path.suffix == ".json" or SCHEMA_RE.search(window)) and EVENT_CUE_RE.search(window):
        return "schema_or_fixture_event_example", ["schema_or_fixture_context", "event_language_context"]
    if EVENT_CUE_RE.search(window) and EVENT_VERB_RE.search(token.rsplit(".", 1)[-1]):
        return "likely_persisted_event_candidate", ["event_language_context", "event_like_terminal_verb"]
    return "ambiguous_event_like_token", ["event_language_context_only"]


def build_occurrences(frozen: dict[Path, bytes], registered: set[str]) -> list[dict]:
    by_token: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(frozen, key=rel):
        lines = frozen[path].decode("utf-8", errors="replace").splitlines()
        for i, line in enumerate(lines):
            lo, hi = max(0, i - 1), min(len(lines), i + 2)
            window = " ".join(x.strip() for x in lines[lo:hi])
            if not EVENT_CUE_RE.search(window) and not any(t in line for t in registered):
                continue
            for match in TOKEN_RE.finditer(line):
                token = match.group(1)
                disposition, cues = classify(token, window, registered, path)
                context = line.strip()
                by_token[token].append({
                    "path": rel(path),
                    "line": i + 1,
                    "context": context,
                    "context_sha256": sha(context.encode()),
                    "extraction_cues": cues,
                    "mechanical_classification": disposition,
                })
    priority = {
        "registered_event_family_declaration": 0,
        "likely_persisted_event_candidate": 1,
        "schema_or_fixture_event_example": 2,
        "compatibility_or_source_lineage": 3,
        "explicit_non_event_or_forbidden_family": 4,
        "non_event_command": 5,
        "schema_or_identifier_non_event": 6,
        "ambiguous_event_like_token": 7,
    }
    rows = []
    for token in sorted(by_token):
        occs = sorted(by_token[token], key=lambda x: (x["path"], x["line"], x["context_sha256"]))
        classes = sorted({x["mechanical_classification"] for x in occs}, key=lambda x: priority[x])
        if token in registered:
            primary = "registered_event_family_declaration"
        elif "likely_persisted_event_candidate" in classes and "explicit_non_event_or_forbidden_family" in classes:
            primary = "contested_positive_and_negative_event_evidence"
        else:
            primary = classes[0]
        rows.append({
            "exact_token": token,
            "registered": token in registered,
            "primary_mechanical_classification": primary,
            "all_mechanical_classifications": classes,
            "occurrence_count": len(occs),
            "occurrences": occs,
            "authority_boundary": "discovery_only_owner_adjudication_required" if token not in registered else "registry_membership_observed_not_depth_certified",
        })
    return rows


def current_git_custody() -> dict:
    lines = []
    for line in git_output("status", "--porcelain=v1", "--untracked-files=all").splitlines():
        path = line[3:]
        if path.startswith("Plans/.audits/event-authority-2026-08-13-currentness/"):
            continue
        lines.append(line)
    lines.sort()
    return {
        "head": git_output("rev-parse", "HEAD").strip(),
        "status_lines": lines,
        "status_sha256": sha(("\n".join(lines) + "\n").encode()),
        "note": "dirty and untracked custody snapshot; the audit's own output directory is excluded",
    }


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def build_quarantined_adjudication() -> tuple[bytes, dict]:
    """Verify exact source custody and wrap every preserved row as quarantined."""
    expected_bytes = EXPECTED_252.read_bytes()
    if sha(expected_bytes) != EXPECTED_252_SHA256:
        raise RuntimeError("252-event expected-set custody hash drift")
    expected_rows = [line.split("\t", 1)[0] for line in expected_bytes.decode().splitlines() if line]
    if len(expected_rows) != 252 or len(set(expected_rows)) != 252:
        raise RuntimeError("252-event expected set is not exactly unique")

    wrapped: list[dict] = []
    group_rows = []
    for group, (expected_count, expected_sha) in EXPECTED_GROUPS.items():
        path = GROUP_SOURCE_DIR / f"group_{group}.jsonl"
        data = path.read_bytes()
        lines = [line for line in data.splitlines() if line.strip()]
        if sha(data) != expected_sha or len(lines) != expected_count:
            raise RuntimeError(f"group {group} custody hash/count drift")
        for line_number, line in enumerate(lines, start=1):
            source_row = json.loads(line)
            event_type = source_row.get("event_type")
            if not isinstance(event_type, str):
                raise RuntimeError(f"group {group} line {line_number} lacks event_type")
            wrapped.append({
                "event_type": event_type,
                "audit_disposition": "KEEP_QUARANTINED_NO_REGISTRY_OR_CHECKPOINT_ADVANCE",
                "source_group": group,
                "source_line": line_number,
                "source_row_sha256": sha(line),
                "source_row": source_row,
            })
        group_rows.append({
            "group": group,
            "path": rel(path),
            "row_count": len(lines),
            "sha256": sha(data),
        })

    actual = [row["event_type"] for row in wrapped]
    if len(actual) != 252 or len(set(actual)) != 252:
        raise RuntimeError("group union contains duplicate or missing event_type rows")
    if set(actual) != set(expected_rows):
        raise RuntimeError("group union does not equal exact /tmp/ea252.tsv event_type set")
    wrapped.sort(key=lambda row: row["event_type"])
    blob = b"".join(canonical_json(row) + b"\n" for row in wrapped)
    manifest = {
        "schema_id": "pm.event_authority.quarantined_group_manifest.v1",
        "claim_boundary": "252 preserved row-local findings are quarantined evidence only; no row is admitted, registered, denominator-closing, depth-closing, or checkpoint-advancing",
        "expected_set": {
            "path": rel(EXPECTED_252),
            "row_count": len(expected_rows),
            "unique_event_type_count": len(set(expected_rows)),
            "sha256": sha(expected_bytes),
        },
        "source_groups": group_rows,
        "union": {
            "row_count": len(wrapped),
            "unique_event_type_count": len(set(actual)),
            "exact_set_equality": True,
            "quarantined_row_count": sum(row["audit_disposition"].startswith("KEEP_QUARANTINED") for row in wrapped),
            "quarantined_ledger_path": rel(QUARANTINED_252),
            "quarantined_ledger_sha256": sha(blob),
        },
        "bulk_registration": False,
        "complete_denominator_known": False,
        "contract_depth_complete": False,
    }
    return blob, manifest


@dataclass(frozen=True)
class ClosingOptions:
    """Inputs of `generate --close`; every path is repository-relative except the external ones."""

    token_ledger: str
    depth_assessments: tuple[str, ...]
    ea27: Path
    ea29: Path
    recount_source_map: str | None


DEFAULT_EA_DIR = Path("/mnt/Cursor/PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase3/event-authority")
FROZEN_RECEIPT_NAME = "event_authority_validator_receipt.json"


def json_bytes(value: object) -> bytes:
    return (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def run_frozen_check(root: Path, recount_source_map: str | None) -> tuple[dict, bytes, str, dict | None]:
    """Run the frozen seal check in-process with its receipt redirected to a temporary directory.

    The validator's tracked receipt file is never written. The returned receipt is
    this run's, and the returned hash is that of the validator bytes that ran.
    """
    validator = Path(root) / ea_closure.EA_FROZEN_VALIDATOR_REL_PATH
    before = validator.read_bytes()
    map_pin = None
    if recount_source_map:
        source_map = Path(recount_source_map).expanduser().resolve(strict=True)
        map_pin = {"path": str(source_map), "sha256": sha(source_map.read_bytes())}
    saved_env = os.environ.get("PM_EA_RECOUNT_SOURCE_MAP")
    saved_bytecode = sys.dont_write_bytecode
    with tempfile.TemporaryDirectory(prefix="pm-ea-frozen-check-") as td:
        try:
            sys.dont_write_bytecode = True
            if map_pin is not None:
                os.environ["PM_EA_RECOUNT_SOURCE_MAP"] = map_pin["path"]
            else:
                os.environ.pop("PM_EA_RECOUNT_SOURCE_MAP", None)
            spec = importlib.util.spec_from_file_location("pm_ea_frozen_check_run", validator)
            if spec is None or spec.loader is None:
                raise RuntimeError(f"cannot load the frozen validator: {validator}")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.RECEIPT_DIR = Path(td)
            with contextlib.redirect_stdout(io.StringIO()):
                module.main()
            raw = (Path(td) / FROZEN_RECEIPT_NAME).read_bytes()
        finally:
            sys.dont_write_bytecode = saved_bytecode
            if saved_env is None:
                os.environ.pop("PM_EA_RECOUNT_SOURCE_MAP", None)
            else:
                os.environ["PM_EA_RECOUNT_SOURCE_MAP"] = saved_env
    if validator.read_bytes() != before:
        raise RuntimeError("the frozen validator changed while it ran")
    return json.loads(raw), raw, sha(before), map_pin


def compute_continuity_receipt(root: Path, ea27_path: Path, ea29_path: Path) -> dict:
    """Bind EA-27 and EA-29 by path and SHA-256 and derive EA-27's cohorts (finding 4)."""
    ea27_raw = Path(ea27_path).read_bytes()
    ea29_raw = Path(ea29_path).read_bytes()
    doc = ea_closure._strict_json(ea27_raw)
    union_rows = doc.get("union_rows") if isinstance(doc, dict) else None
    non_exact = doc.get("non_exact_pattern_rows") if isinstance(doc, dict) else None
    if not isinstance(union_rows, list) or not isinstance(non_exact, list):
        raise RuntimeError("EA-27 lacks union_rows or non_exact_pattern_rows")
    cohorts: dict[str, list[str]] = {name: [] for name in ea_closure.EA_CONTINUITY_COHORTS}
    unmapped = []
    for exact, rows in ((True, union_rows), (False, non_exact)):
        for row in rows:
            cohort = ea_closure.EA_CONTINUITY_COHORT_BY_CLASSIFICATION.get(row.get("classification")) if isinstance(row, dict) else None
            if cohort is None or (cohort == "july26_non_exact") == exact or not isinstance(row.get("event_type"), str):
                unmapped.append(row.get("event_type") if isinstance(row, dict) else None)
                continue
            cohorts[cohort].append(row["event_type"])
    return {
        "schema_id": ea_closure.EA_CONTINUITY_RECEIPT_SCHEMA_ID,
        "ea27": {
            "logical_name": ea_closure.EA27_LOGICAL_NAME,
            "path": str(Path(ea27_path).resolve()),
            "bytes": len(ea27_raw),
            "sha256": sha(ea27_raw),
            "declared_union_rows_sha256": doc.get("union_rows_sha256"),
        },
        "ea29": {
            "logical_name": ea_closure.EA29_LOGICAL_NAME,
            "path": str(Path(ea29_path).resolve()),
            "bytes": len(ea29_raw),
            "sha256": sha(ea29_raw),
        },
        "union_rows_sha256_recomputed": sha(canonical_json(union_rows)),
        "union_rows_recipe": "sha256 of json.dumps(union_rows, sort_keys=True, separators=(',', ':'), ensure_ascii=False)",
        "cohort_by_classification": ea_closure.EA_CONTINUITY_COHORT_BY_CLASSIFICATION,
        "cohorts": {name: sorted(values) for name, values in cohorts.items()},
        "unmapped_rows": unmapped,
        "exact_row_count": len(union_rows),
        "non_exact_row_count": len(non_exact),
        "cohort_pins": {"path": ea_closure.EA_COHORT_PINS_REL_PATH, "sha256": ea_closure._sha_rel(Path(root), ea_closure.EA_COHORT_PINS_REL_PATH)},
        "census_adjudication": {"path": ea_closure.EA_CENSUS_ADJUDICATION_REL_PATH, "sha256": ea_closure._sha_rel(Path(root), ea_closure.EA_CENSUS_ADJUDICATION_REL_PATH)},
        "canon_pin_source": {"path": ea_closure.EA_CANON_PIN_SOURCE_REL_PATH, "sha256": ea_closure._sha_rel(Path(root), ea_closure.EA_CANON_PIN_SOURCE_REL_PATH)},
    }


def remove_empty_outputs() -> None:
    """Undo the adapter's empty output directories after a refused generation."""
    for directory in (AUDIT / "closure", ADJUDICATION, AUDIT):
        try:
            directory.rmdir()
        except OSError:
            pass


def closing_evidence(options: ClosingOptions, rows_blob: bytes) -> tuple[dict, dict[str, bytes], list[dict]]:
    """Run every closing check; on success return the evidence and the closure artifact bytes."""
    try:
        frozen_receipt, frozen_raw, frozen_validator_sha, map_pin = run_frozen_check(ROOT, options.recount_source_map)
        continuity = compute_continuity_receipt(ROOT, options.ea27, options.ea29)
    except (OSError, RuntimeError, ValueError) as exc:
        return {}, {}, [{"error": "event_authority_closure_input_invalid", "detail": str(exc)}]
    continuity_raw = json_bytes(continuity)
    evidence, failures = ea_closure.compute_closure_evidence(
        ROOT,
        token_ledger_path=options.token_ledger,
        depth_assessment_paths=list(options.depth_assessments),
        frozen_receipt=frozen_receipt,
        frozen_receipt_sha256=sha(frozen_raw),
        frozen_validator_sha256=frozen_validator_sha,
        recount_source_map=map_pin,
        continuity_receipt=continuity,
        continuity_receipt_sha256=sha(continuity_raw),
        occurrences_raw=rows_blob,
    )
    if continuity.get("ea27", {}).get("declared_union_rows_sha256") != continuity["union_rows_sha256_recomputed"]:
        failures.append({"error": "event_authority_closure_continuity_pin_mismatch", "detail": "EA-27 declared union_rows_sha256 does not recompute"})
    if frozen_receipt.get("failures"):
        failures.append({
            "error": "event_authority_closure_frozen_check_failure_list",
            "frozen_errors": sorted({f.get("error") for f in frozen_receipt["failures"] if isinstance(f, dict)}),
        })
    files = {
        ea_closure.EVENT_AUTHORITY_CLOSURE_EVIDENCE_REL_PATH: json_bytes(evidence),
        ea_closure.EVENT_AUTHORITY_FROZEN_CHECK_RECEIPT_REL_PATH: frozen_raw,
        ea_closure.EVENT_AUTHORITY_CONTINUITY_RECEIPT_REL_PATH: continuity_raw,
    }
    return evidence, files, failures


def generate(options: ClosingOptions | None = None) -> int:
    paths = source_paths()
    frozen = {p: p.read_bytes() for p in paths}
    direct_md = {rel(p) for p in PLANS.glob("*.md") if p.is_file()}
    sources = [{
        "path": rel(p),
        "authority_class": "direct_canonical_plan_prose" if rel(p) in direct_md else "registered_machine_input",
        "bytes": len(frozen[p]),
        "sha256": sha(frozen[p]),
        "inclusion_reason": "every direct Plans/*.md" if rel(p) in direct_md else "registered machine input inherited from the August inventory, referenced by the live index/registry, or explicitly registered by the shared-runtime integration",
    } for p in paths]
    quarantine_blob, group_manifest = build_quarantined_adjudication()
    inventory = {
        "schema_id": "pm.event_authority.current_source_inventory.v1",
        "generated_at_utc": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "claim_boundary": "currentness custody only; not denominator closure or semantic adjudication",
        "source_root": ".",
        "counts": {
            "all_sources": len(sources),
            "direct_plans_markdown": sum(x["authority_class"] == "direct_canonical_plan_prose" for x in sources),
            "registered_machine_inputs": sum(x["authority_class"] == "registered_machine_input" for x in sources),
        },
        "sources_sha256": sha(canonical_json(sources)),
        "sources": sources,
        "explicit_exclusions": EXCLUSIONS,
        "git_custody": current_git_custody(),
    }
    registry_bytes = frozen[PLANS / "event_family_registry.json"]
    registry = json.loads(registry_bytes)
    registered = {x["event_type"] for x in registry["families"]}
    rows = build_occurrences(frozen, registered)
    rows_blob = b"".join(canonical_json(x) + b"\n" for x in rows)
    counts = Counter(x["primary_mechanical_classification"] for x in rows)
    likely = sorted(x["exact_token"] for x in rows if not x["registered"] and x["primary_mechanical_classification"] == "likely_persisted_event_candidate")
    contested = sorted(x["exact_token"] for x in rows if x["primary_mechanical_classification"] == "contested_positive_and_negative_event_evidence")
    ambiguous = sorted(x["exact_token"] for x in rows if not x["registered"] and x["primary_mechanical_classification"] == "ambiguous_event_like_token")
    status = {
        "schema_id": "pm.event_authority.denominator_currentness_status.v1",
        "status": "UNKNOWN_OPEN",
        "closed": False,
        "complete_denominator_known": False,
        "contract_depth_complete": False,
        "build_or_pnc019_authority": False,
        "registry": {
            "path": "Plans/event_family_registry.json",
            "sha256": sha(registry_bytes),
            "revision": registry["registry_revision"],
            "live_family_count": len(registered),
            "event_types_sha256": sha(("\n".join(sorted(registered)) + "\n").encode()),
        },
        "live_mechanical_census": {
            "unique_tokens": len(rows),
            "occurrences": sum(x["occurrence_count"] for x in rows),
            "classification_counts": dict(sorted(counts.items())),
            "unregistered_likely_persisted_candidates": likely,
            "contested_positive_and_negative_candidates": contested,
            "unregistered_ambiguous_event_like_tokens": ambiguous,
            "minimum_owner_adjudication_queue_count": len(set(likely) | set(contested)),
            "warning": "mechanical classifications are discovery queues, not family dispositions; ambiguous and schema/example rows may add to the owner queue",
        },
        "august_2026_08_12_pass_disposition": {
            "status": "STALE_VOID_FAIL_OPEN",
            "decertification": "Plans/.audits/event-authority-2026-08-12/DECERTIFICATION.md",
            "reasons": [
                "the PASS receipt was tied to a temporary 37-row registry while the live registry has 39 rows",
                "the August source freeze does not cover the current live corpus and its validator did not rehash every live source",
                "the Known-37 depth report records 185 of 444 cells PASS and explicitly reports DEPTH_INCOMPLETE",
                "the depth loop could pass over an empty registered-like ledger domain",
                "batch quarantine did not provide one owner-adjudicated semantic decision per exact persisted token",
            ],
        },
        "depth": {
            "status": "INCOMPLETE",
            "known37_historical_cells_pass": 185,
            "known37_historical_cells_total": 444,
            "fresh_live_depth_rows_materialized": 0,
            "required_rule": "every active persisted family requires complete identity, payload, scope, owners, producer, consumer/checkpoint, replay/idempotency, transition/concurrency, retention/migration/recovery, redaction/custody, compatibility, and executable-oracle depth",
        },
        "row_local_quarantine": {
            "manifest_path": rel(GROUP_MANIFEST),
            "row_count": 252,
            "unique_event_type_count": 252,
            "disposition": "KEEP_QUARANTINED_NO_REGISTRY_OR_CHECKPOINT_ADVANCE",
            "bulk_registration": False,
            "denominator_effect": "none",
            "depth_effect": "none",
        },
        "closure_blockers": list(ea_closure.EVENT_AUTHORITY_OPEN_CLOSURE_BLOCKERS),
        "next_safe_action": "stabilize corpus, then adjudicate every likely, contested, ambiguous, schema/example, alias, retired, and exclusion row individually before any registry or PNC-019 change",
    }
    closure_files: dict[str, bytes] = {}
    if options is not None:
        # Every closing check runs before anything is written; a refusal leaves no edition.
        evidence, closure_files, failures = closing_evidence(options, rows_blob)
        if failures:
            remove_empty_outputs()
            print(json.dumps({
                "evidence_valid": False,
                "event_authority_closed": False,
                "refused": "the closing evidence does not hold; nothing was written",
                "closure_failures": failures,
            }, indent=2))
            return 1
        evidence_sha = sha(closure_files[ea_closure.EVENT_AUTHORITY_CLOSURE_EVIDENCE_REL_PATH])
        status = ea_closure.build_closed_status(status, evidence, evidence_sha)
    closed = status["status"] == ea_closure.EVENT_AUTHORITY_CLOSED_STATUS
    INVENTORY.write_text(json.dumps(inventory, indent=2) + "\n", encoding="utf-8")
    OCCURRENCES.write_bytes(rows_blob)
    QUARANTINED_252.write_bytes(quarantine_blob)
    write_json(GROUP_MANIFEST, group_manifest)
    closure_targets = {}
    if closure_files:
        (AUDIT / "closure").mkdir(parents=True, exist_ok=True)
        for logical, data in closure_files.items():
            target = AUDIT / "closure" / Path(logical).name
            target.write_bytes(data)
            closure_targets[logical] = target
    write_json(STATUS, status)
    if closed:
        result = (
            f"`CLOSED`. The denominator D has {status['denominator']['size']} families and equals the live registry "
            f"of {len(registered)} rows; every family has a 12/12 depth row; every one of {len(rows)} census tokens has "
            "one sourced disposition; the frozen seal check passed in this tool's own run with every pin current; the "
            "EA-27/EA-29 continuity receipt holds. `closure/CLOSURE_EVIDENCE.json` binds it all and is recomputed on every "
            "validation. Runtime producer conformance is `NOT_RUN`: a recorded boundary and a separate later claim, not a pass."
        )
        opening = (
            "This directory is the CLOSED Event Authority currentness edition. It closes the\n"
            "denominator and family depth only for the exact corpus and registry it inventories;\n"
            "any drift reopens both. It never mutates the registry or authorizes product code."
        )
    else:
        result = (
            f"`UNKNOWN_OPEN`. The live registry has {len(registered)} rows.\n"
            f"Mechanical discovery found {len(likely)} unregistered likely-persisted tokens,\n"
            f"{len(contested)} contested tokens, and {len(ambiguous)} unregistered ambiguous\n"
            "event-like tokens. Those are review queues, not automated dispositions."
        )
        opening = (
            "This directory is a fail-closed live-corpus custody checkpoint. It **does not**\n"
            "close the Event Authority denominator, certify contract depth, mutate the event\n"
            "registry, enable PNC-019, or authorize product implementation."
        )
    readme = f"""# Event Authority currentness audit — 2026-08-13

{opening}

The inventory covers every direct `Plans/*.md` file and the registered machine
inputs carried forward from the prior inventory or referenced by the live index,
registry, and shared-runtime registration. Every excluded source class is listed
explicitly in `CURRENT_EVENT_SOURCE_INVENTORY.json`.

Current result: {result}

The `adjudication/` subtree preserves seven exact source groups containing 252
unique row-local findings. `GROUP_ARTIFACT_MANIFEST.json` proves exact equality
to `EXPECTED_252_EVENT_TYPES.tsv`; every consolidated row is forcibly marked
`KEEP_QUARANTINED_NO_REGISTRY_OR_CHECKPOINT_ADVANCE`. Source-row objects remain
unchanged inside the wrappers regardless of their draft disposition wording.

The August PASS is retained only as stale, void, fail-open discovery lineage.
Its own decertification remains controlling.

Validate without writes:

```bash
python3 scripts/pm-event-authority-currentness.py validate
python3 scripts/pm-event-authority-currentness.py self-test
```

Any source-set, byte, registry, status, or artifact drift makes validation fail.
Plain regeneration always writes `closed=false`; only `generate --close`, with
every closing condition recomputing from the live tree, writes `closed=true`.
"""
    README.write_text(readme, encoding="utf-8")
    artifact_hashes = {
        rel(p): sha(p.read_bytes())
        for p in (INVENTORY, OCCURRENCES, STATUS, README, EXPECTED_252, QUARANTINED_252, GROUP_MANIFEST, *closure_targets.values())
    }
    artifact_hashes.update({rel(GROUP_SOURCE_DIR / f"group_{g}.jsonl"): digest for g, (_, digest) in EXPECTED_GROUPS.items()})
    checks = validate_data(inventory, rows_blob, status, artifact_hashes, allow_receipt_absent=True)
    receipt = {
        "schema_id": "pm.event_authority.currentness_validator_receipt.v1",
        "generated_at_utc": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "validator_path": rel(Path(__file__)),
        "validator_sha256": sha(Path(__file__).read_bytes()),
        "artifact_hashes": artifact_hashes,
        "checks": checks,
        "evidence_valid": all(checks.values()),
        "event_authority_closed": closed and all(checks.values()),
        "claim_boundary": (
            "evidence_valid with event_authority_closed=true means every closing condition recomputed from the live tree "
            "for this exact corpus and registry; runtime producer conformance stays NOT_RUN as a separate later claim"
            if closed else
            "evidence_valid means custody/currentness checks passed; it never means Event Authority closure"
        ),
    }
    if closed:
        receipt["separate_claims"] = dict(ea_closure.EVENT_AUTHORITY_SEPARATE_CLAIMS)
    write_json(RECEIPT, receipt)
    return validate()


def validate_data(inventory: dict, rows_blob: bytes, status: dict, artifact_hashes: dict, allow_receipt_absent: bool = False) -> dict[str, bool]:
    live_paths = source_paths()
    expected_rows = inventory["sources"]
    expected_by_path = {x["path"]: x for x in expected_rows}
    live_rel = [rel(p) for p in live_paths]
    all_rehashed = set(live_rel) == set(expected_by_path)
    if all_rehashed:
        all_rehashed = all(
            p.stat().st_size == expected_by_path[rel(p)]["bytes"] and sha(p.read_bytes()) == expected_by_path[rel(p)]["sha256"]
            for p in live_paths
        )
    registry = read_json(PLANS / "event_family_registry.json")
    registered = {x["event_type"] for x in registry["families"]}
    direct_md = {rel(p) for p in PLANS.glob("*.md") if p.is_file()}
    inventoried_md = {x["path"] for x in expected_rows if x["authority_class"] == "direct_canonical_plan_prose"}
    try:
        quarantine_blob, expected_manifest = build_quarantined_adjudication()
        actual_manifest = read_json(GROUP_MANIFEST)
        quarantine_checks = (
            QUARANTINED_252.read_bytes() == quarantine_blob
            and actual_manifest == expected_manifest
            and actual_manifest["union"]["quarantined_row_count"] == 252
            and actual_manifest["union"]["exact_set_equality"] is True
            and actual_manifest["bulk_registration"] is False
        )
    except Exception:  # noqa: BLE001 - any custody/parse drift fails closed.
        quarantine_checks = False
    closed_state = status.get("status") == ea_closure.EVENT_AUTHORITY_CLOSED_STATUS
    checks = {
        "exact_live_source_set": set(live_rel) == set(expected_by_path),
        "every_direct_plans_markdown_inventoried": direct_md == inventoried_md,
        "all_live_sources_rehashed": all_rehashed,
        "source_manifest_digest_matches": inventory["sources_sha256"] == sha(canonical_json(expected_rows)),
        "occurrence_ledger_hash_matches": artifact_hashes.get(rel(OCCURRENCES)) == sha(rows_blob),
        "live_registry_exactly_matches_status": (
            len(registered) == status["registry"]["live_family_count"]
            and sha(("\n".join(sorted(registered)) + "\n").encode()) == status["registry"]["event_types_sha256"]
            and sha((PLANS / "event_family_registry.json").read_bytes()) == status["registry"]["sha256"]
        ),
        "august_pass_marked_stale_void": status["august_2026_08_12_pass_disposition"]["status"] == "STALE_VOID_FAIL_OPEN",
        "explicit_exclusions_present": inventory["explicit_exclusions"] == EXCLUSIONS,
        "quarantined_252_exact_set_and_custody": quarantine_checks,
    }
    if closed_state:
        # Recompute, never trust: the helper re-derives the closing evidence from the
        # live tree and compares it with what this edition stored.
        checks["status_closed_by_recomputed_evidence"] = not ea_closure.event_authority_closure_failures(ROOT, edition_dir=AUDIT, status=status)
        checks["runtime_conformance_recorded_not_run"] = status.get("runtime_producer_conformance") == ea_closure.EVENT_AUTHORITY_RUNTIME_BOUNDARY
        checks["closure_artifacts_bound"] = all(path in artifact_hashes for path in ea_closure.EVENT_AUTHORITY_CLOSURE_ARTIFACT_REL_PATHS)
    else:
        checks["status_remains_fail_closed"] = (
            status["status"] == "UNKNOWN_OPEN"
            and status["closed"] is False
            and status["complete_denominator_known"] is False
            and status["contract_depth_complete"] is False
            and status["build_or_pnc019_authority"] is False
        )
        checks["depth_remains_incomplete"] = status["depth"]["status"] == "INCOMPLETE" and status["depth"]["fresh_live_depth_rows_materialized"] == 0
    if not allow_receipt_absent:
        checks["artifact_hashes_match_receipt"] = all(resolve_artifact_reference(p).is_file() and sha(resolve_artifact_reference(p).read_bytes()) == digest for p, digest in artifact_hashes.items())
    return checks


def validate() -> int:
    inventory = read_json(INVENTORY)
    status = read_json(STATUS)
    receipt = read_json(RECEIPT)
    rows_blob = OCCURRENCES.read_bytes()
    checks = validate_data(inventory, rows_blob, status, receipt["artifact_hashes"])
    closed_state = status.get("status") == ea_closure.EVENT_AUTHORITY_CLOSED_STATUS
    validator_hash_ok = receipt["validator_sha256"] == sha(Path(__file__).read_bytes())
    checks["validator_hash_matches_receipt"] = validator_hash_ok
    checks["receipt_closure_matches_status"] = (
        receipt.get("event_authority_closed") is closed_state
        and (not closed_state or receipt.get("separate_claims") == ea_closure.EVENT_AUTHORITY_SEPARATE_CLAIMS)
    )
    passed = all(checks.values())
    closed = closed_state and passed
    print(json.dumps({"evidence_valid": passed, "event_authority_closed": closed, "checks": checks}, indent=2))
    return 0 if passed else 1


REPORT_LITERAL_GUARDS = {
    # The four report scripts and the Case L report read the denominator state from
    # the installed edition through the helper; a reintroduced literal fails here.
    "scripts/pm-browser-event-admission.py": "event_authority_denominator_status(",
    "scripts/pm_coordination_events.py": "event_authority_denominator_status(",
    "scripts/pm-github-project-integration.py": "event_authority_denominator_status(",
    "scripts/pm-testing-session-event-admission.py": "event_authority_denominator_status(",
    "scripts/pm-implementation-readiness.py": "event_authority_checkpoint(ROOT)",
}
REPORT_LITERAL_RE = re.compile(
    r"""["']global_event_denominator["']\s*:\s*["']UNKNOWN_OPEN["']"""
    r"""|["']denominator_status["']\s*:\s*EVENT_FAMILY_DENOMINATOR_STATUS"""
    r"""|["']complete_denominator_known["']\s*:\s*False,\s*\n\s*["']contract_depth_complete["']\s*:\s*False,\s*\n\s*["']disposition["']\s*:\s*["']excluded_from_this_non_event_pass_and_still_fail_closed["']"""
)


def report_literal_failures(texts: dict[str, str]) -> list[dict]:
    failures = []
    for path, marker in REPORT_LITERAL_GUARDS.items():
        text = texts.get(path, "")
        if REPORT_LITERAL_RE.search(text):
            failures.append({"path": path, "error": "event_denominator_literal_in_report"})
        if marker not in text:
            failures.append({"path": path, "error": "event_denominator_report_not_read_from_edition", "marker": marker})
    return failures


def self_test() -> int:
    import pm_event_authority_closure_fixture as fixture

    tests: dict[str, bool] = {}
    tamper_matrix: dict[str, dict] = {}
    receipt_rel = "Plans/.implementation_readiness/pnc019_certification_receipt.json"
    try:
        candidates = machine_path_candidates()
        inventoried = machine_paths()
    except (OSError, ValueError, KeyError) as exc:  # the historical inventory or index is unreadable
        candidates, inventoried = set(), {receipt_rel}
        tests["machine_inputs_readable"] = False
        print(json.dumps({"machine_inputs_unreadable": str(exc)}), file=sys.stderr)
    # Finding 3: the receipt is a candidate machine input (so without the exclusion
    # it would be inventoried and the cycle would return) and it is excluded.
    tests["pnc019_receipt_would_cycle_without_exclusion"] = receipt_rel in candidates
    tests["pnc019_receipt_excluded_from_inventory"] = (
        receipt_rel in DERIVED_VALIDATION_OUTPUTS
        and receipt_rel not in inventoried
        and any(row["pattern"] == receipt_rel for row in EXCLUSIONS)
    )
    good = b"stable"
    with tempfile.TemporaryDirectory(prefix="pm-ea-closure-selftest-") as td:
        base = Path(td)
        probe = base / "source"
        probe.write_bytes(good)
        tests["rehash_positive_control"] = probe.stat().st_size == len(good) and sha(probe.read_bytes()) == sha(good)
        tests["same_length_changed_bytes_rejected"] = sha(b"stablE") != sha(good)

        open_root = base / "open"
        fixture.build(open_root, ea_closure, closed=False)
        closed_root = base / "closed"
        fixture.build(closed_root, ea_closure, closed=True)

        def errors(root: Path) -> set[str]:
            return {f.get("error") for f in ea_closure.pnc019_event_authority_clearance_failures(root)}

        residuals = {"event_denominator_unresolved", "event_family_contract_depth_unresolved"}
        open_errors = errors(open_root)
        tests["open_edition_keeps_both_residuals_without_audit_failures"] = (
            open_errors == residuals
            and ea_closure.event_authority_denominator_status(open_root) == ea_closure.EVENT_AUTHORITY_OPEN_STATUS
        )
        tests["closed_edition_clears_both_residuals"] = (
            errors(closed_root) == set()
            and ea_closure.event_authority_denominator_status(closed_root) == ea_closure.EVENT_AUTHORITY_CLOSED_STATUS
            and not ea_closure.event_authority_closure_failures(closed_root)
        )
        closed_registry = json.loads((closed_root / ea_closure.EVENT_FAMILY_REGISTRY_REL_PATH).read_bytes())
        closed_checkpoint = ea_closure.event_authority_checkpoint(closed_root)
        other_registry = json.loads(json.dumps(closed_registry))
        other_registry["families"][0]["event_type"] = "fx.unproven.recorded"
        tests["closed_edition_does_not_cover_a_different_registry"] = residuals <= {
            f["error"] for f in ea_closure.pnc019_event_authority_failures_for_registry(other_registry, checkpoint=closed_checkpoint)
        } and not ea_closure.pnc019_event_authority_failures_for_registry(closed_registry, checkpoint=closed_checkpoint)
        for name, (mutate, expected, group) in fixture.TAMPERS.items():
            root = fixture.copy_tree(closed_root, base / f"tamper-{name}")
            mutate(root, ea_closure)
            found = errors(root)
            killed = (
                expected in found
                and residuals <= found
                and ea_closure.event_authority_denominator_status(root) == ea_closure.EVENT_AUTHORITY_OPEN_STATUS
            )
            tamper_matrix[name] = {"group": group, "expected_refusal": expected, "killed": killed, "errors": sorted(found)}
            tests[f"tampered_{name}_refused"] = killed

        # The frozen check runs with its receipt redirected; its tracked receipt is untouched.
        frozen_root = base / "frozen"
        validator = frozen_root / ea_closure.EA_FROZEN_VALIDATOR_REL_PATH
        validator.parent.mkdir(parents=True)
        tracked = validator.parent / "receipts" / FROZEN_RECEIPT_NAME
        tracked.parent.mkdir()
        tracked.write_text("tracked\n")
        validator.write_text(
            "import json, os\nfrom pathlib import Path\nRECEIPT_DIR = Path(__file__).resolve().parent / 'receipts'\n"
            "def main():\n    RECEIPT_DIR.mkdir(parents=True, exist_ok=True)\n"
            "    (RECEIPT_DIR / 'event_authority_validator_receipt.json').write_text(json.dumps({'pass': True, 'map': os.environ.get('PM_EA_RECOUNT_SOURCE_MAP')}))\n"
            "    return 0\n"
        )
        source_map = base / "source-map.json"
        source_map.write_text("{}\n")
        receipt, raw, validator_sha, map_pin = run_frozen_check(frozen_root, str(source_map))
        tests["frozen_check_receipt_redirected_tracked_receipt_untouched"] = (
            receipt.get("pass") is True
            and tracked.read_text() == "tracked\n"
            and not (validator.parent / "__pycache__").exists()
            and receipt.get("map") == str(source_map.resolve())
            and map_pin == {"path": str(source_map.resolve()), "sha256": sha(b"{}\n")}
            and validator_sha == sha(validator.read_bytes())
        )

        # EA-27 continuity: cohorts by classification and the union recipe.
        ea27 = base / "EA-27.json"
        rows = [
            {"event_type": "a.registered", "classification": "registered"},
            {"event_type": "b.cpu", "classification": "confirmed_persisted_unregistered"},
            {"event_type": "c.alias", "classification": "alias"},
            {"event_type": "d.excluded", "classification": "excluded"},
        ]
        ea27.write_bytes(json_bytes({"union_rows": rows, "non_exact_pattern_rows": [{"event_type": "E.Pattern", "classification": "non_exact_pattern_or_schema_invalid_token"}], "union_rows_sha256": sha(canonical_json(rows))}))
        ea29 = base / "EA-29.md"
        ea29.write_text("ea29\n")
        continuity = compute_continuity_receipt(closed_root, ea27, ea29)
        tests["continuity_cohorts_derived_by_classification"] = (
            continuity["cohorts"] == {
                "known37": ["a.registered"],
                "july248_confirmed_persisted_unregistered": ["b.cpu"],
                "july40_unresolved": ["c.alias"],
                "july68_exact_excluded": ["d.excluded"],
                "july26_non_exact": ["E.Pattern"],
            }
            and continuity["unmapped_rows"] == []
            and continuity["union_rows_sha256_recomputed"] == continuity["ea27"]["declared_union_rows_sha256"]
        )
        rows.append({"event_type": "f.new_class", "classification": "invented"})
        ea27.write_bytes(json_bytes({"union_rows": rows, "non_exact_pattern_rows": []}))
        tests["continuity_unknown_classification_rejected"] = compute_continuity_receipt(closed_root, ea27, ea29)["unmapped_rows"] == ["f.new_class"]

    # Report literals: the live sources read the edition, and a literal is caught.
    texts = {path: (ROOT / path).read_text(encoding="utf-8") for path in REPORT_LITERAL_GUARDS}
    tests["reports_read_denominator_from_edition"] = not report_literal_failures(texts)
    planted = dict(texts)
    planted["scripts/pm-testing-session-event-admission.py"] += '\nREPORT = {"global_event_denominator": "UNKNOWN_OPEN"}\n'
    tests["report_literal_reintroduction_rejected"] = any(
        f["error"] == "event_denominator_literal_in_report" for f in report_literal_failures(planted)
    )
    passed = all(tests.values())
    print(json.dumps({"self_test_passed": passed, "negative_tests": tests, "tamper_matrix": tamper_matrix}, indent=2))
    return 0 if passed else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("generate", "validate", "self-test"))
    parser.add_argument("--outdir", help="External currentness output directory; generate requires an empty directory")
    parser.add_argument("--close", action="store_true", help="Write a CLOSED edition only if every closing condition recomputes; refuse otherwise")
    parser.add_argument("--token-ledger", help="Repository-relative S6 token-disposition ledger (with --close)")
    parser.add_argument("--depth-assessment", action="append", default=[], help="Repository-relative depth assessment for families without a current admission record (repeatable, with --close)")
    parser.add_argument("--ea27", default=str(DEFAULT_EA_DIR / ea_closure.EA27_LOGICAL_NAME), help="EA-27 producer union file (with --close)")
    parser.add_argument("--ea29", default=str(DEFAULT_EA_DIR / ea_closure.EA29_LOGICAL_NAME), help="EA-29 terminal findings file (with --close)")
    parser.add_argument("--recount-source-map", default=os.environ.get("PM_EA_RECOUNT_SOURCE_MAP"), help="PM_EA_RECOUNT_SOURCE_MAP for the frozen check run (with --close)")
    args = parser.parse_args()
    options = None
    if args.close:
        if args.command != "generate" or not args.token_ledger:
            parser.error("--close needs the generate command and --token-ledger")
        options = ClosingOptions(
            token_ledger=args.token_ledger,
            depth_assessments=tuple(args.depth_assessment),
            ea27=Path(args.ea27),
            ea29=Path(args.ea29),
            recount_source_map=args.recount_source_map,
        )
    if args.command != "self-test":
        try:
            configure_evidence_paths(globals(), outdir=args.outdir, command=args.command)
        except (EvidencePathError, OSError) as exc:
            print(json.dumps({"evidence_valid": False, "event_authority_closed": False, "error": str(exc)}))
            return 2
    if args.command == "generate":
        return generate(options)
    if args.command == "validate":
        return validate()
    return self_test()


if __name__ == "__main__":
    raise SystemExit(main())
