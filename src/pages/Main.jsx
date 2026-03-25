import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Cap from "../components/JS/Cap";
import Cards from "../components/JS/Cards";
import Chat from "../components/JS/Chat";
import "./Main.css";

const COOKIE_KEY = "main_system_chat_history";
const API_URL = "http://localhost:5071/system/generate_sistem_messages";

const readHistoryFromCookie = () => {
    const all = document.cookie ? document.cookie.split("; ") : [];
    const found = all.find((c) => c.startsWith(`${COOKIE_KEY}=`));
    if (!found) return [];
    const raw = found.substring(COOKIE_KEY.length + 1);
    try {
        const decoded = decodeURIComponent(raw);
        const parsed = JSON.parse(decoded);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch {
        return [];
    }
};

const writeHistoryToCookie = (history) => {
    const value = encodeURIComponent(JSON.stringify(history));
    document.cookie = `${COOKIE_KEY}=${value}; path=/; max-age=3600; SameSite=Lax`;
};

const clearHistoryCookie = () => {
    document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
};

const Main = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFirstRequest, setHasFirstRequest] = useState(false);
    const historyRef = useRef(null);

    useEffect(() => {
        clearHistoryCookie();
    }, []);

    useEffect(() => {
        const el = historyRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages, isLoading]);

    const markdownComponents = useMemo(
        () => ({
            a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
            code: ({ inline, ...props }) =>
                inline ? <code {...props} /> : <pre><code {...props} /></pre>,
        }),
        []
    );

    const buildContext = (history) => {
        return history
            .map((m) => {
                const role = m.type === "user" ? "user" : "ai";
                return `${role}: ${m.text ?? ""}`;
            })
            .join("\n");
    };

    const handleSystemSend = async (message, files) => {
        if (isLoading) return;
        const text = (message ?? "").trim();
        const safeFiles = Array.isArray(files) ? files : [];
        if (!text && safeFiles.length === 0) return;

        const historyBefore = readHistoryFromCookie();
        const context = buildContext(historyBefore);
        const userFiles = safeFiles.map((f) => f.name);

        const userMessage = {
            id: `${Date.now()}-u`,
            type: "user",
            text: text,
            files: userFiles,
        };

        const aiMessageId = `${Date.now()}-a`;
        const aiMessage = {
            id: aiMessageId,
            type: "ai",
            text: "",
        };

        setHasFirstRequest(true);
        setMessages((prev) => [...prev, userMessage, aiMessage]);
        setIsLoading(true);

        writeHistoryToCookie([...historyBefore, userMessage]);

        try {
            const formData = new FormData();
            formData.append("message", text);
            formData.append("context", context);
            safeFiles.forEach((f) => formData.append("files", f));

            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });

            if (!response.ok || !response.body) {
                setIsLoading(false);
                setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                aiText += chunk;
                setMessages((prev) => prev.map((m) => (m.id === aiMessageId ? { ...m, text: aiText } : m)));
            }

            setIsLoading(false);
            writeHistoryToCookie([...historyBefore, userMessage, { ...aiMessage, text: aiText }]);
        } catch {
            setIsLoading(false);
            setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
        }
    };

    return (
        <div className={`main-page ${hasFirstRequest ? "after-first" : "before-first"}`}>
            <Cap />
            {!hasFirstRequest && (
                <div className="main-cards">
                    <Cards />
                </div>
            )}
            <div className="main-history" ref={historyRef}>
                <div className="main-history-inner">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`main-message ${msg.type}`}
                            style={
                                msg.type === "user"
                                    ? {
                                          alignSelf: "flex-end",
                                          display: "flex",
                                          justifyContent: "flex-end",
                                      }
                                    : undefined
                            }
                        >
                            <div
                                className="main-message-text markdown-body"
                                style={
                                    msg.type === "user"
                                        ? {
                                            display: "inline-block",
                                            maxWidth: "70%",
                                            textAlign: "right",
                                            overflowWrap: "anywhere",
                                        }
                                        : undefined
                                }
                            >
                                {msg.type === "ai" && !msg.text && isLoading ? (
                                    <div className="main-typing-indicator">...</div>
                                ) : (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                        {msg.text}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={`main-input-container ${hasFirstRequest ? "docked" : ""}`}>
                <Chat placeholder={"Задайте любой вопрос..."} onSendMessage={handleSystemSend} currentChatId={null} />
            </div>
        </div>
    );
};

export default Main;