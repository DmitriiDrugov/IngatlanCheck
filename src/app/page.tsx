import Link from 'next/link';
import { Disclaimer } from '@/components/Disclaimer';
import { getLocale, getMessages } from '@/lib/i18n';

export default async function HomePage() {
  const messages = getMessages(await getLocale());

  const benefits: Array<{ title: string; desc: string }> = [
    { title: messages.benefit_speed_title, desc: messages.benefit_speed_desc },
    { title: messages.benefit_privacy_title, desc: messages.benefit_privacy_desc },
    { title: messages.benefit_evidence_title, desc: messages.benefit_evidence_desc },
  ];

  const steps: Array<{ title: string; desc: string }> = [
    { title: messages.how_step_1_title, desc: messages.how_step_1_desc },
    { title: messages.how_step_2_title, desc: messages.how_step_2_desc },
    { title: messages.how_step_3_title, desc: messages.how_step_3_desc },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
            {messages.tagline}
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            {messages.hero_title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600">
            {messages.hero_subtitle}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {messages.hero_cta_primary}
            </Link>
            <Link
              href="/stats"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              {messages.hero_cta_secondary}
            </Link>
          </div>
          <Disclaimer messages={messages} variant="compact" />
        </div>

        <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              sample report
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-red-800 ring-1 ring-red-100">
              <span>Execution right</span>
              <span className="text-xs font-medium">{messages.flag_red.toLowerCase()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-amber-900 ring-1 ring-amber-100">
              <span>Mortgage registered</span>
              <span className="text-xs font-medium">{messages.flag_yellow.toLowerCase()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800 ring-1 ring-emerald-100">
              <span>Single owner</span>
              <span className="text-xs font-medium">{messages.flag_green.toLowerCase()}</span>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
            {messages.prop_hrsz}: <span className="font-mono">12345/6</span> - {messages.prop_area}: 72 m2
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {messages.benefits_title}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {messages.how_title}
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step, idx) => (
            <li
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-2 text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
