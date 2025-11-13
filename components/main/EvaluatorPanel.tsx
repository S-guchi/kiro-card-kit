"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useMainScreen } from "@/lib/contexts/MainScreenContext";
import type { Evaluator } from "@/types/evaluator";

/**
 * EvaluatorPanelコンポーネントのプロパティ
 */
export interface EvaluatorPanelProps {
  /** 表示する評議員 */
  evaluator: Evaluator;
  /** 評議員のインデックス（0-3） */
  index: number;
}

/**
 * 評議員アバターを表示するコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @returns 評議員パネルコンポーネント
 *
 * @remarks
 * - 4人の評議員を左側に縦並びで表示
 * - 評議員画像を表示
 * - 待機状態のレイアウトを実装
 * - 要件: 4.1, 4.2, 12.3
 */
export function EvaluatorPanel({ evaluator, index }: EvaluatorPanelProps) {
  const { state } = useMainScreen();
  const { discussionPhase } = state;

  /**
   * 評議員のアニメーションバリアント
   * - idle: 待機状態（左側に縦並び）
   * - discussion: 議論状態（画像の四隅に配置）
   */
  const evaluatorVariants = {
    idle: {
      x: evaluator.position.idle.x,
      y: evaluator.position.idle.y,
      scale: 0.8,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
    discussion: {
      x: evaluator.position.discussion.x,
      y: evaluator.position.discussion.y,
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 50,
        damping: 20,
        duration: 1.5,
      },
    },
  };

  /**
   * 現在のアニメーション状態を決定
   */
  const currentVariant = discussionPhase === "idle" ? "idle" : "discussion";

  return (
    <motion.div
      className="relative flex flex-col items-center"
      variants={evaluatorVariants}
      initial="idle"
      animate={currentVariant}
      style={{
        position: discussionPhase === "idle" ? "relative" : "absolute",
      }}
    >
      {/* 評議員画像 */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
        <Image
          src={evaluator.imagePath}
          alt={evaluator.name}
          fill
          className="object-cover"
          priority={index < 2} // 最初の2人は優先読み込み
        />
      </div>

      {/* 評議員名 */}
      <div className="mt-2 px-3 py-1 bg-white rounded-full shadow-md">
        <p className="text-sm font-bold text-gray-800">{evaluator.name}</p>
      </div>

      {/* 役割バッジ */}
      <div className="mt-1 px-2 py-0.5 bg-blue-100 rounded-full">
        <p className="text-xs text-blue-700">{evaluator.role}</p>
      </div>
    </motion.div>
  );
}

/**
 * 評議員パネルコンテナコンポーネント
 *
 * @returns 評議員パネルコンテナ
 *
 * @remarks
 * - 4人の評議員を管理し、左側に縦並びで表示
 * - 待機状態では相対配置、議論状態では絶対配置に切り替え
 */
export function EvaluatorPanelContainer() {
  const { state } = useMainScreen();
  const { evaluators, discussionPhase } = state;

  if (evaluators.length === 0) {
    return null;
  }

  return (
    <div
      className={`${
        discussionPhase === "idle"
          ? "flex flex-col gap-6 items-center"
          : "relative w-full h-full"
      }`}
    >
      {evaluators.map((evaluator, index) => (
        <EvaluatorPanel
          key={evaluator.id}
          evaluator={evaluator}
          index={index}
        />
      ))}
    </div>
  );
}
