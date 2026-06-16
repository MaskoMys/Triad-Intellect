import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

interface PremiumOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  profileCode: string;
  macroScores: {
    imagination: number;
    intuition: number;
    judgment: number;
  };
  initialEmail?: string;
  onSuccess?: (email: string) => void;
  initialFeedback?: {
    mostTrue: string;
    mostWrong: string;
  };
}

export default function PremiumOrderModal({
  isOpen,
  onClose,
  userName: initialUserName,
  profileCode,
  macroScores,
  initialEmail = "",
  onSuccess,
  initialFeedback
}: PremiumOrderModalProps) {
  const [name, setName] = useState(initialUserName);
  const [email, setEmail] = useState(initialEmail);
  const [inviteCode, setInviteCode] = useState("");
  const [mostTrue, setMostTrue] = useState(initialFeedback?.mostTrue || "");
  const [mostWrong, setMostWrong] = useState(initialFeedback?.mostWrong || "");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const turnstileSiteKey = (((import.meta as any).env)?.VITE_TURNSTILE_SITE_KEY || "") as string;

  // Accessibility: Focus movement
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      timer = setTimeout(() => {
        const firstInput = document.getElementById("premium-name");
        if (firstInput) {
          firstInput.focus();
        }
      }, 50);
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isOpen]);

  // Accessibility: Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Turnstile dynamic loading
  useEffect(() => {
    if (!turnstileSiteKey || !isOpen) return;

    const loadRef = { current: true };

    const loadTurnstile = () => {
      if (!loadRef.current) return;
      const containerObj = turnstileContainerRef.current;
      if ((window as any).turnstile && containerObj && !turnstileWidgetId.current) {
        try {
          turnstileWidgetId.current = (window as any).turnstile.render(containerObj, {
            sitekey: turnstileSiteKey,
            callback: (token: string) => {
              setTurnstileToken(token);
              setError("");
            },
            "expired-callback": () => {
              setTurnstileToken("");
            },
            "error-callback": () => {
              setTurnstileToken("");
            }
          });
        } catch (e) {
          console.error("Turnstile render error:", e);
        }
      }
    };

    if (!(window as any).turnstile) {
      const existingScript = document.getElementById("cloudflare-turnstile-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "cloudflare-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
        script.async = true;
        script.defer = true;
        (window as any).onloadTurnstileCallback = () => {
          loadTurnstile();
        };
        document.body.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if ((window as any).turnstile) {
            clearInterval(interval);
            loadTurnstile();
          }
        }, 100);
        return () => {
          loadRef.current = false;
          clearInterval(interval);
        };
      }
    } else {
      const timeout = setTimeout(() => {
        loadTurnstile();
      }, 50);
      return () => clearTimeout(timeout);
    }

    return () => {
      loadRef.current = false;
      if (turnstileWidgetId.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(turnstileWidgetId.current);
        } catch (e) {}
        turnstileWidgetId.current = null;
      }
      setTurnstileToken("");
    };
  }, [turnstileSiteKey, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!inviteCode.trim()) {
      setError("Please enter your beta invite designator code.");
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the security Turnstile verification.");
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/premium-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          profileCode,
          macroScores,
          inviteCode,
          turnstileToken: turnstileToken || undefined,
          feedback: {
            mostTrue: mostTrue.trim() || undefined,
            mostWrong: mostWrong.trim() || undefined
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        if (onSuccess) {
          onSuccess(email);
        }
      } else {
        setStatus("error");
        setError("Unable to submit this request. Please check your invite code and try again.");
      }
    } catch (err) {
      setStatus("error");
      setError("Unable to submit this request. Please check your invite code and try again.");
    }
  }

  const handleInputChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    if (error) {
      setError("");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-order-title"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative z-10 my-8 overflow-hidden text-left"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-yellow-600 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-lg">
              ✦ Premium Exploratory Upgrade
            </span>
            <h3 id="premium-order-title" className="font-display text-xl font-bold text-slate-900 mt-2">
              Request Premium Dossier
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Securely request an expanded 40-page blueprint document.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close premium order modal"
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info Summary */}
        <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4 mb-5">
          <div className="text-xs text-indigo-700 font-semibold font-mono uppercase tracking-wider">
            Target Node Designation
          </div>
          <div className="flex justify-between items-end mt-1">
            <div className="min-w-0">
              <div className="text-md font-bold text-slate-900 truncate">{name || "Identified Candidate"}</div>
              <div className="text-xs text-slate-500 italic font-mono mt-0.5">Profile Coordinate: {profileCode}</div>
            </div>
            <div className="text-2xl font-black text-indigo-600 font-display shrink-0">{profileCode}</div>
          </div>
        </div>

        {/* Form Body */}
        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold">✓</span>
            </div>
            <h4 className="text-md font-bold text-slate-900">Premium Order Lodged!</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Requisition compiled and dispatched directly to the <span className="font-semibold text-slate-700">system administrator</span>. Delivery is scheduled shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="premium-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Full Name
              </label>
              <input
                id="premium-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Enter full name"
                value={name}
                onChange={(e) => handleInputChange(setName, e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium transition-all"
              />
            </div>

            <div>
              <label htmlFor="premium-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Delivery Email Address
              </label>
              <input
                id="premium-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium transition-all"
              />
            </div>

            <div>
              <label htmlFor="premium-invite-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Beta invitation code
              </label>
              <input
                id="premium-invite-code"
                name="inviteCode"
                type="text"
                autoComplete="off"
                required
                placeholder="Enter beta access key (e.g. BETA30)"
                value={inviteCode}
                onChange={(e) => handleInputChange(setInviteCode, e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium transition-all"
              />
            </div>

            {/* Optional Feedback Fields */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                Optional Calibrator Feedback
              </span>
              <div>
                <label htmlFor="premium-feedback-true" className="block text-[11px] font-medium text-slate-600 mb-1 leading-tight">
                  What parts of the {profileCode} profile felt exceptionally accurate?
                </label>
                <textarea
                  id="premium-feedback-true"
                  rows={2}
                  value={mostTrue}
                  onChange={(e) => handleInputChange(setMostTrue, e.target.value)}
                  placeholder="e.g. The risk parameters and visual description"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium transition-all resize-none"
                />
              </div>

              <div>
                <label htmlFor="premium-feedback-wrong" className="block text-[11px] font-medium text-slate-600 mb-1 leading-tight">
                  What components felt inaccurate or off?
                </label>
                <textarea
                  id="premium-feedback-wrong"
                  rows={2}
                  value={mostWrong}
                  onChange={(e) => handleInputChange(setMostWrong, e.target.value)}
                  placeholder="e.g. The correlation weightings on judgment details"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium transition-all resize-none"
                />
              </div>
            </div>

            {turnstileSiteKey && (
              <div className="pt-1.5">
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Security Verification
                </span>
                <div 
                  ref={turnstileContainerRef} 
                  className="cf-turnstile-wrapper bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-center min-h-[65px]"
                />
              </div>
            )}

            {error && (
              <p className="text-[11px] text-red-600 font-medium mt-1 leading-relaxed">
                {error}
              </p>
            )}

            <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">
              ✦ <strong>Requisition Details:</strong> Complex blueprint reporting requires offline assembly. Submission sends an electronic notification to the <strong>system administrator</strong> who manually validates and dispatches your expanded 40-page blueprint PDF.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="flex-1 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {status === "submitting" ? (
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
  );
}
