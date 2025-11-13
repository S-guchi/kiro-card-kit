/**
 * 議論メッセージのタイプを表す型
 */
export type DiscussionMessageType =
  | "opening"
  | "analysis"
  | "discussion"
  | "conclusion";

/**
 * 評議員間の議論メッセージを表す型
 *
 * @remarks
 * 評議員がカード生成プロセスで発言した内容を記録する。
 * 時系列順に保存され、議論ログとして管理される。
 */
export interface DiscussionMessage {
  /** メッセージの一意識別子 */
  id: string;
  /** 発言した評議員のID */
  evaluatorId: string;
  /** 発言した評議員の名前 */
  evaluatorName: string;
  /** 発言内容 */
  message: string;
  /** 発言日時 */
  timestamp: Date;
  /** メッセージのタイプ */
  type: DiscussionMessageType;
}
