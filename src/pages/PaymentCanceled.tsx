import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PaymentCanceled = () => {
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
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/20 border border-border/30 mb-6"
        >
          <XCircle className="w-10 h-10 text-muted-foreground" />
        </motion.div>

        <h1 className="font-display text-2xl text-foreground mb-3">
          Payment Canceled
        </h1>
        <p className="font-body text-foreground/60 mb-8">
          No worries — your free reading is still available. You can unlock the full blueprint anytime.
        </p>

        <Button
          onClick={() => navigate("/")}
          className="h-12 px-10 font-display tracking-[0.1em] uppercase bg-primary text-primary-foreground hover:bg-gold-light shadow-gold"
        >
          Back to Reading
        </Button>
      </motion.div>
    </div>
  );
};

export default PaymentCanceled;
