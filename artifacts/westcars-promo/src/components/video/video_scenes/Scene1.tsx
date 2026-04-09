import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PhoneFrame } from '../PhoneFrame';

function SplashScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#EDF4F7] pt-[8%]">
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <img src={`${import.meta.env.BASE_URL}wc-badge.png`} alt="WestCars" className="w-[52%] object-contain" />
        <p className="text-[7px] text-[#6B7280] font-medium tracking-wide text-center px-4">Ghana's Trusted Car Marketplace</p>
      </div>
      <div className="pb-[12%] flex flex-col items-center gap-2">
        <div className="w-[45%] h-[6.5%] rounded-full bg-[#0EB5CA] flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">Browse Cars</span>
        </div>
        <div className="w-[45%] h-[6.5%] rounded-full border border-[#0EB5CA] flex items-center justify-center">
          <span className="text-[#0EB5CA] text-[8px] font-bold">Sign In</span>
        </div>
      </div>
    </div>
  );
}

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1300),
      setTimeout(() => setPhase(4), 2000),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      style={{ background: 'linear-gradient(160deg, #060e1a 0%, #003844 50%, #060e1a 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.5 }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(#0EB5CA 1px,transparent 1px),linear-gradient(90deg,#0EB5CA 1px,transparent 1px)',
        backgroundSize: '4vw 4vw',
      }} />

      {/* Glow */}
      <motion.div
        className="absolute rounded-full blur-[100px] pointer-events-none"
        style={{ width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(14,181,202,0.3), transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Left: brand + text */}
      <div className="flex flex-col items-start justify-center pl-[10vw] flex-1">
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, y: 30 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.3, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="mb-6"
        >
          <img
            src={`${import.meta.env.BASE_URL}wc-badge-home.png`}
            alt="WestCars"
            className="object-contain"
            style={{ width: '14vw', filter: 'drop-shadow(0 0 40px rgba(14,181,202,0.6))' }}
          />
        </motion.div>

        {/* WESTCARS */}
        <div className="flex overflow-hidden mb-3">
          {'WESTCARS'.split('').map((ch, i) => (
            <motion.span
              key={i}
              className={`text-[5.5vw] font-black leading-none tracking-tight ${i < 4 ? 'text-white' : 'text-[#0EB5CA]'}`}
              style={{ fontFamily: 'var(--font-display)' }}
              initial={{ y: '110%' }}
              animate={phase >= 2 ? { y: 0 } : { y: '110%' }}
              transition={{ type: 'spring', stiffness: 600, damping: 28, delay: i * 0.035 }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          className="text-[1.5vw] text-white/50 tracking-[0.3em] uppercase mb-8"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.6 }}
        >
          Ghana's Trusted Car Marketplace
        </motion.p>

        {/* Teal underline */}
        <motion.div
          className="h-[2px] bg-gradient-to-r from-[#0EB5CA] to-transparent"
          initial={{ width: 0 }}
          animate={phase >= 3 ? { width: '18vw' } : { width: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Right: phone showing splash */}
      <div className="flex-1 flex items-center justify-center pr-[6vw]">
        <motion.div
          initial={{ x: '30vw', opacity: 0, rotate: 8 }}
          animate={phase >= 2 ? { x: 0, opacity: 1, rotate: -2 } : { x: '30vw', opacity: 0, rotate: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <PhoneFrame>
            <SplashScreen />
          </PhoneFrame>
        </motion.div>
      </div>
    </motion.div>
  );
}
