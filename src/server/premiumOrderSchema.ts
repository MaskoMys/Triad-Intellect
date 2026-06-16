export const PROFILE_CODES = [
  "CDL", "CDR", "CDE",
  "CPL", "CPR", "CPE",
  "CML", "CMR", "CME",
  "IDL", "IDR", "IDE",
  "IPL", "IPR", "IPE",
  "IML", "IMR", "IME"
] as const;

export type ProfileCode = typeof PROFILE_CODES[number];

export type PremiumOrderPayload = {
  name: string;
  email: string;
  profileCode: ProfileCode;
  macroScores: {
    imagination: number;
    intuition: number;
    judgment: number;
  };
  inviteCode: string;
  turnstileToken?: string;
  feedback?: {
    accuracyRating?: number;
    mostTrue?: string;
    mostWrong?: string;
    wouldShare?: boolean;
    wouldPayDeeper?: boolean;
  };
};

export function validatePremiumOrder(body: unknown): { success: true; data: PremiumOrderPayload } | { success: false; error: string } {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid payload layout." };
  }

  const raw = body as Record<string, any>;

  // 1. Validate name
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name || name.length > 80) {
    return { success: false, error: "Invalid name." };
  }

  // 2. Validate email
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!email || email.length > 254 || !emailRegex.test(email)) {
    return { success: false, error: "Invalid email." };
  }

  // 3. Validate profileCode
  const profileCode = typeof raw.profileCode === "string" ? raw.profileCode.trim().toUpperCase() : "";
  if (!PROFILE_CODES.includes(profileCode as ProfileCode)) {
    return { success: false, error: "Invalid profileCode." };
  }

  // 4. Validate macroScores
  const ms = raw.macroScores;
  if (
    !ms ||
    typeof ms !== "object" ||
    Array.isArray(ms) ||
    typeof ms.imagination !== "number" ||
    !Number.isFinite(ms.imagination) ||
    ms.imagination < 0 ||
    ms.imagination > 100 ||
    typeof ms.intuition !== "number" ||
    !Number.isFinite(ms.intuition) ||
    ms.intuition < 0 ||
    ms.intuition > 100 ||
    typeof ms.judgment !== "number" ||
    !Number.isFinite(ms.judgment) ||
    ms.judgment < 0 ||
    ms.judgment > 100
  ) {
    return { success: false, error: "Invalid macroScores." };
  }

  // 5. Validate inviteCode
  const inviteCode = typeof raw.inviteCode === "string" ? raw.inviteCode.trim() : "";
  if (!inviteCode) {
    return { success: false, error: "Invalid inviteCode." };
  }

  // 6. Optional turnstileToken
  const turnstileToken = typeof raw.turnstileToken === "string" ? raw.turnstileToken.trim() : undefined;

  // 7. Validate feedback
  let feedback: PremiumOrderPayload["feedback"] = undefined;
  if (raw.feedback && typeof raw.feedback === "object" && !Array.isArray(raw.feedback)) {
    const rawFb = raw.feedback as Record<string, any>;
    const accuracyRating = typeof rawFb.accuracyRating === "number" && 
                           Number.isFinite(rawFb.accuracyRating) && 
                           rawFb.accuracyRating >= 1 && 
                           rawFb.accuracyRating <= 5 ? rawFb.accuracyRating : undefined;

    const mostTrue = typeof rawFb.mostTrue === "string" ? rawFb.mostTrue.trim() : undefined;
    if (mostTrue && mostTrue.length > 1000) {
      return { success: false, error: "Feedback option 'mostTrue' is too long." };
    }

    const mostWrong = typeof rawFb.mostWrong === "string" ? rawFb.mostWrong.trim() : undefined;
    if (mostWrong && mostWrong.length > 1000) {
      return { success: false, error: "Feedback option 'mostWrong' is too long." };
    }

    const wouldShare = typeof rawFb.wouldShare === "boolean" ? rawFb.wouldShare : undefined;
    const wouldPayDeeper = typeof rawFb.wouldPayDeeper === "boolean" ? rawFb.wouldPayDeeper : undefined;

    feedback = {
      accuracyRating,
      mostTrue,
      mostWrong,
      wouldShare,
      wouldPayDeeper
    };
  }

  return {
    success: true,
    data: {
      name,
      email,
      profileCode: profileCode as ProfileCode,
      macroScores: {
        imagination: Math.round(ms.imagination),
        intuition: Math.round(ms.intuition),
        judgment: Math.round(ms.judgment)
      },
      inviteCode,
      turnstileToken,
      feedback
    }
  };
}
