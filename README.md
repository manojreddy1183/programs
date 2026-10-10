# TransitIQ — Enterprise School Bus Management System
### Professional SaaS Prototype & MERN Stack Architecture

---

## 1. Executive Summary & Product Overview

**TransitIQ** is an enterprise-grade School Bus Fleet & Transportation Management System crafted for academic institutions, district transportation directors, and fleet dispatchers. Designed inspired by modern enterprise SaaS platforms (such as Samsara, Stripe Dashboard, and Linear), TransitIQ centralizes student passenger rosters, bus fleet logistics, certified driver compliance, transit corridors, pickup stops, and daily dispatch schedules into one unified operational console.

### Key Capabilities
- **Real-Time Fleet & Seating Capacity Guard**: Eliminates accidental over-allocation by dynamically preventing assignments that exceed vehicle seating capacity, with threshold warnings at 85% and 90%.
- **Driver Certification & CDL Compliance Radar**: Proactively scans driver commercial licenses and surfaces imminent expiration alerts (<30 days) and expired credentials.
- **Visual Route Sequences & Map Preview**: Step-by-step waypoint journey visualization showing the depot departure, intermediate student boarding stops, and campus arrival with interactive vector schematic simulation.
- **Role-Based Access Control (RBAC)**: Distinct permission tiers for **Administrator**, **Transport Manager**, and **Viewer (Read-Only)** with dynamic interface enforcement.
- **Reporting & Data Export Suite**: One-click generation of student transit allocation rosters, fleet utilization audits, and workshop maintenance expense reports with real CSV download and print support.

---

## 2. Design System & Visual Identity

The interface adheres to an enterprise SaaS design system engineered for high legibility, trust, and operational clarity:

| Token | Hex Value | Application |
| :--- | :--- | :--- |
| **Primary Navy** | `#17365D` | App header, primary navigation, active states, key brand elements |
| **School Bus Yellow** | `#FFC928` | Accent callouts, vehicle emblems, status highlights, brand badges |
| **Slate Background** | `#F5F7FA` | Content area canvas, providing high-contrast card separation |
| **Card Surface** | `#FFFFFF` | Rounded cards (`rounded-2xl`) with subtle elevation shadows |
| **Active Status** | `#10B981` / Emerald | Dispatched vehicles, on-time performance, valid licenses |
| **Maintenance** | `#F59E0B` / Amber | Fleet workshop status, high seat utilization warnings |
| **Danger / Alert** | `#EF4444` / Rose | Capacity limit breaches, expired CDL licenses, deletions |

- **Typography**: Clean, geometric sans-serif (`Inter`) with strict typographic hierarchy.
- **Iconography**: Minimalist line icons from `lucide-react` for consistent visual language.
- **Accessibility**: High color contrast meeting WCAG AA standards, legible tabular data, and accessible modal dialogs with escape listeners and focus traps.

---

## 3. Application Structure & Modules

```
school-bus-system/
├── index.html                   # HTML5 Entry Point with Inter typography & favicon
├── package.json                 # React 18, Vite, Tailwind CSS, Express, Mongoose
├── tailwind.config.js           # Brand Navy #17365D and Yellow #FFC928 palette
├── vite.config.js               # Dev server & reverse-proxy configuration
├── server/                      # Express.js REST API Backend
│   ├── index.js                 # REST endpoints, capacity validation, CORS & auth
│   └── models/                  # Mongoose Schemas (User, Student, Bus, Driver, etc.)
│       ├── User.js
│       ├── Student.js
│       ├── Bus.js
│       ├── Driver.js
│       ├── Route.js
│       ├── Stop.js
│       ├── Schedule.js
│       └── MaintenanceRecord.js
└── src/
    ├── main.jsx                 # React root mount
    ├── App.jsx                  # Main application orchestrator & layout shell
    ├── index.css                # Tailwind directives & print media styles
    ├── context/
    │   ├── AuthContext.jsx      # RBAC, user sessions, permissions evaluator
    │   └── TransitContext.jsx   # Full CRUD state, capacity guards, toasts
    ├── data/
    │   └── mockData.js          # Realistic, internally consistent school dataset
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx       # Global search trigger, alerts bell, profile & role switcher
    │   │   ├── Sidebar.jsx      # Collapsible navigation with badge counters
    │   │   └── CommandPalette.jsx # Global instant search (Ctrl+K)
    │   └── common/
    │       ├── StatCard.jsx     # Executive KPI cards
    │       ├── Badge.jsx        # Semantic status indicators with pulse animations
    │       ├── Modal.jsx        # Accessible dialog backdrop with focus isolation
    │       ├── ConfirmDialog.jsx# Deletion verification dialog
    │       ├── CapacityBar.jsx  # Bus seat occupancy progress gauge
    │       └── ToastContainer.jsx # Real-time notification banners
    └── pages/
        ├── Dashboard.jsx        # Executive overview & interactive SVG charts
        ├── Students.jsx         # Student roster, pass generator, CSV export
        ├── Buses.jsx            # Fleet management, seat gauge, maintenance logger
        ├── Drivers.jsx          # CDL compliance, license expiration alerts
        ├── RoutesAndStops.jsx   # Corridor editor, stop sequencer, map visualizer
        ├── Schedules.jsx        # Morning/Afternoon rosters & conflict detector
        ├── Assignments.jsx      # Interactive student-to-bus allocation board
        ├── Reports.jsx          # Multi-report analytics, print layout, CSV download
        ├── UserManagement.jsx   # Staff accounts & permissions matrix
        ├── Settings.jsx         # School configuration, speed limits, data reset
        └── Login.jsx            # Authentication screen with demo role presets
```

---

## 4. Role-Based Access Control (RBAC)

The system enforces three distinct authorization tiers:

| Feature / Operation | Administrator | Transport Manager | Viewer |
| :--- | :---: | :---: | :---: |
| **Operations Dashboard & Charts** | Full Access | Full Access | Full Access |
| **Student Roster** | View / Add / Edit / Delete | View / Add / Edit / Delete | View Only |
| **Bus Fleet Management** | Full Control | Full Control | View Only |
| **Driver CDL Records** | Full Control | Full Control | View Only |
| **Route & Stop Sequencer** | Full Control | Full Control | View Only |
| **Student-to-Bus Allocation** | Full Control | Full Control | View Only |
| **Dispatch Timetables** | Full Control | Full Control | View Only |
| **Reports & Export** | Full Access | Full Access | Full Access |
| **User Account Management** | Full Access | Restricted | Restricted |
| **System Settings & Data Reset**| Full Access | Restricted | Restricted |

> **Demo Reviewer Quick Switch**: You can toggle between roles at any time using the role badge in the top navigation bar or the quick presets on the login screen.

---

## 5. Quick Start & Execution Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Launch the Frontend
Navigate into the project directory and start the Vite development server:
```powershell
cd school-bus-system
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 2. Launch the Express REST Backend (Optional / Full-Stack Mode)
In a separate terminal:
```powershell
cd school-bus-system
npm run server
```
The REST API will be active on **`http://localhost:5000`**.

### 3. Build for Production
To create an optimized production bundle:
```powershell
npm run build
npm run preview
```

---

## 6. Seed Accounts for Demonstration

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Arthur Vance | `admin@oakridgeschool.edu` | `TransitPass2026!` |
| **Transport Manager** | Marcus Bell | `transport@oakridgeschool.edu` | `TransitPass2026!` |
| **Viewer** | Sarah Jenkins | `viewer@oakridgeschool.edu` | `TransitPass2026!` |

*(The login screen also features 1-click demo buttons that prefill and log in immediately.)*

---

## 7. Key Operational Highlights

1. **Capacity Validation Guard**: Try assigning more than 48 students to `Bus 101` in the **Student-Bus Assignments** module. The application will block the assignment and surface a clear toast error.
2. **License Expiry Alerting**: Inspect `Driver Samuel Jackson` (license expiring in <15 days) and `Driver James O'Connor` (expired license) in the **Drivers** tab to observe proactive compliance badges.
3. **Interactive Route Sequence & Map Preview**: Navigate to **Routes & Stops -> Map & Sequence View** to view the live schematic journey from starting depot across pickup stops to the campus destination.
4. **Schedule Conflict Detector**: In the **Schedules** page, the conflict detection engine scans for double-booked buses or drivers on simultaneous shifts.
5. **Printable Student Bus Pass**: In the **Students** page, clicking the "Eye" icon displays a digital boarding credential and printable safety card with medical alerts.
