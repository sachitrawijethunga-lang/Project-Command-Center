import React from 'react';
import { useBoard } from '../context/BoardContext';
import { calculateUrgency } from '../utils/urgency';
import { Project, Task, UrgencyCalculation } from '../types/cockpit';

export const OverviewView: React.FC = () => {
  const {
    categories,
    projects,
    tasks,
    people,
    filter,
    setFilter,
    openProjectDrawer,
    openProjectModal,
    openCategoryModal,
    archiveCategory,
    deleteAllProjects,
    triggerSync,
    exportJson,
    currentTime,
    settings,
  } = useBoard();

  const activeCategories = categories.filter((c) => !c.archivedAt);
  const activeProjects = projects.filter((p) => !p.archivedAt);
  const activeTasks = tasks.filter((t) => !t.archivedAt);

  // Calculate project metrics and dominant urgency
  const getProjectUrgencyData = (project: Project) => {
    const projTasks = activeTasks.filter((t) => t.projectId === project.id);
    const total = projTasks.length;
    const completed = projTasks.filter((t) => t.status === 'completed').length;
    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const overdueTasks = projTasks.filter((t) => {
      if (t.status === 'completed') return false;
      const u = calculateUrgency(t, currentTime, settings.timezone);
      return u.isOverdue;
    });

    const blockedTasks = projTasks.filter((t) => t.status === 'blocked');

    const imminentTasks = projTasks.filter((t) => {
      if (t.status === 'completed') return false;
      const u = calculateUrgency(t, currentTime, settings.timezone);
      return !u.isOverdue && u.level === 'late_warning';
    });

    const dueSoonTasks = projTasks.filter((t) => {
      if (t.status === 'completed') return false;
      const u = calculateUrgency(t, currentTime, settings.timezone);
      return !u.isOverdue && (u.level === 'mid_warming' || u.level === 'early_warning');
    });

    // Closest urgent task
    let closestTask: Task | null = null;
    let closestUrgency: UrgencyCalculation | null = null;
    let minRemaining = Infinity;

    for (const t of projTasks) {
      if (t.status === 'completed') continue;
      const u = calculateUrgency(t, currentTime, settings.timezone);
      if (u.remainingMs < minRemaining) {
        minRemaining = u.remainingMs;
        closestTask = t;
        closestUrgency = u;
      }
    }

    // Dominant state for project card appearance
    let dominantColor = '#0b7d83';
    let dominantStatusText = 'On Track';
    let dominantIcon = 'check';
    let dominantBadgeText = `${completed}/${total} Done`;
    let dominantBadgeClass = 'bg-[#eceef1] text-[#566b7c]';
    let dominantAccentBar = 'bg-[#566b7c]';

    if (total > 0 && completed === total) {
      dominantColor = '#1b6d42';
      dominantStatusText = 'Operational';
      dominantIcon = 'check_circle';
      dominantBadgeText = `${total}/${total} Done`;
      dominantBadgeClass = 'bg-[#1b6d42]/10 text-[#1b6d42]';
      dominantAccentBar = 'bg-[#1b6d42]';
    } else if (overdueTasks.length > 0) {
      dominantColor = '#d32f2f';
      dominantStatusText = `${overdueTasks.length} Overdue Task`;
      dominantIcon = 'priority_high';
      dominantBadgeText = overdueTasks[0]
        ? calculateUrgency(overdueTasks[0], currentTime, settings.timezone).dueLabel
        : 'Overdue';
      dominantBadgeClass = 'bg-[#d32f2f]/10 text-[#d32f2f] font-bold';
      dominantAccentBar = 'bg-[#d32f2f]';
    } else if (blockedTasks.length > 0) {
      dominantColor = '#7d2882';
      dominantStatusText = 'Dependency Blocked';
      dominantIcon = 'block';
      dominantBadgeText = closestUrgency ? closestUrgency.dueLabel : 'Blocked';
      dominantBadgeClass = 'bg-[#7d2882]/15 text-[#7d2882] font-bold';
      dominantAccentBar = 'bg-[#7d2882]';
    } else if (imminentTasks.length > 0) {
      dominantColor = '#d32f2f';
      dominantStatusText = 'Near Deadline';
      dominantIcon = 'alarm';
      dominantBadgeText = closestUrgency ? closestUrgency.dueLabel : 'Due Soon';
      dominantBadgeClass = 'bg-[#d32f2f]/15 text-[#d32f2f] font-bold';
      dominantAccentBar = 'bg-[#d32f2f]';
    } else if (dueSoonTasks.length > 0) {
      dominantColor = '#d96520';
      dominantStatusText = 'Imminent';
      dominantIcon = 'schedule';
      dominantBadgeText = closestUrgency ? closestUrgency.dueLabel : 'Due Soon';
      dominantBadgeClass = 'bg-[#d96520]/15 text-[#d96520] font-bold';
      dominantAccentBar = 'bg-[#d96520]';
    } else if (closestTask) {
      dominantBadgeText = closestUrgency ? closestUrgency.dueLabel : 'Scheduled';
    }

    return {
      total,
      completed,
      completionPercent,
      overdueCount: overdueTasks.length,
      blockedCount: blockedTasks.length,
      closestTask,
      closestUrgency,
      dominantColor,
      dominantStatusText,
      dominantIcon,
      dominantBadgeText,
      dominantBadgeClass,
      dominantAccentBar,
    };
  };

  // Filter evaluation
  const isProjectVisible = (project: Project) => {
    if (filter === 'all') return true;

    const data = getProjectUrgencyData(project);
    if (filter === 'overdue') return data.overdueCount > 0;
    if (filter === 'blocked') return data.blockedCount > 0;
    if (filter === 'attention') {
      return (
        data.overdueCount > 0 ||
        data.blockedCount > 0 ||
        (data.total > 0 && data.completionPercent < 100)
      );
    }
    if (filter === 'my') {
      // Show projects owned by Prasanijth or Ruseik as executive demo
      return project.ownerId === 'p1' || project.ownerId === 'p2';
    }
    return true;
  };

  // Global metric rollups
  const globalOverdueCount = activeTasks.filter((t) => {
    if (t.status === 'completed') return false;
    return calculateUrgency(t, currentTime, settings.timezone).isOverdue;
  }).length;

  const globalExpeditedCount = activeTasks.filter((t) => {
    if (t.status === 'completed') return false;
    const u = calculateUrgency(t, currentTime, settings.timezone);
    return !u.isOverdue && u.isDueSoon;
  }).length;

  const globalCompletedCount = activeTasks.filter((t) => t.status === 'completed').length;
  const globalHealthPercent =
    activeTasks.length > 0 ? ((globalCompletedCount / activeTasks.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col w-full">
      {/* Command Strip & Boardroom Filter Matrix */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[#0b7d83] font-label-sm text-label-sm uppercase tracking-wider mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0b7d83] animate-pulse"></span>
            <span>Executive Command Surface · Operations Matrix</span>
            <span className="text-[#566b7c] opacity-50">/</span>
            <span className="text-[#566b7c]">Boardroom Display 01</span>
          </div>

          <div className="flex items-baseline gap-4">
            <h1 className="font-display-lg text-display-lg text-[#14283e] tracking-tight font-bold">
              Operations Cockpit
            </h1>
            <span className="font-body-md text-body-md text-[#566b7c]">
              Real-time status across {activeCategories.length} strategic domains &amp; {activeProjects.length} live initiatives
            </span>
          </div>
        </div>

        {/* 75-inch Calibrated Rapid Filter Strip */}
        <div className="flex items-center gap-1.5 bg-[#eceef1] p-1.5 rounded-xl shadow-sm overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`h-14 px-6 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-all active:scale-95 touch-press ${
              filter === 'all'
                ? 'bg-white text-[#14283e] shadow-sm font-bold'
                : 'text-[#566b7c] hover:text-[#14283e]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-[#0b7d83]">grid_view</span>
            <span>All Categories</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#e6e8eb] text-[#14283e] font-label-sm text-label-sm">
              {activeCategories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('attention')}
            className={`h-14 px-6 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-all active:scale-95 touch-press ${
              filter === 'attention'
                ? 'bg-white text-[#14283e] shadow-sm font-bold'
                : 'text-[#566b7c] hover:text-[#14283e]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-[#d96520]">
              notification_important
            </span>
            <span>Needs Attention</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#d96520]/15 text-[#d96520] font-label-sm text-label-sm font-bold">
              {globalOverdueCount + globalExpeditedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('overdue')}
            className={`h-14 px-6 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-all active:scale-95 touch-press ${
              filter === 'overdue'
                ? 'bg-white text-[#14283e] shadow-sm font-bold'
                : 'text-[#566b7c] hover:text-[#14283e]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-[#d32f2f]">error_outline</span>
            <span>Overdue</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#d32f2f]/15 text-[#d32f2f] font-label-sm text-label-sm font-bold">
              {globalOverdueCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('blocked')}
            className={`h-14 px-6 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-all active:scale-95 touch-press ${
              filter === 'blocked'
                ? 'bg-white text-[#14283e] shadow-sm font-bold'
                : 'text-[#566b7c] hover:text-[#14283e]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-[#7d2882]">front_hand</span>
            <span>Blocked</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#7d2882]/15 text-[#7d2882] font-label-sm text-label-sm font-bold">
              {activeTasks.filter((t) => t.status === 'blocked').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('my')}
            className={`h-14 px-6 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-all active:scale-95 touch-press ${
              filter === 'my'
                ? 'bg-white text-[#14283e] shadow-sm font-bold'
                : 'text-[#566b7c] hover:text-[#14283e]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-[#0b7d83]">person_pin</span>
            <span>My Assigned</span>
          </button>
        </div>
      </div>

      {/* Board Visual Summary & Status Arc Metric Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#dfe7ec] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wide text-[#566b7c]">
              Execution Health
            </span>
            <span className="font-display-lg text-display-lg text-[#14283e] font-bold mt-1 tabular-nums">
              {globalHealthPercent}%
            </span>
            <span className="font-body-md text-body-md text-[#1b6d42] mt-0.5 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              +4.2% vs last cycle
            </span>
          </div>

          <div className="w-16 h-16 flex items-center justify-center relative">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 40 40">
              <circle
                className="text-[#e6e8eb]"
                cx="20"
                cy="20"
                fill="transparent"
                r="16"
                stroke="currentColor"
                strokeWidth="4"
              />
              <circle
                className="text-[#1b6d42]"
                cx="20"
                cy="20"
                fill="transparent"
                r="16"
                stroke="currentColor"
                strokeDasharray="100.5"
                strokeDashoffset={100.5 - (parseFloat(globalHealthPercent) / 100) * 100.5}
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
            <span className="absolute font-label-sm text-label-sm font-bold text-[#14283e] tabular-nums">
              {Math.round(parseFloat(globalHealthPercent))}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#dfe7ec] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wide text-[#566b7c]">
              Overdue Deliverables
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display-lg text-display-lg text-[#d32f2f] font-bold tabular-nums">
                {String(globalOverdueCount).padStart(2, '0')}
              </span>
              <span className="font-label-md text-label-md text-[#d32f2f]/80">Active Risks</span>
            </div>
            <span className="font-body-md text-body-md text-[#566b7c] mt-0.5">Critical path impacted</span>
          </div>
          <div className="w-14 h-14 rounded-xl bg-[#d32f2f]/10 flex items-center justify-center text-[#d32f2f]">
            <span className="material-symbols-outlined text-[32px]">warning</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#dfe7ec] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wide text-[#566b7c]">
              Expedited Tasks (&lt;48h)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display-lg text-display-lg text-[#d96520] font-bold tabular-nums">
                {String(globalExpeditedCount).padStart(2, '0')}
              </span>
              <span className="font-label-md text-label-md text-[#d96520]">Due Soon</span>
            </div>
            <span className="font-body-md text-body-md text-[#566b7c] mt-0.5">3 on registry critical line</span>
          </div>
          <div className="w-14 h-14 rounded-xl bg-[#d96520]/10 flex items-center justify-center text-[#d96520]">
            <span className="material-symbols-outlined text-[32px]">schedule</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#dfe7ec] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wide text-[#566b7c]">
              Synchronized Portfolios
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display-lg text-display-lg text-[#0b7d83] font-bold tabular-nums">
                {activeProjects.length} / {activeProjects.length}
              </span>
            </div>
            <span className="font-body-md text-body-md text-[#1b6d42] mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1b6d42]"></span>
              Live cluster sync
            </span>
          </div>
          <div className="w-14 h-14 rounded-xl bg-[#0b7d83]/10 flex items-center justify-center text-[#0b7d83]">
            <span className="material-symbols-outlined text-[32px]">hub</span>
          </div>
        </div>
      </div>

      {/* CATEGORY WORKBENCH (4 Columns matching screen_c6799455.png) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {activeCategories.map((category) => {
          const catOwner = people.find((p) => p.id === category.ownerId);
          const catProjects = activeProjects.filter((p) => p.categoryId === category.id);
          const visibleProjects = catProjects.filter(isProjectVisible);

          // Calculate Domain Throughput
          const catProjectIds = new Set(catProjects.map((p) => p.id));
          const catTasks = activeTasks.filter((t) => catProjectIds.has(t.projectId));
          const catCompleted = catTasks.filter((t) => t.status === 'completed').length;
          const catThroughput =
            catTasks.length > 0 ? ((catCompleted / catTasks.length) * 100).toFixed(1) : '0.0';

          return (
            <section
              key={category.id}
              className="flex flex-col bg-[#f2f4f7] rounded-xl p-4 shadow-sm border border-[#dfe7ec]"
            >
              {/* Category Header Card */}
              <div className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-[#dfe7ec]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#566b7c]">
                      Strategic Domain
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h2
                        onClick={() => openCategoryModal(category)}
                        className="font-headline-md text-headline-md text-[#14283e] font-bold cursor-pointer hover:text-[#0b7d83] transition-colors"
                        title="Click to Rename Domain"
                      >
                        {category.name}
                      </h2>
                      <button
                        type="button"
                        onClick={() => openCategoryModal(category)}
                        className="w-8 h-8 rounded-lg hover:bg-[#eceef1] text-[#73777d] hover:text-[#14283e] flex items-center justify-center transition-colors cursor-pointer"
                        title="Rename Domain"
                        aria-label="Rename Domain"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <button
                      type="button"
                      aria-label="Category menu"
                      onClick={() => openCategoryModal(category)}
                      className="w-12 h-12 rounded-lg bg-[#eceef1] hover:bg-[#e6e8eb] flex items-center justify-center text-[#14283e] active:scale-95 transition-transform touch-press"
                      title="Edit Category or Archive"
                    >
                      <span className="material-symbols-outlined text-[24px]">more_vert</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: category.accentColor || '#0b7d83' }}
                    ></span>
                    <span className="font-label-md text-label-md text-[#566b7c]">Lead:</span>
                    <span className="font-label-md text-label-md text-[#14283e] font-semibold">
                      {catOwner?.displayName || 'Unassigned'}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm bg-[#eceef1] px-2.5 py-1 rounded-md text-[#14283e] font-bold tabular-nums">
                    {catProjects.length} Projects
                  </span>
                </div>

                {/* Completion Strip Metric */}
                <div className="mt-4 pt-2 bg-[#f2f4f7] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-sm text-label-sm text-[#566b7c] font-medium">
                      Domain Throughput
                    </span>
                    <span className="font-label-sm text-label-sm text-[#14283e] font-bold tabular-nums">
                      {catThroughput}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#e6e8eb] overflow-hidden">
                    <div
                      className="h-full bg-[#0b7d83] rounded-full transition-all duration-300"
                      style={{ width: `${catThroughput}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Projects Track in Category */}
              <div className="flex flex-col gap-4">
                {visibleProjects.map((project) => {
                  const projOwner = people.find((p) => p.id === project.ownerId);
                  const uData = getProjectUrgencyData(project);

                  return (
                    <article
                      key={project.id}
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col gap-4 border border-[#dfe7ec] cursor-pointer"
                      onClick={() => openProjectDrawer(project.id)}
                    >
                      {/* Left 6px semantic accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${uData.dominantAccentBar}`}></div>

                      <div className="flex items-start justify-between pl-2">
                        <div className="flex flex-col min-w-0 pr-2">
                          <span
                            className="font-label-sm text-label-sm font-semibold uppercase tracking-wider flex items-center gap-1 truncate"
                            style={{ color: uData.dominantColor }}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {uData.dominantIcon}
                            </span>
                            {uData.dominantStatusText}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <h3 className="font-headline-sm text-headline-sm text-[#14283e] font-bold truncate">
                              {project.name}
                            </h3>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openProjectModal(project);
                              }}
                              className="w-7 h-7 rounded-md hover:bg-[#eceef1] text-[#73777d] hover:text-[#14283e] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Rename Project"
                              aria-label="Rename Project"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          </div>
                        </div>

                        {/* Top-Right Urgency Badge */}
                        <div
                          className={`h-10 px-3 rounded-lg flex items-center gap-1.5 font-label-md text-label-md font-bold whitespace-nowrap flex-shrink-0 ${uData.dominantBadgeClass}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {uData.dominantIcon}
                          </span>
                          <span>{uData.dominantBadgeText}</span>
                        </div>
                      </div>

                      {/* Owner Chip & Progress Row */}
                      <div className="flex flex-col gap-2 pl-2">
                        <div className="flex items-center justify-between text-[#566b7c]">
                          <div className="flex items-center gap-1.5 bg-[#f2f4f7] px-2.5 py-1 rounded-md max-w-[220px] truncate">
                            <span className="material-symbols-outlined text-[18px] text-[#566b7c]">
                              badge
                            </span>
                            <span className="font-label-sm text-label-sm text-[#14283e] font-semibold truncate">
                              Owner: {projOwner?.displayName || 'Unassigned'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 font-label-md text-label-md font-bold text-[#14283e] tabular-nums">
                            <span>{uData.completed}</span>
                            <span className="text-[#566b7c] font-normal">/</span>
                            <span>{uData.total} tasks</span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full mt-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-label-sm text-label-sm text-[#566b7c]">
                              Milestone Convergence
                            </span>
                            <span className="font-label-sm text-label-sm text-[#14283e] font-semibold tabular-nums">
                              {uData.completionPercent}%
                            </span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-[#e6e8eb] overflow-hidden">
                            <div
                              className="h-full bg-[#0b7d83] rounded-full transition-all duration-300"
                              style={{ width: `${uData.completionPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Touch Interaction Row (Minimum 48px height) */}
                      <div className="flex items-center justify-between pt-1 pl-2">
                        <span className="font-body-md text-body-md text-[#566b7c] flex items-center gap-1.5 truncate max-w-[190px]">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: uData.dominantColor }}
                          ></span>
                          <span className="truncate">
                            {uData.closestTask?.title || 'Operational pipeline normal'}
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectDrawer(project.id);
                          }}
                          className="h-12 px-4 rounded-lg bg-[#e6e8eb] text-[#14283e] hover:bg-[#d8dadd] font-label-md text-label-md flex items-center gap-1 active:scale-95 transition-all touch-press font-semibold"
                        >
                          <span>Inspect</span>
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>
                    </article>
                  );
                })}

                {catProjects.length === 0 ? (
                  <div className="p-8 bg-white/90 rounded-xl border border-dashed border-[#dfe7ec] text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0b7d83]/10 text-[#0b7d83] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">folder_open</span>
                    </div>
                    <div>
                      <span className="font-label-md text-label-md text-[#14283e] font-semibold block">
                        No Active Projects in Domain
                      </span>
                      <span className="font-body-sm text-body-sm text-[#566b7c]">
                        All projects deleted. Tap below to create your first project.
                      </span>
                    </div>
                  </div>
                ) : visibleProjects.length === 0 ? (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-[#dfe7ec] text-center text-[#566b7c] font-body-md">
                    No matching projects in this view filter.
                  </div>
                ) : null}
              </div>

              {/* Add Project Action Trigger (Strict Touch Target >= 56px) */}
              <button
                type="button"
                onClick={() => openProjectModal(undefined, category.id)}
                className="h-16 mt-4 rounded-xl bg-white text-[#0b7d83] font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm border border-[#dfe7ec] hover:bg-[#f7f9fc] active:scale-98 transition-all touch-press"
              >
                <span className="material-symbols-outlined text-[24px]">add_circle</span>
                <span>+ Add Project</span>
              </button>
            </section>
          );
        })}
      </div>

      {/* Operational Footer Broadcast Strip */}
      <footer className="mt-8 p-6 rounded-xl bg-white shadow-sm border border-[#dfe7ec] flex flex-col md:flex-row items-center justify-between gap-4 text-[#566b7c]">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[#1b6d42] animate-ping"></div>
          <div className="flex items-center gap-2 font-label-md text-label-md">
            <span className="text-[#14283e] font-bold">Interactive Wallmount Mode:</span>
            <span>Board 75-Inch Touch Engine v4.2 calibrated</span>
            <span className="opacity-40">•</span>
            <span>Next cluster replication in 42s</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeProjects.length > 0 && (
            <button
              type="button"
              onClick={deleteAllProjects}
              className="h-12 px-4 rounded-lg bg-[#ffdad6]/60 hover:bg-[#ffdad6] text-[#ba1a1a] font-label-md text-label-md flex items-center gap-1.5 active:scale-95 transition-all touch-press cursor-pointer font-semibold"
              title="Delete all projects under all categories"
            >
              <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
              <span>Clear All Projects</span>
            </button>
          )}

          <button
            type="button"
            onClick={triggerSync}
            className="h-12 px-4 rounded-lg bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e] font-label-md text-label-md flex items-center gap-2 active:scale-95 transition-all touch-press cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            <span>Force Refresh</span>
          </button>

          <button
            type="button"
            onClick={exportJson}
            className="h-12 px-4 rounded-lg bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e] font-label-md text-label-md flex items-center gap-2 active:scale-95 transition-all touch-press cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Export Executive Brief (JSON)</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
