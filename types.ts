export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string;
  timestamp: number;
  hasAnimated?: boolean;
}

export interface ChatSession {
  id: string;
  timestamp: number;
  lastActive: number;
  difficulty: Difficulty;
  messages: Message[];
  preview: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export enum ViewState {
  LANDING = 'LANDING',
  CHAT = 'CHAT',
}

export type Difficulty = 'BEGINNER' | 'STANDARD' | 'WHITE_ROOM';