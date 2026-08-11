# Competitor Analysis: ArcherySuccess vs Sokil

## Overview

**Competitor**: [ArcherySuccess](https://archerysuccess.com/) by AllTen Software Limited
**Platforms**: iOS + Android (native)
**Rating**: 4.7 App Store, 4.6 Google Play
**Reach**: 60+ countries, 780+ rounds
**Price**: Paid app

---

## ArcherySuccess Feature Breakdown

### 1. Scoring System
- 780+ built-in rounds across 23 federations (AGB, WA, NFAA, IFAA, USA Archery, DBSV, ASA, IBO, NFAS, etc.)
- Color-coded keyboard for score entry (matches target face colors)
- Summary score entry for historic data capture
- Round locking mechanism to prevent accidental edits
- Custom round builder (up to 4 distances, 12 ends of 12 arrows)
- Score entry syncs with plotting in real-time
- Email scorecards

### 2. Arrow Plotting on Target Face
- Zoomable/pannable target face images
- Quick plot: single tap to place arrow
- Precision plot: touch-and-hold for crosshairs
- Multi-spot target support (Vegas 3-spot, Worcester 5-spot, NFAA indoor)
- Target centering and target number selection on multi-spot faces
- Miss direction plotting in grey band around target
- Current end arrows shown as green circles, previous ends as black circles
- Arrow group indicator with cluster direction

### 3. Arrow Tagging & Analysis
- Tag individual arrows with numbers (1-24)
- Automatic tagging when tagging all arrows in a round
- Tag analysis screen showing where each arrow grouped
- Cluster direction indicators (primary cluster from center, tag cluster from primary)
- Arrow culling workflow — identify numbered arrows that don't group
- Useful for tuning and equipment selection

### 4. Performance Metrics
- **Archer Skill Level**: Round-independent skill score based on Dr. James Park formula
- **AGB Handicap**: Both legacy table-based system and 2023 statistical model
- Applied across all concentric target face rounds (AGB, WA, NFAA, USAA, IFAA)
- Not applicable to 3D, animal, or clout rounds

### 5. Gear Setup Management
- Setup = bow + arrows + sight settings
- Create, edit, copy, delete setups
- Favorite setup as default for new rounds
- Sight settings per distance
- PB tracking grouped by gear setup
- Notes on setup, bow, arrows, and sight settings

### 6. Training Journal
- Journal tab with searchable list of all rounds, notes, arrow counts
- Custom journal entry types:
  - Arrow count entries (single value or increment/decrement counter)
  - General notes entries
  - Round entries (auto-created from Score/Plot tabs)
- Categorized note fields: gear, medical, nutrition, rest & recuperation, S&C, specific physical training, travel, weather
- Resume or delete entries via swipe gesture
- Round notes include: round name, date, competition level, gear, training objective and outcome

### 7. Progress Tracking
- Weekly progress dashboard (Progress tab)
- Arrow count vs weekly arrow count goal
- Rounds shot for the week with scores
- Journal entries for the week
- Graphs:
  - Arrow count by weekday
  - Arrow average by weekday
  - Trend graph: skill level by arrow count for selected bow setup
- Historical weekly reports (navigate backwards)
- Personal Best scorecard (cup icon)
- PB rounds highlighted on progress report

### 8. Coach Features
- Standardized HTML progress reports via email
- Coaches receive same-format reports from all athletes
- Report data can be copied to spreadsheet for analysis
- Quick arrow plotting during competitions
- Round and blank bale note templates for structured training
- Track athlete arrow volumes and follow progress

### 9. Email & Reporting
- Weekly progress reports in HTML format
- Email scorecards and plots
- PB and My Event Results Scorecard via email
- One-tap email to coach

### 10. Data Protection
- Cloud backup to iOS/Android device backups
- Round locking mechanism
- Email reports for safe keeping

---

## Feature Comparison Matrix

| Feature | Sokil | ArcherySuccess |
|---------|:-----:|:--------------:|
| Web app (no install) | ✅ | ❌ |
| PWA / offline | ✅ | ❌ |
| Native mobile apps | ❌ | ✅ |
| Club management | ✅ | ❌ |
| Federation management | ✅ | ❌ |
| Tournament management | ✅ | ❌ |
| Patrol generation + PDF | ✅ | ❌ |
| Achievement system (31 types) | ✅ | ❌ |
| Multi-language (6 langs) | ✅ | ❌ |
| Role-based access (4 roles) | ✅ | ❌ |
| Public archer profiles | ✅ | ❌ |
| Google OAuth | ✅ | ❌ |
| Training sessions with mood | ✅ | ❌ |
| Streak tracking | ✅ | ❌ |
| Unit converter / calculator | ✅ | ❌ |
| Glossary | ✅ | ❌ |
| Target face plotting | ❌ | ✅ |
| Round library (780+) | ❌ | ✅ |
| Score entry per round | ❌ | ✅ |
| Arrow tagging & analysis | ❌ | ✅ |
| Archer skill rating | ❌ | ✅ |
| Gear setups + sight marks | ❌ | ✅ |
| Coach-athlete reports | ❌ | ✅ |
| Weekly progress email | ❌ | ✅ |
| Arrow count goals | ❌ | ✅ |
| Categorized journal notes | ❌ | ✅ |
| Round locking | ❌ | ✅ |
| Custom round builder | ❌ | ✅ |
| PB per gear setup | ❌ | ✅ |

---

## Sokil's Competitive Advantages

1. **Web-based** — No app store install required, works on any device
2. **Social/organizational** — Clubs, federations, community features
3. **Tournament infrastructure** — Full tournament lifecycle with patrol generation
4. **Gamification** — 31 achievements with rarity levels, progress tracking, sharing
5. **Modern tech stack** — Next.js 15, NestJS 11, PostgreSQL, PWA
6. **Multi-language** — 6 languages with i18n
7. **Granular permissions** — 4 roles with configurable permission matrix

---

## Implementation Plan

### Phase 1: Round Library & Score Entry (Foundation)

> **Goal**: Build the data model and UI for archery rounds and scoring

#### 1.1 Round Entity & Data Model

**New entities to create:**

```
Round
├── id (uuid)
├── name (string)
├── code (string, unique)
├── ruleId (FK → Rule)
├── roundType (enum: target, indoor, field, clout, 3d, animal)
├── description (text)
├── distances (json: [{distance_m, targetFaceId, ends, arrowsPerEnd}])
├── totalEnds (int)
├── totalArrows (int)
├── maxScore (int)
├── isCustom (boolean)
├── createdBy (FK → User, nullable)
├── createdAt, updatedAt
```

```
TargetFace
├── id (uuid)
├── name (string) — e.g. "WA 122cm", "Vegas 3-spot", "Worcester 5-spot"
├── code (string)
├── faceType (enum: single, multi_spot_3, multi_spot_6, field, 3d, clout)
├── rings (json: [{zone, score, color, radius_pct}])
├── svgTemplate (text) — SVG markup for rendering
├── imageUrl (string, nullable)
```

```
ScoreEntry
├── id (uuid)
├── userId (FK → User)
├── roundId (FK → Round)
├── equipmentSetId (FK → EquipmentSet, nullable)
├── startedAt (datetime)
├── completedAt (datetime, nullable)
├── status (enum: in_progress, completed, locked)
├── competitionLevel (enum: practice, club, regional, national, international)
├── location (string)
├── conditions (string)
├── notes (text)
├── scoreTotal (int)
├── ends (json: [{endNumber, arrows: [{value, x, y, plotted}]}])
├── createdAt, updatedAt
```

#### 1.2 Seed Round Database

Start with the most common federations:
- **World Archery**: 720 round (70m), 60m, 50m, 30m, indoor 18m/25m
- **AGB**: Imperial rounds (York, Hereford, Bristol), Metric rounds, Indoor (Portsmouth, Worcester, Bray)
- **NFAA**: Vegas, Indoor 300, 600, Field
- **IFAA**: Field rounds
- **Custom**: Allow users to create rounds

Create a seed script or migration to populate initial rounds.

#### 1.3 Score Entry UI

- **Round selector**: Searchable dropdown grouped by federation/type
- **Score sheet**: Table layout with ends as rows, arrows as columns
- **Color-coded input**: Arrow values colored by scoring zone
- **Auto-calculation**: Running totals, end totals, score total
- **Undo**: Remove last entered arrow
- **Notes button**: Attach notes to round
- **Equipment selector**: Link to existing equipment set

**Files to create/modify:**
- `apps/web/src/app/[lang]/scoring/` — new route
- `apps/web/src/components/scoring/` — ScoreSheet, RoundSelector, ArrowInput
- `apps/api/src/modules/rounds/` — Round module (controller, service, entity)
- `apps/api/src/modules/scores/` — Score module
- `packages/shared-types/` — Round, TargetFace, ScoreEntry types

---

### Phase 2: Target Face Plotting

> **Goal**: Interactive SVG-based arrow plotting on target faces

#### 2.1 Target Face Renderer

- SVG-based target face component
- Support for single-spot and multi-spot targets
- Zoom/pan with gesture support (pinch-to-zoom on mobile, scroll on desktop)
- Center/reset buttons
- Target number selector for multi-spot faces

#### 2.2 Plotting Modes

**Quick Plot:**
- Single tap on target face
- Nearest scoring zone determined by tap coordinates
- Arrow placed with value indicator

**Precision Plot:**
- Touch and hold → crosshairs appear
- Drag to fine-tune position
- Release to place arrow
- Exact x/y coordinates stored

#### 2.3 Arrow Visualization

- Current end arrows: colored circles with value
- Previous end arrows: faded/different style
- Arrow group indicator: center of cluster for current end
- Miss zone: grey band around target for miss direction

#### 2.4 Tag Analysis (Phase 2b)

- Tag arrows with numbers (1-24)
- Tag analysis screen showing grouping per arrow
- Cluster direction indicators
- Arrow culling workflow

**Files to create/modify:**
- `apps/web/src/components/plotting/` — TargetFace, PlotCanvas, CrosshairOverlay, ArrowGroupIndicator
- `apps/web/src/components/plotting/targets/` — SVG templates per target type
- `apps/api/src/modules/scores/` — extend with plotted arrow data (x, y coordinates)

---

### Phase 3: Performance Metrics

> **Goal**: Automated skill level and handicap calculations

#### 3.1 Archer Skill Level

Implement Dr. James Park's formula:
- Input: round score, round max score, number of arrows
- Output: skill level (0-100+ scale)
- Round-independent metric
- Calculate per shot and per round

#### 3.2 AGB Handicap (optional — UK-specific)

- Legacy table-based lookup
- 2023 statistical model
- Requires AGB-specific round data

#### 3.3 Display & Integration

- Show skill level on completed rounds
- Skill level trend over time (graph)
- Include in progress reports
- Include in statistics page

**Files to create/modify:**
- `packages/shared-types/` — Skill calculation functions
- `apps/api/src/modules/statistics/` — add skill level calculations
- `apps/web/src/components/statistics/` — skill level display, trend chart

---

### Phase 4: Gear Setups & Sight Marks

> **Goal**: Extend equipment management with sight settings

#### 4.1 Sight Settings Entity

```
SightSetting
├── id (uuid)
├── equipmentSetId (FK → EquipmentSet)
├── distance (int, meters)
├── sightMark (decimal)
├── notes (text)
├── createdAt, updatedAt
```

#### 4.2 UI Enhancements

- Sight marks table per equipment set (distance → sight mark)
- Quick add/edit sight marks
- Show default equipment set on dashboard
- Link equipment set to score entries
- PB tracking per equipment set

**Files to create/modify:**
- `apps/api/src/modules/equipment/` — add SightSetting entity + CRUD
- `apps/web/src/app/[lang]/equipment/` — sight marks table component
- `packages/shared-types/` — SightSetting type

---

### Phase 5: Enhanced Journal & Notes

> **Goal**: Categorized notes and searchable journal

#### 5.1 Note Categories

Extend training session notes with structured categories:
- General notes
- Gear notes
- Medical notes
- Nutrition notes
- Rest & recuperation
- Strength & conditioning
- Specific physical training
- Travel & weather

#### 5.2 Journal View

- Searchable list of all entries (rounds, notes, arrow counts)
- Filter by type, date range, search text
- Swipe actions (edit, delete)

#### 5.3 Arrow Count Tracker

- Dedicated arrow count entry (standalone, not tied to a round)
- Increment/decrement counter
- Arrow count goal per week
- Progress bar on dashboard

**Files to create/modify:**
- `apps/api/src/modules/trainings/` — extend notes structure
- `apps/web/src/app/[lang]/journal/` — new journal route (or enhance trainings page)
- `apps/web/src/components/journal/` — JournalList, NoteCategoryPicker, ArrowCounter
- `apps/web/src/app/[lang]/home` — arrow count goal widget

---

### Phase 6: Coach-Athlete Features

> **Goal**: Structured coach workflow with progress reports

#### 6.1 Coach Role & Relationship

```
CoachAthlete
├── id (uuid)
├── coachId (FK → User)
├── athleteId (FK → User)
├── status (enum: pending, active, ended)
├── createdAt
```

#### 6.2 Progress Report Generator

- Weekly HTML report including:
  - Arrow count vs goal
  - Rounds shot with scores
  - Notes and journal entries
  - Skill level trend
  - PB highlights
- One-tap email to coach
- Coach dashboard showing all athletes

#### 6.3 Email Templates

- Weekly progress report (HTML)
- Scorecard email
- PB notification

**Files to create/modify:**
- `apps/api/src/modules/coaching/` — new module (CoachAthlete entity, service)
- `apps/api/src/modules/email/` — report templates
- `apps/web/src/app/[lang]/coaching/` — coach dashboard
- `apps/web/src/app/[lang]/profile/` — add coach/athlete links

---

### Phase 7: Custom Rounds & Round Locking

> **Goal**: User-created rounds and data protection

#### 7.1 Custom Round Builder

- Base on existing round templates
- Configure: distances, target faces, ends, arrows per end
- Save as reusable template
- Share with other users (optional)

#### 7.2 Round Locking

- Auto-lock completed rounds after configurable time
- Manual lock/unlock button
- Locked rounds: prevent score changes, arrow deletions
- Visual indicator (lock icon)

**Files to create/modify:**
- `apps/web/src/components/scoring/` — CustomRoundBuilder
- `apps/api/src/modules/scores/` — locking logic
- `apps/web/src/components/scoring/` — lock indicator + toggle

---

## Implementation Priority Summary

| Phase | Feature | Effort | Impact | Priority |
|-------|---------|--------|--------|----------|
| 1 | Round Library & Score Entry | Large | 🔴 Critical | **P0** |
| 2 | Target Face Plotting | Large | 🔴 Critical | **P0** |
| 3 | Performance Metrics | Medium | 🟡 High | **P1** |
| 4 | Gear Setups & Sight Marks | Medium | 🟡 High | **P1** |
| 5 | Enhanced Journal & Notes | Medium | 🟡 High | **P1** |
| 6 | Coach-Athlete Features | Large | 🟢 Medium | **P2** |
| 7 | Custom Rounds & Locking | Small | 🟢 Medium | **P2** |

---

## Technical Notes

### SVG Target Faces
- Create SVG templates for standard target faces (WA 122cm, 80cm, 60cm, 40cm)
- Multi-spot: render multiple faces on one canvas
- Field/3D: different scoring zones
- Store as template strings or static SVG files

### Plotting Coordinates
- Store arrow positions as normalized coordinates (0-1 relative to target center)
- Convert to pixel coordinates for rendering
- This allows resolution-independent plotting

### Round Data Sources
- WA rounds: published in WA rulebook
- AGB rounds: published on archerygb.org
- NFAA rounds: published on nfaausa.com
- Consider community contribution for round data

### Offline Considerations
- Target face SVGs should be cached by service worker
- Score entry should work offline (already have offline-first pattern)
- Sync plotted arrows when back online
