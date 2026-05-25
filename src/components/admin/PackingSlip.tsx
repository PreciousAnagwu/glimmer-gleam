import { forwardRef } from 'react';

interface Item { product_name: string; variant_style: string; color: string; quantity: number; variant_price: number; }
interface Props {
  order: {
    id: string;
    created_at: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_email: string;
    notes?: string | null;
    is_gift?: boolean;
    gift_sender_name?: string | null;
    gift_message?: string | null;
    order_items: Item[];
  };
}

export const PackingSlip = forwardRef<HTMLDivElement, Props>(({ order }, ref) => {
  const totalQty = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0;
  return (
    <div ref={ref} className="bg-white text-black p-8 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">J's Jewels</h1>
          <p className="text-xs text-gray-600">Packing Slip</p>
        </div>
        <div className="text-right text-xs">
          <p><strong>Order:</strong> #{order.id.slice(0, 8).toUpperCase()}</p>
          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Items:</strong> {totalQty}</p>
        </div>
      </div>

      {order.is_gift && (
        <div className="mb-6 border-2 border-dashed border-rose-400 rounded p-4 bg-rose-50">
          <p className="font-bold text-base">🎁 GIFT ORDER — Include note in package</p>
          {order.gift_sender_name && <p className="text-sm mt-2"><strong>From:</strong> {order.gift_sender_name}</p>}
          {order.gift_message && (
            <div className="mt-2 p-3 bg-white border border-rose-200 rounded">
              <p className="text-xs text-gray-500 uppercase mb-1">Personal message</p>
              <p className="italic">"{order.gift_message}"</p>
            </div>
          )}
          <p className="text-xs mt-3 text-gray-600">⚠️ Do not include receipt or pricing. Wrap as gift.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-500 mb-2">Ship To</h2>
          <p className="font-semibold">{order.shipping_name}</p>
          <p className="text-sm">{order.shipping_address}</p>
          <p className="text-sm">{order.shipping_city}, {order.shipping_state}</p>
          <p className="text-sm mt-2">📞 {order.shipping_phone}</p>
          <p className="text-sm">✉ {order.shipping_email}</p>
        </div>
        {order.notes && (
          <div>
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-2">Order Notes</h2>
            <p className="text-sm">{order.notes}</p>
          </div>
        )}
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left p-2">Item</th>
            <th className="text-left p-2">Style</th>
            <th className="text-left p-2">Color</th>
            <th className="text-center p-2">Qty</th>
            <th className="text-center p-2">✓</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items?.map((it, i) => (
            <tr key={i} className="border-b border-gray-300">
              <td className="p-2">{it.product_name}</td>
              <td className="p-2">{it.variant_style}</td>
              <td className="p-2">{it.color}</td>
              <td className="text-center p-2 font-bold">{it.quantity}</td>
              <td className="text-center p-2">☐</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 pt-4 border-t border-gray-300 text-xs text-gray-600 flex justify-between">
        <p>Picked by: ____________________</p>
        <p>Packed by: ____________________</p>
        <p>Date: ____________________</p>
      </div>
    </div>
  );
});
PackingSlip.displayName = 'PackingSlip';
