# 🔮 Tri-Ad Cognitive Mapping Tool

Tri-Ad is an experimental cognitive mapping application designed to highlight subjective mental tendencies across **three core macro-dimensions** and **eight micro-traits**. Featuring a dynamic normalization engine, local state persistence, interactive SVG trajectory charts, and high-performance native PDF generation, Tri-Ad offers users a polished and secure portal for personal exploration and contemplation.

---

## 🌌 Core Methodology

Instead of static, binary personality assignments, Tri-Ad models cognition as a dynamic vector space. Points are tracked along three main vectors:

### 1. Imagination (`DIMENSION_01_SPARK`)
The generative spark representing conceptual plasticity, original formulation, and structural reconfiguration.
*   **Creativity (C):** Ability to project novel mental abstractions and original styles.
*   **Innovation (I):** Ability to restructure environments into unified, holistic systems.

### 2. Intuition (`DIMENSION_02_SENSE`)
Somatic feedback and subconscious pattern extraction from interactive surroundings.
*   **Physical (P):** Relies on somatic feedback loops and immediate spatial sensations.
*   **Metaphysical (M):** Perceives transcendental correlations, hidden motifs, and field values.
*   **Discernment (D):** Tactile truth-testing, critical analysis, and intellectual skepticism.

### 3. Judgment (`DIMENSION_03_DECIDE`)
The logical, qualitative, or temporal framework used to resolve friction points and key trade-offs.
*   **Logical (L):** Adherence to systemic metrics, formal proofs, and consistency.
*   **Emotional (E):** Empathetic resonance, relational ethics, and human warmth.
*   **Predictive (R):** Trend forecasting, timeline extrapolation, and proactive simulation.

---

## 🛠️ Performance Architecture & Formulas

### 1. Dynamic Score Scaling
To prevent structural biases caused by unequal choice pathways, the score utilizes a **Dynamic Min-Max Normalization** algorithm:

$$\text{Score} = \frac{\text{Raw Score} - \text{Theoretical Min}}{\text{Theoretical Max} - \text{Theoretical Min}} \times 100$$

Every click alters the theoretical minimum and maximum limits dynamically, guaranteeing all final metrics represent an objective, self-consistent percentage distribution.

### 2. The Archetype Selection Engine
Based on the calibrated scores, the subject is matched with one of the distinct three-letter archetype profiles (e.g., **ICP**, **LMD**, **ECR**) that determines their professional path suggestions:
*   **Custom Taglines:** Immediate conceptual hook.
*   **Extensive Descriptions:** Deeply researched archetype analysis.
*   **Sectors & Careers:** Actionable educational and career suggestions with bulleted pathways.

---

## 💎 Features

*   🎯 **Adaptive Assessment Terminal:** 30 carefully weighted, progressive-reveal interactive query cards with motion-backed navigation.
*   📊 **Saved Profiles & Progress Dashboard:** 100% locally persistent user profiles stored across browser refreshes and system shutdowns.
*   📈 **SVG Cognitive Trendlines:** Custom-crafted mathematical trace charts plotting your score shifts across subsequent assessments, complete with interactive node tags.
*   📄 **Double-Page Vector PDF Compiler:** Direct jsPDF compilation of a beautiful, printable vector portrait document.
*   📱 **Premium Native Share Portal:** Leveraging the **Web Share API** to share high-contrast text metrics directly to communication channels (Slack, Twitter, WhatsApp) or transmit the compiled PDF report natively.

---

## 🚀 Tech Stack

*   **Framework:** [React 18](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Styling & Design:** Elegant [Tailwind CSS](https://tailwindcss.com/) containing specialized sand/slate theme styling
*   **Typography:** Inter, JetBrains Mono font face pairing
*   **Animations:** Smooth custom transitions via [motion](https://motion.dev)
*   **Icons:** [Lucide React](https://lucide.dev)
*   **Report Generation:** [jsPDF Vector Engine](https://github.com/parallax/jsPDF)

---

## 🔒 Quality Gates & Automated CI

To maintain production stability and codebase health, Tri-Ad features automated quality gates powered by **GitHub Actions** (`.github/workflows/ci.yml`).

### What CI Validates
The automated pipeline executes on every branch push and on all incoming Pull Requests:
1. **Clean Installation (`npm ci`)**: Confirms all locked packages resolve securely without conflicts.
2. **Type Safety (`npm run typecheck`)**: Compiles TypeScript files and validates that there are zero type errors or undeclared bindings.
3. **Automated Testing Suite (`npm run test`)**: Ensures all 29 mock and edge calculations, state persistence actions, and server-side Edge functions pass their respective validation assertions.
4. **Production Bundler (`npm run build`)**: Compiles the client source code via Vite/esbuild to verify build configurations are free of compiler blocks or bad trees.
5. **Scoring Balance Reporting (`npm run analyze:scoring`)**: Generates fresh metrics diagnostics to verify math weights and archetype distributions (outputs to `/docs/SCORING_ANALYSIS.md`).
6. **Vulnerability Assessment (`npm audit --omit=dev`)**: Conducts a strict security audit of production-bound dependencies to prevent known package vulnerabilities.

### Running Checks Locally
Ensure your current sandbox is fully verified before committing or opening a pull request:

```bash
# 1. Install fresh packages with integrity
npm install

# 2. Compile and check TypeScript types
npm run typecheck

# 3. Execute unit tests locally
npm run test

# 4. Compile the production application bundle
npm run build

# 5. Review math balance and archetypes distribution
npm run analyze:scoring

# 6. Check production dependencies security for vulnerabilities
npm audit --omit=dev
```

---

## 🔮 Private Beta Deployment (Cloudflare Pages)

Tri-Ad is fully configured for a secure, serverless private beta deployment hosting 20–30 active cohort members using **Cloudflare Pages**:

*   **Zero-Server Decoupled Architecture**: Uses modern static asset hosting coupled with serverless Pages Functions (`/functions/api/premium-order.ts`) to handle form requisitions at edge latency. No complex VM configurations or Node servers are required in production.
*   **WAF & CAPTCHA Safeguards**: Includes optional backend verification with **Cloudflare Turnstile** and an invitation-only validation gate (`BETA_INVITE_CODE`) to prevent bot spam or uninvited order spikes.
*   **Privacy-First Offline Design**: Preserves assessor confidentiality by caching results locally in on-device storage, scrubbing email fields before writes, and ignoring raw client-supplied templates to resist payload tampering.

For step-by-step guidance on setting up environment secrets, managing Cloudflare Pages project connections, and reviewing testing methodologies, refer to:
- 📖 [BETA_READINESS.md](./docs/BETA_READINESS.md) for launch checks, calibration states, and rollback schemes.
- 📖 [CLOUDFLARE_DEPLOYMENT.md](./docs/CLOUDFLARE_DEPLOYMENT.md) for build, static fallback, and WAF rate-limiting policies.
- 📖 [SECURITY.md](./docs/SECURITY.md) for custom edge security headers (CSP, referrer options) and sanitization parameters.

---

Developed as an experimental, client-side self-reflection utility.
