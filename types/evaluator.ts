/**
 * 評議員（AI Evaluator）の型定義
 */

/**
 * 評議員の責任範囲
 * - name: カード名の生成を担当
 * - flavor: フレーバーテキストの生成を担当
 * - attribute: 属性の決定を担当
 * - color-rarity: カードの色・レア度の決定を担当
 */
export type EvaluatorResponsibility =
  | "name"
  | "flavor"
  | "attribute"
  | "color-rarity";

/**
 * 評議員のタイプ
 */
export type EvaluatorType =
  | "name-generator"
  | "flavor-writer"
  | "attribute-decider"
  | "color-decider";

/**
 * 評議員インターフェース
 * カード生成プロセスに参加するAIキャラクターの定義
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

  /** 評議員の画像パス（例: /member/1.png） */
  imagePath: string;
}
