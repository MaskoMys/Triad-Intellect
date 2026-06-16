import { getArchetype } from "../../src/utils";
import { validatePremiumOrder } from "../../src/server/premiumOrderSchema";
import { buildOrderSubject, buildOrderPlainText, buildOrderHtmlText } from "../../src/server/emailTemplate";

export interface Env {
  RESEND_API_KEY?: string;
  RECEIVER_EMAIL?: string;
  FROM_EMAIL?: string;
  BETA_INVITE_CODE?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export function securityHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders()
  });
}

export async function onRequestGet() {
  return json({ ok: false, success: false, error: "Method Not Allowed" }, 405);
}

function isProductionLike(request: Request): boolean {
  const host = new URL(request.url).hostname;
  return !host.includes("localhost") && !host.includes("127.0.0.1");
}

function requireEnv(env: Env, request: Request): string | null {
  if (!env.RESEND_API_KEY) return "Missing RESEND_API_KEY";
  if (!env.RECEIVER_EMAIL) return "Missing RECEIVER_EMAIL";
  if (!env.FROM_EMAIL) return "Missing FROM_EMAIL";
  if (isProductionLike(request) && !env.BETA_INVITE_CODE) return "Missing BETA_INVITE_CODE";
  return null;
}

async function verifyTurnstile(
  token: string | undefined,
  env: Env,
  request: Request
): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) formData.append("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData
    });

    if (!response.ok) return false;

    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
}) {
  const { request, env } = context;

  // 1. Enforce same-origin requests
  const origin = request.headers.get("Origin");
  const expectedOrigin = new URL(request.url).origin;

  if (origin && origin !== expectedOrigin) {
    return json({ ok: false, success: false, error: "Unable to submit this request." }, 403);
  }

  // 2. Enforce body size limits
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 16_384) {
    return json({ ok: false, success: false, error: "Request too large." }, 413);
  }

  // 3. Read body safely
  const bodyText = await request.text().catch(() => "");
  if (!bodyText || bodyText.length > 16_384) {
    return json({ ok: false, success: false, error: "Request too large." }, 413);
  }

  let rawBody: unknown;
  try {
    rawBody = JSON.parse(bodyText);
  } catch {
    return json({ ok: false, success: false, error: "Unable to submit this request." }, 400);
  }

  // 4. Validate payload strictly with schema
  const validation = validatePremiumOrder(rawBody);
  if (!validation.success) {
    return json({ ok: false, success: false, error: "Unable to submit this request." }, 400);
  }

  const payload = validation.data;

  // 5. Enforce beta invite code
  const missingEnvError = requireEnv(env, request);
  if (missingEnvError) {
    console.error(`Environment variable error: ${missingEnvError}`);
    return json({ ok: false, success: false, error: "Unable to submit this request." }, 500);
  }

  if (!env.BETA_INVITE_CODE || payload.inviteCode !== env.BETA_INVITE_CODE) {
    return json({ ok: false, success: false, error: "Unable to submit this request." }, 403);
  }

  // 6. Verify Turnstile server-side when configured
  const turnstileOk = await verifyTurnstile(payload.turnstileToken, env, request);
  if (!turnstileOk) {
    return json({ ok: false, success: false, error: "Unable to submit this request." }, 400);
  }

  // 7. Look up archetype securely on the server
  let archetype;
  try {
    archetype = getArchetype(payload.profileCode);
  } catch (err) {
    console.error(`Failed to look up archetype for valid profile code: ${payload.profileCode}`, err);
    return json({ ok: false, success: false, error: "Unable to submit this request." }, 500);
  }

  if (!archetype) {
    console.error(`Archetype not found for profile code: ${payload.profileCode}`);
    return json({ ok: false, success: false, error: "Unable to submit this request." }, 500);
  }

  // 8. Formulate email contents
  const timestampStr = new Date().toISOString();
  const subject = buildOrderSubject(payload.name, payload.profileCode);
  const text = buildOrderPlainText(payload, archetype, timestampStr);
  const html = buildOrderHtmlText(payload, archetype, timestampStr);

  // 9. Send email through Resend HTTP API only
  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [env.RECEIVER_EMAIL],
        reply_to: payload.email,
        subject,
        text,
        html
      })
    });

    if (!resendResponse.ok) {
      console.error("Resend failed", {
        status: resendResponse.status,
        profileCode: payload.profileCode
      });

      return json({ ok: false, success: false, error: "Unable to submit this request." }, 502);
    }

    return json({ ok: true, success: true });
  } catch (err) {
    console.error("Resend fetch error", err);
    return json({ ok: false, success: false, error: "Unable to submit this request." }, 502);
  }
}
