import { useMemo, useState, useCallback } from "react";
import { Check, Plus, ArrowRight, BookmarkCheck, Sparkles, LogIn, LogOut, User } from "lucide-react";
import { STEPS, type Selection, type Item } from "@/lib/meal-data";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { supabase } from "@/lib/supabase";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 75'%3E%3Crect width='100' height='75' fill='%23eee'/%3E%3Ctext x='50' y='42' font-size='10' text-anchor='middle' fill='%23999'%3E%F0%9F%8D%B2%3C/text%3E%3C/svg%3E";

export function MealBuilder() {
  const { user, signOut, loading } = useAuth();
  const [stepIdx, setStepIdx] = useState(0);
  const [selection, setSelection] = useState<Selection>({});
  const [confirmed, setConfirmed] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const selectedIds = selection[step.key] ?? [];

  const allItemsFlat = useMemo(() => {
    const map = new Map<string, { item: Item; stepKey: string; stepLabel: string }>();
    STEPS.forEach((s) =>
      s.items.forEach((item) => map.set(item.id, { item, stepKey: s.key, stepLabel: s.label })),
    );
    return map;
  }, []);

  const summary = useMemo(() => {
    let cal = 0, protein = 0, carbs = 0, fat = 0, prep = 0, count = 0;
    Object.values(selection).forEach((ids) => {
      ids?.forEach((id) => {
        const entry = allItemsFlat.get(id);
        if (!entry) return;
        cal += entry.item.cal;
        protein += entry.item.protein;
        carbs += entry.item.carbs;
        fat += entry.item.fat;
        prep = Math.max(prep, entry.item.prep);
        count += 1;
      });
    });
    return { cal, protein, carbs, fat, prep, count };
  }, [selection, allItemsFlat]);

  const toggle = (item: Item) => {
    setSelection((prev) => {
      const cur = prev[step.key] ?? [];
      let next: string[];
      if (step.multi) {
        if (cur.includes(item.id)) next = cur.filter((id) => id !== item.id);
        else if (step.max && cur.length >= step.max) next = [...cur.slice(1), item.id];
        else next = [...cur, item.id];
      } else {
        next = cur.includes(item.id) ? [] : [item.id];
      }
      return { ...prev, [step.key]: next };
    });
  };

  const handleSaveMeal = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("saved_meals").insert({
        user_id: user.id,
        selection,
        calories: summary.cal,
        protein: summary.protein,
        carbs: summary.carbs,
        fat: summary.fat,
        prep_time: summary.prep,
      });
      if (!error) setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [user, selection, summary]);

  const canAdvance = !step.required || selectedIds.length > 0;
  const advance = () => {
    if (isLast) { setConfirmed(true); return; }
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  };
  const reset = () => { setSelection({}); setStepIdx(0); setConfirmed(false); setSaved(false); };

  if (showAuth && !user) {
    return <AuthForm onSuccess={() => setShowAuth(false)} />;
  }

  if (confirmed) return (
    <ConfirmedScreen
      summary={summary}
      onReset={reset}
      selection={selection}
      allItemsFlat={allItemsFlat}
      user={user}
      saving={saving}
      saved={saved}
      onSave={handleSaveMeal}
      onShowAuth={() => setShowAuth(true)}
      onSignOut={signOut}
    />
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-[440px] mx-auto bg-card min-h-screen shadow-2xl shadow-foreground/5 relative flex flex-col border-x border-border">
        <header className="p-6 space-y-4 sticky top-0 bg-card/90 backdrop-blur-md z-20 border-b border-border">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Meal Builder
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight leading-none uppercase">
                O<span className="text-primary">'</span>Clock
              </h1>
            </div>
            <div className="flex items-end gap-4">
              <div className="text-right">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Cook time
                </span>
                <p className="font-semibold text-sm tabular-nums">
                  {summary.prep > 0 ? `~${summary.prep} min` : "— min"}
                </p>
              </div>
              {loading ? null : user ? (
                <button
                  onClick={signOut}
                  className="size-9 rounded-full bg-primary/10 grid place-items-center hover:bg-primary/20 transition-colors"
                  aria-label="Sign out"
                  title={`Signed in as ${user.email}`}
                >
                  <User className="size-4 text-primary" />
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="size-9 rounded-full bg-muted grid place-items-center hover:bg-primary/10 transition-colors"
                  aria-label="Sign in"
                >
                  <LogIn className="size-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1 h-1">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStepIdx(i)}
                className={`flex-1 transition-colors ${i <= stepIdx ? "bg-primary" : "bg-border"}`}
                aria-label={`Go to step ${s.label}`}
              />
            ))}
          </div>
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {STEPS.map((s, i) => (
              <span key={s.key} className={i === stepIdx ? "text-foreground font-semibold" : ""}>
                {s.label}
              </span>
            ))}
          </div>
        </header>

        <main className="flex-1 p-6 pb-44">
          <section key={step.key} className="animate-slide-up">
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-sm font-extrabold uppercase tracking-tight">
                {String(stepIdx + 1).padStart(2, "0")} / Select {step.label}
              </h2>
              <span className="font-mono text-[10px] text-primary uppercase">
                {step.required ? "Required" : step.multi ? `Up to ${step.max}` : "Optional"}
              </span>
            </div>

            {step.key === "base" || step.key === "protein" ? (
              <div className="grid grid-cols-2 gap-3">
                {step.items.map((item) => (
                  <CardTile key={item.id} item={item} selected={selectedIds.includes(item.id)} onToggle={() => toggle(item)} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {step.items.map((item) => (
                  <RowTile key={item.id} item={item} selected={selectedIds.includes(item.id)} onToggle={() => toggle(item)} />
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-foreground text-background p-6 z-30 rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.15)]">
          <div className="flex justify-between items-center mb-5">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase text-background/50 block">
                Total nutrition
              </span>
              <div className="flex gap-4 items-center">
                <div>
                  <span className="text-2xl font-extrabold tabular-nums">{summary.cal}</span>
                  <span className="font-mono text-[10px] text-background/60 ml-1">kcal</span>
                </div>
                <div className="flex items-center gap-3 border-l border-background/20 pl-4">
                  <Stat label="Protein" value={`${summary.protein}g`} />
                  <Stat label="Carbs" value={`${summary.carbs}g`} />
                  <Stat label="Fat" value={`${summary.fat}g`} />
                </div>
              </div>
            </div>
            <div className="size-10 border border-background/20 rounded-full grid place-items-center shrink-0">
              <span className="font-mono text-xs tabular-nums">
                {String(stepIdx + 1).padStart(2, "0")}
              </span>
            </div>
          </div>

          <button
            onClick={advance}
            disabled={!canAdvance}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-extrabold uppercase py-4 rounded-xl transition-all active:scale-[0.98] tracking-widest text-sm flex items-center justify-center gap-2"
          >
            {isLast ? (<><BookmarkCheck className="size-4" /> Confirm meal</>) : (<>Continue <ArrowRight className="size-4" /></>)}
          </button>
        </footer>
      </div>
    </div>
  );
}

function FoodImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-mono text-[10px] text-background/50 uppercase">{label}</p>
      <p className="text-xs font-bold tabular-nums">{value}</p>
    </div>
  );
}

function CardTile({ item, selected, onToggle }: { item: Item; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`text-left group transition-all rounded-xl overflow-hidden bg-card relative active:scale-[0.98] ${
        selected ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-foreground/20"
      }`}
    >
      <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
        <FoodImg src={item.image} alt={item.name} className="w-full h-full object-cover" />
        {selected && (
          <div className="absolute top-2 right-2 size-6 rounded-full bg-primary grid place-items-center animate-fade-in">
            <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xs font-bold uppercase leading-tight">{item.name}</h3>
          <span className="font-mono text-[10px] tabular-nums shrink-0">{item.cal} kcal</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{item.desc}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="font-mono text-[9px] text-muted-foreground tabular-nums">P {item.protein}g</span>
          <span className="size-0.5 rounded-full bg-border" />
          <span className="font-mono text-[9px] text-muted-foreground tabular-nums">C {item.carbs}g</span>
          <span className="size-0.5 rounded-full bg-border" />
          <span className="font-mono text-[9px] text-muted-foreground tabular-nums">F {item.fat}g</span>
        </div>
      </div>
    </button>
  );
}

function RowTile({ item, selected, onToggle }: { item: Item; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left flex items-center p-3 rounded-xl group transition-all bg-card active:scale-[0.99] ${
        selected ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-foreground/20"
      }`}
    >
      <div className="size-14 rounded-lg shrink-0 overflow-hidden bg-muted">
        <FoodImg src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="ml-4 flex-1 min-w-0">
        <h3 className="text-xs font-bold uppercase">{item.name}</h3>
        <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-[9px] text-muted-foreground tabular-nums">+{item.cal} kcal</span>
          <span className="size-0.5 rounded-full bg-border" />
          <span className="font-mono text-[9px] text-muted-foreground tabular-nums">P {item.protein}g</span>
        </div>
      </div>
      <div className="text-right ml-3 flex flex-col items-end gap-2">
        <div
          className={`size-6 rounded-full grid place-items-center transition-colors ${
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {selected ? <Check className="size-3.5" strokeWidth={3} /> : <Plus className="size-3.5" />}
        </div>
      </div>
    </button>
  );
}

function ConfirmedScreen({
  summary, onReset, selection, allItemsFlat, user, saving, saved, onSave, onShowAuth, onSignOut,
}: {
  summary: { cal: number; protein: number; carbs: number; fat: number; prep: number; count: number };
  onReset: () => void;
  selection: Selection;
  allItemsFlat: Map<string, { item: Item; stepKey: string; stepLabel: string }>;
  user: import("@supabase/supabase-js").User | null;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  onShowAuth: () => void;
  onSignOut: () => void;
}) {
  const mealNum = useMemo(() => String(Math.floor(Math.random() * 9000) + 1000), []);
  const items = Object.values(selection).flat().map((id) => id ? allItemsFlat.get(id) : undefined).filter(Boolean) as { item: Item; stepKey: string; stepLabel: string }[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[440px] mx-auto bg-card min-h-screen border-x border-border flex flex-col">
        <div className="p-6 pt-12 pb-12 animate-slide-up">
          <div className="size-14 rounded-full bg-primary grid place-items-center mb-6">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Meal #{mealNum}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase mt-1">
            Sarap <span className="text-primary">!</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-[34ch]">
            Your meal is built. Cook time ~{summary.prep} min.
          </p>

          <div className="mt-8 grid grid-cols-4 gap-2 border border-border rounded-xl p-4">
            <MacroBlock label="Calories" value={`${summary.cal}`} unit="kcal" />
            <MacroBlock label="Protein" value={`${summary.protein}`} unit="g" />
            <MacroBlock label="Carbs" value={`${summary.carbs}`} unit="g" />
            <MacroBlock label="Fat" value={`${summary.fat}`} unit="g" />
          </div>

          <div className="mt-8 border-t border-border pt-6 space-y-4">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Your meal
            </h2>
            {items.map(({ item, stepLabel }) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="size-10 rounded-md overflow-hidden bg-muted shrink-0">
                  <FoodImg src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase">{item.name}</p>
                  <p className="font-mono text-[9px] text-muted-foreground uppercase">{stepLabel}</p>
                </div>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{item.cal} kcal</span>
              </div>
            ))}
          </div>

          {user ? (
            <div className="mt-8 space-y-3">
              {saved ? (
                <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-xs text-primary font-semibold text-center animate-fade-in">
                  Meal saved to your account!
                </div>
              ) : (
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-extrabold uppercase py-4 rounded-xl tracking-widest text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <BookmarkCheck className="size-4" />
                  {saving ? "Saving..." : "Save my meal"}
                </button>
              )}
              <button
                onClick={onSignOut}
                className="w-full border border-border hover:bg-muted font-medium uppercase py-3 rounded-xl tracking-widest text-xs flex items-center justify-center gap-2 transition-colors text-muted-foreground"
              >
                <LogOut className="size-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              <button
                onClick={onShowAuth}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold uppercase py-4 rounded-xl tracking-widest text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="size-4" /> Sign in to save
              </button>
              <p className="text-[10px] text-muted-foreground text-center">
                Create an account to save your meals and access them anytime.
              </p>
            </div>
          )}

          <button
            onClick={onReset}
            className="mt-6 w-full bg-foreground text-background font-extrabold uppercase py-4 rounded-xl tracking-widest text-sm active:scale-[0.98] transition-transform"
          >
            Build another
          </button>
        </div>
      </div>
    </div>
  );
}

function MacroBlock({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-extrabold tabular-nums leading-none">{value}</p>
      <p className="font-mono text-[9px] text-muted-foreground uppercase mt-1">{unit}</p>
      <p className="font-mono text-[8px] text-muted-foreground/70 uppercase mt-0.5">{label}</p>
    </div>
  );
}
