import type { Metadata } from 'next';
import { ClientReportFallback } from '@/components/ClientReportFallback';
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
    return <ClientReportFallback reportId={id} messages={messages} />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <ReportView analysis={report.analysis} messages={messages} />
    </div>
  );
}
