# Onboarding + Guided Tour research (condensed) — 2026-09-04

Compiled from ~55 sources read by the research pass (NN/g, Apple HIG, Material 3, Fluent, Chameleon 550M-interaction dataset, Produktly 2026 benchmarks, First Round/Superhuman, growth.design teardowns, Emil Kowalski, Rauno Freiberg, Benji Taylor/Family, RFC 8252, GitHub/GitLab/Tailscale/Microsoft docs).

## Principles applied in TestFablePMConcpet
1. Learn by doing; demonstrate only on request (NN/g onboarding-tutorials; Apple HIG onboarding; Superhuman 98% vs 30% completion).
2. ≤5 steps per tour chapter: 3-4 steps complete at 72-74%, 7+ at 16%, 9+ at 8% (Chameleon; Produktly 2026).
3. User-initiated tours complete at 69% vs 23% auto-started; click-triggered 67% vs 31% delay-triggered. Offer the tour, never force it.
4. One coach mark at a time, "x of y" progress, title ≤25 chars, body ≤120 chars leading with why (Fluent Teaching Bubble); tooltip ≤140 chars (Appcues).
5. Wizards save state on exit, resume without re-entry, reuse earlier answers as defaults, help beside fields not over them (NN/g wizards).
6. Reasonable defaults, postpone non-essential setup (Apple HIG). Two disclosure levels max (NN/g progressive disclosure).
7. Explain why we ask, next to the field (Voa Labs). Live preview as answers change; review before the single commit (Notion, Trello +36% activation).
8. End in a real artifact (Calendly link; Superhuman Inbox Zero). Value before accounts (Duolingo +20% DAU; Baymard 10-30% loss).
9. Practice must be consequence-free (Superhuman synthetic inbox). Skip always available; never re-show uninvited; keep findable in Settings (Apple HIG).
10. Advance on the real action, not on Next (Appcues action-driven tooltips; driver.js keeps the highlighted element interactive).
11. Show Me and Do It are different genres: Show Me uses conditional voice ("You can..."), Do It uses imperatives (SAP WalkMe toolkit). The demo animation and the gesture it teaches share the same motion (Apple WWDC 2018 fluid interfaces).
12. Little wins early, big delight reserved for rare moments (Arc; Family delight-impact curve; Apple: no motion on frequent actions).

## Motion cookbook
- UI transitions < 300ms; enters ease-out, exits ease-in and ~20% faster; on-screen moves ease-in-out; never ease-in on enters.
- Material 3: emphasized-decelerate cubic-bezier(0.05,0.7,0.1,1) enters; emphasized-accelerate cubic-bezier(0.3,0,0.8,0.15) exits; standard cubic-bezier(0.2,0,0,1). Durations short 50-200 / medium 250-400 / long 450-600 / ambient 700-1000ms.
- Springs: 100% damping default; ~80% only with gesture momentum. Interruptible and retargetable always.
- Scale enters from ≥0.93, never 0; transform-origin toward the trigger. Stagger 30-40ms across title/body/actions. Symmetric paths (Back mirrors Forward). Never teleport a spotlight; animate cutout position+size 350-450ms critically damped.
- Animate only transform and opacity. Reduced motion: opacity crossfades at the same durations; kill parallax, zooms, loops.
- Disney mapping: staging=spotlight, anticipation=pre-cue, follow-through=stagger, arcs for object travel.

## Copy cookbook
- ≤25 words per sentence, one idea, front-load, sentence case, no "please", no colour-only references (GOV.UK). "Turn on" not "Enable"; numerals; present tense; verbs first (Material, Microsoft). Specific beats vague ("Here's what we'll create. Nothing is saved until you press Create.").

## Auth / NAS automation findings
- GitHub/GitLab sign-in: loopback redirect (RFC 8252, 127.0.0.1 any port) primary; device-code (XXXX-XXXX, 900s, poll) fallback. GitLab device grant GA since 17.9. Never embed the provider in a web view. UI: "Waiting for GitHub... Open browser again / Use a code instead".
- mDNS `_ssh._tcp` discovery only when the host advertises and on the same subnet; always keep "type its name or address".
- SSH: key generation (Ed25519), authorized_keys install, host-key record, verification connect are automatable; the FIRST password prompt is not, nor enabling the SSH server. Windows admin keys go to ProgramData administrators_authorized_keys.
- Host key: present the fingerprint as a "device ID"; remember it; warn loudly only on change.
- Tailscale SSH removes key management entirely when both ends run it; Synology QuickConnect is a UX pattern (one ID, transparent fallback), not a transport.
