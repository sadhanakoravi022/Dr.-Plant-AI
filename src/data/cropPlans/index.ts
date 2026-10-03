import { CropCatalogEntry, CropPlan, CropPlanId } from './types';
import { PALAK_PLAN } from './palak';
import { METHI_PLAN } from './methi';
import { BHENDI_PLAN } from './bhendi';
import { GREEN_CHILLI_PLAN } from './green-chilli';
import { CORIANDER_PLAN } from './coriander';
import { TOMATO_PLAN } from './tomato';
import { BRINJAL_PLAN } from './brinjal';

export type { CropPlan, CropPlanTask, CropPlanId, CropCatalogEntry, CropTaskKind } from './types';

const CROP_PLANS: Partial<Record<CropPlanId, CropPlan>> = {
  palak: PALAK_PLAN,
  methi: METHI_PLAN,
  bhendi: BHENDI_PLAN,
  'green-chilli': GREEN_CHILLI_PLAN,
  coriander: CORIANDER_PLAN,
  tomato: TOMATO_PLAN,
  brinjal: BRINJAL_PLAN,
};

export const CROP_PLAN_CATALOG: CropCatalogEntry[] = [
  { id: 'palak', name: 'Palak (Spinach)', icon: '🥬', available: true },
  { id: 'methi', name: 'Methi (Fenugreek)', icon: '🌿', available: true },
  { id: 'bhendi', name: 'Bhendi (Okra)', icon: '🌱', available: true },
  { id: 'green-chilli', name: 'Green Chilli', icon: '🌶️', available: true },
  { id: 'coriander', name: 'Coriander (Kothimbir)', icon: '🌿', available: true },
  { id: 'tomato', name: 'Tomato', icon: '🍅', available: true },
  { id: 'brinjal', name: 'Brinjal (Vangi)', icon: '🍆', available: true },
];

export function getCropPlan(id: string): CropPlan | null {
  return CROP_PLANS[id as CropPlanId] || null;
}

export function getCropTask(plan: CropPlan, day: number) {
  return plan.tasks.find((task) => task.day === day) || null;
}