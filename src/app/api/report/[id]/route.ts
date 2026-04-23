import { NextRequest, NextResponse } from 'next/server';
import { getReport } from '@/lib/report-store';
import type { ApiResponse, Report } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Report>>> {
  const { id } = await ctx.params;
  const report = getReport(id);
  if (!report) {
    return NextResponse.json(
      { success: false, error: 'REPORT_NOT_FOUND' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: report });
}
