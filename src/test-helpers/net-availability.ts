import { createServer } from 'node:http';

/**
 * Some sandboxed environments disallow opening listening sockets (even on loopback),
 * which causes integration tests that use supertest or start real HTTP servers to crash.
 *
 * This helper detects whether binding a loopback TCP port is permitted.
 */
export async function canListenOnLoopback(timeoutMs = 250): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    const server = createServer((_req, res) => {
      res.statusCode = 200;
      res.end('ok');
    });

    const timer = setTimeout(() => {
      try {
        server.close();
      } catch {
        // ignore
      }
      settle(false);
    }, timeoutMs);

    server.on('error', () => {
      clearTimeout(timer);
      settle(false);
    });

    server.listen(0, '127.0.0.1', () => {
      clearTimeout(timer);
      server.close(() => {
        settle(true);
      });
    });
  });
}

