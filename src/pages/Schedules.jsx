import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CapacityBar } from '../components/common/CapacityBar';
import {
  CalendarClock,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Bus,
  Users2,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowRight,
  Sun,
  Sunset
} from 'lucide-react';

export const Schedules = () => {
  const { schedules, buses, drivers, routes, addSchedule, updateSchedule, deleteSchedule, showToast } = useTransit();
  const { hasPermission } = useAuth();

  const [shiftTab, setShiftTab] = useState('All'); // 'All' | 'Morning' | 'Afternoon'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'calendar'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Form
  const initialForm = {
    shiftType: 'Morning Pickup',
    routeId: '',
    busId: '',
    driverId: '',
    startTime: '07:05 AM',
    campusArrivalTime: '07:50 AM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  };
  const [formData, setFormData] = useState(initialForm);

  // CONFLICT DETECTION ENGINE
  // Detect if any driver or bus is assigned more than once to the same shift
  const detectConflicts = () => {
    const conflicts = [];
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i];
        const s2 = schedules[j];
        if (s1.shiftType === s2.shiftType) {
          if (s1.busId && s1.busId === s2.busId) {
            conflicts.push({
              type: 'Bus Double-Booking',
              message: `${s1.busNumber} is assigned to both "${s1.routeName}" and "${s2.routeName}" during ${s1.shiftType}.`
            });
          }
          if (s1.driverId && s1.driverId === s2.driverId) {
            conflicts.push({
              type: 'Driver Shift Overlap',
              message: `${s1.driverName} is assigned to both "${s1.routeName}" and "${s2.routeName}" simultaneously during ${s1.shiftType}.`
            });
          }
        }
      }
    }
    return conflicts;
  };

  const activeConflicts = detectConflicts();

  const filteredSchedules = schedules.filter(s => {
    const matchesSearch =
      s.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.driverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShift =
      shiftTab === 'All'
        ? true
        : shiftTab === 'Morning'
        ? s.shiftType.includes('Morning')
        : s.shiftType.includes('Afternoon');

    return matchesSearch && matchesShift;
  });

  const handleOpenAdd = () => {
    if (!hasPermission('create')) {
      showToast('Action restricted: Read-only Viewer cannot create schedules.', 'warning');
      return;
    }
    setFormData({
      shiftType: 'Morning Pickup',
      routeId: routes[0]?.id || '',
      busId: buses[0]?.id || '',
      driverId: drivers[0]?.id || '',
      startTime: '07:05 AM',
      campusArrivalTime: '07:50 AM',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    if (!hasPermission('edit')) {
      showToast('Action restricted: Read-only Viewer cannot edit schedules.', 'warning');
      return;
    }
    setSelectedSchedule(schedule);
    setFormData({
      shiftType: schedule.shiftType,
      routeId: schedule.routeId,
      busId: schedule.busId,
      driverId: schedule.driverId,
      startTime: schedule.startTime,
      campusArrivalTime: schedule.campusArrivalTime,
      days: schedule.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const route = routes.find(r => r.id === formData.routeId);
    const bus = buses.find(b => b.id === formData.busId);
    const driver = drivers.find(d => d.id === formData.driverId);

    const result = addSchedule({
      ...formData,
      routeName: route ? route.routeName : 'Route',
      busNumber: bus ? bus.busNumber : 'Bus',
      driverName: driver ? driver.fullName : 'Driver',
      busCapacity: bus ? bus.capacity : 48,
      allocatedStudents: bus ? bus.currentAssignedStudents || 35 : 35,
      stopsScheduled: route ? route.totalStops : 5
    });

    if (result.success) setIsAddModalOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const route = routes.find(r => r.id === formData.routeId);
    const bus = buses.find(b => b.id === formData.busId);
    const driver = drivers.find(d => d.id === formData.driverId);

    const result = updateSchedule(selectedSchedule.id, {
      ...formData,
      routeName: route ? route.routeName : 'Route',
      busNumber: bus ? bus.busNumber : 'Bus',
      driverName: driver ? driver.fullName : 'Driver',
      busCapacity: bus ? bus.capacity : 48
    });

    if (result.success) setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Fleet Dispatch & Schedules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate morning pickup runs, afternoon student dismissals, and dispatch timetables
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-white rounded-xl border border-slate-200 p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-[#17365D] text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Timetable List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'calendar' ? 'bg-[#17365D] text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Weekly Matrix
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#17365D] hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FFC928]" />
            <span>Create Shift</span>
          </button>
        </div>
      </div>

      {/* Proactive Conflict Warning Banner */}
      {activeConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <h4 className="font-bold text-xs uppercase tracking-wide text-rose-950">
              Schedule Conflict Detected ({activeConflicts.length} Warning)
            </h4>
          </div>
          <div className="space-y-1 pl-7 text-xs text-rose-800">
            {activeConflicts.map((c, i) => (
              <p key={i}><strong>{c.type}:</strong> {c.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* Shift Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Morning vs Afternoon Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setShiftTab('All')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all ${
              shiftTab === 'All' ? 'bg-white text-navy-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            All Shifts ({schedules.length})
          </button>
          <button
            onClick={() => setShiftTab('Morning')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              shiftTab === 'Morning' ? 'bg-white text-navy-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            Morning Pickup
          </button>
          <button
            onClick={() => setShiftTab('Afternoon')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              shiftTab === 'Afternoon' ? 'bg-white text-navy-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-indigo-500" />
            Afternoon Return
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by route, bus, driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600"
          />
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Shift Type</th>
                  <th className="py-3 px-4">Route & Corridors</th>
                  <th className="py-3 px-4">Dispatched Bus</th>
                  <th className="py-3 px-4">Assigned Driver</th>
                  <th className="py-3 px-4">Departure & Campus Arrival</th>
                  <th className="py-3 px-4">Days Operating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {sch.shiftType.includes('Morning') ? (
                          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                            <Sun className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                            <Sunset className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{sch.shiftType}</p>
                          <p className="text-[11px] font-mono text-slate-400">{sch.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-navy-900">{sch.routeName}</p>
                      <p className="text-[11px] text-slate-500">{sch.stopsScheduled || 5} stops en route</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 bg-bus-100 px-2 py-0.5 rounded border border-bus-200">
                        {sch.busNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {sch.driverName}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900">{sch.startTime}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600">{sch.campusArrivalTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                          <span
                            key={day}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              sch.days?.includes(day)
                                ? 'bg-navy-800 text-white'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {day[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="scheduled" size="sm">
                        {sch.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(sch)}
                          className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedSchedule(sch); setIsDeleteModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CALENDAR WEEKLY MATRIX VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-navy-700" />
              Weekly Operational Dispatch Roster (Mon - Fri)
            </h3>
            <span className="text-xs text-slate-500 font-medium">Standard Academic Term Schedule</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
              <div key={day} className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-3 space-y-3">
                <div className="border-b border-slate-200/70 pb-2">
                  <p className="font-extrabold text-xs text-navy-900">{day}</p>
                  <p className="text-[10px] text-slate-400">Regular Session</p>
                </div>

                <div className="space-y-2">
                  {schedules.map(s => (
                    <div
                      key={s.id + day}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs space-y-1 hover:border-navy-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900 text-[11px] truncate">{s.busNumber}</span>
                        <span className="font-mono text-[10px] text-slate-500">{s.startTime}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{s.routeName.split(' - ')[1] || s.routeName}</p>
                      <p className="text-[10px] text-slate-400 truncate">Driver: {s.driverName}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT SCHEDULE MODAL */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? 'Create Dispatch Schedule' : `Edit Schedule: ${selectedSchedule?.id}`}
        subtitle="Configure shift type, route corridor, vehicle allocation, and operating hours"
        maxWidth="max-w-md"
      >
        <form onSubmit={isAddModalOpen ? handleSubmitAdd : handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shift Type *</label>
            <select
              value={formData.shiftType}
              onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-semibold"
            >
              <option value="Morning Pickup">Morning Pickup Run</option>
              <option value="Afternoon Drop-off">Afternoon Drop-off Run</option>
              <option value="Midday Kindergarten">Midday Kindergarten Run</option>
              <option value="Special Activity / Sports">Special Activity / Sports Dispatch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Transit Route *</label>
            <select
              value={formData.routeId}
              onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-medium"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.routeName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Bus *</label>
              <select
                value={formData.busId}
                onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                {buses.map(b => (
                  <option key={b.id} value={b.id}>{b.busNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Driver *</label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Departure Time</label>
              <input
                type="text"
                placeholder="07:05 AM"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Arrival</label>
              <input
                type="text"
                placeholder="07:50 AM"
                value={formData.campusArrivalTime}
                onChange={(e) => setFormData({ ...formData, campusArrivalTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#17365D] hover:bg-navy-800 rounded-xl shadow-sm"
            >
              {isAddModalOpen ? 'Create Schedule' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedSchedule) deleteSchedule(selectedSchedule.id);
        }}
        title="Remove Schedule Shift"
        message={`Are you sure you want to remove ${selectedSchedule?.shiftType} for ${selectedSchedule?.routeName}?`}
      />
    </div>
  );
};
