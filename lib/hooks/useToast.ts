"use client";

import { useCallback, useState } from "react";
import type { ToastProps, ToastType } from "@/components/common/Toast";

/**
 * トースト追加オプション
 */
export interface AddToastOptions {
  /** メッセージ */
  message: string;
  /** 説明（オプション） */
  description?: string;
  /** 表示時間（ミリ秒、0の場合は自動で閉じない） */
  duration?: number;
  /** 閉じるボタンを表示するか */
  closable?: boolean;
  /** 閉じた時のコールバック */
  onClose?: () => void;
}

/**
 * トースト管理用のカスタムフック
 *
 * @returns トースト管理機能
 *
 * @remarks
 * トーストの追加、削除、クリアを行う。
 * 要件: 10.8
 *
 * @example
 * ```tsx
 * const { toasts, addToast, removeToast } = useToast();
 *
 * // エラートーストを表示
 * addToast.error('エラーが発生しました');
 *
 * // 成功トーストを表示
 * addToast.success('保存しました');
 * ```
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  /**
   * トーストを追加する
   *
   * @param type - トーストの種類
   * @param options - トーストオプション
   */
  const addToast = useCallback((type: ToastType, options: AddToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastProps = {
      id,
      type,
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  /**
   * トーストを削除する
   *
   * @param id - トーストのID
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * 全てのトーストをクリアする
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * 成功トーストを表示する
   *
   * @param message - メッセージ
   * @param options - オプション
   */
  const success = useCallback(
    (message: string, options?: Omit<AddToastOptions, "message">) => {
      addToast("success", { message, ...options });
    },
    [addToast],
  );

  /**
   * エラートーストを表示する
   *
   * @param message - メッセージ
   * @param options - オプション
   */
  const error = useCallback(
    (message: string, options?: Omit<AddToastOptions, "message">) => {
      addToast("error", { message, ...options });
    },
    [addToast],
  );

  /**
   * 警告トーストを表示する
   *
   * @param message - メッセージ
   * @param options - オプション
   */
  const warning = useCallback(
    (message: string, options?: Omit<AddToastOptions, "message">) => {
      addToast("warning", { message, ...options });
    },
    [addToast],
  );

  /**
   * 情報トーストを表示する
   *
   * @param message - メッセージ
   * @param options - オプション
   */
  const info = useCallback(
    (message: string, options?: Omit<AddToastOptions, "message">) => {
      addToast("info", { message, ...options });
    },
    [addToast],
  );

  /**
   * オフライントーストを表示する
   *
   * @param message - メッセージ
   * @param options - オプション
   */
  const offline = useCallback(
    (message: string, options?: Omit<AddToastOptions, "message">) => {
      addToast("offline", {
        message,
        duration: 0, // オフライン通知は自動で閉じない
        ...options,
      });
    },
    [addToast],
  );

  return {
    toasts,
    addToast: {
      success,
      error,
      warning,
      info,
      offline,
    },
    removeToast,
    clearToasts,
  };
}
