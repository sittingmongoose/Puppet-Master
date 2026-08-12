# Return Handoff — Retire All Playwright-Shaped PM Terminology

**Recipients:** Runtime/Browser/Testing/Artifacts; Commands/Wiring/DRY; Egolite & Git as supersession notice  
**Date:** 2026-08-08  
**Status:** Required terminology and architecture correction. Preserve the PM-native browser design.

## 1. Decision

Puppet Master has a **PM-native Browser Program API** over its own CEF/BrowserRuntimeService architecture.

Do not call any PM-owned surface:

```text
Playwright-familiar
Playwright-compatible
Playwright-shaped
Playwright-like
Playwright facade
Playwright object/session model
```

The prohibition includes product copy, Plan prose, type names, package names, command aliases, ports, Settings rows, Doctor checks, capability labels, benchmark labels, migration terminology, and internal architecture names.

## 2. PM-native API language

PM may independently define generic browser concepts where useful, but they are PM-owned and versioned on their own merits. Prefer PM-native names such as:

```text
BrowserRuntimeService
BrowserSessionBroker
BrowserWorkspace
BrowserPage
PageGeneration
ElementRef or LocatorRef
BrowserAction
BrowserProgram
BrowserAssertion
BrowserRoute
TestCapture
```

Using generic concepts like page, context/workspace, element/locator, action, assertion, wait, and route does not create a compatibility promise. Do not describe their shape by reference to Playwright.

## 3. Runtime prohibition

PM core has no:

- Playwright browser backend or browser process;
- Playwright server or exposed port;
- Playwright package/runtime dependency;
- Playwright MCP route;
- Playwright fallback;
- `cmd.playwright.*` command family or alias;
- Playwright-owned context-video capture engine;
- Playwright support bundle in Settings, Onboarding, Doctor, containers, WSL, or Tool Store.

PM-native capture remains CEF/compositor/frame-stream/platform/device/remote-adapter based.

## 4. User Project exception

A user repository may independently depend on Playwright. PM may run that project’s Playwright suite as an ordinary external test command and ingest its generic Test Capture/artifact output.

That external dependency:

- does not define PM’s Browser Program API;
- does not grant PM browser ownership;
- is installed only under the Project/tooling policy that applies to project dependencies;
- is attributed as external Project test activity.

## 5. Supersession

The older `06_RETURN_TO_RUNTIME_BROWSER_TESTING_ARTIFACTS_V3` sentence allowing a “Playwright-familiar PM facade” is retired.

Preserve the rest of that handoff’s valid design:

- ordinary versus protected AuthBrowserSession separation;
- isolated multi-agent BrowserWorkspaces;
- one mutating controller lease per page generation;
- visible/headless/background behavior;
- WSL/container/remote placement;
- generic capture;
- crash-safe recording;
- motion evidence;
- artifact lineage;
- PM-native Ego interoperability boundary.

The later Egolite Final Decision v4 Browser return already follows the stricter rule and should be treated as the current Egolite/browser authority.

## 6. Required validation

- repository-wide search finds no PM-owned “Playwright-familiar/compatible/shaped/facade” product or architecture terminology;
- no `cmd.playwright.*`, Playwright package, port, MCP, capture engine, Settings row, or Doctor check exists;
- external user-project Playwright tests remain runnable as generic project commands;
- Browser Program schemas, docs, receipts, and tests are PM-native and truthful.

## 7. Return requested

Return only if removing the terminology creates a concrete schema or compatibility problem. Do not reintroduce a Playwright compatibility layer merely to preserve old handoff wording.
