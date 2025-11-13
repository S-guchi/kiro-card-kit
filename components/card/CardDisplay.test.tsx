/**
 * CardDisplayコンポーネントのテスト
 */

import { render, screen } from "@testing-library/react";
import type { CardData } from "@/types/card";
import { CardDisplay } from "./CardDisplay";

describe("CardDisplay", () => {
  const mockCard: CardData = {
    id: "test-card-1",
    name: "テストカード",
    attribute: "Fire",
    rarity: "Legendary",
    effect: "テスト効果",
    flavorText: "これはテスト用のフレーバーテキストです。",
    description: "テスト説明",
    imagePath: "/test-image.jpg",
    imageData:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: new Date("2024-01-01"),
    discussionLog: [],
  };

  it("カード名を表示する", () => {
    render(<CardDisplay card={mockCard} />);
    expect(screen.getByText("テストカード")).toBeInTheDocument();
  });

  it("属性を表示する", () => {
    render(<CardDisplay card={mockCard} />);
    expect(screen.getByText("Fire")).toBeInTheDocument();
  });

  it("レア度を表示する", () => {
    render(<CardDisplay card={mockCard} />);
    expect(screen.getByText("Legendary")).toBeInTheDocument();
  });

  it("フレーバーテキストを表示する", () => {
    render(<CardDisplay card={mockCard} />);
    expect(
      screen.getByText("これはテスト用のフレーバーテキストです。"),
    ).toBeInTheDocument();
  });

  it("属性アイコンにaria-labelが設定されている", () => {
    render(<CardDisplay card={mockCard} />);
    const icon = screen.getByLabelText("Fire");
    expect(icon).toBeInTheDocument();
  });

  it("カスタムクラス名を適用できる", () => {
    const { container } = render(
      <CardDisplay card={mockCard} className="custom-class" />,
    );
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.className).toContain("custom-class");
  });

  it("異なる属性のカードを正しく表示する", () => {
    const natureCard: CardData = {
      ...mockCard,
      attribute: "Nature",
    };
    render(<CardDisplay card={natureCard} />);
    expect(screen.getByText("Nature")).toBeInTheDocument();
    expect(screen.getByLabelText("Nature")).toBeInTheDocument();
  });

  it("異なるレア度のカードを正しく表示する", () => {
    const commonCard: CardData = {
      ...mockCard,
      rarity: "Common",
    };
    render(<CardDisplay card={commonCard} />);
    expect(screen.getByText("Common")).toBeInTheDocument();
  });
});
