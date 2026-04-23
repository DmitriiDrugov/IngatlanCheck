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
import type { Locale } from './i18n';

const MAX_EXCERPT_LEN = 500;

type Copy = Record<Locale, string>;

interface RuleDefinition {
  key:
    | 'execution'
    | 'litigation'
    | 'insolvency'
    | 'expropriation'
    | 'mortgage'
    | 'usufruct'
    | 'preemption'
    | 'easement'
    | 'pending_note'
    | 'transfer_ban';
  severity: FlagSeverity;
  confidence: ConfidenceLevel;
  patterns: RegExp[];
}

interface LocalizedRule {
  category: string;
  title: string;
  description: string;
  recommendation: string;
}

const RULES: RuleDefinition[] = [
  {
    key: 'execution',
    severity: 'red',
    confidence: 'high',
    patterns: [/v[eé]grehajt[aá]si\s+jog/i, /v[eé]grehajt/i],
  },
  {
    key: 'litigation',
    severity: 'red',
    confidence: 'high',
    patterns: [/perrel\s+kapcsolatos\s+feljegyz/i, /perfeljegyz/i],
  },
  {
    key: 'insolvency',
    severity: 'red',
    confidence: 'high',
    patterns: [/fel\s?sz[aá]mol[aá]s/i, /cs[őo]delj[aá]r[aá]s/i],
  },
  {
    key: 'expropriation',
    severity: 'red',
    confidence: 'high',
    patterns: [/kisaj[aá]t[ií]t/i],
  },
  {
    key: 'mortgage',
    severity: 'yellow',
    confidence: 'high',
    patterns: [/jelz[aá]logjog/i, /jelz[aá]log\s+bejegyez/i],
  },
  {
    key: 'usufruct',
    severity: 'yellow',
    confidence: 'high',
    patterns: [/haszon[eé]lvezeti\s+jog/i, /haszon[eé]lvez/i],
  },
  {
    key: 'preemption',
    severity: 'yellow',
    confidence: 'high',
    patterns: [/el[őo]v[aá]s[aá]rl[aá]si\s+jog/i],
  },
  {
    key: 'easement',
    severity: 'yellow',
    confidence: 'medium',
    patterns: [/szolgalmi\s+jog/i, /[aá]tj[aá]r[aá]si\s+szolgalom/i],
  },
  {
    key: 'pending_note',
    severity: 'yellow',
    confidence: 'medium',
    patterns: [/sz[eé]ljegy/i],
  },
  {
    key: 'transfer_ban',
    severity: 'yellow',
    confidence: 'medium',
    patterns: [
      /elidegen[ií]t[eé]si\s+[eé]s\s+terhel[eé]si\s+tilalom/i,
      /elidegen[ií]t[eé]si\s+tilalom/i,
    ],
  },
];

function translate(locale: Locale, value: Copy): string {
  return value[locale];
}

function localizeRule(key: RuleDefinition['key'], locale: Locale): LocalizedRule {
  const byKey: Record<RuleDefinition['key'], LocalizedRule> = {
    execution: {
      category: translate(locale, {
        hu: 'Végrehajtási jog',
        ru: 'Исполнительное обременение',
        en: 'Execution right',
      }),
      title: translate(locale, {
        hu: 'Végrehajtási jog bejegyezve',
        ru: 'Зарегистрировано исполнительное обременение',
        en: 'Execution right registered',
      }),
      description: translate(locale, {
        hu: 'A dokumentum végrehajtási jog bejegyzést tartalmaz, ami komoly akadálya lehet az adásvételnek.',
        ru: 'В документе найдено исполнительное обременение, которое может серьёзно препятствовать сделке.',
        en: 'The document contains an execution right entry, which may seriously obstruct the purchase.',
      }),
      recommendation: translate(locale, {
        hu: 'Kérjen ügyvédi ellenőrzést, és tisztázza a teher megszűnésének feltételeit a szerződés előtt.',
        ru: 'Попросите юриста проверить запись и уточните условия снятия обременения до подписания сделки.',
        en: 'Ask a lawyer to review the entry and clarify how the encumbrance will be removed before signing.',
      }),
    },
    litigation: {
      category: translate(locale, {
        hu: 'Perfeljegyzés',
        ru: 'Судебная отметка',
        en: 'Litigation note',
      }),
      title: translate(locale, {
        hu: 'Perrel kapcsolatos feljegyzés',
        ru: 'Есть отметка о судебном споре',
        en: 'Litigation-related note found',
      }),
      description: translate(locale, {
        hu: 'Az ingatlanhoz kapcsolódó peres eljárásra utaló bejegyzés szerepel a dokumentumban.',
        ru: 'В документе есть запись, указывающая на судебный спор, связанный с объектом.',
        en: 'The document includes an entry indicating ongoing litigation related to the property.',
      }),
      recommendation: translate(locale, {
        hu: 'Szerződéskötés előtt vizsgáltassa meg a per tárgyát és kockázatát ügyvéddel.',
        ru: 'До сделки попросите юриста проверить предмет спора и связанные риски.',
        en: 'Have a lawyer review the subject and risk of the litigation before proceeding.',
      }),
    },
    insolvency: {
      category: translate(locale, {
        hu: 'Felszámolás',
        ru: 'Неплатёжеспособность',
        en: 'Insolvency',
      }),
      title: translate(locale, {
        hu: 'Felszámolási vagy csődeljárás',
        ru: 'Обнаружена процедура банкротства или ликвидации',
        en: 'Liquidation or insolvency proceeding detected',
      }),
      description: translate(locale, {
        hu: 'A tulajdonoshoz kapcsolódó fizetésképtelenségi eljárás akadályozhatja a tulajdonjog átruházását.',
        ru: 'Процедура банкротства или ликвидации в отношении собственника может осложнить переход права собственности.',
        en: 'An insolvency or liquidation proceeding involving the owner may complicate the transfer of title.',
      }),
      recommendation: translate(locale, {
        hu: 'Az adásvétel előtt egyeztessen ügyvéddel és tisztázza az eljárás státuszát.',
        ru: 'Перед сделкой уточните статус процедуры и проконсультируйтесь с юристом.',
        en: 'Confirm the status of the proceeding with a lawyer before moving forward.',
      }),
    },
    expropriation: {
      category: translate(locale, {
        hu: 'Kisajátítás',
        ru: 'Экспроприация',
        en: 'Expropriation',
      }),
      title: translate(locale, {
        hu: 'Kisajátítási eljárás',
        ru: 'Обнаружена процедура изъятия',
        en: 'Expropriation proceeding detected',
      }),
      description: translate(locale, {
        hu: 'A dokumentum kisajátítási eljárásra utal, ami közvetlen veszélyt jelenthet a tulajdonszerzésre.',
        ru: 'Документ указывает на процедуру изъятия, что напрямую угрожает покупке объекта.',
        en: 'The document points to an expropriation proceeding, which directly threatens the purchase.',
      }),
      recommendation: translate(locale, {
        hu: 'Azonnal kérjen jogi tanácsot az eljárás állapotáról és következményeiről.',
        ru: 'Немедленно получите юридическую консультацию по статусу и последствиям процедуры.',
        en: 'Seek legal advice immediately about the status and consequences of the proceeding.',
      }),
    },
    mortgage: {
      category: translate(locale, {
        hu: 'Jelzálogjog',
        ru: 'Ипотека',
        en: 'Mortgage',
      }),
      title: translate(locale, {
        hu: 'Jelzálogjog bejegyezve',
        ru: 'Зарегистрирована ипотека',
        en: 'Mortgage registered',
      }),
      description: translate(locale, {
        hu: 'Az ingatlanon jelzálogjog szerepel. Ez gyakori, de az adásvétel előtt rendezni kell.',
        ru: 'На объект зарегистрирована ипотека. Это распространённо, но вопрос нужно урегулировать до сделки.',
        en: 'A mortgage is registered against the property. This is common, but it must be settled before completion.',
      }),
      recommendation: translate(locale, {
        hu: 'Kérjen banki igazolást vagy egyeztesse az ügyvéddel a teher rendezésének menetét.',
        ru: 'Запросите банковское подтверждение или согласуйте с юристом порядок снятия ипотеки.',
        en: 'Request bank confirmation or agree with a lawyer on how the mortgage will be cleared.',
      }),
    },
    usufruct: {
      category: translate(locale, {
        hu: 'Haszonélvezeti jog',
        ru: 'Право пользования',
        en: 'Usufruct right',
      }),
      title: translate(locale, {
        hu: 'Haszonélvezeti jog',
        ru: 'Обнаружено право пользования',
        en: 'Usufruct right detected',
      }),
      description: translate(locale, {
        hu: 'Az ingatlanon haszonélvezeti jog áll fenn, ami korlátozhatja a birtokbaadást és használatot.',
        ru: 'На объекте есть право пользования, которое может ограничивать владение и использование.',
        en: 'A usufruct right exists on the property, which may restrict possession and use.',
      }),
      recommendation: translate(locale, {
        hu: 'Tisztázza, ki a jogosult, és milyen feltételekkel szűnhet meg a joga.',
        ru: 'Уточните, кто является правообладателем и на каких условиях это право прекращается.',
        en: 'Clarify who holds the right and under what conditions it can terminate.',
      }),
    },
    preemption: {
      category: translate(locale, {
        hu: 'Elővásárlási jog',
        ru: 'Преимущественное право покупки',
        en: 'Pre-emption right',
      }),
      title: translate(locale, {
        hu: 'Elővásárlási jog',
        ru: 'Есть преимущественное право покупки',
        en: 'Pre-emption right found',
      }),
      description: translate(locale, {
        hu: 'Harmadik fél elővásárlási joga miatt a vételi ajánlat szabályszerű közlése szükséges.',
        ru: 'Из-за преимущественного права третьего лица предложение о покупке нужно надлежащим образом направить правообладателю.',
        en: 'A third party has pre-emption rights, so the purchase offer must be properly served.',
      }),
      recommendation: translate(locale, {
        hu: 'Ügyvéddel ellenőrizze az értesítési folyamatot még a szerződéskötés előtt.',
        ru: 'Проверьте с юристом процедуру уведомления до заключения сделки.',
        en: 'Review the notification process with a lawyer before signing.',
      }),
    },
    easement: {
      category: translate(locale, {
        hu: 'Szolgalmi jog',
        ru: 'Сервитут',
        en: 'Easement',
      }),
      title: translate(locale, {
        hu: 'Szolgalmi jog',
        ru: 'Обнаружен сервитут',
        en: 'Easement detected',
      }),
      description: translate(locale, {
        hu: 'Az ingatlant szolgalmi jog terheli, ami tartós használati korlátozást jelenthet.',
        ru: 'На объекте есть сервитут, который может накладывать долгосрочные ограничения на использование.',
        en: 'An easement burdens the property and may create lasting use restrictions.',
      }),
      recommendation: translate(locale, {
        hu: 'Vizsgálja meg a szolgalom gyakorlati hatását a tervezett használatra.',
        ru: 'Оцените практическое влияние сервитута на планируемое использование объекта.',
        en: 'Assess the practical impact of the easement on the intended use of the property.',
      }),
    },
    pending_note: {
      category: translate(locale, {
        hu: 'Széljegy',
        ru: 'Незавершённая регистрационная отметка',
        en: 'Pending registry note',
      }),
      title: translate(locale, {
        hu: 'Folyamatban lévő széljegy',
        ru: 'Есть незавершённая регистрационная отметка',
        en: 'Pending registry note found',
      }),
      description: translate(locale, {
        hu: 'A tulajdoni lapon széljegy szerepel, ami folyamatban lévő földhivatali ügyre utal.',
        ru: 'В выписке есть отметка о незавершённом регистрационном действии.',
        en: 'The ownership sheet contains a pending registry note, indicating an unresolved filing.',
      }),
      recommendation: translate(locale, {
        hu: 'A szerződés előtt tisztázza, hogy milyen ügy van folyamatban a földhivatalnál.',
        ru: 'До сделки уточните, какое регистрационное действие ещё находится в обработке.',
        en: 'Clarify what filing is still pending at the land registry before proceeding.',
      }),
    },
    transfer_ban: {
      category: translate(locale, {
        hu: 'Elidegenítési és terhelési tilalom',
        ru: 'Запрет отчуждения и обременения',
        en: 'Transfer and encumbrance ban',
      }),
      title: translate(locale, {
        hu: 'Elidegenítési és terhelési tilalom',
        ru: 'Есть запрет на отчуждение или обременение',
        en: 'Transfer or encumbrance ban found',
      }),
      description: translate(locale, {
        hu: 'Az ingatlanon elidegenítési vagy terhelési tilalom szerepel, amit külön ellenőrizni kell.',
        ru: 'На объекте зарегистрирован запрет на отчуждение или дополнительное обременение.',
        en: 'A restriction on transfer or further encumbrance is registered against the property.',
      }),
      recommendation: translate(locale, {
        hu: 'Ellenőrizze, hogy a tilalom milyen kötelezettséghez kapcsolódik, és mikor törölhető.',
        ru: 'Проверьте, с каким обязательством связан запрет и при каких условиях он снимается.',
        en: 'Confirm what obligation the restriction is tied to and how it can be removed.',
      }),
    },
  };

  return byKey[key];
}

function riskScoreFromFlags(flags: AnalysisFlag[]): RiskLevel {
  const red = flags.filter((flag) => flag.severity === 'red').length;
  const yellow = flags.filter((flag) => flag.severity === 'yellow').length;
  if (red >= 2) return 'critical';
  if (red >= 1) return 'high';
  if (yellow >= 3) return 'high';
  if (yellow >= 1) return 'medium';
  return 'low';
}

function truncate(text: string, max = MAX_EXCERPT_LEN): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  return collapsed.length > max ? `${collapsed.slice(0, max - 3)}...` : collapsed;
}

function findEvidence(text: string, pattern: RegExp, contextChars = 180): string | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const start = Math.max(0, match.index - contextChars);
  const end = Math.min(text.length, match.index + match[0].length + contextChars);
  return truncate(text.slice(start, end));
}

function sectionLabel(roman: 'I' | 'II' | 'III', locale: Locale): string {
  if (locale === 'ru') return `${roman} раздел`;
  if (locale === 'en') return `Section ${roman}`;
  return `${roman}. rész`;
}

function detectSection(text: string, roman: 'I' | 'II' | 'III'): string | null {
  const re = new RegExp(`${roman}\\s*\\.?\\s*R\\s*[EÉ3]\\s*S\\s*Z`, 'i');
  const match = re.exec(text);
  if (!match) return null;

  const nextRoman = roman === 'I' ? 'II' : roman === 'II' ? 'III' : null;
  let endIndex = text.length;
  if (nextRoman) {
    const nextRe = new RegExp(`${nextRoman}\\s*\\.?\\s*R\\s*[EÉ3]\\s*S\\s*Z`, 'i');
    const nextMatch = nextRe.exec(text.slice(match.index + match[0].length));
    if (nextMatch) {
      endIndex = match.index + match[0].length + nextMatch.index;
    }
  }

  return text.slice(match.index, endIndex);
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
    /helyrajzi\s+sz[aá]m[:\s]*([0-9][0-9/.\-]*)/i.exec(sectionI) ??
    /\bhrsz\.?[:\s]*([0-9][0-9/.\-]*)/i.exec(sectionI);
  if (hrszMatch) property.helyrajzi_szam = hrszMatch[1].trim();

  const areaMatch =
    /ter[uü]let[:\s]*([0-9]{1,5}(?:[.,][0-9]+)?\s*m(?:2|²))/i.exec(sectionI) ??
    /([0-9]{1,5}(?:[.,][0-9]+)?\s*m(?:2|²))/i.exec(sectionI);
  if (areaMatch) property.terulet = areaMatch[1].trim();

  const nameMatch =
    /megnevez[eé]s[:\s]*([A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s\-]{3,40})/i.exec(sectionI);
  if (nameMatch) {
    property.megnevezes = nameMatch[1].trim().split(/\s{2,}/)[0];
  } else if (/lak[aá]s/i.test(sectionI)) {
    property.megnevezes = 'lakás';
  } else if (/csal[aá]di\s+h[aá]z/i.test(sectionI)) {
    property.megnevezes = 'családi ház';
  } else if (/telek/i.test(sectionI)) {
    property.megnevezes = 'telek';
  }

  return property;
}

function parseOwners(text: string): Owner[] {
  const sectionII = detectSection(text, 'II');
  if (!sectionII) return [];

  const owners: Owner[] = [];
  const shareRegex = /([0-9]+\s*\/\s*[0-9]+)/g;
  const shares = [...sectionII.matchAll(shareRegex)].map((match) =>
    match[1].replace(/\s+/g, '')
  );

  const nameRegex =
    /([A-ZÁÉÍÓÖŐÚÜŰ][A-ZÁÉÍÓÖŐÚÜŰa-záéíóöőúüű.-]{1,30}(?:\s+[A-ZÁÉÍÓÖŐÚÜŰ][A-ZÁÉÍÓÖŐÚÜŰa-záéíóöőúüű.-]{1,30}){1,3})/g;
  const names = [...sectionII.matchAll(nameRegex)]
    .map((match) => match[1].replace(/\s+/g, ' ').trim())
    .filter((name) => {
      if (/\b(Budapest|KER|RÉSZ|RESZ|HRSZ|Oldal|Tulajdonos)\b/i.test(name)) {
        return false;
      }

      const parts = name.split(' ').filter(Boolean);
      if (parts.length < 2) return false;

      const alphaParts = parts.filter((part) => /[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]{3,}/.test(part));
      if (alphaParts.length < 2) return false;

      const suspiciousChars = name.replace(/[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű .-]/g, '');
      return suspiciousChars.length === 0;
    });

  const dateRegex = /(\d{4})[.\-/\s](\d{1,2})[.\-/\s](\d{1,2})/g;
  const dates = [...sectionII.matchAll(dateRegex)].map(
    (match) =>
      `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
  );

  const titleRegex = /(adásvétel|öröklés|ajándékozás|csere|építés|eredeti felvétel)/gi;
  const titles = [...sectionII.matchAll(titleRegex)].map((match) =>
    match[1].toLowerCase()
  );

  const count = Math.max(names.length, shares.length, 0);
  for (let index = 0; index < count; index += 1) {
    owners.push({
      name: names[index] ?? null,
      ownership_share: shares[index] ?? null,
      acquisition_date: dates[index] ?? null,
      acquisition_title: titles[index] ?? null,
    });
  }

  return owners.filter((owner) => owner.name || owner.ownership_share);
}

function detectFlags(
  text: string,
  owners: Owner[],
  hasTerhekSection: boolean,
  locale: Locale
): AnalysisFlag[] {
  const flags: AnalysisFlag[] = [];
  const sectionIII = detectSection(text, 'III') ?? text;

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (!pattern.test(sectionIII)) continue;

      const localized = localizeRule(rule.key, locale);
      flags.push({
        id: randomUUID(),
        severity: rule.severity,
        category: localized.category,
        title: localized.title,
        description: localized.description,
        evidence_excerpt: findEvidence(sectionIII, pattern) ?? '',
        source_section: hasTerhekSection ? sectionLabel('III', locale) : null,
        confidence: rule.confidence,
        recommendation: localized.recommendation,
      });
      break;
    }
  }

  if (owners.length > 1) {
    flags.push({
      id: randomUUID(),
      severity: 'yellow',
      category: translate(locale, {
        hu: 'Közös tulajdon',
        ru: 'Несколько собственников',
        en: 'Shared ownership',
      }),
      title: translate(locale, {
        hu: 'Közös tulajdon - több tulajdonos',
        ru: 'У объекта несколько собственников',
        en: 'The property has multiple owners',
      }),
      description: translate(locale, {
        hu: `Az ingatlannak ${owners.length} azonosítható tulajdonosa van. Az adásvételhez minden tulajdonos hozzájárulása szükséges.`,
        ru: `У объекта определено ${owners.length} собственника(ов). Для сделки потребуется участие всех правообладателей.`,
        en: `The property appears to have ${owners.length} identifiable owners. All owners will need to participate in the transaction.`,
      }),
      evidence_excerpt: truncate(
        owners.map((owner) => `${owner.name ?? '?'} (${owner.ownership_share ?? '?'})`).join('; ')
      ),
      source_section: sectionLabel('II', locale),
      confidence: 'high',
      recommendation: translate(locale, {
        hu: 'Győződjön meg róla, hogy minden tulajdonos részt vesz a szerződéskötésben.',
        ru: 'Проверьте, что все собственники готовы участвовать в подписании сделки.',
        en: 'Make sure every owner is ready to sign and participate in the transaction.',
      }),
    });
  }

  const hasEncumbrance =
    /(jelz[aá]logjog|v[eé]grehajt|haszon[eé]lvez|szolgalmi|el[őo]v[aá]s[aá]rl|sz[eé]ljegy|tilalom)/i.test(
      text
    );
  if (hasTerhekSection && !hasEncumbrance) {
    flags.push({
      id: randomUUID(),
      severity: 'green',
      category: translate(locale, {
        hu: 'Tehermentes',
        ru: 'Без явных обременений',
        en: 'No apparent encumbrance',
      }),
      title: translate(locale, {
        hu: 'Nem találtunk egyértelmű terhet',
        ru: 'Явных обременений не найдено',
        en: 'No clear encumbrance detected',
      }),
      description: translate(locale, {
        hu: 'A dokumentum szövegében nem találtunk egyértelmű teherre vagy korlátozásra utaló mintát.',
        ru: 'В тексте документа не найдено явных шаблонов, указывающих на зарегистрированные обременения или ограничения.',
        en: 'No clear text patterns indicating registered encumbrances or restrictions were detected.',
      }),
      evidence_excerpt: translate(locale, {
        hu: 'A III. részben nem találtunk értelmezhető teherbejegyzést.',
        ru: 'В разделе III не найдено интерпретируемых записей об обременениях.',
        en: 'No interpretable encumbrance entry was found in Section III.',
      }),
      source_section: sectionLabel('III', locale),
      confidence: 'medium',
      recommendation: translate(locale, {
        hu: 'Ez kedvező jelzés, de a szerződés előtt ügyvédi ellenőrzés továbbra is javasolt.',
        ru: 'Это положительный сигнал, но перед покупкой всё равно нужна юридическая проверка.',
        en: 'This is a positive signal, but a legal review is still recommended before purchase.',
      }),
    });
  }

  if (owners.length === 1) {
    flags.push({
      id: randomUUID(),
      severity: 'green',
      category: translate(locale, {
        hu: 'Egyértelmű tulajdon',
        ru: 'Один собственник',
        en: 'Single owner',
      }),
      title: translate(locale, {
        hu: 'Egyetlen tulajdonos azonosítva',
        ru: 'Определён один собственник',
        en: 'Single owner identified',
      }),
      description: translate(locale, {
        hu: 'A dokumentumból egy tulajdonos volt azonosítható, ami egyszerűbbé teheti az adásvételt.',
        ru: 'Из документа удалось определить одного собственника, что обычно упрощает сделку.',
        en: 'One owner could be identified from the document, which can simplify the transaction.',
      }),
      evidence_excerpt: truncate(
        `${owners[0].name ?? '?'} (${owners[0].ownership_share ?? '1/1'})`
      ),
      source_section: sectionLabel('II', locale),
      confidence: 'high',
      recommendation: translate(locale, {
        hu: 'A szerződés előtt ellenőrizze az aláíró személyazonosságát és jogosultságát.',
        ru: 'Перед сделкой проверьте личность и полномочия подписанта.',
        en: 'Verify the identity and authority of the signer before the transaction.',
      }),
    });
  }

  return flags;
}

function computeStats(
  text: string,
  flags: AnalysisFlag[],
  owners: Owner[],
  processingMs: number,
  locale: Locale
): DocumentStats {
  const sections: string[] = [];
  for (const roman of ['I', 'II', 'III'] as const) {
    if (detectSection(text, roman)) sections.push(sectionLabel(roman, locale));
  }

  return {
    character_count: text.length,
    word_count: text.split(/\s+/).filter(Boolean).length,
    line_count: text.split(/\r?\n/).length,
    detected_sections: sections,
    flags_total: flags.length,
    flags_red: flags.filter((flag) => flag.severity === 'red').length,
    flags_yellow: flags.filter((flag) => flag.severity === 'yellow').length,
    flags_green: flags.filter((flag) => flag.severity === 'green').length,
    owners_count: owners.length,
    processing_ms: processingMs,
  };
}

function buildSummary(
  property: PropertyInfo,
  owners: Owner[],
  flags: AnalysisFlag[],
  risk: RiskLevel,
  locale: Locale
): string {
  const parts: string[] = [];

  if (locale === 'ru') {
    if (property.helyrajzi_szam) {
      parts.push(`Кадастровый номер: ${property.helyrajzi_szam}.`);
    } else {
      parts.push('Кадастровый номер не удалось уверенно определить из текста.');
    }

    if (owners.length === 0) {
      parts.push('Собственники не были надёжно извлечены из документа.');
    } else if (owners.length === 1) {
      parts.push(`Определён один собственник${owners[0].name ? `: ${owners[0].name}` : ''}.`);
    } else {
      parts.push(`Определено несколько собственников: ${owners.length}.`);
    }
  } else if (locale === 'en') {
    if (property.helyrajzi_szam) {
      parts.push(`Land registry number: ${property.helyrajzi_szam}.`);
    } else {
      parts.push('The land registry number could not be identified with confidence.');
    }

    if (owners.length === 0) {
      parts.push('No owners could be extracted with confidence from the document.');
    } else if (owners.length === 1) {
      parts.push(`One owner was identified${owners[0].name ? `: ${owners[0].name}` : ''}.`);
    } else {
      parts.push(`${owners.length} owners were identified in the document.`);
    }
  } else {
    if (property.helyrajzi_szam) {
      parts.push(`Helyrajzi szám: ${property.helyrajzi_szam}.`);
    } else {
      parts.push('A helyrajzi számot nem sikerült kellő bizonyossággal azonosítani.');
    }

    if (owners.length === 0) {
      parts.push('Tulajdonos nem volt megbízhatóan kinyerhető a dokumentumból.');
    } else if (owners.length === 1) {
      parts.push(`Egy tulajdonos azonosítható${owners[0].name ? `: ${owners[0].name}` : ''}.`);
    } else {
      parts.push(`${owners.length} tulajdonos azonosítható a dokumentumban.`);
    }
  }

  const red = flags.filter((flag) => flag.severity === 'red').length;
  const yellow = flags.filter((flag) => flag.severity === 'yellow').length;
  const green = flags.filter((flag) => flag.severity === 'green').length;

  if (locale === 'ru') {
    parts.push(`Найдено сигналов: красных ${red}, жёлтых ${yellow}, зелёных ${green}.`);
    parts.push(
      `Итоговый уровень риска: ${translate(locale, {
        hu: '',
        ru: { low: 'низкий', medium: 'средний', high: 'высокий', critical: 'критический' }[risk],
        en: '',
      })}.`
    );
  } else if (locale === 'en') {
    parts.push(`Flags found: ${red} red, ${yellow} yellow, ${green} green.`);
    parts.push(
      `Overall risk level: ${translate(locale, {
        hu: '',
        ru: '',
        en: { low: 'low', medium: 'medium', high: 'high', critical: 'critical' }[risk],
      })}.`
    );
  } else {
    parts.push(`Talált jelzések: ${red} piros, ${yellow} sárga, ${green} zöld.`);
    parts.push(
      `Összesített kockázati szint: ${translate(locale, {
        hu: { low: 'alacsony', medium: 'közepes', high: 'magas', critical: 'kritikus' }[risk],
        ru: '',
        en: '',
      })}.`
    );
  }

  return parts.join(' ');
}

export function analyzeTulajdoniLap(
  rawText: string,
  locale: Locale = 'hu'
): AnalysisResult {
  const startedAt = Date.now();
  const text = rawText.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ');

  const property = parseProperty(text);
  const owners = parseOwners(text);
  const hasTerhekSection = Boolean(detectSection(text, 'III'));
  const flags = detectFlags(text, owners, hasTerhekSection, locale);

  const readable = text.length >= 200;
  const qualityNotes: string[] = [];
  if (!readable) {
    qualityNotes.push(
      translate(locale, {
        hu: 'A dokumentumból nagyon kevés szöveg volt kinyerhető.',
        ru: 'Из документа удалось извлечь очень мало текста.',
        en: 'Very little text could be extracted from the document.',
      })
    );
  }

  if (!hasTerhekSection) {
    flags.push({
      id: randomUUID(),
      severity: 'yellow',
      category: translate(locale, {
        hu: 'Dokumentum minőség',
        ru: 'Качество документа',
        en: 'Document quality',
      }),
      title: translate(locale, {
        hu: 'A III. rész nem azonosítható egyértelműen',
        ru: 'Раздел III не удалось уверенно определить',
        en: 'Section III could not be identified reliably',
      }),
      description: translate(locale, {
        hu: 'A terhekre és jogokra vonatkozó szakasz nem volt egyértelműen felismerhető, ezért az elemzés korlátozott lehet.',
        ru: 'Раздел об обременениях и правах не удалось уверенно распознать, поэтому анализ может быть неполным.',
        en: 'The section about encumbrances and rights could not be recognized reliably, so the analysis may be incomplete.',
      }),
      evidence_excerpt: truncate(text.slice(0, 200)),
      source_section: null,
      confidence: 'medium',
      recommendation: translate(locale, {
        hu: 'Ha lehet, használjon frissebb vagy jobb minőségű, nem torzított PDF-et.',
        ru: 'По возможности используйте более качественный, свежий и не искажённый PDF-файл.',
        en: 'If possible, use a newer, higher-quality, non-distorted PDF document.',
      }),
    });
    qualityNotes.push(
      translate(locale, {
        hu: 'A III. rész (terhek és jogok) nem volt egyértelműen felismerhető.',
        ru: 'Раздел III (обременения и права) не удалось уверенно распознать.',
        en: 'Section III (encumbrances and rights) could not be recognized reliably.',
      })
    );
  }

  if (owners.length === 0) {
    qualityNotes.push(
      translate(locale, {
        hu: 'A tulajdonosi blokk OCR-minősége gyenge lehet, ezért a nevek nem mindig azonosíthatók.',
        ru: 'Качество OCR в блоке собственников может быть слабым, поэтому имена распознаются не всегда.',
        en: 'OCR quality in the owners section may be weak, so names are not always identifiable.',
      })
    );
  }

  const risk = riskScoreFromFlags(flags);
  const processingMs = Date.now() - startedAt;
  const stats = computeStats(text, flags, owners, processingMs, locale);

  return {
    document_quality: {
      readable,
      notes: qualityNotes.length ? qualityNotes.join(' ') : null,
    },
    ingatlan: property,
    tulajdonosok: owners,
    flags,
    risk_score: risk,
    summary: buildSummary(property, owners, flags, risk, locale),
    stats,
  };
}
