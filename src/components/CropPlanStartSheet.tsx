import React, { useState } from 'react';
import { X, CalendarDays, Bell } from 'lucide-react';
import { CropPlan } from '../data/cropPlans';
import { addDaysToKey, toDateKey } from '../lib/cropPlanDates';

interface CropPlanStartSheetProps {
  crop: CropPlan;
  onClose: () => void;
  onStart: (startDate: string, notificationTime: string | null) => void;
  darkMode?: boolean;
}

export const CropPlanStartSheet: React.FC<CropPlanStartSheetProps> = ({
  crop,
  onClose,
  onStart,
  darkMode = false,
}) => {
  const todayKey = toDateKey(new Date());
  const earliestKey = addDaysToKey(todayKey, -(crop.durationDays - 1));
  const [startDate, setStartDate] = useState(todayKey);
  const [remindersOn, setRemindersOn] = useState(true);
  const [time, setTime] = useState('07:00');

  const dateValid = startDate >= earliestKey && startDate <= todayKey;
  const fieldClass = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-600 ${
    darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        className={`w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-4 space-y-4 ${
          darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black">
            {crop.icon} Start {crop.durationDays}-Day {crop.name.split(' ')[0]} Plan
          </h3>
          <button type="button" onClick={onClose} className="cursor-pointer opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            min={earliestKey}
            max={todayKey}
            onChange={(e) => setStartDate(e.target.value)}
            className={fieldClass}
          />
          <p className="text-[11px] opacity-60 leading-relaxed">
            Day 1 is your start date. The app works out which day you are on automatically.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              Daily reminder
            </label>
            <button
              type="button"
              onClick={() => setRemindersOn((v) => !v)}
              className={`px-3 py-1 rounded-full text-[11px] font-black cursor-pointer ${
                remindersOn ? 'bg-emerald-600 text-white' : darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {remindersOn ? 'On' : 'Off'}
            </button>
          </div>
          {remindersOn && (
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={fieldClass}
            />
          )}
        </div>

        <button
          type="button"
          disabled={!dateValid || (remindersOn && !time)}
          onClick={() => onStart(startDate, remindersOn ? time : null)}
          className="w-full py-3 rounded-2xl bg-[#14532D] hover:bg-[#166534] disabled:opacity-50 text-white text-sm font-black cursor-pointer"
        >
          Start 30-Day Plan
        </button>
      </div>
    </div>
  );
};