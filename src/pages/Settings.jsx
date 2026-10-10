import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  School,
  Clock,
  ShieldCheck,
  BellRing,
  Smartphone,
  Gauge,
  AlertTriangle
} from 'lucide-react';

export const Settings = () => {
  const { settings, setSettings, resetToSampleData, showToast } = useTransit();
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState({ ...settings });

  const handleSave = (e) => {
    e.preventDefault();
    if (!hasPermission('admin_only')) {
      showToast('Action restricted: Administrator privilege required to modify system settings.', 'warning');
      return;
    }
    setSettings(formData);
    showToast('TransitIQ system settings saved successfully.');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-navy-900 tracking-tight">System & Transit Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure operational timetables, telemetry safety thresholds, and automated guardian alert preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Institutional Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <School className="w-4 h-4 text-navy-700" />
            <h3 className="text-sm font-bold text-navy-900">Institution & Academic Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School / Academy Name</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institution Code</label>
              <input
                type="text"
                value={formData.schoolCode}
                onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year Session</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Operations Hotline</label>
              <input
                type="text"
                value={formData.emergencyHotline}
                onChange={(e) => setFormData({ ...formData, emergencyHotline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fleet Operating Timings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-navy-700" />
            <h3 className="text-sm font-bold text-navy-900">Standard Transit Timetable Windows</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Morning Arrival Target</label>
              <input
                type="text"
                value={formData.morningArrivalTarget}
                onChange={(e) => setFormData({ ...formData, morningArrivalTarget: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Buses must deliver students before this deadline.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Afternoon Dismissal Departure</label>
              <input
                type="text"
                value={formData.afternoonDismissal}
                onChange={(e) => setFormData({ ...formData, afternoonDismissal: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Scheduled bus departure from campus loading bays.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Safety Limits & Telematics Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Gauge className="w-4 h-4 text-navy-700" />
            <h3 className="text-sm font-bold text-navy-900">Safety Limits & Telematics Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Speed Alert Threshold (km/h)</label>
              <input
                type="number"
                value={formData.speedLimitAlertKmh}
                onChange={(e) => setFormData({ ...formData, speedLimitAlertKmh: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Triggers immediate SMS to dispatch if driver exceeds this speed.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bus Seating Warning Threshold (%)</label>
              <input
                type="number"
                value={formData.capacityWarningThresholdPct}
                onChange={(e) => setFormData({ ...formData, capacityWarningThresholdPct: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Flags vehicle in yellow when seat occupancy reaches this level.</p>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.smsParentNotifications}
                onChange={(e) => setFormData({ ...formData, smsParentNotifications: e.target.checked })}
                className="w-4 h-4 text-navy-700 rounded border-slate-300 focus:ring-navy-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                Send Automated SMS / Push Notifications to Guardians (Boarding & Drop-off Checkpoints)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoDriverConflictDetection}
                onChange={(e) => setFormData({ ...formData, autoDriverConflictDetection: e.target.checked })}
                className="w-4 h-4 text-navy-700 rounded border-slate-300 focus:ring-navy-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                Enforce Real-Time Duplicate Driver & Bus Schedule Collision Prevention
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#17365D] hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-[#FFC928]" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Sample Data */}
      <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-rose-950">Prototype Data Reset</h3>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Need a fresh start for a demonstration or academic review? Resetting will restore all buses, students, drivers, routes, stops, and schedules to the clean, internally consistent sample dataset.
        </p>
        <button
          onClick={resetToSampleData}
          type="button"
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Records to Sample Data</span>
        </button>
      </div>
    </div>
  );
};
