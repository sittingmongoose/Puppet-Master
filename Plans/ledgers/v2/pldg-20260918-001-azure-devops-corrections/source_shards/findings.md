# Findings compiled by this ledger

Each record names the candidate ids it carries, what the Plans promised, what contradicted the promise on current `main`, and the units the repair edits. Every `Repairs` sentence names units this branch actually changed, and every unit it names is a compile target of the record's own queue item.

## Record 1 — AZ-01 (TA-038): The Azure review, policy and check fixtures the owner names do not exist

ADO-003 validation surfaces and ADO-005 both name Azure PR revision, thread and policy fixtures, section 3 says `Plans/azure_devops_integration_fixtures.json` validates them, and section 5 lists PR revisions, threads, votes, policies and checks as covered acceptance. Verified on current main: that file holds two `provider_adapter_profile` values and one `repository_binding` negative and nothing else, no Azure review, policy, check, evaluation or status fixture exists anywhere under `Plans/`, the `Check` record kind is used by zero fixtures, and the one azure_devops `pipeline_projection` points at a `review_revision_ref` no fixture defines. Not one of ADO-003's acceptance criteria was checkable for Azure.

Repairs ADO-003 and ADO-005. The promise is amended to what exists: the validation surfaces and sections 3 and 5 now say the Azure review, policy and check fixtures are not yet written, so the criteria are stated and not yet falsifiable rather than implied to be covered. Jared chose that over holding the list, as `q-009` records. The dangling reference is closed as a side effect, because AZ-11 adds the `review-revision:azure-pr-8:v2` fixture the projection pointed at.

## Record 2 — AZ-02 (TA-008): Neither Azure profile declares the review_versions capability

FGI-003 requires every provider operation to resolve one capability entry before dispatch. `review_versions` is a `capability_name` member, the schema conditional pins `requested_capability` to that constant for both `cmd.forge.review.version.open` and `.compare`, both are in the central command set, the command catalog names the Azure owner as their consumer surface and the production wiring carries rows for both. The token occurred zero times in the Azure fixture pack, in neither required nor optional capabilities for either variant, so the dispatch rule could not be satisfied.

Repairs ADO-002. Both Azure profiles now declare `review_versions` as an optional capability, and the unit states why a capability pinned by name in a command contract has to be declared by the profile.

## Record 3 — AZ-03 (TA-010): Neither Azure profile declares the repository_policy capability

`repository_policy` is a `capability_name` token distinct from `checks`, the schema pins it as the requested capability for both policy commands, `command_target.target_kind` carries it, the capability dimension tuple carries `checks` and `branch_policy` as separate dimensions, FGI-015 requires each profile to report branch policy state, and both the Forgejo and the Gitea fixtures declare it. It occurred zero times in the Azure pack; the omission was Azure-specific.

Repairs ADO-002. Both Azure profiles now declare `repository_policy`, which is also the mechanism AZ-22 needs: applicability and status become two capability tokens that can degrade independently.

## Record 4 — AZ-04 (TA-022, TA-023 and TA-024): The checks contract keys evidence to a head OID the provider neither accepts nor evaluates

One defect seen from three sides. The `cmd.forge.review.checks` conditional required `review_head_oid` and pinned currentness to current, while the Azure evaluations endpoint takes only an artifact id and paging parameters and the evaluation record carries no commit, iteration or revision field of any kind. Two check families sat behind one visually uniform list with no field saying which was which: per-iteration statuses are revision-bound, policy evaluations are review-bound and cannot be head-scoped at all. And the head OID is the wrong key even when it exists, because Azure evaluates the merge and the evaluation context carries the last merge, merge-source and merge-target commit ids.

Repairs FGI-005. A gate row now declares its binding kind, a review-bound row carries the merge triple instead of a head fence, and the checks command names the family it is fencing before it sends a fence. `command_target` gains `checks_binding_kind` and `review_merge_binding` for that purpose.

## Record 5 — AZ-05 (TA-018, TA-019, TA-020 and TA-021): There is no typed gate record, so whether each gate passes cannot be answered

Four missing fields on the same absent object. `pipeline_projection.checks` was an array of opaque references and the normalized remote record carried only free-string statuses, so policy identity had no carrier and the `Check` record kind was specified and unexercised. Required versus advisory had no carrier anywhere: `isBlocking`, `mergeable` and `blocking check` return zero matches in the forge schema, though the provider makes it the decisive axis for auto-complete. `normalized_status` was an unconstrained string with no pinned mapping, and the only adjacent enum is an eight-value pipeline-run vocabulary with no member for a check that errored. And one wire word carried two provider meanings: `notApplicable` bypasses a policy requirement on the status surface and means the policy does not apply on the evaluation surface.

Repairs FGI-005. One typed gate record carries the provider identity, an enforcement value, a closed status vocabulary that keeps `requirement_bypassed` apart from `not_applicable` and `errored` apart from `failed`, and the source surface the row came from.

## Record 6 — AZ-06 (TA-034): TFVC must be detected and explained and the Azure owner never mentions it

FGI-014 separates Git from unsupported TFVC and carries `TFVC` as a preserved exact token, and the forge acceptance packet requires Git and TFVC fixtures to select the right capabilities with a named scenario expecting no TFVC-as-Git registration. Verified on current main: `TFVC` occurred zero times in `Plans/Azure_DevOps_Integration.md`, the sole canonical owner for Azure repository identity and Azure-specific degradation, section 7's non-goals did not list it, and neither profile's reason codes could express that a container is TFVC rather than Git.

Repairs ADO-001. The owner now recognizes a TFVC container from the provider's own repository-kind data and reports `tfvc_container_unsupported`, both profiles declare that code, section 7 states the non-goal, and recognition from a CLI failure string, a 403 body or an empty Git response is forbidden. One negative rejects a profile that declares a near-miss spelling instead of the enrolled code, so the vocabulary is checked. Container recognition itself has no fixture, because the corpus carries no container shape to present one in; ADO-001's validation surfaces and section 3 say so rather than naming a fixture that does not exist.

## Record 7 — AZ-07 (TA-001): A new head is the wrong staling trigger for Azure

Internally inconsistent inside the frozen Plans. `review_revision` makes identity a triple, with base, head and merge-base all required on a closed object, while the staling trigger named one leg of it. Target-branch movement changes the merge base, which is defined by both refs, and therefore the revision's own identity, while producing no iteration and no head change. Retarget is a published iteration reason that carries a new and an old target ref name and moves no head at all.

Repairs ADO-003. The trigger is restated as a new provider revision: the provider's own revision identity advancing, or any leg of base, head or merge-base changing. Prose only; it adds no field.

## Record 8 — AZ-08 (TA-005): review_revision cannot say that a revision's contents are incomplete

FGI-003 carries `partial data is never complete` as a preserved exact token. Truncation is a distinct axis from staleness and `review_revision` had no room for it: the object is closed with no completeness field, while `pipeline_projection.currentness` and `command_currentness.state` both carry `partial`. Four truncation conventions sit on one Azure path, so a revision's contents can be partial while its evidence state reads current, and the failure mode is reached with no staleness at all.

Repairs FGI-004. `contents_complete` and `incomplete_reason_codes` are the two cheap fields the arm recommended taking now; a complete revision cannot name a truncation and an incomplete one cannot stay silent about why.

## Record 9 — AZ-09 (TA-035): A completion that names no merge strategy is not neutral on Azure

The obvious reading is that the product cannot have the reported bug, because the merge command carries no strategy field and `merge_strategy` returns zero matches in the forge schema. That reading is wrong. The provider documents that if no merge strategy is set a no-fast-forward merge is created when squash is false, and recommends setting it explicitly in all cases. A strategy-less completion is therefore a no-fast-forward completion, and a repository policy that forbids no-fast-forward refuses it.

Repairs ADO-003. The owner states that an omitted strategy selects no-fast-forward on Azure and that the effective policy's permitted strategies are known before a merge affordance is offered. The typed field itself is a capability and was deferred to the card answered as `q-005`, landing as DL-063 and FGI-018.

## Record 10 — AZ-10 (TA-003): A retarget invalidates the applicable policy set, not only the evidence

Branch policies are configured per target ref and the provider resolves them server-side by ref name, so a retarget changes which policies apply at all: a previously satisfied required reviewer can cease to be required and a new one can appear. ADO-003 staled the evidence and said nothing about the applicable set.

Repairs ADO-003. A retarget re-resolves the applicable branch policy and check set rather than carrying it. A rule, not a field.

## Record 11 — AZ-11 (TA-004): evidence_state can name only one reason for staleness

`review_revision.evidence_state` is a closed four-value enum in which only `stale_head_changed` names a cause, so at least five distinct and independently verified Azure staleness causes would all be reported to the person as a changed head, false in four of the five: retarget, merge-base drift from target movement, conflict resolution in the provider's own interface, force push, and policy-driven time expiry, which is a staleness with neither a head change nor a new iteration.

Repairs FGI-004. `evidence_state_cause` names the path that produced the state while the four frozen values stay exactly as they are, a current revision carries no staleness cause, and `stale_head_changed` may name only a cause that actually moved the head, so the false report this correction exists to stop is rejected rather than merely forbidden in prose. A negative pairs `stale_head_changed` with `target_revision_moved` and is rejected.

## Record 12 — AZ-12 (TA-007): A thread's anchor is a revision pair on Azure and the schema stored one ref

FGI-004 promises that thread resolution is scoped to one immutable review revision and actor. An Azure thread position is a projection onto the iteration window the caller asked for, not a stored fact: the threads route takes a base iteration as the left side and an iteration as the right, so two clients reading the same review at the same moment get different line numbers for the same comment. Created-at and tracked-to are separate provider objects and the change-tracking identity is the durable key. The union's supporting claim that the compare conditional already requires both revision references is false as written: the branch declares both properties and places neither in a required list, so the defect rests on the FGI-004 promise alone.

Repairs FGI-004. `revision_anchor` carries the created-at revision, both sides of the window, a tracking state and the tracking identity, and every field is required so a partial anchor tuple cannot be persisted.

## Record 13 — AZ-13 (TA-009): Capability routing is binding-scoped and Azure decides revision support per pull request

FGI-003 requires every provider operation to resolve one capability entry before dispatch, and the capability envelope is keyed on a repository binding, with every FGI-003 input at or above repository scope. Azure decides revision support per pull request: a review created with more than one hundred thousand modified files does not support iterations, and that is fixed at creation and not updatable. `review_revision.version` is required with a minimum of one on a closed object, so Puppet Master could neither emit a revision for such a review nor drop it from the surface.

Repairs FGI-003. Jared resolved the shape as `q-011` records: the capability resolves at review scope with the binding entry as a ceiling. A review-scoped entry never reports the capability as effective, and it stays a capability limit rather than a permission failure.

## Record 14 — AZ-14 (TA-011): unsupported_reason_codes was an unchecked free string array for every provider

FGI-003 promises that missing scope, tier, version, rate, offline, managed policy and unsupported states remain distinguishable. `provider_adapter_profile.unsupported_reason_codes` was typed as an array of non-empty strings, so the codes a profile declares were not drawn from and not checked against the closed reason enums every other reason in the corpus must come from. The union's supporting claim that the same field holds two codes which are enum members is false: one is a member and one is in neither enum. The corrected finding is stronger and is not Azure-specific. Every non-empty declaration in the corpus carries at least one off-enum code, nineteen distinct codes in all across five provider packs.

Repairs FGI-003. The field is typed against one closed, checked vocabulary of twenty-four members holding every code the corpus already declares, plus the TFVC code AZ-06 adds and the write-scoped policy code AZ-15 substitutes. It is a separate vocabulary from the runtime disabled and error codes because a profile declaration is a static claim rather than a runtime disposition. Jared re-filed it as cross-provider, which `q-014` records.

## Record 15 — AZ-15 (TA-012): policy_scope_missing is a read-side reason the Azure service cannot produce

ADO-002 promises that organization, collection, project, repository, policy and build access failures remain distinguishable, and the Services fixture declared `policy_scope_missing`. Azure has no read-side policy permission: the Git repositories security namespace publishes `EditPolicies`, `PolicyExempt` and `PullRequestBypassPolicy`, all write, exempt or bypass with no read bit, reading policies rides on repository read, and the evaluations endpoint lists exactly one OAuth scope, the same one that reads code. A caller who received that reason would already have been denied at the repository.

Repairs ADO-002. The policy leg of the distinguishability promise is scoped to the write, exempt and bypass paths, the profile declares `policy_write_scope_missing` instead, and a negative fixture rejects the old code.

## Record 16 — AZ-16 (TA-013): Nothing in the corpus forbade client-side policy scope resolution

The Plans constrained the output of the policy mapping and said nothing about the derivation. No statement required provider-side applicability resolution, no prohibition on client-side scope resolution existed, and policy scope levels, match kinds and ref-name matching appeared nowhere. An implementer who read only the Plans, reached for the obvious-looking collection endpoint and filtered it client-side violated no written constraint and produced a confident single wrong answer rather than an error, so no reason code fired.

Repairs ADO-003. One negative constraint on the Azure owner, modelled on the existing fail-closed scope-resolution precedent: policy applicability is resolved by the provider's scope-resolving endpoint and never client-side, and a failed resolution fails closed.

## Record 17 — AZ-17 (TA-016): policy_resource_id could not express a scoped policy and one scalar could not fence a set

The policy preview command required a policy resource id, a provider patch reference and an expected policy revision, and identified its subject with one opaque string whose only worked example in the corpus is a branch name. Azure's identity is the policy configuration id plus the scope entry that made it apply, and two different configurations can both be the branch policy on one branch; the provider's own write path already addresses individual configurations by id. The expected revision was a single scalar while the provider's revision is per configuration, so one scalar could not fence a set whose membership can change without any member's revision changing.

Repairs FGI-005. `command_target` gains `policy_scope_ref` and `expected_policy_set`, a per-configuration member list with a membership digest, and both policy conditionals require both, so an apply cannot drop the scope entry its preview fenced. A negative removes it from the apply request.

## Record 18 — AZ-18 (TA-017): A policy or check collection carried no completeness state and no cursor

FGI-003 carries `partial data is never complete` and the source graph owner already requires a flag plus a cursor for a bounded list, with the negative constraint against presenting a truncated parent list as complete. Both Azure listing routes page, and there was no policy-set equivalent: the disabled reason vocabulary carried a pipeline-projection-partial member and no policy-set member, and `policy_set_partial` occurred zero times anywhere under `Plans/`. A truncated first page of policies was shape-identical to a complete one. The union cited the flag-and-cursor rule about twenty-nine lines early; the corrected loci are recorded in the Part 1 record and the substance holds.

Repairs FGI-005. `pipeline_projection` gains `checks_truncated` and `checks_expansion_cursor_ref` on exactly the pattern DL-054 set, a truncated list must carry its cursor and a complete one must not, and `policy_set_partial` joins the disabled reason vocabulary.

## Record 19 — AZ-19 (TA-025): canonical_url is required but Azure supplies none for a policy evaluation

SCS-016 names canonical URL among the mandatory fields for a materialized Check record and the schema required it with a URI format. The Azure policy evaluation record has no URL field at all, only links and a configuration URL the provider documents as where the policy configuration can be retrieved, which is the policy's own REST URL rather than a human-facing result page. Either the record could not validate or Puppet Master synthesised a link and presented it as the provider's own.

Repairs SCS-016. The canonical URL becomes nullable with a required `canonical_url_origin` and `url_absent_reason`, an absent URL must state why, a present one must declare whether the provider supplied it or Puppet Master synthesized it, and the Check row's normalized status is pinned to the closed gate vocabulary. The same three fields are required on the forge `gate_record`, so the rule cannot be evaded by omission in either carrier, and a negative omits all three. This is the minimal touch to a document another branch is also editing.

## Record 20 — AZ-20 (TA-026): No vote, approval or reviewer object exists in the forge contracts

ADO-003 had two acceptance criteria about votes and no shape to hold them: the forge schema had forty-six definitions and not one matched a vote, an approval or a reviewer, and the review surface is a revision, a thread and a pipeline projection whose checks is an array of opaque references. On the provider side the vote-carrying identity reference has no iteration id, no commit id and no timestamp, while the re-approve flag shows that per-iteration vote accounting exists server-side and is not exposed.

Repairs ADO-003. Jared chose amendment now with the carrier as a card, which `q-010` records. The two vote criteria are amended to the observed-at binding a shape can keep, and the carrier itself is the card answered as `q-007`, landing as DL-065 and FGI-020.

## Record 21 — AZ-21 (TA-029): api_compatibility.endpoints could not hold a per-endpoint API version

ADO-004 promises that API compatibility pins the variant, host and version, the adapter and catalog, the endpoints, scopes and features, and the rate. The endpoints field was a bare name list carried alongside one adapter version, one catalog generation and one contract hash. The version is not per product and not even per host; it is per endpoint on a host, because one Azure host serves the branch policy configuration route at a released version and the policy evaluation route at a preview version in the same request family.

Repairs FGI-007. Each probed endpoint is an object carrying its own `api_version` and `release_state`, and a bare endpoint name is rejected by a negative fixture.

## Record 22 — AZ-22 (TA-030): Applicability and status are two capabilities with different keys and different maturity

Which policies apply is branch-keyed and released; whether each one passes is review-keyed and preview only. The frozen Plans treated checks as one capability, so an Azure DevOps Server host whose probed API set lacks the preview evaluations endpoint had no way to say so: it had to infer status from the review's merge status or show an empty check list, both of which the corpus forbids elsewhere.

Repairs ADO-002 and ADO-004. Applicability and status are stated as two capabilities, `repository_policy` and `checks`, probed and degraded separately, and a missing preview evaluations route reports `capability_unsupported` naming the API version it looked for rather than an inferred status or an empty list. AZ-03 supplies the mechanism.

## Record 23 — AZ-23 (TA-032): Azure DevOps Server had no per-instance host, version or trust record

ADO-002 requires a current signed host and version support entry, ADO-004 pins host and version in API compatibility, and FGI-015 requires instance trust to validate the normalized host, the API base path, a scoped private certificate authority and the SSH host key before credentials. The one typed record in the corpus carrying those facts restricted its provider to two self-hosted products and all ten of its fixtures were those two, while API compatibility carries neither a host nor a version field. Azure DevOps Server, a customer-hosted instance with a per-collection API base path and its own version, could not have one.

Repairs FGI-007. The instance profile's provider and detected product widen to `azure_devops` with their own conditional, and an Azure DevOps Server instance profile joins the Azure fixture pack.

## Record 24 — AZ-24 (TA-033): The project GUID is a second required identifier, not a spelling of the project name

ADO-001 says project is mandatory and that no path, remote URL, display name or focus may replace the hierarchy, and section 7.1 makes a missing project a needs-binding state. The repository got two identifiers, a human slug and a required provider repository id, and the project got one: a corpus-wide search for a provider project id returned zero files. Both identifiers are required in the same Azure request in different slots, because the route path accepts either a project id or a project name while the policy artifact identity accepts only the GUID. A missing GUID produces a well-formed URL, a successful response and an empty list; the reference client's own test asserts the literal undefined segment.

Repairs ADO-001. `repository_binding` gains `provider_project_id`, required and GUID-shaped for `azure_devops` through its own conditional, obtained from a provider resource and never parsed from a URL, with three negatives. NEW-01's proposed change to the base type is not made: the confirmation review showed the existing conditional already rejects a null project for `azure_devops`, and only the second negative it allowed as fixture coverage was added.

## Record 25 — AZ-25 (TA-036): Requeueing an Azure policy evaluation cancels any running build

ADO-004 promises ObservableWork for run, retry and cancel and terminal provider receipts for async mutations, and FGI-005 forbids retrying or cancelling from a stale projection. The frozen contract had no per-review policy-evaluation identity, no retry target kind for one, and no way to state that a retry has a destructive side effect on a third object. The provider documents that any policy evaluation can be requeued, that at present only build policies perform any action in response, and that requeueing a build policy queues a new build and cancels any existing one. For every non-build policy the requeue is a silent no-op.

Repairs ADO-004. Section 7 states that the requeue is not offered and what it would have to disclose if it ever were: the policy type, the cancellation, and a refusal rather than a silent success where no action follows. The command itself is a capability and was deferred to the card answered as `q-006`, landing as DL-064 and FGI-019.

## Record 26 — AZ-26 (TA-042): Neither provider-profile schema can express FGI-015's own acceptance criterion

FGI-015 states verbatim that every provider profile identifies issuer, allowed host, setup method, non-secret token owner, requested scopes, refresh and revoke, and separate Git-versus-API roles. Both profile schemas are closed and neither has a field for any of those seven facts: the matrix profile has fourteen properties, all required, and not one of the seven is among them; the adapter profile's auth methods is a flat enum array; the scopes list on API compatibility is probe-level rather than per method; and the credential access enum lives on the instance profile, which was self-hosted only. This is not an Azure defect at all.

Repairs FGI-015. Re-owned out of the Azure lane on Jared's instruction, recorded as `q-013`. The criterion is amended to map each of the seven facts to a named existing surface: the setup method to `provider_adapter_profile.auth_methods`, the issuer to `Plans/GitHub_API_Auth_and_Flows.md` and `oauth_registration_ref`, the allowed host to `normalized_host` and `api_base_path`, the non-secret token owner to the `credential_ref` and `credential_key_ref` fields, the requested scopes to `api_compatibility.scopes` and `token_lease.scope_grant_refs`, refresh and revoke to the `token_lease` lifetime and state fields, and the Git-versus-API roles to `git_transport_state`, `api_state`, `transport_api_independent` and `credential_access`. Adding the seven fields to the matrix and adapter profile schemas would be a new capability and is not done here. An earlier draft of this criterion named a coined `point-of-consent` surface that exists nowhere in canon; blind review cycle 1 raised that as R-07 and it was removed, so this atom's exact token `point-of-consent` was **withdrawn by review** and replaced by `auth_methods` and `credential_access`, which the amended prose carries. Blind review cycle 2 found the amended wording still imprecise in three ways, recorded as `q-021` and `q-022` rather than fixed, because the cycle cap was reached.

## Record 27 — CD-01 (TA-014): Branch policies are shown on a pull request and the branch read is deferred

Nothing in the closed forty-three-command forge set reads the branch policies guarding a branch: the two policy commands are a two-phase mutation and the checks command is review-scoped. The two arms disagreed on the disposition. This is not a correction, because the Plans never promised more than policy information on a pull request.

Repairs ADO-005 and records DL-059. The owner states that the branch policies shown are the ones evaluated on a pull request and that reading the policies configured on a branch is not offered. The read is deferred rather than declined and deliberately receives no PlanUnit, because its home is the gate list DL-062 establishes.

## Record 28 — CD-02 (TA-027): An Azure vote is bound to the revision Puppet Master observed

No Azure vote carries a revision identity, so under the corpus rule read literally every Azure approval is stale on first observation. The Plans had to choose between observation-time binding and never attributable, and never attributable makes ADO-003's own acceptance criteria unmeetable.

Repairs DL-060 and ADO-006. An Azure vote or policy evaluation is bound to the provider revision Puppet Master read it against and labelled as observed by Puppet Master rather than provider-asserted; staleness is computed against the whole provider revision identity, so a target move or a retarget stales an observation with no head change.

## Record 29 — CD-03 (TA-040): The checks view leads with evaluations and separates unwatched statuses

A status check is both a separate API surface and a branch-policy type, so statuses only loses the requirement level, evaluations only misses statuses no policy watches, and both naively shows one check twice in two different states. The fork was undecided rather than decided wrongly, and the research could not confirm a join key exists.

Repairs DL-061 and ADO-007. Evaluations are the primary list, an unwatched status appears in a separate informational group that is never presented as a gate, one check never appears twice, and the joined single list is admitted only on a documented and evidence-bearing key, tracked as `q-018`.

## Record 30 — CD-04 (TA-041): One gate list with a source column and an enforcement column

The Azure owner promises Policies and Checks while both consumer owners name only current checks, so the promise had nowhere to render. The alternative was a provider-neutral policies region amending two consumer owners, which risks the section proliferation Source Control forbids.

Repairs DL-062 and SCS-023. The current checks region stays one region and becomes one gate list whose rows carry their source and their enforcement, with the same two columns named by the final interface specification as F3-561.

## Record 31 — CD-05 (TA-035): The merge command gains a typed strategy field that is always shown

The prose half of this landed as AZ-09: on Azure an omitted merge strategy selects no-fast-forward. The field itself adds a property to a closed command shape and a mapping per provider, so it was a product decision rather than a correction.

Repairs DL-063 and FGI-018. One provider-neutral typed strategy field, defaulting to the provider's own default rather than a Puppet Master preference, always shown before the merge including when it is the default, with forbidden strategies not offered and a forbidden completion refused before the request.

## Record 32 — CD-06 (TA-036): A requeue command disabled with a typed reason where there is no equivalent

The prose half of this landed as AZ-25: the requeue is not offered today. Adding the command means a new command in the frozen forge set with permissions, a receipt and fixtures, and no equivalent on some providers, so it was a product decision.

Repairs DL-064 and FGI-019. The command is planned, disabled with a typed reason and never hidden where the provider has no equivalent, refused with a typed reason where it would do nothing, and disclosing the build cancellation in the confirmation before dispatch. It admits no command to the central command set or production wiring.

## Record 33 — CD-07 (TA-026): A provider-neutral vote and reviewer carrier bound the way DL-060 binds

The amendment half of this landed as AZ-20: ADO-003's two vote criteria stop promising what no shape can bind. Whether the promise returns needed a new record family in the forge contracts, which is a capability.

Repairs DL-065 and FGI-020. A provider-neutral carrier holding reviewer identity, a vote value from one closed vocabulary, a required-reviewer flag, the bound revision and the binding kind, following DL-060's rule, exercised by fixtures for more than one provider before it is claimed as common.
