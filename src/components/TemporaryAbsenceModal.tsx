import React, { useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  X,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";
import { voiceService } from "../services/voiceService";

interface TemporaryAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemporaryAbsenceModal: React.FC<TemporaryAbsenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, updateProfile, addChatMessage, sendDemoAlert } = useAasra();

  const [untilTime, setUntilTime] = useState("17:00");
  const [note, setNote] = useState("Visiting temple / neighbor");

  if (!isOpen) return null;

  const handleActivateAbsence = () => {
    updateProfile({
      temporaryAbsence: {
        active: true,
        untilTime,
        note,
      },
    });

    const voiceAck = `Sare ${profile.salutation}, recorded that you will be away until ${untilTime}. Routine check-ins are paused until you return. However, your emergency help and critical medication reminders will stay active. Safe travels!`;
    voiceService.speakBrowserTTS(
      voiceAck,
      profile.preferredLanguageId === "telugu" ? "te-IN" : "en-IN",
      profile.speechSpeed
    );

    addChatMessage({
      sender: "system",
      text: `🏖️ Temporary Absence Active: ${profile.elderName} is away until ${untilTime} ("${note}"). Routine check-ins paused. Medication reminders & SOS remain fully active.`,
    });

    sendDemoAlert(
      "routine_deviation",
      `Schedule notice: ${profile.elderName} scheduled away time until ${untilTime} (${note}).`,
      "primary"
    );

    onClose();
  };

  const handleClearAbsence = () => {
    updateProfile({
      temporaryAbsence: {
        active: false,
      },
    });

    const voiceAck = `Welcome back home ${profile.salutation}! Normal routine check-ins are resumed.`;
    voiceService.speakBrowserTTS(
      voiceAck,
      profile.preferredLanguageId === "telugu" ? "te-IN" : "en-IN",
      profile.speechSpeed
    );

    addChatMessage({
      sender: "system",
      text: `🏠 Elder is back home. Daily routine fingerprint resumed.`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Temporary Away Mode
              </h3>
              <p className="text-xs text-stone-500">
                &ldquo;I will be away until 5 PM&rdquo;
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {profile.temporaryAbsence.active ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300">
              <span className="text-xs font-bold uppercase text-amber-800">Currently Active</span>
              <p className="text-base font-bold text-stone-900 mt-1">
                Away until {profile.temporaryAbsence.untilTime}
              </p>
              <p className="text-xs text-stone-600 mt-0.5">
                Note: {profile.temporaryAbsence.note}
              </p>
            </div>

            <button
              onClick={handleClearAbsence}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition"
            >
              I Am Back Home (Resume Normal Check-ins)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                Expected Return Time
              </label>
              <input
                type="time"
                value={untilTime}
                onChange={(e) => setUntilTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                Activity / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Visiting temple, attending family lunch"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Safety note: Medication reminders & 112 emergency calls remain active during your scheduled away time.
              </span>
            </div>

            <button
              onClick={handleActivateAbsence}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl transition shadow"
            >
              Confirm Away Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
