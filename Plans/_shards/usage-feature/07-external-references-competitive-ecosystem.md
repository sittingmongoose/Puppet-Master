## External References (Competitive & Ecosystem)

| Source | Relevance to Usage feature |
|--------|----------------------------|
| **[OpenSync](https://www.opensync.dev/) -- [Dashboard overview](https://www.opensync.dev/docs#dashboard-overview)** | Beautiful dashboards for OpenCode and Claude Code sessions; reference for how usage/dashboards can be presented. |
| **[yume](https://github.com/aofp/yume) / [yume site](https://aofp.github.io/yume/)** | Native desktop UI for Claude Code. **Persistent rate limit visibility** -- 5h and 7d limits always visible (no `/usage` needed). **Analytics dashboard** -- usage by project/model/date, cost tracking, export; "know where your tokens go"; mid-stream context (live token count). Strong UX benchmark for always-visible limits and analytics. |
| **[openclaudecto](https://github.com/josharsh/openclaudecto)** | Open-source Claude Code dashboard (coming soon): analytics & cost tracking, token consumption, cost breakdowns by model, tool usage distribution, daily activity trends. Useful reference for analytics/cost UX and data shape. |
| **[OpenCode Monitor](https://ocmonitor.vercel.app/docs)** | CLI tool for monitoring and analyzing OpenCode AI coding sessions: live dashboard, daily usage breakdown, usage quotas, session/time/model/project analysis, export (CSV/JSON). **We provide equivalent usage visibility in the app GUI**, not via a separate terminal/CLI monitor -- one place for orchestration and usage. |
| **[OpenCode desktop](https://github.com/anomalyco/opencode) (packages/app)** | **Per-thread usage in chat:** Small **context circle** (ProgressCircle) at top of chat showing context usage %; **hover** shows tooltip (total tokens, usage %, cost USD); **click** opens "context" tab for that session with detailed usage. Reference: `packages/app/src/components/session-context-usage.tsx`, `session-context-metrics.ts`. We adopt this pattern in §5 "Per-thread usage in Chat (OpenCode-style)". |

