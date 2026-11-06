import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { localAI } from "../ai/engine";

type Props = { onInstalled: () => void; onClose: () => void };

const colors = {
  paper: "#F5F2EB",
  white: "#FBFAF7",
  ink: "#292A27",
  muted: "#85847D",
  line: "#DEDAD0",
  accent: "#B45B3E"
};

export default function ModelSetup({ onInstalled, onClose }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function install() {
    setDownloading(true);
    setError("");
    try {
      await localAI.installModel(setProgress);
      onInstalled();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>ON-DEVICE MODEL</Text>
      <Text style={styles.title}>Give it a mind.</Text>
      <Text style={styles.description}>
        Download the language model once. After setup, conversations run locally on your phone — no AI account or cloud inference.
      </Text>
      <View style={styles.modelCard}>
        <View style={styles.modelTop}>
          <Text style={styles.modelName}>Qwen2.5 · 1.5B</Text>
          <Text style={styles.modelSize}>~1 GB</Text>
        </View>
        <Text style={styles.modelDetail}>Instruct · Q4_K_M quantization</Text>
        <Text style={styles.modelDetail}>A balanced starting point for mobile devices.</Text>
        {downloading && (
          <View style={styles.progressWrap}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}% downloaded</Text>
          </View>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={install} disabled={downloading} style={[styles.primary, downloading && styles.disabled]}>
        {downloading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Download model</Text>}
      </Pressable>
      <Pressable onPress={onClose} disabled={downloading} style={styles.secondary}>
        <Text style={styles.secondaryText}>Back to chat</Text>
      </Pressable>
      <Text style={styles.footnote}>
        Use Wi-Fi if possible. Keep about 1.5 GB of free storage available. The first download needs internet; chatting afterwards does not.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 42, paddingBottom: 24, backgroundColor: colors.paper },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: "700", letterSpacing: 2 },
  title: { color: colors.ink, fontSize: 35, fontWeight: "500", letterSpacing: -1.5, marginTop: 13 },
  description: { color: "#77766F", fontSize: 14, lineHeight: 22, marginTop: 12, maxWidth: 360 },
  modelCard: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 17, padding: 18, marginTop: 30 },
  modelTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modelName: { color: colors.ink, fontSize: 15, fontWeight: "600" },
  modelSize: { color: colors.accent, fontSize: 12, fontWeight: "600" },
  modelDetail: { color: colors.muted, fontSize: 11, marginTop: 8, lineHeight: 16 },
  progressWrap: { marginTop: 19 },
  track: { height: 5, backgroundColor: colors.line, borderRadius: 3, overflow: "hidden" },
  fill: { height: 5, backgroundColor: colors.accent, borderRadius: 3 },
  progressText: { color: colors.muted, fontSize: 10, marginTop: 8 },
  primary: { minHeight: 52, backgroundColor: colors.ink, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 22 },
  disabled: { opacity: 0.65 },
  primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  secondary: { minHeight: 45, alignItems: "center", justifyContent: "center", marginTop: 7 },
  secondaryText: { color: colors.muted, fontSize: 13 },
  footnote: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: "auto", paddingTop: 22 },
  error: { color: "#A33D2E", fontSize: 12, lineHeight: 18, marginTop: 13 }
});
