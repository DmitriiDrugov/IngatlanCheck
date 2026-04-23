import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PDFParse } from 'pdf-parse';
import { MIN_EXTRACTED_CHARS } from '@/config/constants';

/**
 * pdf-parse needs an explicit worker source in Next.js server runtimes.
 * Pointing to the packaged worker file avoids Turbopack bundling issues.
 */
PDFParse.setWorker(
  pathToFileURL(
    path.join(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs')
  ).href
);

/**
 * Extracts plain text from a PDF buffer.
 * Throws if the PDF is unreadable or contains no text
 * (e.g. scanned image-only PDFs).
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
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
