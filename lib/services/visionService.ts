/**
 * Vision APIサービス
 * OpenAI Vision APIを使用して画像を解析し、物体の特徴を抽出する
 */

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { ImageFeatures } from "@/types/card";

/**
 * OpenAIクライアントのインスタンス
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 画像解析結果のZodスキーマ
 * Structured Outputsで型安全なレスポンスを保証
 */
const ImageFeaturesSchema = z.object({
  objectType: z
    .string()
    .describe("物体の種類（例：ぬいぐるみ、フィギュア、おもちゃの車など）"),
  colors: z.array(z.string()).describe("主要な色のリスト"),
  shapes: z.array(z.string()).describe("形状の特徴のリスト"),
  materials: z.array(z.string()).describe("材質のリスト"),
  detailedDescription: z
    .string()
    .describe("物体の詳細な説明（外観、特徴、雰囲気など）"),
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

    // Vision APIを呼び出して画像を解析（Structured Outputsを使用）
    const response = await openai.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この画像を詳細に分析してください。物体の種類、主要な色、形状の特徴、材質、詳細な説明を提供してください。",
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
      response_format: zodResponseFormat(ImageFeaturesSchema, "image_features"),
      max_tokens: 500,
      temperature: 0.7,
    });

    // Structured Outputsでパース済みのレスポンスを取得
    const message = response.choices[0]?.message;
    if (!message) {
      throw new VisionAPIError(
        "Vision APIからのレスポンスが空です",
        "EMPTY_RESPONSE",
        false,
      );
    }

    // モデルが拒否した場合のハンドリング
    if (message.refusal) {
      throw new VisionAPIError(
        `Vision APIがリクエストを拒否しました: ${message.refusal}`,
        "REFUSAL",
        false,
      );
    }

    // パース済みのデータを取得
    if (!message.parsed) {
      throw new VisionAPIError(
        "Vision APIのレスポンスをパースできませんでした",
        "PARSE_ERROR",
        false,
      );
    }

    return message.parsed as ImageFeatures;
  } catch (error) {
    // OpenAI APIエラーの処理
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI APIエラー:", {
        status: error.status,
        message: error.message,
        code: error.code,
      });

      // finish_reasonによる特殊なエラーハンドリング
      if (error.message?.includes("length")) {
        throw new VisionAPIError(
          "画像解析のレスポンスが長すぎて切り捨てられました",
          "LENGTH_LIMIT",
          false,
        );
      }

      if (error.message?.includes("content_filter")) {
        throw new VisionAPIError(
          "画像がコンテンツポリシーに違反している可能性があります",
          "CONTENT_FILTER",
          false,
        );
      }

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
