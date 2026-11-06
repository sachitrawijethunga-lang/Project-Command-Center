import React, { useState, useEffect } from 'react';
import { useBoard } from '../context/BoardContext';
import { TaskStatus } from '../types/cockpit';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    closeTaskModal,
    editingTask,
    taskModalDefaultProjectId,
    projects,
    people,
    openProjectModal,
    createTask,
    updateTask,
    addPerson,
    settings,
    showToast,
  } = useBoard();

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('14:30');
  const [warningLeadMinutes, setWarningLeadMinutes] = useState(10080); // 7 days
  const [isCustomLead, setIsCustomLead] = useState(false);
  const [customDays, setCustomDays] = useState('7');
  const [notes, setNotes] = useState('');

  // Inline add person state
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  // Initialize form
  useEffect(() => {
    if (editingTask) {
      setProjectId(editingTask.projectId);
      setTitle(editingTask.title);
      setAssigneeId(editingTask.assigneeId);
      setStatus(editingTask.status);
      setNotes(editingTask.notes || '');
      setWarningLeadMinutes(editingTask.warningLeadMinutes || settings.defaultWarningLeadMinutes);

      // Parse date and time in local representation
      const dt = new Date(editingTask.dueAtUtc);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const hh = String(dt.getHours()).padStart(2, '0');
      const min = String(dt.getMinutes()).padStart(2, '0');

      setDueDate(`${yyyy}-${mm}-${dd}`);
      setDueTime(`${hh}:${min}`);

      // Check if matches preset
      const minutes = editingTask.warningLeadMinutes;
      if (![1440, 4320, 10080, 20160, 43200].includes(minutes)) {
        setIsCustomLead(true);
        setCustomDays(String(Math.round(minutes / 1440)));
      } else {
        setIsCustomLead(false);
      }
    } else {
      // Default to 7 days in the future at 14:30
      const defaultProject =
        projects.find((p) => p.id === taskModalDefaultProjectId) || projects[0];
      setProjectId(defaultProject?.id || '');
      setTitle('');
      setAssigneeId(people[0]?.id || '');
      setStatus('not_started');
      setNotes('');
      setDueTime('14:30');
      setWarningLeadMinutes(settings.defaultWarningLeadMinutes || 10080);
      setIsCustomLead(false);

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      setDueDate(`${yyyy}-${mm}-${dd}`);
    }
    setIsAddingPerson(false);
    setNewPersonName('');
  }, [editingTask, taskModalDefaultProjectId, projects, people, settings, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const currentProject = projects.find((p) => p.id === projectId);

  // Stepper helpers
  const addDays = (days: number) => {
    const base = dueDate ? new Date(dueDate) : new Date();
    base.setDate(base.getDate() + days);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, '0');
    const dd = String(base.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleLeadPreset = (minutes: number) => {
    setIsCustomLead(false);
    setWarningLeadMinutes(minutes);
  };

  const handleCustomLeadChange = (val: string) => {
    setCustomDays(val);
    const numDays = parseFloat(val);
    if (!isNaN(numDays) && numDays > 0) {
      setWarningLeadMinutes(Math.round(numDays * 1440));
    }
  };

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    const newPerson = addPerson(newPersonName.trim());
    setAssigneeId(newPerson.id);
    setNewPersonName('');
    setIsAddingPerson(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Task title is mandatory', 'warning');
      return;
    }
    if (!dueDate || !dueTime) {
      showToast('Exact due date and time are both required', 'warning');
      return;
    }
    if (!assigneeId) {
      showToast('Please assign a responsible person', 'warning');
      return;
    }
    if (warningLeadMinutes <= 0 || isNaN(warningLeadMinutes)) {
      showToast('Warning lead time must be a positive integer', 'warning');
      return;
    }

    // Combine date and time into ISO UTC instant
    const [hh, mm] = dueTime.split(':').map(Number);
    const [year, month, day] = dueDate.split('-').map(Number);
    const combinedDate = new Date(year, month - 1, day, hh || 12, mm || 0, 0);

    const taskPayload = {
      projectId: projectId || projects[0]?.id || '',
      title: title.trim(),
      assigneeId,
      dueAtUtc: combinedDate.toISOString(),
      warningLeadMinutes,
      status,
      notes: notes.trim() || undefined,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskPayload);
      showToast(`Task "${title.trim()}" updated successfully`, 'success');
      closeTaskModal();
    } else {
      createTask(taskPayload);
    }
  };

  const isFormValid = title.trim().length > 0 && dueDate.length > 0 && dueTime.length > 0 && assigneeId.length > 0;

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#001625]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
      onClick={closeTaskModal}
    >
      <div
        className="relative w-full max-w-[840px] my-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-150 border border-[#dfe7ec] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar (Architectural Command Style) */}
        <div className="bg-[#112b42] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-lg bg-[#0b7d83] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">assignment_add</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-[#97f1f7] uppercase tracking-wider font-semibold">
                  Project Portfolio
                </span>
                <span className="text-[#7b93ae] font-label-sm text-label-sm">•</span>
                <span className="font-label-md text-label-md text-[#cfe5ff] truncate font-medium">
                  {currentProject?.name || 'Strategic Stream'}
                </span>
              </div>
              <span className="font-display-lg text-display-lg text-white tracking-tight font-bold">
                {editingTask ? 'Edit Task Specification' : 'Create New Task'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-14 h-14 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95 flex-shrink-0 touch-press cursor-pointer"
            onClick={closeTaskModal}
            aria-label="Close task modal"
          >
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
        </div>

        {/* Directive Notice Banner */}
        <div className="bg-[#f2f4f7] px-6 py-2.5 flex items-center gap-3 border-b border-[#dfe7ec]">
          <span className="material-symbols-outlined text-[#0b7d83] text-[24px]">verified_user</span>
          <span className="font-body-md text-body-md text-[#566b7c]">
            Every task requires an exact due date, exact due time, assignee, and custom warning lead window.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 max-h-[72vh] overflow-y-auto">
          {/* Target Project Selection (if more than 1) */}
          {projects.filter((p) => !p.archivedAt).length === 0 ? (
            <div className="p-6 bg-[#f2f4f7] border border-[#dfe7ec] rounded-xl flex flex-col items-center gap-3 text-center">
              <span className="material-symbols-outlined text-[32px] text-[#0b7d83]">folder_open</span>
              <div>
                <p className="font-headline-sm text-[#14283e] font-bold">No Projects Exist Yet</p>
                <p className="text-sm text-[#566b7c] mt-1">Please create a project initiative first before creating tasks.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeTaskModal();
                  openProjectModal();
                }}
                className="h-12 px-6 rounded-lg bg-[#0b7d83] hover:bg-[#00696e] text-white font-bold text-sm shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                + Create Project Now
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="font-label-lg text-label-lg text-[#14283e] font-semibold flex items-center gap-1">
                <span>Parent Project</span>
                <span className="text-[#d32f2f] font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-14 px-4 rounded-lg bg-[#eceef1] text-[#14283e] font-label-md text-label-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
                >
                  {projects
                    .filter((p) => !p.archivedAt)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-4 text-[#566b7c] pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>
          )}

          {/* Field 1: Task Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-lg text-label-lg text-[#14283e] font-semibold flex items-center gap-1">
              <span>Task Title</span>
              <span className="text-[#d32f2f] font-bold">*</span>
              <span className="font-label-sm text-label-sm text-[#566b7c] font-normal ml-2">
                (Boardroom Visible Header)
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
                placeholder="e.g., Finalize HL7 FHIR Endpoint Adapter"
                className="w-full h-16 px-4 pr-24 rounded-lg bg-[#eceef1] text-headline-sm font-headline-sm text-[#14283e] placeholder:text-[#73777d] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0b7d83]/20 border border-transparent focus:border-[#0b7d83] transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#566b7c] font-label-sm text-label-sm tabular-nums">
                {title.length} / 120 chars
              </span>
            </div>
          </div>

          {/* Field 2: PersonPicker (Reusable Team Directory without Login) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg text-[#14283e] font-semibold flex items-center gap-1">
                <span>Responsible Person (Assignee)</span>
                <span className="text-[#d32f2f] font-bold">*</span>
              </label>
              <span className="font-label-sm text-label-sm text-[#566b7c]">
                Reusable Team Directory (No In-App Login)
              </span>
            </div>

            {/* Large Touch Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {people
                .filter((p) => p.active)
                .map((person) => {
                  const isSelected = assigneeId === person.id;
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setAssigneeId(person.id)}
                      className={`h-14 px-4 rounded-lg font-label-md text-label-md flex items-center gap-2 active:scale-95 transition-all touch-press ${
                        isSelected
                          ? 'bg-[#112b42] text-white shadow-sm ring-2 ring-[#0b7d83]'
                          : 'bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e]'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-sm ${
                          isSelected
                            ? 'bg-[#0b7d83] text-white'
                            : 'bg-[#e0e3e6] text-[#14283e]'
                        }`}
                      >
                        {person.avatarInitials}
                      </span>
                      <span>{person.displayName}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[20px] text-[#97f1f7]">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })}

              <button
                type="button"
                onClick={() => setIsAddingPerson(true)}
                className="h-14 px-4 rounded-lg bg-white hover:bg-[#eceef1] text-[#0b7d83] font-label-md text-label-md flex items-center gap-1.5 shadow-sm border border-[#dfe7ec] active:scale-95 transition-all touch-press font-semibold"
              >
                <span className="material-symbols-outlined text-[24px]">person_add</span>
                <span>+ Add New Person</span>
              </button>
            </div>

            {/* Inline add person prompt */}
            {isAddingPerson && (
              <div className="mt-2 p-3 rounded-lg bg-[#f2f4f7] border border-[#dfe7ec] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter name (e.g. Senaratne)"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="flex-1 h-12 px-3 rounded-lg bg-white border border-[#dfe7ec] text-sm focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
                />
                <button
                  type="button"
                  onClick={handleCreatePerson}
                  className="h-12 px-4 rounded-lg bg-[#0b7d83] text-white text-sm font-semibold active:scale-95"
                >
                  Save Person
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingPerson(false)}
                  className="h-12 px-3 rounded-lg bg-[#eceef1] text-[#566b7c] text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Field 3: Status Segmented Control */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-lg text-label-lg text-[#14283e] font-semibold">
              Task Status
            </label>
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-[#f2f4f7] rounded-xl border border-[#dfe7ec]">
              <button
                type="button"
                onClick={() => setStatus('not_started')}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  status === 'not_started'
                    ? 'bg-white text-[#14283e] shadow-sm font-bold'
                    : 'text-[#566b7c] hover:bg-white/60'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#73777d]"></span>
                <span>Not started</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  status === 'in_progress'
                    ? 'bg-white text-[#14283e] shadow-sm font-bold'
                    : 'text-[#566b7c] hover:bg-white/60'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#0b7d83]"></span>
                <span>In progress</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('blocked')}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  status === 'blocked'
                    ? 'bg-white text-[#7d2882] shadow-sm font-bold'
                    : 'text-[#566b7c] hover:bg-white/60'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#7d2882]"></span>
                <span>Blocked</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  status === 'completed'
                    ? 'bg-white text-[#1b6d42] shadow-sm font-bold'
                    : 'text-[#566b7c] hover:bg-white/60'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#1b6d42]"></span>
                <span>Completed</span>
              </button>
            </div>
          </div>

          {/* Field 4: Exact Deadline (Date, Time, Quick-Steppers) */}
          <div className="flex flex-col gap-4 p-4 bg-[#f2f4f7] rounded-xl border border-[#dfe7ec]">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg text-[#14283e] font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b7d83] text-[24px]">
                  event_available
                </span>
                <span>Exact Deadline Timestamp</span>
                <span className="text-[#d32f2f] font-bold">*</span>
              </label>
              <span className="font-label-sm text-label-sm text-[#566b7c] bg-white px-3 py-1 rounded shadow-sm border border-[#dfe7ec]">
                {settings.timezone} • Absolute UTC instant saved
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Selector Component */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm text-[#566b7c] uppercase font-semibold">
                  Due Date
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="w-full h-14 pl-4 pr-10 rounded-lg bg-white font-headline-sm text-headline-sm text-[#14283e] shadow-sm border border-[#dfe7ec] focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addDays(1)}
                    className="h-14 px-3 rounded-lg bg-white hover:bg-[#eceef1] text-[#14283e] font-label-md text-label-md shadow-sm border border-[#dfe7ec] active:scale-95 transition-all font-semibold touch-press"
                  >
                    +1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => addDays(7)}
                    className="h-14 px-3 rounded-lg bg-white hover:bg-[#eceef1] text-[#14283e] font-label-md text-label-md shadow-sm border border-[#dfe7ec] active:scale-95 transition-all font-semibold touch-press"
                  >
                    +1 Week
                  </button>
                </div>
              </div>

              {/* Time Selector Component */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm text-[#566b7c] uppercase font-semibold">
                  Exact Cutoff Time
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-32">
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      required
                      className="w-full h-14 text-center rounded-lg bg-white font-headline-sm text-headline-sm text-[#14283e] shadow-sm border border-[#dfe7ec] focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    {['09:00', '12:00', '14:30', '17:00'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setDueTime(time)}
                        className={`flex-1 h-14 rounded-lg font-label-sm text-label-sm shadow-sm border active:scale-95 transition-all font-semibold ${
                          dueTime === time
                            ? 'bg-[#112b42] text-white border-[#112b42] ring-2 ring-[#0b7d83]'
                            : 'bg-white hover:bg-[#eceef1] text-[#14283e] border-[#dfe7ec]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Field 5: Warning Lead Time Configuration */}
          <div className="flex flex-col gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#dfe7ec]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d96520] text-[24px]">
                  notifications_active
                </span>
                <label className="font-label-lg text-label-lg text-[#14283e] font-semibold">
                  Task Warning Lead Time
                </label>
              </div>
              <span className="font-label-sm text-label-sm text-[#0b7d83] bg-[#94eef5]/30 border border-[#94eef5] px-2.5 py-1 rounded font-semibold">
                Independently Configurable per Task
              </span>
            </div>

            {/* Preset Lead Window Chips */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleLeadPreset(1440)}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center active:scale-95 transition-all font-semibold ${
                  !isCustomLead && warningLeadMinutes === 1440
                    ? 'bg-[#112b42] text-white ring-2 ring-[#0b7d83] shadow-sm'
                    : 'bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e]'
                }`}
              >
                1 Day
              </button>

              <button
                type="button"
                onClick={() => handleLeadPreset(4320)}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center active:scale-95 transition-all font-semibold ${
                  !isCustomLead && warningLeadMinutes === 4320
                    ? 'bg-[#112b42] text-white ring-2 ring-[#0b7d83] shadow-sm'
                    : 'bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e]'
                }`}
              >
                3 Days
              </button>

              <button
                type="button"
                onClick={() => handleLeadPreset(10080)}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center active:scale-95 transition-all font-semibold ${
                  !isCustomLead && warningLeadMinutes === 10080
                    ? 'bg-[#112b42] text-white ring-2 ring-[#0b7d83] shadow-sm'
                    : 'bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e]'
                }`}
              >
                7 Days (Default)
              </button>

              <button
                type="button"
                onClick={() => handleLeadPreset(20160)}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center active:scale-95 transition-all font-semibold ${
                  !isCustomLead && warningLeadMinutes === 20160
                    ? 'bg-[#112b42] text-white ring-2 ring-[#0b7d83] shadow-sm'
                    : 'bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e]'
                }`}
              >
                14 Days
              </button>

              <button
                type="button"
                onClick={() => handleLeadPreset(43200)}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center active:scale-95 transition-all font-semibold ${
                  !isCustomLead && warningLeadMinutes === 43200
                    ? 'bg-[#112b42] text-white ring-2 ring-[#0b7d83] shadow-sm'
                    : 'bg-[#eceef1] hover:bg-[#e6e8eb] text-[#14283e]'
                }`}
              >
                30 Days
              </button>

              <button
                type="button"
                onClick={() => setIsCustomLead(true)}
                className={`h-14 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 active:scale-95 transition-all font-semibold ${
                  isCustomLead
                    ? 'bg-[#112b42] text-white ring-2 ring-[#0b7d83] shadow-sm'
                    : 'bg-[#f2f4f7] hover:bg-[#eceef1] text-[#566b7c]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Custom</span>
              </button>
            </div>

            {/* Custom Days Input */}
            {isCustomLead && (
              <div className="flex items-center gap-3 p-3 bg-[#f2f4f7] rounded-lg border border-[#dfe7ec]">
                <span className="text-sm font-semibold text-[#14283e]">Custom Lead Window (Days):</span>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={customDays}
                  onChange={(e) => handleCustomLeadChange(e.target.value)}
                  className="w-24 h-11 px-3 bg-white rounded-lg border border-[#dfe7ec] font-bold text-center"
                />
                <span className="text-sm text-[#566b7c]">
                  = {(parseFloat(customDays) * 24 || 0).toFixed(0)} hours ({warningLeadMinutes} min)
                </span>
              </div>
            )}

            {/* Urgency Radar Progression Bar & Preview */}
            <div className="p-3 bg-[#f2f4f7] rounded-lg flex flex-col gap-2 border border-[#dfe7ec]">
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <span className="text-[#566b7c] uppercase font-semibold">
                  Radar Dynamic Urgency Projection
                </span>
                <span className="text-[#14283e] font-bold">
                  {Math.round(warningLeadMinutes / 1440)}-Day Urgency Window
                </span>
              </div>

              {/* Segmented Color Gauge */}
              <div className="w-full h-3 bg-[#e0e3e6] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#1b6d42] w-2/5" title="Calm Phase (Before window)"></div>
                <div className="h-full bg-[#c68a1b] w-1/5" title="Warm Gold Warning (0-40%)"></div>
                <div className="h-full bg-[#d96520] w-1/5" title="Elevated Amber Alert (40-75%)"></div>
                <div className="h-full bg-[#d32f2f] w-1/5" title="Imminent Red Threat (75-100%)"></div>
              </div>

              {/* Descriptive Text Pathway */}
              <div className="flex items-center justify-between text-label-sm font-label-sm text-[#566b7c] pt-1 flex-wrap gap-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d42]"></span>
                  <span>Calm Phase</span>
                </div>
                <span className="opacity-40">→</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c68a1b]"></span>
                  <span className="text-[#c68a1b] font-semibold">Warm Gold</span>
                </div>
                <span className="opacity-40">→</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d96520]"></span>
                  <span className="text-[#d96520] font-semibold">Amber Alert</span>
                </div>
                <span className="opacity-40">→</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d32f2f]"></span>
                  <span className="text-[#d32f2f] font-bold">Imminent Red</span>
                </div>
                <span className="opacity-40">→</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#941313]"></span>
                  <span className="text-[#941313] font-bold">Overdue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Field 6: Task Notes (Optional) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg text-[#14283e] font-semibold">
                Task Notes &amp; Directives
              </label>
              <span className="font-label-sm text-label-sm text-[#566b7c]">
                Optional • Hand-tapped input
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Tap to enter execution criteria, dependencies, or direct links..."
              className="w-full p-4 rounded-lg bg-[#eceef1] font-body-md text-body-md text-[#14283e] placeholder:text-[#73777d] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0b7d83]/20 border border-transparent focus:border-[#0b7d83] transition-all resize-none"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="bg-[#f2f4f7] -mx-6 -mb-6 p-6 flex items-center justify-between gap-4 border-t border-[#dfe7ec] mt-2">
            <button
              type="button"
              onClick={closeTaskModal}
              className="h-16 px-8 rounded-xl bg-white hover:bg-[#eceef1] text-[#14283e] font-label-lg text-label-lg shadow-sm border border-[#dfe7ec] flex items-center gap-2 active:scale-95 transition-all touch-press font-semibold"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
              <span>Cancel &amp; Discard</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-[#566b7c] font-label-sm text-label-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFormValid ? 'bg-[#1b6d42]' : 'bg-[#d32f2f]'
                  }`}
                ></span>
                <span>
                  {isFormValid ? 'All Required Fields Validated' : 'Complete Required Fields (*) '}
                </span>
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className={`h-16 px-10 rounded-xl font-headline-sm text-headline-sm shadow-md flex items-center gap-3 active:scale-95 transition-all touch-press font-bold ${
                  isFormValid
                    ? 'bg-[#0b7d83] hover:bg-[#00696e] text-white cursor-pointer'
                    : 'bg-[#d8dadd] text-[#73777d] cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                <span>Save Task to Cloud</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
