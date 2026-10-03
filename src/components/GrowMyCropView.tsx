import React, { useCallback, useEffect, useState } from 'react';
import { Sprout, Lock, Crown, ChevronRight } from 'lucide-react';
import { CROP_PLAN_CATALOG, getCropPlan } from '../data/cropPlans';
import { getActivePlan, startPlan } from '../lib/cropPlanStore';
import { getPlanDayInfo, toDateKey } from '../lib/cropPlanDates';
import { cancelPlanNotifications, requestNotificationPermission } from '../lib/cropPlanNotifications';
import { CropPlanStartSheet } from './CropPlanStartSheet';
import { CropPlanJourneyView } from './CropPlanJourneyView';

interface GrowMyCropViewProps {
  isPremiumUnlocked: boolean;
  onRequestUnlock: () => void;
  initialCropId?: string | null;
  initialDay?: number | null;
  darkMode?: boolean;
}

export const GrowMyCropView: React.FC<GrowMyCropViewProps> = ({
  isPremiumUnlocked,
  onRequestUnlock,
  initialCropId = null,
  initialDay = null,
  darkMode = false,
}) => {
  const [openCropId, setOpenCropId] = useState<string | null>(initialCropId);
  const [startingCropId, setStartingCropId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (initialCropId) setOpenCropId(initialCropId);
  }, [initialCropId]);

  useEffect(() => {
    if (isPremiumUnlocked) return;
    CROP_PLAN_CATALOG.forEach((entry) => {
      const crop = getCropPlan(entry.id);
      const plan = getActivePlan(entry.id);
      if (crop && plan) cancelPlanNotifications(plan, crop);
    });
  }, [isPremiumUnlocked]);

  if (!isPremiumUnlocked) {
    return (
      <div
        className={`rounded-3xl border p-5 text-center space-y-3 ${
          darkMode ? 'bg-slate-900 border-amber-500/30' : 'bg-linear-to-b from-amber-50 to-white border-amber-300'
        }`}
      >
        <div className="mx-auto w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-base font-black tracking-tight">Grow My Crop is Premium</h3>
        <p className="text-xs opacity-75 leading-relaxed">
          Get a guided 30-day journey with one clear task each day and daily reminders, starting with Palak.
          Any progress you already made is saved and will be waiting when you unlock Premium.
        </p>
        <button
          type="button"
          onClick={onRequestUnlock}
          className="px-4 py-2.5 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>Unlock Premium</span>
        </button>
      </div>
    );
  }

  const openCrop = openCropId ? getCropPlan(openCropId) : null;
  const openPlan = openCropId ? getActivePlan(openCropId) : null;

  if (openCrop && openPlan) {
    return (
      <CropPlanJourneyView
        key={`${openPlan.id}_${version}`}
        crop={openCrop}
        plan={openPlan}
        requestedDay={initialDay}
        onBack={() => {
          setOpenCropId(null);
          refresh();
        }}
        onPlanChanged={refresh}
        darkMode={darkMode}
      />
    );
  }

  const startingCrop = startingCropId ? getCropPlan(startingCropId) : null;

  const handleSelect = (cropId: string) => {
    setNotice(null);
    const existing = getActivePlan(cropId);
    if (existing) {
      setOpenCropId(cropId);
      return;
    }
    setStartingCropId(cropId);
  };

  const handleStart = async (startDate: string, notificationTime: string | null) => {
    if (!startingCropId) return;
    const result = startPlan({ cropId: startingCropId, startDate, notificationTime });
    if (!result.ok) {
      if (result.reason === 'already_active') {
        setNotice('You already have an active plan for this crop. Continuing it.');
        setOpenCropId(startingCropId);
      } else {
        setNotice('Could not start the plan. Please check the date and try again.');
      }
      setStartingCropId(null);
      return;
    }
    if (notificationTime) await requestNotificationPermission();
    setStartingCropId(null);
    setOpenCropId(startingCropId);
    refresh();
  };

  return (
    <div className="space-y-3" data-version={version}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#14532D] text-white flex items-center justify-center">
          <Sprout className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-tight">Grow My Crop</h2>
          <p className="text-[11px] opacity-70">One task a day, at your pace.</p>
        </div>
      </div>

      {notice && (
        <div className={`p-2.5 rounded-xl text-xs font-semibold ${darkMode ? 'bg-amber-950/30 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
          {notice}
        </div>
      )}

      <div className="space-y-2">
        {CROP_PLAN_CATALOG.map((entry) => {
          const plan = entry.available ? getActivePlan(entry.id) : null;
          const crop = entry.available ? getCropPlan(entry.id) : null;
          let subtitle = 'Coming soon';
          if (entry.available && crop) {
            if (plan) {
              const info = getPlanDayInfo(plan.startDate, toDateKey(new Date()), crop.durationDays);
              subtitle =
                info.timeline === 'not_started'
                  ? 'Plan scheduled'
                  : `Active · Day ${info.currentDay} of ${crop.durationDays}`;
            } else {
              subtitle = `${crop.durationDays}-day guided plan`;
            }
          }
          return (
            <button
              key={entry.id}
              type="button"
              disabled={!entry.available}
              onClick={() => handleSelect(entry.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                entry.available
                  ? darkMode
                    ? 'bg-slate-900 border-slate-800 hover:border-emerald-600 cursor-pointer'
                    : 'bg-white border-slate-200 hover:border-emerald-600 shadow-xs cursor-pointer'
                  : darkMode
                  ? 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl leading-none">{entry.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-black block truncate">{entry.name}</span>
                <span
                  className={`text-[11px] font-semibold ${
                    plan ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-60'
                  }`}
                >
                  {subtitle}
                </span>
              </div>
              {entry.available && <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />}
            </button>
          );
        })}
      </div>

      {startingCrop && (
        <CropPlanStartSheet
          crop={startingCrop}
          onClose={() => setStartingCropId(null)}
          onStart={handleStart}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};