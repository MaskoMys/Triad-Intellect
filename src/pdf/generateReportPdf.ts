import { AssessmentResult, TraitKey, MacroScores } from "../types";
import { traitLabels } from "../utils";

export interface PdfGenerationResult {
  doc: any;
  fileName: string;
}

const orderedTraitKeys: TraitKey[] = [
  "creativity",     // Imagination
  "innovation",     // Imagination
  "physical",       // Intuition
  "metaphysical",   // Intuition
  "discernment",    // Intuition
  "logical",        // Judgment
  "emotional",      // Judgment
  "predictive"      // Judgment
];

/**
 * Generates the TriAd report PDF dynamically by loading jsPDF only on demand.
 * This function also includes clean fallbacks for any missing optional data.
 */
export async function generateReportPdf(result: Partial<AssessmentResult>): Promise<PdfGenerationResult> {
  // Load jsPDF dynamically to keep initial bundle size light
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Safe variables Extraction with robust fallbacks
  const userName = (result.userName || "Anonymous Assessor").trim();
  const rawTimestamp = result.timestamp || new Date().toISOString();
  let formattedDate = "";
  try {
    const d = new Date(rawTimestamp);
    formattedDate = isNaN(d.getTime()) 
      ? new Date().toLocaleDateString() 
      : `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch {
    formattedDate = new Date().toLocaleDateString();
  }

  const profileCode = result.profileCode || "N/A";
  const normalizedScores = result.normalizedScores || {
    creativity: 0, innovation: 0, physical: 0, metaphysical: 0,
    discernment: 0, logical: 0, emotional: 0, predictive: 0
  };
  const macroScores: MacroScores = result.macroScores || {
    imagination: 0,
    intuition: 0,
    judgment: 0
  };

  const archetype = result.archetype || {
    code: profileCode,
    name: "Uncalibrated Identity Map",
    tagline: "Awaiting cognitive self-reflection assessment mapping.",
    description: "No description available. Complete the full series of reflective scenarios to map your orientation.",
    strengths: ["Sovereign self-reflection patterns"],
    challenges: ["Incomplete assessment trace"],
    careerPaths: ["Ongoing personal calibration"]
  };

  const fileName = `TriAd_Cognitive_Map_${userName.replace(/[^a-zA-Z0-9_\-]/g, "_")}_${profileCode}.pdf`;

  // ------------------ PAGE 1 ------------------
  // Title Banner
  doc.setFillColor(15, 23, 42); // slate 900
  doc.rect(0, 0, 210, 38, "F");

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("TRIAD COGNITIVE PORTFOLIO REPORT", 15, 16);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate 400
  doc.text("Experimental Self-Reflection Tool • Cognitive Alignment Mapping", 15, 23);
  doc.text(`DATE GENERATED: ${formattedDate}`, 15, 29);

  // Subject Details in white box next to title (right aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`SUBJECT: ${userName.slice(0, 28)}`, 142, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`PROFILE ID: ${profileCode}`, 142, 23);
  doc.text(`ENGINE: SECURE_LOCAL`, 142, 29);

  let y = 46;

  // Archetype Header block
  doc.setFillColor(248, 250, 252); // slate 50
  doc.rect(15, y, 180, 28, "F");
  doc.setDrawColor(226, 232, 240); // slate 200
  doc.rect(15, y, 180, 28, "D");

  // Inside Archetype Block
  doc.setTextColor(79, 70, 229); // Primary Indigo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(profileCode, 22, y + 18);

  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const archetypeName = (archetype.name || "UNCLASSIFIED").toUpperCase();
  doc.text(archetypeName, 50, y + 11);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  const taglineText = archetype.tagline ? `"${archetype.tagline}"` : `""`;
  doc.text(taglineText, 50, y + 18);

  y += 34;

  // Description Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("COGNITIVE IDENTITY DESCRIPTION", 15, y);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(15, y + 2, 195, y + 2); // Underline

  y += 8;

  const descText = archetype.description || "No description loaded.";
  const descLines = doc.splitTextToSize(descText, 180);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59); // slate 800
  doc.text(descLines, 15, y);

  y += descLines.length * 4.5 + 4;

  // Cognitive Measurement Index (Macro-scores)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("CORE COGNITIVE VECTORS (MACRO)", 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;

  // Draw 3 columns for Macro scores
  const colW = 56;
  const gap = 6;
  const macroKeysArr: Array<{ key: "imagination" | "intuition" | "judgment"; label: string; color: [number, number, number] }> = [
    { key: "imagination", label: "IMAGINATION (Ideation & Synthesis)", color: [245, 158, 11] }, // Amber
    { key: "intuition", label: "INTUITION (Discretion & Field)", color: [16, 185, 129] }, // Emerald
    { key: "judgment", label: "JUDGMENT (Logic & Assessment)", color: [79, 70, 229] } // Indigo
  ];

  macroKeysArr.forEach((item, idx) => {
    const colX = 15 + idx * (colW + gap);
    const scoreVal = macroScores[item.key] ?? 0;
    const score = Math.round(isNaN(scoreVal) ? 0 : scoreVal);
    
    // Box background
    doc.setFillColor(248, 250, 252);
    doc.rect(colX, y, colW, 26, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(colX, y, colW, 26, "D");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, colX + 3, y + 6);

    // Score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text(`${score}%`, colX + 4, y + 16);

    // Bar
    doc.setFillColor(226, 232, 240);
    doc.rect(colX + 4, y + 20, colW - 8, 2, "F");

    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.rect(colX + 4, y + 20, ((colW - 8) * score) / 100, 2, "F");
  });

  y += 34;

  // Granular Micro-Traits Breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("GRANULAR COGNITIVE METRICS (MICRO)", 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;

  // 8 Micro traits in 2 columns of 4
  const listLeft = orderedTraitKeys.slice(0, 4);
  const listRight = orderedTraitKeys.slice(4, 8);

  const drawTraitRow = (traitKey: TraitKey, xPos: number, yPos: number, width: number) => {
    const scoreVal = normalizedScores[traitKey] ?? 0;
    const score = Math.round(isNaN(scoreVal) ? 0 : scoreVal);
    const label = traitLabels[traitKey] || traitKey;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(label, xPos, yPos);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${score}%`, xPos + width - 10, yPos);

    // Meter Bar background
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(xPos, yPos + 2.5, width, 2, "F");

    // Meter Bar fill color
    let r = 79, g = 70, b = 229; // Indigo
    if (["creativity", "innovation"].includes(traitKey)) {
      r = 245; g = 158; b = 11; // Amber
    } else if (["physical", "metaphysical", "discernment"].includes(traitKey)) {
      r = 16; g = 185; b = 129; // Emerald
    }

    doc.setFillColor(r, g, b);
    doc.rect(xPos, yPos + 2.5, (width * score) / 100, 2, "F");
  };

  const microColWidth = 84;
  const microLeftX = 15;
  const microRightX = 111;

  listLeft.forEach((tKey, idx) => {
    drawTraitRow(tKey, microLeftX, y + idx * 10, microColWidth);
  });

  listRight.forEach((tKey, idx) => {
    drawTraitRow(tKey, microRightX, y + idx * 10, microColWidth);
  });

  // Premium Report Call To Action Banner on Page 1
  const pY = 202;
  doc.setFillColor(15, 23, 42); // slate 900
  doc.rect(15, pY, 180, 42, "F");
  doc.setDrawColor(99, 102, 241); // indigo 500 border
  doc.setLineWidth(0.5);
  doc.rect(15, pY, 180, 42, "D");

  // Gold/Yellow brand sidebar accent
  doc.setFillColor(234, 179, 8); // Yellow 500
  doc.rect(15, pY, 3, 42, "F");

  // Title Text
  doc.setTextColor(253, 224, 71); // Gold text (yellow-300)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("✦ UNLOCK FULL COMPREHENSIVE PREMIUM COGNITIVE BLUEPRINT", 24, pY + 9);

  // Paragraph Description
  doc.setTextColor(244, 246, 249); // bright off-white
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const premiumDescLines = doc.splitTextToSize(
    "Get an extensive 40-page behavioral mapping and personal alignment portfolio profiling blind spots, micro-stressors, style integrations, and 1-on-1 counselor pathways. Physical or digital premium packages are transmitted securely to the system operator upon payment.",
    162
  );
  doc.text(premiumDescLines, 24, pY + 16);

  // Interactive button mockup
  doc.setFillColor(79, 70, 229); // Rich Indigo Button
  doc.rect(24, pY + 29, 162, 8, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("✦ CLICK HERE TO TRANSMIT SERVICE ORDER FORM ON WEB HUB ✦", 105, pY + 34.2, { align: "center" });

  // Clickable PDF link coordinate layout
  const orderUrl = `${window.location.origin}${window.location.pathname}?order_premium=true&id=${result.id || ""}&name=${encodeURIComponent(userName)}&code=${profileCode}`;
  doc.link(15, pY, 180, 42, { url: orderUrl });

  // Page 1 footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate 400
  doc.text("TriAd Cognitive Map Protocol • Personal Reflective Map", 15, 287);
  doc.text("Page 1 of 2", 185, 287);

  // ------------------ PAGE 2 ------------------
  doc.addPage();

  // Secondary Header Border
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 12, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TRIAD PERSONAL REFLECTIVE ARCHETYPE", 15, 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);
  doc.text(`ALIGNED_TRACK: ${profileCode} / ${userName.slice(0, 20)}`, 140, 8);

  let y2 = 24;

  // Title Page 2
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("POTENTIAL STRATEGIC EXPLORATIONS", 15, y2);
  
  y2 += 8;

  // Panel 1: Key Strengths
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.rect(15, y2, 180, 52, "F");
  doc.setDrawColor(187, 247, 208); // Emerald 200 border
  doc.rect(15, y2, 180, 52, "D");

  doc.setTextColor(22, 101, 52); // Emerald 800
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("REFLECTED PROTOTYPE PATTERNS / STRENGTHS", 22, y2 + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const strengthsList = archetype.strengths || [];
  strengthsList.forEach((str, sIdx) => {
    if (sIdx < 4) { // keep layout clean
      const wrappedStr = doc.splitTextToSize(`•  ${str}`, 166);
      doc.text(wrappedStr, 22, y2 + 16 + sIdx * 8);
    }
  });

  y2 += 60;

  // Panel 2: Operational Inhibitors
  doc.setFillColor(255, 241, 242); // Rose 50
  doc.rect(15, y2, 180, 52, "F");
  doc.setDrawColor(254, 205, 211); // Rose 200 border
  doc.rect(15, y2, 180, 52, "D");

  doc.setTextColor(159, 18, 57); // Rose 800
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("EXPLORATORY MITIGATIONS & GROWTH VECTORS", 22, y2 + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const challengesList = archetype.challenges || [];
  challengesList.forEach((chal, cIdx) => {
    if (cIdx < 4) { // keep layout clean
      const wrappedChal = doc.splitTextToSize(`!  ${chal}`, 166);
      doc.text(wrappedChal, 22, y2 + 16 + cIdx * 8);
    }
  });

  y2 += 60;

  // Panel 3: Recommended Career Paths
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.rect(15, y2, 180, 52, "F");
  doc.setDrawColor(199, 210, 254); // Indigo 200
  doc.rect(15, y2, 180, 52, "D");

  doc.setTextColor(55, 48, 163); // Indigo 800
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("COGNITIVE ORIENTATION COMPATIBILITIES", 22, y2 + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const careerList = archetype.careerPaths || [];
  careerList.forEach((cp, cpIdx) => {
    if (cpIdx < 4) { // keep layout clean
      const wrappedCp = doc.splitTextToSize(`¤  ${cp}`, 166);
      doc.text(wrappedCp, 22, y2 + 16 + cpIdx * 8);
    }
  });

  y2 += 60;

  // Profile disclaimer block
  doc.setFillColor(248, 250, 252);
  doc.rect(15, y2, 180, 22, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, y2, 180, 22, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("PROTOCOL DEPLOYMENT DISCLAIMER & EXPERIMENTAL CLASSIFICATION", 22, y2 + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  
  const checksum = `MEMBER_HASH: ${btoa(result.id || "anonymous-node").slice(0, 32).toUpperCase()}`;
  doc.text(checksum, 22, y2 + 12);
  
  // Safe disclaimer without verified or psychological/clinical claims
  const disclaimerText = "Disclaimer: Tri-Ad is an experimental self-reflection and personal mapping visualization tool. This document is compiled for entertainment, informational, and personal reflection purposes only. It is not an objective psychological test, diagnostic assessment, clinical profile, or validated psychometric test, and does not constitute certified mental health, advisory, or medical advice.";
  const wrappedDisclaimer = doc.splitTextToSize(disclaimerText, 166);
  doc.text(wrappedDisclaimer, 22, y2 + 15);

  // Page 2 footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("TriAd Cognitive Map Protocol • Experimental Personal Reflective Mapping", 15, 287);
  doc.text("Page 2 of 2", 185, 287);

  return {
    doc,
    fileName
  };
}
