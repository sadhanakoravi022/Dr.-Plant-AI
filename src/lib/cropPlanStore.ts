import { getDeviceId } from './deviceId';
import { getCropPlan } from '../data/cropPlans';
import { isValidDateKey, isValidTimeString } from './cropPlanDates';

export type UserCropPlanStatus = 'active' | 'completed' | 'cancelled';

export interface UserCropPlan {
  id: string;
  ownerId: string;
  cropId: string;
  startDate: string;
  notificationTime: string | null;
  completedDays: number[];
  status: UserCropPlanStatus;
  createdAt: number;
  endedAt?: number;
}

export interface StartPlanInput {
  cropId: string;
  startDate: string;
  notificationTime: string | null;
}

export interface StartPlanResult {
  ok: boolean;
  plan?: UserCropPlan;
  reason?: 'unknown_crop' | 'invalid_date' | 'invalid_time' | 'already_active';
  existing?: UserCropPlan;
}

const STORAGE_KEY = 'dr_plant_crop_plans_v1';

function readAll(): UserCropPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UserCropPlan[]) : [];
  } catch {
    return [];
  }
}

function writeAll(plans: UserCropPlan[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
}

function createId(): string {
  return `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function ownedPlans(): UserCropPlan[] {
  const ownerId = getDeviceId();
  return readAll().filter((plan) => plan.ownerId === ownerId);
}

export function getAllPlans(): UserCropPlan[] {
  return ownedPlans();
}

export function getActivePlan(cropId: string): UserCropPlan | null {
  return ownedPlans().find((plan) => plan.cropId === cropId && plan.status === 'active') || null;
}

export function getPlanById(planId: string): UserCropPlan | null {
  return ownedPlans().find((plan) => plan.id === planId) || null;
}

export function startPlan(input: StartPlanInput): StartPlanResult {
  const crop = getCropPlan(input.cropId);
  if (!crop) return { ok: false, reason: 'unknown_crop' };
  if (!isValidDateKey(input.startDate)) return { ok: false, reason: 'invalid_date' };
  if (input.notificationTime !== null && !isValidTimeString(input.notificationTime)) {
    return { ok: false, reason: 'invalid_time' };
  }

  const existing = getActivePlan(input.cropId);
  if (existing) return { ok: false, reason: 'already_active', existing };

  const plan: UserCropPlan = {
    id: createId(),
    ownerId: getDeviceId(),
    cropId: input.cropId,
    startDate: input.startDate,
    notificationTime: input.notificationTime,
    completedDays: [],
    status: 'active',
    createdAt: Date.now(),
  };

  const all = readAll();
  all.push(plan);
  writeAll(all);
  return { ok: true, plan };
}

function updatePlan(planId: string, mutate: (plan: UserCropPlan) => void): UserCropPlan | null {
  const ownerId = getDeviceId();
  const all = readAll();
  const target = all.find((plan) => plan.id === planId && plan.ownerId === ownerId);
  if (!target) return null;
  mutate(target);
  writeAll(all);
  return target;
}

export function markDayCompleted(planId: string, day: number, maxAllowedDay: number): UserCropPlan | null {
  return updatePlan(planId, (plan) => {
    if (plan.status !== 'active') return;
    if (!Number.isInteger(day) || day < 1 || day > maxAllowedDay) return;
    if (plan.completedDays.includes(day)) return;
    plan.completedDays = [...plan.completedDays, day].sort((a, b) => a - b);
  });
}

export function setNotificationTime(planId: string, notificationTime: string | null): UserCropPlan | null {
  if (notificationTime !== null && !isValidTimeString(notificationTime)) return null;
  return updatePlan(planId, (plan) => {
    plan.notificationTime = notificationTime;
  });
}

export function endPlan(planId: string, status: 'completed' | 'cancelled'): UserCropPlan | null {
  return updatePlan(planId, (plan) => {
    plan.status = status;
    plan.endedAt = Date.now();
  });
}