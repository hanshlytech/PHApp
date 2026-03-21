# Prasad Hospitals Patient App — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first React demo app for Prasad Hospitals with branch-scoped appointment booking and guided Google review flows, using mock data only.

**Architecture:** Single-page React app (Vite + TypeScript) with React Router v6 for client-side routing. Branch selection is persisted in React context + sessionStorage. All data lives in a single `mockData.ts` file, making it trivial to swap for a real API later.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v3, shadcn/ui, React Router v6, Vitest + React Testing Library (unit tests for utility functions and context), Vercel (deployment).

**Spec:** `docs/superpowers/specs/2026-03-14-prasad-hospitals-app-design.md`

---

## File Map

| File | Responsibility |
|---|---|
| `src/types/index.ts` | TypeScript interfaces: Branch, Department, Doctor, Slot, BookingState, ReviewState |
| `src/data/mockData.ts` | All mock data: 3 branches, 8 departments/branch, 2–3 doctors/department, 27 slots/doctor |
| `src/context/BranchContext.tsx` | React context + hook for selected branch, backed by sessionStorage |
| `src/utils/calendarUrl.ts` | `buildCalendarUrl()` utility — converts slot + doctor + branch to Google Calendar URL |
| `src/utils/whatsappUrl.ts` | `buildWhatsAppUrl()` utility — builds WhatsApp share text URL |
| `src/components/BranchCard.tsx` | Single branch card (name, area, address) |
| `src/components/StepIndicator.tsx` | Progress bar showing current step of N |
| `src/components/DepartmentGrid.tsx` | 8-tile grid of department tiles (icon + name) |
| `src/components/DoctorCard.tsx` | Doctor card (photo, name, qualification, next available badge) |
| `src/components/SlotPicker.tsx` | 3-day tab + session groups + slot buttons |
| `src/components/PatientForm.tsx` | Name / phone / reason form fields |
| `src/components/ConfirmationScreen.tsx` | Appointment summary + calendar + WhatsApp buttons |
| `src/components/StarRating.tsx` | 1–5 star tap input |
| `src/components/FeedbackForm.tsx` | Internal feedback (department dropdown, comments, phone) |
| `src/pages/LandingPage.tsx` | Route `/` — 3 branch cards |
| `src/pages/HomePage.tsx` | Route `/home` — two CTAs + footer |
| `src/pages/BookingFlow.tsx` | Route `/book` — orchestrates 5 booking steps |
| `src/pages/ReviewFlow.tsx` | Route `/review` — orchestrates 3 review steps |
| `src/App.tsx` | BranchProvider + Router + route definitions + redirect guard |
| `src/index.css` | Tailwind directives + CSS custom properties for theme colours |
| `tests/utils/calendarUrl.test.ts` | Unit tests for `buildCalendarUrl()` |
| `tests/utils/whatsappUrl.test.ts` | Unit tests for `buildWhatsAppUrl()` |
| `tests/context/BranchContext.test.tsx` | Unit tests for BranchContext hook |

---

## Chunk 1: Project Setup, Types, Mock Data, and Context

### Task 1: Scaffold the project

**Files:**
- Create: (project root — run from `/Users/srikanthananthula/Projects/Google-review`)

- [ ] **Step 1: Scaffold Vite React TypeScript project**

```bash
cd /Users/srikanthananthula/Projects/Google-review
npm create vite@latest prasad-hospitals-app -- --template react-ts
cd prasad-hospitals-app
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install react-router-dom
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 3: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 4: Configure Tailwind** — replace `tailwind.config.js` content:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E6FBA',
          hover: '#1A5FA3',
        },
        success: '#16A34A',
        star: '#EAB308',
        surface: '#F8FAFC',
        muted: '#64748B',
        disabled: '#CBD5E1',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Configure Vitest** — add to `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 5b: Add Vitest globals to `tsconfig.json`** — add `"types": ["vitest/globals"]` under `compilerOptions`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```
Merge this into the existing `tsconfig.json` — do not replace the whole file.

- [ ] **Step 6: Create test setup file** `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Replace `src/index.css`**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  background-color: #F8FAFC;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: 0;
  min-height: 100vh;
}

#root {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: white;
  box-shadow: 0 0 40px rgba(0,0,0,0.08);
}

.page-enter {
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```
Expected: server running at `http://localhost:5173`

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Vite React TypeScript project with Tailwind and Vitest"
```

---

### Task 2: Define TypeScript interfaces

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create types file**

```ts
// src/types/index.ts

export interface Branch {
  id: string
  name: string
  area: string
  address: string
  phone: string
  googleMapsReviewUrl: string
}

export interface Department {
  id: string
  branchId: string
  name: string
  icon: string
}

export interface Doctor {
  id: string
  departmentId: string
  name: string
  qualification: string
  photoUrl: string
  nextAvailable: string
}

export interface Slot {
  id: string
  doctorId: string
  date: string
  time: string
  session: 'morning' | 'afternoon' | 'evening'
  available: boolean
}

export interface BookingState {
  department: Department | null
  doctor: Doctor | null
  slot: Slot | null
  patientName: string
  patientPhone: string
  patientReason: string
}

export interface ReviewState {
  rating: number | null
  step: 1 | 2 | 3
  feedbackDepartment: string
  feedbackComments: string
  feedbackPhone: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript interfaces for Branch, Department, Doctor, Slot, BookingState, ReviewState"
```

---

### Task 3: Create mock data

**Files:**
- Create: `src/data/mockData.ts`

- [ ] **Step 1: Create mock data file**

```ts
// src/data/mockData.ts
import type { Branch, Department, Doctor, Slot } from '../types'

// Helper to generate slots for a doctor over the next 3 days
function generateSlots(doctorId: string, startDate: Date): Slot[] {
  const sessions: { session: Slot['session']; times: string[] }[] = [
    { session: 'morning',   times: ['09:00 AM', '10:00 AM', '11:00 AM'] },
    { session: 'afternoon', times: ['02:00 PM', '03:00 PM', '04:00 PM'] },
    { session: 'evening',   times: ['06:00 PM', '07:00 PM', '08:00 PM'] },
  ]
  const slots: Slot[] = []
  for (let d = 0; d < 3; d++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + d)
    const dateStr = date.toISOString().split('T')[0]
    sessions.forEach(({ session, times }) => {
      times.forEach((time, i) => {
        const idx = slots.length
        slots.push({
          id: `${doctorId}-${dateStr}-${session}-${i}`,
          doctorId,
          date: dateStr,
          time,
          session,
          available: idx % 3 !== 2, // ~33% unavailable
        })
      })
    })
  }
  return slots
}

// ─── Branches ────────────────────────────────────────────────────────────────

export const branches: Branch[] = [
  {
    id: 'kukatpally',
    name: 'Prasad Hospitals Kukatpally',
    area: 'Kukatpally, Hyderabad',
    address: '#1-98/1, KPHB Colony, Kukatpally, Hyderabad – 500072',
    phone: '+91-40-2304-5678',
    googleMapsReviewUrl: 'https://search.google.com/local/writereview?placeid=PLACEHOLDER_kukatpally',
  },
  {
    id: 'secunderabad',
    name: 'Prasad Hospitals Secunderabad',
    area: 'Secunderabad, Hyderabad',
    address: '#12-1-1149, Tarnaka, Secunderabad, Hyderabad – 500017',
    phone: '+91-40-2784-5678',
    googleMapsReviewUrl: 'https://search.google.com/local/writereview?placeid=PLACEHOLDER_secunderabad',
  },
  {
    id: 'manikonda',
    name: 'Prasad Hospitals Manikonda',
    area: 'Manikonda, Hyderabad',
    address: 'Plot No. 47, Manikonda Main Road, Manikonda, Hyderabad – 500089',
    phone: '+91-40-6674-5678',
    googleMapsReviewUrl: 'https://search.google.com/local/writereview?placeid=PLACEHOLDER_manikonda',
  },
]

// ─── Departments ─────────────────────────────────────────────────────────────

const departmentDefs = [
  { id: 'cardiology',    name: 'Cardiology',           icon: '🫀' },
  { id: 'orthopedics',   name: 'Orthopedics',           icon: '🦴' },
  { id: 'pediatrics',    name: 'Pediatrics',            icon: '👶' },
  { id: 'gynecology',    name: 'Gynecology & Obs',      icon: '🤱' },
  { id: 'neurology',     name: 'Neurology',             icon: '🧠' },
  { id: 'general-surgery', name: 'General Surgery',    icon: '🔬' },
  { id: 'ent',           name: 'ENT',                   icon: '👂' },
  { id: 'dermatology',   name: 'Dermatology',           icon: '🩺' },
]

export const departments: Department[] = branches.flatMap(branch =>
  departmentDefs.map(d => ({ ...d, id: `${branch.id}-${d.id}`, branchId: branch.id }))
)

// ─── Doctors ──────────────────────────────────────────────────────────────────

interface DoctorTemplate {
  suffix: string
  name: string
  qualification: string
  nextAvailable: string
}

const doctorTemplates: Record<string, DoctorTemplate[]> = {
  cardiology:       [
    { suffix: 'rk', name: 'Dr. Rajesh Kumar',   qualification: 'MBBS, MD, DM (Cardiology)',       nextAvailable: 'Today' },
    { suffix: 'sr', name: 'Dr. Sunitha Reddy',  qualification: 'MBBS, DNB (Cardiology)',           nextAvailable: 'Tomorrow' },
  ],
  orthopedics:      [
    { suffix: 'vs', name: 'Dr. Venkat Sharma',  qualification: 'MBBS, MS (Orthopaedics)',          nextAvailable: 'Today' },
    { suffix: 'pm', name: 'Dr. Priya Mehta',    qualification: 'MBBS, DNB (Orthopaedics)',         nextAvailable: 'Today' },
  ],
  pediatrics:       [
    { suffix: 'ak', name: 'Dr. Anand Kumar',    qualification: 'MBBS, MD (Paediatrics), DCH',      nextAvailable: 'Today' },
    { suffix: 'ln', name: 'Dr. Lakshmi Nair',   qualification: 'MBBS, DNB (Paediatrics)',          nextAvailable: 'Tomorrow' },
    { suffix: 'sv', name: 'Dr. Srinivas Varma', qualification: 'MBBS, MD (Paediatrics)',           nextAvailable: 'Today' },
  ],
  gynecology:       [
    { suffix: 'md', name: 'Dr. Meena Devi',     qualification: 'MBBS, MS (Obs & Gynae), FRCOG',   nextAvailable: 'Today' },
    { suffix: 'rp', name: 'Dr. Rekha Prasad',   qualification: 'MBBS, DNB (Obs & Gynae)',         nextAvailable: 'Tomorrow' },
  ],
  neurology:        [
    { suffix: 'kc', name: 'Dr. Kiran Chandra',  qualification: 'MBBS, MD, DM (Neurology)',        nextAvailable: 'Today' },
    { suffix: 'sm', name: 'Dr. Shalini Murthy',  qualification: 'MBBS, MD (Neurology)',            nextAvailable: 'Tomorrow' },
  ],
  'general-surgery': [
    { suffix: 'nr', name: 'Dr. Naresh Rao',     qualification: 'MBBS, MS (General Surgery)',      nextAvailable: 'Today' },
    { suffix: 'bp', name: 'Dr. Bhanu Prakash',  qualification: 'MBBS, DNB (Surgery), FICS',       nextAvailable: 'Today' },
  ],
  ent:              [
    { suffix: 'ps', name: 'Dr. Padma Srinivas', qualification: 'MBBS, MS (ENT), DLO',             nextAvailable: 'Today' },
    { suffix: 'vk', name: 'Dr. Vijay Kumar',    qualification: 'MBBS, DNB (ENT)',                 nextAvailable: 'Tomorrow' },
  ],
  dermatology:      [
    { suffix: 'as', name: 'Dr. Aruna Shetty',   qualification: 'MBBS, MD (Dermatology), FRCP',    nextAvailable: 'Today' },
    { suffix: 'rt', name: 'Dr. Ravi Teja',      qualification: 'MBBS, DVD (Dermatology)',         nextAvailable: 'Today' },
  ],
}

export const doctors: Doctor[] = departments.flatMap(dept => {
  const baseKey = dept.id.replace(`${dept.branchId}-`, '')
  const templates = doctorTemplates[baseKey] ?? []
  return templates.map(t => ({
    id: `${dept.id}-${t.suffix}`,
    departmentId: dept.id,
    name: t.name,
    qualification: t.qualification,
    photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=1E6FBA&color=fff&size=128`,
    nextAvailable: t.nextAvailable,
  }))
})

// ─── Slots ────────────────────────────────────────────────────────────────────

const TODAY = new Date()

export const slots: Slot[] = doctors.flatMap(doctor =>
  generateSlots(doctor.id, TODAY)
)

// ─── Helper selectors ────────────────────────────────────────────────────────

export function getDepartmentsByBranch(branchId: string): Department[] {
  return departments.filter(d => d.branchId === branchId)
}

export function getDoctorsByDepartment(departmentId: string): Doctor[] {
  return doctors.filter(d => d.departmentId === departmentId)
}

export function getSlotsByDoctor(doctorId: string): Slot[] {
  return slots.filter(s => s.doctorId === doctorId)
}
```

- [ ] **Step 2: Verify TypeScript compiles with mock data**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/data/mockData.ts
git commit -m "feat: add mock data for 3 branches, 8 departments, doctors, and slots"
```

---

### Task 4: Build BranchContext

**Files:**
- Create: `src/context/BranchContext.tsx`
- Create: `tests/context/BranchContext.test.tsx`

- [ ] **Step 1: Write the failing tests** `tests/context/BranchContext.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BranchProvider, useBranch } from '../../src/context/BranchContext'
import { branches } from '../../src/data/mockData'

const wrapper = ({ children }: { children: ReactNode }) => (
  <BranchProvider>{children}</BranchProvider>
)

describe('BranchContext', () => {
  beforeEach(() => sessionStorage.clear())

  it('starts with no branch selected', () => {
    const { result } = renderHook(() => useBranch(), { wrapper })
    expect(result.current.branch).toBeNull()
  })

  it('sets and returns the selected branch', () => {
    const { result } = renderHook(() => useBranch(), { wrapper })
    act(() => result.current.setBranch(branches[0]))
    expect(result.current.branch?.id).toBe('kukatpally')
  })

  it('persists branch to sessionStorage', () => {
    const { result } = renderHook(() => useBranch(), { wrapper })
    act(() => result.current.setBranch(branches[1]))
    const stored = JSON.parse(sessionStorage.getItem('selectedBranch') ?? 'null')
    expect(stored?.id).toBe('secunderabad')
  })

  it('clears the branch', () => {
    const { result } = renderHook(() => useBranch(), { wrapper })
    act(() => result.current.setBranch(branches[0]))
    act(() => result.current.clearBranch())
    expect(result.current.branch).toBeNull()
    expect(sessionStorage.getItem('selectedBranch')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run tests/context/BranchContext.test.tsx
```
Expected: FAIL — `BranchProvider` and `useBranch` not found

- [ ] **Step 3: Implement BranchContext** `src/context/BranchContext.tsx`:

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Branch } from '../types'

interface BranchContextValue {
  branch: Branch | null
  setBranch: (branch: Branch) => void
  clearBranch: () => void
}

const BranchContext = createContext<BranchContextValue | null>(null)

const STORAGE_KEY = 'selectedBranch'

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branch, setBranchState] = useState<Branch | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Branch) : null
    } catch {
      return null
    }
  })

  function setBranch(b: Branch) {
    setBranchState(b)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(b))
  }

  function clearBranch() {
    setBranchState(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return (
    <BranchContext.Provider value={{ branch, setBranch, clearBranch }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch(): BranchContextValue {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used within BranchProvider')
  return ctx
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run tests/context/BranchContext.test.tsx
```
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/context/BranchContext.tsx tests/context/BranchContext.test.tsx
git commit -m "feat: add BranchContext with sessionStorage persistence"
```

---

### Task 5: Build URL utility functions

**Files:**
- Create: `src/utils/calendarUrl.ts`
- Create: `src/utils/whatsappUrl.ts`
- Create: `tests/utils/calendarUrl.test.ts`
- Create: `tests/utils/whatsappUrl.test.ts`

- [ ] **Step 1: Write failing tests** `tests/utils/calendarUrl.test.ts`:

```ts
import { buildCalendarUrl } from '../../src/utils/calendarUrl'
import type { Slot, Doctor, Department, Branch } from '../../src/types'

const branch: Branch = {
  id: 'kukatpally', name: 'Prasad Hospitals Kukatpally',
  area: '', address: 'KPHB Colony, Kukatpally', phone: '', googleMapsReviewUrl: '',
}
const dept: Department = { id: 'd1', branchId: 'kukatpally', name: 'Cardiology', icon: '🫀' }
const doctor: Doctor = { id: 'dr1', departmentId: 'd1', name: 'Dr. Rajesh Kumar', qualification: '', photoUrl: '', nextAvailable: '' }
const slot: Slot = { id: 's1', doctorId: 'dr1', date: '2026-03-14', time: '10:00 AM', session: 'morning', available: true }

describe('buildCalendarUrl', () => {
  it('returns a valid Google Calendar URL', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    expect(url).toContain('calendar.google.com/calendar/render')
    expect(url).toContain('action=TEMPLATE')
  })

  it('includes the branch name in the event title', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    expect(decodeURIComponent(url)).toContain('Prasad Hospitals Kukatpally')
  })

  it('includes the doctor name in details', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    expect(decodeURIComponent(url)).toContain('Dr. Rajesh Kumar')
  })

  it('includes the branch address as location', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    expect(decodeURIComponent(url)).toContain('KPHB Colony')
  })

  it('correctly converts 10:00 AM on 2026-03-14 to ISO dates', () => {
    const url = buildCalendarUrl(slot, doctor, dept, branch)
    // Start: 20260314T100000, End: 20260314T103000 — literal slash required by Google Calendar
    expect(url).toContain('20260314T100000')
    expect(url).toContain('20260314T103000')
    expect(url).toContain('20260314T100000/20260314T103000') // literal slash, not %2F
  })

  it('handles PM times correctly — 2:00 PM becomes 14:00', () => {
    const pmSlot: Slot = { ...slot, time: '02:00 PM' }
    const url = buildCalendarUrl(pmSlot, doctor, dept, branch)
    expect(url).toContain('20260314T140000')
    expect(url).toContain('20260314T143000')
  })
})
```

- [ ] **Step 2: Write failing tests** `tests/utils/whatsappUrl.test.ts`:

```ts
import { buildWhatsAppUrl } from '../../src/utils/whatsappUrl'
import type { Slot, Doctor, Branch } from '../../src/types'

const branch: Branch = { id: 'kukatpally', name: 'Prasad Hospitals Kukatpally', area: '', address: '', phone: '', googleMapsReviewUrl: '' }
const doctor: Doctor = { id: 'dr1', departmentId: 'd1', name: 'Dr. Rajesh Kumar', qualification: '', photoUrl: '', nextAvailable: '' }
const slot: Slot = { id: 's1', doctorId: 'dr1', date: '2026-03-14', time: '10:00 AM', session: 'morning', available: true }

describe('buildWhatsAppUrl', () => {
  it('returns a wa.me URL', () => {
    const url = buildWhatsAppUrl(slot, doctor, branch)
    expect(url).toContain('wa.me')
  })

  it('includes appointment details in the message', () => {
    const url = buildWhatsAppUrl(slot, doctor, branch)
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('Prasad Hospitals Kukatpally')
    expect(decoded).toContain('2026-03-14')
    expect(decoded).toContain('10:00 AM')
    expect(decoded).toContain('Dr. Rajesh Kumar')
  })
})
```

- [ ] **Step 3: Run both test files to confirm they fail**

```bash
npx vitest run tests/utils/
```
Expected: FAIL — modules not found

- [ ] **Step 4: Implement `src/utils/calendarUrl.ts`**

```ts
import type { Slot, Doctor, Department, Branch } from '../types'

/** Converts "10:00 AM" or "02:00 PM" to "HHmm00" (e.g. "100000", "140000") */
function timeToHHMM(time12: string): string {
  const [timePart, meridiem] = time12.split(' ')
  let [hours, minutes] = timePart.split(':').map(Number)
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`
}

/** Adds 30 minutes to HHmm00 string */
function addThirtyMinutes(hhmmss: string): string {
  const hours = parseInt(hhmmss.slice(0, 2), 10)
  const minutes = parseInt(hhmmss.slice(2, 4), 10)
  const totalMinutes = hours * 60 + minutes + 30
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}${String(newMinutes).padStart(2, '0')}00`
}

export function buildCalendarUrl(
  slot: Slot,
  doctor: Doctor,
  department: Department,
  branch: Branch
): string {
  const dateCompact = slot.date.replace(/-/g, '') // "20260314"
  const startTime = timeToHHMM(slot.time)
  const endTime = addThirtyMinutes(startTime)
  // dates must use a literal slash — URLSearchParams would encode it as %2F which Google Calendar rejects
  const dates = `${dateCompact}T${startTime}/${dateCompact}T${endTime}`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Appointment at ${branch.name}`,
    details: `${doctor.name} | ${department.name}`,
    location: branch.address,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}&dates=${dates}`
}
```

- [ ] **Step 5: Implement `src/utils/whatsappUrl.ts`**

```ts
import type { Slot, Doctor, Branch } from '../types'

export function buildWhatsAppUrl(slot: Slot, doctor: Doctor, branch: Branch): string {
  const message = `I have an appointment at ${branch.name} on ${slot.date} at ${slot.time} with ${doctor.name}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npx vitest run tests/utils/
```
Expected: 8 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/utils/ tests/utils/
git commit -m "feat: add buildCalendarUrl and buildWhatsAppUrl utilities with tests"
```

---

## Chunk 2: App Shell, Landing Page, and Home Page

### Task 6: Set up App.tsx with routing and redirect guard

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Update `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { BranchProvider } from './context/BranchContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <BranchProvider>
        <App />
      </BranchProvider>
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 2: Create `src/App.tsx`**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useBranch } from './context/BranchContext'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import BookingFlow from './pages/BookingFlow'
import ReviewFlow from './pages/ReviewFlow'

function RequireBranch({ children }: { children: ReactNode }) {
  const { branch } = useBranch()
  if (!branch) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<RequireBranch><HomePage /></RequireBranch>} />
      <Route path="/book" element={<RequireBranch><BookingFlow /></RequireBranch>} />
      <Route path="/review" element={<RequireBranch><ReviewFlow /></RequireBranch>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 3: Create placeholder page files** (so the app compiles):

`src/pages/LandingPage.tsx`:
```tsx
export default function LandingPage() { return <div>Landing</div> }
```

`src/pages/HomePage.tsx`:
```tsx
export default function HomePage() { return <div>Home</div> }
```

`src/pages/BookingFlow.tsx`:
```tsx
export default function BookingFlow() { return <div>Booking</div> }
```

`src/pages/ReviewFlow.tsx`:
```tsx
export default function ReviewFlow() { return <div>Review</div> }
```

- [ ] **Step 4: Verify dev server compiles with no errors**

```bash
npm run dev
```
Expected: app compiles, `/` shows "Landing", `/home` redirects to `/`

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx src/pages/
git commit -m "feat: add app shell with React Router and branch redirect guard"
```

---

### Task 7: Build BranchCard component and Landing Page

**Files:**
- Create: `src/components/BranchCard.tsx`
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Create `src/components/BranchCard.tsx`**

```tsx
import type { Branch } from '../types'

interface Props {
  branch: Branch
  onClick: (branch: Branch) => void
}

export default function BranchCard({ branch, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(branch)}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-primary hover:shadow-md transition-all active:scale-95"
    >
      <p className="font-semibold text-[#1E293B] text-base">{branch.name}</p>
      <p className="text-sm text-[#64748B] mt-0.5">{branch.area}</p>
      <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{branch.address}</p>
    </button>
  )
}
```

- [ ] **Step 2: Implement `src/pages/LandingPage.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useBranch } from '../context/BranchContext'
import { branches } from '../data/mockData'
import BranchCard from '../components/BranchCard'
import type { Branch } from '../types'

export default function LandingPage() {
  const navigate = useNavigate()
  const { setBranch } = useBranch()

  function handleSelect(branch: Branch) {
    setBranch(branch)
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex flex-col page-enter">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏥</div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Prasad Hospitals</h1>
            <p className="text-xs text-white/70">Multispeciality Healthcare</p>
          </div>
        </div>
        <p className="text-sm text-white/80 mt-4">Select your nearest branch to book an appointment or leave a review.</p>
      </div>

      {/* Branch list */}
      <div className="flex-1 px-4 py-5 space-y-3">
        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Choose a Branch</p>
        {branches.map(branch => (
          <BranchCard key={branch.id} branch={branch} onClick={handleSelect} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 text-center">
        <a href="https://prasadhospitals.in" target="_blank" rel="noopener noreferrer"
           className="text-xs text-[#64748B] underline">prasadhospitals.in</a>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser** — navigate to `/`, see 3 branch cards, tap one, land on `/home`

- [ ] **Step 4: Commit**

```bash
git add src/components/BranchCard.tsx src/pages/LandingPage.tsx
git commit -m "feat: add branch selection landing page"
```

---

### Task 8: Build Home Page

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Implement `src/pages/HomePage.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useBranch } from '../context/BranchContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { branch, clearBranch } = useBranch()

  function handleChangeBranch() {
    clearBranch()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col page-enter">
      {/* Header */}
      <div className="bg-primary px-5 pt-10 pb-6 text-white">
        <p className="text-xs text-white/60 uppercase tracking-wide">Selected Branch</p>
        <h2 className="text-base font-bold mt-0.5 leading-tight">{branch?.name}</h2>
        <p className="text-xs text-white/70 mt-0.5">{branch?.area}</p>
        <button onClick={handleChangeBranch}
          className="mt-3 text-xs text-white/80 underline underline-offset-2">
          Change Branch
        </button>
      </div>

      {/* CTAs */}
      <div className="flex-1 px-4 py-6 space-y-4">
        <p className="text-sm text-[#64748B] mb-2">What would you like to do?</p>

        <button onClick={() => navigate('/book')}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:border-primary hover:shadow-md transition-all active:scale-95 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">📅</div>
          <div>
            <p className="font-semibold text-[#1E293B]">Book Appointment</p>
            <p className="text-xs text-[#64748B] mt-0.5">Choose doctor, date & time</p>
          </div>
        </button>

        <button onClick={() => navigate('/review')}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:border-primary hover:shadow-md transition-all active:scale-95 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl">⭐</div>
          <div>
            <p className="font-semibold text-[#1E293B]">Leave a Review</p>
            <p className="text-xs text-[#64748B] mt-0.5">Share your experience</p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-gray-100 pt-4 flex justify-between items-center">
        <a href={`tel:${branch?.phone}`} className="text-sm text-primary font-medium">{branch?.phone}</a>
        <a href="https://prasadhospitals.in" target="_blank" rel="noopener noreferrer"
           className="text-xs text-[#64748B] underline">Website</a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser** — home shows correct branch name, two CTA cards, change branch link works

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: add home dashboard with booking and review CTAs"
```

---

## Chunk 3: Booking Flow

### Task 9: StepIndicator component

**Files:**
- Create: `src/components/StepIndicator.tsx`

- [ ] **Step 1: Create `src/components/StepIndicator.tsx`**

```tsx
interface Props {
  currentStep: number
  totalSteps: number
  label: string
}

export default function StepIndicator({ currentStep, totalSteps, label }: Props) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-xs text-[#64748B]">Step {currentStep} of {totalSteps}</p>
        <p className="text-xs font-medium text-[#1E293B]">{label}</p>
      </div>
      <div className="h-1 bg-gray-100 rounded-full">
        <div
          className="h-1 bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StepIndicator.tsx
git commit -m "feat: add StepIndicator progress bar component"
```

---

### Task 10: DepartmentGrid component

**Files:**
- Create: `src/components/DepartmentGrid.tsx`

- [ ] **Step 1: Create `src/components/DepartmentGrid.tsx`**

```tsx
import type { Department } from '../types'

interface Props {
  departments: Department[]
  selected: Department | null
  onSelect: (dept: Department) => void
}

export default function DepartmentGrid({ departments, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {departments.map(dept => (
        <button
          key={dept.id}
          onClick={() => onSelect(dept)}
          className={`
            flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95
            ${selected?.id === dept.id
              ? 'border-primary bg-blue-50'
              : 'border-gray-100 bg-white hover:border-primary/40'}
          `}
        >
          <span className="text-3xl">{dept.icon}</span>
          <span className={`text-xs font-medium text-center leading-tight ${selected?.id === dept.id ? 'text-primary' : 'text-[#1E293B]'}`}>
            {dept.name}
          </span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DepartmentGrid.tsx
git commit -m "feat: add DepartmentGrid component"
```

---

### Task 11: DoctorCard component

**Files:**
- Create: `src/components/DoctorCard.tsx`

- [ ] **Step 1: Create `src/components/DoctorCard.tsx`**

```tsx
import type { Doctor } from '../types'

interface Props {
  doctor: Doctor
  selected: boolean
  onSelect: (doctor: Doctor) => void
}

export default function DoctorCard({ doctor, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(doctor)}
      className={`
        w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-95
        ${selected ? 'border-primary bg-blue-50' : 'border-gray-100 bg-white hover:border-primary/40'}
      `}
    >
      <img
        src={doctor.photoUrl}
        alt={doctor.name}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${selected ? 'text-primary' : 'text-[#1E293B]'}`}>{doctor.name}</p>
        <p className="text-xs text-[#64748B] mt-0.5 leading-tight">{doctor.qualification}</p>
        <span className="inline-block mt-1.5 text-xs bg-green-50 text-success px-2 py-0.5 rounded-full">
          {doctor.nextAvailable}
        </span>
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DoctorCard.tsx
git commit -m "feat: add DoctorCard component"
```

---

### Task 12: SlotPicker component

**Files:**
- Create: `src/components/SlotPicker.tsx`

- [ ] **Step 1: Create `src/components/SlotPicker.tsx`**

```tsx
import { useState, useEffect } from 'react'
import type { Slot } from '../types'

interface Props {
  slots: Slot[]
  selected: Slot | null
  onSelect: (slot: Slot) => void
}

const SESSION_LABELS: Record<Slot['session'], string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌆 Evening',
}

export default function SlotPicker({ slots, selected, onSelect }: Props) {
  const [loading, setLoading] = useState(true)
  const dates = [...new Set(slots.map(s => s.date))].sort()
  const [activeDate, setActiveDate] = useState(dates[0] ?? '')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const daySlots = slots.filter(s => s.date === activeDate)
  const sessions: Slot['session'][] = ['morning', 'afternoon', 'evening']

  function formatDateTab(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0,0,0,0)
    if (d.getTime() === today.getTime()) return 'Today'
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (d.getTime() === tomorrow.getTime()) return 'Tomorrow'
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="px-4 space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Date tabs */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto pb-1">
        {dates.map(date => (
          <button
            key={date}
            onClick={() => setActiveDate(date)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all
              ${activeDate === date ? 'bg-primary text-white' : 'bg-gray-100 text-[#64748B] hover:bg-gray-200'}`}
          >
            {formatDateTab(date)}
          </button>
        ))}
      </div>

      {/* Sessions */}
      <div className="px-4 space-y-4">
        {sessions.map(session => {
          const sessionSlots = daySlots.filter(s => s.session === session)
          if (sessionSlots.length === 0) return null
          return (
            <div key={session}>
              <p className="text-xs font-medium text-[#64748B] mb-2">{SESSION_LABELS[session]}</p>
              <div className="flex flex-wrap gap-2">
                {sessionSlots.map(slot => (
                  <button
                    key={slot.id}
                    disabled={!slot.available}
                    onClick={() => onSelect(slot)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${!slot.available ? 'bg-gray-100 text-[#CBD5E1] cursor-not-allowed' :
                        selected?.id === slot.id ? 'bg-primary text-white' :
                        'bg-blue-50 text-primary hover:bg-primary hover:text-white'}
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SlotPicker.tsx
git commit -m "feat: add SlotPicker component with date tabs, session groups, and skeleton loader"
```

---

### Task 13: PatientForm component

**Files:**
- Create: `src/components/PatientForm.tsx`

- [ ] **Step 1: Create `src/components/PatientForm.tsx`**

```tsx
interface Props {
  name: string
  phone: string
  reason: string
  onChange: (field: 'name' | 'phone' | 'reason', value: string) => void
}

export default function PatientForm({ name, phone, reason, onChange }: Props) {
  return (
    <div className="px-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1.5">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="e.g. Srinivas Reddy"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1.5">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => onChange('phone', e.target.value)}
          placeholder="e.g. 98765 43210"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1.5">
          Reason for Visit <span className="text-[#94A3B8]">(optional)</span>
        </label>
        <textarea
          value={reason}
          onChange={e => onChange('reason', e.target.value)}
          placeholder="Brief description of your concern..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PatientForm.tsx
git commit -m "feat: add PatientForm component"
```

---

### Task 14: ConfirmationScreen component

**Files:**
- Create: `src/components/ConfirmationScreen.tsx`

- [ ] **Step 1: Create `src/components/ConfirmationScreen.tsx`**

```tsx
import type { Slot, Doctor, Department, Branch } from '../types'
import { buildCalendarUrl } from '../utils/calendarUrl'
import { buildWhatsAppUrl } from '../utils/whatsappUrl'

interface Props {
  slot: Slot
  doctor: Doctor
  department: Department
  branch: Branch
  patientName: string
  onDone: () => void
}

export default function ConfirmationScreen({ slot, doctor, department, branch, patientName, onDone }: Props) {
  const calendarUrl = buildCalendarUrl(slot, doctor, department, branch)
  const whatsappUrl = buildWhatsAppUrl(slot, doctor, branch)

  return (
    <div className="px-4 py-6 flex flex-col items-center page-enter">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl mb-4">✅</div>
      <h2 className="text-lg font-bold text-[#1E293B]">Appointment Confirmed!</h2>
      {patientName && <p className="text-sm text-[#64748B] mt-1">Hi {patientName}, you're all set.</p>}

      {/* Summary card */}
      <div className="w-full mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <Row label="Branch" value={branch.name} />
        <Row label="Department" value={department.name} />
        <Row label="Doctor" value={doctor.name} />
        <Row label="Date" value={new Date(slot.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
        <Row label="Time" value={slot.time} />
      </div>

      {/* Action buttons */}
      <a
        href={calendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 w-full bg-primary text-white text-sm font-semibold py-3.5 rounded-xl text-center block hover:bg-primary-hover transition-colors"
      >
        📅 Add to Google Calendar
      </a>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 w-full bg-green-500 text-white text-sm font-semibold py-3.5 rounded-xl text-center block hover:bg-green-600 transition-colors"
      >
        💬 Share via WhatsApp
      </a>

      <button
        onClick={onDone}
        className="mt-3 w-full text-sm text-[#64748B] py-2"
      >
        Back to Home
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-[#64748B] flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-[#1E293B] text-right">{value}</span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConfirmationScreen.tsx
git commit -m "feat: add ConfirmationScreen with calendar and WhatsApp links"
```

---

### Task 15: Wire BookingFlow page

**Files:**
- Modify: `src/pages/BookingFlow.tsx`

- [ ] **Step 1: Implement `src/pages/BookingFlow.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBranch } from '../context/BranchContext'
import { getDepartmentsByBranch, getDoctorsByDepartment, getSlotsByDoctor } from '../data/mockData'
import StepIndicator from '../components/StepIndicator'
import DepartmentGrid from '../components/DepartmentGrid'
import DoctorCard from '../components/DoctorCard'
import SlotPicker from '../components/SlotPicker'
import PatientForm from '../components/PatientForm'
import ConfirmationScreen from '../components/ConfirmationScreen'
import type { BookingState } from '../types'

const STEP_LABELS = ['Department', 'Doctor', 'Date & Time', 'Your Details', 'Confirmed']

export default function BookingFlow() {
  const navigate = useNavigate()
  const { branch } = useBranch()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<BookingState>({
    department: null, doctor: null, slot: null,
    patientName: '', patientPhone: '', patientReason: '',
  })

  if (!branch) return null

  const departments = getDepartmentsByBranch(branch.id)
  const doctors = state.department ? getDoctorsByDepartment(state.department.id) : []
  const slots = state.doctor ? getSlotsByDoctor(state.doctor.id) : []

  function canProceed() {
    if (step === 1) return state.department !== null
    if (step === 2) return state.doctor !== null
    if (step === 3) return state.slot !== null
    return true // step 4: always enabled per spec (no validation in demo)
  }

  function handleNext() {
    if (canProceed()) setStep(s => s + 1)
  }

  function handleBack() {
    if (step === 1) navigate('/home')
    else setStep(s => s - 1)
  }

  // Step 5: confirmation
  if (step === 5 && state.department && state.doctor && state.slot) {
    return (
      <div className="min-h-screen page-enter">
        <ConfirmationScreen
          slot={state.slot}
          doctor={state.doctor}
          department={state.department}
          branch={branch}
          patientName={state.patientName}
          onDone={() => navigate('/home')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-primary px-5 pt-10 pb-4 text-white">
        <h2 className="text-base font-bold">Book Appointment</h2>
        <p className="text-xs text-white/70 mt-0.5">{branch.name}</p>
      </div>

      <StepIndicator currentStep={step} totalSteps={4} label={STEP_LABELS[step - 1]} />

      {/* Step content */}
      <div className="flex-1 py-4 overflow-y-auto">
        {step === 1 && (
          <DepartmentGrid
            departments={departments}
            selected={state.department}
            onSelect={dept => setState(s => ({ ...s, department: dept, doctor: null, slot: null }))}
          />
        )}

        {step === 2 && (
          <div className="px-4 space-y-3">
            {doctors.map(doc => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                selected={state.doctor?.id === doc.id}
                onSelect={doctor => setState(s => ({ ...s, doctor, slot: null }))}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <SlotPicker
            slots={slots}
            selected={state.slot}
            onSelect={slot => setState(s => ({ ...s, slot }))}
          />
        )}

        {step === 4 && (
          <PatientForm
            name={state.patientName}
            phone={state.patientPhone}
            reason={state.patientReason}
            onChange={(field, value) => setState(s => ({ ...s, [`patient${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }))}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 py-4 border-t border-gray-100 flex gap-3">
        <button
          onClick={handleBack}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-[#64748B] hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all
            ${canProceed() ? 'bg-primary text-white hover:bg-primary-hover active:scale-95' : 'bg-gray-100 text-[#CBD5E1] cursor-not-allowed'}`}
        >
          {step === 4 ? 'Confirm Booking' : 'Next'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify full booking flow in browser** — all 5 steps work, confirmation shows calendar + WhatsApp links

- [ ] **Step 3: Commit**

```bash
git add src/pages/BookingFlow.tsx
git commit -m "feat: implement full 5-step booking flow"
```

---

## Chunk 4: Review Flow

### Task 16: StarRating component

**Files:**
- Create: `src/components/StarRating.tsx`

- [ ] **Step 1: Create `src/components/StarRating.tsx`**

```tsx
interface Props {
  value: number | null
  onChange: (rating: number) => void
}

export default function StarRating({ value, onChange }: Props) {
  return (
    <div className="flex justify-center gap-3 py-4">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`text-5xl transition-all active:scale-90 ${value !== null && star <= value ? 'grayscale-0' : 'grayscale opacity-30'}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ⭐
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StarRating.tsx
git commit -m "feat: add StarRating component"
```

---

### Task 17: FeedbackForm component

**Files:**
- Create: `src/components/FeedbackForm.tsx`

- [ ] **Step 1: Create `src/components/FeedbackForm.tsx`**

```tsx
interface Props {
  department: string
  comments: string
  phone: string
  departmentOptions: string[]
  onChange: (field: 'department' | 'comments' | 'phone', value: string) => void
  onSubmit: () => void
}

export default function FeedbackForm({ department, comments, phone, departmentOptions, onChange, onSubmit }: Props) {
  const canSubmit = comments.trim().length >= 10

  return (
    <div className="px-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1.5">Department Visited</label>
        <select
          value={department}
          onChange={e => onChange('department', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary bg-white"
        >
          <option value="">Select department...</option>
          {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1.5">Your Comments <span className="text-red-400">*</span></label>
        <textarea
          value={comments}
          onChange={e => onChange('comments', e.target.value)}
          placeholder="Please describe your experience (minimum 10 characters)..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
        />
        <p className={`text-xs mt-1 ${comments.length >= 10 ? 'text-success' : 'text-[#94A3B8]'}`}>
          {comments.length}/10 minimum characters
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1.5">
          Phone Number <span className="text-[#94A3B8]">(optional — for follow-up)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={e => onChange('phone', e.target.value)}
          placeholder="e.g. 98765 43210"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all mt-2
          ${canSubmit ? 'bg-primary text-white hover:bg-primary-hover active:scale-95' : 'bg-gray-100 text-[#CBD5E1] cursor-not-allowed'}`}
      >
        Submit Feedback
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FeedbackForm.tsx
git commit -m "feat: add FeedbackForm component with 10-char minimum validation"
```

---

### Task 18: Wire ReviewFlow page

**Files:**
- Modify: `src/pages/ReviewFlow.tsx`

- [ ] **Step 1: Implement `src/pages/ReviewFlow.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBranch } from '../context/BranchContext'
import { getDepartmentsByBranch } from '../data/mockData'
import StarRating from '../components/StarRating'
import FeedbackForm from '../components/FeedbackForm'
import type { ReviewState } from '../types'

export default function ReviewFlow() {
  const navigate = useNavigate()
  const { branch } = useBranch()
  const [state, setState] = useState<ReviewState>({
    rating: null, step: 1,
    feedbackDepartment: '', feedbackComments: '', feedbackPhone: '',
  })

  if (!branch) return null

  const deptNames = getDepartmentsByBranch(branch.id).map(d => d.name)
  const isPositive = (state.rating ?? 0) >= 4

  function handleRatingSelect(rating: number) {
    setState(s => ({ ...s, rating }))
  }

  function handleRatingNext() {
    if (state.rating !== null) setState(s => ({ ...s, step: 2 }))
  }

  function handleGoogleRedirect() {
    window.open(branch!.googleMapsReviewUrl, '_blank')
    setState(s => ({ ...s, step: 3 }))
  }

  function handleFeedbackSubmit() {
    console.log('Feedback submitted:', {
      branch: branch?.id,
      rating: state.rating,
      department: state.feedbackDepartment,
      comments: state.feedbackComments,
      phone: state.feedbackPhone,
    })
    setState(s => ({ ...s, step: 3 }))
  }

  // Step 3: Thank you
  if (state.step === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center page-enter">
        <div className="text-5xl mb-4">{isPositive ? '🌟' : '🙏'}</div>
        <h2 className="text-xl font-bold text-[#1E293B]">
          {isPositive ? 'Thank you for your review!' : 'Thank you for your feedback.'}
        </h2>
        <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
          {isPositive
            ? `Your kind words mean a lot to the team at ${branch.name}.`
            : "We'll look into your feedback and work to improve your experience."}
        </p>
        <button
          onClick={() => navigate('/home')}
          className="mt-8 bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-primary px-5 pt-10 pb-4 text-white">
        <h2 className="text-base font-bold">Leave a Review</h2>
        <p className="text-xs text-white/70 mt-0.5">{branch.name}</p>
      </div>

      <div className="flex-1 py-6 page-enter">
        {/* Step 1: Star rating */}
        {state.step === 1 && (
          <div className="px-4">
            <p className="text-center text-sm text-[#64748B] mb-2">How was your experience?</p>
            <StarRating value={state.rating} onChange={handleRatingSelect} />
            {state.rating !== null && (
              <p className="text-center text-xs text-[#64748B] mt-2">
                {state.rating >= 4 ? '😊 Great! Tell us more on Google.' : '😟 We\'re sorry to hear that.'}
              </p>
            )}
            <div className="mt-6 px-0">
              <button
                onClick={handleRatingNext}
                disabled={state.rating === null}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all
                  ${state.rating !== null ? 'bg-primary text-white hover:bg-primary-hover active:scale-95' : 'bg-gray-100 text-[#CBD5E1] cursor-not-allowed'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2a: Positive — Google redirect */}
        {state.step === 2 && isPositive && (
          <div className="px-4 text-center">
            <div className="text-4xl mb-3">🌟</div>
            <h3 className="text-base font-bold text-[#1E293B]">We're glad you had a great experience!</h3>
            <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
              Would you mind sharing your experience on Google? It helps other patients find trusted healthcare.
            </p>
            <div className="bg-blue-50 rounded-2xl p-4 mt-5 text-left space-y-2">
              <p className="text-xs font-medium text-[#64748B]">What you could mention:</p>
              {['The doctor was knowledgeable and caring', 'Staff was helpful and professional', 'Clean and well-maintained facility'].map(s => (
                <p key={s} className="text-xs text-[#1E293B]">✓ {s}</p>
              ))}
            </div>
            <button
              onClick={handleGoogleRedirect}
              className="mt-6 w-full bg-primary text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors active:scale-95"
            >
              Post on Google ↗
            </button>
            <button
              onClick={() => setState(s => ({ ...s, step: 1 }))}
              className="mt-3 text-xs text-[#64748B]"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Step 2b: Negative — internal feedback */}
        {state.step === 2 && !isPositive && (
          <div>
            <div className="px-4 mb-4 text-center">
              <div className="text-3xl mb-2">🙏</div>
              <p className="text-sm text-[#64748B]">We're sorry to hear that. Please share your feedback so we can improve.</p>
            </div>
            <FeedbackForm
              department={state.feedbackDepartment}
              comments={state.feedbackComments}
              phone={state.feedbackPhone}
              departmentOptions={deptNames}
              onChange={(field, value) => setState(s => ({ ...s, [`feedback${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }))}
              onSubmit={handleFeedbackSubmit}
            />
            <button
              onClick={() => setState(s => ({ ...s, step: 1 }))}
              className="w-full mt-3 text-xs text-[#64748B] py-2"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify full review flow in browser** — both happy (4–5 stars) and unhappy (1–3 stars) paths work end-to-end

- [ ] **Step 3: Commit**

```bash
git add src/pages/ReviewFlow.tsx
git commit -m "feat: implement full 3-step review flow with Google redirect and internal feedback"
```

---

## Chunk 5: Polish and Deployment

### Task 19: Mobile polish pass

**Files:**
- Modify: `src/index.css` (minor additions if needed)
- Review all pages at 375px viewport in browser DevTools

- [ ] **Step 1: Open Chrome DevTools → Device toolbar → set to 375px**

Verify each screen:
- [ ] Landing: 3 branch cards fit without overflow
- [ ] Home: two CTA cards visible without scrolling
- [ ] Booking Step 1: 2-column department grid fits
- [ ] Booking Step 3: slot buttons wrap correctly
- [ ] Booking Step 5: confirmation fits, buttons reachable
- [ ] Review Step 2a: suggestion box readable
- [ ] Review Step 2b: feedback form scrollable, submit button reachable

Fix any overflow or layout issues found.

- [ ] **Step 2: Commit any fixes**

```bash
git add -A
git commit -m "fix: mobile layout polish at 375px viewport"
```

---

### Task 20: Run all tests

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```
Expected: all tests PASS (BranchContext × 4, calendarUrl × 6, whatsappUrl × 2 = 12 total)

- [ ] **Step 2: Fix any failures before proceeding**

---

### Task 21: Deploy to Vercel

- [ ] **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```
Expected: no errors. Fix any type errors before proceeding.

- [ ] **Step 3: Build the project**

```bash
npm run build
```
Expected: `dist/` folder created, no build errors

- [ ] **Step 4: Deploy**

```bash
cd prasad-hospitals-app
vercel --prod
```
Follow prompts: link to Vercel account, accept defaults for framework detection (Vite).

- [ ] **Step 5: Copy the deployed URL**

Expected: URL like `https://prasad-hospitals-app.vercel.app`

- [ ] **Step 6: Verify success criteria on deployed URL**

Open on a real mobile device and check:
- [ ] Branch selection works
- [ ] Full booking flow completes, calendar link opens
- [ ] Review flow — 4 stars opens Google Maps, 2 stars shows feedback form
- [ ] No horizontal scroll at mobile viewport

- [ ] **Step 7: Commit final state**

```bash
git add .
git commit -m "chore: production build verified and deployed to Vercel"
```

---

## Summary

| Chunk | Tasks | Key Deliverable |
|---|---|---|
| 1 | 1–5 | Project scaffolded, types, mock data, context, URL utilities — all tested |
| 2 | 6–8 | App shell, landing page, home dashboard |
| 3 | 9–15 | Full 5-step booking flow |
| 4 | 16–18 | Full 3-step review flow |
| 5 | 19–21 | Mobile polish, tests passing, deployed to Vercel |
