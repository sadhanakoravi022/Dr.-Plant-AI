import { DetailedOrganicGuide, TreatmentVaultItem } from '../types';

export const ORGANIC_MASTERCLASS_GUIDES: Record<string, DetailedOrganicGuide> = {
  tomato_early_blight: {
    title: 'Vedic Sour Buttermilk + Oxidized Copper Broth (Khatti Chhachh)',
    subtitle: 'Curative bio-fungicide that halts Alternaria mycelium and creates a protective lactic acid biofilm',
    targetPathogen: 'Alternaria solani (Early Blight Fungus)',
    ingredients: [
      '5.0 Liters fresh fermented cow buttermilk (aged 5–7 days in shade)',
      '1 piece pure oxidized copper wire or plate (approx. 100g)',
      '100 Liters clean borewell or rainwater',
      '50g organic soap nut (Reetha) extract as natural surfactant sticker'
    ],
    preparationSteps: [
      'Pour 5L of aged, highly acidic buttermilk into an earthen pot or food-grade HDPE container (strictly avoid iron or aluminum).',
      'Completely submerge the cleaned copper plate/wire into the buttermilk.',
      'Cover the container with a breathable cotton cloth and leave in dark shade at 25-30°C for 7 to 10 days until liquid develops a greenish-blue copper-lactate hue.',
      'Remove copper plate and filter liquid through a 3-layer muslin cloth to prevent nozzle clogging in knapsack sprayers.',
      'Blend in the filtered Reetha soap extract as an organic spreader and surfactant.'
    ],
    applicationRate: '750 mL to 1.0 Liter concentrate per 15L Knapsack Sprayer (diluted with 14L clean water). Spray 150-200L diluted mix per acre during low-sun hours (4 PM - 6 PM).',
    fermentationTime: '7 to 10 Days in earthen pot',
    shelfLife: '30 Days (keep sealed in cool shade)',
    phiInterval: '0 Days (100% Food-Safe & Residue-Free)',
    ecologicalSafety: 'Harmless to honeybees, ladybug predators, and soil earthworms',
    costPerAcre: '₹65 ($0.78) per acre application',
    reminderIntervalDays: 7
  },

  potato_late_blight: {
    title: '5% Cold-Pressed Neem Seed Kernel Extract (NSKE) + Cow Urine Broth',
    subtitle: 'Potent botanical oomycete inhibitor targeting Phytophthora infestans zoospore motility',
    targetPathogen: 'Phytophthora infestans (Late Blight Oomycete)',
    ingredients: [
      '5.0 kg fresh dried Neem Seed Kernels (Azadirachta indica)',
      '10 Liters fresh indigenous cow urine (Gomutra)',
      '100g cold-pressed coconut oil soap flakes',
      '100 Liters clean water'
    ],
    preparationSteps: [
      'Grind 5 kg neem kernels into a coarse powder (do not powder too fine to prevent paste clumping).',
      'Enclose the crushed kernel powder inside a porous cotton cloth bag and submerge in 10L water overnight (12 hours).',
      'Vigorously squeeze the bag repeatedly in the morning until the extract becomes a rich milky brown emulsion.',
      'Dissolve soap flakes in 2L warm water and blend into the neem extract along with 10L cow urine.',
      'Dilute the entire mixture to 100 Liters total volume with clean water.'
    ],
    applicationRate: '1.0 Liter concentrate per 15L Knapsack tank. Spray canopy thoroughly including leaf undersides every 5 to 7 days during damp, overcast weather.',
    fermentationTime: '12 Hours overnight soaking',
    shelfLife: '4 Days (use fresh for maximum azadirachtin potency)',
    phiInterval: '0 Days (Safe to consume immediately after wash)',
    ecologicalSafety: 'Certified Organic (NOP/NPOP compliant)',
    costPerAcre: '₹120 ($1.45) per acre application',
    reminderIntervalDays: 6
  },

  corn_common_rust: {
    title: 'Potassium Bicarbonate + Horticultural Aloe Vera Bio-Shield',
    subtitle: 'Osmotic cell-wall rupturing spray that immediately dries rust pustules (Puccinia sorghi)',
    targetPathogen: 'Puccinia sorghi (Corn Rust Fungus)',
    ingredients: [
      '400g Potassium Bicarbonate (food/agri grade)',
      '2.0 Liters fresh Aloe Vera leaf gel (natural humectant and plant immune booster)',
      '100g pure cold-pressed Neem oil',
      '100 Liters clean water'
    ],
    preparationSteps: [
      'Extract fresh gel from Aloe Vera leaves and blend with 2L water until liquefied.',
      'Dissolve 400g potassium bicarbonate in 10L warm water until completely clear.',
      'Emulsify 100g neem oil with a drop of organic liquid soap in a small bowl.',
      'Combine all three solutions into a 100L spray barrel and agitate thoroughly.'
    ],
    applicationRate: '60g potassium mix + 300mL aloe liquid per 15L Knapsack tank. Spray at first appearance of cinnamon-brown pustules on leaves.',
    fermentationTime: 'Instant preparation (15 mins)',
    shelfLife: '48 Hours',
    phiInterval: '0 Days (Residue-Free)',
    ecologicalSafety: 'Non-toxic to cattle forage and grain consumers',
    costPerAcre: '₹95 ($1.15) per acre application',
    reminderIntervalDays: 7
  },

  apple_scab: {
    title: 'Equisetum (Horsetail) Bio-Silica Decoction + Whey Wash',
    subtitle: 'Natural bio-silica leaf armor preventing Venturia inaequalis ascospores from penetrating leaf cuticle',
    targetPathogen: 'Venturia inaequalis (Apple Scab Fungus)',
    ingredients: [
      '1.0 kg dried Horsetail herb (Equisetum arvense - rich in organic silica)',
      '3.0 Liters sour cow milk whey',
      '150g micronized wettable sulfur (OMRI organic approved)',
      '100 Liters water'
    ],
    preparationSteps: [
      'Simmer 1 kg horsetail herb in 10L water for 45 minutes to extract soluble organic silica.',
      'Allow decoction to steep covered for 24 hours in shade.',
      'Strain liquid through fine muslin and blend with sour whey and wettable sulfur.',
      'Dilute to 100L and spray before predicted wet spring infection windows.'
    ],
    applicationRate: '1.0 Liter per 15L Knapsack tank. Mist thoroughly across green tip and petal fall stages.',
    fermentationTime: '24 Hours steeping',
    shelfLife: '14 Days in sealed container',
    phiInterval: '0 Days (Residue-Free)',
    ecologicalSafety: 'Safe for orchard predatory mites and pollinators',
    costPerAcre: '₹140 ($1.68) per acre application',
    reminderIntervalDays: 10
  },

  pepper_bacterial_spot: {
    title: 'Pseudomonas Fluorescens + Fermented Garlic-Chili Shield',
    subtitle: 'Dual-action bio-antagonist targeting Xanthomonas campestris bacterial biofilms',
    targetPathogen: 'Xanthomonas campestris pv. vesicatoria',
    ingredients: [
      '500g Pseudomonas fluorescens (2×10⁸ CFU/g wettable powder)',
      '500g fresh crushed Garlic cloves (allicin botanical antibiotic)',
      '250g hot green chilies (capsaicin insect/vector repellent)',
      '200g organic unrefined Jaggery (Gur)',
      '100 Liters clean water'
    ],
    preparationSteps: [
      'Grind garlic and chilies into a fine paste and boil gently in 3L water for 15 minutes.',
      'Cool completely to ambient temperature and strain liquid.',
      'In a separate container, dissolve 200g jaggery in 5L water and mix in the Pseudomonas powder.',
      'Let microbial culture activate for 2 hours until mild surface bubbles appear.',
      'Combine strained garlic-chili tea with the activated Pseudomonas broth in 100L water.'
    ],
    applicationRate: '750 mL per 15L Knapsack sprayer. Apply to foliage early morning and drench surrounding root zone.',
    fermentationTime: '2 Hours microbial activation',
    shelfLife: '24 Hours (apply live microbes immediately)',
    phiInterval: '0 Days (Residue-Free)',
    ecologicalSafety: 'Enhances beneficial soil phyllosphere microflora',
    costPerAcre: '₹80 ($0.96) per acre application',
    reminderIntervalDays: 7
  },

  tomato_yellow_leaf_curl: {
    title: 'Dashaparni Ark (10-Leaf Botanical Vector Barrier)',
    subtitle: 'High-potency multi-alkaloid formulation that halts Whitefly (Bemisia tabaci) virus transmission',
    targetPathogen: 'Tomato Yellow Leaf Curl Virus (TYLCV) & Whitefly Vector',
    ingredients: [
      '2.0 kg each of 10 bitter/latex leaves: Neem, Karanj, Calotropis (Aak), Castor, Datura, Papaya, Guava, Marigold, Custard Apple, Moringa',
      '5.0 kg fresh cow dung + 10 Liters cow urine',
      '500g crushed ginger and turmeric rhizomes',
      '200 Liters clean water'
    ],
    preparationSteps: [
      'Chop all 10 leaf varieties into small fragments.',
      'Mix cow dung, cow urine, and crushed ginger/turmeric in a 200L plastic drum with 100L water.',
      'Add all chopped leaves and stir clockwise with a wooden staff for 3 minutes.',
      'Ferment in the shade for 30 to 45 days, stirring twice daily.',
      'Filter thoroughly through a double-layered mesh cloth.'
    ],
    applicationRate: '500 mL per 15L Knapsack tank. Spray every 10 days as a systemic repellent against sucking insect vectors.',
    fermentationTime: '30 to 45 Days fermentation',
    shelfLife: '6 Months (stored in sealed drums in shade)',
    phiInterval: '0 Days (Residue-Free)',
    ecologicalSafety: '100% Biodegradable & Bee-Friendly after drying',
    costPerAcre: '₹110 ($1.32) per acre application',
    reminderIntervalDays: 10
  },

  crop_healthy_general: {
    title: 'Jeevamrutha Microbial Soil & Foliar Tonic',
    subtitle: 'Vedic bio-fertilizer promoting vigorous root immunity, phyllosphere health, and natural pest resistance',
    targetPathogen: 'General Plant Immunity & Pathogen Prevention',
    ingredients: [
      '10 kg fresh indigenous cow dung',
      '10 Liters fresh cow urine',
      '2.0 kg organic Jaggery (Gur)',
      '2.0 kg pulse flour (Besan / chickpea flour)',
      'Handful of virgin soil from field boundary (rich in endemic microbes)',
      '200 Liters clean water'
    ],
    preparationSteps: [
      'In a 200L plastic drum, add 10 kg cow dung and 10L cow urine. Mix thoroughly with a wooden pole.',
      'Add 2 kg jaggery and 2 kg besan flour, followed by the handful of fertile undisturbed soil.',
      'Fill barrel with 200L water and agitate clockwise.',
      'Cover barrel with a damp gunny bag and keep in deep shade for 48 to 72 hours.',
      'Stir for 5 minutes twice daily (morning and evening).'
    ],
    applicationRate: '200 Liters per acre through drip irrigation or 1.5 Liters filtered broth per 15L Knapsack foliar spray twice a month.',
    fermentationTime: '48 to 72 Hours',
    shelfLife: '7 Days (best used on day 3-5)',
    phiInterval: '0 Days (Certified Organic & Edible)',
    ecologicalSafety: 'Multiplies earthworm population and soil organic carbon',
    costPerAcre: '₹45 ($0.54) per acre application',
    reminderIntervalDays: 15
  }
};

export const getDetailedOrganicGuide = (item: TreatmentVaultItem): DetailedOrganicGuide => {
  if (item.detailedOrganicGuide) {
    return item.detailedOrganicGuide;
  }

  // Normalize id: remove sample_ prefix if present
  const cleanId = item.id.replace(/^sample_/, '');
  if (ORGANIC_MASTERCLASS_GUIDES[cleanId]) {
    return ORGANIC_MASTERCLASS_GUIDES[cleanId];
  }

  // Fallback to organic guide based on pathogen type and disease
  return {
    title: `Bio-Dynamic Botanical Protocol for ${item.disease}`,
    subtitle: `Standardized zero-chemical master formulation targeting ${item.pathogenScientificName}`,
    targetPathogen: `${item.pathogenScientificName} (${item.disease})`,
    ingredients: [
      '3.0 Liters fresh sour cow buttermilk or fermented whey',
      '1.0 Liter 5% cold-pressed Neem seed kernel extract',
      '50g botanical soap nut (Reetha) surfactant',
      '100 Liters clean water'
    ],
    preparationSteps: [
      'Dilute sour buttermilk into 20L water and stir vigorously for 5 minutes.',
      'In a separate container, blend cold-pressed neem extract with the soap nut solution.',
      'Combine both solutions into the main spray container and top up to 100 Liters.',
      'Filter thoroughly through a double-layered mesh cloth before pouring into sprayers.'
    ],
    applicationRate: '750 mL per 15L Knapsack tank. Spray during cooler morning or late evening hours.',
    fermentationTime: '48 Hours fermentation',
    shelfLife: '7 Days in shaded containers',
    phiInterval: '0 Days (Residue-Free)',
    ecologicalSafety: 'Safe for pollinators and soil microbiome',
    costPerAcre: '₹85 ($1.02) per acre application',
    reminderIntervalDays: 7
  };
};
