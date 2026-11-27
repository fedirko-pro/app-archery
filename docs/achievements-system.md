# Sokil Achievement System

## Overview

The Sokil achievement system is a **40-achievement progressive track system** designed for archery training. Achievements are organized into 5 branches with explicit dependency chains (`parentIds`), supporting both offline evaluation and server-verified unlocks.

## Architecture

### Evaluation Modes

| Mode | Description | Examples |
|------|-------------|----------|
| `client_offline` | Evaluated immediately on the client when a session/equipment/score is saved in IndexedDB. Unlock events are queued in the sync outbox. | All onboarding, discipline, endurance, fieldcraft achievements |
| `server_verified` | Evaluated exclusively on the backend upon tournament approval, admin grant, or official competition score verification. Pushed to client on sync. | `competitor`, `seasoned-competitor`, `tournament-champion`, `personal-best` |

### Retroactive Unlock Pass

On login/migration, the system runs an idempotent backfill/re-evaluation check (`runRetroactiveUnlockCheck`) so existing users automatically unlock newly added milestones (e.g., `distance-100km`, `bow-switch`) if their historical stats already meet the criteria.

---

## Branch Structure

### 1. Onboarding (4 achievements)
Entry-level achievements for new users.

| ID | Title | Rarity | Tier | Prerequisites | Metric / Target |
|----|-------|--------|------|---------------|-----------------|
| `first-session` | First Steps | Common | 1 | — | `sessionsTotal ≥ 1` |
| `first-equipment` | Gear Up | Common | 2 | — | `equipmentSetsUsed ≥ 1` |
| `profile-complete` | Identity Set | Common | 3 | — | `profileComplete = true` |
| `offline-session` | Off-Grid Archer | Common | 4 | `first-session` | Session completed offline & synced |

---

### 2. Discipline — Consistency Streaks (5 achievements)
Progressive weekly training streak requirements.

| ID | Title | Rarity | Tier | Prerequisites | Metric / Target |
|----|-------|--------|------|---------------|-----------------|
| `streak-2-weeks` | Warming Up | Common | 1 | — | `streakWeeksBest ≥ 2` |
| `streak-4-weeks` | Steady Archer | Rare | 2 | `streak-2-weeks` | `streakWeeksBest ≥ 4` |
| `streak-12-weeks` | Iron Routine | Epic | 3 | `streak-4-weeks` | `streakWeeksBest ≥ 12` |
| `streak-26-weeks` | Year-Round Archer | Epic | 4 | `streak-12-weeks` | `streakWeeksBest ≥ 26` |
| `streak-52-weeks` | One-Year Archer | Legendary | 5 | `streak-26-weeks` | `streakWeeksBest ≥ 52` |

> **Note**: `streak-26-weeks` was changed from Legendary to Epic to make room for the new Legendary `streak-52-weeks`.

---

### 3. Endurance — Cumulative Volume (19 achievements)
Four parallel subtracks tracking different aspects of training volume.

#### 3.1 Arrows Subtrack (4)
| ID | Title | Rarity | Tier | Prerequisites | Metric / Target |
|----|-------|--------|------|---------------|-----------------|
| `arrows-500` | Arrow Apprentice | Common | 1 | — | `shotsTotal ≥ 500` |
| `arrows-2500` | Arrow Adept | Rare | 2 | `arrows-500` | `shotsTotal ≥ 2,500` |
| `arrows-10000` | Arrow Veteran | Epic | 3 | `arrows-2500` | `shotsTotal ≥ 10,000` |
| `arrows-25000` | Arrow Legend | Legendary | 4 | `arrows-10000` | `shotsTotal ≥ 25,000` |

#### 3.2 Sessions Subtrack (4)
| ID | Title | Rarity | Tier | Prerequisites | Metric / Target |
|----|-------|--------|------|---------------|-----------------|
| `sessions-10` | Regular Practice | Common | 1 | — | `sessionsTotal ≥ 10` |
| `sessions-50` | Dedicated Archer | Rare | 2 | `sessions-10` | `sessionsTotal ≥ 50` |
| `sessions-150` | Training Devotee | Epic | 3 | `sessions-50` | `sessionsTotal ≥ 150` |
| `sessions-500` | Range Regular | Legendary | 4 | `sessions-150` | `sessionsTotal ≥ 500` |

#### 3.3 Distance Subtrack (7) — Walking to/from targets
| ID | Title | Rarity | Tier | Prerequisites | Metric / Target |
|----|-------|--------|------|---------------|-----------------|
| `distance-10km` | Range Walker | Common | 1 | — | `metersTraveledTotal ≥ 10,000` |
| `distance-marathon` | Marathoner | Rare | 2 | `distance-10km` | `metersTraveledTotal ≥ 42,195` |
| `distance-100km` | Century Strider | Rare | 3 | `distance-marathon` | `metersTraveledTotal ≥ 100,000` |
| `distance-250km` | Trailblazer | Epic | 4 | `distance-100km` | `metersTraveledTotal ≥ 250,000` |
| `distance-500km` | Wayfarer | Epic | 5 | `distance-250km` | `metersTraveledTotal ≥ 500,000` |
| `distance-1000km` | Thousand-League Boots | Epic | 6 | `distance-500km` | `metersTraveledTotal ≥ 1,000,000` |
| `distance-there-and-back` | There and Back Again | Legendary | 7 | `distance-1000km` | `metersTraveledTotal ≥ 3,000,000` |

> **Pacing**: Stepping stones toward the 3,000 km legendary goal (Bilbo's round trip).

#### 3.4 Weight Subtrack (4) — Cumulative draw weight lifted
| ID | Title | Rarity | Tier | Prerequisites | Metric / Target |
|----|-------|--------|------|---------------|-----------------|
| `lift-1t` | Iron Arms | Common | 1 | — | `kilogramsLifted ≥ 1,000` |
| `lift-elephant` | Lift the Elephant | Rare | 2 | `lift-1t` | `kilogramsLifted ≥ 6,000` |
| `lift-blue-whale` | Lift the Blue Whale | Epic | 3 | `lift-elephant` | `kilogramsLifted ≥ 150,000` |
| `lift-kiloton` | Kiloton Archer | Legendary | 4 | `lift-blue-whale` | `kilogramsLifted ≥ 1,000,000` |

---

### 4. Fieldcraft — Exploration (6 achievements)
Diversity in distances, target types, equipment, and bow styles.

| ID | Title | Rarity | Tier | Prerequisites | Metric / Target |
|----|-------|--------|------|---------------|-----------------|
| `distances-3` | Distance Explorer | Common | 1 | — | `distinctDistances ≥ 3` |
| `distances-5` | Range Rover | Rare | 2 | `distances-3` | `distinctDistances ≥ 5` |
| `target-types-3` | Target Variety | Common | 3 | — | `distinctTargetTypes ≥ 3` |
| `field-or-3d` | Into the Wild | Rare | 4 | `target-types-3` | `fieldOr3dSessions ≥ 1` |
| `bow-switch` | Quiver Explorer | Common | 5 | `first-equipment` | `distinctEquipmentSets ≥ 2` |
| `style-versatility` | Style Shifter | Rare | 6 | `bow-switch` | `distinctBowStyles ≥ 2` |

---

### 5. Arena — Tournaments & Mastery (7 achievements)
Competition participation and performance milestones.

| ID | Title | Rarity | Tier | Prerequisites | Metric / Target | Mode |
|----|-------|--------|------|---------------|-----------------|------|
| `first-application` | On the Start List | Common | 1 | `profile-complete` | `applicationsSubmitted ≥ 1` | client_offline |
| `competitor` | Competitor | Rare | 2 | `first-application` | `applicationsApproved ≥ 1` | server_verified |
| `seasoned-competitor` | Seasoned Competitor | Epic | 3 | `competitor` | `applicationsApproved ≥ 5` | server_verified |
| `tournament-champion` | Tournament Champion | Legendary | 4 | `seasoned-competitor` | Admin grant / tournament win | server_verified |
| `scored-sessions-5` | Score Tracker | Rare | 5 | — | `scoredSessions ≥ 5` | client_offline |
| `clean-end` | Tight Grouping | Rare | 6 | `scored-sessions-5` | `maxScoringRingEnds ≥ 1` | client_offline |
| `personal-best` | Personal Best | Epic | 7 | `scored-sessions-5` | Competition PB set | server_verified |

---

## UI Implementation

### Vertical Progressive Spine (Mobile-First)

```
┌─────────────────────────────────────────────┐
│ Header: X / 40 achievements, progress bar  │
├─────────────────────────────────────────────┤
│ Branch Tabs: [Onboarding] [Discipline]      │
│              [Endurance] [Fieldcraft] [Arena]│
├─────────────────────────────────────────────┤
│ Endurance Subtabs (when Endurance active):  │
│ [Arrows] [Sessions] [Distance] [Weight]     │
├─────────────────────────────────────────────┤
│ Vertical Spine List:                        │
│  ● ┌─ First Steps (earned) ───────────── ●  │
│  │  │  🏹  Warming Up (in-progress)  78%  │  │
│  │  │  🔒  Steady Archer (locked)       │  │
│  │  │  🔒  Iron Routine (locked)        │  │
│  └──┴─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

- **2px vertical spine line** on the left (solid colored with rarityHex when unlocked, dashed muted slate when locked)
- **Unlocked**: Full-color 56×56 badge, title, unlock date, rarity pill, share button
- **In-Progress** (next locked node): Highlighted border, dimmed badge, live progress bar (current/target)
- **Locked Future**: Desaturated silhouette badge, muted title, target criteria label
- **Detail bottom sheet** on tap: 512×512 badge, full description, prerequisite status, share/preview

---

## Asset Structure

Each achievement has three asset URLs generated at build time:

| Asset | Size | Purpose |
|-------|------|---------|
| `badge512` | 512×512 | Detail view, high-res display |
| `thumb256` | 256×256 | List view, notifications |
| `ogCard1200` | 1200×630 | Open Graph sharing, social cards |

Path pattern: `/assets/achievements/{id}_512.png`, `{id}_256.png`, `{id}_og.jpg`

---

## API Integration

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /users/me/achievements` | Get all achievements for current user (with sync) |
| `POST /users/me/achievements/sync` | Trigger sync of computed achievements |
| `GET /users/public/:userId/achievements` | Public view of user's achievements |
| `GET /users/public/:userId/achievements/:achievementId` | Public achievement share page |
| `POST /admin/users/:userId/achievements/:achievementId/grant` | Admin grant (server_verified only) |

### Data Structures

**AchievementProgressDto** (client-facing):
```typescript
interface AchievementProgressDto {
  id: string;
  branch: 'onboarding' | 'discipline' | 'endurance' | 'fieldcraft' | 'arena';
  subtrack?: 'arrows' | 'sessions' | 'distance' | 'weight';
  tier: number;
  parentIds: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rarityHex: string;
  evaluationMode: 'client_offline' | 'server_verified';
  icon: string;
  shareImage?: string;
  titleKey: string;
  descriptionKey: string;
  earned: boolean;
  progress: number;
  current?: number;
  threshold?: number;
  earnedAt?: string | null;
  source?: 'computed' | 'granted';
  prerequisitesMet?: boolean;
  badge512?: string;
  thumb256?: string;
  ogCard1200?: string;
}
```

---

## Offline Support

1. **Immediate evaluation**: When a session/equipment/score is saved to IndexedDB, `client_offline` achievements are re-evaluated locally.
2. **Sync outbox**: Newly unlocked achievements are queued for backend persistence.
3. **Background sync**: On network restoration, outbox is flushed; backend confirms and pushes updated `earnedAt` timestamps.
4. **Conflict resolution**: Backend is authoritative for `server_verified` achievements; `client_offline` are idempotent (upsert on `user_id + achievement_id`).

---

## Adding New Achievements

1. Add definition to `ACHIEVEMENT_CATALOG` in `packages/shared-types/src/achievements.ts`
2. Ensure `parentIds` forms a valid DAG (no cycles)
3. Add translation keys to all locale files (`apps/web/src/locales/*/common.json`)
4. Add test cases in `apps/web/src/utils/achievements-local.test.ts`
5. Run `pnpm typecheck` and `pnpm test:run`

---

## Quick Reference: All 40 Achievements

| # | ID | Branch | Subtrack | Tier | Rarity |
|---|----|--------|----------|------|--------|
| 1 | `first-session` | onboarding | — | 1 | Common |
| 2 | `first-equipment` | onboarding | — | 2 | Common |
| 3 | `profile-complete` | onboarding | — | 3 | Common |
| 4 | `offline-session` | onboarding | — | 4 | Common |
| 5 | `streak-2-weeks` | discipline | — | 1 | Common |
| 6 | `streak-4-weeks` | discipline | — | 2 | Rare |
| 7 | `streak-12-weeks` | discipline | — | 3 | Epic |
| 8 | `streak-26-weeks` | discipline | — | 4 | Epic |
| 9 | `streak-52-weeks` | discipline | — | 5 | Legendary |
| 10 | `arrows-500` | endurance | arrows | 1 | Common |
| 11 | `arrows-2500` | endurance | arrows | 2 | Rare |
| 12 | `arrows-10000` | endurance | arrows | 3 | Epic |
| 13 | `arrows-25000` | endurance | arrows | 4 | Legendary |
| 14 | `sessions-10` | endurance | sessions | 1 | Common |
| 15 | `sessions-50` | endurance | sessions | 2 | Rare |
| 16 | `sessions-150` | endurance | sessions | 3 | Epic |
| 17 | `sessions-500` | endurance | sessions | 4 | Legendary |
| 18 | `distance-10km` | endurance | distance | 1 | Common |
| 19 | `distance-marathon` | endurance | distance | 2 | Rare |
| 20 | `distance-100km` | endurance | distance | 3 | Rare |
| 21 | `distance-250km` | endurance | distance | 4 | Epic |
| 22 | `distance-500km` | endurance | distance | 5 | Epic |
| 23 | `distance-1000km` | endurance | distance | 6 | Epic |
| 24 | `distance-there-and-back` | endurance | distance | 7 | Legendary |
| 25 | `lift-1t` | endurance | weight | 1 | Common |
| 26 | `lift-elephant` | endurance | weight | 2 | Rare |
| 27 | `lift-blue-whale` | endurance | weight | 3 | Epic |
| 28 | `lift-kiloton` | endurance | weight | 4 | Legendary |
| 29 | `distances-3` | fieldcraft | — | 1 | Common |
| 30 | `distances-5` | fieldcraft | — | 2 | Rare |
| 31 | `target-types-3` | fieldcraft | — | 3 | Common |
| 32 | `field-or-3d` | fieldcraft | — | 4 | Rare |
| 33 | `bow-switch` | fieldcraft | — | 5 | Common |
| 34 | `style-versatility` | fieldcraft | — | 6 | Rare |
| 35 | `first-application` | arena | — | 1 | Common |
| 36 | `competitor` | arena | — | 2 | Rare |
| 37 | `seasoned-competitor` | arena | — | 3 | Epic |
| 38 | `tournament-champion` | arena | — | 4 | Legendary |
| 39 | `scored-sessions-5` | arena | — | 5 | Rare |
| 40 | `clean-end` | arena | — | 6 | Rare |
| 41 | `personal-best` | arena | — | 7 | Epic |

> Total: 40 achievements (4 onboarding + 5 discipline + 19 endurance + 6 fieldcraft + 6 arena = 40)
> - Original catalog: 31 achievements
> - Added 9 new: `streak-52-weeks`, `distance-100km`, `distance-500km`, `distance-1000km`, `offline-session`, `bow-switch`, `style-versatility`, `field-or-3d`, `clean-end`
> - Note: `personal-best` and `tournament-champion` were already in the original catalog (event-type), `scored-sessions-5` was in original, `first-application` and `competitor` and `seasoned-competitor` were in original