import OpenAI from "openai";
import {
  CardGenerationError,
  ErrorCode,
  ErrorSeverity,
} from "@/lib/utils/errorHandler";
import type { ImageFeatures } from "@/types/image";

/**
 * Vision APIサービス
 *
 * @remarks
 * OpenAI Vision APIを使用して画像を解析し、
 * 物体の種類、色、形状、材質、詳細な説明を抽出する。
 */

/**
 * OpenAIクライアントのインスタンス
 *
 * @remarks
 * 環境変数OPENAI_API_KEYから自動的にAPIキーを取得する
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 画像を解析して特徴を抽出する
 *
 * @param imageBase64 - Base64エンコードされた画像データ
 * @returns 画像の特徴データ
 * @throws OpenAI.APIError - API呼び出しが失敗した場合
 *
 * @remarks
 * - gpt-4o-miniモデルを使用してコストを削減
 * - 画像はdata:image/jpeg;base64形式で送信
 * - レスポンスはJSON形式で構造化されたデータを期待
 */
export async function analyzeImage(
  imageBase64: string,
): Promise<ImageFeatures> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `この画像を詳しく分析してください。以下の情報をJSON形式で返してください：
- objectType: 物体の種類（例：ぬいぐるみ、フィギュア、おもちゃの車など）
- colors: 主要な色の配列（例：["赤", "青", "黄色"]）
- shapes: 形状の特徴の配列（例：["丸い", "四角い", "細長い"]）
- materials: 材質の配列（例：["布", "プラスチック", "金属"]）
- detailedDescription: 物体の詳細な説明（外見、特徴、雰囲気など）

必ずJSON形式で返してください。`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Vision APIからのレスポンスが空です");
    }

    // JSONレスポンスをパース
    const features = parseVisionResponse(content);
    return features;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("Vision API エラー:", {
        status: error.status,
        message: error.message,
        requestId: error.requestID,
      });

      // OpenAI APIエラーをCardGenerationErrorに変換
      throw new CardGenerationError(
        `Vision API解析に失敗しました: ${error.message}`,
        ErrorCode.VISION_API_ERROR,
        false,
        ErrorSeverity.ERROR,
        error,
      );
    }

    // その他のエラー
    throw new CardGenerationError(
      "画像解析中に予期しないエラーが発生しました",
      ErrorCode.VISION_API_ERROR,
      false,
      ErrorSeverity.ERROR,
      error,
    );
  }
}

/**
 * Vision APIのレスポンスをパースしてImageFeatures型に変換する
 *
 * @param content - Vision APIからのレスポンステキスト
 * @returns パースされた画像特徴データ
 * @throws Error - JSONパースに失敗した場合、または必須フィールドが欠けている場合
 *
 * @remarks
 * - レスポンスがMarkdownのコードブロックで囲まれている場合は除去
 * - 必須フィールドの検証を実施
 */
function parseVisionResponse(content: string): ImageFeatures {
  try {
    // Markdownのコードブロックを除去（```json ... ``` の形式）
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonContent);

    // 必須フィールドの検証
    if (!parsed.objectType || typeof parsed.objectType !== "string") {
      throw new Error("objectTypeフィールドが不正です");
    }
    if (!Array.isArray(parsed.colors)) {
      throw new Error("colorsフィールドが配列ではありません");
    }
    if (!Array.isArray(parsed.shapes)) {
      throw new Error("shapesフィールドが配列ではありません");
    }
    if (!Array.isArray(parsed.materials)) {
      throw new Error("materialsフィールドが配列ではありません");
    }
    if (
      !parsed.detailedDescription ||
      typeof parsed.detailedDescription !== "string"
    ) {
      throw new Error("detailedDescriptionフィールドが不正です");
    }

    return {
      objectType: parsed.objectType,
      colors: parsed.colors,
      shapes: parsed.shapes,
      materials: parsed.materials,
      detailedDescription: parsed.detailedDescription,
    };
  } catch (error: unknown) {
    console.error("Vision APIレスポンスのパースに失敗:", error);
    throw new CardGenerationError(
      `Vision APIレスポンスのパースに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      ErrorCode.VISION_API_ERROR,
      false,
      ErrorSeverity.ERROR,
      error,
    );
  }
}
