import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PhoneFrame } from '../PhoneFrame';

const CARS = [
  { brand: 'Toyota Camry', year: 2023, price: 'GH₵ 185,000', km: '12,500 km', loc: 'Accra', tag: 'Verified', tagColor: '#0EB5CA', condition: 'Used' },
  { brand: 'Honda CR-V', year: 2022, price: 'GH₵ 240,000', km: '8,200 km', loc: 'Kumasi', tag: 'Tokunbo', tagColor: '#22C55E', condition: 'Used' },
  { brand: 'Hyundai Tucson', year: 2023, price: 'GH₵ 210,000', km: '5,100 km', loc: 'Tema', tag: 'New', tagColor: '#3B82F6', condition: 'New' },
  { brand: 'Kia Sportage', year: 2022, price: 'GH₵ 195,000', km: '18,000 km', loc: 'Accra', tag: 'Verified', tagColor: '#0EB5CA', condition: 'Used' },
];

const CATS = ['SUV / 4×4', 'Sedan', 'Hatchback', 'Pickup', 'Van'];

function HomeScreen() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setScrollY(1), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: '#EDF4F7', paddingTop: '8%' }}>
      {/* Sticky header */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm px-3 pt-1 pb-2 border-b border-gray-100 shadow-sm z-10">
        <div className="flex items-center justify-between mb-2">
          <img src={`${import.meta.env.BASE_URL}wc-badge.png`} alt="WestCars" style={{ height: 22 }} className="object-contain" />
          <div className="flex gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#EDF4F7] border border-gray-200 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#EDF4F7] border border-gray-200 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
          </div>
        </div>
        {/* Condition tabs */}
        <div className="flex gap-2 mb-2">
          {['Used', 'New', 'Moto'].map((c, i) => (
            <div key={c} className={`flex-1 py-1 rounded-lg text-center text-[8px] font-bold ${i === 0 ? 'bg-[#0EB5CA] text-white' : 'bg-[#EDF4F7] text-gray-500'}`}>{c}</div>
          ))}
        </div>
        {/* Category chips */}
        <div className="flex gap-1.5 overflow-hidden">
          {CATS.map((cat, i) => (
            <div key={cat} className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[7px] font-semibold border ${i === 0 ? 'bg-[#0EB5CA]/10 border-[#0EB5CA]/40 text-[#0EB5CA]' : 'bg-white border-gray-200 text-gray-500'}`}>{cat}</div>
          ))}
        </div>
      </div>

      {/* Brand banner */}
      <div className="mx-3 mt-2 mb-2 rounded-xl overflow-hidden flex-shrink-0" style={{ height: '14%', background: 'linear-gradient(90deg, #0EB5CA, #007A8C)' }}>
        <div className="flex items-center h-full px-3 gap-2">
          <img src={`${import.meta.env.BASE_URL}wc-badge-home.png`} alt="" style={{ height: '70%' }} className="object-contain" />
          <div>
            <div className="text-white text-[9px] font-black">WestCars</div>
            <div className="text-white/75 text-[7px]">Ghana's Car Marketplace</div>
          </div>
        </div>
      </div>

      {/* Car grid */}
      <motion.div
        className="flex-1 px-2 overflow-hidden"
        animate={scrollY ? { y: '-28%' } : { y: 0 }}
        transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-2 pb-3">
          {CARS.map((car) => (
            <div key={car.brand} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative" style={{ height: 60 }}>
                <img src={`${import.meta.env.BASE_URL}images/clean-car.png`} className="w-full h-full object-cover" alt="" />
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-white text-[7px] font-bold" style={{ background: car.tagColor }}>{car.tag}</div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-[8px] font-bold text-gray-900 leading-tight truncate">{car.brand}</div>
                <div className="text-[9px] font-black text-[#0EB5CA]">{car.price}</div>
                <div className="flex gap-1 mt-1">
                  <span className="text-[6px] text-gray-400 bg-[#EDF4F7] px-1 py-0.5 rounded">{car.year}</span>
                  <span className="text-[6px] text-gray-400 bg-[#EDF4F7] px-1 py-0.5 rounded">{car.km}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-gray-100 flex justify-around py-2 flex-shrink-0">
        {[
          { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', active: true },
          { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', active: false },
          { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', active: false },
          { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', active: false },
        ].map((n, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={n.active ? '#0EB5CA' : '#9CA3AF'} strokeWidth="2"><path d={n.d} /></svg>
            {n.active && <div className="w-1 h-1 rounded-full bg-[#0EB5CA]" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 450),
      setTimeout(() => setPhase(3), 800),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center bg-white z-10"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(100% 0 0 0)', opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Right: phone */}
      <div className="flex-1 flex items-center justify-center pl-[6vw]">
        <motion.div
          initial={{ x: '-20vw', opacity: 0, rotate: -6 }}
          animate={phase >= 1 ? { x: 0, opacity: 1, rotate: 2 } : { x: '-20vw', opacity: 0, rotate: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <PhoneFrame>
            <HomeScreen />
          </PhoneFrame>
        </motion.div>
      </div>

      {/* Left: copy */}
      <div className="flex-1 flex flex-col justify-center pr-[8vw]">
        <motion.div
          className="inline-block bg-[#0EB5CA]/10 text-[#0EB5CA] text-[1vw] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-5 self-start"
          initial={{ opacity: 0, y: -15 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          Home
        </motion.div>

        <motion.h2
          className="text-[4.2vw] font-black text-gray-900 leading-[1.05] mb-5"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 25 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.05 }}
        >
          Every car<br />in Ghana,<br /><span className="text-[#0EB5CA]">one tap away.</span>
        </motion.h2>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 15 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          {['New, Used & Moto in one place', 'Browse by category & condition', '10,000+ active listings'].map((txt, i) => (
            <div key={txt} className="flex items-center gap-2.5">
              <div className="w-[18px] h-[18px] rounded-full bg-[#0EB5CA] flex items-center justify-center flex-shrink-0">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span className="text-[1.35vw] text-gray-600" style={{ fontFamily: 'var(--font-body)' }}>{txt}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
