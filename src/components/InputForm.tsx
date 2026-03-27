import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    if (!name.trim()) { setError("Please enter your full birth name"); return; }
    if (!dob) { setError("Please enter your date of birth"); return; }
    const date = new Date(dob + "T00:00:00");
    if (isNaN(date.getTime())) { setError("Invalid date"); return; }
    onSubmit(name.trim(), date);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="font-display text-sm tracking-widest uppercase text-gold-light">
          Full Name at Birth
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full birth name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-muted/50 border-gold/20 text-foreground font-body text-lg placeholder:text-muted-foreground/50 focus:border-gold focus:ring-gold/30 h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dob" className="font-display text-sm tracking-widest uppercase text-gold-light">
          Date of Birth
        </Label>
        <Input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="bg-muted/50 border-gold/20 text-foreground font-body text-lg focus:border-gold focus:ring-gold/30 h-12"
        />
      </div>
      {error && <p className="text-mystic-rose text-sm font-ui">{error}</p>}
      <Button
        type="submit"
        className="w-full h-14 text-lg font-display tracking-wider uppercase bg-gradient-to-r from-gold-dim via-gold to-gold-dim text-primary-foreground hover:from-gold hover:via-gold-light hover:to-gold border-0 shadow-gold transition-all duration-500"
      >
        Reveal My Blueprint
      </Button>
    </motion.form>
  );
};

export default InputForm;
