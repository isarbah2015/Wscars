import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-between px-[10vw] bg-[var(--color-bg-light)] z-10"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative z-10 max-w-[40vw]">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          <img src={`${import.meta.env.BASE_URL}wc-badge.png`} alt="WestCars" className="w-[8vw]" />
        </motion.div>

        <motion.h2
          className="text-[4.5vw] font-black text-[var(--color-text-primary)] leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          Cut through<br />the noise.
        </motion.h2>

        <motion.p
          className="mt-6 text-[2vw] text-[var(--color-text-secondary)]"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          Browse verified listings.<br />Find the perfect car.
        </motion.p>
      </div>
      
      <div className="relative w-[30vw] h-[60vh]">
        {/* Mock UI elements flying in */}
        <motion.div
          className="absolute right-0 top-10 w-[25vw] bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-4 border border-[var(--color-bg-muted)]"
          initial={{ x: '50vw', opacity: 0, rotate: 10 }}
          animate={phase >= 2 ? { x: 0, opacity: 1, rotate: 0 } : { x: '50vw', opacity: 0, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="w-full h-[15vh] bg-[var(--color-bg-muted)] rounded-xl overflow-hidden">
             <img src={`${import.meta.env.BASE_URL}images/clean-car.png`} className="w-full h-full object-cover" />
          </div>
          <div className="w-2/3 h-4 bg-[var(--color-text-primary)] rounded-full"></div>
          <div className="w-1/2 h-3 bg-[var(--color-text-muted)] rounded-full"></div>
          <div className="w-1/3 h-5 bg-[var(--color-primary)] rounded-full mt-2"></div>
        </motion.div>

        <motion.div
          className="absolute right-[5vw] top-[40vh] w-[25vw] bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-4 border border-[var(--color-bg-muted)]"
          initial={{ x: '50vw', opacity: 0, rotate: -5 }}
          animate={phase >= 3 ? { x: 0, opacity: 1, rotate: 0 } : { x: '50vw', opacity: 0, rotate: -5 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="w-full h-[15vh] bg-[var(--color-bg-muted)] rounded-xl"></div>
          <div className="w-2/3 h-4 bg-[var(--color-text-primary)] rounded-full"></div>
          <div className="w-1/2 h-3 bg-[var(--color-text-muted)] rounded-full"></div>
        </motion.div>
      </div>
    </motion.div>
  );
}
