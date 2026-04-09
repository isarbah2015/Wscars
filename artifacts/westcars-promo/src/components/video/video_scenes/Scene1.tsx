import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
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
      className="absolute inset-0 flex items-center justify-center bg-transparent z-10"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(100% at 50% 50%)' }}
      exit={{ clipPath: 'circle(0% at 50% 50%)' }}
      transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ 
            scale: phase >= 1 ? 1 : 0, 
            opacity: phase >= 1 ? 1 : 0,
            rotate: phase >= 1 ? 0 : -45,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-8"
        >
          <img src={`${import.meta.env.BASE_URL}wc-badge-home.png`} alt="WestCars Logo" className="w-[15vw] object-contain drop-shadow-2xl" />
        </motion.div>

        <motion.h1
          className="text-[6vw] font-black text-white leading-tight uppercase tracking-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          Ghana's Trusted
        </motion.h1>
        
        <motion.h1
          className="text-[6vw] font-black text-[var(--color-primary)] leading-tight uppercase tracking-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
        >
          Car Marketplace
        </motion.h1>

        <motion.div
          className="mt-8 h-1 bg-[var(--color-primary)]"
          initial={{ width: 0 }}
          animate={{ width: phase >= 3 ? '20vw' : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
