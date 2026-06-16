import { AssessmentResult } from "../types";

const LOCAL_STORAGE_KEY = "tri_ad_attempts_v2";

/**
 * Sanitizes an AssessmentResult to protect user privacy before local storage.
 * Omit sensitive details like email addresses and minimize names.
 */
export function sanitizeResultForStorage(result: AssessmentResult): AssessmentResult {
  const sanitized = { ...result };
  
  // Safely remove user email if present - it's a privacy risk for unencrypted storage
  if ("userEmail" in sanitized) {
    delete sanitized.userEmail;
  }
  
  // Truncate name to a maximum of 30 characters to minimize storage footprint
  if (sanitized.userName) {
    sanitized.userName = sanitized.userName.trim().slice(0, 30);
  }
  
  return sanitized;
}

/**
 * Retrieves the full cognitive assessment history from LocalStorage.
 */
export function getHistoryFromStorage(): AssessmentResult[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      // Return and make sure pre-existing records are also sanitized
      return parsed.map(sanitizeResultForStorage);
    }
  } catch (e) {
    console.error("Failed to restore previous cognitive records:", e);
  }
  return [];
}

/**
 * Saves/commits the history of cognitive records into LocalStorage, with privacy protection.
 */
export function saveHistoryToStorage(history: AssessmentResult[]): void {
  try {
    const sanitizedHistory = history.map(sanitizeResultForStorage);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizedHistory));
  } catch (e) {
    console.error("Failed to commit assessment nodes to local storage:", e);
  }
}

/**
 * Deletes all cognitive records from LocalStorage.
 */
export function clearHistoryFromStorage(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear local cognitive records database:", e);
  }
}
