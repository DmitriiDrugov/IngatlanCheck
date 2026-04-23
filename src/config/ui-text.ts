export const HU = {
  app_name: 'IngatlanCheck',
  tagline: 'Ingatlanellenőrzés vásárlás előtt',

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

  disclaimer:
    'Ez az elemzés tájékoztató jellegű, nem minősül jogi tanácsadásnak. Ingatlanvásárlás előtt mindig forduljon ügyvédhez.',
  showcase_banner:
    'Ez egy bemutató (showcase) verzió - a rendszer szabályalapú szövegelemzést végez, nem használ AI-t.',

  footer_about:
    'Az IngatlanCheck egy automatikus dokumentum-előszűrő eszköz, nem helyettesíti az ügyvédi ellenőrzést.',

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
} as const;
