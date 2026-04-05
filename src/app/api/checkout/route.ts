import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe, getPriceId } from '@/lib/stripe';
import type { ApiResponse } from '@/lib/types';

export const runtime = 'nodejs';

const BodySchema = z.object({
  reportId: z.string().uuid(),
  email: z.string().email().optional(),
});

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<{ checkoutUrl: string }>>> {
  try {
    const body = BodySchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid body: reportId (uuid) required' },
        { status: 400 }
      );
    }
    const { reportId, email } = body.data;

    const supabase = getSupabaseAdmin();

    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('id, status, pdf_storage_path')
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

    if (report.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Report is not eligible for checkout' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: getPriceId(), quantity: 1 }],
      success_url: `${appUrl}/report/${reportId}/processing`,
      cancel_url: `${appUrl}/upload?canceled=1`,
      customer_email: email,
      metadata: { reportId },
    });

    if (!session.url) {
      return NextResponse.json(
        { success: false, error: 'Stripe did not return a checkout URL' },
        { status: 500 }
      );
    }

    await supabase
      .from('reports')
      .update({
        stripe_session_id: session.id,
        email: email ?? null,
      })
      .eq('id', reportId);

    return NextResponse.json({
      success: true,
      data: { checkoutUrl: session.url },
    });
  } catch (e) {
    console.error('[checkout] failed', e);
    return NextResponse.json(
      { success: false, error: 'Checkout creation failed' },
      { status: 500 }
    );
  }
}
