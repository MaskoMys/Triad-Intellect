import { useState, useEffect } from "react";
import { Layers, Clock, X } from "lucide-react";
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
    const arch = getArchetype("CDL");
    const demoResult: AssessmentResult = {
      id: "res-demo-v2",
      timestamp: new Date().toISOString(),
      userName: "Alexander Vance (Demo)",
      rawScores: { creativity: 84, innovation: 72, physical: 45, metaphysical: 78, discernment: 82, logical: 88, emotional: 60, predictive: 92 },
      normalizedScores: { creativity: 84, innovation: 72, physical: 45, metaphysical: 78, discernment: 82, logical: 88, emotional: 60, predictive: 92 },
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
    const archetype = getArchetype(profileCode);

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

  const [initialPremiumOrder, setInitialPremiumOrder] = useState<{
    open: boolean;
    name: string;
    code: string;
    id: string;
  } | null>(null);

  const [orderEmail, setOrderEmail] = useState("");
  const [orderStatus, setOrderStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [orderError, setOrderError] = useState("");

  // Parse query params for premium order upgrade on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("order_premium") === "true") {
      const orderName = params.get("name") || "";
      const orderCode = params.get("code") || "";
      const orderId = params.get("id") || "";
      if (orderCode) {
        setInitialPremiumOrder({
          open: true,
          name: orderName,
          code: orderCode,
          id: orderId
        });
      }
    }
  }, []);

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

  const submitDirectPremiumOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderEmail || !orderEmail.includes("@")) {
      setOrderError("Please enter a valid email address.");
      return;
    }
    setOrderStatus("submitting");
    setOrderError("");

    // Try finding exact result in history
    let matchedResult = history.find(item => item.id === initialPremiumOrder?.id);
    if (!matchedResult && initialPremiumOrder) {
      // Create fallback item in memory
      const arch = getArchetype(initialPremiumOrder.code);
      matchedResult = {
        id: initialPremiumOrder.id,
        timestamp: new Date().toISOString(),
        userName: initialPremiumOrder.name,
        userEmail: orderEmail,
        rawScores: { creativity: 50, innovation: 50, physical: 50, metaphysical: 50, discernment: 50, logical: 50, emotional: 50, predictive: 50 },
        normalizedScores: { creativity: 50, innovation: 50, physical: 50, metaphysical: 50, discernment: 50, logical: 50, emotional: 50, predictive: 50 },
        macroScores: { imagination: 50, intuition: 50, judgment: 50 },
        profileCode: initialPremiumOrder.code,
        archetype: arch
      };
    }

    if (!matchedResult) {
      setOrderStatus("error");
      setOrderError("No cognitive archetype information could be parsed.");
      return;
    }

    try {
      const response = await fetch("/api/premium-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: orderEmail,
          name: matchedResult.userName,
          profileCode: matchedResult.profileCode,
          macroScores: matchedResult.macroScores,
          archetype: matchedResult.archetype,
          timestamp: matchedResult.timestamp,
          feedback: matchedResult.feedback
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setOrderStatus("success");
      } else {
        setOrderStatus("error");
        setOrderError(data.message || "Failed to submit order.");
      }
    } catch (err) {
      setOrderStatus("error");
      setOrderError("Network connection error. Failed to send order.");
    }
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

      {/* Direct Premium Order Modal Overlay via PDF deep-link */}
      {initialPremiumOrder?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => {
              setInitialPremiumOrder(null);
              // Clean up query parameters in URL
              window.history.pushState({}, document.title, window.location.pathname);
            }}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-yellow-600 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-lg">
                  ✦ Premium Exploratory Upgrade
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-2">
                  Premium Report Requisition
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Securely request an expanded 40-page blueprint document.
                </p>
              </div>
              <button
                onClick={() => {
                  setInitialPremiumOrder(null);
                  window.history.pushState({}, document.title, window.location.pathname);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Summary */}
            <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4 mb-5">
              <div className="text-xs text-indigo-700 font-semibold font-mono uppercase tracking-wider">
                Target Calibration Node
              </div>
              <div className="flex justify-between items-end mt-1.5">
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {initialPremiumOrder.name || "Identified Candidate"}
                  </div>
                  <div className="text-xs text-slate-500 italic font-mono mt-0.5">
                    Profile Coordinate: {initialPremiumOrder.code}
                  </div>
                </div>
                <div className="text-3xl font-black text-indigo-600 font-display">
                  {initialPremiumOrder.code}
                </div>
              </div>
            </div>

            {/* Order Form */}
            {orderStatus === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold">✓</span>
                </div>
                <h4 className="text-md font-bold text-slate-900">Premium Order Processed!</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Your request has been filed directly with <span className="font-semibold text-slate-700">the administrator</span>. The comprehensive dossier compilation package is underway.
                </p>
                <button
                  onClick={() => {
                    setInitialPremiumOrder(null);
                    window.history.pushState({}, document.title, window.location.pathname);
                  }}
                  className="mt-6 w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            ) : (
              <form onSubmit={submitDirectPremiumOrder} className="space-y-4">
                <div>
                  <label htmlFor="modal-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Delivery Email Address
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    placeholder="name@organization.com"
                    value={orderEmail}
                    onChange={(e) => {
                      setOrderEmail(e.target.value);
                      if (orderError) setOrderError("");
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white transition-all text-slate-900 font-medium"
                  />
                  {orderError && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{orderError}</p>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">
                  ✦ <strong>Requisition Details:</strong> Complex blueprint reporting requires offline assembly. Submission sends an electronic notification to the <strong>system administrator</strong> who manually validates and dispatches your expanded 40-page blueprint PDF.
                </p>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInitialPremiumOrder(null);
                      window.history.pushState({}, document.title, window.location.pathname);
                    }}
                    className="flex-1 py-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={orderStatus === "submitting"}
                    className="flex-1 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {orderStatus === "submitting" ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place Premium Order"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

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
