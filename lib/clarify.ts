import type { Locale } from "@/lib/i18n";

/**
 * Deterministic "where are you?" questions, asked BEFORE answering when the procedure
 * depends on the person's location and we don't know it yet. Each comes with one-tap chips.
 */

export interface Clarify {
  text: string;
  chips: string[];
}

const COUNTRY: Record<Locale, Clarify> = {
  en: {
    text: "This depends on where you live: abroad it's handled by your Algerian consulate, in Algeria by your commune (APC) or daïra, and documents and fees differ by office.\n\n**Where do you live?**",
    chips: ["I live in Algeria", "USA", "France", "Canada", "United Kingdom", "Another country"],
  },
  fr: {
    text: "Cela dépend de votre lieu de résidence : à l'étranger, c'est votre consulat algérien ; en Algérie, votre commune (APC) ou daïra, et les pièces et frais varient selon le bureau.\n\n**Où habitez-vous ?**",
    chips: ["J'habite en Algérie", "France", "États-Unis", "Canada", "Royaume-Uni", "Autre pays"],
  },
  ar: {
    text: "يعتمد ذلك على مكان إقامتك: في الخارج تتولاه القنصلية الجزائرية التابع لها، وفي الجزائر البلدية أو الدائرة، وتختلف الوثائق والرسوم حسب الجهة.\n\n**أين تقيم؟**",
    chips: ["أقيم في الجزائر", "الولايات المتحدة", "فرنسا", "كندا", "المملكة المتحدة", "بلد آخر"],
  },
  dz: {
    text: "هادي تتبدّل على حساب وين ساكن: برا تديرها في القنصلية تاعك، وفي الدزاير في البلدية ولا الدائرة، والوراق والثمن يتبدّلو من بلاصة لبلاصة.\n\n**وين راك ساكن؟**",
    chips: ["راني في الدزاير", "أمريكا", "فرنسا", "كندا", "بريطانيا", "بلاد أخرى"],
  },
};

const CITY: Record<string, Record<Locale, Clarify>> = {
  "the United States": {
    en: { text: "The US has three Algerian offices (New York, San Francisco and the Embassy in Washington), depending on your state.\n\n**Which state do you live in?**", chips: ["New York", "New Jersey", "California", "Texas", "Florida", "Illinois", "Colorado", "Virginia"] },
    fr: { text: "Aux États-Unis, il y a trois bureaux algériens (New York, San Francisco et l'ambassade à Washington), selon l'État.\n\n**Dans quel État habitez-vous ?**", chips: ["New York", "New Jersey", "California", "Texas", "Florida", "Illinois", "Colorado", "Virginia"] },
    ar: { text: "في الولايات المتحدة ثلاث جهات جزائرية (نيويورك، سان فرانسيسكو، والسفارة في واشنطن) حسب الولاية.\n\n**في أي ولاية تقيم؟**", chips: ["New York", "New Jersey", "California", "Texas", "Florida", "Illinois", "Colorado", "Virginia"] },
    dz: { text: "في أمريكا كاين ثلاث قنصليات (نيويورك، سان فرانسيسكو، والسفارة في واشنطن) على حساب الولاية.\n\n**في واش من ولاية راك؟**", chips: ["New York", "New Jersey", "California", "Texas", "Florida", "Illinois", "Colorado", "Virginia"] },
  },
  France: {
    en: { text: "France has many Algerian consulates, one per area.\n\n**Which city do you live in (or near)?**", chips: ["Paris", "Lyon", "Marseille", "Lille", "Toulouse", "Bordeaux", "Strasbourg", "Nice"] },
    fr: { text: "La France compte de nombreux consulats algériens, un par région.\n\n**Dans quelle ville habitez-vous (ou près de quelle ville) ?**", chips: ["Paris", "Lyon", "Marseille", "Lille", "Toulouse", "Bordeaux", "Strasbourg", "Nice"] },
    ar: { text: "في فرنسا عدة قنصليات جزائرية، لكل منطقة قنصليتها.\n\n**في أي مدينة تقيم (أو قرب أي مدينة)؟**", chips: ["Paris", "Lyon", "Marseille", "Lille", "Toulouse", "Bordeaux", "Strasbourg", "Nice"] },
    dz: { text: "في فرانسا كاين بزاف قنصليات، كل منطقة عندها تاعها.\n\n**في واش من مدينة راك (ولا قريب لواش)؟**", chips: ["Paris", "Lyon", "Marseille", "Lille", "Toulouse", "Bordeaux", "Strasbourg", "Nice"] },
  },
  Canada: {
    en: { text: "Canada has the Consulate General in Montreal and the Embassy in Ottawa.\n\n**Which city do you live in?**", chips: ["Montreal", "Ottawa", "Toronto", "Another city"] },
    fr: { text: "Au Canada : le consulat général à Montréal et l'ambassade à Ottawa.\n\n**Dans quelle ville habitez-vous ?**", chips: ["Montréal", "Ottawa", "Toronto", "Autre ville"] },
    ar: { text: "في كندا القنصلية العامة في مونتريال والسفارة في أوتاوا.\n\n**في أي مدينة تقيم؟**", chips: ["Montreal", "Ottawa", "Toronto", "مدينة أخرى"] },
    dz: { text: "في كندا كاين القنصلية في مونتريال والسفارة في أوتاوا.\n\n**في واش من مدينة راك؟**", chips: ["Montreal", "Ottawa", "Toronto", "مدينة أخرى"] },
  },
};

export function askCountry(lang: Locale): Clarify {
  return COUNTRY[lang];
}

export function askCity(country: string, lang: Locale): Clarify | null {
  return CITY[country]?.[lang] ?? null;
}

/** Answers that mean "somewhere else / I don't know": don't loop, just answer generally. */
export const OTHER_PLACE = /another (country|city)|autre (pays|ville)|بلد آخر|مدينة أخرى|بلاد أخرى|other|toronto/i;
