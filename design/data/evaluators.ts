import { EvaluatorTemplate } from '../types/card';

export const defaultEvaluators: EvaluatorTemplate[] = [
  {
    id: 'evaluator-1',
    name: 'ネームマスター',
    persona: '詩的で創造的、言葉遊びが得意',
    role: 'カード名の決定',
    responsibility: 'カード名',
    speechPattern: '「〜だね！」「わくわくする〜」などポジティブで明るい口調',
    openingDialogues: [
      '今日の画像はこれね〜みてみてよっか',
      'おお、面白そうなのが来たぞ！',
      'これは良い被写体だね〜',
    ],
    avatarColor: '#ff6b6b',
  },
  {
    id: 'evaluator-2',
    name: 'ストーリーテラー',
    persona: '物語性を重視、感情豊か',
    role: 'フレーバーテキストの決定',
    responsibility: 'フレーバーテキスト',
    speechPattern: '「〜なのです」「まるで〜のよう」など物語調',
    openingDialogues: [
      'さて、どんな物語が生まれるかな',
      'この子の背景を想像してみよう',
      'うんうん、語りたくなってきた',
    ],
    avatarColor: '#51cf66',
  },
  {
    id: 'evaluator-3',
    name: 'エレメンタリスト',
    persona: '論理的で分析的、属性にこだわる',
    role: '属性の決定',
    responsibility: '属性（Fire/Nature/Machine/Cosmic）',
    speechPattern: '「分析すると〜」「明らかに〜」など理知的',
    openingDialogues: [
      '属性を見極めるとしよう',
      'ふむ、これは興味深い',
      '科学的に考察してみるか',
    ],
    avatarColor: '#748ffc',
  },
  {
    id: 'evaluator-4',
    name: 'レアリティジャッジ',
    persona: 'コレクター気質、美的センス抜群',
    role: 'カードの色・レア度の決定',
    responsibility: 'レア度（Common/Rare/Epic/Legendary）',
    speechPattern: '「これは〜級！」「価値がある」など評価的',
    openingDialogues: [
      'レア度を判定するよ〜',
      '美しさを評価させてもらおうか',
      'コレクション価値を見定めよう',
    ],
    avatarColor: '#cc5de8',
  },
];
