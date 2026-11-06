import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';

export const OwnerModal: React.FC = () => {
  const {
    isOwnerModalOpen,
    closeOwnerModal,
    ownerModalTarget,
    reassignOwner,
    people,
    projects,
    categories,
    tasks,
    updatePerson,
  } = useBoard();

  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOwnerModalOpen || !ownerModalTarget) return null;

  let currentOwnerId = '';
  let entityTitle = '';

  if (ownerModalTarget.type === 'project') {
    const proj = projects.find((p) => p.id === ownerModalTarget.id);
    currentOwnerId = proj?.ownerId || '';
    entityTitle = `Project: ${proj?.name || ''}`;
  } else if (ownerModalTarget.type === 'category') {
    const cat = categories.find((c) => c.id === ownerModalTarget.id);
    currentOwnerId = cat?.ownerId || '';
    entityTitle = `Category: ${cat?.name || ''}`;
  } else if (ownerModalTarget.type === 'task') {
    const t = tasks.find((tk) => tk.id === ownerModalTarget.id);
    currentOwnerId = t?.assigneeId || '';
    entityTitle = `Task: ${t?.title || ''}`;
  }

  const startEditPerson = (e: React.MouseEvent, person: any) => {
    e.stopPropagation();
    setEditingPersonId(person.id);
    setEditingName(person.displayName);
  };

  const saveEditPerson = (e: React.MouseEvent, personId: string) => {
    e.stopPropagation();
    if (editingName.trim()) {
      updatePerson(personId, { displayName: editingName.trim() });
    }
    setEditingPersonId(null);
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#001625]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={closeOwnerModal}
    >
      <div
        className="bg-white rounded-xl p-8 shadow-2xl w-[560px] max-w-full flex flex-col gap-6 border border-[#dfe7ec] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-headline-md text-headline-md text-[#14283e] font-bold">
              Reassign Responsible Lead
            </h2>
            <p className="font-body-md text-body-md text-[#566b7c] mt-1">{entityTitle}</p>
          </div>
          <button
            type="button"
            className="w-12 h-12 rounded-xl bg-[#eceef1] hover:bg-[#e6e8eb] flex items-center justify-center text-[#14283e] touch-press cursor-pointer"
            onClick={closeOwnerModal}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {people
            .filter((p) => p.active)
            .map((person) => {
              const isCurrent = person.id === currentOwnerId;
              const isEditingThis = editingPersonId === person.id;

              return (
                <div
                  key={person.id}
                  onClick={() => !isEditingThis && reassignOwner(person.id)}
                  className={`p-4 rounded-xl flex items-center justify-between cursor-pointer active:scale-98 transition-all border ${
                    isCurrent
                      ? 'bg-[#f2f4f7] border-[#0b7d83]'
                      : 'bg-white hover:bg-[#f2f4f7] border-[#dfe7ec]'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        isCurrent
                          ? 'bg-[#0b7d83] text-white'
                          : 'bg-[#112b42] text-white'
                      }`}
                    >
                      {person.avatarInitials}
                    </span>
                    <div className="flex-1 min-w-0">
                      {isEditingThis ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditPerson(e as any, person.id);
                              if (e.key === 'Escape') setEditingPersonId(null);
                            }}
                            autoFocus
                            className="h-10 px-3 bg-white border border-[#0b7d83] rounded-lg text-sm text-[#14283e] font-semibold w-full focus:outline-none ring-2 ring-[#0b7d83]/20"
                          />
                          <button
                            type="button"
                            onClick={(e) => saveEditPerson(e, person.id)}
                            className="h-10 px-3 bg-[#0b7d83] text-white rounded-lg text-xs font-bold shrink-0"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="font-label-lg text-label-lg text-[#14283e] font-semibold flex items-center gap-2">
                          <span>{person.displayName}</span>
                          {isCurrent && (
                            <span className="text-xs bg-[#0b7d83]/15 text-[#0b7d83] px-2 py-0.5 rounded font-bold">
                              Current
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isEditingThis && (
                      <button
                        type="button"
                        onClick={(e) => startEditPerson(e, person)}
                        title="Rename Person"
                        className="w-9 h-9 rounded-lg hover:bg-[#e6e8eb] text-[#566b7c] hover:text-[#14283e] flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    )}

                    {isCurrent && !isEditingThis && (
                      <span className="material-symbols-outlined text-[#0b7d83] text-[24px]">
                        check
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#dfe7ec]">
          <button
            type="button"
            className="h-13 px-6 rounded-xl bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e] font-label-md text-label-md cursor-pointer"
            onClick={closeOwnerModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
