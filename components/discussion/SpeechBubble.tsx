"use client";

import { motion } from "motion/react";

/**
 * SpeechBubbleのプロパティ
 */
interface SpeechBubbleProps {
  /** 表示するメッセージ */
  message: string;
  /** 吹き出しの色 */
  color: string;
  /** 評議員の名前 */
  evaluatorName: string;
}

/**
 * 吹き出しコンポーネント
 * 評議員の発言を吹き出し形式で表示する
 *
 * @remarks
 * 要件: 4.4, 4.5 - 各評議員の発言を吹き出し形式でリアルタイム表示し、4人の発言を並列で表示する
 */
export function SpeechBubble({
  message,
  color,
  evaluatorName,
}: SpeechBubbleProps) {
  return (
    <motion.div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-32"
      initial={{ opacity: 0, y: 10, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <div
        className="relative rounded-lg border-2 p-2 text-center bg-white/95 backdrop-blur-sm dark:bg-zinc-950/95 shadow-lg"
        style={{ borderColor: color }}
      >
        {/* 評議員名 */}
        <div
          className="text-xs font-bold mb-1"
          style={{ color, fontSize: "0.5rem" }}
        >
          {evaluatorName}
        </div>

        {/* メッセージ */}
        <p
          className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words"
          style={{ fontSize: "0.55rem", lineHeight: "1.2" }}
        >
          {message}
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
  );
}
