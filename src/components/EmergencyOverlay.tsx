import React, { useState } from "react";
import {
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  X,
  Send,
  HeartPulse,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";

interface EmergencyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyOverlay: React.FC<EmergencyOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    profile,
    primaryContact,
    secondaryContact,
    sendDemoAlert,
    addChatMessage,
  } = useAasra();

  const [alertSent, setAlertSent] = useState(false);
  const [callAttempted, setCallAttempted] = useState(false);

  if (!isOpen) return null;

  const handleCall112 = () => {
    setCallAttempted(true);
    sendDemoAlert("emergency", `Emergency 112 dialer opened by ${profile.elderName}`, "services");
    addChatMessage({
      sender: "system",
      text: "🚨 Emergency Services Helpline 112 was dialed.",
    });
    // Open system tel link
    window.location.href = "tel:112";
  };

  const handleAlertFamilyNow = () => {
    setAlertSent(true);
    const msg = `🚨 EMERGENCY ALERT from AASRA: ${profile.elderName} reported acute distress or pressed the Emergency Assistance button. Please call them immediately or check in. Address on file.`;
    sendDemoAlert("emergency", msg, "both");
    addChatMessage({
      sender: "system",
      text: `🚨 Urgent SOS alert dispatched to primary contact ${primaryContact.name} (${primaryContact.phone}) and family.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border-4 border-red-500 shadow-2xl overflow-hidden flex flex-col">
        {/* Header Banner */}
        <div className="bg-red-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">EMERGENCY ASSISTANCE</h2>
              <p className="text-red-100 text-sm font-medium">
                అత్యవసర సహాయం / आपातकालीन सहायता
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            aria-label="Close emergency dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Calm reassurance message */}
        <div className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-xl font-bold text-red-900 mb-1">
              {profile.salutation}, stay calm. Help is right here.
            </p>
            <p className="text-red-700 text-sm">
              If you have fallen or cannot breathe, press the big red button below to call 112 emergency services.
            </p>
          </div>

          {/* Primary Action 1: Call 112 Directly */}
          <div className="space-y-3">
            <button
              onClick={handleCall112}
              className="w-full py-5 px-6 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-2xl rounded-2xl shadow-lg flex items-center justify-center gap-4 transition group ring-4 ring-red-300"
            >
              <PhoneCall className="w-8 h-8 group-hover:animate-bounce" />
              <span>CALL 112 (AMBULANCE / POLICE)</span>
            </button>
            <p className="text-center text-xs text-stone-500 font-medium">
              National Emergency Number (Free 24/7 Helpline across India)
            </p>
          </div>

          {/* Action 2: Alert Family Contacts */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Trusted Family Contacts
              </span>
              <span className="text-xs text-stone-600 font-semibold">
                {primaryContact.name} ({primaryContact.phone})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${primaryContact.phone.replace(/\s+/g, "")}`}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm text-center transition"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call {primaryContact.name.split(" ")[0]}</span>
              </a>

              <button
                onClick={handleAlertFamilyNow}
                disabled={alertSent}
                className={`py-3 px-4 font-bold rounded-xl flex items-center justify-center gap-2 border transition ${
                  alertSent
                    ? "bg-stone-200 text-stone-600 border-stone-300"
                    : "bg-white hover:bg-stone-100 text-stone-800 border-stone-300 shadow-sm"
                }`}
              >
                {alertSent ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Family Alerted!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 text-red-600" />
                    <span>Send SOS Alert SMS</span>
                  </>
                )}
              </button>
            </div>

            {alertSent && (
              <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                ✓ SOS message and location details dispatched to {primaryContact.name} and {secondaryContact.name}.
              </p>
            )}
          </div>

          {/* Bottom dismissal / Safe reassurance */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold text-sm hover:underline"
            >
              I am okay (Dismiss / False Alarm)
            </button>
            <span className="text-xs text-stone-400">
              AASRA Safety Protocol
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
