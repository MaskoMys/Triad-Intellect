export interface TraitWeights {
  creativity: number;    // C
  innovation: number;    // I
  physical: number;      // P
  metaphysical: number;  // M
  discernment: number;   // D
  logical: number;       // L
  emotional: number;     // E
  predictive: number;    // R
}

export type TraitKey = keyof TraitWeights;

export interface QuestionOption {
  text: string;
  weights: Partial<TraitWeights>;
}

export interface Question {
  id: number;
  text: string;
  scenario: string; // The contextual setting/scenario
  options: QuestionOption[];
}

export interface MinMaxBound {
  min: number;
  max: number;
}

export type TraitBounds = Record<TraitKey, MinMaxBound>;

export interface TraitScores {
  creativity: number;
  innovation: number;
  physical: number;
  metaphysical: number;
  discernment: number;
  logical: number;
  emotional: number;
  predictive: number;
}

export interface MacroScores {
  imagination: number; // Avg of C, I
  intuition: number;   // Avg of P, M, D
  judgment: number;    // Avg of L, E, R
}

export interface ArchetypeDetails {
  code: string;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  challenges: string[];
  careerPaths: string[];
  extension?: {
    code: string; // "-F" or "-A"
    name: string; // "Fluid" or "Anchored"
    description: string; // explanation
  };
}

export interface AssessmentResult {
  id: string;
  timestamp: string;
  userName: string;
  userEmail?: string;
  rawScores: TraitWeights;
  normalizedScores: TraitScores;
  macroScores: MacroScores;
  profileCode: string;
  archetype: ArchetypeDetails;
  feedback?: BetaFeedback;
}

export interface BetaFeedback {
  accuracyRating?: number; // 1-5
  mostTrue?: string;
  mostWrong?: string;
  wouldShare?: boolean;
  wouldPayDeeper?: boolean;
}
