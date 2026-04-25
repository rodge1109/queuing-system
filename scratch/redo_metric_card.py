import os

file_path = r'c:\website\queuing-system\src\App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_metric_card = """function MetricCard({ label, value, max = 240, icon, color, active, size = 'md' }) {
  const canvasRef = useRef(null);
  const isSm = size === 'sm';
  const dim = isSm ? 'w-28 h-28' : 'w-56 h-56';
  const speedRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    const targetSpeed = parseFloat(value) || 0;
    const MAX_SPEED = max;
    const W = 300, H = 300, CX = 150, CY = 160, R = 120;
    const START_ANGLE = Math.PI * 0.75;
    const END_ANGLE   = Math.PI * 2.25;
    const TOTAL_ARC   = END_ANGLE - START_ANGLE;

    const getColor = (speed) => {
      const p = speed / MAX_SPEED;
      if (p < 0.33) return '#10b981';
      if (p < 0.66) return '#f59e0b';
      return '#ef4444';
    };

    const isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

    const draw = (speed) => {
      ctx.clearRect(0, 0, W, H);
      const dark = isDark();
      const bgTrack = dark ? '#374151' : '#e5e7eb';
      const textPrimary = dark ? '#f9fafb' : '#111827';
      const textSecondary = dark ? '#9ca3af' : '#6b7280';

      ctx.beginPath();
      ctx.arc(CX, CY, R, START_ANGLE, END_ANGLE);
      ctx.strokeStyle = bgTrack;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.stroke();

      const prog = Math.min(speed / MAX_SPEED, 1);
      if (prog > 0) {
        ctx.beginPath();
        ctx.arc(CX, CY, R, START_ANGLE, START_ANGLE + TOTAL_ARC * prog);
        ctx.strokeStyle = getColor(speed);
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      const tickCount = 24;
      for (let i = 0; i <= tickCount; i++) {
        const angle = START_ANGLE + (TOTAL_ARC * i) / tickCount;
        const isMajor = i % 4 === 0;
        const x1 = CX + Math.cos(angle) * (R + 8);
        const y1 = CY + Math.sin(angle) * (R + 8);
        const x2 = CX + Math.cos(angle) * (R + 20);
        const y2 = CY + Math.sin(angle) * (R + 20);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isMajor ? textSecondary : (dark ? '#4b5563' : '#d1d5db');
        ctx.lineWidth = isMajor ? 2 : 1;
        ctx.stroke();
        if (isMajor) {
          const tickLabel = Math.round((i / tickCount) * MAX_SPEED);
          const lx = CX + Math.cos(angle) * (R + 34);
          const ly = CY + Math.sin(angle) * (R + 34);
          ctx.font = '500 11px system-ui, sans-serif';
          ctx.fillStyle = textSecondary;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tickLabel, lx, ly);
        }
      }

      const needleAngle = START_ANGLE + (TOTAL_ARC * prog);
      const nx = CX + Math.cos(needleAngle) * (R - 18);
      const ny = CY + Math.sin(needleAngle) * (R - 18);
      const bx = CX + Math.cos(needleAngle + Math.PI) * 18;
      const by = CY + Math.sin(needleAngle + Math.PI) * 18;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = getColor(speed);
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(CX, CY, 10, 0, Math.PI * 2);
      ctx.fillStyle = getColor(speed);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(CX, CY, 5, 0, Math.PI * 2);
      ctx.fillStyle = dark ? '#1f2937' : '#ffffff';
      ctx.fill();

      ctx.font = '600 36px system-ui, sans-serif';
      ctx.fillStyle = textPrimary;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(speed), CX, CY + 42);

      ctx.font = '500 11px system-ui, sans-serif';
      ctx.fillStyle = textSecondary;
      ctx.fillText(label?.toUpperCase() || 'KM/H', CX, CY + 62);
    };

    const animate = () => {
      const diff = targetSpeed - speedRef.current;
      if (Math.abs(diff) < 0.1) {
        speedRef.current = targetSpeed;
        draw(speedRef.current);
        return;
      }
      speedRef.current += diff * 0.1;
      draw(speedRef.current);
      animFrame = requestAnimationFrame(animate);
    };
    animate();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => draw(speedRef.current);
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => {
      cancelAnimationFrame(animFrame);
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [value, max, label]);

  return (
    <div className={`relative flex flex-col items-center group transition-all ${active ? 'animate-pulse' : ''}`}>
      <div className={`relative ${dim} flex items-center justify-center`}>
        <canvas ref={canvasRef} width={300} height={300} className="w-full h-full drop-shadow-2xl" />
        {icon && (
          <div className="absolute top-[35%] opacity-20 text-gray-500 group-hover:opacity-40 transition-opacity">
            {React.cloneElement(icon, { size: isSm ? 16 : 24 })}
          </div>
        )}
      </div>
    </div>
  );
}"""

# Find by string index
start_marker = "function MetricCard({ label, value, max = 100, icon, color, active, size = 'md' }) {"
start_idx = content.find(start_marker)

if start_idx != -1:
    # Find the end of the function by counting braces
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
        print("MetricCard replaced successfully.")
    else:
        print("Could not find end of MetricCard function.")
else:
    print("Could not find start of MetricCard function.")
