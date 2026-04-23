import { cookies } from 'next/headers';

export const LOCALES = ['hu', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

const DEFAULT_LOCALE: Locale = 'hu';

export const MESSAGES = {
  hu: {
    app_name: 'IngatlanCheck',
    tagline: 'Ingatlanellenőrzés vásárlás előtt',
    language_label: 'Nyelv',
    language_hu: 'Magyar',
    language_ru: 'Русский',
    language_en: 'English',
    nav_home: 'Kezdőlap',
    nav_upload: 'Feltöltés',
    nav_stats: 'Statisztika',
    nav_privacy: 'Adatvédelem',
    hero_title: 'Ellenőrizd az ingatlant vásárlás előtt',
    hero_subtitle:
      'Töltsd fel a tulajdoni lapot, és néhány másodperc alatt strukturált kockázati elemzést kapsz a bejegyzett terhekről, tulajdonosokról és figyelmeztető jelekről.',
    hero_cta_primary: 'Tulajdoni lap feltöltése',
    hero_cta_secondary: 'Statisztikák megtekintése',
    benefits_title: 'Miért IngatlanCheck?',
    benefit_speed_title: 'Gyors elemzés',
    benefit_speed_desc:
      'Pár másodperc alatt strukturált jelentést kapsz a dokumentumról, nincs várólista.',
    benefit_privacy_title: 'Adatvédelem elsőként',
    benefit_privacy_desc:
      'A dokumentumokat memóriában dolgozzuk fel, a végén az eredeti PDF-et nem tároljuk.',
    benefit_evidence_title: 'Szöveges bizonyíték',
    benefit_evidence_desc:
      'Minden jelzés mellett megjelenik az a szövegrész a dokumentumból, amire épül.',
    how_title: 'Hogyan működik?',
    how_step_1_title: '1. Töltsd fel a PDF-et',
    how_step_1_desc: 'Húzd ide a tulajdoni lap PDF-et, vagy válaszd ki a fájlt.',
    how_step_2_title: '2. Automatikus szövegelemzés',
    how_step_2_desc:
      'A rendszer kiolvassa a PDF szövegét és azonosítja az I./II./III. részt.',
    how_step_3_title: '3. Kockázati jelentés',
    how_step_3_desc:
      'Piros, sárga és zöld jelzésekkel, összefoglalóval és ajánlásokkal.',
    upload_title: 'Tulajdoni lap feltöltése',
    upload_subtitle:
      'Csak PDF formátum, maximum 10 MB. A fájlt nem tároljuk tartósan.',
    upload_drag: 'Húzd ide a PDF-et vagy kattints a tallózáshoz',
    upload_limit: 'Maximum 10 MB - csak PDF',
    upload_button: 'Elemzés indítása',
    upload_processing: 'Feldolgozás folyamatban...',
    upload_waiting_report: 'Várunk, amíg a szerver elkészíti a jelentést.',
    upload_try_another: 'Másik fájl kiválasztása',
    report_title: 'Tulajdoni lap elemzés',
    report_summary: 'Összefoglaló',
    report_property: 'Ingatlan adatai',
    report_owners: 'Tulajdonosok',
    report_flags: 'Jelzések',
    report_stats: 'Dokumentum statisztika',
    report_no_flags: 'Nem találtunk értékelhető jelzést a dokumentumban.',
    report_back: 'Új elemzés indítása',
    prop_address: 'Cím',
    prop_hrsz: 'Helyrajzi szám',
    prop_area: 'Terület',
    prop_type: 'Megnevezés',
    prop_missing: 'Nem azonosítható',
    owner_name: 'Név',
    owner_share: 'Tulajdoni hányad',
    owner_date: 'Szerzés időpontja',
    owner_title: 'Jogcím',
    risk_label: 'Kockázati szint',
    risk_low: 'Alacsony',
    risk_medium: 'Közepes',
    risk_high: 'Magas',
    risk_critical: 'Kritikus',
    flag_red: 'Kiemelt kockázat',
    flag_yellow: 'További ellenőrzést igényel',
    flag_green: 'Kedvező jelzés',
    flag_evidence: 'Idézet a dokumentumból',
    flag_recommendation: 'Ajánlás',
    flag_confidence: 'Megbízhatóság',
    flag_section: 'Szakasz',
    confidence_low: 'alacsony',
    confidence_medium: 'közepes',
    confidence_high: 'magas',
    stats_title: 'Statisztikák',
    stats_subtitle:
      'Élő, összesített adatok a futó szerverpéldány elemzéseiről (nem tartós).',
    stats_total: 'Összes elemzés',
    stats_completed: 'Sikeres',
    stats_failed: 'Sikertelen',
    stats_flags_total: 'Összes jelzés',
    stats_red: 'Piros jelzés',
    stats_yellow: 'Sárga jelzés',
    stats_green: 'Zöld jelzés',
    stats_avg_time: 'Átlagos feldolgozási idő',
    stats_risk_dist: 'Kockázati megoszlás',
    stats_top_categories: 'Leggyakoribb kategóriák',
    stats_updated: 'Utolsó frissítés',
    stats_empty:
      'Még nincs elemzés ebben a munkamenetben. Tölts fel egy tulajdoni lapot a kezdéshez.',
    doc_stats_chars: 'Karakterek',
    doc_stats_words: 'Szavak',
    doc_stats_lines: 'Sorok',
    doc_stats_sections: 'Felismert részek',
    doc_stats_processing: 'Feldolgozási idő',
    disclaimer_prefix: 'Figyelem:',
    disclaimer:
      'Ez az elemzés tájékoztató jellegű, nem minősül jogi tanácsadásnak. Ingatlanvásárlás előtt mindig forduljon ügyvédhez.',
    showcase_banner:
      'Ez egy bemutató (showcase) verzió - a rendszer szabályalapú szövegelemzést végez, nem használ AI-t.',
    footer_about:
      'Az IngatlanCheck egy automatikus dokumentum-előszűrő eszköz, nem helyettesíti az ügyvédi ellenőrzést.',
    copyright_label: 'Copyright',
    privacy_title: 'Adatvédelmi tájékoztató',
    privacy_updated: 'Hatályos:',
    privacy_intro:
      'Az IngatlanCheck bemutató verziója arra készült, hogy bemutassa, miként lehet egy tulajdoni lap PDF dokumentumot automatikusan feldolgozni és strukturált kockázati jelentéssé alakítani.',
    privacy_data_title: 'Milyen adatokat kezelünk?',
    privacy_data_body:
      'A feltöltött PDF-et memóriában, a kérés idejére dolgozzuk fel. A dokumentum szövegét csak a jelentés elkészítéséhez olvassuk ki, majd ideiglenesen a futó szerverpéldány memóriájában tároljuk legfeljebb 2 órán keresztül. A PDF-et sem lemezre, sem adatbázisba nem mentjük.',
    privacy_retention_title: 'Megőrzési idő',
    privacy_retention_body:
      'A jelentés legfeljebb 2 órán át elérhető a generált azonosítóval, majd a memóriából automatikusan törlődik.',
    privacy_rights_title: 'Az érintett jogai',
    privacy_rights_body:
      'Mivel fiókot nem hozunk létre és személyes adatokat tartósan nem tárolunk, a bemutató verzió használata után külön törlési kérelem nem szükséges - a szerver újraindításával minden adat törlődik.',
    privacy_contact_title: 'Kapcsolat',
    privacy_contact_body:
      'Adatvédelmi kérdésekkel forduljon a bemutatóért felelős szervezethez.',
    error_upload_failed: 'A feltöltés nem sikerült. Kérjük, próbáld újra.',
    error_invalid_file: 'Csak PDF fájlt lehet feltölteni.',
    error_file_too_large: 'A fájl túl nagy. Maximum 10 MB fogadható el.',
    error_no_file: 'Nincs kiválasztva fájl.',
    error_extraction_failed:
      'A PDF szövegét nem sikerült kiolvasni. Lehet, hogy szkennelt vagy titkosított dokumentum.',
    error_analysis_failed: 'Az elemzés nem sikerült. Kérjük, próbáld újra.',
    error_report_not_found:
      'A keresett jelentés nem található vagy már lejárt. Kérjük, indíts új elemzést.',
  },
  ru: {
    app_name: 'IngatlanCheck',
    tagline: 'Проверка недвижимости перед покупкой',
    language_label: 'Язык',
    language_hu: 'Magyar',
    language_ru: 'Русский',
    language_en: 'English',
    nav_home: 'Главная',
    nav_upload: 'Загрузка',
    nav_stats: 'Статистика',
    nav_privacy: 'Конфиденциальность',
    hero_title: 'Проверь недвижимость перед покупкой',
    hero_subtitle:
      'Загрузи выписку о собственности, и через несколько секунд получишь структурированный анализ рисков по обременениям, собственникам и предупреждающим признакам.',
    hero_cta_primary: 'Загрузить документ',
    hero_cta_secondary: 'Открыть статистику',
    benefits_title: 'Почему IngatlanCheck?',
    benefit_speed_title: 'Быстрый анализ',
    benefit_speed_desc:
      'Структурированный отчёт по документу за несколько секунд, без ожидания.',
    benefit_privacy_title: 'Конфиденциальность прежде всего',
    benefit_privacy_desc:
      'Документы обрабатываются в памяти, исходный PDF не хранится постоянно.',
    benefit_evidence_title: 'Текстовые доказательства',
    benefit_evidence_desc:
      'Для каждого сигнала показывается фрагмент текста документа, на котором он основан.',
    how_title: 'Как это работает?',
    how_step_1_title: '1. Загрузи PDF',
    how_step_1_desc:
      'Перетащи PDF выписки сюда или выбери файл вручную.',
    how_step_2_title: '2. Автоматический анализ текста',
    how_step_2_desc:
      'Система извлекает текст из PDF и определяет разделы I./II./III.',
    how_step_3_title: '3. Отчёт о рисках',
    how_step_3_desc:
      'С красными, жёлтыми и зелёными сигналами, кратким выводом и рекомендациями.',
    upload_title: 'Загрузка выписки о собственности',
    upload_subtitle:
      'Только PDF, максимум 10 МБ. Файл не хранится постоянно.',
    upload_drag: 'Перетащи PDF сюда или нажми, чтобы выбрать файл',
    upload_limit: 'Максимум 10 МБ - только PDF',
    upload_button: 'Запустить анализ',
    upload_processing: 'Идёт обработка...',
    upload_waiting_report: 'Ждём, пока сервер подготовит отчёт.',
    upload_try_another: 'Выбрать другой файл',
    report_title: 'Анализ выписки о собственности',
    report_summary: 'Сводка',
    report_property: 'Данные объекта',
    report_owners: 'Собственники',
    report_flags: 'Сигналы',
    report_stats: 'Статистика документа',
    report_no_flags: 'По документу не найдено интерпретируемых сигналов.',
    report_back: 'Запустить новый анализ',
    prop_address: 'Адрес',
    prop_hrsz: 'Кадастровый номер',
    prop_area: 'Площадь',
    prop_type: 'Тип',
    prop_missing: 'Не удалось определить',
    owner_name: 'Имя',
    owner_share: 'Доля собственности',
    owner_date: 'Дата приобретения',
    owner_title: 'Основание',
    risk_label: 'Уровень риска',
    risk_low: 'Низкий',
    risk_medium: 'Средний',
    risk_high: 'Высокий',
    risk_critical: 'Критический',
    flag_red: 'Критический риск',
    flag_yellow: 'Нужна дополнительная проверка',
    flag_green: 'Положительный сигнал',
    flag_evidence: 'Цитата из документа',
    flag_recommendation: 'Рекомендация',
    flag_confidence: 'Надёжность',
    flag_section: 'Раздел',
    confidence_low: 'низкая',
    confidence_medium: 'средняя',
    confidence_high: 'высокая',
    stats_title: 'Статистика',
    stats_subtitle:
      'Живая агрегированная статистика по анализам текущего серверного процесса (непостоянная).',
    stats_total: 'Всего анализов',
    stats_completed: 'Успешно',
    stats_failed: 'Ошибки',
    stats_flags_total: 'Всего сигналов',
    stats_red: 'Красные сигналы',
    stats_yellow: 'Жёлтые сигналы',
    stats_green: 'Зелёные сигналы',
    stats_avg_time: 'Среднее время обработки',
    stats_risk_dist: 'Распределение рисков',
    stats_top_categories: 'Самые частые категории',
    stats_updated: 'Последнее обновление',
    stats_empty:
      'В этой сессии пока нет анализов. Загрузи выписку о собственности, чтобы начать.',
    doc_stats_chars: 'Символы',
    doc_stats_words: 'Слова',
    doc_stats_lines: 'Строки',
    doc_stats_sections: 'Найденные разделы',
    doc_stats_processing: 'Время обработки',
    disclaimer_prefix: 'Внимание:',
    disclaimer:
      'Этот анализ носит информационный характер и не является юридической консультацией. Перед покупкой недвижимости обязательно обратитесь к юристу.',
    showcase_banner:
      'Это демонстрационная версия - система выполняет rule-based анализ текста и не использует AI.',
    footer_about:
      'IngatlanCheck - это инструмент предварительной проверки документов, он не заменяет юридическую экспертизу.',
    copyright_label: 'Copyright',
    privacy_title: 'Политика конфиденциальности',
    privacy_updated: 'Действует с:',
    privacy_intro:
      'Демонстрационная версия IngatlanCheck создана, чтобы показать, как PDF-выписку о собственности можно автоматически обработать и превратить в структурированный отчёт о рисках.',
    privacy_data_title: 'Какие данные мы обрабатываем?',
    privacy_data_body:
      'Загруженный PDF обрабатывается в памяти только на время запроса. Текст документа извлекается только для построения отчёта и временно хранится в памяти текущего серверного процесса не более 2 часов. Сам PDF не сохраняется ни на диск, ни в базу данных.',
    privacy_retention_title: 'Срок хранения',
    privacy_retention_body:
      'Отчёт доступен по сгенерированному идентификатору не более 2 часов, после чего автоматически удаляется из памяти.',
    privacy_rights_title: 'Права субъекта данных',
    privacy_rights_body:
      'Так как мы не создаём аккаунты и не храним персональные данные постоянно, отдельный запрос на удаление после использования демо-версии не требуется - при перезапуске сервера все данные удаляются.',
    privacy_contact_title: 'Контакты',
    privacy_contact_body:
      'По вопросам конфиденциальности обращайтесь к организации, ответственной за демонстрацию.',
    error_upload_failed: 'Не удалось загрузить файл. Попробуй ещё раз.',
    error_invalid_file: 'Можно загружать только PDF-файлы.',
    error_file_too_large: 'Файл слишком большой. Максимально допустимо 10 МБ.',
    error_no_file: 'Файл не выбран.',
    error_extraction_failed:
      'Не удалось извлечь текст из PDF. Возможно, документ отсканирован как изображение или защищён.',
    error_analysis_failed: 'Не удалось выполнить анализ. Попробуй ещё раз.',
    error_report_not_found:
      'Нужный отчёт не найден или уже истёк. Запусти новый анализ.',
  },
  en: {
    app_name: 'IngatlanCheck',
    tagline: 'Property due diligence before purchase',
    language_label: 'Language',
    language_hu: 'Magyar',
    language_ru: 'Русский',
    language_en: 'English',
    nav_home: 'Home',
    nav_upload: 'Upload',
    nav_stats: 'Stats',
    nav_privacy: 'Privacy',
    hero_title: 'Check the property before you buy',
    hero_subtitle:
      'Upload the ownership sheet and get a structured risk analysis of encumbrances, owners, and warning signs in seconds.',
    hero_cta_primary: 'Upload ownership sheet',
    hero_cta_secondary: 'View statistics',
    benefits_title: 'Why IngatlanCheck?',
    benefit_speed_title: 'Fast analysis',
    benefit_speed_desc:
      'Get a structured report about the document in seconds, with no waiting list.',
    benefit_privacy_title: 'Privacy first',
    benefit_privacy_desc:
      'Documents are processed in memory and the original PDF is not stored permanently.',
    benefit_evidence_title: 'Textual evidence',
    benefit_evidence_desc:
      'Every flag includes the exact document excerpt it is based on.',
    how_title: 'How it works',
    how_step_1_title: '1. Upload the PDF',
    how_step_1_desc:
      'Drag the ownership sheet PDF here or choose the file manually.',
    how_step_2_title: '2. Automatic text analysis',
    how_step_2_desc:
      'The system extracts the PDF text and identifies sections I./II./III.',
    how_step_3_title: '3. Risk report',
    how_step_3_desc:
      'With red, yellow, and green flags, a summary, and recommended next steps.',
    upload_title: 'Upload ownership sheet',
    upload_subtitle:
      'PDF only, maximum 10 MB. The file is not stored permanently.',
    upload_drag: 'Drop the PDF here or click to browse',
    upload_limit: 'Maximum 10 MB - PDF only',
    upload_button: 'Start analysis',
    upload_processing: 'Processing...',
    upload_waiting_report: 'Waiting for the server to prepare the report.',
    upload_try_another: 'Choose another file',
    report_title: 'Ownership sheet analysis',
    report_summary: 'Summary',
    report_property: 'Property details',
    report_owners: 'Owners',
    report_flags: 'Flags',
    report_stats: 'Document statistics',
    report_no_flags: 'No interpretable flags were found in the document.',
    report_back: 'Start a new analysis',
    prop_address: 'Address',
    prop_hrsz: 'Land registry number',
    prop_area: 'Area',
    prop_type: 'Type',
    prop_missing: 'Could not be identified',
    owner_name: 'Name',
    owner_share: 'Ownership share',
    owner_date: 'Acquisition date',
    owner_title: 'Legal basis',
    risk_label: 'Risk level',
    risk_low: 'Low',
    risk_medium: 'Medium',
    risk_high: 'High',
    risk_critical: 'Critical',
    flag_red: 'Critical risk',
    flag_yellow: 'Needs further review',
    flag_green: 'Positive signal',
    flag_evidence: 'Document excerpt',
    flag_recommendation: 'Recommendation',
    flag_confidence: 'Confidence',
    flag_section: 'Section',
    confidence_low: 'low',
    confidence_medium: 'medium',
    confidence_high: 'high',
    stats_title: 'Statistics',
    stats_subtitle:
      'Live aggregated statistics for analyses processed by the current server instance (non-persistent).',
    stats_total: 'Total analyses',
    stats_completed: 'Completed',
    stats_failed: 'Failed',
    stats_flags_total: 'Total flags',
    stats_red: 'Red flags',
    stats_yellow: 'Yellow flags',
    stats_green: 'Green flags',
    stats_avg_time: 'Average processing time',
    stats_risk_dist: 'Risk distribution',
    stats_top_categories: 'Top categories',
    stats_updated: 'Last updated',
    stats_empty:
      'There are no analyses in this session yet. Upload an ownership sheet to get started.',
    doc_stats_chars: 'Characters',
    doc_stats_words: 'Words',
    doc_stats_lines: 'Lines',
    doc_stats_sections: 'Detected sections',
    doc_stats_processing: 'Processing time',
    disclaimer_prefix: 'Attention:',
    disclaimer:
      'This analysis is for informational purposes only and does not constitute legal advice. Always consult a lawyer before purchasing real estate.',
    showcase_banner:
      'This is a showcase version - the system uses rule-based text analysis and does not use AI.',
    footer_about:
      'IngatlanCheck is an automated document pre-screening tool and does not replace legal review.',
    copyright_label: 'Copyright',
    privacy_title: 'Privacy notice',
    privacy_updated: 'Effective:',
    privacy_intro:
      'The IngatlanCheck showcase was built to demonstrate how an ownership sheet PDF can be processed automatically and turned into a structured risk report.',
    privacy_data_title: 'What data do we process?',
    privacy_data_body:
      'The uploaded PDF is processed in memory for the duration of the request only. The document text is extracted solely to generate the report and is kept in the current server instance memory for up to 2 hours. The PDF itself is not saved to disk or to a database.',
    privacy_retention_title: 'Retention period',
    privacy_retention_body:
      'The report remains accessible through its generated identifier for up to 2 hours and is then automatically removed from memory.',
    privacy_rights_title: 'Data subject rights',
    privacy_rights_body:
      'Because we do not create accounts and do not store personal data permanently, no separate deletion request is needed after using the showcase - all data disappears when the server restarts.',
    privacy_contact_title: 'Contact',
    privacy_contact_body:
      'For privacy-related questions, please contact the organization responsible for the showcase.',
    error_upload_failed: 'Upload failed. Please try again.',
    error_invalid_file: 'Only PDF files can be uploaded.',
    error_file_too_large: 'The file is too large. The maximum allowed size is 10 MB.',
    error_no_file: 'No file selected.',
    error_extraction_failed:
      'The PDF text could not be extracted. The document may be scanned as an image or encrypted.',
    error_analysis_failed: 'Analysis failed. Please try again.',
    error_report_not_found:
      'The requested report could not be found or has already expired. Please start a new analysis.',
  },
} as const;

export type Messages = (typeof MESSAGES)[Locale];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function pickLocale(value?: string | null): Locale {
  if (value && isLocale(value)) return value;
  return DEFAULT_LOCALE;
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return pickLocale(cookieStore.get('locale')?.value);
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export function getIntlLocale(locale: Locale): string {
  if (locale === 'ru') return 'ru-RU';
  if (locale === 'en') return 'en-US';
  return 'hu-HU';
}
