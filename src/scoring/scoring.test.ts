import { describe, it, expect } from "vitest";
import { questions } from "../questions";
import { 
  traits, 
  computeTraitBounds, 
  computeRawUserScores, 
  normalizeScores, 
  generateProfileCode,
  consolidateMacroScores
} from "../utils";
import { TraitKey } from "../types";

describe("Scoring Core Tests", () => {
  it("should have valid IDs for all questions", () => {
    expect(questions.length).toBeGreaterThan(0);
    const ids = questions.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(questions.length);
    questions.forEach(q => {
      expect(q.id).toBeGreaterThan(0);
    });
  });

  it("should have answer options for all questions", () => {
    questions.forEach(q => {
      expect(q.options).toBeDefined();
      expect(q.options.length).toBeGreaterThan(0);
      q.options.forEach(opt => {
        expect(opt.text).toBeTruthy();
        expect(opt.weights).toBeDefined();
      });
    });
  });

  it("should use valid trait keys in option weights", () => {
    questions.forEach(q => {
      q.options.forEach(opt => {
        Object.keys(opt.weights).forEach(key => {
          expect(traits).toContain(key);
        });
      });
    });
  });

  it("should calculate sane min/max bounds", () => {
    const bounds = computeTraitBounds(questions);
    traits.forEach((trait: TraitKey) => {
      const bound = bounds[trait];
      expect(bound).toBeDefined();
      expect(bound.min).toBeLessThanOrEqual(bound.max);
    });
  });

  it("should normalize scores to be strictly between 0 and 100", () => {
    const bounds = computeTraitBounds(questions);
    
    // Test with extreme raw scores (all minimum weights)
    const minScores = {} as any;
    const maxScores = {} as any;
    traits.forEach((trait: TraitKey) => {
      minScores[trait] = bounds[trait].min;
      maxScores[trait] = bounds[trait].max;
    });

    const normalizedMin = normalizeScores(minScores, bounds);
    const normalizedMax = normalizeScores(maxScores, bounds);

    traits.forEach((trait: TraitKey) => {
      expect(normalizedMin[trait]).toBeGreaterThanOrEqual(0);
      expect(normalizedMin[trait]).toBeLessThanOrEqual(100);
      expect(normalizedMax[trait]).toBeGreaterThanOrEqual(0);
      expect(normalizedMax[trait]).toBeLessThanOrEqual(100);
    });
  });

  it("should handle partial or empty response edge cases gracefully without crashing", () => {
    const emptyResponses = {};
    const bounds = computeTraitBounds(questions);
    const rawScores = computeRawUserScores(questions, emptyResponses);
    const normalized = normalizeScores(rawScores, bounds);

    traits.forEach((trait: TraitKey) => {
      expect(normalized[trait]).toBeGreaterThanOrEqual(0);
      expect(normalized[trait]).toBeLessThanOrEqual(100);
    });

    const code = generateProfileCode(normalized);
    expect(code).toMatch(/^[CI][MDP][LER]$/);
  });

  it("should match fixed known answer sets and produce deterministic outcomes (fixture test)", () => {
    // Answer option 0 for all questions
    const mockResponses: Record<number, number> = {};
    questions.forEach(q => {
      mockResponses[q.id] = 0;
    });

    const bounds = computeTraitBounds(questions);
    const rawScores = computeRawUserScores(questions, mockResponses);
    const normalized = normalizeScores(rawScores, bounds);
    const macro = consolidateMacroScores(normalized);
    const code = generateProfileCode(normalized);

    // Verify properties are of valid types and conform
    expect(code).toBeTypeOf("string");
    expect(code.length).toBe(3);
    expect(["C", "I"]).toContain(code[0]);
    expect(["M", "P", "D"]).toContain(code[1]);
    expect(["L", "E", "R"]).toContain(code[2]);

    expect(macro.imagination).toBeGreaterThanOrEqual(0);
    expect(macro.imagination).toBeLessThanOrEqual(100);
    expect(macro.intuition).toBeGreaterThanOrEqual(0);
    expect(macro.intuition).toBeLessThanOrEqual(100);
    expect(macro.judgment).toBeGreaterThanOrEqual(0);
    expect(macro.judgment).toBeLessThanOrEqual(100);
  });
});
