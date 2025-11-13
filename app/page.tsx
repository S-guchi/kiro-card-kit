/**
 * Main Screen
 * 画像アップロード、評議員表示、議論表示、コレクション管理を行うメイン画面
 * モバイルファースト設計を考慮したレスポンシブレイアウト
 */

export default function MainScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      {/* ヘッダー */}
      <header className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Kiro Card Kit
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          おもちゃや物品の写真からTCG風カードを自動生成
        </p>
      </header>

      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col gap-4 p-4 md:flex-row">
        {/* 左側: 画像アップロードと議論表示エリア */}
        <div className="flex flex-1 flex-col gap-4">
          {/* 画像アップロードエリア */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              画像をアップロード
            </h2>
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">
                画像アップロード機能は次のタスクで実装されます
              </p>
            </div>
          </section>

          {/* 議論表示エリア */}
          <section className="flex-1 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              評議員の議論
            </h2>
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-zinc-500 dark:text-zinc-400">
                議論表示機能は次のタスクで実装されます
              </p>
            </div>
          </section>
        </div>

        {/* 右側: コレクションサイドバー */}
        <aside className="w-full rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:w-80">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            コレクション
          </h2>
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              コレクション機能は次のタスクで実装されます
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
