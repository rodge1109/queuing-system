const fs = require('fs');
const appPath = 'c:/website/queuing-system/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const marker = "function AdminDashboard({ setCurrentPage }) {";
const nextMarker = "function QueueAdminTab"; // End of AdminDashboard logic

const carbonAdmin = `
function AdminDashboard({ setCurrentPage }) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin section tabs
  const [activeTab, setActiveTab] = useState('appointments');
  useEffect(() => {
    const validTabs = ['appointments', 'queue', 'calendar', 'reports', 'staff', 'settings'];
    const requestedTab = localStorage.getItem('adminActiveTab');
    if (requestedTab && validTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
    localStorage.removeItem('adminActiveTab');
  }, []);

  // Dashboard state
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reschedule state
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState({ appointments: [], blockedDates: [] });

  // Reports state
  const [reportStats, setReportStats] = useState(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [csmStats, setCsmStats] = useState(null);

  // Settings state
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpec, setNewDoctorSpec] = useState('');
  const [services, setServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState(0);

  // Staff management state
  const [staffList, setStaffList] = useState([]);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffName, setNewStaffName] = useState('');

  // Print modal
  const [printAppointment, setPrintAppointment] = useState(null);

  const fetchStaffList = async () => {
    try {
      const resp = await fetch('http://localhost:5000/api/admin/staff');
      const data = await resp.json();
      if (data.success) setStaffList(data.staff);
    } catch (err) { console.error(err); }
  };

  const addStaff = async () => {
    if (!newStaffUsername || !newStaffPassword || !newStaffName) return;
    try {
      const resp = await fetch('http://localhost:5000/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newStaffUsername, password: newStaffPassword, name: newStaffName })
      });
      const data = await resp.json();
      if (data.success) {
        setNewStaffUsername(''); setNewStaffPassword(''); setNewStaffName('');
        fetchStaffList();
      } else alert(data.message || 'Failed to add staff');
    } catch (err) { alert('Failed to connect to server'); }
  };

  const deleteStaff = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      const resp = await fetch(\`http://localhost:5000/api/admin/staff/\${id}\`, { method: 'DELETE' });
      const data = await resp.json();
      if (data.success) fetchStaffList();
    } catch (err) { console.error(err); }
  };

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/verify', {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      const data = await response.json();
      if (data.valid) {
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (reportStartDate) params.append('startDate', reportStartDate);
      if (reportEndDate) params.append('endDate', reportEndDate);

      const response = await fetch(\`http://localhost:5000/api/reports/stats?\${params}\`);
      const data = await response.json();
      if (data.success) setReportStats(data.stats);

      try {
        const csmResp = await fetch(\`http://localhost:5000/api/reports/csm?\${params}\`);
        const csmData = await csmResp.json();
        if (csmData.success) setCsmStats(csmData);
      } catch (e) { console.error("CSM fetch failed", e); }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
       if (activeTab === 'reports') fetchReports();
       if (activeTab === 'staff') fetchStaffList();
       // other fetches...
    }
  }, [isLoggedIn, activeTab]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-[100px]">
        <div className="w-full max-w-md p-12 bg-[#f4f4f4] border-t-4 border-[#0f62fe]">
          <h2 className="text-3xl font-light text-[#161616] mb-8">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && <div className="p-4 bg-[#fff1f1] text-[#da1e28] text-sm border-l-4 border-[#da1e28]">{loginError}</div>}
            <div className="space-y-2">
              <label className="text-xs font-normal text-[#525252] uppercase tracking-[0.32px]">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="carbon-input w-full p-4 text-sm" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-normal text-[#525252] uppercase tracking-[0.32px]">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="carbon-input w-full p-4 text-sm" required />
            </div>
            <button type="submit" disabled={isLoggingIn} className="carbon-btn-primary w-full p-4 font-semibold">
              {isLoggingIn ? 'SIGNING IN...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[100px]">
      <div className="max-w-[1584px] mx-auto px-8 py-12">
        <div className="flex justify-between items-end mb-12 border-b border-[#e0e0e0] pb-8">
          <div>
             <h2 className="text-4xl font-light text-[#161616]">Dashboard</h2>
             <p className="text-[#525252] mt-2">Enterprise Administration Panel</p>
          </div>
          <div className="flex space-x-4">
             {['appointments', 'queue', 'reports', 'staff', 'settings'].map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab)}
                 className={\`px-6 py-3 text-sm font-medium transition-all \${activeTab === tab ? 'bg-[#0f62fe] text-white' : 'hover:bg-[#e8e8e8] text-[#525252]'}\`}
               >
                 {tab.toUpperCase()}
               </button>
             ))}
             <button onClick={() => setIsLoggedIn(false)} className="px-6 py-3 text-sm font-medium border border-[#da1e28] text-[#da1e28] hover:bg-[#fff1f1]">LOGOUT</button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'reports' && (
          <div className="space-y-12">
             <div className="flex items-center space-x-4 bg-[#f4f4f4] p-6">
                <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="carbon-input p-3 text-sm" />
                <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="carbon-input p-3 text-sm" />
                <button onClick={fetchReports} className="carbon-btn-primary px-8 py-3 text-sm font-medium">GENERATE REPORT</button>
             </div>

             {csmStats && (
               <div className="space-y-8">
                  <h3 className="text-2xl font-light">Client Satisfaction Measurement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e0e0e0] border border-[#e0e0e0]">
                     <div className="bg-white p-8">
                        <p className="text-xs text-[#525252] uppercase mb-2">Total Respondents</p>
                        <p className="text-5xl font-light">{csmStats.total}</p>
                     </div>
                     <div className="bg-white p-8">
                        <p className="text-xs text-[#525252] uppercase mb-2">CSAT Rating</p>
                        <p className={\`text-5xl font-light \${csmStats.csat >= 80 ? 'text-[#198038]' : 'text-[#da1e28]'}\`}>{csmStats.csat}%</p>
                     </div>
                     <div className="bg-white p-8">
                        <p className="text-xs text-[#525252] uppercase mb-2">NPS Score</p>
                        <p className="text-5xl font-light text-[#0f62fe]">{csmStats.nps}</p>
                     </div>
                  </div>
                  
                  <div className="bg-[#f4f4f4] p-8">
                     <h4 className="text-xs font-bold text-[#525252] uppercase mb-8">Service Quality Dimensions</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Object.entries(csmStats.sqdAverages).map(([key, val]) => (
                           <div key={key} className="border-l-2 border-[#0f62fe] pl-4">
                              <p className="text-xs text-[#6f6f6f] mb-1">{key}</p>
                              <p className="text-2xl font-light">{val}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-8">
             <h3 className="text-2xl font-light">Teller Staff Management</h3>
             <div className="bg-[#f4f4f4] p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <input placeholder="Name" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="carbon-input p-4 text-sm" />
                   <input placeholder="Username" value={newStaffUsername} onChange={e => setNewStaffUsername(e.target.value)} className="carbon-input p-4 text-sm" />
                   <input type="password" placeholder="Password" value={newStaffPassword} onChange={e => setNewStaffPassword(e.target.value)} className="carbon-input p-4 text-sm" />
                </div>
                <button onClick={addStaff} className="carbon-btn-primary px-8 py-4 font-medium">ADD STAFF MEMBER</button>
             </div>
             
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-[#f4f4f4] border-b border-[#e0e0e0]">
                      <th className="p-4 text-xs font-bold text-[#525252] uppercase">Name</th>
                      <th className="p-4 text-xs font-bold text-[#525252] uppercase">Username</th>
                      <th className="p-4 text-xs font-bold text-[#525252] uppercase text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e0e0]">
                   {staffList.map(s => (
                      <tr key={s.id} className="hover:bg-[#f4f4f4] transition-all">
                         <td className="p-4 text-sm">{s.name}</td>
                         <td className="p-4 text-sm text-[#525252] font-mono">{s.username}</td>
                         <td className="p-4 text-right">
                            <button onClick={() => deleteStaff(s.id)} className="text-[#da1e28] text-xs font-bold hover:underline">REMOVE</button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}\n\n`;

const startIdx = app.indexOf(marker);
const endIdx = app.indexOf(nextMarker);
if (startIdx !== -1 && endIdx !== -1) {
    app = app.substring(0, startIdx) + carbonAdmin + app.substring(endIdx);
    fs.writeFileSync(appPath, app, 'utf8');
    console.log('Successfully redesigned AdminDashboard');
} else {
    console.log('Could not find AdminDashboard markers');
}
