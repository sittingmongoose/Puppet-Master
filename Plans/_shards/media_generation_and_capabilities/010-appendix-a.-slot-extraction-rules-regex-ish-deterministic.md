# Shard 010: Appendix A. Slot extraction rules (regex-ish, deterministic)

Source: `Plans/Media_Generation_and_Capabilities.md`

Source lines: L1060-L1116

Source SHA256: `418bc32eb7b2528e2e8654f6573ff22898801fe0881483bd4b3c18cc9a4115a4`

---

## Appendix A. Slot extraction rules (regex-ish, deterministic)

1) Pre-processing:
- Keep raw (original) and s_lower (normalized lowercased).
- If trailing controls block exists (ends with (...) or [...] and contains control tokens), split body + controls and parse controls first; remove block from prompt.
Controls-block regex: (?is)^(?P<body>.*?)(?:\s*(?P<bracket>\(|\[)\s*(?P<controls>[^)\]]{1,400})\s*(?:\)|\])\s*)$
Control token gate: \b(model|aspect|ratio|size|resolution|duration|voice|format|bpm|seed|negative|quality)\b
2) kind detection:
- Prefix form: (?is)^\s*(?P<prefix>image|video|tts|music)\s*:\s*
- Else keyword-based:
image: \b(image|picture|photo|logo|poster|thumbnail|cover)\b
video: \b(video|clip|animation|broll|b-roll)\b
tts: \b(tts|text to speech|read aloud|say this|voiceover|voice-over)\b
music: \b(music|song|beat|instrumental|soundtrack)\b
- Else verb fallback only if unambiguous.
3) Precedence: controls block key/values override everything then: model_override, count, aspect_ratio, size/resolution, duration, format, voice/style, quality, seed, bpm, negative_prompt
4) model_override:
Keyword form: (?is)\b(?:using|with|via|use|model)\s*(?:[:=]\s*)?(?P<model>@?[a-z0-9][a-z0-9._/\-\s]{0,80}?)(?=(?:\s*(?:,|;|\)|\]|\.$|$))|\s+\b(?:for|aspect|ratio|size|resolution|format|voice|duration|negative|quality|seed|bpm|variations?|versions?|options?)\b)
@ shorthand: (?i)(?<!\w)@(?P<model2>[a-z0-9][a-z0-9._/\-]{1,64})(?!\w)
Normalize model key: lowercase; collapse spaces/underscores/hyphens.
Resolve: alias -> exact model id -> exact displayName -> else MODEL_UNAVAILABLE.
5) count:
digits: (?i)\b(?:(?:make|generate|create|give me|output|render)\s+)?(?P<count>\d{1,2})\s*(?:x\s*)?(?:variations?|versions?|options?|images?|pics?|pictures?|clips?|frames?)\b
optional words one-ten similar.
Clamp to safe max (default 8). Last match wins.
6) aspect_ratio:
numeric: (?i)\b(?P<ar_w>\d{1,2})\s*:\s*(?P<ar_h>\d{1,2})\b
named: (?i)\b(?P<ar_named>square|portrait|landscape|vertical|horizontal|widescreen)\b
Mapping: square=1:1; portrait/vertical=9:16; landscape/horizontal/widescreen=16:9.
7) size/resolution:
Image keyworded: (?i)\b(?:size|resolution|res)\s*[:=]?\s*(?P<size_px>512|768|1024|1152|1280|1536|2048|3072|4096)\s*(?:px|pixels)?\b
Image keyworded k: (?i)\b(?:size|resolution|res)\s*[:=]?\s*(?P<size_k>2k|4k|8k)\b
Video: (?i)\b(?P<vres>720p|1080p|1440p|2160p|4k)\b
Do not treat bare numbers as size unless they are in controls block or trailing comma controls.
Envelope mapping: size_px -> size; size_k -> size (2k=2048,4k=4096,8k=8192) plus resolution token; vres -> resolution for video and MUST NOT override size_k-derived resolution for image prompts.
ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2
8) duration (video/music only):
keyworded: (?i)\b(?:for|duration|length)\s*(?P<secs>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs|second|seconds)\b
bare (only in controls block or trailing controls): (?i)\b(?P<secs2>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs)\b
9) format: (?i)\b(?:format|output|export|as)\s*[:=]?\s*(?P<fmt>png|jpg|jpeg|webp|gif|mp4|mov|wav|mp3|flac|pcm16)\b
10) voice (tts):
voice id: (?i)\bvoice\s*[:=]\s*(?P<voice>[a-z0-9][a-z0-9 _\-]{0,32})\b
voice style: (?i)\bin\s+a[n]?\s+(?P<voice_style>[^,.;]{1,40})\s+voice\b
11) quality: (?i)\b(?P<qual>draft|standard|high)\b optional phrase mapping. Guard: set only when in controls block or quality-keyword phrase; bare descriptive adjectives in creative prompt MUST NOT set quality.
ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2
12) seed: (?i)\bseed\s*[:=]?\s*(?P<seed>\d{1,10})\b
13) bpm: (?i)\b(?P<bpm>\d{2,3})\s*bpm\b|\bbpm\s*[:=]\s*(?P<bpm2>\d{2,3})\b
14) negative_prompt:
explicit: (?is)\bnegative\s+prompt\s*[:=]\s*(?P<neg>"[^"]{1,200}"|'[^']{1,200}'|[^,;\n]{1,200})
avoid-clauses (collect all): (?is)\b(?:without|no|avoid)\s+(?P<avoid>[^,.;\n]{1,80})
Combine explicit + avoid list (dedupe preserve order).
15) prompt cleaning:
- If controls block present: remove it.
- Remove only matched spans introduced by control keywords (using/model/size/aspect/etc).
- Preserve remaining text as the creative prompt.

---
