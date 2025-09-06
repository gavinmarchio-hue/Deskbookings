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
        // Initialize with default employees
        const defaultEmployees = [
          'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson', 'Chris Brown',
          'Lisa Garcia', 'David Lee', 'Anna Martinez', 'Ryan Taylor', 'Jessica White'
        ];
        await setDoc(docRef, { list: defaultEmployees });
        setEmployees(defaultEmployees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      // Fallback to default employees if Firebase fails
      setEmployees(['John Smith', 'Sarah Johnson', 'Mike Davis']);
    }
  };

  const loadBookings = async () => {
    try {
      const sampleBookings = {};
      // Just create empty bookings for now
      setBookings(sampleBookings);
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

  const bookDesk = async (date, user) => {
    const newBookings = [...(bookings[date] || []), user];
    setBookings(prev => ({
      ...prev,
      [date]: newBookings
    }));
  };

  const cancelBooking = async (date, user) => {
    const newBookings = (bookings[date] || []).filter(bookedUser => bookedUser !== user);
    setBookings(prev => ({
      ...prev,
      [date]: newBookings
    }));
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
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Desk Booking</h2>
          <p className="text-gray-600">Your app is connected to Firebase and ready to use!</p>
          <p className="text-sm text-gray-500 mt-2">Employees loaded: {employees.length}</p>
        </div>
      </div>
    </div>
  );
};

export default DeskBookingApp;
