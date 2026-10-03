import {
  buildPlan, task, materialsTask, siteTask, clearSoilTask, loosenSoilTask, compostTask, seedCheckTask,
  firstWateringTask, moistureTask, germinationTask, germinationWatchTask, seedlingsWeedsTask,
  moistureSteadyTask, weekOneReviewTask, weedTask, healthTask, pestMonitorTask, mulchTask, nutritionTask,
  sunlightTask, weedsAndMoistureTask, pestInspectTask, problemResponseTask, moistureMulchTask,
  thinningTask, growthTask,
} from "./helpers";

export const METHI_PLAN = buildPlan(
  { crop: "methi", name: "Methi (Fenugreek)", shortName: "Methi", icon: "🌿" },
  [
    materialsTask(
      "Collect the simple things you need for a small Methi area.",
      ["Methi seeds", "Good soil", "Well-decomposed compost/FYM", "Water source", "Bucket", "Gloves", "Small hoe/khurpi", "Rope", "Dry leaves/straw (optional mulch)"],
      []
    ),
    siteTask("Choose a place where sunlight reaches the crop for several hours."),
    clearSoilTask,
    loosenSoilTask,
    compostTask,
    seedCheckTask("Methi"),
    task(
      "📏", "action", "Make Shallow Rows", "Use a rope to mark straight rows and make shallow furrows.",
      [
        "Use a rope to mark straight rows.",
        "Make the furrows shallow, not deep. Methi seeds are small, so they should not be buried deeply.",
      ],
      ["Rope laid out straight", "Shallow rows made"]
    ),
    task(
      "🌱", "action", "Sow the Methi Seeds", "Sow seeds along the rows and cover them with a thin layer of soil.",
      [
        "Put the seeds along the rows and distribute them reasonably evenly.",
        "Do not create a pile of seeds in one place.",
        "Cover the seeds with a thin layer of soil.",
        "Do not bury the seeds deeply and do not press the soil hard over them.",
      ],
      ["Seeds spread along rows", "No piles of seeds", "Covered with a thin layer of soil", "Soil not pressed hard"]
    ),
    firstWateringTask,
    moistureTask,
    germinationTask("Methi often sprouts within about a week, but timing varies with temperature and moisture. It is fine if nothing has appeared yet."),
    germinationWatchTask,
    seedlingsWeedsTask,
    moistureSteadyTask,
    weekOneReviewTask,
    thinningTask("Methi", [
      "Gently remove the weakest seedlings, leaving the stronger ones with a little space between them.",
      "Be careful not to disturb the roots of the plants you are keeping.",
    ]),
    healthTask,
    pestMonitorTask("Possible problems include aphids and fungal diseases such as powdery mildew or leaf spots."),
    mulchTask,
    moistureTask,
    nutritionTask(),
    sunlightTask("Methi"),
    growthTask("Methi", "Plants should now be growing taller and developing more leaves."),
    weedsAndMoistureTask,
    pestInspectTask,
    problemResponseTask,
    moistureMulchTask,
    task(
      "👀", "observe", "Check Leaf Size", "Look at how tall and leafy your Methi has become.",
      [
        "Methi leaves are often harvested while the plants are still young and tender, commonly around three to four weeks after sowing.",
        "Timing varies with variety, weather and soil, so judge by your own plants.",
        "Tender, green leafy shoots are the ones to look for. Keep up weed removal and moisture checks.",
      ],
      ["Looked at plant height and leaf size", "Checked moisture", "Checked for weeds and pests"]
    ),
    task(
      "🧺", "observe", "Prepare for Harvest", "Plan how you will harvest and get ready.",
      [
        "For a single harvest, you can pull whole young plants. For repeated harvests, cut the tender tops and leave the lower part of the plant to keep growing.",
        "Harvesting in the cooler part of the day can help maintain freshness.",
        "Keep clean scissors or a knife and a basket ready.",
      ],
      ["Decided on single or repeated harvest", "Harvest tools ready"]
    ),
    task(
      "✂️", "action", "Harvest Readiness Check", "If the leaves are tender and a good size, harvest them.",
      [
        "If the plants look tender and leafy enough, harvest as you planned.",
        "For repeated harvests, cut above the base so the plant can continue growing.",
        "If the plants are not ready yet, keep up your routine and check again in a few days. Varieties differ.",
      ],
      ["Checked leaf size", "Harvested if ready", "Left the base to regrow if harvesting repeatedly"]
    ),
  ]
);