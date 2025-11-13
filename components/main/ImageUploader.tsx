"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { validateImageFile } from "@/lib/utils/validation";

/**
 * ImageUploaderコンポーネントのプロパティ
 */
export interface ImageUploaderProps {
  /** 画像が選択されたときのコールバック */
  onImageSelect: (file: File) => void;
  /** エラーが発生したときのコールバック */
  onError?: (error: string) => void;
  /** 現在選択されている画像ファイル */
  selectedImage?: File | null;
  /** アップロードエリアが無効化されているかどうか */
  disabled?: boolean;
}

/**
 * 画像アップロードコンポーネント
 *
 * ファイル選択ダイアログとドラッグ&ドロップの両方をサポートする
 * JPEG、PNG、WEBP形式の画像を受け付け、10MBまでのファイルサイズ制限がある
 *
 * @param props - コンポーネントのプロパティ
 *
 * @example
 * ```tsx
 * <ImageUploader
 *   onImageSelect={(file) => console.log('Selected:', file)}
 *   onError={(error) => console.error(error)}
 * />
 * ```
 */
export function ImageUploader({
  onImageSelect,
  onError,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * ファイルを処理する
   */
  const handleFile = useCallback(
    (file: File) => {
      // バリデーション実行
      const validationResult = validateImageFile(file);

      if (!validationResult.isValid) {
        if (onError && validationResult.error) {
          onError(validationResult.error);
        }
        return;
      }

      // プレビューURLを生成
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // 親コンポーネントに通知
      onImageSelect(file);
    },
    [onImageSelect, onError],
  );

  /**
   * ファイル選択ダイアログからのファイル選択を処理
   */
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  /**
   * ドラッグオーバーイベントを処理
   */
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  /**
   * ドラッグリーブイベントを処理
   */
  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    [],
  );

  /**
   * ドロップイベントを処理
   */
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (disabled) {
        return;
      }

      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile],
  );

  /**
   * アップロードエリアのクリックを処理
   */
  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  /**
   * キーボードイベントを処理（アクセシビリティ対応）
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!disabled && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [disabled],
  );

  /**
   * 画像をクリアする
   */
  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      // プレビューURLをクリーンアップ
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [previewUrl],
  );

  return (
    <div className="w-full relative">
      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* アップロードエリア */}
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
        aria-label="画像をアップロード"
        className={`
          relative
          flex
          flex-col
          items-center
          justify-center
          w-full
          min-h-[300px]
          border-2
          border-dashed
          rounded-lg
          transition-all
          duration-200
          ${
            disabled
              ? "cursor-not-allowed bg-gray-100 border-gray-300"
              : isDragging
                ? "cursor-pointer bg-blue-50 border-blue-500"
                : "cursor-pointer bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
        `}
      >
        {previewUrl ? (
          // プレビュー表示
          <Image
            src={previewUrl}
            alt="アップロードされた画像のプレビュー"
            width={800}
            height={400}
            className="max-w-full max-h-[400px] object-contain rounded"
            unoptimized
          />
        ) : (
          // アップロード待機状態
          <>
            <Upload
              className={`w-12 h-12 mb-4 ${
                disabled
                  ? "text-gray-400"
                  : isDragging
                    ? "text-blue-500"
                    : "text-gray-400"
              }`}
            />
            <p
              className={`text-lg font-medium mb-2 ${
                disabled
                  ? "text-gray-400"
                  : isDragging
                    ? "text-blue-600"
                    : "text-gray-700"
              }`}
            >
              {isDragging ? "画像をドロップ" : "画像をアップロード"}
            </p>
            <p className="text-sm text-gray-500 text-center">
              クリックしてファイルを選択するか
              <br />
              ドラッグ&ドロップしてください
            </p>
            <p className="text-xs text-gray-400 mt-4">
              JPEG、PNG、WEBP形式（最大10MB）
            </p>
          </>
        )}
      </button>

      {/* クリアボタン（画像プレビュー時のみ表示） */}
      {previewUrl && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
          aria-label="画像をクリア"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      )}
    </div>
  );
}
