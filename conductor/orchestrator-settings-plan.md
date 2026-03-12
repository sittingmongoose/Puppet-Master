# Orchestrator & Settings Plan v2

## Objective
Refine the orchestrator wizard in `@Concepts/PuppetMasterDashComp.html` to address the second round of user feedback. The goal is to separate multi-pass review settings, flesh out the fake data and interactivity across multiple steps, and implement a functional mockup for the Requirements Doc Builder flow.

## Key Files & Context
- `@Concepts/PuppetMasterDashComp.html`: The only file to be modified.

## Implementation Steps

### 1. Panel 1: Requirements Doc Builder Flow & Multi-Pass Settings
- **Builder Flow Mockup**: 
  - Wrap the current "Upload/Open Builder" buttons in a toggleable `div`.
  - Add a hidden "Builder Chat" interface (`display: none`). 
  - When the "Open Requirements Doc Builder" button is clicked, hide the buttons and show the Builder Chat.
  - The Chat interface will feature mock conversation bubbles between a "Collaborator Persona" (AI) and the user, along with an input box and a "Done - Save Draft" button to exit the flow.
- **Requirements Multi-Pass Review**:
  - Add a new "Requirements Multi-Pass Review" settings block at the bottom of the Builder & Interview Configuration card.
  - Include specific toggles for "Enable Document Validation (Pass 1)" and "Enable Canonical Alignment (Pass 2)" to clearly distinguish this from the post-interview review.

### 2. Panel 2: Interview Progress Fake Data & Interactivity
- **Interactivity**: Add inline styles (`cursor: pointer; transition: background 0.2s;`) and an on-hover effect to the `.interview-phase-step` elements in the left sidebar to make them look clickable.
- **Fake Data Expansion**: Replace the brief Architecture Draft placeholder with a much richer, longer Markdown mock document. It will include detailed sections like Framework Choice, Data Flow (with a more complex Mermaid graph), State Management, and Persistence Layers to demonstrate a real-world output.

### 3. Panel 3: Review PRD Fake Data & Interactivity
- **Interactivity**: Make the "Generated Documents" pills (`.wizard-doc-pill`) clickable by utilizing inline Javascript to swap the content of the `.wizard-binder-view` area.
- **Fake Data Expansion**: 
  - Implement a highly detailed Product Requirements Document (PRD) mock containing an Executive Summary, Functional/Non-Functional Requirements, and an Out of Scope section.
  - Provide alternative mock views for the "Contract Seeds" and "Architecture" pills so the user can see exactly how the multi-document review will function.

### 4. Panel 4: Post-Interview Multi-Pass Validation
- Rename the existing Multi-Pass Validation block to "Post-Interview Document Validation" to clarify that it operates on the documents generated during the interview (PRD, Architecture, etc.), completely separate from the Requirements Builder multi-pass.

### 5. Panel 5: Review & Start Fake Data & Interactivity
- **Interactivity**: Use inline Javascript on the "Execution Plan" and "Acceptance Manifest" pills to switch the view.
- **Fake Data Expansion**: 
  - Greatly expand the "Execution Plan" mock to show a multi-tier DAG representation (e.g., Phases 1 to 4 with explicit tasks and subagents).
  - Add a rich JSON mock for the "Acceptance Manifest" view, showcasing detailed test strategies, verification gates, and artifact paths.

## Verification & Testing
- Open `PuppetMasterDashComp.html` in a browser.
- Verify that clicking "Open Requirements Doc Builder" launches the chat flow in Panel 1.
- Confirm Multi-Pass Validation settings exist independently in both Panel 1 and Panel 4.
- Verify Panel 2 sidebar items look clickable and the Architecture draft is comprehensive.
- Click through the documents in Panel 3 (PRD, Contract Seeds) and Panel 5 (Execution Plan, Manifest) to confirm the inline JS properly swaps the detailed fake data views.
- Ensure no emojis are introduced.