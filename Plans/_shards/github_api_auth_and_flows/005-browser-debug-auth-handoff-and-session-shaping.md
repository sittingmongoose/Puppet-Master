# Shard 005: Browser/debug auth handoff and session shaping

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L121-L123

Source SHA256: `32b5e5b19be60784a5bf8d23de9b82d5af02249906cd2b65834b12450d631751`

---

## Browser/debug auth handoff and session shaping
- Browser session-shaping actions remain `explicit_confirmation` operations when they mutate cookies, `/storage`, storage `/export` or import state, offline `/mock` routing, or promotion into normal browsing.
- App-debug login handoff normally remains in the same isolated automation session so authenticated state can resume the investigation, while PM-owned provider `/device/login` flows may use a dedicated `auth_session` when that is the canonical provider flow.
