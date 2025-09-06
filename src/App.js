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

       <div className="bg-white rounded-lg shadow-sm border p-6">
         {activeView === 'calendar' && <CalendarView />}
         {activeView === 'bookings' && <MyBookingsView />}
         {activeView === 'dashboard' && <DashboardView />}
         {activeView === 'employees' && <EmployeeManagementView />}
         {activeView === 'daily' && <DailyView />}
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
