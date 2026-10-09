import React from "react";
import {
  Mic,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";

interface EmergencyListeningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyListeningModal: React.FC<EmergencyListeningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, updateProfile } = useAasra();

  if (!isOpen) return null;

  const handleToggleConsent = () => {
    updateProfile({
      emergencyListeningConsent: !profile.emergencyListeningConsent,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Emergency Voice Recognition Settings
              </h3>
              <p className="text-xs text-stone-500">
                Mode A (Active Voice) & Mode B (Standby Listening)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode A Explanation */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Mode A: Active Voice Companion (Enabled)</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Whenever you speak to AASRA during any conversation session, emergency distress phrases (such as &ldquo;Help me&rdquo;, &ldquo;నాకు సహాయం కావాలి&rdquo;, &ldquo;నేను పడిపోయాను&rdquo;, &ldquo;मुझे मदद चाहिए&rdquo;) are automatically monitored to trigger urgent assistance.
          </p>
        </div>

        {/* Mode B Explanation with Consent */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Mode B: Continuous Standby Listening</span>
            </div>
            <button
              onClick={handleToggleConsent}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                profile.emergencyListeningConsent ? "bg-emerald-600 justify-end" : "bg-stone-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed">
            Requires your explicit consent. Keeps microphone listening for fall or distress keywords while this browser tab stays open. Audio is processed on-device and discarded immediately.
          </p>

          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-300 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Honest Limitation Notice:</strong> Web browsers cannot access the microphone if the device is turned off, browser tab is closed, or device goes to deep sleep. For uninterrupted 24/7 fall safety, keep this screen on or use wearable hardware.
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
