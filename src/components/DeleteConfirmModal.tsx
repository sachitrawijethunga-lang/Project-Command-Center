import React from 'react';
import { useBoard } from '../context/BoardContext';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteConfirmModal, closeDeleteConfirm } = useBoard();

  if (!deleteConfirmModal || !deleteConfirmModal.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-[#001625]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={closeDeleteConfirm}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl flex flex-col gap-6 border border-[#dfe7ec] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[32px]">warning</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-[#14283e] font-bold">
              {deleteConfirmModal.title}
            </h3>
            <p className="font-body-md text-body-md text-[#566b7c] mt-1">
              {deleteConfirmModal.message}
            </p>
          </div>
        </div>

        {deleteConfirmModal.impactSummary && (
          <div className="p-4 rounded-xl bg-[#f2f4f7] border border-[#dfe7ec] text-sm text-[#14283e]">
            <span className="font-bold block mb-1">Impact Analysis:</span>
            <span>{deleteConfirmModal.impactSummary}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#dfe7ec]">
          {/* Safe default is Cancel */}
          <button
            type="button"
            className="h-14 px-6 rounded-xl bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e] font-label-md text-label-md font-semibold active:scale-95 transition-all touch-press"
            onClick={closeDeleteConfirm}
          >
            Cancel &amp; Keep Data
          </button>
          <button
            type="button"
            className="h-14 px-8 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-label-md text-label-md font-bold shadow-md active:scale-95 transition-all touch-press"
            onClick={deleteConfirmModal.onConfirm}
          >
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  );
};
