export type Attribute = 'Fire' | 'Nature' | 'Machine' | 'Cosmic';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface CardData {
  id: string;
  name: string;
  attribute: Attribute;
  rarity: Rarity;
  flavorText: string;
  imageUrl: string;
  createdAt: string;
}

export interface EvaluatorTemplate {
  id: string;
  name: string;
  persona: string;
  role: string;
  responsibility: string;
  speechPattern: string;
  openingDialogues: string[];
  imageUrl?: string;
  avatarColor: string;
}

export interface DiscussionMessage {
  evaluatorId: string;
  evaluatorName: string;
  message: string;
  timestamp: number;
}

export interface VisionAnalysis {
  objectType: string;
  colors: string[];
  shape: string;
  material: string;
  description: string;
}
