import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CapacityBar } from '../components/common/CapacityBar';
import {
  Bus,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Wrench,
  Users2,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Navigation,
  Calendar,
  ShieldCheck,
  Radio,
  Video
} from 'lucide-react';

export const Buses = () => {
  const { buses, drivers, routes, students, addBus, updateBus, deleteBus, addMaintenanceRecord, showToast } = useTransit();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  // Forms
  const initialBusForm = {
    busNumber: '',
    registrationNumber: '',
    model: 'Blue Bird All American',
    capacity: 48,
    assignedDriverId: '',
    assignedRouteId: '',
    status: 'Active',
    lastMaintenanceDate: new Date().toISOString().split('T')[0],
    nextInspectionDate: '',
    fuelType: 'Clean Diesel',
    mileageKm: 25000,
    hasGps: true,
    hasCctv: true,
    speedLimitKmh: 45
  };
  const [formData, setFormData] = useState(initialBusForm);
  const [formErrors, setFormErrors] = useState({});

  const [maintenanceForm, setMaintenanceForm] = useState({
    serviceType: 'Routine Safety Inspection & Brake Check',
    costUsd: 450,
    technician: 'Apex Fleet Care',
    notes: 'Standard 30-day comprehensive multi-point inspection.',
    completionDate: ''
  });

  // Calculate live assigned students per bus
  const getAssignedCount = (busId) => {
    return students.filter(s => s.assignedBusId === busId).length;
  };

  const filteredBuses = buses.filter(b => {
    const matchesSearch =
      b.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.assignedDriverName && b.assignedDriverName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const validateBusForm = () => {
    const errors = {};
    if (!formData.busNumber.trim()) errors.busNumber = 'Bus number is required (e.g. Bus 109).';
    if (!formData.registrationNumber.trim()) errors.registrationNumber = 'Registration license plate is required.';
    if (!formData.capacity || formData.capacity < 10) errors.capacity = 'Capacity must be at least 10 seats.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    if (!hasPermission('create')) {
      showToast('Action restricted: Read-only Viewer cannot register new buses.', 'warning');
      return;
    }
    setFormData({
      ...initialBusForm,
      busNumber: `Bus ${100 + buses.length + 1}`
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (bus) => {
    if (!hasPermission('edit')) {
      showToast('Action restricted: Read-only Viewer cannot modify buses.', 'warning');
      return;
    }
    setSelectedBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      model: bus.model,
      capacity: bus.capacity,
      assignedDriverId: bus.assignedDriverId || '',
      assignedRouteId: bus.assignedRouteId || '',
      status: bus.status,
      lastMaintenanceDate: bus.lastMaintenanceDate || '',
      nextInspectionDate: bus.nextInspectionDate || '',
      fuelType: bus.fuelType || 'Clean Diesel',
      mileageKm: bus.mileageKm || 0,
      hasGps: bus.hasGps ?? true,
      hasCctv: bus.hasCctv ?? true,
      speedLimitKmh: bus.speedLimitKmh || 45
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenMaintenance = (bus) => {
    if (!hasPermission('edit')) {
      showToast('Action restricted: Viewer cannot log maintenance.', 'warning');
      return;
    }
    setSelectedBus(bus);
    setMaintenanceForm({
      serviceType: 'Brake & Suspension Inspection',
      costUsd: 550,
      technician: 'Metro Heavy Vehicle Workshop',
      notes: 'Scheduled safety overhaul and fluid replacements.',
      completionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIsMaintenanceModalOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!validateBusForm()) return;

    const driver = drivers.find(d => d.id === formData.assignedDriverId);
    const route = routes.find(r => r.id === formData.assignedRouteId);

    const result = addBus({
      ...formData,
      capacity: Number(formData.capacity),
      assignedDriverName: driver ? driver.fullName : 'Unassigned',
      assignedRouteName: route ? route.routeName : 'Unassigned'
    });

    if (result.success) setIsAddModalOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!validateBusForm()) return;

    const driver = drivers.find(d => d.id === formData.assignedDriverId);
    const route = routes.find(r => r.id === formData.assignedRouteId);

    const result = updateBus(selectedBus.id, {
      ...formData,
      capacity: Number(formData.capacity),
      assignedDriverName: driver ? driver.fullName : 'Unassigned',
      assignedRouteName: route ? route.routeName : 'Unassigned'
    });

    if (result.success) setIsEditModalOpen(false);
  };

  const handleSubmitMaintenance = (e) => {
    e.preventDefault();
    addMaintenanceRecord({
      busId: selectedBus.id,
      busNumber: selectedBus.busNumber,
      serviceType: maintenanceForm.serviceType,
      costUsd: Number(maintenanceForm.costUsd),
      technician: maintenanceForm.technician,
      notes: maintenanceForm.notes,
      completionDate: maintenanceForm.completionDate,
      status: 'In Progress'
    });
    setIsMaintenanceModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Bus Fleet Fleet Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor bus capacity utilization, safety telematics, maintenance records, and driver allocations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View mode toggle */}
          <div className="flex bg-white rounded-xl border border-slate-200 p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-navy-800 text-white shadow-2xs' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Fleet Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-navy-800 text-white shadow-2xs' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Detailed Table
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#17365D] hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FFC928]" />
            <span>Add Bus</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by bus number, plate, or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 font-medium text-slate-700"
          >
            <option value="All">All Fleet Statuses</option>
            <option value="Active">Active (In Service)</option>
            <option value="Maintenance">Under Maintenance</option>
            <option value="Inactive">Inactive / Standby</option>
          </select>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBuses.map((bus) => {
            const assignedCount = getAssignedCount(bus.id);
            const isFull = assignedCount >= bus.capacity;

            return (
              <div
                key={bus.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-bus-100 border border-bus-300 flex items-center justify-center text-bus-800 shadow-2xs">
                        <Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-navy-900 group-hover:text-navy-700 transition-colors">
                          {bus.busNumber}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400">{bus.registrationNumber}</p>
                      </div>
                    </div>
                    <Badge variant={bus.status === 'Active' ? 'active' : bus.status === 'Maintenance' ? 'maintenance' : 'inactive'} size="sm">
                      {bus.status}
                    </Badge>
                  </div>

                  {/* Model info */}
                  <div className="mt-3 text-xs text-slate-500">
                    <p className="truncate font-medium">{bus.model}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{bus.fuelType} • {bus.mileageKm.toLocaleString()} km</p>
                  </div>

                  {/* Route & Driver */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Users2 className="w-3.5 h-3.5" /> Driver:
                      </span>
                      <span className="font-bold text-slate-800 truncate max-w-[140px]">
                        {bus.assignedDriverName || 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5" /> Route:
                      </span>
                      <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                        {bus.assignedRouteName || 'Standby'}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <CapacityBar assigned={assignedCount} total={bus.capacity} />
                  </div>

                  {/* Telematics indicators */}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Radio className="w-3.5 h-3.5 text-emerald-600" /> GPS Live
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Video className="w-3.5 h-3.5 text-navy-600" /> CCTV Active
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => { setSelectedBus(bus); setIsViewModalOpen(true); }}
                    className="text-xs font-semibold text-navy-700 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Specs
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenMaintenance(bus)}
                      title="Log Fleet Maintenance"
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(bus)}
                      title="Edit Bus"
                      className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedBus(bus); setIsDeleteModalOpen(true); }}
                      title="Decommission Bus"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Bus Details</th>
                  <th className="py-3 px-4">Model & Fuel</th>
                  <th className="py-3 px-4">Capacity Utilization</th>
                  <th className="py-3 px-4">Assigned Driver</th>
                  <th className="py-3 px-4">Assigned Route</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Service</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBuses.map((bus) => {
                  const assignedCount = getAssignedCount(bus.id);
                  return (
                    <tr key={bus.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{bus.busNumber}</p>
                        <p className="text-[11px] font-mono text-slate-400">{bus.registrationNumber}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{bus.model}</p>
                        <p className="text-[11px] text-slate-400">{bus.fuelType}</p>
                      </td>
                      <td className="py-3 px-4 w-48">
                        <CapacityBar assigned={assignedCount} total={bus.capacity} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {bus.assignedDriverName || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 truncate max-w-[160px]">
                        {bus.assignedRouteName || 'None'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={bus.status === 'Active' ? 'active' : bus.status === 'Maintenance' ? 'maintenance' : 'inactive'} size="sm">
                          {bus.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {bus.lastMaintenanceDate || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedBus(bus); setIsViewModalOpen(true); }}
                            className="p-1.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenMaintenance(bus)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(bus)}
                            className="p-1.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedBus(bus); setIsDeleteModalOpen(true); }}
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
      )}

      {/* ADD / EDIT BUS MODAL */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? 'Add Fleet Vehicle' : `Edit ${selectedBus?.busNumber}`}
        subtitle="Manage vehicle technical specifications, capacity, and driver assignment"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={isAddModalOpen ? handleSubmitAdd : handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bus Number / Label *</label>
              <input
                type="text"
                value={formData.busNumber}
                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
              {formErrors.busNumber && <p className="text-[11px] text-rose-500 mt-1">{formErrors.busNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registration / Plate Number *</label>
              <input
                type="text"
                placeholder="e.g. DL-01-SB-2049"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
              {formErrors.registrationNumber && <p className="text-[11px] text-rose-500 mt-1">{formErrors.registrationNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bus Model & Manufacturer</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Capacity *</label>
                <input
                  type="number"
                  min="10"
                  max="80"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Driver</label>
              <select
                value={formData.assignedDriverId}
                onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">Unassigned</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.fullName} ({d.licenseNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Transit Route</label>
              <select
                value={formData.assignedRouteId}
                onChange={(e) => setFormData({ ...formData, assignedRouteId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">Unassigned (Standby)</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.routeName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Propulsion Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="Clean Diesel">Clean Diesel</option>
                <option value="Electric">Electric (EV)</option>
                <option value="CNG">Compressed Natural Gas (CNG)</option>
                <option value="Propane">Propane Autogas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Speed Governor Limit (km/h)</label>
              <input
                type="number"
                value={formData.speedLimitKmh}
                onChange={(e) => setFormData({ ...formData, speedLimitKmh: e.target.value })}
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
              {isAddModalOpen ? 'Save Bus to Fleet' : 'Update Specifications'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW BUS SPECS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Vehicle Dossier: ${selectedBus?.busNumber}`}
        subtitle="Detailed engineering telematics and safety compliance data"
        maxWidth="max-w-md"
      >
        {selectedBus && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-navy-900 text-base">{selectedBus.busNumber}</h4>
                  <p className="text-xs text-slate-500 font-mono">{selectedBus.registrationNumber}</p>
                </div>
                <Badge variant={selectedBus.status === 'Active' ? 'active' : selectedBus.status === 'Maintenance' ? 'maintenance' : 'inactive'} size="md">
                  {selectedBus.status}
                </Badge>
              </div>

              {/* Seating Capacity Visualizer */}
              <div className="pt-2">
                <CapacityBar assigned={getAssignedCount(selectedBus.id)} total={selectedBus.capacity} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Model</span>
                <span className="font-bold text-slate-800">{selectedBus.model}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fuel Type</span>
                <span className="font-bold text-slate-800">{selectedBus.fuelType}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Odometer</span>
                <span className="font-bold text-slate-800">{selectedBus.mileageKm?.toLocaleString()} km</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Speed Governor</span>
                <span className="font-bold text-slate-800">{selectedBus.speedLimitKmh || 45} km/h max</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Department Safety Inspection
              </span>
              <span className="font-bold">Next: {selectedBus.nextInspectionDate || '2026-11-15'}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-[#17365D] text-white rounded-xl text-xs font-bold hover:bg-navy-800"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* LOG MAINTENANCE MODAL */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title={`Log Maintenance: ${selectedBus?.busNumber}`}
        subtitle="Record servicing repair, parts replacement, and set workshop status"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitMaintenance} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service / Repair Operation *</label>
            <input
              type="text"
              value={maintenanceForm.serviceType}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceType: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                value={maintenanceForm.costUsd}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, costUsd: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Completion</label>
              <input
                type="date"
                value={maintenanceForm.completionDate}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, completionDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Workshop / Technician</label>
            <input
              type="text"
              value={maintenanceForm.technician}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, technician: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Notes</label>
            <textarea
              rows={3}
              value={maintenanceForm.notes}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            <strong>Note:</strong> Logging in-progress maintenance will automatically update this bus status to "Maintenance" and alert dispatch managers.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMaintenanceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
            >
              Dispatch to Maintenance
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE BUS DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedBus) deleteBus(selectedBus.id);
        }}
        title="Decommission Fleet Vehicle"
        message={`Are you sure you want to permanently remove ${selectedBus?.busNumber} (${selectedBus?.registrationNumber}) from active records?`}
      />
    </div>
  );
};
