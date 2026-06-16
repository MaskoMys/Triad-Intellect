import { describe, it, expect, vi, beforeEach } from "vitest";
import { onRequestPost } from "../../functions/api/premium-order";
import { validatePremiumOrder } from "../server/premiumOrderSchema";
import { escapeHtml, sanitizeSubjectPart } from "../server/safeText";

describe("Cloudflare Pages /api/premium-order Validator and Helper Tests", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() => 
      Promise.resolve(
        new Response(JSON.stringify({ success: true, id: "msg_123" }), { status: 200 })
      )
    ));
  });

  const createMockContext = (payload: any, sizeOverride?: number, customEnv?: any) => {
    const payloadStr = JSON.stringify(payload);
    const textData = sizeOverride !== undefined ? "x".repeat(sizeOverride) : payloadStr;
    
    const req = {
      text: () => Promise.resolve(textData),
      headers: {
        get: (headerName: string) => {
          if (headerName.toLowerCase() === "content-length") {
            return String(textData.length);
          }
          return null;
        }
      },
      url: "https://localhost/api/premium-order"
    } as unknown as Request;

    return {
      request: req,
      env: customEnv || {
        RECEIVER_EMAIL: "recipient@example.com",
        FROM_EMAIL: "sender@example.com",
        RESEND_API_KEY: "re_mock_api_key_test_123",
        BETA_INVITE_CODE: "BETA_TEST_123"
      },
      params: {},
      waitUntil: () => {}
    };
  };

  const getValidPayload = () => ({
    email: "test@example.com",
    name: "Sovereign Candidate",
    profileCode: "CDL",
    macroScores: {
      imagination: 75,
      intuition: 80,
      judgment: 50
    },
    inviteCode: "BETA_TEST_123"
  });

  // 1. validator accepts valid payload
  it("should validate and accept correct payloads cleanly in validatePremiumOrder", () => {
    const payload = getValidPayload();
    const result = validatePremiumOrder(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.profileCode).toBe("CDL");
      expect(result.data.macroScores.imagination).toBe(75);
    }
  });

  it("should accept valid payloads in onRequestPost and return 200", async () => {
    const payload = getValidPayload();
    const context = createMockContext(payload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(200);

    const body = (await response.json()) as any;
    expect(body.ok).toBe(true);
    expect(body.success).toBe(true);
  });

  // 2. invalid email rejected
  it("should reject invalid email in validator and return false", () => {
    const payload = { ...getValidPayload(), email: "not-an-email" };
    const result = validatePremiumOrder(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid email");
    }
  });

  it("should reject invalid email inside onRequestPost", async () => {
    const payload = { ...getValidPayload(), email: "not-an-email" };
    const context = createMockContext(payload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(400);

    const body = (await response.json()) as any;
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Unable to submit this request.");
  });

  it("should reject emails that are too long (> 254)", () => {
    const payload = { ...getValidPayload(), email: "a".repeat(250) + "@test.com" };
    const result = validatePremiumOrder(payload);
    expect(result.success).toBe(false);
  });

  // 3. unknown profile code rejected
  it("should reject invalid unknown profile codes", () => {
    const payload = { ...getValidPayload(), profileCode: "XYZ" };
    const result = validatePremiumOrder(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid profileCode");
    }
  });

  // 4. missing invite code rejected
  it("should reject if invite code is missing in validator", () => {
    const payload = { ...getValidPayload(), inviteCode: "   " };
    const result = validatePremiumOrder(payload);
    expect(result.success).toBe(false);
  });

  // 5. wrong invite code rejected in execution
  it("should reject with wrong invite code in onRequestPost with 403", async () => {
    const payload = { ...getValidPayload(), inviteCode: "WRONG_INTEGRATION_INVITE" };
    const context = createMockContext(payload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(403);

    const body = (await response.json()) as any;
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Unable to submit this request.");
  });

  // 6. oversized name rejected
  it("should reject oversized name length (>80 chars)", () => {
    const payload = { ...getValidPayload(), name: "A".repeat(81) };
    const result = validatePremiumOrder(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid name");
    }
  });

  // 7. macro score below 0 rejected
  it("should reject macro scores below 0", () => {
    const payload = {
      ...getValidPayload(),
      macroScores: { imagination: -5, intuition: 50, judgment: 50 }
    };
    const result = validatePremiumOrder(payload);
    expect(result.success).toBe(false);
  });

  // 8. macro score above 100 rejected
  it("should reject macro scores above 100", () => {
    const payload = {
      ...getValidPayload(),
      macroScores: { imagination: 101, intuition: 50, judgment: 50 }
    };
    const result = validatePremiumOrder(payload);
    expect(result.success).toBe(false);
  });

  // 9. feedback over 1000 chars rejected
  it("should reject feedback over 1000 chars in mostTrue/mostWrong fields", () => {
    const payload = {
      ...getValidPayload(),
      feedback: {
        mostTrue: "A".repeat(1001),
        mostWrong: "Short"
      }
    };
    const result = validatePremiumOrder(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("mostTrue' is too long");
    }
  });

  // 10. client-submitted `archetype` rejected or ignored
  it("should ignore or reject any client-submitted archetype configuration parameters", () => {
    const payloadWithArchetype = {
      ...getValidPayload(),
      archetype: {
        name: "Hacker Supreme",
        tagline: "I supply my own custom parameters"
      }
    };
    const result = validatePremiumOrder(payloadWithArchetype);
    expect(result.success).toBe(true);
    if (result.success) {
      // The validator should completely prune the extra 'archetype' key
      expect((result.data as any).archetype).toBeUndefined();
    }
  });

  // 11. email HTML escaping works
  it("should securely escape user-provided inputs to avoid HTML injection", () => {
    const complexString = "John <script>alert('xyz')</script> & Partners";
    const escaped = escapeHtml(complexString);
    expect(escaped).toBe("John &lt;script&gt;alert(&#039;xyz&#039;)&lt;/script&gt; &amp; Partners");
    expect(escaped).not.toContain("<script>");
  });

  // 12. subject sanitization removes CR/LF
  it("should remove all CR/LF and tab whitespaces during subject sanitization", () => {
    const dirtySubject = "John\r\nDoe\tCandidate \n Space  ";
    const sanitized = sanitizeSubjectPart(dirtySubject, 80);
    expect(sanitized).toBe("John Doe Candidate Space");
    expect(sanitized).not.toContain("\r");
    expect(sanitized).not.toContain("\n");
  });
});
