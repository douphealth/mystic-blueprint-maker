import { motion } from "framer-motion";
import { getNumberCategory, getCategoryColor, type NumerologyProfile } from "@/lib/numerology";
import { useState } from "react";

interface ConstellationChartProps {
  profile: NumerologyProfile;
  name: string;
}

const nodes = [
  { key: "lifePath", label: "Life Path", angle: 270, radius: 140 },
  { key: "expression", label: "Destiny", angle: 330, radius: 140 },
  { key: "soulUrge", label: "Soul Urge", angle: 30, radius: 140 },
  { key: "personality", label: "Personality", angle: 90, radius: 140 },
  { key: "birthday", label: "Birthday", angle: 150, radius: 140 },
  { key: "personalYear", label: "Personal Year", angle: 210, radius: 140 },
];

const ConstellationChart = ({ profile, name }: ConstellationChartProps) => {
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
      transition={{ duration: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      <h2 className="font-display text-2xl md:text-3xl text-center text-gradient-gold mb-2">
        Your Number Constellation
      </h2>
      <p className="text-center text-muted-foreground font-ui text-sm mb-6">Tap any node to see its connections</p>

      <svg viewBox="0 0 400 400" className="w-full">
        {/* Connection lines */}
        {nodeData.map((a, i) =>
          nodeData.slice(i + 1).map((b, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={activeNode === a.key || activeNode === b.key ? "hsl(43,72%,55%)" : "hsl(230,15%,25%)"}
              strokeWidth={activeNode === a.key || activeNode === b.key ? 1.5 : 0.5}
              opacity={activeNode && activeNode !== a.key && activeNode !== b.key ? 0.15 : 0.5}
              transition={{ duration: 0.3 }}
            />
          ))
        )}

        {/* Sacred geometry ring */}
        <circle cx={cx} cy={cy} r={140} fill="none" stroke="hsl(43,72%,55%)" strokeWidth="0.5" opacity="0.2" />
        <circle cx={cx} cy={cy} r={70} fill="none" stroke="hsl(270,40%,30%)" strokeWidth="0.5" opacity="0.15" strokeDasharray="4 4" />

        {/* Center */}
        <circle cx={cx} cy={cy} r={8} fill="hsl(43,72%,55%)" opacity="0.3" />
        <circle cx={cx} cy={cy} r={3} fill="hsl(43,72%,55%)" opacity="0.8" />

        {/* Nodes */}
        {nodeData.map((node, i) => (
          <g key={node.key} onClick={() => setActiveNode(activeNode === node.key ? null : node.key)} className="cursor-pointer">
            <motion.circle
              cx={node.x} cy={node.y} r={28}
              fill={`${node.color}15`}
              stroke={node.color}
              strokeWidth={activeNode === node.key ? 2 : 1}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
            />
            <motion.text
              x={node.x} y={node.y + 1}
              textAnchor="middle" dominantBaseline="central"
              fill={node.color}
              fontSize="18" fontFamily="Cinzel, serif" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.15 }}
            >
              {node.value}
            </motion.text>
            <text
              x={node.x} y={node.y + 45}
              textAnchor="middle"
              fill="hsl(230,10%,55%)"
              fontSize="9" fontFamily="Inter, sans-serif"
              style={{ textTransform: "uppercase", letterSpacing: "1px" }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Category legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {Array.from(new Set(nodeData.map(n => n.category))).map(cat => (
          <span key={cat} className="flex items-center gap-1.5 text-xs font-ui text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
            {cat}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default ConstellationChart;
