import React from "react";
import {
  Languages,
  Volume2,
  X,
  Check,
  Sparkles,
  Sliders,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";
import { SUPPORTED_LANGUAGES, Salutation } from "../types";
import { voiceService } from "../services/voiceService";

interface LanguageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSettingsModal: React.FC<LanguageSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, updateProfile } = useAasra();

  if (!isOpen) return null;

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.id === profile.preferredLanguageId) ||
    SUPPORTED_LANGUAGES[0];

  const handleTestVoice = (lang = currentLang) => {
    voiceService.speakBrowserTTS(
      lang.sampleGreeting,
      lang.bcp47,
      profile.speechSpeed
    );
  };

  const salutations: Salutation[] = [
    "Amma",
    "Nanna",
    "Aunty",
    "Uncle",
    "Dadi",
    "Dadu",
    "Grandmother",
    "Grandfather",
    "Custom",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-800">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Language & Voice Settings
              </h2>
              <p className="text-xs text-stone-600">
                భాష & స్వరం సెట్టింగులు / भाषा और आवाज़ सेटिंग्स
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preferred Language Grid */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              Preferred Conversation Language (భాష ఎంచుకోండి)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = profile.preferredLanguageId === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      updateProfile({ preferredLanguageId: lang.id });
                      handleTestVoice(lang);
                    }}
                    className={`p-3 rounded-2xl border text-left transition active:scale-95 flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-100 border-amber-500 ring-2 ring-amber-300 text-amber-950 font-bold"
                        : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">{lang.nativeName}</div>
                      <div className="text-xs text-stone-500">{lang.name}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Salutation Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              How should AASRA address you? (గౌరవ సంబోధన)
            </label>
            <div className="flex flex-wrap gap-2">
              {salutations.map((s) => (
                <button
                  key={s}
                  onClick={() => updateProfile({ salutation: s })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 border ${
                    profile.salutation === s
                      ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {profile.salutation === "Custom" && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Enter your preferred title or name (e.g. Rao Garu, Kamala Aunty)"
                  value={profile.customSalutation || ""}
                  onChange={(e) => updateProfile({ customSalutation: e.target.value })}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>
            )}
          </div>

          {/* Voice Personality & Speech Speed */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-700" />
                <span>Speech Speed (మాట్లాడే వేగం): {profile.speechSpeed.toFixed(1)}x</span>
              </span>
              <button
                onClick={() => handleTestVoice()}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Voice</span>
              </button>
            </div>

            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.1"
              value={profile.speechSpeed}
              onChange={(e) => updateProfile({ speechSpeed: parseFloat(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-500 font-semibold">
              <span>0.8x (Slower & Patient for elders)</span>
              <span>1.0x (Normal)</span>
              <span>1.2x (Faster)</span>
            </div>
          </div>

          {/* Automatic Language Detection Toggle */}
          <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                Automatic Language Detection
              </h4>
              <p className="text-xs text-stone-600">
                AASRA automatically detects whether you speak Telugu, Hindi, or English and replies accordingly.
              </p>
            </div>
            <button
              onClick={() => updateProfile({ autoDetectLanguage: !profile.autoDetectLanguage })}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                profile.autoDetectLanguage ? "bg-amber-600 justify-end" : "bg-stone-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>

          {/* Sample Spoken Phrase */}
          <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-900">Sample Phrase: </span>
              &ldquo;{currentLang.sampleGreeting}&rdquo;
            </div>
            <button
              onClick={() => handleTestVoice()}
              className="text-amber-800 font-bold hover:underline ml-2"
            >
              Play
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow transition"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
