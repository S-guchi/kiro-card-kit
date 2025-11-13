/**
 * 画像バリデーションユーティリティ
 *
 * アップロードされた画像ファイルの検証を行う
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
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 画像バリデーション結果
 */
export interface ImageValidationResult {
  /** バリデーションが成功したかどうか */
  isValid: boolean;
  /** エラーメッセージ（バリデーション失敗時） */
  error?: string;
}

/**
 * 画像ファイルのバリデーションを実行する
 *
 * @param file - 検証する画像ファイル
 * @returns バリデーション結果
 *
 * @remarks
 * 以下の検証を行う：
 * - ファイル形式がJPEG、PNG、WEBPのいずれかであること
 * - ファイルサイズが10MB以下であること
 *
 * @example
 * ```typescript
 * const result = validateImageFile(file);
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateImageFile(file: File): ImageValidationResult {
  // ファイル形式のチェック
  if (
    !SUPPORTED_IMAGE_TYPES.includes(
      file.type as (typeof SUPPORTED_IMAGE_TYPES)[number],
    )
  ) {
    return {
      isValid: false,
      error:
        "サポートされていないファイル形式です。JPEG、PNG、またはWEBP形式の画像をアップロードしてください。",
    };
  }

  // ファイルサイズのチェック
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `ファイルサイズが大きすぎます（${sizeMB}MB）。10MB以下の画像をアップロードしてください。`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * サポートされている画像形式の配列を取得する
 *
 * @returns サポートされている画像形式の配列
 */
export function getSupportedImageTypes(): readonly string[] {
  return SUPPORTED_IMAGE_TYPES;
}

/**
 * 最大ファイルサイズを取得する（バイト単位）
 *
 * @returns 最大ファイルサイズ
 */
export function getMaxFileSize(): number {
  return MAX_FILE_SIZE;
}
