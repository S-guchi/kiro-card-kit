"use client";

import { useEffect, useState } from "react";
import { CardModal } from "@/components/card/CardModal";
import { Button } from "@/components/common/Button";
import { ToastContainer } from "@/components/common/Toast";
import { DiscussionStage } from "@/components/discussion/DiscussionStage";
import { CollectionSidebar } from "@/components/main/CollectionSidebar";
import { EvaluatorPanelContainer } from "@/components/main/EvaluatorPanel";
import { ImageUploader } from "@/components/main/ImageUploader";
import { useMainScreen } from "@/lib/contexts/MainScreenContext";
import { loadCollection } from "@/lib/storage/localStorageManager";
import { loadEvaluators } from "@/lib/templates/evaluatorLoader";
import type { CardData } from "@/types/card";

/**
 * Main Screen
 * kiro-card-kitのメイン画面
 * 画像アップロード、評議員表示、議論アニメーション、コレクション管理を行う
 *
 * @remarks
 * 要件12.1, 12.2, 12.3, 12.4, 12.5に対応
 * - Main Screen 1画面のみを提供
 * - 左側に評議員パネル、中央に画像アップロードエリア、右側にコレクションサイドバーを配置
 * - React Context + Hooksで状態管理を実装
 */
export default function MainScreen() {
  const { state, actions, toasts, removeToast } = useMainScreen();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // 初期化: 評議員とコレクションを読み込む
  useEffect(() => {
    const initialize = async () => {
      try {
        // 評議員テンプレートを読み込む
        const evaluators = await loadEvaluators();
        actions.setEvaluators(evaluators);

        // コレクションを読み込む
        const collection = loadCollection();
        actions.setCollection(collection);
      } catch (error) {
        console.error("初期化エラー:", error);
      }
    };

    initialize();
  }, [actions]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 左側: 評議員パネル（要件12.3） */}
      <aside className="w-64 border-r border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-gray-800 text-center">
          評議員
        </h2>
        <div className="flex justify-center">
          {state.evaluators.length > 0 ? (
            <EvaluatorPanelContainer />
          ) : (
            <div className="text-sm text-gray-500">読み込み中...</div>
          )}
        </div>
      </aside>

      {/* 中央: メインコンテンツエリア（要件12.5） */}
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">
            kiro-card-kit
          </h1>
          <p className="mb-8 text-center text-lg text-gray-600">
            おもちゃや物品の写真からTCG風のカードを自動生成
          </p>

          {/* 待機状態: 画像アップロードエリア */}
          {state.discussionPhase === "idle" && (
            <>
              <div className="mb-8">
                <ImageUploader
                  onImageSelect={(file) => {
                    actions.setUploadedImage(file);
                    setErrorMessage(null);
                  }}
                  onError={(error) => {
                    setErrorMessage(error);
                  }}
                  selectedImage={state.uploadedImage}
                  disabled={state.isDiscussing}
                />
              </div>

              {/* 開始ボタン（要件4.4, 12.6） */}
              {state.uploadedImage && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      actions.startDiscussion();
                    }}
                    disabled={state.isDiscussing}
                  >
                    カード生成を開始
                  </Button>
                </div>
              )}
            </>
          )}

          {/* 議論状態: DiscussionStage（要件4.5, 4.6, 4.7, 12.7） */}
          {state.discussionPhase !== "idle" && (
            <div className="w-full h-[600px]">
              <DiscussionStage uploadedImage={state.uploadedImage} />
            </div>
          )}

          {/* 「結果を見る！」ボタン（要件4.16, 11.4, 12.9, 12.10） */}
          {state.showResultButton && state.generatedCard && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => {
                  setSelectedCard(state.generatedCard);
                  setIsCardModalOpen(true);
                }}
                size="lg"
                className="animate-bounce"
              >
                結果を見る！
              </Button>
            </div>
          )}

          {/* エラーメッセージ表示 */}
          {errorMessage && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* デバッグ情報 */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 rounded-lg bg-gray-100 p-4 text-xs text-gray-600">
              <p>議論フェーズ: {state.discussionPhase}</p>
              <p>議論中: {state.isDiscussing ? "はい" : "いいえ"}</p>
              <p>評議員数: {state.evaluators.length}</p>
              <p>コレクション数: {state.collection.length}</p>
            </div>
          )}
        </div>
      </main>

      {/* 右側: コレクションサイドバー（要件7.3, 7.4, 7.5） */}
      <CollectionSidebar
        onCardClick={(card) => {
          setSelectedCard(card);
          setIsCardModalOpen(true);
        }}
      />

      {/* Card Modal（要件6.1, 6.8） */}
      <CardModal
        card={selectedCard}
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedCard(null);
        }}
      />

      {/* トースト通知コンテナ（要件10.8） */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
