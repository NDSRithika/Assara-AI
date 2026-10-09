/**
 * AASRA AI — Personal AI Care Ecosystem for Elderly Wellbeing
 * Tagline: Learn. Understand. Care. Connect.
 */

import React, { useState } from "react";
import {
  Heart,
  Mic,
  Pill,
  CalendarCheck2,
  BookOpen,
  Brain,
  Users,
  AlertTriangle,
  Languages,
  Shield,
  PhoneCall,
  Volume2,
  Type,
  Sun,
  Moon,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import { AasraProvider, useAasra } from "./context/AasraContext";
import { VoiceCompanionOrb } from "./components/VoiceCompanionOrb";
import { MedicationManager } from "./components/MedicationManager";
import { RoutineFingerprint } from "./components/RoutineFingerprint";
import { EmotionalWellbeing } from "./components/EmotionalWellbeing";
import { WellnessRemedies } from "./components/WellnessRemedies";
import { MemoryManager } from "./components/MemoryManager";
import { CaregiverDashboard } from "./components/CaregiverDashboard";
import { EmergencyOverlay } from "./components/EmergencyOverlay";
import { LanguageSettingsModal } from "./components/LanguageSettingsModal";
import { TypeChatModal } from "./components/TypeChatModal";
import { TemporaryAbsenceModal } from "./components/TemporaryAbsenceModal";
import { EmergencyListeningModal } from "./components/EmergencyListeningModal";
import { SUPPORTED_LANGUAGES } from "./types";

type ActiveTab = "voice" | "medications" | "routine" | "wellbeing" | "remedies" | "memories";

const MainAppContent: React.FC = () => {
  const {
    profile,
    updateProfile,
    activeRole,
    setActiveRole,
    emergencyActive,
    setEmergencyActive,
  } = useAasra();

  const [activeTab, setActiveTab] = useState<ActiveTab>("voice");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showEmergencyListeningModal, setShowEmergencyListeningModal] = useState(false);

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.id === profile.preferredLanguageId) ||
    SUPPORTED_LANGUAGES[0];

  const getFontSizeClass = () => {
    if (profile.fontSize === "xl") return "text-lg";
    if (profile.fontSize === "large") return "text-base";
    return "text-sm";
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        profile.highContrast
          ? "bg-stone-900 text-stone-100 font-sans"
          : "bg-amber-50/40 text-stone-900 font-sans"
      } ${getFontSizeClass()}`}
    >
      {/* 1. TOP ANNOUNCEMENT & ACCESSIBILITY BAR */}
      <div className="bg-amber-900 text-amber-100 px-4 py-2 text-xs flex items-center justify-between flex-wrap gap-2 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AASRA AI CARE ECOSYSTEM</span>
          </span>
          <span className="hidden sm:inline text-amber-300/80">|</span>
          <span className="hidden sm:inline text-amber-200">
            Learn. Understand. Care. Connect.
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Away Mode indicator */}
          {profile.temporaryAbsence.active ? (
            <button
              onClick={() => setShowAbsenceModal(true)}
              className="text-amber-300 hover:text-white underline font-semibold flex items-center gap-1"
            >
              <span>Away until {profile.temporaryAbsence.untilTime}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAbsenceModal(true)}
              className="text-amber-200 hover:text-white hover:underline flex items-center gap-1"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Schedule Away Time</span>
            </button>
          )}

          {/* Emergency Listening Consent */}
          <button
            onClick={() => setShowEmergencyListeningModal(true)}
            className="text-amber-200 hover:text-white hover:underline flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Safety Modes</span>
          </button>

          {/* Font Size Toggle */}
          <div className="flex items-center gap-1 bg-amber-950/70 px-2 py-0.5 rounded-lg border border-amber-800">
            <span className="text-[10px] text-amber-300">Text:</span>
            <button
              onClick={() => updateProfile({ fontSize: "normal" })}
              className={`px-1.5 py-0.2 rounded text-[11px] ${
                profile.fontSize === "normal" ? "bg-amber-600 text-white font-bold" : "text-amber-200"
              }`}
            >
              A
            </button>
            <button
              onClick={() => updateProfile({ fontSize: "large" })}
              className={`px-1.5 py-0.2 rounded text-[12px] ${
                profile.fontSize === "large" ? "bg-amber-600 text-white font-bold" : "text-amber-200"
              }`}
            >
              A+
            </button>
            <button
              onClick={() => updateProfile({ fontSize: "xl" })}
              className={`px-1.5 py-0.2 rounded text-[13px] ${
                profile.fontSize === "xl" ? "bg-amber-600 text-white font-bold" : "text-amber-200"
              }`}
            >
              A++
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => updateProfile({ highContrast: !profile.highContrast })}
            className="p-1 rounded text-amber-200 hover:text-white"
            title="Toggle High Contrast"
          >
            {profile.highContrast ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header
        className={`px-4 md:px-8 py-4 border-b transition ${
          profile.highContrast
            ? "bg-stone-900 border-stone-800"
            : "bg-white/90 backdrop-blur-md border-amber-200/80 shadow-xs"
        } sticky top-0 z-30`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-amber-950">
                  AASRA AI
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  ఆసరా / आसरा
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-500">
                Personal AI Family Companion & Safety Assistant
              </p>
            </div>
          </div>

          {/* Middle: Elder Salutation Greeting */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 rounded-2xl border border-amber-200 text-stone-800 text-xs font-medium">
            <span>Caring for:</span>
            <strong className="text-amber-900 font-bold">
              {profile.elderName} ({profile.salutation})
            </strong>
            <button
              onClick={() => setShowLanguageModal(true)}
              className="ml-2 text-amber-700 hover:underline font-bold flex items-center gap-1"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{activeLang.nativeName}</span>
            </button>
          </div>

          {/* Right Action Controls: Role Switcher & Emergency SOS */}
          <div className="flex items-center gap-3">
            {/* Elder Mode vs Family Portal Switcher */}
            <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold">
              <button
                onClick={() => setActiveRole("elder")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeRole === "elder"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Elder Mode
              </button>
              <button
                onClick={() => setActiveRole("caregiver")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeRole === "caregiver"
                    ? "bg-amber-800 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Family Portal
              </button>
            </div>

            {/* Prominent Emergency Button */}
            <button
              onClick={() => setEmergencyActive(true)}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-md flex items-center gap-2 ring-2 ring-red-300 transition"
              title="Open Emergency Call & SOS Assistance"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>SOS 112</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. NAVIGATION TABS (Elder Mode) */}
      {activeRole === "elder" && (
        <nav className="bg-amber-100/50 border-b border-amber-200/80 px-4">
          <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
            <button
              onClick={() => setActiveTab("voice")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition active:scale-95 ${
                activeTab === "voice"
                  ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400"
                  : "bg-white/80 text-stone-700 hover:bg-white border border-stone-200"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Voice Companion (AASRA)</span>
            </button>

            <button
              onClick={() => setActiveTab("medications")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition active:scale-95 ${
                activeTab === "medications"
                  ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400"
                  : "bg-white/80 text-stone-700 hover:bg-white border border-stone-200"
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Medication Reminders</span>
            </button>

            <button
              onClick={() => setActiveTab("routine")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition active:scale-95 ${
                activeTab === "routine"
                  ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400"
                  : "bg-white/80 text-stone-700 hover:bg-white border border-stone-200"
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Routine Fingerprint</span>
            </button>

            <button
              onClick={() => setActiveTab("wellbeing")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition active:scale-95 ${
                activeTab === "wellbeing"
                  ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400"
                  : "bg-white/80 text-stone-700 hover:bg-white border border-stone-200"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Emotional Wellbeing</span>
            </button>

            <button
              onClick={() => setActiveTab("remedies")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition active:scale-95 ${
                activeTab === "remedies"
                  ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400"
                  : "bg-white/80 text-stone-700 hover:bg-white border border-stone-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Safe Home Remedies</span>
            </button>

            <button
              onClick={() => setActiveTab("memories")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition active:scale-95 ${
                activeTab === "memories"
                  ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400"
                  : "bg-white/80 text-stone-700 hover:bg-white border border-stone-200"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Memories & Privacy</span>
            </button>
          </div>
        </nav>
      )}

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        {activeRole === "caregiver" ? (
          <CaregiverDashboard />
        ) : (
          <>
            {activeTab === "voice" && (
              <div className="space-y-8">
                {/* Voice Companion Centerpiece */}
                <VoiceCompanionOrb
                  onOpenLanguageSettings={() => setShowLanguageModal(true)}
                  onOpenEmergencyModal={() => setEmergencyActive(true)}
                  onOpenTypeModal={() => setShowTypeModal(true)}
                />

                {/* Quick Cards Grid below Voice Orb */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Daily Rhythm Overview */}
                  <div
                    onClick={() => setActiveTab("routine")}
                    className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm hover:border-amber-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                          Daily Rhythm
                        </span>
                        <CalendarCheck2 className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-bold text-stone-900">Routine Fingerprint</h3>
                      <p className="text-xs text-stone-600 mt-1">
                        Detects changes gently and asks why with deep patience.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 mt-4 flex items-center gap-1">
                      View Daily Timeline →
                    </span>
                  </div>

                  {/* Medication Status */}
                  <div
                    onClick={() => setActiveTab("medications")}
                    className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm hover:border-amber-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Safe Reminders
                        </span>
                        <Pill className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-bold text-stone-900">Prescriptions & Doses</h3>
                      <p className="text-xs text-stone-600 mt-1">
                        Clear speech announcements with 3 accessible response buttons.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
                      Check Medications →
                    </span>
                  </div>

                  {/* Emotional Comfort */}
                  <div
                    onClick={() => setActiveTab("wellbeing")}
                    className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm hover:border-rose-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                          Emotional Care
                        </span>
                        <Heart className="w-5 h-5 text-rose-600" />
                      </div>
                      <h3 className="text-lg font-bold text-stone-900">Daily Heart Check-in</h3>
                      <p className="text-xs text-stone-600 mt-1">
                        Feeling lonely or worried? AASRA listens and stays with you.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-rose-700 mt-4 flex items-center gap-1">
                      Share Today&apos;s Feeling →
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "medications" && <MedicationManager />}
            {activeTab === "routine" && <RoutineFingerprint />}
            {activeTab === "wellbeing" && <EmotionalWellbeing />}
            {activeTab === "remedies" && <WellnessRemedies />}
            {activeTab === "memories" && <MemoryManager />}
          </>
        )}
      </main>

      {/* 5. FOOTER */}
      <footer className="mt-auto border-t border-amber-200/70 bg-white/70 py-6 px-4 text-center text-xs text-stone-500 space-y-2">
        <p className="font-semibold text-stone-700">
          AASRA AI — Learn. Understand. Care. Connect.
        </p>
        <p className="max-w-xl mx-auto text-stone-500">
          A compassionate, respectful AI companion designed for elderly wellbeing. Transparent AI transparently acknowledging limits: AASRA is not a biological family member, medical doctor, or emergency dispatcher. In life-threatening emergencies, immediately dial 112.
        </p>
      </footer>

      {/* 6. MODALS & OVERLAYS */}
      <EmergencyOverlay
        isOpen={emergencyActive}
        onClose={() => setEmergencyActive(false)}
      />

      <LanguageSettingsModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

      <TypeChatModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
      />

      <TemporaryAbsenceModal
        isOpen={showAbsenceModal}
        onClose={() => setShowAbsenceModal(false)}
      />

      <EmergencyListeningModal
        isOpen={showEmergencyListeningModal}
        onClose={() => setShowEmergencyListeningModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AasraProvider>
      <MainAppContent />
    </AasraProvider>
  );
}
