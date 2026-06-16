import { useState } from "react";
import { 
  ArrowRight, Layers, TrendingUp, Calendar, Trash2, Eye, Info, Award
} from "lucide-react";
import { motion } from "motion/react";
import { AssessmentResult } from "../types";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import AudienceSection from "./AudienceSection";
import CTASection from "./CTASection";

interface LandingPageProps {
  onStart: (name: string) => void;
  history?: AssessmentResult[];
  onSelectHistorical?: (result: AssessmentResult) => void;
  onDeleteHistory?: (id: string) => void;
  onClearAllHistory?: () => void;
  activeTab?: "assess" | "progress";
  setActiveTab?: (tab: "assess" | "progress") => void;
  onLoadDemo?: () => void;
}

export default function LandingPage({ 
  onStart, 
  history = [], 
  onSelectHistorical, 
  onDeleteHistory,
  onClearAllHistory,
  activeTab: controlledActiveTab,
  setActiveTab: controlledSetActiveTab,
  onLoadDemo
}: LandingPageProps) {
  const [localActiveTab, setLocalActiveTab] = useState<"assess" | "progress">(
    history.length > 0 ? "progress" : "assess"
  );

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : localActiveTab;
  const setActiveTab = controlledSetActiveTab !== undefined ? controlledSetActiveTab : setLocalActiveTab;

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isConfirmingAll, setIsConfirmingAll] = useState(false);

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
      <HeroSection
        onLoadDemo={onLoadDemo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyLength={history.length}
      />

      {activeTab === "assess" ? (
        <motion.div
          key="assess-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Bento Grid: The 3 Core Macro Dimensions */}
          <HowItWorksSection />

          {/* Quick Info & Start Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Model Info */}
            <AudienceSection />

            {/* Launcher Card */}
            <CTASection onStart={onStart} />
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
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-5 border border-slate-200">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-850 mb-2">No Profiles Calibrated</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                You do not have any assessment history saved. Once you complete your first mapping run, your symbolic cognitive profile, archetypes, and metrics will be persisted here across sessions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setActiveTab("assess")}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Launch Assessment First
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLoadDemo}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/50 rounded-xl text-xs font-semibold shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  🔮 Explore Sample Dashboard
                </button>
              </div>
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
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-display focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
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
                      You have taken the self-reflection assessment once. Records are saved in your local sector. Try taking it again under different mental states to map cognitive balance adjustments!
                    </p>
                  ) : (
                    <p className="text-[11.5px] text-slate-500 leading-relaxed">
                      Observing <strong>{history.length} updates</strong>. Your symbolic trajectory suggests active adaptation. Try mapping again to explore your shifting profile balances.
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
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <h4 className="font-display text-sm font-bold text-slate-900">Historical Profile Entries</h4>
                    {history.length > 0 && onClearAllHistory && (
                      isConfirmingAll ? (
                        <div className="flex items-center gap-1.5 shrink-0 text-left">
                          <span className="text-[10px] text-rose-600 font-semibold hidden xs:inline">Deletes all local records:</span>
                          <button
                            onClick={() => {
                              onClearAllHistory();
                              setIsConfirmingAll(false);
                            }}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            Yes, Clear All
                          </button>
                          <button
                            onClick={() => setIsConfirmingAll(false)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsConfirmingAll(true)}
                          className="text-[10.5px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete My Local Results
                        </button>
                      )
                    )}
                  </div>
                  
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
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200/50 rounded-2xl hover:border-slate-300 transition-colors gap-3.5"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
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
                                title="Open cognitive mapping dashboard"
                                className="p-2 bg-white border border-slate-200/60 text-slate-600 hover:text-indigo-600 rounded-xl hover:border-indigo-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {isConfirming ? (
                                <div className="flex items-center gap-1.5 animation-fade-in shrink-0">
                                  <button
                                    onClick={() => onDeleteHistory && onDeleteHistory(item.id)}
                                    id={`btn-confirm-delete-${item.id}`}
                                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(item.id)}
                                  id={`btn-delete-profile-${item.id}`}
                                  title="Delete profile record from secure local storage"
                                  className="p-2 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
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
