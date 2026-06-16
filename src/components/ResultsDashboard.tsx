import { useState, useEffect, useRef } from "react";
import { 
  Download, Trash2, Calendar, User, Eye, BookOpen, 
  Award, RefreshCw, Trophy, ArrowUpRight, HelpCircle,
  Share2, X, FileText, ShieldAlert, Sliders, Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { generateReportPdf } from "../pdf/generateReportPdf";
import { AssessmentResult, TraitKey, MacroScores } from "../types";
import { traitLabels, traitDescriptions, getArchetype } from "../utils";

export interface RangeDecode {
  tier: string;
  badgeClass: string;
  explanation: string;
  positives: string[];
  vulnerabilities: string[];
}

export function decodeMetricPercentage(key: string, pct: number): RangeDecode {
  let range: "low" | "mid" | "high" | "extreme";
  if (pct < 40) range = "low";
  else if (pct < 65) range = "mid";
  else if (pct < 85) range = "high";
  else range = "extreme";

  const macroDecodes: Record<string, Record<"low" | "mid" | "high" | "extreme", RangeDecode>> = {
    imagination: {
      low: {
        tier: "Applied Reality / Concrete Realist (0% - 39%)",
        badgeClass: "text-amber-750 bg-amber-50/70 border-amber-200 text-amber-800",
        explanation: "You focus intensely on existing structures and practical constraints. Rather than spinning up speculative or unproven theories, you excel at refining, executing, and perfecting current technologies, preventing wasteful departures from what is known to work.",
        positives: ["Exceptional stability and immediate execution", "Avoids blue-sky speculation traps", "Highly pragmatic and grounded design filters"],
        vulnerabilities: ["May resist paradigm-shifting technologies", "Risk of incrementalism and over-optimization", "Prefers safe, well-paved lanes over discovery"]
      },
      mid: {
        tier: "Pragmatic Symbiotic / Adaptive Synthesizer (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You occupy a highly balanced cognitive crossroad. You generate original ideas when requested, but immediately check them against practical execution parameters. You translate visionary theories into incremental real-world products without losing structural discipline.",
        positives: ["Comfortable bridging abstract models and real execution", "Highly adaptive to team roles", "Grounded yet open creative processes"],
        vulnerabilities: ["Can feel caught between theoretical and practical camps", "May hesitate to champion highly unorthodox ideas", "Requires external alignment of goals"]
      },
      high: {
        tier: "Strategic Visionary / Generative Ideator (65% - 84%)",
        badgeClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
        explanation: "You are heavily driven by conceptual curiosity and architectural design. You track trends, construct potential future states, and love thinking in abstract models. You feel highly energized when inventing and designing pristine conceptual layers.",
        positives: ["Generates rich, symbolic, and unorthodox patterns", "Sought out for breakthrough conceptual direction", "Comfortable with high abstract complexity"],
        vulnerabilities: ["Can lose patience with boring operations or manual routine", "May over-complicate simple systems", "Prefers the 'spark' over the long tail of execution"]
      },
      extreme: {
        tier: "Prime Conceptual Architect / Infinite Dreamer (85% - 100%)",
        badgeClass: "text-violet-700 bg-violet-50 border-violet-200",
        explanation: "You operate almost entirely in abstract thought spaces. Your mental sandbox is endless, generating a constant stream of highly original and speculative constructs. Your ideas redefine parameters but require strong systemic grounding inside execution teams.",
        positives: ["Elite, boundary-pushing creative genius", "Highly comfortable with massive cognitive paradoxes", "Rejects standard mental templates entirely"],
        vulnerabilities: ["Extreme risk of getting lost in speculation-loops", "Struggles with concrete hardware or operational limits", "Can disconnect from current user pain points or budgets"]
      }
    },
    intuition: {
      low: {
        tier: "Empiricist / Fact-Grounded Pragmatist (0% - 39%)",
        badgeClass: "text-amber-750 bg-amber-50/70 border-amber-200 text-amber-805",
        explanation: "You filter the world primarily through explicit, tactile, and objective evidence. You place very low trust in vague gut-feelings or unverified whispers, requiring logical or physical proofs before committing your resources. A score in this range means you are a vital factual anchor, preventing wild speculative leaps.",
        positives: ["Immutable filter against hype, noise, and bias", "Demands high-contrast, structured proof", "Extremely reliable sensory tracking"],
        vulnerabilities: ["May miss subtle non-verbal signals or shifts", "Can delay action during fast, low-data situations", "Skeptical of innovative but unproven patterns"]
      },
      mid: {
        tier: "Adaptive Sensor / Calibrated Observer (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You maintain an active and balanced receptiveness. You read physical atmospheres, micro-expressions, and systemic anomalies easily, but you always subject these impressions to rigorous truth-testing before acting. Your gut signals are calibrated filters.",
        positives: ["Reads people and systems with high accuracy", "Subconscious signals checked against evidence", "Outstanding personal boundary safety"],
        vulnerabilities: ["Can overthink when intuitive signals clash with data", "May suppress authentic insights to fit corporate rules", "Prone to analysis delays in high-friction environments"]
      },
      high: {
        tier: "Broad-Spectrum Receptor / Perceptive Guide (65% - 84%)",
        badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
        explanation: "You possess highly active psychological receptors. You gather non-verbal patterns, emotional tension, and environmental details instantaneously. You make non-linear connections beneath the sensory surface, knowing systemic truths before they can be explicitly proved.",
        positives: ["Exceptional non-verbal empathy and insight", "Detects structural anomalies and blockages early", "Acts as a reliable human radar inside complex teams"],
        vulnerabilities: ["Prone to absorbing ambient stress and fatigue", "Hard to explain your 'knowings' to purely rigid thinkers", "Can struggle to separate personal feelings from system vibes"]
      },
      extreme: {
        tier: "High-Frequency Receptor / Deep Mystic (85% - 100%)",
        badgeClass: "text-teal-700 bg-teal-50 border-teal-200",
        explanation: "You operate as a highly sensitive energetic receptor. Your somatic and subconscious antennas gather immense qualitative details from your environment, dreaming states, and human emotional contexts. Active boundary management is crucial to block out excess ambient noise.",
        positives: ["Extraordinary trans-personal empathy and foresight", "Receives rapid, accurate, non-linear system breakthroughs", "Deep, authentic calibration with the unseen"],
        vulnerabilities: ["Highly vulnerable to sensory or psychological overload", "Finds rigid, dry, quantitative environments toxic", "Requires active shielding to prevent burnout and anxiety"]
      }
    },
    judgment: {
      low: {
        tier: "Organic Processor / Fluid Adaptor (0% - 39%)",
        badgeClass: "text-amber-750 bg-amber-50/70 border-amber-200 text-amber-805",
        explanation: "You reject placing people or complex systemic processes into rigid, binary, or bureaucratic boxes. You treat rules as flexible guides, allowing decisions to evolve organically and contextually. You lean heavily on immediate, empathetic adjustments.",
        positives: ["Extremely comfortable in chaotic, low-structure environments", "Prioritizes relational context and flexibility", "Outstanding agile conflict resolution style"],
        vulnerabilities: ["May struggle in rigid administrative audits", "Risks of inconsistency across similar cases", "Harder to maintain strict mechanical scale boundaries"]
      },
      mid: {
        tier: "Calibrated Jurist / Pragmatic Judge (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You maintain a high-value balance between standards and situational context. You apply systemic standards and data, but easily allow exceptions or emotional adjustments when standard rules clash with immediate human reality.",
        positives: ["Fair and balanced decision metrics", "Synthesizes data constraints with human morale", "Highly reliable process alignment"],
        vulnerabilities: ["Can feel torn between structural standards and human feelings", "Prone to overthinking feedback loops", "May take longer to declare decisions under tension"]
      },
      high: {
        tier: "Structured Systemic Jurist / Protocol Trustee (65% - 84%)",
        badgeClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
        explanation: "You are driven by structural consistency, clear rules, and repeatable procedures. You build organizational safety by keeping tools, teams, and data sets operating within high-yield, transparent, and fair protocols.",
        positives: ["Brilliant builder of scalable operating architectures", "Demands process transparency and structural fairness", "Extremely consistent and repeatable evaluation metrics"],
        vulnerabilities: ["Can struggle when forced to make raw, unstandardized calls", "May come across as dry or overly bureaucratic to fluid peers", "Holds others to intense structural expectations"]
      },
      extreme: {
        tier: "Absolute Protocol Guardian / Systemic Overseer (85% - 100%)",
        badgeClass: "text-indigo-900 bg-indigo-100 border-indigo-300",
        explanation: "You represent the peak of formal standard evaluation. You require absolute clarity, empirical consistency, or rigorous emotional safety depending on your facet bias. You serve as a protective barrier against operational drift, keeping systems perfectly stable.",
        positives: ["Zero tolerance for systemic decay, errors, or bias", "Acts as an unwavering firewall for standards", "Exceptional focus on long-term systemic paths"],
        vulnerabilities: ["Extreme rigidity when faced with unexpected events", "Can build bureaucratic pipelines that choke rapid discovery", "Prone to massive frustration with sloppy operations"]
      }
    }
  };

  const microDecodes: Record<string, Record<"low" | "mid" | "high" | "extreme", RangeDecode>> = {
    creativity: {
      low: {
        tier: "Applied Artist / Refined Minimalist (0% - 39%)",
        badgeClass: "text-amber-700 bg-amber-50 border-amber-200",
        explanation: "You prefer clean, minimal, and functional design solutions over excessive decoration. You value simplicity, clarity, and proven aesthetic standards. You avoid unnecessary speculative loops, focusing instead on elegant execution.",
        positives: ["Clean, simple, high-utility aesthetic priorities", "Rejects abstract clutter immediately", "Keeps design goals tightly focused"],
        vulnerabilities: ["May find completely open-ended brainstorms sterile", "Hesitates to propose highly original, risky aesthetics", "Prefers existing templates to custom designs"]
      },
      mid: {
        tier: "Adaptive Modeler / Pragmatic Creator (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You generate creative visual or conceptual ideas easily when the situation calls for them, but you naturally ground them in established patterns. You balance art with utility, ensuring your creative sparks have a direct purpose.",
        positives: ["Balances visual expression with clear functional rules", "Highly flexible conceptual toolbox", "Accepts critique of designs with grace"],
        vulnerabilities: ["Can hold back your most unique ideas to fit peer templates", "Requires clear prompts to trigger deepest ideation", "May rely on hybrid patterns rather than pioneering new ones"]
      },
      high: {
        tier: "Abstract Pattern Explorer / Avant-Garde Artist (65% - 84%)",
        badgeClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
        explanation: "You constantly generate fresh, symbolic, or highly unique abstract concepts. You love reinterpreting rules, exploring metaphors, and looking at problems from inverted viewpoints. Your mind naturally seeks beautiful, deep novelty.",
        positives: ["Generates rich, highly original conceptual concepts", "Elite creator of visual metaphors and models", "Thrives in open-ended creative workshops"],
        vulnerabilities: ["Can overcomplicate layouts or communication streams", "May lose interest once the core aesthetic is completed", "Frustrated by demands for rigid, literal style rules"]
      },
      extreme: {
        tier: "Prime Paradigm Pioneer / Infinite Generator (85% - 100%)",
        badgeClass: "text-violet-750 bg-violet-50/70 border-violet-200 text-violet-850",
        explanation: "You live in a fertile wilderness of pure mental representation. You reject standard templates, seeking instead to completely redefine forms, paradigms, and visual worlds. Your creations push boundary limits, seeking absolute original depth.",
        positives: ["Pioneers entirely new visual or conceptual paradigms", "Infinite supply of original metaphors and ideas", "Total fearlessness in structural creative expression"],
        vulnerabilities: ["Huge gap between conceptual dreams and daily execution", "Risk of alienating traditional audiences with extreme complexity", "Finds standard templates highly choking and stressful"]
      }
    },
    innovation: {
      low: {
        tier: "Pristine Slate Pioneer / Direct Creator (0% - 39%)",
        badgeClass: "text-amber-700 bg-amber-50 border-amber-200",
        explanation: "You prefer starting fresh on an open canvas rather than repairing or optimizing tired old frameworks. You find incremental patching exhausting, seeking instead to build new, clean structures that bypass existing legacy mess.",
        positives: ["Bold builder of clean, unencumbered projects", "Rejects legacy technical debt from day one", "Prefers direct, linear, and uncrowded designs"],
        vulnerabilities: ["May abandon valuable systems too quickly", "Underestimates the cost of starting completely over", "Struggles with long optimization processes"]
      },
      mid: {
        tier: "Pragmatic Synthesizer / Systemic Builder (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You are exceptionally skilled at balancing repair work with new developments. You enjoy reconfiguring existing code or layouts to improve efficiency, but you know exactly when a structure is too broken and requires a clean replacement.",
        positives: ["Outstanding adaptive builder", "Balances optimization with clean-slab upgrades", "Highly valuable in migration and upgrade phases"],
        vulnerabilities: ["Can delay large upgrades by over-patching older systems", "Funnels energy into solving medium constraints", "May wait for external targets before committing to a rewrite"]
      },
      high: {
        tier: "High-Yield Systems Optimizer / Logistics Architect (65% - 84%)",
        badgeClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
        explanation: "You possess an elite capacity to optimize, reconfigure, and streamline complex operations. You look at messy, sprawling frameworks and instantly see how to bundle, modularize, and accelerate them to peak execution standards.",
        positives: ["Fabulous diagnostics and optimization abilities", "Slashes waste and bottlenecks with extreme precision", "Builds highly cohesive, modular architectures"],
        vulnerabilities: ["May over-engineer pipelines before they are scaling", "Can optimize code at the expense of human readability", "Risk of tunnel-visioning on performance statistics"]
      },
      extreme: {
        tier: "Chief Systems Refiner / Efficiency Emperor (85% - 100%)",
        badgeClass: "text-violet-700 bg-violet-50 border-violet-200",
        explanation: "You are a hyper-refining systems master. You view waste, redundancy, and lag as critical system failures. You reconfigure sprawling machines into streamlined, modular formulas that run with razor-sharp efficiency and automated precision.",
        positives: ["Incredible speed and efficiency diagnostic analyzer", "Master of clean, modular, high-throughput architectures", "Transforms complex chaos into automated pipelines"],
        vulnerabilities: ["Can over-optimize systems to extreme rigidities", "Impatiences with unaligned, messy creative ideas", "Expects absolute logic and performance from colleagues"]
      }
    },
    physical: {
      low: {
        tier: "Cognitive Analyst / Digital Mind (0% - 39%)",
        badgeClass: "text-amber-700 bg-amber-50 border-amber-200",
        explanation: "You filter systems primarily through abstract code, mathematical models, and conceptual layers. You prefer clean, digital workspaces and quantitative data over physical, somatic, or manual materials, ignoring immediate physical atmospheres.",
        positives: ["Outstanding digital focus and conceptual scale mapping", "Immune to immediate physical discomfort or environmental noise", "Excels at purely virtual, ungrounded software architectures"],
        vulnerabilities: ["May miss vital somatic bodily signals or stress signs", "Can overlook hardware, logistics, or physical human constraints", "Relies too heavily on spreadsheets rather than site realities"]
      },
      mid: {
        tier: "Calibrated Observer / Grounded Designer (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You maintain a healthy connection to your physical workspace and bodily comfort. You notice subtle somatic signs and sensory details, but you easily override them to focus on high-yield abstract processing when needed.",
        positives: ["Flexible balance between physical comfort and logical output", "Reads physical situational cues accurately", "Applies ergonomic details to systems design"],
        vulnerabilities: ["Can tolerate poor somatic environments for too long before speaking", "May neglect physical routines when highly focused on code", "Requires conscious effort to switch back to bodily awareness"]
      },
      high: {
        tier: "Visceral Somatic Sensor / Hardware Alchemist (65% - 84%)",
        badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
        explanation: "You have highly refined sensory-somatic feedback loops. You are intensely connected to material textures, physical aesthetics, movement cues, and direct non-verbal behaviors. You design tools for concrete real-world ergonomics.",
        positives: ["Flawless sensory observation and non-verbal empathy", "Exceptional hardware, spatial, or tactile engineering skills", "Maintains strong somatic health and environmental balance"],
        vulnerabilities: ["Highly distracted by messy, loud, or poorly lit offices", "Can overcomplicate systems with extreme spatial controls", "Finds virtual-only, ungrounded roles frustratingly dry"]
      },
      extreme: {
        tier: "Somatic Master / Tactile Commander (85% - 100%)",
        badgeClass: "text-teal-700 bg-teal-50 border-teal-200",
        explanation: "You reside intensely in physical reality. Your bodily somatic sensors track tiny physical anomalies, muscle tension patterns, and material variables. You translate these sensory inputs into tangible physical designs or highly intuitive somatic therapies.",
        positives: ["Elite non-verbal somatic diagnostic wizardry", "Unrivaled mechanical and environmental alignment", "Brings absolute organic presence to workspaces"],
        vulnerabilities: ["Highly susceptible to physical fatigue from digital screens", "Requires deep physical movement to process abstract theories", "May clash with teams that exist strictly in virtual spreadsheets"]
      }
    },
    metaphysical: {
      low: {
        tier: "Empirical Realist / Material Analyst (0% - 39%)",
        badgeClass: "text-amber-700 bg-amber-50 border-amber-200",
        explanation: "You trust what can be physically measured, verified, or mathematically proved. You reject esoteric signals, spiritual flows, or subtle atmospheric vibes as unreliable noise. You provide direct and grounded real-world clarity.",
        positives: ["Immutable shield against spiritual or superstitious hype", "Locks team focus on concrete empirical metrics", "Highly pragmatic, objective, and material-focused"],
        vulnerabilities: ["May reject highly valuable but unproven subconscious insights", "Can struggle to bond with highly intuitive or spiritual colleagues", "Misses non-linear pattern jumps that cannot be proved yet"]
      },
      mid: {
        tier: "Open-Minded Pragmatist / Mindful Catalyst (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You are primarily empirical but retain a healthy respect for subtle subconscious processes. You value mindfulness, dreaming states, and non-linear ideas, but you always seek to translate these esoteric patterns into practical real-world benefits.",
        positives: ["Brings high-yield mindfulness into professional environments", "Open to unusual ideas without losing logical footing", "Highly respected by both analysts and visionaries"],
        vulnerabilities: ["May suppress your most mystical insights to protect professional status", "Can delay decision-making waiting for alignment of 'vibes'", "Spiritual values can occasionally clash with data metrics"]
      },
      high: {
        tier: "Subtle Energies Receptor / Spiritual Architect (65% - 84%)",
        badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
        explanation: "You have deep, high-frequency receptivity to unseen flows, symbolic synchronicities, and trans-personal patterns. Your imagination is enriched by deep-focus contemplation, archetypes, and the collective subconscious.",
        positives: ["Elite developer of spiritual or highly inspiring concepts", "Translates esoteric mysteries into profound written ideas", "High healing presence in relational workspaces"],
        vulnerabilities: ["Can struggle with flat-world, heavily capitalistic systems", "Sensitive to toxic spiritual or philosophical energy", "May find structured mechanical schedules highly restrictive"]
      },
      extreme: {
        tier: "Cosmic Sentinel / Transcendent Catalyst (85% - 100%)",
        badgeClass: "text-teal-700 bg-teal-50/75 border-teal-200 text-teal-850",
        explanation: "You operate heavily in the metaphysical field, seeing humanity as a spiritual ecosystem. Your choices are guided by deep contemplations, synchronicities, or energetic flows. You act as an inspirational catalyst, aligning structures to higher values.",
        positives: ["Pioneers profound cultural or spiritual transformations", "Unrivaled pattern jumps and mystical insight outputs", "Brings deep soul and cosmic purpose to workflows"],
        vulnerabilities: ["Extremely vulnerable to material reality detachment", "Struggles with basic binary rules, taxes, and admin checklists", "Can sacrifice logical safety to preserve abstract ideals"]
      }
    },
    discernment: {
      low: {
        tier: "Spontaneous Believer / Inspired Explorer (0% - 39%)",
        badgeClass: "text-amber-700 bg-amber-50 border-amber-200",
        explanation: "You choose speed and raw inspiration over endless checking. You prefer riding the wave of immediate intuitive excitement, trusting initial sparks immediately rather than wasting weeks on diagnostic audits or logical review cycles.",
        positives: ["Exceptional rapid prototype developer", "Extremely low hesitation and high enthusiasm", "Unlocks fast innovation through bold discovery leaps"],
        vulnerabilities: ["May launch unstable, bug-filled configurations", "Extremely vulnerable to false-positive pattern biases", "Risk of leaving projects half-finished as hype fades"]
      },
      mid: {
        tier: "Calibrated Tester / Adaptive Auditer (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You trust your gut-feelings, but you maintain an active gatekeeping process. You check and test your insights when the stakes are high, but you allow yourself to move rapidly and use loose, intuitive templates for daily, low-risk actions.",
        positives: ["Superb balance of speed and defensive review", "Exhibits highly dynamic prototype pacing", "Tests systems without choking creative output"],
        vulnerabilities: ["Can overthink when intuitive signals conflict with standard metrics", "Slight delays during high-profile system audits", "May doubt your core ideas under aggressive peer reviews"]
      },
      high: {
        tier: "High-Contrast Guard / Critical Truth-Seeker (65% - 84%)",
        badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
        explanation: "You possess a powerful critical reality-testing shield. You analyze patterns and ideas with a high-contrast lens, separating genuine signal from deceptive noise and hype. You serve as a defensive shield, ensuring all insights are robust.",
        positives: ["Fabulous diagnostics and risk detection capabilities", "Separates speculative hype from empirical reality with ease", "Builds highly reliable, battle-tested solutions"],
        vulnerabilities: ["Can kill valuable but fragile early-stage creative ideas", "May come across as overly skeptical or protective to creative peers", "Tends to delay deployments in search of absolute security"]
      },
      extreme: {
        tier: "Sovereign Analytical Sentinel (85% - 100%)",
        badgeClass: "text-teal-700 bg-teal-50 border-teal-200",
        explanation: "You are the ultimate truth filter. You isolate and audit objective reality with complete focus and detachment. You run intense truth-testing scripts on every concept, ensuring only the most robust architectures survive.",
        positives: ["Zero tolerance for false-positives, logical leaks, or bias", "Acts as an impenetrable firewall against systemic risks", "Masterful debugger of complex system dynamics"],
        vulnerabilities: ["Can freeze project momentum in pursuit of perfect validation", "Extremely frustrating to fast, speculative dreamers", "Risk of hyper-focusing on errors at the expense of vision"]
      }
    },
    logical: {
      low: {
        tier: "Organic Synthesizer / Empathetic Coordinator (0% - 39%)",
        badgeClass: "text-amber-700 bg-amber-50 border-amber-200",
        explanation: "You treat rules as flexible tools that should always serve human exceptions and immediate situational contexts. You find rigid binary frameworks highly sterile, preferring instead to navigate decisions through fluid relationships and consensus.",
        positives: ["Outstanding builder of flexible, human-centric workflows", "Rejects bureaucratic red tape naturally", "Adapts rules dynamically to prevent team burnout"],
        vulnerabilities: ["May fail to document rules or maintain process consistency", "Struggles with deep mathematical, programmatic, or legal systems", "Reluctant to enforce necessary strict boundaries"]
      },
      mid: {
        tier: "Pragmatic Coordinator / Logical Resource (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You use logical, structured reasoning as an engineering resource, but you remain flexible to shift styles. You build clean guidelines and documentation, but you easily override standard templates when relational or practical realities demand it.",
        positives: ["Fair, structured, and highly balanced workflow architect", "Resolves complex issues with data and empathy", "Maintains high operational clarity"],
        vulnerabilities: ["Can hesitate when logical data directly clashes with team comfort", "May find yourself translating rules back and forth between silos", "Takes longer to finalize guidelines under high tension"]
      },
      high: {
        tier: "Systems Modeler / Empirical Coder (65% - 84%)",
        badgeClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
        explanation: "You live of structural consistency, clear rules, and objective processes. You define inputs, constraints, and outputs beautifully, ensuring your structures are predictable, fair, transparent, and operate with mechanical precision.",
        positives: ["Elite architect of algorithmic, structural, or program rules", "Provides immense clarity, documentation, and process safety", "Eliminates emotional bias from system audits"],
        vulnerabilities: ["May treat organic, emotional human issues as math values to solve", "Can struggle to execute decisions under extreme ambiguity", "Highly frustrated by chaotic, undocumented work styles"]
      },
      extreme: {
        tier: "Prime Deterministic Compiler (85% - 100%)",
        badgeClass: "text-indigo-900 bg-indigo-100 border-indigo-300",
        explanation: "You view the world as a complex machine that can be debugged, refactored, and compiled. You require absolute logical consistency, pristine data models, and unyielding mechanical rules. You act as a vital guardian of structural standards.",
        positives: ["Flawless mathematical and programmatic integrity", "Constructs incredibly stable, high-reliability infrastructures", "Unwavering defender of objective standards and logic"],
        vulnerabilities: ["Can build hyper-bureaucratic structures that ignore human exceptions", "Extremely severe when judging mistakes or sloppy code", "Finds relational or intuitive reasoning frustratingly useless"]
      }
    },
    emotional: {
      low: {
        tier: "Objective Realist / Stoic Professional (0% - 39%)",
        badgeClass: "text-amber-400 border-amber-200 text-slate-700",
        explanation: "You focus strictly on tasks, metrics, and functional parameters. You keep emotional dynamics and subjective moods completely separate from the workspace, evaluating success solely on objective output and mechanical execution.",
        positives: ["High-contrast objective evaluation under extreme stress", "Immune to interpersonal office drama and emotional shifts", "Superb at executing difficult, highly logical directives"],
        vulnerabilities: ["May come across as cold, distant, or unsupportive", "Underestimates the critical value of psychological safety", "Can ignore vital team fatigue and burnout warning signs"]
      },
      mid: {
        tier: "Balanced Communicator / Rational Collaborator (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You value human morale and team alignment, but you keep them balanced against task deadlines and objective parameters. You build comfortable, professional relationships but maintain healthy personal boundaries.",
        positives: ["Outstanding team mediator who values both tasks and people", "Maintains clear personal boundaries and professional decorum", "Supports colleagues without taking on their emotional baggage"],
        vulnerabilities: ["Can hold back critical feedback to avoid causing friction", "May hesitate to enforce boundaries during emotional situations", "Requires conscious effort to switch into deep empathetic listening"]
      },
      high: {
        tier: "Empathetic Catalyst / Cultural Architect (65% - 84%)",
        badgeClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
        explanation: "You are deeply attuned to group morale, human impact, and psychological safety. You believe that systems are only as strong as their relationships, constantly working to heal friction and align people's hearts with the project's vision.",
        positives: ["Brilliant builder of loyal, highly supportive team cultures", "Instantly detects relational stress and coordinates healing", "High organic motivation and empathetic communication style"],
        vulnerabilities: ["Can take professional criticisms extremely personally", "Struggles to make highly logical cuts that hurt people's feelings", "Prone to carrying the psychological weight of the entire team"]
      },
      extreme: {
        tier: "Harmonizing Guardian / Compassionate Shield (85% - 100%)",
        badgeClass: "text-indigo-900 bg-indigo-100 border-indigo-300",
        explanation: "You place supreme, non-negotiable value on human welfare, emotional healing, and absolute mutual validation. You act as a compassionate shield for your community, ensuring that mechanical metrics never damage psychological safety or human dignity.",
        positives: ["Unrivaled advocate for human-centric ethics and safety", "Heals toxic dynamics and builds elite psychological safe-havens", "Deeply trusted advisor and emotional support center"],
        vulnerabilities: ["Will actively delay or break mechanical goals to protect feelings", "Highly susceptible to emotional exhaustion and empathy burnout", "Finds cold, quantitative, task-first entities highly hostile"]
      }
    },
    predictive: {
      low: {
        tier: "Present-Moment Actor / Tactical Specialist (0% - 39%)",
        badgeClass: "text-amber-700 bg-amber-50 border-amber-200",
        explanation: "You focus intensely on solving the immediate, tangible crises right in front of you. You find long-term, speculative forecasting scenarios highly unproductive, preferring instead to execute daily tasks and let tomorrow handle itself.",
        positives: ["Exceptional rapid response during immediate operational failures", "Extremely high agility and tactical speed", "Practical, grounded focus on daily delivery goals"],
        vulnerabilities: ["May run into predictable bottlenecks that could be avoided", "Risks of tactical tunnel-vision", "Struggles when preparing for massive long-term structural changes"]
      },
      mid: {
        tier: "Tactical Planner / Balanced Analyst (40% - 64%)",
        badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
        explanation: "You look slightly ahead to coordinate upcoming project requirements, but you keep your core focus on current execution. You balance speculative future forecasts with real, historical results, avoiding excessive planning loops.",
        positives: ["Ensures future safety without delaying current deployments", "Highly balanced roadmapping timelines", "Excellent coordinator of medium-range goals"],
        vulnerabilities: ["May struggle during massive paradigm shifts that break history", "Can delay key strategic pivots waiting for trend consensus", "Spends considerable energy balancing immediate and long-term demands"]
      },
      high: {
        tier: "Temporal Wave Modeler / Strategic Visionary (65% - 84%)",
        badgeClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
        explanation: "You possess an innate capacity to track historical waves, technology timelines, and deep systemic curves. You naturally forecast where current layouts, programs, or markets are moving, preparing systems long before collapse occurs.",
        positives: ["Outstanding strategic advisor and long-term planner", "Detects systemic shifts and market trends with high precision", "Shields the company from future structural obsolete traps"],
        vulnerabilities: ["Can feel detached from the critical urgency of daily tasks", "May propose plans that are too complex for near-term budgets", "Frustrated by short-sighted, tactical management styles"]
      },
      extreme: {
        tier: "Strategic Prognostication Sentinel (85% - 100%)",
        badgeClass: "text-indigo-900 bg-indigo-100 border-indigo-300",
        explanation: "You live in the deep future, mapping civilizational, technology, and system transformations over five to twenty-year horizons. You track the structural tides of evolution, ensuring all current actions are aligned to future realities.",
        positives: ["Elite, prophetic long-range systemic forecasting", "Unparalleled vision of multi-layer future trajectories", "Guarantees ultimate strategic durability for critical projects"],
        vulnerabilities: ["Finds immediate administrative tasks and short sprints trivial", "Extremely challenging to communicate your deep visions to peers", "Risk of complete paralysis looking at endless future risk options"]
      }
    }
  };

  const fallbackValue: Record<"low" | "mid" | "high" | "extreme", RangeDecode> = {
    low: {
      tier: "Applied Capacity (0% - 39%)",
      badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
      explanation: "You prefer a highly stable, structured approach to daily decisions, avoiding speculative departures from proven frameworks.",
      positives: ["High reliability", "Empirical stability", "Focused delivery"],
      vulnerabilities: ["May resist rapid change", "Prefers traditional patterns"]
    },
    mid: {
      tier: "Adaptive Capacity (40% - 64%)",
      badgeClass: "text-slate-700 bg-slate-50 border-slate-200",
      explanation: "You maintain a useful, practical balance in this dimension, easily switching between theoretical frameworks and concrete actions as required.",
      positives: ["High adaptability", "Pragmatic balance", "Low-bias options"],
      vulnerabilities: ["Can delay commits waiting for balance", "Requires clear context boundaries"]
    },
    high: {
      tier: "Active Capacity (65% - 84%)",
      badgeClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
      explanation: "You exhibit a strong, proactive focus in this dimension, constantly seeking high-contrast insights and systems alignment.",
      positives: ["High strategic focus", "Intuitive troubleshooting", "Dynamic problem solving"],
      vulnerabilities: ["Can over-complicate processes", "Frustrated by routine guidelines"]
    },
    extreme: {
      tier: "Absolute Capacity (85% - 100%)",
      badgeClass: "text-violet-700 bg-violet-50 border-violet-200",
      explanation: "You operate near absolute limits here, creating elite, boundary-pushing solutions that demand pristine standard consistency.",
      positives: ["Unrivaled vision and depth", "Zero-tolerance for systemic bugs", "Extreme creative mastery"],
      vulnerabilities: ["Extreme risk of process freeze", "Highly sensitive to uncalibrated teams"]
    }
  };

  const isMacro = ["imagination", "intuition", "judgment"].includes(key);
  const pool = isMacro ? macroDecodes : microDecodes;
  const metrics = pool[key] || fallbackValue;
  const decodedResult = metrics[range] || fallbackValue.mid;
  return decodedResult;
}

interface ResultsDashboardProps {
  result: AssessmentResult;
  history: AssessmentResult[];
  onRetake: () => void;
  onDeleteHistory: (id: string) => void;
  onSelectHistorical: (result: AssessmentResult) => void;
  onUpdateResult?: (updated: AssessmentResult) => void;
  onClearAllHistory?: () => void;
}

export default function ResultsDashboard({
  result,
  history,
  onRetake,
  onDeleteHistory,
  onSelectHistorical,
  onUpdateResult,
  onClearAllHistory
}: ResultsDashboardProps) {
  const [chartType, setChartType] = useState<"micro" | "macro">("micro");
  const [selectedBarTrait, setSelectedBarTrait] = useState<TraitKey>("creativity");
  const [shareCopied, setShareCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [pdfSharingState, setPdfSharingState] = useState<"idle" | "generating" | "sharing" | "fallback" | "done">("idle");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isConfirmingAll, setIsConfirmingAll] = useState(false);

  // Email capturing before download or share
  const [captureEmailOpen, setCaptureEmailOpen] = useState(false);
  const [captureEmailAddress, setCaptureEmailAddress] = useState(result.userEmail || "");
  const [captureAction, setCaptureAction] = useState<"download" | "share" | null>(null);
  const [emailError, setEmailError] = useState("");

  // Premium report order
  const [premiumOrderOpen, setPremiumOrderOpen] = useState(false);
  const [premiumOrderAddress, setPremiumOrderAddress] = useState(result.userEmail || "");
  const [premiumOrderStatus, setPremiumOrderStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [premiumOrderError, setPremiumOrderError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  // Beta feedback state parameters
  const [accuracyRating, setAccuracyRating] = useState<number | null>(result.feedback?.accuracyRating ?? null);
  const [mostTrue, setMostTrue] = useState(result.feedback?.mostTrue ?? "");
  const [mostWrong, setMostWrong] = useState(result.feedback?.mostWrong ?? "");
  const [wouldShare, setWouldShare] = useState<boolean | null>(result.feedback?.wouldShare ?? null);
  const [wouldPayDeeper, setWouldPayDeeper] = useState<boolean | null>(result.feedback?.wouldPayDeeper ?? null);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    setAccuracyRating(result.feedback?.accuracyRating ?? null);
    setMostTrue(result.feedback?.mostTrue ?? "");
    setMostWrong(result.feedback?.mostWrong ?? "");
    setWouldShare(result.feedback?.wouldShare ?? null);
    setWouldPayDeeper(result.feedback?.wouldPayDeeper ?? null);
    setFeedbackSaved(false);
  }, [result.id, result.feedback]);

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateResult) return;

    const updatedResult = {
      ...result,
      feedback: {
        accuracyRating: accuracyRating !== null ? accuracyRating : undefined,
        mostTrue: mostTrue.trim() || undefined,
        mostWrong: mostWrong.trim() || undefined,
        wouldShare: wouldShare !== null ? wouldShare : undefined,
        wouldPayDeeper: wouldPayDeeper !== null ? wouldPayDeeper : undefined,
      }
    };

    onUpdateResult(updatedResult);
    setFeedbackSaved(true);
    setTimeout(() => {
      setFeedbackSaved(false);
    }, 4500);
  };

  // Keyboard navigation support: Dismiss modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsShareOpen(false);
        setCaptureEmailOpen(false);
        setPremiumOrderOpen(false);
        setConfirmDeleteId(null);
        setIsConfirmingAll(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileSiteKey = (((import.meta as any).env)?.VITE_TURNSTILE_SITE_KEY || "") as string;

  useEffect(() => {
    if (!turnstileSiteKey || !premiumOrderOpen) return;

    const loadRef = { current: true };

    const loadTurnstile = () => {
      if (!loadRef.current) return;
      const containerObj = turnstileContainerRef.current;
      if ((window as any).turnstile && containerObj && !turnstileWidgetId.current) {
        try {
          turnstileWidgetId.current = (window as any).turnstile.render(containerObj, {
            sitekey: turnstileSiteKey,
            callback: (token: string) => {
              setTurnstileToken(token);
              if (premiumOrderError) setPremiumOrderError("");
            },
            "expired-callback": () => {
              setTurnstileToken("");
            },
            "error-callback": () => {
              setTurnstileToken("");
            }
          });
        } catch (e) {
          console.error("Turnstile render error:", e);
        }
      }
    };

    if (!(window as any).turnstile) {
      const existingScript = document.getElementById("cloudflare-turnstile-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "cloudflare-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
        script.async = true;
        script.defer = true;
        (window as any).onloadTurnstileCallback = () => {
          loadTurnstile();
        };
        document.body.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if ((window as any).turnstile) {
            clearInterval(interval);
            loadTurnstile();
          }
        }, 100);
        return () => {
          loadRef.current = false;
          clearInterval(interval);
        };
      }
    } else {
      setTimeout(() => {
        loadTurnstile();
      }, 50);
    }

    return () => {
      loadRef.current = false;
      if (turnstileWidgetId.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(turnstileWidgetId.current);
        } catch (e) {}
        turnstileWidgetId.current = null;
      }
      setTurnstileToken("");
    };
  }, [turnstileSiteKey, premiumOrderOpen]);

  const { userName, timestamp, profileCode, normalizedScores, macroScores, archetype } = result;

  // Cognitive Percentage Decoder state variables
  const [decoderDimension, setDecoderDimension] = useState<string>("imagination");
  const [customPercent, setCustomPercent] = useState<number>(50);

  useEffect(() => {
    let score = 50;
    if (decoderDimension === "imagination") score = macroScores.imagination;
    else if (decoderDimension === "intuition") score = macroScores.intuition;
    else if (decoderDimension === "judgment") score = macroScores.judgment;
    else if (decoderDimension in normalizedScores) {
      score = normalizedScores[decoderDimension as TraitKey] ?? 50;
    }
    setCustomPercent(Math.round(score));
  }, [decoderDimension, macroScores, normalizedScores]);

  // Ordered list of traits for beautiful adjacent visual groupings in the octagon radar chart
  const orderedTraitKeys: TraitKey[] = [
    "creativity",     // Imagination
    "innovation",     // Imagination
    "physical",       // Intuition
    "metaphysical",   // Intuition
    "discernment",    // Intuition
    "logical",        // Judgment
    "emotional",      // Judgment
    "predictive"      // Judgment
  ];

  // Radar math setups
  const SVG_SIZE = 360;
  const CENTER = SVG_SIZE / 2;
  const MAX_RADIUS = 120;

  // Helper: converts score + angle to visual Cartesian coordinates (X, Y)
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // 1. Generate grid structures for Micro octagonal layout
  const microGridLinesCount = 4; // 25%, 50%, 75%, 100%
  const microGrids = Array.from({ length: microGridLinesCount }).map((_, gIdx) => {
    const radius = ((gIdx + 1) / microGridLinesCount) * MAX_RADIUS;
    const points = orderedTraitKeys.map((_, tIdx) => {
      const angle = tIdx * (360 / 8);
      const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
      return `${x},${y}`;
    }).join(" ");
    return { points, percentage: (gIdx + 1) * 25 };
  });

  // Generate main user score polygon for micro traits
  const microScorePointsStr = orderedTraitKeys.map((traitKey, tIdx) => {
    const score = normalizedScores[traitKey] ?? 0;
    const radius = (score / 100) * MAX_RADIUS;
    const angle = tIdx * (360 / 8);
    const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
    return `${x},${y}`;
  }).join(" ");

  // Generate axes lines and tick marks
  const microAxes = orderedTraitKeys.map((traitKey, tIdx) => {
    const angle = tIdx * (360 / 8);
    const outerPoint = polarToCartesian(CENTER, CENTER, MAX_RADIUS, angle);
    const labelPoint = polarToCartesian(CENTER, CENTER, MAX_RADIUS + 22, angle);
    
    // Determine anchor alignment based on quadrant to avoid overlap clipping
    let textAnchor: "start" | "end" | "middle" = "middle";
    if (outerPoint.x > CENTER + 10) textAnchor = "start";
    if (outerPoint.x < CENTER - 10) textAnchor = "end";

    return {
      traitKey,
      name: traitKey.charAt(0).toUpperCase() + traitKey.slice(1, 3), // e.g. Cre, Inn
      x1: CENTER,
      y1: CENTER,
      x2: outerPoint.x,
      y2: outerPoint.y,
      lx: labelPoint.x,
      ly: labelPoint.y,
      textAnchor,
      score: Math.round(normalizedScores[traitKey] ?? 0)
    };
  });

  // 2. Generate grid structures for Macro triangle layout
  const macroKeys: (keyof MacroScores)[] = ["imagination", "intuition", "judgment"];
  const macroGridLines = Array.from({ length: 4 }).map((_, gIdx) => {
    const radius = ((gIdx + 1) / 4) * MAX_RADIUS;
    const points = macroKeys.map((_, mIdx) => {
      const angle = mIdx * (360 / 3);
      const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
      return `${x},${y}`;
    }).join(" ");
    return { points, percentage: (gIdx + 1) * 25 };
  });

  const macroScorePointsStr = macroKeys.map((macroKey, mIdx) => {
    const score = macroScores[macroKey] ?? 0;
    const radius = (score / 100) * MAX_RADIUS;
    const angle = mIdx * (360 / 3);
    const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
    return `${x},${y}`;
  }).join(" ");

  const macroAxes = macroKeys.map((macroKey, mIdx) => {
    const angle = mIdx * (360 / 3);
    const outerPoint = polarToCartesian(CENTER, CENTER, MAX_RADIUS, angle);
    const labelPoint = polarToCartesian(CENTER, CENTER, MAX_RADIUS + 22, angle);

    let textAnchor: "start" | "end" | "middle" = "middle";
    if (outerPoint.x > CENTER + 10) textAnchor = "start";
    if (outerPoint.x < CENTER - 10) textAnchor = "end";

    return {
      macroKey,
      name: macroKey.toUpperCase(),
      x1: CENTER,
      y1: CENTER,
      x2: outerPoint.x,
      y2: outerPoint.y,
      lx: labelPoint.x,
      ly: labelPoint.y,
      textAnchor,
      score: Math.round(macroScores[macroKey] ?? 0)
    };
  });

  // Export as high-quality JSON format for professional download records
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TriAd_Assessment_${userName}_${profileCode}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const triggerRealDownload = async () => {
    try {
      setPdfSharingState("generating");
      const { doc, fileName } = await generateReportPdf(result);
      doc.save(fileName);
      setPdfSharingState("done");
      setTimeout(() => setPdfSharingState("idle"), 2500);
    } catch (err) {
      console.error("PDF download compilation failed:", err);
      setPdfSharingState("idle");
    }
  };

  const triggerRealSharePDF = async () => {
    try {
      setPdfSharingState("generating");
      const { doc, fileName } = await generateReportPdf(result);
      const pdfBlob = doc.output("blob");
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        setPdfSharingState("sharing");
        await navigator.share({
          files: [file],
          title: `TriAd Report - ${userName} (${profileCode})`,
          text: `My TriAd Cognitive map results report (PDF format).`
        });
        setPdfSharingState("done");
        setTimeout(() => setPdfSharingState("idle"), 3000);
      } else {
        // Browser does not support sharing files (common on many desktop browsers)
        // gracefully trigger fallback download and inform
        setPdfSharingState("fallback");
        doc.save(fileName);
        setTimeout(() => setPdfSharingState("idle"), 5000);
      }
    } catch (err) {
      console.error("PDF Native WebShare API failed:", err);
      setPdfSharingState("fallback");
      try {
        const { doc, fileName } = await generateReportPdf(result);
        doc.save(fileName);
      } catch (innerErr) {
        console.error("Fallback save failed too:", innerErr);
      }
      setTimeout(() => setPdfSharingState("idle"), 4000);
    }
  };

  const handleDownloadPDF = () => {
    if (result.userEmail && result.userEmail.includes("@")) {
      triggerRealDownload();
    } else {
      setCaptureAction("download");
      setCaptureEmailOpen(true);
    }
  };

  const handleSharePDF = async () => {
    if (result.userEmail && result.userEmail.includes("@")) {
      triggerRealSharePDF();
    } else {
      setCaptureAction("share");
      setCaptureEmailOpen(true);
    }
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  const handleShareText = async () => {
    const shareUrl = window.location.origin + window.location.pathname;
    const bodyText = `🔮 TRIAD COGNITIVE PORTFOLIO CALIBRATION 🔮
Subject: ${userName}
Identity Blueprint: ${profileCode} / ${archetype.name.toUpperCase()}
"${archetype.tagline}"

Core Mental Vectors:
⚡ Imagination Score: ${Math.round(macroScores.imagination)}%
🌿 Intuition Score: ${Math.round(macroScores.intuition)}%
⚖️ Judgment Score: ${Math.round(macroScores.judgment)}%

Career Trajectory Guidance:
• ${archetype.careerPaths[0]}

Formulate your blueprint coordinate structure at:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `TriAd Cognitive Archetype: ${profileCode}`,
          text: `${bodyText}\n${shareUrl}`,
          url: shareUrl,
        });
      } catch (err) {
        // clipboard copy as backup
        copyTextPayload(`${bodyText}\n${shareUrl}`);
      }
    } else {
      copyTextPayload(`${bodyText}\n${shareUrl}`);
    }
  };

  // Stale duplicate handleSharePDF removed in favor of email verification wrapper

  const copyTextPayload = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }).catch(err => {
      console.error("Could not copy:", err);
    });
  };

  const handleCaptureEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureEmailAddress || !captureEmailAddress.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    
    setEmailError("");
    setCaptureEmailOpen(false);

    // Update active result with email
    const updated = {
      ...result,
      userEmail: captureEmailAddress
    };

    if (onUpdateResult) {
      onUpdateResult(updated);
    }

    // Now trigger original action
    if (captureAction === "download") {
      triggerRealDownload();
    } else if (captureAction === "share") {
      triggerRealSharePDF();
    }

    setCaptureAction(null);
  };

  const handlePremiumOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!premiumOrderAddress || !premiumOrderAddress.includes("@")) {
      setPremiumOrderError("Please enter a valid email address.");
      return;
    }

    if (!inviteCode.trim()) {
      setPremiumOrderError("Please enter your beta invite designator code.");
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      setPremiumOrderError("Please complete the security Turnstile verification.");
      return;
    }

    setPremiumOrderStatus("submitting");
    setPremiumOrderError("");

    try {
      const response = await fetch("/api/premium-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: premiumOrderAddress,
          name: userName,
          profileCode: profileCode,
          macroScores: macroScores,
          timestamp: timestamp,
          inviteCode: inviteCode,
          turnstileToken: turnstileToken,
          feedback: result.feedback
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPremiumOrderStatus("success");
        // Also write email to results if they don't have one
        if (!result.userEmail && onUpdateResult) {
          onUpdateResult({
            ...result,
            userEmail: premiumOrderAddress
          });
          setCaptureEmailAddress(premiumOrderAddress);
        }
      } else {
        setPremiumOrderStatus("error");
        setPremiumOrderError(data.message || "Failed to submit premium requisition.");
      }
    } catch (err) {
      setPremiumOrderStatus("error");
      setPremiumOrderError("Network connection error. Server rejected request.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Alert Ribbon */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-8 flex justify-between items-center gap-4 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="font-semibold text-sm">Cognitive Mapping Completed.</span>
            <p className="text-xs text-emerald-700">Cognitive sub-traits mapped and raw boundaries balanced successfully for self-reflection.</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block shrink-0">
          Timestamp: {new Date(timestamp).toLocaleTimeString()}
        </div>
      </motion.div>

      {/* Disclaimer Box */}
      <div className="mb-8 text-xs text-slate-500 bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800">Classification Disclaimer</p>
          <p className="leading-relaxed mt-0.5">
            Tri-Ad is an experimental self-reflection tool. It is not a clinical, medical, or psychological diagnostic instrument. Its findings are symbolic and intended solely for personal exploration and contemplation.
          </p>
        </div>
      </div>

      {/* Top action row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
            Cerebral Blueprint Map
          </h1>
          <p className="text-sm text-gray-500">
            Subject ID: <span className="text-indigo-600 font-semibold">{userName}</span> &bull; Reflective Protocol MVP V2
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={onRetake}
            id="btn-new-assessment"
            className="px-3.5 py-2 text-xs md:text-sm font-medium border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Assessment
          </button>
          
          <button
            onClick={handleShare}
            id="btn-share-results"
            className={`px-3.5 py-2 text-xs md:text-sm font-medium border rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              shareCopied
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300"
            }`}
          >
            {shareCopied ? (
              <>
                <Award className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                Copied Link!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                Share Archetype
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={pdfSharingState === "generating" || pdfSharingState === "sharing"}
            id="btn-download-pdf"
            className="px-3.5 py-2 text-xs md:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700/90 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm font-display font-semibold disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {pdfSharingState === "generating" ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                Compiling...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Download PDF Report
              </>
            )}
          </button>

          <button
            onClick={handleExportJSON}
            id="btn-export-json"
            className="px-3.5 py-2 text-xs md:text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Export Raw JSON
          </button>
        </div>
      </div>

      {/* Primary Dashboard Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Archetype Card Left */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 border border-indigo-100/50 rounded-md text-indigo-700 uppercase font-mono tracking-wider">
                Cognitive Archetype
              </span>
              <div className="text-right text-xs text-slate-400 font-mono">
                Code Profile: <span className="font-bold text-gray-800">{profileCode}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-6xl font-black tracking-tighter text-indigo-600 font-display mb-2 animate-pulse-slow">
                {profileCode}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-950 font-display">
                {archetype.name}
              </h2>
              <p className="text-sm text-indigo-500/80 font-medium italic mt-1.5">
                &ldquo;{archetype.tagline}&rdquo;
              </p>
            </div>

            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 font-light">
              {archetype.description}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6 flex items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>MATH_SCALE: MIN-MAX NORMALIZED</span>
            </div>
            <span>MVP_V2_CORE</span>
          </div>
        </div>

        {/* Dynamic Radar Chart Right */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between items-center">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="font-display font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              Visual Vector Projection
            </h3>
            {/* Toggles */}
            <div className="bg-slate-50 border border-slate-100 p-0.5 rounded-lg flex gap-1">
              <button
                onClick={() => setChartType("micro")}
                className={`px-2.5 py-1 text-[11px] font-medium font-mono rounded-md transition-all cursor-pointer ${
                  chartType === "micro"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                8 Micro
              </button>
              <button
                onClick={() => setChartType("macro")}
                className={`px-2.5 py-1 text-[11px] font-medium font-mono rounded-md transition-all cursor-pointer ${
                  chartType === "macro"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                3 Macro
              </button>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative flex items-center justify-center p-2">
            <svg 
              width={SVG_SIZE} 
              height={SVG_SIZE} 
              className="overflow-visible select-none"
              aria-label="Cognitive Assessment Radar Chart"
            >
              <g>
                {chartType === "micro" ? (
                  <>
                    {/* Ring helper labels */}
                    {microGrids.map((g, idx) => (
                      <g key={idx}>
                        <polygon
                          points={g.points}
                          fill="none"
                          stroke="#f1f3f5"
                          strokeWidth="1.5"
                        />
                        {/* % numbers directly vertical */}
                        <text
                          x={CENTER}
                          y={CENTER - ((idx + 1) / microGridLinesCount) * MAX_RADIUS + 4}
                          fill="#ccd0d6"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          stroke="#ffffff"
                          strokeWidth="2"
                          paintOrder="stroke"
                        >
                          {g.percentage}%
                        </text>
                      </g>
                    ))}

                    {/* Axial radial lines */}
                    {microAxes.map((axis, idx) => (
                      <line
                        key={idx}
                        x1={axis.x1}
                        y1={axis.y1}
                        x2={axis.x2}
                        y2={axis.y2}
                        stroke="#f1f3f5"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                    ))}

                    {/* Active User filled Polygon outline */}
                    <polygon
                      points={microScorePointsStr}
                      fill="rgba(79, 70, 229, 0.12)"
                      stroke="rgba(79, 70, 229, 0.75)"
                      strokeWidth="2"
                    />

                    {/* Glowing dots at vertex points */}
                    {orderedTraitKeys.map((traitKey, tIdx) => {
                      const score = normalizedScores[traitKey] ?? 0;
                      const radius = (score / 100) * MAX_RADIUS;
                      const angle = tIdx * (360 / 8);
                      const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
                      return (
                        <circle
                          key={tIdx}
                          cx={x}
                          cy={y}
                          r="4.5"
                          fill="#4f46e5"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="hover:scale-125 transition-transform cursor-pointer"
                        >
                          <title>{`${traitLabels[traitKey]}: ${Math.round(score)}%`}</title>
                        </circle>
                      );
                    })}

                    {/* Axis Labels */}
                    {microAxes.map((axis, idx) => (
                      <text
                        key={idx}
                        x={axis.lx}
                        y={axis.ly + 3}
                        fill="#5c697a"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                        textAnchor={axis.textAnchor}
                        className="cursor-pointer hover:fill-indigo-600 transition-colors"
                        onClick={() => setSelectedBarTrait(axis.traitKey)}
                      >
                        {axis.name} ({axis.score}%)
                      </text>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Ring labels for macro triangle grids */}
                    {macroGridLines.map((g, idx) => (
                      <g key={idx}>
                        <polygon
                          points={g.points}
                          fill="none"
                          stroke="#f1f3f5"
                          strokeWidth="1.5"
                        />
                        <text
                          x={CENTER}
                          y={CENTER - ((idx + 1) / 4) * MAX_RADIUS + 4}
                          fill="#ccd0d6"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          stroke="#ffffff"
                          strokeWidth="2"
                          paintOrder="stroke"
                        >
                          {g.percentage}%
                        </text>
                      </g>
                    ))}

                    {/* 3 axes */}
                    {macroAxes.map((axis, idx) => (
                      <line
                        key={idx}
                        x1={axis.x1}
                        y1={axis.y1}
                        x2={axis.x2}
                        y2={axis.y2}
                        stroke="#f1f3f5"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                    ))}

                    {/* Polygon filled for Macro scores */}
                    <polygon
                      points={macroScorePointsStr}
                      fill="rgba(59, 130, 246, 0.15)"
                      stroke="rgba(59, 130, 246, 0.75)"
                      strokeWidth="2"
                    />

                    {/* Glowing dots at vertex points */}
                    {macroKeys.map((macroKey, mIdx) => {
                      const score = macroScores[macroKey] ?? 0;
                      const radius = (score / 100) * MAX_RADIUS;
                      const angle = mIdx * (360 / 3);
                      const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
                      return (
                        <circle
                          key={mIdx}
                          cx={x}
                          cy={y}
                          r="5.5"
                          fill="#3b82f6"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="hover:scale-125 transition-transform cursor-pointer animate-pulse-slow"
                        >
                          <title>{`${macroKey.toUpperCase()}: ${Math.round(score)}%`}</title>
                        </circle>
                      );
                    })}

                    {/* Axis labels */}
                    {macroAxes.map((axis, idx) => (
                      <text
                        key={idx}
                        x={axis.lx}
                        y={axis.ly + 3}
                        fill="#334155"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="700"
                        textAnchor={axis.textAnchor}
                      >
                        {axis.name} ({axis.score}%)
                      </text>
                    ))}
                  </>
                )}
              </g>
            </svg>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-mono leading-relaxed mt-2">
            Click labels in 8 Micro model to focus detail logs below
          </div>
        </div>
      </div>

      {/* Strengths, Gaps, and Career Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Key Strengths */}
        <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-6 md:p-8">
          <h4 className="font-display font-bold text-gray-900 border-b border-emerald-100 pb-3 mb-4 text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-600" />
            Core Catalytic Strengths
          </h4>
          <ul className="space-y-3">
            {archetype.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Core Challenges */}
        <div className="bg-rose-50/20 border border-rose-100 rounded-2xl p-6 md:p-8">
          <h4 className="font-display font-bold text-gray-900 border-b border-rose-100 pb-3 mb-4 text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-600" />
            Operational Inhibitors
          </h4>
          <ul className="space-y-3">
            {archetype.challenges.map((chal, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="text-rose-500 font-bold shrink-0">!</span>
                <span>{chal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Fields */}
        <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-6 md:p-8">
          <h4 className="font-display font-bold text-gray-900 border-b border-indigo-100 pb-3 mb-4 text-sm flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
            Strategic Alignment Arenas
          </h4>
          <ul className="space-y-3">
            {archetype.careerPaths.map((path, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-gray-700 leading-semibold">
                <span className="text-indigo-400 shrink-0">&#9638;</span>
                <span>{path}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SECTION 3.5: DYNAMIC COGNITIVE PERCENTAGE DECODER */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 mb-12 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Sliders className="w-5 h-5" />
              </span>
              <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
                Cognitive Percentage Decoder
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Interactive score interpreter. Select any mental parameter and slide the path to decode real-world operational behaviors.
            </p>
          </div>
          
          {/* Quick Info Badge */}
          <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100/50 px-3 py-1.5 rounded-xl self-start md:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-mono text-indigo-700 font-semibold uppercase tracking-wider">
              Real-Time Vector Calibration
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT PANEL: Selector Tabs */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block pb-1">
              Select Parameter
            </span>
            
            {/* Macro Group */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest pl-2 block mb-1">
                Macro Vectors
              </span>
              {(["imagination", "intuition", "judgment"] as const).map((key) => {
                const userScore = Math.round(key === "imagination" ? macroScores.imagination : key === "intuition" ? macroScores.intuition : macroScores.judgment);
                const active = decoderDimension === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setDecoderDimension(key);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex justify-between items-center transition-all border ${
                      active 
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100/80 border-slate-200/60"
                    }`}
                  >
                    <span className="capitalize">{key}</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`} title="Your computed score">
                      {userScore}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Micro Group */}
            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest pl-2 block mb-1">
                Micro Sub-Traits
              </span>
              {orderedTraitKeys.map((key) => {
                const userScore = Math.round(normalizedScores[key] ?? 50);
                const active = decoderDimension === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setDecoderDimension(key);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex justify-between items-center transition-all border ${
                      active 
                        ? "bg-slate-950 text-white border-slate-950 shadow-sm" 
                        : "bg-slate-50/50 text-slate-600 hover:bg-slate-100/80 border-slate-200/50"
                    }`}
                  >
                    <span className="capitalize">{key}</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`} title="Your computed score">
                      {userScore}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Custom Slider + Dynamic Explanations */}
          <div className="lg:col-span-8 bg-slate-50/40 border border-slate-200/30 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-wider block">
                    Parameter Deep Dive
                  </span>
                  <h4 className="font-display font-extrabold text-lg text-slate-900 capitalize mt-0.5">
                    {decoderDimension === "imagination" ? "Imagination (Macro)" : decoderDimension === "intuition" ? "Intuition (Macro)" : decoderDimension === "judgment" ? "Judgment (Macro)" : traitLabels[decoderDimension as TraitKey]}
                  </h4>
                </div>
                
                {/* Score Indicator */}
                <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2 flex items-center gap-3 shrink-0 shadow-xs">
                  <span className="text-xs text-slate-400 font-mono font-medium">Calibrated Percent:</span>
                  <span className="font-mono font-extrabold text-xl text-slate-900">{customPercent}%</span>
                </div>
              </div>

              {/* Slider Controller */}
              <div className="mb-8 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Receptive / Applied (0%)</span>
                  <span>Balanced (50%)</span>
                  <span>Extreme / Absolute (100%)</span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customPercent}
                  onChange={(e) => {
                    setCustomPercent(Number(e.target.value));
                  }}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* Snappers / State Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Preset: Your Computed Score */}
                  <button
                    onClick={() => {
                      let original = 50;
                      if (decoderDimension === "imagination") original = macroScores.imagination;
                      else if (decoderDimension === "intuition") original = macroScores.intuition;
                      else if (decoderDimension === "judgment") original = macroScores.judgment;
                      else if (decoderDimension in normalizedScores) {
                        original = normalizedScores[decoderDimension as TraitKey] ?? 50;
                      }
                      setCustomPercent(Math.round(original));
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold hover:bg-slate-55 hover:border-slate-300 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    Reset to Your Score ({Math.round(
                      decoderDimension === "imagination" 
                        ? macroScores.imagination 
                        : decoderDimension === "intuition" 
                        ? macroScores.intuition 
                        : decoderDimension === "judgment" 
                        ? macroScores.judgment 
                        : (normalizedScores[decoderDimension as TraitKey] ?? 50)
                    )}%)
                  </button>
                  <button
                    onClick={() => setCustomPercent(25)}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold hover:bg-slate-55 hover:border-slate-300 transition-all"
                  >
                    Low (25%)
                  </button>
                  <button
                    onClick={() => setCustomPercent(50)}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold hover:bg-slate-55 hover:border-slate-300 transition-all"
                  >
                    Moderate (50%)
                  </button>
                  <button
                    onClick={() => setCustomPercent(75)}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold hover:bg-slate-55 hover:border-slate-300 transition-all"
                  >
                    High (75%)
                  </button>
                  <button
                    onClick={() => setCustomPercent(95)}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold hover:bg-slate-55 hover:border-slate-300 transition-all"
                  >
                    Absolute (95%)
                  </button>
                </div>
              </div>

              {/* Dynamic Readout */}
              {(() => {
                const decoded = decodeMetricPercentage(decoderDimension, customPercent);
                return (
                  <motion.div 
                    key={`${decoderDimension}-${decoded.tier}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* Badge */}
                    <div className="flex items-center">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 border rounded-full ${decoded.badgeClass}`}>
                        {decoded.tier}
                      </span>
                    </div>

                    {/* Paragraph Explanation */}
                    <div className="bg-white/50 border border-slate-100 rounded-2xl p-4">
                      <p className="text-sm text-slate-700 leading-relaxed font-normal">
                        {decoded.explanation}
                      </p>
                    </div>

                    {/* Grids for Strengths & Vulnerabilities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Positive implications */}
                      <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-2xl p-4">
                        <span className="text-[10px] font-mono font-extrabold text-emerald-700 uppercase tracking-wider block mb-2.5">
                          ✓ Strategic Advantages
                        </span>
                        <ul className="space-y-2">
                          {decoded.positives.map((pos, idx) => (
                            <li key={idx} className="flex gap-2 text-xs text-slate-600 leading-normal">
                              <span className="text-emerald-500 font-bold shrink-0">•</span>
                              <span>{pos}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Negative implications */}
                      <div className="bg-rose-50/20 border border-rose-100/50 rounded-2xl p-4">
                        <span className="text-[10px] font-mono font-extrabold text-rose-700 uppercase tracking-wider block mb-2.5">
                          ⚠ Operational Risks
                        </span>
                        <ul className="space-y-2">
                          {decoded.vulnerabilities.map((vul, idx) => (
                            <li key={idx} className="flex gap-2 text-xs text-slate-600 leading-normal">
                              <span className="text-rose-500 font-bold shrink-0">•</span>
                              <span>{vul}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: UNLOCK COGNITIVE DISCOVERY PREMIUM PORTFOLIO */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800 rounded-3xl p-6 md:p-10 mb-12 shadow-xl relative overflow-hidden select-none">
        {/* Absolute Background Accent Glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
              ✦ Deep Cognitive Exploration Upgrade Available
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-3">
              Unlock Your Expanded 40-Page Premium Portfolio
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mt-2.5 font-light">
              Move beyond macro metrics. Request a custom manual offline blueprint containing comprehensive reflective guides, communication outlines, and career archetype suggestions.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />40-Page Dossier</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Workplace Alignment Guides</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />Direct Email Delivery</span>
            </div>
          </div>
          
          <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2.5 min-w-[240px]">
            <button
              onClick={() => {
                setPremiumOrderStatus("idle");
                setPremiumOrderError("");
                setPremiumOrderOpen(true);
              }}
              className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-xs md:text-sm tracking-wider uppercase text-slate-900 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Order Premium Report (Free)
              <span>✦</span>
            </button>
            <div className="text-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Fulfillment: Automated Private Beta Node
            </div>
          </div>
        </div>
      </div>

      {/* Consolidated Interactive Sub-Trait Progression meters */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 mb-12 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 mb-8 gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Granular Sub-Trait Projections
            </h3>
            <p className="text-xs text-gray-500 mt-1">Select a metrics container below to focus on its system definitions</p>
          </div>
          <div className="p-3 bg-[#faf8f5] border border-slate-200/50 rounded-xl max-w-sm">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Focused Detail Module</div>
            <div className="text-xs font-semibold text-gray-800 font-mono mt-0.5">{traitLabels[selectedBarTrait]}</div>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">{traitDescriptions[selectedBarTrait]}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {orderedTraitKeys.map((traitKey) => {
            const score = normalizedScores[traitKey] ?? 0;
            const isFocused = selectedBarTrait === traitKey;

            // Determine matching styling accents
            let accentColor = "bg-amber-500";
            let hoverBg = "hover:bg-amber-50/30";
            if (["physical", "metaphysical", "discernment"].includes(traitKey)) {
              accentColor = "bg-emerald-500";
              hoverBg = "hover:bg-emerald-50/20";
            } else if (["logical", "emotional", "predictive"].includes(traitKey)) {
              accentColor = "bg-indigo-600";
              hoverBg = "hover:bg-indigo-50/20";
            }

            return (
              <button
                key={traitKey}
                onClick={() => setSelectedBarTrait(traitKey)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                  isFocused 
                    ? "bg-slate-50 border-slate-300 ring-1 ring-slate-400/50" 
                    : `border-transparent ${hoverBg}`
                }`}
                style={{ contentVisibility: "auto" }}
              >
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-gray-900 font-display flex items-center gap-1.5">
                    {traitLabels[traitKey]}
                    {isFocused && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                  </span>
                  <span className="font-mono font-bold text-gray-700">{Math.round(score)}%</span>
                </div>
                {/* Meter block */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={`h-full ${accentColor}`}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1.5 flex justify-between">
                  <span>SCALE_NORMALIZED</span>
                  <span>FACTOR_100</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightweight Beta Quality & Model Calibration Section */}
      <form onSubmit={handleSaveFeedback} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 mb-12 shadow-xs space-y-6">
        <div>
          <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-650 animate-pulse" />
            Beta Model Evaluation &amp; Calibration
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Help us calibrate the developmental Tri-Ad cognitive mapper. Responses are stored in your local history logs and optionally included with premium orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            {/* Accuracy Rating */}
            <div className="space-y-2">
              <span id="rateLabel" className="block text-xs font-semibold text-slate-700">How accurate did this profile feel to you?</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="rateLabel">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setAccuracyRating(rating)}
                    role="radio"
                    aria-checked={accuracyRating === rating}
                    className={`w-11 h-11 rounded-xl text-xs font-black transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      accuracyRating === rating
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            {/* Would Share */}
            <div className="space-y-2">
              <span id="shareLabel" className="block text-xs font-semibold text-slate-700">Would you share this report with colleagues or social circles?</span>
              <div className="flex gap-2" role="radiogroup" aria-labelledby="shareLabel">
                <button
                  type="button"
                  onClick={() => setWouldShare(true)}
                  role="radio"
                  aria-checked={wouldShare === true}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    wouldShare === true
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWouldShare(false)}
                  role="radio"
                  aria-checked={wouldShare === false}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    wouldShare === false
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Would Pay */}
            <div className="space-y-2">
              <span id="payLabel" className="block text-xs font-semibold text-slate-700">Would you pay for a deeper manual report of this quality?</span>
              <div className="flex gap-2" role="radiogroup" aria-labelledby="payLabel">
                <button
                  type="button"
                  onClick={() => setWouldPayDeeper(true)}
                  role="radio"
                  aria-checked={wouldPayDeeper === true}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    wouldPayDeeper === true
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWouldPayDeeper(false)}
                  role="radio"
                  aria-checked={wouldPayDeeper === false}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    wouldPayDeeper === false
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* What felt most true */}
            <div className="space-y-2">
              <label htmlFor="feedback-most-true" className="block text-xs font-semibold text-slate-700">What felt most true in your archetype findings?</label>
              <textarea
                id="feedback-most-true"
                rows={3}
                value={mostTrue}
                onChange={(e) => setMostTrue(e.target.value)}
                placeholder="Describe what segments or vectors felt accurately articulated..."
                className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* What felt wrong */}
            <div className="space-y-2">
              <label htmlFor="feedback-most-wrong" className="block text-xs font-semibold text-slate-700">What felt wrong, inconsistent, or incorrect?</label>
              <textarea
                id="feedback-most-wrong"
                rows={3}
                value={mostWrong}
                onChange={(e) => setMostWrong(e.target.value)}
                placeholder="Identify where the metrics deviated or failed to map your mental models..."
                className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Footer actions block */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-150">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 leading-tight text-left font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span>Updates are private, saved offline matching your active calibration token ID.</span>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 font-display font-bold text-xs tracking-wider uppercase text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 flex items-center justify-center"
          >
            Commit Calibration Log
          </button>
        </div>

        {feedbackSaved && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-center text-xs font-bold rounded-2xl"
          >
            ✓ Calibration responses locked and committed offline inside this profile record successfully!
          </motion.div>
        )}
      </form>

      {/* Historical Logs Node */}
      {history.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 animate-pulse" />
              <h3 className="font-display text-lg font-bold text-gray-900">Local Profile Database</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-full">
                {history.length} Profile{history.length !== 1 && "s"} Tracked
              </span>
            </div>
            {history.length > 0 && onClearAllHistory && (
              isConfirmingAll ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10.5px] text-rose-600 font-semibold hidden md:inline">This clears ALL cached assessments:</span>
                  <button
                    onClick={() => {
                      onClearAllHistory();
                      setIsConfirmingAll(false);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10.5px] font-bold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    Confirm Clear All
                  </button>
                  <button
                    onClick={() => setIsConfirmingAll(false)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10.5px] font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingAll(true)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/40 hover:border-rose-300/60 text-rose-705 font-bold rounded-xl text-xs cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  Delete My Local Results
                </button>
              )
            )}
          </div>

          <div className="overflow-x-auto min-w-full">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-[#faf8f5]/40 font-mono text-[10px] uppercase font-semibold text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Assessor Name</th>
                  <th scope="col" className="px-4 py-3">Archetype (Code)</th>
                  <th scope="col" className="px-4 py-3 hidden md:table-cell">Imagination</th>
                  <th scope="col" className="px-4 py-3 hidden md:table-cell">Intuition</th>
                  <th scope="col" className="px-4 py-3 hidden md:table-cell">Judgment</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {history.map((record) => {
                  const isCurrent = record.id === result.id;
                  const itemArchetype = getArchetype(record.profileCode);

                  return (
                    <tr 
                      key={record.id} 
                      className={`transition-colors whitespace-nowrap ${
                        isCurrent ? "bg-indigo-50/20 font-bold text-indigo-950" : "hover:bg-slate-50/50"
                      }`}
                      style={{ contentVisibility: "auto" }}
                    >
                      <td className="px-4 py-3.5 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{record.userName}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md uppercase ml-1 animate-pulse">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs">{itemArchetype.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-wider">{record.profileCode}</div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell font-mono text-xs">
                        {record.macroScores.imagination}%
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell font-mono text-xs">
                        {record.macroScores.intuition}%
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell font-mono text-xs">
                        {record.macroScores.judgment}%
                      </td>
                      <td className="px-4 py-3.5 text-right font-normal">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectHistorical(record)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Load Profile View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {confirmDeleteId === record.id ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  onDeleteHistory(record.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(record.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                              title="Delete Node Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Premium Web Share Option Modal Overlay */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200/80 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Background pattern decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                  Share Portal
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-2">
                  Cognitive Share Blueprint
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Transmit your authentic calibrated {profileCode} core coordinate map.
                </p>
              </div>
              <button
                onClick={() => setIsShareOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-850 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two Choices layout: Elegant Text vs Full PDF */}
            <div className="space-y-4">
              
              {/* Option 1: Beautiful Text Summary */}
              <button
                onClick={handleShareText}
                className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/80 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all flex items-start gap-4 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-850 group-hover:text-indigo-900 transition-colors">
                    Option A: Share Identity Summary (Text)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Copies or shares clean, stylized markdown with scores, active strengths, code, and direct link. Optimized for social updates, Slack, and text channels.
                  </p>
                  
                  {/* Miniature live preview */}
                  <div className="mt-2.5 p-2 bg-white/80 border border-slate-100 rounded-lg text-[9px] font-mono text-slate-400 max-h-16 overflow-hidden select-none">
                    🔮 TRIAD COGNITIVE CALIBRATION...<br/>
                    Subject: {userName}<br/>
                    Identity: {profileCode} / {archetype.name}
                  </div>
                </div>
              </button>

              {/* Option 2: Share Premium PDF Document */}
              <button
                onClick={handleSharePDF}
                disabled={pdfSharingState === "generating" || pdfSharingState === "sharing"}
                className="w-full text-left p-4 bg-slate-50 hover:bg-indigo-50/10 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all flex items-start gap-4 cursor-pointer group disabled:opacity-85 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-850 group-hover:text-indigo-900 transition-colors">
                    Option B: Share Portrait Document (PDF)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Bundles a mathematical double-page PDF configuration report, sharing it natively on mobile or desktop. Falls back to dynamic download if native file-sharing is unsupported.
                  </p>

                  {/* Dynamic Sharing Status Badge */}
                  <div className="mt-3 flex items-center gap-2">
                    {pdfSharingState === "idle" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        ● READY_TO_COMPILE
                      </span>
                    )}
                    {pdfSharingState === "generating" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md animate-pulse">
                        ⌛ Compiling professional PDF metrics...
                      </span>
                    )}
                    {pdfSharingState === "sharing" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md animate-pulse">
                        ⚡ Invoking native communication channel selector...
                      </span>
                    )}
                    {pdfSharingState === "fallback" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-bounce">
                        ⚠️ File share unsupported. Report downloaded to device!
                      </span>
                    )}
                    {pdfSharingState === "done" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                        ✓ Transmission finished successfully!
                      </span>
                    )}
                  </div>
                </div>
              </button>

            </div>

            {/* Quick footer notification */}
            {shareCopied && (
              <div className="mt-4 p-2 bg-emerald-50 text-emerald-800 text-center font-semibold text-xs border border-emerald-200 rounded-xl">
                Text summary successfully copied to clipboard!
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                onClick={() => setIsShareOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
              >
                Close Portal
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* Email Capture Gate Modal before Download/Share */}
      {captureEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setCaptureEmailOpen(false)}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative z-10"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Secure Report Download
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verify your delivery email to retrieve your PDF blueprint files.
                </p>
              </div>
              <button
                onClick={() => setCaptureEmailOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCaptureEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Primary Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={captureEmailAddress}
                  onChange={(e) => {
                    setCaptureEmailAddress(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium transition-all"
                />
                {emailError && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{emailError}</p>
                )}
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
                * By submitting, your email is saved locally to register this assessment history and compile your customized document.
              </p>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCaptureEmailOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {captureAction === "download" ? "Download Report" : "Share Report"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Premium Order Placement Modal */}
      {premiumOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setPremiumOrderOpen(false)}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-yellow-600 bg-yellow-50 border border-yellow-105 px-2.5 py-1 rounded-lg">
                  ✦ Premium Exploratory Upgrade
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-2">
                  Request Premium Dossier
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Securely request an expanded 40-page blueprint document.
                </p>
              </div>
              <button
                onClick={() => setPremiumOrderOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Summary */}
            <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4 mb-5">
              <div className="text-xs text-indigo-700 font-semibold font-mono uppercase tracking-wider">
                Target Node Designation
              </div>
              <div className="flex justify-between items-end mt-1">
                <div>
                  <div className="text-md font-bold text-slate-950">{userName}</div>
                  <div className="text-xs text-slate-500 italic font-mono mt-0.5">Profile Coordinate: {profileCode}</div>
                </div>
                <div className="text-2xl font-black text-indigo-600 font-display">{profileCode}</div>
              </div>
            </div>

            {/* Order Form */}
            {premiumOrderStatus === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold">✓</span>
                </div>
                <h4 className="text-md font-bold text-slate-900">Premium Order Lodged!</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Requisition compiled and dispatched directly to the <span className="font-semibold text-slate-700">system administrator</span>. Delivery is scheduled shortly.
                </p>
                <button
                  onClick={() => setPremiumOrderOpen(false)}
                  className="mt-6 w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handlePremiumOrderSubmit} className="space-y-4">
                <div>
                  <label htmlFor="premium-email-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Delivery Email Address
                  </label>
                  <input
                    id="premium-email-input"
                    type="email"
                    required
                    placeholder="name@organization.com"
                    value={premiumOrderAddress}
                    onChange={(e) => {
                      setPremiumOrderAddress(e.target.value);
                      if (premiumOrderError) setPremiumOrderError("");
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="premium-invite-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Beta Invitation Code
                  </label>
                  <input
                    id="premium-invite-input"
                    type="text"
                    required
                    placeholder="Enter beta access key (e.g. BETA30)"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      if (premiumOrderError) setPremiumOrderError("");
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium transition-all"
                  />
                </div>

                {turnstileSiteKey && (
                  <div className="pt-1.5">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Security Verification
                    </label>
                    <div ref={turnstileContainerRef} className="cf-turnstile-wrapper bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-center min-h-[65px]" />
                  </div>
                )}

                {premiumOrderError && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{premiumOrderError}</p>
                )}

                <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">
                  ✦ <strong>Requisition Details:</strong> Complex blueprint reporting requires offline assembly. Submission sends an electronic notification to the <strong>system administrator</strong> who manually validates and dispatches your expanded 40-page blueprint PDF.
                </p>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setPremiumOrderOpen(false)}
                    className="flex-1 py-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={premiumOrderStatus === "submitting"}
                    className="flex-1 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {premiumOrderStatus === "submitting" ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place Premium Order"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
