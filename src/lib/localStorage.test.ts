import { describe, it, expect, beforeEach, vi } from "vitest";
import { 
  sanitizeResultForStorage, 
  getHistoryFromStorage, 
  saveHistoryToStorage, 
  clearHistoryFromStorage 
} from "./localStorage";
import { AssessmentResult } from "../types";

// Setup a mock localStorage for environments where JSDOM is not loaded or for total robustness
const mockLocalStorage: Record<string, string> = {};
if (typeof window === "undefined" || !window.localStorage) {
  const localStorageMock = {
    getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockLocalStorage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(mockLocalStorage).forEach((k) => delete mockLocalStorage[k]);
    }),
  };
  Object.defineProperty(global, "localStorage", { value: localStorageMock });
}

describe("LocalStorage Privacy Utility & Syncing", () => {
  const mockResult: AssessmentResult = {
    id: "res-test-99",
    timestamp: "2026-06-16T00:00:00.000Z",
    userName: "Alexander Vance III (Senior Analyst)",
    userEmail: "vance.alexander@example-corp.com",
    rawScores: { creativity: 5, innovation: 10, physical: 0, metaphysical: 3, discernment: 4, logical: 8, emotional: 2, predictive: 5 },
    normalizedScores: { creativity: 50, innovation: 100, physical: 0, metaphysical: 30, discernment: 40, logical: 80, emotional: 20, predictive: 50 },
    macroScores: { imagination: 75, intuition: 23.3, judgment: 50 },
    profileCode: "CDL",
    archetype: {
      code: "CDL",
      name: "The Visionary Analyst",
      tagline: "Bridging creative synthesis and discrete structural assessment.",
      description: "Visual strategist.",
      strengths: [],
      challenges: [],
      careerPaths: []
    }
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe("sanitizeResultForStorage", () => {
    it("should strip userEmail from the record for offline safety", () => {
      const sanitized = sanitizeResultForStorage(mockResult);
      expect(sanitized.userEmail).toBeUndefined();
      expect("userEmail" in sanitized).toBe(false);
    });

    it("should trim and truncate the name to maximum 30 characters", () => {
      const longNameResult = {
        ...mockResult,
        userName: "  A extremely long name entered by a user that exceeds standard character bounds for tracking  "
      };
      const sanitized = sanitizeResultForStorage(longNameResult);
      expect(sanitized.userName.length).toBeLessThanOrEqual(30);
      expect(sanitized.userName).toBe("A extremely long name entered ");
    });

    it("should keep core metadata intact", () => {
      const sanitized = sanitizeResultForStorage(mockResult);
      expect(sanitized.id).toBe(mockResult.id);
      expect(sanitized.profileCode).toBe(mockResult.profileCode);
      expect(sanitized.macroScores.imagination).toBe(mockResult.macroScores.imagination);
    });
  });

  describe("History Operations", () => {
    it("should return empty array if no history is in storage", () => {
      const history = getHistoryFromStorage();
      expect(history).toEqual([]);
    });

    it("should save history after sanitizing and then retrieve it successfully", () => {
      saveHistoryToStorage([mockResult]);
      
      const history = getHistoryFromStorage();
      expect(history.length).toBe(1);
      
      const retrieved = history[0]!;
      expect(retrieved.id).toBe(mockResult.id);
      expect(retrieved.userEmail).toBeUndefined(); // Verification of privacy-safety
      expect(retrieved.userName).toBe("Alexander Vance III (Senior An"); // Truncated to 30 chars
    });

    it("should clear history from storage fully", () => {
      saveHistoryToStorage([mockResult]);
      expect(getHistoryFromStorage().length).toBe(1);
      
      clearHistoryFromStorage();
      expect(getHistoryFromStorage()).toEqual([]);
    });
  });
});
