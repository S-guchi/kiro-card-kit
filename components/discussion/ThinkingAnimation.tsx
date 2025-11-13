"use client";

import { motion } from "motion/react";

/**
 * ThinkingAnimationコンポーネントのプロパティ
 */
export interface ThinkingAnimationProps {
  /** 評議員の名前 */
  evaluatorName: string;
}

/**
 * 考えているアニメーションを表示するコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @returns 考えているアニメーションコンポーネント
 *
 * @remarks
 * - 4人全員が考えているアニメーションを実装
 * - 画像解析処理を並行実行
 * - 要件: 2.2, 4.11, 4.12
 *
 * @TSDoc
 * このコンポーネントは、評議員が考えている様子を表現するアニメーションを提供します。
 * 「...」が点滅するアニメーションで、画像解析中であることを視覚的に示します。
 */
export function ThinkingAnimation(_props: ThinkingAnimationProps) {
  /**
   * 吹き出しのアニメーションバリアント
   */
  const bubbleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
      },
    },
  };

  /**
   * ドットのアニメーションバリアント
   * 3つのドットが順番に点滅する
   */
  const dotVariants = {
    animate: {
      opacity: [0.3, 1, 0.3],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <motion.div
      className="absolute -top-16 left-1/2 transform -translate-x-1/2"
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative bg-white rounded-2xl shadow-lg px-4 py-2">
        {/* 吹き出しの三角形 */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />

        {/* 考えているアニメーション */}
        <div className="flex items-center gap-1">
          <motion.span
            className="text-2xl text-gray-600"
            variants={dotVariants}
            animate="animate"
            style={{ animationDelay: "0s" }}
          >
            ・
          </motion.span>
          <motion.span
            className="text-2xl text-gray-600"
            variants={dotVariants}
            animate="animate"
            style={{ animationDelay: "0.3s" }}
          >
            ・
          </motion.span>
          <motion.span
            className="text-2xl text-gray-600"
            variants={dotVariants}
            animate="animate"
            style={{ animationDelay: "0.6s" }}
          >
            ・
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
