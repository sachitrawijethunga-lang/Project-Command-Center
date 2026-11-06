export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed';

export type UrgencyLevel =
  | 'calm'
  | 'early_warning'
  | 'mid_warming'
  | 'late_warning'
  | 'overdue'
  | 'completed';

export interface Person {
  id: string;
  displayName: string;
  roleTitle?: string;
  avatarInitials: string;
  active: boolean;
}

export interface UrgencyCalculation {
  level: UrgencyLevel;
  progress: number; // 0 to 1
  remainingMs: number;
  dueLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder?: string;
  accentColor: string;
  icon: string;
  isOverdue: boolean;
  isDueSoon: boolean; // <48h
  isBlocked: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assigneeId: string;
  dueAtUtc: string; // ISO string with date & time
  warningLeadMinutes: number; // custom warning lead window in minutes
  status: TaskStatus;
  notes?: string;
  completedAt?: string;
  order: number;
  archivedAt?: string;
}

export interface Project {
  id: string;
  categoryId: string;
  name: string;
  ownerId: string;
  description?: string;
  portfolioTrack?: string;
  order: number;
  archivedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  ownerId: string;
  accentColor?: string;
  order: number;
  archivedAt?: string;
}

export interface BoardSettings {
  boardTitle: string;
  timezone: string;
  defaultWarningLeadMinutes: number;
  density: 'spacious' | 'condensed';
  presentationMode: boolean;
}

export interface Snapshot {
  id: string;
  timestamp: string;
  hash: string;
  size: string;
  recordsCount: number;
  schemaVersion: string;
  dataJson?: string;
}

export type CockpitFilter = 'all' | 'attention' | 'overdue' | 'blocked' | 'my';

export type ActiveView = 'command-overview' | 'tasks-urgency-radar' | 'cloud-backups';
