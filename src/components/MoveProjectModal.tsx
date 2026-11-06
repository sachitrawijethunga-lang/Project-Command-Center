import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';

export const MoveProjectModal: React.FC = () => {
  const { moveProjectModal, closeMoveProjectModal, categories, executeMoveProject } = useBoard();
  const [selectedCatId, setSelectedCatId] = useState('');

  if (!moveProjectModal) return null;

  const currentCategory = categories.find((c) => c.id === moveProjectModal.categoryId);
  const otherCategories = categories.filter(
    (c) => c.id !== moveProjectModal.categoryId && !c.archivedAt
  );

  const handleConfirm = () => {
    if (!selectedCatId) return;
    executeMoveProject(moveProjectModal.id, selectedCatId);
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#001625]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={closeMoveProjectModal}
    >
      <div
        className="bg-white rounded-xl p-8 shadow-2xl w-[520px] max-w-full flex flex-col gap-6 border border-[#dfe7ec] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-headline-md text-headline-md text-[#14283e] font-bold">
              Move Project to Category
            </h2>
            <p className="font-body-md text-body-md text-[#566b7c] mt-1">
              Project: <span className="font-bold text-[#14283e]">{moveProjectModal.name}</span>
            </p>
          </div>
          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-[#eceef1] hover:bg-[#e6e8eb] flex items-center justify-center text-[#14283e]"
            onClick={closeMoveProjectModal}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-bold text-[#566b7c]">Current Strategic Domain:</span>
          <div className="p-3 bg-[#f2f4f7] rounded-lg font-semibold text-[#14283e]">
            {currentCategory?.name || 'Unassigned'}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-bold text-[#566b7c]">Select Target Domain:</span>
          <div className="flex flex-col gap-2">
            {otherCategories.map((cat) => (
              <label
                key={cat.id}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedCatId === cat.id
                    ? 'bg-[#f2f4f7] border-[#0b7d83] ring-2 ring-[#0b7d83]'
                    : 'bg-white hover:bg-[#f2f4f7] border-[#dfe7ec]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="target-category"
                    value={cat.id}
                    checked={selectedCatId === cat.id}
                    onChange={() => setSelectedCatId(cat.id)}
                    className="w-5 h-5 text-[#0b7d83]"
                  />
                  <span className="font-label-md text-label-md text-[#14283e] font-bold">
                    {cat.name}
                  </span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-[#eceef1] text-[#566b7c] font-semibold">
                  Domain
                </span>
              </label>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#566b7c]">
          All tasks, due timestamps, and warning lead thresholds remain intact under the new parent category.
        </p>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#dfe7ec]">
          <button
            type="button"
            className="h-14 px-6 rounded-xl bg-[#eceef1] text-[#14283e] font-label-md text-label-md font-semibold"
            onClick={closeMoveProjectModal}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedCatId}
            className={`h-14 px-8 rounded-xl font-label-lg text-label-lg font-bold shadow-md active:scale-95 transition-all ${
              selectedCatId
                ? 'bg-[#0b7d83] hover:bg-[#00696e] text-white'
                : 'bg-[#d8dadd] text-[#73777d] cursor-not-allowed'
            }`}
            onClick={handleConfirm}
          >
            Confirm Relocation
          </button>
        </div>
      </div>
    </div>
  );
};
