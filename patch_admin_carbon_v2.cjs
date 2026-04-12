const fs = require('fs');
const appPath = 'c:/website/queuing-system/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// 1. Carbonize Admin Tabs
const oldTabs = `const validTabs = ['appointments', 'queue', 'calendar', 'reports', 'settings'];`;
const newTabs = `const validTabs = ['appointments', 'queue', 'calendar', 'reports', 'feedback', 'settings'];`;
app = app.replace(oldTabs, newTabs);

// 2. Add CSM state to AdminDashboard
const csmState = `  const [csmStats, setCsmStats] = useState(null);
  const fetchCsm = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/csm-stats', {
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` }
      });
      const data = await res.json();
      if (data.success) setCsmStats(data.stats);
    } catch (err) {}
  };`;

// Insert after reportStats state
app = app.replace(`const [reportStats, setReportStats] = useState(null);`, `const [reportStats, setReportStats] = useState(null);\n${csmState}`);

// 3. Update useEffect to fetch CSM
app = app.replace(`if (activeTab === 'reports') fetchReports();`, `if (activeTab === 'reports') fetchReports();\n      if (activeTab === 'feedback') fetchCsm();`);

// 4. Overhaul the Render logic for Carbon
// We'll focus on the Tab buttons and the Content container.

app = app.replace(
  /<div className="flex bg-blue-100 p-1.5 rounded-xl mb-6 overflow-x-auto gap-1">([\s\S]*?)<\/div>/,
  `<div className="flex bg-[#f4f4f4] border-b border-[#e0e0e0] mb-8 overflow-x-auto">
    {[
      { id: 'appointments', label: 'Appointments' },
      { id: 'queue', label: 'Queue Mgmt' },
      { id: 'reports', label: 'Analytics' },
      { id: 'feedback', label: 'CSM Feedback' },
      { id: 'settings', label: 'System' }
    ].map(tab => (
      <button 
        key={tab.id} 
        onClick={() => setActiveTab(tab.id)}
        className={\`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-4 \${activeTab === tab.id ? 'border-[#0f62fe] bg-white text-[#161616]' : 'border-transparent text-[#525252] hover:bg-[#e8e8e8]'}\`}
      >
        {tab.label}
      </button>
    ))}
  </div>`
);

// 5. Add the Feedback Tab UI
const feedbackUI = `
        {activeTab === 'feedback' && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="text-3xl font-light uppercase tracking-tight">Customer Satisfaction Measurement</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { label: 'Overall Rating', val: csmStats?.overallAvg?.toFixed(1) || '0.0', color: '#0f62fe' },
                 { label: 'Total Responses', val: csmStats?.totalResponses || '0', color: '#161616' },
                 { label: 'Excellent Rate', val: (csmStats?.excellentPercent || '0') + '%', color: '#24a148' }
               ].map(stat => (
                 <div key={stat.label} className="bg-[#f4f4f4] p-8 border-l-4" style={{ borderColor: stat.color }}>
                    <p className="text-xs uppercase text-[#525252] mb-2 font-bold">{stat.label}</p>
                    <p className="text-4xl font-light">{stat.val}</p>
                 </div>
               ))}
            </div>
            
            <div className="bg-[#f4f4f4] p-12 border border-[#e0e0e0]">
               <h4 className="text-sm font-bold uppercase mb-8 tracking-widest text-[#0f62fe]">CSM Summary (ARTAv2 Standards)</h4>
               <div className="space-y-4">
                  {['Responsiveness', 'Reliability', 'Access & Facilities', 'Communication', 'Costs', 'Integrity', 'Assurance', 'Outcome'].map((q, i) => (
                    <div key={q} className="flex items-center justify-between p-4 bg-white border border-[#e0e0e0]">
                       <span className="text-xs uppercase font-bold text-[#525252]">{q}</span>
                       <div className="flex items-center space-x-4">
                          <div className="w-64 h-2 bg-[#e0e0e0]">
                             <div className="h-full bg-[#0f62fe]" style={{ width: \`\${(csmStats?.sqdStats?.[i] || 0) * 20}%\` }}></div>
                          </div>
                          <span className="text-sm font-bold">{(csmStats?.sqdStats?.[i] || 0).toFixed(1)} / 5.0</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}`;

app = app.replace(`{activeTab === 'settings' && (`, `${feedbackUI}\n\n        {activeTab === 'settings' && (`);

// Global Carbon Sweep (Replace rounded corners in all components inside App.jsx)
app = app.replace(/rounded-(xl|lg|2xl|3xl|md)/g, 'rounded-0');
app = app.replace(/bg-blue-600/g, 'bg-[#0f62fe]');
app = app.replace(/text-blue-600/g, 'text-[#0f62fe]');
app = app.replace(/border-blue-200/g, 'border-[#e0e0e0]');

fs.writeFileSync(appPath, app, 'utf8');
console.log('Admin Dashboard Carbonized with CSM Tab.');
