"use client";

import { Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { validateImageFile } from "@/lib/utils/validation";

/**
 * ImageUploaderコンポーネントのプロパティ
 */
interface ImageUploaderProps {
  /** 画像が選択されたときのコールバック */
  onImageSelect: (file: File) => void;
  /** 現在選択されている画像 */
  selectedImage: File | null;
  /** 画像をクリアするコールバック */
  onClear: () => void;
  /** アップロード中かどうか */
  disabled?: boolean;
}

/**
 * ImageUploaderコンポーネント
 *
 * 画像のアップロード機能を提供するコンポーネント
 * - ファイル選択ダイアログ
 * - ドラッグ&ドロップ
 * - JPEG、PNG、WEBP形式のサポート
 * - ファイルサイズ制限（10MB）
 *
 * @param props - コンポーネントのプロパティ
 * @returns ImageUploaderコンポーネント
 */
export function ImageUploader({
  onImageSelect,
  selectedImage,
  onClear,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * ファイルを処理する
   */
  const handleFile = useCallback(
    (file: File) => {
      // エラーをクリア
      setError(null);

      // バリデーション
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error?.message ?? "ファイルの検証に失敗しました");
        return;
      }

      // 画像を選択
      onImageSelect(file);
    },
    [onImageSelect],
  );

  /**
   * ファイル選択ダイアログを開く
   */
  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  /**
   * ファイル選択時の処理
   */
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // inputをリセット（同じファイルを再選択可能にする）
      event.target.value = "";
    },
    [handleFile],
  );

  /**
   * ドラッグオーバー時の処理
   */
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) return;
      setIsDragging(true);
    },
    [disabled],
  );

  /**
   * ドラッグリーブ時の処理
   */
  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
    },
    [],
  );

  /**
   * ドロップ時の処理
   */
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile],
  );

  /**
   * クリア処理
   */
  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setError(null);
      onClear();
    },
    [onClear],
  );

  return (
    <div className="w-full">
      {/* 画像が選択されていない場合 */}
      {!selectedImage && (
        <button
          type="button"
          className={`
            relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer w-full
            ${
              isDragging
                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                : "border-purple-300 bg-white/50 dark:border-zinc-700 dark:bg-zinc-950/50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/10"}
            backdrop-blur-sm
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          disabled={disabled}
          aria-label="画像をアップロード"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
            aria-label="ファイルを選択"
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className={`
              rounded-full p-4 transition-colors
              ${
                isDragging
                  ? "bg-purple-500 text-white"
                  : "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
              }
            `}
            >
              <Upload className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {isDragging ? "ここにドロップ" : "画像をアップロード"}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                クリックして選択、またはドラッグ&ドロップ
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                JPEG、PNG、WEBP（最大10MB）
              </p>
            </div>
          </div>
        </button>
      )}

      {/* 画像が選択されている場合 */}
      {selectedImage && (
        <div className="relative rounded-xl overflow-hidden border-2 border-purple-300 dark:border-zinc-700 aspect-square">
          {/* biome-ignore lint/performance/noImgElement: Blob URLのため */}
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="アップロードされた画像"
            className="w-full h-full object-cover"
          />

          {/* クリアボタン */}
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-transform hover:scale-110 hover:bg-red-600"
              aria-label="画像をクリア"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* ファイル情報 */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2 text-white backdrop-blur-sm">
            <p className="text-sm font-medium truncate">{selectedImage.name}</p>
            <p className="text-xs text-zinc-300">
              {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
          <p className="font-semibold">エラー</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
