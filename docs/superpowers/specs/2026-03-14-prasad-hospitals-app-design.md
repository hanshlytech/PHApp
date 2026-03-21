# Prasad Hospitals Patient App — Design Spec

**Date:** 2026-03-14
**Status:** Approved
**Scope:** Demo (mock data, no backend)

---

## Overview

A mobile-first web application for Prasad Hospitals that serves both new and existing patients. Patients can book appointments with a live slot picker and leave guided Google Reviews, all scoped to one of three hospital branches. Built as a demo with mock data; no backend required. Deployable as a standalone shareable link.

---

## Goals

- Let patients book appointments at their branch (department → doctor → slot → confirmation)
- Guide satisfied patients to leave a Google Review for their branch
- Capture internal feedback from dissatisfied patients (protecting public reputation)
- Demonstrate the full experience to hospital stakeholders before committing to a full build

---

## Non-Goals (Demo Scope)

- No real backend or database
- No actual booking storage or confirmation emails/SMS
- No admin panel (hardcoded data only)
- No authentication or patient login
- No payment integration

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React (Vite) | Fast setup, component-driven |
| Styling | Tailwind CSS + shadcn/ui | Polished UI without custom CSS |
| Data | `mockData.ts` (hardcoded) | No backend needed for demo |
| Routing | React Router v6 | Client-side navigation |
| Deployment | Vercel / Netlify (free tier) | Shareable link in minutes |
| Calendar link | Google Calendar URL API | No library needed |

---

## Architecture

```
src/
├── data/
│   └── mockData.ts          # All branches, departments, doctors, slots
├── components/
│   ├── BranchCard.tsx
│   ├── DepartmentGrid.tsx
│   ├── DoctorCard.tsx
│   ├── SlotPicker.tsx
│   ├── PatientForm.tsx
│   ├── ConfirmationScreen.tsx
│   ├── StarRating.tsx
│   ├── FeedbackForm.tsx
│   └── StepIndicator.tsx
├── pages/
│   ├── LandingPage.tsx       # Dedicated route "/" — branch selection
│   ├── HomePage.tsx          # Route "/home" — two CTAs
│   ├── BookingFlow.tsx       # Route "/book" — 5-step booking wizard
│   └── ReviewFlow.tsx        # Route "/review" — 3-step review wizard
├── context/
│   └── BranchContext.tsx     # Selected branch stored in React context + sessionStorage
└── App.tsx                   # Routes + BranchProvider
```

**Branch scoping:** The selected branch is stored in React context, backed by `sessionStorage`. All flows (booking and review) read the branch from context automatically — the user does not re-select per flow. Landing page (`/`) is a dedicated route, not a modal.

---

## Data Model

### Branch
```ts
interface Branch {
  id: string                   // e.g. "kukatpally"
  name: string                 // e.g. "Prasad Hospitals Kukatpally"
  area: string                 // e.g. "Kukatpally, Hyderabad"
  address: string              // Full address string
  phone: string                // e.g. "+91-40-12345678"
  googleMapsReviewUrl: string  // Placeholder URL pointing to Google Maps place review tab
}
```

### Department
```ts
interface Department {
  id: string                   // e.g. "cardiology"
  branchId: string             // Foreign key to Branch.id
  name: string                 // e.g. "Cardiology"
  icon: string                 // Emoji, e.g. "🫀"
}
```

### Doctor
```ts
interface Doctor {
  id: string                   // e.g. "dr-rajesh-kumar"
  departmentId: string         // Foreign key to Department.id (one department per doctor in demo)
  name: string                 // e.g. "Dr. Rajesh Kumar"
  qualification: string        // e.g. "MBBS, MD, DM (Cardiology)"
  photoUrl: string             // Placeholder avatar URL (e.g. ui-avatars.com or local asset)
  nextAvailable: string        // Display string, e.g. "Today" | "Tomorrow" | "Sat, 16 Mar"
}
```

### Slot
```ts
interface Slot {
  id: string                   // Unique slot ID
  doctorId: string             // Foreign key to Doctor.id
  date: string                 // ISO date string, e.g. "2026-03-14"
  time: string                 // 12-hour display string, e.g. "10:00 AM"
  session: "morning" | "afternoon" | "evening"
  available: boolean           // true = selectable, false = greyed out
}
```

**Slot counts:** Each doctor has 3 days of slots. Each day has 3 sessions (morning 9–12, afternoon 2–5, evening 6–8). Each session has 3 slots = 9 slots per doctor per day, 27 slots total per doctor. Approximately 30% of slots are marked `available: false` to simulate realistic partial availability.

**Doctor–Department relationship:** One-to-one in the demo (each doctor belongs to exactly one department). Many-to-many is a full-build concern.

---

## Screen Flows

### Routing
| Route | Page | Notes |
|---|---|---|
| `/` | LandingPage | Branch selection — always the entry point |
| `/home` | HomePage | Requires branch in context; redirects to `/` if missing |
| `/book` | BookingFlow | Requires branch in context; redirects to `/` if missing |
| `/review` | ReviewFlow | Requires branch in context; redirects to `/` if missing |

### Flow 1: Landing Page (`/`)
- Prasad Hospitals logo + tagline at top
- 3 branch cards: name, area, full address
- Tap a card → save branch to context + sessionStorage → navigate to `/home`

### Flow 2: Home Dashboard (`/home`)
- Header: selected branch name + "Change Branch" link (clears context, returns to `/`)
- Two large CTA cards: "Book Appointment" and "Leave a Review"
- Footer: branch phone number + prasadhospitals.in link

### Flow 3: Booking Flow (`/book`) — 5 Steps

| Step | Name | Description |
|---|---|---|
| 1 | Department | Grid of 8 department tiles (icon + name) for the selected branch |
| 2 | Doctor | 2–3 doctor cards per department (photo, name, qualification, next available badge) |
| 3 | Date & Time | 3-day tab selector; slots grouped by session (morning/afternoon/evening); available slots shown in blue, unavailable in grey |
| 4 | Patient Details | Form: Full Name (text), Phone Number (tel), Reason for Visit (textarea, optional) |
| 5 | Confirmation | Appointment summary card + "Add to Google Calendar" button + "Share via WhatsApp" link |

**Navigation:** Step indicator progress bar at top. Each step has a "Back" button. Tapping "Back" on Step 1 returns to `/home`.

**Proceed behaviour:** "Next" button is disabled until a selection is made on Steps 1–3. On Step 4, "Confirm Booking" is always enabled (no validation in demo — name/phone fields are not required).

**Google Calendar link construction:**
```
https://calendar.google.com/calendar/render
  ?action=TEMPLATE
  &text=Appointment+at+{branch.name}
  &dates={slot.date}T{slot.time.24hr}00/{slot.date}T{slot.time.24hr+30min}00
  &details=Dr.+{doctor.name}+%7C+{department.name}
  &location={branch.address}
```
Date/time is derived from the selected slot. Duration is hardcoded to 30 minutes. Time is converted from 12-hour display string to UTC-offset ISO 8601 for the URL. This conversion is handled by a utility function `buildCalendarUrl(slot, doctor, department, branch)`.

**WhatsApp share link:**
```
https://wa.me/?text=I+have+an+appointment+at+{branch.name}+on+{slot.date}+at+{slot.time}+with+{doctor.name}
```

### Flow 4: Review Flow (`/review`) — 3 Steps

| Step | Condition | Screen |
|---|---|---|
| 1 | Always | Large tappable star rating (1–5). Selected stars highlight yellow. No proceed until a rating is chosen. |
| 2a | Rating 4–5 | "We're glad you had a great experience!" message + short prompt ("Tell us what you loved") + pre-filled suggested phrases + "Post on Google" button |
| 2b | Rating 1–3 | "We're sorry to hear that." message + internal feedback form (see below) |
| 3 | After Google redirect (2a) | "Thank you for your review!" confirmation with branch name |
| 3 | After form submit (2b) | "Thank you for your feedback. We'll look into this." confirmation |

**Internal feedback form fields (Step 2b):**
- Department visited (dropdown — same 8 departments)
- Comments (textarea, required — minimum 10 characters to enable submit)
- Phone number (optional, tel input — "So we can follow up with you")

On submit: logs form data to browser console (demo). No network call.

**"Post on Google" behaviour:** Opens `branch.googleMapsReviewUrl` in a new tab. Since real Google Maps review URLs require a live Place ID, placeholder URLs will be used: `https://search.google.com/local/writereview?placeid=PLACEHOLDER_{branch.id}`. These are replaced with real Place IDs in the full build.

---

## Visual Design

**Color palette:**
- Primary: `#1E6FBA` (Prasad blue)
- Primary hover: `#1A5FA3`
- Success/confirmation: `#16A34A` (green)
- Warning/low-rating: `#EAB308` (star yellow)
- Surface: `#FFFFFF` cards, `#F8FAFC` page background
- Text: `#1E293B` (dark slate), `#64748B` (muted)
- Disabled: `#CBD5E1`

**Typography:** System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`). Clean, readable on mobile.

**Component style:**
- Rounded cards (`rounded-2xl`) with subtle shadows (`shadow-sm`)
- Full-width primary buttons on mobile
- Step indicator: thin progress bar, step number + label
- Smooth page transitions: fade + slide-up (CSS transitions, no library)
- Slot picker: skeleton loader animation on mount to simulate data fetch

**Responsive:** Designed at 375px base width. Content max-width 480px, centered on desktop with a soft shadow container.

---

## Error & Empty States

| Situation | Behaviour |
|---|---|
| No branch in context on `/home`, `/book`, `/review` | Redirect to `/` |
| "Next" clicked with no selection (Steps 1–3) | Button is disabled — no action, no toast |
| "Confirm Booking" on Step 4 | Always enabled; proceeds regardless of empty name/phone (demo mode) |
| Feedback form submit with < 10 chars in Comments | Submit button is disabled |
| Google Calendar link | Always constructed from mock slot data — no error state |
| Google Maps URL | Opens placeholder URL in new tab — no error handling needed in demo |

---

## Future Upgrade Path (Post-Demo)

When the hospital decides to go full build:

1. **Backend:** Replace `mockData.ts` with Supabase (Postgres + real-time subscriptions)
2. **Slot management:** Real availability, conflict prevention, double-booking locks
3. **Notifications:** WhatsApp/SMS confirmation via Twilio or MSG91
4. **Admin panel:** Manage doctors, departments, slots per branch
5. **Patient history:** OTP login, view past appointments
6. **Analytics:** Track review conversion rate per branch, booking funnel drop-off
7. **Google Maps URLs:** Replace placeholder Place IDs with real ones per branch

---

## Success Criteria

All criteria must be met for the demo to be considered complete:

- [ ] **Booking end-to-end:** A user can select a branch, navigate all 5 booking steps, and reach the confirmation screen without errors
- [ ] **Google Calendar link:** Tapping "Add to Google Calendar" opens a pre-filled calendar event with the correct doctor name, branch address, and appointment time
- [ ] **WhatsApp share:** Tapping "Share via WhatsApp" opens WhatsApp with a pre-filled message containing the appointment details
- [ ] **Positive review redirect:** Selecting 4 or 5 stars and tapping "Post on Google" opens a new tab to the correct branch's Google Maps review URL
- [ ] **Negative review capture:** Selecting 1–3 stars shows the internal feedback form; submitting it logs data to the console and shows a thank-you screen
- [ ] **Mobile usability:** All flows are fully usable on a 375px viewport without horizontal scrolling or overlapping elements
- [ ] **Branch isolation:** Selecting a different branch on the landing page correctly scopes all subsequent booking and review flows to that branch
- [ ] **Shareable URL:** App is deployed and accessible via a single public URL with no login required
