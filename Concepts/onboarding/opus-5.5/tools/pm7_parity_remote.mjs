/* Local and remote use the identical virtual document and exact-byte CDP fulfillment.
 * No browser ever opens a controller filesystem or UNC path. */
export const parityDocumentUrl = 'file:///__pm7_parity__/input.html?o55=off&o55scenario=fresh&pm-warm=0';
export const storageProbeHtml = '<!doctype html><title>Storage isolation probe</title>';

export function remoteNetworkPolicy(remote) {
  // Block only reserved sampler markers before Fetch can pause them. URLPattern
  // is scheme-aware; legacy `urls` globs also match text inside SVG data URLs.
  return remote ? { urls: [], urlPatterns: [{ urlPattern: 'file:///__pm7_parity_asset__/*', block: true }] } : { urls: [] };
}

// A just-created about:blank target can still emit its load event after navigation
// starts. Match the navigation's loader, including events arriving before its reply.
export async function gotoRemoteDocument(send, on, url, timeout = 90_000) {
  let timer, expected, resolveLoad;
  const seen = new Set();
  const loaded = new Promise((resolve, reject) => {
    resolveLoad = resolve;
    timer = setTimeout(() => reject(Error('Remote document load timeout: ' + url)), timeout);
  });
  loaded.catch(() => {});
  const off = on('Page.lifecycleEvent', event => {
    if (event.name !== 'load') return;
    const key = event.frameId + ':' + event.loaderId; seen.add(key);
    if (key === expected) resolveLoad();
  });
  try {
    const result = await send('Page.navigate', { url });
    if (result.errorText) throw Error(result.errorText);
    if (!result.loaderId) throw Error('Remote input navigation did not create a document loader');
    expected = result.frameId + ':' + result.loaderId;
    if (seen.has(expected)) resolveLoad();
    await loaded;
  } finally { off(); clearTimeout(timer); }
}
