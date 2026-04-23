import type { Metadata } from 'next';
import { HU } from '@/config/ui-text';

export const metadata: Metadata = {
  title: HU.privacy_title,
  description: HU.privacy_intro,
};

function Section({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-sm leading-relaxed text-slate-700">{body}</p>
    </section>
  );
}

export default function PrivacyPage() {
  const today = new Date().toLocaleDateString('hu-HU');
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {HU.privacy_title}
        </h1>
        <p className="text-xs text-slate-500">
          {HU.privacy_updated} {today}
        </p>
      </header>

      <p className="text-sm leading-relaxed text-slate-700">
        {HU.privacy_intro}
      </p>

      <Section title={HU.privacy_data_title} body={HU.privacy_data_body} />
      <Section
        title={HU.privacy_retention_title}
        body={HU.privacy_retention_body}
      />
      <Section title={HU.privacy_rights_title} body={HU.privacy_rights_body} />
      <Section
        title={HU.privacy_contact_title}
        body={HU.privacy_contact_body}
      />
    </div>
  );
}
