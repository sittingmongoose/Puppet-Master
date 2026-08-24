# Transcript survey — 36 open-source AI chat clients

Source material for transcript takes 8-15. Every figure in these three files
was read from the projects' actual message-component source (TSX / Svelte /
Vue / CSS / Rust / Python), not from screenshots — screenshots lie about
spacing. Each file ends with a synthesis and a gaps section listing what the
researcher could not verify.

| file | slice | apps |
|---|---|---|
| `01-web-clients.md` | mainstream web chat clients | LibreChat, Open WebUI, Lobe Chat, NextChat, Chatbot UI, AnythingLLM, Jan, SillyTavern, text-generation-webui, HF Chat UI, BetterChatGPT, Big-AGI |
| `02-coding-agents.md` | coding agents — how agent *work* sits in a transcript | Cline, Roo Code, Continue.dev, Aider, OpenHands, Goose, Void, bolt.diy, gptme, Open Interpreter, Zed, Theia AI |
| `03-rag-desktop-tui.md` | RAG, desktop and terminal UIs | Khoj, Onyx, Dify, Langflow, RAGFlow, Verba, Cheshire Cat, Perplexica, Morphic, Elia, oterm, Enchanted |

## The findings that shaped the takes

- **Asymmetric is the consensus.** 5 of 12 web clients give the user a bubble
  and the assistant full width, because the content is genuinely asymmetric —
  the user writes a sentence, the model writes a document. The original eight
  takes had nothing like it. → take 8.
- **Nobody renders a branching transcript.** All eight surveyed apps that
  support regeneration collapse siblings to a `< n/m >` stepper; nesting only
  ever happens *inside* one assistant turn. → take 15 claims the gap.
- **Nobody ships a notebook.** Every one of these apps is a sequence of
  numbered request/response pairs, which is what a notebook is. → take 12.
- **Card-per-turn is used by nobody as the base layout** — only for sub-parts
  or as a state. Worth knowing before designing one.
- **Two-tier tool taxonomy**: cheap tools become a line, expensive ones a card.
  Cline (`isLowStakesTool`) and Zed (`use_card_layout`) reached this
  independently — the most transferable finding in the survey.
- **Tool-chip copy must change tense.** Lobe Chat enforces paired
  `.loading` / `.completed` i18n keys because the chip stays in the transcript
  forever, so a stuck present-progressive makes an old conversation look live.
- **Reserve the space you are about to need.** LibreChat sizes the streaming
  footer to `min-h-[31px]` so the transcript does not step upward under the
  reader when an answer completes.
- **Don't animate too eagerly.** Aider's spinner does not appear for the first
  500ms and self-throttles between 20fps and 0.5fps by measured render cost;
  RAGFlow's loading dots appear only when the stream *stalls* for 600ms, so a
  smooth stream shows no indicator at all.
