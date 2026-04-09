import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-dark)] z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background glow */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] opacity-30"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.3 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 2, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 2, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-12"
        >
          <img src={`${import.meta.env.BASE_URL}wc-badge-home.png`} alt="WestCars Logo" className="w-[20vw] drop-shadow-[0_0_30px_rgba(14,181,202,0.5)]" />
        </motion.div>

        <motion.h2
          className="text-[4vw] font-black text-white tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Ghana's Trusted Car Marketplace
        </motion.h2>

        <motion.div
          className="mt-12 bg-[var(--color-primary)] text-white px-[4vw] py-[1.5vw] rounded-full text-[2vw] font-bold tracking-wider"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
        >
          DOWNLOAD THE APP
        </motion.div>
      </div>
    </motion.div>
  );
}
