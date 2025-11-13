/**
 * LocalStorageマネージャーのテスト
 */

import type { CardData } from "@/types/card";
import {
  clearAllCards,
  deleteCard,
  getAllCards,
  getCardById,
  getCardCount,
  getMaxCards,
  saveCard,
} from "./localStorageManager";

/**
 * テスト用のカードデータを生成
 */
function createMockCard(id: string, createdAt: Date): CardData {
  return {
    id,
    name: `Test Card ${id}`,
    attribute: "Fire",
    rarity: "Common",
    effect: "Test effect",
    flavorText: "Test flavor",
    description: "Test description",
    imagePath: "/test.jpg",
    imageData: "data:image/jpeg;base64,test",
    createdAt,
    discussionLog: [
      {
        id: `msg-${id}`,
        evaluatorId: "eval-1",
        evaluatorName: "Test Evaluator",
        message: "Test message",
        timestamp: createdAt,
        type: "discussion",
      },
    ],
  };
}

describe("LocalStorageManager", () => {
  beforeEach(() => {
    // 各テスト前にLocalStorageをクリア
    clearAllCards();
  });

  afterEach(() => {
    // 各テスト後にLocalStorageをクリア
    clearAllCards();
  });

  describe("saveCard", () => {
    it("カードを保存できる", () => {
      const card = createMockCard("card-1", new Date());
      saveCard(card);

      const cards = getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe("card-1");
    });

    it("複数のカードを保存できる", () => {
      const card1 = createMockCard("card-1", new Date("2024-01-01"));
      const card2 = createMockCard("card-2", new Date("2024-01-02"));

      saveCard(card1);
      saveCard(card2);

      const cards = getAllCards();
      expect(cards).toHaveLength(2);
    });

    it("カードを新しい順にソートする", () => {
      const card1 = createMockCard("card-1", new Date("2024-01-01"));
      const card2 = createMockCard("card-2", new Date("2024-01-03"));
      const card3 = createMockCard("card-3", new Date("2024-01-02"));

      saveCard(card1);
      saveCard(card2);
      saveCard(card3);

      const cards = getAllCards();
      expect(cards[0].id).toBe("card-2"); // 2024-01-03
      expect(cards[1].id).toBe("card-3"); // 2024-01-02
      expect(cards[2].id).toBe("card-1"); // 2024-01-01
    });

    it("100枚を超えるカードを保存すると古いカードが削除される", () => {
      // 101枚のカードを保存
      for (let i = 0; i < 101; i++) {
        const card = createMockCard(
          `card-${i}`,
          new Date(2024, 0, i + 1), // 2024-01-01から順に
        );
        saveCard(card);
      }

      const cards = getAllCards();
      expect(cards).toHaveLength(100);

      // 最も古いカード（card-0）が削除されていることを確認
      expect(cards.find((c) => c.id === "card-0")).toBeUndefined();

      // 最も新しいカード（card-100）が存在することを確認
      expect(cards.find((c) => c.id === "card-100")).toBeDefined();
    });
  });

  describe("getAllCards", () => {
    it("カードが存在しない場合は空配列を返す", () => {
      const cards = getAllCards();
      expect(cards).toEqual([]);
    });

    it("保存されたすべてのカードを取得できる", () => {
      const card1 = createMockCard("card-1", new Date("2024-01-01"));
      const card2 = createMockCard("card-2", new Date("2024-01-02"));

      saveCard(card1);
      saveCard(card2);

      const cards = getAllCards();
      expect(cards).toHaveLength(2);
    });

    it("Date型が正しく復元される", () => {
      const now = new Date();
      const card = createMockCard("card-1", now);
      saveCard(card);

      const cards = getAllCards();
      expect(cards[0].createdAt).toBeInstanceOf(Date);
      expect(cards[0].createdAt.getTime()).toBe(now.getTime());
    });
  });

  describe("getCardById", () => {
    it("IDでカードを取得できる", () => {
      const card = createMockCard("card-1", new Date());
      saveCard(card);

      const found = getCardById("card-1");
      expect(found).toBeDefined();
      expect(found?.id).toBe("card-1");
    });

    it("存在しないIDの場合はundefinedを返す", () => {
      const found = getCardById("non-existent");
      expect(found).toBeUndefined();
    });
  });

  describe("deleteCard", () => {
    it("カードを削除できる", () => {
      const card = createMockCard("card-1", new Date());
      saveCard(card);

      const result = deleteCard("card-1");
      expect(result).toBe(true);

      const cards = getAllCards();
      expect(cards).toHaveLength(0);
    });

    it("存在しないカードを削除しようとするとfalseを返す", () => {
      const result = deleteCard("non-existent");
      expect(result).toBe(false);
    });

    it("特定のカードのみを削除する", () => {
      const card1 = createMockCard("card-1", new Date("2024-01-01"));
      const card2 = createMockCard("card-2", new Date("2024-01-02"));

      saveCard(card1);
      saveCard(card2);

      deleteCard("card-1");

      const cards = getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe("card-2");
    });
  });

  describe("clearAllCards", () => {
    it("すべてのカードを削除できる", () => {
      const card1 = createMockCard("card-1", new Date());
      const card2 = createMockCard("card-2", new Date());

      saveCard(card1);
      saveCard(card2);

      clearAllCards();

      const cards = getAllCards();
      expect(cards).toHaveLength(0);
    });
  });

  describe("getCardCount", () => {
    it("保存されているカード数を取得できる", () => {
      expect(getCardCount()).toBe(0);

      saveCard(createMockCard("card-1", new Date()));
      expect(getCardCount()).toBe(1);

      saveCard(createMockCard("card-2", new Date()));
      expect(getCardCount()).toBe(2);
    });
  });

  describe("getMaxCards", () => {
    it("最大保存カード数を取得できる", () => {
      expect(getMaxCards()).toBe(100);
    });
  });
});
