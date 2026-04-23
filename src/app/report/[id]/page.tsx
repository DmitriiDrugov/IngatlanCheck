import type { Metadata } from 'next';
import Link from 'next/link';
import { ReportView } from '@/components/ReportView';
import { getLocale, getMessages } from '@/lib/i18n';
import { getReport } from '@/lib/report-store';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = getReport(id);
  const locale = report?.locale ?? (await getLocale());
  const messages = getMessages(locale);

  return {
    title: messages.report_title,
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = getReport(id);
  const locale = report?.locale ?? (await getLocale());
  const messages = getMessages(locale);

  if (!report || report.status !== 'completed' || !report.analysis) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-6 py-24">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {messages.report_title}
        </h1>
        <p className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
          {messages.error_report_not_found}
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {messages.hero_cta_primary}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <ReportView analysis={report.analysis} messages={messages} />
    </div>
  );
}
