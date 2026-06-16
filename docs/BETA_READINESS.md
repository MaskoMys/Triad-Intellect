# Tri-Ad Cognitive Assessor: Private Beta Readiness Report

This document specifies the current readiness parameters, configurations, instructions, and risk posture of the Tri-Ad Cognitive Assessor prior to the launch of our 20-30 person private beta on Cloudflare Pages.

---

## 1. Executive Summary & Readiness Level
The Tri-Ad MVP application is **Feature Complete** and ready for secure edge hosting. By using Cloudflare Pages edge hosting combined with serverless Cloudflare Pages Functions, we have completely decoupled our architecture from static server frameworks, ensuring lightning-fast load times, solid sandboxed environments, and zero persistent database surface attacks.

### Active Quality Status
- **Type Safety**: Passed (`tsc --noEmit` runs error-free).
- **Unit Testing**: Passed (100% assertions green on all 29 tests spanning formula boundaries, edge sanitizers, and validation limits).
- **Dependencies Risk**: Audited (0 high-severity production vulnerabilities remaining after implementing strict esbuild and DOMPurify overrides).
- **Edge Routing**: Configured (using standard `public/_headers` and `public/_redirects` protocols for edge speed and SPA refresh navigation stability).

---

## 2. Beta Scope: Module Breakdown

### A. What is Production Ready (Solid & Calibrated)
1. **Interactive Cognitive Assessment**:
   - 30 balanced multiple-choice items, evenly cataloged across Imagination (1-10), Intuition (11-20), and Judgment (21-30).
   - High-fidelity visual questionnaire with fluid entry transitions, live metrics counter, and reactive status gauges.
   - Comprehensive keyboard navigation bindings (Keys `1`, `2`, `3`, `4` select nodes directly; `Left Arrow` goes back, `Right Arrow` skips forward if answered).
2. **Symmetric Scoring Calibration Engine**:
   - Integrated expectation-centered piecewise linear normalization. Expected raw score is mathematically centered to `50` to eliminate historical "Sovereign Analyst" bias.
   - 100% reachability across all 18 symbolic archetypes with healthy relative occurrences (tested with a 100k Monte Carlo simulated test sweep).
3. **Advanced Results Dashboard**:
   - Interactive high-contrast interactive vector grids displaying both Micro Trait scoring matrices and Macro Cognitive profiles.
   - Responsive vector charts constructed via standard SVG elements for desktop precision and mobile flexibility.
   - Comprehensive offline historical logging node with clear records deletion ("Delete Attempt Node" and "Confirm Clear All Database" options) to respect user offline privacy.
4. **Offline PDF Assembly**:
   - Programmatic Client-side compilation engine compiled using raw `jsPDF` units safely bypassing server overhead.
   - Complete layout structure mapping vectors, career paths, and evaluation summaries directly into high-fidelity portable formats.
5. **Secure Serverless Requisition Delivery**:
   - `/api/premium-order` mapped cleanly to a serverless Cloudflare Edge Worker Function to ingest, validate, and broadcast report dossiers.
   - Complete payload sizing limit protection (strict 16KB restriction), email format checking, and input sanitization to prevent HTML injection attacks.

### B. What is Still Experimental or Developmental
1. **Turnstile CAPTCHA Protection**:
   - Integrates Cloudflare Turnstile inside the premium modal window conditionally based on the active existence of the site compilation key (`VITE_TURNSTILE_SITE_KEY`). If unconfigured, the widget is bypassed, keeping client access smooth.
2. **Resend Sandbox Constraints**:
   - If running Resend on an unverified test domain (e.g. `onboarding@resend.dev`), reports can only be transmitted to the verified admin email address configured in your Resend account dashboard. To open delivery to arbitrary client addresses, the domain must be verified on Resend's administrative settings.

---

## 3. Required Environment Variables

To successfully provision and start the application on the Cloudflare CDN, configure these variables in **Settings -> Environment Variables** inside your Pages project:

| Variable Identifier | Scope | Type / Sensitivity | Usage Explanation |
| :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | Pages Functions | Secret (Write-Only) | Direct authenticating token for Resend HTTP Email dispatch endpoints. |
| `RECEIVER_EMAIL` | Pages Functions | Secret (Write-Only) | The target manager inbox where generated dossiers and order cards are delivered. |
| `FROM_EMAIL` | Pages Functions | Plain Configuration | Sender address. Fallbacks to `onboarding@resend.dev` if blank. |
| `BETA_INVITE_CODE` | Pages Functions | Optional / Restricted | Secret key (e.g. `BETA30`) that blocks any premium requisitions without the code. |
| `VITE_TURNSTILE_SITE_KEY` | Vite Builder | Client-Side Public | Cloudflare Turnstile HTML site key. Activates CAPTCHA dynamically. |
| `TURNSTILE_SECRET_KEY` | Pages Functions | Secret (Write-Only) | Secret key to verify client Turnstile tokens at the Cloudflare edge. |

---

## 4. Cloudflare Pages Step-by-Step Deployment Guide

Follow these instructions to publish the repository onto Cloudflare Pages:

1. **Connect Repository**:
   - Log into your Cloudflare Dashboard and navigate to **Workers & Pages**.
   - Select **Create Application** -> **Pages** -> **Connect to Git**.
   - Select the target repository and authorize Cloudflare integrations.
2. **Configure Build Settings**:
   - **Framework Preset**: Choose `Vite` or `None`.
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Root Directory**: Leave blank (references the base repo `/`).
3. **Setup Environment Variables**:
   - Under the **Environment Variables** segment, configure your values (refer to Section 3 above).
   - Ensure `VITE_TURNSTILE_SITE_KEY` is configured under **Build variables** since Vite compile-steps bundle it directly into clients at build-time.
4. **Deploy Application**:
   - Click **Save and Deploy**. Cloudflare will run `npm run build`, bundle files, compile the edge function at `/functions/api/premium-order.ts`, and provide a production `*.pages.dev` domain.

---

## 5. Instructions for Beta Cohort Testers

When issuing access to your 20-30 beta cohort members, provide them with this instruction deck:

1. **Accessing the Assessment**:
   - Open the deployed `*.pages.dev` link in any mobile or desktop web browser.
2. **Navigating the Flow**:
   - Complete the 30 multiple-choice assessment questions. Testers can select answers by clicking/tapping options, or by pressing keys `1`, `2`, `3`, or `4` on their keyboards.
   - Navigate backward anytime by hitting `Left Arrow` or clicking the "Previous" block to review responses.
3. **Reviewing Calibration and History**:
   - Evaluate your resulted archetype details on the results dashboard.
   - Submit evaluation feedback using the **Beta Model Evaluation & Calibration Form** situated below the results card.
   - Confirm that deleting/clearing historical records works on your browser to verify unencrypted local storage safety.
4. **Upgrading and Testing the Delivery Gate**:
   - Click the premium upgrade CTA inside the dashboard.
   - Enter their delivery email address, and input the designated beta invite code (e.g. `BETA30`) if configured.
   - Check that the administrator receiver mailbox successfully gets the formatted email report of their results.

---

## 6. Known Limitations & Rollback Plan

### Limitations
- **Local Persistence Boundary**: Clearing the browser cookie/local storage cache or changing devices deletes all history, since data is stored on-device to respect user data sovereignty.
- **Client PDF Generation Overhead**: Generating PDFs on devices with extremely low RAM yields brief visual rendering stutters. This is expected since formatting occurs client-side in the JavaScript threat context.

### Rollback Plan
If an active beta release displays runtime anomalies or breaking states:
1. **GitHub Rollback**:
   - Revert the problematic commit on your primary branch (`main`/`master`).
   - Push to GitHub. Cloudflare Pages automatically triggers an incremental build to replace the current active deployment with the stable commit.
2. **Dashboard Rollback**:
   - Navigate to **Workers & Pages** -> **My Project** -> **Deployments**.
   - Browse previous deployment histories.
   - Click the menu button next to the last verified stable build and select **Rollback to this deployment**. This instantly points active request routers back to the previous stable state within 5 seconds.
