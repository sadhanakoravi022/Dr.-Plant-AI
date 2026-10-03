import { buildPlan } from "./helpers";
import { transplantCropTasks } from "./transplantCrop";

export const BRINJAL_PLAN = buildPlan(
  { crop: "brinjal", name: "Brinjal (Vangi)", shortName: "Brinjal", icon: "🍆" },
  transplantCropTasks({
    cropName: "Brinjal",
    germinationNote: "Brinjal seeds usually take one to two weeks to sprout, and warmth helps. Be patient if nothing has appeared yet.",
    spacingNote: "plants about 60 cm apart",
    readyNote: "sturdy, with a strong stem and several true leaves, often around four to six weeks old",
    pestNote: "small holes in leaves from flea beetles, aphids, jassids, and borers in shoots or fruits later in the season",
    supportTitle: "Plan Light Support",
    supportInstructions: [
      "Brinjal plants become bushy and can get heavy with fruit.",
      "Decide whether you will give each plant a stake and have the stakes ready.",
      "You will only need the support once the plants are in the main bed and growing.",
    ],
    transplantExtra: ["Plant at the same depth they were growing at in the pot."],
  })
);