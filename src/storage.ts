import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

const CONVERSATIONS_KEY = "sandip-ko-ai:conversations:v1";
const MEMORY_KEY = "sandip-ko-ai:memory:v1";

export async function loadConversations(): Promise<Conversation[]> {
  const raw = await AsyncStorage.getItem(CONVERSATIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

export async function saveConversations(items: Conversation[]): Promise<void> {
  await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(items));
}

export async function loadMemories(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(MEMORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function saveMemories(items: string[]): Promise<void> {
  await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(items));
}
