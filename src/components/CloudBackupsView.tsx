import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { Snapshot } from '../types/cockpit';

export const CloudBackupsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    snapshots,
    openRestoreModal,
    triggerSync,
    exportJson,
    importJson,
    isSyncing,
    writeTimeAgo,
    showToast,
  } = useBoard();

  const [showSyncAlert, setShowSyncAlert] = useState(false);
  const [fileInputRef] = useState<React.RefObject<HTMLInputElement | null>>({ current: null });

  const handleTestConnection = () => {
    triggerSync();
    setTimeout(() => {
      setShowSyncAlert(true);
    }, 700);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importJson(content);
        if (!res.success) {
          showToast(res.error || 'Failed to import JSON', 'warning');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hidden file input for restore */}
      <input
        type="file"
        accept=".json"
        className="hidden"
        id="board-json-upload"
        onChange={handleFileUpload}
      />

      {/* Top Header Strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded bg-[#0b7d83]/15 text-[#0b7d83] font-label-sm text-label-sm uppercase tracking-wider font-bold">
              Hardware Asset #SB-75-COLOMBO-01
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1b6d42]/10 text-[#1b6d42] font-label-sm text-label-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d42] animate-ping"></span>
              Authoritative Sync Active
            </span>
          </div>

          <h1 className="font-display-lg text-display-lg text-[#14283e] tracking-tight mt-1 font-bold">
            Cloud System &amp; Data Management
          </h1>
          <p className="font-body-lg text-body-lg text-[#566b7c]">
            Authoritative Cloud Database · No In-App Logins · 75-inch Interactive Display
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleTestConnection}
            className="h-14 px-6 rounded-xl bg-white hover:bg-[#f2f4f7] text-[#14283e] shadow-sm border border-[#dfe7ec] flex items-center gap-3 font-label-lg text-label-lg transition-colors touch-press font-semibold"
          >
            <span
              className={`material-symbols-outlined text-[#0b7d83] text-[26px] ${
                isSyncing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>{isSyncing ? 'Syncing Gateway...' : 'Test Connection & Resync'}</span>
          </button>

          <div className="h-14 px-6 rounded-xl bg-[#112b42] text-white shadow-sm flex items-center gap-4">
            <span className="material-symbols-outlined text-[#97f1f7] text-[26px]">timer</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm opacity-75">Board Write Age</span>
              <span className="font-label-md text-label-md font-bold text-white tabular-nums">
                {writeTimeAgo}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Feedback Alert Banner */}
      {showSyncAlert && (
        <div className="mb-6 p-4 rounded-xl bg-[#1b6d42] text-white shadow-md flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[28px]">verified</span>
            <div>
              <p className="font-label-lg text-label-lg font-bold">
                Cloud Gateway Resynchronization Acknowledged
              </p>
              <p className="font-body-md text-body-md opacity-90">
                State vector 0x9482F matching remote snapshot. Roundtrip round: 18ms latency.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="h-10 px-4 rounded-lg bg-white/20 hover:bg-white/30 font-label-md text-label-md transition-colors"
            onClick={() => setShowSyncAlert(false)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two Column Architectural Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column (Gateway & Identity) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-[#dfe7ec] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#566b7c] font-semibold">
                  Gateway Pipeline
                </span>
                <span className="px-3 py-1 rounded bg-[#1b6d42]/10 text-[#1b6d42] font-label-sm text-label-sm font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1b6d42]"></span>
                  Encrypted IPSec
                </span>
              </div>

              <h2 className="font-headline-md text-headline-md text-[#14283e] mb-1 font-bold">
                Private Cloud Gateway
              </h2>
              <p className="font-body-md text-body-md text-[#566b7c] mb-6">
                Authoritative backend pipeline routed via hardware-level perimeter certificate.
              </p>

              <div className="p-4 rounded-xl bg-[#f2f4f7] mb-4 border border-[#dfe7ec]">
                <span className="font-label-sm text-label-sm text-[#566b7c] block mb-1">
                  Target Cloud Endpoint
                </span>
                <div className="flex items-center justify-between font-label-md text-label-md text-[#112b42] font-mono break-all font-bold">
                  <span>https://gateway.internal.ops/api/v1</span>
                  <span className="material-symbols-outlined text-[#0b7d83] text-[20px] ml-2 flex-shrink-0">
                    vpn_lock
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-[#566b7c] mt-1 block">
                  Hardware Enrolled Dedicated Tunnel
                </span>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#0b7d83] text-[22px] mt-0.5">
                    verified_user
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-[#14283e] font-semibold">
                      Zero Anonymous Public Ingress
                    </span>
                    <span className="font-body-md text-body-md text-[#566b7c]">
                      Strict mutual TLS (mTLS). Inbound network routes without hardware pin rejected.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#0b7d83] text-[22px] mt-0.5">
                    key_off
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-[#14283e] font-semibold">
                      Ephemeral Storage Policy
                    </span>
                    <span className="font-body-md text-body-md text-[#566b7c]">
                      No persistent operator credentials stored in Chrome sandbox or LocalStorage.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry Diagnostic Box */}
            <div className="p-4 rounded-xl bg-[#112b42] text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-sm text-label-sm text-[#7b93ae]">Telemetry Diagnostic</span>
                <span className="font-label-sm text-label-sm text-[#97f1f7] font-mono font-bold">
                  HEALTH OPTIMAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="font-label-sm text-label-sm text-[#7b93ae] block">Cloud Latency</span>
                  <span className="font-headline-md text-headline-md text-white font-bold tabular-nums">
                    24 ms
                  </span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-[#7b93ae] block">Packets In/Out</span>
                  <span className="font-headline-md text-headline-md text-white font-bold tabular-nums">
                    99.98%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-1">
                <div className="h-1.5 w-full bg-[#162b3a] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0b7d83] rounded-full w-11/12"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Perimeter Identity */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-[#dfe7ec]">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#566b7c] font-semibold block mb-1">
              Executive Scrim / Security
            </span>
            <h3 className="font-headline-sm text-headline-sm text-[#14283e] mb-3 font-bold">
              Perimeter Identity
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#112b42] flex items-center justify-center text-[#97f1f7] flex-shrink-0 font-bold border border-[#dfe7ec]">
                <span className="material-symbols-outlined text-[32px]">shield</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-[#14283e] font-semibold">
                  Colombo HQ Boardroom #1
                </span>
                <span className="font-body-md text-body-md text-[#566b7c] font-mono">
                  MAC: B4:96:91:0A:48:FF
                </span>
                <span className="font-label-sm text-label-sm text-[#0b7d83] font-semibold">
                  Signed by Root Authority CA-2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Backup/Export & Settings) */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          {/* Backup, Export & Disaster Recovery Card */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-[#dfe7ec]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#566b7c] font-semibold">
                  FR-24 &amp; NFR-08 Engine
                </span>
                <h2 className="font-headline-lg text-headline-lg text-[#14283e] font-bold">
                  Backup, Export &amp; Disaster Recovery
                </h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f2f4f7] border border-[#dfe7ec]">
                <span className="material-symbols-outlined text-[#1b6d42] text-[22px]">check_circle</span>
                <span className="font-label-md text-label-md text-[#14283e] font-semibold">
                  PostgreSQL Managed Volume Online
                </span>
              </div>
            </div>

            {/* Export and Import Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={exportJson}
                className="h-16 px-6 rounded-xl bg-[#0b7d83] hover:bg-[#00696e] text-white shadow-sm flex items-center justify-between active:scale-95 transition-all text-left touch-press"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[32px]">download</span>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-bold">Download Board JSON</span>
                    <span className="font-label-sm text-label-sm opacity-85">
                      Includes Schema v1.4 Metadata
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[24px]">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => document.getElementById('board-json-upload')?.click()}
                className="h-16 px-6 rounded-xl bg-[#112b42] hover:bg-[#001629] text-white shadow-sm flex items-center justify-between active:scale-95 transition-all text-left touch-press"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[32px]">publish</span>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg font-bold">Import / Restore Backup</span>
                    <span className="font-label-sm text-label-sm opacity-85">
                      Dry-Run Preview Before Commit
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </button>
            </div>

            {/* Authoritative Snapshot Register */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="font-headline-sm text-headline-sm text-[#14283e] font-bold">
                  Authoritative Snapshot Register
                </span>
                <span className="px-2 py-0.5 rounded bg-[#eceef1] text-[#566b7c] font-label-sm text-label-sm font-semibold">
                  {snapshots.length} Retained
                </span>
              </div>
              <span className="font-body-md text-body-md text-[#566b7c]">
                Automated Daily Snapshot: Today 04:00 AM UTC
              </span>
            </div>

            <div className="overflow-x-auto border border-[#dfe7ec] rounded-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#566b7c] font-label-sm text-label-sm uppercase bg-[#f2f4f7] border-b border-[#dfe7ec]">
                    <th className="py-3 px-4 font-semibold">Snapshot Identity</th>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Integrity Hash (SHA-256)</th>
                    <th className="py-3 px-4 font-semibold">Volume Size</th>
                    <th className="py-3 px-4 text-right font-semibold">Touch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfe7ec] font-body-md text-body-md text-[#14283e]">
                  {snapshots.map((snap) => (
                    <tr
                      key={snap.id}
                      className="bg-white hover:bg-[#f2f4f7] transition-colors"
                    >
                      <td className="py-4 px-4 font-label-md text-label-md font-bold flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d42] flex-shrink-0"></span>
                        <span>{snap.id}</span>
                      </td>
                      <td className="py-4 px-4 text-[#566b7c]">{snap.timestamp}</td>
                      <td className="py-4 px-4 font-mono font-label-sm text-label-sm text-[#566b7c]">
                        {snap.hash}
                      </td>
                      <td className="py-4 px-4 font-label-md text-label-md font-semibold">
                        {snap.size}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openRestoreModal(snap)}
                          className="h-12 px-4 rounded-lg bg-[#e6e8eb] hover:bg-[#d8dadd] text-[#14283e] font-label-md text-label-md active:scale-95 transition-all font-semibold touch-press"
                        >
                          Restore This
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Display & Local Board Settings */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-[#dfe7ec]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#566b7c] font-semibold">
                  Interactive Ergonomics
                </span>
                <h2 className="font-headline-lg text-headline-lg text-[#14283e] font-bold">
                  Display &amp; Local Board Settings
                </h2>
              </div>
              <span className="material-symbols-outlined text-[#566b7c] text-[32px]">tv</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Board Timezone */}
              <div className="flex flex-col gap-2">
                <label className="font-label-lg text-label-lg text-[#14283e] font-semibold">
                  Board Display Timezone
                </label>
                <p className="font-body-md text-body-md text-[#566b7c]">
                  Determines date urgency calculation boundaries for on-wall display.
                </p>
                <div className="relative">
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSettings({ timezone: e.target.value })}
                    className="w-full h-14 px-4 rounded-xl bg-[#f2f4f7] border border-[#dfe7ec] font-label-md text-label-md text-[#14283e] appearance-none pr-12 focus:outline-none focus:ring-2 focus:ring-[#0b7d83]"
                  >
                    <option value="Asia/Colombo">
                      Asia/Colombo (UTC+5:30) · Official Command Hub
                    </option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="Asia/Singapore">Asia/Singapore (UTC+8:00)</option>
                    <option value="Europe/London">Europe/London (UTC+1:00 / BST)</option>
                    <option value="America/New_York">America/New_York (UTC-4:00 / EDT)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-4 text-[#566b7c] pointer-events-none">
                    arrow_drop_down
                  </span>
                </div>
              </div>

              {/* Default Task Warning Lead */}
              <div className="flex flex-col gap-2">
                <label className="font-label-lg text-label-lg text-[#14283e] font-semibold">
                  Default Task Warning Lead
                </label>
                <p className="font-body-md text-body-md text-[#566b7c]">
                  Urgency radar threshold before switching from Nominal to Amber alert.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '3 Days', mins: 4320 },
                    { label: '7 Days', mins: 10080 },
                    { label: '14 Days', mins: 20160 },
                  ].map((preset) => {
                    const isSelected = settings.defaultWarningLeadMinutes === preset.mins;
                    return (
                      <button
                        key={preset.mins}
                        type="button"
                        onClick={() => updateSettings({ defaultWarningLeadMinutes: preset.mins })}
                        className={`h-14 rounded-xl font-label-md text-label-md font-semibold active:scale-95 transition-all touch-press ${
                          isSelected
                            ? 'bg-[#0b7d83] text-white shadow-sm'
                            : 'bg-[#f2f4f7] text-[#14283e] border border-[#dfe7ec]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Touch UI Density Scale */}
              <div className="flex flex-col gap-2">
                <label className="font-label-lg text-label-lg text-[#14283e] font-semibold">
                  Touch UI Density Scale
                </label>
                <p className="font-body-md text-body-md text-[#566b7c]">
                  Enforces minimum physical fingertip bounding boxes for 75&quot; display.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ density: 'spacious' })}
                    className={`h-14 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all ${
                      settings.density === 'spacious'
                        ? 'bg-[#0b7d83] text-white shadow-sm'
                        : 'bg-[#f2f4f7] text-[#14283e] border border-[#dfe7ec]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">aspect_ratio</span>
                    <span>75&quot; Spacious</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSettings({ density: 'condensed' })}
                    className={`h-14 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all ${
                      settings.density === 'condensed'
                        ? 'bg-[#0b7d83] text-white shadow-sm'
                        : 'bg-[#f2f4f7] text-[#14283e] border border-[#dfe7ec]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">density_medium</span>
                    <span>Condensed View</span>
                  </button>
                </div>
              </div>

              {/* Presentation Mode Toggle */}
              <div className="flex flex-col justify-between p-4 rounded-xl bg-[#f2f4f7] border border-[#dfe7ec]">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-label-lg text-label-lg text-[#14283e] font-semibold block">
                      Presentation Mode
                    </span>
                    <span className="font-body-md text-body-md text-[#566b7c]">
                      Hide administrative ribbons &amp; restore controls for Boardroom walk-throughs.
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-pressed={settings.presentationMode}
                    onClick={() =>
                      updateSettings({ presentationMode: !settings.presentationMode })
                    }
                    className={`w-16 h-10 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
                      settings.presentationMode ? 'bg-[#0b7d83]' : 'bg-[#e0e3e6]'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full bg-white shadow-md transform transition-transform ${
                        settings.presentationMode ? 'translate-x-6' : ''
                      }`}
                    ></span>
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-4 text-[#566b7c] font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[18px]">touch_app</span>
                  <span>Triple-tap top corner or toggle above to exit Presentation Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
