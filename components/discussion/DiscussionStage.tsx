"use client";

import { Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { DiscussionPhase } from "@/types/discussion";
import type { Evaluator } from "@/types/evaluator";

/**
 * DiscussionStageのプロパティ
 */
interface DiscussionStageProps {
  /** 現在の議論フェーズ */
  phase: DiscussionPhase;
  /** アップロードされた画像 */
  uploadedImage: File | null;
  /** 評議員リスト */
  evaluators: Evaluator[];
}

/**
 * 議論ステージコンポーネント
 * 画像表示と議論フェーズに応じた表示を管理する
 *
 * @remarks
 * - idle: 画像アップロード待機状態
 * - thinking: 画像解析中の表示（Thinking Phase）
 * - generating: カード要素生成中の表示
 * - complete: 生成完了状態
 *
 * 要件: 4.1, 4.2, 2.2
 */
export function DiscussionStage({
  phase,
  uploadedImage,
  evaluators,
}: DiscussionStageProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {uploadedImage ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative w-full aspect-square"
            >
              {/* 画像表示 */}
              <div className="relative w-full h-full rounded-xl overflow-hidden border-4 border-purple-200 dark:border-zinc-800 shadow-2xl">
                {/* biome-ignore lint/performance/noImgElement: アップロード画像のため */}
                <img
                  src={URL.createObjectURL(uploadedImage)}
                  alt="アップロードされた画像"
                  className="w-full h-full object-cover"
                />

                {/* Thinking Phase オーバーレイ */}
                {phase === "thinking" && (
                  <ThinkingPhaseOverlay evaluators={evaluators} />
                )}

                {/* Generating Phase オーバーレイ */}
                {phase === "generating" && <GeneratingPhaseOverlay />}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full aspect-square rounded-xl border-4 border-dashed border-purple-200 dark:border-zinc-800 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50"
            >
              <p className="text-zinc-400 dark:text-zinc-600 text-sm">
                画像をアップロードしてください
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Thinking Phaseオーバーレイコンポーネント
 * 画像解析中の表示を行う
 *
 * @remarks
 * 要件: 2.2 - 画像解析中に4人の評議員が考えているアニメーションを表示する
 */
interface ThinkingPhaseOverlayProps {
  /** 評議員リスト */
  evaluators: Evaluator[];
}

function ThinkingPhaseOverlay({ evaluators }: ThinkingPhaseOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 中央のアイコン */}
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className="mb-6"
      >
        <Wand2 className="w-16 h-16 text-purple-400" />
      </motion.div>

      {/* テキスト */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="text-white text-lg font-bold mb-2">画像を解析中...</p>
        <p className="text-purple-300 text-sm">
          {evaluators.length}人の評議員が考えています
        </p>
      </motion.div>

      {/* パルスアニメーション */}
      <motion.div
        className="absolute inset-0 rounded-xl border-4 border-purple-500"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

/**
 * Generating Phaseオーバーレイコンポーネント
 * カード要素生成中の表示を行う
 */
function GeneratingPhaseOverlay() {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-[1px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 生成中のパルスエフェクト */}
      <motion.div
        className="absolute inset-0 rounded-xl border-4 border-pink-500"
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
