# 🎨 FRONTEND TASK (React + pragmatic-drag-and-drop)

## Context
Візуальний інтерфейс для перегляду і редагування патрулів. Після генерації на backend, користувач може перетягувати учасників між патрулями, змінювати лідерів і суддів.

## Technical Requirements

### Tech Stack
- React (hooks)
- pragmatic-drag-and-drop (@atlaskit/pragmatic-drag-and-drop)
- API calls до backend (fetch or axios)
- CSS/Tailwind for styling

### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ Tournament: XI Prova - Category: FSC                    │
│ [Save Changes] [Export PDF] [Regenerate]                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Stats:                                                  │
│ ✅ Club diversity: 85% (15/18 patrols)                  │
│ ✅ Age homogeneity: 90% (16/18 patrols)                 │
│ ⚠️  Gender homogeneity: 60% (11/18 patrols)             │
│ ℹ️  Average patrol size: 5.6 members                    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ PATROL 1 (Target #1) - 5 members                       │
│ 👑 Leader: João Silva                                   │
│ ⚖️  Judges: Maria (Club B), Pedro (Club C)              │
│                                                         │
│ [Draggable cards:]                                      │
│ ┌──────────────────────────────────┐                   │
│ │ 👤 João Silva          🟢 Adult M│                   │
│ │ Club A                 [👑][⚖️]   │                   │
│ └──────────────────────────────────┘                   │
│ │ 👤 Maria Santos        🟢 Adult F│                   │
│ │ Club B                 [⚖️]       │                   │
│ └──────────────────────────────────┘                   │
│ ... more members                                        │
│                                                         │
│ ⚠️ Warning: Mixed age groups                            │
└─────────────────────────────────────────────────────────┘
... more patrols (18 total in grid layout)
```

### Data Structures

```typescript
interface Participant {
  id: string;
  name: string;
  club: string;
  age: string;      // 'cub', 'junior', 'adult', 'veteran'
  gender: string;   // 'm', 'f', 'other'
}

interface Patrol {
  id: string;
  targetNumber: number;  // 1-18
  members: string[];     // participant IDs
  leaderId: string;
  judgeIds: [string, string];
}

interface AppState {
  patrols: Patrol[];
  participants: Map<string, Participant>;  // id → participant
  isDirty: boolean;
  validationWarnings: Warning[];
  isLoading: boolean;
}

interface Warning {
  patrolId: string;
  type: 'same-club-judges' | 'mixed-ages' | 'mixed-genders' | 'size-imbalance';
  message: string;
  severity: 'error' | 'warning' | 'info';
}
```

### Components to Implement

#### 1. `PatrolsPage` (main container)

**Location:** `src/pages/PatrolsPage.jsx` or `PatrolsPage.tsx`

**Props:** 
```typescript
interface PatrolsPageProps {
  tournamentId: string;
  category: string;
}
```

**State:**
```javascript
const [patrols, setPatrols] = useState<Patrol[]>([]);
const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
const [isDirty, setIsDirty] = useState(false);
const [warnings, setWarnings] = useState<Warning[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [stats, setStats] = useState(null);
```

**Component structure:**
```jsx
function PatrolsPage({ tournamentId, category }) {
  // State declarations
  
  // Load patrols on mount
  useEffect(() => {
    loadPatrols();
  }, [tournamentId, category]);
  
  // Recalculate warnings when patrols change
  useEffect(() => {
    const newWarnings = recalculateWarnings(patrols, participants);
    setWarnings(newWarnings);
  }, [patrols, participants]);
  
  async function loadPatrols() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/categories/${category}/patrols`
      );
      const data = await response.json();
      
      setPatrols(data.patrols);
      
      // Convert participants array to Map
      const participantsMap = new Map();
      data.patrols.forEach(patrol => {
        patrol.members.forEach(memberId => {
          // Assume participants data is included or fetch separately
          participantsMap.set(memberId, ...);
        });
      });
      setParticipants(participantsMap);
      
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load patrols:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleSave() {
    try {
      await fetch(
        `/api/tournaments/${tournamentId}/categories/${category}/patrols`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patrols })
        }
      );
      setIsDirty(false);
      // Show success toast
    } catch (error) {
      console.error('Failed to save:', error);
      // Show error toast
    }
  }
  
  function handleMemberDrop(memberId, sourcePatrolId, targetPatrolId) {
    // Validate move
    const validation = canDropMember(memberId, sourcePatrolId, targetPatrolId);
    
    if (!validation.allowed) {
      alert(validation.reason);
      return;
    }
    
    // Update patrols
    const newPatrols = patrols.map(patrol => {
      if (patrol.id === sourcePatrolId) {
        return {
          ...patrol,
          members: patrol.members.filter(id => id !== memberId),
          // If moved member was leader/judge, need to reassign
          leaderId: patrol.leaderId === memberId ? null : patrol.leaderId,
          judgeIds: patrol.judgeIds.filter(id => id !== memberId)
        };
      }
      if (patrol.id === targetPatrolId) {
        return {
          ...patrol,
          members: [...patrol.members, memberId]
        };
      }
      return patrol;
    });
    
    setPatrols(newPatrols);
    setIsDirty(true);
    
    // Show warnings if any
    if (validation.warnings?.length > 0) {
      // Display warnings to user
    }
  }
  
  function handleRoleChange(patrolId, memberId, role) {
    const newPatrols = patrols.map(patrol => {
      if (patrol.id !== patrolId) return patrol;
      
      if (role === 'leader') {
        return { ...patrol, leaderId: memberId };
      }
      
      if (role === 'judge') {
        // Add to judges (max 2)
        if (patrol.judgeIds.length < 2) {
          return { 
            ...patrol, 
            judgeIds: [...patrol.judgeIds, memberId]
          };
        }
      }
      
      if (role === 'remove') {
        return {
          ...patrol,
          leaderId: patrol.leaderId === memberId ? null : patrol.leaderId,
          judgeIds: patrol.judgeIds.filter(id => id !== memberId)
        };
      }
      
      return patrol;
    });
    
    setPatrols(newPatrols);
    setIsDirty(true);
  }
  
  function handleExportPDF() {
    window.open(
      `/api/tournaments/${tournamentId}/categories/${category}/patrols/pdf`,
      '_blank'
    );
  }
  
  async function handleRegenerate() {
    if (!confirm('This will discard all changes. Continue?')) {
      return;
    }
    
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/categories/${category}/patrols/generate`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      setPatrols(data.patrols);
      setStats(data.stats);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to regenerate:', error);
    }
  }
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="patrols-page">
      <header className="page-header">
        <h1>Tournament: {tournamentId} - Category: {category}</h1>
        <div className="actions">
          <button onClick={handleSave} disabled={!isDirty}>
            Save Changes {isDirty && '*'}
          </button>
          <button onClick={handleExportPDF}>Export PDF</button>
          <button onClick={handleRegenerate}>Regenerate</button>
        </div>
      </header>
      
      <StatsPanel stats={stats} patrols={patrols} participants={participants} />
      
      <div className="patrols-grid">
        {patrols.map(patrol => (
          <PatrolCard
            key={patrol.id}
            patrol={patrol}
            participants={participants}
            warnings={warnings.filter(w => w.patrolId === patrol.id)}
            onMemberDrop={handleMemberDrop}
            onRoleChange={handleRoleChange}
          />
        ))}
      </div>
    </div>
  );
}
```

#### 2. `PatrolCard` (single patrol display)

**Location:** `src/components/PatrolCard.jsx`

**Props:**
```typescript
interface PatrolCardProps {
  patrol: Patrol;
  participants: Map<string, Participant>;
  warnings: Warning[];
  onMemberDrop: (memberId: string, targetPatrolId: string) => void;
  onRoleChange: (patrolId: string, memberId: string, role: string) => void;
}
```

**Component:**
```jsx
import { useRef, useEffect } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import MemberCard from './MemberCard';

function PatrolCard({ patrol, participants, warnings, onMemberDrop, onRoleChange }) {
  const dropZoneRef = useRef(null);
  
  // Setup drop zone
  useEffect(() => {
    const el = dropZoneRef.current;
    if (!el) return;
    
    return dropTargetForElements({
      element: el,
      onDrop: ({ source }) => {
        const { memberId, sourcePatrolId } = source.data;
        onMemberDrop(memberId, sourcePatrolId, patrol.id);
      },
      getData: () => ({ patrolId: patrol.id }),
      canDrop: ({ source }) => {
        // Don't allow drop from same patrol
        return source.data.sourcePatrolId !== patrol.id;
      }
    });
  }, [patrol.id, onMemberDrop]);
  
  const leader = participants.get(patrol.leaderId);
  const judges = patrol.judgeIds.map(id => participants.get(id));
  
  return (
    <div className="patrol-card">
      <div className="patrol-header">
        <h3>PATROL {patrol.targetNumber}</h3>
        <span className="member-count">{patrol.members.length} members</span>
      </div>
      
      <div className="patrol-roles">
        <div className="role-item">
          👑 Leader: {leader?.name || 'Not assigned'}
        </div>
        <div className="role-item">
          ⚖️ Judges: 
          {judges[0] ? ` ${judges[0].name} (${judges[0].club})` : ' Not assigned'}
          {judges[1] ? `, ${judges[1].name} (${judges[1].club})` : ''}
        </div>
      </div>
      
      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((warning, idx) => (
            <div key={idx} className={`warning warning-${warning.severity}`}>
              ⚠️ {warning.message}
            </div>
          ))}
        </div>
      )}
      
      <div className="patrol-members" ref={dropZoneRef}>
        {patrol.members.map(memberId => {
          const participant = participants.get(memberId);
          if (!participant) return null;
          
          return (
            <MemberCard
              key={memberId}
              participant={participant}
              patrolId={patrol.id}
              isLeader={patrol.leaderId === memberId}
              isJudge={patrol.judgeIds.includes(memberId)}
              onRoleChange={onRoleChange}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PatrolCard;
```

#### 3. `MemberCard` (draggable participant)

**Location:** `src/components/MemberCard.jsx`

**Props:**
```typescript
interface MemberCardProps {
  participant: Participant;
  patrolId: string;
  isLeader: boolean;
  isJudge: boolean;
  onRoleChange: (patrolId: string, memberId: string, role: string) => void;
}
```

**Component:**
```jsx
import { useRef, useEffect, useState } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

function MemberCard({ participant, patrolId, isLeader, isJudge, onRoleChange }) {
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Setup draggable
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;
    
    return draggable({
      element: el,
      getInitialData: () => ({
        type: 'member',
        memberId: participant.id,
        sourcePatrolId: patrolId
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false)
    });
  }, [participant.id, patrolId]);
  
  function handleMakeLeader() {
    onRoleChange(patrolId, participant.id, 'leader');
    setShowMenu(false);
  }
  
  function handleMakeJudge() {
    onRoleChange(patrolId, participant.id, 'judge');
    setShowMenu(false);
  }
  
  function handleRemoveRole() {
    onRoleChange(patrolId, participant.id, 'remove');
    setShowMenu(false);
  }
  
  return (
    <div 
      ref={dragRef}
      className={`member-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="member-info">
        <div className="member-name">
          👤 {participant.name}
          {isLeader && ' 👑'}
          {isJudge && ' ⚖️'}
        </div>
        <div className="member-club">{participant.club}</div>
      </div>
      
      <div className="member-meta">
        <span className={`badge badge-age badge-${participant.age}`}>
          {participant.age}
        </span>
        <span className={`badge badge-gender badge-${participant.gender}`}>
          {participant.gender.toUpperCase()}
        </span>
      </div>
      
      <div className="member-actions">
        <button 
          className="menu-button"
          onClick={() => setShowMenu(!showMenu)}
        >
          ⋮
        </button>
        
        {showMenu && (
          <div className="action-menu">
            {!isLeader && (
              <button onClick={handleMakeLeader}>Make Leader</button>
            )}
            {!isJudge && (
              <button onClick={handleMakeJudge}>Make Judge</button>
            )}
            {(isLeader || isJudge) && (
              <button onClick={handleRemoveRole}>Remove Role</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberCard;
```

#### 4. `StatsPanel` (metrics display)

**Location:** `src/components/StatsPanel.jsx`

**Props:**
```typescript
interface StatsPanelProps {
  stats: {
    totalParticipants: number;
    averagePatrolSize: number;
    clubDiversityScore: number;
    homogeneityScores: {
      age: number;
      gender: number;
    };
  };
  patrols: Patrol[];
  participants: Map<string, Participant>;
}
```

**Component:**
```jsx
function StatsPanel({ stats, patrols, participants }) {
  if (!stats) return null;
  
  const formatPercentage = (value) => `${Math.round(value)}%`;
  
  const getStatusIcon = (value, threshold = 70) => {
    if (value >= threshold) return '✅';
    if (value >= 50) return '⚠️';
    return '❌';
  };
  
  return (
    <div className="stats-panel">
      <h2>Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Total Participants:</span>
          <span className="stat-value">{stats.totalParticipants}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Average Patrol Size:</span>
          <span className="stat-value">
            {stats.averagePatrolSize.toFixed(1)} members
          </span>
        </div>
        
        <div className="stat-item">
          {getStatusIcon(stats.clubDiversityScore, 70)}
          <span className="stat-label">Club Diversity:</span>
          <span className="stat-value">
            {formatPercentage(stats.clubDiversityScore)}
            <span className="stat-detail">
              ({Math.round(patrols.length * stats.clubDiversityScore / 100)}/{patrols.length} patrols)
            </span>
          </span>
        </div>
        
        <div className="stat-item">
          {getStatusIcon(stats.homogeneityScores.age, 80)}
          <span className="stat-label">Age Homogeneity:</span>
          <span className="stat-value">
            {formatPercentage(stats.homogeneityScores.age)}
          </span>
        </div>
        
        <div className="stat-item">
          {getStatusIcon(stats.homogeneityScores.gender, 60)}
          <span className="stat-label">Gender Homogeneity:</span>
          <span className="stat-value">
            {formatPercentage(stats.homogeneityScores.gender)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;
```

### Business Logic Functions

#### Validation: `canDropMember`

**Location:** `src/utils/validation.js`

```javascript
export function canDropMember(memberId, sourcePatrolId, targetPatrolId, patrols, participants) {
  const sourcePatrol = patrols.find(p => p.id === sourcePatrolId);
  const targetPatrol = patrols.find(p => p.id === targetPatrolId);
  const member = participants.get(memberId);
  
  // Hard constraint: source patrol must have >= 4 members after removal
  if (sourcePatrol.members.length <= 3) {
    return {
      allowed: false,
      reason: "Source patrol would be too small (minimum 3 members required)"
    };
  }
  
  // Collect warnings for soft constraints
  const warnings = [];
  
  // Check age homogeneity
  const targetAges = targetPatrol.members
    .map(id => participants.get(id)?.age)
    .filter(Boolean);
  const dominantAge = getMostCommon(targetAges);
  
  if (member.age !== dominantAge) {
    warnings.push(`Member age (${member.age}) differs from patrol's dominant age (${dominantAge})`);
  }
  
  // Check gender homogeneity
  const targetGenders = targetPatrol.members
    .map(id => participants.get(id)?.gender)
    .filter(Boolean);
  const dominantGender = getMostCommon(targetGenders);
  
  if (member.gender !== dominantGender) {
    warnings.push(`Member gender differs from patrol's dominant gender`);
  }
  
  return { allowed: true, warnings };
}

function getMostCommon(arr) {
  if (arr.length === 0) return null;
  const counts = {};
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return Object.keys(counts).reduce((a, b) => 
    counts[a] > counts[b] ? a : b
  );
}
```

#### Warning Calculation: `recalculateWarnings`

**Location:** `src/utils/warnings.js`

```javascript
export function recalculateWarnings(patrols, participants) {
  const warnings = [];
  
  patrols.forEach(patrol => {
    // Check if judges are from same club
    if (patrol.judgeIds.length === 2) {
      const judge1 = participants.get(patrol.judgeIds[0]);
      const judge2 = participants.get(patrol.judgeIds[1]);
      
      if (judge1 && judge2 && judge1.club === judge2.club) {
        warnings.push({
          patrolId: patrol.id,
          type: 'same-club-judges',
          message: 'Judges are from the same club',
          severity: 'warning'
        });
      }
    }
    
    // Check if all judges assigned
    if (patrol.judgeIds.length < 2) {
      warnings.push({
        patrolId: patrol.id,
        type: 'missing-judges',
        message: `Only ${patrol.judgeIds.length} judge(s) assigned`,
        severity: 'error'
      });
    }
    
    // Check if leader assigned
    if (!patrol.leaderId) {
      warnings.push({
        patrolId: patrol.id,
        type: 'missing-leader',
        message: 'No leader assigned',
        severity: 'error'
      });
    }
    
    // Check age homogeneity
    const ages = patrol.members
      .map(id => participants.get(id)?.age)
      .filter(Boolean);
    
    if (new Set(ages).size > 1) {
      warnings.push({
        patrolId: patrol.id,
        type: 'mixed-ages',
        message: 'Mixed age groups in patrol',
        severity: 'info'
      });
    }
    
    // Check gender homogeneity
    const genders = patrol.members
      .map(id => participants.get(id)?.gender)
      .filter(Boolean);
    
    if (new Set(genders).size > 1) {
      warnings.push({
        patrolId: patrol.id,
        type: 'mixed-genders',
        message: 'Mixed genders in patrol',
        severity: 'info'
      });
    }
  });
  
  // Check size imbalance across all patrols
  const sizes = patrols.map(p => p.members.length);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  
  if (maxSize - minSize > 2) {
    patrols.forEach(patrol => {
      if (patrol.members.length === minSize || patrol.members.length === maxSize) {
        warnings.push({
          patrolId: patrol.id,
          type: 'size-imbalance',
          message: `Patrol size (${patrol.members.length}) differs significantly from average`,
          severity: 'info'
        });
      }
    });
  }
  
  return warnings;
}
```

### Styling Suggestions (CSS/Tailwind)

```css
/* src/styles/PatrolsPage.css */

.patrols-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.actions button {
  margin-left: 10px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
}

.actions button:hover {
  background: #f3f4f6;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-panel {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.patrols-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.patrol-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  background: white;
}

.patrol-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.patrol-roles {
  font-size: 14px;
  margin-bottom: 15px;
  color: #6b7280;
}

.warnings {
  margin-bottom: 10px;
}

.warning {
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 5px;
}

.warning-error {
  background: #fee2e2;
  color: #991b1b;
}

.warning-warning {
  background: #fef3c7;
  color: #92400e;
}

.warning-info {
  background: #dbeafe;
  color: #1e40af;
}

.patrol-members {
  min-height: 100px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 6px;
  border: 2px dashed #d1d5db;
}

.member-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
}

.member-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-color: #3b82f6;
}

.member-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.member-club {
  font-size: 12px;
  color: #6b7280;
}

.member-meta {
  display: flex;
  gap: 5px;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.badge-age {
  background: #dbeafe;
  color: #1e40af;
}

.badge-gender {
  background: #fce7f3;
  color: #9f1239;
}

.member-actions {
  position: relative;
}

.menu-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.action-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 10;
  min-width: 150px;
}

.action-menu button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.action-menu button:hover {
  background: #f3f4f6;
}
```

### API Integration

**Location:** `src/api/patrols.js`

```javascript
const API_BASE = '/api';

export async function loadPatrols(tournamentId, category) {
  const response = await fetch(
    `${API_BASE}/tournaments/${tournamentId}/categories/${category}/patrols`
  );
  
  if (!response.ok) {
    throw new Error('Failed to load patrols');
  }
  
  return response.json();
}

export async function savePatrols(tournamentId, category, patrols) {
  const response = await fetch(
    `${API_BASE}/tournaments/${tournamentId}/categories/${category}/patrols`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patrols })
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to save patrols');
  }
  
  return response.json();
}

export async function generatePatrols(tournamentId, category) {
  const response = await fetch(
    `${API_BASE}/tournaments/${tournamentId}/categories/${category}/patrols/generate`,
    { method: 'POST' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to generate patrols');
  }
  
  return response.json();
}

export function getPatrolsPDFUrl(tournamentId, category) {
  return `${API_BASE}/tournaments/${tournamentId}/categories/${category}/patrols/pdf`;
}
```

### Installation Requirements

```bash
npm install @atlaskit/pragmatic-drag-and-drop
```

### Success Criteria

✅ Loads patrols from backend correctly  
✅ Displays all patrols in responsive grid layout  
✅ Drag-and-drop works smoothly between patrols  
✅ Validates moves and shows appropriate error messages  
✅ Shows warnings for soft constraint violations  
✅ Allows role changes (leader, judges) via context menu  
✅ Tracks dirty state and shows indicator for unsaved changes  
✅ Saves changes to backend successfully  
✅ Exports PDF correctly (opens in new tab)  
✅ Displays meaningful statistics  
✅ Responsive UI works on tablets (min 768px)  
✅ Good UX with loading states and error handling  

### Testing Checklist

- [ ] Load patrols on page mount
- [ ] Drag member from patrol A to patrol B
- [ ] Try to drag member from patrol with only 3 members (should fail)
- [ ] Change member to leader role
- [ ] Change member to judge role (max 2 per patrol)
- [ ] Remove role from member
- [ ] Make changes and verify "Save Changes" button enables
- [ ] Save changes successfully
- [ ] Export PDF opens in new tab
- [ ] Regenerate shows confirmation dialog
- [ ] Warnings appear for mixed ages/genders/same club judges
- [ ] Stats panel shows correct percentages

### Mock Data for Development

```javascript
// src/mockData.js

export const mockParticipants = new Map([
  ['1', { id: '1', name: 'João Silva', club: 'Club A', age: 'adult', gender: 'm' }],
  ['2', { id: '2', name: 'Maria Santos', club: 'Club B', age: 'adult', gender: 'f' }],
  ['3', { id: '3', name: 'Pedro Costa', club: 'Club C', age: 'veteran', gender: 'm' }],
  ['4', { id: '4', name: 'Ana Rodrigues', club: 'Club A', age: 'adult', gender: 'f' }],
  ['5', { id: '5', name: 'Carlos Mendes', club: 'Club B', age: 'adult', gender: 'm' }],
  // Add more...
]);

export const mockPatrols = [
  {
    id: 'p1',
    targetNumber: 1,
    members: ['1', '2', '3', '4', '5'],
    leaderId: '1',
    judgeIds: ['2', '3']
  },
  {
    id: 'p2',
    targetNumber: 2,
    members: ['6', '7', '8', '9', '10'],
    leaderId: '6',
    judgeIds: ['7', '8']
  },
  // Add 16 more patrols...
];

export const mockStats = {
  totalParticipants: 100,
  averagePatrolSize: 5.6,
  clubDiversityScore: 85,
  homogeneityScores: {
    age: 90,
    gender: 60
  }
};
```

### Implementation Priority

1. **Phase 1: Basic Display**
   - PatrolsPage component with mock data
   - PatrolCard and MemberCard components
   - Basic styling

2. **Phase 2: Drag & Drop**
   - Implement draggable on MemberCard
   - Implement drop zone on PatrolCard
   - Basic move validation

3. **Phase 3: Role Management**
   - Add action menu to MemberCard
   - Implement role change logic
   - Update UI to show roles

4. **Phase 4: API Integration**
   - Connect to backend endpoints
   - Implement loading/error states
   - Add save functionality

5. **Phase 5: Polish**
   - Add StatsPanel
   - Add warnings system
   - Improve styling and UX
