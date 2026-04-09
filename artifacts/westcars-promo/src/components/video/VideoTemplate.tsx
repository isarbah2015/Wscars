import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  intro: 4500,
  home: 5000,
  search: 4500,
  detail: 5000,
  close: 5000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
  const isDark = currentScene === 0 || currentScene === 4;

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: isDark ? '#060e1a' : '#fff' }}>

      {/* Persistent video background — dark scenes only */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        animate={{ opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <video
          src={`${import.meta.env.BASE_URL}videos/hero-bg.mp4`}
          autoPlay loop muted playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#060e1a]/75" />
      </motion.div>

      {/* Persistent teal glow orb — morphs across scenes */}
      <motion.div
        className="absolute rounded-full blur-[100px] pointer-events-none z-0"
        style={{ width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(14,181,202,0.25), transparent 70%)' }}
        animate={{
          x: ['-10vw', '60vw', '-5vw', '65vw', '30vw'][currentScene],
          y: ['10vh', '5vh', '60vh', '20vh', '30vh'][currentScene],
          opacity: isDark ? 0.8 : 0.15,
          scale: [1.5, 0.8, 1.2, 0.7, 1.0][currentScene],
        }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Scene content */}
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="intro" />}
        {currentScene === 1 && <Scene2 key="home" />}
        {currentScene === 2 && <Scene3 key="search" />}
        {currentScene === 3 && <Scene4 key="detail" />}
        {currentScene === 4 && <Scene5 key="close" />}
      </AnimatePresence>
    </div>
  );
}
