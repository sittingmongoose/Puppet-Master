# Puppet Master

Puppet Master is being rebuilt from the ground up from the canonical `Plans/` specification. The previous Rust/Iced application and installer stack were intentionally removed from this clean repo snapshot.

## Current source of truth

- Canonical product/build plans: `Plans/**/*.md`
- Contracts, gates, and governance rules: `Plans/Contracts_V0.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/Spec_Lock.json`
- Shard/navigation outputs: `Plans/_shards/**`
- Build-governance evidence: `Plans/.evidence/**`
- Preserved source ledgers: `Plans/ledgers/**`

## Implementation status

No active application code is present in this clean repository snapshot. The next implementation is intended to be a Rust + Slint rewrite driven by the Plans. Legacy references to the old Iced/Rust implementation inside Plans are historical anchors unless a current Plans section explicitly adopts them.

## Verification

Run:

```bash
python3 scripts/pm-plans-verify.py run-gates
```

For shard-specific checks:

```bash
python3 scripts/pm-shard-plans.py --check
```
