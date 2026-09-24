# Shard 014: Operational Identity Addendum for GitHub Actions and Docker Manager (2026-03-12)

Source: `Plans/Multi-Account.md`

Source lines: L753-L767

Source SHA256: `6ce4ac59034f060b27d162a9195409d71b648b8cf2c748903b2e0754bd39dc47`

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
