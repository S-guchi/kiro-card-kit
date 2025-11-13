/**
 * 議論関連の型定義
 */

/**
 * 議論メッセージの型
 * - analysis: 分析フェーズのメッセージ
 * - discussion: 議論フェーズのメッセージ
 * - conclusion: 結論フェーズのメッセージ
 */
export type DiscussionMessageType = "analysis" | "discussion" | "conclusion";

/**
 * 議論メッセージインターフェース
 * 評議員間の議論内容を記録
 */
export interface DiscussionMessage {
  /** メッセージの一意識別子 */
  id: string;

  /** 発言した評議員のID */
  evaluatorId: string;

  /** 発言した評議員の名前 */
  evaluatorName: string;

  /** メッセージ内容 */
  message: string;

  /** タイムスタンプ */
  timestamp: Date;

  /** メッセージタイプ */
  type: DiscussionMessageType;
}

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
