import { CropCatalogEntry, CropPlan, CropPlanId } from './types';
import { PALAK_PLAN } from './pakal';

export type { CropPlan, CropPlanTask, CropPlanId, CropCatalogEntry, CropTaskKind } from './types';

const CROP_PLANS: Partial<Record<CropPlanId, CropPlan>> = {
  palak: PALAK_PLAN,
};

export const CROP_PLAN_CATALOG: CropCatalogEntry[] = [
  { id: 'palak', name: 'Palak (Spinach)', icon: '🥬', available: true },
  { id: 'methi', name: 'Methi (Fenugreek)', icon: '🌿', available: false },
  { id: 'bhendi', name: 'Bhendi (Okra)', icon: '🌱', available: false },
  { id: 'green-chilli', name: 'Green Chilli', icon: '🌶️', available: false },
  { id: 'coriander', name: 'Coriander (Kothimbir)', icon: '🌿', available: false },
  { id: 'tomato', name: 'Tomato', icon: '🍅', available: false },
  { id: 'brinjal', name: 'Brinjal (Vangi)', icon: '🍆', available: false },
];

export function getCropPlan(id: string): CropPlan | null {
  return CROP_PLANS[id as CropPlanId] || null;
}

export function getCropTask(plan: CropPlan, day: number) {
  return plan.tasks.find((task) => task.day === day) || null;
}