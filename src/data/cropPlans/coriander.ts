import {
  buildPlan, task, materialsTask, siteTask, clearSoilTask, loosenSoilTask, compostTask, seedCheckTask,
  firstWateringTask, moistureTask, germinationTask, germinationWatchTask, seedlingsWeedsTask,
  moistureSteadyTask, weekOneReviewTask, healthTask, pestMonitorTask, mulchTask, nutritionTask,
  weedsAndMoistureTask, pestInspectTask, problemResponseTask, moistureMulchTask, thinningTask, growthTask,
} from "./helpers";

export const CORIANDER_PLAN = buildPlan(
  { crop: "coriander", name: "Coriander (Kothimbir)", shortName: "Coriander", icon: "🌿" },
  [
    materialsTask(
      "Collect the simple things you need for a small Coriander area.",
      ["Coriander seeds (whole, dry, meant for sowing)", "Good soil", "Well-decomposed compost/FYM", "Water source", "Bucket", "Gloves", "Small hoe/khurpi", "Rope", "Dry leaves/straw (optional mulch)"],
      []
    ),
    siteTask(
      "Coriander generally prefers cooler conditions. Choose a place with good morning sunlight.",
      ["In hot weather, a spot with some shade in the afternoon can help."]
    ),
    clearSoilTask,
    loosenSoilTask,
    compostTask,
    seedCheckTask("Coriander", [
      "Fresh, whole, dry seeds work best. Seeds that are old or very dusty may sprout poorly.",
    ]),
    task(
      "🌱", "action", "Prepare the Seeds", "Gently split the dry coriander seeds into halves before sowing.",
      [
        "A coriander seed is a round husk that holds two seed halves.",
        "Rub or press the dry seeds gently so the husks split into halves. Do not crush them to powder.",
        "Keep the seeds dry until you sow them.",
      ],
      ["Seeds gently split", "Seeds kept dry"]
    ),
    task(
      "📏", "action", "Make Shallow Rows", "Use a rope to mark straight rows and make shallow furrows.",
      [
        "Use a rope to mark straight rows.",
        "Make shallow furrows. Coriander seeds should not be buried deeply.",
      ],
      ["Rope laid out straight", "Shallow rows made"]
    ),
    task(
      "🌱", "action", "Sow the Coriander Seeds", "Sow seeds along the rows and cover them lightly.",
      [
        "Put the seeds along the rows and distribute them reasonably evenly.",
        "Do not create a pile of seeds in one place.",
        "Cover the seeds with a thin layer of soil and do not press it down hard.",
      ],
      ["Seeds spread along rows", "No piles of seeds", "Covered with a thin layer of soil"]
    ),
    firstWateringTask,
    moistureTask,
    germinationTask("Coriander can be slower to sprout than many leafy crops, often one to two weeks. Be patient if nothing has appeared yet."),
    germinationWatchTask,
    seedlingsWeedsTask,
    moistureSteadyTask,
    weekOneReviewTask,
    thinningTask("Coriander", [
      "Gently remove the weakest seedlings so the remaining plants have a little space.",
      "Be careful not to disturb the roots of the plants you are keeping.",
    ]),
    healthTask,
    pestMonitorTask("Possible problems include aphids and fungal diseases such as leaf spots or powdery mildew."),
    mulchTask,
    nutritionTask(),
    task(
      "☀️", "observe", "Sunlight and Heat Check", "Check light, and watch for stress from hot weather.",
      [
        "Coriander needs adequate light, but hot weather can stress it and make it flower early (bolting).",
        "If flower stalks are forming early, harvesting leaves sooner is often better than waiting.",
        "If plants look weak or stretched, check whether they receive enough light.",
      ],
      ["Checked sunlight", "Checked for early flower stalks", "Checked overall plant strength"]
    ),
    growthTask("Coriander", "Plants should now be developing more feathery leaves."),
    weedsAndMoistureTask,
    pestInspectTask,
    problemResponseTask,
    moistureMulchTask,
    task(
      "👀", "observe", "Check Leaf Size", "Look at how tall and leafy your Coriander has become.",
      [
        "Coriander leaves are often ready to harvest roughly four to six weeks after sowing, once plants are leafy and a good size.",
        "Timing varies with variety, weather and soil, so judge by your own plants.",
        "Keep up weed removal, moisture checks and pest inspection.",
      ],
      ["Looked at plant height and leaf size", "Checked moisture", "Checked for weeds and pests"]
    ),
    task(
      "🧺", "observe", "Prepare for Harvest", "Plan how you will harvest and get ready.",
      [
        "For a single harvest, you can pull whole plants. For repeated harvests, cut outer leaves or stems and leave the center to keep growing.",
        "Harvesting in the cooler part of the day can help maintain freshness.",
        "Keep clean scissors or a knife and a basket ready.",
      ],
      ["Decided on single or repeated harvest", "Harvest tools ready"]
    ),
    task(
      "✂️", "action", "Harvest Readiness Check", "If the leaves are a good size, harvest them.",
      [
        "If the plants are leafy enough, harvest as you planned.",
        "For repeated harvests, leave the growing center so the plant can continue developing.",
        "If the plants are not ready yet, keep up your routine and check again in a few days. Coriander may need a little longer.",
      ],
      ["Checked leaf size", "Harvested if ready", "Left the center to keep growing if harvesting repeatedly"]
    ),
  ]
);