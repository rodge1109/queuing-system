import os

file_path = r'c:\website\queuing-system\src\App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Target lines: 7004 to 7396 (indices 7003 to 7395)
# Wait, let's verify where TripStatusBadge is exactly.
# findstr said 7396.

start_idx = 7003 # Line 7004
end_idx = 7395 # Line 7396

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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <div className="text-gray-400 mb-0.5">{icon && React.cloneElement(icon, { size: isSm ? 12 : 18 })}</div>
          <span className={`${isSm ? 'text-lg' : 'text-3xl'} font-bold text-gray-900 dark:text-white leading-none`}>{value}</span>
          <span className={`${isSm ? 'text-[8px]' : 'text-[10px]'} font-bold text-gray-400 uppercase tracking-widest mt-1`}>{label}</span>
        </div>
      </div>
    </div>
  );
}

"""

# Perform the replacement
final_lines = lines[:start_idx] + [new_metric_card] + lines[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print(f"Cleaned up lines {start_idx+1} to {end_idx+1} and replaced with correct MetricCard.")
