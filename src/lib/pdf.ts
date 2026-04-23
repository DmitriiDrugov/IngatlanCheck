import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { PDFParse } from 'pdf-parse';
import { MIN_EXTRACTED_CHARS } from '@/config/constants';

const require = createRequire(import.meta.url);

let workerConfigured = false;

function resolveWorkerPath(): string {
  const mainEntry = require.resolve('pdf-parse');
  const cjsDir = path.dirname(mainEntry);
  const packageRoot = path.resolve(cjsDir, '..', '..', '..');
  const candidatePaths = [
    path.join(cjsDir, 'pdf.worker.mjs'),
    path.join(packageRoot, 'dist', 'worker', 'pdf.worker.mjs'),
    path.join(packageRoot, 'dist', 'pdf-parse', 'esm', 'pdf.worker.mjs'),
    path.join(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs'),
  ];

  const workerPath = candidatePaths.find((candidate) => fs.existsSync(candidate));
  if (!workerPath) {
    throw new Error(
      `pdf.worker.mjs not found. Checked: ${candidatePaths.join(', ')}`
    );
  }

  return workerPath;
}

function ensurePdfWorkerConfigured(): void {
  if (workerConfigured) return;
  PDFParse.setWorker(pathToFileURL(resolveWorkerPath()).href);
  workerConfigured = true;
}

/**
 * Extracts plain text from a PDF buffer.
 * Throws if the PDF is unreadable or contains no text
 * (e.g. scanned image-only PDFs).
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  ensurePdfWorkerConfigured();
  const parser = new PDFParse({
    data: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
  });
  try {
    const result = await parser.getText();
    const text = (result.text ?? '').trim();
    if (text.length < MIN_EXTRACTED_CHARS) {
      throw new Error(
        'PDF contains no extractable text (possibly a scanned image)'
      );
    }
    return text;
  } finally {
    await parser.destroy();
  }
}
