export type CropPlanId =
  | 'palak'
  | 'methi'
  | 'bhendi'
  | 'green-chilli'
  | 'coriander'
  | 'tomato'
  | 'brinjal';

export type CropTaskKind = 'action' | 'observe';

export interface CropPlanTask {
  day: number;
  title: string;
  icon: string;
  kind: CropTaskKind;
  shortDescription: string;
  instructions: string[];
  checklist: string[];
}

export interface CropPlan {
  crop: CropPlanId;
  name: string;
  shortName: string;
  icon: string;
  durationDays: number;
  tasks: CropPlanTask[];
}

export interface CropCatalogEntry {
  id: CropPlanId;
  name: string;
  icon: string;
  available: boolean;
}