import { Task, UrgencyCalculation, UrgencyLevel } from '../types/cockpit';

/**
 * Normalizes remaining milliseconds into a human-readable countdown or elapsed time
 */
export function formatRemainingTime(remainingMs: number): string {
  const isPast = remainingMs < 0;
  const absMs = Math.abs(remainingMs);
  const minutes = Math.floor(absMs / (60 * 1000));
  const hours = Math.floor(absMs / (60 * 60 * 1000));
  const days = Math.floor(absMs / (24 * 60 * 60 * 1000));

  if (isPast) {
    if (minutes < 60) {
      return `Overdue by ${Math.max(1, minutes)}m`;
    }
    if (hours < 24) {
      return `Overdue by ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`;
  }

  if (minutes < 60) {
    return `Due in ${Math.max(1, minutes)}m`;
  }
  if (hours < 24) {
    return `Due in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  if (days <= 30) {
    return `Due in ${days} ${days === 1 ? 'day' : 'days'}`;
  }
  return `Due in ${days} days`;
}

/**
 * Formats a UTC ISO string into board local date/time representation
 */
export function formatBoardDateTime(isoString: string, timezone = 'Asia/Colombo'): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Evaluates urgency status and visual tokens based on Section 6 of the PRD
 */
export function calculateUrgency(
  task: Pick<Task, 'dueAtUtc' | 'warningLeadMinutes' | 'status' | 'completedAt'>,
  nowUtc: Date = new Date(),
  timezone = 'Asia/Colombo'
): UrgencyCalculation {
  const isBlocked = task.status === 'blocked';

  // 1. Completed state overrides urgency
  if (task.status === 'completed') {
    const completedLabel = task.completedAt
      ? `Completed at ${formatBoardDateTime(task.completedAt, timezone)}`
      : 'Completed';

    return {
      level: 'completed',
      progress: 1,
      remainingMs: 0,
      dueLabel: completedLabel,
      badgeBg: 'bg-[#1b6d42]/15',
      badgeText: 'text-[#1b6d42]',
      badgeBorder: 'border border-[#1b6d42]/30',
      accentColor: '#1b6d42',
      icon: 'verified',
      isOverdue: false,
      isDueSoon: false,
      isBlocked,
    };
  }

  const dueTime = new Date(task.dueAtUtc).getTime();
  const currentTime = nowUtc.getTime();
  const remainingMs = dueTime - currentTime;

  // 2. Overdue: deadline has elapsed and not completed
  if (remainingMs < 0) {
    return {
      level: 'overdue',
      progress: 1,
      remainingMs,
      dueLabel: formatRemainingTime(remainingMs),
      badgeBg: 'bg-[#941313]',
      badgeText: 'text-white',
      badgeBorder: 'border border-[#941313]',
      accentColor: '#941313',
      icon: 'report',
      isOverdue: true,
      isDueSoon: true,
      isBlocked,
    };
  }

  const leadMinutes = Math.max(1, task.warningLeadMinutes || 10080); // default 7 days = 10080 min
  const leadMs = leadMinutes * 60 * 1000;
  const isDueSoon = remainingMs <= 48 * 60 * 60 * 1000; // <48 hours

  // 3. Before Warning Window (remainingMs > leadMs): Calm
  if (remainingMs > leadMs) {
    return {
      level: 'calm',
      progress: 0,
      remainingMs,
      dueLabel: `Due ${formatBoardDateTime(task.dueAtUtc, timezone)}`,
      badgeBg: 'bg-[#eceef1]',
      badgeText: 'text-[#566b7c]',
      badgeBorder: 'border border-[#dfe7ec]',
      accentColor: '#0b7d83',
      icon: 'calendar_today',
      isOverdue: false,
      isDueSoon,
      isBlocked,
    };
  }

  // 4. Inside Warning Window: calculate progress
  // Progress = clamp(1 - remainingMs / leadMs, 0, 1)
  const progress = Math.min(1, Math.max(0, 1 - remainingMs / leadMs));
  const countdownText = formatRemainingTime(remainingMs);

  // 0% - 40% elapsed: Early Warning (Warm Gold)
  if (progress < 0.4) {
    return {
      level: 'early_warning',
      progress,
      remainingMs,
      dueLabel: countdownText,
      badgeBg: 'bg-[#c68a1b]/15',
      badgeText: 'text-[#c68a1b]',
      badgeBorder: 'border border-[#c68a1b]/30',
      accentColor: '#c68a1b',
      icon: 'hourglass_top',
      isOverdue: false,
      isDueSoon,
      isBlocked,
    };
  }

  // 40% - 75% elapsed: Mid Warming (Amber)
  if (progress < 0.75) {
    return {
      level: 'mid_warming',
      progress,
      remainingMs,
      dueLabel: countdownText,
      badgeBg: 'bg-[#d96520]/15',
      badgeText: 'text-[#d96520]',
      badgeBorder: 'border border-[#d96520]/30',
      accentColor: '#d96520',
      icon: 'schedule',
      isOverdue: false,
      isDueSoon,
      isBlocked,
    };
  }

  // 75% - 100% elapsed: Late Warning (Signal Red)
  return {
    level: 'late_warning',
    progress,
    remainingMs,
    dueLabel: countdownText,
    badgeBg: 'bg-[#d32f2f]/15',
    badgeText: 'text-[#d32f2f]',
    badgeBorder: 'border border-[#d32f2f]/30',
    accentColor: '#d32f2f',
    icon: 'alarm',
    isOverdue: false,
    isDueSoon: true,
    isBlocked,
  };
}
