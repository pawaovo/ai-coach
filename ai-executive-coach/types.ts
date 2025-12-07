export type Tab = 'tools' | 'chat' | 'contact';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface BusinessTool {
  id: string;
  title: string;
  tag: string;
  description: string;
  iconName: string; // We will map string to Lucide icon component
  color: string;
}