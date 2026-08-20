/* A minimal Chrome DevTools Protocol driver.
 *
 * Why not Playwright: this sandbox has the Playwright browser download but not the
 * Playwright package, and — more importantly — headless Chromium here hangs on every
 * http:// request, so the concepts must be driven over file://. One long-lived
 * browser, one tab per page, raw CDP over a websocket is the whole dependency list.
 *
 * The websocket client is hand-rolled because there is no `ws` package either. It
 * speaks only what this harness needs: a client-masked text frame out, and text or
 * binary frames in, including continuations and the 64-bit length form that a big
 * DOM snapshot will hit.
 */
"use strict";

const { spawn } = require("child_process");
const crypto = require("crypto");
const net = require("net");
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CHROME = path.join(os.homedir(), ".cache/ms-playwright/chromium-1234/chrome-linux64/chrome");

/* ------------------------------------------------------------------ websocket */

class Socket {
  constructor(url) {
    this.url = url;
    this.pending = Buffer.alloc(0);
    this.fragments = [];
    this.onMessage = () => {};
    this.onClose = () => {};
  }

  connect() {
    const u = new URL(this.url);
    return new Promise((resolve, reject) => {
      const key = crypto.randomBytes(16).toString("base64");
      const socket = net.connect({ host: u.hostname, port: Number(u.port) }, () => {
        socket.write(
          `GET ${u.pathname}${u.search} HTTP/1.1\r\n` +
          `Host: ${u.host}\r\n` +
          "Upgrade: websocket\r\nConnection: Upgrade\r\n" +
          `Sec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`
        );
      });
      socket.setNoDelay(true);
      let handshake = Buffer.alloc(0);

      const onData = (chunk) => {
        handshake = Buffer.concat([handshake, chunk]);
        const end = handshake.indexOf("\r\n\r\n");
        if (end < 0) return;
        const header = handshake.slice(0, end).toString();
        if (!/101/.test(header.split("\r\n")[0])) {
          socket.destroy();
          reject(new Error("websocket upgrade refused: " + header.split("\r\n")[0]));
          return;
        }
        socket.removeListener("data", onData);
        this.socket = socket;
        this.pending = handshake.slice(end + 4);
        socket.on("data", (d) => this._feed(d));
        socket.on("close", () => this.onClose());
        socket.on("error", () => {});
        if (this.pending.length) this._drain();
        resolve(this);
      };
      socket.on("data", onData);
      socket.on("error", reject);
    });
  }

  _feed(chunk) {
    this.pending = Buffer.concat([this.pending, chunk]);
    this._drain();
  }

  _drain() {
    for (;;) {
      const buf = this.pending;
      if (buf.length < 2) return;
      const fin = (buf[0] & 0x80) !== 0;
      const opcode = buf[0] & 0x0f;
      const masked = (buf[1] & 0x80) !== 0;
      let len = buf[1] & 0x7f;
      let offset = 2;
      if (len === 126) {
        if (buf.length < 4) return;
        len = buf.readUInt16BE(2);
        offset = 4;
      } else if (len === 127) {
        if (buf.length < 10) return;
        // A CDP payload never exceeds 2^53; reading the high word is enough to know
        // it did not, and Number() on the low word keeps this in safe integer range.
        const high = buf.readUInt32BE(2);
        const low = buf.readUInt32BE(6);
        if (high !== 0) throw new Error("websocket frame too large");
        len = low;
        offset = 10;
      }
      if (masked) offset += 4;
      if (buf.length < offset + len) return;
      const payload = buf.slice(offset, offset + len);
      this.pending = buf.slice(offset + len);

      if (opcode === 0x8) { this.onClose(); return; }
      if (opcode === 0x9) { this._send(0xa, payload); continue; }
      if (opcode === 0xa) continue;

      this.fragments.push(payload);
      if (fin) {
        const message = Buffer.concat(this.fragments).toString("utf8");
        this.fragments = [];
        this.onMessage(message);
      }
    }
  }

  _send(opcode, payload) {
    const mask = crypto.randomBytes(4);
    const len = payload.length;
    let header;
    if (len < 126) {
      header = Buffer.alloc(2);
      header[1] = 0x80 | len;
    } else if (len < 65536) {
      header = Buffer.alloc(4);
      header[1] = 0x80 | 126;
      header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 0x80 | 127;
      header.writeUInt32BE(0, 2);
      header.writeUInt32BE(len, 6);
    }
    header[0] = 0x80 | opcode;
    const body = Buffer.from(payload);
    for (let i = 0; i < body.length; i++) body[i] ^= mask[i % 4];
    this.socket.write(Buffer.concat([header, mask, body]));
  }

  send(text) { this._send(0x1, Buffer.from(text, "utf8")); }
  close() { try { this.socket.destroy(); } catch (e) { /* already gone */ } }
}

/* ---------------------------------------------------------------- the browser */

function getJSON(port, route) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: "127.0.0.1", port, path: route }, (res) => {
      let body = "";
      res.on("data", (d) => { body += d; });
      res.on("end", () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.setTimeout(4000, () => req.destroy(new Error("timeout")));
  });
}

class Browser {
  constructor(profileDir) {
    this.profileDir = profileDir;
    this.nextId = 1;
    this.waiting = new Map();
    this.sessionHandlers = new Map();
  }

  static async launch(profileDir) {
    fs.mkdirSync(profileDir, { recursive: true });
    const browser = new Browser(profileDir);
    const child = spawn(CHROME, [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDir}`,
      "--no-first-run", "--no-default-browser-check", "--disable-extensions",
      "--disable-background-networking", "--disable-sync", "--disable-gpu",
      "--no-sandbox", "--allow-file-access-from-files",
      "--force-device-scale-factor=1",
      "--hide-scrollbars=false",
      "about:blank"
    ], { stdio: ["ignore", "ignore", "pipe"] });
    browser.child = child;

    // Chrome prints the chosen port on stderr; --remote-debugging-port=0 means we
    // never collide with something already listening.
    const endpoint = await new Promise((resolve, reject) => {
      let buffer = "";
      const timer = setTimeout(() => reject(new Error("chrome did not report a devtools endpoint")), 30000);
      child.stderr.on("data", (d) => {
        buffer += d.toString();
        const m = buffer.match(/ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([-\w]+)/);
        if (m) { clearTimeout(timer); resolve({ port: Number(m[1]), url: m[0] }); }
      });
      child.on("exit", (code) => { clearTimeout(timer); reject(new Error("chrome exited " + code + "\n" + buffer)); });
    });

    browser.port = endpoint.port;
    browser.socket = await new Socket(endpoint.url).connect();
    browser.socket.onMessage = (text) => browser._receive(text);
    return browser;
  }

  _receive(text) {
    let msg;
    try { msg = JSON.parse(text); } catch (e) { return; }
    if (msg.id && this.waiting.has(msg.id)) {
      const { resolve, reject } = this.waiting.get(msg.id);
      this.waiting.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message + " (" + JSON.stringify(msg.error.data || "") + ")"));
      else resolve(msg.result);
      return;
    }
    if (msg.method && msg.sessionId) {
      const handler = this.sessionHandlers.get(msg.sessionId);
      if (handler) handler(msg.method, msg.params);
    }
  }

  send(method, params, sessionId) {
    const id = this.nextId++;
    const payload = { id, method, params: params || {} };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.waiting.set(id, { resolve, reject });
      this.socket.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.waiting.has(id)) {
          this.waiting.delete(id);
          reject(new Error("CDP timeout: " + method));
        }
      }, 60000);
    });
  }

  async newPage() {
    const { targetId } = await this.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await this.send("Target.attachToTarget", { targetId, flatten: true });
    const page = new Page(this, targetId, sessionId);
    this.sessionHandlers.set(sessionId, (method, params) => page._event(method, params));
    await page.init();
    return page;
  }

  async close() {
    try { await this.send("Browser.close"); } catch (e) { /* it may already be gone */ }
    this.socket.close();
    if (this.child) this.child.kill("SIGTERM");
  }
}

/* ------------------------------------------------------------------- the page */

class Page {
  constructor(browser, targetId, sessionId) {
    this.browser = browser;
    this.targetId = targetId;
    this.sessionId = sessionId;
    this.console = [];
    this.pageErrors = [];
    this.loaded = null;
  }

  send(method, params) { return this.browser.send(method, params, this.sessionId); }

  async init() {
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Log.enable");
    await this.send("Network.enable");
  }

  _event(method, params) {
    if (method === "Runtime.consoleAPICalled") {
      if (params.type === "error" || params.type === "warning") {
        this.console.push({
          type: params.type,
          text: (params.args || []).map((a) => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(" ")
        });
      }
    } else if (method === "Runtime.exceptionThrown") {
      const d = params.exceptionDetails || {};
      this.pageErrors.push(d.exception ? (d.exception.description || d.exception.value) : d.text);
    } else if (method === "Log.entryAdded") {
      const e = params.entry || {};
      if (e.level === "error") this.console.push({ type: "log", text: e.text + " " + (e.url || "") });
    } else if (method === "Page.loadEventFired") {
      if (this.loaded) { this.loaded(); this.loaded = null; }
    }
  }

  clearDiagnostics() {
    this.console = [];
    this.pageErrors = [];
  }

  async setViewport(width, height) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width, height, deviceScaleFactor: 1, mobile: false
    });
  }

  async goto(url) {
    const done = new Promise((resolve) => { this.loaded = resolve; });
    await this.send("Page.navigate", { url });
    await Promise.race([done, new Promise((r) => setTimeout(r, 20000))]);
  }

  /* Evaluate in the page. `fn` is a function serialised to source, so the harness
   * assertions live in normal JavaScript rather than in strings. */
  async evaluate(fn, ...args) {
    const expression = `(${fn.toString()}).apply(null, ${JSON.stringify(args)})`;
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      const d = result.exceptionDetails;
      throw new Error("page evaluate failed: " + (d.exception ? (d.exception.description || d.exception.value) : d.text));
    }
    return result.result.value;
  }

  async screenshot(file) {
    const { data } = await this.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    return file;
  }

  async close() {
    this.browser.sessionHandlers.delete(this.sessionId);
    await this.browser.send("Target.closeTarget", { targetId: this.targetId });
  }
}

module.exports = { Browser, Page, CHROME };
