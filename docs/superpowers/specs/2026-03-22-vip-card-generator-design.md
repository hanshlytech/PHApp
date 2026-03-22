# VIP Card Generator — Design Spec

**Date:** 2026-03-22
**Status:** Approved
**Scope:** Replaces the bare-bones "Print QR" with a branded, print-ready two-sided VIP card

---

## 1. Overview

Enhance the existing admin portal's "Print QR" button to open a fully branded, print-ready VIP card page in a new browser tab. The card is credit-card sized (85.6×54mm), has a front and back, uses the Prasad Hospitals brand colors and logo, and is designed for printing on glossy card stock.

This is a frontend-only change — no new API endpoints, no new dependencies. The existing `GET /api/cards/:id/qr` endpoint already returns the QR code as base64 PNG; we simply improve the HTML that's written to the print window.

---

## 2. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Card format | Credit card (85.6×54mm landscape) | Standard physical wallet size; can go to card printer |
| Sides | Front + Back (two-sided) | Back lists benefits so patient can read without the app |
| Output | HTML in new browser tab → browser print dialog | No new dependencies; existing pattern, just improved |
| Color scheme | Navy blue (#1a3a6b / #0d2847) + gold (#D4AF37) | Matches ₹4,999 VIP tier; premium feel |
| Logo placement | Circular badge (50px, gold-ringed) at top-right of front | Real `PHLogo.png` embedded as base64; clearly visible on dark bg |
| Members shown | Primary member name only | Standard for physical cards; staff sees all members after scan |

---

## 3. Card Front

**Dimensions:** 85.6×54mm (rendered at ~252×159px on screen, print CSS scales to exact size)

**Layout (top to bottom):**
- Top row: hospital name + VIP Health Card title (left) · circular logo badge (right)
- Bottom row: member name + card ID + validity (left) · QR code in gold-bordered box (right)

**Visual elements:**
- Background: `linear-gradient(135deg, #1a3a6b 0%, #0d2847 100%)`
- Gold shimmer line across top edge (`#D4AF37`)
- Faint gold shimmer line across bottom edge
- Subtle radial gold glow behind logo area
- Card border: `1px solid rgba(212,175,55,0.35)`
- Border radius: `10px` (screen) / `3mm` (print)

**Logo badge:**
- `50×50px` circle, white background
- `2px solid #D4AF37` border + faint outer outline
- `PHLogo.png` embedded as base64 data URL (36×36px, `object-fit: contain`)
- Box shadow for depth

**Text:**
- "PRASAD HOSPITALS" — `#D4AF37`, 8px, letter-spacing 2.5px, uppercase
- "VIP Health Card" — white, 13px, font-weight 800
- "Multispeciality Healthcare" — white 38% opacity, 7.5px
- "Card Holder" label — gold 55% opacity, 7.5px uppercase
- Member name — white, 13px, font-weight 700 (fallback: first member's name, or "Card Holder" if `members` is empty)
- Card number — white 45% opacity, 9px monospace, letter-spacing 1.5px
- Validity — gold 50% opacity, 7px — shows expiry date only (e.g. "Valid thru: Jan 2026"); issued date is not shown on the front face

**QR box:**
- `52×52px` white box, `border-radius: 6px`
- `2px solid rgba(212,175,55,0.6)` border
- QR image is the base64 PNG returned by `GET /api/cards/:id/qr`

---

## 4. Card Back

**Background:** `linear-gradient(135deg, #fffdf5 0%, #fef9e7 100%)` — warm cream
**Border:** `1.5px solid #D4AF37`

**Layout (top to bottom):**
1. "BENEFITS INCLUDED" label (gold) + expiry date (top)
2. Benefit pills row
3. Policy note (italic)
4. Footer row

**Benefit pills** (one per covered service):
- ✓ Unlimited OPD · ✓ MRI · ✓ CT Scan · ✓ X-Ray · ✓ Ultrasound
- Style: white background, `#1a3a6b` text, `1px solid #D4AF37` border, 7.5px bold

**Policy note:**
> *Scans valid only with internal Prasad Hospitals prescription*

**Footer:**
- Left: `prasadhospitals.in` (navy, bold) · branch names (grey)
- Right: "Non-transferable" · "Non-refundable" (light grey)

**Watermark:** `PHLogo.png` at `opacity: 0.06`, bottom-right, 70×70px — subtle brand depth

---

## 5. Print Page Layout

The new browser tab contains:

```
[Page title]  "Prasad Hospitals — VIP Health Card"
[Subtitle]    "Print on glossy card stock · Cut along dotted lines"

[FRONT card]         [BACK card]
[✂ cut line]         [✂ cut line]

[🖨 Print Card button]  [Close button]
```

Both cards are displayed side by side (flex row, 40px gap). Each has a dashed cut line below. The "Print Card" button triggers `window.print()`.

**Print CSS:**
- `@media print`: hide page title/subtitle/buttons, show only cards
- Cards sized to exact 85.6×54mm using `width: 85.6mm; height: 54mm`
- `page-break-inside: avoid` on each card
- Print layout: front and back printed **side by side on one page** for manual cut-and-fold. This is the standard POC approach — no `@page` break between sides. Staff cuts out both faces and folds/laminates.

---

## 6. Implementation

### What changes

**File:** `prasad-hospitals-app/src/pages/admin/CardDetail.tsx`

Replace the `handlePrintQr` function body. The function already:
1. Fetches `GET /api/cards/:id/qr` → `{ qr, card_number }`
2. Opens a new window via `window.open('', '_blank')`
3. Writes HTML to `win.document`

We keep the same pattern, just replace the written HTML with the full branded card design. The QR base64 (`qr`) is already available — inject it as the `src` of the QR `<img>`.

**Error handling for QR fetch:** If `getCardQr` throws (network error, server error), catch the error and show an inline error message in the admin portal (same pattern as other errors in `CardDetail`) — do not open the print window. The existing try/catch pattern in the component should be extended to cover this.

**Card status:** The card generator works for all statuses (`active`, `expired`, `suspended`). No status watermark is shown on the generated card — the card is a physical artefact and its validity is checked by the reception portal at scan time. The "Generate Card" button is visible regardless of status (admin may need to reprint for any card).

**Logo:** Use the public URL `/PHLogo.png` directly as the `<img src>` in the written HTML — the new window shares the same origin (`window.open('', '_blank')` on the same host), so the browser resolves it correctly without any base64 embedding. This is the simplest approach and requires no Vite import changes.

```html
<img src="/PHLogo.png" width="36" height="36" style="object-fit:contain;" />
```

**Button label:** Change "⬇ Print QR" → "🪪 Generate Card"

### What does NOT change
- Backend API — no new endpoints
- Database schema
- Any other frontend components
- Dependencies — no new packages

---

## 7. Data Used in the Card

All data comes from the existing `CardDetail` state object (`card`):

| Field | Source | Notes |
|-------|--------|-------|
| Primary member name | `card.members.find(m => m.is_primary)?.name ?? card.members[0]?.name ?? 'Card Holder'` | Safe fallback chain |
| Card number | `card.card_number` | — |
| Expiry date | `card.expiry_date` | Shown on front as "Valid thru: MMM YYYY" |
| Branch | `card.branch` | Shown on back footer |
| QR image | `getCardQr(id)` → `{ qr }` (base64 PNG) | — |

**Note:** `card.issued_date` is not displayed on the card (front or back). The expiry date alone is sufficient for the patient.

---

## 8. Out of Scope

- PDF generation (browser print is sufficient for POC)
- PNG download button
- Member photos on card
- Barcode alternative to QR
- Card template customisation UI
- Physical card printing integration

---

## 9. Success Criteria

1. Admin clicks "Generate Card" on any card detail page
2. A new tab opens promptly (on local dev server) showing both card faces
3. Front shows: real logo in circular gold badge, member name, card number, validity, QR code
4. Back shows: benefit pills, policy note, branch list, watermark
5. Clicking "Print Card" opens the browser print dialog with cards correctly sized
6. The design matches the approved mockup (navy + gold, `PHLogo.png`)
