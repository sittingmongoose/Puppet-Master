# Shard 005: Browser/debug auth handoff and session shaping

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L152-L154

Source SHA256: `9a1b15ff570170004e106ad168572e399378dfbe596bbd6d66b10f9e5437e899`

---

## Browser/debug auth handoff and session shaping
- Browser session-shaping actions remain `explicit_confirmation` operations when they mutate cookies, `/storage`, storage `/export` or import state, offline `/mock` routing, or promotion into normal browsing.
- App-debug login handoff stops automation at `attention_required` and transfers foreground control to a protected human-only `AuthBrowserSession` when interactive authentication is required. PM-owned provider device-login flows may open that protected session only under exact domain policy; protected content/state never returns to automation, artifacts, inspection, persistence, or generic navigation.
