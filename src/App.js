import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, User, Plus, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const DeskBookingApp = () => {
  // Basic state
  const [currentUser, setCurrentUser] = useState('John Smith');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeView, setActiveView] = useState('calendar');
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // App state
  const [bookings, setBookings] = useState({});
  const [employees, setEmployees] = useState([
    'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson', 'Chris Brown',
    'Lisa Garcia', 'David Lee', 'Anna Martinez', 'Ryan Taylor', 'Jessica White',
    'Kevin Anderson', 'Michelle Thomas', 'Brian Jackson', 'Amy Rodriguez', 'Daniel Moore',
    'Jennifer Lopez', 'Mark Thompson', 'Rachel Green', 'Steven Clark', 'Laura Hall',
    'Peter Parker', 'Mary Jane', 'Tony Stark', 'Natasha Romanoff', 'Bruce Banner'
  ]);
  const [maxWeeksAhead, setMaxWeeksAhead] = useState(8);
  
  const TOTAL_DESKS = 18;

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

  // Initialize with demo data
  const initializeDemoData = () => {
    const sampleBookings = {};
    const weekdays = getNextWeekdays(maxWeeksAhead * 5);
    
    weekdays.forEach(dateStr => {
      const numBookings = Math.floor(Math.random() * 13) + 5;
      const shuffled = [...employees].sort(() => 0.5 - Math.random());
      sampleBookings[dateStr] = shuffled.slice(0, numBookings);
    });
    
    setBookings(sampleBookings);
  };

  // Employee management functions
  const addEmployee = (name) => {
    if (name.trim() && !employees.includes(name.trim())) {
      setEmployees(prev => [...prev, name.trim()].sort());
    }
  };

  const removeEmployee = (name) => {
    setEmployees(prev => prev.filter(emp => emp !== name));
    setBookings(prev => {
      const updated = {};
      Object.keys(prev).forEach(date => {
        updated[date] = prev[date].filter(emp => emp !== name);
      });
      return updated;
    });
  };

  const resetEmployees = () => {
    const defaultEmployees = [
      'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson', 'Chris Brown',
      'Lisa Garcia', 'David Lee', 'Anna Martinez', 'Ryan Taylor', 'Jessica White',
      'Kevin Anderson', 'Michelle Thomas', 'Brian Jackson', 'Amy Rodriguez', 'Daniel Moore',
      'Jennifer Lopez', 'Mark Thompson', 'Rachel Green', 'Steven Clark', 'Laura Hall',
      'Peter Parker', 'Mary Jane', 'Tony Stark', 'Natasha Romanoff', 'Bruce Banner'
    ];
    setEmployees([...defaultEmployees]);
  };

  // Initialize on component mount
  useEffect(() => {
    initializeDemoData();
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
      setBookings(prev => ({
        ...prev,
        [date]: [...(prev[date] || []), user]
      }));
    }
  };

  const cancelBooking = (date, user) => {
    setBookings(prev => ({
      ...prev,
      [date]: (prev[date] || []).filter(bookedUser => bookedUser !== user)
    }));
  };

  // Display helper functions
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

  const DashboardView = () => {
    const weekDays = getNextWeekdays(5, currentWeek);
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Overview</h2>
        
        <WeekNavigator />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {weekDays.map(date => {
            const booked = getBookingsForDate(date).length;
            const available = TOTAL_DESKS - booked;
            const percentage = Math.round((booked / TOTAL_DESKS) * 100);
            
            return (
              <div key={date} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  {formatDate(date)}
                </div>
                <div className="text-2xl font-bold mb-2">
                  {percentage}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      percentage > 80 ? 'bg-red-500' :
                      percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {booked}/{TOTAL_DESKS} desks booked
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Weekly Statistics</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {weekDays.length > 0 ? Math.round(weekDays.reduce((sum, date) => sum + getBookingsForDate(date).length, 0) / weekDays.length) : 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg Daily Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {weekDays.length > 0 ? Math.max(...weekDays.map(date => getBookingsForDate(date).length)) : 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Peak Day Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {weekDays.length > 0 ? Math.round((weekDays.reduce((sum, date) => sum + getBookingsForDate(date).length, 0) / (weekDays.length * TOTAL_DESKS)) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg Occupancy</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmployeeManagementView = () => {
    const [newEmployeeName, setNewEmployeeName] = useState('');

    const handleAddEmployee = (e) => {
      e.preventDefault();
      if (newEmployeeName.trim()) {
        addEmployee(newEmployeeName);
        setNewEmployeeName('');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <div className="text-sm text-gray-500">
            Total: <span className="font-medium">{employees.length} employees</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-3">Add New Employee</h3>
          <form onSubmit={handleAddEmployee} className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter employee name..."
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              className="flex-1 px-3 py-2 border border-green-300 rounded-md text-sm"
            />
            <button
              type="submit"
              disabled={!newEmployeeName.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 text-sm"
            >
              Add Employee
            </button>
          </form>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-3">Booking Settings</h3>
          <div className="flex items-center space-x-4">
            <label className="text-sm text-purple-900">
              Allow booking up to:
            </label>
            <select
              value={maxWeeksAhead}
              onChange={(e) => setMaxWeeksAhead(Number(e.target.value))}
              className="px-3 py-2 border border-purple-300 rounded-md text-sm"
            >
              <option value={4}>4 weeks ahead</option>
              <option value={8}>8 weeks ahead</option>
              <option value={12}>12 weeks ahead</option>
              <option value={16}>16 weeks ahead</option>
              <option value={26}>6 months ahead</option>
              <option value={52}>1 year ahead</option>
            </select>
            <div className="text-xs text-purple-600">
              Currently: {maxWeeksAhead} weeks ({maxWeeksAhead * 5} weekdays)
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-900">Current Employees</h3>
            <button
              onClick={resetEmployees}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Reset to Defaults
            </button>
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

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Data Management</h3>
          <div className="space-y-3">
            <div>
              <button
                onClick={() => {
                  const data = JSON.stringify(employees, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'employees.json';
                  a.click();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm mr-2"
              >
                Export Employee List
              </button>
              <span className="text-xs text-gray-600">
                Download employee list as JSON file
              </span>
            </div>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const importedEmployees = JSON.parse(event.target.result);
                        if (Array.isArray(importedEmployees)) {
                          setEmployees(importedEmployees.sort());
                        }
                      } catch (error) {
                        alert('Invalid JSON file');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="hidden"
                id="import-employees"
              />
              <label
                htmlFor="import-employees"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm cursor-pointer mr-2"
              >
                Import Employee List
              </label>
              <span className="text-xs text-gray-600">
                Upload JSON file with employee names
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DailyView = () => {
    const dayBookings = getBookingsForDate(selectedDate);
    
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
          </h2>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
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
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Office Desk Booking</h1>
          <p className="text-gray-600 mb-3">Manage your weekday workspace reservations • {TOTAL_DESKS} desks available</p>
        </div>

        {/* Navigation Tabs */}
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
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 size={16} className="inline mr-2" />
              Dashboard
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
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeView === 'calendar' && <CalendarView />}
          {activeView === 'bookings' && <MyBookingsView />}
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'employees' && <EmployeeManagementView />}
          {activeView === 'daily' && <DailyView />}
        </div>

        {/* User Selector */}
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
