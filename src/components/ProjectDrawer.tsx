import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { calculateUrgency } from '../utils/urgency';
import { Task, TaskStatus } from '../types/cockpit';

export const ProjectDrawer: React.FC = () => {
  const {
    selectedProject,
    closeProjectDrawer,
    categories,
    tasks,
    people,
    setTaskStatus,
    openTaskModal,
    openProjectModal,
    openOwnerModal,
    openMoveProjectModal,
    archiveProject,
    deleteTask,
    currentTime,
    settings,
    showToast,
  } = useBoard();

  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [sortByUrgency, setSortByUrgency] = useState(true);
  const [activeDropdownTaskId, setActiveDropdownTaskId] = useState<string | null>(null);

  if (!selectedProject) return null;

  const category = categories.find((c) => c.id === selectedProject.categoryId);
  const owner = people.find((p) => p.id === selectedProject.ownerId);

  // Tasks for this project
  const projectTasks = tasks.filter((t) => t.projectId === selectedProject.id && !t.archivedAt);

  // Statistics
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === 'completed');
  const completedCount = completedTasks.length;
  const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  let overdueCount = 0;
  let imminentCount = 0;
  let blockedCount = 0;

  projectTasks.forEach((t) => {
    if (t.status === 'completed') return;
    if (t.status === 'blocked') blockedCount++;
    const u = calculateUrgency(t, currentTime, settings.timezone);
    if (u.isOverdue) overdueCount++;
    else if (u.level === 'late_warning') imminentCount++;
  });

  // Filtered and sorted tasks
  const displayedTasks = projectTasks
    .filter((t) => {
      if (filterActiveOnly) return t.status !== 'completed';
      return true;
    })
    .sort((a, b) => {
      if (!sortByUrgency) return a.order - b.order;
      // Sort completed to bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      // Otherwise sort by due timestamp ascending (most urgent first)
      return new Date(a.dueAtUtc).getTime() - new Date(b.dueAtUtc).getTime();
    });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTaskStatus(taskId, newStatus);
    setActiveDropdownTaskId(null);
  };

  return (
    <>
      {/* MODAL SCRIM OVERLAY */}
      <div
        className="fixed inset-0 bg-[#001629]/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={closeProjectDrawer}
      ></div>

      {/* RIGHT DOCKED EXPANDED TASK & PROJECT INSPECTION DRAWER */}
      <aside
        className="fixed top-0 right-0 bottom-0 w-[1140px] max-w-[94vw] bg-[#f7f9fc] shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out overflow-hidden border-l border-[#dfe7ec]"
        aria-label="Project Detail Drawer"
      >
        {/* DRAWER HEADER (Executive Navy Zone) */}
        <div className="bg-[#112b42] text-white px-8 py-6 flex-shrink-0 flex items-start justify-between shadow-md">
          <div className="flex flex-col gap-2 max-w-[780px]">
            {/* Breadcrumb & Category Meta */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded bg-[#0b7d83] text-white font-label-sm text-label-sm tracking-wide uppercase font-bold">
                <span className="material-symbols-outlined text-[16px]">folder_special</span>
                {category?.name || 'Strategic Domain'}
              </span>
              <span className="text-[#7b93ae] font-label-sm text-label-sm">
                / Track {selectedProject.portfolioTrack || 'CORE'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7b93ae]"></span>
              <span className="text-[#97f1f7] font-label-sm text-label-sm">Priority Stream 1</span>
            </div>

            {/* Project Title with Rename Button */}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="font-display-xl text-display-xl text-white font-bold tracking-tight">
                {selectedProject.name}
              </h1>
              <button
                type="button"
                onClick={() => openProjectModal(selectedProject)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#97f1f7] text-sm font-semibold transition-colors active:scale-95 touch-press cursor-pointer"
                title="Rename Project Initiative"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span>Rename Project</span>
              </button>
            </div>

            {/* Project Owner Reassign Tactile Trigger */}
            <div className="flex items-center gap-4 mt-1">
              <div className="inline-flex items-center gap-3 bg-[#162b3a]/90 px-4 py-1.5 rounded-lg border border-[#dfe7ec]/15">
                <div className="w-8 h-8 rounded-full bg-[#0b7d83] text-white flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm">
                  {owner?.avatarInitials || 'PL'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[#7d93a5] text-label-sm font-label-sm leading-tight">
                    Project Owner
                  </span>
                  <span className="text-white font-label-md text-label-md font-semibold leading-tight">
                    {owner?.displayName || 'Unassigned'}
                  </span>
                </div>
                <button
                  type="button"
                  className="ml-2 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-transform touch-press"
                  onClick={() => openOwnerModal({ type: 'project', id: selectedProject.id })}
                  title="Reassign Project Lead"
                >
                  <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[#7b93ae] font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>Security Level 3 · Restricted Access</span>
              </div>
            </div>
          </div>

          {/* Close Drawer Button (Tactile 64x64px touch target) */}
          <button
            type="button"
            aria-label="Close Drawer"
            className="w-16 h-16 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all shadow-sm touch-press cursor-pointer relative z-10"
            onClick={closeProjectDrawer}
          >
            <span className="material-symbols-outlined text-[36px]">close</span>
          </button>
        </div>

        {/* DRAWER SUB-HEADER METRICS & PROGRESS TRACKER */}
        <div className="bg-white px-8 py-4 flex-shrink-0 shadow-sm border-b border-[#dfe7ec] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-4">
              <span className="font-headline-lg text-headline-lg text-[#14283e] font-bold tabular-nums">
                {completedCount} of {totalTasks} tasks completed
              </span>
              <span className="font-headline-md text-headline-md text-[#1b6d42] font-semibold tabular-nums">
                ({completionPercent}%)
              </span>
            </div>

            <div className="flex items-center gap-6 text-[#566b7c] font-label-md text-label-md">
              {overdueCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#941313]"></span>
                  <span className="font-bold text-[#941313] tabular-nums">{overdueCount} Overdue</span>
                </div>
              )}
              {imminentCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#d32f2f]"></span>
                  <span className="font-semibold text-[#d32f2f] tabular-nums">{imminentCount} Imminent</span>
                </div>
              )}
              {blockedCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#7d2882]"></span>
                  <span className="font-semibold text-[#7d2882] tabular-nums">{blockedCount} Blocked</span>
                </div>
              )}
            </div>
          </div>

          {/* Segmented Tactile Progress Bar */}
          <div className="grid grid-flow-col auto-cols-fr gap-1.5 h-4 w-full bg-[#e6e8eb] rounded-full p-1">
            {projectTasks.map((t) => {
              let segmentColor = 'bg-[#1b6d42]';
              if (t.status === 'completed') {
                segmentColor = 'bg-[#1b6d42]';
              } else {
                const u = calculateUrgency(t, currentTime, settings.timezone);
                if (u.isOverdue) segmentColor = 'bg-[#941313] animate-pulse';
                else if (t.status === 'blocked') segmentColor = 'bg-[#7d2882]';
                else if (u.level === 'late_warning') segmentColor = 'bg-[#d32f2f]';
                else if (u.level === 'mid_warming') segmentColor = 'bg-[#d96520]';
                else if (u.level === 'early_warning') segmentColor = 'bg-[#c68a1b]';
                else segmentColor = 'bg-[#0b7d83]';
              }

              return (
                <div
                  key={t.id}
                  className={`${segmentColor} rounded-full h-full transition-all`}
                  title={`${t.title} (${t.status})`}
                ></div>
              );
            })}
          </div>

          {/* Operational Action Bar (Min 56px height touch targets) */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="h-14 px-6 rounded-xl bg-[#0b7d83] hover:bg-[#00696e] text-white flex items-center gap-2 font-label-lg text-label-lg active:scale-95 transition-all shadow-md touch-press"
                onClick={() => openTaskModal(undefined, selectedProject.id)}
              >
                <span className="material-symbols-outlined text-[24px]">add_circle</span>
                <span>+ Add Task to Project</span>
              </button>

              <button
                type="button"
                className={`h-14 px-4 rounded-xl flex items-center gap-2 font-label-md text-label-md active:scale-95 transition-all border ${
                  filterActiveOnly
                    ? 'bg-[#112b42] text-white border-[#112b42]'
                    : 'bg-[#eceef1] text-[#14283e] border-[#dfe7ec]'
                }`}
                onClick={() => setFilterActiveOnly(!filterActiveOnly)}
              >
                <span className="material-symbols-outlined text-[22px]">tune</span>
                <span>
                  {filterActiveOnly
                    ? `Filter: Active (${totalTasks - completedCount})`
                    : `Filter: All Tasks (${totalTasks})`}
                </span>
              </button>

              <button
                type="button"
                className="h-14 px-4 rounded-xl bg-[#eceef1] text-[#14283e] border border-[#dfe7ec] flex items-center gap-2 font-label-md text-label-md active:scale-95 transition-all"
                onClick={() => setSortByUrgency(!sortByUrgency)}
              >
                <span className="material-symbols-outlined text-[22px]">swap_vert</span>
                <span>{sortByUrgency ? 'Sort: Urgency Radar' : 'Sort: Backlog Order'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="h-14 px-4 rounded-xl bg-white text-[#14283e] border border-[#dfe7ec] shadow-sm flex items-center gap-2 font-label-md text-label-md active:scale-95 transition-all touch-press"
                onClick={() => openMoveProjectModal(selectedProject)}
              >
                <span className="material-symbols-outlined text-[22px]">drive_file_move</span>
                <span>Move to Category</span>
              </button>

              <button
                type="button"
                className="h-14 px-4 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-center gap-2 font-label-md text-label-md active:scale-95 transition-all touch-press font-semibold"
                onClick={() => archiveProject(selectedProject.id)}
              >
                <span className="material-symbols-outlined text-[22px]">archive</span>
                <span>Archive</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN SCROLLABLE TASK RADAR DECK (76px - 88px rows) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4 bg-[#f7f9fc]">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-3">
              <span className="font-headline-sm text-headline-sm text-[#14283e] font-bold">
                Action Queue &amp; Urgency Stack
              </span>
              <span className="px-3 py-0.5 rounded-full bg-[#112b42]/10 text-[#112b42] font-label-sm text-label-sm font-semibold">
                {sortByUrgency ? 'Ordered by Deadlines' : 'Backlog Order'}
              </span>
            </div>
            <span className="text-[#566b7c] font-label-sm text-label-sm">
              Tap any row or status selector to edit directly
            </span>
          </div>

          {displayedTasks.map((task) => {
            const assignee = people.find((p) => p.id === task.assigneeId);
            const urgency = calculateUrgency(task, currentTime, settings.timezone);
            const isCompleted = task.status === 'completed';

            // Warning lead format
            const leadDays = Math.round(task.warningLeadMinutes / 1440);
            const leadText =
              leadDays >= 1
                ? `${leadDays} ${leadDays === 1 ? 'day' : 'days'}`
                : `${Math.round(task.warningLeadMinutes / 60)} hrs`;

            return (
              <div
                key={task.id}
                className={`task-row group relative min-h-[86px] bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center pl-0 pr-6 overflow-hidden border border-[#dfe7ec] active:bg-[#0b7d83]/5 ${
                  isCompleted ? 'opacity-80' : ''
                }`}
              >
                {/* 6px Left Semantic Urgency Accent Bar */}
                <div
                  className="w-[6px] self-stretch flex-shrink-0"
                  style={{ backgroundColor: urgency.accentColor }}
                ></div>

                <div className="flex items-center justify-between w-full pl-4 py-3 gap-4">
                  {/* Task Info & Assignee */}
                  <div className="flex flex-col gap-1 min-w-[320px] max-w-[420px]">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-[20px] flex-shrink-0"
                        style={{ color: urgency.accentColor }}
                      >
                        {urgency.icon}
                      </span>
                      <span
                        className={`font-headline-sm text-headline-sm text-[#14283e] font-bold truncate ${
                          isCompleted ? 'line-through text-[#566b7c]' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[#566b7c] font-label-sm text-label-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-[#112b42] text-white flex items-center justify-center font-bold text-[11px]">
                          {assignee?.avatarInitials || 'OP'}
                        </span>
                        <span className="font-medium text-[#14283e]">
                          {assignee?.displayName || 'Unassigned'}
                        </span>
                      </div>
                      <span>•</span>
                      <span
                        className={
                          urgency.isOverdue
                            ? 'text-[#941313] font-semibold'
                            : urgency.level === 'late_warning'
                            ? 'text-[#d32f2f] font-semibold'
                            : ''
                        }
                      >
                        {urgency.dueLabel}
                      </span>
                      <span>•</span>
                      <span>Lead: {leadText}</span>
                    </div>
                  </div>

                  {/* Urgency Dynamic Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`min-h-[40px] px-4 rounded-xl flex items-center gap-1.5 font-label-md text-label-md font-bold shadow-sm whitespace-nowrap ${urgency.badgeBg} ${urgency.badgeText}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{urgency.icon}</span>
                      <span>{urgency.dueLabel}</span>
                    </span>

                    {task.status === 'blocked' && (
                      <span className="min-h-[40px] px-3 rounded-xl bg-[#7d2882] text-white flex items-center gap-1.5 font-label-md text-label-md font-bold shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">block</span>
                        <span>Blocked</span>
                      </span>
                    )}
                  </div>

                  {/* Interactive Status Selector (Large Touch Target 52px) */}
                  <div className="relative">
                    <button
                      type="button"
                      className={`h-13 px-4 rounded-xl flex items-center gap-2 font-label-md text-label-md active:scale-95 transition-all font-semibold ${
                        task.status === 'completed'
                          ? 'bg-[#1b6d42] text-white'
                          : task.status === 'blocked'
                          ? 'bg-[#7d2882] text-white'
                          : task.status === 'in_progress'
                          ? 'bg-[#112b42] text-white'
                          : 'bg-[#eceef1] text-[#14283e]'
                      }`}
                      onClick={() =>
                        setActiveDropdownTaskId(
                          activeDropdownTaskId === task.id ? null : task.id
                        )
                      }
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          task.status === 'completed'
                            ? 'bg-white'
                            : task.status === 'blocked'
                            ? 'bg-white'
                            : task.status === 'in_progress'
                            ? 'bg-[#97f1f7]'
                            : 'bg-[#73777d]'
                        }`}
                      ></span>
                      <span className="capitalize">{task.status.replace('_', ' ')}</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                    </button>

                    {activeDropdownTaskId === task.id && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setActiveDropdownTaskId(null)}
                        ></div>
                        <div className="absolute right-0 top-14 w-48 bg-white rounded-xl shadow-2xl p-1.5 z-30 flex flex-col gap-1 border border-[#dfe7ec]">
                          <button
                            type="button"
                            className="h-11 px-3 rounded-lg text-left font-label-sm text-label-sm hover:bg-[#eceef1] flex items-center gap-2 cursor-pointer"
                            onClick={() => handleStatusChange(task.id, 'not_started')}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-[#73777d]"></span>
                            <span>Not Started</span>
                          </button>
                          <button
                            type="button"
                            className="h-11 px-3 rounded-lg text-left font-label-sm text-label-sm hover:bg-[#eceef1] flex items-center gap-2 cursor-pointer"
                            onClick={() => handleStatusChange(task.id, 'in_progress')}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0b7d83]"></span>
                            <span>In Progress</span>
                          </button>
                          <button
                            type="button"
                            className="h-11 px-3 rounded-lg text-left font-label-sm text-label-sm hover:bg-[#eceef1] flex items-center gap-2 cursor-pointer"
                            onClick={() => handleStatusChange(task.id, 'blocked')}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-[#7d2882]"></span>
                            <span>Blocked</span>
                          </button>
                          <button
                            type="button"
                            className="h-11 px-3 rounded-lg text-left font-label-sm text-label-sm hover:bg-[#eceef1] flex items-center gap-2 cursor-pointer"
                            onClick={() => handleStatusChange(task.id, 'completed')}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d42]"></span>
                            <span>Completed</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Touch Row Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-12 h-12 rounded-xl bg-[#eceef1] text-[#14283e] hover:bg-[#e6e8eb] flex items-center justify-center active:scale-95 transition-transform touch-press"
                      onClick={() => openTaskModal(task, selectedProject.id)}
                      title="Edit Task Specification"
                    >
                      <span className="material-symbols-outlined text-[22px]">edit</span>
                    </button>

                    <button
                      type="button"
                      className="w-12 h-12 rounded-xl bg-[#eceef1] text-[#93000a] hover:bg-[#ffdad6] flex items-center justify-center active:scale-95 transition-transform touch-press"
                      onClick={() => deleteTask(task.id)}
                      title="Delete / Archive Task"
                    >
                      <span className="material-symbols-outlined text-[22px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {displayedTasks.length === 0 && (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#dfe7ec] text-[#566b7c]">
              No tasks currently match this filter.
            </div>
          )}
        </div>

        {/* DRAWER FOOTER COMMAND STRIP */}
        <div className="bg-white px-8 py-4 flex-shrink-0 flex items-center justify-between shadow-lg border-t border-[#dfe7ec]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[#566b7c] font-label-sm text-label-sm">
              <span className="w-3 h-3 rounded-full bg-[#1b6d42]"></span>
              Direct DB Replication Active
            </span>
            <span className="text-[#566b7c] font-label-sm text-label-sm">•</span>
            <span className="text-[#566b7c] font-label-sm text-label-sm">
              Display Resolution: 3840×2160 UHD Native (75&quot; Certified)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="h-14 px-8 rounded-xl bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e] font-label-lg text-label-lg active:scale-95 transition-all touch-press"
              onClick={closeProjectDrawer}
            >
              Back to Command Canvas
            </button>

            <button
              type="button"
              className="h-14 px-8 rounded-xl bg-[#0b7d83] hover:bg-[#00696e] text-white font-label-lg text-label-lg font-bold shadow-md active:scale-95 transition-all touch-press"
              onClick={() => {
                showToast('All changes synced with Central Cloud Node.', 'success');
                setTimeout(closeProjectDrawer, 350);
              }}
            >
              Done &amp; Sync
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
