/**
 * Main Screenのテスト
 */

import { render, screen } from "@testing-library/react";
import MainScreen from "./page";

describe("MainScreen", () => {
  it("ヘッダーが正しく表示される", () => {
    render(<MainScreen />);

    expect(screen.getByText("KIRO CARD KIT")).toBeInTheDocument();
    expect(
      screen.getByText("おもちゃや物品の写真からTCG風カードを自動生成"),
    ).toBeInTheDocument();
  });

  it("画像アップロードプレースホルダーが表示される", () => {
    render(<MainScreen />);

    expect(
      screen.getByText("画像アップロード機能は次のタスクで実装されます"),
    ).toBeInTheDocument();
  });

  it("評議員が4人表示される", () => {
    render(<MainScreen />);

    expect(screen.getByText("評議員1")).toBeInTheDocument();
    expect(screen.getByText("評議員2")).toBeInTheDocument();
    expect(screen.getByText("評議員3")).toBeInTheDocument();
    expect(screen.getByText("評議員4")).toBeInTheDocument();
  });

  it("コレクションが空の場合は表示されない", () => {
    render(<MainScreen />);

    expect(screen.queryByText(/コレクション/)).not.toBeInTheDocument();
  });
});
