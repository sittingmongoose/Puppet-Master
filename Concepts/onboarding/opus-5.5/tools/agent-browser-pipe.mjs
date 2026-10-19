#!/usr/bin/env node
/* Adapt pm_cdp's pipe transport to an agent-browser session. The helper enforces the machine's browser
 * cap and owns the real profile; closing the pipe stops that exact session before acknowledging close. */
import { execFileSync } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { websocketForPipe } from './cdp-websocket.mjs';

async function startSession() {
  for (let attempt = 1; attempt <= 80; attempt++) {
    try {
      return JSON.parse(execFileSync('agent-browser', ['start', '--url', 'about:blank'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
    } catch (error) {
      // A full shared browser cap is temporary; other launch failures must still fail the run.
      if (!/Browser limit reached:/.test(String(error.stderr || '')) || attempt === 80) throw error;
      console.error(`Browser cap is full; retrying agent-browser start in 15 s (attempt ${attempt}/80).`);
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
}
const session = await startSession();
const input = createReadStream(null, { fd: 3 });
const output = createWriteStream(null, { fd: 4 });
let stopped = false;
const stop = () => {
  if (stopped) return;
  stopped = true;
  execFileSync('agent-browser', ['stop', session.id], { stdio: 'ignore' });
};
process.on('exit', () => { try { stop(); } catch (_) {} });
for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, () => { try { stop(); } finally { process.exit(0); } });

const version = await (await fetch(session.cdp_endpoint + '/json/version')).json();
const Socket = websocketForPipe();
const socket = new Socket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
socket.addEventListener('message', e => output.write(String(e.data) + '\0'));
socket.addEventListener('close', () => { try { stop(); } finally { process.exit(0); } });

let buffer = '';
input.on('data', chunk => {
  buffer += chunk.toString();
  let n;
  while ((n = buffer.indexOf('\0')) >= 0) {
    const raw = buffer.slice(0, n); buffer = buffer.slice(n + 1);
    const msg = JSON.parse(raw);
    if (msg.method === 'Browser.close') {
      // pm_cdp kills the launcher as soon as it receives this response; finish cleanup first.
      stop();
      output.end(JSON.stringify({ id: msg.id, result: {} }) + '\0', () => process.exit(0));
    } else socket.send(raw);
  }
});
input.on('end', () => { try { stop(); } finally { process.exit(0); } });
