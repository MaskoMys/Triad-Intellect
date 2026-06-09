import React, { useState } from "react";
import { 
  Sparkles, Brain, Compass, Shield, ArrowRight, BookOpen, Layers,
  TrendingUp, Calendar, Trash2, Eye, User, Info, Award
} from "lucide-react";
import { motion } from "motion/react";
import { AssessmentResult } from "../types";

interface LandingPageProps {
  onStart: (name: string) => void;
  history?: AssessmentResult[];
  onSelectHistorical?: (result: AssessmentResult) => void;
  onDeleteHistory?: (id: string) => void;
}

export default function LandingPage({ 
  onStart, 
  history = [], 
  onSelectHistorical, 
  onDeleteHistory 
}: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<"assess" | "progress">(
    history.length > 0 ? "progress" : "assess"
  );
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please introduce yourself to initialize the assessment calibration.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Please provide a name of at least 2 characters.");
      return;
    }
    onStart(trimmed);
  };

  // Get most recent result
  const latestResult = history.length > 0 ? history[0] : null;

  // Chronological order for trendline plotting
  const chronologicalHistory = [...history].reverse();

  // Helper values for high custom SVG line chart
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const getYValue = (score: number) => {
    // 0% at chartH + paddingY, 100% at paddingY
    return paddingY + chartH - (score / 100) * chartH;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold tracking-wide mb-5 uppercase"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Advanced Cognitive Cartography Protocol
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4"
        >
          Tri-Ad Intelligence Mapping
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed mb-8"
        >
          Calibrate your dynamic coordinates across three macro mental vectors and eight specialized micro-traits using programmatically verified min-max limits.
        </motion.p>

        {/* Dashboard / Action Selector Premium Tab bar */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60 shadow-inner">
          <button
            id="tab-new-assessment"
            onClick={() => setActiveTab("assess")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all cursor-pointer ${
              activeTab === "assess"
                ? "bg-white text-indigo-950 font-semibold shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" />
            Assessment Terminal
          </button>
          <button
            id="tab-saved-profiles"
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all cursor-pointer relative ${
              activeTab === "progress"
                ? "bg-white text-indigo-950 font-semibold shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            Saved Profiles & Progress Dashboard
            {history.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full scale-90 shadow-md">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "assess" ? (
        <motion.div
          key="assess-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Bento Grid: The 3 Core Macro Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* IMAGINATION */}
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-5 border border-amber-100/50">
                  <Sparkles className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2.5 text-slate-900">1. IMAGINATION</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-5">
                  The generative capacity to envision, construct, and alter concepts. Relates to your baseline mental spark and creative flow.
                </p>
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-start text-[11px]">
                    <span className="font-semibold text-slate-800">Creativity (C)</span>
                    <span className="text-slate-400">Mental abstraction, original styling.</span>
                  </div>
                  <div className="flex justify-between items-start text-[11px]">
                    <span className="font-semibold text-slate-800">Innovation (I)</span>
                    <span className="text-slate-400">Reconfiguration, holistic system tuning.</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-[9px] text-slate-400 font-mono tracking-wider">DIMENSION_01_SPARK</div>
            </div>

            {/* INTUITION */}
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-5 border border-emerald-100/50">
                  <Compass className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2.5 text-slate-900">2. INTUITION</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-5">
                  The capacity to perceive recurring structures, transitions, and environmental dynamics without direct analytical proof.
                </p>
                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-start text-[11px]">
                    <span className="font-semibold text-slate-800">Physical (P)</span>
                    <span className="text-slate-400">Somatic feedback, environmental sensor.</span>
                  </div>
                  <div className="flex justify-between items-start text-[11px]">
                    <span className="font-semibold text-slate-800">Metaphysical (M)</span>
                    <span className="text-slate-400">Transcendence, structural field values.</span>
                  </div>
                  <div className="flex justify-between items-start text-[11px]">
                    <span className="font-semibold text-slate-800">Discernment (D)</span>
                    <span className="text-slate-400">Tactile truth-testing, skepticism.</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-[9px] text-slate-400 font-mono tracking-wider">DIMENSION_02_SENSE</div>
            </div>

            {/* JUDGMENT */}
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-700 mb-5 border border-indigo-100/50">
                  <Brain className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2.5 text-slate-900">3. JUDGMENT</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-5">
                  The foundational decision-making paradigm used to resolve logical, social, and functional trade-off dilemmas.
                </p>
                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-start text-[11px]">
                    <span className="font-semibold text-slate-800">Logical (L)</span>
                    <span className="text-slate-400">System metrics, axiomatic consistency.</span>
                  </div>
                  <div className="flex justify-between items-start text-[11px]">
                    <span className="font-semibold text-slate-800">Emotional (E)</span>
                    <span className="text-slate-400">Human resonance, relational ethics.</span>
                  </div>
                  <div className="flex justify-between items-start text-[11px]">
                    <span className="font-semibold text-slate-800">Predictive (R)</span>
                    <span className="text-slate-400">Trend projection, timeline modeling.</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-[9px] text-slate-400 font-mono tracking-wider">DIMENSION_03_DECIDE</div>
            </div>
          </div>

          {/* Quick Info & Start Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Model Info */}
            <div className="bg-[#f3f0e9]/40 border border-[#e7e1d5] rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-indigo-700" />
                  <h4 className="font-display text-base font-bold text-slate-800">Dynamic Normalization Baseline</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed space-y-2 mb-4">
                  Our algorithm calculates maximum and minimum theoretical bounds dynamically across every possible question path to assure your ultimate scores represent an objective distribution.
                </p>
                <div className="p-3 bg-white/70 rounded-xl border border-[#ded5c2] font-mono text-[10px] text-indigo-950/80 mb-3">
                  Score = (Raw_Score - Min_Possible) / (Max_Possible - Min_Possible) * 100
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                *We safeguard calibration integrity. Your score yields physical, metaphysical, and analytical projections without static biases.
              </p>
            </div>

            {/* Launcher Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-5 h-5 text-indigo-700" />
                  <h4 className="font-display text-base font-bold text-slate-800">Access calibration Terminal</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Input your identity credentials below to initialize the 30-question psychometric alignment process.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-3.5">
                  <label htmlFor="user-name" className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Assessor Nom de Guerre
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input
                        id="user-name"
                        type="text"
                        placeholder="Introduce your identity..."
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError("");
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 transition-all text-xs outline-none text-slate-900"
                      />
                      {error && (
                        <p className="absolute left-0 -bottom-5 text-[10px] text-rose-500 font-semibold">{error}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      id="btn-initialize-calibration"
                      className="px-5 py-3 bg-slate-950 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer shadow-xs font-display shrink-0"
                    >
                      Connect Node
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="progress-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {history.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center shadow-xs max-w-lg mx-auto">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-5 border border-slate-150">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-850 mb-2">No Profiles Calibrated</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                You do not have any assessment history saved. Once you complete your first psychometric run, your dynamic cognitive scores, archetypes, and metrics will be persisted here across sessions.
              </p>
              <button
                onClick={() => setActiveTab("assess")}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                Launch Assessment First
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Dashboard Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Latest Calibrated Profile Highlight */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-full blur-xl -mr-6 -mt-6" />
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                    <span className="text-[10px] font-mono uppercase text-indigo-600 font-bold tracking-wider">Active Configuration</span>
                  </div>

                  {latestResult && (
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <h4 className="font-display text-3xl font-black text-indigo-700 tracking-tight">
                          {latestResult.profileCode}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(latestResult.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <h5 className="font-display font-extrabold text-sm text-slate-900 mb-1 uppercase">
                        {latestResult.archetype.name}
                      </h5>
                      
                      <p className="text-xs italic text-slate-500 font-light mb-4">
                        "{latestResult.archetype.tagline}"
                      </p>

                      <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-50 pt-4 mb-5">
                        {latestResult.archetype.description.slice(0, 190)}...
                      </p>

                      <button
                        onClick={() => onSelectHistorical && onSelectHistorical(latestResult)}
                        id="btn-latest-view-report"
                        className="w-full py-2.5 bg-slate-905 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-display"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Explore Complete Report
                      </button>
                    </div>
                  )}
                </div>

                {/* Cognitive Insight Panel */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-slate-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Dynamic Progression Insight</h4>
                  </div>
                  {history.length === 1 ? (
                    <p className="text-[11.5px] text-slate-500 leading-relaxed">
                      You have taken the assessment once. Calibration records are fully locked in your secure local sector. Take the exam again under different contexts to map cognitive drift!
                    </p>
                  ) : (
                    <p className="text-[11.5px] text-slate-500 leading-relaxed">
                      Observing <strong>{history.length} assessment updates</strong>. Your code shift suggests active cerebral adaptation. Keep calibrations current to maintain high precision path recommendations.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Trend charts and past history list */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* SVG Trend chart of macro dimensions */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-display text-sm font-bold text-slate-900">Cognitive Evolution Trend</h4>
                      <p className="text-[10px] text-slate-400">Visual index of macro changes across multiple calibration cycles</p>
                    </div>
                    
                    {/* Color legends */}
                    <div className="flex items-center gap-3 msg-legend text-[10px] font-mono">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-slate-500 text-[10px]">Imagination</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-500 text-[10px]">Intuition</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <span className="text-slate-500 text-[10px]">Judgment</span>
                      </div>
                    </div>
                  </div>

                  {history.length < 2 ? (
                    <div className="h-44 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200/80 rounded-2xl p-4 text-center">
                      <p className="text-[11px] text-slate-405 leading-relaxed max-w-sm">
                        <TrendingUp className="w-5 h-5 mx-auto mb-1 text-slate-400 opacity-60" />
                        History trend graphs update dynamically once you record <strong>two or more</strong> assessments.
                      </p>
                    </div>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <div className="min-w-[460px]">
                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                          {/* Y-axis helper grids */}
                          {[25, 50, 75, 100].map((val) => (
                            <g key={val}>
                              <line 
                                x1={paddingX} 
                                y1={getYValue(val)} 
                                x2={svgWidth - paddingX} 
                                y2={getYValue(val)} 
                                stroke="#f1f5f9" 
                                strokeWidth="1" 
                                strokeDasharray="3 3"
                              />
                              <text 
                                x={paddingX - 10} 
                                y={getYValue(val) + 3} 
                                fill="#94a3b8" 
                                fontSize="7" 
                                className="font-mono"
                                textAnchor="end"
                              >
                                {val}%
                              </text>
                            </g>
                          ))}
                          
                          {/* Bottom baseline */}
                          <line 
                            x1={paddingX} 
                            y1={getYValue(0)} 
                            x2={svgWidth - paddingX} 
                            y2={getYValue(0)} 
                            stroke="#e2e8f0" 
                            strokeWidth="1.5"
                          />

                          {/* Generate Paths */}
                          {(() => {
                            const stepSize = chartW / (chronologicalHistory.length - 1);
                            
                            const getPoints = (valKey: "imagination" | "intuition" | "judgment") => {
                              return chronologicalHistory.map((res, i) => {
                                const val = res.macroScores[valKey];
                                return {
                                  x: paddingX + i * stepSize,
                                  y: getYValue(val),
                                  score: val,
                                  code: res.profileCode
                                };
                              });
                            };

                            const imgPoints = getPoints("imagination");
                            const intPoints = getPoints("intuition");
                            const jdgPoints = getPoints("judgment");

                            const makePathD = (pts: Array<{x: number, y: number}>) => {
                              return pts.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                            };

                            return (
                              <>
                                {/* Trace lines */}
                                <path d={makePathD(imgPoints)} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d={makePathD(intPoints)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d={makePathD(jdgPoints)} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Draw node markers & text */}
                                {chronologicalHistory.map((res, i) => {
                                  const x = paddingX + i * stepSize;
                                  const imY = getYValue(res.macroScores.imagination);
                                  const inY = getYValue(res.macroScores.intuition);
                                  const jdY = getYValue(res.macroScores.judgment);
                                  const labelDate = new Date(res.timestamp).toLocaleDateString(undefined, {month: "short", day: "numeric"});

                                  return (
                                    <g key={res.id}>
                                      {/* Vertical time line */}
                                      <line x1={x} y1={paddingY} x2={x} y2={getYValue(0)} stroke="#f1f5f9" strokeWidth="1" />
                                      
                                      {/* imagination marker */}
                                      <circle cx={x} cy={imY} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                                      <text x={x} y={imY - 7} fill="#d97706" fontSize="7" fontWeight="bold" textAnchor="middle">{Math.round(res.macroScores.imagination)}</text>

                                      {/* intuition marker */}
                                      <circle cx={x} cy={inY} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                                      <text x={x} y={inY - 7} fill="#059669" fontSize="7" fontWeight="bold" textAnchor="middle">{Math.round(res.macroScores.intuition)}</text>

                                      {/* judgment marker */}
                                      <circle cx={x} cy={jdY} r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                                      <text x={x} y={jdY - 7} fill="#1d4ed8" fontSize="7" fontWeight="bold" textAnchor="middle">{Math.round(res.macroScores.judgment)}</text>

                                      {/* X axis labels */}
                                      <text x={x} y={getYValue(0) + 12} fill="#64748b" fontSize="8.5" fontWeight="bold" textAnchor="middle">{res.profileCode}</text>
                                      <text x={x} y={getYValue(0) + 21} fill="#94a3b8" fontSize="7.5" textAnchor="middle" className="font-mono">{labelDate}</text>
                                    </g>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* All assessments index table */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <h4 className="font-display text-sm font-bold text-slate-900 mb-4">Historical Calibration Entries</h4>
                  
                  <div className="space-y-3">
                    {history.map((item) => {
                      const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });

                      const isConfirming = confirmDeleteId === item.id;

                      return (
                        <div 
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200/50 rounded-2xl hover:border-slate-350 transition-colors gap-3.5"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-lg">
                                {item.profileCode}
                              </span>
                              <span className="text-xs font-bold font-display text-slate-850">
                                {item.userName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-[10.5px] text-slate-400 font-mono">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{dateStr}</span>
                            </div>
                          </div>

                          {/* Quick progress meters inside history */}
                          <div className="flex items-center gap-3.5 max-w-sm">
                            <div className="text-[10px] font-mono shrink-0 space-y-0.5">
                              <div><span className="text-amber-600 font-bold">IMG</span> <span className="text-slate-600 font-semibold">{Math.round(item.macroScores.imagination)}%</span></div>
                              <div><span className="text-emerald-600 font-bold">INT</span> <span className="text-slate-600 font-semibold">{Math.round(item.macroScores.intuition)}%</span></div>
                              <div><span className="text-indigo-600 font-bold">JDG</span> <span className="text-slate-600 font-semibold">{Math.round(item.macroScores.judgment)}%</span></div>
                            </div>

                            <div className="flex items-center gap-2 border-l border-slate-200 pl-3.5 shrink-0">
                              <button
                                onClick={() => onSelectHistorical && onSelectHistorical(item)}
                                id={`btn-view-profile-${item.id}`}
                                title="Open assessment calibration dashboard"
                                className="p-2 bg-white border border-slate-200/60 text-slate-600 hover:text-indigo-650 rounded-xl hover:border-indigo-150 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {isConfirming ? (
                                <div className="flex items-center gap-1.5 animation-fade-in shrink-0">
                                  <button
                                    onClick={() => onDeleteHistory && onDeleteHistory(item.id)}
                                    id={`btn-confirm-delete-${item.id}`}
                                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(item.id)}
                                  id={`btn-delete-profile-${item.id}`}
                                  title="Delete diagnostic record from secure local storage"
                                  className="p-2 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
