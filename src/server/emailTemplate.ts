import { escapeHtml, sanitizeSubjectPart } from "./safeText";
import { PremiumOrderPayload } from "./premiumOrderSchema";

export interface ArchetypeSummary {
  name: string;
  tagline: string;
  careerPaths: string[];
}

export function buildOrderSubject(name: string, profileCode: string): string {
  const sanitizedName = sanitizeSubjectPart(name, 50);
  const sanitizedCode = sanitizeSubjectPart(profileCode, 10);
  return `🔮 NEW PREMIUM REPORT ORDER - ${sanitizedName} [${sanitizedCode}]`;
}

export function buildOrderPlainText(
  payload: PremiumOrderPayload,
  archetype: ArchetypeSummary,
  timestampStr: string
): string {
  const feedbackText = payload.feedback ? `
=========================================
BETA USER MODEL FEEDBACK (OPTIONAL):
=========================================
- Model Accuracy Rating: ${payload.feedback.accuracyRating ?? 'N/A'} / 5
- What felt most true: ${payload.feedback.mostTrue ?? 'N/A'}
- What felt wrong: ${payload.feedback.mostWrong ?? 'N/A'}
- Would share: ${payload.feedback.wouldShare ? 'Yes' : 'No'}
- Would pay for deeper report: ${payload.feedback.wouldPayDeeper ? 'Yes' : 'No'}
` : '';

  return `
🔮 TRIAD COGNITIVE INTELLIGENCE: PREMIUM PORTFOLIO ORDER 🔮

=========================================
Subject Identity Credentials:
=========================================
Name: ${payload.name}
Email Address: ${payload.email}
Archetype Profile: ${payload.profileCode} / ${archetype.name}
Tagline: "${archetype.tagline}"
Order Timestamp (GMT): ${new Date(timestampStr).toUTCString()}
${feedbackText}
=========================================
Calibrated Macro Vectors:
=========================================
- Imagination: ${Math.round(payload.macroScores.imagination)}%
- Intuition: ${Math.round(payload.macroScores.intuition)}%
- Judgment: ${Math.round(payload.macroScores.judgment)}%

=========================================
Primary Sector Pathways:
=========================================
${archetype.careerPaths?.map((p: string) => `• ${p}`).join("\n")}

=========================================
System Calibration State: LOCAL_SELF_REFLECTION_PROTOCOL
=========================================
This order was initiated from the Tri-Ad self-reflection results board.
`;
}

export function buildOrderHtmlText(
  payload: PremiumOrderPayload,
  archetype: ArchetypeSummary,
  timestampStr: string
): string {
  const escapedName = escapeHtml(payload.name);
  const escapedEmail = escapeHtml(payload.email);
  const escapedCode = escapeHtml(payload.profileCode);
  const escapedArchetypeName = escapeHtml(archetype.name);
  const escapedArchetypeTagline = escapeHtml(archetype.tagline);

  const feedbackHtml = payload.feedback ? `
      <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">BETA USER MODEL FEEDBACK (OPTIONAL)</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 180px;"><strong>Accuracy Rating (1-5):</strong></td>
          <td style="padding: 6px 0; color: #d97706; font-weight: bold;">${payload.feedback.accuracyRating ?? 'N/A'} / 5</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>What felt most true:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; line-height: 1.4;">${payload.feedback.mostTrue ? escapeHtml(payload.feedback.mostTrue) : 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>What felt wrong:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; line-height: 1.4;">${payload.feedback.mostWrong ? escapeHtml(payload.feedback.mostWrong) : 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Would share:</strong></td>
          <td style="padding: 6px 0; color: #0f172a;">${payload.feedback.wouldShare ? 'Yes ✦' : 'No'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Would pay for deeper report:</strong></td>
          <td style="padding: 6px 0; color: #0f172a;">${payload.feedback.wouldPayDeeper ? 'Yes ✦' : 'No'}</td>
        </tr>
      </table>
    ` : '';

  return `
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
            <td style="padding: 6px 0; color: #4f46e5; font-weight: bold; font-family: monospace; font-size: 15px;">${escapedCode}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Archetype Name:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${escapedArchetypeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Tagline:</strong></td>
            <td style="padding: 6px 0; color: #475569; font-style: italic;">"${escapedArchetypeTagline}"</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Timestamp:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(timestampStr)}</td>
          </tr>
        </table>
        
        ${feedbackHtml}

        <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">CALIBRATED MACRO SCORES</h2>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <div style="flex: 1; background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #d97706; font-weight: bold;">IMAGINATION</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #b45309;">${Math.round(payload.macroScores.imagination)}%</p>
          </div>
          <div style="flex: 1; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #059669; font-weight: bold;">INTUITION</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #047857;">${Math.round(payload.macroScores.intuition)}%</p>
          </div>
          <div style="flex: 1; background: #e0e7ff; border: 1px solid #c7d2fe; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #4f46e5; font-weight: bold;">JUDGMENT</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #4338ca;">${Math.round(payload.macroScores.judgment)}%</p>
          </div>
        </div>

        <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">RECOMMENDED SECTORS</h2>
        <ul style="padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
          ${archetype.careerPaths?.map((p: string) => `<li style="margin-bottom: 6px;">${escapeHtml(p)}</li>`).join("")}
        </ul>

         <div style="margin-top: 30px; padding: 12px; background: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 10px; font-size: 11px; text-align: center; color: #64748b;">
          This transmission was formulated under the experimental self-reflection mapping protocol.
        </div>
      </div>
    `;
}
