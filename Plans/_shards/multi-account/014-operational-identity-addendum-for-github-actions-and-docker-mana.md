# Shard 014: Operational Identity Addendum for GitHub Actions and Docker Manager (2026-03-12)

Source: `Plans/Multi-Account.md`

Source lines: L757-L771

Source SHA256: `af80742ba96d896919aa9dad0fefda9efa559b22011348b733f33c3dbac401fa`

---

## Operational Identity Addendum for GitHub Actions and Docker Manager (2026-03-12)


The current multi-account model must explicitly distinguish provider accounts from operational identities needed by this packet.

Required operational identity classes:
- `github_api` account identity used by GitHub Actions surface
- registry account identity / namespace identity used by Docker Manager
- Kubernetes context / cluster identity used by Docker Manager Kubernetes subview

Rules:
- operational identity state may be displayed alongside provider/account state, but it must not be implied to share the same ownership or token source unless the owning auth contract says so
- requested vs effective state remains visible when an identity exists but capability is partial

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Permissions_System.md
