import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Navigation,
  MapPin,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Clock,
  Bus,
  Users2,
  ArrowRight,
  MoveUp,
  MoveDown,
  Layers,
  Map,
  Compass,
  School,
  CheckCircle2,
  Route as RouteIcon
} from 'lucide-react';

export const RoutesAndStops = () => {
  const { routes, stops, buses, drivers, addRoute, updateRoute, deleteRoute, addStop, updateStop, deleteStop, reorderStops, showToast } = useTransit();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'stops' | 'visualizer'
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || 'RT-01');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [isEditStopModalOpen, setIsEditStopModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, item: null });

  // Selected for edits
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);

  // Forms
  const [routeForm, setRouteForm] = useState({
    routeName: '',
    startingPoint: '',
    destination: 'Oakridge International Main Campus',
    estimatedDuration: '40 mins',
    distanceKm: 18,
    assignedBusId: '',
    assignedDriverId: '',
    morningStartTime: '07:05 AM',
    afternoonStartTime: '03:15 PM',
    status: 'Active'
  });

  const [stopForm, setStopForm] = useState({
    stopName: '',
    address: '',
    routeId: '',
    pickupTime: '07:15 AM',
    dropoffTime: '03:40 PM',
    sequence: 1,
    landmark: ''
  });

  const currentRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const currentRouteStops = stops
    .filter(s => s.routeId === selectedRouteId)
    .sort((a, b) => a.sequence - b.sequence);

  // Handlers for Route
  const handleOpenAddRoute = () => {
    if (!hasPermission('create')) {
      showToast('Action restricted: Read-only Viewer cannot create routes.', 'warning');
      return;
    }
    setRouteForm({
      routeName: `Route ${routes.length + 1} - Suburban Corridor`,
      startingPoint: 'Central Metro Plaza',
      destination: 'Oakridge International Main Campus',
      estimatedDuration: '45 mins',
      distanceKm: 19.5,
      assignedBusId: '',
      assignedDriverId: '',
      morningStartTime: '07:05 AM',
      afternoonStartTime: '03:15 PM',
      status: 'Active'
    });
    setIsAddRouteModalOpen(true);
  };

  const handleOpenEditRoute = (route) => {
    if (!hasPermission('edit')) {
      showToast('Action restricted: Read-only Viewer cannot edit routes.', 'warning');
      return;
    }
    setSelectedRoute(route);
    setRouteForm({
      routeName: route.routeName,
      startingPoint: route.startingPoint,
      destination: route.destination,
      estimatedDuration: route.estimatedDuration,
      distanceKm: route.distanceKm || 15,
      assignedBusId: route.assignedBusId || '',
      assignedDriverId: route.assignedDriverId || '',
      morningStartTime: route.morningStartTime || '07:05 AM',
      afternoonStartTime: route.afternoonStartTime || '03:15 PM',
      status: route.status
    });
    setIsEditRouteModalOpen(true);
  };

  const handleSubmitAddRoute = (e) => {
    e.preventDefault();
    const bus = buses.find(b => b.id === routeForm.assignedBusId);
    const driver = drivers.find(d => d.id === routeForm.assignedDriverId);

    const result = addRoute({
      ...routeForm,
      totalStops: 0,
      assignedBusNumber: bus ? bus.busNumber : 'Unassigned',
      assignedDriverName: driver ? driver.fullName : 'Unassigned'
    });
    if (result.success) setIsAddRouteModalOpen(false);
  };

  const handleSubmitEditRoute = (e) => {
    e.preventDefault();
    const bus = buses.find(b => b.id === routeForm.assignedBusId);
    const driver = drivers.find(d => d.id === routeForm.assignedDriverId);

    const result = updateRoute(selectedRoute.id, {
      ...routeForm,
      assignedBusNumber: bus ? bus.busNumber : 'Unassigned',
      assignedDriverName: driver ? driver.fullName : 'Unassigned'
    });
    if (result.success) setIsEditRouteModalOpen(false);
  };

  // Handlers for Stop
  const handleOpenAddStop = () => {
    if (!hasPermission('create')) {
      showToast('Action restricted: Read-only Viewer cannot add stops.', 'warning');
      return;
    }
    setStopForm({
      stopName: '',
      address: '',
      routeId: selectedRouteId,
      pickupTime: '07:20 AM',
      dropoffTime: '03:35 PM',
      sequence: currentRouteStops.length + 1,
      landmark: ''
    });
    setIsAddStopModalOpen(true);
  };

  const handleOpenEditStop = (stop) => {
    if (!hasPermission('edit')) {
      showToast('Action restricted: Read-only Viewer cannot edit stops.', 'warning');
      return;
    }
    setSelectedStop(stop);
    setStopForm({
      stopName: stop.stopName,
      address: stop.address,
      routeId: stop.routeId,
      pickupTime: stop.pickupTime,
      dropoffTime: stop.dropoffTime,
      sequence: stop.sequence,
      landmark: stop.landmark || ''
    });
    setIsEditStopModalOpen(true);
  };

  const handleSubmitAddStop = (e) => {
    e.preventDefault();
    const route = routes.find(r => r.id === stopForm.routeId);
    const result = addStop({
      ...stopForm,
      routeName: route ? route.routeName : 'Route'
    });
    if (result.success) setIsAddStopModalOpen(false);
  };

  const handleSubmitEditStop = (e) => {
    e.preventDefault();
    const route = routes.find(r => r.id === stopForm.routeId);
    const result = updateStop(selectedStop.id, {
      ...stopForm,
      routeName: route ? route.routeName : 'Route'
    });
    if (result.success) setIsEditStopModalOpen(false);
  };

  // Stop sequence reorder
  const handleMoveStop = (index, direction) => {
    if (!hasPermission('edit')) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentRouteStops.length) return;

    const updated = [...currentRouteStops];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    reorderStops(selectedRouteId, updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Routes, Stops & Transit Visualizer</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Define transit service corridors, geocoded stops, and map-style visual sequences
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-0.5 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'routes' ? 'bg-[#17365D] text-white shadow-2xs' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <RouteIcon className="w-4 h-4" />
            <span>Routes ({routes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('stops')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'stops' ? 'bg-[#17365D] text-white shadow-2xs' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Stops Master ({stops.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'visualizer' ? 'bg-[#17365D] text-white shadow-2xs' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Map className="w-4 h-4 text-[#FFC928]" />
            <span>Map & Sequence View</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ROUTES MANAGEMENT ================= */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
            <button
              onClick={handleOpenAddRoute}
              className="px-4 py-2 bg-[#17365D] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-navy-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#FFC928]" />
              <span>Create Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {routes
              .filter(r => r.routeName.toLowerCase().includes(searchTerm.toLowerCase()) || r.startingPoint.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((route) => (
                <div
                  key={route.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                          <Navigation className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-navy-900">{route.routeName}</h3>
                          <p className="text-[11px] font-mono text-slate-400">{route.id} • {route.estimatedDuration}</p>
                        </div>
                      </div>
                      <Badge variant={route.status === 'Active' ? 'active' : 'inactive'} size="sm">
                        {route.status}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Origin</span>
                          <span className="font-medium text-slate-800">{route.startingPoint}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#17365D] mt-1.5 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Destination</span>
                          <span className="font-medium text-slate-800">{route.destination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-400 block text-[10px]">Assigned Bus</span>
                        <span className="font-bold text-navy-900">{route.assignedBusNumber || 'Unassigned'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50">
                        <span className="text-slate-400 block text-[10px]">Assigned Driver</span>
                        <span className="font-bold text-slate-800 truncate block">{route.assignedDriverName || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => { setSelectedRouteId(route.id); setActiveTab('visualizer'); }}
                      className="font-bold text-navy-700 hover:underline flex items-center gap-1"
                    >
                      <Map className="w-3.5 h-3.5" /> View Map Sequence →
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRoute(route)}
                        className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setDeleteTarget({ type: 'route', item: route }); setIsDeleteModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: STOPS MASTER DIRECTORY ================= */}
      {activeTab === 'stops' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Filter by Route:</span>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-navy-900"
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.routeName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddStop}
              className="px-4 py-2 bg-[#17365D] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-navy-800 transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 text-[#FFC928]" />
              <span>Add Stop to Route</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4 w-16">Seq</th>
                    <th className="py-3 px-4">Stop Name & Landmark</th>
                    <th className="py-3 px-4">Street Address</th>
                    <th className="py-3 px-4">Morning Pickup</th>
                    <th className="py-3 px-4">Afternoon Drop-off</th>
                    <th className="py-3 px-4">Boarding Students</th>
                    <th className="py-3 px-4 text-center">Reorder</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRouteStops.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        No stops configured for this route yet. Click "Add Stop to Route" above.
                      </td>
                    </tr>
                  ) : (
                    currentRouteStops.map((stop, idx) => (
                      <tr key={stop.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-black text-navy-900 font-mono">
                          #{stop.sequence}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{stop.stopName}</p>
                          <p className="text-[11px] text-slate-400">{stop.landmark || 'No landmark specified'}</p>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {stop.address}
                        </td>
                        <td className="py-3 px-4 font-bold text-navy-800">
                          {stop.pickupTime}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {stop.dropoffTime}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                            {stop.studentCount || 0} students
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleMoveStop(idx, -1)}
                              disabled={idx === 0}
                              title="Move Up in Sequence"
                              className="p-1 text-slate-400 hover:text-navy-700 disabled:opacity-20"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveStop(idx, 1)}
                              disabled={idx === currentRouteStops.length - 1}
                              title="Move Down in Sequence"
                              className="p-1 text-slate-400 hover:text-navy-700 disabled:opacity-20"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditStop(stop)}
                              className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setDeleteTarget({ type: 'stop', item: stop }); setIsDeleteModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: VISUAL SEQUENCE & MAP PREVIEW ================= */}
      {activeTab === 'visualizer' && (
        <div className="space-y-6">
          {/* Corridor Selector bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-navy-900">Active Corridor Preview:</span>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-navy-800"
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.routeName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Duration: <strong>{currentRoute?.estimatedDuration}</strong></span>
              <span>Total Distance: <strong>{currentRoute?.distanceKm} km</strong></span>
              <span>Dispatched Bus: <strong className="text-navy-900">{currentRoute?.assignedBusNumber}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Route Sequence Timeline */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-navy-700" />
                  Route Transit Waypoint Sequence
                </h3>
                <Badge variant="bus" size="sm">{currentRouteStops.length} Stops</Badge>
              </div>

              {/* Step-by-step timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-navy-200">
                {/* Depot / Start */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-navy-800 border-2 border-white flex items-center justify-center text-white text-[10px]">
                    <Bus className="w-3 h-3 text-[#FFC928]" />
                  </span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] uppercase font-bold text-navy-800">Departure Depot</span>
                    <p className="font-bold text-slate-900">{currentRoute?.startingPoint}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Dispatched at {currentRoute?.morningStartTime}</p>
                  </div>
                </div>

                {/* Individual stops */}
                {currentRouteStops.map((st, i) => (
                  <div key={st.id} className="relative">
                    <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-[#17365D] flex items-center justify-center text-navy-900 font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 hover:border-navy-300 transition-colors shadow-2xs text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{st.stopName}</span>
                        <span className="text-navy-900 font-bold font-mono text-[11px] bg-bus-100 px-1.5 py-0.5 rounded">
                          {st.pickupTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{st.address}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Drop-off: {st.dropoffTime}</span>
                        <span className="font-semibold text-slate-700">{st.studentCount} boarding students</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Destination: Oakridge Campus */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white text-[10px]">
                    <School className="w-3 h-3 text-white" />
                  </span>
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-800">Final Arrival Destination</span>
                    <p className="font-bold text-emerald-950">{currentRoute?.destination}</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Target Campus Arrival: 07:50 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive SVG Transit Map Preview Canvas */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                    <Map className="w-4 h-4 text-navy-700" />
                    Interactive Transit Route Map Preview
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    GPS Telematics Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vector schematic visualization of bus transit corridor and geofenced checkpoints
                </p>
              </div>

              {/* Stylized SVG Map */}
              <div className="relative w-full h-84 bg-[#EAF0F6] rounded-2xl overflow-hidden border border-slate-200/80 p-4 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 600 320">
                  {/* Background grid representing city blocks */}
                  <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <rect width="40" height="40" fill="#EAF0F6" />
                    <rect x="0" y="0" width="38" height="38" fill="#F4F7FA" rx="4" />
                  </pattern>
                  <rect width="600" height="320" fill="url(#cityGrid)" />

                  {/* Water feature / River simulation */}
                  <path
                    d="M 0,260 Q 150,220 300,280 T 600,240 L 600,320 L 0,320 Z"
                    fill="#D0E3F3"
                    opacity="0.7"
                  />
                  <text x="520" y="295" fontSize="11" fill="#7199BD" fontWeight="bold">Lakeview Basin</text>

                  {/* Highway road vectors */}
                  <path
                    d="M 50,40 Q 180,80 260,180 T 520,220"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 50,40 Q 180,80 260,180 T 520,220"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />

                  {/* Active Bus Route Path (Brand Navy & Yellow Accent) */}
                  <path
                    id="routePath"
                    d="M 70,60 C 140,70 190,130 240,140 C 290,150 350,110 410,130 C 470,150 490,190 530,200"
                    fill="none"
                    stroke="#17365D"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="6 3"
                  />

                  {/* Waypoint Markers */}
                  {/* Origin */}
                  <g transform="translate(70, 60)">
                    <circle r="9" fill="#17365D" />
                    <circle r="4" fill="#FFC928" />
                    <text x="12" y="4" fontSize="10" fontWeight="bold" fill="#17365D">Depot / Start</text>
                  </g>

                  {/* Stops */}
                  <g transform="translate(190, 120)">
                    <circle r="7" fill="#FFC928" stroke="#17365D" strokeWidth="2" />
                    <text x="10" y="4" fontSize="9" fontWeight="bold" fill="#334E68">Stop #1</text>
                  </g>

                  <g transform="translate(290, 145)">
                    <circle r="7" fill="#FFC928" stroke="#17365D" strokeWidth="2" />
                    <text x="10" y="-3" fontSize="9" fontWeight="bold" fill="#334E68">Stop #2</text>
                  </g>

                  <g transform="translate(410, 130)">
                    <circle r="7" fill="#FFC928" stroke="#17365D" strokeWidth="2" />
                    <text x="10" y="4" fontSize="9" fontWeight="bold" fill="#334E68">Stop #3</text>
                  </g>

                  {/* School Main Campus Destination */}
                  <g transform="translate(530, 200)">
                    <rect x="-14" y="-14" width="28" height="28" rx="7" fill="#10B981" />
                    <circle r="4" fill="#FFFFFF" />
                    <text x="-40" y="24" fontSize="11" fontWeight="bold" fill="#047857">Oakridge Campus</text>
                  </g>

                  {/* Moving / Current Bus Marker */}
                  <g transform="translate(350, 125)">
                    <circle r="14" fill="#FFC928" opacity="0.4">
                      <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <rect x="-10" y="-8" width="20" height="16" rx="4" fill="#FFC928" stroke="#17365D" strokeWidth="2" />
                    <text x="0" y="3" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#17365D">BUS</text>
                  </g>
                </svg>

                {/* Overlay live speed badge */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-slate-200 text-[11px] shadow-sm space-y-0.5">
                  <p className="font-bold text-navy-900">{currentRoute?.assignedBusNumber} En Route</p>
                  <p className="text-slate-500">Current Speed: 38 km/h • Next Stop in 4 min</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-600 font-medium">
                  Corridor Driver: <strong>{currentRoute?.assignedDriverName}</strong>
                </span>
                <span className="text-navy-700 font-semibold">
                  Departure Time: {currentRoute?.morningStartTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROUTE MODAL */}
      <Modal
        isOpen={isAddRouteModalOpen || isEditRouteModalOpen}
        onClose={() => { setIsAddRouteModalOpen(false); setIsEditRouteModalOpen(false); }}
        title={isAddRouteModalOpen ? 'Create Transit Route' : `Edit ${selectedRoute?.routeName}`}
        subtitle="Specify corridor origin, campus destination, scheduled timings, and assigned fleet"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={isAddRouteModalOpen ? handleSubmitAddRoute : handleSubmitEditRoute} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Route Name *</label>
              <input
                type="text"
                value={routeForm.routeName}
                onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Starting Point *</label>
              <input
                type="text"
                value={routeForm.startingPoint}
                onChange={(e) => setRouteForm({ ...routeForm, startingPoint: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Destination Campus *</label>
              <input
                type="text"
                value={routeForm.destination}
                onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={routeForm.estimatedDuration}
                onChange={(e) => setRouteForm({ ...routeForm, estimatedDuration: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corridor Distance (km)</label>
              <input
                type="number"
                value={routeForm.distanceKm}
                onChange={(e) => setRouteForm({ ...routeForm, distanceKm: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Bus</label>
              <select
                value={routeForm.assignedBusId}
                onChange={(e) => setRouteForm({ ...routeForm, assignedBusId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">Unassigned</option>
                {buses.map(b => (
                  <option key={b.id} value={b.id}>{b.busNumber} ({b.capacity} seats)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Driver</label>
              <select
                value={routeForm.assignedDriverId}
                onChange={(e) => setRouteForm({ ...routeForm, assignedDriverId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">Unassigned</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setIsAddRouteModalOpen(false); setIsEditRouteModalOpen(false); }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#17365D] hover:bg-navy-800 rounded-xl shadow-sm"
            >
              {isAddRouteModalOpen ? 'Create Route' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD / EDIT STOP MODAL */}
      <Modal
        isOpen={isAddStopModalOpen || isEditStopModalOpen}
        onClose={() => { setIsAddStopModalOpen(false); setIsEditStopModalOpen(false); }}
        title={isAddStopModalOpen ? 'Add Bus Stop' : `Edit Stop: ${selectedStop?.stopName}`}
        subtitle="Configure stop location, morning pickup and afternoon drop timings"
        maxWidth="max-w-md"
      >
        <form onSubmit={isAddStopModalOpen ? handleSubmitAddStop : handleSubmitEditStop} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Stop Name *</label>
            <input
              type="text"
              placeholder="e.g. Greenwood Square"
              value={stopForm.stopName}
              onChange={(e) => setStopForm({ ...stopForm, stopName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address / Street *</label>
            <input
              type="text"
              placeholder="e.g. 102 Greenwood Blvd"
              value={stopForm.address}
              onChange={(e) => setStopForm({ ...stopForm, address: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Prominent Landmark</label>
            <input
              type="text"
              placeholder="e.g. Next to City Library"
              value={stopForm.landmark}
              onChange={(e) => setStopForm({ ...stopForm, landmark: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Morning Pickup</label>
              <input
                type="text"
                placeholder="07:15 AM"
                value={stopForm.pickupTime}
                onChange={(e) => setStopForm({ ...stopForm, pickupTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Afternoon Drop-off</label>
              <input
                type="text"
                placeholder="03:40 PM"
                value={stopForm.dropoffTime}
                onChange={(e) => setStopForm({ ...stopForm, dropoffTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setIsAddStopModalOpen(false); setIsEditStopModalOpen(false); }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#17365D] hover:bg-navy-800 rounded-xl shadow-sm"
            >
              {isAddStopModalOpen ? 'Add Stop' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (deleteTarget.type === 'route' && deleteTarget.item) {
            deleteRoute(deleteTarget.item.id);
          } else if (deleteTarget.type === 'stop' && deleteTarget.item) {
            deleteStop(deleteTarget.item.id);
          }
        }}
        title={`Delete ${deleteTarget.type === 'route' ? 'Route' : 'Stop'}`}
        message={`Are you sure you want to permanently remove this ${deleteTarget.type}? Associated scheduled stops and student links will be updated.`}
      />
    </div>
  );
};
