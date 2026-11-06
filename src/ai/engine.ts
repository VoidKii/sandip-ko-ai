export type EngineStatus =
  | { state: "not-installed"; message: string }
  | { state: "ready"; modelName: string }
  | { state: "loading" }
  | { state: "error"; message: string };

export interface LocalAIEngine {
  getStatus(): Promise<EngineStatus>;
  generate(
    prompt: string,
    onToken?: (token: string) => void
  ): Promise<string>;
}

/**
 * Deliberately honest placeholder.
 * The app must never pretend to answer with a local model before one is
 * installed and connected through the native llama.cpp bridge.
 */
export class UnconfiguredLocalEngine implements LocalAIEngine {
  async getStatus(): Promise<EngineStatus> {
    return {
      state: "not-installed",
      message: "No on-device model is installed yet."
    };
  }

  async generate(): Promise<string> {
    throw new Error(
      "The local AI engine is not connected yet. Install a compatible model to start chatting offline."
    );
  }
}

export const localAI: LocalAIEngine = new UnconfiguredLocalEngine();
