import { motion, useInView } from "framer-motion";
import { getNumberCategory, getCategoryColor, type NumerologyProfile } from "@/lib/numerology";
import { useState, useRef } from "react";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
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
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
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
        {/* Animated outer ring */}
        <motion.circle
          cx={cx} cy={cy} r={130}
          fill="none" stroke="hsl(43,72%,55%)" strokeWidth="0.5"
          strokeDasharray="4 8"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={isInView ? { opacity: 0.2, pathLength: 1, rotate: 360 } : {}}
          transition={{ pathLength: { duration: 2, ease: "easeInOut" }, rotate: { duration: 60, repeat: Infinity, ease: "linear" }, opacity: { duration: 1 } }}
          style={{ transformOrigin: "200px 200px" }}
        />

        {/* Inner ring */}
        <motion.circle
          cx={cx} cy={cy} r={65}
          fill="none" stroke="hsl(270,40%,30%)" strokeWidth="0.5"
          strokeDasharray="3 6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.12, rotate: -360 } : {}}
          transition={{ rotate: { duration: 45, repeat: Infinity, ease: "linear" }, opacity: { duration: 1.5 } }}
          style={{ transformOrigin: "200px 200px" }}
        />

        {/* Connection lines with draw animation */}
        {nodeData.map((a, i) =>
          nodeData.slice(i + 1).map((b, j) => {
            const isActive = activeNode === a.key || activeNode === b.key;
            const isDimmed = activeNode && !isActive;
            return (
              <motion.line
                key={`${i}-${j}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={isActive ? "hsl(43,72%,55%)" : "hsl(230,15%,22%)"}
                strokeWidth={isActive ? 1.5 : 0.4}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? {
                  pathLength: 1,
                  opacity: isDimmed ? 0.08 : isActive ? 0.7 : 0.3,
                } : {}}
                transition={{ pathLength: { duration: 1.5, delay: 0.5 + (i * 0.1) }, opacity: { duration: 0.3 } }}
              />
            );
          })
        )}

        {/* Center pulse */}
        <motion.circle
          cx={cx} cy={cy} r={4}
          fill="hsl(43,72%,55%)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: [0.3, 0.8, 0.3], r: [3, 5, 3] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Nodes */}
        {nodeData.map((node, i) => {
          const isActive = activeNode === node.key;
          return (
            <g key={node.key} onClick={() => setActiveNode(isActive ? null : node.key)} className="cursor-pointer">
              {/* Hover/active pulse ring */}
              {isActive && (
                <motion.circle
                  cx={node.x} cy={node.y} r={32}
                  fill="none" stroke={node.color} strokeWidth="0.5"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <motion.circle
                cx={node.x} cy={node.y} r={24}
                fill={`${node.color}${isActive ? '20' : '0a'}`}
                stroke={node.color}
                strokeWidth={isActive ? 1.8 : 0.8}
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.8 + i * 0.15, type: "spring", stiffness: 150 }}
              />
              <motion.text
                x={node.x} y={node.y + 1}
                textAnchor="middle" dominantBaseline="central"
                fill={node.color}
                fontSize="16" fontFamily="Cinzel, serif" fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.0 + i * 0.15 }}
              >
                {node.value}
              </motion.text>
              <motion.text
                x={node.x} y={node.y + 40}
                textAnchor="middle"
                fill="hsl(230,10%,50%)"
                fontSize="8" fontFamily="Inter, sans-serif"
                style={{ textTransform: "uppercase", letterSpacing: "1.5px" }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 + i * 0.15 }}
              >
                {node.label}
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {Array.from(new Set(nodeData.map(n => n.category))).map(cat => (
          <motion.span
            key={cat}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.5 }}
            className="flex items-center gap-1 text-[10px] font-ui text-muted-foreground"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
            {cat}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default ConstellationChart;
