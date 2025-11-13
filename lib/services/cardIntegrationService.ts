/**
 * カードデータ統合サービス
 * 各評議員の生成結果を統合してCardDataを生成する
 */

import type { CardData, ImageFeatures } from "@/types/card";
import type { DiscussionMessage } from "@/types/discussion";
import type { EvaluatorResult } from "./discussionOrchestrator";

/**
 * カードデータ統合エラー
 */
export class CardIntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean,
  ) {
    super(message);
    this.name = "CardIntegrationError";
  }
}

/**
 * 評議員の生成結果からカードデータを統合する
 *
 * @param evaluatorResults - 評議員の生成結果配列
 * @param imageFeatures - 画像解析結果
 * @param imageData - Base64エンコードされた画像データ
 * @param discussionLog - 議論ログ
 * @returns 統合されたカードデータ
 * @throws {CardIntegrationError} 統合に失敗した場合
 *
 * 要件:
 * - 5.1: 全評議員の生成が完了したら、各評議員の結果を統合する
 * - 5.2: 評議員1が生成したカード名を採用する
 * - 5.3: 評議員2が生成したフレーバーテキストを採用する
 * - 5.4: 評議員3が決定した属性を採用する
 * - 5.5: 評議員4が決定したカードの色・レア度を採用する
 * - 5.6: 統合したカードデータをJSON形式で保存する
 * - 4.7: 議論ログを保存する
 */
export function integrateCardData(
  evaluatorResults: EvaluatorResult[],
  imageFeatures: ImageFeatures,
  imageData: string,
  discussionLog: DiscussionMessage[],
): CardData {
  // 評議員の数をバリデーション
  if (evaluatorResults.length !== 4) {
    throw new CardIntegrationError(
      `評議員の結果は4つである必要があります（現在: ${evaluatorResults.length}個）`,
      "INVALID_RESULT_COUNT",
      false,
    );
  }

  // 各責任を持つ評議員の結果を取得
  const nameResult = evaluatorResults.find(
    (r) => r.evaluator.responsibility === "name",
  );
  const flavorResult = evaluatorResults.find(
    (r) => r.evaluator.responsibility === "flavor",
  );
  const attributeResult = evaluatorResults.find(
    (r) => r.evaluator.responsibility === "attribute",
  );
  const colorRarityResult = evaluatorResults.find(
    (r) => r.evaluator.responsibility === "color-rarity",
  );

  // 必要な結果が全て揃っているかチェック
  if (!nameResult) {
    throw new CardIntegrationError(
      "カード名を生成する評議員の結果が見つかりません",
      "MISSING_NAME_RESULT",
      false,
    );
  }
  if (!flavorResult) {
    throw new CardIntegrationError(
      "フレーバーテキストを生成する評議員の結果が見つかりません",
      "MISSING_FLAVOR_RESULT",
      false,
    );
  }
  if (!attributeResult) {
    throw new CardIntegrationError(
      "属性を決定する評議員の結果が見つかりません",
      "MISSING_ATTRIBUTE_RESULT",
      false,
    );
  }
  if (!colorRarityResult) {
    throw new CardIntegrationError(
      "色・レア度を決定する評議員の結果が見つかりません",
      "MISSING_COLOR_RARITY_RESULT",
      false,
    );
  }

  // 各評議員の結果から必要なデータを抽出
  const name = nameResult.result.name;
  const flavorText = flavorResult.result.flavor;
  const attribute = attributeResult.result.attribute;
  const rarity = colorRarityResult.result.rarity;

  // データの存在チェック
  if (!name) {
    throw new CardIntegrationError(
      "カード名が生成されていません",
      "MISSING_NAME_DATA",
      false,
    );
  }
  if (!flavorText) {
    throw new CardIntegrationError(
      "フレーバーテキストが生成されていません",
      "MISSING_FLAVOR_DATA",
      false,
    );
  }
  if (!attribute) {
    throw new CardIntegrationError(
      "属性が決定されていません",
      "MISSING_ATTRIBUTE_DATA",
      false,
    );
  }
  if (!rarity) {
    throw new CardIntegrationError(
      "レア度が決定されていません",
      "MISSING_RARITY_DATA",
      false,
    );
  }

  // 型の検証とキャスト
  if (!isValidAttribute(attribute)) {
    throw new CardIntegrationError(
      `無効な属性です: ${attribute}`,
      "INVALID_ATTRIBUTE",
      false,
    );
  }
  if (!isValidRarity(rarity)) {
    throw new CardIntegrationError(
      `無効なレア度です: ${rarity}`,
      "INVALID_RARITY",
      false,
    );
  }

  // カードIDを生成（タイムスタンプベース）
  const id = `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // 統合されたカードデータを生成
  const cardData: CardData = {
    id,
    name,
    attribute,
    rarity,
    effect: generateEffect(attribute, rarity),
    flavorText,
    description: imageFeatures.detailedDescription,
    imagePath: "", // クライアントサイドでは使用しない
    imageData,
    createdAt: new Date(),
    discussionLog,
  };

  console.log("カードデータの統合が完了しました:", {
    id: cardData.id,
    name: cardData.name,
    attribute: cardData.attribute,
    rarity: cardData.rarity,
  });

  return cardData;
}

/**
 * 属性が有効かどうかをチェックする型ガード
 *
 * @param value - チェックする値
 * @returns 有効な属性の場合true
 */
function isValidAttribute(value: string): value is CardData["attribute"] {
  return ["Fire", "Nature", "Machine", "Cosmic", "Shadow", "Light"].includes(
    value,
  );
}

/**
 * レア度が有効かどうかをチェックする型ガード
 *
 * @param value - チェックする値
 * @returns 有効なレア度の場合true
 */
function isValidRarity(value: string): value is CardData["rarity"] {
  return ["Common", "Rare", "Epic", "Legendary"].includes(value);
}

/**
 * 属性とレア度に基づいてカード効果を生成する
 * 簡易的な実装（将来的にはAIで生成することも可能）
 *
 * @param attribute - カード属性
 * @param rarity - カードレア度
 * @returns カード効果テキスト
 */
function generateEffect(
  attribute: CardData["attribute"],
  rarity: CardData["rarity"],
): string {
  const rarityPower = {
    Common: 100,
    Rare: 200,
    Epic: 300,
    Legendary: 500,
  };

  const attributeEffect = {
    Fire: "炎の力で敵を攻撃する",
    Nature: "自然の力で味方を回復する",
    Machine: "機械の力で防御を強化する",
    Cosmic: "宇宙の力で全体を強化する",
    Shadow: "影の力で敵を弱体化する",
    Light: "光の力で浄化する",
  };

  const power = rarityPower[rarity];
  const effect = attributeEffect[attribute];

  return `${effect}（威力: ${power}）`;
}
