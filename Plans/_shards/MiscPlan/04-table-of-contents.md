## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Cleanup Policy](#3-cleanup-policy) (includes [3.5 DRY Method](#35-dry-method-single-source-of-truth-and-reuse), [3.6 Gitignore and security](#36-gitignore-and-security-no-secrets-to-github))
4. [Runner Contract Implementation](#4-runner-contract-implementation) (includes [4.6 Call sites](#46-call-sites-orchestrator-interview-start-chain-and-conversation), [4.7 DRY module layout and tagging](#47-dry-module-layout-naming-and-tagging), [4.8 Concrete implementation details](#48-concrete-implementation-details))
5. [Agent Output Directory](#5-agent-output-directory)
6. [Evidence Retention & Pruning](#6-evidence-retention--pruning)
7. [Cleanup UX & Config](#7-cleanup-ux--config) (includes [7.5 GUI gaps and updates](#75-gui-gaps-and-updates-consolidated), [7.6 Leveraging platform CLI capabilities](#76-leveraging-platform-cli-capabilities-hooks-skills-plugins-extensions), [7.7 Desktop Shortcuts](#77-desktop-shortcuts-gui-screen), [7.8 Agent Skills](#78-agent-skills-gui), [7.9 Backend: Desktop Shortcuts](#79-backend-desktop-shortcuts), [7.10 Backend: Agent Skills](#710-backend-agent-skills), [7.11 Shortcuts and Skills: gaps, enhancements, implementation readiness](#711-shortcuts-and-skills-gaps-enhancements-implementation-readiness), [7.11.1 Shortcuts: export/import, search/filter, discoverability](#7111-shortcuts-exportimport-searchfilter-discoverability), [7.11.2 Skills: bulk permission, sort/filter, preview, last modified, validate all](#7112-skills-bulk-permission-sortfilter-preview-last-modified-validate-all))
8. [Implementation Checklist](#8-implementation-checklist) (includes [8.1 Core cleanup module](#81-core-cleanup-module-required) through [8.10 Shortcuts and Skills: export/import, search/filter, discoverability, bulk permission, sort/filter, preview, last modified, validate all](#810-shortcuts-and-skills-exportimport-searchfilter-discoverability-bulk-permission-sortfilter-preview-last-modified-validate-all), [8.7 Pre-completion](#87-pre-completion), [8.8 Desktop Shortcuts backend](#88-desktop-shortcuts-backend-77-79), [8.9 Agent Skills backend](#89-agent-skills-backend-78-710))
9. [Risks & Notes](#9-risks--notes)
10. [Cross-Plan Dependencies and Impacts](#10-cross-plan-dependencies-and-impacts)
11. [References](#11-references)

---

