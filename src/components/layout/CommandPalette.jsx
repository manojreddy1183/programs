import React, { useState, useEffect } from 'react';
import { useTransit } from '../../context/TransitContext';
import { Search, GraduationCap, Bus, Users2, Navigation, MapPin, X, ArrowRight } from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, onNavigate }) => {
  const { students, buses, drivers, routes, stops } = useTransit();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle or open
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingStudents = q
    ? students.filter(s => s.fullName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.classGrade.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchingBuses = q
    ? buses.filter(b => b.busNumber.toLowerCase().includes(q) || b.registrationNumber.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const matchingDrivers = q
    ? drivers.filter(d => d.fullName.toLowerCase().includes(q) || d.phoneNumber.includes(q) || d.licenseNumber.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const matchingRoutes = q
    ? routes.filter(r => r.routeName.toLowerCase().includes(q) || r.startingPoint.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const totalResults = matchingStudents.length + matchingBuses.length + matchingDrivers.length + matchingRoutes.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Search bar */}
          <div className="flex items-center px-4 border-b border-slate-200">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              placeholder="Search students, buses, drivers, routes... (e.g. Emma, Bus 101, Route 1)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full py-4 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="ml-2 text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
              ESC
            </button>
          </div>

          {/* Results list */}
          <div className="max-h-96 overflow-y-auto p-3">
            {query.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <p className="font-semibold text-slate-500 mb-1">Quick Search Across TransitIQ</p>
                <p>Type a student name, bus plate number, driver license, or route name</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No matching records found for "{query}".
              </div>
            ) : (
              <div className="space-y-3">
                {/* Students */}
                {matchingStudents.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase px-2 mb-1">Students</p>
                    {matchingStudents.map(s => (
                      <div
                        key={s.id}
                        onClick={() => { onNavigate('students'); onClose(); }}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer text-xs group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{s.fullName} <span className="font-normal text-slate-500">({s.classGrade}-{s.section})</span></p>
                            <p className="text-slate-400 text-[11px]">{s.assignedBusNumber} • {s.pickupStopName}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-navy-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Buses */}
                {matchingBuses.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase px-2 mb-1">Buses</p>
                    {matchingBuses.map(b => (
                      <div
                        key={b.id}
                        onClick={() => { onNavigate('buses'); onClose(); }}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer text-xs group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-bus-100 text-bus-800 border border-bus-200">
                            <Bus className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{b.busNumber} <span className="font-normal text-slate-500">({b.registrationNumber})</span></p>
                            <p className="text-slate-400 text-[11px]">{b.model} • Capacity {b.capacity} seats</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-navy-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Drivers */}
                {matchingDrivers.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase px-2 mb-1">Drivers</p>
                    {matchingDrivers.map(d => (
                      <div
                        key={d.id}
                        onClick={() => { onNavigate('drivers'); onClose(); }}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer text-xs group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-navy-50 text-navy-700 border border-navy-100">
                            <Users2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{d.fullName}</p>
                            <p className="text-slate-400 text-[11px]">{d.phoneNumber} • Lic: {d.licenseNumber}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-navy-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Routes */}
                {matchingRoutes.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase px-2 mb-1">Routes</p>
                    {matchingRoutes.map(r => (
                      <div
                        key={r.id}
                        onClick={() => { onNavigate('routes'); onClose(); }}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer text-xs group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
                            <Navigation className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{r.routeName}</p>
                            <p className="text-slate-400 text-[11px]">{r.startingPoint} • {r.totalStops} Stops</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-navy-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Press ESC or click outside to dismiss</span>
            <span>Oakridge TransitIQ Central Database</span>
          </div>
        </div>
      </div>
    </div>
  );
};
