# FileSafe Fail-Closed Security Repair - FABLE 20260706

Generated: 2026-07-07T20:26:31Z

## Scope

This repair closes the FABLE P0 FileSafe fail-open and allowlist security finding:
`fable-20260706-p0-filesafe-fail-open-and-allowlist-security`.

The scope is limited to FileSafe fail-closed security semantics, scoped Contracts_V0 FileSafe
event and receipt payloads, affected FileSafe PlanUnits, a FileSafe-specific validator, and
closure hygiene for the stale GUI toolkit mechanical registry row. It does not repair tier
vocabulary, UI command catalog gaps, wiring matrix gaps, broad Contracts_V0 drift, Goal Runtime,
Executor Protocol, missing referenced docs, or broad PlanUnit boilerplate.

## Canonical Security Decisions

- FileSafe guard initialization failure is blocking and emits `filesafe.guard_init_failed`.
- Missing or empty allowlists fail closed even when `strict_mode=false`.
- Missing destructive baselines fail closed; embedded fallback patterns are the minimum baseline.
- Approved command matching is exact after normalization. `git status` does not approve
  `git status && rm -rf /`.
- Prefix, substring, `starts_with`, shell-fragment, fuzzy, prompt-expanded, and concatenated
  approvals are retired for active enforcement.
- `PUPPET_MASTER_ALLOW_DESTRUCTIVE=1` is only a request signal. It never authorizes destructive
  action without authenticated grant, auth realm, operator identity, reason, scope, expiry,
  security event, and receipt.
- Prompt/free-text command and path extraction is advisory defense-in-depth only.
- Realpath/case-fold/symlink checks cover non-existent create targets and TOCTOU rechecks before
  mutation/open/spawn/promote.
- Retired fail-open snippets such as `BashGuard::disabled()` and `SecurityFilter::disabled()` are
  source-lineage only and cannot be copied as implementation guidance.

## Owner Changes

- `Plans/FileSafe.md` now owns the fail-closed behavior contract, exact command identity boundary,
  destructive override receipt requirements, strict-mode allowlist boundary, embedded fallback
  baseline, path canonicalization edge cases, and updated FileSafe PlanUnits.
- `Plans/Contracts_V0.md` now defines FileSafe fail-closed EventRecord payload minima and
  destructive override receipt fields.
- `scripts/pm-plans-verify.py` now includes `validate-filesafe-security-policy` and wires it into
  `run-gates` and audit-governance output.
- `scripts/pm-audit-closure.py` now recognizes the dedicated one-row
  `filesafe_fail_closed_security_findings.jsonl` artifact as default FABLE closure coverage.

## Closure Evidence

- `Plans/.audits/fable-20260706/filesafe_fail_closed_security_findings.jsonl`
- `Plans/.audits/fable-20260706/filesafe_fail_closed_security_repair_report.json`
- `Plans/.audits/fable-20260706/repair_closure_matrix.jsonl`
- `Plans/.audits/fable-20260706/repair_impact_matrix.jsonl`
- `Plans/.audits/fable-20260706/buildability_repair_registry.jsonl`
- `Plans/.audits/fable-20260706/currentness_check_report.json`
- `Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md`

## Validation Owner

The dedicated validator is:

```bash
python3 scripts/pm-plans-verify.py validate-filesafe-security-policy
```

This validator checks the active FileSafe and Contracts_V0 canon for blocking init failure,
exact command matching, env-var-alone rejection, strict-mode fail-closed allowlists, prompt/free-text
advisory wording, destructive override receipt fields, FileSafe event payloads, and retired disabled
guard snippet fencing.
