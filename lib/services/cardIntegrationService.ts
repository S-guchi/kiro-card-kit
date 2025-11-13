import { LocalStorageManager } from "@/lib/storage/localStorageManager";
import type { CardData } from "@/types/card";
import type { DiscussionMessage } from "@/types/discussion";
import type { Evaluator } from "@/types/evaluator";
import type { ImageFeatures } from "@/types/image";
import type { CardElementGenerationResult } from "./cardGenerationService";

/**
 * カード統合リクエストの型
 *
 * @remarks
 * 各評議員の生成結果を統合してカードデータを作成するためのリクエスト。
 */
export interface CardIntegrationRequest {
  /** 各評議員の生成結果（評議員ID -> 生成結果のマップ） */
  evaluatorResults: Map<string, CardElementGenerationResult>;
  /** 評議員のリスト */
  evaluators: Evaluator[];
  /** 画像解析結果 */
  imageFeatures: ImageFeatures;
  /** 元画像のパス */
  imagePath: string;
  /** Base64エンコードされた画像データ */
  imageData: string;
  /** 議論ログ */
  discussionLog: DiscussionMessage[];
}

/**
 * カード統合結果の型
 */
export interface CardIntegrationResult {
  /** 統合されたカードデータ */
  cardData: CardData;
  /** 保存に成功したかどうか */
  saved: boolean;
}

/**
 * カード統合サービスのエラーを表すクラス
 */
export class CardIntegrationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "CardIntegrationError";
  }
}

/**
 * 各評議員の生成結果を統合してカードデータを作成する
 *
 * @param request - カード統合リクエスト
 * @returns 統合されたカードデータ
 * @throws CardIntegrationError - 統合処理が失敗した場合
 *
 * @remarks
 * 要件5.1-5.6に基づいて、各評議員の生成結果を統合する:
 * - 要件5.2: 評議員1（name）が生成したカード名を採用
 * - 要件5.3: 評議員2（flavor）が生成したフレーバーテキストを採用
 * - 要件5.4: 評議員3（attribute）が決定した属性を採用
 * - 要件5.5: 評議員4（color-rarity）が決定した色・レア度を採用
 * - 要件5.6: 統合したカードデータをJSON形式で保存
 */
export function integrateCardData(request: CardIntegrationRequest): CardData {
  const {
    evaluatorResults,
    evaluators,
    imageFeatures,
    imagePath,
    imageData,
    discussionLog,
  } = request;

  try {
    // 各評議員の結果を責任別に取得
    const nameEvaluator = evaluators.find((e) => e.responsibility === "name");
    const flavorEvaluator = evaluators.find(
      (e) => e.responsibility === "flavor",
    );
    const attributeEvaluator = evaluators.find(
      (e) => e.responsibility === "attribute",
    );
    const colorRarityEvaluator = evaluators.find(
      (e) => e.responsibility === "color-rarity",
    );

    // 各評議員の生成結果を取得
    const nameResult = nameEvaluator
      ? evaluatorResults.get(nameEvaluator.id)
      : undefined;
    const flavorResult = flavorEvaluator
      ? evaluatorResults.get(flavorEvaluator.id)
      : undefined;
    const attributeResult = attributeEvaluator
      ? evaluatorResults.get(attributeEvaluator.id)
      : undefined;
    const colorRarityResult = colorRarityEvaluator
      ? evaluatorResults.get(colorRarityEvaluator.id)
      : undefined;

    // 要件5.2: 評議員1が生成したカード名を採用
    const name = nameResult?.name || "不明なカード";

    // 要件5.3: 評議員2が生成したフレーバーテキストを採用
    const flavorText = flavorResult?.flavor || "謎に包まれた存在";

    // 要件5.4: 評議員3が決定した属性を採用
    const attribute = attributeResult?.attribute || "Fire";

    // 要件5.5: 評議員4が決定した色・レア度を採用
    const rarity = colorRarityResult?.rarity || "Common";

    // 効果テキストは画像の詳細説明から生成
    const effect = `${imageFeatures.objectType}の力を宿す`;

    // カードIDを生成（タイムスタンプベース）
    const id = `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // デフォルトスキンIDを設定
    const skinId = "default";

    // 要件5.6: 統合したカードデータをJSON形式で作成
    const cardData: CardData = {
      id,
      name,
      attribute,
      rarity,
      effect,
      flavorText,
      description: imageFeatures.detailedDescription,
      imagePath,
      imageData,
      createdAt: new Date(),
      discussionLog, // 要件4.17: 議論ログを保存
      skinId,
    };

    return cardData;
  } catch (error) {
    console.error("[CardIntegrationService] カードデータの統合に失敗:", error);
    throw new CardIntegrationError("カードデータの統合に失敗しました", error);
  }
}

/**
 * カードデータを統合してLocalStorageに保存する
 *
 * @param request - カード統合リクエスト
 * @param storageManager - LocalStorageマネージャー（オプション）
 * @returns 統合結果（カードデータと保存成功フラグ）
 * @throws CardIntegrationError - 統合または保存処理が失敗した場合
 *
 * @remarks
 * - 要件5.1: 全評議員の生成が完了したら各評議員の結果を統合
 * - 要件5.6: 統合したカードデータをJSON形式で保存
 * - 要件7.1: カードが生成されたらLocalStorageに保存
 */
export async function integrateAndSaveCard(
  request: CardIntegrationRequest,
  storageManager?: LocalStorageManager,
): Promise<CardIntegrationResult> {
  try {
    // カードデータを統合
    const cardData = integrateCardData(request);

    // LocalStorageに保存
    const manager = storageManager || new LocalStorageManager();
    let saved = false;

    try {
      await manager.saveCard(cardData);
      saved = true;
      console.log(
        `[CardIntegrationService] カード「${cardData.name}」を保存しました`,
      );
    } catch (saveError) {
      console.error("[CardIntegrationService] カードの保存に失敗:", saveError);
      // 保存失敗してもカードデータは返す
    }

    return {
      cardData,
      saved,
    };
  } catch (error) {
    console.error("[CardIntegrationService] カードの統合と保存に失敗:", error);
    throw new CardIntegrationError("カードの統合と保存に失敗しました", error);
  }
}

/**
 * 評議員の生成結果を検証する
 *
 * @param evaluatorResults - 各評議員の生成結果
 * @param evaluators - 評議員のリスト
 * @returns 検証結果（すべての評議員が結果を生成している場合はtrue）
 *
 * @remarks
 * すべての評議員が結果を生成しているかを確認する。
 * 一部の評議員が失敗している場合でも、デフォルト値で統合を続行する。
 */
export function validateEvaluatorResults(
  evaluatorResults: Map<string, CardElementGenerationResult>,
  evaluators: Evaluator[],
): boolean {
  if (evaluators.length !== 4) {
    console.warn(
      `[CardIntegrationService] 評議員の数が不正です: ${evaluators.length}人（期待: 4人）`,
    );
    return false;
  }

  const missingResults: string[] = [];

  for (const evaluator of evaluators) {
    if (!evaluatorResults.has(evaluator.id)) {
      missingResults.push(evaluator.name);
    }
  }

  if (missingResults.length > 0) {
    console.warn(
      `[CardIntegrationService] 以下の評議員の結果が見つかりません: ${missingResults.join(", ")}`,
    );
    return false;
  }

  return true;
}
