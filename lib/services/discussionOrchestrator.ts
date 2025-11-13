import type { CardData } from "@/types/card";
import type { DiscussionMessage } from "@/types/discussion";
import type { Evaluator } from "@/types/evaluator";
import type { ImageFeatures } from "@/types/image";
import {
  type CardElementGenerationResult,
  generateCardElement,
} from "./cardGenerationService";

/**
 * 議論オーケストレーターの結果を表す型
 *
 * @remarks
 * 4人の評議員が並列で生成したカード要素を統合した結果。
 * 各評議員の発言メッセージも含まれる。
 */
export interface DiscussionResult {
  /** 統合されたカードデータ */
  cardData: Omit<CardData, "id" | "createdAt" | "discussionLog" | "skinId">;
  /** 議論ログ（評議員の発言メッセージ） */
  discussionLog: DiscussionMessage[];
  /** 各評議員の生成結果 */
  evaluatorResults: Map<string, CardElementGenerationResult>;
}

/**
 * 議論オーケストレーターのエラーを表すクラス
 *
 * @remarks
 * 画像解析や評議員の生成処理で発生したエラーをラップする。
 */
export class DiscussionOrchestratorError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DiscussionOrchestratorError";
  }
}

/**
 * 議論を実行し、4人の評議員が並列でカード要素を生成する
 *
 * @param imageFeatures - 画像解析結果（全評議員で共有）
 * @param evaluators - 4人の評議員の配列
 * @returns 議論結果（統合されたカードデータと議論ログ）
 * @throws DiscussionOrchestratorError - 評議員の生成処理が失敗した場合
 *
 * @remarks
 * - 画像解析結果を全評議員で共有する（要件2.5）
 * - 4人の評議員のカード要素生成を並列実行する（要件3.8）
 * - 各評議員の生成結果を収集する（要件3.9）
 * - Promise.allを使用して並列実行し、パフォーマンスを最適化する（要件11.1, 11.3）
 */
export async function orchestrateDiscussion(
  imageFeatures: ImageFeatures,
  evaluators: Evaluator[],
): Promise<DiscussionResult> {
  // 評議員が4人であることを検証
  if (evaluators.length !== 4) {
    throw new DiscussionOrchestratorError(
      `評議員は4人である必要があります。現在: ${evaluators.length}人`,
    );
  }

  try {
    // 4人の評議員のカード要素生成を並列実行（要件3.8）
    const generationPromises = evaluators.map(async (evaluator) => {
      const result = await generateCardElement({
        imageFeatures, // 画像解析結果を全評議員で共有（要件2.5）
        evaluator,
      });

      return {
        evaluator,
        result,
      };
    });

    // 全ての生成処理が完了するまで待機
    const generationResults = await Promise.all(generationPromises);

    // 各評議員の生成結果を収集（要件3.9）
    const evaluatorResults = new Map<string, CardElementGenerationResult>();
    const discussionLog: DiscussionMessage[] = [];

    for (const { evaluator, result } of generationResults) {
      evaluatorResults.set(evaluator.id, result);

      // 議論ログに評議員の発言を追加
      discussionLog.push({
        id: `${evaluator.id}-${Date.now()}`,
        evaluatorId: evaluator.id,
        evaluatorName: evaluator.name,
        message: result.message,
        timestamp: new Date(),
        type: "discussion",
      });
    }

    // カードデータを統合
    const cardData = integrateCardData(generationResults, imageFeatures);

    return {
      cardData,
      discussionLog,
      evaluatorResults,
    };
  } catch (error) {
    console.error(
      "[DiscussionOrchestrator] 議論の実行中にエラーが発生:",
      error,
    );
    throw new DiscussionOrchestratorError(
      "議論の実行中にエラーが発生しました",
      error,
    );
  }
}

/**
 * 各評議員の生成結果を統合してカードデータを作成する
 *
 * @param generationResults - 各評議員の生成結果
 * @param imageFeatures - 画像解析結果
 * @returns 統合されたカードデータ
 *
 * @remarks
 * - 評議員1（name）: カード名を採用（要件5.2）
 * - 評議員2（flavor）: フレーバーテキストを採用（要件5.3）
 * - 評議員3（attribute）: 属性を採用（要件5.4）
 * - 評議員4（color-rarity）: 色・レア度を採用（要件5.5）
 */
function integrateCardData(
  generationResults: Array<{
    evaluator: Evaluator;
    result: CardElementGenerationResult;
  }>,
  imageFeatures: ImageFeatures,
): Omit<CardData, "id" | "createdAt" | "discussionLog" | "skinId"> {
  // 各評議員の結果を責任別に取得
  const nameResult = generationResults.find(
    (r) => r.evaluator.responsibility === "name",
  )?.result;
  const flavorResult = generationResults.find(
    (r) => r.evaluator.responsibility === "flavor",
  )?.result;
  const attributeResult = generationResults.find(
    (r) => r.evaluator.responsibility === "attribute",
  )?.result;
  const colorRarityResult = generationResults.find(
    (r) => r.evaluator.responsibility === "color-rarity",
  )?.result;

  // デフォルト値を設定（生成失敗時のフォールバック）
  const name = nameResult?.name || "不明なカード";
  const flavorText = flavorResult?.flavor || "謎に包まれた存在";
  const attribute = attributeResult?.attribute || "Fire";
  const rarity = colorRarityResult?.rarity || "Common";

  // 効果テキストは画像の詳細説明から生成
  const effect = `${imageFeatures.objectType}の力を宿す`;

  return {
    name,
    attribute,
    rarity,
    effect,
    flavorText,
    description: imageFeatures.detailedDescription,
    imagePath: "", // 後で設定される
    imageData: "", // 後で設定される
  };
}
