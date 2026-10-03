import {
  buildPlan, task, materialsTask, siteTask, clearSoilTask, loosenSoilTask, compostTask, seedCheckTask,
  firstWateringTask, moistureTask, germinationTask, germinationWatchTask, seedlingsWeedsTask,
  moistureSteadyTask, weekOneReviewTask, healthTask, pestMonitorTask, mulchTask, nutritionTask,
  sunlightTask, weedsAndMoistureTask, pestInspectTask, problemResponseTask, moistureMulchTask, growthTask,
} from "./helpers";

export const BHENDI_PLAN = buildPlan(
  { crop: "bhendi", name: "Bhendi (Okra)", shortName: "Bhendi", icon: "🌱" },
  [
    materialsTask(
      "Collect the simple things you need to start Bhendi.",
      ["Bhendi seeds", "Good soil", "Well-decomposed compost/FYM", "Water source", "Bucket", "Gloves", "Small hoe/khurpi", "Rope", "Measuring stick or tape", "Dry leaves/straw (optional mulch)"],
      []
    ),
    siteTask(
      "Bhendi is a warm-weather crop. Choose a place that gets full sun for most of the day.",
      ["Bhendi plants grow tall and wide, so leave room around them."]
    ),
    clearSoilTask,
    loosenSoilTask,
    compostTask,
    seedCheckTask("Bhendi"),
    task(
      "📏", "action", "Mark Rows and Planting Spots", "Use a rope and a measuring stick to mark rows and spots with room to grow.",
      [
        "Use a rope to mark straight rows.",
        "Bhendi plants need space. As a rough guide, keep rows about 45 to 60 cm apart and planting spots about 30 to 45 cm apart.",
        "Mark each spot so you can sow with the right spacing tomorrow.",
      ],
      ["Rows marked", "Spots marked with spacing", "Space left to walk and harvest"]
    ),
    task(
      "🌱", "action", "Sow the Bhendi Seeds", "Sow a couple of seeds at each marked spot.",
      [
        "Sow two seeds at each marked spot, about 2 to 3 cm deep.",
        "Cover with soil and do not press it down very hard.",
        "Sowing a spare seed helps, because you will keep only the strongest seedling later.",
      ],
      ["Two seeds at each spot", "Sown at a shallow depth", "Soil not pressed hard"]
    ),
    firstWateringTask,
    moistureTask,
    germinationTask("Bhendi usually sprouts within about a week or two, and faster in warm weather. Cool soil slows it down."),
    germinationWatchTask,
    seedlingsWeedsTask,
    moistureSteadyTask,
    weekOneReviewTask,
    task(
      "✂️", "action", "Keep the Strongest Seedling", "Keep one healthy seedling at each spot.",
      [
        "When seedlings have a few leaves, keep the strongest one at each spot.",
        "Snip or pinch off the weaker seedling at soil level instead of pulling it, so the roots of the one you keep are not disturbed.",
        "If a spot has only one seedling, leave it alone.",
        "If a spot has no seedling after a good while, you can re-sow a seed there.",
      ],
      ["Checked each spot", "Kept one strong seedling per spot"]
    ),
    healthTask,
    pestMonitorTask("Possible problems include aphids, jassids (small leaf-hopping insects) and whiteflies."),
    mulchTask,
    task(
      "💧", "observe", "Steady Moisture Check", "Bhendi likes steady moisture but not waterlogging.",
      [
        "Check the soil. Water gently if it is dry.",
        "Avoid both extremes: very dry soil and soil that stays soaked.",
        "Mulch, if you used it, helps hold moisture.",
      ],
      ["Checked soil moisture", "Watered only if needed"]
    ),
    nutritionTask(),
    sunlightTask("Bhendi", ["Bhendi enjoys warmth and sun, so full sun is usually good for it."]),
    growthTask("Bhendi", "Plants should now be growing taller with larger leaves."),
    weedsAndMoistureTask,
    pestInspectTask,
    task(
      "🧭", "observe", "If You Find a Problem", "Follow the organic approach, and know one thing to watch for.",
      [
        "Follow this order: observe, identify the problem, remove badly affected leaves or plants if appropriate, try physical or biological control, and use an appropriate approved organic treatment only if necessary.",
        "Bhendi can be affected by a virus spread by whiteflies, which shows as yellowing or yellow patterns along the leaf veins.",
        "If you see this, remove badly affected plants if appropriate and ask your local agriculture office or Krishi Vigyan Kendra for advice.",
        "If you have no problems today, simply keep observing.",
      ],
      ["Understood the order of response", "Checked for yellow vein patterns"]
    ),
    moistureMulchTask,
    task(
      "📏", "observe", "Check Plant Strength and Spacing", "Look at how sturdy your plants are and whether they have room.",
      [
        "Check that the plants are sturdy and that leaves from neighbouring plants are not crowding each other.",
        "Check that nothing is shading the plants.",
        "Continue weed removal and moisture checks as needed.",
      ],
      ["Checked plant strength", "Checked spacing", "Checked for weeds"]
    ),
    task(
      "👀", "observe", "Look Ahead: Flowers and Pods", "Know what to expect next.",
      [
        "Bhendi usually starts flowering later than this plan covers, often around six weeks or more after sowing, depending on variety and weather.",
        "Pods are harvested young and tender, usually within a few days after flowering, so do not expect pods yet.",
        "Keep up moisture checks, weed removal and pest inspection while you wait.",
      ],
      ["Understood what comes next", "Checked moisture", "Checked for pests"]
    ),
    task(
      "📋", "observe", "30-Day Growth Review", "Review how your Bhendi has developed over the first 30 days.",
      [
        "Review your plants: Are they growing steadily? Are leaves healthy? Is the soil moisture right?",
        "When pods appear later, harvest them while young and tender and check plants often, because pods can become tough quickly.",
        "Wear gloves when harvesting, as the leaves and stems can irritate the skin.",
        "Your plan covers the first 30 days of establishing the crop. Keep caring for your plants as before.",
      ],
      ["Reviewed plant health", "Understood how to harvest later", "Gloves ready for harvest"]
    ),
  ]
);