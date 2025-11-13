/**
 * Main Screenのテスト
 */

import { render, screen } from "@testing-library/react";
import MainScreen from "./page";

describe("MainScreen", () => {
  it("ヘッダーが正しく表示される", () => {
    render(<MainScreen />);

    expect(screen.getByText("Kiro Card Kit")).toBeInTheDocument();
    expect(
      screen.getByText("おもちゃや物品の写真からTCG風カードを自動生成"),
    ).toBeInTheDocument();
  });

  it("画像アップロードセクションが表示される", () => {
    render(<MainScreen />);

    expect(screen.getByText("画像をアップロード")).toBeInTheDocument();
  });

  it("評議員の議論セクションが表示される", () => {
    render(<MainScreen />);

    expect(screen.getByText("評議員の議論")).toBeInTheDocument();
  });

  it("コレクションセクションが表示される", () => {
    render(<MainScreen />);

    expect(screen.getByText("コレクション")).toBeInTheDocument();
  });
});
