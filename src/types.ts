export type Salutation =
  | "Amma"
  | "Nanna"
  | "Aunty"
  | "Uncle"
  | "Dadi"
  | "Dadu"
  | "Grandmother"
  | "Grandfather"
  | "Custom";

export interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  bcp47: string;
  sampleGreeting: string;
  sampleEmergency: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    id: "telugu",
    name: "Telugu",
    nativeName: "తెలుగు",
    code: "te",
    bcp47: "te-IN",
    sampleGreeting: "నమస్కారం అమ్మా! ఈ రోజు ఎలా ఉన్నారు?",
    sampleEmergency: "నాకు సహాయం కావాలి. నేను పడిపోయాను.",
  },
  {
    id: "english",
    name: "English",
    nativeName: "English",
    code: "en",
    bcp47: "en-IN",
    sampleGreeting: "Hello! How are you feeling today?",
    sampleEmergency: "Help me! I have fallen down.",
  },
  {
    id: "hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
    code: "hi",
    bcp47: "hi-IN",
    sampleGreeting: "नमस्ते अम्मा! आज आप कैसी हैं?",
    sampleEmergency: "मुझे मदद चाहिए। मैं गिर गया हूँ।",
  },
  {
    id: "tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
    code: "ta",
    bcp47: "ta-IN",
    sampleGreeting: "வணக்கம் அம்மா! இன்று எப்படி இருக்கிறீர்கள்?",
    sampleEmergency: "எனக்கு உதவி வேண்டும். நான் கீழே விழுந்துவிட்டேன்.",
  },
  {
    id: "kannada",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    code: "kn",
    bcp47: "kn-IN",
    sampleGreeting: "ನಮಸ್ಕಾರ ಅಮ್ಮ! ಇಂದು ಹೇಗಿದ್ದೀರಿ?",
    sampleEmergency: "ನನಗೆ ಸಹಾಯ ಬೇಕು. ನಾನು ಬಿದ್ದಿದ್ದೇನೆ.",
  },
  {
    id: "malayalam",
    name: "Malayalam",
    nativeName: "മലയാളം",
    code: "ml",
    bcp47: "ml-IN",
    sampleGreeting: "നമസ്കാരം അമ്മേ! ഇന്ന് സുഖമാണോ?",
    sampleEmergency: "എനിക്ക് സഹായം വേണം. ഞാൻ വീണു.",
  },
  {
    id: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
    code: "bn",
    bcp47: "bn-IN",
    sampleGreeting: "নমস্কার আম্মা! আজ কেমন আছেন?",
    sampleEmergency: "আমাকে সাহায্য করুন। আমি পড়ে গেছি।",
  },
  {
    id: "marathi",
    name: "Marathi",
    nativeName: "मराठी",
    code: "mr",
    bcp47: "mr-IN",
    sampleGreeting: "नमस्कार आई! आज कसे आहात?",
    sampleEmergency: "मला मदत हवी आहे. मी खाली पडलो आहे.",
  },
  {
    id: "urdu",
    name: "Urdu",
    nativeName: "اردو",
    code: "ur",
    bcp47: "ur-IN",
    sampleGreeting: "آداب امّی! آج آپ کیسی ہیں؟",
    sampleEmergency: "مجھے مدد چاہیے۔ میں گر گیا ہوں۔",
  },
];

export type AssistantState =
  | "ready"
  | "listening"
  | "understanding"
  | "speaking"
  | "paused"
  | "permission_required"
  | "reconnecting"
  | "voice_unavailable"
  | "emergency_alert"
  | "error";

export interface UserProfile {
  elderName: string;
  salutation: Salutation;
  customSalutation?: string;
  preferredLanguageId: string;
  speechSpeed: number; // 0.8 to 1.2
  voiceName: string; // "Kore" | "Puck" | "Fenrir" | "Zephyr"
  autoDetectLanguage: boolean;
  multilingualMode: boolean;
  fontSize: "normal" | "large" | "xl";
  highContrast: boolean;
  memoryEnabled: boolean;
  emergencyListeningConsent: boolean;
  temporaryAbsence: {
    active: boolean;
    untilTime?: string;
    note?: string;
  };
}

export interface StoredMemory {
  id: string;
  category: "hobby" | "family" | "preference" | "routine" | "health";
  text: string;
  addedAt: string;
}

export type MedicationStatus =
  | "upcoming"
  | "due"
  | "reminder_active"
  | "snoozed"
  | "taken_confirmed"
  | "missed";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string; // e.g. "08:30"
  instructions: string; // "After breakfast with warm water"
  remainingPills: number;
  refillThreshold: number;
  status: MedicationStatus;
  lastTakenAt?: string;
  snoozedUntil?: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  category: "morning" | "meal" | "activity" | "rest" | "evening";
  scheduledTime: string; // "07:30"
  status: "pending" | "confirmed" | "deviated" | "explained";
  confirmedAt?: string;
  explanationNote?: string;
}

export type MoodType =
  | "feeling_good"
  | "feeling_okay"
  | "feeling_lonely"
  | "feeling_worried"
  | "feeling_low"
  | "prefer_not_to_say";

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  mood: MoodType;
  notes?: string;
}

export interface TrustedContact {
  name: string;
  relationship: string;
  phone: string;
  notifyOnDeviation: boolean;
  notifyOnEmergency: boolean;
}

export interface DemoAlertMessage {
  id: string;
  timestamp: string;
  type: "emergency" | "routine_deviation" | "call_request" | "checkin_overdue";
  recipientName: string;
  recipientPhone: string;
  message: string;
  status: "delivered" | "simulated" | "pending";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "aasra" | "system";
  text: string;
  timestamp: string;
  isEmergencyNotice?: boolean;
}
