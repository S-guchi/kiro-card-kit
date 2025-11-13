import type { Evaluator, EvaluatorType } from "@/types/evaluator";

/**
 * 評議員テンプレートのバリデーションエラー
 */
export class EvaluatorTemplateValidationError extends Error {
  constructor(
    message: string,
    public readonly templateType: EvaluatorType,
  ) {
    super(message);
    this.name = "EvaluatorTemplateValidationError";
  }
}

/**
 * 評議員テンプレートが必須フィールドを持っているかを検証する
 *
 * @param data - 検証対象のデータ
 * @param templateType - テンプレートのタイプ
 * @throws {EvaluatorTemplateValidationError} 必須フィールドが不足している場合
 */
function validateEvaluatorTemplate(
  data: unknown,
  templateType: EvaluatorType,
): asserts data is Evaluator {
  if (!data || typeof data !== "object") {
    throw new EvaluatorTemplateValidationError(
      "テンプレートデータが不正です",
      templateType,
    );
  }

  const template = data as Record<string, unknown>;

  // 必須フィールドのチェック
  const requiredFields = [
    "id",
    "name",
    "type",
    "persona",
    "role",
    "responsibility",
    "speechPattern",
    "openingDialogues",
    "imagePath",
    "position",
  ] as const;

  for (const field of requiredFields) {
    if (!(field in template)) {
      throw new EvaluatorTemplateValidationError(
        `必須フィールド "${field}" が不足しています`,
        templateType,
      );
    }
  }

  // 型の検証
  if (typeof template.id !== "string") {
    throw new EvaluatorTemplateValidationError(
      "id は文字列である必要があります",
      templateType,
    );
  }

  if (typeof template.name !== "string") {
    throw new EvaluatorTemplateValidationError(
      "name は文字列である必要があります",
      templateType,
    );
  }

  if (typeof template.type !== "string") {
    throw new EvaluatorTemplateValidationError(
      "type は文字列である必要があります",
      templateType,
    );
  }

  if (typeof template.persona !== "string") {
    throw new EvaluatorTemplateValidationError(
      "persona は文字列である必要があります",
      templateType,
    );
  }

  if (typeof template.role !== "string") {
    throw new EvaluatorTemplateValidationError(
      "role は文字列である必要があります",
      templateType,
    );
  }

  if (typeof template.responsibility !== "string") {
    throw new EvaluatorTemplateValidationError(
      "responsibility は文字列である必要があります",
      templateType,
    );
  }

  if (typeof template.speechPattern !== "string") {
    throw new EvaluatorTemplateValidationError(
      "speechPattern は文字列である必要があります",
      templateType,
    );
  }

  if (!Array.isArray(template.openingDialogues)) {
    throw new EvaluatorTemplateValidationError(
      "openingDialogues は配列である必要があります",
      templateType,
    );
  }

  if (!template.openingDialogues.every((item) => typeof item === "string")) {
    throw new EvaluatorTemplateValidationError(
      "openingDialogues の全要素は文字列である必要があります",
      templateType,
    );
  }

  if (typeof template.imagePath !== "string") {
    throw new EvaluatorTemplateValidationError(
      "imagePath は文字列である必要があります",
      templateType,
    );
  }

  // position の検証
  if (!template.position || typeof template.position !== "object") {
    throw new EvaluatorTemplateValidationError(
      "position はオブジェクトである必要があります",
      templateType,
    );
  }

  const position = template.position as Record<string, unknown>;

  if (!position.idle || typeof position.idle !== "object") {
    throw new EvaluatorTemplateValidationError(
      "position.idle はオブジェクトである必要があります",
      templateType,
    );
  }

  if (!position.discussion || typeof position.discussion !== "object") {
    throw new EvaluatorTemplateValidationError(
      "position.discussion はオブジェクトである必要があります",
      templateType,
    );
  }

  const idle = position.idle as Record<string, unknown>;
  const discussion = position.discussion as Record<string, unknown>;

  if (typeof idle.x !== "number" || typeof idle.y !== "number") {
    throw new EvaluatorTemplateValidationError(
      "position.idle.x と position.idle.y は数値である必要があります",
      templateType,
    );
  }

  if (typeof discussion.x !== "number" || typeof discussion.y !== "number") {
    throw new EvaluatorTemplateValidationError(
      "position.discussion.x と position.discussion.y は数値である必要があります",
      templateType,
    );
  }
}

/**
 * 指定されたタイプの評議員テンプレートを読み込む
 *
 * @param type - 評議員のタイプ
 * @returns 評議員テンプレート
 * @throws {EvaluatorTemplateValidationError} テンプレートの読み込みまたは検証に失敗した場合
 *
 * @example
 * ```typescript
 * const evaluator = await loadEvaluatorTemplate('name-generator');
 * console.log(evaluator.name); // "ネーミア"
 * ```
 */
export async function loadEvaluatorTemplate(
  type: EvaluatorType,
): Promise<Evaluator> {
  try {
    const response = await fetch(`/templates/evaluators/${type}.json`);

    if (!response.ok) {
      throw new EvaluatorTemplateValidationError(
        `テンプレートファイルの読み込みに失敗しました: ${response.statusText}`,
        type,
      );
    }

    const data = await response.json();
    validateEvaluatorTemplate(data, type);

    return data;
  } catch (error) {
    if (error instanceof EvaluatorTemplateValidationError) {
      throw error;
    }

    throw new EvaluatorTemplateValidationError(
      `テンプレートの読み込み中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      type,
    );
  }
}

/**
 * すべての評議員テンプレートを読み込む
 *
 * @returns 4人の評議員テンプレートの配列
 * @throws {EvaluatorTemplateValidationError} いずれかのテンプレートの読み込みまたは検証に失敗した場合
 *
 * @example
 * ```typescript
 * const evaluators = await loadAllEvaluatorTemplates();
 * console.log(evaluators.length); // 4
 * ```
 */
export async function loadAllEvaluatorTemplates(): Promise<Evaluator[]> {
  const types: EvaluatorType[] = [
    "name-generator",
    "flavor-writer",
    "attribute-decider",
    "color-decider",
  ];

  const templates = await Promise.all(
    types.map((type) => loadEvaluatorTemplate(type)),
  );

  return templates;
}

/**
 * 評議員を読み込む（エイリアス）
 *
 * @returns 4人の評議員テンプレートの配列
 * @throws {EvaluatorTemplateValidationError} いずれかのテンプレートの読み込みまたは検証に失敗した場合
 *
 * @remarks
 * loadAllEvaluatorTemplatesのエイリアス関数
 */
export async function loadEvaluators(): Promise<Evaluator[]> {
  return loadAllEvaluatorTemplates();
}
