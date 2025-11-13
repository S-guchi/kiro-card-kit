/**
 * 画像解析APIエンドポイント
 * アップロードされた画像をVision APIで解析し、特徴を抽出する
 */

import { type NextRequest, NextResponse } from "next/server";
import { analyzeImage, VisionAPIError } from "@/lib/services/visionService";
import type { ImageFeatures } from "@/types/card";

/**
 * 画像解析APIのレスポンス型
 */
interface AnalyzeImageResponse {
  success: boolean;
  features?: ImageFeatures;
  error?: {
    message: string;
    code: string;
    retryable: boolean;
  };
}

/**
 * POST /api/analyze-image
 * 画像を解析して特徴を抽出する
 *
 * @param request - Next.jsリクエストオブジェクト
 * @returns 画像解析結果またはエラー
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<AnalyzeImageResponse>> {
  try {
    // FormDataから画像ファイルを取得
    const formData = await request.formData();
    const imageFile = formData.get("image");

    // 画像ファイルの検証
    if (!imageFile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "画像ファイルが指定されていません",
            code: "MISSING_IMAGE",
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    if (!(imageFile instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "無効な画像ファイル形式です",
            code: "INVALID_FILE_TYPE",
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    // ファイルサイズの検証（10MB制限）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "画像ファイルのサイズが大きすぎます（最大10MB）",
            code: "FILE_TOO_LARGE",
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    // ファイル形式の検証
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "サポートされていない画像形式です（JPEG、PNG、WEBPのみ）",
            code: "UNSUPPORTED_FORMAT",
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    // Vision APIで画像を解析
    const features = await analyzeImage(imageFile);

    // 成功レスポンスを返す
    return NextResponse.json(
      {
        success: true,
        features,
      },
      { status: 200 },
    );
  } catch (error) {
    // VisionAPIErrorの処理
    if (error instanceof VisionAPIError) {
      console.error("Vision APIエラー:", {
        message: error.message,
        code: error.code,
        retryable: error.retryable,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            retryable: error.retryable,
          },
        },
        { status: error.retryable ? 503 : 500 },
      );
    }

    // その他のエラー
    console.error("予期しないエラー:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "画像解析中に予期しないエラーが発生しました",
          code: "INTERNAL_ERROR",
          retryable: false,
        },
      },
      { status: 500 },
    );
  }
}
