# Reverse Proxy & Mobile Hardening

This document describes the security hardening features added to the GUI server for reverse proxy deployments and mobile access scenarios.

## Overview

The GUI server now includes configuration options to support:
1. **Reverse proxy deployments** - Trust `X-Forwarded-*` headers from a trusted reverse proxy
2. **CORS allowlist** - Specify allowed origins for cross-origin requests
3. **Token exposure protection** - Prevent auth token leakage to non-loopback clients

## Configuration Options

### Server Configuration (`ServerConfig`)

Three new options have been added to `ServerConfig`:

```typescript
interface ServerConfig {
  // ... existing options ...
  
  /** Trust proxy headers (X-Forwarded-For, X-Forwarded-Proto, etc.) */
  trustProxy?: boolean;
  
  /** CORS allowed origins allowlist (overrides corsOrigins when specified) */
  allowedOrigins?: string[];
  
  /** Allow token exposure in /api/auth/status for non-loopback requests */
  exposeTokenRemotely?: boolean;
}
```

### CLI Flags

The `gui` command now supports these flags:

```bash
# Trust proxy headers (for reverse proxy setups)
puppet-master gui --trust-proxy

# Specify allowed CORS origins (comma-separated)
puppet-master gui --allowed-origins "https://app.example.com,https://mobile.example.com"

# Allow token exposure for non-loopback requests (use with caution)
puppet-master gui --expose-token-remotely
```

## Security Model

### 1. Trust Proxy

**Default**: `false` (secure)

When enabled, the server will trust `X-Forwarded-*` headers from the reverse proxy:
- `X-Forwarded-For` - Client IP address
- `X-Forwarded-Proto` - Original protocol (http/https)
- `X-Forwarded-Host` - Original host header

**When to enable**:
- Running behind nginx, Apache, Traefik, or similar reverse proxy
- Need accurate client IP detection for security features
- Using HTTPS termination at the proxy level

**Example nginx configuration**:
```nginx
location / {
    proxy_pass http://localhost:3847;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
}
```

### 2. Allowed Origins

**Default**: `['http://localhost:3847']`

Specifies which origins are allowed to make cross-origin requests to the GUI server.

**When to configure**:
- Mobile app accessing the GUI server
- Web app hosted on a different domain
- Multiple frontend deployments

**Example**:
```bash
# Single origin
puppet-master gui --allowed-origins "https://app.example.com"

# Multiple origins
puppet-master gui --allowed-origins "https://app.example.com,https://mobile.example.com,https://staging.example.com"
```

### 3. Token Exposure Protection (Critical Security Feature)

**Default**: `false` (secure - only loopback)

By default, `/api/auth/status` only returns the auth token to **loopback requests** (localhost, 127.0.0.1, ::1). This prevents token leakage when the server is accessible from external networks.

#### How it works:

1. **Loopback requests** (localhost/127.0.0.1/::1):
   - Always receive the token (needed for local frontend)
   
2. **Non-loopback requests** (public IPs, LAN IPs):
   - Do NOT receive the token by default
   - Must explicitly enable `exposeTokenRemotely: true`

#### Request flow examples:

**Scenario 1: Local development (secure by default)**
```bash
# Server binds to localhost:3847
puppet-master gui

# Frontend on localhost can get token
curl http://localhost:3847/api/auth/status
# Returns: { "enabled": true, "token": "abc123..." }
```

**Scenario 2: Server bound to 0.0.0.0 (secure by default)**
```bash
# Server binds to all interfaces
puppet-master gui --host 0.0.0.0

# Local request gets token
curl http://localhost:3847/api/auth/status
# Returns: { "enabled": true, "token": "abc123..." }

# Remote request does NOT get token
curl http://192.168.1.100:3847/api/auth/status
# Returns: { "enabled": true, "token": undefined }
```

**Scenario 3: Behind reverse proxy (secure by default)**
```bash
# Server behind nginx, trust proxy enabled
puppet-master gui --trust-proxy

# Request from localhost gets token
curl http://localhost:3847/api/auth/status
# Returns: { "enabled": true, "token": "abc123..." }

# Request from public IP (via proxy) does NOT get token
curl https://api.example.com/api/auth/status
# X-Forwarded-For: 203.0.113.42
# Returns: { "enabled": true, "token": undefined }
```

**Scenario 4: Mobile app (requires explicit flag)**
```bash
# Mobile app needs token from external IP
puppet-master gui --trust-proxy --expose-token-remotely \
  --allowed-origins "https://mobile-app.example.com"

# Now remote requests can get token
curl https://api.example.com/api/auth/status
# Returns: { "enabled": true, "token": "abc123..." }
```

## Use Cases

### Use Case 1: Local Development
```bash
puppet-master gui
```
No special configuration needed. Token is automatically available to localhost.

### Use Case 2: Reverse Proxy (nginx/Traefik)
```bash
puppet-master gui --trust-proxy --allowed-origins "https://app.example.com"
```

**Why this is secure**:
- Token is NOT exposed to remote clients by default
- Clients must authenticate using the token (stored securely in the client app)
- CORS restricts which origins can make requests

### Use Case 3: Mobile App Development
```bash
puppet-master gui --host 0.0.0.0 --trust-proxy \
  --allowed-origins "http://localhost:19006,http://192.168.1.100:19006" \
  --expose-token-remotely
```

**Security considerations**:
- Only enable `exposeTokenRemotely` in trusted networks
- Use HTTPS in production
- Restrict `allowedOrigins` to known mobile app origins
- Consider using a separate auth mechanism for production mobile apps

### Use Case 4: Production Deployment
```bash
puppet-master gui --trust-proxy \
  --allowed-origins "https://app.example.com" \
  --no-open
```

**Production checklist**:
- ✅ Use HTTPS (terminate at reverse proxy)
- ✅ Enable `trustProxy` for accurate IP detection
- ✅ Restrict `allowedOrigins` to production domains only
- ✅ Keep `exposeTokenRemotely` disabled (default)
- ✅ Use strong auth tokens (default: 32 bytes)
- ✅ Secure token file with proper permissions
- ✅ Enable authentication (`--no-auth` should NEVER be used in production)

## Warning Messages

The CLI provides clear warnings when security-sensitive options are enabled:

### Trust Proxy Enabled
```
╔═══════════════════════════════════════════════════════════╗
║           ℹ️  Trust Proxy Enabled                         ║
╚═══════════════════════════════════════════════════════════╝

INFO: Trusting X-Forwarded-* headers from proxy
Make sure your reverse proxy is configured correctly!
```

### Token Exposed Remotely (Security Warning)
```
╔═══════════════════════════════════════════════════════════╗
║       ⚠️  SECURITY WARNING: Token Exposed Remotely       ║
╚═══════════════════════════════════════════════════════════╝

WARNING: Auth token is exposed to non-loopback requests!
/api/auth/status will return the token to ANY client.
This is a SECURITY RISK unless behind a trusted reverse proxy.
```

## Implementation Details

### Token Exposure Logic

The `isLoopbackRequest()` function determines if a request is from localhost.

Security notes:
- By default it uses `req.socket.remoteAddress` (unspoofable by headers)
- It only considers `req.ip` when `trust proxy` is enabled in Express (reverse proxy deployments)

```typescript
function isLoopbackRequest(req: Request): boolean {
  const trustProxy = Boolean(req.app?.get('trust proxy'));

  const isLoopbackIp = (ip: string): boolean => {
    if (ip === '::1') return true;
    if (ip.startsWith('127.')) return true;
    if (ip.startsWith('::ffff:127.')) return true;
    return false;
  };

  const remote = req.socket.remoteAddress || '';

  if (trustProxy) {
    if (isLoopbackIp(req.ip || '')) return true;
    if (!req.ip && isLoopbackIp(remote)) return true;
    return false;
  }

  return isLoopbackIp(remote);
}
```

The auth status handler checks this:

```typescript
const isLoopback = isLoopbackRequest(req);
const allowTokenExposure = isLoopback || (config.exposeTokenRemotely === true);

if (config.enabled && config.token && allowTokenExposure) {
  response.token = config.token;
}
```

### CORS Configuration

The server prioritizes `allowedOrigins` over `corsOrigins`:

```typescript
// Check if origin is in configured allowlist
if (this.config.allowedOrigins.includes(origin)) {
  callback(null, true);
  return;
}
```

Localhost is always allowed (security: prevents lockout during development).

## Testing

Comprehensive tests are included:

```bash
# Run auth middleware tests
npm test -- src/gui/auth-middleware.test.ts

# Run reverse-proxy hardening tests
npm test -- src/gui/reverse-proxy-hardening.test.ts
```

## Migration Guide

### For Existing Deployments

No changes required. All new features are:
- **Opt-in** (disabled by default)
- **Backward compatible**
- **Secure by default**

### For New Reverse Proxy Deployments

1. Enable trust proxy:
   ```bash
   puppet-master gui --trust-proxy
   ```

2. Configure allowed origins:
   ```bash
   puppet-master gui --allowed-origins "https://your-domain.com"
   ```

3. Keep token exposure disabled (default) for security

### For Mobile App Deployments

If you need token exposure (e.g., mobile app can't use localhost):

1. **Development**:
   ```bash
   puppet-master gui --host 0.0.0.0 --expose-token-remotely \
     --allowed-origins "http://localhost:19006"
   ```

2. **Production**: Implement a separate auth mechanism instead of exposing the token

## Security Best Practices

1. **Never use `--expose-token-remotely` in production** unless absolutely necessary
2. **Always use HTTPS** in production (terminate at reverse proxy)
3. **Restrict `allowedOrigins`** to known, trusted domains
4. **Enable `trustProxy`** only when behind a trusted reverse proxy
5. **Keep auth enabled** (never use `--no-auth` in production)
6. **Secure the token file** with appropriate file permissions
7. **Rotate tokens regularly** in production environments
8. **Use CORS relaxed mode** only for local development

## Troubleshooting

### Mobile app can't authenticate

**Symptom**: Mobile app gets `{ "enabled": true }` without token

**Solution**: 
```bash
puppet-master gui --expose-token-remotely --allowed-origins "your-app-origin"
```

### CORS errors from reverse proxy

**Symptom**: Browser shows CORS error despite `allowedOrigins` being set

**Solution**: Check that your reverse proxy is not stripping CORS headers. Add to nginx:
```nginx
add_header Access-Control-Allow-Origin $http_origin always;
```

### Token not working after proxy deployment

**Symptom**: Authenticated requests fail with 401

**Solution**: Enable trust proxy to get correct client IP:
```bash
puppet-master gui --trust-proxy
```

## Related Documentation

- [Authentication System](./auth-middleware.ts)
- [CORS Configuration](./server.ts)
- [CLI Commands](../cli/commands/gui.ts)
