# Shard 028: Files reached through another Puppet Master addendum - 2026-09-25

Source: `Plans/Planning_Wizard.md`

Source lines: L2554-L2655

Source SHA256: `9d517875ab7a5c6dfc9d7b88537fea140961e2fe95ec4ad5175bf6cad4e243c6`

---

## Files reached through another Puppet Master addendum - 2026-09-25

This addendum closes a gap Jared asked to have fixed on 2026-09-25. It extends `PWIZ-024`'s source and storage
routes to the case where the device that holds the files already runs Puppet Master: a NAS or home server set up
earlier, reached again from a new computer. The setup plan could only say `local`, `mounted` or `ssh` for such a
folder, so a draft that was made by pairing with that Puppet Master had to call itself an SSH connection. It changes no
Server, pairing, trust or Project owner, and creates no command.

Open a folder here, Restore a backup and a network Storage choice may each point at a device that runs Puppet Master.
The files are then reached through that Puppet Master, by the same Server-owned pairing every other device uses:
`cmd.client.pair.start` by approval from a device that already uses it, by the code it shows, or by its QR, on the
device's verified identity, with approve, reject and cancel as the owner's distinct transitions (`SRV-004`). The
identity picture and words are shown before pairing starts. Onboarding never completes the pairing by itself; that
the device answered, or that its identity matched a known one, never stands in for the approval.

The draft records `puppet_master` in whichever of `project_transport`, `backup_transport` or `storage_transport` the
folder serves, with a non-secret reference to the device and path, and binds the pairing result in
`source_access_authorization_refs`. It is never recorded as `ssh`, and no SSH key is added to the device for it. A
person who would rather use SSH with that device may choose it; that route is then an ordinary SSH connection with a
key, recorded as `ssh`.

The paired device stays a Source Location, a backup source or a storage location. It does not become the Connected
Server, the Project Home Server or the Execution Host (`SRV-006`), and the pairing leaves `server_mode`, `server_ref`,
`connection_pairing` and `remote_mode` as they were. Before Review the pairing is individually consented
selected-source authentication: it allows read-only browsing and validation of the chosen folder or backup and nothing
else. Creating a folder there, writing to it and registering the Project wait for the reviewed commit, as they do for
every other transport.

### PWIZ-029 - Files reached through another Puppet Master

```yaml
plan_unit_id: PWIZ-029
unit_type: integration_contract
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  When the device holding a Project's existing folder, its backup, or its chosen network storage already runs Puppet
  Master, Product Onboarding reaches those files through that Puppet Master by Server-owned pairing, not by an SSH key.
  The device's verified identity is shown first; cmd.client.pair.start then starts pairing by approval from a device
  that already uses it, by code, or by QR, and approve, reject and cancel remain the Server owner's distinct
  transitions. Onboarding never completes the pairing itself, and reachability or a matching identity never replaces
  the approval. The setup draft records puppet_master in project_transport, backup_transport or storage_transport for
  the purpose the folder serves, with a non-secret device-and-path reference, and binds the pairing result in
  source_access_authorization_refs; it is never recorded as ssh and no SSH key is installed for it. A person may still
  choose SSH for that device, which is then an ordinary ssh connection with a key. The paired device remains a Source
  Location, backup source or storage location and never becomes the Connected Server, Project Home Server or Execution
  Host; server_mode, server_ref, connection_pairing and remote_mode are unchanged by it. Before Review the pairing is
  individually consented selected-source authentication limited to read-only browsing and validation of the chosen
  folder or backup; folder creation, writes and Project registration wait for the reviewed commit.
gui_related: true
gui_classification_reason: The identity check, the approval, code and QR choices, the waiting and expired states, the
  Use SSH instead choice, and the Review line naming the paired device are visible onboarding steps.
split_recommended: false
depends_on: [PWIZ-024, SRV-004, SRV-006]
unblocks: []
acceptance_criteria:
  - A folder, backup or storage location on a device that runs Puppet Master is reached by pairing through cmd.client.pair.start with approval, code or QR, never by an automatic pairing and never by an SSH key install.
  - The device's identity picture and words are shown before pairing starts, and pairing does not finish until the owner reports approval.
  - An expired code offers a new code, and a rejected or cancelled pairing returns to the choice of method with nothing recorded.
  - The draft records puppet_master in the matching transport with a non-secret reference and binds the pairing result in source_access_authorization_refs; a draft with puppet_master and no pairing result is rejected.
  - Choosing SSH for such a device records ssh with a key and no pairing.
  - The pairing leaves server_mode, server_ref, connection_pairing and remote_mode unchanged, and the device is never shown as the Connected Server, Project Home Server or Execution Host.
  - Before Review nothing is written to the device; only read-only browsing and validation of the chosen folder or backup run.
validation_surfaces:
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-onboarding-contracts.py --check
risk_class: onboarding_hidden_route_or_pre_review_side_effect
reasoning_tier: high
context_scope: onboarding_setup_plan_semantics
implementation_surfaces:
  - Plans/Planning_Wizard.md
  - Plans/product_onboarding_contracts.schema.json
  - Plans/storage_value_registry.json
  - future Product Onboarding native controller
node_compile_hint:
  mode: onboarding_setup_plan_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-instruction:2026-09-25-files-through-another-puppet-master
  - Plans/Planning_Wizard.md#PWIZ-024
  - Plans/Server_System.md#SRV-004
  - Plans/Server_System.md#SRV-006
  - Concepts/onboarding/opus-5.5/AUDIT.md
preserved_exact_tokens:
  - puppet_master
  - cmd.client.pair.start
  - source_access_authorization_refs
  - Source Location
negative_constraints:
  - Do not pair with a Puppet Master on a device without approval, code or QR.
  - Do not record a folder reached through another Puppet Master as ssh or as an SSH key install.
  - Do not make the paired device the Connected Server, Project Home Server or Execution Host.
  - Do not write to the paired device before the reviewed commit.
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/Server_System.md
```

ContractRef: ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Server_System.md
