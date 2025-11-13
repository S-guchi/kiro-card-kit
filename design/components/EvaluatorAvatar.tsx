import { motion } from 'motion/react';
import { Brain } from 'lucide-react';

interface EvaluatorAvatarProps {
  name: string;
  color: string;
  isThinking?: boolean;
}

export function EvaluatorAvatar({ name, color, isThinking = false }: EvaluatorAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className="relative retro-panel pixel-corners p-2"
        style={{ borderColor: color, borderWidth: '2px' }}
        animate={isThinking ? {
          scale: [1, 1.08, 1],
        } : {}}
        transition={{
          duration: 1,
          repeat: isThinking ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <div
          className="w-10 h-10 rounded flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Brain className="w-5 h-5 text-white" />
        </div>
        
        {isThinking && (
          <motion.div
            className="absolute -top-1 -right-1 bg-retro-panel rounded-full p-0.5"
            style={{ borderColor: color, borderWidth: '2px' }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
            }}
          >
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
      
      <div className="text-center px-1" style={{ color, fontSize: '0.5rem', lineHeight: '1.1' }}>
        {name}
      </div>
    </div>
  );
}
