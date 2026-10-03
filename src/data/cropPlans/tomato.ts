import { buildPlan } from "./helpers";
import { transplantCropTasks } from "./transplantCrop";

export const TOMATO_PLAN = buildPlan(
  { crop: "tomato", name: "Tomato", shortName: "Tomato", icon: "🍅" },
  transplantCropTasks({
    cropName: "Tomato",
    germinationNote: "Tomato seeds often sprout within about a week, depending on warmth. It is fine if nothing has appeared yet.",
    spacingNote: "plants about 45 to 60 cm apart",
    readyNote: "sturdy, with a thick stem and several true leaves, often around four to six weeks old",
    pestNote: "whiteflies, aphids, caterpillars, and leaf spots or blight-like patches on the leaves",
    supportTitle: "Plan Stakes or Support",
    supportInstructions: [
      "Most tomato plants grow tall and become heavy with fruit, so they need support.",
      "Decide whether you will use stakes, a cage or a string system, and have the materials ready.",
      "Place the support at planting time so you do not damage the roots later.",
    ],
    transplantExtra: [
      "Tomatoes can be planted a little deeper than they grew in the pot, with the lowest leaves removed, because the buried stem can grow extra roots.",
      "Water at the base of the plant, not over the leaves, to help keep the leaves dry.",
    ],
  })
);