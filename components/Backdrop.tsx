/**
 * Decorative background scenes. Pure SVG/CSS, transform-only animation, aria-hidden,
 * pointer-events:none. Motion stops under prefers-reduced-motion (see globals.css).
 * No flag, emblem or star-and-crescent: landmarks and Amazigh/zellige patterns only.
 */

// Silhouettes, left to right, drawn by hand (generated once from /scripts-free geometry):
// palm · Maqam Echahid · Kasbah houses · mosque with horseshoe arches + Maghrebi minaret · palms ·
// Constantine cliffs + Sidi M'Cid suspension bridge · Timgad (Trajan's arch) · palms · Sahara dunes.
const FILLS = "M112 164 C120 120 126 70 132 28 C134 70 134 120 132 164 Z M188 164 C180 120 174 70 168 28 C166 70 166 120 168 164 Z M140 164 C144 110 148 60 150 12 C152 60 156 110 160 164 Z M118 114 H182 V122 H118 Z M96 164 H204 V172 H96 Z M240 172 V142 H276 V172 Z M247 152 h6 v8 h-6 Z M261 152 h6 v8 h-6 Z M276 172 V130 H310 V172 Z M283 140 h6 v8 h-6 Z M297 140 h6 v8 h-6 Z M310 172 V118 H348 V172 Z M317 128 h6 v8 h-6 Z M331 128 h6 v8 h-6 Z M317 148 h6 v8 h-6 Z M331 148 h6 v8 h-6 Z M348 172 V106 H382 V172 Z M355 116 h6 v8 h-6 Z M369 116 h6 v8 h-6 Z M355 136 h6 v8 h-6 Z M369 136 h6 v8 h-6 Z M355 156 h6 v8 h-6 Z M369 156 h6 v8 h-6 Z M382 172 V96 H422 V172 Z M389 106 h6 v8 h-6 Z M403 106 h6 v8 h-6 Z M389 126 h6 v8 h-6 Z M403 126 h6 v8 h-6 Z M389 146 h6 v8 h-6 Z M403 146 h6 v8 h-6 Z M422 172 V110 H460 V172 Z M429 120 h6 v8 h-6 Z M443 120 h6 v8 h-6 Z M429 140 h6 v8 h-6 Z M443 140 h6 v8 h-6 Z M460 172 V126 H490 V172 Z M467 136 h6 v8 h-6 Z M467 156 h6 v8 h-6 Z M392 96 A10 10 0 0 1 412 96 Z M500 172 V112 H680 V172 Z M518 172 V142 A14 14 0 1 1 542 142 V172 Z M578 172 V142 A14 14 0 1 1 602 142 V172 Z M638 172 V142 A14 14 0 1 1 662 142 V172 Z M502 112 V106 H508 V112 Z M514 112 V106 H520 V112 Z M526 112 V106 H532 V112 Z M538 112 V106 H544 V112 Z M550 112 V106 H556 V112 Z M562 112 V106 H568 V112 Z M574 112 V106 H580 V112 Z M586 112 V106 H592 V112 Z M598 112 V106 H604 V112 Z M610 112 V106 H616 V112 Z M622 112 V106 H628 V112 Z M634 112 V106 H640 V112 Z M646 112 V106 H652 V112 Z M658 112 V106 H664 V112 Z M670 112 V106 H676 V112 Z M680 172 V40 H714 V172 Z M691 70 V62 A7 7 0 1 1 703 62 V70 Z M691 108 V100 A7 7 0 1 1 703 100 V108 Z M688 40 V26 H706 V40 Z M693 26 L697 14 L701 26 Z M680 40 V35 H686 V40 Z M692 40 V35 H698 V40 Z M704 40 V35 H710 V40 Z M790 172 V132 C800 122 814 118 830 114 L846 116 L866 110 L880 112 L884 172 Z M1004 172 L1008 110 L1022 112 L1042 108 C1062 116 1080 126 1090 172 Z M866 112 V72 H878 V112 Z M869 82 h6 v22 h-6 Z M1006 110 V72 H1018 V110 Z M1009 82 h6 v22 h-6 Z M1120 172 V90 H1240 V172 Z M1162 172 V122 A18 18 0 0 1 1198 122 V172 Z M1130 172 V142 A8 8 0 0 1 1146 142 V172 Z M1214 172 V142 A8 8 0 0 1 1230 142 V172 Z M1132 104 h12 v22 h-12 Z M1216 104 h12 v22 h-12 Z M1114 90 V80 H1246 V90 Z";
const DUNES = "M1250 172 C1290 156 1330 146 1372 152 C1410 158 1432 140 1474 132 C1520 124 1560 150 1600 172 Z";
const TRUNKS = "M36 172 Q37.2 133.5 42 102 M742 172 Q743.2 140.1 748 114 M768 172 Q769.2 131.3 774 98 M1452 134 Q1453.2 105.4 1458 82 M1290 160 Q1291.2 134.7 1296 114";
const FRONDS = "M42 102 Q28 94 16 112 M42 102 Q30 102 24 120 M42 102 Q56 94 68 112 M42 102 Q54 102 60 120 M42 102 Q32 90 38 88 M42 102 Q52 88 50 90 M748 114 Q734 106 722 124 M748 114 Q736 114 730 132 M748 114 Q762 106 774 124 M748 114 Q760 114 766 132 M748 114 Q738 102 744 100 M748 114 Q758 100 756 102 M774 98 Q760 90 748 108 M774 98 Q762 98 756 116 M774 98 Q788 90 800 108 M774 98 Q786 98 792 116 M774 98 Q764 86 770 84 M774 98 Q784 84 782 86 M1458 82 Q1444 74 1432 92 M1458 82 Q1446 82 1440 100 M1458 82 Q1472 74 1484 92 M1458 82 Q1470 82 1476 100 M1458 82 Q1448 70 1454 68 M1458 82 Q1468 68 1466 70 M1296 114 Q1282 106 1270 124 M1296 114 Q1284 114 1278 132 M1296 114 Q1310 106 1322 124 M1296 114 Q1308 114 1314 132 M1296 114 Q1286 102 1292 100 M1296 114 Q1306 100 1304 102";
const BRIDGE = "M872 111 H1012 M872 74 Q942 132 1012 74";
const HANGERS = "M886 84.4 V111 M898 91.5 V111 M910 96.9 V111 M922 100.6 V111 M934 102.6 V111 M946 102.9 V111 M958 101.5 V111 M970 98.4 V111 M982 93.5 V111 M994 87.0 V111";
const COLUMNS = "M1150 172 V92 M1210 172 V92";

function Skyline() {
  return (
    <svg viewBox="0 0 1600 172" preserveAspectRatio="none" width="1600" height="172" style={{ width: "var(--sky-w)", height: "100%" }} className="h-full w-auto shrink-0" focusable="false">
      <path d={DUNES} fill="currentColor" opacity="0.45" />
      <path d={FILLS} fill="currentColor" fillRule="evenodd" />
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d={TRUNKS} strokeWidth="3" />
        <path d={FRONDS} strokeWidth="2" />
        <path d={BRIDGE} strokeWidth="2" />
        <path d={HANGERS} strokeWidth="0.8" />
        <path d={COLUMNS} strokeWidth="1.2" opacity="0.5" />
      </g>
    </svg>
  );
}

/** Faint full-page layer: soft glows + slowly drifting zellige tiles. Used on every page. */
export function PageBackdrop({ strong = false }: { strong?: boolean }) {
  return (
    <div aria-hidden="true" dir="ltr" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-glow absolute inset-0" />
      <div className={`bg-zellige absolute -inset-[56px] ${strong ? "bg-zellige-strong" : ""}`} />
    </div>
  );
}

/** Home hero scene: local zellige glow, far dunes, landmark skyline, sea waves, Amazigh border. */
export function HeroBackdrop() {
  return (
    <>
      <div aria-hidden="true" dir="ltr" className="hero-tiles pointer-events-none absolute inset-0 -z-[1] overflow-hidden">
        <div className="bg-zellige bg-zellige-strong absolute -inset-[56px]" />
      </div>
      <div aria-hidden="true" dir="ltr" className="pointer-events-none absolute inset-x-0 bottom-0 -z-[1] h-[124px] overflow-hidden sm:h-[230px]">
      <div className="hero-fade absolute inset-0" />
      <div className="far-dunes absolute bottom-[14px] left-0 h-[84px] sm:bottom-[18px] sm:h-[124px]" />
      <div className="skyline-track absolute bottom-[26px] left-0 flex h-[80px] text-brand [--sky-w:744px] sm:bottom-[40px] sm:h-[172px] sm:[--sky-w:1600px]">
        <Skyline />
        <Skyline />
      </div>
      <div className="sea absolute inset-x-0 bottom-[18px] h-[16px] sm:bottom-[24px]">
        <div className="wave wave-a absolute inset-y-0 left-0" />
        <div className="wave wave-b absolute inset-y-0 left-0 top-[6px]" />
      </div>
      <div className="amazigh absolute bottom-0 left-0 h-[18px] sm:h-[24px]" />
      </div>
    </>
  );
}
