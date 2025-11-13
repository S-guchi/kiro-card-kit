/**
 * カードデータの型定義
 */

import type { DiscussionMessage } from "./discussion";

/**
 * カードの属性
 */
export type CardAttribute =
  | "Fire"
  | "Nature"
  | "Machine"
  | "Cosmic"
  | "Shadow"
  | "Light";

/**
 * カードのレア度
 */
export type CardRarity = "Common" | "Rare" | "Epic" | "Legendary";

/**
 * カードデータインターフェース
 * 生成されるTCGカードの完全な情報を保持
 */
export interface CardData {
  /** カードの一意識別子 */
  id: string;

  /** カード名 */
  name: string;

  /** 属性 */
  attribute: CardAttribute;

  /** レア度 */
  rarity: CardRarity;

  /** 効果・スキル */
  effect: string;

  /** フレーバーテキスト */
  flavorText: string;

  /** カード説明 */
  description: string;

  /** 元画像のパス */
  imagePath: string;

  /** Base64エンコードされた画像データ */
  imageData: string;

  /** 作成日時 */
  createdAt: Date;

  /** 議論ログ */
  discussionLog: DiscussionMessage[];
}

/**
 * 画像解析結果の型定義
 * Vision APIから返される画像の特徴情報
 */
export interface ImageFeatures {
  /** 物体の種類 */
  objectType: string;

  /** 色の配列 */
  colors: string[];

  /** 形状の配列 */
  shapes: string[];

  /** 材質の配列 */
  materials: string[];

  /** 詳細な説明 */
  detailedDescription: string;
}
