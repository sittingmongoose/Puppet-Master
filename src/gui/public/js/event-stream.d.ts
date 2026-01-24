/**
 * TypeScript shim for the browser-only `event-stream.js` script.
 *
 * The real implementation is a classic script that attaches `EventStream` to `globalThis`.
 * It does not export any module members, but tests import it for side effects.
 */

declare module './event-stream.js' {
  export {};
}

export {};

