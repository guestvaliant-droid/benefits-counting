export type Item = {
  id: string;
  name: string;
  desc: string;
  image: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  prep: number;
};

export type Step = {
  key: "base" | "protein" | "veggies" | "sauce";
  label: string;
  required: boolean;
  multi: boolean;
  max?: number;
  items: Item[];
};

export type Selection = Partial<Record<Step["key"], string[]>>;

// Real photographs from TheMealDB (free ingredient images) and Wikimedia Commons (public domain / CC).
// No AI generated images.
const mdb = (name: string) =>
  `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}.png`;
const wiki = (filename: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=600`;

export const STEPS: Step[] = [
  {
    key: "base",
    label: "Base",
    required: true,
    multi: false,
    items: [
      { id: "rice", name: "Rice", desc: "Steamed white rice", image: mdb("Rice"), cal: 205, protein: 4, carbs: 45, fat: 0, prep: 15 },
      { id: "corn-rice", name: "Corn Rice", desc: "Rice mixed with corn kernels", image: mdb("Corn"), cal: 180, protein: 4, carbs: 40, fat: 1, prep: 18 },
      { id: "quinoa", name: "Quinoa", desc: "Complete protein grain", image: mdb("Quinoa"), cal: 222, protein: 8, carbs: 39, fat: 4, prep: 20 },
      { id: "kamote", name: "Kamote", desc: "Filipino sweet potato", image: mdb("Sweet Potato"), cal: 180, protein: 2, carbs: 41, fat: 0, prep: 25 },
    ],
  },
  {
    key: "protein",
    label: "Protein",
    required: true,
    multi: false,
    items: [
      { id: "tokwa", name: "Tokwa", desc: "Pan-fried firm tofu", image: mdb("Tofu"), cal: 144, protein: 16, carbs: 3, fat: 8, prep: 10 },
      { id: "egg", name: "Egg", desc: "Boiled or sunny-side up", image: mdb("Egg"), cal: 155, protein: 13, carbs: 1, fat: 11, prep: 8 },
      { id: "monggo", name: "Monggo", desc: "Stewed mung beans", image: wiki("Mung_beans_(Vigna_radiata).jpg"), cal: 212, protein: 14, carbs: 38, fat: 1, prep: 30 },
      { id: "chicken", name: "Chicken Breast", desc: "Grilled & sliced", image: mdb("Chicken Breast"), cal: 165, protein: 31, carbs: 0, fat: 4, prep: 18 },
      { id: "tuna", name: "Tuna Flakes", desc: "Canned tuna, drained", image: mdb("Tuna"), cal: 130, protein: 28, carbs: 0, fat: 2, prep: 3 },
    ],
  },
  {
    key: "veggies",
    label: "Veggies",
    required: false,
    multi: true,
    max: 5,
    items: [
      { id: "cabbage", name: "Cabbage", desc: "Crunchy shredded cabbage", image: mdb("Cabbage"), cal: 22, protein: 1, carbs: 5, fat: 0, prep: 5 },
      { id: "sayote", name: "Sayote", desc: "Sautéed chayote squash", image: wiki("Chayote_Cucurbitaceae_Sechium_edule.jpg"), cal: 24, protein: 1, carbs: 6, fat: 0, prep: 8 },
      { id: "sitaw", name: "Sitaw", desc: "Filipino yardlong beans", image: wiki("Vigna_unguiculata_sesquipedalis2.JPG"), cal: 47, protein: 3, carbs: 8, fat: 0, prep: 7 },
      { id: "ampalaya", name: "Ampalaya", desc: "Bitter gourd, lightly sautéed", image: wiki("Bitter_melon.jpg"), cal: 21, protein: 1, carbs: 4, fat: 0, prep: 8 },
      { id: "lettuce", name: "Lettuce", desc: "Fresh crisp lettuce", image: mdb("Lettuce"), cal: 15, protein: 1, carbs: 3, fat: 0, prep: 2 },
    ],
  },
  {
    key: "sauce",
    label: "Sauce",
    required: false,
    multi: false,
    items: [
      { id: "sesame-soy", name: "Sesame–Soy", desc: "Nutty, savory drizzle", image: mdb("Sesame Seed Oil"), cal: 60, protein: 2, carbs: 4, fat: 4, prep: 2 },
      { id: "calamansi-soy", name: "Calamansi–Soy", desc: "Citrus-soy zinger", image: mdb("Soy Sauce"), cal: 35, protein: 2, carbs: 3, fat: 0, prep: 2 },
      { id: "peanut", name: "Peanut Sauce", desc: "Creamy & rich", image: mdb("Peanut Butter"), cal: 110, protein: 4, carbs: 6, fat: 8, prep: 3 },
      { id: "garlic-yogurt", name: "Garlic Yogurt", desc: "Cool & garlicky", image: mdb("Greek Yogurt"), cal: 70, protein: 3, carbs: 5, fat: 4, prep: 3 },
    ],
  },
];
