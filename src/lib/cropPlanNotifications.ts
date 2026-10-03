import { Capacitor } from '@capacitor/core';
import { CropPlan, getCropTask } from '../data/cropPlans';
import { UserCropPlan } from './cropPlanStore';
import { getDayFireTime, toDateKey } from './cropPlanDates';

export type CropNotificationMode = 'native_scheduled' | 'web_while_open' | 'unsupported';

export interface CropNotificationTarget {
  cropId: string;
  day: number;
}

const WEB_SHOWN_KEY_PREFIX = 'dr_plant_crop_plan_web_notified_';

export function getNotificationMode(): CropNotificationMode {
  if (Capacitor.isNativePlatform()) return 'native_scheduled';
  if (typeof window !== 'undefined' && 'Notification' in window) return 'web_while_open';
  return 'unsupported';
}

export function describeNotificationMode(mode: CropNotificationMode): string {
  if (mode === 'native_scheduled') {
    return 'Daily reminders are scheduled on this phone and will arrive even when the app is closed.';
  }
  if (mode === 'web_while_open') {
    return 'In the browser, reminders only appear while Dr.Plant AI is open. Use the Android app for scheduled reminders.';
  }
  return 'This device does not support notifications. Your daily task is still shown here in the app.';
}

function notificationIdFor(planId: string, day: number): number {
  let hash = 7;
  const key = `cropplan_${planId}_${day}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 2147483000;
  }
  return Math.abs(hash) + 1;
}

function buildTitle(crop: CropPlan, day: number): string {
  return `🌱 Dr.Plant AI — ${crop.name.split(' ')[0]} Day ${day}`;
}

function buildBody(crop: CropPlan, day: number): string {
  const task = getCropTask(crop, day);
  if (!task) return 'Tap to view today\'s instructions.';
  return `Today's task:\n${task.shortDescription}\n\nTap to view today's instructions.`;
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const current = await LocalNotifications.checkPermissions();
      if (current.display === 'granted') return true;
      const requested = await LocalNotifications.requestPermissions();
      return requested.display === 'granted';
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission === 'denied') return false;
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
  } catch {
    return false;
  }
  return false;
}

export async function cancelPlanNotifications(plan: UserCropPlan, crop: CropPlan): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({
      notifications: Array.from({ length: crop.durationDays }, (_, i) => ({
        id: notificationIdFor(plan.id, i + 1),
      })),
    });
  } catch {
    return;
  }
}

export async function cancelDayNotification(plan: UserCropPlan, day: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id: notificationIdFor(plan.id, day) }] });
  } catch {
    return;
  }
}

export async function syncPlanNotifications(plan: UserCropPlan, crop: CropPlan): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await cancelPlanNotifications(plan, crop);

  if (plan.status !== 'active' || !plan.notificationTime) return;

  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const completed = new Set(plan.completedDays);
    const now = Date.now();
    const notifications = [];

    for (let day = 1; day <= crop.durationDays; day++) {
      if (completed.has(day)) continue;
      const fireAt = getDayFireTime(plan.startDate, day, plan.notificationTime);
      if (fireAt.getTime() <= now) continue;
      notifications.push({
        id: notificationIdFor(plan.id, day),
        title: buildTitle(crop, day),
        body: buildBody(crop, day),
        schedule: { at: fireAt, allowWhileIdle: true },
        extra: { target: 'crop-plan', cropId: plan.cropId, planId: plan.id, day },
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    return;
  }
}

export function registerNotificationTapHandler(
  onTap: (target: CropNotificationTarget) => void
): () => void {
  if (!Capacitor.isNativePlatform()) return () => undefined;

  let removeListener: (() => void) | null = null;
  let disposed = false;

  import('@capacitor/local-notifications')
    .then(async ({ LocalNotifications }) => {
      const handle = await LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
        const extra = event.notification.extra as { target?: string; cropId?: string; day?: number } | undefined;
        if (extra?.target === 'crop-plan' && extra.cropId) {
          onTap({ cropId: extra.cropId, day: Number(extra.day) || 0 });
        }
      });
      if (disposed) {
        handle.remove();
      } else {
        removeListener = () => handle.remove();
      }
    })
    .catch(() => undefined);

  return () => {
    disposed = true;
    if (removeListener) removeListener();
  };
}

export function showWebReminderIfDue(plan: UserCropPlan, crop: CropPlan, currentDay: number, now: Date): boolean {
  if (Capacitor.isNativePlatform()) return false;
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;
  if (plan.status !== 'active' || !plan.notificationTime) return false;
  if (currentDay < 1 || plan.completedDays.includes(currentDay)) return false;

  const fireAt = getDayFireTime(plan.startDate, currentDay, plan.notificationTime);
  if (now.getTime() < fireAt.getTime()) return false;

  const shownKey = `${WEB_SHOWN_KEY_PREFIX}${plan.id}_${toDateKey(now)}`;
  try {
    if (localStorage.getItem(shownKey)) return false;
    localStorage.setItem(shownKey, '1');
  } catch {
    return false;
  }

  try {
    const notification = new Notification(buildTitle(crop, currentDay), {
      body: buildBody(crop, currentDay),
      tag: `crop-plan-${plan.id}`,
    });
    notification.onclick = () => {
      window.focus();
      window.location.hash = `grow/${plan.cropId}`;
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}