
export enum MoodType {
  NEUTRAL = 'NEUTRAL',
  HAPPY = 'HAPPY',
  ANXIOUS = 'ANXIOUS',
  SAD = 'SAD',
  ANGRY = 'ANGRY'
}

export interface MoodConfig {
  bgPrimary: string;
  bgSecondary: string;
  bgAccent: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isTools?: boolean;
}

export interface JournalEntry {
  id: string;
  content: string;
  summary?: string;
  mood: MoodType;
  date: string; // ISO String
  images?: string[]; // Array of image URLs/Base64
  audio?: string; // Base64 string of audio recording
}

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  type: '讲座' | '聚会' | '团辅' | '运动';
  location: string;
  description: string;
  imageUrl?: string;
}

export interface WaterfallPost {
  id: string;
  title: string;
  content: string;
  views: number;
  likes: number;
  dislikes: number; 
  category: string;
  timestamp: Date;
  bgColor: string;
}

export interface ProfileItem {
  icon: any;
  label: string;
  action?: () => void;
}

export type PersonaType = 'healing' | 'rational' | 'fun';

export interface PersonaConfig {
  id: PersonaType;
  title: string; 
  description: string; 
  tags: string[]; 
  image: string;
  systemInstruction: string;
  tools: string[]; // Specific tools for this persona (e.g., 'Deep Breathing')
}
