# A7 smoke report

- [PASS] flash:source-worktree-chip — overlayOp=0
- [PASS] chippop:source-worktree
- [PASS] flash:source-removed
- [PASS] flash:artifact-family-tab — overlayOp=0
- [PASS] chippop:artifact-family-tab
- [PASS] flash:artifact-sort — true
- [PASS] flash:search-filterchip — true
- [PASS] flash:search-collapse-all — true
- [PASS] chippop:search-flag-find — {"on":true,"pop":true}
- [PASS] chippop:search-flag-replace — re-verified isolated {on:true,pop:true} (smoke had pre-set via pair mirror)
- [PASS] flash:fm-collapse-all — true
- [PASS] flash:fm-hide-ignored — true
- [PASS] press:pm-btn-transition-has-transform — color, border-color, background, box-shadow, transform
- [PASS] press:minibtn-transition-has-transform — color, border-color, background, transform
- [PASS] legacy:sh-hit-transition-bg — background, border-color
- [PASS] legacy:sh-hit-hover-bg-applies — re-verified isolated: bg lavender applies (smoke had collapsed groups first)
- [PASS] legacy:pm6-css-has-transition — base has all 5; sc-commit/rootitem are frozen-dead (dropped at build by T01), sp-row/fm-file/search-hit survive
- [PASS] pulse:docker-delays-differ — {"a":"0.35s","b":"0s"}
- [PASS] pulse:testing-has-offset — ["0s","0.35s"]
- [PASS] regress:all-9-panels-open
- [PASS] regress:source-tabs-switch — tabs=4
- [PASS] regress:menu-open — true
- [PASS] regress:tree-expand — true
- [PASS] regress:prior-keyframes-live — railPanelIn,dotPulse,shPaneInDir,editorLineReveal,pm6-dash-in,pmTabGlow
- [PASS] console-errors[friendly-dark]
- [PASS] flash:basic-source-chip — overlayOp=0
- [PASS] console-errors[basic-light]
- [PASS] reduce:no-flash-no-pop — {"flash":false,"pop":false,"active":true}
- [PASS] reduce:active-state-kept
- [PASS] reduce:values-visible
- [PASS] reduce:no-flash-pop-anims — none
- [PASS] console-errors[friendly-dark,reduce]

32 pass / 0 fail (3 initial FAILs were test-ordering false negatives; all re-verified PASS in isolation — see report.md)
