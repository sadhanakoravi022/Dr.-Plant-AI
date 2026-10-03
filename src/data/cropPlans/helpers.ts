import { CropPlan, CropPlanId, CropPlanTask, CropTaskKind } from "./types";

export type TaskFactory = (day: number) => CropPlanTask;

export function task(
  icon: string,
  kind: CropTaskKind,
  title: string,
  shortDescription: string,
  instructions: string[],
  checklist: string[]
): TaskFactory {
  return (day) => ({ day, title, icon, kind, shortDescription, instructions, checklist });
}

export function buildPlan(
  meta: { crop: CropPlanId; name: string; shortName: string; icon: string },
  factories: TaskFactory[]
): CropPlan {
  return {
    ...meta,
    durationDays: factories.length,
    tasks: factories.map((factory, index) => factory(index + 1)),
  };
}

export function materialsTask(intro: string, items: string[], notes: string[]): TaskFactory {
  return task(
    "🛒",
    "action",
    "Gather Your Materials",
    intro,
    [
      "You do not need complicated equipment for a small growing area.",
      "Gather: " + items.join(", ") + ".",
      ...notes,
      "If you are buying manure, choose well-decomposed manure or compost, not fresh animal manure.",
    ],
    items
  );
}

export function siteTask(sunText: string, extra: string[] = []): TaskFactory {
  return task(
    "🌱",
    "action",
    "Choose the Place",
    "Pick a spot with the right sunlight, good drainage and easy access.",
    [
      sunText,
      "Water should not remain standing there after rain.",
      "You should be able to reach the plants easily for watering and harvesting.",
      "Avoid a completely shaded spot, a place where rainwater collects, very compacted soil, or a place contaminated with waste or chemicals.",
      ...extra,
    ],
    ["Right amount of sunlight", "No standing water after rain", "Easy to reach", "Not waterlogged or contaminated"]
  );
}

export const clearSoilTask = task(
  "🧑‍🌾",
  "action",
  "Clear the Soil",
  "Remove stones, plastic, roots and weeds from your chosen area.",
  [
    "Remove stones, plastic, large roots, weeds and any other unwanted material.",
    "Wear gloves while clearing.",
    "A clean bed makes every later step easier.",
  ],
  ["Stones removed", "Plastic removed", "Large roots removed", "Weeds removed"]
);

export const loosenSoilTask = task(
  "🧑‍🌾",
  "action",
  "Loosen the Soil",
  "Loosen the soil with a hoe or khurpi so it is not hard and compact.",
  [
    "Loosen the cleared soil using a hoe or khurpi.",
    "The soil should not remain hard and compact.",
    "If drainage looks poor, plan to make a slightly raised bed.",
  ],
  ["Soil loosened across the whole area", "Decided if a raised bed is needed"]
);

export const compostTask = task(
  "🟤",
  "action",
  "Add Compost",
  "Mix well-decomposed compost/FYM thoroughly into the soil.",
  [
    "Add well-decomposed compost/FYM and mix it thoroughly into the soil.",
    "Do not use fresh animal manure.",
    "If drainage is poor, make a slightly raised bed.",
  ],
  ["Compost mixed in thoroughly", "Raised bed made (if drainage is poor)"]
);

export function seedCheckTask(cropName: string, extra: string[] = []): TaskFactory {
  return task(
    "🌱",
    "action",
    "Check Your Seeds",
    "Buy or inspect good-quality " + cropName + " seeds before sowing.",
    [
      "Buy good-quality seeds from a reliable agricultural supplier.",
      "Check that the seed packet is not expired.",
      "Check that the seeds are clean, with no obvious fungal growth or moisture damage.",
      "Check that the variety is suitable for your local season.",
      "As a beginner, do not experiment with complicated seed treatments.",
      ...extra,
    ],
    ["Packet not expired", "Seeds clean", "No fungus or moisture damage", "Variety suits local season"]
  );
}

export const firstWateringTask = task(
  "💧",
  "action",
  "First Watering",
  "Water gently so the soil is moist but the seeds are not washed away.",
  [
    "Water gently after sowing.",
    "The aim is to moisten the soil without washing the seeds away.",
    "Use a gentle watering can or shower rather than a powerful stream.",
    "Avoid flooding the bed, standing water, and a high-pressure hose directly on newly sown seeds.",
  ],
  ["Watered gently", "No flooding or standing water", "Seeds not washed away"]
);

export const moistureTask = task(
  "💧",
  "observe",
  "Check Soil Moisture",
  "Check if the soil is dry. Water only if it needs it.",
  [
    "Check the soil today. Is it dry?",
    "If yes, water gently.",
    "If the soil is still moist, do not water again unnecessarily.",
    "Do not blindly follow the rule of watering every morning and evening. What the soil needs depends on temperature, rain, soil, sunlight and plant growth.",
  ],
  ["Checked the soil", "Watered only if the soil was dry"]
);

export const germinationTask = (note: string) =>
  task(
    "🔍",
    "observe",
    "Moisture and Germination Check",
    "Check the soil again and look for any tiny green shoots.",
    [
      "Check whether the soil is dry. If yes, water gently. If it is still moist, leave it.",
      "Look closely along the rows or spots for tiny green plants.",
      note,
    ],
    ["Checked soil moisture", "Looked for seedlings"]
  );

export const germinationWatchTask = task(
  "🔍",
  "observe",
  "Germination Watch",
  "A simple observation day. Check the soil and look for seedlings.",
  [
    "This is an observation day. Nothing special is required.",
    "Check whether the soil is dry and water gently only if it is.",
    "Look for tiny green plants appearing.",
  ],
  ["Checked soil moisture", "Checked for seedlings"]
);

export const seedlingsWeedsTask = task(
  "🌿",
  "action",
  "Seedlings and Weeds",
  "As seedlings appear, start removing small weeds.",
  [
    "After germination, tiny green plants will appear.",
    "Remove weeds while they are small. Weeds compete with your crop for water, nutrients, sunlight and space.",
    "Be careful not to pull out your own seedlings along with the weeds.",
    "If seedlings have not appeared yet, keep checking moisture and look again tomorrow.",
  ],
  ["Looked for seedlings", "Removed small weeds"]
);

export const moistureSteadyTask = task(
  "💧",
  "observe",
  "Moisture Check",
  "Keep the soil from drying out completely or staying soaked.",
  [
    "Check the soil moisture.",
    "Do not allow the soil to become extremely dry.",
    "Do not keep it permanently soaked.",
    "Water only if needed.",
  ],
  ["Checked soil moisture", "Watered only if needed"]
);

export const weekOneReviewTask = task(
  "📋",
  "observe",
  "End of Week One Review",
  "Review germination, moisture and weeds so far.",
  [
    "Check germination along the rows or spots.",
    "Check soil moisture and water gently only if needed.",
    "Look for weeds and remove any small ones.",
  ],
  ["Checked germination", "Checked moisture", "Checked for weeds"]
);

export const weedTask = task(
  "🌿",
  "action",
  "Weed Removal",
  "Remove weeds while they are small and keep moisture steady.",
  [
    "Check your plants and remove weeds while they are small.",
    "Maintain moisture. Not extremely dry and not permanently soaked.",
    "Look at the plants for any signs of pests or disease.",
  ],
  ["Removed weeds", "Checked moisture"]
);

export const healthTask = task(
  "🔍",
  "observe",
  "Check Plant Health",
  "Look closely at the leaves. Observe first, act later.",
  [
    "Look at the leaves every few days. Today is one of those days.",
    "Just observe. You do not need to spray or treat anything simply because you planted a crop.",
    "Note anything unusual so you can compare over the next few days.",
  ],
  ["Looked at the leaves", "Noted anything unusual"]
);

export function pestMonitorTask(possible: string): TaskFactory {
  return task(
    "🐛",
    "observe",
    "Start Pest Monitoring",
    "Inspect leaves, including underneath, before thinking about any treatment.",
    [
      "Do not spray pesticide simply because you planted a crop. Inspect first.",
      "Check underneath the leaves and around the growing area.",
      "Look for small insects, holes, chewed edges, sticky material, curling leaves, yellowing, spots and wilting.",
      possible,
    ],
    ["Checked under the leaves", "Checked around the growing area", "Looked for holes, spots, curling or yellowing"]
  );
}

export const mulchTask = task(
  "🍂",
  "action",
  "Mulching (Optional)",
  "Optionally add a thin layer of suitable organic mulch.",
  [
    "Mulching is optional.",
    "Use a thin layer of suitable organic mulch such as dry leaves, clean straw or other suitable plant material.",
    "Mulch can help reduce weeds, maintain soil moisture and protect the soil surface.",
    "Do not put a thick, wet layer directly against young plants.",
  ],
  ["Decided whether to mulch", "If mulching: thin layer only", "Mulch not piled against young plants"]
);

export function nutritionTask(extra: string[] = []): TaskFactory {
  return task(
    "🧪",
    "observe",
    "Organic Nutrition",
    "Keep it simple: good soil, well-decomposed compost and proper watering.",
    [
      "For beginners, the approach is good soil, well-decomposed compost and proper watering.",
      "Avoid fresh animal manure directly on the crop.",
      "Avoid excessive fertilizer, unknown homemade chemical mixtures and excessive liquid fertilizer.",
      "Avoid random pesticide or fungicide combinations.",
      "Organic does not mean anything natural is automatically safe.",
      ...extra,
    ],
    ["Understood the simple nutrition approach", "Not using fresh manure or unknown mixtures"]
  );
}

export function sunlightTask(cropName: string, extra: string[] = []): TaskFactory {
  return task(
    "☀️",
    "observe",
    "Sunlight Check",
    "Check that your " + cropName + " is getting enough light.",
    [
      cropName + " needs adequate light for healthy growth.",
      "If plants look unusually weak or stretch toward the light, check whether they receive enough sunlight.",
      "Do not suddenly move a crop from heavy shade into extreme heat without considering the conditions.",
      ...extra,
    ],
    ["Checked how much sunlight the plants get", "Looked for weak or stretching plants"]
  );
}

export const weedsAndMoistureTask = task(
  "🌿",
  "action",
  "Weeds and Moisture",
  "Remove any weeds and keep the soil moisture steady.",
  [
    "Remove weeds so they do not compete with your crop for water, nutrients, sunlight and space.",
    "Check soil moisture. Not extremely dry and not permanently soaked.",
  ],
  ["Removed weeds", "Checked moisture"]
);

export const pestInspectTask = task(
  "🐛",
  "observe",
  "Pest and Disease Inspection",
  "Inspect the leaves, top and underneath, for signs of problems.",
  [
    "Check underneath the leaves and around the growing area.",
    "Look for small insects, holes, chewed edges, sticky material, curling leaves, yellowing, spots and wilting.",
    "If everything looks fine, no action is needed.",
  ],
  ["Checked leaf tops and undersides", "Looked for signs of pests or disease"]
);

export const problemResponseTask = task(
  "🧭",
  "observe",
  "If You Find a Problem",
  "Follow the organic approach: observe, identify, then act gently.",
  [
    "Follow this order: observe, identify the problem, remove badly affected leaves or plants if appropriate, try physical or biological control, and use an appropriate approved organic treatment only if necessary.",
    "Do not follow the habit of seeing an insect and immediately spraying something.",
    "If you are unsure what the problem is, ask your local agriculture office or Krishi Vigyan Kendra.",
    "If you have no problems today, simply keep observing.",
  ],
  ["Understood the order of response", "Acted only if there was a real problem"]
);

export const moistureMulchTask = task(
  "💧",
  "observe",
  "Moisture and Mulch Check",
  "Check the soil moisture and any mulch you added.",
  [
    "Check soil moisture and water gently only if needed.",
    "If you mulched, check that it is still a thin layer and is not pressed against the plants.",
  ],
  ["Checked soil moisture", "Checked mulch (if used)"]
);

export function thinningTask(cropName: string, how: string[]): TaskFactory {
  return task(
    "✂️",
    "action",
    "Thin Crowded Seedlings",
    "Give each " + cropName + " plant room to grow.",
    [
      "If seedlings are crowded, thin them so each plant has room.",
      ...how,
      "Water gently afterwards if the soil is dry.",
    ],
    ["Checked for crowding", "Thinned if needed"]
  );
}

export function growthTask(cropName: string, note: string): TaskFactory {
  return task(
    "🌿",
    "observe",
    "Growth Check",
    "Observe how your " + cropName + " is developing and continue your routine.",
    [
      note,
      "Continue your routine: weed removal, moisture management, pest inspection and general observation.",
      "Every variety and growing condition is different, so compare with your own plants rather than a fixed expectation.",
    ],
    ["Observed plant growth", "Checked moisture", "Checked for weeds"]
  );
}
