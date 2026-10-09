import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  HeartPulse,
  Coffee,
  CheckCircle2,
  PhoneCall,
  Search,
  BookOpen,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";
import { voiceService } from "../services/voiceService";

interface RemedyCard {
  title: string;
  category: string;
  indication: string;
  description: string;
  safePrecautions: string;
}

const CURATED_REMEDIES: RemedyCard[] = [
  {
    title: "Ginger & Tulsi Warm Infusion",
    category: "Throat & Mild Cold",
    indication: "Scratchy throat, mild cold, damp morning chills",
    description: "Boil 4-5 fresh tulsi leaves and a thin slice of crushed ginger in warm water for 5 minutes. Drink warm with a drop of honey.",
    safePrecautions: "Avoid excessive pepper if prone to acid reflux. Consult doctor if fever exceeds 100°F.",
  },
  {
    title: "Warm Golden Haldi (Turmeric) Milk",
    category: "Rest & Sleep Comfort",
    indication: "Restless sleep, mild evening body fatigue",
    description: "Half cup warm low-fat milk with a pinch of pure turmeric and ground green cardamom taken 30 minutes before bed.",
    safePrecautions: "Ensure lactose tolerance; keep spices light.",
  },
  {
    title: "Gentle Ankle & Knee Rotations",
    category: "Morning Mobility",
    indication: "Morning stiffness, prolonged sitting",
    description: "Sitting comfortably in an armchair, slowly flex and rotate ankles 10 times in each direction, followed by gentle knee extensions.",
    safePrecautions: "Never push into sharp pain. Stop immediately if feeling dizzy.",
  },
  {
    title: "Electrolyte Hydration (Cumin-Lemon Water)",
    category: "Afternoon Vitality",
    indication: "Feeling sluggish, afternoon dehydration",
    description: "Warm water infused with roasted cumin seeds and a squeeze of fresh lemon to restore gentle hydration.",
    safePrecautions: "If on fluid restriction for cardiac or renal care, follow your doctor's strict prescribed limit.",
  },
];

export const WellnessRemedies: React.FC = () => {
  const { profile, setEmergencyActive } = useAasra();

  const [searchQuery, setSearchQuery] = useState("");
  const [aiAdvice, setAiAdvice] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleAskWellness = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsQuerying(true);
    setAiAdvice(null);

    try {
      const res = await fetch("/api/wellness-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          language: profile.preferredLanguageId === "telugu" ? "Telugu" : "English",
          salutation: profile.salutation === "Custom" ? (profile.customSalutation || "Amma") : profile.salutation,
        }),
      });

      const data = await res.json();
      setAiAdvice(data);

      if (data.isRedFlag) {
        // Red flag detected! Trigger emergency assistance
        voiceService.speakBrowserTTS(
          `${profile.salutation}, please pay attention: this may be urgent. Do not wait for home remedies. Please contact a doctor or call 112 immediately.`,
          "en-IN",
          profile.speechSpeed
        );
      } else {
        voiceService.speakBrowserTTS(
          data.advice,
          profile.preferredLanguageId === "telugu" ? "te-IN" : "en-IN",
          profile.speechSpeed
        );
      }
    } catch (err) {
      console.error("Wellness query failed:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-amber-700" />
          <span>Safe Home Remedies & Gentle Wellness</span>
        </h2>
        <p className="text-stone-600 text-sm">
          Evidence-aware comfort suggestions, hydration, and safe traditional practices.
        </p>
      </div>

      {/* Interactive AI Wellness Query Box */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-800">
          Ask AASRA about general comfort or mild everyday symptoms:
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskWellness(searchQuery);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="e.g. Mild scratchy throat, heavy legs after walking, herbal tea ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 text-sm text-stone-800 focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={isQuerying}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-95 text-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isQuerying ? "Checking..." : "Ask AASRA"}</span>
          </button>
        </form>

        {/* Quick test prompt chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-stone-500">Quick inquiries:</span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("Throat is scratchy and coughing slightly");
              handleAskWellness("Throat is scratchy and coughing slightly");
            }}
            className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-full border border-amber-200"
          >
            Scratchy throat
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("Stiff knees when waking up in morning");
              handleAskWellness("Stiff knees when waking up in morning");
            }}
            className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-full border border-amber-200"
          >
            Stiff knees in morning
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("Sudden severe chest tightness and left arm pain");
              handleAskWellness("Sudden severe chest tightness and left arm pain");
            }}
            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-900 font-bold rounded-full border border-red-200"
          >
            Test Red-Flag Guardrail (Chest tightness)
          </button>
        </div>

        {/* AI Result Card */}
        {aiAdvice && (
          <div
            className={`p-5 rounded-2xl border ${
              aiAdvice.isRedFlag
                ? "bg-red-50 border-red-400 text-red-900"
                : "bg-amber-50/70 border-amber-300 text-stone-800"
            } space-y-3 animate-fadeIn`}
          >
            {aiAdvice.isRedFlag ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-black text-red-800 text-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 animate-bounce" />
                  <span>URGENT MEDICAL RED-FLAG WARNING</span>
                </div>
                <p className="font-semibold text-red-800">
                  {aiAdvice.advice}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setEmergencyActive(true)}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-md text-sm flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Open Emergency Call (112)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Sparkles className="w-5 h-5 text-amber-700" />
                  <span>AASRA Wellness Recommendation</span>
                </div>
                <p className="text-stone-800 font-medium leading-relaxed">
                  {aiAdvice.advice}
                </p>
                {aiAdvice.suggestedRemedies && aiAdvice.suggestedRemedies.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-stone-700 space-y-1 pt-1">
                    {aiAdvice.suggestedRemedies.map((rem: string, idx: number) => (
                      <li key={idx}>{rem}</li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-stone-500 italic pt-2 border-t border-amber-200">
                  {aiAdvice.disclaimer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Curated Remedies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CURATED_REMEDIES.map((remedy, idx) => (
          <div
            key={idx}
            className="p-5 bg-white rounded-3xl border border-stone-200/90 shadow-sm space-y-3 hover:border-amber-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                {remedy.category}
              </span>
              <Coffee className="w-5 h-5 text-amber-600" />
            </div>

            <h3 className="text-lg font-bold text-stone-900">{remedy.title}</h3>
            <p className="text-xs font-semibold text-stone-500">
              Ideal for: {remedy.indication}
            </p>
            <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-100">
              {remedy.description}
            </p>
            <p className="text-xs text-rose-700 italic">
              <strong>Precaution:</strong> {remedy.safePrecautions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
