import "../UX/Chat.css";
import { useRef, useEffect, useCallback } from "react";

const Chat = () => {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [adjustHeight]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
        }
        setTimeout(adjustHeight, 0);
    };

    return (
        <div className="chat-wrapper">
            <textarea 
                ref={textareaRef}
                placeholder="Задайте любой вопрос о сервисе..."
                rows={1}
                onInput={adjustHeight}
                onKeyDown={handleKeyDown}
            />
            <div className="options-btn">
                <button className="options">+</button>
                <button className="send">↑</button>
            </div>
        </div>
    );
};

export default Chat;