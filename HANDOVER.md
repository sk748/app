# KAREN COUNTRY CLUB JUNIOR GOLF LMS & CRM — FULL HANDOVER DOCUMENT
**Date**: January 2026  
**For**: Claude Code continuation  

---

## 1. PROJECT OVERVIEW

This is a **Junior Golf Academy LMS & CRM** for Karen Country Club (Nairobi, Kenya). It tracks student handicaps using the WHS 2024 math engine, manages coach evaluations (Levels 1–8), runs live tournament leaderboards with hole-by-hole scoring, handles COPPA-compliant parental consent (VPC), and provides role-based dashboards for Students, Coaches, Parents, and Admins.

### Origin
The project was adapted from a Next.js + Supabase technical blueprint into a **React 19 + FastAPI + MongoDB** stack. The original blueprint documents are at `/tmp/blueprint_full.txt` (97K characters) and the QA review PDF is archived.

---

## 2. TECH STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19.0.1, React Router 7, TailwindCSS, Recharts, MapLibre GL JS, Lucide React icons | CRA with craco for path aliases (`@/` = `src/`) |
| Backend | FastAPI (Python), Motor (async MongoDB driver), PyJWT, bcrypt, openpyxl | Single `server.py` file, 915 lines |
| Database | MongoDB (localhost:27017, db: `test_database`) | 16 collections |
| Math Engine | Custom Python WHS 2024 implementation | `whs_math.py`, 83 lines |
| Fonts | DM Sans (body), JetBrains Mono (data/code) | Google Fonts CDN |

### Brand Palette (STRICT)
```
Background: #012349 (navy)
Primary:    #0082CD (azure)  
Text:       #F4F4F6 (silver)
Accent:     #FBBF24 (gold)
Slate:      #64748B (secondary text)
```

### Logo
`/frontend/public/kcc-logo.png` — White shield with blue crest on dark background.

---

## 3. FILE STRUCTURE

```
/app/
├── backend/
│   ├── .env                    # MONGO_URL, DB_NAME, CORS_ORIGINS
│   ├── server.py               # ALL API routes (915 lines)
│   ├── whs_math.py             # WHS 2024 math engine (83 lines)
│   └── requirements.txt
├── frontend/
│   ├── .env                    # REACT_APP_BACKEND_URL
│   ├── package.json            # yarn-managed deps
│   ├── tailwind.config.js      # Brand colors, DM Sans font
│   ├── craco.config.js         # Path alias @/ → src/
│   ├── public/
│   │   └── kcc-logo.png        # Brand logo
│   └── src/
│       ├── index.css           # CSS variables, animations, glass morphism
│       ├── App.js              # AuthContext, ApiContext, routing
│       ├── App.css             # Empty (all styles in index.css + Tailwind)
│       ├── pages/
│       │   ├── LandingPage.js  # Public landing with announcements
│       │   ├── AuthPage.js     # Login/Register with VPC flow
│       │   └── Dashboard.js    # Sidebar nav + role-based content router
│       └── components/golf/
│           ├── DashboardHome.js     # Role-specific home (stats, charts, alerts)
│           ├── ScorecardForm.js     # Score submission → WHS verification
│           ├── HandicapChart.js     # Recharts area chart
│           ├── CourseMap.js         # MapLibre GL JS with distance calc
│           ├── EvaluationWizard.js  # 4-step Level 1-8 eval form
│           ├── CoachRoster.js       # Table (desktop) / Cards (mobile) + drilldown
│           ├── AdminDashboard.js    # 5 tabs: Overview, Users, Ratings, Import, Broadcasts
│           ├── RealtimeChat.js      # Polling-based chat (4s interval)
│           ├── AttendanceTracker.js  # Event selection + toggle attendance + create event
│           ├── TournamentRSVP.js    # Eligibility gating (HCP + Level)
│           ├── CoachEvalForm.js     # Anonymous 1-5 star rating
│           ├── VPCFlows.js          # Student consent request + Parent approval
│           ├── ClassFeed.js         # Announcements + create broadcast (Coach/Admin)
│           ├── LiveLeaderboard.js   # Auto-polling leaderboard with hole-by-hole expand
│           └── LiveScoring.js       # Coach/Admin hole-by-hole input grid
└── memory/
    └── PRD.md
```

---

## 4. DATABASE SCHEMA (MongoDB Collections)

### users (9 docs seeded)
```json
{
  "id": "uuid",
  "email": "string",
  "password_hash": "bcrypt hash",
  "full_name": "string",
  "role": "STUDENT|COACH|PARENT|ADMIN",
  "dob": "YYYY-MM-DD",
  "kcc_id": "KCC-XXXX|null",
  "current_hcp_index": 54.0,
  "evaluation_level": 0,
  "is_consent_verified": true,
  "academy_id": "string|null",
  "created_at": "ISO datetime"
}
```

### courses (3)
```json
{ "id": "course-karen", "name": "Karen Country Club", "location_city": "Nairobi", "lat": -1.3197, "lng": 36.7073 }
```

### tees (6)
```json
{ "id": "tee-karen-white", "course_id": "course-karen", "course_name": "Karen Country Club", "color": "White", "course_rating": 72.1, "slope_rating": 131, "par": 72 }
```

### scorecards (5 seeded)
```json
{
  "id": "uuid", "student_id": "ref", "student_name": "string", "tee_id": "ref",
  "course_name": "string", "tee_color": "string", "gross_score": 92,
  "holes_played": 18, "score_differential": 17.2, "pcc": 0,
  "is_verified": true, "played_at": "ISO datetime"
}
```

### evaluations
```json
{
  "id": "uuid", "student_id": "ref", "student_name": "string",
  "coach_id": "ref", "coach_name": "string", "level": 3,
  "putting_score": 7, "etiquette_checked": true, "rules_checked": true,
  "notes": "string", "technical_metrics": {}, "created_at": "ISO datetime"
}
```

### tournaments (3)
```json
{
  "id": "t-1", "title": "string", "date": "2026-04-12",
  "req_hcp": 20.0, "req_level": 3, "type": "Open|Elite",
  "location": "string", "tee_id": "tee-karen-white",
  "status": "UPCOMING|LIVE|COMPLETED"
}
```

### live_scores (4 seeded)
```json
{
  "id": "uuid", "tournament_id": "t-3", "student_id": "ref",
  "student_name": "string", "tee_id": "ref",
  "hole_scores": [4,5,3,5,4,6,4,5,4,5,4,null,null,null,null,null,null,null],
  "holes_completed": 11, "total_score": 49, "to_par": 5,
  "score_differential": null, "handicap_index": 18.5,
  "entered_by": "ref", "created_at": "ISO", "updated_at": "ISO"
}
```

### Other collections
- **channels**: `{id, name, type, academy_id}` — 2 seeded (General Academy, Elite Squad)
- **messages**: `{id, channel_id, sender_id, sender_name, sender_role, content, created_at}`
- **events**: `{id, title, description, start_time, end_time, academy_id, created_by, created_at}` — 3 seeded
- **attendance**: `{id, event_id, student_id, status, recorded_by, recorded_at}`
- **announcements**: `{id, title, content, priority, author_name, author_role, created_at}` — 3 seeded
- **coach_evaluations**: `{id, coach_id, author_id, rating, feedback, created_at}` — anonymous
- **pending_approvals**: `{id, student_id, student_name, guardian_kcc_id, status, created_at}`
- **parent_child_map**: `{id, parent_id, child_id, verified_at}`
- **tournament_rsvps**: `{id, tournament_id, student_id, student_name, created_at}`
- **kcc_members**: (populated via bulk import) `{member_number, full_name, phone, email, is_active, updated_at}`

---

## 5. API ROUTES (34 endpoints)

All routes prefixed with `/api`. Auth via `Authorization: Bearer <JWT>`.

### Auth
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | Public | Creates user, handles COPPA minor detection, creates pending_approval if guardian_kcc_id given |
| POST | `/api/auth/login` | Public | Returns `{token, user}` |
| GET | `/api/auth/me` | Required | Returns current user (excludes password_hash) |
| PUT | `/api/auth/profile` | Required | Updates full_name, kcc_id, dob |

### Courses & Tees
| GET | `/api/courses` | Required | Returns courses with nested tees array |
| GET | `/api/courses/{id}/tees` | Required | |

### Scorecards (WHS Engine)
| POST | `/api/scores/sync` | Required | **Server-side WHS 2024 calculation**. Takes `{tee_id, gross_score, holes_played, pcc}`. Returns `{scorecard, new_handicap_index, differential}`. Supports 9-hole rounds via Expected Score scaling. |
| GET | `/api/scorecards` | Required | Optional `?student_id=` param. Students see own, coaches see all. |

### Evaluations
| POST | `/api/evaluations` | Coach/Admin | Level 1-8 with technical_metrics dict |
| GET | `/api/evaluations` | Required | Optional `?student_id=`. Role-scoped. |

### Coach Evaluations (Anonymous)
| POST | `/api/coach-evaluations` | Student/Parent | `{coach_id, rating:1-5, feedback}` |
| GET | `/api/coach-evaluations/aggregate` | Required | Returns `[{coach_id, coach_name, average_rating, total_reviews}]` |

### VPC (Verifiable Parental Consent)
| GET | `/api/pending-approvals` | Required | Parent sees by kcc_id, student sees own, admin sees all |
| POST | `/api/pending-approvals` | Student | Creates consent request: `{guardian_kcc_id}`. Prevents duplicates. |
| PUT | `/api/pending-approvals/{id}` | Parent/Admin | `{status: "APPROVED"|"REJECTED"}`. On APPROVED: sets student `is_consent_verified=true`, creates parent_child_map entry. |

### Chat
| GET | `/api/channels` | Required | |
| GET | `/api/channels/{id}/messages` | Required | Sorted by created_at ASC |
| POST | `/api/channels/{id}/messages` | Required | **Parents blocked (403)**. `{content}` |

### Events & Attendance
| GET | `/api/events` | Required | |
| POST | `/api/events` | Coach/Admin | `{title, start_time, end_time}` |
| POST | `/api/attendance` | Coach/Admin | `{event_id, roster: [{student_id, status}]}` — Upserts. |
| GET | `/api/attendance/{event_id}` | Required | |

### Announcements
| GET | `/api/announcements` | **Public** | No auth required |
| POST | `/api/announcements` | Coach/Admin | `{title, content, priority:"NORMAL"|"HIGH"}` |

### Admin
| POST | `/api/admin/bulk-import` | Admin | Multipart file upload (.xlsx). Expected columns: MemberNumber, FullName, Phone, Email. Upserts to kcc_members. |
| GET | `/api/users` | Required | Optional `?role=STUDENT&academy_id=`. Excludes password_hash. |

### Tournaments & Live Scoring
| GET | `/api/tournaments` | Required | |
| POST | `/api/tournaments/{id}/rsvp` | Required | Prevents duplicate RSVP. |
| GET | `/api/tournaments/{id}/rsvps` | Required | |
| PUT | `/api/tournaments/{id}/status` | Coach/Admin | `{status: "UPCOMING"|"LIVE"|"COMPLETED", tee_id?}` |
| POST | `/api/tournaments/{id}/live-scores` | Coach/Admin | `{student_id, hole_scores: [int|null x18], tee_id?}`. Calculates total, to_par, WHS differential (if 9+ holes). Upserts. |
| GET | `/api/tournaments/{id}/leaderboard` | **Public** | Sorted by holes_completed DESC then to_par ASC. Returns `{tournament, scores, rsvp_count, players_started}`. |
| GET | `/api/tournaments/{id}/live-scores` | Required | Raw scores. |

### Utility
| POST | `/api/seed` | Public | Creates all demo data. Idempotent (checks if courses exist). |

---

## 6. WHS 2024 MATH ENGINE (`whs_math.py`)

```python
calculate_score_differential(actual_gross, holes_played, handicap_index, course_rating, slope_rating, pcc=0)
# → (113/Slope) * (AdjustedGross - CR - PCC)
# For 9-17 holes: adds Expected Score for missing holes

calculate_handicap_index(differentials: List[float])
# → Best N of 20 rule: 20→8, 15→5, 10→3, 6→2, <6→1 best differentials averaged

calculate_course_handicap(index, slope_rating, course_rating, par)
# → (Index * Slope/113) + (CR - Par)

get_expected_score_value(handicap_index, holes_remaining)
# → (holes/18) * (72 + index*1.04)
```

**Critical**: All score calculations happen server-side in `sync_score()`. The frontend never calculates differentials — it sends raw gross_score and receives verified results.

---

## 7. AUTHENTICATION & AUTHORIZATION

- **JWT**: HS256, 72-hour expiry, secret: `kcc-junior-golf-secret-2024`
- **Token storage**: `localStorage.kcc_token`
- **Roles**: STUDENT, COACH, PARENT, ADMIN
- **Role enforcement**: Per-endpoint checks in Python. No middleware-level enforcement.
- **Password hashing**: bcrypt

### Role Permissions Matrix
| Feature | Student | Coach | Parent | Admin |
|---------|---------|-------|--------|-------|
| Submit scorecard | ✅ | ❌ | ❌ | ❌ |
| Create evaluation | ❌ | ✅ | ❌ | ✅ |
| Rate coach (anonymous) | ✅ | ❌ | ✅ | ❌ |
| Send chat message | ✅ | ✅ | ❌ (read-only) | ✅ |
| Create event | ❌ | ✅ | ❌ | ✅ |
| Record attendance | ❌ | ✅ | ❌ | ✅ |
| Approve consent | ❌ | ❌ | ✅ | ✅ |
| Bulk import | ❌ | ❌ | ❌ | ✅ |
| Live scoring | ❌ | ✅ | ❌ | ✅ |
| Tournament status | ❌ | ✅ | ❌ | ✅ |
| View leaderboard | ✅ | ✅ | ✅ | ✅ |

---

## 8. DEMO CREDENTIALS & SEED DATA

| Role | Email | Password | ID |
|------|-------|----------|-----|
| Coach | coach@kcc.co.ke | coach123 | demo-coach |
| Student | student@kcc.co.ke | student123 | demo-student |
| Parent | parent@kcc.co.ke | parent123 | demo-parent (KCC-1042) |
| Admin | admin@kcc.co.ke | admin123 | demo-admin |
| Student 2 | michael@kcc.co.ke | student123 | demo-student-2 |
| Student 3 | sarah@kcc.co.ke | student123 | demo-student-3 |
| Student 4 | peter@kcc.co.ke | student123 | demo-student-4 |

**Seed trigger**: `POST /api/seed` — idempotent, creates courses, tees, channels, tournaments (t-3 is LIVE), events, announcements, users, scorecards, evaluations, live_scores, rsvps, parent_child_map.

---

## 9. FRONTEND ARCHITECTURE

### State Management
- `AuthContext` (App.js): `{user, token, login, register, logout, loading, refreshUser}`
- `ApiContext` (App.js): Pre-configured axios instance with bearer token
- No Redux/Zustand — each component fetches its own data via `useApi()` hook

### Routing
```
/           → LandingPage (public, redirects to /dashboard if logged in)
/auth       → AuthPage (?mode=register for register view)
/dashboard  → Dashboard (ProtectedRoute → redirects to / if not logged in)
```

Dashboard uses `activeTab` state to switch between components (no sub-routes). The sidebar is `fixed` positioned with mobile overlay toggle.

### CSS Strategy
- Tailwind utility classes everywhere
- CSS variables in `index.css` using HSL format for shadcn/ui compatibility
- Custom classes: `.glass` (backdrop-blur dark), `.glass-light` (subtle background)
- Animations: `.animate-fade-in-up`, `.animate-slide-left`, `.stagger-1` through `.stagger-4`
- Mobile breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- CoachRoster uses `hidden md:block` (table) + `md:hidden` (cards) for responsive

### Key Patterns
- All API calls use `const api = useApi()` → `api.get("/endpoint")`
- MongoDB `_id` is always excluded in projections or stripped before returning
- Leaderboard and Chat use polling (5s and 4s respectively) — not WebSocket
- MapLibre uses free `demotiles.maplibre.org` tile server

---

## 10. KNOWN ISSUES & TECHNICAL DEBT

1. **Chat is polling-based** (4-second interval), not WebSocket. Works but not real-time.
2. **Leaderboard is polling-based** (5-second interval). Same concern.
3. **No input validation** on frontend for hole scores (only `min/max` HTML attributes).
4. **No pagination** on any list endpoint — all return up to 100-500 docs.
5. **JWT secret is hardcoded** in server.py fallback. Should be env var in production.
6. **No indexes** on MongoDB collections. Will slow down with scale.
7. **MapLibre tiles** use demo server (`demotiles.maplibre.org`). Need production tile server (MapTiler/Stadia) for deployment.
8. **No file storage** — profile photos not implemented.
9. **No email sending** — VPC consent is in-app only, no email notifications.
10. **Single server.py** — could benefit from splitting into route modules at scale.

---

## 11. REMAINING BACKLOG (PRIORITIZED)

### P0 — Blocking for Production
- [ ] Move JWT secret to environment variable
- [ ] Add MongoDB indexes (user.email unique, scorecards.student_id, live_scores compound)
- [ ] Replace demo MapLibre tiles with production tile server
- [ ] Rate limiting on auth endpoints

### P1 — High Value
- [ ] WebSocket real-time chat (replace 4s polling)
- [ ] WebSocket real-time leaderboard push (replace 5s polling)
- [ ] PWA service worker with offline IndexedDB + encrypted storage
- [ ] Excel/CSV export for scorecards, evaluations, tournament results
- [ ] Net scoring on leaderboard (Course Handicap applied)
- [ ] Student profile photo upload

### P2 — Medium
- [ ] Calendar .ics file generation for events
- [ ] Push notifications for consent requests and tournament updates
- [ ] Multi-academy support (currently hardcoded to "acad-karen")
- [ ] Detailed analytics dashboard with time-series trends
- [ ] GPS distance calculator on course map (replace click-to-measure)
- [ ] Tournament bracket/pairing generator

### P3 — Nice to Have
- [ ] Parent real-time feed during live tournaments (hole-by-hole updates for their child)
- [ ] Automated 7-day unverified account purge
- [ ] Coach comparison analytics
- [ ] Integration with Kenya Golf Union (KGU) API for official handicap sync
- [ ] Dark/light theme toggle (currently dark-only matching KCC brand)

---

## 12. HOW TO RUN LOCALLY

```bash
# Backend
cd /app/backend
pip install -r requirements.txt
# Ensure MongoDB is running on localhost:27017
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend  
cd /app/frontend
yarn install
REACT_APP_BACKEND_URL=http://localhost:8001 yarn start

# Seed data
curl -X POST http://localhost:8001/api/seed
```

---

## 13. ORIGINAL BLUEPRINT CONTEXT

The project was adapted from a 97K-character Next.js/Supabase technical blueprint. Key concepts preserved:
- **WHS 2024 Math**: Exact formulas from blueprint Section 5/7
- **VPC Flow**: COPPA-compliant deferred parental linking via KCC Member ID
- **Evaluation Levels 1-8**: Structured progression tracking
- **Role Architecture**: 4 roles with granular permissions
- **Live Scoring**: Added post-blueprint as enhancement

What was NOT ported (would need Supabase credentials):
- Supabase Auth (replaced with JWT)
- Supabase Realtime (replaced with polling)
- Row Level Security (replaced with Python role checks)
- PostgreSQL triggers (replaced with application logic)
- Serwist PWA (not yet implemented)
- Web Crypto API encrypted IndexedDB (not yet implemented)

---

*End of handover. The codebase is ~4,000 lines total across 25 files, fully functional with seeded demo data.*
