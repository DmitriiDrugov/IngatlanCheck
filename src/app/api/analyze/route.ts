import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { STORAGE_BUCKET } from '@/config/constants';
import { extractPdfText } from '@/lib/pdf';
import { analyzeTulajdoniLap } from '@/lib/analyzer';
import type { ApiResponse, AnalysisResult } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60; // Claude call can take time

const BodySchema = z.object({ reportId: z.string().uuid() });

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<AnalysisResult>>> {
  let reportId: string | undefined;

  try {
    const body = BodySchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid body: reportId (uuid) required' },
        { status: 400 }
      );
    }
    reportId = body.data.reportId;

    const supabase = getSupabaseAdmin();

    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('id, pdf_storage_path, status')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    if (!report.pdf_storage_path) {
      return NextResponse.json(
        { success: false, error: 'Report has no PDF attached' },
        { status: 400 }
      );
    }

    await supabase
      .from('reports')
      .update({ status: 'processing' })
      .eq('id', reportId);

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(report.pdf_storage_path);

    if (downloadError || !fileBlob) {
      throw new Error(`Storage download failed: ${downloadError?.message}`);
    }

    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    const rawText = await extractPdfText(buffer);

    const analysis = await analyzeTulajdoniLap(rawText);

    await supabase
      .from('reports')
      .update({
        status: 'completed',
        raw_text: rawText,
        analysis,
        flags: analysis.flags,
        risk_score: analysis.risk_score,
        summary: analysis.summary_hu,
        completed_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    return NextResponse.json({ success: true, data: analysis });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[analyze] failed', { reportId, message });

    if (reportId) {
      await getSupabaseAdmin()
        .from('reports')
        .update({ status: 'failed' })
        .eq('id', reportId);
    }

    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
