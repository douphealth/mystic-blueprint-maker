import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6"
        >
          <CheckCircle className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="font-display text-3xl text-gradient-gold mb-3">
          Blueprint Unlocked
        </h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="font-body text-foreground/60">
            Your Complete Mystical Blueprint is ready
          </p>
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <p className="font-ui text-sm text-muted-foreground mb-8">
          Thank you for your purchase. Your full numerology reading with all premium insights is now available.
        </p>

        <Button
          onClick={() => navigate("/")}
          className="h-12 px-10 font-display tracking-[0.1em] uppercase bg-primary text-primary-foreground hover:bg-gold-light shadow-gold"
        >
          View My Blueprint
        </Button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
