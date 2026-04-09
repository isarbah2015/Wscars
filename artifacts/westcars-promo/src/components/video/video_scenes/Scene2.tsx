import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const WORDS = ['STRESSFUL.', 'UNCERTAIN.', 'OVERWHELMING.'];

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => setPhase(4), 1600),
      setTimeout(() => setPhase(5), 2400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center z-10"
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      exit={{ clipPath: 'inset(0 0 0 100%)', opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Ghanaian market image bg */}
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/market.png`}
          className="w-full h-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060e1a]/95 via-[#060e1a]/75 to-transparent" />
      </div>

      <div className="relative z-10 pl-[10vw] max-w-[55vw]">
        {/* Lead-in text */}
        <motion.p
          className="text-[1.6vw] text-white/50 tracking-[0.25em] uppercase mb-6"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.35, ease: 'circOut' }}
        >
          The old way of buying a car in Ghana
        </motion.p>

        {/* Impact words slam in */}
        {WORDS.map((word, i) => (
          <motion.div
            key={word}
            className="overflow-hidden"
            style={{ marginBottom: '0.4vw' }}
          >
            <motion.h2
              className="text-[7vw] font-black leading-none tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: i === 0 ? 'rgba(255,255,255,0.9)' : i === 1 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)',
              }}
              initial={{ y: '110%' }}
              animate={phase >= i + 2 ? { y: 0 } : { y: '110%' }}
              transition={{ type: 'spring', stiffness: 600, damping: 28, delay: 0 }}
            >
              {word}
            </motion.h2>
          </motion.div>
        ))}

        {/* Teal resolution line */}
        <motion.div
          className="mt-8 flex items-center gap-4"
          initial={{ opacity: 0, x: -40 }}
          animate={phase >= 5 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <div className="w-[3px] h-[4vw] bg-[#0EB5CA]" />
          <p className="text-[2.2vw] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            There's a better way.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
