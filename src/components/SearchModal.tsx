import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { calculateUrgency } from '../utils/urgency';

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    closeSearchModal,
    categories,
    projects,
    tasks,
    people,
    openProjectDrawer,
    openTaskModal,
    currentTime,
    settings,
  } = useBoard();

  const [query, setQuery] = useState('');

  if (!isSearchModalOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedProjects = q
    ? projects.filter((p) => !p.archivedAt && p.name.toLowerCase().includes(q))
    : [];

  const matchedTasks = q
    ? tasks.filter((t) => !t.archivedAt && (t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q)))
    : [];

  const matchedCategories = q
    ? categories.filter((c) => !c.archivedAt && c.name.toLowerCase().includes(q))
    : [];

  const handleSelectProject = (projectId: string) => {
    closeSearchModal();
    openProjectDrawer(projectId);
  };

  const handleSelectTask = (task: any) => {
    closeSearchModal();
    openTaskModal(task, task.projectId);
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#001625]/70 backdrop-blur-sm flex items-start justify-center pt-24 p-4 cursor-pointer"
      onClick={closeSearchModal}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col border border-[#dfe7ec] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-6 bg-[#112b42] text-white flex items-center gap-4">
          <span className="material-symbols-outlined text-[32px] text-[#97f1f7]">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type or tap to search categories, projects, tasks, or owners..."
            className="flex-1 bg-transparent text-white text-xl placeholder:text-[#7b93ae] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">clear</span>
            </button>
          )}
          <button
            type="button"
            onClick={closeSearchModal}
            aria-label="Close"
            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[26px]">close</span>
          </button>
        </div>

        {/* Results Deck */}
        <div className="p-6 max-h-[60vh] overflow-y-auto flex flex-col gap-6">
          {!q && (
            <div className="text-center py-10 text-[#566b7c]">
              <span className="material-symbols-outlined text-[48px] text-[#73777d]/40 mb-2">
                touch_app
              </span>
              <p className="font-label-lg text-label-lg font-semibold text-[#14283e]">
                Search Across Boardroom Database
              </p>
              <p className="text-sm mt-1">
                Instantly jumps to any project drawer, category track, or task inspection sheet.
              </p>
            </div>
          )}

          {q && (
            <>
              {/* Projects */}
              {matchedProjects.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase font-bold text-[#566b7c] tracking-wider">
                    Projects ({matchedProjects.length})
                  </span>
                  {matchedProjects.map((proj) => {
                    const cat = categories.find((c) => c.id === proj.categoryId);
                    const owner = people.find((p) => p.id === proj.ownerId);
                    return (
                      <div
                        key={proj.id}
                        onClick={() => handleSelectProject(proj.id)}
                        className="p-4 rounded-xl bg-[#f2f4f7] hover:bg-[#e6e8eb] cursor-pointer flex items-center justify-between transition-colors border border-[#dfe7ec]"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-[#0b7d83] font-bold">{cat?.name}</span>
                          <span className="font-headline-sm text-headline-sm font-bold text-[#14283e]">
                            {proj.name}
                          </span>
                          <span className="text-sm text-[#566b7c]">
                            Lead: {owner?.displayName || 'Unassigned'}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[#0b7d83]">
                          arrow_forward
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tasks */}
              {matchedTasks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase font-bold text-[#566b7c] tracking-wider">
                    Tasks ({matchedTasks.length})
                  </span>
                  {matchedTasks.map((task) => {
                    const proj = projects.find((p) => p.id === task.projectId);
                    const assignee = people.find((p) => p.id === task.assigneeId);
                    const urgency = calculateUrgency(task, currentTime, settings.timezone);

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleSelectTask(task)}
                        className="p-4 rounded-xl bg-white hover:bg-[#f2f4f7] cursor-pointer flex items-center justify-between transition-colors border border-[#dfe7ec]"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-[#566b7c]">{proj?.name}</span>
                          <span className="font-label-lg text-label-lg font-bold text-[#14283e]">
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-[#566b7c] mt-0.5">
                            <span>Assignee: {assignee?.displayName}</span>
                            <span>•</span>
                            <span className={urgency.isOverdue ? 'text-[#941313] font-bold' : ''}>
                              {urgency.dueLabel}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${urgency.badgeBg} ${urgency.badgeText}`}
                        >
                          {urgency.dueLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Categories */}
              {matchedCategories.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase font-bold text-[#566b7c] tracking-wider">
                    Categories ({matchedCategories.length})
                  </span>
                  {matchedCategories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={closeSearchModal}
                      className="p-4 rounded-xl bg-[#f2f4f7] flex items-center justify-between border border-[#dfe7ec]"
                    >
                      <span className="font-headline-sm text-headline-sm font-bold text-[#14283e]">
                        {cat.name}
                      </span>
                      <span className="text-sm text-[#0b7d83] font-semibold">Domain</span>
                    </div>
                  ))}
                </div>
              )}

              {matchedProjects.length === 0 &&
                matchedTasks.length === 0 &&
                matchedCategories.length === 0 && (
                  <div className="text-center py-8 text-[#566b7c]">
                    No matching records found for &quot;{query}&quot;.
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
