#!/usr/bin/env python3
"""Offline ER10 mechanical normalizer. Reads ONLY explicitly manifested snapshots.

No network, subprocess, live campaign reads, model calls, scientific adjudication,
pricing, monitoring, or favorable-score version selection. Python standard library.
"""
import argparse
import copy
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
INDEX = "state/logical-slot-index-v1.json"
INDEX_HASH = "45670c83f4bbc54a8d030ae488acc87de22a946f3113ec6d6a14148745c156a9"
ADMISSIONS = "state/final-finite-prospective-admissions-v3.json"
ADMISSIONS_HASH = "901e268b7020b26c2253faefdf852e86f642a6b1f4ac8c1ecc97809c16c0580a"
OWNER_FILES = {
    "targeted_cohort1": "helpers/targeted-supervisor/COMPARISONS.json",
    "targeted_cohort2": "helpers/targeted-cohort2/COMPARISONS.json",
    "targeted_cohort3": "reviews/targeted-cohort3/COMPARISONS.json",
    "targeted_cohort4": "helpers/targeted-cohort4/COMPARISONS.json",
    "integrated_method_supervisor": "helpers/integrated-execution/COMPARISONS.json",
    "anchor_supervisor": "reviews/anchors/COMPARISONS.json",
    "confirmation_supervisor": "reviews/confirmation/COMPARISONS.json",
}
STATE_FILES = {
    "targeted_cohort1": "state/targeted-cohort1.json",
    "targeted_cohort2": "state/targeted-cohort2.json",
    "targeted_cohort3": "state/targeted-cohort3.json",
    "targeted_cohort4": "state/targeted-cohort4.json",
    "integrated_method_supervisor": "state/integrated-methods.json",
    "anchor_supervisor": "state/anchor-supervisor.json",
}
ARM_FIELDS = [
    "original_source_grade", "original_scientific_judgment", "material_defect_count",
    "full_declared_scientific_scope_assessed", "full_declared_source_scope_assessed",
    "all_required_source_claims_verified", "required_process_history_verified",
    "required_final_artifact_delivery_observed", "native_active_observed",
    "native_complete_observed", "native_terminal_status", "t3_task_tree_quiet",
    "review_delivery_status", "review_within_original_allowance",
    "review_t3_status_original",
    "method_eligibility", "provenance_eligibility", "time_eligibility",
    "comparable_required_final_elapsed_seconds",
    "scientific_six_axis_assessment_complete",
]
# These are exact original declared-scope metadata values, never substring matching.
FULL_SCOPE_LABELS = [
    "FULL_DECLARED_SCOPE", "FULL_SCOPE_STATIC_SOURCE_REVIEW",
    "FULL_DECLARED_SCOPE_PRIMARY_SOURCE_REVIEW", "FULL_DECLARED_MATERIAL_SCOPE",
    "FULL_DECLARED_SOURCE_SCIENCE_AND_MAPPED_ARTIFACT_SCOPE", "FULL_DECLARED_CLAIM_SCOPE_CHECKED",
    "FULL_DECLARED_SCOPE_ASSESSED_COMPLETE", "COMPLETE_FULL_DECLARED_MATERIAL_SCOPE",
    "FULL_DECLARED_SOURCE_REVIEW_COMPLETE", "FULL_DECLARED_SCOPE_ASSESSED_WITH_MATERIAL_DEFECTS",
]
GRADE_POSITIVE = {"PASS": "PASS", "FullSourcePASS": "PASS",
                  "PASS_WITH_LIMITATIONS": "PASS_WITH_LIMITATIONS"}
GRADE_NEGATIVE = {"FAIL", "FullSourceFAIL", "PARTIAL", "HOLD", "UNASSESSED", "UNASSESSED_HOLD"}


def canonical(value):
    return (json.dumps(value, indent=2, ensure_ascii=False, sort_keys=True, allow_nan=False) + "\n").encode()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def ptr(doc, pointer):
    cur = doc
    if not pointer:
        return cur, True
    try:
        for raw in pointer.lstrip("/").split("/"):
            key = raw.replace("~1", "/").replace("~0", "~")
            cur = cur[int(key)] if isinstance(cur, list) else cur[key]
        return cur, True
    except (KeyError, IndexError, TypeError, ValueError):
        return None, False


def esc(value):
    return str(value).replace("~", "~0").replace("/", "~1")


def version(value, default=None):
    if isinstance(value, int) and not isinstance(value, bool):
        return "v" + str(value)
    if isinstance(value, str):
        if re.fullmatch(r"v?\d+", value):
            return "v" + value.lstrip("v")
        if value == "passivecarrier-v2-originalbudget":
            return "v2"
    return default


class Bundle:
    def __init__(self, manifests):
        self.entries, self.docs, self.manifest_refs = {}, {}, []
        self.cutoffs, self.missing, self.identity_failures = [], [], []
        self.root = None
        for filename in manifests:
            path = filename.resolve()
            data = path.read_bytes()
            doc = json.loads(data)
            self.root = self.root or doc["campaign_root"]
            if self.root != doc["campaign_root"]:
                raise ValueError("snapshot manifests disagree on campaign identity")
            self.manifest_refs.append({"path": str(path), "sha256": sha(data)})
            self.cutoffs.append(doc["observed_cutoff"])
            for entry in doc["files"]:
                rel = entry["relative_path"]
                if rel in self.entries and self.entries[rel].get("sha256") != entry.get("sha256"):
                    raise ValueError("duplicate snapshot path with conflicting identity: " + rel)
                e = dict(entry)
                if e.get("missing"):
                    self.missing.append(e)
                else:
                    snapshot = (path.parent / e["snapshot_path"]).resolve()
                    if path.parent not in snapshot.parents:
                        raise ValueError("snapshot escapes manifest directory: " + rel)
                    raw = snapshot.read_bytes()  # byte/hash verification BEFORE JSON parsing
                    if sha(raw) != e["sha256"] or len(raw) != e["bytes"]:
                        raise ValueError("snapshot byte identity mismatch: " + rel)
                    if e.get("expected_sha256") and e["expected_sha256"] != e["sha256"]:
                        raise ValueError("owner referenced frozen identity mismatch: " + rel)
                    e["_snapshot"] = snapshot
                    e["_verified_bytes"] = raw
                self.entries[rel] = e
        for name, expected in [(INDEX, INDEX_HASH), (ADMISSIONS, ADMISSIONS_HASH)]:
            if self.entries.get(name, {}).get("sha256") != expected:
                raise ValueError("required authority identity mismatch: " + name)

    def has(self, name):
        return name in self.entries and not self.entries[name].get("missing")

    def doc(self, name):
        if not self.has(name):
            return None
        if name not in self.docs:
            self.docs[name] = json.loads(self.entries[name]["_verified_bytes"])
        return self.docs[name]

    def ref(self, name, pointer=""):
        e = self.entries[name]
        return {"file": name, "pointer": pointer, "original_path": e["original_path"],
                "sha256": e.get("sha256"), "snapshot_path": e.get("snapshot_path"),
                "captured_at": e["capture_at"]}

    def rel(self, original):
        if not isinstance(original, str):
            return None
        if original.startswith(self.root + "/"):
            return original[len(self.root) + 1:]
        return original if original in self.entries else None


def assert_slot_population(slots):
    ids = [s["slot_id"] for s in slots]
    if len(ids) != len(set(ids)):
        raise ValueError("duplicate logical slot ID")
    if len(ids) != 40 or sum(len(s["logical_arms"]) for s in slots) != 80:
        raise ValueError("population must be exactly 40 logical slots / 80 logical arms")
    if any(s["logical_arms"] != ["control", "treatment"] for s in slots):
        raise ValueError("each exact slot must have control and treatment once")
    if dict(Counter(s["track"] for s in slots)) != {"targeted": 24, "integrated": 12, "confirmation": 4}:
        raise ValueError("track population mismatch")


def assert_unique_attempt_rows(rows):
    seen = set()
    for row in rows:
        key = (row["slot_id"], row["version"])
        if key in seen:
            raise ValueError("duplicate slot/version in the same authoritative row collection: " + str(key))
        seen.add(key)


# Live owner state is projected through a restricted mechanical vocabulary only.
# No findings, grades, source text, summaries, reviewer/candidate prose or transcripts.
MECHANICAL_LEAVES = {
    "case_id", "case", "slot_id", "arm", "stage", "role", "job", "version",
    "status", "state", "workState", "hasPendingChildRuns", "taskId", "childThreadId",
    "childRunId", "childNodeId", "latestTerminalRunId", "latestTerminalStatus",
    "directory", "path", "sha256", "bytes", "requestedAt", "startedAt", "completedAt",
    "actual_requestedAt", "actual_startedAt", "actual_t3_startedAt", "t3_completedAt",
    "T3_terminalAt", "T3_status", "host_releaseAt", "deadline", "absolute_deadline",
    "whole_arm_deadline", "absolute_pair_deadline", "absolute_seed_deadline", "T0",
    "common_T0", "clock_start", "dispatch_started", "disposition_terminal", "quiet",
    "settled", "native_status", "native_terminal", "terminal_observed_at", "output_present",
    "all_tasks_quiet", "all_owned_tasks_quiet", "all_candidates_and_reviewers_quiet",
    "native_all_complete", "candidate_all_native_complete", "original_v1_immutable",
    "native_active_observed", "native_complete", "activation_receipt_status",
    "dispatch_to_delivery_seconds", "request_to_terminal_seconds", "tokensUsed",
    "tokenBudget", "timeUsedSeconds", "no_new_start_until_root_glm2_transfer",
}
MECHANICAL_CONTAINERS = {
    "arms", "stages", "stage_records", "tasks", "dispatches", "versions", "prospective_versions",
    "v1", "v2", "v3", "final_v3_execution", "final_finite_v3", "prospective_m02b_v3",
    "review", "reviews", "receipt", "dispatch", "terminal_receipt", "native_activation",
    "native_terminal", "native_goal_raw", "native_goal", "native_lifecycle", "native",
    "t3_run", "actual_run", "activation", "freeze", "files", "artifacts", "pair_freeze",
    "stage_freezes", "terminal_disposition_v2", "seed_terminal", "seed_dispatch_v2",
    "native_projection_states", "get_goal_receipt", "final_get_goal_receipt",
    "update_goal_receipt", "structuredContent", "goal", "goals", "integration_state",
}


def mechanical(v, container=False):
    if isinstance(v, list):
        return [mechanical(x, True) for x in v if isinstance(x, (dict, list))]
    if not isinstance(v, dict):
        return copy.deepcopy(v)
    result = {}
    for k, value in v.items():
        if k in MECHANICAL_LEAVES and not isinstance(value, (dict, list)):
            result[k] = value
        elif k in MECHANICAL_CONTAINERS:
            if isinstance(value, dict):
                # Named arm/stage/version containers need one unlabelled level.
                if k in {"arms", "stages", "versions", "prospective_versions", "reviews", "files", "artifacts", "stage_freezes"}:
                    result[k] = {a: mechanical(x, True) for a, x in value.items()}
                else:
                    result[k] = mechanical(value, True)
            elif isinstance(value, list):
                result[k] = mechanical(value, True)
            elif k in {"pair_freeze", "native_terminal"}:
                result[k] = value
    return result


class Builder:
    def __init__(self, bundle):
        self.b = bundle
        self.slots = bundle.doc(INDEX)["slots"]
        assert_slot_population(self.slots)
        self.attempts = defaultdict(dict)
        self.mechanics = defaultdict(list)
        self.unresolved = []
        self.primary_collections = []

    def attempt(self, slot, ver):
        if slot not in {s["slot_id"] for s in self.slots}:
            raise ValueError("owner row names an unregistered logical slot: " + str(slot))
        if ver is None:
            raise ValueError("pair version absent without explicit context mapping: " + slot)
        if ver not in self.attempts[slot]:
            self.attempts[slot][ver] = {"slot_id": slot, "version": ver, "evidence_fragments": [],
                                      "arms": {a: {f: [] for f in ARM_FIELDS} for a in ["control", "treatment"]},
                                      "pair_fields": defaultdict(list)}
        return self.attempts[slot][ver]

    def field(self, at, arm, field, file, pointer, op="copy", rationale=None):
        value, present = ptr(self.b.doc(file), pointer)
        # Missing selectors remain declared in field-map for root's later rerun.
        ref = self.b.ref(file, pointer)
        ref.update(op=op, original_field_present=present)
        if rationale:
            ref["mapping_basis"] = rationale
        at["arms"][arm][field].append(ref)

    def pairfield(self, at, field, file, pointer, op="copy"):
        ref = self.b.ref(file, pointer)
        ref["op"] = op
        at["pair_fields"][field].append(ref)

    def fragment(self, at, file, pointer, role="frozen_owner_record"):
        ref = self.b.ref(file, pointer)
        if not any(x["reference"] == ref for x in at["evidence_fragments"]):
            at["evidence_fragments"].append({"reference": ref, "role": role})

    def quality_ref(self, at, arm, file, base=""):
        d, _ = ptr(self.b.doc(file), base)
        if not isinstance(d, dict):
            return
        for name in ["source_judgment", "overall_grade", "source_grade", "verdict"]:
            if name in d:
                self.field(at, arm, "original_source_grade", file, base + "/" + name)
                break
        for name in ["material_defect_count", "material_error_count", "material_errors", "material_scientific_errors"]:
            if isinstance(d.get(name), int) and not isinstance(d.get(name), bool):
                self.field(at, arm, "material_defect_count", file, base + "/" + name)
                break
        if "material_defect_count" not in d and isinstance(d.get("counts"), dict) and "material_error_count" in d["counts"]:
            self.field(at, arm, "material_defect_count", file, base + "/counts/material_error_count")
        for key in ["semantic_only_conclusion", "scientific_correctness", "semantic_conclusion", "assessment_extent", "grade_scope", "review_scope", "scope_limit", "scope_definition"]:
            if key in d:
                self.field(at, arm, "original_scientific_judgment", file, base + "/" + key)
                break
        for key in ["all_six_axes_assessed", "six_axes_assessed"]:
            if type(d.get(key)) is bool:
                self.field(at, arm, "scientific_six_axis_assessment_complete", file, base + "/" + key, "explicit_bool")
        for key in ["axes", "six_axes"]:
            if isinstance(d.get(key), list):
                self.field(at, arm, "scientific_six_axis_assessment_complete", file, base + "/" + key, "six_axis_explicit_assessment")
        if isinstance(d.get("counts"), dict):
            for key in ["axes", "six_axes"]:
                if isinstance(d["counts"].get(key), dict):
                    self.field(at, arm, "scientific_six_axis_assessment_complete", file, base + "/counts/" + key, "six_axis_census_only")
            if "axes_assessed" in d["counts"]:
                self.field(at, arm, "scientific_six_axis_assessment_complete", file, base + "/counts", "six_axis_census_only")
        for name in ["full_declared_scientific_scope_assessed", "entire_declared_scientific_scope_assessed",
                     "assessment_scope_complete", "assessment_coverage_complete", "full_supplied_scientific_scope_assessed"]:
            if name in d:
                self.field(at, arm, "full_declared_scientific_scope_assessed", file, base + "/" + name, "explicit_bool")
        # Exact declared scope labels are explicit author metadata. Counts and filenames are never used.
        for name in ["coverage", "assessment_extent", "status"]:
            if isinstance(d.get(name), str) and d[name] in FULL_SCOPE_LABELS:
                self.field(at, arm, "full_declared_scientific_scope_assessed", file, base + "/" + name, "declared_scope_label")
        extent = d.get("assessment_extent")
        if isinstance(extent, dict):
            for name in ["status", "extent", "disposition"]:
                if extent.get(name) in FULL_SCOPE_LABELS:
                    self.field(at, arm, "full_declared_scientific_scope_assessed", file, base + "/assessment_extent/" + name, "declared_scope_label")
        scope = d.get("scope", {})
        if isinstance(scope, dict) and "full_declared_semantic_scope_assessed" in scope:
            self.field(at, arm, "full_declared_scientific_scope_assessed", file, base + "/scope/full_declared_semantic_scope_assessed", "explicit_bool")

    def owner_rows(self, file, collection, default_version="v1", role="frozen_owner_record"):
        doc = self.b.doc(file)
        rows = doc.get(collection, [])
        if not isinstance(rows, list):
            return []
        observed = []
        result = []
        for i, row in enumerate(rows):
            sid = row.get("case_id", row.get("case", row.get("slot_id")))
            ver = version(row.get("version", row.get("matched_pair_version", row.get("candidate_version"))), default_version)
            if sid in {"D-M06-A", "D-M06-B"} and "seed_attempt" in row:
                ver = "v2"  # exact seed-v2 directories in original owner files; not a method-arm comparison
            at = self.attempt(sid, ver)
            p = "/" + collection + "/" + str(i)
            observed.append({"slot_id": sid, "version": ver})
            self.fragment(at, file, p, role)
            result.append((at, p, row))
        if role == "frozen_owner_record":
            assert_unique_attempt_rows(observed)
            self.primary_collections.append({"file": file, "collection": collection, "rows": observed})
        return result

    def build(self):
        # The primary owner row is copied verbatim as evidence, including every grade/cost/remainder.
        c1 = OWNER_FILES["targeted_cohort1"]
        rows = self.owner_rows(c1, "comparisons")
        for at, p, row in rows:
            for arm in ["control", "treatment"]:
                q = row.get("quality", {}).get(arm)
                if isinstance(q, dict):
                    self.quality_ref(at, arm, c1, p + "/quality/" + arm)
                self.field(at, arm, "method_eligibility", c1, p + "/qualified_method_comparison", "explicit_bool")
            self.pairfield(at, "original_disposition", c1, p + "/disposition")
        # Repeated projections are evidence fragments of existing attempts, never extra attempts.
        for file in ["helpers/targeted-supervisor/COMPARISONS-pre-final-preserved.json", "helpers/targeted-supervisor/COMPARISONS-full-final-preserved.json"]:
            if self.b.has(file):
                self.owner_rows(file, "comparisons", role="preserved_original_detailed_projection")

        c2 = OWNER_FILES["targeted_cohort2"]
        for at, p, row in self.owner_rows(c2, "cases"):
            for arm in ["control", "treatment"]:
                a = row.get("arms", {}).get(arm)
                if not isinstance(a, dict):
                    continue
                self.field(at, arm, "original_source_grade", c2, p + "/arms/" + arm + "/quality/source_quality")
                self.field(at, arm, "full_declared_scientific_scope_assessed", c2, p + "/arms/" + arm + "/quality/complete_scope_assessed", "explicit_bool")
                self.field(at, arm, "review_delivery_status", c2, p + "/review/review_status", "review_delivery")
                self.field(at, arm, "review_within_original_allowance", c2, p + "/review/review_overrun_seconds", "zero_overrun")
                self.field(at, arm, "time_eligibility", c2, p + "/arms/" + arm + "/timing/within900", "explicit_bool")
            self.pairfield(at, "original_disposition", c2, p + "/disposition")

        c3 = OWNER_FILES["targeted_cohort3"]
        for at, p, row in self.owner_rows(c3, "comparisons"):
            if at["version"] == "v3":
                for arm in ["control", "treatment"]:
                    self.field(at, arm, "original_source_grade", c3, p + "/" + arm)
                    self.field(at, arm, "comparable_required_final_elapsed_seconds", c3, p + "/economics/arms/" + arm + "/actual_common_T0_to_final_delivery_seconds", "positive_seconds")
                for label, original in row.get("review_freezes", {}).items():
                    file = self.b.rel(original)
                    if file and self.b.has(file):
                        r = self.b.doc(file)
                        arm = r.get("arm")
                        if arm in ["control", "treatment"]:
                            self.fragment(at, file, "", "exact_completed_own_review_metadata")
                            self.quality_ref(at, arm, file)
                            self.field(at, arm, "review_delivery_status", file, "/actual_run/status", "review_delivery")
                            self.field(at, arm, "t3_task_tree_quiet", file, "/quiet", "explicit_bool")
            self.pairfield(at, "original_disposition", c3, p + "/disposition")

        c4 = OWNER_FILES["targeted_cohort4"]
        for at, p, row in self.owner_rows(c4, "completed_assessment"):
            sid, ver = at["slot_id"], at["version"]
            for arm in ["control", "treatment"]:
                self.field(at, arm, "original_source_grade", c4, p + "/arms/" + arm + "/source_grade")
                if isinstance(row.get("arms", {}).get(arm, {}).get("material_defects"), int):
                    self.field(at, arm, "material_defect_count", c4, p + "/arms/" + arm + "/material_defects")
                self.field(at, arm, "review_delivery_status", c4, p + "/arms/" + arm + "/review_delivery_status", "review_delivery")
                for field, key in [("native_complete_observed", "candidate_all_native_complete"), ("t3_task_tree_quiet", "all_candidates_and_reviewers_quiet")]:
                    if key in row:
                        self.field(at, arm, field, c4, p + "/" + key, "explicit_bool")
                if isinstance(row.get("lifecycle"), dict):
                    self.field(at, arm, "native_complete_observed", c4, p + "/lifecycle/all_candidate_stages_native_complete", "explicit_bool")
                    self.field(at, arm, "t3_task_tree_quiet", c4, p + "/lifecycle/all_candidates_and_reviewers_T3_quiet", "explicit_bool")
                reviews = row.get("reviews", {})
                review = reviews.get(arm, {})
                if isinstance(review, dict):
                    if "material_defects" in review and type(review["material_defects"]) is int:
                        self.field(at, arm, "material_defect_count", c4, p + "/reviews/" + arm + "/material_defects")
                    for key in ["actual_T3_timing", "actual_t3_timing"]:
                        if isinstance(review.get(key), dict):
                            self.field(at, arm, "review_delivery_status", c4, p + "/reviews/" + arm + "/" + key + "/status", "review_delivery")
                    if "deadline_expired" in review:
                        self.field(at, arm, "review_within_original_allowance", c4, p + "/reviews/" + arm + "/deadline_expired", "inverse_bool")
                file = f"reviews/targeted-cohort4/{sid}/{arm}-{ver}/review.json"
                if self.b.has(file):
                    self.fragment(at, file, "", "exact_completed_own_review")
                    self.quality_ref(at, arm, file)
            comparison = self.b.doc(c4).get("cases", {}).get(sid, {}).get("comparison")
            file = self.b.rel(comparison)
            if file and self.b.has(file):
                self.fragment(at, file, "", "exact_frozen_own_comparison")
        self.owner_rows(c4, "incomplete_pair_dispositions", role="frozen_historical_incomplete_disposition")

        integ = OWNER_FILES["integrated_method_supervisor"]
        for collection in ["cases", "speed_cases"]:
            for at, p, row in self.owner_rows(integ, collection):
                for ver, child in row.get("versions", {}).items():
                    x = self.attempt(at["slot_id"], version(ver))
                    self.fragment(x, integ, p + "/versions/" + esc(ver), "frozen_owner_successor_record")
                self.pairfield(at, "original_disposition", integ, p + "/pair_disposition")
        for collection in ["standalone_diagnostics", "speed_arm_assessments"]:
            for key, value in self.b.doc(integ).get(collection, {}).items():
                sid, arm, ver = key.split("/")
                at = self.attempt(sid, ver)
                base = "/" + collection + "/" + esc(key)
                self.fragment(at, integ, base, "exact_original_standalone_assessment_projection")
                self.field(at, arm, "original_source_grade", integ, base + "/source_judgment")
                self.quality_ref(at, arm, integ, base)
                coverage = self.b.rel(value.get("coverage"))
                if coverage and self.b.has(coverage):
                    self.fragment(at, coverage, "", "exact_completed_standalone_own_coverage")
                    self.quality_ref(at, arm, coverage)

        for s in self.slots:
            sid = s["slot_id"]
            if sid.startswith("I-METHOD") or sid.startswith("I-FAST"):
                for ver in list(self.attempts[sid]):
                    for arm in ["control", "treatment"]:
                        names = [f"reviews/integrated-methods/{sid}/{arm}/review-{ver}/frozen-review.json",
                                 f"reviews/integrated-methods/{sid}/{arm}/standalone-diagnostic-{ver}/frozen-standalone-review.json"]
                        for file in names:
                            if not self.b.has(file):
                                continue
                            at = self.attempt(sid, ver)
                            self.fragment(at, file, "", "exact_completed_frozen_own_review")
                            d = self.b.doc(file)
                            if isinstance(d.get("coverage"), dict):
                                self.quality_ref(at, arm, file, "/coverage")
                            self.field(at, arm, "review_delivery_status", file, "/t3_run/status", "review_delivery")
                            self.field(at, arm, "review_within_original_allowance", file, "/delivery_in_review_deadline", "explicit_bool")
                            self.field(at, arm, "t3_task_tree_quiet", file, "/hasPendingChildRuns", "no_pending_terminal", rationale="review tree only; candidate tree evidence remains separate in original pair gate")
                        coverage = f"reviews/integrated-methods/{sid}/{arm}/review-{ver}/coverage.json"
                        if self.b.has(coverage):
                            self.fragment(self.attempt(sid, ver), coverage, "", "exact_completed_frozen_coverage")
                            self.quality_ref(self.attempt(sid, ver), arm, coverage)

        anchors = OWNER_FILES["anchor_supervisor"]
        for i, row in enumerate(self.b.doc(anchors)["pairs"]):
            sid = row["slot_id"]
            ver = "v2" if sid == "I-ANCHOR-GLM" else "v1"
            at = self.attempt(sid, ver)
            self.fragment(at, anchors, "/pairs/" + str(i))
            file = self.b.rel(row["comparison"])
            if not file or not self.b.has(file):
                self.unresolved.append({"slot_id": sid, "field": "frozen_anchor_comparison", "locator": row["comparison"]})
                continue
            self.fragment(at, file, "", "exact_frozen_own_comparison")
            doc = self.b.doc(file)
            for arm, a in doc["arms"].items():
                p = "/arms/" + arm
                q = a["quality"]
                grade_key = "overall_judgment" if "overall_judgment" in q else ("decision" if q.get("decision") is not None else ("review_status" if q.get("review_status") is not None else "status"))
                self.field(at, arm, "original_source_grade", file, p + "/quality/" + grade_key)
                self.field(at, arm, "material_defect_count", file, p + "/quality/material_defect_count")
                scope = q.get("grade_scope", {})
                for k in ["entire_declared_source_scope_assessed", "entire_declared_scope_assessed", "original_integrated_scope_assessed", "all_original_integrated_brief_obligations_assessed", "every_original_integrated_obligation_assessed"]:
                    if k in scope:
                        self.field(at, arm, "full_declared_scientific_scope_assessed", file, p + "/quality/grade_scope/" + k, "explicit_bool")
                self.field(at, arm, "all_required_source_claims_verified", file, p + "/quality/grade_scope/all_source_claims_verified", "explicit_bool")
                # GLM control explicitly has a source-unverified remainder; retain it as such.
                if "all_source_claims_verified" in scope:
                    self.field(at, arm, "full_declared_source_scope_assessed", file, p + "/quality/grade_scope/all_source_claims_verified", "explicit_bool")
                if "entire_declared_source_scope_assessed" in scope:
                    self.field(at, arm, "full_declared_source_scope_assessed", file, p + "/quality/grade_scope/entire_declared_source_scope_assessed", "explicit_bool")
                for k in ["required_final_artifacts_nonempty", "required_outputs_nonempty", "required_final_files_nonempty"]:
                    if k in a.get("delivery", {}):
                        self.field(at, arm, "required_final_artifact_delivery_observed", file, p + "/delivery/" + k, "explicit_bool", "declared required artifact delivery only; no scientific satisfaction implied")
                for k in ["actual_complete_observed", "active_and_complete_observed", "all_stages_complete_observed"]:
                    if k in a.get("native_lifecycle", {}):
                        self.field(at, arm, "native_complete_observed", file, p + "/native_lifecycle/" + k, "explicit_bool")
                    if k == "active_and_complete_observed" and k in a.get("native_lifecycle", {}):
                        self.field(at, arm, "native_active_observed", file, p + "/native_lifecycle/" + k, "explicit_bool")
                self.field(at, arm, "original_scientific_judgment", file, p + "/quality")
                self.field(at, arm, "provenance_eligibility", file, "/provenance_eligibility/status")
                if isinstance(a.get("evaluation"), dict):
                    if "T3_status" in a["evaluation"]:
                        self.field(at, arm, "review_delivery_status", file, p + "/evaluation/T3_status", "review_delivery")
                for k in ["cold_dispatch_to_required_T3_terminal_delivery_seconds", "cold_start_including_setup_to_T3_terminal_seconds"]:
                    if k in a.get("time", {}):
                        self.field(at, arm, "comparable_required_final_elapsed_seconds", file, p + "/time/" + k, "positive_seconds")
                        break
            if sid == "I-ANCHOR-GLM":
                old = self.attempt(sid, "v1")
                self.fragment(old, file, "/failure_inclusive_v1_route_diagnosis", "original_failed_route_cost_retained")

        confirmation = OWNER_FILES["confirmation_supervisor"]
        for i, row in enumerate(self.b.doc(confirmation)["original_comparisons"]):
            at = self.attempt(row["case"], "v1")
            self.fragment(at, confirmation, "/pairs/" + str(i), "frozen_owner_original_normalized_projection")
            file = self.b.rel(row["path"])
            self.fragment(at, file, "", "exact_original_frozen_comparison")
            d = self.b.doc(file)
            self.pairfield(at, "delivered_pair_assessment", file, "/assessed_pair", "explicit_bool")
            self.pairfield(at, "both_full_declared_source_coverage_original", file, "/both_arm_full_declared_source_coverage", "explicit_bool")
            for arm in ["control", "treatment"]:
                p = "/arms/" + arm
                self.field(at, arm, "original_source_grade", file, p + "/original_scientific_grade")
                self.field(at, arm, "material_defect_count", file, p + "/material_defect_count")
                self.field(at, arm, "full_declared_scientific_scope_assessed", file, p + "/full_declared_scope_assessed", "explicit_bool")
                self.field(at, arm, "full_declared_source_scope_assessed", file, p + "/full_declared_scope_assessed", "explicit_bool")
                self.field(at, arm, "review_t3_status_original", file, p + "/review_time_separate/status")
                if "review_delivered" in d["arms"][arm]:
                    self.field(at, arm, "review_delivery_status", file, p + "/review_delivered", "review_artifact_delivery")
                else:
                    self.field(at, arm, "review_delivery_status", file, p + "/review_time_separate/status", "review_delivery")
                self.field(at, arm, "time_eligibility", file, p + "/service_terminal_within45min", "explicit_bool")
                self.field(at, arm, "comparable_required_final_elapsed_seconds", file, p + "/failure_inclusive_service_latency_seconds", "positive_seconds")
                self.field(at, arm, "native_terminal_status", file, p + "/stages", "native_stage_statuses")
                self.field(at, arm, "native_complete_observed", file, p + "/stages", "all_native_stages_complete")
                self.field(at, arm, "original_scientific_judgment", file, p + "/original_scientific_grade")
                self.field(at, arm, "scientific_six_axis_assessment_complete", file, p + "/source6_axes_original", "six_axis_explicit_assessment")
            # One quiet receipt is explicitly for all 28 original confirmation tasks.
            quiet = "reviews/confirmation/FINAL_QUIET.json"
            for arm in ["control", "treatment"]:
                self.field(at, arm, "t3_task_tree_quiet", quiet, "/no_pending_children", "explicit_bool")

        self.state_metadata()
        self.targeted_review_metadata()
        self.pair_gates()
        self.mechanical_lifecycle()
        return self.finish()

    def state_metadata(self):
        for owner, file in STATE_FILES.items():
            d = self.b.doc(file)
            if not d:
                continue
            if owner == "targeted_cohort1":
                rows = [(x["case_id"], "/slots/" + str(i), x) for i, x in enumerate(d["slots"])]
            elif owner == "targeted_cohort2":
                rows = [(k, "/jobs/" + esc(k), v) for k, v in d["jobs"].items()]
            elif "cases" in d:
                rows = [(k, "/cases/" + esc(k), v) for k, v in d["cases"].items()]
            else:
                rows = []
            for sid, p, x in rows:
                ref = self.b.ref(file, p)
                self.mechanics[sid].append({"reference": ref, "projection": mechanical(x), "original_top_status": x.get("status", x.get("state", x.get("disposition")))})
                for k, v in x.get("versions", {}).items():
                    at = self.attempt(sid, version(k))
                    at.setdefault("mechanical_state_refs", []).append(self.b.ref(file, p + "/versions/" + esc(k)))
                for k, v in x.get("prospective_versions", {}).items():
                    at = self.attempt(sid, version(k))
                    at.setdefault("mechanical_state_refs", []).append(self.b.ref(file, p + "/prospective_versions/" + esc(k)))
                    if isinstance(v, dict) and v.get("state") == "METADATA_FROZEN_WAIT_CAPACITY_T0_UNSTARTED":
                        for arm in ["control", "treatment"]:
                            self.field(at, arm, "required_final_artifact_delivery_observed", file, p + "/prospective_versions/" + esc(k) + "/state", "unstarted_delivery_false")
                            self.field(at, arm, "review_delivery_status", file, p + "/prospective_versions/" + esc(k) + "/state", "unstarted_review_status")
                for k in ["v2", "v3"]:
                    if isinstance(x.get(k), dict):
                        at = self.attempt(sid, k)
                        at.setdefault("mechanical_state_refs", []).append(self.b.ref(file, p + "/" + k))
                        if x[k].get("status") == "HELD_GLM_CAPACITY_ZERO":
                            for arm in ["control", "treatment"]:
                                self.field(at, arm, "required_final_artifact_delivery_observed", file, p + "/" + k + "/status", "unstarted_delivery_false")
                                self.field(at, arm, "review_delivery_status", file, p + "/" + k + "/status", "unstarted_review_status")
                for arm in x.get("arms", {}):
                    match = re.fullmatch(r"(control|treatment)-(v\d+)", arm)
                    if match:
                        self.attempt(sid, match.group(2))
                # Explicit final-v3 field containers are version bindings, not source conclusions.
                for k in ["final_v3_execution", "prospective_m02b_v3"]:
                    if isinstance(x.get(k), dict):
                        at = self.attempt(sid, "v3")
                        at.setdefault("mechanical_state_refs", []).append(self.b.ref(file, p + "/" + k))
            # Candidate task directories identify attempts; reviewer repair versions do not.
            tasks = d.get("tasks", [])
            if isinstance(tasks, dict):
                tasks = list(tasks.values())
            for i, task in enumerate(tasks):
                if not isinstance(task, dict):
                    continue
                sid = task.get("case_id", task.get("case"))
                if sid not in {s["slot_id"] for s in self.slots}:
                    continue
                directory = task.get("directory", task.get("job", ""))
                if not isinstance(directory, str) or "/jobs/" not in directory:
                    continue
                v = re.findall(r"[-/]v(\d+)(?:[./_-]|$)", directory)
                if v:
                    at = self.attempt(sid, "v" + v[-1])
                    at.setdefault("candidate_task_mechanical_observations", []).append({"reference": self.b.ref(file), "projection": mechanical(task)})

    def targeted_review_metadata(self):
        # Own-case complete reviews only, already captured before parsing.
        c1_files = [f for f in self.b.entries if f.startswith("reviews/targeted/") and f.endswith("/REVIEW.json") and self.b.has(f)]
        for file in sorted(c1_files):
            d = self.b.doc(file)
            sid = d.get("case_id")
            if sid not in {s["slot_id"] for s in self.slots}:
                continue
            if sid == "D-M02-A":
                ver = "v3" if "/source-review-v3/" in file else "v2"
            elif sid == "D-M02-B":
                ver = "v3"  # exact own frozen review is of prospectively bound v3 candidate
            elif sid == "D-M03-B":
                ver = "v2"
            else:
                ver = "v1"  # reviewer v2 repairs do NOT create candidate pair v2
            at = self.attempt(sid, ver)
            self.fragment(at, file, "", "exact_completed_original_own_review")
            candidates = d.get("candidates", d.get("labels", {}))
            items = list(enumerate(candidates)) if isinstance(candidates, list) else list(candidates.items()) if isinstance(candidates, dict) else []
            identity_files = [str(Path(file).parent / "IDENTITY_MAP_PRIVATE.json"),
                              f"reviews/targeted/{sid}/source-review-v1/IDENTITY_MAP_PRIVATE.json"]
            label_to_arm = {}
            for identity in identity_files:
                if self.b.has(identity):
                    for label, mapped in self.b.doc(identity).items():
                        arm = mapped.get("arm") if isinstance(mapped, dict) else mapped
                        if arm in ["control", "treatment"]:
                            label_to_arm[label] = arm
                    self.fragment(at, identity, "", "original_mechanical_blind_label_arm_join")
            for key, candidate in items:
                # Mechanical arm attribution from explicit frozen own artifact path references only.
                text = json.dumps({k: v for k, v in candidate.items() if k in ["final_path", "artifacts", "artifact_scope_limit"]})
                labels = candidate.get("label", key)
                arm = label_to_arm.get(labels)
                if "/control/" in text and "/treatment/" not in text:
                    arm = "control"
                elif "/treatment/" in text and "/control/" not in text:
                    arm = "treatment"
                elif labels in ["X", "Y"]:
                    # X/Y is explicitly keyed in the owner detailed projection or source-map labels.
                    for fragment in at["evidence_fragments"]:
                        source, _ = ptr(self.b.doc(fragment["reference"]["file"]), fragment["reference"]["pointer"])
                        mapping = source.get("quality", {}).get("label_mapping", {}) if isinstance(source, dict) else {}
                        mapped = mapping.get(labels, {})
                        if isinstance(mapped, dict) and mapped.get("arm") in ["control", "treatment"]:
                            arm = mapped["arm"]
                            break
                    # Other original source review artifacts include own label final path.
                    if arm is None:
                        registers = d.get("reviewed_artifacts", d.get("artifact_register", []))
                        records = registers.values() if isinstance(registers, dict) else registers
                        for record in records:
                            if not isinstance(record, dict):
                                continue
                            # Exact label field only. Never match a one-character label in arbitrary prose/hash bytes.
                            if record.get("label") != labels:
                                continue
                            path = record.get("path", "")
                            if "/control/" in path:
                                arm = "control"
                            elif "/treatment/" in path:
                                arm = "treatment"
                if arm is None:
                    self.unresolved.append({"slot_id": sid, "version": ver, "field": "review_label_to_arm", "reference": self.b.ref(file), "label": labels, "reason": "no exact mechanical path/hash arm join; no guessed label mapping"})
                    continue
                container = "candidates" if "candidates" in d else "labels"
                base = "/" + container + "/" + esc(key)
                for grade in ["scientific_correctness_status", "final_scientific_correctness_status"]:
                    if grade in candidate:
                        self.field(at, arm, "original_source_grade", file, base + "/" + grade)
                        break
                if isinstance(candidate.get("scientific_correctness"), dict):
                    self.field(at, arm, "original_source_grade", file, base + "/scientific_correctness/status")
                    self.field(at, arm, "original_scientific_judgment", file, base + "/scientific_correctness")
                    self.quality_ref(at, arm, file, base + "/scientific_correctness")
                if "semantic_only_conclusion" in candidate:
                    self.field(at, arm, "original_scientific_judgment", file, base + "/semantic_only_conclusion")
                    semantic = candidate["semantic_only_conclusion"]
                    if isinstance(semantic, dict) and "pass_fail_grade" in semantic:
                        self.field(at, arm, "original_source_grade", file, base + "/semantic_only_conclusion/pass_fail_grade")
                self.quality_ref(at, arm, file, base)
                if "scope" in d and isinstance(d["scope"], dict) and "full_declared_semantic_scope_assessed" in d["scope"]:
                    self.field(at, arm, "full_declared_scientific_scope_assessed", file, "/scope/full_declared_semantic_scope_assessed", "explicit_bool")
            if isinstance(d.get("semantic_conclusion"), dict) and d.get("candidate") in ["X", "Y"]:
                # Exact own-arm review directories X/Y are bound by their reviewed final path.
                joined = label_to_arm.get(d["candidate"])
                arms = {joined} if joined in ["control", "treatment"] else set()
                if len(arms) == 1:
                    self.field(at, next(iter(arms)), "original_scientific_judgment", file, "/semantic_conclusion")
            # Actual T3 delivery receipt, separate from an authored full review.
            task_file = str(Path(file).parent / "TASK_TERMINAL.json")
            if self.b.has(task_file):
                for arm in ["control", "treatment"]:
                    self.field(at, arm, "review_delivery_status", task_file, "/structuredContent", "t3_terminal_delivery")
                self.fragment(at, task_file, "/structuredContent", "original_review_task_delivery_receipt")

    def pair_gates(self):
        for file in sorted(self.b.entries):
            if not self.b.has(file) or "pair" not in file.lower() or "freeze" not in file.lower() or not file.endswith(".json"):
                continue
            d = self.b.doc(file)
            if not isinstance(d, dict):
                continue
            sid = d.get("case_id", d.get("case"))
            if sid not in {s["slot_id"] for s in self.slots}:
                continue
            ver = version(d.get("version"))
            if ver is None:
                found = re.findall(r"-v(\d+)\.", file)
                ver = "v" + found[-1] if found else "v1"
            at = self.attempt(sid, ver)
            self.fragment(at, file, "", "original_mechanical_pair_gate")
            for arm in ["control", "treatment"]:
                if d.get("gate") == "BOTH_FULL_FINALS_NATIVE_COMPLETE_QUIET_FROZEN":
                    for field in ["required_final_artifact_delivery_observed", "native_complete_observed", "t3_task_tree_quiet"]:
                        self.field(at, arm, field, file, "/gate", "explicit_pair_gate")
                for field, k in [("required_final_artifact_delivery_observed", "both_full_final_carriers_present"), ("required_final_artifact_delivery_observed", "both_finals_frozen"), ("native_complete_observed", "both_native_complete_terminal_states"), ("t3_task_tree_quiet", "all_tasks_quiet"), ("t3_task_tree_quiet", "all_six_tasks_quiet")]:
                    if k in d:
                        self.field(at, arm, field, file, "/" + k, "explicit_bool")

    def mechanical_lifecycle(self):
        # Read only explicitly selected mechanical fields from captured owner state.
        for owner, file in STATE_FILES.items():
            d = self.b.doc(file)
            if not d:
                continue
            if owner == "targeted_cohort1":
                rows = [(x["case_id"], "/slots/" + str(i), x) for i, x in enumerate(d["slots"])]
            elif owner == "targeted_cohort2":
                rows = [(k, "/jobs/" + esc(k), v) for k, v in d["jobs"].items()]
            else:
                rows = [(k, "/cases/" + esc(k), v) for k, v in d.get("cases", {}).items()]
            for sid, p, row in rows:
                children = [("v1", p, row)] + [(version(k), p + "/versions/" + esc(k), x) for k, x in row.get("versions", {}).items()]
                for ver, base, x in children:
                    if owner == "integrated_method_supervisor":
                        for review_arm, r in x.get("reviews", {}).items():
                            if review_arm in ["control", "treatment"] and isinstance(r, dict) and "status" in r:
                                at = self.attempt(sid, ver)
                                self.field(at, review_arm, "review_delivery_status", file, base + "/reviews/" + esc(review_arm) + "/status", "review_delivery")
                    for arm_key, a in x.get("arms", {}).items():
                        if arm_key not in ["control", "treatment"] and not re.fullmatch(r"(control|treatment)-v\d+", arm_key):
                            continue
                        if not isinstance(a, dict):
                            continue
                        arm = arm_key.split("-v")[0]
                        observed_ver = "v" + arm_key.split("-v")[1] if "-v" in arm_key else ver
                        # Cohort1's original arms contain the actual route version in stage metadata.
                        if owner == "targeted_cohort1" and sid in ["D-M02-A", "D-M03-B"]:
                            observed_ver = "v2"
                        elif owner == "targeted_cohort1" and sid == "D-M02-B":
                            observed_ver = "v3"
                        at = self.attempt(sid, observed_ver)
                        ap = base + "/arms/" + esc(arm_key)
                        if isinstance(a.get("stages"), (dict, list)):
                            self.field(at, arm, "native_complete_observed", file, ap + "/stages", "all_native_stages_complete")
                            self.field(at, arm, "native_terminal_status", file, ap + "/stages", "native_stage_statuses")
                            self.field(at, arm, "native_active_observed", file, ap + "/stages", "all_native_stages_active_observed")
                            self.field(at, arm, "t3_task_tree_quiet", file, ap + "/stages", "all_candidate_stages_quiet")
                        if "native_terminal" in a:
                            self.field(at, arm, "native_terminal_status", file, ap + "/native_terminal", "native_status_only")
                            self.field(at, arm, "native_complete_observed", file, ap + "/native_terminal", "native_complete_only")
                        if "native_complete" in a:
                            self.field(at, arm, "native_complete_observed", file, ap + "/native_complete", "explicit_bool")
                        if "native_status" in a:
                            self.field(at, arm, "native_terminal_status", file, ap + "/native_status")
                        # Explicit absent final, never inferred from a filename or T3 status.
                        if "frozen_failure_disposition" in a:
                            self.field(at, arm, "method_eligibility", file, ap + "/comparison_eligibility")
                        if observed_ver == "v1" and owner == "targeted_cohort1":
                            self.field(at, arm, "t3_task_tree_quiet", OWNER_FILES[owner], "/completion/all_owned_tasks_quiet", "explicit_bool")
                if owner == "targeted_cohort2" and sid.startswith("D-M0") and sid not in ["D-M06-A", "D-M06-B"]:
                    for arm in ["control", "treatment"]:
                        at = self.attempt(sid, "v1")
                        self.field(at, arm, "t3_task_tree_quiet", file, "/final_verification/owned_running_children", "empty_children_only")
        # Explicit candidate-active observations in integrated per-stage state are preserved as an all-stage axis.
        # An absent native active receipt never becomes active because the task completed.
        file = STATE_FILES["targeted_cohort1"]
        for sid, versions in self.attempts.items():
            if not sid.startswith(("D-M01-", "D-M02-", "D-M03-")):
                continue
            for ver, at in versions.items():
                for arm in ["control", "treatment"]:
                    for field, op in [("native_complete_observed", "selected_tasks_native_complete"),
                                      ("native_active_observed", "selected_tasks_native_active"),
                                      ("native_terminal_status", "selected_tasks_native_statuses"),
                                      ("required_final_artifact_delivery_observed", "selected_tasks_final_presence")]:
                        self.field(at, arm, field, file, "/tasks", op)
                        at["arms"][arm][field][-1]["selection"] = {"case_id": sid, "version": ver, "arm": arm}
                    self.field(at, arm, "t3_task_tree_quiet", OWNER_FILES["targeted_cohort1"], "/completion/all_owned_tasks_quiet", "explicit_bool")

    def authority(self, s):
        sid = s["slot_id"]
        d = self.b.doc(ADMISSIONS)
        if sid in d["cases"]:
            return "v" + str(d["cases"][sid]["new_version"]), [self.b.ref(ADMISSIONS, "/cases/" + esc(sid))]
        fixed = {
            "D-M02-B": ("v3", "state/D-M02-B-prospective-v3-root-binding.json"),
            "D-M12-A": ("v3", "state/D-M12-A-prospective-v3-root-binding.json"),
            "I-METHOD-02": ("v2", "state/I-METHOD-02-prospective-v2-root-binding.json"),
            "I-METHOD-04": ("v2", "state/I-METHOD-04-prospective-v2-root-binding.json"),
        }
        if sid in fixed:
            ver, file = fixed[sid]
            return ver, [self.b.ref(file)]
        if sid == "D-M03-B":
            return "v2", [self.b.ref(OWNER_FILES[s["owner"]], "/comparisons/3/version")]
        if sid == "D-M13-A":
            return "v2", [self.b.ref("helpers/targeted-cohort4/D-M13-A/comparison-v2.json", "/matched_pair_version")]
        if sid == "I-ANCHOR-GLM":
            return "v2", [self.b.ref("reviews/anchors/I-ANCHOR-GLM/COMPARISON.json", "/arms/control/route_version"), self.b.ref("reviews/anchors/I-ANCHOR-GLM/COMPARISON.json", "/arms/treatment/route_version")]
        # Original version v1 is prospectively the only authorized final attempt for these slots.
        return "v1", [self.b.ref(INDEX, "/slots/" + str(self.slots.index(s))), self.b.ref(OWNER_FILES[s["owner"]])]

    def finish(self):
        result = []
        for s in self.slots:
            sid = s["slot_id"]
            final, refs = self.authority(s)
            self.attempt(sid, final)
            if not self.attempts[sid]:
                self.attempt(sid, "v1")
            attempts = []
            if final != "v1" and "v1" not in self.attempts[sid]:
                self.unresolved.append({"slot_id": sid, "field": "prior_version_lineage_binding", "reference": self.b.ref(OWNER_FILES[s["owner"]]),
                                        "reason": "Earlier original failures/costs are retained verbatim in owner/root-binding evidence, but an original v1 outcome row is not separately bound in these seven snapshots. No fabricated v1 comparison/grade/cost; root may supply another immutable lineage snapshot."})
            for ver, at in sorted(self.attempts[sid].items(), key=lambda item: int(item[0].lstrip("v"))):
                at["pair_fields"] = dict(at["pair_fields"])
                at["version_authority_role"] = "final_prospectively_authorized" if ver == final else "preserved_original_or_earlier_version"
                attempts.append(at)
            result.append({"slot_id": sid, "track": s["track"], "owner": s["owner"],
                           "index_reference": self.b.ref(INDEX, "/slots/" + str(self.slots.index(s))),
                           "final_authorized_version": final, "authority_references": refs,
                           "attempt_mappings": attempts, "mechanical_state_observations": self.mechanics[sid]})
        return {"schema": "ER10_EXPLICIT_FIELD_MAP_V1", "status": "WORKING_IN_PROGRESS",
                "input_manifests": self.b.manifest_refs, "population_sha256": INDEX_HASH,
                "version_authority_sha256": ADMISSIONS_HASH,
                "operations": {"copy": "exact original value, no grading or conversion",
                               "explicit_bool": "only original JSON bool, else NULL",
                               "inverse_bool": "invert one explicit original boolean; never absence",
                               "declared_scope_label": "only exact declared scope labels in full_scope_labels; never counts/axis wording/filenames",
                               "explicit_pair_gate": "exact formal BOTH_FULL_FINALS_NATIVE_COMPLETE_QUIET_FROZEN metadata",
                               "review_delivery": "exact delivered/partial/missing statuses, scientific grade independent",
                               "review_artifact_delivery": "original explicit reviewer-artifact delivered bool, separate from T3 task status",
                               "t3_terminal_delivery": "original structured task status only; no full scientific scope or grade inferred",
                               "zero_overrun": "reported reviewer overrun == 0 only; no timing substitution",
                               "positive_seconds": "positive numeric original elapsed, descriptive only",
                               "no_pending_terminal": "always NULL: pending=false alone cannot establish terminal/quiet",
                               "empty_children_only": "original explicit empty owned-child set/count, no native/source proof",
                               "six_axis_explicit_assessment": "all exactly six original per-axis assessment fields explicitly assessed; grade statuses ignored; no FULL_SOURCE inference",
                               "six_axis_census_only": "original declared6/assessed6/unassessed0 AXIS inventory only; no full source/process inference",
                               "native_status_only": "select actual native projection/Goal status fields only; never T3 or narrative",
                               "native_complete_only": "all explicitly reported native states complete, else false for a known noncomplete state or NULL if absent",
                               "native_stage_statuses": "original native status list per original stage, no cumulative usage sum",
                               "all_native_stages_complete": "all required recorded stages have actual native complete evidence; noncomplete false, missing NULL",
                               "all_native_stages_active_observed": "all original per-stage native_active_observed booleans, never task-ID/terminal inference",
                               "all_candidate_stages_quiet": "all exact stages T3 terminal with hasPendingChildRuns=false; known running/pending false; otherwise NULL",
                               "unstarted_delivery_false": "exact explicit unstarted/held status establishes no authorized scientific final delivery; no zero-cost/grade inference",
                               "unstarted_review_status": "exact explicit unstarted/held status becomes NOT_STARTED, no grade",
                               "selected_tasks_native_complete": "select exact case/arm/candidate-directory version; actual native terminal receipts complete for each selected stage; missing NULL",
                               "selected_tasks_native_active": "same exact selection, actual get_goal activation status active for each stage; missing NULL",
                               "selected_tasks_native_statuses": "same exact selection, actual original native terminal statuses separately",
                               "selected_tasks_final_presence": "same exact selection, original explicit output_present for each configured final stage; declared artifact delivery only, no fulfilled scope"},
                "full_scope_labels": FULL_SCOPE_LABELS, "slots": result,
                "unresolved_schema_mapping": self.unresolved,
                "authority_rule": "Prospective final version only; no best grade/ratio selection. Reviewer repairs and helpers never new logical slots."}


def transformed(value, op, labels, selection=None):
    if op == "copy":
        return value
    if op == "explicit_bool":
        return value if type(value) is bool else None
    if op == "inverse_bool":
        return not value if type(value) is bool else None
    if op in ["unstarted_delivery_false", "unstarted_review_status"]:
        if value in ["METADATA_FROZEN_WAIT_CAPACITY_T0_UNSTARTED", "HELD_GLM_CAPACITY_ZERO"]:
            return False if op == "unstarted_delivery_false" else "NOT_STARTED"
        return None
    if op == "declared_scope_label":
        return True if isinstance(value, str) and value in labels else None
    if op == "explicit_pair_gate":
        return True if value == "BOTH_FULL_FINALS_NATIVE_COMPLETE_QUIET_FROZEN" else None
    if op == "positive_seconds":
        return value if type(value) in [int, float] and value > 0 else None
    if op == "zero_overrun":
        return value == 0 if type(value) in [int, float] else None
    if op == "no_pending_terminal":
        return None  # pending=false by itself never establishes quiet/terminal status
    if op == "empty_children_only":
        return True if value == 0 or value == [] else None
    if op == "six_axis_explicit_assessment":
        if not isinstance(value, list) or len(value) != 6:
            return None
        assessments = [row.get("assessment") for row in value if isinstance(row, dict)]
        if len(assessments) != 6 or any(x is None for x in assessments):
            return None
        if all(x in ["ASSESSED", "assessed", "COMPLETE", "complete"] for x in assessments):
            return True
        if any(x in ["UNASSESSED", "unassessed", "PARTIAL", "partial"] for x in assessments):
            return False
        return None
    if op == "six_axis_census_only":
        if not isinstance(value, dict):
            return None
        declared = value.get("complete", value.get("complete_scope_count", value.get("axes_declared")))
        assessed = value.get("assessed", value.get("assessed_count", value.get("axes_assessed")))
        unassessed = value.get("unassessed", value.get("unassessed_count", value.get("axes_unassessed")))
        if declared == 6 and type(assessed) is int and type(unassessed) is int:
            return assessed == 6 and unassessed == 0
        return None
    if op.startswith("selected_tasks_"):
        if not isinstance(value, list) or not selection:
            return None
        tasks = []
        for task in value:
            if task.get("case_id") != selection["case_id"] or task.get("arm") != selection["arm"]:
                continue
            directory = task.get("directory", "")
            versions = re.findall(r"[-/]v(\d+)(?:[./_-]|$)", directory)
            if versions and "v" + versions[-1] == selection["version"]:
                tasks.append(task)
        if not tasks:
            return None
        if op == "selected_tasks_final_presence":
            finals = [t for t in tasks if t.get("final")]
            flags = [t.get("output_present") for t in finals]
            return all(flags) if flags and all(type(f) is bool for f in flags) else None
        if op == "selected_tasks_native_active":
            states = [native_statuses((t.get("native_activation") or {}).get("get_goal_receipt")) for t in tasks]
            return all("active" in ss for ss in states) if all(states) else None
        states = [native_statuses(t.get("native_terminal")) for t in tasks]
        if op == "selected_tasks_native_statuses":
            return states if any(states) else None
        if op == "selected_tasks_native_complete":
            if any(any(s in ["paused", "blocked", "active", "failed", "cancelled"] for s in ss) for ss in states):
                return False
            return all(all(s == "complete" for s in ss) for ss in states) if all(states) else None
        raise ValueError("unknown selected-task operation")
    if op == "t3_terminal_delivery":
        if not isinstance(value, dict):
            return None
        task = value.get("task", value)
        status = task.get("status", task.get("latestTerminalStatus"))
        if status == "completed":
            return "DELIVERED"
        if status in ["interrupted", "cancelled", "failed"]:
            return "PARTIAL_OR_MISSING"
        if status in ["running", "waiting", "queued"]:
            return "IN_PROGRESS"
        return None
    if op in ["native_status_only", "native_complete_only"]:
        statuses = native_statuses(value)
        if op == "native_status_only":
            return statuses or None
        if not statuses:
            return None
        return all(s == "complete" for s in statuses) if all(s in ["complete", "paused", "blocked", "active", "failed", "cancelled"] for s in statuses) else None
    if op in ["native_stage_statuses", "all_native_stages_complete", "all_native_stages_active_observed", "all_candidate_stages_quiet"]:
        if isinstance(value, dict):
            stages = list(value.values())
        elif isinstance(value, list):
            stages = value
        else:
            return None
        if not stages or not all(isinstance(s, dict) for s in stages):
            return None
        if op == "all_native_stages_active_observed":
            active = [s.get("native_active_observed") for s in stages]
            return all(active) if all(type(a) is bool for a in active) else None
        if op == "all_candidate_stages_quiet":
            if any(s.get("status") in ["running", "waiting", "queued", "starting"] or s.get("hasPendingChildRuns") is True for s in stages):
                return False
            if all(s.get("status") in ["completed", "interrupted", "failed", "cancelled"] and s.get("hasPendingChildRuns") is False for s in stages):
                return True
            return None
        statuses = []
        for stage in stages:
            if "native_terminal_statuses" in stage:
                native = native_statuses(stage["native_terminal_statuses"])
            elif "native_terminal" in stage:
                native = native_statuses(stage["native_terminal"])
            elif "native_projection_states" in stage:
                native = native_statuses(stage["native_projection_states"])
            else:
                native = []
            statuses.append(native)
        if op == "native_stage_statuses":
            return statuses if any(statuses) else None
        if any(any(s in ["paused", "blocked", "active", "failed", "cancelled"] for s in ss) for ss in statuses):
            return False
        if all(ss and all(s == "complete" for s in ss) for ss in statuses):
            return True
        return None
    if op == "review_delivery":
        exact = {"completed": "DELIVERED", "INDEPENDENT_FULL_SCOPE_EVALUATED": "DELIVERED",
                 "interrupted": "PARTIAL_OR_MISSING", "running": "IN_PROGRESS",
                 "missing": "MISSING", "UNASSESSED_HOLD": "MISSING"}
        return exact.get(value) if isinstance(value, str) else None
    if op == "review_artifact_delivery":
        return "DELIVERED" if value is True else "MISSING" if value is False else None
    raise ValueError("unrecognized field mapping operation: " + op)


def native_statuses(value):
    """Only native projection/Goal receipt status fields; never T3 or textual completion inference."""
    known = {"complete", "paused", "blocked", "active", "failed", "cancelled"}
    if isinstance(value, str):
        return [value] if value in known else []
    if isinstance(value, list):
        return [s for row in value for s in native_statuses(row)]
    if not isinstance(value, dict):
        return []
    for name in ["status", "native_status", "native_terminal_status"]:
        if isinstance(value.get(name), str) and value[name] in known:
            return [value[name]]
    result = []
    for name in ["goal", "goals", "structuredContent", "integration_state", "get_goal_receipt", "final_get_goal_receipt", "update_goal_receipt", "native_terminal_statuses", "native_projection_states"]:
        if name in value:
            result.extend(native_statuses(value[name]))
    # Provider native status maps may be keyed by native session or topic name.
    if not result and value and all(isinstance(v, str) and v in known for v in value.values()):
        result = list(value.values())
    return result


def resolve_field(bundle, refs, labels):
    observations = []
    known = []
    for ref in refs:
        value, present = ptr(bundle.doc(ref["file"]), ref["pointer"])
        normalized = transformed(value, ref["op"], labels, ref.get("selection")) if present else None
        # State may include live scientific summaries; preserve selected mechanical metadata only.
        if ref["op"].startswith("selected_tasks_") and isinstance(value, list):
            sel = ref["selection"]
            selected = []
            for task in value:
                versions = re.findall(r"[-/]v(\d+)(?:[./_-]|$)", task.get("directory", ""))
                if task.get("case_id") == sel["case_id"] and task.get("arm") == sel["arm"] and versions and "v" + versions[-1] == sel["version"]:
                    selected.append(task)
            observed_value = mechanical(selected)
        else:
            observed_value = mechanical(value) if ref["file"].startswith("state/") and isinstance(value, (dict, list)) else value
        observations.append({"reference": ref, "present": present, "original_value": observed_value,
                             "mechanical_value": normalized})
        if normalized is not None:
            known.append(normalized)
    unique = {json.dumps(v, sort_keys=True, ensure_ascii=False) for v in known}
    conflict = len(unique) > 1
    return {"value": None if conflict or not known else known[0],
            "resolution": "CONFLICT_UNKNOWN" if conflict else ("EXPLICIT_ORIGINAL" if known else "NULL_UNKNOWN"),
            "observations": observations}


def grade_label(value):
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return value.get("status", value.get("grade"))
    return None


def metadata_remainders(fragment):
    """Copy original coverage/process/preservation metadata without new findings."""
    keys = [k for k in fragment if any(word in k.lower() for word in ["coverage", "scope", "unassessed", "remainder", "limit", "process", "history", "obligation", "preserv", "axis", "axes", "counts", "qualification"])]
    return {k: copy.deepcopy(fragment[k]) for k in keys}


def normalize_attempt(bundle, mapping, labels):
    record = {k: copy.deepcopy(mapping[k]) for k in ["slot_id", "version", "version_authority_role"]}
    record["evidence_fragments"] = []
    record["coverage_process_and_scope_original"] = []
    for fragment in mapping["evidence_fragments"]:
        ref = fragment["reference"]
        value, present = ptr(bundle.doc(ref["file"]), ref["pointer"])
        if not present:
            raise ValueError("mapped frozen evidence fragment disappeared")
        record["evidence_fragments"].append({**fragment, "original_record": value})
        if isinstance(value, dict):
            record["coverage_process_and_scope_original"].append({"reference": ref, "original_metadata": metadata_remainders(value)})
    record["arms"] = {}
    for arm in ["control", "treatment"]:
        fields = {k: resolve_field(bundle, mapping["arms"][arm][k], labels) for k in ARM_FIELDS}
        original = fields["original_source_grade"]["value"]
        label = grade_label(original)
        # C01 original material_defect_count=0 remains in observations and the verbatim comparison.
        # A missing review supplies no assessed defect census, so normalized value is NULL.
        if mapping["slot_id"] == "C-01" and arm == "control":
            fields["material_defect_count"]["value"] = None
            fields["material_defect_count"]["resolution"] = "NULL_UNASSESSED_ORIGINAL_ZERO_RETAINED"
            fields["material_defect_count"]["annotation"] = "Original 0 is preserved. Missing control review/UNASSESSED_HOLD provides no scientific defect census; NULL is unknown, never zero defects."
        pass_value = True if label in GRADE_POSITIVE else False if label in GRADE_NEGATIVE else None
        fields["source_pass_status"] = {"value": GRADE_POSITIVE.get(label, "NO_SOURCE_PASS" if pass_value is False else None),
                                        "original_grade_label": label, "explicit_grade_supported_positive": pass_value,
                                        "qualified_all_requirements_or_speed_win_implied": False}
        record["arms"][arm] = {"arm": arm, "fields": fields}
        record["arms"][arm]["review_deliveries_separate_original_attempts"] = [o for o in fields["review_delivery_status"]["observations"] if o["present"]]
    record["pair_fields"] = {k: resolve_field(bundle, v, labels) for k, v in mapping["pair_fields"].items()}
    arms = record["arms"]
    booleans = [arms[a]["fields"]["full_declared_source_scope_assessed"]["value"] for a in ["control", "treatment"]]
    top = record["pair_fields"].get("both_full_declared_source_coverage_original", {})
    top_present = any(x["present"] for x in top.get("observations", []))
    if not top_present and all(type(x) is bool for x in booleans):
        record["both_full_declared_source_coverage"] = {"value": all(booleans), "derivation": "AND of exactly two explicit original arm booleans; original top field absent", "arm_values": booleans}
    else:
        record["both_full_declared_source_coverage"] = {"value": top.get("value"), "derivation": "original explicit pair field" if top_present else "NULL: absent original field; both explicit arm booleans unavailable"}
    # Only required final deliveries with comparable exact clocks yield a NEW ratio.
    deliver = [arms[a]["fields"]["required_final_artifact_delivery_observed"]["value"] for a in ["control", "treatment"]]
    clocks = [arms[a]["fields"]["comparable_required_final_elapsed_seconds"]["value"] for a in ["control", "treatment"]]
    ratio = clocks[0] / clocks[1] if deliver == [True, True] and all(type(t) in [int, float] and t > 0 for t in clocks) else None
    record["performance_ratio"] = {"control_over_treatment": ratio, "label": "DESCRIPTIVE_ONLY" if ratio is not None else "NOT_COMPUTED",
                                   "eligibility": "required deliveries and matched clock definitions must both be explicit; quality/process/provenance/native/economic qualification separate",
                                   "quality_preserving_twofold_win": None}
    record["mechanical_state_observations"] = []
    for ref in mapping.get("mechanical_state_refs", []):
        value, _ = ptr(bundle.doc(ref["file"]), ref["pointer"])
        record["mechanical_state_observations"].append({"reference": ref, "projection": mechanical(value)})
    record["candidate_task_mechanical_observations"] = mapping.get("candidate_task_mechanical_observations", [])
    return record


def closed_categories(slot):
    final = slot["final_authorized_attempt"]
    fields = [final["arms"][a]["fields"] for a in ["control", "treatment"]]
    delivered = [f["required_final_artifact_delivery_observed"]["value"] for f in fields]
    quiet = [f["t3_task_tree_quiet"]["value"] for f in fields]
    if delivered == [True, True] and quiet == [True, True]:
        return "both_required_final_deliveries_and_explicit_task_trees_quiet"
    # Never carry an old terminal owner total into a held successor slot.
    statuses = []
    for row in final.get("mechanical_state_observations", []):
        p = row["projection"]
        statuses.append(p.get("status", p.get("state", "")))
    for row in slot.get("mechanical_state_observations", []):
        p = row["projection"]
        if final["version"] == "v3" and isinstance(p.get("v3"), dict):
            statuses.append(p["v3"].get("status", ""))
        elif final["version"] == "v1":
            statuses.append(row.get("original_top_status", ""))
    unstarted_labels = {"METADATA_FROZEN_WAIT_CAPACITY_T0_UNSTARTED", "UNSTARTED_HELD_GLM_CAPACITY", "HELD_GLM_CAPACITY", "HELD_GLM_CAPACITY_ZERO", "unstarted", "held"}
    if any(s in unstarted_labels or (isinstance(s, str) and "UNSTARTED" in s) for s in statuses):
        return "explicitly_unstarted_or_held_authorized_successor"
    if any(x is False for x in delivered) and any(x is True for x in delivered):
        return "explicit_partial_required_final_delivery"
    return "in_progress_or_unresolved_delivery_mapping"


def telemetry_supplement(bundle):
    file = "helpers/recorded-usage/observation-20261007T211653Z-aa6ea07490bb4a08.json"
    validation = "state/recorded-usage-root-validation-v1.json"
    d = bundle.doc(file)
    root = bundle.doc(validation)
    if root["observation_sha256"] != bundle.entries[file]["sha256"]:
        raise ValueError("SDK observation root-validation identity mismatch")
    # Deliberately never export sessions, rollouts, selected excerpts or transcript content.
    groups = d.get("unique_session_sums", [])
    native_ids = [n for g in groups for n in g.get("native_ids", [])]
    if len(native_ids) != len(set(native_ids)):
        raise ValueError("telemetry groups duplicate native sessions")
    return {"status": "OLD_FROZEN_SDK_TELEMETRY_SUPPLEMENT_ONLY", "reference": bundle.ref(file),
            "independent_root_validation_reference": bundle.ref(validation), "independent_root_validation_original": root,
            "observed_at_utc": d.get("observed_at_utc"), "original_reader_window_expired": True,
            "coverage_original": d.get("coverage"), "unique_session_groups_original": groups,
            "attribution_policy": "Exact groups retain observed_roles; mixed candidate/reviewer/root/helper roles are NEVER assigned wholesale to candidate arms. This does not replace original NULL economic/grade fields.",
            "native_cumulative_proxy_sum": None, "billing": None, "remaining_account_quota": None,
            "price_or_affordability_inference": None, "complete_campaign_or_arm_usage": False}


def normalized_report(bundle, fieldmap):
    slots = []
    unresolved = list(fieldmap["unresolved_schema_mapping"])
    for mapping in fieldmap["slots"]:
        attempts = [normalize_attempt(bundle, x, fieldmap["full_scope_labels"]) for x in mapping["attempt_mappings"]]
        assert_unique_attempt_rows(attempts)
        final = next(x for x in attempts if x["version"] == mapping["final_authorized_version"])
        slot = {k: copy.deepcopy(mapping[k]) for k in ["slot_id", "track", "owner", "index_reference", "final_authorized_version", "authority_references", "mechanical_state_observations"]}
        slot.update(attempts=attempts, final_authorized_attempt=final,
                    campaign_terminal=None, campaign_terminal_reason="WORKING snapshot; original terminal owner counters do not establish final authorized successor/review closure")
        slot["working_delivery_category"] = closed_categories(slot)
        for arm in ["control", "treatment"]:
            for k, f in final["arms"][arm]["fields"].items():
                if k in ["source_pass_status", "original_scientific_judgment", "review_t3_status_original"]:
                    continue
                if f["value"] is None:
                    unresolved.append({"slot_id": slot["slot_id"], "version": final["version"], "arm": arm, "field": k,
                                       "resolution": f["resolution"], "locators": [o["reference"] for o in f["observations"]],
                                       "reason": "No explicit unambiguous original field; frozen original evidence preserved; no source/grade inference"})
        slots.append(slot)
    assert_slot_population([{**s, "logical_arms": list(s["final_authorized_attempt"]["arms"])} for s in slots])
    final_fields = [s["final_authorized_attempt"]["arms"][a]["fields"] for s in slots for a in ["control", "treatment"]]
    axes = {}
    for field in ["full_declared_scientific_scope_assessed", "full_declared_source_scope_assessed", "all_required_source_claims_verified", "required_process_history_verified", "scientific_six_axis_assessment_complete", "required_final_artifact_delivery_observed", "native_active_observed", "native_complete_observed", "t3_task_tree_quiet", "review_within_original_allowance"]:
        counts = Counter("unknown" if f[field]["value"] is None else str(f[field]["value"]).lower() for f in final_fields)
        axes[field] = {"true": counts["true"], "false": counts["false"], "unknown": counts["unknown"], "denominator": 80}
    review = Counter(f["review_delivery_status"]["value"] or "UNKNOWN" for f in final_fields)
    grade = Counter(grade_label(f["original_source_grade"]["value"]) or "NULL_UNKNOWN" for f in final_fields)
    positive = Counter(f["source_pass_status"]["value"] or "UNKNOWN" for f in final_fields)
    confirmation_slots = [s for s in slots if s["track"] == "confirmation"]
    observed_confirmation = {
        "frozen_original_comparisons": len(confirmation_slots),
        "delivered_pair_assessments": sum(s["final_authorized_attempt"]["pair_fields"]["delivered_pair_assessment"]["value"] is True for s in confirmation_slots),
        "both_full_declared_source_coverage": sum(s["final_authorized_attempt"]["both_full_declared_source_coverage"]["value"] is True for s in confirmation_slots),
        "qualified_wins": bundle.doc(OWNER_FILES["confirmation_supervisor"])["counts"]["qualified_confirmation_wins"],
        "quiet_task_count": bundle.doc("reviews/confirmation/FINAL_QUIET.json")["task_count"],
        "meaning": "Frozen owner-confirmation subset, not final campaign counts",
    }
    owner_metadata = []
    for owner, file in OWNER_FILES.items():
        d = bundle.doc(file)
        meta = {k: v for k, v in d.items() if k not in {"comparisons", "cases", "pairs", "original_comparisons", "completed_assessment", "incomplete_pair_dispositions", "standalone_diagnostics", "speed_arm_assessments"}}
        owner_metadata.append({"owner": owner, "reference": bundle.ref(file), "original_author_metadata": meta,
                               "count_scope_warning": "Original author counters/schema preserved; stale counters and unlike partition units are never summed into campaign totals."})
    return {"schema": "ER10_MECHANICAL_NORMALIZATION_WORKING_V1", "status": "IN_PROGRESS", "report_kind": "WORKING",
            "owner_comparisons_observed_cutoff": bundle.cutoffs[0], "last_frozen_reference_capture_cutoff": max(bundle.cutoffs),
            "not_a_simultaneous_transactional_snapshot": True, "not_final_campaign_counts": True,
            "input_manifest_identities": bundle.manifest_refs, "field_map_identity": {"sha256": sha(canonical(fieldmap))},
            "logical_denominator": {"slots": 40, "arms": 80, "targeted": 24, "integrated": 12, "confirmation": 4},
            "slots": slots,
            "working_aggregate_counts": {"final_authorized_arm_axes": axes, "original_grade_labels_exact": dict(grade),
                                         "source_pass_labels": dict(positive), "review_delivery_labels": dict(review),
                                         "disjoint_logical_slot_delivery_categories": dict(Counter(s["working_delivery_category"] for s in slots)),
                                         "observed_pair_version_records": sum(len(s["attempts"]) for s in slots),
                                         "confirmation_frozen_subset": observed_confirmation},
            "original_owner_metadata": owner_metadata, "sdk_telemetry_supplement": telemetry_supplement(bundle),
            "unresolved_schema_mapping": unresolved,
            "scientific_and_economic_claim_limits": [
                "No Source re-evaluation, semantic grade adjudication, general winner or new scientific claim.",
                "Both FAIL is not equal quality. Defect counts are not a ranking. SourcePASS does not establish complete requirements, native lifecycle, provenance, time eligibility or a qualified twofold win.",
                "Scientific axes/full declared scope and required process/history remain separate; full axis words or inventory counts never establish full source coverage.",
                "All original failed versions, source grades, clocks and costs are retained as immutable original evidence fragments. Final authority is prospective, not favorable-score selection.",
                "Shared seed cold cost belongs fully to each cold arm, once in aggregate. Occupied stage sum is distinct from parallel critical path. No enclosing-stage double count or native cumulative proxy addition.",
                "Successor 30/40/50/60/common80/100/120 allowances never become original15/45 successes.",
                "Missing final, dropped scope, missing native proof and unassessed counterpart cannot establish a speed benefit.",
                "Actual SDK observations remain a separate historical supplement; billing/account remaining quota unknown; no pricing or affordability inference.",
                "Public evidence resolution must use exact original path AND SHA through resolve_public_evidence.py; no filename/latest-version fallback. Confirmation selected lock9ba remains separate from old unselected44bab history.",
            ]}


def validate_actual(report, fieldmap, bundle):
    tests = []
    def check(name, condition, evidence):
        tests.append({"name": name, "passed": bool(condition), "evidence": evidence})
    population = [{"slot_id": x["slot_id"], "track": x["track"], "logical_arms": list(x["final_authorized_attempt"]["arms"])} for x in report["slots"]]
    assert_slot_population(population)
    check("exact_40_ids_order_and_80_arms", [x["slot_id"] for x in report["slots"]] == [x["slot_id"] for x in bundle.doc(INDEX)["slots"]] and len(population) == 40, bundle.ref(INDEX))
    bad = copy.deepcopy(population); bad[1]["slot_id"] = bad[0]["slot_id"]
    try:
        assert_slot_population(bad); rejected = False
    except ValueError:
        rejected = True
    check("duplicate_actual_slot_injection_rejected", rejected, "duplicate of observed D-M01-A in observed population, not implementation-mirror fixtures")
    attempt = report["slots"][0]["attempts"][0]
    try:
        assert_unique_attempt_rows([attempt, copy.deepcopy(attempt)]); rejected = False
    except ValueError:
        rejected = True
    check("duplicate_actual_slot_version_injection_rejected", rejected, {"slot_id": attempt["slot_id"], "version": attempt["version"]})
    c01 = next(s for s in report["slots"] if s["slot_id"] == "C-01")["final_authorized_attempt"]
    control = c01["arms"]["control"]["fields"]
    check("actual_missing_C01_grade_stays_NULL", control["original_source_grade"]["value"] is None, control["original_source_grade"])
    check("actual_C01_missing_review_and_interrupted_task_separate", control["review_delivery_status"]["value"] == "MISSING" and control["review_t3_status_original"]["value"] == "interrupted", control["review_delivery_status"])
    c04_map = next(s for s in fieldmap["slots"] if s["slot_id"] == "C-04")["attempt_mappings"][0]
    real_grade_refs = c04_map["arms"]["control"]["original_source_grade"]
    shadow = copy.copy(bundle)
    shadow.docs = copy.deepcopy(bundle.docs)
    del shadow.docs["reviews/confirmation/C-04/COMPARISON.json"]["arms"]["control"]["original_scientific_grade"]
    removed = resolve_field(shadow, real_grade_refs, fieldmap["full_scope_labels"])
    check("actual_present_C04_grade_deleted_becomes_NULL_never_PASS", removed["value"] is None and all(not o["present"] for o in removed["observations"]), real_grade_refs)
    check("actual_unassessed_C01_original_zero_retained_normalized_NULL", control["material_defect_count"]["value"] is None and any(o["original_value"] == 0 for o in control["material_defect_count"]["observations"]), control["material_defect_count"])
    c02 = next(s for s in report["slots"] if s["slot_id"] == "C-02")["final_authorized_attempt"]
    check("actual_absent_C02_pair_scope_only_explicit_arm_AND", c02["both_full_declared_source_coverage"]["value"] is False and c02["both_full_declared_source_coverage"].get("arm_values") == [True, False], c02["both_full_declared_source_coverage"])
    c03 = next(s for s in report["slots"] if s["slot_id"] == "C-03")["final_authorized_attempt"]
    original_c03 = bundle.doc("reviews/confirmation/C-03/COMPARISON.json")
    check("original_C03_BLOCKED_and_diagnostic_hold_not_regraded", "blocked" in json.dumps(original_c03["arms"]["treatment"]["stages"]).lower() and grade_label(c03["arms"]["treatment"]["fields"]["original_source_grade"]["value"]) == "FAIL", bundle.ref("reviews/confirmation/C-03/COMPARISON.json"))
    check("actual_C03_nativeBLOCKED_separate_from_full_scientific_scope", c03["arms"]["treatment"]["fields"]["native_complete_observed"]["value"] is False and c03["arms"]["treatment"]["fields"]["full_declared_scientific_scope_assessed"]["value"] is True, bundle.ref("reviews/confirmation/C-03/COMPARISON.json"))
    method05 = next(s for s in report["slots"] if s["slot_id"] == "I-METHOD-05")["final_authorized_attempt"]["arms"]["control"]["fields"]
    method05_coverage = bundle.doc("reviews/integrated-methods/I-METHOD-05/control/review-v1/coverage.json")
    check("actual_full_six_scientific_axes_do_not_close_required_history", method05["scientific_six_axis_assessment_complete"]["value"] is True and method05["full_declared_scientific_scope_assessed"]["value"] is True and method05["required_process_history_verified"]["value"] is None and method05_coverage["counts"]["material_required_history_gap"] == 1, bundle.ref("reviews/integrated-methods/I-METHOD-05/control/review-v1/coverage.json"))
    for sid in ["D-M06-A", "D-M06-B", "D-M07-A", "D-M07-B", "D-M09-A"]:
        s = next(s for s in report["slots"] if s["slot_id"] == sid)
        check("original_vs_declared_successor_" + sid, s["final_authorized_version"] == "v3" and s["campaign_terminal"] is None and s["working_delivery_category"] == "explicitly_unstarted_or_held_authorized_successor", {"category": s["working_delivery_category"], "versions": [a["version"] for a in s["attempts"]]})
    c1 = bundle.doc(OWNER_FILES["targeted_cohort1"])
    check("cohort1_7_pair_rows_do_not_make_7_slots", len(c1["comparisons"]) == 7 and len([s for s in report["slots"] if s["owner"] == "targeted_cohort1"]) == 6, bundle.ref(OWNER_FILES["targeted_cohort1"]))
    counts = report["working_aggregate_counts"]
    check("separate_axes_denominators_equal80", all(sum(x[k] for k in ["true", "false", "unknown"]) == 80 for x in counts["final_authorized_arm_axes"].values()), counts["final_authorized_arm_axes"])
    check("logical_delivery_partition_sums40", sum(counts["disjoint_logical_slot_delivery_categories"].values()) == 40, counts["disjoint_logical_slot_delivery_categories"])
    expected = {"frozen_original_comparisons": 4, "delivered_pair_assessments": 3, "both_full_declared_source_coverage": 1, "qualified_wins": 0, "quiet_task_count": 28}
    check("actual_confirmation_4_3_1_0_and28quiet", all(counts["confirmation_frozen_subset"][k] == v for k, v in expected.items()), counts["confirmation_frozen_subset"])
    check("deterministic_recompute_same_bytes", canonical(report) == canonical(normalized_report(bundle, fieldmap)), "same immutable manifests and field map, byte-for-byte report identity")
    corrupted_map = copy.deepcopy(fieldmap)
    original_ref = corrupted_map["slots"][0]["index_reference"]
    original_ref["sha256"] = "0" * 64
    try:
        assert_fieldmap_identity(bundle, corrupted_map); rejected = False
    except ValueError:
        rejected = True
    check("actual_mapping_hash_corruption_rejected", rejected, "corrupted reference to the actual frozen 40-slot population; old maps cannot silently cite later changed snapshot bytes")
    check("all_evidence_references_have_path_and_sha256", all(f["reference"].get("original_path") and re.fullmatch(r"[0-9a-f]{64}", f["reference"].get("sha256", "")) for s in report["slots"] for a in s["attempts"] for f in a["evidence_fragments"]), "every original evidence fragment")
    return {"schema": "ER10_MECHANICAL_VALIDATION_WORKING_V1", "status": "PASSED" if all(t["passed"] for t in tests) else "FAILED", "tests": tests,
            "passed": sum(t["passed"] for t in tests), "total": len(tests), "unresolved_is_unknown_not_test_failure": True,
            "unresolved_mapping_count": len(report["unresolved_schema_mapping"]), "report_sha256": sha(canonical(report)), "field_map_sha256": sha(canonical(fieldmap))}


def assert_fieldmap_identity(bundle, fieldmap):
    def visit(value):
        if isinstance(value, dict):
            if "file" in value and "pointer" in value and "sha256" in value:
                file = value["file"]
                if not bundle.has(file) or bundle.entries[file]["sha256"] != value["sha256"]:
                    raise ValueError("stale/changed field-map evidence identity; rebuild against the explicit later snapshots: " + file)
                if value.get("original_path") != bundle.entries[file]["original_path"]:
                    raise ValueError("field-map original path identity mismatch: " + file)
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)
    visit(fieldmap)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--manifest", action="append", type=Path, help="explicit immutable input manifest; repeat in observed order")
    p.add_argument("--field-map", type=Path, help="reuse an explicit field map; regenerate when later snapshots change schema")
    p.add_argument("--out", type=Path, default=HERE, help="output directory inside this authorized helper directory")
    args = p.parse_args()
    out = args.out.resolve()
    if out != HERE and HERE not in out.parents:
        p.error("output must remain within the authorized normalizer-v1 directory")
    manifests = args.manifest or [HERE / n for n in ["working-input-manifest.json", "working-supplement-manifest.json", "working-mechanical-manifest.json", "working-arm-map-manifest.json", "working-label-join-manifest.json"]]
    bundle = Bundle(manifests)
    fieldmap = json.loads(args.field_map.read_bytes()) if args.field_map else Builder(bundle).build()
    if fieldmap["population_sha256"] != INDEX_HASH or fieldmap["version_authority_sha256"] != ADMISSIONS_HASH:
        raise ValueError("field map population/authority identity mismatch")
    assert_fieldmap_identity(bundle, fieldmap)
    report = normalized_report(bundle, fieldmap)
    validation = validate_actual(report, fieldmap, bundle)
    out.mkdir(parents=True, exist_ok=True)
    outputs = {"field-map.json": fieldmap, "WORKING-normalized.json": report, "validation.json": validation,
               "unresolved-schema-mapping.json": report["unresolved_schema_mapping"]}
    for filename, doc in outputs.items():
        (out / filename).write_bytes(canonical(doc))
    print(json.dumps({"status": report["status"], "validation": validation["status"], "slots": 40, "arms": 80,
                      "observed_pair_version_records": report["working_aggregate_counts"]["observed_pair_version_records"],
                      "unresolved_mappings": validation["unresolved_mapping_count"],
                      "output_sha256": {name: sha(canonical(doc)) for name, doc in outputs.items()}}, indent=2))
    return 0 if validation["status"] == "PASSED" else 1


if __name__ == "__main__":
    raise SystemExit(main())
