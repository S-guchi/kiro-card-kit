import type { DiscussionMessage } from "./discussion.js";

/**
 * カードの属性を表す型
 */
export type CardAttribute =
  | "Fire"
  | "Nature"
  | "Machine"
  | "Cosmic"
  | "Shadow"
  | "Light";

/**
 * カードのレア度を表す型
 */
export type CardRarity = "Common" | "Rare" | "Epic" | "Legendary";

/**
 * TCGカードのデータを表す型
 *
 * @remarks
 * 各評議員が生成した要素を統合して完成するカードデータ。
 * LocalStorageに保存され、コレクションとして管理される。
 */
export interface CardData {
  /** カードの一意識別子 */
  id: string;
  /** カード名 */
  name: string;
  /** カードの属性 */
  attribute: CardAttribute;
  /** カードのレア度 */
  rarity: CardRarity;
  /** カードの効果・スキル */
  effect: string;
  /** フレーバーテキスト */
  flavorText: string;
  /** カードの説明 */
  description: string;
  /** 元画像のパス */
  imagePath: string;
  /** Base64エンコードされた画像データ */
  imageData: string;
  /** カード作成日時 */
  createdAt: Date;
  /** 議論ログ */
  discussionLog: DiscussionMessage[];
  /** 使用したスキンID */
  skinId: string;
}

/**
 * カードスキンのフレームスタイルを表す型
 */
export interface CardFrameStyles {
  /** Common用のスタイル */
  common: string;
  /** Rare用のスタイル */
  rare: string;
  /** Epic用のスタイル */
  epic: string;
  /** Legendary用のスタイル */
  legendary: string;
}

/**
 * カードスキンの属性アイコンを表す型
 */
export interface CardAttributeIcons {
  /** Fire属性のアイコン */
  Fire: string;
  /** Nature属性のアイコン */
  Nature: string;
  /** Machine属性のアイコン */
  Machine: string;
  /** Cosmic属性のアイコン */
  Cosmic: string;
  /** Shadow属性のアイコン */
  Shadow: string;
  /** Light属性のアイコン */
  Light: string;
}

/**
 * カードスキンのカラースキームを表す型
 */
export interface CardColorScheme {
  /** プライマリカラー */
  primary: string;
  /** セカンダリカラー */
  secondary: string;
  /** アクセントカラー */
  accent: string;
}

/**
 * 属性ごとのカラー設定を表す型
 */
export interface AttributeColorConfig {
  /** 背景グラデーションクラス */
  background: string;
  /** ボーダークラス */
  border: string;
  /** グローエフェクトクラス */
  glow: string;
}

/**
 * 属性別のカラー設定を表す型
 */
export interface CardAttributeColors {
  /** Fire属性のカラー設定 */
  Fire: AttributeColorConfig;
  /** Nature属性のカラー設定 */
  Nature: AttributeColorConfig;
  /** Machine属性のカラー設定 */
  Machine: AttributeColorConfig;
  /** Cosmic属性のカラー設定 */
  Cosmic: AttributeColorConfig;
  /** Shadow属性のカラー設定 */
  Shadow: AttributeColorConfig;
  /** Light属性のカラー設定 */
  Light: AttributeColorConfig;
}

/**
 * カードのデザインテンプレートを表す型
 *
 * @remarks
 * カードの背景、枠、属性アイコンなどのデザイン要素を定義する。
 * ユーザーが自由に差し替え可能。
 */
export interface CardSkin {
  /** スキンの一意識別子 */
  id: string;
  /** スキンの名前 */
  name: string;
  /** 背景画像のパス */
  backgroundImage: string;
  /** レア度別のフレームスタイル */
  frameStyles: CardFrameStyles;
  /** 属性別のアイコン */
  attributeIcons: CardAttributeIcons;
  /** カラースキーム */
  colorScheme: CardColorScheme;
  /** 属性別のカラー設定 */
  attributeColors: CardAttributeColors;
}
