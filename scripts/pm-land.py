#!/usr/bin/env python3
"""One landing command: the rule's steps in the rule's order, a resume after a failure, and a lock queue.

Opt-in. Nothing here changes the landing rule in `.claude/CLAUDE.md` ("How to land on main") or
`reports/landing-checks/README.md`; anyone may still land by hand, and the two exclude each other
because `held/` (mkdir) stays THE lock. `reports/landing-checks/README.md` documents the use.

  plan <branch>                 print every step and its exact commands; changes nothing
  run <branch>                  land it: lock, fetch, rebase, shard check in the branch's worktree,
                                fast-forward in the shared checkout, shard check there, landing check,
                                push main, then (when Plans/ changed and no batch stays open) the snapshot
                                and baseline follow-up as its own landing, worktree removal, lock release
  run <branch> --batch-open | --batch-start <sha> | --batch-close     "Land in batches" as written
  run --batch-close             close the batch this agent holds: its one follow-up, then the release
  run <branch> --checks-local   checks in a full local worktree at the exact commit; the shared checkout
                                only fast-forwards and pushes. A departure from today's rule: flag only
  resume                        re-verify what moved (lock holder, origin/main, the branch), then continue
  status                        readable by anyone: lock, queue, landings, current step, logs
  abort                         release what it holds; main is never left ahead of origin
  lock status|queue|take|release   the lock queue, for hand landers too, without changing the rule

What it never does: --no-verify, --force, `reset --hard` in the shared checkout, `git gc`, a hand merge of
Plans/_shards or Plans/.plan_index, an automatic conflict resolution, or a snapshot or baseline refresh
before the landing it follows is pushed, in the middle of a batch, or to make a landing pass.

The landing check's exit codes mean what the rule says: 2 and 3 stop the landing, 0 and 1 continue, and an
exit 1's report is kept for Jared. An exit 1 with a timed-out subcheck stops here, because the rule says to
rerun that subcheck on its own and judge it before pushing: `resume --timeouts-judged "<what you found>"`. So
does one that says to compare changed pre-existing rows with the baseline's: `resume --rows-compared "<what you
found>"`. A judgement covers the check on record when it was given and no other. A check that crashed (a
traceback, or a report with no Infrastructure line) said nothing, so no judgement excuses it: `resume` reruns it.

Exit codes of this command: 0 finished, 1 stopped (it says why and what next), 2 refused (bad arguments or
state), 4 the wait for the lock timed out (nothing changed).

State: <lock dir>/state/<landing id>.json. Tickets and the clearing log: <lock dir>/queue/. Logs and kept
reports: <evidence dir>/<landing id>/. Every default can be overridden by a flag or a PM_LAND_* variable,
which is how the self-tests run against throwaway repositories (scripts/test_pm_land.py).
"""
from __future__ import annotations

import argparse
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
import traceback
from typing import Any, Callable, Dict, List, Optional, Sequence
import uuid

STATE_SCHEMA = "pm.land.state.v1"
TOOL_TAG = "pm-land/1"

DEFAULT_SHARED = "/mnt/Cursor/PuppetMaster"
DEFAULT_LOCK_DIR = "/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock"
DEFAULT_EVIDENCE_DIR = "/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-reports"
DEFAULT_WORKTREE_ROOT = "~/pm-worktrees"
DEFAULT_LOCAL_REPO = "~/src/PuppetMaster"
DEFAULT_SYMLINK_TARGET = "/mnt/Cursor/PuppetMaster-Evidence/tests/agent_packet_restrictions"
DEFAULT_MIN_FREE_GB = 50

HEARTBEAT_SECONDS = 60
DEAD_HEARTBEAT_SECONDS = 10 * 60
HAND_RULE_SECONDS = 90 * 60
BATCH_MAX_LANDINGS = 4
BATCH_MAX_SECONDS = 2 * 60 * 60
MAX_HOLD_SECONDS = 3 * 60 * 60  # the heartbeat stops after this, so a hung run reads as dead by the rules below
# pm-landing-check.py: rule 2 applies only while the baseline is at most seven days older than the base.
BASELINE_LIMIT_SECONDS = 7 * 24 * 60 * 60
BASELINE_MARGIN_SECONDS = 2 * 60 * 60  # a batch's base stays behind origin/main for up to its two hours

EXIT_OK = 0
EXIT_STOPPED = 1
EXIT_REFUSED = 2
EXIT_LOCK_TIMEOUT = 4

SHARD_CHECK = ["python3", "scripts/pm-shard-plans.py", "--check", "--config", "Plans/sharding_config.json"]
LANDING_CHECK = ["python3", "scripts/pm-landing-check.py"]
SNAPSHOT = ["python3", "scripts/pm-plan-migration.py", "snapshot-current"]
BASELINE_FILE = "reports/landing-checks/baseline.json"
RUN_POINTER = "Plans/.plan_migration/current_run.json"
SYMLINK_INPUT = "tests/agent_packet_restrictions"
# reports/landing-checks/README.md, "What a full checkout has to contain".
AUDIT_INPUTS = (
    "Plans/.audits/audit-20260827-001-pmconcept7-usage-recovery/FINAL_REPORT.md",
    "Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/FINAL_REPORT.md",
    "Plans/.audits/audit-20260828-002-settings-tome-tabs-preport",
    "Plans/.audits/audit-20260828-003-chat-56-fast-lane",
    "Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/FINAL_REPORT.md",
    "Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json",
    "Plans/.audits/audit-20260830-001-pmconcept7-live-resize-preview",
    "Plans/.audits/event-authority-2026-08-12/NEXT_STEPS_20260910.md",
    "Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_SHEET_ANSWERS_20260910.json",
    "Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_SHEET_PLAIN_20260909.md",
)
# What may reach the landing check through --check-arg. Anything else could change what it judges: --base, --baseline,
# --record-baseline and --allow-sparse are the rule's to set. "--flag" alone; "--flag=VALUE" or "--flag" "VALUE".
CHECK_ARG_SWITCHES = ("--cache", "--no-cache")
CHECK_ARG_VALUES = {"--cache-dir": False, "--cache-max-mb": True, "--subcheck-timeout-seconds": True}  # True: a number
# Not yet measured: reports/landing-checks/README.md, "Checks in a local copy".
CHECKS_LOCAL_NOTE = ("--checks-local: this copy's equivalence to the shared-checkout run is not yet measured, so nothing "
                     "proves it gives the same verdict. It departs from today's rule and stays behind this flag.")
# A landing that needs a reseal is never part of a batch ("Land in batches").
RESEAL_PATHS = ("Plans/Spec_Lock.json", "Plans/auto_decisions.jsonl")
RESEAL_PREFIXES = ("Plans/.evidence/",)
DERIVED_PREFIXES = ("Plans/_shards/", "Plans/.plan_index/")

# PROGRAM.md (Jared, 2026-11-04): stream F gets first call on the landing lock. Lower number goes first.
# <lock dir>/queue/priorities.json, same shape, replaces this when present.
DEFAULT_PRIORITIES: Dict[str, Any] = {
    "default": 50,
    "rules": [{"match": r"^(pm-fo-|fo-|land/fo-)", "priority": 10, "why": "stream F first (PROGRAM.md)"}],
}


# ---------------------------------------------------------------------------------------------------------
# What the landing check's text report says. The format is main() in scripts/pm-landing-check.py; a self-test
# holds these patterns to that script's own source and to its describe().
# ---------------------------------------------------------------------------------------------------------

REPORT_INFRASTRUCTURE = re.compile(r"^Infrastructure results, not failures of this tree [^:]*: (\d+)", re.M)
# At the start of a line: a failure row quotes a validator's traceback inside its one-line fields, under "  [".
REPORT_TRACEBACK = re.compile(r"^(?:  \+ Exception Group )?Traceback \(most recent call last\)", re.M)
REPORT_COMPARE = re.compile(r"^Nothing reported stops the landing:.*?(\d+) of them with changed content on files this "
                            r"branch touched, so compare those with the baseline's rows", re.M)
REPORT_PRE_HEAD = re.compile(r"^Pre-existing, in a baseline bucket whose count has not risen \(never blocks\): (\d+)")
REPORT_PRE_ROW = re.compile(r"^  \[(pre-existing|improved)\s*\] (.+?)  (\d+) -> (\d+)(?:  (.*))?$")
REPORT_ROW_WHERE = re.compile(r"^(.*?)  ?\((names .*|content changed)\)$")
REPORT_COUNTER = re.compile(r"^  \[staleness\] (\S+)  (\d+) -> (\d+) \(the readiness growth counter", re.M)
REPORT_GONE = re.compile(r"^Gone since the baseline \(nothing to do\): (\d+)", re.M)
# Printed by pm-landing-check.py from fix/landing-check-report-ids on; an older one has none of these.
REPORT_GONE_ROW = re.compile(r"^  \[gone\] (.+)$", re.M)
REPORT_TOTALS = re.compile(r"^Subcheck totals this run: (\d+)$", re.M)
REPORT_TOTAL_ROW = re.compile(r"^  \[total\] (\S+)  (\d+|timed out)$", re.M)
REPORT_COUNTS = re.compile(r"^Bucket counts this run: (\d+)$", re.M)
REPORT_COUNT_ROW = re.compile(r"^  \[count\] (.+)  (\d+)$", re.M)


def read_report(text: str) -> Dict[str, Any]:
    """The parts of a landing check's report the tool acts on. `pre_unread`: rows it could not read, or past the print cap."""
    infrastructure = REPORT_INFRASTRUCTURE.search(text)
    compare = REPORT_COMPARE.search(text)
    gone = REPORT_GONE.search(text)
    pre: Dict[str, Dict[str, Any]] = {}
    declared = None
    read = 0
    unread = False
    for line in text.splitlines():
        if declared is None:
            head = REPORT_PRE_HEAD.match(line)
            if head:
                declared = int(head.group(1))
            continue
        if line.startswith("Checks whose failure count rose:"):
            break
        row = REPORT_PRE_ROW.match(line)
        if row:
            tag, bucket, baseline, count, rest = row.groups()
            where = REPORT_ROW_WHERE.match(rest or "")
            entry = pre.setdefault(bucket, {"baseline": int(baseline), "count": int(count), "improved": tag == "improved",
                                            "content_rows": [], "rows": []})
            printed = where.group(1) if where else (rest or "")
            entry["rows"].append(printed)
            if where and where.group(2) == "content changed":
                entry["content_rows"].append(printed)
            read += 1
    if declared is not None and read != declared:
        unread = True
    # None for an older pm-landing-check, which prints no such lines. A count that disagrees with its rows is unreadable.
    totals_head, counts_head = REPORT_TOTALS.search(text), REPORT_COUNTS.search(text)
    gone_ids = REPORT_GONE_ROW.findall(text) if totals_head else None
    totals = {name: None if value == "timed out" else int(value) for name, value in REPORT_TOTAL_ROW.findall(text)} if totals_head else None
    counts = {name: int(value) for name, value in REPORT_COUNT_ROW.findall(text)} if counts_head else None
    ids_unread = bool(totals_head) and (
        gone is None or len(gone_ids) != int(gone.group(1)) or len(totals) != int(totals_head.group(1))
        or (bool(counts_head) and len(counts) != int(counts_head.group(1))))
    return {
        "infrastructure": int(infrastructure.group(1)) if infrastructure else None,
        "crashed": bool(REPORT_TRACEBACK.search(text)),
        "compare": int(compare.group(1)) if compare else 0,
        "pre": pre,
        "pre_unread": unread,
        "counter": {name: int(reported) for name, _was, reported in REPORT_COUNTER.findall(text)},
        "gone": int(gone.group(1)) if gone else None,
        "gone_ids": gone_ids,
        "totals": totals,
        "bucket_counts": counts,
        "ids_unread": ids_unread,
    }


ROW_REPORT_SCHEMA = "pm.landing_check.rows.v1"
REPORT_DIGEST = ("pre", "pre_unread", "compare", "counter", "gone", "gone_ids", "totals", "bucket_counts", "ids_unread")


def writes_row_report(cwd: Any) -> bool:
    """Whether the landing check in this tree takes --row-report: an older one would refuse it, and read as blocked."""
    try:
        return "--row-report" in (Path(cwd) / LANDING_CHECK[1]).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return False


def shows_what_changed(report: Dict[str, Any], earlier: Sequence[Optional[Dict[str, Any]]]) -> bool:
    """Whether this report and every earlier one on record print the lines that say what moved between them."""
    return report.get("totals") is not None and all(row is None or row.get("totals") is not None for row in earlier)


def read_row_report(path: Any) -> Optional[Dict[str, Any]]:
    """What pm-landing-check.py --row-report wrote, or None."""
    try:
        doc = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return None
    return doc if isinstance(doc, dict) and doc.get("schema_id") == ROW_REPORT_SCHEMA else None


def subcheck_of(bucket: str) -> str:
    """`check/subcheck` of a bucket id, `check|subcheck|error|path`."""
    check, _, rest = bucket.partition("|")
    return f"{check}/{rest.partition('|')[0] or '-'}"


def why_not_exempt(subcheck: str, now: Optional[Dict[str, Any]], previous: Optional[Dict[str, Any]],
                   own: Sequence[str]) -> Optional[str]:
    """None when what this subcheck added since the previous report is only this member's own staleness. Then alone,
    after the previous member's follow-up, each added row would be staleness on this member's files, which stops nothing.

    Every added row must be seen (the subcheck is complete in both reports, its rows adding up to its total), be
    staleness of a kind the landing check also excuses when its bucket grows, and name this member's files and no other
    file of the batch. A row stale by its detail text alone is not enough: alone, a rise in its bucket stops the landing.
    The caller gives this member's own range, so a row on another member's file is told apart. Otherwise, says why.
    """
    if now is None or previous is None:
        return "the landing check wrote no row report for one of the two runs, so what was added cannot be seen"
    rows = {}
    for side, doc in (("this", now), ("the previous", previous)):
        entry = (doc.get("subchecks") or {}).get(subcheck)
        if not isinstance(entry, dict) or not entry.get("complete") or len(entry.get("rows") or []) != entry.get("reported"):
            return (f"{subcheck} is not complete in {side} report (no row report for it, a sample, or no complete export), "
                    "so what was added cannot be seen")
        rows[side] = entry["rows"]
    added = Counter(row["key"] for row in rows["this"]) - Counter(row["key"] for row in rows["the previous"])
    if not added:
        return f"{subcheck} rose, but no added row can be found in it"
    mine = set(own)
    for row in rows["this"]:
        if not added.get(row["key"]):
            continue
        if not row.get("stale"):
            return f"an added row is not staleness: {row['key']}"
        if not row.get("grown_stale"):
            return f"an added row is staleness only by its detail text, which the check does not excuse when its bucket grows: {row['key']}"
        names = row.get("names") or []
        if not names:
            return f"an added staleness row names no file of this batch, so it cannot be attributed: {row['key']}"
        others = sorted(set(names) - mine)
        if others:
            return f"an added staleness row names another member's file ({others[0]}): {row['key']}"
    return None


def row_count_rises(now: Optional[Dict[str, Any]], previous: Optional[Dict[str, Any]]) -> List[tuple]:
    """Buckets that rose in a subcheck complete in both row reports. A subcheck the baseline holds as a sample prints no
    `[count]` line even when it now prints every row, so these can show what those lines do not."""
    rises: List[tuple] = []
    for name, entry in sorted(((now or {}).get("subchecks") or {}).items()):
        before = ((previous or {}).get("subchecks") or {}).get(name)
        if not (isinstance(entry, dict) and entry.get("complete") and isinstance(before, dict) and before.get("complete")):
            continue
        was = Counter(row["key"].rpartition("|")[0] for row in before.get("rows") or [])
        for bucket, count in sorted(Counter(row["key"].rpartition("|")[0] for row in entry.get("rows") or []).items()):
            if count > was[bucket]:
                rises.append((name, "batch_total_rise", f"bucket {bucket} rose from {was[bucket]} to {count} since the last "
                                                         "report, which no total shows"))
    return rises


def batch_gap(report: Dict[str, Any], earlier: Sequence[Optional[Dict[str, Any]]],
              exempt: Optional[Callable[[str], Optional[str]]] = None, row_rises: Sequence[tuple] = ()) -> Optional[tuple]:
    """Why this member's report, fine inside the batch, may not hold alone after the earlier members' follow-up.

    Every check in a batch is judged against the baseline from before the batch, so a bucket an earlier member lowered
    and this one raises again still reads as pre-existing, and a readiness rise is excused by the earlier member's
    stale row. An earlier member's fix may print no row at all: a bucket it emptied is only a number in `Gone since the
    baseline`, and one it lowered with no row naming a batch file prints nothing. `earlier` is each earlier member's
    report digest in order, None where there is none (a hand lander). Returns (stop code, why). What a report did not
    print cannot be seen: README, "Batches". A pm-landing-check that prints gone ids, totals and bucket counts prints it
    all: a bucket no longer gone, or a total or count above the previous report's, could not rise alone unseen. Without
    those lines (older reports carry None) only the checks before them apply, and the caller says so. `exempt` says why a
    subcheck's rise is not only this member's own staleness, or None when it is.
    """
    if not earlier:
        return None
    absent = any(row is None for row in earlier)
    known = [row for row in earlier if row is not None]
    mine = report["pre"]
    comparing = bool(known) and not absent and shows_what_changed(report, earlier)
    if known and not comparing:
        if report.get("gone") is None or any(row.get("gone") is None for row in known):
            return ("batch_rows_overlap", "a report here has no `Gone since the baseline` line, so whether a bucket an "
                                          "earlier member emptied has come back cannot be told")
        highest = max(row["gone"] for row in known)
        if report["gone"] < highest:
            return ("batch_rows_overlap", f"`Gone since the baseline` fell from {highest} to {report['gone']}: a bucket an "
                                          "earlier member of this batch emptied has come back, which no printed row shows")
    if absent or report["pre_unread"] or any(row.get("pre_unread") for row in known):
        if mine or report["pre_unread"] or report["compare"]:
            return ("batch_rows_overlap", "this report lists pre-existing rows, and an earlier member's report is missing "
                                          "or printed only part of its rows, so what they share cannot be told")
    else:
        shared = []
        unlisted = []
        for bucket, entry in sorted(mine.items()):
            views = [row for row in known if bucket in row["pre"]]
            listed = {text for row in views for text in row["pre"][bucket]["rows"]}
            if any(text not in listed for text in entry["content_rows"]):
                unlisted.append(bucket)
                continue
            if not any(row["pre"][bucket]["improved"] or row["pre"][bucket]["content_rows"] or row.get("compare")
                       for row in views):
                continue
            # Every member's report lists what the earlier ones touched too, so compare with the latest view.
            latest = views[-1]["pre"][bucket]
            if entry["count"] != latest["count"] or set(entry["rows"]) - set(latest["rows"]):
                shared.append(f"{bucket} ({latest['count']} -> {entry['count']})")
        if shared:
            return ("batch_rows_overlap", "pre-existing rows changed in a bucket an earlier member of this batch also "
                                          "changed, so the baseline's count no longer tells: " + "; ".join(shared[:10]))
        if unlisted:
            return ("batch_rows_overlap", "a `(content changed)` row no earlier report listed: an earlier member may have "
                                          "lowered its bucket without printing it, so the baseline's count no longer "
                                          "tells: " + "; ".join(unlisted[:10]))
    for name, reported in sorted(report["counter"].items()) if not comparing else ():
        if absent:
            return ("batch_readiness_rise", f"{name}'s rise is judged as staleness, and an earlier member's report is "
                                            "missing, so what this landing added cannot be told")
        seen = max((row.get("counter", {}).get(name, -1) for row in known), default=-1)
        if reported > seen:
            # A total no higher than an earlier member's is no rise alone either; a higher one may be excused by its rows.
            return ("batch_readiness_rise", f"{name} rose to {reported} ({'no rise' if seen < 0 else seen} in the earlier "
                                            "reports) and is judged as staleness, which an earlier member's stale row can "
                                            "explain; alone it must be explained by this landing's own")
    return moved_since_earlier(report, earlier, exempt, row_rises)


def moved_since_earlier(report: Dict[str, Any], earlier: Sequence[Optional[Dict[str, Any]]],
                        exempt: Optional[Callable[[str], Optional[str]]] = None, row_rises: Sequence[tuple] = ()) -> Optional[tuple]:
    """What the printed ids, totals and counts say rose since the previous report, unless it is only this member's own
    staleness. Each report is compared with the one before it, so one rise excused here is not held against the next."""
    if report.get("totals") is None:
        return None
    if report.get("ids_unread") or any(row is not None and row.get("ids_unread") for row in earlier):
        return ("batch_rows_overlap", "a report's gone ids, subcheck totals or bucket counts do not add up, so what moved "
                                      "between the reports cannot be told")
    if any(row is None for row in earlier):
        return ("batch_rows_overlap", "an earlier member's report is not on record, so what moved since it cannot be told")
    comparable = [row for row in earlier if row.get("totals") is not None]
    if not comparable:
        return None
    rises = []
    for bucket in sorted(set(comparable[-1].get("gone_ids") or []) - set(report.get("gone_ids") or [])):
        rises.append((subcheck_of(bucket), "batch_rows_overlap",
                      f"a bucket the previous member's report listed as gone is back, whatever else went: {bucket}"))
    for name, total in sorted(report["totals"].items()):
        was = next((row["totals"][name] for row in reversed(comparable) if row["totals"].get(name) is not None), 0)
        if total is not None and total > was:
            rises.append((name, "batch_total_rise", f"{name}'s total rose from {was} to {total} since the last report, which "
                                                    "the baseline from before the batch cannot show"))
    latest = comparable[-1].get("bucket_counts")
    for name, count in sorted((report.get("bucket_counts") or {}).items()):
        if latest is not None and count > latest.get(name, 0):
            rises.append((subcheck_of(name), "batch_total_rise",
                          f"bucket {name} rose from {latest.get(name, 0)} to {count} since the last report, which no total shows"))
    said: Dict[str, Optional[str]] = {}
    for subcheck, code, what in rises + list(row_rises):
        if subcheck not in said:
            said[subcheck] = exempt(subcheck) if exempt else "the landing check wrote no row report, so what was added cannot be seen"
        if said[subcheck]:
            return (code, f"{what}; alone it would be a rise, and it is not this landing's own staleness: {said[subcheck]}")
    return None


class Stop(Exception):
    """The landing stops here. `next_step` tells the lander what to do; main is put back by the handler."""

    def __init__(self, code: str, message: str, next_step: str = "", keep_lock: bool = False,
                 files: Optional[List[str]] = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.next_step = next_step
        self.keep_lock = keep_lock
        self.files = files or []


class Interrupted(BaseException):
    """A signal reached this process. Not an Exception, so no handler swallows it by accident."""


class Refused(Exception):
    """Bad arguments or state before anything changed."""


class LockWaitTimeout(Exception):
    pass


class BatchOwesClose(Exception):
    """The lock's dead holder has a batch that landed something; clearing it would lose the batch's follow-up."""

    def __init__(self, start: str, reason: str):
        super().__init__(reason)
        self.start = start
        self.reason = reason


def now_utc() -> datetime:
    return datetime.now(timezone.utc).replace(microsecond=0)


def iso(moment: Optional[datetime] = None) -> str:
    return (moment or now_utc()).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(text: Any) -> Optional[datetime]:
    if not isinstance(text, str):
        return None
    try:
        return datetime.strptime(text.strip(), "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def age_seconds(text: Any) -> Optional[float]:
    moment = parse_iso(text)
    return None if moment is None else (now_utc() - moment).total_seconds()


def hostname() -> str:
    return os.environ.get("PM_LAND_HOST") or socket.gethostname()


def parse_ps(output: str) -> Optional[str]:
    """`ps -o stat= -o lstart=`: the start time, or None for no process. A zombie has already ended."""
    parts = output.split()
    if not parts or parts[0].startswith("Z"):
        return None
    return " ".join(parts[1:]) or None


def pid_start(pid: int) -> Optional[str]:
    """A process's start time, the second half of its identity: pids get reused."""
    try:
        result = subprocess.run(["ps", "-o", "stat=", "-o", "lstart=", "-p", str(int(pid))], capture_output=True,
                                text=True, env=dict(os.environ, LC_ALL="C", TZ="UTC"))
    except (OSError, ValueError):
        return None
    return parse_ps(result.stdout)


def same_process(pid: Any, start: Any) -> bool:
    try:
        return bool(start) and pid_start(int(pid)) == start
    except (TypeError, ValueError):
        return False


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json_atomic(path: Path, doc: Any) -> None:
    tmp = path.with_name(f".{path.name}.{uuid.uuid4().hex[:8]}.tmp")
    tmp.write_text(json.dumps(doc, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def say(message: str) -> None:
    print(f"[{iso()}] {message}", flush=True)


@dataclass
class Config:
    shared: Path
    lock_dir: Path
    evidence_dir: Path
    worktree_root: Path
    local_repo: Path
    symlink_target: Path
    ssh: List[str]
    min_free_gb: int
    heartbeat_seconds: float
    poll_seconds: float
    max_hold_seconds: float = MAX_HOLD_SECONDS

    @property
    def held(self) -> Path:
        return self.lock_dir / "held"

    @property
    def holder_file(self) -> Path:
        return self.held / "holder.txt"

    @property
    def queue_dir(self) -> Path:
        return self.lock_dir / "queue"

    @property
    def state_dir(self) -> Path:
        return self.lock_dir / "state"

    @property
    def log_file(self) -> Path:
        return self.queue_dir / "log.jsonl"

    def base_repo(self) -> Path:
        """The repository full worktrees come from: the local clone when there is one, else the shared one."""
        return self.local_repo if (self.local_repo / ".git").exists() else self.shared


def config_from(args: argparse.Namespace) -> Config:
    def value(flag: Optional[str], env: str, default: str) -> Path:
        return Path(os.path.abspath(os.path.expanduser(flag or os.environ.get(env) or default)))

    return Config(
        shared=value(getattr(args, "shared", None), "PM_LAND_SHARED", DEFAULT_SHARED),
        lock_dir=value(getattr(args, "lock_dir", None), "PM_LAND_LOCK_DIR", DEFAULT_LOCK_DIR),
        evidence_dir=value(getattr(args, "evidence_dir", None), "PM_LAND_EVIDENCE_DIR", DEFAULT_EVIDENCE_DIR),
        worktree_root=value(getattr(args, "worktree_root", None), "PM_LAND_WORKTREE_ROOT", DEFAULT_WORKTREE_ROOT),
        local_repo=value(getattr(args, "local_repo", None), "PM_LAND_LOCAL_REPO", DEFAULT_LOCAL_REPO),
        symlink_target=value(None, "PM_LAND_SYMLINK_TARGET", DEFAULT_SYMLINK_TARGET),
        ssh=shlex.split(os.environ.get("PM_LAND_SSH") or "ssh"),
        min_free_gb=int(os.environ.get("PM_LAND_MIN_FREE_GB") or DEFAULT_MIN_FREE_GB),
        heartbeat_seconds=float(os.environ.get("PM_LAND_HEARTBEAT_SECONDS") or HEARTBEAT_SECONDS),
        poll_seconds=float(getattr(args, "poll_seconds", None) or os.environ.get("PM_LAND_POLL_SECONDS") or 60),
        max_hold_seconds=float(os.environ.get("PM_LAND_MAX_HOLD_SECONDS") or MAX_HOLD_SECONDS),
    )


# ---------------------------------------------------------------------------------------------------------
# The lock: held/ (mkdir) is THE lock. A queue of tickets orders the agents that use this tool.
# ---------------------------------------------------------------------------------------------------------

HOLDER_ORDER = ("agent", "branch", "time", "tool", "token", "landing", "state", "host", "pid", "pid-start", "started",
                "heartbeat", "batch-start", "batch-first-push")


def render_holder(holder: Dict[str, Any]) -> str:
    lines = [f"{key}: {holder[key]}" for key in HOLDER_ORDER if holder.get(key) not in (None, "")]
    lines += [f"batch-landing: {row}" for row in holder.get("batch-landing") or []]
    return "\n".join(lines) + "\n"


def parse_holder(text: str) -> Dict[str, Any]:
    fields: Dict[str, Any] = {"batch-landing": []}
    for line in text.splitlines():
        match = re.match(r"^\s*([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*?)\s*$", line)
        if not match:
            continue
        key, val = match.group(1).lower(), match.group(2)
        if key == "batch-landing":
            fields["batch-landing"].append(val)
        else:
            fields.setdefault(key, val)
    return fields


def write_holder(cfg: Config, holder: Dict[str, Any]) -> None:
    tmp = cfg.held / f".holder.{uuid.uuid4().hex[:8]}.tmp"
    tmp.write_text(render_holder(holder), encoding="utf-8")
    os.replace(tmp, cfg.holder_file)


def read_holder_text(cfg: Config) -> Optional[str]:
    try:
        return cfg.holder_file.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None


def holder_rule_age(cfg: Config, text: Optional[str]) -> float:
    """Seconds since the holder last said anything, the 90-minute rule's clock.

    The rule counts from the latest time in holder.txt (a batch rewrites it), so this takes the latest of
    every timestamp written there and the file's and folder's own times: never earlier than the rule says.
    """
    latest = 0.0
    now = time.time()
    for path in (cfg.holder_file, cfg.held):
        try:
            latest = max(latest, path.stat().st_mtime)
        except OSError:
            pass
    for found in re.findall(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", text or ""):
        moment = parse_iso(found)
        if moment is not None and moment.timestamp() <= now + 300:
            latest = max(latest, moment.timestamp())
    return now - latest


def probe_remote(cfg: Config, host: str, pid: str, start: str) -> str:
    """Ask the holder's machine: 'gone', 'different', 'alive' or 'unreachable'. Unreachable proves nothing."""
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", host or "") or not re.fullmatch(r"[0-9]{1,10}", pid or ""):
        return "unreachable"
    command = cfg.ssh + ["-o", "BatchMode=yes", "-o", "ConnectTimeout=5", host,
                         f"LC_ALL=C TZ=UTC ps -o stat= -o lstart= -p {pid}"]
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.TimeoutExpired):
        return "unreachable"
    seen = parse_ps(result.stdout)
    if result.returncode == 0 and seen:
        return "alive" if seen == start else "different"
    if result.returncode in (0, 1) and not seen:
        return "gone"
    return "unreachable"


def judge_holder(cfg: Config) -> Dict[str, Any]:
    """Is held/ taken, and is its holder proven dead? Only a proof, or the 90-minute rule, clears it."""
    if not cfg.held.is_dir():
        return {"held": False, "dead": False, "reason": "the lock is free"}
    text = read_holder_text(cfg)
    fields = parse_holder(text or "")
    age = holder_rule_age(cfg, text)
    verdict: Dict[str, Any] = {"held": True, "dead": False, "fields": fields, "text": text, "age_seconds": int(age)}
    expired = age > HAND_RULE_SECONDS
    rule_90 = f"the 90-minute rule: nothing written for {int(age // 60)} min"
    heartbeat_age = age_seconds(fields.get("heartbeat"))
    if fields.get("tool") != TOOL_TAG or heartbeat_age is None:
        verdict["kind"] = "hand"
        verdict["dead"] = expired
        verdict["reason"] = rule_90 if expired else f"written by hand or stopped; {int(age // 60)} min of 90 used"
        return verdict
    verdict["kind"] = "tool"
    if heartbeat_age <= DEAD_HEARTBEAT_SECONDS and not expired:  # expired too: a clock far ahead proves nothing
        verdict["reason"] = f"tool holder; heartbeat {int(heartbeat_age)} s old"
        return verdict
    host, pid, start = fields.get("host", ""), fields.get("pid", ""), fields.get("pid-start", "")
    stale = f"heartbeat {int(heartbeat_age // 60)} min old"
    if host == hostname():
        if pid_start(os.getpid()) is None:
            verdict["dead"] = expired
            verdict["reason"] = rule_90 if expired else f"{stale}; ps does not answer here, so nothing is proven"
        elif not pid.isdigit() or not same_process(pid, start):
            seen = pid_start(int(pid)) if pid.isdigit() else None
            verdict["dead"] = True
            verdict["reason"] = f"{stale} and pid {pid} " + ("has a different start time" if seen else "is gone")
        elif expired:
            verdict["dead"] = True
            verdict["reason"] = f"{rule_90} (pid {pid} still runs, heartbeat stuck)"
        else:
            verdict["reason"] = f"{stale} but pid {pid} still runs: not proven dead"
        return verdict
    answer = probe_remote(cfg, host, pid, start)
    if answer in ("gone", "different"):
        verdict["dead"] = True
        verdict["reason"] = f"{stale}; {host} says pid {pid} is {'gone' if answer == 'gone' else 'another process'}"
    elif expired:
        verdict["dead"] = True
        verdict["reason"] = f"{rule_90} ({host} says {answer})"
    else:
        verdict["reason"] = f"{stale}; {host} says {answer}: not proven dead, the 90-minute rule decides"
    return verdict


def queue_log(cfg: Config, event: str, **fields: Any) -> None:
    cfg.queue_dir.mkdir(parents=True, exist_ok=True)
    line = json.dumps({"when": iso(), "event": event, **fields}, sort_keys=True)
    with cfg.log_file.open("a", encoding="utf-8") as handle:
        handle.write(line + "\n")


def clear_dead_holder(cfg: Config, verdict: Dict[str, Any], who: str) -> bool:
    """Clear held/ by rename, so two clearers cannot both win; undo it if what we judged has changed."""
    aside = cfg.queue_dir / f".cleared-{uuid.uuid4().hex[:12]}"
    cfg.queue_dir.mkdir(parents=True, exist_ok=True)
    try:
        os.rename(cfg.held, aside)
    except OSError:
        return False
    try:
        now_text: Optional[str] = (aside / "holder.txt").read_text(encoding="utf-8", errors="replace")
    except OSError:
        now_text = None
    if now_text != verdict.get("text"):
        try:
            os.rename(aside, cfg.held)
        except OSError:
            queue_log(cfg, "clear_conflict", who=who, why="holder changed and the lock was retaken", aside=str(aside))
            return False
        queue_log(cfg, "clear_undone", who=who, why="holder.txt changed while it was being cleared")
        return False
    queue_log(cfg, "cleared_dead_holder", who=who, why=verdict.get("reason"), holder=now_text)
    shutil.rmtree(aside, ignore_errors=True)
    return True


def load_priorities(cfg: Config) -> Dict[str, Any]:
    path = cfg.queue_dir / "priorities.json"
    try:
        doc = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(doc.get("default"), int) and isinstance(doc.get("rules"), list):
            return doc
    except (OSError, ValueError, AttributeError):
        pass
    return DEFAULT_PRIORITIES


def priority_of(cfg: Config, name: str, branch: Optional[str], override: Optional[int]) -> int:
    if override is not None:
        return override
    table = load_priorities(cfg)
    for rule in table["rules"]:
        if re.search(rule["match"], name or "") or re.search(rule["match"], branch or ""):
            return int(rule["priority"])
    return int(table["default"])


def read_tickets(cfg: Config) -> List[Dict[str, Any]]:
    rows = []
    try:
        names = sorted(cfg.queue_dir.glob("t-*.json"))
    except OSError:
        return rows
    for path in names:
        try:
            row = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(row, dict) and row.get("id"):
            rows.append(row)
    return rows


def ticket_order(row: Dict[str, Any]) -> tuple:
    return (int(row.get("priority", 50)), str(row.get("time", "")), str(row["id"]))


def waiting_line(cfg: Config) -> List[Dict[str, Any]]:
    """Live tickets in order: priority, then arrival. A ticket whose heartbeat stopped loses its place."""
    live = []
    for row in read_tickets(cfg):
        beat = age_seconds(row.get("heartbeat"))
        gone = row.get("host") == hostname() and not same_process(row.get("pid"), row.get("pid_start"))
        if not gone and beat is not None and beat <= DEAD_HEARTBEAT_SECONDS:
            live.append(row)
            continue
        if gone or beat is None or beat > HAND_RULE_SECONDS:
            try:
                (cfg.queue_dir / f"t-{row['id']}.json").unlink()
                queue_log(cfg, "ticket_expired", ticket=row)
            except OSError:
                pass
    return sorted(live, key=ticket_order)


def batch_landed(cfg: Config, fields: Dict[str, Any]) -> bool:
    """holder.txt names a batch-start and something landed in it: a row says so, or main has moved past it."""
    start = fields.get("batch-start")
    if not start:
        return False
    return bool(fields.get("batch-landing")) or git_out(cfg.shared, "rev-parse", "refs/remotes/origin/main") != start


def close_command(start: Any) -> str:
    return f"python3 scripts/pm-land.py run --batch-close --batch-start {start} --name <you>"


def try_take(cfg: Config) -> bool:
    try:
        os.mkdir(cfg.held)
        return True
    except FileExistsError:
        return False


def acquire_lock(cfg: Config, name: str, branch: Optional[str], priority: int, holder: Dict[str, Any],
                 wait_timeout: Optional[float], on_ticket=None) -> None:
    """Wait in line, then take held/ by mkdir. Hand landers don't queue; mkdir is what excludes them."""
    cfg.lock_dir.mkdir(parents=True, exist_ok=True)
    cfg.queue_dir.mkdir(parents=True, exist_ok=True)
    ticket_id = f"{priority:03d}-{uuid.uuid4().hex[:12]}"
    path = cfg.queue_dir / f"t-{ticket_id}.json"
    me = os.getpid()
    ticket = {"id": ticket_id, "priority": priority, "name": name, "branch": branch, "host": hostname(), "pid": me,
              "pid_start": pid_start(me), "time": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
              "heartbeat": iso()}
    write_json_atomic(path, ticket)
    if on_ticket:
        on_ticket(ticket_id)
    started = time.monotonic()
    last_line = None
    try:
        while True:
            ticket["heartbeat"] = iso()
            write_json_atomic(path, ticket)
            line = waiting_line(cfg)
            first = bool(line) and line[0]["id"] == ticket_id
            verdict: Dict[str, Any] = {}
            if first:
                if try_take(cfg):
                    write_holder(cfg, holder)
                    return
                verdict = judge_holder(cfg)
                if verdict.get("dead") and batch_landed(cfg, verdict["fields"]):
                    raise BatchOwesClose(verdict["fields"]["batch-start"], verdict["reason"])
                if verdict.get("dead"):
                    say(f"clearing the lock: {verdict['reason']}")
                    clear_dead_holder(cfg, verdict, name)
                    continue
            position = next((i for i, row in enumerate(line) if row["id"] == ticket_id), 0)
            what = f"number {position + 1} in line" + (f"; lock held: {verdict.get('reason')}" if verdict else "")
            if what != last_line:
                say(f"waiting: {what}")
                last_line = what
            if wait_timeout is not None and time.monotonic() - started >= wait_timeout:
                raise LockWaitTimeout(what)
            time.sleep(cfg.poll_seconds)
    finally:
        try:
            path.unlink()
        except OSError:
            pass


class Heartbeat(threading.Thread):
    """Refreshes holder.txt every minute while this process holds the lock."""

    def __init__(self, lander: "Lander"):
        super().__init__(daemon=True)
        self.lander = lander
        self.halt = threading.Event()

    def run(self) -> None:
        began = time.monotonic()
        while not self.halt.wait(self.lander.cfg.heartbeat_seconds):
            if time.monotonic() - began >= self.lander.cfg.max_hold_seconds:
                self.lander.hold_ran_out()
                return
            try:
                self.lander.beat()
            except OSError:
                pass


# ---------------------------------------------------------------------------------------------------------
# The steps.
# ---------------------------------------------------------------------------------------------------------

def landing_steps(checks_local: bool) -> List[str]:
    head = ["lock", "fetch", "rebase", "shard-own", "transfer", "dirty-check"]
    if checks_local:
        body = ["local-prepare", "shard-local", "landing-check-local", "ff", "push"]
    else:
        body = ["ff", "shard-shared", "landing-check", "push"]
    return head + body + ["followup-decide", "local-remove", "remove-worktree", "finish"]


def followup_steps(checks_local: bool) -> List[str]:
    head = ["fu-prepare", "fu-snapshot", "fu-baseline", "fu-commit", "transfer", "dirty-check"]
    if checks_local:
        body = ["shard-local", "landing-check-local", "ff", "push"]
    else:
        body = ["ff", "shard-shared", "landing-check", "push"]
    return head + body + ["fu-remove"]


# (state key, what a judgement of that kind covers).
JUDGEMENTS = (("timeouts_judged", "timed-out subchecks"), ("rows_compared", "changed pre-existing rows"))

TARGET_STEPS = {"fetch", "rebase", "shard-own", "transfer", "dirty-check", "local-prepare", "shard-local",
                "landing-check-local", "ff", "shard-shared", "landing-check", "push"}


def new_step(name: str, target: Optional[str]) -> Dict[str, Any]:
    return {"name": name, "target": target, "status": "pending"}


def porcelain_paths(text: str) -> List[str]:
    """Paths from `git status --porcelain -z`, both sides of a rename."""
    paths: List[str] = []
    parts = text.split("\0")
    index = 0
    while index < len(parts):
        entry = parts[index]
        index += 1
        if len(entry) < 4:
            continue
        paths.append(entry[3:])
        if entry[0] in "RC":
            if index < len(parts) and parts[index]:
                paths.append(parts[index])
            index += 1
    return paths


def path_hits(changed: Sequence[str], touched: Sequence[str]) -> List[str]:
    """Which changed paths are files the branch touches. An untracked `dir/` covers what lies under it."""
    wanted = set(touched)
    hits = []
    for path in changed:
        if path in wanted or (path.endswith("/") and any(item.startswith(path) for item in wanted)):
            hits.append(path)
    return sorted(set(hits))


def is_reseal_path(path: str) -> bool:
    return path in RESEAL_PATHS or path.startswith(RESEAL_PREFIXES)


def valid_full_sha(text: Any) -> bool:
    return isinstance(text, str) and re.fullmatch(r"[0-9a-f]{40}", text) is not None


def inputs_manifest(root: Path, cfg: Config) -> Dict[str, str]:
    """The ignored inputs the checks read, by SHA-256; the symlink by what it resolves to."""
    manifest: Dict[str, str] = {}
    link = root / SYMLINK_INPUT
    manifest[SYMLINK_INPUT] = f"-> {os.path.realpath(link)}" if os.path.lexists(link) else "missing"
    for rel in AUDIT_INPUTS:
        path = root / rel
        if path.is_dir():
            for sub in sorted(item for item in path.rglob("*") if item.is_file()):
                manifest[str(sub.relative_to(root))] = sha256_file(sub)
        elif path.is_file():
            manifest[rel] = sha256_file(path)
        else:
            manifest[rel] = "missing"
    return manifest


class Lander:
    """One landing: its state file, its lock, its steps."""

    def __init__(self, cfg: Config, st: Dict[str, Any]):
        self.cfg = cfg
        self.st = st
        self.heartbeat: Optional[Heartbeat] = None
        self.holder: Dict[str, Any] = {}
        self.holder_guard = threading.Lock()
        self.lock_lost = threading.Event()
        self.current_child: Optional[subprocess.Popen] = None
        self.handlers = {
            "lock": self.h_lock, "close-fetch": self.h_close_fetch, "fetch": self.h_fetch, "rebase": self.h_rebase,
            "shard-own": self.h_shard_own, "transfer": self.h_transfer, "dirty-check": self.h_dirty,
            "local-prepare": self.h_local_prepare, "shard-local": self.h_shard_local,
            "landing-check-local": self.h_landing_check_local, "ff": self.h_ff, "shard-shared": self.h_shard_shared,
            "landing-check": self.h_landing_check, "push": self.h_push, "followup-decide": self.h_followup_decide,
            "fu-prepare": self.h_fu_prepare, "fu-snapshot": self.h_fu_snapshot, "fu-baseline": self.h_fu_baseline,
            "fu-commit": self.h_fu_commit, "fu-remove": self.h_fu_remove, "local-remove": self.h_local_remove,
            "close-batch": self.h_close_batch, "remove-worktree": self.h_remove_worktree, "finish": self.h_finish,
        }

    # --- state ---------------------------------------------------------------------------------------------

    @property
    def state_path(self) -> Path:
        return self.cfg.state_dir / f"{self.st['id']}.json"

    @property
    def report_dir(self) -> Path:
        return self.cfg.evidence_dir / self.st["id"]

    def save(self) -> None:
        self.st["updated"] = iso()
        self.cfg.state_dir.mkdir(parents=True, exist_ok=True)
        write_json_atomic(self.state_path, self.st)

    def note(self, text: str) -> None:
        self.st.setdefault("notes", []).append(f"{iso()} {text}")
        say(text)

    def for_jared(self, text: str) -> None:
        self.st.setdefault("for_jared", []).append(text)
        say(f"for Jared: {text}")

    def target(self, step: Dict[str, Any]) -> Dict[str, Any]:
        return self.st[step["target"]]

    # --- commands ------------------------------------------------------------------------------------------

    def command_log(self, command: Sequence[str], code: int, elapsed: float) -> None:
        try:
            self.report_dir.mkdir(parents=True, exist_ok=True)
            with (self.report_dir / "commands.log").open("a", encoding="utf-8") as handle:
                handle.write(f"{iso()} rc={code} {elapsed:.1f}s {shlex.join(command)}\n")
        except OSError:
            pass

    def git(self, cwd: Any, *args: str, check: bool = True, env: Optional[Dict[str, str]] = None
            ) -> subprocess.CompletedProcess:
        command = ["git", "-C", str(cwd), *args]
        began = time.monotonic()
        full_env = dict(os.environ, GIT_TERMINAL_PROMPT="0", GIT_EDITOR="true")
        full_env.update(env or {})
        result = subprocess.run(command, capture_output=True, text=True, errors="replace", env=full_env)
        self.command_log(command, result.returncode, time.monotonic() - began)
        if check and result.returncode != 0:
            raise Stop("git_failed", f"{shlex.join(command)} exited {result.returncode}: "
                                     f"{(result.stderr or result.stdout).strip()[-800:]}",
                       "Read the message, fix the cause, then `resume`.")
        return result

    def rev(self, cwd: Any, ref: str, check: bool = True) -> Optional[str]:
        result = self.git(cwd, "rev-parse", "--verify", "--quiet", f"{ref}^{{commit}}", check=False)
        if result.returncode != 0:
            if check:
                raise Stop("git_failed", f"{ref} does not resolve in {cwd}")
            return None
        return result.stdout.strip()

    def is_ancestor(self, cwd: Any, older: str, newer: str) -> bool:
        return self.git(cwd, "merge-base", "--is-ancestor", older, newer, check=False).returncode == 0

    def diff_names(self, cwd: Any, older: str, newer: str) -> List[str]:
        out = self.git(cwd, "diff", "--name-only", "--no-renames", f"{older}..{newer}").stdout
        return [line for line in out.splitlines() if line]

    def run_logged(self, label: str, command: Sequence[str], cwd: Any) -> tuple:
        """Run a check with its output in a log file, in its own process group, recorded in the state."""
        self.report_dir.mkdir(parents=True, exist_ok=True)
        log = self.report_dir / f"{self.st['seq']:02d}-{label}.log"
        self.st["seq"] += 1
        say(f"{label}: cd {cwd} && {shlex.join(command)}  (log: {log})")
        began = time.monotonic()
        with log.open("wb") as out:
            child = subprocess.Popen(list(command), cwd=str(cwd), stdout=out, stderr=subprocess.STDOUT,
                                     start_new_session=True, env=dict(os.environ, GIT_TERMINAL_PROMPT="0"))
            self.current_child = child
            self.st["child"] = {"pid": child.pid, "pid_start": pid_start(child.pid), "command": list(command),
                                "cwd": str(cwd), "log": str(log), "host": hostname()}
            self.save()
            try:
                code = child.wait()
            except BaseException:
                self.kill_group(child.pid)
                try:
                    child.wait(timeout=15)
                except subprocess.TimeoutExpired:
                    self.kill_group(child.pid, signal.SIGKILL)
                raise
            finally:
                self.current_child = None
                self.st["child"] = None
        self.command_log(list(command), code, time.monotonic() - began)
        self.save()
        say(f"{label}: exit {code} after {int(time.monotonic() - began)} s")
        return code, log

    @staticmethod
    def kill_group(pid: int, sig: int = signal.SIGTERM) -> None:
        try:
            os.killpg(pid, sig)
        except OSError:
            pass

    def kill_orphan_child(self) -> None:
        """A check this landing started and that outlived its parent; its result would be lost anyway."""
        child = self.st.get("child")
        if child and child.get("host") == hostname() and same_process(child.get("pid"), child.get("pid_start")):
            self.note(f"stopping the check left over from the killed run: pid {child['pid']}")
            self.kill_group(int(child["pid"]))
            for _ in range(20):
                if not same_process(child.get("pid"), child.get("pid_start")):
                    break
                time.sleep(0.5)
            else:
                self.kill_group(int(child["pid"]), signal.SIGKILL)
        self.st["child"] = None

    # --- lock ----------------------------------------------------------------------------------------------

    def holder_base(self, state: str) -> Dict[str, Any]:
        me = os.getpid()
        st = self.st
        holder: Dict[str, Any] = {
            "agent": st["name"], "branch": st.get("branch") or "(closing a batch)", "time": iso(), "tool": TOOL_TAG,
            "token": st["lock"].get("token"), "landing": st["id"], "state": state, "host": hostname(), "pid": me,
            "pid-start": pid_start(me), "started": st["created"], "heartbeat": iso(),
        }
        batch = st.get("batch")
        if batch:
            holder["batch-start"] = batch.get("start")
            holder["batch-first-push"] = batch.get("first_push")
            holder["batch-landing"] = [f"{row['branch']} {row['sha']}" for row in batch.get("landings") or []]
        return holder

    def beat(self) -> None:
        with self.holder_guard:
            text = read_holder_text(self.cfg)
            if text is None or parse_holder(text).get("token") != self.st["lock"].get("token"):
                self.lock_lost.set()
                return
            self.holder["time"] = self.holder["heartbeat"] = iso()
            write_holder(self.cfg, self.holder)

    def hold_ran_out(self) -> None:
        """A check can hang with this thread still beating, and then neither rule for a dead holder would ever fire."""
        hours = self.cfg.max_hold_seconds / 3600
        say(f"this run has held the lock for {hours:g} h, the maximum: the heartbeat stops, so by the rule for a stuck "
            "heartbeat the next in line may clear the lock once nothing has been written for 90 minutes")
        try:
            queue_log(self.cfg, "max_hold_reached", landing=self.st["id"], agent=self.st["name"], hours=hours)
        except OSError:
            pass

    def start_heartbeat(self) -> None:
        self.stop_heartbeat()
        self.lock_lost.clear()
        self.heartbeat = Heartbeat(self)
        self.heartbeat.start()

    def stop_heartbeat(self) -> None:
        if self.heartbeat is not None:
            self.heartbeat.halt.set()
            self.heartbeat.join(timeout=5)
            self.heartbeat = None

    def rewrite_holder(self, state: str = "landing") -> None:
        with self.holder_guard:
            self.holder = self.holder_base(state)
            write_holder(self.cfg, self.holder)

    def holds_lock(self) -> bool:
        token = self.st["lock"].get("token")
        text = read_holder_text(self.cfg)
        return bool(token) and text is not None and parse_holder(text).get("token") == token

    def ensure_lock(self) -> None:
        """Before anything that moves main: the lock must still be ours, by token, read now."""
        if self.lock_lost.is_set() or not self.holds_lock():
            text = read_holder_text(self.cfg)
            raise Stop("lock_lost", f"this landing no longer holds the landing lock; holder.txt says: {text!r}",
                       "`resume` queues for the lock again and re-verifies everything.")

    def acquire(self) -> None:
        st = self.st
        st["lock"]["token"] = uuid.uuid4().hex
        st["status"] = "waiting"
        self.save()

        def remember(ticket_id: str) -> None:
            st["ticket"] = ticket_id
            self.save()

        holder = self.holder_base("landing")
        try:
            acquire_lock(self.cfg, st["name"], st.get("branch"), st["priority"], holder,
                         st.get("wait_timeout"), remember)
        except LockWaitTimeout as exc:
            st["lock"]["token"] = None
            raise Stop("lock_wait_timeout", f"gave up waiting for the lock: {exc}",
                       "`resume` queues again; nothing changed.") from exc
        except BatchOwesClose as exc:
            st["lock"]["token"] = None
            raise Stop("batch_needs_closing", f"the lock's holder is dead ({exc.reason}), and its batch {exc.start} landed "
                       "something, so clearing it would lose the batch's follow-up. It is closed, not cleared",
                       f"Close it: `{close_command(exc.start)}`, then `resume` this landing.") from exc
        self.holder = holder
        st["ticket"] = None
        st["status"] = "running"
        st["lock"]["taken"] = iso()
        self.start_heartbeat()
        self.save()
        say(f"lock taken (token {st['lock']['token'][:8]})")
        self.warn_owed_followups()

    def warn_owed_followups(self) -> None:
        """A landing that died after its push, and lost the lock, still owes its follow-up. Say so to the next."""
        for other in load_states(self.cfg):
            if other.get("id") != self.st["id"] and other.get("followup_owed") and other.get("status") not in FINAL \
                    and not other.get("batch"):
                self.for_jared(f"landing {other.get('id')} ({other.get('branch')}) pushed Plans changes and still owes "
                               "its snapshot and baseline follow-up: `resume` it where it ran, or do it by hand")

    def take_batch_rows(self, fields: Dict[str, Any]) -> None:
        """holder.txt is the record of this batch's landings: a hand lander may have written or corrected them."""
        batch = self.st["batch"]
        rows = []
        for row in fields.get("batch-landing") or []:
            parts = row.split()
            if len(parts) == 2:
                rows.append({"branch": parts[0], "sha": parts[1]})
            elif batch["role"] != "close":  # closing needs no count, and is what a broken batch needs
                raise Refused(f"holder.txt has a row the batch limits cannot count: {row!r}. The format is "
                              "`batch-landing: <branch> <sha>`: correct it, or close the batch")
        batch["first_push"] = fields.get("batch-first-push") or batch.get("first_push")
        batch["landings"] = rows

    def adopt_batch_lock(self) -> None:
        """Inside a batch the lock passes only by pm-mail, which the tool cannot see, and the batch-start SHA can be read
        from holder.txt, so knowing it is no hand-over. Taken over from batch-idle, a dead holder or one's own name; from a
        stopped or hand holder only with --handed-over-by naming it; from a holder landing right now, never."""
        st = self.st
        batch = st["batch"]
        verdict = judge_holder(self.cfg)
        if not verdict["held"]:
            raise Refused("no batch is open: the landing lock is free. Use --batch-open to start one.")
        fields = verdict["fields"]
        start = fields.get("batch-start")
        if not valid_full_sha(start):
            raise Refused(f"the lock is held but holder.txt names no full batch-start: {fields.get('agent')!r}")
        if batch.get("start") and batch["start"] != start:
            raise Refused(f"--batch-start {batch['start']} is not the open batch's batch-start {start}")
        ours = bool(st["lock"].get("token")) and fields.get("token") == st["lock"]["token"]
        agent = fields.get("agent")
        from_tool = fields.get("tool") == TOOL_TAG
        idle = from_tool and fields.get("state") == "batch-idle"
        if not ours and not verdict["dead"] and not idle:
            if from_tool and fields.get("state") == "landing":
                raise Stop("batch_busy", f"{agent} is landing inside this batch right now",
                           "Wait for its mail, then `resume`.")
            if agent != st["name"] and (not st.get("handed_over_by") or st["handed_over_by"] != agent):
                if from_tool:
                    raise Stop("batch_busy", f"{agent} stopped inside this batch and may be working on it, so the lock is "
                                             "still its own, and knowing the batch-start is no hand-over",
                               f"Once it has handed you the lock by pm-mail: `resume --handed-over-by {agent}`.")
                raise Refused(f"{agent!r} holds this batch's lock by hand and may be mid-check, and knowing the batch-start "
                              "is no hand-over. Once it has handed the lock to you by pm-mail, pass "
                              f"--handed-over-by {agent}")
            if agent != st["name"]:
                say(f"--handed-over-by {agent}: this asserts that {agent} handed you the lock by pm-mail, as the rule "
                    "requires. The tool cannot see that mail.")
                queue_log(self.cfg, "batch_handover_asserted", who=st["name"], by=agent, batch=start)
        batch["start"] = start
        self.take_batch_rows(fields)
        st["lock"]["token"] = uuid.uuid4().hex
        self.rewrite_holder("landing")
        st["lock"]["taken"] = iso()
        self.start_heartbeat()
        self.save()
        say(f"batch lock taken over from {fields.get('agent')}: batch-start {start}, "
            f"{len(batch['landings'])} landing(s) so far")

    def release_lock(self) -> None:
        self.stop_heartbeat()
        if self.holds_lock():
            shutil.rmtree(self.cfg.held)
            say("lock released")
        self.st["lock"]["token"] = None
        self.save()

    def idle_holder(self, state: str) -> None:
        """Keep held/ without a process behind it. No heartbeat, so the 90-minute rule protects it."""
        self.stop_heartbeat()
        if not self.holds_lock():
            return
        with self.holder_guard:
            self.holder = self.holder_base(state)
            for key in ("pid", "pid-start", "heartbeat"):
                self.holder.pop(key, None)
            write_holder(self.cfg, self.holder)

    # --- shard check judgement -----------------------------------------------------------------------------

    def judge_shard_failure(self, label: str, log: Path, cwd: Any, t: Dict[str, Any]) -> None:
        """The rule: a failure on the branch's files stops; on others, confirm HEAD is consistent and go on."""
        back = "Fix it on your branch (regenerate, never hand-merge), commit, then `resume`."
        try:
            text = log.read_text(encoding="utf-8", errors="replace")
            report = json.loads(text[text.index("{"):])
            failures = report["failures"]
            if not isinstance(failures, list) or not failures:
                raise ValueError("no failure rows")
        except (ValueError, KeyError, TypeError, OSError) as exc:
            raise Stop("shard_check_unreadable", f"{label} failed and its report cannot be read ({exc}); log: {log}",
                       back) from exc
        named = []
        for row in failures:
            path = row.get("path") if isinstance(row, dict) else None
            if not isinstance(path, str) or not path:
                raise Stop("shard_check_unreadable", f"{label} failed on a row that names no file: {row!r}", back)
            named.append(path)
        touched = set(t.get("touched") or [])
        sources = [row.get("source") for row in failures if isinstance(row.get("source"), str)]
        mine = sorted(set(path for path in named + sources if path in touched))
        if mine:
            raise Stop("shard_check_on_branch", f"{label} fails on files this branch touches", back, files=mine)
        for path in sorted(set(named)):
            if self.git(cwd, "cat-file", "-e", f"HEAD:{path}", check=False).returncode != 0:
                raise Stop("shard_check_head_inconsistent", f"{label}: HEAD does not hold {path}",
                           "HEAD is not consistent: stop and report it to Jared.", files=[path])
            parts = path.split("/")
            if path.startswith("Plans/_shards/") and len(parts) >= 4 and parts[-1] != "manifest.json":
                manifest = "/".join(parts[:3]) + "/manifest.json"
                shown = self.git(cwd, "show", f"HEAD:{manifest}", check=False)
                if shown.returncode != 0 or path not in shown.stdout:
                    raise Stop("shard_check_head_inconsistent", f"{label}: HEAD's {manifest} does not reference {path}",
                               "HEAD is not consistent: stop and report it to Jared.", files=[path])
        self.for_jared(f"{label} failed on files this branch does not touch, HEAD is consistent, so the landing goes "
                       f"on as the rule says: {', '.join(sorted(set(named)))} (log: {log})")

    def run_shard(self, label: str, cwd: Any) -> tuple:
        return self.run_logged(label, SHARD_CHECK, cwd)

    # --- step handlers -------------------------------------------------------------------------------------

    def h_lock(self, step: Dict[str, Any]) -> None:
        st = self.st
        batch = st.get("batch")
        if batch and batch["role"] in ("member", "close"):
            self.adopt_batch_lock()
            return
        if st["lock"].get("token") and self.holds_lock():
            self.rewrite_holder("landing")
            self.start_heartbeat()
            return
        self.acquire()

    def fetch_all(self) -> str:
        st = self.st
        self.git(self.cfg.shared, "fetch", "origin")
        if st.get("worktree") and not st.get("same_repo"):
            self.git(st["worktree"], "fetch", "origin")
        if st["checks_local"] and not st.get("local_same_repo"):
            self.git(self.cfg.base_repo(), "fetch", "origin")
        origin = self.rev(self.cfg.shared, "refs/remotes/origin/main")
        if st.get("worktree"):
            theirs = self.rev(st["worktree"], "refs/remotes/origin/main")
            if theirs != origin:
                raise Stop("fetch_mismatch", f"origin/main differs: shared checkout {origin}, branch's repository {theirs}",
                           "Fetch again; if it persists, the two repositories have different origins.")
        return origin

    def commit_time(self, sha: Any) -> Optional[float]:
        out = self.git(self.cfg.shared, "show", "-s", "--format=%ct", f"{sha}^{{commit}}", check=False).stdout.strip()
        return float(out) if out.isdigit() else None

    def baseline_age(self, origin: str) -> Optional[float]:
        """How old the baseline at origin/main is by commit time, as pm-landing-check.py counts it, measured from the
        newest commit a landing could make now. None when rule 2 is off anyway (it names no commit, or one not on main's
        history): a batch and a lone landing are then judged alike."""
        shown = self.git(self.cfg.shared, "show", f"{origin}:{BASELINE_FILE}", check=False)
        try:
            commit = json.loads(shown.stdout).get("commit") if shown.returncode == 0 else None
        except (ValueError, AttributeError):
            commit = None
        if not isinstance(commit, str) or not commit:
            return None
        when, newest = self.commit_time(commit), self.commit_time(origin)
        if when is None or newest is None or not self.is_ancestor(self.cfg.shared, commit, origin):
            return None
        return max(newest, time.time()) - when

    def check_batch_limits(self, origin: str) -> None:
        batch = self.st.get("batch")
        if not batch:
            return
        rows = batch.get("landings") or []
        close_it = f"Close it with `{close_command(batch['start'])}`, then land this branch."
        if not rows and batch["role"] != "open" and batch["start"] != origin:
            raise Stop("batch_rows_missing", f"main has moved past batch-start {batch['start']}, but holder.txt has no "
                       "`batch-landing: <branch> <sha>` row, so this batch's four landings and two hours cannot be counted",
                       f"Add the rows, then `resume`; or: {close_it}", keep_lock=True)
        if rows and not batch.get("first_push"):
            # A hand-opened batch has no batch-first-push line. Its first landing's commit time stands in, a little early.
            when = self.commit_time(rows[0]["sha"])
            if when is None:
                raise Stop("batch_rows_missing", f"holder.txt's first row names {rows[0]['sha']}, which is no commit here, so "
                           "this batch's two hours cannot be counted", f"Correct the row, then `resume`; or: {close_it}",
                           keep_lock=True)
            batch["first_push"] = iso(datetime.fromtimestamp(when, timezone.utc))
        age = self.baseline_age(origin) if rows else None
        if age is not None and age > BASELINE_LIMIT_SECONDS:
            raise Stop("batch_baseline_past_limit", f"the baseline is now {age / 86400:.2f} days old, past the seven days "
                       "rule 2 allows, while this batch's base still reads it as current; alone, rule 2 would be off",
                       close_it, keep_lock=True)
        if len(batch.get("landings") or []) >= BATCH_MAX_LANDINGS:
            raise Stop("batch_full", f"this batch already has {BATCH_MAX_LANDINGS} landings",
                       "Close it with `run --batch-close --batch-start <sha>`, then land this branch.", keep_lock=True)
        age = age_seconds(batch.get("first_push"))
        if age is not None and age > BATCH_MAX_SECONDS:
            raise Stop("batch_expired", f"this batch's first push was {int(age // 60)} min ago, past the two hours",
                       "Close it with `run --batch-close --batch-start <sha>`, then land this branch.", keep_lock=True)

    def h_close_fetch(self, step: Dict[str, Any]) -> None:
        t = self.target(step)
        origin = self.fetch_all()
        batch = self.st["batch"]
        if not self.is_ancestor(self.cfg.shared, batch["start"], origin):
            raise Stop("batch_start_not_on_main", f"batch-start {batch['start']} is not on origin/main {origin}", keep_lock=True)
        t["origin_main"] = t["pushed_sha"] = origin
        changed = self.diff_names(self.cfg.shared, batch["start"], origin)
        self.st["followup_owed"] = any(path.startswith("Plans/") for path in changed)

    def h_fetch(self, step: Dict[str, Any]) -> None:
        st = self.st
        t = self.target(step)
        origin = self.fetch_all()
        t["origin_main"] = origin
        batch = st.get("batch")
        if batch:
            if batch["role"] == "open" and not batch.get("landings"):
                age = self.baseline_age(origin)
                if age is not None and age > BASELINE_LIMIT_SECONDS - BASELINE_MARGIN_SECONDS:
                    raise Stop("batch_baseline_near_limit",
                               f"no batch opens on a baseline {age / 86400:.2f} days old: within two hours of the seven "
                               "days rule 2 allows, a landing could pass against the batch's base and stop alone",
                               "`abort` this landing and land it without --batch-open; the follow-up re-records the baseline.")
                batch["start"] = origin
                self.rewrite_holder("landing")
                say(f"batch opened: batch-start {origin}")
            if not valid_full_sha(batch.get("start")) or not self.is_ancestor(self.cfg.shared, batch["start"], origin):
                raise Stop("batch_start_not_on_main", f"batch-start {batch.get('start')} is not on origin/main {origin}",
                           keep_lock=True)
            self.check_batch_limits(origin)
            t["base_arg"] = batch["start"]
        else:
            t["base_arg"] = "origin/main"

    def h_rebase(self, step: Dict[str, Any]) -> None:
        st = self.st
        t = self.target(step)
        wt = st["worktree"]
        branch = st["branch"]
        on = self.git(wt, "symbolic-ref", "--short", "HEAD", check=False).stdout.strip()
        if on != branch:
            raise Stop("wrong_branch", f"{wt} is on {on or 'a detached HEAD'}, not {branch}",
                       "Check the branch out there, or pass --worktree, then `resume`.")
        dirty = self.git(wt, "status", "--porcelain").stdout.strip()
        if dirty:
            raise Stop("branch_dirty", f"{wt} has uncommitted changes; a landing rebases and lands commits only",
                       "Commit or remove them, then `resume`.", files=dirty.splitlines()[:20])
        origin = t["origin_main"]
        tip = self.rev(wt, "HEAD")
        t["pre_rebase_tip"] = tip
        if self.is_ancestor(wt, origin, tip):
            say(f"rebase: {branch} already contains origin/main {origin[:12]}; nothing to rebase")
        else:
            if int(self.git(wt, "rev-list", "--merges", "--count", f"{origin}..{tip}").stdout.strip() or 0) > 0:
                raise Stop("branch_has_merges", f"{branch} has merge commits and is not on origin/main; a rebase would "
                                                "flatten them", "Merge origin/main into it yourself, or rebase it by "
                                                                "hand, then `resume`.")
            base = self.git(wt, "merge-base", origin, tip).stdout.strip()
            mine = self.diff_names(wt, base, tip)
            theirs = set(self.diff_names(wt, base, origin))
            both = sorted(path for path in mine if path in theirs and path.startswith("Plans/")
                          and not path.startswith(DERIVED_PREFIXES))
            if both and not st.get("readjudicated"):
                raise Stop("plans_changed_on_both_sides",
                           "main changed Plans documents this branch edits. The rule: re-read every passage you cite "
                           "against the current text; a passage that changed is re-adjudicated, not merged blind",
                           "Re-read them, then `resume --readjudicated`.", files=both)
            result = self.git(wt, "rebase", "origin/main", check=False)
            if result.returncode != 0:
                conflicted = self.git(wt, "diff", "--name-only", "--diff-filter=U").stdout.split("\n")
                conflicted = [path for path in conflicted if path]
                self.git(wt, "rebase", "--abort", check=False)
                plans = [path for path in conflicted if path.startswith("Plans/")]
                extra = (" Plans conflicts are re-adjudicated by the branch's owner, never auto-resolved; derived "
                         "files are regenerated, never hand-merged." if plans else "")
                raise Stop("rebase_conflict", f"`git rebase origin/main` stopped on a conflict; the rebase was "
                                              f"aborted and {branch} is unchanged.{extra}",
                           "Rebase by hand in the branch's worktree, then `resume`.", files=conflicted)
            tip = self.rev(wt, "HEAD")
        if not self.is_ancestor(wt, origin, tip):
            raise Stop("rebase_not_on_main", f"{tip} does not contain origin/main {origin}")
        t["sha"] = tip
        t["touched"] = self.diff_names(wt, "origin/main", tip)
        if not t["touched"]:
            raise Stop("nothing_to_land", f"{branch} has no changes against origin/main",
                       "`abort` this landing: the branch is already on main or empty.")
        if st.get("batch"):
            reseal = [path for path in t["touched"] if is_reseal_path(path)]
            if reseal:
                raise Stop("reseal_in_batch", "a landing that needs a reseal is never part of a batch",
                           "Close the batch, then land this branch alone.", keep_lock=True, files=reseal)
        pushed = self.git(wt, "push", "origin", f"{tip}:refs/heads/{branch}", check=False)
        if pushed.returncode != 0:
            self.note(f"origin/{branch} was not updated (a plain push, never forced): it keeps the pre-rebase tip. "
                      f"The rebased tip is {tip}.")

    def h_shard_own(self, step: Dict[str, Any]) -> None:
        code, log = self.run_shard("shard-own", self.st["worktree"])
        if code != 0:
            raise Stop("shard_check_own_worktree", f"the shard check fails in the branch's own worktree; log: {log}",
                       "Regenerate on your branch (pm-shard-plans.py --generate, pm-plan-index.py generate), commit, "
                       "then `resume`.")

    def make_available(self, repo: Any, source: Any, branch: str, sha: str) -> None:
        if self.git(repo, "cat-file", "-e", f"{sha}^{{commit}}", check=False).returncode == 0:
            return
        self.git(repo, "fetch", "--no-tags", str(source), f"refs/heads/{branch}")
        if self.git(repo, "cat-file", "-e", f"{sha}^{{commit}}", check=False).returncode != 0:
            raise Stop("transfer_failed", f"{sha} did not reach {repo} from {source}")

    def source_of(self, step: Dict[str, Any]) -> tuple:
        if step["target"] == "fu":
            return self.st["fu"]["worktree"], self.st["fu"]["branch"]
        return self.st["worktree"], self.st["branch"]

    def h_transfer(self, step: Dict[str, Any]) -> None:
        t = self.target(step)
        source, branch = self.source_of(step)
        self.make_available(self.cfg.shared, source, branch, t["sha"])
        if self.st["checks_local"]:
            self.make_available(self.cfg.base_repo(), source, branch, t["sha"])

    def shared_dirty_hits(self, t: Dict[str, Any]) -> List[str]:
        text = self.git(self.cfg.shared, "status", "--porcelain", "-z").stdout
        return path_hits(porcelain_paths(text), t.get("touched") or [])

    def h_dirty(self, step: Dict[str, Any]) -> None:
        t = self.target(step)
        on = self.git(self.cfg.shared, "symbolic-ref", "--short", "HEAD", check=False).stdout.strip()
        if on != "main":
            raise Stop("shared_not_on_main", f"the shared checkout is on {on or 'a detached HEAD'}, not main",
                       "Report it; nobody lands until it is back on main.")
        hits = self.shared_dirty_hits(t)
        if hits:
            raise Stop("shared_dirty", "the shared checkout has uncommitted changes in files this branch touches",
                       "The rule: stop and hand the branch over.", files=hits)

    def full_worktree(self, path: Path, ref: str, branch: Optional[str]) -> None:
        cfg = self.cfg
        probe = path if path.exists() else cfg.worktree_root
        while not probe.exists():
            probe = probe.parent
        free = shutil.disk_usage(probe).free // (1024 ** 3)
        if free < cfg.min_free_gb:
            raise Stop("low_disk", f"{probe} has {free} GB free, under the {cfg.min_free_gb} GB floor for a full worktree",
                       "Free space, then `resume`.")
        if (path / ".git").exists():
            # A retry. This is the tool's own local worktree, never the shared checkout. snapshot-current deletes older
            # run folders after a full publish and its preflight needs the predecessor, so -f puts tracked deletions
            # back too, and clean takes out what the last try made.
            spec = ["-B", branch, ref] if branch else ["--detach", ref]
            self.git(path, "checkout", "-f", *spec)
            self.git(path, "clean", "-ffd", "--", "Plans/.plan_migration")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            spec = ["-b", branch] if branch else ["--detach"]
            self.git(cfg.base_repo(), "worktree", "add", "--no-checkout", *spec, str(path), ref)
            sparse = self.git(path, "config", "--get", "core.sparseCheckout", check=False).stdout.strip()
            if sparse == "true":
                self.git(path, "sparse-checkout", "disable")
            self.git(path, "checkout", "-f")

    def link_inputs(self, wt: Path) -> Dict[str, str]:
        cfg = self.cfg
        link = wt / SYMLINK_INPUT
        link.parent.mkdir(parents=True, exist_ok=True)
        if os.path.lexists(link):
            link.unlink()
        os.symlink(str(cfg.symlink_target), str(link))
        for rel in AUDIT_INPUTS:
            source = cfg.shared / rel
            dest = wt / rel
            if not source.exists():
                raise Stop("input_missing", f"the shared checkout has no {rel}, an ignored input the checks read",
                           "Restore it: the checks would report failures no landing sees.", files=[rel])
            dest.parent.mkdir(parents=True, exist_ok=True)
            if source.is_dir():
                shutil.copytree(source, dest, symlinks=True, dirs_exist_ok=True)
            else:
                shutil.copy2(source, dest)
        ours = inputs_manifest(wt, cfg)
        theirs = inputs_manifest(cfg.shared, cfg)
        different = sorted(key for key in set(ours) | set(theirs) if ours.get(key) != theirs.get(key))
        if different:
            raise Stop("inputs_differ", "the local copy's ignored inputs differ from the shared checkout's",
                       "Find out which is right; a landing check on other inputs proves nothing.", files=different[:20])
        path = self.report_dir / f"{self.st['seq']:02d}-ignored-inputs.json"
        self.st["seq"] += 1
        write_json_atomic(path, ours)
        say(f"ignored inputs match the shared checkout by SHA-256 ({len(ours)} files): {path}")
        return ours

    def h_local_prepare(self, step: Dict[str, Any]) -> None:
        st = self.st
        t = self.target(step)
        path = Path(st.get("local_wt") or self.cfg.worktree_root / f"land-{st['id']}")
        st["local_wt"] = str(path)
        self.save()
        self.full_worktree(path, t["sha"], None)
        t["inputs"] = hashlib.sha256(json.dumps(self.link_inputs(path), sort_keys=True).encode()).hexdigest()

    def checks_dir(self, step: Dict[str, Any]) -> Path:
        return Path(self.st["fu"]["worktree"] if step["target"] == "fu" else self.st["local_wt"])

    def h_shard_local(self, step: Dict[str, Any]) -> None:
        t = self.target(step)
        cwd = self.checks_dir(step)
        if self.rev(cwd, "HEAD") != t["sha"]:
            raise Stop("local_copy_moved", f"{cwd} is not at {t['sha']}")
        code, log = self.run_shard("shard-local", cwd)
        if code != 0:
            self.judge_shard_failure("the shard check in the local copy", log, cwd, t)

    def valid_check(self, t: Dict[str, Any], origin: str) -> bool:
        check = t.get("check")
        if not check or check["sha"] != t.get("sha") or check["origin_main"] != origin or check["base"] != t.get("base_arg"):
            return False
        if check["exit"] not in (0, 1) or check.get("batch_close"):
            return False
        timeouts = check.get("timeouts") or 0
        if timeouts < 0 or (timeouts and not self.st.get("timeouts_judged")):  # a crash said nothing: nothing excuses it
            return False
        return not check.get("rows_changed") or bool(self.st.get("rows_compared"))

    def record_judgements(self) -> None:
        """Before the push they excuse: on the record for Jared, even if this run dies straight after it."""
        for key, what in JUDGEMENTS:
            text = self.st.get(key)
            row = f"{what}, as the lander judged it: {text}"
            if text and row not in self.st.setdefault("for_jared", []):
                self.for_jared(row)

    def drop_judgements(self, sha: Optional[str]) -> None:
        """A judgement covers the check on record when it was given. A new check is judged on its own."""
        for key, what in JUDGEMENTS:
            text = self.st.get(key)
            if text:
                self.for_jared(f"{what}: a judgement given for an earlier check does not cover the new check of "
                               f"{str(sha)[:12]}: {text}")
            self.st[key] = None

    def own_staleness(self, cwd: Any, t: Dict[str, Any], rows_now: Optional[Dict[str, Any]], rows_before: Optional[Dict[str, Any]],
                      excused: List[str]) -> Callable[[str], Optional[str]]:
        """Why a subcheck's rise is not only this member's own staleness; its own range is the previous member's main SHA
        to its own, not the batch's union."""
        read: Dict[str, Any] = {}

        def exempt(subcheck: str) -> Optional[str]:
            if not read:
                read["own"] = self.diff_names(cwd, self.st["batch"]["landings"][-1]["sha"], t["sha"])
            why = why_not_exempt(subcheck, rows_now, rows_before, read["own"])
            if why is None:
                excused.append(subcheck)
            return why

        return exempt

    def earlier_digests(self) -> List[Optional[Dict[str, Any]]]:
        """The report digest of each earlier member of this batch, from its state; None for one with no record."""
        by_sha = {}
        for doc in load_states(self.cfg):
            land = doc.get("land") or {}
            if land.get("pushed_sha") and land.get("check"):
                by_sha[land["pushed_sha"]] = land["check"].get("digest")
        return [by_sha.get(row.get("sha")) for row in (self.st.get("batch") or {}).get("landings") or []]

    def run_landing_check(self, step: Dict[str, Any], cwd: Any) -> None:
        st = self.st
        t = self.target(step)
        if self.valid_check(t, t["origin_main"]):
            say(f"landing check already passed for {t['sha'][:12]} (exit {t['check']['exit']}): not rerun")
            return
        self.drop_judgements(t.get("sha"))
        self.ensure_lock()
        head = self.rev(cwd, "HEAD")
        if head != t["sha"]:
            raise Stop("checked_tree_moved", f"{cwd} is at {head}, not {t['sha']}, before the landing check")
        keep = self.report_dir / f"check-reports-{st['seq']:02d}"
        row_report = self.report_dir / f"check-rows-{st['seq']:02d}.json"
        asks_rows = bool(st.get("batch")) and step.get("target") == "land" and writes_row_report(cwd)
        command = LANDING_CHECK + ["--base", t["base_arg"], "--keep-check-reports", str(keep)] \
            + (["--row-report", str(row_report)] if asks_rows else []) + list(st.get("check_args") or [])
        code, log = self.run_logged("landing-check", command, cwd)
        after = self.rev(cwd, "HEAD")
        if after != head:
            raise Stop("checked_tree_moved", f"{cwd} moved from {head} to {after} during the landing check")
        text = log.read_text(encoding="utf-8", errors="replace")
        report = read_report(text)
        timeouts = 0
        if code in (0, 1) and report["crashed"]:
            timeouts = -1
        elif code == 1:
            timeouts = report["infrastructure"] if report["infrastructure"] is not None else -1
        batch = st.get("batch")
        gap = None
        # Exit 0 too: a bucket that comes back with an unchanged row naming no batch file prints nothing at all.
        if code in (0, 1) and timeouts >= 0 and batch and step.get("target") == "land" and batch.get("landings"):
            earlier = self.earlier_digests()
            excused: List[str] = []
            rows_now = read_row_report(row_report)
            rows_before = read_row_report((earlier[-1] or {}).get("rows_file")) if earlier else None
            gap = batch_gap(report, earlier, self.own_staleness(cwd, t, rows_now, rows_before, excused),
                            row_count_rises(rows_now, rows_before))
            if excused and not gap:
                self.for_jared(f"this landing stays in its batch: {', '.join(sorted(set(excused)))} rose since the previous "
                               "report, and every added row is staleness naming only this landing's own files")
            if not gap and not shows_what_changed(report, earlier) and not st.get("batch_unseen_said"):
                st["batch_unseen_said"] = True
                self.note("this pm-landing-check prints no gone ids, subcheck totals or bucket counts, so in this batch a "
                          "bucket an earlier member lowered or emptied and this one raised may not be seen (README, "
                          "\"Batches\"). A newer one closes the batch for it")
        t["check"] = {"sha": head, "tree": self.git(cwd, "rev-parse", f"{head}^{{tree}}").stdout.strip(),
                      "origin_main": t["origin_main"], "base": t["base_arg"], "exit": code, "log": str(log),
                      "reports": str(keep), "timeouts": timeouts, "cwd": str(cwd),
                      "rows_changed": report["compare"] if code == 1 else 0, "batch_close": gap[0] if gap else None,
                      "digest": dict({key: report[key] for key in REPORT_DIGEST}, rows_file=str(row_report) if asks_rows else None)}
        self.save()
        if timeouts < 0:
            why = "a traceback" if report["crashed"] else "no Infrastructure line"
            raise Stop("landing_check_crashed",
                       f"landing check exit {code} with {why} in its report: it did not finish judging, so it says "
                       f"nothing about this tree, and no judgement excuses that. Report: {log}",
                       "Fix the cause, then `resume`, which reruns it. Never re-record the baseline for this.")
        if gap:
            raise Stop(gap[0], f"{gap[1]}. Report: {log}")
        if code == 0:
            return
        if code == 1:
            tail = "\n".join(text.splitlines()[-4:])
            self.for_jared(f"landing check exit 1 on {head[:12]}: nothing in it stops the landing; report: {log} "
                           f"(full reports: {keep}). Governance staleness in it is a reseal request. Last lines:\n{tail}")
            flags = []
            what = []
            if timeouts:
                what.append(f"{timeouts} subcheck(s) timed out, and the rule says to rerun each on its own and judge "
                            "what it reports before pushing main (lines marked [infrastructure])")
                flags.append("--timeouts-judged \"<what you ran and found>\"")
            if report["compare"]:
                what.append(f"{report['compare']} pre-existing failure(s) changed content on files this branch touched, "
                            "and the rule says to compare those with the baseline's rows: the same count can hide one "
                            "failure fixed and another added")
                flags.append("--rows-compared \"<what you compared and found>\"")
            if flags:
                raise Stop("timeouts_need_judgement" if timeouts else "rows_need_comparison",
                           "landing check exit 1, but " + "; and ".join(what) + f". Report: {log}",
                           f"Do that, then `resume {' '.join(flags)}`, all in one resume: without "
                           + ("them" if len(flags) > 1 else "it") + " `resume` runs the check again.", keep_lock=True)
            return
        if code == 2:
            raise Stop("landing_check_blocked", f"landing check exit 2: something it reports stops the landing. Report: {log}",
                       "Fix it on your branch, commit, then `resume`.")
        if code == 3:
            raise Stop("landing_check_could_not_run", f"landing check exit 3: it could not run or its inputs do not "
                       f"match. Report: {log}", "Fix the cause, then `resume`. Never re-record the baseline for this.")
        raise Stop("landing_check_killed", f"the landing check ended with {code}; a partial run proves nothing. Log: {log}",
                   "`resume` reruns it.")

    def h_landing_check(self, step: Dict[str, Any]) -> None:
        self.run_landing_check(step, self.cfg.shared)

    def h_landing_check_local(self, step: Dict[str, Any]) -> None:
        t = self.target(step)
        cwd = self.checks_dir(step)
        local_origin = self.rev(cwd, "refs/remotes/origin/main")
        if local_origin != t["origin_main"]:
            raise Stop("local_copy_moved", f"origin/main in {cwd} is {local_origin}, not {t['origin_main']}")
        self.run_landing_check(step, cwd)

    def reclaim_dead_ff(self, head: str) -> bool:
        """main ahead of origin, left by a landing proven not to be running: the rule says reset it back."""
        for path in self.cfg.state_dir.glob("*.json"):
            try:
                other = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                continue
            if other.get("id") == self.st["id"]:
                continue
            runner = other.get("runner") or {}
            alive = runner.get("host") == hostname() and same_process(runner.get("pid"), runner.get("pid_start"))
            for name in ("land", "fu"):
                t = other.get(name) or {}
                if t.get("ff_sha") == head and not t.get("pushed") and not alive:
                    self.git(self.cfg.shared, "reset", "--keep", "origin/main")
                    self.note(f"shared checkout's main was left at {head[:12]} by landing {other.get('id')}, which "
                              "is not running; reset it back with git reset --keep origin/main")
                    return True
        return False

    def h_ff(self, step: Dict[str, Any]) -> None:
        st = self.st
        t = self.target(step)
        shared = self.cfg.shared
        self.ensure_lock()
        if st["checks_local"]:
            # The rule's dirty check again: the checks took a while. And the inputs they saw must still be there.
            self.h_dirty(step)
            if t.get("inputs"):
                theirs = hashlib.sha256(json.dumps(inputs_manifest(shared, self.cfg), sort_keys=True).encode()).hexdigest()
                if theirs != t["inputs"]:
                    raise Stop("inputs_changed", "the shared checkout's ignored inputs changed during the local checks",
                               "`resume` reruns them.")
        head = self.rev(shared, "HEAD")
        origin = self.rev(shared, "refs/remotes/origin/main")
        if head == t["sha"]:
            t["ff_sha"] = head
            return
        if head != origin and not self.is_ancestor(shared, head, origin):
            if not self.reclaim_dead_ff(head):
                raise Stop("shared_main_ahead", f"the shared checkout's main {head} is not on origin/main {origin}, and "
                                                "no stopped landing owns it", "Report it; find who left it there.")
        if origin != t["origin_main"]:
            raise Stop("origin_moved", f"origin/main moved to {origin} after this landing fetched {t['origin_main']}",
                       "`resume` starts over from the fetch.")
        t["ff_sha"] = t["sha"]
        self.save()
        self.git(shared, "merge", "--ff-only", t["sha"])
        now = self.rev(shared, "HEAD")
        if now != t["sha"]:
            raise Stop("ff_mismatch", f"after the fast-forward HEAD is {now}, not {t['sha']}")

    def h_shard_shared(self, step: Dict[str, Any]) -> None:
        t = self.target(step)
        code, log = self.run_shard("shard-shared", self.cfg.shared)
        if code != 0:
            self.judge_shard_failure("the shard check in the shared checkout", log, self.cfg.shared, t)

    def batch_over_limit(self) -> bool:
        batch = self.st.get("batch")
        age = age_seconds(batch.get("first_push")) if batch else None
        return age is not None and age > BATCH_MAX_SECONDS

    def mark_pushed(self, step: Dict[str, Any], t: Dict[str, Any], sha: str) -> None:
        st = self.st
        t["pushed"] = True
        t["pushed_sha"] = sha
        t["ff_sha"] = None
        st["main_ahead"] = None
        for key, _what in JUDGEMENTS:  # spent on this check; record_judgements copied the text before the push
            st[key] = None
        batch = st.get("batch")
        if step["target"] == "fu":
            st["followup_owed"] = False
        else:
            base = batch["start"] if batch else t["origin_main"]
            changed = self.diff_names(self.cfg.shared, base, sha)
            if any(path.startswith("Plans/") for path in changed):
                st["followup_owed"] = True
            if batch:
                # A run killed after writing holder.txt left this row there already, and take_batch_rows read it.
                if not any(row.get("sha") == sha for row in batch.setdefault("landings", [])):
                    batch["landings"].append({"branch": st["branch"], "sha": sha})
                batch["first_push"] = batch.get("first_push") or iso()
                self.rewrite_holder("landing")
        self.save()

    def h_push(self, step: Dict[str, Any]) -> None:
        st = self.st
        t = self.target(step)
        shared = self.cfg.shared
        self.ensure_lock()
        self.git(shared, "fetch", "origin")
        origin = self.rev(shared, "refs/remotes/origin/main")
        if origin != t["origin_main"]:
            raise Stop("origin_moved", f"origin/main moved to {origin} while this landing was checked against "
                                       f"{t['origin_main']}; nothing was pushed", "`resume` starts over from the fetch.")
        head = self.rev(shared, "HEAD")
        if head != t["sha"]:
            raise Stop("checked_commit_mismatch", f"the shared checkout's HEAD {head} is not the checked commit {t['sha']}; "
                                                  "nothing was pushed", "`resume` starts over from the fast-forward.")
        if not self.valid_check(t, origin):
            raise Stop("no_passing_check", f"no passing landing check is on record for {t['sha']}; nothing was pushed",
                       "`resume` reruns it.")
        tree = self.git(shared, "rev-parse", f"{head}^{{tree}}").stdout.strip()
        if tree != t["check"].get("tree"):
            raise Stop("checked_commit_mismatch", f"tree {tree} is not the checked tree {t['check'].get('tree')}; "
                                                  "nothing was pushed", "`resume` reruns the check.")
        if step["target"] == "land" and self.batch_over_limit():
            raise Stop("landing_check_blocked", "this batch passed its two hours during the landing's checks; not pushed")
        self.record_judgements()
        self.save()
        self.ensure_lock()
        last = ""
        for attempt in range(3):
            if attempt:
                time.sleep(float(os.environ.get("PM_LAND_PUSH_RETRY_SECONDS") or 20))
            result = self.git(shared, "push", "origin", "main", check=False)
            last = (result.stderr or result.stdout).strip()
            if result.returncode == 0:
                break
        else:
            self.git(shared, "fetch", "origin", check=False)
            reached = self.rev(shared, "refs/remotes/origin/main")
            if reached != t["sha"]:
                raise Stop("push_failed", f"`git push origin main` failed three times: {last[-500:]}",
                           "`resume` re-verifies and pushes again if nothing moved.")
            self.for_jared(f"git push origin main reported a failure, but origin/main is {t['sha'][:12]}: one of origin's "
                           f"push URLs may be behind: {last[-300:]}")
        self.mark_pushed(step, t, t["sha"])
        say(f"pushed main: {t['origin_main'][:12]}..{t['sha'][:12]}")

    def batch_touched_plans(self) -> bool:
        """Every landing of the batch counts, whichever process or agent landed it."""
        batch = self.st["batch"]
        origin = self.rev(self.cfg.shared, "refs/remotes/origin/main")
        return any(path.startswith("Plans/") for path in self.diff_names(self.cfg.shared, batch["start"], origin))

    def batch_keeps_open(self) -> bool:
        batch = self.st.get("batch")
        return bool(batch) and not batch.get("closing")

    def fu_context(self, origin: str) -> Dict[str, Any]:
        return {"origin_main": origin, "base_arg": "origin/main", "attempt": 0, "worktree": None, "branch": None,
                "sha": None, "touched": [], "ff_sha": None, "pushed": False, "check": None}

    def h_followup_decide(self, step: Dict[str, Any]) -> None:
        st = self.st
        if self.batch_keeps_open():
            say("the batch stays open: its one follow-up runs when it closes")
            return
        if not st.get("followup_owed"):
            say("no Plans/ path changed: no snapshot or baseline refresh")
            return
        st["fu"] = self.fu_context(st["land"]["pushed_sha"])
        self.insert_after_current([new_step(name, "fu") for name in followup_steps(st["checks_local"])])
        say(f"Plans/ changed: the snapshot and baseline follow-up runs at {st['land']['pushed_sha'][:12]}, under this lock")

    def insert_after_current(self, rows: List[Dict[str, Any]]) -> None:
        steps = self.st["steps"]
        index = next((i for i, row in enumerate(steps) if row["status"] in ("running",)), None)
        at = (index + 1) if index is not None else next(i for i, row in enumerate(steps) if row["status"] == "pending")
        steps[at:at] = rows
        self.save()

    def h_fu_prepare(self, step: Dict[str, Any]) -> None:
        st = self.st
        fu = st["fu"]
        repo = self.cfg.base_repo()
        self.git(repo, "fetch", "origin")
        origin = self.rev(repo, "refs/remotes/origin/main")
        fu["origin_main"] = origin
        date = now_utc().strftime("%Y%m%d")
        if not fu.get("branch") or fu.get("branch_pushed"):
            fu["attempt"] = int(fu.get("attempt") or 0) + 1
            fu["branch_pushed"] = False
            fu["branch"] = f"plans/snapshot-{date}-{st['id'][-4:]}-{fu['attempt']}"
        path = Path(fu.get("worktree") or st.get("local_wt") or self.cfg.worktree_root / f"snapshot-{date}-{st['id'][-4:]}")
        fu["worktree"] = str(path)
        self.save()
        self.full_worktree(path, origin, fu["branch"])
        if self.rev(path, "HEAD") != origin:
            raise Stop("followup_base_moved", f"{path} is not at origin/main {origin}", keep_lock=True)
        fu["inputs"] = hashlib.sha256(json.dumps(self.link_inputs(path), sort_keys=True).encode()).hexdigest()
        fu["sha"] = None

    def h_fu_snapshot(self, step: Dict[str, Any]) -> None:
        fu = self.st["fu"]
        wt = Path(fu["worktree"])
        date = now_utc().strftime("%Y%m%d")
        numbers = [int(match.group(1)) for match in
                   (re.fullmatch(rf"pds-{date}-(\d{{3}})-.*", item.name) for item in (wt / "Plans/.plan_migration").iterdir())
                   if match]
        run_id = f"pds-{date}-{max(numbers, default=0) + 1:03d}-current-planunit-snapshot"
        docs = [item for item in (wt / "Plans").glob("*.md") if not item.name.startswith(".")]
        current = json.loads((wt / RUN_POINTER).read_text(encoding="utf-8"))["run_id"]
        command = SNAPSHOT + ["--run-id", run_id, "--expected-doc-count", str(len(docs)), "--supersedes-run-id", current]
        code, log = self.run_logged("fu-snapshot", command, wt)
        if code != 0:
            raise Stop("snapshot_failed", f"snapshot-current exited {code}; log: {log}",
                       "Read the failures, fix the cause, then `resume`.")
        now = json.loads((wt / RUN_POINTER).read_text(encoding="utf-8"))["run_id"]
        if now != run_id:
            raise Stop("snapshot_failed", f"{RUN_POINTER} names {now}, not the new {run_id}")
        fu["run_id"] = run_id

    def h_fu_baseline(self, step: Dict[str, Any]) -> None:
        fu = self.st["fu"]
        wt = Path(fu["worktree"])
        command = LANDING_CHECK + ["--record-baseline"]
        code, log = self.run_logged("fu-baseline", command, wt)
        if code == 3 and "not recording a baseline" in log.read_text(encoding="utf-8", errors="replace"):
            # README: rerun with a larger bound before committing the follow-up and releasing the lock.
            code, log = self.run_logged("fu-baseline-retry", command + ["--subcheck-timeout-seconds", "1200"], wt)
        if code != 0:
            raise Stop("baseline_failed", f"--record-baseline exited {code}; log: {log}",
                       "Fix the cause, then `resume`; the older baseline stays in place.")
        commit = json.loads((wt / BASELINE_FILE).read_text(encoding="utf-8")).get("commit")
        if commit != fu["origin_main"]:
            raise Stop("baseline_failed", f"the baseline names {commit}, not origin/main {fu['origin_main']}")

    def h_fu_commit(self, step: Dict[str, Any]) -> None:
        st = self.st
        fu = st["fu"]
        wt = fu["worktree"]
        # A path, so this stages the older run folders snapshot-current deleted, as well as the new one.
        self.git(wt, "add", "Plans/.plan_migration", BASELINE_FILE)
        staged = [line for line in self.git(wt, "diff", "--cached", "--name-only").stdout.splitlines() if line]
        extra = [path for path in staged if path != BASELINE_FILE and not path.startswith("Plans/.plan_migration/")]
        if extra or not staged:
            raise Stop("followup_commit_scope", "the follow-up commit must hold the new run and the baseline, nothing else",
                       "Look at the worktree, then `resume`.", files=extra)
        self.git(wt, "commit", "-m", f"plans: refresh the plan-migration snapshot and the landing-check baseline\n\n"
                                     f"Snapshot {fu.get('run_id')} at {fu['origin_main'][:12]}, by pm-land.py "
                                     f"landing {st['id']}.")
        sha = self.rev(wt, "HEAD")
        if self.git(wt, "rev-parse", "HEAD^").stdout.strip() != fu["origin_main"]:
            raise Stop("followup_commit_scope", "the follow-up commit is not directly on origin/main")
        fu["branch_pushed"] = True
        self.save()
        self.git(wt, "push", "-u", "origin", "HEAD")
        fu["sha"] = sha
        fu["touched"] = self.diff_names(wt, fu["origin_main"], sha)

    def remove_tool_worktree(self, path: str, branch: Optional[str]) -> None:
        repo = self.cfg.base_repo()
        result = self.git(repo, "worktree", "remove", path, check=False)
        if result.returncode != 0:
            self.note(f"could not remove {path}: {result.stderr.strip()[-300:]}")
            return
        if branch:
            deleted = self.git(repo, "branch", "-d", branch, check=False)
            if deleted.returncode != 0:
                self.note(f"branch {branch} stays: {deleted.stderr.strip()[-200:]}")

    def h_fu_remove(self, step: Dict[str, Any]) -> None:
        st = self.st
        fu = st["fu"]
        self.remove_tool_worktree(fu["worktree"], fu["branch"])
        if st.get("local_wt") == fu["worktree"]:
            st["local_wt"] = None

    def h_local_remove(self, step: Dict[str, Any]) -> None:
        st = self.st
        if st.get("local_wt"):
            self.remove_tool_worktree(st["local_wt"], None)
            st["local_wt"] = None

    def h_close_batch(self, step: Dict[str, Any]) -> None:
        st = self.st
        batch = st.get("batch") or {}
        st.setdefault("closed_batches", []).append(batch)
        st["batch"] = None
        self.release_lock()
        self.note(f"batch {batch.get('start')} closed with its follow-up. {st.get('branch')} now lands alone, against "
                  "the new origin/main, and is judged as usual.")
        keep = st["land"]
        st.setdefault("earlier", []).append({"sha": keep.get("sha"), "check": keep.get("check")})
        st["land"] = {"sha": None, "touched": [], "origin_main": None, "base_arg": "origin/main", "ff_sha": None,
                      "pushed": False, "check": None}

    def h_remove_worktree(self, step: Dict[str, Any]) -> None:
        st = self.st
        wt = st.get("worktree")
        if not wt or st.get("keep_worktree"):
            self.note(f"worktree kept: {wt}")
            return
        git_dir = Path(os.path.realpath(self.git(wt, "rev-parse", "--absolute-git-dir").stdout.strip()))
        common = Path(os.path.realpath(self.git(wt, "rev-parse", "--path-format=absolute", "--git-common-dir").stdout.strip()))
        branch = st["branch"]
        if git_dir == common:
            self.note(f"{wt} is its repository's main worktree: left in place")
            return
        repo = common.parent
        here = os.path.realpath(os.getcwd())
        if here == os.path.realpath(wt) or here.startswith(os.path.realpath(wt) + os.sep):
            self.note(f"this process runs inside {wt}, so it stays. Once you have left it: "
                      f"git -C {repo} worktree remove {wt} && git -C {repo} branch -d {branch}")
            return
        result = self.git(repo, "worktree", "remove", wt, check=False)
        if result.returncode != 0:
            self.note(f"could not remove {wt}: {result.stderr.strip()[-300:]}")
            return
        # `branch -d` asks whether the branch is merged into its upstream or HEAD. This clone's HEAD may be
        # far behind, so it asks origin/main, which holds it by now; it still refuses if that is not so.
        self.git(repo, "fetch", "origin", check=False)
        self.git(repo, "branch", "--set-upstream-to=origin/main", branch, check=False)
        deleted = self.git(repo, "branch", "-d", branch, check=False)
        if deleted.returncode != 0:
            self.note(f"branch {branch} stays: {deleted.stderr.strip()[-200:]}")

    def h_finish(self, step: Dict[str, Any]) -> None:
        st = self.st
        batch = st.get("batch")
        if self.batch_keeps_open():
            self.idle_holder("batch-idle")
            say(f"landed; the lock stays held for the batch. batch-start: {batch['start']}. Hand it over by pm-mail; the "
                f"next lander runs `run <branch> --batch-start {batch['start']}`. Close with `run --batch-close "
                f"--batch-start {batch['start']}`.")
            st["lock"]["token"] = None
            return
        self.release_lock()

    # --- the driver ----------------------------------------------------------------------------------------

    def next_step(self) -> Optional[Dict[str, Any]]:
        return next((row for row in self.st["steps"] if row["status"] == "pending"), None)

    def seen(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {}
        for key in ("land", "fu"):
            t = self.st.get(key) or {}
            if t.get("sha") or t.get("origin_main"):
                out[key] = {"sha": t.get("sha"), "origin_main": t.get("origin_main")}
        return out

    def reset_if_ahead(self) -> None:
        """The rule: a fast-forward is pushed in the same step or reset back immediately."""
        for name in ("land", "fu"):
            t = self.st.get(name) or {}
            sha = t.get("ff_sha")
            if not sha or t.get("pushed"):
                continue
            head = self.rev(self.cfg.shared, "HEAD", check=False)
            origin = self.rev(self.cfg.shared, "refs/remotes/origin/main", check=False)
            if head == sha and origin != sha:
                result = self.git(self.cfg.shared, "reset", "--keep", "origin/main", check=False)
                if result.returncode != 0:
                    self.st["main_ahead"] = sha
                    say(f"CRITICAL: the shared checkout's main stays at {sha}, ahead of origin: git reset --keep "
                        f"origin/main failed: {result.stderr.strip()[-400:]}")
                    continue
                say(f"shared checkout's main reset back to origin/main {origin[:12]} (git reset --keep origin/main)")
            t["ff_sha"] = None
            self.st["main_ahead"] = None

    def batch_can_close_and_retry(self, stop: Stop, step: Dict[str, Any]) -> bool:
        batch = self.st.get("batch")
        return bool(batch) and stop.code in ("landing_check_blocked", "batch_rows_overlap", "batch_readiness_rise",
                                             "batch_total_rise") \
            and step.get("target") == "land" and bool(batch.get("landings"))

    def close_batch_and_retry(self, stop: Stop, step: Dict[str, Any]) -> None:
        """'Land in batches': don't push; close with the follow-up at the current main, then rerun it alone."""
        st = self.st
        self.note(f"this landing stopped inside the batch: {stop.message}")
        self.note("the rule: close the batch with its follow-up at the current main, then rerun this landing alone")
        batch = st["batch"]
        batch["closing"] = True
        step["status"] = "failed"
        step["note"] = stop.message
        steps = [row for row in st["steps"] if row["status"] != "pending"]
        rows: List[Dict[str, Any]] = []
        st["followup_owed"] = self.batch_touched_plans()
        if st["followup_owed"]:
            st["fu"] = self.fu_context(batch["landings"][-1]["sha"])
            rows += [new_step(name, "fu") for name in followup_steps(st["checks_local"])]
        rows.append(new_step("close-batch", None))
        for name in landing_steps(st["checks_local"]):
            rows.append(new_step(name, "land" if name in TARGET_STEPS else None))
        st["steps"] = steps + rows
        self.save()

    def shared_ahead(self) -> Optional[str]:
        """The shared checkout's HEAD when it holds commits origin/main does not, whoever left them there."""
        shared = self.cfg.shared
        head = self.rev(shared, "HEAD", check=False)
        origin = self.rev(shared, "refs/remotes/origin/main", check=False)
        if not head or not origin or head == origin or self.is_ancestor(shared, head, origin):
            return None
        return head

    def after_stop(self, stop: Stop, step: Optional[Dict[str, Any]]) -> None:
        st = self.st
        self.reset_if_ahead()
        if step is not None:
            step["status"] = "failed"
            step["note"] = stop.message
            step["finished"] = iso()
        st["status"] = "stopped"
        st["stop"] = {"code": stop.code, "message": stop.message, "next": stop.next_step, "files": stop.files,
                      "step": step["name"] if step else None, "when": iso()}
        batch = st.get("batch")
        token_ours = bool(st["lock"].get("token")) and self.holds_lock()
        ahead = st.get("main_ahead") or self.shared_ahead()
        keep = token_ours and (stop.keep_lock or ahead or st.get("followup_owed")
                               or (batch and (batch.get("landings") or batch["role"] != "open")))
        if keep:
            # Never batch-idle: this lander may be judging or repairing, and the lock passes only by pm-mail.
            self.idle_holder("stopped")
            st["lock"]["held_while_stopped"] = iso()
            how = "kept (no heartbeat, so the 90-minute rule applies)"
        elif token_ours:
            self.release_lock()
            how = "released"
        else:
            self.stop_heartbeat()
            st["lock"]["token"] = None
            how = "not held"
        self.save()
        print(f"\nSTOPPED at {st['stop']['step']}: {stop.code}\n  {stop.message}", flush=True)
        for path in stop.files[:60]:
            print(f"    {path}", flush=True)
        print(f"  lock: {how}", flush=True)
        if ahead:
            print(f"  CRITICAL: the shared checkout's main is at {ahead}, ahead of origin"
                  + (", so the lock is not released until it is back" if keep else "")
                  + f". See what blocks `git -C {self.cfg.shared} reset --keep origin/main`, then `resume` or `abort`.",
                  flush=True)
        if st.get("followup_owed"):
            print("  the snapshot and baseline follow-up is still owed.", flush=True)
        if stop.next_step:
            print(f"  next: {stop.next_step}", flush=True)
        print(f"  landing id: {st['id']}; `python3 scripts/pm-land.py status --id {st['id']}`", flush=True)

    def drive(self) -> int:
        st = self.st
        st["status"] = "running"
        step: Optional[Dict[str, Any]] = None
        try:
            self.save()
            while True:
                step = self.next_step()
                if step is None:
                    break
                step["status"] = "running"
                step["started"] = iso()
                self.save()
                try:
                    crash = os.environ.get("PM_LAND_TEST_CRASH_BEFORE")  # self-tests only: dies as SIGKILL would
                    if crash and crash == f"{step['name']}:{step.get('target') or ''}":
                        os._exit(137)
                    self.handlers[step["name"]](step)
                except Stop as stop:
                    if self.batch_can_close_and_retry(stop, step):
                        self.reset_if_ahead()
                        if not st.get("main_ahead"):  # a follow-up on a main that cannot be put back would land it
                            self.close_batch_and_retry(stop, step)
                            continue
                    self.after_stop(stop, step)
                    return EXIT_STOPPED
                except Refused:
                    # Only the batch handover refuses here, and nothing has changed yet.
                    if not st["land"].get("pushed"):
                        st["status"] = "aborted"
                    st["runner"] = None
                    self.save()
                    raise
                except Exception as exc:  # noqa: BLE001 - whatever broke, main must not stay ahead of origin.
                    self.after_stop(Stop("internal_error", f"{type(exc).__name__}: {exc}\n"
                                                           f"{traceback.format_exc()[-1500:]}",
                                         "Report it; `resume` starts this step over."), step)
                    return EXIT_STOPPED
                step["status"] = "done"
                step["finished"] = iso()
                step["seen"] = self.seen()
                self.save()
            st["status"] = "done"
            st["stop"] = None
            st["runner"] = None
            self.save()
            self.final_report()
            return EXIT_OK
        except Interrupted as exc:
            for number in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
                signal.signal(number, signal.SIG_IGN)
            self.after_stop(Stop("interrupted", f"{exc} arrived" + (f" during {step['name']}" if step else ""),
                                 "`resume` continues; a check that was running starts over."), step)
            return EXIT_STOPPED

    def final_report(self) -> None:
        st = self.st
        print("\nDONE " + st["id"], flush=True)
        land = st.get("land") or {}
        fu = st.get("fu") or {}
        if land.get("pushed_sha"):
            print(f"  landed: {st.get('branch')} at {land['pushed_sha']}", flush=True)
        if fu.get("pushed_sha"):
            print(f"  follow-up: {fu.get('run_id')} and the baseline at {fu['pushed_sha']}", flush=True)
        if st.get("for_jared"):
            print("  report to Jared:", flush=True)
            for row in st["for_jared"]:
                print(f"    - {row}", flush=True)
        for row in st.get("notes") or []:
            print(f"  note: {row}", flush=True)
        print(f"  logs: {self.report_dir}", flush=True)

    # --- resume --------------------------------------------------------------------------------------------

    def restart_from(self, name: str, target: Optional[str]) -> None:
        steps = self.st["steps"]
        cursor = next((i for i, row in enumerate(steps) if row["status"] != "done"), len(steps) - 1)
        for index in range(cursor, -1, -1):
            if steps[index]["name"] == name and steps[index].get("target") == target:
                for row in steps[index:]:
                    row["status"] = "pending"
                return
        raise Refused(f"no step {name} before the current one")

    def current_target(self) -> Optional[str]:
        return next((row.get("target") for row in self.st["steps"] if row["status"] != "done"), None)

    def reverify(self) -> None:
        """Nothing is assumed: lock holder, origin/main and the branch are read again before anything goes on."""
        st = self.st
        self.kill_orphan_child()
        for row in st["steps"]:
            if row["status"] in ("running", "failed"):
                row["status"] = "pending"
                row["note"] = "started over by resume"
        st["stop"] = None
        steps = st["steps"]
        cursor = next((i for i, row in enumerate(steps) if row["status"] != "done"), len(steps))
        at_lock_step = cursor < len(steps) and steps[cursor]["name"] == "lock"
        lock_done = not at_lock_step
        retaken = False
        if st["lock"].get("token") and self.holds_lock():
            if st.get("batch"):
                self.take_batch_rows(parse_holder(read_holder_text(self.cfg) or ""))
            self.rewrite_holder("landing")
            self.start_heartbeat()
            say("the lock is still this landing's")
        elif lock_done:
            # Whoever released it, it was not ours for a while: the rule's order starts again at the fetch.
            retaken = True
            if st["lock"].get("token"):
                self.note(f"the lock is not this landing's any more (holder.txt: {read_holder_text(self.cfg)!r})")
            st["lock"]["token"] = None
            batch = st.get("batch")
            if batch and (batch["role"] != "open" or batch.get("landings")):
                holder = parse_holder(read_holder_text(self.cfg) or "")
                if self.cfg.held.is_dir() and holder.get("batch-start") == batch.get("start"):
                    self.adopt_batch_lock()
                else:
                    self.note(f"the batch {batch.get('start')} ended while this landing was away: it lands alone")
                    st.setdefault("closed_batches", []).append(batch)
                    st["batch"] = None
            if not st["lock"].get("token"):
                self.acquire()
        name = self.current_target()
        if name is None or not lock_done:
            self.save()
            return
        origin = self.fetch_all()
        t = st.get(name) or {}
        if t.get("sha") and origin == t["sha"] and not t.get("pushed"):
            # The killed run pushed but never recorded it: proven by origin/main itself.
            push = next(row for row in reversed(st["steps"]) if row["name"] == "push" and row.get("target") == name)
            index = st["steps"].index(push)
            for row in st["steps"][: index + 1]:
                row["status"] = "done"
            self.mark_pushed(push, t, origin)
            self.note(f"origin/main is already {origin[:12]}: the killed run's push reached it")
            self.save()
            return
        if name == "fu" and not t.get("sha"):
            if t.get("worktree"):
                self.restart_from("fu-prepare", "fu")
            self.save()
            return
        if not t.get("origin_main"):
            self.save()
            return
        origin_moved = origin != t["origin_main"]
        tip = None
        if name == "land" and t.get("sha"):
            tip = self.rev(st["worktree"], f"refs/heads/{st['branch']}", check=False)
        elif name == "fu" and t.get("sha"):
            tip = self.rev(t["worktree"], "HEAD", check=False)
        branch_moved = bool(t.get("sha")) and tip != t["sha"]
        head = self.rev(self.cfg.shared, "HEAD")
        ahead = bool(t.get("ff_sha")) and head == t["ff_sha"] and head != origin
        passed = bool(t.get("sha")) and self.valid_check(t, origin)
        if ahead and (origin_moved or branch_moved or retaken or not passed):
            self.reset_if_ahead()
            if st.get("main_ahead"):
                raise Stop("main_ahead", f"the shared checkout's main is still at {head}, ahead of origin, and git reset "
                           "--keep origin/main fails, so nothing else can run", "Clear what blocks it, then `resume`.",
                           keep_lock=True)
            ahead = False
        if origin_moved or branch_moved or retaken:
            self.note(f"moved since this landing last ran: origin/main {t['origin_main'][:12]} -> {origin[:12]}, "
                      f"branch {str(t.get('sha'))[:12]} -> {str(tip)[:12]}; starting over from "
                      + ("the follow-up" if name == "fu" else "the fetch"))
            t["check"] = None
            if name == "fu":
                t["sha"] = None
                self.restart_from("fu-prepare", "fu")
            else:
                self.restart_from("fetch", "land")
        elif ahead and passed:
            self.note(f"main was fast-forwarded to {head[:12]}, its checks passed, and nothing moved: pushing now")
            push = next(row for row in reversed(st["steps"]) if row["name"] == "push" and row.get("target") == name)
            index = st["steps"].index(push)
            for row in st["steps"][:index]:
                row["status"] = "done"
            push["status"] = "pending"
        elif not ahead and any(row["name"] == "ff" and row.get("target") == name and row["status"] == "done"
                               for row in st["steps"]):
            self.restart_from("ff", name)
        self.save()


# ---------------------------------------------------------------------------------------------------------
# Plans for `plan`: the same commands the handlers run.
# ---------------------------------------------------------------------------------------------------------

def plan_lines(cfg: Config, st: Dict[str, Any]) -> List[str]:
    shared = cfg.shared
    wt = st.get("worktree") or "<branch worktree>"
    branch = st.get("branch")
    batch = st.get("batch")
    base = "<batch-start>" if batch else "origin/main"
    local_wt = cfg.worktree_root / "land-<id>"
    base_repo = cfg.base_repo()
    fu_wt = local_wt if st["checks_local"] else cfg.worktree_root / "snapshot-<date>-<id>"
    shard = shlex.join(SHARD_CHECK)
    check = shlex.join(LANDING_CHECK + ["--base", base, "--keep-check-reports", f"{cfg.evidence_dir}/<id>/check-reports-NN"]
                       + list(st.get("check_args") or []))
    fu_check = shlex.join(LANDING_CHECK + ["--base", "origin/main", "--keep-check-reports",
                                           f"{cfg.evidence_dir}/<id>/check-reports-NN"] + list(st.get("check_args") or []))
    role = (batch or {}).get("role")
    lock = {
        None: f"mkdir {cfg.held}   (first in line in {cfg.queue_dir}; holder.txt with host, pid, heartbeat every minute)",
        "open": f"mkdir {cfg.held}   (as above, and holder.txt gets batch-start: <origin/main full SHA> after the fetch)",
    }.get(role, f"take over {cfg.held} from batch-idle or a dead holder (from a stopped or hand holder: --handed-over-by): "
                "holder.txt must name this batch-start; rewrite it")
    lines = ["# Steps, in the rule's order (`--checks-local` differs only where noted):", f"lock:        {lock}"]
    if branch is None:
        lines += [f"fetch:       git -C {shared} fetch origin"]
    else:
        lines += [
            f"fetch:       git -C {shared} fetch origin; git -C {wt} fetch origin",
            f"rebase:      git -C {wt} rebase origin/main   (skipped when it already contains origin/main; stops on a "
            "conflict, on merge commits, or when main changed a Plans document it edits)",
            f"             git -C {wt} push origin <tip>:refs/heads/{branch}   (plain; never forced)",
            f"shard-own:   cd {wt} && {shard}",
            f"transfer:    git -C {shared} fetch --no-tags {wt} refs/heads/{branch}   (only if that repository lacks the commit)",
            f"dirty-check: git -C {shared} status --porcelain -z   (stop if it names a file the branch touches)",
        ]
        if st["checks_local"]:
            lines += [
                f"local:       git -C {base_repo} worktree add --no-checkout --detach {local_wt} <tip>; checkout; "
                f"ln -s {cfg.symlink_target} {SYMLINK_INPUT}; copy the ignored Plans/.audits inputs; compare by SHA-256",
                f"shard:       cd {local_wt} && {shard}",
                f"check:       cd {local_wt} && {check}",
                f"ff:          git -C {shared} status --porcelain -z; git -C {shared} merge --ff-only <tip>",
            ]
        else:
            lines += [
                f"ff:          git -C {shared} merge --ff-only <tip>",
                f"shard:       cd {shared} && {shard}",
                f"check:       cd {shared} && {check}",
            ]
        lines += [
            f"push:        git -C {shared} fetch origin; verify origin/main, lock token, HEAD == checked commit; "
            f"git -C {shared} push origin main",
        ]
    if batch and not batch.get("closing"):
        lines += ["# The batch stays open: no snapshot, no baseline. The lock stays held, idle, for the next lander."]
    else:
        lines += [
            "# Only when Plans/ changed" + (" anywhere in the batch" if batch else "") + ", under the same lock:",
            f"fu-prepare:  git -C {base_repo} worktree add --no-checkout -b plans/snapshot-<date>-<id>-1 {fu_wt} origin/main; "
            f"checkout; ln -s {cfg.symlink_target} {SYMLINK_INPUT}; copy the ignored Plans/.audits inputs",
            f"fu-snapshot: cd {fu_wt} && {shlex.join(SNAPSHOT)} --run-id pds-<date>-<next>-current-planunit-snapshot "
            "--expected-doc-count <Plans/*.md> --supersedes-run-id <current run>",
            f"fu-baseline: cd {fu_wt} && {shlex.join(LANDING_CHECK)} --record-baseline",
            f"fu-commit:   git -C {fu_wt} add Plans/.plan_migration {BASELINE_FILE}; commit; git -C {fu_wt} push -u origin HEAD",
            f"fu-land:     the same dirty-check, ff, shard and landing check (--base origin/main: {fu_check}), push",
            f"fu-remove:   git -C {base_repo} worktree remove {fu_wt}; git -C {base_repo} branch -d <its branch>",
        ]
    if branch is not None:
        if st.get("keep_worktree"):
            lines += [f"worktree:    kept: {wt} (--keep-worktree)"]
        else:
            lines += [f"worktree:    git worktree remove {wt}; git branch -d {branch}   (not if this process runs inside it)"]
    lines += [f"release:     rm -r {cfg.held}" if not (batch and not batch.get("closing"))
              else "release:     not yet: the batch holds it"]
    return lines


# ---------------------------------------------------------------------------------------------------------
# Commands.
# ---------------------------------------------------------------------------------------------------------

def git_out(cwd: Any, *args: str) -> Optional[str]:
    result = subprocess.run(["git", "-C", str(cwd), *args], capture_output=True, text=True, errors="replace")
    return result.stdout.strip() if result.returncode == 0 else None


def common_dir(path: Any) -> Optional[str]:
    out = git_out(path, "rev-parse", "--path-format=absolute", "--git-common-dir")
    return os.path.realpath(out) if out else None


def find_worktree(cfg: Config, branch: str, given: Optional[str]) -> Optional[str]:
    if given:
        return str(Path(given).expanduser().resolve())
    here = git_out(os.getcwd(), "rev-parse", "--show-toplevel")
    repos = [item for item in (here, str(cfg.local_repo), str(cfg.shared)) if item]
    for repo in repos:
        listing = git_out(repo, "worktree", "list", "--porcelain")
        if not listing:
            continue
        path = None
        for line in listing.splitlines():
            if line.startswith("worktree "):
                path = line[len("worktree "):]
            elif line == f"branch refs/heads/{branch}" and path:
                return path
    return None


def new_state(cfg: Config, args: argparse.Namespace, branch: Optional[str], worktree: Optional[str]) -> Dict[str, Any]:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", branch or "batch-close").strip("-")[:48]
    landing_id = f"{now_utc().strftime('%Y%m%dT%H%M%SZ')}-{slug}-{uuid.uuid4().hex[:4]}"
    me = os.getpid()
    batch: Optional[Dict[str, Any]] = None
    if getattr(args, "batch_open", False):
        batch = {"role": "open", "start": None, "landings": [], "first_push": None, "closing": False}
    elif getattr(args, "batch_start", None) or getattr(args, "batch_close", False):
        batch = {"role": "close" if args.batch_close else "member", "start": args.batch_start, "landings": [],
                 "first_push": None, "closing": bool(args.batch_close)}
    shared_common = common_dir(cfg.shared) if (cfg.shared / ".git").exists() else None
    return {
        "schema": STATE_SCHEMA, "id": landing_id, "name": getattr(args, "name", None) or "(plan)", "branch": branch,
        "worktree": worktree,
        "same_repo": bool(worktree) and common_dir(worktree) == shared_common,
        "local_same_repo": common_dir(cfg.base_repo()) in (shared_common, common_dir(worktree) if worktree else None),
        "priority": priority_of(cfg, getattr(args, "name", "") or "", branch, getattr(args, "priority", None)),
        "checks_local": bool(getattr(args, "checks_local", False)),
        "readjudicated": bool(getattr(args, "readjudicated", False)),
        "keep_worktree": bool(getattr(args, "keep_worktree", False)),
        "check_args": list(getattr(args, "check_arg", None) or []),
        "wait_timeout": getattr(args, "wait_timeout", None),
        "status": "new", "created": iso(), "updated": iso(), "seq": 1,
        "runner": {"host": hostname(), "pid": me, "pid_start": pid_start(me)}, "child": None,
        "lock": {"token": None}, "ticket": None, "batch": batch, "followup_owed": False, "main_ahead": None,
        "land": {"sha": None, "touched": [], "origin_main": None, "base_arg": None, "ff_sha": None, "pushed": False,
                 "check": None},
        "fu": None, "local_wt": None, "stop": None, "notes": [], "for_jared": [], "timeouts_judged": None, "rows_compared": None,
        "handed_over_by": getattr(args, "handed_over_by", None),
        "config": {"shared": str(cfg.shared), "evidence_dir": str(cfg.evidence_dir), "worktree_root": str(cfg.worktree_root),
                   "local_repo": str(cfg.local_repo)},
        "steps": [],
    }


def validate_batch_args(args: argparse.Namespace) -> None:
    if getattr(args, "batch_open", False) and (args.batch_start or args.batch_close):
        raise Refused("--batch-open starts a batch; it does not combine with --batch-start or --batch-close")
    if args.batch_start and not valid_full_sha(args.batch_start):
        raise Refused(f"--batch-start must be a full 40-character SHA, never a moving name: {args.batch_start!r}")


def validate_check_args(args: argparse.Namespace) -> None:
    """What --check-arg passes on: only what cannot change what the landing check judges."""
    items = list(getattr(args, "check_arg", None) or [])
    allowed = ", ".join(CHECK_ARG_SWITCHES + tuple(CHECK_ARG_VALUES))
    index = 0
    while index < len(items):
        item = items[index]
        index += 1
        name, equals, value = item.partition("=")
        if name in CHECK_ARG_SWITCHES and not equals:
            continue
        if name not in CHECK_ARG_VALUES:
            raise Refused(f"--check-arg {item!r} is not passed on to the landing check. Only these are: {allowed}")
        if not equals:
            value = items[index] if index < len(items) else ""
            index += 1
        if not value or value.startswith("-") or (CHECK_ARG_VALUES[name] and not value.isdigit()):
            raise Refused(f"--check-arg {name} needs " + ("a number" if CHECK_ARG_VALUES[name] else "a value") + f", not {value!r}")


def install_signals() -> None:
    def handler(number: int, frame: Any) -> None:
        raise Interrupted(signal.Signals(number).name)

    for number in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
        signal.signal(number, handler)


def load_states(cfg: Config) -> List[Dict[str, Any]]:
    rows = []
    try:
        names = sorted(cfg.state_dir.glob("*.json"))
    except OSError:
        return rows
    for path in names:
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(doc, dict) and doc.get("schema") == STATE_SCHEMA:
            rows.append(doc)
    return rows


FINAL = ("done", "aborted")


def pick_landing(cfg: Config, landing_id: Optional[str], branch: Optional[str]) -> Dict[str, Any]:
    states = load_states(cfg)
    if landing_id:
        for doc in states:
            if doc["id"] == landing_id:
                return doc
        raise Refused(f"no landing {landing_id} in {cfg.state_dir}")
    open_rows = [doc for doc in states if doc.get("status") not in FINAL]
    if branch:
        open_rows = [doc for doc in open_rows if doc.get("branch") == branch]
    mine = [doc for doc in open_rows if (doc.get("runner") or {}).get("host") == hostname()] or open_rows
    if len(mine) == 1:
        return mine[0]
    if not mine:
        raise Refused("no landing in progress")
    raise Refused("several landings are in progress; name one with --id: " + ", ".join(doc["id"] for doc in mine))


def runner_alive(st: Dict[str, Any]) -> bool:
    runner = st.get("runner") or {}
    return runner.get("host") == hostname() and runner.get("pid") != os.getpid() \
        and same_process(runner.get("pid"), runner.get("pid_start"))


def cmd_plan(cfg: Config, args: argparse.Namespace) -> int:
    validate_batch_args(args)
    validate_check_args(args)
    worktree = find_worktree(cfg, args.branch, args.worktree)
    st = new_state(cfg, args, args.branch, worktree)
    print(f"plan for {args.branch} (nothing below has run; worktree: {worktree or 'NOT FOUND: pass --worktree'})")
    if st["checks_local"]:
        print(f"# {CHECKS_LOCAL_NOTE}")
    for line in plan_lines(cfg, st):
        print(line)
    if worktree:
        names = git_out(worktree, "diff", "--name-only", "origin/main...HEAD")
        if names is not None:
            paths = [line for line in names.splitlines() if line]
            print(f"# Against the origin/main this repository has now: {len(paths)} paths, "
                  f"{sum(1 for path in paths if path.startswith('Plans/'))} under Plans/.")
    return EXIT_OK


def cmd_run(cfg: Config, args: argparse.Namespace) -> int:
    validate_batch_args(args)
    validate_check_args(args)
    if not args.name:
        raise Refused("--name is required: holder.txt names the agent")
    branch = args.branch
    if branch is None and not args.batch_close:
        raise Refused("name a branch, or use --batch-close to close the batch you hold")
    worktree = None
    if branch is not None:
        worktree = find_worktree(cfg, branch, args.worktree)
        if not worktree:
            raise Refused(f"{branch} is not checked out in a worktree I can find; pass --worktree")
        for doc in load_states(cfg):
            if doc.get("branch") == branch and doc.get("status") not in FINAL:
                raise Refused(f"landing {doc['id']} of {branch} is {doc.get('status')}: `resume` or `abort` it")
    if not (cfg.shared / ".git").exists():
        raise Refused(f"no shared checkout at {cfg.shared}")
    st = new_state(cfg, args, branch, worktree)
    if args.batch_start or args.batch_close:
        holder = parse_holder(read_holder_text(cfg) or "")
        if not cfg.held.is_dir() or not valid_full_sha(holder.get("batch-start")):
            raise Refused("no batch is open: holder.txt names no full batch-start")
        if args.batch_start and args.batch_start != holder["batch-start"]:
            raise Refused(f"--batch-start {args.batch_start} is not the open batch's {holder['batch-start']}")
        if not args.batch_start and holder.get("agent") != args.name:
            raise Refused(f"the open batch is {holder.get('agent')}'s; pass its --batch-start to land in it or close it")
    if branch is None:
        st["steps"] = [new_step("lock", None), new_step("close-fetch", "land"), new_step("followup-decide", None),
                       new_step("local-remove", None), new_step("finish", None)]
    else:
        st["steps"] = [new_step(name, "land" if name in TARGET_STEPS else None) for name in landing_steps(st["checks_local"])]
    lander = Lander(cfg, st)
    install_signals()
    lander.save()
    say(f"landing {st['id']}: {branch or 'closing a batch'} as {st['name']}, priority {st['priority']}"
        + (", checks in a local copy" if st["checks_local"] else ""))
    if st["checks_local"]:
        say(CHECKS_LOCAL_NOTE)
    return lander.drive()


def cmd_resume(cfg: Config, args: argparse.Namespace) -> int:
    st = pick_landing(cfg, args.id, args.branch)
    if st.get("status") in FINAL:
        print(f"landing {st['id']} is {st['status']}: nothing to resume")
        return EXIT_OK
    if runner_alive(st):
        raise Refused(f"landing {st['id']} is still running as pid {st['runner']['pid']}: see `status`")
    runner = st.get("runner") or {}
    if runner.get("host") not in (None, hostname()):
        raise Refused(f"landing {st['id']} ran on {runner.get('host')}: its worktrees are there, resume it there")
    me = os.getpid()
    st["runner"] = {"host": hostname(), "pid": me, "pid_start": pid_start(me)}
    if args.readjudicated:
        st["readjudicated"] = True
    if args.timeouts_judged:
        st["timeouts_judged"] = args.timeouts_judged
    if args.rows_compared:
        st["rows_compared"] = args.rows_compared
    if args.handed_over_by:
        st["handed_over_by"] = args.handed_over_by
    if args.wait_timeout is not None:
        st["wait_timeout"] = args.wait_timeout
    lander = Lander(cfg, st)
    install_signals()
    say(f"resuming {st['id']}")
    try:
        lander.reverify()
    except Stop as stop:
        lander.after_stop(stop, None)
        return EXIT_STOPPED
    return lander.drive()


def cmd_abort(cfg: Config, args: argparse.Namespace) -> int:
    st = pick_landing(cfg, args.id, args.branch)
    if st.get("status") in FINAL:
        print(f"landing {st['id']} is {st['status']}: nothing to abort")
        return EXIT_OK
    runner = st.get("runner") or {}
    if runner_alive(st):
        say(f"stopping pid {runner['pid']}")
        os.kill(int(runner["pid"]), signal.SIGTERM)
        for _ in range(60):
            if not runner_alive(st):
                break
            time.sleep(0.5)
        if runner_alive(st):
            raise Refused(f"pid {runner['pid']} did not stop; nothing else was changed")
        st = pick_landing(cfg, st["id"], None)
    elif runner.get("host") not in (None, hostname()):
        raise Refused(f"landing {st['id']} ran on {runner.get('host')}: abort it there")
    lander = Lander(cfg, st)
    lander.kill_orphan_child()
    if st.get("ticket"):
        try:
            (cfg.queue_dir / f"t-{st['ticket']}.json").unlink()
        except OSError:
            pass
        st["ticket"] = None
    lander.reset_if_ahead()
    ahead = st.get("main_ahead") or lander.shared_ahead()
    if ahead:
        print(f"CRITICAL: the shared checkout's main is still ahead at {ahead}; fix that by hand "
              "(git reset --keep origin/main) before anyone lands.", flush=True)
        if lander.holds_lock():
            # The rule's "never left ahead" needs a holder who must fix it. Not aborted, so this landing can be finished.
            lander.idle_holder("stopped")
            st["status"] = "stopped"
            st["runner"] = None
            lander.save()
            print("The lock stays held and nothing else was changed. Fix it, then `abort` again.", flush=True)
            return EXIT_STOPPED
    worktrees = [(st.get("local_wt"), None)]
    fu = st.get("fu") or {}
    if fu.get("worktree") and fu["worktree"] != st.get("local_wt"):
        worktrees.append((fu["worktree"], fu.get("branch")))
    batch = st.get("batch")
    if lander.holds_lock():
        if batch and (batch.get("landings") or batch["role"] != "open"):
            lander.idle_holder("batch-idle")
            say(f"the batch holds the lock: close it with `run --batch-close --batch-start {batch.get('start')}`")
        else:
            lander.release_lock()
    for path, branch in worktrees:
        if path:
            lander.remove_tool_worktree(path, branch)
    st["status"] = "aborted"
    st["runner"] = None
    lander.save()
    if st.get("followup_owed"):
        print("A landing that changed Plans/ was pushed, and its snapshot and baseline follow-up was not done: do it by "
              "hand (reports/landing-checks/README.md) under the lock.", flush=True)
    print(f"aborted {st['id']}.", flush=True)
    return EXIT_OK


def describe_lock(cfg: Config) -> List[str]:
    verdict = judge_holder(cfg)
    if not verdict["held"]:
        return ["lock: free"]
    fields = verdict["fields"]
    lines = [f"lock: HELD by {fields.get('agent', '(unnamed)')} on {fields.get('branch', '?')}; "
             f"{verdict['reason']}" + ("; PROVEN DEAD" if verdict["dead"] else "")]
    if fields.get("batch-start"):
        lines.append(f"  batch-start {fields['batch-start']}: {len(fields.get('batch-landing') or [])} landing(s), "
                     f"first push {fields.get('batch-first-push') or '(none yet)'}")
        if verdict["dead"] and batch_landed(cfg, fields):
            lines.append(f"  it landed something, so it is closed, not cleared: {close_command(fields['batch-start'])}")
    return lines


def describe_queue(cfg: Config) -> List[str]:
    line = waiting_line(cfg)
    if not line:
        return ["queue: empty"]
    return ["queue:"] + [f"  {index + 1}. priority {row.get('priority')} {row.get('name')} {row.get('branch') or ''} "
                         f"on {row.get('host')} pid {row.get('pid')}, waiting since {str(row.get('time'))[:19]}Z"
                         for index, row in enumerate(line)]


def cmd_status(cfg: Config, args: argparse.Namespace) -> int:
    states = load_states(cfg)
    if args.json:
        print(json.dumps({"lock": {k: v for k, v in judge_holder(cfg).items() if k != "text"},
                          "queue": waiting_line(cfg),
                          "landings": states if args.all else [doc for doc in states if doc.get("status") not in FINAL
                                                                or doc.get("id") == args.id]},
                         indent=1, sort_keys=True))
        return EXIT_OK
    for line in describe_lock(cfg) + describe_queue(cfg):
        print(line)
    rows = [doc for doc in states if args.all or doc.get("id") == args.id or doc.get("status") not in FINAL]
    if not rows:
        print("landings: none in progress")
    for doc in rows:
        runner = doc.get("runner") or {}
        alive = runner.get("host") == hostname() and same_process(runner.get("pid"), runner.get("pid_start"))
        where = f"{runner.get('host')} pid {runner.get('pid')}" + (" (running)" if alive else "") if runner else "no process"
        print(f"\nlanding {doc['id']}: {doc.get('branch') or 'closing a batch'} by {doc.get('name')}, {doc.get('status')}, "
              f"{where}, updated {doc.get('updated')}")
        batch = doc.get("batch")
        if batch:
            print(f"  batch-start {batch.get('start')}: {len(batch.get('landings') or [])} landing(s)"
                  + (", closing" if batch.get("closing") else ""))
        if doc.get("main_ahead"):
            print(f"  CRITICAL: shared checkout's main left ahead of origin at {doc['main_ahead']}")
        if doc.get("followup_owed"):
            print("  the snapshot and baseline follow-up is owed")
        for step in doc.get("steps") or []:
            target = f" ({step['target']})" if step.get("target") == "fu" else ""
            print(f"  {step['status']:8s} {step['name']}{target}" + (f"  {step.get('started', '')}" if step['status'] == 'running' else ""))
        child = doc.get("child")
        if child:
            print(f"  running: pid {child.get('pid')} {' '.join(child.get('command') or [])}\n  log: {child.get('log')}")
        stop = doc.get("stop")
        if stop:
            print(f"  STOPPED at {stop.get('step')}: {stop.get('code')}: {stop.get('message')}")
            for path in (stop.get("files") or [])[:20]:
                print(f"    {path}")
            if stop.get("next"):
                print(f"  next: {stop['next']}")
        for row in (doc.get("for_jared") or []):
            print(f"  for Jared: {row}")
    return EXIT_OK


def cmd_lock(cfg: Config, args: argparse.Namespace) -> int:
    if args.lock_command == "status":
        for line in describe_lock(cfg):
            print(line)
        return EXIT_OK
    if args.lock_command == "queue":
        for line in describe_queue(cfg):
            print(line)
        return EXIT_OK
    if args.lock_command == "take":
        if not args.name:
            raise Refused("--name is required: holder.txt names the agent")
        holder = {"agent": args.name, "branch": args.branch or "(by hand)", "time": iso(), "state": "by-hand", "host": hostname()}
        wait = 0.0 if args.no_wait else args.wait_timeout
        try:
            install_signals()
            acquire_lock(cfg, args.name, args.branch, priority_of(cfg, args.name, args.branch, args.priority), holder, wait)
        except LockWaitTimeout as exc:
            print(f"not taken: {exc}")
            return EXIT_LOCK_TIMEOUT
        except Interrupted as exc:
            print(f"not taken: {exc}")
            return EXIT_LOCK_TIMEOUT
        except BatchOwesClose as exc:
            raise Refused(f"not taken: the lock's holder is dead ({exc.reason}), and its batch {exc.start} landed something. "
                          f"It is closed, not cleared: `{close_command(exc.start)}`") from exc
        print(f"held: {cfg.held}. No heartbeat: the 90-minute rule applies, as for any hand lander. Release: "
              f"pm-land.py lock release --name {shlex.quote(args.name)}, or rm -r {cfg.held}")
        return EXIT_OK
    if args.lock_command == "release":
        if not cfg.held.is_dir():
            print("the lock is free")
            return EXIT_OK
        holder = parse_holder(read_holder_text(cfg) or "")
        if holder.get("agent") != args.name:
            raise Refused(f"the lock is held by {holder.get('agent')!r}, not {args.name!r}: not released")
        if batch_landed(cfg, holder):
            raise Refused(f"not released: this batch landed something and still owes its close and any follow-up. Close it: "
                          f"`{close_command(holder['batch-start'])}`")
        shutil.rmtree(cfg.held)
        print("released")
        return EXIT_OK
    raise Refused(f"unknown lock command {args.lock_command}")


def build_parser() -> argparse.ArgumentParser:
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--shared", help="the landing checkout (default: %s)" % DEFAULT_SHARED)
    common.add_argument("--lock-dir", help="the landing-lock folder (default: %s)" % DEFAULT_LOCK_DIR)
    common.add_argument("--evidence-dir", help="logs and kept reports (default: %s)" % DEFAULT_EVIDENCE_DIR)
    common.add_argument("--worktree-root", help="where full local worktrees go (default: %s)" % DEFAULT_WORKTREE_ROOT)
    common.add_argument("--local-repo", help="the local clone they come from (default: %s)" % DEFAULT_LOCAL_REPO)
    common.add_argument("--poll-seconds", type=float, help="how often a waiter looks at the lock (default: 60)")

    parser = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    sub = parser.add_subparsers(dest="command", required=True)

    def landing_options(item: argparse.ArgumentParser) -> None:
        item.add_argument("--name", help="your agent name, written to holder.txt")
        item.add_argument("--priority", type=int, help="lower goes first; overrides the configured priorities")
        item.add_argument("--worktree", help="the worktree that has the branch checked out (default: found)")
        item.add_argument("--checks-local", action="store_true",
                          help="checks in a full local worktree at the exact commit; the shared checkout only "
                               "fast-forwards and pushes (departs from today's rule: opt-in)")
        item.add_argument("--batch-open", action="store_true", help="open a batch with this landing")
        item.add_argument("--batch-start", metavar="SHA", help="land inside the open batch with this full batch-start")
        item.add_argument("--batch-close", action="store_true", help="close the batch: its one follow-up, then release")
        item.add_argument("--readjudicated", action="store_true", help="you re-read the Plans passages main also changed")
        item.add_argument("--keep-worktree", action="store_true", help="don't remove the branch's worktree afterwards")
        item.add_argument("--handed-over-by", metavar="AGENT",
                          help="--batch-start from a stopped or hand holder: asserts that AGENT handed you the lock by pm-mail")
        item.add_argument("--check-arg", action="append", metavar="ARG",
                          help="pass ARG on to the landing check, e.g. --check-arg=--cache. Only: "
                               + ", ".join(CHECK_ARG_SWITCHES + tuple(CHECK_ARG_VALUES)))
        item.add_argument("--wait-timeout", type=float, help="seconds to wait for the lock (default: no limit)")

    plan = sub.add_parser("plan", parents=[common], help="print every step and its commands; changes nothing")
    plan.add_argument("branch")
    landing_options(plan)
    run = sub.add_parser("run", parents=[common], help="land a branch")
    run.add_argument("branch", nargs="?")
    landing_options(run)
    resume = sub.add_parser("resume", parents=[common], help="re-verify, then continue the landing in progress")
    resume.add_argument("--id")
    resume.add_argument("--branch")
    resume.add_argument("--readjudicated", action="store_true")
    resume.add_argument("--timeouts-judged", metavar="TEXT", help="what you reran for the timed-out subchecks, and what you found")
    resume.add_argument("--rows-compared", metavar="TEXT", help="what you compared with the baseline's rows, and what you found")
    resume.add_argument("--handed-over-by", metavar="AGENT", help="the hand lander who handed you the batch's lock by pm-mail")
    resume.add_argument("--wait-timeout", type=float)
    status = sub.add_parser("status", parents=[common], help="lock, queue, landings; readable by anyone")
    status.add_argument("--id")
    status.add_argument("--all", action="store_true", help="finished landings too")
    status.add_argument("--json", action="store_true")
    abort = sub.add_parser("abort", parents=[common], help="release what it holds; main never ahead of origin")
    abort.add_argument("--id")
    abort.add_argument("--branch")
    lock = sub.add_parser("lock", parents=[common], help="the lock queue, for hand landers too")
    lock.add_argument("lock_command", choices=("status", "queue", "take", "release"))
    lock.add_argument("--name")
    lock.add_argument("--branch")
    lock.add_argument("--priority", type=int)
    lock.add_argument("--no-wait", action="store_true")
    lock.add_argument("--wait-timeout", type=float)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    cfg = config_from(args)
    os.umask(0o002)
    commands = {"plan": cmd_plan, "run": cmd_run, "resume": cmd_resume, "status": cmd_status, "abort": cmd_abort,
                "lock": cmd_lock}
    try:
        return commands[args.command](cfg, args)
    except Refused as exc:
        print(f"pm-land: refused: {exc}", file=sys.stderr)
        return EXIT_REFUSED


if __name__ == "__main__":
    sys.exit(main())
