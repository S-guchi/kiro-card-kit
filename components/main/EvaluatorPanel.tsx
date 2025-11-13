"use client";

import { Brain } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { DiscussionMessage } from "@/types/discussion";
import type { Evaluator } from "@/types/evaluator";

/**
 * EvaluatorPanelのプロパティ
 */
interface EvaluatorPanelProps {
  /** 評議員リスト */
  evaluators: Evaluator[];
  /** 議論メッセージリスト */
  messages?: DiscussionMessage[];
  /** 考え中かどうか */
  isThinking?: boolean;
}

/**
 * 評議員の色を取得する
 * 評議員のIDに基づいて色を割り当てる
 */
function getEvaluatorColor(evaluatorId: string): string {
  const colors: Record<string, string> = {
    "evaluator-1": "#e94560", // ピンク
    "evaluator-2": "#4ecdc4", // シアン
    "evaluator-3": "#ffa500", // オレンジ
    "evaluator-4": "#9b59b6", // パープル
  };
  return colors[evaluatorId] || "#6b7280";
}

/**
 * 評議員アバターコンポーネント
 */
interface EvaluatorAvatarProps {
  /** 評議員 */
  evaluator: Evaluator;
  /** 考え中かどうか */
  isThinking?: boolean;
}

function EvaluatorAvatar({
  evaluator,
  isThinking = false,
}: EvaluatorAvatarProps) {
  const color = getEvaluatorColor(evaluator.id);

  return (
    <motion.div
      className="relative rounded-lg border-2 p-2 bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80"
      style={{ borderColor: color }}
      animate={
        isThinking
          ? {
              scale: [1, 1.05, 1],
            }
          : {}
      }
      transition={{
        duration: 1,
        repeat: isThinking ? Number.POSITIVE_INFINITY : 0,
        ease: "easeInOut",
      }}
    >
      <div className="relative w-10 h-10 rounded overflow-hidden">
        {/* biome-ignore lint/performance/noImgElement: 評議員画像のため */}
        <img
          src={evaluator.imagePath}
          alt={evaluator.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 考え中インジケーター */}
      {isThinking && (
        <motion.div
          className="absolute -top-1 -right-1 rounded-full p-1"
          style={{
            backgroundColor: "white",
            border: `2px solid ${color}`,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <Brain className="w-3 h-3" style={{ color }} />
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * 評議員パネルコンポーネント
 * 4人の評議員を表示し、議論メッセージを吹き出しで表示する
 */
export function EvaluatorPanel({
  evaluators,
  messages = [],
  isThinking = false,
}: EvaluatorPanelProps) {
  /**
   * 特定の評議員の最新メッセージを取得する
   */
  const getLatestMessageForEvaluator = (
    evaluatorId: string,
  ): string | undefined => {
    const evaluatorMessages = messages.filter(
      (m) => m.evaluatorId === evaluatorId,
    );
    return evaluatorMessages[evaluatorMessages.length - 1]?.message;
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {evaluators.map((evaluator) => {
        const latestMessage = getLatestMessageForEvaluator(evaluator.id);
        const color = getEvaluatorColor(evaluator.id);

        return (
          <div
            key={evaluator.id}
            className="relative flex flex-col items-center gap-1"
          >
            {/* 吹き出し */}
            <AnimatePresence>
              {latestMessage && (
                <motion.div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-32"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div
                    className="rounded-lg border-2 p-2 text-center relative bg-white/90 backdrop-blur-sm dark:bg-zinc-950/90"
                    style={{ borderColor: color }}
                  >
                    <p
                      className="text-zinc-800 dark:text-zinc-200"
                      style={{ fontSize: "0.55rem", lineHeight: "1.2" }}
                    >
                      {latestMessage}
                    </p>
                    {/* 吹き出しの矢印 */}
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white dark:bg-zinc-950"
                      style={{
                        border: `2px solid ${color}`,
                        transform: "translateX(-50%) rotate(45deg)",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* アバター */}
            <EvaluatorAvatar evaluator={evaluator} isThinking={isThinking} />

            {/* 評議員名 */}
            <div
              className="text-center px-1 font-medium"
              style={{ color, fontSize: "0.5rem", lineHeight: "1.1" }}
            >
              {evaluator.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
