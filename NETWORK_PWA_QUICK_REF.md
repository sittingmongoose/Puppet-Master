# Quick Reference: Network Settings & PWA

## For Users

### Enable Mobile/LAN Access
1. Open GUI → Config → Advanced tab
2. Enable "LAN Mode (Relaxed CORS)"
3. Click "Save Changes"
4. Restart the GUI server
5. Access from mobile: `http://YOUR_IP:3847`

### Install as Mobile App (PWA)
1. Open GUI in mobile browser (Chrome/Safari)
2. Tap "Share" → "Add to Home Screen" (or browser prompt)
3. App appears on home screen
4. Opens in fullscreen mode
5. Works offline for cached pages

### Setup Reverse Proxy
1. Configure nginx/Apache to forward to port 3847
2. Open GUI → Config → Advanced
3. Enable "Trust Proxy Headers"
4. Add your domain to "Allowed Origins": `https://yourdomain.com`
5. Save and restart server

## For Developers

### Config Structure
```typescript
interface Config {
  network?: {
    trustProxy?: boolean;           // Default: false
    allowedOrigins?: string[];      // Default: ['http://localhost:3847']
    corsRelaxed?: boolean;          // Default: false
  };
}
```

### Backend Integration
```typescript
// Apply settings to Express app
const config = await loadConfig();

if (config.network?.trustProxy) {
  app.set('trust proxy', true);
}

const corsOrigins = config.network?.allowedOrigins || ['http://localhost:3847'];
const corsRelaxed = config.network?.corsRelaxed || false;

// Use in CORS middleware (see server.ts for full implementation)
```

### Testing Network Settings
```bash
# Run network settings tests
cd src/gui/react
npm test -- Config.network.test.tsx

# Build and verify PWA assets
npm run build
ls -la dist/manifest.json dist/sw.js
```

### PWA Service Worker
- **Registers only in production** (`import.meta.env.DEV === false`)
- Cache strategy:
  - Static assets (HTML, CSS, JS): Cache-first with background update
  - API calls (`/api/*`, `/ws`): Network-first (always fresh data)
- Manual control:
  ```typescript
  import { unregisterServiceWorker } from '@/lib/pwa';
  await unregisterServiceWorker(); // Clear all caches
  ```

## Testing Checklist

### Network Settings
- [ ] Settings appear in Config → Advanced tab
- [ ] Intensive logging toggle still visible
- [ ] All checkboxes toggle correctly
- [ ] Origins input accepts comma-separated values
- [ ] Restart notice displayed
- [ ] Settings persist after save

### PWA Features
- [ ] manifest.json accessible at `/manifest.json`
- [ ] Service worker at `/sw.js`
- [ ] Meta tags in HTML `<head>`
- [ ] Install prompt appears on mobile
- [ ] App works offline (static pages)
- [ ] API calls work online (no stale data)

### Mobile Access
- [ ] LAN mode enables access from other devices
- [ ] Mobile browser can load GUI
- [ ] Touch interactions work smoothly
- [ ] Viewport scales correctly
- [ ] Install prompt appears

### Reverse Proxy
- [ ] Trust proxy setting enables X-Forwarded-* headers
- [ ] Custom domain added to allowed origins
- [ ] CORS works with proxy setup
- [ ] Client IP detected correctly behind proxy

## Troubleshooting

### "Access denied" from mobile device
- Check LAN mode enabled in Config
- Verify firewall allows port 3847
- Confirm server bound to 0.0.0.0 (not just localhost)
- Check IP address is correct

### PWA not installing
- Service worker only works on HTTPS or localhost
- Check browser console for errors
- Verify manifest.json accessible
- Try clearing browser cache

### CORS errors after enabling custom domain
- Add domain to "Allowed Origins" (exact match)
- Include protocol: `https://` or `http://`
- Restart server after changes
- Check browser console for actual blocked origin

### Service worker not updating
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Or manually unregister:
  ```javascript
  navigator.serviceWorker.getRegistrations().then(regs => 
    regs.forEach(reg => reg.unregister())
  );
  ```

## File Locations

```
src/gui/react/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── favicon.svg            # App icon
├── src/
│   ├── lib/
│   │   └── pwa.ts             # PWA utilities
│   ├── pages/
│   │   ├── Config.tsx         # Network settings UI
│   │   └── Config.network.test.tsx  # Tests
│   ├── main.tsx               # SW registration
│   └── index.html             # PWA meta tags
└── dist/                      # Build output (gitignored)
```

## Environment Variables

```bash
# Development - service worker disabled by default
npm run dev

# Production - service worker enabled
npm run build
npm run preview
```

## Support Matrix

| Feature              | Chrome | Safari | Firefox | Edge  |
|---------------------|--------|--------|---------|-------|
| PWA Install         | ✅     | ✅ iOS | ⚠️ Part | ✅    |
| Service Worker      | ✅     | ✅     | ✅      | ✅    |
| Offline Support     | ✅     | ✅     | ✅      | ✅    |
| Home Screen Icon    | ✅     | ✅ iOS | ❌      | ✅    |
| Standalone Mode     | ✅     | ✅ iOS | ❌      | ✅    |

✅ Full support | ⚠️ Partial support | ❌ Not supported

---

**Last Updated**: January 30, 2025
**Version**: 1.0.0
