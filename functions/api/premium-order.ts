import { getArchetype } from "../../src/utils";

interface Env {
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
  SENDER_EMAIL?: string; // For backward compatibility
  RECEIVER_EMAIL?: string;
  BETA_INVITE_CODE?: string;
  TURNSTILE_SECRET_KEY?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
}) {
  try {
    // 1. Enforce a strict request payload size limit (max 16KB)
    const text = await context.request.text().catch(() => "");
    if (!text || text.length > 16384) {
      console.warn("Client requested payload oversized or blank.");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Unable to process order. Invalid payload." 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 2. Parse payload cleanly
    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Unable to process order. Invalid payload." 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const { email, name, profileCode, macroScores, feedback } = body;

    // 3. email: valid email, trimmed, max 254 characters
    const emailStr = typeof email === "string" ? email.trim() : "";
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailStr || emailStr.length > 254 || !emailRegex.test(emailStr)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Unable to process order. Invalid email." 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 4. name: string, trimmed, 1–80 characters
    const nameStr = typeof name === "string" ? name.trim() : "";
    if (!nameStr || nameStr.length < 1 || nameStr.length > 80) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Unable to process order. Invalid name." 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 5. profileCode: enum of known profile codes
    const validCodes = new Set([
      "CDL", "CDR", "CDE", "CPL", "CPR", "CPE", "CML", "CMR", "CME",
      "IDL", "IDR", "IDE", "IPL", "IPR", "IPE", "IML", "IMR", "IME"
    ]);
    const cleanCode = typeof profileCode === "string" ? profileCode.trim().toUpperCase() : "";
    if (!cleanCode || !validCodes.has(cleanCode)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Unable to process order. Invalid profile identifier." 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 6. macroScores: object with expected macro keys holding finite numbers from 0 to 100
    if (
      !macroScores || 
      typeof macroScores !== "object" || 
      Array.isArray(macroScores) ||
      typeof macroScores.imagination !== "number" ||
      !Number.isFinite(macroScores.imagination) ||
      macroScores.imagination < 0 ||
      macroScores.imagination > 100 ||
      typeof macroScores.intuition !== "number" ||
      !Number.isFinite(macroScores.intuition) ||
      macroScores.intuition < 0 ||
      macroScores.intuition > 100 ||
      typeof macroScores.judgment !== "number" ||
      !Number.isFinite(macroScores.judgment) ||
      macroScores.judgment < 0 ||
      macroScores.judgment > 100
    ) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Unable to process order. Invalid score metrics." 
        }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 6.5 Validate beta invite code if configured on the backend
    const expectedInviteCode = context.env.BETA_INVITE_CODE;
    if (expectedInviteCode) {
      const clientInviteCode = typeof body.inviteCode === "string" ? body.inviteCode.trim() : "";
      if (!clientInviteCode || clientInviteCode !== expectedInviteCode.trim()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Unable to process order. Invalid or missing invitation code."
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // 6.6 Verify Cloudflare Turnstile token if configured on the backend
    const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      const token = typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";
      if (!token) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Unable to process order. Security verification is required."
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      try {
        const remoteIp = context.request.headers.get("CF-Connecting-IP") || "";
        const verifyFormData = new URLSearchParams();
        verifyFormData.append("secret", turnstileSecret);
        verifyFormData.append("response", token);
        if (remoteIp) {
          verifyFormData.append("remoteip", remoteIp);
        }

        const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          body: verifyFormData,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });

        if (!verifyResponse.ok) {
          console.error(`Cloudflare Turnstile verification response not OK. Status: ${verifyResponse.status}`);
          return new Response(
            JSON.stringify({
              success: false,
              message: "Unable to process order. Security verification failed."
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        const verifyData: any = await verifyResponse.json();
        if (!verifyData.success) {
          console.error(`Turnstile verification returned error details: ${JSON.stringify(verifyData["error-codes"])}`);
          return new Response(
            JSON.stringify({
              success: false,
              message: "Unable to process order. Security verification failed."
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }
      } catch (verifyErr) {
        console.error("Exception during Cloudflare Turnstile verification:", verifyErr);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Unable to process order. Security verification endpoint unreachable."
          }),
          {
            status: 502,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // 7. Verify environmental integrity (API Key and receiver email are strictly required)
    const apiKey = context.env.RESEND_API_KEY;
    const receiverEmail = context.env.RECEIVER_EMAIL;
    const fromEmail = context.env.FROM_EMAIL || context.env.SENDER_EMAIL || "onboarding@resend.dev";

    if (!apiKey || !receiverEmail) {
      console.error("Missing essential configuration: " + (!apiKey ? "RESEND_API_KEY " : "") + (!receiverEmail ? "RECEIVER_EMAIL" : ""));
      return new Response(
        JSON.stringify({
          success: false,
          message: "Server transmission channel is temporarily unconfigured."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 8. Look up the archetype details securely from trusted local code inside src/utils.ts
    // This ignores any client-supplied "archetype" object parameters to prevent client poisoning.
    const archetype = getArchetype(cleanCode);

    // Escape user-provided inputs safely for HTML emails
    const escapedName = escapeHtml(nameStr);
    const escapedEmail = escapeHtml(emailStr);

    const timestampStr = new Date().toISOString();

    const emailSubject = `🔮 NEW PREMIUM REPORT ORDER - ${escapedName} [${cleanCode}]`;
    const feedbackText = feedback ? `
=========================================
BETA USER MODEL FEEDBACK (OPTIONAL):
=========================================
- Model Accuracy Rating: ${feedback.accuracyRating ?? 'N/A'} / 5
- What felt most true: ${feedback.mostTrue ?? 'N/A'}
- What felt wrong: ${feedback.mostWrong ?? 'N/A'}
- Would share: ${feedback.wouldShare ? 'Yes' : 'No'}
- Would pay for deeper report: ${feedback.wouldPayDeeper ? 'Yes' : 'No'}
` : '';

    const emailText = `
🔮 TRIAD COGNITIVE INTELLIGENCE: PREMIUM PORTFOLIO ORDER 🔮

=========================================
Subject Identity Credentials:
=========================================
Name: ${nameStr}
Email Address: ${emailStr}
Archetype Profile: ${cleanCode} / ${archetype.name}
Tagline: "${archetype.tagline}"
Order Timestamp (GMT): ${new Date(timestampStr).toUTCString()}
${feedbackText}
=========================================
Calibrated Macro Vectors:
=========================================
- Imagination: ${Math.round(macroScores.imagination)}%
- Intuition: ${Math.round(macroScores.intuition)}%
- Judgment: ${Math.round(macroScores.judgment)}%

=========================================
Primary Sector Pathways:
=========================================
${archetype.careerPaths?.map((p: string) => `• ${p}`).join("\n")}

=========================================
System Calibration State: SECURE_LOCAL_VERIFIED_PROTOCOL
=========================================
This order was initiated from the Tri-Ad advanced cognitive map protocol results board.
`;

    const feedbackHtml = feedback ? `
      <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">BETA USER MODEL FEEDBACK (OPTIONAL)</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 180px;"><strong>Accuracy Rating (1-5):</strong></td>
          <td style="padding: 6px 0; color: #d97706; font-weight: bold;">${feedback.accuracyRating ?? 'N/A'} / 5</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>What felt most true:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; line-height: 1.4;">${feedback.mostTrue ? escapeHtml(feedback.mostTrue) : 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>What felt wrong:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; line-height: 1.4;">${feedback.mostWrong ? escapeHtml(feedback.mostWrong) : 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Would share:</strong></td>
          <td style="padding: 6px 0; color: #0f172a;">${feedback.wouldShare ? 'Yes ✦' : 'No'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Would pay for deeper report:</strong></td>
          <td style="padding: 6px 0; color: #0f172a;">${feedback.wouldPayDeeper ? 'Yes ✦' : 'No'}</td>
        </tr>
      </table>
    ` : '';

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fafbfc;">
        <div style="background-color: #4f46e5; padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 20px; letter-spacing: 0.05em;">🔮 TRI-AD COGNITIVE PORTFOLIO</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">NEW PREMIUM INTEL REPORT ORDER RECEIVED</p>
        </div>
        
        <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">SUBJECT IDENTITY CREDENTIALS</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Name Nom de Guerre:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${escapedName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Subject Email:</strong></td>
            <td style="padding: 6px 0; color: #4f46e5; font-weight: bold;">${escapedEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Archetype Code:</strong></td>
            <td style="padding: 6px 0; color: #4f46e5; font-weight: bold; font-family: monospace; font-size: 15px;">${cleanCode}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Archetype Name:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${escapeHtml(archetype.name)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Tagline:</strong></td>
            <td style="padding: 6px 0; color: #475569; font-style: italic;">"${escapeHtml(archetype.tagline)}"</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Timestamp:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${timestampStr}</td>
          </tr>
        </table>
        
        ${feedbackHtml}

        <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">CALIBRATED MACRO SCORES</h2>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <div style="flex: 1; background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #d97706; font-weight: bold;">IMAGINATION</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #b45309;">${Math.round(macroScores.imagination)}%</p>
          </div>
          <div style="flex: 1; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #059669; font-weight: bold;">INTUITION</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #047857;">${Math.round(macroScores.intuition)}%</p>
          </div>
          <div style="flex: 1; background: #e0e7ff; border: 1px solid #c7d2fe; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #4f46e5; font-weight: bold;">JUDGMENT</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #4338ca;">${Math.round(macroScores.judgment)}%</p>
          </div>
        </div>

        <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">RECOMMENDED SECTORS</h2>
        <ul style="padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
          ${archetype.careerPaths?.map((p: string) => `<li style="margin-bottom: 6px;">${escapeHtml(p)}</li>`).join("")}
        </ul>

         <div style="margin-top: 30px; padding: 12px; background: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 10px; font-size: 11px; text-align: center; color: #64748b;">
          This transmission was programmatically formulated under token-based integrity. System state active.
        </div>
      </div>
    `;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: fromEmail,
          to: receiverEmail,
          subject: emailSubject,
          text: emailText,
          html: emailHtml
        })
      });

      if (response.ok) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Premium order successfully processed." 
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        const responseData = await response.text();
        console.error(`Resend API response error status: ${response.status}. Details: ${responseData}`);
        return new Response(
          JSON.stringify({
            success: false,
            message: "An error occurred while compiling your package. Please try again later."
          }),
          { 
            status: response.status,
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
    } catch (fetchErr) {
      console.error("Resend API fetch failed:", fetchErr);
      return new Response(
        JSON.stringify({
          success: false,
          message: "A transmission error occurred. Please try again later."
        }),
        { 
          status: 502,
          headers: { "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Global premium-order error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "A generic system error prevented processing of this request."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
