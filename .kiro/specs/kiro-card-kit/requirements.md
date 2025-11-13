# 要件定義書

## はじめに

**kiro-card-kit** は、撮影したおもちゃ・物品の写真を元にTCG風の架空カードを自動生成するモバイルファーストのアプリケーションです。カード生成プロセスには4人のAI評価員が参加し、それぞれの視点から議論・分析した内容がUI上で可視化されます。評価員はテンプレートとして定義されており、ユーザーが自由に差し替え可能です。

本アプリケーションは、複数AIの共同制作とテンプレート性を体現し、子どもから開発者まで幅広いユーザーが楽しめる設計を目指します。UIデザインは `/design` ディレクトリのモックアプリを参考に構築します。

## 用語集

- **System**: kiro-card-kit アプリケーション全体（Next.jsで構築）
- **User**: アプリケーションを使用する人（保護者、コレクター、クリエイター、開発者）
- **AI Evaluator**: カード生成プロセスに参加する4人のAIキャラクター（評議員）
- **Card Data**: 生成されるTCGカードの情報（名前、属性、レア度、効果、フレーバーテキストなど）
- **Vision API**: 画像から物体特徴を解析するAPI（OpenAI Vision等）
- **Discussion Log**: AI評議員間の議論内容を記録したログ
- **Evaluator Template**: AI評議員の人格・言動の癖を定義したJSONまたはMDファイル
- **Card Skin**: カードのデザインテンプレート（背景、枠、属性アイコンなど）
- **Collection**: LocalStorageに保存されたカード生成履歴
- **Main Screen**: 画像をアップロードし、評議員の議論を表示し、カードをモーダルで表示する画面
- **Card Modal**: 生成されたカードを派手な演出で表示するモーダル
- **Lucide**: アプリケーション全体で使用するアイコンライブラリ
- **Vercel AI SDK**: AI機能の実装に使用するSDK


## 要件

### 要件1: 画像アップロード

**ユーザーストーリー:** 一般ユーザーとして、おもちゃや物品の写真を簡単にアップロードして、カード生成を開始したい

#### 受入基準

1. THE System SHALL Main Screenで画像アップロード機能を提供する
2. THE System SHALL ファイル選択ダイアログから画像を選択可能にする
3. THE System SHALL ドラッグ&ドロップで画像をアップロード可能にする
4. WHEN User が画像をアップロードする, THE System SHALL 画像を受け付ける
5. THE System SHALL JPEG、PNG、WEBP形式の画像をサポートする
6. WHEN 画像サイズが10MBを超える, THE System SHALL エラーメッセージを表示する

### 要件2: 画像解析と特徴抽出

**ユーザーストーリー:** システムとして、アップロードされた画像から物体の特徴を自動的に抽出し、カード生成の基礎情報としたい

#### 受入基準

1. WHEN User が開始ボタンを押す, THE System SHALL Vision APIを1回だけ呼び出す
2. THE System SHALL 画像解析中に4人の評議員が考えているアニメーションを表示する
3. THE System SHALL 物体の種類、色、形状、材質、詳細な説明を抽出する
4. THE System SHALL 抽出した特徴データを構造化形式で保存する
5. THE System SHALL 画像解析結果を全評議員で共有する
6. WHEN Vision APIがエラーを返す, THE System SHALL ユーザーにエラー通知を表示する

### 要件3: AI評議員による役割分担と並列生成

**ユーザーストーリー:** システムとして、4人のAI評議員がそれぞれ異なる役割を担当し、並列でカード要素を生成したい

#### 受入基準

1. THE System SHALL Vercel AI SDKを使用してAI機能を実装する
2. THE System SHALL 4人のAI評議員を初期化する
3. WHEN 画像解析が完了する, THE System SHALL 画像解析結果を全評議員に共有する
4. THE System SHALL 評議員1にカード名の決定を担当させる
5. THE System SHALL 評議員2にフレーバーテキストの決定を担当させる
6. THE System SHALL 評議員3に属性の決定を担当させる
7. THE System SHALL 評議員4にカードの色・レア度の決定を担当させる
8. THE System SHALL 4人の評議員の生成処理を並列実行する
9. THE System SHALL 各評議員の生成結果を個別に保存する

### 要件4: AI評議員の議論表示

**ユーザーストーリー:** ユーザーとして、AI評議員たちが議論する様子を見て楽しみたい

#### 受入基準

1. THE System SHALL 4人の評議員を表示する
2. THE System SHALL 各評議員にユーザー提供の画像を表示する
3. WHEN 画像解析が完了する, THE System SHALL 各評議員が担当する要素の生成を開始する
4. THE System SHALL 各評議員の発言を吹き出し形式でリアルタイム表示する
5. THE System SHALL 4人の評議員の発言を並列で表示する
6. WHEN 全評議員の生成が完了する, THE System SHALL 「結果を見る！」ボタンを表示する
7. THE System SHALL 議論ログを時系列順に保存する

### 要件5: カードデータの統合と生成

**ユーザーストーリー:** システムとして、各評議員が生成した要素を統合してTCGカードのデータを完成させたい

#### 受入基準

1. WHEN 全評議員の生成が完了する, THE System SHALL 各評議員の結果を統合する
2. THE System SHALL 評議員1が生成したカード名を採用する
3. THE System SHALL 評議員2が生成したフレーバーテキストを採用する
4. THE System SHALL 評議員3が決定した属性（Fire、Nature、Machine、Cosmic等）を採用する
5. THE System SHALL 評議員4が決定したカードの色・レア度（Common、Rare、Epic、Legendary）を採用する
6. THE System SHALL 統合したカードデータをJSON形式で保存する

### 要件6: カードモーダルの表示

**ユーザーストーリー:** ユーザーとして、生成されたカードをモーダルで確認したい

#### 受入基準

1. WHEN User が「結果を見る！」ボタンをクリックする, THE System SHALL Card Modalを表示する
2. THE System SHALL カード名、属性、レア度、フレーバーテキストを表示する
3. THE System SHALL アップロードされた画像をカード内に配置する
4. THE System SHALL Card Modalを閉じる機能を提供する

### 要件7: カードのコレクション保存とエクスポート

**ユーザーストーリー:** ユーザーとして、生成したカードをコレクションとして保存し、後から見返したりエクスポートしたい

#### 受入基準

1. WHEN カードが生成される, THE System SHALL カードデータをLocalStorageに保存する
2. THE System SHALL Card Modal内でカード画像をJPG形式でエクスポート可能にする
3. THE System SHALL Main Screenの右端にコレクション一覧を表示する
4. THE System SHALL コレクション一覧でカードを日付順に並べる
5. WHEN User がコレクションのカードをクリックする, THE System SHALL Card Modalを表示する
6. THE System SHALL LocalStorageの容量制限を考慮し、最大100枚までのカードを保存する

### 要件8: 評議員テンプレートのカスタマイズ

**ユーザーストーリー:** 開発者として、AI評議員の人格や役割を簡単に差し替えて、独自のカード生成体験を作りたい

#### 受入基準

1. THE System SHALL `templates/evaluators/` ディレクトリから評議員定義を読み込む
2. THE System SHALL JSON形式の評議員テンプレートをサポートする
3. THE System SHALL 評議員テンプレートにPersona（性格）、Role（役割）、Responsibility（担当要素）を含める
4. THE System SHALL 評議員の画像ファイルパスをテンプレートに含める
5. WHEN User が新しい評議員テンプレートを追加する, THE System SHALL 次回起動時に反映する
6. THE System SHALL 評議員テンプレートの検証を行い、不正な形式の場合はエラーを表示する
7. THE System SHALL デフォルトで4人の評議員テンプレート（カード名担当、フレーバー担当、属性担当、色・レア度担当）を提供する

### 要件9: エラーハンドリングとユーザー通知

**ユーザーストーリー:** ユーザーとして、エラーが発生した際に何が問題なのかを理解し、適切に対処したい

#### 受入基準

1. WHEN Vision APIが解析に失敗する, THE System SHALL エラーメッセージを表示する
2. WHEN AI評議員の生成が失敗する, THE System SHALL エラーメッセージを表示する
3. WHEN 解析または生成が失敗する, THE System SHALL 議論を自然に終了させる
4. WHEN 解析または生成が失敗する, THE System SHALL Main Screenの初期状態に戻る
5. WHEN ネットワークエラーが発生する, THE System SHALL オフライン状態を通知する
6. THE System SHALL エラーログをコンソールに出力する
7. THE System SHALL ユーザーフレンドリーなエラーメッセージを日本語で表示する

### 要件10: パフォーマンスと応答性

**ユーザーストーリー:** ユーザーとして、カード生成プロセスが迅速に完了し、待ち時間を議論で楽しみたい

#### 受入基準

1. THE System SHALL 画像解析と議論生成を非同期で並列実行する
2. THE System SHALL 議論の会話表示で処理時間を体感的に短縮する
3. THE System SHALL カード生成処理を議論表示と並行して実行する
4. WHEN カード生成が完了する, THE System SHALL 「結果を見る！」ボタンを表示する

### 要件11: 画面構成とナビゲーション

**ユーザーストーリー:** ユーザーとして、シンプルな画面構成で迷わずにカード生成とコレクション管理ができるようにしたい

#### 受入基準

1. THE System SHALL Main Screen 1画面のみを提供する
2. THE System SHALL Main Screenをアプリケーションの初期画面として表示する
3. THE System SHALL 画像アップロードエリアを提供する
4. THE System SHALL 議論表示エリアを提供する
5. WHEN カード生成が完了する, THE System SHALL 「結果を見る！」ボタンを表示する
6. WHEN User が「結果を見る！」ボタンをクリックする, THE System SHALL Card Modalを表示する

### 要件12: モバイルファースト設計

**ユーザーストーリー:** モバイルユーザーとして、スマートフォンで快適にカード生成を楽しみたい

#### 受入基準

1. THE System SHALL モバイルデバイスを優先した設計を採用する
2. THE System SHALL 320px以上の画面幅をサポートする
3. THE System SHALL タッチ操作に最適化されたUIを提供する
4. THE System SHALL レスポンシブレイアウトを実装する
5. THE System SHALL `/design` ディレクトリのモックアプリを参考にUIを構築する
