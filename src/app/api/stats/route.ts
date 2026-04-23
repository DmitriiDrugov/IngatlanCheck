import { NextResponse } from 'next/server';
import { getGlobalStats } from '@/lib/stats';
import type { ApiResponse, GlobalStats } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<ApiResponse<GlobalStats>>> {
  return NextResponse.json({ success: true, data: getGlobalStats() });
}
