"use client";

import { Component, type ReactNode } from "react";

/**
 * エラーバウンダリのプロパティ
 */
interface ErrorBoundaryProps {
  /** 子要素 */
  children: ReactNode;
  /** エラー時のフォールバックUI */
  fallback?: ReactNode;
}

/**
 * エラーバウンダリの状態
 */
interface ErrorBoundaryState {
  /** エラーが発生したかどうか */
  hasError: boolean;
  /** エラーオブジェクト */
  error: Error | null;
}

/**
 * エラーバウンダリコンポーネント
 * アプリケーション全体のエラーをキャッチして適切に処理する
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-red-600">
              エラーが発生しました
            </h2>
            <p className="mb-4 text-gray-700">
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            {this.state.error && (
              <pre className="mb-4 overflow-auto rounded bg-gray-100 p-3 text-sm text-gray-800">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
