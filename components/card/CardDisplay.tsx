"use client";

import { Cpu, Flame, Leaf, Moon, Sparkles, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { loadDefaultCardSkin } from "@/lib/templates/skinLoader";
import type { CardData, CardSkin } from "@/types/card";

/**
 * CardDisplayコンポーネントのプロパティ
 */
interface CardDisplayProps {
  /** 表示するカードデータ */
  card: CardData;
  /** カスタムスキン（オプション） */
  skin?: CardSkin;
  /** カードのサイズ（デフォルト: "normal"） */
  size?: "small" | "normal" | "large";
}

/**
 * 属性に対応するアイコンを取得する
 *
 * @param attribute - カードの属性
 * @returns 対応するLucideアイコンコンポーネント
 */
function getAttributeIcon(attribute: CardData["attribute"]) {
  const iconMap = {
    Fire: Flame,
    Nature: Leaf,
    Machine: Cpu,
    Cosmic: Sparkles,
    Shadow: Moon,
    Light: Sun,
  };

  return iconMap[attribute];
}

/**
 * レア度に応じたアニメーション設定を取得する
 *
 * @param rarity - カードのレア度
 * @returns アニメーション設定オブジェクト
 */
function getRarityAnimation(rarity: CardData["rarity"]) {
  const animations = {
    Common: {
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
    },
    Rare: {
      scale: [1, 1.03, 1],
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.3)",
        "0 0 30px rgba(59, 130, 246, 0.5)",
        "0 0 20px rgba(59, 130, 246, 0.3)",
      ],
      transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
    },
    Epic: {
      scale: [1, 1.04, 1],
      boxShadow: [
        "0 0 25px rgba(168, 85, 247, 0.4)",
        "0 0 40px rgba(168, 85, 247, 0.6)",
        "0 0 25px rgba(168, 85, 247, 0.4)",
      ],
      transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
    },
    Legendary: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 30px rgba(251, 191, 36, 0.5)",
        "0 0 50px rgba(251, 191, 36, 0.8)",
        "0 0 30px rgba(251, 191, 36, 0.5)",
      ],
      rotate: [0, 1, -1, 0],
      transition: { duration: 1.2, repeat: Number.POSITIVE_INFINITY },
    },
  };

  return animations[rarity];
}

/**
 * TCG風のカードを表示するコンポーネント
 *
 * @remarks
 * カード名、属性、レア度、フレーバーテキスト、画像を表示します。
 * 属性に応じた背景色・アイコン、レア度に応じた枠デザイン・演出を適用します。
 * レスポンシブ対応で、様々な画面サイズに対応します。
 *
 * @example
 * ```tsx
 * <CardDisplay card={cardData} size="normal" />
 * ```
 */
export function CardDisplay({
  card,
  skin: customSkin,
  size = "normal",
}: CardDisplayProps) {
  const [skin, setSkin] = useState<CardSkin | null>(customSkin || null);
  const [isLoading, setIsLoading] = useState(!customSkin);

  // スキンの読み込み
  useEffect(() => {
    if (customSkin) {
      setSkin(customSkin);
      setIsLoading(false);
      return;
    }

    loadDefaultCardSkin()
      .then((loadedSkin) => {
        setSkin(loadedSkin);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("スキンの読み込みに失敗しました:", error);
        setIsLoading(false);
      });
  }, [customSkin]);

  if (isLoading || !skin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const AttributeIcon = getAttributeIcon(card.attribute);
  const attributeColors = skin.attributeColors[card.attribute];
  const rarityAnimation = getRarityAnimation(card.rarity);

  // サイズに応じたクラス
  const sizeClasses = {
    small: "w-64 h-96",
    normal: "w-80 h-[28rem]",
    large: "w-96 h-[32rem]",
  };

  // レア度に応じた枠のスタイル
  const rarityBorderClasses = {
    Common: "border-2 border-gray-400",
    Rare: "border-4 border-blue-500",
    Epic: "border-4 border-purple-500",
    Legendary: "border-4 border-yellow-500",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative rounded-2xl overflow-hidden shadow-2xl ${rarityBorderClasses[card.rarity]}`}
      animate={rarityAnimation}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 背景グラデーション */}
      <div
        className={`absolute inset-0 ${attributeColors.background} opacity-90`}
      />

      {/* カードコンテンツ */}
      <div className="relative h-full flex flex-col p-4 text-white">
        {/* ヘッダー: カード名と属性 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold drop-shadow-lg line-clamp-1">
            {card.name}
          </h2>
          <div className={`p-2 rounded-full ${attributeColors.glow}`}>
            <AttributeIcon className="w-6 h-6" />
          </div>
        </div>

        {/* レア度表示 */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: getRarityStars(card.rarity) }).map((_, i) => (
            <motion.div
              key={`star-${card.id}-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Sparkles className="w-4 h-4 fill-current" />
            </motion.div>
          ))}
          <span className="text-sm font-semibold ml-2">{card.rarity}</span>
        </div>

        {/* カード画像 */}
        <div className="relative flex-1 mb-3 rounded-lg overflow-hidden bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageData}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* フレーバーテキスト */}
        <div className="bg-black/40 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-sm italic line-clamp-3">{card.flavorText}</p>
        </div>

        {/* 属性ラベル */}
        <div className="mt-2 flex justify-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${attributeColors.border} bg-black/30`}
          >
            {card.attribute}
          </span>
        </div>
      </div>

      {/* レア度に応じたパーティクルエフェクト */}
      {(card.rarity === "Epic" || card.rarity === "Legendary") && (
        <RarityParticles rarity={card.rarity} />
      )}
    </motion.div>
  );
}

/**
 * レア度に応じた星の数を取得する
 *
 * @param rarity - カードのレア度
 * @returns 星の数
 */
function getRarityStars(rarity: CardData["rarity"]): number {
  const starMap = {
    Common: 1,
    Rare: 2,
    Epic: 3,
    Legendary: 4,
  };

  return starMap[rarity];
}

/**
 * レア度に応じたパーティクルエフェクトコンポーネント
 */
function RarityParticles({ rarity }: { rarity: "Epic" | "Legendary" }) {
  const particleCount = rarity === "Legendary" ? 20 : 12;
  const particleColor =
    rarity === "Legendary" ? "bg-yellow-400" : "bg-purple-400";

  // パーティクルの設定を事前に生成してユニークなIDを付与
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: `particle-${rarity}-${Date.now()}-${i}`,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute w-1 h-1 ${particleColor} rounded-full`}
          initial={{
            x: "50%",
            y: "50%",
            opacity: 0,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
