import React from 'react';
import { useBoard } from '../context/BoardContext';

export const Toast: React.FC = () => {
  const { toast } = useBoard();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#112b42] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 border border-[#dfe7ec]/20 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
    >
      <span
        className={`material-symbols-outlined text-[24px] ${
          toast.type === 'success'
            ? 'text-[#94eef5]'
            : toast.type === 'warning'
            ? 'text-[#d96520]'
            : 'text-[#97f1f7]'
        }`}
      >
        {toast.type === 'success'
          ? 'verified'
          : toast.type === 'warning'
          ? 'warning'
          : 'info'}
      </span>
      <span className="font-label-md text-label-md font-medium">{toast.message}</span>
    </div>
  );
};
