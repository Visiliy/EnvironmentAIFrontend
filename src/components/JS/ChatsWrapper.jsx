import { useState, useEffect } from "react";
import "../UX/ChatsWrapper.css";
import Cards from "./Cards";
import Chat from "./Chat";

const ChatsWrapper = () => {
    const [feedOpen, setFeedOpen] = useState(false);

    useEffect(() => {
        if (!feedOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [feedOpen]);

    return (
        <>
            <div className="chat-wrapper-container">
                <p>ЛЮДИ, ДАННЫЕ И ТЕХНОЛОГИИ — ЕДИНОЕ ЦЕЛОЕ</p>
                <Chat placeholder={"Задайте любой вопрос о сервисе..."}/>
                <button
                    type="button"
                    className="burger-menu-btn"
                    aria-label="Меню"
                    onClick={() => setFeedOpen(true)}
                >
                    <span />
                    <span />
                    <span />
                </button>
                <div className="main-cards-inline">
                    <Cards />
                </div>
            </div>
            {feedOpen && (
                <div className="feed-overlay">
                    <button
                        type="button"
                        className="feed-overlay-close"
                        aria-label="Закрыть"
                        onClick={() => setFeedOpen(false)}
                    >
                        ×
                    </button>
                    <div className="feed-overlay-scroll">
                        <Cards />
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatsWrapper;
