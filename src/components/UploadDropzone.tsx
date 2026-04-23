'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HU } from '@/config/ui-text';
import { MAX_PDF_BYTES, PDF_MIME } from '@/config/constants';

type UiState =
  | { kind: 'idle' }
  | { kind: 'selected'; file: File }
  | { kind: 'uploading' }
  | { kind: 'error'; message: string };

const ERROR_MESSAGES: Record<string, string> = {
  NO_FILE: HU.error_no_file,
  INVALID_FILE_TYPE: HU.error_invalid_file,
  FILE_TOO_LARGE: HU.error_file_too_large,
  PDF_EXTRACTION_FAILED: HU.error_extraction_failed,
  INTERNAL_ERROR: HU.error_analysis_failed,
};

function mapError(code: string): string {
  return ERROR_MESSAGES[code] ?? HU.error_upload_failed;
}

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UiState>({ kind: 'idle' });
  const [dragOver, setDragOver] = useState(false);

  const pickFile = useCallback((file: File) => {
    if (file.type !== PDF_MIME) {
      setState({ kind: 'error', message: HU.error_invalid_file });
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setState({ kind: 'error', message: HU.error_file_too_large });
      return;
    }
    setState({ kind: 'selected', file });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) pickFile(file);
    },
    [pickFile]
  );

  const submit = useCallback(async () => {
    if (state.kind !== 'selected') return;
    setState({ kind: 'uploading' });

    const body = new FormData();
    body.append('file', state.file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const json = (await res.json()) as
        | { success: true; data: { reportId: string } }
        | { success: false; error: string };

      if (!json.success) {
        setState({ kind: 'error', message: mapError(json.error) });
        return;
      }

      router.push(`/report/${json.data.reportId}`);
    } catch {
      setState({ kind: 'error', message: HU.error_upload_failed });
    }
  }, [state, router]);

  const reset = useCallback(() => {
    setState({ kind: 'idle' });
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const isUploading = state.kind === 'uploading';
  const selectedFile = state.kind === 'selected' ? state.file : null;

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver
            ? 'border-slate-900 bg-slate-100'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <svg
          className="h-10 w-10 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5 7.5 12M12 7.5v11.25"
          />
        </svg>
        <p className="text-base font-medium text-slate-800">
          {HU.upload_drag}
        </p>
        <p className="text-xs text-slate-500">{HU.upload_limit}</p>
        {selectedFile && (
          <div className="mt-2 rounded-full bg-slate-900 px-4 py-1 text-xs text-white">
            {selectedFile.name} ·{' '}
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) pickFile(file);
          }}
        />
      </div>

      {state.kind === 'error' && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={submit}
          disabled={state.kind !== 'selected'}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isUploading ? HU.upload_processing : HU.upload_button}
        </button>
        {selectedFile && !isUploading && (
          <button
            type="button"
            onClick={reset}
            className="text-sm text-slate-500 underline-offset-2 hover:underline"
          >
            {HU.upload_try_another}
          </button>
        )}
      </div>
    </div>
  );
}
