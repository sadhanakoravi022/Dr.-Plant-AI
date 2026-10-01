import { DetailedOrganicGuide } from '../types';

const FAVORITES_KEY = 'dr_plant_organic_favorites';
const CHECKLIST_KEY_PREFIX = 'dr_plant_organic_checklist_';

export function getFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isFavorite(itemId: string): boolean {
  return getFavoriteIds().includes(itemId);
}

export function toggleFavorite(itemId: string): string[] {
  const current = getFavoriteIds();
  const next = current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch {
    return current;
  }
  return next;
}

export function getChecklistState(itemId: string): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY_PREFIX + itemId);
    return raw ? (JSON.parse(raw) as Record<number, boolean>) : {};
  } catch {
    return {};
  }
}

export function toggleChecklistItem(itemId: string, index: number): Record<number, boolean> {
  const state = getChecklistState(itemId);
  state[index] = !state[index];
  try {
    localStorage.setItem(CHECKLIST_KEY_PREFIX + itemId, JSON.stringify(state));
  } catch {
    return state;
  }
  return state;
}

export function resetChecklist(itemId: string): void {
  try {
    localStorage.removeItem(CHECKLIST_KEY_PREFIX + itemId);
  } catch {
    return;
  }
}

export const ORGANIC_FARMING_TIPS: string[] = [
  'Spray organic solutions in the early morning or late evening — midday heat breaks down active compounds faster.',
  'Always strain fermented organic mixtures through cloth before filling a spray pump to avoid clogging the nozzle.',
  'Rotate different organic sprays across seasons so pests and fungi do not build up resistance to one recipe.',
  'Neem-based sprays work best as prevention, applied before symptoms appear, not as a cure for heavy infection.',
  'Never spray organic pesticides on flowering crops during peak bee activity hours to protect pollinators.',
  'Store fermented mixtures like Jeevamrutha in a shaded, cool place — direct sunlight kills the beneficial microbes.',
  'A healthy soil with compost and cow-dung inputs reduces disease pressure more than any spray applied after infection.',
  'Test any new organic mixture on a few leaves first and wait 24 hours before spraying the whole field.',
  'Cow urine-based sprays are more effective when the urine is aged at least 5-7 days before use.',
  'Mixing too many organic recipes together can reduce effectiveness — follow one recipe at a time per application cycle.',
  'Companion planting marigold near vegetable crops naturally repels several common pests without any spray.',
  'Clean your spray equipment thoroughly after every use — leftover residue can react badly with the next organic batch.',
  'Apply organic soil amendments a few days before expected rain so nutrients soak in rather than wash away.',
  'Diseased leaves removed from the field should be burned or buried away from the crop, not composted directly.',
  'Consistency matters more than strength — a mild organic spray applied on schedule beats a strong one applied rarely.',
];

export function getTodaysTip(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return ORGANIC_FARMING_TIPS[dayOfYear % ORGANIC_FARMING_TIPS.length];
}

export function buildRecipeShareText(guide: DetailedOrganicGuide, cropDiseaseLabel: string): string {
  const lines = [
    `Dr Plant AI - Organic Vault`,
    `${guide.title} (${cropDiseaseLabel})`,
    '',
    `Target: ${guide.targetPathogen}`,
    '',
    'Ingredients:',
    ...guide.ingredients.map((ing) => `- ${ing}`),
    '',
    'Preparation:',
    ...guide.preparationSteps.map((step, idx) => `${idx + 1}. ${step}`),
    '',
    `Application: ${guide.applicationRate}`,
    `Fermentation time: ${guide.fermentationTime}`,
    `Shelf life: ${guide.shelfLife}`,
    `Cost: ${guide.costPerAcre}`,
  ];
  return lines.join('\n');
}

export async function shareOrCopyRecipe(text: string): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return 'shared';
    }
  } catch {
    return 'failed';
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}