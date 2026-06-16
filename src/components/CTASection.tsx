import React, { useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import DisclaimerSection from "./DisclaimerSection";

interface CTASectionProps {
  onStart: (name: string) => void;
}

export default function CTASection({ onStart }: CTASectionProps) {
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
    <div className="bg-white border border-slate-100 rounded-3xl p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-5 h-5 text-indigo-700" />
          <h4 className="font-display text-base font-bold text-slate-800">Access Mapping Terminal</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Input your identity credentials below to initialize the 30-question symbolic archetype mapping process.
        </p>
        <div className="mb-4">
          <DisclaimerSection />
        </div>
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-xs outline-none text-slate-900 animate-none"
              />
              {error && (
                <p className="absolute left-0 -bottom-5 text-[10px] text-rose-500 font-semibold">{error}</p>
              )}
            </div>
            <button
              type="submit"
              id="btn-initialize-calibration"
              className="px-5 py-3 bg-slate-950 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer shadow-xs font-display shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Connect Node
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
