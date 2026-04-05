import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import Stripe from 'stripe';
import { getStripe, getWebhookSecret } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * Stripe webhook handler.
 *
 * Contract:
 * - verifies the Stripe signature
 * - inserts event id into `stripe_events` for idempotency (duplicate → 200 no-op)
 * - on `checkout.session.completed`, marks the report `paid` and kicks off
 *   analysis asynchronously via `after()` so the webhook returns in < 10s.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      getWebhookSecret()
    );
  } catch (e) {
    console.error('[stripe webhook] signature verification failed', e);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Idempotency: insert event id, skip if already processed.
  const { error: dedupeError } = await supabase
    .from('stripe_events')
    .insert({ id: event.id, event_type: event.type });

  if (dedupeError) {
    // Unique violation = we've already handled this event.
    if (dedupeError.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error('[stripe webhook] dedupe insert failed', dedupeError);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const reportId = session.metadata?.reportId;

    if (!reportId) {
      console.error('[stripe webhook] missing reportId in metadata', {
        sessionId: session.id,
      });
      return NextResponse.json({ received: true });
    }

    const paymentIntent =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: 'paid',
        stripe_payment_intent: paymentIntent,
        email: session.customer_details?.email ?? session.customer_email,
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('[stripe webhook] report update failed', updateError);
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }

    // Kick off analysis after the response is sent — Claude call can take
    // longer than Stripe's 10s webhook timeout.
    after(async () => {
      try {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        const res = await fetch(`${appUrl}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId }),
        });
        if (!res.ok) {
          console.error('[stripe webhook] analyze call non-OK', {
            reportId,
            status: res.status,
          });
        }
      } catch (e) {
        console.error('[stripe webhook] analyze trigger failed', {
          reportId,
          error: e,
        });
      }
    });
  }

  return NextResponse.json({ received: true });
}
