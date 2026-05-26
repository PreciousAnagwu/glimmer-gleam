// Sends an email to a gift recipient (registered or not) when a gift order is paid.
// SETUP (manual, after you add your verified email domain):
//   1. Replace FROM_ADDRESS with your verified sender (e.g. "J's Jewels <gifts@yourdomain.com>")
//   2. Add RESEND_API_KEY (or your provider's key) in Supabase secrets
//   3. Deploy: supabase functions deploy send-gift-notification
//
// Invoke from client after a successful gift payment:
//   await supabase.functions.invoke('send-gift-notification', {
//     body: {
//       recipientEmail, recipientName, senderName,
//       message, orderId, trackingUrl, giftSlug,
//       isRequest: false, // true if Flow B (someone gifted what user requested)
//     }
//   });

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { renderGiftEmail } from '../_shared/email-templates/gift-notification.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TODO: change this to your verified sender after domain setup
const FROM_ADDRESS = "J's Jewels <gifts@yourdomain.com>";

interface Payload {
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  message?: string;
  orderId: string;
  trackingUrl: string;
  giftSlug?: string;
  isRequest?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    if (!body.recipientEmail || !body.senderName || !body.orderId || !body.trackingUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { subject, html, text } = renderGiftEmail(body);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.warn('[send-gift-notification] RESEND_API_KEY not set — email skipped (dev mode).');
      return new Response(JSON.stringify({ ok: true, skipped: true, preview: { subject, html } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [body.recipientEmail],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[send-gift-notification] provider error', err);
      return new Response(JSON.stringify({ error: 'Email provider error', detail: err }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[send-gift-notification] error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
