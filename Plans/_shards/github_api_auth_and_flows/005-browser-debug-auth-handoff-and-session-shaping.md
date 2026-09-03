# Shard 005: Browser/debug auth handoff and session shaping

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L152-L154

Source SHA256: `3109298d54ea966d7161ce851efa826bbb71ce09feba86cc2cc2b79fdaa307a2`

---

## Browser/debug auth handoff and session shaping
- Browser session-shaping actions remain `explicit_confirmation` operations when they mutate cookies, `/storage`, storage `/export` or import state, offline `/mock` routing, or promotion into normal browsing.
- App-debug login handoff stops automation at `attention_required` and transfers foreground control to a protected human-only `AuthBrowserSession` when interactive authentication is required. PM-owned provider device-login flows may open that protected session only under exact domain policy; protected content/state never returns to automation, artifacts, inspection, persistence, or generic navigation.
