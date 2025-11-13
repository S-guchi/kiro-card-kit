import { motion } from 'motion/react';

interface SpeechBubbleProps {
  message: string;
  color: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function SpeechBubble({ message, color, position }: SpeechBubbleProps) {
  const positionStyles = {
    'top-left': 'left-0 top-full mt-2',
    'top-right': 'right-0 top-full mt-2',
    'bottom-left': 'left-0 bottom-full mb-2',
    'bottom-right': 'right-0 bottom-full mb-2',
  };

  const tailPosition = {
    'top-left': 'left-4 -top-1.5',
    'top-right': 'right-4 -top-1.5',
    'bottom-left': 'left-4 -bottom-1.5',
    'bottom-right': 'right-4 -bottom-1.5',
  };

  return (
    <motion.div
      className={`absolute ${positionStyles[position]} z-20`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="relative retro-panel pixel-corners p-2 max-w-[150px]"
        style={{ borderColor: color, borderWidth: '2px' }}
      >
        <p className="whitespace-pre-wrap break-words" style={{ fontSize: '0.6rem', lineHeight: '1.3' }}>
          {message}
        </p>
        
        {/* Speech bubble tail */}
        <div
          className={`absolute w-2 h-2 ${tailPosition[position]}`}
          style={{
            backgroundColor: 'var(--color-retro-panel)',
            border: `2px solid ${color}`,
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    </motion.div>
  );
}