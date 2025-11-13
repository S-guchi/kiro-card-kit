import { NextResponse } from "next/server";
import {
  type CardElementGenerationResult,
  generateCardElement,
} from "@/lib/services/cardGenerationService.js";
import { generateApologyMessage } from "@/lib/utils/apologyMessages";
import { ErrorCode, handleError } from "@/lib/utils/errorHandler";
import type { Evaluator } from "@/types/evaluator.js";
import type { ImageFeatures } from "@/types/image.js";

/**
 * カード要素生成APIのリクエストボディの型
 */
interface GenerateCardElementsRequestBody {
  /** 画像解析結果 */
  imageFeatures: ImageFeatures;
  /** 評議員情報 */
  evaluator: Evaluator;
}

/**
 * カード要素生成APIのレスポンスの型
 */
interface GenerateCardElementsResponse {
  /** 生成結果（成功時のみ） */
  result?: CardElementGenerationResult;
  /** 成功フラグ */
  success: boolean;
  /** エラーメッセージ（エラー時のみ） */
  error?: string;
}

/**
 * カード要素生成APIエンドポイント
 *
 * @remarks
 * POST /api/generate-card-elements
 *
 * 評議員の責任（name、flavor、attribute、color-rarity）に応じて
 * カード要素を生成し、評議員の発言メッセージも生成する。
 *
 * 4人の評議員に対して並列で呼び出されることを想定している。
 *
 * @param request - Next.jsのリクエストオブジェクト
 * @returns カード要素生成結果のレスポンス
 */
export async function POST(request: Request) {
  let body: GenerateCardElementsRequestBody | undefined;

  try {
    // リクエストボディを解析
    body = (await request.json()) as GenerateCardElementsRequestBody;

    // バリデーション
    if (!body.imageFeatures) {
      return NextResponse.json(
        {
          success: false,
          error: "imageFeatures is required",
        } satisfies GenerateCardElementsResponse,
        { status: 400 },
      );
    }

    if (!body.evaluator) {
      return NextResponse.json(
        {
          success: false,
          error: "evaluator is required",
        } satisfies GenerateCardElementsResponse,
        { status: 400 },
      );
    }

    // 評議員の責任が有効かチェック
    const validResponsibilities = [
      "name",
      "flavor",
      "attribute",
      "color-rarity",
    ];
    if (!validResponsibilities.includes(body.evaluator.responsibility)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid responsibility: ${body.evaluator.responsibility}`,
        } satisfies GenerateCardElementsResponse,
        { status: 400 },
      );
    }

    // カード要素を生成
    const result = await generateCardElement({
      imageFeatures: body.imageFeatures,
      evaluator: body.evaluator,
    });

    // 成功レスポンスを返す
    return NextResponse.json({
      success: true,
      result,
    } satisfies GenerateCardElementsResponse);
  } catch (error) {
    // エラーハンドリング（要件: 10.2, 10.3, 10.7, 10.8）
    const cardError = handleError(error, {
      context: {
        endpoint: "/api/generate-card-elements",
        evaluator: body?.evaluator?.name,
      },
    });

    // 謝罪メッセージを生成
    const apologyMessage = generateApologyMessage(cardError.code);

    // ステータスコードを決定
    let statusCode = 500;
    if (cardError.code === ErrorCode.NETWORK_ERROR) {
      statusCode = 503; // Service Unavailable
    }

    // エラーレスポンスを返す
    return NextResponse.json(
      {
        success: false,
        error: cardError.toUserMessage(),
        result: {
          message: apologyMessage,
        },
      } satisfies GenerateCardElementsResponse,
      { status: statusCode },
    );
  }
}
