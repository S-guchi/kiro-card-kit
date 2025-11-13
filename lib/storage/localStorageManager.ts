import type { CardData } from "@/types/card.js";

/**
 * LocalStorageのキー定義
 */
const STORAGE_KEYS = {
  /** カードコレクションのキー */
  CARDS: "kiro-card-kit:cards",
  /** 最大保存枚数のキー */
  MAX_CARDS: "kiro-card-kit:max-cards",
} as const;

/**
 * デフォルトの最大保存枚数
 */
const DEFAULT_MAX_CARDS = 100;

/**
 * LocalStorageマネージャークラス
 *
 * @remarks
 * カードデータのLocalStorageへの保存・読み込みを管理する。
 * 最大100枚の制限を実装し、古いカードを自動削除する。
 *
 * @example
 * ```typescript
 * const manager = new LocalStorageManager();
 * await manager.saveCard(cardData);
 * const cards = await manager.loadCards();
 * ```
 */
export class LocalStorageManager {
  private maxCards: number;

  /**
   * LocalStorageマネージャーを初期化する
   *
   * @param maxCards - 最大保存枚数（デフォルト: 100）
   */
  constructor(maxCards?: number) {
    this.maxCards = maxCards ?? this.getMaxCardsFromEnv();
  }

  /**
   * 環境変数から最大保存枚数を取得する
   *
   * @returns 最大保存枚数
   */
  private getMaxCardsFromEnv(): number {
    if (typeof window === "undefined") {
      return DEFAULT_MAX_CARDS;
    }

    const envMaxCards = process.env.NEXT_PUBLIC_MAX_CARDS;
    if (envMaxCards) {
      const parsed = Number.parseInt(envMaxCards, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return DEFAULT_MAX_CARDS;
  }

  /**
   * カードデータをLocalStorageに保存する
   *
   * @param card - 保存するカードデータ
   * @throws {Error} LocalStorageが利用できない場合
   *
   * @remarks
   * - 最大保存枚数を超える場合、最も古いカードを自動削除する
   * - カードは作成日時の降順（新しい順）でソートされる
   */
  async saveCard(card: CardData): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("LocalStorageはブラウザ環境でのみ利用可能です");
    }

    try {
      // 既存のカードを読み込む
      const existingCards = await this.loadCards();

      // 新しいカードを追加
      const updatedCards = [card, ...existingCards];

      // 最大枚数を超える場合、古いカードを削除
      const cardsToSave =
        updatedCards.length > this.maxCards
          ? updatedCards.slice(0, this.maxCards)
          : updatedCards;

      // LocalStorageに保存
      this.saveToStorage(cardsToSave);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`カードの保存に失敗しました: ${error.message}`);
      }
      throw new Error("カードの保存に失敗しました");
    }
  }

  /**
   * LocalStorageからカードデータを読み込む
   *
   * @returns カードデータの配列（作成日時の降順）
   * @throws {Error} LocalStorageが利用できない場合
   *
   * @remarks
   * - カードが存在しない場合は空配列を返す
   * - 読み込んだカードは作成日時の降順でソートされる
   */
  async loadCards(): Promise<CardData[]> {
    if (typeof window === "undefined") {
      throw new Error("LocalStorageはブラウザ環境でのみ利用可能です");
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CARDS);

      if (!stored) {
        return [];
      }

      const cards = JSON.parse(stored) as CardData[];

      // Date型に変換してソート
      return cards
        .map((card) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          discussionLog: card.discussionLog.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`カードの読み込みに失敗しました: ${error.message}`);
      }
      throw new Error("カードの読み込みに失敗しました");
    }
  }

  /**
   * 特定のIDのカードを取得する
   *
   * @param id - カードID
   * @returns カードデータ、見つからない場合はnull
   * @throws {Error} LocalStorageが利用できない場合
   */
  async getCardById(id: string): Promise<CardData | null> {
    const cards = await this.loadCards();
    return cards.find((card) => card.id === id) ?? null;
  }

  /**
   * 特定のIDのカードを削除する
   *
   * @param id - 削除するカードのID
   * @throws {Error} LocalStorageが利用できない場合
   *
   * @remarks
   * 指定されたIDのカードが存在しない場合でもエラーは発生しない
   */
  async deleteCard(id: string): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("LocalStorageはブラウザ環境でのみ利用可能です");
    }

    try {
      const cards = await this.loadCards();
      const filteredCards = cards.filter((card) => card.id !== id);
      this.saveToStorage(filteredCards);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`カードの削除に失敗しました: ${error.message}`);
      }
      throw new Error("カードの削除に失敗しました");
    }
  }

  /**
   * すべてのカードを削除する
   *
   * @throws {Error} LocalStorageが利用できない場合
   */
  async clearAllCards(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("LocalStorageはブラウザ環境でのみ利用可能です");
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.CARDS);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`カードのクリアに失敗しました: ${error.message}`);
      }
      throw new Error("カードのクリアに失敗しました");
    }
  }

  /**
   * 保存されているカードの枚数を取得する
   *
   * @returns カードの枚数
   * @throws {Error} LocalStorageが利用できない場合
   */
  async getCardCount(): Promise<number> {
    const cards = await this.loadCards();
    return cards.length;
  }

  /**
   * 最大保存枚数を取得する
   *
   * @returns 最大保存枚数
   */
  getMaxCards(): number {
    return this.maxCards;
  }

  /**
   * LocalStorageにカードデータを保存する（内部メソッド）
   *
   * @param cards - 保存するカードデータの配列
   * @throws {Error} LocalStorageの容量超過などのエラー
   */
  private saveToStorage(cards: CardData[]): void {
    try {
      const serialized = JSON.stringify(cards);
      localStorage.setItem(STORAGE_KEYS.CARDS, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        throw new Error(
          "LocalStorageの容量が不足しています。古いカードを削除してください。",
        );
      }
      throw error;
    }
  }
}

/**
 * デフォルトのLocalStorageマネージャーインスタンス
 *
 * @remarks
 * シングルトンパターンで使用する場合に利用する
 */
export const defaultStorageManager = new LocalStorageManager();

/**
 * コレクション（保存されたカード）を読み込む
 *
 * @returns カードデータの配列
 *
 * @remarks
 * デフォルトのLocalStorageマネージャーを使用してカードを読み込む。
 * エラーが発生した場合は空配列を返す。
 */
export function loadCollection(): CardData[] {
  try {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = localStorage.getItem("kiro-card-kit:cards");
    if (!stored) {
      return [];
    }

    const cards = JSON.parse(stored) as CardData[];
    return cards
      .map((card) => ({
        ...card,
        createdAt: new Date(card.createdAt),
        discussionLog: card.discussionLog.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("コレクションの読み込みに失敗しました:", error);
    return [];
  }
}
