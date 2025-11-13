"use client";

import { AlertCircle, CheckCircle, Info, WifiOff, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

/**
 * トーストの種類
 */
export type ToastType = "success" | "error" | "warning" | "info" | "offline";

/**
 * トーストのプロパティ
 */
export interface ToastProps {
  /** トーストのID */
  id: string;
  /** トーストの種類 */
  type: ToastType;
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
 * トーストコンポーネント
 *
 * @param props - トーストのプロパティ
 * @returns トーストコンポーネント
 *
 * @remarks
 * ユーザーフレンドリーなエラーメッセージを日本語で表示する。
 * 要件: 10.8
 */
export function Toast({
  type,
  message,
  description,
  duration = 5000,
  closable = true,
  onClose,
}: ToastProps) {
  // 自動クローズ
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // トーストの種類に応じたスタイルとアイコンを取得
  const getToastStyle = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-500",
          textColor: "text-green-800",
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        };
      case "error":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-500",
          textColor: "text-red-800",
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-500",
          textColor: "text-yellow-800",
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        };
      case "offline":
        return {
          bgColor: "bg-gray-50",
          borderColor: "border-gray-500",
          textColor: "text-gray-800",
          icon: <WifiOff className="w-5 h-5 text-gray-500" />,
        };
      default:
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-500",
          textColor: "text-blue-800",
          icon: <Info className="w-5 h-5 text-blue-500" />,
        };
    }
  };

  const style = getToastStyle();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className={`
        ${style.bgColor} ${style.borderColor} ${style.textColor}
        border-l-4 rounded-lg shadow-lg p-4 mb-3
        max-w-md w-full
      `}
    >
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>

        {/* メッセージ */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{message}</p>
          {description && (
            <p className="mt-1 text-xs opacity-80">{description}</p>
          )}
        </div>

        {/* 閉じるボタン */}
        {closable && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * トーストコンテナのプロパティ
 */
export interface ToastContainerProps {
  /** トーストの配列 */
  toasts: ToastProps[];
  /** トーストを削除するコールバック */
  onRemove: (id: string) => void;
}

/**
 * トーストコンテナコンポーネント
 *
 * @param props - コンテナのプロパティ
 * @returns トーストコンテナコンポーネント
 *
 * @remarks
 * 複数のトーストを画面右上に表示する。
 */
export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => {
                toast.onClose?.();
                onRemove(toast.id);
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
