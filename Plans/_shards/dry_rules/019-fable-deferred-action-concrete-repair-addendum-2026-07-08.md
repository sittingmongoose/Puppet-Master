# Shard 019: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/DRY_Rules.md`

Source lines: L2210-L2215

Source SHA256: `193ec4e4be174ed616d752a7772ac46ae739f451217df8f2ee945ee04ae73b86`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime DRY rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f265ed0e6287bed7e8ddb7cc`: the reference implementation path for text-normalization checks is `scripts/pm-plans-verify.py lint-contractrefs` for owner/ContractRef integrity and the DRY normalization algorithm embedded in `Plans/DRY_Rules.md` Section 7.1. CI/local enforcement is through `python3 scripts/pm-plans-verify.py run-gates`; future extraction to a dedicated script must preserve the same six-step algorithm.
  - Corrected 2026-11-25: `lint-contractrefs` (and therefore `run-gates`) checks ContractRef reference spelling and paths; it does not run the section 7.1 packet-text versus file-text comparison, so it is not that algorithm's implementation. The normative definition is the code and the nine vectors in section 7.1. `scripts/pm-packet-fidelity-match.py` is that script: it reproduces that code's result on every input and passes all nine vectors (`--self-test`), and any replacement must do the same before VERIFIER packet preflight or SCRIBE self-check may rely on it.
