# Shard 005: Executive Summary

Source: `Plans/human-in-the-loop.md`

Source lines: L127-L134

Source SHA256: `67c98fa13cd8e2aaf485c8441d2da07bfd1349927930ecc7e3675e2a43028237`

---

## Executive Summary

**Human-in-the-Loop (HITL) mode** lets the user require explicit human approval at configured package or seam decision points. Phase, task, and subtask toggles remain user-facing grouping controls, but runtime approval binds to `package_complete_gate`, `seam_complete_gate`, and the current blocked episode rather than to a tier-local identity. All HITL toggles are **off by default**.

**Critical autonomy rule:** HITL is an optional product UX feature. It MUST NOT be required for correctness, verification, or progression gates; autonomous runs proceed deterministically without any human approvals.  
ContractRef: PolicyRule:Decision_Policy.md§4, Gate:GATE-001

**Use cases:** Optional package/seam approval pauses for stakeholders (when explicitly enabled by the user).
