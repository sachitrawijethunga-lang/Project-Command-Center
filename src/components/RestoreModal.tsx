import React from 'react';
import { useBoard } from '../context/BoardContext';

export const RestoreModal: React.FC = () => {
  const { restoreModalSnapshot, closeRestoreModal, executeRestoreSnapshot } = useBoard();

  if (!restoreModalSnapshot) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#112b42]/60 backdrop-blur-sm flex items-center justify-center p-8 cursor-pointer"
      onClick={closeRestoreModal}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl flex flex-col gap-6 border border-[#dfe7ec] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#d96520]/15 text-[#d96520] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-[#14283e] font-bold">
                Confirm Database Restoration
              </h3>
              <span className="font-body-md text-body-md text-[#566b7c]">
                Strict Dry-Run Verification Phase
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-[#eceef1] hover:bg-[#e6e8eb] flex items-center justify-center text-[#14283e]"
            onClick={closeRestoreModal}
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#f2f4f7] font-body-md text-body-md text-[#14283e] flex flex-col gap-2 border border-[#dfe7ec]">
          <div className="flex justify-between">
            <span className="text-[#566b7c] font-label-md text-label-md">Target Snapshot:</span>
            <span className="font-mono font-bold font-label-md text-label-md">
              {restoreModalSnapshot.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#566b7c] font-label-md text-label-md">Task Entities Affected:</span>
            <span className="font-bold font-label-md text-label-md">
              {restoreModalSnapshot.recordsCount} Records (0 conflicts)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#566b7c] font-label-md text-label-md">Schema Compatibility:</span>
            <span className="text-[#1b6d42] font-bold font-label-md text-label-md">
              Verified Schema {restoreModalSnapshot.schemaVersion} Match
            </span>
          </div>
        </div>

        <p className="font-body-md text-body-md text-[#d32f2f] font-semibold">
          Caution: This operation replaces local interactive state with selected cloud snapshot. Wall sessions will re-initialize immediately.
        </p>

        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            className="h-14 px-6 rounded-xl bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e] font-label-lg text-label-lg active:scale-95 transition-all font-semibold"
            onClick={closeRestoreModal}
          >
            Abort
          </button>
          <button
            type="button"
            className="h-14 px-8 rounded-xl bg-[#d96520] hover:bg-[#c68a1b] text-white font-label-lg text-label-lg font-bold shadow-md active:scale-95 transition-all touch-press"
            onClick={() => executeRestoreSnapshot(restoreModalSnapshot.id)}
          >
            Authorize Overwrite &amp; Mount
          </button>
        </div>
      </div>
    </div>
  );
};
