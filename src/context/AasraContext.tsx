import React, { createContext, useContext, useEffect, useState } from "react";
import {
  UserProfile,
  StoredMemory,
  Medication,
  RoutineItem,
  MoodLog,
  TrustedContact,
  DemoAlertMessage,
  ChatMessage,
  SUPPORTED_LANGUAGES,
} from "../types";

interface AasraContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  memories: StoredMemory[];
  addMemory: (category: StoredMemory["category"], text: string) => void;
  deleteMemory: (id: string) => void;
  clearAllMemories: () => void;
  medications: Medication[];
  updateMedicationStatus: (
    id: string,
    status: Medication["status"],
    note?: string
  ) => void;
  addMedication: (med: Omit<Medication, "id" | "status">) => void;
  deleteMedication: (id: string) => void;
  routines: RoutineItem[];
  confirmRoutine: (id: string, note?: string) => void;
  explainRoutineDeviation: (id: string, reason: string) => void;
  resetRoutinesForDay: () => void;
  moodLogs: MoodLog[];
  logMood: (mood: MoodLog["mood"], notes?: string) => void;
  primaryContact: TrustedContact;
  secondaryContact: TrustedContact;
  updateContacts: (
    primary: Partial<TrustedContact>,
    secondary?: Partial<TrustedContact>
  ) => void;
  demoAlerts: DemoAlertMessage[];
  sendDemoAlert: (
    type: DemoAlertMessage["type"],
    message: string,
    recipient: "primary" | "secondary" | "both" | "services"
  ) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChatHistory: () => void;
  activeRole: "elder" | "caregiver";
  setActiveRole: (role: "elder" | "caregiver") => void;
  emergencyActive: boolean;
  setEmergencyActive: (active: boolean) => void;
  activeMedicationPrompt: Medication | null;
  setActiveMedicationPrompt: (med: Medication | null) => void;
}

const defaultProfile: UserProfile = {
  elderName: "Kamala Garu",
  salutation: "Amma",
  preferredLanguageId: "telugu",
  speechSpeed: 1.0,
  voiceName: "Kore",
  autoDetectLanguage: true,
  multilingualMode: true,
  fontSize: "large",
  highContrast: false,
  memoryEnabled: true,
  emergencyListeningConsent: false,
  temporaryAbsence: {
    active: false,
  },
};

const defaultMemories: StoredMemory[] = [
  {
    id: "mem-1",
    category: "hobby",
    text: "Loves watering and nurturing hibiscus and tulsi plants in her balcony garden.",
    addedAt: "2026-10-05",
  },
  {
    id: "mem-2",
    category: "family",
    text: "Daughter Priya lives in Hyderabad; elder misses her daily morning calls.",
    addedAt: "2026-10-06",
  },
  {
    id: "mem-3",
    category: "preference",
    text: "Prefers herbal warm cumin water after dinner; finds it soothing for sleep.",
    addedAt: "2026-10-07",
  },
  {
    id: "mem-4",
    category: "hobby",
    text: "Enjoys listening to Annamacharya Sankeerthanas and old classic melodies in the afternoon.",
    addedAt: "2026-10-08",
  },
];

const defaultMedications: Medication[] = [
  {
    id: "med-1",
    name: "Metformin (Glycomet)",
    dosage: "500 mg - 1 Tablet",
    scheduledTime: "08:30",
    instructions: "Take with warm water after morning breakfast",
    remainingPills: 18,
    refillThreshold: 5,
    status: "taken_confirmed",
    lastTakenAt: "08:35 AM",
  },
  {
    id: "med-2",
    name: "Telmisartan (BP)",
    dosage: "40 mg - 1 Tablet",
    scheduledTime: "09:00",
    instructions: "Once daily in the morning",
    remainingPills: 22,
    refillThreshold: 6,
    status: "taken_confirmed",
    lastTakenAt: "09:02 AM",
  },
  {
    id: "med-3",
    name: "Calcium & Vitamin D3 (Shelcal)",
    dosage: "500 mg - 1 Tablet",
    scheduledTime: "13:30",
    instructions: "After lunch, do not take on empty stomach",
    remainingPills: 12,
    refillThreshold: 5,
    status: "due",
  },
  {
    id: "med-4",
    name: "Atorvastatin (Lipitor)",
    dosage: "10 mg - 1 Tablet",
    scheduledTime: "21:00",
    instructions: "Night dose before sleep",
    remainingPills: 14,
    refillThreshold: 5,
    status: "upcoming",
  },
];

const defaultRoutines: RoutineItem[] = [
  {
    id: "rout-1",
    title: "Morning Wake Up & Warm Water",
    category: "morning",
    scheduledTime: "06:30",
    status: "confirmed",
    confirmedAt: "06:40 AM",
  },
  {
    id: "rout-2",
    title: "Balcony Garden Walking & Sun Exposure",
    category: "activity",
    scheduledTime: "07:30",
    status: "confirmed",
    confirmedAt: "07:45 AM",
  },
  {
    id: "rout-3",
    title: "Idli / Upma Breakfast & Morning Dose",
    category: "meal",
    scheduledTime: "08:30",
    status: "confirmed",
    confirmedAt: "08:35 AM",
  },
  {
    id: "rout-4",
    title: "Afternoon Balanced Lunch & Rest",
    category: "meal",
    scheduledTime: "13:00",
    status: "pending",
  },
  {
    id: "rout-5",
    title: "Evening Chai & Tulsi Garden Check",
    category: "activity",
    scheduledTime: "17:00",
    status: "pending",
  },
  {
    id: "rout-6",
    title: "Light Dinner & Nighttime Medication",
    category: "meal",
    scheduledTime: "20:30",
    status: "pending",
  },
];

const defaultMoodLogs: MoodLog[] = [
  {
    id: "m-1",
    date: "2026-10-06",
    time: "10:00 AM",
    mood: "feeling_good",
    notes: "Spoke with grandson Rohan on video call.",
  },
  {
    id: "m-2",
    date: "2026-10-07",
    time: "02:30 PM",
    mood: "feeling_lonely",
    notes: "House felt quiet in the afternoon; AASRA chatted about gardening.",
  },
  {
    id: "m-3",
    date: "2026-10-08",
    time: "11:00 AM",
    mood: "feeling_okay",
    notes: "Resting well, mild knee stiffness.",
  },
  {
    id: "m-4",
    date: "2026-10-09",
    time: "09:30 AM",
    mood: "feeling_good",
    notes: "Enjoyed morning tea, finished morning walks.",
  },
];

const defaultPrimaryContact: TrustedContact = {
  name: "Priya Rao",
  relationship: "Daughter (Hyderabad)",
  phone: "+91 98480 12345",
  notifyOnDeviation: true,
  notifyOnEmergency: true,
};

const defaultSecondaryContact: TrustedContact = {
  name: "Suresh Rao",
  relationship: "Son (Bengaluru)",
  phone: "+91 98490 67890",
  notifyOnDeviation: false,
  notifyOnEmergency: true,
};

const AasraContext = createContext<AasraContextType | undefined>(undefined);

export const AasraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("aasra_profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  // Memories
  const [memories, setMemories] = useState<StoredMemory[]>(() => {
    const saved = localStorage.getItem("aasra_memories");
    return saved ? JSON.parse(saved) : defaultMemories;
  });

  // Medications
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem("aasra_medications");
    return saved ? JSON.parse(saved) : defaultMedications;
  });

  // Routines
  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    const saved = localStorage.getItem("aasra_routines");
    return saved ? JSON.parse(saved) : defaultRoutines;
  });

  // Mood Logs
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => {
    const saved = localStorage.getItem("aasra_moods");
    return saved ? JSON.parse(saved) : defaultMoodLogs;
  });

  // Contacts
  const [primaryContact, setPrimaryContact] = useState<TrustedContact>(() => {
    const saved = localStorage.getItem("aasra_primary_contact");
    return saved ? JSON.parse(saved) : defaultPrimaryContact;
  });

  const [secondaryContact, setSecondaryContact] = useState<TrustedContact>(() => {
    const saved = localStorage.getItem("aasra_secondary_contact");
    return saved ? JSON.parse(saved) : defaultSecondaryContact;
  });

  // Demo Alerts
  const [demoAlerts, setDemoAlerts] = useState<DemoAlertMessage[]>(() => {
    const saved = localStorage.getItem("aasra_demo_alerts");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "alert-init",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: "routine_deviation",
            recipientName: "Priya Rao (Daughter)",
            recipientPhone: "+91 98480 12345",
            message: "Routine update: Kamala Amma confirmed morning walk & breakfast at 8:35 AM.",
            status: "delivered",
          },
        ];
  });

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "msg-1",
        sender: "aasra",
        text: "Namaskaram Amma! Ela unnaru ee roju? (Hello Amma! How are you feeling today?) I am here by your side.",
        timestamp: "09:00 AM",
      },
    ];
  });

  // App-level state
  const [activeRole, setActiveRole] = useState<"elder" | "caregiver">("elder");
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [activeMedicationPrompt, setActiveMedicationPrompt] = useState<Medication | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem("aasra_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("aasra_memories", JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem("aasra_medications", JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem("aasra_routines", JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem("aasra_moods", JSON.stringify(moodLogs));
  }, [moodLogs]);

  useEffect(() => {
    localStorage.setItem("aasra_primary_contact", JSON.stringify(primaryContact));
    localStorage.setItem("aasra_secondary_contact", JSON.stringify(secondaryContact));
  }, [primaryContact, secondaryContact]);

  useEffect(() => {
    localStorage.setItem("aasra_demo_alerts", JSON.stringify(demoAlerts));
  }, [demoAlerts]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addMemory = (category: StoredMemory["category"], text: string) => {
    const newMem: StoredMemory = {
      id: "mem-" + Date.now(),
      category,
      text,
      addedAt: new Date().toISOString().split("T")[0],
    };
    setMemories((prev) => [newMem, ...prev]);
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAllMemories = () => {
    setMemories([]);
  };

  const updateMedicationStatus = (
    id: string,
    status: Medication["status"],
    note?: string
  ) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          return {
            ...med,
            status,
            lastTakenAt:
              status === "taken_confirmed"
                ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : med.lastTakenAt,
            remainingPills:
              status === "taken_confirmed"
                ? Math.max(0, med.remainingPills - 1)
                : med.remainingPills,
          };
        }
        return med;
      })
    );
  };

  const addMedication = (med: Omit<Medication, "id" | "status">) => {
    const newMed: Medication = {
      ...med,
      id: "med-" + Date.now(),
      status: "upcoming",
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const confirmRoutine = (id: string, note?: string) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "confirmed",
              confirmedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              explanationNote: note,
            }
          : r
      )
    );
  };

  const explainRoutineDeviation = (id: string, reason: string) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "explained",
              explanationNote: reason,
            }
          : r
      )
    );
  };

  const resetRoutinesForDay = () => {
    setRoutines((prev) =>
      prev.map((r) => ({
        ...r,
        status: "pending",
        confirmedAt: undefined,
        explanationNote: undefined,
      }))
    );
  };

  const logMood = (mood: MoodLog["mood"], notes?: string) => {
    const entry: MoodLog = {
      id: "mood-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mood,
      notes,
    };
    setMoodLogs((prev) => [entry, ...prev]);
  };

  const updateContacts = (
    primary: Partial<TrustedContact>,
    secondary?: Partial<TrustedContact>
  ) => {
    setPrimaryContact((prev) => ({ ...prev, ...primary }));
    if (secondary) {
      setSecondaryContact((prev) => ({ ...prev, ...secondary }));
    }
  };

  const sendDemoAlert = (
    type: DemoAlertMessage["type"],
    message: string,
    recipient: "primary" | "secondary" | "both" | "services"
  ) => {
    const newAlerts: DemoAlertMessage[] = [];
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (recipient === "primary" || recipient === "both") {
      newAlerts.push({
        id: "alert-" + Date.now() + "-1",
        timestamp: timeStr,
        type,
        recipientName: `${primaryContact.name} (${primaryContact.relationship})`,
        recipientPhone: primaryContact.phone,
        message,
        status: "delivered",
      });
    }

    if (recipient === "secondary" || recipient === "both") {
      newAlerts.push({
        id: "alert-" + Date.now() + "-2",
        timestamp: timeStr,
        type,
        recipientName: `${secondaryContact.name} (${secondaryContact.relationship})`,
        recipientPhone: secondaryContact.phone,
        message,
        status: "delivered",
      });
    }

    if (recipient === "services") {
      newAlerts.push({
        id: "alert-" + Date.now() + "-sos",
        timestamp: timeStr,
        type: "emergency",
        recipientName: "Emergency Services Helpline 112",
        recipientPhone: "112",
        message: `EMERGENCY SOS: ${profile.elderName} reported acute distress or medical assistance requested.`,
        status: "delivered",
      });
    }

    setDemoAlerts((prev) => [...newAlerts, ...prev]);
  };

  const addChatMessage = (msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: "chat-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const clearChatHistory = () => {
    setChatMessages([]);
  };

  return (
    <AasraContext.Provider
      value={{
        profile,
        updateProfile,
        memories,
        addMemory,
        deleteMemory,
        clearAllMemories,
        medications,
        updateMedicationStatus,
        addMedication,
        deleteMedication,
        routines,
        confirmRoutine,
        explainRoutineDeviation,
        resetRoutinesForDay,
        moodLogs,
        logMood,
        primaryContact,
        secondaryContact,
        updateContacts,
        demoAlerts,
        sendDemoAlert,
        chatMessages,
        addChatMessage,
        clearChatHistory,
        activeRole,
        setActiveRole,
        emergencyActive,
        setEmergencyActive,
        activeMedicationPrompt,
        setActiveMedicationPrompt,
      }}
    >
      {children}
    </AasraContext.Provider>
  );
};

export const useAasra = () => {
  const context = useContext(AasraContext);
  if (!context) {
    throw new Error("useAasra must be used within an AasraProvider");
  }
  return context;
};
