import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

const DeskBookingApp = () => {
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

  const saveBooking = async (date, employeeList) => {
    try {
      const docRef = doc(db, 'bookings', date);
      await setDoc(docRef, { employees: employeeList });
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const weekdays = getNextWeekdays(maxWeeksAhead * 5);
      const bookingsData = {};
      
      for (const date of weekdays) {
        const docRef = doc(db, 'bookings', date);
        const docSnap = await getDoc(docRef);
        bookingsData[date] = docSnap.exists() ? (docSnap.data().employees || []) : [];
      }
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings({});
    }
    setLoading(false);
  };

  // Function to get next weekdays only, with week offset
  const getNextWeekdays = (count = 5, weekOffset = 0) => {
    const days = [];
    const today = new Date();
    let daysAdded = 0;
    let currentDay = weekOffset * 7;
    
    while (daysAdded < count) {
      const date = new Date(today);
      date.setDate(today.getDate() + currentDay);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days.push(date.toISOString().split('T')[0]);
        daysAdded++;
      }
      currentDay++;
    }
    return days;
  };

  const getWeekRange = (weekOffset) => {
    const weekdays = getNextWeekdays(5, weekOffset);
    if (weekdays.length === 0) return '';
    
    const startDate = new Date(weekdays[0] + 'T00:00:00');
    const endDate = new Date(weekdays[weekdays.length - 1] + 'T00:00:00');
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Initialize on component mount
  useEffect(() => {
    const initializeApp = async () => {
      await loadEmployees();
      await loadBookings();
    };
    initializeApp();
  }, []);

  // Booking functions
  const getBookingsForDate = (date) => {
    return bookings[date] || [];
  };

  const isUserBooked = (date, user) => {
    return getBookingsForDate(date).includes(user);
  };

  const getAvailableDesks = (date) => {
    return TOTAL_DESKS - getBookingsForDate(date).length;
  };

  const bookDesk = async (date, user) => {
    if (getAvailableDesks(date) > 0 && !isUserBooked(date, user)) {
      const newBookings = [...(bookings[date] || []), user];
      setBookings(prev => ({
        ...prev,
        [date]: newBookings
      }));
      await saveBooking(date, newBookings);
    }
  };

  const cancelBooking = async (date, user) => {
    const newBookings = (bookings[date] || []).filter(bookedUser => bookedUser !== user);
    setBookings(prev => ({
      ...prev,
      [date]: newBookings
    }));
    await saveBooking(date, newBookings);
  };

  const getCapacityColor = (available, total) => {
    const percentage = available / total;
    if (percentage > 0.5) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage > 0.2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getCapacityBadgeColor = (available, total) => {
    const percentage = available / total;
    if (percentage > 0.5) return 'bg-green-500';
    if (percentage > 0.2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getUserBookings = (user) => {
    const userBookings = [];
    const weekdays = getNextWeekdays(maxWeeksAhead * 5);
    
    weekdays.forEach(dateStr => {
      if (isUserBooked(dateStr, user)) {
        userBookings.push(dateStr);
      }
    });
    
    return userBookings.sort();
  };

  // Component views
  const WeekNavigator = () => (
    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-6">
      <button
        onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
        disabled={currentWeek === 0}
        className={`flex items-center px-4 py-2 rounded-lg ${
          currentWeek === 0 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
        }`}
      >
        <ChevronLeft size={16} className="mr-1" />
        Previous Week
      </button>
      
      <div className="text-center">
        <div className="font-semibold text-lg">
          {currentWeek === 0 ? 'This Week' : currentWeek === 1 ? 'Next Week' : `Week ${currentWeek + 1}`}
        </div>
        <div className="text-sm text-gray-600">
          {getWeekRange(currentWeek)}
        </div>
      </div>
      
      <button
        onClick={() => setCurrentWeek(currentWeek + 1)}
        disabled={currentWeek >= maxWeeksAhead - 1}
        className={`flex items-center px-4 py-2 rounded-lg ${
          currentWeek >= maxWeeksAhead - 1
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
        }`}
      >
        Next Week
        <ChevronRight size={16} className="ml-1" />
      </button>
    </div>
  );

  const CalendarView = () => {
    const weekdays = getNextWeekdays(5, currentWeek);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Book a Desk</h2>
          <div className="text-sm text-gray-500">
            Logged in as: <span className="font-medium">{currentUser}</span>
          </div>
        </div>
        
        <WeekNavigator />
        
        <div className="space-y-3">
          {weekdays.map(date => {
            const available = getAvailableDesks(date);
            const booked = getBookingsForDate(date).length;
            const userHasBooking = isUserBooked(date, currentUser);
            
            return (
              <div key={date} className={`p-4 rounded-lg border-2 ${getCapacityColor(available, TOTAL_DESKS)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{formatDate(date)}</div>
                    <div className="text-sm">
                      {booked}/{TOTAL_DESKS} desks booked • {available} available
                    </div>
                    {userHasBooking && (
                      <div className="text-sm font-medium text-blue-600 mt-1">
                        ✓ You have a desk booked
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getCapacityBadgeColor(available, TOTAL_DESKS)}`}></div>
                    
                    {userHasBooking ? (
                      <button
                        onClick={() => cancelBooking(date, currentUser)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2 transition-colors"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    ) : available > 0 ? (
                      <button
                        onClick={() => bookDesk(date, currentUser)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2 transition-colors"
                      >
                        <Plus size={16} />
                        <span>Book Desk</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg">
                        Fully Booked
                      </div>
                    )}
                    
                    <button
                      onClick={() => {setSelectedDate(date); setActiveView('daily');}}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                      title="View who's coming in"
                    >
                      <Eye size={16} />
                      <span>View ({booked})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MyBookingsView = () => {
    const myBookings = getUserBookings(currentUser);
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        
        {myBookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No upcoming bookings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myBookings.map(date => (
              <div key={date} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{formatDate(date)}</div>
                    <div className="text-sm text-gray-600">
                      Desk reserved • {getBookingsForDate(date).length}/{TOTAL_DESKS} total bookings
                    </div>
                  </div>
                  <button
                    onClick={() => cancelBooking(date, currentUser)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2 transition-colors"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Office Desk Booking</h1>
          <p className="text-gray-600 mb-3">Manage your weekday workspace reservations • {TOTAL_DESKS} desks available</p>
        </div>

        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-lg">
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
              onClick={() => setActiveView('bookings')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'bookings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={16} className="inline mr-2" />
              My Bookings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeView === 'calendar' && <CalendarView />}
          {activeView === 'bookings' && <MyBookingsView />}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
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
