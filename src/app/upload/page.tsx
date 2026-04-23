import type { Metadata } from 'next';
import { Disclaimer } from '@/components/Disclaimer';
import { UploadDropzone } from '@/components/UploadDropzone';
import { getLocale, getMessages } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const messages = getMessages(await getLocale());
  return {
    title: messages.nav_upload,
    description: messages.upload_subtitle,
  };
}

export default async function UploadPage() {
  const messages = getMessages(await getLocale());

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {messages.upload_title}
        </h1>
        <p className="text-sm text-slate-600">{messages.upload_subtitle}</p>
      </header>

      <UploadDropzone messages={messages} />

      <Disclaimer messages={messages} />
    </div>
  );
}
