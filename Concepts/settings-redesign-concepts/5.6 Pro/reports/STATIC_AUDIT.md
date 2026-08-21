# Static Audit

**Overall:** FAIL

| Check | Status | Detail |
|---|---|---|
| file:index.html:nonempty | PASS | 10504 bytes |
| file:styles.css:nonempty | PASS | 83147 bytes |
| file:data.js:nonempty | PASS | 33521 bytes |
| file:app.js:nonempty | PASS | 179664 bytes |
| javascript:data.js:syntax | PASS |  |
| javascript:app.js:syntax | FAIL | /mnt/data/work/pm56_pro_reaudit/app.js:86
    warning:'<path d="M12 3 2.8 20h18.4z"/><path d="M12 9v5M12 17h.01"/>
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

SyntaxError: Invalid or unexpected token
    at wrapSafe (node:internal/modules/cjs/loader:1662:18)
    at checkSyntax (node:internal/main/check_syntax:78:3)

Node.js v22.16.0
 |
| css:balanced-braces | PASS | 802 opens / 802 closes |
| html:single-overlay-root | PASS | 1 |
| feature:history pinned default | PASS | historyPinned\s*:\s*true |
| feature:archive support | PASS | archiv |
| feature:thread search | PASS | thread.{0,20}search\|search.{0,20}thread |
| feature:overlay manager | PASS | class\s+OverlayManager\|OverlayManager\s*= |
| feature:overlay positioning | PASS | getBoundingClientRect |
| feature:portal root | PASS | overlay-root |
| feature:eight themes | PASS | glass-light |
| feature:worktree selector | PASS | worktree |
| feature:permissions selector | PASS | Ask for approval\|Full Access |
| feature:wand | PASS | Context Lens\|context-lens |
| feature:goal mode | PASS | Goal Mode\|goal-mode |
| feature:thought stream | PASS | Thought Stream\|thought-stream |
| feature:subcompact apply | PASS | Apply Subcompact\|apply-subcompact |
| feature:model favorites | PASS | Favorites |
| feature:configured providers | PASS | configured |
| feature:fast mode | PASS | Fast mode\|fast-mode\|Fast |
| feature:effort sidecar | PASS | effort |
| feature:working animation | PASS | Working Animation\|working-animation |
| feature:web search state | PASS | web-search\|Web Search |
| feature:web fetch state | PASS | web-fetch\|Web Fetch |
| feature:browser control state | PASS | browser-control\|Browser Control |
| feature:bash state | PASS | Bash\|bash |
| feature:program testing | PASS | program-test\|Program Test |
| feature:subagents | PASS | subagent |
| feature:activity bar | PASS | activity-bar |
| feature:activity detail | PASS | activity-detail |
| feature:goal domain | PASS | goal |
| feature:todo domain | PASS | todo |
| feature:changes domain | PASS | change |
| feature:artifacts domain | PASS | artifact |
| feature:read-only child thread | PASS | read.only\|read-only |
| feature:exact change range | PASS | changeRange\|lineRange\|range |
| feature:plan card | PASS | plan-card |
| feature:approve and build | PASS | Approve And Build |
| feature:revise | PASS | Revise |
| feature:questionnaire | PASS | questionnaire |
| feature:question queue | PASS | questionQueue\|queued question\|question-queue |
| feature:mermaid | PASS | mermaid |
| feature:interactive visualizer | PASS | visualizer |
| feature:generated image | PASS | generated-image\|Generated Image |
| feature:slash goal | PASS | /goal |
| feature:slash plan | PASS | /plan |
| feature:slash deep plan | PASS | /deep-plan\|/deepplan |
| feature:slash debug | PASS | /debug |
| feature:long collapse | PASS | collapse\|expanded |
| no generic resend | PASS | generic Resend absent |
| feature:eight recipes | PASS | recipes |
| feature:component families | PASS | families |
| feature:demo triggers | PASS | triggerDemo\|demoTriggers\|PM56_DEMO |
| feature:context details | PASS | Context More Details\|context-details |
| icons:no-emoji-interface-glyphs | PASS | 0 emoji codepoints |
| history:not-hover-hidden | PASS | [] |
| css:overlay-fixed | FAIL |  |
| css:overlay-overflow-visible | FAIL |  |
| css:sidecar-animation | PASS |  |
