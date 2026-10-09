import React, { useState } from "react";
import {
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  BellRing,
  Plus,
  Trash2,
  Volume2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";
import { Medication, MedicationStatus } from "../types";
import { voiceService } from "../services/voiceService";

export const MedicationManager: React.FC = () => {
  const {
    profile,
    medications,
    updateMedicationStatus,
    addMedication,
    deleteMedication,
    addChatMessage,
    sendDemoAlert,
  } = useAasra();

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeRemindingMed, setActiveRemindingMed] = useState<Medication | null>(null);
  const [snoozeNote, setSnoozeNote] = useState<string>("");

  // Add form fields
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newTime, setNewTime] = useState("08:30");
  const [newInstructions, setNewInstructions] = useState("");
  const [newQuantity, setNewQuantity] = useState("30");
  const [newRefillThreshold, setNewRefillThreshold] = useState("5");

  const handleSimulateReminder = (med: Medication) => {
    setActiveRemindingMed(med);
    updateMedicationStatus(med.id, "reminder_active");

    const announcement = `${profile.salutation}, mee ${med.name} medicine vesukune time ayyindi. Doctor cheppina instructions prakaram ${med.dosage} teesukondi. Vesukunnara?`;
    voiceService.speakBrowserTTS(announcement, "te-IN", profile.speechSpeed);

    addChatMessage({
      sender: "aasra",
      text: `💊 Reminder for ${med.name}: ${announcement}`,
    });
  };

  const handleConfirmTaken = (medId: string) => {
    updateMedicationStatus(medId, "taken_confirmed");
    setActiveRemindingMed(null);

    const confirmationText = `Chala manchidi ${profile.salutation}! Medicine taken record chesanu. Keep staying healthy!`;
    voiceService.speakBrowserTTS(confirmationText, "te-IN", profile.speechSpeed);

    addChatMessage({
      sender: "aasra",
      text: `✅ Confirmed: ${profile.salutation} took their dose.`,
    });
  };

  const handleSnooze = (medId: string) => {
    updateMedicationStatus(medId, "snoozed");
    setActiveRemindingMed(null);
    setSnoozeNote("Snoozed for 10 minutes");

    const snoozeText = `Sare ${profile.salutation}, 10 minutes tarvata malli remind chesthanu. Marchipokandi.`;
    voiceService.speakBrowserTTS(snoozeText, "te-IN", profile.speechSpeed);

    addChatMessage({
      sender: "aasra",
      text: `⏰ Snoozed reminder for 10 minutes.`,
    });
  };

  const handleNeedHelpWithMedication = (med: Medication) => {
    setActiveRemindingMed(null);
    sendDemoAlert(
      "routine_deviation",
      `Medication Help Alert: ${profile.elderName} needs assistance with medicine ${med.name} (${med.dosage}).`,
      "primary"
    );

    const helpVoice = `${profile.salutation}, mee pillalaki alert pampinchamu. Mee doctor or family members meeku help chestharu. Unsure ga unte extra dose eppudu veyoddu.`;
    voiceService.speakBrowserTTS(helpVoice, "te-IN", profile.speechSpeed);

    addChatMessage({
      sender: "aasra",
      text: `⚠️ Family notified for help with ${med.name}. Safety rule: Never take double dose if unsure!`,
    });
  };

  const handleCreateMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addMedication({
      name: newName.trim(),
      dosage: newDosage.trim() || "1 Tablet",
      scheduledTime: newTime,
      instructions: newInstructions.trim() || "Take with water",
      remainingPills: parseInt(newQuantity, 10) || 20,
      refillThreshold: parseInt(newRefillThreshold, 10) || 5,
    });

    setNewName("");
    setNewDosage("");
    setNewInstructions("");
    setShowAddForm(false);
  };

  const getStatusBadge = (status: MedicationStatus) => {
    switch (status) {
      case "taken_confirmed":
        return { text: "Taken Confirmed ✓", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      case "reminder_active":
      case "due":
        return { text: "Due Now 🔔", color: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse" };
      case "snoozed":
        return { text: "Snoozed (10m) ⏰", color: "bg-amber-100 text-amber-800 border-amber-300" };
      case "missed":
        return { text: "Missed / Unconfirmed ⚠️", color: "bg-red-100 text-red-800 border-red-300" };
      default:
        return { text: "Upcoming", color: "bg-stone-100 text-stone-700 border-stone-200" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Pill className="w-7 h-7 text-amber-700" />
            <span>Medication Reminders</span>
          </h2>
          <p className="text-stone-600 text-sm">
            Timely reminders with safe dosage confirmations & refill warnings.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-2xl shadow-sm transition active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "Add Medication"}</span>
        </button>
      </div>

      {/* ACTIVE REMINDER POPUP (Prompted to Elder) */}
      {activeRemindingMed && (
        <div className="p-6 bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-rose-400 rounded-3xl shadow-xl animate-bounce-short">
          <div className="flex items-center gap-3 text-rose-800 mb-3">
            <BellRing className="w-8 h-8 animate-bounce text-rose-600" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-600">
                ACTIVE MEDICATION TIME
              </span>
              <h3 className="text-2xl font-extrabold text-stone-900">
                {activeRemindingMed.name} ({activeRemindingMed.dosage})
              </h3>
            </div>
          </div>

          <p className="text-stone-700 font-medium mb-4 bg-white/70 p-3 rounded-xl border border-rose-200">
            Instructions: {activeRemindingMed.instructions}
          </p>

          {/* The 3 Required Large Accessible Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleConfirmTaken(activeRemindingMed.id)}
              className="py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              <span>I Have Taken It</span>
            </button>

            <button
              onClick={() => handleSnooze(activeRemindingMed.id)}
              className="py-4 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              <span>Remind Me Later (10m)</span>
            </button>

            <button
              onClick={() => handleNeedHelpWithMedication(activeRemindingMed)}
              className="py-4 px-4 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-lg rounded-2xl border border-rose-300 shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-6 h-6 text-rose-600" />
              <span>I Need Help</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Medication Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateMedication}
          className="p-6 bg-white rounded-3xl border border-amber-300 shadow-md space-y-4"
        >
          <h3 className="text-lg font-bold text-stone-800">Add New Prescription</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metformin 500mg"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                Dosage
              </label>
              <input
                type="text"
                placeholder="e.g. 1 Tablet"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                Scheduled Time
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
                Pills In Stock
              </label>
              <input
                type="number"
                min="1"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-stone-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase mb-1">
              Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Take with warm water after morning breakfast"
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-stone-800"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-stone-600 font-semibold rounded-xl hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition"
            >
              Save Medicine
            </button>
          </div>
        </form>
      )}

      {/* Medication List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((med) => {
          const badge = getStatusBadge(med.status);
          const isLowStock = med.remainingPills <= med.refillThreshold;

          return (
            <div
              key={med.id}
              className="p-5 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">{med.name}</h3>
                    <p className="text-stone-600 font-medium text-sm">{med.dosage}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${badge.color}`}
                  >
                    {badge.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-stone-600 text-sm my-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold">Scheduled: {med.scheduledTime}</span>
                  {med.lastTakenAt && (
                    <span className="text-xs text-emerald-700 font-medium">
                      (Taken at {med.lastTakenAt})
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 italic mb-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  {med.instructions}
                </p>

                {/* Stock & Refill Alert */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                  <span className="text-stone-600">
                    Remaining: <strong className="text-stone-800">{med.remainingPills} pills</strong>
                  </span>
                  {isLowStock ? (
                    <span className="text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5" /> Refill Due Soon
                    </span>
                  ) : (
                    <span className="text-stone-400">Stock sufficient</span>
                  )}
                </div>
              </div>

              {/* Action Buttons for this Med */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleSimulateReminder(med)}
                  className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                  title="Simulate Reminder Alert"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Test Reminder</span>
                </button>

                {med.status !== "taken_confirmed" ? (
                  <button
                    onClick={() => handleConfirmTaken(med.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Taken</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">
                    ✓ Dose Confirmed Today
                  </span>
                )}

                <button
                  onClick={() => deleteMedication(med.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  aria-label="Delete medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
