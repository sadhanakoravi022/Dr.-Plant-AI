import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Eye, Hammer, Undo2 } from 'lucide-react';
import { CropPlanTask } from '../data/cropPlans';

interface CropDayTaskCardProps {
  task: CropPlanTask;
  label: string;
  isCompleted: boolean;
  isToday: boolean;
  onComplete: () => void;
  darkMode?: boolean;
}

export const CropDayTaskCard: React.FC<CropDayTaskCardProps> = ({
  task,
  label,
  isCompleted,
  isToday,
  onComplete,
  darkMode = false,
}) => {
  const [ticked, setTicked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setTicked({});
  }, [task.day]);

  const toggle = (index: number) => setTicked((prev) => ({ ...prev, [index]: !prev[index] }));

  return (
    <div
      className={`rounded-3xl border p-4 space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wide text-emerald-600">{label}</span>
        <span
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            task.kind === 'observe'
              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
          }`}
        >
          {task.kind === 'observe' ? <Eye className="w-3 h-3" /> : <Hammer className="w-3 h-3" />}
          {task.kind === 'observe' ? 'Observe & check' : 'Hands-on task'}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className="text-3xl leading-none">{task.icon}</div>
        <div className="min-w-0">
          <h3 className="text-lg font-black tracking-tight leading-tight">{task.title}</h3>
          <p className="text-xs opacity-70 mt-1 leading-relaxed">{task.shortDescription}</p>
        </div>
      </div>

      <div>
        <span className="text-[11px] font-black uppercase tracking-wide opacity-60">Instructions</span>
        <ul className="mt-1.5 space-y-1.5">
          {task.instructions.map((line, index) => (
            <li key={index} className="flex items-start gap-2 text-[13px] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <span className="text-[11px] font-black uppercase tracking-wide opacity-60">Checklist</span>
        <div className="mt-1.5 space-y-1">
          {task.checklist.map((item, index) => {
            const isOn = isCompleted || Boolean(ticked[index]);
            return (
              <button
                key={index}
                type="button"
                onClick={() => toggle(index)}
                disabled={isCompleted}
                className={`w-full flex items-center gap-2 text-left text-xs py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                } ${isOn ? 'opacity-60 line-through' : ''}`}
              >
                {isOn ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 opacity-40 shrink-0" />
                )}
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isCompleted ? (
        <div className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 text-sm font-black">
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onComplete}
          className="w-full py-3 rounded-2xl bg-[#14532D] hover:bg-[#166534] text-white text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98]"
        >
          {isToday ? <CheckCircle2 className="w-4 h-4" /> : <Undo2 className="w-4 h-4" />}
          <span>{isToday ? 'Mark as Completed' : 'Mark This Day as Completed'}</span>
        </button>
      )}
    </div>
  );
};