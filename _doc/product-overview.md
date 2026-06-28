# Product Overview — Core Truth

> Single source of truth for the product. The concept, the four roles, the name, and the
> day-one core loop are **confirmed and built** (initial MVP generated). The next
> confirmed direction — turning the flat role views into an **explorable stylized-luxe 3D
> hotel** — is **confirmed and in progress (not yet built)** and is marked **(in progress)**
> below. A few details (the specific property / deployment context) are still settling and
> are marked **(provisional)**.

## What it is

**Cinq** (French for *five*, as in five-star) is a **browser-based, multi-role five-star
hotel experience app**. Rather than one person running everything, the hotel is lived
through **four distinct roles** — **VIP, Chef, Employee, and Customer** — each with its own
view and its own actions. It runs entirely in the web browser; no install.

It began as a "hotel game" in the user's words and keeps a playful, premium feel — but it
is a **real, working role-based app**: guests ask, staff deliver, status flows back, live.

## The four roles

- **Customer** — a guest; requests and books the hotel's experiences and services from
  their own view, and tracks status live.
- **VIP** — a premium guest; the same as a Customer, but requests carry **priority** (and
  perks).
- **Employee** — floor staff; **receives and handles** guest/floor requests across the hotel.
- **Chef** — the kitchen; **sees and fulfills** dining / food orders.

## The core loop (the heartbeat — built)

A request flows from a Customer or VIP and lands live in front of the right staffer, who
fulfills it:

1. **Request** — a Customer or VIP picks a category (**dining, spa, amenities, service**)
   and an item, optionally adds a note, and places the request.
2. **Route** — it routes by category in real time: the **Chef** sees dining/kitchen orders;
   the **Employee** sees floor/guest requests. **VIP** requests surface first, with a gold
   priority badge.
3. **Resolve** — staff advance status **received → in progress → fulfilled**, and the
   guest's tracker reflects it live.

This guest→staff request-and-fulfillment loop is the product. It lives or dies on a request
reaching the correct fulfiller instantly with status returning to the guest.

## What v1 delivers

Four role-based views behind a role-picker entry (`/customer`, `/vip`, `/employee`,
`/chef`), the live request loop above, VIP priority surfacing, and live status tracking.
Owner-customizable values (app name, tagline, request categories and their routing,
bookable amenities, brand palette/fonts, refresh interval) flow through configuration.

## Who it's for

A **five-star (or aspiring-luxury) hotel** and the people in its world — its **guests**
(Customer, VIP) on one side and its **staff** (Employee, Chef) on the other: premium and
guest-facing on one side, fast and operational on the other. (provisional: the specific
property / deployment context is still being confirmed.)

## Tone & brand

- **Personality**: playful, polished, aspirational luxury — "step into a five-star world."
- **Feel**: cozy-premium; calm, confident, not cluttered; satisfying real-time feedback.
- **Palette**: deep **navy/teal** base with a warm **gold** accent (the five-star luxury
  cue).
- **Typography**: **Cormorant Garamond** headings + **Lato** body (refined, hospitable).
- **Name**: **Cinq** (French for *five* — the five-star cue).

## Scope / strategic principles

- **The four roles are the spine.** VIP, Chef, Employee, Customer define the whole product.
- **The request → fulfillment loop first.** A guest asks; the right staffer delivers, live,
  with status back to the guest. That single loop is the MVP; everything else is secondary.
- **Real-time over batch.** Requests land in front of the right person live, not on a refresh.
- **Priority for VIP.** VIP requests visibly jump the queue.
- **Five-star luxury tone throughout.** Premium, warm, and inviting in every role's view.
- **Browser-native, instant access.** Low friction to start; no install.
