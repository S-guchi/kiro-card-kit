/**
 * 議論オーケストレーター
 * 画像解析結果を全評議員で共有し、4人の評議員のカード要素生成を並列実行する
 */

import type { ImageFeatures } from "@/types/card";
import type { Evaluator } from "@/types/evaluator";
import type { CardElementResult } from "./cardGenerationService";

/**
 * 評議員の生成結果
 */
export interface EvaluatorResult {
  /** 評議員情報 */
  evaluator: Evaluator;
  /** カード要素生成結果 */
  result: CardElementResult;
  /** 生成にかかった時間（ミリ秒） */
  duration: number;
}

/**
 * 議論オーケストレーションの結果
 */
export interface DiscussionResult {
  /** 全評議員の生成結果 */
  evaluatorResults: EvaluatorResult[];
  /** 画像解析結果 */
  imageFeatures: ImageFeatures;
  /** 総処理時間（ミリ秒） */
  totalDuration: number;
}

/**
 * 議論オーケストレーションエラー
 */
export class DiscussionOrchestrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean,
    public failedEvaluators?: string[],
  ) {
    super(message);
    this.name = "DiscussionOrchestrationError";
  }
}

/**
 * 単一の評議員のカード要素生成を実行
 *
 * @param evaluator - 評議員情報
 * @param imageFeatures - 画像解析結果
 * @returns 評議員の生成結果
 */
async function executeEvaluatorGeneration(
  evaluator: Evaluator,
  imageFeatures: ImageFeatures,
): Promise<EvaluatorResult> {
  const startTime = Date.now();

  try {
    // APIエンドポイントを呼び出してカード要素を生成
    const response = await fetch("/api/generate-card-elements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageFeatures,
        evaluator,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();

    if (!data.success || !data.result) {
      throw new Error(data.error || "Failed to generate card element");
    }

    const duration = Date.now() - startTime;

    return {
      evaluator,
      result: data.result,
      duration,
    };
  } catch (error) {
    console.error(`評議員 ${evaluator.name} の生成に失敗しました:`, error);

    throw new DiscussionOrchestrationError(
      `評議員 ${evaluator.name} の生成に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`,
      "EVALUATOR_GENERATION_FAILED",
      true,
      [evaluator.id],
    );
  }
}

/**
 * 4人の評議員のカード要素生成を並列実行
 *
 * @param evaluators - 評議員の配列（4人）
 * @param imageFeatures - 画像解析結果
 * @returns 議論オーケストレーションの結果
 * @throws {DiscussionOrchestrationError} 生成に失敗した場合
 */
export async function orchestrateDiscussion(
  evaluators: Evaluator[],
  imageFeatures: ImageFeatures,
): Promise<DiscussionResult> {
  const startTime = Date.now();

  // 評議員の数をバリデーション
  if (evaluators.length !== 4) {
    throw new DiscussionOrchestrationError(
      `評議員は4人である必要があります（現在: ${evaluators.length}人）`,
      "INVALID_EVALUATOR_COUNT",
      false,
    );
  }

  // 各評議員の責任が重複していないかチェック
  const responsibilities = evaluators.map((e) => e.responsibility);
  const uniqueResponsibilities = new Set(responsibilities);
  if (uniqueResponsibilities.size !== 4) {
    throw new DiscussionOrchestrationError(
      "評議員の責任が重複しています",
      "DUPLICATE_RESPONSIBILITIES",
      false,
    );
  }

  // 必要な責任が全て揃っているかチェック
  const requiredResponsibilities: Array<
    "name" | "flavor" | "attribute" | "color-rarity"
  > = ["name", "flavor", "attribute", "color-rarity"];
  for (const required of requiredResponsibilities) {
    if (!responsibilities.includes(required)) {
      throw new DiscussionOrchestrationError(
        `必要な責任 '${required}' を持つ評議員が見つかりません`,
        "MISSING_RESPONSIBILITY",
        false,
      );
    }
  }

  try {
    // 4人の評議員のカード要素生成を並列実行
    console.log("4人の評議員のカード要素生成を並列実行します...");

    const generationPromises = evaluators.map((evaluator) =>
      executeEvaluatorGeneration(evaluator, imageFeatures),
    );

    // Promise.allを使用して並列実行し、全ての結果を待つ
    const evaluatorResults = await Promise.all(generationPromises);

    const totalDuration = Date.now() - startTime;

    console.log(
      `全評議員の生成が完了しました（総処理時間: ${totalDuration}ms）`,
    );

    return {
      evaluatorResults,
      imageFeatures,
      totalDuration,
    };
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    console.error(
      `議論オーケストレーションに失敗しました（処理時間: ${totalDuration}ms）:`,
      error,
    );

    // DiscussionOrchestrationErrorはそのまま再スロー
    if (error instanceof DiscussionOrchestrationError) {
      throw error;
    }

    // その他のエラー
    throw new DiscussionOrchestrationError(
      `議論オーケストレーションに失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`,
      "ORCHESTRATION_FAILED",
      true,
    );
  }
}
