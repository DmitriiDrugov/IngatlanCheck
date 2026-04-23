import type { Metadata } from 'next';
import { HU } from '@/config/ui-text';
import { Disclaimer } from '@/components/Disclaimer';
import { UploadDropzone } from '@/components/UploadDropzone';

export const metadata: Metadata = {
  title: HU.nav_upload,
  description: HU.upload_subtitle,
};

export default function UploadPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {HU.upload_title}
        </h1>
        <p className="text-sm text-slate-600">{HU.upload_subtitle}</p>
      </header>

      <UploadDropzone />

      <Disclaimer />
    </div>
  );
}
