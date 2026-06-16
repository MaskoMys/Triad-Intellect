import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { questions } from "../questions";

interface AssessmentWizardProps {
  userName: string;
  onComplete: (responses: Record<number, number>) => void;
  onCancel: () => void;
}

export default function AssessmentWizard({ userName, onComplete, onCancel }: AssessmentWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [direction, setDirection] = useState<"left" | "right">("right");

  const currentQuestion = questions[currentIndex];

  // Auto-scroll to top when question changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 font-mono">
        Calibration error: Question index {currentIndex} not found.
      </div>
    );
  }

  const handleSelectOption = (optionIndex: number) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection("left");
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection("right");
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const isCompleted = Object.keys(responses).length === questions.length;
  const answeredCount = Object.keys(responses).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const handleSubmit = () => {
    if (isCompleted) {
      onComplete(responses);
    }
  };

  // Enable arrow-key and digit (1-4) accessibility for high-quality quiz taking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        if (responses[currentQuestion.id] !== undefined) {
          handleNext();
        }
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIdx = parseInt(e.key) - 1;
        if (currentQuestion.options[optionIdx]) {
          handleSelectOption(optionIdx);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, responses, currentQuestion]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Protocol Status Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-mono tracking-wider uppercase">Reflecting Node</div>
          <div className="text-sm font-semibold text-slate-800">Assessor: <span className="text-indigo-600">{userName}</span></div>
        </div>
        <div className="flex-1 md:max-w-xs">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-mono">
            <span>Progress Status</span>
            <span>{answeredCount} / {questions.length} Items</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
              className="bg-indigo-600 h-full rounded-full"
            />
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600 underline font-mono cursor-pointer"
        >
          Abort Protocol
        </button>
      </div>

      {/* Main Question Display Arena */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden min-h-[420px] flex flex-col justify-between mb-8">
        
        {/* Scenario Header with subtle animation */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-md text-slate-500 uppercase font-mono tracking-wider">
              Mapping Step {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: Q30-{currentQuestion.id.toString().padStart(2, "0")}
            </span>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={{
                enter: (dir) => ({
                  x: dir === "right" ? 100 : -100,
                  opacity: 0
                }),
                center: {
                  x: 0,
                  opacity: 1
                },
                exit: (dir) => ({
                  x: dir === "right" ? -100 : 100,
                  opacity: 0
                })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {/* Context Box */}
              <div className="mb-6 p-4 bg-[#fcfbfa] border-l-4 border-[#e5dec9] rounded-r-xl">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8a7f60] block mb-1">Scenario Setting</span>
                <p className="text-sm text-[#5c543f] italic leading-relaxed">
                  &ldquo;{currentQuestion.scenario}&rdquo;
                </p>
              </div>

              {/* Core Question Text */}
              <h2 className="font-display text-lg md:text-2xl font-bold tracking-tight text-gray-950 mb-8 leading-tight">
                {currentQuestion.text}
              </h2>

              {/* Multiple Choice Options */}
              <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = responses[currentQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      id={`opt-${currentIndex}-${idx}`}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full min-h-[56px] text-left px-5 py-4 border rounded-2xl flex items-center justify-between gap-4 transition-all duration-200 outline-none cursor-pointer group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500 text-indigo-950 font-medium"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-gray-800"
                      }`}
                      style={{ contentVisibility: "auto" }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-semibold shrink-0 transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm leading-relaxed">{option.text}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300 group-hover:border-slate-400"
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-scale-up" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Navigation Footer */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-8 mt-10">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-5 py-3 border border-slate-200 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
              currentIndex === 0
                ? "opacity-40 cursor-not-allowed text-slate-400"
                : "text-slate-700 bg-white hover:bg-slate-50"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Quick instructions indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>Use Arrow Keys</span>
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-500">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-500">→</kbd>
            <span className="ml-1">or Number Keys</span>
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-500">1</kbd>
            <span>-</span>
            <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-500">4</kbd>
          </div>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!isCompleted}
              className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all font-display cursor-pointer ${
                isCompleted
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98] shadow-md shadow-emerald-600/10"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              Compile Results
              <ShieldCheck className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={responses[currentQuestion.id] === undefined}
              className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
                responses[currentQuestion.id] === undefined
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="mb-6 text-[10.5px] text-slate-500 bg-slate-50 border border-slate-200/40 rounded-2xl p-4 text-center leading-relaxed font-mono">
        Tri-Ad is an experimental self-reflection tool. It is not a clinical, educational, employment, financial, medical, or psychological diagnostic instrument.
      </div>

      {/* Progress Matrix Dots (Question quick navigator) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 font-mono">Question Navigation Matrix</h4>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = responses[q.id] !== undefined;
            const isActive = idx === currentIndex;
            
            return (
              <button
                key={q.id}
                onClick={() => {
                  setDirection(idx > currentIndex ? "right" : "left");
                  setCurrentIndex(idx);
                }}
                className={`h-10 rounded-lg text-xs font-mono font-medium flex items-center justify-center transition-all cursor-pointer border ${
                  isActive
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 font-bold"
                    : isAnswered
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100/50"
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                }`}
                title={`Question ${q.id}: ${isAnswered ? "Answered" : "Unanswered"}`}
              >
                {q.id}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-[10px] text-slate-400 font-mono justify-end">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-indigo-50 border border-indigo-200 rounded" />
            <span>Active Point</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-50 border border-emerald-200 rounded" />
            <span>Mapped</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-slate-50 border border-slate-200 rounded" />
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
