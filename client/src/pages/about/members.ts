export interface Member {
  name: string;
  quote: string;
}

/** Short positive/motivational lines shown on the back of each flip card, cycled across members. */
const QUOTES = [
  "Every workout counts.",
  "Discipline beats motivation.",
  "Progress, not perfection.",
  "One more rep.",
  "Stay consistent.",
  "Small steps, real strength.",
  "Show up for yourself.",
  "Strong is a feeling.",
  "Earned, not given.",
  "Keep moving forward.",
] as const;

const MEMBER_NAMES = [
  "Wilbur",
  "Everleigh",
  "Austin",
  "Denwer",
  "Hardik",
  "Velly",
  "Melwish",
  "Damu",
  "Winona",
  "Willosha",
  "Anand",
  "Aditya",
  "Archana",
  "Daisy",
  "Deepa",
  "Dhruv",
  "Diksha",
  "Estela",
  "Harshna",
  "Ivanna",
  "Johanna",
  "John",
  "Jolina",
  "Komal",
  "Kush",
  "Manish",
  "Melinda",
  "Nicole",
  "Preeti",
  "Sayli",
  "Shavina",
  "Tanushree",
  "Vaibhavi",
  "Vitesh",
  "Vismay",
] as const;

/** A representative slice of the ELEV8 community — the full 250+ isn't listed individually, see MEMBER_TOTAL. */
export const MEMBERS: Member[] = MEMBER_NAMES.map((name, i) => ({
  name,
  quote: QUOTES[i % QUOTES.length],
}));

export const MEMBER_TOTAL = "250+";
