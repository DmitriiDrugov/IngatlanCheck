import Link from 'next/link';
import { HU } from '@/config/ui-text';
import { Disclaimer } from '@/components/Disclaimer';

const BENEFITS: Array<{ title: string; desc: string }> = [
  { title: HU.benefit_speed_title, desc: HU.benefit_speed_desc },
  { title: HU.benefit_privacy_title, desc: HU.benefit_privacy_desc },
  { title: HU.benefit_evidence_title, desc: HU.benefit_evidence_desc },
];

const STEPS: Array<{ title: string; desc: string }> = [
  { title: HU.how_step_1_title, desc: HU.how_step_1_desc },
  { title: HU.how_step_2_title, desc: HU.how_step_2_desc },
  { title: HU.how_step_3_title, desc: HU.how_step_3_desc },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
            {HU.tagline}
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            {HU.hero_title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600">
            {HU.hero_subtitle}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {HU.hero_cta_primary}
            </Link>
            <Link
              href="/stats"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              {HU.hero_cta_secondary}
            </Link>
          </div>
          <Disclaimer variant="compact" />
        </div>

        <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              minta jelentés
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-red-800 ring-1 ring-red-100">
              <span>Végrehajtási jog</span>
              <span className="text-xs font-medium">kiemelt kockázat</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-amber-900 ring-1 ring-amber-100">
              <span>Jelzálogjog bejegyezve</span>
              <span className="text-xs font-medium">ellenőrzés</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-amber-900 ring-1 ring-amber-100">
              <span>Haszonélvezeti jog</span>
              <span className="text-xs font-medium">ellenőrzés</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800 ring-1 ring-emerald-100">
              <span>Egyetlen tulajdonos</span>
              <span className="text-xs font-medium">kedvező</span>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
            Helyrajzi szám: <span className="font-mono">12345/6</span> ·
            Terület: 72 m²
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {HU.benefits_title}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {HU.how_title}
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <li
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
