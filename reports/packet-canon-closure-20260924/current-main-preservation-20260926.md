# Current-main preservation check

Status: read-only pre-landing drift review; no fetch, rebase, lock, shared checkout edit or main push performed.

Observed local shared `main` and `origin/main`: `9a40601e93fb136856c0ec4f92018f956276f94c`, commit time 2026-09-25T20:54:13Z. Root repair branch at inspection: `ec057b173`; common ancestor `1e5d9b097b46aa58e7af488a9c38a87efb780d5f`. These local refs are not a claim that the remote cannot have advanced further.

Newer owner decisions requiring preservation and affected-case re-adjudication:

- Main `Planning_Wizard.md` PWIZ-029 adds `puppet_master` transport for a Project source folder, backup source or network storage on a device already running PM. Server-owned approval/code/QR pairing is required; this is not silently SSH, and the paired source does not become the Connected Server, Project Home Server or Execution Host. Pre-Review access stays individually consented and read-only. Its schema/fixtures and storage consumers must travel with the owner change.
- Main `Remote_Access_System.md` and `FinalGUISpec.md` replace the optional VPN-discovery checkbox with discovery across already-connected VPNs, no VPN switch, and the text `You can connect through a VPN too`. Old packet/frozen-root checkbox expectations cannot be restored.
- Main Browser created-v2 and coordination Event Authority changes belong to their current owners. Preserve admitted-versus-prepared distinctions; do not merge them as if they were this thread's approvals or refresh their governance bindings.

Non-generated overlapping paths since the common ancestor are Automated_Testing_System, Contracts_V0, Decision_Log, FinalGUISpec, Planning_Wizard, Remote_Access_System, Section15_MVP_Promoted_Features_Spec, product_onboarding schema/fixtures, storage-plan and storage_value_registry. Overlap alone does not prove a conflict. Each cited passage must be re-read and re-adjudicated at rebase; generated shards/index must be regenerated, not hand-merged. Frozen decision cards and answer evidence remain immutable; Decision Log ID collisions require next-free routing without rewriting their approved text.

The active Server139 and breadth89 reviews were notified of the newer onboarding authority. They retain original input lineage, but affected findings receive no current-main closure credit until checked against these additions. This does not invalidate unrelated reviewed cases or license a broad reread/restart of every native Goal. Final landing still requires the user's landing lock, fresh fetch, rebase, complete applicable failure-key delta and prescribed checks.
