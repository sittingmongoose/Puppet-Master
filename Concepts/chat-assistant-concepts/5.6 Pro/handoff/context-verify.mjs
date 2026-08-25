/* Wave 3 — Context (item 6) verification harness.
 *
 * The canonical file now lives IN THE REPO, next to the code it tests and next
 * to the Transcript agent's harness, because this scratchpad is temporary and a
 * harness another agent has to re-run must not be:
 *
 *     Concepts/chat-assistant-concepts/5.6 Pro/tests/context-verify.mjs
 *
 * Run it either way:
 *     cd "<repo>/Concepts/chat-assistant-concepts/5.6 Pro" && node tests/context-verify.mjs
 *     node <this file>                     # from the waves dir; screenshots land in ./ctxshots
 *
 * This shim keeps the promised path working and writes its output here.
 */
import path from 'path';
const here = path.dirname(new URL(import.meta.url).pathname);
process.env.PM56_OUT = process.env.PM56_OUT || path.join(here, 'ctxshots');
await import('/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/tests/context-verify.mjs');
