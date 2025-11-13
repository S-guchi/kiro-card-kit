"use client";

import { useEffect } from "react";
import type { CardData } from "@/types/card";

/**
 * CardModalのプロパティ
 */
interface CardModalProps {
  /** 表示するカードデータ */
  card: CardData;
  /** モーダルが開いているかどうか */
  isOpen: boolean;
  /** モーダルを閉じる関数 */
  onClose: () => void;
}

/**
 * Card Modal
 * 生成されたカードを派手な演出で表示するモーダル
 * 要件: 6.1 - Card Modalを表示する
 * 要件: 6.4 - Card Modalを閉じる機能を提供する
 */
export function CardModal({ card, isOpen, onClose }: CardModalProps) {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // モーダルが開いている間はスクロールを無効化
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClose();
        }
      }}
    >
      <div
        role="document"
        className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          aria-label="モーダルを閉じる"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>閉じる</title>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* カード表示エリア */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2
              id="card-modal-title"
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-2"
            >
              ✨ カード完成！ ✨
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              あなたのオリジナルカードが生成されました
            </p>
          </div>

          {/* CardDisplayコンポーネントをここに配置予定 */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-zinc-800 dark:to-zinc-700 rounded-xl p-8 mb-6">
            <p className="text-center text-zinc-600 dark:text-zinc-400">
              CardDisplayコンポーネント（タスク15で実装予定）
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>カード名:</strong> {card.name}
              </p>
              <p>
                <strong>属性:</strong> {card.attribute}
              </p>
              <p>
                <strong>レア度:</strong> {card.rarity}
              </p>
              <p>
                <strong>フレーバー:</strong> {card.flavorText}
              </p>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={onClose}
            >
              閉じる
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border-2 border-purple-600 bg-white dark:bg-zinc-900 px-6 py-3 text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-zinc-800 transition-all"
              onClick={() => {
                // CardExporter機能（タスク17で実装予定）
                alert("エクスポート機能はタスク17で実装予定です");
              }}
            >
              エクスポート
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
