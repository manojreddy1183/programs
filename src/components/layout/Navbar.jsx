import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransit } from '../../context/TransitContext';
import { 
  Search, 
  Bell, 
  ShieldCheck, 
  ChevronDown, 
  User, 
  LogOut, 
  HelpCircle, 
  Bus, 
  Settings, 
  AlertTriangle,
  RotateCcw,
  Eye,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ activePage, onNavigate, onOpenCommandPalette }) => {
  const { currentUser, logout, switchRole, allUsers } = useAuth();
  const { buses, drivers, resetToSampleData } = useTransit();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive active urgent alerts
  const maintenanceAlerts = buses.filter(b => b.status === 'Maintenance');
  const expiringDrivers = drivers.filter(d => {
    const expiry = new Date(d.licenseExpiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffDays < 30;
  });
  const totalNotifications = maintenanceAlerts.length + expiringDrivers.length;

  const pageTitles = {
    dashboard: 'Operations Dashboard',
    students: 'Student Directory & Records',
    buses: 'Bus Fleet Management',
    drivers: 'Driver Personnel & Certifications',
    routes: 'Transit Routes & Stop Sequences',
    stops: 'Bus Stop Master Directory',
    schedules: 'Fleet Dispatch & Schedules',
    assignments: 'Student Transportation Allocation',
    reports: 'Transportation Analytics & Reports',
    users: 'System Users & Role Access',
    settings: 'TransitIQ System Settings'
  };

  const roleColors = {
    Administrator: 'bg-navy-800 text-white border-navy-700',
    'Transport Manager': 'bg-bus-400 text-navy-950 font-semibold border-bus-300',
    Viewer: 'bg-slate-200 text-slate-800 border-slate-300'
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Page Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <nav className="flex items-center text-xs text-slate-400 font-medium space-x-1.5">
            <span>TransitIQ</span>
            <span>/</span>
            <span className="text-slate-600 capitalize">{activePage}</span>
          </nav>
          <h1 className="text-base sm:text-lg font-bold text-navy-900 tracking-tight leading-tight">
            {pageTitles[activePage] || 'Transit Management'}
          </h1>
        </div>
      </div>

      {/* Middle: Global Quick Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div 
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl cursor-pointer text-slate-400 hover:text-slate-600 transition-all text-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search students, buses, routes, drivers...</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Reset Mock Data button for reviewers */}
        <button
          onClick={resetToSampleData}
          title="Reset database to initial sample data"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Data</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-navy-800 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-navy-900">Alerts & Notifications</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-700">
                    {totalNotifications} new
                  </span>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)} 
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {maintenanceAlerts.map(b => (
                  <div key={b.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="text-xs flex-1">
                      <p className="font-semibold text-slate-800">Fleet Alert: {b.busNumber}</p>
                      <p className="text-slate-500 mt-0.5">{b.maintenanceIssue || 'Scheduled maintenance inspection pending.'}</p>
                      <button 
                        onClick={() => { onNavigate('buses'); setShowNotifications(false); }}
                        className="text-navy-700 hover:underline font-semibold mt-1 inline-block"
                      >
                        Inspect Bus →
                      </button>
                    </div>
                  </div>
                ))}

                {expiringDrivers.map(d => (
                  <div key={d.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-xs flex-1">
                      <p className="font-semibold text-slate-800">License Expiry Warning: {d.fullName}</p>
                      <p className="text-slate-500 mt-0.5">
                        CDL {d.licenseNumber} expires on {d.licenseExpiryDate}.
                      </p>
                      <button 
                        onClick={() => { onNavigate('drivers'); setShowNotifications(false); }}
                        className="text-navy-700 hover:underline font-semibold mt-1 inline-block"
                      >
                        Review Driver →
                      </button>
                    </div>
                  </div>
                ))}

                {totalNotifications === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    All fleet vehicles and driver certifications are up to date!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Fast Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-colors shadow-2xs ${roleColors[currentUser?.role] || 'bg-slate-100 text-slate-800'}`}
            title="Click to quickly switch role for demo evaluation"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">{currentUser?.role}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Test Role-Based Access</p>
                <p className="text-xs text-slate-500 mt-0.5">Switch view to preview permissions</p>
              </div>
              <div className="p-1 space-y-1">
                {[
                  { role: 'Administrator', desc: 'Full access to all modules, records, and settings' },
                  { role: 'Transport Manager', desc: 'Fleet, routes, stops, schedules, & student allocation' },
                  { role: 'Viewer', desc: 'Read-only access (action buttons disabled)' }
                ].map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex flex-col transition-colors ${
                      currentUser?.role === r.role ? 'bg-navy-50 text-navy-800 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{r.role}</span>
                      {currentUser?.role === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-navy-700" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 font-normal">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-navy-900 leading-tight">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{currentUser?.department || 'Oakridge Transit'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-navy-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${roleColors[currentUser?.role] || 'bg-slate-100 text-slate-700'}`}>
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              <div className="p-1 text-xs">
                <button
                  onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>System Settings</span>
                </button>
                <button
                  onClick={() => { onNavigate('users'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>User Accounts</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
