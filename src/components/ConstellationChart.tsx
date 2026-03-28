import { motion } from "framer-motion";
import { getNumberCategory, getCategoryColor, type NumerologyProfile } from "@/lib/numerology";
import { useState } from "react";

interface ConstellationChartProps {
  profile: NumerologyProfile;
  name: string;
}

const nodes = [
  { key: "lifePath", label: "Life Path", angle: 270, radius: 130 },
  { key: "expression", label: "Destiny", angle: 330, radius: 130 },
  { key: "soulUrge", label: "Soul Urge", angle: 30, radius: 130 },
  { key: "personality", label: "Persona", angle: 90, radius: 130 },
  { key: "birthday", label: "Birthday", angle: 150, radius: 130 },
  { key: "personalYear", label: "Year", angle: 210, radius: 130 },
];

const ConstellationChart = ({ profile }: ConstellationChartProps) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const cx = 200, cy = 200;

  const getPos = (angle: number, radius: number) => ({
    x: cx + Math.cos((angle * Math.PI) / 180) * radius,
    y: cy + Math.sin((angle * Math.PI) / 180) * radius,
  });

  const nodeData = nodes.map(n => {
    const value = profile[n.key as keyof NumerologyProfile] as number;
    const pos = getPos(n.angle, n.radius);
    const category = getNumberCategory(value);
    const color = getCategoryColor(category);
    return { ...n, value, ...pos, color, category };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-sm mx-auto"
    >
      <h2 className="font-display text-xl md:text-2xl text-center text-gradient-gold mb-1">
        Your Number Constellation
      </h2>
      <p className="text-center text-muted-foreground font-ui text-[10px] tracking-wider mb-4">
        Tap a node to highlight connections
      </p>

      <svg viewBox="0 0 400 400" className="w-full">
        {/* Connections */}
        {nodeData.map((a, i) =>
          nodeData.slice(i + 1).map((b, j) => (
            <line
              key={`${i}-${j}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={activeNode === a.key || activeNode === b.key ? "hsl(43,72%,55%)" : "hsl(230,15%,22%)"}
              strokeWidth={activeNode === a.key || activeNode === b.key ? 1.2 : 0.4}
              opacity={activeNode && activeNode !== a.key && activeNode !== b.key ? 0.1 : 0.4}
            />
          ))
        )}

        {/* Rings */}
        <circle cx={cx} cy={cy} r={130} fill="none" stroke="hsl(43,72%,55%)" strokeWidth="0.3" opacity="0.15" />
        <circle cx={cx} cy={cy} r={65} fill="none" stroke="hsl(270,40%,30%)" strokeWidth="0.3" opacity="0.1" strokeDasharray="3 3" />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={2.5} fill="hsl(43,72%,55%)" opacity="0.6" />

        {/* Nodes */}
        {nodeData.map((node, i) => (
          <g key={node.key} onClick={() => setActiveNode(activeNode === node.key ? null : node.key)} className="cursor-pointer">
            <motion.circle
              cx={node.x} cy={node.y} r={24}
              fill={`${node.color}10`}
              stroke={node.color}
              strokeWidth={activeNode === node.key ? 1.5 : 0.8}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
            />
            <motion.text
              x={node.x} y={node.y + 1}
              textAnchor="middle" dominantBaseline="central"
              fill={node.color}
              fontSize="16" fontFamily="Cinzel, serif" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              {node.value}
            </motion.text>
            <text
              x={node.x} y={node.y + 40}
              textAnchor="middle"
              fill="hsl(230,10%,50%)"
              fontSize="8" fontFamily="Inter, sans-serif"
              style={{ textTransform: "uppercase", letterSpacing: "1.5px" }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {Array.from(new Set(nodeData.map(n => n.category))).map(cat => (
          <span key={cat} className="flex items-center gap-1 text-[10px] font-ui text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
            {cat}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default ConstellationChart;
