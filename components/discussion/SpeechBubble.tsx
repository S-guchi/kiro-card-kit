"use client";

import { motion } from "motion/react";

/**
 * 吹き出しの位置
 * - top-left: 左上
 * - top-right: 右上
 * - bottom-left: 左下
 * - bottom-right: 右下
 */
export type SpeechBubblePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/**
 * SpeechBubbleコンポーネントのプロパティ
 */
interface SpeechBubbleProps {
  /** 表示するメッセージ */
  message: string;

  /** 吹き出しの色（ボーダーカラー） */
  color: string;

  /** 吹き出しの位置 */
  position: SpeechBubblePosition;

  /** 評議員の名前（オプション） */
  evaluatorName?: string;
}

/**
 * 吹き出しコンポーネント
 * 評議員の発言を吹き出し形式で表示する
 *
 * @remarks
 * 要件: 4.4, 4.5
 * - 各評議員の発言を吹き出し形式でリアルタイム表示
 * - 4人の評議員の発言を並列で表示
 *
 * デザイン参考: /design/components/SpeechBubble.tsx
 *
 * @example
 * ```tsx
 * <SpeechBubble
 *   message="この物体は火属性が似合いそうだね！"
 *   color="#ef4444"
 *   position="top-left"
 *   evaluatorName="属性担当"
 * />
 * ```
 */
export function SpeechBubble({
  message,
  color,
  position,
  evaluatorName,
}: SpeechBubbleProps) {
  // 位置に応じたスタイル
  const positionStyles: Record<SpeechBubblePosition, string> = {
    "top-left": "left-0 top-full mt-2",
    "top-right": "right-0 top-full mt-2",
    "bottom-left": "left-0 bottom-full mb-2",
    "bottom-right": "right-0 bottom-full mb-2",
  };

  // 吹き出しの尻尾の位置
  const tailPosition: Record<SpeechBubblePosition, string> = {
    "top-left": "left-4 -top-1.5",
    "top-right": "right-4 -top-1.5",
    "bottom-left": "left-4 -bottom-1.5",
    "bottom-right": "right-4 -bottom-1.5",
  };

  return (
    <motion.div
      className={`absolute ${positionStyles[position]} z-20`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-lg p-3 max-w-[200px] shadow-lg"
        style={{ borderColor: color, borderWidth: "2px", borderStyle: "solid" }}
      >
        {/* 評議員名（オプション） */}
        {evaluatorName && (
          <p className="text-xs font-bold mb-1" style={{ color }}>
            {evaluatorName}
          </p>
        )}

        {/* メッセージ */}
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed text-zinc-800 dark:text-zinc-200">
          {message}
        </p>

        {/* 吹き出しの尻尾 */}
        <div
          className={`absolute w-3 h-3 ${tailPosition[position]}`}
          style={{
            backgroundColor: "white",
            border: `2px solid ${color}`,
            transform: "rotate(45deg)",
          }}
        />
        <div
          className={`absolute w-3 h-3 ${tailPosition[position]} dark:block hidden`}
          style={{
            backgroundColor: "rgb(24, 24, 27)",
            border: `2px solid ${color}`,
            transform: "rotate(45deg)",
          }}
        />
      </div>
    </motion.div>
  );
}
