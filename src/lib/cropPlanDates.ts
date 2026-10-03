const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type PlanTimeline = 'not_started' | 'in_progress' | 'past_end';

export interface PlanDayInfo {
  timeline: PlanTimeline;
  rawDay: number;
  currentDay: number;
  daysUntilStart: number;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return toDateKey(parseDateKey(key)) === key;
}

export function addDaysToKey(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function daysBetweenKeys(fromKey: string, toKey: string): number {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toUtc - fromUtc) / MS_PER_DAY);
}

export function getPlanDayInfo(startDateKey: string, todayKey: string, durationDays: number): PlanDayInfo {
  const rawDay = daysBetweenKeys(startDateKey, todayKey) + 1;
  if (rawDay < 1) {
    return { timeline: 'not_started', rawDay, currentDay: 0, daysUntilStart: 1 - rawDay };
  }
  if (rawDay > durationDays) {
    return { timeline: 'past_end', rawDay, currentDay: durationDays, daysUntilStart: 0 };
  }
  return { timeline: 'in_progress', rawDay, currentDay: rawDay, daysUntilStart: 0 };
}

export function getMissedDays(completedDays: number[], info: PlanDayInfo, durationDays: number): number[] {
  if (info.timeline === 'not_started') return [];
  const lastDueDay = info.timeline === 'past_end' ? durationDays : info.currentDay - 1;
  const completed = new Set(completedDays);
  const missed: number[] = [];
  for (let day = 1; day <= lastDueDay; day++) {
    if (!completed.has(day)) missed.push(day);
  }
  return missed;
}

export function isValidTimeString(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function parseTimeString(value: string): { hour: number; minute: number } {
  const [hour, minute] = value.split(':').map(Number);
  return { hour: hour || 0, minute: minute || 0 };
}

export function getDayFireTime(startDateKey: string, day: number, timeString: string): Date {
  const date = parseDateKey(addDaysToKey(startDateKey, day - 1));
  const { hour, minute } = parseTimeString(timeString);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function formatDateKey(key: string): string {
  return parseDateKey(key).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}