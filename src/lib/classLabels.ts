import { PathogenType } from '../types';

export const LEGACY_PLANTVILLAGE_CLASSES = [
  'Apple___Apple_scab',
  'Apple___Black_rot',
  'Apple___Cedar_apple_rust',
  'Apple___healthy',
  'Blueberry___healthy',
  'Cherry_(including_sour)___Powdery_mildew',
  'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
  'Corn_(maize)___Common_rust_',
  'Corn_(maize)___Northern_Leaf_Blight',
  'Corn_(maize)___healthy',
  'Grape___Black_rot',
  'Grape___Esca_(Black_Measles)',
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
  'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)',
  'Peach___Bacterial_spot',
  'Peach___healthy',
  'Pepper,_bell___Bacterial_spot',
  'Pepper,_bell___healthy',
  'Potato___Early_blight',
  'Potato___Late_blight',
  'Potato___healthy',
  'Raspberry___healthy',
  'Soybean___healthy',
  'Squash___Powdery_mildew',
  'Strawberry___Leaf_scorch',
  'Strawberry___healthy',
  'Tomato___Bacterial_spot',
  'Tomato___Early_blight',
  'Tomato___Late_blight',
  'Tomato___Leaf_Mold',
  'Tomato___Septoria_leaf_spot',
  'Tomato___Spider_mites Two-spotted_spider_mite',
  'Tomato___Target_Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
  'Tomato___Tomato_mosaic_virus',
  'Tomato___healthy',
];

export async function fetchClassLabels(url: string): Promise<string[] | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    if (/^\s*</.test(text)) return null;
    const labels = text
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return labels.length > 0 ? labels : null;
  } catch {
    return null;
  }
}

const clean = (value: string) => value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

function tidyDisease(crop: string, disease: string): string {
  let result = disease;
  const prefix = crop.toLowerCase() + ' ';
  if (result.toLowerCase().startsWith(prefix) && result.length > prefix.length) {
    result = result.slice(prefix.length);
  }
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function guessPathogenType(disease: string): PathogenType {
  const d = disease.toLowerCase();
  if (/\bhealthy\b|\bnormal\b|no disease/.test(d)) return 'healthy';
  if (/virus|mosaic|yellow leaf curl|streak|mottle|ringspot|stunt/.test(d)) return 'virus';
  if (/bacterial|bacteria|greening|haunglongbing|xanthomonas/.test(d)) return 'bacteria';
  if (/mite|insect|\bpest\b|aphid|thrips|whitefly|hopper|borer|miner|beetle|caterpillar|worm|weevil|\bbug\b/.test(d)) return 'pest';
  return 'fungus';
}

export function parseClassName(className: string): { crop: string; disease: string; pathogenType: PathogenType } {
  let crop: string;
  let disease: string;

  if (className.includes('___')) {
    const [first, ...rest] = className.split('___');
    crop = clean(first || className);
    disease = clean(rest.join(' ')) || 'Unknown';
  } else {
    const dash = className.search(/\s[-\u2013\u2014]\s/);
    if (dash > 0) {
      crop = clean(className.slice(0, dash));
      disease = clean(className.slice(dash).replace(/^\s[-\u2013\u2014]\s/, '')) || 'Unknown';
    } else {
      const words = clean(className).split(' ');
      crop = words[0] || className;
      disease = words.slice(1).join(' ') || 'Unknown';
    }
  }

  disease = tidyDisease(crop, disease);
  return { crop, disease, pathogenType: guessPathogenType(disease) };
}

export function resolveTreatmentId(className: string): string {
  const { crop, disease, pathogenType } = parseClassName(className);
  if (pathogenType === 'healthy') return 'crop_healthy_general';

  const c = crop.toLowerCase();
  const d = disease.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  if (c.includes('tomato') && /\bearly blight\b/.test(d)) return 'tomato_early_blight';
  if (c.includes('potato') && /\blate blight\b/.test(d)) return 'potato_late_blight';
  if (/\b(corn|maize)\b/.test(c) && /\bcommon rust\b|^rust$/.test(d)) return 'corn_common_rust';
  if (c.includes('apple') && /\bscab\b/.test(d)) return 'apple_scab';
  if (c.includes('tomato') && /yellow leaf curl|\btylcv\b|\bylcv\b/.test(d)) return 'tomato_yellow_leaf_curl';
  if (/\b(pepper|capsicum)\b/.test(c) && !/\bchil+i\b/.test(c) && /bacterial (leaf )?spot/.test(d)) return 'pepper_bacterial_spot';

  return 'general_disease_care';
}