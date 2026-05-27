import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  component: MealBuilder,
});

type Nutrition = { kcal: number; protein: number; carbs: number };
type FoodItem = { id: string; name: string; img: string } & Nutrition;
type Category = {
  key: string;
  title: string;
  rule: "one" | "many";
  items: FoodItem[];
};

// Real photos via loremflickr (Creative Commons licensed Flickr images)
const img = (q: string, seed: number) =>
  `https://loremflickr.com/400/300/${q}?lock=${seed}`;

const CATEGORIES: Category[] = [
  {
    key: "base",
    title: "Grain / Base",
    rule: "one",
    items: [
      { id: "rice", name: "Rice", img: img("white,rice,cooked", 11), kcal: 205, protein: 4, carbs: 45 },
      { id: "corn-rice", name: "Corn Rice", img: img("corn,rice", 12), kcal: 180, protein: 4, carbs: 40 },
      { id: "quinoa", name: "Quinoa", img: img("quinoa,bowl", 13), kcal: 222, protein: 8, carbs: 39 },
      { id: "kamote", name: "Kamote", img: img("sweet,potato", 14), kcal: 180, protein: 2, carbs: 41 },
    ],
  },
  {
    key: "protein",
    title: "Protein",
    rule: "one",
    items: [
      { id: "tokwa", name: "Tokwa (Tofu)", img: img("tofu", 21), kcal: 144, protein: 16, carbs: 3 },
      { id: "egg", name: "Egg", img: img("boiled,egg", 22), kcal: 155, protein: 13, carbs: 1 },
      { id: "monggo", name: "Monggo", img: img("mung,beans", 23), kcal: 212, protein: 14, carbs: 38 },
      { id: "chicken", name: "Chicken Breast", img: img("grilled,chicken,breast", 24), kcal: 165, protein: 31, carbs: 0 },
      { id: "tuna", name: "Tuna Flakes", img: img("tuna,flakes", 25), kcal: 130, protein: 28, carbs: 0 },
    ],
  },
  {
    key: "veggies",
    title: "Veggies",
    rule: "many",
    items: [
      { id: "cabbage", name: "Cabbage", img: img("cabbage", 31), kcal: 22, protein: 1, carbs: 5 },
      { id: "sayote", name: "Sayote", img: img("chayote", 32), kcal: 24, protein: 1, carbs: 6 },
      { id: "sitaw", name: "Sitaw", img: img("string,beans", 33), kcal: 47, protein: 3, carbs: 8 },
      { id: "ampalaya", name: "Ampalaya", img: img("bitter,gourd", 34), kcal: 21, protein: 1, carbs: 4 },
      { id: "lettuce", name: "Lettuce", img: img("lettuce", 35), kcal: 15, protein: 1, carbs: 3 },
    ],
  },
  {
    key: "sauce",
    title: "Sauce",
    rule: "one",
    items: [
      { id: "sesame-soy", name: "Sesame-Soy", img: img("sesame,sauce", 41), kcal: 60, protein: 2, carbs: 4 },
      { id: "calamansi-soy", name: "Calamansi-Soy", img: img("soy,sauce", 42), kcal: 35, protein: 2, carbs: 3 },
      { id: "peanut", name: "Peanut Sauce", img: img("peanut,sauce", 43), kcal: 110, protein: 4, carbs: 6 },
      { id: "garlic-yogurt", name: "Garlic Yogurt", img: img("yogurt,sauce", 44), kcal: 70, protein: 3, carbs: 5 },
    ],
  },
];

function MealBuilder() {
  const [selected, setSelected] = useState<Record<string, string[]>>({
    base: [],
    protein: [],
    veggies: [],
    sauce: [],
  });

  const toggle = (cat: Category, itemId: string) => {
    setSelected((prev) => {
      const current = prev[cat.key] ?? [];
      if (cat.rule === "one") {
        return { ...prev, [cat.key]: current.includes(itemId) ? [] : [itemId] };
      }
      return {
        ...prev,
        [cat.key]: current.includes(itemId)
          ? current.filter((i) => i !== itemId)
          : [...current, itemId],
      };
    });
  };

  const totals = useMemo<Nutrition>(() => {
    let kcal = 0, protein = 0, carbs = 0;
    for (const cat of CATEGORIES) {
      for (const id of selected[cat.key] ?? []) {
        const it = cat.items.find((i) => i.id === id);
        if (it) { kcal += it.kcal; protein += it.protein; carbs += it.carbs; }
      }
    }
    return { kcal, protein, carbs };
  }, [selected]);

  const allItems = CATEGORIES.flatMap((c) =>
    (selected[c.key] ?? []).map((id) => c.items.find((i) => i.id === id)!).filter(Boolean),
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-neutral-950/80 border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center font-bold text-neutral-900">
              O
            </div>
            <h1 className="text-xl font-semibold tracking-tight">O'clock</h1>
            <span className="text-neutral-500 text-sm ml-2 hidden sm:inline">Meal Builder</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm">
            <Stat label="kcal" value={totals.kcal} />
            <Stat label="protein" value={`${totals.protein}g`} />
            <Stat label="carbs" value={`${totals.carbs}g`} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Build your ideal meal</h2>
            <p className="text-neutral-400 mt-2">
              Pick your ingredients — we'll tally the protein, carbs & calories as you go.
            </p>
          </div>

          {CATEGORIES.map((cat) => (
            <section key={cat.key}>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-xl font-semibold">{cat.title}</h3>
                <span className="text-xs uppercase tracking-wider text-neutral-500">
                  {cat.rule === "one" ? "Choose 1" : "Pick many"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {cat.items.map((it) => {
                  const active = (selected[cat.key] ?? []).includes(it.id);
                  return (
                    <button
                      key={it.id}
                      onClick={() => toggle(cat, it.id)}
                      className={`group text-left rounded-2xl overflow-hidden border transition-all ${
                        active
                          ? "border-amber-400 ring-2 ring-amber-400/40 bg-neutral-900"
                          : "border-neutral-800 bg-neutral-900 hover:border-neutral-600"
                      }`}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-neutral-800">
                        <img
                          src={it.img}
                          alt={it.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{it.name}</span>
                          {active && (
                            <span className="text-xs text-amber-400">✓</span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          {it.kcal} kcal · {it.protein}g P · {it.carbs}g C
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-5">
          <h3 className="text-lg font-semibold">Your Meal</h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="Calories" value={totals.kcal} unit="kcal" />
            <Metric label="Protein" value={totals.protein} unit="g" />
            <Metric label="Carbs" value={totals.carbs} unit="g" />
          </div>

          <div className="space-y-2">
            {allItems.length === 0 ? (
              <p className="text-sm text-neutral-500">Nothing selected yet.</p>
            ) : (
              allItems.map((it) => (
                <div
                  key={it.id}
                  className="flex justify-between text-sm border-b border-neutral-800 pb-1.5"
                >
                  <span>{it.name}</span>
                  <span className="text-neutral-400">{it.kcal} kcal</span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setSelected({ base: [], protein: [], veggies: [], sauce: [] })}
            className="w-full rounded-xl border border-neutral-700 py-2 text-sm hover:bg-neutral-800 transition"
          >
            Reset
          </button>
        </aside>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-right">
      <div className="font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</div>
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-neutral-500">{unit}</div>
      <div className="text-[11px] text-neutral-400 mt-0.5">{label}</div>
    </div>
  );
}
