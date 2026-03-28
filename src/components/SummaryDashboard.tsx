import { motion } from "framer-motion";
import { getNumberCategory, getCategoryColor, type NumerologyProfile } from "@/lib/numerology";

interface SummaryDashboardProps {
  profile: NumerologyProfile;
  name: string;
}

const items = [
  { key: "lifePath", label: "Life Path" },
  { key: "expression", label: "Destiny" },
  { key: "soulUrge", label: "Soul Urge" },
  { key: "personality", label: "Persona" },
  { key: "birthday", label: "Birthday" },
  { key: "personalYear", label: "Year" },
];

const SummaryDashboard = ({ profile, name }: SummaryDashboardProps) => {
  const firstName = name.split(" ")[0];
  const lp = profile.lifePath;

  const summary = `${firstName}, your numerology reveals a Life Path ${lp} journey of ${lp <= 3 ? "self-expression and leadership" : lp <= 6 ? "stability and deep connections" : "wisdom and spiritual growth"}. With Destiny ${profile.expression} and Soul Urge ${profile.soulUrge}, your outer purpose and inner motivation create a unique blueprint. Your ${new Date().getFullYear()} Personal Year ${profile.personalYear} invites ${profile.personalYear <= 3 ? "bold new beginnings" : profile.personalYear <= 6 ? "building and deepening" : "reflection and transformation"}.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card-gradient rounded-xl border border-border/50 p-5 md:p-8"
    >
      <h2 className="font-display text-xl md:text-2xl text-center text-gradient-gold mb-6">
        At a Glance
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {items.map((item, i) => {
          const value = profile[item.key as keyof NumerologyProfile] as number;
          const cat = getNumberCategory(value);
          const color = getCategoryColor(cat);
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="text-center py-3 rounded-lg border border-border/20 bg-muted/15"
            >
              <p className="font-display text-xl font-bold" style={{ color }}>{value}</p>
              <p className="font-ui text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{item.label}</p>
              <span
                className="inline-block mt-1 px-1.5 py-px rounded-full text-[8px] font-ui uppercase tracking-wider"
                style={{ backgroundColor: `${color}15`, color }}
              >
                {cat}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-lg p-4 border border-border/20 bg-muted/10">
        <p className="font-body text-[15px] text-foreground/75 leading-relaxed">{summary}</p>
      </div>
    </motion.div>
  );
};

export default SummaryDashboard;
