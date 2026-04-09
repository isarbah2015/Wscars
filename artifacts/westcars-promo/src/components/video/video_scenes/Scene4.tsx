import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const STATS = [
  { value: '10,000+', label: 'Car Listings', sub: 'Updated daily' },
  { value: '100%', label: 'Verified Sellers', sub: 'Identity confirmed' },
  { value: '24/7', label: 'Secure Chat', sub: 'Message anytime' },
];

const FEATURES = [
  { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'VIN Verification' },
  { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', text: 'Location Filters' },
  { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', text: 'Save Favourites' },
  { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', text: 'Price Alerts' },
];

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 400),
      setTimeout(() => setPhase(3), 700),
      setTimeout(() => setPhase(4), 1000),
      setTimeout(() => setPhase(5), 1400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #004D5A 0%, #0EB5CA 60%, #007A8C 100%)' }}
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)',
        backgroundSize: '5vw 5vw',
      }} />

      {/* Label */}
      <motion.p
        className="text-white/60 text-[1.3vw] tracking-[0.3em] uppercase mb-8 font-bold"
        style={{ fontFamily: 'var(--font-body)' }}
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      >
        Why WestCars?
      </motion.p>

      {/* Stats row */}
      <div className="flex gap-[4vw] mb-10">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 50, scale: 0.7 }}
            animate={phase >= i + 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 600, damping: 22 }}
          >
            <div
              className="text-[5.5vw] font-black text-white leading-none"
              style={{ fontFamily: 'var(--font-display)', textShadow: '0 0 40px rgba(255,255,255,0.3)' }}
            >
              {stat.value}
            </div>
            <div className="text-[1.6vw] font-bold text-white/90 mt-1" style={{ fontFamily: 'var(--font-display)' }}>
              {stat.label}
            </div>
            <div className="text-[1.1vw] text-white/50 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
              {stat.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <motion.div
        className="h-[1px] bg-white/20 mb-8"
        initial={{ width: 0 }}
        animate={phase >= 4 ? { width: '50vw' } : { width: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Feature pills */}
      <motion.div
        className="flex gap-3 flex-wrap justify-center px-[10vw]"
        initial={{ opacity: 0 }}
        animate={phase >= 5 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {FEATURES.map((feat, i) => (
          <motion.div
            key={feat.text}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={phase >= 5 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25, delay: i * 0.06 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d={feat.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white text-[1.2vw] font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
              {feat.text}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
