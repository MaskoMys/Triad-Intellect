import { Shield } from "lucide-react";

export default function AudienceSection() {
  return (
    <div className="bg-[#f3f0e9]/40 border border-[#e7e1d5] rounded-3xl p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-indigo-700" />
          <h4 className="font-display text-base font-bold text-slate-800">Dynamic Normalization Baseline</h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
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
  );
}
