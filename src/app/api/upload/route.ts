import { NextRequest, NextResponse } from 'next/server';
import { MAX_PDF_BYTES, PDF_MIME } from '@/config/constants';
import { extractPdfText } from '@/lib/pdf';
import { analyzeTulajdoniLap } from '@/lib/analyzer';
import { createFailedReport, createReport } from '@/lib/report-store';
import { recordFailure } from '@/lib/stats';
import type { ApiResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

function looksLikePdfFile(file: File): boolean {
  return file.type === PDF_MIME || file.name.toLowerCase().endsWith('.pdf');
}

function hasPdfMagic(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

/**
 * Upload + analyze pipeline (showcase):
 *   1. Validate file size and PDF signature
 *   2. Extract text with pdf-parse
 *   3. Run deterministic rule-based analyzer
 *   4. Store the report in-memory and return its id
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<{ reportId: string }>>> {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      recordFailure();
      return NextResponse.json(
        { success: false, error: 'NO_FILE' },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_BYTES) {
      recordFailure();
      return NextResponse.json(
        { success: false, error: 'FILE_TOO_LARGE' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!looksLikePdfFile(file) && !hasPdfMagic(buffer)) {
      recordFailure();
      return NextResponse.json(
        { success: false, error: 'INVALID_FILE_TYPE' },
        { status: 400 }
      );
    }

    let rawText: string;
    try {
      rawText = await extractPdfText(buffer);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'pdf-extract';
      console.error('[upload] pdf extraction failed', message);
      const report = createFailedReport('PDF_EXTRACTION_FAILED');
      recordFailure();
      return NextResponse.json(
        { success: false, error: 'PDF_EXTRACTION_FAILED' },
        { status: 400, headers: { 'x-report-id': report.id } }
      );
    }

    const analysis = analyzeTulajdoniLap(rawText);
    const report = createReport(analysis);

    return NextResponse.json({
      success: true,
      data: { reportId: report.id },
    });
  } catch (e) {
    console.error('[upload] unexpected', e);
    recordFailure();
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
