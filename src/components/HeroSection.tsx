import { Sparkles, Brain, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onLoadDemo?: () => void;
  activeTab: "assess" | "progress";
  setActiveTab: (tab: "assess" | "progress") => void;
  historyLength: number;
}

export default function HeroSection({
  onLoadDemo,
  activeTab,
  setActiveTab,
  historyLength,
}: HeroSectionProps) {
  return (
    <div className="text-center mb-10">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold tracking-wide mb-5 uppercase"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Experimental Cognitive Cartography Protocol
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4"
      >
        Tri-Ad Cognitive Archetype Mapper
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed mb-4"
      >
        Explore your symbolic cognitive profile across three macro mental vectors and eight specialized sub-traits. Designed as an experimental tool for self-reflection and exploration.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="text-[10.5px] text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed font-mono"
      >
        Tri-Ad is an experimental self-reflection tool. It is not a clinical, educational, employment, financial, medical, or psychological diagnostic instrument.
      </motion.p>

      {/* Instant Dashboard Demo Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8 max-w-2xl mx-auto bg-gradient-to-r from-indigo-50/70 via-amber-50/20 to-indigo-50/70 border border-indigo-200/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
      >
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wide">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            🌟 Live Demonstration Sector Active
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
            Want to skip the 30-question reflective self-assessment and explore the complete visual dashboard, dynamic charts, carrier profiles, and PDF dispatch systems instantly? Load a preloaded demo workspace template.
          </p>
        </div>
        <button
          onClick={onLoadDemo}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs hover:shadow-md whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Explore Demo Dashboard 🔮
        </button>
      </motion.div>

      {/* Dashboard / Action Selector Premium Tab bar */}
      <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60 shadow-inner">
        <button
          id="tab-new-assessment"
          onClick={() => setActiveTab("assess")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${
            activeTab === "progress"
              ? "bg-white text-indigo-950 font-semibold shadow-xs border border-slate-200/50"
              : "text-slate-500 hover:text-slate-950"
          }`}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          Saved Profiles & Progress Dashboard
          {historyLength > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full scale-90 shadow-md">
              {historyLength}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
