# Research and design decisions

Research checked September 4, 2026. The user brief and the supplied **PM Onboarding/Tour Newbie-First Addendum, September 3, 2026** set product requirements. The sources below inform interaction design; they do not authorize extra Puppet Master features. Interpretations and implementation choices are labelled separately from source findings.

## 1. Teach an activity, not an inventory

**Finding.** Nielsen Norman Group cautions that front-loaded tutorials interrupt work and are easily forgotten. Its contextual-help recommendations include dismissibility, rediscovery, and progressive disclosure. [1]

**Astra decision.** Setup handles a real immediate task: establish a project. The optional tour then teaches one coherent activity: turn a book-club idea into an understandable plan. It does not enumerate every rail, tab, settings manager, or backend concept. Help appears near a live control, can be skipped, and can be replayed. Thirteen steps include nine planning-oriented steps; the early Chat and layout exercises prepare the user to understand that final activity.

**Trade-off.** A cinematic tour must not force every returning user to watch an introduction again. Resume and replay are different actions. The first-run experience offers the tour rather than making it a condition of entering the app.

## 2. Reduce decisions without hiding consequences

**Finding.** Progressive disclosure moves advanced or infrequent controls away from the primary task. It is not a justification for hiding information required to make the immediate decision. [2] NN/g's form guidance organizes cognitive-load reduction around structure, transparency, clarity, and support. [3]

**Astra decision.** Local work is the ordinary path. NAS protocols, public endpoints, source-service instances, provider catalogs, copied-setting groups, and credential details appear only when relevant. Labels begin with the user's objective: a folder, an online copy, a computer doing the work. Before confirmation, review still shows the consequential choices and Edit actions.

**Source-derived requirement.** The packet requires a draft and one late project commit. Astra therefore separates preparing a service account from creating that service's repository. The source-account step can open sign-in or sign-up, while the draft remains reversible. Broad AI-provider configuration comes after project creation. CLI installation, account authentication, and model availability remain separate states.

## 3. Demonstrate on actual controls

**Finding.** Intercom's own tour documentation supports pointers that advance through user clicks and input, plus multi-page tours triggered by actions on the real page. [4][5]

**Astra decision.** Completion depends on observed application state, not a timer alone. Show Me invokes the same handlers as the corresponding action. Chat movement uses the workspace owner's real drag/update/drop lifecycle; the widget uses its actual size menu. A missing target offers recovery instead of silently advancing. The guided cursor gives an attention cue, follows a continuous path, settles, performs the action, and lets the result be seen before continuing.

**Boundary.** The Planning Wizard's interactive practice adapter is local to the existing Wizard surface. It is not proof that the production Wizard reducer, compiler, or runtime has been implemented. That distinction is visible in the UI and retained in the porting report.

## 4. Motion should express cause and effect

**Finding.** Google's web performance guidance recommends favoring transform and opacity, checking paint/layout cost, and measuring rather than assuming that an animation is fast. [6] Material's motion documentation distinguishes expressive, larger transitions from smaller utility motion; current Material also documents a newer physics system, so Astra does not claim to implement the latest Material physics. [7]

**Astra decision.** A stable window anchors the experience. The illustration dissolves between distinct scenes; form content enters over a shorter distance. Pointer travel and the real drag are longer because the user must understand the path. Changing a planning answer updates the same decision card, allowing the user to associate the new permissions with their choice. No full-screen fade-to-black separates steps.

**Measured revision.** The original Astra recording averaged roughly 14 browser animation callbacks per second despite a 60-fps capture stream. Removing backdrop blur and keeping live appearance preview local raised the comparable appearance run to roughly 47. This is a measured environment-specific improvement, not a native performance guarantee. The recorder never interpolates frames. The source includes reduced-motion and hidden-document pause behavior.

## 5. Use familiarity, not decorative explanations

**Finding.** NN/g distinguishes unavoidable effort of understanding a task from avoidable effort caused by clutter and unnecessary presentation. It recommends familiar mental models and eliminating irrelevant visual elements. [8]

**Astra decision.** The tour asks for a neighborhood book-club site rather than a technical architecture. The meaningful question is who can update its meeting and book. “Only me” becomes one private sign-in; “A few organizers” adds shared sign-in and permissions. The user sees a reason to answer rather than a jargon-heavy questionnaire. ELI5 rewrites the same Teacher answer instead of introducing unrelated content.

The art communicates atmosphere and identity, not technical instructions. Eight small inline SVG worlds avoid image-network dependencies. Text stays on the quiet side of the setup window, not over detailed illustrations. Friendly, Glass, Retro, and Basic have distinct material treatments as well as light/dark artwork.

## 6. SSH can be assisted, but trust cannot be invented

**Finding.** OpenSSH obtains connection settings from command-line, user, and system configuration. Its host-key checking options distinguish confirmed trusted hosts from new or changed identities. Disabling checks is not a safe automation shortcut. [9]

**Finding.** TrueNAS documents a semi-automatic setup specifically for TrueNAS peers. It requires a local key pair, remote administrator credentials, and documented SSH prerequisites. It is not evidence that arbitrary NAS devices support permissionless automatic setup. [10]

**Astra proposal.** “Help me connect” first offers an existing approved connection. Otherwise, a production PM execution host could generate a dedicated key after consent, verify the target identity, and add only the public key using an already-authorized API or a one-time protected authentication flow. Devices that disallow password/API provisioning need an administrator handoff. Do not silently enable SSH, root login, agent forwarding, or firewall access.

A connection test should inspect permissions on an existing parent folder without creating the project. Folder/repository creation stays behind the final commit. Keys and credentials belong in the execution host's protected store; copied project settings carry references only. The HTML illustrates this sequence with a conspicuously invalid sample fingerprint and no real key material.

## Sources

[1] NN/g, *Onboarding Tutorials vs. Contextual Help* (2023): https://www.nngroup.com/articles/onboarding-tutorials/

[2] NN/g, *Progressive Disclosure*: https://www.nngroup.com/articles/progressive-disclosure/

[3] NN/g, *Few Guesses, More Success: 4 Principles to Reduce Cognitive Load in Forms* (2025): https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/

[4] Intercom, *Design your Product Tour*: https://www.intercom.com/help/en/articles/2900887-design-your-product-tour

[5] Intercom, *Create a Product Tour across multiple pages*: https://www.intercom.com/help/en/articles/2901105-create-a-product-tour-across-multiple-pages

[6] Google web.dev, *How to create high-performance CSS animations*: https://web.dev/articles/animations-guide

[7] Material Design 3, *Easing and duration* and *Motion*: https://m3.material.io/styles/motion/easing-and-duration ; https://m3.material.io/styles/motion/overview/how-it-works

[8] NN/g, *Minimize Cognitive Load to Maximize Usability*: https://www.nngroup.com/articles/minimize-cognitive-load/

[9] OpenBSD/OpenSSH, `ssh_config(5)`: https://man.openbsd.org/ssh_config

[10] TrueNAS, *Adding SSH Credentials*, current documentation: https://www.truenas.com/docs/scale/credentials/backupcredentials/addsshconnectionkeypair/
