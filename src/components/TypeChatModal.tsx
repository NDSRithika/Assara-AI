import React, { useState } from "react";
import {
  Keyboard,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  Volume2,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";
import { voiceService } from "../services/voiceService";
import { SUPPORTED_LANGUAGES } from "../types";

interface TypeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TypeChatModal: React.FC<TypeChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    profile,
    memories,
    routines,
    chatMessages,
    addChatMessage,
  } = useAasra();

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.id === profile.preferredLanguageId) ||
    SUPPORTED_LANGUAGES[0];

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputVal.trim();
    if (!text || loading) return;

    setInputVal("");
    addChatMessage({ sender: "user", text });
    setLoading(true);

    try {
      const routineSummary = routines
        .map((r) => `${r.title} (${r.scheduledTime}): ${r.status}`)
        .join("; ");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language: activeLang.name,
          salutation: profile.salutation === "Custom" ? (profile.customSalutation || "Amma") : profile.salutation,
          elderName: profile.elderName,
          memories: profile.memoryEnabled ? memories.map((m) => m.text) : [],
          history: chatMessages.slice(-6),
          routineSummary,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "I am here with you, Amma.";
      addChatMessage({ sender: "aasra", text: reply });

      if (data.audioBase64) {
        voiceService.playGeminiWav(data.audioBase64);
      } else {
        voiceService.speakBrowserTTS(reply, activeLang.bcp47, profile.speechSpeed);
      }
    } catch (err) {
      console.error("Text chat failed:", err);
      addChatMessage({
        sender: "aasra",
        text: "I am having trouble connecting right now, but I am listening.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[80vh] border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-800">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Type with AASRA (రాత సంభాషణ)
              </h2>
              <p className="text-xs text-stone-600">
                In {activeLang.nativeName} ({activeLang.name})
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

        {/* Chat message history */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-base ${
                    isUser
                      ? "bg-amber-600 text-white rounded-br-sm"
                      : "bg-stone-100 text-stone-900 rounded-bl-sm border border-stone-200"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1.5 ${
                      isUser ? "text-amber-200 text-right" : "text-stone-500 flex items-center justify-between"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() =>
                          voiceService.speakBrowserTTS(
                            msg.text,
                            activeLang.bcp47,
                            profile.speechSpeed
                          )
                        }
                        className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 ml-2"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Speak
                      </button>
                    )}
                  </div>
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3 items-center text-stone-500 text-sm italic">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
              <span>AASRA is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-stone-50 border-t border-stone-200 flex gap-2"
        >
          <input
            type="text"
            placeholder={`Type a message to AASRA in ${activeLang.name}...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-amber-500 text-base"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || loading}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow transition flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
