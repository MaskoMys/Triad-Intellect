import { describe, it, expect } from "vitest";
import { getArchetype } from "../utils";
import { ArchetypeDetails } from "../types";

const possibleArchetypes = [
  "CDL", "CDR", "CDE", "CPL", "CPR", "CPE", "CML", "CMR", "CME",
  "IDL", "IDR", "IDE", "IPL", "IPR", "IPE", "IML", "IMR", "IME"
];

describe("Archetypes Database Validation Tests", () => {
  it("should ensure all 18 archetypes exist and are validly retrieved", () => {
    possibleArchetypes.forEach(code => {
      const arch: ArchetypeDetails = getArchetype(code);
      
      expect(arch).toBeDefined();
      expect(arch.code).toBe(code);
      expect(arch.name).toBeTruthy();
      expect(arch.tagline).toBeTruthy();
      expect(arch.description).toBeTruthy();
      
      expect(Array.isArray(arch.strengths)).toBe(true);
      expect(arch.strengths.length).toBeGreaterThan(0);
      
      expect(Array.isArray(arch.challenges)).toBe(true);
      expect(arch.challenges.length).toBeGreaterThan(0);
      
      expect(Array.isArray(arch.careerPaths)).toBe(true);
      expect(arch.careerPaths.length).toBeGreaterThan(0);
    });
  });

  it("should return stable default pioneer profile for unknown/invalid archetype code", () => {
    const fallback = getArchetype("XYZ");
    expect(fallback).toBeDefined();
    expect(fallback.code).toBe("XYZ");
    expect(fallback.name).toBe("The Cognitive Pioneer");
    expect(fallback.tagline).toBeTruthy();
    expect(fallback.description).toBeTruthy();
    expect(fallback.strengths.length).toBeGreaterThan(0);
  });
});
