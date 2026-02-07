/**
 * PWA Service Worker Registration
 * 
 * Registers service worker for offline support with safety checks.
 * Only registers in production builds to avoid dev issues.
 */

export interface ServiceWorkerRegistrationResult {
  registered: boolean;
  registration?: ServiceWorkerRegistration;
  error?: Error;
}

function isTauriBundledOrigin(): boolean {
  if (typeof window === 'undefined') return false;
  const origin = window.location.origin;
  if (origin.startsWith('tauri://')) return true;
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    return host === 'tauri.localhost' || host.endsWith('.tauri.localhost');
  } catch {
    return false;
  }
}

/**
 * Register service worker with safety checks
 * @returns Registration result
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistrationResult> {
  // Only register in production
  if (import.meta.env.DEV) {
    console.log('[PWA] Service worker registration skipped in development mode');
    return { registered: false };
  }

  // Desktop app runs in a bundled webview. Service workers can cache stale shells
  // across backend restarts/ports and cause "Load failed" behavior. Disable SW there.
  if (isTauriBundledOrigin()) {
    try {
      await unregisterServiceWorker();
    } catch {
      // best-effort cleanup
    }
    console.log('[PWA] Service worker disabled for bundled desktop webview');
    return { registered: false };
  }

  // Check if service worker is supported
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service workers not supported in this browser');
    return { 
      registered: false, 
      error: new Error('Service workers not supported') 
    };
  }

  try {
    console.log('[PWA] Registering service worker...');
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service worker registered successfully:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('[PWA] New service worker available');
          
          // Optionally notify user about update
          // You could dispatch a custom event here for UI notification
          const event = new CustomEvent('sw-update-available', { 
            detail: { registration } 
          });
          window.dispatchEvent(event);
        }
      });
    });

    return { 
      registered: true, 
      registration 
    };
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
    return { 
      registered: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Unregister all service workers (for debugging/cleanup)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const results = await Promise.all(
      registrations.map(registration => registration.unregister())
    );
    
    console.log('[PWA] Unregistered service workers:', results.length);
    return results.every(result => result === true);
  } catch (error) {
    console.error('[PWA] Failed to unregister service workers:', error);
    return false;
  }
}

/**
 * Check if PWA is installed (running in standalone mode)
 */
export function isPWAInstalled(): boolean {
  // Check if running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check iOS standalone mode
  const isIOSStandalone = (navigator as any).standalone === true;
  
  return isStandalone || isIOSStandalone;
}

/**
 * Check if running on mobile device
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
