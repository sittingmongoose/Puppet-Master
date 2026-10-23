"""Keep both hosted decision-height publishers on the float, across renders."""

HOSTED_JS_PATCHES = [
    ('app.js', "    setStageVar(stage, '--decision-h', decisionH);",
     "    window.PM56_DOCK_H(stage, `${Math.max(0, Math.round(decisionH))}px`);", 1),
    ('app.js', '<section class="chat-stage" data-shell=',
     '<section class="chat-stage" style="${esc(window.PM56_DOCK_STYLE(false))}" data-shell=', 1),
    ('app.js', '<div class="chat-float" data-k="chat-float">',
     '<div class="chat-float" data-k="chat-float" style="${esc(window.PM56_DOCK_STYLE(true))}">', 1),
]
