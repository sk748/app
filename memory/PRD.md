# Karen Country Club Junior Golf LMS & CRM - PRD

## Original Problem Statement
Build a cohesive, production-ready Junior Golf LMS & CRM for Karen Country Club based on a Technical Blueprint and QA Review.

## Architecture
- **Frontend**: React 19 + TailwindCSS + Recharts + MapLibre GL JS
- **Backend**: FastAPI (Python) + MongoDB
- **Auth**: JWT-based custom auth with role-based access (STUDENT/COACH/PARENT/ADMIN)
- **Math Engine**: WHS 2024 server-side implementation

## What's Been Implemented

### Phase 1 (Initial Build)
- 20+ API routes, JWT auth, WHS 2024 math engine
- Full UI: Landing, Auth, Dashboard, Scorecard, CourseMap, EvaluationWizard, CoachRoster, AdminDashboard, Chat, Attendance, Tournaments, CoachEval, VPC, ClassFeed

### Phase 2 (Mobile + Gap Remediation)
- Mobile responsive at 390px, admin 5-tab panel, event seeding, VPC fix, broadcast creation, coach roster drilldown

### Phase 3 (Live Leaderboard & Scoring)
- **Live Leaderboard** (all roles): Tournament selector, auto-selects LIVE tournament, pulsing red badge, expandable hole-by-hole scorecards with birdie/eagle/bogey color coding, WHS differential display, 5-second auto-refresh
- **Live Scoring** (Coach/Admin): Select tournament -> see registered players with hole count badges -> select player -> 18-hole input grid pre-populated with existing scores -> color-coded inputs (green=under-par, red=over-par) -> running Total & To Par -> "Update Leaderboard"
- **Tournament Status Management**: "Go Live" / "End Tournament" buttons, UPCOMING/LIVE/COMPLETED states
- **Leaderboard Ranking**: Sorted by holes completed (desc) then to-par (asc), position badges (gold/silver/bronze)
- Testing: 100% backend, 90%+ frontend

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Student | student@kcc.co.ke | student123 |
| Coach | coach@kcc.co.ke | coach123 |
| Parent | parent@kcc.co.ke | parent123 |
| Admin | admin@kcc.co.ke | admin123 |

## Remaining Backlog
### P1
- WebSocket real-time chat (currently polling)
- PWA with offline IndexedDB
- Excel export

### P2
- Calendar .ics generation
- Push notifications
- Multi-academy support
- GPS distance calculator on course map
