# Assistant Chat Concepts — Grok 4.5

Isolated concept workspace for Puppet Master Assistant Chat. Eight **window** modules × eight **thread** modules (any thread mounts in any window), labeled **Grok 4.5**.

## How to view

Needs an http origin (not `file://`):

```bash
cd Concepts/chat-assistant-concepts/grok-4-5
python3 -m http.server 8000
# open http://localhost:8000
```

## Isolation

All work stays under this folder. Do not edit `Plans/**`, PMConcept7, catalogs, wiring, schemas, DRY, or Usage redesign from here. Spec conflicts go to [`SPEC_GAPS.md`](./SPEC_GAPS.md) only.

## Verification

Ephemeral probes live under `%TEMP%/pm-grok45-probes/` (not shipped). Durable reports: seven packet files at this folder root + [`FINDINGS.md`](./FINDINGS.md). Cache bust: `?v=37`.
