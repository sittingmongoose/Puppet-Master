## 15. References

- **AGENTS.md:** DRY Method, widget catalog, platform_specs, Pre-Completion Verification Checklist; headless rendering (tiny-skia), automation (headless runner, action catalog); Context7 MCP; platform CLI commands.
- **Plans/interview-subagent-integration.md:** Interview phases (Testing & Verification), test strategy, `generate_playwright_requirements`, Phase 5 document generation, DRY for interview code (§5.2).
- **Plans/orchestrator-subagent-integration.md:** Interview config wiring, test strategy loading in prompts; CLI-native subagent invocation and platform capability manager (§Strategy 4, Subagent Invoker).
- **puppet-master-rs/src/interview/test_strategy_generator.rs:** TestStrategyConfig, TestItem, write_test_strategy, test-strategy.md / test-strategy.json.
- **puppet-master-rs/src/core/prompt_builder.rs:** Load test strategy into iteration context.
- **puppet-master-rs/src/automation/:** Headless runner, action catalog, evidence (timeline, summary).
- **MCP / Context7:** Context7 API keys (https://context7.com/docs/howto/api-keys): Bearer token in `Authorization` header. Cursor CLI MCP (https://cursor.com/docs/cli/mcp); Claude Code MCP (https://code.claude.com/docs/en/mcp); Codex MCP (https://developers.openai.com/codex/mcp). Puppet Master owns MCP centrally per §8.2; `DirectApi` providers do not rely on provider-side MCP config files.
- **[C1] Playwright video persistence and modes:** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/videos.mdx
- **[C2] Playwright tracing + show-trace:** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/trace-viewer-intro.mdx
- **[C3] MCP typed content (image/resource) and tool outputs:** https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- **[C4] HTML video with multi-source + fallback link:** https://github.com/mdn/content/blob/main/files/en-us/web/html/reference/elements/video/index.md
- **[C5] CommonMark image syntax (`![alt](url)`):** https://spec.commonmark.org/0.31.2/index
- **[C6] `img` alt/fallback behavior:** https://github.com/mdn/content/blob/main/files/en-us/web/html/reference/elements/img/index.md
- **[C7] Playwright test attachments (`testInfo.attach`, contentType/path):** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/api/class-testinfo.mdx
- **[LV1] Context7 MCP - Playwright docs (`--headed`, screenshots/videos/traces):** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/running-tests.mdx
- **[LV2] Context7 MCP - Playwright BrowserType launch/headed API:** https://github.com/microsoft/playwright.dev/blob/main/nodejs/versioned_docs/version-stable/api/class-browsertype.mdx
- **[LV3] Context7 MCP - Appium desktop setup (`appium setup desktop`, `mac2`, screenshot API):** https://github.com/appium/appium/blob/master/packages/appium/docs/en/reference/api/webdriver.md
- **[LV4] Context7 MCP - Appium Windows driver (`app`, `appTopLevelWindow` attach):** https://github.com/appium/appium-windows-driver/blob/master/README.md
- **[LV5] Context7 MCP - Appium XCUITest simulator capability sets + screen recording:** https://appium.github.io/appium-xcuitest-driver/latest/reference/execute-methods
- **[LV6] Apple Developer - Xcode previews:** https://developer.apple.com/documentation/xcode/previewing-your-apps-interface-in-xcode
- **[LV7] Context7 MCP - Appium UiAutomator2 emulator capabilities + MediaProjection recording:** https://github.com/appium/appium-uiautomator2-driver/blob/master/README.md
- **[LV8] Android Developers - emulator command line:** https://developer.android.com/studio/run/emulator-commandline
- **[MOB1] Apple SwiftUI docs (`#Preview`, `@Previewable`, previews in Xcode):** https://developer.apple.com/documentation/SwiftUI/documentation/swiftui/preview%28_%3Abody%3A%29 ; https://developer.apple.com/documentation/swiftui/previewable%28%29 ; https://developer.apple.com/documentation/SwiftUI/documentation/swiftui/previews-in-xcode
- **[MOB2] XCTest basics and CLI selection (Context7: swift-corelibs-xctest):** https://context7.com/swiftlang/swift-corelibs-xctest/llms.txt ; https://github.com/swiftlang/swift-corelibs-xctest/blob/main/README.md
- **[MOB3] Appium XCUITest driver capabilities and WDA attach guidance:** https://appium.github.io/appium-xcuitest-driver/latest/reference/capabilities ; https://appium.github.io/appium-xcuitest-driver/latest/guides/attach-to-running-wda
- **[MOB4] Jetpack Compose testing (synchronization, semantics, APIs):** https://developer.android.com/develop/ui/compose/testing/synchronization ; https://developer.android.com/develop/ui/compose/testing/common-patterns ; https://developer.android.com/develop/ui/compose/testing/apis
- **[MOB5] Android testing samples (Espresso + UiAutomator):** https://github.com/android/testing-samples/blob/main/README.md
- **[MOB6] Expo dev/build workflows (`expo start`, `expo run:*`):** https://docs.expo.dev/develop/development-builds/use-development-builds ; https://docs.expo.dev/develop/development-builds/expo-go-to-dev-build ; https://docs.expo.dev/bare/using-expo-cli
- **[MOB7] Detox artifacts and simulator/emulator run configs:** https://github.com/wix/detox/blob/master/docs/config/artifacts.mdx ; https://github.com/wix/detox/blob/master/docs/guide/developing-while-writing-tests.md
- **[MOB8] Maestro cloud/CI + flow screenshot capture:** https://github.com/mobile-dev-inc/maestro-docs/blob/main/cli/cloud.md ; https://context7.com/mobile-dev-inc/maestro-docs/llms.txt
- **[MOB9] Appium screenshot/screen-record APIs and mobile execute commands:** https://github.com/appium/appium/blob/master/packages/appium/docs/zh/guides/migrating-2-to-3.md ; https://context7.com/appium/appium/llms.txt
- **[DOCKER1] Docker Build and Push Action (`build-push-action`):** https://github.com/docker/build-push-action
- **[DOCKER2] Docker Login Action (`login-action`):** https://github.com/docker/login-action
- **[DOCKER3] Docker Setup Buildx Action (`setup-buildx-action`):** https://github.com/docker/setup-buildx-action
- **[DOCKER4] Docker Scout Action (`scout-action`):** https://github.com/docker/scout-action
- **[DOCKER5] Docker CLI reference:** https://docs.docker.com/reference/cli/docker/
- **[DOCKER6] Docker VS Code extension (reference patterns only):** https://github.com/docker/vscode-extension

### 14.7A DockerHub browser auth, repository management, and Unraid publishing addendum
#### Validation and side-effect boundary matrix

This subsection is authoritative for Build vs Push vs Unraid follow-on behavior.

- `doctor.docker.engine`, `doctor.docker.compose`, `doctor.docker.buildx`, and `doctor.dockerhub.auth.capability` block local Docker build/publish entry points when failing.
- `doctor.dockerhub.repo.access` blocks remote image push when the selected namespace/repository cannot be read or created as required.
- `doctor.unraid.template-repo` does **not** block local Docker image push; it blocks only managed template-repo update / commit / push stages.
- `doctor.unraid.ca-profile` in `needs_review` state does **not** block local Docker image push; it blocks auto-push of the managed template repo and requires visible remediation.
- `push_policy = after_build` MUST dispatch `cmd.orchestrator.push_image` as a separate remote side-effect step after a successful local build result exists.
- Permission-guard or confirmation blocks MUST resolve to `*.blocked` outcomes, not `*.failed`, so runtime failure remains distinct from intentional non-execution.

#### Normative override for §14.7

This subsection is authoritative wherever §14.7 still reads like a PAT-only contract.

- Supported `requested_auth_mode` values are at least `browser` and `pat`.
- Validation MUST resolve requested auth into:
  - `effective_auth_provider_state`
  - `effective_capabilities[]`
  - validated account identity
  - degraded reason when capability is partial
- Namespace/repository discovery and repository creation MUST use the validated effective capability set; the app MUST NOT assume browser login or PAT implies full management access.
- If publish is requested and the target repository does not exist, repository creation MUST be guarded by an explicit confirmation that shows namespace, repository, and privacy. This confirmation is mandatory and cannot be bypassed by YOLO/autonomy behavior.
- Successful publish produces `docker_publish_result`; successful follow-on XML generation / template repo update produces `unraid_template_result`.

#### Canonical doctor / preflight additions for DockerHub + Unraid

| Check ID | Scope | Required signal | Failure behavior |
|---|---|---|---|
| `doctor.docker.buildx` | docker build | Buildx reachable and usable for the selected build path | Block container build/publish; show remediation |
| `doctor.dockerhub.auth.capability` | docker auth | Requested auth validates into effective capability set and account identity | Block repo browsing/creation/publish; show degraded reason |
| `doctor.dockerhub.repo.access` | docker publish | Selected namespace/repository can be read or created as required | Block publish; preserve local build result |
| `doctor.unraid.template-repo` | unraid managed publishing | Template repo path/remote/branch settings validate and working copy state is safe | Block managed follow-on push/update; keep local publish result |
| `doctor.unraid.ca-profile` | unraid maintainer metadata | `ca_profile.xml` exists or can be generated and any missing public metadata is surfaced as review-required | Allow local generation with warning; block auto-push while review is required |

#### Result payload minima

- `docker_auth_result` MUST include: `requested_auth_mode`, `effective_auth_provider_state`, `effective_capabilities[]`, `effective_account_identity`, `last_validation_timestamp`, `last_validation_host`, `degraded_reason?`
- `docker_publish_result` MUST include: `publish_result_id`, `registry_host`, `namespace`, `repository`, `tags[]`, `digests[]`, `platforms[]`, `sanitized_logs_path`
- `unraid_template_result` MUST include: `publish_result_id`, `template_xml_path`, `template_repo_id`, `maintainer_slug`, `commit_status`, `push_status`, `ca_profile_state`, `review_state`

`unraid_template_result.commit_status` enum:
- `not_attempted`
- `committed`
- `skipped_review_required`
- `skipped_unrelated_changes`
- `failed`

`unraid_template_result.push_status` enum:
- `not_attempted`
- `skipped_auto_push_disabled`
- `push_in_progress`
- `completed`
- `failed`

`unraid_template_result.review_state` enum:
- `clean`
- `needs_review`

`unraid_template_result.ca_profile_state` enum:
- `existing_user_managed`
- `auto_generated_needs_review`
- `project_override_active`

This addendum expands §14.7 so Docker support is first-class rather than limited to basic runtime defaults.

**Normative separation of responsibilities:**
- Use Docker CLI / Buildx for local runtime, image build, login, and push execution.
- Use Docker Hub API only for namespace/repository discovery and repository creation when Puppet Master needs app-managed listing/creation behavior.
- Do not treat DockerHub as a storage location for Unraid XML.

**Expanded runtime/publish flow:**
1. Detect whether the active project is Docker-related.
2. Resolve `requested_auth_mode` and validate `effective_capabilities`.
3. Allow browser/device login or PAT-based auth, with PAT remaining the recommended explicit path.
4. If push is requested and the target repository is missing, gate repository creation behind a mandatory confirmation dialog that shows namespace, repository name, and privacy. This step cannot be bypassed by YOLO/autonomy modes.
5. Build with `docker buildx build`.
6. Run containers for preview/testing when requested and surface user-facing access points when available.
7. Push to DockerHub using the selected namespace/repository/tag set.
8. After successful publish, generate/update Unraid XML by default unless the user disabled it.
9. If managed template-repo workflow is enabled, update the template repo, auto-commit by default, and expose a one-click push UI action while keeping auto-push disabled by default.

**Doctor/preflight additions required by this addendum:**
- `doctor.docker.buildx` — Buildx reachable and usable for the selected build path.
- `doctor.dockerhub.auth.capability` — requested auth validated into effective capability set.
- `doctor.dockerhub.repo.access` — selected namespace/repository can be read, selected, or created as required.
- `doctor.unraid.template-repo` — template repo configuration is valid when managed template publishing is enabled.
- `doctor.unraid.ca-profile` — `ca_profile.xml` exists or can be generated and is surfaced as needing review when auto-generated.

**Evidence/result contract additions:**
- `docker_auth_result` records requested mode, effective capability set, account identity, validation timestamp, and degraded reason if any.
- `docker_publish_result` records registry host, namespace, repository, pushed tags, digest(s), platform list, and sanitized logs path.
- `unraid_template_result` records XML output path, target template repo, maintainer folder, commit status, push status, and whether `ca_profile.xml` was auto-generated or user-edited.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md, PolicyRule:no_secrets_in_storage, SchemaID:evidence.schema.json
