import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  CardGenerationError,
  ErrorCode,
  ErrorSeverity,
} from "@/lib/utils/errorHandler";
import type { CardAttribute, CardRarity } from "@/types/card.js";
import type { Evaluator, EvaluatorResponsibility } from "@/types/evaluator.js";
import type { ImageFeatures } from "@/types/image.js";

/**
 * カード要素生成結果の型
 *
 * @remarks
 * 各評議員が生成したカード要素と発言メッセージを含む。
 * 責任に応じて異なるプロパティが設定される。
 */
export interface CardElementGenerationResult {
  /** カード名（responsibility='name'の場合） */
  name?: string;
  /** フレーバーテキスト（responsibility='flavor'の場合） */
  flavor?: string;
  /** 属性（responsibility='attribute'の場合） */
  attribute?: CardAttribute;
  /** カードの色（responsibility='color-rarity'の場合） */
  color?: string;
  /** レア度（responsibility='color-rarity'の場合） */
  rarity?: CardRarity;
  /** 評議員の発言メッセージ */
  message: string;
}

/**
 * カード要素生成リクエストの型
 */
export interface GenerateCardElementRequest {
  /** 画像解析結果 */
  imageFeatures: ImageFeatures;
  /** 評議員情報 */
  evaluator: Evaluator;
}

/**
 * 評議員の責任に応じたプロンプトを生成する
 *
 * @param responsibility - 評議員の担当要素
 * @param imageFeatures - 画像解析結果
 * @param evaluator - 評議員情報
 * @returns 生成されたプロンプト
 */
function buildPromptForResponsibility(
  responsibility: EvaluatorResponsibility,
  imageFeatures: ImageFeatures,
  evaluator: Evaluator,
): string {
  const baseContext = `
あなたは${evaluator.name}です。
性格: ${evaluator.persona}
役割: ${evaluator.role}
言動の癖: ${evaluator.speechPattern}

画像解析結果:
- 物体の種類: ${imageFeatures.objectType}
- 色: ${imageFeatures.colors.join(", ")}
- 形状: ${imageFeatures.shapes.join(", ")}
- 材質: ${imageFeatures.materials.join(", ")}
- 詳細な説明: ${imageFeatures.detailedDescription}
`;

  switch (responsibility) {
    case "name":
      return `${baseContext}

あなたの担当はTCGカードの名前を決定することです。
画像解析結果を基に、魅力的でユニークなカード名を1つ提案してください。

以下の形式で回答してください:
カード名: [提案するカード名]
発言: [あなたのキャラクターらしい発言で、なぜこの名前を提案したのか説明]

例:
カード名: 炎の守護者
発言: この赤い色合いと力強い形状から、「炎の守護者」って名前がぴったりだと思うんだよね！`;

    case "flavor":
      return `${baseContext}

あなたの担当はTCGカードのフレーバーテキストを決定することです。
画像解析結果を基に、カードの世界観を表現する短いフレーバーテキストを提案してください。

以下の形式で回答してください:
フレーバーテキスト: [提案するフレーバーテキスト]
発言: [あなたのキャラクターらしい発言で、なぜこのテキストを提案したのか説明]

例:
フレーバーテキスト: 古の炎が宿りし者、その力は永遠に燃え続ける
発言: この物体の持つ神秘的な雰囲気を表現してみたよ。どう？`;

    case "attribute":
      return `${baseContext}

あなたの担当はTCGカードの属性を決定することです。
画像解析結果を基に、以下の属性から最も適切なものを1つ選んでください:
- Fire（炎）
- Nature（自然）
- Machine（機械）
- Cosmic（宇宙）
- Shadow（影）
- Light（光）

以下の形式で回答してください:
属性: [選択した属性（Fire/Nature/Machine/Cosmic/Shadow/Light）]
発言: [あなたのキャラクターらしい発言で、なぜこの属性を選んだのか説明]

例:
属性: Fire
発言: この赤い色と力強さから、間違いなくFire属性だね！`;

    case "color-rarity":
      return `${baseContext}

あなたの担当はTCGカードの色とレア度を決定することです。
画像解析結果を基に、カードの色とレア度を提案してください。

レア度は以下から選択:
- Common（コモン）
- Rare（レア）
- Epic（エピック）
- Legendary（レジェンダリー）

以下の形式で回答してください:
色: [カードの主要な色]
レア度: [選択したレア度（Common/Rare/Epic/Legendary）]
発言: [あなたのキャラクターらしい発言で、なぜこの色とレア度を選んだのか説明]

例:
色: 赤
レア度: Rare
発言: この鮮やかな赤色は目を引くから、Rareくらいがちょうどいいと思うな！`;

    default:
      throw new Error(`Unknown responsibility: ${responsibility}`);
  }
}

/**
 * 生成されたテキストから結果を抽出する
 *
 * @param text - AIが生成したテキスト
 * @param responsibility - 評議員の担当要素
 * @returns 抽出された結果
 */
function parseGeneratedText(
  text: string,
  responsibility: EvaluatorResponsibility,
): Omit<CardElementGenerationResult, "message"> {
  const lines = text.split("\n").filter((line) => line.trim());

  switch (responsibility) {
    case "name": {
      const nameLine = lines.find((line) => line.startsWith("カード名:"));
      const name = nameLine?.replace("カード名:", "").trim() || "不明なカード";
      return { name };
    }

    case "flavor": {
      const flavorLine = lines.find((line) =>
        line.startsWith("フレーバーテキスト:"),
      );
      const flavor =
        flavorLine?.replace("フレーバーテキスト:", "").trim() ||
        "謎に包まれた存在";
      return { flavor };
    }

    case "attribute": {
      const attributeLine = lines.find((line) => line.startsWith("属性:"));
      const attributeText =
        attributeLine?.replace("属性:", "").trim() || "Fire";
      const attribute = attributeText as CardAttribute;
      return { attribute };
    }

    case "color-rarity": {
      const colorLine = lines.find((line) => line.startsWith("色:"));
      const rarityLine = lines.find((line) => line.startsWith("レア度:"));
      const color = colorLine?.replace("色:", "").trim() || "不明";
      const rarityText = rarityLine?.replace("レア度:", "").trim() || "Common";
      const rarity = rarityText as CardRarity;
      return { color, rarity };
    }

    default:
      return {};
  }
}

/**
 * 生成されたテキストから発言メッセージを抽出する
 *
 * @param text - AIが生成したテキスト
 * @returns 抽出された発言メッセージ
 */
function extractMessage(text: string): string {
  const lines = text.split("\n").filter((line) => line.trim());
  const messageLine = lines.find((line) => line.startsWith("発言:"));
  return (
    messageLine?.replace("発言:", "").trim() || "うーん、よくわからなかった..."
  );
}

/**
 * 評議員がカード要素を生成する
 *
 * @param request - カード要素生成リクエスト
 * @returns 生成されたカード要素と発言メッセージ
 * @throws エラーが発生した場合
 *
 * @remarks
 * Vercel AI SDKを使用してOpenAI GPT-4oモデルでカード要素を生成する。
 * 各評議員の責任に応じて異なるプロンプトを使用し、
 * 評議員のキャラクター性を反映した発言メッセージも生成する。
 */
export async function generateCardElement(
  request: GenerateCardElementRequest,
): Promise<CardElementGenerationResult> {
  const { imageFeatures, evaluator } = request;
  const { responsibility } = evaluator;

  try {
    // プロンプトを構築
    const prompt = buildPromptForResponsibility(
      responsibility,
      imageFeatures,
      evaluator,
    );

    // Vercel AI SDKを使用してテキスト生成
    const { text } = await generateText({
      model: openai("gpt-4.1"),
      prompt,
      temperature: 0.8, // 創造性を高めるため
      maxOutputTokens: 500,
    });

    // 生成されたテキストから結果を抽出
    const parsedResult = parseGeneratedText(text, responsibility);
    const message = extractMessage(text);

    return {
      ...parsedResult,
      message,
    };
  } catch (error) {
    console.error(
      `[CardGenerationService] Error generating card element for ${evaluator.name}:`,
      error,
    );

    // エラーをCardGenerationErrorに変換
    throw new CardGenerationError(
      `カード要素の生成に失敗しました（${evaluator.name}）`,
      ErrorCode.AI_GENERATION_ERROR,
      false,
      ErrorSeverity.ERROR,
      error,
    );
  }
}
