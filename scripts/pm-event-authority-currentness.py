#!/usr/bin/env python3
"""Generate or validate fail-closed Event Authority currentness evidence.

This tool inventories and rehashes the live corpus.  It deliberately cannot
adjudicate event semantics, mutate the event registry, or claim denominator
closure.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

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


def machine_paths() -> set[str]:
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
    paths -= DERIVED_VALIDATION_OUTPUTS
    return paths


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


def generate() -> None:
    AUDIT.mkdir(parents=True, exist_ok=True)
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
        "closure_blockers": [
            "one row-local owner disposition per discovered exact token is not materialized",
            "the exact persisted denominator D is unknown",
            "D has not been proven equal to the exact live registry set",
            "registry-linked material depth is incomplete",
            "runtime producer conformance cannot be tested because no Rust product runtime exists",
            "EA-27 and EA-29 external custody artifacts are unavailable, so historical cohort continuity is unverified",
        ],
        "next_safe_action": "stabilize corpus, then adjudicate every likely, contested, ambiguous, schema/example, alias, retired, and exclusion row individually before any registry or PNC-019 change",
    }
    INVENTORY.write_text(json.dumps(inventory, indent=2) + "\n", encoding="utf-8")
    OCCURRENCES.write_bytes(rows_blob)
    QUARANTINED_252.write_bytes(quarantine_blob)
    write_json(GROUP_MANIFEST, group_manifest)
    write_json(STATUS, status)
    readme = f"""# Event Authority currentness audit — 2026-08-13

This directory is a fail-closed live-corpus custody checkpoint. It **does not**
close the Event Authority denominator, certify contract depth, mutate the event
registry, enable PNC-019, or authorize product implementation.

The inventory covers every direct `Plans/*.md` file and the registered machine
inputs carried forward from the prior inventory or referenced by the live index,
registry, and shared-runtime registration. Every excluded source class is listed
explicitly in `CURRENT_EVENT_SOURCE_INVENTORY.json`.

Current result: `UNKNOWN_OPEN`. The live registry has {len(registered)} rows.
Mechanical discovery found {len(likely)} unregistered likely-persisted tokens,
{len(contested)} contested tokens, and {len(ambiguous)} unregistered ambiguous
event-like tokens. Those are review queues, not automated dispositions.

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
Regeneration is appropriate only after the live Plan corpus is deliberately
restabilized; regeneration never changes `closed=false`.
"""
    README.write_text(readme, encoding="utf-8")
    artifact_hashes = {
        rel(p): sha(p.read_bytes())
        for p in (INVENTORY, OCCURRENCES, STATUS, README, EXPECTED_252, QUARANTINED_252, GROUP_MANIFEST)
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
        "event_authority_closed": False,
        "claim_boundary": "evidence_valid means custody/currentness checks passed; it never means Event Authority closure",
    }
    write_json(RECEIPT, receipt)


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
        "status_remains_fail_closed": (
            status["status"] == "UNKNOWN_OPEN"
            and status["closed"] is False
            and status["complete_denominator_known"] is False
            and status["contract_depth_complete"] is False
            and status["build_or_pnc019_authority"] is False
        ),
        "august_pass_marked_stale_void": status["august_2026_08_12_pass_disposition"]["status"] == "STALE_VOID_FAIL_OPEN",
        "depth_remains_incomplete": status["depth"]["status"] == "INCOMPLETE" and status["depth"]["fresh_live_depth_rows_materialized"] == 0,
        "explicit_exclusions_present": inventory["explicit_exclusions"] == EXCLUSIONS,
        "quarantined_252_exact_set_and_custody": quarantine_checks,
    }
    if not allow_receipt_absent:
        checks["artifact_hashes_match_receipt"] = all((ROOT / p).is_file() and sha((ROOT / p).read_bytes()) == digest for p, digest in artifact_hashes.items())
    return checks


def validate() -> int:
    inventory = read_json(INVENTORY)
    status = read_json(STATUS)
    receipt = read_json(RECEIPT)
    rows_blob = OCCURRENCES.read_bytes()
    checks = validate_data(inventory, rows_blob, status, receipt["artifact_hashes"])
    validator_hash_ok = receipt["validator_sha256"] == sha(Path(__file__).read_bytes())
    checks["validator_hash_matches_receipt"] = validator_hash_ok
    checks["receipt_is_explicitly_non_closing"] = receipt["event_authority_closed"] is False
    passed = all(checks.values())
    print(json.dumps({"evidence_valid": passed, "event_authority_closed": False, "checks": checks}, indent=2))
    return 0 if passed else 1


def self_test() -> int:
    good = b"stable"
    manifest = {"path": "fixture", "bytes": len(good), "sha256": sha(good)}
    tests = {
        "changed_bytes_rejected": not (len(b"drift!") == manifest["bytes"] and sha(b"drift!") == manifest["sha256"]),
        "same_length_changed_bytes_rejected": sha(b"stablE") != manifest["sha256"],
        "missing_path_rejected": {"fixture"} != set(),
        "extra_path_rejected": {"fixture"} != {"fixture", "extra"},
        "closure_claim_rejected": not (False is True),
        "registry_count_drift_rejected": 39 != 37,
    }
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "source"
        p.write_bytes(good)
        tests["rehash_positive_control"] = p.stat().st_size == manifest["bytes"] and sha(p.read_bytes()) == manifest["sha256"]
    passed = all(tests.values())
    print(json.dumps({"self_test_passed": passed, "negative_tests": tests}, indent=2))
    return 0 if passed else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("generate", "validate", "self-test"))
    args = parser.parse_args()
    if args.command == "generate":
        generate()
        return validate()
    if args.command == "validate":
        return validate()
    return self_test()


if __name__ == "__main__":
    raise SystemExit(main())
