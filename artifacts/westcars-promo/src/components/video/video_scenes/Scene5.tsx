import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PhoneFrame } from '../PhoneFrame';

function MiniSplash() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#EDF4F7] pt-[8%]">
      <div className="flex flex-col items-center justify-center gap-2">
        <img src={`${import.meta.env.BASE_URL}wc-badge.png`} alt="WestCars" className="w-[55%] object-contain" />
        <p className="text-[6.5px] text-[#6B7280] font-medium text-center">Ghana's Trusted Car Marketplace</p>
      </div>
    </div>
  );
}

function MiniSearch() {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: '#EDF4F7', paddingTop: '8%' }}>
      <div className="flex-shrink-0 bg-white px-2 pt-1 pb-2 shadow-sm">
        <div className="flex items-center gap-1.5 bg-[#EDF4F7] rounded-lg px-2 py-1.5">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0EB5CA" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span className="text-[6px] text-gray-400">Search cars…</span>
        </div>
        <div className="flex gap-1 mt-1.5 overflow-hidden">
          {['All','SUV','Sedan','Tokunbo'].map((c,i) => (
            <div key={c} className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[5.5px] font-bold" style={i===0?{background:'#0EB5CA',color:'white'}:{background:'#818CF8'+(i===1?'20':'15'),color:['#0EB5CA','#818CF8','#F472B6','#22C55E'][i]}}>{c}</div>
          ))}
        </div>
      </div>
      <div className="flex-1 px-2 pt-2 flex flex-col gap-2">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-xl flex overflow-hidden shadow-sm h-[20%]">
            <div className="w-[35%] bg-[#EDF4F7]"><img src={`${import.meta.env.BASE_URL}images/clean-car.png`} className="w-full h-full object-cover" alt="" /></div>
            <div className="flex-1 px-2 py-1.5">
              <div className="w-[70%] h-1.5 bg-gray-200 rounded mb-1" />
              <div className="w-[50%] h-2 bg-[#0EB5CA]/30 rounded mb-1" />
              <div className="w-[40%] h-1 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniDetail() {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: '#EDF4F7', paddingTop: '8%' }}>
      <div className="flex-shrink-0 bg-white px-2 py-1.5 flex items-center gap-1.5 border-b border-gray-100">
        <div className="w-5 h-5 rounded-md bg-[#EDF4F7] flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
        <div><div className="text-[7px] font-bold text-gray-900">Honda CR-V, 2022</div><div className="text-[6px] text-[#0EB5CA] font-bold">GH₵ 240,000</div></div>
      </div>
      <div style={{ height: '28%' }} className="relative flex-shrink-0">
        <img src={`${import.meta.env.BASE_URL}images/clean-car.png`} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="bg-white flex-1 px-2 py-2">
        <div className="text-[7.5px] font-black text-gray-900 mb-0.5">Honda CR-V 1.5T, 2022</div>
        <div className="text-[11px] font-black text-gray-900 mb-1">GH₵ 240,000</div>
        <div className="grid grid-cols-3 gap-1">
          {['2022','8k km','Hybrid','Auto','AWD','White'].map((v,i) => (
            <div key={i} className="flex flex-col items-center text-center rounded-lg py-1" style={{background:['#EFF6FF','#F0FDF4','#FFFBEB','#F5F3FF','#E0F7FA','#FDF2F8'][i]}}>
              <div className="text-[6px] font-bold text-gray-900">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1">
          <div className="flex-1 rounded-lg py-1.5 bg-[#0EB5CA] flex items-center justify-center">
            <span className="text-white text-[6px] font-bold">Message</span>
          </div>
          <div className="w-7 rounded-lg border border-gray-200 flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Scene5() {
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
      className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #060e1a 0%, #003844 50%, #060e1a 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Pulse rings */}
      {[0,1,2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[#0EB5CA]/15"
          initial={{ width: '8vw', height: '8vw', opacity: 0.6 }}
          animate={{ width: `${42+i*16}vw`, height: `${42+i*16}vw`, opacity: 0 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut', delay: i * 1.1 }}
        />
      ))}

      {/* Three phones fanning */}
      <div className="relative flex items-center justify-center mb-8" style={{ width: '70vw', height: '35vw' }}>
        {/* Left phone */}
        <motion.div
          className="absolute"
          style={{ left: '4%', zIndex: 1 }}
          initial={{ x: 0, opacity: 0, scale: 0.85 }}
          animate={phase >= 1 ? { x: 0, opacity: 0.7, scale: 0.85 } : { x: 0, opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <PhoneFrame tilt={-8} style={{ width: '18vw', height: '36vw' }}>
            <MiniSearch />
          </PhoneFrame>
        </motion.div>

        {/* Center phone — hero */}
        <motion.div
          className="absolute"
          style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={phase >= 1 ? { y: 0, opacity: 1, scale: 1 } : { y: 20, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <PhoneFrame tilt={0} style={{ width: '20vw', height: '40vw' }}>
            <MiniSplash />
          </PhoneFrame>
        </motion.div>

        {/* Right phone */}
        <motion.div
          className="absolute"
          style={{ right: '4%', zIndex: 1 }}
          initial={{ x: 0, opacity: 0, scale: 0.85 }}
          animate={phase >= 1 ? { x: 0, opacity: 0.7, scale: 0.85 } : { x: 0, opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.06 }}
        >
          <PhoneFrame tilt={8} style={{ width: '18vw', height: '36vw' }}>
            <MiniDetail />
          </PhoneFrame>
        </motion.div>
      </div>

      {/* Brand lockup */}
      <div className="flex flex-col items-center">
        <motion.div
          className="flex gap-0.5 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          {'WESTCARS'.split('').map((ch, i) => (
            <span
              key={i}
              className={`text-[4vw] font-black leading-none tracking-tight ${i < 4 ? 'text-white' : 'text-[#0EB5CA]'}`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {ch}
            </span>
          ))}
        </motion.div>

        <motion.p
          className="text-[1.4vw] text-white/50 tracking-[0.3em] uppercase mb-8"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.6 }}
        >
          Ghana's Trusted Car Marketplace
        </motion.p>

        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        >
          <div className="bg-[#0EB5CA] text-white px-[3vw] py-[0.8vw] rounded-full text-[1.3vw] font-black tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            AVAILABLE ON ANDROID & iOS
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
