/**
 * Jest設定ファイル
 * Next.js + TypeScript + React Testing Libraryのテスト環境を構成
 */

import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定（next.config.tsの場所）
  dir: "./",
});

const config: Config = {
  // テスト環境としてjsdomを使用（ブラウザ環境をシミュレート）
  testEnvironment: "jsdom",

  // 各テスト前にモックをクリア
  clearMocks: true,

  // カバレッジプロバイダー
  coverageProvider: "v8",

  // テストセットアップファイル
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // モジュール名のマッピング（エイリアス対応）
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // テストファイルのパターン
  testMatch: [
    "**/__tests__/**/*.?([mc])[jt]s?(x)",
    "**/?(*.)+(spec|test).?([mc])[jt]s?(x)",
  ],

  // テスト対象外のパス
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // 変換対象外のパス
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],

  // カバレッジ収集対象
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
  ],
};

export default createJestConfig(config);
