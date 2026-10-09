import React, { useState } from "react";
import {
  Heart,
  Smile,
  Meh,
  Frown,
  HelpCircle,
  PhoneCall,
  Sparkles,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";
import { MoodType } from "../types";
import { voiceService } from "../services/voiceService";

interface MoodOption {
  type: MoodType;
  label: string;
  nativeLabel: string;
  icon: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    type: "feeling_good",
    label: "Feeling Good",
    nativeLabel: "చాలా బాగున్నాను",
    icon: "😊",
    color: "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300",
  },
  {
    type: "feeling_okay",
    label: "Feeling Okay",
    nativeLabel: "పర్వాలేదు",
    icon: "🙂",
    color: "bg-teal-100 hover:bg-teal-200 text-teal-900 border-teal-300",
  },
  {
    type: "feeling_lonely",
    label: "Feeling Lonely",
    nativeLabel: "ఒంటరిగా అనిపిస్తోంది",
    icon: "🥺",
    color: "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300",
  },
  {
    type: "feeling_worried",
    label: "Feeling Worried",
    nativeLabel: "ఆందోళనగా ఉంది",
    icon: "😟",
    color: "bg-orange-100 hover:bg-orange-200 text-orange-900 border-orange-300",
  },
  {
    type: "feeling_low",
    label: "Feeling Low",
    nativeLabel: "బాధగా ఉంది",
    icon: "😔",
    color: "bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300",
  },
  {
    type: "prefer_not_to_say",
    label: "Prefer Not to Say",
    nativeLabel: "చెప్పాలని లేదు",
    icon: "🤍",
    color: "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300",
  },
];

export const EmotionalWellbeing: React.FC = () => {
  const {
    profile,
    moodLogs,
    logMood,
    primaryContact,
    addChatMessage,
    sendDemoAlert,
  } = useAasra();

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [wellbeingNote, setWellbeingNote] = useState("");
  const [showCallOption, setShowCallOption] = useState(false);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);

  const handleSelectMood = (mood: MoodType) => {
    setSelectedMood(mood);
    logMood(mood, wellbeingNote);

    let spokenResponse = "";
    if (mood === "feeling_good") {
      spokenResponse = `Santhosham ${profile.salutation}! You are feeling good today. May this happiness continue throughout the day.`;
      setShowCallOption(false);
    } else if (mood === "feeling_lonely") {
      spokenResponse = `Ardham ayyindi ${profile.salutation}. Ee roju konchem ontariga anipistunda? I am here with you. Would you like to chat about your garden or favorite music? Or would you like to connect with ${primaryContact.name}?`;
      setShowCallOption(true);
    } else if (mood === "feeling_worried" || mood === "feeling_low") {
      spokenResponse = `Take a deep, gentle breath ${profile.salutation}. You are not alone. Tell me what is on your mind, I am listening with care.`;
      setShowCallOption(true);
    } else {
      spokenResponse = `Thank you for sharing, ${profile.salutation}. I am here anytime you wish to speak.`;
      setShowCallOption(false);
    }

    setSupportMessage(spokenResponse);
    voiceService.speakBrowserTTS(
      spokenResponse,
      profile.preferredLanguageId === "telugu" ? "te-IN" : "en-IN",
      profile.speechSpeed
    );

    addChatMessage({
      sender: "aasra",
      text: `❤️ Emotional Check-in: "${spokenResponse}"`,
    });
  };

  const handleRequestFamilyCall = () => {
    sendDemoAlert(
      "call_request",
      `Call request: ${profile.elderName} indicated feeling lonely or wishing to speak with family today.`,
      "primary"
    );

    const callAck = `${profile.salutation}, ${primaryContact.name} ki message pampinchanu. Veelaithe vallu meeku call chestharu.`;
    voiceService.speakBrowserTTS(callAck, "te-IN", profile.speechSpeed);

    addChatMessage({
      sender: "system",
      text: `📱 Call request dispatched to ${primaryContact.name} (${primaryContact.phone}).`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <Heart className="w-7 h-7 text-rose-600" />
          <span>Emotional Wellbeing & Daily Mood</span>
        </h2>
        <p className="text-stone-600 text-sm">
          A gentle space to check in on how your heart feels today. You are always heard.
        </p>
      </div>

      {/* Mood Selector Grid */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-stone-800 text-center">
          How are you feeling right now, {profile.salutation}?
        </h3>
        <p className="text-xs text-stone-500 text-center">
          ఈ రోజు మీ మనసు ఎలా ఉంది?
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => handleSelectMood(opt.type)}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition active:scale-95 cursor-pointer ${opt.color} ${
                selectedMood === opt.type ? "ring-4 ring-rose-300 scale-102" : ""
              }`}
            >
              <span className="text-3xl mb-1.5">{opt.icon}</span>
              <span className="font-bold text-sm">{opt.label}</span>
              <span className="text-xs opacity-80 mt-0.5">{opt.nativeLabel}</span>
            </button>
          ))}
        </div>

        {/* AASRA Empathetic Support Message Card */}
        {supportMessage && (
          <div className="mt-4 p-5 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-200 space-y-3 animate-fadeIn">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-stone-800 font-medium text-base">
                &ldquo;{supportMessage}&rdquo;
              </p>
            </div>

            {showCallOption && (
              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleRequestFamilyCall}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Send Call Request to {primaryContact.name.split(" ")[0]}</span>
                </button>
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition"
                >
                  Call Directly ({primaryContact.phone})
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mood History Trends */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span>Recent Wellbeing Check-ins</span>
          </h3>
          <span className="text-xs text-stone-500 font-medium">Last recorded check-ins</span>
        </div>

        <div className="space-y-2 pt-1">
          {moodLogs.slice(0, 5).map((log) => {
            const opt = MOOD_OPTIONS.find((o) => o.type === log.mood) || MOOD_OPTIONS[0];
            return (
              <div
                key={log.id}
                className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-sm border border-stone-200/70"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <span className="font-bold text-stone-800">{opt.label}</span>
                    {log.notes && (
                      <p className="text-xs text-stone-500 italic">{log.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-stone-500 font-medium">
                  <div>{log.date}</div>
                  <div>{log.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Responsible Safety Disclaimer */}
        <p className="text-xs text-stone-400 text-center pt-2 italic">
          Disclaimer: AASRA provides empathetic companionship, not medical or clinical psychological diagnosis. If you ever feel acute danger or despair, please call 112 or contact family.
        </p>
      </div>
    </div>
  );
};
