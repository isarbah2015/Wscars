import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function PhoneScreen() {
  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setScroll(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const cars = [
    { name: 'Toyota Camry 2023', price: 'GH₵ 185,000', fuel: 'Petrol', km: '12,500 km', badge: 'Verified', color: '#0EB5CA' },
    { name: 'Honda CR-V 2022', price: 'GH₵ 240,000', fuel: 'Hybrid', km: '8,200 km', badge: 'Premium', color: '#F59E0B' },
    { name: 'Hyundai Tucson 2023', price: 'GH₵ 210,000', fuel: 'Petrol', km: '5,100 km', badge: 'New', color: '#10B981' },
    { name: 'Kia Sportage 2022', price: 'GH₵ 195,000', fuel: 'Petrol', km: '18,000 km', badge: 'Verified', color: '#0EB5CA' },
  ];

  return (
    <div className="w-full h-full bg-[#EDF4F7] overflow-hidden flex flex-col">
      {/* App Header */}
      <div className="bg-white px-3 pt-8 pb-3 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <img src={`${import.meta.env.BASE_URL}wc-badge.png`} alt="WestCars" className="h-7 object-contain" />
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[#EDF4F7] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full border-2 border-[#0EB5CA]" />
            </div>
          </div>
        </div>
        {/* Search bar */}
        <div className="bg-[#EDF4F7] rounded-xl px-3 py-2 flex items-center gap-2 border border-[#0EB5CA]/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EB5CA" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="text-[10px] text-gray-400">Search cars, brands, models...</span>
        </div>
        {/* Category pills */}
        <div className="flex gap-2 mt-2 overflow-hidden">
          {['All Cars', 'SUV', 'Sedan', 'Pickup'].map((c, i) => (
            <div key={c} className={`px-3 py-1 rounded-full text-[9px] font-bold whitespace-nowrap flex-shrink-0 ${i === 0 ? 'bg-[#0EB5CA] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* Listing cards */}
      <motion.div
        className="flex-1 overflow-hidden px-3 py-2 flex flex-col gap-3"
        animate={scroll ? { y: '-28%' } : { y: 0 }}
        transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.3 }}
      >
        {cars.map((car) => (
          <div key={car.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
            <div className="h-[70px] bg-gradient-to-br from-[#EDF4F7] to-[#d4eaf0] relative overflow-hidden">
              <img
                src={`${import.meta.env.BASE_URL}images/clean-car.png`}
                className="absolute inset-0 w-full h-full object-cover"
                alt=""
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold text-white" style={{ background: car.color }}>
                {car.badge}
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="text-[11px] font-bold text-gray-900">{car.name}</div>
              <div className="text-[12px] font-black text-[#0EB5CA] mt-0.5">{car.price}</div>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[8px] text-gray-400 bg-[#EDF4F7] px-2 py-0.5 rounded-full">{car.fuel}</span>
                <span className="text-[8px] text-gray-400 bg-[#EDF4F7] px-2 py-0.5 rounded-full">{car.km}</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-gray-100 px-4 py-2 flex justify-around flex-shrink-0">
        {[
          { icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', active: true },
          { icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', active: false },
          { icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', active: false },
        ].map((nav, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={nav.active ? '#0EB5CA' : '#9CA3AF'} strokeWidth="2">
              <path d={nav.icon} />
            </svg>
            {nav.active && <div className="w-1 h-1 rounded-full bg-[#0EB5CA]" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 900),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-between px-[8vw] bg-white z-10"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: '-8vw' }}
      transition={{ duration: 0.5, ease: 'circOut' }}
    >
      {/* Left: headline copy */}
      <div className="flex-1 pr-[4vw]">
        <motion.div
          className="inline-block bg-[#0EB5CA]/10 text-[#0EB5CA] text-[1.2vw] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          The Solution
        </motion.div>

        <motion.h2
          className="text-[5vw] font-black text-gray-900 leading-[1.05] tracking-tight mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          Find your<br />
          <span className="text-[#0EB5CA]">perfect car</span><br />
          in minutes.
        </motion.h2>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {['Browse thousands of listings', 'Filter by brand, price & location', 'Message sellers instantly'].map((feat, i) => (
            <motion.div
              key={feat}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25, delay: i * 0.08 }}
            >
              <div className="w-5 h-5 rounded-full bg-[#0EB5CA] flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-[1.5vw] text-gray-600" style={{ fontFamily: 'var(--font-body)' }}>{feat}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right: Phone mockup */}
      <motion.div
        className="flex-shrink-0"
        initial={{ x: '30vw', opacity: 0, rotate: 8 }}
        animate={phase >= 1 ? { x: 0, opacity: 1, rotate: -3 } : { x: '30vw', opacity: 0, rotate: 8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {/* Phone shell */}
        <div
          className="relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.25)]"
          style={{
            width: '22vw',
            height: '44vw',
            borderRadius: '3.5vw',
            border: '0.6vw solid #1a1a2e',
            background: '#1a1a2e',
          }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-[3%] bg-[#1a1a2e] rounded-b-full z-20" />
          {/* Screen */}
          <div className="absolute inset-[0.3vw] rounded-[3vw] overflow-hidden bg-[#EDF4F7]">
            <PhoneScreen />
          </div>
          {/* Screen glare */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[3vw] pointer-events-none z-10" />
        </div>
      </motion.div>
    </motion.div>
  );
}
