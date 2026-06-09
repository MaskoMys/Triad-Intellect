import React, { useState } from "react";
import { Sparkles, Brain, Compass, Shield, ArrowRight, BookOpen, Layers } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onStart: (name: string) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
      {/* Hero Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-medium tracking-wide mb-6 uppercase"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Psychometric Engine MVP V2
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6"
        >
          Tri-Ad Intelligence <br />
          <span className="text-indigo-600 bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Assessment Platform</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed"
        >
          An elite, mathematically normalized psychometric model mapping cognitive preferences across three core dimensions and eight specialized micro-traits.
        </motion.p>
      </div>

      {/* Bento Grid: The 3 Core Macro Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* IMAGINATION */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 border border-amber-100/50">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3 text-gray-900">1. IMAGINATION</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              The generative capacity to envision, construct, and alter concepts. Relates to your baseline mental spark.
            </p>
            <div className="space-y-2 border-t border-slate-50 pt-4">
              <div className="flex justify-between items-start text-xs">
                <span className="font-medium text-gray-900">Creativity (C)</span>
                <span className="text-gray-500">Abstraction, original design.</span>
              </div>
              <div className="flex justify-between items-start text-xs">
                <span className="font-medium text-gray-900">Innovation (I)</span>
                <span className="text-gray-500">Reconfiguration, systemic optimization.</span>
              </div>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-400 font-mono">DIMENSION_01_SPARK</div>
        </motion.div>

        {/* INTUITION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100/50">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3 text-gray-900">2. INTUITION</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              The capacity to perceive patterns, transitions, and dynamics without conscious deliberation.
            </p>
            <div className="space-y-4 border-t border-slate-50 pt-4">
              <div className="flex justify-between items-start text-xs">
                <span className="font-medium text-gray-900">Physical (P)</span>
                <span className="text-gray-500">Somatic observation, sensory environment.</span>
              </div>
              <div className="flex justify-between items-start text-xs">
                <span className="font-medium text-gray-900">Metaphysical (M)</span>
                <span className="text-gray-500">Transcendence, subtle energetic flows.</span>
              </div>
              <div className="flex justify-between items-start text-xs">
                <span className="font-medium text-gray-900">Discernment (D)</span>
                <span className="text-gray-500">Intuitive truth-testing, skepticism.</span>
              </div>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-400 font-mono">DIMENSION_02_SENSE</div>
        </motion.div>

        {/* JUDGMENT */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-700 mb-6 border border-indigo-100/50">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3 text-gray-900">3. JUDGMENT</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              The underlying decision-making architecture used to parse information and resolve critical dilemmas.
            </p>
            <div className="space-y-4 border-t border-slate-50 pt-4">
              <div className="flex justify-between items-start text-xs">
                <span className="font-medium text-gray-900">Logical (L)</span>
                <span className="text-gray-500">Data, consistency, mechanical guidelines.</span>
              </div>
              <div className="flex justify-between items-start text-xs">
                <span className="font-medium text-gray-900 font-display">Emotional (E)</span>
                <span className="text-gray-500">Relational resonance, human context.</span>
              </div>
              <div className="flex justify-between items-start text-xs">
                <span className="font-medium text-gray-900">Predictive (R)</span>
                <span className="text-gray-500">Temporal modeling, future forecasting.</span>
              </div>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-400 font-mono">DIMENSION_03_DECIDE</div>
        </motion.div>
      </div>

      {/* Scoring Detail Card (Section 2 explanation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-[#f2efe9]/40 border border-[#e8e4db] rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-indigo-700" />
            <h4 className="font-display text-lg font-semibold text-gray-800">Dynamic Calibration Engine</h4>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed space-y-3">
            To achieve absolute psychometric measurement, we bypass static point totals in favor of an active <strong>Dynamic Boundary Min-Max Normalization</strong>.
          </p>
          <div className="my-5 p-4 bg-white/70 rounded-xl border border-[#e5dec9] font-mono text-xs text-indigo-950/80">
            Score_t = Max(0, Min(100, (RawScore_t - RawMin_t) / (RawMax_t - RawMin_t) * 100))
          </div>
          <p className="text-xs text-gray-500 italic">
            This method scans all possible questionnaire branch weights at initialization, establishing accurate maximum and minimum ceilings. This guarantees your profile is fitted dynamically on a clean 0% to 100% distribution.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-700" />
              <h4 className="font-display text-lg font-semibold text-gray-800">Assessment Protocol</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2" />
                <span><strong>30 Situational Items:</strong> Deep dilemmas requiring complex, nuanced, and trade-off choices.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2" />
                <span><strong>No Timer Constraint:</strong> Focus on authenticity; your primary gut reactions provide the cleanest calibrations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2" />
                <span><strong>Three-letter Profile:</strong> Produces one of 18 distinct cerebral archetypes specifying deep cognitive preferences.</span>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="space-y-4">
              <label htmlFor="user-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Cognitive Assessor Name
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    id="user-name"
                    type="text"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none text-gray-900"
                  />
                  {error && (
                    <p className="absolute left-0 -bottom-6 text-xs text-rose-500 font-medium">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-slate-900 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all cursor-pointer shadow-xs font-display"
                >
                  Start Quiz
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
