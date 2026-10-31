# DL-259 owner rulings — Jared, 2026-10-31

**All four owner questions are answered.** REMOTE-CODE-1 intentionally schedules protocol verification immediately before building PM; it is not an unanswered owner choice or a wizard caveat. Source: DECISIONS-ONBOARDING.md, “Owner questions, Jared 2026-10-31”. No new command, payload field, setting, event or storage family is admitted.

| ID | Jared’s ruling | Canon / companion result |
|---|---|---|
| **CERT-1** | Neither selector option. “Dont we just generate the proxy conf for them? They deal with signing and certs on their own systems.” | RAS-005, PWIZ-025, CS-074, UCC-152, UIW-015, WM-041 and DL-259: PM generates proxy configuration. It does not select, hold, validate, issue or sign the person’s certificates. No certificate profile, selector or certificate-selection/validation gate before generation, activation or Ready. The generated artifact proves only generation. Route Ready names actual endpoint reachability, PM protocol/API, expected Server identity/pairing/auth and applicable WebSocket/stream/transfer/deep-link/callback checks. It never assures certificate validity. Public-exposure consent and existing secure transport/reachability gates remain. |
| **CLOUD-1 A** | One-time setup code from the cloud provider’s console; explicit console/local-bootstrap handoff. | RAS-007, SRV-005/007 and PWIZ-025: the Server owner consumes protected one-use code and binds initial owner-claim authorization to the existing discovery_observation_id, pairing_session_id and identity_fingerprint in cmd.server.claim, with current permission/generations. No raw code in ordinary payload, saved plan, logs or receipts; no public unclaimed setup or automated provider-console provisioning. Bootstrap remains separate. |
| **DESKTOP-RESTORE-1 A** | Native desktop directly hands off its first local claim; no code to type. | SRV-005/007/013 and PWIZ-025: protected native local handoff supplies the same owner-verified tuple for the dormant local Server. Browser/ordinary Client flags and loopback are not authority. Claim, then separate bootstrap of roots/baseline, then authorized Full Server restore; current verified prerequisites may be reused. |
| **REMOTE-CODE-1 A** | Decide right before building. | RAS-014 and DL-259: Remote Link’s owner issues/checks the link/code. Grammar, normalization/case, expiry/abuse and code resolution protocol are verified immediately before PM is built alongside D4’s items. No sample code/grammar is canon; blank input remains invalid and nonblank is not proof. No resolver command is invented. |

The named **initial owner-claim authorization** uses the existing closed claim tuple; it is not a new request field, durable record, command or Client-pairing bypass. Runtime implementation and authority proof remain owed by the Server owner; static contracts do not certify them.

| Pre-build verification | Owner |
|---|---|
| Z.AI listed-tools rule | D4 provider admission |
| Kimi Code client identity | D4 provider admission |
| OpenCode Go client identity | D4 provider admission |
| Muse-only subscription credential | D4 provider admission |
| Remote Link code protocol, with no grammar pinned now | RAS-014 / REMOTE-CODE-1 |

The common checklist is recorded under DL-259 and in multi_account_contracts.schema.json’s existing pre_build_verification annotation. Onboarding and Remote Access point to it; no provider or protocol warning is added to the wizard. Existing post-Creating remote setup, Later always finishing and effective app state from owner records remain.
