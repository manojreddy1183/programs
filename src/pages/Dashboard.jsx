import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { CapacityBar } from '../components/common/CapacityBar';
import {
  GraduationCap,
  Bus,
  Users2,
  Navigation,
  UserCheck,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Fuel,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

export const Dashboard = ({ onNavigate }) => {
  const { students, buses, drivers, routes, schedules, maintenanceRecords, activityLogs } = useTransit();
  const { currentUser } = useAuth();

  // Dynamic statistics
  const totalStudents = students.length;
  const assignedStudents = students.filter(s => s.assignedBusId).length;
  const assignmentRate = totalStudents > 0 ? Math.round((assignedStudents / totalStudents) * 100) : 0;

  const totalBuses = buses.length;
  const activeBuses = buses.filter(b => b.status === 'Active').length;
  const maintenanceBuses = buses.filter(b => b.status === 'Maintenance').length;
  const inactiveBuses = buses.filter(b => b.status === 'Inactive').length;

  const totalDrivers = drivers.length;
  const activeRoutes = routes.filter(r => r.status === 'Active').length;

  // Chart 1: Students assigned per bus data
  const busOccupancyData = buses
    .filter(b => b.status === 'Active')
    .map(b => {
      const assigned = students.filter(s => s.assignedBusId === b.id).length;
      return {
        name: b.busNumber,
        assigned,
        capacity: b.capacity,
        pct: Math.round((assigned / b.capacity) * 100)
      };
    });

  // Chart 2: Bus allocation by route data
  const routeAllocationData = routes.map((r, i) => {
    const routeBuses = buses.filter(b => b.assignedRouteId === r.id).length;
    const colors = ['#17365D', '#FFC928', '#2563EB', '#10B981', '#8B5CF6', '#F59E0B'];
    return {
      name: r.routeName.split(' - ')[0],
      fullName: r.routeName,
      count: routeBuses,
      color: colors[i % colors.length]
    };
  });

  // Chart 3: Weekly ridership mock performance (Mon - Fri)
  const weeklyData = [
    { day: 'Mon', riders: 420, onTime: 98 },
    { day: 'Tue', riders: 432, onTime: 96 },
    { day: 'Wed', riders: 445, onTime: 99 },
    { day: 'Thu', riders: 438, onTime: 95 },
    { day: 'Fri', riders: 452, onTime: 97 },
  ];

  const [activeChartTab, setActiveChartTab] = useState('ridership');

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-800 via-navy-700 to-navy-900 rounded-3xl p-6 sm:p-7 text-white shadow-card relative overflow-hidden">
        {/* Subtle decorative yellow circle */}
        <div className="absolute right-0 -bottom-10 w-72 h-72 rounded-full bg-[#FFC928]/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#FFC928] animate-ping" />
              Live Fleet Dispatch Status: All Systems Operational
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Oakridge Academy transportation network is monitoring <span className="text-[#FFC928] font-bold">{activeBuses} active buses</span> across <span className="text-[#FFC928] font-bold">{activeRoutes} routes</span>. Current student transit occupancy is {assignmentRate}%.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('assignments')}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[#FFC928] text-navy-950 hover:bg-[#F2B516] shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign Students</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-[#FFC928]" />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={GraduationCap}
          indicator="+12 this term"
          indicatorType="positive"
          subtitle="Enrolled in transport"
          iconBg="bg-blue-50 text-blue-700"
          onClick={() => onNavigate('students')}
        />
        <StatCard
          title="Total Buses"
          value={totalBuses}
          icon={Bus}
          indicator={`${activeBuses} Active`}
          indicatorType="positive"
          subtitle={`${maintenanceBuses} under service`}
          iconBg="bg-bus-100 text-bus-800"
          onClick={() => onNavigate('buses')}
        />
        <StatCard
          title="Total Drivers"
          value={totalDrivers}
          icon={Users2}
          indicator="100% CDL"
          indicatorType="neutral"
          subtitle="Licensed personnel"
          iconBg="bg-navy-50 text-navy-700"
          onClick={() => onNavigate('drivers')}
        />
        <StatCard
          title="Active Routes"
          value={activeRoutes}
          icon={Navigation}
          indicator="On Schedule"
          indicatorType="positive"
          subtitle="Daily morning/afternoon"
          iconBg="bg-purple-50 text-purple-700"
          onClick={() => onNavigate('routes')}
        />
        <StatCard
          title="Assigned Students"
          value={assignedStudents}
          icon={UserCheck}
          indicator={`${assignmentRate}%`}
          indicatorType="positive"
          subtitle={`${totalStudents - assignedStudents} pending allocation`}
          iconBg="bg-emerald-50 text-emerald-700"
          onClick={() => onNavigate('assignments')}
        />
        <StatCard
          title="Maintenance Alerts"
          value={maintenanceBuses}
          icon={AlertTriangle}
          indicator={maintenanceBuses > 0 ? "Requires Action" : "Clear"}
          indicatorType={maintenanceBuses > 0 ? "warning" : "positive"}
          subtitle="Fleet service alerts"
          iconBg={maintenanceBuses > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}
          onClick={() => onNavigate('buses')}
        />
      </div>

      {/* Dashboard Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visualization 1: Students assigned per bus (Bar Chart) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900 tracking-tight flex items-center gap-2">
                <Bus className="w-4 h-4 text-navy-700" />
                Bus Seating Utilization (Assigned vs Capacity)
              </h3>
              <p className="text-xs text-slate-500">Live seat allocations per active bus unit</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Threshold Limit: 90%
            </span>
          </div>

          <div className="pt-2 space-y-3.5">
            {busOccupancyData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="text-slate-500 font-medium">
                    <span className="text-navy-900 font-bold">{item.assigned}</span> / {item.capacity} seats ({item.pct}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.pct >= 95 ? 'bg-rose-500' : item.pct >= 85 ? 'bg-bus-400' : 'bg-navy-700'
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-navy-700" /> Optimal (&lt;85%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-bus-400" /> High Load (85-95%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Near Full (&gt;95%)</span>
            </div>
            <button onClick={() => onNavigate('buses')} className="text-navy-700 font-semibold hover:underline">
              Manage Fleet →
            </button>
          </div>
        </div>

        {/* Visualization 2: Bus Allocation by Route (Donut Chart) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900 tracking-tight flex items-center gap-2">
                <Navigation className="w-4 h-4 text-navy-700" />
                Bus Allocation by Route
              </h3>
              <Badge variant="bus" size="sm">Active Corridors</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of fleet vehicles across transit lines</p>

            {/* Donut SVG visualization */}
            <div className="py-4 flex items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                  {/* SVG segments */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#17365D" strokeWidth="12" strokeDasharray="60 180" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#FFC928" strokeWidth="12" strokeDasharray="50 190" strokeDashoffset="-60" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2563EB" strokeWidth="12" strokeDasharray="45 195" strokeDashoffset="-110" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="12" strokeDasharray="40 200" strokeDashoffset="-155" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="12" strokeDasharray="35 205" strokeDashoffset="-195" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-navy-900 leading-none">{activeRoutes}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Routes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            {routeAllocationData.slice(0, 4).map((r) => (
              <div key={r.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-slate-700 font-medium truncate max-w-[170px]">{r.fullName}</span>
                </div>
                <span className="font-bold text-navy-900">{r.count} Assigned</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 Visualizations: Weekly transportation activity & Bus Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Transportation Activity Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-navy-700" />
                Weekly Transportation Activity & Reliability
              </h3>
              <p className="text-xs text-slate-500">Student daily boardings and on-time transit punctuality rate</p>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveChartTab('ridership')}
                className={`px-3 py-1 rounded-md transition-all ${activeChartTab === 'ridership' ? 'bg-white text-navy-900 shadow-2xs' : 'text-slate-600'}`}
              >
                Ridership (Count)
              </button>
              <button
                onClick={() => setActiveChartTab('ontime')}
                className={`px-3 py-1 rounded-md transition-all ${activeChartTab === 'ontime' ? 'bg-white text-navy-900 shadow-2xs' : 'text-slate-600'}`}
              >
                Punctuality (%)
              </button>
            </div>
          </div>

          {/* SVG Area / Line Chart */}
          <div className="h-52 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
              <defs>
                <linearGradient id="ridershipGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#17365D" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#17365D" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="ontimeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC928" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FFC928" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#E2E8F0" />

              {activeChartTab === 'ridership' ? (
                <>
                  {/* Ridership Area */}
                  <polygon
                    points="50,90 145,75 240,45 335,60 430,30 430,140 50,140"
                    fill="url(#ridershipGradient)"
                  />
                  {/* Ridership Line */}
                  <polyline
                    points="50,90 145,75 240,45 335,60 430,30"
                    fill="none"
                    stroke="#17365D"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Data Points */}
                  {[[50, 90, '420'], [145, 75, '432'], [240, 45, '445'], [335, 60, '438'], [430, 30, '452']].map(([cx, cy, val], i) => (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="5" fill="#FFC928" stroke="#17365D" strokeWidth="2.5" />
                      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#17365D">
                        {val}
                      </text>
                    </g>
                  ))}
                </>
              ) : (
                <>
                  {/* On-Time Punctuality Area */}
                  <polygon
                    points="50,45 145,65 240,30 335,75 430,50 430,140 50,140"
                    fill="url(#ontimeGradient)"
                  />
                  <polyline
                    points="50,45 145,65 240,30 335,75 430,50"
                    fill="none"
                    stroke="#D4960B"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {[[50, 45, '98%'], [145, 65, '96%'], [240, 30, '99%'], [335, 75, '95%'], [430, 50, '97%']].map(([cx, cy, val], i) => (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="5" fill="#17365D" stroke="#FFC928" strokeWidth="2.5" />
                      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0B1D30">
                        {val}
                      </text>
                    </g>
                  ))}
                </>
              )}

              {/* Day Labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                <text key={day} x={50 + i * 95} y="156" textAnchor="middle" fontSize="11" fill="#64748B" fontWeight="600">
                  {day}
                </text>
              ))}
            </svg>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Average transit compliance rate this week: <strong>97.2%</strong>
            </span>
            <span className="text-slate-400">Target SLA: 95.0%</span>
          </div>
        </div>

        {/* Bus Fleet Status Overview */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-navy-700" />
              Bus Fleet Status Overview
            </h3>
            <span className="text-xs font-bold text-slate-400">{totalBuses} Total</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">Active on Routes</p>
                  <p className="text-[11px] text-emerald-700">Dispatched & operational</p>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-800">{activeBuses}</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">Under Maintenance</p>
                  <p className="text-[11px] text-amber-700">Workshop service / repair</p>
                </div>
              </div>
              <span className="text-lg font-black text-amber-800">{maintenanceBuses}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-400 text-white flex items-center justify-center font-bold text-xs">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Inactive / Standby</p>
                  <p className="text-[11px] text-slate-500">Reserve fleet units</p>
                </div>
              </div>
              <span className="text-lg font-black text-slate-800">{inactiveBuses}</span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigate('buses')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-navy-800 rounded-xl text-xs font-bold transition-colors border border-slate-200"
            >
              Open Bus Fleet Roster
            </button>
          </div>
        </div>
      </div>

      {/* Additional Sections: Upcoming Schedules, Driver Assignments, Recent Registrations, Maintenance Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Bus Schedules */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-navy-700" />
              <h3 className="text-sm font-bold text-navy-900 tracking-tight">Today's Fleet Dispatch Schedule</h3>
            </div>
            <button onClick={() => onNavigate('schedules')} className="text-xs font-semibold text-navy-700 hover:underline">
              View All →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {schedules.slice(0, 4).map((sch) => (
              <div key={sch.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{sch.busNumber}</span>
                    <Badge variant={sch.shiftType.includes('Morning') ? 'bus' : 'primary'} size="sm">
                      {sch.shiftType}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">{sch.routeName}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-navy-900 text-xs">{sch.startTime}</span>
                  <p className="text-[11px] text-slate-400">Driver: {sch.driverName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bus Maintenance Reminders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-navy-900 tracking-tight">Active Maintenance & Inspection Alerts</h3>
            </div>
            <Badge variant="maintenance" size="sm">
              {maintenanceRecords.filter(m => m.status === 'In Progress').length} in workshop
            </Badge>
          </div>

          <div className="space-y-2.5">
            {maintenanceRecords.slice(0, 3).map((rec) => (
              <div key={rec.id} className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 text-xs space-y-1.5 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-900">{rec.busNumber} - {rec.serviceType}</span>
                  <Badge variant={rec.status === 'Completed' ? 'active' : rec.status === 'In Progress' ? 'maintenance' : 'warning'} size="sm">
                    {rec.status}
                  </Badge>
                </div>
                <p className="text-slate-500 text-[11px]">{rec.notes}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/40">
                  <span>Due: {rec.completionDate}</span>
                  <span className="font-semibold text-slate-600">${rec.costUsd.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Student Registrations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-navy-700" />
              <h3 className="text-sm font-bold text-navy-900 tracking-tight">Recent Student Registrations</h3>
            </div>
            <button onClick={() => onNavigate('students')} className="text-xs font-semibold text-navy-700 hover:underline">
              Student Directory →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {students.slice(0, 4).map((stu) => (
              <div key={stu.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-navy-800 text-[11px]">
                    {stu.fullName.slice(0, 1)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{stu.fullName}</p>
                    <p className="text-[11px] text-slate-400">{stu.classGrade}-{stu.section} • {stu.parentName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-700">{stu.assignedBusNumber}</span>
                  <p className="text-[10px] text-slate-400">{stu.registeredDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Administrative Audit Activity Log */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5.5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-navy-700" />
              <h3 className="text-sm font-bold text-navy-900 tracking-tight">Recent Administrative Activities</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Live Audit Trail</span>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#FFC928] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-800 font-medium leading-tight">{log.action}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{log.user} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
