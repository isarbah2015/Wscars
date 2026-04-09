import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  scene1: 4000,
  scene2: 4500,
  scene3: 4000,
  scene4: 4000,
  scene5: 4500,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--color-bg-dark)]">
      
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute inset-0 opacity-80"
          animate={{
            opacity: [0, 1, 2, 4].includes(currentScene) ? 1 : 0.2,
          }}
          transition={{ duration: 1 }}
        >
          {currentScene <= 1 && (
             <video 
               src={`${import.meta.env.BASE_URL}videos/hero-bg.mp4`} 
               autoPlay loop muted playsInline 
               className="w-full h-full object-cover"
             />
          )}
          {currentScene === 2 && (
             <img 
               src={`${import.meta.env.BASE_URL}images/market.png`} 
               className="w-full h-full object-cover opacity-30" 
             />
          )}
        </motion.div>
      </div>

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
