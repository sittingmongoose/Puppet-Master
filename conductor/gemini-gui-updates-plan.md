# Gemini Provider GUI Updates Plan

## Objective
Update the `Concepts/PuppetMasterDashComp.html` file to reflect the new Google Gemini Provider GUI specifications. The UI treats Gemini as a unified provider with grouped OAuth and API key accounts. The changes will enhance the polished, premium aesthetic of the dashboard for newbie/vibecoder users without relying on emojis, keeping the styling aligned with the established design system.

## Key Files & Context
- **Target File:** `Concepts/PuppetMasterDashComp.html`
- **Reference Docs:** `Plans/FinalGUISpec.md`, `Plans/Media_Generation_and_Capabilities.md`, `Plans/feature-list.md`, `Plans/Multi-Account.md`, `Plans/usage-feature.md`, `Plans/Contracts_V0.md`

## Implementation Steps

### 1. Settings > Authentication
- **Location:** Inside `.inspector-view[data-view="auth"]` under the `<details open><summary>Providers</summary>`.
- **Changes:**
  - Remove the standalone `<label>Gemini API Key <input type="password" value=""></label>`.
  - Introduce a comprehensive "Gemini Provider" card/section.
  - Group OAuth and API key accounts.
  - Add a dropdown for `Requested Auth Mode` (`auto`, `oauth`, `api_key`).
  - Add read-only state indicators for: `Effective Account`, `Effective Auth Mode`, `Switch Reason`, and `Cooldown`.
  - Include a nested list/grid showing per-account details: `label`, `identity`, `project`, `state`, and `priority`.

### 2. Settings > Media
- **Location:** Create a new inspector view `data-view="media"` (and add a corresponding tab in the settings sidebar) or integrate into an existing feature view.
- **Changes:**
  - Add media generation toggles.
  - Apply disabled styling to toggles if no eligible Gemini account is present.
  - Add helper text/copy for disabled states pointing users to the Authentication tab: *"Requires an eligible Gemini account. Configure in Settings &rarr; Authentication."*

### 3. Health/Doctor
- **Location:** Inside `.inspector-view[data-view="health"]` under `<summary>Diagnostics</summary>`.
- **Changes:**
  - Add specific line items for Gemini diagnostics.
  - Show "Gemini Account State", covering auth validity, configuration correctness, and availability state.

### 4. Usage UI
- **Location:** In the Dashboard Metrics/Monitoring tabs or a dedicated Usage widget (`.widget-card`).
- **Changes:**
  - Add a "Gemini Account Context" strip to the top or bottom of the usage metrics view.
  - Display the current effective account and auth mode used for quota/usage tracking.

### 5. Chat Capability Picker
- **Location:** Inside `.chat-input-area` attachment/model dropdown popovers (`.chat-dropdown-popover`).
- **Changes:**
  - When exposing media capabilities (like image generation or vision attachments), add a footer or disabled state text.
  - Use the new Gemini-access wording instead of the old "missing Google API key" wording.

### 6. Memory Tab
- **Location:** Create a new inspector view `data-view="memory"` (and a corresponding settings tab).
- **Changes:**
  - Add configuration sections for "Retrieval" and "Search".
  - Include relevant inputs/toggles for managing the assistant's memory subsystem.

## Verification & Testing
1. Open `Concepts/PuppetMasterDashComp.html` in a web browser.
2. Verify that the new Gemini Provider card in the Auth settings renders correctly and matches the premium, Slint-inspired UI style.
3. Check the Media tab for the correct disabled state copy.
4. Ensure the new Memory tab and Chat Capability Picker text are present and correctly formatted.
5. Verify no emojis were used in the updated text or elements.
