import React, { useState } from "react";
import {
  CalendarCheck2,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  MessageCircleQuestion,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";
import { RoutineItem } from "../types";
import { voiceService } from "../services/voiceService";

export const RoutineFingerprint: React.FC = () => {
  const {
    profile,
    routines,
    confirmRoutine,
    explainRoutineDeviation,
    resetRoutinesForDay,
    addChatMessage,
    sendDemoAlert,
  } = useAasra();

  const [selectedRoutine, setSelectedRoutine] = useState<RoutineItem | null>(null);
  const [explanationInput, setExplanationInput] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [activeCheckInPrompt, setActiveCheckInPrompt] = useState<string | null>(null);

  /**
   * AASRA asks gentle why inquiry following the workflow:
   * LEARN -> DETECT -> ASK WHY -> UNDERSTAND -> VERIFY -> UPDATE -> CONNECT
   */
  const handleTriggerRoutineCheckIn = async (item: RoutineItem) => {
    setSelectedRoutine(item);
    setIsAskingAi(true);

    try {
      const res = await fetch("/api/routine-deviation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineItem: item,
          elderName: profile.elderName,
          salutation: profile.salutation === "Custom" ? (profile.customSalutation || "Amma") : profile.salutation,
          language: profile.preferredLanguageId === "telugu" ? "Telugu" : "English",
        }),
      });

      const data = await res.json();
      const question =
        data.checkInPrompt ||
        `${profile.salutation}, usually by this time you have ${item.title}. Did your routine change today, or would you like to do it now?`;

      setActiveCheckInPrompt(question);
      voiceService.speakBrowserTTS(
        question,
        profile.preferredLanguageId === "telugu" ? "te-IN" : "en-IN",
        profile.speechSpeed
      );

      addChatMessage({
        sender: "aasra",
        text: `🗓️ Routine Check-in: "${question}"`,
      });
    } catch (err) {
      console.warn("Failed routine deviation inquiry:", err);
      const fallback = `${profile.salutation}, just checking in on ${item.title}. Have you completed it or changed plans?`;
      setActiveCheckInPrompt(fallback);
      voiceService.speakBrowserTTS(fallback, "en-IN", profile.speechSpeed);
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleSaveExplanation = (reason: string) => {
    if (!selectedRoutine) return;
    explainRoutineDeviation(selectedRoutine.id, reason);

    const ack = `Ardham ayyindi ${profile.salutation}. I have recorded that: "${reason}". Take care!`;
    voiceService.speakBrowserTTS(ack, "te-IN", profile.speechSpeed);

    addChatMessage({
      sender: "aasra",
      text: `Noted routine update for ${selectedRoutine.title}: "${reason}". Baseline kept safe.`,
    });

    setSelectedRoutine(null);
    setActiveCheckInPrompt(null);
    setExplanationInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-amber-700" />
            <span>Personal Routine Fingerprint</span>
          </h2>
          <p className="text-stone-600 text-sm">
            Learns your daily rhythm gently. Detects deviations without alarm.
          </p>
        </div>

        <button
          onClick={resetRoutinesForDay}
          className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs border border-stone-200 transition"
          title="Reset routine states for testing new day"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Day</span>
        </button>
      </div>

      {/* Routine Workflow Graphic Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-400/10 to-amber-500/10 p-4 rounded-2xl border border-amber-200 flex items-center justify-between overflow-x-auto text-xs font-bold text-amber-900 gap-2">
        <span className="flex items-center gap-1">1. LEARN</span>
        <span>→</span>
        <span className="flex items-center gap-1">2. DETECT</span>
        <span>→</span>
        <span className="flex items-center gap-1 text-amber-800 underline">3. ASK WHY</span>
        <span>→</span>
        <span className="flex items-center gap-1">4. UNDERSTAND</span>
        <span>→</span>
        <span className="flex items-center gap-1">5. VERIFY</span>
        <span>→</span>
        <span className="flex items-center gap-1">6. UPDATE</span>
        <span>→</span>
        <span className="flex items-center gap-1">7. CONNECT</span>
      </div>

      {/* Interactive In-Flight AI Inquiry Card */}
      {activeCheckInPrompt && selectedRoutine && (
        <div className="p-6 bg-amber-50 border-2 border-amber-400 rounded-3xl shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-amber-700">
                AASRA Gentle Routine Check-in
              </span>
              <p className="text-lg font-bold text-stone-900 mt-1">
                &ldquo;{activeCheckInPrompt}&rdquo;
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                confirmRoutine(selectedRoutine.id, "Confirmed after gentle check-in");
                setActiveCheckInPrompt(null);
                setSelectedRoutine(null);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition"
            >
              ✓ Yes, I just finished it
            </button>

            <button
              onClick={() => handleSaveExplanation("Fasting today for prayer/puja")}
              className="px-3.5 py-2 bg-white hover:bg-amber-100 text-stone-800 font-medium text-xs rounded-xl border border-stone-200 transition"
            >
              Fasting today for puja
            </button>

            <button
              onClick={() => handleSaveExplanation("Woke up late, resting more")}
              className="px-3.5 py-2 bg-white hover:bg-amber-100 text-stone-800 font-medium text-xs rounded-xl border border-stone-200 transition"
            >
              Woke up late / resting
            </button>

            <button
              onClick={() => handleSaveExplanation("Outside with friends/neighbors")}
              className="px-3.5 py-2 bg-white hover:bg-amber-100 text-stone-800 font-medium text-xs rounded-xl border border-stone-200 transition"
            >
              Outside visiting neighbor
            </button>
          </div>

          {/* Custom explanation text field */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Or explain in your words: e.g. Doctor appointment today"
              value={explanationInput}
              onChange={(e) => setExplanationInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-stone-300 text-sm"
            />
            <button
              onClick={() => handleSaveExplanation(explanationInput || "Routine adjusted")}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition"
            >
              Save Reason
            </button>
          </div>
        </div>
      )}

      {/* Routine Activities Timeline */}
      <div className="space-y-3">
        {routines.map((routine) => {
          const isConfirmed = routine.status === "confirmed";
          const isExplained = routine.status === "explained";

          return (
            <div
              key={routine.id}
              className={`p-4 md:p-5 rounded-2xl border transition flex items-center justify-between flex-wrap gap-4 ${
                isConfirmed
                  ? "bg-white border-emerald-200 shadow-sm"
                  : isExplained
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-white border-stone-200 hover:border-amber-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    isConfirmed
                      ? "bg-emerald-100 text-emerald-800"
                      : isExplained
                      ? "bg-amber-100 text-amber-800"
                      : "bg-stone-100 text-stone-700"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900">{routine.title}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-600">
                      {routine.scheduledTime}
                    </span>
                  </div>

                  {isConfirmed && (
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed at {routine.confirmedAt}
                    </p>
                  )}

                  {isExplained && (
                    <p className="text-xs text-amber-800 font-medium mt-0.5">
                      Note: &ldquo;{routine.explanationNote}&rdquo;
                    </p>
                  )}

                  {!isConfirmed && !isExplained && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      Expected window: {routine.scheduledTime} ± 30 mins
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isConfirmed && (
                  <>
                    <button
                      onClick={() => handleTriggerRoutineCheckIn(routine)}
                      disabled={isAskingAi}
                      className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
                      title="Trigger empathetic routine check-in inquiry"
                    >
                      <MessageCircleQuestion className="w-4 h-4 text-amber-700" />
                      <span>Ask Follow-up</span>
                    </button>

                    <button
                      onClick={() => confirmRoutine(routine.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Done</span>
                    </button>
                  </>
                )}

                {isConfirmed && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
