// Voice & Audio synthesis and recognition service for AASRA AI

type AudioCallback = (event: "start" | "end" | "error" | "interrupted") => void;

class VoiceService {
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;
  private isSpeechSynthesisPlaying = false;
  private recognition: any = null;
  private isRecognizing = false;

  /**
   * Play base64 WAV audio returned from Gemini 3.8 Flash Lite TTS
   */
  async playGeminiWav(base64Wav: string, onEvent?: AudioCallback): Promise<void> {
    this.stopSpeaking();

    try {
      const binaryString = atob(base64Wav);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes.buffer], { type: "audio/wav" });
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }
      this.currentBlobUrl = URL.createObjectURL(blob);

      const audio = new Audio(this.currentBlobUrl);
      this.currentAudioElement = audio;

      audio.onplay = () => onEvent?.("start");
      audio.onended = () => {
        this.cleanupAudio();
        onEvent?.("end");
      };
      audio.onerror = (e) => {
        console.warn("WAV playback error:", e);
        this.cleanupAudio();
        onEvent?.("error");
      };

      await audio.play();
    } catch (err) {
      console.warn("Failed to play Gemini WAV audio:", err);
      this.cleanupAudio();
      onEvent?.("error");
      throw err;
    }
  }

  /**
   * Browser SpeechSynthesis Fallback
   */
  speakBrowserTTS(
    text: string,
    bcp47Lang: string,
    speed: number = 1.0,
    onEvent?: AudioCallback
  ): void {
    this.stopSpeaking();

    if (!("speechSynthesis" in window)) {
      onEvent?.("error");
      return;
    }

    // Clean text of markdown/asterisks for natural speech
    const cleanText = text.replace(/[*_#`~]/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = bcp47Lang || "en-IN";
    utterance.rate = Math.max(0.7, Math.min(1.3, speed));
    utterance.pitch = 1.0;

    // Try to pick a natural voice for language if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(bcp47Lang.split("-")[0]) || v.lang === bcp47Lang
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.isSpeechSynthesisPlaying = true;
      onEvent?.("start");
    };

    utterance.onend = () => {
      this.isSpeechSynthesisPlaying = false;
      onEvent?.("end");
    };

    utterance.onerror = (e) => {
      this.isSpeechSynthesisPlaying = false;
      console.warn("Browser SpeechSynthesis error:", e);
      onEvent?.("error");
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Immediately stops all audio output
   */
  stopSpeaking(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.cleanupAudio();
    }

    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
      this.isSpeechSynthesisPlaying = false;
    }
  }

  private cleanupAudio() {
    this.currentAudioElement = null;
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  /**
   * Check if speech recognition is supported in this browser
   */
  isRecognitionSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    );
  }

  /**
   * Start Speech-to-Text session
   */
  startSpeechRecognition(options: {
    languageBcp47: string;
    onTranscript: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onStart: () => void;
    onEnd: () => void;
  }): () => void {
    if (!this.isRecognitionSupported()) {
      options.onError("Speech recognition is not supported in this browser.");
      return () => {};
    }

    this.stopSpeechRecognition();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options.languageBcp47 || "en-IN";
    this.recognition = recognition;
    this.isRecognizing = true;

    recognition.onstart = () => {
      options.onStart();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        options.onTranscript(finalTranscript.trim(), true);
      } else if (interimTranscript.trim()) {
        options.onTranscript(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      // Don't treat "no-speech" as a fatal error
      if (event.error === "no-speech") return;
      options.onError(event.error || "Speech recognition error");
    };

    recognition.onend = () => {
      this.isRecognizing = false;
      options.onEnd();
    };

    try {
      recognition.start();
    } catch (err: any) {
      options.onError(err.message || "Failed to start microphone");
    }

    return () => {
      this.stopSpeechRecognition();
    };
  }

  stopSpeechRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
      this.isRecognizing = false;
    }
  }
}

export const voiceService = new VoiceService();
