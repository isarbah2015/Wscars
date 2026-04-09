import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CHARS_1 = "WEST".split('');
const CHARS_2 = "CARS".split('');

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => setPhase(4), 1800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Dark overlay on video bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060e1a]/80 via-[#060e1a]/60 to-[#060e1a]/90 z-0" />

      {/* Teal accent ring behind badge */}
      <motion.div
        className="absolute rounded-full border-2 border-[#0EB5CA]/30"
        initial={{ width: '15vw', height: '15vw', opacity: 0 }}
        animate={phase >= 1 ? { width: '38vw', height: '38vw', opacity: 0.5 } : { width: '15vw', height: '15vw', opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute rounded-full border border-[#0EB5CA]/15"
        initial={{ width: '10vw', height: '10vw', opacity: 0 }}
        animate={phase >= 1 ? { width: '52vw', height: '52vw', opacity: 0.3 } : { width: '10vw', height: '10vw', opacity: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />

      {/* BADGE — big, prominent */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ scale: 0.2, opacity: 0, rotate: -30 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.2, opacity: 0, rotate: -30 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      >
        <img
          src={`${import.meta.env.BASE_URL}wc-badge-home.png`}
          alt="WestCars"
          className="w-[28vw] object-contain drop-shadow-[0_0_60px_rgba(14,181,202,0.6)]"
        />
      </motion.div>

      {/* Kinetic type — WESTCARS */}
      <div className="relative z-10 flex gap-[0.15vw] mb-4">
        {[...CHARS_1, ...CHARS_2].map((char, i) => (
          <motion.span
            key={i}
            className={`text-[6vw] font-black leading-none tracking-tight ${i < 4 ? 'text-white' : 'text-[#0EB5CA]'}`}
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, y: 60, rotateX: -50 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 60, rotateX: -50 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22, delay: phase >= 2 ? i * 0.04 : 0 }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Tagline */}
      <motion.p
        className="relative z-10 text-[1.8vw] text-white/60 tracking-[0.3em] uppercase"
        style={{ fontFamily: 'var(--font-body)' }}
        initial={{ opacity: 0, filter: 'blur(12px)' }}
        animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(12px)' }}
        transition={{ duration: 0.7, ease: 'circOut' }}
      >
        Ghana's Trusted Car Marketplace
      </motion.p>

      {/* Accent bar */}
      <motion.div
        className="relative z-10 mt-6 h-[2px] bg-gradient-to-r from-transparent via-[#0EB5CA] to-transparent"
        initial={{ width: 0, opacity: 0 }}
        animate={phase >= 4 ? { width: '24vw', opacity: 1 } : { width: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}
