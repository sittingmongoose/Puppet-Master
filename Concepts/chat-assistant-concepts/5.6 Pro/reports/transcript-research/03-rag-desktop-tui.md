# Chat Transcript Rendering — Research Slice C
## RAG / knowledge tools, desktop clients, terminal UIs

Method note: figures below are read from **source** (raw.githubusercontent.com fetches of the
message component and its stylesheet) unless marked otherwise. Where I could only see a
screenshot or docs page, it is labelled as such. Anything I could not verify is called out
explicitly rather than estimated.

Fetched 2026-08-22 against each repo's default branch.

---
## 1. Khoj

*Self-hostable "AI second brain": chats over your own notes/docs plus live web search. Next.js + Tailwind + shadcn/ui web client.*

Source read:
- `src/interface/web/app/components/chatMessage/chatMessage.module.css` — https://github.com/khoj-ai/khoj/blob/master/src/interface/web/app/components/chatMessage/chatMessage.module.css
- `src/interface/web/app/components/chatMessage/chatMessage.tsx` — https://github.com/khoj-ai/khoj/blob/master/src/interface/web/app/components/chatMessage/chatMessage.tsx
- `src/interface/web/app/components/referencePanel/referencePanel.tsx` — https://github.com/khoj-ai/khoj/blob/master/src/interface/web/app/components/referencePanel/referencePanel.tsx
- `src/interface/web/app/chat/page.tsx`, `app/components/chatHistory/chatHistory.tsx`

**1. Container shape.** *Asymmetric hybrid* — the user gets a bubble, the assistant gets an accented full-width block. Both share `div.chatMessageContainer`: `margin: 12px; border-radius: 16px; padding: 8px 16px 0 16px; word-break: break-word;` and a flex column.
- `div.you` — `background-color: hsla(var(--secondary)); align-self: flex-end; border-radius: 16px;` — right-aligned tinted bubble.
- `div.khoj` — `background-color: transparent; color: hsl(var(--accent-foreground)); align-self: flex-start;` — **no fill at all**. It is differentiated instead by (a) a `shadow-md` class pushed on in `constructClasses()` and (b) a **left accent rail**: `chatMessageWrapperClasses()` appends `border-l-4 border-opacity-50 border-l-{agentColor}-500`, where the colour comes from the *agent* assigned to the conversation (`data?.agent?.color`, default orange). So the answer's identity is carried by a 4px coloured stripe keyed to which agent answered — a genuinely nice idea.
- Widths: the whole history column is `w-4/6` (66.67%) on desktop, `w-full` under the mobile breakpoint (`chat/page.tsx:73`). Within it, the assistant is `youfullHistory { max-width: 100% }` vs. user `div.youfullHistory` capped to `90%` under `max-width: 768px`. Assistant messages get extra indent: `div.khojChatMessage { padding-top: 8px; padding-left: 16px; }`, user messages have `padding-left: 0`.

**2. Attribution.** Minimal — **no avatars, no name labels, no model badge on the message**. There is a `div.author { font-size: 0.75rem; color: #808080; text-align: right; }` rule but the live path uses a **hover-revealed footer**: the timestamp + action buttons only render when `(isHovering || isMobileWidth || isLastMessage || isPlaying)`. Timestamp is relative (`renderTimeStamp` → "3m ago" / "2h ago" / `${Math.round(timeDiff/86400e3)}d ago`) with the absolute date in `title=`. No consecutive-message collapsing (each turn always gets its own container). Agent identity lives in a separate `agentIndicator` above the history and in the border colour.

**3. Citations — a three-tier disclosure ladder.** Khoj has one of the more considered designs here.
- **Tier 1, the teaser strip.** `TeaserReferencesSection` renders under the message body inside `div.teaserReferencesContainer` with `pt-0 px-4 pb-4`. Its heading is literally `<div className="text-gray-400 m-2">{numReferences} sources</div>` followed by up to **3 teaser cards** (`useState(3)` → `numTeaserSlots`) and a trailing `ArrowRight` icon. Card selection is **priority-ordered**: code-execution references fill slots first, then notes, then online results (`referencePanel.tsx:623-633`). Teaser cards are aggressively clamped — `line-clamp-1` on titles, `line-clamp-2`/`line-clamp-3` on the snippet.
- **Tier 2, hover popover.** Each card is a Radix `Popover` whose `PopoverContent` is fixed `w-[400px] mx-2`; inside, the title relaxes to `line-clamp-2` and the excerpt to `line-clamp-5` (`line-clamp-10` on a code `<pre>`). So hover buys you ~5 lines of the actual chunk without leaving the transcript.
- **Tier 3, side sheet.** The whole strip is a `SheetTrigger`; clicking opens a `Sheet` titled "References" / "View all references for this response", `overflow-y-scroll`, with every card re-rendered at `showFullContent={true}` (which swaps `line-clamp-*` for `block` and adds a `bg-muted` fill). The sheet header carries a **"copy references to clipboard"** button that serialises them via `formatReferencesAsMarkdown()`.
- **Three source *kinds*, visually distinguished by icon only** — `SimpleIcon` picks `<Code/>` for code-execution context, the site's **favicon** (`img src={favicon}`) for online results, and `<Note/>` for retrieved document chunks. Same card chrome, different glyph.
- **No relevance/confidence score is surfaced anywhere.** I checked `constructAllReferences` and the card components; scores are not passed to the UI.
- **No inline numbered footnotes** — citations are strictly a post-message strip, not `[1]` markers in the prose. (Khoj does have a separate `fileLinksPlugin.ts` that turns file references in the markdown into `a.file-link` anchors with a hover preview portal — that *is* inline, but it's for files you attached, not retrieved chunks.)

**4. Density.** `margin: 12px` between containers (so ~24px effective gap), `padding: 8px 16px 0 16px` internal, plus `chatMessageWrapper { padding-left: 1rem; padding-bottom: 1rem; }`. Block rhythm inside prose: `ol, ul, p:not(:last-child) { margin-bottom: 16px }`. Tables are heavy: `border-collapse: collapse`, 1px border on the table *and* every cell, `padding: 8px 12px`, `min-width: 120px` per cell (dropped to `40px` on mobile), striped `nth-child(even)` at `--muted/0.3` and a `hover` row at `--muted/0.5`. Font-size and line-height are inherited from the Tailwind base — **not set in the message CSS**, so I can't give a number. No compact mode.

**5. Streaming.** An incoming message is rendered as a normal `ChatMessage` plus a sibling `TrainOfThoughtComponent`. While `!completed` it shows `<InlineLoading className="float-right" />`; when complete the whole reasoning block **collapses into a "Thought Process ⌄" ghost button**, expanding via Framer Motion `AnimatePresence` with open/closed variants. The container simply grows — no reserved height, no skeleton. Note `div.emptyChatMessage { display: none }`: a message with no text yet is hidden entirely rather than showing an empty shell, so the train-of-thought block is what you actually watch during generation. Train-of-thought text is deliberately de-emphasised (`text-gray-400`, `strong { font-weight: 500 }` — i.e. bold is *dialled down*, not up).

**6. Rich content.** Markdown is rendered to HTML and injected with `dangerouslySetInnerHTML`, then post-processed imperatively: a `button.codeCopyButton` (`float: right`, `border-radius: 8px`) is appended into each `<pre>` if not already present. KaTeX is present (there's an explicit `div.chatMessageWrapper a span { display: revert !important }` override "to improve rendering" of Katex links). Images: user images live in a horizontally scrolling `div.imagesContainer` (`overflow-x: auto`) with each thumb `height: 128px; object-fit: cover; border-radius: 8px`; **assistant images invert this** — `div.khoj div.imagesContainer` becomes `flex-wrap: wrap; overflow-x: hidden` and images go `max-height: 512px; height: auto; object-fit: contain`. Generated images from the code sandbox are spliced *inline* into the markdown by `renderCodeGenImageInline()`. File attachments render as grey chips (`bg-gray-500 bg-opacity-25 rounded-lg p-2`) with a type icon, truncated name at `max-w-[200px]` and a byte-size suffix, opening a `Dialog` with a `ScrollArea h-72` of the file text.

**7. n/a** (not a TUI).

**8. Distinctive.** A **full `@media print` transcript stylesheet** — ~120 lines of it. In print the whole thing de-chromes: bubbles become borderless, `div.you` is restyled as a **16pt bold heading** aligned left (the question becomes a section title), the assistant stretches to full width, all buttons/footers `display: none`, train-of-thought becomes a grey `border-left: 2px solid #ccc` blockquote, and the timestamp is re-injected as a divider via `div.you.chatMessageContainer::after { content: "🕐 " attr(data-created) }` — reading the `data-created` attribute set on the container in JSX. Designing "the transcript as a document" as a first-class second rendering is rare and very stealable.

---
## 2. Onyx (ex-Danswer)

*Enterprise RAG over connectors (Drive, Slack, Confluence…). Next.js + Tailwind v4 + an in-house design system ("opal"/"refresh-components").*

Source read (all `main`):
- `web/src/sections/chat/ChatUI.tsx` — https://github.com/onyx-dot-app/onyx/blob/main/web/src/sections/chat/ChatUI.tsx
- `web/src/app/app/message/HumanMessage.tsx`, `messageComponents/AgentMessage.tsx`, `MemoizedTextComponents.tsx`, `BlinkingBar.tsx`, `messageComponents/MessageToolbar.tsx`
- `web/src/refresh-components/buttons/source-tag/SourceTag.tsx`, `SourceTagDetailsCard.tsx`
- `web/src/app/globals.css`

**1. Container shape.** *Bubble for the user, bare prose for the assistant* — the now-dominant asymmetric pattern, executed carefully.
- User: `max-w-120 md:max-w-150 whitespace-break-spaces break-anywhere rounded-t-16 rounded-bl-16 bg-background-tint-02 py-2 px-3`, inside a `flex justify-end`. Note the **asymmetric radius** — top-left, top-right and bottom-left get `radius-16`, **bottom-right is square**, a subtle tail pointing at the user's own side. Padding is 8px vertical / 12px horizontal.
  - *Caveat on the two radius/width figures*: `rounded-t-16` maps to `var(--radius-16)` via `web/lib/opal/tailwind-preset.cjs` (which defines a `borderRadius` scale of `02/04/08/12/16/20/full` → `var(--radius-NN)`). I could **not** locate the file defining those custom properties, so "16 = 16px" is a **naming-convention inference, not verified**. Likewise `max-w-120` / `md:max-w-150` are **not** in Onyx's Tailwind config, so they fall through to Tailwind v4's default 0.25rem spacing scale → **480px / 600px** — correct unless a v4 `@theme` block overrides `--spacing` somewhere I did not find. Treat both as high-confidence but unconfirmed.
- Assistant: no background, no border, no radius — just `<div className="flex flex-col gap-3">` with `px-3` on the body. Differentiation is purely *alignment + absence of a bubble*.
- The list container deliberately sets **no max width**; the comment in `ChatUI.tsx:172` says "No max-width on container — individual messages control their own width." Each message is wrapped in `cn("w-full self-center", msgWidth)` where `const MSG_MAX_W = "md:max-w-[720px] md:min-w-[400px]"` (`ChatUI.tsx:30`). **720px reading width, with a 400px *minimum*** — and the cap only engages at the `md` breakpoint. Note that Onyx **redefines its breakpoints** in `web/tailwind-themes/tailwind.config.js`: `sm: 724px, md: 912px, lg: 1232px, 2xl: 1420px, 3xl: 1700px, 4xl: 2000px` — so the reading cap engages at a **912px** viewport, not Tailwind's default 768px. The same config also carries named widths `message-xs: 450px`, `message-sm: 550px`, `message-default: 740px`, `document-sidebar: 800px`, `document-sidebar-large: 1000px` (the `message-*` set is not referenced by `ChatUI.tsx`; likely legacy).
- There is a **`fullWidthChat` toggle** in the top bar: when on, `msgWidth` becomes `undefined` and `AgentMessage` also drops its `px-3` ("drop the message's reading-width padding so it sits flush with the chat edge"). A real, first-class wide/reading-width switch.

**2. Attribution.** **No avatar and no name for either role.** Roles are conveyed by bubble-vs-prose alone. Everything else is a hover-revealed or completion-revealed toolbar:
- User: a `Hoverable.Item group="humanMessage" variant="appear-on-hover"` places copy + edit buttons in a **gutter to the left of the bubble** on desktop; on mobile (`useScreenSize`) they relocate *below* the bubble instead. No timestamp on the message at all.
- Assistant: `MessageToolbar` renders only when `isComplete`. It carries copy, feedback, TTS, a message switcher (`n / m` pager over sibling regenerations), a **model badge**, and the Sources button. The model badge is conditional and interesting: when an `llmManager` is present it is an interactive `ModelSelector` (regenerate with a different model); in the read-only shared-conversation view there is no manager, so it degrades to a **disabled `OpenButton` with the provider icon + model name** — "surface which model answered" (comment at `MessageToolbar.tsx:326`).
- No consecutive-message collapsing; the tree model means every node is its own message.

**3. Citations — the strongest implementation in this slice.** Two coordinated layers, plus a document sidebar.
- **Inline: numbers become named chips.** The model emits ordinary markdown links whose text is `[N]` (or `[D N]` / `[Q N]`). `MemoizedAnchor` intercepts every anchor, regexes `\[(D|Q)?(\d+)\]`, and looks the number up in a **`citationMap: {citation_num → document_id}`** then in `docs`. It then renders **not the number** but `<SourceTag variant="inlineCitation" displayName={getDisplayNameForSource(doc)} …/>` — i.e. the citation in the running prose reads as a small chip carrying the *source's name* and its connector icon (`SourceIcon`, 18px) or, for web results, the site's **favicon** (`WebResultIcon url={doc.link}`). `Q`-prefixed citations resolve to a *sub-question* instead of a document — sub-agent decompositions are citable the same way answers are.
- **Multi-source collapse.** If one chip covers several sources, the inline variant appends a `+{extraCount}` figure. Chips sized `rounded-04 p-0.5 gap-0.5` for inline vs `rounded-08 p-1 gap-1` for the standalone tag. The standalone tag variant renders an `IconStack`: **up to 3 source icons overlapped with `-space-x-1.5`**, i.e. a stacked avatar-pile of provenance.
- **Hover = a paged detail card.** `SourceTag` wraps itself in a Radix `Tooltip` (`delayDuration={50}`, `side="bottom" align="start" sideOffset={4}`, transparent tooltip shell) containing `SourceTagDetailsCard`: a **`w-70` (280px)** card, `rounded-12 shadow-box-01`, tinted header bar with a **prev/next pager when the chip covers multiple sources**, the doc title on one truncated `leading-5` line, `MetadataChip`s (`bg-background-tint-02 rounded-08 p-1`, icon 12px, label `max-w-40 truncate`) carrying things like a relative date via `timeAgo()`, and a **`line-clamp-4` excerpt** of the chunk. So: chunk preview inline on hover, paged if ambiguous.
- **Message-level "Sources" button → side panel.** The toolbar's `SourcesTagWrapper` renders `<SourceTag variant="button" displayName="Sources" toggleSource>` whose click toggles the **document sidebar** pinned to this message node (`updateCurrentSelectedNodeForDocDisplay(nodeId)` + `updateCurrentDocumentSidebarVisible(true)`), and clicking again on the already-selected node closes it. Per-message sidebar targeting, not a global panel.
- **No numeric relevance/confidence score in the transcript.** Onyx does have document scores (there is an admin `ScoreEditor.tsx` for boosting) but I found no score rendered on a citation chip or details card.

**4. Density.** Between messages: **`gap-12` = 48px** (`ChatUI.tsx:176`, and again on the user/assistant pair wrapper). List padding `pt-4 pb-8`. Inside an assistant message, `flex flex-col gap-3` = 12px between the timeline, the answer body and the toolbar. Markdown rhythm is explicitly tightened from Tailwind Typography defaults in `globals.css:83-121`: headings `margin-top: .75em / margin-bottom: .5em`, `ul/ol` `.5em/.5em` with `padding-left: 1.5rem`, `li` `.25em/.25em`, `hr` `1.25em/1em`. Base font-size/line-height come from design-system `Text` variants (`mainContentBody`), which I did not resolve to px — **unverified**.

**5. Streaming.** Three distinct signals.
- **Block cursor.** `BlinkingBar` is `animate-pulse … inline-block w-2 h-4` — an **8×16px filled bar**, nudged `top-[0.15rem]`. It is injected through the *markdown* path: `MemoizedLink` checks `if (value?.toString().startsWith("*")) return <BlinkingBar addMargin />`, so the backend can place the caret in the token stream.
- **Shimmer, not spinner, for tool activity.** The `AgentTimeline` header while working uses `className="shimmer-text"` on the current-activity string. From `globals.css:217-238`: `animation: shimmer 1s ease-out infinite; background-size: 300% 100%; background-image: linear-gradient(90deg, var(--shimmer-base) 35%, var(--shimmer-highlight) 50%, var(--shimmer-base) 65%); background-clip: text; color: transparent;` with keyframes moving `background-position` from `100% 0` to `0% 0`. A light sweep travelling through the *text glyphs* themselves.
- **Progressive citation attachment, done right.** In `MemoizedAnchor`, if the citation number has arrived but the document has not, the component **returns an empty fragment** with the comment: *"Citation not resolved yet (data still streaming) — hide the raw [[N]](url) link entirely. It will render as a chip once the citation/document data arrives."* So you never see raw markup flicker; chips pop in as their documents resolve. This is the single most transferable streaming detail I found.
- Height is not reserved; the container grows. Newly expanded timeline content animates in with `animate-in fade-in slide-in-from-top-2 duration-300`.
- Pacing: `usePacedTurnGroups` / `usePacketProcessor` deliberately *pace* the packet stream rather than dumping it, and there's a `useStreamingDuration` hook plus a backend-supplied `toolProcessingDuration` that **freezes the live timer** once the true duration is known.

**6. Rich content.** Dedicated `CodeBlock.tsx` + `custom-code-styles.css`, `codeUtils.ts`; KaTeX imported directly in `HumanMessage.tsx` (`import "katex/dist/katex.min.css"`); `FileDisplay.tsx` for attachments (rendered *above* the user bubble); `InMessageImage.tsx` and an `ImageToolRenderer`; a `CustomToolAuthCard` that appears **inside the transcript** when a tool needs OAuth. A `MultiModelPanel` / `MultiModelResponseView` renders **several models' answers side by side for one prompt**, which is why the width system had to be per-message rather than per-container. Copy is customised: `HumanMessage` intercepts `onCopy` to collapse `\n{2,}` runs, and the assistant runs `handleCopy` against the markdown ref so you get clean text rather than DOM soup.

**7. n/a.**

**8. Distinctive.** (a) **Citations render as the source's name, not a number** — the reader never has to look up "[3]". (b) The **empty-fragment trick for unresolved citations** during streaming. (c) **Per-message reading-width with a `min-w-[400px]` floor plus a global full-width toggle**, because side-by-side multi-model answers need to escape the reading column. (d) The model badge is *interactive when you can act on it, a static label when you can't*.

---
## 3. Perplexica — **note: renamed to "Vane"**

*Open-source Perplexity clone (AI answer engine over SearxNG). Next.js + Tailwind + `markdown-to-jsx`.*

**Repo rename:** `github.com/ItzCrazyKns/Perplexica` now 301-redirects to **`github.com/ItzCrazyKns/Vane`** (confirmed via the GitHub API `full_name` on the redirected response; default branch `master`, ~36.4k stars at time of fetch). Source below is from Vane/master; the transcript architecture is the same lineage.

Source read:
- `src/components/Chat.tsx` — https://github.com/ItzCrazyKns/Vane/blob/master/src/components/Chat.tsx
- `src/components/MessageBox.tsx`, `src/components/MessageSources.tsx`, `src/components/MessageRenderer/Citation.tsx`, `src/components/MessageBoxLoading.tsx`

**1. Container shape.** **Not a chat transcript at all — a stack of documents.** The unit is a `Section` (one query + its whole answer), and `Chat.tsx` renders `sections.map(...)` with `space-y-6`, separating consecutive sections with a **1px hairline rule**: `<div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />`. No bubbles anywhere, no backgrounds, no avatars.
- The user's query is rendered as an **`<h2>` at `text-3xl font-medium`** — the question is literally the section *headline*, not a message.
- The answer body is a two-column layout at `lg`: `lg:w-9/12` (75%) for the answer and `lg:w-3/12` (25%) for a **`lg:sticky lg:top-20` media rail** holding `SearchImages` / `SearchVideos`. Below `lg` it collapses to a single column with `space-y-9`.
- Outer padding: `pt-8 pb-44 lg:pb-28 sm:mx-4 md:mx-8`.

**2. Attribution.** **None whatsoever.** No avatar, no name, no role chip, no timestamp, no model badge on the message. Role is conveyed entirely by typography (query = 3xl heading, answer = prose) and by two labelled section headers *within* the answer, each an icon + `text-xl font-medium` heading: **"Sources"** (`BookCopy` icon, 20px) and **"Answer"** (`Disc3` icon, 20px). Consecutive-message collapsing is moot — there is one section per turn.

**3. Citations — inline numeric chips + a 4-up source card grid.**
- **Inline.** The model is instructed to emit a custom `<citation>` tag; `markdown-to-jsx` `overrides: { citation: { component: Citation } }` maps it to an `<a target="_blank">` with exactly: `bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black/70 dark:text-white/70 relative`. So an inline citation is a **tiny tinted pill at `text-xs`, 4px horizontal padding, 4px left margin**, showing the number. No hover card — clicking opens the source in a new tab.
- **Source strip.** `MessageSources` is a **`grid grid-cols-2 lg:grid-cols-4 gap-2`** placed *above the answer* (source-first ordering — you see where it looked before you read what it said). It shows exactly **3 cards** (`sources.slice(0, 3)`), each `rounded-lg p-3` with: title at `text-xs` single-line ellipsis; a row with a **favicon fetched from `https://s2.googleusercontent.com/s2/favicons?domain_url=…`** at 16px; the bare domain derived by regex `url.replace(/.+\/\/|www.|\..+/g, '')`; and on the right a **4px dot + the citation index**, tying the card to the inline `[n]` pill.
- **The 4th grid cell is an overflow tile**: it stacks the *next three* favicons (`sources.slice(3, 6)`) in a row and reads "View {sources.length - 3} more", opening a Headless UI `Dialog` — `max-w-md rounded-2xl p-6`, a `grid-cols-2 gap-2 overflow-auto max-h-[300px]` of every source card. Neat trick: the overflow affordance *previews* what's behind it with favicons rather than being a bare "+N".
- Local files are distinguished by URL scheme (`file_id://`) → a `w-6 h-6 rounded-full` chip with a `File` icon and the label "Uploaded File" instead of a favicon/domain.
- **No chunk text is previewable in the transcript** — only title + domain. **No relevance or confidence score is shown.**

**4. Density.** Section gap `space-y-6` (24px) plus the hairline; inside a section `space-y-6` between Sources / Steps / Answer blocks; source grid `gap-2` (8px), card padding `p-3` (12px). Prose is Tailwind Typography with explicit overrides: `prose-h1:mb-3 prose-h2:mb-2 prose-h2:mt-6 prose-h2:font-[800] prose-h3:mt-4 prose-h3:mb-1.5 prose-h3:font-[600] prose-p:leading-relaxed prose-pre:p-0 font-[400] max-w-none`. Note `max-w-none` — the reading width is imposed by the `lg:w-9/12` column, not by `prose`. No compact mode.

**5. Streaming.** Three states, in order:
- **Skeleton before first token.** `MessageBoxLoading`: `w-full lg:w-9/12 … animate-pulse rounded-lg py-3` containing three `h-2 rounded-full` bars at `w-full`, `w-9/12`, `w-10/12` — a genuine 3-line text skeleton, rendered only when `loading && !messageAppeared`.
- **A labelled activity card** while searching with no research steps yet: `p-3 rounded-lg` bordered box with a **spinning `Disc3` icon** and the literal text "Brainstorming...".
- **The "Answer" section header's icon is the progress indicator**: the same `Disc3` glyph gets `animate-spin` when `isLast && loading` and `animate-none` otherwise. The heading *is* the spinner — no separate widget.
- `<think>` tags are intercepted (`overrides: { think: { component: ThinkTagProcessor } }`) into a `ThinkBox` with a `thinkingEnded` flag. Container grows; nothing is height-reserved apart from the skeleton.

**6. Rich content.** `markdown-to-jsx` with a custom `renderRule`: fenced blocks → a `CodeBlock` component with language, and **inline code is deliberately passed through as raw backticks** (`return \`\\\`${node.text}\\\`\``) rather than styled. A `Renderer` dispatches **inline widgets** — `Weather`, `Stock`, `Calculation` — rendered as cards inside the answer. TTS via `react-text-to-speech` (`Volume2` / `StopCircle` toggle). Images and videos live in the sticky right rail rather than in the prose.
- **Follow-up suggestions** ("Related", `Layers3` icon) render only on the last section when not loading: each is a **full-width `py-4` button separated by `h-px bg-light-200/40` rules**, with a `CornerDownRight` glyph at 15px on the left and a `Plus` at 16px on the right, both turning `sky-400` on group hover. A list, not chips.

**7. n/a.**

**8. Distinctive.** (a) **The question as an `<h2>`** — the whole page reads as a research document with sections rather than a conversation. (b) The **`dividerRef` + `ResizeObserver` trick in `Chat.tsx`**: the floating input is `position: fixed` but its *width* is measured from the last section's content column every resize, so a fixed-position composer stays optically aligned with the reading column. Above it sit two hand-tuned **9-stop gradient scrims** (one for light `#ffffff`, one for dark `#0d1117`) at `h-[calc(100%+24px+24px)]`, so text fades out under the composer instead of being clipped. (c) Sources are rendered *before* the answer.

---
## 4. Morphic

*AI answer engine (Perplexity-style) on the Vercel AI SDK. Next.js + Tailwind + shadcn/ui + **Streamdown**.*

Source read (all `main`):
- `components/chat-messages.tsx` — https://github.com/miurla/morphic/blob/main/components/chat-messages.tsx
- `components/message.tsx`, `components/citation-link.tsx`, `components/source-favicons.tsx`, `components/answer-section.tsx`, `components/user-text-section.tsx`, `components/collapsible-message.tsx`

**1. Container shape.** **Bare prose for both roles** — Morphic has no bubbles at all. Like Perplexica it groups into *sections* (`{ userMessage, assistantMessages[] }`), and the section is the scroll unit (`className="chat-section scroll-mt-14 pb-4 md:pb-14"`, each with `id="section-{id}"`).
- Column: `mx-auto w-full max-w-full md:max-w-3xl px-4` — **`max-w-3xl` = 768px**, same for both roles, full-bleed below `md`.
- The user message is plain text with `whitespace-pre-wrap` and — distinctively — **`line-clamp-3` by default**, with a `text-xs` "Show more ⌄ / Show less ⌃" toggle when `scrollHeight > clientHeight` (measured in a `contentRef` callback). Long prompts don't dominate the transcript.
- Assistant is a `CollapsibleMessage role="assistant" isCollapsible={false} showBorder={false} showIcon={false}` — i.e. the same wrapper tool-call blocks use, but with all chrome switched off.

**2. Attribution.** **No avatar or name on individual messages.** The only identity mark is an `AnimatedLogo` at `size-10` (40px) rendered *once per section, after the assistant's messages*, paired with a `ChatFooterMessage`, and only for the latest section — `animate={isLoading}`. So the brand mark is a **live status indicator parked at the foot of the current answer**, not a per-message avatar. No timestamps, no model badge in the transcript. User message controls (copy, edit) live in a floating pill **`absolute -top-1 -right-1`** overlapping the message's own top-right corner: `p-0.5 bg-background rounded-full shadow-sm border`, `opacity-0` → `md:group-hover:opacity-100` / `max-md:group-focus-within:opacity-100` (hover on desktop, focus-within on touch).

**3. Citations — inline superscript pills with hover cards, plus an overlapping favicon pile.**
- **Rewrite step.** The model emits `[n](#toolCallId)`; `processCitations(message, citationMaps)` rewrites those to real URLs before render (`components/message.tsx`), against a `citationMaps: Record<string, Record<number, SearchResultItem>>` assembled across *all* messages in the chat by `extractCitationMapsFromMessages`. Citation numbering is therefore chat-global, not message-local.
- **The pill.** `CitationLink` (`components/citation-link.tsx`) styles a citation as: `text-[10px] bg-muted/50 text-muted-foreground/60 rounded-full h-4 px-1.5 inline-flex items-center justify-center hover:bg-primary hover:text-primary-foreground duration-200 no-underline -translate-y-0.5 whitespace-nowrap`. Concretely: **a 16px-tall fully-round pill, 10px type, 6px horizontal padding, nudged up 2px** so it reads as superscript, deliberately low-contrast (`/60` text on `/50` fill) until hover inverts it to the primary colour.
- **Hover card.** A Radix `Popover` opened on `onMouseEnter` (not click), `w-80` (**320px**), `p-0 shadow-xs`, `side="bottom" align="start" sideOffset={4}`, with `onPointerDownOutside` prevented. Contents, top to bottom: a **16px favicon `Avatar`** from `https://www.google.com/s2/favicons?domain=…` with a letter `AvatarFallback` if it fails, the hostname at `text-xs text-muted-foreground truncate`, the title at `text-sm font-medium line-clamp-1`, and **the retrieved chunk text at `text-xs line-clamp-2 leading-relaxed`**. The whole card is a link with `hover:bg-accent/50`.
- **Source pile.** `SourceFavicons` renders up to `maxDisplay = 3` **unique domains** as overlapping 16px favicons: `marginLeft: '-6px'` for every item after the first, descending `zIndex`, each `rounded-full border border-background overflow-hidden` so they read as a stack of coins. Used on tool/search summary rows.
- **No confidence or relevance score anywhere** in the citation UI.

**4. Density.** Section bottom padding `pb-4 md:pb-14` (16 → 56px); within a section `flex flex-col gap-2 md:gap-4` (8 → 16px) and `mb-2 md:mb-4` under the user message. Prose class is **`prose-sm prose-neutral prose-a:text-accent-foreground/50`** — i.e. Tailwind Typography's *small* scale (14px / 1.7143 line-height by default) rather than base. Scroll container `pt-14`. No user-facing compact mode, but the mobile/desktop split effectively is one.

**5. Streaming.**
- **Height *is* reserved, and it's the most concrete example in this slice.** The **last** section carries an inline `minHeight`: on desktop `calc(100dvh - 196px)` (`DESKTOP_LATEST_SECTION_OFFSET = 196`), on mobile `calc(100dvh - 180px)` or, when the viewport height is measurable, `scrollViewportHeight - mobileFollowUpTopClearance` px (fallback clearance `56`). Result: as soon as you send, the new section is already a full screen tall, so the question scrolls to the top and *stays* there while the answer fills in — no jitter, no chasing scroll.
- **Streamdown in streaming mode.** `mode: 'streaming'` (`components/message.tsx`) — the renderer is built to tolerate half-finished markdown tokens mid-stream rather than flashing broken syntax.
- The `AnimatedLogo` at the foot of the latest section animates while `isLoading`, alongside a rotating `ChatFooterMessage`.
- Tool calls stream into `CollapsibleMessage` blocks whose open/closed state auto-manages but records `userModifiedStates` so an explicit user toggle is never overridden.

**6. Rich content.** KaTeX via `@streamdown/math` (`import 'katex/dist/katex.min.css'`). Code blocks come from Streamdown's defaults plus a `mergeStreamdownSpecRenderer` plugin. User attachments render as `PastedContentCard` / `UrlChip`; legacy pasted material wrapped in `<user-content>` tags is regex-split out of the prompt text and shown as a **collapsed card** so the instruction stays prominent — a nice detail for prompts with a big paste in them.

**7. n/a.**

**8. Distinctive.** (a) **Selection-driven actions**: `onMouseUp` / `onKeyUp` on the answer body compute a selection rect and render a `fixed z-40` floating toolbar at it (`rounded-md border bg-popover p-1 shadow-md`) offering **"Save"** (bookmark the excerpt) and **"Deep dive"** (quote the selection into a follow-up). Highlighting a sentence to branch from it is a transcript interaction almost nobody else has. (b) **`line-clamp-3` on the user's own message** — treating the prompt as collapsible content. (c) The `100dvh` min-height on the newest section as a scroll-stability mechanism.

---
## 5. Elia — **TUI** (Textual)

*"A snappy, keyboard-centric terminal user interface for interacting with large language models" (README). Python + Textual + Rich, SQLite-backed.*

Source read (all `main`):
- `elia_chat/elia.scss` — https://github.com/darrenburns/elia/blob/main/elia_chat/elia.scss
- `elia_chat/widgets/chatbox.py` — https://github.com/darrenburns/elia/blob/main/elia_chat/widgets/chatbox.py
- `elia_chat/widgets/chat.py`, `widgets/agent_is_typing.py`, `widgets/chat_header.py`

**1. Container shape.** **Every message is a rounded-border box** — Textual `border: round`. The base `Chatbox` rule:
```
Chatbox { height: auto; width: auto; min-width: 12; max-width: 1fr; margin: 0 1; padding: 0 2; }
```
Role differentiation is **width + border colour**, not fill:
- `.human-message` inherits `width: auto` → **the user's box shrink-wraps its text** (floor of 12 cells), with `border: round $main-border-color`.
- `.assistant-message` sets `width: 1fr` → **the agent's box spans the full column**, with `border: round $accent 60%` (the accent at 60% opacity, so it's present but quiet).
This is exactly the "user bubble / assistant full-bleed" split every web client uses, achieved with zero background fills.
- On focus, both grow a **thick left rail**: `&:focus-within { border: round $accent; border-left: thick $accent 50%; }` (assistant) / `border-left: thick $main-border-color-focus` (human). Focus is a structural change to the border, not a glow.

**2. Attribution — the standout TUI idea.** Elia puts the role in the **border title**. `Chatbox.on_mount()`:
```python
if role == "assistant":
    self.add_class("assistant-message"); self.border_title = "Agent"
else:
    self.add_class("human-message");     self.border_title = "You"
```
Textual draws `border_title` *inline in the top border rule* — so the label costs **zero extra rows**. There is no avatar, no timestamp, no per-message model badge. The model name lives once in the `ChatHeader` (`#model-static`, `color: $text-muted`, `padding: 1 2`) next to a click-to-rename chat title. Consecutive same-role messages are not collapsed — every message keeps its own frame, which is what makes the border-title labelling affordable.
- The **border *sub*title is repurposed as a mode indicator**: entering selection mode sets `border_subtitle = "SELECT"`; entering vim visual mode sets `"[reverse] VISUAL SELECT [/]"` (reverse-video Rich markup). Modal state is displayed on the frame of the thing being operated on.

**3. Citations.** None — Elia is a plain LLM client with no retrieval. Not applicable.

**4. Density.** `margin: 0 1` and `padding: 0 2` on every Chatbox — **zero vertical margin and zero vertical padding**; the rounded border rows *are* the separation. So consecutive messages are separated by exactly two border rows and nothing else. Horizontal: 1 cell of margin, 2 cells of padding inside. `ChatHeader` is `padding: 1 2`, dropping to `padding: 0 2 1 2` in `&:inline` (Elia can run inline under your shell prompt via `-i`). Prompt input `max-height: 50%` of the screen; selection-mode text area `max-height: 75vh`. In a TUI these are the true density knobs — there is no font-size or line-height to set.

**5. Streaming.**
- **Reserved width, not height.** `&.assistant-message.response-in-progress { background: $accent 3%; min-width: 30%; }` — while generating, the agent box takes a **3%-opacity accent wash** and a **30% minimum width**, so a one-token response doesn't render as a 12-cell sliver that then snaps wide. The class is removed on completion (`chat.py:269`). A 3% tint is about as light as a "this is live" signal can be.
- **An overlay status pill, docked top-right.** `ResponseStatus` is `dock: top; align-horizontal: right; layer: overlay; height: 2; margin-top: 1; margin-right: 2` — it floats *over* the transcript rather than occupying a row in it. It contains a `Label` plus a Textual `LoadingIndicator`, and it is **two-state colour-coded**: `set_awaiting_response()` → label "Awaiting response", `LoadingIndicator { color: $primary }`; `set_agent_responding()` → "Agent is responding", `color: $secondary`. Waiting-for-first-token and receiving-tokens are visually distinct.
- Token application is `append_chunk(chunk)` → mutate the string → `self.refresh(layout=True)`, with `chat_container.scroll_end(animate=False)` after each chunk. The whole Rich `Markdown` is re-rendered per chunk — simple, and it means markdown never appears half-parsed.

**6. Rich content.** **The two roles use two different renderers, and that is the role cue:**
```python
if message["role"] == "user":
    return Syntax(content, lexer="markdown", word_wrap=True, background_color=background_color)
return Markdown(content, code_theme=self.app.launch_config.message_code_theme)
```
The **user's message is shown as syntax-highlighted markdown *source*** (what you typed, verbatim, wrapped); the **agent's is rendered `rich.markdown.Markdown`**. Raw-vs-rendered is a completely colour-free, completely unambiguous role signal, and it's honest — you can see exactly what you sent. Code theme inside agent messages is user-configurable (`message_code_theme` in the launch config).

**7. TUI craft — attribution, wrapping, code blocks, streaming without colour chrome.**
- **Attribution**: border title (costs no rows). **Mode**: border subtitle. **Focus**: thicker left border segment. All three ride on the frame that already exists.
- **Wrapping**: `word_wrap=True` on the user's `Syntax`; Rich's Markdown handles the agent's. `max-width: 1fr` caps the box at the column.
- **Code blocks — the best idea here.** Press `enter` on a message and the rendered widget is *replaced* by a read-only `SelectionTextArea` (`language="markdown"`, `classes="selection-mode"`, `border: none; max-height: 75vh`) carrying a full vim keymap: `hjkl` / arrows, `v` toggle visual, `y`/`c` copy, `g`/`G` top/bottom, `ctrl+d`/`ctrl+u` half-page, `b`/`w` word-wise, `0`/`^`/`$` line ends, `f6`/`V` select line, `esc` to leave. And `u` = **"Next code block"**, implemented with a **tree-sitter query** — `self.document.prepare_query("(fenced_code_block (code_fence_content) @code_block)")`, then `bisect.bisect_left` over the block end-points to find the next one after the cursor, wrapping modulo the list, and setting `self.selection = Selection(start, end)`. So `u` `u` `u` cycles the selection through the code blocks in the answer and `y` yanks one. Copy without a selection falls back to copying the whole message, and both paths `notify()` with the character count.
- **Streaming without colour**: a 3% wash + a width floor + a docked overlay label. No spinner *inside* the transcript.
- Navigation between messages is `up/k` / `down/j` moving Textual focus between Chatboxes, with a `CursorEscapingBottom` message posted when you go past the last one (so focus falls into the prompt) and `esc` jumping straight back to the prompt.

**8. Distinctive.** (a) **Border title as the role label** — free attribution. (b) **Raw source for you, rendered markdown for the agent.** (c) **`u` to jump the selection to the next code block via tree-sitter.** (d) **`min-width: 30%` during streaming** as a layout-stability trick. (e) Runs *inline* under the shell prompt (`elia -i`) with a stylesheet variant (`&:inline`) that trims the header's padding — the transcript adapting to being a few lines in a scrollback rather than a full screen.

---
## 6. oterm — **TUI** (Textual)

*Terminal client for Ollama, with MCP tool support. Python + Textual, SQLite-backed.*

Source read (all `main`):
- `src/oterm/app/oterm.tcss` — https://github.com/ggozad/oterm/blob/main/src/oterm/app/oterm.tcss
- `src/oterm/app/widgets/chat.py` — https://github.com/ggozad/oterm/blob/main/src/oterm/app/widgets/chat.py
- `src/oterm/app/widgets/prompt.py`

**1. Container shape.** **No boxes at all — a shell transcript.** Where Elia frames every message, oterm strips the frame entirely. Each `ChatItem` is a `Horizontal` of `[2-cell marker][1fr content]`:
```
ChatItem .chatItem { height: auto; padding: 0 1; }
ChatItem .user      { layout: horizontal; margin-top: 1; }
ChatItem .assistant { layout: horizontal; margin-top: 1; }
ChatItem .user .prompt-marker      { width: 2; color: $primary; }
ChatItem .assistant .prompt-marker { width: 2; color: $secondary; }
ChatItem .user .text          { width: 1fr; height: auto; background: transparent; }
ChatItem .assistant .response-column { width: 1fr; height: auto; padding: 0; margin: 0; }
```
Everything is `background: transparent`. Both roles are full-bleed and identically indented. Message container: `#messageContainer { overflow-y: auto; padding-bottom: 1; padding-right: 2; height: 1fr; }`.

**2. Attribution — one glyph, two colours.** Both roles yield **the same character**:
```python
if self.author == "user":
    with Horizontal(classes="user chatItem"):
        yield Static("❯", classes="prompt-marker")
        yield Static(self.text, markup=False, classes="text")
else:
    with Horizontal(classes="assistant chatItem"):
        yield Static("❯", classes="prompt-marker")
        with Vertical(classes="response-column"): ...
```
`❯` for the user in `$primary`, `❯` for the assistant in `$secondary` — **the only difference between roles is the marker's colour**. And the composer at the bottom uses the *same* glyph (`Static("❯", id="promptMarker")`, `width: 2; color: $primary`), so the live prompt and the transcript's past prompts line up in one continuous column. The whole thing reads as a shell session with two speakers. No names, no timestamps, no avatars, no per-message model badge — the model is a single muted right-aligned `#info` line (`Static(f"model: {self.model}")`, `color: $text-muted; text-align: right; padding: 0 2`). No consecutive-role collapsing (there is nothing to collapse).
- User text is `Static(..., markup=False)` — **rendered as literal text with Rich markup disabled**, so square brackets in your prompt can't be interpreted as markup. Assistant text is a Textual `Markdown` widget. Same raw-vs-rendered split as Elia, achieved differently.

**3. Citations.** None — oterm is a plain Ollama client. Not applicable. (Tool calls are the nearest analogue; see 6.)

**4. Density.** **`margin-top: 1`** — exactly one blank row between messages, and nothing else. `padding: 0 1` on the item, `padding: 0; margin: 0` on the response column *and* on `.response > MarkdownBlock` (the default Textual Markdown block margins are explicitly zeroed out, which is what makes the transcript this tight). Marker gutter is 2 cells. `MarkdownFence { max-height: 50 }` caps a code block at 50 rows so a huge listing can't swallow the screen. Assistant images render at `height: 30` with `margin: 1 0`.

**5. Streaming — three separate refinements.**
- **`Markdown.get_stream()` instead of re-parsing.** `append_text(delta)` writes into a Textual `MarkdownStream` which "batches and appends incrementally… instead of re-parsing the whole document each token", and keeps `self.text` in sync with `set_reactive` so it does *not* fire the watcher's full re-render. (Contrast Elia, which re-renders the whole `Markdown` per chunk.)
- **A repair pass at end-of-stream.** `finish_stream()` carries a long comment worth quoting, because it's a real bug most streaming markdown renderers have: *"Per-delta `Markdown.append` advances the widget's internal `_last_parsed_line` to the start of the trailing top-level token, so an unclosed-then-closed code fence (or any partial block) can leave block state that drops content on the next refresh. Force a full `Markdown.update` with the accumulated text after stopping each stream to reset the widget to a clean re-parsed state."* Stream incrementally for speed, then re-parse once at the end for correctness.
- **`UsageStatus`: a live meter that becomes a permanent footer.** `height: 1; width: 100%; text-align: right; color: $text-disabled; background: transparent`. While streaming it ticks every `0.1s` cycling a **braille spinner** (`SPINNER_FRAMES = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"`) and renders `"  ".join([frame, f"↑ {input_tokens}", f"↓ {output_tokens}", f"{elapsed:.1f}s"])`. On `finish()` the timer stops and the spinner glyph is dropped — **the same line stays in place as a dimmed footer showing final token counts and elapsed seconds**. One widget serving as both progress indicator and permanent per-turn metadata.
- Thinking: a `.thinking-label` reading `thinking…` while there's no answer text yet, which becomes a clickable `▸ thoughts` / `▾ thoughts` toggle once text arrives, and **auto-collapses the moment the first answer token lands** (`if text and not self.thoughts_collapsed: self.thoughts_collapsed = True`). Body is `color: $text-muted; text-style: italic`.

**6. Rich content.** Textual `Markdown` for the answer. **Tool calls appear inline in the transcript** as a `ToolCallItem` mounted *before* the response widget: a 1-row header `▸ tool call: <tool_name>` (`▾` when expanded), styled `color: $text-muted; text-style: italic`, click to expand a `padding-left: 2` body showing args and, once it arrives, the result — rendered as type-aware Rich content via `_format_field`. Images from the model are decoded with PIL and mounted as an `AssistantImage` above the response; **clicking one saves it** to `OTERM_DATA_DIR/downloads/oterm-image-<ms>.<fmt>` and notifies the path.

**7. TUI craft.**
- **Attribution with one glyph and two theme colours** is the cheapest attribution scheme I found anywhere in this research — 2 cells, no rows, no names. It degrades gracefully: in a monochrome terminal you lose the role distinction but keep the structure, which is the right failure mode for a shell-shaped transcript.
- **Wrapping**: content column is `width: 1fr`; Textual's Markdown handles reflow; the 2-cell gutter means wrapped lines hang under the text, not under the marker, so the marker column stays a clean vertical rule of `❯`s.
- **Code blocks**: `MarkdownFence { max-height: 50 }` — a fence taller than 50 rows scrolls inside itself instead of pushing the conversation off-screen. A simple, very transferable rule.
- **Click-to-copy the whole message**, with a **flash confirmation done in opacity**: `widget.styles.animate("opacity", 0.5, duration=0.1)` then `animate("opacity", 1.0, duration=0.1, delay=0.1)` — a 200ms dip-and-restore, plus a toast. A colour-free "something happened" acknowledgement.
- **Collapsing is a text glyph** (`▸`/`▾`), used identically for tool calls and thoughts.

**8. Distinctive.** (a) **The same `❯` for user, assistant and the live composer**, colour-coded — the transcript is literally shaped like a shell. (b) **`UsageStatus` morphing from spinner into a permanent per-turn footer** with `↑ in ↓ out 12.4s`. (c) The **end-of-stream full re-parse** to repair incremental-markdown block state. (d) `MarkdownFence { max-height: 50 }`.

---
## 7. RAGFlow

*Deep-document-understanding RAG engine (InfiniFlow). React + UmiJS + Tailwind + shadcn/ui + LESS modules.*

Source read (all `main`, the newer `next-*` components, which are the ones in current use):
- `web/src/components/next-message-item/index.tsx` + `index.module.less` — https://github.com/infiniflow/ragflow/blob/main/web/src/components/next-message-item/index.module.less
- `web/src/components/next-markdown-content/index.tsx` + `index.module.less` — https://github.com/infiniflow/ragflow/blob/main/web/src/components/next-markdown-content/index.tsx
- `web/src/components/next-message-item/reference-document-list.tsx`, `web/src/utils/citation-utils.ts`, `web/src/hooks/use-loading-pause.ts`

**1. Container shape.** *Bubble for user, tinted-or-plain block for assistant, with avatars on both* — the older-school layout, mirrored via flex direction.
```less
.messageItem { padding: 24px 0; }
.messageItemContent { display: inline-flex; gap: 20px; width: 100%; min-width: 0; }
.messageItemContentReverse { flex-direction: row-reverse; }   /* user */
.messageTextBase() { padding: 6px 10px; border-radius: 8px; & > p { margin: 0; } }
```
So both roles share **6px/10px padding and an 8px radius**, and the *user* is flipped by `row-reverse` and given `bg-bg-card` (the assistant gets no fill in light theme). `.messageItemLeft { text-align: start }` / `.messageItemRight { text-align: end }`. Avatar-to-content gap is **20px**; vertical padding **24px top and bottom** per message. `.messageEmpty { width: 300px }` gives a not-yet-populated message a fixed 300px width. There is **no max-width in the message CSS** — width comes from the page shell, which I did not resolve; treat message max-width as **unverified**.
- `.messageUserText` uses `text-align: justify` — the only justified chat text I saw anywhere.

**2. Attribution.** **Avatars on both sides, no names, no timestamps.** `RAGFlowAvatar` with `isPerson` for the user (falling back to `/logo.svg`), and for the assistant either the dialog/agent's configured avatar + `agentName`, or a generic `SvgIcon name="assistant"` at `size-10` (40px). Because the assistant's avatar and name are per-*agent*, the avatar is the agent identity badge. No model badge on the message. No consecutive-message collapsing.

**3. Citations — inline hover cards that preview the actual chunk, including chunk images. The richest chunk preview in this slice.**
- **Marker format.** The model emits `[ID:3]` or plain `[3]`. `citationMarkerReg = /\[(?:ID:)?([0-9٠-٩۰-۹]+)\]/g` — note it accepts **Arabic-Indic and Extended Arabic-Indic digits**, and `normalizeCitationDigits` maps `٠-٩` / `۰-۹` back to ASCII before parsing. Genuine i18n in the citation parser.
- **A rehype plugin wraps citation-bearing text.** `rehypeWrapReference` retags matching nodes to a custom element `custom-typography`, which is then mapped in `components` to `renderReference`, which uses `react-string-replace` to swap each marker for a `HoverCard`.
- **The chip.** `<bdi className="text-text-secondary bg-bg-card rounded-2xl px-1 mx-1 text-nowrap inline-block">Fig. {chunkIndex + 1}</bdi>` — a pill reading **"Fig. 1"**, not "[1]". Using `<bdi>` (bidirectional isolate) so the marker doesn't scramble surrounding RTL text is a detail almost nobody gets right.
- **The hover card** is `max-w-3xl` and shows, side by side: **the chunk's own image** (`.referenceChunkImage { width: 10vw; object-fit: contain }`) which is itself a nested `HoverCard` expanding to `.referenceImagePreview { max-width: 45vw; max-height: 45vh }`; and a `space-y-2 max-w-[40vw]` column containing **the full chunk text**, `DOMPurify.sanitize`d and injected as HTML into `.chunkContentText { max-height: 45vh; overflow-y: auto }` — i.e. **a scrollable full-chunk preview inline, up to 45% of the viewport height**. Below it, a file-type thumbnail or `file-icon/{ext}` SVG at 24px plus a link button with the document name that opens a **`PdfDrawer`** — a PDF viewer drawer that jumps to the cited chunk's position in the source document.
- **Highlight carry-over.** The `.chunkText()` LESS mixin styles `em { color: var(--accent-primary); font-style: normal }` — the retriever's `<em>` keyword highlights inside the chunk render as accent-coloured *upright* text, not italics. The search engine's term highlighting survives into the transcript.
- **Message-level source strip.** `ReferenceDocumentList` is a `flex gap-3 flex-wrap` of shadcn `Card`s, each `p-2 space-x-2` with a `FileIcon` and a **middle-ellipsised** document name (`middleEllipsis`, which preserves the file extension), clicking opens the same `PdfDrawer`. Plus a separate `ReferenceImageList` of images pulled from the cited chunks.
- **No relevance/confidence score is rendered.** RAGFlow computes similarity scores server-side but the transcript UI does not display them.

**4. Density.** `padding: 24px 0` per message (48px effective between messages), 20px avatar gap, 6px/10px bubble padding, 8px radius. Prose `line-height: 1.8` on `.markdownContentWrapper` — noticeably airier than the ~1.6 most of the web clients use. `<think>` blocks: `font-size: 12px; color: #8b8b8b; border-inline-start: 2px solid #d5d3d3; padding-inline-start: 10px; margin-bottom: 10px` — a small grey left-ruled quote, with a dark-theme variant and a distinct **`details.retrieving`** variant in teal (`border-inline-start-color: rgb(60,100,90)`, summary `rgb(120,170,155)`) so "thinking" and "retrieving" are different colours. No compact mode.

**5. Streaming.**
- **`useLoadingPause` — dots that only appear when the stream *stalls*.** `useLoadingPause(loading, content, delay = 600)` restarts a 600ms timer every time `content` changes and only sets `show = true` when it fires. So while tokens are flowing faster than one per 600ms you see **no indicator at all**; the `LoadingDots` appear only when generation genuinely pauses. This is the most thoughtful streaming-indicator logic I found — it treats the indicator as a *stall* signal rather than a *busy* signal.
- Before any content exists, `sendLoading && isEmpty(messageContent)` renders `<LoadingDots className="text-text-secondary" />` inside the empty `.messageEmpty` 300px-wide box.
- Agent/workflow progress uses an `Atom` icon with `animate-spin` gated on `startedNodeList(item)`, next to a "Thinking" toggle.
- Container grows; no height reservation beyond the 300px empty-message width.

**6. Rich content.** `react-markdown` with `rehypeRaw` → a custom `RehypeSanitizeAssistantMarkdown` → `rehypeWrapReference` → `rehypeKatex` (with `import 'katex/dist/katex.min.css'` and the comment "`rehype-katex` does not import the CSS for you"). A custom `urlTransform` **whitelists `data:image/(png|jpeg|gif|webp|svg+xml);base64,` URLs** through the default sanitiser so inline base64 images render. Artifacts get their own `ArtifactLink` / artifact image path (`.artifactImage { max-width: 100%; max-height: 60vh }`), an `image-carousel.tsx`, and uploaded-file chips (`uploaded-message-files.tsx`). Tables are normalised in the `.chunkText()` mixin (`width: 100%; border-collapse: collapse; box-sizing: border-box`).

**7. n/a.**

**8. Distinctive.** (a) **Full RTL support inside the transcript** — `dir` computed per message from the content with citation markers stripped first (`getDirAttribute(content.replace(citationMarkerReg, ''))` — so a numeric citation can't make an Arabic answer be detected as LTR), `<bdi>` around citation chips, and mirrored `border-inline-start` → `border-inline-end` rules for `details.think` under `[dir='rtl']`. (b) **Arabic-Indic digits accepted in citation markers.** (c) **The hover card previews the chunk's *image* as well as its text**, with a nested hover card to blow the image up to 45vw. (d) **The 600ms stall-gated loading indicator.** (e) Retriever `<em>` highlights carried into the preview as accent colour.

---
## 8. Dify

*LLM app development platform; the chat transcript is a shared `base/chat` component reused by the debug preview, the web app and the embedded widget. Next.js + Tailwind + a token-named design system (`dify-ui`).*

Source read (all `main`):
- `web/app/components/base/chat/chat/answer/index.tsx` — https://github.com/langgenius/dify/blob/main/web/app/components/base/chat/chat/answer/index.tsx
- `web/app/components/base/chat/chat/question.tsx`
- `web/app/components/base/chat/chat/citation/index.tsx`, `citation/popup.tsx`, `citation/progress-tooltip.tsx`
- `web/app/components/base/chat/chat/loading-anim/index.tsx` + `style.module.css`, `answer/suggested-questions.tsx`

**1. Container shape.** **Bubbles on both sides, with avatars, mirrored.** Both roles use `rounded-2xl … px-4 py-3` (16px / 12px padding, 16px radius) on `bg-chat-bubble-bg`, `body-lg-regular text-text-primary`.
- Answer row: `<div className="mb-2 flex last:mb-0">` → `size-10` avatar (40px) → `<div className="chat-answer-container group ml-4 w-0 grow pb-4">`. The `w-0 grow` is the trick that lets the bubble be `inline-block max-w-full` and shrink-wrap to content while still being bounded by the row.
- Question row: `<div className="mb-2 flex justify-end last:mb-0">` → content wrapper `mr-4 flex max-w-full items-start overflow-x-hidden pl-14` → bubble → `size-10` avatar. **`pl-14` (56px) is the hard left indent on user messages** — the user's bubble can never span the full width, mirroring the 40px avatar + 16px gap on the other side.
- The user bubble uses a *gradient* fill token (`bg-background-gradient-bg-fill-chat-bubble-bg-3`); while editing it switches to `rounded-3xl border-[3px] border-components-option-card-option-selected-border bg-components-panel-bg-blur shadow-lg` — a bigger radius and a 3px selection ring, so "I am editing this" is unmistakable.
- When a workflow process is attached, the answer bubble is forced `w-full` instead of shrink-wrapping.

**2. Attribution.** **Avatar only — no name, no timestamp, no model badge in the transcript.** The assistant avatar is configurable per app (`answerIcon || <AnswerIcon />`); the user is a default `<User>` glyph in a `rounded-full border-[0.5px] border-black/5`. Actions are hover-revealed in a floating action bar: `absolute hidden gap-0.5 rounded-[10px] border-[0.5px] border-components-actionbar-border bg-components-actionbar-bg p-0.5 shadow-md backdrop-blur-xs group-hover:flex`. The answer's `Operation` bar is passed a computed `maxSize={containerWidth - contentWidth - 4}` so it can decide whether to sit beside the bubble or below it — the toolbar's placement is measured, not guessed. Sibling regenerations get a `ContentSwitch` pager when `siblingCount > 1`. No consecutive-role collapsing.

**3. Citations — the most *forensic* display in this slice, and the only one that shows a relevance score.**
- **Grouped by document.** `citation/index.tsx` reduces the flat `CitationItem[]` into `Resources[]` keyed by `document_id`, so N chunks from one file collapse into **one chip**.
- **A measured single-line strip with `+N` overflow.** Under a `system-xs-medium text-text-tertiary` label ("Citations") followed by a `h-px grow bg-divider-regular` rule that fills the remaining width, Dify renders a **hidden measurement pass**: every chip is first drawn `absolute top-0 left-0 -z-10 opacity-0 h-7 max-w-60 pr-2 pl-7 text-xs whitespace-nowrap` purely to read `clientWidth`. It then walks the list accumulating widths (plus `i * 4` for gaps) against `container.clientWidth - 40`, reserving `34` px for the toggle, and sets `limitNumberInOneLine`. Only that many chips render; the rest hide behind a `+ {remaining}` button that expands to a wrapped grid. **The strip is guaranteed to be exactly one line**, computed from real text metrics.
- **The chip**: `flex h-7 max-w-60 items-center rounded-lg bg-components-button-secondary-bg px-2` with a 16px `FileIcon` typed from the filename extension (or `notion` for Notion sources) and a truncated `text-xs text-text-tertiary` document name. **28px tall, 240px max.**
- **The popover** (`placement="top-start" sideOffset={8} alignOffset={-2}`, transparent shell) is `max-w-90 rounded-xl bg-background-section-burn shadow-lg backdrop-blur-[5px]`, with a header carrying the file icon and name (clickable to **download the original upload**), and a scrollable body `max-h-112.5 overflow-y-auto rounded-lg bg-components-panel-bg px-4 py-0.5` listing **every cited chunk from that document**, `py-3` each, separated by `h-px bg-divider-regular` rules.
- **Per chunk it shows**: a segment-position badge (`h-5 rounded-md border border-divider-subtle px-1.5`, a `hash-02` icon at 12px, then `text-[11px] font-medium` with `segment_position`); the **full chunk text at `text-[13px] wrap-break-word`**; and — when the app enables `supportCitationHitInfo` — a **hit-info metadata row** of icon+value tooltips: **word count** ("characters"), **hit count**, **vector hash** (`index_node_hash.substring(0, 7)` — a 7-char short hash, like git), and the **relevance score**.
- **The score is a progress bar.** `ProgressTooltip` renders `<div className="mr-1 h-1.5 w-16 overflow-hidden rounded-[3px] border border-components-progress-gray-border">` with an inner fill `style={{ width: \`${data * 100}%\` }}`, followed by the numeric value (`Number(source.score.toFixed(2))`), and a tooltip labelled **"Hit Score"**. So: a **64px × 6px bar plus a 2-decimal number**, in a neutral grey rather than a red/green scale. This is the only relevance-score visualisation I found in the entire slice.
- Also a "Link to dataset" affordance that appears on `group-hover` (`hidden … group-hover:flex`) taking you to `/datasets/{id}/documents/{id}`.

**4. Density.** `mb-2 last:mb-0` between messages (**8px** — very tight compared with Onyx's 48px), `pb-4` under the answer container, `ml-4`/`mr-4` avatar gaps (16px), bubble `px-4 py-3`, `pr-10` reserved on the answer's inner wrapper for the hover action bar. Citation strip `mt-3 -mb-1`, chip gaps `mr-1 mb-1` (4px). Typography is design-token classes (`body-lg-regular`, `system-xs-medium`, `system-sm-medium`) which I did not resolve to px — **font-size/line-height unverified** except where written literally (`text-[13px]` chunk body, `text-[11px]` segment badge, `text-xs` chip). Edit textarea is `body-lg-regular leading-7`, capped `max-h-39.5`.

**5. Streaming.**
- **A three-dot flasher, in two sizes, in two places.** `LoadingAnim` is a pure-CSS `dot-flashing`: a 4px dot with `::before` at `left: -7px` and `::after` at `left: 7px`, each running `dot-flashing 1s infinite linear alternate` with delays `0s / 0.5s / 1s`, animating `background-color` from `#667085` to `rgba(102,112,133,0.3)`. The `avatar` variant is **2px dots at `left: ±5px`** in blue (`#155eef` → `rgba(21,94,239,0.3)`).
- **The avatar itself carries a streaming badge.** While `responding`, a `h-4 w-4` pill is pinned `absolute -top-0.75 -left-0.75` on the 40px avatar (`rounded-full border-[0.5px] border-divider-subtle bg-background-section-burn shadow-xs pl-1.5`) containing the 2px-dot variant. A tiny live indicator clipped to the avatar's corner — the transcript body stays still.
- The text-variant dots render inside the bubble in a fixed `h-5 w-6` box only when `responding && contentIsEmpty && !hasAgentContent && !hasReasoning`.
- **Citations are withheld until done**: `{!!citation?.length && !responding && <Citation … />}` — the strip appears only after streaming completes (necessarily, since its layout depends on measuring chip widths).
- Container grows; no height reservation.

**6. Rich content.** `FileList` for attachments with `showDownloadAction` and `canPreview`; a `WorkflowProcessItem` that renders the workflow's node graph *inside* the answer bubble; a `ReasoningPanel` with an explicit `done` flag whose derivation carries a long comment about `is_final` being a node-terminal marker that trails the answer; `agent-content.tsx` / `tool-detail.tsx` for agent traces; `human-input-form-list.tsx` — **forms rendered inside the transcript** that the user fills in to continue a workflow, connected to the following bubble by a drawn `absolute -top-2 left-6 h-3 w-0.5` connector line. **Follow-up chips** (`SuggestedQuestions`) render only on the opening statement: `rounded-lg border-[0.5px] px-3.5 py-2 system-sm-medium shadow-xs`, wrapping, `mt-1 mr-1`.

**7. n/a.**

**8. Distinctive.** (a) **The hit-info row** — word count, hit count, 7-char vector hash and a score bar attached to each chunk. Nobody else exposes retrieval internals in the transcript, and for a *debugging* surface it's exactly right. (b) **Measurement-pass citation layout** — invisible chips rendered solely to compute how many fit on one line. (c) **Streaming indicated on the avatar's corner, not in the text flow.** (d) **Human-input forms inline in the transcript** with a drawn connector to the next bubble.

---
## 9. Langflow

*Visual flow builder for agents; the transcript is the "Playground" / IO modal that runs a flow. React + Vite + Tailwind + shadcn/ui.*

Source read (all `main`):
- `src/frontend/src/modals/IOModal/components/chatView/chatMessage/chat-message.tsx` — https://github.com/langflow-ai/langflow/blob/main/src/frontend/src/modals/IOModal/components/chatView/chatMessage/chat-message.tsx
- `src/frontend/src/modals/IOModal/components/chatView/components/chat-view.tsx`
- `src/frontend/src/components/common/messageMetadataComponent/index.tsx`

**1. Container shape.** **Full-bleed rows with a left avatar gutter — no bubbles for either role.** Both roles render identically:
```jsx
<div className="w-full py-4 word-break-break-word">
  <div className="group relative flex w-full gap-4 rounded-md p-2 hover:bg-muted">
    <div className="relative flex h-[32px] w-[32px] items-center justify-center overflow-hidden rounded-md text-2xl …">
    <div className="flex w-[94%] flex-col"> …
```
- **32px avatar, 16px gap, content column at `w-[94%]`.** The only visual difference between roles is the avatar tile's own styling: assistant gets `bg-muted`, user gets `border border-border hover:border-input` (outlined rather than filled).
- **The whole row highlights on hover** (`hover:bg-muted` on the row, suppressed while editing) — the message is a *list row*, not a card.
- Column width: `flex flex-col flex-grow place-self-center w-5/6 max-w-[768px]` — **768px cap at 5/6 of the container**, identical for both roles. The composer below matches (`w-full max-w-[768px] md:w-5/6`).
- Uses `StickToBottom` (`<StickToBottom.Content className="flex flex-col min-h-full">`) for scroll anchoring.

**2. Attribution — the most explicit in this slice, and the only one with real names.** A dedicated header row above every message: `flex w-full items-baseline gap-3 pb-2 text-sm font-semibold` containing, left to right:
- **`chat.sender_name`** (defaults to `"AI"`, falls back to `"User"` for sends) in `text-sm font-semibold`. In a multi-agent flow each component supplies its own name, so the transcript reads as a cast of named speakers.
- an optional **mic badge** for voice messages (`h-5 w-5 rounded-sm bg-muted` with a 12px `mic` icon);
- **`chat.properties.source.source`** — the model/component that produced the message — as a secondary `text-mmd font-normal text-muted-foreground` label (hidden on the public playground page);
- **`MessageMetadata`** on assistant messages only.
- **Per-message theming from flow properties.** `chat.properties.background_color` is applied inline to the avatar tile, `chat.properties.text_color` to the header row, and `chat.properties.icon` supplies the avatar glyph — with a **regex that detects whether the icon string is an emoji** (`/[☀-➿\uD83C-􏰀-\uDFFF]/`) and renders it as text, otherwise resolving it as a named icon component. Each node in the flow can brand its own messages.
- No consecutive-message collapsing — every message repeats its avatar and name header.

**3. Citations.** Not a retrieval product; there is **no citation system in the transcript**. The nearest analogue is the `source` label in the header and `ContentBlockDisplay`, which renders structured tool/agent "content blocks" attached to a message. Marked as not applicable rather than guessed.

**4. Density.** `py-4` (16px) around each message plus `p-2` (8px) on the hover row = a fairly generous ~40px between message bodies. `gap-4` avatar-to-content, `pb-2` under the name header, `min-h-8` reserved for the message body. Font sizes are `text-sm` for the header, with a custom `text-mmd` step for the source label and `text-xxs` inside metadata tooltips (both project-specific Tailwind extensions I did not resolve to px — **unverified**). No compact mode.

**5. Streaming.** Minimal: when `chatMessage === "" && isBuilding && lastMessage`, the body is replaced by a **pulsing ellipsis icon** — `<IconComponent name="MoreHorizontal" className="h-8 w-8 animate-pulse" />`. Once tokens arrive it swaps to the markdown field inside a `min-h-8 w-full` box, so **there is a 32px height floor** that stops the row collapsing between states. Container grows otherwise. Message options are hover-revealed via a wrapper pinned `absolute bottom-full right-0` with `pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:…` — the toolbar floats *above* the message's top edge.

**6. Rich content.** `CustomMarkdownField`; `ContentBlockDisplay` for structured agent steps; `file-card.tsx` / `file-preview.tsx` / `download-button.tsx` for attachments with a `format-file-name` helper; an `EditMessageField` for in-place editing (with an explicit XSS regression test alongside it); audio messages flagged by the mic badge. An `(Edited)` marker renders as `text-sm text-muted-foreground`.

**7. n/a.**

**8. Distinctive.** **`MessageMetadata` — a cost-and-latency badge on every assistant message.** The visible chip is `font-mono text-xs` in `text-accent-emerald-foreground` (or muted in `subtle` mode) reading `<Coins icon> {total_tokens} | {duration}s`, with `cursor-help`; hovering opens a tooltip (`border rounded-xl p-2 bg-background`, `side="bottom"`) breaking it out into **Last run (timestamp) / Duration / Input tokens / Output tokens**, each token figure in `font-mono text-xs` with its own coin icon. It renders `null` entirely when there is neither duration nor tokens. Putting **per-message token cost and build duration inline in the transcript, in emerald monospace**, is something no consumer chat client does and is obviously right for a builder tool. Combined with per-component avatar colours and names, Langflow's transcript is closer to a **log viewer with faces** than to a chat.

---
## 10. Verba (Weaviate)

*"The Golden RAGtriever" — Weaviate's open-source RAG demo app. Next.js + Tailwind + DaisyUI.*

Source read (all `main`):
- `frontend/app/components/Chat/ChatMessage.tsx` — https://github.com/weaviate/Verba/blob/main/frontend/app/components/Chat/ChatMessage.tsx
- `frontend/app/components/Chat/ChatInterface.tsx`, `Chat/StatusLabel.tsx`, `Document/VectorView.tsx`

**1. Container shape.** **Pill bubbles on both sides, aligned by role.** Every message is:
```jsx
<div className={`flex items-end gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
  <div className={`flex flex-col items-start p-5 rounded-3xl animate-press-in text-sm lg:text-base ${colorTable[message.type]}`}>
```
- **20px padding, 24px radius (`rounded-3xl`)**, and — unusually — the *type* drives the fill from a lookup table rather than a boolean: `{ user: "bg-bg-verba", system: "bg-bg-alt-verba", error: "bg-warning-verba", retrieval: "bg-bg-verba" }`. **Four message types, not two roles.** `error` is a first-class type with its own warning fill and a `BiError` icon inline with the text.
- **No max-width on the bubble** — it shrink-wraps (`items-start` in a `flex` row) and is bounded only by the panel. Type scale is responsive: `text-sm lg:text-base`.
- Bubbles are wrapped in `flex flex-col gap-3 p-4` and the user's wrapper additionally gets `text-right`.

**2. Attribution.** **None — no avatar, no name, no timestamp, no model badge.** Role is alignment + fill only. The one per-message badge is a **cache indicator**: `{message.cached && <FaDatabase size={12} />}` — a 12px database glyph marking an answer served from the semantic cache rather than freshly generated. That is a genuinely useful, rarely-seen piece of provenance. No consecutive-message collapsing.

**3. Citations — retrieval is its own message in the transcript.** This is Verba's structural idea: a `Message.content` that is an *array of documents* rather than a string renders as a **"retrieval" message** — a card grid inline in the conversation:
- `grid grid-cols-2 lg:grid-cols-3 gap-3 w-full items-center`, each document a `rounded-3xl p-3` button showing a **truncated title at `text-xs`** (full title in `title=`) and, right-aligned, an `IoNewspaper` icon at 12px plus the **number of chunks retrieved from that document** at `text-sm`. So the "score" surrogate visible in the transcript is *chunk count per document*.
- The selected card swaps `bg-button-verba` for `bg-secondary-verba` with `transition-colors duration-300`, and selection identity is a concatenated key `uuid + score + chunks.length`.
- Clicking a card calls `setSelectedDocument`, `setSelectedDocumentScore` and `setSelectedChunkScore(document.chunks)` — driving a **document explorer panel** beside the chat.
- A trailing `IoDocumentAttach` square button opens a native `<dialog className="modal">` titled **"Context"** showing the **raw context string that was actually sent to the LLM**. Exposing the assembled prompt context as a one-click modal from the transcript is an unusually honest debugging affordance.
- **Scores exist but are never printed as numbers.** `ChunkScore[]` flows into the document explorer, where its only *visual* expression I could find is in `VectorView.tsx` — a **3D vector-space plot** in which cited chunks are highlighted: `isHighlighted` → `THREE.Color("yellow")`, `sphereRadius` 3 (vs 1.5 selected, 1 default), `sphereOpacity` 1 (vs 0.5). So relevance is shown **spatially**, as bigger yellow spheres in the embedding cloud, rather than as a bar or a percentage. I did **not** find a numeric score rendered anywhere in the transcript.

**4. Density.** `gap-3` (12px) between messages, `p-4` on the list, `p-5` (20px) inside each bubble, `gap-3` in the retrieval grid. `prose md:prose-sm lg:prose-base` on assistant markdown (note the inversion: `prose` at base, *smaller* at `md`, back to base at `lg`), plus an inner `p-3`. No compact mode. No explicit line-height override.

**5. Streaming.**
- `previewText` renders as an extra `system` `ChatMessage` appended after the real list while tokens arrive — the in-progress answer is a **synthetic message object**, not a special state on the last real one.
- **A two-phase status line** below the transcript: a DaisyUI `loading loading-dots loading-md` next to text that reads **"Retrieving..."** when `fetchingStatus === "CHUNKS"` and **"Generating..."** when `"RESPONSE"`, followed by a `MdCancel` circular stop button. Naming the RAG phase rather than showing a generic spinner is the right call for a retrieval product.
- Messages animate in with a custom `animate-press-in` class. I could **not** locate its keyframes — `frontend/tailwind.config.ts` did not return a definition on fetch, so the exact timing/transform is **unverified**.
- Container grows; no height reservation.

**6. Rich content.** `react-markdown` with a `code` override routing fenced blocks to `react-syntax-highlighter`'s **Prism** with `oneDark` / `oneLight` chosen from `selectedTheme.theme` — theme-aware syntax colouring, and `prose-pre:bg-bg-alt-verba` so the block ground matches the app. Inline code falls through to a plain `<code>`. No LaTeX, mermaid or image handling in the message component. No follow-up suggestion chips.

**7. n/a.**

**8. Distinctive.** (a) **Retrieval as a message type** — the search step occupies a turn in the transcript as a document grid, so the conversation records *what was fetched* as an event, not as a footnote on the answer. (b) The **"Context" modal** exposing the exact assembled prompt context. (c) The **cached-answer database glyph**. (d) **Relevance visualised in a 3D embedding plot** rather than numerically. (e) A four-value `colorTable` keyed on message *type* (user / system / error / retrieval) instead of a user-vs-assistant boolean — a cleaner extension point than most.

---
## 11. Enchanted — **native macOS / iOS / visionOS** (SwiftUI)

*Native Apple-platform client for Ollama. SwiftUI + `MarkdownUI` + `Splash` (syntax highlighting) + SwiftData.*

Source read (all `main`):
- `Enchanted/UI/Shared/Chat/Components/ChatMessages/ChatMessageView.swift` — https://github.com/gluonfield/enchanted/blob/main/Enchanted/UI/Shared/Chat/Components/ChatMessages/ChatMessageView.swift
- `Enchanted/UI/Shared/Chat/Components/MessageListVIew.swift`, `Components/RunningBorder.swift`, `ChatMessages/CodeBlockView.swift`

**1. Container shape.** **User gets a material bubble; assistant is bare prose with a logo gutter.** One `HStack(alignment: .firstTextBaseline)` per message, with the `Spacer()` swapped between sides:
- user → `Spacer()` first (pushes right), and the content `VStack` is conditionally wrapped: `.padding().background(RoundedRectangle(cornerRadius: 25).fill(.regularMaterial))` — **a 25pt-radius bubble filled with `.regularMaterial`**, i.e. the system blur material rather than a flat colour, so it picks up the desktop/wallpaper behind it. Very "native Apple", and a nice alternative to a solid tint.
- assistant → a **24×24pt logo** in the leading gutter and `Spacer()` trailing, with **no background at all**.
- The gutter glyph is nudged `.offset(CGSize(width: 0, height: 6))` to sit on the first text baseline.
- No max width is set in the message view; width comes from the window/`ScrollView`.

**2. Attribution.** A `roleName` is computed — `message.role == "user" ? userInitials.uppercased() : "AI"`, defaulting to `"AM"` when initials are empty — but **it is never rendered in the body I read**; the visible identity is the assistant's logo image and the user's bubble alignment. No timestamps, no model badge per message (the model lives in a `ModelSelectorView` in the toolbar). No consecutive-message collapsing.
- **macOS-only hover toolbar**, appearing under the message: copy (`doc.on.doc`), speak (`speaker.wave.2.fill`), stop (`speaker.slash.fill`), and edit (`pencil`, user messages only), each `.padding(8)` with `RoundedRectangle(cornerRadius: 10)` clipping and a `GrowingButton` style. It is faded rather than removed: `.opacity(mouseHover ? 1 : 0.0001)` with `withAnimation(.easeInOut(duration: 0.3))` on `.onHover`. **`0.0001` rather than `0`** — keeping the view in the layout and hit-testable while visually absent.
- On iOS/visionOS the same actions live in a **`.contextMenu`** (Copy / Select Text / Read Aloud / Edit), so the affordance is platform-idiomatic rather than ported.

**3. Citations.** None — Enchanted is a plain Ollama client with no retrieval. Not applicable.

**4. Density.** `.padding(.vertical, 10)` and `.padding(.horizontal, 10)` per message row in `MessageListView` (so **20pt between message bodies**), `.listRowInsets(EdgeInsets())` and `.listRowSeparator(.hidden)` to strip the platform list chrome. The think block gets `.padding(.init(top: 0, leading: 0, bottom: 10, trailing: 0))`. Code font is fixed at **16pt** (`.init(size: 16)` passed to the Splash theme). No compact mode.

**5. Streaming.**
- **The avatar becomes the spinner.** When `showLoader` (set by the list as `conversationState == .loading && messages.last == message`), the 24×24 logo is *replaced in place* by `ActivityIndicatorView(type: .rotatingDots(count: 5)).frame(width: 24, height: 24).rotationEffect(.degrees(90))` — same frame, same position, so nothing in the layout moves. Same idea as Dify's avatar badge, executed as a straight substitution.
- **Scroll follows content, not just messages.** Three separate triggers all call `scrollViewProxy.scrollTo(messages.last, anchor: .bottom)`: `.onAppear`, `.onChange(of: messages)`, and — the important one — **`.onChange(of: messages.last?.content)`**, so the view keeps pace with tokens landing inside the last message, not only with new messages arriving.
- No skeleton, no reserved height, no inline caret.

**6. Rich content.** `MarkdownUI` with a custom `MarkdownColours.enchantedTheme` and `.markdownCodeSyntaxHighlighter(.splash(theme:))` — **the Splash theme switches with the system colour scheme**: `.wwdc17(withFont: .init(size: 16))` in dark, `.sunset(withFont: .init(size: 16))` in light. `.textSelection(.enabled)` is applied on macOS only. Images attached to a message render `.scaledToFit().frame(width: 100).clipShape(RoundedRectangle(cornerRadius: 5))` — a fixed 100pt thumbnail. A `SelectTextSheet` provides text selection on iOS/visionOS where inline selection isn't available.
- **Reasoning blocks**: when `message.hasThink`, an `HStack(spacing: 10)` leads with `Rectangle().fill(Color.black).frame(width: 10)` — a **10pt black bar as the quote rule** — followed by either the rendered think markdown or a one-line summary, tap to toggle. The collapsed label is **state-dependent**: `"Thinking..."` while `!thinkComplete`, `"Thought for a few seconds."` once done.

**7. n/a** (native GUI, not a TUI — but the material-fill and avatar-substitution ideas are the transferable ones).

**8. Distinctive.** **`RunningBorder`** — the message being edited is wrapped in an animated conic-gradient border: a `RoundedRectangle(cornerRadius: 10).strokeBorder(AngularGradient(gradient: Gradient(colors: [.indigo, .blue, .red, .orange, .indigo]), center: .center, startAngle: .degrees(rotation), endAngle: .degrees(rotation + 360)).opacity(0.5), lineWidth: 3.5)` with `rotation` animating 0 → 360 over `.linear(duration: 2).repeatForever(autoreverses: false)`. A **3.5pt rainbow border chasing around the message at 2 seconds per revolution** to mark "this is the one you're editing". Applied at the list level via a `.runningBorder(animated:)` view modifier, so any message state could reuse it. Also: `.regularMaterial` bubbles instead of a flat fill, and the `opacity(0.0001)` hover-toolbar trick.

---
## 12. Cheshire Cat

*Plugin-oriented "AI framework with memory". Admin UI is Vue 3 + Tailwind + **DaisyUI**, in a separate repo: `cheshire-cat-ai/admin-vue` (the `core` repo is the Python backend).*

Source read (all `main`):
- `src/components/MessageBox.vue` — https://github.com/cheshire-cat-ai/admin-vue/blob/main/src/components/MessageBox.vue
- `src/components/MemorySelect.vue` — https://github.com/cheshire-cat-ai/admin-vue/blob/main/src/components/MemorySelect.vue

**1. Container shape.** **Straight DaisyUI `chat` component** — the least bespoke transcript in the slice, and instructive for that reason. `<div class="chat gap-x-3" :class="[sender === 'bot' ? 'chat-start' : 'chat-end']">` with DaisyUI's four slots: `chat-image`, `chat-header`, `chat-bubble`, `chat-footer`. The bubble is overridden to `flex min-h-fit w-fit flex-col break-words rounded-lg bg-base-100 p-2 text-neutral shadow-md md:p-3` — **8px padding rising to 12px at `md`, 8px radius, a shadow, and the same fill for both roles**. Role is carried purely by `chat-start` / `chat-end` alignment (DaisyUI also flips the bubble's tail). No max-width beyond `w-fit`.

**2. Attribution — the most complete, and the most conventional.** All three of avatar, name and timestamp, above the bubble:
- `chat-image` is a **text emoji**: `😺` for the bot, `🙂` for the user, at `text-lg`. (Worth noting given this project's no-emoji rule — but it is what the source does.)
- `chat-header` carries the **name** — literally `'Cheshire Cat'` or `'You'` — followed by `<time class="text-xs opacity-50">`.
- **Timestamp is same-day-aware**: `useDateFormat(when, 'DD/MM/YYYY HH:mm')`, then if the message's Y/M/D matches today it renders only the time half (`time.split(' ')[1]`), otherwise the full date+time. Cheap and correct.
- `chat-footer` (bot only) holds three `btn-square btn-ghost btn-xs` buttons with `tooltip tooltip-bottom`: Copy, Regenerate, and **"Why this response"**. Always visible, not hover-gated. No consecutive-message collapsing.

**3. Citations — the "Why this response" panel, and the only per-source *numeric* score badge in the slice besides Dify's bar.** A `?` button opens a `SidePanel` titled "Why this response" containing two stacked sections:
- **Intermediate steps.** For each step, a `grid grid-cols-2` of **"Triggered Tool"** (`ph-nut` icon) and **"Tool Input"** (`ph-textbox`), then full-width **"Tool Output"** (`ph-chat-centered-dots`), each value in a `rounded bg-base-200` block at `text-sm`. The agent's reasoning trace is a *retrospective* panel, not an inline collapsible.
- **`MemorySelect` — retrieved memories, tabbed by memory type.** A row of toggle buttons, one per collection in the result, each with its own icon: **episodic** (`ph-chats`), **declarative** (`ph-files`), **procedural** (`ph-toolbox`) — conversation history, documents, and tools, treated as three parallel kinds of "source". The active tab is `bg-primary text-base-100`.
- Each memory renders as a `rounded bg-base-200 px-2 pb-2` card with:
  - **A score badge pinned to the card's top-centre** using DaisyUI's `indicator indicator-item indicator-center`: `<span class="badge badge-neutral">{{ Math.floor(item.score * 1000) / 1000 }}</span>` — the similarity score **truncated (not rounded) to 3 decimal places**, with the *full-precision* score in the tooltip (`:data-tip="item.score"`). A numeric relevance score, front and centre on every source.
  - The chunk text (`item.metadata.docstring || item.page_content`) at `text-sm`.
  - A footer row at `text-xs font-bold text-neutral/70`: **source** (plus `(name)` if present), truncated, left; and the memory's **ingestion date** (`new Date(item.metadata.when * 1000).toLocaleString()`) right.
  - A **"View Metadata" / "Hide Metadata"** badge toggling a full key/value dump of `item.metadata` as a `list-disc` of label-left/value-right rows.
- Empty state is per-collection and explicit: *"No **{collection}** memories were used."* — telling you a collection was consulted and returned nothing, rather than hiding the tab.
- **No inline citation markers in the prose at all.** Provenance is entirely retrospective, on demand, per message.

**4. Density.** `gap-x-3` between avatar and bubble; bubble `p-2 md:p-3`. Vertical spacing between messages comes from DaisyUI's `chat` defaults (I did not resolve those to px — **unverified**). Panel internals: `gap-6`, `p-4`, `gap-4`. Footer `mt-1 gap-1`. No compact mode.

**5. Streaming.** Minimal and text-only: when `text` is empty the bubble renders `<p class="text-ellipsis font-medium italic opacity-75">Cheshire Cat is thinking...</p>` — **an italic 75%-opacity sentence in the bubble's place**. No spinner, no cursor, no skeleton. The bubble is `min-h-fit w-fit`, so it grows from the placeholder's size.

**6. Rich content.** Markdown via a shared `@utils/markdown` renderer injected with `v-html`. **File attachments are type-dispatched by MIME prefix** into four branches: `image/` → `<img width="512" height="512" class="rounded-lg shadow-xl">`; `audio/` → `<audio controls controlslist="nodownload noplaybackrate">`; `video/` → `<video controls disablepictureinpicture controlslist="nodownload noplaybackrate">` with a text fallback link; anything else → a file card (`bg-base-200 p-2 rounded-lg shadow-xl`) with a `ph-file-fill` 24px icon, the basename in bold and a `TYPE | size` line where the size formatter steps B → KB → MB → GB at powers of 1000 with 2 decimals. All from a local `URL.createObjectURL(file)`.
- **Long-prompt truncation, user-only**: `maxLength = 3000`; `isLengthy` requires `sender === 'user'`, and the rendered markdown is sliced to 3000 chars with a **"Read more" / "Hide content"** link right-aligned in bold. The assistant is never truncated.

**7. n/a.**

**8. Distinctive.** (a) **"Why this response"** as a named, first-class per-message affordance — the framing is explanation, not citation, and it bundles *tool trace* and *retrieved memory* into one answer to one question. (b) **Memory tabs by kind** (episodic / declarative / procedural) rather than one undifferentiated source list. (c) **A truncated-to-3dp score badge on every source, with full precision in the tooltip.** (d) The **per-collection empty state** ("No procedural memories were used") — negative provenance is information. (e) `Math.floor(x * 1000) / 1000` — deliberate truncation so a score never displays as higher than it is.

---
# Synthesis

## A. The distinct approaches to source / citation display

Across the seven retrieval tools in this slice there are **six structurally different answers** to "where did this come from", and they trade off along two axes: *how much you must move to see provenance* and *how much of the chunk you get*.

### 1. Inline marker → hover card (Morphic, RAGFlow, Onyx)
A numbered or named token in the prose opens a floating card with a chunk excerpt.
- **Morphic**: 16px round pill, 10px type, `-translate-y-0.5` for superscript feel; 320px popover with favicon + hostname + title (`line-clamp-1`) + content (`line-clamp-2`).
- **RAGFlow**: reads **"Fig. 1"**, wrapped in `<bdi>`; card is `max-w-3xl` with the chunk's **image** beside a scrollable **full** chunk (`max-h-45vh, overflow-y-auto`).
- **Onyx**: renders the **source's name instead of a number**, with a 280px card that **pages** with prev/next when the chip covers several sources.

**Trade-off.** Highest precision — provenance is bound to the exact sentence. Costs: the prose gets peppered with chips (a dense answer can carry 15 of them), hover is mouse-only, and you must build a citation-map + a rewrite step. **Onyx's named variant is strictly better than numbering for readability** ("according to *Q3 Planning Doc*" beats "according to [3]") but it lengthens lines and only works when source names are short.

### 2. Source strip under (or over) the message (Khoj, Perplexica, Dify)
A row of cards or chips attached to the message, no inline markers at all.
- **Khoj**: `{n} sources` label + exactly **3 teaser cards** + arrow, priority-ordered code → notes → web; hover for ~5 clamped lines; click for a full side sheet.
- **Perplexica/Vane**: a **4-up grid placed *above* the answer** — sources before prose. The 4th cell is an overflow tile previewing the next three favicons.
- **Dify**: chips **grouped by document**, laid out by an **invisible measurement pass** so the strip is exactly one line with `+N`.

**Trade-off.** Prose stays clean and the answer reads as prose. You lose sentence-level attribution entirely — you know *which documents*, not *which claim*. Perplexica's source-first ordering subtly reframes the whole thing as a research result rather than a chat reply.

### 3. Retrieval as its own turn (Verba)
The search step is a **message type**, rendering as a document grid inside the conversation, with a "Context" modal exposing the raw assembled prompt.

**Trade-off.** Best temporal honesty — the transcript records *retrieve → answer* as two events, which matters for multi-hop. Costs vertical space on every turn and pushes the answer down. Excellent for a debug/demo surface, heavy for an end-user one.

### 4. Retrospective explanation panel (Cheshire Cat)
No markers, no strip. A **"Why this response"** button opens a panel with the tool trace *and* the retrieved memories, tabbed by kind (episodic / declarative / procedural), each with a **numeric score badge**.

**Trade-off.** Zero cost to the reading experience; provenance is opt-in. But nothing signals *whether the answer was grounded at all* until you click — a hallucinated answer and a well-sourced one look identical in the transcript. The **per-collection empty state** ("No procedural memories were used") partly mitigates this.

### 5. Forensic metadata (Dify)
Beyond the chip: each chunk in the popover carries **segment position, word count, hit count, a 7-char vector hash, and a relevance score as a 64×6px progress bar** labelled "Hit Score".

**Trade-off.** Unbeatable for debugging a retrieval pipeline; meaningless-to-alarming for an end user. Correctly gated behind an app-level `supportCitationHitInfo` flag.

### 6. Spatial / non-numeric relevance (Verba)
Cited chunks are highlighted **in a 3D embedding plot** — yellow, radius 3 instead of 1, opacity 1 instead of 0.5 — rather than scored in text.

**Trade-off.** Beautiful and memorable; conveys "these clustered together" in a way a number can't. Conveys nothing actionable, and needs a whole second view.

### The confidence-score question, answered directly
**Only three of the seven show a relevance score at all**, and they disagree on form:
| App | Form | Notes |
|---|---|---|
| Dify | 64×6px grey progress bar + 2dp number, tooltip "Hit Score" | Neutral grey, not a red/green scale — refuses to imply a verdict |
| Cheshire Cat | `badge` pinned top-centre of each source card, **truncated** to 3dp, full precision in tooltip | `Math.floor(x*1000)/1000` — never rounds *up* |
| Verba | Spatial only (sphere size/colour in the vector view) | No number in the transcript |
| Khoj, Onyx, Perplexica, Morphic, RAGFlow | **Nothing** | Scores exist server-side; deliberately not surfaced |

**The dominant position is to hide the score.** The reasoning is defensible: a cosine similarity of 0.82 means nothing to a reader and invites false precision. The two that show it are both *builder* tools where the audience is tuning a pipeline. If a concept lab wants a score, Dify's neutral-grey bar and Cheshire Cat's truncate-don't-round are the two honest patterns; a red-amber-green confidence scale appears **nowhere** in this slice, which is itself a finding.

### Cross-cutting citation observations
- **Favicons are the universal source identity.** Perplexica and Morphic hit `google.com/s2/favicons`, Onyx has a `WebResultIcon`, Khoj embeds `<img src={favicon}>`. For non-web sources everyone falls back to a **connector or file-type icon** (Onyx `SourceIcon`, Dify `FileIcon` from extension, RAGFlow `file-icon/{ext}`).
- **Overlapping icon piles** are the standard "multiple sources" compression: Morphic `marginLeft: -6px`, Onyx `-space-x-1.5`, Perplexica's overflow tile. Always capped at 3.
- **Three sources is the magic number** for a teaser: Khoj `numTeaserSlots = 3`, Perplexica `slice(0, 3)`, Morphic `maxDisplay = 3`, Onyx `IconStack` `slice(0, 3)`. Nobody chose 4 or 5.
- **Grouping by document** (Dify, and Onyx's paged card) is the right move when one file yields many chunks — it stops a single PDF producing eight chips.

---

## B. What a graphical UI could steal from the TUIs

The constraint — no fills, no shadows, no avatars, ~1 row of vertical budget per separator — forces solutions that are *better*, not just cheaper.

**1. Put the label in the frame, not in the content. (Elia)**
`border_title = "Agent" | "You"` draws the role **inside the top border rule**, costing zero rows. The web equivalent: if a message has a border or rule, set the role label *on* it (`legend`-style, or `::before` on a `border-top`) instead of spending a 20px header row above every message. Langflow spends `pb-2` + `text-sm font-semibold` on a name row *per message*; Elia gets the same information for free. And **`border_subtitle` doubling as a mode indicator** ("SELECT" / reverse-video "VISUAL SELECT") is a general idea: *the frame of a thing is the right place to state that thing's state*.

**2. Differentiate roles by *renderer*, not by colour. (Elia, oterm)**
Elia renders the user's message as `Syntax(lexer="markdown")` — **highlighted source** — and the assistant's as rendered `Markdown`. oterm renders the user as `Static(markup=False)` (literal text, markup disabled) and the assistant as a `Markdown` widget. Raw-vs-rendered is unmissable, survives monochrome and colour-blindness entirely, and is *honest*: you see exactly what you sent, including the markdown you typed. A web client could show user messages in a slightly monospaced, unrendered treatment and stop needing a bubble at all.

**3. One glyph, two colours, shared with the composer. (oterm)**
`❯` in `$primary` for the user, `❯` in `$secondary` for the assistant, and **the same glyph in the live input box**. A 2-cell gutter, one blank row between messages, no boxes, and the transcript reads as a continuous shell session. The web version: a 16–24px role gutter with one mark, the composer sharing it, everything else full-bleed. This is the cheapest attribution scheme found in the entire research and it scales to hundreds of turns without visual noise.

**4. Reserve *width*, not height, during streaming. (Elia)**
`&.assistant-message.response-in-progress { background: $accent 3%; min-width: 30%; }` — a shrink-wrapped answer box would otherwise start as a 12-cell sliver and snap wide on the second token. A **3% tint** is also about as quiet as "this is live" can get. Web clients almost universally reserve *height* (Morphic's `100dvh` min-height) and let width jump; for shrink-to-fit bubbles the width floor is the missing half.

**5. Cap the code block, don't cap the message. (oterm)**
`MarkdownFence { max-height: 50 }` — a 400-line listing scrolls inside its own fence instead of swallowing the viewport. Trivial to port (`pre { max-height: 32rem; overflow: auto }`) and almost nobody in the web set does it. Khoj, Onyx, Verba all let a code block push the conversation arbitrarily far down.

**6. Keyboard-navigate the code blocks. (Elia)**
Press `enter` → the rendered message is **replaced** by a read-only editor with vim keys; `u` jumps the selection to the next fenced block via a **tree-sitter query** (`(fenced_code_block (code_fence_content) @code_block)`) and `bisect` over block end-points, wrapping modulo the list; `y` yanks. A graphical client could bind a key to cycle a focus ring through the code blocks of the focused answer, with copy on the same keystroke — far better than hunting for a hover-revealed copy button. The general pattern — **a read/rendered mode and a select/operate mode on the same message** — is transferable wholesale.

**7. Let the progress indicator become the permanent record. (oterm)**
`UsageStatus` ticks a braille spinner (`⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏`) every 100ms next to `↑ in ↓ out {elapsed}s`; when the stream ends the spinner glyph is simply dropped and **the same line stays as a dimmed per-turn footer**. One widget, two jobs, zero layout change at the transition. Most web clients throw the spinner away and show nothing, or (Langflow) show metadata that was never a spinner. Compare also Elia's two-state `ResponseStatus` — *waiting for first token* and *receiving tokens* are different colours, a distinction most web clients collapse.

**8. Overlay the status, don't inline it. (Elia)**
`ResponseStatus` is `dock: top; align-horizontal: right; layer: overlay` — it floats over the transcript so nothing reflows when it appears or vanishes. The web analogue is Dify's avatar-corner badge and Enchanted's avatar-becomes-spinner substitution: **put the liveness signal somewhere that already exists and has fixed size**, never in the text flow.

**9. Acknowledge actions with motion, not colour. (oterm)**
Copy flashes the message: `animate("opacity", 0.5, 0.1s)` then `animate("opacity", 1.0, 0.1s, delay=0.1)` — a 200ms dip-and-restore plus a toast. No green tick, no colour dependency.

**10. Collapse with a text glyph, uniformly. (oterm, RAGFlow, Khoj)**
`▸` / `▾` used identically for tool calls and for thoughts; thoughts **auto-collapse the instant the first answer token lands**. The rule generalises: *reasoning is interesting only while it is the only thing there.*

---

## C. Quick reference — the numbers

| App | Msg gap | Reading width | User container | Assistant container |
|---|---|---|---|---|
| Khoj | 12px margin ×2 | `w-4/6` of viewport | tinted bubble, r16, `8px 16px 0` | transparent + 4px agent-colour left rail |
| Onyx | **48px** (`gap-12`) | **720px** max / **400px** min (md+), toggleable full-width | `bg-tint-02`, `rounded-t-16 rounded-bl-16`, `py-2 px-3` | bare prose, `px-3` |
| Perplexica/Vane | 24px + 1px rule | `lg:w-9/12` (+ 3/12 media rail) | `<h2>` at `text-3xl` | bare prose |
| Morphic | `gap-2 md:gap-4`, section `pb-4 md:pb-14` | **768px** (`max-w-3xl`) | bare text, `line-clamp-3` | bare prose, `prose-sm` |
| Dify | **8px** (`mb-2`) | not set in component | gradient bubble r16, `px-4 py-3`, `pl-14` indent | bubble r16, `px-4 py-3`, 40px avatar + `ml-4` |
| RAGFlow | `padding: 24px 0` | unverified | `bg-bg-card`, r8, `6px 10px`, justified | r8, `6px 10px`, `line-height: 1.8` |
| Langflow | `py-4` + `p-2` row | **768px** at `w-5/6` | identical row + 32px outlined avatar | identical row + 32px filled avatar |
| Verba | 12px (`gap-3`) | none (shrink-wrap) | pill r24, `p-5` | pill r24, `p-5` |
| Cheshire Cat | DaisyUI default | none (`w-fit`) | bubble r8, `p-2 md:p-3` | same + 😺 avatar + name + time |
| Elia (TUI) | **0** — border rows only | `max-width: 1fr` | `width: auto`, min 12 cells, round border | `width: 1fr`, `round $accent 60%` |
| oterm (TUI) | **1 row** (`margin-top: 1`) | `1fr` | `❯` `$primary` + literal text | `❯` `$secondary` + Markdown |
| Enchanted | 20pt (`padding .vertical 10`) | window | `.regularMaterial`, r25 | bare, 24pt logo gutter |

**Streaming indicator inventory**
| App | Indicator |
|---|---|
| Onyx | 8×16px `animate-pulse` block cursor; `shimmer-text` (1s, 300% gradient, `background-clip: text`) on tool headers |
| Dify | 3-dot flasher (4px dots, ±7px, 1s alternate, staggered 0/0.5/1s) — plus a 2px blue variant **on the avatar's corner** |
| RAGFlow | `LoadingDots`, gated on a **600ms stall** (`useLoadingPause`) |
| Perplexica | 3-bar skeleton (`h-2`, 100%/75%/83%, `animate-pulse`) → spinning `Disc3` **as the section heading's icon** |
| Morphic | `minHeight: calc(100dvh - 196px)` on the newest section; `AnimatedLogo` at the section foot; Streamdown `mode: 'streaming'` |
| Khoj | `InlineLoading` + live train-of-thought; empty message `display: none` |
| Langflow | `MoreHorizontal` icon at `h-8 w-8 animate-pulse`, `min-h-8` floor |
| Verba | `loading loading-dots` + phase name (**"Retrieving…" / "Generating…"**) + cancel |
| Cheshire Cat | italic `opacity-75` text: "Cheshire Cat is thinking..." |
| Elia | 3% accent wash + `min-width: 30%`; docked overlay pill, 2 colour states |
| oterm | braille spinner + `↑ in ↓ out 12.4s`, becomes the permanent footer |
| Enchanted | logo → `ActivityIndicatorView(.rotatingDots(count: 5))` in the same 24pt frame |

---

# D. Gaps and things I could not verify

Recorded so nothing here is mistaken for a measured figure.

- **Onyx radius tokens.** `rounded-16` etc. resolve to `var(--radius-16)` via the opal Tailwind preset; I could not find the CSS file defining those custom properties. "16 = 16px" is a naming-convention inference.
- **Onyx `max-w-120` / `max-w-150`.** Not in Onyx's Tailwind config; the 480px/600px figures assume Tailwind v4's default 0.25rem spacing scale.
- **Base font-size and line-height** are unresolved for **Khoj** (inherited from the Tailwind base), **Onyx** (design-system `Text` variants like `mainContentBody`), **Dify** (`body-lg-regular`, `system-xs-medium` tokens) and **Langflow** (project-specific `text-mmd`, `text-xxs` steps). Literal values quoted (`text-[13px]`, `text-[11px]`, `text-[10px]`, `text-xs`, 16pt Splash font) are from source.
- **RAGFlow message max-width** is not set in `next-message-item/index.module.less`; it comes from a page shell I did not trace.
- **Verba's `animate-press-in` keyframes.** `frontend/tailwind.config.ts` did not return a definition on fetch; the exact transform/duration is unknown.
- **Cheshire Cat vertical message spacing** is DaisyUI's `chat` component default, which I did not resolve to px.
- **Perplexica is now "Vane"** — `ItzCrazyKns/Perplexica` 301-redirects to `ItzCrazyKns/Vane`. All figures are from `Vane/master`. If the concept lab needs the historical Perplexica UI specifically, it would need a pinned older tag.
- **Onyx has two clients.** I documented the **web** client (`web/src/app/app/message/*`). There is a separate **React Native mobile** client (`mobile/src/components/chat/*` — `MessageRow.tsx`, `CitedSources.tsx`, `SourceRow.tsx`, `SourceSwitchList.tsx`) with its own citation UI that I did not read; it is a plausible second source of ideas.
- **RAGFlow has two generations** of message component (`message-item/` and `next-message-item/`). I read the `next-*` set, which is the current one; the older set may differ.
- **Elia and oterm have no retrieval**, so points 3 (citations) is genuinely N/A for them rather than unfound — same for Enchanted.
- I did **not** substitute Quivr / PrivateGPT / Reor / Open Notebook, since all 12 named apps yielded usable source.
