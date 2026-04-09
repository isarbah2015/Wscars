import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PhoneFrame } from '../PhoneFrame';

const CHIPS = [
  { label: 'All', color: '#0EB5CA' },
  { label: 'SUV', color: '#818CF8' },
  { label: 'Sedan', color: '#F472B6' },
  { label: 'Tokunbo', color: '#22C55E' },
  { label: 'Budget', color: '#F59E0B' },
  { label: 'Luxury', color: '#A855F7' },
];

const LISTINGS = [
  { brand: 'Mercedes-Benz GLE', year: 2022, price: 'GH₵ 480,000', loc: 'Airport, Accra', km: '22,000 km', tag: 'Luxury', tagColor: '#A855F7', rating: '4.9' },
  { brand: 'Toyota Land Cruiser', year: 2021, price: 'GH₵ 620,000', loc: 'East Legon', km: '35,000 km', tag: 'Tokunbo', tagColor: '#22C55E', rating: '4.7' },
  { brand: 'Ford Ranger Raptor', year: 2023, price: 'GH₵ 340,000', loc: 'Tema', km: '8,500 km', tag: 'New', tagColor: '#3B82F6', rating: '4.8' },
];

function SearchScreen() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setScrollY(1), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: '#EDF4F7', paddingTop: '8%' }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white px-3 pt-1 pb-2 shadow-sm">
        <div className="text-[10px] font-black text-gray-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Browse Cars</div>
        {/* Search input */}
        <div className="flex items-center gap-2 bg-[#EDF4F7] rounded-xl px-3 py-2 border border-[#0EB5CA]/20 mb-2">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0EB5CA" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span className="text-[8px] text-gray-400">Search brand, model, location…</span>
          <div className="ml-auto bg-[#0EB5CA] rounded-lg px-2 py-0.5">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
          </div>
        </div>
        {/* Quick filter chips */}
        <div className="flex gap-1.5 overflow-hidden">
          {CHIPS.map((chip, i) => (
            <div
              key={chip.label}
              className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-[7px] font-bold"
              style={i === 0
                ? { background: chip.color, color: 'white' }
                : { background: chip.color + '18', color: chip.color, border: `1px solid ${chip.color}40` }
              }
            >
              {chip.label}
            </div>
          ))}
        </div>
      </div>

      {/* Results label */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0">
        <span className="text-[7px] text-gray-500 font-medium">2,840 results</span>
        <div className="flex items-center gap-1 text-[7px] text-[#0EB5CA] font-bold">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0EB5CA" strokeWidth="2"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
          Sort
        </div>
      </div>

      {/* Listing cards — full width */}
      <motion.div
        className="flex-1 overflow-hidden px-3 flex flex-col gap-2.5"
        animate={scrollY ? { y: '-35%' } : { y: 0 }}
        transition={{ duration: 2.8, ease: 'easeInOut', delay: 0.4 }}
      >
        {LISTINGS.map((car) => (
          <div key={car.brand} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-shrink-0">
            {/* Car image */}
            <div className="relative flex-shrink-0" style={{ width: '35%', minHeight: 80 }}>
              <img src={`${import.meta.env.BASE_URL}images/clean-car.png`} className="w-full h-full object-cover" alt="" />
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-white text-[6px] font-bold" style={{ background: car.tagColor }}>{car.tag}</div>
            </div>
            {/* Details */}
            <div className="flex-1 px-2.5 py-2">
              <div className="text-[8px] font-bold text-gray-900 leading-tight">{car.brand}</div>
              <div className="text-[7px] text-gray-400 mb-1">{car.year} · {car.km}</div>
              <div className="text-[10px] font-black text-[#0EB5CA]">{car.price}</div>
              <div className="flex items-center gap-1 mt-1.5">
                <svg width="7" height="7" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span className="text-[7px] text-gray-500">{car.rating}</span>
                <span className="text-[6px] text-gray-300 mx-0.5">·</span>
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg>
                <span className="text-[7px] text-gray-400">{car.loc}</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-gray-100 flex justify-around py-2 flex-shrink-0">
        {[
          { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', active: false },
          { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', active: true },
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

export function Scene3() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 450),
      setTimeout(() => setPhase(3), 850),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center z-10"
      style={{ background: '#f8fafc' }}
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      exit={{ clipPath: 'inset(0 0 0 100%)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Soft gradient bg */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(14,181,202,0.06) 0%, transparent 60%)' }} />

      {/* Left: copy */}
      <div className="flex-1 flex flex-col justify-center pl-[8vw]">
        <motion.div
          className="inline-block bg-[#0EB5CA]/10 text-[#0EB5CA] text-[1vw] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-5 self-start"
          initial={{ opacity: 0, y: -15 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          Search & Browse
        </motion.div>

        <motion.h2
          className="text-[4.2vw] font-black text-gray-900 leading-[1.05] mb-5"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 25 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.04 }}
        >
          Find exactly<br />what you're<br /><span className="text-[#0EB5CA]">looking for.</span>
        </motion.h2>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 15 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          {['Smart filters: brand, city, price', 'Colorful quick-tags (SUV, Luxury…)', 'Sort by date, price or mileage'].map((txt) => (
            <div key={txt} className="flex items-center gap-2.5">
              <div className="w-[18px] h-[18px] rounded-full bg-[#0EB5CA] flex items-center justify-center flex-shrink-0">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span className="text-[1.35vw] text-gray-600" style={{ fontFamily: 'var(--font-body)' }}>{txt}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right: phone */}
      <div className="flex-1 flex items-center justify-center pr-[6vw]">
        <motion.div
          initial={{ x: '25vw', opacity: 0, rotate: 6 }}
          animate={phase >= 1 ? { x: 0, opacity: 1, rotate: -2 } : { x: '25vw', opacity: 0, rotate: 6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <PhoneFrame>
            <SearchScreen />
          </PhoneFrame>
        </motion.div>
      </div>
    </motion.div>
  );
}
