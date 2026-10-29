import { PASSPORT_GUIDE } from "./passport";
import { GUIDE as BIRTH_12S } from "./birth-12s";
import { GUIDE as CIVIL_STATUS } from "./civil-status";
import { GUIDE as CRIMINAL_RECORD } from "./criminal-record";
import { GUIDE as NATIONALITY } from "./nationality";
import { GUIDE as CONSULAR_REGISTRATION } from "./consular-registration";
import { GUIDE as NATIONAL_SERVICE } from "./national-service";
import { GUIDE as CNAS } from "./cnas";
import { GUIDE as AADL } from "./aadl";

export type Guide = typeof PASSPORT_GUIDE;

/** Service guides by URL slug (/services/<slug>). Each is built only from cited data/corpus.json records. */
export const GUIDES: Record<string, Guide> = {
  passport: PASSPORT_GUIDE,
  "birth-12s": BIRTH_12S,
  "civil-status": CIVIL_STATUS,
  "criminal-record": CRIMINAL_RECORD,
  nationality: NATIONALITY,
  "consular-registration": CONSULAR_REGISTRATION,
  "national-service": NATIONAL_SERVICE,
  cnas: CNAS,
  aadl: AADL,
};
