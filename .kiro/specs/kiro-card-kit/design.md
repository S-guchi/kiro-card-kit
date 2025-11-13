# デザイン文書

## 概要

kiro-card-kitは、Next.js、Vercel AI SDKを使用して構築されるモバイルファーストのTCGカード生成アプリケーションです。ユーザーがアップロードした画像を4人のAI評議員が分析・議論し、その過程を楽しみながらオリジナルのTCGカードを生成します。

UIデザインは `/design` ディレクトリのモックアプリを参考に構築します。

### 主要な設計目標

1. **モバイルファースト**: スマートフォンでの利用を最優先に設計
2. **体験重視のUX**: 評議員の議論表示で待ち時間を楽しい体験に変換
3. **テンプレート性**: 評議員を簡単に差し替え可能
4. **パフォーマンス**: 非同期処理による体感速度の向上
5. **シンプルさ**: 1画面構成、モーダルでのカード表示、直感的な操作フロー

## アーキテクチャ

### 技術スタック

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **AI**: Vercel AI SDK + OpenAI
- **ストレージ**: LocalStorage (クライアントサイド)
- **状態管理**: React Context + Hooks
- **テスト**: Jest + React Testing Library
- **デザイン参考**: `/design` ディレクトリのモックアプリ

### システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App                          │
├─────────────────────────────────────────────────────────┤
│  UI Layer (モバイルファースト)                           │
│  ├─ Main Screen (議論表示)                              │
│  └─ Card Modal (カード表示)                             │
├─────────────────────────────────────────────────────────┤
│  Business Logic Layer                                    │
│  ├─ Card Generation Service                             │
│  ├─ Discussion Orchestrator                             │
│  └─ Template Manager                                    │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                              │
│  ├─ LocalStorage Manager                                │
│  └─ Evaluator Templates                                 │
├─────────────────────────────────────────────────────────┤
│  External Services                                       │
│  ├─ Vercel AI SDK (OpenAI)                             │
│  └─ Vision API (画像解析)                               │
└─────────────────────────────────────────────────────────┘
```

### ディレクトリ構造

```
kiro-card-kit/
├── app/
│   ├── page.tsx                    # Main Screen
│   ├── api/
│   │   ├── analyze-image/route.ts  # 画像解析API
│   │   ├── generate-discussion/route.ts  # 議論生成API
│   │   └── generate-card/route.ts  # カード生成API
│   └── layout.tsx
├── components/
│   ├── main/
│   │   ├── ImageUploader.tsx
│   │   ├── EvaluatorPanel.tsx
│   │   └── CollectionSidebar.tsx
│   ├── discussion/
│   │   ├── EvaluatorAvatar.tsx
│   │   ├── SpeechBubble.tsx
│   │   └── DiscussionStage.tsx
│   ├── card/
│   │   ├── CardModal.tsx
│   │   ├── CardDisplay.tsx
│   │   └── CardExporter.tsx
│   └── common/
│       ├── Button.tsx
│       └── ErrorBoundary.tsx
├── lib/
│   ├── services/
│   │   ├── cardGenerationService.ts
│   │   ├── discussionOrchestrator.ts
│   │   └── visionService.ts
│   ├── storage/
│   │   └── localStorageManager.ts
│   ├── templates/
│   │   ├── evaluatorLoader.ts
│   │   └── skinLoader.ts
│   └── utils/
│       ├── animation.ts
│       └── validation.ts
├── public/
│   ├── templates/
│   │   └── evaluators/
│   │       ├── name-generator.json
│   │       ├── flavor-writer.json
│   │       ├── attribute-decider.json
│   │       └── color-decider.json
│   └── member/
│       ├── 1.png  # 評議員1の画像
│       ├── 2.png  # 評議員2の画像
│       ├── 3.png  # 評議員3の画像
│       └── 4.png  # 評議員4の画像
├── design/
│   └── # モックアプリ（UI設計の参考）
├── types/
│   ├── card.ts
│   ├── evaluator.ts
│   └── discussion.ts
└── package.json
```

## コンポーネントとインターフェース

### 主要コンポーネント

#### 1. Main Screen

**責務**: 画像アップロード、評議員表示、議論表示、コレクション管理

**構成要素**:
- `ImageUploader`: ドラッグ&ドロップ、ファイル選択
- `EvaluatorPanel`: 4人の評議員表示
- `DiscussionStage`: 評議員の議論表示
- `CollectionSidebar`: コレクション一覧
- 「結果を見る！」ボタン

**レイアウト**: `/design` ディレクトリのモックアプリを参考に、モバイルファーストで構築

**状態管理**:
```typescript
interface MainScreenState {
  uploadedImage: File | null;
  isDiscussing: boolean;
  discussionPhase: 'idle' | 'thinking' | 'generating' | 'complete';
  evaluators: Evaluator[];
  discussionLog: DiscussionMessage[];
  collection: CardData[];
  generatedCard: CardData | null;
  showResultButton: boolean;
}
```

#### 2. Card Modal

**責務**: 生成されたカードの表示、エクスポート機能

**構成要素**:
- `CardDisplay`: TCG風カードUI
- `CardExporter`: JPG形式でのエクスポート
- 閉じるボタン

**デザイン**: `/design` ディレクトリのモックアプリを参考に構築

#### 3. DiscussionStage

**責務**: 評議員の議論の可視化

**議論フロー**:
1. **待機状態**: 評議員表示
2. **開始**: 開始ボタン押下
3. **Thinking Phase**: 画像解析中の表示
4. **Generation Phase**: 吹き出しで各評議員の発言を並列表示
5. **完了**: 「結果を見る！」ボタン表示 → Card Modal表示

**デザイン**: `/design` ディレクトリのモックアプリを参考に構築

### データモデル

#### Evaluator (評議員)

```typescript
interface Evaluator {
  id: string;
  name: string;
  type: 'name-generator' | 'flavor-writer' | 'attribute-decider' | 'color-decider';
  persona: string;  // 性格・役割の説明
  role: string;  // 分析における役割
  responsibility: 'name' | 'flavor' | 'attribute' | 'color-rarity';  // 担当要素
  imagePath: string;  // 評議員の画像パス（例: /member/1.png）
}
```

#### CardData (カードデータ)

```typescript
interface CardData {
  id: string;
  name: string;
  attribute: 'Fire' | 'Nature' | 'Machine' | 'Cosmic' | 'Shadow' | 'Light';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  effect: string;  // 効果・スキル
  flavorText: string;  // フレーバーテキスト
  description: string;  // カード説明
  imagePath: string;  // 元画像のパス
  imageData: string;  // Base64エンコードされた画像データ
  createdAt: Date;
  discussionLog: DiscussionMessage[];
}
```

#### DiscussionMessage (議論メッセージ)

```typescript
interface DiscussionMessage {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  message: string;
  timestamp: Date;
  type: 'analysis' | 'discussion' | 'conclusion';
}
```

### API設計

#### POST /api/analyze-image

**リクエスト**:
```typescript
{
  image: File | Blob;
}
```

**レスポンス**:
```typescript
{
  features: {
    objectType: string;
    colors: string[];
    shapes: string[];
    materials: string[];
    detailedDescription: string;  // 詳細な説明
  };
}
```

**備考**: コスト削減のため、このAPIは1回のみ呼び出される

#### POST /api/generate-card-elements

**リクエスト**:
```typescript
{
  imageFeatures: ImageFeatures;
  evaluator: Evaluator;
  responsibility: 'name' | 'flavor' | 'attribute' | 'color-rarity';
}
```

**レスポンス**:
```typescript
{
  result: {
    name?: string;  // responsibility='name'の場合
    flavor?: string;  // responsibility='flavor'の場合
    attribute?: string;  // responsibility='attribute'の場合
    color?: string;  // responsibility='color-rarity'の場合
    rarity?: string;  // responsibility='color-rarity'の場合
  };
  message: string;  // 評議員の発言
}
```

**備考**: 4人の評議員に対して並列で呼び出される

## UX設計

### 議論フロー

1. **Thinking Phase (画像解析中)**
   - 画像解析中の表示
   - この間に画像解析APIを1回だけ実行（コスト削減）
   - 画像の詳細情報（物体、色、形状、材質、説明）を取得

2. **Parallel Generation Phase (並列実行)**
   - 画像解析結果を全評議員で共有
   - 評議員1: カード名を生成
   - 評議員2: フレーバーテキストを生成
   - 評議員3: 属性を決定
   - 評議員4: カードの色・レア度を決定
   - 4人の発言を並列で吹き出し表示

3. **Integration & Result Button**
   - 各評議員の結果を統合
   - カードデータ生成完了
   - 「結果を見る！」ボタンを表示
   - ボタンクリックでCard Modalを表示

### モバイルファースト設計

- 320px以上の画面幅をサポート
- タッチ操作に最適化されたUI
- レスポンシブレイアウト
- `/design` ディレクトリのモックアプリを参考に構築

## エラーハンドリング

### エラー種別と対応

| エラー種別 | 検知タイミング | ユーザー通知 | リトライ |
|-----------|--------------|------------|---------|
| 画像サイズ超過 | アップロード時 | トースト通知 | 不要 |
| 画像形式不正 | アップロード時 | トースト通知 | 不要 |
| Vision API解析失敗 | 解析中 | エラーメッセージ | 不要 |
| AI生成失敗 | 議論生成中 | エラーメッセージ | 不要 |
| ネットワークエラー | API呼び出し時 | モーダル | 可能 |
| LocalStorage容量超過 | 保存時 | モーダル | 不要 |

**解析失敗時の特別な処理**:
- Vision APIまたはAI生成が失敗した場合、エラーメッセージを表示
- 議論を自然に終了させ、Main Screenの初期状態に戻る
- リトライボタンは表示せず、ユーザーが再度画像をアップロードする形式

### エラーハンドリング実装

```typescript
class CardGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean
  ) {
    super(message);
  }
}

// エラーハンドリングサービス
const handleError = (error: CardGenerationError) => {
  // ログ出力
  console.error(`[${error.code}] ${error.message}`);
  
  // ユーザー通知
  if (error.retryable) {
    showRetryModal(error.message);
  } else {
    showErrorToast(error.message);
  }
};
```

## パフォーマンス最適化

### 目標

- UI応答性: 60fps維持

### 最適化戦略

1. **並行処理**
   - 画像解析は1回のみ実行（コスト削減）
   - 4人の評議員のカード要素生成を並列実行
   - 画像解析中の表示で待ち時間を短縮

2. **画像最適化**
   - アップロード時にリサイズ（最大1024x1024）
   - WebP形式への変換
   - Base64エンコードの遅延実行

3. **LocalStorage最適化**
   - 画像データの圧縮
   - 古いカードの自動削除（100枚制限）
   - インデックス管理

4. **モバイル最適化**
   - タッチイベントの最適化
   - レスポンシブ画像の使用
   - モバイルブラウザでのパフォーマンス考慮

## テスト戦略

### テストアプローチ

- **ファイル単位での小さなテスト**: 各コンポーネント、サービス、ユーティリティごとに独立したテストファイルを作成
- **単体テスト**: Jest + React Testing Libraryを使用
- **テストファイル配置**: `__tests__` ディレクトリまたは各ファイルと同階層に `.test.ts` / `.test.tsx` ファイルを配置

### テスト対象

1. **コンポーネントテスト**
   - 各UIコンポーネントの描画とインタラクション
   - プロップスの変更による動作確認

2. **サービステスト**
   - カード生成ロジック
   - LocalStorage操作
   - テンプレート読み込み

3. **ユーティリティテスト**
   - バリデーション関数
   - データ変換関数

## セキュリティ考慮事項

1. **画像アップロード**
   - ファイルサイズ制限（10MB）
   - MIME type検証
   - 悪意のあるファイルの検出

2. **API呼び出し**
   - レート制限
   - APIキーの環境変数管理
   - CORS設定

3. **LocalStorage**
   - XSS対策（サニタイゼーション）
   - データ暗号化（機密情報なし）

## デプロイメント

### Vercel デプロイ

```bash
# 環境変数設定
OPENAI_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# デプロイ
vercel --prod
```

### 環境変数

| 変数名 | 説明 | 必須 |
|-------|------|------|
| OPENAI_API_KEY | OpenAI API キー | ✓ |
| NEXT_PUBLIC_APP_URL | アプリケーションURL | ✓ |
| NEXT_PUBLIC_MAX_CARDS | 最大保存カード数 | × (デフォルト: 100) |

## まとめ

このデザインは、要件定義書で定義された全ての機能要件を満たしつつ、拡張性とメンテナンス性を考慮した設計となっています。特に、モバイルファーストの設計、評議員の議論表示によるUX向上、テンプレートシステムによるカスタマイズ性、パフォーマンス最適化による快適な操作感を重視しています。

UIデザインは `/design` ディレクトリのモックアプリを参考に構築します。
