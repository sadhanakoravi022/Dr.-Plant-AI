import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, BellOff, AlertTriangle, PartyPopper, Hourglass } from 'lucide-react';
import { CropPlan, getCropTask } from '../data/cropPlans';
import {
  UserCropPlan,
  markDayCompleted,
  setNotificationTime,
  endPlan,
  getPlanById,
} from '../lib/cropPlanStore';
import {
  formatDateKey,
  getMissedDays,
  getPlanDayInfo,
  toDateKey,
} from '../lib/cropPlanDates';
import {
  cancelDayNotification,
  cancelPlanNotifications,
  describeNotificationMode,
  getNotificationMode,
  requestNotificationPermission,
  showWebReminderIfDue,
  syncPlanNotifications,
} from '../lib/cropPlanNotifications';
import { CropDayStrip } from './CropDayStrip';
import { CropDayTaskCard } from './CropDayTaskCard';

interface CropPlanJourneyViewProps {
  crop: CropPlan;
  plan: UserCropPlan;
  requestedDay?: number | null;
  onBack: () => void;
  onPlanChanged: () => void;
  darkMode?: boolean;
}

function formatMissed(days: number[]): string {
  if (days.length === 1) return `You missed Day ${days[0]}.`;
  const head = days.slice(0, -1).join(', ');
  return `You missed Days ${head} and ${days[days.length - 1]}.`;
}

export const CropPlanJourneyView: React.FC<CropPlanJourneyViewProps> = ({
  crop,
  plan,
  requestedDay = null,
  onBack,
  onPlanChanged,
  darkMode = false,
}) => {
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const [selectedDay, setSelectedDay] = useState<number | null>(requestedDay);
  const [timeDraft, setTimeDraft] = useState(plan.notificationTime || '07:00');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const info = useMemo(
    () => getPlanDayInfo(plan.startDate, todayKey, crop.durationDays),
    [plan.startDate, todayKey, crop.durationDays]
  );
  const missedDays = useMemo(
    () => getMissedDays(plan.completedDays, info, crop.durationDays),
    [plan.completedDays, info, crop.durationDays]
  );

  const mode = getNotificationMode();
  const hasStarted = info.timeline !== 'not_started';
  const viewDay = hasStarted
    ? Math.min(Math.max(selectedDay ?? info.currentDay, 1), info.currentDay)
    : 0;
  const task = viewDay > 0 ? getCropTask(crop, viewDay) : null;
  const isViewingToday = info.timeline === 'in_progress' && viewDay === info.currentDay;
  const progressPercent = Math.round((info.currentDay / crop.durationDays) * 100);

  useEffect(() => {
    const refresh = () => setTodayKey(toDateKey(new Date()));
    const interval = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    if (requestedDay) setSelectedDay(requestedDay);
  }, [requestedDay]);

  useEffect(() => {
    syncPlanNotifications(plan, crop);
  }, [plan.id, plan.notificationTime, plan.completedDays.length, plan.status, plan.startDate, crop]);

  useEffect(() => {
    if (info.timeline !== 'in_progress') return;
    const check = () => showWebReminderIfDue(plan, crop, info.currentDay, new Date());
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [plan, crop, info.timeline, info.currentDay]);

  const handleComplete = useCallback(async () => {
    if (viewDay < 1) return;
    const updated = markDayCompleted(plan.id, viewDay, info.currentDay);
    if (updated) {
      await cancelDayNotification(updated, viewDay);
    }
    onPlanChanged();
  }, [plan.id, viewDay, info.currentDay, onPlanChanged]);

  const handleSaveTime = async () => {
    setPermissionDenied(false);
    const granted = await requestNotificationPermission();
    if (!granted && mode !== 'unsupported') setPermissionDenied(true);
    setNotificationTime(plan.id, timeDraft);
    onPlanChanged();
  };

  const handleTurnOff = async () => {
    setNotificationTime(plan.id, null);
    await cancelPlanNotifications(plan, crop);
    onPlanChanged();
  };

  const handleEndPlan = async (status: 'completed' | 'cancelled') => {
    const latest = getPlanById(plan.id) || plan;
    await cancelPlanNotifications(latest, crop);
    endPlan(plan.id, status);
    onPlanChanged();
    onBack();
  };

  const cardLabel = isViewingToday
    ? "🌱 Today's Task"
    : info.timeline === 'past_end' && viewDay === crop.durationDays
    ? '🌱 Final Day Task'
    : `Day ${viewDay} Review`;

  return (
    <div className="space-y-3.5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All crops
      </button>

      <div
        className={`rounded-3xl p-4 space-y-3 ${
          darkMode ? 'bg-linear-to-br from-emerald-950 to-slate-900 border border-emerald-900' : 'bg-linear-to-br from-emerald-50 to-lime-50 border border-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl leading-none">{crop.icon}</div>
          <div>
            <h2 className="text-base font-black tracking-tight">{crop.shortName}</h2>
            <p className="text-[11px] opacity-70 font-semibold">{crop.durationDays}-Day Growing Journey</p>
          </div>
        </div>

        {hasStarted ? (
          <>
            <div className="flex items-end justify-between">
              <span className="text-sm font-black">
                Day {info.currentDay} of {crop.durationDays}
              </span>
              <span className="text-[11px] opacity-70 font-semibold">
                {plan.completedDays.length} completed
              </span>
            </div>
            <div
              className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={crop.durationDays}
              aria-valuenow={info.currentDay}
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-500 to-lime-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm font-bold">
            <Hourglass className="w-4 h-4 text-amber-500" />
            <span>
              Your plan starts on {formatDateKey(plan.startDate)}
              {info.daysUntilStart > 0 ? ` (in ${info.daysUntilStart} day${info.daysUntilStart === 1 ? '' : 's'})` : ''}.
            </span>
          </div>
        )}
      </div>

      {info.timeline === 'past_end' && (
        <div
          className={`p-3 rounded-2xl border flex items-start gap-2 ${
            darkMode ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
          }`}
        >
          <PartyPopper className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-xs leading-relaxed">
              Your {crop.durationDays}-day journey period is over. You can still review and complete tasks, or finish the plan.
            </p>
            <button
              type="button"
              onClick={() => handleEndPlan('completed')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black cursor-pointer"
            >
              Finish Plan
            </button>
          </div>
        </div>
      )}

      {missedDays.length > 0 && (
        <div
          className={`p-3 rounded-2xl border flex items-start gap-2 ${
            darkMode ? 'bg-red-950/30 border-red-500/40' : 'bg-red-50 border-red-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-black">{formatMissed(missedDays)}</p>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Missed days are not marked as done. Review a missed task, or continue with today. Check your plants as they are now and do not assume they grew on the plan's timing.
            </p>
            <button
              type="button"
              onClick={() => setSelectedDay(missedDays[0])}
              className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 text-xs font-black cursor-pointer"
            >
              Review Day {missedDays[0]}
            </button>
          </div>
        </div>
      )}

      {task && (
        <CropDayTaskCard
          task={task}
          label={cardLabel}
          isCompleted={plan.completedDays.includes(viewDay)}
          isToday={isViewingToday}
          onComplete={handleComplete}
          darkMode={darkMode}
        />
      )}

      {isViewingToday || !hasStarted ? null : (
        <button
          type="button"
          onClick={() => setSelectedDay(null)}
          className="w-full py-2 rounded-2xl text-xs font-black text-emerald-700 dark:text-emerald-400 cursor-pointer"
        >
          Back to {info.timeline === 'past_end' ? 'final day' : "today's task"}
        </button>
      )}

      <div className="space-y-2">
        <span className="text-[11px] font-black uppercase tracking-wide opacity-60">Your Journey</span>
        <CropDayStrip
          totalDays={crop.durationDays}
          currentDay={info.currentDay}
          timeline={info.timeline}
          completedDays={plan.completedDays}
          selectedDay={viewDay}
          onSelectDay={setSelectedDay}
          darkMode={darkMode}
        />
        <p className="text-[10px] opacity-60">Upcoming days stay locked until they arrive.</p>
      </div>

      <div
        className={`rounded-3xl border p-3.5 space-y-2.5 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {plan.notificationTime ? (
            <Bell className="w-4 h-4 text-amber-500" />
          ) : (
            <BellOff className="w-4 h-4 opacity-50" />
          )}
          <span className="text-xs font-black">
            {plan.notificationTime ? `Daily reminder at ${plan.notificationTime}` : 'Daily reminder is off'}
          </span>
        </div>
        <p className="text-[11px] opacity-70 leading-relaxed">{describeNotificationMode(mode)}</p>
        {permissionDenied && (
          <p className="text-[11px] text-red-500 font-semibold">
            Notification permission was not granted. Allow notifications in your device or browser settings.
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={timeDraft}
            onChange={(e) => setTimeDraft(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-emerald-600 ${
              darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          />
          <button
            type="button"
            disabled={!timeDraft}
            onClick={handleSaveTime}
            className="px-3 py-2 rounded-xl bg-emerald-600 disabled:opacity-50 text-white text-xs font-black cursor-pointer"
          >
            {plan.notificationTime ? 'Update' : 'Turn On'}
          </button>
          {plan.notificationTime && (
            <button
              type="button"
              onClick={handleTurnOff}
              className={`px-3 py-2 rounded-xl text-xs font-black cursor-pointer ${
                darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Off
            </button>
          )}
        </div>
      </div>

      <div className="pt-1 pb-2 text-center">
        {confirmEnd ? (
          <div className="space-y-2">
            <p className="text-xs opacity-80">Stop this plan? Your progress will no longer be shown here.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleEndPlan('cancelled')}
                className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-black cursor-pointer"
              >
                Yes, stop plan
              </button>
              <button
                type="button"
                onClick={() => setConfirmEnd(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                  darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Keep going
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmEnd(true)}
            className="text-[11px] font-bold opacity-50 hover:opacity-100 cursor-pointer"
          >
            Stop this plan
          </button>
        )}
      </div>
    </div>
  );
};