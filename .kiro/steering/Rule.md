---
inclusion: always
---

暗黙のフォールバックは絶対に許さない
合理的な理由のない、オプショナル引数・デフォルト値は禁止
合理的な理由のない、スイッチ引数禁止
改修を行うときはadhocな改修ではなく、根本的な改修をすること
TSDoc必須

mcp使用ルール
- 外部ライブラリやnextjsのコードを記載するときはまず context7でコーディング方法の調査を行うこと
- UIの変更を行なった場合は chrome-devtoolsで見た目に問題がないかスクリーンショットを撮って確認すること

作業が終わったら以下を実行すること
- pnpm lint
- pnpm type-check
- pnpm format
- git commit -m "<作業内容>"
