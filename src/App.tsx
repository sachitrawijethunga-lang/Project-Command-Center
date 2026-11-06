import React from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { AppHeader } from './components/AppHeader';
import { PortfolioSidebar } from './components/PortfolioSidebar';
import { OverviewView } from './components/OverviewView';
import { UrgencyRadarView } from './components/UrgencyRadarView';
import { CloudBackupsView } from './components/CloudBackupsView';
import { ProjectDrawer } from './components/ProjectDrawer';
import { TaskModal } from './components/TaskModal';
import { CategoryModal } from './components/CategoryModal';
import { ProjectModal } from './components/ProjectModal';
import { SearchModal } from './components/SearchModal';
import { OwnerModal } from './components/OwnerModal';
import { RestoreModal } from './components/RestoreModal';
import { MoveProjectModal } from './components/MoveProjectModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Toast } from './components/Toast';

const CockpitMain: React.FC = () => {
  const { activeView, settings, updateSettings, showToast } = useBoard();

  // Triple-tap or quick clicks in the top corner to exit Presentation Mode
  const [cornerClicks, setCornerClicks] = React.useState(0);

  const handleCornerClick = () => {
    if (settings.presentationMode) {
      const next = cornerClicks + 1;
      if (next >= 3) {
        updateSettings({ presentationMode: false });
        showToast('Presentation Mode Exited via Touch Gesture', 'info');
        setCornerClicks(0);
      } else {
        setCornerClicks(next);
        setTimeout(() => setCornerClicks(0), 1200);
      }
    }
  };

  return (
    <div className={`min-h-screen bg-[#f7f9fc] text-[#191c1e] antialiased select-none ${settings.density === 'condensed' ? 'text-sm' : ''}`}>
      {/* Invisible corner tap trigger to exit presentation mode */}
      {settings.presentationMode && (
        <div
          className="fixed top-0 right-0 w-20 h-20 z-[60] cursor-pointer"
          onClick={handleCornerClick}
          title="Triple-tap here to exit presentation mode"
        />
      )}

      {/* Top Header */}
      <AppHeader />

      {/* Left Sidebar (Hidden during presentation mode for maximum clean canvas) */}
      {!settings.presentationMode && <PortfolioSidebar />}

      {/* Main Viewport */}
      <div className={!settings.presentationMode ? 'pl-72' : 'pl-0'}>
        <main
          className={`relative pt-[184px] bg-[#f7f9fc] min-h-screen transition-all ${
            settings.density === 'spacious' ? 'px-8 py-8' : 'px-6 py-6'
          }`}
        >
          {activeView === 'command-overview' && <OverviewView />}
          {activeView === 'tasks-urgency-radar' && <UrgencyRadarView />}
          {activeView === 'cloud-backups' && <CloudBackupsView />}
        </main>
      </div>

      {/* Side Project Inspection Drawer */}
      <ProjectDrawer />

      {/* Modals */}
      <TaskModal />
      <CategoryModal />
      <ProjectModal />
      <SearchModal />
      <OwnerModal />
      <RestoreModal />
      <MoveProjectModal />
      <DeleteConfirmModal />

      {/* Feedback Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <BoardProvider>
      <CockpitMain />
    </BoardProvider>
  );
}
