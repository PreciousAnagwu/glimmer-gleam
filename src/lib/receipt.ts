// Customer-facing printable / downloadable receipt (invoice).
// Opens a print window that the customer can save as PDF.

interface ReceiptItem {
  product_name: string;
  variant_style?: string | null;
  color?: string | null;
  quantity: number;
  variant_price: number;
}

interface ReceiptOrder {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_reference?: string | null;
  subtotal: number;
  shipping_fee: number;
  discount?: number | null;
  coupon_code?: string | null;
  total: number;
  shipping_name: string;
  shipping_email?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const ngn = (n: number) => `\u20a6${Number(n || 0).toLocaleString()}`;

export function buildReceiptHtml(order: ReceiptOrder, items: ReceiptItem[]): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const rows = (items || [])
    .map(
      (it) => `<tr style="border-bottom:1px solid #eee">
        <td style="padding:10px">${esc(it.product_name)}<div style="font-size:11px;color:#777">${esc(it.variant_style || '')} ${esc(it.color || '')}</div></td>
        <td style="padding:10px;text-align:center">${it.quantity}</td>
        <td style="padding:10px;text-align:right">${ngn(it.variant_price)}</td>
        <td style="padding:10px;text-align:right">${ngn(it.variant_price * it.quantity)}</td>
      </tr>`,
    )
    .join('');

  const paid = order.payment_status === 'paid';

  return `<!doctype html><html><head><meta charset="utf-8">
    <title>Receipt ${shortId} — J's Jewels</title>
    <style>@media print{@page{size:A4;margin:12mm}}body{margin:0}</style>
  </head><body>
  <div style="padding:32px;font-family:Georgia,'Times New Roman',serif;color:#1c1c1c;max-width:210mm;margin:auto">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #b8863c;padding-bottom:14px">
      <div>
        <h1 style="margin:0;font-size:26px;color:#b8863c;letter-spacing:1px">J's Jewels</h1>
        <p style="margin:2px 0 0;font-size:11px;color:#777;letter-spacing:2px;text-transform:uppercase">Official Receipt</p>
      </div>
      <div style="text-align:right;font-size:12px">
        <p style="margin:2px 0"><b>Receipt #</b> ${shortId}</p>
        <p style="margin:2px 0"><b>Date</b> ${new Date(order.created_at).toLocaleDateString()}</p>
        <p style="margin:8px 0 0;display:inline-block;padding:4px 10px;border-radius:99px;background:${paid ? '#e8f7ec' : '#fff6e5'};color:${paid ? '#1a7f37' : '#8a5a00'};font-size:11px;font-weight:bold;text-transform:uppercase">${esc(order.payment_status)}</p>
      </div>
    </div>

    <div style="display:flex;gap:32px;margin:24px 0">
      <div style="flex:1">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:1px;color:#888;text-transform:uppercase">Billed / Shipped to</p>
        <p style="margin:0;font-weight:bold">${esc(order.shipping_name)}</p>
        <p style="margin:0;font-size:13px">${esc(order.shipping_address)}</p>
        <p style="margin:0;font-size:13px">${esc(order.shipping_city)}, ${esc(order.shipping_state)}</p>
        <p style="margin:6px 0 0;font-size:13px">${esc(order.shipping_phone)}</p>
        <p style="margin:0;font-size:13px">${esc(order.shipping_email)}</p>
      </div>
      <div style="flex:1">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:1px;color:#888;text-transform:uppercase">Payment</p>
        <p style="margin:0;font-size:13px"><b>Method:</b> ${esc(order.payment_method)}</p>
        <p style="margin:0;font-size:13px"><b>Status:</b> ${esc(order.payment_status)}</p>
        ${order.payment_reference ? `<p style="margin:0;font-size:13px"><b>Reference:</b> ${esc(order.payment_reference)}</p>` : ''}
        <p style="margin:0;font-size:13px"><b>Order status:</b> ${esc(order.status)}</p>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="border-bottom:2px solid #1c1c1c;font-size:11px;text-transform:uppercase;color:#555">
        <th style="text-align:left;padding:8px">Item</th>
        <th style="text-align:center;padding:8px">Qty</th>
        <th style="text-align:right;padding:8px">Unit</th>
        <th style="text-align:right;padding:8px">Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="margin-top:20px;margin-left:auto;width:280px;font-size:13px">
      <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Subtotal</span><span>${ngn(order.subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Shipping</span><span>${ngn(order.shipping_fee)}</span></div>
      ${Number(order.discount) > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#b8863c"><span>Discount ${order.coupon_code ? `(${esc(order.coupon_code)})` : ''}</span><span>-${ngn(Number(order.discount))}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #1c1c1c;margin-top:6px;font-size:16px;font-weight:bold"><span>Total</span><span>${ngn(order.total)}</span></div>
    </div>

    <p style="margin-top:44px;text-align:center;font-size:11px;color:#999">
      Thank you for shopping with J's Jewels &#10024;<br/>This receipt was generated on ${new Date().toLocaleString()}.
    </p>
  </div>
  </body></html>`;
}

/** Opens the receipt in a new window and triggers the print/save-as-PDF dialog. */
export function printOrderReceipt(order: ReceiptOrder, items: ReceiptItem[]) {
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) return false;
  w.document.write(buildReceiptHtml(order, items));
  w.document.close();
  setTimeout(() => w.print(), 400);
  return true;
}

/** Downloads the receipt as a standalone .html file (works when popups are blocked). */
export function downloadOrderReceipt(order: ReceiptOrder, items: ReceiptItem[]) {
  const blob = new Blob([buildReceiptHtml(order, items)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JsJewels-Receipt-${order.id.slice(0, 8).toUpperCase()}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
