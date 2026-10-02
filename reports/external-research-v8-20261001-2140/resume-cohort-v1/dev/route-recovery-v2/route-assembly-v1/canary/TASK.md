# V8 mechanical native Goal canary

This is a mechanical route canary, not a scored research assignment. No product/domain research facts are supplied.

1. Read `inputs/ECHO.txt` with the admitted `read_file` tool.
2. Fetch `https://example.com/` with `public_https_get`. Use only this public HTTPS URL for this canary.
3. Read the returned content-addressed `public_captures/<sha256>.body` using `read_file` with `byte_start=0` and `byte_count=256`.
4. Write `out/RESULT.md` once with the exact echo text and a compact record of the capture path, source SHA-256, response status, and byte-range values returned by the tools. This tests mechanics only; do not claim semantic research acquisition or add source facts.
5. Complete the native Goal after the actual artifact exists.

Use only the enumerated bounded MCP tools. Do not launch a child, helper, agent, native app or provider. No Bash/Read/Skill/Agent, private host/evaluator/sibling paths, or alternate tools. At most 480 seconds and 64 responses under the host original clock, including setup and cleanup.
