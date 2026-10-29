import type { Locale } from "@/lib/i18n";
import type { GuidePoint, GuideSection, FeeRow } from "./passport";

/**
 * AADL housing. The corpus holds almost nothing on AADL registration rules:
 * only news mentions of the AADL 3 programme and the CNL's list of state
 * housing programmes. EVERY point below is a restatement of what the cited
 * data/corpus.json records say (ids in `cites`); nothing is added from outside
 * knowledge. If the corpus gains the AADL site's own pages, extend this file.
 */

type L = Record<Locale, string>;
export type { GuidePoint, GuideSection, FeeRow };

const MHUV = "www-mhuv-gov-dz";
const BLIDA = "www-wilayadeblida-dz";
const CNL = "cnl.gov.dz-programmes-aide-logement";
const RURAL = "interieur-gov-dz-2025-01-15-ce2694";

export const GUIDE = {
  title: {
    en: "AADL housing",
    fr: "Logement AADL",
    ar: "سكنات عدل",
    dz: "سكنات عدل (AADL)",
  } as L,
  lead: {
    en: "The official pages we hold say little about AADL itself: no registration steps, eligibility rules, income ceilings or instructions for applying from abroad. What they do say is below; for the rules, use the AADL site.",
    fr: "Les pages officielles que nous détenons disent peu de choses sur l'AADL elle-même : ni démarches d'inscription, ni conditions d'éligibilité, ni plafonds de revenus, ni consignes pour candidater depuis l'étranger. Voici ce qu'elles disent ; pour les règles, consultez le site de l'AADL.",
    ar: "الصفحات الرسمية التي نملكها لا تقول الكثير عن وكالة عدل نفسها: لا خطوات للتسجيل ولا شروط للاستفادة ولا سقوف للدخل ولا تعليمات للتقدّم من الخارج. وفيما يلي ما تذكره؛ وللقواعد راجع موقع الوكالة.",
    dz: "الصفحات الرسمية لي عندنا ما تقول بزاف على عدل (AADL) روحها: لا خطوات التسجيل، لا شروط الاستفادة، لا سقف المداخيل، ولا كيفاش تقدم من الغربة. هذا واش تقول؛ وللقواعد شوف موقع عدل.",
  } as L,
  portals: [
    { url: "https://www.aadl.dz/", label: { en: "AADL (National Housing Improvement and Development Agency)", fr: "AADL (Agence nationale de l'amélioration et du développement du logement)", ar: "عدل (الوكالة الوطنية لتحسين السكن وتطويره)", dz: "عدل (الوكالة الوطنية لتحسين السكن وتطويره)" } as L },
    { url: "https://www.mhuv.gov.dz/", label: { en: "Ministry of Housing, Urban Planning and the City", fr: "Ministère de l'Habitat, de l'Urbanisme et de la Ville", ar: "وزارة السكن والعمران والمدينة", dz: "وزارة السكن والعمران والمدينة" } as L },
    { url: "https://www.cnl.gov.dz/", label: { en: "CNL (National Housing Fund)", fr: "CNL (Caisse nationale du logement)", ar: "الصندوق الوطني للسكن", dz: "الصندوق الوطني للسكن" } as L },
  ],
  sections: [
    {
      id: "programme",
      title: { en: "What the pages say about AADL 3", fr: "Ce que disent les pages sur AADL 3", ar: "ما تذكره الصفحات عن عدل 3", dz: "واش تقول الصفحات على عدل 3" },
      points: [
        { cites: [MHUV], text: {
          en: "The Ministry of Housing's news feed describes AADL 3 (\"عدل 3\") projects as housing built under the sale-by-rental (البيع بالإيجار) formula, and reports the housing minister inspecting their readiness, for example 600 units in Oum El Bouaghi and 400 units in Mila. It does not give registration or eligibility rules.",
          fr: "Le fil d'actualités du ministère de l'Habitat décrit les projets AADL 3 (« عدل 3 ») comme des logements réalisés selon la formule de vente par location (البيع بالإيجار), et rapporte que le ministre a inspecté leur état de préparation, par exemple 600 unités à Oum El Bouaghi et 400 unités à Mila. Il ne donne pas de règles d'inscription ni d'éligibilité.",
          ar: "تصف الأخبار المنشورة في موقع وزارة السكن مشاريع «عدل 3» بأنها سكنات منجزة بصيغة البيع بالإيجار، وتنقل معاينة وزير السكن لمدى جاهزيتها، مثل 600 وحدة في أم البواقي و400 وحدة في ميلة. ولا تذكر قواعد التسجيل أو الاستفادة.",
          dz: "الأخبار تاع موقع وزارة السكن تقول مشاريع «عدل 3» هي سكنات تتبنى بصيغة البيع بالإيجار، وتحكي بلي وزير السكن شاف واش وصلت الجاهزية، مثلا 600 وحدة في أم البواقي و400 وحدة في ميلة. وما تذكرش قواعد التسجيل ولا الاستفادة." } },
        { cites: [BLIDA], text: {
          en: "The Blida wilaya site reports that the wali chaired a meeting on all the allocation procedures for the AADL 3 housing programme, including connection to utility networks, roads and external works. This is a local news item, not a guide to applying.",
          fr: "Le site de la wilaya de Blida rapporte que le wali a présidé une réunion consacrée à toutes les procédures d'attribution du programme de logements AADL 3, ainsi qu'au raccordement aux réseaux, aux routes et à l'aménagement extérieur. Il s'agit d'une actualité locale, pas d'un guide de candidature.",
          ar: "يذكر موقع ولاية البليدة أن الوالي ترأس اجتماعًا خُصّص لكل إجراءات توزيع برنامج سكنات «عدل 3» وكذا الربط بالشبكات والطرق والتهيئة الخارجية. وهو خبر محلي وليس دليلًا للتقدّم بالطلب.",
          dz: "موقع ولاية البليدة يقول الوالي ترأس اجتماع على كل إجراءات توزيع برنامج سكنات «عدل 3» وكذلك الربط بالشبكات، الطرق والتهيئة الخارجية. هذا خبر محلي ماشي دليل باش تقدم الطلب." } },
      ],
    },
    {
      id: "other-aid",
      title: { en: "Other state housing programmes", fr: "Autres programmes de logement de l'État", ar: "برامج السكن الأخرى للدولة", dz: "برامج السكن لخرين تاع الدولة" },
      points: [
        { cites: [CNL], text: {
          en: "The CNL lists the State's housing-aid programmes: Rural Housing, Public Rental Housing, Location-vente (rental-purchase), the older Subsidised Promotional Housing and Special Programmes for disasters such as earthquakes and floods. For public rental and location-vente it says households must not have owned a home or building land and must stay under a monthly income ceiling; the ceilings are not shown. The page does not mention AADL by name.",
          fr: "La CNL liste les programmes d'aide au logement de l'État : Habitat rural, Logement public locatif, Location-vente, l'ancien Logement promotionnel aidé et les Programmes spéciaux liés aux catastrophes comme séismes et inondations. Pour le logement public locatif et la location-vente, elle indique que les ménages ne doivent avoir possédé ni logement ni terrain à bâtir et rester sous un plafond de revenu mensuel ; les plafonds ne sont pas affichés. La page ne cite pas l'AADL.",
          ar: "يعرض الصندوق الوطني للسكن برامج مساعدة الدولة في السكن: السكن الريفي، والسكن العمومي الإيجاري، والبيع بالإيجار، وصيغة السكن الترقوي المدعم القديمة، والبرامج الخاصة المتعلقة بالكوارث مثل الزلازل والفيضانات. وبالنسبة للسكن العمومي الإيجاري والبيع بالإيجار يذكر أنه يُشترط ألا تكون الأسرة قد امتلكت سكنًا أو قطعة أرض للبناء وألا يتجاوز دخلها الشهري سقفًا محددًا؛ ولا تظهر السقوف في الصفحة. ولا تذكر الصفحة وكالة عدل بالاسم.",
          dz: "الصندوق الوطني للسكن يعطي لايست تاع برامج مساعدة الدولة في السكن: السكن الريفي، السكن العمومي الإيجاري، البيع بالإيجار (Location-vente)، صيغة الترقوي المدعم القديمة والبرامج الخاصة بالكوارث كيما الزلازل والفيضانات. للسكن العمومي الإيجاري والبيع بالإيجار يقول لازم العائلة ما تكونش ملكت سكن ولا قطعة أرض للبناء وتكون تحت سقف دخل شهري؛ والسقوف ما ظاهرينش في الصفحة. والصفحة ما تذكرش عدل بالاسم." } },
        { cites: [RURAL], text: {
          en: "For State aid to build rural housing, the Interior Ministry's page lists: the couple's income at or below six times the national guaranteed minimum wage; no full ownership of residential property; no building plot unless it is meant for the aided rural home; and no earlier public rental, rent-to-own, participatory social housing or public aid. The file (request form, proof of income, residence certificate, proof of a buildable plot) goes to the commune, on paper or via prestations.interieur.gov.dz/guichet.",
          fr: "Pour l'aide de l'État à la construction d'un logement rural, la page du ministère de l'Intérieur indique : revenu du couple inférieur ou égal à six fois le salaire national minimum garanti ; pas de pleine propriété d'un bien à usage d'habitation ; pas de terrain constructible sauf s'il est destiné au logement rural aidé ; et pas de bénéfice antérieur d'un logement public locatif, d'une vente par location, d'un logement social participatif ou d'une aide publique. Le dossier (formulaire de demande, justificatifs de revenus, certificat de résidence, justificatif de détention d'un terrain constructible) se dépose à la commune, sur papier ou via prestations.interieur.gov.dz/guichet.",
          ar: "بخصوص مساعدة الدولة لبناء سكن ريفي، تذكر صفحة وزارة الداخلية: دخل الزوجين يساوي أو يقل عن ستة أضعاف الأجر الوطني الأدنى المضمون؛ عدم ملكية عقار سكني ملكية تامة؛ عدم امتلاك قطعة أرض صالحة للبناء إلا إذا كانت مخصصة للسكن الريفي المدعم؛ وعدم الاستفادة سابقًا من سكن عمومي إيجاري أو بيع بالإيجار أو سكن اجتماعي تساهمي أو إعانة عمومية. ويودَع الملف (طلب الإعانة، وإثبات المداخيل، وشهادة الإقامة، ووثيقة حيازة قطعة صالحة للبناء) لدى البلدية، ورقيًا أو عبر prestations.interieur.gov.dz/guichet.",
          dz: "للمساعدة تاع الدولة في بناء سكن ريفي، صفحة وزارة الداخلية تقول: دخل الزوجين ما يفوتش ست مرات الأجر الوطني الأدنى المضمون؛ ما تكونش مالك عقار سكني ملكية تامة؛ ما عندكش قطعة أرض للبناء غير إذا كانت مخصصة للسكن الريفي المدعم؛ وما استفدتش قبل من سكن عمومي إيجاري، بيع بالإيجار، سكن اجتماعي تساهمي ولا إعانة عمومية. الملف (طلب المساعدة، إثبات المداخيل، شهادة الإقامة، ورقة قطعة الأرض) يتودع في البلدية، ورقي ولا من prestations.interieur.gov.dz/guichet." } },
      ],
    },
  ] as GuideSection[],
  fees: [] as FeeRow[],
};
