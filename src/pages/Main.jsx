import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Cap from "../components/JS/Cap";
import Cards from "../components/JS/Cards";
import Chat from "../components/JS/Chat";
import { ChatHistoryStore, MainChatApiClient, MainChatMessageFactory } from "../services/MainChatService";
import "./Main.css";

const markdownComponents = {
    a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
    code: ({ inline, ...props }) => (inline ? <code {...props} /> : <pre><code {...props} /></pre>),
};

const historyStore = new ChatHistoryStore();
const apiClient = new MainChatApiClient();

const Main = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFirstRequest, setHasFirstRequest] = useState(false);
    const pageRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        historyStore.clear();
    }, []);

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages, isLoading]);

    useEffect(() => {
        const pageEl = pageRef.current;
        const inputEl = inputRef.current;
        if (!pageEl || !inputEl) return;
        const update = () => {
            const h = Math.ceil(inputEl.getBoundingClientRect().height);
            pageEl.style.setProperty("--main-chat-height", `${h}px`);
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(inputEl);
        window.addEventListener("resize", update);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", update);
        };
    }, []);

    const handleSystemSend = async (message, files) => {
        if (isLoading) return;
        const text = (message ?? "").trim();
        const safeFiles = Array.isArray(files) ? files : [];
        if (!text && safeFiles.length === 0) return;

        const historyBefore = historyStore.read();
        const context = MainChatMessageFactory.buildContext(historyBefore);
        const userMessage = MainChatMessageFactory.createUserMessage(text, safeFiles);
        const aiMessage = MainChatMessageFactory.createAiMessage();
        const aiMessageId = aiMessage.id;

        setHasFirstRequest(true);
        setMessages((prev) => [...prev, userMessage, aiMessage]);
        setIsLoading(true);

        historyStore.write([...historyBefore, userMessage]);

        try {
            const aiText = await apiClient.streamMessage({
                text,
                context,
                files: safeFiles,
                onChunk: (chunkText) => {
                    setMessages((prev) => prev.map((m) => (m.id === aiMessageId ? { ...m, text: chunkText } : m)));
                },
            });
            historyStore.write([...historyBefore, userMessage, { ...aiMessage, text: aiText }]);
        } catch (error) {
            console.error("Main chat send failed:", error);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === aiMessageId
                        ? { ...m, text: `Ошибка отправки на сервер: ${error?.message ?? "Неизвестная ошибка"}` }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={pageRef} className={`main-page ${hasFirstRequest ? "after-first" : "before-first"}`}>
            <Cap />
            {!hasFirstRequest && (
                <div className="main-cards">
                    <Cards />
                </div>
            )}
            <div className="main-history">
                <div className="main-history-inner">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`main-message ${msg.type}`}>
                            <div className="main-message-text markdown-body">
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
                <div ref={inputRef}>
                    <Chat placeholder={"Задайте любой вопрос..."} onSendMessage={handleSystemSend} currentChatId={null} />
                </div>
            </div>
        </div>
    );
};

export default Main;