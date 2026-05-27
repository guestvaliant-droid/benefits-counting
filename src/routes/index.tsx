import { createFileRoute } from "@tanstack/react-router";
import { MealBuilder } from "@/components/meal-builder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "O'Clock — Meal Builder" },
      { name: "description", content: "Build your ideal meal with O'Clock. Pick a base, protein, veggies, and sauce — we tally protein, carbs, and calories as you go." },
      { property: "og:title", content: "O'Clock — Meal Builder" },
      { property: "og:description", content: "Build your ideal meal with O'Clock." },
    ],
  }),
  component: Index,
});

function Index() {
  return <MealBuilder />;
}
