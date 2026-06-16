# Scoring, Weight & Archetype Balance Report

This diagnostic assessment report was generated automatically via the Developer Diagnostics System to analyze the balance, reachability, and distribution of the Tri-Ad Cognitive Archetype Mapper.

---

## 1. Core Instrumentation Metrics

* **Total Questions:** 30 (divided equally across ID: 1-10 Imagination, 11-20 Intuition, 21-30 Judgment)
* **Total Options Evaluated:** 120 (mean options per node: 4.00)
* **Theoretical Total Archetypes:** 18

---

## 2. Trait Boundary Ranges (Mathematical Min / Max)

Theoretical minimum and maximum raw scores attainable per trait based on programmatic min-max boundary scanning:

| Trait Identifier | Minimum Attainable | Maximum Attainable | Range Span |
| :--- | :---: | :---: | :---: |
| **Creativity (C)** | -13 | 44 | 57 |
| **Innovation (I)** | -7 | 36 | 43 |
| **Physical (P)** | -4 | 45 | 49 |
| **Metaphysical (M)** | -3 | 45 | 48 |
| **Discernment (D)** | -10 | 42 | 52 |
| **Logical (L)** | -31 | 55 | 86 |
| **Emotional (E)** | -21 | 38 | 59 |
| **Predictive (R)** | -7 | 53 | 60 |

---

## 3. Weight Frequencies and Alignment Counts

Distribution of raw weight assignments within the option nodes:

| Trait Identifier | Positive Weights (>0) | Negative Weights (<0) | Net Zero / Omitted (0) |
| :--- | :---: | :---: | :---: |
| **Creativity (C)** | 38 | 14 | 68 |
| **Innovation (I)** | 25 | 7 | 88 |
| **Physical (P)** | 34 | 4 | 82 |
| **Metaphysical (M)** | 33 | 3 | 84 |
| **Discernment (D)** | 46 | 9 | 65 |
| **Logical (L)** | 59 | 27 | 34 |
| **Emotional (E)** | 25 | 18 | 77 |
| **Predictive (R)** | 35 | 9 | 76 |

### Node Count Breakdown by Weight Values

Detailed counts of custom coefficient assignments per trait:

* **Creativity (C):** `[w=-1]`: 14, `[w=0]`: 68, `[w=1]`: 22, `[w=2]`: 16
* **Innovation (I):** `[w=-2]`: 1, `[w=-1]`: 6, `[w=0]`: 88, `[w=1]`: 8, `[w=2]`: 17
* **Physical (P):** `[w=-1]`: 4, `[w=0]`: 82, `[w=1]`: 18, `[w=2]`: 16
* **Metaphysical (M):** `[w=-2]`: 1, `[w=-1]`: 2, `[w=0]`: 84, `[w=1]`: 16, `[w=2]`: 17
* **Discernment (D):** `[w=-2]`: 1, `[w=-1]`: 8, `[w=0]`: 65, `[w=1]`: 32, `[w=2]`: 14
* **Logical (L):** `[w=-2]`: 8, `[w=-1]`: 19, `[w=0]`: 34, `[w=1]`: 33, `[w=2]`: 26
* **Emotional (E):** `[w=-2]`: 5, `[w=-1]`: 13, `[w=0]`: 77, `[w=1]`: 9, `[w=2]`: 16
* **Predictive (R):** `[w=-2]`: 1, `[w=-1]`: 8, `[w=0]`: 76, `[w=1]`: 12, `[w=2]`: 23

---

## 4. Monte Carlo Simulation Result Profiles

Simulated outputs from **100,000** randomized responder runs, establishing real reachability metrics:

| Archetype Code | Description Identifier | Simulated Hits | Percentage Allocation |
| :--- | :--- | :---: | :---: |
| **IDL** | The Master Systems Optimizer | 14,153 | 14.15% |
| **CME** | The Transcendent Catalyst | 13,633 | 13.63% |
| **CDL** | The Sovereign Analyst | 9,073 | 9.07% |
| **IPE** | The Somatic Facilitator | 8,368 | 8.37% |
| **CPE** | The Somatic Storyteller | 7,837 | 7.84% |
| **CMR** | The Esoteric Seer | 5,858 | 5.86% |
| **IPL** | The Logistics Commander | 5,823 | 5.82% |
| **IDR** | The Systems Futurist | 4,611 | 4.61% |
| **CML** | The Alchemist-Philosopher | 3,943 | 3.94% |
| **IME** | The Community Weaver | 3,870 | 3.87% |
| **CDE** | The Ethical Jurist | 3,796 | 3.80% |
| **IPR** | The Predictive Engineer | 3,617 | 3.62% |
| **CDR** | The Temporal Strategist | 3,302 | 3.30% |
| **IMR** | The Evolutionary Prophet | 3,106 | 3.11% |
| **IDE** | The Organizational Integrator | 2,746 | 2.75% |
| **CPL** | The Tactile Craftsman | 2,431 | 2.43% |
| **IML** | The Technomancer Architect | 1,968 | 1.97% |
| **CPR** | The Somatic Forecaster | 1,865 | 1.86% |

### ⚠️ Reachability Risk & Skew Analysis

* **Highly Reachable / High Concentration (>= 10%):**
  * **IDL** (14.15%)
  * **CME** (13.63%)

* **Under-represented / Hard to Reach (< 1.5%):**
  * None

* **Unreachable or Extinct Nodes (< 0.1%):**
  * None

---

## 5. Architectural Findings & Key Takeaways

1. **Uniform Alignment:** The 30 questions are modularly balanced across structural dimensions, but option layouts and negative coefficients introduce minor skews.
2. **Archetype Coverage:** Every one of the 18 possible archetype codes in the mapper represents a valid and reachable cognitive posture.
3. **Reflective Intent:** The dynamic min-max normalization guarantees that even with fringe responder options, the final calculations scale cleanly from 0-100 without bounds overflow.

---

## 6. Rebalancing Notes & Methodology

### What Changed
* **Negative Weight Corrections:** Introduced targeted negative weights (e.g. `[w=-1]` or `[w=-2]`) for under-assigned scales—particularly `predictive` (R) and `innovation` (I)—on option nodes where selecting them signifies the opposite of that trait.
* **Piecewise Linear Normalized Centering:** Replaced the simple min-max percentage formula (`((raw - min) / (max - min)) * 100`) with an expectation-centered piecewise linear scaling function. Under this revised formulation, the mathematical expected raw level for each trait under uniform random options maps exactly to `50`. Values below expectation scale smoothly from `0` to `50`, and values above scale from `50` to `100`.

### Why It Changed
* **Elimination of Structural Skews:** Initially, the "Sovereign Analyst" (**CDL**) grabbed over `42%` of random responses while six other archetypes were virtually unreachable `(<0.05%)`. This occurred because some scales (like Logical and Discernment) were pre-loaded with high positive coefficients, whilst others (like Predictive) had none.
* **Symmetric Reachability:** Mapping the random expectation to `50` ensures that all 18 symbolic archetypes are fully reachable in simulated environments and represents healthy cognitive balance.

### Known Limitations
* **Theoretical Grounding only:** Monte Carlo simulations assume uniform random responders (selecting options with equal probability). In real human deployments, self-reporting biases and correlations between traits exist.
* **Reflective Tooling Status:** This scoring model is built strictly for experimental personal contemplation and self-reflection. It is not designed to provide, nor does it claim, psychological, scientific, or clinical/medical diagnostic validity.
