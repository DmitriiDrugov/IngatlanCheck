import { MIN_EXTRACTED_CHARS } from '@/config/constants';

let workerConfigured = false;

/**
 * Extracts plain text from a PDF buffer.
 * Throws if the PDF is unreadable or contains no text
 * (e.g. scanned image-only PDFs).
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const [{ PDFParse }, workerModule] = await Promise.all([
    import('pdf-parse'),
    import('pdf-parse/worker').catch((error) => {
      console.warn('[pdf] worker module unavailable, falling back without explicit worker', error);
      return null;
    }),
  ]);

  if (!workerConfigured && workerModule?.getData) {
    PDFParse.setWorker(workerModule.getData());
    workerConfigured = true;
  }

  const parserOptions: {
    data: Uint8Array;
    CanvasFactory?: object;
  } = {
    data: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
  };

  if (workerModule?.CanvasFactory) {
    parserOptions.CanvasFactory = workerModule.CanvasFactory as object;
  }

  const parser = new PDFParse(parserOptions);

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
