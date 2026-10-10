import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransit } from '../context/TransitContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  ShieldAlert,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  User,
  ShieldCheck,
  Edit2,
  Trash2,
  Lock,
  Mail,
  UserPlus
} from 'lucide-react';

export const UserManagement = () => {
  const { allUsers, setAllUsers, currentUser, switchRole, hasPermission } = useAuth();
  const { showToast } = useTransit();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Transport Manager',
    department: 'Fleet Operations'
  });

  const permissionsMatrix = [
    { module: 'Dashboard & KPI Analytics', admin: true, manager: true, viewer: true },
    { module: 'View Students, Buses, Routes, Stops', admin: true, manager: true, viewer: true },
    { module: 'Add / Edit / Delete Students', admin: true, manager: true, viewer: false },
    { module: 'Manage Buses & Fleet Maintenance', admin: true, manager: true, viewer: false },
    { module: 'Manage Drivers & CDL Licenses', admin: true, manager: true, viewer: false },
    { module: 'Configure Routes & Stops', admin: true, manager: true, viewer: false },
    { module: 'Allocate Students to Buses (Capacity Guard)', admin: true, manager: true, viewer: false },
    { module: 'Manage Dispatch Timetables & Schedules', admin: true, manager: true, viewer: false },
    { module: 'User Accounts & Access Management', admin: true, manager: false, viewer: false },
    { module: 'System Global Configurations', admin: true, manager: false, viewer: false },
  ];

  const handleOpenAdd = () => {
    if (!hasPermission('admin_only')) {
      showToast('Admin privilege required to add system users.', 'warning');
      return;
    }
    setFormData({
      name: '',
      email: '',
      role: 'Transport Manager',
      department: 'Fleet Operations'
    });
    setIsAddUserModalOpen(true);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Name and email are required.', 'error');
      return;
    }

    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      status: 'Active',
      lastLogin: 'Never',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
    };

    setAllUsers(prev => [...prev, newUser]);
    setIsAddUserModalOpen(false);
    showToast(`Created account for ${newUser.name}.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">System Users & Role-Based Access (RBAC)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure administrative accounts, role permissions, and access privileges
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#17365D] hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#FFC928]" />
          <span>New System User</span>
        </button>
      </div>

      {/* Users Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900">Authorized Personnel Accounts</h3>
          <span className="text-xs text-slate-400 font-medium">Click "Switch Session" to test view as that user</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map((user) => {
                const isCurrent = currentUser?.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        user.role === 'Administrator'
                          ? 'bg-navy-800 text-white border-navy-700'
                          : user.role === 'Transport Manager'
                          ? 'bg-bus-100 text-navy-950 border-bus-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{user.department}</td>
                    <td className="py-3 px-4">
                      <Badge variant="active" size="sm">{user.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{user.lastLogin}</td>
                    <td className="py-3 px-4 text-right">
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          Active Session
                        </span>
                      ) : (
                        <button
                          onClick={() => switchRole(user.role)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-navy-800 text-[11px] font-bold rounded-lg transition-colors border border-slate-200"
                        >
                          Switch Session
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-navy-700" />
            Role Permissions & Privilege Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise authorization policy controlling features across Administrator, Transport Manager, and Viewer roles
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                <th className="py-3 px-4">System Operation / Module</th>
                <th className="py-3 px-4 text-center">Administrator</th>
                <th className="py-3 px-4 text-center">Transport Manager</th>
                <th className="py-3 px-4 text-center">Viewer (Read-Only)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{item.module}</td>
                  <td className="py-2.5 px-4 text-center">
                    {item.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.manager ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.viewer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">Disabled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add System Account"
        subtitle="Grant platform access and configure role permissions"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">User Full Name *</label>
            <input
              type="text"
              placeholder="e.g. David Ross"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              placeholder="david.ross@oakridgeschool.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-semibold"
            >
              <option value="Administrator">Administrator (Full Control)</option>
              <option value="Transport Manager">Transport Manager (Fleet & Operations)</option>
              <option value="Viewer">Viewer (Read-Only Safety Monitor)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#17365D] hover:bg-navy-800 rounded-xl shadow-sm"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
