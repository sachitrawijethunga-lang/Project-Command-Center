import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  ActiveView,
  BoardSettings,
  Category,
  CockpitFilter,
  Person,
  Project,
  Snapshot,
  Task,
  TaskStatus,
} from '../types/cockpit';
import {
  INITIAL_CATEGORIES,
  INITIAL_PEOPLE,
  INITIAL_PROJECTS,
  INITIAL_SNAPSHOTS,
  INITIAL_TASKS,
} from '../utils/initialData';
import { calculateUrgency } from '../utils/urgency';

interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}

interface DeleteConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  impactSummary?: string;
  onConfirm: () => void;
}

interface BoardContextType {
  // Entities
  people: Person[];
  categories: Category[];
  projects: Project[];
  tasks: Task[];
  settings: BoardSettings;
  snapshots: Snapshot[];

  // Navigation & View State
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  filter: CockpitFilter;
  setFilter: (filter: CockpitFilter) => void;
  selectedProjectId: string | null;
  selectedProject: Project | null;
  openProjectDrawer: (projectId: string) => void;
  closeProjectDrawer: () => void;

  // Modals & Triggers
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  taskModalDefaultProjectId: string | null;
  openTaskModal: (task?: Task, defaultProjectId?: string) => void;
  closeTaskModal: () => void;

  isCategoryModalOpen: boolean;
  editingCategory: Category | null;
  openCategoryModal: (category?: Category) => void;
  closeCategoryModal: () => void;

  isProjectModalOpen: boolean;
  editingProject: Project | null;
  projectModalDefaultCategoryId: string | null;
  openProjectModal: (project?: Project, defaultCategoryId?: string) => void;
  closeProjectModal: () => void;

  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;

  isOwnerModalOpen: boolean;
  ownerModalTarget: { type: 'project' | 'category' | 'task'; id: string } | null;
  openOwnerModal: (target: { type: 'project' | 'category' | 'task'; id: string }) => void;
  closeOwnerModal: () => void;
  reassignOwner: (newPersonId: string) => void;

  restoreModalSnapshot: Snapshot | null;
  openRestoreModal: (snapshot: Snapshot) => void;
  closeRestoreModal: () => void;
  executeRestoreSnapshot: (snapshotId: string) => void;

  moveProjectModal: Project | null;
  openMoveProjectModal: (project: Project) => void;
  closeMoveProjectModal: () => void;
  executeMoveProject: (projectId: string, newCategoryId: string) => void;

  deleteConfirmModal: DeleteConfirmState | null;
  openDeleteConfirm: (data: Omit<DeleteConfirmState, 'isOpen'>) => void;
  closeDeleteConfirm: () => void;

  // Cloud & Persistence
  isSyncing: boolean;
  lastSyncTime: Date;
  writeTimeAgo: string;
  cloudConnected: boolean;
  triggerSync: () => void;
  exportJson: () => void;
  importJson: (jsonString: string) => { success: boolean; error?: string };

  // CRUD
  createTask: (data: Omit<Task, 'id' | 'order'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;

  createProject: (data: Omit<Project, 'id' | 'order'>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  archiveProject: (projectId: string) => void;

  createCategory: (data: Omit<Category, 'id' | 'order'>) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  archiveCategory: (categoryId: string, reassignToCatId?: string) => void;

  addPerson: (displayName: string, roleTitle?: string) => Person;
  updatePerson: (personId: string, updates: Partial<Person>) => void;
  deleteAllProjects: () => void;
  renameBoardTitle: (newTitle: string) => void;
  updateSettings: (updates: Partial<BoardSettings>) => void;

  // UI
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  currentTime: Date;
}

const STORAGE_KEY = 'executive_cockpit_state_v5';

const DEFAULT_SETTINGS: BoardSettings = {
  boardTitle: 'Project Command Centre',
  timezone: 'Asia/Colombo',
  defaultWarningLeadMinutes: 10080, // 7 days
  density: 'spacious',
  presentationMode: false,
};

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge v1, v2, v3 and v4 caches if present to ensure no stale designations or old projects linger
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      ['v1', 'v2', 'v3', 'v4'].forEach((ver) => {
        ['people', 'categories', 'projects', 'tasks', 'settings', 'snapshots'].forEach((k) => {
          localStorage.removeItem(`executive_cockpit_state_${ver}_${k}`);
        });
      });
    }
  } catch {}

  // Load initial data from localStorage if present
  const [people, setPeople] = useState<Person[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_people`);
      if (saved) {
        const parsed: Person[] = JSON.parse(saved);
        // Ensure no "Dr." or other designation remains and remove role titles
        const cleaned = parsed.map((p) => ({
          ...p,
          displayName: p.displayName.replace(/^(Dr\.|Prof\.|Eng\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim(),
          roleTitle: undefined,
        }));
        const validNames = new Set(INITIAL_PEOPLE.map((p) => p.displayName));
        const isValid = cleaned.length === INITIAL_PEOPLE.length && cleaned.every((p) => validNames.has(p.displayName));
        if (isValid) return cleaned;
      }
      return INITIAL_PEOPLE;
    } catch {
      return INITIAL_PEOPLE;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Projects start empty as requested
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  // Tasks start empty as requested
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [settings, setSettings] = useState<BoardSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_snapshots`);
      return saved ? JSON.parse(saved) : INITIAL_SNAPSHOTS;
    } catch {
      return INITIAL_SNAPSHOTS;
    }
  });

  // Navigation & Filter State
  const [activeView, setActiveView] = useState<ActiveView>('command-overview');
  const [filter, setFilter] = useState<CockpitFilter>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalDefaultProjectId, setTaskModalDefaultProjectId] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectModalDefaultCategoryId, setProjectModalDefaultCategoryId] = useState<string | null>(null);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [ownerModalTarget, setOwnerModalTarget] = useState<{ type: 'project' | 'category' | 'task'; id: string } | null>(null);

  const [restoreModalSnapshot, setRestoreModalSnapshot] = useState<Snapshot | null>(null);
  const [moveProjectModal, setMoveProjectModal] = useState<Project | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<DeleteConfirmState | null>(null);

  // Cloud & Sync
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [writeTimeAgo, setWriteTimeAgo] = useState('Just now');
  const [cloudConnected, setCloudConnected] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync state to localStorage for persistence
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_people`, JSON.stringify(people));
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [people]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_snapshots`, JSON.stringify(snapshots));
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [snapshots]);

  // Periodic clock ticker to keep relative time readouts and urgency updated
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const elapsedSec = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000);
      if (elapsedSec < 60) {
        setWriteTimeAgo(`${Math.max(1, elapsedSec)}s ago`);
      } else {
        const mins = Math.floor(elapsedSec / 60);
        setWriteTimeAgo(`${mins}m ago`);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [lastSyncTime]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3200);
  };

  const markStateSaved = () => {
    setLastSyncTime(new Date());
    setWriteTimeAgo('0s ago');
  };

  // Selected project memo
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Drawer controls
  const openProjectDrawer = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const closeProjectDrawer = () => {
    setSelectedProjectId(null);
  };

  // Task Modal controls
  const openTaskModal = (task?: Task, defaultProjectId?: string) => {
    setEditingTask(task || null);
    setTaskModalDefaultProjectId(defaultProjectId || (selectedProjectId || (projects[0]?.id || '')));
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTaskModalDefaultProjectId(null);
  };

  // Category Modal controls
  const openCategoryModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Project Modal controls
  const openProjectModal = (project?: Project, defaultCategoryId?: string) => {
    setEditingProject(project || null);
    setProjectModalDefaultCategoryId(defaultCategoryId || (categories[0]?.id || ''));
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
    setProjectModalDefaultCategoryId(null);
  };

  // Search Modal
  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  // Owner Modal
  const openOwnerModal = (target: { type: 'project' | 'category' | 'task'; id: string }) => {
    setOwnerModalTarget(target);
    setIsOwnerModalOpen(true);
  };

  const closeOwnerModal = () => {
    setIsOwnerModalOpen(false);
    setOwnerModalTarget(null);
  };

  const reassignOwner = (newPersonId: string) => {
    if (!ownerModalTarget) return;
    const person = people.find((p) => p.id === newPersonId);
    if (!person) return;

    if (ownerModalTarget.type === 'project') {
      updateProject(ownerModalTarget.id, { ownerId: newPersonId });
      showToast(`Project Lead reassigned to ${person.displayName}`, 'success');
    } else if (ownerModalTarget.type === 'category') {
      updateCategory(ownerModalTarget.id, { ownerId: newPersonId });
      showToast(`Category Lead reassigned to ${person.displayName}`, 'success');
    } else if (ownerModalTarget.type === 'task') {
      updateTask(ownerModalTarget.id, { assigneeId: newPersonId });
      showToast(`Task assigned to ${person.displayName}`, 'success');
    }
    closeOwnerModal();
  };

  // Move Project Modal
  const openMoveProjectModal = (project: Project) => setMoveProjectModal(project);
  const closeMoveProjectModal = () => setMoveProjectModal(null);
  const executeMoveProject = (projectId: string, newCategoryId: string) => {
    const targetCat = categories.find((c) => c.id === newCategoryId);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, categoryId: newCategoryId } : p))
    );
    markStateSaved();
    showToast(`Project moved to "${targetCat?.name || 'New Category'}"`, 'success');
    closeMoveProjectModal();
  };

  // Restore Modal
  const openRestoreModal = (snapshot: Snapshot) => setRestoreModalSnapshot(snapshot);
  const closeRestoreModal = () => setRestoreModalSnapshot(null);
  const executeRestoreSnapshot = (snapshotId: string) => {
    closeRestoreModal();
    // Simulate restoration of authoritative snapshot
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      markStateSaved();
      showToast(`Authoritative Snapshot ${snapshotId} Restored & Mounted`, 'success');
    }, 600);
  };

  // Delete Confirm Modal
  const openDeleteConfirm = (data: Omit<DeleteConfirmState, 'isOpen'>) => {
    setDeleteConfirmModal({ ...data, isOpen: true });
  };
  const closeDeleteConfirm = () => setDeleteConfirmModal(null);

  // Task Operations
  const createTask = (data: Omit<Task, 'id' | 'order'>) => {
    const newTask: Task = {
      ...data,
      id: `t-${Date.now()}`,
      order: tasks.filter((t) => t.projectId === data.projectId).length + 1,
    };
    setTasks((prev) => [newTask, ...prev]);
    markStateSaved();
    showToast(`Task "${newTask.title}" saved to cloud`, 'success');
    closeTaskModal();
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updated = { ...t, ...updates };
        if (updates.status === 'completed' && !t.completedAt) {
          updated.completedAt = new Date().toISOString();
        } else if (updates.status && updates.status !== 'completed') {
          updated.completedAt = undefined;
        }
        return updated;
      })
    );
    markStateSaved();
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    openDeleteConfirm({
      title: 'Confirm Task Deletion',
      message: `Are you sure you want to delete "${task?.title || 'this task'}"?`,
      impactSummary: 'The task record will be removed from the project backlog permanently.',
      onConfirm: () => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        markStateSaved();
        showToast('Task removed safely', 'info');
        closeDeleteConfirm();
      },
    });
  };

  const setTaskStatus = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status });
    const statusTitles: Record<TaskStatus, string> = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      blocked: 'Blocked',
      completed: 'Completed',
    };
    showToast(`Status changed to ${statusTitles[status]}`, 'info');
  };

  // Project Operations
  const createProject = (data: Omit<Project, 'id' | 'order'>) => {
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      order: projects.filter((p) => p.categoryId === data.categoryId).length + 1,
    };
    setProjects((prev) => [...prev, newProject]);
    markStateSaved();
    showToast(`Project "${newProject.name}" created`, 'success');
    closeProjectModal();
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
    markStateSaved();
  };

  const archiveProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const projTasks = tasks.filter((t) => t.projectId === projectId && !t.archivedAt);

    openDeleteConfirm({
      title: 'Confirm Project Archival',
      message: `Archive project "${project?.name || ''}"?`,
      impactSummary: `${projTasks.length} associated tasks will be archived together without data loss.`,
      onConfirm: () => {
        const nowIso = new Date().toISOString();
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, archivedAt: nowIso } : p))
        );
        setTasks((prev) =>
          prev.map((t) => (t.projectId === projectId ? { ...t, archivedAt: nowIso } : t))
        );
        if (selectedProjectId === projectId) {
          closeProjectDrawer();
        }
        markStateSaved();
        showToast(`Project "${project?.name}" archived safely`, 'info');
        closeDeleteConfirm();
      },
    });
  };

  // Category Operations
  const createCategory = (data: Omit<Category, 'id' | 'order'>) => {
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      order: categories.length + 1,
    };
    setCategories((prev) => [...prev, newCat]);
    markStateSaved();
    showToast(`Category "${newCat.name}" added to cockpit`, 'success');
    closeCategoryModal();
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, ...updates } : c))
    );
    markStateSaved();
  };

  const archiveCategory = (categoryId: string, reassignToCatId?: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const catProjects = projects.filter((p) => p.categoryId === categoryId && !p.archivedAt);

    if (catProjects.length > 0 && !reassignToCatId) {
      openDeleteConfirm({
        title: 'Category Contains Active Projects',
        message: `Category "${category?.name}" contains ${catProjects.length} active projects.`,
        impactSummary: 'Choose to archive the entire category with all projects, or reassign projects to another category.',
        onConfirm: () => {
          const nowIso = new Date().toISOString();
          setCategories((prev) =>
            prev.map((c) => (c.id === categoryId ? { ...c, archivedAt: nowIso } : c))
          );
          setProjects((prev) =>
            prev.map((p) => (p.categoryId === categoryId ? { ...p, archivedAt: nowIso } : p))
          );
          markStateSaved();
          showToast(`Category "${category?.name}" and projects archived`, 'info');
          closeDeleteConfirm();
        },
      });
      return;
    }

    if (reassignToCatId) {
      setProjects((prev) =>
        prev.map((p) => (p.categoryId === categoryId ? { ...p, categoryId: reassignToCatId } : p))
      );
    }

    const nowIso = new Date().toISOString();
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, archivedAt: nowIso } : c))
    );
    markStateSaved();
    showToast(`Category "${category?.name}" archived`, 'info');
  };

  // Person addition
  const addPerson = (displayName: string, _roleTitle?: string): Person => {
    const cleanName = displayName.replace(/^(Dr\.|Prof\.|Eng\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
    const initials = cleanName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'OP';

    const newPerson: Person = {
      id: `p-${Date.now()}`,
      displayName: cleanName,
      roleTitle: undefined,
      avatarInitials: initials,
      active: true,
    };
    setPeople((prev) => [...prev, newPerson]);
    markStateSaved();
    showToast(`Added ${cleanName} to directory`, 'success');
    return newPerson;
  };

  const updatePerson = (personId: string, updates: Partial<Person>) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== personId) return p;
        const newName = updates.displayName !== undefined
          ? updates.displayName.replace(/^(Dr\.|Prof\.|Eng\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim()
          : p.displayName;
        const newInitials = newName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || p.avatarInitials;
        return {
          ...p,
          ...updates,
          displayName: newName,
          roleTitle: undefined,
          avatarInitials: newInitials,
        };
      })
    );
    markStateSaved();
    showToast('Person updated in directory', 'success');
  };

  const deleteAllProjects = () => {
    openDeleteConfirm({
      title: 'Delete All Projects',
      message: 'Are you sure you want to clear all projects across all categories?',
      impactSummary: 'All project initiatives and associated tasks will be permanently removed.',
      onConfirm: () => {
        setProjects([]);
        setTasks([]);
        markStateSaved();
        showToast('All projects and associated tasks deleted', 'info');
        closeDeleteConfirm();
      },
    });
  };

  const renameBoardTitle = (newTitle: string) => {
    if (!newTitle.trim()) return;
    setSettings((prev) => ({ ...prev, boardTitle: newTitle.trim() }));
    markStateSaved();
    showToast(`Board title updated to "${newTitle.trim()}"`, 'success');
  };

  // Settings
  const updateSettings = (updates: Partial<BoardSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    markStateSaved();
    showToast('Display & Board Settings saved', 'success');
  };

  // Force Sync Simulation
  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      markStateSaved();
      showToast('Cloud Gateway Resynchronized (18ms latency)', 'success');
    }, 700);
  };

  // Export JSON
  const exportJson = () => {
    const payload = {
      app: 'Project Command Centre',
      device: '#SB-75-COLOMBO-01',
      exportedAt: new Date().toISOString(),
      schemaVersion: 'v1.4',
      timezone: settings.timezone,
      settings,
      people,
      categories,
      projects,
      tasks,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CommandCentre_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported successfully', 'success');
  };

  // Import JSON with validation
  const importJson = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.categories || !data.projects || !data.tasks) {
        return { success: false, error: 'Invalid schema: missing categories, projects, or tasks array.' };
      }

      if (data.people && Array.isArray(data.people)) setPeople(data.people);
      if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      if (data.projects && Array.isArray(data.projects)) setProjects(data.projects);
      if (data.tasks && Array.isArray(data.tasks)) setTasks(data.tasks);
      if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));

      markStateSaved();
      showToast('Board state successfully restored from JSON backup', 'success');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to parse JSON file' };
    }
  };

  return (
    <BoardContext.Provider
      value={{
        people,
        categories,
        projects,
        tasks,
        settings,
        snapshots,
        activeView,
        setActiveView,
        filter,
        setFilter,
        selectedProjectId,
        selectedProject,
        openProjectDrawer,
        closeProjectDrawer,
        isTaskModalOpen,
        editingTask,
        taskModalDefaultProjectId,
        openTaskModal,
        closeTaskModal,
        isCategoryModalOpen,
        editingCategory,
        openCategoryModal,
        closeCategoryModal,
        isProjectModalOpen,
        editingProject,
        projectModalDefaultCategoryId,
        openProjectModal,
        closeProjectModal,
        isSearchModalOpen,
        openSearchModal,
        closeSearchModal,
        isOwnerModalOpen,
        ownerModalTarget,
        openOwnerModal,
        closeOwnerModal,
        reassignOwner,
        restoreModalSnapshot,
        openRestoreModal,
        closeRestoreModal,
        executeRestoreSnapshot,
        moveProjectModal,
        openMoveProjectModal,
        closeMoveProjectModal,
        executeMoveProject,
        deleteConfirmModal,
        openDeleteConfirm,
        closeDeleteConfirm,
        isSyncing,
        lastSyncTime,
        writeTimeAgo,
        cloudConnected,
        triggerSync,
        exportJson,
        importJson,
        createTask,
        updateTask,
        deleteTask,
        setTaskStatus,
        createProject,
        updateProject,
        archiveProject,
        createCategory,
        updateCategory,
        archiveCategory,
        addPerson,
        updatePerson,
        deleteAllProjects,
        renameBoardTitle,
        updateSettings,
        toast,
        showToast,
        currentTime,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};
