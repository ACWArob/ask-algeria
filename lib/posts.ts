/**
 * Works out which Algerian office serves the person, from places named in the question
 * (Latin, Arabic or Darija spelling). Used to (1) boost that office's pages in search and
 * (2) tell the model which office applies, so answers state it as a fact.
 */

export interface PostHint {
  /** Place the person mentioned, as we understood it (e.g. "Colorado"). */
  place: string;
  /** Office that serves them (e.g. "Consulate General of Algeria in San Francisco"). */
  post: string;
  /** Official site of that office, when known. */
  site?: string;
  /** Corpus domains belonging to that office (may be empty if we hold no pages for it). */
  domains: string[];
  /** true when the person is inside Algeria (procedures go through APC/daïra, not a consulate). */
  inAlgeria?: boolean;
}

type Office = Omit<PostHint, "place">;

const mfa = (sub: string, name: string): Office => ({
  post: name,
  site: `https://${sub}.mfa.gov.dz`,
  domains: [`${sub}.mfa.gov.dz`],
});

const NY: Office = { post: "Consulate General of Algeria in New York", site: "https://algeria-cgny.org", domains: ["algeria-cgny.org", "cgnewyork.mfa.gov.dz"] };
const SF: Office = mfa("cgsanfrancisco", "Consulate General of Algeria in San Francisco");
const DC: Office = mfa("embwashington", "Embassy of Algeria in Washington, D.C.");
const ALGERIA = (city: string): Office => ({
  post: `local administration in Algeria (APC/commune or daïra of ${city})`,
  domains: ["wilayaoran.dz", "interieur.gov.dz", "wilaya-djelfa.dz", "wilaya-bouira.dz"],
  inAlgeria: true,
});

/** US states → office. */
const US_STATES: Record<string, Office> = {
  alabama: NY, arkansas: NY, connecticut: NY, florida: NY, georgia: NY, illinois: NY, indiana: NY, iowa: NY,
  kentucky: NY, louisiana: NY, maine: NY, massachusetts: NY, michigan: NY, minnesota: NY, mississippi: NY,
  missouri: NY, "new hampshire": NY, "new jersey": NY, "new york": NY, ohio: NY, pennsylvania: NY,
  "rhode island": NY, tennessee: NY, vermont: NY, wisconsin: NY,
  california: SF, arizona: SF, nevada: SF, oregon: SF, "washington state": SF, utah: SF, colorado: SF,
  hawaii: SF, alaska: SF, "north dakota": SF, "south dakota": SF, nebraska: SF, oklahoma: SF, texas: SF,
  kansas: SF, wyoming: SF, montana: SF, idaho: SF, "new mexico": SF,
  delaware: DC, maryland: DC, "north carolina": DC, "south carolina": DC, virginia: DC, "west virginia": DC,
  "washington dc": DC, "washington d.c.": DC, "district of columbia": DC,
};
const STATE_ABBR: Record<string, string> = {
  AL: "alabama", AR: "arkansas", CT: "connecticut", FL: "florida", GA: "georgia", IL: "illinois", IN: "indiana",
  IA: "iowa", KY: "kentucky", ME: "maine", MA: "massachusetts", MI: "michigan", MN: "minnesota", MS: "mississippi",
  MO: "missouri", NH: "new hampshire", NJ: "new jersey", NY: "new york", OH: "ohio", PA: "pennsylvania",
  RI: "rhode island", TN: "tennessee", VT: "vermont", WI: "wisconsin", CA: "california", AZ: "arizona",
  NV: "nevada", OR: "oregon", WA: "washington state", UT: "utah", CO: "colorado", HI: "hawaii", AK: "alaska",
  ND: "north dakota", SD: "south dakota", NE: "nebraska", OK: "oklahoma", TX: "texas", KS: "kansas",
  WY: "wyoming", MT: "montana", ID: "idaho", NM: "new mexico", DE: "delaware", MD: "maryland",
  NC: "north carolina", SC: "south carolina", VA: "virginia", WV: "west virginia", DC: "washington dc",
};

/**
 * City / country names (any spelling, incl. Arabic, Darija and common typos) → [display place, office].
 * Longer keys are tried first.
 */
const PLACES: [string[], string, Office][] = [
  // United States (cities)
  [["denver", "dever", "denvr", "دنفر", "boulder", "colorado springs", "aurora co"], "Denver, Colorado", SF],
  [["los angeles", "l.a.", "لوس انجلوس", "لوس أنجلوس", "san diego", "san jose", "oakland", "sacramento", "irvine", "san francisco", "سان فرانسيسكو", "bay area"], "California", SF],
  [["houston", "هيوستن", "dallas", "دالاس", "austin", "san antonio"], "Texas", SF],
  [["phoenix", "tucson"], "Arizona", SF],
  [["las vegas"], "Nevada", SF],
  [["seattle", "سياتل"], "Washington State", SF],
  [["portland"], "Oregon", SF],
  [["salt lake city"], "Utah", SF],
  [["albuquerque"], "New Mexico", SF],
  [["honolulu"], "Hawaii", SF],
  [["new york city", "nyc", "نيويورك", "نيو يورك", "brooklyn", "queens", "manhattan", "bronx"], "New York", NY],
  [["chicago", "شيكاغو"], "Illinois", NY],
  [["boston", "بوسطن"], "Massachusetts", NY],
  [["detroit", "ديترويت", "dearborn"], "Michigan", NY],
  [["philadelphia", "philly", "pittsburgh"], "Pennsylvania", NY],
  [["miami", "ميامي", "orlando", "tampa", "jacksonville"], "Florida", NY],
  [["atlanta", "أتلانتا"], "Georgia", NY],
  [["newark", "jersey city", "paterson"], "New Jersey", NY],
  [["minneapolis"], "Minnesota", NY],
  [["cleveland", "columbus"], "Ohio", NY],
  [["nashville"], "Tennessee", NY],
  [["new orleans"], "Louisiana", NY],
  [["st louis", "st. louis"], "Missouri", NY],
  [["baltimore"], "Maryland", DC],
  [["richmond", "arlington", "alexandria"], "Virginia", DC],
  [["charlotte", "raleigh"], "North Carolina", DC],
  [["washington dc", "washington d.c.", "واشنطن"], "Washington, D.C.", DC],
  // France
  [["paris", "باريس", "barís"], "Paris", mfa("cgparis", "Consulate General of Algeria in Paris")],
  [["nanterre"], "Nanterre", mfa("cgnanterre", "Consulate General of Algeria in Nanterre")],
  [["pontoise", "cergy"], "Pontoise", mfa("cpontoise", "Consulate of Algeria in Pontoise")],
  [["créteil", "creteil"], "Créteil", mfa("cgcreteil", "Consulate General of Algeria in Créteil")],
  [["bobigny", "saint-denis", "seine-saint-denis"], "Bobigny", mfa("cgbobigny", "Consulate General of Algeria in Bobigny")],
  [["lyon", "ليون"], "Lyon", mfa("cglyon", "Consulate General of Algeria in Lyon")],
  [["marseille", "مرسيليا"], "Marseille", mfa("cgmarseille", "Consulate General of Algeria in Marseille")],
  [["lille", "ليل"], "Lille", mfa("cglille", "Consulate General of Algeria in Lille")],
  [["strasbourg"], "Strasbourg", mfa("cgstrasbourg", "Consulate General of Algeria in Strasbourg")],
  [["toulouse", "تولوز"], "Toulouse", mfa("cgtoulouse", "Consulate General of Algeria in Toulouse")],
  [["bordeaux"], "Bordeaux", mfa("cgbordeaux", "Consulate General of Algeria in Bordeaux")],
  [["montpellier"], "Montpellier", mfa("cgmontpellier", "Consulate General of Algeria in Montpellier")],
  [["grenoble"], "Grenoble", mfa("cggrenoble", "Consulate General of Algeria in Grenoble")],
  [["metz"], "Metz", mfa("cgmetz", "Consulate General of Algeria in Metz")],
  [["besançon", "besancon"], "Besançon", mfa("cgbesancon", "Consulate General of Algeria in Besançon")],
  [["nice"], "Nice", mfa("cgnice", "Consulate General of Algeria in Nice")],
  [["nantes"], "Nantes", mfa("cnantes", "Consulate of Algeria in Nantes")],
  // Canada
  [["montreal", "montréal", "مونتريال", "quebec", "québec"], "Montreal", mfa("cgmontreal", "Consulate General of Algeria in Montreal")],
  [["ottawa", "أوتاوا"], "Ottawa", mfa("embottawa", "Embassy of Algeria in Ottawa")],
  // UK & Europe & others
  [["london", "لندن", "united kingdom", "england", "scotland", "wales", "ireland", "dublin", "manchester", "birmingham", "uk"], "United Kingdom", mfa("cglondon", "Consulate General of Algeria in London")],
  [["milan", "milano", "ميلانو", "italy", "italie", "إيطاليا", "rome", "roma", "turin", "torino"], "Italy", mfa("cgmilan", "Consulate General of Algeria in Milan")],
  [["istanbul", "إسطنبول", "اسطنبول", "turkey", "turquie", "تركيا"], "Turkey", mfa("cgistanbul", "Consulate General of Algeria in Istanbul")],
  [["geneva", "genève", "geneve", "جنيف", "switzerland", "suisse", "سويسرا"], "Switzerland", mfa("cggeneva", "Consulate General of Algeria in Geneva")],
  [["berlin", "برلين", "germany", "allemagne", "deutschland", "ألمانيا", "frankfurt", "munich"], "Germany", mfa("embberlin", "Embassy of Algeria in Berlin")],
  [["brussels", "bruxelles", "بروكسل", "belgium", "belgique", "بلجيكا"], "Belgium", mfa("cgbrussels", "Consulate General of Algeria in Brussels")],
  [["madrid", "مدريد", "spain", "espagne", "إسبانيا"], "Spain", mfa("embmadrid", "Embassy of Algeria in Madrid")],
  [["riyadh", "riyad", "الرياض", "saudi", "السعودية"], "Saudi Arabia", mfa("embriyadh", "Embassy of Algeria in Riyadh")],
  [["jeddah", "djeddah", "جدة"], "Jeddah", mfa("cgjeddah", "Consulate General of Algeria in Jeddah")],
  [["abu dhabi", "dubai", "uae", "emirates", "أبوظبي", "دبي", "الإمارات"], "United Arab Emirates", mfa("embabudhabi", "Embassy of Algeria in Abu Dhabi")],
  [["doha", "qatar", "قطر", "الدوحة"], "Qatar", mfa("embdoha", "Embassy of Algeria in Doha")],
  // Inside Algeria
  [["algiers", "alger", "الجزائر العاصمة", "العاصمة", "دزاير العاصمة"], "Algiers", ALGERIA("Algiers")],
  [["oran", "wahran", "وهران"], "Oran", ALGERIA("Oran")],
  [["constantine", "قسنطينة"], "Constantine", ALGERIA("Constantine")],
  [["annaba", "عنابة"], "Annaba", ALGERIA("Annaba")],
  [["blida", "البليدة"], "Blida", ALGERIA("Blida")],
  [["setif", "sétif", "سطيف"], "Sétif", ALGERIA("Sétif")],
  [["tizi ouzou", "تيزي وزو"], "Tizi Ouzou", ALGERIA("Tizi Ouzou")],
  [["bejaia", "béjaïa", "bgayet", "بجاية"], "Béjaïa", ALGERIA("Béjaïa")],
  [["tlemcen", "تلمسان"], "Tlemcen", ALGERIA("Tlemcen")],
  [["batna", "باتنة"], "Batna", ALGERIA("Batna")],
  [["djelfa", "الجلفة"], "Djelfa", ALGERIA("Djelfa")],
  [["bouira", "البويرة"], "Bouira", ALGERIA("Bouira")],
  [["ouargla", "ورقلة"], "Ouargla", ALGERIA("Ouargla")],
  [["in algeria", "en algérie", "en algerie", "فالدزاير", "في الجزائر", "fi dzayer", "f dzayer", "fl bled", "في البلاد"], "Algeria", ALGERIA("your wilaya")],
];

// Countries with several Algerian posts: ask for the city instead of guessing.
const MULTI_POST: [string[], string][] = [
  [["france", "فرنسا", "fransa"], "France"],
  [["usa", "united states", "america", "أمريكا", "امريكا", "الولايات المتحدة", "mirikan", "lmirikan"], "the United States"],
  [["canada", "كندا"], "Canada"],
];

const L = "\\p{L}\\p{N}";
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text: string, word: string) =>
  new RegExp(`(?<![${L}])${esc(word)}(?![${L}])`, "iu").test(text);

const titleCase = (s: string) => s.replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase());

export interface MultiPostHint {
  country: string;
}

export function detectPost(text: string): PostHint | null {
  const t = text.replace(/[’']/g, "'");
  // 1. Named cities/countries (longest names first so "new york city" beats "york").
  const entries = PLACES.flatMap(([names, place, office]) => names.map((n) => [n, place, office] as const)).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [name, place, office] of entries) {
    if (name === "nice" && !/(?:^|\s)(in|à|a|de|from)\s+nice(?![\p{L}])/iu.test(t)) continue;
    if (has(t, name)) return { place, ...office };
  }
  // 2. "LA" written in capitals means Los Angeles in practice.
  if (/(?<![\p{L}])LA(?![\p{L}])/u.test(t)) return { place: "Los Angeles, California", ...SF };
  // 3. US state names.
  for (const s of Object.keys(US_STATES).sort((a, b) => b.length - a.length)) {
    if (has(t, s)) return { place: titleCase(s.replace(" state", "")), ...US_STATES[s] };
  }
  // 4. Two-letter state codes, only in capitals and in a location-like position.
  const m = t.match(/\b(?:in|from|live in|living in|based in|near)\s+([A-Z]{2})\b/) ?? t.match(/,\s*([A-Z]{2})\b/);
  if (m && STATE_ABBR[m[1]]) {
    const s = STATE_ABBR[m[1]];
    return { place: titleCase(s.replace(" state", "")), ...US_STATES[s] };
  }
  return null;
}

/** Country mentioned that has several Algerian posts (so the answer should ask which city). */
export function detectMultiPostCountry(text: string): string | null {
  for (const [names, country] of MULTI_POST) for (const n of names) if (has(text, n)) return country;
  return null;
}
