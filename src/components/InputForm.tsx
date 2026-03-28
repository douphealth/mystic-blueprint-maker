import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InputFormProps {
  onSubmit: (name: string, dob: Date) => void;
}

const InputForm = ({ onSubmit }: InputFormProps) => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Enter your full birth name"); return; }
    if (!dob) { setError("Enter your date of birth"); return; }
    const date = new Date(dob + "T00:00:00");
    if (isNaN(date.getTime())) { setError("Invalid date"); return; }
    onSubmit(name.trim(), date);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="w-full max-w-sm mx-auto space-y-4"
    >
      <div>
        <Input
          type="text"
          placeholder="Full name at birth"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-card/60 border-border/60 text-foreground font-body text-base placeholder:text-muted-foreground/40 focus:border-primary focus:ring-primary/20 h-12 text-center tracking-wide"
        />
      </div>
      <div>
        <Input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="bg-card/60 border-border/60 text-foreground font-body text-base focus:border-primary focus:ring-primary/20 h-12 text-center"
        />
      </div>
      {error && (
        <p className="text-destructive text-xs font-ui text-center">{error}</p>
      )}
      <Button
        type="submit"
        className="w-full h-12 text-sm font-display tracking-[0.2em] uppercase bg-primary text-primary-foreground hover:bg-gold-light border-0 shadow-gold transition-all duration-300"
      >
        Reveal My Blueprint
      </Button>
    </motion.form>
  );
};

export default InputForm;
