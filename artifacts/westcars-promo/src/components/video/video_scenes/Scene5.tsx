import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2100),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #060e1a 0%, #004D5A 50%, #060e1a 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated radial pulse rings */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[#0EB5CA]/20"
          initial={{ width: '10vw', height: '10vw', opacity: 0.8 }}
          animate={{ width: `${38 + i * 14}vw`, height: `${38 + i * 14}vw`, opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i * 1.0, repeatDelay: 0 }}
        />
      ))}

      {/* Teal glow blob */}
      <motion.div
        className="absolute rounded-full blur-[80px]"
        style={{ width: '40vw', height: '40vw', background: 'radial-gradient(circle, #0EB5CA44, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Badge — very large, dominant */}
      <motion.div
        className="relative z-10 mb-10"
        initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.3, opacity: 0, rotate: -20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <img
          src={`${import.meta.env.BASE_URL}wc-badge-home.png`}
          alt="WestCars Logo"
          className="w-[32vw] object-contain"
          style={{ filter: 'drop-shadow(0 0 60px rgba(14,181,202,0.55)) drop-shadow(0 0 120px rgba(14,181,202,0.25))' }}
        />
      </motion.div>

      {/* Brand name */}
      <motion.div
        className="relative z-10 flex gap-1 mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      >
        {'WESTCARS'.split('').map((char, i) => (
          <span
            key={i}
            className={`text-[4.5vw] font-black tracking-tight ${i < 4 ? 'text-white' : 'text-[#0EB5CA]'}`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {char}
          </span>
        ))}
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="relative z-10 text-[1.6vw] text-white/50 tracking-[0.35em] uppercase mb-10"
        style={{ fontFamily: 'var(--font-body)' }}
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.6, ease: 'circOut' }}
      >
        Ghana's Trusted Car Marketplace
      </motion.p>

      {/* Download CTA pill */}
      <motion.div
        className="relative z-10 flex items-center gap-4"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={phase >= 4 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      >
        <div className="bg-[#0EB5CA] text-white px-[3.5vw] py-[1vw] rounded-full text-[1.6vw] font-black tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          DOWNLOAD THE APP
        </div>
      </motion.div>
    </motion.div>
  );
}
