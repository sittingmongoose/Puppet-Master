# External Motion Research

## Scope

This synthesis covers 40 sources across platform guidelines, design systems, component libraries, browser APIs, performance guidance, usability research, and specialist publications. It records recurring motion responsibilities and evaluation dimensions. It does not prescribe a motion style or choreography for the concepts.

The concept agents should not repeat the full sweep. They should perform only targeted research needed for the motion they independently choose to implement.

## Source inventory

| Source | Category | Observed focus | Primary source |
|---|---|---|---|
| Material Design 3: Motion overview | Design system | Motion as state, hierarchy and spatial relationship | https://m3.material.io/styles/motion/overview |
| Material Design 3: Easing and duration | Design system | Tokenized easing and duration families | https://m3.material.io/styles/motion/easing-and-duration/overview |
| Material Design 3: Transition patterns | Design system | Container and shared-axis transition patterns | https://m3.material.io/styles/motion/transitions/transition-patterns |
| Apple Human Interface Guidelines: Motion | Platform guideline | Motion, continuity, direct manipulation and restraint | https://developer.apple.com/design/human-interface-guidelines/motion |
| Apple Accessibility: Reduce Motion | Platform guideline | Reduced-motion behavior and platform preference | https://developer.apple.com/accessibility/ |
| Fluent 2: Motion | Design system | Relationships, continuity, enter, exit and transition motion | https://fluent2.microsoft.design/motion |
| Fluent 2: Duration | Design system | Duration tokens by distance and interaction scale | https://fluent2.microsoft.design/motion#duration |
| Fluent 2: Easing | Design system | Natural acceleration and deceleration curves | https://fluent2.microsoft.design/motion#easing |
| Carbon: Motion overview | Design system | Productive and expressive motion systems | https://carbondesignsystem.com/elements/motion/overview/ |
| Carbon: Productive motion | Design system | Frequent, task-focused state transitions | https://carbondesignsystem.com/elements/motion/productive-motion/ |
| Carbon: Expressive motion | Design system | Infrequent emphasis and larger transitions | https://carbondesignsystem.com/elements/motion/expressive-motion/ |
| Adobe Spectrum: Motion | Design system | Motion principles, durations and easing | https://spectrum.adobe.com/page/motion/ |
| Adobe Spectrum: Coach marks and transitions | Design system | Contextual reveal and dismissal behavior | https://spectrum.adobe.com/page/coach-mark/ |
| Atlassian Design System: Motion | Design system | Motion tokens and purposeful UI feedback | https://atlassian.design/foundations/motion/ |
| Atlassian Design System: Reduced motion | Design system | Alternative behavior under motion reduction | https://atlassian.design/foundations/motion/#accessibility |
| Shopify Polaris: Motion | Design system | Outcome clarification, hierarchy and motion restraint | https://polaris.shopify.com/design/motion |
| Salesforce Kinetics System | Design system | Choreography and transition primitives | https://www.lightningdesignsystem.com/kinetics/ |
| Salesforce Kinetics: Choreography | Design system | Coordinated sequences and element relationships | https://www.lightningdesignsystem.com/kinetics/choreography/ |
| SAP Fiori: Motion design | Design system | State change, navigation and feedback motion | https://experience.sap.com/fiori-design-web/motion-design/ |
| SAP Fiori: Animation | Design system | Animation behavior for enterprise interfaces | https://experience.sap.com/fiori-design-web/animation/ |
| Ant Design: Motion | Design system | Natural, concise and continuous motion principles | https://ant.design/docs/spec/motion/ |
| GitHub Primer: Motion foundations | Design system | Semantic motion tokens and accessibility alternatives | https://primer.style/foundations/motion |
| GitHub Primer Primitives guide | Design system | Motion token implementation and duration constraints | https://github.com/primer/primitives/blob/main/DESIGN_TOKENS_GUIDE.md |
| Radix Primitives: Animation guide | Component library | State-driven animation and data attributes | https://www.radix-ui.com/primitives/docs/guides/animation |
| Radix Context Menu | Component library | Computed transform origin and collision-aware popup motion | https://www.radix-ui.com/primitives/docs/components/context-menu |
| Motion: Transitions | Animation library | Spring, tween and transition configuration | https://motion.dev/docs/react-transitions |
| Motion: Layout animations | Animation library | Layout continuity and shared layout changes | https://motion.dev/docs/react-layout-animations |
| Motion: Reduced motion | Animation library | Disabling transform and layout motion while retaining safe feedback | https://motion.dev/docs/react-reduce-motion |
| MDN: prefers-reduced-motion | Web platform | User preference detection and alternate motion behavior | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion |
| MDN: Web Animations API | Web platform | Browser-managed animation timing and playback | https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API |
| MDN: View Transition API | Web platform | Coordinating old and new visual states | https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API |
| web.dev: Animations guide | Web performance | Compositor-friendly motion and performance measurement | https://web.dev/articles/animations-guide |
| web.dev: High-performance CSS animations | Web performance | Transform and opacity performance behavior | https://web.dev/articles/animations-guide#avoid-properties-that-trigger-layout-or-paint |
| web.dev: View transitions | Web platform | Page and state transition implementation | https://web.dev/articles/view-transitions |
| Nielsen Norman Group: Animation for attention and comprehension | UX research | Feedback, orientation and cognitive cost | https://www.nngroup.com/articles/animation-usability/ |
| Nielsen Norman Group: Motion and animation in interfaces | UX research | Purpose, timing and interruption risk | https://www.nngroup.com/topic/animation/ |
| Smashing Magazine: Accessible animations | Specialist publication | Motion reduction and preserving meaning | https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/ |
| Smashing Magazine: Animation principles for the web | Specialist publication | Choreography, continuity and performance | https://www.smashingmagazine.com/2016/08/css-animations-motion-curves/ |
| A List Apart: Web animation at work | Specialist publication | Functional animation and interface communication | https://alistapart.com/article/web-animation-at-work/ |
| W3C WCAG: Animation from interactions | Standard | User ability to disable nonessential interaction-triggered motion | https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html |

## Cross-source observations

### Motion communicates state and relationship

Across the reviewed systems, motion is repeatedly described as a way to communicate origin, destination, hierarchy, continuity, feedback, and state change. It is not treated only as decoration.

### Frequent and infrequent motion are distinguished

Several systems distinguish frequent task-focused motion from stronger or more expressive motion used for occasional emphasis. This is a classification of use frequency and purpose, not a prescription for Puppet Master.

### Duration and easing are system properties

Design systems commonly define duration and easing families or tokens rather than selecting unrelated values for every component. The source sets vary in their exact values and naming.

### Origin matters for attached surfaces

Popup and menu systems frequently calculate or communicate an attachment origin. Collision-aware component libraries expose transform origin and placement information so the motion remains related to the trigger. This is consistent with Puppet Master's already locked corner-origin popup behavior.

### Motion needs a complete reduced-motion state

Reduced-motion guidance consistently treats the preference as a behavioral alternative, not merely a slower animation. Spatial movement may be removed or reduced while safe non-spatial feedback remains. Critical controls and information remain available.

### Motion cannot be the only carrier of meaning

Status, completion, selection, or hierarchy must remain understandable when animation is disabled or missed. Labels, geometry, content, and state must carry the meaning too.

### Performance affects perceived quality

Browser and performance sources distinguish compositor-friendly transform and opacity changes from motion that repeatedly triggers layout or paint. Smoothness, clipping, delayed input, and layout shifts are therefore part of visual verification.

### Choreography can preserve continuity

Several systems describe coordinated or sequential movement when multiple elements change. The sources vary on how much choreography is appropriate, and they do not establish one required style.

### Motion should be evaluated in context

A transition that works in isolation may fail when text wraps, a popup collides with the viewport, a long thread is scrolled, or several dynamic surfaces update. The required theme-width-state matrix is therefore part of motion verification.

## Puppet Master motion already fixed by canon

The supplied Plans already lock the Model, Mode, Persona, effort, thoroughness, Context Ring, Context Lens, Worktree, and header-menu popup family to click activation, corner-origin sprout motion, in-place resizing, shared popup chrome, single-overlay behavior, and reduced-motion completion.

## Motion still open to concept design

The handoff does not prescribe the motion for conversation grouping, long-message expansion, compact activity history, questionnaire progression, Goal/Todo/subagent/diff state, artifact handoff, search focus, thread switching, or docked-to-pop-out remounting. Those are independent design decisions, subject to the functional and test requirements.
