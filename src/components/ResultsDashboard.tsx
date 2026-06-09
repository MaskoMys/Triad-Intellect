import React, { useState } from "react";
import { 
  Download, Trash2, Calendar, User, Eye, Sparkles, BookOpen, 
  Settings, Award, RefreshCw, Trophy, ArrowUpRight, HelpCircle,
  Share2
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
}

export default function ResultsDashboard({
  result,
  history,
  onRetake,
  onDeleteHistory,
  onSelectHistorical
}: ResultsDashboardProps) {
  const [chartType, setChartType] = useState<"micro" | "macro">("micro");
  const [selectedBarTrait, setSelectedBarTrait] = useState<TraitKey>("creativity");
  const [shareCopied, setShareCopied] = useState(false);

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

  const handleShare = async () => {
    const textToShare = `My TriAd Cognitive Archetype is ${profileCode} / ${archetype.name} ("${archetype.tagline}")! Calibrate yours at:`;
    const shareUrl = window.location.origin + window.location.pathname;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "TriAd Cognitive Assessment Calibration",
          text: `${textToShare} ${shareUrl}`,
          url: shareUrl,
        });
      } catch (err) {
        copyToClipboard(textToShare, shareUrl);
      }
    } else {
      copyToClipboard(textToShare, shareUrl);
    }
  };

  const copyToClipboard = (text: string, url: string) => {
    const fullText = `${text} ${url}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(err => {
      console.error("Could not copy link: ", err);
    });
  };

  const handleDownloadPDF = () => {
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

    // Save PDF
    doc.save(`TriAd_Cognitive_Map_${userName}_${profileCode}.pdf`);
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
    </div>
  );
}
