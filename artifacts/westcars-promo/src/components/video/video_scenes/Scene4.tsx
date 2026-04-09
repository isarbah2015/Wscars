import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1700),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[var(--color-primary)] z-10"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
    >
      <div className="grid grid-cols-3 gap-[5vw] px-[10vw]">
        <StatBox
          value="10k+"
          label="Listings"
          delay={0}
          show={phase >= 1}
        />
        <StatBox
          value="100%"
          label="Verified Sellers"
          delay={0.1}
          show={phase >= 2}
        />
        <StatBox
          value="24/7"
          label="Secure Messaging"
          delay={0.2}
          show={phase >= 3}
        />
      </div>
    </motion.div>
  );
}

function StatBox({ value, label, delay, show }: { value: string, label: string, delay: number, show: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center bg-white/10 p-[3vw] rounded-[2vw] backdrop-blur-sm border border-white/20"
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay }}
    >
      <div className="text-[5vw] font-black text-white leading-none mb-4">{value}</div>
      <div className="text-[1.8vw] font-medium text-white/80 uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}
