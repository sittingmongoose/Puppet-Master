# Shard 065: Notification destination typed profiles (DL-471, 2026-11-09)

Source: `Plans/Contracts_V0.md`

Source lines: L24490-L24652

Source SHA256: `50e155f62373fc463464c88fbcc54ad0d233ed291994593a7e138b380b9c825e`

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
  immutable provider on update. Its branch keys are exactly F3-717's provider enum. Each record is closed:
  undeclared fields are refused. Every credential, token, key, webhook URL, URL credential and sensitive
  destination locator travels only as secret_ref, never its raw value. Ref resolution and display obey
  PS-124 and SP-222; a reference is not authority to disclose it. static_header_refs contains only
  secret references, including for an authenticated header. Policy and template refs identify non-secret,
  owner-validated records; they cannot embed raw secrets, webhook URLs, tokens or private paths.
  GenericWebhookSuccessPredicateV1 is closed data: default_success is 2xx and atoms contains zero to five
  WebhookPredicateAtomV1 values, selected only from CV-298's six kinds. No expression, script, loop,
  regular expression, import, network operation or provider snippet is accepted. The proposed all/any
  composition applies only to that flat bounded list; an empty list means the default 2xx test. With atoms
  present the default test is retained and combined with the selected flat atom test. Literal operands
  use literal_ref, a reference to an owner-validated bounded non-secret scalar, rather than an inline
  arbitrary body or secret. A missing optional field has no implied field value; existing owner policy
  applies only where already defined, otherwise the owner refuses missing configuration. These are
  typed proposals under DL-471, not owner approval of missing product choices: every gap_note names
  a plain owner question and the chosen alternative. In particular timeout keeps CV-298's exact name,
  the compound username/avatar override policy remains one field, and retry/expire policy remains one
  object with proposed retry_seconds and expire_seconds members. No provider API fact is inferred from
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
        credential_ref: {type: secret_ref, required: true, default: none, provenance: gap, gap_note: "Q-S1. CV-298 names credential_ref; PS-124 requires secret custody. Requiredness is unstated. JUDGMENT: require the opaque credential; alternative: allow an incomplete disabled destination."}
        channel_ref: {type: secret_ref, required: false, default: none, provenance: gap, gap_note: "Q-S2. CV-298 names channel_ref without type or presence. JUDGMENT: optional sensitive channel reference when credential routing alone suffices; alternative: require it on every Slack profile."}
        mrkdwn_mode: {type: enum, required: false, default: plain, values: [plain, mrkdwn], provenance: gap, gap_note: "Q-S3. CV-298 names no tokens or default. JUDGMENT: plain by default, mrkdwn opt-in; alternative: boolean mode or require an explicit choice without a default."}
        mention_policy: {type: enum, required: false, default: disabled, values: [disabled, explicit_only], provenance: gap, gap_note: "Q-S4. CV-298 forbids broad mentions by default but gives no policy tokens. JUDGMENT: disable all mentions by default and allow only explicitly admitted mentions; alternative: a structured per-mention allowlist."}
        rate_limit_profile: {type: ref, required: true, default: none, provenance: gap, gap_note: "Q-C1. CV-298 stores or derives rate-limit profiles without a shape or presence rule. JUDGMENT: require a non-secret policy-record ref; alternative: inline bounded settings or an optional derived policy."}
    DiscordDestinationProfileV1:
      fields:
        webhook_credential_ref: {type: secret_ref, required: true, default: none, provenance: gap, gap_note: "Q-D1. CV-298 names webhook_credential_ref; PS-124 keeps webhook URLs secret. JUDGMENT: require the opaque credential; alternative: allow an incomplete disabled destination."}
        thread_id: {type: secret_ref, required: false, default: none, provenance: gap, gap_note: "Q-D2. CV-298 names thread_id without a type or presence rule. JUDGMENT: optional sensitive reference despite the exact id spelling; alternative: an optional non-secret id."}
        username/avatar override policy: {type: enum, required: false, default: disabled, values: [disabled, configured_identity], provenance: gap, gap_note: "Q-D3. CV-298 gives the compound words, no split or tokens. JUDGMENT: keep the exact compound key and one policy for both, disabled by default; configured_identity uses an existing owner identity record, no raw avatar URL. Alternative: separate username and avatar policy fields with explicit identity refs."}
        allowed_mentions: {type: list, required: false, default: [], item: {type: secret_ref}, constraints: {max_items: 20, unique_items: true}, provenance: gap, gap_note: "Q-D4. CV-298 forbids broad mentions by default but gives no shape. JUDGMENT: zero to twenty unique sensitive recipient refs, empty by default, with no broad-mention token; alternative: a provider-shaped structured mention policy."}
        rate_limit_profile: {type: ref, required: true, default: none, provenance: gap, gap_note: "Q-C1. JUDGMENT: required non-secret policy-record ref as for Slack; alternative: inline settings or optional derivation. CV-298 gives no type or presence rule."}
    GenericWebhookDestinationProfileV1:
      fields:
        url_credential_ref: {type: secret_ref, required: true, default: none, provenance: gap, gap_note: "Q-G1. CV-298 names the URL credential; PS-124 forbids raw webhook URLs. JUDGMENT: require the opaque URL credential; alternative: allow incomplete disabled profiles."}
        method: {type: enum, required: false, default: POST, values: [POST, PUT, PATCH], provenance: gap, gap_note: "Q-G2. CV-298 names method without values/default. JUDGMENT: POST default with PUT/PATCH admitted; alternative: POST only or an explicitly selected broader HTTP method set."}
        static_header_refs: {type: list, required: false, default: [], item: {type: secret_ref}, constraints: {max_items: 32, unique_items: true}, provenance: gap, gap_note: "Q-G3. CV-298 names static_header_refs without cardinality/default. JUDGMENT: up to thirty-two unique secret refs, empty by default; alternative: require an explicit list or lower the cap."}
        body_template_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "Q-G4. CV-298 names body_template_ref without presence/type. JUDGMENT: require a validated non-secret template-record ref; alternative: optional template using the shared delivery envelope directly."}
        timeout: {type: integer, required: false, default: 10000, constraints: {minimum: 100, maximum: 60000}, provenance: gap, gap_note: "Q-G5. CV-298 says timeout without units, bounds or default. JUDGMENT: keep timeout exactly, milliseconds, 100..60000, default 10000; alternative: seconds with an explicitly selected timeout."}
        success_predicate: {type: contract, ref: Plans/Contracts_V0.md#CV-369/GenericWebhookSuccessPredicateV1, required: false, default: none, provenance: gap, gap_note: "Q-G6. CV-298 fixes default 2xx plus at most five named atoms, not the carrier or presence rule. JUDGMENT: optional named bounded predicate; absence applies CV-298's existing 2xx rule. Alternative: require an explicit predicate object."}
    NtfyDestinationProfileV1:
      fields:
        server_ref: {type: secret_ref, required: true, default: none, provenance: gap, gap_note: "Q-N1. CV-298 names server_ref without type/presence. JUDGMENT: require sensitive server locator custody, never a raw URL; alternative: a non-secret registered-server ref."}
        topic_ref: {type: secret_ref, required: true, default: none, provenance: gap, gap_note: "Q-N1. CV-298 names topic_ref without type/presence. JUDGMENT: require a sensitive topic ref; alternative: non-secret topic-record ref. The source lineage treats even public topics as sensitive."}
        credential_ref: {type: secret_ref, required: false, default: none, provenance: gap, gap_note: "Q-N2. CV-298 names credential_ref; PS-124 requires secret custody. JUDGMENT: optional for explicitly admitted unauthenticated destinations; alternative: require authentication for every ntfy destination."}
        priority: {type: integer, required: false, default: none, constraints: {minimum: 1, maximum: 5}, provenance: gap, gap_note: "Q-N3. CV-298 names no priority bounds or default. JUDGMENT: optional integer 1..5 with no implied profile value; alternative: named priority enum or require explicit priority."}
        tags: {type: list, required: false, default: [], item: {type: string, constraints: {min_length: 1, max_length: 64}}, constraints: {max_items: 20, unique_items: true}, provenance: gap, gap_note: "Q-N4. CV-298 names tags without shape/default. JUDGMENT: at most twenty unique non-secret tags of 1..64 characters, empty by default; alternative: a tag-set record ref."}
        click_action_policy: {type: enum, required: false, default: disabled, values: [disabled, owner_route], provenance: gap, gap_note: "Q-N5. CV-298 names no tokens/default. JUDGMENT: disabled by default, owner_route only after permission-checked route resolution; alternative: a structured action policy reference. No raw click URL is carried."}
        rate_limit_profile: {type: ref, required: true, default: none, provenance: gap, gap_note: "Q-C1. JUDGMENT: require a non-secret policy-record ref; alternative: inline settings or optional derivation. CV-298 fixes neither type nor presence."}
    PushoverDestinationProfileV1:
      fields:
        app_token_ref: {type: secret_ref, required: true, default: none, provenance: gap, gap_note: "Q-P1. CV-298 names app_token_ref and PS-124 requires secret custody. JUDGMENT: require it; alternative: allow incomplete disabled profiles."}
        user_key_ref: {type: secret_ref, required: true, default: none, provenance: gap, gap_note: "Q-P1. CV-298 names user_key_ref and PS-124 requires secret custody. JUDGMENT: require it; alternative: allow incomplete disabled profiles."}
        device: {type: secret_ref, required: false, default: none, provenance: gap, gap_note: "Q-P2. CV-298 names device without a type/presence rule. JUDGMENT: optional sensitive destination ref retaining the exact name; alternative: a non-secret bounded device string."}
        priority: {type: integer, required: false, default: none, constraints: {minimum: -2, maximum: 2}, provenance: gap, gap_note: "Q-P3. CV-298 gives no priority range/default. JUDGMENT: optional -2..2 integer with no implied profile value; alternative: a named enum or require explicit priority. Provider support is not certified here."}
        sound: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 64}, provenance: gap, gap_note: "Q-P4. CV-298 names sound without tokens/type/presence. JUDGMENT: optional non-secret bounded provider sound token; alternative: an owner sound-record ref or a closed supported enum."}
        retry/expire policy:
          type: object
          required: false
          default: none
          provenance: gap
          gap_note: "Q-P5. CV-298 gives only the compound words. JUDGMENT: retain the exact compound key with retry_seconds and expire_seconds, admitted only with priority 2; require the policy then. Alternative: a reusable policy-record ref. These cross-field admission rules are owner validation obligations."
          fields:
            retry_seconds: {type: integer, required: true, default: none, constraints: {minimum: 30, maximum: 3600}, provenance: gap, gap_note: "Q-P5. No canon names this split, units or bounds. JUDGMENT: required seconds, 30..3600; alternative: owner policy-record ref."}
            expire_seconds: {type: integer, required: true, default: none, constraints: {minimum: 30, maximum: 10800}, provenance: gap, gap_note: "Q-P5. No canon names this split, units or bounds. JUDGMENT: required seconds, 30..10800 and not less than retry_seconds; alternative: owner policy-record ref. The comparison is an owner validation obligation."}
    TelegramDestinationProfileV1:
      fields:
        bot_token_ref: {type: secret_ref, required: true, default: none, provenance: gap, gap_note: "Q-T1. CV-298 names bot_token_ref and PS-124 requires secret custody. JUDGMENT: require it; alternative: allow an incomplete disabled destination."}
        chat_id_ref: {type: secret_ref, required: true, default: none, provenance: gap, gap_note: "Q-T1. CV-298 names chat_id_ref without type/presence. JUDGMENT: require a sensitive chat ref, as the source lineage describes; alternative: a non-secret destination-record ref."}
        message_thread_id: {type: secret_ref, required: false, default: none, provenance: gap, gap_note: "Q-T2. CV-298 gives no type/presence. JUDGMENT: optional sensitive thread reference under its exact name; alternative: an optional integer provider thread id."}
        parse_mode: {type: enum, required: false, default: plain, values: [plain, MarkdownV2, HTML], provenance: gap, gap_note: "Q-T3. CV-298 names no tokens/default. JUDGMENT: plain by default, MarkdownV2/HTML only with owner escaping; alternative: plain-only or an explicitly chosen mode. These tokens are proposals, not claimed canon API facts."}
        disable_notification: {type: boolean, required: false, default: false, provenance: gap, gap_note: "Q-T4. CV-298 names disable_notification without type/default/presence. JUDGMENT: optional boolean false; alternative: true by default or require an explicit choice."}
        rate_limit_profile: {type: ref, required: true, default: none, provenance: gap, gap_note: "Q-C1. JUDGMENT: require a non-secret policy-record ref; alternative: inline settings or optional derivation. CV-298 gives no type or presence rule."}
    NotificationDestinationProfileV1:
      discriminator: provider
      branches: {slack: SlackDestinationProfileV1, discord: DiscordDestinationProfileV1, generic_webhook: GenericWebhookDestinationProfileV1, ntfy: NtfyDestinationProfileV1, pushover: PushoverDestinationProfileV1, telegram: TelegramDestinationProfileV1}
    GenericWebhookSuccessPredicateV1:
      fields:
        default_success: {type: const, value: 2xx, required: false, default: 2xx, provenance: gap, gap_note: "Q-G7. CV-298 fixes default 2xx, but no field name or presence. JUDGMENT: optional const default_success with the canonical default; alternative: make the 2xx rule implicit in the predicate contract."}
        composition: {type: enum, required: false, default: all, values: [all, any], provenance: gap, gap_note: "Q-G7. CV-298 gives no composition encoding; source lineage mentions bounded AND/OR. JUDGMENT: flat all/any, default all; alternative: all-only. Retain default 2xx AND the atom test, empty list means 2xx alone."}
        atoms: {type: list, required: false, default: [], item: {type: contract, ref: Plans/Contracts_V0.md#CV-369/WebhookPredicateAtomV1}, constraints: {max_items: 5}, provenance: gap, gap_note: "Q-G7. CV-298 fixes at most five atoms and the six kinds, not field names or presence. JUDGMENT: optional flat atoms list, empty by default; alternative: require an explicit list or all-only composition."}
    WebhookPredicateAtomV1:
      discriminator: kind
      branches: {status_class_is: WebhookStatusClassAtomV1, status_code_equals: WebhookStatusCodeAtomV1, header_exists: WebhookHeaderExistsAtomV1, header_equals_literal: WebhookHeaderEqualsAtomV1, json_pointer_exists: WebhookJsonPointerExistsAtomV1, json_pointer_equals_literal: WebhookJsonPointerEqualsAtomV1}
    WebhookStatusClassAtomV1:
      fields:
        kind: {type: const, value: status_class_is, required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 names status_class_is, no discriminator encoding. JUDGMENT: required const kind; alternative: one-key atom objects."}
        status_class: {type: enum, values: [1xx, 2xx, 3xx, 4xx, 5xx], required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 gives no operand name/type/tokens. JUDGMENT: required status_class with the five class tokens; alternative: an integer class."}
    WebhookStatusCodeAtomV1:
      fields:
        kind: {type: const, value: status_code_equals, required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 names status_code_equals, no encoding. JUDGMENT: required const kind; alternative: one-key atom objects."}
        status_code: {type: integer, constraints: {minimum: 100, maximum: 599}, required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 gives no operand encoding/bounds. JUDGMENT: required integer status_code 100..599; alternative: bounded three-digit string."}
    WebhookHeaderExistsAtomV1:
      fields:
        kind: {type: const, value: header_exists, required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 names header_exists, no encoding. JUDGMENT: required const kind; alternative: one-key atom objects."}
        header: {type: string, constraints: {min_length: 1, max_length: 256}, required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 gives no operand encoding/bounds. JUDGMENT: bounded non-secret header name, owner validates HTTP header syntax; alternative: an admitted header-name enum."}
    WebhookHeaderEqualsAtomV1:
      fields:
        kind: {type: const, value: header_equals_literal, required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 names header_equals_literal, no encoding. JUDGMENT: required const kind; alternative: one-key atom objects."}
        header: {type: string, constraints: {min_length: 1, max_length: 256}, required: true, default: none, provenance: gap, gap_note: "Q-G8. JUDGMENT: bounded non-secret header name, owner-validated syntax; alternative: an admitted header-name enum. CV-298 gives no bounds."}
        literal_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "Q-G9. CV-298 names literal equality without a value representation. JUDGMENT: reference a reviewed non-secret scalar of at most 1024 serialized bytes, never secret material; alternative: an inline bounded non-secret literal with equivalent validation."}
    WebhookJsonPointerExistsAtomV1:
      fields:
        kind: {type: const, value: json_pointer_exists, required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 names json_pointer_exists, no encoding. JUDGMENT: required const kind; alternative: one-key atom objects."}
        json_pointer: {type: string, constraints: {max_length: 512}, required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 gives no operand encoding/bound. JUDGMENT: JSON Pointer string at most 512 characters, empty root allowed, owner validates syntax; alternative: a validated pointer-record ref."}
    WebhookJsonPointerEqualsAtomV1:
      fields:
        kind: {type: const, value: json_pointer_equals_literal, required: true, default: none, provenance: gap, gap_note: "Q-G8. CV-298 names json_pointer_equals_literal, no encoding. JUDGMENT: required const kind; alternative: one-key atom objects."}
        json_pointer: {type: string, constraints: {max_length: 512}, required: true, default: none, provenance: gap, gap_note: "Q-G8. JUDGMENT: JSON Pointer string at most 512 characters, empty root allowed, syntax owner-validated; alternative: a pointer-record ref. CV-298 gives no bound."}
        literal_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "Q-G9. JUDGMENT: reference an owner-validated non-secret scalar of at most 1024 serialized bytes; alternative: bounded inline non-secret literal. CV-298 gives no representation or bound."}
```
