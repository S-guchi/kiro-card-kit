"use client";

import { toJpeg } from "html-to-image";
import { Download } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/common/Button";
import type { CardData } from "@/types/card";

/**
 * CardExporterコンポーネントのプロパティ
 */
export interface CardExporterProps {
  /** エクスポート対象のカードデータ */
  card: CardData;
  /** エクスポート対象のDOM要素への参照 */
  targetRef: React.RefObject<HTMLElement | null>;
  /** ボタンのバリアント（オプション） */
  variant?: "primary" | "secondary";
  /** ボタンのサイズ（オプション） */
  size?: "sm" | "md" | "lg";
  /** カスタムクラス名（オプション） */
  className?: string;
}

/**
 * カードをJPG形式で画像化してダウンロードするコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @returns CardExporterコンポーネント
 *
 * @remarks
 * 要件: 7.2
 * - カードをJPG形式で画像化
 * - ダウンロード機能を実装
 *
 * @TSDoc
 * このコンポーネントは、html-to-imageライブラリを使用して
 * カードのDOM要素をJPEG画像に変換し、ユーザーがダウンロードできるようにします。
 * 高品質（quality: 0.95）でエクスポートされます。
 *
 * @example
 * ```tsx
 * const cardRef = useRef<HTMLDivElement>(null);
 *
 * <div ref={cardRef}>
 *   <CardDisplay card={cardData} />
 * </div>
 * <CardExporter card={cardData} targetRef={cardRef} />
 * ```
 */
export function CardExporter({
  card,
  targetRef,
  variant = "primary",
  size = "md",
  className = "",
}: CardExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * カードをJPEG形式でエクスポートする
   *
   * @remarks
   * html-to-imageのtoJpeg関数を使用してDOM要素を画像化し、
   * ダウンロードリンクを生成してクリックすることでダウンロードを開始します。
   */
  const handleExport = useCallback(async () => {
    if (!targetRef.current) {
      setError("エクスポート対象の要素が見つかりません");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // DOM要素をJPEG形式のData URLに変換
      // quality: 0.95 で高品質な画像を生成
      // cacheBust: true でキャッシュの問題を回避
      const dataUrl = await toJpeg(targetRef.current, {
        quality: 0.95,
        cacheBust: true,
        pixelRatio: 2, // 高解像度デバイス対応
      });

      // ダウンロードリンクを作成
      const link = document.createElement("a");
      link.download = `${sanitizeFileName(card.name)}.jpg`;
      link.href = dataUrl;
      link.click();

      // メモリリークを防ぐためにリンクを削除
      link.remove();
    } catch (err) {
      console.error("カードのエクスポートに失敗しました:", err);
      setError("カードのエクスポートに失敗しました");
    } finally {
      setIsExporting(false);
    }
  }, [targetRef, card.name]);

  return (
    <div className={className}>
      <Button
        onClick={handleExport}
        variant={variant}
        size={size}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <Download className="w-5 h-5" />
        {isExporting ? "エクスポート中..." : "JPGでダウンロード"}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * ファイル名として使用できるように文字列をサニタイズする
 *
 * @param fileName - サニタイズ対象のファイル名
 * @returns サニタイズされたファイル名
 *
 * @remarks
 * ファイルシステムで使用できない文字を削除し、
 * 安全なファイル名を生成します。
 */
function sanitizeFileName(fileName: string): string {
  // ファイル名として使用できない文字を削除
  return fileName
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 100); // 最大100文字に制限
}
