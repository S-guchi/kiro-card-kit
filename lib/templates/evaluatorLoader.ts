import type {
  Evaluator,
  EvaluatorResponsibility,
  EvaluatorType,
} from "@/types/evaluator";

/**
 * テンプレートJSONの構造
 */
interface EvaluatorTemplate {
  id: string;
  name: string;
  type: EvaluatorType;
  persona: string;
  role: string;
  responsibility: EvaluatorResponsibility;
  speechPattern?: string;
  openingDialogues?: string[];
  imagePath: string;
}

/**
 * テンプレート検証エラー
 */
export class EvaluatorTemplateError extends Error {
  constructor(
    message: string,
    public templateId?: string,
  ) {
    super(message);
    this.name = "EvaluatorTemplateError";
  }
}

/**
 * 評議員テンプレートのバリデーション
 *
 * @param template - 検証対象のテンプレート
 * @throws {EvaluatorTemplateError} テンプレートが不正な場合
 */
function validateEvaluatorTemplate(
  template: unknown,
): asserts template is EvaluatorTemplate {
  if (!template || typeof template !== "object") {
    throw new EvaluatorTemplateError(
      "テンプレートはオブジェクトである必要があります",
    );
  }

  const t = template as Record<string, unknown>;

  // 必須フィールドの検証
  const requiredFields = [
    "id",
    "name",
    "type",
    "persona",
    "role",
    "responsibility",
    "imagePath",
  ];
  for (const field of requiredFields) {
    if (!(field in t) || typeof t[field] !== "string" || t[field] === "") {
      throw new EvaluatorTemplateError(
        `必須フィールド '${field}' が不足しているか、無効です`,
        t.id as string | undefined,
      );
    }
  }

  // typeの検証
  const validTypes: EvaluatorType[] = [
    "name-generator",
    "flavor-writer",
    "attribute-decider",
    "color-decider",
  ];
  if (!validTypes.includes(t.type as EvaluatorType)) {
    throw new EvaluatorTemplateError(
      `無効なtype: ${t.type}. 有効な値: ${validTypes.join(", ")}`,
      t.id as string,
    );
  }

  // responsibilityの検証
  const validResponsibilities: EvaluatorResponsibility[] = [
    "name",
    "flavor",
    "attribute",
    "color-rarity",
  ];
  if (
    !validResponsibilities.includes(t.responsibility as EvaluatorResponsibility)
  ) {
    throw new EvaluatorTemplateError(
      `無効なresponsibility: ${t.responsibility}. 有効な値: ${validResponsibilities.join(", ")}`,
      t.id as string,
    );
  }

  // オプションフィールドの検証
  if (t.speechPattern !== undefined && typeof t.speechPattern !== "string") {
    throw new EvaluatorTemplateError(
      "speechPatternは文字列である必要があります",
      t.id as string,
    );
  }

  if (t.openingDialogues !== undefined) {
    if (!Array.isArray(t.openingDialogues)) {
      throw new EvaluatorTemplateError(
        "openingDialoguesは配列である必要があります",
        t.id as string,
      );
    }
    if (!t.openingDialogues.every((d) => typeof d === "string")) {
      throw new EvaluatorTemplateError(
        "openingDialoguesの全要素は文字列である必要があります",
        t.id as string,
      );
    }
  }
}

/**
 * テンプレートJSONをEvaluatorオブジェクトに変換
 *
 * @param template - 変換対象のテンプレート
 * @returns Evaluatorオブジェクト
 */
function templateToEvaluator(template: EvaluatorTemplate): Evaluator {
  return {
    id: template.id,
    name: template.name,
    type: template.type,
    persona: template.persona,
    role: template.role,
    responsibility: template.responsibility,
    imagePath: template.imagePath,
  };
}

/**
 * 単一の評議員テンプレートを読み込む
 *
 * @param templatePath - テンプレートファイルのパス（例: "/templates/evaluators/name-generator.json"）
 * @returns Evaluatorオブジェクト
 * @throws {EvaluatorTemplateError} テンプレートの読み込みまたは検証に失敗した場合
 */
export async function loadEvaluatorTemplate(
  templatePath: string,
): Promise<Evaluator> {
  try {
    const response = await fetch(templatePath);

    if (!response.ok) {
      throw new EvaluatorTemplateError(
        `テンプレートの読み込みに失敗しました: ${response.status} ${response.statusText}`,
      );
    }

    const template = await response.json();
    validateEvaluatorTemplate(template);

    return templateToEvaluator(template);
  } catch (error) {
    if (error instanceof EvaluatorTemplateError) {
      throw error;
    }
    throw new EvaluatorTemplateError(
      `テンプレートの読み込み中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * デフォルトの4人の評議員テンプレートを読み込む
 *
 * @returns 4人の評議員の配列
 * @throws {EvaluatorTemplateError} いずれかのテンプレートの読み込みに失敗した場合
 */
export async function loadDefaultEvaluators(): Promise<Evaluator[]> {
  const templatePaths = [
    "/templates/evaluators/name-generator.json",
    "/templates/evaluators/flavor-writer.json",
    "/templates/evaluators/attribute-decider.json",
    "/templates/evaluators/color-decider.json",
  ];

  try {
    const evaluators = await Promise.all(
      templatePaths.map((path) => loadEvaluatorTemplate(path)),
    );

    // 重複チェック
    const ids = new Set<string>();
    const responsibilities = new Set<EvaluatorResponsibility>();

    for (const evaluator of evaluators) {
      if (ids.has(evaluator.id)) {
        throw new EvaluatorTemplateError(
          `重複したID: ${evaluator.id}`,
          evaluator.id,
        );
      }
      ids.add(evaluator.id);

      if (responsibilities.has(evaluator.responsibility)) {
        throw new EvaluatorTemplateError(
          `重複したresponsibility: ${evaluator.responsibility}`,
          evaluator.id,
        );
      }
      responsibilities.add(evaluator.responsibility);
    }

    return evaluators;
  } catch (error) {
    if (error instanceof EvaluatorTemplateError) {
      throw error;
    }
    throw new EvaluatorTemplateError(
      `評議員テンプレートの読み込み中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
