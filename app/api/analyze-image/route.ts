import { type NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/services/visionService";
import { ErrorCode, handleError } from "@/lib/utils/errorHandler";
import type { ImageFeatures } from "@/types/image";

/**
 * 画像解析APIエンドポイント
 *
 * @remarks
 * POSTリクエストで画像データを受け取り、Vision APIで解析して特徴を返す。
 * 要件2.1, 2.4, 2.6に対応。
 */

/**
 * リクエストボディの型定義
 */
interface AnalyzeImageRequest {
  /** Base64エンコードされた画像データ */
  imageBase64: string;
}

/**
 * レスポンスボディの型定義（成功時）
 */
interface AnalyzeImageResponse {
  /** 画像の特徴データ */
  features: ImageFeatures;
}

/**
 * レスポンスボディの型定義（エラー時）
 */
interface ErrorResponse {
  /** エラーメッセージ */
  error: string;
  /** エラーの詳細（オプション） */
  details?: string;
}

/**
 * POST /api/analyze-image
 *
 * @param request - Next.jsのリクエストオブジェクト
 * @returns 画像解析結果またはエラーレスポンス
 *
 * @remarks
 * - リクエストボディにimageBase64フィールドが必要
 * - Vision APIを使用して画像を解析
 * - エラー時は適切なHTTPステータスコードとエラーメッセージを返す
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得とバリデーション
    const body = (await request.json()) as AnalyzeImageRequest;

    if (!body.imageBase64) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "imageBase64フィールドが必要です",
        },
        { status: 400 },
      );
    }

    if (typeof body.imageBase64 !== "string") {
      return NextResponse.json<ErrorResponse>(
        {
          error: "imageBase64は文字列である必要があります",
        },
        { status: 400 },
      );
    }

    // Base64データの基本的な検証
    if (!isValidBase64(body.imageBase64)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "無効なBase64データです",
        },
        { status: 400 },
      );
    }

    // Vision APIで画像を解析
    const features = await analyzeImage(body.imageBase64);

    // 成功レスポンスを返す
    return NextResponse.json<AnalyzeImageResponse>(
      {
        features,
      },
      { status: 200 },
    );
  } catch (error) {
    // エラーハンドリング（要件: 10.1, 10.6, 10.7, 10.8）
    const cardError = handleError(error, {
      context: { endpoint: "/api/analyze-image" },
    });

    // ステータスコードを決定
    let statusCode = 500;
    if (cardError.code === ErrorCode.NETWORK_ERROR) {
      statusCode = 503; // Service Unavailable
    } else if (
      cardError.code === ErrorCode.IMAGE_FORMAT_INVALID ||
      cardError.code === ErrorCode.IMAGE_SIZE_EXCEEDED
    ) {
      statusCode = 400; // Bad Request
    }

    return NextResponse.json<ErrorResponse>(
      {
        error: cardError.toUserMessage(),
        details: cardError.message,
      },
      { status: statusCode },
    );
  }
}

/**
 * Base64文字列の基本的な検証
 *
 * @param str - 検証する文字列
 * @returns Base64として有効な場合はtrue
 *
 * @remarks
 * - 空文字列はfalse
 * - Base64の文字セット（A-Z, a-z, 0-9, +, /, =）のみを許可
 * - 最小限の長さチェック
 */
function isValidBase64(str: string): boolean {
  if (!str || str.length === 0) {
    return false;
  }

  // Base64の正規表現パターン
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;

  // 最小限の長さチェック（少なくとも数バイトは必要）
  if (str.length < 10) {
    return false;
  }

  return base64Pattern.test(str);
}
