import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Sparkles } from 'lucide-react';
import { CardData } from '../types/card';

interface CardModalProps {
  card: CardData;
  isOpen: boolean;
  onClose: () => void;
}

const attributeConfig = {
  Fire: { color: '#ff6b6b', icon: '🔥', bg: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)' },
  Nature: { color: '#51cf66', icon: '🌿', bg: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)' },
  Machine: { color: '#748ffc', icon: '⚙️', bg: 'linear-gradient(135deg, #748ffc 0%, #5c7cfa 100%)' },
  Cosmic: { color: '#cc5de8', icon: '✨', bg: 'linear-gradient(135deg, #cc5de8 0%, #be4bdb 100%)' },
};

const rarityConfig = {
  Common: { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.4)' },
  Rare: { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.6)' },
  Epic: { color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.7)' },
  Legendary: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.8)' },
};

export function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const attrConfig = attributeConfig[card.attribute];
  const rarityConf = rarityConfig[card.rarity];

  const handleExport = () => {
    console.log('Exporting card:', card);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-sm"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Legendary sparkle effect */}
            {card.rarity === 'Legendary' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos((i * Math.PI * 2) / 8) * 150],
                      y: [0, Math.sin((i * Math.PI * 2) / 8) * 150],
                      opacity: [1, 0],
                      scale: [0, 1.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: rarityConf.color }} />
                  </motion.div>
                ))}
              </>
            )}

            {/* Card */}
            <div
              className="relative aspect-[2/3] retro-panel pixel-corners overflow-hidden"
              style={{
                borderWidth: '4px',
                borderColor: rarityConf.color,
                boxShadow: `0 0 40px ${rarityConf.glow}`,
              }}
            >
              {/* Background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: attrConfig.bg }}
              />

              {/* Top buttons */}
              <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
                <button
                  onClick={handleExport}
                  className="p-2 retro-button pixel-corners"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 retro-button pixel-corners"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card content */}
              <div className="relative h-full flex flex-col p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-3 mt-8">
                  <div
                    className="px-3 py-1 pixel-corners text-xs"
                    style={{
                      backgroundColor: rarityConf.color,
                      border: '2px solid white',
                    }}
                  >
                    {card.rarity}
                  </div>
                  <div className="text-2xl">{attrConfig.icon}</div>
                </div>

                {/* Card name */}
                <h2
                  className="mb-4 text-center"
                  style={{ 
                    color: attrConfig.color, 
                    textShadow: '2px 2px 0 black',
                    fontSize: '1rem',
                  }}
                >
                  {card.name}
                </h2>

                {/* Image */}
                <div className="flex-1 mb-4 retro-panel pixel-corners overflow-hidden bg-black/50">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Attribute */}
                <div className="mb-3">
                  <div
                    className="px-3 py-2 pixel-corners text-center"
                    style={{
                      backgroundColor: attrConfig.color,
                      border: '2px solid white',
                    }}
                  >
                    <p className="text-xs">{card.attribute}</p>
                  </div>
                </div>

                {/* Flavor text */}
                <div
                  className="retro-panel pixel-corners p-3 bg-black/70"
                  style={{ borderColor: attrConfig.color }}
                >
                  <p className="text-xs italic leading-relaxed">{card.flavorText}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
