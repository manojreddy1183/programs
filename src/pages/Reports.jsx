import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { Badge } from '../components/common/Badge';
import { CapacityBar } from '../components/common/CapacityBar';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  FileText,
  Bus,
  Users2,
  GraduationCap,
  Wrench,
  Navigation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Reports = () => {
  const { students, buses, drivers, routes, maintenanceRecords, showToast } = useTransit();

  const [activeReport, setActiveReport] = useState('allocation'); // 'allocation' | 'utilization' | 'drivers' | 'routes' | 'maintenance'
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Fall Term 2026');

  // Export CSV generator
  const handleExportCSV = () => {
    let filename = `transit_report_${activeReport}.csv`;
    let headers = [];
    let rows = [];

    if (activeReport === 'allocation') {
      headers = ['Student ID', 'Full Name', 'Class', 'Guardian', 'Contact', 'Bus', 'Route', 'Stop', 'Status'];
      rows = students.map(s => [
        s.id, `"${s.fullName}"`, `${s.classGrade}-${s.section}`, `"${s.parentName}"`, s.contactNumber,
        s.assignedBusNumber || 'Unassigned', `"${s.assignedRouteName || 'None'}"`, `"${s.pickupStopName || 'None'}"`, s.status
      ]);
    } else if (activeReport === 'utilization') {
      headers = ['Bus Number', 'Plate', 'Model', 'Capacity', 'Allocated', 'Occupancy Pct', 'Driver', 'Route', 'Status'];
      rows = buses.map(b => {
        const assigned = students.filter(s => s.assignedBusId === b.id).length;
        return [
          b.busNumber, b.registrationNumber, `"${b.model}"`, b.capacity, assigned, `${Math.round((assigned / b.capacity) * 100)}%`,
          `"${b.assignedDriverName || 'Unassigned'}"`, `"${b.assignedRouteName || 'None'}"`, b.status
        ];
      });
    } else if (activeReport === 'drivers') {
      headers = ['Driver ID', 'Name', 'Phone', 'License', 'Expiry', 'Assigned Bus', 'Status', 'Safety Rating'];
      rows = drivers.map(d => [
        d.id, `"${d.fullName}"`, d.phoneNumber, d.licenseNumber, d.licenseExpiryDate, d.assignedBusNumber || 'Standby', d.employmentStatus, d.rating
      ]);
    } else if (activeReport === 'routes') {
      headers = ['Route ID', 'Route Name', 'Origin', 'Destination', 'Stops', 'Duration', 'Bus', 'Status'];
      rows = routes.map(r => [
        r.id, `"${r.routeName}"`, `"${r.startingPoint}"`, `"${r.destination}"`, r.totalStops, r.estimatedDuration, r.assignedBusNumber || 'None', r.status
      ]);
    } else if (activeReport === 'maintenance') {
      headers = ['Record ID', 'Bus Number', 'Service Operation', 'Scheduled Date', 'Cost USD', 'Technician', 'Status'];
      rows = maintenanceRecords.map(m => [
        m.id, m.busNumber, `"${m.serviceType}"`, m.scheduledDate, m.costUsd, `"${m.technician}"`, m.status
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${activeReport.toUpperCase()} report to CSV.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Transportation Analytics & Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compliance audits, fleet utilization metrics, maintenance expenses, and student ridership reports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#17365D] hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-[#FFC928]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-sm overflow-x-auto gap-1">
        {[
          { id: 'allocation', label: 'Student Allocation', icon: GraduationCap },
          { id: 'utilization', label: 'Bus Fleet Utilization', icon: Bus },
          { id: 'drivers', label: 'Driver Compliance', icon: Users2 },
          { id: 'routes', label: 'Route & Schedule Audit', icon: Navigation },
          { id: 'maintenance', label: 'Maintenance & Expenses', icon: Wrench },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-navy-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFC928]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="font-semibold text-slate-500">Academic Period:</span>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-navy-900"
          >
            <option value="Fall Term 2026">Fall Term 2026 (Current)</option>
            <option value="Spring Term 2026">Spring Term 2026</option>
            <option value="Annual Fleet 2026">Annual Comprehensive 2026</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span>Generated: <strong>Today, 10:30 AM</strong></span>
          <span>School: <strong>Oakridge International Academy</strong></span>
        </div>
      </div>

      {/* REPORT 1: STUDENT TRANSPORTATION ALLOCATION */}
      {activeReport === 'allocation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Registered Students</span>
              <p className="text-2xl font-black text-navy-900 mt-1">{students.length}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Allocated to Bus Fleet</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {students.filter(s => s.assignedBusId).length} ({Math.round((students.filter(s => s.assignedBusId).length / students.length) * 100)}%)
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Unallocated (Pending)</span>
              <p className="text-2xl font-black text-amber-700 mt-1">
                {students.filter(s => !s.assignedBusId).length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">Student Transportation Roster</h3>
              <span className="text-xs text-slate-400 font-medium">Sorted by Student Name</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Guardian / Phone</th>
                    <th className="py-3 px-4">Assigned Bus</th>
                    <th className="py-3 px-4">Route Corridor</th>
                    <th className="py-3 px-4">Pickup Stop</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{s.fullName}</td>
                      <td className="py-2.5 px-4">{s.classGrade}-{s.section}</td>
                      <td className="py-2.5 px-4">{s.parentName} ({s.contactNumber})</td>
                      <td className="py-2.5 px-4 font-bold text-navy-800">{s.assignedBusNumber || 'Unassigned'}</td>
                      <td className="py-2.5 px-4">{s.assignedRouteName || 'None'}</td>
                      <td className="py-2.5 px-4">{s.pickupStopName || 'Not Set'}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={s.status === 'Active' ? 'active' : 'inactive'} size="sm">{s.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: BUS UTILIZATION */}
      {activeReport === 'utilization' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Fleet Seating</span>
              <p className="text-2xl font-black text-navy-900 mt-1">
                {buses.reduce((acc, b) => acc + b.capacity, 0)} Seats
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Occupied Seats</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {students.filter(s => s.assignedBusId).length} Seats
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Fleet Seating Efficiency</span>
              <p className="text-2xl font-black text-navy-900 mt-1">
                {Math.round((students.filter(s => s.assignedBusId).length / buses.reduce((acc, b) => acc + b.capacity, 0)) * 100)}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">Fleet Seating & Operational Utilization</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                    <th className="py-3 px-4">Bus Unit</th>
                    <th className="py-3 px-4">Model & Fuel</th>
                    <th className="py-3 px-4">Seating Capacity</th>
                    <th className="py-3 px-4">Occupancy %</th>
                    <th className="py-3 px-4">Assigned Driver</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buses.map(b => {
                    const assigned = students.filter(s => s.assignedBusId === b.id).length;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{b.busNumber}</td>
                        <td className="py-2.5 px-4">{b.model}</td>
                        <td className="py-2.5 px-4">{assigned} / {b.capacity} seats</td>
                        <td className="py-2.5 px-4 w-40">
                          <CapacityBar assigned={assigned} total={b.capacity} size="sm" />
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{b.assignedDriverName}</td>
                        <td className="py-2.5 px-4">{b.assignedRouteName}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant={b.status === 'Active' ? 'active' : b.status === 'Maintenance' ? 'maintenance' : 'inactive'} size="sm">
                            {b.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: DRIVER COMPLIANCE */}
      {activeReport === 'drivers' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Commercial Driver License (CDL) & Compliance Audit</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">CDL Number</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Assigned Vehicle</th>
                  <th className="py-3 px-4">Employment</th>
                  <th className="py-3 px-4">Safety Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{d.fullName}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold">{d.licenseNumber}</td>
                    <td className="py-2.5 px-4 font-mono">{d.licenseExpiryDate}</td>
                    <td className="py-2.5 px-4 font-bold text-navy-800">{d.assignedBusNumber || 'Standby'}</td>
                    <td className="py-2.5 px-4">{d.employmentStatus}</td>
                    <td className="py-2.5 px-4 font-bold text-amber-600">★ {d.rating} / 5.0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: ROUTES AUDIT */}
      {activeReport === 'routes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Transit Corridor Itinerary & Schedule Efficiency</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Route Name</th>
                  <th className="py-3 px-4">Origin</th>
                  <th className="py-3 px-4">Total Stops</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Assigned Bus</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{r.routeName}</td>
                    <td className="py-2.5 px-4">{r.startingPoint}</td>
                    <td className="py-2.5 px-4 font-semibold">{r.totalStops} Stops</td>
                    <td className="py-2.5 px-4 font-mono">{r.estimatedDuration}</td>
                    <td className="py-2.5 px-4 font-bold text-navy-800">{r.assignedBusNumber || 'None'}</td>
                    <td className="py-2.5 px-4">
                      <Badge variant={r.status === 'Active' ? 'active' : 'inactive'} size="sm">{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 5: MAINTENANCE EXPENSES */}
      {activeReport === 'maintenance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Servicing Records</span>
              <p className="text-2xl font-black text-navy-900 mt-1">{maintenanceRecords.length}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Maintenance Expenditure</span>
              <p className="text-2xl font-black text-navy-900 mt-1">
                ${maintenanceRecords.reduce((acc, m) => acc + m.costUsd, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Average Cost Per Vehicle</span>
              <p className="text-2xl font-black text-slate-800 mt-1">
                ${(maintenanceRecords.reduce((acc, m) => acc + m.costUsd, 0) / (buses.length || 1)).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">Maintenance & Servicing Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                    <th className="py-3 px-4">Bus Unit</th>
                    <th className="py-3 px-4">Operation</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Cost</th>
                    <th className="py-3 px-4">Technician Workshop</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceRecords.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{m.busNumber}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{m.serviceType}</td>
                      <td className="py-2.5 px-4 font-mono">{m.scheduledDate}</td>
                      <td className="py-2.5 px-4 font-bold text-navy-900 font-mono">${m.costUsd.toFixed(2)}</td>
                      <td className="py-2.5 px-4">{m.technician}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={m.status === 'Completed' ? 'active' : 'maintenance'} size="sm">
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
