import type { Metadata } from 'next';
import { getIntlLocale, getLocale, getMessages } from '@/lib/i18n';

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

export async function generateMetadata(): Promise<Metadata> {
  const messages = getMessages(await getLocale());
  return {
    title: messages.privacy_title,
    description: messages.privacy_intro,
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const today = new Date().toLocaleDateString(getIntlLocale(locale));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {messages.privacy_title}
        </h1>
        <p className="text-xs text-slate-500">
          {messages.privacy_updated} {today}
        </p>
      </header>

      <p className="text-sm leading-relaxed text-slate-700">{messages.privacy_intro}</p>

      <Section title={messages.privacy_data_title} body={messages.privacy_data_body} />
      <Section
        title={messages.privacy_retention_title}
        body={messages.privacy_retention_body}
      />
      <Section title={messages.privacy_rights_title} body={messages.privacy_rights_body} />
      <Section title={messages.privacy_contact_title} body={messages.privacy_contact_body} />
    </div>
  );
}
