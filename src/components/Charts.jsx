import { motion } from 'framer-motion';

/* ---- Donut chart ---- */
export function DonutChart({ data, size = 220, thickness = 28 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:28, flexWrap:'wrap' }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        {/* track */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f0f0f0" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * circumference;
          const seg = (
            <motion.circle
              key={d.label}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16,1,0.3,1] }}
              strokeLinecap="round"
            />
          );
          offset += dash;
          return seg;
        })}
        {/* center total */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          style={{ transform:'rotate(90deg)', transformOrigin:'center', fontSize:'1.6rem', fontWeight:800, fill:'#111' }}>
          {total}
        </text>
      </svg>

      {/* legend */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {data.map(d => (
          <div key={d.label} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:12, height:12, borderRadius:4, background:d.color, flexShrink:0 }} />
            <span style={{ fontSize:'.9rem', color:'#333' }}>{d.label}</span>
            <strong style={{ fontSize:'.9rem', marginLeft:'auto', color:'#111' }}>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Bar chart ---- */
export function BarChart({ data, height = 220 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:24, height, padding:'0 8px' }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8, height:'100%' }}>
          <div style={{ flex:1, width:'100%', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16,1,0.3,1] }}
              style={{
                width: '70%', maxWidth: 70,
                background: `linear-gradient(180deg, ${d.color}, ${d.color}cc)`,
                borderRadius: '10px 10px 0 0',
                position: 'relative',
                minHeight: d.value > 0 ? 4 : 0,
              }}
            >
              <span style={{ position:'absolute', top:-24, left:0, right:0, textAlign:'center', fontSize:'.85rem', fontWeight:700, color:'#111' }}>
                {d.value}
              </span>
            </motion.div>
          </div>
          <span style={{ fontSize:'.78rem', color:'#777', textAlign:'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}
