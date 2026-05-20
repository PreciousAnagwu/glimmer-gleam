
## Two Gift Flows

### Flow A — "Send a Gift" (you pay for someone else)
1. User picks items → opens **Send as a Gift** dialog → fills sender name, recipient name/email, message, occasion, **recipient shipping address & phone**.
2. A `gift_wishlists` row is created (type = `send`) with recipient address attached.
3. **Sender is taken straight to checkout** with the gift items pre-loaded, recipient's address pre-filled, and a "🎁 Gift order" banner. Sender pays.
4. On successful payment, the order is tagged `is_gift = true`, `gift_id = <wishlist id>`, with sender/recipient/message stored on the order.
5. **Recipient is notified** (in-app notification + the public `/gift/<slug>` page becomes a "tracking" page showing "🎁 [Sender] sent you a gift — arriving soon", plus the order tracking link).
6. **Both sender and recipient see the order** in their account → Orders tab; admin sees a Gift badge + sender's note + recipient address.

### Flow B — "Request a Gift" (someone pays for you) — NEW
1. User picks items → opens new **Request a Gift** dialog → fills their own name, **their shipping address**, optional message ("Hey, I'd love this for my birthday!"), expiry.
2. A `gift_wishlists` row is created (type = `request`).
3. User receives a shareable link (Copy / WhatsApp / Email) to send to anyone.
4. Anyone opening the link sees: "[User] would love these — pick one (or all) to gift them" with an **"Be the gifter & checkout"** button.
5. Gifter checks out (no account required to pay, but email captured); ships to **the requester's saved address** (locked, gifter cannot change). Gifter pays.
6. Order created with `is_gift = true`, `gift_id`, `recipient_user_id = requester`, `gifter_email`, `gifter_name`.
7. **Requester is notified** in-app + sees the order in their Orders tab with "🎁 Gifted by [Name]". Requester can track delivery.
8. **Gifter** gets a tracking link by email (and can revisit `/gift/<slug>?ord=<id>` to track).

---

## Schema changes

**`gift_wishlists`** — add columns:
- `gift_type` text default `'send'` — `'send' | 'request'`
- `recipient_user_id` uuid (for request flow — the user who will receive)
- `shipping_name`, `shipping_phone`, `shipping_address`, `shipping_city`, `shipping_state` text — recipient's locked address
- `status` text default `'open'` — `'open' | 'fulfilled' | 'expired'`
- `fulfilled_order_id` uuid

**`orders`** — add columns:
- `is_gift` boolean default false
- `gift_id` uuid (FK to gift_wishlists.id)
- `gift_message` text
- `gift_sender_name` text
- `gift_recipient_user_id` uuid — populated for both flows so the recipient sees the order in their Orders tab

**`notifications`** — new table:
- `id`, `user_id`, `type` (`gift_received` | `gift_fulfilled` | `order_status`), `title`, `body`, `link`, `read_at`, `created_at`
- RLS: user reads own; system inserts via SECURITY DEFINER function.

---

## UI changes

- **`GiftWishlistDialog.tsx`** — add address fields, add "Continue to checkout & pay" button (Flow A bypasses the share screen and goes to `/checkout?gift=<id>`).
- **New `RequestGiftDialog.tsx`** — wishlist → form (own address + message + expiry) → share link (Copy / WhatsApp / Email).
- **`GiftWishlistView.tsx`** — branches on `gift_type`:
  - `send`: shows "🎁 You've received a gift from X" + tracking once order exists.
  - `request`: shows "[User] would love these" + "Be the gifter" CTA → `/checkout?giftRequest=<slug>`.
- **`Checkout.tsx`** — reads `?gift=<id>` or `?giftRequest=<slug>`:
  - Loads gift items + locks shipping fields to recipient address.
  - Shows gift banner + message.
  - On success, writes gift fields onto the order + creates notification for the recipient.
- **`Account.tsx` → Orders tab** — show Gift badge; recipient sees gifted-to-them orders too (queried via `gift_recipient_user_id`).
- **Navbar** — add bell icon with unread notification count + dropdown; clicking marks read & navigates to `link`.
- **`AdminOrders` (in `Admin.tsx`)** — show Gift badge, sender name, recipient info, and message on gift orders.

---

## Real-time
- Notifications table added to `supabase_realtime` publication so the bell updates live.
- Gift wishlist status updates also realtime (so requester sees "fulfilled" instantly).

---

## Out of scope (can add later)
- Email-on-create to recipient (no email infra set up yet — can wire later via Lovable Emails).
- Guest checkout for gifters who don't have an account (for now they sign in or create account at checkout — keeps payment + tracking clean).

---

Shall I proceed with this plan?
