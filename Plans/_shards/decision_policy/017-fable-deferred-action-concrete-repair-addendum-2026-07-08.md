# Shard 017: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Decision_Policy.md`

Source lines: L3370-L3376

Source SHA256: `b6f1362ed05b4bcee76fb6d1326d496a23d2214f5ddab53b8b7d0e0dc3c479f1`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime decision-policy rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-ddc3b84db4941415356ece10`: slash shorthand such as `/model/persona/auth/account` means the policy axis set `{model, persona, auth, account}` and is not a path, URL, or command. New policy records must expand shorthand into explicit `policy_axes[]`.
- Repairs `sfk-99d0a96a18b05ccb17ba5087`: tier-level settings that survive rewrite are named `approval_trigger_policy`. Fields are `policy_id`, `scope`, `trigger_kind`, `threshold`, `owner_doc_ref`, and `created_at_utc`.
- Repairs `sfk-c64e9152559d9556b5b1b077`: Spec Lock updates are performed by `scripts/pm-governance-seal.py refresh`; enforcement points are `python3 scripts/pm-plans-verify.py verify-spec-lock` locally and the corresponding CI gate. Pre-commit hooks may call the verifier but are not the authority.
