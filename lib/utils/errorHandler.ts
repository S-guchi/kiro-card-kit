/**
 * エラーハンドリングサービス
 *
 * @remarks
 * アプリケーション全体で使用するエラーハンドリング機能を提供する。
 * カード生成プロセスで発生するエラーを適切に分類し、
 * ユーザーフレンドリーなメッセージとログ出力を行う。
 */

/**
 * エラーコードの定義
 */
export enum ErrorCode {
  /** 画像アップロードエラー */
  IMAGE_UPLOAD_ERROR = "IMAGE_UPLOAD_ERROR",
  /** 画像サイズ超過エラー */
  IMAGE_SIZE_EXCEEDED = "IMAGE_SIZE_EXCEEDED",
  /** 画像形式不正エラー */
  IMAGE_FORMAT_INVALID = "IMAGE_FORMAT_INVALID",
  /** Vision API解析失敗 */
  VISION_API_ERROR = "VISION_API_ERROR",
  /** AI生成失敗 */
  AI_GENERATION_ERROR = "AI_GENERATION_ERROR",
  /** ネットワークエラー */
  NETWORK_ERROR = "NETWORK_ERROR",
  /** LocalStorage容量超過 */
  STORAGE_QUOTA_EXCEEDED = "STORAGE_QUOTA_EXCEEDED",
  /** 不明なエラー */
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * エラーの重要度レベル
 */
export enum ErrorSeverity {
  /** 情報レベル */
  INFO = "INFO",
  /** 警告レベル */
  WARNING = "WARNING",
  /** エラーレベル */
  ERROR = "ERROR",
  /** 致命的エラー */
  CRITICAL = "CRITICAL",
}

/**
 * カード生成エラークラス
 *
 * @remarks
 * カード生成プロセスで発生する全てのエラーを表現する。
 * エラーコード、リトライ可否、重要度レベルを含む。
 */
export class CardGenerationError extends Error {
  /**
   * エラーコンストラクタ
   *
   * @param message - エラーメッセージ
   * @param code - エラーコード
   * @param retryable - リトライ可能かどうか
   * @param severity - エラーの重要度レベル
   * @param originalError - 元のエラーオブジェクト（オプション）
   */
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly retryable: boolean,
    public readonly severity: ErrorSeverity = ErrorSeverity.ERROR,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "CardGenerationError";

    // スタックトレースを適切に設定
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CardGenerationError);
    }
  }

  /**
   * エラーを日本語のユーザーフレンドリーなメッセージに変換する
   *
   * @returns ユーザー向けエラーメッセージ
   */
  toUserMessage(): string {
    switch (this.code) {
      case ErrorCode.IMAGE_SIZE_EXCEEDED:
        return "画像サイズが大きすぎます。10MB以下の画像を選択してください。";
      case ErrorCode.IMAGE_FORMAT_INVALID:
        return "対応していない画像形式です。JPEG、PNG、WEBP形式の画像を選択してください。";
      case ErrorCode.VISION_API_ERROR:
        return "画像の解析に失敗しました。別の画像で試してみてください。";
      case ErrorCode.AI_GENERATION_ERROR:
        return "カードの生成に失敗しました。もう一度お試しください。";
      case ErrorCode.NETWORK_ERROR:
        return "ネットワークエラーが発生しました。インターネット接続を確認してください。";
      case ErrorCode.STORAGE_QUOTA_EXCEEDED:
        return "保存容量が不足しています。古いカードを削除してください。";
      case ErrorCode.IMAGE_UPLOAD_ERROR:
        return "画像のアップロードに失敗しました。もう一度お試しください。";
      default:
        return "予期しないエラーが発生しました。もう一度お試しください。";
    }
  }
}

/**
 * エラーログ出力オプション
 */
interface ErrorLogOptions {
  /** コンテキスト情報 */
  context?: Record<string, unknown>;
  /** ユーザーID（オプション） */
  userId?: string;
  /** セッションID（オプション） */
  sessionId?: string;
}

/**
 * エラーログを出力する
 *
 * @param error - エラーオブジェクト
 * @param options - ログ出力オプション
 *
 * @remarks
 * エラーの重要度に応じて適切なログレベルで出力する。
 * 本番環境では外部ログサービスへの送信も検討可能。
 */
export function logError(
  error: CardGenerationError | Error,
  options: ErrorLogOptions = {},
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    name: error.name,
    message: error.message,
    ...(error instanceof CardGenerationError && {
      code: error.code,
      retryable: error.retryable,
      severity: error.severity,
    }),
    ...options,
  };

  // 重要度に応じたログ出力
  if (error instanceof CardGenerationError) {
    switch (error.severity) {
      case ErrorSeverity.INFO:
        console.info("[INFO]", logData);
        break;
      case ErrorSeverity.WARNING:
        console.warn("[WARNING]", logData);
        break;
      case ErrorSeverity.ERROR:
        console.error("[ERROR]", logData);
        break;
      case ErrorSeverity.CRITICAL:
        console.error("[CRITICAL]", logData);
        // 本番環境では外部ログサービスへ送信
        break;
    }
  } else {
    console.error("[ERROR]", logData);
  }

  // スタックトレースを出力（開発環境のみ）
  if (process.env.NODE_ENV === "development" && error.stack) {
    console.error("Stack trace:", error.stack);
  }
}

/**
 * エラーから適切なCardGenerationErrorを生成する
 *
 * @param error - 元のエラーオブジェクト
 * @returns CardGenerationErrorインスタンス
 *
 * @remarks
 * 既知のエラーパターンを検出し、適切なエラーコードとメッセージを設定する。
 */
export function createCardGenerationError(error: unknown): CardGenerationError {
  // 既にCardGenerationErrorの場合はそのまま返す
  if (error instanceof CardGenerationError) {
    return error;
  }

  // Errorオブジェクトの場合
  if (error instanceof Error) {
    // ネットワークエラーの検出
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("NetworkError")
    ) {
      return new CardGenerationError(
        error.message,
        ErrorCode.NETWORK_ERROR,
        true,
        ErrorSeverity.WARNING,
        error,
      );
    }

    // Vision APIエラーの検出
    if (
      error.message.includes("Vision API") ||
      error.message.includes("画像解析")
    ) {
      return new CardGenerationError(
        error.message,
        ErrorCode.VISION_API_ERROR,
        false,
        ErrorSeverity.ERROR,
        error,
      );
    }

    // AI生成エラーの検出
    if (
      error.message.includes("AI") ||
      error.message.includes("生成") ||
      error.message.includes("generateText")
    ) {
      return new CardGenerationError(
        error.message,
        ErrorCode.AI_GENERATION_ERROR,
        false,
        ErrorSeverity.ERROR,
        error,
      );
    }

    // LocalStorageエラーの検出
    if (
      error.message.includes("QuotaExceededError") ||
      error.message.includes("storage")
    ) {
      return new CardGenerationError(
        error.message,
        ErrorCode.STORAGE_QUOTA_EXCEEDED,
        false,
        ErrorSeverity.WARNING,
        error,
      );
    }

    // その他のErrorオブジェクト
    return new CardGenerationError(
      error.message,
      ErrorCode.UNKNOWN_ERROR,
      false,
      ErrorSeverity.ERROR,
      error,
    );
  }

  // 文字列エラーの場合
  if (typeof error === "string") {
    return new CardGenerationError(
      error,
      ErrorCode.UNKNOWN_ERROR,
      false,
      ErrorSeverity.ERROR,
    );
  }

  // その他の不明なエラー
  return new CardGenerationError(
    "不明なエラーが発生しました",
    ErrorCode.UNKNOWN_ERROR,
    false,
    ErrorSeverity.ERROR,
    error,
  );
}

/**
 * エラーハンドリングのヘルパー関数
 *
 * @param error - エラーオブジェクト
 * @param options - ログ出力オプション
 * @returns CardGenerationErrorインスタンス
 *
 * @remarks
 * エラーの変換とログ出力を一度に行う便利な関数。
 */
export function handleError(
  error: unknown,
  options: ErrorLogOptions = {},
): CardGenerationError {
  const cardError = createCardGenerationError(error);
  logError(cardError, options);
  return cardError;
}
