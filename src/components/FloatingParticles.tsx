import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  delay: number;
}

const FloatingParticles = () => {
  const stars = useMemo<Star[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.5 + 0.1,
    })), []);

  const shootingStars = useMemo<ShootingStar[]>(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      startX: Math.random() * 60 + 20,
      startY: Math.random() * 30,
      angle: Math.random() * 30 + 15,
      delay: i * 8 + Math.random() * 5,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Twinkling stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-foreground"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.03), transparent 70%)",
          left: "10%",
          top: "20%",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--cosmic-purple) / 0.04), transparent 70%)",
          right: "5%",
          top: "40%",
        }}
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 30, -25, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--mystic-teal) / 0.03), transparent 70%)",
          left: "50%",
          bottom: "20%",
        }}
        animate={{
          x: [0, 20, -30, 0],
          y: [0, -20, 10, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={`shoot-${star.id}`}
          className="absolute"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, 150],
            y: [0, 150 * Math.tan((star.angle * Math.PI) / 180)],
          }}
          transition={{
            duration: 1.2,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 12 + Math.random() * 8,
            ease: "easeIn",
          }}
        >
          <div
            className="w-12 h-px"
            style={{
              background: "linear-gradient(90deg, hsl(var(--gold) / 0.6), transparent)",
              transform: `rotate(${star.angle}deg)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingParticles;
