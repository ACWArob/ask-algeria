/**
 * Works out which Algerian consular post serves the person, from places named in the question.
 * Used to (1) boost that post's pages in search and (2) tell the model which post applies,
 * so answers state it as a fact instead of guessing out loud.
 */

export interface PostHint {
  /** Place the person mentioned, as we understood it (e.g. "Colorado"). */
  place: string;
  /** Human name of the post (e.g. "Consulate General of Algeria in San Francisco"). */
  post: string;
  /** Corpus domains belonging to that post. */
  domains: string[];
}

const NY = { post: "Consulate General of Algeria in New York", domains: ["algeria-cgny.org", "cgnewyork.mfa.gov.dz"] };
const SF = { post: "Consulate General of Algeria in San Francisco", domains: ["cgsanfrancisco.mfa.gov.dz"] };
const DC = { post: "Embassy of Algeria in Washington, D.C.", domains: ["embwashington.mfa.gov.dz"] };

/** US states → post. Keys are lowercase full names; abbreviations handled separately. */
const US_STATES: Record<string, [string, typeof NY]> = {
  alabama: ["AL", NY], arkansas: ["AR", NY], connecticut: ["CT", NY], florida: ["FL", NY], georgia: ["GA", NY],
  illinois: ["IL", NY], indiana: ["IN", NY], iowa: ["IA", NY], kentucky: ["KY", NY], louisiana: ["LA", NY],
  maine: ["ME", NY], massachusetts: ["MA", NY], michigan: ["MI", NY], minnesota: ["MN", NY], mississippi: ["MS", NY],
  missouri: ["MO", NY], "new hampshire": ["NH", NY], "new jersey": ["NJ", NY], "new york": ["NY", NY], ohio: ["OH", NY],
  pennsylvania: ["PA", NY], "rhode island": ["RI", NY], tennessee: ["TN", NY], vermont: ["VT", NY], wisconsin: ["WI", NY],
  california: ["CA", SF], arizona: ["AZ", SF], nevada: ["NV", SF], oregon: ["OR", SF], "washington state": ["WA", SF],
  utah: ["UT", SF], colorado: ["CO", SF], hawaii: ["HI", SF], alaska: ["AK", SF], "north dakota": ["ND", SF],
  "south dakota": ["SD", SF], nebraska: ["NE", SF], oklahoma: ["OK", SF], texas: ["TX", SF], kansas: ["KS", SF],
  wyoming: ["WY", SF], montana: ["MT", SF], idaho: ["ID", SF], "new mexico": ["NM", SF],
  delaware: ["DE", DC], maryland: ["MD", DC], "north carolina": ["NC", DC], "south carolina": ["SC", DC],
  virginia: ["VA", DC], "west virginia": ["WV", DC], "washington dc": ["DC", DC], "washington d.c.": ["DC", DC], "district of columbia": ["DC", DC],
};

/** Common cities (incl. frequent misspellings) → state key above. */
const US_CITIES: Record<string, string> = {
  denver: "colorado", dever: "colorado", denvr: "colorado", boulder: "colorado", "colorado springs": "colorado", aurora: "colorado",
  "los angeles": "california", la: "california", "san francisco": "california", sf: "california", "san diego": "california",
  "san jose": "california", oakland: "california", sacramento: "california", irvine: "california",
  houston: "texas", dallas: "texas", austin: "texas", "san antonio": "texas",
  phoenix: "arizona", tucson: "arizona", "las vegas": "nevada", seattle: "washington state", portland: "oregon",
  "salt lake city": "utah", albuquerque: "new mexico", honolulu: "hawaii",
  nyc: "new york", brooklyn: "new york", queens: "new york", manhattan: "new york", bronx: "new york",
  boston: "massachusetts", chicago: "illinois", detroit: "michigan", philadelphia: "pennsylvania", philly: "pennsylvania",
  pittsburgh: "pennsylvania", miami: "florida", orlando: "florida", tampa: "florida", atlanta: "georgia",
  newark: "new jersey", "jersey city": "new jersey", paterson: "new jersey", minneapolis: "minnesota",
  cleveland: "ohio", columbus: "ohio", nashville: "tennessee", "new orleans": "louisiana", "st louis": "missouri",
  baltimore: "maryland", richmond: "virginia", arlington: "virginia", alexandria: "virginia", charlotte: "north carolina",
  raleigh: "north carolina",
};

/** Other posts we have pages for. */
const OTHER: [RegExp, string, string[]][] = [
  [/\b(london|uk|united kingdom|england|scotland|wales|ireland|dublin|manchester|birmingham)\b/i, "Consulate General of Algeria in London", ["cglondon.mfa.gov.dz"]],
  [/\b(milan|milano|italy|italie|rome|roma|turin|torino)\b/i, "Consulate General of Algeria in Milan", ["cgmilan.mfa.gov.dz"]],
  [/\b(istanbul|turkey|turquie|ankara)\b/i, "Consulate General of Algeria in Istanbul", ["cgistanbul.mfa.gov.dz"]],
  [/\b(geneva|genève|geneve|switzerland|suisse)\b/i, "Consulate General of Algeria in Geneva", ["cggeneva.mfa.gov.dz"]],
  [/\b(berlin|germany|allemagne|deutschland|frankfurt|munich)\b/i, "Embassy of Algeria in Berlin", ["embberlin.mfa.gov.dz"]],
  [/\b(brussels|bruxelles|belgium|belgique)\b/i, "Consulate General of Algeria in Brussels", ["cgbrussels.mfa.gov.dz"]],
  [/\b(riyadh|riyad|saudi)\b/i, "Embassy of Algeria in Riyadh", ["embriyadh.mfa.gov.dz"]],
  [/\b(jeddah|djeddah)\b/i, "Consulate General of Algeria in Jeddah", ["cgjeddah.mfa.gov.dz"]],
  [/\b(abu dhabi|dubai|uae|emirates)\b/i, "Embassy of Algeria in Abu Dhabi", ["embabudhabi.mfa.gov.dz"]],
  [/\b(oran|wahran|وهران)\b/i, "Wilaya of Oran (in Algeria)", ["wilayaoran.dz"]],
];

const STATE_ABBR = new Map(Object.entries(US_STATES).map(([name, [abbr, post]]) => [abbr, { name, post }]));

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export function detectPost(text: string): PostHint | null {
  const t = ` ${text.toLowerCase().replace(/[’']/g, "'")} `;
  // Multi-word names first so "west virginia" beats "virginia".
  const states = Object.keys(US_STATES).sort((a, b) => b.length - a.length);
  for (const s of states) {
    if (new RegExp(`[^a-z]${s.replace(/\./g, "\\.")}[^a-z]`).test(t)) {
      const [, p] = US_STATES[s];
      return { place: titleCase(s.replace(" state", "")), ...p };
    }
  }
  const cities = Object.keys(US_CITIES).sort((a, b) => b.length - a.length);
  for (const c of cities) {
    if (c.length <= 2) continue; // "la"/"sf" handled below with stricter matching
    if (new RegExp(`[^a-z]${c}[^a-z]`).test(t)) {
      const st = US_CITIES[c];
      const [, p] = US_STATES[st];
      return { place: `${titleCase(c === "dever" || c === "denvr" ? "denver" : c)}, ${titleCase(st.replace(" state", ""))}`, ...p };
    }
  }
  // Uppercase state abbreviations like "in CO" / "NJ".
  const m = text.match(/\b(in|from|live in|living in|based in)\s+([A-Z]{2})\b/) ?? text.match(/,\s*([A-Z]{2})\b/);
  const ab = m?.[m.length - 1];
  if (ab && STATE_ABBR.has(ab)) {
    const { name, post } = STATE_ABBR.get(ab)!;
    return { place: titleCase(name), ...post };
  }
  if (/\b(sf|bay area)\b/i.test(text)) return { place: "San Francisco, California", ...SF };
  for (const [re, post, domains] of OTHER) {
    const mm = text.match(re);
    if (mm) return { place: titleCase(mm[0]), post, domains };
  }
  return null;
}
