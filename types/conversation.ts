import { User } from "./user";

export interface Conversation {
  id: number;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  messages: Message[];
}

export interface Participant {
  id: number;
  conversationId: number;
  userId: number;
  joined_at: string;
  last_read_at: any;
  user: User;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  sender: User;
  content: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
