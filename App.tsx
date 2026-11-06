import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { localAI, EngineStatus } from "./src/ai/engine";
import {
  ChatMessage,
  Conversation,
  loadConversations,
  saveConversations
} from "./src/storage";

const palette = {
  paper: "#F5F2EB",
  panel: "#EEEAE1",
  white: "#FBFAF7",
  ink: "#292A27",
  muted: "#85847D",
  line: "#DEDAD0",
  accent: "#B45B3E",
  user: "#EAE6DC"
};

const makeId = () => Math.random().toString(36).slice(2, 10);

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [engineStatus, setEngineStatus] = useState<EngineStatus>({ state: "loading" });
  const [booting, setBooting] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadConversations(), localAI.getStatus()])
      .then(([saved, status]) => {
        if (!mounted) return;
        setConversations(saved);
        setActiveId(saved[0]?.id ?? null);
        setEngineStatus(status);
      })
      .catch(() => {
        if (mounted) setEngineStatus({
          state: "error",
          message: "Couldn't load local app data."
        });
      })
      .finally(() => mounted && setBooting(false));
    return () => { mounted = false; };
  }, []);

  const active = useMemo(
    () => conversations.find(item => item.id === activeId) ?? null,
    [conversations, activeId]
  );

  async function persist(next: Conversation[]) {
    setConversations(next);
    await saveConversations(next);
  }

  function newChat() {
    setActiveId(null);
    setShowHistory(false);
  }

  async function sendMessage() {
    const text = draft.trim();
    if (!text || sending) return;

    const now = Date.now();
    const message: ChatMessage = {
      id: makeId(),
      role: "user",
      text,
      createdAt: now
    };
    const conversation: Conversation = active
      ? { ...active, updatedAt: now, messages: [...active.messages, message] }
      : {
          id: makeId(),
          title: text.length > 34 ? text.slice(0, 34).trimEnd() + "…" : text,
          updatedAt: now,
          messages: [message]
        };

    const next = [conversation, ...conversations.filter(item => item.id !== conversation.id)];
    setActiveId(conversation.id);
    setDraft("");
    await persist(next);

    setSending(true);
    try {
      const answer = await localAI.generate(text);
      const updated = {
        ...conversation,
        updatedAt: Date.now(),
        messages: [...conversation.messages, {
          id: makeId(),
          role: "assistant" as const,
          text: answer,
          createdAt: Date.now()
        }]
      };
      await persist([updated, ...next.filter(item => item.id !== updated.id)]);
    } catch (error) {
      // The user message remains saved. No fabricated assistant response.
      setEngineStatus({
        state: "not-installed",
        message: error instanceof Error ? error.message : "Local model unavailable."
      });
    } finally {
      setSending(false);
    }
  }

  function selectChat(id: string) {
    setActiveId(id);
    setShowHistory(false);
  }

  if (booting) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={palette.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.paper} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.header}>
          <Pressable onPress={() => setShowHistory(value => !value)} style={styles.headerButton}>
            <Text style={styles.menuGlyph}>☰</Text>
          </Pressable>
          <View style={styles.brand}>
            <Text style={styles.brandName}>sandip ko AI</Text>
            <Text style={styles.brandMeta}>PERSONAL · ON DEVICE</Text>
          </View>
          <Pressable onPress={newChat} style={styles.headerButton}>
            <Text style={styles.plus}>＋</Text>
          </Pressable>
        </View>

        {showHistory ? (
          <View style={styles.history}>
            <View style={styles.historyTop}>
              <Text style={styles.sectionLabel}>YOUR CONVERSATIONS</Text>
              <Pressable onPress={() => setShowHistory(false)}>
                <Text style={styles.close}>Done</Text>
              </Pressable>
            </View>
            <Pressable onPress={newChat} style={styles.newChatRow}>
              <Text style={styles.newChatText}>＋  New conversation</Text>
            </Pressable>
            <ScrollView>
              {conversations.map(item => (
                <Pressable key={item.id} onPress={() => selectChat(item.id)} style={styles.historyItem}>
                  <Text numberOfLines={1} style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
                </Pressable>
              ))}
              {conversations.length === 0 && (
                <Text style={styles.emptyHistory}>Your conversations will appear here.</Text>
              )}
            </ScrollView>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={active?.messages.length ? styles.messageList : styles.welcome}
              keyboardShouldPersistTaps="handled"
            >
              {active?.messages.length ? (
                active.messages.map(message => (
                  <View key={message.id} style={[
                    styles.message,
                    message.role === "user" ? styles.userMessage : styles.assistantMessage
                  ]}>
                    {message.role === "assistant" && <Text style={styles.assistantLabel}>SANDIP KO AI</Text>}
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.welcomeInner}>
                  <View style={styles.mark}><Text style={styles.markText}>s.</Text></View>
                  <Text style={styles.eyebrow}>A QUIETER KIND OF AI</Text>
                  <Text style={styles.headline}>What’s on your{ "\n" }mind today?</Text>
                  <Text style={styles.subhead}>A private space to think, make, learn and figure things out.</Text>
                  <View style={styles.suggestions}>
                    {["Help me think through an idea", "Explain something simply", "Let's plan a project"].map(label => (
                      <Pressable key={label} onPress={() => setDraft(label)} style={styles.suggestion}>
                        <Text style={styles.suggestionText}>{label}</Text>
                        <Text style={styles.suggestionArrow}>↗</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
              {sending && <Text style={styles.thinking}>Thinking…</Text>}
            </ScrollView>

            <View style={styles.composerArea}>
              {engineStatus.state !== "ready" && (
                <View style={styles.modelNotice}>
                  <View style={styles.noticeDot} />
                  <Text style={styles.noticeText}>Offline model setup is being prepared</Text>
                </View>
              )}
              <View style={styles.composer}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Message sandip ko AI…"
                  placeholderTextColor={palette.muted}
                  multiline
                  style={styles.input}
                  returnKeyType="default"
                />
                <Pressable
                  onPress={sendMessage}
                  disabled={!draft.trim() || sending}
                  style={[styles.sendButton, (!draft.trim() || sending) && styles.sendDisabled]}
                >
                  <Text style={styles.sendGlyph}>↑</Text>
                </Pressable>
              </View>
              <Text style={styles.footerNote}>Your chats stay on this device.</Text>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: palette.paper },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.paper },
  header: {
    height: 66, paddingHorizontal: 18, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line
  },
  headerButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  menuGlyph: { fontSize: 20, color: palette.ink },
  plus: { fontSize: 27, color: palette.ink, fontWeight: "300" },
  brand: { alignItems: "center", gap: 3 },
  brandName: { color: palette.ink, fontSize: 17, fontWeight: "600", letterSpacing: -0.5 },
  brandMeta: { color: palette.muted, fontSize: 8, letterSpacing: 1.7, fontWeight: "600" },
  welcome: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 27, paddingBottom: 30 },
  welcomeInner: { width: "100%", maxWidth: 470, alignSelf: "center" },
  mark: { width: 43, height: 43, borderRadius: 15, backgroundColor: palette.ink, alignItems: "center", justifyContent: "center", marginBottom: 31 },
  markText: { color: palette.paper, fontSize: 22, fontWeight: "600", fontStyle: "italic" },
  eyebrow: { color: palette.accent, fontSize: 9, fontWeight: "700", letterSpacing: 2.1, marginBottom: 14 },
  headline: { color: palette.ink, fontSize: 38, lineHeight: 43, letterSpacing: -1.8, fontWeight: "500" },
  subhead: { color: "#77766F", fontSize: 14, lineHeight: 22, marginTop: 15, maxWidth: 290 },
  suggestions: { marginTop: 38, gap: 9 },
  suggestion: { borderWidth: 1, borderColor: palette.line, borderRadius: 13, paddingHorizontal: 15, paddingVertical: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(251,250,247,0.55)" },
  suggestionText: { color: "#55554F", fontSize: 13 },
  suggestionArrow: { color: palette.muted, fontSize: 15 },
  messageList: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 25, gap: 22 },
  message: { maxWidth: "91%", borderRadius: 17, paddingHorizontal: 16, paddingVertical: 13 },
  userMessage: { alignSelf: "flex-end", backgroundColor: palette.user, borderBottomRightRadius: 5 },
  assistantMessage: { alignSelf: "flex-start", backgroundColor: "transparent", paddingHorizontal: 2, maxWidth: "100%" },
  assistantLabel: { color: palette.accent, fontSize: 9, letterSpacing: 1.5, fontWeight: "700", marginBottom: 8 },
  messageText: { color: palette.ink, fontSize: 15, lineHeight: 24 },
  thinking: { color: palette.muted, fontSize: 13, paddingHorizontal: 4 },
  composerArea: { paddingHorizontal: 15, paddingTop: 8, paddingBottom: Platform.OS === "ios" ? 8 : 12 },
  modelNotice: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 4, paddingBottom: 9 },
  noticeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.accent },
  noticeText: { color: palette.muted, fontSize: 10 },
  composer: { minHeight: 58, borderWidth: 1, borderColor: "#D8D3C8", borderRadius: 19, backgroundColor: palette.white, flexDirection: "row", alignItems: "flex-end", padding: 8, shadowColor: "#302D25", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  input: { flex: 1, maxHeight: 120, minHeight: 38, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 8, color: palette.ink, fontSize: 14, lineHeight: 20 },
  sendButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: palette.ink, alignItems: "center", justifyContent: "center" },
  sendDisabled: { backgroundColor: "#BDBAB1" },
  sendGlyph: { color: "#FFFFFF", fontSize: 22, lineHeight: 25, fontWeight: "500" },
  footerNote: { textAlign: "center", color: "#9A988F", fontSize: 9, marginTop: 9, letterSpacing: 0.2 },
  history: { flex: 1, padding: 20 },
  historyTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  sectionLabel: { color: palette.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: "700" },
  close: { color: palette.accent, fontSize: 13 },
  newChatRow: { padding: 15, borderWidth: 1, borderColor: palette.line, borderRadius: 12, marginBottom: 16 },
  newChatText: { color: palette.ink, fontSize: 14, fontWeight: "500" },
  historyItem: { paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  historyTitle: { color: palette.ink, fontSize: 14 },
  historyDate: { color: palette.muted, fontSize: 10, marginTop: 5 },
  emptyHistory: { color: palette.muted, fontSize: 13, lineHeight: 20, paddingTop: 12 }
});