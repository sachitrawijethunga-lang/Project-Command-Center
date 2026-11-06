import React, { useState, useEffect } from 'react';
import { useBoard } from '../context/BoardContext';

export const ProjectModal: React.FC = () => {
  const {
    isProjectModalOpen,
    closeProjectModal,
    editingProject,
    projectModalDefaultCategoryId,
    categories,
    people,
    createProject,
    updateProject,
    showToast,
  } = useBoard();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [portfolioTrack, setPortfolioTrack] = useState('STREAM-01');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setCategoryId(editingProject.categoryId);
      setOwnerId(editingProject.ownerId);
      setPortfolioTrack(editingProject.portfolioTrack || 'STREAM-01');
      setDescription(editingProject.description || '');
    } else {
      setName('');
      setCategoryId(projectModalDefaultCategoryId || categories[0]?.id || '');
      setOwnerId(people[0]?.id || '');
      setPortfolioTrack(`TRK-${Math.floor(100 + Math.random() * 900)}`);
      setDescription('');
    }
  }, [editingProject, projectModalDefaultCategoryId, categories, people, isProjectModalOpen]);

  if (!isProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Project name is mandatory', 'warning');
      return;
    }
    if (!categoryId) {
      showToast('Please select a parent category', 'warning');
      return;
    }
    if (!ownerId) {
      showToast('Please select a project owner', 'warning');
      return;
    }

    if (editingProject) {
      updateProject(editingProject.id, {
        name: name.trim(),
        categoryId,
        ownerId,
        portfolioTrack,
        description: description.trim() || undefined,
      });
      showToast(`Project "${name.trim()}" updated`, 'success');
      closeProjectModal();
    } else {
      createProject({
        name: name.trim(),
        categoryId,
        ownerId,
        portfolioTrack,
        description: description.trim() || undefined,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#001625]/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={closeProjectModal}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-[#dfe7ec] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#112b42] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-[#97f1f7]">dashboard_customize</span>
            <h2 className="font-headline-md text-headline-md text-white font-bold">
              {editingProject ? 'Edit Project Initiative' : 'Create Project Initiative'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeProjectModal}
            aria-label="Close"
            className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#14283e] font-semibold">
              Parent Category *
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full h-14 px-4 rounded-lg bg-[#eceef1] text-[#14283e] font-label-md text-label-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
              >
                {categories
                  .filter((c) => !c.archivedAt)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-4 text-[#566b7c] pointer-events-none">
                arrow_drop_down
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#14283e] font-semibold">
              Project Initiative Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Regional Telemedicine Node"
              className="w-full h-14 px-4 rounded-lg bg-[#eceef1] text-[#14283e] font-headline-sm text-headline-sm focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#14283e] font-semibold">
              Project Owner / Lead *
            </label>
            <div className="relative">
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                required
                className="w-full h-14 px-4 rounded-lg bg-[#eceef1] text-[#14283e] font-label-md text-label-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
              >
                {people
                  .filter((p) => p.active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}
                    </option>
                  ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-4 text-[#566b7c] pointer-events-none">
                arrow_drop_down
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#14283e] font-semibold">
              Portfolio Track Tag
            </label>
            <input
              type="text"
              value={portfolioTrack}
              onChange={(e) => setPortfolioTrack(e.target.value)}
              placeholder="e.g., DH-204"
              className="w-full h-12 px-4 rounded-lg bg-[#eceef1] text-[#14283e] font-mono text-sm uppercase"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#14283e] font-semibold">
              Description / Scope
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief executive summary of initiative goals..."
              className="w-full p-3 rounded-lg bg-[#eceef1] text-sm text-[#14283e] resize-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#dfe7ec]">
            <button
              type="button"
              onClick={closeProjectModal}
              className="h-14 px-6 rounded-lg bg-[#eceef1] text-[#14283e] font-label-md text-label-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-14 px-8 rounded-lg bg-[#0b7d83] hover:bg-[#00696e] text-white font-label-lg text-label-lg font-bold shadow-md"
            >
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
