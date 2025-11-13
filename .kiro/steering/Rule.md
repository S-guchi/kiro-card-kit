---
inclusion: always
---

暗黙のフォールバックは絶対に許さない
合理的な理由のない、オプショナル引数・デフォルト値は禁止
合理的な理由のない、スイッチ引数禁止
改修を行うときはadhocな改修ではなく、根本的な改修をすること
TSDoc必須

作業が終わったら以下を実行すること
- pnpm lint
- pnpm type-check
- pnpm test:ci
