import React, { useEffect, useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Keyboard,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  PhoneCall,
  HeartHandshake,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";
import { voiceService } from "../services/voiceService";
import { SUPPORTED_LANGUAGES, AssistantState } from "../types";

interface VoiceCompanionOrbProps {
  onOpenLanguageSettings: () => void;
  onOpenEmergencyModal: () => void;
  onOpenTypeModal: () => void;
}

export const VoiceCompanionOrb: React.FC<VoiceCompanionOrbProps> = ({
  onOpenLanguageSettings,
  onOpenEmergencyModal,
  onOpenTypeModal,
}) => {
  const {
    profile,
    memories,
    routines,
    chatMessages,
    addChatMessage,
    sendDemoAlert,
    setEmergencyActive,
  } = useAasra();

  const [state, setState] = useState<AssistantState>("ready");
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Tap microphone to talk with AASRA");
  const [audioSource, setAudioSource] = useState<"gemini_tts" | "browser_tts" | null>(null);

  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.id === profile.preferredLanguageId) ||
    SUPPORTED_LANGUAGES[0];

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
      }
    };
  }, []);

  /**
   * Send elder's message to Gemini conversational pipeline
   */
  const handleProcessElderSpeech = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    setState("understanding");
    setStatusMessage("Understanding what you said...");
    addChatMessage({ sender: "user", text: spokenText });

    const lower = spokenText.toLowerCase();
    const emergencyDistressPattern =
      /(help|fallen|fall|cannot breathe|ambulance|hurt|dying|urgent|pain|chest|bleeding|dizzy|unconscious|సహాయం|పడిపో|ఊపిరి|అంబులెన్స్|కాపాడ|బాధ|మదద|बचाओ|गिर|सांस|एम्बुलेंस|दर्द)/i;

    const likelyEmergency = emergencyDistressPattern.test(lower);

    // If distress keywords detected, verify with emergency classification
    if (likelyEmergency) {
      try {
        const emergencyRes = await fetch("/api/emergency-classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: spokenText,
            language: activeLang.name,
          }),
        });

        if (emergencyRes.ok) {
          const emergencyData = await emergencyRes.json();
          if (emergencyData.isEmergency) {
            setState("emergency_alert");
            setStatusMessage("⚠️ Emergency intent detected! Preparing assistance...");
            addChatMessage({
              sender: "aasra",
              text:
                emergencyData.calmingMessage ||
                "I am right here with you. Help options are on your screen.",
              isEmergencyNotice: true,
            });

            // Trigger emergency workflow
            setEmergencyActive(true);
            sendDemoAlert(
              "emergency",
              `AASRA Voice Alert: Urgent assistance requested by ${profile.elderName}. Transcript: "${spokenText}"`,
              "both"
            );

            // Calm elder with immediate voice
            speakAssistantText(
              emergencyData.calmingMessage || "Please stay calm. Help is being alerted.",
              null
            );
            return;
          }
        }
      } catch (classifyErr) {
        console.warn("Emergency classify check bypassed:", classifyErr);
      }
    }

    // Conversational chat generation with Gemini
    try {
      const routineSummary = routines
        .map((r) => `${r.title} (${r.scheduledTime}): ${r.status}`)
        .join("; ");

      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: spokenText,
          language: activeLang.name,
          salutation:
            profile.salutation === "Custom"
              ? profile.customSalutation || "Amma"
              : profile.salutation,
          elderName: profile.elderName,
          memories: profile.memoryEnabled ? memories.map((m) => m.text) : [],
          history: chatMessages.slice(-6),
          routineSummary,
        }),
      });

      if (!chatRes.ok) {
        throw new Error("Failed to get conversational response");
      }

      const chatData = await chatRes.json();
      const replyText = chatData.reply || "I am listening, Amma.";
      const audioBase64 = chatData.audioBase64;

      addChatMessage({ sender: "aasra", text: replyText });
      await speakAssistantText(replyText, audioBase64);
    } catch (err: any) {
      console.warn("Conversational chat error handled:", err);
      setState("ready");
      setStatusMessage("Ready. Tap microphone to speak.");
    }
  };

  /**
   * Speak response using Gemini WAV or browser speech synthesis
   */
  const speakAssistantText = async (text: string, audioBase64: string | null) => {
    setState("speaking");
    setStatusMessage("AASRA is speaking...");

    if (audioBase64) {
      try {
        setAudioSource("gemini_tts");
        await voiceService.playGeminiWav(audioBase64, (event) => {
          if (event === "end" || event === "interrupted" || event === "error") {
            setState("ready");
            setStatusMessage("Ready. Tap microphone to speak again.");
            setAudioSource(null);
          }
        });
        return;
      } catch (wavErr) {
        console.warn("Gemini WAV playback failed, falling back to browser TTS:", wavErr);
      }
    }

    // Fallback to browser SpeechSynthesis
    setAudioSource("browser_tts");
    voiceService.speakBrowserTTS(
      text,
      activeLang.bcp47,
      profile.speechSpeed,
      (event) => {
        if (event === "end" || event === "error") {
          setState("ready");
          setStatusMessage("Ready. Tap microphone to speak again.");
          setAudioSource(null);
        }
      }
    );
  };

  /**
   * Start microphone listening session
   */
  const handleStartListening = () => {
    // Stop any ongoing speech first
    voiceService.stopSpeaking();

    if (!voiceService.isRecognitionSupported()) {
      setState("voice_unavailable");
      setStatusMessage("Voice recognition not supported in this browser. You can type!");
      return;
    }

    setState("listening");
    setIsMicActive(true);
    setStatusMessage("Listening to you... Speak naturally.");
    setLiveTranscript("");

    const stopFn = voiceService.startSpeechRecognition({
      languageBcp47: activeLang.bcp47,
      onStart: () => {
        setState("listening");
      },
      onTranscript: (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal && transcript.trim().length > 1) {
          // Process final transcript
          stopFn();
          setIsMicActive(false);
          handleProcessElderSpeech(transcript);
        }
      },
      onError: (error) => {
        console.warn("Speech recognition error:", error);
        setIsMicActive(false);
        setState("ready");
        setStatusMessage("Could not hear clearly. Please tap to try again.");
      },
      onEnd: () => {
        setIsMicActive(false);
        if (state === "listening") {
          setState("ready");
          setStatusMessage("Tap microphone to talk with AASRA");
        }
      },
    });

    stopRecognitionRef.current = stopFn;
  };

  /**
   * Stop listening or interrupt speech
   */
  const handleStopOrInterrupt = () => {
    voiceService.stopSpeaking();
    if (stopRecognitionRef.current) {
      stopRecognitionRef.current();
    }
    setIsMicActive(false);
    setState("ready");
    setStatusMessage("Stopped. Tap microphone to start talking.");
    setAudioSource(null);
  };

  // Visual classes based on assistant state
  const getOrbAura = () => {
    switch (state) {
      case "listening":
        return "from-emerald-400 via-teal-300 to-amber-300 animate-pulse scale-110 shadow-2xl shadow-emerald-400/40 ring-8 ring-emerald-200/50";
      case "understanding":
        return "from-amber-400 via-orange-400 to-rose-400 animate-spin scale-105 shadow-2xl shadow-amber-500/40 ring-8 ring-amber-200/50";
      case "speaking":
        return "from-amber-500 via-rose-400 to-purple-500 animate-pulse scale-110 shadow-2xl shadow-rose-400/50 ring-8 ring-rose-200/60";
      case "emergency_alert":
        return "from-red-600 via-rose-600 to-orange-500 animate-bounce scale-115 shadow-2xl shadow-red-600/60 ring-8 ring-red-300/80";
      default:
        return "from-amber-400 via-amber-300 to-orange-300 hover:scale-105 shadow-xl shadow-amber-300/40 ring-4 ring-amber-100";
    }
  };

  const getStatusBadge = () => {
    switch (state) {
      case "listening":
        return { label: "LISTENING TO YOU", color: "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse" };
      case "understanding":
        return { label: "UNDERSTANDING & THINKING", color: "bg-amber-100 text-amber-800 border-amber-300" };
      case "speaking":
        return { label: "AASRA IS SPEAKING", color: "bg-rose-100 text-rose-800 border-rose-300" };
      case "emergency_alert":
        return { label: "EMERGENCY DETECTED", color: "bg-red-100 text-red-800 border-red-400 animate-bounce" };
      default:
        return { label: "AASRA READY", color: "bg-stone-100 text-stone-700 border-stone-200" };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/60 rounded-3xl border border-amber-200/70 shadow-lg text-center relative overflow-hidden">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Controls: Language & Mode */}
      <div className="w-full flex items-center justify-between mb-6 z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider border ${badge.color}`}>
            <span className={`w-2 h-2 rounded-full ${state === "listening" ? "bg-emerald-600 animate-ping" : state === "speaking" ? "bg-rose-600 animate-ping" : "bg-stone-500"}`} />
            {badge.label}
          </span>
          {audioSource === "gemini_tts" && (
            <span className="text-[11px] font-medium text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200">
              Gemini Voice Active
            </span>
          )}
        </div>

        <button
          onClick={onOpenLanguageSettings}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 hover:bg-amber-100/80 text-stone-800 text-sm font-semibold rounded-full border border-stone-200 shadow-sm transition active:scale-95"
          title="Change conversation language"
        >
          <Languages className="w-4 h-4 text-amber-700" />
          <span>{activeLang.nativeName} ({activeLang.name})</span>
        </button>
      </div>

      {/* Centerpiece: Animated Voice Orb */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Concentric Audio Wave Rings when speaking/listening */}
        {(state === "listening" || state === "speaking") && (
          <>
            <div className="absolute w-64 h-64 rounded-full border-2 border-amber-400/30 animate-ping pointer-events-none" />
            <div className="absolute w-80 h-80 rounded-full border border-rose-400/20 animate-pulse pointer-events-none" />
          </>
        )}

        <button
          onClick={state === "listening" || state === "speaking" ? handleStopOrInterrupt : handleStartListening}
          className={`w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-tr ${getOrbAura()} flex flex-col items-center justify-center transition-all duration-500 cursor-pointer select-none focus:outline-none focus:ring-4 focus:ring-amber-400`}
          aria-label={state === "listening" ? "Stop listening" : "Start speaking with AASRA"}
        >
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-4 shadow-inner">
            {state === "listening" ? (
              <>
                <Mic className="w-12 h-12 text-emerald-600 animate-bounce mb-1" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Listening</span>
              </>
            ) : state === "speaking" ? (
              <>
                <Volume2 className="w-12 h-12 text-rose-600 animate-pulse mb-1" />
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Speaking</span>
              </>
            ) : state === "understanding" ? (
              <>
                <Sparkles className="w-12 h-12 text-amber-600 animate-spin mb-1" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Thinking</span>
              </>
            ) : (
              <>
                <Mic className="w-12 h-12 text-amber-700 mb-1" />
                <span className="text-sm font-bold text-stone-800">Tap to Talk</span>
                <span className="text-[11px] text-stone-500 mt-0.5">మాట్లాడండి</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Dynamic Status / Speech Feedback */}
      <div className="min-h-[64px] max-w-xl flex flex-col items-center justify-center my-2 px-4 z-10">
        <p className="text-stone-700 font-medium text-base md:text-lg">
          {statusMessage}
        </p>

        {liveTranscript && (
          <div className="mt-2 p-2 px-4 bg-amber-100/70 border border-amber-300 rounded-xl text-stone-800 text-sm font-medium animate-fadeIn">
            &ldquo;{liveTranscript}&rdquo;
          </div>
        )}
      </div>

      {/* Primary Accessible Voice Controls for Elders */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mt-4 z-10">
        {state === "listening" || state === "speaking" ? (
          <button
            onClick={handleStopOrInterrupt}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md transition active:scale-95 col-span-2 sm:col-span-1"
          >
            <VolumeX className="w-5 h-5" />
            <span>Stop Speaking</span>
          </button>
        ) : (
          <button
            onClick={handleStartListening}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-md transition active:scale-95 col-span-2 sm:col-span-1"
          >
            <Mic className="w-5 h-5" />
            <span>Start Talk</span>
          </button>
        )}

        <button
          onClick={onOpenTypeModal}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-2xl border border-stone-200 shadow-sm transition active:scale-95"
        >
          <Keyboard className="w-5 h-5 text-stone-600" />
          <span>Type Instead</span>
        </button>

        <button
          onClick={onOpenLanguageSettings}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-2xl border border-stone-200 shadow-sm transition active:scale-95"
        >
          <Languages className="w-5 h-5 text-stone-600" />
          <span>Languages</span>
        </button>

        <button
          onClick={onOpenEmergencyModal}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-2xl border border-red-300 shadow-sm transition active:scale-95"
        >
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Emergency 112</span>
        </button>
      </div>

      {/* Helpful Quick Prompt suggestions in native language */}
      <div className="mt-6 pt-4 border-t border-amber-200/60 w-full max-w-2xl flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-stone-500 font-medium mr-1">Try saying:</span>
        <button
          onClick={() => handleProcessElderSpeech("Namaskaram AASRA, ela unnavu?")}
          className="px-3 py-1 bg-white hover:bg-amber-100 text-stone-700 font-medium rounded-full border border-amber-200 transition"
        >
          &quot;Namaskaram, ela unnavu?&quot;
        </button>
        <button
          onClick={() => handleProcessElderSpeech("Please remind me about my morning medicine.")}
          className="px-3 py-1 bg-white hover:bg-amber-100 text-stone-700 font-medium rounded-full border border-amber-200 transition"
        >
          &quot;Remind me about my medicine&quot;
        </button>
        <button
          onClick={() => handleProcessElderSpeech("Naaku ontariga anipistundi, konchem sepu matladava?")}
          className="px-3 py-1 bg-white hover:bg-amber-100 text-stone-700 font-medium rounded-full border border-amber-200 transition"
        >
          &quot;Feeling lonely, let&apos;s talk&quot;
        </button>
      </div>
    </div>
  );
};
