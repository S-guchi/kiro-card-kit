"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ImageUploader } from "@/components/main/ImageUploader";
import type { CardData } from "@/types/card";
import type { DiscussionMessage, DiscussionPhase } from "@/types/discussion";
import type { Evaluator } from "@/types/evaluator";

/**
 * Main Screenの状態管理インターフェース
 */
interface MainScreenState {
  /** アップロードされた画像 */
  uploadedImage: File | null;
  /** 議論中かどうか */
  isDiscussing: boolean;
  /** 議論フェーズ */
  discussionPhase: DiscussionPhase;
  /** 評議員リスト */
  evaluators: Evaluator[];
  /** 議論ログ */
  discussionLog: DiscussionMessage[];
  /** コレクション */
  collection: CardData[];
  /** 生成されたカード */
  generatedCard: CardData | null;
  /** 結果ボタンを表示するか */
  showResultButton: boolean;
}

/**
 * Main Screen Context
 */
interface MainScreenContextValue extends MainScreenState {
  /** 画像をアップロードする */
  setUploadedImage: (image: File | null) => void;
  /** 議論フェーズを設定する */
  setDiscussionPhase: (phase: DiscussionPhase) => void;
  /** 評議員を設定する */
  setEvaluators: (evaluators: Evaluator[]) => void;
  /** 議論ログを追加する */
  addDiscussionMessage: (message: DiscussionMessage) => void;
  /** 議論ログをクリアする */
  clearDiscussionLog: () => void;
  /** 生成されたカードを設定する */
  setGeneratedCard: (card: CardData | null) => void;
  /** コレクションにカードを追加する */
  addToCollection: (card: CardData) => void;
  /** 状態をリセットする */
  reset: () => void;
}

const MainScreenContext = createContext<MainScreenContextValue | undefined>(
  undefined,
);

/**
 * Main Screen Context Provider
 */
function MainScreenProvider({ children }: { children: ReactNode }) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [discussionPhase, setDiscussionPhase] =
    useState<DiscussionPhase>("idle");
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [discussionLog, setDiscussionLog] = useState<DiscussionMessage[]>([]);
  const [collection, setCollection] = useState<CardData[]>([]);
  const [generatedCard, setGeneratedCard] = useState<CardData | null>(null);

  // LocalStorageからコレクションを読み込む
  useEffect(() => {
    const stored = localStorage.getItem("kiro-card-collection");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCollection(parsed);
      } catch (error) {
        console.error("コレクションの読み込みに失敗しました:", error);
      }
    }
  }, []);

  // コレクションをLocalStorageに保存する
  useEffect(() => {
    if (collection.length > 0) {
      localStorage.setItem("kiro-card-collection", JSON.stringify(collection));
    }
  }, [collection]);

  const addDiscussionMessage = useCallback((message: DiscussionMessage) => {
    setDiscussionLog((prev) => [...prev, message]);
  }, []);

  const clearDiscussionLog = useCallback(() => {
    setDiscussionLog([]);
  }, []);

  const addToCollection = useCallback((card: CardData) => {
    setCollection((prev) => {
      const newCollection = [card, ...prev];
      // 最大100枚まで保存
      return newCollection.slice(0, 100);
    });
  }, []);

  const reset = useCallback(() => {
    setUploadedImage(null);
    setDiscussionPhase("idle");
    setDiscussionLog([]);
    setGeneratedCard(null);
  }, []);

  const isDiscussing =
    discussionPhase === "thinking" || discussionPhase === "generating";
  const showResultButton =
    discussionPhase === "complete" && generatedCard !== null;

  const value: MainScreenContextValue = {
    uploadedImage,
    isDiscussing,
    discussionPhase,
    evaluators,
    discussionLog,
    collection,
    generatedCard,
    showResultButton,
    setUploadedImage,
    setDiscussionPhase,
    setEvaluators,
    addDiscussionMessage,
    clearDiscussionLog,
    setGeneratedCard,
    addToCollection,
    reset,
  };

  return (
    <MainScreenContext.Provider value={value}>
      {children}
    </MainScreenContext.Provider>
  );
}

/**
 * Main Screen Contextを使用するカスタムフック
 */
function useMainScreen() {
  const context = useContext(MainScreenContext);
  if (context === undefined) {
    throw new Error("useMainScreen must be used within MainScreenProvider");
  }
  return context;
}

/**
 * Main Screen
 * 画像アップロード、評議員表示、議論表示、コレクション管理を行うメイン画面
 * モバイルファースト設計を考慮したレスポンシブレイアウト
 */
function MainScreenContent() {
  const {
    discussionPhase,
    uploadedImage,
    collection,
    setUploadedImage,
    isDiscussing,
  } = useMainScreen();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
      {/* ヘッダー */}
      <header className="border-b border-purple-200 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <h1 className="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
          KIRO CARD KIT
        </h1>
        <p className="text-center text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          おもちゃや物品の写真からTCG風カードを自動生成
        </p>

        {/* コレクションパネル（モバイル対応） */}
        {collection.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 text-center">
              コレクション ({collection.length}/100)
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {collection.map((card) => (
                <button
                  key={card.id}
                  className="flex-shrink-0 rounded-lg border-2 overflow-hidden transition-transform hover:scale-105"
                  style={{
                    borderColor: getRarityColor(card.rarity),
                    width: "80px",
                    height: "80px",
                  }}
                  type="button"
                >
                  <div className="relative w-full h-full">
                    {/* biome-ignore lint/performance/noImgElement: Base64データのため */}
                    <img
                      src={card.imageData}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-center text-white text-xs font-bold"
                      style={{
                        backgroundColor: getRarityColor(card.rarity),
                      }}
                    >
                      {card.rarity[0]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col p-4 gap-4">
        {/* 画像表示エリア */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <ImageUploader
              onImageSelect={setUploadedImage}
              selectedImage={uploadedImage}
              onClear={() => setUploadedImage(null)}
              disabled={isDiscussing}
            />

            {/* ステータスオーバーレイ */}
            {uploadedImage &&
              (discussionPhase === "thinking" ||
                discussionPhase === "generating") && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
                </div>
              )}
          </div>
        </div>

        {/* アクションボタンエリア */}
        <div className="space-y-2">
          {discussionPhase === "idle" && uploadedImage && (
            <button
              type="button"
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              カード生成開始！
            </button>
          )}

          {discussionPhase === "complete" && (
            <>
              <button
                type="button"
                className="w-full rounded-lg bg-gradient-to-r from-pink-600 to-red-600 px-6 py-4 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-pulse"
              >
                ✨ 結果を見る！ ✨
              </button>
              <button
                type="button"
                className="w-full rounded-lg border-2 border-zinc-300 bg-white/50 px-4 py-2 text-sm text-zinc-700 backdrop-blur-sm hover:bg-white/80 transition-all dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300 dark:hover:bg-zinc-950/80"
              >
                もう一度
              </button>
            </>
          )}
        </div>

        {/* 評議員表示エリア */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="rounded-lg border-2 border-purple-300 bg-white/80 p-2 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/80">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">E{i}</span>
                </div>
              </div>
              <div className="text-center text-xs text-zinc-600 dark:text-zinc-400">
                評議員{i}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/**
 * レア度に応じた色を取得する
 */
function getRarityColor(rarity: CardData["rarity"]): string {
  const colors = {
    Common: "#9ca3af",
    Rare: "#60a5fa",
    Epic: "#a78bfa",
    Legendary: "#fbbf24",
  };
  return colors[rarity];
}

/**
 * Main Screen（エクスポート）
 */
export default function MainScreen() {
  return (
    <MainScreenProvider>
      <MainScreenContent />
    </MainScreenProvider>
  );
}
