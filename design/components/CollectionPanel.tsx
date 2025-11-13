import { motion } from 'motion/react';
import { CardData, Rarity } from '../types/card';
import { useRef } from 'react';

interface CollectionPanelProps {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}

const rarityColors: Record<Rarity, string> = {
  Common: '#9ca3af',
  Rare: '#60a5fa',
  Epic: '#a78bfa',
  Legendary: '#fbbf24',
};

export function CollectionPanel({ cards, onCardClick }: CollectionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <p className="text-xs text-retro-muted mb-2 text-center">
        コレクション ({cards.length}/100)
      </p>
      
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-retro-accent) var(--color-retro-panel)',
        }}
      >
        {cards.length === 0 ? (
          <div className="text-center text-retro-muted w-full py-4" style={{ fontSize: '0.6rem' }}>
            まだカードがありません
          </div>
        ) : (
          cards.map((card, index) => (
            <motion.button
              key={card.id}
              className="flex-shrink-0 retro-panel pixel-corners overflow-hidden"
              style={{ 
                borderColor: rarityColors[card.rarity],
                borderWidth: '2px',
                width: '80px',
                height: '80px',
              }}
              onClick={() => onCardClick(card)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-full h-full">
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
                {/* Rarity indicator */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-center"
                  style={{
                    backgroundColor: rarityColors[card.rarity],
                    fontSize: '0.5rem',
                  }}
                >
                  {card.rarity[0]}
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
