# Sokil Refocus Plan: Federation → Archer-Centered UX

> Planning document for step-by-step implementation.  
> Goal: reposition Sokil from a federation-first tournament platform to an **archer-first training companion**, while keeping organizer/federation tools available for roles that need them.

---

## 3. Implementation Phases

### Phase B — The Daily Archer Loop

_Core product value. Highest priority after Phase A._

#### B2. Richer session model

Plan fields in tiers:

| Tier  | Fields                                             | Purpose         |
| ----- | -------------------------------------------------- | --------------- |
| MVP+  | Score total, ends × arrows, notes, mood/conditions | See improvement |
| Next  | Per-end scores, grouping size, indoor/outdoor      | Accuracy trends |
| Later | Photo of target, coach notes                       | Deep analysis   |

- [ ] Extend `LocalTrainingSession` type and storage schema
- [ ] Update form UI with progressive disclosure (basic vs detailed)
- [ ] Migration for existing local/server data
- [ ] Statistics: average score, best session, score trend by distance

#### B4. Connect achievements to real data

Achievements should derive from existing statistics:

| Achievement                | Data source                    |
| -------------------------- | ------------------------------ |
| First training logged      | `trainingSessions.length >= 1` |
| 4-week streak              | `currentStreakWeeks >= 4`      |
| 1,000 arrows lifetime      | `shots.total >= 1000`          |
| 5 different distances      | unique distances in sessions   |
| First approved application | application stats API          |

- [ ] Remove hardcoded demo earned states from `achievements.tsx`
- [ ] Compute progress from `local-data-context` + API
- [ ] Show locked achievements with real progress bars only
- [ ] Remove “(Demo)” from nav label when wired

#### B5. Share my progress

- [ ] Shareable card: weekly arrows, streak, optional anonymized stats
- [ ] Wire existing share button on achievements to real data

---

### Phase D — Tournaments from the Archer’s Lens

_Reframe, don’t remove._

#### D1. “My season” view

- [ ] Combined timeline: applications status, upcoming events, past results, fees
- [ ] Replaces scattered Applications + Payments demo + Tournaments list for archers

#### D2. Tournament discovery for archers

- [ ] Dashboard section: “Open for registration” filtered by profile categories
- [ ] Location-aware filtering (if profile has location)

#### D3. Application flow tied to profile

- [ ] Pre-fill category, division, equipment from profile + equipment sets

#### D4. Post-tournament archer moment

- [ ] After event: prompt to log “competition session” linked to tournament ID

---

### Phase E — Knowledge & Tools (Supporting)

#### E1. Merge encyclopedia + converter + rules

- [ ] Single “Archery reference” hub
- [ ] Unit converter, glossary (GPP/GPI), links to rules PDFs
- [ ] Remove from main nav; link from training form contextually
- [ ] Replace or finish WIP `Encyclopedia.tsx` stub

#### E2. Scoring card

- [ ] **Option A:** Integrate into training/competition session logging
- [ ] **Option B:** Move to “Labs / Coming soon” until real
- [ ] Remove from main hamburger nav while demo

#### E3. Payments

- [ ] **Option A:** Connect to real tournament entry fees
- [ ] **Option B:** Remove from user menu until real
- [ ] Do not show demo in primary nav

---

### Phase F — Profile & Identity for Archers

#### F1. Progressive profile fields

| User type   | Show                                | De-emphasize      |
| ----------- | ----------------------------------- | ----------------- |
| Hobby       | Location, bow type, club (optional) | Federation number |
| Competitive | + federation number, divisions      | —                 |

- [ ] Onboarding “who are you?” drives which fields appear
- [ ] Federation number optional, not required in UI

#### F2. Profile as progress snapshot

- [ ] Header stats from statistics: streak, total arrows, member since

#### F3. Club as affiliation

- [ ] “My club” on profile vs full clubs directory under More

---

## 4. Suggested Implementation Order

```
Phase A (Quick wins)     ──► 1–2 sprints
  A1 Dashboard
  A2 Nav restructure
  A3 Copy / About / README
  A4 Role-aware nav

Phase B (Core loop)      ──► ~1 quarter
  B1 Quick-log
  B4 Real achievements (can parallel with B1)
  C2 Sync onboarding
  B2 Session scores (MVP+ tier)
  B3 Equipment inline flow

Phase C (Retention)      ──► overlap with B
  C1 Onboarding wizard
  C3 Empty states

Phase D (Tournaments)    ──► after B stable
  D1 My season
  D2 Discovery
  D3 Application pre-fill

Phase E & F              ──► polish / later
  Reference hub merge
  Profile progressive fields
  Scoring / payments decision
```

---

## 5. Metrics to Track the Pivot

| Metric                                                  | Why                           |
| ------------------------------------------------------- | ----------------------------- |
| DAU logging ≥1 training / week                          | Core habit                    |
| Time to first training log after signup                 | Onboarding success            |
| % users with sync enabled                               | Trust + retention             |
| Training sessions per user per month                    | Engagement depth              |
| Tournament apply rate                                   | Federation path still healthy |
| Bounce rate on old `/tournaments` landing for new users | IA fix validation             |

---

## 6. Deprioritize (During Refocus)

- Expanding admin/reference CRUD in main navigation
- New federation features before personal loop feels complete
- Demo pages in primary menus without real data
- Federation-first language in hero, About, signup

---

## 7. Key Files Reference

| Area                   | Paths                                               |
| ---------------------- | --------------------------------------------------- |
| Routing / default home | `src/components/Content/Content.tsx`                |
| Post-login redirect    | `src/contexts/auth-context.tsx`                     |
| Main nav               | `src/components/NavMenu/NavMenu.tsx`                |
| User menu              | `src/components/UserMenu/UserMenu.tsx`              |
| Training               | `src/pages/MyTrainings/`                            |
| Statistics             | `src/pages/MyStatistics/`                           |
| Equipment              | `src/pages/MyEquipment/`                            |
| Achievements (demo)    | `src/pages/achievements/achievements.tsx`           |
| Local data / sync      | `src/contexts/local-data-context.tsx`               |
| Sync UI                | `src/components/LocalDataBanner/`, `LocalSyncChip/` |
| Profile / sync toggle  | `src/pages/profile/profile-edit-form/`              |
| About copy             | `src/pages/About.tsx`, `src/locales/*/common.json`  |
| Roles                  | `src/config/roles.ts`                               |

---

## 8. Open Decisions (Resolve Before Implementation)

- [ ] Dashboard route name: `/home` vs `/dashboard`
- [ ] Default sync on for new users: yes/no
- [ ] Scoring card: integrate vs defer
- [ ] Payments: build vs hide until real
- [ ] Federation number: optional everywhere vs competitive-only
- [ ] Single “My season” page vs enhanced applications page

---

## 9. Success Criteria

The refocus is successful when:

1. A new archer can sign up, log a training session, and see progress **without discovering the avatar menu**.
2. About page and README describe an archer product first.
3. Achievements reflect real training data (no fake earned badges).
4. Federation admins still have full access via role-aware “Organizer tools.”
5. Demo labels are gone from primary navigation.

---

_Document created for step-by-step implementation. Update checkboxes as work completes._
