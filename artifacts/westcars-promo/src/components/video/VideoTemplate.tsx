import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  scene1: 4000,
  scene2: 3500,
  scene3: 4500,
  scene4: 4000,
  scene5: 4500,
};

const ACCENT_X = ['45vw', '8vw', '70vw', '20vw', '50vw'];
const ACCENT_Y = ['42vh', '15vh', '55vh', '75vh', '30vh'];
const ACCENT_SCALE = [2.8, 0.8, 1.5, 0.6, 2.0];
const ACCENT_OPACITY = [0.7, 0.5, 0.6, 0.4, 0.8];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
  const isDark = currentScene === 0 || currentScene === 1 || currentScene === 3 || currentScene === 4;

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#060e1a' }}>

      {/* Persistent video background — Scenes 0 & 1 */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        animate={{ opacity: currentScene <= 1 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <video
          src={`${import.meta.env.BASE_URL}videos/hero-bg.mp4`}
          autoPlay loop muted playsInline
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Persistent floating accent orb — morphs position/scale across scenes */}
      <motion.div
        className="absolute rounded-full blur-[80px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #0EB5CA55, transparent 70%)', width: '30vw', height: '30vw' }}
        animate={{
          x: ACCENT_X[currentScene],
          y: ACCENT_Y[currentScene],
          scale: ACCENT_SCALE[currentScene],
          opacity: isDark ? ACCENT_OPACITY[currentScene] : 0.15,
        }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Persistent thin teal accent line — travels across scenes */}
      <motion.div
        className="absolute h-[2px] pointer-events-none z-0"
        style={{ background: 'linear-gradient(90deg, transparent, #0EB5CA, transparent)' }}
        animate={{
          left: ['10%', '5%', '50%', '30%', '20%'][currentScene],
          width: ['40%', '60%', '30%', '50%', '45%'][currentScene],
          top: ['50%', '12%', '88%', '25%', '68%'][currentScene],
          opacity: currentScene === 2 ? 0 : 0.6,
        }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Scene-specific foreground */}
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="s1" />}
        {currentScene === 1 && <Scene2 key="s2" />}
        {currentScene === 2 && <Scene3 key="s3" />}
        {currentScene === 3 && <Scene4 key="s4" />}
        {currentScene === 4 && <Scene5 key="s5" />}
      </AnimatePresence>
    </div>
  );
}
