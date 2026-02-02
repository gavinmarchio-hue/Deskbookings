import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Icon components (same as before)
const Calendar = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const Users = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BarChart3 = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18"/>
    <path d="M18 17V9"/>
    <path d="M13 17V5"/>
    <path d="M8 17v-3"/>
  </svg>
);

const User = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const Plus = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14"/>
    <path d="M5 12h14"/>
  </svg>
);

const X = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18"/>
    <path d="M6 6l12 12"/>
  </svg>
);

const Eye = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const ChevronLeft = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRight = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const FileText = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const DeskBookingApp = () => {
  // OFFICE CLOSURE DATE - Last bookable day is Wednesday February 4th, 2026
  const CUTOFF_DATE = '2026-02-04';
  
  // Basic state
  const [currentUser, setCurrentUser] = useState('John Smith');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeView, setActiveView] = useState('calendar');
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // App state
  const [bookings, setBookings] = useState({});
  const [employees, setEmployees] = useState([]);
  const [maxWeeksAhead, setMaxWeeksAhead] = useState(8);
  const [loading, setLoading] = useState(true);
  
  const TOTAL_DESKS = 18;

  // Check if a date is after the cutoff
  const isDateUnavailable = (dateString) => {
    return dateString > CUTOFF_DATE;
  };

  // Firebase functions
  const loadEmployees = async () => {
    try {
      const docRef = doc(db, 'settings', 'employees');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setEmployees(docSnap.data().list || []);
      } else {
        const defaultEmployees = [
          'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson', 'Chris Brown',
          'Lisa Garcia', 'David Lee', 'Anna Martinez', 'Ryan Taylor', 'Jessica White',
          'Kevin Anderson', 'Michelle Thomas', 'Brian Jackson', 'Amy Rodriguez', 'Daniel Moore',
          'Jennifer Lopez', 'Mark Thompson', 'Rachel Green', 'Steven Clark', 'Laura Hall',
          'Peter Parker', 'Mary Jane', 'Tony Stark', 'Natasha Romanoff', 'Bruce Banner'
        ];
        await setDoc(docRef, { list: defaultEmployees });
        setEmployees(defaultEmployees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees(['John Smith', 'Sarah Johnson', 'Mike Davis']);
    }
  };

  const saveEmployees = async (employeeList) => {
    try {
      const docRef = doc(db, 'settings', 'employees');
      await setDoc(docRef, { list: employeeList });
    } catch (error) {
      console.error('Error saving employees:', error);
    }
  };

  const saveBooking = async (date, employeeList) => {
    try {
      const docRef = doc(db, 'bookings', date);
      await setDoc(docRef, { 
        employees: employeeList,
        lastUpdated: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(`Failed to save booking for ${date}. Please try again.`);
      return false;
    }
  };

  // AUDIT LOGGING FUNCTION
  const logChange = async (action, date, affectedUser, details = {}) => {
    try {
      const timestamp = new Date().toISOString();
      const logRef = doc(db, 'audit_log', `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      
      await setDoc(logRef, {
        action,           // 'BOOK', 'CANCEL', 'REMOVE_EMPLOYEE', etc.
        date,            // Which date was affected
        affectedUser,    // Who's booking was changed
        performedBy: currentUser,  // Who made the change
        timestamp,
        ...details       // Any extra info
      });
    } catch (error) {
      console.error('Failed to log action:', error);
      // Don't block the main action if logging fails
    }
  };

  // Utility function for Australian timezone - FINAL WEEK ONLY (Feb 3-7, 2026)
  const getNextWeekdays = (count = 5, weekOffset = 0) => {
    // Hardcoded final week: Monday Feb 3 to Friday Feb 7, 2026
    // Only showing this one week since office is closing
    const finalWeek = [
      '2026-02-02', // Monday
      '2026-02-03', // Tuesday
      '2026-02-04', // Wednesday (last bookable day)
      '2026-02-05', // Thursday
      '2026-02-06'  // Friday
    ];
    
    return finalWeek;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-AU', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-AU', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getBookingsForDate = (date) => {
    return bookings[date] || [];
  };

  const loadBookingsForDates = async (dates) => {
    try {
      const newBookings = { ...bookings };
      
      for (const date of dates) {
        if (!newBookings[date]) {
          const docRef = doc(db, 'bookings', date);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            newBookings[date] = docSnap.data().employees || [];
          } else {
            newBookings[date] = [];
          }
        }
      }
      
      setBookings(newBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const toggleBooking = async (date, employee) => {
    // Prevent bookings after cutoff date
    if (isDateUnavailable(date)) {
      alert('Office is closed. Bookings are no longer available after February 4th, 2026.');
      return;
    }

    const currentBookings = getBookingsForDate(date);
    let newBookings;
    let action;
    
    if (currentBookings.includes(employee)) {
      newBookings = currentBookings.filter(e => e !== employee);
      action = 'CANCEL';
    } else {
      if (currentBookings.length >= TOTAL_DESKS) {
        alert(`Sorry, all ${TOTAL_DESKS} desks are already booked for ${formatDate(date)}`);
        return;
      }
      newBookings = [...currentBookings, employee];
      action = 'BOOK';
    }
    
    const success = await saveBooking(date, newBookings);
    if (success) {
      setBookings({
        ...bookings,
        [date]: newBookings
      });
      
      await logChange(action, date, employee);
    }
  };

  const addEmployee = async (newEmployee) => {
    if (!newEmployee.trim()) return;
    
    if (employees.includes(newEmployee)) {
      alert('This employee already exists');
      return;
    }
    
    const updatedEmployees = [...employees, newEmployee].sort();
    setEmployees(updatedEmployees);
    await saveEmployees(updatedEmployees);
    await logChange('ADD_EMPLOYEE', null, newEmployee);
  };

  const removeEmployee = async (employeeToRemove) => {
    if (!confirm(`Remove ${employeeToRemove}? This will cancel all their bookings.`)) {
      return;
    }
    
    const updatedEmployees = employees.filter(e => e !== employeeToRemove);
    setEmployees(updatedEmployees);
    await saveEmployees(updatedEmployees);
    
    const updatedBookings = { ...bookings };
    for (const date in updatedBookings) {
      if (updatedBookings[date].includes(employeeToRemove)) {
        updatedBookings[date] = updatedBookings[date].filter(e => e !== employeeToRemove);
        await saveBooking(date, updatedBookings[date]);
      }
    }
    setBookings(updatedBookings);
    
    await logChange('REMOVE_EMPLOYEE', null, employeeToRemove);
  };

  useEffect(() => {
    const initialize = async () => {
      await loadEmployees();
      
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem('deskBookingCurrentUser');
        if (savedUser) {
          setCurrentUser(savedUser);
        }
      }
      
      const initialDates = getNextWeekdays(10, 0);
      await loadBookingsForDates(initialDates);
      
      setLoading(false);
    };
    
    initialize();
  }, []);

  useEffect(() => {
    const dates = getNextWeekdays(10, currentWeek);
    loadBookingsForDates(dates);
  }, [currentWeek]);

  const CalendarView = () => {
    const weekDays = getNextWeekdays(5, currentWeek);
    
    // Final week is hardcoded
    const isFinalWeek = true;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Final Week: Monday February 2nd - Friday February 6th, 2026
            <span className="ml-3 text-sm font-normal text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Last Booking Day: Wednesday Feb 4th
            </span>
          </h2>
        </div>

        {isFinalWeek && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Office Closing Notice</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>The Market Street office is closing. Last bookable day is <strong>Wednesday, February 4th, 2026</strong>.</p>
                  <p className="mt-1">Days after this date are unavailable for booking.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weekDays.map(date => {
            const dayBookings = getBookingsForDate(date);
            const isBooked = dayBookings.includes(currentUser);
            const availableDesks = TOTAL_DESKS - dayBookings.length;
            const isPastCutoff = isDateUnavailable(date);
            
            return (
              <div 
                key={date} 
                className={`border rounded-lg overflow-hidden ${
                  isPastCutoff ? 'bg-red-50 border-red-300' : 'bg-white'
                }`}
              >
                <div className={`p-3 font-medium text-center ${
                  isPastCutoff 
                    ? 'bg-red-600 text-white' 
                    : isBooked 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                }`}>
                  {formatShortDate(date)}
                </div>
                
                <div className="p-4">
                  {isPastCutoff ? (
                    <div className="text-center">
                      <div className="text-red-600 font-semibold mb-2">UNAVAILABLE</div>
                      <div className="text-xs text-red-500">Office Closed</div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Available:</span>
                        <span className={`text-sm font-semibold ${
                          availableDesks === 0 ? 'text-red-500' :
                          availableDesks < 5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {availableDesks}/{TOTAL_DESKS}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleBooking(date, currentUser)}
                        disabled={!isBooked && availableDesks === 0}
                        className={`w-full py-2 px-3 rounded-md font-medium text-sm transition-colors ${
                          isBooked
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : availableDesks === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isBooked ? 'Cancel Booking' : availableDesks === 0 ? 'Fully Booked' : 'Book Desk'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedDate(date);
                          setActiveView('daily');
                        }}
                        className="w-full mt-2 py-1 px-3 rounded-md text-sm text-gray-600 hover:bg-gray-100 flex items-center justify-center space-x-1"
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MyBookingsView = () => {
    const myBookings = Object.entries(bookings)
      .filter(([date, employees]) => employees.includes(currentUser))
      .map(([date]) => date)
      .sort();
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        
        {myBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">You have no upcoming bookings</p>
            <button
              onClick={() => setActiveView('calendar')}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Book a Desk
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myBookings.map(date => {
              const dayBookings = getBookingsForDate(date);
              const isPastCutoff = isDateUnavailable(date);
              
              return (
                <div 
                  key={date} 
                  className={`border rounded-lg p-4 ${
                    isPastCutoff ? 'bg-red-50 border-red-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Calendar size={20} className={isPastCutoff ? 'text-red-500' : 'text-blue-500'} />
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDate(date)}
                            {isPastCutoff && (
                              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                Office Closed
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {dayBookings.length}/{TOTAL_DESKS} desks booked
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDate(date);
                          setActiveView('daily');
                        }}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        View Details
                      </button>
                      {!isPastCutoff && (
                        <button
                          onClick={() => toggleBooking(date, currentUser)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const DashboardView = () => {
    const allDates = Object.keys(bookings).sort();
    const totalBookings = allDates.reduce((sum, date) => sum + bookings[date].length, 0);
    const averageOccupancy = allDates.length > 0 
      ? ((totalBookings / (allDates.length * TOTAL_DESKS)) * 100).toFixed(1)
      : 0;
    
    const employeeStats = employees.map(employee => {
      const bookingCount = allDates.filter(date => 
        bookings[date].includes(employee)
      ).length;
      return { employee, bookingCount };
    }).sort((a, b) => b.bookingCount - a.bookingCount);

    const upcomingDays = getNextWeekdays(10, 0);
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Office Closing</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Last bookable day is <strong>Wednesday, February 4th, 2026</strong>. The office will be closed after this date.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
            <div className="text-3xl font-bold text-gray-900">{totalBookings}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Average Occupancy</div>
            <div className="text-3xl font-bold text-gray-900">{averageOccupancy}%</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Total Employees</div>
            <div className="text-3xl font-bold text-gray-900">{employees.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Upcoming Week Overview</h3>
          <div className="space-y-2">
            {upcomingDays.slice(0, 5).map(date => {
              const dayBookings = getBookingsForDate(date);
              const percentage = (dayBookings.length / TOTAL_DESKS) * 100;
              const isPastCutoff = isDateUnavailable(date);
              
              return (
                <div key={date} className="flex items-center space-x-3">
                  <div className="w-32 text-sm font-medium text-gray-700">
                    {formatShortDate(date)}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className={`h-6 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium transition-all ${
                        isPastCutoff ? 'bg-red-500' :
                        percentage > 75 ? 'bg-red-500' :
                        percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${isPastCutoff ? 100 : percentage}%` }}
                    >
                      {isPastCutoff ? 'CLOSED' : `${dayBookings.length}/${TOTAL_DESKS}`}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDate(date);
                      setActiveView('daily');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Top Desk Users</h3>
          <div className="space-y-2">
            {employeeStats.slice(0, 10).map(({ employee, bookingCount }) => (
              <div key={employee} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-gray-500" />
                  <span className="text-sm">{employee}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{bookingCount} days</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AuditLogView = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
      const loadLogs = async () => {
        try {
          const logsRef = collection(db, 'audit_log');
          const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
          const querySnapshot = await getDocs(q);
          
          const loadedLogs = [];
          querySnapshot.forEach((doc) => {
            loadedLogs.push({ id: doc.id, ...doc.data() });
          });
          
          setLogs(loadedLogs);
        } catch (error) {
          console.error('Error loading audit logs:', error);
        } finally {
          setLoading(false);
        }
      };

      loadLogs();
    }, []);

    const filteredLogs = filter === 'all' 
      ? logs 
      : logs.filter(log => log.action === filter);

    const formatTimestamp = (timestamp) => {
      return new Date(timestamp).toLocaleString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getActionColor = (action) => {
      switch(action) {
        case 'BOOK': return 'bg-green-100 text-green-800';
        case 'CANCEL': return 'bg-red-100 text-red-800';
        case 'ADD_EMPLOYEE': return 'bg-blue-100 text-blue-800';
        case 'REMOVE_EMPLOYEE': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading audit logs...</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Actions</option>
            <option value="BOOK">Bookings</option>
            <option value="CANCEL">Cancellations</option>
            <option value="ADD_EMPLOYEE">Employee Additions</option>
            <option value="REMOVE_EMPLOYEE">Employee Removals</option>
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affected User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.performedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.affectedUser || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.date ? formatShortDate(log.date) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const EmployeeManagementView = () => {
    const [newEmployeeName, setNewEmployeeName] = useState('');
    
    const handleAddEmployee = () => {
      if (newEmployeeName.trim()) {
        addEmployee(newEmployeeName.trim());
        setNewEmployeeName('');
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Employees</h2>
        
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmployee()}
              placeholder="Enter employee name"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddEmployee}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Current Employees ({employees.length})</h3>
          </div>
          
          <div className="p-4">
            {employees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No employees configured</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {employees.map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-600" />
                      <span className="text-sm">{employee}</span>
                    </div>
                    <button
                      onClick={() => removeEmployee(employee)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove employee"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DailyView = () => {
    const dayBookings = getBookingsForDate(selectedDate);
    const isPastCutoff = isDateUnavailable(selectedDate);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveView('calendar')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Calendar
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {formatDate(selectedDate)}
            {isPastCutoff && (
              <span className="ml-3 text-sm font-normal bg-red-100 text-red-700 px-3 py-1 rounded-full">
                Office Closed
              </span>
            )}
          </h2>
        </div>
        
        <div className={`p-6 rounded-lg border shadow-sm ${
          isPastCutoff ? 'bg-red-50 border-red-200' : 'bg-white'
        }`}>
          {isPastCutoff ? (
            <div className="text-center py-8">
              <div className="text-red-600 text-xl font-semibold mb-2">Office Closed</div>
              <p className="text-red-500">This date is after the office closure on February 4th, 2026</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Office Occupancy</h3>
                <div className="text-sm text-gray-500">
                  {dayBookings.length}/{TOTAL_DESKS} desks booked
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    dayBookings.length > 14 ? 'bg-red-500' :
                    dayBookings.length > 10 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(dayBookings.length / TOTAL_DESKS) * 100}%` }}
                />
              </div>
              
              {dayBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings for this day</p>
              ) : (
                <div>
                  <h4 className="font-medium mb-3">Who's Coming In ({dayBookings.length}):</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {dayBookings.sort().map((employee, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded border border-blue-100">
                        <User size={16} className="text-blue-600" />
                        <span className="text-sm">{employee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 mb-2">Loading...</div>
          <div className="text-sm text-gray-500">Connecting to database</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Adbri Market Street Office Desk Bookings</h1>
          <p className="text-gray-600 mb-3">Manage your weekday workspace reservations • {TOTAL_DESKS} desks available</p>
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg inline-block">
            <strong>Notice:</strong> Last bookable day is Wednesday, February 4th, 2026
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar size={16} className="inline mr-2" />
              Book Desk
            </button>
            <button
              onClick={() => setActiveView('employees')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'employees'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Employees
            </button>
            {currentUser === 'Gavin Marchio' && (
              <button
                onClick={() => setActiveView('auditlog')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'auditlog'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={16} className="inline mr-2" />
                Audit Log
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeView === 'calendar' && <CalendarView />}
          {activeView === 'employees' && <EmployeeManagementView />}
          {activeView === 'daily' && <DailyView />}
          {activeView === 'auditlog' && <AuditLogView />}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <select
              value={currentUser}
              onChange={(e) => {
                setCurrentUser(e.target.value);
                if (typeof window !== 'undefined' && window.localStorage) {
                  localStorage.setItem('deskBookingCurrentUser', e.target.value);
                }
              }}
              className="px-3 py-1 border rounded text-sm"
            >
              {employees.map(employee => (
                <option key={employee} value={employee}>{employee}</option>
              ))}
            </select>
            <span>Switch user to test different views</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeskBookingApp;
