export const MAIN_CHAT_COOKIE_KEY = "main_system_chat_history";
export const MAIN_CHAT_API_URL = "http://localhost:5071/system/generate_sistem_messages";

export class ChatHistoryStore {
    constructor(cookieKey = MAIN_CHAT_COOKIE_KEY) {
        this.cookieKey = cookieKey;
    }

    read() {
        const all = document.cookie ? document.cookie.split("; ") : [];
        const found = all.find((c) => c.startsWith(`${this.cookieKey}=`));
        if (!found) return [];
        const raw = found.substring(this.cookieKey.length + 1);
        try {
            const decoded = decodeURIComponent(raw);
            const parsed = JSON.parse(decoded);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    write(history) {
        const value = encodeURIComponent(JSON.stringify(history));
        document.cookie = `${this.cookieKey}=${value}; path=/; max-age=3600; SameSite=Lax`;
    }

    clear() {
        document.cookie = `${this.cookieKey}=; path=/; max-age=0; SameSite=Lax`;
    }
}

export class MainChatMessageFactory {
    static buildContext(history) {
        return history
            .map((message) => `${message.type === "user" ? "user" : "ai"}: ${message.text ?? ""}`)
            .join("\n");
    }

    static createUserMessage(text, files) {
        return {
            id: `${Date.now()}-u`,
            type: "user",
            text,
            files: files.map((file) => file.name),
        };
    }

    static createAiMessage() {
        return {
            id: `${Date.now()}-a`,
            type: "ai",
            text: "",
        };
    }
}

export class MainChatApiClient {
    constructor(apiUrl = MAIN_CHAT_API_URL) {
        this.apiUrl = apiUrl;
    }

    async streamMessage({ text, context, files, onChunk }) {
        const formData = new FormData();
        formData.append("message", text);
        formData.append("context", context);
        files.forEach((file) => formData.append("files", file));

        const response = await fetch(this.apiUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok || !response.body) {
            throw new Error("Failed to fetch main chat stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiText = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            aiText += decoder.decode(value, { stream: true });
            onChunk(aiText);
        }

        return aiText;
    }
}
