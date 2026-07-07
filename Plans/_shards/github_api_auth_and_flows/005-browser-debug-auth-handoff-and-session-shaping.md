# Shard 005: Browser/debug auth handoff and session shaping

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L152-L154

Source SHA256: `bb36d0e03f358c2b87d6c8b91d33f7da5f62c36c45524c34dedaff8146caffd4`

---

## Browser/debug auth handoff and session shaping
- Browser session-shaping actions remain `explicit_confirmation` operations when they mutate cookies, `/storage`, storage `/export` or import state, offline `/mock` routing, or promotion into normal browsing.
- App-debug login handoff normally remains in the same isolated automation session so authenticated state can resume the investigation, while PM-owned provider `/device/login` flows may use a dedicated `auth_session` when that is the canonical provider flow.
