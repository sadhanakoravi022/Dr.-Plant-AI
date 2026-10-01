const STORAGE_KEY = 'dr_plant_device_id';

export function getDeviceId(): string {
  let existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

  localStorage.setItem(STORAGE_KEY, generated);
  return generated;
}
