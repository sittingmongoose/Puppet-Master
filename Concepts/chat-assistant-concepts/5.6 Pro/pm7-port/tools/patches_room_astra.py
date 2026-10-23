"""Preserve the hosted turn room floor on its single layout consumer."""

HOSTED_JS_PATCHES = [
    ('app.js', '<div class="transcript-inner">',
     '<div class="transcript-inner" style="${esc(window.PM56_ROOM_STYLE())}">', 1),
]
