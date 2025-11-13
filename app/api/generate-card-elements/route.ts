/**
 * カード要素生成APIエンドポイント
 * POST /api/generate-card-elements
 *
 * 評議員の責任に応じてカード要素を生成します
 */

import { NextResponse } from "next/server";
import {
  type CardElementResult,
  CardGenerationError,
  generateCardElement,
} from "@/lib/services/cardGenerationService";
import type { ImageFeatures } from "@/types/card";
import type { Evaluator } from "@/types/evaluator";

/**
 * リクエストボディの型定義
 */
interface GenerateCardElementsRequest {
  /** 画像解析結果 */
  imageFeatures: ImageFeatures;
  /** 評議員情報 */
  evaluator: Evaluator;
}

/**
 * レスポンスボディの型定義
 */
interface GenerateCardElementsResponse {
  /** 成功フラグ */
  success: boolean;
  /** カード要素生成結果 */
  result?: CardElementResult;
  /** エラーメッセージ */
  error?: string;
  /** エラーコード */
  code?: string;
  /** リトライ可能かどうか */
  retryable?: boolean;
}

/**
 * POST /api/generate-card-elements
 * カード要素を生成
 */
export async function POST(
  request: Request,
): Promise<NextResponse<GenerateCardElementsResponse>> {
  try {
    // リクエストボディの取得
    const body = (await request.json()) as GenerateCardElementsRequest;

    // バリデーション
    if (!body.imageFeatures) {
      return NextResponse.json(
        {
          success: false,
          error: "imageFeatures is required",
          code: "MISSING_IMAGE_FEATURES",
          retryable: false,
        },
        { status: 400 },
      );
    }

    if (!body.evaluator) {
      return NextResponse.json(
        {
          success: false,
          error: "evaluator is required",
          code: "MISSING_EVALUATOR",
          retryable: false,
        },
        { status: 400 },
      );
    }

    // 評議員の必須フィールドをバリデーション
    if (
      !body.evaluator.id ||
      !body.evaluator.name ||
      !body.evaluator.responsibility
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "evaluator is missing required fields",
          code: "INVALID_EVALUATOR",
          retryable: false,
        },
        { status: 400 },
      );
    }

    // 画像解析結果の必須フィールドをバリデーション
    if (
      !body.imageFeatures.objectType ||
      !body.imageFeatures.colors ||
      !body.imageFeatures.shapes ||
      !body.imageFeatures.materials ||
      !body.imageFeatures.detailedDescription
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "imageFeatures is missing required fields",
          code: "INVALID_IMAGE_FEATURES",
          retryable: false,
        },
        { status: 400 },
      );
    }

    // カード要素を生成
    const result = await generateCardElement(
      body.evaluator,
      body.imageFeatures,
    );

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    // CardGenerationErrorの場合
    if (error instanceof CardGenerationError) {
      console.error(`[${error.code}] Card generation failed: ${error.message}`);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          retryable: error.retryable,
        },
        { status: 500 },
      );
    }

    // その他のエラー
    console.error("Unexpected error in generate-card-elements:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        code: "INTERNAL_ERROR",
        retryable: false,
      },
      { status: 500 },
    );
  }
}
