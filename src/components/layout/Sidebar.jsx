import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransit } from '../../context/TransitContext';
import {
  LayoutDashboard,
  GraduationCap,
  Bus,
  Users2,
  MapPin,
  Navigation,
  CalendarClock,
  UserCheck,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ activePage, onNavigate, isCollapsed, onToggleCollapse }) => {
  const { logout, currentUser } = useAuth();
  const { students, buses, drivers } = useTransit();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap, badge: students.length },
    { id: 'buses', label: 'Buses', icon: Bus, badge: buses.length },
    { id: 'drivers', label: 'Drivers', icon: Users2, badge: drivers.length },
    { id: 'routes', label: 'Routes', icon: Navigation },
    { id: 'stops', label: 'Stops', icon: MapPin },
    { id: 'schedules', label: 'Schedules', icon: CalendarClock },
    { id: 'assignments', label: 'Student-Bus Assignments', icon: UserCheck },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#17365D] text-slate-200 transition-all duration-300 z-40 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      } shrink-0 border-r border-navy-800 shadow-xl min-h-screen`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-navy-600/50">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-[#FFC928] flex items-center justify-center shrink-0 shadow-md">
            <Bus className="w-6 h-6 text-navy-900" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  Transit<span className="text-[#FFC928]">IQ</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#FFC928]/20 text-[#FFC928] rounded border border-[#FFC928]/30">
                  v2.4
                </span>
              </div>
              <span className="text-[11px] text-slate-300 tracking-wide font-medium truncate">
                Oakridge Academy
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-600/70 transition-colors focus:outline-none"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1">
        {!isCollapsed && (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Transport Modules
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'bg-navy-800 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-navy-600/50'
              }`}
            >
              {/* Active Marker Bar */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1.2 bg-[#FFC928] rounded-r-full shadow-[0_0_8px_#FFC928]" />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-[#FFC928]' : 'text-slate-300 group-hover:text-white'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-bold transition-colors ${
                    isActive
                      ? 'bg-[#FFC928] text-navy-900'
                      : 'bg-navy-800 text-slate-300 group-hover:bg-navy-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom User & Logout Section */}
      <div className="p-3 border-t border-navy-600/50 space-y-2">
        {!isCollapsed && (
          <div className="bg-navy-800/80 rounded-xl p-2.5 flex items-center gap-3 border border-navy-600/40">
            <div className="w-8 h-8 rounded-lg bg-[#FFC928]/20 border border-[#FFC928]/40 flex items-center justify-center text-xs font-bold text-[#FFC928] shrink-0">
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-300 truncate">{currentUser?.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title={isCollapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0 text-rose-400" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
