import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Fallback State (Ensures instant out-of-the-box prototype execution without local Mongo installation required)
let students = [
  { id: 'STU-2026-001', fullName: 'Emma Thompson', classGrade: 'Grade 6', section: 'A', parentName: 'David Thompson', contactNumber: '+1 (555) 301-8841', assignedBusId: 'BUS-101', assignedBusNumber: 'Bus 101', assignedRouteId: 'RT-01', assignedRouteName: 'Route 1 - North Hills Express', pickupStopName: 'Silver Oaks Junction', status: 'Active' },
  { id: 'STU-2026-002', fullName: 'Lucas Harrison', classGrade: 'Grade 8', section: 'B', parentName: 'Sarah Harrison', contactNumber: '+1 (555) 412-9902', assignedBusId: 'BUS-101', assignedBusNumber: 'Bus 101', assignedRouteId: 'RT-01', assignedRouteName: 'Route 1 - North Hills Express', pickupStopName: 'Oakridge Gardens Gate 2', status: 'Active' },
  { id: 'STU-2026-003', fullName: 'Sophia Martinez', classGrade: 'Grade 5', section: 'C', parentName: 'Carlos Martinez', contactNumber: '+1 (555) 523-1123', assignedBusId: 'BUS-102', assignedBusNumber: 'Bus 102', assignedRouteId: 'RT-02', assignedRouteName: 'Route 2 - Westside Boulevard', pickupStopName: 'Highland Heights Square', status: 'Active' }
];

let buses = [
  { id: 'BUS-101', busNumber: 'Bus 101', registrationNumber: 'DL-01-SB-2041', model: 'Blue Bird All American RE', capacity: 48, assignedDriverName: 'Robert Miller', assignedRouteName: 'Route 1 - North Hills Express', status: 'Active' },
  { id: 'BUS-102', busNumber: 'Bus 102', registrationNumber: 'DL-01-SB-2042', model: 'Thomas Saf-T-Liner C2', capacity: 42, assignedDriverName: 'Samuel Jackson', assignedRouteName: 'Route 2 - Westside Boulevard', status: 'Active' },
  { id: 'BUS-105', busNumber: 'Bus 105', registrationNumber: 'DL-01-SB-2045', model: 'Blue Bird Vision Propane', capacity: 48, assignedDriverName: "James O'Connor", assignedRouteName: 'Route 5 - Metro East Connector', status: 'Maintenance' }
];

let drivers = [
  { id: 'DRV-001', fullName: 'Robert Miller', phoneNumber: '+1 (555) 234-8901', licenseNumber: 'CDL-NY-8492041', licenseExpiryDate: '2027-08-14', assignedBusNumber: 'Bus 101', employmentStatus: 'Full-time', rating: 4.9 },
  { id: 'DRV-002', fullName: 'Samuel Jackson', phoneNumber: '+1 (555) 345-6712', licenseNumber: 'CDL-NY-9182374', licenseExpiryDate: '2026-10-25', assignedBusNumber: 'Bus 102', employmentStatus: 'Full-time', rating: 4.8 }
];

let routes = [
  { id: 'RT-01', routeName: 'Route 1 - North Hills Express', startingPoint: 'Silver Oaks Junction', destination: 'Oakridge Main Campus', totalStops: 6, estimatedDuration: '42 mins', assignedBusNumber: 'Bus 101', status: 'Active' },
  { id: 'RT-02', routeName: 'Route 2 - Westside Boulevard', startingPoint: 'Highland Heights Square', destination: 'Oakridge Main Campus', totalStops: 5, estimatedDuration: '38 mins', assignedBusNumber: 'Bus 102', status: 'Active' }
];

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'TransitIQ Transportation Server',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let role = 'Administrator';
  if (email.includes('transport')) role = 'Transport Manager';
  if (email.includes('viewer')) role = 'Viewer';

  res.json({
    success: true,
    token: `jwt_transit_${Date.now()}`,
    user: {
      name: email.split('@')[0].toUpperCase(),
      email,
      role
    }
  });
});

// STUDENTS REST API
app.get('/api/students', (req, res) => {
  const { classGrade, busId, search } = req.query;
  let result = [...students];
  if (classGrade) result = result.filter(s => s.classGrade === classGrade);
  if (busId) result = result.filter(s => s.assignedBusId === busId);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(s => s.fullName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }
  res.json(result);
});

app.post('/api/students', (req, res) => {
  const student = req.body;
  if (!student.fullName || !student.parentName || !student.contactNumber) {
    return res.status(400).json({ error: 'Missing required student fields' });
  }

  // Capacity Validation if assigned to bus
  if (student.assignedBusId) {
    const bus = buses.find(b => b.id === student.assignedBusId);
    if (bus) {
      const assignedCount = students.filter(s => s.assignedBusId === bus.id).length;
      if (assignedCount >= bus.capacity) {
        return res.status(409).json({ error: `Bus ${bus.busNumber} has reached capacity limit of ${bus.capacity} seats.` });
      }
    }
  }

  const newStudent = {
    ...student,
    id: `STU-2026-${String(students.length + 1).padStart(3, '0')}`
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const index = students.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  students = students.filter(s => s.id !== id);
  res.json({ success: true, message: 'Student removed' });
});

// BUSES REST API
app.get('/api/buses', (req, res) => {
  res.json(buses);
});

app.post('/api/buses', (req, res) => {
  const bus = req.body;
  if (!bus.busNumber || !bus.registrationNumber || !bus.capacity) {
    return res.status(400).json({ error: 'Missing required bus specifications' });
  }
  const newBus = {
    ...bus,
    id: `BUS-${100 + buses.length + 1}`
  };
  buses.push(newBus);
  res.status(201).json(newBus);
});

app.put('/api/buses/:id', (req, res) => {
  const { id } = req.params;
  const index = buses.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Bus not found' });
  buses[index] = { ...buses[index], ...req.body };
  res.json(buses[index]);
});

app.delete('/api/buses/:id', (req, res) => {
  const { id } = req.params;
  buses = buses.filter(b => b.id !== id);
  res.json({ success: true });
});

// DRIVERS REST API
app.get('/api/drivers', (req, res) => {
  res.json(drivers);
});

app.post('/api/drivers', (req, res) => {
  const driver = req.body;
  const newDriver = {
    ...driver,
    id: `DRV-${String(drivers.length + 1).padStart(3, '0')}`
  };
  drivers.push(newDriver);
  res.status(201).json(newDriver);
});

// ROUTES REST API
app.get('/api/routes', (req, res) => {
  res.json(routes);
});

// ASSIGNMENT CONTROLLER WITH REAL CAPACITY GUARD
app.post('/api/assignments', (req, res) => {
  const { studentId, busId, routeId, stopId } = req.body;
  const student = students.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  if (busId) {
    const bus = buses.find(b => b.id === busId);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const currentOccupancy = students.filter(s => s.assignedBusId === busId && s.id !== studentId).length;
    if (currentOccupancy >= bus.capacity) {
      return res.status(400).json({
        error: `Assignment Rejected: ${bus.busNumber} is at 100% capacity (${currentOccupancy}/${bus.capacity} seats taken).`
      });
    }

    student.assignedBusId = bus.id;
    student.assignedBusNumber = bus.busNumber;
  } else {
    student.assignedBusId = null;
    student.assignedBusNumber = 'Unassigned';
  }

  res.json({ success: true, student });
});

// ANALYTICS KPI ENDPOINT
app.get('/api/analytics', (req, res) => {
  const totalStudents = students.length;
  const assignedStudents = students.filter(s => s.assignedBusId).length;
  const activeBuses = buses.filter(b => b.status === 'Active').length;
  const maintenanceBuses = buses.filter(b => b.status === 'Maintenance').length;

  res.json({
    totalStudents,
    assignedStudents,
    occupancyPct: totalStudents > 0 ? Math.round((assignedStudents / totalStudents) * 100) : 0,
    totalBuses: buses.length,
    activeBuses,
    maintenanceBuses,
    totalDrivers: drivers.length,
    activeRoutes: routes.filter(r => r.status === 'Active').length
  });
});

// Optional MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB cluster'))
    .catch((err) => console.log('MongoDB connection error, falling back to in-memory store:', err.message));
}

app.listen(PORT, () => {
  console.log(`TransitIQ Transportation Server running on http://localhost:${PORT}`);
});
