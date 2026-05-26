# send-gift-notification

Sends a branded HTML email to a gift recipient when a gift order is paid.
Works for both flows:
- **Send a Gift** (Flow A): notifies the recipient that the sender paid for a gift.
- **Request a Gift** (Flow B): notifies the requester that a gifter fulfilled their wishlist.

## Setup (do once after adding your email domain)

1. **Add your sending API key** as a Supabase secret:
   ```
   RESEND_API_KEY=<your key>
   ```
   (Or swap the provider in `index.ts` — Mailgun/SendGrid/etc. all work the same way.)

2. **Edit `FROM_ADDRESS`** in `index.ts` to a verified sender on your domain:
   ```ts
   const FROM_ADDRESS = "J's Jewels <gifts@yourdomain.com>";
   ```

3. **Deploy** (auto on Lovable; manual on GitHub/CLI):
   ```
   supabase functions deploy send-gift-notification
   ```

4. **Add config** in `supabase/config.toml` if you want it public (no JWT):
   ```toml
   [functions.send-gift-notification]
   verify_jwt = false
   ```

## Invoking from the app

After a successful gift payment in `Checkout.tsx`:

```ts
await supabase.functions.invoke('send-gift-notification', {
  body: {
    recipientEmail: gift.recipient_email,   // from gift_wishlists
    recipientName: gift.recipient_name,
    senderName: gift.sender_name,
    message: gift.message,
    orderId: order.id,
    trackingUrl: `${window.location.origin}/orders/${order.id}`,
    giftSlug: gift.slug,
    isRequest: gift.gift_type === 'request',
  },
});
```

## Without an API key

If `RESEND_API_KEY` is not set, the function returns `{ skipped: true, preview }` instead of failing — useful for local dev.
