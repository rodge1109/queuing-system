import os

file_path = r'c:\website\queuing-system\src\App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_metric_card = """function MetricCard({ label, value, max = 100, icon, color, active, size = 'md' }) {
  const isSm = size === 'sm';
  const dim = isSm ? 'w-24 h-24' : 'w-48 h-48';
  const strokeWidth = isSm ? 6 : 10;
  const radius = 50 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: '#0f62fe',
    green: '#10b981',
    red: '#ef4444',
    cyan: '#06b6d4',
    amber: '#f59e0b',
    gray: '#6b7280'
  };

  const activeColor = colors[color] || colors.blue;

  return (
    <div className={`relative flex flex-col items-center justify-center group transition-all ${active ? 'animate-pulse' : ''}`}>
      <div className={`relative ${dim}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-gray-100 dark:text-gray-800" />
          <circle cx="50" cy="50" r={radius} stroke={activeColor} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-gray-400 mb-0.5">{icon && React.cloneElement(icon, { size: isSm ? 12 : 18 })}</div>
          <span className={`${isSm ? 'text-lg' : 'text-3xl'} font-bold text-gray-900 dark:text-white leading-none`}>{value}</span>
          <span className={`${isSm ? 'text-[8px]' : 'text-[10px]'} font-bold text-gray-400 uppercase tracking-widest mt-1`}>{label}</span>
        </div>
      </div>
    </div>
  );
}"""

# Find by string index
start_marker = "function MetricCard({ label, value, max = 100, icon, color, active, size = 'md' }) {"
start_idx = content.find(start_marker)

if start_idx != -1:
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    
    if end_idx != -1:
        new_content = content[:start_idx] + new_metric_card + content[end_idx:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Doughnut MetricCard applied.")
    else:
        print("End not found.")
else:
    print("Start not found.")
