# Tri-Ad Intellect Platform Security Specification

This document details the active production security parameters, architectural defenses, headers configuration, and anti-abuse policies used across the Tri-Ad Intellect MVP application.

---

## 1. Edge-Level Security Headers (`public/_headers`)

When deploying on Cloudflare Pages, custom security headers are injected at edge speed into every server response via the static `/_headers` file. 

The active header configuration contains the following elements:

```http
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), autoplay=(), camera=(), clipboard-write=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self'; frame-src 'self' https://challenges.cloudflare.com; frame-ancestors 'self' https://*.google.com https://*.run.app https://ai.studio https://*.googleusercontent.com http://localhost:* http://127.0.0.1:*;
```

### Architectural Rationale:

1. **`X-Content-Type-Options: nosniff`**
   - Prevents browsers from sniffing response mime-types away from the declared headers (Mitigates MIME mutation attacks and drive-by content execution).

2. **`Referrer-Policy: strict-origin-when-cross-origin`**
   - Strips down path/query parameters from HTTP referrers when navigating to cross-origin services, ensuring that assessment results data stays strictly nested within internal route logic or is redacted.

3. **`Permissions-Policy: ...`**
   - Disables access to unused hardware parameters (cameras, geolocation, microphones, gyroscope sensors, payment trackers, etc.) inside the client browser. This minimizes the platform's execution footprint.

4. **`Content-Security-Policy` (CSP)**
   - **`default-src 'self'`**: Restricts loading of external static resources to the trusted deployment origin by default.
   - **`script-src`**: Restricts scripts to those delivered by the local build package (`'self'`), inline script mounts for runtime orchestration (`'unsafe-inline'`), and Cloudflare Turnstile Verification API challenge injection (`https://challenges.cloudflare.com`).
   - **`style-src` / `font-src`**: Allows styling and typefaces loaded locally or via Google Fonts secure CDNs (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`).
   - **`img-src 'self' data: https:`**: Restricts asset fetching to standard local images, encoded inline SVGs (`data:`), and image URLs derived securely from external endpoints.
   - **`frame-src`**: Restricts iframe loads to the Turnstile challenger widget (`https://challenges.cloudflare.com`).
   - **`frame-ancestors`**: Protects the site against Clickjacking UI redress attacks. By scoping frame ancestors to `'self'` plus Google-managed sandboxes (e.g., `https://*.google.com`, `https://*.run.app`, `https://ai.studio`, `https://*.googleusercontent.com`), the application is permitted to render properly in development sandbox previews, but rejected if embedded in malicious unverified third-party context frames.

---

## 2. Server-Side Data Protection

The premium order requisition endpoint `/api/premium-order` executes strict verification checks under standard, low-overhead REST mechanics, completely bypassing unsecured client payload trust:

1. **Security Integrity & No Client Poisoning**
   - The edge handler **excludes and ignores** any developer-supplied or client-side raw `archetype` parameter structures to prevent SQL/JSON payload injection or details forgery.
   - Group lookups are executed in a secured, local, type-checked environment strictly mapping valid credentials (e.g., `CDL`, `CDR`) with stored archetype templates in our production codebase helper utility (`src/utils.ts`).

2. **HTML Sanitization & Escaping**
   - All client inputs parsed in HTML reporting payloads (`name`, `email`) are passed through an encoding utility to escape hazardous syntax strings (`<`, `>`, `&`, `"`, `'`) into harmless HTML character references. This safeguards against injection attacks in email clients or notification channels.

3. **Strict Boundaries (Zero Persisted Footprint)**
   - Candidate email identifiers, assessment scoring variables, and macro vectors are utilized on-the-fly to construct and send the requested report dossiers, leaving no tracking traces or unencrypted files in database storages.

---

## 3. Anti-Abuse Controls & Rate Limiting

To minimize endpoint resource exhaustion, administrators can enable dual gates:

- **Invite Designators (`BETA_INVITE_CODE`)**: Blocks brute submission attempts for simple testers.
- **Turnstile Verification (`TURNSTILE_SECRET_KEY`)**: Ensures human presence dynamically.
- **Edge Rate Limiting (Cloudflare WAF)**: Enforced via Cloudflare rate limiting rules directly on `/api/premium-order` to prevent high-velocity DDoS attempts on email queues.
