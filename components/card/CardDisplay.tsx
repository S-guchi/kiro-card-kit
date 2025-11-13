/**
 * CardDisplayコンポーネント
 * TCG風のカードUIを表示するコンポーネント
 *
 * @module components/card/CardDisplay
 */

import Image from "next/image";
import type { CardData } from "@/types/card";

/**
 * CardDisplayコンポーネントのプロパティ
 */
interface CardDisplayProps {
  /** 表示するカードデータ */
  card: CardData;
  /** カスタムクラス名（オプション） */
  className?: string;
}

/**
 * 属性ごとの設定
 * 色、アイコン、背景グラデーションを定義
 */
const attributeConfig = {
  Fire: {
    color: "#ff6b6b",
    icon: "🔥",
    bg: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
  },
  Nature: {
    color: "#51cf66",
    icon: "🌿",
    bg: "linear-gradient(135deg, #51cf66 0%, #37b24d 100%)",
  },
  Machine: {
    color: "#748ffc",
    icon: "⚙️",
    bg: "linear-gradient(135deg, #748ffc 0%, #5c7cfa 100%)",
  },
  Cosmic: {
    color: "#cc5de8",
    icon: "✨",
    bg: "linear-gradient(135deg, #cc5de8 0%, #be4bdb 100%)",
  },
  Shadow: {
    color: "#495057",
    icon: "🌑",
    bg: "linear-gradient(135deg, #495057 0%, #343a40 100%)",
  },
  Light: {
    color: "#ffd43b",
    icon: "☀️",
    bg: "linear-gradient(135deg, #ffd43b 0%, #fab005 100%)",
  },
};

/**
 * レア度ごとの設定
 * 色とグロー効果を定義
 */
const rarityConfig = {
  Common: { color: "#9ca3af", glow: "rgba(156, 163, 175, 0.4)" },
  Rare: { color: "#60a5fa", glow: "rgba(96, 165, 250, 0.6)" },
  Epic: { color: "#a78bfa", glow: "rgba(167, 139, 250, 0.7)" },
  Legendary: { color: "#fbbf24", glow: "rgba(251, 191, 36, 0.8)" },
};

/**
 * CardDisplayコンポーネント
 * TCG風のカードUIを表示
 *
 * @param props - コンポーネントのプロパティ
 * @returns カード表示コンポーネント
 */
export function CardDisplay({ card, className = "" }: CardDisplayProps) {
  const attrConfig = attributeConfig[card.attribute];
  const rarityConf = rarityConfig[card.rarity];

  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden ${className}`}
      style={{
        borderWidth: "4px",
        borderStyle: "solid",
        borderColor: rarityConf.color,
        boxShadow: `0 0 40px ${rarityConf.glow}`,
        clipPath: `polygon(
          0 8px, 8px 8px, 8px 0,
          calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px,
          100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%,
          8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px)
        )`,
      }}
    >
      {/* 背景グラデーション */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: attrConfig.bg }}
      />

      {/* カードコンテンツ */}
      <div className="relative h-full flex flex-col p-4 sm:p-6">
        {/* ヘッダー: レア度と属性アイコン */}
        <div className="flex justify-between items-start mb-3">
          <div
            className="px-2 py-1 text-xs font-bold"
            style={{
              backgroundColor: rarityConf.color,
              border: "2px solid white",
              clipPath: `polygon(
                0 4px, 4px 4px, 4px 0,
                calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
                100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%,
                4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px)
              )`,
            }}
          >
            {card.rarity}
          </div>
          <span className="text-2xl" role="img" aria-label={card.attribute}>
            {attrConfig.icon}
          </span>
        </div>

        {/* カード名 */}
        <h2
          className="mb-3 text-center text-sm sm:text-base font-bold leading-tight"
          style={{
            color: attrConfig.color,
            textShadow: "2px 2px 0 black",
          }}
        >
          {card.name}
        </h2>

        {/* 画像 */}
        <div
          className="flex-1 mb-3 overflow-hidden bg-black/50 relative"
          style={{
            border: "3px solid rgba(255, 255, 255, 0.3)",
            clipPath: `polygon(
              0 6px, 6px 6px, 6px 0,
              calc(100% - 6px) 0, calc(100% - 6px) 6px, 100% 6px,
              100% calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) 100%,
              6px 100%, 6px calc(100% - 6px), 0 calc(100% - 6px)
            )`,
          }}
        >
          <Image
            src={card.imageData}
            alt={card.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{
              objectFit: "cover",
            }}
            priority
          />
        </div>

        {/* 属性バッジ */}
        <div className="mb-3">
          <div
            className="px-3 py-2 text-center text-xs font-bold"
            style={{
              backgroundColor: attrConfig.color,
              border: "2px solid white",
              clipPath: `polygon(
                0 4px, 4px 4px, 4px 0,
                calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
                100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%,
                4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px)
              )`,
            }}
          >
            {card.attribute}
          </div>
        </div>

        {/* フレーバーテキスト */}
        <div
          className="p-3 bg-black/70 text-white"
          style={{
            border: `2px solid ${attrConfig.color}`,
            clipPath: `polygon(
              0 6px, 6px 6px, 6px 0,
              calc(100% - 6px) 0, calc(100% - 6px) 6px, 100% 6px,
              100% calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) 100%,
              6px 100%, 6px calc(100% - 6px), 0 calc(100% - 6px)
            )`,
          }}
        >
          <p className="text-xs italic leading-relaxed">{card.flavorText}</p>
        </div>
      </div>
    </div>
  );
}
