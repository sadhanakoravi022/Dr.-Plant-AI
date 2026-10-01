import React, { useState } from 'react';
import { X, Bell, Sprout, CalendarClock } from 'lucide-react';
import { createOrUpdateReminder, cancelReminder, OrganicCareReminder, ReminderMode } from '../lib/organicReminders';

interface OrganicReminderSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  treatmentItemId: string;
  cropDiseaseLabel: string;
  recipeIntervalDays: number;
  existingReminder?: OrganicCareReminder;
  darkMode?: boolean;
}

export const OrganicReminderSetupModal: React.FC<OrganicReminderSetupModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  treatmentItemId,
  cropDiseaseLabel,
  recipeIntervalDays,
  existingReminder,
  darkMode = false,
}) => {
  const [mode, setMode] = useState<ReminderMode>(existingReminder?.mode || 'recipe');
  const [fixedIntervalDays, setFixedIntervalDays] = useState<number>(
    existingReminder?.mode === 'fixed' ? existingReminder.intervalDays : 1
  );
  const [hour, setHour] = useState<number>(existingReminder?.hour ?? 6);
  const [minute, setMinute] = useState<number>(existingReminder?.minute ?? 0);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const effectiveIntervalDays = mode === 'recipe' ? recipeIntervalDays : fixedIntervalDays;

  const handleSave = async () => {
    setIsSaving(true);
    await createOrUpdateReminder({
      mode,
      label:
        mode === 'recipe'
          ? `Apply organic treatment for ${cropDiseaseLabel}`
          : `Water / check ${cropDiseaseLabel}`,
      treatmentItemId,
      intervalDays: effectiveIntervalDays,
      hour,
      minute,
    });
    setIsSaving(false);
    onSaved();
    onClose();
  };

  const handleRemove = async () => {
    if (!existingReminder) return;
    setIsSaving(true);
    await cancelReminder(existingReminder.id);
    setIsSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        className={`w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-4 space-y-4 ${
          darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black">Organic Care Reminder</h3>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('recipe')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              mode === 'recipe'
                ? 'border-emerald-500 bg-emerald-500/10'
                : darkMode
                ? 'border-slate-800'
                : 'border-slate-200'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-500 mb-1" />
            <span className="text-[11px] font-bold block">Follow this recipe</span>
            <span className="text-[10px] opacity-60">Every {recipeIntervalDays} days (as advised)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('fixed')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              mode === 'fixed'
                ? 'border-emerald-500 bg-emerald-500/10'
                : darkMode
                ? 'border-slate-800'
                : 'border-slate-200'
            }`}
          >
            <CalendarClock className="w-4 h-4 text-emerald-500 mb-1" />
            <span className="text-[11px] font-bold block">Fixed schedule</span>
            <span className="text-[10px] opacity-60">Choose your own interval</span>
          </button>
        </div>

        {mode === 'fixed' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold opacity-60">Repeat every (days)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={fixedIntervalDays}
              onChange={(e) => setFixedIntervalDays(Math.max(1, Number(e.target.value) || 1))}
              className={`w-full px-3 py-2 rounded-xl border text-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold opacity-60">Time of day</label>
          <div className="flex items-center gap-2">
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className={`flex-1 px-3 py-2 rounded-xl border text-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className="opacity-50">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className={`flex-1 px-3 py-2 rounded-xl border text-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          {existingReminder && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl border border-red-400 text-red-500 font-bold text-xs cursor-pointer disabled:opacity-50"
            >
              Remove
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-amber-600 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Reminder'}
          </button>
        </div>

        <p className="text-[10px] opacity-50 text-center">
          Reminders appear on this device and, where supported, as a phone notification.
        </p>
      </div>
    </div>
  );
};
