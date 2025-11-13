# デザイン文書

## 概要

kiro-card-kitは、Next.js、Vercel AI SDK、Motion（motion.dev）を使用して構築されるTCGカード生成アプリケーションです。ユーザーがアップロードした画像を4人のAI評議員が分析・議論し、その過程を楽しみながらオリジナルのTCGカードを生成します。

### 主要な設計目標

1. **体験重視のUX**: 評議員のアニメーションと議論表示で待ち時間を楽しい体験に変換
2. **テンプレート性**: 評議員とカードスキンを簡単に差し替え可能
3. **パフォーマンス**: 非同期処理による体感速度の向上
4. **シンプルさ**: 1画面構成、モーダルでのカード表示、直感的な操作フロー

## アーキテクチャ

### 技術スタック

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アニメーション**: Motion (motion.dev)
- **アイコン**: Lucide React
- **AI**: Vercel AI SDK + OpenAI
- **ストレージ**: LocalStorage (クライアントサイド)
- **状態管理**: React Context + Hooks

### システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App                          │
├─────────────────────────────────────────────────────────┤
│  UI Layer                                                │
│  ├─ Main Screen (評議員アニメーション + 議論表示)        │
│  └─ Card Modal (カード表示 + 派手な演出)                 │
├─────────────────────────────────────────────────────────┤
│  Business Logic Layer                                    │
│  ├─ Card Generation Service                             │
│  ├─ Discussion Orchestrator                             │
│  ├─ Animation Controller                                │
│  └─ Template Manager                                    │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                              │
│  ├─ LocalStorage Manager                                │
│  ├─ Evaluator Templates                                 │
│  └─ Card Skins                                          │
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
│   │   ├── CardExporter.tsx
│   │   └── CardSkinSelector.tsx
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
│   │   ├── evaluators/
│   │   │   ├── name-generator.json
│   │   │   ├── flavor-writer.json
│   │   │   ├── attribute-decider.json
│   │   │   └── color-decider.json
│   │   └── card-skins/
│   │       └── default/
│   └── images/
│       └── evaluators/
│           ├── name-generator.png
│           ├── flavor-writer.png
│           ├── attribute-decider.png
│           └── color-decider.png
├── types/
│   ├── card.ts
│   ├── evaluator.ts
│   └── discussion.ts
└── package.json
```

## コンポーネントとインターフェース

### 主要コンポーネント

#### 1. Main Screen

**責務**: 画像アップロード、評議員表示、議論アニメーション、コレクション管理

**構成要素**:
- `ImageUploader`: ドラッグ&ドロップ、ファイル選択
- `EvaluatorPanel`: 4人の評議員を左側に縦配置
- `DiscussionStage`: 評議員のアニメーションと議論表示
- `CollectionSidebar`: 右端のコレクション一覧
- 「結果を見る！」ボタン

**状態管理**:
```typescript
interface MainScreenState {
  uploadedImage: File | null;
  isDiscussing: boolean;
  discussionPhase: 'idle' | 'moving' | 'opening' | 'thinking' | 'generating' | 'complete';
  evaluators: Evaluator[];
  discussionLog: DiscussionMessage[];
  collection: CardData[];
  generatedCard: CardData | null;
  showResultButton: boolean;
}
```

#### 2. Card Modal

**責務**: 生成されたカードの派手な演出での表示、エクスポート機能

**構成要素**:
- `CardDisplay`: TCG風カードUI
- `CardExporter`: JPG形式でのエクスポート
- 閉じるボタン

**演出**:
- フェードイン + スケールアニメーション
- レア度に応じたパーティクルエフェクト
- 背景のぼかし効果

#### 3. DiscussionStage

**責務**: 評議員のアニメーションと議論の可視化

**アニメーションフロー**:
1. **待機状態**: 左側に4人縦並び
2. **移動開始**: 開始ボタン押下 → 画像を中央配置
3. **四隅へ移動**: Motion使用、トコトコ歩くアニメーション
4. **Opening Dialogue**: ランダムな導入会話
5. **Thinking Phase**: 4人全員が「うーん」と考えるアニメーション（画像解析中）
6. **Generation Phase**: 吹き出しで各評議員の発言を並列表示
7. **完了**: 「結果を見る！」ボタン表示 → Card Modal表示

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
  speechPattern: string;  // 言動の癖
  openingDialogues: string[];  // 導入会話の配列
  imagePath: string;  // 評議員の画像パス
  position: {
    idle: { x: number; y: number };  // 待機位置
    discussion: { x: number; y: number };  // 議論位置（四隅）
  };
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
  skinId: string;  // 使用したスキンID
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
  type: 'opening' | 'analysis' | 'discussion' | 'conclusion';
}
```

#### CardSkin (カードスキン)

```typescript
interface CardSkin {
  id: string;
  name: string;
  backgroundImage: string;
  frameStyles: {
    common: string;
    rare: string;
    epic: string;
    legendary: string;
  };
  attributeIcons: {
    Fire: string;
    Nature: string;
    Machine: string;
    Cosmic: string;
    Shadow: string;
    Light: string;
  };
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
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

## アニメーションとUX設計

### 評議員アニメーション

**Motion（motion.dev）を使用した実装**:

```typescript
// 待機状態から議論位置への移動
const evaluatorVariants = {
  idle: (index: number) => ({
    x: 0,
    y: index * 120,  // 縦に120pxずつ配置
    scale: 0.8,
  }),
  discussion: (corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => ({
    x: cornerPositions[corner].x,
    y: cornerPositions[corner].y,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 20,
      duration: 1.5,
    },
  }),
};
```

### 議論フロー

1. **Opening Dialogue (1-2秒)**
   - ランダムに選ばれた導入会話を表示
   - 例: 「今日の画像はこれね〜みてみてよっか」

2. **Thinking Phase (画像解析中)**
   - 4人全員が「うーん」と考えているアニメーションを表示
   - この間に画像解析APIを1回だけ実行（コスト削減）
   - 画像の詳細情報（物体、色、形状、材質、説明）を取得

3. **Parallel Generation Phase (並列実行)**
   - 画像解析結果を全評議員で共有
   - 評議員1: カード名を生成
   - 評議員2: フレーバーテキストを生成
   - 評議員3: 属性を決定
   - 評議員4: カードの色・レア度を決定
   - 4人の発言を並列で吹き出し表示

4. **Integration & Result Button**
   - 各評議員の結果を統合
   - カードデータ生成完了
   - 「結果を見る！」ボタンを表示
   - ボタンクリックでCard Modalを派手な演出で表示

### 吹き出しアニメーション

```typescript
const speechBubbleVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
};
```

## エラーハンドリング

### エラー種別と対応

| エラー種別 | 検知タイミング | ユーザー通知 | リトライ |
|-----------|--------------|------------|---------|
| 画像サイズ超過 | アップロード時 | トースト通知 | 不要 |
| 画像形式不正 | アップロード時 | トースト通知 | 不要 |
| Vision API解析失敗 | 解析中 | 評議員の謝罪メッセージ | 不要 |
| AI生成失敗 | 議論生成中 | 評議員の謝罪メッセージ | 不要 |
| ネットワークエラー | API呼び出し時 | モーダル | 可能 |
| LocalStorage容量超過 | 保存時 | モーダル | 不要 |

**解析失敗時の特別な処理**:
- Vision APIまたはAI生成が失敗した場合、評議員が「ごめん、よくわからなかった...」といった謝罪メッセージを表示
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

## テスト戦略

### テスト範囲

1. **ユニットテスト（重要な箇所のみ）**
   - カード生成ロジック
   - テンプレート読み込み
   - LocalStorage操作
   - バリデーション関数

### テストツール

- **ユニット**: Jest
- **コンポーネント**: React Testing Library

## パフォーマンス最適化

### 目標

- UI応答性: 60fps維持

### 最適化戦略

1. **並行処理**
   - 画像解析は1回のみ実行（コスト削減）
   - 4人の評議員のカード要素生成を並列実行
   - 考えているアニメーション表示中に画像解析を実行

2. **画像最適化**
   - アップロード時にリサイズ（最大1024x1024）
   - WebP形式への変換
   - Base64エンコードの遅延実行

3. **LocalStorage最適化**
   - 画像データの圧縮
   - 古いカードの自動削除（100枚制限）
   - インデックス管理

4. **アニメーション最適化**
   - GPU加速（transform, opacity使用）
   - will-change プロパティの適切な使用
   - アニメーション中の再レンダリング抑制

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

このデザインは、要件定義書で定義された全ての機能要件を満たしつつ、拡張性とメンテナンス性を考慮した設計となっています。特に、評議員のアニメーションと議論表示によるUX向上、テンプレートシステムによるカスタマイズ性、パフォーマンス最適化による快適な操作感を重視しています。
