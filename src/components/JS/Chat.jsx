import "../UX/Chat.css";
import { useRef, useEffect, useCallback, useState } from "react";

const ALLOWED_FILE_TYPES = [".txt", ".docx", ".pdf"];
const MAX_FILES = 10;
const MAX_FILE_BASENAME = 20;

const isAllowedFile = (file) => {
    const fallbackExt = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
    const fileType = (file.type || fallbackExt).toLowerCase();
    const fileName = file.name.toLowerCase();
    return ALLOWED_FILE_TYPES.some((type) => fileType.includes(type) || fileName.endsWith(type));
};

const getUniqueFiles = (currentFiles, selectedFiles) => {
    const seen = new Set(currentFiles.map((file) => `${file.name}-${file.size}`));
    const merged = [...currentFiles];
    for (const file of selectedFiles) {
        const key = `${file.name}-${file.size}`;
        if (!seen.has(key)) {
            seen.add(key);
            merged.push(file);
        }
        if (merged.length >= MAX_FILES) break;
    }
    return merged;
};

const truncateFileName = (fileName) => {
    const lastDotIndex = fileName.lastIndexOf(".");
    const name = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";
    if (name.length <= MAX_FILE_BASENAME) return fileName;
    return `${name.substring(0, MAX_FILE_BASENAME)}...${extension}`;
};

const Chat = ({ placeholder, onSendMessage, currentChatId }) => {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState("");

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
            handleSend();
        }
        setTimeout(adjustHeight, 0);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        const validFiles = selectedFiles.filter(isAllowedFile);
        setFiles((prev) => getUniqueFiles(prev, validFiles));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = () => {
        if (message.trim() || files.length > 0) {
            onSendMessage(message, files, currentChatId);
            setMessage("");
            setFiles([]);
            if (textareaRef.current) {
                textareaRef.current.value = "";
                adjustHeight();
            }
        }
    };

    return (
        <div className="chat-wrapper">
            <textarea 
                ref={textareaRef}
                placeholder={placeholder}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onInput={adjustHeight}
                onKeyDown={handleKeyDown}
            />
            <div className="options-btn">
                <button className="options" onClick={() => fileInputRef.current.click()}>+</button>
                <button className="send" onClick={handleSend}>↑</button>
            </div>
            <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                onChange={handleFileSelect}
                accept=".txt,.doc,.docx,.pdf"
            />
            {files.length > 0 && (
                <div className="files-container">
                    {files.map((file, index) => (
                        <div key={index} className="file-chip" onClick={() => removeFile(index)}>
                            <span className="file-name">{truncateFileName(file.name)}</span>
                            <span className="file-remove">×</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Chat;