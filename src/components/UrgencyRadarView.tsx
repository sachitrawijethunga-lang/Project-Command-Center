import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { calculateUrgency } from '../utils/urgency';
import { TaskStatus } from '../types/cockpit';

export const UrgencyRadarView: React.FC = () => {
  const {
    tasks,
    projects,
    categories,
    people,
    openTaskModal,
    openProjectDrawer,
    setTaskStatus,
    deleteTask,
    currentTime,
    settings,
  } = useBoard();

  const [radarFilter, setRadarFilter] = useState<'all' | 'overdue' | 'imminent' | 'blocked' | 'completed'>('all');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [activeDropdownTaskId, setActiveDropdownTaskId] = useState<string | null>(null);

  const activeTasks = tasks.filter((t) => !t.archivedAt);

  // Filter tasks
  const filteredTasks = activeTasks.filter((task) => {
    const project = projects.find((p) => p.id === task.projectId);
    if (!project || project.archivedAt) return false;

    if (selectedCatId !== 'all' && project.categoryId !== selectedCatId) {
      return false;
    }

    const u = calculateUrgency(task, currentTime, settings.timezone);

    if (radarFilter === 'overdue') return u.isOverdue && task.status !== 'completed';
    if (radarFilter === 'imminent') return !u.isOverdue && u.level === 'late_warning' && task.status !== 'completed';
    if (radarFilter === 'blocked') return task.status === 'blocked';
    if (radarFilter === 'completed') return task.status === 'completed';

    return true;
  });

  // Sort by urgency priority: Overdue first -> Imminent -> Mid -> Early -> Calm -> Completed
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    const ua = calculateUrgency(a, currentTime, settings.timezone);
    const ub = calculateUrgency(b, currentTime, settings.timezone);
    return ua.remainingMs - ub.remainingMs;
  });

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#0b7d83] font-label-sm text-label-sm uppercase tracking-wider mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0b7d83] animate-pulse"></span>
            <span>75&quot; Long-Range Urgency Monitor · Radar Deck</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-[#14283e] font-bold">
            Tasks &amp; Urgency Radar
          </h1>
          <p className="font-body-md text-body-md text-[#566b7c]">
            Per-task interpolated deadline progression calculated continuously across all {activeTasks.length} active initiatives
          </p>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-3">
          <span className="font-label-md text-label-md text-[#566b7c] font-semibold whitespace-nowrap">
            Domain Filter:
          </span>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="h-14 px-4 rounded-xl bg-white border border-[#dfe7ec] font-label-md text-label-md text-[#14283e] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
          >
            <option value="all">All Domains ({categories.length})</option>
            {categories
              .filter((c) => !c.archivedAt)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All Radar Tasks', count: activeTasks.length, icon: 'radar' },
          {
            key: 'overdue',
            label: 'Overdue',
            count: activeTasks.filter((t) => t.status !== 'completed' && calculateUrgency(t, currentTime, settings.timezone).isOverdue).length,
            icon: 'error',
            color: 'text-[#941313]',
          },
          {
            key: 'imminent',
            label: 'Imminent (<48h)',
            count: activeTasks.filter((t) => t.status !== 'completed' && calculateUrgency(t, currentTime, settings.timezone).level === 'late_warning').length,
            icon: 'alarm',
            color: 'text-[#d32f2f]',
          },
          {
            key: 'blocked',
            label: 'Blocked',
            count: activeTasks.filter((t) => t.status === 'blocked').length,
            icon: 'block',
            color: 'text-[#7d2882]',
          },
          {
            key: 'completed',
            label: 'Resolved & Completed',
            count: activeTasks.filter((t) => t.status === 'completed').length,
            icon: 'check_circle',
            color: 'text-[#1b6d42]',
          },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setRadarFilter(f.key as any)}
            className={`h-14 px-5 rounded-xl font-label-md text-label-md flex items-center gap-2 border shadow-sm transition-all active:scale-95 touch-press whitespace-nowrap font-semibold ${
              radarFilter === f.key
                ? 'bg-[#112b42] text-white border-[#112b42]'
                : 'bg-white text-[#14283e] border-[#dfe7ec] hover:bg-[#f2f4f7]'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${f.color || ''}`}>{f.icon}</span>
            <span>{f.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                radarFilter === f.key ? 'bg-white/20 text-white' : 'bg-[#eceef1] text-[#14283e]'
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task Radar Stack */}
      <div className="flex flex-col gap-3">
        {sortedTasks.map((task) => {
          const project = projects.find((p) => p.id === task.projectId);
          const category = categories.find((c) => c.id === project?.categoryId);
          const assignee = people.find((p) => p.id === task.assigneeId);
          const urgency = calculateUrgency(task, currentTime, settings.timezone);
          const isCompleted = task.status === 'completed';

          return (
            <div
              key={task.id}
              className={`task-row group relative min-h-[86px] bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center pl-0 pr-6 overflow-hidden border border-[#dfe7ec] ${
                isCompleted ? 'opacity-80' : ''
              }`}
            >
              {/* 6px Left Accent Bar */}
              <div
                className="w-[6px] self-stretch flex-shrink-0"
                style={{ backgroundColor: urgency.accentColor }}
              ></div>

              <div className="flex items-center justify-between w-full pl-4 py-3 gap-4">
                {/* Task Info & Hierarchy */}
                <div className="flex flex-col gap-1 min-w-[340px] max-w-[460px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider"
                      style={{
                        backgroundColor: `${category?.accentColor || '#0b7d83'}15`,
                        color: category?.accentColor || '#0b7d83',
                      }}
                    >
                      {category?.name}
                    </span>
                    <span className="text-xs text-[#566b7c]">•</span>
                    <button
                      type="button"
                      onClick={() => project && openProjectDrawer(project.id)}
                      className="text-xs text-[#0b7d83] hover:underline font-semibold truncate"
                    >
                      {project?.name}
                    </button>
                  </div>

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
                          ? 'text-[#941313] font-bold'
                          : urgency.level === 'late_warning'
                          ? 'text-[#d32f2f] font-bold'
                          : ''
                      }
                    >
                      {urgency.dueLabel}
                    </span>
                  </div>
                </div>

                {/* Urgency Progress Bar */}
                <div className="hidden lg:flex flex-col w-48 gap-1">
                  <div className="flex justify-between text-xs text-[#566b7c] font-semibold">
                    <span>Warning Lead Window</span>
                    <span className="tabular-nums">
                      {isCompleted ? '100%' : `${Math.round(urgency.progress * 100)}%`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#e6e8eb] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: isCompleted ? '100%' : `${urgency.progress * 100}%`,
                        backgroundColor: urgency.accentColor,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Badges */}
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

                {/* Interactive Status Selector */}
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
                          onClick={() => {
                            setTaskStatus(task.id, 'not_started');
                            setActiveDropdownTaskId(null);
                          }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#73777d]"></span>
                          <span>Not Started</span>
                        </button>
                        <button
                          type="button"
                          className="h-11 px-3 rounded-lg text-left font-label-sm text-label-sm hover:bg-[#eceef1] flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setTaskStatus(task.id, 'in_progress');
                            setActiveDropdownTaskId(null);
                          }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0b7d83]"></span>
                          <span>In Progress</span>
                        </button>
                        <button
                          type="button"
                          className="h-11 px-3 rounded-lg text-left font-label-sm text-label-sm hover:bg-[#eceef1] flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setTaskStatus(task.id, 'blocked');
                            setActiveDropdownTaskId(null);
                          }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#7d2882]"></span>
                          <span>Blocked</span>
                        </button>
                        <button
                          type="button"
                          className="h-11 px-3 rounded-lg text-left font-label-sm text-label-sm hover:bg-[#eceef1] flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setTaskStatus(task.id, 'completed');
                            setActiveDropdownTaskId(null);
                          }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d42]"></span>
                          <span>Completed</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Edit & Inspect */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openTaskModal(task, task.projectId)}
                    className="w-12 h-12 rounded-xl bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e] flex items-center justify-center active:scale-95 touch-press"
                    title="Edit Task"
                  >
                    <span className="material-symbols-outlined text-[22px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="w-12 h-12 rounded-xl bg-[#eceef1] hover:bg-[#ffdad6] text-[#93000a] flex items-center justify-center active:scale-95 touch-press"
                    title="Delete Task"
                  >
                    <span className="material-symbols-outlined text-[22px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sortedTasks.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-dashed border-[#dfe7ec] text-[#566b7c] font-body-lg">
            No tasks match the selected radar filters.
          </div>
        )}
      </div>
    </div>
  );
};
