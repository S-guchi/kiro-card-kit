/**
 * 評議員の謝罪メッセージユーティリティ
 *
 * @remarks
 * エラー発生時に評議員が表示する謝罪メッセージを生成する。
 * 評議員のキャラクター性を反映した自然な謝罪メッセージを提供する。
 */

import type { DiscussionMessage } from "@/types/discussion";
import type { Evaluator } from "@/types/evaluator";
import { ErrorCode } from "./errorHandler";

/**
 * デフォルトの謝罪メッセージリスト
 *
 * @remarks
 * 評議員のキャラクター性に関わらず使用できる汎用的な謝罪メッセージ。
 */
const DEFAULT_APOLOGY_MESSAGES = [
  "ごめん、よくわからなかった...",
  "うーん、難しいね...ごめんなさい",
  "申し訳ない、うまく分析できなかったよ",
  "ごめんね、今回はちょっと無理だったみたい",
  "すまない、力になれなかった...",
];

/**
 * エラーコード別の謝罪メッセージテンプレート
 */
const ERROR_SPECIFIC_APOLOGIES: Record<ErrorCode, string[]> = {
  [ErrorCode.VISION_API_ERROR]: [
    "画像の解析がうまくいかなかったみたい...ごめんね",
    "この画像、ちょっと難しすぎたかも...申し訳ない",
    "画像を読み取れなかった...ごめんなさい",
  ],
  [ErrorCode.AI_GENERATION_ERROR]: [
    "カードの要素を考えるのに失敗しちゃった...ごめん",
    "うまくアイデアが浮かばなかったよ...すまない",
    "今回は良い案が出せなかった...申し訳ない",
  ],
  [ErrorCode.NETWORK_ERROR]: [
    "通信がうまくいかなかったみたい...ごめんね",
    "ネットワークの調子が悪いみたい...申し訳ない",
  ],
  [ErrorCode.IMAGE_SIZE_EXCEEDED]: [
    "画像が大きすぎて処理できなかったよ...ごめん",
  ],
  [ErrorCode.IMAGE_FORMAT_INVALID]: [
    "この画像形式には対応してないんだ...ごめんね",
  ],
  [ErrorCode.IMAGE_UPLOAD_ERROR]: [
    "画像のアップロードに失敗しちゃった...ごめん",
  ],
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: ["保存容量が足りないみたい...ごめんね"],
  [ErrorCode.UNKNOWN_ERROR]: DEFAULT_APOLOGY_MESSAGES,
};

/**
 * ランダムに謝罪メッセージを選択する
 *
 * @param messages - メッセージの配列
 * @returns ランダムに選択されたメッセージ
 */
function selectRandomMessage(messages: string[]): string {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

/**
 * エラーコードに応じた謝罪メッセージを生成する
 *
 * @param errorCode - エラーコード
 * @returns 謝罪メッセージ
 *
 * @remarks
 * エラーコードに応じて適切な謝罪メッセージをランダムに選択する。
 */
export function generateApologyMessage(errorCode: ErrorCode): string {
  const messages =
    ERROR_SPECIFIC_APOLOGIES[errorCode] || DEFAULT_APOLOGY_MESSAGES;
  return selectRandomMessage(messages);
}

/**
 * 評議員の謝罪メッセージを生成する
 *
 * @param evaluator - 評議員情報
 * @param errorCode - エラーコード
 * @returns 議論メッセージ形式の謝罪メッセージ
 *
 * @remarks
 * 評議員のキャラクター性を反映した謝罪メッセージを生成する。
 * 要件: 10.1, 10.2, 10.3
 */
export function createApologyMessage(
  evaluator: Evaluator,
  errorCode: ErrorCode,
): DiscussionMessage {
  const apologyText = generateApologyMessage(errorCode);

  return {
    id: `${evaluator.id}-apology-${Date.now()}`,
    evaluatorId: evaluator.id,
    evaluatorName: evaluator.name,
    message: apologyText,
    timestamp: new Date(),
    type: "discussion",
  };
}

/**
 * 全評議員の謝罪メッセージを生成する
 *
 * @param evaluators - 評議員の配列
 * @param errorCode - エラーコード
 * @returns 全評議員の謝罪メッセージの配列
 *
 * @remarks
 * 全評議員が謝罪メッセージを表示することで、
 * 議論を自然に終了させる。
 * 要件: 10.4
 */
export function createAllApologyMessages(
  evaluators: Evaluator[],
  errorCode: ErrorCode,
): DiscussionMessage[] {
  return evaluators.map((evaluator) =>
    createApologyMessage(evaluator, errorCode),
  );
}
