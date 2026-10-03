import {
  TaskFactory, task, materialsTask, siteTask, clearSoilTask, loosenSoilTask, compostTask, seedCheckTask,
  moistureTask, pestMonitorTask, nutritionTask, problemResponseTask, healthTask,
} from "./helpers";

export interface TransplantCropConfig {
  cropName: string;
  germinationNote: string;
  spacingNote: string;
  readyNote: string;
  pestNote: string;
  supportTitle: string;
  supportInstructions: string[];
  transplantExtra: string[];
}

export function transplantCropTasks(cfg: TransplantCropConfig): TaskFactory[] {
  const name = cfg.cropName;
  return [
    materialsTask(
      "Collect what you need to raise " + name + " seedlings first.",
      [name + " seeds", "Seed tray or small pots with drainage holes", "Light soil mix with well-decomposed compost", "Water source with a gentle sprinkler or fine rose", "Bucket", "Gloves", "Small hoe/khurpi", "Labels or markers"],
      ["Seedlings are raised first, then moved to the main bed later."]
    ),
    siteTask(
      "For the main bed, choose a place that gets full sun for most of the day.",
      ["Also pick a bright, protected spot for the seedling tray, away from heavy rain and harsh midday sun."]
    ),
    task(
      "🪴", "action", "Prepare the Seedling Mix", "Fill your tray or pots with a light, loose mix.",
      [
        "Mix soil with well-decomposed compost so the mix is loose and drains well.",
        "Fill the tray or pots without packing the mix down hard.",
        "Make sure there are drainage holes so water does not collect at the bottom.",
      ],
      ["Mix is loose and light", "Tray or pots filled", "Drainage holes present"]
    ),
    seedCheckTask(name),
    task(
      "💧", "action", "Moisten and Mark the Mix", "Lightly moisten the mix and make shallow holes for the seeds.",
      [
        "Moisten the mix gently so it is damp, not soaked.",
        "Make shallow holes or lines for the seeds. The seeds are small, so they should not go deep.",
        "Label the tray or pots so you remember what is in them.",
      ],
      ["Mix is damp, not soaked", "Shallow holes made", "Tray or pots labelled"]
    ),
    task(
      "🌱", "action", "Sow the " + name + " Seeds", "Sow a few seeds per cell or pot and cover them lightly.",
      [
        "Sow a few seeds in each cell or pot, or spaced along the lines, so that you can keep the strongest later.",
        "Cover with a thin layer of fine soil.",
        "Do not bury the seeds deeply and do not press hard.",
      ],
      ["Seeds sown shallowly", "Covered with a thin layer", "Not pressed hard"]
    ),
    task(
      "💧", "action", "First Watering", "Water gently so the seeds are not washed away.",
      [
        "Water gently with a fine spray or rose.",
        "The aim is to moisten the mix without washing the seeds away.",
        "Avoid flooding and avoid a strong stream directly on the seeds.",
      ],
      ["Watered gently", "No standing water", "Seeds not washed away"]
    ),
    moistureTask,
    task(
      "🔍", "observe", "Moisture and Germination Check", "Check the mix and look for any tiny green shoots.",
      [
        "Check whether the mix is dry. If yes, water gently. If it is still moist, leave it.",
        "Look closely for tiny green shoots.",
        cfg.germinationNote,
      ],
      ["Checked soil moisture", "Looked for seedlings"]
    ),
    task(
      "🔍", "observe", "Germination Watch", "A simple observation day. Check the mix and look for seedlings.",
      [
        "This is an observation day. Nothing special is required.",
        "Check whether the mix is dry and water gently only if it is.",
        "Look for tiny green plants appearing.",
      ],
      ["Checked soil moisture", "Checked for seedlings"]
    ),
    task(
      "🌱", "observe", "Seedlings Appear", "Give new seedlings bright light and gentle care.",
      [
        "Once seedlings appear, make sure they get bright light.",
        "Protect them from heavy rain and harsh midday sun while they are tiny.",
        "If seedlings have not appeared yet, keep checking moisture and look again tomorrow.",
      ],
      ["Seedlings have bright light", "Protected from heavy rain and harsh sun"]
    ),
    moistureTask,
    task(
      "📋", "observe", "Week-Two Review and Damping-Off Watch", "Check seedlings and watch for collapsing stems.",
      [
        "Check how many seedlings have come up and whether they look healthy.",
        "Watch for seedlings that collapse or look pinched at the soil line. This is often called damping-off, and is usually linked to overwatering, crowding and poor airflow.",
        "Water only when the top of the mix is dry, and make sure the tray drains and has airflow.",
      ],
      ["Checked seedling health", "Checked for collapsing stems", "Tray drains and has airflow"]
    ),
    task(
      "✂️", "action", "Thin Crowded Seedlings", "Keep the strongest seedling in each cell or pot.",
      [
        "If more than one seedling is growing in a cell or pot, keep the strongest one.",
        "Snip the weaker seedlings at soil level instead of pulling them, so the roots of the one you keep are not disturbed.",
        "Water gently afterwards if the mix is dry.",
      ],
      ["Checked each cell or pot", "Kept one strong seedling in each"]
    ),
    healthTask,
    moistureTask,
    task(
      "☀️", "observe", "Sunlight Check", "Check that your seedlings are getting enough light.",
      [
        "Seedlings need bright light to grow sturdy.",
        "If they look pale, thin or stretch toward the light, they may need more light.",
        "Move the tray gradually, not suddenly, from heavy shade into strong sun.",
      ],
      ["Checked how much light the seedlings get", "Looked for pale or stretching seedlings"]
    ),
    pestMonitorTask("Possible problems on " + name + " seedlings and plants include " + cfg.pestNote + "."),
    task(
      "🧑‍🌾", "action", "Clear the Main Bed", "Start preparing the main bed while the seedlings grow.",
      [
        "Go to the main bed you chose on Day 2.",
        "Remove stones, plastic, large roots, weeds and any other unwanted material.",
        "Wear gloves while clearing.",
      ],
      ["Stones removed", "Plastic removed", "Weeds removed"]
    ),
    loosenSoilTask,
    compostTask,
    moistureTask,
    task(
      "📏", "action", "Mark the Planting Spots", "Mark where each seedling will go, with space to grow.",
      [
        "Plan spacing for each plant. As a rough guide, keep " + cfg.spacingNote + ".",
        "Mark each spot with a stick or a small stone.",
        "Leave room to walk between plants for watering and harvesting.",
      ],
      ["Spots marked", "Spacing planned", "Room left to walk and harvest"]
    ),
    nutritionTask(),
    task(
      "🌤️", "action", "Start Hardening Off", "Slowly get seedlings used to the outdoors.",
      [
        "Seedlings grown in a protected spot need time to get used to full sun, wind and temperature changes.",
        "Today, give them an hour or two of gentle morning sun, then bring them back to their protected spot.",
        "Keep them watered, because they dry faster outside.",
      ],
      ["Seedlings had gentle morning sun", "Brought back to protection", "Watered if needed"]
    ),
    task(
      "🌤️", "action", "Continue Hardening Off", "Slowly increase the time outdoors.",
      [
        "Give the seedlings a bit more time outdoors than yesterday, and a little more sun.",
        "Protect them from heavy rain and strong wind.",
        "Check the mix for dryness, since seedlings dry out faster outside.",
      ],
      ["More time outdoors than yesterday", "Protected from heavy rain and wind", "Checked moisture"]
    ),
    task(
      "🌤️", "action", "Hardening and Moisture Check", "Keep hardening off and keep seedlings from drying out.",
      [
        "Continue giving the seedlings more time outdoors, building up gradually.",
        "Check moisture. Water if the mix is dry, and do not let it stay soaked.",
        "Watch the seedlings for signs of stress such as wilting or scorched leaves, and back off the sun if you see them.",
      ],
      ["Seedlings outdoors longer", "Checked moisture", "Checked for stress"]
    ),
    task(
      "🪵", "observe", cfg.supportTitle, "Plan for support so you are ready when the plants go in.",
      cfg.supportInstructions,
      ["Decided on a support plan", "Support materials ready"]
    ),
    task(
      "🧺", "action", "Prepare for Transplanting", "Get the seedlings and the main bed ready.",
      [
        "Water the seedlings the day before transplanting so they come out of the mix easily.",
        "Choose the healthiest, sturdiest seedlings.",
        "Plan to transplant in the cooler part of the day, such as evening, to reduce stress.",
      ],
      ["Seedlings watered", "Healthiest seedlings chosen", "Main bed is ready"]
    ),
    task(
      "✅", "observe", "Transplant Readiness Check", "Decide if your seedlings are ready to move to the main bed.",
      [
        "Seedlings are usually ready when they are " + cfg.readyNote + ".",
        "If they are ready, move them gently to the marked spots in the cooler part of the day, handle them by the leaves and root ball, and water them in gently.",
        ...cfg.transplantExtra,
        "If they are not ready yet, keep them in the nursery and check again in a few days. Do not rush them.",
        "Flowering and harvest come after transplanting, so they are beyond this 30-day plan.",
      ],
      ["Checked seedling size and sturdiness", "Transplanted if ready", "Watered in gently"]
    ),
  ];
}