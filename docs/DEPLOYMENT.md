# Deployment Strategy

This document outlines the deployment strategy for the QRaft QR code generator project, a static Vite + React Single Page Application (SPA).

## Recommended Platform: Cloudflare Pages

We recommend **Cloudflare Pages** for deploying QRaft.
- **Unlimited bandwidth** on the free tier.
- **Fastest global edge CDN** for minimal latency worldwide.
- **Zero-config Vite support**, meaning minimal setup is required out of the box.
- **Excellent SPA routing** (automatic resolution of custom 404s to `index.html` with basic configuration).

## Alternatives

### Vercel
- **Pros:** Great Developer Experience (DX), excellent GitHub integration, preview deployments for PRs. Excellent for future SSR integration if the architecture evolves.
- **Cons:** Slightly more restrictive free tier compared to Cloudflare.

### Netlify
- **Pros:** Solid SPA support with easy `_redirects` configuration. Good free tier.

## Build Configuration

```bash
# Build command
npm run build
# or: pnpm build

# Output directory
dist/

# Node version
20.x
```

## Environment Variables

- **V1:** Has **NO** environment variables required for deployment (no backend, no API keys).
- **Future V2:** May require variables such as `VITE_API_URL` and `VITE_SHORTENER_ENDPOINT`.

## SPA Routing

For client-side routing to function correctly on page refreshes, you need to configure the hosting platform to rewrite all traffic to `index.html`.

- **Cloudflare Pages / Netlify:** Create a `public/_redirects` file with the following content:
  ```
  /* /index.html 200
  ```

- **Vercel:** Create a `vercel.json` file in the project root:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

## Performance Headers

To ensure rapid load times, configure caching headers aggressively for static assets while keeping the entry HTML fresh:

```http
# Cache static assets aggressively
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Don't cache index.html
/index.html
  Cache-Control: no-cache
```

## Security Headers

Applying standard security headers helps protect against common vulnerabilities (XSS, Clickjacking):

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Custom Domain

- **Primary Domain:** `qraft.dev` (or similar).
- **HTTPS:** Managed automatically by Cloudflare Pages, Vercel, or Netlify.

## CI/CD Pipeline

The deployment pipeline is fully automated via Git integrations provided by the hosting platform:
1. **Push** to the `main` branch.
2. **CI Runs:** Executes linting, type checking, unit tests, and the build process.
3. **Deploy:** If all checks pass, the build is deployed to production.
4. **Preview Deployments:** Automatically generated for pull requests to facilitate review.

## Monitoring

- **Cloudflare Web Analytics:** Free, privacy-respecting analytics without setting cookies.
- **V1:** No third-party analytics (e.g., Google Analytics).
- **Future:** Basic error reporting and telemetry via the free tier of tools like Sentry.
