import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { CdpWebSocket } from './cdp-websocket.mjs';

function serverFrame(opcode, body, final = true) {
  const n = body.length, size = n < 126 ? 2 : n <= 65535 ? 4 : 10, out = Buffer.alloc(size + n);
  out[0] = (final ? 128 : 0) | opcode; out[1] = n < 126 ? n : n <= 65535 ? 126 : 127;
  if (size === 4) out.writeUInt16BE(n, 2); else if (size === 10) out.writeBigUInt64BE(BigInt(n), 2);
  body.copy(out, size); return out;
}
test('large CDP messages, masking, fragmented UTF-8 and interleaved ping without compression', { timeout: 10000 }, async () => {
  const text = 'A'.repeat(3 * 1024 * 1024) + '🙂Z', payload = Buffer.from(text);
  const server = createServer(); let peer, connection;
  server.on('upgrade', (request, socket) => {
    peer = socket;
    assert.equal(request.headers['sec-websocket-extensions'], undefined);
    const accept = createHash('sha1').update(request.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
    let buffer = Buffer.alloc(0), sent = false;
    socket.on('data', bytes => {
      buffer = Buffer.concat([buffer, bytes]);
      if (sent || buffer.length < 14) return;
      assert.equal(buffer[0], 129); assert.equal(buffer[1], 255);
      const n = Number(buffer.readBigUInt64BE(2));
      if (buffer.length < n + 14) return;
      const mask = buffer.subarray(10, 14), decoded = Buffer.from(buffer.subarray(14, n + 14));
      for (let i = 0; i < n; i++) decoded[i] ^= mask[i % 4];
      assert.equal(decoded.toString(), text); sent = true;
      const split = payload.length - 3;
      socket.write(serverFrame(1, payload.subarray(0, split), false));
      socket.write(serverFrame(9, Buffer.from('ping')));
      socket.write(serverFrame(0, payload.subarray(split)));
    });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  try {
    connection = new CdpWebSocket(`ws://127.0.0.1:${server.address().port}/devtools`);
    await once(connection, 'open');
    const received = once(connection, 'message'); connection.send(text);
    const [event] = await received; assert.equal(event.data, text);
  } finally { connection?.close(); peer?.destroy(); server.close(); await once(server, 'close'); }
});
