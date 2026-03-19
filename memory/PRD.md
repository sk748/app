# Karen Country Club Junior Golf LMS & CRM - PRD

## Original Problem Statement
Build a cohesive, production-ready Junior Golf LMS & CRM for Karen Country Club based on a Technical Blueprint and QA Review. The "Great Stitching" involves wiring disconnected components, fixing commented-out mutations, implementing missing RLS policies, and building missing UI pages.

## Architecture
- **Frontend**: React 19 + TailwindCSS + Recharts + MapLibre GL JS
- **Backend**: FastAPI (Python) + MongoDB
- **Auth**: JWT-based custom auth with role-based access (STUDENT/COACH/PARENT/ADMIN)
- **Math Engine**: WHS 2024 server-side implementation (score differentials, handicap index, expected score scaling)

## User Personas
1. **Student (Junior Golfer)**: Track handicap, submit scorecards, view course maps, RSVP tournaments, rate coaches, VPC consent
2. **Coach**: Manage student roster w/ drilldown, conduct Level 1-8 evaluations, track attendance, create events, team chat, create broadcasts
3. **Parent/Guardian**: VPC consent approval, read-only chat monitoring, rate coaches, view broadcasts
4. **Admin**: System overview stats, user management panel, bulk member import (Excel), coach ratings, announcement creation

## Core Requirements
- WHS 2024 compliant handicap calculation (Best N of 20 rule)
- Server-side score verification to prevent client tampering
- COPPA-compliant VPC (Verifiable Parental Consent) flow with deferred linking
- Role-based access control on all API endpoints
- MapLibre GL JS interactive course maps
- Real-time team chat with role-based permissions (Parents read-only)
- Mobile-responsive design (no overlapping text at 390px)
- Brand palette: #012349 (navy), #0082CD (azure), #F4F4F6 (silver), #FBBF24 (gold)

## What's Been Implemented

### Phase 1 (Jan 2026 - Initial Build)
- 20+ API routes wired with real MongoDB operations
- JWT auth with bcrypt hashing, role-based access control
- WHS 2024 math engine in Python (server-side score differentials)
- Full UI: Landing, Auth, Dashboard, Scorecard, CourseMap, EvaluationWizard, CoachRoster, AdminDashboard, Chat, Attendance, Tournaments, CoachEval, VPC, ClassFeed
- Testing: 100% backend, 95% frontend

### Phase 2 (Jan 2026 - Mobile + Gap Remediation)
- **Mobile Optimisation**: Responsive landing page, card-based roster on mobile, proper spacing and no text overlap at 390px
- **Admin Dashboard Expanded**: 5 tabs (Overview, Users, Coach Ratings, Bulk Import, Broadcasts) with system stats and announcement creation
- **Attendance Seeded**: 3 seed events + inline event creation form
- **VPC Fixed**: Student-initiated consent requests via POST /api/pending-approvals with duplicate prevention
- **Broadcasts Creation**: Coaches/Admins can create announcements from ClassFeed and Admin dashboard
- **Coach Roster Drilldown**: Expandable student cards with recent scorecards
- **Logout Fix**: Redirects to landing page
- Testing: 97% backend, 98% frontend, 100% mobile

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Student | student@kcc.co.ke | student123 |
| Coach | coach@kcc.co.ke | coach123 |
| Parent | parent@kcc.co.ke | parent123 |
| Admin | admin@kcc.co.ke | admin123 |

## Gap Analysis Results (Iteration 2)

### Fixed Gaps
- [x] Coach Roster mobile layout broken (12-col grid) -> Card layout
- [x] Landing nav text overlap on mobile -> Responsive breakpoints
- [x] Events not seeded -> 3 seed events added
- [x] Admin dashboard underdeveloped -> 5-tab panel with stats, user list, ratings, import, broadcasts
- [x] ClassFeed read-only -> New Broadcast form added
- [x] VPC student form non-functional -> POST endpoint wired
- [x] Attendance no event creation -> Inline event creation form
- [x] Coach roster no drilldown -> Expandable cards with scorecard history
- [x] Logout redirect wrong -> Fixed to landing page

### Remaining Backlog
#### P1 (High)
- WebSocket-based real-time chat (currently polling every 4s)
- Offline-first PWA with IndexedDB encrypted storage
- Excel export for scorecards and evaluations
- Student profile photo upload

#### P2 (Medium)
- Calendar .ics file generation for events
- Push notifications for consent requests
- Multi-academy support
- Tournament leaderboard

#### P3 (Low/Future)
- GPS distance calculator on course map
- Automated 7-day unverified account purge
- Detailed analytics dashboard with trends
