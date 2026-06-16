import { describe, it, expect, vi, beforeEach } from "vitest";
import { onRequestPost } from "../../functions/api/premium-order";

describe("Cloudflare Pages /api/premium-order Validator Tests", () => {
  // Mock global fetch to prevent actual emails/requests from being sent during tests
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() => 
      Promise.resolve(
        new Response(JSON.stringify({ success: "true" }), { status: 200 })
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
      }
    } as unknown as Request;

    return {
      request: req,
      env: customEnv || {
        RECEIVER_EMAIL: "recipient@example.com",
        RESEND_API_KEY: "re_mock_api_key_test_123"
      },
      params: {},
      waitUntil: () => {}
    };
  };

  it("should accept valid payloads and return 200 with success: true", async () => {
    const validPayload = {
      email: "test@example.com",
      name: "Sovereign Candidate",
      profileCode: "CDL",
      macroScores: {
        imagination: 75,
        intuition: 80,
        judgment: 50
      },
      timestamp: new Date().toISOString()
    };

    const context = createMockContext(validPayload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should reject invalid emails", async () => {
    const invalidEmailPayload = {
      email: "not-an-email",
      name: "Sovereign Candidate",
      profileCode: "CDL",
      macroScores: {
        imagination: 75,
        intuition: 80,
        judgment: 50
      }
    };

    const context = createMockContext(invalidEmailPayload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Invalid email");
  });

  it("should reject emails that are too long (> 254)", async () => {
    const longEmailPayload = {
      email: "a".repeat(250) + "@test.com", // > 254 length
      name: "Sovereign Candidate",
      profileCode: "CDL",
      macroScores: {
        imagination: 75,
        intuition: 80,
        judgment: 50
      }
    };

    const context = createMockContext(longEmailPayload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(400);
  });

  it("should reject oversized name length (>80 chars)", async () => {
    const longNamePayload = {
      email: "test@example.com",
      name: "A".repeat(81), // 81 chars
      profileCode: "CDL",
      macroScores: {
        imagination: 75,
        intuition: 80,
        judgment: 50
      }
    };

    const context = createMockContext(longNamePayload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it("should reject empty or missing names", async () => {
    const emptyNamePayload = {
      email: "test@example.com",
      name: "   ", // blank
      profileCode: "CDL",
      macroScores: {
        imagination: 75,
        intuition: 80,
        judgment: 50
      }
    };

    const context = createMockContext(emptyNamePayload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(400);
  });

  it("should reject invalid/unknown profile codes", async () => {
    const unknownCodePayload = {
      email: "test@example.com",
      name: "Sovereign Candidate",
      profileCode: "XYZ", // Invalid code
      macroScores: {
        imagination: 75,
        intuition: 80,
        judgment: 50
      }
    };

    const context = createMockContext(unknownCodePayload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(400);
  });

  it("should reject macro scores outside 0-100", async () => {
    const badScoresPayload = {
      email: "test@example.com",
      name: "Sovereign Candidate",
      profileCode: "CDL",
      macroScores: {
        imagination: 105, // > 100
        intuition: 80,
        judgment: -5 // < 0
      }
    };

    const context = createMockContext(badScoresPayload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(400);
  });

  it("should reject payload if request exceeds size limit", async () => {
    const payload = { email: "test@example.com" };
    const context = createMockContext(payload, 20000); // 20 KB size limit
    const response = await onRequestPost(context);
    expect(response.status).toBe(400);
  });

  it("should reject safely if environment keys are missing", async () => {
    const payload = {
      email: "test@example.com",
      name: "A Candidate",
      profileCode: "CDL",
      macroScores: { imagination: 50, intuition: 50, judgment: 50 }
    };

    // Missing RESEND_API_KEY
    const context = createMockContext(payload, undefined, { RECEIVER_EMAIL: "test@example.com" });
    const response = await onRequestPost(context);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("transmission channel is temporarily unconfigured");
  });

  it("should securely escape user-provided values in sent HTML to protect against HTML injection", async () => {
    const injectionName = "John <script>alert(1)</script> & Sons";
    const payload = {
      email: "attacker@test.com",
      name: injectionName,
      profileCode: "CDL",
      macroScores: {
        imagination: 75,
        intuition: 80,
        judgment: 50
      }
    };

    const fetchSpy = vi.spyOn(global, "fetch");

    const context = createMockContext(payload);
    const response = await onRequestPost(context);
    expect(response.status).toBe(200);

    expect(fetchSpy).toHaveBeenCalled();
    const callArgs = fetchSpy.mock.calls[0];
    if (!callArgs || !callArgs[1] || typeof callArgs[1].body !== "string") {
      throw new Error("No robust fetch request options body found.");
    }
    const postBody = JSON.parse(callArgs[1].body);

    // Assert escaping on properties compiled into HTML
    expect(postBody.html).toContain("John &lt;script&gt;alert(1)&lt;/script&gt; &amp; Sons");
    expect(postBody.html).not.toContain(injectionName);
  });

  it("should reject request if BETA_INVITE_CODE is configured on backend but not provided or incorrect", async () => {
    const payload = {
      email: "test@example.com",
      name: "Beta Tester",
      profileCode: "CDL",
      macroScores: { imagination: 50, intuition: 50, judgment: 50 },
      inviteCode: "WRONG_CODE"
    };

    const context = createMockContext(payload, undefined, {
      RECEIVER_EMAIL: "recipient@example.com",
      RESEND_API_KEY: "re_mock_api_key_test_123",
      BETA_INVITE_CODE: "BETA_TEST_123"
    });

    const response = await onRequestPost(context);
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Invalid or missing invitation code");
  });

  it("should accept request if BETA_INVITE_CODE is configured on backend and matches perfectly", async () => {
    const payload = {
      email: "test@example.com",
      name: "Beta Tester",
      profileCode: "CDL",
      macroScores: { imagination: 50, intuition: 50, judgment: 50 },
      inviteCode: "BETA_TEST_123 " // checks trimming works
    };

    const context = createMockContext(payload, undefined, {
      RECEIVER_EMAIL: "recipient@example.com",
      RESEND_API_KEY: "re_mock_api_key_test_123",
      BETA_INVITE_CODE: "BETA_TEST_123"
    });

    const response = await onRequestPost(context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should reject request if TURNSTILE_SECRET_KEY is configured on backend but token is missing", async () => {
    const payload = {
      email: "test@example.com",
      name: "Beta Tester",
      profileCode: "CDL",
      macroScores: { imagination: 50, intuition: 50, judgment: 50 }
    };

    const context = createMockContext(payload, undefined, {
      RECEIVER_EMAIL: "recipient@example.com",
      RESEND_API_KEY: "re_mock_api_key_test_123",
      TURNSTILE_SECRET_KEY: "ts_secret_mock_xyz"
    });

    const response = await onRequestPost(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Security verification is required");
  });

  it("should accept request if TURNSTILE_SECRET_KEY is configured on backend and verified successfully", async () => {
    // Stub fetch to return success response for Turnstile siteverify
    vi.stubGlobal("fetch", vi.fn((url) => {
      if (typeof url === "string" && url.includes("turnstile")) {
        return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ success: true, id: "resend_123" }), { status: 200 }));
    }));

    const payload = {
      email: "test@example.com",
      name: "Beta Tester",
      profileCode: "CDL",
      macroScores: { imagination: 50, intuition: 50, judgment: 50 },
      turnstileToken: "valid_turnstile_token_mock"
    };

    const context = createMockContext(payload, undefined, {
      RECEIVER_EMAIL: "recipient@example.com",
      RESEND_API_KEY: "re_mock_api_key_test_123",
      TURNSTILE_SECRET_KEY: "ts_secret_mock_xyz"
    });

    const response = await onRequestPost(context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
