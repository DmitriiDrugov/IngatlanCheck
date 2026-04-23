import { randomUUID } from 'crypto';
import type {
  AnalysisFlag,
  AnalysisResult,
  ConfidenceLevel,
  DocumentStats,
  FlagSeverity,
  Owner,
  PropertyInfo,
  RiskLevel,
} from './types';

/**
 * Deterministic Hungarian "tulajdoni lap" analyzer.
 *
 * Parses the extracted PDF text using rules based on the standard structure:
 *   I. rész  — property (ingatlan) data
 *   II. rész — owners (tulajdonosok)
 *   III. rész — encumbrances and rights (terhek és jogok)
 *
 * No AI. Every flag is tied to a textual excerpt from the document.
 */

const MAX_EXCERPT_LEN = 500;

interface FlagRule {
  category: string;
  severity: FlagSeverity;
  title_hu: string;
  description_hu: string;
  recommendation_hu: string;
  patterns: RegExp[];
  confidence: ConfidenceLevel;
}

const RED_RULES: FlagRule[] = [
  {
    category: 'Végrehajtási jog',
    severity: 'red',
    title_hu: 'Végrehajtási jog bejegyezve',
    description_hu:
      'A dokumentum végrehajtási jog bejegyzést tartalmaz, ami azt jelenti, hogy az ingatlanra végrehajtási eljárás folyik. Ez komoly akadálya lehet az adásvételnek.',
    recommendation_hu:
      'Kérjen ügyvédi ellenőrzést, és győződjön meg róla, hogy a végrehajtási jog megszűnik az adásvétel előtt.',
    patterns: [/v[eé]grehajt[aá]si\s+jog/i],
    confidence: 'high',
  },
  {
    category: 'Perfeljegyzés',
    severity: 'red',
    title_hu: 'Perrel kapcsolatos feljegyzés',
    description_hu:
      'Az ingatlanhoz kapcsolódóan peres eljárás van folyamatban vagy bejegyezve. Az adásvétel eredménye függhet a per kimenetelétől.',
    recommendation_hu:
      'Kérje meg ügyvédjét a per tárgyának és esélyeinek vizsgálatára, mielőtt szerződést kötne.',
    patterns: [/perrel\s+kapcsolatos\s+feljegyz/i, /perfeljegyz/i],
    confidence: 'high',
  },
  {
    category: 'Felszámolás',
    severity: 'red',
    title_hu: 'Felszámolási vagy csődeljárás',
    description_hu:
      'A tulajdonos ellen felszámolási vagy csődeljárás folyik, ami megakadályozhatja a tulajdonjog átruházását.',
    recommendation_hu:
      'Ne kezdjen adásvételbe az eljárás lezárulta előtt — egyeztessen ügyvéddel.',
    patterns: [/fel\s?sz[aá]mol[aá]s/i, /cs[oő]delj[aá]r[aá]s/i],
    confidence: 'high',
  },
  {
    category: 'Kisajátítás',
    severity: 'red',
    title_hu: 'Kisajátítási eljárás',
    description_hu:
      'Az ingatlanra kisajátítási eljárás van folyamatban. Ez közvetlen veszélyt jelent a tulajdonszerzésre.',
    recommendation_hu:
      'Azonnal kérjen jogi tanácsot az eljárás állapotáról és következményeiről.',
    patterns: [/kisaj[aá]t[ií]t/i],
    confidence: 'high',
  },
];

const YELLOW_RULES: FlagRule[] = [
  {
    category: 'Jelzálogjog',
    severity: 'yellow',
    title_hu: 'Jelzálogjog bejegyezve',
    description_hu:
      'Az ingatlanon jelzálogjog van bejegyezve (tipikusan bank javára). Ez gyakori, de az adásvétel előtt rendezni kell.',
    recommendation_hu:
      'Kérje az eladótól a jelzálog törléséről szóló banki igazolást, vagy egyeztessen ügyvéddel a letéti megoldásról.',
    patterns: [/jelz[aá]logjog/i, /jelz[aá]log\s+bejegyez/i],
    confidence: 'high',
  },
  {
    category: 'Haszonélvezeti jog',
    severity: 'yellow',
    title_hu: 'Haszonélvezeti jog',
    description_hu:
      'Az ingatlanon haszonélvezeti jog áll fenn. A haszonélvező jogosult használni az ingatlant a tulajdonossal szemben is.',
    recommendation_hu:
      'Ellenőrizze, ki a haszonélvező és milyen feltételekkel szűnhet meg a jog. Vegye figyelembe az árban is.',
    patterns: [/haszon[eé]lvezeti\s+jog/i, /haszon[eé]lvez/i],
    confidence: 'high',
  },
  {
    category: 'Elővásárlási jog',
    severity: 'yellow',
    title_hu: 'Elővásárlási jog',
    description_hu:
      'Harmadik félnek elővásárlási joga van az ingatlanra. Az adásvétel előtt az ajánlatot közölni kell vele.',
    recommendation_hu:
      'Az ügyvéd gondoskodjon az elővásárlásra jogosult szabályszerű értesítéséről.',
    patterns: [/el[oő]v[aá]s[aá]rl[aá]si\s+jog/i],
    confidence: 'high',
  },
  {
    category: 'Szolgalmi jog',
    severity: 'yellow',
    title_hu: 'Szolgalmi jog',
    description_hu:
      'Az ingatlant szolgalmi jog terheli (pl. átjárás, vezeték). Ez tartósan korlátozhatja a használatot.',
    recommendation_hu:
      'Vizsgálja meg a szolgalom tartalmát és gyakorlati hatását a tervezett használatra.',
    patterns: [/szolgalmi\s+jog/i, /[aá]tj[aá]r[aá]si\s+szolgalom/i],
    confidence: 'medium',
  },
  {
    category: 'Széljegy',
    severity: 'yellow',
    title_hu: 'Folyamatban lévő széljegy',
    description_hu:
      'A tulajdoni lapon széljegy szerepel, ami azt jelzi, hogy egy beadvány még elintézés alatt áll.',
    recommendation_hu:
      'Várja meg a széljegy feldolgozását, vagy ellenőrizze a földhivatali ügy tartalmát, mielőtt szerződne.',
    patterns: [/sz[eé]ljegy/i],
    confidence: 'medium',
  },
  {
    category: 'Elidegenítési és terhelési tilalom',
    severity: 'yellow',
    title_hu: 'Elidegenítési és terhelési tilalom',
    description_hu:
      'Az ingatlanon elidegenítési és terhelési tilalom van. Banki jelzáloghoz kapcsolódóan ez szokványos, de minden esetben ellenőrizni kell.',
    recommendation_hu:
      'Ellenőrizze, hogy a tilalom banki hitelhez kapcsolódik-e, és tisztázza a törlés feltételeit.',
    patterns: [
      /elidegen[ií]t[eé]si\s+[eé]s\s+terhel[eé]si\s+tilalom/i,
      /elidegen[ií]t[eé]si\s+tilalom/i,
    ],
    confidence: 'medium',
  },
];

function riskScoreFromFlags(flags: AnalysisFlag[]): RiskLevel {
  const red = flags.filter((f) => f.severity === 'red').length;
  const yellow = flags.filter((f) => f.severity === 'yellow').length;
  if (red >= 2) return 'critical';
  if (red >= 1) return 'high';
  if (yellow >= 3) return 'high';
  if (yellow >= 1) return 'medium';
  return 'low';
}

function truncate(text: string, max = MAX_EXCERPT_LEN): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  return collapsed.length > max ? collapsed.slice(0, max - 1) + '…' : collapsed;
}

function findEvidence(
  text: string,
  pattern: RegExp,
  contextChars = 180
): string | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const start = Math.max(0, match.index - contextChars);
  const end = Math.min(text.length, match.index + match[0].length + contextChars);
  return truncate(text.slice(start, end));
}

function detectSection(text: string, roman: 'I' | 'II' | 'III'): string | null {
  const re = new RegExp(`${roman}\\.\\s*R[EÉe][Ss][Zz]`, 'i');
  const m = re.exec(text);
  if (!m) return null;
  const nextRoman = roman === 'I' ? 'II' : roman === 'II' ? 'III' : null;
  let endIdx = text.length;
  if (nextRoman) {
    const nextRe = new RegExp(`${nextRoman}\\.\\s*R[EÉe][Ss][Zz]`, 'i');
    const nm = nextRe.exec(text.slice(m.index + m[0].length));
    if (nm) endIdx = m.index + m[0].length + nm.index;
  }
  return text.slice(m.index, endIdx);
}

function parseProperty(text: string): PropertyInfo {
  const property: PropertyInfo = {
    cim: null,
    helyrajzi_szam: null,
    terulet: null,
    megnevezes: null,
  };

  const sectionI = detectSection(text, 'I') ?? text;

  const hrszMatch =
    /helyrajzi\s+sz[aá]m[:\s]*([0-9][0-9\/.\-]*)/i.exec(sectionI) ??
    /\bhrsz\.?[:\s]*([0-9][0-9\/.\-]*)/i.exec(sectionI);
  if (hrszMatch) property.helyrajzi_szam = hrszMatch[1].trim();

  const addrMatch =
    /c[ií]m[:\s]*([^\n\r]{5,120})/i.exec(sectionI) ??
    /\b(\d{4}\s+[A-ZÁÉÍÓÖŐÚÜŰ][^\n\r]{3,120})/.exec(sectionI);
  if (addrMatch) property.cim = addrMatch[1].trim().replace(/\s{2,}/g, ' ');

  const areaMatch =
    /ter[uü]let[:\s]*([0-9]{1,5}(?:[.,][0-9]+)?\s*m[²2])/i.exec(sectionI) ??
    /([0-9]{1,5}(?:[.,][0-9]+)?\s*m[²2])/i.exec(sectionI);
  if (areaMatch) property.terulet = areaMatch[1].trim();

  const nameMatch =
    /megnevez[eé]s[:\s]*([A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s\-]{3,40})/i.exec(sectionI);
  if (nameMatch) property.megnevezes = nameMatch[1].trim().split(/\s{2,}/)[0];
  else if (/lak[aá]s/i.test(sectionI)) property.megnevezes = 'lakás';
  else if (/csal[aá]di\s+h[aá]z/i.test(sectionI)) property.megnevezes = 'családi ház';
  else if (/telek/i.test(sectionI)) property.megnevezes = 'telek';

  return property;
}

function parseOwners(text: string): Owner[] {
  const sectionII = detectSection(text, 'II');
  if (!sectionII) return [];

  const owners: Owner[] = [];

  const shareRegex =
    /tulajdoni\s+h[aá]nyad[:\s]*([0-9]+\s*\/\s*[0-9]+)/gi;
  let shareMatch: RegExpExecArray | null;
  const shares: string[] = [];
  while ((shareMatch = shareRegex.exec(sectionII)) !== null) {
    shares.push(shareMatch[1].replace(/\s+/g, ''));
  }

  const nameRegex =
    /n[eé]v[:\s]*([A-ZÁÉÍÓÖŐÚÜŰ][A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\-]{1,30}(?:\s+[A-ZÁÉÍÓÖŐÚÜŰ][A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\-]{1,30}){0,3})/g;
  const names: string[] = [];
  let nameMatch: RegExpExecArray | null;
  while ((nameMatch = nameRegex.exec(sectionII)) !== null) {
    names.push(nameMatch[1].trim());
  }

  const dateRegex = /(\d{4})[.\-\s/](\d{1,2})[.\-\s/](\d{1,2})/g;
  const dates: string[] = [];
  let dateMatch: RegExpExecArray | null;
  while ((dateMatch = dateRegex.exec(sectionII)) !== null) {
    dates.push(`${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`);
  }

  const titleRegex =
    /(ad[aá]sv[eé]tel|[oö]r[oö]kl[eé]s|aj[aá]nd[eé]koz[aá]s|csere|[eé]p[ií]t[eé]s)/gi;
  const titles: string[] = [];
  let titleMatch: RegExpExecArray | null;
  while ((titleMatch = titleRegex.exec(sectionII)) !== null) {
    titles.push(titleMatch[1].toLowerCase());
  }

  const count = Math.max(names.length, shares.length, 1);
  for (let i = 0; i < count; i++) {
    owners.push({
      name: names[i] ?? null,
      ownership_share: shares[i] ?? null,
      acquisition_date: dates[i] ?? null,
      acquisition_title: titles[i] ?? null,
    });
  }

  return owners.filter((o) => o.name || o.ownership_share);
}

function detectFlags(text: string): AnalysisFlag[] {
  const flags: AnalysisFlag[] = [];
  const sectionIII = detectSection(text, 'III') ?? text;

  const tryRules = (rules: FlagRule[]) => {
    for (const rule of rules) {
      for (const pattern of rule.patterns) {
        if (pattern.test(sectionIII)) {
          const evidence = findEvidence(sectionIII, pattern) ?? '';
          flags.push({
            id: randomUUID(),
            severity: rule.severity,
            category: rule.category,
            title_hu: rule.title_hu,
            description_hu: rule.description_hu,
            evidence_excerpt: evidence,
            source_section: 'III. rész',
            confidence: rule.confidence,
            recommendation_hu: rule.recommendation_hu,
          });
          break;
        }
      }
    }
  };

  tryRules(RED_RULES);
  tryRules(YELLOW_RULES);

  const owners = parseOwners(text);
  if (owners.length > 1) {
    flags.push({
      id: randomUUID(),
      severity: 'yellow',
      category: 'Közös tulajdon',
      title_hu: 'Közös tulajdon — több tulajdonos',
      description_hu: `Az ingatlannak ${owners.length} tulajdonosa van. Adásvételhez minden tulajdonos hozzájárulása szükséges.`,
      evidence_excerpt: truncate(
        owners
          .map((o) => `${o.name ?? '?'} (${o.ownership_share ?? '?'})`)
          .join('; ')
      ),
      source_section: 'II. rész',
      confidence: 'high',
      recommendation_hu:
        'Győződjön meg róla, hogy minden tulajdonos aláírja az adásvételi szerződést.',
    });
  }

  const hasEncumbrance =
    /(jelz[aá]logjog|v[eé]grehajt|haszon[eé]lvez|szolgalmi|el[oő]v[aá]s[aá]rl|sz[eé]ljegy|tilalom)/i.test(
      text
    );
  if (!hasEncumbrance) {
    flags.push({
      id: randomUUID(),
      severity: 'green',
      category: 'Tehermentes',
      title_hu: 'Tehermentes ingatlan',
      description_hu:
        'A dokumentum szövegében nem találtunk bejegyzett terhet vagy korlátozást.',
      evidence_excerpt: 'Nem található teher- vagy jogbejegyzés a III. részben.',
      source_section: 'III. rész',
      confidence: 'medium',
      recommendation_hu:
        'Kedvező jelzés, de az adásvétel előtt ügyvédi ellenőrzés továbbra is javasolt.',
    });
  }

  if (owners.length === 1) {
    flags.push({
      id: randomUUID(),
      severity: 'green',
      category: 'Egyértelmű tulajdon',
      title_hu: 'Egyetlen tulajdonos',
      description_hu:
        'Az ingatlannak egyetlen tulajdonosa azonosítható, ami egyszerűsíti az adásvételt.',
      evidence_excerpt: truncate(
        `${owners[0].name ?? '?'} (${owners[0].ownership_share ?? '1/1'})`
      ),
      source_section: 'II. rész',
      confidence: 'high',
      recommendation_hu:
        'Ellenőrizze az aláíró személyazonosságát az adásvétel előtt.',
    });
  }

  return flags;
}

function computeStats(
  text: string,
  flags: AnalysisFlag[],
  owners: Owner[],
  processingMs: number
): DocumentStats {
  const sections: string[] = [];
  for (const roman of ['I', 'II', 'III'] as const) {
    if (detectSection(text, roman)) sections.push(`${roman}. rész`);
  }

  return {
    character_count: text.length,
    word_count: text.split(/\s+/).filter(Boolean).length,
    line_count: text.split(/\r?\n/).length,
    detected_sections: sections,
    flags_total: flags.length,
    flags_red: flags.filter((f) => f.severity === 'red').length,
    flags_yellow: flags.filter((f) => f.severity === 'yellow').length,
    flags_green: flags.filter((f) => f.severity === 'green').length,
    owners_count: owners.length,
    processing_ms: processingMs,
  };
}

function buildSummary(
  property: PropertyInfo,
  owners: Owner[],
  flags: AnalysisFlag[],
  risk: RiskLevel
): string {
  const parts: string[] = [];

  const propDesc = property.cim
    ? `Az ingatlan címe: ${property.cim}`
    : property.helyrajzi_szam
      ? `Helyrajzi szám: ${property.helyrajzi_szam}`
      : 'Az ingatlan azonosító adatai nem voltak egyértelműen kinyerhetőek';
  parts.push(propDesc + '.');

  if (owners.length === 0) {
    parts.push('Tulajdonosi adatok nem voltak egyértelműen azonosíthatók a dokumentumból.');
  } else if (owners.length === 1) {
    parts.push(
      `Egyetlen tulajdonos azonosítva${owners[0].name ? `: ${owners[0].name}` : ''}.`
    );
  } else {
    parts.push(`Közös tulajdon — ${owners.length} tulajdonos szerepel a dokumentumban.`);
  }

  const red = flags.filter((f) => f.severity === 'red').length;
  const yellow = flags.filter((f) => f.severity === 'yellow').length;
  if (red > 0) {
    parts.push(`${red} kiemelt kockázat (piros jelzés) található a dokumentumban.`);
  }
  if (yellow > 0) {
    parts.push(`${yellow} további ellenőrzést igénylő bejegyzés (sárga jelzés).`);
  }
  if (red === 0 && yellow === 0) {
    parts.push('Nem találtunk jelentős kockázati jelzést a dokumentumban.');
  }

  const riskLabel: Record<RiskLevel, string> = {
    low: 'alacsony',
    medium: 'közepes',
    high: 'magas',
    critical: 'kritikus',
  };
  parts.push(`Összesített kockázati szint: ${riskLabel[risk]}.`);

  return parts.join(' ');
}

export function analyzeTulajdoniLap(rawText: string): AnalysisResult {
  const startedAt = Date.now();
  const text = rawText.replace(/ /g, ' ');

  const property = parseProperty(text);
  const owners = parseOwners(text);
  const flags = detectFlags(text);
  const risk = riskScoreFromFlags(flags);

  const readable = text.length >= 200;
  const qualityNotes: string[] = [];
  if (!readable) qualityNotes.push('A dokumentum rövid, lehet, hogy nem teljes.');
  if (!detectSection(text, 'III')) {
    qualityNotes.push('A III. rész (terhek) nem azonosítható egyértelműen.');
    flags.push({
      id: randomUUID(),
      severity: 'yellow',
      category: 'Dokumentum minőség',
      title_hu: 'Hiányos vagy rosszul olvasható szakasz',
      description_hu:
        'A III. rész (terhek és jogok) nem azonosítható egyértelműen, így a terhekre vonatkozó elemzés korlátozott.',
      evidence_excerpt: truncate(text.slice(0, 200)),
      source_section: null,
      confidence: 'medium',
      recommendation_hu:
        'Kérjen friss, hiteles tulajdoni lap másolatot a földhivataltól.',
    });
  }

  const processingMs = Date.now() - startedAt;
  const stats = computeStats(text, flags, owners, processingMs);
  const summary = buildSummary(property, owners, flags, risk);

  return {
    document_quality: {
      readable,
      notes_hu: qualityNotes.length ? qualityNotes.join(' ') : null,
    },
    ingatlan: property,
    tulajdonosok: owners,
    flags,
    risk_score: risk,
    summary_hu: summary,
    stats,
  };
}
