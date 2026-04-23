import { PDFParse } from 'pdf-parse';
import { CanvasFactory, getData as getWorkerData } from 'pdf-parse/worker';
import { MIN_EXTRACTED_CHARS } from '@/config/constants';

let workerConfigured = false;

function ensurePdfWorkerConfigured(): void {
  if (workerConfigured) return;

  // The inline worker payload is the most reliable option in serverless
  // environments such as Vercel because it avoids filesystem lookups entirely.
  PDFParse.setWorker(getWorkerData());
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
    CanvasFactory,
  });

  try {
    const result = await parser.getText();
    const text = (result.text ?? '').trim();

    if (text.length < MIN_EXTRACTED_CHARS) {
      throw new Error('PDF contains no extractable text (possibly a scanned image)');
    }

    return text;
  } finally {
    await parser.destroy();
  }
}
