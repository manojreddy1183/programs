import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { CapacityBar } from '../components/common/CapacityBar';
import {
  UserCheck,
  Search,
  Filter,
  Bus,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GraduationCap,
  Users2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const Assignments = () => {
  const { students, buses, routes, stops, assignStudentToBusAndRoute, showToast } = useTransit();
  const { hasPermission } = useAuth();

  // Active assignment workflow state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [targetBusId, setTargetBusId] = useState(buses[0]?.id || '');
  const [targetRouteId, setTargetRouteId] = useState(routes[0]?.id || '');
  const [targetStopId, setTargetStopId] = useState('');

  const [studentFilter, setStudentFilter] = useState('unassigned'); // 'unassigned' | 'all'
  const [searchStudentTerm, setSearchStudentTerm] = useState('');

  const targetBus = buses.find(b => b.id === targetBusId) || buses[0];
  const targetRoute = routes.find(r => r.id === targetRouteId) || routes[0];
  const busRoster = students.filter(s => s.assignedBusId === targetBusId);
  const currentAssignedCount = busRoster.length;
  const isBusFull = targetBus && currentAssignedCount >= targetBus.capacity;
  const remainingSeats = targetBus ? Math.max(0, targetBus.capacity - currentAssignedCount) : 0;

  // Stops available for target route
  const availableStops = stops.filter(s => s.routeId === targetRouteId);

  // Filter students pool
  const candidateStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      s.classGrade.toLowerCase().includes(searchStudentTerm.toLowerCase());

    const matchesType =
      studentFilter === 'unassigned'
        ? !s.assignedBusId
        : true;

    return matchesSearch && matchesType;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleExecuteAssignment = (e) => {
    e.preventDefault();

    if (!hasPermission('edit')) {
      showToast('Action restricted: Read-only Viewer cannot allocate students.', 'warning');
      return;
    }

    if (!selectedStudentId) {
      showToast('Please select a student from the pool first.', 'warning');
      return;
    }

    if (!targetBusId) {
      showToast('Please select a target bus.', 'warning');
      return;
    }

    if (isBusFull) {
      showToast(`Cannot assign: ${targetBus.busNumber} has reached its limit of ${targetBus.capacity} seats!`, 'error');
      return;
    }

    const result = assignStudentToBusAndRoute(
      selectedStudentId,
      targetBusId,
      targetRouteId,
      targetStopId || (availableStops[0]?.id || null)
    );

    if (result.success) {
      // Clear selection so user can assign next student
      setSelectedStudentId('');
    }
  };

  const handleUnassignStudent = (studentId) => {
    if (!hasPermission('edit')) {
      showToast('Action restricted: Read-only Viewer cannot unassign students.', 'warning');
      return;
    }
    assignStudentToBusAndRoute(studentId, null, null, null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <div>
        <h2 className="text-xl font-bold text-navy-900 tracking-tight">Student-Bus Allocation Workspace</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Map students to buses with real-time seating capacity validation and route stop scheduling
        </p>
      </div>

      {/* Fleet Capacity Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {buses.slice(0, 6).map(b => {
          const count = students.filter(s => s.assignedBusId === b.id).length;
          const isFull = count >= b.capacity;
          const isSelected = b.id === targetBusId;

          return (
            <div
              key={b.id}
              onClick={() => { setTargetBusId(b.id); if (b.assignedRouteId) setTargetRouteId(b.assignedRouteId); }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-navy-900 text-white border-navy-900 shadow-md ring-2 ring-bus-400'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">{b.busNumber}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isFull ? 'bg-rose-500 text-white' : isSelected ? 'bg-white/20 text-[#FFC928]' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isFull ? 'FULL' : `${b.capacity - count} left`}
                </span>
              </div>
              <div className="mt-2">
                <CapacityBar assigned={count} total={b.capacity} showLabel={false} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split Allocation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Student Selection Pool */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-navy-700" />
                Student Candidate Pool
              </h3>
              <span className="text-xs font-bold text-slate-500">{candidateStudents.length} Students</span>
            </div>

            {/* Filter & Search */}
            <div className="mt-3 space-y-2">
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setStudentFilter('unassigned')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'unassigned' ? 'bg-white text-navy-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Unassigned Only ({students.filter(s => !s.assignedBusId).length})
                </button>
                <button
                  onClick={() => setStudentFilter('all')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'all' ? 'bg-white text-navy-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  All Students ({students.length})
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter student candidate..."
                  value={searchStudentTerm}
                  onChange={(e) => setSearchStudentTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600"
                />
              </div>
            </div>

            {/* Candidates list */}
            <div className="mt-3 space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {candidateStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-600">All students are allocated!</p>
                  <p className="text-[11px] mt-0.5">Switch filter to "All Students" to reassign existing riders</p>
                </div>
              ) : (
                candidateStudents.map((s) => {
                  const isSelected = s.id === selectedStudentId;

                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-navy-50/80 border-navy-600 ring-1 ring-navy-600 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.fullName.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{s.fullName}</p>
                          <p className="text-[11px] text-slate-400">{s.classGrade}-{s.section} • {s.id}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        {s.assignedBusId ? (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {s.assignedBusNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            Needs Bus
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {selectedStudent && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-navy-900">Selected Candidate: {selectedStudent.fullName}</p>
              <p className="text-[11px] text-slate-500">Guardian Contact: {selectedStudent.parentName} ({selectedStudent.contactNumber})</p>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Allocation Controller & Bus Passenger Roster */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Bus Allocation Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-navy-700" />
                  Seat Assignment Controller
                </h3>
                <p className="text-xs text-slate-500">Assign candidate student to target fleet vehicle</p>
              </div>

              {/* Real-time capacity guard badge */}
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                isBusFull
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : remainingSeats <= 3
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}>
                {isBusFull ? 'Capacity Full (0 Seats)' : `${remainingSeats} Seats Available`}
              </span>
            </div>

            {/* Target bus capacity visualizer */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-navy-900">{targetBus?.busNumber} ({targetBus?.model})</span>
                <span className="font-mono text-slate-600">{currentAssignedCount} / {targetBus?.capacity} Seats Occupied</span>
              </div>
              <CapacityBar assigned={currentAssignedCount} total={targetBus?.capacity || 48} showLabel={false} />
            </div>

            <form onSubmit={handleExecuteAssignment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Bus Unit *</label>
                  <select
                    value={targetBusId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setTargetBusId(id);
                      const b = buses.find(x => x.id === id);
                      if (b?.assignedRouteId) setTargetRouteId(b.assignedRouteId);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-semibold"
                  >
                    {buses.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.busNumber} ({b.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Transit Route *</label>
                  <select
                    value={targetRouteId}
                    onChange={(e) => setTargetRouteId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
                  >
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.routeName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designated Pickup Stop</label>
                  <select
                    value={targetStopId}
                    onChange={(e) => setTargetStopId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
                  >
                    <option value="">Auto-assign nearest</option>
                    {availableStops.map(s => (
                      <option key={s.id} value={s.id}>{s.stopName} ({s.pickupTime})</option>
                    ))}
                  </select>
                </div>
              </div>

              {isBusFull && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Capacity Guard Active:</strong> {targetBus?.busNumber} has zero remaining seats. Choose another bus unit or reassign existing riders.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isBusFull || !selectedStudentId}
                  className="px-6 py-2.5 bg-[#17365D] hover:bg-navy-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-[#FFC928]" />
                  <span>Confirm Allocation to {targetBus?.busNumber}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Passenger Roster for Target Bus */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-navy-700" />
                  Active Roster for {targetBus?.busNumber} ({busRoster.length} Students)
                </h3>
                <p className="text-xs text-slate-500">Currently allocated student passengers for this fleet unit</p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {busRoster.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No students currently assigned to this bus.
                </div>
              ) : (
                busRoster.map(s => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">{s.fullName} <span className="font-normal text-slate-500">({s.classGrade}-{s.section})</span></p>
                      <p className="text-[11px] text-slate-400 font-mono">Seat: {s.seatNumber || 'Free'} • Stop: {s.pickupStopName}</p>
                    </div>

                    <button
                      onClick={() => handleUnassignStudent(s.id)}
                      title="Unassign from this bus"
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline px-2 py-1 rounded bg-rose-50 border border-rose-200"
                    >
                      Unassign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
