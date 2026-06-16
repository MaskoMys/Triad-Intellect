import { useState, useEffect } from "react";
import { Layers, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LandingPage from "./components/LandingPage";
import AssessmentWizard from "./components/AssessmentWizard";
import ResultsDashboard from "./components/ResultsDashboard";
import { AssessmentResult } from "./types";
import { questions } from "./questions";
import { 
  computeRawUserScores, 
  computeTraitBounds, 
  normalizeScores, 
  consolidateMacroScores, 
  generateProfileCode, 
  getArchetype 
} from "./utils";
import { 
  getHistoryFromStorage, 
  saveHistoryToStorage, 
  clearHistoryFromStorage 
} from "./lib/localStorage";

export default function App() {
  const [step, setStep] = useState<"landing" | "quiz" | "results">("landing");
  const [landingTab, setLandingTab] = useState<"assess" | "progress">("assess");
  const [userName, setUserName] = useState("");
  const [activeResult, setActiveResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  const handleLoadDemo = () => {
    const demoNormalized = { creativity: 84, innovation: 72, physical: 45, metaphysical: 78, discernment: 82, logical: 88, emotional: 60, predictive: 92 };
    const arch = getArchetype("CDL", demoNormalized);
    const demoResult: AssessmentResult = {
      id: "res-demo-v2",
      timestamp: new Date().toISOString(),
      userName: "Alexander Vance (Demo)",
      rawScores: { creativity: 84, innovation: 72, physical: 45, metaphysical: 78, discernment: 82, logical: 88, emotional: 60, predictive: 92 },
      normalizedScores: demoNormalized,
      macroScores: { imagination: 78, intuition: 68.3, judgment: 80 },
      profileCode: "CDL",
      archetype: arch
    };
    setActiveResult(demoResult);
    setUserName(demoResult.userName);
    setStep("results");
  };

  // Hydrate history from localStorage on startup
  useEffect(() => {
    const historicalRecords = getHistoryFromStorage();
    setHistory(historicalRecords);

    // Set real-time counter
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStartAssessment = (name: string) => {
    setUserName(name);
    setStep("quiz");
  };

  const handleCompleteAssessment = (responses: Record<number, number>) => {
    // 1. Calculate raw accumulations
    const rawScores = computeRawUserScores(questions, responses);

    // 2. Discover dynamic bounds programmatically
    const bounds = computeTraitBounds(questions);

    // 3. Compute normalized scale scores
    const normalizedScores = normalizeScores(rawScores, bounds);

    // 4. Consolidate macro dimensions
    const macroScores = consolidateMacroScores(normalizedScores);

    // 5. Generate three-letter profile code
    const profileCode = generateProfileCode(normalizedScores);

    // 6. Gather carrier archetype details
    const archetype = getArchetype(profileCode, normalizedScores);

    // 7. Store final assessment bundle
    const newResult: AssessmentResult = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userName: userName,
      rawScores,
      normalizedScores,
      macroScores,
      profileCode,
      archetype
    };

    const updatedHistory = [newResult, ...history];
    setHistory(updatedHistory);
    setActiveResult(newResult);
    setStep("results");

    saveHistoryToStorage(updatedHistory);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    saveHistoryToStorage(updated);
  };

  const handleSelectHistorical = (resultItem: AssessmentResult) => {
    setActiveResult(resultItem);
    setUserName(resultItem.userName);
    setStep("results");
  };

  const handleUpdateResult = (updatedResult: AssessmentResult) => {
    setActiveResult(updatedResult);
    const updatedHistory = history.map((item) => item.id === updatedResult.id ? updatedResult : item);
    setHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);
  };

  const handleClearAllHistory = () => {
    clearHistoryFromStorage();
    setHistory([]);
    setActiveResult(null);
    setLandingTab("assess");
    setStep("landing");
  };

  const handleRetake = () => {
    setStep("landing");
    setActiveResult(null);
  };

  const handleAbort = () => {
    setStep("landing");
    setUserName("");
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Prime Header navigation */}
      <header className="border-b border-slate-200/50 bg-[#faf8f5] sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <button 
            onClick={handleRetake} 
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-sm tracking-tight text-gray-950 block">TRI-AD</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase -mt-1 block">Cognitive Archetype Mapper</span>
            </div>
          </button>

          {/* Main Navigation links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-200/50 border border-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => {
                setStep("landing");
                setLandingTab("assess");
              }}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                step === "landing" && landingTab === "assess"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Assessment Terminal
            </button>
            <button
              onClick={() => {
                setStep("landing");
                setLandingTab("progress");
              }}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                step === "landing" && landingTab === "progress"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Saved Profiles & Dashboard
            </button>
            {activeResult && (
              <button
                onClick={() => setStep("results")}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  step === "results"
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Active Report
              </button>
            )}
            <button
              onClick={handleLoadDemo}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/40 focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center gap-1 font-display"
            >
              🔮 Explore Demo
            </button>
          </nav>

          {/* Clock Node & System Indicators */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200/40 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{currentTimeStr || "Syncing..."}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] hidden md:inline">Node Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main viewport Container */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-4"
            >
              <LandingPage 
                onStart={handleStartAssessment} 
                history={history}
                onSelectHistorical={handleSelectHistorical}
                onDeleteHistory={handleDeleteHistoryItem}
                onClearAllHistory={handleClearAllHistory}
                activeTab={landingTab}
                setActiveTab={setLandingTab}
                onLoadDemo={handleLoadDemo}
              />
            </motion.div>
          )}

          {step === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="py-4"
            >
              <AssessmentWizard 
                userName={userName}
                onComplete={handleCompleteAssessment} 
                onCancel={handleAbort} 
              />
            </motion.div>
          )}

          {step === "results" && activeResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <ResultsDashboard 
                result={activeResult}
                history={history}
                onRetake={handleRetake}
                onDeleteHistory={handleDeleteHistoryItem}
                onSelectHistorical={handleSelectHistorical}
                onUpdateResult={handleUpdateResult}
                onClearAllHistory={handleClearAllHistory}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Grounded minimalist Footer */}
      <footer className="border-t border-slate-200/50 bg-[#faf8f5] py-8 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span>&copy; 2026 Tri-Ad Inc.</span>
            <span>&bull;</span>
            <span>Version 2.4.0 (MVP V2)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-slate-700 font-display">Tri-Ad Cognitive Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
