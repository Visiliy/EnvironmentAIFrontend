import Cap from "../components/JS/Cap";
import Chat from "../components/JS/Chat";
import "./Workspace.css";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Workspace = () => {
    const [activeTab, setActiveTab] = useState("chats");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [currentChatId, setCurrentChatId] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (!userData) {
            window.location.href = '/';
            return;
        }
        
        const parsed = JSON.parse(userData);
        if (!parsed.verified) {
            window.location.href = '/';
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const createInitialChat = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5071/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chat_name: 'New Chat' })
            });
            const data = await response.json();
            if (data.success) {
                setCurrentChatId(data.chat.id);
            }
        };
        createInitialChat();
    }, []);

    const handleSendMessage = async (message, files, chatId) => {
        if (!message.trim() && files.length === 0) return;

        const userMessage = {
            id: Date.now(),
            text: message,
            type: 'user',
            files: files.map(f => f.name)
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5071/workspace', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                user_query: message,
                chat_id: currentChatId
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            
            try {
                const jsonEnd = chunk.lastIndexOf('}');
                if (jsonEnd !== -1 && jsonEnd === chunk.length - 1) {
                    const jsonStr = chunk.substring(chunk.lastIndexOf('{'), jsonEnd + 1);
                    const metadata = JSON.parse(jsonStr);
                    if (metadata.chat_id) {
                        setCurrentChatId(metadata.chat_id);
                    }
                } else {
                    aiResponse += chunk;
                }
            } catch {
                aiResponse += chunk;
            }
            
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.type === 'ai') {
                    return [...prev.slice(0, -1), { ...lastMessage, text: aiResponse }];
                } else {
                    return [...prev, { id: Date.now(), text: aiResponse, type: 'ai' }];
                }
            });
        }
        
        setIsLoading(false);
    };

    return (
        <>
            <div className="main-workspace workspace-page">
                <Cap />
                <div className="workspace">
                    <div className="left-workspace">
                        <div className="btn-zone">
                            <button 
                                className={`tab-btn ${activeTab === "chats" ? "active" : ""}`}
                                onClick={() => setActiveTab("chats")}
                            >
                                Чаты
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === "files" ? "active" : ""}`}
                                onClick={() => setActiveTab("files")}
                            >
                                Файлы
                            </button>
                        </div>
                        <div className="chat-and-files-zone">
                            <img 
                                src="/src/assets/team-image.png" 
                                alt="Team" 
                                className="team-image"
                            />
                        </div>
                    </div>
                    <div className="right-workspace">
                        <div className="messages-zone">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message ${msg.type}`}>
                                    <div className="message-content">
                                        {msg.files && msg.files.length > 0 && (
                                            <div className="message-files">
                                                {msg.files.map((file, idx) => (
                                                    <span key={idx} className="message-file">{file}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="message-text markdown-body">
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: ({node, ...props}) => (
                                                        <a {...props} target="_blank" rel="noopener noreferrer" />
                                                    ),
                                                    code: ({node, inline, ...props}) => (
                                                        inline ? 
                                                            <code {...props} /> : 
                                                            <pre><code {...props} /></pre>
                                                    )
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="message ai">
                                    <div className="message-content">
                                        <div className="typing-indicator">...</div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="chat-zone">
                            <Chat 
                                placeholder={"Задайте любой вопрос..."}
                                onSendMessage={handleSendMessage}
                                currentChatId={currentChatId}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Workspace;