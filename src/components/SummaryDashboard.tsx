import { motion } from "framer-motion";
import { getNumberCategory, getCategoryColor, type NumerologyProfile } from "@/lib/numerology";

interface SummaryDashboardProps {
  profile: NumerologyProfile;
  name: string;
}

const items = [
  { key: "lifePath", label: "Life Path", icon: "🌟" },
  { key: "expression", label: "Destiny", icon: "🔢" },
  { key: "soulUrge", label: "Soul Urge", icon: "💜" },
  { key: "personality", label: "Personality", icon: "🎭" },
  { key: "birthday", label: "Birthday", icon: "🎂" },
  { key: "personalYear", label: "Personal Year", icon: "📅" },
];

const SummaryDashboard = ({ profile, name }: SummaryDashboardProps) => {
  const firstName = name.split(" ")[0];

  // Generate a summary paragraph
  const lp = profile.lifePath;
  const summaryLines = [
    `${firstName}, your numerology profile reveals a fascinating blend of energies.`,
    `As a Life Path ${lp}, your core journey revolves around ${lp <= 3 ? "self-expression and leadership" : lp <= 6 ? "building stability and nurturing connections" : "deep wisdom and spiritual growth"}.`,
    `With a Destiny Number of ${profile.expression} and Soul Urge of ${profile.soulUrge}, you possess a unique combination of outer purpose and inner motivation that shapes every aspect of your life.`,
    `In ${new Date().getFullYear()}, your Personal Year ${profile.personalYear} energy invites you to ${profile.personalYear <= 3 ? "plant seeds and express yourself boldly" : profile.personalYear <= 6 ? "build foundations and deepen relationships" : "reflect, harvest, and prepare for transformation"}.`,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="bg-card-gradient rounded-xl border border-border/50 p-6 md:p-10"
    >
      <h2 className="font-display text-2xl md:text-3xl text-center text-gradient-gold mb-8">
        Your Numerology Profile at a Glance
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
              transition={{ delay: i * 0.1 }}
              className="bg-muted/30 rounded-lg p-4 text-center border border-border/30"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="font-display text-3xl font-bold mt-1" style={{ color }}>{value}</p>
              <p className="font-ui text-xs text-muted-foreground uppercase tracking-wider mt-1">{item.label}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-ui uppercase tracking-wider"
                style={{ backgroundColor: `${color}20`, color }}>
                {cat}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-muted/20 rounded-lg p-6 border border-gold/10">
        <h3 className="font-display text-sm tracking-[0.2em] uppercase text-gold mb-3">
          Your Numerology Profile in a Nutshell
        </h3>
        <p className="font-body text-lg text-foreground/85 leading-relaxed">
          {summaryLines.join(" ")}
        </p>
      </div>
    </motion.div>
  );
};

export default SummaryDashboard;
