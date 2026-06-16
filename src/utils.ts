import { Question, TraitWeights, TraitBounds, TraitScores, MacroScores, ArchetypeDetails, TraitKey } from "./types";
import { questions } from "./questions";

export const traits: TraitKey[] = [
  'creativity',
  'innovation',
  'physical',
  'metaphysical',
  'discernment',
  'logical',
  'emotional',
  'predictive'
];

export const traitLabels: Record<TraitKey, string> = {
  creativity: "Creativity (C)",
  innovation: "Innovation (I)",
  physical: "Physical (P)",
  metaphysical: "Metaphysical (M)",
  discernment: "Discernment (D)",
  logical: "Logical (L)",
  emotional: "Emotional (E)",
  predictive: "Predictive (R)"
};

export const traitDescriptions: Record<TraitKey, string> = {
  creativity: "Capacity to generate highly original, symbolic, or abstract concepts.",
  innovation: "Capacity to combine, reconfigure, and optimize existing systems for practical execution.",
  physical: "Sensitivity to physical dynamics, body language, sensory environments, and direct observation.",
  metaphysical: "Sensitivity to subtle energies, spiritual experiences, dreaming, and non-material connections.",
  discernment: "The analytical filter that balances patterns against objective boundaries; intuitive truth-testing.",
  logical: "Dedication to consistency, process fairness, structured data, and mechanical rules.",
  emotional: "Dedication to human impact, harmony, interpersonal context, and emotional resonance.",
  predictive: "Dedication to temporal patterns, historical trends, and systemic forecasting."
};

// Calculate expected values under uniform random answering for each trait
export function computeTraitExpectations(questionsList: Question[]): TraitWeights {
  const expectations: TraitWeights = {
    creativity: 0,
    innovation: 0,
    physical: 0,
    metaphysical: 0,
    discernment: 0,
    logical: 0,
    emotional: 0,
    predictive: 0
  };

  questionsList.forEach(q => {
    const qSum: Record<TraitKey, number> = {
      creativity: 0,
      innovation: 0,
      physical: 0,
      metaphysical: 0,
      discernment: 0,
      logical: 0,
      emotional: 0,
      predictive: 0
    };
    q.options.forEach(opt => {
      traits.forEach(trait => {
        qSum[trait] += opt.weights[trait] ?? 0;
      });
    });
    traits.forEach(trait => {
      expectations[trait] += qSum[trait] / q.options.length;
    });
  });

  return expectations;
}

export const traitExpectations = computeTraitExpectations(questions);

// Programmatically calculate lowest/highest possible raw weightings for each trait on app boot
export function computeTraitBounds(questionsList: Question[]): TraitBounds {
  const bounds: Partial<TraitBounds> = {};

  traits.forEach(trait => {
    let minSum = 0;
    let maxSum = 0;

    questionsList.forEach(q => {
      let optionMin = Infinity;
      let optionMax = -Infinity;

      q.options.forEach(opt => {
        const w = opt.weights[trait] ?? 0;
        if (w < optionMin) optionMin = w;
        if (w > optionMax) optionMax = w;
      });

      // Handle cases where infinity was somehow untouched (defaults to 0)
      minSum += optionMin === Infinity ? 0 : optionMin;
      maxSum += optionMax === -Infinity ? 0 : optionMax;
    });

    bounds[trait] = { min: minSum, max: maxSum };
  });

  return bounds as TraitBounds;
}

// Compute raw accumulations for a given response set (selected option indices mapped to question ids)
export function computeRawUserScores(
  questionsList: Question[],
  responses: Record<number, number>
): TraitWeights {
  const rawScores: TraitWeights = {
    creativity: 0,
    innovation: 0,
    physical: 0,
    metaphysical: 0,
    discernment: 0,
    logical: 0,
    emotional: 0,
    predictive: 0
  };

  questionsList.forEach(q => {
    const selectedIdx = responses[q.id];
    if (selectedIdx !== undefined && q.options[selectedIdx]) {
      const weights = q.options[selectedIdx].weights;
      traits.forEach(trait => {
        rawScores[trait] += weights[trait] ?? 0;
      });
    }
  });

  return rawScores;
}

// Normalize raw user scores using dynamic bounds and centered expectations
export function normalizeScores(
  rawScores: TraitWeights,
  bounds: TraitBounds
): TraitScores {
  const normalized: Partial<TraitScores> = {};

  traits.forEach(trait => {
    const { min: rawMin, max: rawMax } = bounds[trait];
    const rawUser = rawScores[trait];
    const rawExp = traitExpectations[trait];

    if (rawMax === rawMin) {
      normalized[trait] = 50; // Safeguard division-by-zero
    } else if (rawUser === rawExp) {
      normalized[trait] = 50;
    } else if (rawUser < rawExp) {
      // Scale from rawMin to rawExp -> 0 to 50
      if (rawExp === rawMin) {
        normalized[trait] = 50;
      } else {
        const pct = ((rawUser - rawMin) / (rawExp - rawMin)) * 50;
        normalized[trait] = Math.max(0, Math.min(50, pct));
      }
    } else {
      // Scale from rawExp to rawMax -> 50 to 100
      if (rawMax === rawExp) {
        normalized[trait] = 50;
      } else {
        const pct = 50 + ((rawUser - rawExp) / (rawMax - rawExp)) * 50;
        normalized[trait] = Math.max(50, Math.min(100, pct));
      }
    }
  });

  return normalized as TraitScores;
}

// Consolidate normalized sub-traits to produce macro-dimensional scores
export function consolidateMacroScores(scores: TraitScores): MacroScores {
  const imagination = (scores.creativity + scores.innovation) / 2;
  const intuition = (scores.physical + scores.metaphysical + scores.discernment) / 3;
  const judgment = (scores.logical + scores.emotional + scores.predictive) / 3;

  return {
    imagination: Math.round(imagination * 10) / 10,
    intuition: Math.round(intuition * 10) / 10,
    judgment: Math.round(judgment * 10) / 10
  };
}

// Generate the unique three-letter profile code
export function generateProfileCode(scores: TraitScores): string {
  // First Letter (Imagination): 'C' if Creativity > Innovation, else 'I'
  const first = scores.creativity > scores.innovation ? 'C' : 'I';

  // Second Letter (Intuition): 'M' if Metaphysical is highest, 'P' if Physical, 'D' if Discernment.
  // Tiebreak: Discernment takes precedence, followed by Physical, then Metaphysical.
  const m = scores.metaphysical;
  const p = scores.physical;
  const d = scores.discernment;
  const maxIntuitionValue = Math.max(m, p, d);

  let second = 'M';
  if (d === maxIntuitionValue) {
    second = 'D';
  } else if (p === maxIntuitionValue) {
    second = 'P';
  } else {
    second = 'M';
  }

  // Third Letter (Judgment): 'L' if Logical is highest, 'E' if Emotional, 'R' if Predictive.
  // Tiebreak: Logical takes precedence, followed by Predictive, then Emotional.
  const l = scores.logical;
  const e = scores.emotional;
  const r = scores.predictive;
  const maxJudgmentValue = Math.max(l, e, r);

  let third = 'E';
  if (l === maxJudgmentValue) {
    third = 'L';
  } else if (r === maxJudgmentValue) {
    third = 'R';
  } else {
    third = 'E';
  }

  return `${first}${second}${third}`;
}

// Generate descriptive profiles for the 18 combinations
export function getArchetype(code: string): ArchetypeDetails {
  const lookup: Record<string, Omit<ArchetypeDetails, 'code'>> = {
    "CDL": {
      name: "The Sovereign Analyst",
      tagline: "Empirical Imagination grounded in Uncompromising Logic",
      description: "You represent a potent integration of pure creative generation and structural containment. You construct visionary, abstract theories but filter them relentlessly through empirical reality and logical systems before presenting them. You enjoy testing boundary limits while ensuring rules remain balanced.",
      strengths: ["Highly original yet rigorously logical", "Unbiased truth-testing of ideas", "Excellent technical system design modeler"],
      challenges: ["Can exhibit analyze-to-paralysis loops", "May come across as intellectual or overly skeptical", "Reluctant to move ahead without perfect structural proof"],
      careerPaths: ["Quantum Algorithm Architect", "R&D Strategic Director", "Complex Cryptographer", "Scientific Philosopher"]
    },
    "CDR": {
      name: "The Temporal Strategist",
      tagline: "Unlocking Long-term Horizons through Conceptual Clarity",
      description: "You combine original creative vision with rigorous testing and chronological forecasting. You look at trends and long waves, predicting exactly how abstract concepts will play out in the deep future. Your analytical shield protects your creative sparks from moving in unstable directions.",
      strengths: ["Long-range macro systemic vision", "Pristine predictive models of novel tech", "Highly defensive yet creative project director"],
      challenges: ["Risk of detachment from current real-world execution", "Overly focus on long horizons while ignoring immediate pain-points", "Complex formulations can confuse peers"],
      careerPaths: ["Futurologist & Policy Modeler", "Systems Architect", "Venture Capital Macro Analyst", "Climate Risk Modeler"]
    },
    "CDE": {
      name: "The Ethical Jurist",
      tagline: "Harmonizing abstract theories with deep human empathy",
      description: "You possess a rare alignment of pure imagination, high-contrast discernment, and deep emotional sensitivity. You use original thinking to resolve relational blockages, creating systems that prioritize human welfare, morale, and interpersonal harmony while checking them against high objective benchmarks.",
      strengths: ["Combines intense empathy with sharp objective boundaries", "Brilliant creative conflict mediator", "Promoter of psychological safety inside advanced teams"],
      challenges: ["Internal friction between objective thresholds and emotional calls", "Prone to carrying the psychological weight of the team", "Takes criticism of abstract models personally"],
      careerPaths: ["AI Ethics Commissioner", "Human-Centered Design Lead", "Advanced Organizational Mediator", "Educational Architect"]
    },
    "CPL": {
      name: "The Tactile Craftsman",
      tagline: "Bridging visceral sensory details with systemic structures",
      description: "You possess a rich imagination anchored directly to physical environments and structured physical laws. You observe somatic patterns, hardware dynamics, or structural aesthetics and apply rigorous logic to turn those insights into tangible, efficient designs. You design for physical reality.",
      strengths: ["Elite awareness of somatic and hardware conditions", "Highly structured translation of aesthetics into mechanics", "Grounded artistic execution"],
      challenges: ["Can over-focus on physical constraints or hardware limits", "Struggles with entirely abstract, non-material structures", "Resistant to shifting stable physical guidelines"],
      careerPaths: ["Aerospace Ergonomics Engineer", "Industrial Product Architect", "Somatic Bio-mechanic", "Sustainable Urban Planner"]
    },
    "CPR": {
      name: "The Somatic Forecaster",
      tagline: "Predictive physical systemic design with creative intuition",
      description: "You map physical patterns, body language, and environmental variables to anticipate operational movements. You use original thinking to innovate solutions before physical systems fail. You feel sensory environments directly and predict their failures before they happen.",
      strengths: ["Highly sensitive to micro-movements and bodily indicators", "Capable of predicting physical and logistics bottle-necks", "Rapid somatic response in high-stress crisis management"],
      challenges: ["Overly reliant on current sensory cues for forecasts", "Finds virtual-only, ungrounded projects frustrating", "Prone to physical anxiety when system trends are negative"],
      careerPaths: ["Sports Performance Biometrician", "Crisis Operations Director", "Environmental Hazard Modeler", "Haptic Experience Designer"]
    },
    "CPE": {
      name: "The Somatic Storyteller",
      tagline: "Translating visceral physical experience into emotional art",
      description: "Deeply connected to physical sensations and non-verbal cues, you excel at feeling out emotional contexts and expressing them through highly imaginative, creative, and tangible media. You create experiences that resonate with people's physical senses and emotional hearts.",
      strengths: ["High-contrast sensory empathy", "Vividly creative expression of feelings", "Exceptional non-verbal communication skills"],
      challenges: ["Overwhelmed by cold, heavily mechanical environments", "Highly susceptible to negative somatic physical stress", "Struggles to articulate feelings in dry, logical terms"],
      careerPaths: ["Creative Director of VR Experiences", "Art Therapist", "Interactivity Designer", "Somatic Theater Director"]
    },
    "CML": {
      name: "The Alchemist-Philosopher",
      tagline: "Grounding transcendent vision and mysterious patterns into logic",
      description: "You combine creative vision and deep metaphysical or esoteric curiosity with a dedicated structured logical framework. You investigate anomalous phenomena, spiritual flows, or systemic unknowns and map them into formulas and mechanical rules that others can comprehend.",
      strengths: ["Bridges the esoteric with rigorous mathematical structures", "Brilliant deep-focus pattern conceptualizer", "Comfortable with massive conceptual paradoxes"],
      challenges: ["Can seem intellectually distant or eccentric to peers", "May over-systematize deeply private, mystic phenomena", "Hard to compromise on spiritual values"],
      careerPaths: ["Quantum Biology Investigator", "Theoretical Physicist", "Advanced Systems Philosopher", "Esoteric Symbolist"]
    },
    "CMR": {
      name: "The Esoteric Seer",
      tagline: "Forecasting evolution using metaphysical loops",
      description: "You represent the classic 'mystic prophet' archetype. You feel deep, non-material currents and synchronize them with historical macro-patterns to project grand civilizational, philosophical, or spiritual shifts. Your imagination is endless and feeds on cosmic patterns.",
      strengths: ["Extraordinary long-term spiritual/cultural vision", "Deep synchronicity and pattern detection", "Source of unique, non-conforming inspiration"],
      challenges: ["Highly eccentric and challenging to communicate clearly", "Vulnerable to losing connection with immediate daily realities", "Frustrated by demands for empirical proofs"],
      careerPaths: ["Long-term Cultural Futurist", "Esoteric Writer", "Cosmological Theorist", "Visionary Artist"]
    },
    "CME": {
      name: "The Transcendent Catalyst",
      tagline: "Inspiring spiritual evolution and cosmic empathy",
      description: "You possess a powerful mix of creativity, metaphysical attunement, and deep emotional resonance. You look at humanity not just as biological systems, but as spiritual entities needing connection and healing. You generate warm, inspiring, symbolic visions to elevate morale.",
      strengths: ["Deep spiritual and emotional empathy", "Stellar healing and inspiring communication style", "Exceptional workspace healer"],
      challenges: ["Highly vulnerable to toxic emotional environments", "Struggles with strict, cold, quantitative boundaries", "Can sacrifice logical safety to preserve abstract ideals"],
      careerPaths: ["Transpersonal Psychologist", "Mindfulness Mentor", "Spiritual Community Designer", "Immersive Wellness Architect"]
    },
    // --- INNOVATION-PRIMED ARCHETYPES ('I') ---
    "IDL": {
      name: "The Master Systems Optimizer",
      tagline: "Converting pattern analysis into optimized structural realities",
      description: "You represent the peak of execution-oriented analysis. You look at existing systems, filter out noise with high-contrast discernment, and apply flawless logical rules to streamline and optimize performance. You build, reconfigure, and clean up frameworks.",
      strengths: ["Unmatched efficiency filter and diagnostic speed", "Impeccable logical organization of operations", "Clean, high-yield system architecture blueprinting"],
      challenges: ["Can be impatient with sloppy, emotional processes", "Risk of over-optimizing systems at the expense of human comfort", "Aversion to unproven, purely speculative artistic ideas"],
      careerPaths: ["Chief Operations Officer", "Enterprise Solutions Architect", "Database Reliability Modeler", "High-Performance Systems Engineer"]
    },
    "IDR": {
      name: "The Systems Futurist",
      tagline: "Mapping existing structures onto upcoming developmental cycles",
      description: "You specialize in reconfiguring current technology and corporate frameworks to survive upcoming technological shifts. You diagnose structural anomalies early, balance them against logical targets, and use historic-trend forecasting to guide long-term stability.",
      strengths: ["Elite long-range technological migration architect", "Highly balanced assessment of risks and systems", "Superb strategic planner"],
      challenges: ["May seem overly cautious during growth rushes", "Over-analysis of upcoming risks can delay deployment", "Struggles when historical patterns completely break down"],
      careerPaths: ["VP of Technological Strategy", "Systems Migration Consultant", "Infrastructure Risk Modeler", "Supply Chain Logistician"]
    },
    "IDE": {
      name: "The Organizational Integrator",
      tagline: "Unifying structural optimization with high-contrast empathy",
      description: "You are the ultimate human team architect. You analyze current workflows and interpersonal dynamics, diagnosing friction points with an analytical filter. You then leverage emotional intelligence and system optimization to reconstruct teams that are highly productive yet humanly fulfilling.",
      strengths: ["Harmonizes high-performance metrics with psychological healing", "Dissects organizational problems with empathy and structure", "Excellent team-building advisor"],
      challenges: ["Torn between letting low-performers go and supporting their feelings", "Prone to overthinking interpersonal feedback loops", "Can struggle to stand tall under aggressive mechanical pushbacks"],
      careerPaths: ["Director of People Operations", "Human-Centered Engineering Lead", "Management Consultant", "Agile Coach Coach"]
    },
    "IPL": {
      name: "The Logistics Commander",
      tagline: "Maximizing tactile efficiency and spatial logic",
      description: "You are heavily anchored to physical reality, sensory observation, and spatial ergonomics. You look at physical layouts, hardware resources, or mechanical assets and configure them logically to maximize physical output, safety, and efficiency. You solve tangible bottlenecks.",
      strengths: ["Brilliant physical ergonomics mapping", "Grounded, logical approach to mechanical solutions", "High material and craft efficiency"],
      challenges: ["Finds purely virtual, non-tangible projects sterile", "Highly resistant to shifting systems based on non-empirical theories", "Prone to micromanaging physical protocols"],
      careerPaths: ["Logistics Operations Director", "Hardware Engineering Manager", "Spatial Planner", "Industrial Plant Manager"]
    },
    "IPR": {
      name: "The Predictive Engineer",
      tagline: "Forecasting physical material collapses and operational trends",
      description: "You combine sensitive physical observations with predictive temporal modeling. You look at material stress, weather conditions, or equipment wear cycles and forecast exactly when maintenance or intervention is required. You optimize systems dynamically.",
      strengths: ["Highly tuned to mechanical and physical stress signals", "Superb foresight of structural collapses or material wear", "Streamlined, active maintenance operations planner"],
      challenges: ["Prone to high physical alert and protective hyper-vigilance", "Frustrated by slow, disorganized manual red tape", "Struggles with unpredictable human behavioral shifts"],
      careerPaths: ["Structural Integrity Modeler", "Grid Reliability Lead", "Predictive Logistics Engineer", "High-Stress Safety Specialist"]
    },
    "IPE": {
      name: "The Somatic Facilitator",
      tagline: "Nurturing somatic well-being and practical team alignment",
      description: "You are keenly attuned to physical atmospheres and non-verbal stress indicators in others. You reconfigure physical spaces and workflows to maximize somatic comfort, stress relief, and emotional connection, fostering environments where people physically and emotionally thrive.",
      strengths: ["Creates comforting physical environments", "Deep somatic empathy and micro-expression tracking", "Practical execution of therapeutic healing"],
      challenges: ["Struggles in crowded, cold, or hazardous hardware hubs", "Resistant to aggressive, fast-paced quantitative targets", "Prone to avoiding vital logical friction"],
      careerPaths: ["Ergonomic Therapy Consultant", "Healing Retreat Architect", "Workplace Well-being Director", "Artistic Maker Facilitator"]
    },
    "IML": {
      name: "The Technomancer Architect",
      tagline: "Systematizing unvalidated energies and metaphysical concepts",
      description: "You possess a powerful focus on optimizing systems while remaining receptive to esoteric, spiritual, or theoretical unseen dynamics. You take anomalous patterns or metaphysical observations and attempt to build structures, programs, or methodologies to harvest and understand them.",
      strengths: ["Bridges systems engineering with the metaphysical field", "Pioneers hybrid technologies and non-linear logic", "Elite out-of-the-box structural troubleshooter"],
      challenges: ["Difficult to explain your core operating models to traditional peers", "Prone to getting lost in theoretical cosmic architectures", "Frustrated by narrow, flat-world mentalities"],
      careerPaths: ["Theoretical Bio-feedback Designer", "Quantum Logic Developer", "Alternative Energy Systemic Planner", "Metaphysical Methodologist"]
    },
    "IMR": {
      name: "The Evolutionary Prophet",
      tagline: "Aligning cosmic cycles with automated systemic optimization",
      description: "You synthesize deep metaphysical intuition, trend forecasting, and systems engineering. You predict long-range shifts in human consciousness and technology, optimizing current frameworks so they smoothly evolve into upcoming developmental phases.",
      strengths: ["Stellar vision of systemic trans-personal trends", "Deep integration of spiritual cycles with technology roadmaps", "Highly advanced adaptive system planner"],
      challenges: ["Can live so far in the developmental future that current steps feel trivial", "Vulnerable to sounding mystic or vague to corporate stakeholders", "Prone to overthinking historical cycles"],
      careerPaths: ["Corporate Evolution Director", "Transformational Futurist", "Long-Wave Strategic Modeler", "Evolutionary Systems Designer"]
    },
    "IME": {
      name: "The Community Weaver",
      tagline: "Structuring inclusive circles for spiritual and heart alignment",
      description: "You combine optimization skills with metaphysical receptivity and high emotional intelligence. You build circles, gatherings, or organizations that optimize human spiritual development and mutual validation, combining structured community rules with infinite cosmic empathy.",
      strengths: ["Brilliant spiritual group coordinator", "Deep emotional healing catalyst inside systems", "Nurtures highly cooperative, values-aligned cultures"],
      challenges: ["Overly sensitive to systemic conflict or operational friction", "Finds traditional corporate hierarchies sterile", "Can prioritize group consensus over structural code validation"],
      careerPaths: ["Intentional Community Planner", "Vanguard Non-Profit Coordinator", "Transformational Development Lead", "Interfaith Synergy Weaver"]
    }
  };

  const generic = {
    name: "The Cognitive Pioneer",
    tagline: "A balanced mapping of custom mental dimensions",
    description: "You possess a highly customized integration of mental traits that makes your cognitive profile rare and adaptive. You navigate between abstraction, observation, logical parsing, and emotional connection with ease.",
    strengths: ["Highly adaptive to diverse environments", "Balanced integration of cognitive modes", "Adept at pivoting between macro and micro issues"],
    challenges: ["May suffer from role ambiguity", "Prone to wearing too many hats", "Requires active centering to prevent burnout"],
    careerPaths: ["Multistakeholder Project Director", "Complex Problem Solver", "Strategic Consultant"]
  };

  const details = lookup[code] || generic;

  return {
    code,
    ...details
  };
}
