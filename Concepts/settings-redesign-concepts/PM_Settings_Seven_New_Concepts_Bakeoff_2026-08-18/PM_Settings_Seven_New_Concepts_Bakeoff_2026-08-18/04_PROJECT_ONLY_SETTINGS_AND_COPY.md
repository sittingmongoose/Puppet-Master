# Project-Only Settings and Copy Transaction

## One concrete settings set per Project

Every editable Settings change applies to the current Project. The Settings header shows Project identity as context, not as a scope selector.

Do not expose controls for:

```text
Global vs Project
Apply to every Project
Project inheritance
Link Projects' settings
Keep copied settings synchronized
Reusable settings profiles/loadouts
Per-setting override versus global default
Goal/Host/Environment editing scope
```

Once a setting changes, that Project diverges independently from every other Project.

Some resources can have identities outside the Project—accounts, provider installations, Servers, Execution Hosts, CLIs, or credentials. A manager may show where such a resource exists and its read-only operational health. Choosing how the current Project uses it is still a Project setting. Do not turn resource location into a user-facing Settings scope system.

Intrinsic managed/effective state remains valid where an external policy, permission floor, installation owner, or run/thread override genuinely controls the effective result. Put technical origin in Details; do not recreate universal inheritance.

## Stale inventory scope

The current inventory includes legacy `global` scope metadata. For this concept pass:

- do not present `global` as editable scope;
- project the records into the current Project;
- preserve exact setting IDs and content;
- record the eventual inventory/schema/Plan impact in candidate reports;
- do not edit the inventory or Plans.

## Copy Settings From Another Project

This is a one-time transaction, not a link.

Required flow:

1. select source Project;
2. choose approximately ten broad categories or a complete current-category mapping;
3. preview additions, replacements, unchanged values, unavailable values, and conflicts; item-level inspection is allowed, but it does not create per-setting inheritance or overrides;
4. explain credential/account-reference handling without exposing raw secrets;
5. create a restore point;
6. apply atomically;
7. verify the destination;
8. produce receipt and rollback action;
9. leave source and destination independent.

The preview must make clear what is and is not copied. Preserve provider credential/account references according to existing Project-copy policy; never render or export raw secret material. No future source changes propagate to the destination.
