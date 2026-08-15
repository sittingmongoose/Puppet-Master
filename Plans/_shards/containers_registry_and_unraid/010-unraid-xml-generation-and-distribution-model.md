# Shard 010: Unraid XML generation and distribution model

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L549-L741

Source SHA256: `3ca157a3ab590fb8caab62539b9ff912052fa91b20cfc3309e6e48738f7d698b`

---

## Unraid XML generation and distribution model

### Canonical generated-artifact contract

The managed Unraid flow produces three artifact classes:

1. **Application template XML** at `<maintainer_slug>/<project_slug>.xml`
2. **Maintainer profile XML** at `ca_profile.xml`
3. **Repo-managed image assets** under `assets/maintainer/` when the user uploads images instead of referencing external URLs

#### Artifact input provenance

| Canonical PM field | Primary source | Fallback / user override | Required for auto-commit | Required for auto-push |
|---|---|---|---|---|
| `project_slug` | Project identity | User override in template settings | Yes | Yes |
| `display_name` | Project display name | User override | Yes | Yes |
| `image_ref` | `docker_publish_result` (`namespace/repository:tag`) | None | Yes | Yes |
| `image_digest` | `docker_publish_result.digest[]` | None | No | No |
| `registry_host` | `docker_publish_result.registry_host` | None | Yes | Yes |
| `web_ui_url` | Resolved preview/runtime access URL | User-entered URL override | No | No |
| `support_url` | Project support/docs URL | User-entered maintainer URL | No | Yes |
| `overview_markdown` | Project summary / README excerpt / prior template content | User-edited value | No | Yes |
| `icon_source` | Repo-managed uploaded asset or external URL | User choice | No | Yes |
| `category_labels[]` | Project metadata / prior template content | User-edited value | No | Yes |
| `config_items[]` | Compose/runtime config + prior template content | User-edited value | No | No |
| `maintainer_slug` | DockerHub namespace by default | User override | Yes | Yes |
| `maintainer_profile` | Shared or per-project `ca_profile` state | None | Yes | Yes |

#### App-template minimum contract

The first implementation MUST support, at minimum, deterministic generation and round-trip update of these conceptual fields:

- display name
- image reference
- registry host
- overview/description content
- support URL
- web UI URL when present
- icon/image source
- category labels
- config entries derived from ports / volumes / environment / path mappings
- maintainer slug and owning template path

Implementation rule:
- Puppet Master MAY use an internal normalized model rather than hard-coding UI logic directly to raw XML tags.
- However, the normalized model MUST map 1:1 to emitted XML content and MUST be documented.
- Unknown fields present in an existing template MUST be preserved on update unless the user explicitly removes them.

#### `ca_profile.xml` round-trip rule
#### Explicit editability contract for all fields


The statement "all `ca_profile.xml` fields are editable" is satisfied by a two-layer editor model:

1. **Structured editor** for the canonical known fields exposed in the standard UI.
2. **Advanced raw XML editor** for any field, element, attribute, or passthrough content not yet modeled by structured controls.

Normative rules:
- The structured editor MUST round-trip through the same normalized model used by generation/update.
- Unknown or currently unmodeled content MUST remain editable through the advanced raw XML surface.
- Saving from either surface MUST preserve unmodified passthrough content verbatim.
- Puppet Master MUST NOT claim "all fields editable" unless both layers exist.

`ca_profile.xml` editing is a **round-trip** contract, not a one-way generator.

Required behavior:
- Puppet Master MUST parse existing `ca_profile.xml` into a normalized editor model.
- The editor model MUST preserve all existing fields, including fields the current UI does not yet expose individually.
- The first implementation MUST expose editable controls for, at minimum:
  - maintainer display name
  - maintainer slug
  - overview/about text
  - support URL
  - icon/image source
- When the user uploads an image, Puppet Master MUST copy it into the managed template repo by default and rewrite the profile to reference that repo-managed asset.
- When the user selects external URL mode, Puppet Master MUST preserve the external URL exactly as entered.

#### Validation and review rules

- A successful Docker publish is required before Puppet Master may treat `image_ref` as final for generated template output.
- Missing `support_url`, `overview_markdown`, or `icon_source` MUST mark the generated result as `needs_review`.
- `needs_review` MUST NOT block local save or local auto-commit, but it MUST block auto-push and MUST surface a visible warning in Docker Manager.
- If Puppet Master updates an existing template and cannot map a field safely, it MUST preserve the existing field and mark the template result as `needs_review` rather than dropping data silently.

#### Known-field registry and XML mapping (first implementation)


#### XML emission minima for first implementation

The first implementation emits application templates with one canonical root shape:

```xml
<Container version="2">
  <Name>Example App</Name>
  <Repository>namespace/repository:tag</Repository>
  <Registry>https://registry-1.docker.io</Registry>
  <Network>bridge</Network>
  <MyIP/>
  <WebUI>http://[IP]:[PORT:8080]</WebUI>
  <Support>https://example.invalid/support</Support>
  <Overview><![CDATA[Markdown or HTML-safe overview text]]></Overview>
  <Category>Tools:Utilities</Category>
  <Icon>assets/maintainer/icon.png</Icon>
  <Config ... />
</Container>
```

Canonical rules:
- Root element is exactly `<Container version="2">`.
- Known child elements emit in this order: `Name`, `Repository`, `Registry`, `Network`, `MyIP`, `WebUI`, `Support`, `Overview`, `Category`, `Icon`, then repeated `Config`.
- `Overview` emits as CDATA.
- All other known text nodes emit as escaped text.
- Optional known elements are omitted when empty.
- Unknown elements, unknown attributes, and XML comments from an existing template MUST be preserved verbatim and re-emitted after the last known sibling in their original relative order unless the user explicitly removes them.
- Existing unknown root attributes MUST be preserved verbatim on round-trip update.

`Config` type mapping for first implementation:

| Normalized field | Emitted `Config` shape | Required attributes |
|---|---|---|
| Port mapping | `<Config Type="Port" ... />` | `Name`, `Target`, `Default`, `Mode`, `Display`, `Required`, `Mask="false"` |
| Path / bind mount | `<Config Type="Path" ... />` | `Name`, `Target`, `Default`, `Display`, `Required`, `Mask="false"` |
| Environment variable | `<Config Type="Variable" ... />` | `Name`, `Target`, `Default`, `Display`, `Required`, `Mask` |
| Device mapping | `<Config Type="Device" ... />` | `Name`, `Target`, `Default`, `Display`, `Required`, `Mask="false"` |

Attribute mapping rules:
- `Name` = stable user-visible label; fall back to `Target` when no label exists.
- `Target` = container-side port/path/variable/device identifier.
- `Default` = host-side or default value.
- `Display` = `always` for first implementation unless hidden by explicit user choice.
- `Required` = `true` only when the value is mandatory for a successful container run.
- `Mask` = `true` only for secret environment variables; otherwise `false`.
- `Mode` is required only for `Type="Port"` and is exactly `tcp` or `udp`.

If Puppet Master cannot map a source item into the required attribute set without inventing values, it MUST preserve the prior XML unchanged for that item and mark the result `needs_review`.

##### Application template XML

| Normalized field | XML element / shape | Required for local save | Required for auto-push |
|---|---|---|---|
| `display_name` | `<Name>` text | Yes | Yes |
| `image_ref` | `<Repository>` text | Yes | Yes |
| `registry_host` | `<Registry>` text | No | Yes |
| `web_ui_url` | `<WebUI>` text | No | No |
| `support_url` | `<Support>` text | No | Yes |
| `overview_markdown` | `<Overview>` CDATA | No | Yes |
| `icon_source` | `<Icon>` text | No | Yes |
| `category_labels[]` | `<Category>` text | No | Yes |
| `config_items[]` | repeated `<Config ... />` elements | No | No |

##### `ca_profile.xml` recognized fields

| Normalized field | XML element | Required for auto-push |
|---|---|---|
| `display_name` | `<Name>` | Yes |
| `overview_markdown` | `<Overview>` | Yes |
| `support_url` | `<Support>` | Yes |
| `icon_source` | `<Icon>` | Yes |

### Distribution model
### Unmanaged generation target contract

If `Generate/Update Unraid XML after successful publish` is enabled but managed template-repo handling is disabled, unconfigured, or invalid, Puppet Master MUST still generate a local artifact set under:

`.puppet-master/generated/unraid/<project_id>/<publish_result_id>/`

Required output:
- `template/<maintainer_slug>/<project_slug>.xml`
- `template/ca_profile.xml` when the active profile is projected into the result
- `template/assets/maintainer/**` for repo-managed uploaded assets referenced by the result

In this mode:
- `unraid.template.generation.completed` still fires
- `template_repo_id` is `null`
- `commit_status` is `not_attempted`
- `push_status` is `not_attempted`
- UI copy MUST describe the result as **generated locally / not attached to a managed repo**

The default distribution target for generated Unraid XML is a separate Unraid template repository / Community Applications-friendly template location. The main application repository may still be offered as an optional export target, but it is not the primary default.

Rationale that must be preserved in docs:
- DockerHub stores images, not Unraid XML
- public Unraid template distribution is commonly done through GitHub template repositories / Community Applications workflows
- installed copies are stored locally on the Unraid server under `/boot/config/plugins/dockerMan/templates-user`

### Generation default
- automatically generate/update Unraid XML after successful image publish by default
- nearby GUI toggle disables this behavior
- generation is part of the first-class Docker publish flow, not a hidden manual afterthought

### Managed template-repo workflow default
- Puppet Master should manage the Unraid template repository workflow itself by default
- the user can disable managed template-repo handling in settings
