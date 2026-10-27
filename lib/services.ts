import raw from "@/data/services.json";
import type { Locale } from "@/lib/i18n";

type L = Record<Locale, string>;
export interface Service {
  id: string;
  icon: string;
  page?: string;
  name: L;
  line: L;
  question: L;
  portals: { url: string; label?: L }[];
}

export const SERVICES: Service[] = (raw as unknown as Service[]).filter((s) => s && s.id && s.name && Array.isArray(s.portals));
