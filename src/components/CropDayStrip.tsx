import React from 'react';
import { Check, Lock, AlertCircle } from 'lucide-react';
import { PlanTimeline } from '../lib/cropPlanDates';

interface CropDayStripProps {
  totalDays: number;
  currentDay: number;
  timeline: PlanTimeline;
  completedDays: number[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  darkMode?: boolean;
}

export const CropDayStrip: React.FC<CropDayStripProps> = ({
  totalDays,
  currentDay,
  timeline,
  completedDays,
  selectedDay,
  onSelectDay,
  darkMode = false,
}) => {
  const completed = new Set(completedDays);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-6 gap-1.5">
      {days.map((day) => {
        const isLocked = timeline === 'not_started' || day > currentDay;
        const isDone = completed.has(day);
        const isToday = timeline === 'in_progress' && day === currentDay;
        const isMissed = !isLocked && !isDone && !isToday;
        const isSelected = selectedDay === day && !isLocked;

        let stateClass = darkMode
          ? 'bg-slate-900 border-slate-800 text-slate-500'
          : 'bg-slate-50 border-slate-200 text-slate-400';
        let label = 'Locked';
        if (isDone) {
          stateClass = 'bg-emerald-600 border-emerald-600 text-white';
          label = 'Completed';
        } else if (isToday) {
          stateClass = 'bg-amber-400 border-amber-400 text-slate-950';
          label = 'Today';
        } else if (isMissed) {
          stateClass = darkMode
            ? 'bg-red-950/40 border-red-500/40 text-red-300'
            : 'bg-red-50 border-red-300 text-red-600';
          label = 'Missed';
        }

        return (
          <button
            key={day}
            type="button"
            disabled={isLocked}
            onClick={() => onSelectDay(day)}
            aria-label={`Day ${day} ${label}`}
            className={`relative h-11 rounded-xl border text-[11px] font-black flex flex-col items-center justify-center transition-all ${stateClass} ${
              isLocked ? 'cursor-not-allowed' : 'cursor-pointer active:scale-95'
            } ${isSelected ? 'ring-2 ring-offset-1 ring-[#14532D] dark:ring-emerald-400 dark:ring-offset-slate-950' : ''}`}
          >
            <span>{day}</span>
            {isDone && <Check className="w-3 h-3" />}
            {isLocked && <Lock className="w-2.5 h-2.5" />}
            {isMissed && <AlertCircle className="w-3 h-3" />}
            {isToday && <span className="text-[8px] font-black leading-none">TODAY</span>}
          </button>
        );
      })}
    </div>
  );
};