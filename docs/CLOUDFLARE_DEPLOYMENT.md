# Cloudflare Pages Deployment

## Build Settings
Build command: npm run build
Build output directory: dist
Node version: 22

## Required Environment Variables
RESEND_API_KEY
RECEIVER_EMAIL
FROM_EMAIL
BETA_INVITE_CODE

## Optional Environment Variables
TURNSTILE_SECRET_KEY
VITE_TURNSTILE_SITE_KEY

## Required Cloudflare Setup
1. Create Pages project from GitHub repo.
2. Set build command to npm run build.
3. Set output directory to dist.
4. Add production secrets.
5. Add preview secrets separately if using preview deployments.
6. Deploy.
7. Test /api/premium-order from the deployed URL.

## Beta Deployment Rules
- BETA_INVITE_CODE must be configured before sharing the beta link.
- RESEND_API_KEY, RECEIVER_EMAIL, and FROM_EMAIL must be configured.
- Do not commit secrets to Git.
- Use preview deployment for internal smoke test before production beta.

## Smoke Test
- Visit landing page.
- Complete assessment.
- Generate results.
- Download PDF.
- Open premium modal.
- Submit with wrong invite code and confirm rejection.
- Submit with correct invite code and confirm email delivery.
- Confirm Resend receives exactly one email.

## Local Preview with Wrangler
Run the following locally if Wrangler is available:

```bash
npm run build
npx wrangler pages dev dist --compatibility-date=2026-06-16
```

Then verify your deployment's runtime state:
- Ensure the main page loads.
- Confirm client-side single-page app (SPA) refresh/reload routes work via fallback.
- Perform a GET request to `/api/premium-order` to confirm it returns a 405 Method Not Allowed error response with security headers.
- Perform a POST request to `/api/premium-order` with an incorrect invite code to verify it is rejected.
- Perform a POST request to `/api/premium-order` with the correct invite code and correct environment setup to confirm successful dispatch.
