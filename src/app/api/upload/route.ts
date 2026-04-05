import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { MAX_PDF_BYTES, PDF_MIME, STORAGE_BUCKET } from '@/config/constants';
import type { ApiResponse } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<{ reportId: string }>>> {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== PDF_MIME) {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are accepted' },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File exceeds 10 MB limit' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({ status: 'pending' })
      .select('id')
      .single();

    if (insertError || !report) {
      console.error('[upload] insert failed', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create report' },
        { status: 500 }
      );
    }

    const storagePath = `${report.id}/original.pdf`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: PDF_MIME,
        upsert: false,
      });

    if (uploadError) {
      console.error('[upload] storage upload failed', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to store PDF' },
        { status: 500 }
      );
    }

    await supabase
      .from('reports')
      .update({ pdf_storage_path: storagePath })
      .eq('id', report.id);

    return NextResponse.json({
      success: true,
      data: { reportId: report.id },
    });
  } catch (e) {
    console.error('[upload] unexpected error', e);
    return NextResponse.json(
      { success: false, error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
