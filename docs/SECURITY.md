# Tri-Ad Intellect Platform Security Specification

This document details the active production security parameters, architectural defenses, headers configuration, and anti-abuse policies used across the Tri-Ad Intellect MVP application.

---

## 1. Cloudflare Pages Functions Architecture

All backend APIs, including `/api/premium-order`, are implemented on a serverless microservices architecture utilizing Cloudflare Pages Functions. 
- API logic runs at edge latency without maintaining a persistent Express server or high-overhead virtual machines in production.
- Function requests are routed to `/functions/api/premium-order.ts` where they operate in a sandboxed V8 execution environment.

---

## 2. Beta Invite Code Protection

Access to the premium dossier request functionality is restricted via Beta Invite Codes.
- The administrator-configured `BETA_INVITE_CODE` environment variable restricts order placement.
- When configured on the server, any submission to `/api/premium-order` without a matching `inviteCode` is immediately rejected at the edge with an HTTP 403 Forbidden status.

---

## 3. Optional Cloudflare Turnstile CAPTCHA

To protect serverless mailing resources from automated bots, the system integrates a non-intrusive Cloudflare Turnstile constraint.
- **Client Render Check**: Enabled dynamically if `VITE_TURNSTILE_SITE_KEY` is present.
- **Server Siteverify Validation**: If `TURNSTILE_SECRET_KEY` is set in the serverless environment, the edge function performs an edge side-verification POST against the Turnstile API. Failed or missing tokens return an HTTP 400 Bad Request error.

---

## 4. Same-Origin & CORS Restrictions

To eliminate cross-site request forgery (CSRF) and cross-origin API abuse:
- The edge handler compares the input `Origin` header with the expected deployment server origin (`request.url`).
- If they do not match, the system rejects the transaction with an HTTP 403 Forbidden.

---

## 5. Body Size Limit Controls

To prevent memory or Denial of Service (DoS) attacks on edge workers with bloated or recursive payloads:
- A rigid content length restriction is active. The system evaluates the `Content-Length` header upfront.
- If the payload size exceeds 16KB (16,384 bytes), the worker aborts parsing immediately and returns an HTTP 413 Payload Too Large.

---

## 6. Rigid Schema Validation

Untrusted input payloads are sanitized and compiled strictly.
- Every client payload parsed is validated using a strict, structured schema (`src/server/premiumOrderSchema.ts`).
- Any extra fields are stripped, and incorrect types or missing fields cause the validator to reject the request instantly with an HTTP 400 Bad Request.

---

## 7. Server-Side Archetype Lookup

For absolute security and to prevent data forgery:
- The backend evaluates the profile code and performs the archetype lookup **on the server** utilizing the native code config dictionary (`src/utils.ts`).
- No client-supplied archetype text or score interpretations are trusted, preventing malicious payload injection or forged profile attributes.

---

## 8. Resend-Only Edge Email Path

Premium report dossier delivery is routed strictly through the **Resend SMTP HTTP API** via serverless edge calls.
- There is no client-side SMTP connection, preventing API key exposure in browser assets.
- Resend is configured entirely server-side (`RESEND_API_KEY`).

---

## 9. No SMTP/FormSubmit Fallbacks

To preserve delivery reliability and secret protection:
- The application relies purely on the serverless API path. 
- There are no insecure SMTP connections, generic mailto links, web scraping, or visual FormSubmit fallback methods. If the server-side API or credentials fail, clear feedback is provided without resorting to less secure alternatives.

---

## 10. LocalStorage Scope & Limitations

The sandbox stores assessment histories on the user's local browser partition.
- Sensitive credentials or session tokens are never stored inside standard `localStorage`.
- All stored profiles are scoped strictly to the origin browser domain, minimizing cross-scripting accessibility.

---

## 11. Complete User Data Deletion

To respect user privacy, compliance, and right-to-be-forgotten metrics:
- Users can clear all local profiles, assessment history logs, and cached diagnostic calculations directly from the dashboard settings.
- Triggering the local data wipe removes all localStorage records instantly and sets internal state engines to primitive defaults.

---

## 12. Security Headers & CSP Control

Visual protections and resource limits are injected at edge speeds into every server response via static configuration (`public/_headers`) as well asserverless headers functions:

### Edge Header Baseline:
```http
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com;
```

### Static vs. Dynamic Headers:
- Real static resources utilize `public/_headers`.
- Serverless API JSON handlers append explicit edge-compiled `securityHeaders()`:
  - `"Content-Type": "application/json; charset=utf-8"`
  - `"X-Content-Type-Options": "nosniff"`
  - `"Referrer-Policy": "strict-origin-when-cross-origin"`
