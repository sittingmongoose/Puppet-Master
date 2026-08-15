# Successor deterministic preflight V3 process contract

V3 is an independent attempt. V1 remains `NOT_READY` on `DP-020`; V2 remains `NOT_READY` on `V2-IO-001`. Their failures are immutable lineage inputs and contribute no V3 PASS credit.

All controller writes use `apply_patch` and remain below `tests/agent_packet_restrictions/successor_20260813/v3/`. The qualifying checker is invoked only as `python3 -I -B` with inherited non-regular stdout. It writes no file, creates no temporary or bytecode file, spawns no process, opens no network, and performs no dynamic load. Shell redirection, output files, pipe-to-command, report-producing validators, and provider/model/auth/config paths are prohibited.

Bounded preparation agents are controller assistants, not subjects: medium handles currentness; xhigh handles checker design and adversarial review. No agent receives the whole source universe and none may write.

The checker independently recomputes 19 gates from current bytes. Reports are projections, never terminal inputs. All pass reduces to `READY_FOR_JARED_TEST_PLAN`; any failure, blocked check, drift, mutation, unanswered-question violation, report disagreement, or missing evidence reduces to `NOT_READY`.

An interrupted pre-terminal V3 run resumes only after all inputs, predecessors, zero-call counters, and boundary evidence revalidate. A boundary breach or subject/provider activity permanently fails V3 and requires a new attempt; it cannot be cured within V3.

At READY, stop. Ask Jared to provide the exact models to test and how to test them. Do not select a roster or method, freeze either, compile Plans, or launch any subject.
