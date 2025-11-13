import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, RotateCcw } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { EvaluatorAvatar } from './components/EvaluatorAvatar';
import { SpeechBubble } from './components/SpeechBubble';
import { CardModal } from './components/CardModal';
import { CollectionPanel } from './components/CollectionPanel';
import { defaultEvaluators } from './data/evaluators';
import { CardData, DiscussionMessage } from './types/card';
import { mockVisionAnalysis, mockEvaluatorResponse, generateMockCard } from './utils/mockAI';

type Phase = 'idle' | 'analyzing' | 'discussing' | 'complete';

export default function App() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [generatedCard, setGeneratedCard] = useState<CardData | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [collection, setCollection] = useState<CardData[]>([]);

  // Load collection from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('kiro-card-collection');
    if (stored) {
      try {
        setCollection(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load collection:', e);
      }
    }
  }, []);

  // Save collection to localStorage
  useEffect(() => {
    if (collection.length > 0) {
      localStorage.setItem('kiro-card-collection', JSON.stringify(collection));
    }
  }, [collection]);

  const handleImageSelect = useCallback((imageUrl: string) => {
    setUploadedImage(imageUrl);
  }, []);

  const handleStart = useCallback(async () => {
    if (!uploadedImage) return;

    setMessages([]);
    setGeneratedCard(null);
    setPhase('analyzing');

    try {
      // Show opening dialogue
      const randomDialogue = defaultEvaluators[0].openingDialogues[
        Math.floor(Math.random() * defaultEvaluators[0].openingDialogues.length)
      ];
      
      setMessages([{
        evaluatorId: defaultEvaluators[0].id,
        evaluatorName: defaultEvaluators[0].name,
        message: randomDialogue,
        timestamp: Date.now(),
      }]);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Vision analysis
      const analysis = await mockVisionAnalysis(uploadedImage);

      // Start discussion
      setPhase('discussing');

      // Parallel evaluator responses
      const responsePromises = defaultEvaluators.map(async (evaluator) => {
        const responses = await mockEvaluatorResponse(
          evaluator.id,
          evaluator.responsibility,
          analysis
        );

        // Add messages one by one
        for (const response of responses) {
          await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
          setMessages(prev => [...prev, {
            evaluatorId: evaluator.id,
            evaluatorName: evaluator.name,
            message: response,
            timestamp: Date.now(),
          }]);
        }
      });

      await Promise.all(responsePromises);

      // Generate card
      const card = generateMockCard(uploadedImage, analysis);
      setGeneratedCard(card);
      setPhase('complete');

    } catch (error) {
      console.error('Error during card generation:', error);
      setMessages(prev => [...prev, {
        evaluatorId: 'system',
        evaluatorName: 'システム',
        message: 'ごめん、よくわからなかった...',
        timestamp: Date.now(),
      }]);
      
      setTimeout(() => {
        setPhase('idle');
        setUploadedImage(null);
        setMessages([]);
      }, 2000);
    }
  }, [uploadedImage]);

  const handleShowCard = useCallback(() => {
    if (generatedCard) {
      setShowCardModal(true);
      
      // Add to collection
      setCollection(prev => {
        const newCollection = [generatedCard, ...prev];
        return newCollection.slice(0, 100);
      });
    }
  }, [generatedCard]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setUploadedImage(null);
    setMessages([]);
    setGeneratedCard(null);
  }, []);

  const handleCollectionCardClick = useCallback((card: CardData) => {
    setGeneratedCard(card);
    setShowCardModal(true);
  }, []);

  const getLatestMessageForEvaluator = (evaluatorId: string) => {
    const evaluatorMessages = messages.filter(m => m.evaluatorId === evaluatorId);
    return evaluatorMessages[evaluatorMessages.length - 1]?.message;
  };

  return (
    <div className="min-h-screen bg-retro-bg flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-retro-accent">
        <h1 className="text-center text-retro-highlight mb-3" style={{ fontSize: '1.2rem' }}>
          KIRO CARD KIT
        </h1>
        
        {/* Collection Panel */}
        {collection.length > 0 && (
          <CollectionPanel
            cards={collection}
            onCardClick={handleCollectionCardClick}
          />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4">
        {/* Image Area */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <AnimatePresence mode="wait">
            {!uploadedImage ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-sm"
              >
                <ImageUpload onImageSelect={handleImageSelect} disabled={phase !== 'idle'} />
              </motion.div>
            ) : (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-sm"
              >
                <div className="retro-panel pixel-corners overflow-hidden aspect-square">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Status overlay */}
                {phase !== 'idle' && phase !== 'complete' && (
                  <motion.div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Wand2 className="w-12 h-12 text-retro-highlight" />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons - Between Image and Evaluators */}
        <div className="mb-4 space-y-2">
          {phase === 'idle' && uploadedImage && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleStart}
              className="w-full retro-button pixel-corners py-4 flex items-center justify-center gap-2"
            >
              <Wand2 className="w-5 h-5" />
              <span>カード生成開始！</span>
            </motion.button>
          )}

          {phase === 'complete' && (
            <>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleShowCard}
                className="w-full retro-button pixel-corners py-4"
                style={{
                  background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
                  boxShadow: '0 0 20px rgba(233, 69, 96, 0.6)',
                }}
              >
                <motion.span
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  ✨ 結果を見る！ ✨
                </motion.span>
              </motion.button>
              
              <button
                onClick={handleReset}
                className="w-full retro-button pixel-corners py-2 flex items-center justify-center gap-2 text-sm opacity-70"
              >
                <RotateCcw className="w-4 h-4" />
                <span>もう一度</span>
              </button>
            </>
          )}
        </div>

        {/* Evaluators Row */}
        <div className="mb-4">
          <div className="grid grid-cols-4 gap-2">
            {defaultEvaluators.map((evaluator) => {
              const latestMessage = getLatestMessageForEvaluator(evaluator.id);
              
              return (
                <div key={evaluator.id} className="relative">
                  {/* Speech Bubble Above */}
                  <AnimatePresence>
                    {latestMessage && phase !== 'idle' && (
                      <motion.div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-32"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <div
                          className="retro-panel pixel-corners p-2 text-center relative"
                          style={{ borderColor: evaluator.avatarColor, borderWidth: '2px' }}
                        >
                          <p className="text-white" style={{ fontSize: '0.55rem', lineHeight: '1.2' }}>
                            {latestMessage}
                          </p>
                          {/* Arrow */}
                          <div
                            className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2"
                            style={{
                              backgroundColor: 'var(--color-retro-panel)',
                              border: `2px solid ${evaluator.avatarColor}`,
                              transform: 'translateX(-50%) rotate(45deg)',
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Avatar */}
                  <EvaluatorAvatar
                    name={evaluator.name}
                    color={evaluator.avatarColor}
                    isThinking={phase === 'analyzing' || phase === 'discussing'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Card Modal */}
      {generatedCard && (
        <CardModal
          card={generatedCard}
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
        />
      )}
    </div>
  );
}