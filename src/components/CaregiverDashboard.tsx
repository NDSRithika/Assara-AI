import React, { useState } from "react";
import {
  Users,
  Shield,
  PhoneCall,
  Bell,
  Heart,
  Pill,
  CalendarCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Phone,
  Inbox,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";

export const CaregiverDashboard: React.FC = () => {
  const {
    profile,
    updateProfile,
    medications,
    routines,
    moodLogs,
    primaryContact,
    secondaryContact,
    updateContacts,
    demoAlerts,
    sendDemoAlert,
    addChatMessage,
  } = useAasra();

  const [activeTab, setActiveTab] = useState<"overview" | "contacts" | "inbox" | "safety">("overview");
  const [customCallRequestText, setCustomCallRequestText] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  // Elder asking AASRA to contact family workflow
  const handleTriggerFamilyCallRequest = () => {
    const defaultMsg = `${profile.elderName} meetho konchem sepu matladalani anukuntunnaru. Veelaithe aameku call chesi matladandi. (Kamala Amma wishes to speak with you for a short while. Please call when free.)`;
    const message = customCallRequestText.trim() || defaultMsg;

    sendDemoAlert("call_request", message, "primary");
    setRequestSent(true);

    addChatMessage({
      sender: "system",
      text: `📱 Call request dispatched to ${primaryContact.name} (${primaryContact.phone}): "${message}"`,
    });

    setTimeout(() => setRequestSent(false), 4000);
  };

  const takenMedsCount = medications.filter((m) => m.status === "taken_confirmed").length;
  const confirmedRoutinesCount = routines.filter((r) => r.status === "confirmed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-700" />
            <span>Family & Caregiver Portal</span>
          </h2>
          <p className="text-stone-600 text-sm">
            Monitor elder wellbeing, medication adherence, and receive safety alerts.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "overview" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "contacts" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "inbox" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span>Demo Alert Inbox</span>
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
              {demoAlerts.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-bold uppercase">Medication Adherence</span>
                <div className="text-xl font-black text-stone-900">
                  {takenMedsCount} / {medications.length} Doses Taken
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-bold uppercase">Routine Check-ins</span>
                <div className="text-xl font-black text-stone-900">
                  {confirmedRoutinesCount} / {routines.length} Confirmed
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-bold uppercase">Latest Mood</span>
                <div className="text-xl font-black text-stone-900">
                  {moodLogs[0] ? moodLogs[0].mood.replace("feeling_", "").toUpperCase() : "GOOD"}
                </div>
              </div>
            </div>
          </div>

          {/* Connect Elder with Family Quick Box */}
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Request Family Call on Elder&apos;s Behalf
                </h3>
                <p className="text-xs text-stone-600">
                  Sends an empathetic gentle notification to daughter {primaryContact.name}.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Amma garu meetho konchem sepu matladalani anukuntunnaru..."
                value={customCallRequestText}
                onChange={(e) => setCustomCallRequestText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 bg-white"
              />
              <button
                onClick={handleTriggerFamilyCallRequest}
                disabled={requestSent}
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
              >
                {requestSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Call Request Dispatched!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Call Request</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Today's Schedule & Routine Deviation Audit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
              <h3 className="font-bold text-stone-800 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Today&apos;s Prescription Check</span>
              </h3>
              <div className="space-y-2">
                {medications.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs border border-stone-200"
                  >
                    <div>
                      <span className="font-bold text-stone-900">{m.name}</span> ({m.dosage})
                      <div className="text-stone-500 font-medium">Time: {m.scheduledTime}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        m.status === "taken_confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {m.status === "taken_confirmed" ? "Taken ✓" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
              <h3 className="font-bold text-stone-800 text-base flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-600" />
                <span>Routine Deviation Tracking</span>
              </h3>
              <div className="space-y-2">
                {routines.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs border border-stone-200"
                  >
                    <div>
                      <span className="font-bold text-stone-900">{r.title}</span>
                      {r.explanationNote && (
                        <div className="text-amber-800 font-medium italic">
                          Note: {r.explanationNote}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        r.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "explained"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Contacts */}
      {activeTab === "contacts" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-stone-800">Trusted Emergency Contacts</h3>
          <p className="text-stone-600 text-xs">
            These contacts receive automated SOS alerts and routine check-in messages.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50/40 space-y-3">
              <span className="text-xs font-bold uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                Primary Contact
              </span>
              <div className="text-xl font-bold text-stone-900">{primaryContact.name}</div>
              <div className="text-sm text-stone-600 font-medium">{primaryContact.relationship}</div>
              <div className="text-base font-semibold text-stone-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{primaryContact.phone}</span>
              </div>
              <div className="pt-2 flex gap-2">
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Primary</span>
                </a>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-stone-300 bg-stone-50 space-y-3">
              <span className="text-xs font-bold uppercase text-stone-600 bg-stone-200 px-2 py-0.5 rounded-full">
                Secondary Contact
              </span>
              <div className="text-xl font-bold text-stone-900">{secondaryContact.name}</div>
              <div className="text-sm text-stone-600 font-medium">{secondaryContact.relationship}</div>
              <div className="text-base font-semibold text-stone-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-600" />
                <span>{secondaryContact.phone}</span>
              </div>
              <div className="pt-2 flex gap-2">
                <a
                  href={`tel:${secondaryContact.phone}`}
                  className="px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Secondary</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Demo Alert Inbox */}
      {activeTab === "inbox" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-amber-700" />
                <span>Demo Alert Notification Inbox</span>
              </h3>
              <p className="text-xs text-stone-500">
                Transparent view of SMS & WhatsApp alerts dispatched by AASRA.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
              Demo Simulation Mode
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {demoAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border ${
                  alert.type === "emergency"
                    ? "bg-red-50 border-red-300 text-red-900"
                    : "bg-stone-50 border-stone-200 text-stone-800"
                } space-y-2`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-full uppercase ${
                        alert.type === "emergency"
                          ? "bg-red-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {alert.type.replace("_", " ")}
                    </span>
                    <span>To: {alert.recipientName} ({alert.recipientPhone})</span>
                  </div>
                  <span className="text-stone-500 font-medium">{alert.timestamp}</span>
                </div>

                <p className="text-sm font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-stone-200/60">
                  {alert.message}
                </p>

                <div className="text-[11px] text-stone-500 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivered via AASRA Mock Gateway</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
