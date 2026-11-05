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

/** French consular posts: real sites are consulat-<city>-algerie.fr (listed on amb-algerie.fr). */
const fr = (slug: string, name: string): Office => ({
  post: name,
  site: `https://www.consulat-${slug}-algerie.fr`,
  domains: [`consulat-${slug}-algerie.fr`, "amb-algerie.fr"],
});
const NY: Office = { post: "Consulate General of Algeria in New York", site: "https://algeria-cgny.org", domains: ["algeria-cgny.org", "cgnewyork.mfa.gov.dz"] };
const SF: Office = mfa("cgsanfrancisco", "Consulate General of Algeria in San Francisco");
const DC: Office = mfa("embwashington", "Embassy of Algeria in Washington, D.C.");
const ALGERIA = (city: string, portal?: string): Office => ({
  post: `local administration in Algeria (APC/commune or daïra of ${city})`,
  // The wilaya's own portal first, then national Interior pages and the best-covered wilaya portals as examples.
  domains: [...(portal ? [portal] : []), "interieur.gov.dz", "wilayaoran.dz", "wilaya-bouira.dz", "wilaya-djelfa.dz"],
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

/** US state names in Arabic and French → the English key of US_STATES. */
const STATE_ALIASES: Record<string, string> = {
  "ألاباما": "alabama", "اركنساس": "arkansas", "أركنساس": "arkansas", "كونيتيكت": "connecticut", "فلوريدا": "florida",
  "جورجيا": "georgia", "إلينوي": "illinois", "الينوي": "illinois", "إنديانا": "indiana", "انديانا": "indiana", "أيوا": "iowa",
  "كنتاكي": "kentucky", "لويزيانا": "louisiana", "مين": "maine", "ماساتشوستس": "massachusetts", "ميشيغان": "michigan",
  "ميشيغن": "michigan", "مينيسوتا": "minnesota", "ميسيسيبي": "mississippi", "ميزوري": "missouri", "نيوهامبشير": "new hampshire",
  "نيوجيرسي": "new jersey", "نيو جيرسي": "new jersey", "نيوجرسي": "new jersey", "أوهايو": "ohio", "اوهايو": "ohio",
  "بنسلفانيا": "pennsylvania", "رود آيلاند": "rhode island", "تينيسي": "tennessee", "فيرمونت": "vermont", "ويسكونسن": "wisconsin",
  "كاليفورنيا": "california", "أريزونا": "arizona", "اريزونا": "arizona", "نيفادا": "nevada", "أوريغون": "oregon",
  "اوريغون": "oregon", "يوتا": "utah", "كولورادو": "colorado", "هاواي": "hawaii", "ألاسكا": "alaska", "الاسكا": "alaska",
  "داكوتا الشمالية": "north dakota", "داكوتا الجنوبية": "south dakota", "نبراسكا": "nebraska", "أوكلاهوما": "oklahoma",
  "اوكلاهوما": "oklahoma", "تكساس": "texas", "كانساس": "kansas", "وايومنغ": "wyoming", "مونتانا": "montana", "أيداهو": "idaho",
  "نيو مكسيكو": "new mexico", "نيومكسيكو": "new mexico", "ديلاوير": "delaware", "ماريلاند": "maryland", "ميريلاند": "maryland",
  "كارولاينا الشمالية": "north carolina", "كارولينا الشمالية": "north carolina", "كارولاينا الجنوبية": "south carolina",
  "كارولينا الجنوبية": "south carolina", "فيرجينيا": "virginia", "فرجينيا": "virginia", "فيرجينيا الغربية": "west virginia",
  "floride": "florida", "géorgie": "georgia", "georgie": "georgia", "californie": "california", "louisiane": "louisiana",
  "pennsylvanie": "pennsylvania", "virginie": "virginia", "virginie-occidentale": "west virginia", "caroline du nord": "north carolina",
  "caroline du sud": "south carolina", "nouveau-mexique": "new mexico", "nouveau mexique": "new mexico", "dakota du nord": "north dakota",
  "dakota du sud": "south dakota", "nouvelle-angleterre": "massachusetts", "état de washington": "washington state",
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
  [["paris", "باريس", "barís"], "Paris", fr("paris", "Consulate General of Algeria in Paris")],
  [["nanterre"], "Nanterre", fr("nanterre", "Consulate of Algeria in Nanterre")],
  [["pontoise", "cergy"], "Pontoise", fr("pontoise", "Consulate of Algeria in Pontoise")],
  [["créteil", "creteil"], "Créteil", fr("creteil", "Consulate of Algeria in Créteil")],
  [["bobigny", "saint-denis", "seine-saint-denis"], "Bobigny", fr("bobigny", "Consulate of Algeria in Bobigny")],
  [["lyon", "ليون"], "Lyon", fr("lyon", "Consulate General of Algeria in Lyon")],
  [["marseille", "مرسيليا"], "Marseille", fr("marseille", "Consulate General of Algeria in Marseille")],
  [["lille", "ليل"], "Lille", fr("lille", "Consulate General of Algeria in Lille")],
  [["strasbourg"], "Strasbourg", fr("strasbourg", "Consulate General of Algeria in Strasbourg")],
  [["toulouse", "تولوز"], "Toulouse", fr("toulouse", "Consulate of Algeria in Toulouse")],
  [["bordeaux"], "Bordeaux", fr("bordeaux", "Consulate of Algeria in Bordeaux")],
  [["montpellier"], "Montpellier", fr("montpellier", "Consulate of Algeria in Montpellier")],
  [["grenoble"], "Grenoble", fr("grenoble", "Consulate of Algeria in Grenoble")],
  [["metz"], "Metz", fr("metz", "Consulate of Algeria in Metz")],
  [["besançon", "besancon"], "Besançon", fr("besancon", "Consulate of Algeria in Besançon")],
  [["nice"], "Nice", fr("nice", "Consulate of Algeria in Nice")],
  [["saint-étienne", "saint-etienne", "st-etienne", "st etienne"], "Saint-Étienne", fr("saint-etienne", "Consulate of Algeria in Saint-Étienne")],
  [["nantes"], "Nantes", fr("nantes", "Consulate of Algeria in Nantes")],
  // Canada
  [["montreal", "montréal", "مونتريال", "quebec", "québec"], "Montreal", { post: "Consulate General of Algeria in Montreal", site: "http://consulatalgeriemontreal.com", domains: ["consulatalgeriemontreal.com"] }],
  [["sherbrooke", "laval", "longueuil", "trois-rivières", "trois-rivieres", "halifax", "nova scotia", "nouvelle-écosse", "new brunswick", "nouveau-brunswick", "moncton", "newfoundland", "terre-neuve", "prince edward island", "île-du-prince-édouard"], "Eastern Canada", { post: "Consulate General of Algeria in Montreal", site: "http://consulatalgeriemontreal.com", domains: ["consulatalgeriemontreal.com"] }],
  // Ottawa's consular section covers Ontario, the West, the territories and Gatineau (embassyalgeria.ca/consulat).
  [["toronto", "تورونتو", "تورنتو", "ontario", "أونتاريو", "اونتاريو", "mississauga", "hamilton", "brampton", "kitchener", "waterloo", "gatineau", "outaouais", "vancouver", "فانكوفر", "british columbia", "colombie-britannique", "calgary", "كالغاري", "edmonton", "إدمونتون", "alberta", "ألبرتا", "winnipeg", "manitoba", "saskatchewan", "regina", "saskatoon", "yukon", "victoria bc"], "Ontario / Western Canada", { post: "Embassy of Algeria in Ottawa (consular section)", site: "https://www.embassyalgeria.ca", domains: ["embassyalgeria.ca"] }],
  [["ottawa", "أوتاوا"], "Ottawa", { post: "Embassy of Algeria in Ottawa (consular section)", site: "https://www.embassyalgeria.ca", domains: ["embassyalgeria.ca"] }],
  // UK & Europe & others
  [["london", "لندن", "united kingdom", "england", "scotland", "wales", "manchester", "birmingham", "uk", "بريطانيا", "المملكة المتحدة", "royaume-uni", "royaume uni"], "United Kingdom", { post: "Consulate General of Algeria in London", site: "https://algerian-consulate.org.uk", domains: ["algerian-consulate.org.uk", "cglondon.mfa.gov.dz"] }],
  [["dublin", "ireland", "irlande", "أيرلندا", "ايرلندا"], "Ireland", mfa("embdublin", "Embassy of Algeria in Dublin")],
  [["milan", "milano", "ميلانو", "italy", "italie", "إيطاليا", "rome", "roma", "turin", "torino"], "Italy", mfa("cgmilan", "Consulate General of Algeria in Milan")],
  [["istanbul", "إسطنبول", "اسطنبول", "turkey", "turquie", "تركيا"], "Turkey", mfa("cgistanbul", "Consulate General of Algeria in Istanbul")],
  [["geneva", "genève", "geneve", "جنيف", "switzerland", "suisse", "سويسرا"], "Switzerland", mfa("cggeneva", "Consulate General of Algeria in Geneva")],
  [["berlin", "برلين", "germany", "allemagne", "deutschland", "ألمانيا", "frankfurt", "munich"], "Germany", mfa("embberlin", "Embassy of Algeria in Berlin")],
  [["brussels", "bruxelles", "بروكسل", "belgium", "belgique", "بلجيكا"], "Belgium", mfa("cgbrussels", "Consulate General of Algeria in Brussels")],
  [["madrid", "مدريد", "spain", "espagne", "españa", "إسبانيا", "اسبانيا", "سبانيا", "sbanya", "spania"], "Spain", mfa("embmadrid", "Embassy of Algeria in Madrid")],
  [["riyadh", "riyad", "الرياض", "saudi", "السعودية"], "Saudi Arabia", mfa("embriyadh", "Embassy of Algeria in Riyadh")],
  [["jeddah", "djeddah", "جدة"], "Jeddah", mfa("cgjeddah", "Consulate General of Algeria in Jeddah")],
  [["abu dhabi", "dubai", "uae", "emirates", "أبوظبي", "دبي", "الإمارات"], "United Arab Emirates", mfa("embabudhabi", "Embassy of Algeria in Abu Dhabi")],
  [["doha", "qatar", "قطر", "الدوحة"], "Qatar", mfa("embdoha", "Embassy of Algeria in Doha")],
  // Inside Algeria
  // All 69 wilayas (58 + 11 created by the Nov 2025 territorial law); portal domain where an official one is known.
  [["adrar", "أدرار"], "Adrar", ALGERIA("Adrar", "wilaya-adrar.dz")],
  [["chlef", "الشلف"], "Chlef", ALGERIA("Chlef", "wilaya-chlef.dz")],
  [["laghouat", "الأغواط"], "Laghouat", ALGERIA("Laghouat", "wilaya-laghouat.dz")],
  [["oum el bouaghi", "oum-el-bouaghi", "أم البواقي"], "Oum El Bouaghi", ALGERIA("Oum El Bouaghi")],
  [["batna", "باتنة"], "Batna", ALGERIA("Batna", "wilaya-batna.gov.dz")],
  [["bejaia", "béjaïa", "بجاية"], "Béjaïa", ALGERIA("Béjaïa", "wilaya-bejaia.dz")],
  [["biskra", "بسكرة"], "Biskra", ALGERIA("Biskra", "wilayabiskra.dz")],
  [["bechar", "béchar", "بشار"], "Béchar", ALGERIA("Béchar", "wilaya-bechar.gov.dz")],
  [["blida", "البليدة"], "Blida", ALGERIA("Blida", "wilayadeblida.dz")],
  [["bouira", "البويرة"], "Bouira", ALGERIA("Bouira", "wilaya-bouira.dz")],
  [["tamanrasset", "تمنراست"], "Tamanrasset", ALGERIA("Tamanrasset")],
  [["tebessa", "tébessa", "تبسة"], "Tébessa", ALGERIA("Tébessa", "wilaya-tebessa.dz")],
  [["tlemcen", "تلمسان"], "Tlemcen", ALGERIA("Tlemcen", "wilaya-tlemcen.dz")],
  [["tiaret", "تيارت"], "Tiaret", ALGERIA("Tiaret", "wilaya-tiaret.dz")],
  [["tizi ouzou", "tizi-ouzou", "تيزي وزو"], "Tizi Ouzou", ALGERIA("Tizi Ouzou", "dcwtiziouzou.dz")],
  [["alger"], "Alger", ALGERIA("Alger", "wilaya-alger.dz")],
  [["djelfa", "الجلفة"], "Djelfa", ALGERIA("Djelfa", "wilaya-djelfa.dz")],
  [["jijel", "جيجل"], "Jijel", ALGERIA("Jijel")],
  [["setif", "sétif", "سطيف"], "Sétif", ALGERIA("Sétif", "wilayasetif.dz")],
  [["saida", "saïda", "سعيدة"], "Saïda", ALGERIA("Saïda", "wilaya-saida.dz")],
  [["skikda", "سكيكدة"], "Skikda", ALGERIA("Skikda")],
  [["sidi bel abbes", "sidi bel abbès", "sidi-bel-abbes", "سيدي بلعباس"], "Sidi Bel Abbès", ALGERIA("Sidi Bel Abbès", "wilaya-sidibelabbes.dz")],
  [["annaba", "عنابة"], "Annaba", ALGERIA("Annaba")],
  [["guelma", "قالمة"], "Guelma", ALGERIA("Guelma")],
  [["constantine", "قسنطينة"], "Constantine", ALGERIA("Constantine", "wilayaconstantine.dz")],
  [["medea", "médéa", "المدية"], "Médéa", ALGERIA("Médéa", "wilayamedea.dz")],
  [["mostaganem", "مستغانم"], "Mostaganem", ALGERIA("Mostaganem", "wilaya-mostaganem.dz")],
  [["m'sila", "msila", "المسيلة"], "M'Sila", ALGERIA("M'Sila", "msilawilaya.dz")],
  [["mascara", "معسكر"], "Mascara", ALGERIA("Mascara", "wilayamascara.dz")],
  [["ouargla", "ورقلة"], "Ouargla", ALGERIA("Ouargla")],
  [["oran", "وهران"], "Oran", ALGERIA("Oran", "wilayaoran.dz")],
  [["el bayadh", "el-bayadh", "البيض"], "El Bayadh", ALGERIA("El Bayadh", "wilaya-elbayadh.gov.dz")],
  [["illizi", "إليزي"], "Illizi", ALGERIA("Illizi", "illizi-wilaya.dz")],
  [["bordj bou arreridj", "bordj bou arréridj", "bordj-bou-arreridj", "برج بوعريريج"], "Bordj Bou Arréridj", ALGERIA("Bordj Bou Arréridj")],
  [["boumerdes", "boumerdès", "بومرداس"], "Boumerdès", ALGERIA("Boumerdès", "wilaya-boumerdes.dz")],
  [["el tarf", "el-tarf", "الطارف"], "El Tarf", ALGERIA("El Tarf")],
  [["tindouf", "تندوف"], "Tindouf", ALGERIA("Tindouf", "wilaya-tindouf.dz")],
  [["tissemsilt", "تيسمسيلت"], "Tissemsilt", ALGERIA("Tissemsilt", "wilaya-tissemsilt.dz")],
  [["el oued", "el-oued", "الوادي"], "El Oued", ALGERIA("El Oued")],
  [["khenchela", "خنشلة"], "Khenchela", ALGERIA("Khenchela", "wilaya-khenchela.dz")],
  [["souk ahras", "souk-ahras", "سوق أهراس"], "Souk Ahras", ALGERIA("Souk Ahras")],
  [["tipaza", "تيبازة"], "Tipaza", ALGERIA("Tipaza")],
  [["mila", "ميلة"], "Mila", ALGERIA("Mila")],
  [["ain defla", "ain-defla", "aïn defla", "عين الدفلى"], "Aïn Defla", ALGERIA("Aïn Defla")],
  [["naama", "naâma", "النعامة"], "Naâma", ALGERIA("Naâma", "wilaya-naama.dz")],
  [["ain temouchent", "ain-temouchent", "aïn témouchent", "عين تموشنت"], "Aïn Témouchent", ALGERIA("Aïn Témouchent", "wilaya-aintemouchent.dz")],
  [["ghardaia", "ghardaïa", "غرداية"], "Ghardaïa", ALGERIA("Ghardaïa")],
  [["relizane", "غليزان"], "Relizane", ALGERIA("Relizane")],
  [["timimoun", "تيميمون"], "Timimoun", ALGERIA("Timimoun")],
  [["bordj badji mokhtar", "bordj-badji-mokhtar", "برج باجي مختار"], "Bordj Badji Mokhtar", ALGERIA("Bordj Badji Mokhtar")],
  [["ouled djellal", "ouled-djellal", "أولاد جلال"], "Ouled Djellal", ALGERIA("Ouled Djellal", "wilaya-ouleddjellal.dz")],
  [["beni abbes", "beni-abbes", "béni abbès", "بني عباس"], "Béni Abbès", ALGERIA("Béni Abbès", "wilaya-beniabbes.dz")],
  [["in salah", "in-salah", "عين صالح"], "In Salah", ALGERIA("In Salah")],
  [["in guezzam", "in-guezzam", "عين قزام"], "In Guezzam", ALGERIA("In Guezzam")],
  [["touggourt", "تقرت"], "Touggourt", ALGERIA("Touggourt")],
  [["djanet", "جانت"], "Djanet", ALGERIA("Djanet")],
  [["el m'ghair", "el mghair", "el-m'ghair", "المغير"], "El M'Ghair", ALGERIA("El M'Ghair")],
  [["el meniaa", "el-meniaa", "المنيعة"], "El Meniaa", ALGERIA("El Meniaa", "wilaya-meniaa.dz")],
  [["aflou", "أفلو"], "Aflou", ALGERIA("Aflou")],
  [["barika", "بريكة"], "Barika", ALGERIA("Barika")],
  [["el kantara", "el-kantara", "القنطرة"], "El Kantara", ALGERIA("El Kantara")],
  [["bir el ater", "bir-el-ater", "بئر العاتر"], "Bir El Ater", ALGERIA("Bir El Ater")],
  [["el aricha", "el-aricha", "العريشة"], "El Aricha", ALGERIA("El Aricha")],
  [["ksar chellala", "ksar-chellala", "قصر الشلالة"], "Ksar Chellala", ALGERIA("Ksar Chellala")],
  [["ain oussera", "ain-oussera", "aïn oussera", "عين وسارة"], "Aïn Oussera", ALGERIA("Aïn Oussera")],
  [["messaad", "مسعد"], "Messaad", ALGERIA("Messaad")],
  [["ksar el boukhari", "ksar-el-boukhari", "قصر البخاري"], "Ksar El Boukhari", ALGERIA("Ksar El Boukhari")],
  [["bou saada", "bou saâda", "bou-saada", "بوسعادة"], "Bou Saâda", ALGERIA("Bou Saâda")],
  [["el abiodh sidi cheikh", "el-abiodh-sidi-cheikh", "الأبيض سيدي الشيخ"], "El Abiodh Sidi Cheikh", ALGERIA("El Abiodh Sidi Cheikh")],
  [["algiers", "الجزائر العاصمة", "العاصمة", "دزاير العاصمة", "dzayer el 3assima"], "Alger", ALGERIA("Alger", "wilaya-alger.dz")],
  [["wahran", "وهران"], "Oran", ALGERIA("Oran", "wilayaoran.dz")],
  [["bgayet", "vgayet"], "Béjaïa", ALGERIA("Béjaïa", "wilaya-bejaia.dz")],
  [["tizi", "تيزي"], "Tizi Ouzou", ALGERIA("Tizi Ouzou", "dcwtiziouzou.dz")],
  // Living in Algeria (generic). Plain "in Algeria"/"في الجزائر" is NOT here: "register my marriage in Algeria" is said from abroad.
  [["i live in algeria", "living in algeria", "i'm in algeria", "im in algeria", "i am in algeria", "based in algeria", "j'habite en algérie", "j'habite en algerie", "je vis en algérie", "je vis en algerie", "je suis en algérie", "je suis en algerie", "أقيم في الجزائر", "أسكن في الجزائر", "اسكن في الجزائر", "ساكن في الجزائر", "نسكن في الجزائر", "أعيش في الجزائر", "اعيش في الجزائر", "راني في الدزاير", "راني فالدزاير", "rani f dzayer", "rani fi dzayer", "rani fl bled", "ana f dzayer", "nskon f dzayer", "انا في دزاير", "أنا في دزاير", "وانا في دزاير", "وأنا في دزاير", "انا في الدزاير", "وانا في الدزاير", "راني في دزاير", "راني فدزاير", "انا في الجزائر", "أنا في الجزائر", "وانا في الجزائر", "وأنا في الجزائر"], "Algeria", ALGERIA("your wilaya")],
];

// Countries with several Algerian posts: ask for the city instead of guessing.
const MULTI_POST: [string[], string][] = [
  [["france", "فرنسا", "فرانسا", "fransa", "franca"], "France"],
  [["usa", "united states", "états-unis", "etats-unis", "america", "أمريكا", "امريكا", "الولايات المتحدة", "mirikan", "lmirikan"], "the United States"],
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

/** Place names that are also everyday words: only count after "in / à / في …". */
const LOCATIVE_ONLY = new Set(["mascara", "saida", "saïda", "سعيدة", "معسكر", "البيض", "الوادي", "المدية", "ميلة", "mila", "adrar", "naama", "naâma", "النعامة", "barika", "aflou", "messaad"]);

/** Words right before a place that say the person lives there ("moved to Lille", "j'habite à Lyon", "ساكن في"). */
const RESIDES =
  /(?:live in|living in|lives in|moved (?:from [\p{L} .'-]{2,20} )?to|déménagée? (?:de [\p{L} .'-]{2,20} )?(?:à|a)|now in|based in|reside in|habite (?:à|a|en)|j'habite|vis (?:à|a|en)|installée? (?:à|a|en)|déménagée? (?:à|a|en)|ساكن في|ساكنة في|نسكن في|أسكن في|اسكن في|أقيم في|اقيم في|نعيش في|أعيش في|انتقلت إلى|n3ich f|nskon f|saken f)\s*$/iu;

/** The 69 wilayas (Latin name + Arabic name), for the "where do you live?" picker. */
export const WILAYAS: { name: string; ar: string }[] = (() => {
  const out: { name: string; ar: string }[] = [];
  const seen = new Set<string>();
  for (const [names, place, office] of PLACES) {
    if (!office.inAlgeria || seen.has(place) || /algeria/i.test(names[0])) continue;
    seen.add(place);
    out.push({ name: place, ar: names.find((n) => /[\u0600-\u06FF]/.test(n)) ?? (place === "Alger" ? "الجزائر" : place) });
  }
  return out;
})();

/** Procedures that depend on the person's office: ask where they live first (no mixed answer from random consulates). */
export const LOCATION_FIRST = ["passport", "cni", "birth_certificate", "civil_status", "criminal_record", "nationality", "consular_registration", "legalization", "national_service", "driving_vehicle"];

export function detectPost(text: string): PostHint | null {
  const t = text.replace(/[’']/g, "'");
  // 1. Named cities/countries (longest names first so "new york city" beats "york").
  const entries = PLACES.flatMap(([names, place, office]) => names.map((n) => [n, place, office] as const)).sort(
    (a, b) => b[0].length - a[0].length,
  );
  // Several places named ("in Toronto, do I go to Montreal?"): the one mentioned first is where they are.
  const found: { at: number; pos: number; len: number; hint: PostHint }[] = [];
  for (const [name, place, office] of entries) {
    if (LOCATIVE_ONLY.has(name) && !new RegExp(`(?:^|\\s)(?:in|à|a|de|from|near|f|fi|في|ف|ب)\\s*${name}(?![\\p{L}])`, "iu").test(t)) continue;
    if (name === "nice" && !/(?:^|\s)(in|à|de|from|depuis|near|près de|pres de|f|fi)\s+nice(?![\p{L}])/iu.test(t) && !/(?:^|\s)a\s+Nice(?![\p{L}])/u.test(t)) continue;
    if (has(t, name)) {
      const at = t.toLowerCase().search(new RegExp(`(?<![\\p{L}\\p{N}])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu"));
      const before = at > 0 ? t.slice(Math.max(0, at - 28), at) : "";
      const lives = RESIDES.test(before);
      found.push({ at: lives ? -1 : at < 0 ? 1e9 : at, pos: at, len: name.length, hint: { place, ...office } });
    }
  }
  // Overlapping matches ("وأنا في الجزائر" + "الجزائر العاصمة"): the one that runs further names the place more precisely.
  const kept = found.filter((f) => !found.some((g) => g !== f && g.pos > f.pos && g.pos < f.pos + f.len && g.pos + g.len > f.pos + f.len));
  if (kept.length) return kept.sort((a, b) => a.at - b.at || b.len - a.len)[0].hint;
  // 2. "LA" written in capitals means Los Angeles in practice.
  if (/(?<![\p{L}])LA(?![\p{L}])/u.test(t)) return { place: "Los Angeles, California", ...SF };
  // 3. US state names.
  for (const s of Object.keys(US_STATES).sort((a, b) => b.length - a.length)) {
    if (has(t, s)) return { place: titleCase(s.replace(" state", "")), ...US_STATES[s] };
  }
  for (const a of Object.keys(STATE_ALIASES).sort((x, y) => y.length - x.length)) {
    if (a === "مين" && !/(?:في|ف|ب)\s*مين(?![\p{L}])/u.test(t)) continue; // "Maine" vs "who"
    if (has(t, a) || has(t, `ال${a}`)) {
      const s = STATE_ALIASES[a];
      return { place: titleCase(s.replace(" state", "")), ...US_STATES[s] };
    }
  }
  // 4. Two-letter state codes, only in capitals and in a location-like position.
  const m =
    t.match(/\b(?:in|from|live in|living in|based in|near)\s+([A-Z]{2})\b/) ??
    t.match(/,\s*([A-Z]{2})\b/) ??
    // "I'm in rockville MD", "living in austin tx": city then a state code at the end.
    t.match(/\b(?:in|from|near)\s+[A-Za-z .'-]{2,30}?\s([A-Za-z]{2})\s*[.!?]?\s*$/);
  // Lowercase codes only when they can't be an ordinary word ("ok", "in", "me", "hi", "or", "la" stay out).
  const SAFE_LOWER = new Set(["tx", "ca", "ny", "nj", "fl", "il", "md", "va", "nc", "sc", "az", "nv", "mi", "wi", "mn", "tn", "ky", "ut", "nm", "ks", "ia", "ct", "ri", "nh", "vt", "wv", "dc"]);
  if (m && m[1] !== m[1].toUpperCase() && !SAFE_LOWER.has(m[1])) m[1] = "";
  if (m) m[1] = m[1].toUpperCase();
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

/** US states (display name) with the domains of the office that serves each, for the /embassies helper. */
export function usStateOffices(): { state: string; domains: string[]; post: string }[] {
  const names: Record<string, string> = { "washington state": "Washington (state)", "washington dc": "Washington, D.C." };
  const skip = new Set(["washington d.c.", "district of columbia"]);
  return Object.entries(US_STATES)
    .filter(([k]) => !skip.has(k))
    .map(([k, o]) => ({ state: names[k] ?? titleCase(k), domains: o.domains, post: o.post }))
    .sort((a, b) => a.state.localeCompare(b.state));
}

/** Approximate location from the hosting platform (Netlify x-nf-geo, or Vercel x-vercel-ip-* headers). */
export interface GeoHint {
  country?: string; // ISO code, e.g. "US", "DZ", "FR"
  countryName?: string;
  region?: string; // e.g. "CO"
  regionName?: string; // e.g. "Colorado"
  city?: string;
}

export function readGeo(headers: Headers): GeoHint | null {
  const raw = headers.get("x-nf-geo");
  if (raw) {
    try {
      const j = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as {
        city?: string;
        country?: { code?: string; name?: string };
        subdivision?: { code?: string; name?: string };
      };
      return { country: j.country?.code, countryName: j.country?.name, region: j.subdivision?.code, regionName: j.subdivision?.name, city: j.city };
    } catch {
      /* fall through */
    }
  }
  // Vercel: x-vercel-ip-country (ISO), x-vercel-ip-country-region (ISO 3166-2 code, e.g. "CO"), x-vercel-ip-city (URL-encoded).
  const vc = headers.get("x-vercel-ip-country");
  if (vc) {
    const city = headers.get("x-vercel-ip-city");
    let cityName: string | undefined;
    try {
      cityName = city ? decodeURIComponent(city) : undefined;
    } catch {
      cityName = city ?? undefined;
    }
    return { country: vc.toUpperCase(), region: headers.get("x-vercel-ip-country-region") ?? undefined, city: cityName };
  }
  const c = headers.get("x-country") ?? headers.get("cf-ipcountry");
  return c ? { country: c.toUpperCase() } : null;
}

/** Turns an approximate connection location into the office that serves it (null if unknown). */
export function postFromGeo(g: GeoHint | null): PostHint | null {
  if (!g?.country) return null;
  const cc = g.country.toUpperCase();
  if (cc === "DZ") return { place: g.city ? `${g.city}, Algeria` : "Algeria", ...ALGERIA(g.city || "your wilaya") };
  if (cc === "US" && g.region && STATE_ABBR[g.region.toUpperCase()]) {
    const s = STATE_ABBR[g.region.toUpperCase()];
    const state = titleCase(s.replace(" state", ""));
    return { place: g.city ? `${g.city}, ${state}` : state, ...US_STATES[s] };
  }
  // Other countries: reuse the city/country name tables.
  return detectPost(`${g.city ?? ""} ${g.countryName ?? ""}`.trim());
}
