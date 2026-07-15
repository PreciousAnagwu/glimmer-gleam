// Sends an email to every admin who has notify_email = true when a new order is placed.
// Skips gracefully if RESEND_API_KEY is not configured (dev mode).
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  orderId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { orderId }: Payload = await req.json();
    if (!orderId) throw new Error('orderId required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Load order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    if (orderErr || !order) throw new Error(orderErr?.message || 'Order not found');

    const { data: items } = await supabase
      .from('order_items')
      .select('product_name, variant_style, color, quantity, variant_price')
      .eq('order_id', orderId);

    // Load admin recipient emails
    const { data: perms } = await supabase
      .from('admin_permissions')
      .select('email_for_notifications, notify_email')
      .eq('notify_email', true);

    const recipients = (perms || [])
      .map((p: any) => p.email_for_notifications?.trim())
      .filter((e: string | undefined): e is string => !!e && e.includes('@'));

    // Always ensure the primary admin gets one
    if (!recipients.includes('panagwu@gmail.com')) recipients.push('panagwu@gmail.com');

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      console.log('[notify-admins-order] RESEND_API_KEY missing — skipping email send. Recipients would be:', recipients);
      return new Response(JSON.stringify({ skipped: true, recipients }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const itemsHtml = (items || []).map((i: any) =>
      `<li>${i.quantity} × ${escapeHtml(i.product_name)} — ${escapeHtml(i.variant_style || '')} ${escapeHtml(i.color || '')} — ₦${Number(i.variant_price * i.quantity).toLocaleString()}</li>`
    ).join('');

    const html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:24px;color:#222">
        <h1 style="color:#b8863c">🛎️ New order placed</h1>
        <p><strong>Order:</strong> #${String(order.id).slice(0, 8).toUpperCase()}</p>
        <p><strong>Customer:</strong> ${escapeHtml(order.shipping_name)} — ${escapeHtml(order.shipping_phone || '')}</p>
        <p><strong>Ship to:</strong> ${escapeHtml(order.shipping_address)}, ${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)}</p>
        <p><strong>Payment:</strong> ${escapeHtml(order.payment_method)} — ${escapeHtml(order.payment_status)}</p>
        <p><strong>Total:</strong> ₦${Number(order.total).toLocaleString()}</p>
        ${order.gift_message ? `<p><strong>Gift note:</strong> <em>${escapeHtml(order.gift_message)}</em></p>` : ''}
        <h3>Items</h3>
        <ul>${itemsHtml}</ul>
        <p style="margin-top:24px;font-size:12px;color:#888">Log into the admin dashboard to process this order.</p>
      </div>`;

    // Fan out one send per recipient so failures don't cross-contaminate
    const results = await Promise.allSettled(
      recipients.map((to) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: Deno.env.get('ADMIN_NOTIFY_FROM') || 'J\'s Jewels <orders@example.com>',
            to,
            subject: `🛎️ New order #${String(order.id).slice(0, 8).toUpperCase()} — ₦${Number(order.total).toLocaleString()}`,
            html,
          }),
        }).then((r) => r.text()),
      ),
    );

    return new Response(JSON.stringify({ sent: results.length, recipients }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[notify-admins-order] error', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
