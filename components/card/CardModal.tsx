"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import { CardDisplay } from "@/components/card/CardDisplay";
import { CardExporter } from "@/components/card/CardExporter";
import { Button } from "@/components/common/Button";
import type { CardData } from "@/types/card";

/**
 * CardModalコンポーネントのプロパティ
 */
export interface CardModalProps {
  /** 表示するカードデータ */
  card: CardData | null;
  /** モーダルが開いているかどうか */
  isOpen: boolean;
  /** モーダルを閉じる際のコールバック */
  onClose: () => void;
}

/**
 * レア度に応じたパーティクルの数を取得
 *
 * @param rarity - カードのレア度
 * @returns パーティクルの数
 */
function getParticleCount(rarity: CardData["rarity"]): number {
  switch (rarity) {
    case "Legendary":
      return 50;
    case "Epic":
      return 30;
    case "Rare":
      return 15;
    case "Common":
      return 0;
    default:
      return 0;
  }
}

/**
 * レア度に応じたパーティクルの色を取得
 *
 * @param rarity - カードのレア度
 * @returns パーティクルの色配列
 */
function getParticleColors(rarity: CardData["rarity"]): string[] {
  switch (rarity) {
    case "Legendary":
      return ["#FFD700", "#FFA500", "#FF6347", "#FF1493"];
    case "Epic":
      return ["#9370DB", "#BA55D3", "#DA70D6"];
    case "Rare":
      return ["#4169E1", "#1E90FF", "#00BFFF"];
    case "Common":
      return [];
    default:
      return [];
  }
}

/**
 * Card Modal
 * 生成されたカードを派手な演出で表示するモーダル
 *
 * @param props - コンポーネントのプロパティ
 * @returns Card Modalコンポーネント
 *
 * @remarks
 * 要件: 6.1, 6.2, 6.8
 * - モーダルの基本構造を実装
 * - 閉じるボタンを実装
 * - フェードイン + スケールアニメーション
 * - レア度に応じたパーティクルエフェクト
 * - 背景のぼかし効果
 *
 * @TSDoc
 * このコンポーネントは、生成されたTCGカードをモーダル形式で表示します。
 * 派手な演出とともにカードを表示し、ユーザーに視覚的なインパクトを与えます。
 * レア度に応じてパーティクルエフェクトの数と色が変化します。
 */
export function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !card) {
    return null;
  }

  const particleCount = getParticleCount(card.rarity);
  const particleColors = getParticleColors(card.rarity);

  /**
   * 背景のアニメーションバリアント
   */
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  /**
   * モーダルコンテンツのアニメーションバリアント
   * 要件: 6.2 - フェードイン + スケールアニメーション
   */
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.2 },
    },
  };

  /**
   * パーティクルのアニメーションバリアント
   * 要件: 6.2 - レア度に応じたパーティクルエフェクト
   */
  const particleVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      x: [0, (Math.random() - 0.5) * 400],
      y: [0, (Math.random() - 0.5) * 400],
      transition: {
        duration: 2 + Math.random() * 2,
        delay: i * 0.02,
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: Math.random() * 2,
      },
    }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* 背景のぼかし効果（要件6.2） */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        variants={backdropVariants}
        onClick={onClose}
      />

      {/* パーティクルエフェクト（要件6.2） */}
      {particleCount > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: particleCount }).map((_, i) => {
            const colorIndex = Math.floor(
              Math.random() * particleColors.length,
            );
            const particleColor = particleColors[colorIndex];
            return (
              <motion.div
                key={`particle-${i}-${particleColor}`}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: particleColor,
                  boxShadow: `0 0 10px ${particleColor}`,
                }}
                variants={particleVariants}
                custom={i}
              />
            );
          })}
        </div>
      )}

      {/* モーダルコンテンツ */}
      <motion.div
        className="relative z-10 w-full max-w-2xl mx-4"
        variants={modalVariants}
      >
        {/* 閉じるボタン（要件6.8） */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            onClick={onClose}
            variant="secondary"
            className="rounded-full p-2 bg-white/90 hover:bg-white shadow-lg"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* カード表示エリア */}
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <div ref={cardRef}>
            <CardDisplay card={card} size="large" />
          </div>

          {/* エクスポートボタン（要件7.2） */}
          <CardExporter
            card={card}
            targetRef={cardRef}
            variant="primary"
            size="lg"
            className="w-full max-w-xs"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
