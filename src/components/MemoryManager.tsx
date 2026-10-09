import React, { useState } from "react";
import {
  Brain,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";
import { useAasra } from "../context/AasraContext";
import { StoredMemory } from "../types";

export const MemoryManager: React.FC = () => {
  const {
    profile,
    updateProfile,
    memories,
    addMemory,
    deleteMemory,
    clearAllMemories,
  } = useAasra();

  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<StoredMemory["category"]>("hobby");

  const handleToggleMemory = () => {
    updateProfile({ memoryEnabled: !profile.memoryEnabled });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addMemory(newCategory, newText.trim());
    setNewText("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Brain className="w-7 h-7 text-amber-700" />
            <span>Conversational Memory & Preferences</span>
          </h2>
          <p className="text-stone-600 text-sm">
            What AASRA remembers with your consent to make conversations warm and natural.
          </p>
        </div>

        {/* Master Memory Toggle */}
        <button
          onClick={handleToggleMemory}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition active:scale-95 border ${
            profile.memoryEnabled
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-stone-200 text-stone-600 border-stone-300"
          }`}
        >
          {profile.memoryEnabled ? (
            <>
              <ToggleRight className="w-5 h-5 text-emerald-600" />
              <span>Memory Enabled</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-stone-500" />
              <span>Memory Disabled</span>
            </>
          )}
        </button>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Privacy & Dignity Guarantee:</strong> AASRA never invents false memories. All memory items are displayed below and can be edited or deleted anytime. Your conversation details are never sold or shared with third parties.
        </div>
      </div>

      {/* Add Memory Form */}
      {profile.memoryEnabled && (
        <form
          onSubmit={handleAdd}
          className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center"
        >
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 bg-white"
          >
            <option value="hobby">Hobby / Activity</option>
            <option value="family">Family Detail</option>
            <option value="preference">Daily Preference</option>
            <option value="health">Comfort / Health</option>
          </select>

          <input
            type="text"
            required
            placeholder="e.g. Loves listening to MS Subbulakshmi songs in the evening"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800"
          />

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </form>
      )}

      {/* Memory List */}
      <div className="space-y-3">
        {memories.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500">
            <Info className="w-8 h-8 mx-auto mb-2 text-stone-400" />
            <p>No memories stored yet. Tell AASRA about your hobbies or favorite memories!</p>
          </div>
        ) : (
          memories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-sm flex items-center justify-between gap-3 hover:border-amber-300 transition"
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase bg-amber-100 text-amber-800">
                  {mem.category}
                </span>
                <p className="text-stone-800 font-medium text-sm md:text-base">
                  &ldquo;{mem.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 hidden sm:inline">
                  {mem.addedAt}
                </span>
                <button
                  onClick={() => deleteMemory(mem.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Delete this memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {memories.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            onClick={clearAllMemories}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline"
          >
            Clear All Memories
          </button>
        </div>
      )}
    </div>
  );
};
