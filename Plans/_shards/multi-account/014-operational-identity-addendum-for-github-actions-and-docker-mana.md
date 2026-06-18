# Shard 014: Operational Identity Addendum for GitHub Actions and Docker Manager (2026-03-12)

Source: `Plans/Multi-Account.md`

Source lines: L757-L771

Source SHA256: `4e5f8b7b03ae7a06d68a200c191df3cc11a510124af3d3a8e884179e07bc2a76`

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
