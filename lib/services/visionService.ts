/**
 * Vision APIサービス
 * OpenAI Vision APIを使用して画像を解析し、物体の特徴を抽出する
 */

import OpenAI from "openai";
import type { ImageFeatures } from "@/types/card";

/**
 * OpenAIクライアントのインスタンス
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Vision APIのエラークラス
 */
export class VisionAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean,
  ) {
    super(message);
    this.name = "VisionAPIError";
  }
}

/**
 * 画像をBase64形式に変換する
 * Node.js環境（APIルート）で動作するため、FileReaderではなくBufferを使用
 *
 * @param file - 変換する画像ファイル
 * @returns Base64エンコードされた画像データ
 */
async function encodeImageToBase64(file: File): Promise<string> {
  try {
    // FileオブジェクトからArrayBufferを取得
    const arrayBuffer = await file.arrayBuffer();
    // ArrayBufferをBufferに変換してBase64エンコード
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    if (!base64Data) {
      throw new Error("Base64エンコードに失敗しました");
    }

    return base64Data;
  } catch (error) {
    console.error("ファイルのエンコードエラー:", error);
    throw new Error("ファイルの読み込みに失敗しました");
  }
}

/**
 * OpenAI Vision APIを使用して画像を解析する
 *
 * @param imageFile - 解析する画像ファイル
 * @returns 画像の特徴情報
 * @throws {VisionAPIError} API呼び出しが失敗した場合
 */
export async function analyzeImage(imageFile: File): Promise<ImageFeatures> {
  try {
    // 画像をBase64形式に変換
    const base64Image = await encodeImageToBase64(imageFile);
    const mimeType = imageFile.type;

    // Vision APIを呼び出して画像を解析
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `この画像を詳細に分析してください。以下の情報をJSON形式で返してください：
{
  "objectType": "物体の種類（例：ぬいぐるみ、フィギュア、おもちゃの車など）",
  "colors": ["主要な色1", "主要な色2", "主要な色3"],
  "shapes": ["形状の特徴1", "形状の特徴2"],
  "materials": ["材質1", "材質2"],
  "detailedDescription": "物体の詳細な説明（外観、特徴、雰囲気など）"
}

必ずJSON形式のみを返してください。他のテキストは含めないでください。`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    // レスポンスからコンテンツを取得
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new VisionAPIError(
        "Vision APIからのレスポンスが空です",
        "EMPTY_RESPONSE",
        false,
      );
    }

    // JSONをパース
    let imageFeatures: ImageFeatures;
    try {
      imageFeatures = JSON.parse(content) as ImageFeatures;
    } catch (parseError) {
      console.error("JSONパースエラー:", parseError);
      console.error("レスポンス内容:", content);
      throw new VisionAPIError(
        "Vision APIのレスポンスをパースできませんでした",
        "PARSE_ERROR",
        false,
      );
    }

    // 必須フィールドの検証
    if (
      !imageFeatures.objectType ||
      !Array.isArray(imageFeatures.colors) ||
      !Array.isArray(imageFeatures.shapes) ||
      !Array.isArray(imageFeatures.materials) ||
      !imageFeatures.detailedDescription
    ) {
      throw new VisionAPIError(
        "Vision APIのレスポンスに必須フィールドが不足しています",
        "INVALID_RESPONSE",
        false,
      );
    }

    return imageFeatures;
  } catch (error) {
    // OpenAI APIエラーの処理
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI APIエラー:", {
        status: error.status,
        message: error.message,
        code: error.code,
      });

      throw new VisionAPIError(
        `画像解析に失敗しました: ${error.message}`,
        error.code || "API_ERROR",
        error.status === 429 || error.status === 503, // レート制限またはサービス利用不可の場合はリトライ可能
      );
    }

    // VisionAPIErrorはそのまま再スロー
    if (error instanceof VisionAPIError) {
      throw error;
    }

    // その他のエラー
    console.error("予期しないエラー:", error);
    throw new VisionAPIError(
      "画像解析中に予期しないエラーが発生しました",
      "UNKNOWN_ERROR",
      false,
    );
  }
}
