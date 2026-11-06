import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUrgency, formatRemainingTime } from './urgency';

test('Completed status overrides urgency and suppresses overdue presentation', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  // Task is past deadline, but marked completed
  const result = calculateUrgency(
    {
      dueAtUtc: '2026-11-05T10:00:00Z',
      warningLeadMinutes: 10080,
      status: 'completed',
      completedAt: '2026-11-05T09:00:00Z',
    },
    now
  );

  assert.equal(result.level, 'completed');
  assert.equal(result.isOverdue, false);
  assert.equal(result.accentColor, '#1b6d42');
});

test('Overdue task (< 0ms remaining) returns high-contrast overdue state', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  const result = calculateUrgency(
    {
      dueAtUtc: '2026-11-06T10:00:00Z', // 2 hours ago
      warningLeadMinutes: 10080,
      status: 'in_progress',
    },
    now
  );

  assert.equal(result.level, 'overdue');
  assert.equal(result.isOverdue, true);
  assert.equal(result.dueLabel, 'Overdue by 2 hours');
  assert.equal(result.accentColor, '#941313');
});

test('Task before warning window returns calm state', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  // Due in 10 days, warning lead is 3 days (4320 mins)
  const result = calculateUrgency(
    {
      dueAtUtc: '2026-11-16T12:00:00Z',
      warningLeadMinutes: 4320,
      status: 'not_started',
    },
    now
  );

  assert.equal(result.level, 'calm');
  assert.equal(result.progress, 0);
  assert.equal(result.isOverdue, false);
});

test('AT-04: Per-task urgency with different warning windows (14d vs 1d)', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  const dueIn5Days = '2026-11-11T12:00:00Z';

  // Task A: 14 days warning lead (20160 minutes).
  // Elapsed = 9 days into a 14 day window -> ~64% progress -> mid_warming
  const taskA = calculateUrgency(
    {
      dueAtUtc: dueIn5Days,
      warningLeadMinutes: 20160,
      status: 'in_progress',
    },
    now
  );

  // Task B: 1 day warning lead (1440 minutes).
  // Due in 5 days is OUTSIDE the 1 day window -> calm
  const taskB = calculateUrgency(
    {
      dueAtUtc: dueIn5Days,
      warningLeadMinutes: 1440,
      status: 'in_progress',
    },
    now
  );

  assert.equal(taskA.level, 'mid_warming');
  assert.ok(taskA.progress > 0.5);
  assert.equal(taskB.level, 'calm');
  assert.equal(taskB.progress, 0);
});

test('Urgency progress thresholds: early warning (<40%), mid warming (40-75%), late warning (>=75%)', () => {
  const now = new Date('2026-11-06T12:00:00Z');

  // Lead = 100 hours.
  // 1. Due in 80 hours -> 20% elapsed -> early_warning
  const early = calculateUrgency(
    {
      dueAtUtc: new Date(now.getTime() + 80 * 3600 * 1000).toISOString(),
      warningLeadMinutes: 100 * 60,
      status: 'in_progress',
    },
    now
  );
  assert.equal(early.level, 'early_warning');
  assert.equal(early.accentColor, '#c68a1b');

  // 2. Due in 50 hours -> 50% elapsed -> mid_warming
  const mid = calculateUrgency(
    {
      dueAtUtc: new Date(now.getTime() + 50 * 3600 * 1000).toISOString(),
      warningLeadMinutes: 100 * 60,
      status: 'in_progress',
    },
    now
  );
  assert.equal(mid.level, 'mid_warming');
  assert.equal(mid.accentColor, '#d96520');

  // 3. Due in 10 hours -> 90% elapsed -> late_warning
  const late = calculateUrgency(
    {
      dueAtUtc: new Date(now.getTime() + 10 * 3600 * 1000).toISOString(),
      warningLeadMinutes: 100 * 60,
      status: 'in_progress',
    },
    now
  );
  assert.equal(late.level, 'late_warning');
  assert.equal(late.accentColor, '#d32f2f');
});

test('Blocked status coexists with deadline urgency and marks isBlocked: true', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  const result = calculateUrgency(
    {
      dueAtUtc: '2026-11-06T15:00:00Z', // due in 3 hours
      warningLeadMinutes: 1440,
      status: 'blocked',
    },
    now
  );

  assert.equal(result.isBlocked, true);
  assert.equal(result.level, 'late_warning');
  assert.equal(result.dueLabel, 'Due in 3 hours');
});

test('formatRemainingTime formats minutes, hours, days, and overdue correctly', () => {
  assert.equal(formatRemainingTime(45 * 60 * 1000), 'Due in 45m');
  assert.equal(formatRemainingTime(3 * 3600 * 1000), 'Due in 3 hours');
  assert.equal(formatRemainingTime(5 * 24 * 3600 * 1000), 'Due in 5 days');
  assert.equal(formatRemainingTime(-45 * 60 * 1000), 'Overdue by 45m');
  assert.equal(formatRemainingTime(-18 * 3600 * 1000), 'Overdue by 18 hours');
});
