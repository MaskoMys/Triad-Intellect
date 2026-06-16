# Cloudflare Pages Deployment Configuration Guide

This manual details how to successfully deploy and route the Tri-Ad Intellect MVP application onto Cloudflare Pages using its static asset serving and serverless Pages Functions.

## 1. Hosting Environment Settings

When configuring your project in the Cloudflare Pages dashboard, input the following build settings:

- **Framework Preset**: None / Vite (or choose `Vite`)
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Node.js Version**: `18+` or `20+`

---

## 2. Serverless API Routing (Pages Functions)

Cloudflare Pages automatically processes functions declared inside the `/functions` directory. 
- The endpoint `/api/premium-order` is served by the Serverless Worker code located at: `/functions/api/premium-order.ts`
- Cloudflare will build this function dynamically during build-time and serve it at edge latency.
- There is no need for high-overhead Node.js Express VMs or custom bundle processes in production.
- Express (`express`) and NodeMailer (`nodemailer`) are loaded purely as local development utilities.

---

## 3. Required Environment Variables

Configure these variables within the Cloudflare Pages Dashboard under **Settings -> Environment Variables** (both for Production and Preview environments) to unlock secure premium dossier transmission:

| Variable Name | Required | Description | Default / Example Value |
| :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | **Yes** | Auth token for Resend HTTP Email API dispatch. | `re_123456789...` |
| `RECEIVER_EMAIL` | **Yes** | Target inbox email where premium order dossiers are sent. | `team@yourdomain.com` |
| `FROM_EMAIL` | No | Verification sender email template. Falls back of SENDER_EMAIL or onboarding domain. | `orders@yourdomain.com` |
| `BETA_INVITE_CODE` | No | Beta invite code key (e.g. `BETA30`). If set, blocks uninvited orders. | `BETA30` |
| `VITE_TURNSTILE_SITE_KEY` | No | **Site Key** for client-side challenge rendering (set at Vite compile). | `0x4AAAAAA...` |
| `TURNSTILE_SECRET_KEY` | No | **Secret Key** for backend Turnstile siteverify server checks. | `0x4AAAAAA...` |

> ✦ **Security Integrity**: To ensure absolute privacy, the code contains no hardcoded recipient emails. If the required environment credentials are not present in your Cloudflare dashboard, the endpoint returns a clean server configuration message (HTTP 500) rather than failing cryptically or leaking variables. All user-supplied fields are securely escaped before compilation to prevent HTML injection attacks.

---

## 4. Beta Access Protection & Anti-Abuse (WAF / Turnstile)

To protect the exploratory premium-order requisition endpoint from excessive automation or spam, the system supports dual-action gates:

### A. Beta Invitation Code
Configure `BETA_INVITE_CODE` in the Pages environment variables dashboard (e.g., `BETA30`). 
- When set, any user trying to submit an order from the Results Dashboard modal **must** enter a matching invitation code, or their request is rejected at the edge with an HTTP 403.
- This creates an effective gate for closed beta cohorts (20-30 active testers) without requiring registration forms.

### B. Cloudflare Turnstile CAPTCHA (Optional)
For automated attack protection, configure conditional Turnstile support securely:
1. **Frontend Widget Configuration**: Add the environment variable `VITE_TURNSTILE_SITE_KEY` during your Vite build settings compilation. The client application checks this key at load; if present, it dynamically imports and mounts the interactive Cloudflare Turnstile widget directly within the order dialog.
2. **Backend Token Verification**: Add the environment variable `TURNSTILE_SECRET_KEY` into your Pages Dashboard. If present, the `/api/premium-order` edge function executes a robust server-side HTTP POST verification against Cloudflare's `siteverify` endpoint. Any missing/forged tokens trigger an HTTP 400 rejection immediately.

### C. Rate Limiting via Cloudflare Pages / WAF
To enforce production rate limiting against brute-force attempts on `/api/premium-order`, configure Rate Limiting rules directly in your Cloudflare Dashboard:
1. Navigate to **Security -> WAF -> Rate Limiting Rules** in your zone.
2. Click **Create rule**.
3. Define the matching criteria:
   - **Field**: `URI Path`
   - **Operator**: `equals`
   - **Value**: `/api/premium-order`
4. Set the rate limit threshold:
   - **Rate**: e.g., `3 requests` over a period of `1 minute` (from a single IP).
   - **Action**: `Block` or `Block (Temporarily)`.
5. Save and deploy. This prevents malicious API abuse directly at the Cloudflare CDN layer, keeping serverless execution completely free of resource drain.

---

## 5. Local Development Sandbox

To run the full stack sandbox locally with functional proxy endpoints:
```bash
npm run dev
```
This mounts the archived development-only Express server which wraps Vite in development mode to simulate serverless responses on port `3000`.
