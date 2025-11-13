"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * OpeningDialogueコンポーネントのプロパティ
 */
export interface OpeningDialogueProps {
  /** Opening Dialogueの配列 */
  dialogues: string[];
  /** 表示完了時のコールバック */
  onComplete?: () => void;
}

/**
 * Opening Dialogueを表示するコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @returns Opening Dialogueコンポーネント
 *
 * @remarks
 * - 複数のOpening Dialogueを用意
 * - ランダムに選択して表示
 * - 要件: 4.8, 4.9, 4.10
 *
 * @TSDoc
 * このコンポーネントは、評議員が議論を開始する際の導入会話を表示します。
 * 複数の会話パターンからランダムに選択し、アニメーション付きで表示します。
 */
export function OpeningDialogue({
  dialogues,
  onComplete,
}: OpeningDialogueProps) {
  const [selectedDialogue, setSelectedDialogue] = useState<string>("");

  useEffect(() => {
    // ランダムにOpening Dialogueを選択
    if (dialogues.length > 0) {
      const randomIndex = Math.floor(Math.random() * dialogues.length);
      setSelectedDialogue(dialogues[randomIndex]);

      // 2秒後に完了コールバックを呼び出す
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [dialogues, onComplete]);

  /**
   * 吹き出しのアニメーションバリアント
   */
  const bubbleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (!selectedDialogue) {
    return null;
  }

  return (
    <motion.div
      className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-10"
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-6 max-w-md">
        {/* 吹き出しの三角形 */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white" />

        {/* 会話テキスト */}
        <p className="text-lg text-gray-800 text-center font-medium">
          {selectedDialogue}
        </p>
      </div>
    </motion.div>
  );
}
