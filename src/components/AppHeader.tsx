import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { calculateUrgency } from '../utils/urgency';

export const AppHeader: React.FC = () => {
  const {
    activeView,
    setActiveView,
    projects,
    tasks,
    settings,
    openCategoryModal,
    openTaskModal,
    openSearchModal,
    currentTime,
    writeTimeAgo,
    isSyncing,
    renameBoardTitle,
    updateSettings,
    showToast,
  } = useBoard();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(settings.boardTitle);

  const handleSaveTitle = () => {
    if (titleValue.trim()) {
      renameBoardTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      showToast('Entered 75" Fullscreen Wallmount Mode', 'info');
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
      showToast('Exited Fullscreen Mode', 'info');
    }
  };

  const togglePresentation = () => {
    const nextState = !settings.presentationMode;
    updateSettings({ presentationMode: nextState });
    showToast(
      nextState ? 'Presentation Mode Activated (Boardroom View)' : 'Presentation Mode Exited',
      'info'
    );
  };

  // Dynamic statistics
  const activeProjects = projects.filter((p) => !p.archivedAt);
  const activeTasks = tasks.filter((t) => !t.archivedAt);

  const stats = React.useMemo(() => {
    let overdueCount = 0;
    let dueSoonCount = 0;
    let completedCount = 0;

    activeTasks.forEach((t) => {
      if (t.status === 'completed') {
        completedCount++;
        return;
      }
      const u = calculateUrgency(t, currentTime, settings.timezone);
      if (u.isOverdue) overdueCount++;
      else if (u.isDueSoon) dueSoonCount++;
    });

    const completionRate =
      activeTasks.length > 0 ? Math.round((completedCount / activeTasks.length) * 100) : 0;

    return {
      portfolioCount: activeProjects.length,
      overdueCount,
      dueSoonCount,
      completionRate,
    };
  }, [activeProjects, activeTasks, currentTime, settings.timezone]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#112b42] text-white shadow-lg border-b border-[#dfe7ec]/20 select-none">
      {/* Upper 28 (h-28) Authority Crown Bar */}
      <div className="h-28 px-8 flex items-center justify-between gap-6">
        {/* Left: Branding & 75" Wall Mount Anchor */}
        <div className="flex items-center gap-5 shrink-0">
          <div
            className="w-14 h-14 rounded-xl bg-[#0b7d83] flex items-center justify-center text-white shadow-md flex-shrink-0 cursor-pointer touch-press"
            onClick={() => setActiveView('command-overview')}
            title="Reset to Command Overview"
          >
            <span className="material-symbols-outlined text-[32px]">view_kanban</span>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="h-10 px-3 bg-[#162b3a] text-white border border-[#0b7d83] rounded-lg text-lg font-bold font-manrope focus:outline-none ring-2 ring-[#0b7d83]/50"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTitle}
                    className="h-10 px-3 bg-[#0b7d83] hover:bg-[#00696e] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(false)}
                    className="h-10 px-2.5 bg-white/10 hover:bg-white/20 text-[#7b93ae] rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span
                    onClick={() => {
                      setTitleValue(settings.boardTitle);
                      setIsEditingTitle(true);
                    }}
                    className="text-2xl xl:text-3xl tracking-tight font-bold text-white uppercase leading-none font-manrope whitespace-nowrap cursor-pointer hover:text-[#97f1f7] transition-colors"
                    title="Click to Rename Board Title"
                  >
                    {settings.boardTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTitleValue(settings.boardTitle);
                      setIsEditingTitle(true);
                    }}
                    className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/15 text-[#7b93ae] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Rename Board Title"
                    aria-label="Rename Board Title"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
              )}
              <span className="px-2 py-0.5 rounded bg-[#0b7d83]/20 text-[#97f1f7] border border-[#97f1f7]/30 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                75&quot; Wall Mount
              </span>
              {settings.presentationMode && (
                <span className="px-2 py-0.5 rounded bg-[#c68a1b]/20 text-[#c68a1b] border border-[#c68a1b]/30 text-xs uppercase tracking-wide font-bold whitespace-nowrap">
                  Presenting
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[#7b93ae] text-sm whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d42] ring-4 ring-[#1b6d42]/20 flex-shrink-0"></span>
              <span>Cloud Connected</span>
              <span className="opacity-40">•</span>
              <span>{settings.timezone.replace('_', ' ')}</span>
              <span className="opacity-40">•</span>
              <span>Touch Host Session Active</span>
            </div>
          </div>
        </div>

        {/* Center: Executive KPI Banner */}
        <div className="hidden lg:flex items-center gap-4 bg-[#162b3a]/90 border border-[#dfe7ec]/15 rounded-xl px-6 py-2">
          <div className="flex items-center gap-3 pr-4 border-r border-[#dfe7ec]/20">
            <span className="font-label-md text-label-md text-[#7d93a5]">Portfolios</span>
            <span className="font-headline-md text-headline-md text-white tabular-nums">
              {stats.portfolioCount}
            </span>
          </div>

          <div className="flex items-center gap-3 pr-4 border-r border-[#dfe7ec]/20">
            <span className="w-3 h-3 rounded-full bg-[#d96520]"></span>
            <span className="font-label-md text-label-md text-[#7d93a5]">Due Soon</span>
            <span className="font-headline-md text-headline-md text-white tabular-nums">
              {stats.dueSoonCount}
            </span>
          </div>

          <div className="flex items-center gap-3 pr-4 border-r border-[#dfe7ec]/20">
            <span className="w-3 h-3 rounded-full bg-[#d32f2f]"></span>
            <span className="font-label-md text-label-md text-[#7d93a5]">Overdue</span>
            <span className="font-headline-md text-headline-md text-[#d32f2f] font-bold tabular-nums">
              {stats.overdueCount}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-label-md text-label-md text-[#7d93a5]">Health</span>
            <span className="font-headline-md text-headline-md text-[#1b6d42] font-bold tabular-nums">
              {stats.completionRate}%
            </span>
            <span className="font-label-sm text-label-sm text-[#7d93a5]">Completed</span>
          </div>
        </div>

        {/* Right: Touch Controls & Profile */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-14 px-4 rounded-xl bg-white text-[#14283e] border border-[#dfe7ec] flex items-center gap-2 font-label-lg text-label-lg shadow-sm active:scale-95 transition-all touch-press"
            onClick={openSearchModal}
            title="Search Portfolios, Projects & Tasks"
          >
            <span className="material-symbols-outlined text-[26px]">search</span>
            <span className="hidden sm:inline">Search (Tap)</span>
          </button>

          <button
            type="button"
            className={`h-14 px-4 rounded-xl border flex items-center gap-2 font-label-lg text-label-lg shadow-sm active:scale-95 transition-all touch-press ${
              settings.presentationMode
                ? 'bg-[#0b7d83] text-white border-[#0b7d83]'
                : 'bg-white text-[#14283e] border-[#dfe7ec]'
            }`}
            onClick={togglePresentation}
            title="Toggle Boardroom Presentation Mode"
          >
            <span className="material-symbols-outlined text-[26px]">slideshow</span>
            <span className="hidden sm:inline">Present</span>
          </button>

          <button
            type="button"
            className="h-14 w-14 rounded-xl bg-white text-[#14283e] border border-[#dfe7ec] flex items-center justify-center active:scale-95 transition-all shadow-sm touch-press"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter 75" Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            <span className="material-symbols-outlined text-[28px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>

          {/* Colombo HQ Operations Avatar */}
          <div
            className="w-14 h-14 rounded-xl bg-[#001629] border-2 border-[#dfe7ec]/40 flex items-center justify-center font-bold text-[#97f1f7] text-lg shadow-sm"
            title="Boardroom Master Console #SB-75-COLOMBO-01"
          >
            HQ
          </div>
        </div>
      </div>

      {/* Lower 14 (h-14) Navigation & Rapid Execution Bar */}
      <div className="h-14 px-8 bg-[#001629] border-t border-[#dfe7ec]/10 flex items-center justify-between">
        <nav className="flex items-center gap-2 h-full">
          <button
            type="button"
            onClick={() => setActiveView('command-overview')}
            className={`h-11 px-5 rounded-lg flex items-center font-label-lg text-label-lg transition-all ${
              activeView === 'command-overview'
                ? 'bg-[#0b7d83] text-white font-bold shadow-sm'
                : 'text-[#7b93ae] hover:text-white'
            }`}
          >
            Command Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveView('tasks-urgency-radar')}
            className={`h-11 px-5 rounded-lg flex items-center font-label-lg text-label-lg transition-all ${
              activeView === 'tasks-urgency-radar'
                ? 'bg-[#0b7d83] text-white font-bold shadow-sm'
                : 'text-[#7b93ae] hover:text-white'
            }`}
          >
            Tasks &amp; Urgency Radar
          </button>

          <button
            type="button"
            onClick={() => setActiveView('cloud-backups')}
            className={`h-11 px-5 rounded-lg flex items-center font-label-lg text-label-lg transition-all ${
              activeView === 'cloud-backups'
                ? 'bg-[#0b7d83] text-white font-bold shadow-sm'
                : 'text-[#7b93ae] hover:text-white'
            }`}
          >
            Cloud &amp; Backups
          </button>
        </nav>

        {/* Right side live status & creation triggers */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[#7b93ae] font-label-sm text-label-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isSyncing ? 'bg-[#c68a1b] animate-ping' : 'bg-[#1b6d42] animate-pulse'
              }`}
            ></span>
            <span>{isSyncing ? 'Syncing...' : 'All Systems Operational'}</span>
            <span className="opacity-40">•</span>
            <span>Cloud Synced {writeTimeAgo}</span>
          </div>

          <div className="h-6 w-px bg-[#dfe7ec]/20 hidden md:block"></div>

          {!settings.presentationMode && (
            <>
              <button
                type="button"
                onClick={() => openCategoryModal()}
                className="h-10 px-4 rounded-lg bg-[#0b7d83] hover:bg-[#00696e] text-white flex items-center gap-1.5 font-label-md text-label-md active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Category</span>
              </button>

              <button
                type="button"
                onClick={() => openTaskModal()}
                className="h-10 px-4 rounded-lg bg-white hover:bg-[#eceef1] text-[#14283e] flex items-center gap-1.5 font-label-md text-label-md active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">add_task</span>
                <span>Quick Task</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
