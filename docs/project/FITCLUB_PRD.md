# FitClub Platform — Product Requirements Document (PRD)

**Product Name:** FitClub Platform (Working Title)  
**Version:** 1.0 (MVP)  
**Author:** Founders  
**Status:** Draft  
**Last Updated:** Refreshed to reflect current implementation and technical specification.

---

## 1. Executive Summary

FitClub Platform is a community-driven, team-based fitness competition system that enables groups (colleges, corporate teams, communities) to organize structured fitness "Rounds" where participants compete in teams through logged workouts.

The platform replaces manual tracking using WhatsApp, Google Sheets, and MapMyRide with a scalable web + mobile SaaS system.

The product emphasizes:

- Community accountability
- Friendly competition
- Team motivation
- Round-based engagement cycles

The system supports multiple clubs and is designed to scale to thousands of users.

---

## 2. Problem Statement

**Current State (Manual System):**

- Workout tracking via MapMyRide screenshots
- Manual logging in Google Sheets
- Team assignments done manually
- Leaderboards manually updated
- Communication via WhatsApp
- Error-prone scoring
- High admin overhead

**Pain Points:**

- Not scalable
- Not monetizable
- No real-time leaderboards
- No anti-cheat validation
- No analytics
- High operational burden

**Opportunity:** Build a scalable SaaS platform that automates scoring, enables multiple independent clubs, reduces admin workload, creates monetization pathways, and expands beyond the current 300-user community.

---

## 3. Product Vision

Create the leading community-based fitness competition platform that transforms social motivation into sustainable health habits.

**Positioning:** *"Fantasy Football for Fitness."*

---

## 4. Target Users

### 4.1 Primary Users

- College fitness groups
- Corporate wellness groups
- Church or community groups
- Alumni networks
- Amateur sports communities

### 4.2 User Personas

| Persona | Description |
|--------|-------------|
| **Participant** | Joins a club, competes in rounds, logs workouts, motivated by team performance |
| **Club Admin** | Creates rounds, defines scoring rules, assigns teams, manages participants |
| **Team Captain** (optional) | Encourages team members, tracks team engagement |

---

## 5. Product Scope

### 5.1 Platforms

- **Mobile App** (iOS + Android) — React Native (Expo)
- **Web App** (Admin + Full Access) — Same codebase via React Native Web
- **Shared backend** (API-first) — Node.js + Express

---

## 6. Core Concepts

### 6.1 Club

A container organization: members, rounds, teams, scoring rules.  
Example: "XYZ College FitClub". Each club has a unique **invite code** for joining.

### 6.2 Round (Season)

A time-bound competition period.

**Attributes:** Start date, end date, teams, participants, scoring model (JSON), daily cap (optional), activity types allowed. **Status:** `draft` | `active` | `ended`. Only one active round per club at a time.

### 6.3 Team

Belongs to a Round; has multiple participants (TeamMembership); accumulates points from members' ScoreLedger entries.

### 6.4 Workout

User-submitted fitness activity.

**Fields:** Activity type, duration (optional), distance (optional), timestamp (loggedAt), optional proof URL. Points are calculated and stored in ScoreLedger (one row per workout).

### 6.5 ScoreLedger

One row per workout: raw points, capped points, daily-adjusted points, final awarded points, optional rule snapshot. Source of truth for all leaderboards and dashboards.

---

## 7. Functional Requirements (MVP)

### 7.1 Authentication

- Register via email + password; login; JWT issued on success.
- Join club via invite code (separate flow from register).
- **Implementation:** JWT in `Authorization: Bearer <token>`; password hashing with bcrypt; auth middleware on protected routes. No password reset in current build.

### 7.2 Club Management

- **Admin:** Create club (name → auto invite code), invite members (share code), remove members, set member role (admin/member).
- **Member:** List my clubs, get club by ID, list club members (with optional search and active-round team assignment).
- **System:** Multi-tenant; all club-scoped APIs enforce membership via `ClubService.ensureMember`.

### 7.3 Round Creation & Lifecycle

- **Admin:** Create round (clubId, name, startDate, endDate, scoringConfig, optional teamSize); update round (PATCH); activate round (POST activate); end round (POST end).
- **Any member:** List rounds by club; get round by ID.
- **System:** Teams and workout logging only when round status is `active`; one active round per club.

### 7.4 Teams & Team Membership

- **Any club member (when round active):** Create team (roundId, name); list teams by round; add member to team (roundId, teamId, userId) — validated: user in club, not already in a team for this round.
- **Participant:** Get "my team" for a round (GET my-team); get team summary (rank, total points, members with points and contribution %).
- **System:** Unique constraint (userId, roundId) so each user is in at most one team per round.

### 7.5 Dashboard (Participant Home)

- **API:** GET club dashboard (active round, member count, teams with points, top teams, recent workouts, current user's today points, daily cap, my team rank/name).
- **Frontend:** Home screen shows round name, days left, today’s points vs daily cap (ring), top teams, recent activity; empty states when no club or no active round.

### 7.6 Leaderboards

- **Individual:** Ranked by sum of `finalAwardedPoints` per user in round; returns rank, name, points, maxPoints, isCurrentUser.
- **Team:** Ranked by sum of members’ points; same shape.
- **API:** GET round leaderboard with `type=individuals` or `type=teams`. Frontend tabs and "You are #N" banner.

### 7.7 Workout Logging & Scoring (Current State)

- **Reference data:** GET list of activities (GenericWorkoutMet) and workout master (specific → generic mapping) for workout form.
- **MVP scope:** Workout create/submit API and scoring engine integration are specified in [FITCLUB_SCORING_ENGINE_SPEC.md](./FITCLUB_SCORING_ENGINE_SPEC.md); backend persistence of Workout + ScoreLedger and POST endpoint to log a workout are to be implemented. Frontend has WorkoutNewScreen and activity list from API.

### 7.8 Analytics & Notifications

- **Analytics:** Participant and admin analytics (totals, charts, streaks, team breakdown) — planned; not yet implemented.
- **Notifications:** Round start/end, daily reminder — planned; not in current build.

---

## 8. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| **Performance** | Target 10,000 concurrent users; leaderboard queries < 300ms (currently DB-backed; Redis optional later). |
| **Scalability** | Stateless API; horizontal scaling; background jobs for scoring/notifications (planned). |
| **Security** | Data isolation per club; JWT auth; rate limiting on auth and API; CORS config; security headers. |
| **Reliability** | Health checks (/api/health, /health); daily backup and zero data loss targets. |

---

## 9. Data Model (Implemented)

**Entities (Prisma/PostgreSQL):**

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **User** | Identity | id, email, passwordHash, displayName, createdAt, updatedAt |
| **Club** | Tenant | id, name, inviteCode (unique), createdAt |
| **ClubMembership** | User ↔ Club + role | userId, clubId, role (admin/member), joinedAt; unique(userId, clubId) |
| **Round** | Time-bound competition | id, clubId, name, startDate, endDate, scoringConfig (JSON), teamSize?, locked, status (draft/active/ended), createdAt, updatedAt |
| **Team** | Team in a round | id, roundId, name, createdAt |
| **TeamMembership** | User ↔ Team in round | id, userId, teamId, roundId; unique(userId, roundId), unique(userId, teamId) |
| **Workout** | Logged activity | id, userId, roundId, activityType, durationMinutes?, distanceKm?, proofUrl?, loggedAt, createdAt |
| **ScoreLedger** | Points per workout | id, workoutId (unique), userId, roundId, rawPoints, cappedPoints, dailyAdjustedPoints, finalAwardedPoints, ruleSnapshotJson?, createdAt |
| **GenericWorkoutMet** | Reference: activity MET/config | id, workoutType, avgMetPerHour?, minMet?, maxMet?, mlp?, maxMetLimit?, metCap? |
| **WorkoutMaster** | Mapping specific → generic | id, workoutType, genericWorkoutType → GenericWorkoutMet |

**Relationships:**

- User ↔ Club: ClubMembership (many-to-many).
- Club → Round: one-to-many.
- Round → Team: one-to-many.
- Team ↔ User: TeamMembership (many-to-many per round).
- User → Workout: one-to-many (per round).
- Workout → ScoreLedger: one-to-one.
- Round → ScoreLedger: one-to-many (for aggregations).

---

## 10. Technical Architecture (Detailed)

### 10.1 Stack Summary

| Layer | Technology | Notes |
|-------|------------|--------|
| **Backend** | Node.js 20+, Express 4.x, TypeScript | Async via express-async-errors; no Redis in current build |
| **Database** | PostgreSQL | Prisma ORM; migrations in `backend/prisma/migrations` |
| **Auth** | JWT (jsonwebtoken), bcrypt | Token in header; auth middleware on protected routes |
| **Frontend** | React 19, React Native 0.81, Expo 54 | Single codebase: iOS, Android, Web |
| **State** | Zustand (auth), React state/context (club, UI) | No React Query in critical path; API calls via fetch in services |
| **API style** | REST; JSON; base path `/api` | All responses: `{ success, data?, error?, message? }` |

### 10.2 Repository Structure

```
FitClub/
├── backend/                    # Node.js API
│   ├── prisma/
│   │   ├── schema.prisma       # Data model
│   │   ├── migrations/         # SQL migrations
│   │   └── seed.ts             # Optional seed
│   ├── src/
│   │   ├── app.ts              # Express app, CORS, routes, error handler
│   │   ├── config/             # env, database
│   │   ├── middleware/         # auth, rateLimit, security, requestLogger, error
│   │   ├── routes/             # auth, club, round, team, workout
│   │   ├── controllers/        # Auth, Club, Round, Team, Workout
│   │   ├── services/           # Business logic (club, round, team, workout, dashboard, leaderboard)
│   │   └── utils/              # errors, etc.
│   ├── scripts/                # deploy, GCP config
│   └── package.json
├── frontend/                   # Expo (React Native + Web)
│   ├── src/
│   │   ├── components/         # Button, Card, CircularProgressRing, LeaderboardRow, etc.
│   │   ├── config/             # environment (API URL), api (getAuthToken), activities, workoutInputMap
│   │   ├── context/            # ClubContext (clubs, selectedClub, refreshClubs)
│   │   ├── data/               # mockDashboard, mockLeaderboard, mockProfile (fallback/legacy)
│   │   ├── hooks/              # useIsWeb
│   │   ├── layout/             # WebAppLayout, WebSidebar, WebTopBar, webNavConfig
│   │   ├── navigation/         # RootStack, MainTabs, HomeStack, AuthStack, WebStack, types
│   │   ├── screens/            # Home, Leaderboard, Team, Profile, Settings, CreateClub, JoinClub, Dashboard, Rounds, Teams, Members, Analytics, WorkoutNew, Landing, Login, Register
│   │   ├── services/           # clubService, roundService, teamService, workoutService (API clients)
│   │   ├── store/              # authStore (Zustand), themeStore
│   │   ├── theme/              # ThemeContext, colors, tokens, theme types
│   │   └── types/              # dashboard, leaderboard, profile, team, etc.
│   ├── app.json
│   └── package.json
└── docs/
    ├── project/                # PRD, scoring spec, system patterns, tech context, progress
    ├── setup/                  # Backend/frontend setup
    └── deployment/              # GCP, Cloud SQL
```

### 10.3 API Reference (Implemented)

Base URL: `http(s)://<host>:<port>/api`. All protected routes require `Authorization: Bearer <jwt>`.

#### Auth (no auth required for these)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Body: `{ email, password, displayName }` → user + token |
| POST | /api/auth/login | Body: `{ email, password }` → token |

#### Clubs (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/clubs | List current user's clubs (with role) |
| GET | /api/clubs/:clubId | Get club by ID (inviteCode only if admin) |
| POST | /api/clubs | Create club; body: `{ name }` → club + inviteCode |
| POST | /api/clubs/join | Join by invite code; body: `{ inviteCode }` |
| GET | /api/clubs/:clubId/dashboard | Dashboard: active round, top teams, recent workouts, today points, daily cap, my team rank/name |
| GET | /api/clubs/:clubId/members | Query: `?search=&activeRoundId=` → members with optional team for round |
| PATCH | /api/clubs/:clubId/members/:userId/role | Body: `{ role: 'admin' \| 'member' }` (admin only) |
| DELETE | /api/clubs/:clubId/members/:userId | Remove member (admin only) |

#### Rounds (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/clubs/:clubId/rounds | List rounds for club |
| GET | /api/rounds/:roundId | Get round by ID |
| POST | /api/clubs/:clubId/rounds | Create round; body: name, startDate, endDate, scoringConfig, teamSize? |
| PATCH | /api/rounds/:roundId | Update round |
| POST | /api/rounds/:roundId/activate | Set status to active |
| POST | /api/rounds/:roundId/end | Set status to ended |
| GET | /api/rounds/:roundId/leaderboard | Query: `?type=individuals|teams` → ranked list with points, maxPoints, isCurrentUser |

#### Teams (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/rounds/:roundId/teams | List teams with members (User displayName, email) |
| POST | /api/rounds/:roundId/teams | Create team; body: `{ name }` |
| GET | /api/rounds/:roundId/my-team | Current user's team summary (404 if not in a team) |
| GET | /api/rounds/:roundId/teams/:teamId/summary | Team summary: rank, totalPoints, members (points, contributionPercent, isCurrentUser) |
| POST | /api/rounds/:roundId/teams/:teamId/members | Add member; body: `{ userId }` |

#### Workouts (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/workouts/activities | List generic activities (GenericWorkoutMet) for workout form |
| GET | /api/workouts/workout-master | List workout type → generic mapping |

#### Health (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | JSON: success, message, timestamp, environment, database |
| GET | /health | 200/503 + database status (for probes) |

### 10.4 Frontend API Clients & Data Flow

- **Auth:** Token stored in Zustand (`authStore`). `getAuthToken()` used by service layer for `Authorization` header.
- **Club context:** `ClubProvider` loads clubs on mount; exposes `selectedClub`, `setSelectedClub`, `refreshClubs`. Used by Home, Leaderboard, Team, Dashboard, Rounds, Teams, Members.
- **Key flows:**
  - **Home:** `clubService.getDashboard(selectedClub.id)` → map to DashboardData (round, todayPoints, dailyCap, topTeams, recentWorkouts, teamRank).
  - **Leaderboard:** Dashboard → activeRoundId; then `roundService.getLeaderboard(roundId, 'individuals'|'teams')`; myRank from entry where `isCurrentUser`.
  - **Team:** Dashboard → activeRoundId; `teamService.getMyTeam(roundId)` → TeamDetail (or 404 → "no team" message).
  - **Teams management (web):** `roundService.listByClub` → active round; `teamService.listByRound(roundId)`; `clubService.listMembers(clubId, { activeRoundId })` for add-member modal; `teamService.addMember(roundId, teamId, userId)`.
- **Environment:** `EXPO_PUBLIC_API_URL` or default `http://<EXPO_PUBLIC_LOCAL_IP>:8080/api` (frontend points to backend).

### 10.5 Backend Services (Logic Layer)

| Service | Responsibilities |
|---------|------------------|
| **ClubService** | ensureMember, createClub, joinByInviteCode, listMyClubs, getClub, listMembers (with optional activeRoundId → team), setMemberRole, removeMember |
| **RoundService** | createRound, listByClub, getById, update, activate, end |
| **TeamService** | createTeam, listTeamsByRound, addMemberToTeam, getTeamSummary, getMyTeamSummary |
| **DashboardService** | getDashboard(clubId, userId) — active round, teams with points, top teams, recent workouts, today points, daily cap, my team rank/name |
| **LeaderboardService** | getLeaderboard(roundId, userId, type) — individuals or teams from ScoreLedger aggregation |
| **WorkoutService** | listGenericActivities, listWorkoutMaster (reference data only in current build) |

### 10.6 Security & Middleware

- **Auth middleware:** Validates JWT; attaches `req.user` (id, email, etc.). Used on all routes except auth and health.
- **Rate limiting:** Applied to `/api` and to auth routes (e.g. login/register).
- **CORS:** Configurable allowed origins via env; credentials true.
- **Security headers:** Helmet-style headers; optional HTTPS redirect in production.
- **Multi-tenancy:** Club-scoped operations validate membership via `ClubService.ensureMember(userId, clubId)` before any data access.

### 10.7 Database & Migrations

- **ORM:** Prisma 5.x; client generated to `node_modules/.prisma`.
- **Migrations:** Stored in `backend/prisma/migrations`; apply with `prisma migrate deploy` (prod) or `prisma migrate dev` (dev).
- **Seed:** Optional `prisma/seed.ts`; run with `prisma db seed`. Used for reference data (e.g. GenericWorkoutMet, WorkoutMaster) or test data.

### 10.8 Environment & Configuration

**Backend (e.g. `.env`):**

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for signing JWTs
- `NODE_ENV` — development | production
- `PORT` — Server port (e.g. 8080)
- `CORS_ORIGIN` — Allowed origins (comma-separated or `*`)

**Frontend:**

- `EXPO_PUBLIC_API_URL` — Override for API base (default not set)
- `EXPO_PUBLIC_LOCAL_IP` — Default 127.0.0.1 for local backend URL

### 10.9 Deployment (Reference)

- Backend: Node 20+; `npm run build` then `node dist/app.js`; can be containerized (Docker) and run on GCP Cloud Run, AWS ECS, etc.
- Database: PostgreSQL (e.g. Cloud SQL); run migrations on deploy.
- Frontend: Expo build for iOS/Android; Web export or hosting of web bundle. API base URL must point to deployed backend.
- Scripts in `backend/scripts/` (e.g. `deploy_to_dev.sh`, `gcp.config.sh`) support deployment and config; see `docs/deployment/` for details.

---

## 11. Monetization Strategy (Phase 2)

- **Model A:** Subscription per club ($49/mo up to 100 users; $99/mo 100–500 users)
- **Model B:** Per round pricing ($5 per participant per round)
- **Model C:** Corporate wellness contracts
- **Payments:** Stripe; subscription billing; invoice generation

---

## 12. Metrics for Success

**Product:** 70% round completion; 60% returning users per round; 4+ workouts/user/week; < 10% churn per club  

**Business:** CAC < $50; LTV > $200 per club

---

## 13. MVP Exclusions (Not in Phase 1)

Apple Health, Strava sync, Garmin integration, AI coaching, public marketplace, cross-club competition, advanced gamification, marketplace features.

---

## 14. Risks & Mitigation

| Risk | Mitigation |
|------|-------------|
| Cheating (fake workouts) | Daily caps, random proof audits, future API integrations |
| Engagement drop-off | Round-based model, team accountability, notifications |
| Admin overload | Automation, team auto-assignment, templates |

---

## 15. Roadmap (90 Days)

| Phase | Timeline | Focus |
|-------|----------|--------|
| **Phase 1** | 0–30 days | Auth, club model, round model, workout logging, basic scoring |
| **Phase 2** | 30–60 days | Leaderboards, analytics, admin dashboard |
| **Phase 3** | 60–90 days | Polished UI, notifications, Stripe integration, beta launch to 1 external club |

*Current implementation covers: auth, clubs, rounds, teams, dashboard, leaderboards, team summary, and reference workout data. Workout submit + scoring engine persistence and analytics are in scope for completion of MVP.*

---

## 16. Go-To-Market Strategy

- **Phase 1:** Existing 300-member community; beta test internally; testimonials
- **Phase 2:** 5 other colleges; free pilot; case studies
- **Phase 3:** Corporate wellness outreach; paid acquisition experiments

---

## 17. Definition of Done (MVP)

The MVP is complete when:

- A new club can sign up
- Admin can create a round
- Users can log workouts (submit → Workout + ScoreLedger)
- Points are auto-calculated
- Team leaderboard works in real time
- Round completes successfully
- Results can be exported

---

## 18. Related Documents

| Document | Description |
|----------|-------------|
| [FITCLUB_SCORING_ENGINE_SPEC.md](./FITCLUB_SCORING_ENGINE_SPEC.md) | Scoring rules, RoundScoringConfig, daily cap, activity rules |
| [systemPatterns.md](./systemPatterns.md) | High-level architecture, data flow, API shape, caching (Redis) design |
| [techContext.md](./techContext.md) | Stack choices, constraints, dependencies |
| [productContext.md](./productContext.md) | Problem, solution, UX goals |
| [projectbrief.md](./projectbrief.md) | Overview, objectives, platform, success criteria |
| [progress.md](./progress.md) | Completion status, to-do, known issues |
