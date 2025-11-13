"use client";

import { AnimatePresence, motion } from "motion/react";
import type { DiscussionMessage } from "@/types/discussion";

/**
 * SpeechBubbleコンポーネントのプロパティ
 */
export interface SpeechBubbleProps {
  /** 表示する議論メッセージ */
  message: DiscussionMessage;
  /** 吹き出しの位置（評議員の位置に応じて配置） */
  position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  /** 表示状態 */
  isVisible: boolean;
}

/**
 * 位置に応じた吹き出しのスタイルを取得
 *
 * @param position - 吹き出しの位置
 * @returns 吹き出しのスタイルクラス
 */
function getBubblePositionStyles(
  position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight",
): string {
  const baseStyles = "absolute z-10";

  switch (position) {
    case "topLeft":
      return `${baseStyles} top-24 left-24`;
    case "topRight":
      return `${baseStyles} top-24 right-24`;
    case "bottomLeft":
      return `${baseStyles} bottom-24 left-24`;
    case "bottomRight":
      return `${baseStyles} bottom-24 right-24`;
  }
}

/**
 * 位置に応じた吹き出しの尾の向きを取得
 *
 * @param position - 吹き出しの位置
 * @returns 尾の向きを表すクラス
 */
function getTailStyles(
  position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight",
): string {
  switch (position) {
    case "topLeft":
      return "left-4 -bottom-2 border-l-transparent border-r-white border-t-white border-b-transparent";
    case "topRight":
      return "right-4 -bottom-2 border-l-white border-r-transparent border-t-white border-b-transparent";
    case "bottomLeft":
      return "left-4 -top-2 border-l-transparent border-r-white border-t-transparent border-b-white";
    case "bottomRight":
      return "right-4 -top-2 border-l-white border-r-transparent border-t-transparent border-b-white";
  }
}

/**
 * 吹き出しアニメーションのバリアント
 * デザイン文書に基づいたスプリングアニメーション
 */
const speechBubbleVariants = {
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
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * 吹き出しコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @returns 吹き出しコンポーネント
 *
 * @remarks
 * - 評議員の発言を吹き出し形式で表示
 * - Motionを使用したアニメーション
 * - 4人の発言を並列で表示
 * - 要件: 4.14, 4.15
 *
 * @TSDoc
 * このコンポーネントは、評議員の発言を吹き出し形式で表示します。
 * AnimatePresenceを使用して、表示・非表示のアニメーションを実装しています。
 */
export function SpeechBubble({
  message,
  position,
  isVisible,
}: SpeechBubbleProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={getBubblePositionStyles(position)}
          variants={speechBubbleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* 吹き出し本体 */}
          <div className="relative max-w-xs bg-white rounded-2xl shadow-lg p-4">
            {/* 評議員名 */}
            <div className="mb-2">
              <p className="text-xs font-bold text-gray-500">
                {message.evaluatorName}
              </p>
            </div>

            {/* 発言内容 */}
            <div>
              <p className="text-sm text-gray-800 leading-relaxed">
                {message.message}
              </p>
            </div>

            {/* 吹き出しの尾 */}
            <div
              className={`absolute w-0 h-0 border-8 ${getTailStyles(position)}`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
