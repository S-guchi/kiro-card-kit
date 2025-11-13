"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { useMainScreen } from "@/lib/contexts/MainScreenContext";
import { loadCollection } from "@/lib/storage/localStorageManager";
import type { CardData } from "@/types/card";

/**
 * CollectionSidebarのプロパティ
 */
interface CollectionSidebarProps {
  /** カードクリック時のコールバック */
  onCardClick: (card: CardData) => void;
}

/**
 * コレクションサイドバーコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @returns コレクションサイドバー
 *
 * @remarks
 * 要件7.3, 7.4, 7.5に対応
 * - Main Screenの右端に配置
 * - LocalStorageからカードデータを読み込み
 * - カードを日付順に表示
 * - カードクリックでCard Modalを表示
 */
export function CollectionSidebar({ onCardClick }: CollectionSidebarProps) {
  const { state, actions } = useMainScreen();

  // コレクションを読み込む
  useEffect(() => {
    const loadCollectionData = () => {
      try {
        const collection = loadCollection();
        actions.setCollection(collection);
      } catch (error) {
        console.error("コレクションの読み込みに失敗しました:", error);
      }
    };

    // 初回読み込み
    loadCollectionData();

    // 定期的に更新（他のタブでの変更を反映）
    const interval = setInterval(loadCollectionData, 5000);

    return () => clearInterval(interval);
  }, [actions.setCollection]);

  return (
    <aside className="w-80 border-l border-gray-200 bg-white shadow-sm flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">コレクション</h2>
        <p className="text-xs text-gray-500 mt-1">
          {state.collection.length} / 100 枚
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {state.collection.length > 0 ? (
          <div className="space-y-3">
            {state.collection.map((card, index) => (
              <CollectionCardItem
                key={card.id}
                card={card}
                index={index}
                onClick={() => onCardClick(card)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="空のコレクション"
              >
                <title>空のコレクション</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">まだカードがありません</p>
            <p className="text-xs text-gray-400 mt-1">
              画像をアップロードしてカードを生成しましょう
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

/**
 * コレクションカードアイテムのプロパティ
 */
interface CollectionCardItemProps {
  /** カードデータ */
  card: CardData;
  /** インデックス（アニメーション用） */
  index: number;
  /** クリック時のコールバック */
  onClick: () => void;
}

/**
 * コレクションカードアイテムコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @returns コレクションカードアイテム
 *
 * @remarks
 * カードの概要を表示し、クリックでCard Modalを開く
 */
function CollectionCardItem({ card, index, onClick }: CollectionCardItemProps) {
  // 属性に応じた色を取得
  const getAttributeColor = (attribute: string): string => {
    const colors: Record<string, string> = {
      Fire: "from-red-500 to-orange-500",
      Nature: "from-green-500 to-emerald-500",
      Machine: "from-gray-500 to-slate-500",
      Cosmic: "from-purple-500 to-indigo-500",
      Shadow: "from-gray-800 to-black",
      Light: "from-yellow-400 to-amber-300",
    };
    return colors[attribute] ?? "from-gray-400 to-gray-500";
  };

  // レア度に応じたボーダー色を取得
  const getRarityBorderColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      Common: "border-gray-300",
      Rare: "border-blue-400",
      Epic: "border-purple-500",
      Legendary: "border-yellow-500",
    };
    return colors[rarity] ?? "border-gray-300";
  };

  // 日付フォーマット
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-lg border-2 ${getRarityBorderColor(
        card.rarity,
      )} bg-white p-3 transition-all hover:shadow-lg`}
    >
      {/* カード画像プレビュー */}
      {card.imageData && (
        <div className="mb-2 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageData}
            alt={card.name}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* 属性グラデーション */}
      <div
        className={`h-1 w-full rounded-full bg-gradient-to-r ${getAttributeColor(
          card.attribute,
        )} mb-2`}
      />

      {/* カード名 */}
      <h3 className="text-sm font-bold text-gray-800 truncate mb-1">
        {card.name}
      </h3>

      {/* 属性とレア度 */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-gray-600">{card.attribute}</span>
        <span
          className={`font-semibold ${
            card.rarity === "Legendary"
              ? "text-yellow-600"
              : card.rarity === "Epic"
                ? "text-purple-600"
                : card.rarity === "Rare"
                  ? "text-blue-600"
                  : "text-gray-600"
          }`}
        >
          {card.rarity}
        </span>
      </div>

      {/* フレーバーテキスト（省略表示） */}
      {card.flavorText && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
          {card.flavorText}
        </p>
      )}

      {/* 作成日時 */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{formatDate(card.createdAt)}</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          role="img"
          aria-label="詳細を見る"
        >
          <title>詳細を見る</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </motion.div>
  );
}
