import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialBuses,
  initialDrivers,
  initialRoutes,
  initialStops,
  initialStudents,
  initialSchedules,
  initialMaintenanceRecords,
  initialActivityLogs,
  initialSettings
} from '../data/mockData';

const TransitContext = createContext();

export const TransitProvider = ({ children }) => {
  // Load state from localStorage or initial dataset
  const [buses, setBuses] = useState(() => {
    const saved = localStorage.getItem('transit_buses');
    return saved ? JSON.parse(saved) : initialBuses;
  });

  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem('transit_drivers');
    return saved ? JSON.parse(saved) : initialDrivers;
  });

  const [routes, setRoutes] = useState(() => {
    const saved = localStorage.getItem('transit_routes');
    return saved ? JSON.parse(saved) : initialRoutes;
  });

  const [stops, setStops] = useState(() => {
    const saved = localStorage.getItem('transit_stops');
    return saved ? JSON.parse(saved) : initialStops;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('transit_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('transit_schedules');
    return saved ? JSON.parse(saved) : initialSchedules;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState(() => {
    const saved = localStorage.getItem('transit_maintenance');
    return saved ? JSON.parse(saved) : initialMaintenanceRecords;
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('transit_activity_logs');
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('transit_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Global Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Persist changes
  useEffect(() => { localStorage.setItem('transit_buses', JSON.stringify(buses)); }, [buses]);
  useEffect(() => { localStorage.setItem('transit_drivers', JSON.stringify(drivers)); }, [drivers]);
  useEffect(() => { localStorage.setItem('transit_routes', JSON.stringify(routes)); }, [routes]);
  useEffect(() => { localStorage.setItem('transit_stops', JSON.stringify(stops)); }, [stops]);
  useEffect(() => { localStorage.setItem('transit_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('transit_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('transit_maintenance', JSON.stringify(maintenanceRecords)); }, [maintenanceRecords]);
  useEffect(() => { localStorage.setItem('transit_activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem('transit_settings', JSON.stringify(settings)); }, [settings]);

  // Toast Dispatcher
  const showToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to add activity log
  const logActivity = (action, category = 'fleet', user = 'Administrator') => {
    const newLog = {
      id: `ACT-${Date.now()}`,
      user,
      action,
      time: 'Just now',
      category
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // ================= STUDENT CRUD =================
  const addStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: `STU-2026-${String(students.length + 1).padStart(3, '0')}`,
      registeredDate: new Date().toISOString().split('T')[0]
    };

    // If bus is assigned, check capacity
    if (newStudent.assignedBusId) {
      const bus = buses.find((b) => b.id === newStudent.assignedBusId);
      if (bus) {
        const currentCount = students.filter((s) => s.assignedBusId === bus.id).length;
        if (currentCount >= bus.capacity) {
          showToast(`Cannot assign: ${bus.busNumber} has reached its limit of ${bus.capacity} seats!`, 'error');
          return { success: false, error: 'Bus capacity exceeded' };
        }
      }
    }

    setStudents((prev) => [newStudent, ...prev]);
    logActivity(`Registered new student ${newStudent.fullName} (${newStudent.classGrade}-${newStudent.section})`, 'student');
    showToast(`Student ${newStudent.fullName} added successfully.`);
    return { success: true, data: newStudent };
  };

  const updateStudent = (id, updatedFields) => {
    // If changing assigned bus, check capacity
    if (updatedFields.assignedBusId) {
      const bus = buses.find((b) => b.id === updatedFields.assignedBusId);
      if (bus) {
        const currentCount = students.filter((s) => s.assignedBusId === bus.id && s.id !== id).length;
        if (currentCount >= bus.capacity) {
          showToast(`Cannot reassign: ${bus.busNumber} is at maximum capacity (${bus.capacity} seats)!`, 'error');
          return { success: false, error: 'Bus capacity exceeded' };
        }
      }
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    logActivity(`Updated record for student ${updatedFields.fullName || id}`, 'student');
    showToast('Student information updated successfully.');
    return { success: true };
  };

  const deleteStudent = (id) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    logActivity(`Deleted student record for ${student ? student.fullName : id}`, 'student');
    showToast('Student record removed.');
    return { success: true };
  };

  // ================= BUS CRUD =================
  const addBus = (busData) => {
    const newBus = {
      ...busData,
      id: `BUS-${100 + buses.length + 1}`,
      busNumber: busData.busNumber || `Bus ${100 + buses.length + 1}`,
      currentAssignedStudents: 0
    };
    setBuses((prev) => [...prev, newBus]);
    logActivity(`Added new fleet vehicle: ${newBus.busNumber} (${newBus.registrationNumber})`, 'fleet');
    showToast(`Bus ${newBus.busNumber} created successfully.`);
    return { success: true, data: newBus };
  };

  const updateBus = (id, updatedFields) => {
    // If driver is changing, check duplicate driver assignments
    if (updatedFields.assignedDriverId) {
      const conflictBus = buses.find(
        (b) => b.assignedDriverId === updatedFields.assignedDriverId && b.id !== id
      );
      if (conflictBus) {
        showToast(`Conflict: That driver is already assigned to ${conflictBus.busNumber}! Please reassign first.`, 'warning');
      }
    }

    setBuses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
    );
    logActivity(`Updated vehicle specs/status for bus ${id}`, 'fleet');
    showToast('Bus fleet record updated.');
    return { success: true };
  };

  const deleteBus = (id) => {
    const bus = buses.find((b) => b.id === id);
    const assignedStudentsCount = students.filter((s) => s.assignedBusId === id).length;
    if (assignedStudentsCount > 0) {
      showToast(`Cannot delete ${bus?.busNumber}: Has ${assignedStudentsCount} students currently assigned. Reassign them first.`, 'error');
      return { success: false, error: 'Students still assigned' };
    }
    setBuses((prev) => prev.filter((b) => b.id !== id));
    logActivity(`Decommissioned and deleted bus ${bus?.busNumber || id}`, 'fleet');
    showToast(`Bus ${bus?.busNumber || id} deleted.`);
    return { success: true };
  };

  // ================= DRIVER CRUD =================
  const addDriver = (driverData) => {
    const newDriver = {
      ...driverData,
      id: `DRV-${String(drivers.length + 1).padStart(3, '0')}`,
      safetyIncidents: 0,
      rating: 5.0
    };
    setDrivers((prev) => [...prev, newDriver]);
    logActivity(`Added certified driver ${newDriver.fullName} (Lic: ${newDriver.licenseNumber})`, 'compliance');
    showToast(`Driver ${newDriver.fullName} added.`);
    return { success: true, data: newDriver };
  };

  const updateDriver = (id, updatedFields) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d))
    );
    logActivity(`Updated credentials for driver ${id}`, 'compliance');
    showToast('Driver details updated.');
    return { success: true };
  };

  const deleteDriver = (id) => {
    const driver = drivers.find((d) => d.id === id);
    const assignedBus = buses.find((b) => b.assignedDriverId === id);
    if (assignedBus) {
      // Unlink driver from bus gracefully
      setBuses((prev) =>
        prev.map((b) =>
          b.id === assignedBus.id
            ? { ...b, assignedDriverId: null, assignedDriverName: 'Unassigned' }
            : b
        )
      );
    }
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    logActivity(`Removed driver record for ${driver?.fullName || id}`, 'compliance');
    showToast('Driver record deleted.');
    return { success: true };
  };

  // ================= ROUTE CRUD =================
  const addRoute = (routeData) => {
    const newRoute = {
      ...routeData,
      id: `RT-0${routes.length + 1}`,
      status: routeData.status || 'Active'
    };
    setRoutes((prev) => [...prev, newRoute]);
    logActivity(`Created transit corridor: ${newRoute.routeName}`, 'route');
    showToast(`Route ${newRoute.routeName} added.`);
    return { success: true, data: newRoute };
  };

  const updateRoute = (id, updatedFields) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    );
    logActivity(`Modified route itinerary for ${id}`, 'route');
    showToast('Route details updated.');
    return { success: true };
  };

  const deleteRoute = (id) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    logActivity(`Deleted route ${id}`, 'route');
    showToast('Route deleted.');
    return { success: true };
  };

  // ================= STOP CRUD =================
  const addStop = (stopData) => {
    const routeStops = stops.filter((s) => s.routeId === stopData.routeId);
    const newStop = {
      ...stopData,
      id: `STP-${Date.now().toString().slice(-4)}`,
      sequence: stopData.sequence || routeStops.length + 1,
      studentCount: 0
    };
    setStops((prev) => [...prev, newStop]);
    // Update route's totalStops count
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === stopData.routeId ? { ...r, totalStops: r.totalStops + 1 } : r
      )
    );
    logActivity(`Added stop '${newStop.stopName}' to ${newStop.routeName || newStop.routeId}`, 'route');
    showToast(`Stop '${newStop.stopName}' added.`);
    return { success: true, data: newStop };
  };

  const updateStop = (id, updatedFields) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    showToast('Stop details updated.');
    return { success: true };
  };

  const deleteStop = (id) => {
    const stopToDelete = stops.find((s) => s.id === id);
    if (stopToDelete) {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === stopToDelete.routeId
            ? { ...r, totalStops: Math.max(0, r.totalStops - 1) }
            : r
        )
      );
    }
    setStops((prev) => prev.filter((s) => s.id !== id));
    showToast('Stop deleted.');
    return { success: true };
  };

  const reorderStops = (routeId, reorderedStopsList) => {
    setStops((prev) => {
      const otherStops = prev.filter((s) => s.routeId !== routeId);
      const updatedRouteStops = reorderedStopsList.map((st, idx) => ({
        ...st,
        sequence: idx + 1
      }));
      return [...otherStops, ...updatedRouteStops];
    });
    showToast('Stops reordered successfully.');
  };

  // ================= SCHEDULE CRUD =================
  const addSchedule = (scheduleData) => {
    // Check conflicts: Is bus or driver already scheduled for same shift?
    const busConflict = schedules.find(
      (s) =>
        s.busId === scheduleData.busId &&
        s.shiftType === scheduleData.shiftType &&
        s.startTime === scheduleData.startTime
    );
    if (busConflict) {
      showToast(`Warning: ${scheduleData.busNumber} already has a ${scheduleData.shiftType} shift at ${scheduleData.startTime}!`, 'warning');
    }

    const newSchedule = {
      ...scheduleData,
      id: `SCH-${String(schedules.length + 1).padStart(3, '0')}`,
      status: 'Scheduled'
    };
    setSchedules((prev) => [...prev, newSchedule]);
    logActivity(`Created ${newSchedule.shiftType} schedule for ${newSchedule.routeName}`, 'fleet');
    showToast('Schedule created.');
    return { success: true, data: newSchedule };
  };

  const updateSchedule = (id, updatedFields) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    showToast('Schedule updated.');
    return { success: true };
  };

  const deleteSchedule = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    showToast('Schedule removed.');
    return { success: true };
  };

  // ================= ALLOCATION / ASSIGNMENTS =================
  const assignStudentToBusAndRoute = (studentId, busId, routeId, stopId) => {
    const student = students.find((s) => s.id === studentId);
    const bus = buses.find((b) => b.id === busId);
    const route = routes.find((r) => r.id === routeId);
    const stop = stops.find((s) => s.id === stopId);

    if (!student) return { success: false, error: 'Student not found' };

    // Capacity validation
    if (bus) {
      const assignedCount = students.filter(
        (s) => s.assignedBusId === busId && s.id !== studentId
      ).length;

      if (assignedCount >= bus.capacity) {
        showToast(`Assignment Rejected: ${bus.busNumber} is full (${assignedCount}/${bus.capacity} seats taken)!`, 'error');
        return { success: false, error: 'Bus capacity full' };
      }

      if (assignedCount + 1 >= Math.floor(bus.capacity * 0.9)) {
        showToast(`Heads up: ${bus.busNumber} will be at ${assignedCount + 1}/${bus.capacity} (${Math.round(((assignedCount + 1)/bus.capacity)*100)}%) capacity!`, 'warning');
      }
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            assignedBusId: bus ? bus.id : null,
            assignedBusNumber: bus ? bus.busNumber : 'Unassigned',
            assignedRouteId: route ? route.id : null,
            assignedRouteName: route ? route.routeName : 'Pending Allocation',
            pickupStopId: stop ? stop.id : null,
            pickupStopName: stop ? stop.stopName : 'Not Specified',
            status: bus ? 'Active' : 'Inactive'
          };
        }
        return s;
      })
    );

    logActivity(`Allocated student ${student.fullName} to ${bus ? bus.busNumber : 'Unassigned'}`, 'student');
    showToast(`Assigned ${student.fullName} to ${bus?.busNumber || 'bus'}.`);
    return { success: true };
  };

  // ================= MAINTENANCE LOGS =================
  const addMaintenanceRecord = (recordData) => {
    const newRecord = {
      ...recordData,
      id: `MNT-${Date.now().toString().slice(-4)}`,
      scheduledDate: recordData.scheduledDate || new Date().toISOString().split('T')[0]
    };
    setMaintenanceRecords((prev) => [newRecord, ...prev]);

    // Also update bus status to Maintenance if indicated
    if (newRecord.busId && newRecord.status === 'In Progress') {
      setBuses((prev) =>
        prev.map((b) =>
          b.id === newRecord.busId ? { ...b, status: 'Maintenance' } : b
        )
      );
    }
    showToast('Maintenance record logged.');
    return { success: true };
  };

  // Reset to initial sample data
  const resetToSampleData = () => {
    setBuses(initialBuses);
    setDrivers(initialDrivers);
    setRoutes(initialRoutes);
    setStops(initialStops);
    setStudents(initialStudents);
    setSchedules(initialSchedules);
    setMaintenanceRecords(initialMaintenanceRecords);
    setActivityLogs(initialActivityLogs);
    setSettings(initialSettings);
    showToast('Reset all database tables to sample prototype records!', 'info');
  };

  return (
    <TransitContext.Provider
      value={{
        buses,
        drivers,
        routes,
        stops,
        students,
        schedules,
        maintenanceRecords,
        activityLogs,
        settings,
        setSettings,
        toasts,
        showToast,
        removeToast,
        // CRUD handlers
        addStudent,
        updateStudent,
        deleteStudent,
        addBus,
        updateBus,
        deleteBus,
        addDriver,
        updateDriver,
        deleteDriver,
        addRoute,
        updateRoute,
        deleteRoute,
        addStop,
        updateStop,
        deleteStop,
        reorderStops,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        assignStudentToBusAndRoute,
        addMaintenanceRecord,
        resetToSampleData,
        logActivity
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = () => useContext(TransitContext);
