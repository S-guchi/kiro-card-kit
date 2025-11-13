/**
 * LocalStorageマネージャー
 * カードデータの保存・読み込み・管理を行う
 *
 * 要件:
 * - 7.1: カードデータをLocalStorageに保存
 * - 7.6: 最大100枚の制限、古いカードの自動削除
 */

import type { CardData } from "@/types/card";

/**
 * LocalStorageのキー
 */
const STORAGE_KEY = "kiro-card-kit:cards";

/**
 * 最大保存カード数
 */
const MAX_CARDS = 100;

/**
 * LocalStorageが利用可能かチェック
 *
 * @returns LocalStorageが利用可能な場合true
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__localStorage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * カードデータをシリアライズ
 * Date型をISO文字列に変換
 *
 * @param card - カードデータ
 * @returns シリアライズされたカードデータ
 */
function serializeCard(card: CardData): string {
  return JSON.stringify({
    ...card,
    createdAt: card.createdAt.toISOString(),
    discussionLog: card.discussionLog.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    })),
  });
}

/**
 * カードデータをデシリアライズ
 * ISO文字列をDate型に変換
 *
 * @param data - シリアライズされたカードデータ
 * @returns カードデータ
 */
function deserializeCard(data: string): CardData {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    createdAt: new Date(parsed.createdAt),
    discussionLog: parsed.discussionLog.map(
      (msg: {
        id: string;
        evaluatorId: string;
        evaluatorName: string;
        message: string;
        timestamp: string;
        type: string;
      }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }),
    ),
  };
}

/**
 * カードデータを保存
 * 最大100枚の制限を超える場合、古いカードを自動削除
 *
 * @param card - 保存するカードデータ
 * @throws LocalStorageが利用できない場合
 */
export function saveCard(card: CardData): void {
  if (!isLocalStorageAvailable()) {
    throw new Error("LocalStorage is not available");
  }

  const cards = getAllCards();

  // 新しいカードを追加
  cards.push(card);

  // 作成日時でソート（新しい順）
  cards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // 最大枚数を超える場合、古いカードを削除
  const cardsToSave = cards.slice(0, MAX_CARDS);

  // LocalStorageに保存
  const serialized = cardsToSave.map((c) => serializeCard(c));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
}

/**
 * すべてのカードデータを取得
 * 作成日時の新しい順でソート
 *
 * @returns カードデータの配列
 */
export function getAllCards(): CardData[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const serialized: string[] = JSON.parse(data);
    const cards = serialized.map((s) => deserializeCard(s));

    // 作成日時でソート（新しい順）
    return cards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Failed to load cards from LocalStorage:", error);
    return [];
  }
}

/**
 * IDでカードデータを取得
 *
 * @param id - カードID
 * @returns カードデータ、見つからない場合はundefined
 */
export function getCardById(id: string): CardData | undefined {
  const cards = getAllCards();
  return cards.find((card) => card.id === id);
}

/**
 * カードデータを削除
 *
 * @param id - 削除するカードのID
 * @returns 削除に成功した場合true
 */
export function deleteCard(id: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const cards = getAllCards();
    const filteredCards = cards.filter((card) => card.id !== id);

    if (cards.length === filteredCards.length) {
      // カードが見つからなかった
      return false;
    }

    const serialized = filteredCards.map((c) => serializeCard(c));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    return true;
  } catch (error) {
    console.error("Failed to delete card:", error);
    return false;
  }
}

/**
 * すべてのカードデータを削除
 */
export function clearAllCards(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 保存されているカード数を取得
 *
 * @returns カード数
 */
export function getCardCount(): number {
  return getAllCards().length;
}

/**
 * 最大保存カード数を取得
 *
 * @returns 最大保存カード数
 */
export function getMaxCards(): number {
  return MAX_CARDS;
}
