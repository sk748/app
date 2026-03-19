# Karen Country Club Junior Golf LMS & CRM - PRD

## Original Problem Statement
Build a cohesive, production-ready Junior Golf LMS & CRM for Karen Country Club based on a Technical Blueprint and QA Review. The "Great Stitching" involves wiring disconnected components, fixing commented-out mutations, implementing missing RLS policies, and building missing UI pages.

## Architecture
- **Frontend**: React 19 + TailwindCSS + Recharts + MapLibre GL JS
- **Backend**: FastAPI (Python) + MongoDB
- **Auth**: JWT-based custom auth with role-based access (STUDENT/COACH/PARENT/ADMIN)
- **Math Engine**: WHS 2024 server-side implementation (score differentials, handicap index, expected score scaling)

## User Personas
1. **Student (Junior Golfer)**: Track handicap, submit scorecards, view course maps, RSVP tournaments, rate coaches
2. **Coach**: Manage student roster, conduct Level 1-8 evaluations, track attendance, team chat
3. **Parent/Guardian**: VPC consent approval, read-only chat monitoring, rate coaches, view broadcasts
4. **Admin**: Bulk member import (Excel), view coach ratings, manage announcements

## Core Requirements
- WHS 2024 compliant handicap calculation (Best N of 20 rule)
- Server-side score verification to prevent client tampering
- COPPA-compliant VPC (Verifiable Parental Consent) flow with deferred linking
- Role-based access control on all API endpoints
- MapLibre GL JS interactive course maps
- Real-time team chat with role-based permissions (Parents read-only)
- Brand palette: #012349 (navy), #0082CD (azure), #F4F4F6 (silver), #FBBF24 (gold)

## What's Been Implemented (Jan 2026)
- **Phase 1 (DB & Security)**: MongoDB collections with role-based access on all endpoints. WHS math trigger conflict resolved (server-side only)
- **Phase 2 (API & Backend)**: 20+ API routes wired with real DB operations. WHS 2024 math engine in Python. JWT auth with bcrypt hashing
- **Phase 3 (Missing UI)**: Student Scorecard Input Form, Coach Student Roster Dashboard, Admin Excel Bulk Import UI, Evaluation Wizard
- **Phase 4 (Frontend Assembly)**: All components stitched into React Router layout. CourseMap, HandicapChart, RealtimeChat, EvaluationWizard, VPC flows, Tournament RSVP, CoachEvalForm, ClassFeed, AttendanceTracker, AdminDashboard
- **Testing**: 100% backend API pass rate, 95% frontend pass rate

## Key Files
- `/app/backend/server.py` - Main FastAPI app (all routes)
- `/app/backend/whs_math.py` - WHS 2024 Math Engine
- `/app/frontend/src/App.js` - Main router with auth context
- `/app/frontend/src/pages/` - LandingPage, AuthPage, Dashboard
- `/app/frontend/src/components/golf/` - All golf-specific components

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Student | student@kcc.co.ke | student123 |
| Coach | coach@kcc.co.ke | coach123 |
| Parent | parent@kcc.co.ke | parent123 |
| Admin | admin@kcc.co.ke | admin123 |

## Backlog
### P0 (Critical)
- None remaining

### P1 (High)
- WebSocket-based real-time chat (currently polling every 4s)
- Offline-first PWA with IndexedDB encrypted storage
- Excel export for scorecards and evaluations

### P2 (Medium)
- Calendar .ics file generation for events
- Push notifications for consent requests
- Supabase integration (when credentials provided)
- Mobile-responsive fine-tuning

### P3 (Low/Future)
- GPS distance calculator on course map
- Photo upload for student profiles
- Multi-academy support
- pg_cron equivalent for unverified account purge (7-day grace period)

## Next Tasks
1. WebSocket chat upgrade from polling
2. PWA service worker with Serwist
3. Encrypted IndexedDB storage for offline scorecards
4. Excel/CSV export functionality
