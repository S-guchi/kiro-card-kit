/**
 * 画像解析結果の特徴データを表す型
 *
 * @remarks
 * Vision APIから取得した画像の特徴情報。
 * 全評議員で共有され、カード要素生成の基礎情報として使用される。
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
