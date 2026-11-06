import React from 'react';
import { useBoard } from '../context/BoardContext';
import { calculateUrgency } from '../utils/urgency';

export const PortfolioSidebar: React.FC = () => {
  const { categories, projects, tasks, openProjectDrawer, currentTime, settings } = useBoard();

  // Helper to determine category dominant urgency color dot
  const getCategoryStatusDot = (categoryId: string) => {
    const catProjects = projects.filter((p) => p.categoryId === categoryId && !p.archivedAt);
    const catProjectIds = new Set(catProjects.map((p) => p.id));
    const catTasks = tasks.filter((t) => catProjectIds.has(t.projectId) && !t.archivedAt);

    let hasOverdue = false;
    let hasBlocked = false;
    let hasDueSoon = false;
    let allCompleted = catTasks.length > 0;

    catTasks.forEach((t) => {
      if (t.status !== 'completed') {
        allCompleted = false;
      }
      if (t.status === 'blocked') {
        hasBlocked = true;
      }
      const u = calculateUrgency(t, currentTime, settings.timezone);
      if (u.isOverdue) hasOverdue = true;
      else if (u.isDueSoon) hasDueSoon = true;
    });

    if (hasOverdue) return 'bg-[#d32f2f]';
    if (hasBlocked) return 'bg-[#7d2882]';
    if (hasDueSoon) return 'bg-[#c68a1b]';
    if (allCompleted && catTasks.length > 0) return 'bg-[#1b6d42]';
    return 'bg-[#0b7d83]';
  };

  return (
    <aside className="fixed left-0 top-[168px] bottom-0 w-72 bg-white border-r border-[#dfe7ec] z-40 flex flex-col justify-between p-4 select-none">
      <div className="flex flex-col gap-4">
        <div className="px-2 py-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#566b7c] font-semibold">
            Strategic Portfolios
          </span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {categories
            .filter((c) => !c.archivedAt)
            .map((category) => {
              const catProjects = projects.filter(
                (p) => p.categoryId === category.id && !p.archivedAt
              );
              const dotColor = getCategoryStatusDot(category.id);

              return (
                <div key={category.id} className="flex flex-col">
                  <div className="h-14 px-3 rounded-xl flex items-center justify-between text-[#14283e] font-label-md text-label-md bg-[#f2f4f7] border border-[#dfe7ec]/60">
                    <div className="flex items-center min-w-0">
                      <span className={`w-3 h-3 rounded-full ${dotColor} mr-3 flex-shrink-0`}></span>
                      <span className="truncate font-bold">{category.name}</span>
                    </div>
                    <span className="text-xs bg-white text-[#566b7c] px-2 py-0.5 rounded-full font-semibold border border-[#dfe7ec]">
                      {catProjects.length}
                    </span>
                  </div>

                  {/* Project quick jump links under category */}
                  <div className="pl-6 pt-1 flex flex-col gap-1">
                    {catProjects.slice(0, 3).map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => openProjectDrawer(project.id)}
                        className="text-left text-sm py-1.5 px-2 rounded-lg text-[#566b7c] hover:text-[#14283e] hover:bg-[#eceef1] truncate transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate">{project.name}</span>
                        <span className="material-symbols-outlined text-[16px] text-[#73777d] opacity-0 group-hover:opacity-100 transition-opacity">
                          chevron_right
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
        </nav>
      </div>

      {/* Interactive touch calibration readiness footer */}
      <div className="p-4 bg-[#f2f4f7] rounded-xl border border-[#dfe7ec]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-label-sm text-label-sm text-[#566b7c] font-medium">Interactive Touch</span>
          <span className="px-2 py-0.5 rounded bg-[#1b6d42]/10 text-[#1b6d42] font-label-sm text-label-sm font-semibold">
            Ready
          </span>
        </div>
        <p className="font-body-md text-body-md text-[#566b7c]">
          Stylus &amp; Multi-finger Gestures Calibrated
        </p>
      </div>
    </aside>
  );
};
