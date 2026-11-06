import React, { useState, useEffect } from 'react';
import { useBoard } from '../context/BoardContext';

export const CategoryModal: React.FC = () => {
  const {
    isCategoryModalOpen,
    closeCategoryModal,
    editingCategory,
    categories,
    people,
    createCategory,
    updateCategory,
    archiveCategory,
    showToast,
  } = useBoard();

  const [name, setName] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [accentColor, setAccentColor] = useState('#0b7d83');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setOwnerId(editingCategory.ownerId);
      setAccentColor(editingCategory.accentColor || '#0b7d83');
    } else {
      setName('');
      setOwnerId(people[0]?.id || '');
      setAccentColor('#0b7d83');
    }
  }, [editingCategory, people, isCategoryModalOpen]);

  if (!isCategoryModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name cannot be blank', 'warning');
      return;
    }
    if (!ownerId) {
      showToast('Please select a category lead', 'warning');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        ownerId,
        accentColor,
      });
      showToast(`Category "${name.trim()}" updated`, 'success');
      closeCategoryModal();
    } else {
      createCategory({
        name: name.trim(),
        ownerId,
        accentColor,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#001625]/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={closeCategoryModal}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-[#dfe7ec] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#112b42] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-[#97f1f7]">folder_open</span>
            <h2 className="font-headline-md text-headline-md text-white font-bold">
              {editingCategory ? 'Edit Strategic Category' : 'Create Strategic Category'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCategoryModal}
            aria-label="Close"
            className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#14283e] font-semibold">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Regional Logistics &amp; Transport"
              className="w-full h-14 px-4 rounded-lg bg-[#eceef1] text-[#14283e] font-headline-sm text-headline-sm focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#14283e] font-semibold">
              Category Responsible Lead *
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
              Domain Accent Color
            </label>
            <div className="flex items-center gap-3">
              {['#0b7d83', '#7d2882', '#c68a1b', '#112b42', '#00696e'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                    accentColor === c ? 'border-[#14283e] scale-105' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {accentColor === c && (
                    <span className="material-symbols-outlined text-white text-[20px]">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#dfe7ec]">
            {editingCategory ? (
              <button
                type="button"
                onClick={() => archiveCategory(editingCategory.id)}
                className="h-14 px-4 rounded-lg bg-[#ffdad6] text-[#93000a] font-label-md text-label-md font-semibold"
              >
                Archive Category
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeCategoryModal}
                className="h-14 px-6 rounded-lg bg-[#eceef1] text-[#14283e] font-label-md text-label-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-14 px-8 rounded-lg bg-[#0b7d83] hover:bg-[#00696e] text-white font-label-lg text-label-lg font-bold shadow-md"
              >
                Save Category
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
