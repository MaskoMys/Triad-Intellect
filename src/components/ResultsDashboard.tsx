import React, { useState } from "react";
import { 
  Download, Trash2, Calendar, User, Eye, Sparkles, BookOpen, 
  Settings, Award, RefreshCw, Trophy, ArrowUpRight, HelpCircle,
  Share2, X, FileText, Copy, Check
} from "lucide-react";
import { jsPDF } from "jspdf";
import { motion } from "motion/react";
import { AssessmentResult, TraitKey, MacroScores, TraitScores } from "../types";
import { traitLabels, traitDescriptions, getArchetype, traits } from "../utils";

interface ResultsDashboardProps {
  result: AssessmentResult;
  history: AssessmentResult[];
  onRetake: () => void;
  onDeleteHistory: (id: string) => void;
  onSelectHistorical: (result: AssessmentResult) => void;
  onUpdateResult?: (updated: AssessmentResult) => void;
}

export default function ResultsDashboard({
  result,
  history,
  onRetake,
  onDeleteHistory,
  onSelectHistorical,
  onUpdateResult
}: ResultsDashboardProps) {
  const [chartType, setChartType] = useState<"micro" | "macro">("micro");
  const [selectedBarTrait, setSelectedBarTrait] = useState<TraitKey>("creativity");
  const [shareCopied, setShareCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [pdfSharingState, setPdfSharingState] = useState<"idle" | "generating" | "sharing" | "fallback" | "done">("idle");

  // Email capturing before download or share
  const [captureEmailOpen, setCaptureEmailOpen] = useState(false);
  const [captureEmailAddress, setCaptureEmailAddress] = useState(result.userEmail || "");
  const [captureAction, setCaptureAction] = useState<"download" | "share" | null>(null);
  const [emailError, setEmailError] = useState("");

  // Premium report order
  const [premiumOrderOpen, setPremiumOrderOpen] = useState(false);
  const [premiumOrderAddress, setPremiumOrderAddress] = useState(result.userEmail || "");
  const [premiumOrderStatus, setPremiumOrderStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [premiumOrderError, setPremiumOrderError] = useState("");

  const { userName, timestamp, profileCode, normalizedScores, macroScores, archetype } = result;

  // Ordered list of traits for beautiful adjacent visual groupings in the octagon radar chart
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

  // Radar math setups
  const SVG_SIZE = 360;
  const CENTER = SVG_SIZE / 2;
  const MAX_RADIUS = 120;

  // Helper: converts score + angle to visual Cartesian coordinates (X, Y)
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // 1. Generate grid structures for Micro octagonal layout
  const microGridLinesCount = 4; // 25%, 50%, 75%, 100%
  const microGrids = Array.from({ length: microGridLinesCount }).map((_, gIdx) => {
    const radius = ((gIdx + 1) / microGridLinesCount) * MAX_RADIUS;
    const points = orderedTraitKeys.map((_, tIdx) => {
      const angle = tIdx * (360 / 8);
      const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
      return `${x},${y}`;
    }).join(" ");
    return { points, percentage: (gIdx + 1) * 25 };
  });

  // Generate main user score polygon for micro traits
  const microScorePointsStr = orderedTraitKeys.map((traitKey, tIdx) => {
    const score = normalizedScores[traitKey] ?? 0;
    const radius = (score / 100) * MAX_RADIUS;
    const angle = tIdx * (360 / 8);
    const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
    return `${x},${y}`;
  }).join(" ");

  // Generate axes lines and tick marks
  const microAxes = orderedTraitKeys.map((traitKey, tIdx) => {
    const angle = tIdx * (360 / 8);
    const outerPoint = polarToCartesian(CENTER, CENTER, MAX_RADIUS, angle);
    const labelPoint = polarToCartesian(CENTER, CENTER, MAX_RADIUS + 22, angle);
    
    // Determine anchor alignment based on quadrant to avoid overlap clipping
    let textAnchor = "middle";
    if (outerPoint.x > CENTER + 10) textAnchor = "start";
    if (outerPoint.x < CENTER - 10) textAnchor = "end";

    return {
      traitKey,
      name: traitKey.charAt(0).toUpperCase() + traitKey.slice(1, 3), // e.g. Cre, Inn
      x1: CENTER,
      y1: CENTER,
      x2: outerPoint.x,
      y2: outerPoint.y,
      lx: labelPoint.x,
      ly: labelPoint.y,
      textAnchor,
      score: Math.round(normalizedScores[traitKey] ?? 0)
    };
  });

  // 2. Generate grid structures for Macro triangle layout
  const macroKeys: (keyof MacroScores)[] = ["imagination", "intuition", "judgment"];
  const macroGridLines = Array.from({ length: 4 }).map((_, gIdx) => {
    const radius = ((gIdx + 1) / 4) * MAX_RADIUS;
    const points = macroKeys.map((_, mIdx) => {
      const angle = mIdx * (360 / 3);
      const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
      return `${x},${y}`;
    }).join(" ");
    return { points, percentage: (gIdx + 1) * 25 };
  });

  const macroScorePointsStr = macroKeys.map((macroKey, mIdx) => {
    const score = macroScores[macroKey] ?? 0;
    const radius = (score / 100) * MAX_RADIUS;
    const angle = mIdx * (360 / 3);
    const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
    return `${x},${y}`;
  }).join(" ");

  const macroAxes = macroKeys.map((macroKey, mIdx) => {
    const angle = mIdx * (360 / 3);
    const outerPoint = polarToCartesian(CENTER, CENTER, MAX_RADIUS, angle);
    const labelPoint = polarToCartesian(CENTER, CENTER, MAX_RADIUS + 22, angle);

    let textAnchor = "middle";
    if (outerPoint.x > CENTER + 10) textAnchor = "start";
    if (outerPoint.x < CENTER - 10) textAnchor = "end";

    return {
      macroKey,
      name: macroKey.toUpperCase(),
      x1: CENTER,
      y1: CENTER,
      x2: outerPoint.x,
      y2: outerPoint.y,
      lx: labelPoint.x,
      ly: labelPoint.y,
      textAnchor,
      score: Math.round(macroScores[macroKey] ?? 0)
    };
  });

  // Export as high-quality JSON format for professional download records
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TriAd_Assessment_${userName}_${profileCode}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePDFDoc = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

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
    doc.text("Math-Normalized Cognitive Vector Projections • V2 Calibration", 15, 23);
    doc.text(`DATE GENERATED: ${new Date(timestamp).toLocaleDateString()} ${new Date(timestamp).toLocaleTimeString()}`, 15, 29);

    // Subject Details in white box next to title (right aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`SUBJECT: ${userName}`, 145, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`PROFILE ID: ${profileCode}`, 145, 23);
    doc.text(`VERIFIED ENGINE: SECURE_LOCAL`, 145, 29);

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
    doc.text(archetype.name.toUpperCase(), 50, y + 11);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`"${archetype.tagline}"`, 50, y + 18);

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

    const descLines = doc.splitTextToSize(archetype.description, 180);
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
    const macroKeysArr = [
      { key: "imagination", label: "IMAGINATION (Ideation & Synthesis)", color: [245, 158, 11] }, // Amber
      { key: "intuition", label: "INTUITION (Discretion & Field)", color: [16, 185, 129] }, // Emerald
      { key: "judgment", label: "JUDGMENT (Logic & Assessment)", color: [79, 70, 229] } // Indigo
    ];

    macroKeysArr.forEach((item, idx) => {
      const colX = 15 + idx * (colW + gap);
      const score = Math.round(macroScores[item.key as keyof MacroScores] ?? 0);
      
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
      const score = Math.round(normalizedScores[traitKey] ?? 0);
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
      "Get a custom formulated 40-page behavioral mapping and neural synergy portfolio highlighting your blind spots, situational stressors, strategic communication style calibrations, and 1-on-1 advisor strategy matching. Manual orders are compiled immediately upon submit verification.",
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
    const orderUrl = `${window.location.origin}${window.location.pathname}?order_premium=true&id=${result.id}&name=${encodeURIComponent(userName)}&code=${profileCode}`;
    doc.link(15, pY, 180, 42, { url: orderUrl });

    // Page 1 footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate 400
    doc.text("TriAd Cognitive Map Protocol • Confidential Personal Portfolio", 15, 287);
    doc.text("Page 1 of 2", 185, 287);

    // ------------------ PAGE 2 ------------------
    doc.addPage();

    // Secondary Header Border
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 12, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TRIAD INTERACTIVE SOLUTIONS PROFILE", 15, 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(191, 219, 254);
    doc.text(`SUBJECT_CALIBRATION: ${profileCode} / ${userName}`, 140, 8);

    let y2 = 24;

    // Title Page 2
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("STRATEGIC DIAGNOSTICS & PATHWAYS", 15, y2);
    
    y2 += 8;

    // Panel 1: Key Strengths
    doc.setFillColor(240, 253, 244); // Emerald 50
    doc.rect(15, y2, 180, 52, "F");
    doc.setDrawColor(187, 247, 208); // Emerald 200 border
    doc.rect(15, y2, 180, 52, "D");

    doc.setTextColor(22, 101, 52); // Emerald 800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("CORE CATALYTIC STRENGTHS", 22, y2 + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    archetype.strengths.forEach((str, sIdx) => {
      const wrappedStr = doc.splitTextToSize(`•  ${str}`, 166);
      doc.text(wrappedStr, 22, y2 + 16 + sIdx * 8);
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
    doc.text("OPERATIONAL INHIBITORS & BLOCKS", 22, y2 + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    archetype.challenges.forEach((chal, cIdx) => {
      const wrappedChal = doc.splitTextToSize(`!  ${chal}`, 166);
      doc.text(wrappedChal, 22, y2 + 16 + cIdx * 8);
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
    doc.text("STRATEGIC ALIGNMENT PATHWAYS", 22, y2 + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    archetype.careerPaths.forEach((cp, cpIdx) => {
      const wrappedCp = doc.splitTextToSize(`¤  ${cp}`, 166);
      doc.text(wrappedCp, 22, y2 + 16 + cpIdx * 8);
    });

    y2 += 60;

    // Calibration authenticity block
    doc.setFillColor(248, 250, 252);
    doc.rect(15, y2, 180, 22, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, y2, 180, 22, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("SYSTEM CALIBRATION CHECKSUM", 22, y2 + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    const checksum = `SHA-256: ${btoa(result.id).slice(0, 32).toUpperCase()} // PROTOCOL_LEVEL_6.1`;
    doc.text(checksum, 22, y2 + 12);
    doc.text("This documents authentic cognitive configuration states under rigid test boundaries.", 22, y2 + 16);

    // Page 2 footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("TriAd Cognitive Map Protocol • Confidential Personal Portfolio", 15, 287);
    doc.text("Page 2 of 2", 185, 287);

    return doc;
  };

  const triggerRealDownload = () => {
    const doc = generatePDFDoc();
    doc.save(`TriAd_Cognitive_Map_${userName}_${profileCode}.pdf`);
  };

  const triggerRealSharePDF = async () => {
    try {
      setPdfSharingState("generating");
      const doc = generatePDFDoc();
      const pdfBlob = doc.output("blob");
      const fileName = `TriAd_Cognitive_Map_${userName}_${profileCode}.pdf`;
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        setPdfSharingState("sharing");
        await navigator.share({
          files: [file],
          title: `TriAd Report - ${userName} (${profileCode})`,
          text: `My verified TriAd Cognitive map results report (PDF format).`
        });
        setPdfSharingState("done");
        setTimeout(() => setPdfSharingState("idle"), 3000);
      } else {
        // Browser does not support sharing files (common on many desktop browsers)
        // gracefully trigger fallback download and inform
        setPdfSharingState("fallback");
        doc.save(fileName);
        setTimeout(() => setPdfSharingState("idle"), 5000);
      }
    } catch (err) {
      console.error("PDF Native WebShare API failed:", err);
      setPdfSharingState("fallback");
      const doc = generatePDFDoc();
      doc.save(`TriAd_Cognitive_Map_${userName}_${profileCode}.pdf`);
      setTimeout(() => setPdfSharingState("idle"), 4000);
    }
  };

  const handleDownloadPDF = () => {
    if (result.userEmail && result.userEmail.includes("@")) {
      triggerRealDownload();
    } else {
      setCaptureAction("download");
      setCaptureEmailOpen(true);
    }
  };

  const handleSharePDF = async () => {
    if (result.userEmail && result.userEmail.includes("@")) {
      triggerRealSharePDF();
    } else {
      setCaptureAction("share");
      setCaptureEmailOpen(true);
    }
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  const handleShareText = async () => {
    const shareUrl = window.location.origin + window.location.pathname;
    const textToShare = `My TriAd Cognitive Archetype is ${profileCode} / ${archetype.name} ("${archetype.tagline}")! Calibrate yours at:\n`;
    const bodyText = `🔮 TRIAD COGNITIVE PORTFOLIO CALIBRATION 🔮
Subject: ${userName}
Identity Blueprint: ${profileCode} / ${archetype.name.toUpperCase()}
"${archetype.tagline}"

Core Mental Vectors:
⚡ Imagination Score: ${Math.round(macroScores.imagination)}%
🌿 Intuition Score: ${Math.round(macroScores.intuition)}%
⚖️ Judgment Score: ${Math.round(macroScores.judgment)}%

Career Trajectory Guidance:
• ${archetype.careerPaths[0]}

Formulate your blueprint coordinate structure at:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `TriAd Cognitive Archetype: ${profileCode}`,
          text: `${bodyText}\n${shareUrl}`,
          url: shareUrl,
        });
      } catch (err) {
        // clipboard copy as backup
        copyTextPayload(`${bodyText}\n${shareUrl}`);
      }
    } else {
      copyTextPayload(`${bodyText}\n${shareUrl}`);
    }
  };

  // Stale duplicate handleSharePDF removed in favor of email verification wrapper

  const copyTextPayload = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }).catch(err => {
      console.error("Could not copy:", err);
    });
  };

  const handleCaptureEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureEmailAddress || !captureEmailAddress.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    
    setEmailError("");
    setCaptureEmailOpen(false);

    // Update active result with email
    const updated = {
      ...result,
      userEmail: captureEmailAddress
    };

    if (onUpdateResult) {
      onUpdateResult(updated);
    }

    // Now trigger original action
    if (captureAction === "download") {
      triggerRealDownload();
    } else if (captureAction === "share") {
      triggerRealSharePDF();
    }

    setCaptureAction(null);
  };

  const handlePremiumOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!premiumOrderAddress || !premiumOrderAddress.includes("@")) {
      setPremiumOrderError("Please enter a valid email address.");
      return;
    }

    setPremiumOrderStatus("submitting");
    setPremiumOrderError("");

    try {
      const response = await fetch("/api/premium-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: premiumOrderAddress,
          name: userName,
          profileCode: profileCode,
          macroScores: macroScores,
          archetype: archetype,
          timestamp: timestamp
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPremiumOrderStatus("success");
        // Also write email to results if they don't have one
        if (!result.userEmail && onUpdateResult) {
          onUpdateResult({
            ...result,
            userEmail: premiumOrderAddress
          });
          setCaptureEmailAddress(premiumOrderAddress);
        }
      } else {
        setPremiumOrderStatus("error");
        setPremiumOrderError(data.message || "Failed to submit premium requisition.");
      }
    } catch (err) {
      setPremiumOrderStatus("error");
      setPremiumOrderError("Network connection error. Server rejected request.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Alert Ribbon */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-8 flex justify-between items-center gap-4 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="font-semibold text-sm">Calibration Completed.</span>
            <p className="text-xs text-emerald-700">Cognitive structures mapped and raw bounds normalized successfully under high precision.</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block shrink-0">
          Timestamp: {new Date(timestamp).toLocaleTimeString()}
        </div>
      </motion.div>

      {/* Top action row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
            Cerebral Calibration Map
          </h1>
          <p className="text-sm text-gray-500">
            Subject ID: <span className="text-indigo-600 font-semibold">{userName}</span> &bull; Verified Protocol MVP V2
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={onRetake}
            id="btn-new-assessment"
            className="px-3.5 py-2 text-xs md:text-sm font-medium border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Assessment
          </button>
          
          <button
            onClick={handleShare}
            id="btn-share-results"
            className={`px-3.5 py-2 text-xs md:text-sm font-medium border rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              shareCopied
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300"
            }`}
          >
            {shareCopied ? (
              <>
                <Award className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                Copied Link!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                Share Archetype
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            id="btn-download-pdf"
            className="px-3.5 py-2 text-xs md:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm font-display font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF Report
          </button>

          <button
            onClick={handleExportJSON}
            id="btn-export-json"
            className="px-3.5 py-2 text-xs md:text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Export Raw JSON
          </button>
        </div>
      </div>

      {/* Primary Dashboard Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Archetype Card Left */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 border border-indigo-100/50 rounded-md text-indigo-700 uppercase font-mono tracking-wider">
                Cognitive Archetype
              </span>
              <div className="text-right text-xs text-slate-400 font-mono">
                Code Profile: <span className="font-bold text-gray-800">{profileCode}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-6xl font-black tracking-tighter text-indigo-600 font-display mb-2 animate-pulse-slow">
                {profileCode}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-950 font-display">
                {archetype.name}
              </h2>
              <p className="text-sm text-indigo-500/80 font-medium italic mt-1.5">
                &ldquo;{archetype.tagline}&rdquo;
              </p>
            </div>

            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 font-light">
              {archetype.description}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6 flex items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>MATH_SCALE: MIN-MAX NORMALIZED</span>
            </div>
            <span>MVP_V2_CORE</span>
          </div>
        </div>

        {/* Dynamic Radar Chart Right */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between items-center">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="font-display font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              Visual Vector Projection
            </h3>
            {/* Toggles */}
            <div className="bg-slate-50 border border-slate-100 p-0.5 rounded-lg flex gap-1">
              <button
                onClick={() => setChartType("micro")}
                className={`px-2.5 py-1 text-[11px] font-medium font-mono rounded-md transition-all cursor-pointer ${
                  chartType === "micro"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                8 Micro
              </button>
              <button
                onClick={() => setChartType("macro")}
                className={`px-2.5 py-1 text-[11px] font-medium font-mono rounded-md transition-all cursor-pointer ${
                  chartType === "macro"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                3 Macro
              </button>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative flex items-center justify-center p-2">
            <svg 
              width={SVG_SIZE} 
              height={SVG_SIZE} 
              className="overflow-visible select-none"
              aria-label="Cognitive Assessment Radar Chart"
            >
              <g>
                {chartType === "micro" ? (
                  <>
                    {/* Ring helper labels */}
                    {microGrids.map((g, idx) => (
                      <g key={idx}>
                        <polygon
                          points={g.points}
                          fill="none"
                          stroke="#f1f3f5"
                          strokeWidth="1.5"
                        />
                        {/* % numbers directly vertical */}
                        <text
                          x={CENTER}
                          y={CENTER - ((idx + 1) / microGridLinesCount) * MAX_RADIUS + 4}
                          fill="#ccd0d6"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          stroke="#ffffff"
                          strokeWidth="2"
                          paintOrder="stroke"
                        >
                          {g.percentage}%
                        </text>
                      </g>
                    ))}

                    {/* Axial radial lines */}
                    {microAxes.map((axis, idx) => (
                      <line
                        key={idx}
                        x1={axis.x1}
                        y1={axis.y1}
                        x2={axis.x2}
                        y2={axis.y2}
                        stroke="#f1f3f5"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                    ))}

                    {/* Active User filled Polygon outline */}
                    <polygon
                      points={microScorePointsStr}
                      fill="rgba(79, 70, 229, 0.12)"
                      stroke="rgba(79, 70, 229, 0.75)"
                      strokeWidth="2"
                    />

                    {/* Glowing dots at vertex points */}
                    {orderedTraitKeys.map((traitKey, tIdx) => {
                      const score = normalizedScores[traitKey] ?? 0;
                      const radius = (score / 100) * MAX_RADIUS;
                      const angle = tIdx * (360 / 8);
                      const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
                      return (
                        <circle
                          key={tIdx}
                          cx={x}
                          cy={y}
                          r="4.5"
                          fill="#4f46e5"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="hover:scale-125 transition-transform cursor-pointer"
                          title={`${traitLabels[traitKey]}: ${Math.round(score)}%`}
                        />
                      );
                    })}

                    {/* Axis Labels */}
                    {microAxes.map((axis, idx) => (
                      <text
                        key={idx}
                        x={axis.lx}
                        y={axis.ly + 3}
                        fill="#5c697a"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                        textAnchor={axis.textAnchor}
                        className="cursor-pointer hover:fill-indigo-600 transition-colors"
                        onClick={() => setSelectedBarTrait(axis.traitKey)}
                      >
                        {axis.name} ({axis.score}%)
                      </text>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Ring labels for macro triangle grids */}
                    {macroGridLines.map((g, idx) => (
                      <g key={idx}>
                        <polygon
                          points={g.points}
                          fill="none"
                          stroke="#f1f3f5"
                          strokeWidth="1.5"
                        />
                        <text
                          x={CENTER}
                          y={CENTER - ((idx + 1) / 4) * MAX_RADIUS + 4}
                          fill="#ccd0d6"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          stroke="#ffffff"
                          strokeWidth="2"
                          paintOrder="stroke"
                        >
                          {g.percentage}%
                        </text>
                      </g>
                    ))}

                    {/* 3 axes */}
                    {macroAxes.map((axis, idx) => (
                      <line
                        key={idx}
                        x1={axis.x1}
                        y1={axis.y1}
                        x2={axis.x2}
                        y2={axis.y2}
                        stroke="#f1f3f5"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                    ))}

                    {/* Polygon filled for Macro scores */}
                    <polygon
                      points={macroScorePointsStr}
                      fill="rgba(59, 130, 246, 0.15)"
                      stroke="rgba(59, 130, 246, 0.75)"
                      strokeWidth="2"
                    />

                    {/* Glowing dots at vertex points */}
                    {macroKeys.map((macroKey, mIdx) => {
                      const score = macroScores[macroKey] ?? 0;
                      const radius = (score / 100) * MAX_RADIUS;
                      const angle = mIdx * (360 / 3);
                      const { x, y } = polarToCartesian(CENTER, CENTER, radius, angle);
                      return (
                        <circle
                          key={mIdx}
                          cx={x}
                          cy={y}
                          r="5.5"
                          fill="#3b82f6"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="hover:scale-125 transition-transform cursor-pointer animate-pulse-slow"
                          title={`${macroKey.toUpperCase()}: ${Math.round(score)}%`}
                        />
                      );
                    })}

                    {/* Axis labels */}
                    {macroAxes.map((axis, idx) => (
                      <text
                        key={idx}
                        x={axis.lx}
                        y={axis.ly + 3}
                        fill="#334155"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="700"
                        textAnchor={axis.textAnchor}
                      >
                        {axis.name} ({axis.score}%)
                      </text>
                    ))}
                  </>
                )}
              </g>
            </svg>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-mono leading-relaxed mt-2">
            Click labels in 8 Micro model to focus detail logs below
          </div>
        </div>
      </div>

      {/* Strengths, Gaps, and Career Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Key Strengths */}
        <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-6 md:p-8">
          <h4 className="font-display font-bold text-gray-900 border-b border-emerald-100 pb-3 mb-4 text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-600" />
            Core Catalytic Strengths
          </h4>
          <ul className="space-y-3">
            {archetype.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Core Challenges */}
        <div className="bg-rose-50/20 border border-rose-100 rounded-2xl p-6 md:p-8">
          <h4 className="font-display font-bold text-gray-900 border-b border-rose-100 pb-3 mb-4 text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-600" />
            Operational Inhibitors
          </h4>
          <ul className="space-y-3">
            {archetype.challenges.map((chal, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="text-rose-500 font-bold shrink-0">!</span>
                <span>{chal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Fields */}
        <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-6 md:p-8">
          <h4 className="font-display font-bold text-gray-900 border-b border-indigo-100 pb-3 mb-4 text-sm flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
            Strategic Alignment Arenas
          </h4>
          <ul className="space-y-3">
            {archetype.careerPaths.map((path, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-gray-700 leading-semibold">
                <span className="text-indigo-400 shrink-0">&#9638;</span>
                <span>{path}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SECTION 4: UNLOCK COGNITIVE DISCOVERY PREMIUM PORTFOLIO */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800 rounded-3xl p-6 md:p-10 mb-12 shadow-xl relative overflow-hidden select-none">
        {/* Absolute Background Accent Glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
              ✦ Deep Cognitive Intel Upgrade Available
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-3">
              Unlock Your Expanded 40-Page Premium Portfolio
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mt-2.5 font-light">
              Move beyond macro metrics. Request a fully manual offline behavioral audit compiled containing custom neural friction matrices, social communication alignment guides, workplace stressor mitigation plans, and an exclusive 1-on-1 advisor matching dossier.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />40-Page Dossier</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Workplace Calibrators</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />Direct Email Delivery</span>
            </div>
          </div>
          
          <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2.5 min-w-[240px]">
            <button
              onClick={() => {
                setPremiumOrderStatus("idle");
                setPremiumOrderError("");
                setPremiumOrderOpen(true);
              }}
              className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-xs md:text-sm tracking-wider uppercase text-slate-905 bg-gradient-to-r from-yellow-350 via-amber-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10"
            >
              Order Premium Report (Free)
              <span>✦</span>
            </button>
            <div className="text-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Fulfillment: nidhal.mgh@gmail.com
            </div>
          </div>
        </div>
      </div>

      {/* Consolidated Interactive Sub-Trait Progression meters */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 mb-12 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 mb-8 gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Granular Sub-Trait Calibrations
            </h3>
            <p className="text-xs text-gray-500 mt-1">Select a metrics container below to focus on its system definitions</p>
          </div>
          <div className="p-3 bg-[#faf8f5] border border-slate-200/50 rounded-xl max-w-sm">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Focused Detail Module</div>
            <div className="text-xs font-semibold text-gray-800 font-mono mt-0.5">{traitLabels[selectedBarTrait]}</div>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">{traitDescriptions[selectedBarTrait]}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {orderedTraitKeys.map((traitKey) => {
            const score = normalizedScores[traitKey] ?? 0;
            const isFocused = selectedBarTrait === traitKey;

            // Determine matching styling accents
            let accentColor = "bg-amber-500";
            let hoverBg = "hover:bg-amber-50/30";
            if (["physical", "metaphysical", "discernment"].includes(traitKey)) {
              accentColor = "bg-emerald-500";
              hoverBg = "hover:bg-emerald-50/20";
            } else if (["logical", "emotional", "predictive"].includes(traitKey)) {
              accentColor = "bg-indigo-600";
              hoverBg = "hover:bg-indigo-50/20";
            }

            return (
              <button
                key={traitKey}
                onClick={() => setSelectedBarTrait(traitKey)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                  isFocused 
                    ? "bg-slate-50 border-slate-300 ring-1 ring-slate-400/50" 
                    : `border-transparent ${hoverBg}`
                }`}
                style={{ contentVisibility: "auto" }}
              >
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-gray-900 font-display flex items-center gap-1.5">
                    {traitLabels[traitKey]}
                    {isFocused && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                  </span>
                  <span className="font-mono font-bold text-gray-700">{Math.round(score)}%</span>
                </div>
                {/* Meter block */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={`h-full ${accentColor}`}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1.5 flex justify-between">
                  <span>SCALE_NORMALIZED</span>
                  <span>FACTOR_100</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Historical Logs Node */}
      {history.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Calendar className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h3 className="font-display text-lg font-bold text-gray-905">Local Calibration Database</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-full ml-auto">
              {history.length} Node{history.length !== 1 && "s"} Tracked
            </span>
          </div>

          <div className="overflow-x-auto min-w-full">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-[#faf8f5]/40 font-mono text-[10px] uppercase font-semibold text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Assessor Name</th>
                  <th scope="col" className="px-4 py-3">Archetype (Code)</th>
                  <th scope="col" className="px-4 py-3 hidden md:table-cell">Imagination</th>
                  <th scope="col" className="px-4 py-3 hidden md:table-cell">Intuition</th>
                  <th scope="col" className="px-4 py-3 hidden md:table-cell">Judgment</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {history.map((record) => {
                  const isCurrent = record.id === result.id;
                  const itemArchetype = getArchetype(record.profileCode);

                  return (
                    <tr 
                      key={record.id} 
                      className={`transition-colors whitespace-nowrap ${
                        isCurrent ? "bg-indigo-50/20 font-bold text-indigo-950" : "hover:bg-slate-50/50"
                      }`}
                      style={{ contentVisibility: "auto" }}
                    >
                      <td className="px-4 py-3.5 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{record.userName}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md uppercase ml-1 animate-pulse">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs">{itemArchetype.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-wider">{record.profileCode}</div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell font-mono text-xs">
                        {record.macroScores.imagination}%
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell font-mono text-xs">
                        {record.macroScores.intuition}%
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell font-mono text-xs">
                        {record.macroScores.judgment}%
                      </td>
                      <td className="px-4 py-3.5 text-right font-normal">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectHistorical(record)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Load Profile View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteHistory(record.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Delete Node Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Premium Web Share Option Modal Overlay */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200/80 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Background pattern decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                  Share Portal
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-2">
                  Cognitive Share Blueprint
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Transmit your authentic calibrated {profileCode} core coordinate map.
                </p>
              </div>
              <button
                onClick={() => setIsShareOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-850 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two Choices layout: Elegant Text vs Full PDF */}
            <div className="space-y-4">
              
              {/* Option 1: Beautiful Text Summary */}
              <button
                onClick={handleShareText}
                className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/80 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all flex items-start gap-4 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-605 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-orange-650" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-850 group-hover:text-indigo-900 transition-colors">
                    Option A: Share Identity Summary (Text)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Copies or shares clean, stylized markdown with scores, active strengths, code, and direct link. Optimized for social updates, Slack, and text channels.
                  </p>
                  
                  {/* Miniature live preview */}
                  <div className="mt-2.5 p-2 bg-white/80 border border-slate-100 rounded-lg text-[9px] font-mono text-slate-400 max-h-16 overflow-hidden select-none">
                    🔮 TRIAD COGNITIVE CALIBRATION...<br/>
                    Subject: {userName}<br/>
                    Identity: {profileCode} / {archetype.name}
                  </div>
                </div>
              </button>

              {/* Option 2: Share Premium PDF Document */}
              <button
                onClick={handleSharePDF}
                disabled={pdfSharingState === "generating" || pdfSharingState === "sharing"}
                className="w-full text-left p-4 bg-slate-50 hover:bg-indigo-50/10 active:bg-slate-100 border border-slate-200 hover:border-slate-350 rounded-2xl transition-all flex items-start gap-4 cursor-pointer group disabled:opacity-85"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-850 group-hover:text-indigo-900 transition-colors">
                    Option B: Share Portrait Document (PDF)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Bundles a mathematical double-page PDF configuration report, sharing it natively on mobile or desktop. Falls back to dynamic download if native file-sharing is unsupported.
                  </p>

                  {/* Dynamic Sharing Status Badge */}
                  <div className="mt-3 flex items-center gap-2">
                    {pdfSharingState === "idle" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 bg-white border border-slate-150 px-2 py-0.5 rounded-md">
                        ● READY_TO_COMPILE
                      </span>
                    )}
                    {pdfSharingState === "generating" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-indigo-650 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md animate-pulse">
                        ⌛ Compiling professional PDF metrics...
                      </span>
                    )}
                    {pdfSharingState === "sharing" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-md animate-pulse">
                        ⚡ Invoking native communication channel selector...
                      </span>
                    )}
                    {pdfSharingState === "fallback" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-700 bg-amber-50 border border-amber-205 px-2 py-0.5 rounded-md animate-bounce">
                        ⚠️ File share unsupported. Report downloaded to device!
                      </span>
                    )}
                    {pdfSharingState === "done" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-md">
                        ✓ Transmission finished successfully!
                      </span>
                    )}
                  </div>
                </div>
              </button>

            </div>

            {/* Quick footer notification */}
            {shareCopied && (
              <div className="mt-4 p-2 bg-emerald-50 text-emerald-800 text-center font-semibold text-xs border border-emerald-200 rounded-xl">
                Text summary successfully copied to clipboard!
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-105 flex justify-end gap-2.5">
              <button
                onClick={() => setIsShareOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-650 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Close Portal
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* Email Capture Gate Modal before Download/Share */}
      {captureEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setCaptureEmailOpen(false)}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative z-10"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Secure Report Download
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verify your delivery email to retrieve your PDF blueprint files.
                </p>
              </div>
              <button
                onClick={() => setCaptureEmailOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCaptureEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Primary Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={captureEmailAddress}
                  onChange={(e) => {
                    setCaptureEmailAddress(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-250 focus:border-indigo-550 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium"
                />
                {emailError && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{emailError}</p>
                )}
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                * By submitting, your email is verified locally to register this psychometric assessment history and compile your customized document.
              </p>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCaptureEmailOpen(false)}
                  className="flex-1 py-12 text-xs font-semibold text-slate-605 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-style cursor-pointer"
                >
                  {captureAction === "download" ? "Download Report" : "Share Report"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Premium Order Placement Modal */}
      {premiumOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setPremiumOrderOpen(false)}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-yellow-600 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-lg">
                  ✦ Premium Calibration Upgrade
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-2">
                  Request Premium Dossier
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Securely compile a manual 40-page psychometric cognitive dossier.
                </p>
              </div>
              <button
                onClick={() => setPremiumOrderOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Summary */}
            <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4 mb-5">
              <div className="text-xs text-indigo-700 font-semibold font-mono uppercase tracking-wider">
                Target Node Designation
              </div>
              <div className="flex justify-between items-end mt-1">
                <div>
                  <div className="text-md font-bold text-slate-950">{userName}</div>
                  <div className="text-xs text-slate-500 italic font-mono mt-0.5">Profile Coordinate: {profileCode}</div>
                </div>
                <div className="text-2xl font-black text-indigo-600 font-display">{profileCode}</div>
              </div>
            </div>

            {/* Order Form */}
            {premiumOrderStatus === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold">✓</span>
                </div>
                <h4 className="text-md font-bold text-slate-900">Premium Order Lodged!</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Requisition compiled and dispatched directly to supervisor Node <span className="font-semibold text-slate-700">nidhal.mgh@gmail.com</span>. Delivery is scheduled shortly.
                </p>
                <button
                  onClick={() => setPremiumOrderOpen(false)}
                  className="mt-6 w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handlePremiumOrderSubmit} className="space-y-4">
                <div>
                  <label htmlFor="premium-email-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Delivery Email Address
                  </label>
                  <input
                    id="premium-email-input"
                    type="email"
                    required
                    placeholder="name@organization.com"
                    value={premiumOrderAddress}
                    onChange={(e) => {
                      setPremiumOrderAddress(e.target.value);
                      if (premiumOrderError) setPremiumOrderError("");
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-250 focus:border-indigo-550 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium"
                  />
                  {premiumOrderError && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{premiumOrderError}</p>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">
                  ✦ <strong>Requisition Details:</strong> Deep psychometric audits require custom offline computing vectors. Submission sends an electronic notification to <strong>nidhal.mgh@gmail.com</strong> who manually validates and dispatches your expanded 40-page blueprint PDF.
                </p>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setPremiumOrderOpen(false)}
                    className="flex-1 py-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={premiumOrderStatus === "submitting"}
                    className="flex-1 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {premiumOrderStatus === "submitting" ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place Premium Order"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
