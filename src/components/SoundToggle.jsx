import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SoundToggle({ isMuted, toggleMute }) {
  return (
    <motion.button
      onClick={toggleMute}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full 
        bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]
        backdrop-blur-md flex items-center justify-center
        text-[#8B93A7] hover:text-[#4FF2E8] hover:border-[rgba(79,242,232,0.2)]
        transition-colors duration-300 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </motion.button>
  );
}
