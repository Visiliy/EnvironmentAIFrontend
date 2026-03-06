import Cap from "../components/JS/Cap";
import Chat from "../components/JS/Chat";
import "./Workspace.css";
import { useState } from "react";

const Workspace = () => {
    const [activeTab, setActiveTab] = useState("chats");

    return (
        <>
            <div className="main-workspace">
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
                        </div>
                        <div className="chat-zone">
                            <Chat />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Workspace;