// Branded HTML email for gift recipients.
// Pure string rendering — no external deps, easy to tweak.

interface Args {
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  message?: string;
  orderId: string;
  trackingUrl: string;
  giftSlug?: string;
  isRequest?: boolean;
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderGiftEmail(a: Args) {
  const name = a.recipientName ? escape(a.recipientName) : 'there';
  const sender = escape(a.senderName);
  const msg = a.message ? escape(a.message) : '';
  const subject = a.isRequest
    ? `🎁 Great news — ${sender} gifted you your J's Jewels wishlist!`
    : `🎁 You've received a gift from ${sender}!`;

  const intro = a.isRequest
    ? `Wonderful news! <strong>${sender}</strong> just paid for the J's Jewels pieces on your wishlist. They're on the way to you.`
    : `<strong>${sender}</strong> has sent you a special gift from J's Jewels. We're preparing your package now.`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escape(subject)}</title></head>
<body style="margin:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;color:#2a2a2a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #ece4d6;border-radius:8px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#c9a84c,#e8c878);padding:32px;text-align:center;color:#1a1a1a;">
          <div style="font-size:42px;margin-bottom:8px;">🎁</div>
          <h1 style="margin:0;font-size:24px;letter-spacing:1px;">J's Jewels</h1>
          <p style="margin:8px 0 0;font-size:14px;opacity:0.85;">A gift just for you</p>
        </td></tr>
        <tr><td style="padding:32px 32px 8px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a1a;">Hi ${name},</h2>
          <p style="line-height:1.6;font-size:15px;margin:0 0 20px;">${intro}</p>
          ${msg ? `<div style="background:#fbf5e9;border-left:3px solid #c9a84c;padding:16px 20px;margin:20px 0;font-style:italic;color:#5a4a2a;">"${msg}"<br><span style="font-style:normal;font-size:13px;color:#8a7a5a;">— ${sender}</span></div>` : ''}
          <p style="margin:24px 0;text-align:center;">
            <a href="${escape(a.trackingUrl)}" style="display:inline-block;background:#1a1a1a;color:#c9a84c;padding:14px 32px;text-decoration:none;border-radius:4px;font-family:Arial,sans-serif;font-size:14px;letter-spacing:1px;">TRACK YOUR GIFT</a>
          </p>
          <p style="font-size:13px;color:#6a6a6a;text-align:center;margin:0 0 8px;">Order reference: <strong>#${escape(a.orderId.slice(0, 8).toUpperCase())}</strong></p>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;border-top:1px solid #f0e8d8;text-align:center;font-size:12px;color:#8a8a8a;">
          With love,<br><strong style="color:#c9a84c;">J's Jewels</strong>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `Hi ${a.recipientName || 'there'},

${a.isRequest
  ? `${a.senderName} just paid for the J's Jewels pieces on your wishlist!`
  : `${a.senderName} has sent you a gift from J's Jewels.`}

${a.message ? `Message: "${a.message}"\n` : ''}
Track your gift: ${a.trackingUrl}
Order: #${a.orderId.slice(0, 8).toUpperCase()}

With love, J's Jewels`;

  return { subject, html, text };
}
