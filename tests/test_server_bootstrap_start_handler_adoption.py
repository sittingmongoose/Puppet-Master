#!/usr/bin/env python3
"""Static regression: one adopted sole future handler for cmd.server.bootstrap.start.

Locks the Server owner adoption of `handlers::server::bootstrap_start` to the two
central consumers (Commands_System, UI_Command_Catalog), the production wiring
row `catalog.server_bootstrap_start`, and the Touch Closure residual
`TOUCH-SRV-027`. Checks are structured on the repository's actual JSON row
shapes wherever one exists. The target name stays dispatch intent only: the
command must remain `handler_unavailable`, keep `expected_event_types=[]`, and
never gain runtime, native-handler, or availability claims from this adoption.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

COMMAND_ID = "cmd.server.bootstrap.start"
SOLE_TARGET = "handlers::server::bootstrap_start"
TARGET_FAMILY_RE = re.compile(r"handlers::server::bootstrap[A-Za-z0-9_]*")
COMMAND_TOKEN_RE = re.compile(r"(?<![A-Za-z0-9_])cmd\.server\.bootstrap\.start(?![A-Za-z0-9_])")

WIRING_ROW_ID = "catalog.server_bootstrap_start"
TOUCH_ID = "TOUCH-SRV-027"
TOUCH_PROFILE = "TCP-SERVER-SUPPLEMENTAL"

CLEARED_WIRING_DISPATCHER_REQUIREMENT = (
    "Prove exact request/result reaches only handlers::server::bootstrap_start; "
    "the target string is not handler evidence."
)
CLEARED_TOUCH_RESIDUAL = (
    "Static owner/schema/fixtures, central catalog registration, production-intent wiring, and "
    "Product Onboarding/Settings reverse consumers exist; native bootstrap handler, "
    "execution-baseline and durable mount execution, and runtime evidence are absent."
)
SRV_005_ADOPTION_CRITERION = (
    "- cmd.server.bootstrap.start adopts exactly one sole future handler target, "
    "handlers::server::bootstrap_start, adjudicated in owner section 4.2"
)
SRV_005_TOKEN_LINE = (
    "preserved_exact_tokens: [permanent web UI, Stop Server, restart, dormant, loopback, "
    "cmd.server.bootstrap.start, handlers::server::bootstrap_start, execution_form]"
)


def find_repository_root(start: Path) -> Path:
    for candidate in (start, *start.parents):
        if (candidate / "Plans" / "00-plans-index.md").is_file():
            return candidate
    raise RuntimeError(f"cannot locate PuppetMaster repository root from {start}")


ROOT = find_repository_root(Path(__file__).resolve().parent)


def read_plans(name: str) -> str:
    return (ROOT / "Plans" / name).read_text(encoding="utf-8")


def load_plans_json(name: str) -> dict:
    return json.loads((ROOT / "Plans" / name).read_text(encoding="utf-8"))


def require(condition: bool, detail: str) -> None:
    if not condition:
        raise AssertionError(detail)


def wiring_bootstrap_failures() -> list[str]:
    failures: list[str] = []
    matrix = load_plans_json("Wiring_Matrix.production.json")
    entries = matrix.get("entries")
    if not isinstance(entries, dict) or WIRING_ROW_ID not in entries:
        return [f"missing production wiring row {WIRING_ROW_ID}"]
    row = entries[WIRING_ROW_ID]

    def check(condition: bool, detail: str) -> None:
        if not condition:
            failures.append(detail)

    check(row.get("ui_element_id") == WIRING_ROW_ID, "ui_element_id must equal the row key")
    check(row.get("ui_command_id") == COMMAND_ID, f"row must bind exactly {COMMAND_ID}")
    check(
        row.get("handler_location") == SOLE_TARGET,
        f"row handler_location must be the adopted sole target {SOLE_TARGET}",
    )
    supplemental = "Plans/server_system_contracts.schema.json#/$defs/"
    check(
        row.get("request_schema_ref") == supplemental + "supplemental_command_payload",
        "request_schema_ref must stay the supplemental owner payload",
    )
    check(
        row.get("result_schema_ref") == supplemental + "supplemental_command_result",
        "result_schema_ref must stay the supplemental owner result",
    )
    check(
        row.get("expected_event_types") == [],
        "expected_event_types must remain empty; no EventRecord is admitted",
    )
    check(
        row.get("state_selector") == "state.commands.server_bootstrap_start.availability",
        "state_selector must stay the exact availability projection",
    )
    check(
        row.get("disabled_reason_projection")
        == "state.commands.server_bootstrap_start.disabled_reason",
        "disabled_reason_projection must stay the exact disabled projection",
    )
    effect = row.get("effect_contract")
    check(isinstance(effect, dict) and effect.get("effect_kind") == "receipt", "effect_kind must stay receipt")
    check(
        isinstance(effect, dict)
        and set(effect.get("receipt_or_event_refs", []))
        >= {"SupplementalCommandResult.receipt", "SupplementalCommandResult.observable_work"},
        "effect contract must keep the supplemental receipt and ObservableWork refs",
    )
    test_evidence = row.get("test_evidence")
    kinds = {item.get("evidence_kind") for item in test_evidence} if isinstance(test_evidence, list) else set()
    check(
        {"dispatcher_fixture", "state_projection", "receipt_or_event_assertion", "accessibility_regression"}
        <= kinds,
        "all four static test-evidence kinds must remain present",
    )
    dispatcher = next(
        (item for item in test_evidence or [] if item.get("test_id") == f"wiring.{WIRING_ROW_ID}.dispatcher"),
        {},
    )
    check(
        dispatcher.get("requirement") == CLEARED_WIRING_DISPATCHER_REQUIREMENT,
        "dispatcher test must name the adopted sole target without pending owner adjudication",
    )
    check(
        bool(row.get("event_test_requirements")),
        "no-event row must retain its no-persist test requirement",
    )

    row_text = json.dumps(row, ensure_ascii=False)
    check("adjudication" not in row_text, "stale target-adjudication text must be gone from the wiring row")
    check("handler_unavailable" in row_text, "wiring row must keep the handler_unavailable fail-closed state")
    check(
        "not native dispatcher or handler proof" in row_text,
        "wiring row must keep the no-native-proof boundary",
    )

    same_command = [
        (key, other)
        for key, other in entries.items()
        if isinstance(other, dict) and other.get("ui_command_id") == COMMAND_ID
    ]
    check(len(same_command) == 1, f"{COMMAND_ID} must keep exactly one production row, found {len(same_command)}")
    competing = [
        key
        for key, other in entries.items()
        if isinstance(other, dict) and TARGET_FAMILY_RE.fullmatch(str(other.get("handler_location", "")))
    ]
    check(
        competing == [WIRING_ROW_ID],
        f"sole bootstrap wiring target must exist only on {WIRING_ROW_ID}, found {competing}",
    )
    return failures


def touch_bootstrap_failures() -> list[str]:
    failures: list[str] = []
    closure = load_plans_json("touch_closure.json")
    columns = closure.get("row_columns")
    if columns != ["touch_id", "profile_id", "action_kind", "action_id", "disposition", "residual_risk"]:
        return [f"unexpected touch row shape: {columns!r}"]

    def check(condition: bool, detail: str) -> None:
        if not condition:
            failures.append(detail)

    rows = [row for row in closure.get("rows", []) if isinstance(row, list) and len(row) == 6 and row[0] == TOUCH_ID]
    check(len(rows) == 1, f"expected exactly one {TOUCH_ID} row, found {len(rows)}")
    for row in rows:
        touch_id, profile_id, action_kind, action_id, disposition, residual = row
        check(profile_id == TOUCH_PROFILE, f"{TOUCH_ID} must stay in {TOUCH_PROFILE}")
        check(action_kind == "command", f"{TOUCH_ID} must stay a command obligation")
        check(action_id == COMMAND_ID, f"{TOUCH_ID} must stay bound to {COMMAND_ID}")
        check(disposition == "partial", f"{TOUCH_ID} must stay partial, found {disposition!r}")
        check(residual == CLEARED_TOUCH_RESIDUAL, f"{TOUCH_ID} residual must carry only the cleared text")
        check("adjudication" not in residual, "stale target-adjudication text must be gone from the touch residual")
        check("native bootstrap handler" in residual, "residual must keep the absent native bootstrap handler")
        check("runtime evidence are absent" in residual, "residual must keep runtime evidence absent")

    stale = [
        row[0]
        for row in closure.get("rows", [])
        if isinstance(row, list) and len(row) == 6 and "target-name adjudication" in str(row[5])
    ]
    check(stale == [], f"no touch row may keep target-name adjudication text, found {stale}")

    profiles = [
        profile
        for profile in closure.get("profiles", [])
        if isinstance(profile, dict) and profile.get("profile_id") == TOUCH_PROFILE
    ]
    check(len(profiles) == 1, f"expected exactly one {TOUCH_PROFILE} profile")
    for profile in profiles:
        check(profile.get("handler_status") == "specified", "supplemental profile must keep handler_status specified")
        check(
            "Plans/Server_System.md#4.2" in profile.get("requirement_refs", []),
            "supplemental profile must keep the Server owner 4.2 requirement ref",
        )
        check(
            "handler_unavailable" in profile.get("disabled_reason_rule", ""),
            "supplemental profile must keep handler_unavailable disabled reasons",
        )
        check(
            "ServerBootstrapService" in profile.get("handler_owner", "")
            and "single specified owner route" in profile.get("handler_owner", ""),
            "supplemental profile must keep ServerBootstrapService as the single specified owner route",
        )
    return failures


def server_owner_failures() -> list[str]:
    failures: list[str] = []
    text = read_plans("Server_System.md")

    def check(condition: bool, detail: str) -> None:
        if not condition:
            failures.append(detail)

    start_marker = "### 4.2 Pairing, trust, and bootstrap owner-command closure"
    end_marker = "### 4.3 UI projection grammar"
    try:
        start_at = text.index(start_marker)
        span = text[start_at : text.index(end_marker, start_at)]
    except ValueError:
        return ["Server owner section 4.2 markers are missing"]

    check(
        "adopts exactly one sole future handler target for `cmd.server.bootstrap.start`" in span,
        "owner section 4.2 must adopt the sole future handler target",
    )
    check(span.count(f"`{SOLE_TARGET}`") == 1, "owner section 4.2 must name the sole target exactly once")
    check(
        "pairing issuance stays a separate contract that is never bootstrap authority" in span,
        "owner adoption must keep pairing issuance independent of bootstrap authority",
    )
    check(
        "`handler_unavailable`" in span and "`expected_event_types=[]`" in span,
        "owner adoption must keep handler_unavailable and empty expected events",
    )
    check(
        "proves no native dispatcher, executable handler, durable effect, or receipt" in span,
        "owner adoption must disclaim native/runtime proof",
    )

    targets = TARGET_FAMILY_RE.findall(text)
    check(
        targets == [SOLE_TARGET, SOLE_TARGET, SOLE_TARGET],
        f"exactly the one bootstrap target may exist (section 4.2, SRV-005 criterion, SRV-005 tokens), found {targets}",
    )
    check(
        "Exact sole future handler set:" in text
        and "bootstrap" not in text.split("Exact sole future handler set:", 1)[1].splitlines()[0],
        "the 25-command addendum handler set must not gain bootstrap",
    )
    check(
        "bootstrap" not in text.split("Exact command set:", 1)[1].splitlines()[0],
        "the 25-command addendum command set must not gain bootstrap",
    )

    unit_start = text.find("### SRV-005 - Permanent Server And Client Continuity")
    unit_end = text.find("### SRV-006", unit_start)
    check(unit_start >= 0 and unit_end > unit_start, "SRV-005 PlanUnit block must stay present")
    if unit_start >= 0 and unit_end > unit_start:
        unit = text[unit_start:unit_end]
        check(
            SRV_005_ADOPTION_CRITERION in unit,
            "SRV-005 acceptance criteria must adopt the exact sole target",
        )
        check(SRV_005_TOKEN_LINE in unit, "SRV-005 preserved_exact_tokens must carry the adopted target")
    return failures


def central_consumer_failures() -> list[str]:
    failures: list[str] = []

    def check(condition: bool, detail: str) -> None:
        if not condition:
            failures.append(detail)

    for name in ("Commands_System.md", "UI_Command_Catalog.md"):
        text = read_plans(name)
        rows = [
            line
            for line in text.splitlines()
            if line.startswith(f"| `{COMMAND_ID}` |")
        ]
        check(len(rows) == 1, f"{name} must keep exactly one {COMMAND_ID} table row, found {len(rows)}")
        for row in rows:
            check(
                f"`{SOLE_TARGET}`" in row,
                f"{name} row must keep the adopted sole target",
            )
        targets = TARGET_FAMILY_RE.findall(text)
        check(
            set(targets) == {SOLE_TARGET},
            f"{name} must reference only the adopted bootstrap target, found {sorted(set(targets))}",
        )
        check(
            "adjudication" not in " ".join(rows),
            f"{name} row must not carry target-adjudication text",
        )
    return failures


def schema_disposition_failures() -> list[str]:
    failures: list[str] = []
    schema = load_plans_json("server_system_contracts.schema.json")
    contract = (schema.get("x-supplemental-command-contracts") or {}).get(COMMAND_ID)
    if not isinstance(contract, dict):
        return [f"missing supplemental command contract for {COMMAND_ID}"]

    def check(condition: bool, detail: str) -> None:
        if not condition:
            failures.append(detail)

    check(
        contract.get("native_handler_status") == "not_proven",
        "adoption must leave native_handler_status not_proven",
    )
    check(
        contract.get("central_registration_status") == "pending_central_integration",
        "adoption must leave central_registration_status pending_central_integration",
    )
    check(
        str(contract.get("default_availability", "")).startswith("disabled_"),
        "adoption must leave the default availability disabled",
    )
    check(
        contract.get("observable_work") == "required",
        "adoption must keep the ObservableWork requirement",
    )
    check(
        contract.get("receipt_ref") == "#/$defs/server_bootstrap_receipt",
        "adoption must keep the exact server bootstrap receipt ref",
    )
    return failures


def cross_source_failures() -> list[str]:
    target_bearing = {
        "Server owner": read_plans("Server_System.md"),
        "Commands_System": read_plans("Commands_System.md"),
        "UI_Command_Catalog": read_plans("UI_Command_Catalog.md"),
        "Wiring": json.dumps(load_plans_json("Wiring_Matrix.production.json"), ensure_ascii=False),
    }
    touch_text = json.dumps(load_plans_json("touch_closure.json"), ensure_ascii=False)
    failures: list[str] = []
    for name, text in {**target_bearing, "Touch": touch_text}.items():
        if not COMMAND_TOKEN_RE.search(text):
            failures.append(f"{name} must reference the exact command {COMMAND_ID}")
    for name, text in target_bearing.items():
        targets = set(TARGET_FAMILY_RE.findall(text))
        if targets != {SOLE_TARGET}:
            failures.append(f"{name} bootstrap target set must be exactly {{{SOLE_TARGET}}}, found {sorted(targets)}")
    competing = set(TARGET_FAMILY_RE.findall(touch_text))
    if competing:
        failures.append(f"Touch must not mint a competing bootstrap target, found {sorted(competing)}")
    return failures


def main() -> int:
    failures: list[str] = []
    for gather in (
        wiring_bootstrap_failures,
        touch_bootstrap_failures,
        server_owner_failures,
        central_consumer_failures,
        schema_disposition_failures,
        cross_source_failures,
    ):
        section = gather.__name__
        section_failures = gather()
        for failure in section_failures:
            failures.append(f"{section}: {failure}")
    if failures:
        print(f"FAIL: {len(failures)} server bootstrap handler adoption regression failure(s):")
        for failure in failures:
            print(f"  - {failure}")
        return 1
    print(
        "OK: cmd.server.bootstrap.start keeps exactly one adopted sole future target "
        f"{SOLE_TARGET} across Server owner, Commands_System, UI_Command_Catalog, Wiring, and Touch; "
        "target-adjudication residual is cleared and no runtime or availability claim was added."
    )
    return 0


def test_server_bootstrap_start_handler_adoption() -> None:
    failures: list[str] = []
    for gather in (
        wiring_bootstrap_failures,
        touch_bootstrap_failures,
        server_owner_failures,
        central_consumer_failures,
        schema_disposition_failures,
        cross_source_failures,
    ):
        failures.extend(f"{gather.__name__}: {failure}" for failure in gather())
    assert not failures, "server bootstrap handler adoption regression failed:\n" + "\n".join(
        f"  - {failure}" for failure in failures
    )

if __name__ == "__main__":
    sys.exit(main())
