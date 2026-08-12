# Creative Director Brief

## The design objective

Make Puppet Master's Assistant Chat feel like a **finished, authored application**, not an AI-generated dashboard and not a generic chat client with agent cards bolted onto it.

The human conversation is the primary film. Goal state, tools, subagents, questions, diffs, artifacts, context, and runtime truth are supporting layers that enter, transform, recede, and remain inspectable without overwhelming the transcript.

## Freedom is intentional

This packet fixes behavior, not appearance.

Do not assume the answer is:

- a conventional left thread list;
- a stack of rounded cards;
- a status rail;
- one universal activity accordion;
- a modal questionnaire;
- the existing PMConcept7 layout;
- the T3, OMP, Hermes, Codex, Claude, Qwen, or video layout.

You may invent new relationships between transcript, history, tools, artifacts, context, and the surrounding workspace.

Cards are allowed. Rounded geometry is allowed. Blur, material, line, texture, depth, and color are allowed when theme-appropriate and Slint-portable. What is prohibited is a lazy generic-AI composition: arbitrary nested cards, meaningless chips, decorative gradients, colored left-edge status bars, excessive glows, and visual hierarchy that exists only because it is fashionable.

## Eight real ideas, not eight skins

Each window concept and each thread concept needs:

```text
Design thesis
Conversation-reading strategy
Secondary-detail strategy
Narrow-width strategy
Motion thesis
Question strategy
Activity/work strategy
History strategy
Artifact relationship
```

A concept is not distinct merely because the corners, accent color, or type scale changed.

Shared state logic, data adapters, test controls, SVG assets, theme tokens, and low-level components are encouraged. The visible composition and interaction logic should remain meaningfully distinct.

## Film-level motion

Treat motion as authored direction:

- Establish where an object came from and where it belongs.
- Use anticipation, continuity, replacement, compression, and settle when they clarify causality.
- Let important state changes have pacing and hierarchy.
- Preserve visual anchors while surrounding content transforms.
- Make interruption, redirect, pause, resume, failure, and recovery feel intentional.
- Choreograph concurrent activity without turning the interface into constant motion.
- Let completion condense complexity into calm.

Do not solve motion with generic fade-in/fade-out everywhere. Do not prescribe one global duration or easing system before the concepts establish their own rhythm.

Motion must never:

- clip text;
- steal focus;
- move a target while the user is interacting with it;
- force the transcript to the bottom after the user has scrolled away;
- break the scroll anchor;
- make reduced motion incomplete;
- pulse indefinitely except for a truthful active state such as BSD Auto actively evaluating;
- hide the only indication of an important state.

## The four supplied videos

Use them seriously for principles:

- sent-message spatial continuity;
- stable paged question review;
- compact evolving execution activity;
- a preparation pill morphing into a question flow and back into submission.

Do not copy their typography, colors, shapes, product chrome, card geometry, or exact choreography. The point is to absorb how they preserve causality and compress complexity.

## The external references

T3, OMP, Hermes, and other sources are useful for state models, failure modes, streaming, provider routing, context, tools, and durable work. They are not an art-direction board.

The current T3 implementation's slow thread loading is a negative benchmark. The desired product behavior is durable many-thread operation over weak or intermittent connections, not visual imitation of T3.

## The emotional quality

The concepts should feel:

- confident rather than busy;
- alive rather than animated for decoration;
- technically truthful without looking like a diagnostics console;
- powerful without exposing every control at once;
- comfortable for long reading sessions;
- coherent across Basic, Friendly, Retro, and Glass themes;
- like one designer made the complete system.

## Do not optimize for screenshots alone

A beautiful still frame that breaks under:

- a 520 px chat width;
- pinned history;
- an open artifact;
- a 400-message thread;
- two questionnaires;
- a blocked Goal;
- three subagents;
- reconnect and replay;
- a long user message;
- a route warning;

is not a successful concept.

The best concept should become more convincing as it is interacted with.
