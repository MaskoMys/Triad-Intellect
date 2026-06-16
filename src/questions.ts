import { Question } from "./types";

export const questions: Question[] = [
  // --- IMAGINATION-PRIMED QUESTIONS (1 - 10) ---
  {
    id: 1,
    text: "How do you approach a blank canvas or a clean-slate project?",
    scenario: "You are tasked with designing a habitat concept for a lunar outpost from scratch, with minimal constraints.",
    options: [
      {
        text: "I envision abstract, symbolic structures that integrate art with technology, prioritizing human inspiration.",
        weights: { creativity: 2, innovation: -1, physical: 0, metaphysical: 1, logical: -1 }
      },
      {
        text: "I immediately map out existing designs, looking for modules to reconfigure, optimize, and safely assemble.",
        weights: { creativity: -1, innovation: 2, logical: 1, physical: 1, predictive: 0 }
      },
      {
        text: "I trust my initial visceral gut feeling about how visitors will navigate and inhabit the space physically.",
        weights: { physical: 2, discernment: 1, creativity: 1, predictive: -1 }
      },
      {
        text: "I model historical patterns of closed-habitat collapses to project structural risks over a 50-year horizon.",
        weights: { predictive: 2, logical: 1, discernment: 1, creativity: -1 }
      }
    ]
  },
  {
    id: 2,
    text: "A complex automation system you rely on fails. How do you construct a replacement?",
    scenario: "Your team's custom software compiler encounters a logical loop that halts development indefinitely.",
    options: [
      {
        text: "I devise an entirely novel, unproven programming paradigm that bypasses typical compiler constraints.",
        weights: { creativity: 2, innovation: 1, discernment: -1, predictive: -1 }
      },
      {
        text: "I synthesize two open-source frameworks, optimizing their configuration to resolve the block efficiently.",
        weights: { innovation: 2, logical: 1, predictive: 1, creativity: -1 }
      },
      {
        text: "I run empirical unit tests, dissecting the raw stack trace line-by-line to isolate the mechanical rule-break.",
        weights: { logical: 2, discernment: 1, emotional: -1, innovation: 0 }
      },
      {
        text: "I reflect on the team's working dynamics, diagnosing if cognitive stress is driving code quality degradation.",
        weights: { emotional: 2, metaphysical: 1, predictive: -1, innovation: -1 }
      }
    ]
  },
  {
    id: 3,
    text: "What drives your interest when exploring an unfamiliar city?",
    scenario: "You have a free afternoon in an ancient metropolis with rich layers of history and sensory elements.",
    options: [
      {
        text: "I seek out avant-garde art installations, interpreting the symbolic and deeper abstract meaning of the architecture.",
        weights: { creativity: 2, metaphysical: 1, physical: -1, innovation: -1, predictive: -1 }
      },
      {
        text: "I analyze the transit grids, public spaces, and urban layouts to understand how they can be streamlined.",
        weights: { innovation: 2, logical: 1, predictive: 1, physical: 0 }
      },
      {
        text: "I immerse myself in the raw sights, spices, sounds, and manual crafts, absorbing the ambient energy of the markets.",
        weights: { physical: 2, metaphysical: 1, discernment: -1 }
      },
      {
        text: "I trace the historical rises and declines of the city’s ports to forecast its upcoming socioeconomic shifts.",
        weights: { predictive: 2, logical: 1, creativity: -1 }
      }
    ]
  },
  {
    id: 4,
    text: "How do you behave when a sudden technical bottleneck threatens a product launch?",
    scenario: "A server outage occurs hours before a public release, and traditional troubleshooting is slow.",
    options: [
      {
        text: "I suggest a bold, unconventional rollback model that uses alternative peer-to-peer data relays.",
        weights: { creativity: 2, innovation: 1, discernment: -1, physical: 0 }
      },
      {
        text: "I rapidly audit the emergency playbook, patching together existing server rerouting scripts.",
        weights: { innovation: 2, logical: 1, predictive: 1, creativity: -1 }
      },
      {
        text: "I maintain deep physical calmness, monitoring hardware indicators, port loads, and raw system telemetry.",
        weights: { physical: 2, discernment: 1, emotional: -1, predictive: -1 }
      },
      {
        text: "I gather the engineers, keeping morale steady, mediating panic, and protecting collective psychological safety.",
        weights: { emotional: 2, metaphysical: 1, creativity: 1, predictive: -1, innovation: -1 }
      }
    ]
  },
  {
    id: 5,
    text: "What form does your personal problem-solving sketchpad take?",
    scenario: "You are tackling an ambiguous, high-stakes system challenge and decide to draft your initial vision.",
    options: [
      {
        text: "Metaphorical doodles, symbolic maps, and free-association words that provoke non-linear ideas.",
        weights: { creativity: 2, metaphysical: 2, logical: -2, innovation: -2, predictive: -1 }
      },
      {
        text: "Structured flowcharts and system diagrams showing how modular pieces can integrate perfectly.",
        weights: { innovation: 2, logical: 2, creativity: -1, predictive: 1 }
      },
      {
        text: "An empirical inventory of historical data points, rule boundaries, and strict logical constraints.",
        weights: { logical: 2, discernment: 1, emotional: -1 }
      },
      {
        text: "An impact matrix mapping team sentiments, user friction points, and human relationships.",
        weights: { emotional: 2, physical: 1, creativity: 1 }
      }
    ]
  },
  {
    id: 6,
    text: "How do you conceptualize the evolutionary trajectory of artificial intelligence?",
    scenario: "You are speaking on a panel about the future of automation and cognitive technology.",
    options: [
      {
        text: "As a potential awakening of a new non-material consciousness, shifting the metaphysical paradigm of existence.",
        weights: { metaphysical: 2, creativity: 2, logical: -1, physical: -1, predictive: -2, innovation: -1 }
      },
      {
        text: "As a highly advanced statistical optimizer built to parse patterns and enhance existing economic frameworks.",
        weights: { innovation: 2, logical: 2, predictive: 1, creativity: -1 }
      },
      {
        text: "As a mechanical threat to human connection that requires deep ethical guardrails to protect empathy.",
        weights: { emotional: 2, discernment: 1, physical: 1, innovation: -1, predictive: -1 }
      },
      {
        text: "As a feedback loop of historical data, where neural networks reproduce and amplify long-term cyclical trends.",
        weights: { predictive: 2, logical: 1, creativity: 0 }
      }
    ]
  },
  {
    id: 7,
    text: "When an expert presents an unproven 'creative breakthrough', what is your response?",
    scenario: "A prominent consultant proposes an artistic and completely untested marketing scheme to your board.",
    options: [
      {
        text: "I feel invigorated by the sheer aesthetic novelty and seek to expand its symbolic and abstract depth.",
        weights: { creativity: 2, metaphysical: 1, discernment: -2, logical: -1 }
      },
      {
        text: "I immediately try to ground it, planning how it can adapt to optimize our current stable channels.",
        weights: { innovation: 2, logical: 1, predictive: 1, creativity: -1 }
      },
      {
        text: "I systematically poke holes in the proposal, testing its logical consistency against hard historical feedback.",
        weights: { discernment: 2, logical: 2, emotional: -1, creativity: 0 }
      },
      {
        text: "I gauge the board room's body language and emotional hesitation, observing non-verbal resistance.",
        weights: { physical: 2, discernment: 1, emotional: 1 }
      }
    ]
  },
  {
    id: 8,
    text: "How do you design a workspace or environment for optimal cognitive focus?",
    scenario: "You are redesigning your home office to maximize your mental productivity and stress management.",
    options: [
      {
        text: "An ambient, dreamlike sanctuary with subtle incense, lighting, and elements that connect to a wider unseen space.",
        weights: { metaphysical: 2, creativity: 1, physical: 0, discernment: -1 }
      },
      {
        text: "An ergonomic, highly organized workstation optimized physically for posture, heat, and physical movement.",
        weights: { physical: 2, innovation: 1, logical: 1, creativity: -1 }
      },
      {
        text: "A modular setup with whiteboards and dynamic shelving, designed specifically to pivot between tasks.",
        weights: { innovation: 2, creativity: 1, discernment: 1 }
      },
      {
        text: "A minimal, highly structured desk governed by strict routines, tracking apps, and scheduled time-blocks.",
        weights: { logical: 2, predictive: 2, emotional: -1 }
      }
    ]
  },
  {
    id: 9,
    text: "In collaborative storytelling or roleplay, which role do you naturally assume?",
    scenario: "Your team is running a creative simulation game to build a hypothetical future state.",
    options: [
      {
        text: "The lore-weaver, inventing mythology, bizarre cosmic rules, and rich symbolic narratives.",
        weights: { creativity: 2, metaphysical: 2, logical: -1, innovation: 0 }
      },
      {
        text: "The infrastructure builder, engineering efficient gear, compiling resource tables, and maximizing systems.",
        weights: { innovation: 2, logical: 1, physical: 1, creativity: -1 }
      },
      {
        text: "The arbiter, mediating conflicting viewpoints, feeling out character intentions, and ensuring alignment.",
        weights: { emotional: 2, discernment: 1, physical: 1 }
      },
      {
        text: "The master strategist, forecasting opponent counterplays based on historical game theory cycles.",
        weights: { predictive: 2, logical: 1, discernment: 2 }
      }
    ]
  },
  {
    id: 10,
    text: "How do you evaluate historical architecture or monuments?",
    scenario: "You are standing outside a beautifully preserved, gothic cathedral.",
    options: [
      {
        text: "I wonder about the deep transcendent mysteries and the spiritual devotions of the stonemasons who carved it.",
        weights: { metaphysical: 2, creativity: 1, physical: -1 }
      },
      {
        text: "I dissect the structural engineering—how flying buttresses distribute physical load and allow taller structures.",
        weights: { physical: 2, logical: 1, innovation: 1, metaphysical: -1 }
      },
      {
        text: "I adapt its structural patterns to innovate modern modular framing systems in high-density areas.",
        weights: { innovation: 2, creativity: 1, logical: 1 }
      },
      {
        text: "I view it as an emblem of medieval societal organization, modeling the power hierarchies of its era.",
        weights: { predictive: 2, logical: 2, emotional: -1 }
      }
    ]
  },

  // --- INTUITION-PRIMED QUESTIONS (11 - 20) ---
  {
    id: 11,
    text: "When entering a filled boardroom, what is your first unconscious observation?",
    scenario: "You walk into an active, high-context negotiation meeting that holds crucial implications.",
    options: [
      {
        text: "Micro-movements: who shifted back, who is sweating, and the precise somatic 'vibe' in the cold air.",
        weights: { physical: 2, logical: 0, creativity: -1, discernment: 1 }
      },
      {
        text: "The underlying field: a distinct sense of invisible karmic, energetic, or spiritual flows directing the room.",
        weights: { metaphysical: 2, creativity: 1, logical: -2, physical: 0 }
      },
      {
        text: "The logical configuration: who sits where based on corporate hierarchies, voting blocs, and formal terms.",
        weights: { logical: 2, predictive: 1, emotional: -1 }
      },
      {
        text: "An immediate, sharp analytical filter: separating performance and drama from the actual hard objectives.",
        weights: { discernment: 2, logical: 1, emotional: -2 }
      }
    ]
  },
  {
    id: 12,
    text: "How do you experience sudden personal inspiration (the 'Aha!' moment)?",
    scenario: "You are relaxing, far away from your work, when suddenly a profound connection snaps into place.",
    options: [
      {
        text: "As a sudden, vivid visual or symbolic image that seems to have come from a source outside myself.",
        weights: { creativity: 1, metaphysical: 2, logical: -1, physical: -1 }
      },
      {
        text: "As a tactile sensation or physical surge—a warmth in my stomach, goosebumps, or sudden somatic clarity.",
        weights: { physical: 2, discernment: 1, innovation: 0 }
      },
      {
        text: "As an instant, structured matrix where a messy problem is suddenly organized, ready to filter and deploy.",
        weights: { discernment: 2, innovation: 2, logical: 1 }
      },
      {
        text: "As a temporal foresight—instantly seeing how a chain of current actions will play out into the deep future.",
        weights: { predictive: 2, logical: 1, creativity: 1 }
      }
    ]
  },
  {
    id: 13,
    text: "How do you handle a crisis when data is completely missing and you must act instantly?",
    scenario: "An emergency requires immediate navigation choices in an unfamiliar facility.",
    options: [
      {
        text: "I rely on my immediate somatic reflex and spatial sensory feedback to guide my physical coordinates.",
        weights: { physical: 2, discernment: 1, logical: -1 }
      },
      {
        text: "I call on a form of spiritual trust, letting an unseen inner compass direct my steps.",
        weights: { metaphysical: 2, creativity: 1, logical: -2, discernment: 0 }
      },
      {
        text: "I rapidly cross-reference what little I see, filtering out red herrings to execute a calculated gamble.",
        weights: { discernment: 2, logical: 2, innovation: 0 }
      },
      {
        text: "I predict the path of least resistance based on standard human stampede and threat-response models.",
        weights: { predictive: 2, emotional: 1, physical: 0 }
      }
    ]
  },
  {
    id: 14,
    text: "What makes you highly skeptical of a new, well-reasoned plan?",
    scenario: "A highly logical colleague presents a flawless, spreadsheet-supported financial restructure.",
    options: [
      {
        text: "I notice subtle, physical signs of anxiety, over-rehearsal, or micro-ticks in their presentation delivery.",
        weights: { physical: 2, discernment: 1, logical: -1 }
      },
      {
        text: "I sense a deep, foreboding energetic misalignment—a gut warning that the core motive is somehow compromised.",
        weights: { metaphysical: 2, emotional: 1, logical: -2 }
      },
      {
        text: "The formulas ignore human variables—the team will burn out, break relationships, and destroy goodwill.",
        weights: { emotional: 2, discernment: 1, logical: -1 }
      },
      {
        text: "My analytical filter spots hidden, circular arguments or over-indexing on best-case scenario assumptions.",
        weights: { discernment: 2, logical: 2, predictive: 1 }
      }
    ]
  },
  {
    id: 15,
    text: "How do you interact with ancient ruins or sacred historic spaces?",
    scenario: "You are visiting a thousands-of-years-old burial ground or ceremonial site.",
    options: [
      {
        text: "I feel an intense, somber chill or electromagnetic shift, as if the site is humming with non-physical memory.",
        weights: { metaphysical: 2, physical: 1, logical: -1 }
      },
      {
        text: "I physically trace the masonry, assessing thermal conditions, acoustic resonance, and raw weight of materials.",
        weights: { physical: 2, innovation: 1, logical: 1 }
      },
      {
        text: "I analyze how the builders oriented the geometry to filter astronomical variables or calculate seasonal cycles.",
        weights: { logical: 2, predictive: 2, discernment: 1 }
      },
      {
        text: "I envision creative narratives of the lives, dramas, and social rituals of those who stood there.",
        weights: { creativity: 2, emotional: 1, metaphysical: 0 }
      }
    ]
  },
  {
    id: 16,
    text: "When mentoring someone, what is your primary diagnostic focus?",
    scenario: "A junior peer is struggling to perform, and you have set up a 1-on-1 session.",
    options: [
      {
        text: "I check their physical tension and breathing patterns, helping them regulate physical stress first.",
        weights: { physical: 2, emotional: 1, discernment: 0 }
      },
      {
        text: "I probe their underlying dream-states, creative fire, and whether their spirit is aligned with this mission.",
        weights: { metaphysical: 2, creativity: 1, logical: -1 }
      },
      {
        text: "I strip away excuses, doing a objective checklist audit to identify where their method is breaking logic.",
        weights: { discernment: 2, logical: 2, emotional: -1 }
      },
      {
        text: "I model their learning speed to forecast their competence trajectory over the next six months.",
        weights: { predictive: 2, logical: 1, discernment: 1 }
      }
    ]
  },
  {
    id: 17,
    text: "How do you distinguish between genuine intuitive insight and wishful thinking?",
    scenario: "You have a sudden, strong impulse to make a major career pivot or investment decision.",
    options: [
      {
        text: "I cross-examine the impulse, actively seeking disconfirming evidence to stress-test my own hope.",
        weights: { discernment: 2, logical: 2, creativity: -1, metaphysical: 0 }
      },
      {
        text: "I wait to see if the dream or energetic calling recurs in deep meditation and symbolic synchronicities.",
        weights: { metaphysical: 2, creativity: 1, discernment: -1 }
      },
      {
        text: "I test it physically—how does my body react when I speak the path out loud? Muscle tension speaks truths.",
        weights: { physical: 2, emotional: 1, logical: -1 }
      },
      {
        text: "I trace the historical patterns of similar pivots to model the most statistically probable outcome.",
        weights: { predictive: 2, logical: 1, discernment: 0 }
      }
    ]
  },
  {
    id: 18,
    text: "What is your primary source of clarity when feeling mentally congested?",
    scenario: "You are experiencing severe executive burnout from a multi-week, high-stress engineering project.",
    options: [
      {
        text: "High-intensity physical exertion, hot/cold therapy, or deep manual craftwork that anchors me to the earth.",
        weights: { physical: 2, discernment: 1, creativity: 0 }
      },
      {
        text: "Solitary contemplation in raw nature, sensory deprivation, or dream-work to realign spiritual energy fields.",
        weights: { metaphysical: 2, creativity: 1, physical: 0 }
      },
      {
        text: "Constructing exhaustive lists and schedules, purging chaos by enforcing strict logical containment.",
        weights: { logical: 2, predictive: 1, discernment: 1 }
      },
      {
        text: "Inventing an entirely fictional world, drawing surreal art, or writing non-linear poetry.",
        weights: { creativity: 2, metaphysical: 1, logical: -1 }
      }
    ]
  },
  {
    id: 19,
    text: "A partner's communication shifts slightly. How do you assess the situation?",
    scenario: "Your close collaborator sends unusually brief, highly formal emails for three consecutive days.",
    options: [
      {
        text: "I analyze the precise vocal inflection or posture shifts in our next brief face-to-face contact.",
        weights: { physical: 2, emotional: 1, discernment: 1 }
      },
      {
        text: "I feel onto their astral footprint or the energetic cord between us; I immediately sense an energetic withdrawal.",
        weights: { metaphysical: 2, emotional: 1, logical: -2 }
      },
      {
        text: "I logically review our past agreements, evaluating if my recent deliverables breached any objective metrics.",
        weights: { logical: 2, discernment: 1, predictive: 1 }
      },
      {
        text: "I look at current stress cycles—comparing their workload historic curves to forecast when they’ll stabilize.",
        weights: { predictive: 2, emotional: 1, logical: 1 }
      }
    ]
  },
  {
    id: 20,
    text: "What is your stance on phenomena that defy current scientific validation?",
    scenario: "You are reading a study about anomalies in consciousness research or quantum biology.",
    options: [
      {
        text: "I am deeply receptive; current science is a temporary system, whereas metaphysical reality is infinite.",
        weights: { metaphysical: 2, creativity: 2, logical: -1, discernment: -1 }
      },
      {
        text: "I demand systematic, repeatable double-blind trials, actively trying to debunk logical weaknesses.",
        weights: { discernment: 2, logical: 2, metaphysical: -2, predictive: 0 }
      },
      {
        text: "I focus on the mechanical utility—can we replicate the physical effects or use these dynamics practically?",
        weights: { innovation: 2, physical: 1, logical: 1, metaphysical: -1 }
      },
      {
        text: "I track if these anomalies fit long-wave historical phases of intellectual paradigm shifts.",
        weights: { predictive: 2, logical: 1, creativity: 1 }
      }
    ]
  },

  // --- JUDGMENT-PRIMED QUESTIONS (21 - 30) ---
  {
    id: 21,
    text: "A team member breaks a major protocol but does so for a highly compassionate cause. How do you rule?",
    scenario: "An employee bypasses privacy layers to deliver critical medical alerts to a coworker’s emergency contact.",
    options: [
      {
        text: "Rules are system-critical; I issue a formal, objective reprimand to protect legal and operational integrity.",
        weights: { logical: 2, discernment: 1, emotional: -2, predictive: 1 }
      },
      {
        text: "I pardon the infraction completely; human welfare, trust, and empathy always supersede procedural rules.",
        weights: { emotional: 2, physical: 1, logical: -2, discernment: -1 }
      },
      {
        text: "I redesign the protocol itself, innovating a dynamic safety bypass that accommodates future humanitarian needs.",
        weights: { innovation: 2, creativity: 1, logical: 1, predictive: 1 }
      },
      {
        text: "I look at the long-term systemic precedent, modeling how a pardon might affect our compliance metrics over 5 years.",
        weights: { predictive: 2, logical: 1, discernment: 1, emotional: -1 }
      }
    ]
  },
  {
    id: 22,
    text: "What is your primary metric of 'truth' when selecting a strategic direction?",
    scenario: "Your division must commit to a multi-million-dollar technology framework update.",
    options: [
      {
        text: "Axiomatic proof: flawless deductive reasoning, clear source code, and mechanical mathematical models.",
        weights: { logical: 2, discernment: 2, emotional: -2 }
      },
      {
        text: "Human resonance: the shared enthusiasm, psychological alignment, and collective heart of the development team.",
        weights: { emotional: 2, metaphysical: 1, physical: 1, logical: -1 }
      },
      {
        text: "Predictive stability: how robustly this framework matches historical macro-patterns of technology life cycles.",
        weights: { predictive: 2, logical: 1, discernment: 1 }
      },
      {
        text: "Active synthesis: combining elements of the old and new systems to form a customized, high-yield hybrid.",
        weights: { innovation: 2, creativity: 1, discernment: 1 }
      }
    ]
  },
  {
    id: 23,
    text: "How do you deliver highly critical performance feedback?",
    scenario: "A highly talented but erratic lead architect is continuously missing mission-critical milestones.",
    options: [
      {
        text: "With absolute structural clarity, matching performance data directly against the formal contract agreements.",
        weights: { logical: 2, discernment: 1, emotional: -1 }
      },
      {
        text: "With high emotional intelligence: framing it with relational warmth, validating their feelings, and healing stress.",
        weights: { emotional: 2, physical: 1, metaphysical: 1, logical: -1 }
      },
      {
        text: "With long-range projections, demonstrating how their current bottleneck will delay subsequent launches in Q4.",
        weights: { predictive: 2, logical: 1, discernment: 1 }
      },
      {
        text: "With creative storytelling and metaphors, sparking their imagination to envision their own path to excellence.",
        weights: { creativity: 2, metaphysical: 1, logical: -1 }
      }
    ]
  },
  {
    id: 24,
    text: "When facing a high-stakes ethical dilemma, what rules your conscience?",
    scenario: "Your product algorithm must balance user data monetization against strict user privacy standards.",
    options: [
      {
        text: "Universal logical principles: If the practice cannot be made a universal mechanical law, it is strictly wrong.",
        weights: { logical: 2, discernment: 2, emotional: -1 }
      },
      {
        text: "Aesthetic harmony: I feel an internal spiritual disturbance; if it feels dark or toxic energetically, it is wrong.",
        weights: { metaphysical: 2, creativity: 1, physical: 1, logical: -1 }
      },
      {
        text: "Human connection: Minimizing distress, supporting vulnerable users, and maintaining healthy societal bonds.",
        weights: { emotional: 2, physical: 1, discernment: 0 }
      },
      {
        text: "Generational forecasting: The systemic butterfly effect of this decision on the digital rights of our children.",
        weights: { predictive: 2, logical: 1, creativity: 1 }
      }
    ]
  },
  {
    id: 25,
    text: "How do you prioritize design features when building a consumer interface?",
    scenario: "You are the head of product for a wellness and diagnostic software platform.",
    options: [
      {
        text: "Strict accessibility standards, clear rules, consistent navigation, and absolute data clarity.",
        weights: { logical: 2, physical: 1, creativity: -1 }
      },
      {
        text: "Emotional warmth: delighting the user with responsive feedback, encouraging copy, and comfortable visuals.",
        weights: { emotional: 2, creativity: 1, logical: -1 }
      },
      {
        text: "Foresight loops: setting up smart tracking that anticipates user health dips based on multi-week cyclical data.",
        weights: { predictive: 2, innovation: 1, discernment: 1 }
      },
      {
        text: "Dynamic sensory micro-interactions that somatic users 'feel' through tactile haptic response.",
        weights: { physical: 2, creativity: 1, metaphysical: 1 }
      }
    ]
  },
  {
    id: 26,
    text: "When an argument gets heated, what is your conflict resolution style?",
    scenario: "You are mediating an argument between the CTO and the Head of Design regarding product launch scope.",
    options: [
      {
        text: "I break the dispute into axiomatic propositions, isolating and discarding logical inconsistencies on both sides.",
        weights: { logical: 2, discernment: 2, emotional: -2 }
      },
      {
        text: "I hold space for their feelings, ensuring both feel deeply heard, valued, and unified in their mutual human bond.",
        weights: { emotional: 2, physical: 1, metaphysical: 1, discernment: -1 }
      },
      {
        text: "I map their paths on a timeline, demonstrating that both are describing phases of the exact same product lifecycle.",
        weights: { predictive: 2, logical: 1, innovation: 1 }
      },
      {
        text: "I design an elegant, hybrid concept that incorporates both engineering constraints and artistic visions.",
        weights: { innovation: 2, creativity: 2, logical: 1 }
      }
    ]
  },
  {
    id: 27,
    text: "How do you gauge the health and potential of a business or enterprise?",
    scenario: "You are auditing a disruptive company for potential acquisition or deep strategic partnership.",
    options: [
      {
        text: "An exhaustive mechanical audit of their ledger sheets, technical codebases, and physical plant efficiency.",
        weights: { logical: 2, physical: 1, emotional: -2 }
      },
      {
        text: "The relational synergy, customer loyalty sentiment index, and psychological climate of the labor force.",
        weights: { emotional: 2, discernment: 1, metaphysical: 1 }
      },
      {
        text: "Their strategic positioning against macro kondratiev or techno-economic long waves over a 15-year scale.",
        weights: { predictive: 2, logical: 1, discernment: 1 }
      },
      {
        text: "Their core creative IP portfolio and capacity to obsolete their own products through radical reinvention.",
        weights: { creativity: 2, innovation: 2, physical: 0 }
      }
    ]
  },
  {
    id: 28,
    text: "What is your main concern regarding the rise of decentralized smart contracts?",
    scenario: "Your company is considering moving its vendor payment infrastructure onto a global public ledger.",
    options: [
      {
        text: "Whether the mathematical parser has compiler vulnerabilities that violate logical contract boundaries.",
        weights: { logical: 2, discernment: 2, emotional: -1 }
      },
      {
        text: "The lack of human consensus: software cannot feel distress, adjust for emergencies, or practice human mercy.",
        weights: { emotional: 2, physical: 1, logical: -2 }
      },
      {
        text: "The systemic volatility: how transaction bottlenecks will match energy cycles and economic volatility.",
        weights: { predictive: 2, logical: 1, innovation: 1 }
      },
      {
        text: "Whether we can build custom, hybrid ledgers that bridge old legal frameworks with next-gen automated nodes.",
        weights: { innovation: 2, creativity: 1, physical: 0 }
      }
    ]
  },
  {
    id: 29,
    text: "What makes a historical leader truly respect-worthy in your eyes?",
    scenario: "You are analyzing biographies of great historic figures for a leadership training manual.",
    options: [
      {
        text: "Their commitment to codifying equitable laws, maintaining logical standards, and respecting systemic rules.",
        weights: { logical: 2, discernment: 1, emotional: -1 }
      },
      {
        text: "Their intense care for the defenseless, emotional connection with the public, and massive humanitarian works.",
        weights: { emotional: 2, metaphysical: 1, physical: 1, logical: -1 }
      },
      {
        text: "Their prophetic temporal maps—the uncanny ability to predict historical pivot points and act precisely.",
        weights: { predictive: 2, logical: 1, discernment: 1 }
      },
      {
        text: "Their capacity to inspire humanity by introducing grand, creative, and symbolic visions of what could be.",
        weights: { creativity: 2, metaphysical: 1, physical: 0 }
      }
    ]
  },
  {
    id: 30,
    text: "How do you decide which books or articles are worth your time?",
    scenario: "You are building a reading queue for a week-long mental retreat.",
    options: [
      {
        text: "Rigorous scientific treatises or philosophy books based on systematic proof and logical structures.",
        weights: { logical: 2, discernment: 2, creativity: -1 }
      },
      {
        text: "Biographies and psychological studies shedding light on emotional layers, empathy, and human relationships.",
        weights: { emotional: 2, physical: 1, metaphysical: 1 }
      },
      {
        text: "Futurology, historical cycles, and predictive modelings of geopolitical or technological evolution.",
        weights: { predictive: 2, logical: 1, discernment: 1 }
      },
      {
        text: "Immersive magical realism, surrealist speculative sci-fi, or deep esoteric poetry.",
        weights: { creativity: 2, metaphysical: 2, logical: -2 }
      }
    ]
  }
];
