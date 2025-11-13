/**
 * カード生成サービス
 * Vercel AI SDKを使用して各評議員の責任に応じたカード要素を生成
 */

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { ImageFeatures } from "@/types/card";
import type { Evaluator } from "@/types/evaluator";

/**
 * カード要素生成結果の型定義
 */
export interface CardElementResult {
  /** カード名（responsibility='name'の場合） */
  name?: string;
  /** フレーバーテキスト（responsibility='flavor'の場合） */
  flavor?: string;
  /** 属性（responsibility='attribute'の場合） */
  attribute?: string;
  /** カードの色（responsibility='color-rarity'の場合） */
  color?: string;
  /** レア度（responsibility='color-rarity'の場合） */
  rarity?: string;
  /** 評議員の発言メッセージ */
  message: string;
}

/**
 * カード要素生成エラー
 */
export class CardGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean,
  ) {
    super(message);
    this.name = "CardGenerationError";
  }
}

/**
 * 評議員の責任に応じたプロンプトを生成
 *
 * @param evaluator - 評議員情報
 * @param imageFeatures - 画像解析結果
 * @returns 生成されたプロンプト
 */
function buildPrompt(
  evaluator: Evaluator,
  imageFeatures: ImageFeatures,
): string {
  const baseContext = `
あなたは「${evaluator.name}」という評議員です。
性格: ${evaluator.persona}
役割: ${evaluator.role}

画像解析結果:
- 物体の種類: ${imageFeatures.objectType}
- 色: ${imageFeatures.colors.join(", ")}
- 形状: ${imageFeatures.shapes.join(", ")}
- 材質: ${imageFeatures.materials.join(", ")}
- 詳細: ${imageFeatures.detailedDescription}
`;

  switch (evaluator.responsibility) {
    case "name":
      return `${baseContext}

あなたの担当はカード名の決定です。
画像解析結果を基に、TCGカードにふさわしい印象的で創造的なカード名を1つ提案してください。

出力形式（JSON）:
{
  "name": "カード名",
  "message": "あなたの性格に合った発言（カード名を提案する際のコメント）"
}`;

    case "flavor":
      return `${baseContext}

あなたの担当はフレーバーテキストの決定です。
画像解析結果を基に、カードの世界観や背景を感じさせる短い物語的なテキストを提案してください。
2-3文程度で、詩的で印象的な表現を心がけてください。

出力形式（JSON）:
{
  "flavor": "フレーバーテキスト",
  "message": "あなたの性格に合った発言（フレーバーテキストを提案する際のコメント）"
}`;

    case "attribute":
      return `${baseContext}

あなたの担当は属性の決定です。
画像解析結果を基に、以下の属性から最も適切なものを1つ選んでください:
- Fire（火・熱・エネルギー）
- Nature（自然・生命・成長）
- Machine（機械・技術・人工物）
- Cosmic（宇宙・神秘・超常）
- Shadow（闇・影・隠密）
- Light（光・聖・浄化）

出力形式（JSON）:
{
  "attribute": "属性名（Fire/Nature/Machine/Cosmic/Shadow/Light）",
  "message": "あなたの性格に合った発言（属性を決定する際の分析コメント）"
}`;

    case "color-rarity":
      return `${baseContext}

あなたの担当はカードの色・レア度の決定です。
画像解析結果を基に、以下から最も適切なレア度を1つ選んでください:
- Common（一般的）
- Rare（珍しい）
- Epic（非常に珍しい）
- Legendary（伝説級）

また、カードの基調となる色を1つ提案してください（例: 赤、青、緑、金、銀、虹色など）。

出力形式（JSON）:
{
  "rarity": "レア度（Common/Rare/Epic/Legendary）",
  "color": "カードの色",
  "message": "あなたの性格に合った発言（レア度と色を決定する際の評価コメント）"
}`;

    default:
      throw new CardGenerationError(
        `Unknown responsibility: ${evaluator.responsibility}`,
        "INVALID_RESPONSIBILITY",
        false,
      );
  }
}

/**
 * 評議員の責任に応じてカード要素を生成
 *
 * @param evaluator - 評議員情報
 * @param imageFeatures - 画像解析結果
 * @returns カード要素生成結果
 * @throws CardGenerationError - 生成に失敗した場合
 */
export async function generateCardElement(
  evaluator: Evaluator,
  imageFeatures: ImageFeatures,
): Promise<CardElementResult> {
  try {
    const prompt = buildPrompt(evaluator, imageFeatures);

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.8, // 創造性を高めるため
      maxOutputTokens: 500,
    });

    // JSON形式のレスポンスをパース
    const result = JSON.parse(text) as CardElementResult;

    // 必須フィールドのバリデーション
    if (!result.message) {
      throw new CardGenerationError(
        "Generated result missing required 'message' field",
        "INVALID_RESPONSE",
        true,
      );
    }

    // 責任に応じた必須フィールドのバリデーション
    switch (evaluator.responsibility) {
      case "name":
        if (!result.name) {
          throw new CardGenerationError(
            "Generated result missing 'name' field",
            "INVALID_RESPONSE",
            true,
          );
        }
        break;
      case "flavor":
        if (!result.flavor) {
          throw new CardGenerationError(
            "Generated result missing 'flavor' field",
            "INVALID_RESPONSE",
            true,
          );
        }
        break;
      case "attribute":
        if (!result.attribute) {
          throw new CardGenerationError(
            "Generated result missing 'attribute' field",
            "INVALID_RESPONSE",
            true,
          );
        }
        break;
      case "color-rarity":
        if (!result.rarity || !result.color) {
          throw new CardGenerationError(
            "Generated result missing 'rarity' or 'color' field",
            "INVALID_RESPONSE",
            true,
          );
        }
        break;
    }

    return result;
  } catch (error) {
    if (error instanceof CardGenerationError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new CardGenerationError(
        "Failed to parse AI response as JSON",
        "PARSE_ERROR",
        true,
      );
    }

    throw new CardGenerationError(
      `Failed to generate card element: ${error instanceof Error ? error.message : "Unknown error"}`,
      "GENERATION_FAILED",
      true,
    );
  }
}
