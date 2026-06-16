# Tri-Ad / Triad Intellect Baseline Audit Report

This document establishes a secure baseline of the Tri-Ad Intelligence Assessment platform before moving forward with production upgrades and cleanups.

---

## 1. Technical Framework & Build Tools

* **Frontend Engine:** React 19.2.7 and React DOM 19.2.7.
* **Backend Server:** Express 4.22.2 (Node.js runtime).
* **Styling Framework:** Tailwind CSS v4.3.0 integrated via `@tailwindcss/vite` plugin.
* **Development Server & Compiler:** Vite 6.4.3.
* **Production Server Bundler:** 
  * Frontend built to standard static files in `dist/`.
  * Node.js server compiled into a bundled CommonJS module `dist/server.cjs` and map via `esbuild` 0.25.12 to bypass strict ES module resolution constraints during production runtime.
* **Transpiler & Linter:** TypeScript 5.8.3 (`tsc --noEmit`).

---

## 2. Frontend Entry Points & File Systems

* **Main Entry File:** `/src/main.tsx` mounts the React application context into `index.html`.
* **Central Layout Controller:** `/src/App.tsx` coordinates state transitions between:
  * `"landing"`: Renders either the assessment startup options or the historical tracking charts.
  * `"quiz"`: Guides the user through a 30-question adaptive assessment.
  * `"results"`: Renders the composite radial/polar visualizations and career pathways.
* **Active UI Parts:**
  * `/src/components/LandingPage.tsx`: Handles user registrations and historical metrics.
  * `/src/components/AssessmentWizard.tsx`: Renders individual psychometric scenarios.
  * `/src/components/ResultsDashboard.tsx`: Displays macro and micro trait breakdowns, integrates visual graphics, and supports PDF generations.
* **Scoring Rules Setup:** 
  * `/src/questions.ts`: Contains the list of 30 questions grouped under IMAGINATION-PRIMED, INTUITION-PRIMED, and JUDGMENT-PRIMED headings.
  * `/src/types.ts`: Holds shared type declarations.
  * `/src/utils.ts`: Exposes raw scorer accumulators, dynamic bounds recalculation, and dimensional mapping dictionaries.

---

## 3. Backend & API Behavior

The custom backend is hosted in `/server.ts` and acts as a dual development server and API router:

* **Endpoint `/api/premium-order`:** Receives profile metrics and dispatches premium report requests.
* **Delivery Cascades:**
  1. **Resend API:** Triggers if `RESEND_API_KEY` is present.
  2. **SMTP Nodemailer:** Triggers if `SMTP_HOST` configuration is defined.
  3. **FormSubmit Fallback:** Delivers via keyless AJAX post request to `https://formsubmit.co/ajax/{RECEIVER_EMAIL}` if no custom secrets are configured.
* **Vite Middleware Mounting:** Runs Vite dev server in non-production environments to compile frontend assets dynamically. Under production build states, it falls back to serving static files from `/dist/`.

---

## 4. Environment Variables (`.env.example`)

* `GEMINI_API_KEY`: Required for Gemini developer integrations (injected at runtime via UI platform secrets).
* `APP_URL`: Self-referential URL of the deployment container.
* `RECEIVER_EMAIL`: Notification target inbox.
* `RESEND_API_KEY`: Secrets key for the Resend Email Service.
* `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Credentials used for secure SMTP transport fallback.

---

## 5. Risk Assessment & Analysis

### 1. Google AI Studio Traces
* **Finding:** Hardcoded URLs targeting developer sandbox domains are used as static fallback hosts for standard `Referer` and `Origin` request headers in `/server.ts` (e.g., lines 227–228 pointing to an `ais-dev-*.run.app` developer playground address).
* **Risk:** Leads to potential CORS anomalies and telemetry leak issues if the actual instance runs in production under a custom domain.

### 2. Unused Gemini Dependency
* **Finding:** `@google/genai` is listed as an active dependency inside `package.json` but is never imported or utilized in any backend or frontend modules.
* **Risk:** Adds build tree noise and increases overall dependency maintenance overhead.

### 3. Server Architecture Constraints on Serverless Environments (Cloudflare Pages)
* **Finding:** The backend architecture is a traditional, state-retaining Node.js Node Server (`express`). It relies on Node.js socket listeners (`app.listen(PORT, "0.0.0.0")`), `dns.setDefaultResultOrder`, and physical filesystem paths via `process.cwd()`.
* **Risk:** This architecture is fundamentally incompatible with standard serverless/edge-computing environments like Cloudflare Pages, which require non-blocking serverless edge handlers.

### 4. Server Bundle Emitted Directly into `dist/`
* **Finding:** The `build` script compiles the server code into `dist/server.cjs`. 
* **Risk:** Poses a potential risk where static asset routers serving `/dist` could expose backend artifacts if rules are misconfigured, though index fallbacks currently guard static serving.

### 5. Weak Validation on `/api/premium-order`
* **Finding:** The validation only verifies the presence of an `@` character in emails and check primitive fields like `name` and `profileCode` exist.
* **Risk:** The payload's properties (such as calculated score ratios and archetype specifications) are accepted directly from the client without backend verification. A user could spoof career paths or award themselves anomalous score profiles.

### 6. No Rate Limiting or Anti-Spam Protections
* **Finding:** No rate limiters, captcha barriers, or request throttles are configured inside Express. Captcha is explicitly disabled (`_captcha: "false"`) in the keyless FormSubmit relay fallback payload.
* **Risk:** Vulnerable to automated script attacks and high-volume billing spam on the Resend/FormSubmit transports.

### 7. Core Scoring Imbalance Risks
* **Finding:** Option weight values are hardcoded in `/src/questions.ts`. Some choices possess large negative coefficients (e.g., `-2`), skewing trait distribution if users pick specific non-linear chains.
* **Risk:** Dynamic boundary normalization offsets some of this skew, but it can still produce highly uneven profile allocations for fringe/extreme responders.

### 8. Overclaiming Psychometric Language
* **Finding:** Promos and descriptions use overly dramatic, pseudo-scientific, and artificial terms claiming "256-bit token integrity", "programmatically verified strict parameters", and "military/intel caliber diagnostic quadrants".
* **Risk:** Weakens professional user trust by presenting a gaming style interface labeled as an advanced psychological science platform.

### 9. LocalStorage Data Privacy Risks
* **Finding:** The entire record (including user full names, emails, raw scores, and complete archetype reports) is saved as unencrypted raw JSON directly inside browser-side `localStorage`.
* **Risk:** Exposed to shared workstation visibility and local machine security compromises.

### 10. Large Bundle Footprint
* **Finding:** The compiled production bundle includes `jspdf` and other complex layout modules, resulting in a main vendor bundle asset sizing of **1,130.72 kB**.
* **Risk:** Increases cold-start latency and increases initial page loads on slower 4G/mobile user segments.

---

## 6. Verification & Verification Log

### Command 1: `npm ci`
* **Status:** Passed Successfully
* **Log Output:**
```text
added 242 packages, and audited 243 packages in 7s
36 packages are looking for funding
```

### Command 2: `npm run lint` (tsc --noEmit)
* **Status:** Passed Cleanly
* **Log Output:**
```text
> react-example@0.0.0 lint
> tsc --noEmit
```

### Command 3: `npm run build`
* **Status:** Built Successfully (Vite + Esbuild Bundle)
* **Log Output:**
```text
vite v6.4.3 building for production...
transforming...
✓ 2332 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                              0.41 kB │ gzip:   0.28 kB
dist/assets/index-Bjfx4-wD.css              54.36 kB │ gzip:   9.38 kB
dist/assets/purify.es-V6uLfjnH.js           26.92 kB │ gzip:  10.17 kB
dist/assets/index.es-CwSbk4xW.js           159.80 kB │ gzip:  53.58 kB
dist/assets/html2canvas.esm-QH1iLAAe.js    202.38 kB │ gzip:  48.04 kB
dist/assets/index-DhrMGDSl.js            1,130.72 kB │ gzip: 337.66 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 7.28s

  dist/server.cjs      14.0kb
  dist/server.cjs.map  19.2kb

⚡ Done in 8ms
```

### Command 4: `npm audit --omit=dev`
* **Status:** Exited with code 1 (Vulnerability Alert Report Generated)
* **Log Output:**
```text
# npm audit report

dompurify  <3.4.9
DOMPurify: Trusted Types policy survives `clearConfig()` and can poison later `RETURN_TRUSTED_TYPE` output - https://github.com/advisories/GHSA-vxr8-fq34-vvx9
fix available via `npm audit fix`
node_modules/dompurify

esbuild  0.17.0 - 0.28.0
Severity: high
esbuild: Missing binary integrity verification in Deno module enables remote code execution via NPM_CONFIG_REGISTRY - https://github.com/advisories/GHSA-gv7w-rqvm-qjhr
esbuild allows arbitrary file read when running the development server on Windows - https://github.com/advisories/GHSA-g7r4-m6w7-qqqr
fix available via `npm audit fix --force`
Will install esbuild@0.28.1, which is a breaking change
node_modules/esbuild
node_modules/tsx/node_modules/esbuild
  vite  4.2.0-beta.0 - 8.0.3
  Depends on vulnerable versions of esbuild
  node_modules/vite

protobufjs  <=7.6.2
Severity: moderate
protobufjs : Schema-derived names can shadow runtime-significant properties - https://github.com/advisories/GHSA-f38q-mgvj-vph7
fix available via `npm audit fix`
node_modules/protobufjs

4 vulnerabilities (1 low, 1 moderate, 2 high)
```

---

## 7. Conclusions & Next Steps

1. **Baseline Stability Confirmed:** The application is fully compilation-safe. The client compiles cleanly under Vite + Tailwind CSS v4, and the Express backend correctly compiles to its CommonJS bundle segment without error.
2. **Preparatory Readiness:** The repository is primed for the next cleanup cycle without any breaking changes introduced during this audit step.
