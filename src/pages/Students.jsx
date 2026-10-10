import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Bus,
  MapPin,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  QrCode,
  ShieldAlert
} from 'lucide-react';

export const Students = () => {
  const { students, buses, routes, stops, addStudent, updateStudent, deleteStudent, showToast } = useTransit();
  const { hasPermission } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedRoute, setSelectedRoute] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form State
  const initialForm = {
    fullName: '',
    classGrade: 'Grade 6',
    section: 'A',
    parentName: '',
    contactNumber: '',
    email: '',
    assignedBusId: '',
    assignedRouteId: '',
    pickupStopId: '',
    status: 'Active',
    seatNumber: '',
    emergencyContact: '',
    bloodGroup: 'O+',
    allergies: 'None'
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Filter logic
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'All' || s.classGrade === selectedClass;
    const matchesRoute = selectedRoute === 'All' || s.assignedRouteId === selectedRoute;
    const matchesStatus =
      selectedStatus === 'All'
        ? true
        : selectedStatus === 'Assigned'
        ? !!s.assignedBusId
        : selectedStatus === 'Unassigned'
        ? !s.assignedBusId
        : s.status === selectedStatus;

    return matchesSearch && matchesClass && matchesRoute && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Available classes
  const classesList = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Student full name is required.';
    if (!formData.parentName.trim()) errors.parentName = 'Parent or guardian name is required.';
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Guardian contact number is required.';
    } else if (!/^[0-9+() -]{7,20}$/.test(formData.contactNumber)) {
      errors.contactNumber = 'Enter a valid telephone format.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    if (!hasPermission('create')) {
      showToast('Action restricted: Read-only Viewer role cannot add student records.', 'warning');
      return;
    }
    setFormData(initialForm);
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    if (!hasPermission('edit')) {
      showToast('Action restricted: Read-only Viewer role cannot edit records.', 'warning');
      return;
    }
    setSelectedStudent(student);
    setFormData({
      fullName: student.fullName,
      classGrade: student.classGrade,
      section: student.section,
      parentName: student.parentName,
      contactNumber: student.contactNumber,
      email: student.email || '',
      assignedBusId: student.assignedBusId || '',
      assignedRouteId: student.assignedRouteId || '',
      pickupStopId: student.pickupStopId || '',
      status: student.status || 'Active',
      seatNumber: student.seatNumber || '',
      emergencyContact: student.emergencyContact || '',
      bloodGroup: student.bloodGroup || 'O+',
      allergies: student.allergies || 'None'
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (student) => {
    if (!hasPermission('delete')) {
      showToast('Action restricted: Read-only Viewer role cannot delete records.', 'warning');
      return;
    }
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleOpenView = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const bus = buses.find(b => b.id === formData.assignedBusId);
    const route = routes.find(r => r.id === formData.assignedRouteId);
    const stop = stops.find(s => s.id === formData.pickupStopId);

    const result = addStudent({
      ...formData,
      assignedBusNumber: bus ? bus.busNumber : 'Unassigned',
      assignedRouteName: route ? route.routeName : 'Pending Allocation',
      pickupStopName: stop ? stop.stopName : 'Not Specified'
    });

    if (result.success) {
      setIsAddModalOpen(false);
    }
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const bus = buses.find(b => b.id === formData.assignedBusId);
    const route = routes.find(r => r.id === formData.assignedRouteId);
    const stop = stops.find(s => s.id === formData.pickupStopId);

    const result = updateStudent(selectedStudent.id, {
      ...formData,
      assignedBusNumber: bus ? bus.busNumber : 'Unassigned',
      assignedRouteName: route ? route.routeName : 'Pending Allocation',
      pickupStopName: stop ? stop.stopName : 'Not Specified'
    });

    if (result.success) {
      setIsEditModalOpen(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Full Name', 'Class', 'Section', 'Parent Name', 'Contact Number', 'Bus', 'Route', 'Pickup Stop', 'Status'];
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.fullName}"`,
      s.classGrade,
      s.section,
      `"${s.parentName}"`,
      s.contactNumber,
      s.assignedBusNumber || 'Unassigned',
      `"${s.assignedRouteName || 'None'}"`,
      `"${s.pickupStopName || 'None'}"`,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oakridge_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredStudents.length} student records to CSV.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Student Transportation Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student registrations, bus stops, routes, and transportation allocations
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
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#17365D] hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#FFC928]" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ID, or parent..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 transition-all font-medium text-slate-700"
            >
              <option value="All">All Grades & Classes</option>
              {classesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Route Filter */}
          <div>
            <select
              value={selectedRoute}
              onChange={(e) => { setSelectedRoute(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 transition-all font-medium text-slate-700"
            >
              <option value="All">All Assigned Routes</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.routeName}</option>)}
            </select>
          </div>

          {/* Assignment Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 transition-all font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned to Bus</option>
              <option value="Unassigned">Unassigned (Pending)</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredStudents.length}</strong> student records</span>
          {(searchTerm || selectedClass !== 'All' || selectedRoute !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedClass('All'); setSelectedRoute('All'); setSelectedStatus('All'); }}
              className="text-navy-700 font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Grade & Section</th>
                <th className="py-3 px-4">Guardian & Contact</th>
                <th className="py-3 px-4">Assigned Bus</th>
                <th className="py-3 px-4">Route & Stop</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No student records match the criteria</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your filters or search keywords</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-50 text-navy-800 font-bold border border-navy-100 flex items-center justify-center shrink-0">
                          {stu.fullName.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-navy-700 transition-colors">
                            {stu.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{stu.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{stu.classGrade}</span>
                      <span className="ml-1 text-slate-500 font-normal">Section {stu.section}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{stu.parentName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {stu.contactNumber}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {stu.assignedBusId ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-bold text-navy-900">{stu.assignedBusNumber}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <p className="font-semibold text-slate-800 truncate">{stu.assignedRouteName || 'None'}</p>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {stu.pickupStopName || 'Not Set'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={stu.status === 'Active' ? 'active' : 'inactive'} size="sm">
                        {stu.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(stu)}
                          title="View Student Pass & Details"
                          className="p-1.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(stu)}
                          title="Edit Student Record"
                          className="p-1.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(stu)}
                          title="Delete Student"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student to Transit System"
        subtitle="Register student credentials, guardian contact, and assign transportation"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Liam Anderson"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${formErrors.fullName ? 'border-rose-400' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-navy-600`}
              />
              {formErrors.fullName && <p className="text-[11px] text-rose-500 mt-1">{formErrors.fullName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Class *</label>
                <select
                  value={formData.classGrade}
                  onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
                >
                  {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                  <option value="D">Sec D</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                placeholder="e.g. Jonathan Anderson"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${formErrors.parentName ? 'border-rose-400' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-navy-600`}
              />
              {formErrors.parentName && <p className="text-[11px] text-rose-500 mt-1">{formErrors.parentName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Contact Phone *</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${formErrors.contactNumber ? 'border-rose-400' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-navy-600`}
              />
              {formErrors.contactNumber && <p className="text-[11px] text-rose-500 mt-1">{formErrors.contactNumber}</p>}
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2" />
          <p className="text-xs font-bold text-navy-800">Transportation Allocation (Optional during registration)</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assign Bus</label>
              <select
                value={formData.assignedBusId}
                onChange={(e) => setFormData({ ...formData, assignedBusId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">Leave Unassigned</option>
                {buses.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.busNumber} ({b.capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assign Route</label>
              <select
                value={formData.assignedRouteId}
                onChange={(e) => setFormData({ ...formData, assignedRouteId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">Select Route</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pickup Stop</label>
              <select
                value={formData.pickupStopId}
                onChange={(e) => setFormData({ ...formData, pickupStopId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">Select Stop</option>
                {stops
                  .filter(s => !formData.assignedRouteId || s.routeId === formData.assignedRouteId)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.stopName} ({s.pickupTime})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Seat Number</label>
              <input
                type="text"
                placeholder="e.g. 14B"
                value={formData.seatNumber}
                onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Medical / Allergies</label>
              <input
                type="text"
                placeholder="e.g. Asthma, Peanuts"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#17365D] hover:bg-navy-800 rounded-xl shadow-sm transition-colors"
            >
              Register Student
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student: ${selectedStudent?.fullName}`}
        subtitle="Update academic details, transportation route, and emergency information"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${formErrors.fullName ? 'border-rose-400' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-navy-600`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Class *</label>
                <select
                  value={formData.classGrade}
                  onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
                >
                  {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                  <option value="D">Sec D</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${formErrors.parentName ? 'border-rose-400' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-navy-600`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Contact Phone *</label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${formErrors.contactNumber ? 'border-rose-400' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-navy-600`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Bus</label>
              <select
                value={formData.assignedBusId}
                onChange={(e) => setFormData({ ...formData, assignedBusId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">None (Unassigned)</option>
                {buses.map(b => (
                  <option key={b.id} value={b.id}>{b.busNumber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Route</label>
              <select
                value={formData.assignedRouteId}
                onChange={(e) => setFormData({ ...formData, assignedRouteId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">None</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.routeName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pickup Stop</label>
              <select
                value={formData.pickupStopId}
                onChange={(e) => setFormData({ ...formData, pickupStopId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="">None</option>
                {stops.map(s => (
                  <option key={s.id} value={s.id}>{s.stopName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#17365D] hover:bg-navy-800 rounded-xl shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW STUDENT DETAILS MODAL (Digital Student Transit Pass) */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Student Transportation Pass"
        subtitle="Digital boarding credential & emergency safety card"
        maxWidth="max-w-md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            {/* Student ID Card Simulation */}
            <div className="bg-gradient-to-br from-navy-800 to-navy-950 text-white rounded-2xl p-5 shadow-lg border border-navy-700 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#FFC928] flex items-center justify-center font-bold text-navy-950 text-xs">
                    <Bus className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-white">Oakridge Transit Pass</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FFC928] text-navy-950">
                  {selectedStudent.status}
                </span>
              </div>

              <div className="flex items-center gap-4 my-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-[#FFC928] flex items-center justify-center font-black text-xl text-[#FFC928] shrink-0">
                  {selectedStudent.fullName.slice(0, 1)}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white leading-tight">{selectedStudent.fullName}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 font-mono">{selectedStudent.id}</p>
                  <p className="text-xs text-[#FFC928] font-semibold mt-0.5">
                    {selectedStudent.classGrade} - Section {selectedStudent.section}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/5 rounded-xl p-3 border border-white/10">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Bus Unit</span>
                  <span className="font-bold text-white">{selectedStudent.assignedBusNumber || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Assigned Seat</span>
                  <span className="font-bold text-[#FFC928]">{selectedStudent.seatNumber || 'Free Seating'}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Pickup & Drop Station</span>
                  <span className="font-semibold text-slate-200 truncate block">{selectedStudent.pickupStopName || 'Not Set'}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
                <span>Emergency: {selectedStudent.contactNumber}</span>
                <span>Blood: {selectedStudent.bloodGroup || 'O+'}</span>
              </div>
            </div>

            {/* Medical / Safety Info */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Guardian Name:</span>
                <span className="font-bold text-slate-800">{selectedStudent.parentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Medical Notes:</span>
                <span className="font-semibold text-rose-600">{selectedStudent.allergies || 'None declared'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route Corridor:</span>
                <span className="font-medium text-slate-800">{selectedStudent.assignedRouteName || 'None'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-[#17365D] text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedStudent) deleteStudent(selectedStudent.id);
        }}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete the transport record for ${selectedStudent?.fullName} (${selectedStudent?.id})? This will release their assigned bus seat.`}
      />
    </div>
  );
};
