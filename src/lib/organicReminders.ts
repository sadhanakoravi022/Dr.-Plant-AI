import { Capacitor } from '@capacitor/core';

export type ReminderMode = 'fixed' | 'recipe';

export interface OrganicCareReminder {
  id: string;
  mode: ReminderMode;
  label: string;
  treatmentItemId?: string;
  intervalDays: number;
  hour: number;
  minute: number;
  nextDueAt: number;
  enabled: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'dr_plant_organic_reminders';
const OCCURRENCES_TO_SCHEDULE = 12;

function readAll(): OrganicCareReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OrganicCareReminder[];
  } catch {
    return [];
  }
}

function writeAll(reminders: OrganicCareReminder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch {
    return;
  }
}

function computeFirstDueAt(hour: number, minute: number): number {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate.getTime();
}

function notificationIdFor(reminderId: string, occurrenceIndex: number): number {
  let hash = 0;
  const key = `${reminderId}_${occurrenceIndex}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
}

async function scheduleNativeNotifications(reminder: OrganicCareReminder): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') return;

    await LocalNotifications.cancel({
      notifications: Array.from({ length: OCCURRENCES_TO_SCHEDULE }, (_, i) => ({
        id: notificationIdFor(reminder.id, i),
      })),
    });

    const notifications = Array.from({ length: OCCURRENCES_TO_SCHEDULE }, (_, i) => {
      const fireAt = reminder.nextDueAt + i * reminder.intervalDays * 24 * 60 * 60 * 1000;
      return {
        id: notificationIdFor(reminder.id, i),
        title: 'Organic Care Reminder',
        body: reminder.label,
        schedule: { at: new Date(fireAt) },
      };
    });

    await LocalNotifications.schedule({ notifications });
  } catch {
    return;
  }
}

async function cancelNativeNotifications(reminderId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({
      notifications: Array.from({ length: OCCURRENCES_TO_SCHEDULE }, (_, i) => ({
        id: notificationIdFor(reminderId, i),
      })),
    });
  } catch {
    return;
  }
}

export function getReminders(): OrganicCareReminder[] {
  return readAll();
}

export function getReminderForTreatment(treatmentItemId: string): OrganicCareReminder | undefined {
  return readAll().find((r) => r.treatmentItemId === treatmentItemId && r.enabled);
}

export interface CreateReminderInput {
  mode: ReminderMode;
  label: string;
  treatmentItemId?: string;
  intervalDays: number;
  hour: number;
  minute: number;
}

export async function createOrUpdateReminder(input: CreateReminderInput): Promise<OrganicCareReminder> {
  const existing = input.treatmentItemId ? getReminderForTreatment(input.treatmentItemId) : undefined;
  const id = existing?.id || `reminder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const reminder: OrganicCareReminder = {
    id,
    mode: input.mode,
    label: input.label,
    treatmentItemId: input.treatmentItemId,
    intervalDays: Math.max(1, input.intervalDays),
    hour: input.hour,
    minute: input.minute,
    nextDueAt: computeFirstDueAt(input.hour, input.minute),
    enabled: true,
    createdAt: existing?.createdAt || Date.now(),
  };

  const all = readAll().filter((r) => r.id !== id);
  all.push(reminder);
  writeAll(all);

  await scheduleNativeNotifications(reminder);
  return reminder;
}

export async function cancelReminder(reminderId: string): Promise<void> {
  const all = readAll().filter((r) => r.id !== reminderId);
  writeAll(all);
  await cancelNativeNotifications(reminderId);
}

export function getDueReminders(): OrganicCareReminder[] {
  const now = Date.now();
  return readAll().filter((r) => r.enabled && r.nextDueAt <= now);
}

export async function markReminderDone(reminderId: string): Promise<void> {
  const all = readAll();
  const reminder = all.find((r) => r.id === reminderId);
  if (!reminder) return;

  reminder.nextDueAt = Date.now() + reminder.intervalDays * 24 * 60 * 60 * 1000;
  writeAll(all);
  await scheduleNativeNotifications(reminder);
}

export async function snoozeReminder(reminderId: string, days: number): Promise<void> {
  const all = readAll();
  const reminder = all.find((r) => r.id === reminderId);
  if (!reminder) return;

  reminder.nextDueAt = Date.now() + days * 24 * 60 * 60 * 1000;
  writeAll(all);
  await scheduleNativeNotifications(reminder);
}
