import { ShieldAlert, Database } from "lucide-react";

export default function DisclaimerSection() {
  return (
    <div className="space-y-2.5">
      {/* Disclaimer Block */}
      <div className="text-[10.5px] text-slate-500 bg-slate-50 border border-slate-200/50 rounded-xl p-3 flex gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug text-left">
          <strong>Experimental Protocol:</strong> Tri-Ad is an experimental self-reflection tool. It is not a clinical, educational, employment, financial, medical, or psychological diagnostic instrument.
        </p>
      </div>

      {/* Privacy Notice Block */}
      <div className="text-[10.5px] text-slate-500 bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-3 flex flex-col gap-1.5 text-left">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span>Local Storage &amp; Privacy Notice</span>
        </div>
        <p className="leading-relaxed">
          To maintain full offline sovereignty and save your historical results across browser sessions, assessment metrics are saved directly in this browser's <strong className="text-slate-700">unencrypted local storage</strong>.
        </p>
        <p className="leading-relaxed border-t border-indigo-100/30 pt-1.5 mt-0.5">
          Your email address is <span className="font-semibold text-slate-700">not unnecessarily persisted</span> in browser storage. Optional beta feedback responses are processed and cached locally on your device, and are only transmitted to the system operator if you choose to submit a premium report requisition, helping to refine our mathematical cognitive models.
        </p>
      </div>
    </div>
  );
}
