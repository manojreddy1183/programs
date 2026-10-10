import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Users2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Award,
  Bus,
  Calendar,
  CheckCircle2,
  Star,
  FileCheck
} from 'lucide-react';

export const Drivers = () => {
  const { drivers, buses, routes, addDriver, updateDriver, deleteDriver, showToast } = useTransit();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Form
  const initialDriverForm = {
    fullName: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    assignedBusId: '',
    assignedRouteId: '',
    employmentStatus: 'Full-time',
    yearsExperience: 5,
    emergencyContact: '',
    rating: 4.8
  };
  const [formData, setFormData] = useState(initialDriverForm);
  const [formErrors, setFormErrors] = useState({});

  // License expiration calculation
  const getLicenseStatus = (expiryDate) => {
    if (!expiryDate) return { label: 'Unknown', variant: 'inactive', isExpired: false, isExpiringSoon: false };
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `EXPIRED (${Math.abs(diffDays)}d ago)`, variant: 'danger', isExpired: true, isExpiringSoon: false };
    } else if (diffDays <= 30) {
      return { label: `Expiring Soon (${diffDays}d left)`, variant: 'warning', isExpired: false, isExpiringSoon: true };
    } else {
      return { label: `Valid (${Math.round(diffDays / 365 * 10) / 10} yrs)`, variant: 'active', isExpired: false, isExpiringSoon: false };
    }
  };

  // Flagged drivers
  const criticalDrivers = drivers.filter(d => {
    const status = getLicenseStatus(d.licenseExpiryDate);
    return status.isExpired || status.isExpiringSoon;
  });

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phoneNumber.includes(searchTerm);

    const matchesStatus =
      selectedStatus === 'All'
        ? true
        : selectedStatus === 'Expired'
        ? getLicenseStatus(d.licenseExpiryDate).isExpired
        : selectedStatus === 'Expiring'
        ? getLicenseStatus(d.licenseExpiryDate).isExpiringSoon
        : d.employmentStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const validateDriverForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required.';
    if (!formData.licenseNumber.trim()) errors.licenseNumber = 'Commercial Driver License (CDL) is required.';
    if (!formData.licenseExpiryDate) errors.licenseExpiryDate = 'License expiration date is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    if (!hasPermission('create')) {
      showToast('Action restricted: Read-only Viewer cannot register new drivers.', 'warning');
      return;
    }
    setFormData({
      ...initialDriverForm,
      licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    if (!hasPermission('edit')) {
      showToast('Action restricted: Read-only Viewer cannot modify driver files.', 'warning');
      return;
    }
    setSelectedDriver(driver);
    setFormData({
      fullName: driver.fullName,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate,
      assignedBusId: driver.assignedBusId || '',
      assignedRouteId: driver.assignedRouteId || '',
      employmentStatus: driver.employmentStatus,
      yearsExperience: driver.yearsExperience || 5,
      emergencyContact: driver.emergencyContact || '',
      rating: driver.rating || 4.8
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!validateDriverForm()) return;

    const bus = buses.find(b => b.id === formData.assignedBusId);
    const route = routes.find(r => r.id === formData.assignedRouteId);

    const result = addDriver({
      ...formData,
      assignedBusNumber: bus ? bus.busNumber : 'Standby',
      assignedRouteName: route ? route.routeName : 'Reserve Pool'
    });

    if (result.success) setIsAddModalOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!validateDriverForm()) return;

    const bus = buses.find(b => b.id === formData.assignedBusId);
    const route = routes.find(r => r.id === formData.assignedRouteId);

    const result = updateDriver(selectedDriver.id, {
      ...formData,
      assignedBusNumber: bus ? bus.busNumber : 'Standby',
      assignedRouteName: route ? route.routeName : 'Reserve Pool'
    });

    if (result.success) setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Driver Personnel Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Commercial license verification, vehicle assignments, and DOT compliance records
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#17365D] hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FFC928]" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Proactive Compliance Banner if licenses are expired / expiring soon */}
      {criticalDrivers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-amber-950">
                Department Compliance Alert: {criticalDrivers.length} Driver License(s) Require Review
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {criticalDrivers.map(d => `${d.fullName} (${getLicenseStatus(d.licenseExpiryDate).label})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStatus('Expiring')}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
          >
            Filter Flagged Drivers
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search driver by name, license, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">License / Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 font-medium text-slate-700"
          >
            <option value="All">All Drivers</option>
            <option value="Full-time">Full-time Staff</option>
            <option value="Part-time">Part-time Standby</option>
            <option value="Expiring">Expiring Soon (&lt;30 days)</option>
            <option value="Expired">Expired Licenses</option>
          </select>
        </div>
      </div>

      {/* DRIVERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Driver ID & Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">CDL License Number</th>
                <th className="py-3 px-4">License Expiration</th>
                <th className="py-3 px-4">Assigned Bus</th>
                <th className="py-3 px-4">Transit Route</th>
                <th className="py-3 px-4">Employment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrivers.map((driver) => {
                const licStatus = getLicenseStatus(driver.licenseExpiryDate);

                return (
                  <tr key={driver.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-50 text-navy-800 font-bold border border-navy-100 flex items-center justify-center shrink-0">
                          {driver.fullName.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{driver.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{driver.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {driver.phoneNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {driver.licenseNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-mono text-slate-600">{driver.licenseExpiryDate}</p>
                        <Badge variant={licStatus.variant} size="sm">
                          {licStatus.label}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {driver.assignedBusId ? (
                        <span className="font-bold text-navy-900 bg-bus-50 px-2 py-0.5 rounded border border-bus-200">
                          {driver.assignedBusNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">Standby Pool</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-[170px] truncate font-medium text-slate-700">
                      {driver.assignedRouteName || 'Reserve'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        driver.employmentStatus === 'Full-time'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {driver.employmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedDriver(driver); setIsViewModalOpen(true); }}
                          className="p-1.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(driver)}
                          className="p-1.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedDriver(driver); setIsDeleteModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT DRIVER MODAL */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? 'Register Commercial Driver' : `Edit Driver: ${selectedDriver?.fullName}`}
        subtitle="Manage personal contact, CDL commercial credentials, and fleet route assignment"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={isAddModalOpen ? handleSubmitAdd : handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driver Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Samuel Henderson"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
              {formErrors.fullName && <p className="text-[11px] text-rose-500 mt-1">{formErrors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
              {formErrors.phoneNumber && <p className="text-[11px] text-rose-500 mt-1">{formErrors.phoneNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CDL License Number *</label>
              <input
                type="text"
                placeholder="e.g. CDL-NY-8492041"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
              {formErrors.licenseNumber && <p className="text-[11px] text-rose-500 mt-1">{formErrors.licenseNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">License Expiration Date *</label>
              <input
                type="date"
                value={formData.licenseExpiryDate}
                onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
              {formErrors.licenseExpiryDate && <p className="text-[11px] text-rose-500 mt-1">{formErrors.licenseExpiryDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employment Status</label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="Full-time">Full-time Regular</option>
                <option value="Part-time">Part-time Standby</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Years Experience</label>
              <input
                type="number"
                min="1"
                max="40"
                value={formData.yearsExperience}
                onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assign Primary Bus</label>
              <select
                value={formData.assignedBusId}
                onChange={(e) => setFormData({ ...formData, assignedBusId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">Unassigned (Standby)</option>
                {buses.map(b => (
                  <option key={b.id} value={b.id}>{b.busNumber} ({b.registrationNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 999-9999"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
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
              {isAddModalOpen ? 'Save Driver' : 'Update Credentials'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW DRIVER PROFILE MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Driver Dossier: ${selectedDriver?.fullName}`}
        subtitle="Department of Transportation qualification profile & ratings"
        maxWidth="max-w-md"
      >
        {selectedDriver && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-navy-800 text-[#FFC928] flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                {selectedDriver.fullName.slice(0, 1)}
              </div>
              <div>
                <h4 className="font-extrabold text-navy-900 text-base">{selectedDriver.fullName}</h4>
                <p className="text-xs font-mono text-slate-500">{selectedDriver.id}</p>
                <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{selectedDriver.rating} Safety Rating</span>
                  <span className="text-slate-400 font-normal">({selectedDriver.yearsExperience} yrs exp)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Commercial License:</span>
                <span className="font-mono font-bold text-slate-800">{selectedDriver.licenseNumber}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">License Expiry:</span>
                <span className="font-semibold text-slate-800">{selectedDriver.licenseExpiryDate}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Phone Contact:</span>
                <span className="font-bold text-slate-800">{selectedDriver.phoneNumber}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Assigned Bus:</span>
                <span className="font-bold text-navy-800">{selectedDriver.assignedBusNumber || 'Standby'}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Emergency Hotline:</span>
                <span className="font-medium text-slate-700">{selectedDriver.emergencyContact || 'Campus Dispatch'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-[#17365D] text-white rounded-xl text-xs font-bold hover:bg-navy-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE DRIVER DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedDriver) deleteDriver(selectedDriver.id);
        }}
        title="Remove Driver Personnel"
        message={`Are you sure you want to remove ${selectedDriver?.fullName} (${selectedDriver?.id}) from active transport personnel?`}
      />
    </div>
  );
};
