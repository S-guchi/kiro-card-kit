import { Attribute, Rarity, VisionAnalysis, CardData } from '../types/card';

// Mock Vision API analysis
export async function mockVisionAnalysis(imageUrl: string): Promise<VisionAnalysis> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    objectType: 'おもちゃのロボット',
    colors: ['赤', '青', '銀'],
    shape: '人型',
    material: 'プラスチック',
    description: '可動式の関節を持つ小型ロボットフィギュア。胸部に透明パーツがあり、LEDが内蔵されている可能性がある。',
  };
}

// Mock evaluator responses
export async function mockEvaluatorResponse(
  evaluatorId: string,
  responsibility: string,
  analysis: VisionAnalysis
): Promise<string[]> {
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const responses: Record<string, string[]> = {
    'evaluator-1': [
      'この形状から考えると...',
      '色の組み合わせが面白いね！',
      'キラキラした名前がいいな〜',
      'これだ！完璧な名前を思いついた！',
    ],
    'evaluator-2': [
      'まずは背景を想像してみよう',
      '戦いの歴史が感じられる...',
      '物語性を重視したいね',
      '心に響くテキストができた！',
    ],
    'evaluator-3': [
      'この材質と色から分析すると...',
      '機械的な要素が強いな',
      'でも有機的な部分もある',
      '属性を確定したぞ！',
    ],
    'evaluator-4': [
      'うーん、美しさを評価中...',
      'この輝きは価値がある',
      'コレクターの目で見ると...',
      'レア度を決定した！',
    ],
  };

  return responses[evaluatorId] || ['考え中...', '分析完了！'];
}

// Generate mock card data
export function generateMockCard(
  imageUrl: string,
  analysis: VisionAnalysis
): CardData {
  const names = [
    'クリムゾンガーディアン',
    'スカイブレイカー',
    'エターナルセンチネル',
    'ネオンナイト',
  ];

  const flavorTexts = [
    '古の戦場より蘇りし守護者。その輝きは希望の証。',
    '星々を貫く閃光となりて、闇を切り裂く。',
    '永遠の番人として、世界の均衡を守り続ける。',
    '都市の灯に導かれし戦士。未来への道を照らす。',
  ];

  const attributes: Attribute[] = ['Fire', 'Nature', 'Machine', 'Cosmic'];
  const rarities: Rarity[] = ['Common', 'Rare', 'Epic', 'Legendary'];

  return {
    id: `card-${Date.now()}`,
    name: names[Math.floor(Math.random() * names.length)],
    attribute: attributes[Math.floor(Math.random() * attributes.length)],
    rarity: rarities[Math.floor(Math.random() * rarities.length)],
    flavorText: flavorTexts[Math.floor(Math.random() * flavorTexts.length)],
    imageUrl,
    createdAt: new Date().toISOString(),
  };
}
