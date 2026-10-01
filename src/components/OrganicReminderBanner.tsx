import React from 'react';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { OrganicCareReminder, markReminderDone, snoozeReminder } from '../lib/organicReminders';

interface OrganicReminderBannerProps {
  dueReminders: OrganicCareReminder[];
  onChanged: () => void;
  darkMode?: boolean;
}

export const OrganicReminderBanner: React.FC<OrganicReminderBannerProps> = ({
  dueReminders,
  onChanged,
  darkMode = false,
}) => {
  if (dueReminders.length === 0) return null;

  const handleDone = async (id: string) => {
    await markReminderDone(id);
    onChanged();
  };

  const handleSnooze = async (id: string) => {
    await snoozeReminder(id, 1);
    onChanged();
  };

  return (
    <div className="space-y-2">
      {dueReminders.map((reminder) => (
        <div
          key={reminder.id}
          className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
            darkMode ? 'bg-amber-950/30 border-amber-500/40' : 'bg-amber-50 border-amber-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            <span className="text-xs font-bold truncate">{reminder.label}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleSnooze(reminder.id)}
              className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60 cursor-pointer"
              title="Snooze 1 day"
            >
              <Clock className="w-3.5 h-3.5 opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => handleDone(reminder.id)}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer"
              title="Mark done"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
