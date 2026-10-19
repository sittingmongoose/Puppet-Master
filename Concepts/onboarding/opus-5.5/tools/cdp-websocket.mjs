/* Local CDP WebSocket, without permessage-deflate. Node 22's built-in client rejects large
 * decompressed PM7 replies. No dependency, browser flags, or server configuration is needed. */
import { request } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';

const MAX = 512 * 1024 * 1024;
export class CdpWebSocket extends EventTarget {
  constructor(url) {
    super();
    const parsed = new URL(url);
    if (parsed.protocol !== 'ws:' || !['127.0.0.1', 'localhost', '[::1]'].includes(parsed.hostname)) throw Error('CDP socket requires local ws: endpoint');
    this.parts = []; this.available = 0; this.fragments = []; this.fragmentBytes = 0; this.closed = false;
    const key = randomBytes(16).toString('base64');
    const req = request({ hostname: parsed.hostname, port: parsed.port, path: parsed.pathname + parsed.search,
      headers: { Upgrade: 'websocket', Connection: 'Upgrade', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13' } });
    this.req = req;
    req.setTimeout(10000, () => req.destroy(Error('CDP socket handshake timeout')));
    req.once('error', error => this.fail(error));
    req.once('response', response => { response.resume(); this.fail(Error('CDP upgrade rejected: ' + response.statusCode)); });
    req.once('upgrade', (response, socket, head) => {
      const accept = createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
      if (response.statusCode !== 101 || response.headers['sec-websocket-accept'] !== accept || response.headers['sec-websocket-extensions']) {
        socket.destroy(); this.fail(Error('Invalid/unexpected compressed CDP upgrade')); return;
      }
      req.setTimeout(0); socket.setTimeout(0); socket.setNoDelay(true); this.socket = socket;
      socket.on('error', error => this.fail(error));
      socket.on('close', () => this.finish());
      socket.on('data', bytes => this.consume(bytes));
      this.dispatchEvent(new Event('open'));
      if (head.length) this.consume(head);
    });
    req.end();
  }
  fail(error) {
    const event = new Event('error'); event.error = error; event.message = String(error.message || error);
    this.dispatchEvent(event); this.socket?.destroy(); this.finish();
  }
  finish() {
    if (this.closed) return; this.closed = true;
    this.parts = []; this.fragments = [];
    this.dispatchEvent(new Event('close'));
  }
  read(n) {
    if (!n) return Buffer.alloc(0);
    this.available -= n;
    if (this.parts[0].length >= n) {
      const result = this.parts[0].subarray(0, n);
      if (this.parts[0].length === n) this.parts.shift(); else this.parts[0] = this.parts[0].subarray(n);
      return result;
    }
    const result = Buffer.allocUnsafe(n); let offset = 0;
    while (offset < n) {
      const part = this.parts[0], take = Math.min(part.length, n - offset);
      part.copy(result, offset, 0, take); offset += take;
      if (part.length === take) this.parts.shift(); else this.parts[0] = part.subarray(take);
    }
    return result;
  }
  peek(n) {
    const result = Buffer.allocUnsafe(n); let offset = 0;
    for (const part of this.parts) { const take = Math.min(part.length, n - offset); part.copy(result, offset, 0, take); offset += take; if (offset === n) return result; }
  }
  consume(bytes) {
    if (this.closed) return;
    this.parts.push(bytes); this.available += bytes.length;
    try {
      for (;;) {
        if (this.available < 2) return;
        let header = this.peek(2), n = header[1] & 127;
        const headerSize = n === 126 ? 4 : n === 127 ? 10 : 2;
        if (this.available < headerSize) return;
        header = this.peek(headerSize);
        if (header[0] & 0x70 || header[1] & 0x80) throw Error('Compressed/masked CDP server frame');
        if (n === 126) n = header.readUInt16BE(2);
        else if (n === 127) { const big = header.readBigUInt64BE(2); if (big > BigInt(MAX)) throw Error('CDP frame too large'); n = Number(big); }
        if (n > MAX || this.fragmentBytes + n > MAX) throw Error('CDP message too large');
        if (this.available < headerSize + n) return;
        this.read(headerSize); const body = this.read(n), opcode = header[0] & 15, final = !!(header[0] & 128);
        if (opcode >= 8 && (!final || n > 125)) throw Error('Invalid CDP control frame');
        if (opcode === 8) { this.close(); return; }
        if (opcode === 9) { this.frame(10, body); continue; }
        if (opcode === 10) continue;
        if (![0, 1].includes(opcode) || (opcode === 0) !== !!this.fragments.length) throw Error('Invalid CDP text continuation');
        this.fragments.push(body); this.fragmentBytes += body.length;
        if (final) {
          const text = (this.fragments.length === 1 ? body : Buffer.concat(this.fragments, this.fragmentBytes)).toString('utf8');
          this.fragments = []; this.fragmentBytes = 0;
          this.dispatchEvent(new MessageEvent('message', { data: text }));
        }
      }
    } catch (error) { this.fail(error); }
  }
  frame(opcode, data) {
    if (!this.socket || this.closed) throw Error('CDP socket is closed');
    const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data), n = bytes.length;
    if (n > MAX) throw Error('CDP outbound frame too large');
    const headerSize = n < 126 ? 2 : n <= 65535 ? 4 : 10, mask = randomBytes(4), frame = Buffer.allocUnsafe(headerSize + 4 + n);
    frame[0] = 128 | opcode; frame[1] = 128 | (n < 126 ? n : n <= 65535 ? 126 : 127);
    if (headerSize === 4) frame.writeUInt16BE(n, 2); else if (headerSize === 10) frame.writeBigUInt64BE(BigInt(n), 2);
    mask.copy(frame, headerSize);
    for (let i = 0; i < n; i++) frame[headerSize + 4 + i] = bytes[i] ^ mask[i % 4];
    this.socket.write(frame);
  }
  send(text) { this.frame(1, text); }
  close() {
    if (this.closed) return;
    if (this.socket) { try { this.frame(8, Buffer.from([3, 232])); } catch {} this.socket.end(); }
    else this.req.destroy();
    this.finish();
  }
}
