// Sends an email to every admin who has notify_email = true when a new order is placed
// or when a bank-transfer receipt is uploaded. Skips gracefully if RESEND_API_KEY is not set.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  orderId: string;
  event?: 'new_order' | 'receipt_uploaded';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { orderId, event = 'new_order' }: Payload = await req.json();
    if (!orderId) throw new Error('orderId required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

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

    // Create in-app notifications for every admin (so the bell reflects the receipt upload too)
    if (event === 'receipt_uploaded') {
      const { data: admins } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
      if (admins?.length) {
        await supabase.from('notifications').insert(
          admins.map((a: any) => ({
            user_id: a.user_id,
            type: 'admin_receipt_uploaded',
            title: '💳 Payment receipt uploaded',
            body: `${order.shipping_name || 'A customer'} uploaded a bank transfer receipt for order #${String(order.id).slice(0,8).toUpperCase()} (₦${Number(order.total).toLocaleString()})`,
            link: `/admin?order=${order.id}`,
          }))
        );
      }
    }

    // Admin email recipients
    const { data: perms } = await supabase
      .from('admin_permissions')
      .select('email_for_notifications, notify_email')
      .eq('notify_email', true);

    const recipients = (perms || [])
      .map((p: any) => p.email_for_notifications?.trim())
      .filter((e: string | undefined): e is string => !!e && e.includes('@'));

    if (!recipients.includes('panagwu@gmail.com')) recipients.push('panagwu@gmail.com');

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      console.log('[notify-admins-order] RESEND_API_KEY missing — skipping email. Would notify:', recipients);
      return new Response(JSON.stringify({ skipped: true, recipients, event }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isReceipt = event === 'receipt_uploaded';
    const shortId = String(order.id).slice(0, 8).toUpperCase();

    const itemsHtml = (items || []).map((i: any) =>
      `<li>${i.quantity} × ${escapeHtml(i.product_name)} — ${escapeHtml(i.variant_style || '')} ${escapeHtml(i.color || '')} — ₦${Number(i.variant_price * i.quantity).toLocaleString()}</li>`
    ).join('');

    const receiptBlock = order.payment_receipt_url
      ? `<div style="margin:16px 0;padding:16px;background:#fff8e6;border-left:4px solid #b8863c;border-radius:4px">
           <p style="margin:0 0 8px;font-weight:bold;color:#7a5a1e">📎 Bank transfer receipt uploaded</p>
           <a href="${escapeHtml(order.payment_receipt_url)}" style="display:inline-block;padding:10px 18px;background:#b8863c;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold">View receipt →</a>
         </div>` : '';

    const html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:24px;color:#222">
        <h1 style="color:#b8863c">${isReceipt ? '💳 Receipt uploaded' : '🛎️ New order placed'}</h1>
        <p><strong>Order:</strong> #${shortId}</p>
        <p><strong>Customer:</strong> ${escapeHtml(order.shipping_name)} — ${escapeHtml(order.shipping_phone || '')} — ${escapeHtml(order.shipping_email || '')}</p>
        <p><strong>Ship to:</strong> ${escapeHtml(order.shipping_address)}, ${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)}</p>
        <p><strong>Payment:</strong> ${escapeHtml(order.payment_method)} — ${escapeHtml(order.payment_status)}</p>
        <p><strong>Total:</strong> ₦${Number(order.total).toLocaleString()}</p>
        ${receiptBlock}
        ${order.gift_message ? `<p><strong>Gift note:</strong> <em>${escapeHtml(order.gift_message)}</em></p>` : ''}
        <h3>Items</h3>
        <ul>${itemsHtml}</ul>
        <p style="margin-top:24px;font-size:12px;color:#888">Log in to the admin dashboard to ${isReceipt ? 'verify this payment' : 'process this order'}.</p>
      </div>`;

    const subject = isReceipt
      ? `💳 Receipt uploaded for order #${shortId} — verify payment (₦${Number(order.total).toLocaleString()})`
      : `🛎️ New order #${shortId} — ₦${Number(order.total).toLocaleString()}`;

    const results = await Promise.allSettled(
      recipients.map((to) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: Deno.env.get('ADMIN_NOTIFY_FROM') || "J's Jewels <orders@example.com>",
            to, subject, html,
          }),
        }).then((r) => r.text()),
      ),
    );

    return new Response(JSON.stringify({ sent: results.length, recipients, event }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[notify-admins-order] error', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
