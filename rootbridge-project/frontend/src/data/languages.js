// Languages shown in onboarding and in the Cultural Passport.
// Only "active" languages can be chosen. To launch one, add its
// curriculum in src/data/ and change status to "active".

export const LANGUAGES = [
  { id: "nepali", name: "Nepali", native: "नेपाली", lang: "ne", region: "Nepal", script: "Devanagari", status: "active" },
  { id: "twi", name: "Twi", native: "Twi", lang: "tw", region: "Ghana", script: "Latin", status: "soon" },
  { id: "yoruba", name: "Yoruba", native: "Yorùbá", lang: "yo", region: "Nigeria", script: "Latin", status: "soon" },
  { id: "bengali", name: "Bengali", native: "বাংলা", lang: "bn", region: "Bangladesh", script: "Bengali", status: "soon" },
  { id: "hindi", name: "Hindi", native: "हिन्दी", lang: "hi", region: "India", script: "Devanagari", status: "soon" },
  { id: "urdu", name: "Urdu", native: "اردو", lang: "ur", region: "Pakistan", script: "Arabic", status: "soon", rtl: true },
  { id: "somali", name: "Somali", native: "Soomaali", lang: "so", region: "Somalia", script: "Latin", status: "soon" },
];

export const DEFAULT_LANGUAGE = "nepali";
export const getLanguage = (id) => LANGUAGES.find((l) => l.id === id);
