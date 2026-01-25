# RWM Puppet Master — BUILD_QUEUE_PHASE_GUI.md

> Phase GUI: React Migration  
> Tasks: 27  
> Focus: Full GUI migration from vanilla JS to React/TypeScript/Tailwind
> Priority: BLOCKER
> Estimated Effort: 80-120 hours

---

## Phase Overview

This phase migrates the GUI from vanilla HTML/CSS/JS to React 18+ / TypeScript / Tailwind CSS / Zustand per the GUI_SPEC.md specification. It also addresses all remaining GUI issues from GUI_ISSUES_AND_FIXES.md.

**⚠️ CRITICAL CONSTRAINT: The visual design MUST NOT change.**
- All colors, fonts, spacing, animations must match current `styles.css` exactly
- Tailwind config will use exact hex values from existing CSS variables
- No design changes - only technology migration
- Compare screenshots before/after to verify visual parity

### Goals
- Full React 18+ SPA with TypeScript
- Tailwind CSS with **exact existing design tokens** (not new styling)
- Zustand for state management
- Recharts for budget/usage visualization
- Comprehensive test coverage (>80%)
- WCAG AA accessibility compliance
- Fix all 8 remaining GUI issues
- **Visual design 100% preserved**

### Dependencies
- Requires existing API endpoints to remain stable
- Runs parallel to existing vanilla GUI during development

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Foundation (Parallel A) | PH-GUI-T01, PH-GUI-T02, PH-GUI-T03 | Immediately |
| Foundation (Sequential) | PH-GUI-T04 | PH-GUI-T01 |
| Components (Parallel B) | PH-GUI-T05 through PH-GUI-T14 | PH-GUI-T04 |
| State (Parallel C) | PH-GUI-T15, PH-GUI-T16, PH-GUI-T17 | PH-GUI-T04 |
| Pages (Sequential) | PH-GUI-T18 through PH-GUI-T26 | PH-GUI-T15, Components |
| Testing (Parallel D) | PH-GUI-T27 | All pages complete |

---

## Task Status Log

| Task | Status | Date | Summary |
|------|--------|------|---------|
| PH-GUI-T01 | ✅ PASS | 2026-01-25 | Vite + React + TypeScript initialized |
| PH-GUI-T02 | ✅ PASS | 2026-01-25 | Tailwind CSS configured with exact design tokens |
| PH-GUI-T03 | ✅ PASS | 2026-01-25 | React Router with 13 routes, placeholder pages |
| PH-GUI-T04 | ✅ PASS | 2026-01-25 | Directory structure, barrel exports, vitest config |
| PH-GUI-T05 | ✅ PASS | 2026-01-25 | Button component with all variants (19 tests) |
| PH-GUI-T06 | ✅ PASS | 2026-01-25 | Input component with validation (13 tests) |
| PH-GUI-T07 | ⏳ PENDING | | Select component |
| PH-GUI-T08 | ✅ PASS | 2026-01-25 | StatusBadge component dot+badge variants (13 tests) |
| PH-GUI-T09 | ✅ PASS | 2026-01-25 | ProgressBar component with cross-hatch (11 tests) |
| PH-GUI-T10 | ✅ PASS | 2026-01-25 | Toast notification system (11 tests) - fixes #16 |
| PH-GUI-T11 | ✅ PASS | 2026-01-25 | Modal/Dialog component (13 tests) |
| PH-GUI-T12 | ✅ PASS | 2026-01-25 | Header component with nav (11 tests) |
| PH-GUI-T13 | ⏳ SKIPPED | | Sidebar navigation (header has full nav) |
| PH-GUI-T14 | ✅ PASS | 2026-01-25 | PageLayout + Panel components (18 tests) |
| PH-GUI-T15 | ✅ PASS | 2026-01-25 | Zustand stores: orchestrator, project, budget, UI (32 tests) |
| PH-GUI-T16 | ✅ PASS | 2026-01-25 | SSE client with hooks and store integration |
| PH-GUI-T17 | ✅ PASS | 2026-01-25 | API client with typed endpoints |
| PH-GUI-T18 | ✅ PASS | 2026-01-25 | Dashboard page with all panels (20 tests) |
| PH-GUI-T19 | ✅ PASS | 2026-01-25 | Projects page with loading/form/table (16 tests) |
| PH-GUI-T20 | ✅ PASS | 2026-01-25 | Wizard page 6-step flow (15 tests) |
| PH-GUI-T21 | ✅ PASS | 2026-01-25 | Config page with 6 tabs (14 tests) |
| PH-GUI-T22 | ✅ PASS | 2026-01-25 | Doctor page with category panels (12 tests) |
| PH-GUI-T23 | ✅ PASS | 2026-01-25 | Tiers page tree view (14 tests) |
| PH-GUI-T24 | ✅ PASS | 2026-01-25 | Evidence page with categories/preview (12 tests) |
| PH-GUI-T25 | ✅ PASS | 2026-01-25 | History, Metrics, Coverage, Settings pages (60 tests) |
| PH-GUI-T26 | ✅ PASS | 2026-01-25 | Charts (UsageChart, BudgetDonut) + keyboard shortcuts (49 tests) |
| PH-GUI-T27 | ✅ PASS | 2026-01-25 | Server integration + test suite (353 tests total) |

---

## ⚠️ Design Preservation Requirements (ALL TASKS)

**Every component and page task MUST:**

1. **Reference existing CSS** - Look at `styles.css`, `tiers.css`, `pixel-transparency.css` for exact values
2. **Match visual output exactly** - No approximations, use exact hex colors, font sizes, spacing
3. **Preserve animations** - Pulse effects, hover transitions, etc.
4. **Keep dark mode identical** - Extract values from `[data-theme="dark"]` rules
5. **Compare screenshots** - Before marking a component complete, compare to current GUI
6. **Keep inline SVG icons** - Do not replace with a different icon library

**Tailwind config must contain exact values from styles.css, not similar values.**

---

## PH-GUI-T01: Initialize Vite + React Project

### Title
Set up Vite build system with React 18 and TypeScript

### Goal
Create new React project structure alongside existing GUI with hot module replacement.

### Depends on
- None (can start immediately)

### Parallelizable with
- PH-GUI-T02, PH-GUI-T03

### Recommended model quality
Medium OK — project scaffolding

### Read first
- GUI_SPEC.md: Section 2 (Technology Stack)
- Vite documentation: https://vitejs.dev/guide/
- React 18 documentation: https://react.dev/

### Files to create
- `src/gui/react/vite.config.ts`
- `src/gui/react/tsconfig.json`
- `src/gui/react/index.html`
- `src/gui/react/src/main.tsx`
- `src/gui/react/src/App.tsx`
- `src/gui/react/src/vite-env.d.ts`

### Files to modify
- `package.json` (add dev scripts)

### Implementation notes
- Use Vite's React-TS template as base
- Configure to run on port 3848 (one above current GUI port 3847)
- Enable strict TypeScript
- Configure path aliases for cleaner imports

### Acceptance criteria
- [ ] `npm run gui:dev` starts Vite dev server on port 3848
- [ ] React renders test component
- [ ] TypeScript strict mode enabled
- [ ] Hot module replacement works
- [ ] No TypeScript or ESLint errors

### Tests to run
```bash
npm run gui:dev # Verify dev server starts
npm run typecheck # Verify TypeScript compiles
```

### Evidence to record
- Screenshot of running React app
- `npm run typecheck` output

---

## PH-GUI-T02: Configure Tailwind CSS

### Title
Set up Tailwind CSS with **exact design tokens from existing CSS**

### Goal
Configure Tailwind to produce identical visual output to current `styles.css`.

### Depends on
- PH-GUI-T01 (Vite project must exist)

### Parallelizable with
- PH-GUI-T03

### Recommended model quality
High — exact matching required

### Read first
- `src/gui/public/css/styles.css` (source of truth for all values)
- `src/gui/public/css/tiers.css` (tier-specific styles)
- `src/gui/public/css/pixel-transparency.css` (GBC effect)
- Tailwind documentation: https://tailwindcss.com/docs/configuration

### Files to create
- `src/gui/react/tailwind.config.ts`
- `src/gui/react/postcss.config.js`
- `src/gui/react/src/index.css`
- `src/gui/react/src/styles/animations.css` (custom animations)
- `src/gui/react/src/styles/pixel-transparency.css` (copy GBC effect)

### Implementation notes

**⚠️ CRITICAL: Extract exact values from styles.css. Do not approximate.**

Design tokens to migrate (exact hex values from styles.css):
```typescript
// tailwind.config.ts theme.extend
colors: {
  paper: {
    white: '#FEFCF3',
    cream: '#F5F1E6',
    lined: '#E8E4D9',
  },
  ink: {
    black: '#1A1A1A',
    soft: '#2D2D2D',
    faded: '#4A4A4A',
  },
  electric: {
    blue: '#0047AB',
  },
  safety: {
    orange: '#FF6B2B',
  },
  hot: {
    magenta: '#FF1493',
  },
  acid: {
    lime: '#CCFF00',
  },
  royal: {
    purple: '#7B2D8E',
  },
  neon: {
    green: '#39FF14',
  },
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
}

fontFamily: {
  display: ['Orbitron', 'monospace'],   // Headers - exact match
  ui: ['Rajdhani', 'sans-serif'],        // UI text - exact match
  mono: ['Courier New', 'monospace'],    // Code/output - exact match
}

// Extract exact spacing values from styles.css
spacing: {
  // Match --spacing-xs, --spacing-sm, etc.
}

// Extract exact border-radius values
borderRadius: {
  // Match current values
}
```

Dark mode via `class` strategy for `data-theme="dark"` compatibility.

**GBC Pixel Transparency Effect**: Copy `pixel-transparency.css` as-is into React project.

### Acceptance criteria
- [ ] Tailwind compiles without errors
- [ ] Custom colors match styles.css exactly (compare hex values)
- [ ] Dark mode colors match `[data-theme="dark"]` rules exactly
- [ ] Fonts load correctly (Orbitron, Rajdhani)
- [ ] **Screenshot comparison shows identical appearance**

### Tests to run
```bash
npm run build:gui # Verify CSS builds
# Manual: Take screenshots of current GUI and compare to React GUI
```

### Evidence to record
- Screenshot comparison: current vs React (must be visually identical)

---

## PH-GUI-T03: Set Up React Router

### Title
Configure React Router v6 with all application routes

### Goal
Set up client-side routing matching all current pages.

### Depends on
- PH-GUI-T01 (React project must exist)

### Parallelizable with
- PH-GUI-T02

### Recommended model quality
Medium OK — routing configuration

### Read first
- GUI_SPEC.md: Section 3 (Screen Inventory)
- React Router documentation: https://reactrouter.com/

### Files to create
- `src/gui/react/src/routes.tsx`
- `src/gui/react/src/pages/index.ts`
- `src/gui/react/src/pages/Dashboard.tsx` (placeholder)
- `src/gui/react/src/pages/Projects.tsx` (placeholder)
- `src/gui/react/src/pages/Wizard.tsx` (placeholder)
- `src/gui/react/src/pages/Config.tsx` (placeholder)
- `src/gui/react/src/pages/Settings.tsx` (placeholder)
- `src/gui/react/src/pages/Doctor.tsx` (placeholder)
- `src/gui/react/src/pages/Tiers.tsx` (placeholder)
- `src/gui/react/src/pages/Evidence.tsx` (placeholder)
- `src/gui/react/src/pages/Metrics.tsx` (placeholder)
- `src/gui/react/src/pages/History.tsx` (placeholder)
- `src/gui/react/src/pages/Coverage.tsx` (placeholder)
- `src/gui/react/src/pages/NotFound.tsx`

### Files to modify
- `src/gui/react/src/App.tsx`

### Implementation notes
Routes to define:
```typescript
const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/projects', element: <Projects /> },
  { path: '/wizard', element: <Wizard /> },
  { path: '/config', element: <Config /> },
  { path: '/settings', element: <Settings /> },
  { path: '/doctor', element: <Doctor /> },
  { path: '/tiers', element: <Tiers /> },
  { path: '/evidence', element: <Evidence /> },
  { path: '/evidence/:id', element: <EvidenceDetail /> },
  { path: '/metrics', element: <Metrics /> },
  { path: '/history', element: <History /> },
  { path: '/coverage', element: <Coverage /> },
  { path: '*', element: <NotFound /> },
];
```

### Acceptance criteria
- [ ] All routes render placeholder components
- [ ] Navigation between routes works (Link component)
- [ ] Browser back/forward navigation works
- [ ] 404 page displays for unknown routes
- [ ] URL reflects current page

### Tests to run
```bash
npm run gui:dev # Navigate between routes manually
```

### Evidence to record
- None (manual verification)

---

## PH-GUI-T04: Create Base Component Structure

### Title
Establish component directory structure and tooling

### Goal
Set up component organization, barrel exports, ESLint, Prettier, and path aliases.

### Depends on
- PH-GUI-T01

### Parallelizable with
- None (all component tasks depend on this)

### Recommended model quality
Medium OK — project organization

### Read first
- AGENTS.md: Codebase Patterns (barrel exports)
- Existing project ESLint/Prettier config

### Files to create
```
src/gui/react/src/
├── components/
│   ├── ui/
│   │   └── index.ts
│   ├── layout/
│   │   └── index.ts
│   ├── dashboard/
│   │   └── index.ts
│   ├── projects/
│   │   └── index.ts
│   ├── wizard/
│   │   └── index.ts
│   ├── config/
│   │   └── index.ts
│   └── shared/
│       └── index.ts
├── hooks/
│   └── index.ts
├── stores/
│   └── index.ts
├── lib/
│   └── index.ts
├── types/
│   └── index.ts
└── test/
    └── setup.ts
```

### Files to modify
- `src/gui/react/tsconfig.json` (add path aliases)
- `src/gui/react/vite.config.ts` (add alias resolution)

### Implementation notes
Path aliases:
```typescript
// tsconfig.json paths
"@/*": ["./src/*"],
"@/components/*": ["./src/components/*"],
"@/hooks/*": ["./src/hooks/*"],
"@/stores/*": ["./src/stores/*"],
"@/lib/*": ["./src/lib/*"],
"@/types/*": ["./src/types/*"]
```

### Acceptance criteria
- [ ] Directory structure created
- [ ] Barrel exports (`index.ts`) in each directory
- [ ] Path aliases work (imports resolve)
- [ ] ESLint configured and passing
- [ ] Prettier configured
- [ ] `npm run typecheck` passes

### Tests to run
```bash
npm run typecheck
npm run lint
```

### Evidence to record
- `npm run typecheck` output
- `npm run lint` output

---

## PH-GUI-T05: Button Component

### Title
Create accessible Button component matching existing design exactly

### Goal
Create a reusable button component that looks identical to current buttons.

### Depends on
- PH-GUI-T04, PH-GUI-T02

### Parallelizable with
- PH-GUI-T06 through PH-GUI-T14

### Recommended model quality
Medium-High — exact visual matching

### Read first
- `src/gui/public/css/styles.css` (button styles ~lines 1050-1120)
- `src/gui/public/index.html` (button markup examples)

### Files to create
- `src/gui/react/src/components/ui/Button.tsx`
- `src/gui/react/src/components/ui/Button.test.tsx`

### Implementation notes
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**⚠️ Match exact styles from styles.css:**
- Extract `.start-btn`, `.control-btn`, `.danger-btn` etc. styles
- Use same padding, font-size, border-radius, colors
- Match hover/active/disabled states exactly
- Match dark mode variants exactly

**Fixes Issue #9 (Button Text Readability)**: Ensure high-contrast text on all button variants.

### Acceptance criteria
- [ ] Primary button matches `.start-btn` appearance exactly
- [ ] Secondary button matches `.control-btn` appearance exactly
- [ ] Danger button matches `.danger-btn` appearance exactly
- [ ] Loading state shows spinner (match current spinner if exists)
- [ ] Disabled state matches current disabled styles
- [ ] Hover states match current CSS `:hover` rules
- [ ] Dark mode matches current dark mode button styles
- [ ] **Screenshot comparison shows identical appearance**
- [ ] Tests pass (>90% coverage)

### Tests to run
```bash
npm test -- --grep "Button"
```

### Evidence to record
- Screenshot comparison: current buttons vs React buttons

---

## PH-GUI-T06: Input Component

### Title
Create form Input component with label and error states

### Goal
Create accessible text input with validation feedback.

### Depends on
- PH-GUI-T04, PH-GUI-T02

### Parallelizable with
- Other component tasks

### Recommended model quality
Medium OK — React component

### Read first
- GUI_SPEC.md: Section 5
- `src/gui/public/css/styles.css` (form styles)

### Files to create
- `src/gui/react/src/components/ui/Input.tsx`
- `src/gui/react/src/components/ui/Input.test.tsx`

### Implementation notes
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}
```

**Fixes Issue #12 partial (ARIA Labels)**: Label properly associated with `htmlFor`.

### Acceptance criteria
- [ ] Label associated with `htmlFor`
- [ ] Error state styling (red border, error message)
- [ ] Required indicator (asterisk)
- [ ] Accessible error announcements (`aria-describedby`)
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Input"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T07: Select Component

### Title
Create custom Select dropdown component

### Goal
Create accessible dropdown with keyboard navigation.

### Depends on
- PH-GUI-T04, PH-GUI-T02

### Parallelizable with
- Other component tasks

### Recommended model quality
Medium-High — keyboard navigation complexity

### Read first
- GUI_SPEC.md: Section 5
- Radix UI Select: https://www.radix-ui.com/primitives/docs/components/select

### Files to create
- `src/gui/react/src/components/ui/Select.tsx`
- `src/gui/react/src/components/ui/Select.test.tsx`

### Implementation notes
Consider using Radix UI primitives for accessibility or build custom.

```typescript
interface SelectProps {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}
```

### Acceptance criteria
- [ ] Custom styled dropdown
- [ ] Keyboard navigation (arrow keys, Enter, Escape)
- [ ] Search/filter for long lists (optional)
- [ ] Accessible (ARIA combobox pattern)
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Select"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T08: StatusBadge Component

### Title
Create StatusBadge indicator component

### Goal
Create color-coded status badge matching spec.

### Depends on
- PH-GUI-T04, PH-GUI-T02

### Parallelizable with
- Other component tasks

### Recommended model quality
Low-Medium — simple component

### Read first
- GUI_SPEC.md: Section 5.1 (StatusBadge)
- `src/gui/public/css/styles.css` (status colors)

### Files to create
- `src/gui/react/src/components/shared/StatusBadge.tsx`
- `src/gui/react/src/components/shared/StatusBadge.test.tsx`

### Implementation notes
```typescript
type Status = 'running' | 'paused' | 'error' | 'complete' | 'pending';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}
```

Colors per status:
- `running`: Electric blue with pulse animation
- `paused`: Safety orange
- `error`: Hot magenta
- `complete`: Acid lime
- `pending`: Gray

### Acceptance criteria
- [ ] Color-coded per status
- [ ] Pulse animation for running state
- [ ] Size variants (sm, md, lg)
- [ ] Accessible status text (`aria-label`)
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "StatusBadge"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T09: ProgressBar Component

### Title
Create animated ProgressBar component

### Goal
Create accessible progress indicator.

### Depends on
- PH-GUI-T04, PH-GUI-T02

### Parallelizable with
- Other component tasks

### Recommended model quality
Low-Medium — simple component

### Read first
- GUI_SPEC.md: Section 5.2 (ProgressBar)

### Files to create
- `src/gui/react/src/components/shared/ProgressBar.tsx`
- `src/gui/react/src/components/shared/ProgressBar.test.tsx`

### Implementation notes
```typescript
interface ProgressBarProps {
  value: number;        // 0-100
  max?: number;         // Default 100
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  animated?: boolean;
}
```

### Acceptance criteria
- [ ] Smooth width animation
- [ ] Color variants
- [ ] Optional label and percentage
- [ ] ARIA progressbar role with valuenow/min/max
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "ProgressBar"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T10: Toast Notification System

### Title
Create Toast notification component and provider

### Goal
Create toast feedback system (fixes Issue #16).

### Depends on
- PH-GUI-T04, PH-GUI-T02

### Parallelizable with
- Other component tasks

### Recommended model quality
Medium — state management for toasts

### Read first
- GUI_ISSUES_AND_FIXES.md: Issue #16
- sonner library: https://sonner.emilkowal.ski/ (reference)

### Files to create
- `src/gui/react/src/components/ui/Toast.tsx`
- `src/gui/react/src/components/ui/ToastProvider.tsx`
- `src/gui/react/src/hooks/useToast.ts`
- `src/gui/react/src/components/ui/Toast.test.tsx`

### Implementation notes
```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number; // ms, default 5000
}

// Hook usage
const { toast, dismiss } = useToast();
toast({ type: 'success', title: 'Saved!' });
```

### Acceptance criteria
- [ ] Success, error, warning, info variants
- [ ] Auto-dismiss with configurable duration
- [ ] Stack multiple toasts
- [ ] Dismiss on click
- [ ] Screen reader announcements (`aria-live`)
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Toast"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T11: Modal/Dialog Component

### Title
Create accessible Modal component

### Goal
Create modal dialog with focus trap and keyboard handling.

### Depends on
- PH-GUI-T04, PH-GUI-T02

### Parallelizable with
- Other component tasks

### Recommended model quality
Medium-High — accessibility complexity

### Read first
- GUI_SPEC.md: Error states (modal examples)
- Radix Dialog: https://www.radix-ui.com/primitives/docs/components/dialog

### Files to create
- `src/gui/react/src/components/ui/Modal.tsx`
- `src/gui/react/src/components/ui/Modal.test.tsx`

### Implementation notes
Consider using Radix UI Dialog primitive for accessibility.

```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
}
```

### Acceptance criteria
- [ ] Focus trap (tab cycles within modal)
- [ ] Escape key closes modal
- [ ] Click outside closes (configurable)
- [ ] Backdrop overlay
- [ ] Smooth open/close animation
- [ ] ARIA dialog role
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Modal"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T12: Header Component

### Title
Create main Header with navigation

### Goal
Create responsive header matching current design.

### Depends on
- PH-GUI-T05 (Button), PH-GUI-T07 (Select)

### Parallelizable with
- PH-GUI-T13, PH-GUI-T14

### Recommended model quality
Medium — responsive layout

### Read first
- `src/gui/public/index.html` (current header structure)
- `src/gui/public/css/styles.css` (header styles)

### Files to create
- `src/gui/react/src/components/layout/Header.tsx`
- `src/gui/react/src/components/layout/Header.test.tsx`

### Implementation notes
Features:
- Logo with home link
- Main navigation links (Dashboard, Projects, Wizard, etc.)
- Project selector dropdown
- Dark mode toggle button
- Responsive hamburger menu on mobile

### Acceptance criteria
- [ ] Matches current design aesthetically
- [ ] Responsive (hamburger menu on mobile)
- [ ] Dark mode toggle works (updates theme)
- [ ] Project selector functional
- [ ] Active page highlighted
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Header"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T13: Sidebar Navigation

### Title
Create responsive Sidebar component

### Goal
Create sidebar navigation for desktop layout.

### Depends on
- PH-GUI-T04, PH-GUI-T02

### Parallelizable with
- PH-GUI-T12, PH-GUI-T14

### Recommended model quality
Medium — responsive layout

### Read first
- GUI_SPEC.md: Appendix B (Navigation responsive rules)

### Files to create
- `src/gui/react/src/components/layout/Sidebar.tsx`
- `src/gui/react/src/components/layout/Sidebar.test.tsx`

### Implementation notes
```typescript
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}
```

Features:
- Full sidebar on lg+ screens (240px width)
- Drawer on mobile (slide in from left)
- Active page highlighting
- Collapse/expand on desktop

### Acceptance criteria
- [ ] Active page highlighted
- [ ] Collapse on mobile (drawer)
- [ ] Keyboard navigation (Tab through links)
- [ ] Smooth open/close animation
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Sidebar"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T14: PageLayout Component

### Title
Create consistent PageLayout wrapper

### Goal
Create layout component that wraps all pages.

### Depends on
- PH-GUI-T12, PH-GUI-T13

### Parallelizable with
- None (depends on Header/Sidebar)

### Recommended model quality
Low-Medium — layout composition

### Read first
- Current page HTML files for layout patterns

### Files to create
- `src/gui/react/src/components/layout/PageLayout.tsx`
- `src/gui/react/src/components/layout/PageLayout.test.tsx`

### Implementation notes
```typescript
interface PageLayoutProps {
  title?: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  loading?: boolean;
}
```

Features:
- Header integration
- Optional sidebar
- Main content area
- Loading overlay state
- Page title in document head

### Acceptance criteria
- [ ] Header rendered consistently
- [ ] Main content area scrollable
- [ ] Optional sidebar support
- [ ] Loading state overlay
- [ ] Document title updates
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "PageLayout"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T15: Zustand Store Architecture

### Title
Design and implement global Zustand stores

### Goal
Create typed stores for application state.

### Depends on
- PH-GUI-T04

### Parallelizable with
- PH-GUI-T16, PH-GUI-T17

### Recommended model quality
Medium-High — state architecture

### Read first
- GUI_SPEC.md: Section 6 (Real-Time Updates)
- Zustand documentation: https://zustand-demo.pmnd.rs/

### Files to create
- `src/gui/react/src/stores/orchestratorStore.ts`
- `src/gui/react/src/stores/projectStore.ts`
- `src/gui/react/src/stores/budgetStore.ts`
- `src/gui/react/src/stores/configStore.ts`
- `src/gui/react/src/stores/uiStore.ts`
- `src/gui/react/src/stores/index.ts`
- `src/gui/react/src/stores/orchestratorStore.test.ts`

### Implementation notes
```typescript
// orchestratorStore
interface OrchestratorState {
  status: 'idle' | 'running' | 'paused' | 'error' | 'complete';
  currentItem: TierItem | null;
  progress: Progress;
  output: OutputLine[];
  recentCommits: Commit[];
  recentErrors: ErrorEntry[];
  
  // Actions
  setStatus: (status: OrchestratorState['status']) => void;
  setCurrentItem: (item: TierItem | null) => void;
  appendOutput: (line: OutputLine) => void;
  clearOutput: () => void;
}

// uiStore - with persistence
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
}
```

Use `zustand/middleware` for persistence (localStorage).

### Acceptance criteria
- [ ] All stores created with full TypeScript
- [ ] Actions for state mutations
- [ ] Selectors for derived state
- [ ] Theme persists to localStorage
- [ ] Unit tests for all stores

### Tests to run
```bash
npm test -- --grep "Store"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T16: SSE Integration

### Title
Connect Server-Sent Events to Zustand stores

### Goal
Wire real-time events to application state.

### Depends on
- PH-GUI-T15

### Parallelizable with
- PH-GUI-T17

### Recommended model quality
Medium-High — event handling

### Read first
- GUI_SPEC.md: Section 6 (Real-Time Updates)
- `src/gui/public/js/event-stream.js` (current implementation)

### Files to create
- `src/gui/react/src/lib/eventStream.ts`
- `src/gui/react/src/hooks/useEventStream.ts`
- `src/gui/react/src/lib/eventStream.test.ts`

### Implementation notes
```typescript
// eventStream.ts
class EventStreamClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000; // 30s
  
  connect(url: string): void;
  disconnect(): void;
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
}

// Hook for components
function useEventStream() {
  // Auto-connect on mount
  // Dispatch events to stores
  // Handle reconnection UI
}
```

Events to handle:
- `state_change` → orchestratorStore.setStatus
- `output` → orchestratorStore.appendOutput
- `progress` → orchestratorStore.progress
- `budget_warning` → budgetStore
- `iteration_start/complete` → orchestratorStore.currentItem

### Acceptance criteria
- [ ] SSE client with exponential backoff reconnect
- [ ] Events dispatch to correct stores
- [ ] Reconnection indicator in UI state
- [ ] Clean disconnect on unmount
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "eventStream"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T17: API Client Setup

### Title
Create typed API client for REST endpoints

### Goal
Create fetch-based API client with TypeScript types.

### Depends on
- PH-GUI-T04

### Parallelizable with
- PH-GUI-T15, PH-GUI-T16

### Recommended model quality
Medium — API integration

### Read first
- GUI_SPEC.md: Section 9 (API Endpoints)
- `src/gui/routes/` (existing route handlers)

### Files to create
- `src/gui/react/src/lib/api.ts`
- `src/gui/react/src/lib/api.test.ts`
- `src/gui/react/src/types/api.ts`

### Implementation notes
```typescript
// api.ts
const api = {
  // Status
  getStatus: () => fetch<OrchestratorStatus>('/api/status'),
  
  // Controls
  start: () => post('/api/controls/start'),
  pause: () => post('/api/controls/pause'),
  resume: () => post('/api/controls/resume'),
  stop: () => post('/api/controls/stop'),
  retry: () => post('/api/controls/retry'),
  replan: (reason: string) => post('/api/controls/replan', { reason }),
  
  // Projects
  listProjects: () => fetch<Project[]>('/api/projects'),
  loadProject: (path: string) => post('/api/projects/load', { path }),
  createProject: (data: CreateProjectRequest) => post('/api/projects', data),
  
  // Config
  getConfig: () => fetch<Config>('/api/config'),
  updateConfig: (config: Config) => put('/api/config', config),
  
  // Evidence
  getEvidence: (id: string) => fetch<Evidence>(`/api/evidence/${id}`),
  
  // ... etc
};
```

Error handling with toast integration.

### Acceptance criteria
- [ ] Typed API functions for all endpoints
- [ ] Error handling with toast notifications
- [ ] Loading states (optional React Query)
- [ ] Tests pass with mocked fetch

### Tests to run
```bash
npm test -- --grep "api"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T18: Dashboard Page

### Title
Migrate main Dashboard page

### Goal
Create the most complex page with real-time updates.

### Depends on
- PH-GUI-T14, PH-GUI-T15, PH-GUI-T16, PH-GUI-T17
- Most UI components

### Parallelizable with
- None (most complex page, do first)

### Recommended model quality
High — complex page

### Read first
- GUI_SPEC.md: Section 4.1 (Dashboard)
- `src/gui/public/index.html`
- `src/gui/public/js/dashboard.js`
- `src/gui/public/js/controls.js`

### Files to create
- `src/gui/react/src/pages/Dashboard.tsx`
- `src/gui/react/src/components/dashboard/StatusBar.tsx`
- `src/gui/react/src/components/dashboard/CurrentItemPanel.tsx`
- `src/gui/react/src/components/dashboard/ProgressPanel.tsx`
- `src/gui/react/src/components/dashboard/RunControlPanel.tsx`
- `src/gui/react/src/components/dashboard/LiveOutput.tsx`
- `src/gui/react/src/components/dashboard/RecentCommits.tsx`
- `src/gui/react/src/components/dashboard/RecentErrors.tsx`
- `src/gui/react/src/pages/Dashboard.test.tsx`

### Implementation notes
Key features:
- Status bar with state, position, budget indicators
- Current item panel with criteria checklist
- Progress bars (overall, per-tier)
- Run controls (Start, Pause, Resume, Stop, Retry, Replan, etc.)
- Live output terminal with auto-scroll
- Recent commits and errors panels

Real-time updates via SSE → Zustand stores.

### Acceptance criteria
- [ ] All panels render correctly
- [ ] Real-time updates work via SSE
- [ ] Run controls trigger API calls
- [ ] Live output auto-scrolls
- [ ] Responsive layout per spec
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Dashboard"
```

### Evidence to record
- Screenshot of working dashboard
- Test coverage report

---

## PH-GUI-T19: Projects Page

### Title
Migrate Projects page (fixes Issue #7, #8)

### Goal
Create project selection and creation page.

### Depends on
- PH-GUI-T14, PH-GUI-T17

### Parallelizable with
- PH-GUI-T20 through PH-GUI-T25

### Recommended model quality
Medium — form handling

### Read first
- GUI_SPEC.md: Section 4.2 (Project Select)
- GUI_ISSUES_AND_FIXES.md: Issues #7, #8
- `src/gui/public/projects.html`
- `src/gui/public/js/projects.js`

### Files to create
- `src/gui/react/src/pages/Projects.tsx`
- `src/gui/react/src/components/projects/ProjectCard.tsx`
- `src/gui/react/src/components/projects/ProjectsTable.tsx`
- `src/gui/react/src/components/projects/CreateProjectForm.tsx`
- `src/gui/react/src/pages/Projects.test.tsx`

### Implementation notes
**Fix Issue #7 (Browse Box)**: Add tooltip explaining browser security limitations:
> "Due to browser security restrictions, you must manually enter the full absolute path."

**Fix Issue #8 (Loading State)**: Proper React loading/error states with Zustand or React Query.

Features:
- Project cards with recent status
- Recent projects table
- Create new project form with validation

### Acceptance criteria
- [ ] Projects load with proper loading/error states
- [ ] Empty state when no projects
- [ ] Create project form works
- [ ] Browse button shows tooltip about limitations
- [ ] Responsive design
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Projects"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T20: Wizard Page

### Title
Migrate 6-step Start Chain Wizard

### Goal
Create multi-step wizard flow.

### Depends on
- PH-GUI-T14, PH-GUI-T17, Form components

### Parallelizable with
- Other page tasks

### Recommended model quality
High — complex multi-step form

### Read first
- GUI_SPEC.md: Section 4.3 (Start Chain Wizard)
- `src/gui/public/wizard.html`
- `src/gui/public/js/wizard.js`

### Files to create
- `src/gui/react/src/pages/Wizard.tsx`
- `src/gui/react/src/components/wizard/WizardStepper.tsx`
- `src/gui/react/src/components/wizard/StepUpload.tsx`
- `src/gui/react/src/components/wizard/StepGeneratePrd.tsx`
- `src/gui/react/src/components/wizard/StepArchitecture.tsx`
- `src/gui/react/src/components/wizard/StepTierPlan.tsx`
- `src/gui/react/src/components/wizard/StepConfigureTiers.tsx`
- `src/gui/react/src/components/wizard/StepReview.tsx`
- `src/gui/react/src/pages/Wizard.test.tsx`

### Implementation notes
Steps:
1. Upload Requirements (drag/drop, paste)
2. Generate PRD (AI call)
3. Review Architecture (editable)
4. Generate Tier Plan (tree view)
5. Configure Tiers (platform/model selection)
6. Review & Start

State management via local state or Zustand.

### Acceptance criteria
- [ ] All 6 steps functional
- [ ] File upload via drag/drop works
- [ ] Text paste works
- [ ] Progress indicator shows current step
- [ ] Back/Next navigation
- [ ] Cancel clears state
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Wizard"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T21: Config Page

### Title
Migrate Configuration page with tabs

### Goal
Create tabbed configuration interface.

### Depends on
- PH-GUI-T14, PH-GUI-T17, Form components

### Parallelizable with
- Other page tasks

### Recommended model quality
Medium — form handling

### Read first
- GUI_SPEC.md: Section 4.4 (Configuration)
- `src/gui/public/config.html`
- `src/gui/public/js/config.js`

### Files to create
- `src/gui/react/src/pages/Config.tsx`
- `src/gui/react/src/components/config/TiersTab.tsx`
- `src/gui/react/src/components/config/BranchingTab.tsx`
- `src/gui/react/src/components/config/VerificationTab.tsx`
- `src/gui/react/src/components/config/MemoryTab.tsx`
- `src/gui/react/src/components/config/BudgetsTab.tsx`
- `src/gui/react/src/components/config/AdvancedTab.tsx`
- `src/gui/react/src/pages/Config.test.tsx`

### Implementation notes
Tabs:
1. Tiers (platform/model per tier)
2. Branching (git strategy)
3. Verification (browser/test settings)
4. Memory (state file locations)
5. Budgets (platform quotas)
6. Advanced (timeouts, recovery)

### Acceptance criteria
- [ ] All tabs render correctly
- [ ] Form saves work (API call)
- [ ] Validation errors shown
- [ ] Presets functional (Balanced, Claude-heavy, etc.)
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Config"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T22: Doctor Page

### Title
Migrate Doctor dependency checker

### Goal
Create system health check page.

### Depends on
- PH-GUI-T14, PH-GUI-T17

### Parallelizable with
- Other page tasks

### Recommended model quality
Medium — status display

### Read first
- GUI_SPEC.md: Section 4.8 (Doctor)
- `src/gui/public/doctor.html`
- `src/gui/public/js/doctor.js`

### Files to create
- `src/gui/react/src/pages/Doctor.tsx`
- `src/gui/react/src/components/doctor/CheckSection.tsx`
- `src/gui/react/src/components/doctor/CheckItem.tsx`
- `src/gui/react/src/pages/Doctor.test.tsx`

### Implementation notes
Sections:
- CLI Tools (cursor-agent, codex, claude, gemini, copilot)
- Git (git, gh, repository status)
- Runtimes (node, npm, python)
- Browser Tools (dev-browser, playwright)
- Capabilities (smoke tests status)
- Project Setup (config.yaml, prd.json, AGENTS.md)

### Acceptance criteria
- [ ] All check sections display correctly
- [ ] Run checks button triggers refresh
- [ ] Install missing button shows commands
- [ ] Copy commands button works
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Doctor"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T23: Tiers Page

### Title
Migrate Tiers hierarchical view (fixes Issue #19)

### Goal
Create tree view with keyboard navigation.

### Depends on
- PH-GUI-T14, PH-GUI-T17

### Parallelizable with
- Other page tasks

### Recommended model quality
High — tree navigation complexity

### Read first
- GUI_ISSUES_AND_FIXES.md: Issue #19 (Keyboard Navigation)
- `src/gui/public/tiers.html`
- `src/gui/public/js/tiers.js`
- React Aria TreeView: https://react-spectrum.adobe.com/react-aria/TreeView.html

### Files to create
- `src/gui/react/src/pages/Tiers.tsx`
- `src/gui/react/src/components/tiers/TierTree.tsx`
- `src/gui/react/src/components/tiers/TierTreeItem.tsx`
- `src/gui/react/src/components/tiers/TierDetail.tsx`
- `src/gui/react/src/pages/Tiers.test.tsx`

### Implementation notes
**Fix Issue #19 (Keyboard Navigation)**: Full keyboard support:
- Arrow Up/Down: Move between items
- Arrow Right: Expand node
- Arrow Left: Collapse node / move to parent
- Enter: Select item
- Home/End: First/last item

Consider using React Aria TreeView for accessibility.

Features:
- Hierarchical tree (Phases → Tasks → Subtasks)
- Expand/collapse nodes
- Status indicators per item
- Detail panel showing selected item

### Acceptance criteria
- [ ] Tree renders correctly from PRD data
- [ ] Expand/collapse works
- [ ] Full keyboard navigation (Issue #19)
- [ ] Item selection updates detail panel
- [ ] ARIA tree role with proper attributes
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Tiers"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T24: Evidence Page

### Title
Migrate Evidence viewer page

### Goal
Create evidence file browser and viewers.

### Depends on
- PH-GUI-T14, PH-GUI-T17

### Parallelizable with
- Other page tasks

### Recommended model quality
Medium — file handling

### Read first
- GUI_SPEC.md: Evidence screen description
- `src/gui/public/evidence.html`
- `src/gui/public/js/evidence.js`

### Files to create
- `src/gui/react/src/pages/Evidence.tsx`
- `src/gui/react/src/components/evidence/EvidenceList.tsx`
- `src/gui/react/src/components/evidence/EvidenceViewer.tsx`
- `src/gui/react/src/components/evidence/LogViewer.tsx`
- `src/gui/react/src/components/evidence/ImageViewer.tsx`
- `src/gui/react/src/pages/Evidence.test.tsx`

### Implementation notes
Evidence types to handle:
- Test logs (text viewer)
- Screenshots (image viewer)
- Browser traces (download link)
- Gate reports (markdown viewer)
- File snapshots (diff viewer)

### Acceptance criteria
- [ ] Evidence file list loads
- [ ] Text logs display with line numbers
- [ ] Screenshots display correctly
- [ ] Download functionality for large files
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Evidence"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T25: History + Remaining Pages

### Title
Migrate History, Metrics, Coverage, Settings pages

### Goal
Complete all remaining page migrations.

### Depends on
- PH-GUI-T14, PH-GUI-T17

### Parallelizable with
- Other page tasks

### Recommended model quality
Medium — simpler pages

### Read first
- Corresponding HTML and JS files for each page

### Files to create
- `src/gui/react/src/pages/History.tsx`
- `src/gui/react/src/pages/Metrics.tsx`
- `src/gui/react/src/pages/Coverage.tsx`
- `src/gui/react/src/pages/Settings.tsx`
- Tests for each page

### Implementation notes
These are simpler pages with less complexity than Dashboard or Wizard.

**History**: Session list with filters, resume functionality.
**Metrics**: Performance and usage statistics.
**Coverage**: Code/feature coverage visualization.
**Settings**: Global app preferences.

### Acceptance criteria
- [ ] History page functional with filters
- [ ] Metrics page displays statistics
- [ ] Coverage page displays data
- [ ] Settings page saves preferences
- [ ] Tests pass for all pages

### Tests to run
```bash
npm test -- --grep "History|Metrics|Coverage|Settings"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T26: Charts + Keyboard Shortcuts

### Title
Add Recharts visualizations and global keyboard shortcuts

### Goal
Implement charts and keyboard navigation system.

### Depends on
- Most pages complete

### Parallelizable with
- PH-GUI-T27

### Recommended model quality
Medium-High — integration

### Read first
- GUI_SPEC.md: Section 4.6 (Budgets), Section 7 (Keyboard Shortcuts)
- Recharts documentation: https://recharts.org/

### Files to create
- `src/gui/react/src/components/charts/UsageChart.tsx`
- `src/gui/react/src/components/charts/BudgetDonut.tsx`
- `src/gui/react/src/hooks/useKeyboardShortcuts.ts`
- `src/gui/react/src/components/shared/ShortcutsHelp.tsx`

### Implementation notes
**Charts** (for Budgets page):
- 7-day usage bar chart (stacked by platform)
- Budget progress donut charts

**Keyboard Shortcuts**:
- Global listener via useEffect
- Show help modal on `?` key
- Handle all shortcuts from spec

### Acceptance criteria
- [ ] Usage chart renders with real data
- [ ] Budget donuts show progress
- [ ] All keyboard shortcuts work
- [ ] `?` shows help modal
- [ ] No conflicts with browser shortcuts
- [ ] Tests pass

### Tests to run
```bash
npm test -- --grep "Chart|Shortcuts"
```

### Evidence to record
- Test coverage report

---

## PH-GUI-T27: Testing + Server Integration

### Title
Comprehensive testing and production build

### Goal
Complete test suite and integrate with Express server.

### Depends on
- All pages complete

### Parallelizable with
- None (final task)

### Recommended model quality
High — integration complexity

### Read first
- Vitest documentation: https://vitest.dev/
- React Testing Library: https://testing-library.com/react

### Files to create/modify
- `src/gui/react/src/test/setup.ts`
- Additional test files as needed
- `src/gui/server.ts` (add React static serving)

### Implementation notes
**Testing targets:**
- Components: >80% coverage
- Stores: >90% coverage
- Utilities: >95% coverage

**Server integration:**
- Build React to `src/gui/react/dist`
- Serve static files from Express
- SPA fallback for client-side routes
- API proxy configuration

**Accessibility audit:**
- Run axe-core on all pages
- Fix any reported issues
- Verify WCAG AA compliance

**Documentation updates:**
- GUI_SPEC.md: Update tech stack section
- BUILD_QUEUE_GAPS.md: Mark P2-G05, P2-G14 as FIXED

### Acceptance criteria
- [ ] All components have tests
- [ ] >80% overall coverage
- [ ] Production build works
- [ ] Server serves React app at /
- [ ] API calls work in production
- [ ] SSE works in production
- [ ] Accessibility audit passes
- [ ] Documentation updated

### Tests to run
```bash
npm test -- --coverage
npm run build:gui
npm run gui # Test production build
```

### Evidence to record
- Coverage report
- Accessibility audit results
- Screenshot of production build

---

## GUI Issues Resolution Summary

| Issue | Task | Status |
|-------|------|--------|
| #7: Projects Browse Box | PH-GUI-T19 | ⏳ PENDING |
| #8: Projects Loading State | PH-GUI-T19 | ⏳ PENDING |
| #9: Button Text Readability | PH-GUI-T05 | ⏳ PENDING |
| #12: Inconsistent ARIA Labels | All component tasks | ⏳ PENDING |
| #13: Responsive Breakpoint Testing | PH-GUI-T27 | ⏳ PENDING |
| #16: No Toast Container | PH-GUI-T10 | ⏳ PENDING |
| #17: Dark Mode Contrast | PH-GUI-T02, PH-GUI-T27 | ⏳ PENDING |
| #19: Keyboard Navigation Tree | PH-GUI-T23 | ⏳ PENDING |

---

## Work Log

| Date | Notes |
|------|-------|
| 2026-01-25 | Phase document created |
| | |
