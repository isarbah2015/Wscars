import { motion } from 'framer-motion';

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tilt?: number;
}

export function PhoneFrame({ children, className = '', style, tilt = 0 }: PhoneFrameProps) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{
        width: '22vw',
        height: '44.5vw',
        transform: `rotate(${tilt}deg)`,
        ...style,
      }}
    >
      {/* Phone shell */}
      <div
        className="absolute inset-0 rounded-[3.5vw]"
        style={{
          background: 'linear-gradient(145deg, #2a2a3e 0%, #111122 60%, #1a1a2e 100%)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.08) inset',
        }}
      />
      {/* Side buttons */}
      <div className="absolute right-[-1.5%] top-[22%] w-[2.5%] h-[8%] rounded-r-full" style={{ background: '#2a2a3e' }} />
      <div className="absolute left-[-1.5%] top-[18%] w-[2.5%] h-[5%] rounded-l-full" style={{ background: '#2a2a3e' }} />
      <div className="absolute left-[-1.5%] top-[25%] w-[2.5%] h-[5%] rounded-l-full" style={{ background: '#2a2a3e' }} />
      {/* Screen bezel */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: '1.5%', left: '2.5%', right: '2.5%', bottom: '1.5%',
          borderRadius: '3vw',
          background: '#EDF4F7',
        }}
      >
        {/* Dynamic island */}
        <div
          className="absolute top-[1.2%] left-1/2 -translate-x-1/2 z-30"
          style={{
            width: '28%', height: '3.5%',
            background: '#111122',
            borderRadius: '1vw',
          }}
        />
        {children}
      </div>
      {/* Glare */}
      <div
        className="absolute inset-0 rounded-[3.5vw] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
