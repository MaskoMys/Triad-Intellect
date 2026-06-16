import { Sparkles, Compass, Brain } from "lucide-react";

export default function HowItWorksSection() {
  return (
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
  );
}
