import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, User, Plus, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

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

  const loadBookings = async () => {
    try {
      const weekdays = getNextWeekdays(maxWeeksAhead * 5);
      const bookingsData = {};
      
      for (const date of weekdays) {
        const docRef = doc(db, 'bookings', date);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          bookingsData[date] = docSnap.data().employees || [];
        } else {
          bookingsData[date] = [];
        }
      }
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
    setLoading(false);
  };

  const saveBooking = async (date, employeeList) => {
    try {
      const docRef = doc(db, 'bookings', date);
      await setDoc(docRef, { employees: employeeList });
    } catch (error) {
      console.error('Error saving booking:', error);
    }
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

  // Function to get week date range for display
  const getWeekRange = (weekOffset) => {
    const weekdays = getNextWeekdays(5, weekOffset);
    if (weekdays.length === 0) return '';
    
    const startDate = new Date(weekdays[0] + 'T00:00:00');
    const endDate = new Date(weekdays[weekdays.length - 1] + 'T00:00:00');
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Employee management functions
  const addEmployee = async (name) => {
    if (name.trim() && !employees.includes(name.trim())) {
      const newEmployees = [...employees, name.trim()].sort();
      setEmployees(newEmployees);
      await saveEmployees(newEmployees);
    }
  };

  const removeEmployee = async (name) => {
    const newEmployees = employees.filter(emp => emp !== name);
    setEmployees(newEmployees);
    await saveEmployees(newEmployees);
    
    // Remove from all bookings
    const updatedBookings = {};
    for (const [date, empList] of Object.entries(bookings)) {
      const filteredList = empList.filter(emp => emp !== name);
      updatedBookings[date] = filteredList;
      await saveBooking(date, filteredList);
    }
    setBookings(updatedBookings);
  };

  const resetEmployees = async () => {
    const defaultEmployees = [
      'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson', 'Chris Brown',
      'Lisa Garcia', 'David Lee', 'Anna Martinez', 'Ryan Taylor', 'Jessica White',
      'Kevin Anderson', 'Michelle Thomas', 'Brian Jackson', 'Amy Rodriguez', 'Daniel Moore',
      'Jennifer Lopez', 'Mark Thompson', 'Rachel Green', 'Steven Clark', 'Laura Hall',
      'Peter Parker', 'Mary Jane', 'Tony Stark', 'Natasha Romanoff', 'Bruce Banner'
    ];
    setEmployees(defaultEmployees);
    await saveEmployees(defaultEmployees);
  };

  // Initialize on component mount
  useEffect(() => {
    const initializeApp = async () => {
      await loadEmployees();
      await loadBookings();
    };
    initializeApp();
  }, [maxWeeksAhead]);

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

  // Rest of your component code stays the same...
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
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

  // All your existing component views stay exactly the same
  // (WeekNavigator, CalendarView, MyBookingsView, DashboardView, EmployeeManagementView, DailyView)
  // I'll include them here but they remain unchanged...

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

  // [Include all your other component views here - they stay the same]
  // CalendarView, MyBookingsView, DashboardView, EmployeeManagementView, DailyView

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Your existing JSX structure stays the same */}
      </div>
    </div>
  );
};

export default DeskBookingApp;
