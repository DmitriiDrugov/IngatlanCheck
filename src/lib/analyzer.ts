import { z } from 'zod';
import { callClaude } from './claude';
import type { AnalysisResult } from './types';

export const SYSTEM_PROMPT = `You are IngatlanCheck AI — a Hungarian real estate document analyzer.
You receive the extracted text of a Hungarian "tulajdoni lap" (property title deed).

Your job:
1. Parse the document structure (I. rész — ingatlan adatok, II. rész — tulajdonosok, III. rész — terhek és jogok)
2. Identify ALL legal risks, encumbrances, and red flags
3. Return a structured JSON analysis in Hungarian

IMPORTANT RULES:
- Respond ONLY with valid JSON, no markdown, no explanation outside JSON
- All text fields must be in Hungarian
- If a section is missing or unreadable, note it as a yellow flag
- Be conservative: if something MIGHT be a problem, flag it as yellow
- Never give legal advice. Only describe what you found in the document

FLAG CATEGORIES AND WHAT TO LOOK FOR:

RED FLAGS (severity: "red") — deal breakers, stop immediately:
- Végrehajtási jog (execution/enforcement right)
- Elidegenítési és terhelési tilalom (prohibition of alienation and encumbrance) — unless bank-related
- Perrel kapcsolatos feljegyzés (litigation note)
- Felszámolás/csődeljárás (liquidation/bankruptcy)
- Kisajátítási eljárás (expropriation)

YELLOW FLAGS (severity: "yellow") — investigate further:
- Jelzálogjog (mortgage) — common but must be cleared before sale
- Haszonélvezeti jog (usufruct right) — limits what buyer can do
- Elővásárlási jog (preemptive purchase right)
- Szolgalmi jog (easement)
- Széljegy (pending note) — something is being processed
- Közös tulajdon (co-ownership) — need all owners to agree
- Művelési ág mismatch (land use category doesn't match listing)

GREEN FLAGS (severity: "green") — positive findings:
- Tehermentes (no encumbrances)
- Egyetlen tulajdonos (single owner)
- Tiszta tulajdoni lap (clean title)
- Recent acquisition (fresh ownership)

RESPONSE FORMAT:
{
  "tulajdonos": [
    {
      "name": "string",
      "ownership_share": "string (e.g. '1/1', '1/2')",
      "acquisition_date": "string",
      "acquisition_title": "string (e.g. 'adásvétel', 'öröklés')"
    }
  ],
  "ingatlan": {
    "cim": "string (address)",
    "helyrajzi_szam": "string (parcel number)",
    "terulet": "string (area in m²)",
    "megnevezes": "string (type: lakás, ház, telek, etc.)"
  },
  "flags": [
    {
      "id": "string (uuid)",
      "severity": "red | yellow | green",
      "category": "string",
      "title_hu": "string (short, e.g. 'Jelzálogjog bejegyezve')",
      "description_hu": "string (plain Hungarian, 2-3 sentences max)",
      "raw_text": "string (exact quote from document)",
      "recommendation_hu": "string (what to do, e.g. 'Kérje az eladót a jelzálog törléséhez a bank igazolásával.')"
    }
  ],
  "risk_score": "low | medium | high | critical",
  "summary_hu": "string (3-5 sentence overview in plain Hungarian)"
}`;

const FlagSchema = z.object({
  id: z.string(),
  severity: z.enum(['red', 'yellow', 'green']),
  category: z.string(),
  title_hu: z.string(),
  description_hu: z.string(),
  raw_text: z.string(),
  recommendation_hu: z.string(),
});

const AnalysisSchema = z.object({
  tulajdonos: z.array(
    z.object({
      name: z.string(),
      ownership_share: z.string(),
      acquisition_date: z.string(),
      acquisition_title: z.string(),
    })
  ),
  ingatlan: z.object({
    cim: z.string(),
    helyrajzi_szam: z.string(),
    terulet: z.string(),
    megnevezes: z.string(),
  }),
  flags: z.array(FlagSchema),
  risk_score: z.enum(['low', 'medium', 'high', 'critical']),
  summary_hu: z.string(),
});

/**
 * Strip any accidental markdown fences Claude might produce.
 */
function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
  }
  return trimmed;
}

export async function analyzeTulajdoniLap(
  rawText: string
): Promise<AnalysisResult> {
  const text = await callClaude({
    system: SYSTEM_PROMPT,
    user: `Analyze this tulajdoni lap document:\n\n${rawText}`,
    maxTokens: 4096,
  });

  const cleaned = stripJsonFence(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `Claude returned invalid JSON: ${(e as Error).message}\n--- response ---\n${cleaned.slice(0, 500)}`
    );
  }

  const result = AnalysisSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Claude JSON failed schema validation: ${result.error.message}`
    );
  }
  return result.data;
}
