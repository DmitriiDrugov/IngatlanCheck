import { PDFParse } from 'pdf-parse';

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
    if (text.length < 50) {
      throw new Error(
        'PDF contains no extractable text (possibly a scanned image)'
      );
    }
    return text;
  } finally {
    await parser.destroy();
  }
}
