# Browser capture companion integration

Status: integrated and verified on repair branch; not landed.

The six-file additive carry materializes the eight already-declared Browser
capture/component request/result routes. It adds the closed schema, fixtures,
semantic checker and focused tests; enrolls contract pair 86; and updates only
the four capture/component Touch profiles and residual rows. Commands and
production Wiring already name these routes and are unchanged. No new Chat
carrier, command, event or native availability is introduced; Touch stays partial.

Evidence root:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/`.

- `case-reconciliation/browser-capture-integration-01/BROWSER-CARRY.patch`,
  SHA-256 `dcdbf73cfc99c8c6283b969edf8c21508ba9698ad29657fcc31579e15e7b3552`.
- Carry review SHA-256
  `c876e33e7784ca977d43f626b189b361aff59ff32e1876534378240c01e78539`.
- `jobs/browser-capture-companion-01/REVIEW-DIFFERENT-SOL-V4.md`, SHA-256
  `b111e3642d8de480fc760acc04663e558f3ba984e0e2eb6d87749d81a45f7b1e`.
- Current-root additive review `DIFFERENT-SOL-CARRY-REVIEW.md` in the carry
  directory, SHA-256
  `ce9be4f45dae9072a3e13d7a5de1d297a7840044ee49d92edb3e65e83779db7e`.

Root file hashes match the reviewed carry except one deterministic integration
correction: the test's older 81-pair expectation becomes 86, preserving an exact
count check. Corrected test SHA-256 is
`b3c3a03f6263d164753f1113432e58f8be6f47144fddd1023b8d7666b4e4f00a`.
A dropped trailing blank line during installation was restored so the semantic
helper matches its frozen SHA-256 exactly. All 17 focused tests now pass, and
the helper checks 14 valid plus 57 invalid fixtures with zero errors. Touch
validation reports only the separately known Settings disposition hash drift.
The full 86-pair run passed with no failures or findings;
`ROOT-86-CONTRACTS.json` is under the carry directory. This is static contract
verification, not a passing repository-wide governance or landing check.

The static digest oracle is deliberately bounded. Shape validation must precede
semantic validation: typed object keys are closed, while arbitrary Unicode-key
objects expose a generic key-order limitation. This helper is not a general
RFC 8785 encoder. Schema-valid numeric forms outside its supported static domain
are declined, not newly prohibited by product policy; native code must handle
the full owner-admitted domain. Fixed-original payload/result mutations reject,
but these supplied-original checks do not authenticate a real issuer, Browser,
Chat adapter, custody, effect, native handler or GUI behavior. The author's last
turn ended cancelled after an unapproved unsafe shell request; no author Goal
completion or V4 author report is claimed.

The representation-query command binding is a separate identified gap under
active repair. This capture companion does not close it or whole Browser work.
