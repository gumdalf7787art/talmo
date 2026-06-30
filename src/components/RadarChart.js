export default function RadarChart({ breakdown }) {
  if (!breakdown || breakdown.length < 4) return null;

  const size = 200;
  const center = size / 2;
  const radius = 70;
  
  // Calculate coordinates for a given value (0-100) and index (0-3)
  // Indices: 0: Top, 1: Right, 2: Bottom, 3: Left
  const getCoordinates = (value, index) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = 0;
    const angle = (Math.PI / 2) - (index * (Math.PI / 2));
    const r = (numValue / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center - r * Math.sin(angle)
    };
  };

  // User scores polygon
  const userPoints = breakdown.map((item, index) => {
    const coord = getCoordinates(item.score, index);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  // Average scores polygon
  const avgPoints = breakdown.map((item, index) => {
    const coord = getCoordinates(item.avgScore || 70, index); // Fallback avg
    return `${coord.x},${coord.y}`;
  }).join(' ');

  // Labels
  const labels = [
    { text: "밀도", x: center, y: center - radius - 15 },
    { text: "헤어라인", x: center + radius + 25, y: center + 5 },
    { text: "굵기", x: center, y: center + radius + 15 },
    { text: "두피", x: center - radius - 20, y: center + 5 }
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4 mb-2 text-[11px] font-bold">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-teal-500/80 rounded-sm"></span>나의 상태</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-gray-300 border-dashed rounded-sm"></span>동일 연령대 평균</div>
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background grids */}
        {[0.25, 0.5, 0.75, 1].map((scale) => {
          const r = radius * scale;
          return (
            <polygon 
              key={scale}
              points={`${center},${center - r} ${center + r},${center} ${center},${center + r} ${center - r},${center}`}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}
        {/* Axes */}
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#E5E7EB" strokeWidth="1" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#E5E7EB" strokeWidth="1" />
        
        {/* Average Polygon */}
        <polygon points={avgPoints} fill="transparent" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 4" />
        
        {/* User Polygon */}
        <polygon points={userPoints} fill="rgba(20, 184, 166, 0.2)" stroke="#14B8A6" strokeWidth="2" />
        
        {/* User Points Dots */}
        {breakdown.map((item, index) => {
          const coord = getCoordinates(item.score, index);
          return <circle key={index} cx={coord.x} cy={coord.y} r="3" fill="#0D9488" />;
        })}

        {/* Labels */}
        {labels.map((label, idx) => (
          <text key={idx} x={label.x} y={label.y} fontSize="12" fill="#4B5563" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">
            {label.text}
          </text>
        ))}
      </svg>
    </div>
  );
}
