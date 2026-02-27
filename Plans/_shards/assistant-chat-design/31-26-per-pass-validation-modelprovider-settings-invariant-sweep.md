## 26. Per-Pass Validation Model/Provider Settings (Invariant Sweep)

> **Addendum — 2026-02-25**

### 26.1 Context

The Three-Pass Canonical Validation Workflow (see `Plans/chain-wizard-flexibility.md §12`) runs three sequential passes after every interview/wizard project-plan generation cycle. Each pass uses a designated AI provider and model to perform its specific analysis and correction duties. This section specifies the **settings UX** that exposes per-pass provider + model selection to the user.

### 26.2 Settings Location

Per-pass provider and model selections live in a dedicated **Validation Passes** settings group within the existing app Settings surface — not in the chat UI itself.

**Navigation path:** Settings → Interview / Chain Wizard → Validation Passes

This placement keeps validation configuration co-located with other interview/wizard settings and away from the chat session controls, which govern the interactive conversation only.

### 26.3 Per-Pass Controls

The **Validation Passes** settings group exposes one row of controls per pass.

| Pass | Label | Default Provider | Default Model |
|------|-------|-----------------|---------------|
| Pass 1 | Document Creation | (primary configured platform) | (primary model for that platform) |
| Pass 2 | Docs + Canonical Alignment | (primary configured platform) | (primary model for that platform) |
| Pass 3 | Canonical Systems Only | (primary configured platform) | (primary model for that platform) |

**Controls per pass:**

- **Provider dropdown** — lists all enabled platforms (sourced from `platform_specs`; same data source as the chat platform dropdown). Label: "Provider".
- **Model dropdown** — lists models for the selected provider (dynamically discovered, cached; same data source as the chat model dropdown). Label: "Model". Fallback: `platform_specs::fallback_model_ids(platform)`.

> **Note:** No reasoning/effort control is shown in this settings group. Effort settings apply to the interactive chat session and do not govern these background validation passes.

// DRY:WIDGET:validation-pass-provider-model-selector

### 26.4 Default Resolution (Deterministic)

Default provider and model values are resolved using the following deterministic priority chain:

1. **Explicit stored value** — if `validation_sweep.passN.provider` / `validation_sweep.passN.model` is present in app settings, use it.
2. **Primary chat platform + model** — if no per-pass value is stored, use the provider and model selected in the main chat settings (the user's primary platform).
3. **First available platform + first fallback model** — if the primary chat platform/model is also unset, select the first platform returned by `platform_specs` and the first entry from `platform_specs::fallback_model_ids(platform)`.

**Invariants:**
- Given the same app settings state, the same provider and model are always selected (no randomness, no environment-dependent branching).
- On first explicit save of per-pass settings, the resolved default is written to app settings so that subsequent reads are reproducible.

### 26.5 Storage

Per-pass selections are stored in **app settings** only. They are not stored in project artifacts, not emitted to seglog as project data, and not included in project exports.

For auditability, each pass's resolved provider/model selection is mirrored into that pass's `validation_pass_report` payload fields (`provider`, `model`) in seglog (see `Plans/Project_Output_Artifacts.md §10.2`). This does not store the settings keys themselves as project artifacts.

**Normative storage keys:**

| Key | Purpose |
|-----|---------|
| `validation_sweep.pass1.provider` | Provider for Pass 1 (Document Creation) |
| `validation_sweep.pass1.model` | Model for Pass 1 |
| `validation_sweep.pass2.provider` | Provider for Pass 2 (Docs + Canonical Alignment) |
| `validation_sweep.pass2.model` | Model for Pass 2 |
| `validation_sweep.pass3.provider` | Provider for Pass 3 (Canonical Systems Only) |
| `validation_sweep.pass3.model` | Model for Pass 3 |

These keys are written to the same app settings store as all other GUI configuration values. See `Plans/chain-wizard-flexibility.md §3.1.1` for the OpenCode provider settings surface reference.

### 26.6 UX Copy

| Element | Copy |
|---------|------|
| Section header | "Validation Passes" |
| Section description | "Puppet Master runs a three-pass canonical validation sweep after every project plan is generated. Choose which provider and model to use for each pass." |
| Pass 1 description | "Document Creation — generates project artifacts (requirements, contracts, plan graph, acceptance manifest)." |
| Pass 2 description | "Canonical Alignment — checks artifacts against project contracts and platform canonical references; finds and fixes gaps." |
| Pass 3 description | "Canonical Systems Only — enforces DRY/SSOT, plan graph integrity, wiring matrix, and evidence alignment. Never modifies product requirements." |
| Default indicator | Show "(Default)" next to the automatically resolved provider/model when no explicit selection has been saved for that pass. |

### 26.7 DRY Rules

- Provider and model lists **MUST** be sourced exclusively from `platform_specs` (same SSOT as §1.1 chat controls). No hardcoded provider names or model lists anywhere in this feature.
- Reuse the same provider + model dropdown widgets as the §1.1 chat controls. Tag new reusable settings wrappers with: `// DRY:WIDGET:validation-pass-provider-model-selector`.

ContractRef: PolicyRule:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md#platform_specs

### 26.8 Acceptance Criteria

| # | Criterion |
|---|-----------|
| 1 | Settings changes take effect on the **next** validation sweep run — not mid-sweep. A sweep in progress uses the provider/model that was active when it started. |
| 2 | When a saved provider is no longer available (platform uninstalled or disabled), Puppet Master falls back to the deterministic default (§26.4) and displays a warning: *"Pass N provider [name] is unavailable; using default."* |
| 3 | Per-pass settings are preserved across app restarts. |
| 4 | All three pass selectors are independently configurable: Pass 1 may use a different provider and model than Pass 2 or Pass 3. |
| 5 | The "(Default)" indicator (§26.6) is visible whenever no explicit selection has been saved for a given pass, and disappears once the user saves an explicit choice. |
| 6 | Provider and model dropdowns for all three passes draw from the same `platform_specs` data source as the §1.1 chat controls — no divergence. |
| 7 | For each pass `N`, emitted `validation_pass_report.provider` and `.model` values match resolved settings keys `validation_sweep.passN.provider` and `validation_sweep.passN.model` (see `Plans/Project_Output_Artifacts.md §10.2`). |

### 26.9 References (Section 26)

- `Plans/chain-wizard-flexibility.md §12` — Three-Pass Canonical Validation Workflow (primary specification)
- `Plans/chain-wizard-flexibility.md §3.1.1` — OpenCode provider settings surface reference
- `Plans/Project_Output_Artifacts.md §10.2` — validation pass report payload fields (`provider`, `model`)
- `Plans/Decision_Policy.md §2` — deterministic default policy
- `Plans/DRY_Rules.md` — DRY/SSOT rules
- `Plans/Contracts_V0.md` — platform_specs contract
- Section 1.1 of this document — chat platform + model controls (shared widget source)

ContractRef: ContractName:Plans/chain-wizard-flexibility.md§12, ContractName:Plans/Project_Output_Artifacts.md, PolicyRule:Decision_Policy.md§2
