import { buildPlan } from "./helpers";
import { transplantCropTasks } from "./transplantCrop";

export const GREEN_CHILLI_PLAN = buildPlan(
  { crop: "green-chilli", name: "Green Chilli", shortName: "Green Chilli", icon: "🌶️" },
  transplantCropTasks({
    cropName: "Green Chilli",
    germinationNote: "Chilli seeds can be slow to sprout, often one to two weeks or more, and they like warmth. Be patient if nothing has appeared yet.",
    spacingNote: "plants about 45 to 60 cm apart",
    readyNote: "sturdy, with a strong stem and several true leaves, often around four to six weeks old",
    pestNote: "aphids, thrips and mites, which can cause curling or crinkled leaves and tiny insects under the leaves",
    supportTitle: "Plan Light Support",
    supportInstructions: [
      "Chilli plants can become heavy with fruit later and may lean or break.",
      "Decide whether you will give each plant a small stake and have the stakes ready.",
      "You will only need the support once the plants are in the main bed and growing.",
    ],
    transplantExtra: ["Plant at the same depth they were growing at in the pot."],
  })
);