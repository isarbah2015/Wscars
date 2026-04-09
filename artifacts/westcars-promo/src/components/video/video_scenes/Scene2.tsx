import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { fadeUp } from '../lib/video/animations';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-start px-[10vw] bg-black/60 z-10"
      initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative z-10 max-w-[50vw]">
        <motion.h2
          className="text-[4vw] font-bold text-white leading-tight"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Buying a car can be
        </motion.h2>
        
        <motion.h2
          className="text-[5vw] font-black text-white/50 leading-tight uppercase mt-4"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          STRESSFUL.
        </motion.h2>
        
        <motion.h2
          className="text-[5vw] font-black text-white/50 leading-tight uppercase"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
          UNCERTAIN.
        </motion.h2>

        <motion.div
          className="mt-8 text-[2vw] text-white/80 border-l-4 border-[var(--color-primary)] pl-6"
          initial={{ opacity: 0, height: 0 }}
          animate={phase >= 3 ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.8 }}
        >
          It's time for clarity.
        </motion.div>
      </div>
    </motion.div>
  );
}
