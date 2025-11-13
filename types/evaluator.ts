/**
 * 評議員の担当要素を表す型
 */
export type EvaluatorResponsibility =
  | "name"
  | "flavor"
  | "attribute"
  | "color-rarity";

/**
 * 評議員のタイプを表す型
 */
export type EvaluatorType =
  | "name-generator"
  | "flavor-writer"
  | "attribute-decider"
  | "color-decider";

/**
 * 評議員の位置情報を表す型
 */
export interface EvaluatorPosition {
  /** 待機位置 */
  idle: {
    x: number;
    y: number;
  };
  /** 議論位置（四隅） */
  discussion: {
    x: number;
    y: number;
  };
}

/**
 * 評議員を表す型
 *
 * @remarks
 * 評議員はカード生成プロセスに参加する4人のAIキャラクター。
 * それぞれが異なる役割を担当し、並列でカード要素を生成する。
 */
export interface Evaluator {
  /** 評議員の一意識別子 */
  id: string;
  /** 評議員の名前 */
  name: string;
  /** 評議員のタイプ */
  type: EvaluatorType;
  /** 性格・役割の説明 */
  persona: string;
  /** 分析における役割 */
  role: string;
  /** 担当要素 */
  responsibility: EvaluatorResponsibility;
  /** 言動の癖 */
  speechPattern: string;
  /** 導入会話の配列 */
  openingDialogues: string[];
  /** 評議員の画像パス（例: /member/1.png） */
  imagePath: string;
  /** 評議員の位置情報 */
  position: EvaluatorPosition;
}
