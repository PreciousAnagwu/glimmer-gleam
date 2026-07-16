// Sends the customer a branded status email at key order lifecycle events.
// Skips gracefully if RESEND_API_KEY is not configured (dev mode).
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CustomerEvent =
  | 'order_placed'
  | 'receipt_received'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface Payload {
  orderId: string;
  event: CustomerEvent;
}

const COPY: Record<CustomerEvent, { subject: (id: string) => string; heading: string; body: string }> = {
  order_placed:      { subject: (id) => `🎉 We received your order #${id}`, heading: '🎉 Thank you for your order', body: "We've received your order and it's being reviewed. We'll email you again as soon as the next step is ready." },
  receipt_received:  { subject: (id) => `📎 Receipt received for order #${id}`, heading: '📎 Payment receipt received', body: "Thanks for uploading your bank transfer receipt. Our team is verifying your payment and will confirm shortly." },
  payment_confirmed: { subject: (id) => `✅ Payment confirmed — order #${id}`, heading: '✅ Payment confirmed', body: "Great news — your payment has been confirmed. We're preparing your jewels for shipment." },
  processing:        { subject: (id) => `📦 Preparing your order #${id}`, heading: '📦 Preparing your order', body: 'Your order is being carefully prepared and packaged. You will get another update when it ships.' },
  shipped:           { subject: (id) => `🚚 Your order #${id} has shipped`, heading: '🚚 Your order has shipped', body: 'Your parcel is on its way! Track your delivery from your account.' },
  delivered:         { subject: (id) => `✨ Delivered — order #${id}`, heading: '✨ Your order was delivered', body: 'Your order has been marked as delivered. We hope you love your jewels — reviews are appreciated!' },
  cancelled:         { subject: (id) => `❌ Order #${id} cancelled`, heading: '❌ Your order was cancelled', body: 'Your order has been cancelled. If you have questions or believe this is an error, please reach out to our team.' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { orderId, event }: Payload = await req.json();
    if (!orderId || !event) throw new Error('orderId and event are required');
    if (!(event in COPY)) throw new Error(`Unknown event: ${event}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, total, shipping_name, shipping_email, payment_method, payment_status, status')
      .eq('id', orderId)
      .maybeSingle();
    if (error || !order) throw new Error(error?.message || 'Order not found');

    const to = order.shipping_email?.trim();
    if (!to || !to.includes('@')) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no customer email' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    const shortId = String(order.id).slice(0, 8).toUpperCase();
    const copy = COPY[event];
    const trackUrl = `${Deno.env.get('PUBLIC_APP_URL') || ''}/order/${order.id}`;

    if (!apiKey) {
      console.log('[notify-customer] RESEND_API_KEY missing — skipping send to', to, 'event:', event);
      return new Response(JSON.stringify({ skipped: true, to, event }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:24px;color:#222;background:#fff">
        <div style="text-align:center;padding:16px 0;border-bottom:2px solid #b8863c">
          <h1 style="margin:0;color:#b8863c;font-family:Georgia,serif">J's Jewels</h1>
        </div>
        <h2 style="color:#333;margin-top:24px">${copy.heading}</h2>
        <p style="font-size:15px;line-height:1.6">Hi ${escapeHtml(order.shipping_name?.split(' ')[0] || 'there')},</p>
        <p style="font-size:15px;line-height:1.6">${copy.body}</p>
        <div style="margin:20px 0;padding:16px;background:#faf6ee;border-radius:6px">
          <p style="margin:0"><strong>Order:</strong> #${shortId}</p>
          <p style="margin:6px 0 0"><strong>Total:</strong> ₦${Number(order.total).toLocaleString()}</p>
          <p style="margin:6px 0 0"><strong>Payment:</strong> ${escapeHtml(order.payment_method)} — ${escapeHtml(order.payment_status)}</p>
        </div>
        ${trackUrl ? `<div style="text-align:center;margin:28px 0">
          <a href="${trackUrl}" style="display:inline-block;padding:12px 28px;background:#b8863c;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;letter-spacing:1px">TRACK YOUR ORDER</a>
        </div>` : ''}
        <p style="font-size:12px;color:#888;margin-top:32px;text-align:center">Thank you for shopping with J's Jewels ✨</p>
      </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('ADMIN_NOTIFY_FROM') || "J's Jewels <orders@example.com>",
        to,
        subject: copy.subject(shortId),
        html,
      }),
    });
    const body = await res.text();
    if (!res.ok) console.error('[notify-customer] resend error', res.status, body);

    return new Response(JSON.stringify({ sent: res.ok, to, event }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[notify-customer] error', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
