import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PhoneFrame } from '../PhoneFrame';

const SPECS = [
  { icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', label: 'Year', value: '2023', color: '#3B82F6', bg: '#EFF6FF' },
  { icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', label: 'Mileage', value: '12k km', color: '#22C55E', bg: '#F0FDF4' },
  { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', label: 'Fuel', value: 'Petrol', color: '#F59E0B', bg: '#FFFBEB' },
  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Gearbox', value: 'Automatic', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: 'M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z', label: 'Drive', value: 'AWD', color: '#0891B2', bg: '#E0F7FA' },
  { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', label: 'Condition', value: 'Used', color: '#EC4899', bg: '#FDF2F8' },
];

function CarDetailScreen() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setScrollY(1), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: '#EDF4F7', paddingTop: '8%' }}>
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white px-3 py-2 flex items-center gap-2 border-b border-gray-100 shadow-sm">
        <div className="w-6 h-6 rounded-lg bg-[#EDF4F7] flex items-center justify-center flex-shrink-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[8px] font-bold text-gray-900 truncate">Toyota Camry, 2023</div>
          <div className="text-[7px] text-[#0EB5CA] font-bold">GH₵ 185,000</div>
        </div>
        <div className="w-6 h-6 rounded-lg bg-[#EDF4F7] flex items-center justify-center flex-shrink-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>
      </div>

      <motion.div
        className="flex-1 overflow-hidden"
        animate={scrollY ? { y: '-32%' } : { y: 0 }}
        transition={{ duration: 2.8, ease: 'easeInOut', delay: 0.5 }}
      >
        {/* Hero image */}
        <div className="relative w-full" style={{ height: '28%' }}>
          <img src={`${import.meta.env.BASE_URL}images/clean-car.png`} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[6px] px-1.5 py-0.5 rounded-full">1 / 6</div>
          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {[0,1,2,3,4,5].map(i => <div key={i} className={`rounded-full ${i===0?'w-2.5 h-1.5 bg-white':'w-1.5 h-1.5 bg-white/50'}`} />)}
          </div>
        </div>

        {/* Main info card */}
        <div className="bg-white mx-0 px-3 py-2.5 border-b border-gray-100">
          <div className="text-[10px] font-black text-gray-900">Toyota Camry 2.5 XLE, 2023</div>
          <div className="flex items-center gap-1 mb-1.5">
            {[1,2,3,4,5].map(i => <svg key={i} width="7" height="7" viewBox="0 0 24 24" fill={i<=4?'#F59E0B':'#D1D5DB'} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
            <span className="text-[6px] text-gray-400 ml-0.5">4.8 (24)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-black text-gray-900">GH₵ 185,000</span>
            <span className="text-[7px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-bold">Fair price</span>
          </div>
          <div className="text-[6.5px] text-gray-400 mt-0.5">Credit from GH₵ 3,083/month</div>

          {/* History banner */}
          <div className="mt-2 rounded-xl px-2.5 py-2 flex items-center gap-2" style={{ background: 'rgba(14,181,202,0.07)', border: '1px solid rgba(14,181,202,0.2)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <div>
              <div className="text-[7px] font-bold text-gray-900">Car history — free</div>
              <div className="text-[6px] text-gray-400">Contact seller for full report</div>
            </div>
          </div>
        </div>

        {/* Spec grid */}
        <div className="bg-white mt-2 mx-0 px-3 py-2.5">
          <div className="text-[8px] font-bold text-gray-700 mb-2">Specifications</div>
          <div className="grid grid-cols-3 gap-2">
            {SPECS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center rounded-xl py-2" style={{ background: s.bg }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center mb-1" style={{ background: s.color + '20' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round"><path d={s.icon} /></svg>
                </div>
                <div className="text-[7.5px] font-bold text-gray-900">{s.value}</div>
                <div className="text-[6px] text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Seller card */}
        <div className="bg-white mt-2 mx-0 px-3 py-2.5">
          <div className="text-[8px] font-bold text-gray-700 mb-2">Seller</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0EB5CA]/20 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EB5CA" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-[8px] font-bold text-gray-900">Kwame Mensah</div>
              <div className="flex items-center gap-0.5">
                <svg width="7" height="7" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span className="text-[6.5px] text-gray-500">4.9 · 32 reviews · Accra</span>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-[#0EB5CA]/10 border border-[#0EB5CA]/30">
              <span className="text-[6px] font-bold text-[#0EB5CA]">Verified</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact bar */}
      <div className="bg-white border-t border-gray-100 px-3 py-2 flex gap-2 flex-shrink-0">
        <div className="flex-1 rounded-xl py-2 flex items-center justify-center gap-1 bg-[#0EB5CA]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span className="text-white text-[7px] font-bold">Message</span>
        </div>
        <div className="w-10 rounded-xl border border-gray-200 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div className="w-10 rounded-xl border border-[#25D366]/40 bg-[#25D366]/05 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#25D366" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
        </div>
      </div>
    </div>
  );
}

export function Scene4() {
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
      initial={{ clipPath: 'circle(0% at 80% 50%)' }}
      animate={{ clipPath: 'circle(150% at 80% 50%)' }}
      exit={{ clipPath: 'circle(0% at 80% 50%)' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Subtle teal tint left bg */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(14,181,202,0.05) 0%, transparent 60%)' }} />

      {/* Left: copy */}
      <div className="flex-1 flex flex-col justify-center pl-[8vw]">
        <motion.div
          className="inline-block bg-[#0EB5CA]/10 text-[#0EB5CA] text-[1vw] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-5 self-start"
          initial={{ opacity: 0, y: -15 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          Car Detail
        </motion.div>

        <motion.h2
          className="text-[4.2vw] font-black text-gray-900 leading-[1.05] mb-5"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 25 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.04 }}
        >
          Every detail.<br />Every spec.<br /><span className="text-[#0EB5CA]">Full picture.</span>
        </motion.h2>

        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 15 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          {['6-icon spec grid: year, km, fuel…', 'Verified seller profile & rating', 'Message · Call · WhatsApp — one tap'].map((txt) => (
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
          initial={{ x: '25vw', opacity: 0, rotate: 5 }}
          animate={phase >= 1 ? { x: 0, opacity: 1, rotate: -2 } : { x: '25vw', opacity: 0, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <PhoneFrame>
            <CarDetailScreen />
          </PhoneFrame>
        </motion.div>
      </div>
    </motion.div>
  );
}
