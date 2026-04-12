const fs = require('fs');
const path = 'c:/website/queuing-system/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

// --- 1. STATE & HANDLERS ---
const stateMarker = "const [currentPage, setCurrentPage] = useState";
const stateIdx = c.indexOf(stateMarker);
if (stateIdx !== -1) {
    const endLineIdx = c.indexOf(";", stateIdx);
    const newStates = `
  const [currentPage, setCurrentPage] = useState('home');
  const [staffList, setStaffList] = useState([]);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [csmStats, setCsmStats] = useState(null);

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
      }
    } catch (err) { }
  };

  const deleteStaff = async (id) => {
    if (!confirm('Remove?')) return;
    await fetch(\`http://localhost:5000/api/admin/staff/\${id}\`, { method: 'DELETE' });
    fetchStaffList();
  };\n`;
    c = c.substring(0, stateIdx) + newStates + c.substring(endLineIdx + 1);
}

// --- 2. FETCH REPORTS LOGIC ---
const reportsMarker = "const fetchReports = async () => {";
const reportsIdx = c.indexOf(reportsMarker);
if (reportsIdx !== -1) {
    const tryIdx = c.indexOf("try {", reportsIdx);
    const insertAfter = `
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
      } catch (e) { }
`;
    const endTryIdx = c.indexOf("} catch (error) {", tryIdx);
    c = c.substring(0, tryIdx + 5) + insertAfter + c.substring(endTryIdx);
}

// --- 3. SURVEY PAGE (Carbon Edition) ---
const surveyCode = \`
function SurveyPage({ setCurrentPage }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ 
        name: '', age: '', sex: '', region: '', clientType: 'Citizen', cc1: '', cc2: '', cc3: '',
        sqd0: 5, sqd1: 5, sqd2: 5, sqd3: 5, sqd4: 5, sqd5: 5, sqd6: 5, sqd7: 5, sqd8: 5
    });

    const handleRating = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    return (
      <div className="min-h-screen bg-white pt-[148px] px-8 pb-24">
        <div className="max-w-4xl mx-auto bg-[#f4f4f4] border-t-4 border-[#0f62fe] p-12">
          <h2 className="text-4xl font-light text-[#161616] mb-8">Service Feedback</h2>
          <div className="space-y-8">
            <div className="space-y-2">
               <label className="text-xs uppercase text-[#525252]">Full Name</label>
               <input className="carbon-input w-full p-4" onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-6">
               <p className="font-bold text-sm uppercase text-[#0f62fe]">Overall Satisfaction</p>
               <div className="flex gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} onClick={() => handleRating('sqd0', v)} className={\`w-12 h-12 font-bold \${formData.sqd0 === v ? 'bg-[#0f62fe] text-white' : 'bg-white border'}\`}>{v}</button>
                  ))}
               </div>
            </div>
            <button onClick={() => setCurrentPage('home')} className="carbon-btn-primary p-4 px-12 font-bold">SUBMIT FEEDBACK</button>
          </div>
        </div>
      </div>
    );
}
\`;

// Inject Survey before QueuePage
c = c.replace("function QueuePage", surveyCode + "\\n\\nfunction QueuePage");

// --- 4. HEADER (Carbon) ---
const headerMarker = "function Header";
const headerEndMarker = "function HomePage";
const carbonHeader = \`
function Header({ currentPage, setCurrentPage, searchQuery, setSearchQuery }) {
  const tabs = [
    { id: 'queue', label: 'Queue' },
    { id: 'queue-display', label: 'Display' },
    { id: 'queue-teller', label: 'Teller' },
    { id: 'survey', label: 'Feedback' }
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[100px] bg-[#161616] text-white">
      <div className="w-full px-8 h-[70px] flex items-center justify-between border-b border-[#393939]">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold uppercase tracking-tight cursor-pointer" onClick={() => setCurrentPage('home')}>Service<span className="font-light">Box</span></h1>
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setCurrentPage(t.id)} className={\`px-4 py-6 text-sm font-medium transition-all border-b-2 \${currentPage === t.id ? 'border-[#0f62fe] text-white' : 'border-transparent text-[#c6c6c6] hover:text-white'}\`}>{t.label}</button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setCurrentPage('admin')} className="p-2 hover:bg-[#262626]"><Settings className="w-5 h-5 text-[#c6c6c6]" /></button>
          <button onClick={() => setCurrentPage('queue-teller')} className="bg-[#0f62fe] px-4 py-2 text-sm font-medium hover:bg-[#0353e9]">LOG IN</button>
        </div>
      </div>
      <div className="w-full h-[30px] bg-[#161616] flex items-center px-8 border-b border-[#393939]">
         <p className="text-[10px] font-mono text-[#c6c6c6] uppercase tracking-[0.16px]">IBM Carbon v11 / Enterprise Queuing System</p>
      </div>
    </header>
  );
}
\`;

const hIdx = c.indexOf(headerMarker);
const hEndIdx = c.indexOf(headerEndMarker);
if (hIdx !== -1 && hEndIdx !== -1) {
    c = c.substring(0, hIdx) + carbonHeader + "\\n" + c.substring(hEndIdx);
}

// --- 5. ROUTES ---
c = c.replace("{currentPage === 'queue' && <QueuePage setCurrentPage={setCurrentPage} />}", 
              "{currentPage === 'queue' && <QueuePage setCurrentPage={setCurrentPage} />}\\n          {currentPage === 'survey' && <SurveyPage setCurrentPage={setCurrentPage} />}");

fs.writeFileSync(path, c, 'utf8');
console.log('Reconstruction Done!');
