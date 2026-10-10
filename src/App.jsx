import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransitProvider } from './context/TransitContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Buses } from './pages/Buses';
import { Drivers } from './pages/Drivers';
import { RoutesAndStops } from './pages/RoutesAndStops';
import { Schedules } from './pages/Schedules';
import { Assignments } from './pages/Assignments';
import { Reports } from './pages/Reports';
import { UserManagement } from './pages/UserManagement';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

import { Eye, ShieldAlert } from 'lucide-react';

const MainLayout = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'students':
        return <Students />;
      case 'buses':
        return <Buses />;
      case 'drivers':
        return <Drivers />;
      case 'routes':
      case 'stops':
        return <RoutesAndStops />;
      case 'schedules':
        return <Schedules />;
      case 'assignments':
        return <Assignments />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  const isViewer = currentUser?.role === 'Viewer';

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activePage={activePage}
          onNavigate={setActivePage}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Informative Read-Only Banner for Viewer Role */}
        {isViewer && (
          <div className="bg-slate-200 text-slate-800 px-6 py-2 border-b border-slate-300 text-xs flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-600" />
              <span>
                <strong>Viewer Mode Active:</strong> You are browsing with read-only permissions. Record creation, editing, and deletion are disabled.
              </span>
            </div>
            <span className="font-semibold text-navy-800">Switch role in the top-right header to test Admin privileges</span>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActivePage}
      />

      {/* Global Toast Notifications Stack */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TransitProvider>
        <MainLayout />
      </TransitProvider>
    </AuthProvider>
  );
}
