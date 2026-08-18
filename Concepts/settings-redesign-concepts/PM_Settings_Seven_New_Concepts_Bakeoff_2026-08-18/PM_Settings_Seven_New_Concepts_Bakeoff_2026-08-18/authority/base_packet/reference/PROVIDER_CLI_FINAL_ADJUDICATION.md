# Final Adjudication — Provider CLI Acquisition

## Authority and precedence

The direct product decision for provider CLIs is:

```text
not bundled in Puppet Master core
not included in the default native/server/container/WSL/Kubernetes execution baseline
not pre-seeded as a PM-distributed Tool Store package
not silently installed by Project, model, provider, Goal, Plan, WorkNode, agent, or Auto/On demand
explicit user-triggered Install/Setup in Provider Settings or provider setup
acquired from the official provider/package source
installed for the exact selected Host/Environment
installation and authentication remain separate
```

Approval of the general acquisition classes for tools did not explicitly override this provider-CLI exception. Therefore, the provider-specific direct decision governs.

A later **named user-approved exception** may authorize bundling for one exact provider CLI/platform/source after redistribution, license, provenance, security, size, update, removal, and support implications are reviewed. No catalog owner, adapter, or acquisition-class assignment may create that exception implicitly.

## Allowed after explicit user action

After the user starts setup, Puppet Master may:

- discover and reuse a compatible existing installation;
- download through the provider's official installer, release artifact, package feed, or documented package-manager route;
- install into the persistent PM Tool Store or another managed host-local location when supported;
- verify publisher, provenance, version, architecture, license, and adapter compatibility;
- maintain isolated provider-owned profiles;
- stage, verify, activate, repair, and roll back later generations;
- apply automatic update policy after the installation has been explicitly acquired and bound.

This is **post-consent lifecycle management**, not permission to prebundle or silently perform first acquisition.

## Runtime demand

When an operation needs a missing provider CLI:

```text
requirement detected
→ inspect compatible existing installations
→ return Provider Setup Required when none is ready
→ deep-link to the exact Provider Settings/setup row
→ preserve originating operation and continuation token
→ wait for explicit Install or installation selection
→ install from the official source
→ authenticate separately
→ verify provider/model readiness
→ resume only when the continuation is still current
```

`Auto` and `On` may maintain an already approved provider installation. They are not consent for initial acquisition.

## Retained parts of the conflicting bundle

Preserve its valid contracts for:

- no silent Project-triggered installation;
- explicit provider setup;
- authentication/profile/account/model/Usage readiness separation;
- demand-driven provisioning for **non-provider** capabilities;
- exact Host/Environment separation across native Windows, WSL distributions, macOS, Apple Linux containers, Linux, containers, Kubernetes, and SSH hosts;
- persistent Tool Store/profile state outside replaceable images;
- coalesced provisioning and stale-continuation rejection;
- `RuntimeResourceGovernor` and `ObservableWork` integration;
- no offline Tool Bundle product;
- protected human-only `AuthBrowserSession`;
- no Playwright runtime, facade, compatibility namespace, package, port, command family, MCP route, or PM-native capture dependency.

## Superseded clauses in `PM_Provider_CLI_Final_Policy_Return_Handoffs_2026-08-08`

Supersede only the clauses that permit or normalize provider-CLI baseline/pre-distribution without a later named user exception, including:

- `00_READ_ME_FIRST.md` result directing Optimization to accept per-tool provider-CLI baseline eligibility;
- `01_FINAL_PROVIDER_CLI_ACQUISITION_POLICY.md` §§1–2 and the `included_execution_baseline` provider-CLI route;
- §4 language allowing PM caching, mirroring, or repackaging as a normal provider-CLI acquisition class rather than a named exception;
- §8 user copy such as **Included with this Server** for provider CLIs absent a named exception;
- §9's rejection of the provider-specific never-bundled default;
- `02_RETURN_TO_OPTIMIZATION_IN_PUPPET_MASTER.md` statements calling the stricter provider rule incorrect and any baseline-size benchmark premised on provider CLIs being included;
- `03_RETURN_TO_SHARED_INTEGRATION_RUNTIME.md` §§2 and 4 allowing a provider CLI to enter the baseline by catalog/adapter decision alone;
- `04_RECONCILIATION_RESULT.md` final interpretation permitting baseline packaging through per-tool acquisition classification.

## Unaffected tool classes

The general four-class acquisition model remains valid for non-provider tools. CEF/Chromium remains bundled core. Existing accepted Git/Jujutsu source-control baseline decisions are not changed by this provider-specific correction.
