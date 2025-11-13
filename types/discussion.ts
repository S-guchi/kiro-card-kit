/**
 * 議論関連の型定義
 */

import type { DiscussionMessage } from "./card";

/**
 * 議論フェーズ
 * - idle: 待機状態
 * - thinking: 画像解析中
 * - generating: カード要素生成中
 * - complete: 完了
 */
export type DiscussionPhase = "idle" | "thinking" | "generating" | "complete";

/**
 * 議論状態インターフェース
 * 議論プロセス全体の状態を管理
 */
export interface DiscussionState {
  /** 現在のフェーズ */
  phase: DiscussionPhase;

  /** 議論ログ */
  messages: DiscussionMessage[];

  /** 議論中かどうか */
  isDiscussing: boolean;

  /** エラーメッセージ */
  error: string | null;
}
