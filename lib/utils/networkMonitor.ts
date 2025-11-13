/**
 * ネットワーク監視ユーティリティ
 *
 * @remarks
 * ネットワーク接続状態を監視し、オフライン状態を検出する。
 * リトライ機能も提供する。
 * 要件: 10.6
 */

/**
 * ネットワーク状態の型
 */
export interface NetworkStatus {
  /** オンラインかどうか */
  isOnline: boolean;
  /** 最後にオンラインになった時刻 */
  lastOnlineAt: Date | null;
  /** 最後にオフラインになった時刻 */
  lastOfflineAt: Date | null;
}

/**
 * リトライ設定の型
 */
export interface RetryOptions {
  /** 最大リトライ回数 */
  maxRetries: number;
  /** リトライ間隔（ミリ秒） */
  retryDelay: number;
  /** 指数バックオフを使用するか */
  exponentialBackoff: boolean;
  /** リトライ可能なエラーコードの配列 */
  retryableStatusCodes?: number[];
  /** リトライ時のコールバック（オプション） */
  onRetry?: (attempt: number, maxRetries: number, error: unknown) => void;
}

/**
 * デフォルトのリトライ設定
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * ネットワーク状態を取得する
 *
 * @returns 現在のネットワーク状態
 *
 * @remarks
 * ブラウザのnavigator.onLineを使用してオンライン状態を判定する。
 */
export function getNetworkStatus(): NetworkStatus {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  return {
    isOnline,
    lastOnlineAt: isOnline ? new Date() : null,
    lastOfflineAt: !isOnline ? new Date() : null,
  };
}

/**
 * ネットワーク状態の変化を監視する
 *
 * @param onOnline - オンラインになった時のコールバック
 * @param onOffline - オフラインになった時のコールバック
 * @returns クリーンアップ関数
 *
 * @remarks
 * window.addEventListener('online')とwindow.addEventListener('offline')を使用する。
 * 返されたクリーンアップ関数を呼び出すことでイベントリスナーを削除できる。
 */
export function monitorNetworkStatus(
  onOnline: () => void,
  onOffline: () => void,
): () => void {
  if (typeof window === "undefined") {
    // サーバーサイドでは何もしない
    return () => {};
  }

  const handleOnline = () => {
    console.log("[NetworkMonitor] オンラインになりました");
    onOnline();
  };

  const handleOffline = () => {
    console.log("[NetworkMonitor] オフラインになりました");
    onOffline();
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

/**
 * 指定された遅延時間だけ待機する
 *
 * @param ms - 待機時間（ミリ秒）
 * @returns Promiseオブジェクト
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * リトライ可能なエラーかどうかを判定する
 *
 * @param error - エラーオブジェクト
 * @param retryableStatusCodes - リトライ可能なステータスコードの配列
 * @returns リトライ可能な場合はtrue
 */
function isRetryableError(
  error: unknown,
  retryableStatusCodes: number[],
): boolean {
  // ネットワークエラーは常にリトライ可能
  if (error instanceof Error) {
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("NetworkError")
    ) {
      return true;
    }
  }

  // HTTPステータスコードをチェック
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return retryableStatusCodes.includes(error.status);
  }

  return false;
}

/**
 * リトライ機能付きでAPIリクエストを実行する
 *
 * @param fn - 実行する非同期関数
 * @param options - リトライ設定（オプション）
 * @returns 関数の実行結果
 * @throws 最大リトライ回数に達した場合、最後のエラーをスローする
 *
 * @remarks
 * - ネットワークエラーや一時的なサーバーエラーの場合、自動的にリトライする
 * - 指数バックオフを使用する場合、リトライ間隔が徐々に長くなる
 * - 要件: 10.6
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => {
 *     const response = await fetch('/api/analyze-image', {
 *       method: 'POST',
 *       body: formData,
 *     });
 *     return response.json();
 *   },
 *   { maxRetries: 3, retryDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // オフライン状態の場合は待機
      if (!getNetworkStatus().isOnline) {
        console.warn(
          `[NetworkMonitor] オフライン状態です。リトライ ${attempt + 1}/${opts.maxRetries + 1}`,
        );

        if (attempt < opts.maxRetries) {
          const delayMs = opts.exponentialBackoff
            ? opts.retryDelay * 2 ** attempt
            : opts.retryDelay;
          await delay(delayMs);
          continue;
        }

        throw new Error("ネットワークがオフラインです");
      }

      // 関数を実行
      return await fn();
    } catch (error) {
      lastError = error;

      // リトライ可能なエラーかチェック
      if (
        !isRetryableError(error, opts.retryableStatusCodes || []) ||
        attempt >= opts.maxRetries
      ) {
        throw error;
      }

      // リトライ前に待機
      const delayMs = opts.exponentialBackoff
        ? opts.retryDelay * 2 ** attempt
        : opts.retryDelay;

      console.warn(
        `[NetworkMonitor] リトライ ${attempt + 1}/${opts.maxRetries}（${delayMs}ms後）`,
        error,
      );

      // リトライコールバックを呼び出す
      if (opts.onRetry) {
        opts.onRetry(attempt + 1, opts.maxRetries, error);
      }

      await delay(delayMs);
    }
  }

  // 最大リトライ回数に達した場合
  throw lastError;
}

/**
 * オフライン状態かどうかをチェックする
 *
 * @returns オフラインの場合はtrue
 */
export function isOffline(): boolean {
  return !getNetworkStatus().isOnline;
}

/**
 * オンライン状態になるまで待機する
 *
 * @param timeout - タイムアウト時間（ミリ秒、オプション）
 * @returns オンラインになった場合はtrue、タイムアウトした場合はfalse
 *
 * @remarks
 * タイムアウトを指定しない場合、オンラインになるまで無期限に待機する。
 */
export async function waitForOnline(timeout?: number): Promise<boolean> {
  if (getNetworkStatus().isOnline) {
    return true;
  }

  return new Promise((resolve) => {
    let timeoutId: NodeJS.Timeout | undefined;

    const cleanup = monitorNetworkStatus(
      () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        cleanup();
        resolve(true);
      },
      () => {
        // オフラインイベントは無視
      },
    );

    if (timeout) {
      timeoutId = setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeout);
    }
  });
}
