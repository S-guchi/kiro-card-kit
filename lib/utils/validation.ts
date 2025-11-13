/**
 * バリデーションユーティリティ
 * 画像ファイルのバリデーション機能を提供
 */

/**
 * サポートされている画像形式
 */
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/**
 * 最大ファイルサイズ（10MB）
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * バリデーションエラーの型
 */
export interface ValidationError {
  /** エラーコード */
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "INVALID_FILE";
  /** エラーメッセージ */
  message: string;
}

/**
 * バリデーション結果の型
 */
export interface ValidationResult {
  /** バリデーションが成功したか */
  isValid: boolean;
  /** エラー情報（バリデーション失敗時のみ） */
  error?: ValidationError;
}

/**
 * 画像ファイルのバリデーションを実行
 *
 * @param file - バリデーション対象のファイル
 * @returns バリデーション結果
 *
 * @example
 * ```typescript
 * const result = validateImageFile(file);
 * if (!result.isValid) {
 *   console.error(result.error?.message);
 * }
 * ```
 */
export function validateImageFile(file: File): ValidationResult {
  // ファイルが存在するかチェック
  if (!file) {
    return {
      isValid: false,
      error: {
        code: "INVALID_FILE",
        message: "ファイルが選択されていません",
      },
    };
  }

  // ファイル形式のチェック
  if (
    !SUPPORTED_IMAGE_TYPES.includes(
      file.type as (typeof SUPPORTED_IMAGE_TYPES)[number],
    )
  ) {
    return {
      isValid: false,
      error: {
        code: "INVALID_TYPE",
        message:
          "サポートされていないファイル形式です。JPEG、PNG、WEBP形式の画像を選択してください。",
      },
    };
  }

  // ファイルサイズのチェック
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: `ファイルサイズが大きすぎます（${sizeMB}MB）。10MB以下の画像を選択してください。`,
      },
    };
  }

  // バリデーション成功
  return {
    isValid: true,
  };
}

/**
 * ファイルが画像形式かどうかをチェック
 *
 * @param file - チェック対象のファイル
 * @returns 画像形式の場合true
 */
export function isImageFile(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(
    file.type as (typeof SUPPORTED_IMAGE_TYPES)[number],
  );
}

/**
 * ファイルサイズが制限内かどうかをチェック
 *
 * @param file - チェック対象のファイル
 * @returns サイズが制限内の場合true
 */
export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * ファイルサイズをMB単位で取得
 *
 * @param file - 対象のファイル
 * @returns ファイルサイズ（MB）
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}
