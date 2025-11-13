"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ToastProps } from "@/components/common/Toast";
import { useToast } from "@/lib/hooks/useToast";
import { monitorNetworkStatus } from "@/lib/utils/networkMonitor";
import type { CardData } from "@/types/card";
import type { DiscussionMessage } from "@/types/discussion";
import type { Evaluator } from "@/types/evaluator";

/**
 * 議論のフェーズを表す型
 */
export type DiscussionPhase =
  | "idle" // 待機状態
  | "moving" // 評議員が移動中
  | "opening" // Opening Dialogue表示中
  | "thinking" // 画像解析中（考えているアニメーション）
  | "generating" // カード要素生成中
  | "complete"; // 生成完了

/**
 * Main Screenの状態を管理する型
 */
export interface MainScreenState {
  /** アップロードされた画像ファイル */
  uploadedImage: File | null;
  /** 議論中かどうか */
  isDiscussing: boolean;
  /** 現在の議論フェーズ */
  discussionPhase: DiscussionPhase;
  /** 評議員のリスト */
  evaluators: Evaluator[];
  /** 議論ログ */
  discussionLog: DiscussionMessage[];
  /** コレクション（保存されたカード） */
  collection: CardData[];
  /** 生成されたカード */
  generatedCard: CardData | null;
  /** 「結果を見る！」ボタンを表示するか */
  showResultButton: boolean;
  /** エラーが発生したかどうか */
  hasError: boolean;
  /** エラーメッセージ */
  errorMessage: string | null;
  /** ネットワークがオンラインかどうか */
  isOnline: boolean;
}

/**
 * Main Screenの状態を更新するアクションの型
 */
export interface MainScreenActions {
  /** 画像をアップロードする */
  setUploadedImage: (image: File | null) => void;
  /** 議論を開始する */
  startDiscussion: () => void;
  /** 議論フェーズを更新する */
  setDiscussionPhase: (phase: DiscussionPhase) => void;
  /** 評議員を設定する */
  setEvaluators: (evaluators: Evaluator[]) => void;
  /** 議論ログにメッセージを追加する */
  addDiscussionMessage: (message: DiscussionMessage) => void;
  /** コレクションを更新する */
  setCollection: (collection: CardData[]) => void;
  /** 生成されたカードを設定する */
  setGeneratedCard: (card: CardData | null) => void;
  /** 「結果を見る！」ボタンの表示状態を設定する */
  setShowResultButton: (show: boolean) => void;
  /** エラーを設定する */
  setError: (message: string) => void;
  /** エラーをクリアする */
  clearError: () => void;
  /** ネットワーク状態を設定する */
  setIsOnline: (isOnline: boolean) => void;
  /** 状態をリセットする */
  reset: () => void;
}

/**
 * Main Screenのコンテキストの型
 */
export interface MainScreenContextType {
  state: MainScreenState;
  actions: MainScreenActions;
  toasts: ToastProps[];
  removeToast: (id: string) => void;
  addToast: {
    success: (message: string, options?: { description?: string }) => void;
    error: (message: string, options?: { description?: string }) => void;
    warning: (message: string, options?: { description?: string }) => void;
    info: (message: string, options?: { description?: string }) => void;
    offline: (message: string, options?: { description?: string }) => void;
  };
}

/**
 * Main Screenのコンテキスト
 */
const MainScreenContext = createContext<MainScreenContextType | undefined>(
  undefined,
);

/**
 * 初期状態
 */
const initialState: MainScreenState = {
  uploadedImage: null,
  isDiscussing: false,
  discussionPhase: "idle",
  evaluators: [],
  discussionLog: [],
  collection: [],
  generatedCard: null,
  showResultButton: false,
  hasError: false,
  errorMessage: null,
  isOnline: true,
};

/**
 * Main Screenのコンテキストプロバイダー
 *
 * @param children - 子要素
 * @returns プロバイダーコンポーネント
 *
 * @remarks
 * Main Screenの状態管理を提供する。
 * React Context + Hooksを使用して、コンポーネント間で状態を共有する。
 */
export function MainScreenProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MainScreenState>(initialState);
  const { toasts, addToast, removeToast } = useToast();

  // 各アクション関数をuseCallbackでメモ化して、不要な再レンダリングを防ぐ
  const setUploadedImage = useCallback((image: File | null) => {
    setState((prev) => ({ ...prev, uploadedImage: image }));
  }, []);

  const startDiscussion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDiscussing: true,
      discussionPhase: "moving",
    }));
  }, []);

  const setDiscussionPhase = useCallback((phase: DiscussionPhase) => {
    setState((prev) => ({ ...prev, discussionPhase: phase }));
  }, []);

  const setEvaluators = useCallback((evaluators: Evaluator[]) => {
    setState((prev) => ({ ...prev, evaluators }));
  }, []);

  const addDiscussionMessage = useCallback((message: DiscussionMessage) => {
    setState((prev) => ({
      ...prev,
      discussionLog: [...prev.discussionLog, message],
    }));
  }, []);

  const setCollection = useCallback((collection: CardData[]) => {
    setState((prev) => ({ ...prev, collection }));
  }, []);

  const setGeneratedCard = useCallback((card: CardData | null) => {
    setState((prev) => ({ ...prev, generatedCard: card }));
  }, []);

  const setShowResultButton = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showResultButton: show }));
  }, []);

  const setError = useCallback(
    (message: string) => {
      setState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage: message,
      }));

      // エラートーストを表示（要件: 10.8）
      addToast.error(message);
    },
    [addToast],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hasError: false,
      errorMessage: null,
    }));
  }, []);

  const setIsOnline = useCallback((isOnline: boolean) => {
    setState((prev) => ({ ...prev, isOnline }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...initialState,
      evaluators: prev.evaluators, // 評議員は保持
      collection: prev.collection, // コレクションは保持
      isOnline: prev.isOnline, // ネットワーク状態は保持
    }));
  }, []);

  const actions: MainScreenActions = {
    setUploadedImage,
    startDiscussion,
    setDiscussionPhase,
    setEvaluators,
    addDiscussionMessage,
    setCollection,
    setGeneratedCard,
    setShowResultButton,
    setError,
    clearError,
    setIsOnline,
    reset,
  };

  // ネットワーク状態の監視（要件: 10.6）
  useEffect(() => {
    const cleanup = monitorNetworkStatus(
      () => {
        setState((prev) => ({ ...prev, isOnline: true }));
        // オンラインに復帰した時に成功トーストを表示
        addToast.success("ネットワークに接続しました");
      },
      () => {
        setState((prev) => ({ ...prev, isOnline: false }));
        // オフライン時にオフライントーストを表示（要件: 10.6）
        addToast.offline(
          "ネットワークがオフラインです。インターネット接続を確認してください。",
        );
      },
    );

    return cleanup;
  }, [addToast]);

  return (
    <MainScreenContext.Provider
      value={{ state, actions, toasts, removeToast, addToast }}
    >
      {children}
    </MainScreenContext.Provider>
  );
}

/**
 * Main Screenのコンテキストを使用するカスタムフック
 *
 * @returns Main Screenのコンテキスト
 * @throws コンテキストプロバイダー外で使用された場合
 *
 * @example
 * ```tsx
 * const { state, actions } = useMainScreen();
 * ```
 */
export function useMainScreen() {
  const context = useContext(MainScreenContext);
  if (context === undefined) {
    throw new Error("useMainScreen must be used within MainScreenProvider");
  }
  return context;
}
