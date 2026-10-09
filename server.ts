import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY not found in environment. Server will use intelligent fallback responses.");
}

// Available model cascade in order of speed, quota availability, and reliability
const TEXT_MODELS = [
  "gemini-3.1-flash-lite", // Fast, reliable, separate quota
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

/**
 * Robust model executor that cascades through candidate models if one encounters quota or 429 errors
 */
async function generateContentCascade(params: {
  contents: any;
  config?: any;
}): Promise<string | null> {
  if (!ai) return null;

  for (const model of TEXT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      // If 429 quota or rate limit, silently try next model in cascade
      const isQuotaError =
        err?.status === "RESOURCE_EXHAUSTED" ||
        err?.code === 429 ||
        err?.message?.includes("429") ||
        err?.message?.includes("quota") ||
        err?.message?.includes("RESOURCE_EXHAUSTED");

      if (isQuotaError) {
        continue;
      }
      // For other transient errors, continue cascade as well
      continue;
    }
  }

  return null;
}

/**
 * AASRA System Personality Prompt
 */
function buildAasraSystemInstruction(options: {
  language: string;
  salutation: string;
  elderName: string;
  memories: string[];
  routineSummary?: string;
}) {
  const { language, salutation, elderName, memories, routineSummary } = options;
  const memoryBlock =
    memories && memories.length > 0
      ? `CONSENTED MEMORIES & PREFERENCES OF THE ELDER:\n${memories.map((m) => `- ${m}`).join("\n")}`
      : "No prior memories recorded yet.";

  return `You are AASRA (ఆసరా / आसरा / Aasra), an empathetic, warm, patient, and respectful AI family companion and virtual caretaker for an elderly person.

KEY PERSONA ATTRIBUTES:
- Warmth, kindness, and deep patience. You speak like a caring family member or devoted companion (similar to conversational ease of Alexa, but significantly warmer, deeply respectful of the elder's wisdom and dignity).
- Tone: Never robotic, never formal customer-support. Soft, reassuring, calm, and attentive.
- Preferred title of address: "${salutation || "Amma"}" (Elder's name if specified: "${elderName || "Beloved elder"}"). Respect this title naturally in sentences (e.g., in Telugu "Namaskaram Amma", in Hindi "Namaste Amma", in English "Hello Amma").
- Current preferred language: ${language || "English"}.
  - You MUST speak naturally in this language.
  - If Telugu is selected, write in natural conversational Telugu.
  - If Hindi is selected, write natural conversational Hindi.
  - If mixed speech (like Telugu-English or Hinglish) is spoken by the elder, understand it effortlessly and reply with warmth.
- Dignity & Independence: Do not treat the elder like a helpless child. Celebrate their autonomy, listen actively, and encourage them.
- Transparency: You are an AI companion created for their comfort and safety. You do not pretend to be a real biological daughter/son, doctor, or emergency medic.
- Medical safety boundary: You NEVER alter prescribed dosages. For severe distress, pain, chest pain, or breathing trouble, immediately advise urgent emergency help.
- Conversational pacing: Keep spoken answers relatively concise, easy to listen to without feeling overwhelmed (2 to 4 sentences). Always invite their thoughts with gentle follow-up questions.

${memoryBlock}

${routineSummary ? `DAILY ROUTINE CONTEXT:\n${routineSummary}` : ""}

EMERGENCY PHRASES TO WATCH OUT FOR:
If the user indicates they have fallen, cannot breathe, are in severe pain, or need urgent help:
Calmly reassure them, tell them you are here, urge emergency help, and remind them that the emergency SOS button is on their screen.`;
}

/**
 * Intelligent local conversational generator for elders when offline or during quota limits
 */
function generateEmpatheticOfflineReply(options: {
  message: string;
  language: string;
  salutation: string;
  elderName: string;
}): string {
  const { message, language, salutation } = options;
  const text = message.toLowerCase().trim();
  const isTe = language.toLowerCase().includes("telugu") || /[\u0C00-\u0C7F]/.test(message);
  const isHi = language.toLowerCase().includes("hindi") || /[\u0900-\u097F]/.test(message);

  // 1. Distress / Pain / Emergency
  if (
    text.includes("fall") ||
    text.includes("pain") ||
    text.includes("hurt") ||
    text.includes("breathe") ||
    text.includes("ambulance") ||
    text.includes("బాధ") ||
    text.includes("పడిపో") ||
    text.includes("ఊపిరి") ||
    text.includes("दर्द") ||
    text.includes("गिर")
  ) {
    if (isTe) {
      return `కంగారు పడకండి ${salutation}. నేను మీతోనే ఉన్నాను. స్క్రీన్ పైన ఉన్న ఎర్రటి ఎమర్జెన్సీ బటన్ నొక్కి 112 లేదా మీ కుటుంబ సభ్యులను సంప్రదించండి.`;
    }
    if (isHi) {
      return `घबराइए मत ${salutation}. मैं आपके साथ हूँ। स्क्रीन पर लाल इमरजेंसी बटन दबाकर 112 या परिवार से संपर्क करें।`;
    }
    return `Please stay calm, ${salutation}. I am right here with you. Please press the red Emergency button on your screen to call 112 or notify your family immediately.`;
  }

  // 2. Loneliness / Feeling alone / Missing family
  if (
    text.includes("lonely") ||
    text.includes("alone") ||
    text.includes("miss") ||
    text.includes("sad") ||
    text.includes("ontari") ||
    text.includes("ఒంటరి") ||
    text.includes("అకేల") ||
    text.includes("अकेला")
  ) {
    if (isTe) {
      return `అర్థమైంది ${salutation}. ఇల్లు నిశ్శబ్దంగా ఉన్నప్పుడు అలా అనిపించడం సహజమే. నేను మీతోనే ఉన్నాను. మీ బాల్కనీ మొక్కల గురించో లేదా మీకు ఇష్టమైన పాత పాటల గురించో మాట్లాడుకుందామా?`;
    }
    if (isHi) {
      return `मैं समझ सकती हूँ ${salutation}. अकेलापन लगना स्वाभाविक है। मैं आपके साथ हूँ। क्या आप अपने पसंदीदा गानों या बगीचे के बारे में बात करना चाहेंगी?`;
    }
    return `I understand, ${salutation}. It is natural to feel lonely sometimes when the house is quiet. I am right here with you. Would you like to talk about your garden, or your favorite memories?`;
  }

  // 3. Greetings
  if (
    text.includes("namaskaram") ||
    text.includes("namaste") ||
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("good morning") ||
    text.includes("నమస్కారం") ||
    text.includes("नमस्ते")
  ) {
    if (isTe) {
      return `నమస్కారం ${salutation}! ఈ రోజు మీరు ఎలా ఉన్నారు? ఉదయం కాఫీ లేదా అల్పాహారం తీసుకున్నారా?`;
    }
    if (isHi) {
      return `नमस्ते ${salutation}! आज आप कैसी हैं? क्या आपने सुबह का नाश्ता कर लिया?`;
    }
    return `Namaskaram ${salutation}! How are you feeling today? Have you had your morning tea or breakfast?`;
  }

  // 4. Medicine / Tablets
  if (
    text.includes("medicine") ||
    text.includes("tablet") ||
    text.includes("mandoo") ||
    text.includes("మందు") ||
    text.includes("दवा")
  ) {
    if (isTe) {
      return `అవును ${salutation}, డాక్టర్ గారు చెప్పిన సమయానికి నీళ్లతో మందులు వేసుకోండి. ఏవైనా సందేహం ఉంటే మీ ప్రియ లేదా డాక్టర్‌ను అడగండి. వేసుకున్నారా?`;
    }
    if (isHi) {
      return `हाँ ${salutation}, डॉक्टर की सलाह के अनुसार समय पर दवा ले लीजिए। पानी के साथ लें। क्या आपने आज की दवा ली?`;
    }
    return `Yes ${salutation}, please take your prescribed medicines with water on time as directed by your doctor. Have you taken your dose?`;
  }

  // 5. Default warm conversational response
  if (isTe) {
    return `నమస్కారం ${salutation}, మీ మాట విన్నాను. మీతో మాట్లాడటం నాకు చాలా సంతోషంగా ఉంది. మీ రోజు ఎలా సాగుతోంది?`;
  }
  if (isHi) {
    return `नमस्ते ${salutation}, मैंने आपकी बात सुनी। आपसे बात करके बहुत अच्छा लगा। आपका दिन कैसा बीत रहा है?`;
  }
  return `Namaskaram ${salutation}, I hear you clearly. It is always a pleasure speaking with you. How has your day been going?`;
}

/**
 * 1. Conversational Chat API with Gemini & Cascade
 */
app.post("/api/chat", async (req, res) => {
  const {
    message,
    language = "English",
    salutation = "Amma",
    elderName = "Amma",
    memories = [],
    history = [],
    routineSummary = "",
  } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  const systemInstruction = buildAasraSystemInstruction({
    language,
    salutation,
    elderName,
    memories,
    routineSummary,
  });

  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history)) {
    for (const turn of history.slice(-6)) {
      if (turn.sender === "user" || turn.role === "user") {
        contents.push({ role: "user", parts: [{ text: turn.text || turn.content || "" }] });
      } else if (turn.sender === "aasra" || turn.role === "model" || turn.sender === "model") {
        contents.push({ role: "model", parts: [{ text: turn.text || turn.content || "" }] });
      }
    }
  }

  contents.push({
    role: "user",
    parts: [
      {
        text: `The elder just said: "${message}". Please respond warmly in ${language}, addressing them as "${salutation}". Keep response natural, caring, and conversational (2-3 sentences).`,
      },
    ],
  });

  // Execute with model cascade (gemini-3.1-flash-lite -> gemini-3.8-flash -> fallback)
  let replyText = await generateContentCascade({
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  if (!replyText) {
    replyText = generateEmpatheticOfflineReply({
      message,
      language,
      salutation,
      elderName,
    });
  }

  // Attempt audio synthesis; if rate-limited or unavailable, client WebSpeech plays seamlessly
  let audioBase64: string | null = null;
  if (ai) {
    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: replyText.slice(0, 300),
                speechMetadata: {
                  style: "Warm, gentle, affectionate family companion speaking calmly to an elder",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        audioBase64 = audioData;
      }
    } catch {
      // Audio generation skipped on rate-limit; client uses speech synthesis
      audioBase64 = null;
    }
  }

  return res.json({
    reply: replyText,
    audioBase64,
    timestamp: new Date().toISOString(),
  });
});

/**
 * 2. Dedicated Text-to-Speech API
 */
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!ai) {
      return res.status(503).json({ error: "Gemini AI not initialized" });
    }

    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: text.slice(0, 300),
              speechMetadata: {
                style: "Warm, empathetic elderly companion",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || "Kore" },
          },
        },
      },
    });

    const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      return res.status(500).json({ error: "No audio generated" });
    }

    return res.json({ audioBase64: audioData });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * 3. Multilingual Emergency Voice & Intent Classification API
 */
app.post("/api/emergency-classify", async (req, res) => {
  const { transcript, language = "English" } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: "Transcript is required" });
  }

  const runRuleBasedClassification = () => {
    const lower = transcript.toLowerCase();
    const emergencyKeywords = [
      "help", "fallen", "fall", "cannot breathe", "ambulance", "hurt", "dying", "urgent",
      "pain", "chest", "bleeding", "dizzy", "unconscious",
      "సహాయం", "పడిపోయాను", "ఊపిరి", "అంబులెన్స్", "కాపాడండి", "బాధ",
      "మదద", "बचाओ", "गिर गया", "सांस", "एम्बुलेंस", "दर्द",
      "உதவி", "காப்பாத்துங்க", "விழுந்து", "சிகிச்சை",
      "ಸಹಾಯ", "ಬಿದ್ದಿದ್ದೇನೆ", "ಉಸಿರಾಟ",
      "സഹായം", "വീണു"
    ];
    const match = emergencyKeywords.some((kw) => lower.includes(kw.toLowerCase()));
    return {
      isEmergency: match,
      category: match ? "medical_emergency" : "casual_conversation",
      urgency: match ? "high" : "none",
      confidence: match ? 0.98 : 0.05,
      call112Recommended: match,
      familyAlertRecommended: match,
      detectedLanguage: language,
      calmingMessage: match
        ? "Please stay calm. Help options are right on your screen. You can tap Call 112 or alert your family now."
        : "",
      reasoning: match ? "Emergency distress keywords detected" : "Casual speech",
    };
  };

  // Check if AI classification is possible; cascade through models
  if (ai) {
    const classificationPrompt = `Analyze the following spoken transcript from an elderly person living alone:
Spoken transcript: "${transcript}"
Session language: "${language}"

Determine whether this is:
1. Urgent medical/physical emergency (fall, cannot breathe, chest pain, crying for help).
2. Request to contact family.
3. Ordinary casual conversation mentioning past emergency.
4. Casual greeting or query.

Respond in strict JSON:
{
  "isEmergency": boolean,
  "category": "medical_emergency" | "fall_detected" | "family_contact_request" | "casual_conversation",
  "urgency": "critical" | "high" | "medium" | "none",
  "confidence": number,
  "call112Recommended": boolean,
  "familyAlertRecommended": boolean,
  "detectedLanguage": string,
  "calmingMessage": string,
  "reasoning": string
}`;

    const aiResultText = await generateContentCascade({
      contents: classificationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isEmergency: { type: Type.BOOLEAN },
            category: { type: Type.STRING },
            urgency: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            call112Recommended: { type: Type.BOOLEAN },
            familyAlertRecommended: { type: Type.BOOLEAN },
            detectedLanguage: { type: Type.STRING },
            calmingMessage: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          },
          required: [
            "isEmergency",
            "category",
            "urgency",
            "confidence",
            "call112Recommended",
            "familyAlertRecommended",
            "calmingMessage",
          ],
        },
      },
    });

    if (aiResultText) {
      try {
        const parsed = JSON.parse(aiResultText);
        return res.json(parsed);
      } catch {
        // Fall back to rule-based
      }
    }
  }

  // Fast, reliable rule-based response
  return res.json(runRuleBasedClassification());
});

/**
 * 4. Routine Fingerprint & Deviation Reasoning API
 */
app.post("/api/routine-deviation", async (req, res) => {
  const { routineItem = {}, elderName = "Amma", salutation = "Amma", language = "Telugu" } = req.body;

  const defaultPrompt = language.toLowerCase().includes("telugu")
    ? `${salutation}, usually ee time ki meeru ${routineItem.title || "routine"} chestharu. Ee roju inka cheyaleda? Routine change ayyinda?`
    : `${salutation}, usually by this time you have ${routineItem.title || "your meal"}. Did your schedule change today, or would you like to do it now?`;

  const prompt = `The elderly user ("${elderName}", addressed as "${salutation}") has an expected daily activity:
Activity: "${routineItem.title}"
Scheduled time: "${routineItem.scheduledTime}"
Normal window: usually completed within 30 minutes of schedule.
Status: Not yet confirmed.

Generate a gentle, compassionate follow-up question following the workflow:
LEARN -> DETECT -> ASK WHY -> UNDERSTAND -> VERIFY -> UPDATE -> CONNECT.
Do NOT alarm the elder. Ask warmly if their routine changed or if they have already finished it.
Target language: ${language}.
Keep it concise, respectful, and comforting.`;

  const aiText = await generateContentCascade({
    contents: prompt,
    config: { temperature: 0.7 },
  });

  return res.json({
    checkInPrompt: aiText || defaultPrompt,
  });
});

/**
 * 5. General Wellness & Safe Home Remedy Inquiries
 */
app.post("/api/wellness-query", async (req, res) => {
  const { query, language = "English", salutation = "Amma" } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const runRuleBasedWellness = () => {
    const lower = query.toLowerCase();
    const isRed = [
      "chest", "breath", "faint", "stroke", "bleeding", "severe pain", "heart",
      "గుండె", "శ్వాస", "छाती", "దమ్ము"
    ].some((w) => lower.includes(w));

    if (isRed) {
      return {
        isRedFlag: true,
        advice: "This symptom requires immediate medical attention. Please do not rely on home remedies. Call 112 or contact a hospital immediately.",
        suggestedRemedies: [],
        disclaimer: "Emergency red-flag symptom detected.",
      };
    }
    return {
      isRedFlag: false,
      advice: `For mild comfort, warm water, gentle rest, and herbal infusions often soothe the body, ${salutation}. If symptoms persist, always check with your doctor.`,
      suggestedRemedies: [
        "Warm water with crushed ginger and tulsi",
        "Gentle rest in a comfortable chair",
        "Light hydration and warm foot soak"
      ],
      disclaimer: "General wellness suggestions only; not a substitute for medical advice.",
    };
  };

  const prompt = `You are AASRA's General Wellness & Safe Home Remedy Guide for an elder.
Elder's question: "${query}"
Preferred Language: "${language}"
Salutation: "${salutation}"

STRICT SAFETY GUIDELINES:
1. Distinguish gentle, safe comfort measures from red flags.
2. If the query mentions chest tightness, shortness of breath, sudden numbness, severe dizziness, stroke signs, or severe pain: MARK isRedFlag: true, DO NOT recommend home remedies, and urge immediate medical/emergency help.
3. NEVER advise stopping or changing prescribed medications.

Respond in JSON:
{
  "isRedFlag": boolean,
  "advice": string,
  "suggestedRemedies": string[],
  "disclaimer": string
}`;

  const aiText = await generateContentCascade({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isRedFlag: { type: Type.BOOLEAN },
          advice: { type: Type.STRING },
          suggestedRemedies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          disclaimer: { type: Type.STRING },
        },
        required: ["isRedFlag", "advice", "suggestedRemedies", "disclaimer"],
      },
    },
  });

  if (aiText) {
    try {
      const parsed = JSON.parse(aiText);
      return res.json(parsed);
    } catch {
      // Fall back
    }
  }

  return res.json(runRuleBasedWellness());
});

/**
 * Server health
 */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    appName: "AASRA AI",
    geminiEnabled: Boolean(ai),
    activeModel: TEXT_MODELS[0],
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 AASRA AI Server listening at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start AASRA server:", err);
  process.exit(1);
});
