# Shard 065: Notification destination typed profiles (DL-471, 2026-11-09)

Source: `Plans/Contracts_V0.md`

Source lines: L24507-L24664

Source SHA256: `4b70f80fd8b3fd121e33fa29ddb9f8828ad20d3063407af3393b2445bbf53296`

---

## Notification destination typed profiles (DL-471, 2026-11-09)

### CV-369 - Notification Destination Provider Profiles

```yaml
plan_unit_id: CV-369
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  CV-369 gives CV-298's six provider profiles named, checked field schemas in pm.typed_contracts.v1.
  NotificationDestinationProfileV1 selects SlackDestinationProfileV1, DiscordDestinationProfileV1,
  GenericWebhookDestinationProfileV1, NtfyDestinationProfileV1, PushoverDestinationProfileV1 or
  TelegramDestinationProfileV1 using the enclosing command's provider, or the stored destination's
  immutable provider on update. NotificationDestinationProfileV1 declares discriminator_source: external;
  every use site names its arg or owner source. WebhookPredicateAtomV1 declares discriminator_source:
  in_record; each branch carries a required matching kind const. NotificationDestinationProfileV1's branch
  keys are exactly F3-717's provider enum. Each record is closed:
  undeclared fields are refused. Every credential, token, key, webhook URL, URL credential and sensitive
  destination locator travels only as secret_ref, never its raw value. Ref resolution and display obey
  PS-124 and SP-222; a reference is not authority to disclose it. static_header_refs contains only
  secret references, including for an authenticated header. Policy and template refs identify non-secret,
  owner-validated records; they cannot embed raw secrets, webhook URLs, tokens or private paths.
  GenericWebhookSuccessPredicateV1 is closed data: default_success is 2xx and atoms contains zero to five
  WebhookPredicateAtomV1 values, selected only from CV-298's six kinds. No expression, script, loop,
  regular expression, import, network operation or provider snippet is accepted. The decided all/any
  composition applies only to that flat bounded list; an empty list means the default 2xx test. With atoms
  present the default test is retained and combined with the selected flat atom test. Literal operands
  use literal_ref, a reference to an owner-validated bounded non-secret scalar, rather than an inline
  arbitrary body or secret. A missing optional field has no implied field value; existing owner policy
  applies only where already defined, otherwise the owner refuses missing configuration. Jared approved all 46 recommendations on 2026-11-09, recorded in DL-471; the typed fields cite their decided question IDs. In particular timeout keeps CV-298's exact name,
  the compound username/avatar override policy remains one field, and retry/expire policy remains one object with decided retry_seconds and expire_seconds members. No provider API fact is inferred from
  its name, and no external delivery, native implementation, readiness or governance seal is certified.
gui_related: false
gui_classification_reason: Defines provider payload types and secret custody; F3-405 owns presentation.
depends_on: [CV-298, DL-471, PS-124, SP-222]
unblocks: [F3-717]
acceptance_criteria:
  - All thirty-five exact CV-298 profile field names occur in their provider's closed record.
  - Every field obeys UCC-230 vocabulary, required/default and provenance rules; unresolved choices remain gaps.
  - F3-717 create and update reference NotificationDestinationProfileV1 by unit and contract name.
  - Generic webhook predicates accept at most five atoms and only the six CV-298 kinds; empty means default 2xx.
  - Secret fields are reference-only; no raw secret, webhook URL, token or private path is accepted.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks or runtime code are created.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py --json
  - python3 scripts/pm-command-payload-defs-check.py --self-test
  - python3 scripts/pm-plan-index.py validate
risk_class: notification_profile_type_or_secret_drift
reasoning_tier: high
context_scope: notification_destination_provider_profiles
implementation_surfaces: [Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: typed_contracts, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "Jared, 2026-11-08, stream C question 3 (row 607): Define them now (Recommended); CV-298 owner approval remains Jared's choice for gaps."
  - "Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json: destination_matrix and generic_webhook_success_predicate_contract; source lineage, not a type authority."
preserved_exact_tokens: [pm.typed_contracts.v1, NotificationDestinationProfileV1, SlackDestinationProfileV1, DiscordDestinationProfileV1, GenericWebhookDestinationProfileV1, NtfyDestinationProfileV1, PushoverDestinationProfileV1, TelegramDestinationProfileV1, GenericWebhookSuccessPredicateV1, WebhookPredicateAtomV1, credential_ref, channel_ref, mrkdwn_mode, mention_policy, rate_limit_profile, webhook_credential_ref, thread_id, username/avatar override policy, allowed_mentions, url_credential_ref, method, static_header_refs, body_template_ref, timeout, success_predicate, server_ref, topic_ref, priority, tags, click_action_policy, app_token_ref, user_key_ref, device, sound, retry/expire policy, bot_token_ref, chat_id_ref, message_thread_id, parse_mode, disable_notification]
negative_constraints:
  - Do not pass raw secrets, webhook URLs, tokens or private paths in profiles, predicates, exports or receipts.
  - Do not treat a gap's recommendation as Jared's answer or CV-298 owner approval.
  - Do not enable Slack or Discord broad mentions by default.
owner_hints: [Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/Permissions_System.md]
```

```yaml
typed_contracts:
  format: pm.typed_contracts.v1
  owner_unit: CV-369
  vocabulary: Plans/UI_Command_Catalog.md#UCC-230
  contracts:
    SlackDestinationProfileV1:
      fields:
        credential_ref: {type: secret_ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-S1 decided by the owner: require the opaque credential.'}
        channel_ref: {type: secret_ref, required: false, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-S2 decided by the owner: optional sensitive channel reference when credential routing alone suffices.'}
        mrkdwn_mode: {type: enum, required: false, default: plain, values: [plain, mrkdwn], provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-S3 decided by the owner: plain by default, mrkdwn opt-in.'}
        mention_policy: {type: enum, required: false, default: disabled, values: [disabled, explicit_only], provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-S4 decided by the owner: disable all mentions by default and allow only explicitly admitted mentions.'}
        rate_limit_profile: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-C1 decided by the owner: require a non-secret policy-record ref.'}
    DiscordDestinationProfileV1:
      fields:
        webhook_credential_ref: {type: secret_ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-D1 decided by the owner: require the opaque credential.'}
        thread_id: {type: secret_ref, required: false, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-D2 decided by the owner: optional sensitive reference despite the exact id spelling.'}
        username/avatar override policy: {type: enum, required: false, default: disabled, values: [disabled, configured_identity], provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-D3 decided by the owner: keep the exact compound key and one policy for both, disabled by default; configured_identity uses an existing owner identity record, no raw avatar URL.'}
        allowed_mentions: {type: list, required: false, default: [], item: {type: secret_ref}, constraints: {max_items: 20, unique_items: true}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-D4 decided by the owner: zero to twenty unique sensitive recipient refs, empty by default, with no broad-mention token.'}
        rate_limit_profile: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-C1 decided by the owner: required non-secret policy-record ref as for Slack.'}
    GenericWebhookDestinationProfileV1:
      fields:
        url_credential_ref: {type: secret_ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G1 decided by the owner: require the opaque URL credential.'}
        method: {type: enum, required: false, default: POST, values: [POST, PUT, PATCH], provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G2 decided by the owner: POST default with PUT/PATCH admitted.'}
        static_header_refs: {type: list, required: false, default: [], item: {type: secret_ref}, constraints: {max_items: 32, unique_items: true}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G3 decided by the owner: up to thirty-two unique secret refs, empty by default.'}
        body_template_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G4 decided by the owner: require a validated non-secret template-record ref.'}
        timeout: {type: integer, required: false, default: 10000, constraints: {minimum: 100, maximum: 60000}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G5 decided by the owner: keep timeout exactly, milliseconds, 100..60000, default 10000.'}
        success_predicate: {type: contract, ref: Plans/Contracts_V0.md#CV-369/GenericWebhookSuccessPredicateV1, required: false, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G6 decided by the owner: optional named bounded predicate; absence applies CV-298''s existing 2xx rule.'}
    NtfyDestinationProfileV1:
      fields:
        server_ref: {type: secret_ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-N1 decided by the owner: require sensitive server locator custody, never a raw URL.'}
        topic_ref: {type: secret_ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-N1 decided by the owner: require a sensitive topic ref.'}
        credential_ref: {type: secret_ref, required: false, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-N2 decided by the owner: optional for explicitly admitted unauthenticated destinations.'}
        priority: {type: integer, required: false, default: none, constraints: {minimum: 1, maximum: 5}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-N3 decided by the owner: optional integer 1..5 with no implied profile value.'}
        tags: {type: list, required: false, default: [], item: {type: string, constraints: {min_length: 1, max_length: 64}}, constraints: {max_items: 20, unique_items: true}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-N4 decided by the owner: at most twenty unique non-secret tags of 1..64 characters, empty by default.'}
        click_action_policy: {type: enum, required: false, default: disabled, values: [disabled, owner_route], provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-N5 decided by the owner: disabled by default, owner_route only after permission-checked route resolution; no raw click URL is carried.'}
        rate_limit_profile: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-C1 decided by the owner: require a non-secret policy-record ref.'}
    PushoverDestinationProfileV1:
      fields:
        app_token_ref: {type: secret_ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-P1 decided by the owner: require it.'}
        user_key_ref: {type: secret_ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-P1 decided by the owner: require it.'}
        device: {type: secret_ref, required: false, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-P2 decided by the owner: optional sensitive destination ref retaining the exact name.'}
        priority: {type: integer, required: false, default: none, constraints: {minimum: -2, maximum: 2}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-P3 decided by the owner: optional -2..2 integer with no implied profile value.'}
        sound: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 64}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-P4 decided by the owner: optional non-secret bounded provider sound token.'}
        retry/expire policy:
          {type: object, required: false, default: none, provenance: canon, fields: {retry_seconds: {type: integer, required: true, default: none, constraints: {minimum: 30, maximum: 3600}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-P5 decided by the owner: required seconds, 30..3600.'}, expire_seconds: {type: integer, required: true, default: none, constraints: {minimum: 30, maximum: 10800}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-P5 decided by the owner: required seconds, 30..10800 and not less than retry_seconds.'}}, source: 'Plans/Decision_Log.md#DL-471, Q-P5 decided by the owner: retain the exact compound key with retry_seconds and expire_seconds, admitted only with priority 2; require the policy then. Required only for priority 2 and forbidden otherwise; expire_seconds is at least retry_seconds. Cross-field admission is owner validation.'}
    TelegramDestinationProfileV1:
      fields:
        bot_token_ref: {type: secret_ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-T1 decided by the owner: require it.'}
        chat_id_ref: {type: secret_ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-T1 decided by the owner: require a sensitive chat ref, as the source lineage describes.'}
        message_thread_id: {type: secret_ref, required: false, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-T2 decided by the owner: optional sensitive thread reference under its exact name.'}
        parse_mode: {type: enum, required: false, default: plain, values: [plain, MarkdownV2, HTML], provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-T3 decided by the owner: plain by default, MarkdownV2/HTML only with owner escaping.'}
        disable_notification: {type: boolean, required: false, default: false, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-T4 decided by the owner: optional boolean false.'}
        rate_limit_profile: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-C1 decided by the owner: require a non-secret policy-record ref.'}
    NotificationDestinationProfileV1:
      discriminator: provider
      discriminator_source: external
      branches: {slack: SlackDestinationProfileV1, discord: DiscordDestinationProfileV1, generic_webhook: GenericWebhookDestinationProfileV1, ntfy: NtfyDestinationProfileV1, pushover: PushoverDestinationProfileV1, telegram: TelegramDestinationProfileV1}
    GenericWebhookSuccessPredicateV1:
      fields:
        default_success: {type: const, value: 2xx, required: false, default: 2xx, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G7 decided by the owner: optional const default_success with the canonical default.'}
        composition: {type: enum, required: false, default: all, values: [all, any], provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G7 decided by the owner: flat all/any, default all.'}
        atoms: {type: list, required: false, default: [], item: {type: contract, ref: Plans/Contracts_V0.md#CV-369/WebhookPredicateAtomV1}, constraints: {max_items: 5}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G7 decided by the owner: optional flat atoms list, empty by default.'}
    WebhookPredicateAtomV1:
      discriminator: kind
      discriminator_source: in_record
      branches: {status_class_is: WebhookStatusClassAtomV1, status_code_equals: WebhookStatusCodeAtomV1, header_exists: WebhookHeaderExistsAtomV1, header_equals_literal: WebhookHeaderEqualsAtomV1, json_pointer_exists: WebhookJsonPointerExistsAtomV1, json_pointer_equals_literal: WebhookJsonPointerEqualsAtomV1}
    WebhookStatusClassAtomV1:
      fields:
        kind: {type: const, value: status_class_is, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: required const kind.'}
        status_class: {type: enum, values: [1xx, 2xx, 3xx, 4xx, 5xx], required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: required status_class with the five class tokens.'}
    WebhookStatusCodeAtomV1:
      fields:
        kind: {type: const, value: status_code_equals, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: required const kind.'}
        status_code: {type: integer, constraints: {minimum: 100, maximum: 599}, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: required integer status_code 100..599.'}
    WebhookHeaderExistsAtomV1:
      fields:
        kind: {type: const, value: header_exists, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: required const kind.'}
        header: {type: string, constraints: {min_length: 1, max_length: 256}, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: bounded non-secret header name, owner validates HTTP header syntax.'}
    WebhookHeaderEqualsAtomV1:
      fields:
        kind: {type: const, value: header_equals_literal, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: required const kind.'}
        header: {type: string, constraints: {min_length: 1, max_length: 256}, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: bounded non-secret header name, owner-validated syntax.'}
        literal_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G9 decided by the owner: reference a reviewed non-secret scalar of at most 1024 serialized bytes, never secret material.'}
    WebhookJsonPointerExistsAtomV1:
      fields:
        kind: {type: const, value: json_pointer_exists, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: required const kind.'}
        json_pointer: {type: string, constraints: {max_length: 512}, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: JSON Pointer string at most 512 characters, empty root allowed, owner validates syntax.'}
    WebhookJsonPointerEqualsAtomV1:
      fields:
        kind: {type: const, value: json_pointer_equals_literal, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: required const kind.'}
        json_pointer: {type: string, constraints: {max_length: 512}, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G8 decided by the owner: JSON Pointer string at most 512 characters, empty root allowed, syntax owner-validated.'}
        literal_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-G9 decided by the owner: reference an owner-validated non-secret scalar of at most 1024 serialized bytes.'}
```
