import type { CardSkin } from "@/types/card";

/**
 * カードスキンテンプレートのバリデーションエラー
 */
export class CardSkinValidationError extends Error {
  constructor(
    message: string,
    public readonly skinId: string,
  ) {
    super(message);
    this.name = "CardSkinValidationError";
  }
}

/**
 * カードスキンテンプレートが必須フィールドを持っているかを検証する
 *
 * @param data - 検証対象のデータ
 * @param skinId - スキンのID
 * @throws {CardSkinValidationError} 必須フィールドが不足している場合
 */
function validateCardSkin(
  data: unknown,
  skinId: string,
): asserts data is CardSkin {
  if (!data || typeof data !== "object") {
    throw new CardSkinValidationError("スキンデータが不正です", skinId);
  }

  const skin = data as Record<string, unknown>;

  // 必須フィールドのチェック
  const requiredFields = [
    "id",
    "name",
    "backgroundImage",
    "frameStyles",
    "attributeIcons",
    "colorScheme",
    "attributeColors",
  ] as const;

  for (const field of requiredFields) {
    if (!(field in skin)) {
      throw new CardSkinValidationError(
        `必須フィールド "${field}" が不足しています`,
        skinId,
      );
    }
  }

  // 基本フィールドの型検証
  if (typeof skin.id !== "string") {
    throw new CardSkinValidationError(
      "id は文字列である必要があります",
      skinId,
    );
  }

  if (typeof skin.name !== "string") {
    throw new CardSkinValidationError(
      "name は文字列である必要があります",
      skinId,
    );
  }

  if (typeof skin.backgroundImage !== "string") {
    throw new CardSkinValidationError(
      "backgroundImage は文字列である必要があります",
      skinId,
    );
  }

  // frameStyles の検証
  if (!skin.frameStyles || typeof skin.frameStyles !== "object") {
    throw new CardSkinValidationError(
      "frameStyles はオブジェクトである必要があります",
      skinId,
    );
  }

  const frameStyles = skin.frameStyles as Record<string, unknown>;
  const requiredRarities = ["common", "rare", "epic", "legendary"] as const;

  for (const rarity of requiredRarities) {
    if (typeof frameStyles[rarity] !== "string") {
      throw new CardSkinValidationError(
        `frameStyles.${rarity} は文字列である必要があります`,
        skinId,
      );
    }
  }

  // attributeIcons の検証
  if (!skin.attributeIcons || typeof skin.attributeIcons !== "object") {
    throw new CardSkinValidationError(
      "attributeIcons はオブジェクトである必要があります",
      skinId,
    );
  }

  const attributeIcons = skin.attributeIcons as Record<string, unknown>;
  const requiredAttributes = [
    "Fire",
    "Nature",
    "Machine",
    "Cosmic",
    "Shadow",
    "Light",
  ] as const;

  for (const attribute of requiredAttributes) {
    if (typeof attributeIcons[attribute] !== "string") {
      throw new CardSkinValidationError(
        `attributeIcons.${attribute} は文字列である必要があります`,
        skinId,
      );
    }
  }

  // colorScheme の検証
  if (!skin.colorScheme || typeof skin.colorScheme !== "object") {
    throw new CardSkinValidationError(
      "colorScheme はオブジェクトである必要があります",
      skinId,
    );
  }

  const colorScheme = skin.colorScheme as Record<string, unknown>;
  const requiredColors = ["primary", "secondary", "accent"] as const;

  for (const color of requiredColors) {
    if (typeof colorScheme[color] !== "string") {
      throw new CardSkinValidationError(
        `colorScheme.${color} は文字列である必要があります`,
        skinId,
      );
    }
  }

  // attributeColors の検証
  if (!skin.attributeColors || typeof skin.attributeColors !== "object") {
    throw new CardSkinValidationError(
      "attributeColors はオブジェクトである必要があります",
      skinId,
    );
  }

  const attributeColors = skin.attributeColors as Record<string, unknown>;

  for (const attribute of requiredAttributes) {
    if (
      !attributeColors[attribute] ||
      typeof attributeColors[attribute] !== "object"
    ) {
      throw new CardSkinValidationError(
        `attributeColors.${attribute} はオブジェクトである必要があります`,
        skinId,
      );
    }

    const colorConfig = attributeColors[attribute] as Record<string, unknown>;
    const requiredColorFields = ["background", "border", "glow"] as const;

    for (const field of requiredColorFields) {
      if (typeof colorConfig[field] !== "string") {
        throw new CardSkinValidationError(
          `attributeColors.${attribute}.${field} は文字列である必要があります`,
          skinId,
        );
      }
    }
  }
}

/**
 * 指定されたIDのカードスキンを読み込む
 *
 * @param skinId - スキンのID
 * @returns カードスキン
 * @throws {CardSkinValidationError} スキンの読み込みまたは検証に失敗した場合
 *
 * @example
 * ```typescript
 * const skin = await loadCardSkin('default');
 * console.log(skin.name); // "デフォルトスキン"
 * ```
 */
export async function loadCardSkin(skinId: string): Promise<CardSkin> {
  try {
    const response = await fetch(`/templates/card-skins/${skinId}/skin.json`);

    if (!response.ok) {
      throw new CardSkinValidationError(
        `スキンファイルの読み込みに失敗しました: ${response.statusText}`,
        skinId,
      );
    }

    const data = await response.json();
    validateCardSkin(data, skinId);

    return data;
  } catch (error) {
    if (error instanceof CardSkinValidationError) {
      throw error;
    }

    throw new CardSkinValidationError(
      `スキンの読み込み中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      skinId,
    );
  }
}

/**
 * デフォルトのカードスキンを読み込む
 *
 * @returns デフォルトのカードスキン
 * @throws {CardSkinValidationError} スキンの読み込みまたは検証に失敗した場合
 *
 * @example
 * ```typescript
 * const defaultSkin = await loadDefaultCardSkin();
 * console.log(defaultSkin.id); // "default"
 * ```
 */
export async function loadDefaultCardSkin(): Promise<CardSkin> {
  return loadCardSkin("default");
}

/**
 * 利用可能なすべてのカードスキンのIDを取得する
 *
 * @returns スキンIDの配列
 *
 * @remarks
 * 現在はデフォルトスキンのみをサポート。
 * 将来的には、public/templates/card-skins/ ディレクトリをスキャンして
 * 利用可能なスキンを動的に取得する実装に拡張可能。
 *
 * @example
 * ```typescript
 * const skinIds = getAvailableCardSkinIds();
 * console.log(skinIds); // ["default"]
 * ```
 */
export function getAvailableCardSkinIds(): string[] {
  // 現在はデフォルトスキンのみ
  return ["default"];
}

/**
 * 利用可能なすべてのカードスキンを読み込む
 *
 * @returns カードスキンの配列
 * @throws {CardSkinValidationError} いずれかのスキンの読み込みまたは検証に失敗した場合
 *
 * @example
 * ```typescript
 * const skins = await loadAllCardSkins();
 * console.log(skins.length); // 1
 * ```
 */
export async function loadAllCardSkins(): Promise<CardSkin[]> {
  const skinIds = getAvailableCardSkinIds();
  const skins = await Promise.all(skinIds.map((id) => loadCardSkin(id)));
  return skins;
}
